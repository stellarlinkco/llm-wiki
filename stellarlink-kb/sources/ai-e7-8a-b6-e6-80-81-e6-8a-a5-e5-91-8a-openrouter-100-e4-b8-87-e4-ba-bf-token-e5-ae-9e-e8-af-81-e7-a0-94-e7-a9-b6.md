---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6"
title: AI 状态报告：OpenRouter 100 万亿 Token 实证研究
description: AI 状态报告 OpenRouter 100 万亿 Token 实证研究
resource: "https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6"
tags: []
timestamp: "2026-06-20T06:45:26.251Z"
source_path: "https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6"
source_id: 338bc3cb1e52c05fc8161df758a68c57d34c726f87b78ca5832fc77217bba203
content_hash: 1915aaff5b6e80a7879829f82da5a73ff440eae909b1d96800afdeeeab7a59d0
---

## [完整文章](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%AE%8C%E6%95%B4%E6%96%87%E7%AB%A0)

**标题：** AI 状态报告：OpenRouter 100 万亿 Token 实证研究

**作者：** Malika Aubakirova\*、Alex Atallah†、Chris Clark†、Justin Summerville†、Anjney Midha\*

\*a16z (Andreessen Horowitz) • † OpenRouter Inc.

**发布日期：** 2025 年 12 月

* * *

## [摘要](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%91%98%E8%A6%81)

本实证研究分析了 OpenRouter 平台上超过 100 万亿 Token 的真实 LLM 交互数据，记录了大语言模型在实际场景中的部署方式。研究揭示了开源权重模型的大规模采用、创意角色扮演和编程辅助的超高人气，以及 Agentic 推理模式的兴起。一项关键发现识别出”基础用户群”（foundational cohorts）——表现出持续参与度的早期用户——被称为灰姑娘”玻璃鞋”效应，即初始的模型-工作负载契合度创造了持久的采用模式。

* * *

## [引言](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%BC%95%E8%A8%80)

LLM 领域在 2024 年 12 月 5 日发生了根本性转变，OpenAI 发布了 o1，引入了”扩展的推理时计算过程，涉及内部多步骤推理”，而不是单次生成。这标志着该领域从模式补全转向结构化推理。

Anthropic 的 Sonnet 2.1 和 Cohere 的 Command R 等先前方法强调工具使用和检索增强生成，但 o1 代表了第一个通过深思熟虑的多阶段计算执行推理的广泛部署架构。

虽然能力进步有据可查，但关于实际 LLM 使用情况的系统性证据仍然有限。本研究利用 OpenRouter 作为多模型 AI 推理中心的地位，为全球不同的开发者和最终用户提供服务，分析了跨越约两年的匿名请求级元数据。

**关键分析领域：**

*   开源与闭源模型采用模式
*   Agentic 推理的兴起
*   跨用例的任务分类
*   地理使用差异
*   用户留存动态
*   成本与使用关系

* * *

## [数据和方法论](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%95%B0%E6%8D%AE%E5%92%8C%E6%96%B9%E6%B3%95%E8%AE%BA)

### [OpenRouter 平台与数据集](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#openrouter-%E5%B9%B3%E5%8F%B0%E4%B8%8E%E6%95%B0%E6%8D%AE%E9%9B%86)

分析基于 OpenRouter 上数十亿个 Prompt-完成对的**匿名请求级元数据**，跨越约两年，重点关注最近一年。数据集包括：

*   时间和模型/提供商标识符
*   Token 使用量（Prompt 和完成）
*   系统性能指标
*   地理路由信息
*   使用上下文（流式传输、取消、工具调用）

**平台范围：** 来自 60 多家提供商的 300 多个活跃模型，为全球数百万开发者提供服务，其中 50% 以上的使用来自美国以外。

所有分析均使用 **Hex 分析平台**进行，采用可重现的 SQL 查询和版本化转换。

### [GoogleTagClassifier 内容分类](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#googletagclassifier-%E5%86%85%E5%AE%B9%E5%88%86%E7%B1%BB)

OpenRouter 使用 **GoogleTagClassifier** 对约 0.25% 的所有 Prompt 进行内部分类，与 Google Cloud Natural Language 的 `classifyText` 内容分类 API 对接。系统：

*   应用分层、语言无关的分类法
*   返回置信度分数为 \[0,1\] 的类别路径
*   排除低于 0.5 置信度阈值的类别
*   在 OpenRouter 基础设施内匿名运行

**类别映射：**

*   编程：`/Computers & Electronics/Programming`
*   角色扮演：`/Games/Roleplaying Games`
*   翻译：`/Reference/Language Resources/*`
*   一般问答：`/Reference/General Reference/*`
*   生产力/写作：`/Business & Productivity Software`
*   教育：`/Jobs & Education/Education/*`
*   文学：`/Books & Literature/*`
*   成人内容：`/Adult`
*   其他：长尾未映射 Prompt

### [模型和 Token 变体](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%A8%A1%E5%9E%8B%E5%92%8C-token-%E5%8F%98%E4%BD%93)

**采用的区分：**

*   开源（OSS）：公开可用的权重
*   闭源：仅限 API 访问
*   中国 vs 世界其他地区（RoW）：开发者位置
*   Prompt vs 完成 Token：输入 vs 生成的输出
*   推理 Token：完成 Token 内的内部步骤

### [地理分割](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%9C%B0%E7%90%86%E5%88%86%E5%89%B2)

用户区域由与每个账户关联的**账单位置**确定，比基于 IP 的位置数据提供更可靠的代理。限制包括第三方账单安排和跨多个地区的企业账户聚合。

### [时间范围和覆盖范围](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%97%B6%E9%97%B4%E8%8C%83%E5%9B%B4%E5%92%8C%E8%A6%86%E7%9B%96%E8%8C%83%E5%9B%B4)

主要分析涵盖截至 2025 年 11 月的滚动 13 个月期间。模型级分析：2024 年 11 月 3 日至 2025 年 11 月 30 日。类别级分析：2025 年 5 月起（反映一致标记可用的时间）。所有时间序列聚合使用 UTC 标准化时间戳按周计算，汇总 Prompt 和完成 Token。

* * *

