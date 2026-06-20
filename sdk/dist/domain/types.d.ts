export interface BundleStore {
    /** Logical root identifier */
    readonly root: string;
    /** Initialize bundle structure (sources/, concepts/, references/, .llm-wiki/) */
    init(): Promise<void>;
    /** Check if a path exists within the bundle */
    exists(bundleRelPath: string): Promise<boolean>;
    /** Read document content by bundle-relative path */
    read(bundleRelPath: string): Promise<string>;
    /** Atomically write document content */
    write(bundleRelPath: string, content: string): Promise<void>;
    /** Write document only if it does not already exist */
    writeIfMissing(bundleRelPath: string, content: string): Promise<void>;
    /** Ensure a directory exists at the given bundle-relative path */
    ensureDir(bundleRelPath: string): Promise<void>;
    /** List all .md file paths relative to the bundle root */
    listMarkdownPaths(): Promise<string[]>;
    /** Export bundle contents to a filesystem directory. Returns copied paths. */
    exportTo(absDestPath: string, includeCache: boolean): Promise<string[]>;
    /** Convert an absolute or relative path to a bundle-relative path */
    relativePath(absOrRelPath: string): string;
}
export interface KnowledgeBaseOptions {
    root: string;
    llm?: LLMProvider;
    parser?: SourceParser;
    search?: SearchAdapter;
    store?: BundleStore;
    metadata?: Record<string, unknown>;
}
export interface IngestOptions {
    path: string | ParserSourceInput;
}
export interface CrawlOptions {
    sitemapUrl: string;
    limit?: number;
}
export interface WriteConceptOptions {
    path: string;
    title: string;
    description?: string;
    tags?: string[];
    body: string;
    sourcePaths?: string[];
    frontmatter?: Record<string, unknown>;
    /** Concept type. Defaults to "Concept". Override for domain-specific types. */
    type?: string;
}
export interface WriteIndexOptions {
    title: string;
    description?: string;
}
export interface SynthesizeOptions {
    query: string;
    instructions: string;
    limit?: number;
    /** Custom system prompt. Defaults to generic OKF concept generation prompt. */
    systemPrompt?: string;
    /** JSON schema description injected before the system prompt. */
    outputSchema?: string;
}
export interface QueryOptions {
    limit?: number;
}
export interface SearchOptions {
    limit?: number;
}
export interface ListConceptOptions {
    type?: string;
}
export interface ExportOptions {
    path: string;
    includeCache?: boolean;
}
export interface OkfFrontmatter {
    type: string;
    title?: string;
    description?: string;
    resource?: string;
    tags?: string[];
    timestamp?: string;
    [key: string]: unknown;
}
export interface ConceptDocument {
    path: string;
    frontmatter: OkfFrontmatter;
    body: string;
}
export interface SearchResult {
    path: string;
    title: string;
    type: string;
    score: number;
    snippet: string;
    tags: string[];
}
export interface ValidationFinding {
    path: string;
    code: string;
    message: string;
}
export interface ValidationReport {
    valid: boolean;
    errors: ValidationFinding[];
    warnings: ValidationFinding[];
}
export interface StatusReport {
    root: string;
    concepts: number;
    sourceDocuments: number;
    documents: number;
    searchIndexExists: boolean;
}
export interface ChangeFailure {
    path: string;
    error: string;
    code?: string;
    source?: {
        path?: string;
        url?: string;
        contentType?: string;
    };
}
export interface ChangeWarning {
    path?: string;
    code: string;
    message: string;
}
export interface ChangeSet {
    operation: "create" | "crawl" | "ingest" | "update" | "writeConcept" | "writeIndex" | "synthesize" | "reindex" | "validate" | "export";
    created: string[];
    updated: string[];
    deleted: string[];
    skipped: string[];
    failed: ChangeFailure[];
    warnings: ChangeWarning[];
}
export interface ParsedSource {
    title: string;
    description: string;
    body: string;
    metadata?: Record<string, unknown>;
}
export type SourceKind = "file" | "text" | "buffer" | "url";
export type ParserSourceInput = {
    kind: "file";
    path: string;
    contentType?: string;
    title?: string;
    metadata?: Record<string, unknown>;
} | {
    kind: "text";
    text: string;
    contentType?: string;
    title?: string;
    metadata?: Record<string, unknown>;
} | {
    kind: "buffer";
    buffer: Buffer;
    path?: string;
    contentType?: string;
    title?: string;
    metadata?: Record<string, unknown>;
} | {
    kind: "url";
    url: string;
    contentType?: string;
    title?: string;
    metadata?: Record<string, unknown>;
};
export interface SourceParser {
    parse(input: string | ParserSourceInput): Promise<ParsedSource>;
}
export interface SearchAdapter {
    index(documents: IndexedDocument[]): Promise<void>;
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
    exists(): Promise<boolean>;
}
export interface LLMStructuredOutput {
    type: "json";
}
export interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
export interface LLMRequest {
    messages: LLMMessage[];
    structuredOutput?: LLMStructuredOutput;
}
export interface LLMResponse {
    text: string;
    citations?: string[];
    usage?: Record<string, number>;
    json?: unknown;
}
export interface LLMProvider {
    generate(request: LLMRequest): Promise<LLMResponse>;
}
export interface OpenAIProviderOptions {
    apiKey: string;
    model?: string;
    baseUrl?: string;
    client?: unknown;
}
export interface AnthropicProviderOptions {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    client?: unknown;
}
export interface QueryAnswer {
    text: string;
    citations: string[];
    retrieved: SearchResult[];
    usage?: Record<string, number>;
}
export interface ParsedMarkdown {
    frontmatter: Record<string, unknown>;
    body: string;
    hasFrontmatter: boolean;
    frontmatterError?: string;
}
export interface IndexedDocument {
    path: string;
    title: string;
    type: string;
    tags: string[];
    content: string;
    tokens: string[];
}
