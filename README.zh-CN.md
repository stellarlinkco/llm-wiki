# LLM Wiki

用 LLM 构建持续增长的个人知识库。灵感来自 [Andrej Karpathy 的 LLM Wiki 模式](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)。


> OKF (Open Knowledge Format) 是 Google Cloud 发布的开放规范 — [阅读公告](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)（本地副本：`docs/okf-google-cloud-blog.md`）。
**不是 RAG，是一本会自动生长的书。** 知识编译一次，持续更新，以复利方式积累。

[English](./README.md)

## 架构

```
用户文件 ──▶ KnowledgeBase SDK ──▶ OKF bundle (.md + frontmatter + 搜索索引)
              parse / ingest       LLM synthesize / query / validate / export
```

`@llm-wiki/sdk` TypeScript SDK 管理知识库的完整生命周期：
- **Ingest** — 源文件解析（URL、文件、Buffer → Markdown + YAML frontmatter）
- **Search** — 基于 MiniSearch 的全文搜索
- **Synthesize** — LLM 驱动的概念生成（从检索到的 bundle 上下文中提取）
- **Query** — LLM 问答（带 citation 过滤的 bundle 上下文）
- **Validate** — OKF schema、frontmatter、链接完整性检查
- **Export** — 安全的 bundle 复制到外部目录

三层 Wiki 结构：

```
my-wiki/
├── sources/       # 解析后的源文档（SDK 写入，LLM 读取）
├── concepts/      # LLM 生成的概念页面
├── references/    # 外部引用链接
├── index.md       # Bundle 入口目录
├── log.md         # Bundle 操作日志
└── .llm-wiki/     # 搜索索引 + 元数据
```

## 快速开始

```bash
npm install @llm-wiki/sdk
```

```ts
import { KnowledgeBase, OpenAIProvider } from "@llm-wiki/sdk";

const kb = await KnowledgeBase.create({
  root: "./my-wiki",
  llm: new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
  }),
});

// 爬取 sitemap 并 ingest 匹配页面
await kb.crawl({ sitemapUrl: "https://example.com/sitemap.xml", limit: 80 });

// Ingest 单个源
await kb.ingest({ path: { kind: "url", url: "https://example.com/index.md" } });
await kb.ingest({ path: "./local-doc.pdf" });

// 通过 LLM 从 bundle 上下文中生成概念
await kb.synthesize({
  query: "公司产品与接口",
  instructions: "在 concepts/company-overview.md 下生成一个扎实的概念文档。",
  limit: 8,
});

// 重新生成入口索引
await kb.writeIndex({
  title: "企业知识库",
  description: "由公开源文档和 SDK 生成的概念构成。",
});

// 验证 bundle 完整性
const report = await kb.validate();
console.log(report.valid ? "OK" : report.errors);

// 导出 bundle
await kb.export({ path: "./backup" });
```

`crawl()` 会读取 sitemap，跳过非同源 URL，并把同源页面交给与直接 source 相同的 `ingest()` 路径处理。`synthesize()` 会通过 SDK search 检索 bundle 上下文，调用配置好的 LLM provider 获取 JSON structured output，再通过 `writeConcept()` 写入 `concepts/*.md`，在生成的概念 frontmatter 中标记 `generated_by: llm-wiki-sdk`，重建索引，并记录 `synthesize` 审计日志。`writeIndex()` 会重新生成 `index.md`，作为列出 source documents 和 generated concepts 的 bundle 入口。`status()` 会分开报告 source documents 和 generated concept documents。

## 支持的文件格式

- **文档**: PDF, DOCX, PPTX, XLSX
- **网页**: HTML（通过 jsdom + Readability）
- **文本**: TXT, CSV, JSON, XML, Markdown
- **缓冲区**: 内存内容（带显式元数据）

## 搜索特性

- **MiniSearch** 全文搜索，支持拼写容错和前缀匹配
- **相关性评分**，标题加权
- **Citation 完整性** — `query()` 限制 citation 只出现在实际检索到的 bundle 路径中
- **确定性独立** — search、validate、status、export 无需 LLM provider 即可工作

## 架构设计

遵循 **ports-and-adapters**（六边形）分层：

```
sdk/src/
├── domain/              # 内层：类型、接口、错误 — 零外部依赖
│   ├── types.ts         # 公共合约：KnowledgeBaseOptions、ChangeSet 等
│   └── errors.ts        # 领域错误：ConfigurationError、ParserError
├── application/         # 中层：用例编排
│   ├── knowledge-base.ts  # KnowledgeBase 外观类
│   ├── helpers.ts         # 共享工具函数
│   └── search.ts          # 分词 + 评分辅助
└── infrastructure/      # 外层：具体适配器
    ├── filesystem.ts       # atomicWrite、路径工具
    ├── filesystem-store.ts # Bundle store（OKF 文件布局）
    ├── markdown.ts         # Markdown/frontmatter 解析与序列化
    ├── local-search.ts     # MiniSearch 适配器
    ├── source-parser.ts    # 组合源解析器
    ├── parsers/            # 格式特定解析器（PDF、DOCX、PPTX、HTML 等）
    └── providers/          # LLM provider 适配器（OpenAI、Anthropic）
```

依赖方向：`Infrastructure → Application → Domain`（内层无外部依赖）

## 测试

```bash
cd sdk
npm install
npm test          # 93 个测试，通过 node:test 运行
npm run typecheck # 严格 TypeScript 类型检查
```

测试按关注面拆分：
- `test/knowledge-base.test.js` — 核心 KnowledgeBase 工作流
- `test/source-parsers.test.js` — markdown/text/JSON/HTML/URL 解析
- `test/document-parsers.test.js` — PDF/DOCX/PPTX 解析器覆盖
- `test/providers.test.js` — LLM provider 契约与 citation 过滤
- `test/validation.test.js` — OKF/frontmatter/link 校验
- `test/helpers.js` — 共享 fixtures

### 打包后的 SDK E2E

发布前需要构建并打包 `sdk`，把生成的 tarball 安装到临时应用中，再验证 package import/create/open、parser ingest/search、query citation filtering，以及 validate/export。

### Demo

```bash
cd sdk
npm run demo:create-kb
```

该 demo 会构建 SDK，在 `/tmp` 下创建隔离的知识库目录，ingest 一个 markdown source，执行 search，校验 OKF bundle，并输出 JSON 摘要。

## 与 Claude Code 配合使用

将 `SKILL.md` 安装为 Claude Code skill，即可通过自然语言操控知识库。Skill 会在 SDK 确定性操作之上编排 LLM 综合：

```
/llm-wiki init ./research --name "AI 论文库"
/llm-wiki ingest ~/papers/attention.pdf
/llm-wiki query "transformer 和 RNN 的区别是什么？"
/llm-wiki lint
```

## 灵感来源

> "维护知识库，累人的不是读书或思考，而是日常的「账务处理」——更新交叉引用、保持摘要一致、标记矛盾。人类会因为这个维护成本放弃 Wiki。LLM 不会厌倦，不会忘记更新引用，一次能改 15 个文件。"
>
> — Andrej Karpathy

## License

MIT
