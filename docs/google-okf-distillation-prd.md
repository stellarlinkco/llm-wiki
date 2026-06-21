# PRD: Google Knowledge Catalog / OKF 经验蒸馏与 LLM Wiki SDK 对齐

## Problem Statement

`llm-wiki` 是 OKF-native TypeScript SDK，面向知识库 Agent 问答、GEO 内容生成、评论回复、知识沉淀与检索。Google `knowledge-catalog` 是 Knowledge Catalog tools / agents / samples 集合：根仓库提供产品语义和样例，`toolbox/` 提供 metadata-as-code 与 enrichment harness，`samples/` 展示 discovery / enrichment agent 流程，`okf/` 提供可移植 Markdown + YAML frontmatter 格式、reference agent、prompt 约束、bundle 工具、web ingestion 工作流和可视化消费样例。

当前目标不是照搬 Google 的 Python/ADK/GCP 服务实现，而是把整个仓库中对 `llm-wiki` 有价值的设计蒸馏成 SDK 可执行的产品要求、实现边界和验证标准。

需要吸收的核心经验：

- OKF 保持极简：目录树 + Markdown + YAML frontmatter。
- OKF `type` 必须开放，不能成为 closed enum。
- unknown frontmatter 必须保留，不能在 parse/update/export 中丢失。
- LLM 生成或增强文档时必须通过受控工具写入，不能直接覆盖文件。
- Existing docs 是 source of truth；web/LLM enrichment 默认是 augmentation，不是 rewrite。
- Citation 必须来自真实 source、retrieved document 或实际 fetched URL，不能编造。
- Index files 支持 progressive disclosure，让人和 agent 分层浏览知识库。
- 搜索后端应保持可插拔：MiniSearch 作为默认本地搜索，BigQuery 可作为可选远程搜索/分析后端。
- `samples/discovery` 的 query decomposition、multi-query retrieval、rerank 思路适合未来增强 `KnowledgeBase.query()`，但不能绑定 Google ADK 或 Dataplex predicate。
- `samples/enrichment` 与 `toolbox/enrichment` 的 source/tool/prompt 可配置工作流适合 `llm-wiki` enrichment 方向，但发布目标应是本地 OKF bundle / store，不是默认推送云服务。
- `toolbox/mdcode` 的 metadata-as-code 经验适合强化 `llm-wiki` 的 artifact UX、CLI/MCP 方向和 git diff 审阅流。
- `src/reference_agent/prompts` 下的 `reference_instruction.md` 与 `web_ingestion_instruction.md` 是必须提取的核心资产；需要改写成本项目可维护的 prompt templates，而不是只在 PRD 中提一句。

## Goals

1. 蒸馏 Google `knowledge-catalog` 整个 repo 中对当前 `llm-wiki` 有价值的产品和工程规则。
2. 区分可移植 OKF 格式、metadata-as-code 工作流、discovery/enrichment 样例和 Google Cloud 服务集成，避免把服务实现误当 SDK 核心。
3. 保持 `llm-wiki` 的 TypeScript SDK 架构，不引入 Google ADK/Python/GCP 架构依赖。
4. 强化 OKF 兼容性：开放类型、frontmatter preservation、Markdown 可读可 diff。
5. 为未来 LLM-assisted ingest / enrichment 定义安全写入边界。
6. 保证 query citation integrity 不因 provider 或搜索后端变化而破坏。
7. 支持搜索后端可插拔：默认 MiniSearch，可选 BigQuery 或其他 `SearchAdapter`。
8. 把 Google reference agent 的 prompt 约束转化为可测试的 SDK 不变量。
9. 明确提取并改写 Google OKF prompts：metadata enrichment prompt 与 web ingestion / augmentation prompt。
10. 为知识库 Agent 问答、GEO 内容生成、评论回复提供稳定检索和知识来源机制。

## Non-goals

