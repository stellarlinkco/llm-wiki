import type { ParserSourceInput, ParsedSource, SourceParser } from "../domain/types.js";
export declare class DefaultSourceParser implements SourceParser {
    private readonly parser;
    parse(input: string | ParserSourceInput): Promise<ParsedSource>;
}
