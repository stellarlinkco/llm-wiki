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

test("query does not fabricate citations when provider returns none", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(source, "# Architecture\n\nClean Architecture separates domain logic from infrastructure.\n", "utf8");
  const provider = {
    async generate() {
      return { text: "I cannot cite this answer." };
    }
  };

  const kb = await KnowledgeBase.create({ root, llm: provider });
  await kb.ingest({ path: source });
  const answer = await kb.query("What does Clean Architecture separate?");

  assert.deepEqual(answer.citations, []);
});

test("query uses configured provider, returns citations, and omits API key from bundle", async () => {
  const root = await tempRoot();
  const secret = "sk-test-secret";
  const provider = {
    async generate(request) {
      assert.ok(request.messages.at(-1).content.includes("Clean Architecture"));
      return {
        text: "Clean Architecture separates domain logic from infrastructure.",
        citations: ["sources/architecture.md"],
        usage: { inputTokens: 12, outputTokens: 8 }
      };
    }
  };

  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(source, "# Architecture\n\nClean Architecture separates domain logic from infrastructure.\n", "utf8");

  const kb = await KnowledgeBase.create({ root, llm: provider, metadata: { apiKey: secret } });
  await kb.ingest({ path: source });
  const answer = await kb.query("What does Clean Architecture separate?");

  assert.match(answer.text, /domain logic/);
  assert.deepEqual(answer.citations, ["sources/architecture.md"]);
  assert.equal(answer.retrieved[0].path, "sources/architecture.md");


  const sourceDoc = await readFile(join(root, "sources", "architecture.md"), "utf8");
  const log = await readFile(join(root, "log.md"), "utf8");
  assert.equal(sourceDoc.includes(secret), false);
  assert.equal(log.includes(secret), false);
});

test("query filters provider-supplied citations to bundle-local paths", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(source, "# Architecture\n\nClean Architecture separates domain logic from infrastructure.\n", "utf8");
  const provider = {
    async generate() {
      return { text: "answer", citations: ["../../secrets.md", "sources/architecture.md", "https://example.com/doc.md"] };
    }
  };

  const kb = await KnowledgeBase.create({ root, llm: provider });
  await kb.ingest({ path: source });
  const answer = await kb.query("What does Clean Architecture separate?");

  assert.deepEqual(answer.citations, ["sources/architecture.md"]);
});

test("query filters provider citations to retrieved bundle documents", async () => {
  const root = await tempRoot();
  const sourceRoot = await tempRoot();
  const source = join(sourceRoot, "architecture.md");
  await writeFile(source, "# Architecture\n\nClean Architecture separates domain logic from infrastructure.\n", "utf8");
  const provider = {
    async generate() {
      return { text: "answer", citations: ["sources/missing.md", "sources/architecture.md"] };
    }
  };

  const kb = await KnowledgeBase.create({ root, llm: provider });
  await kb.ingest({ path: source });
  const answer = await kb.query("What does Clean Architecture separate?");

  assert.deepEqual(answer.citations, ["sources/architecture.md"]);
});

test("query fails clearly without an LLM provider", async () => {
  const root = await tempRoot();
  const kb = await KnowledgeBase.create({ root });

  await assert.rejects(
    () => kb.query("anything"),
    (error) => error instanceof ConfigurationError && /LLM provider/.test(error.message)
  );
});

test("provider constructors reject missing and blank API keys", () => {
  for (const Provider of [OpenAIProvider, AnthropicProvider]) {
    assert.throws(
      () => new Provider({}),
      (error) => error instanceof ConfigurationError && /non-empty apiKey/.test(error.message)
    );
    assert.throws(
      () => new Provider({ apiKey: " \t\n" }),
      (error) => error instanceof ConfigurationError && /non-empty apiKey/.test(error.message)
    );
  }
});

