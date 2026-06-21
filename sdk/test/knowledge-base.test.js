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
  assert.deepEqual((await readdir(root)).sort(), [
    ".llm-wiki",
    "concepts",
    "index.md",
    "log.md",
    "references",
    "sources",
  ]);
  assert.match(await readFile(join(root, "index.md"), "utf8"), /okf_version: "0.1"/);
});

test("ingest creates a conformant OKF source concept and searchable index without an LLM", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(
    source,
    "# Architecture\n\nClean Architecture keeps domain logic independent from infrastructure.\n",
    "utf8",
  );

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });

  assert.deepEqual(changeSet.failed, []);
  assert.equal(changeSet.created.length, 1);

  const sourceDoc = await readFile(join(root, "sources", "architecture.md"), "utf8");
  assert.match(sourceDoc, /^---\ntype: Source Document\n/m);
  assert.match(sourceDoc, /title: Architecture/);
  assert.match(sourceDoc, /resource:/);
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

test("writeConcept round-trips unknown OKF type and custom frontmatter through public APIs", async () => {
  const root = await tempRoot();
  const exportRoot = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  const changeSet = await kb.writeConcept({
    path: "concepts/vendor-artifact.md",
    type: "VendorSpecificThing",
    title: "Vendor Artifact",
    description: "Domain-specific OKF metadata.",
    tags: ["vendor"],
    body: "Vendor-specific body.",
    frontmatter: {
      owner: "platform",
      retention_policy: "gold",
      custom_tuple: ["alpha", "beta"],
    },
  });

  assert.deepEqual(changeSet.failed, []);
  const validation = await kb.validate();
  assert.deepEqual(validation.errors, []);

  const concepts = await kb.listConcepts({ type: "VendorSpecificThing" });
  assert.equal(concepts.length, 1);
  assert.equal(concepts[0].frontmatter.type, "VendorSpecificThing");
  assert.equal(concepts[0].frontmatter.owner, "platform");
  assert.equal(concepts[0].frontmatter.retention_policy, "gold");
  assert.deepEqual(concepts[0].frontmatter.custom_tuple, ["alpha", "beta"]);

  const exportResult = await kb.export({ path: exportRoot });
  assert.deepEqual(exportResult.failed, []);
  const exported = await readFile(join(exportRoot, "concepts", "vendor-artifact.md"), "utf8");
  assert.match(exported, /^type: VendorSpecificThing$/m);
  assert.match(exported, /^owner: platform$/m);
  assert.match(exported, /^retention_policy: gold$/m);
  assert.match(exported, /^custom_tuple: \[alpha, beta\]$/m);
});

test("guarded writeConcept reports failed update before dropping frontmatter, headings, or citations", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/guarded.md",
    type: "VendorSpecificThing",
    title: "Guarded Concept",
    body: "# Existing Heading\n\nKeep this citation [Source](sources/source.md).\n",
    frontmatter: {
      owner: "platform",
      custom_metadata: "preserve me",
    },
  });

  const before = await readFile(join(root, "concepts", "guarded.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/guarded.md",
    type: "VendorSpecificThing",
    title: "Guarded Concept",
    body: "Replacement without the heading or citation.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "concepts/guarded.md");
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /heading/i);
  assert.match(changeSet.failed[0].error, /citation/i);
  assert.equal(await readFile(join(root, "concepts", "guarded.md"), "utf8"), before);
});

test("guarded writeConcept rejects dropping reference-style bundle citations", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/reference-citation.md",
    title: "Reference Citation",
    body: [
      "# Summary",
      "",
      "See [Source][src-ref] for proof.",
      "",
      '[src-ref]: sources/reference.md "Primary source"',
    ].join("\n"),
  });

  const before = await readFile(join(root, "concepts", "reference-citation.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/reference-citation.md",
    title: "Reference Citation",
    body: "# Summary\n\nNo reference left.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /citation/i);
  assert.match(changeSet.failed[0].error, /sources\/reference\.md/);
  assert.equal(await readFile(join(root, "concepts", "reference-citation.md"), "utf8"), before);
});

test("guarded writeConcept rejects dropping second-level headings", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/second-level-heading.md",
    title: "Second Level Heading",
    body: "# Summary\n\n## Details\n\nKeep this subsection.\n",
  });

  const before = await readFile(join(root, "concepts", "second-level-heading.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/second-level-heading.md",
    title: "Second Level Heading",
    body: "# Summary\n\nDetails removed without a heading.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /heading/i);
  assert.match(changeSet.failed[0].error, /Details/);
  assert.equal(await readFile(join(root, "concepts", "second-level-heading.md"), "utf8"), before);
});

