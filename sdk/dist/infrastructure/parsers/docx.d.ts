import type { ParsedSource } from "../../domain/types.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
export declare class DocxSourceParser implements FormatParser {
    readonly name = "docx";
    supports(input: ResolvedParserInput): boolean;
    parse(input: ResolvedParserInput): Promise<ParsedSource>;
}
