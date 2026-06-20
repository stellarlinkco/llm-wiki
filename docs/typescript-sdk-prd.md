# Product Requirements Document: llm-wiki TypeScript SDK

**Version**: 1.0
**Date**: 2026-06-19
**Author**: To Spec
**Status**: Draft

## Quick Reference (Agent Context)

> **Goal**: Ship an OKF-native TypeScript SDK that lets application developers build, update, validate, search, and query a living LLM wiki by importing a package and configuring an LLM provider API key.
> **Primary Standard**: Open Knowledge Format (OKF) v0.1 — markdown concept documents with YAML frontmatter, reserved `index.md` / `log.md`, markdown cross-links, citations, permissive consumers.
> **Non-Goals**: SaaS hosting, proprietary knowledge graph schema, Python runtime dependency, replacing every specialized document parser in V1, vector database requirement, browser-only SDK.
> **Primary Runtime**: Node.js TypeScript SDK, ESM-first, Node 20+.
> **Primary Workflow**: `KnowledgeBase.open()` → `ingest()` → `reindex()` → `query()` / `search()` → `update()` → `validate()`.
> **Success Metric**: A TypeScript app can create an OKF bundle, ingest sources, generate/update concept docs using an LLM API key, answer questions with citations, and validate/export the bundle without shelling out to the existing Python CLI.
> **Key Constraints**: OKF-first artifact, no Python runtime dependency, pluggable LLM/search/storage/parser adapters, deterministic operations testable without LLM calls, LLM operations testable through provider contract tests or recorded fixtures.

---

## Converged Context

### Goal
Build a TypeScript SDK that packages the llm-wiki idea as a reusable developer library: users import the SDK, provide an LLM API key, and use one API surface for knowledge-base creation, ingestion, update, search, query, validation, and export.

### Non-goals
- Do not make the SDK depend on the current Python CLI at runtime.
- Do not invent a project-private knowledge format when OKF v0.1 already covers the portable bundle layer.
- Do not require a cloud service, database, queue, vector DB, or hosted dashboard for V1.
- Do not ship fake LLM integrations, no-op writers, or placeholder source parsers as completed behavior.
- Do not build a browser-only SDK in V1; Node filesystem support is required.

### Users / actors
- **Application developer**: embeds the SDK in a Node/TypeScript app.
- **Agent developer**: gives an agent a stable SDK for maintaining a knowledge base.
- **Knowledge maintainer**: inspects and reviews generated OKF markdown in git.
- **Consumption agent**: reads/searches/query OKF bundles produced by the SDK.

### Constraints
- Existing project is Python-first and CLI-first; TypeScript SDK is a new primary surface.
- Existing Python code remains a behavior reference, not a runtime dependency.
- OKF v0.1 is the canonical exchange format.
- LLM provider credentials must be provided by the caller and never persisted by default.
- Deterministic operations must be available without an LLM API key.

### Assumptions
- V1 package name is TBD; working name: `llm-wiki` or `@llm-wiki/sdk`.
- V1 targets Node 20+ and TypeScript 5+.
- V1 default storage is local filesystem; storage is adapter-based so remote storage can be added later.
- V1 default search is local BM25/full-text; vector search is adapter-based and optional later.
- V1 core package MUST ship official `OpenAIProvider` and `AnthropicProvider` adapters built directly on the maintained `openai` and `@anthropic-ai/sdk` packages; Gemini is later/extension scope.
- V1 source parsing starts with markdown/text/HTML/JSON plus optional document parser adapters. Broad parity with Python MarkItDown is a roadmap item, not a blocker for SDK shape.

### Blocking questions
Package name and parser dependency budget remain human gates. OpenAI and Anthropic are no longer optional provider-order decisions for V1 core.

---

## Problem Statement

The current llm-wiki project proves the core workflow with a Python CLI and a skill-driven LLM layer: deterministic operations are implemented in code, while synthesis/query/update behavior lives in `SKILL.md`. This is useful for agent-driven local workflows, but it is not yet a reusable SDK that application developers can import.

