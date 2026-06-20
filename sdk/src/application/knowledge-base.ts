import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { ConfigurationError, ParserError, errorMessage } from "../domain/errors.js";
import type {
  ChangeSet,
  ConceptDocument,
  ExportOptions,
  IndexedDocument,
  IngestOptions,
  CrawlOptions,
  KnowledgeBaseOptions,
  ListConceptOptions,
  QueryAnswer,
  QueryOptions,
  SearchAdapter,
  SearchOptions,
  SearchResult,
  ParserSourceInput,
  ParsedSource,
  SourceParser,
  ValidationFinding,
  ValidationReport,
  StatusReport,
  LLMProvider,
  OkfFrontmatter,
  WriteConceptOptions,
  SynthesizeOptions,
  WriteIndexOptions,
} from "../domain/types.js";
import { copyBundleFiles, atomicWrite, ensureDir, exists, listMarkdownFiles, writeIfMissing } from "../infrastructure/filesystem.js";
import {
  extractMarkdownLinks,
  isBundleCitation,
  isExternalLink,
  parseMarkdown,
  serializeMarkdown,
  titleFromPath,
  toOkfFrontmatter,
  validateReservedFile,
} from "../infrastructure/markdown.js";
import { LocalSearchAdapter } from "../infrastructure/local-search.js";
import { DefaultSourceParser } from "../infrastructure/source-parser.js";
import { fetchUrlInput } from "../infrastructure/parsers/url.js";
import { tokenize } from "./search.js";

export class KnowledgeBase {
  private constructor(
    private readonly root: string,
    private readonly llm: LLMProvider | undefined,
    private readonly parser: SourceParser,
    private readonly searchAdapter: SearchAdapter,
  ) {}

  static async create(options: KnowledgeBaseOptions): Promise<KnowledgeBase> {
    const root = resolve(options.root);
    await ensureDir(root);
    await Promise.all([
      ensureDir(join(root, "sources")),
      ensureDir(join(root, "concepts")),
      ensureDir(join(root, "references")),
      ensureDir(join(root, ".llm-wiki")),
    ]);

    await writeIfMissing(join(root, "index.md"), "---\nokf_version: \"0.1\"\n---\n\n# Knowledge Bundle\n\n- [Sources](sources/) - Ingested source documents.\n- [Concepts](concepts/) - Synthesized concepts.\n- [References](references/) - External references.\n");
    await writeIfMissing(join(root, "log.md"), "# Bundle Update Log\n");

    return new KnowledgeBase(root, options.llm, options.parser ?? new DefaultSourceParser(), options.search ?? new LocalSearchAdapter(root));
  }

  static async open(options: KnowledgeBaseOptions): Promise<KnowledgeBase> {
    const root = resolve(options.root);
    await stat(root);
    return new KnowledgeBase(root, options.llm, options.parser ?? new DefaultSourceParser(), options.search ?? new LocalSearchAdapter(root));
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
    await this.appendLog("crawl", [`Sitemap: ${sitemapUrl.toString()}`, `Created: ${changeSet.created.length}`, `Updated: ${changeSet.updated.length}`, `Failed: ${changeSet.failed.length}`]);
    return changeSet;
  }

  async writeConcept(options: WriteConceptOptions): Promise<ChangeSet> {
    const changeSet = emptyChangeSet("writeConcept");
    const outputPath = this.conceptOutputPath(options.path);
    const relativeOutput = this.relativePath(outputPath);
    const existed = await exists(outputPath);
    const now = new Date().toISOString();
    const frontmatter: OkfFrontmatter = {
      ...toOkfFrontmatter({ type: "Concept", ...options.frontmatter }),
      type: "Concept",
      title: options.title,
      ...(options.description === undefined ? {} : { description: options.description }),
      tags: options.tags ?? [],
      timestamp: now,
      ...(options.sourcePaths === undefined ? {} : { source_paths: options.sourcePaths }),
    };
    const document = serializeMarkdown(frontmatter, options.body);
    await ensureDir(dirname(outputPath));
    await atomicWrite(outputPath, document);
    if (existed) {
      changeSet.updated.push(relativeOutput);
    } else {
      changeSet.created.push(relativeOutput);
    }
    await this.appendLog("writeConcept", [`${existed ? "Updated" : "Created"}: ${relativeOutput}`]);
    await this.reindex();
    return changeSet;
  }

