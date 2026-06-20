import { ParserError } from "../../domain/errors.js";
import type { ParsedSource, ParserSourceInput, SourceParser } from "../../domain/types.js";
import { DocxSourceParser } from "./docx.js";
import { HtmlSourceParser } from "./html.js";
import { JsonSourceParser } from "./json.js";
import { MarkdownSourceParser } from "./markdown.js";
import { PdfSourceParser } from "./pdf.js";
import { PptxSourceParser } from "./pptx.js";
import { resolveParserInput, sourceContext, type FormatParser } from "./shared.js";
import { TextSourceParser } from "./text.js";

export class CompositeSourceParser implements SourceParser {
  constructor(private readonly parsers: readonly FormatParser[] = [
    new MarkdownSourceParser(),
    new TextSourceParser(),
    new JsonSourceParser(),
    new HtmlSourceParser(),
    new PdfSourceParser(),
    new DocxSourceParser(),
    new PptxSourceParser(),
  ]) {}

  async parse(input: string | ParserSourceInput): Promise<ParsedSource> {
    const resolved = await resolveParserInput(input);
    const parser = this.parsers.find((candidate) => candidate.supports(resolved));
    if (parser === undefined) {
      throw new ParserError("UNSUPPORTED_SOURCE", "No source parser is registered for this input.", sourceContext(resolved));
    }
    return await parser.parse(resolved);
  }
}
