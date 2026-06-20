---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/claude-code-installation-guide-all-platforms"
title: Claude Code 安装配置完全指南：Windows / macOS / Linux
description: Claude Code 安装配置完全指南 Windows macOS Linux
resource: "https://stellarlink.co/articles/claude-code-installation-guide-all-platforms"
tags: []
timestamp: "2026-06-20T06:45:35.778Z"
source_path: "https://stellarlink.co/articles/claude-code-installation-guide-all-platforms"
source_id: b2a9706e290c6496cf62d4f8805e6a9bf1f48e130e28d2458d05756b0c5a2e36
content_hash: f4f11025c442e079743d3d7799c76d2df77b1d83e8b7f72c8675ee798b1bb6e8
---

## [Claude Code 安装配置完全指南：Windows / macOS / Linux](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#claude-code-%E5%AE%89%E8%A3%85%E9%85%8D%E7%BD%AE%E5%AE%8C%E5%85%A8%E6%8C%87%E5%8D%97windows--macos--linux)

> **TLDR**: 本文详细介绍如何在 Windows、macOS 和 Linux 三大操作系统上安装和配置 Claude Code。Windows 支持原生安装或 WSL 方式，macOS 和 Linux 可直接使用官方安装脚本。全文覆盖环境准备、安装步骤、代理配置和常见问题排查。

Claude Code 是 Anthropic 推出的官方 CLI 工具，让你可以在终端中直接与 Claude 交互进行软件开发。它支持：

*   直接在终端中与 Claude 对话
*   读取、编写和修改代码文件
*   执行 Shell 命令
*   搜索和分析代码库
*   集成 Git 工作流

与传统的 Web 界面相比，Claude Code 更适合开发者：无需复制粘贴代码，Claude 可以直接操作你的项目文件。

## [系统要求](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E7%B3%BB%E7%BB%9F%E8%A6%81%E6%B1%82)

### [通用要求](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E9%80%9A%E7%94%A8%E8%A6%81%E6%B1%82)

组件

最低要求

网络

能访问 claude.ai（或配置 API 代理）

终端

支持 ANSI 转义序列的现代终端

> **注意**：原生安装方式不需要预装 Node.js，安装脚本会自动处理依赖。

### [各平台特定要求](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E5%90%84%E5%B9%B3%E5%8F%B0%E7%89%B9%E5%AE%9A%E8%A6%81%E6%B1%82)

平台

版本要求

Windows

Windows 10 2004 或更高版本

macOS

macOS 13 Ventura 或更高版本

Linux

主流发行版（Ubuntu 20.04+、Debian 11+、Fedora 36+）

* * *

## [第一部分：Windows 安装指南](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E7%AC%AC%E4%B8%80%E9%83%A8%E5%88%86windows-%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)

Windows 用户有两种安装方式：**原生安装**（推荐）和 **WSL 安装**。

### [方式一：原生安装（推荐）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%96%B9%E5%BC%8F%E4%B8%80%E5%8E%9F%E7%94%9F%E5%AE%89%E8%A3%85%E6%8E%A8%E8%8D%90)

原生安装支持自动更新，是官方推荐的安装方式。

#### [PowerShell 安装](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#powershell-%E5%AE%89%E8%A3%85)

以管理员身份打开 PowerShell，执行：

```
irm https://claude.ai/install.ps1 | iex
```

#### [CMD 安装](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#cmd-%E5%AE%89%E8%A3%85)

打开命令提示符，执行：

