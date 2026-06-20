import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { ParserError } from "../../domain/errors.js";
import type { ParserSourceInput } from "../../domain/types.js";
import { mediaTypeFromRaw, needsTextContent, type ResolvedParserInput } from "./shared.js";

const MAX_URL_BYTES = 25 * 1024 * 1024;
const URL_TIMEOUT_MS = 30_000;

interface StaticUrlResponse {
  status: number;
  headers: { get(name: string): string | null };
  body: Uint8Array;
}

type HostResolver = (hostname: string) => Promise<readonly string[]>;
type StaticUrlRequester = (url: URL, address: string, publicUrl: string) => Promise<StaticUrlResponse>;

let resolveHostAddresses: HostResolver = async (hostname) =>
  (await lookup(hostname, { all: true })).map((entry) => entry.address);
let requestStaticUrl: StaticUrlRequester = requestWithValidatedAddress;

export function setUrlHostResolverForTesting(resolver: HostResolver): () => void {
  const previous = resolveHostAddresses;
  resolveHostAddresses = resolver;
  return () => {
    resolveHostAddresses = previous;
  };
}

export function setUrlRequesterForTesting(requester: StaticUrlRequester): () => void {
  const previous = requestStaticUrl;
  requestStaticUrl = requester;
  return () => {
    requestStaticUrl = previous;
  };
}

export async function fetchUrlInput(input: Extract<ParserSourceInput, { kind: "url" }>): Promise<ResolvedParserInput> {
  const url = parseStaticHttpUrl(input.url);
  const publicUrl = sanitizeUrl(url);
  const addresses = await publicAddresses(url, publicUrl);
  const response = await readStaticUrl(new URL(url), addresses[0], publicUrl);

  if (response.status >= 300 && response.status < 400) {
    throw new ParserError("FETCH_FAILED", "URL redirects are not followed by the default static fetcher.", {
      url: publicUrl,
    });
  }
  if (response.status < 200 || response.status >= 300) {
    throw new ParserError("FETCH_FAILED", `URL fetch failed with HTTP ${response.status}.`, { url: publicUrl });
  }

  const contentType = response.headers.get("content-type") ?? input.contentType ?? undefined;
  if (response.body.length > MAX_URL_BYTES) {
    throw new ParserError("PARSE_FAILED", `URL response exceeds ${MAX_URL_BYTES} bytes.`, {
      url: publicUrl,
      ...(contentType === undefined ? {} : { contentType }),
    });
  }
  const media = mediaTypeFromRaw(contentType);
  return {
    kind: "url",
    url: publicUrl,
    content: needsTextContent(media, url) ? decodeText(response.body, contentType) : "",
    bytes: response.body,
    ...(contentType === undefined ? {} : { contentType }),
    ...(input.title === undefined ? {} : { title: input.title }),
    metadata: input.metadata ?? {},
  };
}

function parseStaticHttpUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ParserError("UNSUPPORTED_SOURCE", "URL source must be an absolute HTTP(S) URL.", { url: value });
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ParserError("UNSUPPORTED_SOURCE", "URL source must use HTTP or HTTPS.", { url: value });
  }
  if (!isPublicHostname(url.hostname)) {
    throw new ParserError("UNSUPPORTED_SOURCE", "URL source host must be public.", { url: sanitizeUrl(value) });
  }

  return url.toString();
}

async function publicAddresses(value: string, publicUrl: string): Promise<readonly [string, ...string[]]> {
  const url = new URL(value);
  const hostname = normalizeHostname(url.hostname);
  if (isIP(hostname) !== 0) {
    return [hostname];
  }
  let addresses: readonly string[];
  try {
    addresses = await resolveHostAddresses(hostname);
  } catch (error) {
    throw new ParserError(
      "FETCH_FAILED",
      `URL host resolution failed: ${error instanceof Error ? error.message : String(error)}`,
      { url: publicUrl },
    );
  }
  if (addresses.length === 0 || addresses.some((address) => !isPublicHostname(address))) {
    throw new ParserError("UNSUPPORTED_SOURCE", "URL source host must resolve to public addresses.", {
      url: publicUrl,
    });
  }
  return addresses as readonly [string, ...string[]];
}

