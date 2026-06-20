import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { ParserError } from "../../domain/errors.js";
import { firstPlainLine, normalizeSourceBody, titleFromPath } from "../markdown.js";
export async function resolveParserInput(input) {
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
export function sourceName(input) {
    return input.title ?? (input.path === undefined ? input.url ?? "Untitled Source" : titleFromPath(input.path));
}
export function extension(input) {
    const sourcePath = input.path ?? (input.url === undefined ? "" : urlPathname(input.url));
    const index = sourcePath.lastIndexOf(".");
    return index === -1 ? "" : sourcePath.slice(index).toLowerCase();
}
export function mediaType(input) {
    return input.contentType?.split(";", 1)[0]?.trim().toLowerCase();
}
export function hasKnownMediaType(contentType) {
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
export function parserMetadata(input, parser) {
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
export function needsTextContent(contentType, sourcePath) {
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
