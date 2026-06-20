# PRD: TypeScript SDK V1 Source Parsing

**Date**: 2026-06-19
**Status**: Ready
**Scope owner**: TypeScript SDK

## Converged Context

**Goal:** Add deterministic V1 source parsing for the TypeScript SDK so a knowledge base can ingest common business documents without using `markitdown-ts` or the Python CLI.

**Non-goals:**
- Do not depend on `markitdown-ts`.
- Do not copy MarkItDown internals.
- Do not implement OCR, image text extraction, audio transcription, video transcription, login-state crawling, JS-rendered scraping, or layout-perfect document conversion in V1.
- Do not make `KnowledgeBase` depend directly on parser libraries.

**Users / actors:**
- Application developer embedding `@llm-wiki/sdk`.
- Agent developer building a knowledge-maintenance workflow.
- Knowledge maintainer reviewing generated markdown.

**Constraints:**
- Node.js 20+, ESM-first TypeScript SDK.
- SDK core remains ports-and-adapters: domain/application code depends on `SourceParser`, not concrete parser libraries.
- Deterministic parsing must work without an LLM provider.
- Parser failures must be structured and must not silently create empty or misleading knowledge.

**Known context:**
- Current SDK already has `SourceParser` and `ParsedSource` contracts in `sdk/src/domain/types.ts`.
- Current `DefaultSourceParser` reads UTF-8 text only.
- Project guidelines require provider/vendor imports to stay in infrastructure adapters.

**Assumptions:**
- V1 may add runtime parser dependencies to the SDK package rather than split optional parser packages immediately.
- V1 source files are local files, raw text, buffers, or public static URLs.
- V1 generated parser output is normalized markdown.

**Blocking questions:** None.

---

# Product Requirements

## Problem Statement

The TypeScript SDK needs enough source parsing to build a useful knowledge base from common company materials: markdown, text, HTML/web pages, PDF, DOCX, and PPTX. Using `markitdown-ts` would outsource this boundary to a broad conversion package, while copying MarkItDown would turn the SDK into a document-conversion project. The SDK should own a deterministic ingest contract and use focused parser libraries behind adapters.

## Goals

- **G1:** Support V1 ingestion of markdown, plain text, JSON, HTML, static URLs, PDF text-layer documents, DOCX, and PPTX.
- **G2:** Keep parser implementation behind a stable `SourceParser` adapter boundary.
- **G3:** Normalize all supported inputs into `ParsedSource` markdown with title, description, source metadata, and parser metadata.
- **G4:** Return structured parser errors for unsupported or unextractable sources.
- **G5:** Preserve SDK positioning as a knowledge-base builder, not a universal document converter.

## Non-goals

- **NG1:** No OCR for images or scanned PDFs in V1.
- **NG2:** No audio or video transcription in V1.
- **NG3:** No browser rendering, login-state crawling, anti-bot handling, or platform scraping for Xiaohongshu/Douyin in V1.
- **NG4:** No layout-perfect PDF/DOCX/PPTX conversion.
- **NG5:** No dependency on Python, current CLI, or MarkItDown ports.
- **NG6:** No vector search requirement as part of parser work.

## Users / Actors

| Actor | Need | Success outcome |
|---|---|---|
| Application developer | Ingest common document formats from TypeScript | Calls `kb.ingest()` with common files/URLs and gets searchable knowledge |
| Agent developer | Build repeatable knowledge-maintenance flows | Parser outcomes are deterministic and inspectable |
| Knowledge maintainer | Review generated source markdown | Generated files contain readable markdown and source metadata |

## User Stories

1. As an application developer, I want to ingest Markdown/text files, so that simple knowledge sources require no extra tooling.
2. As an application developer, I want to ingest static HTML and URLs, so that public web pages can become knowledge sources.
3. As an application developer, I want to ingest PDF/DOCX/PPTX files, so that common business documents can seed the knowledge base.
4. As a maintainer, I want parser failures to be explicit, so that missing OCR/transcription support is not mistaken for empty content.
5. As an agent developer, I want all parsers to return the same `ParsedSource` shape, so that downstream chunking/search/query code is format-agnostic.

## Functional Requirements

- **FR-001: Source input model**
  - The SDK MUST support file-path input.
  - The SDK SHOULD support URL, raw text, and buffer input through the parser interface.
  - Source input MUST preserve caller-provided metadata.

- **FR-002: Parser adapter boundary**
  - The SDK MUST expose or maintain a `SourceParser` interface.
  - Concrete parsers MUST live in infrastructure parser modules.
  - `KnowledgeBase` application code MUST not import `pdf-parse`, `mammoth`, `node-pptx-parser`, `jsdom`, `@mozilla/readability`, or `turndown` directly.