- 不复制 Google `knowledge-catalog` 的 Python ADK reference agents、gcloud-auth service lifecycle、Dataplex publish workflow 或 BigQuery-first 架构。
- 不把 BigQuery 设为默认后端。
- 不把 BigQuery 当作 OKF bundle 文件存储。
- 不要求所有用户配置 GCP credentials。
- 不把 OKF `type` 写成 enum。
- 不新增 speculative crawler、visualizer、BigQuery ingestion，除非后续单独立项。
- 不让 prompt 约束替代工具层 guardrail。
- 不无脑逐字复制 Google prompts；必须保留其约束精华，并改写成 `llm-wiki` 的术语、API、路径和安全边界。
- 不在远程搜索失败时默认静默 fallback 到本地搜索。
- 不改变现有 Domain/Application/Infrastructure 边界。

## Users / Actors

- SDK consumer：在 Node/TypeScript 应用中创建、读取、检索、查询 OKF bundle。
- Knowledge maintainer：维护 Markdown/frontmatter 知识库，通过 git diff 审阅知识变更。
- Agent operator：用知识库支撑 Agent 问答、GEO 内容生成、评论回复。
- Enrichment agent：未来通过 LLM 生成或增强 concept/source/reference 文档。
- Local-first user：希望零外部服务使用 MiniSearch。
- Data-heavy team：希望复用 BigQuery 做大规模索引、远程搜索或上游数据分析。
- Implementing agent：基于本 PRD 改 SDK、测试和文档。

## User Stories

1. As an SDK consumer, I want unknown OKF `type` values to work, so that my domain-specific concept types are not rejected.
2. As a knowledge maintainer, I want custom frontmatter to round-trip safely, so that company-specific metadata is not destroyed.
3. As an Agent operator, I want MiniSearch by default, so that Agent Q&A, GEO generation, and comment reply can run locally with low latency.
4. As a data-heavy team, I want to plug in BigQuery search, so that large-scale or centrally managed indexes can reuse existing GCP infrastructure.
5. As a query user, I want citations to point only to retrieved bundle-local documents, so that answers are auditable.
6. As an enrichment agent operator, I want existing docs to be augmented rather than rewritten, so that LLM updates are reviewable and non-destructive.
7. As a maintainer, I want tool-level write guards, so that prompt mistakes cannot silently corrupt source-of-truth documents.
8. As an SDK consumer, I want deterministic methods to work without an LLM provider, so that basic knowledge management does not depend on model credentials.

## Functional Requirements

### OKF format compatibility

- FR-001: SDK must model OKF `type` as an open string and tolerate unknown values.
- FR-002: SDK must preserve unknown frontmatter fields through parse, ingest, update, validate, export, and round-trip operations.
- FR-003: SDK must keep Markdown files human-readable, git-diffable, and portable.
- FR-004: Reserved files such as `index.md` and project metadata files must not be treated as ordinary concept documents unless the local SDK contract explicitly says so.
- FR-005: OKF documents may contain arbitrary markdown body sections; validation must not reject unknown headings.

### Bundle and index behavior

- FR-006: `index.md` generation, when exposed or modified, must be deterministic and derived from existing document metadata.
- FR-007: Index files should support progressive disclosure: list nearby documents/subdirectories without requiring the whole bundle to be loaded into context.
- FR-008: Repeated index generation over the same bundle state should produce stable output.

### LLM enrichment safety

- FR-009: Future LLM-assisted document generation must write through SDK-controlled operations, not direct file overwrite.
- FR-010: Enrichment of an existing document must read existing content before writing.
- FR-011: Existing frontmatter keys must be preserved unless the caller explicitly changes them.
- FR-012: Existing top-level headings should be preserved during augmentation unless the operation is explicitly a full replacement.
- FR-013: Existing citations must be preserved or extended, not silently shrunk.
- FR-014: Schema-like sections populated from deterministic metadata must not be shrunk by web/LLM enrichment without explicit user intent.
- FR-015: Structured high-value knowledge discovered during enrichment should get stable destinations instead of being buried in prose:
  - metrics under reference/metric-style docs or equivalent local convention,
  - dimensions near the owning concept/source,
  - joins/relationships as explicit cross-links or reference docs.

### Prompt assets extraction

