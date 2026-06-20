# LLM Wiki

用 LLM 构建持续增长的个人知识库。灵感来自 [Andrej Karpathy 的 LLM Wiki 模式](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)。

**不是 RAG，是一本会自动生长的书。** 知识编译一次，持续更新，以复利方式积累。

[English](./README.md)

## 架构

```
用户文件 ──▶ CLI (parse) ──▶ raw/*.md ──▶ Skill (LLM) ──▶ wiki 页面
             确定性操作        解析后的源文档    LLM 综合       实体/概念/摘要
```

两层分工：

| 层 | 职责 | 技术 |
|---|------|------|
| **CLI** (`llm-wiki`) | 文档解析、搜索、索引、验证 | Python, MarkItDown, BM25+jieba |
| **Skill** (SKILL.md) | 知识综合、交叉引用、Wiki 页面生成 | Claude Code / 任意 LLM Agent |

三层 Wiki 结构：

```
my-wiki/
├── raw/          # 解析后的源文档（CLI 写入，LLM 只读）
├── wiki/         # LLM 生成的 Wiki 页面（实体、概念、摘要、对比）
│   ├── entities/
│   ├── concepts/
│   ├── sources/
│   ├── index.md
│   └── log.md
├── CLAUDE.md     # Wiki schema（约定、格式、工作流）
└── .llm-wiki/    # 搜索索引
```

## 安装

```bash
git clone git@github.com:stellarlinkco/llm-wiki.git
cd llm-wiki/cli
pip install -e .
```

## 快速开始

```bash
# 1. 创建知识库
llm-wiki init ./my-wiki --name "我的研究" --description "AI 领域研究笔记"

# 2. 解析文档（支持 PDF/DOCX/HTML/PPTX/XLSX/TXT/图片等）
llm-wiki --root ./my-wiki parse ~/papers/paper.pdf
llm-wiki --root ./my-wiki parse ~/articles/article.docx

# 3. 建索引
llm-wiki --root ./my-wiki index

# 4. 搜索（支持中英文）
llm-wiki --root ./my-wiki search "注意力机制"
llm-wiki --root ./my-wiki search "transformer architecture"

# 5. 验证 Wiki 完整性
llm-wiki --root ./my-wiki validate

# 6. 查看状态
llm-wiki --root ./my-wiki status
```

## CLI 命令

所有命令输出 JSON 到 stdout，日志到 stderr。可被任意 LLM Agent 通过 subprocess 调用。

| 命令 | 说明 | 示例 |
|------|------|------|
| `init <path>` | 创建 Wiki 项目骨架 | `llm-wiki init ./wiki --name "AI研究"` |
| `parse <file\|dir>` | 文档 → Markdown（via MarkItDown） | `llm-wiki --root ./wiki parse paper.pdf` |
| `index` | 重建目录 + BM25 搜索索引 | `llm-wiki --root ./wiki index` |
| `search <query>` | BM25 排序搜索，返回片段 | `llm-wiki --root ./wiki search "知识库"` |
| `validate` | 检查 frontmatter、死链、目录结构 | `llm-wiki --root ./wiki validate` |
| `list` | 列出页面及元数据 | `llm-wiki --root ./wiki list --type entity` |
| `status` | Wiki 统计和新旧检测 | `llm-wiki --root ./wiki status` |

### 常用参数

```bash
--root <path>      # 指定 Wiki 根目录（默认自动向上查找 .llm-wiki/）
--recursive        # parse 时递归处理子目录
--limit N          # search 结果数量上限（默认 10）
--type <type>      # 按页面类型过滤（entity/concept/source/comparison/query）
--raw-only         # search 只搜索 raw/ 目录
--wiki-only        # search 只搜索 wiki/ 目录
--raw              # list 列出 raw/ 文件而非 wiki/ 页面
--fix              # validate 自动修复可修复的问题
```

## TypeScript SDK 综合流程

SDK 可以在没有 Agent 手工写概念文件的情况下构建同一套 OKF bundle：

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

`crawl()` 会读取 sitemap，跳过非同源 URL，并把同源页面交给与直接 source 相同的 `ingest()` 路径处理。`synthesize()` 会通过 SDK search 检索 bundle 上下文，调用配置好的 LLM provider 获取 JSON structured output，再通过 `writeConcept()` 写入 `concepts/*.md`，在生成的概念 frontmatter 中标记 `generated_by: llm-wiki-sdk`，重建索引，并记录 `synthesize` 审计日志。`writeIndex()` 会重新生成 `index.md`，作为列出 source documents 和 generated concepts 的 bundle 入口。`status()` 会分开报告 source documents 和 generated concept documents。