## [开源与闭源模型](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%BC%80%E6%BA%90%E4%B8%8E%E9%97%AD%E6%BA%90%E6%A8%A1%E5%9E%8B)

![开源与闭源模型分割](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Foss-split.png&w=3840&q=75)

**按来源类型划分的总 Token 量周度份额。** 浅蓝色阴影代表开源权重模型（中国 vs 世界其他地区），深蓝色代表专有产品。垂直虚线标记关键开源权重模型发布。

专有模型服务于大部分 Token，但开源模型稳步增长，到 2025 年底约占使用量的三分之一。使用高峰与 DeepSeek V3 和 Kimi K2 等主要版本一致，表明”真正的生产使用而非短期实验”。

![按模型类型划分的周度 Token 量](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Foss-token-share.png&w=3840&q=75)

**按模型类型划分的周度 Token 量。** 堆叠条形图显示按类别划分的 Token 使用情况：深红色（专有）、橙色（中国 OSS）、青色（RoW OSS）。

**中国 OSS 增长：** 从 2024 年底微不足道的 1.2%，中国开源模型在某些周达到近 30%。年度平均值：中国 OSS 13.0%，RoW OSS 13.7%，专有 RoW 70%。这一扩张反映了竞争性质量和快速迭代周期。

**平衡结构：** 生态系统已达到约 30% 的开源使用率。这些模型在多模型堆栈中补充而非取代专有系统，为特定工作负载提供成本效率和定制化。

### [关键开源参与者](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%85%B3%E9%94%AE%E5%BC%80%E6%BA%90%E5%8F%82%E4%B8%8E%E8%80%85)

**按模型作者划分的总 Token 量（2024 年 11 月至 2025 年 11 月）：**

模型作者

总 Token（万亿）

DeepSeek

14.37

Qwen

5.59

Meta LLaMA

3.96

Mistral AI

2.92

OpenAI

1.65

Minimax

1.26

Z-AI

1.18

TNGTech

1.13

MoonshotAI

0.92

Google

0.82

![随时间变化的前 15 名 OSS 模型](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Ftop-15-oss-models-over-time.png&w=3840&q=75)

**随时间变化的前 15 名 OSS 模型。** 周度相对 Token 份额显示市场从近乎垄断演变为多元化分布。

**市场演变：**

*   2024 年底：两个 DeepSeek 模型（V3、R1）占 OSS Token 的 50% 以上
*   2025 年中”夏季拐点”：市场显著多元化
*   2025 年底：没有单一模型超过 OSS 份额的 25%；五到七个模型保持有意义的使用量

**关键洞察：**

*   “顶级多样性”：DeepSeek 曾经主导的地方，现在多个模型占据重要份额
*   ”新进入者快速扩展”：有能力的新模型在几周内获得显著使用量（例如 MoonshotAI、MiniMax）
*   “迭代优势”：持续改进至关重要——停滞不前的模型会失去份额给更新的竞争对手

### [模型规模 vs 市场契合度：中等是新的小型](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%A8%A1%E5%9E%8B%E8%A7%84%E6%A8%A1-vs-%E5%B8%82%E5%9C%BA%E5%A5%91%E5%90%88%E5%BA%A6%E4%B8%AD%E7%AD%89%E6%98%AF%E6%96%B0%E7%9A%84%E5%B0%8F%E5%9E%8B)

![OSS 模型规模 vs 使用量](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fparam-size-vs-usage.png&w=3840&q=75)

**按模型规模类别划分的 OSS Token 总量周度份额。**

**参数分类：**

*   小型：<150 亿参数
*   中型：150-700 亿参数
*   大型：700 亿以上参数

**市场动态：**

*   **小型模型**：尽管稳定供应新模型，整体使用量下降；高度分散，没有占主导地位的长期参与者
*   **中型模型**：“找到模型-市场契合度”——在 Qwen2.5 Coder 32B（2024 年 11 月）之前微不足道；现在是具有强大竞争者的竞争性生态系统
*   **大型模型**：多元化格局——没有整合；多个高性能模型获得持续使用

**解释：** “小型模型主导开源生态系统的时代可能已经过去。“市场正在向强大的中档模型或单一最强大的大型模型整合分化。

![按规模划分的 OSS 模型数量随时间变化](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fparam-size-vs-num-available.png&w=3840&q=75)

**按规模划分的 OSS 模型数量随时间变化。** 按参数大小分组的可用模型周度计数。

### [开源模型用于什么？](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%BC%80%E6%BA%90%E6%A8%A1%E5%9E%8B%E7%94%A8%E4%BA%8E%E4%BB%80%E4%B9%88)

![OSS 模型的类别趋势](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Foss-category-trends.png&w=3840&q=75)

**OSS 模型的类别趋势。** 分布显示角色扮演（52%）和编程主导 OSS 工作负载组合。

开源模型服务于广泛的任务，其中两个类别占使用量的大部分：

*   **角色扮演**：OSS Token 的 52% 以上；用户将模型用于讲故事、角色发展、游戏场景
*   **编程**：第二大类别；与专有产品的竞争力日益增强
*   较小部分：翻译、一般问答、其他

角色扮演的主导地位反映了开放模型”可以用于创造力，并且通常受内容过滤器的限制较少”，使它们对幻想、娱乐和互动游戏应用具有吸引力。

![中国 OSS 类别趋势](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fchinese-oss-category-trends.png&w=3840&q=75)

**中国 OSS 类别趋势。** 角色扮演仍然是最大的用例（约 33%），但编程和技术共同占 39%，而整体 OSS 混合。

中国 OSS 模型从创意任务转向技术领域。Qwen 和 DeepSeek 等模型越来越多地用于代码生成和基础设施工作负载，表明”在技术和生产力领域的直接竞争”。

![按模型来源划分的编程查询](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fprogramming-oss-split.png&w=3840&q=75)

**按模型来源划分的编程查询。** 按模型来源类型划分的编程相关 Token 份额。

编程辅助由专有模型主导（灰色区域）。在 OSS 细分市场中，从中国 OSS 主导（2025 年中）转向西方 OSS 复苏（2025 年底），表明”非常有竞争力的环境”，开发人员选择”目前提供最佳编码支持的任何 OSS 模型”。

![按模型来源划分的角色扮演查询](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Froleplay-oss-split.png&w=3840&q=75)

