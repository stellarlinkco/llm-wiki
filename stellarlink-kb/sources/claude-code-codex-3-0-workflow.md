---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/claude-code-codex-3-0-workflow"
title: Claude Code + Codex 3.0 实战工作流 Dev：从配置到生产的完整指南
description: Claude Code 3.0 工作流通过 `/dev` 命令实现了完整的开发生命周期自动化：需求澄清 → Codex 分析 → 生成开发计划 → 并发执行 → 测试验证。
resource: "https://stellarlink.co/articles/claude-code-codex-3-0-workflow"
tags: []
timestamp: "2026-06-20T06:45:35.459Z"
source_path: "https://stellarlink.co/articles/claude-code-codex-3-0-workflow"
source_id: f184ef1b865acef2193876e318dd04105e324ce6caa5388cc3c2f96e60f0cdc8
content_hash: 473f708ce73ef5658cc1b52484710e706e89c04820cde5012735be0d60c15bab
---

## [TLDR](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#tldr)

Claude Code 3.0 工作流通过 `/dev` 命令实现了完整的开发生命周期自动化：需求澄清 → Codex 分析 → 生成开发计划 → 并发执行 → 测试验证。核心特性包括 codex-wrapper 并发调用、高测试覆盖率推荐（90%）、一键安装脚本。本文提供从零开始的配置教程和实战案例。

**关键数据**：

*   配置时间：5 分钟
*   月成本：< 210 元（Claude Sonnet 4.5 + GPT-5.1 Codex Max）
*   测试覆盖率：推荐 ≥ 90%
*   并发能力：多任务同时执行

* * *

## [为什么需要 3.0 工作流](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81-30-%E5%B7%A5%E4%BD%9C%E6%B5%81)

### [从 MCP 到 Skills 再到 Dev Workflow](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E4%BB%8E-mcp-%E5%88%B0-skills-%E5%86%8D%E5%88%B0-dev-workflow)

**1.0 版本（MCP Server）**：

*   问题：上下文消耗高、长时间运行不稳定、Socket 连接超时
*   适用场景：简单任务、单次调用

**2.0 版本（Skills）**：

*   改进：渐进式加载、直接脚本调用、启动速度提升 5 倍
*   问题：手动规划任务、缺乏标准化流程、测试覆盖率不可控

**3.0 版本（Dev Workflow）**：

*   核心：端到端自动化、高测试覆盖率、并发执行、标准化交付
*   适用场景：生产级开发、团队协作、质量要求高的项目

### [3.0 工作流的六大核心能力](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#30-%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%9A%84%E5%85%AD%E5%A4%A7%E6%A0%B8%E5%BF%83%E8%83%BD%E5%8A%9B)

#### [1\. 智能需求澄清](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#1-%E6%99%BA%E8%83%BD%E9%9C%80%E6%B1%82%E6%BE%84%E6%B8%85)

通过 `AskUserQuestion` 工具进行 2-3 轮交互式问答：

```
用户输入：实现用户登录功能

Claude Code 澄清：
Q1: 认证方式？
  - Email + 密码
  - 手机号 + 验证码
  - OAuth（Google/GitHub）

Q2: 会话管理？
  - JWT Token
  - Session Cookie
  - Redis Session

Q3: 安全要求？
  - 密码加密算法（bcrypt/argon2）
  - 登录失败限制
  - 双因素认证
```

#### [2\. Codex 深度分析](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#2-codex-%E6%B7%B1%E5%BA%A6%E5%88%86%E6%9E%90)

调用 Codex 分析代码库，提取：

*   核心功能点（2-5 个）
*   技术要点（框架、依赖、架构模式）
*   任务拆分（独立任务 vs 依赖任务）

#### [3\. 自动生成开发计划](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#3-%E8%87%AA%E5%8A%A8%E7%94%9F%E6%88%90%E5%BC%80%E5%8F%91%E8%AE%A1%E5%88%92)

通过 `dev-plan-generator` Agent 生成标准化文档：

