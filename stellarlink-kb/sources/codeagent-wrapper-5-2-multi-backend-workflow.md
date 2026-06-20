---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow"
title: 组建你的 AI 开发团队：Claude 澄清需求 + Gemini 设计原型 + Codex 并行编码
description: 3 个 AI Agent 同时给你打工！Claude 负责需求分析，Gemini 生成设计稿，Codex 并行写代码，一条命令启动端到端开发工作流。实战演示：从一句话需求到 90% 测试覆盖率的生产代码，效率提升 3-5 倍。基于 4.0 工作流的多 Agent 协作实践。
resource: "https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow"
tags: []
timestamp: "2026-06-20T06:45:42.688Z"
source_path: "https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow"
source_id: a54f3dd6bd43883853f6a2fc9b2b2ac001c21089430e314276e25509eb8c2e65
content_hash: cb7c3e062f03cdfaad0e7a2cb926798932482268263eb77ec6b5a59fece72f9f
---

## [TLDR](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#tldr)

不用再单打独斗了！通过 4.0 工作流的多 Agent 协作系统（基于 codeagent-wrapper），你可以组建一支 3 人 AI 开发团队：**Claude 作为产品经理**（澄清需求、生成 PRD）→ **Gemini 作为设计师**（生成原型设计）→ **Codex 作为工程师**（并行编码、测试）。一条 `/dev` 命令，启动端到端自动化开发工作流。

**核心亮点**：

*   **3 个 AI Agent 协作开发**：Claude (需求) + Gemini (设计) + Codex (编码)
*   **Skills 自动激活**：说”我需要 PRD”自动触发 Claude，说”生成原型”自动触发 Gemini
*   **并行执行**：后端、前端、测试同时开发，效率提升 3-5 倍
*   **强制质量保证**：90% 测试覆盖率，标准化交付
*   **配置时间**：5 分钟即可启动你的 AI 团队

* * *

## [为什么选择 4.0 工作流](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%80%89%E6%8B%A9-40-%E5%B7%A5%E4%BD%9C%E6%B5%81)

### [工作流演进历史](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E5%B7%A5%E4%BD%9C%E6%B5%81%E6%BC%94%E8%BF%9B%E5%8E%86%E5%8F%B2)

从单后端到多 Agent 协作，AI 开发工作流经历了四代演进：

**1.0 工作流（MCP Server）**：

*   形态：单一 Codex 后端 + MCP 协议
*   问题：上下文消耗高、长时间运行不稳定
*   适用：简单任务、单次调用

**2.0 工作流（Skills）**：

*   形态：Skills 系统 + 直接脚本调用
*   改进：渐进式加载、启动速度提升 5 倍
*   问题：手动规划任务、缺乏标准化流程

**3.0 工作流（Dev Workflow）**：

*   形态：`/dev` 命令 + 单一后端
*   改进：自动化任务规划、强制测试覆盖率
*   问题：单一后端限制、无法根据任务类型优化

**4.0 工作流（Multi-Agent）**（⭐ 当前版本）：

*   形态：多 Agent 协作 + Skills 自动激活 + 并行执行
*   突破：**Claude（需求）+ Gemini（设计）+ Codex（编码）协作**
*   技术：基于 codeagent-wrapper 5.2 实现
*   优势：端到端自动化、成本优化、质量保证

### [从单后端到端到端工作流的演进](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E4%BB%8E%E5%8D%95%E5%90%8E%E7%AB%AF%E5%88%B0%E7%AB%AF%E5%88%B0%E7%AB%AF%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%9A%84%E6%BC%94%E8%BF%9B)

**传统方案（codex-wrapper）**：

*   局限：仅支持 Codex（OpenAI）
*   问题：无法根据任务类型选择最优模型
*   流程：手动需求分析 → 手动拆分任务 → 串行开发 → 手动测试
*   适用：简单场景、单一技术栈

**4.0 工作流（codeagent-wrapper + Skills System）**：

*   突破：支持 Codex、Claude、Gemini 三种后端
*   优势：自动化端到端工作流、智能后端分配、并行执行
*   流程：**Claude 澄清需求** → **Gemini 设计原型** → **Codex/Gemini 并行开发** → **自动测试验证**
*   适用：生产级开发、复杂功能开发、团队协作

### [4.0 工作流的七大核心能力](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#40-%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%9A%84%E4%B8%83%E5%A4%A7%E6%A0%B8%E5%BF%83%E8%83%BD%E5%8A%9B)

#### [1\. Skills 自动激活系统（🆕 4.0 核心特性）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#1-skills-%E8%87%AA%E5%8A%A8%E6%BF%80%E6%B4%BB%E7%B3%BB%E7%BB%9F-40-%E6%A0%B8%E5%BF%83%E7%89%B9%E6%80%A7)

**三大核心 Skills**：

Skill

后端

功能

自动激活关键词

`product-requirements`

Claude

交互式需求澄清、PRD 生成

requirements, PRD, feature spec, 需求

`prototype-prompt-generator`

Gemini

UI/UX 原型设计 prompt

prototype, design, UI, mockup, 原型

`codeagent`

Codex/Claude/Gemini

多后端代码执行

通过 `/dev` 命令或手动调用

**自动激活机制**：

当用户输入包含特定关键词时，Claude Code 通过 `skill-rules.json` 自动匹配并激活对应 skill：

