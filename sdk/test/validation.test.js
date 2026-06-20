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

test("validation rejects malformed frontmatter instead of ignoring bad YAML lines", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "malformed.md"), "---\ntype: Metric\nbad yaml line\n---\n\nBroken metadata.\n", "utf8");

  const validation = await kb.validate();
  assert.equal(validation.valid, false);
  assert.equal(validation.errors[0].code, "malformed_frontmatter");
});

test("validation accepts common YAML block lists in OKF frontmatter", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "tagged.md"), "---\ntype: Concept\ntitle: Tagged\ntags:\n  - architecture\n  - sdk\n---\n\nTagged concept.\n", "utf8");

  const validation = await kb.validate();
  const concepts = await kb.listConcepts();
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(concepts[0].frontmatter.tags, ["architecture", "sdk"]);
});

test("frontmatter parser preserves quoted commas in inline YAML lists", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "segmented.md"), "---\ntype: Concept\ntitle: Segmented\ntags: [\"sales, enterprise\", sdk]\n---\n\nSegmented concept.\n", "utf8");

  const validation = await kb.validate();
  const concepts = await kb.listConcepts();
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(concepts[0].frontmatter.tags, ["sales, enterprise", "sdk"]);
});

test("frontmatter parser strips inline comments from YAML lists", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "commented.md"), "---\ntype: Concept\ntitle: Commented\ntags: [architecture, sdk] # public tags\n---\n\nCommented concept.\n", "utf8");

  const validation = await kb.validate();
  const concepts = await kb.listConcepts();
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(concepts[0].frontmatter.tags, ["architecture", "sdk"]);
});

test("frontmatter parser keeps block lists with key comments", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "block-commented.md"), "---\ntype: Concept\ntitle: Block Commented\ntags: # public tags\n  - architecture\n  - sdk\n---\n\nBlock commented concept.\n", "utf8");

  const validation = await kb.validate();
  const concepts = await kb.listConcepts();
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(concepts[0].frontmatter.tags, ["architecture", "sdk"]);
});

test("frontmatter parser strips block list item comments", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "block-item-commented.md"), "---\ntype: Concept\ntitle: Block Item Commented\ntags:\n  - architecture # public tag\n  - sdk # implementation tag\n---\n\nBlock item commented concept.\n", "utf8");

  const validation = await kb.validate();
  const concepts = await kb.listConcepts();
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(concepts[0].frontmatter.tags, ["architecture", "sdk"]);
});

test("frontmatter parser accepts closing fence at EOF", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "eof-fence.md"), "---\ntype: Concept\ntitle: EOF Fence\n---", "utf8");

  const validation = await kb.validate();
  assert.deepEqual(validation.errors, []);
});

test("frontmatter serializer escapes newlines in parser-derived scalar values", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "newline-title.html");
  await writeFile(source, "<!doctype html><html><body><main><h1>Quarterly\nsource_path: spoofed</h1><p>safe body</p></main></body></html>", "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });
  const sourceDoc = await readFile(join(root, "sources", "newline-title.md"), "utf8");

  assert.deepEqual(changeSet.failed, []);
  assert.doesNotMatch(sourceDoc, /^source_path: spoofed$/m);
  assert.match(sourceDoc, /^source_path: newline-title\.html$/m);
});

test("frontmatter serializer quotes YAML indicator scalars", async () => {
  const root = await tempRoot();
  const parser = {
    async parse() {
      return { title: "- Incident Runbook", description: "safe", body: "Indicator title body" };
    },
  };

  const kb = await KnowledgeBase.create({ root, parser });
  const changeSet = await kb.ingest({ path: join(root, "indicator.md") });
  const sourceDoc = await readFile(join(root, "sources", "indicator.md"), "utf8");

  assert.deepEqual(changeSet.failed, []);
  assert.match(sourceDoc, /^title: "- Incident Runbook"$/m);
});

