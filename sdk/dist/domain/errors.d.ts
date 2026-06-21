export declare class ConfigurationError extends Error {
    constructor(message: string);
}
export declare class ValidationError extends Error {
    constructor(message: string);
}
type ParserErrorCode = "UNSUPPORTED_SOURCE" | "PARSE_FAILED" | "EMPTY_SOURCE" | "FETCH_FAILED" | "PDF_TEXT_LAYER_MISSING";
interface ParserErrorSource {
    path?: string;
    url?: string;
    contentType?: string;
}
export declare class ParserError extends Error {
    readonly code: ParserErrorCode;
    readonly source: ParserErrorSource;
    constructor(code: ParserErrorCode, message: string, source?: ParserErrorSource);
}
export declare function errorMessage(error: unknown): string;
export {};
