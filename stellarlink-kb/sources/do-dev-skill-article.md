---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/do-dev-skill-article"
title: 多工作流融合 do：多模型 Agent 编排 + Hooks Loop
description: 多工作流融合 do 多模型 Agent 编排 Hooks Loop
resource: "https://stellarlink.co/articles/do-dev-skill-article"
tags: []
timestamp: "2026-06-20T06:45:44.174Z"
source_path: "https://stellarlink.co/articles/do-dev-skill-article"
source_id: 0ed02df1b9ad9782900fc9dc8bbd96b970e592434bbd801d3fac97cae9eae80e
content_hash: 1c039e26d51e17ae9dcc6ee7944e185afc06bac1ff8f93dfb26ca2127a4f159a
---

## [多工作流融合 do：多模型 Agent 编排 + Hooks Loop](https://stellarlink.co/articles/do-dev-skill-article#%E5%A4%9A%E5%B7%A5%E4%BD%9C%E6%B5%81%E8%9E%8D%E5%90%88-do%E5%A4%9A%E6%A8%A1%E5%9E%8B-agent-%E7%BC%96%E6%8E%92--hooks-loop)

> 把 /dev、/omo、ralph-loop、/feature-dev 四套工作流融合成一个、多 Agent 并行、多模型后端的功能开发编排器。

## [TL;DR](https://stellarlink.co/articles/do-dev-skill-article#tldr)

*   **一句话启动**：`/do 实现用户登录功能`，剩下的交给 AI
*   **7 阶段完整覆盖**：Discovery → Exploration → Clarification → Architecture → Implementation → Review → Summary
*   **多 Agent 并行**：code-explorer、code-architect、code-reviewer、develop 各司其职
*   **多模型后端**：分析用 grok-code，架构用 opus4.5，代码用 gpt5.2，按任务特性分配最优模型，可以自定义配置
*   **Loop 机制保障**：Stop Hook 阻止意外退出，确保流程完整执行

```
flowchart TB
    subgraph "do 整体架构"
        User["用户: /do 任务描述"]
        Orchestrator["Claude Code 编排器"]

        subgraph Agents["codeagent-wrapper 多 Agent"]
            Explorer["code-explorer<br/>grok-code"]
            Architect["code-architect<br/>opus4.5"]
            Reviewer["code-reviewer<br/>sonnet"]
            Develop["develop<br/>gpt5.2"]
        end

        subgraph Loop["Hooks Loop 机制"]
            State[".claude/do.local.md"]
            StopHook["Stop Hook 防中断"]
        end

        User --> Orchestrator
        Orchestrator --> |"Phase 1-2"| Explorer
        Orchestrator --> |"Phase 1,3,4"| Architect
        Orchestrator --> |"Phase 5"| Develop
        Orchestrator --> |"Phase 6-7"| Reviewer
        Orchestrator <--> State
        StopHook --> |"检查状态"| State
    end
```

## [为什么做这个融合？](https://stellarlink.co/articles/do-dev-skill-article#%E4%B8%BA%E4%BB%80%E4%B9%88%E5%81%9A%E8%BF%99%E4%B8%AA%E8%9E%8D%E5%90%88)

继 /dev /omo 之后一直在思考如何将这些好用的工作流融合起来，够快够智能够好用

1.  需要 dev 的快、简单
    
2.  需要 omo 的多模型 agent 编排
    
3.  需要 ralph-loop 能够保证任务最终完成
    
4.  需要主动沟通确定方案
    

基于上面的内容我突然想到把他们全部融合在一起不就好了吗，于是就有了 do。

Do 的核心参考来源：

来源

贡献

**feature-dev**

7 阶段工作流框架 + Agent 分工 + Context Pack 模板

**dev**

需求澄清机制 + 多后端路由 + 90% 覆盖率要求

**omo**

路由优先编排 + 最小 Agent 集选择 + 编排者不写代码原则

**ralph-loop**

Stop Hook 防中断 + 状态文件持久化 + 完成信号机制

这不是重新发明轮子，而是**把四个好轮子装到一辆车上**。

```
flowchart LR
    subgraph Sources["四套工作流"]
        FD["feature-dev<br/>7阶段框架"]
        DW["dev <br/>需求澄清+多后端"]
        OMO["omo<br/>路由编排"]
        RL["ralph-loop<br/>Hooks Loop"]
    end

    FD --> Merge["融合"]
    DW --> Merge
    OMO --> Merge
    RL --> Merge
    Merge --> Result["do Skill"]
```