## 支持的文件格式

通过 [Microsoft MarkItDown](https://github.com/microsoft/markitdown) 支持：

- **文档**: PDF, DOCX, PPTX, XLSX
- **网页**: HTML, HTM
- **文本**: TXT, CSV, JSON, XML, Markdown
- **笔记本**: Jupyter (.ipynb)
- **媒体**: JPG, PNG, GIF, WebP (EXIF/OCR), WAV, MP3
- **压缩包**: ZIP（递归解析）

## 搜索特性

- **BM25Plus** 全文搜索，解决小语料库零分问题
- **jieba 中文分词**，支持中英文混合搜索
- **标题加权**：标题匹配的页面排名更高
- **停用词过滤**：中文常见虚词（的、了、在、是...）不影响排序
- **去重**：raw/ 和 wiki/sources/ 同源结果自动去重
- **Snippet 提取**：定位到匹配句子，纯文本输出

## 架构设计

遵循 **Clean Architecture + DDD + Hexagonal** 模式：

```
cli/src/llm_wiki/
├── domain/              # 内层：纯业务逻辑，零外部依赖
│   ├── models.py        # 值对象：ParsedDocument, WikiPage, SearchResult...
│   ├── ports.py         # 端口接口：DocumentParser, PageRepository, SearchEngine
│   └── errors.py        # 领域错误
├── application/         # 中层：用例编排
│   ├── init_project.py
│   ├── parse_document.py
│   ├── build_index.py
│   ├── search_wiki.py
│   ├── validate_wiki.py
│   ├── list_pages.py
│   └── get_status.py
└── infrastructure/      # 外层：适配器
    ├── markitdown_parser.py   # MarkItDown 解析适配器
    ├── filesystem.py          # 本地文件系统适配器
    ├── bm25_search.py         # BM25+jieba 搜索适配器
    ├── cli.py                 # Click CLI 驱动适配器
    └── container.py           # 依赖注入组合根
```

依赖方向：`Infrastructure → Application → Domain`（内层无外部依赖）

## 测试

### SDK

```bash
cd sdk
npm test
npm run typecheck
```

SDK 测试按关注面拆分：

- `test/knowledge-base.test.js` — 核心 `KnowledgeBase` 工作流。
- `test/source-parsers.test.js` — markdown/text/JSON/HTML/URL 解析与 ingest 行为。
- `test/document-parsers.test.js` — PDF/DOCX/PPTX 解析器覆盖。
- `test/providers.test.js` — LLM provider 契约与 citation 过滤。
- `test/validation.test.js` — OKF/frontmatter/link 校验。
- `test/helpers.js` — 共享 fixtures 和测试 helpers。
当前 SDK gate：93 个 Node 测试 + TypeScript typecheck。

### CLI

```bash
cd cli
pip install -e ".[dev]"
python3 -m pytest tests/ -q
```

当前 CLI gate：162 个测试：32 域层单元测试 + 73 应用层单元测试 + 42 集成测试 + 15 端到端测试。

### 打包后的 SDK E2E

发布前需要构建并打包 `sdk`，把生成的 tarball 安装到临时应用中，再验证 package import/create/open、parser ingest/search、unsupported-media typed failure、query citation filtering，以及 validate/export。

### 创建 demo 知识库

```bash
cd sdk
npm run demo:create-kb
```

该 demo 会构建 SDK，在 `/tmp` 下创建隔离的知识库目录，ingest 一个 markdown source，执行 search，校验 OKF bundle，并输出包含生成根目录的 JSON 摘要。

## 与 Claude Code 配合使用

将 `SKILL.md` 安装为 Claude Code skill，即可通过自然语言操控知识库：

```
/llm-wiki init ./research --name "AI 论文库"
/llm-wiki ingest ~/papers/attention.pdf    # 解析 + LLM 综合生成 wiki 页面
/llm-wiki query "transformer 和 RNN 的区别是什么？"
/llm-wiki lint                              # 检查知识一致性
```

## 灵感来源

> "维护知识库，累人的不是读书或思考，而是日常的「账务处理」——更新交叉引用、保持摘要一致、标记矛盾。人类会因为这个维护成本放弃 Wiki。LLM 不会厌倦，不会忘记更新引用，一次能改 15 个文件。"
>
> — Andrej Karpathy

## License

MIT
