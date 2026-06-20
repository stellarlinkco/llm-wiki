import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
const DEFAULT_TABLE = "okf_documents";
const SAFE_IDENTIFIER_PART = /^[A-Za-z_][A-Za-z0-9_]*$/;
function quoteTableIdentifier(tableName) {
    const parts = tableName.split(".");
    if (parts.length === 0 || parts.length > 2 || parts.some((part) => !SAFE_IDENTIFIER_PART.test(part))) {
        throw new Error(`Unsafe PostgreSQL table identifier '${tableName}'. Use an identifier such as '${DEFAULT_TABLE}' or 'schema.${DEFAULT_TABLE}'.`);
    }
    return parts.map((part) => `"${part.toLowerCase()}"`).join(".");
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
export class PostgresBundleStore {
    db;
    root;
    table;
    constructor(db, root, tableName) {
        this.db = db;
        this.root = root;
        this.table = quoteTableIdentifier(tableName ?? DEFAULT_TABLE);
    }
    async init() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        bundle_id TEXT NOT NULL,
        path      TEXT NOT NULL,
        content   TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        PRIMARY KEY (bundle_id, path)
      )
    `);
    }
    async exists(bundleRelPath) {
        const result = await this.db.query(`SELECT 1 AS ok FROM ${this.table} WHERE bundle_id = $1 AND path = $2 LIMIT 1`, [
            this.root,
            bundleRelPath,
        ]);
        return (result.rowCount ?? 0) > 0;
    }
    async read(bundleRelPath) {
        const result = await this.db.query(`SELECT content FROM ${this.table} WHERE bundle_id = $1 AND path = $2`, [
            this.root,
            bundleRelPath,
        ]);
        if (result.rowCount === 0 || result.rows.length === 0) {
            const err = Object.assign(new Error(`ENOENT: no such document, read '${bundleRelPath}'`), {
                code: "ENOENT",
            });
            throw err;
        }
        const row = result.rows[0];
        if (typeof row === "object" && row !== null && "content" in row) {
            return String(row.content);
        }
        throw new Error(`Unexpected row shape reading '${bundleRelPath}'`);
    }
    async write(bundleRelPath, content) {
        const now = Date.now();
        await this.db.query(`INSERT INTO ${this.table} (bundle_id, path, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (bundle_id, path)
       DO UPDATE SET content = EXCLUDED.content, updated_at = EXCLUDED.updated_at`, [this.root, bundleRelPath, content, now]);
    }
    async writeIfMissing(bundleRelPath, content) {
        const now = Date.now();
        await this.db.query(`INSERT INTO ${this.table} (bundle_id, path, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (bundle_id, path) DO NOTHING`, [this.root, bundleRelPath, content, now]);
    }
    async ensureDir(_bundleRelPath) {
        // Directories are implicit in a relational store.
    }
    async listMarkdownPaths() {
        const result = await this.db.query(`SELECT path FROM ${this.table}
       WHERE bundle_id = $1 AND path LIKE '%.md'
       ORDER BY path`, [this.root]);
        return result.rows
            .map((row) => {
            if (typeof row === "object" && row !== null && "path" in row) {
                return String(row.path);
            }
            return "";
        })
            .filter(Boolean);
    }
    async exportTo(absDestPath, _includeCache) {
        const result = await this.db.query(`SELECT path, content FROM ${this.table} WHERE bundle_id = $1 ORDER BY path`, [
            this.root,
        ]);
        const copied = [];
        for (const row of result.rows) {
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
