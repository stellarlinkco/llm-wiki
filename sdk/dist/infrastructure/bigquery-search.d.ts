import type { BundleStore, IndexedDocument, SearchAdapter, SearchOptions, SearchResult } from "../domain/types.js";
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
    execute(request: {
        query: string;
        params?: Record<string, unknown>;
    }): Promise<void>;
    query(request: {
        query: string;
        params?: Record<string, unknown>;
    }): Promise<BigQuerySearchRow[]>;
}
export interface BigQuerySearchAdapterOptions {
    bundleId: string;
    tableFqn: string;
    store: BundleStore;
    client: BigQuerySearchClient;
}
export declare class BigQuerySearchAdapter implements SearchAdapter {
    private readonly bundleId;
    private readonly tableFqn;
    private readonly store;
    private readonly client;
    constructor(options: BigQuerySearchAdapterOptions);
    index(documents: IndexedDocument[]): Promise<void>;
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
    private readableSearchResults;
    private toReadableSearchResult;
    exists(): Promise<boolean>;
}