- **FR-003: Composite parser dispatch**
  - The SDK MUST provide a deterministic parser dispatcher that selects exactly one parser by source kind, content type, or extension.
  - Unsupported inputs MUST fail with `UNSUPPORTED_SOURCE`.
  - Parser selection MUST be testable without filesystem-global state.

- **FR-004: Markdown and text parsing**
  - Markdown files MUST preserve body content.
  - Markdown title SHOULD use first H1 when present; otherwise filename or caller title.
  - Plain text files MUST be wrapped as markdown-safe text.
  - Description SHOULD use the first meaningful plain-text line or paragraph.

- **FR-005: JSON parsing**
  - JSON input MUST be accepted as a deterministic source format.
  - V1 MAY render JSON as fenced `json` markdown or normalized key/value markdown.
  - Invalid JSON MUST fail with `PARSE_FAILED`.

- **FR-006: HTML parsing**
  - HTML files MUST be parsed with `jsdom`.
  - Main article content SHOULD be extracted with `@mozilla/readability`.
  - Extracted HTML MUST be converted to markdown with `turndown`.
  - If Readability cannot extract content, parser MAY fall back to document body text/HTML conversion, but MUST fail with `EMPTY_SOURCE` if meaningful content remains empty.

- **FR-007: URL parsing**
  - URL parsing MUST use fetch and content-type dispatch.
  - `text/html` MUST route to HTML parser.
  - `text/plain` MUST route to text parser.
  - `application/json` MUST route to JSON parser.
  - `application/pdf` MUST route to PDF parser.
  - Fetch/network failure MUST return `FETCH_FAILED`.
  - JS-heavy pages requiring browser rendering are out of scope and SHOULD fail as empty/unsupported rather than using hidden browser automation.

- **FR-008: PDF parsing**
  - PDF parsing MUST use `pdf-parse`.
  - V1 MUST extract text-layer content only.
  - Empty text-layer extraction MUST fail with `PDF_TEXT_LAYER_MISSING`.
  - Parser metadata SHOULD include page count when available.

- **FR-009: DOCX parsing**
  - DOCX parsing MUST use `mammoth`.
  - DOCX output SHOULD convert to HTML first, then markdown.
  - Mammoth warnings SHOULD be surfaced as parser warnings where practical.

- **FR-010: PPTX parsing**
  - PPTX parsing MUST use `node-pptx-parser`.
  - Output MUST group text by slide using markdown section headings such as `## Slide 1`.
  - V1 MUST NOT claim image text, speaker-note, or layout fidelity unless explicitly supported and tested.

- **FR-011: Parser errors**
  - Parser failures MUST be structured with a stable code, message, and source context.
  - Expected unsupported formats MUST not throw untyped low-level dependency errors across the public boundary.
  - Ingest MUST record parser failures in `ChangeSet.failed` and avoid corrupting existing bundle files.

- **FR-012: Dependency selection**
  - V1 selected dependencies are:
    - `pdf-parse` for PDF text extraction.
    - `mammoth` for DOCX conversion.
    - `node-pptx-parser` for PPTX text extraction.
    - `jsdom`, `@mozilla/readability`, and `turndown` for HTML/static URL extraction.
  - `officeparser` and `markitdown-ts` MUST NOT be V1 default dependencies.

## Acceptance Criteria

| ID | Acceptance criterion | Priority | Verification |
|---|---|---:|---|
| AC-001 | Markdown file ingests into a searchable source document with title and body preserved | P0 | SDK integration test |
| AC-002 | Plain text file ingests into markdown-safe body with description | P0 | SDK integration test |
| AC-003 | HTML file extracts readable body and stores markdown output | P0 | Parser + ingest integration test |
| AC-004 | Static HTML URL fetches, parses, ingests, and becomes searchable | P0 | SDK integration test with local test server or mocked fetch boundary |
| AC-005 | PDF with text layer parses and ingests; search finds PDF text | P0 | SDK integration test fixture |
| AC-006 | Scanned/empty-text PDF fails with `PDF_TEXT_LAYER_MISSING` and no misleading source document is written | P0 | Negative integration test |
| AC-007 | DOCX fixture parses and ingests; heading/body text is searchable | P0 | SDK integration test fixture |
| AC-008 | PPTX fixture parses by slide sections; slide text is searchable | P0 | SDK integration test fixture |
| AC-009 | PNG/JPG input returns `UNSUPPORTED_SOURCE` in V1 | P0 | Negative test |
| AC-010 | MP3/MP4 input returns `UNSUPPORTED_SOURCE` in V1 | P0 | Negative test |
| AC-011 | Parser dependency imports stay in infrastructure parser modules | P0 | Architecture search or dependency-boundary test |
| AC-012 | `npm test` and `npm run typecheck` pass for SDK | P0 | Command output |