```
.claude/specs/user-login/
└── dev-plan.md
    ├── 需求概述
    ├── 技术方案
    ├── 任务列表
    │   ├── Task 1: 数据库模型设计
    │   ├── Task 2: API 端点实现
    │   ├── Task 3: 前端表单组件
    │   └── Task 4: 集成测试
    ├── 测试要求（≥90% 覆盖率）
    └── 验收标准
```

#### [4\. 并发任务执行](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#4-%E5%B9%B6%E5%8F%91%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C)

**codex-wrapper 工作原理**：

```
Claude Code 调用 codex-wrapper --parallel
    ↓
从 stdin 读取任务配置（---TASK--- 格式）
    ↓
解析任务依赖关系
    ↓
拓扑排序（Kahn 算法）将任务分层
    ↓
第一层：无依赖任务并发执行
    ├── Task 1 → codex e --json
    ├── Task 2 → codex e --json
    └── Task 3 → codex e --json
    ↓
第二层：依赖第一层的任务执行
    └── Task 4 → codex e --json
    ↓
汇总结果（总数/成功/失败）返回
```

**任务格式**：

```
codex-wrapper --parallel <<'EOF'
---TASK---
id: backend_api
workdir: /project/backend
depends: database_model
---CONTENT---
implement REST endpoints

---TASK---
id: database_model
workdir: /project/backend
---CONTENT---
create User model with Prisma
EOF
```

**并发策略**：

*   独立任务：同一层并行执行（数据库模型 + API 端点 + 前端组件）
*   依赖任务：按层级串行（先执行 database\_model，再执行依赖它的 backend\_api）
*   失败处理：失败任务阻塞所有依赖它的任务

**输出和 Session 管理**：

每个任务执行后返回：

*   Session ID（格式：`thread_xxxxx`）：用于恢复会话
*   Agent 消息：Codex 的执行结果和说明
*   执行状态：成功/失败

恢复之前的会话：

```
# 继续之前未完成的任务
codex-wrapper resume thread_abc123 "继续实现功能"

# 或通过 stdin
codex-wrapper resume thread_abc123 - <<'EOF'
继续实现功能的剩余部分
EOF
```

超时控制：

*   默认超时：7200 秒（2 小时）
*   自定义超时：`export CODEX_TIMEOUT=3600`（1 小时）

#### [5\. 高测试覆盖率](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#5-%E9%AB%98%E6%B5%8B%E8%AF%95%E8%A6%86%E7%9B%96%E7%8E%87)

每个任务推荐：

*   实现功能代码
*   编写单元测试
*   运行测试并报告覆盖率
*   目标覆盖率 ≥ 90%

#### [6\. 标准化交付](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#6-%E6%A0%87%E5%87%86%E5%8C%96%E4%BA%A4%E4%BB%98)

最终输出：

*   功能代码（已测试）
*   测试代码（覆盖率报告）
*   开发文档（dev-plan.md）
*   执行摘要（文件变更、风险点、后续步骤）

* * *

## [环境配置：从零到生产](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE%E4%BB%8E%E9%9B%B6%E5%88%B0%E7%94%9F%E4%BA%A7)

### [前置要求](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E5%89%8D%E7%BD%AE%E8%A6%81%E6%B1%82)

**操作系统**：

*   macOS / Linux：原生支持
*   Windows：使用 WSL1（推荐）

**为什么推荐 WSL1**：

*   内存占用低（400-500MB，WSL2 需要 2-4GB）
*   文件系统性能好（直接访问 `/mnt/d/workspace`，无虚拟化开销）
*   兼容性强（除 C++ 编译外无已知问题）
*   配置简单（无需 Hyper-V）

**WSL1 配置示例**：

```
# 安装 WSL1
wsl --install --no-distribution
wsl --set-default-version 1
wsl --install -d Ubuntu-22.04

# 访问 Windows 文件
cd /mnt/d/workspace/my-project

# 安装开发工具
sudo apt update
sudo apt install git python3 python3-pip
```