- FR-016: Google OKF `src/reference_agent/prompts/reference_instruction.md` must be extracted into a local `llm-wiki` prompt asset for one-concept metadata enrichment.
- FR-017: Google OKF `src/reference_agent/prompts/web_ingestion_instruction.md` must be extracted into a local `llm-wiki` prompt asset for web/source augmentation.
- FR-018: Extracted prompts must preserve the load-bearing constraints:
  - one concept per write for metadata enrichment,
  - read existing doc before write,
  - preserve existing frontmatter keys,
  - preserve existing top-level headings during augmentation,
  - preserve/append citations instead of shrinking them,
  - cite only fetched/ingested/retrieved sources,
  - prefer skip over low-signal enrichment,
  - keep metrics/dimensions/joins/relationships as structured knowledge instead of vague prose.
- FR-019: Extracted prompts must be adapted to local concepts and APIs:
  - `KnowledgeBase`,
  - `SourceParser`,
  - `SearchAdapter`,
  - `LLMProvider`,
  - `ChangeSet`,
  - `sources/`, `concepts/`, `references/`, `.llm-wiki/`,
  - local citation integrity rules.
- FR-020: Prompt assets must live in a durable project location, not only in conversation history. The exact location is implementation-owned, but must be importable/testable if used by SDK code.
- FR-021: Prompt extraction must include source attribution/reference to Google `knowledge-catalog/okf` and must respect the Apache-2.0 source license if substantial text is reused.

### Citation integrity

- FR-022: `KnowledgeBase.query()` must not fabricate citations.
- FR-023: Query citations must be restricted to bundle-local paths actually returned by retrieval.
- FR-024: External citations in generated/enriched documents must come from actual ingested/fetched/known sources, not model invention.
- FR-025: Provider-proposed citations must be filtered by SDK logic before being returned to users.

### Search backend selection

- FR-026: MiniSearch must remain the default local search backend.
- FR-027: Search must remain behind the `SearchAdapter` contract.
- FR-028: BigQuery must be an explicit opt-in search backend, not a default.
- FR-029: BigQuery search results must map to the same `SearchResult` shape as MiniSearch:
  - `path`,
  - `title`,
  - `type`,
  - `score`,
  - `snippet`,
  - `tags`.
- FR-030: `KnowledgeBase.search()` and `KnowledgeBase.query()` must remain backend-agnostic.
- FR-031: BigQuery backend must namespace bundles to avoid cross-bundle result leakage.
- FR-032: BigQuery failure must be explicit; no silent fallback unless the user configures a fallback policy.
- FR-033: Adding BigQuery support must not force local-only users to configure GCP.

### Deterministic / LLM boundary

- FR-034: Deterministic methods must work without an LLM provider:
  - `search`,
  - `validate`,
  - `status`,
  - `listConcepts`,
  - `export`.
- FR-035: LLM-dependent methods must throw `ConfigurationError` when no provider is configured.
- FR-036: Mutating operations must return `ChangeSet` with per-file success/failure collections for expected per-document failures.

### Repository workflow patterns

- FR-037: Discovery improvements inspired by Google `samples/discovery` must remain backend-agnostic and optional; `KnowledgeBase.query()` must not require Dataplex predicates, Vertex AI, or ADK.
- FR-038: Future query decomposition / reranking must preserve citation filtering: final citations still come only from retrieved bundle-local documents.
- FR-039: Enrichment workflows inspired by Google `samples/enrichment` and `toolbox/enrichment` must expose source/tool/prompt inputs explicitly and keep reviewable diffs before commit/publish.
- FR-040: Metadata-as-code ideas from `toolbox/mdcode` may inform CLI/MCP ergonomics, but local OKF bundle/store remains the source of truth unless a user explicitly configures external sync.
- FR-041: Sample-driven development should pair runnable inputs/commands with expected OKF bundle outputs when new producer/enrichment flows are added.
- FR-042: Any future cloud catalog sync must be adapter-owned, opt-in, and unable to bypass local parser, validation, citation, and write guardrails.

## Acceptance Criteria

