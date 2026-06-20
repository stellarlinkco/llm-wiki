export class ConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConfigurationError";
    }
}
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}
export class ParserError extends Error {
    code;
    source;
    constructor(code, message, source = {}) {
        super(`${code}: ${message}`);
        this.code = code;
        this.source = source;
        this.name = "ParserError";
    }
}
export function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
