import { basename, dirname, extname, join, resolve } from "node:path";

import type {
  BundleStore,
  ChangeSet,
  ConceptDocument,
  CrawlOptions,
  ExportOptions,
  IngestOptions,
  KnowledgeBaseOptions,
  ListConceptOptions,
  LLMProvider,
  OkfFrontmatter,
  ParsedSource,
  ParserSourceInput,
  QueryAnswer,
  QueryOptions,
  SearchAdapter,
  SearchOptions,
  SearchResult,
  SourceParser,
  StatusReport,
  SynthesizeOptions,
  ValidationFinding,
  ValidationReport,
  WriteConceptOptions,
  WriteIndexOptions,
} from "../domain/types.js";
import { ConfigurationError, ParserError, errorMessage } from "../domain/errors.js";
import { FilesystemBundleStore } from "../infrastructure/filesystem-store.js";
import { LocalSearchAdapter } from "../infrastructure/local-search.js";
import { DefaultSourceParser } from "../infrastructure/source-parser.js";
import { fetchUrlInput } from "../infrastructure/parsers/url.js";
import {
  extractMarkdownLinks,
  isExternalLink,
  isBundleCitation,
  parseMarkdown,
  serializeMarkdown,
  toOkfFrontmatter,
  titleFromPath,
  validateReservedFile,
} from "../infrastructure/markdown.js";
import { tokenize } from "./search.js";
import {
  boundedSlug,
  changeFailure,
  conceptsFromSynthesis,
  emptyChangeSet,
  extractSitemapLocations,
  failurePath,
  frontmatterMetadata,
  hasUrlScheme,
  publicResource,
  sha256,
  slugify,
  sourceBasename,
  sourceIdentity,
  toParserInput,
} from "./helpers.js";

const DEFAULT_SYNTHESIS_PROMPT =
  'Generate OKF concept documents as JSON. Return {"concepts":[{"path":"concepts/name.md","title":"...","description":"...","tags":["..."],"body":"...","sourcePaths":["sources/name.md"]}]} only.';

export class KnowledgeBase {
  private constructor(
    private readonly root: string,
    private readonly llm: LLMProvider | undefined,
    private readonly parser: SourceParser,
    private readonly searchAdapter: SearchAdapter,
    private readonly store: BundleStore,
  ) {}

  static async create(options: KnowledgeBaseOptions): Promise<KnowledgeBase> {
    const store = options.store ?? new FilesystemBundleStore(resolve(options.root));
    const root = store.root;
    await store.init();
    await store.writeIfMissing(
      "index.md",
      '---\nokf_version: "0.1"\n---\n\n# Knowledge Bundle\n\n- [Sources](sources/) - Ingested source documents.\n- [Concepts](concepts/) - Synthesized concepts.\n- [References](references/) - External references.\n',
    );
    await store.writeIfMissing("log.md", "# Bundle Update Log\n");
    return new KnowledgeBase(
      root,
      options.llm,
      options.parser ?? new DefaultSourceParser(),
      options.search ?? new LocalSearchAdapter(store),
      store,
    );
  }

  static async open(options: KnowledgeBaseOptions): Promise<KnowledgeBase> {
    const store = options.store ?? new FilesystemBundleStore(resolve(options.root));
    const root = store.root;
    const hasIndex = await store.exists("index.md");
    if (!hasIndex) {
      throw new ConfigurationError(`Bundle root does not exist: ${root}`);
    }
    return new KnowledgeBase(
      root,
      options.llm,
      options.parser ?? new DefaultSourceParser(),
      options.search ?? new LocalSearchAdapter(store),
      store,
    );
  }

  async ingest(options: IngestOptions): Promise<ChangeSet> {
    return this.writeSource(options, "ingest");
  }

  async update(options: IngestOptions): Promise<ChangeSet> {
    return this.writeSource(options, "update");
  }

