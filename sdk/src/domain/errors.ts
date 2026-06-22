export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

type ParserErrorCode =
  | "UNSUPPORTED_SOURCE"
  | "PARSE_FAILED"
  | "EMPTY_SOURCE"
  | "FETCH_FAILED"
  | "PDF_TEXT_LAYER_MISSING";

interface ParserErrorSource {
  path?: string;
  url?: string;
  contentType?: string;
}

export class ParserError extends Error {
  constructor(
    readonly code: ParserErrorCode,
    message: string,
    readonly source: ParserErrorSource = {},
  ) {
    super(`${code}: ${message}`);
    this.name = "ParserError";
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
