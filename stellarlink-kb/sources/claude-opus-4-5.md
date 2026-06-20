---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/claude-opus-4-5"
title: Claude Opus 4.5
description: Claude Opus 4.5
resource: "https://stellarlink.co/articles/claude-opus-4-5"
tags: []
timestamp: "2026-06-20T06:45:39.060Z"
source_path: "https://stellarlink.co/articles/claude-opus-4-5"
source_id: d9ba64d149fcb1bdf2c5b14964da607ceb99b304b6249a57cf9dd599a31d9188
content_hash: bae15d94b2fa4daf4822806d438fbb2d8b0d1a83ecc141dceefca4e0c98e0e97
---

我们最新的模型 Claude Opus 4.5 今天正式发布。它智能、高效，是目前全球在编码、Agent 和计算机使用方面表现最优秀的模型。它在日常任务上也有显著提升，比如深度研究以及幻灯片和电子表格处理。Opus 4.5 是 AI 系统能力的一次跃进，也是未来工作方式变革的预演。

Claude Opus 4.5 在真实世界软件工程测试中达到了业界领先水平：

![图表展示前沿模型在 SWE-bench Verified 上的表现对比，其中 Opus 4.5 得分最高](https://www-cdn.anthropic.com/images/4zrzovbb/website/7022a87aeb6eab1458d68412bc927306224ea9eb-3840x2160.png)

Opus 4.5 今天起在我们的应用、API 以及三大主流云平台上线。如果您是开发者，只需通过 [Claude API](https://platform.claude.com/docs/en/about-claude/models/overview) 使用 `claude-opus-4-5-20251101` 即可。定价现为每百万 Token $5/$25——让更多用户、团队和企业都能享用 Opus 级别的能力。

与 Opus 一同发布的还有 [Claude 开发者平台](https://www.claude.com/platform/api)、[Claude Code](https://www.claude.com/product/claude-code) 以及我们的[消费端应用](https://www.claude.com/download)的更新。新增了针对长时运行 Agent 的工具，以及在 Excel、Chrome 和桌面端使用 Claude 的新方式。在 Claude 应用中，冗长的对话不再碰壁。详情请参阅下方的产品相关章节。

## [初步印象](https://stellarlink.co/articles/claude-opus-4-5#%E5%88%9D%E6%AD%A5%E5%8D%B0%E8%B1%A1)

在发布前的内部测试中，我们的 Anthropic 同事给出了高度一致的反馈。测试人员注意到，Claude Opus 4.5 能够处理模糊情境并权衡利弊，无需过多指导。他们告诉我们，当面对复杂的跨系统 bug 时，Opus 4.5 能自行找到修复方案。他们表示，几周前对 Sonnet 4.5 来说几乎不可能完成的任务，现在触手可及。总体而言，我们的测试人员表示 Opus 4.5 就是”懂你”。

许多获得早期访问权限的客户也有类似体验。以下是他们的一些反馈：

> **Opus 模型一直是”真正的 SOTA”**，但过去因成本过高难以广泛使用。Claude Opus 4.5 现在的定价使其可以成为大多数任务的首选模型。它是明显的赢家，展现了我们迄今见过的最优秀的前沿任务规划和工具调用能力。

> Claude Opus 4.5 能生成高质量代码，在 GitHub Copilot 中驱动高强度 Agentic 工作流表现出色。早期测试显示，它**在超越内部编码基准的同时将 Token 用量减少了一半**，特别适合代码迁移和代码重构等任务。

> Claude Opus 4.5 在我们的内部基准测试中超越了 Sonnet 4.5 和竞争对手，**用更少的 Token 解决相同问题**。在规模化应用中，这种效率会持续累积。

> **Claude Opus 4.5 在 Lovable 的聊天模式中提供前沿推理能力**，用户可以在此规划和迭代项目。其推理深度改变了规划方式——而优秀的规划让代码生成更加出色。

> **Claude Opus 4.5 擅长长周期自主任务**，尤其是那些需要持续推理和多步执行的任务。在我们的评估中，它处理复杂工作流时死胡同更少。在 Terminal Bench 上相比 Sonnet 4.5 提升了 15%，在使用 Warp 的 Planning Mode 时这种提升尤为明显。

> **Claude Opus 4.5 在我们的基准测试中针对复杂企业任务取得了业界领先成绩**，在结合信息检索、工具使用和深度分析的多步推理任务上超越了之前的模型。

> **Claude Opus 4.5 在最关键的地方带来了可衡量的提升**：在我们最难的评估中取得更好结果，并在 30 分钟自主编码会话中保持稳定表现。

> **Claude Opus 4.5 代表了自我改进 AI Agent 的突破**。在办公自动化场景中，我们的 Agent 能够自主改进自身能力——仅用 4 次迭代就达到峰值性能，而其他模型迭代 10 次也无法达到同等水平。

> **Claude Opus 4.5 是 Cursor 中对之前 Claude 模型的显著改进**，在定价和困难编码任务上的智能表现都有提升。

> **Claude Opus 4.5 是 Anthropic 推进通用智能前沿的又一例证**。它在困难编码任务中表现出色，展示了长期目标导向行为。

> Claude Opus 4.5 完成了一次令人印象深刻的重构，跨越两个代码库和三个协调的 Agent。它非常全面，帮助制定了稳健的计划，处理细节并修复测试。**相比 Sonnet 4.5 是明确的进步**。

> **Claude Opus 4.5 比我们测试过的任何模型都更高效地处理长周期编码任务**。它在保留测试上取得更高通过率，同时 Token 用量最多减少 65%，让开发者在不牺牲质量的情况下真正掌控成本。

> **我们发现 Opus 4.5 擅长理解用户真正想要什么，第一次尝试就能生成可分享的内容**。结合其速度、Token 效率和出人意料的低成本，这是我们首次在 Notion Agent 中提供 Opus。

> **Claude Opus 4.5 擅长长上下文叙事**，能够生成 10-15 页的章节，组织结构和一致性都很强。它解锁了我们之前无法可靠实现的用例。

> **Claude Opus 4.5 为 Excel 自动化和财务建模树立了新标准**。我们内部评估的准确率提升了 20%，效率提升了 15%，曾经看似遥不可及的复杂任务变得可以实现。

> **Claude Opus 4.5 是唯一能完美处理我们最难的 3D 可视化任务的模型**。精致的设计、优雅的 UX，以及出色的规划与编排——同时 Token 用量更高效。之前的模型需要 2 小时完成的任务，现在只需三十分钟。

> **Claude Opus 4.5 在代码审查中发现更多问题而不牺牲精度**。对于大规模生产代码审查，这种可靠性至关重要。

> 基于我们的编码 Agent Junie 的测试，**Claude Opus 4.5 在所有基准测试上都超越了 Sonnet 4.5**。它用更少的步骤解决任务，因此 Token 用量也更少。这表明新模型更精准、更有效地遵循指令——这是我们非常看好的发展方向。

> effort 参数设计得很巧妙。**Claude Opus 4.5 给人感觉很灵动而非过度思考**，在较低 effort 下也能提供我们需要的同等质量，同时效率大幅提升。这种控制正是我们 SQL 工作流所需要的。

> **我们观察到 Claude Opus 4.5 在工具调用错误和构建/lint 错误上减少了 50% 到 75%**。它始终能用更少的迭代完成复杂任务，执行更加可靠。

> Claude Opus 4.5 很流畅，没有我们在其他前沿模型上看到的那些粗糙边缘。**速度提升非常显著。**

## [评估 Claude Opus 4.5](https://stellarlink.co/articles/claude-opus-4-5#%E8%AF%84%E4%BC%B0-claude-opus-45)

我们给潜在的性能工程师候选人设置了一项出了名难的带回家考试。我们也用这个考试作为内部基准来测试新模型。在我们规定的 2 小时时限内，Claude Opus 4.5 的得分超过了有史以来任何人类候选人¹。

这项带回家考试旨在评估在时间压力下的技术能力和判断力。它不测试候选人可能具备的其他关键技能，如协作、沟通或多年经验积累的直觉。但这一结果——AI 模型在重要技术技能上超越优秀候选人——引发了关于 AI 将如何改变工程职业的问题。我们的[社会影响](https://www.anthropic.com/research/team/societal-impacts)和[经济未来](https://www.anthropic.com/economic-futures)研究旨在理解这类变化在各领域的影响。我们计划很快分享更多结果。

软件工程并非 Claude Opus 4.5 唯一进步的领域。各方面能力全面提升——Opus 4.5 比其前代产品拥有更好的视觉、推理和数学能力，并在多个领域处于业界领先水平²：

![对比表格展示前沿模型在主流基准测试上的表现](https://www-cdn.anthropic.com/images/4zrzovbb/website/52303b11db76017fd0c2f73c7fafa5c752515979-2600x2236.png)

该模型的能力已经超越了我们在测试中使用的一些基准。[τ2-bench](https://github.com/sierra-research/tau2-bench) 是一个常用的 Agentic 能力基准，用于衡量 Agent 在真实世界多轮任务中的表现。在一个场景中，模型需要扮演航空公司服务代表帮助一位焦急的客户。基准预期模型会拒绝修改基础经济舱预订，因为该航空公司不允许更改此类机票。然而，Opus 4.5 找到了一种巧妙（且合规）的解决方案：先升级舱位，_然后_修改航班。

```
让我想想在政策范围内有哪些选项：

1. 修改航班 - 基础经济舱不能修改。这在政策中写得很清楚。
2. 更换舱位 - 等等，让我检查一下这个选项！政策写道：
"在其他情况下，包括基础经济舱在内的所有预订都可以在不更改航班的情况下更换舱位。"

但他想更改的是航班，不只是舱位。不过，如果我们：
- 先更换舱位（这对基础经济舱是允许的），然后
- 再修改航班（对非基础经济舱是允许的）

那么策略可以是：
1. 将他的舱位从基础经济舱升级到经济舱（或商务舱）
2. 然后将航班改到两天后

这会花更多钱，但在政策范围内是合规的路径！
```

从技术上讲，基准将此评为失败，因为 Claude 帮助客户的方式超出了预期。但这种创造性的问题解决能力正是我们从测试人员和客户那里听到的——这正是让 Claude Opus 4.5 感觉像是重大进步的原因。

在其他场景中，找到绕过预定约束的巧妙路径可能被视为_奖励黑客_——即模型以非预期方式”利用”规则或目标。防止此类不对齐是我们安全测试的目标之一，将在下一节讨论。

## [安全性的进步](https://stellarlink.co/articles/claude-opus-4-5#%E5%AE%89%E5%85%A8%E6%80%A7%E7%9A%84%E8%BF%9B%E6%AD%A5)

正如我们在[系统卡](https://www.anthropic.com/claude-opus-4-5-system-card)中所述，Claude Opus 4.5 是我们迄今发布的对齐最稳健的模型，我们认为也是任何开发者发布的对齐最好的前沿模型。它延续了我们向更安全、更可靠模型发展的趋势：

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/d2c7ce13820069fa8a86ab682d3c5393692eb2f8-3840x2160.png)

在我们的评估中，“令人担忧的行为”分数衡量了非常广泛的不对齐行为，包括配合人类滥用和模型主动采取的不良行动³。

我们的客户经常将 Claude 用于关键任务。他们希望确保，在面对黑客和网络犯罪分子的恶意攻击时，Claude 经过训练并具备”街头智慧”来避免麻烦。通过 Opus 4.5，我们在抵御 Prompt 注入攻击方面取得了重大进展——这种攻击通过混入欺骗性指令来诱导模型产生有害行为。Opus 4.5 比业内任何其他前沿模型都更难被 Prompt 注入所欺骗：

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/ec661234f9fc762a1ff7d54be956c62ae43ee7f5-3840x2160.png)

请注意，此基准仅包含强度很高的 Prompt 注入攻击。该基准由 [Gray Swan](https://www.grayswan.ai/) 开发和运行。

您可以在 [Claude Opus 4.5 系统卡](https://www.anthropic.com/claude-opus-4-5-system-card)中找到我们所有能力和安全评估的详细描述。

## [Claude 开发者平台新功能](https://stellarlink.co/articles/claude-opus-4-5#claude-%E5%BC%80%E5%8F%91%E8%80%85%E5%B9%B3%E5%8F%B0%E6%96%B0%E5%8A%9F%E8%83%BD)

随着模型变得更智能，它们可以用更少的步骤解决问题：更少的回溯、更少的冗余探索、更少的冗长推理。Claude Opus 4.5 相比其前代产品，在达到相同或更好结果时使用的 Token 数量大幅减少。

但不同任务需要不同的权衡。有时开发者希望模型持续思考问题；有时他们需要更敏捷的响应。通过 Claude API 上新增的 effort 参数，您可以选择最小化时间和成本，或最大化能力。

设置为中等 effort 级别时，Opus 4.5 在 SWE-bench Verified 上达到了 Sonnet 4.5 的最高分，但输出 Token 减少了 76%。在最高 effort 级别，Opus 4.5 超过 Sonnet 4.5 性能 4.3 个百分点——同时 Token 用量减少 48%。

![](https://www-cdn.anthropic.com/images/4zrzovbb/website/440a9132daa84c32fde4d6fb1780e0ad4854c2cf-3840x2160.png)

通过 [effort 控制](https://platform.claude.com/docs/en/build-with-claude/effort)、[上下文压缩](https://platform.claude.com/docs/en/build-with-claude/context-editing#client-side-compaction-sdk)和[高级工具使用](https://www.anthropic.com/engineering/advanced-tool-use)，Claude Opus 4.5 运行更持久、功能更强大，需要的干预更少。

我们的[上下文管理](https://platform.claude.com/docs/en/build-with-claude/context-editing)和[记忆功能](https://platform.claude.com/docs/en/build-with-claude/context-editing#using-with-the-memory-tool)可以大幅提升 Agentic 任务的表现。Opus 4.5 在管理子 Agent 团队方面也非常高效，能够构建复杂、协调良好的多 Agent 系统。在我们的测试中，所有这些技术的组合使 Opus 4.5 在深度研究评估上的表现提升了近 15 个百分点⁴。

我们正在让开发者平台随时间推移变得更加可组合。我们希望为您提供构建所需的积木块，让您对效率、工具使用和上下文管理拥有完全的控制。

## [产品更新](https://stellarlink.co/articles/claude-opus-4-5#%E4%BA%A7%E5%93%81%E6%9B%B4%E6%96%B0)

像 Claude Code 这样的产品展示了当我们对 Claude 开发者平台所做的各项升级汇聚在一起时的可能性。Claude Code 随 Opus 4.5 获得了两项升级。Plan Mode 现在能构建更精确的计划并更彻底地执行——Claude 会先提出澄清问题，然后在执行前构建一个用户可编辑的 plan.md 文件。

Claude Code 现在也[可在我们的桌面应用中使用](https://claude.ai/download)，让您可以并行运行多个本地和远程会话：也许一个 Agent 修复 bug，另一个研究 GitHub，第三个更新文档。

对于 [Claude 应用](https://www.claude.com/product/overview)用户，冗长的对话不再碰壁——Claude 会根据需要自动总结早期上下文，让您可以继续对话。[Claude for Chrome](https://claude.ai/chrome) 让 Claude 能跨浏览器标签页处理任务，现已向所有 Max 用户开放。我们在十月份宣布了 [Claude for Excel](https://www.claude.com/claude-for-excel)，今天起我们已将 Beta 访问权限扩展到所有 Max、Team 和 Enterprise 用户。这些更新都利用了 Claude Opus 4.5 在使用计算机、电子表格和处理长时运行任务方面的市场领先表现。

对于拥有 Opus 4.5 访问权限的 Claude 和 Claude Code 用户，我们已移除了 Opus 专属限制。对于 Max 和 Team Premium 用户，我们提高了总体使用限额，这意味着您将拥有与之前 Sonnet 大致相同数量的 Opus Token。我们正在更新使用限额以确保您能够在日常工作中使用 Opus 4.5。这些限额仅针对 Opus 4.5。随着未来模型超越它，我们预计会根据需要更新限额。

* * *

#### [脚注](https://stellarlink.co/articles/claude-opus-4-5#%E8%84%9A%E6%B3%A8)

_1：此结果使用了并行测试时计算，这是一种从模型聚合多次”尝试”并从中选择的方法。在没有时间限制的情况下，该模型（在 Claude Code 中使用）达到了有史以来最佳人类候选人的水平。_

_2：我们改进了托管环境以减少基础设施故障。此更改使 Gemini 3 从其开发者报告的值提升到 56.7%，GPT-5.1 提升到 48.6%，使用 Terminus-2 测试框架。_

_3：请注意，这些评估是在 [Petri](https://www.anthropic.com/research/petri-open-source-auditing)（我们的开源自动化评估工具）的升级版本上运行的。它们是在 Claude Opus 4.5 的早期快照上运行的。最终生产模型的评估与其他 Claude 模型相比显示出非常相似的结果模式，详细信息请参见 [Claude Opus 4.5 系统卡](https://www.anthropic.com/claude-opus-4-5-system-card)。_

_4：启用 fetch 的 [BrowseComp-Plus](https://arxiv.org/abs/2508.06600) 版本。具体来说，改进是从不使用技术组合时的 70.48% 提升到使用时的 85.30%。_

**方法论**

所有评估均使用 64K 思考预算、交错式草稿本、200K 上下文窗口、默认 effort（高）、默认采样设置（temperature、top\_p），并对 5 次独立试验取平均值。例外：SWE-bench Verified（无思考预算）和 Terminal Bench（128K 思考预算）。完整详情请参阅 [Claude Opus 4.5 系统卡](https://www.anthropic.com/claude-opus-4-5-system-card)。

* * *

## [相关内容](https://stellarlink.co/articles/claude-opus-4-5#%E7%9B%B8%E5%85%B3%E5%86%85%E5%AE%B9)

### [Claude 现已在 Microsoft Foundry 和 Microsoft 365 Copilot 中提供](https://stellarlink.co/articles/claude-opus-4-5#claude-%E7%8E%B0%E5%B7%B2%E5%9C%A8-microsoft-foundry-%E5%92%8C-microsoft-365-copilot-%E4%B8%AD%E6%8F%90%E4%BE%9B)

[阅读更多](https://www.anthropic.com/news/claude-in-microsoft-foundry)

### [Microsoft、NVIDIA 和 Anthropic 宣布战略合作伙伴关系](https://stellarlink.co/articles/claude-opus-4-5#microsoftnvidia-%E5%92%8C-anthropic-%E5%AE%A3%E5%B8%83%E6%88%98%E7%95%A5%E5%90%88%E4%BD%9C%E4%BC%99%E4%BC%B4%E5%85%B3%E7%B3%BB)

Microsoft、NVIDIA 和 Anthropic 宣布了新的战略合作伙伴关系。Anthropic 正在 Microsoft Azure 上扩展其快速增长的 Claude AI 模型，由 NVIDIA 提供支持，这将拓宽 Claude 的访问范围，并为 Azure 企业客户提供更多模型选择和新功能。Anthropic 已承诺购买 300 亿美元的 Azure 计算能力，并签约额外高达 1 吉瓦的计算能力。

[阅读更多](https://www.anthropic.com/news/microsoft-nvidia-anthropic-announce-strategic-partnerships)

### [Anthropic 与卢旺达政府和 ALX 合作，为非洲数十万学习者带来 AI 教育](https://stellarlink.co/articles/claude-opus-4-5#anthropic-%E4%B8%8E%E5%8D%A2%E6%97%BA%E8%BE%BE%E6%94%BF%E5%BA%9C%E5%92%8C-alx-%E5%90%88%E4%BD%9C%E4%B8%BA%E9%9D%9E%E6%B4%B2%E6%95%B0%E5%8D%81%E4%B8%87%E5%AD%A6%E4%B9%A0%E8%80%85%E5%B8%A6%E6%9D%A5-ai-%E6%95%99%E8%82%B2)

[阅读更多](https://www.anthropic.com/news/rwandan-government-partnership-ai-education)
