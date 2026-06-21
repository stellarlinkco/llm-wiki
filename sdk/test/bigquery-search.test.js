import { test, assert, tempRoot, KnowledgeBase, writeFile, join } from "./helpers.js";
import { BigQuerySearchAdapter } from "../dist/infrastructure/bigquery-search.js";
import { FilesystemBundleStore } from "../dist/infrastructure/filesystem-store.js";

class FakeBigQueryClient {
  constructor() {
    this.rows = [];
    this.calls = [];
    this.projectExistsRows = false;
  }

  async execute(request) {
    this.calls.push({ kind: "execute", ...request });
    const bundleId = request.params?.bundle_id;
    if (typeof bundleId === "string" && /DELETE/i.test(request.query)) {
      this.rows = this.rows.filter((row) => row.bundle_id !== bundleId);
      return;
    }
    const rows = request.params?.rows;
    if (Array.isArray(rows)) {
      this.rows.push(...rows);
    }
  }

  async query(request) {
    this.calls.push({ kind: "query", ...request });
    const bundleId = request.params?.bundle_id;
    const queryText = String(request.params?.query_text ?? "");
    const tokens = queryText.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = this.rows
      .filter((row) => row.bundle_id === bundleId)
      .filter((row) => {
        const searchableText = `${row.title} ${row.content} ${(row.tags ?? []).join(" ")}`.toLowerCase();
        return tokens.length === 0 || tokens.some((token) => searchableText.includes(token));
      });
    if (this.projectExistsRows && /^SELECT path\b/i.test(request.query)) {
      return rows.map((row) => ({ path: row.path }));
    }
    return rows.map((row, index) => ({
      bundle_id: row.bundle_id,
      path: row.path,
      title: row.title,
      type: row.type,
      score: row.score ?? 1 - index * 0.1,
      snippet: row.snippet ?? row.content.slice(0, 80),
      tags: row.tags ?? [],
      content: row.content,
    }));
  }
}

test("BigQuerySearchAdapter indexes rows under bundle namespace", async () => {
  const root = await tempRoot();
  const store = new FilesystemBundleStore(root);
  await store.init();
  const client = new FakeBigQueryClient();
  const adapter = new BigQuerySearchAdapter({
    bundleId: "tenant-a",
    tableFqn: "project.dataset.search_index",
    store,
    client,
  });

  await adapter.index([
    {
      path: "concepts/retrieved.md",
      title: "Retrieved Concept",
      type: "Concept",
      tags: ["geo"],
      content: "Retrieved concept body for search.",
      tokens: ["retrieved", "concept"],
    },
  ]);

  assert.equal(client.rows.length, 1);
  assert.equal(client.rows[0].bundle_id, "tenant-a");
  assert.equal(client.rows[0].path, "concepts/retrieved.md");
  assert.ok(await adapter.exists());
});

test("BigQuerySearchAdapter query SQL filters query text against title, content, and tags", async () => {
  const root = await tempRoot();
  const store = new FilesystemBundleStore(root);
  await store.init();
  await store.write("concepts/title.md", "---\ntype: Concept\ntitle: Title\n---\n\nBody.\n");
  await store.write("concepts/content.md", "---\ntype: Concept\ntitle: Content\n---\n\nBody.\n");
  await store.write("concepts/tagged.md", "---\ntype: Concept\ntitle: Tagged\n---\n\nBody.\n");
  const client = new FakeBigQueryClient();
  client.rows.push(
    {
      bundle_id: "tenant-a",
      path: "concepts/title.md",
      title: "Alpha title",
      type: "Concept",
      tags: [],
      content: "Unmatched body.",
    },
    {
      bundle_id: "tenant-a",
      path: "concepts/content.md",
      title: "Unmatched title",
      type: "Concept",
      tags: [],
      content: "Omega body.",
    },
    {
      bundle_id: "tenant-a",
      path: "concepts/tagged.md",
      title: "Unmatched title",
      type: "Concept",
      tags: ["taxonomy"],
      content: "Unmatched body.",
    },
  );
  const adapter = new BigQuerySearchAdapter({
    bundleId: "tenant-a",
    tableFqn: "project.dataset.search_index",
    store,
    client,
  });

  const titleResults = await adapter.search("alpha", { limit: 5 });
  const contentResults = await adapter.search("omega", { limit: 5 });
  const tagResults = await adapter.search("taxonomy", { limit: 5 });
  const missingResults = await adapter.search("missing", { limit: 5 });
  const searchCall = client.calls.find((call) => call.kind === "query" && call.params?.query_text === "taxonomy");

  assert.deepEqual(
    titleResults.map((result) => result.path),
    ["concepts/title.md"],
  );
  assert.deepEqual(
    contentResults.map((result) => result.path),
    ["concepts/content.md"],
  );
  assert.deepEqual(
    tagResults.map((result) => result.path),
    ["concepts/tagged.md"],
  );
  assert.deepEqual(missingResults, []);
  assert.ok(searchCall, "expected a BigQuery search request");
  assert.match(searchCall.query, /bundle_id = @bundle_id/);
  assert.match(searchCall.query, /@query_tokens/);
  assert.match(searchCall.query, /title/i);
  assert.match(searchCall.query, /content/i);
  assert.match(searchCall.query, /tags/i);
  assert.doesNotMatch(searchCall.query, /@query_text\s*!=\s*''/);
});

