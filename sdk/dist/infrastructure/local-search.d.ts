import type { BundleStore, IndexedDocument, SearchAdapter, SearchOptions, SearchResult } from "../domain/types.js";
export declare class LocalSearchAdapter implements SearchAdapter {
    private readonly store;
    constructor(store: BundleStore);
    index(documents: IndexedDocument[]): Promise<void>;
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
    exists(): Promise<boolean>;
}