test("guarded writeConcept rejects dropping H2 when H1 shares the same heading text", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/duplicate-heading-text.md",
    title: "Duplicate Heading Text",
    body: "# Overview\n\nTop section.\n\n## Overview\n\nNested subsection to preserve.\n",
  });

  const before = await readFile(join(root, "concepts", "duplicate-heading-text.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/duplicate-heading-text.md",
    title: "Duplicate Heading Text",
    body: "# Overview\n\nTop section only.\n",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /heading/i);
  assert.match(changeSet.failed[0].error, /Overview/);
  assert.equal(await readFile(join(root, "concepts", "duplicate-heading-text.md"), "utf8"), before);
});

test("guarded writeConcept rejects dropping bare bundle path citations", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/bare-citation.md",
    title: "Bare Citation",
    body: "# Evidence\n\nSee sources/evidence.md for proof.\n",
  });

  const before = await readFile(join(root, "concepts", "bare-citation.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/bare-citation.md",
    title: "Bare Citation",
    body: "# Evidence\n\nNo citation left.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /citation/i);
  assert.match(changeSet.failed[0].error, /sources\/evidence\.md/);
  assert.equal(await readFile(join(root, "concepts", "bare-citation.md"), "utf8"), before);
});

test("guarded writeConcept allows removing fenced code headings while preserving real top-level headings", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/fenced-example.md",
    title: "Fenced Example",
    body: "# Real\n\n```md\n# Example\n```\n",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/fenced-example.md",
    title: "Fenced Example",
    body: "# Real\n\nNo code block now.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/fenced-example.md"]);
  assert.match(await readFile(join(root, "concepts", "fenced-example.md"), "utf8"), /No code block now\./);
});

test("guarded writeConcept allows explicit frontmatter and title updates", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/explicit-meta.md",
    title: "Old Title",
    frontmatter: { owner: "platform" },
    body: "# Summary\n\nExisting body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/explicit-meta.md",
    title: "New Title",
    frontmatter: { owner: "data-team" },
    body: "# Summary\n\nUpdated body.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/explicit-meta.md"]);
  const updated = await readFile(join(root, "concepts", "explicit-meta.md"), "utf8");
  assert.match(updated, /^title: New Title$/m);
  assert.match(updated, /^owner: data-team$/m);
});

test("guarded writeConcept allows bundle citation path normalization", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/normalized-citation.md",
    title: "Normalized Citation",
    body: "# Evidence\n\nSee [Src](/sources/a.md).\n",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/normalized-citation.md",
    title: "Normalized Citation",
    body: "# Evidence\n\nSee [Src](sources/a.md).\n",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/normalized-citation.md"]);
});

test("guarded writeConcept allows description updates via frontmatter", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/frontmatter-description.md",
    title: "Description Guard",
    description: "Old description.",
    body: "# Summary\n\nExisting body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/frontmatter-description.md",
    title: "Description Guard",
    frontmatter: { description: "New description." },
    body: "# Summary\n\nExisting body.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.match(
    await readFile(join(root, "concepts", "frontmatter-description.md"), "utf8"),
    /^description: New description\.$/m,
  );
});

test("guarded writeConcept allows source path updates via frontmatter", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/frontmatter-sources.md",
    title: "Source Paths",
    sourcePaths: ["sources/a.md"],
    body: "# Summary\n\nExisting body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/frontmatter-sources.md",
    title: "Source Paths",
    frontmatter: { source_paths: ["sources/b.md"] },
    body: "# Summary\n\nExisting body.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.match(await readFile(join(root, "concepts", "frontmatter-sources.md"), "utf8"), /sources\/b\.md/);
});

test("guarded writeConcept accepts scalar YAML tags when update omits tags", async () => {
  const root = await tempRoot();
  await mkdir(join(root, "concepts"), { recursive: true });
  await writeFile(
    join(root, "concepts", "scalar-tags.md"),
    [
      "---",
      "type: Concept",
      "title: Scalar Tags",
      "tags: preserve",
      "timestamp: 2020-01-01T00:00:00.000Z",
      "---",
      "",
      "# Summary",
      "",
      "Existing body.",
    ].join("\n"),
    "utf8",
  );

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.writeConcept({
    path: "concepts/scalar-tags.md",
    title: "Scalar Tags",
    body: "# Summary\n\nUpdated body.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.match(await readFile(join(root, "concepts", "scalar-tags.md"), "utf8"), /Updated body\./);
});

test("guarded writeConcept ignores bare bundle paths inside fenced code blocks", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/fenced-citation.md",
    title: "Fenced Citation",
    body: "# Main\n\n```md\nsources/example.md\n```\n",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/fenced-citation.md",
    title: "Fenced Citation",
    body: "# Main\n\nNo code block now.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/fenced-citation.md"]);
});