**必需工具**：

*   Claude Code CLI
*   Codex CLI
*   Python 3.8+
*   Git

### [第一步：克隆配置仓库](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E7%AC%AC%E4%B8%80%E6%AD%A5%E5%85%8B%E9%9A%86%E9%85%8D%E7%BD%AE%E4%BB%93%E5%BA%93)

```
# 克隆 myclaude 仓库
git clone https://github.com/cexll/myclaude.git ~/myclaude

# 查看目录结构
tree ~/myclaude -L 2
# 输出：
# myclaude/
# ├── dev-workflow/          # 3.0 工作流
# ├── skills/                # Skills 定义
# │   └── codex/
# ├── install.py             # 一键安装脚本
# └── README.md
```

### [第二步：执行一键安装](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E7%AC%AC%E4%BA%8C%E6%AD%A5%E6%89%A7%E8%A1%8C%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85)

```
# 安装 dev 工作流
cd ~/myclaude
python3 install.py --module dev

# 安装过程：
# [1/5] 检查依赖（uv, codex）
# [2/5] 安装 codex-wrapper
# [3/5] 配置 Claude Code Skills
# [4/5] 安装 dev-workflow 命令
# [5/5] 验证安装
```

**install.py 做了什么**：

1.  **安装 codex-wrapper**：
    
    ```
    # 安装到 ~/.local/bin/codex-wrapper
    # 添加到 PATH
    ```
    
2.  **配置 Skills**：
    
    ```
    # 复制到 ~/.claude/skills/codex/
    # 包含 SKILL.md 和 scripts/codex.py
    ```
    
3.  **安装 /dev 命令**：
    
    ```
    # 复制到 ~/.claude/commands/dev.md
    # 注册 dev-plan-generator Agent
    ```
    
4.  **验证安装**：
    
    ```
    # 测试 codex-wrapper 调用
    # 测试 /dev 命令可用性
    ```
    

### [第三步：配置 Codex](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E7%AC%AC%E4%B8%89%E6%AD%A5%E9%85%8D%E7%BD%AE-codex)

> ⚠️ **重要**：`sandbox_mode` 必须设置为 `workspace-write` 或更高权限，否则 Codex 无法写入文件。

#### [3.1 配置 config.yaml](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#31-%E9%85%8D%E7%BD%AE-configyaml)

编辑 `~/.codex/config.yaml`：

```
# 推荐配置（平衡性能和成本）
model = "gpt-5.1-codex-max"
model_reasoning_effort = "high"          # 不推荐 xhigh（浪费 token 和时间）
model_reasoning_summary = "detailed"
approval_policy = "never"                # 自动执行，无需确认
sandbox_mode = "workspace-write"         # 允许写入工作区（最低要求）
disable_response_storage = true
network_access = true
```

**配置说明**：

参数

推荐值

原因

`model`

`gpt-5.1-codex-max`

最佳代码生成质量

`reasoning_effort`

`high`

`xhigh` 更高，提升有限

`sandbox_mode`

`workspace-write`

允许修改文件，`workspace-read` 无法写入

`approval_policy`

`never`

自动化执行，避免手动确认

#### [3.2 配置 AGENTS.md（推荐）](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#32-%E9%85%8D%E7%BD%AE-agentsmd%E6%8E%A8%E8%8D%90)

创建 `~/.codex/AGENTS.md` 定义 Codex 的行为准则：

```
You are Linus Torvalds. Apply kernel maintainer-level scrutiny to all code changes. Prioritize eliminating complexity and potential defects. Enforce code quality following KISS, YAGNI, and SOLID principles. Reject bloat and academic over-engineering.

Check if the project has a CLAUDE.md file. If it exists, read it as context.
```

**为什么需要 AGENTS.md**：

*   统一 Codex 的代码质量标准（KISS、YAGNI、SOLID）
*   与项目级 CLAUDE.md 保持一致性
*   Linus 风格：简单、直接、拒绝过度工程

