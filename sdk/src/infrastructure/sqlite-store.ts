import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import type { BundleStore } from "../domain/types.js";

const DEFAULT_TABLE = "okf_documents";

interface SqliteDatabase {
  exec(sql: string): unknown;
  prepare(sql: string): {
    run(...params: unknown[]): { changes: number };
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
export class SqliteBundleStore implements BundleStore {
  private readonly table: string;

  constructor(
    private readonly db: SqliteDatabase,
    readonly root: string,
    tableName?: string,
  ) {
    this.table = tableName ?? DEFAULT_TABLE;
  }

  init(): Promise<void> {
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

  exists(bundleRelPath: string): Promise<boolean> {
    const row = this.db
      .prepare(`SELECT 1 AS ok FROM ${this.table} WHERE bundle_id = ? AND path = ? LIMIT 1`)
      .get(this.root, bundleRelPath);
    return Promise.resolve(row !== undefined);
  }
  async read(bundleRelPath: string): Promise<string> {
    const row = this.db
      .prepare(`SELECT content FROM ${this.table} WHERE bundle_id = ? AND path = ?`)
      .get(this.root, bundleRelPath);
    if (row === undefined) {
      const err: NodeJS.ErrnoException = Object.assign(
        new Error(`ENOENT: no such document, read '${bundleRelPath}'`),
        { code: "ENOENT" },
      );
      throw err;
    }
    if (typeof row === "object" && row !== null && "content" in row) {
      return String((row as Record<string, unknown>).content);
    }
    throw new Error(`Unexpected row shape reading '${bundleRelPath}'`);
  }
  write(bundleRelPath: string, content: string): Promise<void> {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO ${this.table} (bundle_id, path, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (bundle_id, path)
         DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
      )
      .run(this.root, bundleRelPath, content, now, now);
    return Promise.resolve();
  }

  writeIfMissing(bundleRelPath: string, content: string): Promise<void> {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT OR IGNORE INTO ${this.table} (bundle_id, path, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(this.root, bundleRelPath, content, now, now);
    return Promise.resolve();
  }

  ensureDir(_bundleRelPath: string): Promise<void> {
    return Promise.resolve();
  }

  listMarkdownPaths(): Promise<string[]> {
    const rows = this.db
      .prepare(
        `SELECT path FROM ${this.table}
         WHERE bundle_id = ? AND path LIKE '%.md'
         ORDER BY path`,
      )
      .all(this.root);
    return Promise.resolve(
      rows
        .map((row) => {
          if (typeof row === "object" && row !== null && "path" in row) {
            return String((row as Record<string, unknown>).path);
          }
          return "";
        })
        .filter(Boolean),
    );
  }

  async exportTo(absDestPath: string, _includeCache: boolean): Promise<string[]> {
    const rows = this.db
      .prepare(`SELECT path, content FROM ${this.table} WHERE bundle_id = ? ORDER BY path`)
      .all(this.root);
    const copied: string[] = [];
    for (const row of rows) {
      if (typeof row !== "object" || row === null) continue;
      const r = row as Record<string, unknown>;
      const relPath = typeof r.path === "string" ? r.path : "";
      const content = typeof r.content === "string" ? r.content : "";
      if (!relPath || !content) continue;
      const dest = join(absDestPath, relPath);
      await mkdir(join(dest, ".."), { recursive: true });
      await writeFile(dest, content, "utf8");
      copied.push(relPath);
    }
    return copied;
  }

  relativePath(absOrRelPath: string): string {
    return absOrRelPath;
  }
}
