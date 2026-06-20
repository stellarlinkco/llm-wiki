import type { ParsedSource } from "../../domain/types.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
export declare class JsonSourceParser implements FormatParser {
    readonly name = "json";
    supports(input: ResolvedParserInput): boolean;
    parse(input: ResolvedParserInput): Promise<ParsedSource>;
}
