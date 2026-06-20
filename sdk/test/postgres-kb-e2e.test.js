/**
 * End-to-end: KnowledgeBase + PostgresBundleStore full workflow.
 * Requires: docker compose -f docker-compose.pg-test.yml up -d
 * Or set PG_CONNECTION_STRING to an existing PostgreSQL instance.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Pool } from "pg";
import { KnowledgeBase, PostgresBundleStore } from "../dist/index.js";

const PG_URL = process.env.PG_CONNECTION_STRING ?? "postgresql://llm_wiki:llm_wiki_test@localhost:5433/llm_wiki_test";
const ROOT = "tenant://pg-e2e/kb";

function fakeProvider(responses) {
  return {
    async generate(_request) {
      const resp = responses.default ?? { text: "" };
      return { text: resp.text ?? "", citations: resp.citations ?? [], json: resp.json ?? undefined };
    },
  };
}

let pool;

test("PostgresBundleStore + KnowledgeBase E2E", async (t) => {
  t.before(async () => {
    pool = new Pool({ connectionString: PG_URL, max: 2, connectionTimeoutMillis: 3000 });
    try {
      await pool.query("SELECT 1");
    } catch {
      await pool.end().catch(() => {});
      throw new Error(`Cannot connect to ${PG_URL}. Start: docker compose -f docker-compose.pg-test.yml up -d`);
    }
    // Ensure table exists (first test's store.init() would create it, but beforeEach deletes before that)
    await pool.query(`CREATE TABLE IF NOT EXISTS okf_documents (
      bundle_id TEXT NOT NULL, path TEXT NOT NULL, content TEXT NOT NULL,
      created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
      PRIMARY KEY (bundle_id, path)
    )`);
  });

  t.after(async () => {
    await pool.query("DROP TABLE IF EXISTS okf_documents").catch(() => {});
    await pool.end().catch(() => {});
  });

  t.beforeEach(async () => {
    await pool.query("DELETE FROM okf_documents WHERE bundle_id = $1", [ROOT]);
  });

  // ── Tests ───────────────────────────────────────────────────────────────

  await t.test("create bundle and verify OKF structure", async () => {
    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.create({ root: ROOT, store });

    const status = await kb.status();
    assert.equal(status.sourceDocuments, 0);
    assert.equal(status.concepts, 0);

    assert.equal(await store.exists("index.md"), true);
    assert.equal(await store.exists("log.md"), true);
    const indexContent = await store.read("index.md");
    assert.ok(indexContent.includes("Knowledge Bundle"));
  });

  await t.test("open existing bundle", async () => {
    // Need to create first
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store });
    const status = await kb.status();
    assert.equal(status.sourceDocuments, 0);
  });

  await t.test("ingest markdown source and search", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store });

    const source = [
      "# StellarLink GEO 产品介绍",
      "",
      "星纬智联（StellarLink）提供企业级 GEO（生成式引擎优化）服务。",
      "核心产品包括 AI 搜索可见度监测、品牌知识库搭建、内容自动生成与多平台分发。",
    ].join("\n");

    const result = await kb.ingest({
      path: { kind: "text", text: source, title: "星纬智联产品介绍", contentType: "text/markdown" },
    });
    assert.equal(result.failed.length, 0);
    assert.equal(result.created.length, 1);

    const stored = await store.read(result.created[0]);
    assert.ok(stored.includes("StellarLink GEO"));

    const hits = await kb.search("GEO");
    assert.ok(hits.length > 0);
  });

  await t.test("write concepts with custom types", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store });

    await kb.writeConcept({
      path: "concepts/brand-profile.md",
      type: "Brand Profile",
      title: "星纬智联",
      description: "企业 GEO 服务品牌",
      tags: ["brand"],
      body: "## 公司简介\n\n星纬智联提供微信小程序、GEO、AI 自动化。\n",
    });
    await kb.writeConcept({
      path: "concepts/case-manufacturing.md",
      type: "Customer Case",
      title: "制造业案例",
      description: "曝光率提升 35%",
      tags: ["case"],
      body: "## 结果\n\n3 个月 AI 搜索曝光率提升 35%。\n",
    });
    await kb.writeConcept({
      path: "concepts/product-geo.md",
      type: "Product",
      title: "GEO 监测",
      description: "AI 引擎品牌监测",
      tags: ["product"],
      body: "## 功能\n\n监测 Doubao、Qwen、DeepSeek 中的品牌提及。\n",
    });

    const status = await kb.status();
    assert.equal(status.concepts, 3);

    const brandRaw = await store.read("concepts/brand-profile.md");
    assert.ok(brandRaw.includes("type: Brand Profile"));
    const caseRaw = await store.read("concepts/case-manufacturing.md");
    assert.ok(caseRaw.includes("type: Customer Case"));
  });

  await t.test("writeIndex regenerates entry point", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store });

    await kb.writeConcept({
      path: "concepts/test.md",
      type: "Concept",
      title: "Test",
      body: "# Test\n",
    });
    await kb.writeIndex({ title: "GEO 知识库", description: "企业品牌知识库。" });

    const indexContent = await store.read("index.md");
    assert.ok(indexContent.includes("GEO 知识库"));
    assert.ok(indexContent.includes("concepts/test.md"));
  });

  await t.test("validate passes for well-formed bundle", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store });

    await kb.writeConcept({
      path: "concepts/ok.md",
      type: "Concept",
      title: "OK",
      body: "# OK\n",
    });

    const validation = await kb.validate();
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  await t.test("validate catches missing type", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store });

    await store.write("concepts/no-type.md", "---\ntitle: Bad\n---\nNo type.\n");

    const validation = await kb.validate();
    assert.ok(validation.errors.some((e) => e.code === "missing_type"));
  });

  await t.test("synthesize with custom GEO prompt", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    const kb0 = await KnowledgeBase.create({ root: ROOT, store: s1 });
    await kb0.ingest({
      path: { kind: "text", text: "# Source\n\nGEO market data.", title: "Source", contentType: "text/plain" },
    });

    const llm = fakeProvider({
      default: {
        json: {
          concepts: [
            {
              path: "concepts/geo-competitor.md",
              type: "Competitor",
              title: "竞品分析",
              description: "主要竞品",
              tags: ["competitor"],
              body: "## 竞品\n\n数据。\n",
              sourcePaths: [],
            },
            {
              path: "concepts/evidence-report.md",
              type: "Evidence",
              title: "行业报告",
              description: "权威数据",
              tags: ["evidence"],
              body: "## 来源\n\nGartner。\n",
              sourcePaths: [],
            },
          ],
        },
      },
    });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store, llm });

    const result = await kb.synthesize({
      query: "GEO 竞品",
      instructions: "提取竞品信息和数据。",
      systemPrompt: "你是 GEO 架构师。生成 Competitor 和 Evidence 概念。",
      outputSchema: '{"concepts":[{"path":"...","type":"Competitor|Evidence",...}]}',
      limit: 5,
    });

    assert.equal(result.failed.length, 0);
    assert.ok(result.created.length >= 2);

    const content = await store.read("concepts/geo-competitor.md");
    assert.ok(content.includes("type: Competitor"));
    assert.ok(content.includes("generated_by: llm-wiki-sdk"));
  });

  await t.test("listConcepts filters by type", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store });

    await kb.writeConcept({ path: "concepts/a.md", type: "Brand Profile", title: "A", body: "# A\n" });
    await kb.writeConcept({ path: "concepts/b.md", type: "Customer Case", title: "B", body: "# B\n" });
    await kb.writeConcept({ path: "concepts/c.md", type: "Brand Profile", title: "C", body: "# C\n" });

    const brands = await kb.listConcepts({ type: "Brand Profile" });
    assert.equal(brands.length, 2);

    const cases = await kb.listConcepts({ type: "Customer Case" });
    assert.equal(cases.length, 1);
  });

  await t.test("export copies all documents to filesystem", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    const kb0 = await KnowledgeBase.create({ root: ROOT, store: s1 });
    await kb0.writeConcept({ path: "concepts/x.md", type: "Concept", title: "X", body: "# X\n" });

    const store = new PostgresBundleStore(pool, ROOT);
    const kb = await KnowledgeBase.open({ root: ROOT, store });
    const dest = await mkdtemp(join(tmpdir(), "pg-export-"));

    try {
      const exported = await kb.export({ path: dest });
      assert.ok(exported.created.length > 0);
      const onDisk = await readFile(join(dest, "concepts/x.md"), "utf8");
      assert.ok(onDisk.includes("# X"));
    } finally {
      await rm(dest, { recursive: true, force: true }).catch(() => {});
    }
  });

  await t.test("log records operations", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const logContent = await store.read("log.md");
    assert.ok(logContent.includes("Bundle Update Log"));
  });

  await t.test("tenant isolation", async () => {
    const storeA = new PostgresBundleStore(pool, "tenant://alpha/kb");
    await storeA.init();
    await storeA.write("sources/a.md", "# Alpha");
    const storeB = new PostgresBundleStore(pool, "tenant://beta/kb");
    await storeB.init();
    await storeB.write("sources/b.md", "# Beta");

    assert.equal(await storeA.exists("sources/b.md"), false);
    assert.equal(await storeB.exists("sources/a.md"), false);
  });

  await t.test("large content round-trip", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const large = "# Large\n\n" + "x".repeat(100_000) + "\n";
    await store.write("sources/large.md", large);
    assert.equal(await store.read("sources/large.md"), large);
  });

  await t.test("concurrent writes", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    const writes = [];
    for (let i = 0; i < 20; i++) {
      writes.push(store.write(`sources/c-${i}.md`, `# ${i}`));
    }
    await Promise.all(writes);
    const paths = await store.listMarkdownPaths();
    assert.ok(paths.filter((p) => p.startsWith("sources/c-")).length === 20);
  });

  await t.test("pool resilience", async () => {
    const s1 = new PostgresBundleStore(pool, ROOT);
    await KnowledgeBase.create({ root: ROOT, store: s1 });

    const store = new PostgresBundleStore(pool, ROOT);
    for (let i = 0; i < 10; i++) {
      await store.write(`sources/p-${i}.md`, `# Pool ${i}`);
      assert.equal(await store.read(`sources/p-${i}.md`), `# Pool ${i}`);
    }
  });
});
