import { extractSnippet, tokenize } from "../application/search.js";
import { ConfigurationError } from "../domain/errors.js";
import type { BundleStore, IndexedDocument, SearchAdapter, SearchOptions, SearchResult } from "../domain/types.js";
import { isBundleCitation } from "./markdown.js";

export interface BigQuerySearchRow {
  bundle_id: string;
  path: string;
  title: string;
  type: string;
  score?: number;
  snippet?: string;
  tags?: string[];
  content?: string;
}

export interface BigQuerySearchClient {
  execute(request: { query: string; params?: Record<string, unknown> }): Promise<void>;
  query(request: { query: string; params?: Record<string, unknown> }): Promise<BigQuerySearchRow[]>;
}

export interface BigQuerySearchAdapterOptions {
  bundleId: string;
  tableFqn: string;
  store: BundleStore;
  client: BigQuerySearchClient;
}

const TABLE_FQN_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export class BigQuerySearchAdapter implements SearchAdapter {
  private readonly bundleId: string;
  private readonly tableFqn: string;
  private readonly store: BundleStore;
  private readonly client: BigQuerySearchClient;

  constructor(options: BigQuerySearchAdapterOptions) {
    if (!TABLE_FQN_PATTERN.test(options.tableFqn)) {
      throw new ConfigurationError("BigQuerySearchAdapter requires tableFqn in project.dataset.table format.");
    }
    if (options.bundleId.trim() === "") {
      throw new ConfigurationError("BigQuerySearchAdapter requires a non-empty bundleId namespace.");
    }
    this.bundleId = options.bundleId;
    this.tableFqn = options.tableFqn;
    this.store = options.store;
    this.client = options.client;
  }

  async index(documents: IndexedDocument[]): Promise<void> {
    await this.client.execute({
      query: `DELETE FROM \`${this.tableFqn}\` WHERE bundle_id = @bundle_id`,
      params: { bundle_id: this.bundleId },
    });
    if (documents.length === 0) {
      return;
    }
    await this.client.execute({
      query: `INSERT INTO \`${this.tableFqn}\` (bundle_id, path, title, type, tags, content) SELECT bundle_id, path, title, type, tags, content FROM UNNEST(@rows)`,
      params: {
        rows: documents.map((document) => ({
          bundle_id: this.bundleId,
          path: document.path,
          title: document.title,
          type: document.type,
          tags: document.tags,
          content: document.content,
        })),
      },
    });
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }
    const rows = await this.client.query({
      query: [
        "SELECT bundle_id, path, title, type, tags, content",
        `FROM \`${this.tableFqn}\``,
        "WHERE bundle_id = @bundle_id",
        "AND EXISTS (",
        "SELECT 1 FROM UNNEST(@query_tokens) AS token",
        "WHERE STRPOS(LOWER(COALESCE(title, '')), token) > 0",
        "OR STRPOS(LOWER(COALESCE(content, '')), token) > 0",
        "OR EXISTS (SELECT 1 FROM UNNEST(IFNULL(tags, [])) AS tag WHERE STRPOS(LOWER(tag), token) > 0)",
        ")",
      ].join(" "),
      params: {
        bundle_id: this.bundleId,
        query_text: queryTokens.join(" "),
        query_tokens: queryTokens,
      },
    });
    const results = await this.readableSearchResults(rows, queryTokens);
    return results.slice(0, options.limit ?? 10);
  }

  private async readableSearchResults(rows: BigQuerySearchRow[], queryTokens: string[]): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    for (const row of rows) {
      const result = await this.toReadableSearchResult(row, queryTokens);
      if (result !== undefined) {
        results.push(result);
      }
    }
    return results;
  }

  private async toReadableSearchResult(
    row: BigQuerySearchRow,
    queryTokens: string[],
  ): Promise<SearchResult | undefined> {
    if (row.bundle_id !== this.bundleId || !isBundleCitation(row.path)) {
      return undefined;
    }
    if (!(await this.store.exists(row.path))) {
      return undefined;
    }
    return {
      path: row.path,
      title: row.title,
      type: row.type,
      score: row.score ?? 0,
      snippet: row.snippet ?? extractSnippet(row.content ?? "", queryTokens),
      tags: row.tags ?? [],
    };
  }

  async exists(): Promise<boolean> {
    const rows = await this.client.query({
      query: `SELECT path FROM \`${this.tableFqn}\` WHERE bundle_id = @bundle_id LIMIT 1`,
      params: { bundle_id: this.bundleId },
    });
    return rows.length > 0;
  }
}
