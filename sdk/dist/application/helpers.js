import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import { ConfigurationError, ParserError, errorMessage } from "../domain/errors.js";
export function emptyChangeSet(operation) {
    return { operation, created: [], updated: [], deleted: [], skipped: [], failed: [], warnings: [] };
}
export function extractSitemapLocations(content) {
    const locations = [];
    for (const match of content.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
        const candidate = decodeXmlText(match[1] ?? "");
        try {
            locations.push(new URL(candidate).toString());
        }
        catch {
            continue;
        }
    }
    return [...new Set(locations)];
}
function decodeXmlText(value) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
}
export function conceptsFromSynthesis(value) {
    const payload = typeof value === "string" ? JSON.parse(value) : value;
    if (!isRecord(payload) || !Array.isArray(payload.concepts)) {
        throw new ConfigurationError("Synthesis response must include a concepts array.");
    }
    return payload.concepts.map((item) => {
        if (!isRecord(item) ||
            typeof item.path !== "string" ||
            typeof item.title !== "string" ||
            typeof item.body !== "string") {
            throw new ConfigurationError("Each synthesized concept requires path, title, and body.");
        }
        const concept = {
            path: item.path,
            title: item.title,
            body: item.body,
        };
        if (typeof item.description === "string")
            concept.description = item.description;
        if (Array.isArray(item.tags))
            concept.tags = item.tags.map(String);
        if (Array.isArray(item.sourcePaths))
            concept.sourcePaths = item.sourcePaths.map(String);
        if (typeof item.type === "string" && item.type.trim() !== "")
            concept.type = item.type.trim();
        if (isRecord(item.frontmatter))
            concept.frontmatter = item.frontmatter;
        return concept;
    });
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function slugify(value) {
    const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug === "" ? "source" : slug;
}
export function boundedSlug(slug, identity) {
    const maxSlugLength = 180;
    if (slug.length <= maxSlugLength) {
        return slug;
    }
    return `${slug.slice(0, maxSlugLength - 13).replace(/-+$/g, "")}-${sha256(identity).slice(0, 12)}`;
}
export function sha256(content) {
    return createHash("sha256").update(content).digest("hex");
}
export function toParserInput(input) {
    if (typeof input !== "string") {
        return input.kind === "file" ? { ...input, path: resolve(input.path) } : input;
    }
    if (hasUrlScheme(input)) {
        return { kind: "url", url: input };
    }
    return resolve(input);
}
export function sourceIdentity(input) {
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
    return (input.title ??
        `${input.kind}:${sha256(input.kind === "text" ? input.text : Buffer.from(input.buffer).toString("base64"))}`);
}
export function publicResource(input) {
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
export function failurePath(input, identity, resource) {
    return typeof input !== "string" && input.kind === "url" ? resource : identity;
}
export function hasUrlScheme(value) {
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}
export function sourceBasename(sourcePath) {
    if (!hasUrlScheme(sourcePath)) {
        return sourcePath;
    }
    try {
        const url = new URL(sourcePath);
        const pathnameBase = basename(url.pathname);
        return pathnameBase === "" ? url.hostname : pathnameBase;
    }
    catch {
        return sourcePath;
    }
}
function sanitizeResourceUrl(value) {
    const url = new URL(value);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
}
function safeSanitizeResourceUrl(value) {
    try {
        return sanitizeResourceUrl(value);
    }
    catch {
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
function stripQueryAndFragment(value) {
    const query = value.indexOf("?");
    const fragment = value.indexOf("#");
    const end = Math.min(query === -1 ? value.length : query, fragment === -1 ? value.length : fragment);
    return value.slice(0, end);
}
export function frontmatterMetadata(metadata) {
    if (metadata === undefined) {
        return {};
    }
    const out = {};
    for (const [key, value] of Object.entries(metadata)) {
        if ([
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
        ].includes(key)) {
            continue;
        }
        out[key] = frontmatterValue(value);
    }
    return out;
}
function frontmatterValue(value) {
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
function sanitizeMetadataJson(value) {
    if (typeof value === "string") {
        return hasUrlScheme(value) ? safeSanitizeResourceUrl(value) : value;
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeMetadataJson);
    }
    if (value !== null && typeof value === "object") {
        const out = {};
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
export function changeFailure(path, error) {
    if (error instanceof ParserError) {
        return { path, error: error.message, code: error.code, source: sanitizeFailureSource(error.source) };
    }
    return { path, error: errorMessage(error) };
}
function sanitizeFailureSource(source) {
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
