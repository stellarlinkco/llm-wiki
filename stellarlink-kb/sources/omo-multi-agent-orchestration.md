---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/omo-multi-agent-orchestration"
title: OmO skills：将 oh-my-opencode 的多 Agent 协同移植到 Claude Code
description: OmO skills 将 oh-my-opencode 的多 Agent 协同移植到 Claude Code
resource: "https://stellarlink.co/articles/omo-multi-agent-orchestration"
tags: []
timestamp: "2026-06-20T06:45:52.865Z"
source_path: "https://stellarlink.co/articles/omo-multi-agent-orchestration"
source_id: ef65f367d429fb56dcd3e1030de64ab5c8a011961737036bc58f8db9671d52eb
content_hash: 246eb1cc70def239eff04c7ceac1d502dea746e016d6c8d4af0b95579f9dd45f
---

## [OmO skills：将 oh-my-opencode 的多 Agent 协同移植到 Claude Code](https://stellarlink.co/articles/omo-multi-agent-orchestration#omo-skills%E5%B0%86-oh-my-opencode-%E7%9A%84%E5%A4%9A-agent-%E5%8D%8F%E5%90%8C%E7%A7%BB%E6%A4%8D%E5%88%B0-claude-code)

Oh-my-opencode 最近太火了，我让 Claude Code 学习了一下，然后我就把它的核心移植到了 Claude Code。

之前的 Codeagent 自己选择 backend 的模式总感觉缺少点灵魂，看到 OmO 的设计直接灵光一现，特定场景下的指定模型+特调prompt才能够发挥最好，于是我开始了 codeagent 的改造和 omo skills 的移植。

## [广告](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E5%B9%BF%E5%91%8A)

VibeCoding 企业实战课程正在招生，购课链接 `https://course.stellarlink.co`，现在购课送 50 元学习 Token 由 PackyAPI 赞助，不可提现，不可找零。