```
{
  "product-requirements": {
    "patterns": ["requirements?", "PRD", "product spec", "feature spec", "需求"],
    "trigger": "auto",
    "backend": "claude"
  },
  "prototype-prompt-generator": {
    "patterns": ["prototype", "design", "UI", "mockup", "wireframe", "原型"],
    "trigger": "auto",
    "backend": "gemini"
  }
}
```

**优势**：

*   零学习成本：用户无需记忆命令，自然语言即可触发
*   智能路由：根据任务类型自动选择最优后端
*   无缝集成：与 `/dev` 命令配合，形成完整工作流

#### [2\. 多后端支持](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#2-%E5%A4%9A%E5%90%8E%E7%AB%AF%E6%94%AF%E6%8C%81)

**支持的 AI 后端**：

后端

模型

优势

适用场景

Codex

GPT5.2

代码生成质量最高

复杂重构、架构设计

Claude

Sonnet 4.5 / Opus 4.5

代码理解强

需求分析、代码审查

Gemini

Gemini 3 Pro

多模态能力强

快速原型、文档生成

**后端选择策略**：

```
# 全局指定后端（所有任务使用同一后端）
codeagent-wrapper --backend claude "分析代码库架构"

# 任务级后端选择（不同任务使用不同后端）
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: analysis
backend: claude       # 使用 Claude 做分析
---CONTENT---
分析代码库架构和依赖关系

---TASK---
id: implementation
backend: codex        # 使用 Codex 做实现
dependencies: analysis
---CONTENT---
根据分析结果实现功能
EOF
```

#### [2\. 统一的 API 接口](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#2-%E7%BB%9F%E4%B8%80%E7%9A%84-api-%E6%8E%A5%E5%8F%A3)

**所有模式统一调用**：

```
# 单任务模式
codeagent-wrapper --backend claude "任务描述"

# 从 stdin 读取（支持长文本）
codeagent-wrapper --backend gemini - <<'EOF'
多行任务描述
EOF

# 恢复会话
codeagent-wrapper --backend codex resume <session_id> "继续任务"

# 并行执行
codeagent-wrapper --parallel <<'EOF'
---TASK---
...
EOF
```

#### [3\. 灵活的并发控制](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#3-%E7%81%B5%E6%B4%BB%E7%9A%84%E5%B9%B6%E5%8F%91%E6%8E%A7%E5%88%B6)

**环境变量配置**：

```
# 限制并发任务数（推荐：8）
export CODEAGENT_MAX_PARALLEL_WORKERS=8

# 自定义超时（默认 2 小时）
export CODEX_TIMEOUT=3600000  # 1 小时
```

**并发策略**：

*   独立任务：同一层并行执行
*   依赖任务：按拓扑排序串行
*   失败处理：失败任务阻塞所有依赖它的任务

#### [4\. 智能的权限管理](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#4-%E6%99%BA%E8%83%BD%E7%9A%84%E6%9D%83%E9%99%90%E7%AE%A1%E7%90%86)

**Claude 后端**：

*   默认：`--dangerously-skip-permissions`（自动化友好）
*   禁用：`export CODEAGENT_SKIP_PERMISSIONS=true`

**Codex/Gemini 后端**：

*   默认：启用权限检查
*   跳过：`export CODEAGENT_SKIP_PERMISSIONS=true`

#### [5\. Session 管理](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#5-session-%E7%AE%A1%E7%90%86)

**Session ID 格式**：

```
thread_xxxxx  (Codex)
019a7247-...  (Claude/Gemini)
```

**恢复会话**：

```
# 恢复之前的会话继续工作
codeagent-wrapper resume thread_abc123 "继续实现剩余功能"

# 指定后端恢复
codeagent-wrapper --backend claude resume 019a7247-... "优化代码"
```

#### [6\. 高测试覆盖率推荐](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#6-%E9%AB%98%E6%B5%8B%E8%AF%95%E8%A6%86%E7%9B%96%E7%8E%87%E6%8E%A8%E8%8D%90)

每个任务推荐：

*   实现功能代码
*   编写单元测试（90% 覆盖率目标）
*   运行测试并报告覆盖率
*   修复失败的测试

* * *

## [环境配置：从零到生产](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE%E4%BB%8E%E9%9B%B6%E5%88%B0%E7%94%9F%E4%BA%A7)

### [前置要求](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E5%89%8D%E7%BD%AE%E8%A6%81%E6%B1%82)

**操作系统**：

*   macOS / Linux：原生支持
*   Windows：推荐 PowerShell + install.bat（一键安装），或使用 WSL1

**Windows 用户推荐方案**：

1.  **PowerShell + install.bat**（推荐）：
    
    *   原生支持，无需虚拟化
    *   一键安装脚本，配置简单
    *   直接访问 Windows 文件系统
2.  **WSL1**（备选）：
    
    *   内存占用低（400-500MB，WSL2 需要 2-4GB）
    *   文件性能好（直接访问 `/mnt/d/workspace`）
    *   兼容性强（除 C++ 编译外无已知问题）

**必需工具**：

*   Python 3.8+
*   Git
*   Go 1.21+（编译 codeagent-wrapper）
*   AI CLI 工具（根据选择的后端）：
    *   `codex`（如果使用 Codex）
    *   `claude`（如果使用 Claude）
    *   `gemini`（如果使用 Gemini）

### [第一步：安装 codeagent-wrapper](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E7%AC%AC%E4%B8%80%E6%AD%A5%E5%AE%89%E8%A3%85-codeagent-wrapper)

**方式 1：一键安装脚本**（推荐）：

**macOS / Linux**：

