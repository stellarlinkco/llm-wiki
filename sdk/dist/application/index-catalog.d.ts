interface IndexCatalogEntry {
    path: string;
    title: string;
    type: string;
}
interface IndexCatalogOptions {
    title: string;
    description?: string;
}
export declare function buildProgressiveIndexFiles(entries: IndexCatalogEntry[], options: IndexCatalogOptions): Map<string, string>;
export {};
