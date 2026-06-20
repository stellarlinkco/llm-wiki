---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A"
title: LangChain 2025 Agent 工程现状报告
description: LangChain 2025 Agent 工程现状报告
resource: "https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A"
tags: []
timestamp: "2026-06-20T06:45:23.762Z"
source_path: "https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A"
source_id: a69a0e0bac6c53803bf527b7bfc1d8bbca96c640d6daa68b0758ba5c8efb0c2d
content_hash: 2eb5ed1962dcca6480c3473ddf5abd10191061b00c8fc03c04e75c98be4648ff
---

## [LangChain 2025 Agent 工程现状报告](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#langchain-2025-agent-%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A)

> 原文链接：[State of Agent Engineering](https://www.langchain.com/state-of-agent-engineering)

我们调研了超过 1,300 名专业人士——包括工程师、产品经理、业务负责人和高管——以揭示 AI Agent 的发展现状。让我们深入数据，分析 AI Agent 在当下的使用情况。

## [引言](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E5%BC%95%E8%A8%80)

进入 2026 年，企业不再纠结于”是否要构建 Agent”，而是在思考如何可靠、高效、大规模地部署它们。我们调研了 1,300 多名专业人士，以了解他们如何演进 AI Agent 用例并应对 Agent 工程挑战。

**核心发现：**

*   **生产部署势头强劲**：57% 的受访者已有 Agent 在生产环境运行，大型企业引领采用趋势
*   **质量是生产环境的”杀手”**：32% 的人将其列为首要障碍。与此同时，成本顾虑较去年下降
*   **可观测性已成标配**：近 89% 的受访者已为 Agent 实施可观测性，超过评估（Evaluation）采用率的 52%
*   **多模型使用成为常态**：OpenAI 的 GPT 模型领先，但 Gemini、Claude 和开源模型也获得显著采用。微调（Fine-tuning）尚未被广泛采用

## [洞察](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E6%B4%9E%E5%AF%9F)

### [什么是 Agent 工程？](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E4%BB%80%E4%B9%88%E6%98%AF-agent-%E5%B7%A5%E7%A8%8B)

[Agent 工程](https://blog.langchain.dev/what-is-an-agent/)是将 LLM 打造成可靠系统的迭代过程。由于 Agent 具有非确定性，我们认为工程师需要快速迭代来优化和提升 Agent 质量。

### [大型企业引领采用](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E5%A4%A7%E5%9E%8B%E4%BC%81%E4%B8%9A%E5%BC%95%E9%A2%86%E9%87%87%E7%94%A8)

超过一半的受访者（57.3%）目前已有 Agent 在生产环境运行，另有 30.4% 正在积极开发并有明确的部署计划。

这标志着相比去年调研（51% 报告有生产环境 Agent）的明显增长。企业正在从概念验证阶段迈向生产——对大多数组织而言，问题不再是”是否”部署 Agent，而是”如何”以及”何时”部署。

![Agent 生产部署状态](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/01-agents-in-production.png)

**规模化带来哪些变化？**

在 10,000+ 员工规模的组织中，67% 已有 Agent 在生产环境运行，24% 正在积极开发并计划投产；而在 100 人以下规模的组织中，50% 有生产环境 Agent，36% 正在积极开发。这表明大型组织从试点到稳定系统的转化更快，可能是由于在平台团队、安全性和可靠性基础设施方面投入更大。

![按组织规模划分的 Agent 生产部署状态](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/01a-agents-in-production-by-size.png)

### [主要 Agent 用例](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E4%B8%BB%E8%A6%81-agent-%E7%94%A8%E4%BE%8B)

客户服务成为最常见的 Agent 用例（26.5%），研究与数据分析紧随其后（24.4%）。这两个类别合计占所有主要 Agent 部署的一半以上。

![主要 Agent 用例](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/02-primary-agent-use-case.png)

客户服务的强劲表现表明，团队正在将 Agent 直接推向客户，而不仅仅是内部使用。同时，Agent 在内部持续创造明确价值，18% 的受访者表示使用 Agent 进行内部工作流自动化以提升员工效率。

研究与数据分析用例的流行进一步证实了 Agent 目前的优势所在：综合大量信息、跨来源推理、加速知识密集型任务。

值得注意的是，今年受访者选择的用例分布更广（受访者只能选择一个主要用例），因此 Agent 采用可能正在从狭窄的早期应用向多元化发展。

**规模化带来哪些变化？**

在 10,000+ 员工规模的组织中，内部生产力是首要用例（26.8%），客户服务（24.7%）和研究与数据分析（22.2%）紧随其后。大型企业可能倾向于在将 Agent 直接部署给终端用户之前或同时，先专注于提升内部团队效率。

### [生产环境的最大障碍](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E7%9A%84%E6%9C%80%E5%A4%A7%E9%9A%9C%E7%A2%8D)

质量仍然是生产环境的最大障碍，与去年的发现一致。今年，三分之一的受访者将质量列为首要阻碍。这包括准确性、相关性、一致性，以及 Agent 保持正确语调并遵守品牌或政策指南的能力。

![生产环境的最大障碍](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/03-biggest-blocker-to-production.png)

延迟已成为第二大挑战（20%）。随着 Agent 进入客户服务和代码生成等面向客户的用例，响应时间成为用户体验的关键部分。这也反映了团队在质量和速度之间的权衡——功能更强大的多步骤 Agent 可以提供更高质量的输出，但响应往往更慢。

相比之下，成本作为顾虑的提及频率低于往年。模型价格下降和效率提升似乎将注意力从原始支出转移开来，组织更优先考虑让 Agent 运行良好且快速。

**规模化带来哪些变化？**

在企业级（2,000+ 员工）组织中，质量仍是首要阻碍，但安全性成为第二大顾虑，被 24.9% 的受访者提及——超过了延迟，后者对较小组织来说更常见。

![企业级组织的生产障碍](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/04-biggest-blocker-enterprise.png)

对于 10,000+ 员工规模的组织，开放式回答指出幻觉（Hallucination）和 Agent 生成输出的一致性是确保 Agent 质量的最大挑战。许多人还提到了上下文工程（Context Engineering）和大规模管理上下文的持续困难。

### [Agent 的可观测性](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#agent-%E7%9A%84%E5%8F%AF%E8%A7%82%E6%B5%8B%E6%80%A7)

追踪多步推理链和工具调用的能力已成为 Agent 的标配。89% 的组织已为其 Agent 实施某种形式的可观测性，62% 具有详细追踪能力，可以检查单个 Agent 步骤和工具调用。

![可观测性设置状态](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/05-observability-setup.png)

在已有生产环境 Agent 的受访者中，采用率更高：94% 具有某种形式的可观测性，71.5% 具有完整追踪能力。这揭示了 Agent 工程的一个基本事实：如果看不到 Agent 如何推理和行动，团队就无法可靠地调试故障、优化性能或与内外部利益相关者建立信任。

![生产环境中的可观测性](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/06-observability-in-production.png)

### [Agent 的评估与测试](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#agent-%E7%9A%84%E8%AF%84%E4%BC%B0%E4%B8%8E%E6%B5%8B%E8%AF%95)

虽然可观测性被更广泛采用，但 Agent 评估仍在追赶并获得更多关注。刚过半数的组织（52.4%）报告在测试集上运行离线评估（Offline Evaluation），表明许多团队认识到在部署前捕获回归和验证 Agent 行为的重要性。在线评估（Online Evaluation）的采用率较低（37.3%），但随着团队开始监控真实世界的 Agent 性能，这一比例正在增长。

![评估方法](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/07-evaluation-methods.png)

对于已有生产环境 Agent 的组织，评估实践可能更成熟，因为整体评估采用率显著更高（“未评估”从 29.5% 降至 22.8%）。我们还看到更多组织运行在线评估（44.8%），表明一旦 Agent 面对真实用户，团队就需要观察生产数据以实时检测问题。

![生产环境中的评估](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/08-evaluation-in-production.png)

大多数团队仍从离线评估开始，这可能是因为其入门门槛较低且设置更清晰，但许多团队正在叠加多种方法。在运行任何评估的组织中，近四分之一同时采用离线和在线评估。

![评估方法分布](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/09-eval-methods-breakdown.png)

这些运行评估的组织还依赖人工和自动化方法的组合，使用 LLM-as-judge（LLM 作为评判者）来扩大覆盖面，使用人工审核来深入审查。更广泛地说，人工审核（59.8%）对于细微或高风险情况仍然至关重要，而 LLM-as-judge 方法（53.3%）越来越多地用于扩展质量、事实准确性和指南遵守程度的评估。相比之下，ROUGE 和 BLEU 等传统机器学习指标采用有限。这些指标可能不太适合存在多个有效响应的开放式 Agent 交互场景。

![评估指标](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/10-evaluation-metrics.png)

### [模型和工具格局](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E6%A8%A1%E5%9E%8B%E5%92%8C%E5%B7%A5%E5%85%B7%E6%A0%BC%E5%B1%80)

OpenAI 模型占主导地位，但很少有团队押注于单一提供商。

超过三分之二的组织报告使用 OpenAI 的 GPT 模型，但模型多样化是常态——超过四分之三在生产或开发中使用多个模型。团队越来越多地根据复杂性、成本和延迟等因素将任务路由到不同模型，而不是锁定在单一平台。

![使用的模型](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/11-models-used.png)

尽管商业 API 很便捷，但自托管模型对许多组织来说仍是重要策略。三分之一的组织报告投资于部署自有模型所需的基础设施和专业知识。这种开源模型采用可能是由高流量成本优化、数据驻留和主权要求，或敏感行业的监管约束驱动的。

同时，微调仍是专业化的，而非标准化的。大多数组织（57%）没有进行模型微调，而是依赖基础模型结合 Prompt 工程和 RAG。由于微调需要在数据收集、标注、训练基础设施和持续维护方面的重大投资，它似乎主要保留给高影响力或专业化用例。

![微调状态](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/12-fine-tuning.png)

### [日常使用的 Agent 有哪些？](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E6%97%A5%E5%B8%B8%E4%BD%BF%E7%94%A8%E7%9A%84-agent-%E6%9C%89%E5%93%AA%E4%BA%9B)

当我们问”你在日常工作中最常使用哪些 Agent？“时，开放式回答中出现了几个清晰的模式。

**1\. 编程 Agent 主导日常工作流程**

最常被提及的 Agent 是编程助手。受访者反复提到 Claude Code、Cursor、GitHub Copilot、Amazon Q、Windsurf 和 Antigravity 等工具作为他们日常开发循环的一部分，无论是代码生成、调试、测试创建还是浏览大型代码库。

![每日最常用的 Agent](https://stellarlink.co/articles/assets/state-of-agent-engineering-images/13-top-agents-daily.png)

**2\. 研究与深度研究 Agent 是第二常用的**

第二个常见模式是由 ChatGPT、Claude、Gemini、Perplexity 及类似工具驱动的研究和深度研究 Agent。这些 Agent 用于探索新领域、总结长文档和跨来源综合信息。它们通常在同一工作流程中作为编程 Agent 的伴侣使用。

**3\. 基于 LangChain 和 LangGraph 构建的自定义 Agent 也很流行**

第三个明显的群体是自定义 Agent，许多受访者在 LangChain 和 LangGraph 上构建。受访者描述了用于 QA 测试、内部知识库搜索、SQL/文本转 SQL、需求规划、客户支持和工作流自动化等内部 Agent。

值得注意的是，相当一部分人表示除了 LLM 聊天或编程辅助外，尚未使用 Agent，这表明虽然 Agent 使用已很普遍，但更广泛的”万物皆 Agent”仍处于早期阶段。

## [调研方法](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E8%B0%83%E7%A0%94%E6%96%B9%E6%B3%95)

本报告的洞察来自我们在 2025 年 11 月 18 日至 12 月 2 日期间进行的为期 2 周的公开调研。我们收到了 1,340 份回复。以下是一些人口统计数据：

**前 5 大行业：**

*   科技（63% 的受访者）
*   金融服务（10% 的受访者）
*   医疗保健（6% 的受访者）
*   教育（4% 的受访者）
*   消费品（3% 的受访者）
*   制造业（3% 的受访者）

**公司规模：**

*   100 人以下（49% 的受访者）
*   100-500 人（18% 的受访者）
*   500-2,000 人（15% 的受访者）
*   2,000-10,000 人（9% 的受访者）
*   10,000+ 人（9% 的受访者）

## [相关资源](https://stellarlink.co/articles/agent%E5%B7%A5%E7%A8%8B%E7%8E%B0%E7%8A%B6%E6%8A%A5%E5%91%8A#%E7%9B%B8%E5%85%B3%E8%B5%84%E6%BA%90)

*   [”Agent Engineering: A New Discipline” 博客](https://blog.langchain.dev/agent-engineering-a-new-discipline/)
*   [LangSmith Evaluations 指南](https://docs.langchain.com/langsmith/evaluation)
*   [LangSmith Observability 文档](https://docs.langchain.com/langsmith/observability)