async function readStaticUrl(url: URL, address: string, publicUrl: string): Promise<StaticUrlResponse> {
  try {
    return await requestStaticUrl(url, address, publicUrl);
  } catch (error) {
    if (error instanceof ParserError) {
      throw error;
    }
    throw new ParserError(
      "FETCH_FAILED",
      `URL fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      { url: publicUrl },
    );
  }
}

async function requestWithValidatedAddress(url: URL, address: string, publicUrl: string): Promise<StaticUrlResponse> {
  const request = url.protocol === "https:" ? httpsRequest : httpRequest;
  return await new Promise<StaticUrlResponse>((resolve, reject) => {
    let deadline: ReturnType<typeof setTimeout>;
    const req = request(
      {
        protocol: url.protocol,
        hostname: isIP(normalizeHostname(url.hostname)) === 0 ? url.hostname : normalizeHostname(url.hostname),
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: { "user-agent": "@llm-wiki/sdk", accept: "*/*" },
        lookup: (_hostname, options, callback) => {
          const family = isIP(address) as 4 | 6;
          if (typeof options === "object" && options !== null && "all" in options && options.all === true) {
            callback(null, [{ address, family }] as never, family);
            return;
          }
          callback(null, address, family);
        },
      },
      (response) => {
        const finish = <T>(fn: (value: T) => void, value: T): void => {
          clearTimeout(deadline);
          fn(value);
        };
        const status = response.statusCode ?? 0;
        const contentLength = response.headers["content-length"];
        if (typeof contentLength === "string" && Number.parseInt(contentLength, 10) > MAX_URL_BYTES) {
          response.destroy();
          finish(
            reject,
            new ParserError("PARSE_FAILED", `URL response exceeds ${MAX_URL_BYTES} bytes.`, {
              url: publicUrl,
              ...contentTypeSource(response),
            }),
          );
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_URL_BYTES) {
            response.destroy(
              new ParserError("PARSE_FAILED", `URL response exceeds ${MAX_URL_BYTES} bytes.`, {
                url: publicUrl,
                ...contentTypeSource(response),
              }),
            );
            return;
          }
          chunks.push(chunk);
        });
        response.on("error", (error) => finish(reject, error));
        response.on("end", () => {
          finish(resolve, {
            status,
            headers: { get: (name) => headerValue(response.headers[name.toLowerCase()]) },
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    deadline = setTimeout(() => {
      req.destroy(
        new ParserError("FETCH_FAILED", `URL fetch timed out after ${URL_TIMEOUT_MS} ms.`, { url: publicUrl }),
      );
    }, URL_TIMEOUT_MS);
    req.setTimeout(URL_TIMEOUT_MS, () => {
      req.destroy(new ParserError("FETCH_FAILED", `URL fetch was idle for ${URL_TIMEOUT_MS} ms.`, { url: publicUrl }));
    });
    req.on("error", (error) => {
      clearTimeout(deadline);
      reject(
        error instanceof ParserError
          ? error
          : new ParserError("FETCH_FAILED", `URL fetch failed: ${error.message}`, { url: publicUrl }),
      );
    });
    req.end();
  });
}

function contentTypeSource(response: { headers: Record<string, string | string[] | number | undefined> }): {
  contentType?: string;
} {
  const contentType = headerValue(response.headers["content-type"]);
  return contentType === null ? {} : { contentType };
}

function headerValue(value: string | string[] | number | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function decodeText(bytes: Uint8Array, contentType: string | undefined): string {
  const charset =
    contentType
      ?.match(/;\s*charset=([^;]+)/i)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, "") ?? "utf-8";
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch (error) {
    throw new ParserError("PARSE_FAILED", `Unsupported response charset: ${charset}.`);
  }
}

function sanitizeUrl(value: string): string {
  const url = new URL(value);
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function ipv4MappedAddress(address: string): string | null {
  if (address.startsWith("::ffff:")) {
    return ipv4MappedSuffix(address.slice("::ffff:".length));
  }

  const hextets = address.split(":");
  if (hextets.length === 7 && hextets.slice(0, 5).every(isZeroHextet) && hextets[5]?.toLowerCase() === "ffff") {
    return ipv4MappedSuffix(hextets[6] ?? "");
  }
  if (hextets.length === 8 && hextets.slice(0, 5).every(isZeroHextet) && hextets[5]?.toLowerCase() === "ffff") {
    return ipv4MappedSuffix(`${hextets[6]}:${hextets[7]}`);
  }
  return null;
}

function ipv4MappedSuffix(suffix: string): string | null {
  if (isIP(suffix) === 4) {
    return suffix;
  }
  const hextets = suffix.split(":");
  if (hextets.length !== 2) {
    return null;
  }
  const high = Number.parseInt(hextets[0] ?? "", 16);
  const low = Number.parseInt(hextets[1] ?? "", 16);
  if (!Number.isInteger(high) || !Number.isInteger(low) || high < 0 || high > 0xffff || low < 0 || low > 0xffff) {
    return null;
  }
  return `${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`;
}

function isZeroHextet(value: string): boolean {
  return /^[0]+$/.test(value);
}

function normalizeHostname(hostname: string): string {
  const normalized = hostname.toLowerCase();
  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    const literal = normalized.slice(1, -1);
    return isIP(literal) === 6 ? literal : normalized;
  }
  return normalized;
}

function isPublicHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (normalized === "" || normalized.includes("[") || normalized.includes("]")) {
    return false;
  }
  if (normalized === "localhost" || normalized.endsWith(".localhost")) {
    return false;
  }
  if (normalized.endsWith(".local")) {
    return false;
  }
  const mapped = ipv4MappedAddress(normalized);
  if (mapped !== null) {
    return isPublicHostname(mapped);
  }
  const ipVersion = isIP(normalized);
  if (ipVersion === 4) {
    const parts = normalized.split(".").map((part) => Number.parseInt(part, 10));
    const [a, b, c, d] = parts;
    return (
      parts.length === 4 &&
      parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) &&
      !(
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b !== undefined && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b !== undefined && b >= 16 && b <= 31) ||
        (a === 192 && b === 0 && c === 0) ||
        (a === 192 && b === 0 && c === 2) ||
        (a === 192 && b === 88 && c === 99) ||
        (a === 192 && b === 168) ||
        (a === 198 && b !== undefined && b >= 18 && b <= 19) ||
        (a === 198 && b === 51 && c === 100) ||
        (a === 203 && b === 0 && c === 113) ||
        (a !== undefined && a >= 224) ||
        (a === 255 && b === 255 && c === 255 && d === 255)
      )
    );
  }
  if (ipVersion === 6) {
    const firstHextet = Number.parseInt(normalized.split(":")[0] ?? "", 16);
    return !(
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("ff") ||
      (firstHextet >= 0xfe80 && firstHextet <= 0xfebf)
    );
  }
  return true;
}
