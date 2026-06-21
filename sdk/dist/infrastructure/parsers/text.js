import { ParserError } from "../../domain/errors.js";
import { firstPlainLine, normalizeSourceBody } from "../markdown.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";
const TEXT_EXTENSIONS = { ".txt": true, ".text": true, ".log": true, ".csv": true, ".tsv": true };
export class TextSourceParser {
    name = "text";
    supports(input) {
        const contentType = mediaType(input);
        if (hasKnownMediaType(contentType)) {
            return contentType === "text/plain";
        }
        return input.kind === "text" || TEXT_EXTENSIONS[extension(input)] === true;
    }
    parse(input) {
        const content = normalizeSourceBody(input.content).trim();
        if (content === "") {
            return Promise.reject(new ParserError("EMPTY_SOURCE", "Plain text source did not contain meaningful text.", sourceContext(input)));
        }
        const fence = content.includes("```") ? "````" : "```";
        const body = `${fence}text\n${content}\n${fence}`;
        return Promise.resolve(parsedMarkdown(input, this.name, sourceName(input), body, firstPlainLine(content)));
    }
}