## [核心设计：编排者不写代码](https://stellarlink.co/articles/do-dev-skill-article#%E6%A0%B8%E5%BF%83%E8%AE%BE%E8%AE%A1%E7%BC%96%E6%8E%92%E8%80%85%E4%B8%8D%E5%86%99%E4%BB%A3%E7%A0%81)

这个设计来自 omo 的核心理念。do 的第一条铁律：

```
Claude Code 只负责编排，所有代码变更必须委托给 codeagent-wrapper 中的 Agent。
```

这不是因为 Claude Code 写不了代码，而是因为：

*   **职责分离**：编排者专注流程控制，执行者专注代码质量
*   **模型专长**：不同 Agent 可以用不同后端（Codex、Claude、Gemini）
*   **可追溯性**：每个 Agent 的输出都有独立日志和上下文

```
# 这是编排者的正确姿势
codeagent-wrapper --agent develop - . <<'EOF'
## Original User Request
/do 添加用户登录功能

## Context Pack
- Code-explorer output: [Phase 2 分析结果]
- Code-architect output: [Phase 4 架构方案]

## Current Task
实现登录功能，遵循现有模式

## Acceptance Criteria
端到端可用；测试通过；diff 最小化
EOF
```

```
flowchart LR
    subgraph Orchestrator["Claude Code 编排者"]
        O["只负责流程控制<br/>不写代码"]
    end

    subgraph Executor["codeagent-wrapper 执行者"]
        E1["code-explorer"]
        E2["code-architect"]
        E3["code-reviewer"]
        E4["develop"]
    end

    O --> |"委托任务 + Context Pack"| E1
    O --> |"委托任务 + Context Pack"| E2
    O --> |"委托任务 + Context Pack"| E3
    O --> |"委托任务 + Context Pack"| E4
    E1 --> |"返回结果"| O
    E2 --> |"返回结果"| O
    E3 --> |"返回结果"| O
    E4 --> |"返回结果"| O
```

## [7 阶段工作流详解](https://stellarlink.co/articles/do-dev-skill-article#7-%E9%98%B6%E6%AE%B5%E5%B7%A5%E4%BD%9C%E6%B5%81%E8%AF%A6%E8%A7%A3)

### [Phase 1: Discovery - 理解需求](https://stellarlink.co/articles/do-dev-skill-article#phase-1-discovery---%E7%90%86%E8%A7%A3%E9%9C%80%E6%B1%82)

**目标**：搞清楚要做什么。

不是直接开干，而是先用 `AskUserQuestion` 问清楚：

*   用户可见的行为是什么？
*   范围边界在哪？
*   验收标准是什么？

然后调用 `code-architect` 生成需求清单和澄清问题。

```
codeagent-wrapper --agent code-architect - . <<'EOF'
## Current Task
Produce requirements checklist and identify missing information.
Output: Requirements, Non-goals, Risks, Acceptance criteria, Questions (<= 10)

## Acceptance Criteria
Concrete, testable checklist; specific questions; no implementation.
EOF
```

### [Phase 2: Exploration - 探索代码库](https://stellarlink.co/articles/do-dev-skill-article#phase-2-exploration---%E6%8E%A2%E7%B4%A2%E4%BB%A3%E7%A0%81%E5%BA%93)

**目标**：搞清楚现有代码怎么写的。

这里体现了 **并行优先** 原则——三个 `code-explorer` 任务同时跑：

```
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: p2_similar_features
agent: code-explorer
workdir: .
---CONTENT---
Find 1-3 similar features, trace end-to-end.
Return: key files with line numbers, call flow, extension points.

---TASK---
id: p2_architecture
agent: code-explorer
workdir: .
---CONTENT---
Map architecture for relevant subsystem.
Return: module map + 5-10 key files.

---TASK---
id: p2_conventions
agent: code-explorer
workdir: .
---CONTENT---
Identify testing patterns, conventions, config.
Return: test commands + file locations.
EOF
```

三个探索任务并行执行，结果合并后传递给下一阶段。

```
flowchart LR
    subgraph Parallel["Phase 2: 并行探索"]
        direction TB
        P1["p2_similar_features<br/>找相似功能"]
        P2["p2_architecture<br/>映射架构"]
        P3["p2_conventions<br/>识别规范"]
    end

    Start["Phase 1 完成"] --> P1 & P2 & P3
    P1 & P2 & P3 --> Merge["合并结果"]
    Merge --> Next["Phase 3: Clarification"]
```

