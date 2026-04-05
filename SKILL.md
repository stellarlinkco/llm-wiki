---
name: llm-wiki
description: "Build and maintain LLM-powered personal knowledge bases. Two-layer system: a Python CLI (`llm-wiki`) handles deterministic operations (document parsing via Microsoft MarkItDown, BM25 search, validation, indexing), while this Skill orchestrates LLM intelligence (synthesis, cross-referencing, wiki page generation). Use when user wants to create a knowledge base, build a wiki, organize research, compile notes, ingest documents, or says 'llm-wiki'."
---

# LLM Wiki — Personal Knowledge Base Builder

Two-layer architecture: **CLI** (deterministic) + **Skill** (LLM intelligence).

The CLI parses documents, searches, validates, indexes. The Skill reads parsed content, synthesizes wiki pages, maintains cross-references, and answers questions. The human curates sources and asks questions.

## Prerequisites

```bash
# Install the CLI (one-time, from skill directory)
cd ~/.agents/skills/llm-wiki/cli && pip install -e .
```

## Commands

```
/llm-wiki init [path]              # Scaffold a new wiki project
/llm-wiki ingest [source-path]     # Parse source + LLM synthesis into wiki
/llm-wiki query <question>         # Research and answer from the wiki
/llm-wiki lint                     # Health-check the wiki
/llm-wiki status                   # Wiki statistics and overview
```

---

## Architecture

```
User drops file ──▶ CLI (parse) ──▶ clean .md ──▶ Skill (LLM) ──▶ wiki pages
                    deterministic    in raw/       non-deterministic  in wiki/
```

Three wiki layers:
- **`raw/`** — parsed source documents (CLI writes, LLM reads, never modifies)
- **`wiki/`** — LLM-generated pages (entities, concepts, sources, comparisons, queries)
- **`CLAUDE.md`** — wiki schema and conventions

### CLI Commands (deterministic — call via Bash)

| CLI Command | What it does | Output |
|-------------|-------------|--------|
| `llm-wiki init <path>` | Scaffold project structure | JSON `{wiki_root, name, status}` |
| `llm-wiki parse <file\|dir>` | Convert documents to markdown via MarkItDown | JSON `{parsed, failed, skipped}` |
| `llm-wiki index` | Rebuild `wiki/index.md` + BM25 search index | JSON `{catalog_entries, indexed_documents}` |
| `llm-wiki search <query>` | BM25 ranked search with snippets | JSON array of `{path, score, title, snippet}` |
| `llm-wiki validate` | Check frontmatter, dead links, structure | JSON `{valid, errors, warnings}` |
| `llm-wiki list [--raw]` | List pages with metadata | JSON array of page objects |
| `llm-wiki status` | Wiki stats and staleness | JSON `{raw_documents, wiki_pages, ...}` |

All CLI commands: `--root <path>` to override wiki root discovery. JSON to stdout, logs to stderr.

### Skill Operations (LLM intelligence — this file defines these)

| Skill Operation | Uses CLI | Then LLM does |
|----------------|----------|---------------|
| **init** | `llm-wiki init` | Ask user about wiki domain, customize CLAUDE.md |
| **ingest** | `llm-wiki parse` + `llm-wiki index` | Synthesize wiki pages, update cross-references |
| **query** | `llm-wiki search` | Read pages, synthesize answer with citations |
| **lint** | `llm-wiki validate` + `llm-wiki search` | Find contradictions, suggest improvements |
| **status** | `llm-wiki status` | Present human-friendly summary |

---

## Init (`/llm-wiki init`)

### Process

1. **Scaffold via CLI**:
   ```bash
   llm-wiki init <path> --name "<name>" --description "<description>"
   ```
2. **Ask user**: What is this wiki about? What domain? Key topics?
3. **Customize CLAUDE.md**: Update the generated schema with domain-specific context, key entities, and scope
4. Git init if not already a repo

---

## Ingest (`/llm-wiki ingest`)

The primary operation. A single source may touch 10-15 wiki pages.

### Process

1. **Parse via CLI** (deterministic):
   ```bash
   llm-wiki --root <wiki-root> parse <source-file>
   ```
   This converts PDF/DOCX/HTML/etc → markdown in `raw/` with YAML frontmatter.

2. **Read parsed content**: Read the `.md` file from `raw/` that the CLI created.

3. **Discuss with user** (interactive mode):
   - Present 3-5 key takeaways from the source
   - Ask: "Anything to emphasize? Connections to existing wiki content?"
   - Skip if user said "just process it" or batch mode

