import { ParserError } from "../../domain/errors.js";
import type { ParsedSource } from "../../domain/types.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";

async function createPdfParser(
  data: Buffer,
): Promise<{ getText(): Promise<{ text: string; total: number }>; destroy(): Promise<void> }> {
  // pdf-parse initializes optional native canvas polyfills at module load; defer it to PDF parsing so root SDK imports work without optional parser-native packages.
  const { PDFParse } = await import("pdf-parse");
  return new PDFParse({ data });
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
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(
        "PARSE_FAILED",
        `PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`,
        sourceContext(input),
      );
    } finally {
      await parser.destroy();
    }
  }
}