### [Phase 3: Clarification - 澄清疑问（强制阶段）](https://stellarlink.co/articles/do-dev-skill-article#phase-3-clarification---%E6%BE%84%E6%B8%85%E7%96%91%E9%97%AE%E5%BC%BA%E5%88%B6%E9%98%B6%E6%AE%B5)

**目标**：解决所有模糊点。

这是 **不可跳过** 的阶段。Phase 1 和 Phase 2 的输出汇总后，让 `code-architect` 生成优先级排序的问题列表，然后用 `AskUserQuestion` 逐一确认。

```
## 澄清问题

1. 登录失败时，错误信息是否需要区分"用户不存在"和"密码错误"？
2. 是否需要支持"记住我"功能？
3. 密码重置流程是否在本次范围内？
```

**不回答不进入下一阶段**。这是从 ralph-loop 学来的——宁可多问，不要猜错。

### [Phase 4: Architecture - 设计方案](https://stellarlink.co/articles/do-dev-skill-article#phase-4-architecture---%E8%AE%BE%E8%AE%A1%E6%96%B9%E6%A1%88)

**目标**：确定怎么实现。

同样是并行模式——两个 `code-architect` 同时工作，提出两种方案：

方案

特点

**minimal-change**

复用现有抽象，最小化新文件

**pragmatic-clean**

引入测试友好的接缝，更好的可维护性

```
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: p4_minimal
agent: code-architect
workdir: .
---CONTENT---
Propose minimal-change architecture: reuse existing abstractions.
Output: file touch list, risks, edge cases.

---TASK---
id: p4_pragmatic
agent: code-architect
workdir: .
---CONTENT---
Propose pragmatic-clean architecture: introduce seams for testability.
Output: file touch list, testing plan, risks.
EOF
```

用户选择后，进入实现阶段。

```
flowchart TB
    subgraph Options["Phase 4: 两种架构方案"]
        direction LR
        A["minimal-change<br/>复用现有抽象<br/>最小化新文件<br/>风险低"]
        B["pragmatic-clean<br/>引入测试接缝<br/>更好可维护性<br/>更多改动"]
    end

    Explore["Phase 2 探索结果"] --> A & B
    A & B --> User["用户选择"]
    User --> Impl["Phase 5: Implementation"]
```

### [Phase 5: Implementation - 实现（需审批）](https://stellarlink.co/articles/do-dev-skill-article#phase-5-implementation---%E5%AE%9E%E7%8E%B0%E9%9C%80%E5%AE%A1%E6%89%B9)

**目标**：把代码写出来。

这个阶段有个 **显式审批门**：

```
用 AskUserQuestion 确认：
"Approve starting implementation?"
- Approve
- Not yet
```

批准后，调用 `develop` Agent 执行：

```
codeagent-wrapper --agent develop - . <<'EOF'
## Context Pack
- Code-explorer output: [Phase 2 全部输出]
- Code-architect output: [Phase 4 选定方案 + Phase 3 答案]

## Current Task
Implement with minimal change set following chosen architecture.
- Follow Phase 2 patterns
- Add/adjust tests per Phase 4 plan
- Run narrowest relevant tests

## Acceptance Criteria
Feature works end-to-end; tests pass; diff is minimal.
EOF
```

### [Phase 6: Review - 代码审查](https://stellarlink.co/articles/do-dev-skill-article#phase-6-review---%E4%BB%A3%E7%A0%81%E5%AE%A1%E6%9F%A5)

**目标**：抓 bug、砍复杂度。

两个 `code-reviewer` 并行工作：

审查者

关注点

**correctness**

正确性、边界情况、失败模式

**simplicity**

KISS 原则、消除冗余抽象

```
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: p6_correctness
agent: code-reviewer
workdir: .
---CONTENT---
Review for correctness, edge cases, failure modes.
Assume adversarial inputs.

---TASK---
id: p6_simplicity
agent: code-reviewer
workdir: .
---CONTENT---
Review for KISS: remove bloat, collapse needless abstractions.
EOF
```

审查结果出来后，用户决定：

*   Fix now（现在修）
*   Fix later（以后修）
*   Proceed as-is（直接过）

### [Phase 7: Summary - 总结文档](https://stellarlink.co/articles/do-dev-skill-article#phase-7-summary---%E6%80%BB%E7%BB%93%E6%96%87%E6%A1%A3)

**目标**：记录做了什么。

最后一个 `code-reviewer` 调用，生成完成报告：

