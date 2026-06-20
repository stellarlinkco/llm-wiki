---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/claude-code-installation-guide-macos"
title: Claude Code 安装配置指南：macOS 篇
description: Claude Code 安装配置指南 macOS 篇
resource: "https://stellarlink.co/articles/claude-code-installation-guide-macos"
tags: []
timestamp: "2026-06-20T06:45:36.171Z"
source_path: "https://stellarlink.co/articles/claude-code-installation-guide-macos"
source_id: 4b856d7873299c557ab2802694b271a99296ca8df432fb85ae08ad33009a6a2d
content_hash: 4280d370b5f6684dba885f42826ca33d40c3b5c937a42f4250ab218f70280c30
---

> **TLDR**: 本文详细介绍如何在 macOS 上安装和配置 Claude Code。推荐使用官方安装脚本（支持自动更新），也可通过 Homebrew 安装。全文覆盖环境准备、安装步骤、代理配置和常见问题排查。

## [什么是 Claude Code](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E4%BB%80%E4%B9%88%E6%98%AF-claude-code)

Claude Code 是 Anthropic 推出的官方 CLI 工具，让你可以在终端中直接与 Claude 交互进行软件开发。它支持：

*   直接在终端中与 Claude 对话
*   读取、编写和修改代码文件
*   执行 Shell 命令
*   搜索和分析代码库
*   集成 Git 工作流

与传统的 Web 界面相比，Claude Code 更适合开发者：无需复制粘贴代码，Claude 可以直接操作你的项目文件。

## [系统要求](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E7%B3%BB%E7%BB%9F%E8%A6%81%E6%B1%82)

组件

要求

操作系统

macOS 13 Ventura 或更高版本

芯片

Apple Silicon (M1/M2/M3/M4) 或 Intel

网络

能访问 claude.ai（或配置 API 代理）

终端

系统终端、iTerm2、Warp 等

> **注意**：原生安装方式不需要预装 Node.js，安装脚本会自动处理依赖。

* * *

## [安装方式](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E5%AE%89%E8%A3%85%E6%96%B9%E5%BC%8F)

macOS 有两种安装方式：**官方脚本安装**（推荐）和 **Homebrew 安装**。

### [方式一：官方脚本安装（推荐）](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E6%96%B9%E5%BC%8F%E4%B8%80%E5%AE%98%E6%96%B9%E8%84%9A%E6%9C%AC%E5%AE%89%E8%A3%85%E6%8E%A8%E8%8D%90)

打开终端，执行：

```
curl -fsSL https://claude.ai/install.sh | bash
```

官方脚本安装支持**自动后台更新**，始终保持最新版本。

安装完成后，输入 `claude` 即可启动。

### [方式二：Homebrew 安装](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E6%96%B9%E5%BC%8F%E4%BA%8Chomebrew-%E5%AE%89%E8%A3%85)

如果你习惯使用 Homebrew 管理软件：

```
brew install --cask claude-code
```

> **注意**：Homebrew 安装不支持自动更新，需要定期执行 `brew upgrade claude-code` 手动更新。

### [安装 Homebrew（如未安装）](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E5%AE%89%E8%A3%85-homebrew%E5%A6%82%E6%9C%AA%E5%AE%89%E8%A3%85)

如果你还没有 Homebrew：

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装完成后，根据终端提示将 Homebrew 添加到 PATH：

```
# Apple Silicon Mac (M1/M2/M3/M4)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Intel Mac
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

### [验证安装](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E9%AA%8C%E8%AF%81%E5%AE%89%E8%A3%85)

```
# 检查版本
claude --version

# 检查安装状态
claude doctor
```

* * *

## [首次启动与配置](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E9%A6%96%E6%AC%A1%E5%90%AF%E5%8A%A8%E4%B8%8E%E9%85%8D%E7%BD%AE)

启动 Claude Code：

```
claude
```

首次启动会有多个初始化设置：

1.  **认证方式**：选择登录 Anthropic 账号或使用 API Key
2.  **主题设置**：选择深色/浅色主题
3.  **权限设置**：选择默认权限级别

一路按回车使用默认值即可。

在 Claude Code 中输入 `hi` 测试是否正常工作。按 `Ctrl + C` 两次可退出。

* * *

## [网络代理配置（可选）](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E7%BD%91%E7%BB%9C%E4%BB%A3%E7%90%86%E9%85%8D%E7%BD%AE%E5%8F%AF%E9%80%89)

如果你需要配置代理访问网络，编辑 `~/.zshrc`：

```
# 临时设置代理
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890
```

或添加到配置文件持久化：

```
echo 'export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890' >> ~/.zshrc