Meanwhile, OKF v0.1 has standardized the portable artifact layer for LLM-maintained knowledge: a directory of markdown concept documents with YAML frontmatter, reserved index/log files, markdown links, and citations. llm-wiki should align with OKF instead of continuing as a project-private wiki format.

A TypeScript SDK is needed so developers can embed living knowledge-base behavior directly in Node/TypeScript applications: ingest documents, maintain an OKF bundle, update it over time, search it, ask questions against it, and export it to other tools.

---

## Goals

- **G1**: Provide a TypeScript SDK with a small public API for create/open, ingest, update, search, query, validate, and export.
- **G2**: Make OKF v0.1 the canonical persisted knowledge format.
- **G3**: Require no Python runtime dependency for SDK use.
- **G4**: Keep deterministic operations separate from LLM operations so indexing, validation, parsing, and search are testable without API calls.
- **G5**: Support pluggable LLM providers through a stable provider interface.
- **G6**: Return auditable results for mutating operations: created files, updated files, citations, warnings, and validation status.
- **G7**: Preserve human-readable markdown and git-friendly diffs as first-class product behavior.
- **G8**: Provide migration/compatibility direction from the existing Python llm-wiki format to OKF-native bundles.

---

## Non-goals

- **NG1**: Hosted SaaS knowledge service.
- **NG2**: Required vector database or embedding provider.
- **NG3**: Full MarkItDown-equivalent parser parity in V1.
- **NG4**: Requiring users to install Python, run a CLI subprocess, or mount the current skill.
- **NG5**: Browser runtime support in V1.
- **NG6**: Multi-user collaborative editing or realtime sync.
- **NG7**: Defining a new knowledge exchange standard beyond OKF.
- **NG8**: Replacing domain-specific schemas such as OpenAPI, JSON Schema, Avro, or SQL DDL; the SDK may reference them from OKF concepts.

---

## Users / Actors

| Actor | Need | Success outcome |
|---|---|---|
| Application developer | Import SDK and build a knowledge base in app code | Can call SDK methods without shelling out |
| Agent developer | Give an agent durable knowledge memory | Agent can ingest/update/query a local OKF bundle |
| Knowledge maintainer | Review generated knowledge | Markdown diffs are readable in git |
| Consumption agent | Consume generated bundle | Can traverse OKF files without SDK-specific translation |

---

## User Stories

1. As an application developer, I want to create or open a knowledge base from TypeScript, so that I can embed knowledge workflows in my app.
2. As an application developer, I want to provide an LLM API key once, so that ingestion and query synthesis can use the configured provider.
3. As a knowledge maintainer, I want generated knowledge stored as OKF markdown, so that humans and agents can read it without proprietary tooling.
4. As an agent developer, I want deterministic search and validation methods, so that agents can inspect state before using expensive LLM calls.
5. As a knowledge maintainer, I want ingest/update operations to return a change summary, so that I can review what changed.
6. As an application developer, I want `query()` to return citations to concept/source files, so that answers are auditable.
7. As an SDK integrator, I want pluggable providers for LLM, storage, search, and parsing, so that I can swap infrastructure without changing domain behavior.
8. As an existing llm-wiki user, I want a migration path from the Python CLI format, so that existing wikis can move toward OKF-native SDK usage.

---

## Functional Requirements

### FR-001: SDK package and public facade
- The SDK MUST expose a primary `KnowledgeBase` facade.
- The SDK MUST support `KnowledgeBase.create(options)` and `KnowledgeBase.open(options)`.
- The facade MUST cover create/open, ingest, update, search, query, validate, status, list concepts, and export.
- Public APIs MUST be TypeScript-typed and documented through exported interfaces.

Example target API:

```ts
import { KnowledgeBase, OpenAIProvider } from "@llm-wiki/sdk";

const kb = await KnowledgeBase.open({
  root: "./knowledge",
  llm: new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! }),
});

await kb.ingest({ path: "./docs/architecture.md" });
const answer = await kb.query("What are the key architectural decisions?");
```

