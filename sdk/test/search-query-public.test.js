import { test, assert, readFile, writeFile, join, tempRoot, KnowledgeBase } from "./helpers.js";

test("deterministic public workflow runs without an LLM provider", async () => {
  const root = await tempRoot();
  const exportRoot = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "operations.md");
  await writeFile(source, "# Operations\n\nRunbooks describe deterministic SDK workflows.\n", "utf8");

  await KnowledgeBase.create({ root });
  const kb = await KnowledgeBase.open({ root });
  const ingest = await kb.ingest({ path: source });
  const write = await kb.writeConcept({
    path: "concepts/operations.md",
    title: "Operations",
    type: "Runbook",
    body: "Deterministic workflows can search, validate, report status, list concepts, and export.",
  });
  const searchResults = await kb.search("deterministic workflows", { limit: 2 });
  const validation = await kb.validate();
  const status = await kb.status();
  const concepts = await kb.listConcepts({ type: "Runbook" });
  const exported = await kb.export({ path: exportRoot });

  assert.deepEqual(ingest.failed, []);
  assert.deepEqual(write.failed, []);
  assert.ok(searchResults.some((result) => result.path === "concepts/operations.md"));
  assert.deepEqual(validation.errors, []);
  assert.equal(status.concepts, 1);
  assert.equal(status.sourceDocuments, 1);
  assert.equal(status.searchIndexExists, true);
  assert.deepEqual(
    concepts.map((concept) => concept.path),
    ["concepts/operations.md"],
  );
  assert.deepEqual(exported.failed, []);
  assert.match(await readFile(join(exportRoot, "concepts", "operations.md"), "utf8"), /^type: Runbook$/m);
});

test("MiniSearch is the default search path and custom SearchAdapters are explicit", async () => {
  const defaultRoot = await tempRoot();
  const defaultKb = await KnowledgeBase.create({ root: defaultRoot });
  await defaultKb.writeConcept({
    path: "concepts/products.md",
    title: "Product Portfolio",
    body: "DeepResearch and vibeBuilder are StellarLink products.",
  });

  assert.equal((await defaultKb.search("vibeBuil", { limit: 1 }))[0]?.path, "concepts/products.md");
  assert.equal((await defaultKb.search("DeepReserch", { limit: 1 }))[0]?.path, "concepts/products.md");

  const customRoot = await tempRoot();
  const indexed = [];
  const search = {
    async index(documents) {
      indexed.push(...documents);
    },
    async search(query, options) {
      return [
        {
          path: `custom:${query}:${options.limit}`,
          title: "Custom",
          type: "Injected",
          score: 1,
          snippet: "custom",
          tags: [],
        },
      ];
    },
    async exists() {
      return indexed.length > 0;
    },
  };

  const customKb = await KnowledgeBase.create({ root: customRoot, search });
  await customKb.writeConcept({
    path: "concepts/custom.md",
    title: "Custom",
    body: "Custom adapter content.",
  });

  assert.equal(indexed[0].path, "concepts/custom.md");
  assert.deepEqual(await customKb.search("adapter", { limit: 3 }), [
    { path: "custom:adapter:3", title: "Custom", type: "Injected", score: 1, snippet: "custom", tags: [] },
  ]);
});
