---
name: llm-wiki
description: "Build and maintain LLM-powered personal knowledge bases using the @llm-wiki/sdk TypeScript SDK. Deterministic operations (document parsing, full-text search, validation, indexing) run through the SDK; LLM synthesis and cross-referencing are orchestrated by this Skill. Use when user wants to create a knowledge base, build a wiki, organize research, compile notes, ingest documents, or says 'llm-wiki'."
---

# LLM Wiki — Personal Knowledge Base Builder

The `@llm-wiki/sdk` TypeScript SDK handles document parsing, search, indexing, and validation. This Skill reads parsed content, synthesizes wiki pages, maintains cross-references, and answers questions on top of the deterministic SDK operations. The human curates sources and asks questions.

## Prerequisites

```bash
# Install the SDK (one-time)
cd ~/.agents/skills/llm-wiki/sdk && npm install && npm run build
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
User drops file ──▶ SDK (parse/index) ──▶ clean .md ──▶ Skill (LLM) ──▶ wiki pages
                    deterministic           in sources/    non-deterministic  in concepts/
```

Three wiki layers:
- **`sources/`** — parsed source documents (SDK writes, LLM reads, never modifies)
- **`concepts/`** — LLM-generated pages (entities, concepts, references, queries)
- **`references/`** — external links and citations

### SDK Operations (deterministic — use the SDK via Node.js)

```js
import { KnowledgeBase, OpenAIProvider } from "@llm-wiki/sdk";

const kb = await KnowledgeBase.create({ root: "<wiki-root>", name: "<name>" });
await kb.ingest({ path: "<file>" });
await kb.search("<query>");
await kb.validate();
await kb.status();
```

### Skill Operations (LLM intelligence — this file defines these)

All Skill operations use `mcp__node_repl_js` to execute SDK calls, then apply LLM intelligence on top.

| Skill Operation | Uses SDK | Then LLM does |
|----------------|----------|---------------|
| **init** | `KnowledgeBase.create()` | Ask user about wiki domain, customize scope |
| **ingest** | `kb.ingest()` + `kb.reindex()` | Synthesize wiki pages, update cross-references |
| **query** | `kb.search()` | Read pages, synthesize answer with citations |
| **lint** | `kb.validate()` + `kb.status()` | Find contradictions, suggest improvements |
| **status** | `kb.status()` | Present human-friendly summary |

---

## Init (`/llm-wiki init`)

### Process

1. **Scaffold via SDK**:
   Run through `mcp__node_repl_js`:
   ```js
   const kb = await KnowledgeBase.create({ root: "<path>", name: "<name>", description: "<description>" });
   ```
2. **Ask user**: What is this wiki about? What domain? Key topics?
3. **Customize scope**: Write a summary of domain context, key entities, and scope to the wiki root
4. Git init if not already a repo

---

## Ingest (`/llm-wiki ingest`)

The primary operation. A single source may touch 10-15 wiki pages.

### Process

1. **Parse via SDK** (deterministic):
   ```js
   const result = await kb.ingest({ path: "<source-file>" });
   ```
   This converts PDF/DOCX/HTML/etc → markdown in `sources/` with YAML frontmatter.

2. **Read parsed content**: Read the `.md` file from `sources/` that the SDK created.

3. **Discuss with user** (interactive mode):
   - Present 3-5 key takeaways from the source
   - Ask: "Anything to emphasize? Connections to existing wiki content?"
   - Skip if user said "just process it" or batch mode

4. **LLM synthesis** (create/update wiki pages):
   a. **Source summary** → `concepts/{slug}.md` with frontmatter, summary, key claims
   b. **Entity pages** → create or update for each significant entity
   c. **Concept pages** → create or update for abstract ideas
   d. **Overview** → update overview if the source changes the big picture
   e. **Cross-references** → add links between related pages

5. **Rebuild index via SDK**:
   ```js
   await kb.reindex();
   ```

6. **Append to log**:
   ```
   ## [YYYY-MM-DD] ingest | {Source Title}
   - Source: sources/{filename}
   - Created: {list of new pages}
   - Updated: {list of updated pages}
   - Key additions: {1-2 sentence summary}
   ```

7. **Report**: pages created/updated, new entities/concepts, suggested follow-ups.

### Batch Ingest

Process multiple files through steps 1-6. Skip interactive discussion.

---

## Query (`/llm-wiki query`)

### Process

1. **Search via SDK** to find relevant pages:
   ```js
   const results = await kb.search("<query>", { limit: 10 });
   ```

2. **Read relevant pages**: Follow the paths from search results, read full content.

3. **Synthesize answer**: Write answer with citations to wiki pages and original sources.

4. **Choose output format**:
   - Simple factual → text response
   - Comparison → markdown table
   - Deep analysis → offer to file in `concepts/queries/`

5. **File if valuable**: Save substantial answers, then:
   ```js
   await kb.reindex();
   ```

6. **Log** → append to `log.md`

---

## Lint (`/llm-wiki lint`)

### Process

1. **Structural check via SDK**:
   ```js
   const report = await kb.validate();
   ```
   Parse errors (dead links, missing frontmatter, missing dirs).

2. **Get wiki status via SDK**:
   ```js
   const status = await kb.status();
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

```js
const status = await kb.status();
```

Present a human-friendly summary:

```
## {Wiki Name} — Status

Sources:     {N} documents in sources/
Wiki pages:  {N} total ({concepts} concepts, ...)
Search:      {available/not built}

Recent activity (from log.md):
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
  - sources/paper1.md
  - sources/article2.md
tags:
  - topic1
  - topic2
---
```

### Linking
- Standard markdown: `[Page Title](concepts/page-name.md)`
- Cite sources: "claim [source-name]"
- Cross-reference liberally

---

## Supported Source Formats

Via the SDK's composite parser (jsdom, Readability, mammoth, pdf-parse, node-pptx-parser, turndown):
- **Documents**: PDF, DOCX, PPTX, XLSX
- **Web**: HTML, HTM
- **Text**: TXT, CSV, JSON, XML, MD
- **Buffers**: in-memory content with metadata

---

## Principles

1. **SDK does grunt work; LLM does thinking.** Parsing, searching, indexing, validating are deterministic — SDK handles them. Synthesis, cross-referencing, answering are intelligent — Skill handles them.
2. **The wiki is a persistent, compounding artifact.** Every source and every query makes it richer.
3. **The LLM writes; the human curates.** Source, explore, ask. The LLM does the bookkeeping.
4. **File valuable outputs back into the wiki.** Good answers shouldn't disappear into chat history.
5. **Cross-references are as valuable as content.** Link liberally.
6. **The wiki is just a git repo.** Version history, branching, diffing for free.
