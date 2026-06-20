import { basename, extname } from "node:path";
import { ValidationError, errorMessage } from "../domain/errors.js";
import type { OkfFrontmatter, ParsedMarkdown, ValidationFinding } from "../domain/types.js";

export function parseMarkdown(content: string): ParsedMarkdown {
  const normalized = content.replace(/\r\n?/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { frontmatter: {}, body: normalized, hasFrontmatter: false };
  }
  let end = normalized.indexOf("\n---\n", 4);
  let bodyStart: number;
  if (end === -1 && normalized.endsWith("\n---")) {
    end = normalized.length - 4;
    bodyStart = normalized.length;
  } else if (end === -1) {
    return { frontmatter: {}, body: normalized, hasFrontmatter: false };
  } else {
    bodyStart = end + 5;
  }
  const block = normalized.slice(4, end);
  const body = normalized.slice(bodyStart).replace(/^\n/, "");
  try {
    return { frontmatter: parseYamlBlock(block), body, hasFrontmatter: true };
  } catch (error) {
    return { frontmatter: {}, body, hasFrontmatter: true, frontmatterError: errorMessage(error) };
  }
}

function parseYamlBlock(block: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let pendingListKey: string | undefined;
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
    } else {
      result[key] = parseYamlValue(rawValue);
      pendingListKey = undefined;
    }
  }
  return result;
}

function parseYamlValue(value: string): unknown {
  const uncommented = stripYamlComment(value);
  if (uncommented.startsWith("[") && uncommented.endsWith("]")) {
    const inner = uncommented.slice(1, -1).trim();
    return inner === "" ? [] : splitYamlInlineList(inner);
  }
  return unquote(uncommented);
}

function stripYamlComment(value: string): string {
  let quote: "\"" | "'" | undefined;
  let escaped = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (quote !== undefined) {
      if (char === quote) {
        quote = undefined;
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === "#" && (index === 0 || /\s/.test(value[index - 1] ?? ""))) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

function splitYamlInlineList(inner: string): string[] {
  const values: string[] = [];
  let current = "";
  let quote: "\"" | "'" | undefined;
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
    if (quote !== undefined) {
      current += char;
      if (char === quote) {
        quote = undefined;
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      current += char;
      quote = char;
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

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return value;
}

export function serializeMarkdown(frontmatter: OkfFrontmatter, body: string): string {
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

function serializeYamlValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => yamlScalar(String(item))).join(", ")}]`;
  }
  return yamlScalar(String(value));
}

function yamlScalar(value: string): string {
  if (value === ""
    || /[:{}[\]"'\n\r#&*!|>,]/.test(value)
    || /^\d{4}-\d{2}-\d{2}T/.test(value)
    || /^[-?:](?:\s|$)/.test(value)
    || /^(?:true|false|null|~)$/i.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/\r\n?/g, "\n").replace(/\n/g, "\\n").replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function toOkfFrontmatter(frontmatter: Record<string, unknown>): OkfFrontmatter {
  const type = String(frontmatter.type);
  const result: OkfFrontmatter = { type };
  for (const [key, value] of Object.entries(frontmatter)) {
    if (key !== "type") {
      result[key] = value;
    }
  }
  if (Array.isArray(result.tags)) {
    result.tags = result.tags.map(String);
  } else if (result.tags !== undefined) {
    result.tags = [String(result.tags)];
  }
  return result;
}

export function validateReservedFile(parsed: ParsedMarkdown, path: string, errors: ValidationFinding[]): void {
  if (!parsed.hasFrontmatter) {
    return;
  }
  const allowed = path === "index.md" ? new Set(["okf_version"]) : new Set<string>();
  for (const key of Object.keys(parsed.frontmatter)) {
    if (!allowed.has(key)) {
      errors.push({ path, code: "reserved_frontmatter", message: `Reserved file contains unsupported frontmatter field: ${key}` });
    }
  }
}

export function extractMarkdownLinks(content: string): string[] {
  const links: string[] = [];
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
      } else if (char === ")") {
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

function parseMarkdownLinkDestination(raw: string | undefined): string {
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

export function extractBundleCitations(text: string): string[] {
  const citations: string[] = [];
  const citationPattern = /\b(?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md\b/g;
  for (const match of text.matchAll(citationPattern)) {
    const citation = match[0];
    if (isBundleCitation(citation) && !citations.includes(citation)) {
      citations.push(citation);
    }
  }
  return citations;
}

export function isExternalLink(target: string): boolean {
  return target.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(target);
}

export function isBundleCitation(citation: string): boolean {
  return /^(?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md$/.test(citation) && !citation.split("/").includes("..");
}

export function extractTitle(content: string, path: string): string {
  const heading = content.match(/^#\s*(.*)$/m)?.[1]?.trim();
  return heading === undefined || heading === "" ? titleFromPath(path) : heading;
}

export function titleFromPath(path: string): string {
  return basename(path, extname(path)).replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function firstPlainLine(content: string): string {
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#") || line.startsWith("---")) {
      continue;
    }
    return stripMarkdown(line).slice(0, 160);
  }
  return "";
}

export function normalizeSourceBody(content: string): string {
  return content.replace(/\r\n?/g, "\n");
}

function stripMarkdown(line: string): string {
  return line.replace(/\[([^\]]+)]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();
}
