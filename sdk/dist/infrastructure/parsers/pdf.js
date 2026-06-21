import { ParserError } from "../../domain/errors.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";
const defaultPdfParserFactory = async (data) => {
    // pdf-parse initializes optional native canvas polyfills at module load; defer it to PDF parsing so root SDK imports work without optional parser-native packages.
    const pdfParseModule = await import("pdf-parse");
    return new pdfParseModule.PDFParse({ data: binaryBuffer(data) });
};
let pdfParserFactory = defaultPdfParserFactory;
export function setPdfParserFactoryForTesting(factory) {
    pdfParserFactory = factory ?? defaultPdfParserFactory;
}
function binaryBuffer(data) {
    return Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}
async function destroyPdfParser(parser) {
    try {
        await parser?.destroy();
    }
    catch {
        // Parser cleanup is best-effort; it must not replace a successful parse result or the parser's source-aware error.
    }
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
        let parser;
        try {
            parser = await pdfParserFactory(input.bytes);
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
            throw error instanceof ParserError
                ? error
                : new ParserError("PARSE_FAILED", `PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`, sourceContext(input));
        }
        finally {
            await destroyPdfParser(parser);
        }
    }
}