```
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

#### [WinGet 安装](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#winget-%E5%AE%89%E8%A3%85)

如果你使用 Windows 包管理器：

```
winget install Anthropic.ClaudeCode
```

> **注意**：WinGet 安装不支持自动更新，需要手动执行 `winget upgrade Anthropic.ClaudeCode` 更新。

安装完成后，打开新的终端窗口，输入 `claude` 即可启动。

* * *

### [方式二：WSL 安装](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%96%B9%E5%BC%8F%E4%BA%8Cwsl-%E5%AE%89%E8%A3%85)

> **适用场景**：如果你需要与 macOS/Linux 完全一致的终端体验，或需要使用 Linux 特定工具，可以选择 WSL 方式。

#### [步骤 1：启用 Windows 子系统功能](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-1%E5%90%AF%E7%94%A8-windows-%E5%AD%90%E7%B3%BB%E7%BB%9F%E5%8A%9F%E8%83%BD)

1.  按 `Win + S` 搜索「启用或关闭 Windows 功能」
2.  找到「适用于 Linux 的 Windows 子系统」选项
3.  勾选后点击「确定」
4.  等待安装完成，按提示重启电脑

### [步骤 2：安装 WSL](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-2%E5%AE%89%E8%A3%85-wsl)

⚠️ **注意**：请使用 PowerShell 或 Windows Terminal，**不要使用 CMD**。

打开 PowerShell（以管理员身份），执行：

```
wsl --install
```

安装完成后系统会提示重启，按要求重启电脑。

### [步骤 3：安装 Ubuntu 发行版](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-3%E5%AE%89%E8%A3%85-ubuntu-%E5%8F%91%E8%A1%8C%E7%89%88)

重启后，打开 PowerShell 或 Windows Terminal：

```
wsl --install -d Ubuntu
```

安装完成后会要求创建 Linux 用户名和密码。

💡 **密码输入提示**：输入密码时屏幕不会显示任何字符，这是 Linux 的安全特性，正常输入后按回车即可。

### [步骤 4：进入 WSL 终端](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-4%E8%BF%9B%E5%85%A5-wsl-%E7%BB%88%E7%AB%AF)

两种方式打开 WSL：

**方式一**：在 Windows Terminal 标签栏右侧的下拉菜单中选择「Ubuntu」

**方式二**：在 PowerShell 中直接输入：

```
wsl
```

### [步骤 5：配置网络代理（可选）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-5%E9%85%8D%E7%BD%AE%E7%BD%91%E7%BB%9C%E4%BB%A3%E7%90%86%E5%8F%AF%E9%80%89)

⚠️ **重要**：WSL 终端的网络与 Windows 系统网络是独立的，需要单独配置代理。

根据你的代理软件选择对应端口：

代理软件

默认端口

Clash

7890

V2Ray

10808

Shadowsocks

1080

将以下命令中的端口号替换为你的代理端口：

```
# 设置代理环境变量（以 10808 端口为例）
echo 'export http_proxy=http://127.0.0.1:10808 https_proxy=http://127.0.0.1:10808 all_proxy=socks5://127.0.0.1:10808' >> ~/.bashrc && source ~/.bashrc
```

验证代理是否生效：

```
curl -I https://www.google.com
```

### [步骤 6：安装基础开发工具](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-6%E5%AE%89%E8%A3%85%E5%9F%BA%E7%A1%80%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7)

更新包管理器并安装必要工具：

```
sudo apt update && sudo apt install -y git curl unzip
```

#### [步骤 7：安装 Claude Code](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-7%E5%AE%89%E8%A3%85-claude-code)

执行官方安装脚本（推荐）：

```
curl -fsSL https://claude.ai/install.sh | bash
```

💡 **提示**：原生安装脚本会自动处理依赖，无需手动安装 Node.js。安装过程可能需要几分钟，请耐心等待。

#### [步骤 8：启动并配置 Claude Code](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-8%E5%90%AF%E5%8A%A8%E5%B9%B6%E9%85%8D%E7%BD%AE-claude-code)

首次启动：

```
claude
```

首次启动会有多个初始化设置：

1.  **认证方式**：选择登录 Anthropic 账号或使用 API Key
2.  **主题设置**：选择深色/浅色主题
3.  **权限设置**：选择默认权限级别

一路按回车使用默认值即可。

#### [步骤 9：验证安装](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%AD%A5%E9%AA%A4-9%E9%AA%8C%E8%AF%81%E5%AE%89%E8%A3%85)

在 Claude Code 中输入：

```
hi
```

如果 Claude 正常回复，说明安装成功！

按 `Ctrl + C` 两次可退出 Claude Code。

可以使用 `claude doctor` 命令检查安装状态和版本信息。

* * *

## [第二部分：macOS 安装指南](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E7%AC%AC%E4%BA%8C%E9%83%A8%E5%88%86macos-%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)

macOS 有两种安装方式：**原生脚本安装**（推荐）和 **Homebrew 安装**。

### [方式一：原生脚本安装（推荐）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%96%B9%E5%BC%8F%E4%B8%80%E5%8E%9F%E7%94%9F%E8%84%9A%E6%9C%AC%E5%AE%89%E8%A3%85%E6%8E%A8%E8%8D%90)

打开终端，执行：

```
curl -fsSL https://claude.ai/install.sh | bash
```

原生安装支持**自动后台更新**，始终保持最新版本。

### [方式二：Homebrew 安装](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%96%B9%E5%BC%8F%E4%BA%8Chomebrew-%E5%AE%89%E8%A3%85)

如果你习惯使用 Homebrew 管理软件：

```
brew install --cask claude-code
```

> **注意**：Homebrew 安装不支持自动更新，需要定期执行 `brew upgrade claude-code` 手动更新。

### [安装 Homebrew（如未安装）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E5%AE%89%E8%A3%85-homebrew%E5%A6%82%E6%9C%AA%E5%AE%89%E8%A3%85)

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

### [配置网络代理（可选）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E9%85%8D%E7%BD%AE%E7%BD%91%E7%BB%9C%E4%BB%A3%E7%90%86%E5%8F%AF%E9%80%89)

如果需要配置代理，编辑 `~/.zshrc`：

```
# 临时设置代理
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890

