# CONTEXT.md

> Domain language and business invariants for this repository.
> `AGENTS.md` is the operating contract; this file defines the vocabulary and domain boundaries that agents must use when applying it.

## Project Identity

LLM Wiki builds persistent, compounding knowledge bases for LLM-assisted work, inspired by [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) (local: `docs/karpathy-llm-wiki-gist.md`). The `@llm-wiki/sdk` TypeScript SDK provides an OKF-native knowledge bundle library — deterministic bookkeeping, local filesystem/search defaults, and official LLM provider adapters for synthesis.

- **Primary users / consumers**: TypeScript/Node applications embedding knowledge-base capabilities.
- **Business goal**: Make LLM-assisted knowledge management reproducible, file-based, and git-friendly.
- **Lifecycle**: library/SDK (maintained-forever).

## Domain Language

| Term | Meaning | Not the same as | Source / owner |
|------|---------|-----------------|----------------|
| **OKF** (Open Knowledge Format) | The file-based format for knowledge bundles — Markdown pages with YAML frontmatter, organized under `sources/`, `concepts/`, `references/`, with `.llm-wiki/` metadata and `index.md` catalog. Canonical spec: [Google Cloud Blog — Introducing the Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) (local copy: `docs/okf-google-cloud-blog.md`). | Not a database, not a vector store, not a graph DB | SDK contract `sdk/src/domain/types.ts` |
| **Bundle** | A complete OKF knowledge base directory — the unit of creation, ingestion, search, export, and validation | Not a single file; not a collection of arbitrary documents | `KnowledgeBase.create()` |
| **KnowledgeBase** | The public SDK facade class — orchestrates bundle lifecycle: create, ingest (source → parsed markdown), update, search, query (search + LLM synthesis), validate, export, status | Not a file system scanner; not an LLM agent | `sdk/src/application/knowledge-base.ts` |
| **SourceParser** | Port interface for converting source input (URL, file, string) into parsed markdown with frontmatter | Not a full document converter (delegates to format-specific parsers) | `sdk/src/infrastructure/source-parser.ts` |
| **SearchAdapter** | Port interface for full-text search over bundle content | Not a database query engine; not an LLM retrieval step | `sdk/src/infrastructure/local-search.ts` |
| **LLMProvider** | Port interface for LLM synthesis calls (query answering, concept generation) | Not a vendor SDK directly; application code depends on this interface, not `openai`/`@anthropic-ai/sdk` | `sdk/src/domain/types.ts` |
| **ChangeSet** | Return type for mutating SDK operations — contains `created`, `updated`, `deleted`, `skipped`, `failed`, `warnings` arrays | Not an exception; not a boolean success/failure | `sdk/src/domain/types.ts` |
| **frontmatter** | YAML metadata block at the top of every OKF page — includes `title`, `type`, `created`, `updated`, `sources`, `tags` | Not arbitrary YAML; follows OKF page convention | SKILL.md conventions |

## Bounded Contexts

| Context | Owns | Key terms | Forbidden logic | Integration boundary |
|---------|------|-----------|-----------------|----------------------|
| **Domain** (`sdk/src/domain/`) | Public types, interfaces (`SourceParser`, `SearchAdapter`, `LLMProvider`), error classes | `KnowledgeBaseOptions`, `ChangeSet`, `ConfigurationError` | Must NOT import from application or infrastructure | Exported via `sdk/src/index.ts` |
| **Application** (`sdk/src/application/`) | `KnowledgeBase` facade, search scoring helpers, synthesis prompts | `ingest`, `query`, `validate`, `export` | Must NOT import from infrastructure or vendor SDKs; depends on domain ports only | Called by consumers via `KnowledgeBase` |
| **Infrastructure** (`sdk/src/infrastructure/`) | Filesystem operations, markdown/frontmatter utilities, format-specific parsers, local search, provider adapters (OpenAI, Anthropic) | `atomicWrite`, `MiniSearch`, `OpenAIProvider` | Provider SDKs (`openai`, `@anthropic-ai/sdk`) must NOT leak into application or domain | Implements domain ports; wired in `KnowledgeBase` constructor |

## Core Invariants

- **Citation integrity**: `query()` must never fabricate citations. Every citation path must exist in the retrieved bundle and be restricted to paths actually retrieved.
- **OKF type openness**: The SDK must never model OKF `type` as a closed enum. Unknown `type` values must be preserved and passed through. Unknown frontmatter fields must be preserved.
- **Deterministic independence**: Methods that do not require LLM synthesis (`search`, `validate`, `status`, `listConcepts`, `export`) must work without an LLM provider configured.
- **Provider failure safety**: LLM-dependent methods (`query`, synthesis helpers) must throw `ConfigurationError` when no LLM provider is configured — never silently degrade or return empty results.
- **ChangeSet over exceptions**: Mutating operations return `ChangeSet` with per-file collections. Expected per-file failures (e.g., one document fails to parse while others succeed) must be reported in `ChangeSet.failed`, not thrown as exceptions that abort the entire batch.
- **Atomic writes**: SDK-managed bundle files must use `atomicWrite()` to prevent partial writes. File writes must validate destination paths to prevent writes outside the bundle root.
- **Export safety**: `export()` must reject destinations that are inside the bundle root (to prevent self-referential copies) and validate destination path safety.

## Public Interfaces and Contracts

| Interface | Contract source | Backward compatibility rule | Test seam |
|-----------|-----------------|-----------------------------|-----------|
| `KnowledgeBase` class | `sdk/src/application/knowledge-base.ts` | Public method signatures are a contract — breaking changes require semver major | `sdk/test/knowledge-base.test.js` |
| Public types | `sdk/src/domain/types.ts` | Exported types/interfaces are a contract | Snapshot test (via `just test-snapshots`) |
| SDK barrel | `sdk/src/index.ts` | All public exports; no internal symbols leaked | TypeScript compilation |

## Forbidden Logic & Irreversible Operations

| Rule | Scope | Why |
|------|-------|-----|
| Never force-push (`git push --force`, `-f`) | All branches | Destroys history; cannot be undone |
| Never deploy to production | Agent operations | Production deploys are human-gated |
| Never use `--no-verify` to bypass hooks | All commits | Hooks are the safety net; bypassing them hides violations |
| Never silently fall back to old code | Refactors | Parallel old/new paths cause drift — cut over cleanly |
| Never accept final-output-only parity | Refactors | Intermediate state must match for compilers/transformers/importers |

## Open Terminology Questions

None at this time. Domain terms have been stabilized through the AGENTS.md and SKILL.md conventions.
