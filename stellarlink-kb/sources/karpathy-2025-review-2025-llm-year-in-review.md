---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/karpathy-2025-review-2025-llm-year-in-review"
title: 2025 LLM 年度回顾
description: 2025 LLM 年度回顾
resource: "https://stellarlink.co/articles/karpathy-2025-review-2025-llm-year-in-review"
tags: []
timestamp: "2026-06-20T06:45:49.024Z"
source_path: "https://stellarlink.co/articles/karpathy-2025-review-2025-llm-year-in-review"
source_id: affaf5f0024913883ed1c6c0746e1bf4055a89c33ffdb7c77b09fd2435a1e9cf
content_hash: 255c97a9e667c9d03c35a13f8fc8d3c9d3d269b8540221f4e36b7c056e3307f8
---

_作者：Andrej Karpathy，2025年12月19日 [2025 LLM Year in Review | karpathy](https://karpathy.bearblog.dev/year-in-review-2025)_

![unnamed](https://stellarlink.co/articles/assets/karpathy-2025-review/unnamed.webp)

**关键范式转变：**

**1\. 基于可验证奖励的强化学习 (RLVR)**

RLVR 作为一种主要的新训练阶段出现，与预训练、SFT 和 RLHF 并列。通过针对自动可验证的奖励（数学/代码谜题）进行训练，LLM 会自发地发展出推理策略。这种能力被证明比预训练更具成本效益，重新定向了计算资源。这种方法可以通过生成更长的推理轨迹来控制”测试时计算”的能力。OpenAI o1 首先展示了这一点，但 o3 的发布标志着转折点。

**2\. 幽灵 vs. 动物 / 锯齿状智能**

业界开始理解 LLM 与生物智能有着根本性的不同。LLM 是”召唤幽灵”而非”进化动物”——针对文本模仿和谜题奖励进行优化，而非生存。这创造了”锯齿状智能”，模型在作为天才通才表现出色的同时，却在基本任务上挣扎。随着 RLVR 和合成数据生成允许针对性优化，基准测试变得越来越不可靠，使得基准性能越来越不能反映真正的 AGI 进展。

![G6zymj4a0AMNJkJ](https://stellarlink.co/articles/assets/karpathy-2025-review/g6zymj4a0amnjkj.webp)

**3\. Cursor / LLM 应用的新层**

Cursor 展示了一种新的应用层，为特定垂直领域打包和编排 LLM 调用。这些应用处理上下文工程，编排复杂的多调用工作流，提供特定领域的 GUI，并提供”自主性滑块”。这创造了实验室的通用 LLM 与专业应用之间的区别，后者将 AI 团队组织成部署的专业人员，拥有私有数据和反馈循环。

**4\. Claude Code / 生活在你计算机上的 AI**

Claude Code 通过在开发者的本地计算机上运行而非云容器中，开创了 Agent 范式。这种方法利用现有的上下文、数据、秘密和配置，实现低延迟交互。Anthropic 的 CLI 优先方法与 OpenAI 的云优先策略形成对比，创造了一种新范式，其中 AI 成为生活在你的计算机上的”精神/幽灵”，而不仅仅是一个网站。

**5\. 氛围编码 (Vibe Coding)**

2025 年标志着一个阈值，AI 使得仅通过英语就能构建令人印象深刻的程序，忽略底层代码。这使编程超越了训练有素的专业人士，同时也赋能专业人士快速创建原本不会存在的软件。Karpathy 将其用于自定义工具，如 BPE 分词器和应用演示，将代码视为短暂和可丢弃的。这代表了 LLM 赋能普通人，而非公司或政府。

**6\. Nano Banana / LLM GUI**

Google 的 Nano Banana 代表了 LLM GUI 范式的早期暗示。虽然文本聊天类似于 1980 年代的命令行界面，但人类更喜欢视觉和空间信息消费。未来涉及 LLM 通过图像、信息图表、幻灯片、白板、动画和 Web 应用进行通信，而不仅仅是文本。这将文本生成、图像生成和世界知识结合成集成能力。

**TLDR：** 2025 年揭示了 LLM 作为一种新型智能——同时比预期更聪明和更笨，但极其有用。该领域仍然广阔开放，进展迅速，但要实现其潜力的 10% 仍有大量工作要做。