test("KnowledgeBase.search does not reindex BigQuery adapter when indexed bundle exists", async () => {
  const root = await tempRoot();
  const store = new FilesystemBundleStore(root);
  await store.init();
  const client = new FakeBigQueryClient();
  client.projectExistsRows = true;
  const search = new BigQuerySearchAdapter({
    bundleId: "tenant-a",
    tableFqn: "project.dataset.search_index",
    store,
    client,
  });
  const kb = await KnowledgeBase.create({ root, search, store });
  await kb.writeConcept({
    path: "concepts/searchable.md",
    title: "Searchable",
    body: "Needle content for search.",
  });

  await kb.search("needle");
  await kb.search("needle");

  const deleteCalls = client.calls.filter((call) => call.kind === "execute" && /DELETE FROM/i.test(call.query));
  const insertCalls = client.calls.filter((call) => call.kind === "execute" && /INSERT INTO/i.test(call.query));
  assert.equal(deleteCalls.length, 1);
  assert.equal(insertCalls.length, 1);
});

test("BigQuerySearchAdapter rejects cross-bundle rows and unreadable bundle paths", async () => {
  const root = await tempRoot();
  const store = new FilesystemBundleStore(root);
  await store.init();
  await store.write("concepts/retrieved.md", "---\ntype: Concept\ntitle: Retrieved\n---\n\nBody.\n");
  const client = new FakeBigQueryClient();
  client.rows.push(
    {
      bundle_id: "tenant-a",
      path: "concepts/retrieved.md",
      title: "Retrieved Concept",
      type: "Concept",
      tags: [],
      content: "Retrieved concept body for search.",
    },
    {
      bundle_id: "tenant-b",
      path: "concepts/other-bundle.md",
      title: "Other Bundle",
      type: "Concept",
      tags: [],
      content: "Other bundle body for search.",
    },
    {
      bundle_id: "tenant-a",
      path: "concepts/missing-local.md",
      title: "Missing Local",
      type: "Concept",
      tags: [],
      content: "Missing local body for search.",
    },
  );
  const adapter = new BigQuerySearchAdapter({
    bundleId: "tenant-a",
    tableFqn: "project.dataset.search_index",
    store,
    client,
  });

  const results = await adapter.search("retrieved search", { limit: 5 });

  assert.deepEqual(
    results.map((result) => result.path),
    ["concepts/retrieved.md"],
  );
  assert.equal(results[0]?.title, "Retrieved Concept");
  assert.equal(typeof results[0]?.score, "number");
  assert.ok(Array.isArray(results[0]?.tags));
});

test("KnowledgeBase.query keeps citation integrity with BigQuerySearchAdapter", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(source, "# Architecture\n\nClean Architecture separates domain logic from infrastructure.\n", "utf8");
  const client = new FakeBigQueryClient();
  const store = new FilesystemBundleStore(root);
  await store.init();
  const search = new BigQuerySearchAdapter({
    bundleId: "tenant-a",
    tableFqn: "project.dataset.search_index",
    store,
    client,
  });
  const provider = {
    async generate() {
      return {
        text: "See [missing](concepts/not-retrieved.md) and [ok](sources/architecture.md).",
        citations: ["concepts/not-retrieved.md", "sources/architecture.md"],
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm: provider, search, store });
  await kb.ingest({ path: source });
  const answer = await kb.query("What does Clean Architecture separate?");

  assert.deepEqual(answer.citations, ["sources/architecture.md"]);
  assert.match(answer.text, /\[ok\]\(sources\/architecture\.md\)/);
  assert.doesNotMatch(answer.text, /concepts\/not-retrieved\.md/);
});
