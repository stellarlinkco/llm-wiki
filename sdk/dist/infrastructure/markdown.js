import { basename, extname } from "node:path";
import { ValidationError, errorMessage } from "../domain/errors.js";
export function parseMarkdown(content) {
    const normalized = content.replace(/\r\n?/g, "\n");
    if (!normalized.startsWith("---\n")) {
        return { frontmatter: {}, body: normalized, hasFrontmatter: false };
    }
    let end = normalized.indexOf("\n---\n", 4);
    let bodyStart;
    if (end === -1 && normalized.endsWith("\n---")) {
        end = normalized.length - 4;
        bodyStart = normalized.length;
    }
    else if (end === -1) {
        return { frontmatter: {}, body: normalized, hasFrontmatter: false };
    }
    else {
        bodyStart = end + 5;
    }
    const block = normalized.slice(4, end);
    const body = normalized.slice(bodyStart).replace(/^\n/, "");
    try {
        return { frontmatter: parseYamlBlock(block), body, hasFrontmatter: true };
    }
    catch (error) {
        return { frontmatter: {}, body, hasFrontmatter: true, frontmatterError: errorMessage(error) };
    }
}
function parseYamlBlock(block) {
    const result = {};
    let pendingListKey;
    for (const rawLine of block.split("\n")) {
        const line = rawLine.trim();
        if (line === "" || line.startsWith("#")) {
            continue;
        }
        if (line.startsWith("- ")) {
            if (pendingListKey === undefined) {
                throw new ValidationError(`Malformed frontmatter line: ${line}`);
            }
            const current = result[pendingListKey];
            if (!Array.isArray(current)) {
                throw new ValidationError(`Malformed frontmatter list for key: ${pendingListKey}`);
            }
            current.push(unquote(stripYamlComment(line.slice(2).trim())));
            continue;
        }
        const colon = line.indexOf(":");
        if (colon === -1) {
            throw new ValidationError(`Malformed frontmatter line: ${line}`);
        }
        const key = line.slice(0, colon).trim();
        if (key === "") {
            throw new ValidationError(`Malformed frontmatter line: ${line}`);
        }
        const rawValue = stripYamlComment(line.slice(colon + 1).trim());
        if (rawValue === "") {
            result[key] = [];
            pendingListKey = key;
        }
        else {
            result[key] = parseYamlValue(rawValue);
            pendingListKey = undefined;
        }
    }
    return result;
}
function parseYamlValue(value) {
    const uncommented = stripYamlComment(value);
    if (uncommented.startsWith("[") && uncommented.endsWith("]")) {
        const inner = uncommented.slice(1, -1).trim();
        return inner === "" ? [] : splitYamlInlineList(inner);
    }
    return unquote(uncommented);
}
function stripYamlComment(value) {
    let quote;
    let escaped = false;
    for (let index = 0; index < value.length; index += 1) {
        const char = value.charAt(index);
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === "\\") {
            escaped = true;
            continue;
        }
        quote = updateYamlQuote(quote, char);
        if (quote !== undefined) {
            continue;
        }
        if (char === "#" && isYamlCommentStart(value, index)) {
            return value.slice(0, index).trimEnd();
        }
    }
    return value;
}
function updateYamlQuote(quote, char) {
    if (quote !== undefined) {
        return char === quote ? undefined : quote;
    }
    if (char === '"' || char === "'") {
        return char;
    }
    return undefined;
}
function isYamlCommentStart(value, index) {
    return index === 0 || /\s/.test(value[index - 1] ?? "");
}
function splitYamlInlineList(inner) {
    const values = [];
    let current = "";
    let quote;
    let escaped = false;
    for (const char of inner) {
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }
        if (char === "\\") {
            current += char;
            escaped = true;
            continue;
        }
        const quoted = appendYamlListChar(char, quote, current);
        current = quoted.current;
        quote = quoted.quote;
        if (quoted.handled) {
            continue;
        }
        if (char === ",") {
            values.push(unquote(current.trim()));
            current = "";
            continue;
        }
        current += char;
    }
    if (quote !== undefined) {
        throw new ValidationError("Malformed frontmatter inline list: missing closing quote");
    }
    if (current.trim() !== "") {
        values.push(unquote(current.trim()));
    }
    return values;
}
function appendYamlListChar(char, quote, current) {
    if (quote !== undefined) {
        const nextQuote = char === quote ? undefined : quote;
        return { current: current + char, quote: nextQuote, handled: true };
    }
    if (char === '"' || char === "'") {
        return { current: current + char, quote: char, handled: true };
    }
    return { current, quote, handled: false };
}
function unquote(value) {
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    return value;
}
export function serializeMarkdown(frontmatter, body) {
    const lines = ["---"];
    for (const [key, value] of Object.entries(frontmatter)) {
        if (value === undefined) {
            continue;
        }
        lines.push(`${key}: ${serializeYamlValue(value)}`);
    }
    lines.push("---", "", body.trimEnd(), "");
    return lines.join("\n");
}
function serializeYamlValue(value) {
    if (Array.isArray(value)) {
        return `[${value.map((item) => yamlScalar(String(item))).join(", ")}]`;
    }
    return yamlScalar(String(value));
}
function yamlScalar(value) {
    if (value === "" ||
        /[:{}[\]"'\n\r#&*!|>,]/.test(value) ||
        /^\d{4}-\d{2}-\d{2}T/.test(value) ||
        /^[-?:](?:\s|$)/.test(value) ||
        /^(?:true|false|null|~)$/i.test(value)) {
        return `"${value.replace(/\\/g, "\\\\").replace(/\r\n?/g, "\n").replace(/\n/g, "\\n").replace(/"/g, '\\"')}"`;
    }
    return value;
}
export function toOkfFrontmatter(frontmatter) {
    const type = String(frontmatter.type);
    const result = { type };
    for (const [key, value] of Object.entries(frontmatter)) {
        if (key !== "type") {
            result[key] = value;
        }
    }
    const rawTags = frontmatter.tags;
    if (Array.isArray(rawTags)) {
        result.tags = rawTags.map(String);
    }
    else if (typeof rawTags === "string") {
        result.tags = [rawTags];
    }
    else if (typeof rawTags === "number" || typeof rawTags === "boolean") {
        result.tags = [String(rawTags)];
    }
    return result;
}
export function validateReservedFile(parsed, path, errors) {
    if (!parsed.hasFrontmatter) {
        return;
    }
    const allowed = basename(path) === "index.md" ? new Set(["okf_version"]) : new Set();
    for (const key of Object.keys(parsed.frontmatter)) {
        if (!allowed.has(key)) {
            errors.push({
                path,
                code: "reserved_frontmatter",
                message: `Reserved file contains unsupported frontmatter field: ${key}`,
            });
        }
    }
}
export function extractMarkdownLinks(content) {
    const links = [];
    let cursor = 0;
    while (cursor < content.length) {
        const opener = content.indexOf("](", cursor);
        if (opener === -1) {
            break;
        }
        const start = opener + 2;
        let depth = 0;
        let end = -1;
        for (let index = start; index < content.length; index += 1) {
            const char = content[index];
            if (char === "\\") {
                index += 1;
                continue;
            }
            if (char === "(") {
                depth += 1;
            }
            else if (char === ")") {
                if (depth === 0) {
                    end = index;
                    break;
                }
                depth -= 1;
            }
        }
        if (end === -1) {
            break;
        }
        const target = parseMarkdownLinkDestination(content.slice(start, end));
        if (target !== "") {
            links.push(target);
        }
        cursor = end + 1;
    }
    return links;
}
function parseMarkdownLinkDestination(raw) {
    if (raw === undefined) {
        return "";
    }
    const trimmed = raw.trim();
    if (trimmed.startsWith("<")) {
        const end = trimmed.indexOf(">");
        return end === -1 ? "" : trimmed.slice(1, end);
    }
    const whitespace = trimmed.search(/\s/);
    return (whitespace === -1 ? trimmed : trimmed.slice(0, whitespace)).replace(/\\([()])/g, "$1");
}
export function extractBundleCitations(text) {
    const citations = [];
    for (const mention of extractBundleCitationMentions(text)) {
        if (!citations.includes(mention.path)) {
            citations.push(mention.path);
        }
    }
    return citations;
}
const BUNDLE_CITATION_MENTION_PATTERN = /(?:(?:\.\.\/)+|\.\/|\/|\b)((?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md)\b/g;
export function extractBundleCitationMentions(text) {
    const mentions = [];
    for (const match of text.matchAll(BUNDLE_CITATION_MENTION_PATTERN)) {
        const path = match[1] ?? "";
        const raw = match[0];
        if (!isBundleCitation(path)) {
            continue;
        }
        if (!mentions.some((mention) => mention.raw === raw && mention.path === path)) {
            mentions.push({ path, raw });
        }
    }
    return mentions;
}
export function normalizeBundleCitationPath(target) {
    const withoutFragment = target.split("#", 1)[0] ?? "";
    if (withoutFragment === "") {
        return undefined;
    }
    if (isBundleCitation(withoutFragment)) {
        return withoutFragment;
    }
    const rootRelative = /^\/((?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md)$/.exec(withoutFragment);
    if (rootRelative?.[1] !== undefined) {
        return rootRelative[1];
    }
    const parentRelative = /^(?:\.\.\/)+((?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md)$/.exec(withoutFragment);
    if (parentRelative?.[1] !== undefined) {
        return parentRelative[1];
    }
    const dotRelative = /^\.\/((?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md)$/.exec(withoutFragment);
    if (dotRelative?.[1] !== undefined) {
        return dotRelative[1];
    }
    return undefined;
}
export function isExternalLink(target) {
    return target.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(target);
}
export function isBundleCitation(citation) {
    return (/^(?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md$/.test(citation) && !citation.split("/").includes(".."));
}
export function extractTitle(content, path) {
    const heading = /^#\s*(.*)$/m.exec(content)?.[1]?.trim();
    return heading === undefined || heading === "" ? titleFromPath(path) : heading;
}
export function titleFromPath(path) {
    return basename(path, extname(path))
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
export function firstPlainLine(content) {
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (line === "" || line.startsWith("#") || line.startsWith("---")) {
            continue;
        }
        return stripMarkdown(line).slice(0, 160);
    }
    return "";
}
export function normalizeSourceBody(content) {
    return content.replace(/\r\n?/g, "\n");
}
function stripMarkdown(line) {
    return line
        .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
        .replace(/[*_`]/g, "")
        .trim();
}