**AGENTS.md 的作用**：

*   每次 Codex 执行任务时自动加载
*   强化代码审查标准（消灭复杂度）
*   如果项目有 `.claude/CLAUDE.md`，Codex 会读取并遵循项目规范

### [第四步：清理 Claude Code 的 MCP 配置](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E7%AC%AC%E5%9B%9B%E6%AD%A5%E6%B8%85%E7%90%86-claude-code-%E7%9A%84-mcp-%E9%85%8D%E7%BD%AE)

> ⚠️ **关键步骤**：不清理 MCP 会导致 Skills 调用失败或冲突。

**为什么要清理**：

*   Claude Code 的 MCP Server 会与 Skills 冲突
*   Codex 应作为纯开发工具，由 Claude Code 通过 Skills 编排
*   避免重复配置和上下文浪费

**注意**：

*   清理的是 Claude Code 的 MCP（`~/.claude/` 目录）
*   保留 Codex 的 AGENTS.md（`~/.codex/AGENTS.md`，上一步刚创建）

```
# 移除所有 MCP Server
claude mcp list
claude mcp remove codex-cli  # 如果存在

# 清理 Claude Code 的 AGENTS.md（如果存在）
# 注意：这里清理的是 ~/.claude/AGENTS.md，不是 ~/.codex/AGENTS.md
rm ~/.claude/AGENTS.md

# 验证清理结果
claude mcp list  # 应为空
ls ~/.claude/AGENTS.md  # 应不存在
ls ~/.codex/AGENTS.md  # 应存在（第三步创建的 Codex 配置）
```

### [第五步：验证安装](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E7%AC%AC%E4%BA%94%E6%AD%A5%E9%AA%8C%E8%AF%81%E5%AE%89%E8%A3%85)

```
# 启动 Claude Code
claude

# 测试 /dev 命令
/dev "创建一个计算斐波那契数列的函数"

# 预期流程：
# 1. AskUserQuestion 询问需求细节
# 2. 调用 Codex 分析代码库
# 3. 生成 dev-plan.md
# 4. 并发执行任务
# 5. 运行测试并报告覆盖率
# 6. 输出执行摘要
```

* * *

## [实战案例：实现用户认证功能](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E5%AE%9E%E6%88%98%E6%A1%88%E4%BE%8B%E5%AE%9E%E7%8E%B0%E7%94%A8%E6%88%B7%E8%AE%A4%E8%AF%81%E5%8A%9F%E8%83%BD)

### [场景描述](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E5%9C%BA%E6%99%AF%E6%8F%8F%E8%BF%B0)

为一个 Express.js 后端添加用户认证功能，包括：

*   用户注册（Email + 密码）
*   用户登录（JWT Token）
*   密码加密（bcrypt）
*   登录失败限制（5 次/小时）

### [完整执行流程](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E5%AE%8C%E6%95%B4%E6%89%A7%E8%A1%8C%E6%B5%81%E7%A8%8B)

#### [阶段 1：需求澄清](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E9%98%B6%E6%AE%B5-1%E9%9C%80%E6%B1%82%E6%BE%84%E6%B8%85)

```
用户输入：
/dev "实现用户认证功能"

Claude Code 询问：
Q1: 认证方式？
  ✓ Email + 密码
  - 手机号 + 验证码
  - OAuth

Q2: Token 类型？
  ✓ JWT
  - Session Cookie

Q3: 安全措施？
  ✓ bcrypt 加密
  ✓ 登录失败限制
  - 双因素认证

用户选择：Email + 密码 + JWT + bcrypt + 失败限制
```

#### [阶段 2：Codex 分析](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E9%98%B6%E6%AE%B5-2codex-%E5%88%86%E6%9E%90)

