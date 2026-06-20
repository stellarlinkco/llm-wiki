---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0"
title: AI 时代，我们需要什么样的数据格式？
description: AI 时代 我们需要什么样的数据格式
resource: "https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0"
tags: []
timestamp: "2026-06-20T06:45:59.242Z"
source_path: "https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0"
source_id: 73ea0997aba08805b4ca57d1157e3eedef796bb8006187c786a80b24de971470
content_hash: be42b1675997634aede50ab5b8ca7bc845ecd713864289dd4cce47dc2b76b732
---

在 LLM 成为基础设施的今天，一个被忽视的问题正在浮现：**我们是否还应该用为人类设计的格式与 AI 对话？**

当你向 Claude 发送一份 JSON 配置，为那些重复的花括号、引号支付 token 成本时；当你用 Markdown 编写 Agent 的任务列表，却发现 LLM 经常解析错误时——这些问题的根源在于：**我们的数据格式仍然停留在”人机交互”时代，而非”机器间通信”时代**。

## [问题的本质：格式的设计假设已过时](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E9%97%AE%E9%A2%98%E7%9A%84%E6%9C%AC%E8%B4%A8%E6%A0%BC%E5%BC%8F%E7%9A%84%E8%AE%BE%E8%AE%A1%E5%81%87%E8%AE%BE%E5%B7%B2%E8%BF%87%E6%97%B6)

### [传统格式的隐含假设](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E4%BC%A0%E7%BB%9F%E6%A0%BC%E5%BC%8F%E7%9A%84%E9%9A%90%E5%90%AB%E5%81%87%E8%AE%BE)

**JSON**（1999）：工程师需要花括号快速定位层级，需要引号区分字符串。 **YAML**（2001）：缩进比符号更易读，注释帮助理解意图。 **CSV**（1972）：表格数据需要简单，Excel 能打开就行。 **Markdown**（2004）：人类需要视觉层级，`#` 比 `<h1>` 更直观。

这些假设在”人类编写、机器解析”的场景下完全合理。但当场景变为”机器生成、机器消费、人类监督”时，优先级发生了根本性变化：

传统优先级

AI 时代优先级

视觉美观

**结构明确性**

字符可读性

**Token 密度**

工具链兼容

**解析准确率**

注释丰富

**模式声明**

## [案例一：TOON 的探索](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E6%A1%88%E4%BE%8B%E4%B8%80toon-%E7%9A%84%E6%8E%A2%E7%B4%A2)

