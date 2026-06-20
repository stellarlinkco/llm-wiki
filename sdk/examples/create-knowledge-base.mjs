import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { KnowledgeBase } from "../dist/index.js";

const demoRoot = process.argv[2] === undefined
  ? await mkdtemp(join(tmpdir(), "llm-wiki-demo-"))
  : dirname(resolve(process.argv[2]));
const outputRoot = process.argv[2] === undefined
  ? join(demoRoot, "kb")
  : resolve(process.argv[2]);
const sourcePath = join(demoRoot, "demo-source.md");

await mkdir(outputRoot, { recursive: true });
await writeFile(
  sourcePath,
  [
    "# Demo Knowledge Base",
    "",
    "This demo source verifies that the SDK can create a knowledge base, ingest markdown, search it, and validate the OKF bundle.",
    "",
    "The important phrase is alpha launch checklist.",
    "",
  ].join("\n"),
  "utf8",
);

const kb = await KnowledgeBase.create({ root: outputRoot });
const ingest = await kb.ingest({ path: sourcePath });
const results = await kb.search("alpha launch checklist", { limit: 3 });
const validation = await kb.validate();
const sourceDoc = await readFile(join(outputRoot, "sources", "demo-source.md"), "utf8");

const summary = {
  root: outputRoot,
  created: ingest.created,
  updated: ingest.updated,
  failed: ingest.failed,
  search: results.map((result) => ({ path: result.path, title: result.title, score: result.score })),
  validation: {
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
  },
  sourceDocumentHasDemoPhrase: sourceDoc.includes("alpha launch checklist"),
};

console.log(JSON.stringify(summary, null, 2));

if (ingest.failed.length !== 0 || results.length === 0 || !validation.valid || !summary.sourceDocumentHasDemoPhrase) {
  process.exitCode = 1;
}