**按模型来源划分的角色扮演查询。** 按模型来源划分的角色扮演用例的 Token 量。

角色扮演使用从专有主导（2025 年 5 月 70%）转向平衡分布。世界其他地区 OSS 现在约 43%，闭源模型约 42%，反映”健康的竞争”，开发人员认识到需求并相应地定制发布。

**关键 OSS 用例：**

1.  **角色扮演和创意对话**：顶级类别；由于定制化和减少审查，开放模型具有优势
2.  **编程辅助**：随着开放模型的改进而增长；许多开发人员在本地使用以避免 API 成本
3.  **翻译和多语言支持**：稳定用例；中国 OSS 模型优势
4.  **一般问答和教育**：适度使用；用户更喜欢闭源模型以确保准确性

OSS 模式反映”发烧友”或”独立开发者”——定制化和成本效益胜过绝对准确性的领域。

* * *

## [Agentic 推理的兴起](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#agentic-%E6%8E%A8%E7%90%86%E7%9A%84%E5%85%B4%E8%B5%B7)

正在从单轮文本补全转向多步骤、工具集成、推理密集型工作流的根本转变。**Agentic 推理**部署模型不仅仅是生成文本，而是通过规划、工具调用和扩展上下文交互来行动。

### [推理模型现在占所有使用量的一半](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%8E%A8%E7%90%86%E6%A8%A1%E5%9E%8B%E7%8E%B0%E5%9C%A8%E5%8D%A0%E6%89%80%E6%9C%89%E4%BD%BF%E7%94%A8%E9%87%8F%E7%9A%84%E4%B8%80%E5%8D%8A)

![推理 vs 非推理 Token 趋势](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Freasoning-vs-nonreasoning.png&w=3840&q=75)

**推理 vs 非推理 Token 趋势。** 通过推理优化模型路由的所有 Token 份额在 2025 年急剧上升，超过 50%。

通过推理模型的 Token 总份额从第一季度初微不足道的水平攀升至 50% 以上。这既反映了供应（GPT-5、Claude 4.5、Gemini 3 等更高能力系统），也反映了需求（用户更喜欢管理任务状态和多步骤逻辑的模型）。

![按 Token 量划分的顶级推理模型](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Freasoning-top-models.png&w=3840&q=75)

**按 Token 量划分的顶级推理模型。** xAI 的 Grok Code Fast 1 目前处理最大份额的推理流量。

最近的领导者：xAI 的 Grok Code Fast 1，其次是 Google 的 Gemini 2.5 Pro 和 Gemini 2.5 Flash。快速变化反映”动态推理格局”，竞争性定价和开发者关注推动采用。

### [工具调用采用率上升](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E9%87%87%E7%94%A8%E7%8E%87%E4%B8%8A%E5%8D%87)

![工具调用](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Ftool-calling-vs-not.png&w=3840&q=75)

**工具调用。** 被分类为 _Tool Call_ 的请求的总 Token 份额，意味着工具实际被调用。

指标衡量已实现的工具使用（完成原因）与潜在可用性（输入工具信号）。除了 5 月份单个大型账户的峰值外，工具采用显示”全年持续上升趋势”。

![按提供的工具量划分的顶级模型](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Ftool-use-models.png&w=3840&q=75)

**按提供的工具量划分的顶级模型。** 工具提供集中在明确针对 Agentic 推理优化的模型中。

最初集中在 OpenAI 的 gpt-4o-mini 和 Anthropic 的 Claude 系列，年中扩大。Grok Code Fast 和 GLM 4.5 等新进入者取得了明显进展。对于运营商：“为高价值工作流启用工具使用正在兴起”。

### [Prompt-完成形状的剖析](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#prompt-%E5%AE%8C%E6%88%90%E5%BD%A2%E7%8A%B6%E7%9A%84%E5%89%96%E6%9E%90)

![Prompt Token 数量正在增加](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fprompt-tokens-growth.png&w=3840&q=75)

**Prompt Token 数量正在增加。** 自 2024 年初以来，平均 Prompt Token 长度增加了近四倍。

![完成 Token 数量几乎增加了两倍](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fcompletion-tokens-growth.png&w=3840&q=75)

**完成 Token 数量几乎增加了两倍。** 输出长度从约 150 增加到 400 Token。

每个请求的平均 Prompt Token 增加了约四倍（1.5K 到 6K+）；完成几乎增加了三倍（150 到 400 Token）。这反映了转变”从开放式生成转向更复杂、上下文丰富的工作负载”。

今天的典型请求：不太像”给我写一篇文章”，更像是对大量用户提供的材料（代码库、文档、转录、长对话）进行推理，产生简洁的见解。

![编程是 Prompt Token 增长背后的主要驱动力](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fprompt-tokens-growth-per-category.png&w=3840&q=75)

**编程是 Prompt Token 增长背后的主要驱动力。** 编程相关任务始终需要最大的输入上下文。

编程工作负载驱动 Prompt Token 增长；请求通常超过 20K 输入 Token。其他类别”保持相对平坦和低量”，表明”与软件开发和技术推理用例相关的集中激增”。

### [更长的序列，更复杂的交互](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%9B%B4%E9%95%BF%E7%9A%84%E5%BA%8F%E5%88%97%E6%9B%B4%E5%A4%8D%E6%9D%82%E7%9A%84%E4%BA%A4%E4%BA%92)

![平均序列长度随时间变化](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Faverage-seq-length-over-time.png&w=3840&q=75)

**平均序列长度随时间变化。** 每次生成的平均 Token（Prompt + 完成）。

平均序列长度从不到 2,000 Token（2023 年底）增加了三倍多，达到 5,400 多 Token（2025 年底），反映”向更长的 Context Window、更深的任务历史和更精细的完成的结构性转变”。

![编程 vs 整体的序列长度](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Foverall-vs-programming-seq-length.png&w=3840&q=75)

**编程 vs 整体的序列长度。** 编程 Prompt 系统性更长且增长更快。

编程相关 Prompt 平均 Token 长度是通用 Prompt 的 3-4 倍。分歧表明软件开发工作流是更长交互的主要驱动力——“嵌入式、更复杂的 Agentic 工作流的标志”。

