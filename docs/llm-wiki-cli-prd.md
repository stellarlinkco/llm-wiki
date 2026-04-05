# Product Requirements Document: llm-wiki CLI

**Version**: 2.0
**Date**: 2026-04-05
**Author**: PRD Compiler
**Status**: Final

## Quick Reference (Agent Context)

> **Goal**: Ship a Python CLI (`llm-wiki`) that handles all deterministic wiki operations (init, parse, index, search, validate, list, status) so the LLM skill layer only handles non-deterministic work (synthesis, cross-referencing, wiki page writing).
> **Non-Goals**: LLM-powered content generation, cloud/SaaS hosting, real-time sync, npm publishing
> **Architecture**: Clean Architecture + DDD + Hexagonal — domain layer has zero external deps, infrastructure adapters are swappable
> **Primary Parser**: Microsoft MarkItDown (`markitdown[all]`)
> **Primary Workflow**: `llm-wiki init` → user drops files into `raw/` → `llm-wiki parse <file>` → `llm-wiki index` → `llm-wiki search <query>` → Skill layer does LLM synthesis
> **Success Metric**: All seven CLI commands pass acceptance tests; Skill layer can invoke every command via `Bash` tool and consume JSON output
> **Key Constraints**: Python 3.10+, Clean/DDD/Hexagonal architecture, `markitdown[all]` as parsing engine
> **Verification Path**: `pytest` unit + integration tests covering all commands

---

## Executive Summary

The llm-wiki skill currently relies on the LLM for all operations including deterministic tasks like parsing documents, checking link integrity, and searching content. This creates unnecessary token spend, latency, and non-reproducibility.

This PRD specifies a Python CLI tool that owns every deterministic operation. The CLI lives inside the skill directory at `cli/`, is installable via `pip install -e .` or `uv pip install -e .`, and produces machine-readable output (JSON to stdout) that the Skill layer consumes via subprocess.

**Key architecture decision**: The CLI follows **Clean Architecture + DDD + Hexagonal** patterns. The domain layer contains pure business logic with zero external dependencies. Infrastructure adapters (MarkItDown, BM25, filesystem) are injected through ports. This makes the core logic testable without any I/O and allows swapping adapters (e.g., replacing BM25 with vector search) without touching domain or application code.

---

## Problem Statement

**Current Situation**: The llm-wiki skill uses LLM calls for deterministic operations (parsing documents, checking schemas, searching text, listing pages). This wastes tokens, introduces non-determinism, and is slow.

**Proposed Outcome**: A standalone CLI handles all deterministic operations with exact, fast, reproducible results. The Skill layer calls the CLI via subprocess and focuses on LLM-dependent work. Token spend drops; reproducibility reaches 100% for CLI-handled tasks.

**Why Now**: The skill architecture is being formalized. Building the CLI now establishes the deterministic foundation before the skill layer grows complex.

---

## Goals

- G1: Provide a single CLI binary (`llm-wiki`) with seven subcommands: `init`, `parse`, `validate`, `index`, `search`, `list`, `status`
- G2: Convert source documents (PDF, DOCX, HTML, PPTX, XLSX, EPUB, images, text, markdown, Jupyter notebooks) into structured markdown with YAML frontmatter, using Microsoft MarkItDown as the parsing engine
- G3: Enable fast, reproducible full-text search over wiki content via BM25 index
- G4: Validate wiki structural integrity (frontmatter schema, dead links, directory structure)
- G5: Produce machine-readable output (JSON to stdout, logs to stderr) consumable by the Skill layer without post-processing
- G6: Follow Clean Architecture + DDD + Hexagonal patterns: domain layer has zero external deps, all I/O goes through ports/adapters

## Non-Goals

