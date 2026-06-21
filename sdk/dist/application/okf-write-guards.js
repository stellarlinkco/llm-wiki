import { extractBundleCitations, extractMarkdownLinks, isBundleCitation, toOkfFrontmatter, } from "../infrastructure/markdown.js";
export function mergeWriteConceptFrontmatter(existingFrontmatter, options, now) {
    const type = resolveWriteConceptType(options, existingFrontmatter);
    const requestedFrontmatter = toOkfFrontmatter({
        type,
        ...options.frontmatter,
    });
    const frontmatter = {
        ...existingFrontmatter,
        ...requestedFrontmatter,
        type,
        title: options.title,
        timestamp: now,
        tags: resolveWriteConceptTags(existingFrontmatter, options),
    };
    if (options.description !== undefined) {
        frontmatter.description = options.description;
    }
    else if (options.frontmatter?.description === undefined && existingFrontmatter.description !== undefined) {
        frontmatter.description = existingFrontmatter.description;
    }
    if (options.sourcePaths !== undefined) {
        frontmatter.source_paths = options.sourcePaths;
    }
    else if (options.frontmatter?.source_paths === undefined &&
        existingFrontmatter.source_paths !== undefined) {
        frontmatter.source_paths = existingFrontmatter.source_paths;
    }
    return frontmatter;
}
export function collectGuardedUpdateFailures(existingFrontmatter, existingBody, nextFrontmatter, nextBody, options) {
    const failures = [];
    const normalizedExisting = toOkfFrontmatter(existingFrontmatter);
    const frontmatterFailures = guardedFrontmatterFailures(normalizedExisting, nextFrontmatter, options);
    if (frontmatterFailures.length > 0) {
        failures.push(`frontmatter keys would change or be dropped: ${frontmatterFailures.join(", ")}`);
    }
    const droppedHeadings = topLevelHeadings(existingBody).filter((heading) => !topLevelHeadings(nextBody).includes(heading));
    if (droppedHeadings.length > 0) {
        failures.push(`top-level headings would be dropped: ${droppedHeadings.join(", ")}`);
    }
    const existingCitations = canonicalGuardedCitationSet(existingBody);
    const nextCitations = canonicalGuardedCitationSet(nextBody);
    const droppedCitations = [...existingCitations].filter((citation) => !nextCitations.has(citation));
    if (droppedCitations.length > 0) {
        failures.push(`citations would be dropped: ${droppedCitations.join(", ")}`);
    }
    const schemaFailures = schemaLikeSectionFailures(existingBody, nextBody);
    if (schemaFailures.length > 0) {
        failures.push(`schema-like fenced sections would shrink: ${schemaFailures.join(", ")}`);
    }
    return failures;
}
function resolveWriteConceptType(options, existingFrontmatter) {
    if (options.type !== undefined) {
        return options.type;
    }
    const frontmatterType = options.frontmatter?.type;
    if (typeof frontmatterType === "string") {
        return frontmatterType;
    }
    return existingFrontmatter.type;
}
function resolveWriteConceptTags(existingFrontmatter, options) {
    if (options.tags !== undefined) {
        return options.tags;
    }
    if (options.frontmatter?.tags !== undefined) {
        return toOkfFrontmatter({ type: "Concept", tags: options.frontmatter.tags }).tags ?? [];
    }
    return existingFrontmatter.tags ?? [];
}
function explicitFrontmatterKeys(options) {
    const keys = new Set(["title"]);
    if (options.type !== undefined) {
        keys.add("type");
    }
    if (options.description !== undefined) {
        keys.add("description");
    }
    if (options.tags !== undefined) {
        keys.add("tags");
    }
    if (options.sourcePaths !== undefined) {
        keys.add("source_paths");
    }
    for (const key of Object.keys(options.frontmatter ?? {})) {
        keys.add(key);
    }
    return keys;
}
function protectedFrontmatterKeys(frontmatter) {
    return Object.keys(frontmatter).filter((key) => key !== "timestamp");
}
function topLevelHeadings(body) {
    const headings = [];
    const prose = stripFencedCodeBlocks(body);
    for (const match of prose.matchAll(/^#{1,2}\s+(.+)$/gm)) {
        const heading = match[1]?.trim();
        if (heading !== undefined && heading !== "" && !headings.includes(heading)) {
            headings.push(heading);
        }
    }
    return headings;
}
function stripFencedCodeBlocks(body) {
    return body.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "");
}
function stripInlineCode(body) {
    return body.replace(/`[^`\n]+`/g, "");
}
function bundleCitations(body) {
    const prose = stripInlineCode(stripFencedCodeBlocks(body));
    const citations = new Set();
    for (const link of extractMarkdownLinks(prose)) {
        if (isGuardedBundleCitation(link)) {
            citations.add(link);
        }
    }
    for (const link of extractHtmlBundleLinks(prose)) {
        citations.add(link);
    }
    for (const link of extractReferenceLinkTargets(prose)) {
        if (isGuardedBundleCitation(link)) {
            citations.add(link);
        }
    }
    for (const citation of extractBundleCitations(prose)) {
        citations.add(citation);
    }
    return [...citations];
}
function extractReferenceLinkTargets(body) {
    const targets = [];
    for (const match of body.matchAll(/^\s*\[[^\]]+\]:\s+(.+?)\s*$/gm)) {
        const destination = parseReferenceDestination(match[1] ?? "");
        if (destination !== "") {
            targets.push(destination);
        }
    }
    return targets;
}
function parseReferenceDestination(raw) {
    let destination = raw.trim();
    if (destination.startsWith("<")) {
        const end = destination.indexOf(">");
        if (end === -1) {
            return "";
        }
        return destination.slice(1, end).trim();
    }
    const titleOffset = destination.search(/\s+(?:"[^"]*"|'[^']*'|\([^)]*\))\s*$/);
    if (titleOffset !== -1) {
        destination = destination.slice(0, titleOffset).trim();
    }
    return destination.split(/\s+/)[0] ?? "";
}
function extractHtmlBundleLinks(body) {
    const links = [];
    for (const match of body.matchAll(/\bhref\s*=\s*(["'])([^"']+)\1/gi)) {
        const href = match[2]?.trim();
        if (href !== undefined && href !== "") {
            links.push(href);
        }
    }
    return links;
}
function canonicalGuardedCitationSet(body) {
    return new Set(bundleCitations(body).map(canonicalGuardedCitation));
}
function canonicalGuardedCitation(citation) {
    if (isBundleCitation(citation)) {
        return citation;
    }
    const rootRelative = /^\/((?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md)$/.exec(citation);
    if (rootRelative?.[1] !== undefined) {
        return rootRelative[1];
    }
    const relative = /^(?:\.\.\/)+((?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md)$/.exec(citation);
    if (relative?.[1] !== undefined) {
        return relative[1];
    }
    return citation;
}
function guardedFrontmatterFailures(existingFrontmatter, nextFrontmatter, options) {
    const failures = [];
    const explicitKeys = explicitFrontmatterKeys(options);
    const normalizedNext = toOkfFrontmatter(nextFrontmatter);
    for (const key of protectedFrontmatterKeys(existingFrontmatter)) {
        if (!(key in normalizedNext)) {
            failures.push(key);
            continue;
        }
        if (explicitKeys.has(key)) {
            if (key === "tags" && isExplicitTagClearing(existingFrontmatter.tags, normalizedNext.tags, options)) {
                failures.push(key);
            }
            continue;
        }
        if (!frontmatterValuesEqual(existingFrontmatter[key], normalizedNext[key])) {
            failures.push(key);
        }
    }
    return failures;
}
function requestedTags(options) {
    if (options.tags !== undefined) {
        return options.tags;
    }
    if (options.frontmatter !== undefined && "tags" in options.frontmatter) {
        return options.frontmatter.tags;
    }
    return undefined;
}
function isExplicitTagClearing(existingTags, nextTags, options) {
    const explicitTags = requestedTags(options);
    if (explicitTags === undefined) {
        return false;
    }
    return Array.isArray(existingTags) && existingTags.length > 0 && Array.isArray(nextTags) && nextTags.length === 0;
}
function frontmatterValuesEqual(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}
function isGuardedBundleCitation(link) {
    return (isBundleCitation(link) ||
        /^\/(?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md$/.test(link) ||
        /^(?:\.\.\/)+(?:sources|concepts|references)\/[A-Za-z0-9._~/%+-]+\.md$/.test(link));
}
function schemaLikeHeadingText(line) {
    const match = /^(#{1,2})\s+(.+?)\s*$/.exec(line);
    if (match === null) {
        return undefined;
    }
    const text = match[2]?.trim() ?? "";
    if (text === "" || !/schema/i.test(text)) {
        return undefined;
    }
    return text;
}
function skipBlankLines(lines, startIndex) {
    let index = startIndex;
    while (index < lines.length && (lines[index]?.trim() ?? "") === "") {
        index++;
    }
    return index;
}
function readFencedBlockContent(lines, openFenceIndex) {
    const openFence = lines[openFenceIndex];
    if (!openFence?.startsWith("```")) {
        return undefined;
    }
    const contentLines = [];
    let index = openFenceIndex + 1;
    while (index < lines.length) {
        const line = lines[index] ?? "";
        if (/^```\s*$/.test(line)) {
            return contentLines;
        }
        contentLines.push(line);
        index++;
    }
    return undefined;
}
function extractSchemaLikeFencedBlocks(body) {
    const lines = body.split("\n");
    const blocks = [];
    for (let i = 0; i < lines.length; i++) {
        const heading = schemaLikeHeadingText(lines[i] ?? "");
        if (heading === undefined) {
            continue;
        }
        const openFenceIndex = skipBlankLines(lines, i + 1);
        const contentLines = readFencedBlockContent(lines, openFenceIndex);
        if (contentLines === undefined) {
            continue;
        }
        blocks.push({ heading, lines: contentLines });
        i = openFenceIndex + contentLines.length + 1;
    }
    return blocks;
}
function schemaLikeSectionFailures(existingBody, nextBody) {
    const failures = [];
    const existingBlocks = extractSchemaLikeFencedBlocks(existingBody);
    const nextBlocks = extractSchemaLikeFencedBlocks(nextBody);
    const nextByHeading = new Map();
    for (const block of nextBlocks) {
        const key = block.heading.toLowerCase();
        const list = nextByHeading.get(key) ?? [];
        list.push(block);
        nextByHeading.set(key, list);
    }
    const consumed = new Map();
    for (const existing of existingBlocks) {
        const key = existing.heading.toLowerCase();
        const index = consumed.get(key) ?? 0;
        const candidates = nextByHeading.get(key) ?? [];
        const next = candidates[index];
        consumed.set(key, index + 1);
        if (next === undefined) {
            failures.push(`"${existing.heading}" fenced block would be removed`);
            continue;
        }
        if (next.lines.length < existing.lines.length) {
            failures.push(`"${existing.heading}" fenced block would shrink (${String(existing.lines.length)} -> ${String(next.lines.length)} lines)`);
        }
    }
    return failures;
}