test("guarded writeConcept ignores headings and citations inside indented backtick and tilde fences", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/fenced-variants.md",
    title: "Fenced Variants",
    body: [
      "# Real",
      "",
      "   ```md",
      "# Example Only",
      "sources/fenced-backtick.md",
      "   ```",
      "",
      "  ~~~md",
      "## Tilde Example Only",
      "[Tilde](sources/fenced-tilde.md)",
      "  ~~~",
    ].join("\n"),
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/fenced-variants.md",
    title: "Fenced Variants",
    body: "# Real\n\nFenced examples removed.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/fenced-variants.md"]);
});

test("guarded writeConcept ignores bare bundle paths inside inline code", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/inline-citation.md",
    title: "Inline Citation",
    body: "# Main\n\nExample: `sources/example.md`\n",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/inline-citation.md",
    title: "Inline Citation",
    body: "# Main\n\nNo inline code now.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/inline-citation.md"]);
});

test("guarded writeConcept rejects dropping HTML bundle citations", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/html-citation.md",
    title: "HTML Citation",
    body: '# Summary\n\nSee <a href="sources/html-source.md">Source</a>.\n',
  });

  const before = await readFile(join(root, "concepts", "html-citation.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/html-citation.md",
    title: "HTML Citation",
    body: "# Summary\n\nNo HTML citation left.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.match(changeSet.failed[0].error, /citation/i);
  assert.match(changeSet.failed[0].error, /sources\/html-source\.md/);
  assert.equal(await readFile(join(root, "concepts", "html-citation.md"), "utf8"), before);
});

test("guarded writeConcept allows removing external HTML hrefs", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/external-html.md",
    title: "External HTML",
    body: '# Summary\n\nSee <a href="https://example.com/docs">Docs</a>.\n',
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/external-html.md",
    title: "External HTML",
    body: "# Summary\n\nExternal link removed during enrichment.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/external-html.md"]);
});

test("guarded writeConcept allows type updates via frontmatter", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/frontmatter-type.md",
    type: "Concept",
    title: "Frontmatter Type",
    body: "# Summary\n\nExisting body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/frontmatter-type.md",
    title: "Frontmatter Type",
    frontmatter: { type: "VendorSpecificThing" },
    body: "# Summary\n\nExisting body.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.match(await readFile(join(root, "concepts", "frontmatter-type.md"), "utf8"), /^type: VendorSpecificThing$/m);
});

test("guarded writeConcept allows tag updates via frontmatter", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/frontmatter-tags.md",
    title: "Frontmatter Tags",
    tags: ["old-tag"],
    body: "# Summary\n\nExisting body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/frontmatter-tags.md",
    title: "Frontmatter Tags",
    frontmatter: { tags: ["new-tag"] },
    body: "# Summary\n\nExisting body.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.match(await readFile(join(root, "concepts", "frontmatter-tags.md"), "utf8"), /new-tag/);
});

test("guarded writeConcept preserves an existing open OKF type when update omits type", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/vendor-open-type.md",
    type: "VendorSpecificThing",
    title: "Vendor Open Type",
    body: "# Overview\n\nExisting body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/vendor-open-type.md",
    title: "Vendor Open Type",
    body: "# Overview\n\nExisting body with a guarded addition.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/vendor-open-type.md"]);
  const updated = await readFile(join(root, "concepts", "vendor-open-type.md"), "utf8");
  assert.match(updated, /^type: VendorSpecificThing$/m);
  assert.match(updated, /guarded addition/);
});

test("guarded writeConcept preserves existing tags when update omits tags", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/tagged.md",
    title: "Tagged",
    tags: ["preserve"],
    body: "# Summary\n\nExisting body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/tagged.md",
    title: "Tagged",
    body: "# Summary\n\nExisting body with a guarded addition.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/tagged.md"]);
  const updated = await readFile(join(root, "concepts", "tagged.md"), "utf8");
  assert.match(updated, /^tags: \[preserve\]$/m);
});