```
# 克隆仓库
git clone https://github.com/cexll/myclaude.git ~/myclaude
cd ~/myclaude

# 执行安装脚本
python3 install.py --module dev

# 安装过程：
# [1/5] 检查依赖（uv, codex）
# [2/5] 安装 codex-wrapper
# [3/5] 配置 Claude Code Skills
# [4/5] 安装 dev-workflow 命令
# [5/5] 验证安装
```

**Windows PowerShell**：

```
# 克隆仓库
git clone https://github.com/cexll/myclaude.git $HOME\myclaude
cd $HOME\myclaude

# 执行安装脚本
.\install.bat

# 脚本会自动：
# - 检查 Python 和 Git
# - 安装 codeagent-wrapper
# - 配置 Claude Code Skills
# - 安装 /dev 命令
# - 验证安装
```

**方式 2：从源码安装**：

```
# 克隆仓库
git clone https://github.com/cexll/myclaude.git ~/myclaude
cd ~/myclaude

# 编译 codeagent-wrapper（需要 Go 1.21+）
cd skills/codex
go build -o codeagent-wrapper main.go

# 移动到 PATH
sudo mv codeagent-wrapper /usr/local/bin/

# 验证安装
codeagent-wrapper --version
```

**方式 3：使用预编译二进制**：

```
# 从 GitHub Releases 下载
curl -L https://github.com/cexll/myclaude/releases/latest/download/codeagent-wrapper-$(uname -s)-$(uname -m) -o codeagent-wrapper

# 添加执行权限
chmod +x codeagent-wrapper

# 移动到 PATH
sudo mv codeagent-wrapper /usr/local/bin/
```

### [第二步：配置 AI 后端](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E7%AC%AC%E4%BA%8C%E6%AD%A5%E9%85%8D%E7%BD%AE-ai-%E5%90%8E%E7%AB%AF)

#### [2.1 配置 Codex（OpenAI）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#21-%E9%85%8D%E7%BD%AE-codexopenai)

**安装 Codex CLI**：

```
uv tool install codex
```

**配置 `~/.codex/config.yaml`**：

```
model = "gpt-5.2"
model_reasoning_effort = "xhigh"          
model_reasoning_summary = "detailed"
approval_policy = "never"                # 自动执行
sandbox_mode = "workspace-write"         # 允许写入
disable_response_storage = true
network_access = true
```

**设置 API Key**：

```
export OPENAI_API_KEY="your-openai-api-key"
```

#### [2.2 配置 Claude（Anthropic）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#22-%E9%85%8D%E7%BD%AE-claudeanthropic)

**安装 Claude Code CLI**：

```
# 下载安装
curl -L https://claude.ai/cli/install.sh | sh
```

**权限说明**：

codeagent-wrapper 对 Claude 默认使用 `--dangerously-skip-permissions`，因为：

*   自动化工作流无法处理交互式确认
*   所有操作在沙盒环境执行（安全）
*   如需启用权限检查：`export CODEAGENT_SKIP_PERMISSIONS=true`

**设置 API Key**：

```
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

#### [2.3 配置 Gemini（Google）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#23-%E9%85%8D%E7%BD%AE-geminigoogle)

**安装 Gemini CLI**：

```
pip install google-generativeai
```

**设置 API Key**：

```
export GOOGLE_API_KEY="your-google-api-key"
```

### [第三步：配置 Claude Code（推荐）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E7%AC%AC%E4%B8%89%E6%AD%A5%E9%85%8D%E7%BD%AE-claude-code%E6%8E%A8%E8%8D%90)

如果使用 Claude Code 作为主编排工具：

**安装 codeagent skill**：

```
git clone https://github.com/cexll/myclaude && cd myclaude
bash install.sh
```

**Parallel tasks**:

```
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: task1
backend: codex
---CONTENT---
task content
EOF
```

## [Backends](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#backends)

Backend

Command

Description

codex

`--backend codex`

OpenAI Codex (default)

claude

`--backend claude`

Anthropic Claude

gemini

`--backend gemini`

Google Gemini

EOF

````
### 第四步：验证安装

```bash
# 测试 Codex 后端
codeagent-wrapper --backend codex "print('Hello from Codex')"

# 测试 Claude 后端
codeagent-wrapper --backend claude "分析当前目录结构"

# 测试 Gemini 后端
codeagent-wrapper --backend gemini "生成一个简单的 README"
````

* * *

## [4.0 工作流的杀手级特性：端到端工作流](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#40-%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%9A%84%E6%9D%80%E6%89%8B%E7%BA%A7%E7%89%B9%E6%80%A7%E7%AB%AF%E5%88%B0%E7%AB%AF%E5%B7%A5%E4%BD%9C%E6%B5%81)

### [Skills System 介绍](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#skills-system-%E4%BB%8B%E7%BB%8D)

4.0 工作流引入了三个核心 Skills，实现从需求到交付的完整自动化：

Skill

后端

功能

触发方式

`product-requirements`

Claude

需求澄清和 PRD 生成

自动激活（关键词：requirements, PRD, feature spec）

`prototype-prompt-generator`

Gemini

UI/UX 原型设计

自动激活（关键词：prototype, design, UI）

`codeagent`

Codex/Claude/Gemini

多后端代码执行

手动调用或通过 `/dev` 命令

**自动激活机制**：

Skills 通过 `skill-rules.json` 配置关键词匹配规则，当用户输入包含特定关键词时，Claude Code 自动激活对应的 skill：