### FR-002: OKF-native bundle persistence
- The SDK MUST persist knowledge as an OKF v0.1-compatible bundle.
- Every non-reserved concept document MUST contain parseable YAML frontmatter and a non-empty `type` field.
- `index.md` and `log.md` MUST be treated as reserved OKF files.
- Concept paths MUST serve as concept IDs.
- The SDK MUST preserve unknown frontmatter fields when round-tripping documents.
- The SDK MUST tolerate unknown concept `type` values.

### FR-003: Default bundle layout
- The SDK MUST provide a default layout preset.
- The default layout SHOULD include:

```text
knowledge-root/
├── index.md
├── log.md
├── sources/
├── concepts/
├── references/
└── .llm-wiki/
    └── search-index.json
```

- The SDK MUST NOT require consumers to use only this layout; arbitrary OKF subdirectories MUST be readable.

### FR-004: Source ingestion
- The SDK MUST ingest at least markdown, plain text, HTML, and JSON sources in V1.
- The SDK SHOULD provide parser adapter interfaces for PDF, DOCX, URL fetchers, and custom binary/document parsers.
- Ingestion MUST create or update source/reference concept documents with citations and source metadata.
- Ingestion MUST optionally synthesize higher-level concept documents using the configured LLM provider.
- Ingestion MUST return a change summary listing created, updated, skipped, and failed files.

### FR-005: Knowledge update
- The SDK MUST support updating an existing source and propagating relevant changes into concept documents.
- The SDK MUST identify changed sources by at least content hash and path.
- Update MUST avoid blindly appending duplicate knowledge.
- Update MUST return an auditable `ChangeSet` with affected concept IDs and warnings.
- Update SHOULD detect potential contradictions and include them in warnings rather than silently overwriting claims.

### FR-006: Query answering
- The SDK MUST provide `query(question, options)`.
- Query MUST search the OKF bundle, assemble relevant context, call the configured LLM provider, and return a structured answer.
- Answers MUST include citations to concept/source documents when claims are grounded in the bundle.
- Query MUST expose enough metadata for callers to inspect retrieved documents and model usage.
- Query MUST fail clearly when no LLM provider is configured.

### FR-007: Deterministic search
- The SDK MUST provide local search that works without an LLM API key.
- V1 default search MUST be local and file-backed.
- Search results MUST include concept ID/path, title, type, score, snippet, and tags when available.
- Search indexing MUST be rebuildable from bundle contents.

### FR-008: Validation
- The SDK MUST validate OKF conformance.
- Validation MUST report errors for malformed frontmatter and missing required `type` on concept documents.
- Validation MUST treat broken internal links as warnings by default, matching OKF permissive-consumer semantics.
- Validation MUST report reserved-file misuse.
- Validation MUST be runnable without an LLM API key.

### FR-009: Official LLM provider adapters
- The SDK MUST define an `LLMProvider` interface independent of any one vendor.
- The SDK MUST ship `OpenAIProvider` backed by the official `openai` npm package.
- The SDK MUST ship `AnthropicProvider` backed by the official `@anthropic-ai/sdk` npm package.
- Provider adapters MUST support structured output requests where the vendor SDK supports them and otherwise use a validated JSON parse fallback.
- Provider adapters MUST not persist API keys.
- Provider SDK imports MUST live only in infrastructure/provider modules, never in domain models or application services.

### FR-010: Adapter architecture and public interfaces
- The SDK MUST define stable exported interfaces for search, parser, and LLM provider adapters.
- Default V1 adapters MUST include local filesystem persistence, local full-text search, markdown/text/HTML/JSON parsing, OpenAI, and Anthropic.
- Custom search, parser, and LLM adapters MUST be injectable through `KnowledgeBase.open()` / `create()` options.
- Domain logic MUST not import provider SDKs directly.
- The package MUST be module-structured for long-term maintenance; it MUST NOT concentrate domain, application, provider, storage, parser, and search logic in one large implementation file.

### FR-011: Logging and history
- Mutating operations MUST append an entry to `log.md` unless disabled by option.
- Log entries MUST be chronological and parseable enough for agents to inspect recent operations.
- Log entries MUST include operation type, timestamp/date, changed files, and warnings summary.