test("guarded writeConcept rejects explicit tag clearing", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/tagged-clear.md",
    title: "Tagged Clear",
    tags: ["preserve"],
    body: "# Summary\n\nExisting body.",
  });

  const before = await readFile(join(root, "concepts", "tagged-clear.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/tagged-clear.md",
    title: "Tagged Clear",
    tags: [],
    body: "# Summary\n\nExisting body with a guarded addition.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /tags/i);
  assert.equal(await readFile(join(root, "concepts", "tagged-clear.md"), "utf8"), before);
});

test("guarded writeConcept rejects shrinking schema-like fenced sections", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/schema-guarded.md",
    title: "Schema Guarded",
    body: [
      "# Summary",
      "",
      "Overview text.",
      "",
      "## Schema",
      "",
      "```json",
      "{",
      '  "type": "object",',
      '  "properties": {',
      '    "name": { "type": "string" }',
      "  }",
      "}",
      "```",
    ].join("\n"),
  });

  const before = await readFile(join(root, "concepts", "schema-guarded.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/schema-guarded.md",
    title: "Schema Guarded",
    body: [
      "# Summary",
      "",
      "Overview text.",
      "",
      "## Schema",
      "",
      "```json",
      "{",
      '  "type": "object"',
      "}",
      "```",
    ].join("\n"),
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "concepts/schema-guarded.md");
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /schema/i);
  assert.equal(await readFile(join(root, "concepts", "schema-guarded.md"), "utf8"), before);
});

test("guarded writeConcept rejects schema shrinkage in indented backtick and tilde fences", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/schema-fence-variants.md",
    title: "Schema Fence Variants",
    body: [
      "# Summary",
      "",
      "## Backtick Schema",
      "",
      "   ```json",
      "line-a",
      "line-b",
      "line-c",
      "   ```",
      "",
      "## Tilde Schema",
      "",
      "  ~~~json",
      "field-a",
      "field-b",
      "  ~~~",
    ].join("\n"),
  });

  const before = await readFile(join(root, "concepts", "schema-fence-variants.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/schema-fence-variants.md",
    title: "Schema Fence Variants",
    body: [
      "# Summary",
      "",
      "## Backtick Schema",
      "",
      "   ```json",
      "line-a",
      "   ```",
      "",
      "## Tilde Schema",
      "",
      "  ~~~json",
      "field-a",
      "  ~~~",
    ].join("\n"),
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "concepts/schema-fence-variants.md");
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /Backtick Schema/);
  assert.match(changeSet.failed[0].error, /Tilde Schema/);
  assert.equal(await readFile(join(root, "concepts", "schema-fence-variants.md"), "utf8"), before);
});

test("guarded writeConcept rejects same-length schema fenced block content replacement", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/schema-content.md",
    title: "Schema Content",
    body: [
      "# Summary",
      "",
      "## Schema",
      "",
      "```json",
      "{",
      '  "type": "object",',
      '  "properties": {',
      '    "name": { "type": "string" }',
      "  }",
      "}",
      "```",
    ].join("\n"),
  });

  const before = await readFile(join(root, "concepts", "schema-content.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/schema-content.md",
    title: "Schema Content",
    body: [
      "# Summary",
      "",
      "## Schema",
      "",
      "```json",
      "{",
      '  "type": "object",',
      '  "properties": {',
      '    "title": { "type": "string" }',
      "  }",
      "}",
      "```",
    ].join("\n"),
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.match(changeSet.failed[0].error, /schema/i);
  assert.equal(await readFile(join(root, "concepts", "schema-content.md"), "utf8"), before);
});

test("guarded writeConcept allows appending lines to schema fenced blocks", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/schema-append.md",
    title: "Schema Append",
    body: ["# Summary", "", "## Schema", "", "```json", "line-a", "line-b", "```"].join("\n"),
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/schema-append.md",
    title: "Schema Append",
    body: ["# Summary", "", "## Schema", "", "```json", "line-a", "line-b", "line-c appended", "```"].join("\n"),
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/schema-append.md"]);
});

test("guarded writeConcept rejects dropping H2 schema block when H1 shares the same heading text", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/schema-levels.md",
    title: "Schema Levels",
    body: [
      "# Schema",
      "",
      "```json",
      '{ "level": "h1" }',
      "```",
      "",
      "## Schema",
      "",
      "```json",
      '{ "level": "h2" }',
      "```",
    ].join("\n"),
  });

  const before = await readFile(join(root, "concepts", "schema-levels.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/schema-levels.md",
    title: "Schema Levels",
    body: ["# Schema", "", "```json", '{ "level": "h1" }', "```"].join("\n"),
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.match(changeSet.failed[0].error, /schema/i);
  assert.equal(await readFile(join(root, "concepts", "schema-levels.md"), "utf8"), before);
});