# 或添加到 ~/.zshrc 持久化
echo 'export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890' >> ~/.zshrc

source ~/.zshrc
```

### [启动 Claude Code](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E5%90%AF%E5%8A%A8-claude-code)

```
claude
```

完成初始化设置后即可使用。使用 `claude doctor` 可检查安装状态。

### [macOS 特有配置](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#macos-%E7%89%B9%E6%9C%89%E9%85%8D%E7%BD%AE)

#### [终端推荐](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E7%BB%88%E7%AB%AF%E6%8E%A8%E8%8D%90)

macOS 推荐使用以下终端之一：

*   **iTerm2**：功能强大的终端模拟器
*   **Warp**：现代化 AI 终端
*   **Alacritty**：轻量高性能终端
*   **系统终端**：macOS 自带终端也可满足基本需求

#### [Rosetta 2（Intel 兼容层）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#rosetta-2intel-%E5%85%BC%E5%AE%B9%E5%B1%82)

如果你使用 Apple Silicon Mac 并遇到兼容性问题：

```
softwareupdate --install-rosetta
```

* * *

## [第三部分：Linux 安装指南](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E7%AC%AC%E4%B8%89%E9%83%A8%E5%88%86linux-%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)

Linux 上推荐使用官方安装脚本，适用于所有主流发行版。

### [通用安装方式（推荐）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E9%80%9A%E7%94%A8%E5%AE%89%E8%A3%85%E6%96%B9%E5%BC%8F%E6%8E%A8%E8%8D%90)

适用于 Ubuntu、Debian、Fedora、Arch 等所有发行版：

```
curl -fsSL https://claude.ai/install.sh | bash
```

安装脚本会自动检测系统架构（x64/arm64）和 libc 类型（glibc/musl），下载对应的二进制文件并完成安装。

### [验证安装](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E9%AA%8C%E8%AF%81%E5%AE%89%E8%A3%85)

```
# 检查版本
claude --version

# 检查安装状态
claude doctor
```

### [手动安装依赖（可选）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%89%8B%E5%8A%A8%E5%AE%89%E8%A3%85%E4%BE%9D%E8%B5%96%E5%8F%AF%E9%80%89)

如果安装脚本执行失败，可能需要先安装 curl：

```
# Ubuntu / Debian
sudo apt update && sudo apt install -y curl

# Fedora
sudo dnf install -y curl

# Arch Linux
sudo pacman -S curl

# 然后重新执行安装脚本
curl -fsSL https://claude.ai/install.sh | bash
```

### [Linux 代理配置](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#linux-%E4%BB%A3%E7%90%86%E9%85%8D%E7%BD%AE)

编辑 `~/.bashrc` 或 `~/.zshrc`：

```
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890
export no_proxy=localhost,127.0.0.1
```

保存后执行 `source ~/.bashrc` 生效。

* * *

## [第四部分：高级配置](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E7%AC%AC%E5%9B%9B%E9%83%A8%E5%88%86%E9%AB%98%E7%BA%A7%E9%85%8D%E7%BD%AE)

### [配置 API Key](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E9%85%8D%E7%BD%AE-api-key)

Claude Code 支持多种认证方式：

#### [方式一：OAuth 登录（推荐）](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%96%B9%E5%BC%8F%E4%B8%80oauth-%E7%99%BB%E5%BD%95%E6%8E%A8%E8%8D%90)

首次启动时选择「Login with Anthropic」，会自动打开浏览器完成认证。

#### [方式二：API Key](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%96%B9%E5%BC%8F%E4%BA%8Capi-key)

如果你有 Anthropic API Key：

```
# 设置环境变量
export ANTHROPIC_API_KEY=your-api-key-here

