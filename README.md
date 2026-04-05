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

```bash
cd cli
pip install -e ".[dev]"
pytest tests/ -v
```

162 tests: 32 domain unit + 73 application unit + 42 integration + 15 end-to-end.

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
