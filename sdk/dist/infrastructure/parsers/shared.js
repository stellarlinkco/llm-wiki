import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { ParserError } from "../../domain/errors.js";
import { firstPlainLine, normalizeSourceBody, titleFromPath } from "../markdown.js";
export async function resolveParserInput(input) {
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
function textInput(input) {
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
function bufferInput(input) {
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
function byteView(bytes) {
    return Buffer.isBuffer(bytes) ? bytes : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
function textContent(bytes) {
    return Buffer.isBuffer(bytes) ? bytes.toString("utf8") : new TextDecoder().decode(bytes);
}
export function sourceName(input) {
    return input.title ?? (input.path === undefined ? (input.url ?? "Untitled Source") : titleFromPath(input.path));
}
export function extension(input) {
    const sourcePath = input.path ?? (input.url === undefined ? "" : urlPathname(input.url));
    const index = sourcePath.lastIndexOf(".");
    return index === -1 ? "" : sourcePath.slice(index).toLowerCase();
}
export function mediaType(input) {
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
export function hasKnownMediaType(contentType) {
    if (contentType === undefined) {
        return false;
    }
    return KNOWN_MEDIA_TYPES.has(contentType) || contentType.endsWith("+json");
}
function parserMetadata(input, parser) {
    return {
        ...input.metadata,
        parser,
        source_kind: input.kind,
        ...(input.contentType === undefined ? {} : { content_type: input.contentType }),
        ...(input.path === undefined ? {} : { filename: basename(input.path) }),
        ...(input.url === undefined ? {} : { url: input.url }),
    };
}
export function parsedMarkdown(input, parser, title, body, description, metadata) {
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
export function sourceContext(input) {
    return {
        ...(input.path === undefined ? {} : { path: input.path }),
        ...(input.url === undefined ? {} : { url: input.url }),
        ...(input.contentType === undefined ? {} : { contentType: input.contentType }),
    };
}
async function fileInput(path, metadata, contentType, title) {
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
export function needsTextContent(contentType, sourcePath) {
    if (contentType !== undefined) {
        if (TEXT_CONTENT_MEDIA_TYPES.has(contentType) || contentType.endsWith("+json") || contentType.endsWith("+xml")) {
            return true;
        }
    }
    return TEXT_CONTENT_EXTENSIONS.has(extensionFromPath(sourcePath));
}
export function mediaTypeFromRaw(contentType) {
    return contentType?.split(";", 1)[0]?.trim().toLowerCase();
}
function extensionFromPath(sourcePath) {
    if (sourcePath === undefined) {
        return "";
    }
    const index = sourcePath.lastIndexOf(".");
    return index === -1 ? "" : sourcePath.slice(index).toLowerCase();
}
function urlPathname(url) {
    try {
        return new URL(url).pathname;
    }
    catch {
        return url;
    }
}