- AC-001: A document with `type: VendorSpecificThing` validates as a generic OKF document instead of failing enum validation.
- AC-002: A document with custom frontmatter keys survives parse → update/export → parse with those keys unchanged.
- AC-003: Updating a document description does not drop unrelated frontmatter keys.
- AC-004: Malformed YAML or missing required local fields is reported as a validation/parser failure without partial writes.
- AC-005: `KnowledgeBase.ingestMany({ paths })` reports one malformed document in `ChangeSet.failed` while still processing valid documents.
- AC-006: Local prompt assets exist for Google OKF metadata enrichment and web/source augmentation, adapted to `llm-wiki` terminology.
- AC-007: Prompt assets explicitly encode read-before-write, one-concept-per-write, preserve-frontmatter, preserve-headings, preserve-citations, and no-invented-citations rules.
- AC-008: Prompt assets include source attribution/reference to Google `knowledge-catalog/okf` when substantial prompt text is reused.
- AC-009: `KnowledgeBase.create({ root })` uses MiniSearch by default and existing search tests pass.
- AC-010: `KnowledgeBase.create({ root, search })` accepts a custom search adapter and routes indexing/search through it.
- AC-011: A BigQuery-style search adapter can return contract-compatible `SearchResult[]` without changing `KnowledgeBase` application logic; when implemented, it must also namespace results per bundle and return only bundle-readable paths for the active bundle.
- AC-012: `query()` returns citations only from the retrieved result paths for both MiniSearch and BigQuery-backed retrieval, and `QueryAnswer.text` must not retain markdown links or bare bundle-path mentions to non-retrieved bundle documents or unverified external URLs.
- AC-013: `query()` without configured LLM provider throws `ConfigurationError`.
- AC-014: `search`, `validate`, `status`, `listConcepts`, and `export` run without configured LLM provider.
- AC-015: Guarded enrichment/update attempts (`guardedUpdate: true`, including automatic guarded updates from `synthesize()` on existing concept paths) that drop existing top-level H1/H2 headings or bundle citations are rejected or reported as failed.
- AC-016: Guarded enrichment/update attempts that shrink deterministic schema-like fenced body sections (under H1/H2 headings whose text contains `schema`) or protected frontmatter are rejected or reported as failed.
- AC-017: Repeated `index.md` generation over unchanged input is deterministic.
- AC-018: SDK smoke workflow create → ingest → search → validate proves the behavior through the public SDK API.
- AC-019: Packaged SDK E2E proves `npm run build` → `npm pack` → isolated consumer install/import from `@llm-wiki/sdk` → `KnowledgeBase.create/open` → ingest → `writeConcept` → search → validate → status/list/export → `query()` without provider throws `ConfigurationError`.

- AC-020: The spec distinguishes repo-level patterns from OKF-specific implementation details, so implementing agents do not treat Google Cloud service workflows as default SDK behavior.
- AC-021: Any future discovery decomposition/rerank feature is tested without Dataplex/ADK dependencies and preserves retrieval-bound citation filtering.
- AC-022: Any future enrichment CLI/MCP workflow produces reviewable local OKF diffs before external publish or sync.
- AC-023: Example producer/enrichment flows include reproducible input recipe plus expected bundle fixture when the feature ships.

## Edge Cases / Failure Handling

- Unknown `type`: accept and preserve.
- Unknown frontmatter: accept and preserve.
- Missing required local frontmatter: validation failure.
- Malformed YAML frontmatter: parser/validation failure; no partial write.
- Broken internal markdown link: tolerate during parse; validation may warn or fail according to local policy.
- LLM provider missing: deterministic methods work; LLM methods throw `ConfigurationError`.
- Provider returns non-retrieved citation: SDK filters it out.
- Existing enrichment drops citation/schema/frontmatter/headings: reject or report failed when guarded update applies (`guardedUpdate: true` or `synthesize()` updating an existing concept path).
- BigQuery credentials missing: fail clearly; no silent fallback.
- BigQuery index missing: `exists()` returns false or raises clear setup error according to adapter contract.
- BigQuery returns path missing from local bundle: `query()` must not cite it unless the active bundle can read it.
- Empty query: search returns `[]` without unsafe broad scan.

## Constraints

- `sdk/src/domain/` owns public types and ports.
- `sdk/src/application/` owns `KnowledgeBase` orchestration and must not import infrastructure or vendor SDKs.
- `sdk/src/infrastructure/` owns filesystem, markdown/frontmatter parsing, search adapters, source parsers, and provider adapters.
- Existing `SearchAdapter` is the primary search seam.
- Existing `ChangeSet` semantics remain the mutation error-reporting model.
- SDK-managed bundle file writes must use `atomicWrite()` where applicable.
- Provider SDKs must not leak into domain/application.
- New dependencies require justification.
- Critical path changes listed in `AGENTS.md` require human review.
- No `.env` or credentials are read from source files.
- Local reference checkout exists at `../knowledge-catalog` for implementation research only; do not import it as a runtime dependency or copy code without adaptation, attribution, and license review. Current checked commit: `d44368c`.

