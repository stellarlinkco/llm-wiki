import assert from "node:assert/strict";
import test from "node:test";
import Database from "better-sqlite3";
import { SqliteBundleStore } from "../dist/index.js";
import { runBundleStoreTests } from "./bundle-store-conformance.js";

runBundleStoreTests((root) => new SqliteBundleStore(new Database(":memory:"), root), "SqliteBundleStore");

test("SqliteBundleStore rejects unsafe custom table identifiers", () => {
  assert.doesNotThrow(() => new SqliteBundleStore(new Database(":memory:"), "tenant://acme/kb"));
  assert.doesNotThrow(() => new SqliteBundleStore(new Database(":memory:"), "tenant://acme/kb", "okf_documents"));
  assert.throws(
    () => new SqliteBundleStore(new Database(":memory:"), "tenant://acme/kb", "okf_documents; DROP TABLE users"),
    /Unsafe SQLite table identifier/,
  );
});

test("SqliteBundleStore safely quotes schema-qualified table identifiers", async () => {
  const db = new Database(":memory:");
  const store = new SqliteBundleStore(db, "tenant://acme/kb", "main.okf_documents");
  await store.init();
  await store.write("concepts/acme.md", "# Acme");
  assert.equal(await store.read("concepts/acme.md"), "# Acme");
});