test("validation reports malformed frontmatter in reserved index files", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "index.md"), "---\nbad yaml line\n---\n\n# Broken Index\n", "utf8");

  const validation = await kb.validate();
  assert.equal(validation.valid, false);
  assert.equal(validation.errors[0].code, "malformed_frontmatter");
});

test("validation rejects internal links that escape the bundle root", async () => {
  const root = await tempRoot();
  const outsideRoot = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(outsideRoot, "outside.md"), "---\ntype: Concept\n---\n\nOutside.\n", "utf8");
  await writeFile(join(root, "concepts", "reader.md"), "---\ntype: Concept\n---\n\nSee [outside](../../outside.md).\n", "utf8");

  const validation = await kb.validate();
  assert.equal(validation.valid, false);
  assert.equal(validation.errors[0].code, "link_outside_bundle");
});

test("validation strips markdown link fragments before filesystem existence checks", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "architecture.md"), "---\ntype: Concept\ntitle: Architecture\n---\n\n# Decisions\n\nSee details.\n", "utf8");
  await writeFile(join(root, "concepts", "reader.md"), "---\ntype: Concept\ntitle: Reader\n---\n\nSee [decisions](./architecture.md#decisions).\n", "utf8");

  const validation = await kb.validate();
  assert.deepEqual(validation.warnings, []);
});

test("validation ignores markdown link titles during filesystem checks", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "architecture.md"), "---\ntype: Concept\ntitle: Architecture\n---\n\n# Decisions\n\nSee details.\n", "utf8");
  await writeFile(join(root, "concepts", "reader.md"), "---\ntype: Concept\ntitle: Reader\n---\n\nSee [decisions](./architecture.md \"Architecture\").\n", "utf8");

  const validation = await kb.validate();
  assert.deepEqual(validation.warnings, []);
});

test("validation handles parentheses in markdown link destinations", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "architecture(adr).md"), "---\ntype: Concept\ntitle: Architecture ADR\n---\n\n# ADR\n\nSee details.\n", "utf8");
  await writeFile(join(root, "concepts", "reader.md"), "---\ntype: Concept\ntitle: Reader\n---\n\nSee [ADR](./architecture(adr).md).\n", "utf8");

  const validation = await kb.validate();
  assert.deepEqual(validation.warnings, []);
});

test("validation handles escaped parentheses in markdown link destinations", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "architecture(adr).md"), "---\ntype: Concept\ntitle: Architecture ADR\n---\n\n# ADR\n\nSee details.\n", "utf8");
  await writeFile(join(root, "concepts", "reader.md"), "---\ntype: Concept\ntitle: Reader\n---\n\nSee [ADR](./architecture\\(adr\\).md).\n", "utf8");

  const validation = await kb.validate();
  assert.deepEqual(validation.warnings, []);
});

test("validation treats protocol-relative markdown links as external links", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "external.md"), "---\ntype: Concept\n---\n\nSee [docs](//example.com/page).\n", "utf8");

  const validation = await kb.validate();
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(validation.warnings, []);
});

test("update preserves unknown OKF frontmatter fields on existing source concepts", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(source, "# Architecture\n\nFirst version.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  await kb.ingest({ path: source });
  const conceptPath = join(root, "sources", "architecture.md");
  const concept = await readFile(conceptPath, "utf8");
  await writeFile(conceptPath, concept.replace("type: Source Document\n", "type: Source Document\nowner: platform\n"), "utf8");
  await writeFile(source, "# Architecture\n\nSecond version.\n", "utf8");

  await kb.update({ path: source });
  const updated = await readFile(conceptPath, "utf8");

  assert.match(updated, /owner: platform/);
  assert.match(updated, /Second version/);
});

test("validation treats missing type as error and broken links as warnings", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  await writeFile(join(root, "concepts", "bad.md"), "---\ntitle: Bad\n---\n\nSee [missing](/concepts/missing.md).\n", "utf8");

  const validation = await kb.validate();
  assert.equal(validation.valid, false);
  assert.equal(validation.errors[0].code, "missing_type");
  assert.equal(validation.warnings[0].code, "broken_link");
});