查看详情 [https://mp.weixin.qq.com/s/LCH\_3a07x7S2flBmm56KwQ](https://mp.weixin.qq.com/s/LCH_3a07x7S2flBmm56KwQ)

## [OmO 核心设计：Sisyphus 协调器 + 专业 Agent 团队](https://stellarlink.co/articles/omo-multi-agent-orchestration#omo-%E6%A0%B8%E5%BF%83%E8%AE%BE%E8%AE%A1sisyphus-%E5%8D%8F%E8%B0%83%E5%99%A8--%E4%B8%93%E4%B8%9A-agent-%E5%9B%A2%E9%98%9F)

### [Agent 层级](https://stellarlink.co/articles/omo-multi-agent-orchestration#agent-%E5%B1%82%E7%BA%A7)

OmO 构建了一个 6+1 人专家团队(我单独加了一个 develop agent)：

Agent

角色

后端

模型

成本

**sisyphus**

主协调器

claude

claude-sonnet-4.5

中等

**oracle**

技术顾问

claude

claude-opus-4.5

昂贵

**librarian**

外部研究

claude

claude-sonnet-4.5

中等

**explore**

代码库搜索

opencode

grok-code

**免费**

**develop**

代码实现

codex

(default)

中等

**frontend-ui-ux-engineer**

UI/UX 专家

gemini

gemini-3-pro

昂贵

**document-writer**

文档编写

gemini

gemini-3-flash

中等

### [工作流程](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%A8%8B)

```
用户请求
    ↓
/omo 调用 Sisyphus
    ↓
Intent Gate 分析任务类型
    ↓
    ├─→ 简单任务：Sisyphus 直接执行
    ├─→ 复杂任务：委派给专业 Agent
    └─→ 探索任务：并行启动多个 Agent
```

Sisyphus 通过 `codeagent-wrapper --agent <agent-name>` 来委派任务：

```
codeagent-wrapper --agent oracle - . <<'EOF'
分析这个项目的认证架构，给出改进建议
EOF
```

## [使用方法](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)

### [基础用法](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95)

```
/omo <你的任务描述>
```

### [实际案例](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E5%AE%9E%E9%99%85%E6%A1%88%E4%BE%8B)

#### [1\. 代码重构](https://stellarlink.co/articles/omo-multi-agent-orchestration#1-%E4%BB%A3%E7%A0%81%E9%87%8D%E6%9E%84)

```
/omo 帮我重构这个认证模块，提高可维护性
```

**执行流程**：

1.  Sisyphus 分析任务：需要代码探索 + 架构设计 + 实现
2.  委派 `explore` 搜索认证相关代码 (grok)
3.  委派 `oracle` 分析架构问题 (sonnet)
4.  委派 `develop` 执行重构 (codex)

#### [2\. 全栈功能开发](https://stellarlink.co/articles/omo-multi-agent-orchestration#2-%E5%85%A8%E6%A0%88%E5%8A%9F%E8%83%BD%E5%BC%80%E5%8F%91)

```
/omo 我需要添加一个支付功能，包括前端 UI 和后端 API
```

**执行流程**：

1.  Sisyphus 识别为全栈任务
2.  并行启动：
    *   `frontend-ui-ux-engineer` 设计支付界面（Gemini Pro）
    *   `develop` 实现后端 API（Codex）
3.  Sisyphus 协调两者的接口对接

#### [3\. 代码库研究](https://stellarlink.co/articles/omo-multi-agent-orchestration#3-%E4%BB%A3%E7%A0%81%E5%BA%93%E7%A0%94%E7%A9%B6)

```
/omo 这个项目使用了什么认证方案？
```

**执行流程**：

1.  Sisyphus 识别为研究任务
2.  委派 `explore` 搜索认证相关代码
3.  委派 `librarian` 查找外部文档
4.  Sisyphus 汇总结果返回

#### [4\. 文档生成](https://stellarlink.co/articles/omo-multi-agent-orchestration#4-%E6%96%87%E6%A1%A3%E7%94%9F%E6%88%90)

```
/omo 为这个 API 模块生成完整的技术文档
```

**执行流程**：

1.  `explore` 搜索 API 代码
2.  `document-writer` 生成文档（Gemini Flash，便宜快速）

## [配置](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E9%85%8D%E7%BD%AE)

Agent-模型映射在 `~/.codeagent/models.json` 中配置：

```
{
  "default_backend": "opencode",
  "default_model": "opencode/grok-code",
  "agents": {
    "sisyphus": {
      "backend": "claude",
      "model": "claude-sonnet-4-20250514",
      "yolo": true, // 开启 yolo
    },
    "oracle": {
      "backend": "claude",
      "model": "claude-opus-4-5-20251101"
    },
    "librarian": {
      "backend": "claude",
      "model": "claude-sonnet-4-5-20250514"
    },
    "explore": {
      "backend": "opencode",
      "model": "opencode/grok-code"
    },
    "develop": {
      "backend": "codex",
      "model": "gpt-5.2",
      "yolo": true, // 开启 yolo
    },
    "frontend-ui-ux-engineer": {
      "backend": "gemini",
      "model": "gemini-3-pro-preview"
    },
    "document-writer": {
      "backend": "gemini",
      "model": "gemini-3-flash-preview"
    }
  }
}
```

## [技术要求](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E6%8A%80%E6%9C%AF%E8%A6%81%E6%B1%82)

1.  **codeagent-wrapper**：需要支持 `--agent` 参数
2.  **后端 CLI**：需要安装 `codex`、`claude`、`opencode`、`gemini` 命令行工具
3.  **API 密钥**：配置对应的 API keys

## [优势](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E4%BC%98%E5%8A%BF)

### [1\. 成本低](https://stellarlink.co/articles/omo-multi-agent-orchestration#1-%E6%88%90%E6%9C%AC%E4%BD%8E)

*   代码搜索用免费的 `grok-code`
*   文档生成用便宜的 `gemini-3-flash`
*   只在关键决策时调用昂贵的 `oracle`

**实测**：相比全程使用 Claude Opus，成本降低 60-80%

### [2\. 效率高](https://stellarlink.co/articles/omo-multi-agent-orchestration#2-%E6%95%88%E7%8E%87%E9%AB%98)

*   并行执行：前端和后端同时开发
*   专业分工：UI 交给 Gemini，代码交给 Codex
*   快速探索：`explore` agent 使用轻量模型快速搜索

**实测**：复杂任务的完成时间缩短 40-50%

### [3\. 质量更好](https://stellarlink.co/articles/omo-multi-agent-orchestration#3-%E8%B4%A8%E9%87%8F%E6%9B%B4%E5%A5%BD)

*   `oracle` 提供架构审查
*   `frontend-ui-ux-engineer` 专注 UI/UX 质量
*   `develop` 专注代码实现质量

## [适用场景](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF)

场景

推荐使用 OmO

原因

全栈功能开发

✅

并行开发前后端

代码库探索

✅

免费的 explore agent

架构重构

✅

oracle 提供专业建议

文档生成

✅

便宜快速的 document-writer

简单 bug 修复

❌

直接用 Claude Code 更快

单文件修改

❌

不需要多 agent 协同

## [与 Claude Code 原生能力的对比](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E4%B8%8E-claude-code-%E5%8E%9F%E7%94%9F%E8%83%BD%E5%8A%9B%E7%9A%84%E5%AF%B9%E6%AF%94)

维度

Claude Code 原生

OmO 多 Agent

成本

固定使用 Claude

按需选择模型

并行能力

有限

原生支持

专业分工

通用模型

专业 Agent

配置复杂度

零配置

需要配置多个后端

适用场景

通用任务

复杂协同任务

## [实现原理](https://stellarlink.co/articles/omo-multi-agent-orchestration#%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86)

OmO 的核心是 **Intent Gate**：

```
# 伪代码示例
def intent_gate(task):
    if is_simple_task(task):
        return execute_directly()

    if is_exploration_task(task):
        return parallel_agents(['explore', 'librarian'])

    if is_fullstack_task(task):
        return parallel_agents(['frontend-ui-ux-engineer', 'develop'])

    if needs_architecture_review(task):
        return sequential_agents(['oracle', 'develop'])
```

Sisyphus 根据任务特征，动态决定：

1.  需要哪些 Agent
2.  是并行还是串行
3.  如何汇总结果

## [2026未来展望](https://stellarlink.co/articles/omo-multi-agent-orchestration#2026%E6%9C%AA%E6%9D%A5%E5%B1%95%E6%9C%9B)

OmO 的多 Agent 协同模式，代表了 AI 编程工具的一个方向：

1.  **异构模型协同**：不同模型擅长不同任务
2.  **成本效率平衡**：在质量和成本之间找到最优解
3.  **并行执行**：充分利用多模型的并行能力

随着更多专业模型的出现（如代码专用模型、UI 专用模型），这种协同模式的优势会更加明显。

我认为这个方向是一个趋势，让不同的模型去干适合的事。

将 oh-my-opencode 的多 Agent 协同理念移植到 Claude Code，通过 Sisyphus 协调器 + 专业 Agent 团队的架构，实现了：

*   **成本优化**：按需选择模型，降低 60-80% 成本
*   **效率提升**：并行执行，缩短 40-50% 时间
*   **质量保证**：专业分工，各司其职

对于复杂的全栈开发、架构重构、代码库探索等任务，`/omo` 是比 Claude Code 原生能力更优的选择。

今天才开发完成，估计存在一些 bug 欢迎使用有问题直接提 issue (最好是提 pr。

* * *

**开始使用**：

访问 github.com/cexll/myclaude 安装，不知道怎么安装？ 一切交给 CC

```
/omo 帮我分析这个项目的架构，并给出改进建议
```

让 Sisyphus 和他的团队为你工作。
