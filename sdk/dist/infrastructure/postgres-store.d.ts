import type { BundleStore } from "../domain/types.js";
interface PgQueryable {
    query(text: string, params?: unknown[]): Promise<{
        rows: unknown[];
        rowCount: number | null;
    }>;
}
/**
 * PostgreSQL-backed {@link BundleStore}.
 *
 * Pass a `pg.Pool` (or any object with a compatible `query()` method).
 * `root` identifies the bundle — a tenant id, namespace, or logical path.
 *
 * ```ts
 * import { Pool } from "pg";
 * const store = new PostgresBundleStore(new Pool({ connectionString: "..." }), "tenant://acme/kb");
 * ```
 */
export declare class PostgresBundleStore implements BundleStore {
    private readonly db;
    readonly root: string;
    private readonly table;
    constructor(db: PgQueryable, root: string, tableName?: string);
    init(): Promise<void>;
    exists(bundleRelPath: string): Promise<boolean>;
    read(bundleRelPath: string): Promise<string>;
    write(bundleRelPath: string, content: string): Promise<void>;
    writeIfMissing(bundleRelPath: string, content: string): Promise<void>;
    ensureDir(_bundleRelPath: string): Promise<void>;
    listMarkdownPaths(): Promise<string[]>;
    exportTo(absDestPath: string, _includeCache: boolean): Promise<string[]>;
    relativePath(absOrRelPath: string): string;
}
export {};
