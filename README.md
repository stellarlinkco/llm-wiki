# LLM Wiki

Build persistent, compounding personal knowledge bases with LLMs. Inspired by [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

**Not RAG — a living book that grows itself.** Knowledge is compiled once, kept current, and compounds over time.

[中文文档](./README.zh-CN.md)

## Architecture

```
Source files ──▶ CLI (parse) ──▶ raw/*.md ──▶ Skill (LLM) ──▶ wiki pages
                 deterministic    parsed docs    synthesis      entities/concepts/summaries
```

Two-layer design:

| Layer | Responsibility | Tech |
|-------|---------------|------|
| **CLI** (`llm-wiki`) | Document parsing, search, indexing, validation | Python, MarkItDown, BM25+jieba |
| **Skill** (SKILL.md) | Knowledge synthesis, cross-referencing, wiki page generation | Claude Code / any LLM Agent |

Three-layer wiki structure:

```
my-wiki/
├── raw/          # Parsed source documents (CLI writes, LLM reads only)
├── wiki/         # LLM-generated wiki pages (entities, concepts, summaries, comparisons)
│   ├── entities/
│   ├── concepts/
│   ├── sources/
│   ├── index.md
│   └── log.md
├── CLAUDE.md     # Wiki schema (conventions, formats, workflows)
└── .llm-wiki/    # Search index
```

## Installation

```bash
git clone git@github.com:stellarlinkco/llm-wiki.git
cd llm-wiki/cli
pip install -e .
```

## Quick Start

```bash
# 1. Create a knowledge base
llm-wiki init ./my-wiki --name "AI Research" --description "Papers and notes on AI"

# 2. Parse documents (supports PDF/DOCX/HTML/PPTX/XLSX/TXT/images and more)
llm-wiki --root ./my-wiki parse ~/papers/paper.pdf
llm-wiki --root ./my-wiki parse ~/articles/article.docx

# 3. Build index
llm-wiki --root ./my-wiki index

# 4. Search (supports English and Chinese)
llm-wiki --root ./my-wiki search "attention mechanism"
llm-wiki --root ./my-wiki search "transformer architecture"

# 5. Validate wiki integrity
llm-wiki --root ./my-wiki validate

# 6. Check status
llm-wiki --root ./my-wiki status
```

## CLI Commands

All commands output JSON to stdout and logs to stderr. Designed for subprocess invocation by any LLM agent.

| Command | Description | Example |
|---------|-------------|---------|
| `init <path>` | Scaffold a wiki project | `llm-wiki init ./wiki --name "Research"` |
| `parse <file\|dir>` | Document → Markdown (via MarkItDown) | `llm-wiki --root ./wiki parse paper.pdf` |
| `index` | Rebuild catalog + BM25 search index | `llm-wiki --root ./wiki index` |
| `search <query>` | BM25-ranked search with snippets | `llm-wiki --root ./wiki search "transformers"` |
| `validate` | Check frontmatter, dead links, structure | `llm-wiki --root ./wiki validate` |
| `list` | List pages with metadata | `llm-wiki --root ./wiki list --type entity` |
| `status` | Wiki stats and staleness detection | `llm-wiki --root ./wiki status` |

### Common Flags

```bash
--root <path>      # Wiki root directory (auto-discovered by default via .llm-wiki/)
--recursive        # Process subdirectories when parsing
--limit N          # Max search results (default: 10)
--type <type>      # Filter by page type (entity/concept/source/comparison/query)
--raw-only         # Search only raw/ documents
--wiki-only        # Search only wiki/ pages
--raw              # List raw/ files instead of wiki/ pages
--fix              # Auto-fix recoverable validation issues
```

## TypeScript SDK synthesis flow

The SDK can build the same OKF bundle without an agent manually writing concept files:

```ts
import { KnowledgeBase, OpenAIProvider } from "@llm-wiki/sdk";

const kb = await KnowledgeBase.create({
  root: "./my-wiki",
  llm: new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    baseUrl: process.env.OPENAI_BASE_URL,
    model: process.env.OPENAI_MODEL,
  }),
});

await kb.crawl({ sitemapUrl: "https://example.com/sitemap.xml", limit: 80 });
await kb.ingest({ path: { kind: "url", url: "https://example.com/index.md" } });
await kb.synthesize({
  query: "company products agent interfaces",
  instructions: "Generate one grounded concept under concepts/company-overview.md.",
  limit: 8,
});
await kb.writeIndex({
  title: "Company Knowledge Base",
  description: "Generated from public source documents and SDK-synthesized concepts.",
});
await kb.validate();
```

`crawl()` fetches a sitemap, skips off-origin URLs, and ingests same-origin pages through the same `ingest()` path used by direct sources. `synthesize()` retrieves bundle context with SDK search, calls the configured LLM provider with JSON structured output, writes `concepts/*.md` through `writeConcept()`, marks generated concept frontmatter with `generated_by: llm-wiki-sdk`, reindexes the bundle, and records a `synthesize` audit entry. `writeIndex()` regenerates `index.md` as the bundle entry point listing source documents and generated concepts. `status()` reports source documents separately from generated concept documents.

## Supported Formats

Powered by [Microsoft MarkItDown](https://github.com/microsoft/markitdown):

- **Documents**: PDF, DOCX, PPTX, XLSX
- **Web**: HTML, HTM
- **Text**: TXT, CSV, JSON, XML, Markdown
- **Notebooks**: Jupyter (.ipynb)
- **Media**: JPG, PNG, GIF, WebP (EXIF/OCR), WAV, MP3
- **Archives**: ZIP (recursive)

## Search Features

- **BM25Plus** full-text search — handles small corpora correctly
- **jieba segmentation** for CJK (Chinese/Japanese/Korean) text
- **Title boosting** — pages whose title matches the query rank higher
- **Stopword filtering** — common CJK function words filtered from ranking
- **Deduplication** — raw/ and wiki/sources/ results for the same source are merged
- **Clean snippets** — matched sentences with markdown syntax stripped

## Architecture Design

Follows **Clean Architecture + DDD + Hexagonal** patterns:

```
cli/src/llm_wiki/
├── domain/              # Inner ring: pure business logic, zero external deps
│   ├── models.py        # Value objects: ParsedDocument, WikiPage, SearchResult...
│   ├── ports.py         # Port interfaces: DocumentParser, PageRepository, SearchEngine
│   └── errors.py        # Domain errors
├── application/         # Middle ring: use case orchestration
│   ├── init_project.py
│   ├── parse_document.py
│   ├── build_index.py
│   ├── search_wiki.py
│   ├── validate_wiki.py
│   ├── list_pages.py
│   └── get_status.py
└── infrastructure/      # Outer ring: adapters
    ├── markitdown_parser.py   # MarkItDown parsing adapter
    ├── filesystem.py          # Local filesystem adapter
    ├── bm25_search.py         # BM25+jieba search adapter
    ├── cli.py                 # Click CLI driver adapter
    └── container.py           # Dependency injection composition root
```

Dependency direction: `Infrastructure → Application → Domain` (inner ring has zero external imports)

## Testing

### SDK

```bash
cd sdk
npm test
npm run typecheck
```

The SDK test suite is split by surface:

- `test/knowledge-base.test.js` — core `KnowledgeBase` workflows.
- `test/source-parsers.test.js` — markdown/text/JSON/HTML/URL parsing and ingest behavior.
- `test/document-parsers.test.js` — PDF/DOCX/PPTX parser coverage.
- `test/providers.test.js` — LLM provider contracts and citation filtering.
- `test/validation.test.js` — OKF/frontmatter/link validation.
- `test/helpers.js` — shared fixtures and test helpers.
Current SDK gate: 92 Node tests plus TypeScript typecheck.

### CLI

```bash
cd cli
pip install -e ".[dev]"
python3 -m pytest tests/ -q
```

Current CLI gate: 162 tests — 32 domain unit + 73 application unit + 42 integration + 15 end-to-end.

### Packaged SDK E2E

Before release, build and pack `sdk`, install the generated tarball into a temporary app, then exercise package import/create/open, parser ingest/search, unsupported-media typed failure, query citation filtering, and validate/export.

### Create a demo knowledge base

```bash
cd sdk
npm run demo:create-kb
```

The demo builds the SDK, creates an isolated knowledge-base directory under `/tmp`, ingests a markdown source, runs search, validates the OKF bundle, and prints a JSON summary with the generated root path.

## Usage with Claude Code

Install `SKILL.md` as a Claude Code skill to control the knowledge base with natural language:

```
/llm-wiki init ./research --name "AI Papers"
/llm-wiki ingest ~/papers/attention.pdf    # Parse + LLM synthesis into wiki pages
/llm-wiki query "What's the difference between transformers and RNNs?"
/llm-wiki lint                              # Check knowledge consistency
```

## Inspiration

> "The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping. Updating cross-references, keeping summaries current, noting when new data contradicts old claims. Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass."
>
> — Andrej Karpathy

## License

MIT
