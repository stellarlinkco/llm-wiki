/**
 * BundleStore conformance test suite.
 * Every BundleStore implementation MUST pass these tests.
 * Usage: runBundleStoreTests(createStore, "label")
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function tempBundleRoot() {
  return await mkdtemp(join(tmpdir(), "bundle-store-"));
}

/**
 * @param {() => import("../dist/index.js").BundleStore | Promise<import("../dist/index.js").BundleStore>} factory
 * @param {string} label
 */
export function runBundleStoreTests(factory, label) {
  test(`BundleStore conformance: ${label}`, async (t) => {
    /** @type {import("../dist/index.js").BundleStore} */
    let store;

    t.beforeEach(async () => {
      store = await factory(await tempBundleRoot());
      await store.init();
    });

    await t.test("init creates writable store", async () => {
      await store.write("index.md", "# Hello");
      assert.equal(await store.exists("index.md"), true);
    });

    await t.test("write and read round-trip", async () => {
      const content = "---\ntype: Test\ntitle: Round Trip\n---\n\nBody content.\n";
      await store.write("concepts/test.md", content);
      const readBack = await store.read("concepts/test.md");
      assert.equal(readBack, content);
    });

    await t.test("read throws ENOENT for missing document", async () => {
      await assert.rejects(
        () => store.read("nonexistent.md"),
        (err) => err instanceof Error && err.code === "ENOENT",
      );
    });

    await t.test("write updates existing document", async () => {
      await store.write("concepts/v1.md", "v1");
      await store.write("concepts/v1.md", "v2");
      assert.equal(await store.read("concepts/v1.md"), "v2");
    });

    await t.test("exists returns false for missing, true for existing", async () => {
      assert.equal(await store.exists("no-such-file.md"), false);
      await store.write("sources/doc.md", "doc");
      assert.equal(await store.exists("sources/doc.md"), true);
    });

    await t.test("writeIfMissing writes when absent", async () => {
      await store.writeIfMissing("fresh.md", "first");
      assert.equal(await store.read("fresh.md"), "first");
    });

    await t.test("writeIfMissing does NOT overwrite existing", async () => {
      await store.write("persist.md", "original");
      await store.writeIfMissing("persist.md", "should-not-write");
      assert.equal(await store.read("persist.md"), "original");
    });

    await t.test("ensureDir does not throw", async () => {
      await store.ensureDir("concepts");
      await store.ensureDir("sources/sub/dir");
    });

    await t.test("listMarkdownPaths returns only .md files", async () => {
      await store.write("concepts/a.md", "# A");
      await store.write("concepts/b.md", "# B");
      await store.write("sources/x.md", "# X");
      await store.writeIfMissing("index.md", "# Index");
      await store.writeIfMissing("log.md", "# Log");

      const paths = await store.listMarkdownPaths();
      assert.ok(paths.includes("concepts/a.md"));
      assert.ok(paths.includes("concepts/b.md"));
      assert.ok(paths.includes("sources/x.md"));
      assert.ok(paths.includes("index.md"));
      assert.ok(paths.includes("log.md"));
    });

    await t.test("listMarkdownPaths returns empty for empty store", async () => {
      const paths = await store.listMarkdownPaths();
      assert.deepEqual(paths, []);
    });

    await t.test("exportTo copies all documents to filesystem", async () => {
      await store.write("sources/a.md", "content a");
      await store.write("concepts/b.md", "content b");
      await store.write("index.md", "# Index");

      const dest = await tempBundleRoot();
      const copied = await store.exportTo(dest, false);
      assert.ok(copied.includes("sources/a.md"));
      assert.ok(copied.includes("concepts/b.md"));
      assert.ok(copied.includes("index.md"));

      const aContent = await readFile(join(dest, "sources/a.md"), "utf8");
      assert.equal(aContent, "content a");
    });

    await t.test("relativePath returns the path", async () => {
      assert.equal(store.relativePath("sources/doc.md"), "sources/doc.md");
      assert.equal(store.relativePath("concepts/foo/bar.md"), "concepts/foo/bar.md");
    });

    await t.test("handles paths with special characters", async () => {
      const path = "sources/some-file_v2.1-final.md";
      const content = "special chars path test";
      await store.write(path, content);
      assert.equal(await store.read(path), content);
      assert.equal(await store.exists(path), true);
      const paths = await store.listMarkdownPaths();
      assert.ok(paths.includes(path));
    });

    await t.test("large content round-trip", async () => {
      const large = "# Large\n\n" + "x".repeat(100_000) + "\n";
      await store.write("sources/large.md", large);
      assert.equal(await store.read("sources/large.md"), large);
    });

    await t.test("many documents", async () => {
      const count = 50;
      for (let i = 0; i < count; i++) {
        await store.write(`sources/doc-${i}.md`, `# Doc ${i}`);
      }
      const paths = await store.listMarkdownPaths();
      assert.ok(paths.length >= count);
    });
  });
}
