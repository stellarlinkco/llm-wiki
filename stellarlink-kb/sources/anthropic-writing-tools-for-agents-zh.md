---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh"
title: 为代理编写工具 - 使用AI代理
description: 为代理编写工具 - 使用AI代理
resource: "https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh"
tags: []
timestamp: "2026-06-20T06:45:33.363Z"
source_path: "https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh"
source_id: af908b805408ff40bdd441b2f609452ccc127f00edb994f9a0c41bb5bd29be9c
content_hash: c8d6e5c37d3b2dbc3b3c0591de275410066c930c82523b328aeffa3227d23358
---

## [为代理编写工具 - 使用AI代理](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E4%B8%BA%E4%BB%A3%E7%90%86%E7%BC%96%E5%86%99%E5%B7%A5%E5%85%B7---%E4%BD%BF%E7%94%A8ai%E4%BB%A3%E7%90%86)

> **原文链接**: [Writing effective tools for AI agents—using AI agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
> 
> **作者**: Ken Aizawa 及 Anthropic 团队
> 
> **发布日期**: 2025年9月11日

![文章主图：为代理编写有效工具的抽象插图](https://www-cdn.anthropic.com/images/4zrzovbb/website/876165247ba5668bd195854eef4631ad9a184001-1000x1000.svg)

代理的效果取决于我们提供给它们的工具。我们分享如何编写高质量的工具和评估，以及如何通过使用Claude来优化其自身的工具来提升性能。

模型上下文协议（MCP）可以为LLM代理提供数百种工具来解决现实世界的任务。但我们如何使这些工具发挥最大效能？

在本文中，我们描述了在各种代理AI系统中提高性能的最有效技术。

我们首先介绍如何：

*   构建和测试工具原型
*   创建并运行工具与代理的综合评估
*   与像Claude Code这样的代理协作，自动提升工具性能

我们总结了编写高质量工具的关键原则：

*   选择正确的工具来实现（以及不实现）
*   命名空间工具以定义清晰的功能边界
*   从工具返回有意义的上下文给代理
*   优化工具响应以提高令牌效率
*   提示工程优化工具描述和规范

![工程师使用Claude Code评估代理工具效能的示意图](https://www-cdn.anthropic.com/images/4zrzovbb/website/cdc027ad2730e4732168bb198fc9363678544f99-1920x1080.png) _构建评估允许你系统地衡量工具的性能。你可以使用Claude Code根据这个评估自动优化你的工具。_

## [什么是工具？](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E4%BB%80%E4%B9%88%E6%98%AF%E5%B7%A5%E5%85%B7)

在计算中，确定性系统在给定相同输入时每次都会产生相同的输出，而非确定性系统（如代理）即使在相同的起始条件下也可能生成不同的响应。

当我们传统地编写软件时，我们在确定性系统之间建立契约。例如，函数调用`getWeather("NYC")`每次调用时都会以完全相同的方式获取纽约市的天气。

工具是一种新型软件，它反映了确定性系统和非确定性代理之间的契约。当用户问”我今天应该带伞吗？“时，代理可能会调用天气工具、根据一般知识回答，甚至可能先询问位置的澄清问题。偶尔，代理可能会产生幻觉或甚至无法理解如何使用工具。

这意味着在为代理编写软件时需要从根本上重新思考我们的方法：我们需要为代理设计工具，而不是像为其他开发人员或系统编写函数和API那样编写工具和MCP服务器。

我们的目标是通过使用工具来追求各种成功策略，增加代理在解决广泛任务时的有效表面积。幸运的是，根据我们的经验，对代理最”符合人体工程学”的工具最终也会令人惊讶地直观易懂。

## [如何编写工具](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E5%A6%82%E4%BD%95%E7%BC%96%E5%86%99%E5%B7%A5%E5%85%B7)

在本节中，我们描述如何与代理协作来编写和改进你提供给它们的工具。首先构建工具的快速原型并在本地测试。接下来，运行综合评估来衡量后续更改。与代理一起工作，你可以重复评估和改进工具的过程，直到你的代理在现实世界任务中取得良好性能。

### [构建原型](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E6%9E%84%E5%BB%BA%E5%8E%9F%E5%9E%8B)

很难在不亲自动手的情况下预测代理会发现哪些工具符合人体工程学，哪些不会。首先构建工具的快速原型。如果你使用Claude Code编写工具（可能一次性完成），向Claude提供工具将依赖的任何软件库、API或SDK（可能包括MCP SDK）的文档会很有帮助。LLM友好的文档通常可以在官方文档站点的扁平llms.txt文件中找到（这是我们API的）。

将工具包装在本地MCP服务器或桌面扩展（DXT）中，可以让你在Claude Code或Claude桌面应用程序中连接和测试工具。

*   要将本地MCP服务器连接到Claude Code，运行`claude mcp add <name> <command> [args...]`。
*   要将本地MCP服务器或DXT连接到Claude桌面应用程序，分别导航到设置>开发人员或设置>扩展。

工具也可以直接传递到Anthropic API调用中进行编程测试。

自己测试工具以识别任何粗糙的边缘。收集用户反馈，以建立对你期望工具启用的用例和提示的直觉。

### [运行评估](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E8%BF%90%E8%A1%8C%E8%AF%84%E4%BC%B0)

接下来，你需要通过运行评估来衡量Claude使用你的工具的效果。首先生成大量基于现实世界使用的评估任务。我们建议与代理协作来帮助分析结果并确定如何改进工具。在我们的工具评估手册中查看这个端到端的过程。

![人工编写 vs Claude优化的Slack MCP服务器测试集准确率对比图](https://www-cdn.anthropic.com/images/4zrzovbb/website/6e810aee67f3f3c955832fb7bf9033ffb0102000-1920x1080.png) _我们内部Slack工具的保留测试集性能_

#### [生成评估任务](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E7%94%9F%E6%88%90%E8%AF%84%E4%BC%B0%E4%BB%BB%E5%8A%A1)

通过你的早期原型，Claude Code可以快速探索你的工具并创建数十个提示和响应对。提示应该受到现实世界使用的启发，并基于现实的数据源和服务（例如，内部知识库和微服务）。我们建议你避免过于简单或肤浅的”沙箱”环境，这些环境不会用足够的复杂性来压力测试你的工具。强大的评估任务可能需要多个工具调用——可能几十个。

以下是一些强大任务的例子：

*   安排下周与Jane的会议，讨论我们最新的Acme Corp项目。附上我们上次项目计划会议的笔记并预订会议室。
*   客户ID 9182报告说他们因一次购买尝试被收费三次。查找所有相关日志条目，并确定是否有其他客户受到同样问题的影响。
*   客户Sarah Chen刚刚提交了取消请求。准备挽留方案。确定：(1)他们离开的原因，(2)什么挽留方案最有说服力，(3)在提供方案前我们应该注意的任何风险因素。

以下是一些较弱的任务：

*   安排下周与[jane@acme.corp](mailto:jane@acme.corp)的会议。
*   在支付日志中搜索purchase\_complete和customer\_id=9182。
*   通过客户ID 45892查找取消请求。

每个评估提示都应该与可验证的响应或结果配对。你的验证器可以简单到在真实答案和采样响应之间进行精确字符串比较，或者复杂到让Claude来判断响应。避免过于严格的验证器，由于格式、标点符号或有效的替代措辞等虚假差异而拒绝正确的响应。

对于每个提示-响应对，你还可以选择性地指定你期望代理在解决任务时调用的工具，以衡量代理在评估期间是否成功理解每个工具的目的。然而，由于可能有多条有效路径来正确解决任务，尽量避免过度指定或过度拟合策略。

#### [运行评估](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E8%BF%90%E8%A1%8C%E8%AF%84%E4%BC%B0-1)

我们建议使用直接的LLM API调用以编程方式运行评估。使用简单的代理循环（包装交替LLM API和工具调用的while循环）：每个评估任务一个循环。每个评估代理应该获得单个任务提示和你的工具。

在评估代理的系统提示中，我们建议指导代理不仅输出结构化响应块（用于验证），还要输出推理和反馈块。在工具调用和响应块之前指导代理输出这些内容可能会通过触发思维链（CoT）行为来提高LLM的有效智能。

如果你使用Claude运行评估，可以打开交错思维以获得类似的”开箱即用”功能。这将帮助你探究代理为什么调用或不调用某些工具，并突出工具描述和规范中的具体改进领域。

除了顶级准确性，我们建议收集其他指标，如单个工具调用和任务的总运行时间、工具调用总数、总令牌消耗和工具错误。跟踪工具调用可以帮助揭示代理追求的常见工作流程，并为工具整合提供一些机会。

![人工编写 vs Claude优化的Asana MCP服务器测试集准确率对比图](https://www-cdn.anthropic.com/images/4zrzovbb/website/3f1f47e80974750cd924bc51e42b6df1ad997fab-1920x1080.png) _我们内部Asana工具的保留测试集性能_

#### [分析结果](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E5%88%86%E6%9E%90%E7%BB%93%E6%9E%9C)

代理是你在发现问题和提供反馈方面的有用伙伴，从矛盾的工具描述到低效的工具实现和令人困惑的工具模式。然而，请记住，代理在反馈和响应中省略的内容往往比包含的内容更重要。LLM并不总是说出它们的意思。

观察你的代理在哪里遇到困难或困惑。通读评估代理的推理和反馈（或CoT）以识别粗糙的边缘。查看原始记录（包括工具调用和工具响应）以捕获代理CoT中未明确描述的任何行为。读懂字里行间的意思；记住你的评估代理不一定知道正确的答案和策略。

分析你的工具调用指标。大量冗余的工具调用可能表明需要对分页或令牌限制参数进行适当调整；大量因参数无效导致的工具错误可能表明工具需要更清晰的描述或更好的示例。当我们推出Claude的网络搜索工具时，我们发现Claude不必要地在工具的查询参数中添加2025，偏见搜索结果并降低性能（我们通过改进工具描述引导Claude朝正确的方向发展）。

### [与代理协作](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E4%B8%8E%E4%BB%A3%E7%90%86%E5%8D%8F%E4%BD%9C)

你甚至可以让代理分析你的结果并为你改进工具。只需将评估代理的记录连接起来并粘贴到Claude Code中。Claude是分析记录和同时重构大量工具的专家——例如，确保在进行新更改时工具实现和描述保持自洽。

事实上，本文中的大多数建议来自于反复使用Claude Code优化我们的内部工具实现。我们的评估建立在我们内部工作区的基础上，反映了我们内部工作流程的复杂性，包括真实的项目、文档和消息。

我们依靠保留测试集来确保我们不会过度拟合我们的”训练”评估。这些测试集表明，即使在我们通过”专家”工具实现所达到的成就之外，我们还可以提取额外的性能改进——无论这些工具是由我们的研究人员手动编写还是由Claude本身生成。

## [编写有效工具的原则](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E7%BC%96%E5%86%99%E6%9C%89%E6%95%88%E5%B7%A5%E5%85%B7%E7%9A%84%E5%8E%9F%E5%88%99)

在本节中，我们将学习提炼为编写有效工具的几个指导原则。

### [为代理选择正确的工具](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E4%B8%BA%E4%BB%A3%E7%90%86%E9%80%89%E6%8B%A9%E6%AD%A3%E7%A1%AE%E7%9A%84%E5%B7%A5%E5%85%B7)

更多的工具并不总是带来更好的结果。我们观察到的一个常见错误是工具仅仅包装现有的软件功能或API端点——无论这些工具是否适合代理。这是因为代理与传统软件有不同的”可供性”——也就是说，它们有不同的方式来感知使用这些工具可以采取的潜在行动。

LLM代理具有有限的”上下文”（即，它们一次可以处理的信息量有限），而计算机内存便宜且充足。考虑在地址簿中搜索联系人的任务。传统软件程序可以有效地一次存储和处理一个联系人列表，在继续之前检查每一个。

然而，如果LLM代理使用返回所有联系人的工具，然后必须逐个令牌地读取每个联系人，它就是在浪费有限的上下文空间在无关信息上（想象通过从上到下阅读每一页来搜索地址簿中的联系人——即通过暴力搜索）。更好和更自然的方法（对代理和人类都是如此）是首先跳到相关页面（可能按字母顺序找到它）。

我们建议构建一些针对特定高影响工作流程的深思熟虑的工具，这些工具与你的评估任务相匹配，并从那里扩展。在地址簿案例中，你可能选择实现`search_contacts`或`message_contact`工具，而不是`list_contacts`工具。

工具可以整合功能，在幕后处理可能的多个离散操作（或API调用）。例如，工具可以用相关元数据丰富工具响应，或在单个工具调用中处理频繁链接的多步骤任务。

以下是一些例子：

*   与其实现`list_users`、`list_events`和`create_event`工具，不如考虑实现一个`schedule_event`工具，它可以找到可用性并安排事件。
*   与其实现`read_logs`工具，不如考虑实现`search_logs`工具，它只返回相关的日志行和一些周围的上下文。
*   与其实现`get_customer_by_id`、`list_transactions`和`list_notes`工具，不如实现一个`get_customer_context`工具，它一次性编译客户所有最近的相关信息。

确保你构建的每个工具都有明确、独特的目的。工具应该使代理能够以与人类在访问相同底层资源时相同的方式细分和解决任务，同时减少原本会被中间输出消耗的上下文。

太多工具或重叠的工具也会分散代理追求有效策略的注意力。仔细、选择性地规划你构建（或不构建）的工具确实可以得到回报。

### [命名空间你的工具](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E5%91%BD%E5%90%8D%E7%A9%BA%E9%97%B4%E4%BD%A0%E7%9A%84%E5%B7%A5%E5%85%B7)

你的AI代理可能会获得数十个MCP服务器和数百种不同工具的访问权限——包括其他开发人员的工具。当工具在功能上重叠或目的模糊时，代理可能会对使用哪个工具感到困惑。

命名空间（在公共前缀下对相关工具进行分组）可以帮助在大量工具之间划定边界；MCP客户端有时会默认执行此操作。例如，按服务（例如`asana_search`、`jira_search`）和按资源（例如`asana_projects_search`、`asana_users_search`）命名空间工具，可以帮助代理在正确的时间选择正确的工具。

我们发现在前缀和后缀命名空间之间进行选择对我们的工具使用评估有非平凡的影响。效果因LLM而异，我们鼓励你根据自己的评估选择命名方案。

代理可能调用错误的工具、用错误的参数调用正确的工具、调用太少的工具，或者错误地处理工具响应。通过选择性地实现名称反映任务自然细分的工具，你可以同时减少加载到代理上下文中的工具和工具描述的数量，并将代理计算从代理的上下文卸载回工具调用本身。这减少了代理犯错误的总体风险。

### [从工具返回有意义的上下文](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E4%BB%8E%E5%B7%A5%E5%85%B7%E8%BF%94%E5%9B%9E%E6%9C%89%E6%84%8F%E4%B9%89%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87)

同样，工具实现应该注意只向代理返回高信号信息。它们应该优先考虑上下文相关性而不是灵活性，并避免低级技术标识符（例如：`uuid`、`256px_image_url`、`mime_type`）。像`name`、`image_url`和`file_type`这样的字段更有可能直接通知代理的下游操作和响应。

代理在处理自然语言名称、术语或标识符方面也往往比处理神秘标识符更成功。我们发现，仅仅将任意字母数字UUID解析为更具语义意义和可解释的语言（甚至是0索引的ID方案）就可以通过减少幻觉显著提高Claude在检索任务中的精度。

在某些情况下，代理可能需要灵活地与自然语言和技术标识符输出交互，即使只是为了触发下游工具调用（例如，`search_user(name='jane')` → `send_message(id=12345)`）。你可以通过在工具中公开简单的`response_format`枚举参数来启用两者，允许代理控制工具是返回”简洁”还是”详细”响应。

你可以添加更多格式以获得更大的灵活性，类似于GraphQL，你可以选择想要接收的确切信息片段。以下是一个控制工具响应详细程度的ResponseFormat枚举示例：

```
enum ResponseFormat {
   DETAILED = "detailed",
   CONCISE = "concise"
}
```

以下是详细工具响应示例（206个令牌）：

![详细工具响应代码片段示例](https://www-cdn.anthropic.com/images/4zrzovbb/website/5ed0d30526bf68624f335d075b8c1541be3bb595-1920x1006.png)

以下是简洁工具响应示例（72个令牌）：

![简洁工具响应代码片段示例](https://www-cdn.anthropic.com/images/4zrzovbb/website/d4f649a66482efb5a80cf14ea85e84974ede1c49-1920x725.png)

_Slack线程和线程回复由唯一的`thread_ts`标识，这是获取线程回复所必需的。`thread_ts`和其他ID（`channel_id`、`user_id`）可以从”详细”工具响应中检索，以启用需要这些ID的进一步工具调用。“简洁”工具响应仅返回线程内容并排除ID。在这个例子中，我们通过”简洁”工具响应使用了约1/3的令牌。_

即使你的工具响应结构——例如XML、JSON或Markdown——也会对评估性能产生影响：没有一种适合所有情况的解决方案。这是因为LLM是在下一个令牌预测上训练的，并且倾向于使用与其训练数据匹配的格式表现更好。最佳响应结构将因任务和代理而异。我们鼓励你根据自己的评估选择最佳响应结构。

### [优化工具响应的令牌效率](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E4%BC%98%E5%8C%96%E5%B7%A5%E5%85%B7%E5%93%8D%E5%BA%94%E7%9A%84%E4%BB%A4%E7%89%8C%E6%95%88%E7%8E%87)

优化上下文质量很重要。但优化工具响应中返回给代理的上下文数量也很重要。

我们建议为任何可能使用大量上下文的工具响应实现分页、范围选择、过滤和/或截断的某种组合，并提供合理的默认参数值。对于Claude Code，我们默认将工具响应限制为25,000个令牌。我们期望代理的有效上下文长度会随时间增长，但对上下文高效工具的需求仍然存在。

如果你选择截断响应，请务必用有用的说明引导代理。你可以直接鼓励代理追求更高效的令牌策略，例如为知识检索任务进行许多小而有针对性的搜索，而不是单个广泛的搜索。同样，如果工具调用引发错误（例如，在输入验证期间），你可以通过提示工程设计错误响应，以清楚地传达具体和可操作的改进，而不是不透明的错误代码或回溯。

以下是截断工具响应的示例：

![截断工具响应示例图片](https://www-cdn.anthropic.com/images/4zrzovbb/website/e440d6a69d0ca80e71f3bec5c2d00906ff03ce6d-1920x1162.png)

以下是无帮助的错误响应示例：

![无帮助的工具响应示例图片](https://www-cdn.anthropic.com/images/4zrzovbb/website/2445187904704fec8c50af0b950e310ba743fac2-1920x733.png)

以下是有帮助的错误响应示例：

![有帮助的错误响应示例图片](https://www-cdn.anthropic.com/images/4zrzovbb/website/810661bd44a35fb273806ae95160040155978c3e-1920x850.png)

工具截断和错误响应可以引导代理朝着更高效的工具使用行为发展（使用过滤器或分页），或提供正确格式化的工具输入示例。

### [提示工程优化你的工具描述](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E6%8F%90%E7%A4%BA%E5%B7%A5%E7%A8%8B%E4%BC%98%E5%8C%96%E4%BD%A0%E7%9A%84%E5%B7%A5%E5%85%B7%E6%8F%8F%E8%BF%B0)

我们现在来到改进工具最有效的方法之一：提示工程优化你的工具描述和规范。因为这些会加载到代理的上下文中，它们可以共同引导代理朝着有效的工具调用行为发展。

在编写工具描述和规范时，想想你如何向团队中的新员工描述你的工具。考虑你可能隐含带来的上下文——专门的查询格式、小众术语的定义、底层资源之间的关系——并使其明确。通过清楚地描述（并使用严格的数据模型强制执行）预期的输入和输出来避免歧义。特别是，输入参数应该明确命名：与其使用名为`user`的参数，不如尝试名为`user_id`的参数。

通过评估，你可以更有信心地衡量提示工程的影响。即使对工具描述进行小的改进也能产生显著的改进。在我们对工具描述进行精确改进后，Claude Sonnet 3.5在SWE-bench Verified评估中取得了最先进的性能，显著降低了错误率并改善了任务完成。

你可以在我们的开发人员指南中找到工具定义的其他最佳实践。如果你正在为Claude构建工具，我们还建议阅读关于工具如何动态加载到Claude系统提示中的内容。最后，如果你正在为MCP服务器编写工具，工具注释有助于披露哪些工具需要开放世界访问或进行破坏性更改。

## [展望未来](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E5%B1%95%E6%9C%9B%E6%9C%AA%E6%9D%A5)

要为代理构建有效的工具，我们需要将软件开发实践从可预测的、确定性的模式重新定向到非确定性的模式。

通过我们在本文中描述的迭代、评估驱动的过程，我们已经确定了使工具成功的一致模式：有效的工具是有意且清晰定义的，明智地使用代理上下文，可以在多样化的工作流程中组合在一起，并使代理能够直观地解决现实世界的任务。

在未来，我们期望代理与世界交互的具体机制会演进——从MCP协议的更新到底层LLM本身的升级。通过系统的、评估驱动的方法来改进代理工具，我们可以确保随着代理变得更有能力，它们使用的工具也会随之发展。

## [致谢](https://stellarlink.co/articles/anthropic-writing-tools-for-agents-zh#%E8%87%B4%E8%B0%A2)

由Ken Aizawa撰写，来自研究团队（Barry Zhang、Zachary Witten、Daniel Jiang、Sami Al-Sheikh、Matt Bell、Maggie Vo）、MCP团队（Theodora Chu、John Welsh、David Soria Parra、Adam Jones）、产品工程（Santiago Seira）、市场营销（Molly Vorwerck）、设计（Drew Roper）和应用AI（Christian Ryan、Alexander Bricken）的同事做出了宝贵贡献。

注1：超出训练底层LLM本身。

* * *