### [含义：Agentic 推理是新的默认值](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%90%AB%E4%B9%89agentic-%E6%8E%A8%E7%90%86%E6%98%AF%E6%96%B0%E7%9A%84%E9%BB%98%E8%AE%A4%E5%80%BC)

趋势显示 LLM 使用的重心已经转移。“中位数 LLM 请求不再是一个简单的问题或孤立的指令。“相反，结构化的类 Agent 循环调用外部工具，对状态进行推理，并在更长的上下文中持久化。

**对模型提供商：** 提高默认能力的标准——延迟、工具处理、上下文支持、鲁棒性至关重要。

**对基础设施运营商：** 必须管理长时间运行的对话、执行跟踪、权限敏感的工具集成。

**更广泛的含义：** “很快，如果还没有，Agentic 推理将接管大部分推理。“

* * *

## [类别：人们如何使用 LLM？](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E7%B1%BB%E5%88%AB%E4%BA%BA%E4%BB%AC%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-llm)

了解任务分布揭示了现实世界的需求和模型-市场契合度。类别通过 GoogleTagClassifier 对所有 LLM 使用（闭源和开源模型）确定。

### [主导类别](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E4%B8%BB%E5%AF%BC%E7%B1%BB%E5%88%AB)

![编程作为主导且增长的类别](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fprogramming-dominant-tag.png&w=3840&q=75)

**编程作为主导且增长的类别。** 被分类为编程的所有 LLM 查询份额稳步增长。

编程是最一致扩展的类别。份额从约 11%（2025 年初）增长到 50% 以上（最近几周），反映”从探索性或对话性使用转向应用任务，如代码生成、调试和数据脚本”。

趋势与 LLM 集成开发环境的兴起平行。演变具有含义：“增加对以代码为中心的训练数据的重视，改进多步骤编程任务的推理深度，以及更紧密的反馈循环”。

![按模型提供商划分的编程请求份额](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Ftop-models-programming-tag.png&w=3840&q=75)

**按模型提供商划分的编程请求份额。** 编程工作负载高度集中在顶级提供商中。

**提供商主导地位：**

*   Anthropic：持续 60% 以上（最近在 11 月 17 日那周首次跌破 60%）
*   OpenAI：从 2%（7 月）扩展到 8%（最近几周）
*   Google：稳定在约 15%
*   中档（Z.AI、Qwen、Mistral AI、MiniMax）：稳步增长

**要点：** 编程”最有争议和战略上最重要的模型类别之一”。适度的质量/延迟变化每周都会转移份额。持续基准测试至关重要。

### [类别内的标签组成](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E7%B1%BB%E5%88%AB%E5%86%85%E7%9A%84%E6%A0%87%E7%AD%BE%E7%BB%84%E6%88%90)

![按总 Token 份额划分的前 6 个类别](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fall-categories-tags-first-six.png&w=3840&q=75)

**按总 Token 份额划分的前 6 个类别。** 每个类别内主导子标签的细分。

![按 Token 份额划分的后 6 个类别](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fall-categories-tags-next-six.png&w=3840&q=75)

**按 Token 份额划分的后 6 个类别。** 次要类别的类似细分。

大多数类别分布不均——由一两个重复模式主导：

**角色扮演**（约 60% 游戏/角色扮演游戏；15.6% 作家资源；15.4% 成人内容）：显示”结构化角色扮演或角色引擎”而不是休闲聊天机器人。反映”明确定义和可复制的基于流派的用例”。

**编程**（67% 以上编程/其他；26.4% 开发工具）：“与代码相关的 Prompt 的广泛和通用性质”——用户不狭隘地关注工具/语言，而是要求从调试到脚本的一切。

**其他领域**（翻译、科学、健康、金融、学术、法律）：

*   翻译：在外语资源和其他用途之间均匀分配
*   科学：由机器学习和 AI 主导（80.4%）——“元 AI 问题而非一般 STEM”
*   健康：最分散（没有子标签超过 25%）——反映领域复杂性和”安全建模的挑战”
*   金融、学术、法律：分散且”可能未充分优化”

**关键洞察：** 现实世界的使用紧密围绕可重复的高量任务聚集。角色扮演、编程、个人辅助表现出清晰的结构。科学、健康、法律更分散，代表”潜在需求”，随着模型改进可能增长。

### [按类别划分的作者级洞察](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%8C%89%E7%B1%BB%E5%88%AB%E5%88%92%E5%88%86%E7%9A%84%E4%BD%9C%E8%80%85%E7%BA%A7%E6%B4%9E%E5%AF%9F)

不同的模型作者以不同的方式使用：

![Anthropic 顶级标签](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fanthropic-top-tags.png&w=3840&q=75)

**Anthropic。** 主要用于编程和技术任务（80% 以上），最少角色扮演。

Claude 严重倾向于**编程 + 技术**（超过 80%）。定位为”针对复杂推理、编码和结构化任务优化的模型”；开发人员主要用于编码辅助和问题解决。

![Google 顶级标签](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fgoogle-top-tags.png&w=3840&q=75)

**Google。** 广泛的使用组成，涵盖法律、科学、技术、一般知识。

Google 模型更多样化：翻译、科学、技术、一般知识。相对编码份额下降（2025 年底 18%）。暗示”通用信息引擎”而非专业工具。

![xAI 顶级标签](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fxai-top-tags.png&w=3840&q=75)

**xAI。** 严重集中在编程上，技术、角色扮演、学术在 11 月底出现。

xAI 使用早期绝大多数集中在**编程**（通常超过 80%）。11 月底急剧转变，当时分布扩大——与”通过选定的消费者应用程序免费分发”一致，引入”大量非开发者流量涌入”。

![OpenAI 顶级标签](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fopenai-top-tags.png&w=3840&q=75)

**OpenAI。** 随着时间的推移转向编程和技术任务。

OpenAI 配置文件显著转变：年初科学 >50%，现在 <15%。编程和技术现在占总量的 >50%（各 29%）。配置文件”位于 Anthropic 的紧密聚焦配置文件和 Google 的更分散分布之间”。

![DeepSeek 顶级标签](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fdeepseek-top-tags.png&w=3840&q=75)

**DeepSeek。** 使用由角色扮演和休闲互动主导。