## Out of Scope

- Copying Google ADK/Python implementation.
- BigQuery as default backend.
- BigQuery as OKF Markdown storage.
- BigQuery source ingestion from datasets.
- Full web crawler implementation.
- Graph visualizer parity with Google `viz.html`.
- Semantic/vector search.
- Ranking parity between MiniSearch and BigQuery.
- Live GCP tests as mandatory CI.
- GitHub issue publishing.

## Backend Selection Guidance

### Default: MiniSearch

Use MiniSearch for:

- 知识库 Agent 问答实时检索。
- GEO 内容生成时提取品牌、产品、FAQ、案例、行业资料。
- 评论回复时查找话术、异议处理、竞品对比、产品事实。
- 本地优先、低延迟、零外部服务的知识库。

### Optional: BigQuery

Use BigQuery for:

- 海量内容或多租户集中索引。
- 团队已有 BigQuery 权限、成本治理、数据资产。
- 评论、搜索词、行为数据的分析型查询。
- 批处理分析后生成 OKF 知识，再交给 MiniSearch 或 BigQuery adapter 检索。

### Future optional: discovery decomposition / rerank

Borrow from Google `samples/discovery` only at the algorithmic seam:

- decompose complex user questions into focused search intents,
- issue multiple backend-agnostic searches,
- deduplicate and rerank retrieved OKF documents,
- answer only from retained retrieved documents,
- filter citations through the same `query()` citation integrity guard.

Do not import Dataplex predicate syntax, ADK agent hierarchy, Vertex-only calls, or service-specific IAM assumptions into core SDK behavior.

### Future optional: metadata-as-code CLI / MCP

Borrow from Google `toolbox/mdcode` as product ergonomics:

- source-controlled YAML/Markdown artifacts,
- hierarchical resource-shaped snapshots,
- CLI/MCP tools for list/read/modify operations,
- explicit pull/status/push style review flow if external sync is introduced.

For `llm-wiki`, local OKF files and configured `BundleStore` remain canonical. External catalog sync is adapter-owned and opt-in.

### Recommended Architecture

```text
BigQuery 评论/搜索/行为数据
→ 批处理分析
→ OKF Markdown 知识库
→ MiniSearch 或 BigQuery SearchAdapter
→ LLM Agent 问答/GEO/评论回复
```

MiniSearch 是默认实时检索大脑。BigQuery 是可选远程索引和上游分析基础设施。

## Execution Spec

### Goal

把 Google `knowledge-catalog` 中有价值的设计蒸馏到 `llm-wiki`：保持 OKF 简单开放、保护已有知识不被 LLM 破坏、保持 citation 可审计、让搜索后端可插拔，吸收 discovery / enrichment / metadata-as-code 的工作流经验，并把 Google OKF prompts 提取/改写为本项目可维护的 prompt assets。

### Scope

#### In scope

- OKF type openness。
- Unknown frontmatter preservation。
- Markdown/frontmatter round-trip safety。
- Google `src/reference_agent/prompts/reference_instruction.md` 提取/改写。
- Google `src/reference_agent/prompts/web_ingestion_instruction.md` 提取/改写。
- Citation filtering。
- Deterministic vs LLM-dependent method boundary。
- ChangeSet partial failure semantics。
- MiniSearch default backend。
- BigQuery optional backend via `SearchAdapter`。
- Future enrichment write-guard design。

#### Out of scope

- Copying Google reference agent implementation。
- BigQuery ingestion connector。
- Web crawler。
- Visualizer。
- Live provider/GCP integration tests。
- 无脑逐字复制 prompts 而不适配本项目术语和工具边界。

### Relevant Context

Reference checkout:

