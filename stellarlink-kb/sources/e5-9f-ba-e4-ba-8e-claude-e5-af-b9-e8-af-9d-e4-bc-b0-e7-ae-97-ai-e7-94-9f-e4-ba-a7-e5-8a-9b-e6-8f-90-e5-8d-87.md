---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87"
title: 基于 Claude 对话估算 AI 生产力提升
description: 借助隐私保护分析方法，我们从 Claude.ai 采样了十万次真实对话，估算 AI 辅助前后任务完成时间。
resource: "https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87"
tags: []
timestamp: "2026-06-20T06:46:09.088Z"
source_path: "https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87"
source_id: 4afe37a95d3ed8e15fc2f4cfe74dd8cec2fdbc59f3f7ee635dc77066df40e2b1
content_hash: 1ce7db30b62d94a5093af910875c9f0f49a65f7001a7b2dae10e342950cc5fea
---

## [概述](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E6%A6%82%E8%BF%B0)

_借助[隐私保护分析方法](https://www.anthropic.com/research/clio)，我们从 Claude.ai 采样了十万次真实对话，估算 AI 辅助前后任务完成时间。Claude 估算显示，这些任务无 AI 时平均需约 90 分钟，而 AI 可缩短约 80% 的时间。外推结果表明，当前一代 AI 模型可在未来十年内使美国劳动生产率年增长 1.8%——约为近年来增速的两倍。但这并非预测，未考虑采用速度及更强 AI 系统的效应。分析存在局限：无法统计对话外的额外时间，包括验证输出质量所需时间。_

_以下是我们研究结果的详细摘要：_

*   **在十万次真实对话中，Claude 估算 AI 可将任务完成时间缩短 80%。** 我们使用 Claude 评估匿名化的 Claude.ai 对话记录，以估算 AI 的生产力影响。根据 Claude 的估算，人们通常使用 AI 处理复杂任务，这些任务平均需要 1.4 小时才能完成。通过将任务与 O\*NET 职业分类和 BLS 工资数据进行匹配，我们估算这些任务原本需要 55 美元的人力成本。
*   **任务的范围、成本和时间节省因职业而异。** 根据 Claude 的估算，人们使用 Claude 处理法律和管理类任务时，这些任务原本需要近两小时；而食品准备类任务仅需 30 分钟。我们发现医疗辅助任务可节省 90% 的时间，而硬件问题的时间节省为 56%。不过，这未考虑用户在 claude.ai 对话_之外_可能花费的时间，因此我们认为这些估算在一定程度上可能高估了当前的生产力效应。
*   \*\*将这些结果外推到整体经济，当前一代 AI 模型可使美国年劳动生产率增长 1.8%，持续十年。这将使美国自 2019 年以来的年增长率翻倍，\*\*并使我们的估算处于[近期估算](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/11/miracle-or-myth-assessing-the-macroeconomic-productivity-gains-from-artificial-intelligence_fde2a597/b524a072-en.pdf)的上限区间。以 Claude 对任务级效率提升的估算为基础，我们使用标准方法计算出未来十年美国劳动生产率年增长 1.8% 的隐含值。然而，该估算未考虑 AI 模型的未来改进（或对当前技术更复杂的应用），这些因素可能显著放大 AI 的经济影响。
*   **当 AI 加速某些任务时，其他任务可能成为瓶颈**：我们发现某些任务的加速效果显著，而其他任务（即使在同一职业群体内）的加速效果要小得多。在 AI 贡献较小的领域，这些任务可能成为瓶颈，潜在地制约增长。

**这为我们提供了一个理解 AI 经济影响随时间演变的新视角，我们将把它作为[经济指数](https://www.anthropic.com/economic-index)的一部分持续追踪：** 基于真实 Claude 对话计算这些估算值，为我们理解 AI 生产力提供了新视角。这补充了其他方法，如针对特定领域的实验室研究，或提供更粗粒度洞察的政府统计数据。我们将追踪这些估算值随时间的变化，随着能力和采用率的持续进步，获得这些问题的动态图景。

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F8b0d20a184e4395aa3966cffd01ad212929fa924-9168x5160.png&w=3840&q=75)

> 我们方法及部分主要结果的概述。关于我们如何验证 Claude 的估算、我们所做的假设以及分析的局限性，请参见下文。

## [引言](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E5%BC%95%E8%A8%80)

作为 [Anthropic 经济指数](https://www.anthropic.com/economic-index)的一部分，我们记录了人们在不同任务、行业和地区如何使用 Claude。我们捕捉了使用的**广度**——人们如何将 Claude 用于法律、科学和编程任务——但未涉及其**深度**。人们使用 Claude 处理的任务有多重要？Claude 能为他们节省多少时间？

当前版本的经济指数无法捕捉这种**任务内异质性**——例如，它无法区分耗时五分钟的报告撰写任务和耗时五天的任务，或耗时一个下午的财务建模任务和耗时数周的任务。这使得评估 AI 的经济影响变得困难：一名软件开发者一天可能使用 Claude 编写十个 pull request，但如果其中九个是次要的文档更新，只有一个是关键的基础设施变更，那么仅仅计算使用 Claude 执行的任务数量并没有抓住重点。

不仅如此，随着模型能力的提升，我们想要了解它们是否在做更高价值的工作。要理解 AI 如何重塑工作和生产力，我们不仅需要知道 Claude 处理_哪些_任务，还需要知道这些任务和时间节省_有多重要_。

多个研究团队已开始进行随机对照试验，以测量特定领域的生产力提升，包括[软件](https://arxiv.org/abs/2302.06590)[工程](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566)[任务](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)、[写作](https://www.science.org/doi/10.1126/science.adh2586)和[客户服务](https://www.nber.org/papers/w31161)。METR 关于[测量 AI 完成长期任务能力](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)的工作表明，AI 系统可以独立处理持续时间较长的多步骤挑战。但这些评估只考虑了一组狭窄的问题，而非广泛的现实世界使用。要评估 AI 对经济的_整体_影响，我们需要一种方法来分析数百甚至数千种现实世界的 AI 应用。

本报告朝着这一目标迈出了第一步。它使用 Claude 来估算人类完成 Claude 所处理任务需要多长时间，将其与 Claude 和人类共同完成所用的时间进行比较，从而计算出 AI 节省了多少时间。虽然 AI 模型缺乏关于用户专业知识、工作流程和约束条件的背景信息，但我们发现，相对于人类估算的完成时间和实际追踪的结果，模型估算的时间在软件工程任务数据集上显示出令人满意的准确性。

在下文中，我们将介绍估算任务级时间节省的方法，根据真实数据验证我们的方法，然后使用这些估算来评估哪些任务和职业从 AI 中获得最大的生产力提升。接着我们将探讨任务级估算对整体生产力的启示，随着 AI 开始在整个经济中被采用。

## [估算任务时长和时间节省](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E4%BC%B0%E7%AE%97%E4%BB%BB%E5%8A%A1%E6%97%B6%E9%95%BF%E5%92%8C%E6%97%B6%E9%97%B4%E8%8A%82%E7%9C%81)

使用我们的[隐私保护分析系统](https://www.anthropic.com/research/clio)，我们分析了来自 Claude.ai（Free、Pro 和 Max 层级）的 100,000 次对话记录，以测量 Claude 处理任务的时长和时间节省。我们为每项任务生成了两个核心估算值：

*   **无 AI 时间估算**：人类专业人员在无 AI 辅助情况下完成任务所需的小时数
*   **有 AI 时间估算**：在 AI 辅助下完成任务所用的时间

我们使用 Claude 为每次对话生成这些估算。遵循我们的[经济指数方法论](https://www.anthropic.com/news/the-anthropic-economic-index)，我们将这些单独的聊天对话聚合到 [O\*NET](https://www.onetcenter.org/database.html) 分类体系的任务中，方法是取每项任务时间估算的中位数。这使我们能够探索这些时间估算在经济中不同任务和职业之间的差异。分类 Prompt 详见附录。

分析真实世界的对话记录使我们能够考虑_任务内变异_。例如，即使_设计制造设备_任务的总体份额保持不变，对话级信息也能让我们看到人们是否随着时间推移使用 AI 处理更复杂、更长期的项目（或获得更大的时间节省）。我们的[经济指数](https://www.anthropic.com/economic-index)将追踪这些估算随时间的演变，并分享研究人员可用于做出自己预测和结论的聚合数据集。

### [验证](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E9%AA%8C%E8%AF%81)

估算任务持续时间[对人类来说是出了名的困难](https://web.mit.edu/curhan/www/docs/Articles/biases/67_J_Personality_and_Social_Psychology_366,_1994.pdf)。AI 模型的工作更加困难，因为它们缺乏关于任务更广泛背景的关键信息（尽管我们预计随着[记忆](https://www.anthropic.com/news/memory)和[外部集成](https://www.anthropic.com/news/claude-and-slack)等功能变得更加全面，这种背景信息会随时间增加）。为了评估 Claude 的估算是否有参考价值，我们进行了两项验证分析。

**自洽性测试：** 首先，我们评估 Claude 在不同对话样本或不同 Prompt 变体下是否产生稳定的任务时长估算。

我们创建了多个 Prompt 变体——例如，询问”具有相应技能的员工”与”熟练专业人员”——以评估估算对 Prompt 措辞方式的敏感度。我们使用每个变体分析了 1,800 次对话（用户同意与我们分享这些对话），并计算了不同 Prompt 变体之间的相关性。结果显示出很强的自一致性，对数尺度相关系数为 _r_\=0.89–0.93。

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F8d684d005bf2866973e70cda22c5bf93b81b4acf-9168x5164.png&w=3840&q=75)

> **Claude 估算的人类完成时间在不同 Prompt 变体间显示出高度相关性。** Prompt 1 要求 Claude 估算”具有相应技能的员工”完成任务所需的时间，Prompt 2 询问”在相关领域有能力的""人类工作者”。两个 Prompt 显示出 0.89 的对数尺度相关性，表明高度一致。分析基于用户同意与我们分享用于研究目的的 Claude.ai 对话记录。

**外部基准测试：** 如果模型的预测与现实不能很好地对应，自一致性就没有太大意义。为了验证这一点，我们在一个包含数千个真实[软件开发任务](https://zenodo.org/records/7022735)的数据集上测试了 Claude 的时间估算能力，这些任务来自开源仓库的 JIRA 工单，包含开发者估算和实际追踪的完成时间。

这对 Claude 来说是一项非常具有挑战性的任务，因为 Claude 只能获得 JIRA 工单的标题和描述，而人类开发者对代码库和工单有完整的背景了解，并且知道类似任务需要多长时间完成。在该基准测试的 1000 个任务子集上：

*   人类开发者自身与实际时间的 Spearman 相关系数为 ρ=0.50，对数值的 Pearson 相关系数为 r\_log=0.67，表明中等强度的相关性（两个值都是越高越好）。
*   Claude Sonnet 4.5 达到了 ρ=0.44 和 r\_log=0.46
*   Claude Sonnet 4.5 在 Prompt 中提供十个任务及其真实时长的示例后，ρ 下降到 0.39，但 r\_log 提升到 0.48

该分析表明，Claude 的估算提供的_方向性_信息仅略逊于软件开发者自己的估算。然而，我们观察到 Claude 的估算比人类更加”压缩”——对较短任务预测的时间相对较长，反之亦然——且总体上更容易高估。这表明任务间的实际时长差异可能比我们报告的更大，实际任务时长可能略短。总体而言，这些发现表明模型预测与现实世界结果有显著相关性，至少在这个领域如此，这使得它们可用于任务间比较或追踪随时间的变化。我们还观察到 Claude Sonnet 4.5 比 Claude Sonnet 4 具有更高的相关性，这表明这些估算可能会随着模型能力的提升而继续改进。

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F86ba428ae4f9ffb0f19fcfdfb0b1965196526c0b-2762x1020.png&w=3840&q=75)

> 软件工程任务实际耗时与开发者及 Claude 估算的相关性。左图：开发者初始时间估算与最终实际追踪结果的相关性。开发者熟悉完整代码库，了解请求背后的完整背景以及类似任务需要多长时间。中图：Claude Sonnet 4.5 的估算相关性，仅给出 JIRA 工单的标题和描述。右图：Claude Sonnet 4.5 的估算相关性，在 Prompt 中提供 10 个示例进行校准。总体而言，Claude 的估算与开发者具有相似的方向性相关性：Spearman’s _ρ_\=0.44，而开发者为 _ρ_\=0.50，但 Claude 显著高估短任务、低估长任务。坐标轴为对数（以 10 为底）刻度。误差条为每个分箱的 95% 置信区间。

## [结果](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E7%BB%93%E6%9E%9C)

我们首先使用上述方法估算任务级节省，然后将其汇总为全经济层面的估算。

### [任务级节省](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E4%BB%BB%E5%8A%A1%E7%BA%A7%E8%8A%82%E7%9C%81)

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F5a800dc6e4ea5b56647bfbcc0a01f99b93f0ca80-9168x7336.png&w=3840&q=75)

> Claude 估算的任务时间、职业平均小时工资、隐含任务成本和九种不同任务的时间节省。**任务时间**由 Claude 预测专业人员在无 AI 辅助情况下执行任务所需时间得出。**小时工资**来源于职业就业和工资统计（OEWS）2024 年 5 月数据。**任务成本**通过任务时间乘以小时工资计算。**时间节省**通过估算人类完成任务所用时间并计算 _1 - 有AI时间 / 无AI时间_ 得出。

#### [示例任务展示了不同程度的时间节省](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E7%A4%BA%E4%BE%8B%E4%BB%BB%E5%8A%A1%E5%B1%95%E7%A4%BA%E4%BA%86%E4%B8%8D%E5%90%8C%E7%A8%8B%E5%BA%A6%E7%9A%84%E6%97%B6%E9%97%B4%E8%8A%82%E7%9C%81)

观察职业内的具体任务，可以看到 AI 可能在哪些地方以及如何带来时间节省的具体例子。在最极端的情况下，我们看到用户完成课程开发任务，Claude 认为这些任务原本需要 4.5 小时，但实际仅用了 11 分钟。基于教师的平均小时工资，此类任务的隐含劳动成本为 115 美元。

人们还使用 AI 节省了撰写发票、备忘录和其他文档所需时间的 87%（至少对于要求 Claude 处理的文档类型而言）。最后，AI 为金融分析师解读财务数据等任务节省了 80% 的时间，这些任务原本需要 31 美元的工资成本。

#### [任务时长因职业差异显著](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E4%BB%BB%E5%8A%A1%E6%97%B6%E9%95%BF%E5%9B%A0%E8%81%8C%E4%B8%9A%E5%B7%AE%E5%BC%82%E6%98%BE%E8%91%97)

人类时间估算显示，Claude 处理的任务时长因职业不同而差异很大。在下图中，我们展示了 Claude 被使用的任务子集在各职业类别中的平均值1。使用 Claude 的平均管理任务（例如选择投资）估计需要人类 2.0 小时完成，其次是法律（1.8 小时）、教育（1.7 小时）和艺术/媒体任务（1.6 小时）。在另一端，食品准备任务（例如规划或定价菜单项目）、安装/维护和交通运输任务平均只需 0.3-0.5 小时，这表明任务范围更受限，或等待时间更少。鉴于 Claude 的时间估算倾向于低估长任务、高估短任务，实际上这些差异可能更大。

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2Fc5fec11b331a841e3fe56df8d5cca67767aa9a08-9168x5160.png&w=3840&q=75)

> 基于 Claude 时间估算得出的 SOC 主要职业群组各项数据。人类时间估算在不同职业间差异显著——人们使用 Claude 处理管理和法律任务，估计在无辅助情况下约需 2 小时，而医疗支持和食品准备任务平均约半小时。职业类别的平均小时工资来自 OEWS 2024 数据。平均任务成本通过将每个职业的小时工资乘以其中位任务时间计算，并按样本中每项任务的出现频率加权平均。时间节省通过 _1 - 有AI时间 / 无AI时间_ 计算。

成本估算放大了 AI 影响的这种差异：时间估算最长的任务往往也是劳动成本最高的任务。我们通过将每项任务的中位时间乘以相关职业在 OEWS 2024 年 5 月数据中的平均工资来计算这些成本估算。专业人员完成平均管理任务的成本为 133 美元，法律任务为 119 美元，食品准备和服务相关任务为 8 美元。商业和金融任务平均 69 美元，计算机和数学任务平均 82 美元。

在我们观察到的所有任务中，我们估计 Claude 处理的工作在每次对话中相当于中位数 54 美元的专业劳动成本（如果雇用专家来执行该工作）。当然，对于许多任务，当前模型的实际表现可能不如人类专家，尽管最近的研究表明这种差距正在[缩小](https://openai.com/index/gdpval/)，涉及广泛的不同应用。

在主要职业群体中，我们观察到样本中任务/职业的平均小时工资与 Claude 被要求处理的任务的人工时间等效时长之间存在正相关。例如，管理和法律职业类别在分类中的平均小时工资排名最高——这与 Claude 在复杂知识工作方面的优势相一致。

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2Fd699145fc487c5c045a2ffd389fca5b833cf04c4-9168x5160.png&w=3840&q=75)

> 职业类别平均小时工资与样本中 Claude 估算的平均任务时长之间的相关性。较高工资的职业类别（如管理和法律）在我们的样本中有更复杂的使用场景（_r_\=0.8）。

#### [时间节省在不同职业间高度不均](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E6%97%B6%E9%97%B4%E8%8A%82%E7%9C%81%E5%9C%A8%E4%B8%8D%E5%90%8C%E8%81%8C%E4%B8%9A%E9%97%B4%E9%AB%98%E5%BA%A6%E4%B8%8D%E5%9D%87)

我们的人类时间和成本估算捕捉了人们使用 AI 处理任务的_规模_。但时间_节省_——Claude 对使用 AI 后工作完成速度提升程度的估算——反映了使用 AI 处理这些任务可能带来的生产力提升。

中位对话体验了约 84% 的时间节省，但我们在不同任务和类别之间看到了相当大的差异。例如，检查诊断图像的任务仅显示 20% 的时间节省，这可能是因为专家本来就可以在无 AI 辅助下快速完成此任务。相比之下，从报告中汇编信息的任务显示出约 95% 的时间节省，这可能是因为 AI 系统可以比人类更快地阅读、提取和引用信息。总体而言，按任务划分的时间节省分布集中在 50-95% 区间，峰值在 80-90% 之间。

这些显著的时间节省与 Claude 阅读和写作速度远快于人类的能力相一致。然而，我们的方法未考虑人们将 Claude 输出完善到最终状态所需的额外工作，也未考虑他们是否在多个会话中继续迭代工作成果——这两者都会导致更小的时间节省。过去的随机对照试验通常发现更小的时间节省，包括 [56%](https://arxiv.org/abs/2302.06590)、[40%](https://www.science.org/doi/10.1126/science.adh2586)、[26%](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566)、[14%](https://www.nber.org/papers/w31161)，甚至在不同应用中出现[负值](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)时间节省——这可能是由于这些效应，或因为这些研究考察的是早期版本的模型。

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F4d61a53bff2e88b74afd14dfd3ccfbf4d77a3c3a-2292x1291.png&w=3840&q=75)

> 样本中 O\*NET 任务时间节省的密度图。我们看到 Claude 估算的时间节省在样本中的任务间分布不均，大多数落在 50% 到 95% 之间。总体中位节省为 81%。时间节省通过 _1 - 有AI时间 / 无AI时间_ 计算。我们的估算未考虑在聊天窗口之外完善 Claude 输出所花费的时间。

### [从任务级效率提升到全经济生产力效应](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E4%BB%8E%E4%BB%BB%E5%8A%A1%E7%BA%A7%E6%95%88%E7%8E%87%E6%8F%90%E5%8D%87%E5%88%B0%E5%85%A8%E7%BB%8F%E6%B5%8E%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%95%88%E5%BA%94)

上述估算捕捉了任务级别的 AI 驱动生产力提升。为了理解宏观层面的影响，本节建模了这些提升如何在整个经济中聚合，假设它们按照 Claude 的估算实现。

#### [方法论](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E6%96%B9%E6%B3%95%E8%AE%BA)

为了估算全经济生产力效应，我们使用 Hulten 定理，这是一种将任务级效率提升聚合到更广泛美国经济的标准方法2。与 [Acemoglu (2024)](https://economics.mit.edu/sites/default/files/2024-04/The%20Simple%20Macroeconomics%20of%20AI.pdf) 的”基准”方法一样，我们将劳动生产率的隐含增长建模为任务级生产力提升的加权平均——这一建模选择隐含地假设资本投资将因与 AI 采用相关的全要素生产率（TFP）增加而增加。在这个框架中，TFP 的隐含增长是劳动生产率增长乘以劳动收入份额3。

**任务构成**：对于每个职业，我们从 O\*NET 获取工作任务列表。然后我们使用 Claude 估算工人在每项任务上花费的时间比例。例如，Claude 估计程序员将 23% 的时间用于编写和维护代码，15% 用于分析和重写程序，较小比例用于测试、文档和会议。

**任务级生产力改进**：在上一节中，我们提供了可用于计算每项任务在 AI 辅助下完成速度提升多少的估算。我们取无 AI 时间和有 AI 时间的对数差来生成生产力改进值，并保守地为未在样本中观察到的任务分配零改进值。

**全经济估算**：我们使用两个因素按经济重要性加权每项任务的隐含生产力提升：(i) Claude 估算该职业在该任务上花费的时间比例（如上），以及 (ii) 该职业在美国总工资账单中的份额（该职业类别的雇员人数乘以平均工资，再除以所有职业的总工资账单）。对于总工资账单，我们使用 2024 年 5 月的 OEWS 数据。这种方法隐含地假设 Claude 产生的时间估算代表了每项任务所有实例的可靠平均值，并且 Claude 或类似的 AI 系统将在整个美国经济中被采用。

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F7ecf9cf6974d57657fffe7952e6de57077c3a768-9168x5164.png&w=3840&q=75)

> **美国全经济劳动生产力影响：前十职业。** 总体而言，Claude 的估算意味着美国劳动生产率年化增长 1.8%（虚线），假设当前 AI 系统被普遍采用于我们观察到的所有任务，主要由软件、管理、营销和客户服务任务驱动。这对应于 TFP 年化增长 1.08%。平均 _ln(时间估算比率)_ 代表每个职业所有任务的时间加权生产力提升，其中_时间估算比率 = 有AI时间 / 无AI时间_。劳动统计数据来自 OEWS 2024 数据。

### [发现](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E5%8F%91%E7%8E%B0)

假设 AI 需要 10 年才能在整个美国经济中普及采用——并使用当前模型——我们计算出 Claude 的估算意味着美国劳动生产率年增长 1.8%。这将使当前的长期增长率几乎翻倍，自 1947 年以来平均为每年 2.1%，自 2019 年以来为 1.8%。假设劳动在全要素生产率中的份额为 0.64，这意味着全要素生产率每年总体增长 1.1%。鉴于自 2000 年代初以来 TFP 增长往往低于 1%，这些估算表明，即使广泛部署当前的 AI 系统也可能导致增长翻倍：达到 1990 年代末以及 1960 年代和 1970 年代的水平5。

这种由任务级效率提升隐含的总体劳动生产率增长估算在最近对 AI 潜在生产力影响估算的范围内，尽管它处于上限位置（Filippucci、Gal 和 Schief，2024）。

重要的是，这项工作假设 AI 能力（以及人类使用 AI 的有效性）在未来 10 年内与我们采样时保持不变。然而，这似乎不太可能成立：我们认为 AI 将在未来几年[继续快速改进](https://www.anthropic.com/news/core-views-on-ai-safety)。

因此，这一估算应被视为一项基于_当前使用模式_探索可能发生什么的工作，而非对实际最可能发生的生产力影响的预测。正如我们在其他工作中所写，我们对 AI 可能造成重大劳动力市场动荡的可能性保持高度警惕，这可能与 AI 带来的更大生产力提升相关联。随着模型的进步，这可能代表 AI 生产力效应的近似下限，尽管我们的估算未考虑采用的不均匀性，这可能会在短期内降低实际生产力提升。

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F2e7bf159d26091d280fe0173753085a318ed75d0-9168x5160.png&w=3840&q=75)

> 非农业务部门的劳动生产率增长。图表显示劳动生产率同比百分比变化的五年移动平均。我们看到从 1960 年代近 3% 到最近几年约 1.5% 的总体下降。

反映出[某些任务和职业在我们的数据中出现频率远高于其他](https://assets.anthropic.com/m/218c82b858610fac/original/Economic-Index.pdf)的事实，我们在职业对劳动生产率的贡献方面也观察到类似现象。软件开发者对可归因于 AI 的总劳动生产率提升贡献最大（19%）。总经理和运营经理（约 6%）、市场研究分析师和营销专家（5%）、客户服务代表（4%）和中学教师（3%）位列前五。

相比之下，餐饮、医疗服务、建筑和零售对整体生产力效应的贡献要小得多。这主要是因为它们的任务很少出现在我们的数据中——主要是因为这些职业在我们的样本中关联的任务较少。

### [AI 可能如何改变工人的时间分配？](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#ai-%E5%8F%AF%E8%83%BD%E5%A6%82%E4%BD%95%E6%94%B9%E5%8F%98%E5%B7%A5%E4%BA%BA%E7%9A%84%E6%97%B6%E9%97%B4%E5%88%86%E9%85%8D)

如果工人能够使用 AI 加速其职业任务的一部分，那么 AI 提供较少加速的任务可能会占据这些职业工作中更大、因而更重要的份额。例如，AI 可能帮助房屋检查员准备报告，但如果检查员仍然需要花同样的时间亲自前往房产进行实地检查，这可能使检查工作在整体工作中占更大比例。

下图为几种职业说明了这一点。对于软件开发者，AI 加速了软件开发、测试、文档和数据操作的过程。但我们目前没有看到 AI 在协调系统安装或监督其他技术人员或工程师工作方面的有意义使用。对于教师，我们看到 AI 协助课程和活动规划，但不参与赞助课外俱乐部或在课堂上执行规则。

从增长角度来看，这些观察与 [Aghion、Jones 和 Jones](https://www.nber.org/papers/w23928) 最近的观点非常吻合：“增长可能不是受我们擅长的事情的制约，而是受那些必不可少但又难以改进的事情的制约。“

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F4bf1b7050affa87212a5182b3ccbc615e78bf4d0-9168x8096.png&w=3840&q=75)

> 四种不同职业，以及显示大幅时间节省潜力的”加速”任务，和未出现在样本中的潜在”瓶颈”任务。例如，软件工程师在开发和调试软件方面看到大幅时间节省估算，但在监督程序员方面没有。每周时间比例由 Claude 估算（见上一节）。

## [局限性](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E5%B1%80%E9%99%90%E6%80%A7)

我们的方法有几个局限性，我们认为值得在这一主题上进行进一步研究：

*   **Claude 的预测并不完美，我们缺乏对 Claude 时间估算的真实世界验证**：AI 系统是不完美的预测器，无法看到用户完成与模型交互后发生的活动。虽然我们预计这些估算会随着模型能力的提升而改进，但使用模型估算引入了显著的噪声来源。虽然我们的估算表明模型正在接近人类在估算任务时间方面的表现，而且人类本身也远非完美，但我们缺乏验证 Claude 提供的估算的真实世界数据。
*   **任务分类体系局限性**：真实工作比 O_NET 任务列表更复杂，我们为每项任务估算的时间分配只是近似值。工作的许多重要方面——隐性知识、人际关系、不确定性下的判断——并未出现在这些正式的任务描述中，任务_之间\*的联系对生产力的影响可能与单独任务的时间节省同样重要甚至更重要。虽然我们显示了单个任务的大幅预测时间节省，但[最近一项随机对照试验](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)研究端到端软件功能时并未看到 AI 带来的时间节省。
*   **结构性假设**：在上述计算中，我们比较了专业人员在无 AI 情况下完成给定任务所需的时间与使用 AI 所需的时间。但这可能_低估_生产力提升——因为雇用员工和沟通背景需要我们未考虑的额外资源，也可能高估，如果 AI 工作质量不如人类的话。
*   **组织重构**：从历史上看，单个企业最大的生产力提升来自于[重构业务运营](https://www.jstor.org/stable/2006600)以采用新技术。我们的模型可以帮助预测此类重构的_效果_，但无法预测公司可能如何决定重构，或这一过程可能多快发生。
*   **创新的作用**：技术创新是经济增长的[引擎](https://www.jstor.org/stable/1926047)。我们的模型未能捕捉 AI 系统如何加速甚至自动化科学过程，也未能捕捉这对生产力、增长和工作结构的影响。
*   **数据有限**：我们的数据集仅来自 claude 对话。这个样本不能代表 AI 使用的全部范围，而且可能存在一些选择效应，即人们使用 Claude 的任务实例是他们认为 Claude 最有用的那些。此外，由于样本量有限，我们可能遗漏了一些不太常见的 AI 任务。

我们在此开发的测量基础设施使得能够大规模持续追踪 AI 对时间节省的影响。随着模型改进和更好的方法解决这些局限性，我们可以重新估算这些时间节省，并识别这些能力改进如何转化为更广泛的经济影响。我们预计将在未来数月和数年内追踪这些变化。

## [结论](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E7%BB%93%E8%AE%BA)

Claude 处理的任务复杂程度各异——从几分钟即可完成的简单食品准备问题，到需要数小时的复杂法律和管理任务。但这些工作的总体效果是什么？

基于 Claude 对每项任务的时间估算（并假设未来 10 年内普及采用），我们发现使用当前模型意味着美国劳动生产率每年可能增长 1.8%——这将使近期劳动生产率增长率翻倍。根据当前 AI 使用情况，这些收益将集中在技术、教育和专业服务领域，而零售、餐饮和交通运输部门受到的影响最小。随着模型能力、产品和采用率的持续进步，我们将把这些变化作为经济指数的一部分持续追踪。

这些生产力提升来自于更快地完成现有任务。然而，从历史上看，变革性的生产力改进——从电气化、计算到互联网——不是来自加速旧任务，而是来自从根本上重组生产。在这样的未来，AI 不仅使功能实现更快，公司还会重组会议和代码审查，以更快地验证和交付这些功能，无论是使用 AI 还是通过其他方式。

我们的框架可用于帮助估算此类重组的效果，但无法预测将发生哪些变化，或变化的速度。未来工作的一个重要方向是理解这个问题——更好地理解企业何时以及如何围绕新兴 AI 能力重组自身。答案将决定 AI 何时从提供显著但有限的生产力提升，跃升到代表历史上定义技术革命的那种结构性转型。

## [附录](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E9%99%84%E5%BD%95)

### [Claude 估算与其他估算的比较](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#claude-%E4%BC%B0%E7%AE%97%E4%B8%8E%E5%85%B6%E4%BB%96%E4%BC%B0%E7%AE%97%E7%9A%84%E6%AF%94%E8%BE%83)

![](https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F71184a93f50a2ec740edeb79f5123edb495c253e-9168x5164.png&w=3840&q=75)

> AI 在 10 年期间对年劳动生产率增长的预测影响。图表复制自 Filippucci、Gal 和 Schief，2024。虚线为 1.8%，来自 Claude 的估算。

### [时间估算所用 Prompt](https://stellarlink.co/articles/%E5%9F%BA%E4%BA%8E-claude-%E5%AF%B9%E8%AF%9D%E4%BC%B0%E7%AE%97-ai-%E7%94%9F%E4%BA%A7%E5%8A%9B%E6%8F%90%E5%8D%87#%E6%97%B6%E9%97%B4%E4%BC%B0%E7%AE%97%E6%89%80%E7%94%A8-prompt)

**人类时间估算 Prompt**

```
Human: Consider the following conversation:
<conversation>
{{TRANSCRIPT}}
</conversation>
Estimate how many hours a competent professional would need to complete the tasks done by the Assistant. Assume they have:
- The necessary domain knowledge and skills
- All relevant context and background information
- Access to required tools and resources

Before providing your final answer, use <thinking> tags to break down your reasoning process:
<thinking>
2-5 sentences of reasoning estimating how many hours would be needed to complete the tasks.
</thinking>

Provide your output in the following format:
<answer>A number representing hours (can use decimals like 0.5 for shorter tasks)</answer>
```

**交互时间估算 Prompt**

```
Human: Consider the following conversation:
<conversation>
{{TRANSCRIPT}}
</conversation>
Estimate how many minutes the user spent completing the tasks in the prompt with the model. Consider:
- Number and complexity of human messages
- Time reading Claude's responses
- Time thinking and formulating questions
- Time reviewing outputs and iterating
- Realistic typing/reading speeds
- Time implementing suggestions or running code outside of the conversation (only if directly relevant to the tasks)

Before providing your final answer, use <thinking> tags to break down your reasoning process:
<thinking>
2-5 sentences of reasoning about how many minutes the user spent.
</thinking>

Provide your output in the following format:
<answer>A number representing minutes</answer>
```

**软件开发时间估算 Prompt**

```
Human: You are estimating software development tasks for open-source projects. Provide ONLY a number in hours (e.g., 0.3, 1.6, 15). Do not explain.

Task: {task}
Description: {description}:
Estimate (hours):
```

**任务时间估算 Prompt**

```
You are estimating how much time workers in the occupation "{occupation_title}" spend on each of their job tasks. Below is the complete list of tasks for this occupation. For each task, estimate how many hours per week a typical worker spends on it.

Important: Don't worry about making the hours sum to exactly 40 or any specific total - we'll normalize the results afterward. Just give your best estimate for each task independently based on what seems realistic.
```

* * *

_原文链接：[https://www.anthropic.com/research/estimating-productivity-gains](https://www.anthropic.com/research/estimating-productivity-gains)_

[阅读 PDF](https://www-cdn.anthropic.com/e5645986a7ce8fbcc48fa6d2fc67753c87642c30.pdf)