# 或添加到配置文件持久化
echo 'export ANTHROPIC_API_KEY=your-api-key-here' >> ~/.bashrc
source ~/.bashrc
```

#### [方式三：配置第三方 API 代理](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%96%B9%E5%BC%8F%E4%B8%89%E9%85%8D%E7%BD%AE%E7%AC%AC%E4%B8%89%E6%96%B9-api-%E4%BB%A3%E7%90%86)

如果使用第三方 API 代理服务：

```
# 设置 API 基础 URL
export ANTHROPIC_BASE_URL=https://your-proxy.com/v1

# 设置 API Key
export ANTHROPIC_API_KEY=your-proxy-api-key
```

### [配置文件位置](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E4%BD%8D%E7%BD%AE)

Claude Code 的配置文件位于：

平台

配置目录

macOS

`~/.claude/`

Linux

`~/.claude/`

Windows (WSL)

`~/.claude/`

主要配置文件：

*   `~/.claude/settings.json`：全局设置
*   `~/.claude/CLAUDE.md`：自定义系统提示词
*   `项目目录/.claude/settings.local.json`：项目级设置

### [自定义系统提示词](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%B3%BB%E7%BB%9F%E6%8F%90%E7%A4%BA%E8%AF%8D)

创建或编辑 `~/.claude/CLAUDE.md`：

```
# My Custom Instructions

- 使用中文回复
- 代码注释使用英文
- 优先使用 TypeScript
```

### [IDE 集成](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#ide-%E9%9B%86%E6%88%90)

#### [VS Code 集成](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#vs-code-%E9%9B%86%E6%88%90)

Claude Code 可以与 VS Code 终端无缝配合：

1.  在 VS Code 中打开项目
2.  打开终端（`Ctrl +` ）
3.  运行 `claude`

#### [Cursor 集成](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#cursor-%E9%9B%86%E6%88%90)

Cursor 用户可以直接在 Cursor 终端中使用 Claude Code。

* * *

## [第五部分：常用命令速查](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E7%AC%AC%E4%BA%94%E9%83%A8%E5%88%86%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4%E9%80%9F%E6%9F%A5)

### [基本操作](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E5%9F%BA%E6%9C%AC%E6%93%8D%E4%BD%9C)

命令

说明

`claude`

启动 Claude Code

`claude --help`

查看帮助信息

`claude --version`

查看版本号

`claude -c "your prompt"`

单次对话模式

### [会话内命令](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E4%BC%9A%E8%AF%9D%E5%86%85%E5%91%BD%E4%BB%A4)

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

### [快捷键](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E5%BF%AB%E6%8D%B7%E9%94%AE)

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

## [常见问题排查](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E6%8E%92%E6%9F%A5)

### [Q1: 安装脚本执行失败](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#q1-%E5%AE%89%E8%A3%85%E8%84%9A%E6%9C%AC%E6%89%A7%E8%A1%8C%E5%A4%B1%E8%B4%A5)

**问题**：`curl` 命令报错或脚本下载失败

**解决方案**：

```
# 检查网络连接
curl -I https://claude.ai

# 如果网络不通，检查代理配置
echo $http_proxy

# 手动下载安装（macOS/Linux）
# 访问 https://code.claude.com/docs/en/setup 获取最新安装方式
```

### [Q2: WSL 中网络不通](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#q2-wsl-%E4%B8%AD%E7%BD%91%E7%BB%9C%E4%B8%8D%E9%80%9A)

**问题**：WSL 中无法访问网络或代理不生效

**解决方案**：

1.  确保 Windows 代理软件开启了「允许局域网连接」
2.  检查 WSL 中的代理端口是否正确
3.  尝试使用 Windows 主机 IP 而非 127.0.0.1：

```
# 获取 Windows 主机 IP
export WIN_HOST=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
export http_proxy=http://$WIN_HOST:7890
export https_proxy=http://$WIN_HOST:7890
```

### [Q3: Claude Code 启动后无响应](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#q3-claude-code-%E5%90%AF%E5%8A%A8%E5%90%8E%E6%97%A0%E5%93%8D%E5%BA%94)

**问题**：启动后长时间无响应或报错

**排查步骤**：

1.  检查网络连接：`curl -I https://claude.ai`
2.  检查 API Key：`echo $ANTHROPIC_API_KEY`
3.  查看详细日志：`claude --verbose`
4.  重置配置：`rm -rf ~/.claude && claude`

