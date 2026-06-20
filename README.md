# LLM Wiki

Build persistent, compounding personal knowledge bases with LLMs. Inspired by [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

**Not RAG — a living book that grows itself.** Knowledge is compiled once, kept current, and compounds over time.

[中文文档](./README.zh-CN.md)

## Architecture

```
Source files ──▶ KnowledgeBase SDK ──▶ OKF bundle (.md + frontmatter + search index)
                  parse / ingest       LLM synthesize / query / validate / export
```

The `@llm-wiki/sdk` TypeScript SDK manages the full knowledge-base lifecycle:
- **Ingest** — source parsing (URLs, files, buffers → Markdown with YAML frontmatter)
- **Search** — MiniSearch-based full-text search over bundle content
- **Synthesize** — LLM-driven concept generation from retrieved bundle context
- **Query** — LLM-powered Q&A with citation-filtered bundle context
- **Validate** — OKF schema, frontmatter, and link integrity checks
- **Export** — safe bundle copy to external destinations

Three-layer wiki structure:

```
my-wiki/
├── sources/       # Ingested source documents (SDK writes, LLM reads)
├── concepts/      # LLM-synthesized concept pages
├── references/    # External reference links
├── index.md       # Bundle entry-point catalog
├── log.md         # Changelog of bundle operations
└── .llm-wiki/     # Search index + metadata
```

## Quick Start

```bash
npm install @llm-wiki/sdk
```

```ts
import { KnowledgeBase, OpenAIProvider } from "@llm-wiki/sdk";

const kb = await KnowledgeBase.create({
  root: "./my-wiki",
  llm: new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
  }),
});

// Crawl a sitemap and ingest matching pages
await kb.crawl({ sitemapUrl: "https://example.com/sitemap.xml", limit: 80 });

// Ingest individual sources
await kb.ingest({ path: { kind: "url", url: "https://example.com/index.md" } });
await kb.ingest({ path: "./local-doc.pdf" });

// Synthesize concepts from bundle context using LLM
await kb.synthesize({
  query: "company products and interfaces",
  instructions: "Generate one grounded concept under concepts/company-overview.md.",
  limit: 8,
});

// Regenerate the entry-point index
await kb.writeIndex({
  title: "Company Knowledge Base",
  description: "Generated from public source documents and SDK-synthesized concepts.",
});

// Validate bundle integrity
const report = await kb.validate();
console.log(report.valid ? "OK" : report.errors);

// Export the bundle
await kb.export({ path: "./backup" });
```

`crawl()` fetches a sitemap, skips off-origin URLs, and ingests same-origin pages through the same `ingest()` path used by direct sources. `synthesize()` retrieves bundle context with SDK search, calls the configured LLM provider with JSON structured output, writes `concepts/*.md` through `writeConcept()`, marks generated concept frontmatter with `generated_by: llm-wiki-sdk`, reindexes the bundle, and records a `synthesize` audit entry. `writeIndex()` regenerates `index.md` as the bundle entry point listing source documents and generated concepts. `status()` reports source documents separately from generated concept documents.

## Supported Formats

- **Documents**: PDF, DOCX, PPTX, XLSX
- **Web**: HTML (via jsdom + Readability)
- **Text**: TXT, CSV, JSON, XML, Markdown
- **Buffers**: in-memory content with explicit metadata

## Search Features

- **MiniSearch** full-text search with typo tolerance and prefix matching
- **Relevance scoring** with title boost
- **Citation integrity** — `query()` restricts citations to paths actually in the retrieved bundle
- **Deterministic independence** — search, validate, status, export work without an LLM provider

## Architecture Design

Follows **ports-and-adapters** (hexagonal) layering:

```
sdk/src/
├── domain/              # Inner ring: types, interfaces, errors — zero deps
│   ├── types.ts         # Public contracts: KnowledgeBaseOptions, ChangeSet, ...
│   └── errors.ts        # Domain errors: ConfigurationError, ParserError
├── application/         # Middle ring: use-case orchestration
│   ├── knowledge-base.ts  # KnowledgeBase facade
│   ├── helpers.ts         # Shared utilities
│   └── search.ts          # Tokenization + scoring helpers
└── infrastructure/      # Outer ring: concrete adapters
    ├── filesystem.ts       # atomicWrite, path utilities
    ├── filesystem-store.ts # Bundle store (OKF file layout)
    ├── markdown.ts         # Markdown/frontmatter parse + serialize
    ├── local-search.ts     # MiniSearch adapter
    ├── source-parser.ts    # Composite source parser
    ├── parsers/            # Format-specific parsers (PDF, DOCX, PPTX, HTML, ...)
    └── providers/          # LLM provider adapters (OpenAI, Anthropic)
```

Dependency direction: `Infrastructure → Application → Domain` (inner ring has zero external imports).

## Testing

```bash
cd sdk
npm install
npm test          # 93 tests via node:test
npm run typecheck # strict TypeScript
```

Test files by surface:
- `test/knowledge-base.test.js` — core KnowledgeBase workflows
- `test/source-parsers.test.js` — markdown/text/JSON/HTML/URL parsing
- `test/document-parsers.test.js` — PDF/DOCX/PPTX parser coverage
- `test/providers.test.js` — LLM provider contracts and citation filtering
- `test/validation.test.js` — OKF/frontmatter/link validation
- `test/helpers.js` — shared fixtures and test helpers

### Packaged SDK E2E

Before release, build and pack `sdk`, install the generated tarball into a temporary Node app, import `@llm-wiki/sdk`, then exercise `create → ingest → search → query → validate → export`. Keep evidence when doing formal E2E QA.

Live OpenAI/Anthropic API calls are not part of the default local test suite. Treat them as separate provider-boundary E2E checks requiring safe sandbox credentials.

### Demo

```bash
cd sdk
npm run demo:create-kb
```

The demo builds the SDK, creates an isolated knowledge-base directory under `/tmp`, ingests a markdown source, runs search, validates the OKF bundle, and prints a JSON summary with the generated root path.

## Usage with Claude Code

Install `SKILL.md` as a Claude Code skill to synthesize, cross-reference, and query a knowledge base with natural language. The Skill orchestrates SDK operations and LLM synthesis on top of a deterministic bundle:

```
/llm-wiki init ./research --name "AI Papers"
/llm-wiki ingest ~/papers/attention.pdf
/llm-wiki query "What's the difference between transformers and RNNs?"
/llm-wiki lint
```

## Inspiration

> "The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping. Updating cross-references, keeping summaries current, noting when new data contradicts old claims. Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass."
>
> — Andrej Karpathy

## License

MIT
