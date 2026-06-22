import {
  extractBundleCitationMentions,
  isExternalLink,
  normalizeBundleCitationPath,
} from "../infrastructure/markdown.js";

const BARE_EXTERNAL_URL_PATTERN = /(^|[\s([{:])((?:[a-z][a-z0-9+.-]*:\/\/|\/\/)[^\s<>"'`)\]}]+)/gi;

interface InlineMarkdownLink {
  end: number;
  label: string;
  target: string;
}

export function filterQueryAnswerText(text: string, retrievedPaths: Set<string>): string {
  let filtered = stripDisallowedQueryMarkdownLinks(text, retrievedPaths);
  filtered = stripDisallowedQueryHtmlLinks(filtered, retrievedPaths);
  filtered = stripDisallowedQueryBareExternalUrls(stripDisallowedQueryAutolinks(filtered, retrievedPaths));
  for (const mention of extractBundleCitationMentions(filtered)) {
    if (!retrievedPaths.has(mention.path)) {
      filtered = filtered.replaceAll(mention.raw, "");
    }
  }
  return filtered;
}

function stripDisallowedQueryHtmlLinks(text: string, retrievedPaths: Set<string>): string {
  return text.replace(
    /<a\b[^>]*\bhref\s*=\s*(?:(["'])([^"']*)\1|([^\s"'=<>`]+))[^>]*>([\s\S]*?)<\/a>/gi,
    (
      match,
      quote: string | undefined,
      quotedHref: string | undefined,
      unquotedHref: string | undefined,
      label: string,
    ) => {
      void quote;
      const href = quotedHref ?? unquotedHref ?? "";
      return shouldStripQueryMarkdownLink(href.trim(), retrievedPaths) ? label : match;
    },
  );
}

function stripDisallowedQueryMarkdownLinks(text: string, retrievedPaths: Set<string>): string {
  let result = "";
  let cursor = 0;
  while (cursor < text.length) {
    const linkStart = text.indexOf("[", cursor);
    if (linkStart === -1) {
      result += text.slice(cursor);
      break;
    }
    result += text.slice(cursor, linkStart);
    const segment = parseInlineMarkdownLink(text, linkStart);
    if (segment === undefined) {
      result += text.charAt(linkStart);
      cursor = linkStart + 1;
      continue;
    }
    if (shouldStripQueryMarkdownLink(segment.target, retrievedPaths)) {
      result += segment.label;
    } else {
      result += text.slice(linkStart, segment.end + 1);
    }
    cursor = segment.end + 1;
  }
  return result;
}

function stripDisallowedQueryAutolinks(text: string, retrievedPaths: Set<string>): string {
  return text.replace(/<([^>\s]+)>/g, (match, inner: string) => {
    if (isExternalLink(inner)) {
      return "";
    }
    const bundlePath = normalizeBundleCitationPath(inner);
    if (bundlePath !== undefined && !retrievedPaths.has(bundlePath)) {
      return "";
    }
    return match;
  });
}

function stripDisallowedQueryBareExternalUrls(text: string): string {
  return text.replace(BARE_EXTERNAL_URL_PATTERN, (_match: string, prefix: string, url: string) => {
    const trailingPunctuation = externalUrlTrailingPunctuation(url);
    return `${prefix}${trailingPunctuation}`;
  });
}

function externalUrlTrailingPunctuation(url: string): string {
  let index = url.length;
  while (index > 0 && /[.,!?;:]/.test(url.charAt(index - 1))) {
    index -= 1;
  }
  return url.slice(index);
}

function parseInlineMarkdownLink(content: string, linkStart: number): InlineMarkdownLink | undefined {
  const mid = content.indexOf("](", linkStart);
  if (mid === -1) {
    return undefined;
  }
  const label = content.slice(linkStart + 1, mid);
  const destStart = mid + 2;
  let depth = 0;
  let end = -1;
  for (let index = destStart; index < content.length; index += 1) {
    const char = content[index];
    if (char === "\\") {
      index += 1;
      continue;
    }
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      if (depth === 0) {
        end = index;
        break;
      }
      depth -= 1;
    }
  }
  if (end === -1) {
    return undefined;
  }
  const target = parseMarkdownLinkDestinationForQuery(content.slice(destStart, end));
  if (target === "") {
    return undefined;
  }
  return { end, label, target };
}

function parseMarkdownLinkDestinationForQuery(raw: string): string {
  let destination = raw.trim();
  if (destination.startsWith("<")) {
    const close = destination.indexOf(">");
    if (close === -1) {
      return "";
    }
    destination = destination.slice(1, close).trim();
  }
  const titleOffset = destination.search(/\s/);
  if (titleOffset !== -1) {
    destination = destination.slice(0, titleOffset).trim();
  }
  return destination.replace(/\\([()])/g, "$1");
}

function shouldStripQueryMarkdownLink(target: string, retrievedPaths: Set<string>): boolean {
  if (target.startsWith("#")) {
    return false;
  }
  if (isExternalLink(target)) {
    return true;
  }
  const bundlePath = normalizeBundleCitationPath(target);
  if (bundlePath === undefined) {
    return false;
  }
  return !retrievedPaths.has(bundlePath);
}