```
{
  "product-requirements": {
    "patterns": ["requirements?", "PRD", "product spec", "feature spec"],
    "trigger": "auto"
  },
  "prototype-prompt-generator": {
    "patterns": ["prototype", "design", "UI", "mockup", "wireframe"],
    "trigger": "auto"
  }
}
```

### [完整的端到端工作流演示](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E5%AE%8C%E6%95%B4%E7%9A%84%E7%AB%AF%E5%88%B0%E7%AB%AF%E5%B7%A5%E4%BD%9C%E6%B5%81%E6%BC%94%E7%A4%BA)

**场景**：开发一个社交媒体应用的”用户个人主页”功能

#### [阶段 1：需求澄清（Claude + product-requirements skill）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%98%B6%E6%AE%B5-1%E9%9C%80%E6%B1%82%E6%BE%84%E6%B8%85claude--product-requirements-skill)

```
# 用户输入（在 Claude Code 中）
"我需要为社交媒体应用创建用户个人主页功能的 PRD"

# product-requirements skill 自动激活
# Claude 通过交互式问答澄清需求：

Q1: 目标用户群体？
  - 普通用户
  - 创作者/KOL
  - 企业账号

Q2: 核心功能优先级？
  - 个人信息展示（高）
  - 内容时间线（高）
  - 关注/粉丝列表（中）
  - 数据统计（低）

Q3: 技术约束？
  - 响应式设计（移动端优先）
  - SEO 优化需求
  - 性能指标（LCP < 2.5s）
```

**输出**：生成结构化 PRD 文档（`.claude/specs/user-profile/requirements.md`）

```
# 用户个人主页功能需求文档

## 1. 功能概述
为社交媒体应用提供用户个人主页，展示用户信息、发布内容、社交关系。

## 2. 用户故事
- 作为普通用户，我希望查看自己和他人的个人主页，了解用户信息和内容
- 作为创作者，我希望个人主页能吸引粉丝，展示我的创作内容
- 作为访客，我希望快速了解用户的关键信息和热门内容

## 3. 核心功能
### 3.1 个人信息展示（优先级：高）
- 头像、用户名、简介
- 认证标识（如创作者认证）
- 社交数据（粉丝数、关注数、获赞数）

### 3.2 内容时间线（优先级：高）
- 按时间倒序展示用户发布的内容
- 支持筛选（全部/图片/视频）
- 无限滚动加载

### 3.3 关注/粉丝列表（优先级：中）
- 展示关注和粉丝列表
- 支持搜索和筛选

## 4. 技术要求
- 响应式设计（移动端优先）
- SEO 优化（SSR/SSG）
- 性能指标：LCP < 2.5s, FID < 100ms
- 可访问性：WCAG 2.1 AA 标准

## 5. 验收标准
- [ ] 个人主页加载时间 < 2 秒
- [ ] 移动端和桌面端体验一致
- [ ] SEO 友好（meta tags、结构化数据）
- [ ] 测试覆盖率 ≥ 90%
```

#### [阶段 2：原型设计（Gemini + prototype-prompt-generator skill）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%98%B6%E6%AE%B5-2%E5%8E%9F%E5%9E%8B%E8%AE%BE%E8%AE%A1gemini--prototype-prompt-generator-skill)

```
# 用户输入（在 Claude Code 中）
"基于 PRD 生成用户个人主页的原型设计 prompt"

# prototype-prompt-generator skill 自动激活
# Gemini 生成详细的设计 prompt
```

**输出**：生成原型设计 prompt（`.claude/specs/user-profile/prototype-prompt.md`）

```
# 用户个人主页原型设计 Prompt

## Design System
- **平台**: 移动端优先（响应式）
- **风格**: 现代简约、社交媒体风格
- **设计系统**: Material Design 3.0
- **主色调**: #1DA1F2（蓝色，类似 Twitter）
- **字体**: Roboto（英文）、Noto Sans SC（中文）

## 页面结构

### 1. Header 区域
**组件**: Profile Header
- 背景图（16:9，可自定义）
- 头像（圆形，120x120px，左下角覆盖在背景图上）
- 用户名（24px，粗体）
- 用户 ID（@username，16px，灰色）
- 认证标识（蓝V，显示在用户名右侧）
- 简介（16px，最多 160 字符，可展开）
- 社交数据（水平排列）：
  - 关注数 | 粉丝数 | 获赞数
  - 可点击查看详情

### 2. Action Bar
**组件**: Profile Actions
- 关注/已关注按钮（主按钮，蓝色）
- 消息按钮（次要按钮，灰色描边）
- 更多操作（...菜单）

### 3. Tab Navigation
**组件**: Material Tabs
- 标签：全部 | 图片 | 视频
- 选中状态：底部蓝色下划线

### 4. Content Feed
**组件**: Post Card List
- 每个 Post Card 包含：
  - 用户头像（40x40px，圆形）
  - 用户名 + 发布时间
  - 内容文本（最多 3 行，超出显示"展开"）
  - 媒体内容（图片/视频预览）
  - 互动数据（点赞、评论、分享）
- 无限滚动加载

### 5. Empty State
**组件**: Empty State Illustration
- 插画：空空的个人主页图标
- 文案："该用户还没有发布内容"
- 如果是自己的主页："发布你的第一条内容吧！"+ CTA 按钮

## 交互规范

### 手势交互
- 下拉刷新（Pull to Refresh）
- 向上滚动加载更多
- 点击头像：查看大图
- 长按 Post Card：显示快捷操作菜单

### 动画效果
- Tab 切换：滑动动画（Material Motion）
- 内容加载：骨架屏（Skeleton）
- 关注按钮：点击后缩放动画 + 状态变化

## 响应式断点
- 移动端：< 768px（单列布局）
- 平板：768px - 1024px（单列布局，增大间距）
- 桌面端：> 1024px（居中布局，最大宽度 600px）

## 可访问性
- 所有交互元素支持键盘导航
- 图片提供 alt 文本
- 色彩对比度符合 WCAG 2.1 AA
- 支持屏幕阅读器

## Figma/设计工具提示
- 使用 Auto Layout 创建响应式组件
- 创建 Component Variants 处理不同状态
- 使用 Variables 管理颜色和间距
- 创建 Prototype 展示交互流程
```