- NG1: LLM-powered content generation, synthesis, or cross-referencing (Skill layer's job)
- NG2: Cloud hosting, SaaS deployment, or remote API
- NG3: Real-time file watching or automatic re-indexing
- NG4: npm/TypeScript — CLI is Python only
- NG5: Vector/semantic search (BM25 only for V1)
- NG6: GUI or TUI interface
- NG7: Writing to `wiki/` except `wiki/index.md` — all other wiki content owned by Skill layer

---

## Architecture: Clean + DDD + Hexagonal

### Dependency Rule

```
Infrastructure → Application → Domain
  (adapters)     (use cases)    (core)
```

Dependencies point **inward only**. Domain has zero external package imports.

### Directory Structure

```
cli/
├── pyproject.toml
├── src/
│   └── llm_wiki/
│       ├── __init__.py
│       ├── domain/                     # Inner ring: pure business logic
│       │   ├── __init__.py
│       │   ├── models.py              # Value objects: ParsedDocument, WikiPage, SearchResult, etc.
│       │   ├── ports.py               # Port interfaces (ABC): DocumentParser, PageRepository, SearchEngine
│       │   └── errors.py              # Domain-specific errors
│       ├── application/               # Middle ring: use case orchestration
│       │   ├── __init__.py
│       │   ├── init_project.py        # Init use case
│       │   ├── parse_document.py      # Parse use case
│       │   ├── build_index.py         # Index use case
│       │   ├── search_wiki.py         # Search use case
│       │   ├── validate_wiki.py       # Validate use case
│       │   ├── list_pages.py          # List use case
│       │   └── get_status.py          # Status use case
│       └── infrastructure/            # Outer ring: adapters + composition
│           ├── __init__.py
│           ├── markitdown_parser.py   # DocumentParser adapter (markitdown[all])
│           ├── filesystem.py          # PageRepository adapter (local fs + python-frontmatter)
│           ├── bm25_search.py         # SearchEngine adapter (rank-bm25)
│           ├── cli.py                 # Driver adapter (Click CLI)
│           └── container.py           # Composition root (DI wiring)
└── tests/
    ├── unit/                          # Domain + application tests (no I/O)
    └── integration/                   # Full stack tests with real files
```

### Domain Models (Value Objects)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `SourceFile` | File to be parsed | `path`, `format` |
| `ParsedDocument` | Result of parsing | `content`, `frontmatter`, `source` |
| `Frontmatter` | YAML metadata | `title`, `source_path`, `format`, `parsed_at` |
| `WikiPage` | A page in the wiki | `path`, `title`, `page_type`, `created`, `updated`, `sources`, `tags`, `word_count` |
| `SearchResult` | Search hit | `path`, `score`, `title`, `snippet` |
| `ValidationError` | Single finding | `error_type`, `file`, `message`, `line` |
| `ValidationReport` | Full report | `valid`, `errors`, `warnings` |
| `WikiStatus` | Status summary | `wiki_root`, `raw_documents`, `wiki_pages`, `by_type`, `total_word_count`, `index_stale`, `search_index_exists` |
| `WikiProject` | Aggregate root | `root`, `name` + derived paths (`raw_dir`, `wiki_dir`, `index_path`, `log_path`, `search_index_path`) |
| `PageType` | Enum | `entity`, `concept`, `source`, `comparison`, `query`, `overview` |

### Ports (Driven Interfaces in Domain Layer)

| Port | Methods | Adapter |
|------|---------|---------|
| `DocumentParser` | `parse(SourceFile) → ParsedDocument`, `supported_formats() → list[str]` | `MarkItDownParser` |
| `PageRepository` | `list_pages(dir) → list[WikiPage]`, `read_content(path) → str`, `write_content(path, str)`, `exists(path) → bool` | `LocalFileSystem` |
| `SearchEngine` | `build_index(docs)`, `search(query, limit) → list[SearchResult]`, `save_index(path)`, `load_index(path)` | `BM25Search` |

### Technology Stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Language | Python 3.10+ | MarkItDown is Python-native; best parsing ecosystem |
| Parsing | `markitdown[all]` | Microsoft official, 91k stars, covers PDF/DOCX/PPTX/XLSX/HTML/images/audio/notebooks |
| CLI | Click | Mature, well-tested, composable commands |
| Frontmatter | python-frontmatter | Purpose-built for YAML frontmatter in markdown |
| Search | rank-bm25 | Lightweight BM25Okapi implementation |
| Build | Hatchling | Modern Python packaging |
| Install | `pip install -e .` or `uv pip install -e .` | Standard Python editable install |

---

## Confirmed Facts & Assumptions

### Confirmed Facts
- CLI package lives at `llm-wiki/cli/` inside the skill directory
- Python 3.10+, managed with pip/uv
- Microsoft MarkItDown (`markitdown[all]`) is the sole parsing engine
- Clean Architecture + DDD + Hexagonal: domain layer has zero external deps
- `parse` outputs one `.md` per source to `raw/` with YAML frontmatter (`title`, `source_path`, `format`, `parsed_at`)
- `validate` checks: frontmatter schema, dead links, directory structure
- `index` regenerates `wiki/index.md` AND builds BM25 search index at `.llm-wiki/search-index.json`
- `search` returns ranked JSON results with snippets
- `init` scaffolds the full wiki project structure
- Skill invokes CLI via subprocess through Bash tool
- stdout = JSON (machine), stderr = human messages, exit codes 0/1/2
- Three-layer wiki: `raw/` (immutable sources) → `wiki/` (LLM-generated) → `CLAUDE.md` (schema)

### Working Assumptions
- BM25 index stored as JSON (tokenized corpus + metadata), rebuilt from source on `llm-wiki index`
- Wiki root discovery: walk up from CWD looking for `.llm-wiki/` marker directory
- Click is the CLI framework
- python-frontmatter for YAML frontmatter parsing
- rank-bm25 for BM25Okapi implementation

### Open Questions (Non-Blocking)
- Exact snippet extraction algorithm for search results — implementation decision
- Whether to add `--watch` mode later — defer to V2
- Per-category sub-indexes for large wikis — defer to V2

---

## Commands & User Stories

### Command 0: Init Project (`llm-wiki init`)

**As a** user starting a new knowledge base
**I want to** scaffold a wiki project structure
**So that** I have the correct directory layout and schema to begin working

**Acceptance Criteria:**
- [ ] `llm-wiki init [path]` creates the full directory structure at the given path (default: CWD)
- [ ] Creates: `raw/`, `raw/assets/`, `wiki/`, `wiki/entities/`, `wiki/concepts/`, `wiki/sources/`, `wiki/comparisons/`, `wiki/queries/`, `.llm-wiki/`
- [ ] Creates `wiki/index.md` with empty catalog template
- [ ] Creates `wiki/log.md` with empty log template
- [ ] Creates `wiki/overview.md` with placeholder
- [ ] Creates `CLAUDE.md` with wiki schema template (page format, linking conventions, workflows)
- [ ] `--name` flag sets the wiki name in CLAUDE.md (default: directory name)
- [ ] `--description` flag sets the wiki description
- [ ] If the directory already contains a `.llm-wiki/` marker, prints warning and exits without overwriting
- [ ] Exit code 0 on success

### Command 1: Parse Document (`llm-wiki parse`)

**As a** Skill layer (or human)
**I want to** convert a source document into structured markdown with metadata
**So that** the raw content is in a uniform format ready for LLM synthesis

**Acceptance Criteria:**
- [ ] `llm-wiki parse <file-path>` reads the source file via MarkItDown and writes one `.md` file to `raw/`
- [ ] Output markdown contains YAML frontmatter: `title` (extracted or from filename), `source_path` (original path), `format` (file extension), `parsed_at` (ISO 8601)
- [ ] Supported formats: everything MarkItDown supports — PDF, DOCX, PPTX, XLSX, HTML, images (EXIF+OCR), audio, text, CSV, JSON, XML, Jupyter notebooks, ZIP
- [ ] `llm-wiki parse <directory>` processes all supported files in the directory (non-recursive by default, `--recursive` for recursive)
- [ ] If target output already exists in `raw/`, overwrites and updates `parsed_at`
- [ ] Outputs JSON to stdout: `{"parsed": ["raw/file1.md", "raw/file2.md"], "failed": [], "skipped": []}`
- [ ] Exit code 0 on success; 1 if any files failed (but other files still processed)

### Command 2: Validate Wiki (`llm-wiki validate`)

**As a** Skill layer (or human)
**I want to** check the wiki for structural problems
**So that** issues are caught before they compound

**Acceptance Criteria:**
- [ ] `llm-wiki validate` runs from within a wiki project (auto-discovers root)
- [ ] Checks all `.md` files in `raw/` and `wiki/` for valid YAML frontmatter
- [ ] Reports dead internal links (markdown links to nonexistent files)
- [ ] Validates directory structure: required dirs and files exist
- [ ] Output JSON: `{"valid": bool, "errors": [...], "warnings": [...]}`
- [ ] Each error/warning: `{"type": str, "file": str, "message": str, "line": int|null}`
- [ ] Exit code 0 if valid (warnings OK), non-zero if errors
- [ ] `--fix` creates missing directories and adds missing frontmatter with defaults

### Command 3: Build Index (`llm-wiki index`)

**As a** Skill layer (or human)
**I want to** regenerate the content catalog and search index
**So that** search is current and the catalog matches reality

**Acceptance Criteria:**
- [ ] `llm-wiki index` regenerates `wiki/index.md` by scanning all `.md` in `wiki/` subdirectories
- [ ] Index entries grouped by page type, sorted alphabetically: `- [Title](path) — summary (N sources)`
- [ ] Summary extracted from first non-frontmatter paragraph, truncated to 120 chars
- [ ] Builds BM25 search index from all wiki + raw markdown, stored at `.llm-wiki/search-index.json`
- [ ] BM25 index includes: path, title, full text content, tags
- [ ] Output JSON: `{"catalog_entries": N, "indexed_documents": N, "index_path": "..."}`
- [ ] Exit code 0

### Command 4: Search Wiki (`llm-wiki search`)

**As a** Skill layer (or human)
**I want to** find relevant wiki pages for a query
**So that** the Skill can read the right pages before synthesizing

**Acceptance Criteria:**
- [ ] `llm-wiki search <query>` returns BM25-ranked results
- [ ] Output JSON array: `[{"path": str, "score": float, "title": str, "snippet": str}]`
- [ ] Snippets: 1-3 sentences, max 300 chars
- [ ] `--limit N` (default 10)
- [ ] `--type <type>` filters by page type
- [ ] `--raw-only` / `--wiki-only` restrict search scope
- [ ] If search index missing or stale, prints warning to stderr suggesting `llm-wiki index`
- [ ] Exit code 0 (even if zero results); 2 if index not found

### Command 5: List Pages (`llm-wiki list`)

**As a** Skill layer (or human)
**I want to** get a structured listing of all wiki content
**So that** I know what exists without reading index.md

**Acceptance Criteria:**
- [ ] `llm-wiki list` outputs JSON array: `[{"path": str, "title": str, "type": str, "created": str, "updated": str, "sources": [...], "tags": [...]}]`
- [ ] `--type <type>` filters by page type
- [ ] `--sort <field>` sorts by frontmatter field (default: `title`)
- [ ] `--raw` lists parsed files in `raw/` instead of wiki pages
- [ ] Exit code 0

### Command 6: Wiki Status (`llm-wiki status`)

**As a** Skill layer (or human)
**I want to** get a quick summary of wiki health and size
**So that** I can decide what operations to run

**Acceptance Criteria:**
- [ ] Output JSON: `{"wiki_root": str, "raw_documents": int, "wiki_pages": int, "by_type": {...}, "total_word_count": int, "last_modified": str|null, "index_stale": bool, "search_index_exists": bool}`
- [ ] `by_type` breaks down page counts by wiki page type
- [ ] `total_word_count` is approximate (whitespace split)
- [ ] `index_stale` true if any `.md` is newer than index files
- [ ] Exit code 0

---

## Functional Requirements

### FR-1: Wiki Root Discovery
- Walk up from CWD (or `--root <path>`) looking for `.llm-wiki/` marker directory
- If not found: exit with `"No llm-wiki project found. Run 'llm-wiki init' or use --root <path>."`
- Applies to all commands except `init`

### FR-2: Document Parsing via MarkItDown
- Single dependency for all document conversion: `markitdown[all]`
- Format detection by file extension
- CLI wraps MarkItDown output with YAML frontmatter and writes to `raw/`
- Parse errors for individual files don't halt batch processing

### FR-3: Frontmatter Contract
- Parsed files (raw/): `title`, `source_path`, `format`, `parsed_at`
- Wiki pages (wiki/): `title`, `type`, `created`, `updated`, `sources`, `tags`
- This is the interface between CLI and Skill layer — changes are breaking

### FR-4: BM25 Search Index
- Stored as JSON at `.llm-wiki/search-index.json`
- Contains tokenized corpus + document metadata
- Rebuilt entirely on each `llm-wiki index` (no incremental)
- Loaded into memory on each `llm-wiki search`

### FR-5: Subprocess-Friendly Output
- stdout: JSON only (machine-parseable)
- stderr: human-readable messages, warnings, progress
- Exit codes: 0 = success, 1 = user/input error, 2 = system error

---

## Acceptance Matrix

| ID | Requirement | Priority | Verify |
|----|-------------|----------|--------|
| A0 | `init` creates full directory structure + CLAUDE.md + index.md + log.md | P0 | Integration test |
| A1 | `parse` converts PDF via MarkItDown with correct frontmatter | P0 | Integration test with sample PDF |
| A2 | `parse` converts DOCX via MarkItDown | P0 | Integration test with sample DOCX |
| A3 | `parse` converts HTML via MarkItDown | P0 | Integration test with sample HTML |
| A4 | `parse` batch processes a directory | P0 | Integration test with mixed files |
| A5 | `validate` detects missing frontmatter fields | P0 | Unit test |
| A6 | `validate` detects dead internal links | P0 | Unit test |
| A7 | `validate` checks directory structure | P0 | Unit test |
| A8 | `validate --fix` creates missing directories | P1 | Integration test |
| A9 | `index` regenerates wiki/index.md grouped by type | P0 | Integration test |
| A10 | `index` builds BM25 search index | P0 | Integration test |
| A11 | `search` returns ranked JSON with snippets | P0 | Integration test |
| A12 | `search --limit` caps results | P0 | Unit test |
| A13 | `search --type` filters by page type | P1 | Unit test |
| A14 | `list` outputs JSON array with metadata | P0 | Integration test |
| A15 | `status` outputs JSON with correct counts and staleness | P0 | Integration test |
| A16 | All commands: JSON to stdout, logs to stderr | P0 | Integration test |
| A17 | Wiki root discovery from nested subdirectory | P0 | Integration test |
| A18 | `--root` override works | P1 | Integration test |
| A19 | Exit codes: 0 success, non-zero failure | P0 | Integration test |
| A20 | Domain layer has zero external imports | P0 | Architecture test (import check) |

---

## Edge Cases & Failure Handling

| Case | Expected Behavior |
|------|-------------------|
| `parse` unsupported format | Skip, error to stderr, exit 1 for single / continue in batch |
| `parse` scanned PDF (no text) | MarkItDown handles OCR if available; if fails, report as unparseable |
| `search` before `index` | Error to stderr, exit 2 |
| `validate` file with no frontmatter | Report as error; `--fix` prepends minimal frontmatter |
| `parse` output already exists | Overwrite, update `parsed_at`, warn to stderr |
| `init` on existing project | Warn and exit without overwriting |
| Wiki root not found | Error message suggesting `init` or `--root`, exit 1 |
| `index` with corrupted frontmatter | Skip from catalog, index body text only, warn to stderr |
| `index` interrupted mid-write | Next run fully regenerates (no incremental state) |
| Large wiki (>1000 files) | `index` <30s, `search` <500ms |

---

## Implementation Order

Following DDD + Clean Architecture implementation flow:

1. **Domain layer** — models (value objects, enums), ports (ABCs), errors
2. **Application layer** — use cases (one per command), depending only on domain
3. **Infrastructure adapters** — MarkItDownParser, LocalFileSystem, BM25Search
4. **Infrastructure CLI** — Click commands (driver adapter)
5. **Composition root** — container wiring ports → adapters
6. **Tests** — unit (domain + application with mocks) → integration (full stack)

---

## Dependencies

```
markitdown[all]>=0.1.0     # Document parsing (Microsoft)
click>=8.0                  # CLI framework
python-frontmatter>=1.0    # YAML frontmatter parsing
rank-bm25>=0.2              # BM25 search scoring
```

Dev dependencies:
```
pytest>=7.0
pytest-cov>=4.0
```

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MarkItDown fails on complex PDFs | Med | Med | MarkItDown has fallback chains internally; document limitations |
| rank-bm25 lacks persistence | Low | Low | Serialize tokenized corpus as JSON; rebuild is fast |
| python-frontmatter edge cases | Low | Low | Pin version; add round-trip tests |
| Domain purity violation during development | Med | Med | A20 architecture test: assert domain has zero external imports |

---

## Handoff Notes

- **Critical boundary**: CLI never writes to `wiki/` except `wiki/index.md`. Violating this breaks the architecture.
- **Output discipline**: stdout = JSON only. stderr = human messages. Non-negotiable for subprocess integration.
- **Frontmatter is the contract**: Changes to frontmatter fields are breaking changes between CLI and Skill.
- **Domain purity**: Domain layer must have zero imports from `markitdown`, `click`, `frontmatter`, `rank_bm25`, or any external package. This is enforced by architecture test A20.
- **Search index is disposable**: `.llm-wiki/search-index.json` is always regenerable. No migration logic needed.
- **Implementation order**: Domain → Application → Infrastructure → CLI → Container → Tests. Inside-out, following the dependency rule.
- **Fastest verification**: `pip install -e . && llm-wiki init /tmp/test-wiki && llm-wiki parse /tmp/test-wiki/raw/sample.pdf && llm-wiki index && llm-wiki search "test" && llm-wiki validate && llm-wiki list && llm-wiki status`
