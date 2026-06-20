import { ParserError } from "../../domain/errors.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";
async function createPdfParser(data) {
    // pdf-parse initializes optional native canvas polyfills at module load; defer it to PDF parsing so root SDK imports work without optional parser-native packages.
    const { PDFParse } = await import("pdf-parse");
    return new PDFParse({ data: Buffer.from(data) });
}
export class PdfSourceParser {
    name = "pdf";
    supports(input) {
        const contentType = mediaType(input);
        if (hasKnownMediaType(contentType)) {
            return contentType === "application/pdf";
        }
        return extension(input) === ".pdf";
    }
    async parse(input) {
        const parser = await createPdfParser(input.bytes);
        try {
            const result = await parser.getText();
            const text = result.text
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line !== "" && !/^-- \d+ of \d+ --$/.test(line))
                .join("\n")
                .trim();
            if (text === "") {
                throw new ParserError("PDF_TEXT_LAYER_MISSING", "PDF does not contain an extractable text layer.", sourceContext(input));
            }
            const description = text
                .split(/\r?\n/)
                .map((line) => line.trim())
                .find((line) => line !== "") ?? "PDF source";
            return parsedMarkdown(input, this.name, sourceName(input), text, description, { page_count: result.total });
        }
        catch (error) {
            if (error instanceof ParserError) {
                throw error;
            }
            throw new ParserError("PARSE_FAILED", `PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`, sourceContext(input));
        }
        finally {
            await parser.destroy();
        }
    }
}