## Edge Cases / Failure Handling

| Case | Expected behavior |
|---|---|
| Unsupported extension/content type | `UNSUPPORTED_SOURCE`; no partial write |
| URL network failure | `FETCH_FAILED`; source recorded in `ChangeSet.failed` |
| URL content type mismatches extension | Content type wins when present; fallback to extension only when content type is missing/unknown |
| HTML has no readable body | `EMPTY_SOURCE` unless fallback body extraction finds meaningful text |
| PDF has no text layer | `PDF_TEXT_LAYER_MISSING`; do not invoke OCR |
| DOCX parser emits warnings | Preserve successful markdown and surface warnings |
| PPTX has empty slides | Skip empty slide sections; fail `EMPTY_SOURCE` if all slides are empty |
| Parser library throws raw error | Wrap as `PARSE_FAILED` with source context |
| Ingest batch has mixed successes/failures | Successful sources commit; failed sources appear in `ChangeSet.failed` |

## Constraints

- Keep deterministic parser behavior independent of LLM providers.
- Do not store provider secrets or fetch credentials in source metadata.
- Do not silently fall back to OCR, browser automation, or transcription.
- Keep generated markdown human-readable and suitable for citations.

## Out of Scope

- Image OCR.
- Scanned PDF OCR.
- Audio/video transcription.
- Browser rendering and authenticated crawling.
- Social-platform ingestion.
- Layout-fidelity conversion.
- Parser plugin packaging split, unless package size becomes a release blocker.

---

# Execution Spec

## Goal

Implement deterministic V1 source parsing in the TypeScript SDK for markdown, text, JSON, HTML/static URL, PDF, DOCX, and PPTX while keeping knowledge-base ingestion format-agnostic.

## Scope

### In scope
- Source input shape capable of file/text/url/buffer parsing.
- Parser error codes and typed parser failure wrapping.
- Composite parser dispatch.
- Markdown, text, JSON, HTML, URL, PDF, DOCX, and PPTX parser adapters.
- Integration tests proving parser output reaches `ingest -> search`.
- Negative tests for OCR/transcription/out-of-scope formats.

### Out of scope
- OCR.
- Audio/video transcription.
- Browser crawler.
- `markitdown-ts` integration.
- Parser package splitting.

## Relevant Context

- Existing SDK architecture uses `domain`, `application`, and `infrastructure` layers.
- Existing SDK tests run from built `dist` with Node built-in test runner.
- Current `SourceParser` accepts only `parse(path: string)`, so implementation may need a narrow interface expansion or compatibility wrapper.
- Current ingest API accepts `{ path }`; V1 can preserve that public path while adding richer parser internals.

## Terms / Assumptions

- **ParsedSource:** Normalized markdown body plus title/description/metadata consumed by ingest.
- **Text-layer PDF:** PDF containing extractable text without OCR.
- **Static URL:** URL fetchable with normal HTTP and parseable without browser rendering or login state.
- **Parser adapter:** Infrastructure class implementing source parsing behind the `SourceParser` contract.

## Affected Surfaces

- **Code:**
  - `sdk/src/domain/types.ts`
  - `sdk/src/domain/errors.ts` or new parser error module
  - `sdk/src/infrastructure/source-parser.ts`
  - `sdk/src/infrastructure/parsers/*`
  - `sdk/src/application/knowledge-base.ts` if ingest input expands
  - `sdk/src/index.ts` if new public parser types/errors are exported
- **Data / schema:**
  - Existing OKF source markdown output.
  - `.llm-wiki/search-index.json` remains disposable cache.
- **API / CLI / UI:**
  - SDK API only.
  - Existing `ingest({ path })` must keep working.
- **Tests:**
  - `sdk/test/knowledge-base.test.js` or additional Node test files.
  - Real fixture files for parser integration.
- **Docs / ops:**
  - `docs/typescript-sdk-prd.md` should be updated or cross-linked after implementation if parser V1 becomes committed product scope.

## Technical Direction

### Pattern decision

- **Problem force:** Multiple source formats will grow over time; core knowledge-base logic must remain stable and testable.
- **Chosen pattern:** Adapter + Registry/Composite Parser.
- **Evidence from bundled docs:** Registry fits pluggable components by name/type; adapters keep infrastructure dependencies behind stable ports.
- **Rejected alternatives:** Copy MarkItDown; install `markitdown-ts` as the core parser; put format-specific parsing in `KnowledgeBase.ingest()`.
- **Implementation invariant:** Application layer consumes `ParsedSource`; parser libraries are infrastructure-only.
- **Verification seam:** Public SDK flow `create/open -> ingest -> search`, plus parser-specific negative tests.