#### [阶段 3：并行开发（Codex + codeagent + /dev 命令）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%98%B6%E6%AE%B5-3%E5%B9%B6%E8%A1%8C%E5%BC%80%E5%8F%91codex--codeagent--dev-%E5%91%BD%E4%BB%A4)

```
# 在 Claude Code 中执行 /dev 命令
/dev "基于 PRD 和原型设计，实现用户个人主页功能"

# /dev 命令自动执行 6 步工作流：
# 1. 需求澄清（已有 PRD，跳过）
# 2. Codex 分析代码库
# 3. 生成开发计划（dev-plan.md）
# 4. 任务拆分和后端分配
# 5. 并行执行任务
# 6. 测试验证（90% 覆盖率）
```

**dev-plan.md 生成**（自动）：

```
## 任务列表

### Task 1: 数据模型设计
**后端**: codex
**文件**: prisma/schema.prisma
**内容**:
- User 模型扩展（头像、简介、背景图）
- UserStats 模型（粉丝数、关注数、获赞数）
- Post 模型（用户发布内容）

### Task 2: API 端点实现
**后端**: codex
**文件**: src/api/user-profile.ts
**依赖**: Task 1
**内容**:
- GET /api/users/:userId/profile
- GET /api/users/:userId/posts
- PUT /api/users/:userId/profile（更新个人信息）

### Task 3: 前端组件实现
**后端**: gemini（UI 任务自动检测）
**文件**: src/components/UserProfile/
**依赖**: Task 2
**内容**:
- ProfileHeader.tsx
- ProfileActions.tsx
- PostCard.tsx
- ContentFeed.tsx

### Task 4: SEO 优化
**后端**: gemini
**文件**: src/pages/profile/[userId].tsx
**依赖**: Task 3
**内容**:
- SSR/SSG 配置
- Meta tags 生成
- 结构化数据（JSON-LD）

### Task 5: 集成测试
**后端**: codex
**文件**: tests/integration/user-profile.test.ts
**依赖**: Task 2, Task 3, Task 4
**内容**:
- API 集成测试
- 前端组件测试
- E2E 测试（Playwright）
- 目标覆盖率：≥90%
```

**并行执行**（自动）：

```
# codeagent-wrapper 自动调用
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: data_model
backend: codex
workdir: ~/projects/social-app
---CONTENT---
根据 PRD 实现数据模型设计...

---TASK---
id: api_endpoints
backend: codex
workdir: ~/projects/social-app
dependencies: data_model
---CONTENT---
实现 API 端点...

---TASK---
id: frontend_components
backend: gemini
workdir: ~/projects/social-app
dependencies: api_endpoints
---CONTENT---
实现前端组件...

---TASK---
id: seo_optimization
backend: gemini
workdir: ~/projects/social-app
dependencies: frontend_components
---CONTENT---
实现 SEO 优化...

---TASK---
id: integration_tests
backend: codex
workdir: ~/projects/social-app
dependencies: api_endpoints, frontend_components, seo_optimization
---CONTENT---
编写集成测试...
EOF
```

**输出**：

```
======================================
Parallel Execution Summary
======================================
Total tasks: 5
Successful: 5
Failed: 0

Task Results:
[✓] data_model (backend: codex, session: thread_abc123) - 45s
[✓] api_endpoints (backend: codex, session: thread_def456) - 68s
[✓] frontend_components (backend: gemini, session: 019a7247-...) - 52s
[✓] seo_optimization (backend: gemini, session: 019a8358-...) - 38s
[✓] integration_tests (backend: codex, session: thread_ghi789) - 85s

Test Coverage: 93.2% (≥90% ✓)
```

### [工作流总结](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E5%B7%A5%E4%BD%9C%E6%B5%81%E6%80%BB%E7%BB%93)

**4.0 工作流的端到端优势**：

1.  **需求阶段（Claude）**：
    
    *   自动激活 `product-requirements` skill
    *   交互式澄清需求
    *   生成结构化 PRD
2.  **设计阶段（Gemini）**：
    
    *   自动激活 `prototype-prompt-generator` skill
    *   生成详细设计 prompt
    *   高质量原型设计（多模态能力）
3.  **开发阶段（Codex + Gemini）**：
    
    *   `/dev` 命令一键启动
    *   自动检测任务类型（后端 → Codex，UI → Gemini）
    *   并行执行、依赖管理
    *   强制 90% 测试覆盖率

**时间对比**：

*   传统方式（串行）：8-10 小时
*   4.0 工作流（并行）：3-4 小时（提升 60-70%）

* * *

## [实战案例：实现用户认证功能](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E5%AE%9E%E6%88%98%E6%A1%88%E4%BE%8B%E5%AE%9E%E7%8E%B0%E7%94%A8%E6%88%B7%E8%AE%A4%E8%AF%81%E5%8A%9F%E8%83%BD)

