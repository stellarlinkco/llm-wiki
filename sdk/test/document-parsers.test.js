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
import { setPdfParserFactoryForTesting } from "../dist/infrastructure/parsers/pdf.js";

test("static URL ingest dispatches HTML, text, JSON, and PDF by fetched content type into searchable sources", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await withUrlRequester(
    {
      "https://public.example/html-source": {
        contentType: "text/html; charset=utf-8",
        body: "<!doctype html><html><body><main><h1>Web Launch</h1><p>Falcon web readiness uses customer telemetry.</p></main></body></html>",
      },
      "https://public.example/text-source.json": {
        contentType: "text/plain; charset=utf-8",
        body: "Plain URL notes describe aurora support handoffs.",
      },
      "https://public.example/json-source.txt": {
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({ program: "Orion", owner: "field analytics" }),
      },
      "https://public.example/pdf-source": {
        contentType: "application/pdf",
        body: pdfFixture("PDF URL text layer mentions nebula onboarding."),
      },
    },
    async () => {
      for (const path of ["/html-source", "/text-source.json", "/json-source.txt", "/pdf-source"]) {
        const changeSet = await kb.ingest({ path: `https://public.example${path}` });
        assert.deepEqual(changeSet.failed, []);
        assert.equal(changeSet.created.length, 1);
      }
    },
  );

  assert.equal((await kb.search("customer telemetry"))[0].path, "sources/html-source.md");
  assert.equal((await kb.search("aurora support"))[0].path, "sources/text-source.md");
  assert.equal((await kb.search("field analytics"))[0].path, "sources/json-source.md");
  assert.equal((await kb.search("nebula onboarding"))[0].path, "sources/pdf-source.md");
});

test("PDF text-layer file ingests and becomes searchable", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "partner-guide.pdf");
  await writeFile(source, pdfFixture("Partner PDF guide covers zircon renewal playbook."));

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });
  const sourceDoc = await readFile(join(root, "sources", "partner-guide.md"), "utf8");
  const results = await kb.search("zircon renewal");

  assert.deepEqual(changeSet.failed, []);
  assert.match(sourceDoc, /Partner PDF guide covers zircon renewal playbook/);
  assert.equal(results[0].path, "sources/partner-guide.md");
});

test("DOCX fixture ingests and becomes searchable", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "operations-handbook.docx");
  await writeFile(source, docxFixture());
  const parsed = await new DefaultSourceParser().parse(source);
  assert.match(parsed.body, /Operations Handbook/);
  assert.match(parsed.body, /DOCX content says cobalt renewal owners coordinate launch readiness/);

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });
  const sourceDoc = await readFile(join(root, "sources", "operations-handbook.md"), "utf8");
  const results = await kb.search("cobalt renewal launch readiness");

  assert.deepEqual(changeSet.failed, []);
  assert.match(sourceDoc, /Operations Handbook/);
  assert.match(sourceDoc, /DOCX content says cobalt renewal owners coordinate launch readiness/);
  assert.equal(results[0].path, "sources/operations-handbook.md");
});

test("PPTX fixture ingests slide sections and becomes searchable", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "roadmap-deck.pptx");
  await writeFile(source, pptxFixture());
  const parsed = await new DefaultSourceParser().parse(source);
  assert.match(parsed.body, /## Slide 1/);
  assert.match(parsed.body, /Quarterly Roadmap/);
  assert.match(parsed.body, /## Slide 2/);

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });
  const sourceDoc = await readFile(join(root, "sources", "roadmap-deck.md"), "utf8");
  const results = await kb.search("iris renewal training");

  assert.deepEqual(changeSet.failed, []);
  assert.match(sourceDoc, /## Slide 1/);
  assert.match(sourceDoc, /Quarterly Roadmap/);
  assert.match(sourceDoc, /## Slide 2/);
  assert.match(sourceDoc, /PPTX slide two says iris renewal training is searchable/);
  assert.equal(results[0].path, "sources/roadmap-deck.md");
});

test("PDF without a text layer fails safely and writes no source document", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "scanned.pdf");
  await writeFile(source, pdfFixture(""));

  const kb = await KnowledgeBase.create({ root });
  const changeSet = await kb.ingest({ path: source });

  assert.equal(changeSet.created.length, 0);
  assert.equal(changeSet.failed.length, 1);
  assert.match(changeSet.failed[0].error, /PDF_TEXT_LAYER_MISSING/);
  assert.deepEqual(await readdir(join(root, "sources")), []);
});

test("PDF parser construction failures are wrapped with source context", async () => {
  const content = pdfFixture("Parser factory failure fixture.");
  setPdfParserFactoryForTesting(async () => {
    throw new Error("deferred import unavailable");
  });

  try {
    await assert.rejects(
      () =>
        new DefaultSourceParser().parse({
          kind: "buffer",
          buffer: content,
          path: "deferred-import.pdf",
          contentType: "application/pdf",
        }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "PARSE_FAILED");
        assert.match(error.message, /PDF parsing failed: deferred import unavailable/);
        assert.equal(error.source.path, "deferred-import.pdf");
        assert.equal(error.source.contentType, "application/pdf");
        return true;
      },
    );
  } finally {
    setPdfParserFactoryForTesting(undefined);
  }
});

