/**
 * Consumer workflow for packaged @llm-wiki/sdk E2E (VAL-PACK-001).
 * Run from an isolated npm project after `npm install <sdk-tarball>`.
 */
/* eslint-disable no-undef */
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { KnowledgeBase, ConfigurationError } from "@llm-wiki/sdk";

const workspace = await mkdtemp(join(tmpdir(), "pack-consumer-workspace-"));
const bundleRoot = join(workspace, "kb");
const exportRoot = join(workspace, "export");
const sourcePath = join(workspace, "demo-source.md");

await mkdir(workspace, { recursive: true });
await writeFile(
  sourcePath,
  [
    "# Pack Consumer Demo",
    "",
    "This source verifies packaged SDK install: ingest, search, and validate.",
    "",
    "The important phrase is alpha launch checklist.",
    "",
  ].join("\n"),
  "utf8",
);

const kb = await KnowledgeBase.create({ root: bundleRoot });

const ingest = await kb.ingest({ path: sourcePath });
if (ingest.failed.length !== 0) {
  console.error("ingest failed", ingest.failed);
  process.exit(1);
}

const writeConceptResult = await kb.writeConcept({
  path: "concepts/overview.md",
  title: "Overview",
  body: "Pack consumer concept for exported bundle verification.",
});
if (writeConceptResult.failed.length !== 0) {
  console.error("writeConcept failed", writeConceptResult.failed);
  process.exit(1);
}

const searchResults = await kb.search("alpha launch checklist", { limit: 3 });
if (searchResults.length === 0) {
  console.error("search returned no hits");
  process.exit(1);
}

const validation = await kb.validate();
if (!validation.valid || validation.errors.length !== 0) {
  console.error("validation failed", validation);
  process.exit(1);
}

const status = await kb.status();
if (status.sourceDocuments < 1 || status.concepts < 1) {
  console.error("unexpected status", status);
  process.exit(1);
}

const concepts = await kb.listConcepts({ type: "Concept" });
if (concepts.length === 0) {
  console.error("listConcepts returned no concepts");
  process.exit(1);
}

const exportResult = await kb.export({ path: exportRoot });
if (exportResult.failed.length !== 0) {
  console.error("export failed", exportResult.failed);
  process.exit(1);
}

let queryRejected = false;
try {
  await kb.query("anything");
} catch (error) {
  if (error instanceof ConfigurationError && /LLM provider/.test(error.message)) {
    queryRejected = true;
  } else {
    console.error("query threw unexpected error", error);
    process.exit(1);
  }
}
if (!queryRejected) {
  console.error("query without LLM did not throw ConfigurationError");
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    bundleRoot,
    exportRoot,
    ingestCreated: ingest.created.length,
    searchHits: searchResults.length,
    validationValid: validation.valid,
    status,
    conceptCount: concepts.length,
    exportCreated: exportResult.created.length,
    queryRejected,
  }),
);
