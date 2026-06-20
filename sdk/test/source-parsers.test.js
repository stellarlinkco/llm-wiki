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

test("markdown ingest preserves heading/body and makes content searchable", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "runbook.md");
  await writeFile(source, "# Incident Runbook\n\nEscalate pager events through the reliability desk.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });
  const sourceDoc = await readFile(join(root, "sources", "runbook.md"), "utf8");
  const results = await kb.search("reliability desk");

  assert.deepEqual(changeSet.failed, []);
  assert.match(sourceDoc, /title: Incident Runbook/);
  assert.match(sourceDoc, /Escalate pager events through the reliability desk/);
  assert.equal(results[0].path, "sources/runbook.md");
});

test("plain text ingest wraps markdown-sensitive text and makes it searchable", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "support-notes.txt");
  await writeFile(source, "Support desk handles *tier-one* renewals.\nUse <raw> customer notes carefully.\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });
  const sourceDoc = await readFile(join(root, "sources", "support-notes.md"), "utf8");
  const results = await kb.search("tier one renewals");

  assert.deepEqual(changeSet.failed, []);
  assert.match(sourceDoc, /description: Support desk handles tier-one renewals\./);
  assert.match(sourceDoc, /```text\nSupport desk handles \*tier-one\* renewals\./);
  assert.equal(results[0].path, "sources/support-notes.md");
});

test("whitespace-only plain text ingest fails EMPTY_SOURCE and writes no source document", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "blank.txt");
  await writeFile(source, " \n\t\r\n", "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });

  assert.equal(changeSet.created.length, 0);
  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, source);
  assert.match(changeSet.failed[0].error, /EMPTY_SOURCE/);
  assert.deepEqual(await readdir(join(root, "sources")), []);
});

test("JSON ingest renders deterministic fenced markdown and makes values searchable", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "product.json");
  await writeFile(source, JSON.stringify({ name: "Apollo", owner: "growth analytics", metrics: ["activation"] }), "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });
  const sourceDoc = await readFile(join(root, "sources", "product.md"), "utf8");
  const results = await kb.search("growth analytics activation");

  assert.deepEqual(changeSet.failed, []);
  assert.match(sourceDoc, /```json\n/);
  assert.match(sourceDoc, /"owner": "growth analytics"/);
  assert.equal(results[0].path, "sources/product.md");
});

test("invalid JSON source fails with a typed parser error and no source document", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "broken.json");
  await writeFile(source, "{\"owner\": \"growth\"", "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });

  assert.equal(changeSet.created.length, 0);
  assert.equal(changeSet.failed.length, 1);
  assert.match(changeSet.failed[0].error, /PARSE_FAILED/);
  assert.deepEqual(await readdir(join(root, "sources")), []);
});

test("HTML ingest extracts readable article markdown and makes it searchable", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "launch.html");
  await writeFile(source, `<!doctype html>
<html>
  <head><title>Launch Plan</title></head>
  <body>
    <main>
      <article>
        <h1>Launch Checklist</h1>
        <p>Coordinate beta enablement with customer success and product marketing.</p>
      </article>
    </main>
  </body>
</html>
`, "utf8");

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });
  const sourceDoc = await readFile(join(root, "sources", "launch.md"), "utf8");
  const results = await kb.search("beta enablement marketing");

  assert.deepEqual(changeSet.failed, []);
  assert.match(sourceDoc, /title: Launch Checklist/);
  assert.match(sourceDoc, /Coordinate beta enablement with customer success and product marketing/);
  assert.equal(results[0].path, "sources/launch.md");
});

test("HTML parser resolves URL-relative links and strips dangerous links", async () => {
  const root = await tempRoot();
  const html = `<!doctype html><html><body><main><h1>Links</h1><p><a href="/legal">Legal</a> <a href="javascript:alert(1)">bad</a></p></main></body></html>`;

  await withUrlRequester({
    "https://public.example/docs/page.html": { contentType: "text/html", body: html },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    const changeSet = await kb.ingest({ path: "https://public.example/docs/page.html" });
    const sourceDoc = await readFile(join(root, "sources", "page.md"), "utf8");

    assert.deepEqual(changeSet.failed, []);
    assert.match(sourceDoc, /\[Legal]\(https:\/\/public\.example\/legal\)/);
    assert.doesNotMatch(sourceDoc, /javascript:/);
  });
});