[TOON](https://github.com/toon-format/toon)（Token-Oriented Object Notation）是一个针对 LLM 输入优化的格式。它的核心洞察是：**LLM 不需要人类的视觉辅助**。

![](https://stellarlink.co/Users/chenwenjie/Downloads/og.png)

![](https://stellarlink.co/Users/chenwenjie/Downloads/G6NN7BqXEAEzeKX.jpeg)

### [对比实例](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E5%AF%B9%E6%AF%94%E5%AE%9E%E4%BE%8B)

向 LLM 发送 100 条员工记录：

**JSON（6,360 tokens）：**

```
{
  "employees": [
    {"id": 1, "name": "Alice", "dept": "Eng", "salary": 95000},
    {"id": 2, "name": "Bob", "dept": "Sales", "salary": 87000},
    ...
  ]
}
```

**TOON（2,518 tokens，节省 60.4%）：**

```
employees[100]{id,name,dept,salary}:
  1,Alice,Eng,95000
  2,Bob,Sales,87000
  ...
```

### [设计原则](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E8%AE%BE%E8%AE%A1%E5%8E%9F%E5%88%99)

1.  **显式结构声明**：`[100]` 告诉 LLM 数组长度，防止幻觉补全；`{id,name,...}` 声明字段模式，减少解析错误。
    
2.  **混合范式**：根据数据结构选择最优表示
    
    *   对象 → YAML 风格键值对
    *   均匀数组 → CSV 风格表格
    *   简单数组 → 内联逗号分隔
3.  **最小化语法开销**：无需引号、闭合符号，通过缩进确定范围。
    

### [实测效果](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E5%AE%9E%E6%B5%8B%E6%95%88%E6%9E%9C)

在 4 个模型、209 个数据检索问题的基准测试中：

```
TOON           26.9 acc%/1K tok  │  73.9% 准确率  │  2,744 tokens
JSON compact   22.9 acc%/1K tok  │  70.7% 准确率  │  3,081 tokens
JSON           15.3 acc%/1K tok  │  69.7% 准确率  │  4,545 tokens
```

*   Token 效率提升 **75.8%**
*   准确率提升 **4.2 个百分点**
*   在结构验证任务中准确率 **70% vs 45%**

## [案例二：任务编排的自定义格式](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E6%A1%88%E4%BE%8B%E4%BA%8C%E4%BB%BB%E5%8A%A1%E7%BC%96%E6%8E%92%E7%9A%84%E8%87%AA%E5%AE%9A%E4%B9%89%E6%A0%BC%E5%BC%8F)

在实际工程中，格式设计往往需要针对特定场景优化。以 [codex-wrapper](https://github.com/cexll/myclaude/blob/master/codex-wrapper/main.go#L74) 的并发任务编排为例。

### [场景需求](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E5%9C%BA%E6%99%AF%E9%9C%80%E6%B1%82)

需要向 Codex Agent 传递多个任务，支持：

*   并发执行（提升效率）
*   依赖关系（拓扑排序）
*   会话恢复（resume 模式）
*   工作目录隔离

### [格式设计](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E6%A0%BC%E5%BC%8F%E8%AE%BE%E8%AE%A1)

```
---TASK---
id: setup-db
workdir: ./backend
---CONTENT---
Initialize PostgreSQL schema and seed test data

---TASK---
id: run-tests
workdir: ./backend
dependencies: setup-db
---CONTENT---
Run integration tests with pytest -v

---TASK---
id: build-frontend
workdir: ./frontend
---CONTENT---
Build React app for production
```

### [设计权衡](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E8%AE%BE%E8%AE%A1%E6%9D%83%E8%A1%A1)

**为什么不用 JSON？**

```
{
  "tasks": [
    {
      "id": "setup-db",
      "workdir": "./backend",
      "content": "Initialize PostgreSQL..."
    }
  ]
}
```

*   Token 开销高（花括号、引号、逗号）
*   多行内容需要转义 `\n`
*   人类编辑不便（尤其是长任务描述）

**为什么不用 YAML？**

```
tasks:
  - id: setup-db
    workdir: ./backend
    content: |
      Initialize PostgreSQL schema
      and seed test data
```

*   缩进敏感，容易出错
*   `|` 多行语法增加认知负担
*   LLM 生成时容易缩进错误

**自定义格式的优势：**

*   **分隔符明确**：`---TASK---` 和 `---CONTENT---` 无歧义
*   **Token 高效**：元数据用键值对，内容直接文本
*   **易于生成**：LLM 只需记住两个分隔符
*   **易于解析**：简单的字符串分割，无需复杂解析器

### [实现细节](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E5%AE%9E%E7%8E%B0%E7%BB%86%E8%8A%82)

```
func parseParallelConfig(data []byte) (*ParallelConfig, error) {
    tasks := strings.Split(string(data), "---TASK---")
    for _, taskBlock := range tasks {
        parts := strings.SplitN(taskBlock, "---CONTENT---", 2)
        meta := strings.TrimSpace(parts[0])
        content := strings.TrimSpace(parts[1])

        // 解析元数据（id, workdir, dependencies, session_id）
        // 构建任务依赖图，拓扑排序，并发执行
    }
}
```

核心思想：**用最简单的分隔符 + 键值对，实现结构化与灵活性的平衡**。

## [更广阔的思考：格式设计的新范式](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E6%9B%B4%E5%B9%BF%E9%98%94%E7%9A%84%E6%80%9D%E8%80%83%E6%A0%BC%E5%BC%8F%E8%AE%BE%E8%AE%A1%E7%9A%84%E6%96%B0%E8%8C%83%E5%BC%8F)

### [1\. 从”人类优先”到”机器优先”](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#1-%E4%BB%8E%E4%BA%BA%E7%B1%BB%E4%BC%98%E5%85%88%E5%88%B0%E6%9C%BA%E5%99%A8%E4%BC%98%E5%85%88)

传统格式设计问题：

*   “这个缩进人类能看懂吗？"
*   "注释够详细吗？"
*   "IDE 能自动补全吗？“

AI 时代应该问：

*   “LLM 能无歧义解析吗？"
*   "Token 密度是否最优？"
*   "结构声明是否显式？“

### [2\. 混合范式的必然性](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#2-%E6%B7%B7%E5%90%88%E8%8C%83%E5%BC%8F%E7%9A%84%E5%BF%85%E7%84%B6%E6%80%A7)

没有一种格式适用所有场景：

*   **表格数据** → CSV 风格（TOON 的表格模式）
*   **层级配置** → YAML 风格（缩进表示嵌套）
*   **任务编排** → 自定义分隔符（如 `---TASK---`）
*   **代码片段** → Markdown 代码块（语法高亮提示）

关键是：**在同一个系统中，根据数据特征动态选择最优表示**。

### [3\. 显式优于隐式](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#3-%E6%98%BE%E5%BC%8F%E4%BC%98%E4%BA%8E%E9%9A%90%E5%BC%8F)

传统格式依赖推断：

```
{"users": [{"id": 1}, {"id": 2}]}
```

LLM 需要推断：这是数组、有 2 个元素、每个元素是对象、有 `id` 字段。

显式声明：

```
users[2]{id}:
  1
  2
```

LLM 直接获得：长度 2、字段 `id`、后续是表格数据。

**显式声明 = 给 LLM 的”类型系统”**，减少幻觉和解析错误。

### [4\. 可组合性](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#4-%E5%8F%AF%E7%BB%84%E5%90%88%E6%80%A7)

好的格式应该支持嵌套和组合：

```
project:
  name: MyApp
  tasks[3]{id,status,assignee}:
    1,done,alice
    2,in_progress,bob
    3,pending,charlie
  config:
    db_url: postgres://localhost
    cache_ttl: 3600
```

在同一个文档中：

*   顶层对象用键值对
*   任务列表用表格
*   配置用嵌套对象

## [工程实践建议](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5%E5%BB%BA%E8%AE%AE)

### [1\. 渐进式采用](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#1-%E6%B8%90%E8%BF%9B%E5%BC%8F%E9%87%87%E7%94%A8)

不要一次性重写所有格式。在 LLM 密集型场景优先尝试：

```
// API 通信仍用 JSON
const data = await fetch('/api/users').then(r => r.json());

// LLM 输入转换为 TOON
import { encode } from '@toon-format/toon';
const prompt = `分析以下数据：\n${encode(data)}`;
```

### [2\. 基准测试驱动](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#2-%E5%9F%BA%E5%87%86%E6%B5%8B%E8%AF%95%E9%A9%B1%E5%8A%A8)

不同场景的最优格式不同。务必测试：

*   **Token 数量**：`tiktoken` 或模型 API 统计
*   **解析准确率**：让 LLM 回答数据检索问题
*   **生成质量**：让 LLM 生成该格式，检查错误率
*   **端到端延迟**：本地模型可能因解析复杂度增加延迟

### [3\. 为特定场景设计](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#3-%E4%B8%BA%E7%89%B9%E5%AE%9A%E5%9C%BA%E6%99%AF%E8%AE%BE%E8%AE%A1)

通用格式（JSON/YAML）适合 80% 场景，但关键 20% 需要定制：

*   **高频 API 调用** → 极致 token 优化（TOON）
*   **复杂任务编排** → 自定义分隔符（如 `---TASK---`）
*   **流式输出** → 行分隔的 JSON（JSONL）
*   **多模态数据** → Markdown + 内嵌结构化块

### [4\. 文档化格式规范](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#4-%E6%96%87%E6%A1%A3%E5%8C%96%E6%A0%BC%E5%BC%8F%E8%A7%84%E8%8C%83)

自定义格式必须有清晰的规范：

```
## Task List Format Specification

### Structure
- Tasks separated by `---TASK---`
- Metadata and content separated by `---CONTENT---`

### Metadata Fields
- `id` (required): Unique task identifier
- `workdir` (optional): Working directory, defaults to "."
- `dependencies` (optional): Comma-separated task IDs
- `session_id` (optional): Resume existing session

### Example
\`\`\`
---TASK---
id: build
workdir: ./app
dependencies: install
---CONTENT---
Run npm run build
\`\`\`
```

## [未来展望](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E6%9C%AA%E6%9D%A5%E5%B1%95%E6%9C%9B)

当 AI 成为一等公民，整个技术栈都需要重新思考：

### [配置文件](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)

传统：YAML + 注释 AI 时代：结构化 + 意图声明（LLM 可从代码推断）

### [API 设计](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#api-%E8%AE%BE%E8%AE%A1)

传统：RESTful 语义化路径 AI 时代：任意结构 + Schema 声明（LLM 可理解任意 API）

### [文档](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E6%96%87%E6%A1%A3)

传统：Markdown 长文 AI 时代：结构化知识图谱 + 按需生成自然语言

### [代码注释](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E4%BB%A3%E7%A0%81%E6%B3%A8%E9%87%8A)

传统：人类可读的自然语言 AI 时代：类型标注 + 测试用例（LLM 可生成文档）

## [结语](https://stellarlink.co/articles/toon-ai%E6%97%B6%E4%BB%A3%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E9%9D%A9%E6%96%B0#%E7%BB%93%E8%AF%AD)

TOON、自定义任务格式、以及未来更多的探索，都指向同一个方向：**数据格式不再是静态的标准，而是根据通信双方（人类、LLM、系统）动态优化的协议**。

关键原则：

1.  **明确受众**：这个格式主要给谁用？（人类 vs LLM）
2.  **显式声明**：结构、长度、类型能显式就显式
3.  **Token 意识**：在 LLM 场景中，token 是一等成本
4.  **混合范式**：没有银弹，根据数据特征选择表示
5.  **可测量**：用基准测试验证，而非主观判断

JSON 不会消失，Markdown 也不会。但在 AI 原生应用中，我们需要新的工具。TOON 是一个开始，你的自定义格式是另一个开始。

**这是一个开放的探索领域，没有标准答案。唯一确定的是：AI 时代的格式设计，才刚刚开始。**

* * *

**参考资源：**

*   TOON 项目: [https://github.com/toon-format/toon](https://github.com/toon-format/toon)
*   TOON 规范: [https://github.com/toon-format/spec](https://github.com/toon-format/spec)
*   Codex Wrapper 实现: [https://github.com/cexll/myclaude/blob/master/codex-wrapper/main.go](https://github.com/cexll/myclaude/blob/master/codex-wrapper/main.go)

**延伸阅读：**

*   Token 计数工具: [tiktoken](https://github.com/openai/tiktoken)
*   LLM 基准测试: [HELM](https://crfm.stanford.edu/helm/)
*   数据序列化格式对比: [Benchmark of serialization formats](https://github.com/alecthomas/go_serialization_benchmarks)
