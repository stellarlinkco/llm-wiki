import { extractTitle } from "../markdown.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceName } from "./shared.js";
export class MarkdownSourceParser {
    name = "markdown";
    supports(input) {
        const contentType = mediaType(input);
        if (hasKnownMediaType(contentType)) {
            return contentType === "text/markdown";
        }
        const ext = extension(input);
        return ext === ".md" || ext === ".markdown" || ext === ".mdx";
    }
    async parse(input) {
        const title = input.title ?? extractTitle(input.content, input.path ?? sourceName(input));
        return parsedMarkdown(input, this.name, title, input.content);
    }
}