### Parser modules

Target module layout:

```text
sdk/src/infrastructure/parsers/composite.ts
sdk/src/infrastructure/parsers/markdown.ts
sdk/src/infrastructure/parsers/text.ts
sdk/src/infrastructure/parsers/json.ts
sdk/src/infrastructure/parsers/html.ts
sdk/src/infrastructure/parsers/url.ts
sdk/src/infrastructure/parsers/pdf.ts
sdk/src/infrastructure/parsers/docx.ts
sdk/src/infrastructure/parsers/pptx.ts
```

### Dependency direction

Add only focused parser dependencies:

```json
{
  "dependencies": {
    "@mozilla/readability": "^0.6.0",
    "jsdom": "^29.1.1",
    "mammoth": "^1.12.0",
    "node-pptx-parser": "^1.0.1",
    "pdf-parse": "^2.4.5",
    "turndown": "^7.2.4"
  }
}
```

### Error model

Stable codes:

```ts
type ParserErrorCode =
  | "UNSUPPORTED_SOURCE"
  | "EMPTY_SOURCE"
  | "FETCH_FAILED"
  | "CONTENT_TYPE_MISMATCH"
  | "PDF_TEXT_LAYER_MISSING"
  | "PARSE_FAILED";
```

## Validation Plan

- **VAL-001:** Markdown ingest works. Surface: SDK integration. Evidence: `npm test` assertion that markdown fixture is searchable.
- **VAL-002:** Text ingest works. Surface: SDK integration. Evidence: text fixture search hit.
- **VAL-003:** HTML ingest works. Surface: parser + SDK integration. Evidence: HTML fixture extracts main content and search finds it.
- **VAL-004:** Static URL ingest works. Surface: SDK integration. Evidence: local static HTTP response parsed and searched.
- **VAL-005:** PDF text-layer ingest works. Surface: parser + SDK integration. Evidence: PDF fixture content searchable.
- **VAL-006:** Scanned/empty PDF fails safely. Surface: parser negative test. Evidence: `PDF_TEXT_LAYER_MISSING`, no source doc write.
- **VAL-007:** DOCX ingest works. Surface: parser + SDK integration. Evidence: DOCX fixture content searchable.
- **VAL-008:** PPTX ingest works. Surface: parser + SDK integration. Evidence: slide text searchable and markdown has slide sections.
- **VAL-009:** Unsupported media stays unsupported. Surface: parser negative test. Evidence: PNG/JPG/MP3/MP4 produce `UNSUPPORTED_SOURCE`.
- **VAL-010:** Architecture boundary holds. Surface: static inspection/test. Evidence: parser dependencies imported only from `sdk/src/infrastructure/parsers/`.
- **VAL-011:** SDK gate passes. Surface: package commands. Evidence: `cd sdk && npm test && npm run typecheck` pass.

## Risks / Open Questions

| Risk / question | Impact | Direction |
|---|---|---|
| Parser dependencies increase package size | Medium | Accept for V1 if tests prove value; split parser package later only if package size blocks release |
| `node-pptx-parser` is less mature than PDF/DOCX libraries | Medium | Keep PPTX behavior narrow: text by slide only; wrap errors; fixtures prove minimal contract |
| PDF table/layout extraction is imperfect | Medium | V1 contract is text-layer extraction, not layout fidelity |
| Static URL parsing may miss JS-rendered pages | Low for V1 | Return empty/unsupported; browser crawler is later adapter |
| Existing `SourceParser` accepts only path string | Medium | Expand carefully or add compatibility wrapper while preserving `ingest({ path })` |

## Mission Handoff

### Suggested milestones

1. **Parser contract and errors:** Add/adjust source input, parser error codes, composite parser.
2. **Text family parsers:** Markdown, text, JSON, HTML, URL.
3. **Document parsers:** PDF, DOCX, PPTX adapters and fixtures.
4. **Ingest integration:** Wire composite parser into `KnowledgeBase` while preserving existing path ingest.
5. **Verification and docs:** Parser integration tests, negative tests, typecheck, PRD cross-link/update.

### Required evidence

- SDK test output for parser fixtures and negative cases.
- SDK typecheck pass.
- Search results proving parsed content enters the knowledge index.
- Static boundary proof that parser dependencies stay in infrastructure parser modules.

### Human gates

- None for V1 parser scope.
- Future HITL decision: whether to split heavy parser dependencies into optional packages before npm publishing.

## Readiness

Readiness: Ready

Reason: The V1 parser scope, explicit non-goals, dependency choices, architecture boundary, error model, and validation seams are fixed without build-blocking ambiguity.

Next: Implement parser contract/errors first, then wire parsers through `ingest -> search` tests.
