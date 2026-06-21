import type { ChangeSet, ParserSourceInput, WriteConceptOptions } from "../domain/types.js";
export declare function emptyChangeSet(operation: ChangeSet["operation"]): ChangeSet;
export declare function extractSitemapLocations(content: string): string[];
export declare function conceptsFromSynthesis(value: unknown): WriteConceptOptions[];
export declare function slugify(value: string): string;
export declare function boundedSlug(slug: string, identity: string): string;
export declare function sha256(content: string): string;
export declare function toParserInput(input: string | ParserSourceInput): string | ParserSourceInput;
export declare function sourceIdentity(input: string | ParserSourceInput): string;
export declare function publicResource(input: string | ParserSourceInput): string;
export declare function failurePath(input: string | ParserSourceInput, identity: string, resource: string): string;
export declare function hasUrlScheme(value: string): boolean;
export declare function sourceBasename(sourcePath: string): string;
export declare function frontmatterMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown>;
export declare function changeFailure(path: string, error: unknown): {
    path: string;
    error: string;
    code: "UNSUPPORTED_SOURCE" | "PARSE_FAILED" | "EMPTY_SOURCE" | "FETCH_FAILED" | "PDF_TEXT_LAYER_MISSING";
    source: {
        contentType?: string;
        url?: string;
        path?: string;
    };
} | {
    path: string;
    error: string;
    code?: never;
    source?: never;
};
