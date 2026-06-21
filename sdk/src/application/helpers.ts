import { createHash } from "node:crypto";
import { basename, dirname, join, resolve } from "node:path";
import type { ChangeSet, ParserSourceInput, SynthesizeOptions, WriteConceptOptions } from "../domain/types.js";
import { ConfigurationError, ParserError, errorMessage } from "../domain/errors.js";

export function emptyChangeSet(operation: ChangeSet["operation"]): ChangeSet {
  return { operation, created: [], updated: [], deleted: [], skipped: [], failed: [], warnings: [] };
}

export function extractSitemapLocations(content: string): string[] {
  const locations: string[] = [];
  for (const match of content.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    const candidate = decodeXmlText(match[1] ?? "");
    try {
      locations.push(new URL(candidate).toString());
    } catch {
      continue;
    }
  }
  return [...new Set(locations)];
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function conceptsFromSynthesis(value: unknown): WriteConceptOptions[] {
  const payload = typeof value === "string" ? (JSON.parse(value) as unknown) : value;
  if (!isRecord(payload) || !Array.isArray(payload.concepts)) {
    throw new ConfigurationError("Synthesis response must include a concepts array.");
  }
  return payload.concepts.map((item) => toWriteConceptOptions(item));
}

function toWriteConceptOptions(item: unknown): WriteConceptOptions {
  validateConceptItem(item);
  const concept: WriteConceptOptions = {
    path: item.path,
    title: item.title,
    body: item.body,
  };
  if (typeof item.description === "string") concept.description = item.description;
  if (Array.isArray(item.tags)) concept.tags = item.tags.map(String);
  if (Array.isArray(item.sourcePaths)) concept.sourcePaths = item.sourcePaths.map(String);
  if (typeof item.type === "string" && item.type.trim() !== "") concept.type = item.type.trim();
  if (isRecord(item.frontmatter)) concept.frontmatter = item.frontmatter;
  return concept;
}

function validateConceptItem(item: unknown): asserts item is Record<string, unknown> & {
  path: string;
  title: string;
  body: string;
} {
  if (
    !isRecord(item) ||
    typeof item.path !== "string" ||
    typeof item.title !== "string" ||
    typeof item.body !== "string"
  ) {
    throw new ConfigurationError("Each synthesized concept requires path, title, and body.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "source" : slug;
}

export function boundedSlug(slug: string, identity: string): string {
  const maxSlugLength = 180;
  if (slug.length <= maxSlugLength) {
    return slug;
  }
  return `${slug.slice(0, maxSlugLength - 13).replace(/-+$/g, "")}-${sha256(identity).slice(0, 12)}`;
}

export function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function sha256Base64EncodedBytes(content: Uint8Array): string {
  const hash = createHash("sha256");
  const bytes = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content.buffer, content.byteOffset, content.byteLength);
  const completeLength = bytes.byteLength - (bytes.byteLength % 3);
  const chunkSize = 48 * 1024;

  for (let offset = 0; offset < completeLength; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, completeLength);
    hash.update(bytes.subarray(offset, end).toString("base64"));
  }

  if (completeLength < bytes.byteLength) {
    hash.update(bytes.subarray(completeLength).toString("base64"));
  }

  return hash.digest("hex");
}

export function toParserInput(input: string | ParserSourceInput): string | ParserSourceInput {
  if (typeof input !== "string") {
    return input.kind === "file" ? { ...input, path: resolve(input.path) } : input;
  }
  if (hasUrlScheme(input)) {
    return { kind: "url", url: input };
  }
  return resolve(input);
}

export function sourceIdentity(input: string | ParserSourceInput): string {
  if (typeof input === "string") {
    return input;
  }
  if (input.kind === "file") {
    return input.path;
  }
  if (input.kind === "url") {
    return input.url;
  }
  if (input.kind === "buffer" && input.path !== undefined) {
    return resolve(input.path);
  }
  if (input.title !== undefined) {
    return input.title;
  }
  return input.kind === "text"
    ? `${input.kind}:${sha256(input.text)}`
    : `${input.kind}:${sha256Base64EncodedBytes(input.buffer)}`;
}

export function publicResource(input: string | ParserSourceInput): string {
  if (typeof input === "string") {
    return basename(input);
  }
  if (input.kind === "file") {
    return basename(input.path);
  }
  if (input.kind === "url") {
    return safeSanitizeResourceUrl(input.url);
  }
  if (input.kind === "buffer") {
    return input.path === undefined ? (input.title ?? "buffer-source") : basename(input.path);
  }
  return input.title ?? "text-source";
}

export function failurePath(input: string | ParserSourceInput, identity: string, resource: string): string {
  return typeof input !== "string" && input.kind === "url" ? resource : identity;
}

export function hasUrlScheme(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

export function sourceCandidateMatches(
  frontmatter: Record<string, unknown>,
  sourceIdentity: string,
  resource: string,
): boolean {
  return (
    sourceCandidateMatchesIdentity(frontmatter, sourceIdentity) ||
    sourceCandidateMatchesUrlResource(frontmatter, resource)
  );
}

export function sourceDocumentUsesUrl(frontmatter: Record<string, unknown>): boolean {
  const sourceUrl = typeof frontmatter.resource === "string" ? frontmatter.resource : frontmatter.source_path;
  return typeof sourceUrl === "string" && hasUrlScheme(sourceUrl);
}

export function internalLinkTarget(relPath: string, target: string): string | undefined {
  const targetWithoutFragment = target.split("#", 1)[0] ?? "";
  if (targetWithoutFragment === "") {
    return undefined;
  }
  return targetWithoutFragment.startsWith("/")
    ? targetWithoutFragment.slice(1)
    : join(dirname(relPath), targetWithoutFragment);
}

export function synthesisSystemContent(options: SynthesizeOptions, defaultPrompt: string): string {
  return options.outputSchema === undefined
    ? (options.systemPrompt ?? defaultPrompt)
    : `${options.outputSchema}\n\n${options.systemPrompt ?? defaultPrompt}`;
}

export function synthesisWriteFrontmatter(existed: boolean, concept: WriteConceptOptions): Record<string, unknown> {
  return existed ? { generated_by: "llm-wiki-sdk" } : { ...concept.frontmatter, generated_by: "llm-wiki-sdk" };
}

function sourceCandidateMatchesIdentity(frontmatter: Record<string, unknown>, sourceIdentity: string): boolean {
  return (
    frontmatter.source_id === sha256(sourceIdentity) ||
    frontmatter.source_path === sourceIdentity ||
    frontmatter.resource === sourceIdentity
  );
}

function sourceCandidateMatchesUrlResource(frontmatter: Record<string, unknown>, resource: string): boolean {
  return (
    hasUrlScheme(resource) &&
    frontmatter.source_id === undefined &&
    (frontmatter.source_path === resource || frontmatter.resource === resource)
  );
}

export function sourceBasename(sourcePath: string): string {
  if (!hasUrlScheme(sourcePath)) {
    return sourcePath;
  }
  try {
    const url = new URL(sourcePath);
    const pathnameBase = basename(url.pathname);
    return pathnameBase === "" ? url.hostname : pathnameBase;
  } catch {
    return sourcePath;
  }
}

function sanitizeResourceUrl(value: string): string {
  const url = new URL(value);
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function safeSanitizeResourceUrl(value: string): string {
  try {
    return sanitizeResourceUrl(value);
  } catch {
    const schemeEnd = value.indexOf("://");
    if (schemeEnd === -1) {
      return stripQueryAndFragment(value);
    }
    const prefix = value.slice(0, schemeEnd + 3);
    const rest = value.slice(schemeEnd + 3);
    const slash = rest.indexOf("/");
    const authority = slash === -1 ? rest : rest.slice(0, slash);
    const path = slash === -1 ? "" : rest.slice(slash);
    const at = authority.lastIndexOf("@");
    const redacted = at === -1 ? rest : `${authority.slice(at + 1)}${path}`;
    return `${prefix}${stripQueryAndFragment(redacted)}`;
  }
}

function stripQueryAndFragment(value: string): string {
  const query = value.indexOf("?");
  const fragment = value.indexOf("#");
  const end = Math.min(query === -1 ? value.length : query, fragment === -1 ? value.length : fragment);
  return value.slice(0, end);
}

export function frontmatterMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  if (metadata === undefined) {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (
      [
        "type",
        "title",
        "description",
        "resource",
        "tags",
        "timestamp",
        "source_path",
        "source_paths",
        "source_id",
        "content_hash",
      ].includes(key)
    ) {
      continue;
    }
    out[key] = frontmatterValue(value);
  }
  return out;
}

function frontmatterValue(value: unknown): unknown {
  if (typeof value === "string") {
    return hasUrlScheme(value) ? safeSanitizeResourceUrl(value) : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(frontmatterValue(item)));
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return undefined;
  }
  return JSON.stringify(sanitizeMetadataJson(value));
}

function sanitizeMetadataJson(value: unknown): unknown {
  if (typeof value === "string") {
    return hasUrlScheme(value) ? safeSanitizeResourceUrl(value) : value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeMetadataJson);
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      const sanitized = sanitizeMetadataJson(nested);
      if (sanitized !== undefined) {
        out[key] = sanitized;
      }
    }
    return out;
  }
  return value;
}

export function changeFailure(path: string, error: unknown) {
  if (error instanceof ParserError) {
    return { path, error: error.message, code: error.code, source: sanitizeFailureSource(error.source) };
  }
  return { path, error: errorMessage(error) };
}

function sanitizeFailureSource(source: { path?: string; url?: string; contentType?: string }) {
  return {
    ...(source.path === undefined
      ? {}
      : { path: hasUrlScheme(source.path) ? safeSanitizeResourceUrl(source.path) : source.path }),
    ...(source.url === undefined
      ? {}
      : { url: hasUrlScheme(source.url) ? safeSanitizeResourceUrl(source.url) : source.url }),
    ...(source.contentType === undefined ? {} : { contentType: source.contentType }),
  };
}
