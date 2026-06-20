import Database from "better-sqlite3";
import { SqliteBundleStore } from "../dist/index.js";
import { runBundleStoreTests } from "./bundle-store-conformance.js";

runBundleStoreTests(
  (root) => new SqliteBundleStore(new Database(":memory:"), root),
  "SqliteBundleStore",
);
