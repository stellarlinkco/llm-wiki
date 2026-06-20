---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/deep-agents-zh"
title: 一年之间，Agent 从 Workflow 到 While Loop
description: 一年之间 Agent 从 Workflow 到 While Loop
resource: "https://stellarlink.co/articles/deep-agents-zh"
tags: []
timestamp: "2026-06-20T06:45:43.254Z"
source_path: "https://stellarlink.co/articles/deep-agents-zh"
source_id: 177e42c31241d4cf70e3d56ba5caf02a9bfc7bfb65a1767537ab61004157deb9
content_hash: 5158f3127efd11214aefaf6faeafa070a8a90ded643c86aaaff5232360721ab1
---

## [一年之间，Agent 从 Workflow 到 While Loop](https://stellarlink.co/articles/deep-agents-zh#%E4%B8%80%E5%B9%B4%E4%B9%8B%E9%97%B4agent-%E4%BB%8E-workflow-%E5%88%B0-while-loop)

## [模型迭代速度超越了框架设计速度](https://stellarlink.co/articles/deep-agents-zh#%E6%A8%A1%E5%9E%8B%E8%BF%AD%E4%BB%A3%E9%80%9F%E5%BA%A6%E8%B6%85%E8%B6%8A%E4%BA%86%E6%A1%86%E6%9E%B6%E8%AE%BE%E8%AE%A1%E9%80%9F%E5%BA%A6)

*   **2024年初**：GPT-4、Claude 3 需要 Workflow 这样的”手把手”指导才能完成复杂任务
*   **2025年中**：Claude 3.7、GPT-4.5、o4-mini 直接理解任务意图，一个 `while True` 配合详细 prompt 就能跑完全流程
*   **核心转变**：从”框架编排模型”到”模型即 agent”，Prompt+模型成为唯一核心
*   **行业共识**：模型能力每 3-6 个月翻倍，精心设计的工作流框架很快就会过时

## [一年前：为什么我们需要 Workflow？](https://stellarlink.co/articles/deep-agents-zh#%E4%B8%80%E5%B9%B4%E5%89%8D%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E9%9C%80%E8%A6%81-workflow)

2024年初，当我们想让 GPT-4 完成一个复杂的调研任务时，必须这样做：

1.  **手动拆解任务**：定义”搜索”节点、“分析”节点、“总结”节点
2.  **设计状态机**：规划节点之间的跳转逻辑、循环条件、退出条件
3.  **编写路由规则**：用代码告诉模型”什么时候该做什么”
4.  **维护状态传递**：在节点之间显式传递中间结果

```
# 2024年典型的代码
from langgraph.graph import StateGraph

workflow = StateGraph(AgentState)
workflow.add_node("search", search_node)
workflow.add_node("analyze", analyze_node)
workflow.add_node("summarize", summarize_node)
workflow.add_edge("search", "analyze")
workflow.add_edge("analyze", "summarize")
workflow.add_conditional_edges(
    "summarize",
    should_continue,
    {"continue": "search", "end": END}
)
```

**为什么这么复杂？** 因为 2024 年的模型还不够聪明：

*   上下文窗口有限（GPT-4 才 128K，实际可用更少）
*   工具调用不稳定（经常遗漏参数或调错工具）
*   推理深度不足（多步任务容易”走偏”）
*   没有长期记忆能力

## [现在：Claude Code 只用了一个 while loop](https://stellarlink.co/articles/deep-agents-zh#%E7%8E%B0%E5%9C%A8claude-code-%E5%8F%AA%E7%94%A8%E4%BA%86%E4%B8%80%E4%B8%AA-while-loop)

2025年，Claude Code 让我们看到了另一种可能。它的核心代码简化到极致：

```
# Claude Code 的核心逻辑（简化版）
system_prompt = """你是一个软件工程助手...
[长达 5000+ 字的详细操作手册]
"""

while not task_completed:
    response = claude_3_7.invoke(
        system=system_prompt,
        messages=conversation_history,
        tools=available_tools
    )

    if response.tool_calls:
        results = execute_tools(response.tool_calls)
        conversation_history.append(results)

    if response.says_completed:
        task_completed = True
```

**就这么简单。** 没有节点、没有状态机、没有路由规则。模型自己决定：

*   下一步该做什么（规划能力）
*   需要调用哪些工具（工具理解）
*   任务是否完成（自我评估）
*   如何处理错误（容错能力）

**为什么现在可以？** 因为模型迭代太快了：

能力维度

2024年初

2025年中

提升倍数

上下文窗口

128K

1M+

8x

工具调用准确率

~60%

~95%

1.6x

多步推理深度

3-5步

20+步

4-6x

Prompt 理解

需要精简

可以写”操作手册”

10x+