Token 分布由角色扮演、休闲聊天、娱乐主导（通常占使用量的 2/3 以上）。编程/科学中的小部分。反映”强大的消费者导向”和”定位为高参与度对话模型”。

![Qwen 顶级标签](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fqwen-top-tags.png&w=3840&q=75)

**Qwen。** 在编程任务中高度集中。

编程始终占 Token 的 40-60%，表明”明确强调技术和开发者任务”。相邻类别的波动性更高；每周变化意味着”异质用户群和快速迭代”。

**总结：** 每个提供商都展示了与战略重点一致的独特配置文件。差异突出了为什么没有单一模型能够最佳地涵盖所有用例；强调”多模型生态系统的潜在好处”。

* * *

## [地理：LLM 使用在不同地区的差异](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%9C%B0%E7%90%86llm-%E4%BD%BF%E7%94%A8%E5%9C%A8%E4%B8%8D%E5%90%8C%E5%9C%B0%E5%8C%BA%E7%9A%84%E5%B7%AE%E5%BC%82)

全球 LLM 使用表现出明显的区域差异。虽然是 OpenRouter 特定的，快照提供了对区域参与模式的洞察。

### [使用的区域分布](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E4%BD%BF%E7%94%A8%E7%9A%84%E5%8C%BA%E5%9F%9F%E5%88%86%E5%B8%83)

![按世界地区划分的支出量随时间变化](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fspend-by-region.png&w=3840&q=75)

**按世界地区划分的支出量随时间变化。** 按大陆划分的全球使用周度份额。

分布强调”AI 推理市场日益全球化的性质”。北美仍然是单一最大地区，现在占总支出的 <50%。欧洲显示稳定贡献（中等到低 20 多岁）。值得注意的发展：亚洲份额从约 13%（最早几周）翻了一番多，达到约 31%（最近时期）。

**LLM 使用的大陆分布（占总 Token 的百分比）：**

大陆

份额（%）

北美

47.22

亚洲

28.61

欧洲

21.32

大洋洲

1.18

南美

1.21

非洲

0.46

**按 Token 量划分的前 10 个国家：**

国家

份额（%）

美国

47.17

新加坡

9.21

德国

7.51

中国

6.01

韩国

2.88

荷兰

2.65

英国

2.52

加拿大

1.90

日本

1.77

印度

1.62

其他（60 多个国家）

16.76

### [语言分布](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E8%AF%AD%E8%A8%80%E5%88%86%E5%B8%83)

**按语言划分的 Token 量：**

语言

Token 份额（%）

英语

82.87

简体中文

4.95

俄语

2.47

西班牙语

1.43

泰语

1.03

其他（合计）

7.25

英语占主导地位（80% 以上），反映了英语模型的普遍性和 OpenRouter 以开发者为中心的倾斜。然而，中文（4.95%）、俄语、西班牙语代表了有意义的长尾。仅简体中文就表明”双语或以中文为第一语言的环境中的用户持续参与”。

**要点：** 对于构建者和运营商，“跨地区可用性、跨语言、合规制度和部署设置正在成为基本要求”。

* * *

## [LLM 用户留存分析](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#llm-%E7%94%A8%E6%88%B7%E7%95%99%E5%AD%98%E5%88%86%E6%9E%90)

### [灰姑娘”玻璃鞋”现象](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E7%81%B0%E5%A7%91%E5%A8%98%E7%8E%BB%E7%92%83%E9%9E%8B%E7%8E%B0%E8%B1%A1)

![Claude 4 Sonnet 留存](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fclaude-4-sonnet-retention.png&w=3840&q=75)

Claude 4 Sonnet

![Gemini 2.5 Pro 留存](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fgemini-2.5-pro-retentions.png&w=3840&q=75)

Gemini 2.5 Pro

![Gemini 2.5 Flash 留存](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fgemini-2.5-flash.png&w=3840&q=75)

Gemini 2.5 Flash

![OpenAI GPT-4o Mini 留存](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fopenai-4omini-retention.png&w=3840&q=75)

OpenAI GPT-4o Mini

![Llama 4 Maverick 留存](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fllama-4-maverick-retention.png&w=3840&q=75)

Llama 4 Maverick

![Gemini 2.0 Flash 留存](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fgemini-flash-2.png&w=3840&q=75)

Gemini 2.0 Flash

![DeepSeek R1 留存](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fdeepseek-r1-retentions.png&w=3840&q=75)

DeepSeek R1

![DeepSeek Chat V3-0324 留存](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fdeepseek-chat-v3-retentions.png&w=3840&q=75)

DeepSeek Chat V3-0324

**用户群留存率。** 留存衡量为 _活动留存_（用户在随后的几个月内返回，尽管有不活动期）。

数据由高流失率和快速用户群衰减主导，但”微妙且更有影响的信号”出现：一小部分早期用户群表现出持久的留存。这些被称为**基础用户群**。

**基础用户群**代表其工作负载实现了深刻、持久的**工作负载-模型契合度**的用户。一旦建立，这种契合度创造了”抵制替代的经济和认知惯性”。

**灰姑娘玻璃鞋效应假设：** 在快速发展的 AI 生态系统中，存在高价值未解决工作负载的潜在分布。每个新的前沿模型都被”试穿”来解决这些开放问题。当新发布的模型匹配以前未满足的技术/经济约束时，它实现了精确契合——隐喻的”玻璃鞋”。

当对齐发生时，开发人员的系统、数据管道、用户体验会锚定到首先解决问题的模型。“随着成本下降和可靠性提高，重新平台化的动机急剧下降。“

**关键模式：**

1.  **2025 年 6 月 Gemini 2.5 Pro 用户群和 2025 年 5 月 Claude 4 Sonnet：** 在第 5 个月保留约 40% 的用户——“远高于后来的用户群”。对应于”特定的技术突破”，使”以前不可能的工作负载”成为可能。
    
2.  **首先解决作为持久优势：** “早期采用者将模型嵌入到管道、基础设施和用户行为中，导致高转换摩擦。“创建稳定的平衡，保留基础用户群，尽管有更新的替代方案。
    
3.  **留存作为能力拐点指标：** 用户群级模式作为”模型差异化的经验信号”。持久留存表明”有意义的能力拐点——从不可行到可能的工作负载类别”。
    
