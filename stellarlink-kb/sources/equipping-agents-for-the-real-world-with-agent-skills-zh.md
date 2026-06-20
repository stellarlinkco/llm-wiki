---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh"
title: 用 Agent Skills 让智能体应对真实世界
description: 用 Agent Skills 让智能体应对真实世界
resource: "https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh"
tags: []
timestamp: "2026-06-20T06:45:45.883Z"
source_path: "https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh"
source_id: e7e10e41cfceae544c8cb7b94967218caf0b68218c7cac4dc71ef11e6f3c32a2
content_hash: 77c676603b15267eb3a0a3a1499a3ac07dfb63b621b3e924f474ca3b42407bb1
---

随着模型能力的提升，我们现在可以构建与完整计算环境交互的通用智能体。例如，[Claude Code](https://claude.com/product/claude-code) 可以使用本地代码执行和文件系统跨领域完成复杂任务。但随着这些智能体变得更强大，我们需要更具组合性、可扩展性和可移植性的方式来为它们配备特定领域的专业知识。

这促使我们创建了 [**Agent Skills**](https://www.anthropic.com/news/skills)：智能体可以动态发现和加载的有组织的指令、脚本和资源文件夹，以便在特定任务中表现更好。Skills 通过将你的专业知识打包成 Claude 的可组合资源来扩展 Claude 的能力，将通用智能体转变为符合你需求的专用智能体。

为智能体构建技能就像为新员工准备入职指南。现在任何人都可以通过捕获和分享他们的程序性知识，用可组合的能力来专业化他们的智能体，而不是为每个用例构建碎片化的、定制设计的智能体。在本文中，我们将解释什么是 Skills，展示它们如何工作，并分享构建自己的 Skills 的最佳实践。

![要激活 skills，你只需要编写一个带有智能体自定义指导的 SKILL.md 文件。](https://www-cdn.anthropic.com/images/4zrzovbb/website/ddd7e6e572ad0b6a943cacefe957248455f6d522-1650x929.jpg)

技能是一个包含 SKILL.md 文件的目录，其中包含为智能体提供额外能力的有组织的指令、脚本和资源文件夹。

## [技能的结构](https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh#%E6%8A%80%E8%83%BD%E7%9A%84%E7%BB%93%E6%9E%84)

为了看到 Skills 的实际应用，让我们通过一个真实示例：为 [Claude 最近推出的文档编辑能力](https://www.anthropic.com/news/create-files)提供支持的技能之一。Claude 已经非常了解如何理解 PDF，但在直接操作它们（例如填写表单）的能力上受到限制。这个 [PDF skill](https://github.com/anthropics/skills/tree/main/document-skills/pdf) 让我们可以赋予 Claude 这些新能力。

最简单的情况下，技能是一个包含 `SKILL.md` 文件的目录。这个文件必须以包含一些必需元数据的 YAML 前言开始：`name` 和 `description`。在启动时，智能体会将每个已安装技能的 `name` 和 `description` 预加载到其系统提示中。

这个元数据是_渐进式披露_的**第一层**：它提供了刚好足够的信息让 Claude 知道何时应该使用每个技能，而不需要将所有内容加载到上下文中。这个文件的实际正文是**第二层**细节。如果 Claude 认为该技能与当前任务相关，它将通过读取完整的 `SKILL.md` 到上下文中来加载该技能。

![SKILL.md 文件的结构，包括相关的元数据：name、description，以及与技能应采取的特定操作相关的上下文。](https://www-cdn.anthropic.com/images/4zrzovbb/website/6f22d8913dbc6228e7f11a41e0b3c124d817b6d2-1650x929.jpg)

SKILL.md 文件必须以包含文件名和描述的 YAML Frontmatter 开始，这些内容在启动时会被加载到系统提示中。

随着技能复杂性的增长，它们可能包含太多上下文而无法放入单个 `SKILL.md`，或者只在特定场景中相关的上下文。在这些情况下，技能可以在技能目录中捆绑额外的文件，并从 `SKILL.md` 中按名称引用它们。这些额外的链接文件是**第三层**（及更深层）的细节，Claude 可以选择仅在需要时导航和发现。

在下面显示的 PDF 技能中，`SKILL.md` 引用了两个额外的文件（`reference.md` 和 `forms.md`），技能作者选择将它们与核心 `SKILL.md` 一起捆绑。通过将填表说明移到单独的文件（`forms.md`）中，技能作者能够保持技能核心的精简，相信 Claude 只会在填写表单时才读取 `forms.md`。

![如何将额外内容捆绑到 SKILL.md 文件中。](https://www-cdn.anthropic.com/images/4zrzovbb/website/191bf5dd4b6f8cfe6f1ebafe6243dd1641ed231c-1650x1069.jpg)

你可以将更多上下文（通过额外文件）整合到你的技能中，然后可以根据系统提示由 Claude 触发。

渐进式披露是使 Agent Skills 灵活且可扩展的核心设计原则。就像一本组织良好的手册，从目录开始，然后是具体章节，最后是详细的附录，技能让 Claude 仅在需要时加载信息：

![此图描述了 Skills 中上下文的渐进式披露。](https://www-cdn.anthropic.com/images/4zrzovbb/website/a3bca2763d7892982a59c28aa4df7993aaae55ae-2292x673.jpg)

具有文件系统和代码执行工具的智能体在处理特定任务时不需要将技能的全部内容读入其上下文窗口。这意味着可以捆绑到技能中的上下文量实际上是无限的。

### [Skills 与上下文窗口](https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh#skills-%E4%B8%8E%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AA%97%E5%8F%A3)

下图显示了当用户消息触发技能时上下文窗口如何变化。

![此图描述了技能如何在你的上下文窗口中被触发。](https://www-cdn.anthropic.com/images/4zrzovbb/website/441b9f6cc0d2337913c1f41b05357f16f51f702e-1650x929.jpg)

技能通过系统提示在上下文窗口中被触发。

显示的操作序列：

1.  首先，上下文窗口包含核心系统提示和每个已安装技能的元数据，以及用户的初始消息；
2.  Claude 通过调用 Bash 工具读取 `pdf/SKILL.md` 的内容来触发 PDF 技能；
3.  Claude 选择读取与技能捆绑的 `forms.md` 文件；
4.  最后，Claude 在加载了 PDF 技能的相关说明后继续执行用户的任务。

### [Skills 与代码执行](https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh#skills-%E4%B8%8E%E4%BB%A3%E7%A0%81%E6%89%A7%E8%A1%8C)

Skills 还可以包含供 Claude 自行决定执行的代码作为工具。

大语言模型在许多任务上表现出色，但某些操作更适合传统的代码执行。例如，通过 token 生成对列表进行排序比简单运行排序算法要昂贵得多。除了效率问题，许多应用程序还需要只有代码才能提供的确定性可靠性。

在我们的示例中，PDF 技能包含一个预先编写的 Python 脚本，用于读取 PDF 并提取所有表单字段。Claude 可以运行此脚本，而无需将脚本或 PDF 加载到上下文中。由于代码是确定性的，因此这个工作流是一致且可重复的。

![此图描述了如何通过 Skills 执行代码。](https://www-cdn.anthropic.com/images/4zrzovbb/website/c24b4a2ff77277c430f2c9ef1541101766ae5714-1650x929.jpg)

Skills 还可以包含供 Claude 根据任务性质自行决定执行的代码作为工具。

## [开发和评估技能](https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh#%E5%BC%80%E5%8F%91%E5%92%8C%E8%AF%84%E4%BC%B0%E6%8A%80%E8%83%BD)

以下是开始编写和测试技能的一些有用指南：

*   **从评估开始：** 通过在代表性任务上运行智能体并观察它们在哪些方面遇到困难或需要额外上下文，来识别智能体能力的具体差距。然后逐步构建技能来解决这些不足。
*   **为规模化而设计结构：** 当 `SKILL.md` 文件变得难以管理时，将其内容拆分为单独的文件并引用它们。如果某些上下文是互斥的或很少一起使用，保持路径分离将减少 token 使用量。最后，代码既可以作为可执行工具也可以作为文档。应该明确 Claude 是应该直接运行脚本还是将它们作为参考读入上下文。
*   **从 Claude 的角度思考：** 监控 Claude 在真实场景中如何使用你的技能，并根据观察进行迭代：注意意外的轨迹或对某些上下文的过度依赖。特别注意你技能的 `name` 和 `description`。Claude 将在决定是否触发技能以响应当前任务时使用这些。
*   **与 Claude 一起迭代：** 当你与 Claude 一起完成任务时，要求 Claude 将其成功的方法和常见错误捕获到技能内的可重用上下文和代码中。如果它在使用技能完成任务时偏离轨道，请让它自我反思出了什么问题。这个过程将帮助你发现 Claude 实际需要什么上下文，而不是试图预先预测它。

### [使用 Skills 时的安全考虑](https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh#%E4%BD%BF%E7%94%A8-skills-%E6%97%B6%E7%9A%84%E5%AE%89%E5%85%A8%E8%80%83%E8%99%91)

Skills 通过指令和代码为 Claude 提供新功能。虽然这使它们变得强大，但这也意味着恶意技能可能会在使用它们的环境中引入漏洞，或指示 Claude 泄露数据并采取意外行动。

我们建议仅从可信来源安装技能。从不太可信的来源安装技能时，在使用前要彻底审核。首先阅读技能中捆绑的文件内容以了解它的作用，特别注意代码依赖项和捆绑资源（如图像或脚本）。同样，注意技能中指示 Claude 连接到潜在不可信的外部网络源的指令或代码。

## [Skills 的未来](https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh#skills-%E7%9A%84%E6%9C%AA%E6%9D%A5)

Agent Skills [目前已支持](https://www.anthropic.com/news/skills) [Claude.ai](http://claude.ai/redirect/website.v1.00108876-4c2c-441d-81f3-340ae0ae18b9)、Claude Code、Claude Agent SDK 和 Claude Developer Platform。

在接下来的几周内，我们将继续添加支持创建、编辑、发现、共享和使用 Skills 的完整生命周期的功能。我们特别兴奋的是 Skills 帮助组织和个人与 Claude 共享其上下文和工作流程的机会。我们还将探索 Skills 如何通过教授智能体涉及外部工具和软件的更复杂工作流程来补充 [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) 服务器。

展望未来，我们希望使智能体能够自己创建、编辑和评估 Skills，让它们将自己的行为模式编码为可重用的能力。

Skills 是一个简单的概念，具有相应简单的格式。这种简单性使组织、开发人员和最终用户更容易构建定制化的智能体并赋予它们新功能。

我们很高兴看到人们用 Skills 构建什么。今天就通过查看我们的 Skills [文档](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)和 [cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills) 开始吧。

### [原文](https://stellarlink.co/articles/equipping-agents-for-the-real-world-with-agent-skills-zh#%E5%8E%9F%E6%96%87)

*   [Equipping agents for the real world with Agent Skills \\ Anthropic](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
