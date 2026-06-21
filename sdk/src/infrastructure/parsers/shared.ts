import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { ParserError } from "../../domain/errors.js";
import type { ParsedSource, ParserSourceInput, SourceKind } from "../../domain/types.js";
import { firstPlainLine, normalizeSourceBody, titleFromPath } from "../markdown.js";

export interface ResolvedParserInput {
  kind: SourceKind;
  path?: string;
  url?: string;
  content: string;
  bytes: Uint8Array;
  contentType?: string;
  title?: string;
  metadata: Record<string, unknown>;
}

export interface FormatParser {
  readonly name: string;
  supports(input: ResolvedParserInput): boolean;
  parse(input: ResolvedParserInput): Promise<ParsedSource>;
}

export async function resolveParserInput(input: string | ParserSourceInput): Promise<ResolvedParserInput> {
  if (typeof input === "string") {
    return fileInput(input, {});
  }
  switch (input.kind) {
    case "file":
      return fileInput(input.path, input.metadata ?? {}, input.contentType, input.title);
    case "text":
      return textInput(input);
    case "buffer":
      return bufferInput(input);
    case "url": {
      const { fetchUrlInput } = await import("./url.js");
      return await fetchUrlInput(input);
    }
    default:
      throw new ParserError("UNSUPPORTED_SOURCE", "Unsupported source input.", {});
  }
}

function textInput(input: Extract<ParserSourceInput, { kind: "text" }>): ResolvedParserInput {
  const bytes = Buffer.from(input.text, "utf8");
  return {
    kind: "text",
    content: input.text,
    bytes,
    ...(input.contentType === undefined ? {} : { contentType: input.contentType }),
    ...(input.title === undefined ? {} : { title: input.title }),
    metadata: input.metadata ?? {},
  };
}

function bufferInput(input: Extract<ParserSourceInput, { kind: "buffer" }>): ResolvedParserInput {
  const contentType = mediaTypeFromRaw(input.contentType);
  const sourcePath = input.path;
  const bytes = byteView(input.buffer);
  return {
    kind: "buffer",
    content: needsTextContent(contentType, sourcePath) ? textContent(bytes) : "",
    bytes,
    ...(sourcePath === undefined ? {} : { path: sourcePath }),
    ...(input.contentType === undefined ? {} : { contentType: input.contentType }),
    ...(input.title === undefined ? {} : { title: input.title }),
    metadata: input.metadata ?? {},
  };
}

function byteView(bytes: Uint8Array): Uint8Array {
  return Buffer.isBuffer(bytes) ? bytes : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function textContent(bytes: Uint8Array): string {
  return Buffer.isBuffer(bytes) ? bytes.toString("utf8") : new TextDecoder().decode(bytes);
}

export function sourceName(input: ResolvedParserInput): string {
  return input.title ?? (input.path === undefined ? (input.url ?? "Untitled Source") : titleFromPath(input.path));
}

export function extension(input: ResolvedParserInput): string {
  const sourcePath = input.path ?? (input.url === undefined ? "" : urlPathname(input.url));
  const index = sourcePath.lastIndexOf(".");
  return index === -1 ? "" : sourcePath.slice(index).toLowerCase();
}

export function mediaType(input: ResolvedParserInput): string | undefined {
  return input.contentType?.split(";", 1)[0]?.trim().toLowerCase();
}

const KNOWN_MEDIA_TYPES = new Set([
  "text/markdown",
  "text/plain",
  "application/json",
  "text/html",
  "application/xhtml+xml",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "audio/mpeg",
  "video/mp4",
]);

export function hasKnownMediaType(contentType: string | undefined): boolean {
  if (contentType === undefined) {
    return false;
  }
  return KNOWN_MEDIA_TYPES.has(contentType) || contentType.endsWith("+json");
}

function parserMetadata(input: ResolvedParserInput, parser: string): Record<string, unknown> {
  return {
    ...input.metadata,
    parser,
    source_kind: input.kind,
    ...(input.contentType === undefined ? {} : { content_type: input.contentType }),
    ...(input.path === undefined ? {} : { filename: basename(input.path) }),
    ...(input.url === undefined ? {} : { url: input.url }),
  };
}

export function parsedMarkdown(
  input: ResolvedParserInput,
  parser: string,
  title: string,
  body: string,
  description?: string,
  metadata?: Record<string, unknown>,
): ParsedSource {
  const normalizedBody = normalizeSourceBody(body).trim();
  if (normalizedBody === "") {
    throw new ParserError("EMPTY_SOURCE", "Parsed source did not contain meaningful text.", sourceContext(input));
  }
  return {
    title,
    description: description ?? firstPlainLine(normalizedBody),
    body: `${normalizedBody}\n`,
    metadata: { ...parserMetadata(input, parser), ...metadata },
  };
}

export function sourceContext(input: ResolvedParserInput): { path?: string; url?: string; contentType?: string } {
  return {
    ...(input.path === undefined ? {} : { path: input.path }),
    ...(input.url === undefined ? {} : { url: input.url }),
    ...(input.contentType === undefined ? {} : { contentType: input.contentType }),
  };
}

async function fileInput(
  path: string,
  metadata: Record<string, unknown>,
  contentType?: string,
  title?: string,
): Promise<ResolvedParserInput> {
  const bytes = await readFile(path);
  const media = mediaTypeFromRaw(contentType);
  return {
    kind: "file",
    path,
    content: needsTextContent(media, path) ? bytes.toString("utf8") : "",
    bytes,
    ...(contentType === undefined ? {} : { contentType }),
    ...(title === undefined ? {} : { title }),
    metadata,
  };
}

const TEXT_CONTENT_MEDIA_TYPES = new Set([
  "text/markdown",
  "text/plain",
  "application/json",
  "application/xml",
  "text/xml",
  "text/html",
  "application/xhtml+xml",
]);

const TEXT_CONTENT_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".mdx",
  ".txt",
  ".text",
  ".log",
  ".csv",
  ".tsv",
  ".json",
  ".xml",
  ".html",
  ".htm",
]);

export function needsTextContent(contentType: string | undefined, sourcePath: string | undefined): boolean {
  if (contentType !== undefined) {
    if (TEXT_CONTENT_MEDIA_TYPES.has(contentType) || contentType.endsWith("+json") || contentType.endsWith("+xml")) {
      return true;
    }
  }
  return TEXT_CONTENT_EXTENSIONS.has(extensionFromPath(sourcePath));
}

export function mediaTypeFromRaw(contentType: string | undefined): string | undefined {
  return contentType?.split(";", 1)[0]?.trim().toLowerCase();
}

function extensionFromPath(sourcePath: string | undefined): string {
  if (sourcePath === undefined) {
    return "";
  }
  const index = sourcePath.lastIndexOf(".");
  return index === -1 ? "" : sourcePath.slice(index).toLowerCase();
}

function urlPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