### [场景描述](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E5%9C%BA%E6%99%AF%E6%8F%8F%E8%BF%B0)

为 Express.js 后端添加用户认证，使用多后端策略：

*   **需求分析**：Claude（代码理解强）
*   **架构设计**：Codex（架构设计质量高）
*   **功能实现**：Codex（代码生成质量最高）
*   **文档生成**：Gemini（多模态能力强）

### [完整执行流程](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E5%AE%8C%E6%95%B4%E6%89%A7%E8%A1%8C%E6%B5%81%E7%A8%8B)

#### [阶段 1：需求分析（Claude 后端）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%98%B6%E6%AE%B5-1%E9%9C%80%E6%B1%82%E5%88%86%E6%9E%90claude-%E5%90%8E%E7%AB%AF)

```
codeagent-wrapper --backend claude - <<'EOF'
分析现有代码库，提取用户认证相关的需求和约束：

1. 识别当前使用的 Web 框架和版本
2. 识别数据库类型和 ORM
3. 检查现有认证实现
4. 识别架构模式（RESTful/GraphQL、分层结构等）
5. 列出技术栈限制和依赖

输出格式：
- 技术栈：框架、数据库、现有认证
- 架构模式：API 设计、分层结构
- 核心需求：需要实现的功能列表
- 技术约束：版本兼容性、安全要求
EOF

# 输出示例：
# 技术栈：
# - 框架：Express.js 4.18
# - 数据库：PostgreSQL + Prisma ORM
# - 现有认证：无
#
# 架构模式：
# - RESTful API
# - 分层架构（routes → controllers → services → models）
#
# 核心需求：
# 1. Email + 密码注册登录
# 2. JWT Token 认证
# 3. bcrypt 密码加密
# 4. 登录失败限制（5 次/小时）
```

#### [阶段 2：并行执行（多后端策略）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%98%B6%E6%AE%B5-2%E5%B9%B6%E8%A1%8C%E6%89%A7%E8%A1%8C%E5%A4%9A%E5%90%8E%E7%AB%AF%E7%AD%96%E7%95%A5)

```
# 设置并发限制
export CODEAGENT_MAX_PARALLEL_WORKERS=8

codeagent-wrapper --parallel <<'EOF'
---TASK---
id: database_model
backend: codex
workdir: ~/projects/my-app
---CONTENT---
创建 User 数据库模型：
- 使用 Prisma 定义 User 模型（id, email, password, createdAt）
- 添加 email 唯一索引
- 生成并运行迁移脚本
- 编写模型验证测试（覆盖率 ≥90%）

要求：
- 遵循 KISS 原则，保持简单
- 使用 Prisma 最佳实践
- 测试所有边界情况

---TASK---
id: auth_service
backend: codex
workdir: ~/projects/my-app
dependencies: database_model
---CONTENT---
实现认证服务（依赖 database_model 完成）：
- register(email, password) - bcrypt 加密（salt rounds = 10）
- login(email, password) - 验证并生成 JWT
- generateToken(userId) - 7 天过期
- verifyToken(token)
- 编写单元测试（覆盖率 ≥90%）

要求：
- 使用 jsonwebtoken 库
- 错误处理清晰
- 测试正常和异常场景

---TASK---
id: api_endpoints
backend: codex
workdir: ~/projects/my-app
dependencies: auth_service
---CONTENT---
实现 API 端点（依赖 auth_service）：
- POST /auth/register
- POST /auth/login
- 使用 express-validator 验证输入
- 编写集成测试（覆盖率 ≥90%）

要求：
- RESTful API 设计
- 适当的 HTTP 状态码
- 清晰的错误响应

---TASK---
id: middleware
backend: codex
workdir: ~/projects/my-app
---CONTENT---
实现中间件（独立任务）：
- JWT 验证中间件
- 登录失败限制中间件（express-rate-limit，5 次/小时）
- 编写中间件单元测试（覆盖率 ≥90%）

要求：
- 可复用的中间件设计
- 清晰的错误消息
- 测试各种场景

---TASK---
id: documentation
backend: gemini
workdir: ~/projects/my-app
dependencies: api_endpoints, middleware
---CONTENT---
生成用户认证功能文档（依赖 API 和中间件完成）：
- API 文档（端点、请求/响应格式、错误码）
- 安全最佳实践说明
- 使用示例（curl/JavaScript）
- 部署注意事项

要求：
- Markdown 格式
- 包含代码示例
- 清晰的说明

EOF
```

**执行流程说明**：

第一层（并行执行）：

*   `database_model`（Codex）：无依赖，立即执行
*   `middleware`（Codex）：无依赖，立即执行

第二层（等待第一层完成）：

*   `auth_service`（Codex）：依赖 `database_model`

第三层（等待第二层完成）：

*   `api_endpoints`（Codex）：依赖 `auth_service`

第四层（等待第三层完成）：

*   `documentation`（Gemini）：依赖 `api_endpoints` 和 `middleware`

**输出示例**：

```
======================================
Parallel Execution Summary
======================================
Total tasks: 5
Successful: 5
Failed: 0

Task Results:
[✓] database_model (session: thread_abc123, backend: codex) - 完成时间: 45s
[✓] middleware (session: thread_def456, backend: codex) - 完成时间: 38s
[✓] auth_service (session: thread_ghi789, backend: codex) - 完成时间: 68s
[✓] api_endpoints (session: thread_jkl012, backend: codex) - 完成时间: 52s
[✓] documentation (session: 019a7247-..., backend: gemini) - 完成时间: 25s
```

