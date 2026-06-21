import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { ParserError } from "../../domain/errors.js";
import type { ParsedSource } from "../../domain/types.js";
import type { FormatParser, ResolvedParserInput } from "./shared.js";
import { extension, hasKnownMediaType, mediaType, parsedMarkdown, sourceContext, sourceName } from "./shared.js";

export class HtmlSourceParser implements FormatParser {
  readonly name = "html";

  supports(input: ResolvedParserInput): boolean {
    const contentType = mediaType(input);
    if (hasKnownMediaType(contentType)) {
      return contentType === "text/html" || contentType === "application/xhtml+xml";
    }
    const ext = extension(input);
    return ext === ".html" || ext === ".htm";
  }

  parse(input: ResolvedParserInput): Promise<ParsedSource> {
    try {
      return Promise.resolve(parseHtmlSource(input, this.name));
    } catch (error) {
      if (error instanceof ParserError) {
        return Promise.reject(error);
      }
      return Promise.reject(
        new ParserError(
          "PARSE_FAILED",
          `HTML parsing failed: ${error instanceof Error ? error.message : String(error)}`,
          sourceContext(input),
        ),
      );
    }
  }
}

function parseHtmlSource(input: ResolvedParserInput, parserName: string): ParsedSource {
  const dom = new JSDOM(input.content, { url: input.url });
  const article = new Readability(dom.window.document.cloneNode(true) as Document).parse();
  const turndown = createTurndownService(dom.window.document.baseURI);
  const title = resolveHtmlTitle(input, dom, article);
  const fallbackDocument = dom.window.document.cloneNode(true) as Document;
  fallbackDocument.querySelectorAll("script,style,noscript").forEach((node) => {
    node.remove();
  });
  const markdown = htmlToMarkdown(turndown, article, fallbackDocument);
  return parsedMarkdown(input, parserName, title, markdown, article?.excerpt?.trim());
}

function createTurndownService(baseUri: string): TurndownService {
  const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  turndown.addRule("safe-links", {
    filter: (node) => node.nodeName === "A",
    replacement: (content, node) => {
      const element = node as Element;
      const rawHref = element.getAttribute("href");
      const href = safeHref(rawHref, baseUri);
      return href === "" ? content : `[${content}](${href})`;
    },
  });
  return turndown;
}

function resolveHtmlTitle(input: ResolvedParserInput, dom: JSDOM, article: ReturnType<Readability["parse"]>): string {
  return (
    input.title ??
    firstText(
      dom.window.document.querySelector("h1")?.textContent,
      article?.title,
      dom.window.document.title,
      sourceName(input),
    )
  );
}

function htmlToMarkdown(
  turndown: TurndownService,
  article: ReturnType<Readability["parse"]>,
  fallbackDocument: Document,
): string {
  const html = article?.content ?? fallbackDocument.body.innerHTML;
  let markdown = turndown.turndown(html).trim();
  if (markdown === "") {
    markdown = fallbackDocument.body.textContent.trim();
  }
  return markdown;
}

function stripControlChars(value: string): string {
  let result = "";
  for (const char of value) {
    if (char.charCodeAt(0) > 0x20) {
      result += char;
    }
  }
  return result;
}

function isDangerousHref(href: string): boolean {
  const normalized = stripControlChars(href).toLowerCase();
  return normalized.startsWith("javascript:") || normalized.startsWith("data:") || normalized.startsWith("vbscript:");
}

function safeHref(rawHref: string | null, base: string): string {
  if (rawHref === null) {
    return "";
  }
  try {
    if (!base.startsWith("http://") && !base.startsWith("https://")) {
      return isDangerousHref(rawHref) ? "" : rawHref;
    }
    const url = new URL(rawHref, base);
    if (url.protocol === "file:") {
      return isDangerousHref(rawHref) ? "" : rawHref;
    }
    const href = url.toString();
    return isDangerousHref(href) ? "" : href;
  } catch {
    return "";
  }
}

function firstText(...values: (string | undefined | null)[]): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed !== undefined && trimmed !== "") {
      return trimmed;
    }
  }
  return "Source";
}