test("guarded writeConcept accepts body-only updates when frontmatter key order differs", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/frontmatter-order.md",
    title: "Frontmatter Order",
    tags: ["keep"],
    frontmatter: { meta: { z: 1, a: 2 } },
    body: "# Summary\n\nExisting body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/frontmatter-order.md",
    title: "Frontmatter Order",
    body: "# Summary\n\nExisting body with a guarded addition.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/frontmatter-order.md"]);
});

test("writeConcept update preserves existing custom frontmatter and open type without guardedUpdate", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/custom-update.md",
    type: "VendorSpecificThing",
    title: "Custom Update",
    tags: ["keep"],
    frontmatter: { owner: "platform" },
    body: "Existing body.",
  });

  const changeSet = await kb.writeConcept({
    path: "concepts/custom-update.md",
    title: "Custom Update",
    body: "Updated body.",
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/custom-update.md"]);
  const updated = await readFile(join(root, "concepts", "custom-update.md"), "utf8");
  assert.match(updated, /^type: VendorSpecificThing$/m);
  assert.match(updated, /^owner: platform$/m);
  assert.match(updated, /^tags: \[keep\]$/m);
  assert.match(updated, /Updated body\./);
});

test("guarded writeConcept rejects dropping root-relative and relative bundle citations", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await kb.writeConcept({
    path: "concepts/bundle-citations.md",
    title: "Bundle Citations",
    body: "Keep [Root](/sources/root.md) and [Relative](../sources/relative.md).",
  });

  const before = await readFile(join(root, "concepts", "bundle-citations.md"), "utf8");
  const changeSet = await kb.writeConcept({
    path: "concepts/bundle-citations.md",
    title: "Bundle Citations",
    body: "Replacement without bundle-local citations.",
    guardedUpdate: true,
  });

  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "concepts/bundle-citations.md");
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /citation/i);
  assert.match(changeSet.failed[0].error, /sources\/root\.md/);
  assert.match(changeSet.failed[0].error, /sources\/relative\.md/);
  assert.equal(await readFile(join(root, "concepts", "bundle-citations.md"), "utf8"), before);
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

test("search supports MiniSearch prefix and fuzzy product matches", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await kb.writeConcept({
    path: "concepts/products.md",
    title: "Product Portfolio",
    body: "DeepResearch and vibeBuilder are StellarLink products.",
  });

  assert.equal((await kb.search("vibeBuil", { limit: 1 }))[0]?.path, "concepts/products.md");
  assert.equal((await kb.search("DeepReserch", { limit: 1 }))[0]?.path, "concepts/products.md");
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
  assert.ok(changeSet.updated.includes("index.md"));
  assert.ok(changeSet.updated.includes("sources/index.md"));
  assert.ok(changeSet.updated.includes("concepts/index.md"));
  const indexDoc = await readFile(join(root, "index.md"), "utf8");
  assert.match(indexDoc, /^# Company Knowledge Base$/m);
  assert.match(indexDoc, /Generated bundle entry point/);
  assert.match(indexDoc, /\[Sources\]\(sources\/index\.md\)/);
  assert.match(indexDoc, /\[Concepts\]\(concepts\/index\.md\)/);
  const sourcesIndex = await readFile(join(root, "sources", "index.md"), "utf8");
  assert.match(sourcesIndex, /- \[Company Source\]\(company\.md\) — Source Document/);
  const conceptsIndex = await readFile(join(root, "concepts", "index.md"), "utf8");
  assert.match(conceptsIndex, /- \[Company Overview\]\(company-overview\.md\) — Concept/);
  assert.deepEqual((await kb.validate()).errors, []);
});

