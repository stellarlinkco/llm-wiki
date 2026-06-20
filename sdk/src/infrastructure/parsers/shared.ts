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
  bytes: Buffer;
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
  if (input.kind === "file") {
    return fileInput(input.path, input.metadata ?? {}, input.contentType, input.title);
  }
  if (input.kind === "text") {
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
  if (input.kind === "buffer") {
    const contentType = mediaTypeFromRaw(input.contentType);
    const sourcePath = input.path;
    return {
      kind: "buffer",
      content: needsTextContent(contentType, sourcePath) ? input.buffer.toString("utf8") : "",
      bytes: input.buffer,
      ...(sourcePath === undefined ? {} : { path: sourcePath }),
      ...(input.contentType === undefined ? {} : { contentType: input.contentType }),
      ...(input.title === undefined ? {} : { title: input.title }),
      metadata: input.metadata ?? {},
    };
  }
  if (input.kind === "url") {
    const { fetchUrlInput } = await import("./url.js");
    return await fetchUrlInput(input);
  }
  throw new ParserError("UNSUPPORTED_SOURCE", "Unsupported source input.", {});
}

export function sourceName(input: ResolvedParserInput): string {
  return input.title ?? (input.path === undefined ? input.url ?? "Untitled Source" : titleFromPath(input.path));
}

export function extension(input: ResolvedParserInput): string {
  const sourcePath = input.path ?? (input.url === undefined ? "" : urlPathname(input.url));
  const index = sourcePath.lastIndexOf(".");
  return index === -1 ? "" : sourcePath.slice(index).toLowerCase();
}

export function mediaType(input: ResolvedParserInput): string | undefined {
  return input.contentType?.split(";", 1)[0]?.trim().toLowerCase();
}

export function hasKnownMediaType(contentType: string | undefined): boolean {
  return contentType === "text/markdown"
    || contentType === "text/plain"
    || contentType === "application/json"
    || contentType?.endsWith("+json") === true
    || contentType === "text/html"
    || contentType === "application/xhtml+xml"
    || contentType === "application/pdf"
    || contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    || contentType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    || contentType === "image/png"
    || contentType === "image/jpeg"
    || contentType === "audio/mpeg"
    || contentType === "video/mp4";
}

export function parserMetadata(input: ResolvedParserInput, parser: string): Record<string, unknown> {
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

async function fileInput(path: string, metadata: Record<string, unknown>, contentType?: string, title?: string): Promise<ResolvedParserInput> {
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

export function needsTextContent(contentType: string | undefined, sourcePath: string | undefined): boolean {
  return contentType === "text/markdown"
    || contentType === "text/plain"
    || contentType === "application/json"
    || contentType?.endsWith("+json") === true
    || contentType === "application/xml"
    || contentType === "text/xml"
    || contentType?.endsWith("+xml") === true
    || contentType === "text/html"
    || contentType === "application/xhtml+xml"
    || [".md", ".markdown", ".mdx", ".txt", ".text", ".log", ".csv", ".tsv", ".json", ".xml", ".html", ".htm"].includes(extensionFromPath(sourcePath));
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