### [Q4: 安装后命令找不到](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#q4-%E5%AE%89%E8%A3%85%E5%90%8E%E5%91%BD%E4%BB%A4%E6%89%BE%E4%B8%8D%E5%88%B0)

**问题**：安装完成后执行 `claude` 提示 `command not found`

**解决方案**：

```
# 重新打开终端窗口，或手动加载配置
source ~/.bashrc  # Linux/WSL
source ~/.zshrc   # macOS

# 检查安装路径
which claude
ls -la /usr/local/bin/claude

# 如果仍然找不到，重新执行安装脚本
curl -fsSL https://claude.ai/install.sh | bash
```

### [Q5: macOS 防火墙阻止连接](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#q5-macos-%E9%98%B2%E7%81%AB%E5%A2%99%E9%98%BB%E6%AD%A2%E8%BF%9E%E6%8E%A5)

**问题**：macOS 系统提示是否允许网络连接

**解决方案**：点击「允许」。如果误点了拒绝：

1.  打开「系统设置」→「隐私与安全性」→「防火墙」
2.  点击「防火墙选项」
3.  找到 Claude Code 相关项目，设置为「允许传入连接」

### [Q6: 如何更新 Claude Code](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#q6-%E5%A6%82%E4%BD%95%E6%9B%B4%E6%96%B0-claude-code)

根据安装方式选择更新方法：

```
# 原生安装（自动更新，通常无需手动操作）
# 如需强制更新，重新执行安装脚本：
curl -fsSL https://claude.ai/install.sh | bash

# Homebrew 安装
brew upgrade claude-code

# WinGet 安装
winget upgrade Anthropic.ClaudeCode
```

### [Q7: 如何完全卸载](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#q7-%E5%A6%82%E4%BD%95%E5%AE%8C%E5%85%A8%E5%8D%B8%E8%BD%BD)

```
# macOS / Linux 原生安装
rm -rf ~/.claude
rm -f /usr/local/bin/claude

# Homebrew 安装
brew uninstall claude-code

# WinGet 安装
winget uninstall Anthropic.ClaudeCode

# 清理配置文件（所有平台通用）
rm -rf ~/.claude
```

* * *

## [最佳实践](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)

### [1\. 使用项目级配置](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#1-%E4%BD%BF%E7%94%A8%E9%A1%B9%E7%9B%AE%E7%BA%A7%E9%85%8D%E7%BD%AE)

为每个项目创建 `.claude/` 目录，存放项目特定的配置和提示词。

### [2\. 配合 Git 使用](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#2-%E9%85%8D%E5%90%88-git-%E4%BD%BF%E7%94%A8)

Claude Code 与 Git 集成良好，可以直接进行 commit、创建 PR 等操作。建议在 Git 仓库中使用。

### [3\. 合理使用上下文](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#3-%E5%90%88%E7%90%86%E4%BD%BF%E7%94%A8%E4%B8%8A%E4%B8%8B%E6%96%87)

*   使用 `/clear` 清除无关上下文
*   使用 `/compact` 压缩长对话
*   大型项目中善用 `@file` 引用

### [4\. 安全注意事项](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#4-%E5%AE%89%E5%85%A8%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

*   不要在公共环境中暴露 API Key
*   定期检查 Claude Code 的文件操作权限
*   敏感项目建议使用受限权限模式

* * *

## [总结](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E6%80%BB%E7%BB%93)

完成本指南后，你应该能够：

✅ 在 Windows（通过 WSL）上成功安装 Claude Code ✅ 在 macOS 上直接安装配置 Claude Code ✅ 在各主流 Linux 发行版上安装 Claude Code ✅ 配置网络代理和 API Key ✅ 解决常见的安装和使用问题

Claude Code 是一个强大的 AI 编程助手，熟练使用后可以显著提升开发效率。如有问题，可参考 [官方文档](https://code.claude.com/docs/en/overview) 或在 [GitHub Issues](https://github.com/anthropics/claude-code/issues) 提交反馈。

* * *

## [参考资源](https://stellarlink.co/articles/claude-code-installation-guide-all-platforms#%E5%8F%82%E8%80%83%E8%B5%84%E6%BA%90)

*   [Claude Code 官方文档](https://code.claude.com/docs/en/overview)
*   [Claude Code 安装指南](https://code.claude.com/docs/en/setup)
*   [Claude Code GitHub 仓库](https://github.com/anthropics/claude-code)
*   [Claude 开发者平台](https://platform.claude.com/docs/en/home)
*   [WSL 官方文档](https://learn.microsoft.com/windows/wsl/)
