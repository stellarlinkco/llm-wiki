---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/effective-harnesses-for-long-running-agents"
title: 长时间运行的 Agent 的有效组织方式
description: 长时间运行的 Agent 的有效组织方式
resource: "https://stellarlink.co/articles/effective-harnesses-for-long-running-agents"
tags: []
timestamp: "2026-06-20T06:45:45.366Z"
source_path: "https://stellarlink.co/articles/effective-harnesses-for-long-running-agents"
source_id: dadc3ef26fc5d9c1c21f41c0f46ee88059ff219e7eae4f75ade2d5493203788d
content_hash: e2f6ef6cbdbf002b2a41b68e770973fb65b9225a7c1dc891018510fca2a75943
---

## [长时间运行的 Agent 的有效组织方式](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E9%95%BF%E6%97%B6%E9%97%B4%E8%BF%90%E8%A1%8C%E7%9A%84-agent-%E7%9A%84%E6%9C%89%E6%95%88%E7%BB%84%E7%BB%87%E6%96%B9%E5%BC%8F)

随着 AI Agent 能力的增强,开发者越来越多地要求它们承担需要跨越数小时甚至数天工作的复杂任务。然而,让 Agent 在多个 Context Window 之间保持持续进展仍然是一个开放性问题。

长时间运行 Agent 的核心挑战在于,它们必须在离散的会话中工作,而每个新会话开始时都不记得之前发生的事情。想象一个由轮班工程师组成的软件项目团队,每位新到岗的工程师都不记得上一班发生了什么。由于 Context Window 有限,并且大多数复杂项目无法在单个窗口内完成,Agent 需要一种方法来弥合编码会话之间的鸿沟。