  async crawl(options: CrawlOptions): Promise<ChangeSet> {
    const changeSet = emptyChangeSet("crawl");
    let sitemapUrl: URL;
    try {
      sitemapUrl = new URL(options.sitemapUrl);
    } catch (error) {
      changeSet.failed.push(changeFailure(options.sitemapUrl, error));
      return changeSet;
    }
    let sitemapContent: string;
    try {
      sitemapContent = (await fetchUrlInput({ kind: "url", url: sitemapUrl.toString(), title: "Sitemap" })).content;
    } catch (error) {
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
      `Created: ${changeSet.created.length}`,
      `Updated: ${changeSet.updated.length}`,
      `Failed: ${changeSet.failed.length}`,
    ]);
    return changeSet;
  }

  async writeConcept(options: WriteConceptOptions): Promise<ChangeSet> {
    const changeSet = emptyChangeSet("writeConcept");
    const outputRel = this.conceptOutputPath(options.path);
    const existed = await this.store.exists(outputRel);
    const now = new Date().toISOString();
    const frontmatter: OkfFrontmatter = {
      ...toOkfFrontmatter({ type: options.type ?? "Concept", ...options.frontmatter }),
      type: options.type ?? "Concept",
      title: options.title,
      ...(options.description === undefined ? {} : { description: options.description }),
      tags: options.tags ?? [],
      timestamp: now,
      ...(options.sourcePaths === undefined ? {} : { source_paths: options.sourcePaths }),
    };
    const document = serializeMarkdown(frontmatter, options.body);
    await this.store.write(outputRel, document);
    if (existed) {
      changeSet.updated.push(outputRel);
    } else {
      changeSet.created.push(outputRel);
    }
    await this.appendLog("writeConcept", [`${existed ? "Updated" : "Created"}: ${outputRel}`]);
    await this.reindex();
    return changeSet;
  }

  async writeIndex(options: WriteIndexOptions): Promise<ChangeSet> {
    const changeSet = emptyChangeSet("writeIndex");
    const docs = await this.readConcepts();
    const sourceDocs = docs.filter((doc) => doc.frontmatter.type === "Source Document");
    const conceptDocs = docs.filter((doc) => doc.frontmatter.type !== "Source Document");
    const body = [
      `# ${options.title}`,
      "",
      ...(options.description === undefined ? [] : [options.description, ""]),
      "## Sources",
      "",
      ...sourceDocs.map(
        (doc) => `- [${doc.frontmatter.title ?? titleFromPath(doc.path)}](${doc.path}) — ${doc.frontmatter.type}`,
      ),
      "",
      "## Concepts",
      "",
      ...conceptDocs.map(
        (doc) => `- [${doc.frontmatter.title ?? titleFromPath(doc.path)}](${doc.path}) — ${doc.frontmatter.type}`,
      ),
    ].join("\n");
    await this.store.write("index.md", `---\nokf_version: "0.1"\n---\n\n${body.trimEnd()}\n`);
    changeSet.updated.push("index.md");
    await this.appendLog("writeIndex", ["Updated: index.md"]);
    return changeSet;
  }

  async synthesize(options: SynthesizeOptions): Promise<ChangeSet> {
    if (this.llm === undefined) {
      throw new ConfigurationError("LLM provider is required for synthesize().");
    }
    const changeSet = emptyChangeSet("synthesize");
    const limit = options.limit ?? 5;
    const retrieved = (await this.search(options.query, { limit: limit * 3 }))
      .filter((result) => result.type === "Source Document")
      .slice(0, limit);
    const contextBlocks = await Promise.all(
      retrieved.map(async (result) => {
        const content = await this.store.read(result.path);
        return `# ${result.path}\n${content}`;
      }),
    );
    const systemContent =
      options.outputSchema !== undefined
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
        const result = await this.writeConcept({
          ...concept,
          frontmatter: { ...concept.frontmatter, generated_by: "llm-wiki-sdk" },
        });
        changeSet.created.push(...result.created);
        changeSet.updated.push(...result.updated);
        changeSet.warnings.push(...result.warnings);
      } catch (error) {
        changeSet.failed.push(changeFailure(concept.path, error));
      }
    }
    try {
      await this.appendLog("synthesize", [
        `Query: ${options.query}`,
        ...changeSet.created.map((path) => `Created: ${path}`),
        ...changeSet.updated.map((path) => `Updated: ${path}`),
      ]);
    } catch (error) {
      changeSet.warnings.push({ code: "log_update_failed", message: errorMessage(error) });
    }
    return changeSet;
  }

  async reindex(): Promise<ChangeSet> {
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

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!(await this.searchAdapter.exists())) {
      await this.reindex();
    }
    return await this.searchAdapter.search(query, options);
  }

  async query(question: string, options: QueryOptions = {}): Promise<QueryAnswer> {
    if (this.llm === undefined) {
      throw new ConfigurationError("LLM provider is required for query().");
    }
    const retrieved = await this.search(question, { limit: options.limit ?? 5 });
    const contextBlocks = await Promise.all(
      retrieved.map(async (result) => {
        const content = await this.store.read(result.path);
        return `# ${result.path}\n${content}`;
      }),
    );
    const response = await this.llm.generate({
      messages: [
        {
          role: "system",
          content:
            "Answer questions using only the supplied OKF bundle context. Include citations to bundle-relative paths.",
        },
        {
          role: "user",
          content: `Question: ${question}\n\nContext:\n${contextBlocks.join("\n\n---\n\n")}`,
        },
      ],
    });
    const retrievedPaths = new Set(retrieved.map((result) => result.path));
    const answer: QueryAnswer = {
      text: response.text,
      citations:
        response.citations?.filter((citation) => isBundleCitation(citation) && retrievedPaths.has(citation)) ?? [],
      retrieved,
    };
    if (response.usage !== undefined) {
      answer.usage = response.usage;
    }
    return answer;
  }

  async validate(): Promise<ValidationReport> {
    const errors: ValidationFinding[] = [];
    const warnings: ValidationFinding[] = [];
    const markdownPaths = await this.store.listMarkdownPaths();

    for (const relPath of markdownPaths) {
      if (relPath.startsWith(".llm-wiki/")) {
        continue;
      }
      const name = basename(relPath);
      const content = await this.store.read(relPath);
      const parsed = parseMarkdown(content);

      if (name === "index.md" || name === "log.md") {
        if (parsed.frontmatterError !== undefined) {
          errors.push({ path: relPath, code: "malformed_frontmatter", message: parsed.frontmatterError });
        } else {
          validateReservedFile(parsed, relPath, errors);
        }
      } else if (!parsed.hasFrontmatter) {
        errors.push({
          path: relPath,
          code: "missing_frontmatter",
          message: "Concept document must start with YAML frontmatter.",
        });
      } else if (parsed.frontmatterError !== undefined) {
        errors.push({ path: relPath, code: "malformed_frontmatter", message: parsed.frontmatterError });
      } else if (typeof parsed.frontmatter.type !== "string" || parsed.frontmatter.type.trim() === "") {
        errors.push({
          path: relPath,
          code: "missing_type",
          message: "Concept document frontmatter must include a non-empty type field.",
        });
      }

      for (const target of extractMarkdownLinks(parsed.body)) {
        if (isExternalLink(target) || target.startsWith("#")) {
          continue;
        }
        const targetWithoutFragment = target.split("#", 1)[0] ?? "";
        if (targetWithoutFragment === "") {
          continue;
        }
        const sourceUrl =
          typeof parsed.frontmatter.resource === "string"
            ? parsed.frontmatter.resource
            : parsed.frontmatter.source_path;
        if (typeof sourceUrl === "string" && hasUrlScheme(sourceUrl)) {
          continue;
        }
        const targetRel = targetWithoutFragment.startsWith("/")
          ? targetWithoutFragment.slice(1)
          : join(dirname(relPath), targetWithoutFragment);
        if (targetRel.startsWith("..")) {
          errors.push({
            path: relPath,
            code: "link_outside_bundle",
            message: `Internal link escapes bundle root: ${target}`,
          });
          continue;
        }
        if (!(await this.store.exists(targetRel))) {
          warnings.push({ path: relPath, code: "broken_link", message: `Broken internal link: ${target}` });
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async status(): Promise<StatusReport> {
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

  async listConcepts(options: ListConceptOptions = {}): Promise<ConceptDocument[]> {
    const concepts = await this.readConcepts();
    return options.type === undefined
      ? concepts
      : concepts.filter((concept) => concept.frontmatter.type === options.type);
  }

  async export(options: ExportOptions): Promise<ChangeSet> {
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

  private async writeSource(options: IngestOptions, operation: "ingest" | "update"): Promise<ChangeSet> {
    const changeSet = emptyChangeSet(operation);
    const parserInput = toParserInput(options.path);
    const identity = sourceIdentity(parserInput);
    const resource = publicResource(parserInput);

    let parsedSource: ParsedSource;
    try {
      parsedSource = await this.parser.parse(parserInput);
    } catch (error) {
      changeSet.failed.push(changeFailure(failurePath(parserInput, identity, resource), error));
      return changeSet;
    }

    const now = new Date().toISOString();
    const outputRel = await this.sourceOutputPath(identity, resource);
    const existed = await this.store.exists(outputRel);
    const existingFrontmatter = existed ? parseMarkdown(await this.store.read(outputRel)).frontmatter : {};
    const parserMetadata = frontmatterMetadata(parsedSource.metadata);
    const frontmatter: OkfFrontmatter = {
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
    } catch (error) {
      changeSet.failed.push(changeFailure(failurePath(parserInput, identity, resource), error));
      return changeSet;
    }

    if (existed) {
      changeSet.updated.push(outputRel);
    } else {
      changeSet.created.push(outputRel);
    }

    try {
      await this.appendLog(operation, [`${existed ? "Updated" : "Created"}: ${outputRel}`]);
    } catch (error) {
      changeSet.warnings.push({ path: outputRel, code: "log_update_failed", message: errorMessage(error) });
    }
    try {
      await this.reindex();
    } catch (error) {
      changeSet.warnings.push({ path: outputRel, code: "reindex_failed", message: errorMessage(error) });
    }

    return changeSet;
  }

  private async readConcepts(): Promise<ConceptDocument[]> {
    const markdownPaths = await this.store.listMarkdownPaths();
    const docs: ConceptDocument[] = [];
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

  private async sourceOutputPath(sourceIdentity: string, resource: string): Promise<string> {
    const rawSlug = slugify(basename(sourceBasename(resource), extname(sourceBasename(resource))));
    const safeSlug = boundedSlug(
      rawSlug === "index" || rawSlug === "log" ? `source-${rawSlug}` : rawSlug,
      sourceIdentity,
    );
    const slug = safeSlug;
    const candidate = `sources/${slug}.md`;
    if (!(await this.store.exists(candidate))) {
      return candidate;
    }

    const parsed = parseMarkdown(await this.store.read(candidate));
    if (
      parsed.frontmatter.source_id === sha256(sourceIdentity) ||
      parsed.frontmatter.source_path === sourceIdentity ||
      parsed.frontmatter.resource === sourceIdentity ||
      (hasUrlScheme(resource) &&
        parsed.frontmatter.source_id === undefined &&
        (parsed.frontmatter.source_path === resource || parsed.frontmatter.resource === resource))
    ) {
      return candidate;
    }

    const sourceId = sha256(sourceIdentity).slice(0, 12);
    return `sources/${slug}-${sourceId}.md`;
  }

  private conceptOutputPath(path: string): string {
    const relPath = path.startsWith("/") ? path.slice(1) : path;
    if (relPath.includes("..") || !relPath.startsWith("concepts/") || !relPath.endsWith(".md")) {
      throw new ConfigurationError("Concept path must be a markdown file inside concepts/.");
    }
    return relPath;
  }

  private async appendLog(operation: string, lines: string[]): Promise<void> {
    const logRel = "log.md";
    const current = (await this.store.exists(logRel)) ? await this.store.read(logRel) : "# Bundle Update Log\n";
    const entry = [`\n## ${new Date().toISOString().slice(0, 10)}`, `* **${operation}**: ${lines.join("; ")}`].join(
      "\n",
    );
    await this.store.write(logRel, `${current.trimEnd()}\n${entry}\n`);
  }
}