test("HTML parser strips obfuscated dangerous links", async () => {
  const parsed = await new DefaultSourceParser().parse({
    kind: "text",
    contentType: "text/html",
    text: '<!doctype html><html><body><main><h1>Links</h1><p><a href="java\nscript:alert(1)">bad</a></p></main></body></html>',
  });

  assert.match(parsed.body, /bad/);
  assert.doesNotMatch(parsed.body, /java\s*script:/i);
});

test("HTML parser ignores malformed links without dropping page text", async () => {
  const parsed = await new DefaultSourceParser().parse({
    kind: "text",
    contentType: "text/html",
    text: '<!doctype html><html><body><main><h1>Broken Link</h1><p>Useful content <a href="http://[">broken</a>.</p></main></body></html>',
  });

  assert.match(parsed.body, /Useful content/);
  assert.match(parsed.body, /broken/);
});

test("HTML parser keeps local relative links relative", async () => {
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "page.html");
  await writeFile(source, '<!doctype html><main><h1>Local</h1><p>See <a href="../secret.txt">secret</a>.</p></main>', "utf8");

  const parsed = await new DefaultSourceParser().parse(source);

  assert.match(parsed.body, /\[secret]\(\.\.\/secret\.txt\)/);
  assert.doesNotMatch(parsed.body, /file:\/\//);
  assert.doesNotMatch(parsed.body, new RegExp(sourceRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("HTML parser falls back when h1 text is empty", async () => {
  const parsed = await new DefaultSourceParser().parse({
    kind: "text",
    contentType: "text/html",
    title: "Fallback Title",
    text: "<!doctype html><html><head><title>Head Title</title></head><body><main><h1>   </h1><p>Readable body.</p></main></body></html>",
  });

  assert.equal(parsed.title, "Fallback Title");
  assert.match(parsed.body, /Readable body/);
});

test("script-only HTML fails EMPTY_SOURCE instead of ingesting script text", async () => {
  await assert.rejects(
    () => new DefaultSourceParser().parse({ kind: "text", contentType: "text/html", text: "<!doctype html><html><body><script>window.__BOOTSTRAP__={secret:true}</script></body></html>" }),
    (error) => {
      assert.ok(error instanceof ParserError);
      assert.equal(error.code, "EMPTY_SOURCE");
      return true;
    },
  );
});

test("empty HTML URL ingest fails EMPTY_SOURCE and writes no source document", async () => {
  const root = await tempRoot();

  await withUrlRequester({
    "https://public.example/": { contentType: "text/html", body: "<!doctype html><html><head><title>Client App</title></head><body><script>window.__APP__={}</script></body></html>" },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    const changeSet = await kb.ingest({ path: "https://public.example/" });

    assert.equal(changeSet.created.length, 0);
    assert.equal(changeSet.failed.length, 1);
    assert.equal(changeSet.failed[0].code, "EMPTY_SOURCE");
    assert.match(changeSet.failed[0].error, /EMPTY_SOURCE/);
    assert.deepEqual(await readdir(join(root, "sources")), []);
  });
});

test("URL parser wraps body read failures as FETCH_FAILED parser errors", async () => {
  const bodyFailure = new TypeError("body stream interrupted");

  await withUrlRequester({
    "https://example.test/interrupted-body": { error: bodyFailure },
  }, async () => {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "https://example.test/interrupted-body" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "FETCH_FAILED");
        assert.match(error.message, /FETCH_FAILED: URL fetch failed: body stream interrupted/);
        assert.equal(error.source.url, "https://example.test/interrupted-body");
        assert.notEqual(error, bodyFailure);
        return true;
      },
    );
  });
});

test("URL parser rejects private hosts before fetch", async () => {
  let called = false;
  const restoreRequester = setUrlRequesterForTesting(async () => {
    called = true;
    throw new Error("request should not be called");
  });
  try {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "http://127.0.0.1/admin" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "UNSUPPORTED_SOURCE");
        assert.equal(called, false);
        return true;
      },
    );
  } finally {
    restoreRequester();
  }
});