#### [阶段 3：测试验证](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%98%B6%E6%AE%B5-3%E6%B5%8B%E8%AF%95%E9%AA%8C%E8%AF%81)

```
# 运行测试套件
npm test -- --coverage

# 输出：
Test Suites: 4 passed, 4 total
Tests:       28 passed, 28 total
Coverage:    93.2% (≥90% ✓)

File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
src/services/authService.js   |   95.2  |   92.3   |   100   |   94.8
src/controllers/authController|   91.7  |   88.9   |   100   |   91.2
src/middleware/authMiddleware |   94.1  |   90.0   |   100   |   93.8
prisma/schema.prisma          |   100   |   100    |   100   |   100
```

#### [阶段 4：代码审查（Claude 后端）](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%98%B6%E6%AE%B5-4%E4%BB%A3%E7%A0%81%E5%AE%A1%E6%9F%A5claude-%E5%90%8E%E7%AB%AF)

```
# 使用 Claude 进行代码审查
codeagent-wrapper --backend claude - <<'EOF'
审查用户认证功能的实现：

审查范围：
- src/services/authService.js
- src/controllers/authController.js
- src/middleware/authMiddleware.js
- src/middleware/rateLimitMiddleware.js

审查重点：
1. 安全性：密码加密、JWT 配置、输入验证
2. 代码质量：KISS/YAGNI/SOLID 原则
3. 错误处理：边界情况、异常处理
4. 测试覆盖：是否覆盖所有场景

输出格式：
- 发现的问题（严重性：高/中/低）
- 改进建议
- 安全建议
EOF
```

* * *

## [最佳实践](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)

### [1\. 后端选择策略](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#1-%E5%90%8E%E7%AB%AF%E9%80%89%E6%8B%A9%E7%AD%96%E7%95%A5)

**推荐策略**：

任务类型

推荐后端

原因

需求分析

Claude

代码理解强

架构设计

Claude

架构设计质量高

代码生成

Codex

代码生成质量最高

代码审查

Claude

代码理解深入

文档生成

Gemini

多模态能力强

快速原型

Gemini

生成速度快

### [2\. Codex 配置优化](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#2-codex-%E9%85%8D%E7%BD%AE%E4%BC%98%E5%8C%96)

**推荐 `sandbox_mode` 配置**：

模式

权限

适用场景

`workspace-read`

只读

代码分析、审查

`workspace-write`

读写工作区

开发、重构（推荐）

`full`

读写整个文件系统

系统级任务（谨慎使用）

### [3\. 并发控制](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#3-%E5%B9%B6%E5%8F%91%E6%8E%A7%E5%88%B6)

**推荐配置**：

```
# 生产环境
export CODEAGENT_MAX_PARALLEL_WORKERS=8

# 开发环境（资源充足）
export CODEAGENT_MAX_PARALLEL_WORKERS=16

# 资源受限环境
export CODEAGENT_MAX_PARALLEL_WORKERS=4
```

**为什么限制并发**：

*   防止 API 速率限制
*   避免系统资源耗尽
*   保证系统稳定性

### [4\. 测试覆盖率策略](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#4-%E6%B5%8B%E8%AF%95%E8%A6%86%E7%9B%96%E7%8E%87%E7%AD%96%E7%95%A5)

**90% 覆盖率的实现方法**：

*   单元测试：覆盖所有函数（100%）
*   集成测试：覆盖核心流程（80%）
*   边界测试：覆盖异常场景（70%）

**不计入覆盖率的代码**：

*   配置文件（`config.js`）
*   类型定义（`types.ts`）
*   第三方库封装（已测试）

**提升覆盖率的技巧**：

```
# 查看未覆盖的代码
npm test -- --coverage --verbose

# 让 AI 补充测试用例
codeagent-wrapper --backend codex - <<'EOF'
补充测试用例，提升覆盖率至 90%：
- 添加边界测试（null, undefined, 空数组）
- 添加异常测试（try-catch 分支）
- 添加集成测试（API 端点）
- 运行测试并验证覆盖率 ≥90%
EOF
```

* * *

## [常见问题排查](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E6%8E%92%E6%9F%A5)

### [Q1: 如何选择合适的后端？](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#q1-%E5%A6%82%E4%BD%95%E9%80%89%E6%8B%A9%E5%90%88%E9%80%82%E7%9A%84%E5%90%8E%E7%AB%AF)

**决策树**：

```
任务类型？
├─ 需求分析/代码审查 → Claude（理解能力强）
├─ 架构设计/复杂重构 → Codex（质量最高）
├─ 文档生成/快速原型 → Gemini（生成速度快）
└─ 代码生成 → Codex（代码质量最高）

```

### [Q2: 并行任务执行失败如何处理？](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#q2-%E5%B9%B6%E8%A1%8C%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E5%A4%B1%E8%B4%A5%E5%A6%82%E4%BD%95%E5%A4%84%E7%90%86)

**失败场景 1：某个任务超时**

```
# 错误信息：
[✗] task1 (timeout after 7200s)

# 解决方案：
# 1. 增加超时时间
export CODEX_TIMEOUT=14400000  # 4 小时

# 2. 拆分大任务为小任务
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: task1_part1
---CONTENT---
第一部分任务

---TASK---
id: task1_part2
dependencies: task1_part1
---CONTENT---
第二部分任务
EOF
```

**失败场景 2：依赖任务失败**

```
# 错误信息：
[✗] task2 (dependency task1 failed)

# 解决方案：
# 1. 恢复失败的任务
codeagent-wrapper resume <session_id> "修复错误"

# 2. 重新运行依赖任务
# （修改任务配置，移除失败的依赖）
```