test("writeIndex produces byte-identical progressive indexes on repeated calls with unchanged bundle", async () => {
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
  const options = {
    title: "Company Knowledge Base",
    description: "Generated bundle entry point.",
  };

  const firstChangeSet = await kb.writeIndex(options);
  const firstSnapshots = new Map(
    await Promise.all(
      firstChangeSet.updated.map(async (path) => [path, await readFile(join(root, ...path.split("/")))]),
    ),
  );
  const secondChangeSet = await kb.writeIndex(options);
  const secondSnapshots = new Map(
    await Promise.all(
      secondChangeSet.updated.map(async (path) => [path, await readFile(join(root, ...path.split("/")))]),
    ),
  );

  assert.deepEqual([...firstSnapshots.keys()].sort(), [...secondSnapshots.keys()].sort());
  for (const path of firstSnapshots.keys()) {
    assert.deepEqual(firstSnapshots.get(path), secondSnapshots.get(path), path);
  }
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
  await withUrlRequester(
    {
      "https://public.example/sitemap.xml": {
        contentType: "application/xml",
        body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>https://public.example/docs/one.md</loc></url>
  <url><loc>https://other.example/docs/skip.md</loc></url>
  <url><loc>https://public.example/docs/two.md</loc></url>
</urlset>`,
      },
      "https://public.example/docs/one.md": { contentType: "text/markdown", body: "# One\n\nFirst crawled source." },
      "https://public.example/docs/two.md": { contentType: "text/markdown", body: "# Two\n\nSecond crawled source." },
    },
    async () => {
      const kb = await KnowledgeBase.create({ root });
      const changeSet = await kb.crawl({ sitemapUrl: "https://public.example/sitemap.xml" });

      assert.deepEqual(changeSet.failed, []);
      assert.deepEqual(changeSet.created, ["sources/one.md", "sources/two.md"]);
      assert.deepEqual(changeSet.skipped, ["https://other.example/docs/skip.md"]);
      const results = await kb.search("crawled source");
      assert.deepEqual(results.map((result) => result.path).sort(), ["sources/one.md", "sources/two.md"]);
    },
  );
});

test("crawl reports sitemap fetch failure without writing source documents", async () => {
  const root = await tempRoot();
  await withUrlRequester(
    {
      "https://public.example/sitemap.xml": { status: 403, contentType: "application/xml", body: "Forbidden" },
    },
    async () => {
      const kb = await KnowledgeBase.create({ root });
      const changeSet = await kb.crawl({ sitemapUrl: "https://public.example/sitemap.xml" });

      assert.equal(changeSet.created.length, 0);
      assert.equal(changeSet.failed.length, 1);
      assert.equal(changeSet.failed[0].code, "FETCH_FAILED");
      assert.deepEqual(await readdir(join(root, "sources")), []);
    },
  );
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
          concepts: [
            {
              path: "concepts/company-overview.md",
              title: "Company Overview",
              description: "Synthesized company positioning.",
              tags: ["company"],
              body: "StellarLink builds AI knowledge systems for enterprises.",
              sourcePaths: ["sources/company.md"],
            },
          ],
        }),
        json: {
          concepts: [
            {
              path: "concepts/company-overview.md",
              title: "Company Overview",
              description: "Synthesized company positioning.",
              tags: ["company"],
              body: "StellarLink builds AI knowledge systems for enterprises.",
              sourcePaths: ["sources/company.md"],
            },
          ],
        },
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  const changeSet = await kb.synthesize({
    query: "StellarLink enterprises",
    instructions: "Create a company overview concept.",
    limit: 3,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.created, ["concepts/company-overview.md"]);
  assert.equal(requests.length, 1);
  const conceptDoc = await readFile(join(root, "concepts", "company-overview.md"), "utf8");
  assert.match(conceptDoc, /^generated_by: llm-wiki-sdk$/m);
  assert.match(conceptDoc, /source_paths: \[sources\/company\.md\]/);
  assert.match(conceptDoc, /StellarLink builds AI knowledge systems/);
});

test("synthesize uses guardedUpdate when updating an existing concept path", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "official.md");
  await writeFile(source, "# Official\n\nStellarLink interfaces are live in public source documents.\n", "utf8");
  const llm = {
    async generate() {
      return {
        text: JSON.stringify({
          concepts: [
            {
              path: "concepts/interfaces.md",
              title: "Interfaces",
              body: "Replacement without the protected heading or citation.",
            },
          ],
        }),
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/interfaces.md",
    title: "Interfaces",
    body: "# Protected\n\nKeep [Source](sources/official.md).\n",
  });

  const before = await readFile(join(root, "concepts", "interfaces.md"), "utf8");
  const changeSet = await kb.synthesize({
    query: "StellarLink interfaces",
    instructions: "Update interfaces concept.",
    limit: 5,
  });

  assert.deepEqual(changeSet.created, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "concepts/interfaces.md");
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.equal(await readFile(join(root, "concepts", "interfaces.md"), "utf8"), before);
});

test("synthesize rejects protected frontmatter loss on existing concept paths", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "official.md");
  await writeFile(source, "# Official\n\nStellarLink interface ownership is documented in sources.\n", "utf8");
  const llm = {
    async generate() {
      return {
        text: JSON.stringify({
          concepts: [
            {
              path: "concepts/protected-metadata.md",
              title: "Protected Metadata",
              frontmatter: { owner: "other-team" },
              body: "# Summary\n\nKeep [Source](sources/official.md).\n\nReplacement text.",
            },
          ],
        }),
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/protected-metadata.md",
    title: "Protected Metadata",
    frontmatter: { owner: "platform", retention_policy: "gold" },
    body: "# Summary\n\nKeep [Source](sources/official.md).\n",
  });

  const before = await readFile(join(root, "concepts", "protected-metadata.md"), "utf8");
  const changeSet = await kb.synthesize({
    query: "StellarLink interface ownership",
    instructions: "Update protected metadata concept.",
    limit: 5,
  });

  assert.deepEqual(changeSet.created, []);
  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "concepts/protected-metadata.md");
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /frontmatter/i);
  assert.match(changeSet.failed[0].error, /owner/);
  assert.match(changeSet.failed[0].error, /retention_policy/);
  assert.equal(await readFile(join(root, "concepts", "protected-metadata.md"), "utf8"), before);
});
test("synthesize rejects provider top-level metadata replacement on existing concept paths", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "official.md");
  await writeFile(source, "# Official\n\nStellarLink interface metadata is documented in sources.\n", "utf8");
  const llm = {
    async generate() {
      return {
        text: JSON.stringify({
          concepts: [
            {
              path: "concepts/top-level-metadata.md",
              type: "ProviderGeneratedType",
              title: "Top Level Metadata",
              description: "Provider replacement description.",
              tags: ["provider-tag"],
              sourcePaths: ["sources/provider.md"],
              body: "# Summary\n\nKeep [Source](sources/official.md).\n\nReplacement text.",
            },
          ],
        }),
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/top-level-metadata.md",
    type: "Concept",
    title: "Top Level Metadata",
    description: "Original protected description.",
    tags: ["protected-tag"],
    sourcePaths: ["sources/official.md"],
    body: "# Summary\n\nKeep [Source](sources/official.md).\n",
  });

  const before = await readFile(join(root, "concepts", "top-level-metadata.md"), "utf8");
  const changeSet = await kb.synthesize({
    query: "StellarLink interface metadata",
    instructions: "Update top-level metadata concept.",
    limit: 5,
  });

  assert.deepEqual(changeSet.created, []);
  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "concepts/top-level-metadata.md");
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /type/i);
  assert.match(changeSet.failed[0].error, /description/i);
  assert.match(changeSet.failed[0].error, /tags/i);
  assert.match(changeSet.failed[0].error, /source_paths/i);
  assert.equal(await readFile(join(root, "concepts", "top-level-metadata.md"), "utf8"), before);
});

test("synthesize rejects schema-like fenced-section shrinkage on existing concept paths", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "official.md");
  await writeFile(source, "# Official\n\nStellarLink schema metadata is documented in sources.\n", "utf8");
  const llm = {
    async generate() {
      return {
        text: JSON.stringify({
          concepts: [
            {
              path: "concepts/schema-synthesis.md",
              title: "Schema Synthesis",
              body: [
                "# Summary",
                "",
                "Updated synthesis keeps the heading but shrinks schema detail.",
                "",
                "## Interface Schema",
                "",
                "```json",
                "{",
                '  "name": "interface"',
                "}",
                "```",
              ].join("\n"),
            },
          ],
        }),
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/schema-synthesis.md",
    title: "Schema Synthesis",
    body: [
      "# Summary",
      "",
      "Keep deterministic schema detail.",
      "",
      "## Interface Schema",
      "",
      "```json",
      "{",
      '  "name": "interface",',
      '  "fields": ["owner", "status"]',
      "}",
      "```",
    ].join("\n"),
  });

  const before = await readFile(join(root, "concepts", "schema-synthesis.md"), "utf8");
  const changeSet = await kb.synthesize({
    query: "StellarLink schema metadata",
    instructions: "Update schema synthesis concept.",
    limit: 5,
  });

  assert.deepEqual(changeSet.created, []);
  assert.deepEqual(changeSet.updated, []);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "concepts/schema-synthesis.md");
  assert.equal(changeSet.failed[0].code, "guarded_update_rejected");
  assert.match(changeSet.failed[0].error, /schema/i);
  assert.match(changeSet.failed[0].error, /Interface Schema/);
  assert.equal(await readFile(join(root, "concepts", "schema-synthesis.md"), "utf8"), before);
});