test("URL parser accepts public IPv6 literal hosts", async () => {
  await withUrlRequester({
    "https://[2606:4700:4700::1111]/public.txt": { contentType: "text/plain", body: "public ipv6 body" },
  }, async () => {
    const parsed = await new DefaultSourceParser().parse({ kind: "url", url: "https://[2606:4700:4700::1111]/public.txt" });

    assert.equal(parsed.metadata?.url, "https://[2606:4700:4700::1111]/public.txt");
    assert.match(parsed.body, /public ipv6 body/);
  });
});

test("URL parser rejects hostnames resolving to private addresses", async () => {
  await assert.rejects(
    () => new DefaultSourceParser().parse({ kind: "url", url: "https://metadata.attacker.example/latest" }),
    (error) => {
      assert.ok(error instanceof ParserError);
      assert.equal(error.code, "UNSUPPORTED_SOURCE");
      assert.equal(error.source.url, "https://metadata.attacker.example/latest");
      return true;
    },
  );
});

test("URL parser rejects IPv4-mapped IPv6 private DNS answers", async () => {
  const restoreResolver = setUrlHostResolverForTesting(async () => ["::ffff:127.0.0.1"]);
  try {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/private" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "UNSUPPORTED_SOURCE");
        return true;
      },
    );
  } finally {
    restoreResolver();
  }
});

test("URL parser rejects hexadecimal IPv4-mapped IPv6 private DNS answers", async () => {
  const restoreResolver = setUrlHostResolverForTesting(async () => ["::ffff:c0a8:0101"]);
  try {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/private-hex" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "UNSUPPORTED_SOURCE");
        return true;
      },
    );
  } finally {
    restoreResolver();
  }
});

test("URL parser rejects expanded IPv4-mapped IPv6 private DNS answers", async () => {
  const restoreResolver = setUrlHostResolverForTesting(async () => ["0:0:0:0:0:ffff:c0a8:0101"]);
  try {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/private-expanded" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "UNSUPPORTED_SOURCE");
        return true;
      },
    );
  } finally {
    restoreResolver();
  }
});

test("URL parser rejects full IPv6 link-local DNS range", async () => {
  const restoreResolver = setUrlHostResolverForTesting(async () => ["fe90::1"]);
  try {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/link-local" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "UNSUPPORTED_SOURCE");
        return true;
      },
    );
  } finally {
    restoreResolver();
  }
});

test("URL parser rejects IPv6 multicast DNS answers", async () => {
  const restoreResolver = setUrlHostResolverForTesting(async () => ["ff02::1"]);
  try {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/multicast" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "UNSUPPORTED_SOURCE");
        return true;
      },
    );
  } finally {
    restoreResolver();
  }
});

test("URL parser rejects special-use IPv4 DNS answers", async () => {
  const restoreResolver = setUrlHostResolverForTesting(async () => ["100.64.0.1"]);
  try {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/carrier-nat" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "UNSUPPORTED_SOURCE");
        return true;
      },
    );
  } finally {
    restoreResolver();
  }
});

test("failed URL ingest redacts credentials from ChangeSet failed path", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: "https://user:pass@metadata.attacker.example/doc.txt?token=abc" });

  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "https://metadata.attacker.example/doc.txt");
  assert.doesNotMatch(JSON.stringify(changeSet.failed), /pass|token=abc|user:/);
});

