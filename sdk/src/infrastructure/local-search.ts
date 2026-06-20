import { readFile } from "node:fs/promises";
import { join } from "node:path";
import MiniSearch from "minisearch";
import type { IndexedDocument, SearchAdapter, SearchOptions, SearchResult } from "../domain/types.js";
import { atomicWrite, exists } from "./filesystem.js";
import { extractSnippet, tokenize } from "../application/search.js";

interface PersistedSearchIndex {
  version: 1;
  documents: IndexedDocument[];
  miniSearch: unknown;
}

interface MiniSearchDocument {
  id: string;
  path: string;
  title: string;
  type: string;
  tags: string;
  content: string;
}

const miniSearchOptions = {
  idField: "id",
  fields: ["title", "tags", "content"],
  storeFields: ["path", "title", "type", "content"],
  tokenize,
  searchOptions: {
    boost: { title: 4, tags: 3, content: 1 },
    prefix: true,
    fuzzy: (term: string, _index: number, _terms: string[]) => term.length > 4 ? 0.1 : false,
  },
};

export class LocalSearchAdapter implements SearchAdapter {
  constructor(private readonly root: string) {}

  async index(documents: IndexedDocument[]): Promise<void> {
    const miniSearch = new MiniSearch<MiniSearchDocument>(miniSearchOptions);
    miniSearch.addAll(documents.map(toMiniSearchDocument));
    const payload: PersistedSearchIndex = { version: 1, documents, miniSearch: miniSearch.toJSON() };
    await atomicWrite(this.indexPath(), JSON.stringify(payload, null, 2));
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }
    const raw = await readFile(this.indexPath(), "utf8");
    const payload = JSON.parse(raw) as PersistedSearchIndex;
    const documentsByPath = new Map(payload.documents.map((doc) => [doc.path, doc]));
    const miniSearch = MiniSearch.loadJSON<MiniSearchDocument>(JSON.stringify(payload.miniSearch), miniSearchOptions);
    const results = miniSearch.search(query).slice(0, options.limit ?? 10).map((result) => {
      const path = String(result.path);
      const doc = documentsByPath.get(path);
      return {
        path,
        title: String(result.title),
        type: String(result.type),
        score: result.score,
        snippet: extractSnippet(doc?.content ?? String(result.content ?? ""), queryTokens),
        tags: doc?.tags ?? [],
      };
    });
    return results;
  }

  async exists(): Promise<boolean> {
    return await exists(this.indexPath());
  }

  private indexPath(): string {
    return join(this.root, ".llm-wiki", "search-index.json");
  }
}

function toMiniSearchDocument(doc: IndexedDocument): MiniSearchDocument {
  return {
    id: doc.path,
    path: doc.path,
    title: doc.title,
    type: doc.type,
    tags: doc.tags.join(" "),
    content: doc.content,
  };
}