source ~/.zshrc
```

常见代理软件默认端口：

代理软件

默认端口

ClashX / Clash

7890

V2RayU

10808

Shadowsocks

1080

Surge

6152

* * *

## [高级配置](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E9%AB%98%E7%BA%A7%E9%85%8D%E7%BD%AE)

### [配置 API Key](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E9%85%8D%E7%BD%AE-api-key)

Claude Code 支持多种认证方式：

#### [方式一：OAuth 登录（推荐）](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E6%96%B9%E5%BC%8F%E4%B8%80oauth-%E7%99%BB%E5%BD%95%E6%8E%A8%E8%8D%90)

首次启动时选择「Login with Anthropic」，会自动打开浏览器完成认证。

#### [方式二：API Key](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E6%96%B9%E5%BC%8F%E4%BA%8Capi-key)

如果你有 Anthropic API Key：

```
# 设置环境变量
export ANTHROPIC_API_KEY=your-api-key-here

# 添加到配置文件持久化
echo 'export ANTHROPIC_API_KEY=your-api-key-here' >> ~/.zshrc
source ~/.zshrc
```

#### [方式三：配置第三方 API 代理](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E6%96%B9%E5%BC%8F%E4%B8%89%E9%85%8D%E7%BD%AE%E7%AC%AC%E4%B8%89%E6%96%B9-api-%E4%BB%A3%E7%90%86)

如果使用第三方 API 代理服务：

```
# 设置 API 基础 URL
export ANTHROPIC_BASE_URL=https://your-proxy.com/v1

# 设置 API Key
export ANTHROPIC_API_KEY=your-proxy-api-key
```

### [配置文件位置](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E4%BD%8D%E7%BD%AE)

Claude Code 的配置文件位于 `~/.claude/` 目录：

文件

说明

`settings.json`

全局设置

`CLAUDE.md`

自定义系统提示词

`项目目录/.claude/settings.local.json`

项目级设置

### [自定义系统提示词](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%B3%BB%E7%BB%9F%E6%8F%90%E7%A4%BA%E8%AF%8D)

创建或编辑 `~/.claude/CLAUDE.md`：

```
# My Custom Instructions

