import { extractBundleCitations, extractMarkdownLinks, normalizeBundleCitationPath, toOkfFrontmatter, } from "../infrastructure/markdown.js";
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
    else if (options.frontmatter?.source_paths === undefined && existingFrontmatter.source_paths !== undefined) {
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
export function collectSynthesizeGuardedUpdateFailures(existingFrontmatter, concept) {
    if (existingFrontmatter === undefined) {
        return [];
    }
    const normalizedExisting = toOkfFrontmatter(existingFrontmatter);
    const failures = [
        ...synthesizeFrontmatterFailures(normalizedExisting, concept.frontmatter),
        ...synthesizeTopLevelMetadataFailures(normalizedExisting, concept),
    ];
    return [...new Set(failures)];
}
function synthesizeFrontmatterFailures(existingFrontmatter, proposedFrontmatter) {
    if (proposedFrontmatter === undefined) {
        return [];
    }
    const proposed = toOkfFrontmatter(proposedFrontmatter);
    const failures = [];
    for (const [key, value] of Object.entries(existingFrontmatter)) {
        if (key === "timestamp") {
            continue;
        }
        if (!(key in proposed) || !frontmatterValuesEqual(value, proposed[key])) {
            failures.push(key);
        }
    }
    return failures;
}
function synthesizeTopLevelMetadataFailures(existingFrontmatter, concept) {
    return [
        synthesizeMetadataFailure("type", existingFrontmatter.type, concept.type),
        synthesizeMetadataFailure("description", existingFrontmatter.description, concept.description),
        synthesizeMetadataFailure("tags", existingFrontmatter.tags, concept.tags),
        synthesizeMetadataFailure("source_paths", existingFrontmatter.source_paths, concept.sourcePaths),
    ].filter((failure) => failure !== undefined);
}
function synthesizeMetadataFailure(key, existingValue, proposedValue) {
    if (proposedValue === undefined || existingValue === undefined) {
        return undefined;
    }
    return frontmatterValuesEqual(existingValue, proposedValue) ? undefined : key;
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
    for (const match of prose.matchAll(/^(#{1,2})\s+(.+)$/gm)) {
        const marker = match[1] ?? "#";
        const heading = match[2]?.trim();
        if (heading === undefined || heading === "") {
            continue;
        }
        const key = `${marker} ${heading}`;
        if (!headings.includes(key)) {
            headings.push(key);
        }
    }
    return headings;
}
function stripFencedCodeBlocks(body) {
    const lines = body.split("\n");
    const prose = [];
    let index = 0;
    while (index < lines.length) {
        const fence = parseFence(lines[index] ?? "");
        if (fence === undefined) {
            prose.push(lines[index] ?? "");
            index++;
            continue;
        }
        index++;
        while (index < lines.length && !closesFence(lines[index] ?? "", fence)) {
            index++;
        }
        if (index < lines.length) {
            index++;
        }
    }
    return prose.join("\n");
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
        if (isGuardedBundleCitation(link)) {
            citations.add(link);
        }
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
    return normalizeBundleCitationPath(citation) ?? citation;
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
    return stableJsonStringify(left) === stableJsonStringify(right);
}
function stableJsonStringify(value) {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableJsonStringify(entry)).join(",")}]`;
    }
    const record = value;
    const keys = Object.keys(record).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJsonStringify(record[key])}`).join(",")}}`;
}
function isGuardedBundleCitation(link) {
    return normalizeBundleCitationPath(link) !== undefined;
}
function schemaLikeHeading(line) {
    const match = /^(#{1,2})\s+(.+?)\s*$/.exec(line);
    if (match === null) {
        return undefined;
    }
    const marker = match[1] ?? "#";
    const text = match[2]?.trim() ?? "";
    if (text === "" || !/schema/i.test(text)) {
        return undefined;
    }
    return { marker, heading: text };
}
function schemaBlockKey(block) {
    return `${block.marker} ${block.heading.toLowerCase()}`;
}
function schemaBlockPreserved(existingLines, nextLines) {
    if (nextLines.length < existingLines.length) {
        return false;
    }
    for (let index = 0; index < existingLines.length; index++) {
        if (nextLines[index] !== existingLines[index]) {
            return false;
        }
    }
    return true;
}
function skipBlankLines(lines, startIndex) {
    let index = startIndex;
    while (index < lines.length && (lines[index]?.trim() ?? "") === "") {
        index++;
    }
    return index;
}
function parseFence(line) {
    const match = /^(?: {0,3})(`{3,}|~{3,})/.exec(line);
    if (match === null) {
        return undefined;
    }
    const marker = match[1] ?? "```";
    return { character: marker[0], length: marker.length };
}
function closesFence(line, fence) {
    const escaped = fence.character === "`" ? "`" : "~";
    const pattern = new RegExp(`^(?: {0,3})${escaped}{${String(fence.length)},}\\s*$`);
    return pattern.test(line);
}
function readFencedBlockContent(lines, openFenceIndex) {
    const fence = parseFence(lines[openFenceIndex] ?? "");
    if (fence === undefined) {
        return undefined;
    }
    const contentLines = [];
    let index = openFenceIndex + 1;
    while (index < lines.length) {
        const line = lines[index] ?? "";
        if (closesFence(line, fence)) {
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
        const heading = schemaLikeHeading(lines[i] ?? "");
        if (heading === undefined) {
            continue;
        }
        const openFenceIndex = skipBlankLines(lines, i + 1);
        const contentLines = readFencedBlockContent(lines, openFenceIndex);
        if (contentLines === undefined) {
            continue;
        }
        blocks.push({ marker: heading.marker, heading: heading.heading, lines: contentLines });
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
        const key = schemaBlockKey(block);
        const list = nextByHeading.get(key) ?? [];
        list.push(block);
        nextByHeading.set(key, list);
    }
    const consumed = new Map();
    for (const existing of existingBlocks) {
        const key = schemaBlockKey(existing);
        const index = consumed.get(key) ?? 0;
        const candidates = nextByHeading.get(key) ?? [];
        const next = candidates[index];
        consumed.set(key, index + 1);
        if (next === undefined) {
            failures.push(`"${existing.heading}" fenced block would be removed`);
            continue;
        }
        if (!schemaBlockPreserved(existing.lines, next.lines)) {
            if (next.lines.length < existing.lines.length) {
                failures.push(`"${existing.heading}" fenced block would shrink (${String(existing.lines.length)} -> ${String(next.lines.length)} lines)`);
            }
            else {
                failures.push(`"${existing.heading}" fenced block content would change`);
            }
        }
    }
    return failures;
}