test("synthesize updates an existing concept body and title when guarded metadata is preserved", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "official.md");
  await writeFile(source, "# Official\n\nStellarLink interfaces are live in public source documents.\n", "utf8");
  const llm = {
    async generate() {
      return {
        text: JSON.stringify({
          concepts: [
            {
              path: "concepts/interfaces.md",
              title: "Updated Interfaces",
              body: "# Protected\n\nKeep [Source](sources/official.md).\n\nAdded detail from synthesis.",
            },
          ],
        }),
      };
    },
  };

  const kb = await KnowledgeBase.create({ root, llm });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/interfaces.md",
    title: "Interfaces",
    description: "Original description.",
    body: "# Protected\n\nKeep [Source](sources/official.md).\n",
  });

  const changeSet = await kb.synthesize({
    query: "StellarLink interfaces",
    instructions: "Update interfaces concept.",
    limit: 5,
  });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.updated, ["concepts/interfaces.md"]);
  const updated = await readFile(join(root, "concepts", "interfaces.md"), "utf8");
  assert.match(updated, /^title: Updated Interfaces$/m);
  assert.match(updated, /Added detail from synthesis\./);
  assert.match(updated, /Keep \[Source\]\(sources\/official\.md\)/);
  assert.match(updated, /^description: Original description\.$/m);
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
          concepts: [
            {
              path: "concepts/interfaces.md",
              title: "Interfaces",
              body: "StellarLink interfaces are live.",
            },
          ],
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
          concepts: [
            {
              path: "concepts/company-overview.md",
              title: "Company Overview",
              body: "StellarLink builds AI knowledge systems for enterprises.",
            },
          ],
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
  await writeFile(
    join(root, "concepts", "metric.md"),
    "---\ntype: Metric\ntitle: Weekly Active Users\nextra_field: preserved\n---\n\nA product metric.\n",
    "utf8",
  );
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
    (error) => error instanceof ConfigurationError && /inside the bundle root/.test(error.message),
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
  await withUrlRequester(
    {
      [url]: { contentType: "text/markdown", body: "# Long Article\n\nLong URL body." },
    },
    async () => {
      const kb = await KnowledgeBase.create({ root });
      const changeSet = await kb.ingest({ path: url });

      assert.deepEqual(changeSet.failed, []);
      assert.equal(changeSet.created.length, 1);
      assert.ok(changeSet.created[0].length < 240);
      assert.match(await readFile(join(root, changeSet.created[0]), "utf8"), /Long URL body/);
    },
  );
});

