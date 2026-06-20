import {
  test,
  assert,
  readFile,
  writeFile,
  readdir,
  mkdir,
  dirname,
  join,
  fileURLToPath,
  tempRoot,
  withUrlRequester,
  pdfFixture,
  docxFixture,
  pptxFixture,
  AnthropicProvider,
  KnowledgeBase,
  ConfigurationError,
  DefaultSourceParser,
  OpenAIProvider,
  ParserError,
  setUrlHostResolverForTesting,
  setUrlRequesterForTesting,
} from "./helpers.js";

test("create writes the default OKF bundle layout", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  const status = await kb.status();
  assert.equal(status.root, root);
  assert.equal(status.concepts, 0);
  assert.deepEqual((await readdir(root)).sort(), [".llm-wiki", "concepts", "index.md", "log.md", "references", "sources"]);
  assert.match(await readFile(join(root, "index.md"), "utf8"), /okf_version: "0.1"/);
});

test("ingest creates a conformant OKF source concept and searchable index without an LLM", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(source, "# Architecture\n\nClean Architecture keeps domain logic independent from infrastructure.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });

  assert.deepEqual(changeSet.failed, []);
  assert.equal(changeSet.created.length, 1);

  const sourceDoc = await readFile(join(root, "sources", "architecture.md"), "utf8");
  assert.match(sourceDoc, /^---\ntype: Source Document\n/m);
  assert.match(sourceDoc, /title: Architecture/);
  assert.match(sourceDoc, /source_path:/);
  assert.match(sourceDoc, /content_hash:/);

  const validation = await kb.validate();
  assert.deepEqual(validation.errors, []);

  const results = await kb.search("domain infrastructure");
  assert.equal(results.length, 1);
  assert.equal(results[0].path, "sources/architecture.md");
  assert.equal(results[0].type, "Source Document");
  assert.match(results[0].snippet, /domain logic independent/);
});

test("writeConcept creates a concept document, audit entry, and searchable index", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  const changeSet = await kb.writeConcept({
    path: "concepts/company-overview.md",
    title: "Company Overview",
    description: "Public company positioning.",
    tags: ["company", "overview"],
    body: "StellarLink builds AI digital transformation products.",
    sourcePaths: ["sources/home.md"],
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.created, ["concepts/company-overview.md"]);

  const conceptDoc = await readFile(join(root, "concepts", "company-overview.md"), "utf8");
  assert.match(conceptDoc, /^type: Concept$/m);
  assert.match(conceptDoc, /^title: Company Overview$/m);
  assert.match(conceptDoc, /source_paths: \[sources\/home\.md\]/);
  assert.match(conceptDoc, /StellarLink builds AI digital transformation products/);

  const log = await readFile(join(root, "log.md"), "utf8");
  assert.match(log, /\*\*writeConcept\*\*: Created: concepts\/company-overview\.md/);

  const results = await kb.search("digital transformation products");
  assert.equal(results[0].path, "concepts/company-overview.md");
  assert.equal(results[0].type, "Concept");
});

test("search ranks broad concept matches above repeated single-term source noise", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "noisy-feed.md");
  await writeFile(source, `# Noisy Feed\n\n${"agent ".repeat(120)}\n`, "utf8");

  const kb = await KnowledgeBase.create({ root });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/product-interfaces.md",
    title: "Product Interfaces",
    body: "StellarLink products expose agent interfaces for AI discovery.",
  });

  const results = await kb.search("StellarLink products agent interfaces", { limit: 2 });
  assert.equal(results[0].path, "concepts/product-interfaces.md");
});

test("search matches Chinese queries without whitespace token boundaries", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await kb.writeConcept({
    path: "concepts/core-capabilities.md",
    title: "星纬智联核心能力",
    body: "星纬智联提供微信小程序、GEO优化、RPA+Agent自动化和FDE全流程交付工程。",
  });

  const results = await kb.search("星纬智联有哪些核心能力", { limit: 1 });

  assert.equal(results[0]?.path, "concepts/core-capabilities.md");
});

test("writeIndex creates a bundle entry point listing sources and concepts", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "company.md");
  await writeFile(source, "# Company Source\n\nSource body.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/company-overview.md",
    title: "Company Overview",
    body: "Concept body.",
  });
  const changeSet = await kb.writeIndex({
    title: "Company Knowledge Base",
    description: "Generated bundle entry point.",
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["index.md"]);
  const indexDoc = await readFile(join(root, "index.md"), "utf8");
  assert.match(indexDoc, /^# Company Knowledge Base$/m);
  assert.match(indexDoc, /Generated bundle entry point/);
  assert.match(indexDoc, /- \[Company Source\]\(sources\/company\.md\) — Source Document/);
  assert.match(indexDoc, /- \[Company Overview\]\(concepts\/company-overview\.md\) — Concept/);
  assert.deepEqual((await kb.validate()).errors, []);
});