- Local path: `../knowledge-catalog`
- Remote: `https://github.com/GoogleCloudPlatform/knowledge-catalog.git`
- Checked commit: `d44368c`
- Use as read-only implementation reference for `okf/`, `samples/`, and `toolbox/`; this PRD remains the source of truth for what `llm-wiki` should adopt.

Google OKF reference provides these useful patterns:

- Minimal OKF format.
- One concept per enrichment invocation.
- Read existing doc before write.
- Web pass augments existing docs rather than rewriting.
- Write tool validates required frontmatter.
- Web pass guard rejects schema/citation shrinkage for deterministic metadata docs.
- Index files provide progressive disclosure.
- Metrics/dimensions/joins get explicit structured destinations.
- `reference_instruction.md` encodes one-concept metadata enrichment workflow.
- `web_ingestion_instruction.md` encodes crawl judgment, augmentation rules, citation integrity, and structured extraction rules.
- `samples/discovery` shows semantic decomposition, multiple searches, deduplication, and reranking as a discovery-agent pattern.
- `samples/enrichment` shows download → enrich → review diff → publish as an enrichment lifecycle.
- `toolbox/mdcode` shows metadata-as-code artifacts, hierarchical snapshots, CLI, library, and MCP server ergonomics.
- `toolbox/enrichment` shows prompt-path + tools-path configurable enrichment harness.

Local `llm-wiki` context already requires:

- OKF-native TypeScript SDK.
- Public `KnowledgeBase` facade.
- `SearchAdapter`, `SourceParser`, `LLMProvider` ports.
- `ChangeSet` over exceptions for expected per-file failures.
- Citation integrity.
- OKF type openness.
- Deterministic methods independent from LLM provider.
- `ConfigurationError` for LLM methods without provider.
- Atomic writes and export safety.

### Affected Surfaces

- Code:
  - `sdk/src/domain/types.ts`
  - `sdk/src/domain/errors.ts`
  - `sdk/src/application/knowledge-base.ts`
  - `sdk/src/application/okf-write-guards.ts`
  - `sdk/src/application/okf-prompts.ts`
  - `sdk/src/infrastructure/local-search.ts`
  - `sdk/src/infrastructure/filesystem.ts`
  - Markdown/frontmatter parser modules under `sdk/src/infrastructure/`
  - possible future `sdk/src/infrastructure/bigquery-search.ts`
  - local prompt asset files for metadata enrichment and web/source augmentation
- Data / schema:
  - OKF Markdown files
  - YAML frontmatter
  - `.llm-wiki/` metadata
  - `.llm-wiki/search-index.json`
  - optional BigQuery remote index table
- API / CLI / UI:
  - `KnowledgeBase.create/open`
  - `KnowledgeBase.search`
  - `KnowledgeBase.query`
  - injected `SearchAdapter`
  - future prompt-loading or enrichment APIs if implemented
- Tests:
  - `sdk/test/knowledge-base.test.js`
  - parser/frontmatter tests
  - validation tests
  - provider/citation tests
  - prompt asset review/snapshot tests if prompts become imported SDK artifacts
  - optional fake-client BigQuery adapter tests
- Docs / ops:
  - local reference checkout `../knowledge-catalog` for research-only comparison
  - source attribution/reference for Google OKF prompts if substantial text is reused
  - README/API docs if public backend selection changes
  - dependency justification if BigQuery client is added

### Technical Direction

1. Keep Google `knowledge-catalog` as reference material, not a runtime dependency.
2. Extract/adapt the two Google OKF prompt assets into durable local files before treating enrichment work as implementation-ready.
3. Do not leave prompt learnings only in PRD prose; prompts must become reviewable project artifacts with attribution when reused.
4. Keep `KnowledgeBase` backend-agnostic; all search backends implement `SearchAdapter`.
5. Keep MiniSearch default for local Agent/GEO/comment workflows.
6. Treat BigQuery as explicit optional backend for remote index or upstream analytics.
7. Make OKF parser/writer permissive where OKF is open, strict where local invariants matter.
8. Put destructive-update protection in deterministic code, not only in prompts.
9. Keep provider-generated citations behind SDK filtering.
10. Use public SDK APIs for tests; avoid private implementation tests except adapter-specific contract tests.
11. Treat repository-level samples/toolbox as workflow inspiration, not as required runtime dependencies.
12. If query decomposition/reranking is added, keep it behind existing search/query seams and preserve citation filtering.
13. If CLI/MCP metadata-as-code flows are added, keep local OKF diff review before external sync.