*   做了什么
*   关键决策和取舍
*   修改的文件路径
*   验证命令
*   后续工作（可选）

完成后输出完成信号：

```
<promise>DO_COMPLETE</promise>
```

```
flowchart LR
    P1["Phase 1<br/>Discovery<br/>理解需求"]
    P2["Phase 2<br/>Exploration<br/>探索代码库"]
    P3["Phase 3<br/>Clarification<br/>澄清疑问"]
    P4["Phase 4<br/>Architecture<br/>设计方案"]
    P5["Phase 5<br/>Implementation<br/>实现代码"]
    P6["Phase 6<br/>Review<br/>代码审查"]
    P7["Phase 7<br/>Summary<br/>总结文档"]

    P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7
    P7 --> Done["✓ FEATURE_COMPLETE"]
```

## [多模型后端：按任务选模型](https://stellarlink.co/articles/do-dev-skill-article#%E5%A4%9A%E6%A8%A1%E5%9E%8B%E5%90%8E%E7%AB%AF%E6%8C%89%E4%BB%BB%E5%8A%A1%E9%80%89%E6%A8%A1%E5%9E%8B)

codeagent-wrapper 支持为不同 Agent 配置不同后端。在 `~/.codeagent/models.json` 中：

```
{
  "agents": {
    "code-explorer": {
      "backend": "opencode",
      "model": "opencode/grok-code",
      "description": "快速代码分析"
    },
    "code-architect": {
      "backend": "claude",
      "model": "claude-opus-4-5-20251101",
      "description": "深度架构设计"
    },
    "code-reviewer": {
      "backend": "claude",
      "model": "claude-sonnet-4-5-20250929",
      "description": "代码审查"
    },
    "develop": {
      "backend": "codex",
      "model": "gpt-5.2",
      "description": "代码实现"
    }
  }
}
```

**为什么这样分配？**

Agent

推荐后端

原因

code-explorer

grok-code

快速遍历、代价低

code-architect

opus4.5

需要深度思考、权衡取舍

code-reviewer

sonnet

平衡速度和质量

develop

gpt-5.2

代码生成能力强、执行稳定

```
flowchart TB
    subgraph Config["~/.codeagent/models.json"]
        direction LR
        CE["code-explorer<br/>→ grok-code"]
        CA["code-architect<br/>→ opus4.5"]
        CR["code-reviewer<br/>→ sonnet"]
        DV["develop<br/>→ gpt5.2"]
    end

    subgraph Backends["可用后端"]
        Codex["codex"]
        Claude["claude"]
        Gemini["gemini"]
        Opencode["opencode"]
    end

    CE -.-> Opencode
    CA -.-> Claude
    CR -.-> Claude
    DV -.-> Codex
```

## [Loop 机制：防止中途退出](https://stellarlink.co/articles/do-dev-skill-article#loop-%E6%9C%BA%E5%88%B6%E9%98%B2%E6%AD%A2%E4%B8%AD%E9%80%94%E9%80%80%E5%87%BA)

这是从 ralph-loop 借鉴的核心机制。

### [状态文件](https://stellarlink.co/articles/do-dev-skill-article#%E7%8A%B6%E6%80%81%E6%96%87%E4%BB%B6)

每次 `/do` 启动时，创建 `.claude/do.local.md`：

```
---
active: true
current_phase: 1
phase_name: "Discovery"
max_phases: 7
completion_promise: "<promise>DO_COMPLETE</promise>"
---
```

每完成一个阶段，更新 `current_phase` 和 `phase_name`。

### [Stop Hook](https://stellarlink.co/articles/do-dev-skill-article#stop-hook)

安装后会注册 Stop Hook。当 Claude 尝试退出时：

```
# hooks/stop-hook.sh 核心逻辑
if [ "$phases_done" -eq 0 ]; then
  reason="feature-dev 循环未完成：当前阶段 ${current_phase}/${max_phases}..."
  printf '{"decision":"block","reason":"%s"}\n' "$reason"
fi
```

如果还没完成，Hook 会 **阻止退出** 并提示继续执行。

**强制退出方式**：将状态文件中 `active` 设为 `false`。

