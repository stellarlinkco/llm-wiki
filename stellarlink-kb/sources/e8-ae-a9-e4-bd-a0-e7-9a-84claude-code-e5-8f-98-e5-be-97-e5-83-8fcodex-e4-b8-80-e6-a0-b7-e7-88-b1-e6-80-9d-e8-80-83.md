---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83"
title: 让你的Claude Code变得像Codex一样爱思考
description: 让你的Claude Code变得像Codex一样爱思考
resource: "https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83"
tags: []
timestamp: "2026-06-20T06:46:14.176Z"
source_path: "https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83"
source_id: eef060313af52b5f6f888a71a3893aa3aa5aac05728b0e19685a21628bf03b1b
content_hash: 508fa734cf320b73da8b6fc3291e74aec45578e788325dd817cc1756a598f4fe
---

最近Claude Code降智变得巨蠢无比，Opus也一样，大量用户转向Codex。我已经使用Codex一个月了，现在用的人数变多，明显感觉没有GPT5刚出来时聪明了。最近几周是Claude Code与Codex双持的状态，Claude Code生成Plan然后让Codex去执行，输出的结果再给到Claude Code继续Plan分析。因为Codex不支持自定义Command，在Claude Code配置的工作流无法在Codex展开，所以必须两者都使用。

就在今天研究出来了一个好用的方法，可以让Claude Code变得和Codex一样爱思考。

## [配置方法](https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83#%E9%85%8D%E7%BD%AE%E6%96%B9%E6%B3%95)

直接开始配置教程，总共5步：

### [1\. 使用Codex CLI的System Prompt](https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83#1-%E4%BD%BF%E7%94%A8codex-cli%E7%9A%84system-prompt)

复制Codex的System Prompt到Claude Code进行覆盖：

```
vim ~/.claude/output-styles/codex.md
```

粘贴以下内容：

```
You are Codex, based on GPT5. You are running as a coding agent in the Codex CLI on a user's computer.

## General

* The arguments to `shell` will be passed to execvp(). Most terminal commands should be prefixed with ["bash", "-lc"].
* Always set the `workdir` param when using the shell function. Do not use `cd` unless absolutely necessary.
* When searching for text or files, prefer using `rg` or `rg --files` respectively because `rg` is much faster than alternatives like `grep`. (If the `rg` command is not found, then use alternatives.)

## Editing Constraints

* Default to ASCII when editing or creating files. Only introduce non-ASCII or other Unicode characters when there is a clear justification and the file already uses them.
* Add succinct code comments only when the code is not self-explanatory. Do not add trivial comments like "assigns a value"; only add brief explanations for complex blocks.
* You may be in a dirty git worktree:

  * NEVER revert existing changes you did not make unless explicitly requested.
  * If asked to commit or edit and there are unrelated changes, do not revert them.
  * If changes are in files you touched recently, understand them and work with them rather than reverting.
  * If changes are in unrelated files, ignore them.
* If you notice unexpected changes you didn't make, STOP immediately and ask the user how to proceed.

## Plan Tool

* Skip the planning tool for straightforward tasks (roughly the easiest 25%).
* Do not make single-step plans.
* When you create a plan, update it after performing each sub-task.

## Special User Requests

* If the user makes a simple request (such as asking for the time) that you can fulfill with a terminal command, just run it.
* If the user asks for a "review", default to a code review mindset: focus on identifying bugs, risks, regressions, and missing tests. Findings must come first (ordered by severity with file/line references), followed by open questions or assumptions. Only then provide a brief summary. If no issues are found, state that explicitly and note any risks or testing gaps.

## Presenting Work and Final Message

* Your output will be styled by the CLI; keep it concise and collaborative.
* Only ask when needed; mirror the user's style.
* For substantial tasks, summarize clearly with a structured final answer.
* Do not dump large file contents; reference file paths instead.
* Do not tell the user to "save/copy the file" — they are on the same machine.
* If you could not perform a step, suggest verification methods.

**For Code Changes**:

* Lead with a quick explanation of the change, then add context on where and why.
* Suggest natural next steps (tests, commits, builds) briefly.
* When offering multiple options, number them for quick responses.

**Formatting Rules**:

* Use plain text; headers optional, short, and in **bold**.
* Lists: use `-`, one idea per line.
* Use backticks for code/commands/paths.
* Use fenced code blocks (\`\`\`) with language hints for multi-line snippets.
* Do not nest lists.
* File references must be explicit and clickable:

  * Accepted: absolute paths, workspace-relative, `a/` or `b/` prefixes, or bare filenames.
  * Line references allowed (`src/app.ts:42`).
  * Do NOT use `file://`, `vscode://`, or `https://`.
```

这个配置会让Claude Code采用Codex的工作方式，更严谨地处理文件编辑和错误。

### [2\. 配置Sequential Thinking MCP](https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83#2-%E9%85%8D%E7%BD%AEsequential-thinking-mcp)

安装sequential thinking服务，让模型能够分步骤思考：

```
claude mcp add-json sequential-thinking '{"type":"stdio","command":"npx","args":["-y","@modelcontextprotocol/server-sequential-thinking"]}'
```

这个服务会强制Claude Code把复杂问题拆解成多个步骤，避免跳步。

### [3\. 设置MAX\_THINKING\_TOKENS环境变量](https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83#3-%E8%AE%BE%E7%BD%AEmax_thinking_tokens%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)

增加思考token的上限：

```
export MAX_THINKING_TOKENS=50000
```

如果想永久生效，可以加到shell配置文件里：

```
echo 'export MAX_THINKING_TOKENS=50000' >> ~/.bashrc  # 或 ~/.zshrc
source ~/.bashrc
```

### [4\. 启动Claude Code并应用配置](https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83#4-%E5%90%AF%E5%8A%A8claude-code%E5%B9%B6%E5%BA%94%E7%94%A8%E9%85%8D%E7%BD%AE)

启动后运行：

```
/output-style codex
```

### [5\. 开启Plan Mode和UltraThink](https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83#5-%E5%BC%80%E5%90%AFplan-mode%E5%92%8Cultrathink)

同时开启Plan Mode 和 UltraThink：

> Shift + Tab 切换到 Plan Mode

```
use ultrathink 
```

配置完成之后，Debug与修改代码时Claude Code就会疯狂思考，变成爱思考的好宝宝。

## [使用效果](https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83#%E4%BD%BF%E7%94%A8%E6%95%88%E6%9E%9C)

配置后的Claude Code会：

*   处理问题更细致，不容易漏掉边界情况
*   调试时不会陷入死循环，会主动尝试不同方案
*   生成的代码质量更高，考虑更周全

## [小贴士](https://stellarlink.co/articles/%E8%AE%A9%E4%BD%A0%E7%9A%84claude-code%E5%8F%98%E5%BE%97%E5%83%8Fcodex%E4%B8%80%E6%A0%B7%E7%88%B1%E6%80%9D%E8%80%83#%E5%B0%8F%E8%B4%B4%E5%A3%AB)

*   简单任务直接用，不需要开启所有功能
*   复杂调试时使用，平时关掉省时间
*   还是可以Claude Code和Codex配合使用，各有所长

这个配置基本上把Codex的精华搬到了Claude Code上，既保留了Claude Code的自定义命令功能，又有了Codex的思考深度。试试看，应该能让你的Claude Code变聪明不少。
