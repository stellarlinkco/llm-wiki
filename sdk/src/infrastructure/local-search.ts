import MiniSearch, { type AsPlainObject } from "minisearch";
import type { BundleStore, IndexedDocument, SearchAdapter, SearchOptions, SearchResult } from "../domain/types.js";
import { extractSnippet, tokenize } from "../application/search.js";

interface PersistedSearchIndex {
  version: 1;
  documents: IndexedDocument[];
  miniSearch: AsPlainObject;
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
  processTerm: (term: string) => term,
  searchOptions: {
    boost: { title: 4, tags: 3, content: 1 },
    prefix: true,
    fuzzy: (term: string, _index: number, _terms: string[]) => term.length > 4 ? 0.1 : false,
  },
};

export class LocalSearchAdapter implements SearchAdapter {
  constructor(private readonly store: BundleStore) {}

  async index(documents: IndexedDocument[]): Promise<void> {
    const miniSearch = new MiniSearch<MiniSearchDocument>(miniSearchOptions);
    miniSearch.addAll(documents.map(toMiniSearchDocument));
    const payload: PersistedSearchIndex = { version: 1, documents, miniSearch: miniSearch.toJSON() };
    await this.store.write(".llm-wiki/search-index.json", JSON.stringify(payload, null, 2));
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }
    const raw = await this.store.read(".llm-wiki/search-index.json");
    const payload = JSON.parse(raw) as PersistedSearchIndex;
    const documentsByPath = new Map(payload.documents.map((doc) => [doc.path, doc]));
    const miniSearch = MiniSearch.loadJS<MiniSearchDocument>(payload.miniSearch, miniSearchOptions);
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
    return await this.store.exists(".llm-wiki/search-index.json");
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