test("status reports source documents separately from concept documents", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "company.md");
  await writeFile(source, "# Company\n\nSource body.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/company.md",
    title: "Company",
    body: "Concept body.",
  });

  const status = await kb.status();
  assert.equal(status.concepts, 1);
  assert.equal(status.sourceDocuments, 1);
  assert.equal(status.documents, 2);
});

test("crawl ingests same-origin sitemap URLs through the public SDK workflow", async () => {
  const root = await tempRoot();
  await withUrlRequester({
    "https://public.example/sitemap.xml": { contentType: "application/xml", body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>https://public.example/docs/one.md</loc></url>
  <url><loc>https://other.example/docs/skip.md</loc></url>
  <url><loc>https://public.example/docs/two.md</loc></url>
</urlset>` },
    "https://public.example/docs/one.md": { contentType: "text/markdown", body: "# One\n\nFirst crawled source." },
    "https://public.example/docs/two.md": { contentType: "text/markdown", body: "# Two\n\nSecond crawled source." },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    const changeSet = await kb.crawl({ sitemapUrl: "https://public.example/sitemap.xml" });

    assert.deepEqual(changeSet.failed, []);
    assert.deepEqual(changeSet.created, ["sources/one.md", "sources/two.md"]);
    assert.deepEqual(changeSet.skipped, ["https://other.example/docs/skip.md"]);
    const results = await kb.search("crawled source");
    assert.deepEqual(results.map((result) => result.path).sort(), ["sources/one.md", "sources/two.md"]);
  });
});

test("crawl reports sitemap fetch failure without writing source documents", async () => {
  const root = await tempRoot();
  await withUrlRequester({
    "https://public.example/sitemap.xml": { status: 403, contentType: "application/xml", body: "Forbidden" },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    const changeSet = await kb.crawl({ sitemapUrl: "https://public.example/sitemap.xml" });

    assert.equal(changeSet.created.length, 0);
    assert.equal(changeSet.failed.length, 1);
    assert.equal(changeSet.failed[0].code, "FETCH_FAILED");
    assert.deepEqual(await readdir(join(root, "sources")), []);
  });
});

test("synthesize writes LLM-produced concepts from retrieved source context", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "company.md");
  await writeFile(source, "# Company\n\nStellarLink builds AI knowledge systems for enterprises.\n", "utf8");
  const requests = [];
  const llm = {
    async generate(request) {
      requests.push(request);
      assert.equal(request.structuredOutput?.type, "json");
      assert.match(request.messages.at(-1).content, /sources\/company\.md/);
      return {
        text: JSON.stringify({
          concepts: [{
            path: "concepts/company-overview.md",
            title: "Company Overview",
            description: "Synthesized company positioning.",
            tags: ["company"],
            body: "StellarLink builds AI knowledge systems for enterprises.",
            sourcePaths: ["sources/company.md"],
          }],
        }),
        json: {
          concepts: [{
            path: "concepts/company-overview.md",
            title: "Company Overview",
            description: "Synthesized company positioning.",
            tags: ["company"],
            body: "StellarLink builds AI knowledge systems for enterprises.",
            sourcePaths: ["sources/company.md"],
          }],
        },
      };
    },
  };


  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  const changeSet = await kb.synthesize({ query: "StellarLink enterprises", instructions: "Create a company overview concept.", limit: 3 });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.created, ["concepts/company-overview.md"]);
  assert.equal(requests.length, 1);
  const conceptDoc = await readFile(join(root, "concepts", "company-overview.md"), "utf8");
  assert.match(conceptDoc, /^generated_by: llm-wiki-sdk$/m);
  assert.match(conceptDoc, /source_paths: \[sources\/company\.md\]/);
  assert.match(conceptDoc, /StellarLink builds AI knowledge systems/);
});

test("synthesize grounds prompts in source documents rather than existing concepts", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "official.md");
  await writeFile(source, "# Official\n\nStellarLink interfaces are live in public source documents.\n", "utf8");
  let prompt = "";
  const llm = {
    async generate(request) {
      prompt = request.messages.at(-1).content;
      return {
        text: JSON.stringify({
          concepts: [{
            path: "concepts/interfaces.md",
            title: "Interfaces",
            body: "StellarLink interfaces are live.",
          }],
        }),
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/stale.md",
    title: "Stale Concept",
    body: "StellarLink interfaces are not live.",
  });
  await kb.synthesize({ query: "StellarLink interfaces", instructions: "Update interfaces concept.", limit: 5 });

  assert.match(prompt, /sources\/official\.md/);
  assert.doesNotMatch(prompt, /concepts\/stale\.md/);
});

test("synthesize records a bundle-level audit entry", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "company.md");
  await writeFile(source, "# Company\n\nStellarLink builds AI knowledge systems for enterprises.\n", "utf8");
  const llm = {
    async generate() {
      return {
        text: JSON.stringify({
          concepts: [{
            path: "concepts/company-overview.md",
            title: "Company Overview",
            body: "StellarLink builds AI knowledge systems for enterprises.",
          }],
        }),
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  await kb.synthesize({ query: "StellarLink enterprises", instructions: "Create a company overview concept." });

  const log = await readFile(join(root, "log.md"), "utf8");
  assert.match(log, /\*\*synthesize\*\*: Query: StellarLink enterprises; Created: concepts\/company-overview\.md/);
});

test("URL-looking text titles do not escape ChangeSet failures", async () => {
  const root = await tempRoot();
  const parser = {
    async parse() {
      return { title: "https://user:pass@@", description: "bad title", body: "URL-looking title body" };
    },
  };

  const kb = await KnowledgeBase.create({ root, parser });
  const changeSet = await kb.ingest({ path: { kind: "text", title: "https://user:pass@@", text: "body" } });

  assert.deepEqual(changeSet.failed, []);
  assert.equal(changeSet.created.length, 1);
});

test("listConcepts filters arbitrary OKF types and export copies bundle files without cache", async () => {
  const root = await tempRoot();
  const exportRoot = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "metric.md"), "---\ntype: Metric\ntitle: Weekly Active Users\nextra_field: preserved\n---\n\nA product metric.\n", "utf8");
  await kb.reindex();

  const concepts = await kb.listConcepts({ type: "Metric" });
  assert.equal(concepts.length, 1);
  assert.equal(concepts[0].frontmatter.type, "Metric");
  assert.equal(concepts[0].frontmatter.extra_field, "preserved");

  const changeSet = await kb.export({ path: exportRoot });
  assert.deepEqual(changeSet.failed, []);
  assert.match(await readFile(join(exportRoot, "concepts", "metric.md"), "utf8"), /extra_field: preserved/);
  await assert.rejects(() => readFile(join(exportRoot, ".llm-wiki", "search-index.json"), "utf8"));
});

test("export rejects destinations inside the bundle root", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await assert.rejects(
    () => kb.export({ path: join(root, "export") }),
    (error) => error instanceof ConfigurationError && /inside the bundle root/.test(error.message)
  );
});

test("ingest keeps same-basename sources distinct by path identity", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  await writeFile(join(sourceRoot, "service-a.md"), "placeholder", "utf8");
  const dirA = join(sourceRoot, "service-a");
  const dirB = join(sourceRoot, "service-b");
  await import("node:fs/promises").then(({ mkdir }) => Promise.all([mkdir(dirA), mkdir(dirB)]));
  const sourceA = join(dirA, "README.md");
  const sourceB = join(dirB, "README.md");
  await writeFile(sourceA, "# Service A\n\nAlpha service owns billing.\n", "utf8");
  await writeFile(sourceB, "# Service B\n\nBeta service owns support.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  const first = await kb.ingest({ path: sourceA });
  const second = await kb.ingest({ path: sourceB });

  assert.equal(first.created.length, 1);
  assert.equal(second.created.length, 1);
  assert.notEqual(first.created[0], second.created[0]);
  assert.equal((await kb.search("service owns", { limit: 10 })).length, 2);
});

test("ingest truncates long URL slugs before writing source documents", async () => {
  const root = await tempRoot();
  const longSlug = "spec-" + "very-long-title-".repeat(30);
  const url = `https://public.example/articles/${longSlug}`;
  await withUrlRequester({
    [url]: { contentType: "text/markdown", body: "# Long Article\n\nLong URL body." },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    const changeSet = await kb.ingest({ path: url });

    assert.deepEqual(changeSet.failed, []);
    assert.equal(changeSet.created.length, 1);
    assert.ok(changeSet.created[0].length < 240);
    assert.match(await readFile(join(root, changeSet.created[0]), "utf8"), /Long URL body/);
  });
});

test("validate treats root-absolute links in URL sources as external site links", async () => {
  const root = await tempRoot();
  await withUrlRequester({
    "https://public.example/docs/page.md": { contentType: "text/markdown", body: "# Page\n\nSee [Guide](/posts/guide).\n" },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    await kb.ingest({ path: "https://public.example/docs/page.md" });
    const validation = await kb.validate();

    assert.deepEqual(validation.errors, []);
    assert.deepEqual(validation.warnings, []);
  });
});

test("validate treats relative links in URL sources as external site links", async () => {
  const root = await tempRoot();
  await withUrlRequester({
    "https://public.example/docs/page.md": { contentType: "text/markdown", body: "# Page\n\nSee [Sibling](sibling.md) and [Parent](../README.md).\n" },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    await kb.ingest({ path: "https://public.example/docs/page.md" });
    const validation = await kb.validate();

    assert.deepEqual(validation.errors, []);
    assert.deepEqual(validation.warnings, []);
  });
});

test("ingest avoids OKF reserved filenames for source concepts", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "index.md");
  await writeFile(source, "# Source Index\n\nReserved filenames should not become concept IDs.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });

  assert.deepEqual(changeSet.created, ["sources/source-index.md"]);
  assert.deepEqual((await kb.validate()).errors, []);
  assert.equal((await kb.search("reserved filenames")).length, 1);
});

test("update writes update audit entries instead of ingest entries", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(source, "# Architecture\n\nFirst version.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  await kb.update({ path: source });

  const log = await readFile(join(root, "log.md"), "utf8");
  assert.match(log, /\*\*update\*\*/);
  assert.doesNotMatch(log, /\*\*ingest\*\*/);
});

test("custom parser and search adapters are injectable through KnowledgeBase options", async () => {
  const root = await tempRoot();
  const indexed = [];
  const search = {
    async index(documents) {
      indexed.push(...documents);
    },
    async search(query, options) {
      return [{ path: `custom:${query}:${options.limit}`, title: "Custom", type: "Injected", score: 1, snippet: "custom", tags: [] }];
    },
    async exists() {
      return indexed.length > 0;
    }
  };
  const parser = {
    async parse() {
      return { title: "Parsed Title", description: "Parsed description", body: "Injected adapter body" };
    }
  };

  const kb = await KnowledgeBase.create({ root, parser, search });
  const changeSet = await kb.ingest({ path: join(root, "virtual-source.md") });
  const results = await kb.search("adapter", { limit: 3 });

  assert.deepEqual(changeSet.failed, []);
  assert.equal(indexed[0].title, "Parsed Title");
  assert.deepEqual(results, [{ path: "custom:adapter:3", title: "Custom", type: "Injected", score: 1, snippet: "custom", tags: [] }]);
});

test("ingest persists parser metadata and structured parser failures", async () => {
  const root = await tempRoot();
  const parser = {
    async parse(input) {
      if (typeof input !== "string" && input.kind === "url") {
        throw new ParserError("UNSUPPORTED_SOURCE", "No remote source.", { url: input.url });
      }
      return {
        title: "Audited Source",
        description: "Audited description",
        body: "Audited parser body",
        metadata: { parser: "custom", page_count: 2, warnings: ["lossy conversion"], url: "https://user:secret@example.com/private?token=secret", audit: { callback: "https://user:secret@example.com/hook?token=secret" } },
      };
    }
  };

  const kb = await KnowledgeBase.create({ root, parser });
  const success = await kb.ingest({ path: join(root, "audited.md") });
  const sourceDoc = await readFile(join(root, "sources", "audited.md"), "utf8");
  const failure = await kb.ingest({ path: "ftp://example.com/remote.md" });

  assert.deepEqual(success.failed, []);
  assert.match(sourceDoc, /parser: custom/);
  assert.match(sourceDoc, /page_count: 2/);
  assert.match(sourceDoc, /warnings: \[lossy conversion\]/);
  assert.doesNotMatch(sourceDoc, /secret/);
  assert.equal(failure.failed[0].code, "UNSUPPORTED_SOURCE");
  assert.equal(failure.failed[0].source.url, "ftp://example.com/remote.md");
});

test("ingest reports committed source when reindex fails after write", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "indexed.md");
  await writeFile(source, "# Indexed\n\nCommitted before index failure.\n", "utf8");
  const search = {
    async index() {
      throw new Error("index unavailable");
    },
    async search() {
      return [];
    },
    async exists() {
      return false;
    },
  };

  const kb = await KnowledgeBase.create({ root, search });
  const changeSet = await kb.ingest({ path: source });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.created, ["sources/indexed.md"]);
  assert.equal(changeSet.warnings[0].code, "reindex_failed");
  assert.match(await readFile(join(root, "sources", "indexed.md"), "utf8"), /Committed before index failure/);
});