```
# Claude Code 调用 Codex 分析代码库
codex-wrapper - <<'EOF'
分析现有代码库，提取用户认证相关的技术栈和架构模式：

1. 识别当前使用的 Web 框架和版本
2. 识别数据库类型和 ORM
3. 检查现有认证实现
4. 识别架构模式（RESTful/GraphQL、分层结构等）
5. 列出相关中间件和工具

输出格式：
- 技术栈：框架、数据库、现有认证
- 架构模式：API 设计、分层结构
- 核心任务：需要实现的功能列表
EOF

# Codex 输出（示例）：
技术栈：
- 框架：Express.js 4.18
- 数据库：PostgreSQL + Prisma ORM
- 现有认证：无

架构模式：
- RESTful API
- 中间件模式（已有 errorHandler, logger）
- 分层架构（routes → controllers → services → models）

核心任务：
1. 数据库模型设计（User 表 + 索引）
2. 认证服务实现（注册、登录、Token 生成）
3. API 端点（POST /auth/register, POST /auth/login）
4. 中间件（JWT 验证、失败限制）
5. 集成测试（覆盖率 ≥90%）
```

#### [阶段 3：生成开发计划](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E9%98%B6%E6%AE%B5-3%E7%94%9F%E6%88%90%E5%BC%80%E5%8F%91%E8%AE%A1%E5%88%92)

```
# Claude Code 调用 dev-plan-generator Agent
# 生成 .claude/specs/user-auth/dev-plan.md

# dev-plan.md 内容：
## 需求概述
实现基于 JWT 的用户认证系统，支持注册、登录、密码加密、失败限制。

## 技术方案
- 数据库：Prisma + PostgreSQL
- 加密：bcrypt（salt rounds = 10）
- Token：jsonwebtoken（过期时间 7 天）
- 限流：express-rate-limit（5 次/小时）

## 任务列表

### Task 1: 数据库模型设计
**文件**：prisma/schema.prisma
**内容**：
- User 模型（id, email, password, createdAt）
- 唯一索引（email）
- 迁移脚本

**测试**：
- 模型验证测试
- 索引唯一性测试

### Task 2: 认证服务实现
**文件**：src/services/authService.js
**内容**：
- register(email, password)
- login(email, password)
- generateToken(userId)
- verifyToken(token)

**测试**：
- 注册成功/失败场景
- 登录成功/失败场景
- Token 生成/验证

### Task 3: API 端点
**文件**：src/routes/authRoutes.js, src/controllers/authController.js
**内容**：
- POST /auth/register
- POST /auth/login
- 输入验证（express-validator）

**测试**：
- API 集成测试
- 输入验证测试

### Task 4: 中间件
**文件**：src/middleware/authMiddleware.js, src/middleware/rateLimitMiddleware.js
**内容**：
- JWT 验证中间件
- 登录失败限制中间件

**测试**：
- 中间件单元测试
- 限流逻辑测试

## 测试要求
- 单元测试覆盖率 ≥90%
- 集成测试覆盖核心流程
- 使用 Jest + Supertest

## 验收标准
- ✓ 用户可以注册（密码已加密）
- ✓ 用户可以登录（返回 JWT）
- ✓ 登录失败 5 次后限制 1 小时
- ✓ 测试覆盖率 ≥90%
```

#### [阶段 4：并发执行](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E9%98%B6%E6%AE%B5-4%E5%B9%B6%E5%8F%91%E6%89%A7%E8%A1%8C)