### [Q3: Windows 环境配置问题](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#q3-windows-%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE%E9%97%AE%E9%A2%98)

**问题**：如何在 Windows 上安装 codeagent-wrapper？

**解决方案 1：PowerShell + install.bat**（推荐）：

```
# 克隆仓库
git clone https://github.com/cexll/myclaude.git $HOME\myclaude
cd $HOME\myclaude

# 执行安装脚本
.\install.bat

# 如果遇到执行策略限制：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 验证安装
codeagent-wrapper --version
```

**解决方案 2：使用 WSL1**（备选）：

```
# 安装 WSL1
wsl --install --no-distribution
wsl --set-default-version 1
wsl --install -d Ubuntu-22.04

# 进入 WSL
wsl

# 在 WSL 中安装
cd /mnt/c/Users/YourName/myclaude
python3 install.py --module dev
```

### [Q4: 如何调试失败的任务？](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#q4-%E5%A6%82%E4%BD%95%E8%B0%83%E8%AF%95%E5%A4%B1%E8%B4%A5%E7%9A%84%E4%BB%BB%E5%8A%A1)

**方法 1：查看详细日志**

```
# 启用调试模式
export CODEAGENT_DEBUG=1

# 重新运行任务
codeagent-wrapper --backend claude "任务描述"
```

**方法 2：恢复会话并继续**

```
# 获取 session ID（从失败输出）
# 例如：session: thread_abc123

# 恢复会话
codeagent-wrapper resume thread_abc123 "继续任务并修复错误"
```

* * *

## [高级用法](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%AB%98%E7%BA%A7%E7%94%A8%E6%B3%95)

### [混合后端工作流](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E6%B7%B7%E5%90%88%E5%90%8E%E7%AB%AF%E5%B7%A5%E4%BD%9C%E6%B5%81)

**场景**：复杂项目需要多个阶段，每个阶段使用最优后端

```
#!/bin/bash
# 混合后端工作流脚本

# 阶段 1：需求分析（Claude）
echo "阶段 1：需求分析"
analysis_session=$(codeagent-wrapper --backend claude - <<'EOF' | grep SESSION_ID | cut -d' ' -f2
分析项目需求和技术栈
EOF
)

# 阶段 2：架构设计（Codex）
echo "阶段 2：架构设计"
design_session=$(codeagent-wrapper --backend codex - <<'EOF' | grep SESSION_ID | cut -d' ' -f2
基于需求设计系统架构
Session 上下文：$analysis_session
EOF
)

# 阶段 3：并行实现（Codex）
echo "阶段 3：并行实现"
codeagent-wrapper --parallel --backend codex <<'EOF'
---TASK---
id: backend
workdir: ./backend
---CONTENT---
实现后端功能

---TASK---
id: frontend
workdir: ./frontend
---CONTENT---
实现前端功能

---TASK---
id: tests
dependencies: backend, frontend
---CONTENT---
编写集成测试
EOF

# 阶段 4：文档生成（Gemini）
echo "阶段 4：文档生成"
codeagent-wrapper --backend gemini - <<'EOF'
生成项目文档（README、API 文档、部署指南）
EOF

echo "完成！"
```

### [自定义工作流集成](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B7%A5%E4%BD%9C%E6%B5%81%E9%9B%86%E6%88%90)

**与 CI/CD 集成**：

```
# .github/workflows/ai-workflow.yml
name: AI Development Workflow

on:
  push:
    branches: [ main ]

jobs:
  ai-tasks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup codeagent-wrapper
        run: |
          curl -L https://github.com/.../codeagent-wrapper -o codeagent-wrapper
          chmod +x codeagent-wrapper
          sudo mv codeagent-wrapper /usr/local/bin/

      - name: Run AI tasks
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          CODEAGENT_MAX_PARALLEL_WORKERS: 4
        run: |
          codeagent-wrapper --parallel <<'EOF'
          ---TASK---
          id: code_review
          backend: claude
          ---CONTENT---
          审查最新提交的代码

          ---TASK---
          id: test_generation
          backend: codex
          dependencies: code_review
          ---CONTENT---
          为新代码生成测试
          EOF
```

* * *

## [总结](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E6%80%BB%E7%BB%93)

### [核心优势](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E6%A0%B8%E5%BF%83%E4%BC%98%E5%8A%BF)

**4.0 工作流的三大突破**：

1.  **多后端支持**
    
    *   灵活选择 Codex、Claude、Gemini
    *   根据任务类型优化后端选择
    *   任务级后端配置
2.  **统一 API 接口**
    
    *   所有后端使用相同的 API
    *   简化学习曲线
    *   易于集成和自动化
3.  **并发控制和安全**
    
    *   可配置的并发限制
    *   灵活的权限管理
    *   自动化友好的设计

### [适用场景](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF)

**推荐使用 4.0 工作流**：

*   生产级项目开发
*   需要优化后端选择的项目
*   复杂功能开发（多任务并发）
*   团队协作（标准化流程）

**不推荐使用**：

*   简单脚本（过度工程化）
*   原型验证（可以直接用单一后端）
*   一次性任务（配置复杂）

### [生产力提升](https://stellarlink.co/articles/codeagent-wrapper-5-2-multi-backend-workflow#%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87)

*   开发速度：提升 3-5 倍
*   代码质量：测试覆盖率 ≥90%
*   代码标准化：降低维护难度
*   灵活性：根据需求选择最优后端

* * *
