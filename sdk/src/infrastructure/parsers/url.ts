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
  validateFetchResponse(response, publicUrl);
  return buildUrlInput(input, url, publicUrl, response);
}

function validateFetchResponse(response: StaticUrlResponse, publicUrl: string): void {
  if (response.status >= 300 && response.status < 400) {
    throw new ParserError("FETCH_FAILED", "URL redirects are not followed by the default static fetcher.", {
      url: publicUrl,
    });
  }
  if (response.status < 200 || response.status >= 300) {
    throw new ParserError("FETCH_FAILED", `URL fetch failed with HTTP ${String(response.status)}.`, { url: publicUrl });
  }
  const contentType = response.headers.get("content-type") ?? undefined;
  if (response.body.length > MAX_URL_BYTES) {
    throw new ParserError("PARSE_FAILED", `URL response exceeds ${String(MAX_URL_BYTES)} bytes.`, {
      url: publicUrl,
      ...(contentType === undefined ? {} : { contentType }),
    });
  }
}

function buildUrlInput(
  input: Extract<ParserSourceInput, { kind: "url" }>,
  url: string,
  publicUrl: string,
  response: StaticUrlResponse,
): ResolvedParserInput {
  const contentType = response.headers.get("content-type") ?? input.contentType ?? undefined;
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
          if (typeof options === "object" && "all" in options && options.all === true) {
            callback(null, [{ address, family }] as never, family);
            return;
          }
          callback(null, address, family);
        },
      },
      (response) => {
        const deadline = setTimeout(() => {
          req.destroy(
            new ParserError("FETCH_FAILED", `URL fetch timed out after ${String(URL_TIMEOUT_MS)} ms.`, {
              url: publicUrl,
            }),
          );
        }, URL_TIMEOUT_MS);
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
            new ParserError("PARSE_FAILED", `URL response exceeds ${String(MAX_URL_BYTES)} bytes.`, {
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
              new ParserError("PARSE_FAILED", `URL response exceeds ${String(MAX_URL_BYTES)} bytes.`, {
                url: publicUrl,
                ...contentTypeSource(response),
              }),
            );
            return;
          }
          chunks.push(chunk);
        });
        response.on("error", (error) => {
          finish(reject, error);
        });
        response.on("end", () => {
          finish(resolve, {
            status,
            headers: { get: (name) => headerValue(response.headers[name.toLowerCase()]) },
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    req.setTimeout(URL_TIMEOUT_MS, () => {
      req.destroy(
        new ParserError("FETCH_FAILED", `URL fetch was idle for ${String(URL_TIMEOUT_MS)} ms.`, { url: publicUrl }),
      );
    });
    req.on("error", (error) => {
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
  } catch {
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
  return ipv4MappedFromHextets(address.split(":"));
}

function ipv4MappedFromHextets(hextets: string[]): string | null {
  if (!isIpv4MappedPrefix(hextets)) {
    return null;
  }
  if (hextets.length === 7) {
    return ipv4MappedSuffix(hextets[6] ?? "");
  }
  if (hextets.length === 8) {
    return ipv4MappedSuffix(`${hextets[6] ?? ""}:${hextets[7] ?? ""}`);
  }
  return null;
}

function isIpv4MappedPrefix(hextets: string[]): boolean {
  return hextets.slice(0, 5).every(isZeroHextet) && hextets[5]?.toLowerCase() === "ffff";
}

function ipv4MappedSuffix(suffix: string): string | null {
  if (isIP(suffix) === 4) {
    return suffix;
  }
  return ipv4FromHextetPair(suffix.split(":"));
}

function ipv4FromHextetPair(hextets: string[]): string | null {
  if (hextets.length !== 2) {
    return null;
  }
  const high = Number.parseInt(hextets[0] ?? "", 16);
  const low = Number.parseInt(hextets[1] ?? "", 16);
  if (!Number.isInteger(high) || !Number.isInteger(low) || high < 0 || high > 0xffff || low < 0 || low > 0xffff) {
    return null;
  }
  return `${String(high >> 8)}.${String(high & 0xff)}.${String(low >> 8)}.${String(low & 0xff)}`;
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
  if (!isValidHostnameShape(normalized)) {
    return false;
  }
  if (isLocalHostname(normalized)) {
    return false;
  }
  const mapped = ipv4MappedAddress(normalized);
  if (mapped !== null) {
    return isPublicHostname(mapped);
  }
  const ipVersion = isIP(normalized);
  if (ipVersion === 4) {
    return isPublicIpv4(normalized);
  }
  if (ipVersion === 6) {
    return isPublicIpv6(normalized);
  }
  return true;
}

function isValidHostnameShape(hostname: string): boolean {
  return hostname !== "" && !hostname.includes("[") && !hostname.includes("]");
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local");
}

function isPublicIpv4(address: string): boolean {
  const parts = address.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || !parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)) {
    return false;
  }
  const [a, b, c, d] = parts as [number, number, number, number];
  return !isPrivateIpv4(a, b, c, d);
}

function isPrivateIpv4(a: number, b: number, c: number, d: number): boolean {
  const parts: [number, number, number, number] = [a, b, c, d];
  return PRIVATE_IPV4_CHECKS.some((check) => check(parts));
}

const PRIVATE_IPV4_CHECKS: ((parts: [number, number, number, number]) => boolean)[] = [
  ([first]) => first === 0 || first === 10 || first === 127,
  ([first, second]) => first === 100 && second >= 64 && second <= 127,
  ([first, second]) => first === 169 && second === 254,
  ([first, second]) => first === 172 && second >= 16 && second <= 31,
  ([first, second, third]) => first === 192 && second === 0 && (third === 0 || third === 2),
  ([first, second, third]) => first === 192 && second === 88 && third === 99,
  ([first, second]) => first === 192 && second === 168,
  ([first, second, third]) => first === 198 && second === 51 && third === 100,
  ([first, second]) => first === 198 && second >= 18 && second <= 19,
  ([first, second, third]) => first === 203 && second === 0 && third === 113,
  ([first]) => first >= 224,
  ([first, second, third, fourth]) => first === 255 && second === 255 && third === 255 && fourth === 255,
];

function isPublicIpv6(address: string): boolean {
  if (address === "::1" || address === "::") {
    return false;
  }
  if (address.startsWith("fc") || address.startsWith("fd") || address.startsWith("ff")) {
    return false;
  }
  const firstHextet = Number.parseInt(address.split(":")[0] ?? "", 16);
  return !(firstHextet >= 0xfe80 && firstHextet <= 0xfebf);
}