### FR-012: Export/import
- The SDK MUST expose the bundle as normal files on disk.
- The SDK SHOULD provide export to `.zip` or `.tar` after OKF validation.
- Export MUST not include provider credentials or transient caches unless explicitly requested.

### FR-013: Existing Python compatibility direction
- The TypeScript SDK MUST document how current Python llm-wiki projects map to OKF-native bundles.
- Compatibility tooling MAY be implemented as a migration command or SDK helper.
- The TypeScript SDK MUST NOT shell out to Python for normal V1 operations.

---

## Acceptance Criteria

| ID | Acceptance criterion | Priority | Verification |
|---|---|---|---|
| AC-001 | A TypeScript test app can create a new knowledge base and writes an OKF root `index.md` and `log.md` | P0 | Integration test |
| AC-002 | Ingesting a markdown file creates a conformant OKF concept/source document with `type` | P0 | Integration test |
| AC-003 | `validate()` passes for a generated bundle and fails for missing `type` | P0 | Unit + integration test |
| AC-004 | Broken internal links are warnings, not conformance errors by default | P0 | Unit test |
| AC-005 | `search()` works without an LLM provider and returns snippets | P0 | Integration test |
| AC-006 | `query()` returns an answer with citations using a configured test LLM provider | P0 | Contract test with fake provider |
| AC-007 | Mutating operations return a `ChangeSet` with created/updated/skipped/failed files | P0 | Unit + integration test |
| AC-008 | `update()` reprocesses a changed source without duplicating existing concepts | P1 | Integration test |
| AC-009 | SDK public API is fully typed and exported from package root | P0 | Typecheck test |
| AC-010 | No SDK method requires Python or the existing CLI at runtime | P0 | Dependency/architecture test |
| AC-011 | LLM provider API key is not written to bundle files or cache | P0 | Integration/security test |
| AC-012 | Unknown OKF `type` values are preserved and readable | P0 | Unit test |
| AC-013 | Unknown frontmatter fields are preserved on round-trip update | P0 | Unit test |
| AC-014 | Local search index is disposable and rebuilds from bundle files | P0 | Integration test |
| AC-015 | Export excludes `.llm-wiki` transient caches by default | P1 | Integration test |

---

## Edge Cases / Failure Handling

| Case | Expected behavior |
|---|---|
| Missing LLM API key for `query()` / synthesis ingest | Throw typed configuration error; deterministic methods still work |
| Missing LLM API key for `search()` / `validate()` | No error; methods do not require LLM |
| Malformed YAML frontmatter | Validation error with file path and parse message |
| Concept document missing `type` | Validation error |
| Unknown `type` | Preserve and treat as generic concept |
| Broken internal markdown link | Warning by default |
| Source parser cannot parse file | Add to `failed`, do not corrupt existing bundle |
| LLM returns invalid JSON for structured operation | Retry within bounded policy, then fail with raw provider error and no partial write unless change set is valid |
| Write interrupted mid-operation | Prefer temp-file + atomic rename for each file; next validation must surface incomplete state |
| Duplicate source path | Use content hash and stable source ID to avoid duplicate concept spam |
| Large bundle | Reindex remains deterministic; V1 target TBD by implementation benchmarking |
| User-provided custom adapter throws | Surface typed adapter error with operation context |

---

## Constraints

- OKF v0.1 is the persistence contract.
- SDK V1 targets Node 20+ and TypeScript 5+.
- Core SDK must not require Python.
- Deterministic application logic must be testable with fake adapters.
- LLM-dependent behavior must be isolated behind provider interfaces.
- Generated knowledge must remain human-readable markdown.
- API key and provider secrets must never be stored in the OKF bundle by default.

---

## Out of Scope

- Web dashboard or graph visualizer.
- Cloud sync service.
- Auth/multi-tenant SaaS controls.
- Realtime collaboration.
- Required vector search.
- Complete binary parser parity with Python MarkItDown.
- Browser runtime.

---

# Execution Spec