```
# Claude Code 调用 codex-wrapper 并发执行
codex-wrapper --parallel <<'EOF'
---TASK---
id: database_model
workdir: ~/projects/my-app
---CONTENT---
根据 dev-plan.md Task 1 要求，创建 User 数据库模型：
- 使用 Prisma 定义 User 模型（id, email, password, createdAt）
- 添加 email 唯一索引
- 生成并运行迁移脚本
- 编写模型验证测试（覆盖率 ≥90%）

---TASK---
id: auth_service
workdir: ~/projects/my-app
depends: database_model
---CONTENT---
根据 dev-plan.md Task 2 要求，实现认证服务：
- register(email, password) - bcrypt 加密
- login(email, password) - 验证并生成 JWT
- generateToken(userId) - 7 天过期
- verifyToken(token)
- 编写单元测试（覆盖率 ≥90%）

---TASK---
id: api_endpoints
workdir: ~/projects/my-app
depends: auth_service
---CONTENT---
根据 dev-plan.md Task 3 要求，实现 API 端点：
- POST /auth/register
- POST /auth/login
- 使用 express-validator 验证输入
- 编写集成测试（覆盖率 ≥90%）

---TASK---
id: middleware
workdir: ~/projects/my-app
---CONTENT---
根据 dev-plan.md Task 4 要求，实现中间件：
- JWT 验证中间件
- 登录失败限制中间件（express-rate-limit）
- 编写中间件单元测试（覆盖率 ≥90%）
EOF

# 输出示例：
# ======================================
# Parallel Execution Summary
# ======================================
# Total tasks: 4
# Successful: 4
# Failed: 0
#
# Task Results:
# [✓] database_model (session: thread_abc123) - 完成时间: 45s
# [✓] auth_service (session: thread_def456) - 完成时间: 68s
# [✓] api_endpoints (session: thread_ghi789) - 完成时间: 52s
# [✓] middleware (session: thread_jkl012) - 完成时间: 38s
```

**执行流程说明**：

第一层（并行执行）：

*   `database_model`：无依赖，立即执行
*   `middleware`：无依赖，立即执行

第二层（等待第一层完成）：

*   `auth_service`：依赖 `database_model`，等待其完成后执行

第三层（等待第二层完成）：

*   `api_endpoints`：依赖 `auth_service`，等待其完成后执行

#### [阶段 5：测试验证](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E9%98%B6%E6%AE%B5-5%E6%B5%8B%E8%AF%95%E9%AA%8C%E8%AF%81)

```
# 运行完整测试套件
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

#### [阶段 6：执行摘要](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E9%98%B6%E6%AE%B5-6%E6%89%A7%E8%A1%8C%E6%91%98%E8%A6%81)

```
Claude Code 输出：

## 执行摘要

### 已完成任务
✓ Task 1: 数据库模型设计（prisma/schema.prisma:1-15）
✓ Task 2: 认证服务实现（src/services/authService.js:1-87）
✓ Task 3: API 端点（src/routes/authRoutes.js:1-23, src/controllers/authController.js:1-56）
✓ Task 4: 中间件（src/middleware/authMiddleware.js:1-34, src/middleware/rateLimitMiddleware.js:1-18）

### 测试覆盖率
- 总体覆盖率：93.2%（≥90% ✓）
- 单元测试：24 个
- 集成测试：4 个

### 文件变更
- 新增：7 个文件
- 修改：2 个文件（package.json, app.js）
- 代码行数：+312 行

### 风险点
- 密码重置功能未实现（后续任务）
- 生产环境需配置 JWT_SECRET 环境变量
- 建议添加日志记录（登录失败、Token 过期）

### 后续步骤
1. 部署到测试环境验证
2. 实现密码重置功能
3. 添加用户权限管理
```

* * *

## [最佳实践](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)

### [1\. Codex 配置优化](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#1-codex-%E9%85%8D%E7%BD%AE%E4%BC%98%E5%8C%96)

**不推荐 `xhigh` reasoning effort**：

配置

Token 消耗

执行时间

质量提升

`high`

5K tokens

30 秒

基准

`xhigh`

15K tokens

90 秒

+5%

**结论**：`xhigh` 成本高 3 倍，质量提升有限，不适合生产环境。

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

**AGENTS.md 的最佳实践**：

配置 `~/.codex/AGENTS.md` 可以统一 Codex 的代码质量标准：

```
You are Linus Torvalds. Apply kernel maintainer-level scrutiny to all code changes. Prioritize eliminating complexity and potential defects. Enforce code quality following KISS, YAGNI, and SOLID principles. Reject bloat and academic over-engineering.

