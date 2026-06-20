/**
 * PostgresBundleStore conformance tests.
 * Skipped when no PostgreSQL instance is reachable within 1s.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { PostgresBundleStore } from "../dist/index.js";
import { runBundleStoreTests } from "./bundle-store-conformance.js";

const FAKE_DB = {
  async query() {
    return { rows: [], rowCount: 0 };
  },
};

test("PostgresBundleStore rejects unsafe custom table identifiers", () => {
  assert.doesNotThrow(() => new PostgresBundleStore(FAKE_DB, "tenant://acme/kb"));
  assert.doesNotThrow(() => new PostgresBundleStore(FAKE_DB, "tenant://acme/kb", "okf_documents"));
  assert.throws(
    () => new PostgresBundleStore(FAKE_DB, "tenant://acme/kb", "okf_documents; DROP TABLE users"),
    /Unsafe PostgreSQL table identifier/,
  );
  assert.throws(
    () => new PostgresBundleStore(FAKE_DB, "tenant://acme/kb", "tenant.docs"),
    /Unsafe PostgreSQL table identifier/,
  );
});
const PG_URL = process.env.PG_CONNECTION_STRING ?? "postgresql://localhost:5432/llm_wiki_test";

test("PostgresBundleStore availability check", { skip: !process.env.PG_CONNECTION_STRING }, async () => {
  let pg;
  try {
    pg = await import("pg");
  } catch {
    // pg not installed, skip
    return;
  }
  const pool = new pg.Pool({
    connectionString: PG_URL,
    max: 1,
    connectionTimeoutMillis: 1000,
    idleTimeoutMillis: 1000,
  });
  let available = false;
  try {
    await pool.query("SELECT 1");
    available = true;
  } catch {
    // PG not available
  }
  if (!available) {
    await pool.end().catch(() => {});
    return;
  }
  await pool.query("DROP TABLE IF EXISTS okf_documents");
  runBundleStoreTests((root) => new PostgresBundleStore(pool, root), "PostgresBundleStore");
});
