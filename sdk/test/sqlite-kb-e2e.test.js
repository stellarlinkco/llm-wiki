/**
 * End-to-end: KnowledgeBase + SqliteBundleStore full workflow.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { KnowledgeBase, SqliteBundleStore } from "../dist/index.js";

function fakeProvider(responses) {
  return {
    async generate(request) {
      const key = JSON.stringify(request.messages.map((m) => m.role));
      const resp = responses[key] ?? responses.default ?? { text: "" };
      return { text: resp.text ?? "", citations: resp.citations ?? [], json: resp.json ?? undefined };
    },
  };
}

test("SqliteBundleStore + KnowledgeBase E2E", async (t) => {
  const db = new Database(":memory:");
  db.pragma("journal_mode = WAL");

  await t.test("create bundle and verify OKF structure", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.create({
      root: "tenant://demo/kb",
      store,
    });

    const status = await kb.status();
    assert.equal(status.sourceDocuments, 0);
    assert.equal(status.concepts, 0);
    assert.equal(status.documents, 0);
  });

  await t.test("ingest markdown source and search", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.open({
      root: "tenant://demo/kb",
      store,
    });

    const source = [
      "# StellarLink GEO 产品介绍",
      "",
      "星纬智联（StellarLink）提供企业级 GEO（生成式引擎优化）服务。",
      "核心产品包括 AI 搜索可见度监测、品牌知识库搭建、内容自动生成与多平台分发。",
      "客户案例：某制造业企业在 3 个月内 AI 搜索曝光率提升 35%。",
      "技术特色：FDE 方法强调事实、数据和证据链。",
    ].join("\n");

    const result = await kb.ingest({
      path: {
        kind: "text",
        text: source,
        title: "星纬智联产品介绍",
        contentType: "text/markdown",
      },
    });
    assert.equal(result.failed.length, 0);
    assert.equal(result.created.length, 1);
    assert.ok(result.created[0].startsWith("sources/"));

    const hits = await kb.search("GEO");
    assert.ok(hits.length > 0);

    const hitWithGeo = hits.find((h) => h.snippet.includes("GEO") || h.title.includes("星纬"));
    assert.ok(hitWithGeo);
  });

  await t.test("write concepts with custom types", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.open({
      root: "tenant://demo/kb",
      store,
    });

    const brandResult = await kb.writeConcept({
      path: "concepts/brand-profile.md",
      type: "Brand Profile",
      title: "星纬智联 — 品牌主体",
      description: "企业 GEO 服务品牌核心信息",
      tags: ["brand", "core"],
      body: "## 公司简介\n\n星纬智联提供微信小程序、GEO、AI 自动化和 FDE 能力。\n\n## 产品\n\n- AI 搜索可见度监测\n- 品牌知识库搭建\n- 内容自动生成与多平台分发\n",
    });
    assert.equal(brandResult.created.length, 1);
    assert.equal(brandResult.created[0], "concepts/brand-profile.md");

    const caseResult = await kb.writeConcept({
      path: "concepts/case-manufacturing.md",
      type: "Customer Case",
      title: "制造业客户案例",
      description: "3 个月 AI 搜索曝光率提升 35%",
      tags: ["case", "manufacturing"],
      body: "## 背景\n\n某制造业企业面临 AI 搜索可见度低的问题。\n\n## 方案\n\n搭建 FDE 品牌知识库 + GEO 内容策略。\n\n## 结果\n\n3 个月后 AI 搜索曝光率提升 35%。\n",
    });
    assert.equal(caseResult.created.length, 1);

    const status = await kb.status();
    assert.equal(status.concepts, 2);
  });

  await t.test("writeIndex regenerates entry point", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.open({
      root: "tenant://demo/kb",
      store,
    });

    await kb.writeIndex({
      title: "StellarLink GEO 知识库",
      description: "企业 GEO 服务品牌知识库。",
    });

    const indexContent = await store.read("index.md");
    assert.ok(indexContent.includes("StellarLink GEO 知识库"));
    assert.ok(indexContent.includes("[Sources](sources/index.md)"));
    assert.ok(indexContent.includes("[Concepts](concepts/index.md)"));
    const conceptsIndex = await store.read("concepts/index.md");
    assert.ok(conceptsIndex.includes("brand-profile.md"));
    assert.ok(conceptsIndex.includes("case-manufacturing.md"));
  });

  await t.test("validate passes for well-formed bundle", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.open({
      root: "tenant://demo/kb",
      store,
    });

    const validation = await kb.validate();
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);
  });

  await t.test("validate catches missing type", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.open({
      root: "tenant://demo/kb",
      store,
    });

    // Write a doc without type in frontmatter
    await store.write("concepts/no-type.md", "---\ntitle: Missing Type\n---\n\nBody without type.\n");

    const validation = await kb.validate();
    const missing = validation.errors.find((e) => e.code === "missing_type");
    assert.ok(missing);
    assert.equal(missing.path, "concepts/no-type.md");
  });

  await t.test("synthesize with custom GEO prompt", async () => {
    const llm = fakeProvider({
      default: {
        json: {
          concepts: [
            {
              path: "concepts/geo-competitor.md",
              type: "Competitor",
              title: "竞品分析 — GEO 市场",
              description: "主要竞争对手对比分析",
              tags: ["competitor", "geo"],
              body: "## 竞品对比\n\n基于公开资料整理。\n",
              sourcePaths: [],
            },
          ],
        },
      },
    });

    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.open({
      root: "tenant://demo/kb",
      store,
      llm,
    });

    const result = await kb.synthesize({
      query: "GEO 竞品",
      instructions: "从已有资料提取竞品信息，生成竞品分析页。",
      systemPrompt: "你是 GEO 知识库架构师。只提取事实，不编造。",
      outputSchema: '返回 JSON：{"concepts":[{"path":"...","type":"Competitor","title":"...","body":"..."}]}',
      limit: 5,
    });

    assert.equal(result.failed.length, 0);
    assert.ok(result.created.length >= 1);

    const conceptContent = await store.read("concepts/geo-competitor.md");
    assert.ok(conceptContent.includes("generated_by: llm-wiki-sdk"));
    assert.ok(conceptContent.includes("type: Competitor"));
  });

  await t.test("listConcepts filters by type", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.open({
      root: "tenant://demo/kb",
      store,
    });

    const brandConcepts = await kb.listConcepts({ type: "Brand Profile" });
    assert.equal(brandConcepts.length, 1);
    assert.equal(brandConcepts[0].path, "concepts/brand-profile.md");

    const caseConcepts = await kb.listConcepts({ type: "Customer Case" });
    assert.equal(caseConcepts.length, 1);
    assert.equal(caseConcepts[0].path, "concepts/case-manufacturing.md");
  });

  await t.test("export copies all documents to filesystem", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const kb = await KnowledgeBase.open({
      root: "tenant://demo/kb",
      store,
    });

    const dest = await mkdtemp(join(tmpdir(), "kb-export-"));
    const exported = await kb.export({ path: dest });
    assert.ok(exported.created.length > 0);

    const indexOnDisk = await readFile(join(dest, "index.md"), "utf8");
    assert.ok(indexOnDisk.includes("StellarLink GEO"));
  });

  await t.test("log records all operations", async () => {
    const store = new SqliteBundleStore(db, "tenant://demo/kb");
    const logContent = await store.read("log.md");

    assert.ok(logContent.includes("ingest"));
    assert.ok(logContent.includes("writeConcept"));
    assert.ok(logContent.includes("writeIndex"));
    assert.ok(logContent.includes("synthesize"));
  });

  await t.test("tenant isolation — separate bundles don't leak", async () => {
    const storeA = new SqliteBundleStore(db, "tenant://alpha/kb");
    await storeA.init();
    await storeA.write("sources/alpha-only.md", "# Alpha secret");

    const storeB = new SqliteBundleStore(db, "tenant://beta/kb");
    await storeB.init();
    await storeB.write("sources/beta-only.md", "# Beta secret");

    // Alpha should NOT see beta's content
    assert.equal(await storeA.exists("sources/beta-only.md"), false);
    assert.equal(await storeA.exists("sources/alpha-only.md"), true);

    // Beta should NOT see alpha's content
    assert.equal(await storeB.exists("sources/alpha-only.md"), false);
    assert.equal(await storeB.exists("sources/beta-only.md"), true);
  });

  // Cleanup
  db.close();
});
