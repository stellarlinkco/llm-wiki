import { test, assert, writeFile, readdir, join, tempRoot, KnowledgeBase } from "./helpers.js";

test("batch ingest records malformed file in ChangeSet.failed while valid files succeed", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const validSource = join(sourceRoot, "valid.md");
  const brokenSource = join(sourceRoot, "broken.json");
  await writeFile(validSource, "# Valid\n\nBatch ingest success body.\n", "utf8");
  await writeFile(brokenSource, '{"owner": "growth"', "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingestMany({ paths: [validSource, brokenSource] });

  assert.equal(changeSet.operation, "ingest");
  assert.equal(changeSet.created.length, 1);
  assert.equal(changeSet.created[0], "sources/valid.md");
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, brokenSource);
  assert.equal(changeSet.failed[0].code, "PARSE_FAILED");

  const sourcesOnDisk = await readdir(join(root, "sources"));
  assert.deepEqual(sourcesOnDisk, ["valid.md"]);
});

test("ingestMany warns on empty paths array", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  const changeSet = await kb.ingestMany({ paths: [] });

  assert.deepEqual(changeSet.created, []);
  assert.deepEqual(changeSet.failed, []);
  assert.equal(changeSet.warnings.length, 1);
  assert.equal(changeSet.warnings[0].code, "empty_paths");
});

test("ingestMany reindexes once after a multi-file batch", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const first = join(sourceRoot, "one.md");
  const second = join(sourceRoot, "two.md");
  await writeFile(first, "# One\n\nFirst batch source.\n", "utf8");
  await writeFile(second, "# Two\n\nSecond batch source.\n", "utf8");
  let indexCalls = 0;
  const search = {
    async index() {
      indexCalls += 1;
    },
    async search() {
      return [];
    },
    async exists() {
      return indexCalls > 0;
    },
  };

  const kb = await KnowledgeBase.create({ root, search });
  const changeSet = await kb.ingestMany({ paths: [first, second] });

  assert.deepEqual(changeSet.failed, []);
  assert.deepEqual(changeSet.created.sort(), ["sources/one.md", "sources/two.md"]);
  assert.equal(indexCalls, 1);
});