test("OpenAIProvider uses the official client without exposing the API key in responses", async () => {
  const requests = [];
  const client = {
    chat: {
      completions: {
        create: async (request) => {
          requests.push(request);
          return {
            choices: [{ message: { content: "answer" } }],
            usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 }
          };
        }
      }
    }
  };

  const provider = new OpenAIProvider({ apiKey: "sk-provider-secret", model: "gpt-test", client });
  const response = await provider.generate({ messages: [{ role: "user", content: "Question" }] });

  assert.equal(response.text, "answer");
  assert.deepEqual(response.usage, { inputTokens: 3, outputTokens: 2, totalTokens: 5 });
  assert.equal(requests[0].model, "gpt-test");
  assert.deepEqual(requests[0].messages, [{ role: "user", content: "Question" }]);
  assert.equal(JSON.stringify(response).includes("sk-provider-secret"), false);
});

test("OpenAIProvider requests JSON mode and parses structured output", async () => {
  const requests = [];
  const client = {
    chat: {
      completions: {
        create: async (request) => {
          requests.push(request);
          return { choices: [{ message: { content: "{\"concept\":\"Architecture\"}" } }] };
        }
      }
    }
  };

  const provider = new OpenAIProvider({ apiKey: "sk-provider-secret", model: "gpt-test", client });
  const response = await provider.generate({ messages: [{ role: "user", content: "Return a concept name." }], structuredOutput: { type: "json" } });

  assert.deepEqual(requests[0].response_format, { type: "json_object" });
  assert.match(requests[0].messages[0].content, /Return only valid JSON/);
  assert.deepEqual(response.json, { concept: "Architecture" });
});

test("AnthropicProvider parses structured JSON output through fallback validation", async () => {
  const requests = [];
  const client = {
    messages: {
      create: async (request) => {
        requests.push(request);
        return {
          content: [{ type: "text", text: "{\"concept\":\"Architecture\"}" }],
          usage: { input_tokens: 1, output_tokens: 1 }
        };
      }
    }
  };

  const provider = new AnthropicProvider({ apiKey: "sk-anthropic-secret", model: "claude-test", client });
  const response = await provider.generate({ messages: [{ role: "user", content: "Return a concept name." }], structuredOutput: { type: "json" } });

  assert.match(requests[0].system, /Return only valid JSON/);
  assert.deepEqual(response.json, { concept: "Architecture" });
});

test("OpenAIProvider extracts and filters bundle-path citations from model text", async () => {
  const client = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{ message: { content: "See sources/architecture.md and concepts/design.md, not sources/../../secrets.md." } }]
        })
      }
    }
  };

  const provider = new OpenAIProvider({ apiKey: "sk-provider-secret", model: "gpt-test", client });
  const response = await provider.generate({ messages: [{ role: "user", content: "Question" }] });

  assert.deepEqual(response.citations, ["sources/architecture.md", "concepts/design.md"]);
});

test("AnthropicProvider uses the official client and extracts bundle citations", async () => {
  const requests = [];
  const client = {
    messages: {
      create: async (request) => {
        requests.push(request);
        return {
          content: [{ type: "text", text: "Answer cites sources/architecture.md." }],
          usage: { input_tokens: 7, output_tokens: 4 }
        };
      }
    }
  };

  const provider = new AnthropicProvider({ apiKey: "sk-anthropic-secret", model: "claude-test", maxTokens: 64, client });
  const response = await provider.generate({
    messages: [
      { role: "system", content: "Use citations." },
      { role: "user", content: "Question" }
    ]
  });

  assert.equal(requests[0].model, "claude-test");
  assert.equal(requests[0].max_tokens, 64);
  assert.equal(requests[0].system, "Use citations.");
  assert.deepEqual(requests[0].messages, [{ role: "user", content: "Question" }]);
  assert.deepEqual(response.citations, ["sources/architecture.md"]);
  assert.deepEqual(response.usage, { inputTokens: 7, outputTokens: 4 });
  assert.equal(JSON.stringify(response).includes("sk-anthropic-secret"), false);
});
