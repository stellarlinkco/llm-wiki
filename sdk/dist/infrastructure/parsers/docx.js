import mammoth from "mammoth";
import TurndownService from "turndown";
import { ParserError } from "../../domain/errors.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";
const DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export class DocxSourceParser {
    name = "docx";
    supports(input) {
        const contentType = mediaType(input);
        if (hasKnownMediaType(contentType)) {
            return contentType === DOCX_CONTENT_TYPE;
        }
        return extension(input) === ".docx";
    }
    async parse(input) {
        try {
            const result = await mammoth.convertToHtml({ buffer: Buffer.from(input.bytes) });
            const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
            const markdown = turndown.turndown(result.value).trim();
            const warningMessages = result.messages
                .map((message) => message.message.trim())
                .filter((message) => message !== "");
            const metadata = warningMessages.length === 0 ? undefined : { warnings: warningMessages };
            return parsedMarkdown(input, this.name, sourceName(input), markdown, undefined, metadata);
        }
        catch (error) {
            if (error instanceof ParserError) {
                throw error;
            }
            throw new ParserError("PARSE_FAILED", `DOCX parsing failed: ${error instanceof Error ? error.message : String(error)}`, sourceContext(input));
        }
    }
}
