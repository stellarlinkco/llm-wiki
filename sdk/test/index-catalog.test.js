import { test, assert, readFile, writeFile, join, tempRoot, KnowledgeBase } from "./helpers.js";
import { buildProgressiveIndexFiles } from "../dist/application/index-catalog.js";

test("buildProgressiveIndexFiles groups nested documents into directory indexes", () => {
  const files = buildProgressiveIndexFiles(
    [
      { path: "sources/company.md", title: "Company Source", type: "Source Document" },
      { path: "concepts/overview.md", title: "Overview", type: "Concept" },
      { path: "concepts/geo/beijing.md", title: "Beijing", type: "Concept" },
    ],
    { title: "Company Knowledge Base", description: "Progressive bundle entry point." },
  );

  const root = files.get("index.md") ?? "";
  assert.match(root, /# Company Knowledge Base/);
  assert.match(root, /Progressive bundle entry point/);
  assert.match(root, /\[Sources\]\(sources\/index\.md\)/);
  assert.match(root, /\[Concepts\]\(concepts\/index\.md\)/);
  assert.doesNotMatch(root, /concepts\/geo\/beijing\.md/);

  const concepts = files.get("concepts/index.md") ?? "";
  assert.match(concepts, /\[Geo\]\(geo\/index\.md\)/);
  assert.match(concepts, /\[Overview\]\(overview\.md\)/);

  const geo = files.get("concepts/geo/index.md") ?? "";
  assert.match(geo, /\[Beijing\]\(beijing\.md\)/);
});

test("writeIndex writes progressive disclosure indexes by directory", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "company.md");
  await writeFile(source, "# Company Source\n\nSource body.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  await kb.ingest({ path: source });
  await kb.writeConcept({
    path: "concepts/overview.md",
    title: "Overview",
    body: "Top-level concept.",
  });
  await kb.writeConcept({
    path: "concepts/geo/beijing.md",
    title: "Beijing",
    body: "Nested concept.",
  });
  const changeSet = await kb.writeIndex({
    title: "Company Knowledge Base",
    description: "Progressive bundle entry point.",
  });

  assert.ok(changeSet.updated.includes("index.md"));
  assert.ok(changeSet.updated.includes("sources/index.md"));
  assert.ok(changeSet.updated.includes("concepts/index.md"));
  assert.ok(changeSet.updated.includes("concepts/geo/index.md"));

  const rootIndex = await readFile(join(root, "index.md"), "utf8");
  assert.match(rootIndex, /\[Concepts\]\(concepts\/index\.md\)/);
  assert.doesNotMatch(rootIndex, /concepts\/geo\/beijing\.md/);

  const geoIndex = await readFile(join(root, "concepts", "geo", "index.md"), "utf8");
  assert.match(geoIndex, /\[Beijing\]\(beijing\.md\)/);
  assert.deepEqual((await kb.validate()).errors, []);
});
