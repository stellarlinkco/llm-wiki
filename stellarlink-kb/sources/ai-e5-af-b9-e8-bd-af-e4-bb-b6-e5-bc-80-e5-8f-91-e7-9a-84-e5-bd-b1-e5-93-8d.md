---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D"
title: AI 对软件开发的影响
description: "计算机编程相关的工作在现代经济中只占很小一部分,但却具有重要影响力。"
resource: "https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D"
tags: []
timestamp: "2026-06-20T06:45:24.367Z"
source_path: "https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D"
source_id: 5ae6cd57a587feb967ef052824478ec0442eb3067804ab08b07967804b3f9a69
content_hash: c524f025f2829d942ff3e17606228c3199029b7655e41d2091c3ac83824f8a58
---

计算机编程相关的工作在现代经济中只占很小一部分,但却具有重要影响力。在过去几年里,能够辅助甚至自动化大量编码工作的 AI 系统的引入,已经极大地改变了这些工作。

在我们[之前的经济指数研究](https://www.anthropic.com/news/the-anthropic-economic-index)中,我们发现美国计算机相关职业的工作者极不成比例地大量使用 Claude:也就是说,关于计算机相关任务与 Claude 的对话数量,远远超过根据相关工作的从业人数所能预测的数量。在[教育场景](https://www.anthropic.com/news/anthropic-education-report-how-university-students-use-claude)中也是如此:涉及大量编码的计算机科学学位显示出极不成比例的 AI 使用情况。

为了更详细地了解这些变化,我们对 [Claude.ai](http://claude.ai/redirect/website.v1.44ed50e8-08d9-4188-b03d-a200860a1d05)(大多数人与 Claude 交互的”默认”方式)和 [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)(我们新推出的专业编码”Agent”,可以使用各种数字工具独立完成一系列复杂任务)上 50 万次编码相关交互进行了分析。

我们发现了三个关键模式:

1.  **编码 Agent 更多用于自动化。** Claude Code 上 79% 的对话被识别为”自动化”——AI 直接执行任务——而非”增强”,即 AI 与人类协作并增强人类能力(21%)。相比之下,只有 49% 的 Claude.ai 对话被归类为自动化。_这可能意味着,随着 AI Agent 变得越来越普遍,以及随着更多 Agentic AI 产品的构建,我们应该预期会有更多任务自动化。_
2.  **编码人员通常使用 AI 构建面向用户的应用。** JavaScript 和 HTML 等 Web 开发语言是我们数据集中最常用的编程语言,用户界面和用户体验任务也是主要的编码用途之一。_这表明,专注于制作简单应用和用户界面的工作,可能比纯粹专注于后端工作的工作更早面临 AI 系统的颠覆。_
3.  **初创公司是 Claude Code 的主要早期采用者,而企业则落后。** 在初步分析中,我们估计 Claude Code 上 33% 的对话服务于与初创公司相关的工作,相比之下只有 13% 被识别为与企业相关的应用。_这一采用差距表明,在使用尖端 AI 工具的灵活组织和传统企业之间存在分歧。_

### [我们如何分析 Claude Code 和 Claude.ai 上的对话](https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D#%E6%88%91%E4%BB%AC%E5%A6%82%E4%BD%95%E5%88%86%E6%9E%90-claude-code-%E5%92%8C-claudeai-%E4%B8%8A%E7%9A%84%E5%AF%B9%E8%AF%9D)

我们使用我们的[隐私保护分析工具](https://www.anthropic.com/research/clio)分析了总共 50 万次 Claude 交互(在 Claude Code 和 Claude.ai 之间分配),该工具将用户对话提炼为更高层次的匿名化洞察。在这里,我们用它来识别对话的主题(例如”UI/UX 组件开发”),或者——正如我们将在下面解释的那样——将对话归类为侧重于”增强”还是”自动化”。

### [开发人员如何与 Claude 交互?](https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D#%E5%BC%80%E5%8F%91%E4%BA%BA%E5%91%98%E5%A6%82%E4%BD%95%E4%B8%8E-claude-%E4%BA%A4%E4%BA%92)

在我们之前的经济指数报告中,我们将 AI 直接执行任务的”自动化”与 AI 与用户协作执行任务的”增强”区分开来。在这里,我们发现 Claude Code 显示出显著更高的自动化率——79% 的对话涉及某种形式的自动化,而 Claude.ai 上为 49%。

我们还将自动化和增强分为几个子类型(正如我们[之前的工作](https://www.anthropic.com/news/the-anthropic-economic-index)中所讨论的)。“反馈循环”模式,即 Claude 在人工验证的帮助下自主完成任务(例如,用户将任何错误发送回 Claude),在 Claude Code 上几乎是 Claude.ai(21.3%)的两倍(35.8% 的交互)。“指令式”对话,即 Claude 在最少用户交互的情况下完成任务,在 Claude Code 上也更高(43.8%,而 Claude.ai 上为 27.5%)。所有增强模式——包括用户从 AI 模型获取知识的”学习”——在 Claude Code 上都大大低于 Claude.ai。

![Stacked bar chart showing the percentage of automation and augmentation on Claude.ai and Claude Code.](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F0bd4b66d347cd7c956f54fafa9793368e63b2ed0-4000x2250.jpg&w=3840&q=75)

子类型定义如下。指令式:最少交互的完整任务委托;反馈循环:由环境反馈引导的任务完成;任务迭代:协作式精炼过程;学习:知识获取和理解;验证:工作验证和改进。

这些结果说明了专业的、以编码为重点的 Agent(在本例中为 Claude Code)与用户与大型语言模型交互的更”标准”方式(即通过像 Claude.ai 这样的聊天机器人界面)之间的差异。随着更多 Agentic 产品的发布,我们可能会看到 AI 集成到人们工作中的方式发生变化。至少在编码的情况下,这可能涉及更多任务自动化。

这引发了关于随着 AI 使用变得更加普遍,开发人员在多大程度上仍将参与其中的问题。重要的是,我们的结果确实显示,即使在自动化中,人类也经常参与其中:“反馈循环”交互仍然需要用户输入(即使该输入只是将错误消息粘贴回 Claude)。但绝不能确定这种模式会持续到未来,因为更强大的 Agentic 系统可能会逐渐减少对用户输入的需求。

### [开发人员使用 Claude 构建什么?](https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D#%E5%BC%80%E5%8F%91%E4%BA%BA%E5%91%98%E4%BD%BF%E7%94%A8-claude-%E6%9E%84%E5%BB%BA%E4%BB%80%E4%B9%88)

总体而言,我们发现开发人员通常使用 Claude 为网站和移动应用构建用户界面和交互元素。虽然没有单一语言占主导地位,但主要以 Web 为重点的开发语言 JavaScript 和 TypeScript 合计占所有查询的 31%,而 HTML 和 CSS(其他用于面向用户代码的语言)合计又增加了 28%。

![Line graph showing top coding use cases used in Claude.](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F26b926ce7a1cff3c6d3f9fe63e6cf2417b945ce8-4001x2251.jpg&w=3840&q=75)

百分比表示两个平台上编码相关任务的总百分比。由于 Claude Code 和 Claude.ai 权重相等,因此对应于每个平台的条形部分代表该平台使用量的一半。

后端开发语言(用于幕后逻辑、数据库和基础设施,以及 API 和 AI 开发)也有所体现:值得注意的是,Python 占查询的 14%。然而,Python 具有双重用途——既用于后端开发,也用于数据分析。与 SQL(另一种以数据为重点的语言,占查询的 6%)结合,这些语言可能包括许多超出传统后端开发的数据科学和分析应用。

![Line graph showing top programming languages used in Claude.](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F79fcc40e7d9909258d202b382b7ab357e0893eb0-4001x2251.jpg&w=3840&q=75)

编码语言使用的百分比表示两个平台的总百分比。由于 Claude Code 和 Claude.ai 权重相等,因此对应于每个平台的条形部分代表该平台使用量的一半。

这些模式进一步延伸到涉及 Claude 的常见编码任务类型。前五大任务中有两个专注于面向用户的应用开发:“UI/UX 组件开发”和”Web 和移动应用开发”分别占对话的 12% 和 8%。这些任务越来越适合一种被称为”氛围编码”的现象——不同经验水平的开发人员用自然语言描述他们期望的结果,让 AI 负责实现细节。

与更通用用途相关的对话,例如”软件架构和代码设计”以及”调试和性能优化”,在 Claude.ai 和 Claude Code 中也有很高的代表性。

推测性地说,这些发现表明,如果不断增强的能力使”氛围编码”更多地转向主流工作流程,那么专注于制作简单应用和用户界面的工作可能会更早面临 AI 系统的颠覆。随着 AI 越来越多地处理组件创建和样式任务,这些开发人员可能会转向更高层次的设计和用户体验工作。

### [谁在使用 Claude 进行编码?](https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D#%E8%B0%81%E5%9C%A8%E4%BD%BF%E7%94%A8-claude-%E8%BF%9B%E8%A1%8C%E7%BC%96%E7%A0%81)

我们还分析了哪些开发人员群体可能正在使用 Claude。我们使用我们的分析系统来识别最能描述用户编码相关交互的项目类型(例如个人项目与为初创公司完成的项目)。因为我们不知道 Claude 的响应被使用的真实世界背景,这些分析依赖于从不完整数据中得出的不确定推论。因此,我们将这些发现视为比上述发现更初步的结果。

![Graph showing types of projects in Claude.ai and Claude Code, with a list of different projects and the percentage of times they appeared in our dataset.](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2Ff6c0ff39789bdad7dcc1efe4a24e5b468931fec0-4000x2250.jpg&w=3840&q=75)

点之间的距离表示每种项目类型在 Claude.ai(蓝色)和 Claude Code(橙色)上流行程度的差距。

初创公司似乎是 Claude Code 的主要早期采用者,企业采用落后。初创公司工作占 Claude Code 对话的 32.9%(比其 Claude.ai 使用量高出近 20%),而企业工作仅占 23.8%(略低于其在 Claude.ai 上 25.9% 的份额)。

此外,涉及学生、学术界、个人项目构建者和教程/学习用户的使用在两个平台上总共占交互的一半。换句话说,个人——不仅仅是企业——是编码辅助工具的重要采用者。

这些采用模式反映了过去的技术转变,即初创公司使用新工具来获得竞争优势,而成熟组织则更加谨慎,在全公司范围内采用新工具之前通常会进行详细的安全检查。AI 的通用性质可能会加速这种动态:如果 AI Agent 提供显著的生产力提升,早期采用者和晚期采用者之间的差距可能会转化为实质性的竞争优势。

### [局限性](https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D#%E5%B1%80%E9%99%90%E6%80%A7)

我们的分析基于真实世界的 AI 使用——开发人员实际上如何在其工作流程中使用 Claude。尽管这种方法使我们的发现具有实际相关性,但它也带来了固有的局限性。这些包括:

*   我们仅分析了来自 Claude.ai 和 Claude Code 的数据。我们排除了可能显示不同模式的 Team、Enterprise 和 API 使用,特别是在专业环境中;
*   随着像 Claude Code 这样的 Agentic 工具,自动化和增强之间的界限变得越来越模糊。例如,“反馈循环”模式在质量上与传统自动化不同,因为它仍然需要用户监督和输入。我们可能需要扩展自动化/增强框架以考虑新的 Agentic 能力;
*   我们对谁在使用 Claude 进行编码的分类依赖于从有限上下文中的推论。在将对话归类为”初创公司”与”企业”工作,或”个人”与”学术”项目时,我们的分析工具根据不完整的信息做出了有根据的猜测。因此,一些分类可能是不正确的。此外,我们包含了一个”无法分类”选项,Claude 在 5% 的 Claude.ai 对话和 2% 的 Claude Code 对话中选择了该选项。我们从分析中排除了这一类别并重新标准化了结果;
*   我们的数据集可能捕获了早期采用者。这些用户可能不代表更广泛的开发人员群体,这种自我选择可能会使使用模式偏向更有经验或技术上更冒险的用户;
*   由于隐私考虑,我们只分析了特定保留窗口内的数据,可能错过了软件开发中的周期性模式(例如冲刺周期或发布时间表);
*   相对于整体 AI 编码辅助采用,Claude 使用的代表性尚不清楚。许多开发人员使用 Claude 之外的多个 AI 工具,这意味着我们只呈现了他们 AI 参与模式的部分视图;
*   我们只研究了开发人员委托给 AI 的内容——而不是他们最终如何在代码库中使用 AI 输出,生成代码的质量,或者这些交互是否有效地提高了生产力或代码质量。

### [展望未来](https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D#%E5%B1%95%E6%9C%9B%E6%9C%AA%E6%9D%A5)

AI 正在从根本上改变开发人员的工作方式。我们的分析表明,在使用像 Claude Code 这样的专业 Agentic 系统的地方,这种情况尤其明显,在面向用户的应用开发工作中尤其强烈,并且可能为初创公司而非更成熟的商业企业带来特定优势。

我们的发现引发了许多问题。随着 AI 能力的进步,人类仍然参与其中的”反馈循环”的普遍性是否会持续,还是我们会看到向更完全的自动化转变?随着 AI 系统能够构建更大规模的软件,开发人员是否会转而主要管理和指导这些系统,而不是自己编写代码?哪些软件开发角色将变化最大,哪些可能会完全消失?

AI 不断增强的编码技能对 AI 开发本身也可能特别重要。由于 AI 研究和开发如此依赖软件,AI 辅助编码的进步可能有助于加速突破,创造一个积极强化的循环,进一步加速 AI 进步。

从宏观角度来看,AI 系统是极其新的。但从相对意义上说,编码是经济中 AI 最发达的用途之一。这使得它值得关注。尽管我们不能假设我们从软件开发中得出的教训会直接延续到其他类型的职业,但软件开发可能是一个领先指标,为我们提供有关其他职业在未来如何随着越来越强大的 AI 模型的推出而变化的有用信息。

## [附录](https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D#%E9%99%84%E5%BD%95)

作为补充分析,我们还将软件相关自动化和增强模式的结果与不涉及软件的交互模式进行了比较。我们专门在 Claude.ai 中进行了这项分析,因为 Claude Code 专门从事软件应用。

![Table showing percentages of different patterns of AI use for software and non-software applications.](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F3539fa9144a552602c77fb78b7f8ed025dfaa7cd-4001x2251.jpg&w=3840&q=75)

Claude.ai 中软件与非软件用例的自动化和增强细分。有关每种模式的描述,请参阅上面第一张图的说明。

与不涉及软件的用例相比,软件开发更具自动化性。反馈循环的显著增加(+18.3%)推动了这一点,值得注意的是,它抵消了指令式行为的明显_减少_(-11.2%)。换句话说,相对于非编码任务,AI 辅助编码目前需要大量人工审查和迭代,即使 Claude 完成了大部分工作。

#### [脚注](https://stellarlink.co/articles/ai-%E5%AF%B9%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E7%9A%84%E5%BD%B1%E5%93%8D#%E8%84%9A%E6%B3%A8)

1.  Claude.ai 对话特指来自 Claude.ai Free 和 Pro 的对话。此样本仅包括由第一方 API 提供支持的 Claude Code 会话(Claude Code 可以由 Anthropic 第一方 API 或第三方云提供商 API 提供支持)。我们分析中使用的 Claude.ai 和 Claude Code 的所有对话均来自 2025 年 4 月 6 日至 13 日。初始样本在 Claude.ai 和 Claude Code 之间平均分配,对于 Claude.ai,我们应用了基于 Claude 的过滤器来选择与编码相关的对话。为了考虑过滤器,我们在适用的情况下重新标准化分析,以平等加权 Claude Code 和 Claude.ai 交互。
    
2.  Claude.ai 的 HTML 数字可能略有膨胀,因为 [Artifacts](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them) 利用了 HTML。虽然我们过滤掉了与编码无关的 Artifacts,但我们不会明确从分析中过滤掉包含编码相关内容的 Artifacts,因为 Artifacts 中发生了大量编码使用。
    
3.  Claude.ai 使用不包括 Claude For Work(Team 和 Enterprise 计划)使用,这意味着 Claude.ai 的企业数字特别可能被低估,因为 Claude.ai 上的大量企业使用发生在 Claude For Work 产品中。
