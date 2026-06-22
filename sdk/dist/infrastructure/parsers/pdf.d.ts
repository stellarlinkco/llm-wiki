import type { ParsedSource } from "../../domain/types.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
interface PdfParser {
    getText(): Promise<{
        text: string;
        total: number;
    }>;
    destroy(): Promise<void>;
}
type PdfParserFactory = (data: Uint8Array) => Promise<PdfParser>;
export declare function setPdfParserFactoryForTesting(factory: PdfParserFactory | undefined): void;
export declare class PdfSourceParser implements FormatParser {
    readonly name = "pdf";
    supports(input: ResolvedParserInput): boolean;
    parse(input: ResolvedParserInput): Promise<ParsedSource>;
}
export {};
