import { ParserError } from "../../domain/errors.js";
import type { ParsedSource } from "../../domain/types.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";

interface PdfParser {
  getText(): Promise<{ text: string; total: number }>;
  destroy(): Promise<void>;
}
type PdfParserFactory = (data: Uint8Array) => Promise<PdfParser>;

const defaultPdfParserFactory: PdfParserFactory = async (data) => {
  // pdf-parse initializes optional native canvas polyfills at module load; defer it to PDF parsing so root SDK imports work without optional parser-native packages.
  const pdfParseModule = await import("pdf-parse");
  return new pdfParseModule.PDFParse({ data: binaryBuffer(data) });
};

let pdfParserFactory: PdfParserFactory = defaultPdfParserFactory;

export function setPdfParserFactoryForTesting(factory: PdfParserFactory | undefined): void {
  pdfParserFactory = factory ?? defaultPdfParserFactory;
}

function binaryBuffer(data: Uint8Array): Buffer {
  return Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}

async function destroyPdfParser(parser: PdfParser | undefined): Promise<void> {
  try {
    await parser?.destroy();
  } catch {
    // Parser cleanup is best-effort; it must not replace a successful parse result or the parser's source-aware error.
  }
}

export class PdfSourceParser implements FormatParser {
  readonly name = "pdf";

  supports(input: ResolvedParserInput): boolean {
    const contentType = mediaType(input);
    if (hasKnownMediaType(contentType)) {
      return contentType === "application/pdf";
    }
    return extension(input) === ".pdf";
  }

  async parse(input: ResolvedParserInput): Promise<ParsedSource> {
    let parser: PdfParser | undefined;
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
        throw new ParserError(
          "PDF_TEXT_LAYER_MISSING",
          "PDF does not contain an extractable text layer.",
          sourceContext(input),
        );
      }
      const description =
        text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .find((line) => line !== "") ?? "PDF source";
      return parsedMarkdown(input, this.name, sourceName(input), text, description, { page_count: result.total });
    } catch (error) {
      throw error instanceof ParserError
        ? error
        : new ParserError(
            "PARSE_FAILED",
            `PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`,
            sourceContext(input),
          );
    } finally {
      await destroyPdfParser(parser);
    }
  }
}
