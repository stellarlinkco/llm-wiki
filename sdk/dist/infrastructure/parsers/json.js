import { ParserError } from "../../domain/errors.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";
export class JsonSourceParser {
    name = "json";
    supports(input) {
        const contentType = mediaType(input);
        if (hasKnownMediaType(contentType)) {
            return contentType === "application/json" || contentType?.endsWith("+json") === true;
        }
        return extension(input) === ".json";
    }
    parse(input) {
        try {
            const parsed = JSON.parse(input.content);
            const formatted = JSON.stringify(parsed, null, 2);
            return Promise.resolve(parsedMarkdown(input, this.name, sourceName(input), `\`\`\`json\n${formatted}\n\`\`\``));
        }
        catch (error) {
            if (error instanceof ParserError) {
                throw error;
            }
            throw new ParserError("PARSE_FAILED", `Invalid JSON source: ${error instanceof Error ? error.message : String(error)}`, sourceContext(input));
        }
    }
}