Check if the project has a CLAUDE.md file. If it exists, read it as context.
```

**AGENTS.md 的优势**：

*   ✅ 自动强化代码质量（KISS、YAGNI、SOLID）
*   ✅ 与项目 CLAUDE.md 保持一致性
*   ✅ Linus 风格审查：拒绝复杂度和过度工程
*   ✅ 全局生效：所有 Codex 任务自动应用

**何时需要 AGENTS.md**：

*   团队协作项目（统一代码风格）
*   质量要求高的项目（严格审查）
*   重构任务（避免引入复杂度）

### [2\. Claude Code 模型选择](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#2-claude-code-%E6%A8%A1%E5%9E%8B%E9%80%89%E6%8B%A9)

**推荐 Sonnet 4.5**：

*   性能：与 Opus 4.5 接近（代码任务）
*   成本：1/3 价格
*   速度：响应快 2 倍

**不推荐 Haiku**：

*   规划能力弱
*   容易遗漏任务
*   测试覆盖率不达标

### [3\. 任务拆分原则](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#3-%E4%BB%BB%E5%8A%A1%E6%8B%86%E5%88%86%E5%8E%9F%E5%88%99)

**独立任务（并行执行）**：

*   前端组件 + 后端 API（无依赖）
*   数据库模型 + 中间件（无依赖）
*   单元测试 + 文档（无依赖）

**依赖任务（串行执行）**：

*   数据库迁移 → API 实现
*   API 实现 → 集成测试
*   功能开发 → 性能优化

### [4\. 测试覆盖率策略](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#4-%E6%B5%8B%E8%AF%95%E8%A6%86%E7%9B%96%E7%8E%87%E7%AD%96%E7%95%A5)

**90% 覆盖率的实现方法**：

*   单元测试：覆盖所有函数（100%）
*   集成测试：覆盖核心流程（80%）
*   边界测试：覆盖异常场景（70%）

**不计入覆盖率的代码**：

*   配置文件（config.js）
*   类型定义（types.ts）
*   第三方库封装（已测试）

### [5\. 成本控制](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#5-%E6%88%90%E6%9C%AC%E6%8E%A7%E5%88%B6)

**月成本估算（210 元预算）**：

服务

模型

用量

成本

Claude Code

Sonnet 4.5

500K tokens

150 元

Codex

GPT-5.1 Codex Max

1M tokens

60 元

**节省成本的技巧**：

*   使用 `high` 而非 `xhigh` reasoning effort
*   清理 MCP Server（减少上下文消耗）
*   复用 Codex Session（避免重复分析）

* * *

## [常见问题排查](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E6%8E%92%E6%9F%A5)

### [Q1: install.py 执行失败](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#q1-installpy-%E6%89%A7%E8%A1%8C%E5%A4%B1%E8%B4%A5)

**错误信息**：

```
[ERROR] uv not found in PATH
```

**解决方案**：

```
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 添加到 PATH
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
uv --version
```

### [Q2: codex-wrapper 调用失败](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#q2-codex-wrapper-%E8%B0%83%E7%94%A8%E5%A4%B1%E8%B4%A5)

**错误信息**：

```
[ERROR] codex command not found
```

**解决方案**：

```
# 安装 Codex CLI
uv tool install codex

# 验证安装
codex --version

# 配置 API Key
export OPENAI_API_KEY="your-api-key"
```

### [Q3: /dev 命令不可用](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#q3-dev-%E5%91%BD%E4%BB%A4%E4%B8%8D%E5%8F%AF%E7%94%A8)

**错误信息**：

```
Unknown command: /dev
```

**解决方案**：

```
# 检查命令文件是否存在
ls ~/.claude/commands/dev.md

# 如果不存在，手动复制
cp ~/myclaude/dev-workflow/dev.md ~/.claude/commands/

