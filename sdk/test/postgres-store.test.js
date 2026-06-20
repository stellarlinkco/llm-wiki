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

test("PostgresBundleStore validates and quotes custom table identifiers", async () => {
  assert.doesNotThrow(() => new PostgresBundleStore(FAKE_DB, "tenant://acme/kb"));
  assert.doesNotThrow(() => new PostgresBundleStore(FAKE_DB, "tenant://acme/kb", "okf_documents"));
  assert.throws(
    () => new PostgresBundleStore(FAKE_DB, "tenant://acme/kb", "okf_documents; DROP TABLE users"),
    /Unsafe PostgreSQL table identifier/,
  );

  const queries = [];
  const db = {
    async query(text) {
      queries.push(text);
      return { rows: [], rowCount: 0 };
    },
  };

  await new PostgresBundleStore(db, "tenant://acme/kb", "select").init();
  await new PostgresBundleStore(db, "tenant://acme/kb", "tenant.docs").init();
  await new PostgresBundleStore(db, "tenant://acme/kb", "OKF_DOCUMENTS").init();
  await new PostgresBundleStore(db, "tenant://acme/kb", "Public.docs").init();
  assert.match(queries[0], /CREATE TABLE IF NOT EXISTS "select"/);
  assert.match(queries[1], /CREATE TABLE IF NOT EXISTS "tenant"\."docs"/);
  assert.match(queries[2], /CREATE TABLE IF NOT EXISTS "okf_documents"/);
  assert.match(queries[3], /CREATE TABLE IF NOT EXISTS "public"\."docs"/);
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