test("anonymous binary buffer identity avoids full-payload base64 copies before parsing", async () => {
  const pdf = pdfFixture("Anonymous PDF byte identity stays bounded.");
  const originalFrom = Buffer.from;
  const copiedInputs = [];

  setPdfParserFactoryForTesting(async () => ({
    async getText() {
      return { text: "Anonymous PDF byte identity stays bounded.", total: 1 };
    },
    async destroy() {},
  }));

  Buffer.from = function trackedBufferFrom(value, ...args) {
    if (value === pdf) {
      copiedInputs.push(value);
    }
    return originalFrom.call(Buffer, value, ...args);
  };

  try {
    const root = await tempRoot();
    const kb = await KnowledgeBase.create({ root });
    const result = await kb.ingest({
      path: {
        kind: "buffer",
        buffer: pdf,
        contentType: "application/pdf",
      },
    });
    assert.deepEqual(result.failed, []);
    assert.equal(result.created.length, 1);
  } finally {
    Buffer.from = originalFrom;
    setPdfParserFactoryForTesting(undefined);
  }

  assert.deepEqual(copiedInputs, []);
});

test("PDF parser destroy failures do not override successful parse results", async () => {
  const content = pdfFixture("Cleanup failure success fixture.");
  setPdfParserFactoryForTesting(async () => ({
    async getText() {
      return { text: "Cleanup failure success fixture.", total: 1 };
    },
    async destroy() {
      throw new Error("destroy unavailable");
    },
  }));

  try {
    const parsed = await new DefaultSourceParser().parse({
      kind: "buffer",
      buffer: content,
      path: "cleanup-success.pdf",
      contentType: "application/pdf",
    });
    assert.match(parsed.body, /Cleanup failure success fixture/);
  } finally {
    setPdfParserFactoryForTesting(undefined);
  }
});

test("PDF parser destroy failures do not override ParserError outcomes", async () => {
  const content = pdfFixture("Cleanup failure parser error fixture.");
  setPdfParserFactoryForTesting(async () => ({
    async getText() {
      return { text: "", total: 1 };
    },
    async destroy() {
      throw new Error("destroy unavailable");
    },
  }));

  try {
    await assert.rejects(
      () =>
        new DefaultSourceParser().parse({
          kind: "buffer",
          buffer: content,
          path: "cleanup-parser-error.pdf",
          contentType: "application/pdf",
        }),
      (error) => {
        assert.ok(error instanceof ParserError);
        assert.equal(error.code, "PDF_TEXT_LAYER_MISSING");
        assert.equal(error.source.path, "cleanup-parser-error.pdf");
        assert.equal(error.source.contentType, "application/pdf");
        return true;
      },
    );
  } finally {
    setPdfParserFactoryForTesting(undefined);
  }
});

test("binary buffer inputs reach PDF and DOCX parsers without SDK full-buffer copies", async () => {
  const pdf = pdfFixture("PDF byte identity stays intact.");
  const docx = docxFixture();
  const originalFrom = Buffer.from;
  const copiedInputs = [];
  let pdfBufferInput;
  let pdfUint8Input;

  setPdfParserFactoryForTesting(async (data) => {
    if (Buffer.isBuffer(data)) {
      pdfBufferInput = data;
    } else {
      pdfUint8Input = data;
    }
    return {
      async getText() {
        return { text: "PDF byte identity stays intact.", total: 1 };
      },
      async destroy() {},
    };
  });

  Buffer.from = function trackedBufferFrom(value, ...args) {
    if (value === pdf || value === docx) {
      copiedInputs.push(value);
    }
    return originalFrom.call(Buffer, value, ...args);
  };

  try {
    await new DefaultSourceParser().parse({
      kind: "buffer",
      buffer: pdf,
      path: "identity.pdf",
      contentType: "application/pdf",
    });
    const pdfView = new Uint8Array(pdf.buffer, pdf.byteOffset, pdf.byteLength);
    await new DefaultSourceParser().parse({
      kind: "buffer",
      buffer: pdfView,
      path: "identity-view.pdf",
      contentType: "application/pdf",
    });
    await new DefaultSourceParser().parse({
      kind: "buffer",
      buffer: docx,
      path: "identity.docx",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  } finally {
    Buffer.from = originalFrom;
    setPdfParserFactoryForTesting(undefined);
  }

  assert.equal(pdfBufferInput, pdf);
  assert.equal(pdfUint8Input?.buffer, pdf.buffer);
  assert.deepEqual(copiedInputs, []);
});

test("image, audio, and video sources fail unsupported without writing source documents", async () => {
  const cases = [
    ["diagram.png", "image/png", Buffer.from([0x89, 0x50, 0x4e, 0x47])],
    ["photo.jpg", "image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0xdb])],
    ["meeting.mp3", "audio/mpeg", Buffer.from("ID3")],
    ["demo.mp4", "video/mp4", Buffer.from("....ftypisom")],
  ];

  for (const [filename, contentType, content] of cases) {
    const root = await tempRoot();
    const sourceRoot = await tempRoot();
    const source = join(sourceRoot, filename);
    await writeFile(source, content);
    await assert.rejects(
      () => new DefaultSourceParser().parse({ kind: "buffer", buffer: content, path: filename, contentType }),
      /UNSUPPORTED_SOURCE/,
      filename,
    );

    const kb = await KnowledgeBase.create({ root });
    const changeSet = await kb.ingest({ path: source });

    assert.equal(changeSet.created.length, 0, filename);
    assert.equal(changeSet.failed.length, 1, filename);
    assert.match(changeSet.failed[0].error, /UNSUPPORTED_SOURCE/, filename);
    assert.deepEqual(await readdir(join(root, "sources")), [], filename);
  }
});