4.  **时间约束：** “模型可以捕获基础用户的狭窄时间窗口。“随着能力差距缩小，形成新基础用户群的概率急剧下降。
    

**可观察现象：**

*   **GPT-4o Mini 主导地位：** 单一基础用户群（2024 年 7 月，橙色）建立了”启动时的主导、粘性工作负载-模型契合度”。所有后续用户群在底部完全聚集，表明”建立这种基础契合度的窗口是单一的，仅在模型被视为前沿的时刻发生”。
    
*   **Gemini 2.0 Flash 和 Llama 4 Maverick 失败：** 没有建立高性能基础用户群。“每一个用户群的表现都同样糟糕”，表明模型”从未被视为高价值、粘性工作负载的前沿”。直接推出到”足够好”的市场，未能锁定用户群。
    
*   **DeepSeek”回旋镖效应”：** 留存曲线显示不寻常的”复活跳跃”而不是单调下降。一些流失的用户在测试替代方案后返回，“通过竞争性测试确认 DeepSeek 由于卓越的专业技术性能和成本效率组合而提供最佳契合度”。
    

**含义：** 玻璃鞋现象”将留存重新定义不是作为结果而是作为理解能力突破的镜头”。基础用户群是”真正技术进步的指纹：它们标记了 AI 模型从新颖性跨越到必要性的地方”。对于构建者和投资者，“早期识别这些用户群可能是持久模型-市场优势的最具预测性的单一信号”。

* * *

## [成本 vs 使用动态](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%88%90%E6%9C%AC-vs-%E4%BD%BF%E7%94%A8%E5%8A%A8%E6%80%81)

成本影响用户行为；检查跨成本-使用格局的工作负载分布识别专业化和量聚类的模式。

### [按类别划分的 AI 工作负载分割分析](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%8C%89%E7%B1%BB%E5%88%AB%E5%88%92%E5%88%86%E7%9A%84-ai-%E5%B7%A5%E4%BD%9C%E8%B4%9F%E8%BD%BD%E5%88%86%E5%89%B2%E5%88%86%E6%9E%90)

![按类别划分的对数成本 vs 对数使用](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fprice-vs-usage-for-categories.png&w=3840&q=75)

按类别划分的对数成本 vs 对数使用

散点图揭示了明显的分割，将聚合使用量（总 Token）与单位成本（每百万 Token 成本）映射。两个轴都是对数的——小的视觉距离代表实质性的乘法差异。

**中位成本的垂直线：每百万 Token 0.73 美元**创建四象限框架。

**注意：** 最终成本与广告列表价格不同。高频工作负载受益于缓存，降低了实现的支出。成本指标反映了 Prompt 和完成 Token 的混合率——“用户实际支付的更准确视图”。不包括 BYOK 活动。

**象限分析：**

1.  **高级工作负载（右上）：** 高成本、高使用应用程序，包括 `technology` 和 `science`。技术比其他类别贵得多——“表明推理需要更强大和昂贵的模型，但保持高使用量，表明其本质上的重要性”。
    
2.  **大众市场量驱动器（左上）：** 高使用量，低于或等于平均成本。主导：
    
    *   `编程`：最高使用量，高度优化的中位成本——“杀手级专业”类别
    *   `角色扮演`：使用量几乎与编程相当——显示消费者导向娱乐驱动参与”与顶级专业”类别相当的引人注目的洞察
    *   `科学`：大量量表示
3.  **专业专家（右下）：** 低量、高成本应用（`finance`、`academia`、`health`、`marketing`）。“高风险、利基专业领域”，其中”用户愿意支付显著溢价”，因为需要”准确性、可靠性和领域特定知识”。
    
4.  **利基实用程序（左下）：** 低成本、低量任务（`translation`、`legal`、`trivia`）。“高度优化、‘已解决’或商品化”，其中可以廉价获得足够好的替代品。
    

**技术异常值的意义：** 每 Token 成本最高，幅度可观，同时保持高使用量。“强烈表明具有高支付意愿的市场细分，用于高价值、复杂答案（例如，系统架构、高级技术问题解决）“。

### [AI 模型的有效成本 vs 使用](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#ai-%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%9C%89%E6%95%88%E6%88%90%E6%9C%AC-vs-%E4%BD%BF%E7%94%A8)

![开源与闭源模型格局：成本 vs 使用](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fclose-usage-oss-vs-prop.png&w=3840&q=75)

**开源与闭源模型格局：成本 vs 使用（对数-对数尺度）。** 闭源模型聚集在高成本、高使用象限；OSS 主导低成本、高量区域。

将使用与每百万 Token 成本（对数-对数尺度）映射，揭示”弱的整体相关性”。趋势线几乎平坦——需求”相对价格无弹性”；价格下降 10% 仅对应使用量增加 0.5-0.7%。然而，实质性分散反映”强大的市场分割”。

两个不同的制度：专有模型（OpenAI、Anthropic）占据高成本、高使用区域；开放模型（DeepSeek、Mistral、Qwen）填充低成本、高量区域。模式支持启发式：“闭源模型捕获高价值任务，而开源模型捕获高量低价值任务”。

弱价格弹性表明”即使巨大的成本差异也不能完全转移需求；专有提供商保留关键任务应用程序的定价权，而开放生态系统从成本敏感用户那里吸收量”。