- 使用中文回复
- 代码注释使用英文
- 优先使用 TypeScript
```

### [IDE 集成](https://stellarlink.co/articles/claude-code-installation-guide-macos#ide-%E9%9B%86%E6%88%90)

#### [VS Code 集成](https://stellarlink.co/articles/claude-code-installation-guide-macos#vs-code-%E9%9B%86%E6%88%90)

Claude Code 可以与 VS Code 终端无缝配合：

1.  在 VS Code 中打开项目
2.  打开终端（`Cmd +` ）
3.  运行 `claude`

#### [Cursor 集成](https://stellarlink.co/articles/claude-code-installation-guide-macos#cursor-%E9%9B%86%E6%88%90)

Cursor 用户可以直接在 Cursor 终端中使用 Claude Code。

* * *

## [macOS 特有配置](https://stellarlink.co/articles/claude-code-installation-guide-macos#macos-%E7%89%B9%E6%9C%89%E9%85%8D%E7%BD%AE)

### [终端推荐](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E7%BB%88%E7%AB%AF%E6%8E%A8%E8%8D%90)

macOS 推荐使用以下终端之一：

终端

特点

**iTerm2**

功能强大的终端模拟器，支持分屏、热键窗口

**Warp**

现代化 AI 终端，内置 AI 辅助

**Alacritty**

轻量高性能，GPU 加速渲染

**Kitty**

高性能，支持图片显示

**系统终端**

macOS 自带，满足基本需求

### [Rosetta 2（Intel 兼容层）](https://stellarlink.co/articles/claude-code-installation-guide-macos#rosetta-2intel-%E5%85%BC%E5%AE%B9%E5%B1%82)

如果你使用 Apple Silicon Mac 并遇到某些工具的兼容性问题：

```
softwareupdate --install-rosetta
```

### [防火墙设置](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E9%98%B2%E7%81%AB%E5%A2%99%E8%AE%BE%E7%BD%AE)

如果 macOS 防火墙阻止 Claude Code 网络连接：

1.  打开「系统设置」→「隐私与安全性」→「防火墙」
2.  点击「防火墙选项」
3.  找到相关项目，设置为「允许传入连接」

* * *

## [常用命令速查](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4%E9%80%9F%E6%9F%A5)

### [基本操作](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E5%9F%BA%E6%9C%AC%E6%93%8D%E4%BD%9C)

命令

说明

`claude`

启动 Claude Code

`claude --help`

查看帮助信息

`claude --version`

查看版本号

`claude doctor`

检查安装状态

`claude -c "your prompt"`

单次对话模式

### [会话内命令](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E4%BC%9A%E8%AF%9D%E5%86%85%E5%91%BD%E4%BB%A4)

命令

说明

`/help`

查看帮助

`/clear`

清除上下文

`/compact`

压缩上下文

`/cost`

查看当前会话成本

`/model`

切换模型

`/config`

打开配置

### [快捷键](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E5%BF%AB%E6%8D%B7%E9%94%AE)

快捷键

说明

`Ctrl + C`

中断当前操作

`Ctrl + C` × 2

退出 Claude Code

`Ctrl + L`

清屏

`↑` / `↓`

浏览历史输入

`Tab`

自动补全

* * *

## [常见问题排查](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E6%8E%92%E6%9F%A5)

### [Q1: 安装脚本执行失败](https://stellarlink.co/articles/claude-code-installation-guide-macos#q1-%E5%AE%89%E8%A3%85%E8%84%9A%E6%9C%AC%E6%89%A7%E8%A1%8C%E5%A4%B1%E8%B4%A5)

**问题**：`curl: command not found` 或下载失败

**解决方案**：

```
# 确保 curl 已安装（macOS 默认自带）
which curl

# 如果网络问题，检查代理配置
echo $http_proxy

# 尝试直接访问
curl -I https://claude.ai
```

### [Q2: Homebrew 安装报错](https://stellarlink.co/articles/claude-code-installation-guide-macos#q2-homebrew-%E5%AE%89%E8%A3%85%E6%8A%A5%E9%94%99)

**问题**：`brew install` 失败

**解决方案**：

```
# 更新 Homebrew
brew update

# 清理缓存
brew cleanup

# 重试安装
brew install --cask claude-code
```

### [Q3: 防火墙阻止连接](https://stellarlink.co/articles/claude-code-installation-guide-macos#q3-%E9%98%B2%E7%81%AB%E5%A2%99%E9%98%BB%E6%AD%A2%E8%BF%9E%E6%8E%A5)

**问题**：macOS 系统提示是否允许网络连接

**解决方案**：点击「允许」。如果误点了拒绝：

1.  打开「系统设置」→「隐私与安全性」→「防火墙」
2.  点击「防火墙选项」
3.  找到相关项目，设置为「允许传入连接」

### [Q4: Claude Code 启动后无响应](https://stellarlink.co/articles/claude-code-installation-guide-macos#q4-claude-code-%E5%90%AF%E5%8A%A8%E5%90%8E%E6%97%A0%E5%93%8D%E5%BA%94)

**问题**：启动后长时间无响应或报错

**排查步骤**：

1.  检查网络连接：`curl -I https://claude.ai`
2.  检查 API Key：`echo $ANTHROPIC_API_KEY`
3.  查看详细日志：`claude --verbose`
4.  重置配置：`rm -rf ~/.claude && claude`

### [Q5: Apple Silicon 兼容性问题](https://stellarlink.co/articles/claude-code-installation-guide-macos#q5-apple-silicon-%E5%85%BC%E5%AE%B9%E6%80%A7%E9%97%AE%E9%A2%98)

**问题**：在 M1/M2/M3/M4 Mac 上某些功能异常

**解决方案**：