test("validate treats root-absolute links in URL sources as external site links", async () => {
  const root = await tempRoot();
  await withUrlRequester(
    {
      "https://public.example/docs/page.md": {
        contentType: "text/markdown",
        body: "# Page\n\nSee [Guide](/posts/guide).\n",
      },
    },
    async () => {
      const kb = await KnowledgeBase.create({ root });
      await kb.ingest({ path: "https://public.example/docs/page.md" });
      const validation = await kb.validate();

      assert.deepEqual(validation.errors, []);
      assert.deepEqual(validation.warnings, []);
    },
  );
});

test("validate treats relative links in URL sources as external site links", async () => {
  const root = await tempRoot();
  await withUrlRequester(
    {
      "https://public.example/docs/page.md": {
        contentType: "text/markdown",
        body: "# Page\n\nSee [Sibling](sibling.md) and [Parent](../README.md).\n",
      },
    },
    async () => {
      const kb = await KnowledgeBase.create({ root });
      await kb.ingest({ path: "https://public.example/docs/page.md" });
      const validation = await kb.validate();

      assert.deepEqual(validation.errors, []);
      assert.deepEqual(validation.warnings, []);
    },
  );
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
  const parser = {
    async parse() {
      return { title: "Parsed Title", description: "Parsed description", body: "Injected adapter body" };
    },
  };

  const kb = await KnowledgeBase.create({ root, parser, search });
  const changeSet = await kb.ingest({ path: join(root, "virtual-source.md") });
  const results = await kb.search("adapter", { limit: 3 });

  assert.deepEqual(changeSet.failed, []);
  assert.equal(indexed[0].title, "Parsed Title");
  assert.deepEqual(results, [
    { path: "custom:adapter:3", title: "Custom", type: "Injected", score: 1, snippet: "custom", tags: [] },
  ]);
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
        metadata: {
          parser: "custom",
          page_count: 2,
          warnings: ["lossy conversion"],
          url: "https://user:secret@example.com/private?token=secret",
          audit: { callback: "https://user:secret@example.com/hook?token=secret" },
        },
      };
    },
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