我们开发了一个双重解决方案,使 [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) 能够在多个 Context Window 中有效工作:一个在首次运行时设置环境的 **initializer agent**(初始化 Agent),以及一个负责在每个会话中取得增量进展并为下一个会话留下清晰产物的 **coding agent**(编码 Agent)。你可以在配套的 [quickstart](https://github.com/anthropics/claude-quickstarts/tree/main/autonomous-coding) 中找到代码示例。

## [长时间运行 Agent 的问题](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E9%95%BF%E6%97%B6%E9%97%B4%E8%BF%90%E8%A1%8C-agent-%E7%9A%84%E9%97%AE%E9%A2%98)

Claude Agent SDK 是一个强大的通用 Agent 组织框架,擅长编码以及其他需要模型使用工具来收集上下文、规划和执行的任务。它具有上下文管理能力,例如压缩(compaction),这使得 Agent 能够在不耗尽 Context Window 的情况下完成任务。从理论上讲,在这种设置下,Agent 应该能够在任意长的时间内继续做有用的工作。

然而,压缩并不充分。开箱即用的情况下,即使像 Opus 4.5 这样的前沿编码模型在 Claude Agent SDK 上循环运行跨越多个 Context Window,如果只给它一个高级别的 prompt,比如”构建一个 [claude.ai](http://claude.ai/) 的克隆版本”,它也无法构建出生产级别的 Web 应用。

Claude 的失败表现为两种模式。首先,Agent 倾向于一次性做太多事情——本质上是尝试一次性完成应用。通常,这会导致模型在实现过程中用完上下文,使得下一个会话从一个半实现且未记录的功能开始。然后 Agent 必须猜测发生了什么,并花费大量时间试图让基本应用再次运行。即使使用了压缩,这种情况仍会发生,因为压缩并不总能向下一个 Agent 传递完全清晰的指令。

第二种失败模式通常在项目后期发生。在一些功能已经构建之后,后来的 Agent 实例会环顾四周,看到已经取得了进展,然后宣布工作完成。

这将问题分解为两个部分。首先,我们需要建立一个初始环境,为给定 prompt 所需的_所有_功能奠定基础,这使 Agent 能够逐步工作,逐个功能地进行。其次,我们应该 prompt 每个 Agent 朝着目标取得增量进展,同时在会话结束时将环境保持在干净状态。所谓”干净状态”,我们指的是适合合并到主分支的那种代码:没有重大 bug,代码有序且文档完善,总的来说,开发人员可以轻松开始开发新功能,而无需首先清理无关的混乱。

在内部实验时,我们使用了一个两部分的解决方案来解决这些问题:

1.  Initializer agent:第一个 Agent 会话使用专门的 prompt,要求模型设置初始环境:一个 `init.sh` 脚本、一个 claude-progress.txt 文件来记录 Agent 所做的工作日志,以及一个显示添加了哪些文件的初始 git commit。
2.  Coding agent:每个后续会话要求模型取得增量进展,然后留下结构化更新。[1](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#user-content-fn-1)

这里的关键洞察是找到了一种方法,让 Agent 在以全新 Context Window 开始时快速理解工作状态,这是通过 claude-progress.txt 文件和 git 历史记录来完成的。这些实践的灵感来自于了解有效的软件工程师每天所做的事情。

## [环境管理](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E7%8E%AF%E5%A2%83%E7%AE%A1%E7%90%86)

在更新的 [Claude 4 prompting guide](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices#multi-context-window-workflows) 中,我们分享了多 Context Window 工作流的一些最佳实践,包括使用”为第一个 Context Window 使用不同 prompt”的组织结构。这个”不同的 prompt”要求 initializer agent 设置环境,提供未来编码 Agent 有效工作所需的所有必要上下文。在这里,我们对这种环境的一些关键组成部分进行了更深入的探讨。

### [功能列表](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E5%8A%9F%E8%83%BD%E5%88%97%E8%A1%A8)

为了解决 Agent 一次性完成应用或过早认为项目完成的问题,我们 prompt initializer agent 编写一个全面的功能需求文件,扩展用户的初始 prompt。在 [claude.ai](http://claude.ai/) 克隆示例中,这意味着超过 200 个功能,例如”用户可以打开新聊天、输入查询、按回车并看到 AI 响应”。这些功能最初都标记为”failing”(失败),以便后续的编码 Agent 能够清楚地了解完整功能的轮廓。

```
{
    "category": "functional",
    "description": "New chat button creates a fresh conversation",
    "steps": [
      "Navigate to main interface",
      "Click the 'New Chat' button",
      "Verify a new conversation is created",
      "Check that chat area shows welcome state",
      "Verify conversation appears in sidebar"
    ],
    "passes": false
  }
```

我们 prompt 编码 Agent 仅通过更改 passes 字段的状态来编辑此文件,并且我们使用强烈措辞的指令,例如”删除或编辑测试是不可接受的,因为这可能导致功能缺失或出现 bug。“经过一些实验,我们决定为此使用 JSON,因为与 Markdown 文件相比,模型不太可能不恰当地更改或覆盖 JSON 文件。

### [增量进展](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E5%A2%9E%E9%87%8F%E8%BF%9B%E5%B1%95)

在有了这个初始环境脚手架之后,下一次迭代的编码 Agent 被要求一次只处理一个功能。这种增量方法对于解决 Agent 一次性做太多事情的倾向至关重要。

一旦开始增量工作,模型在进行代码更改后将环境保持在干净状态仍然至关重要。在我们的实验中,我们发现引发这种行为的最佳方法是要求模型将其进展提交到 git,并附带描述性的 commit 消息,并在进度文件中写入其进展摘要。这使模型能够使用 git 回退错误的代码更改并恢复代码库的工作状态。

这些方法也提高了效率,因为它们消除了 Agent 必须猜测发生了什么以及花费时间试图让基本应用再次运行的需要。

### [测试](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E6%B5%8B%E8%AF%95)

我们观察到的最后一个主要失败模式是 Claude 倾向于在没有适当测试的情况下将功能标记为完成。在没有明确 prompting 的情况下,Claude 倾向于进行代码更改,甚至使用单元测试或针对开发服务器的 `curl` 命令进行测试,但无法识别功能是否端到端工作。

在构建 Web 应用的情况下,一旦明确 prompt Claude 使用浏览器自动化工具并像人类用户一样进行所有测试,Claude 在端到端验证功能方面表现良好。

![Claude 通过 Puppeteer MCP server 在测试 claude.ai 克隆版时截取的屏幕截图。](https://www-cdn.anthropic.com/images/4zrzovbb/website/f94c2257964fb2d623f1e81f874977ebfc0986bc-1920x1080.gif)

_Claude 通过 Puppeteer MCP server 在测试 claude.ai 克隆版时截取的屏幕截图。_

为 Claude 提供这些类型的测试工具显著提高了性能,因为 Agent 能够识别和修复仅从代码中不明显的 bug。

一些问题仍然存在,例如 Claude 的视觉限制以及浏览器自动化工具的限制使得难以识别每种类型的 bug。例如,Claude 无法通过 Puppeteer MCP 看到浏览器原生的 alert 模态框,因此依赖这些模态框的功能往往会更多 bug。

## [快速上手](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B)

有了上述所有内容,每个编码 Agent 都被 prompt 运行一系列步骤来确定方向,有些步骤相当基础但仍然有帮助:

1.  _运行 `pwd` 查看你正在工作的目录。你只能编辑此目录中的文件。_
2.  _阅读 git 日志和进度文件,了解最近正在处理的内容。_
3.  _阅读功能列表文件,选择尚未完成的最高优先级功能进行处理。_

这种方法为 Claude 在每个会话中节省了一些 token,因为它不必弄清楚如何测试代码。要求 initializer agent 编写一个可以运行开发服务器的 init.sh 脚本,然后在实现新功能之前运行基本的端到端测试也很有帮助。

在 claude.ai 克隆的情况下,这意味着 Agent 总是启动本地开发服务器,并使用 Puppeteer MCP 开始新聊天、发送消息并接收响应。这确保了 Claude 能够快速识别应用是否处于损坏状态,并立即修复任何现有 bug。如果 Agent 转而开始实现新功能,可能会使问题变得更糟。

考虑到所有这些,一个典型的会话以以下 assistant 消息开始:

```
[Assistant] I'll start by getting my bearings and understanding the current state of the project.
[Tool Use] <bash - pwd>
[Tool Use] <read - claude-progress.txt>
[Tool Use] <read - feature_list.json>
[Assistant] Let me check the git log to see recent work.
[Tool Use] <bash - git log --oneline -20>
[Assistant] Now let me check if there's an init.sh script to restart the servers.
<Starts the development server>
[Assistant] Excellent! Now let me navigate to the application and verify that some fundamental features are still working.
<Tests basic functionality>
[Assistant] Based on my verification testing, I can see that the fundamental functionality is working well. The core chat features, theme switching, conversation loading, and error handling are all functioning correctly. Now let me review the tests.json file more comprehensively to understand what needs to be implemented next.
<Starts work on a new feature>
```

### [Agent 失败模式和解决方案](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#agent-%E5%A4%B1%E8%B4%A5%E6%A8%A1%E5%BC%8F%E5%92%8C%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)

**问题**

**Initializer Agent 行为**

**Coding Agent 行为**

Claude 过早宣布整个项目胜利。

设置功能列表文件:根据输入规格,设置一个包含端到端功能描述列表的结构化 JSON 文件。

在会话开始时阅读功能列表文件。选择一个单一功能开始处理。

Claude 在有 bug 或未记录进展的状态下离开环境。

写入初始 git repo 和进度说明文件。

通过阅读进度说明文件和 git commit 日志开始会话,并在开发服务器上运行基本测试以捕获任何未记录的 bug。通过写入 git commit 和进度更新结束会话。

Claude 过早将功能标记为完成。

设置功能列表文件。

自我验证所有功能。仅在仔细测试后将功能标记为”passing”(通过)。

Claude 必须花时间弄清楚如何运行应用。

编写一个可以运行开发服务器的 `init.sh` 脚本。

通过阅读 `init.sh` 开始会话。

_总结长时间运行 AI Agent 中的四种常见失败模式和解决方案。_

## [未来工作](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E6%9C%AA%E6%9D%A5%E5%B7%A5%E4%BD%9C)

这项研究展示了长时间运行 Agent 组织框架中的一组可能解决方案,使模型能够在许多 Context Window 中取得增量进展。然而,仍然存在开放性问题。

最值得注意的是,目前尚不清楚单个通用编码 Agent 在跨上下文中表现最佳,还是通过多 Agent 架构可以实现更好的性能。似乎有理由认为,专门的 Agent,如测试 Agent、质量保证 Agent 或代码清理 Agent,可以在软件开发生命周期的子任务中做得更好。

此外,这个演示针对全栈 Web 应用开发进行了优化。未来的方向是将这些发现推广到其他领域。这些课程中的部分或全部很可能可以应用于其他领域所需的长时间运行 agentic 任务类型,例如科学研究或金融建模。

### [脚注](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#%E8%84%9A%E6%B3%A8)

## [Footnotes](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#footnote-label)

1.  我们在此上下文中将它们称为单独的 Agent,仅因为它们具有不同的初始用户 prompt。否则,系统 prompt、工具集和整体 Agent 组织框架是相同的。 [↩](https://stellarlink.co/articles/effective-harnesses-for-long-running-agents#user-content-fnref-1)
