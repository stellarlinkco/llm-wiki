---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD"
title: 我如何使用 Claude Code 的每一项功能
description: 我非常频繁地使用 Claude Code
resource: "https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD"
tags: []
timestamp: "2026-06-20T06:46:10.279Z"
source_path: "https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD"
source_id: 312eb185bd470161257a1bbc99c5fa8052677693777454379b632805d9730de8
content_hash: 2a258bfbf4503bae7d5d791d694e90ce7f675818e3eea7d71414cc9bce8ece13
---

我非常频繁地使用 Claude Code。

作为爱好者，我每周会在一台虚拟机里多次用它做副项目，常常配合 `--dangerously-skip-permissions`，随手“vibe code”脑海里的点子。专业上，我所在团队的一部分负责为工程团队打造 AI-IDE 的规则与工具，仅代码生成就每月消费数十亿 tokens。

CLI 代理正在变得拥挤：Claude Code、Gemini CLI、Cursor、Codex CLI。感觉真正的赛点在 Anthropic 和 OpenAI 之间。但说实话，很多开发者的选择常常取决于看似表层的东西——一个“碰巧”顺手的特性实现，或他们更喜欢的系统提示词“气质”。此刻这些工具都已经挺好用。大家也容易过度关注输出风格或 UI。对我来说，“你说得太对了！”这种谄媚感不是 bug，而是在提醒你“你把自己塞进回路太深了”。我总体目标是“发射后不管”——委派，设定上下文，然后让它工作。用最终 PR 来评判工具，而不是它到达终点的过程。

坚持主要使用 Claude Code 的这几个月，这是我对其生态的一些思考。我们会覆盖我用到的几乎所有特性（以及同样重要的，我不用的特性）：从基础的 `CLAUDE.md` 文件、定制的斜杠命令，到强大的 Subagents、Hooks、GitHub Actions 的世界。本文偏长，更适合作为参考资料，而不是一口气读完。

## [CLAUDE.md](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#claudemd)