![深度代理的四个关键构成要素](https://blog.langchain.com/content/images/2025/07/Screenshot-2025-07-30-at-9.08.32-AM.png)

## [核心转变：Prompt + 模型 = 一切](https://stellarlink.co/articles/deep-agents-zh#%E6%A0%B8%E5%BF%83%E8%BD%AC%E5%8F%98prompt--%E6%A8%A1%E5%9E%8B--%E4%B8%80%E5%88%87)

### [以前：框架是核心，模型是工具](https://stellarlink.co/articles/deep-agents-zh#%E4%BB%A5%E5%89%8D%E6%A1%86%E6%9E%B6%E6%98%AF%E6%A0%B8%E5%BF%83%E6%A8%A1%E5%9E%8B%E6%98%AF%E5%B7%A5%E5%85%B7)

```
开发者设计 → Workflow 编排 → 模型执行
    ↑                              ↓
    └──────── 结果反馈 ←────────────┘
```

*   开发者要想清楚所有逻辑
*   框架负责流程控制
*   模型只是”一个更好的函数”

### [现在：模型是大脑，框架是手](https://stellarlink.co/articles/deep-agents-zh#%E7%8E%B0%E5%9C%A8%E6%A8%A1%E5%9E%8B%E6%98%AF%E5%A4%A7%E8%84%91%E6%A1%86%E6%9E%B6%E6%98%AF%E6%89%8B)

```
详细 Prompt → 模型自主决策 → 持续执行
                  ↓
            工具 + 记忆
```

*   Prompt 就是”操作系统”（5000+ 字的系统提示）
*   模型自己规划、执行、评估
*   框架退化为”提供工具”和”防止出轨"

> "真正的Agent，就是一个在循环中运行、不断调用工具的 LLM。差异只在于工程细节。“

这句话的深层含义是：**当模型足够强时，复杂的框架设计变得不再必要。**

理解 Claude Code 发现只需要四个东西：

### [1\. 详细的系统 Prompt（5000+ 字）](https://stellarlink.co/articles/deep-agents-zh#1-%E8%AF%A6%E7%BB%86%E7%9A%84%E7%B3%BB%E7%BB%9F-prompt5000-%E5%AD%97)

Claude Code 的[系统提示词](https://github.com/kn1026/cc/blob/main/claudecode.md)包含：

*   工具使用说明（每个工具都有详细例子）
*   工作流程指南（什么时候该做什么）
*   错误处理策略（遇到问题怎么办）
*   输出格式要求（如何与用户沟通）

**关键发现**：Prompt 越详细，模型表现越好。2024年我们还在优化”如何用最少的 token”，现在直接把操作手册塞进去就行。

### [2\. 规划工具（Todo List）](https://stellarlink.co/articles/deep-agents-zh#2-%E8%A7%84%E5%88%92%E5%B7%A5%E5%85%B7todo-list)

Claude Code 的 [Todo List 工具](https://claudelog.com/faqs/what-is-todo-list-in-claude-code/)本质上是个 No-Op（不执行任何操作），但它强制模型：

*   显式列出计划步骤
*   追踪任务进度
*   保持专注不跑偏

```
class TodoTool:
    def add_task(self, task: str):
        """强制模型思考下一步"""
        pass  # 实际不执行任何操作
```

这个”假工具”的作用是让模型的 CoT（思维链）外化，类似于”把想法写下来”。

### [3\. 子代理机制](https://stellarlink.co/articles/deep-agents-zh#3-%E5%AD%90%E4%BB%A3%E7%90%86%E6%9C%BA%E5%88%B6)

复杂任务需要拆解。Claude Code 的[子代理](https://docs.anthropic.com/en/docs/claude-code/sub-agents)做法：

```
# 主代理创建子代理
sub_agent = Agent(
    task="深度调研量子计算的最新进展",
    parent_context=current_context,  # 共享上下文
    max_iterations=50
)

result = sub_agent.run()
main_agent.integrate(result)
```

*   主代理负责整体规划
*   子代理处理子任务（可以是搜索、代码、分析等）
*   上下文在主子之间共享

### [4\. 文件系统（长期记忆）](https://stellarlink.co/articles/deep-agents-zh#4-%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F%E9%95%BF%E6%9C%9F%E8%AE%B0%E5%BF%86)

无论是 Claude Code、Manus 还是 Deep Research，都把文件系统当作：

*   **工作区**：执行任务的场所（读写代码、文档等）
*   **外部记忆**：保存中间结果、避免上下文溢出
*   **状态持久化**：长时间运行任务的状态管理

```
# 模型可以随时读写文件
agent.write_file("research_notes.md", "...")
agent.read_file("previous_findings.txt")
```

这比传统的”把所有东西塞进 messages”要高效得多。

## [这一年的教训：模型迭代速度 >> 框架设计速度](https://stellarlink.co/articles/deep-agents-zh#%E8%BF%99%E4%B8%80%E5%B9%B4%E7%9A%84%E6%95%99%E8%AE%AD%E6%A8%A1%E5%9E%8B%E8%BF%AD%E4%BB%A3%E9%80%9F%E5%BA%A6--%E6%A1%86%E6%9E%B6%E8%AE%BE%E8%AE%A1%E9%80%9F%E5%BA%A6)

回顾 2024 到 2025 这一年：

**Q1 2024**：Workflow 成为 Agent 开发的事实标准  
**Q2 2024**：Claude 3.5 发布，工具调用准确率大幅提升  
**Q3 2024**：GPT-4.5 支持 200K 上下文，开始减少节点数量  
**Q4 2024**：o4-mini 展示深度推理能力，简单任务不再需要状态机  
**Q1 2025**：Claude Code 公开，证明”while 循环 + 详细 Prompt”就够了  
**Q2 2025**：行业开始反思”是否过度工程化了 Agent 框架”

**核心教训**：

1.  **不要为当前模型设计框架**——3个月后模型就会升级
2.  **Prompt 比代码更重要**——5000 字的 Prompt 胜过 5000 行的编排代码
3.  **模型即 Agent**——当模型足够强，循环就是最好的架构
4.  **保持简单**——复杂的状态机在快速迭代中很难维护

## [实践建议](https://stellarlink.co/articles/deep-agents-zh#%E5%AE%9E%E8%B7%B5%E5%BB%BA%E8%AE%AE)

如果你现在要开发一个 Agent 系统：

### [从 while 循环开始](https://stellarlink.co/articles/deep-agents-zh#%E4%BB%8E-while-%E5%BE%AA%E7%8E%AF%E5%BC%80%E5%A7%8B)

```
while not done:
    response = model.invoke(messages, tools)
    handle_response(response)
```

不要一上来就设计复杂的工作流图。先让最简单的循环跑起来，看模型能做到什么程度。

### [把精力花在 Prompt 上](https://stellarlink.co/articles/deep-agents-zh#%E6%8A%8A%E7%B2%BE%E5%8A%9B%E8%8A%B1%E5%9C%A8-prompt-%E4%B8%8A)

*   写详细的工具使用说明（每个工具都要有例子）
*   定义清晰的工作流程（什么情况下该做什么）
*   提供错误处理策略（遇到问题如何恢复）
*   给出输出格式要求（如何与用户交互）

Claude Code 的系统 Prompt 有 5000+ 字，这不是偶然。

### [选最新最强的模型](https://stellarlink.co/articles/deep-agents-zh#%E9%80%89%E6%9C%80%E6%96%B0%E6%9C%80%E5%BC%BA%E7%9A%84%E6%A8%A1%E5%9E%8B)

模型能力的提升远超你的想象：

*   Claude 4.5 vs Claude 3: 工具调用准确率从 60% → 95%
*   GPT-5 vs GPT-4: 推理深度从 5 步 → 20+ 步
*   o4-mini: 内置 CoT，自动进行多步推理

**不要用 6 个月前的模型。** 那会让你误以为需要复杂的框架。

### [提供必要的工具和记忆](https://stellarlink.co/articles/deep-agents-zh#%E6%8F%90%E4%BE%9B%E5%BF%85%E8%A6%81%E7%9A%84%E5%B7%A5%E5%85%B7%E5%92%8C%E8%AE%B0%E5%BF%86)

*   Todo List（强制规划）
*   子代理（任务拆解）
*   文件系统（长期记忆）

这些是工程细节，但很重要。

## [结语：模型就是 Agent](https://stellarlink.co/articles/deep-agents-zh#%E7%BB%93%E8%AF%AD%E6%A8%A1%E5%9E%8B%E5%B0%B1%E6%98%AF-agent)

2024 年我们说”Agent = 模型 + 框架 + 工具”。

2025 年我们发现”Agent = 模型”，框架和工具只是辅助。

这不是说 Workflow 没有价值——在需要严格流程控制、人工审核节点、合规检查的场景，显式的工作流依然必要。但对于大多数”让 AI 自主完成任务”的场景，一个写得足够好的 Prompt + 一个足够强的模型 + 一个简单的 while 循环，就够了。

**模型迭代太快了。** 与其花时间设计完美的框架，不如把精力放在 Prompt 工程和模型选择上。半年后，你精心设计的状态机可能会被新模型的能力提升彻底取代。

**不是我们设计得更好了，是模型变得更强了。**

* * *

**相关资源**：

*   [deepagents 开源项目](https://github.com/hwchase17/deepagents)
*   [Claude Code 系统 Prompt 复刻](https://github.com/kn1026/cc/blob/main/claudecode.md)
*   [LangChain 原文：Deep Agents](https://blog.langchain.com/deep-agents/)
