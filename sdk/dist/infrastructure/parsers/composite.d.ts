import type { ParsedSource, ParserSourceInput, SourceParser } from "../../domain/types.js";
import { type FormatParser } from "./shared.js";
export declare class CompositeSourceParser implements SourceParser {
    private readonly parsers;
    constructor(parsers?: readonly FormatParser[]);
    parse(input: string | ParserSourceInput): Promise<ParsedSource>;
}