  async writeIndex(options: WriteIndexOptions): Promise<ChangeSet> {
    const changeSet = emptyChangeSet("writeIndex");
    const docs = await this.readConcepts();
    const sourceDocs = docs.filter((doc) => doc.frontmatter.type === "Source Document");
    const conceptDocs = docs.filter((doc) => doc.frontmatter.type === "Concept");
    const body = [
      `# ${options.title}`,
      "",
      ...(options.description === undefined ? [] : [options.description, ""]),
      "## Sources",
      "",
      ...sourceDocs.map((doc) => `- [${doc.frontmatter.title ?? titleFromPath(doc.path)}](${doc.path}) — ${doc.frontmatter.type}`),
      "",
      "## Concepts",
      "",
      ...conceptDocs.map((doc) => `- [${doc.frontmatter.title ?? titleFromPath(doc.path)}](${doc.path}) — ${doc.frontmatter.type}`),
    ].join("\n");
    await atomicWrite(join(this.root, "index.md"), `---\nokf_version: "0.1"\n---\n\n${body.trimEnd()}\n`);
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
    const retrieved = (await this.search(options.query, { limit: limit * 3 })).filter((result) => result.type === "Source Document").slice(0, limit);
    const contextBlocks = await Promise.all(retrieved.map(async (result) => {
      const absolutePath = join(this.root, result.path);
      const content = await readFile(absolutePath, "utf8");
      return `# ${result.path}\n${content}`;
    }));
    const response = await this.llm.generate({
      structuredOutput: { type: "json" },
      messages: [
        {
          role: "system",
          content: "Generate OKF concept documents as JSON. Return {\"concepts\":[{\"path\":\"concepts/name.md\",\"title\":\"...\",\"description\":\"...\",\"tags\":[\"...\"],\"body\":\"...\",\"sourcePaths\":[\"sources/name.md\"]}]} only.",
        },
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
      await this.appendLog("synthesize", [`Query: ${options.query}`, ...changeSet.created.map((path) => `Created: ${path}`), ...changeSet.updated.map((path) => `Updated: ${path}`)]);
    } catch (error) {
      changeSet.warnings.push({ code: "log_update_failed", message: errorMessage(error) });
    }
    return changeSet;
  }

  async reindex(): Promise<ChangeSet> {
    const changeSet = emptyChangeSet("reindex");
    const docs = await this.readConcepts();
    const indexed: IndexedDocument[] = docs.map((doc) => ({
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
    const contextBlocks = await Promise.all(retrieved.map(async (result) => {
      const absolutePath = join(this.root, result.path);
      const content = await readFile(absolutePath, "utf8");
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
    const answer: QueryAnswer = {
      text: response.text,
      citations: response.citations?.filter((citation) => isBundleCitation(citation) && retrievedPaths.has(citation)) ?? [],
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
    const markdownFiles = await listMarkdownFiles(this.root);

    for (const filePath of markdownFiles) {
      const relPath = this.relativePath(filePath);
      if (relPath.startsWith(".llm-wiki/")) {
        continue;
      }
      const name = basename(filePath);
      const content = await readFile(filePath, "utf8");
      const parsed = parseMarkdown(content);

      if (name === "index.md" || name === "log.md") {
        if (parsed.frontmatterError !== undefined) {
          errors.push({ path: relPath, code: "malformed_frontmatter", message: parsed.frontmatterError });
        } else {
          validateReservedFile(parsed, relPath, errors);
        }
      } else if (!parsed.hasFrontmatter) {
        errors.push({ path: relPath, code: "missing_frontmatter", message: "Concept document must start with YAML frontmatter." });
      } else if (parsed.frontmatterError !== undefined) {
        errors.push({ path: relPath, code: "malformed_frontmatter", message: parsed.frontmatterError });
      } else if (typeof parsed.frontmatter.type !== "string" || parsed.frontmatter.type.trim() === "") {
        errors.push({ path: relPath, code: "missing_type", message: "Concept document frontmatter must include a non-empty type field." });
      }

      for (const target of extractMarkdownLinks(parsed.body)) {
        if (isExternalLink(target) || target.startsWith("#")) {
          continue;
        }
        const targetWithoutFragment = target.split("#", 1)[0] ?? "";
        if (targetWithoutFragment === "") {
          continue;
        }
        if (typeof parsed.frontmatter.source_path === "string" && hasUrlScheme(parsed.frontmatter.source_path)) {
          continue;
        }
        const targetPath = targetWithoutFragment.startsWith("/")
          ? resolve(this.root, targetWithoutFragment.slice(1))
          : resolve(dirname(filePath), targetWithoutFragment);
        const targetRelativeToRoot = relative(this.root, targetPath);
        if (targetRelativeToRoot === ".." || targetRelativeToRoot.startsWith("../")) {
          errors.push({ path: relPath, code: "link_outside_bundle", message: `Internal link escapes bundle root: ${target}` });
          continue;
        }
        if (!(await exists(targetPath))) {
          warnings.push({ path: relPath, code: "broken_link", message: `Broken internal link: ${target}` });
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async status(): Promise<StatusReport> {
    const docs = await this.readConcepts();
    const concepts = docs.filter((doc) => doc.frontmatter.type === "Concept").length;
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
    return options.type === undefined ? concepts : concepts.filter((concept) => concept.frontmatter.type === options.type);
  }

  async export(options: ExportOptions): Promise<ChangeSet> {
    const changeSet = emptyChangeSet("export");
    const destination = resolve(options.path);
    const destinationRelativeToRoot = relative(this.root, destination);
    if (destinationRelativeToRoot === "" || (!destinationRelativeToRoot.startsWith("..") && destinationRelativeToRoot !== "..")) {
      throw new ConfigurationError("Export destination must not be inside the bundle root.");
    }
    await ensureDir(destination);
    const copied = await copyBundleFiles(this.root, destination, options.includeCache === true);
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
    const outputPath = await this.sourceOutputPath(identity, resource);
    const relativeOutput = this.relativePath(outputPath);
    const existed = await exists(outputPath);
    const existingFrontmatter = existed ? parseMarkdown(await readFile(outputPath, "utf8")).frontmatter : {};
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
      source_path: resource,
      source_id: sha256(identity),
      content_hash: sha256(parsedSource.body),
    };
    const document = serializeMarkdown(frontmatter, parsedSource.body);

    try {
      await atomicWrite(outputPath, document);
    } catch (error) {
      changeSet.failed.push(changeFailure(failurePath(parserInput, identity, resource), error));
      return changeSet;
    }

    if (existed) {
      changeSet.updated.push(relativeOutput);
    } else {
      changeSet.created.push(relativeOutput);
    }

    try {
      await this.appendLog(operation, [`${existed ? "Updated" : "Created"}: ${relativeOutput}`]);
    } catch (error) {
      changeSet.warnings.push({ path: relativeOutput, code: "log_update_failed", message: errorMessage(error) });
    }
    try {
      await this.reindex();
    } catch (error) {
      changeSet.warnings.push({ path: relativeOutput, code: "reindex_failed", message: errorMessage(error) });
    }

    return changeSet;
  }

  private async readConcepts(): Promise<ConceptDocument[]> {
    const markdownFiles = await listMarkdownFiles(this.root);
    const docs: ConceptDocument[] = [];
    for (const filePath of markdownFiles) {
      const relPath = this.relativePath(filePath);
      const name = basename(filePath);
      if (relPath.startsWith(".llm-wiki/") || name === "index.md" || name === "log.md") {
        continue;
      }
      const parsed = parseMarkdown(await readFile(filePath, "utf8"));
      if (typeof parsed.frontmatter.type !== "string" || parsed.frontmatter.type.trim() === "") {
        continue;
      }
      const frontmatter = toOkfFrontmatter(parsed.frontmatter);
      docs.push({ path: relPath, frontmatter, body: parsed.body });
    }
    return docs.sort((a, b) => a.path.localeCompare(b.path));
  }

  private async sourceOutputPath(sourceIdentity: string, resource: string): Promise<string> {
    const rawSlug = slugify(basename(sourceBasename(resource), extname(sourceBasename(resource))));
    const safeSlug = boundedSlug(rawSlug === "index" || rawSlug === "log" ? `source-${rawSlug}` : rawSlug, sourceIdentity);
    const slug = safeSlug;
    const candidate = join(this.root, "sources", `${slug}.md`);
    if (!(await exists(candidate))) {
      return candidate;
    }

    const parsed = parseMarkdown(await readFile(candidate, "utf8"));
    if (parsed.frontmatter.source_id === sha256(sourceIdentity) || parsed.frontmatter.source_path === sourceIdentity || (hasUrlScheme(resource) && parsed.frontmatter.source_id === undefined && parsed.frontmatter.source_path === resource)) {
      return candidate;
    }

    const sourceId = sha256(sourceIdentity).slice(0, 12);
    return join(this.root, "sources", `${slug}-${sourceId}.md`);
  }

  private relativePath(path: string): string {
    return relative(this.root, path).replaceAll("\\", "/");
  }

  private conceptOutputPath(path: string): string {
    const outputPath = resolve(this.root, path);
    const relativeOutput = this.relativePath(outputPath);
    if (relativeOutput === ".." || relativeOutput.startsWith("../") || !relativeOutput.startsWith("concepts/") || !relativeOutput.endsWith(".md")) {
      throw new ConfigurationError("Concept path must be a markdown file inside concepts/.");
    }
    return outputPath;
  }

  private async appendLog(operation: string, lines: string[]): Promise<void> {
    const logPath = join(this.root, "log.md");
    const current = await exists(logPath) ? await readFile(logPath, "utf8") : "# Bundle Update Log\n";
    const entry = [`\n## ${new Date().toISOString().slice(0, 10)}`, `* **${operation}**: ${lines.join("; ")}`].join("\n");
    await atomicWrite(logPath, `${current.trimEnd()}\n${entry}\n`);
  }
}

function emptyChangeSet(operation: ChangeSet["operation"]): ChangeSet {
  return { operation, created: [], updated: [], deleted: [], skipped: [], failed: [], warnings: [] };
}

function extractSitemapLocations(content: string): string[] {
  const locations: string[] = [];
  for (const match of content.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    const candidate = decodeXmlText(match[1] ?? "");
    try {
      locations.push(new URL(candidate).toString());
    } catch {
      continue;
    }
  }
  return [...new Set(locations)];
}

function decodeXmlText(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'");
}

function conceptsFromSynthesis(value: unknown): WriteConceptOptions[] {
  const payload = typeof value === "string" ? JSON.parse(value) as unknown : value;
  if (!isRecord(payload) || !Array.isArray(payload.concepts)) {
    throw new ConfigurationError("Synthesis response must include a concepts array.");
  }
  return payload.concepts.map((item) => {
    if (!isRecord(item) || typeof item.path !== "string" || typeof item.title !== "string" || typeof item.body !== "string") {
      throw new ConfigurationError("Each synthesized concept requires path, title, and body.");
    }
    return {
      path: item.path,
      title: item.title,
      ...(typeof item.description === "string" ? { description: item.description } : {}),
      ...(Array.isArray(item.tags) ? { tags: item.tags.map(String) } : {}),
      body: item.body,
      ...(Array.isArray(item.sourcePaths) ? { sourcePaths: item.sourcePaths.map(String) } : {}),
      ...(isRecord(item.frontmatter) ? { frontmatter: item.frontmatter } : {}),
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "");
  return slug === "" ? "source" : slug;
}

function boundedSlug(slug: string, identity: string): string {
  const maxSlugLength = 180;
  if (slug.length <= maxSlugLength) {
    return slug;
  }
  return `${slug.slice(0, maxSlugLength - 13).replace(/-+$/g, "")}-${sha256(identity).slice(0, 12)}`;
}

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function toParserInput(input: string | ParserSourceInput): string | ParserSourceInput {
  if (typeof input !== "string") {
    return input.kind === "file" ? { ...input, path: resolve(input.path) } : input;
  }
  if (hasUrlScheme(input)) {
    return { kind: "url", url: input };
  }
  return resolve(input);
}

function sourceIdentity(input: string | ParserSourceInput): string {
  if (typeof input === "string") {
    return input;
  }
  if (input.kind === "file") {
    return input.path;
  }
  if (input.kind === "url") {
    return input.url;
  }
  if (input.kind === "buffer" && input.path !== undefined) {
    return resolve(input.path);
  }
  return input.title ?? `${input.kind}:${sha256(input.kind === "text" ? input.text : input.buffer.toString("base64"))}`;
}

function publicResource(input: string | ParserSourceInput): string {
  if (typeof input === "string") {
    return basename(input);
  }
  if (input.kind === "file") {
    return basename(input.path);
  }
  if (input.kind === "url") {
    return safeSanitizeResourceUrl(input.url);
  }
  if (input.kind === "buffer") {
    return input.path === undefined ? input.title ?? "buffer-source" : basename(input.path);
  }
  return input.title ?? "text-source";
}

function failurePath(input: string | ParserSourceInput, identity: string, resource: string): string {
  return typeof input !== "string" && input.kind === "url" ? resource : identity;
}

function hasUrlScheme(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

function sourceBasename(sourcePath: string): string {
  if (!hasUrlScheme(sourcePath)) {
    return sourcePath;
  }
  try {
    const url = new URL(sourcePath);
    const pathnameBase = basename(url.pathname);
    return pathnameBase === "" ? url.hostname : pathnameBase;
  } catch {
    return sourcePath;
  }
}

function sanitizeResourceUrl(value: string): string {
  const url = new URL(value);
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function safeSanitizeResourceUrl(value: string): string {
  try {
    return sanitizeResourceUrl(value);
  } catch {
    const schemeEnd = value.indexOf("://");
    if (schemeEnd === -1) {
      return stripQueryAndFragment(value);
    }
    const prefix = value.slice(0, schemeEnd + 3);
    const rest = value.slice(schemeEnd + 3);
    const slash = rest.indexOf("/");
    const authority = slash === -1 ? rest : rest.slice(0, slash);
    const path = slash === -1 ? "" : rest.slice(slash);
    const at = authority.lastIndexOf("@");
    const redacted = at === -1 ? rest : `${authority.slice(at + 1)}${path}`;
    return `${prefix}${stripQueryAndFragment(redacted)}`;
  }
}

function stripQueryAndFragment(value: string): string {
  const query = value.indexOf("?");
  const fragment = value.indexOf("#");
  const end = Math.min(
    query === -1 ? value.length : query,
    fragment === -1 ? value.length : fragment,
  );
  return value.slice(0, end);
}

function frontmatterMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  if (metadata === undefined) {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (["type", "title", "description", "resource", "tags", "timestamp", "source_path", "source_id", "content_hash"].includes(key)) {
      continue;
    }
    out[key] = frontmatterValue(value);
  }
  return out;
}

function frontmatterValue(value: unknown): unknown {
  if (typeof value === "string") {
    return hasUrlScheme(value) ? safeSanitizeResourceUrl(value) : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(frontmatterValue(item)));
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return undefined;
  }
  return JSON.stringify(sanitizeMetadataJson(value));
}

function sanitizeMetadataJson(value: unknown): unknown {
  if (typeof value === "string") {
    return hasUrlScheme(value) ? safeSanitizeResourceUrl(value) : value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeMetadataJson);
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      const sanitized = sanitizeMetadataJson(nested);
      if (sanitized !== undefined) {
        out[key] = sanitized;
      }
    }
    return out;
  }
  return value;
}

function changeFailure(path: string, error: unknown) {
  if (error instanceof ParserError) {
    return { path, error: error.message, code: error.code, source: sanitizeFailureSource(error.source) };
  }
  return { path, error: errorMessage(error) };
}

function sanitizeFailureSource(source: { path?: string; url?: string; contentType?: string }) {
  return {
    ...(source.path === undefined ? {} : { path: hasUrlScheme(source.path) ? safeSanitizeResourceUrl(source.path) : source.path }),
    ...(source.url === undefined ? {} : { url: hasUrlScheme(source.url) ? safeSanitizeResourceUrl(source.url) : source.url }),
    ...(source.contentType === undefined ? {} : { contentType: source.contentType }),
  };
}