![AI 模型市场地图：成本 vs 使用](https://openrouter.ai/_next/image?url=%2Fimages%2Fstate-of-ai%2Fcost-usage.png&w=3840&q=75)

**AI 模型市场地图：成本 vs 使用（对数-对数尺度）。** 点按提供商着色。

**按细分市场划分的示例模型：**

细分市场

模型

每百万价格

使用量（对数）

要点

高效巨头

google/gemini-2.0-flash

$0.147

6.68

低价格和强大的分销使其成为默认的高量工作马

高效巨头

deepseek/deepseek-v3-0324

$0.394

6.55

以优惠成本的竞争质量推动大规模采用

高级领导者

anthropic/claude-3.7-sonnet

$1.963

6.87

尽管价格高昂，使用量仍然很高，表明对质量的偏好

高级领导者

anthropic/claude-sonnet-4

$1.937

6.84

对于受信任的前沿模型，企业工作负载似乎价格无弹性

长尾

qwen/qwen-2-7b-instruct

$0.052

2.91

最低价格但覆盖范围有限，可能模型-市场契合度较弱

长尾

ibm/granite-4.0-micro

$0.036

2.95

便宜但小众，主要在有限的环境中使用

高级专家

openai/gpt-4

$34.068

3.53

高成本和适度使用，保留给最苛刻的任务

高级专家

openai/gpt-5-pro

$34.965

3.42

超高级，专注于高风险工作负载

**四种使用-成本原型：**

1.  **高级领导者**（Claude 3.7 Sonnet、Claude Sonnet 4）：约 2 美元/百万 Token，高使用量。用户”愿意为大规模的卓越推理和可靠性付费”。
    
2.  **高效巨头**（Gemini 2.0 Flash、DeepSeek V3）：<0.40 美元/百万 Token，类似使用水平。“高量或长上下文工作负载的有吸引力的默认值”。
    
3.  **长尾**（Qwen 2 7B、IBM Granite 4.0）：每百万 Token 几美分，约 10^2.9 使用量。反映”来自较弱性能、有限可见性或较少集成的约束”。
    
4.  **高级专家**（GPT-4、GPT-5 Pro）：约 35 美元/百万 Token，使用量 10^3.4。“谨慎地用于利基、高风险工作负载，其中输出质量比边际 Token 成本重要得多”。
    

散点图突出显示：“LLM 市场的定价权不统一。“更便宜的模型通过效率/集成驱动规模；高级产品在高风险情况下获得强劲需求。“碎片化表明市场尚未商品化，差异化仍然是战略优势的来源”。

**战略含义：**

*   **宏观层面：** 需求”无弹性”，掩盖了不同的微观行为。关键任务企业任务价格容忍；业余爱好者/开发管道成本敏感。
*   **杰文斯悖论证据：** 使模型非常便宜/快速导致更多任务的使用增加，消耗更多总 Token。“高效巨头”组体现了这一点。
*   **质量 > 成本：** 昂贵模型的大量使用表明”如果模型明显更好或具有信任优势，用户将承担更高的成本”。通常模型集成在工作流中，其中成本”相对于它们生产的价值来说微不足道”。
*   **能力本身不足：** 仅仅便宜是不够的；模型必须”可区分且足够有能力”。

* * *

## [讨论](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E8%AE%A8%E8%AE%BA)

这项实证研究提供了关于现实世界 LLM 使用的数据驱动视角，突出了关键主题：

### [1\. 多模型生态系统](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#1-%E5%A4%9A%E6%A8%A1%E5%9E%8B%E7%94%9F%E6%80%81%E7%B3%BB%E7%BB%9F)

没有单一模型主导所有使用。“丰富的多模型生态系统，闭源和开源模型都占据了重要份额。“尽管 OpenAI 和 Anthropic 领导编程/知识任务，开放模型（DeepSeek、Qwen）有时共同服务了 >30% 的 Token。

**含义：** 未来的使用”可能是模型不可知和异质的”。开发人员应该”保持灵活性，集成多个模型并为每项工作选择最佳模型”。模型提供商面临意外竞争（社区模型侵蚀市场份额，除非持续改进/差异化）。

### [2\. 超越生产力的使用多样性](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#2-%E8%B6%85%E8%B6%8A%E7%94%9F%E4%BA%A7%E5%8A%9B%E7%9A%84%E4%BD%BF%E7%94%A8%E5%A4%9A%E6%A0%B7%E6%80%A7)

令人惊讶的发现：角色扮演/娱乐使用的绝对量。OSS Token 的 50% 以上用于角色扮演/讲故事。在专业增长之前，ChatGPT 使用的非平凡部分是休闲/创意的。

“反驳了 LLM 主要用于代码、电子邮件或摘要的假设。“实际上，“许多用户与这些模型互动以获得陪伴或探索”。

**含义：**

*   融合叙事设计、情感参与、互动性的面向消费者的应用中存在巨大机会
*   个性化的新前沿——Agent 发展个性、记住偏好、维持长形式互动
*   重新定义评估指标：成功可能不太依赖于事实准确性，更多地依赖于”一致性、连贯性和维持引人入胜的对话的能力”
*   为 AI 和娱乐 IP 之间的交叉开辟途径——互动讲故事、游戏、创作者驱动的虚拟角色

### [3\. Agent vs 人类：Agentic 推理兴起](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#3-agent-vs-%E4%BA%BA%E7%B1%BBagentic-%E6%8E%A8%E7%90%86%E5%85%B4%E8%B5%B7)

LLM 使用从单轮转向**Agentic 推理**——模型规划、推理、跨多个步骤执行。而不是”一次性响应”，它们协调工具调用、访问外部数据、迭代优化输出。

“随着范式扩展，评估从语言质量转向任务完成和效率。“竞争前沿：“模型能够多有效地执行持续推理”。

### [4\. 地理前景](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#4-%E5%9C%B0%E7%90%86%E5%89%8D%E6%99%AF)

使用变得”日益全球化和去中心化”，增长迅速超越北美。亚洲份额从 13% 上升到 31%。**中国作为主要力量出现**——不仅是国内消费，而且是全球竞争性模型生产。

**要点：** LLM”必须是全球有用的”，在语言、上下文、市场中表现良好。“下一阶段的竞争将取决于文化适应性和多语言能力，而不仅仅是模型规模”。

### [5\. 成本 vs 使用动态](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#5-%E6%88%90%E6%9C%AC-vs-%E4%BD%BF%E7%94%A8%E5%8A%A8%E6%80%81)

LLM 市场还不像商品一样行事：“价格本身几乎无法解释使用情况”。用户平衡成本与推理质量、可靠性、能力广度。

闭源模型”捕获高价值、与收入相关的工作负载”；开放模型”主导低成本和高量任务”。创建”动态平衡——一个不太由稳定性定义，更多地由来自下方的持续压力定义”。

**结果：** 开放模型不断推动”有效前沿”，特别是在推理/编码方面（例如，Kimi K2 Thinking）。每次改进都”缩小性能差距”，压缩专有定价权。

“随着时间的推移，随着质量收敛加速，价格弹性可能会增加，将差异化市场转变为更流动的市场”。

### [6\. 留存和玻璃鞋现象](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#6-%E7%95%99%E5%AD%98%E5%92%8C%E7%8E%BB%E7%92%83%E9%9E%8B%E7%8E%B0%E8%B1%A1)

基础模型进步跃进，而不是逐步进行。**留存成为真正的防御性衡量标准。** 每次突破创造”短暂的启动窗口，模型可以’契合’高价值工作负载完美”。

产品-市场契合度等于工作负载-模型契合度：“首先解决真正的痛点驱动深刻、粘性的采用，因为用户围绕能力建立工作流和习惯”。

对于构建者/投资者：要观察的信号是”留存曲线，即通过模型更新保持的基础用户群的形成”。在快速移动的市场中，“早期捕获重要的未满足需求决定了谁在下一次能力飞跃后持久”。

### [总结](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%80%BB%E7%BB%93)

LLM 正在成为”跨领域的类推理任务的基本计算基底，从编程到创意写作”。随着模型的进步和部署的扩展，“关于现实世界使用动态的准确洞察对于明智的决策至关重要”。

“人们使用 LLM 的方式并不总是与期望一致，并且因国家、州、用例而异”。通过大规模观察使用情况，该领域可以”将对 LLM 影响的理解建立在现实中，确保后续发展…与实际使用模式和需求保持一致”。

* * *

## [局限性](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%B1%80%E9%99%90%E6%80%A7)

研究反映了**单一平台**（OpenRouter）在**有限时间窗口**内的模式——仅部分生态系统视图。企业使用、本地托管部署、封闭内部系统仍然超出范围。

几项分析依赖于**代理措施：**

*   Agentic 推理通过多步骤/工具调用调用识别
*   用户地理位置从账单而非验证位置推断

结果应被解释为”指示性行为模式而非基础现象的确定性测量”。

* * *

## [结论](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E7%BB%93%E8%AE%BA)

这项实证研究提供了”大语言模型如何成为世界计算基础设施的一部分”的数据驱动视图。它们现在”是工作流、应用程序和 Agentic 系统不可或缺的一部分，改变了信息的生成、调解和消费方式”。

**过去一年催化了推理概念的阶跃变化。** _o1_ 类模型的出现”使扩展推理和工具使用正常化，将评估从单次基准转向基于过程的指标、延迟-成本权衡和编排下的任务成功”。

**关键发现：**

1.  **生态系统在结构上是多元的。** 没有单一模型/提供商主导；用户根据上下文沿多个轴（能力、延迟、价格、信任）选择系统。“异质性不是暂时阶段，而是基本市场属性”。
    
2.  **推理正在改变。** 多步骤和工具链接交互的兴起表明从”静态补全转向动态编排”的转变。用户链接模型、API、工具以实现复合目标——**Agentic 推理**。
    
3.  **地理分布。** 亚洲使用份额扩大；中国作为模型开发者/出口商出现（Moonshot AI、DeepSeek、Qwen）。非西方 OSS 成功表明”LLM 真正的全球计算资源”。
    
4.  **超越竞争。** _o1_ “没有结束竞争。远非如此。它扩大了设计空间。“该领域正在朝着”系统思维而非单一赌注、仪器化而非直觉、经验使用分析而非排行榜增量”的方向发展。
    

**下一阶段重点：** 如果过去一年证明”Agentic 推理在规模上可行”，下一步将专注于”卓越运营：衡量真实任务完成、减少分布变化下的方差，并将模型行为与生产规模工作负载的实际需求保持一致”。

* * *

## [参考文献](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E5%8F%82%E8%80%83%E6%96%87%E7%8C%AE)

1.  Appel, R., Zhao, J., Noll, C., et al. (2025). Anthropic economic index report: Uneven geographic and enterprise AI adoption. _arXiv:2511.15080_
    
2.  Chatterji, A., Cunningham, T., Deming, D.J., et al. (2025). How people use chatgpt. _NBER Working Paper 34255_
    
3.  Zhao, W., Ren, X., Hessel, J., et al. (2024). WildChat: 1M ChatGPT interaction logs in the wild. _arXiv:2405.01470_
    
4.  OpenAI. (2024). OpenAI o1 system card. _arXiv:2412.16720_
    
5.  Chiang, W.L., Zheng, L., Sheng, Y., et al. (2024). Chatbot Arena: An open platform for evaluating LLMs by human preference. _arXiv:2403.04132_
    
6.  Wei, J., Wang, X., Schuurmans, D., et al. (2022). Chain-of-thought prompting elicits reasoning in large language models. _NIPS 35_
    
7.  Yao, S., Zhao, J., Yu, D., et al. (2023). ReAct: Synergizing reasoning and acting in language models. _ICLR_
    
8.  Grattafiori, A., Dubey, A., Jauhri, A., et al. (2024). The Llama 3 Herd of Models. _arXiv:2407.21783_
    
9.  DeepSeek-AI. (2024). DeepSeek research and development.
    

* * *

## [总结](https://stellarlink.co/articles/ai-%E7%8A%B6%E6%80%81%E6%8A%A5%E5%91%8A-openrouter-100-%E4%B8%87%E4%BA%BF-token-%E5%AE%9E%E8%AF%81%E7%A0%94%E7%A9%B6#%E6%80%BB%E7%BB%93-1)

这项来自 OpenRouter 的全面 100 万亿 Token 分析表明，2025 年的 LLM 使用反映了复杂、多方面的采用模式，而不是单一部署。开源模型捕获约三分之一的 Token，特别是在角色扮演（OSS 使用的 52% 以上）和编程类别中表现出色。该领域表现出向 Agentic 推理的明显转变，推理模型 Token 超过总量的 50%，编程相关查询现在驱动 50% 以上的 Token 份额。地理多样性正在增加，亚洲达到全球使用量的 28.6%。留存分析识别出首先实现模型-市场契合度的持久”基础用户群”——灰姑娘”玻璃鞋”效应——其中与用户需求的早期对齐创造了对后来竞争对手的持久采用免疫力。尽管价格差异，成本弹性仍然很低，表明质量和能力差异化仍然占据高级定价权，而开放模型有效地服务于成本敏感、高量细分市场。研究强调，LLM 使用与仅生产力的假设有很大差异，娱乐和创意应用在规模上与专业开发工作负载相当。
