import type { ParsedSource, ParserSourceInput, SourceKind } from "../../domain/types.js";
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
export declare function resolveParserInput(input: string | ParserSourceInput): Promise<ResolvedParserInput>;
export declare function sourceName(input: ResolvedParserInput): string;
export declare function extension(input: ResolvedParserInput): string;
export declare function mediaType(input: ResolvedParserInput): string | undefined;
export declare function hasKnownMediaType(contentType: string | undefined): boolean;
export declare function parsedMarkdown(input: ResolvedParserInput, parser: string, title: string, body: string, description?: string, metadata?: Record<string, unknown>): ParsedSource;
export declare function sourceContext(input: ResolvedParserInput): {
    path?: string;
    url?: string;
    contentType?: string;
};
export declare function needsTextContent(contentType: string | undefined, sourcePath: string | undefined): boolean;
export declare function mediaTypeFromRaw(contentType: string | undefined): string | undefined;
