import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
const DEFAULT_TABLE = "okf_documents";
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
export class SqliteBundleStore {
    db;
    root;
    table;
    constructor(db, root, tableName) {
        this.db = db;
        this.root = root;
        this.table = tableName ?? DEFAULT_TABLE;
    }
    init() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        bundle_id TEXT NOT NULL,
        path      TEXT NOT NULL,
        content   TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (bundle_id, path)
      )
    `);
        return Promise.resolve();
    }
    exists(bundleRelPath) {
        const row = this.db
            .prepare(`SELECT 1 AS ok FROM ${this.table} WHERE bundle_id = ? AND path = ? LIMIT 1`)
            .get(this.root, bundleRelPath);
        return Promise.resolve(row !== undefined);
    }
    async read(bundleRelPath) {
        const row = this.db
            .prepare(`SELECT content FROM ${this.table} WHERE bundle_id = ? AND path = ?`)
            .get(this.root, bundleRelPath);
        if (row === undefined) {
            const err = Object.assign(new Error(`ENOENT: no such document, read '${bundleRelPath}'`), { code: "ENOENT" });
            throw err;
        }
        if (typeof row === "object" && row !== null && "content" in row) {
            return String(row.content);
        }
        throw new Error(`Unexpected row shape reading '${bundleRelPath}'`);
    }
    write(bundleRelPath, content) {
        const now = Date.now();
        this.db
            .prepare(`INSERT INTO ${this.table} (bundle_id, path, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (bundle_id, path)
         DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`)
            .run(this.root, bundleRelPath, content, now, now);
        return Promise.resolve();
    }
    writeIfMissing(bundleRelPath, content) {
        const now = Date.now();
        this.db
            .prepare(`INSERT OR IGNORE INTO ${this.table} (bundle_id, path, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`)
            .run(this.root, bundleRelPath, content, now, now);
        return Promise.resolve();
    }
    ensureDir(_bundleRelPath) {
        return Promise.resolve();
    }
    listMarkdownPaths() {
        const rows = this.db
            .prepare(`SELECT path FROM ${this.table}
         WHERE bundle_id = ? AND path LIKE '%.md'
         ORDER BY path`)
            .all(this.root);
        return Promise.resolve(rows
            .map((row) => {
            if (typeof row === "object" && row !== null && "path" in row) {
                return String(row.path);
            }
            return "";
        })
            .filter(Boolean));
    }
    async exportTo(absDestPath, _includeCache) {
        const rows = this.db
            .prepare(`SELECT path, content FROM ${this.table} WHERE bundle_id = ? ORDER BY path`)
            .all(this.root);
        const copied = [];
        for (const row of rows) {
            if (typeof row !== "object" || row === null)
                continue;
            const r = row;
            const relPath = typeof r.path === "string" ? r.path : "";
            const content = typeof r.content === "string" ? r.content : "";
            if (!relPath || !content)
                continue;
            const dest = join(absDestPath, relPath);
            await mkdir(join(dest, ".."), { recursive: true });
            await writeFile(dest, content, "utf8");
            copied.push(relPath);
        }
        return copied;
    }
    relativePath(absOrRelPath) {
        return absOrRelPath;
    }
}