test("URL ingest preserves distinct query-string identities after redaction", async () => {
  const root = await tempRoot();
  await withUrlRequester({
    "https://user:secret@public.example/report.txt?token=one": {
      contentType: "text/plain",
      body: "first token body",
    },
    "https://user:secret@public.example/report.txt?token=two": {
      contentType: "text/plain",
      body: "second token body",
    },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    const first = await kb.ingest({ path: "https://user:secret@public.example/report.txt?token=one" });
    const second = await kb.ingest({ path: "https://user:secret@public.example/report.txt?token=two" });
    const sourceFiles = await readdir(join(root, "sources"));

    assert.deepEqual(first.created, ["sources/report.md"]);
    assert.equal(second.created.length, 1);
    assert.match(second.created[0], /^sources\/report-[0-9a-f]{12}\.md$/);
    assert.equal(sourceFiles.length, 2);
  });
});

test("malformed URL source inputs become ChangeSet failures", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: { kind: "url", url: "https://@@" } });

  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "https://");
});

test("malformed URL failures redact credentials", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: { kind: "url", url: "https://user:pass@@?token=secret" } });

  assert.equal(changeSet.failed.length, 1);
  assert.doesNotMatch(JSON.stringify(changeSet.failed), /user|pass|token=secret/);
});

test("malformed URL failures redact credentials before query delimiters", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: { kind: "url", url: "https://user:pa?ss@public.example/doc" } });

  assert.equal(changeSet.failed.length, 1);
  assert.equal(changeSet.failed[0].path, "https://public.example/doc");
  assert.doesNotMatch(JSON.stringify(changeSet.failed), /user|pa\?ss/);
});

test("URL parser rejects oversized responses", async () => {
  await withUrlRequester({
    "https://public.example/huge.txt": { contentType: "text/plain", body: Buffer.alloc(26 * 1024 * 1024) },
  }, async () => {
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/huge.txt" }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "PARSE_FAILED");
        return true;
      },
    );
  });
});

test("URL ingest redacts credentials and query tokens from source frontmatter", async () => {
  const root = await tempRoot();

  await withUrlRequester({
    "https://user:secret@public.example/report.txt?token=secret#frag": {
      contentType: "text/plain",
      body: "Credential-bearing URL should not leak tokens.",
    },
  }, async () => {
    const kb = await KnowledgeBase.create({ root });
    const changeSet = await kb.ingest({ path: "https://user:secret@public.example/report.txt?token=secret#frag" });
    const sourceDoc = await readFile(join(root, "sources", "report.md"), "utf8");

    assert.deepEqual(changeSet.failed, []);
    assert.match(sourceDoc, /^resource: "https:\/\/public\.example\/report\.txt"$/m);
    assert.doesNotMatch(sourceDoc, /secret|token=|user:/);
  });
});

test("URL parser lets fetched content type override caller content type", async () => {
  await withUrlRequester({
    "https://public.example/source": { contentType: "application/json", body: "{\"owner\":\"content type\"}" },
  }, async () => {
    const parsed = await new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/source", contentType: "text/plain" });
    assert.match(parsed.body, /```json/);
    assert.match(parsed.body, /"owner": "content type"/);
  });
});

test("URL parser honors declared text charset", async () => {
  await withUrlRequester({
    "https://public.example/latin1.txt": { contentType: "text/plain; charset=iso-8859-1", body: Buffer.from([0x63, 0x61, 0x66, 0xe9]) },
  }, async () => {
    const parsed = await new DefaultSourceParser().parse({ kind: "url", url: "https://public.example/latin1.txt" });
    assert.match(parsed.body, /café/);
  });
});

test("parser web dependencies stay out of domain and application modules", async () => {
  const sdkRoot = dirname(fileURLToPath(import.meta.url)).replace(/\/test$/, "");
  const application = await readFile(join(sdkRoot, "src", "application", "knowledge-base.ts"), "utf8");
  const domainTypes = await readFile(join(sdkRoot, "src", "domain", "types.ts"), "utf8");
  const domainErrors = await readFile(join(sdkRoot, "src", "domain", "errors.ts"), "utf8");

  for (const content of [application, domainTypes, domainErrors]) {
    assert.doesNotMatch(content, /(?:jsdom|@mozilla\/readability|turndown|pdf-parse|mammoth|node-pptx-parser)/);
  }
});
