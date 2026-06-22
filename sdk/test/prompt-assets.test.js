import test from "node:test";
import assert from "node:assert/strict";
import { OKF_PROMPT_ASSETS } from "../dist/index.js";

const REQUIRED_LOCAL_TERMS = [
  "KnowledgeBase",
  "SourceParser",
  "SearchAdapter",
  "LLMProvider",
  "ChangeSet",
  "sources/",
  "concepts/",
  "references/",
  ".llm-wiki",
];

const REQUIRED_SHARED_RULES = [
  /read[- ]before[- ]write/i,
  /read existing/i,
  /preserve existing frontmatter/i,
  /preserve existing top-level H1\/H2 headings/i,
  /preserve or append citations/i,
  /do not invent citations/i,
  /low-signal.*skip|skip.*low-signal/i,
  /metrics/i,
  /dimensions/i,
  /relationships/i,
];

test("OKF prompt assets are durable, adapted, attributed, and safety-constrained", () => {
  assert.equal(OKF_PROMPT_ASSETS.length, 2);

  const metadata = OKF_PROMPT_ASSETS.find((asset) => asset.id === "okf-metadata-enrichment");
  const web = OKF_PROMPT_ASSETS.find((asset) => asset.id === "okf-web-source-augmentation");

  assert.ok(metadata);
  assert.ok(web);
  assert.equal(metadata.purpose, "metadata-enrichment");
  assert.equal(web.purpose, "web-source-augmentation");

  for (const asset of [metadata, web]) {
    assert.match(asset.sourceAttribution, /Google.*knowledge-catalog\/okf/i);
    assert.match(asset.sourceAttribution, /Apache-2\.0/i);
    assert.match(asset.body, /Google.*knowledge-catalog\/okf/i);
    assert.match(asset.body, /Apache-2\.0/i);

    for (const term of REQUIRED_LOCAL_TERMS) {
      assert.match(asset.body, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }

    for (const rule of REQUIRED_SHARED_RULES) {
      assert.match(asset.body, rule);
    }
  }

  assert.match(metadata.body, /one concept per write/i);
  assert.match(metadata.body, /writeConcept|write concept/i);
  assert.match(web.body, /augment/i);
  assert.match(web.body, /SourceParser/i);
  assert.match(web.body, /fetched|ingested|retrieved/i);
});
