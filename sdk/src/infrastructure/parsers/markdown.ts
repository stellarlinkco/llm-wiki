import type { ParsedSource } from "../../domain/types.js";
import { extractTitle } from "../markdown.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceName } from "./shared.js";

export class MarkdownSourceParser implements FormatParser {
  readonly name = "markdown";

  supports(input: ResolvedParserInput): boolean {
    const contentType = mediaType(input);
    if (hasKnownMediaType(contentType)) {
      return contentType === "text/markdown";
    }
    const ext = extension(input);
    return ext === ".md" || ext === ".markdown" || ext === ".mdx";
  }

  parse(input: ResolvedParserInput): Promise<ParsedSource> {
    const title = input.title ?? extractTitle(input.content, input.path ?? sourceName(input));
    return Promise.resolve(parsedMarkdown(input, this.name, title, input.content));
  }
}
