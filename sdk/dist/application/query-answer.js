import { extractBundleCitationMentions, isExternalLink, normalizeBundleCitationPath, } from "../infrastructure/markdown.js";
export function filterQueryAnswerText(text, retrievedPaths) {
    let filtered = stripDisallowedQueryMarkdownLinks(text, retrievedPaths);
    filtered = stripDisallowedQueryAutolinks(filtered, retrievedPaths);
    for (const mention of extractBundleCitationMentions(filtered)) {
        if (!retrievedPaths.has(mention.path)) {
            filtered = filtered.replaceAll(mention.raw, "");
        }
    }
    return filtered;
}
function stripDisallowedQueryMarkdownLinks(text, retrievedPaths) {
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
        }
        else {
            result += text.slice(linkStart, segment.end + 1);
        }
        cursor = segment.end + 1;
    }
    return result;
}
function stripDisallowedQueryAutolinks(text, retrievedPaths) {
    return text.replace(/<([^>\s]+)>/g, (match, inner) => {
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
function parseInlineMarkdownLink(content, linkStart) {
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
        }
        else if (char === ")") {
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
function parseMarkdownLinkDestinationForQuery(raw) {
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
function shouldStripQueryMarkdownLink(target, retrievedPaths) {
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
