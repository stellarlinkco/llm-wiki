import type { OkfFrontmatter, ParsedMarkdown, ValidationFinding } from "../domain/types.js";
export declare function parseMarkdown(content: string): ParsedMarkdown;
export declare function serializeMarkdown(frontmatter: OkfFrontmatter, body: string): string;
export declare function toOkfFrontmatter(frontmatter: Record<string, unknown>): OkfFrontmatter;
export declare function validateReservedFile(parsed: ParsedMarkdown, path: string, errors: ValidationFinding[]): void;
export declare function extractMarkdownLinks(content: string): string[];
export declare function extractBundleCitations(text: string): string[];
export declare function extractBundleCitationMentions(text: string): {
    path: string;
    raw: string;
}[];
export declare function normalizeBundleCitationPath(target: string): string | undefined;
export declare function isExternalLink(target: string): boolean;
export declare function isBundleCitation(citation: string): boolean;
export declare function extractTitle(content: string, path: string): string;
export declare function titleFromPath(path: string): string;
export declare function firstPlainLine(content: string): string;
export declare function normalizeSourceBody(content: string): string;
