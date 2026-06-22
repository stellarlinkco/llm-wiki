import { titleFromPath } from "../infrastructure/markdown.js";
const INDEX_FRONTMATTER = '---\nokf_version: "0.1"\n---\n\n';
const ROOT_AREAS = ["sources", "concepts", "references"];
export function buildProgressiveIndexFiles(entries, options) {
    const sortedEntries = [...entries].sort((left, right) => left.path.localeCompare(right.path));
    const files = new Map();
    const rootLines = [`# ${options.title}`, ""];
    if (options.description !== undefined) {
        rootLines.push(options.description, "");
    }
    rootLines.push("## Browse", "");
    for (const area of ROOT_AREAS) {
        const areaEntries = sortedEntries.filter((entry) => entry.path.startsWith(`${area}/`));
        if (areaEntries.length === 0) {
            continue;
        }
        const subdirectoryCount = countImmediateSubdirectories(area, areaEntries);
        const summary = subdirectoryCount === 0
            ? documentCountLabel(areaEntries.length)
            : `${documentCountLabel(areaEntries.length)} in ${areaCountLabel(subdirectoryCount)}`;
        rootLines.push(`- [${capitalizeArea(area)}](${area}/index.md) — ${summary}`);
    }
    files.set("index.md", `${INDEX_FRONTMATTER}${rootLines.join("\n").trimEnd()}\n`);
    for (const area of ROOT_AREAS) {
        const areaEntries = sortedEntries.filter((entry) => entry.path.startsWith(`${area}/`));
        if (areaEntries.length === 0) {
            continue;
        }
        buildDirectoryIndexes(files, area, areaEntries);
    }
    return files;
}
function buildDirectoryIndexes(files, directory, entries) {
    const subdirectories = listImmediateSubdirectories(directory, entries);
    const documents = listImmediateDocuments(directory, entries);
    const lines = [`# ${capitalizeArea(directory.split("/").at(-1) ?? directory)}`];
    if (subdirectories.length > 0) {
        lines.push("", "## Subdirectories", "");
        for (const subdirectory of subdirectories) {
            const childDirectory = `${directory}/${subdirectory}`;
            const childEntries = entries.filter((entry) => entry.path.startsWith(`${childDirectory}/`));
            lines.push(`- [${capitalizeArea(subdirectory)}](${subdirectory}/index.md) — ${documentCountLabel(childEntries.length)}`);
            buildDirectoryIndexes(files, childDirectory, childEntries);
        }
    }
    if (documents.length > 0) {
        lines.push("", "## Documents", "");
        for (const document of documents) {
            const linkTarget = document.path.slice(directory.length + 1);
            lines.push(`- [${document.title}](${linkTarget}) — ${document.type}`);
        }
    }
    files.set(`${directory}/index.md`, `${INDEX_FRONTMATTER}${lines.join("\n").trimEnd()}\n`);
}
function listImmediateSubdirectories(directory, entries) {
    const subdirectories = new Set();
    const prefix = `${directory}/`;
    for (const entry of entries) {
        if (!entry.path.startsWith(prefix)) {
            continue;
        }
        const remainder = entry.path.slice(prefix.length);
        const slashIndex = remainder.indexOf("/");
        if (slashIndex !== -1) {
            subdirectories.add(remainder.slice(0, slashIndex));
        }
    }
    return [...subdirectories].sort((left, right) => left.localeCompare(right));
}
function listImmediateDocuments(directory, entries) {
    const prefix = `${directory}/`;
    return entries.filter((entry) => {
        if (!entry.path.startsWith(prefix)) {
            return false;
        }
        return !entry.path.slice(prefix.length).includes("/");
    });
}
function countImmediateSubdirectories(directory, entries) {
    return listImmediateSubdirectories(directory, entries).length;
}
function documentCountLabel(count) {
    return `${String(count)} document${count === 1 ? "" : "s"}`;
}
function areaCountLabel(count) {
    return `${String(count)} area${count === 1 ? "" : "s"}`;
}
function capitalizeArea(value) {
    if (value === "") {
        return value;
    }
    return titleFromPath(value);
}