# 重启 Claude Code
```

### [Q4: 如何提升测试覆盖率](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#q4-%E5%A6%82%E4%BD%95%E6%8F%90%E5%8D%87%E6%B5%8B%E8%AF%95%E8%A6%86%E7%9B%96%E7%8E%87)

**提示信息**：

```
[INFO] Coverage 78% (建议提升至 90%)
```

**解决方案**：

```
# 查看未覆盖的代码
npm test -- --coverage --verbose

# 常见原因：
# 1. 缺少边界测试（null, undefined, 空数组）
# 2. 缺少异常测试（try-catch 分支）
# 3. 缺少集成测试（API 端点）

# 让 Codex 补充测试用例
codex-wrapper - <<'EOF'
补充测试用例，提升覆盖率至 90%：
- 添加边界测试（null, undefined, 空数组）
- 添加异常测试（try-catch 分支）
- 添加集成测试（API 端点）
- 运行测试并验证覆盖率 ≥90%
EOF

# 或使用恢复模式继续之前的会话
# codex-wrapper resume thread_xxxxx "继续补充测试用例"
```

### [Q5: Windows 环境配置问题](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#q5-windows-%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE%E9%97%AE%E9%A2%98)

**问题**：install.py 在 PowerShell/Cmd 中失败

**解决方案**：使用 WSL1

```
# 安装 WSL1
wsl --install --no-distribution
wsl --set-default-version 1
wsl --install -d Ubuntu-22.04

# 进入 WSL
wsl

# 在 WSL 中执行配置
cd /mnt/c/Users/YourName/myclaude
python3 install.py --module dev
```

**WSL1 优势**：

*   内存占用低（400-500MB）
*   文件访问快（直接访问 Windows 文件系统）
*   兼容性好（除 C++ 编译外无已知问题）

* * *

## [总结](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E6%80%BB%E7%BB%93)

### [核心优势](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E6%A0%B8%E5%BF%83%E4%BC%98%E5%8A%BF)

**3.0 工作流的三大突破**：

1.  **端到端自动化**
    
    *   从需求澄清到代码交付全流程自动化
    *   无需手动规划任务和编写测试
    *   标准化交付（代码 + 测试 + 文档）
2.  **高质量保证**
    
    *   推荐 90% 测试覆盖率
    *   自动生成测试和覆盖率报告
    *   质量可控的代码交付
3.  **并发执行能力**
    
    *   codex-wrapper 支持多任务并行
    *   独立任务同时执行，依赖任务串行
    *   大幅缩短开发周期

### [适用场景](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF)

**推荐使用 3.0 工作流**：

*   生产级项目开发
*   团队协作（标准化流程）
*   质量要求高的项目（测试覆盖率）
*   复杂功能开发（多任务并发）

**不推荐使用 3.0 工作流**：

*   简单脚本（过度工程化）
*   原型验证（可能不需要高测试覆盖率）
*   一次性任务（配置成本高）

### [成本效益](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E6%88%90%E6%9C%AC%E6%95%88%E7%9B%8A)

**月成本 < 210 元**：

*   Claude Code（Sonnet 4.5）：150 元
*   Codex（GPT-5.1 Codex Max）：60 元

**生产力提升**：

*   开发速度：提升 3-5 倍
*   代码质量：测试覆盖率 ≥90%
*   维护成本：降低 50%（标准化代码）

* * *

## [资源链接](https://stellarlink.co/articles/claude-code-codex-3-0-workflow#%E8%B5%84%E6%BA%90%E9%93%BE%E6%8E%A5)

**官方资源**：

*   [myclaude 仓库](https://github.com/cexll/myclaude)
*   [dev-workflow 文档](https://github.com/cexll/myclaude/tree/master/dev-workflow)
*   [codex-wrapper 源码](https://github.com/cexll/myclaude/tree/master/skills/codex)

**API 服务**：

*   [PackyAPI](https://www.packyapi.com/register?aff=wZPe)（优惠码：cc-switch，新用户9 折）

**相关技术**：

*   [Anthropic 官方 Skills 文档](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