链接：[https://www.anthropic.com/engineering/claude-code-best-practices](https://www.anthropic.com/engineering/claude-code-best-practices)

你代码库里对 Claude Code 最重要的文件，是仓库根目录的 `CLAUDE.md`。它是代理的“宪法”，是你的仓库如何运作的主要真相来源。

怎么对待这个文件取决于场景。做业余项目时，我让 Claude 想写啥就写啥。

在工作中，我们的 monorepo 的 `CLAUDE.md` 维护严格，目前约 13KB（很容易长到 25KB）。

*   只记录至少约 30% 工程师会用到的工具和 API（其他工具分别放在对应产品或库的 markdown 文档里）。
*   我们甚至给每个内部工具的文档“分配”了一个最大 token 额度，有点像卖“广告位”。解释不清楚的工具，就不配进 `CLAUDE.md`。

#### [Tips 与常见反模式](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#tips-%E4%B8%8E%E5%B8%B8%E8%A7%81%E5%8F%8D%E6%A8%A1%E5%BC%8F)

随着时间，我们形成了一套写好 `CLAUDE.md` 的明确观点：

1.  从护栏开始，而不是写手册。 你的 `CLAUDE.md` 从小做起，针对 Claude 常犯的错误去写。
    
2.  不要直接 @ 文件文档。 如果别处已有大量文档，很容易在 `CLAUDE.md` 里用 `@` 提到那些文件。这样会把整份文件嵌入每次上下文，膨胀窗口。如果只是“提一嘴”路径，Claude 又常常会忽略。你需要“推销”让代理知道为什么、何时要读它。“遇到复杂用法或 `FooBarError`，请看 `path/to/docs.md` 获取进阶故障排查步骤。”
    
3.  不要只说“绝不……”。 避免只给否定约束，比如“绝不要用 `--foo-bar` 标志”。当代理认为必须用它时就会卡死。务必提供替代方案。
    
4.  把 `CLAUDE.md` 当作“约束推动器”。 如果你的 CLI 命令很复杂冗长，不要写一大段文档去解释——那是在给“人类问题”打补丁。相反，写一个简单的 bash 封装，提供清晰直观的 API，并去文档化“那个封装”。让 `CLAUDE.md` 尽可能短，是简化代码库与内部工具的极好“倒逼”手段。
    

这是一个简化示例：

```
# Monorepo

## Python
- Always ...
- Test with <command>
... 10 more ...

## <Internal CLI Tool>
... 10 bullets, focused on the 80% of use cases ...
- <usage example>
- Always ...
- Never <x>, prefer <Y>

For <complex usage> or <error> see path/to/<tool>_docs.md

...
```

最后，我们会把这个文件与 `AGENTS.md` 同步，以保持与团队里其他 AI IDE 的兼容性。

如果想获取更多为“编码代理”写 markdown 的建议，可参考：

*   “AI Can’t Read Your Docs”：[https://blog.sshh.io/p/ai-cant-read-your-docs](https://blog.sshh.io/p/ai-cant-read-your-docs)
    
*   “AI-powered Software Engineering”：[https://blog.sshh.io/p/ai-powered-software-engineering](https://blog.sshh.io/p/ai-powered-software-engineering)
    
*   “How Cursor (AI IDE) Works”：[https://blog.sshh.io/p/how-cursor-ai-ide-works](https://blog.sshh.io/p/how-cursor-ai-ide-works)
    
*   The Takeaway: 把 `CLAUDE.md` 当作高层、精挑细选的护栏与指引。用它来指向需要投入更多 AI（和人）友好工具的地方，而不是把它写成一本“百科全书”。
    

## [Compact, Context, & Clear](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#compact-context--clear)

链接：[https://www.reddit.com/r/ClaudeAI/comments/1lk2oay/compact\_and\_continue\_or\_clear\_and\_start\_again/](https://www.reddit.com/r/ClaudeAI/comments/1lk2oay/compact_and_continue_or_clear_and_start_again/)

我建议在编程会话中至少运行一次 `/context`，看看你如何使用 200k token 的上下文窗口（即便是 Sonnet-1M，我也不敢保证能有效利用全部窗口）。对我们而言，一个 monorepo 的新会话基线约消耗 ~20k（10%）tokens，剩余 180k 用于做改动——填满得很快。

![/context 截图：紫色是消息；随着工作推进像磁盘空间一样被占用，几分钟或几小时后你需要清理消息以继续。](https://substack-post-media.s3.amazonaws.com/public/images/7ee93292-646a-407a-95da-d469be81002e_1158x720.png)

我有三种主要工作流：

*   `/compact`（尽量避免）：自动压缩不透明、易错，优化也不佳。
    
*   `/clear` + `/catchup`（简单重启）：默认重启方式。先 `/clear` 清状态，再运行自定义 `/catchup`，让 Claude 读取当前 git 分支的所有变更文件。
    
*   “Document & Clear”（复杂重启）：用于大任务。让 Claude 把计划与进度输出到一个 `.md`；然后 `/clear`，在新会话里让它先读这个 `.md` 再继续。
    
*   The Takeaway: 不要过度信任自动压缩。简单重启用 `/clear`；复杂任务用“Document & Clear”为代理创造持久的外部“记忆”。
    

## [自定义斜杠命令](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%96%9C%E6%9D%A0%E5%91%BD%E4%BB%A4)

链接：[https://docs.claude.com/en/docs/claude-code/slash-commands](https://docs.claude.com/en/docs/claude-code/slash-commands)

我把斜杠命令当作常用提示的简单快捷方式，仅此而已。我的配置很简洁：

*   `/catchup`：前面提过，让 Claude 读取当前分支变更的所有文件。
*   `/pr`：帮助清理代码、暂存并准备一个 PR。

在我看来，如果你维护了很多复杂的自定义斜杠命令，那就是一种反模式。代理的意义就在于：你几乎可以随便说，它也能产出可合并的结果。一旦你要求工程师（或非工程师）去学习一长串“魔法命令”才能高效工作，那就失败了。

*   The Takeaway: 把斜杠命令作为简单的个人快捷方式，而不是替代更直观的 `CLAUDE.md` 与更好工具化的代理。

## [自定义 Subagents](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#%E8%87%AA%E5%AE%9A%E4%B9%89-subagents)

链接：[https://docs.claude.com/en/docs/claude-code/sub-agents](https://docs.claude.com/en/docs/claude-code/sub-agents)

纸面上，自定义 subagents 是 Claude Code 在上下文管理上的最强特性。卖点很简单：复杂任务需要 X tokens 的输入上下文（例如如何运行测试），累积 Y tokens 的工作上下文，生成 Z tokens 的答案。跑 N 个任务，就在主窗口消耗 `(X + Y + Z) * N` tokens。

子代理的解法是把 `(X + Y) * N` 的工作外包给专门代理，只返回最终的 Z token 答案，保持主上下文干净。

我觉得它们概念很强，但实际中自定义子代理会带来两个问题：

1.  它们“把关”上下文：如果我做了个 `PythonTests` 子代理，我就把与测试相关的上下文从主代理“藏起来”了。主代理失去对变更的整体推理能力，被迫调用子代理才能知道如何验证自己的代码。
2.  它们强加人类工作流：更糟糕的是，我在强迫 Claude 遵循我规定的、僵硬的工作流。我本来是希望代理替我解决“如何委派”的问题。

我更偏好的替代方案，是使用 Claude 的内置 `Task(...)` 特性去“克隆”通用代理。

我把所有关键上下文放进 `CLAUDE.md`，让主代理根据需要去决定如何把工作委派给自己的“复制体”。这样既有子代理的上下文节省好处，又避免其缺点。代理自己动态管理编排。

在我的“Building Multi-Agent Systems (Part 2)”一文中，我称之为“Master-Clone”架构，我远比“Lead-Specialist”模型（自定义子代理所鼓励的）更偏爱它。

*   The Takeaway: 自定义子代理脆弱。把上下文放进 `CLAUDE.md` 交给主代理，再利用它自带的 `Task/Explore(...)` 来管理委派。

## [Resume、Continue 与历史](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#resumecontinue-%E4%B8%8E%E5%8E%86%E5%8F%B2)

链接：[https://docs.claude.com/en/docs/claude-code/common-workflows#resume-previous-conversations](https://docs.claude.com/en/docs/claude-code/common-workflows#resume-previous-conversations)

简单层面上，我经常用 `claude --resume` 和 `claude --continue`。它们非常适合重启卡住的终端或快速重启旧会话。我会 `claude --resume` 一个几天前的会话，只为让代理总结它当时如何解决某个错误，然后把经验用于改进我们的 `CLAUDE.md` 和内部工具。

更深入一点，Claude Code 会把所有会话历史存储在 `~/.claude/projects/`。我有脚本对这些日志做元分析，找常见异常、权限请求、错误模式，帮助改进面向代理的上下文。

*   The Takeaway: 用 `claude --resume` 与 `claude --continue` 重启会话，并挖掘被埋的历史上下文。

## [Hooks](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#hooks)

链接：[https://docs.claude.com/en/docs/claude-code/hooks](https://docs.claude.com/en/docs/claude-code/hooks)

Hooks 非常重要。业余项目我不用，但在复杂企业仓库里它们对引导 Claude 至关重要。它们是对 `CLAUDE.md` 中“应该做”的建议的补充，提供确定性的“必须做”规则。

我们使用两类：

1.  提交阻断（Block-at-Submit）Hooks：这是主要策略。我们有一个 `PreToolUse` hook 来包住任何 `Bash(git commit)` 命令。它会检查是否存在 `/tmp/agent-pre-commit-pass` 文件，这个文件只有在我们的测试脚本全部通过时才会创建。如果缺失，hook 就阻止提交，迫使 Claude 进入“测试-修复”循环，直到构建变绿。
2.  提示 Hooks：简单的非阻断 hook，在代理做次优行为时提供“发出即忘”的反馈。

我们刻意不使用“写入时阻断”的 hooks（例如在 `Edit` 或 `Write` 上）。在代理执行计划中途阻断，会让它困惑，甚至“沮丧”。更有效的做法是让它先完成，然后在提交阶段检查最终成果。

*   The Takeaway: 用 hooks 在提交时强制状态校验（block-at-submit）。避免写入时阻断——让代理完成计划，再检查最终结果。

## [规划模式（Planning Mode）](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#%E8%A7%84%E5%88%92%E6%A8%A1%E5%BC%8Fplanning-mode)

链接：[https://youtu.be/QlWyrYuEC84?si=mQxc\_iyVKmo3iJOd&t=915](https://youtu.be/QlWyrYuEC84?si=mQxc_iyVKmo3iJOd&t=915)

对任何“较大”的功能变更，规划都是必需的。

做业余项目时，我只用内置规划模式。这是一种在开始前与 Claude 对齐的方法，既定义“怎么做”，也定义需要停下来给我看的“检查点”。经常使用能建立敏锐直觉：最少需要提供哪些上下文，才能拿到好计划而不让 Claude 把实现搞砸。

在工作 monorepo 里，我们开始推广一个基于 Claude Code SDK 的自定义规划工具。它与原生规划模式类似，但提示更重，以对齐我们现有的技术设计格式。它也会内建强制执行我们的内部最佳实践——从代码结构到数据隐私与安全。让工程师像资深架构师一样“vibe plan”一个新功能（至少这是目标）。

*   The Takeaway: 面对复杂改动，务必先用内置规划模式对齐计划，再让代理开工。

## [Skills](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#skills)

链接：[https://docs.claude.com/en/docs/claude-code/skills](https://docs.claude.com/en/docs/claude-code/skills)

我同意 Simon Willison 的观点（[https://simonwillison.net/2025/Oct/16/claude-skills/）：Skills（也许）比](https://simonwillison.net/2025/Oct/16/claude-skills/%EF%BC%89%EF%BC%9ASkills%EF%BC%88%E4%B9%9F%E8%AE%B8%EF%BC%89%E6%AF%94) MCP 更重要。

如果你看过我之前的文章，会知道我在大多数开发工作流里逐渐远离 MCP，更偏好构建简单 CLI（详见 “AI Can’t Read Your Docs”：[https://blog.sshh.io/p/ai-cant-read-your-docs）。我对代理自治的心智模型演进为三个阶段：](https://blog.sshh.io/p/ai-cant-read-your-docs%EF%BC%89%E3%80%82%E6%88%91%E5%AF%B9%E4%BB%A3%E7%90%86%E8%87%AA%E6%B2%BB%E7%9A%84%E5%BF%83%E6%99%BA%E6%A8%A1%E5%9E%8B%E6%BC%94%E8%BF%9B%E4%B8%BA%E4%B8%89%E4%B8%AA%E9%98%B6%E6%AE%B5%EF%BC%9A)

1.  单次巨型提示（Single Prompt）：把所有上下文塞进一次提示。（脆弱，不能扩展）
2.  工具调用（Tool Calling）：经典代理模型。我们手工打造工具，为代理抽象现实。（更好，但制造了新的抽象与上下文瓶颈）
3.  脚本化（Scripting）：给代理访问原始环境——二进制、脚本、文档——它“即时”写代码去与之交互。

基于这个模型，Agent Skills 是显而易见的下一个特性。它们把“脚本化”层产品化。

如果你和我一样更偏好 CLI 而非 MCP，那么你一直在隐式地享受 Skills 的好处。`SKILL.md` 只是更有组织、可分享、可发现地把这些 CLI 和脚本文档化并暴露给代理。

*   The Takeaway: Skills 是正确抽象。它把“脚本化”代理模型形式化，比刚性、API 式的 MCP 模型更健壮、更灵活。

## [MCP（Model Context Protocol）](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#mcpmodel-context-protocol)

链接：[https://modelcontextprotocol.io/docs/getting-started/intro](https://modelcontextprotocol.io/docs/getting-started/intro)

Skills 并不意味着 MCP 已死（另见 “Everything Wrong with MCP”：[https://blog.sshh.io/p/everything-wrong-with-mcp）。过去很多人做了糟糕、上下文臃肿的](https://blog.sshh.io/p/everything-wrong-with-mcp%EF%BC%89%E3%80%82%E8%BF%87%E5%8E%BB%E5%BE%88%E5%A4%9A%E4%BA%BA%E5%81%9A%E4%BA%86%E7%B3%9F%E7%B3%95%E3%80%81%E4%B8%8A%E4%B8%8B%E6%96%87%E8%87%83%E8%82%BF%E7%9A%84) MCP，堆满了只是镜像 REST API 的工具（`read_thing_a()`、`read_thing_b()`、`update_thing_c()`……）。

“脚本化”模型（如今被 Skills 形式化）更好，但需要一个安全的方式访问环境。在我看来，这就是 MCP 新的、更聚焦的角色。

与其做臃肿的 API，一个 MCP 应该是简单而安全的网关，只提供少数、强力的高层工具：

*   `download_raw_data(filters…)`
*   `take_sensitive_gated_action(args…)`
*   `execute_code_in_environment_with_state(code…)`

在这个模型里，MCP 的工作不是替代理抽象现实；而是管理认证、网络与安全边界，然后“让路”。它提供进入点，代理再借助脚本与 `markdown` 上下文完成实际工作。

我现在唯一还在用的 MCP 是 Playwright（[https://github.com/microsoft/playwright-mcp），这很合理——它是复杂、有状态的环境。所有无状态工具（如](https://github.com/microsoft/playwright-mcp%EF%BC%89%EF%BC%8C%E8%BF%99%E5%BE%88%E5%90%88%E7%90%86%E2%80%94%E2%80%94%E5%AE%83%E6%98%AF%E5%A4%8D%E6%9D%82%E3%80%81%E6%9C%89%E7%8A%B6%E6%80%81%E7%9A%84%E7%8E%AF%E5%A2%83%E3%80%82%E6%89%80%E6%9C%89%E6%97%A0%E7%8A%B6%E6%80%81%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82) Jira、AWS、GitHub）我都迁移成了简单 CLI。

*   The Takeaway: 把 MCP 当作数据网关。给代理一两个高层工具（比如原始数据导出 API），让它据此脚本化地完成工作。

## [Claude Code SDK](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#claude-code-sdk)

链接：[https://docs.claude.com/en/api/agent-sdk/overview](https://docs.claude.com/en/api/agent-sdk/overview)

Claude Code 不只是交互式 CLI；它也是一个强大的 SDK，可用于构建全新代理——既可用于编程，也可用于非编程任务。大多数新业余项目，我开始把它作为默认代理框架，替代 LangChain/CrewAI 等。

我主要三种用法：

1.  大规模并行脚本：做大范围重构、修复或迁移时，我不使用交互式聊天。我写简单的 bash 脚本并行调用 `claude -p "in /pathA change all refs from foo to bar"`。这比让主代理管理几十个子代理任务更可控、更可扩。
2.  构建内部聊天工具：SDK 很适合把复杂流程包成简单聊天界面给非技术用户用。比如一个安装器在报错时回退到 Claude Code SDK，直接“修好”问题；或一个 in-house 的 “v0-at-home”（[http://v0.dev/）工具，让设计团队用我们内建](http://v0.dev/%EF%BC%89%E5%B7%A5%E5%85%B7%EF%BC%8C%E8%AE%A9%E8%AE%BE%E8%AE%A1%E5%9B%A2%E9%98%9F%E7%94%A8%E6%88%91%E4%BB%AC%E5%86%85%E5%BB%BA) UI 框架“vibe code”原型前端，确保想法高保真、代码更贴近生产可用。
3.  快速原型代理：我最常用的场景。不仅限编程。如果我对任何代理式任务（如使用自定义 CLI 或 MCP 的“威胁调查代理”）有想法，我会用 Claude Code SDK 快速构建并测试原型，再决定是否投入完整部署。

*   The Takeaway: Claude Code SDK 是强大的通用代理框架。用它做批量代码处理、内部工具构建与快速原型开发，在诉诸更复杂框架之前优先尝试。

## [Claude Code GitHub Action（GHA）](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#claude-code-github-actiongha)

链接：[https://github.com/anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)

Claude Code 的 GitHub Action 可能是我最喜欢、也最容易被忽视的特性。概念很简单：在 GHA 中运行 Claude Code。也正因其简单而强大。

它类似 Cursor 的后台代理（[https://cursor.com/docs/cloud-agent）或](https://cursor.com/docs/cloud-agent%EF%BC%89%E6%88%96) Codex 托管的网页 UI，但可定制度高得多。你控制整个容器与环境，获得更多数据访问能力，更重要的是，获得比任何其他产品更强的沙箱与审计控制。它也支持高级特性，如 Hooks 与 MCP。

我们用它做“从任意入口发起 PR”的工具。用户可从 Slack、Jira、甚至 CloudWatch 警报触发，GHA 会修 bug 或加功能，并回一个完全测试过的 PR。

由于 GHA 日志就是完整的代理日志，我们有一套运营流程，定期在公司层面审查这些日志，查找常见错误、bash 问题或不一致的工程实践。由此形成数据驱动的飞轮：Bug -> 更好的 `CLAUDE.md` / CLI -> 更强的代理。

```
$ query-claude-gha-logs --since 5d | claude -p "see what the other claudes were getting stuck on and fix it, then put up a PR"
```

*   The Takeaway: GHA 是把 Claude Code 运营化的终极方式。它让代理从个人工具变为工程系统的核心、可审计、且能自我改进的组成部分。

## [settings.json](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#settingsjson)

链接：[https://docs.claude.com/en/docs/claude-code/settings](https://docs.claude.com/en/docs/claude-code/settings)

最后是一些我在业余与专业场景中都很受用的 `settings.json` 配置：

*   `HTTPS_PROXY` / `HTTP_PROXY`：非常适合调试。我用它抓原始流量，确切看到 Claude 发了什么提示。对后台代理来说，它也能提供更细粒度的网络沙箱。
    
*   `MCP_TOOL_TIMEOUT` / `BASH_MAX_TIMEOUT_MS`：我会把它们调大。我喜欢运行时间长、复杂的命令，默认超时常常太保守。老实说，随着 bash 后台任务支持逐步完善，也许不再需要，但我仍保留。
    
*   `ANTHROPIC_API_KEY`：工作中我们用企业 API key（见 reddit 讨论：[https://www.reddit.com/r/ClaudeAI/comments/1jwvssa/comment/mtt0urz/）。这让我们从“按座位授权”转向“按用量计费”，更符合我们的工作方式。](https://www.reddit.com/r/ClaudeAI/comments/1jwvssa/comment/mtt0urz/%EF%BC%89%E3%80%82%E8%BF%99%E8%AE%A9%E6%88%91%E4%BB%AC%E4%BB%8E%E2%80%9C%E6%8C%89%E5%BA%A7%E4%BD%8D%E6%8E%88%E6%9D%83%E2%80%9D%E8%BD%AC%E5%90%91%E2%80%9C%E6%8C%89%E7%94%A8%E9%87%8F%E8%AE%A1%E8%B4%B9%E2%80%9D%EF%BC%8C%E6%9B%B4%E7%AC%A6%E5%90%88%E6%88%91%E4%BB%AC%E7%9A%84%E5%B7%A5%E4%BD%9C%E6%96%B9%E5%BC%8F%E3%80%82)
    
    *   它能反映开发者使用量的巨大差异（我们见过 1:100x）。
    *   它允许工程师折腾非 Claude Code 的 LLM 脚本，仍在同一企业账户下。
*   `"permissions"`：我会不时自查一下允许 Claude 自动运行的命令列表。
    
*   The Takeaway: `settings.json` 是强大的高级自定义入口。
    

## [结语](https://stellarlink.co/articles/%E6%88%91%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-claude-code-%E7%9A%84%E6%AF%8F%E4%B8%80%E9%A1%B9%E5%8A%9F%E8%83%BD#%E7%BB%93%E8%AF%AD)

内容很多，但希望你觉得有用。如果你还没用过像 Claude Code 或 Codex CLI 这样的 CLI 代理，或许该试试了。对于这些高级特性，很少有好教程，唯一的学习方式就是下水实战。