```
stateDiagram-v2
    [*] --> Phase1 : /do 启动

    Phase1 --> Phase2 : current_phase=2
    Phase2 --> Phase3 : current_phase=3
    Phase3 --> Phase4 : current_phase=4
    Phase4 --> Phase5 : current_phase=5
    Phase5 --> Phase6 : current_phase=6
    Phase6 --> Phase7 : current_phase=7

    Phase7 --> Complete : 输出 FEATURE_COMPLETE
    Complete --> [*]

    state "尝试优雅退出？" as TryStop <<choice>>

    Phase1 --> TryStop : 尝试退出
    Phase2 --> TryStop : 尝试退出
    Phase3 --> TryStop : 尝试退出
    Phase4 --> TryStop : 尝试退出
    Phase5 --> TryStop : 尝试退出
    Phase6 --> TryStop : 尝试退出

    TryStop --> Phase1 : 否<br/>(钩子阻止 / 留在当前阶段)
    TryStop --> Complete : 是<br/>(允许退出 / 跳过剩余阶段)

```

## [安装与使用](https://stellarlink.co/articles/do-dev-skill-article#%E5%AE%89%E8%A3%85%E4%B8%8E%E4%BD%BF%E7%94%A8)

### [前置条件](https://stellarlink.co/articles/do-dev-skill-article#%E5%89%8D%E7%BD%AE%E6%9D%A1%E4%BB%B6)

1.  安装 codeagent-wrapper：
    
    ```
    git clone https://github.com/cexll/myclaude.git
    bash ./install.sh
    ```
    
2.  配置至少一个后端 CLI：
    
    *   `codex`（OpenAI Codex CLI）
    *   `claude`（Claude Code CLI）
    *   `gemini`（Gemini CLI）

### [安装 Skill](https://stellarlink.co/articles/do-dev-skill-article#%E5%AE%89%E8%A3%85-skill)

```
python install.py --module do
```

安装内容：

*   `~/.claude/skills/do/` - Skill 文件
*   Hooks 自动合并到 `~/.claude/settings.json`

### [使用](https://stellarlink.co/articles/do-dev-skill-article#%E4%BD%BF%E7%94%A8)

```
# 在 Claude Code 中
/do 添加用户登录功能
/do 实现订单导出 CSV
/do feature-prd.md
```

### [卸载](https://stellarlink.co/articles/do-dev-skill-article#%E5%8D%B8%E8%BD%BD)

```
python install.py --uninstall --module do
```

## [自定义 Agent Prompt](https://stellarlink.co/articles/do-dev-skill-article#%E8%87%AA%E5%AE%9A%E4%B9%89-agent-prompt)

Agent 提示词位于 `~/.claude/skills/do/agents/` 目录：

*   `code-explorer.md` - 代码追踪、架构映射
*   `code-architect.md` - 方案设计、文件规划
*   `code-reviewer.md` - 代码审查、简化建议

如需自定义，在 `~/.codeagent/agents/` 创建同名文件覆盖。

```
flowchart TB
    subgraph Default["默认 Agent 配置"]
        D1["~/.claude/skills/do/agents/"]
        D2["code-explorer.md"]
        D3["code-architect.md"]
        D4["code-reviewer.md"]
    end

    subgraph Custom["自定义覆盖"]
        C1["~/.codeagent/agents/"]
        C2["同名文件覆盖"]
    end

    D1 --> D2 & D3 & D4
    C1 --> C2
    C2 -.-> |"优先级更高"| D2
```

## [总结](https://stellarlink.co/articles/do-dev-skill-article#%E6%80%BB%E7%BB%93)

do 是**四套工作流的合体**：

*   **feature-dev** 的 7 阶段框架和 Agent 分工
*   **dev** 的需求澄清和多后端路由
*   **omo** 的智能路由和编排者不写代码原则
*   **ralph-loop** 的状态持久化和防中断机制

加上 codeagent-wrapper 的多后端支持，你可以：

1.  用一条命令启动完整的功能开发流程
2.  让不同模型各展所长
3.  通过并行执行提升效率
4.  借助 Loop 机制确保流程完整

我做的工作就是把这些优秀的设计拼到一起，形成一套**可复制的 AI 编排方法论**。

* * *

这篇文章展示了 do 的设计思路，但如果你想：

*   深入理解 Claude Code Skill 的完整机制
*   学会设计多 Agent 编排工作流
*   掌握 codeagent-wrapper 的高级用法
*   构建适合你团队的定制化开发流程

欢迎关注 **VibeCoding 企业课程**。

我们会手把手教你：

*   Claude Code Skill 从零到一
*   多模型后端配置与调优
*   Stop Hook 和状态机设计
*   真实项目中的 AI 工程实践

\[图片占位：VibeCoding 课程宣传图 - 需要实际图片\]

**扫码添加小助理微信**
