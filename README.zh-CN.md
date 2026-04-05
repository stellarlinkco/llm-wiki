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

```bash
cd cli
pip install -e ".[dev]"
pytest tests/ -v
```

162 个测试：32 域层单元测试 + 73 应用层单元测试 + 42 集成测试 + 15 端到端测试。

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
