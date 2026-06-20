---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/claude-agent-sdk-zh-cn"
title: 使用 Claude Agent SDK 构建智能体
description: 使用 Claude Agent SDK 构建智能体
resource: "https://stellarlink.co/articles/claude-agent-sdk-zh-cn"
tags: []
timestamp: "2026-06-20T06:45:34.645Z"
source_path: "https://stellarlink.co/articles/claude-agent-sdk-zh-cn"
source_id: 6be054365600dcc8488f079985b7194e661a94d15cb0d9be6783de982558e3dd
content_hash: 2bc76f10bf359a42af8c3993704e0c66375fe94497bac375a5f7758f8caab8ed
---

去年，我们与客户分享了[构建高效智能体](https://www.anthropic.com/engineering/building-effective-agents)的经验。此后，我们发布了 [Claude Code](https://www.anthropic.com/claude-code)，这是一个智能编码解决方案，最初是为了支持 Anthropic 的开发者生产力而构建的。

在过去几个月里，Claude Code 已经远不止是一个编码工具。在 Anthropic，我们一直在[使用它](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code)进行深度研究、视频创作、笔记记录等无数非编码应用。

换句话说，驱动 Claude Code 的智能体框架（Claude Code SDK）也可以驱动许多其他类型的智能体。为了反映这一更广泛的愿景，我们将 Claude Code SDK 更名为 Claude Agent SDK。

在这篇文章中，我们将重点介绍为什么要构建 Claude Agent SDK，如何使用它构建自己的智能体，并分享从我们团队自己的部署中总结出的最佳实践。

## [给 Claude 一台计算机](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E7%BB%99-claude-%E4%B8%80%E5%8F%B0%E8%AE%A1%E7%AE%97%E6%9C%BA)

Claude Code 背后的[核心设计原则](https://www.youtube.com/watch?v=vLIDHi-1PVU)是 Claude 需要与程序员日常使用的相同工具。它需要能够在代码库中找到合适的文件、编写和编辑文件、对代码进行 lint 检查、运行代码、调试、编辑，有时还需要迭代执行这些操作直到代码成功运行。

我们发现，通过让 Claude 访问用户的计算机（通过终端），它就具备了像程序员一样编写代码所需的一切。

但这也使得 Claude Code 中的 Claude 能够有效地完成_非_编码任务。通过为它提供运行 bash 命令、编辑文件、创建文件和搜索文件的工具，Claude 可以读取 CSV 文件、搜索网络、构建可视化、解释指标，以及完成各种其他数字化工作——简而言之，可以创建具有计算机能力的通用智能体。

## [创建新型智能体](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E5%88%9B%E5%BB%BA%E6%96%B0%E5%9E%8B%E6%99%BA%E8%83%BD%E4%BD%93)

我们相信，给 Claude 一台计算机可以解锁构建以前不那么有效的智能体的能力。例如，使用我们的 SDK，开发者可以构建：

*   **金融智能体**：构建能够理解你的投资组合和目标的智能体，以及通过访问外部 API、存储数据和运行代码进行计算来帮助你评估投资的智能体。
*   **个人助理智能体**：构建能够帮助你预订旅行和管理日历的智能体，以及通过连接到你的内部数据源并跨应用程序跟踪上下文来安排约会、整理简报等的智能体。
*   **客户支持智能体**：构建能够处理高度模糊的用户请求（如客户服务工单）的智能体，通过收集和审查用户数据、连接外部 API、向用户发送消息以及在需要时上报给人工来实现。
*   **深度研究智能体**：构建能够对大型文档集合进行全面研究的智能体，通过搜索文件系统、分析和综合多个来源的信息、跨文件交叉引用数据以及生成详细报告来实现。

还有更多。从本质上讲，SDK 为你提供了构建智能体所需的基本要素，无论你想自动化什么工作流程。

## [构建你的智能体循环](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E6%9E%84%E5%BB%BA%E4%BD%A0%E7%9A%84%E6%99%BA%E8%83%BD%E4%BD%93%E5%BE%AA%E7%8E%AF)

在 Claude Code 中，Claude 通常在一个特定的反馈循环中运行：收集上下文 -> 采取行动 -> 验证工作 -> 重复。

![智能体反馈循环](https://www-cdn.anthropic.com/images/4zrzovbb/website/952fb04cb836d6de9662c8450c6a47dfe58bbd9f-2292x1290.png)

_智能体通常在一个特定的反馈循环中运行：收集上下文 -> 采取行动 -> 验证工作 -> 重复。_

这为思考其他智能体以及应该赋予它们的能力提供了一个有用的方式。为了说明这一点，我们将通过一个示例来演示如何在 Claude Agent SDK 中构建一个电子邮件智能体。

## [收集上下文](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E6%94%B6%E9%9B%86%E4%B8%8A%E4%B8%8B%E6%96%87)

在开发智能体时，你不仅仅想给它一个提示词：它还需要能够获取和更新自己的上下文。以下是 SDK 中的功能如何提供帮助。

### [**智能体式搜索和文件系统**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E6%99%BA%E8%83%BD%E4%BD%93%E5%BC%8F%E6%90%9C%E7%B4%A2%E5%92%8C%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F)

文件系统表示_可能_被拉入模型上下文的信息。

当 Claude 遇到大型文件（如日志或用户上传的文件）时，它会决定使用哪种方式将这些内容加载到其上下文中，方法是使用 `grep` 和 `tail` 等 bash 脚本。从本质上讲，智能体的文件夹和文件结构成为一种[上下文工程](http://anthropic.com/news/context-management)形式。

我们的电子邮件智能体可能会将以前的对话存储在一个名为”Conversations”的文件夹中。这将允许它在被问及时搜索这些对话以获取上下文。

![电子邮件智能体文件系统示例](https://www-cdn.anthropic.com/images/4zrzovbb/website/d5e3b46900277431b86467fdc308b64e61edd740-2292x623.png)

### [**语义搜索**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E8%AF%AD%E4%B9%89%E6%90%9C%E7%B4%A2)

[语义搜索](https://www.anthropic.com/news/contextual-retrieval)通常比智能体式搜索更快，但准确性较低、维护难度更大且透明度较低。它涉及将相关上下文”分块”，将这些块嵌入为向量，然后通过查询这些向量来搜索概念。鉴于其局限性，我们建议从智能体式搜索开始，只有在需要更快的结果或更多变化时才添加语义搜索。

### [**子智能体**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E5%AD%90%E6%99%BA%E8%83%BD%E4%BD%93)

Claude Agent SDK 默认支持子智能体。[子智能体](https://docs.claude.com/en/api/agent-sdk/subagents)主要有两个用途。首先，它们支持并行化：你可以启动多个子智能体来同时处理不同的任务。其次，它们有助于管理上下文：子智能体使用自己独立的上下文窗口，只向协调器发送相关信息，而不是它们的完整上下文。这使得它们非常适合需要筛选大量信息的任务，其中大部分信息都不会有用。

在设计我们的电子邮件智能体时，我们可能会赋予它”搜索子智能体”能力。然后，电子邮件智能体可以并行启动多个搜索子智能体——每个子智能体针对你的电子邮件历史运行不同的查询——并让它们只返回相关的摘录，而不是完整的电子邮件线程。

### [**压缩**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E5%8E%8B%E7%BC%A9)

当智能体长时间运行时，上下文维护变得至关重要。Claude Agent SDK 的压缩功能会在上下文限制接近时自动总结以前的消息，因此你的智能体不会耗尽上下文。这建立在 Claude Code 的 [compact 斜杠命令](https://docs.claude.com/en/docs/claude-code/sdk/sdk-slash-commands#%2Fcompact-compact-conversation-history)之上。

## [采取行动](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E9%87%87%E5%8F%96%E8%A1%8C%E5%8A%A8)

一旦收集了上下文，你就需要为智能体提供灵活的行动方式。

### [**工具**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E5%B7%A5%E5%85%B7)

[工具](https://www.anthropic.com/engineering/writing-tools-for-agents)是智能体执行的主要构建块。工具在 Claude 的上下文窗口中占据显著位置，使它们成为 Claude 在决定如何完成任务时会考虑的主要操作。这意味着你应该注意如何设计工具以最大化上下文效率。你可以在我们的博客文章《[用智能体编写智能体的高效工具](https://www.anthropic.com/engineering/writing-tools-for-agents)》中看到更多最佳实践。

因此，你的工具应该是你希望智能体采取的主要行动。了解如何在 Claude Agent SDK 中制作[自定义工具](https://docs.claude.com/en/api/agent-sdk/custom-tools)。

对于我们的电子邮件智能体，我们可能会将 `fetchInbox` 或 `searchEmails` 等工具定义为智能体的主要、最常用的操作。

### [**Bash 和脚本**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#bash-%E5%92%8C%E8%84%9A%E6%9C%AC)

Bash 作为通用工具非常有用，允许智能体使用计算机进行灵活的工作。

在我们的电子邮件智能体中，用户可能在其附件中存储了重要信息。Claude 可以编写代码来下载 PDF、将其转换为文本，并搜索它以查找有用的信息，如下所示：

![Bash 脚本处理附件示例](https://www-cdn.anthropic.com/images/4zrzovbb/website/e2a32595e35164f46c054dc003197e622ca95180-2292x623.png)

### [**代码生成**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E4%BB%A3%E7%A0%81%E7%94%9F%E6%88%90)

Claude Agent SDK 擅长代码生成——这是有充分理由的。代码是精确的、可组合的且可无限重用的，这使其成为需要可靠执行复杂操作的智能体的理想输出。

在构建智能体时，请考虑：哪些任务将受益于用代码表达？通常，答案会解锁重要的能力。

例如，我们最近在 [Claude.AI](http://claude.ai/redirect/website.v1.f79c597c-8da8-4257-a3ef-0233ea5a1dd0) 中推出的[文件创建功能](https://www.anthropic.com/news/create-files)完全依赖于代码生成。Claude 编写 Python 脚本来创建 Excel 电子表格、PowerPoint 演示文稿和 Word 文档，确保一致的格式和复杂的功能，这些功能用其他方式很难实现。

在我们的电子邮件智能体中，我们可能希望允许用户为入站电子邮件创建规则。为了实现这一点，我们可以编写代码在该事件上运行：

![代码生成示例：电子邮件规则](https://www-cdn.anthropic.com/images/4zrzovbb/website/180c83cc0f6f0ea26e18cbfbc59040cab6767b55-2292x1290.png)

### [**MCP**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#mcp)

[模型上下文协议](https://modelcontextprotocol.io/)（MCP）提供与外部服务的标准化集成，自动处理身份验证和 API 调用。这意味着你可以将智能体连接到 Slack、GitHub、Google Drive 或 Asana 等工具，而无需编写自定义集成代码或自己管理 OAuth 流程。

对于我们的电子邮件智能体，我们可能希望 `search Slack messages` 来了解团队上下文，或者 `check Asana tasks` 来查看是否已经有人被分配来处理客户请求。使用 MCP 服务器，这些集成开箱即用——你的智能体只需调用 search\_slack\_messages 或 get\_asana\_tasks 等工具，MCP 会处理其余的工作。

不断增长的 [MCP 生态系统](https://github.com/modelcontextprotocol/servers)意味着你可以随着预构建集成的可用而快速为智能体添加新功能，让你专注于智能体行为。

## [验证你的工作](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E9%AA%8C%E8%AF%81%E4%BD%A0%E7%9A%84%E5%B7%A5%E4%BD%9C)

Claude Code SDK 通过评估其工作来完成智能体循环。能够检查和改进自己输出的智能体在根本上更可靠——它们在错误复合之前捕获错误，在偏离轨道时自我纠正，并在迭代过程中变得更好。

关键是给 Claude 具体的方法来评估其工作。以下是我们发现有效的三种方法：

### [**定义规则**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E5%AE%9A%E4%B9%89%E8%A7%84%E5%88%99)

最好的反馈形式是为输出提供明确定义的规则，然后解释哪些规则失败了以及为什么失败。

[代码 linting](https://stackoverflow.com/questions/8503559/what-is-linting) 是一种出色的基于规则的反馈形式。反馈越深入越好。例如，生成 TypeScript 并对其进行 lint 检查通常比生成纯 JavaScript 更好，因为它为你提供了多个额外的反馈层。

在生成电子邮件时，你可能希望 Claude 检查电子邮件地址是否有效（如果无效，则抛出错误），以及用户以前是否向他们发送过电子邮件（如果是，则抛出警告）。

### [**视觉反馈**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E8%A7%86%E8%A7%89%E5%8F%8D%E9%A6%88)

在使用智能体完成视觉任务（如 UI 生成或测试）时，视觉反馈（以屏幕截图或渲染的形式）可能会有所帮助。例如，如果发送带有 HTML 格式的电子邮件，你可以截取生成的电子邮件的屏幕截图，并将其提供回模型以进行视觉验证和迭代改进。然后，模型将检查视觉输出是否与请求的内容匹配。

例如：

*   **布局** - 元素是否正确定位？间距是否合适？
*   **样式** - 颜色、字体和格式是否按预期显示？
*   **内容层次结构** - 信息是否以正确的顺序呈现并具有适当的强调？
*   **响应性** - 它看起来是否破损或拥挤？（尽管单个屏幕截图的视口信息有限）

使用 Playwright 等 MCP 服务器，你可以自动化这个视觉反馈循环——截取渲染的 HTML 的屏幕截图、捕获不同的视口大小，甚至测试交互式元素——所有这些都在智能体的工作流程中。

![Claude 对智能体生成的电子邮件正文提供视觉反馈](https://www-cdn.anthropic.com/images/4zrzovbb/website/5ea7f3d8652778dc5e2db0cc33a846db5f1a5fb8-2292x2293.png)

_来自大型语言模型（LLM）的视觉反馈可以为你的智能体提供有用的指导。_

### [**LLM 作为评判者**](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#llm-%E4%BD%9C%E4%B8%BA%E8%AF%84%E5%88%A4%E8%80%85)

你还可以让另一个语言模型根据模糊规则”评判”智能体的输出。这通常不是一种非常稳健的方法，并且可能有很大的延迟权衡，但对于任何性能提升都值得成本的应用程序，它可能会有所帮助。

我们的电子邮件智能体可能会让一个单独的子智能体评判其草稿的语气，看看它们是否与用户以前的消息很好地契合。

## [测试和改进你的智能体](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E6%B5%8B%E8%AF%95%E5%92%8C%E6%94%B9%E8%BF%9B%E4%BD%A0%E7%9A%84%E6%99%BA%E8%83%BD%E4%BD%93)

在经历了几次智能体循环之后，我们建议测试你的智能体，并确保它具备完成任务所需的能力。改进智能体的最佳方法是仔细查看其输出，尤其是失败的情况，并设身处地为它着想：它是否拥有完成工作的[正确工具](https://www.anthropic.com/engineering/writing-tools-for-agents)？

以下是在评估智能体是否具备完成工作的能力时要问的其他一些问题：

*   如果你的智能体误解了任务，它可能缺少关键信息。你能否改变搜索 API 的结构，使其更容易找到所需的信息？
*   如果你的智能体在某个任务上反复失败，你能否在工具调用中添加正式规则来识别和修复故障？
*   如果你的智能体无法修复其错误，你能否给它更有用或更有创意的工具来以不同的方式处理问题？
*   如果你的智能体的性能在添加功能时发生变化，请根据客户使用情况构建一个代表性的测试集以进行程序化评估（或 evals）。

## [开始使用](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E5%BC%80%E5%A7%8B%E4%BD%BF%E7%94%A8)

Claude Agent SDK 通过让 Claude 访问计算机（可以编写文件、运行命令和迭代其工作）来更轻松地构建自主智能体。

牢记智能体循环（收集上下文、采取行动和验证工作），你可以构建易于部署和迭代的可靠智能体。

你今天就可以[开始使用](https://docs.claude.com/en/api/agent-sdk/overview) Claude Agent SDK。对于已经在 SDK 上构建的开发者，我们建议按照[本指南](https://docs.claude.com/en/docs/claude-code/sdk/migration-guide)迁移到最新版本。

## [致谢](https://stellarlink.co/articles/claude-agent-sdk-zh-cn#%E8%87%B4%E8%B0%A2)

由 Thariq Shihipar 撰写，Molly Vorweck、Suzanne Wang、Alex Isken、Cat Wu、Keir Bradwell、Alexander Bricken 和 Ashwin Bhat 提供笔记和编辑。
