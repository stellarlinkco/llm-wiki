import { basename, dirname, extname, join, resolve } from "node:path";
import { ConfigurationError, errorMessage } from "../domain/errors.js";
import { FilesystemBundleStore } from "../infrastructure/filesystem-store.js";
import { LocalSearchAdapter } from "../infrastructure/local-search.js";
import { DefaultSourceParser } from "../infrastructure/source-parser.js";
import { fetchUrlInput } from "../infrastructure/parsers/url.js";
import { extractMarkdownLinks, isExternalLink, isBundleCitation, parseMarkdown, serializeMarkdown, toOkfFrontmatter, titleFromPath, validateReservedFile, } from "../infrastructure/markdown.js";
import { collectGuardedUpdateFailures, mergeWriteConceptFrontmatter } from "./okf-write-guards.js";
import { filterQueryAnswerText } from "./query-answer.js";
import { buildProgressiveIndexFiles } from "./index-catalog.js";
import { tokenize } from "./search.js";
import { boundedSlug, changeFailure, conceptsFromSynthesis, emptyChangeSet, extractSitemapLocations, failurePath, frontmatterMetadata, hasUrlScheme, publicResource, sha256, slugify, sourceBasename, sourceIdentity, toParserInput, } from "./helpers.js";
const DEFAULT_SYNTHESIS_PROMPT = 'Generate OKF concept documents as JSON. Return {"concepts":[{"path":"concepts/name.md","title":"...","description":"...","tags":["..."],"body":"...","sourcePaths":["sources/name.md"]}]} only.';
export class KnowledgeBase {
    root;
    llm;
    parser;
    searchAdapter;
    store;
    constructor(root, llm, parser, searchAdapter, store) {
        this.root = root;
        this.llm = llm;
        this.parser = parser;
        this.searchAdapter = searchAdapter;
        this.store = store;
    }
    static async create(options) {
        const store = options.store ?? new FilesystemBundleStore(resolve(options.root));
        const root = store.root;
        await store.init();
        await store.writeIfMissing("index.md", '---\nokf_version: "0.1"\n---\n\n# Knowledge Bundle\n\n- [Sources](sources/) - Ingested source documents.\n- [Concepts](concepts/) - Synthesized concepts.\n- [References](references/) - External references.\n');
        await store.writeIfMissing("log.md", "# Bundle Update Log\n");
        return new KnowledgeBase(root, options.llm, options.parser ?? new DefaultSourceParser(), options.search ?? new LocalSearchAdapter(store), store);
    }
    static async open(options) {
        const store = options.store ?? new FilesystemBundleStore(resolve(options.root));
        const root = store.root;
        const hasIndex = await store.exists("index.md");
        if (!hasIndex) {
            throw new ConfigurationError(`Bundle root does not exist: ${root}`);
        }
        return new KnowledgeBase(root, options.llm, options.parser ?? new DefaultSourceParser(), options.search ?? new LocalSearchAdapter(store), store);
    }
    async ingest(options) {
        return this.writeSource(options, "ingest");
    }
    async ingestMany(options) {
        const changeSet = emptyChangeSet("ingest");
        if (options.paths.length === 0) {
            return this.emptyIngestManyChangeSet(changeSet);
        }
        const seen = new Set();
        for (const path of options.paths) {
            const identity = sourceIdentity(toParserInput(path));
            if (seen.has(identity)) {
                continue;
            }
            seen.add(identity);
            this.mergeChangeSet(changeSet, await this.writeSource({ path }, "ingest", { deferReindex: true }));
        }
        await this.reindexBatch(changeSet);
        return changeSet;
    }
    async update(options) {
        return this.writeSource(options, "update");
    }
    async crawl(options) {
        const changeSet = emptyChangeSet("crawl");
        let sitemapUrl;
        try {
            sitemapUrl = new URL(options.sitemapUrl);
        }
        catch (error) {
            changeSet.failed.push(changeFailure(options.sitemapUrl, error));
            return changeSet;
        }
        let sitemapContent;
        try {
            sitemapContent = (await fetchUrlInput({ kind: "url", url: sitemapUrl.toString(), title: "Sitemap" })).content;
        }
        catch (error) {
            changeSet.failed.push(changeFailure(options.sitemapUrl, error));
            return changeSet;
        }
        const limit = options.limit ?? Number.POSITIVE_INFINITY;
        let ingested = 0;
        for (const url of extractSitemapLocations(sitemapContent)) {
            if (new URL(url).origin !== sitemapUrl.origin || ingested >= limit) {
                changeSet.skipped.push(url);
                continue;
            }
            const result = await this.ingest({ path: url });
            changeSet.created.push(...result.created);
            changeSet.updated.push(...result.updated);
            changeSet.deleted.push(...result.deleted);
            changeSet.skipped.push(...result.skipped);
            changeSet.failed.push(...result.failed);
            changeSet.warnings.push(...result.warnings);
            ingested += 1;
        }
        await this.appendLog("crawl", [
            `Sitemap: ${sitemapUrl.toString()}`,
            `Created: ${String(changeSet.created.length)}`,
            `Updated: ${String(changeSet.updated.length)}`,
            `Failed: ${String(changeSet.failed.length)}`,
        ]);
        return changeSet;
    }
    async writeConcept(options) {
        const changeSet = emptyChangeSet("writeConcept");
        const outputRel = this.conceptOutputPath(options.path);
        const existed = await this.store.exists(outputRel);
        const now = new Date().toISOString();
        const existingDocument = existed ? parseMarkdown(await this.store.read(outputRel)) : undefined;
        const frontmatter = mergeWriteConceptFrontmatter(existingDocument === undefined
            ? { type: options.type ?? "Concept" }
            : toOkfFrontmatter(existingDocument.frontmatter), options, now);
        const guardFailures = this.guardedWriteConceptFailures(options.guardedUpdate === true, existingDocument, frontmatter, options.body, options);
        if (guardFailures.length > 0) {
            changeSet.failed.push({
                path: outputRel,
                code: "guarded_update_rejected",
                error: `Guarded update rejected: ${guardFailures.join("; ")}.`,
            });
            return changeSet;
        }
        const document = serializeMarkdown(frontmatter, options.body);
        await this.store.write(outputRel, document);
        if (existed) {
            changeSet.updated.push(outputRel);
        }
        else {
            changeSet.created.push(outputRel);
        }
        await this.appendLog("writeConcept", [`${existed ? "Updated" : "Created"}: ${outputRel}`]);
        await this.reindex();
        return changeSet;
    }
    async writeIndex(options) {
        const changeSet = emptyChangeSet("writeIndex");
        const docs = await this.readConcepts();
        const entries = docs.map((doc) => ({
            path: doc.path,
            title: typeof doc.frontmatter.title === "string" && doc.frontmatter.title.trim() !== ""
                ? doc.frontmatter.title
                : titleFromPath(doc.path),
            type: doc.frontmatter.type,
        }));
        const indexFiles = buildProgressiveIndexFiles(entries, options);
        for (const [path, content] of [...indexFiles.entries()].sort(([left], [right]) => left.localeCompare(right))) {
            await this.store.write(path, content);
            changeSet.updated.push(path);
        }
        await this.appendLog("writeIndex", changeSet.updated.map((path) => `Updated: ${path}`));
        return changeSet;
    }
    async synthesize(options) {
        if (this.llm === undefined) {
            throw new ConfigurationError("LLM provider is required for synthesize().");
        }
        const changeSet = emptyChangeSet("synthesize");
        const limit = options.limit ?? 5;
        const retrieved = (await this.search(options.query, { limit: limit * 3 }))
            .filter((result) => result.type === "Source Document")
            .slice(0, limit);
        const contextBlocks = await Promise.all(retrieved.map(async (result) => {
            const content = await this.store.read(result.path);
            return `# ${result.path}\n${content}`;
        }));
        const systemContent = options.outputSchema !== undefined
            ? `${options.outputSchema}\n\n${options.systemPrompt ?? DEFAULT_SYNTHESIS_PROMPT}`
            : (options.systemPrompt ?? DEFAULT_SYNTHESIS_PROMPT);
        const response = await this.llm.generate({
            structuredOutput: { type: "json" },
            messages: [
                { role: "system", content: systemContent },
                {
                    role: "user",
                    content: `${options.instructions}\n\nUse only this bundle context:\n${contextBlocks.join("\n\n---\n\n")}`,
                },
            ],
        });
        const concepts = conceptsFromSynthesis(response.json ?? response.text);
        for (const concept of concepts) {
            try {
                const outputRel = this.conceptOutputPath(concept.path);
                const existed = await this.store.exists(outputRel);
                const result = await this.writeConcept({
                    ...concept,
                    frontmatter: { ...concept.frontmatter, generated_by: "llm-wiki-sdk" },
                    guardedUpdate: existed,
                });
                changeSet.created.push(...result.created);
                changeSet.updated.push(...result.updated);
                changeSet.failed.push(...result.failed);
                changeSet.warnings.push(...result.warnings);
            }
            catch (error) {
                changeSet.failed.push(changeFailure(concept.path, error));
            }
        }
        try {
            await this.appendLog("synthesize", [
                `Query: ${options.query}`,
                ...changeSet.created.map((path) => `Created: ${path}`),
                ...changeSet.updated.map((path) => `Updated: ${path}`),
            ]);
        }
        catch (error) {
            changeSet.warnings.push({ code: "log_update_failed", message: errorMessage(error) });
        }
        return changeSet;
    }
    async reindex() {
        const changeSet = emptyChangeSet("reindex");
        const docs = await this.readConcepts();
        const indexed = docs.map((doc) => ({
            path: doc.path,
            title: doc.frontmatter.title ?? titleFromPath(doc.path),
            type: doc.frontmatter.type,
            tags: doc.frontmatter.tags ?? [],
            content: doc.body,
            tokens: tokenize(`${doc.frontmatter.title ?? ""} ${doc.frontmatter.description ?? ""} ${doc.body}`),
        }));
        await this.searchAdapter.index(indexed);
        changeSet.updated.push(".llm-wiki/search-index.json");
        return changeSet;
    }
    async search(query, options = {}) {
        if (!(await this.searchAdapter.exists())) {
            await this.reindex();
        }
        return await this.searchAdapter.search(query, options);
    }
    async query(question, options = {}) {
        if (this.llm === undefined) {
            throw new ConfigurationError("LLM provider is required for query().");
        }
        const retrieved = await this.search(question, { limit: options.limit ?? 5 });
        const contextBlocks = await Promise.all(retrieved.map(async (result) => {
            const content = await this.store.read(result.path);
            return `# ${result.path}\n${content}`;
        }));
        const response = await this.llm.generate({
            messages: [
                {
                    role: "system",
                    content: "Answer questions using only the supplied OKF bundle context. Include citations to bundle-relative paths.",
                },
                {
                    role: "user",
                    content: `Question: ${question}\n\nContext:\n${contextBlocks.join("\n\n---\n\n")}`,
                },
            ],
        });
        const retrievedPaths = new Set(retrieved.map((result) => result.path));
        const filteredCitations = response.citations?.filter((citation) => isBundleCitation(citation) && retrievedPaths.has(citation)) ?? [];
        const answer = {
            text: filterQueryAnswerText(response.text, retrievedPaths),
            citations: filteredCitations,
            retrieved,
        };
        if (response.usage !== undefined) {
            answer.usage = response.usage;
        }
        return answer;
    }
    async validate() {
        const errors = [];
        const warnings = [];
        const markdownPaths = await this.store.listMarkdownPaths();
        for (const relPath of markdownPaths) {
            if (relPath.startsWith(".llm-wiki/")) {
                continue;
            }
            const content = await this.store.read(relPath);
            const parsed = parseMarkdown(content);
            this.validateMarkdownDocument(relPath, parsed, errors);
            await this.validateMarkdownLinks(relPath, parsed, errors, warnings);
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    async status() {
        const docs = await this.readConcepts();
        const concepts = docs.filter((doc) => doc.frontmatter.type !== "Source Document").length;
        const sourceDocuments = docs.filter((doc) => doc.frontmatter.type === "Source Document").length;
        return {
            root: this.root,
            concepts,
            sourceDocuments,
            documents: docs.length,
            searchIndexExists: await this.searchAdapter.exists(),
        };
    }
    async listConcepts(options = {}) {
        const concepts = await this.readConcepts();
        return options.type === undefined
            ? concepts
            : concepts.filter((concept) => concept.frontmatter.type === options.type);
    }
    async export(options) {
        const changeSet = emptyChangeSet("export");
        const relDest = this.store.relativePath(options.path);
        // If relativePath gave us back an absolute path, the store can't detect nesting;
        // treat it as outside the bundle.
        const canDetect = !relDest.startsWith("/");
        if (canDetect && (relDest === "" || (!relDest.startsWith("..") && relDest !== ".."))) {
            throw new ConfigurationError("Export destination must not be inside the bundle root.");
        }
        const copied = await this.store.exportTo(options.path, options.includeCache === true);
        changeSet.created.push(...copied);
        return changeSet;
    }
    async writeSource(options, operation, writeOptions) {
        const changeSet = emptyChangeSet(operation);
        const parserInput = toParserInput(options.path);
        const identity = sourceIdentity(parserInput);
        const resource = publicResource(parserInput);
        let parsedSource;
        try {
            parsedSource = await this.parser.parse(parserInput);
        }
        catch (error) {
            changeSet.failed.push(changeFailure(failurePath(parserInput, identity, resource), error));
            return changeSet;
        }
        const now = new Date().toISOString();
        const outputRel = await this.sourceOutputPath(identity, resource);
        const existed = await this.store.exists(outputRel);
        const existingFrontmatter = existed ? parseMarkdown(await this.store.read(outputRel)).frontmatter : {};
        const parserMetadata = frontmatterMetadata(parsedSource.metadata);
        const frontmatter = {
            ...toOkfFrontmatter({ type: "Source Document", ...existingFrontmatter }),
            ...parserMetadata,
            type: "Source Document",
            title: parsedSource.title,
            description: parsedSource.description,
            resource,
            tags: Array.isArray(existingFrontmatter.tags) ? existingFrontmatter.tags.map(String) : [],
            timestamp: now,
            source_id: sha256(identity),
            content_hash: sha256(parsedSource.body),
        };
        const document = serializeMarkdown(frontmatter, parsedSource.body);
        try {
            await this.store.write(outputRel, document);
        }
        catch (error) {
            changeSet.failed.push(changeFailure(failurePath(parserInput, identity, resource), error));
            return changeSet;
        }
        if (existed) {
            changeSet.updated.push(outputRel);
        }
        else {
            changeSet.created.push(outputRel);
        }
        await this.finalizeSourceWrite(changeSet, outputRel, operation, existed, writeOptions);
        return changeSet;
    }
    async finalizeSourceWrite(changeSet, outputRel, operation, existed, writeOptions) {
        try {
            await this.appendLog(operation, [`${existed ? "Updated" : "Created"}: ${outputRel}`]);
        }
        catch (error) {
            changeSet.warnings.push({ path: outputRel, code: "log_update_failed", message: errorMessage(error) });
        }
        if (writeOptions?.deferReindex === true) {
            return;
        }
        try {
            await this.reindex();
        }
        catch (error) {
            changeSet.warnings.push({ path: outputRel, code: "reindex_failed", message: errorMessage(error) });
        }
    }
    async readConcepts() {
        const markdownPaths = await this.store.listMarkdownPaths();
        const docs = [];
        for (const relPath of markdownPaths) {
            const name = basename(relPath);
            if (relPath.startsWith(".llm-wiki/") || name === "index.md" || name === "log.md") {
                continue;
            }
            const parsed = parseMarkdown(await this.store.read(relPath));
            if (typeof parsed.frontmatter.type !== "string" || parsed.frontmatter.type.trim() === "") {
                continue;
            }
            docs.push({ path: relPath, frontmatter: toOkfFrontmatter(parsed.frontmatter), body: parsed.body });
        }
        return docs.sort((a, b) => a.path.localeCompare(b.path));
    }
    async sourceOutputPath(sourceIdentity, resource) {
        const rawSlug = slugify(basename(sourceBasename(resource), extname(sourceBasename(resource))));
        const safeSlug = boundedSlug(rawSlug === "index" || rawSlug === "log" ? `source-${rawSlug}` : rawSlug, sourceIdentity);
        const slug = safeSlug;
        const candidate = `sources/${slug}.md`;
        if (!(await this.store.exists(candidate))) {
            return candidate;
        }
        const parsed = parseMarkdown(await this.store.read(candidate));
        if (this.sourceCandidateMatches(parsed.frontmatter, sourceIdentity, resource)) {
            return candidate;
        }
        const sourceId = sha256(sourceIdentity).slice(0, 12);
        return `sources/${slug}-${sourceId}.md`;
    }
    validateMarkdownDocument(relPath, parsed, errors) {
        const name = basename(relPath);
        if (name === "index.md" || name === "log.md") {
            this.validateReservedMarkdownFile(parsed, relPath, errors);
            return;
        }
        if (!parsed.hasFrontmatter) {
            errors.push({
                path: relPath,
                code: "missing_frontmatter",
                message: "Concept document must start with YAML frontmatter.",
            });
            return;
        }
        if (parsed.frontmatterError !== undefined) {
            errors.push({ path: relPath, code: "malformed_frontmatter", message: parsed.frontmatterError });
            return;
        }
        if (typeof parsed.frontmatter.type !== "string" || parsed.frontmatter.type.trim() === "") {
            errors.push({
                path: relPath,
                code: "missing_type",
                message: "Concept document frontmatter must include a non-empty type field.",
            });
        }
    }
    validateReservedMarkdownFile(parsed, relPath, errors) {
        if (parsed.frontmatterError !== undefined) {
            errors.push({ path: relPath, code: "malformed_frontmatter", message: parsed.frontmatterError });
            return;
        }
        validateReservedFile(parsed, relPath, errors);
    }
    async validateMarkdownLinks(relPath, parsed, errors, warnings) {
        for (const target of extractMarkdownLinks(parsed.body)) {
            await this.validateMarkdownLink(relPath, parsed, target, errors, warnings);
        }
    }
    async validateMarkdownLink(relPath, parsed, target, errors, warnings) {
        if (isExternalLink(target) || target.startsWith("#") || sourceDocumentUsesUrl(parsed.frontmatter)) {
            return;
        }
        const targetRel = internalLinkTarget(relPath, target);
        if (targetRel === undefined) {
            return;
        }
        if (targetRel.startsWith("..")) {
            errors.push({
                path: relPath,
                code: "link_outside_bundle",
                message: `Internal link escapes bundle root: ${target}`,
            });
            return;
        }
        if (!(await this.store.exists(targetRel))) {
            warnings.push({ path: relPath, code: "broken_link", message: `Broken internal link: ${target}` });
        }
    }
    sourceCandidateMatches(frontmatter, sourceIdentity, resource) {
        return (this.sourceCandidateMatchesIdentity(frontmatter, sourceIdentity) ||
            this.sourceCandidateMatchesUrlResource(frontmatter, resource));
    }
    sourceCandidateMatchesIdentity(frontmatter, sourceIdentity) {
        return (frontmatter.source_id === sha256(sourceIdentity) ||
            frontmatter.source_path === sourceIdentity ||
            frontmatter.resource === sourceIdentity);
    }
    sourceCandidateMatchesUrlResource(frontmatter, resource) {
        return (hasUrlScheme(resource) &&
            frontmatter.source_id === undefined &&
            (frontmatter.source_path === resource || frontmatter.resource === resource));
    }
    guardedWriteConceptFailures(guardedUpdate, existingDocument, nextFrontmatter, nextBody, options) {
        if (!guardedUpdate || existingDocument === undefined) {
            return [];
        }
        return collectGuardedUpdateFailures(existingDocument.frontmatter, existingDocument.body, nextFrontmatter, nextBody, options);
    }
    emptyIngestManyChangeSet(changeSet) {
        changeSet.warnings.push({
            path: "ingestMany",
            code: "empty_paths",
            message: "ingestMany received an empty paths array; no files were ingested.",
        });
        return changeSet;
    }
    mergeChangeSet(target, source) {
        target.created.push(...source.created);
        target.updated.push(...source.updated);
        target.deleted.push(...source.deleted);
        target.skipped.push(...source.skipped);
        target.failed.push(...source.failed);
        target.warnings.push(...source.warnings);
    }
    async reindexBatch(changeSet) {
        if (changeSet.created.length === 0 && changeSet.updated.length === 0) {
            return;
        }
        try {
            await this.reindex();
        }
        catch (error) {
            changeSet.warnings.push({
                path: "ingestMany",
                code: "reindex_failed",
                message: errorMessage(error),
            });
        }
    }
    conceptOutputPath(path) {
        const relPath = path.startsWith("/") ? path.slice(1) : path;
        if (relPath.includes("..") || !relPath.startsWith("concepts/") || !relPath.endsWith(".md")) {
            throw new ConfigurationError("Concept path must be a markdown file inside concepts/.");
        }
        return relPath;
    }
    async appendLog(operation, lines) {
        const logRel = "log.md";
        const current = (await this.store.exists(logRel)) ? await this.store.read(logRel) : "# Bundle Update Log\n";
        const entry = [`\n## ${new Date().toISOString().slice(0, 10)}`, `* **${operation}**: ${lines.join("; ")}`].join("\n");
        await this.store.write(logRel, `${current.trimEnd()}\n${entry}\n`);
    }
}
function sourceDocumentUsesUrl(frontmatter) {
    const sourceUrl = typeof frontmatter.resource === "string" ? frontmatter.resource : frontmatter.source_path;
    return typeof sourceUrl === "string" && hasUrlScheme(sourceUrl);
}
function internalLinkTarget(relPath, target) {
    const targetWithoutFragment = target.split("#", 1)[0] ?? "";
    if (targetWithoutFragment === "") {
        return undefined;
    }
    return targetWithoutFragment.startsWith("/")
        ? targetWithoutFragment.slice(1)
        : join(dirname(relPath), targetWithoutFragment);
}
