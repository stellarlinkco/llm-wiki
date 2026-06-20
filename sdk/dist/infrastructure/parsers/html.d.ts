import type { ParsedSource } from "../../domain/types.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
export declare class HtmlSourceParser implements FormatParser {
    readonly name = "html";
    supports(input: ResolvedParserInput): boolean;
    parse(input: ResolvedParserInput): Promise<ParsedSource>;
}
