import MiniSearch from "minisearch";
import { extractSnippet, tokenize } from "../application/search.js";
const miniSearchOptions = {
    idField: "id",
    fields: ["title", "tags", "content"],
    storeFields: ["path", "title", "type", "content"],
    tokenize,
    processTerm: (term) => term,
    searchOptions: {
        boost: { title: 4, tags: 3, content: 1 },
        prefix: true,
        fuzzy: (term, _index, _terms) => (term.length > 4 ? 0.1 : false),
    },
};
export class LocalSearchAdapter {
    store;
    constructor(store) {
        this.store = store;
    }
    async index(documents) {
        const miniSearch = new MiniSearch(miniSearchOptions);
        miniSearch.addAll(documents.map(toMiniSearchDocument));
        const payload = { version: 1, documents, miniSearch: miniSearch.toJSON() };
        await this.store.write(".llm-wiki/search-index.json", JSON.stringify(payload, null, 2));
    }
    async search(query, options = {}) {
        const queryTokens = tokenize(query);
        if (queryTokens.length === 0) {
            return [];
        }
        const raw = await this.store.read(".llm-wiki/search-index.json");
        const payload = JSON.parse(raw);
        const documentsByPath = new Map(payload.documents.map((doc) => [doc.path, doc]));
        const miniSearch = MiniSearch.loadJS(payload.miniSearch, miniSearchOptions);
        const results = miniSearch
            .search(query)
            .slice(0, options.limit ?? 10)
            .map((result) => {
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
    async exists() {
        return await this.store.exists(".llm-wiki/search-index.json");
    }
}
function toMiniSearchDocument(doc) {
    return {
        id: doc.path,
        path: doc.path,
        title: doc.title,
        type: doc.type,
        tags: doc.tags.join(" "),
        content: doc.content,
    };
}
