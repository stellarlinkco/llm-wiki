import { ParserError } from "../../domain/errors.js";
import type { ParsedSource } from "../../domain/types.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";

export class JsonSourceParser implements FormatParser {
  readonly name = "json";

  supports(input: ResolvedParserInput): boolean {
    const contentType = mediaType(input);
    if (hasKnownMediaType(contentType)) {
      return contentType === "application/json" || contentType?.endsWith("+json") === true;
    }
    return extension(input) === ".json";
  }

  async parse(input: ResolvedParserInput): Promise<ParsedSource> {
    try {
      const parsed = JSON.parse(input.content) as unknown;
      const formatted = JSON.stringify(parsed, null, 2);
      return parsedMarkdown(input, this.name, sourceName(input), `\`\`\`json\n${formatted}\n\`\`\``);
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError("PARSE_FAILED", `Invalid JSON source: ${error instanceof Error ? error.message : String(error)}`, sourceContext(input));
    }
  }
}
