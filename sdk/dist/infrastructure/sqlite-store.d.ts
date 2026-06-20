import type { BundleStore } from "../domain/types.js";
interface SqliteDatabase {
    exec(sql: string): unknown;
    prepare(sql: string): {
        run(...params: unknown[]): {
            changes: number;
        };
        get(...params: unknown[]): unknown;
        all(...params: unknown[]): unknown[];
    };
}
/**
 * SQLite-backed {@link BundleStore} using `better-sqlite3`.
 *
 * Pass a `better-sqlite3` Database instance. `root` identifies the bundle.
 *
 * ```ts
 * import Database from "better-sqlite3";
 * const store = new SqliteBundleStore(new Database(":memory:"), "tenant://acme/kb");
 * ```
 */
export declare class SqliteBundleStore implements BundleStore {
    private readonly db;
    readonly root: string;
    private readonly table;
    constructor(db: SqliteDatabase, root: string, tableName?: string);
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
