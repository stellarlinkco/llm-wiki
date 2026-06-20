import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { IndexedDocument, SearchAdapter, SearchOptions, SearchResult } from "../domain/types.js";
import { atomicWrite, exists } from "./filesystem.js";
import { extractSnippet, scoreDocument, tokenize } from "../application/search.js";

export class LocalSearchAdapter implements SearchAdapter {
  constructor(private readonly root: string) {}

  async index(documents: IndexedDocument[]): Promise<void> {
    await atomicWrite(this.indexPath(), JSON.stringify(documents, null, 2));
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }
    const raw = await readFile(this.indexPath(), "utf8");
    const indexed = JSON.parse(raw) as IndexedDocument[];
    return indexed
      .map((doc) => ({ doc, score: scoreDocument(queryTokens, doc.tokens) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.doc.path.localeCompare(b.doc.path))
      .slice(0, options.limit ?? 10)
      .map(({ doc, score }) => ({
        path: doc.path,
        title: doc.title,
        type: doc.type,
        score,
        snippet: extractSnippet(doc.content, queryTokens),
        tags: doc.tags,
      }));
  }

  async exists(): Promise<boolean> {
    return await exists(this.indexPath());
  }

  private indexPath(): string {
    return join(this.root, ".llm-wiki", "search-index.json");
  }
}