4. **LLM synthesis** (create/update wiki pages):
   a. **Source summary** → `wiki/sources/{slug}.md` with frontmatter, summary, key claims
   b. **Entity pages** → `wiki/entities/` — create or update for each significant entity
   c. **Concept pages** → `wiki/concepts/` — create or update for abstract ideas
   d. **Overview** → update `wiki/overview.md` if the source changes the big picture
   e. **Cross-references** → add links between related pages

5. **Rebuild index via CLI**:
   ```bash
   llm-wiki --root <wiki-root> index
   ```

6. **Append to log** → `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | {Source Title}
   - Source: raw/{filename}
   - Created: {list of new pages}
   - Updated: {list of updated pages}
   - Key additions: {1-2 sentence summary}
   ```

7. **Report**: pages created/updated, new entities/concepts, suggested follow-ups.

### Batch Ingest

```bash
# Parse all files in a directory
llm-wiki --root <wiki-root> parse <directory> --recursive
```
Then process each parsed file through steps 2-6. Skip interactive discussion.

---

## Query (`/llm-wiki query`)

### Process

1. **Search via CLI** to find relevant pages:
   ```bash
   llm-wiki --root <wiki-root> search "<query>" --limit 10
   ```
   Parse the JSON output to get paths and snippets.

2. **Read relevant pages**: Follow the paths from search results, read full content.

3. **Synthesize answer**: Write answer with citations to wiki pages and original sources.

4. **Choose output format**:
   - Simple factual → text response
   - Comparison → markdown table
   - Deep analysis → offer to file in `wiki/queries/`

5. **File if valuable**: Save substantial answers to `wiki/queries/{slug}.md`, then:
   ```bash
   llm-wiki --root <wiki-root> index
   ```

6. **Log** → append to `wiki/log.md`

---

## Lint (`/llm-wiki lint`)

### Process

1. **Structural check via CLI**:
   ```bash
   llm-wiki --root <wiki-root> validate
   ```
   Parse JSON for errors (dead links, missing frontmatter, missing dirs).

2. **Get wiki status via CLI**:
   ```bash
   llm-wiki --root <wiki-root> status
   llm-wiki --root <wiki-root> list
   ```

3. **LLM semantic checks** (read pages, apply judgment):
   - **Contradictions** — scan for conflicting claims across pages
   - **Stale content** — newer sources may supersede older claims
   - **Orphan pages** — pages with no inbound links
   - **Missing pages** — entities/concepts mentioned but lacking their own page
   - **Missing cross-references** — opportunities for links between related pages
   - **Data gaps** — topics with thin coverage

4. **Report** as prioritized list (Critical / Important / Suggestions / Stats)

5. **Offer fixes**: "Want me to fix any of these?"

---

## Status (`/llm-wiki status`)

```bash
# Get raw stats from CLI
llm-wiki --root <wiki-root> status
```

Parse the JSON and present a human-friendly summary:

```
## {Wiki Name} — Status

Sources:     {N} documents in raw/
Wiki pages:  {N} total ({entities} entities, {concepts} concepts, ...)
Word count:  ~{N}K words
Index:       {stale/current}
Search:      {available/not built}

Recent activity (from wiki/log.md):
- ...
```

---

## Page Format Convention

Every wiki page has YAML frontmatter:

```yaml
---
title: Page Title
type: entity|concept|source|comparison|query|overview
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources:
  - raw/paper1.md
  - raw/article2.md
tags:
  - topic1
  - topic2
---
```

### Linking
- Standard markdown: `[Page Title](../entities/page-name.md)`
- Cite sources: "claim [source-name]"
- Cross-reference liberally

---

## Supported Source Formats

Via Microsoft MarkItDown (`markitdown[all]`):
- **Documents**: PDF, DOCX, PPTX, XLSX
- **Web**: HTML, HTM
- **Text**: TXT, CSV, JSON, XML, MD
- **Notebooks**: Jupyter (.ipynb)
- **Media**: JPG, PNG, GIF, WebP (EXIF/OCR), WAV, MP3
- **Archives**: ZIP (recursive)

---

## Principles

1. **CLI does grunt work; LLM does thinking.** Parsing, searching, indexing, validating are deterministic — CLI handles them. Synthesis, cross-referencing, answering are intelligent — Skill handles them.
2. **The wiki is a persistent, compounding artifact.** Every source and every query makes it richer.
3. **The LLM writes; the human curates.** Source, explore, ask. The LLM does the bookkeeping.
4. **File valuable outputs back into the wiki.** Good answers shouldn't disappear into chat history.
5. **Cross-references are as valuable as content.** Link liberally.
6. **The wiki is just a git repo.** Version history, branching, diffing for free.