## Goal
Build a TypeScript SDK that turns llm-wiki from a Python CLI + skill workflow into an embeddable OKF-native library for creating, maintaining, and querying living knowledge bases.

## Scope

### In scope
- TypeScript package scaffold.
- `KnowledgeBase` public facade.
- OKF concept document model and validator.
- Local filesystem storage adapter.
- Local full-text search/index adapter.
- Parser adapter interface plus V1 built-ins for markdown/text/HTML/JSON.
- LLM provider interface plus at least one OpenAI-compatible adapter or fake-provider-compatible contract.
- Ingest, update, search, query, validate, status, list, export APIs.
- Tests for deterministic behavior and provider contract boundaries.

### Out of scope
- Hosted service.
- Required vector DB.
- Browser support.
- Python runtime dependency.
- Full parser parity with the Python CLI.

## Relevant Context

- Existing Python CLI has deterministic behavior for init/parse/index/search/validate/list/status and passes 162 tests.
- Existing Python `PageType` enum is too narrow for OKF; TS SDK should not repeat that mistake.
- OKF v0.1 requires every non-reserved concept file to have frontmatter with `type` and reserves `index.md` / `log.md`.
- OKF consumers must tolerate unknown types, unknown frontmatter fields, and broken links.
- Current project’s `SKILL.md` contains useful workflow logic for ingest/query/lint, but that logic needs to become SDK application services.

## Terms / Assumptions

- **OKF bundle**: Directory tree of markdown concept files with YAML frontmatter.
- **Concept ID**: Bundle-relative file path without `.md`.
- **Source concept**: OKF concept representing an ingested source or parsed source material.
- **ChangeSet**: Structured result of a mutating operation listing file changes and warnings.
- **Deterministic method**: Does not call LLM provider.
- **LLM method**: Calls configured provider and must expose usage/errors.

## Affected Surfaces

- **Code**: New TypeScript package, package root exports, domain/application/infrastructure modules.
- **Data / schema**: OKF markdown files, frontmatter, `.llm-wiki/search-index.json` cache.
- **API / CLI / UI**: SDK public API only for V1; optional CLI wrapper later.
- **Tests**: Unit tests for OKF parser/validator/search; integration tests using temp filesystem; fake LLM provider tests for query/ingest synthesis.
- **Docs / ops**: README quickstart, API examples, migration notes from Python format.

## Technical Direction

### Architecture
Use explicit modules with stable public interfaces and one-way dependencies:

```text
public facade → application services → domain interfaces/models
infrastructure adapters → domain interfaces
```

Rules:
- Domain modules define OKF concepts, source records, search results, validation findings, change sets, and ports.
- Application modules orchestrate use cases and depend only on domain ports.
- Infrastructure modules implement filesystem, parser, search, OpenAI, and Anthropic adapters.
- Provider SDK packages (`openai`, `@anthropic-ai/sdk`) are infrastructure dependencies only.
- The package root exports the public facade and stable types/interfaces; implementation helpers remain internal.
- Files should stay cohesive and reviewable; split modules before a file becomes a mixed-responsibility catch-all.

### Public API shape
Initial target surface:

```ts
const kb = await KnowledgeBase.create({ root, llm, storage, search });
const kb = await KnowledgeBase.open({ root, llm, storage, search });

await kb.ingest({ path });
await kb.update({ path });
await kb.reindex();
await kb.validate();
await kb.search("query", { limit: 10 });
await kb.query("question", { limit: 10 });
await kb.status();
await kb.listConcepts({ type: "Metric" });
await kb.export({ path: "bundle.zip" });
```

### OKF model
Do not model `type` as a closed enum. Use `type: string` and optional helpers for common categories.

Concept frontmatter minimum:

```ts
interface OkfFrontmatter {
  type: string;
  title?: string;
  description?: string;
  resource?: string;
  tags?: string[];
  timestamp?: string;
  [key: string]: unknown;
}
```

### ChangeSet model
Mutating methods return:

```ts
interface ChangeSet {
  operation: "create" | "ingest" | "update" | "reindex" | "validate";
  created: string[];
  updated: string[];
  deleted: string[];
  skipped: string[];
  failed: Array<{ path: string; error: string }>;
  warnings: Array<{ path?: string; code: string; message: string }>;
}
```

### LLM provider model
Provider interface must be minimal and exported:

```ts
interface LLMProvider {
  generate(request: LLMRequest): Promise<LLMResponse>;
}
```

Application services own prompts and schema validation. Provider adapters only translate requests/responses.

V1 core adapters:
- `OpenAIProvider` uses the official `openai` SDK.
- `AnthropicProvider` uses the official `@anthropic-ai/sdk`.
- Tests use fake providers for deterministic behavior and focused adapter tests for request translation/error handling.

### Storage model
V1 storage is local filesystem persistence because OKF bundles are file/directory artifacts and link validation depends on path semantics. Remote/custom storage is deferred until its path, atomic-write, export, and markdown-link contracts can be specified without weakening OKF behavior.

## Validation Plan

- **VAL-001**: Create OKF bundle. Surface: SDK integration. Evidence: test output showing generated `index.md`, `log.md`, and directories.
- **VAL-002**: Ingest markdown source. Surface: SDK integration. Evidence: generated concept/source file with valid `type` frontmatter and citations metadata.
- **VAL-003**: Validate OKF conformance. Surface: domain/application. Evidence: unit tests for missing type, malformed YAML, reserved filenames, broken-link warning.
- **VAL-004**: Search without LLM. Surface: SDK integration. Evidence: `search()` returns ranked results and snippets using local index.
- **VAL-005**: Query with fake provider. Surface: SDK integration. Evidence: `query()` returns answer, retrieved concept IDs, and citations without real network calls.
- **VAL-006**: Provider secret safety. Surface: integration/security. Evidence: search bundle files for configured fake API key; zero matches.
- **VAL-007**: No Python runtime dependency. Surface: architecture/dependency. Evidence: package dependency graph/test confirms no Python subprocess invocation for SDK methods.
- **VAL-008**: Round-trip unknown OKF fields. Surface: unit. Evidence: custom frontmatter field preserved after read/write update.

## Risks / Open Questions

| Risk / question | Impact | Direction |
|---|---|---|
| Package name not chosen | Low | Use working name until publishing decision |
| Parser dependency bloat | Medium | Keep parser interface; ship lightweight defaults; add heavy parsers as optional adapters |
| LLM-generated writes may corrupt knowledge | High | Require schema-validated plans/change sets before writes |
| OKF draft may evolve | Medium | Store/recognize `okf_version`; keep consumer permissive |
| Provider structured output differs by vendor | Medium | Normalize in provider adapters; validate in application layer |
| Existing Python format differs from OKF | Medium | Add migration notes/helper after OKF model stabilizes |

## Mission Handoff

### Suggested milestones
1. **OKF domain core**: concept model, frontmatter parser/serializer, bundle validator.
2. **Local deterministic SDK**: create/open, filesystem storage, index/search/status/list.
3. **Ingest pipeline**: parse markdown/text/HTML/JSON, create source concepts, update index/log.
4. **LLM provider boundary**: exported provider interface, fake provider tests, OpenAI adapter using `openai`, Anthropic adapter using `@anthropic-ai/sdk`.
5. **Query and synthesis**: context retrieval, answer generation with citations, change-set based ingest synthesis.
6. **Export and migration notes**: export bundle, document Python-to-OKF mapping.

### Required evidence
- Unit + integration test pass for TypeScript package.
- Typecheck pass.
- Example app can create, ingest, search, query, and validate a temp OKF bundle.
- No Python invocation during SDK integration tests.

### Human gates
- Package name and publishing scope.
- V1 parser support list and dependency budget.
- Gemini or other provider support timing.

## Readiness

Readiness: Ready

Reason: The PRD fixes the product boundary, OKF standard, TypeScript-first SDK scope, non-goals, acceptance criteria, validation seams, and implementation handoff without build-blocking ambiguity.

Next: Convert this PRD into an architecture document or issue slices before implementation.