### Validation Plan

- VAL-001: Unknown OKF type is accepted and preserved. Evidence: focused validation/frontmatter test.
- VAL-002: Unknown frontmatter keys round-trip unchanged. Evidence: parse → write/export → parse test.
- VAL-003: Multi-file ingest reports malformed file through `ChangeSet.failed` while valid files succeed. Evidence: public SDK `ingestMany()` test.
- VAL-004: Required prompt assets exist and are reviewable. Evidence: local files for metadata enrichment and web/source augmentation are present and include the required constraints.
- VAL-005: Prompt assets are adapted to local terminology and cite the Google OKF source when substantial text is reused. Evidence: focused review or snapshot test of prompt files.
- VAL-006: Default MiniSearch remains unchanged. Evidence: existing search tests pass.
- VAL-007: Custom `SearchAdapter` injection remains supported. Evidence: existing adapter injection test passes.
- VAL-008: BigQuery-style adapter can satisfy `SearchAdapter` and enforce bundle namespace/readability when implemented. Evidence: fake client test covering cross-bundle path rejection and bundle-readable paths.
- VAL-009: `query()` citation filtering works with any backend. Evidence: fake provider returns extra citation metadata and fabricated markdown/external links in answer text; SDK filters `QueryAnswer.citations` and `QueryAnswer.text` to retrieved bundle-local paths.
- VAL-010: Deterministic methods work without LLM provider. Evidence: create → ingest → search → validate/status/list/export test.
- VAL-011: LLM-dependent methods without provider throw `ConfigurationError`. Evidence: focused `query()` test.
- VAL-012: Guarded enrichment/update attempts that drop citations, top-level H1/H2 headings, or shrink protected schema-like fenced sections/frontmatter are rejected or reported failed. Evidence: write/update guard tests and `synthesize()` guarded-update tests.
- VAL-013: Full relevant gates pass after implementation. Evidence: `just typecheck`, `just test`, and scoped ESLint on changed SDK files (full-repo `just lint` remains a separate hygiene track).
- VAL-014: Repository-level distillation remains explicit in the PRD. Evidence: requirements mention `samples/discovery`, `samples/enrichment`, `toolbox/mdcode`, and `toolbox/enrichment`.
- VAL-015: Future discovery/rerank work preserves citation filtering. Evidence: fake multi-search/rerank test when implemented.
- VAL-016: Future metadata-as-code CLI/MCP work proves local diff review before sync. Evidence: CLI/MCP integration test when implemented.

## Risks / Open Questions

- Risk: Overfitting to Google BigQuery sample would make `llm-wiki` less general. Mitigation: BigQuery remains optional.
- Risk: Prompt-only enrichment safety is insufficient. Mitigation: require tool-level guards for destructive updates.
- Risk: Too-strict validation could reject valid OKF extensions. Mitigation: keep type/frontmatter open; hard-fail only local invariants.
- Risk: BigQuery dependency increases SDK weight. Mitigation: decide core optional adapter vs separate package before implementation.
- Risk: BigQuery latency/cost surprises in Agent replies. Mitigation: keep MiniSearch default and require explicit opt-in.
- Open question: Should BigQuery adapter live in core SDK or separate `@llm-wiki/bigquery-search` package?
- Open question: Should enrichment write guards remain opt-in via `guardedUpdate` for direct `writeConcept()` calls while `synthesize()` keeps automatic guarded updates on existing paths?

## Readiness

Readiness: PRD Ready / Implementation Partial

Reason: Core in-scope SDK behavior for OKF openness, prompt assets, guarded writes, batch ingest, citation filtering, deterministic/LLM boundaries, and packaged E2E is implemented and tested. Deferred items remain AC-011 (BigQuery adapter), AC-021–AC-023 (future discovery/CLI flows), and FR-007 progressive disclosure beyond deterministic `index.md`.

Next: Keep PRD AC/VAL aligned with shipped SDK contracts; implement BigQuery adapter with bundle namespace/readability tests when prioritized; treat future discovery/CLI items as separate missions.
