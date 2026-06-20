import { ParserError } from "../../domain/errors.js";
import type { ParsedSource } from "../../domain/types.js";
import { firstPlainLine, normalizeSourceBody } from "../markdown.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";

const TEXT_EXTENSIONS: Record<string, true> = { ".txt": true, ".text": true, ".log": true, ".csv": true, ".tsv": true };

export class TextSourceParser implements FormatParser {
  readonly name = "text";

  supports(input: ResolvedParserInput): boolean {
    const contentType = mediaType(input);
    if (hasKnownMediaType(contentType)) {
      return contentType === "text/plain";
    }
    return input.kind === "text" || TEXT_EXTENSIONS[extension(input)] === true;
  }

  async parse(input: ResolvedParserInput): Promise<ParsedSource> {
    const content = normalizeSourceBody(input.content).trim();
    if (content === "") {
      throw new ParserError("EMPTY_SOURCE", "Plain text source did not contain meaningful text.", sourceContext(input));
    }
    const fence = content.includes("```") ? "````" : "```";
    const body = `${fence}text\n${content}\n${fence}`;
    return parsedMarkdown(input, this.name, sourceName(input), body, firstPlainLine(content));
  }
}