```
# 安装 Rosetta 2
softwareupdate --install-rosetta

# 或在 Rosetta 模式下运行终端
# 右键终端应用 → 显示简介 → 勾选「使用 Rosetta 打开」
```

### [Q6: 如何更新 Claude Code](https://stellarlink.co/articles/claude-code-installation-guide-macos#q6-%E5%A6%82%E4%BD%95%E6%9B%B4%E6%96%B0-claude-code)

根据安装方式选择更新方法：

```
# 官方脚本安装（自动更新，通常无需手动操作）
# 如需强制更新，重新执行安装脚本：
curl -fsSL https://claude.ai/install.sh | bash

# Homebrew 安装
brew upgrade claude-code
```

### [Q7: 如何完全卸载](https://stellarlink.co/articles/claude-code-installation-guide-macos#q7-%E5%A6%82%E4%BD%95%E5%AE%8C%E5%85%A8%E5%8D%B8%E8%BD%BD)

```
# 官方脚本安装
rm -rf ~/.claude
rm -f /usr/local/bin/claude

# Homebrew 安装
brew uninstall claude-code
rm -rf ~/.claude
```

* * *

## [最佳实践](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)

### [1\. 使用项目级配置](https://stellarlink.co/articles/claude-code-installation-guide-macos#1-%E4%BD%BF%E7%94%A8%E9%A1%B9%E7%9B%AE%E7%BA%A7%E9%85%8D%E7%BD%AE)

为每个项目创建 `.claude/` 目录，存放项目特定的配置和提示词。

```
mkdir -p your-project/.claude
echo "# Project-specific instructions" > your-project/.claude/CLAUDE.md
```

### [2\. 配合 Git 使用](https://stellarlink.co/articles/claude-code-installation-guide-macos#2-%E9%85%8D%E5%90%88-git-%E4%BD%BF%E7%94%A8)

Claude Code 与 Git 集成良好，可以直接进行 commit、创建 PR 等操作。建议在 Git 仓库中使用。

### [3\. 合理使用上下文](https://stellarlink.co/articles/claude-code-installation-guide-macos#3-%E5%90%88%E7%90%86%E4%BD%BF%E7%94%A8%E4%B8%8A%E4%B8%8B%E6%96%87)

*   使用 `/clear` 清除无关上下文
*   使用 `/compact` 压缩长对话
*   大型项目中善用 `@file` 引用特定文件

### [4\. 终端配置优化](https://stellarlink.co/articles/claude-code-installation-guide-macos#4-%E7%BB%88%E7%AB%AF%E9%85%8D%E7%BD%AE%E4%BC%98%E5%8C%96)

```
# 在 ~/.zshrc 中添加别名
alias cc='claude'
alias ccc='claude -c'
```

### [5\. 安全注意事项](https://stellarlink.co/articles/claude-code-installation-guide-macos#5-%E5%AE%89%E5%85%A8%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

*   不要在公共环境中暴露 API Key
*   定期检查 Claude Code 的文件操作权限
*   敏感项目建议使用受限权限模式
*   API Key 不要提交到 Git 仓库

* * *

## [总结](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E6%80%BB%E7%BB%93)

完成本指南后，你应该能够：

✅ 使用官方脚本或 Homebrew 安装 Claude Code ✅ 完成首次启动和基本配置 ✅ 配置网络代理和 API Key ✅ 解决常见的安装和使用问题

Claude Code 是一个强大的 AI 编程助手，熟练使用后可以显著提升开发效率。如有问题，可参考 [官方文档](https://code.claude.com/docs/en/overview) 或在 [GitHub Issues](https://github.com/anthropics/claude-code/issues) 提交反馈。

* * *

## [参考资源](https://stellarlink.co/articles/claude-code-installation-guide-macos#%E5%8F%82%E8%80%83%E8%B5%84%E6%BA%90)

*   [Claude Code 官方文档](https://code.claude.com/docs/en/overview)
*   [Claude Code 安装指南](https://code.claude.com/docs/en/setup)
*   [Claude Code GitHub 仓库](https://github.com/anthropics/claude-code)
*   [Claude 开发者平台](https://platform.claude.com/docs/en/home)
*   [Homebrew 官网](https://brew.sh/)
