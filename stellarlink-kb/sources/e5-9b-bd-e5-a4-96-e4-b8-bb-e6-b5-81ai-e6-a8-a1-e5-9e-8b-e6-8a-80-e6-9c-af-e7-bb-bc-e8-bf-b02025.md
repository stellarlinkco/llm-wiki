---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025"
title: 2025年国际AI模型对比与应用指南
description: 2025年国际AI模型对比与应用指南
resource: "https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025"
tags: []
timestamp: "2026-06-20T06:46:07.780Z"
source_path: "https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025"
source_id: 7ca80586582c07c344511d83aa6745bd7e8ec4b9cf3afb6a4917b66d672ab819
content_hash: 7ce0a3946b1555f42cb2d8cd71db2f11978ea2dbe2cf4b2eb40fb5810c816976
---

## [前言](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%89%8D%E8%A8%80)

本文对2025年主流国际AI模型进行技术对比分析，涵盖文本生成、图像生成、视频生成三个领域。文章包含基于实际使用体验的应用建议，旨在为模型选型提供参考。

**说明**：本文包含主观评价，基于公开benchmark数据和实际应用体验。

**术语说明**：文中涉及的技术术语将在各章节中解释，帮助非技术背景读者理解。

* * *

## [目录](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E7%9B%AE%E5%BD%95)

### [一、文本生成模型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%B8%80%E6%96%87%E6%9C%AC%E7%94%9F%E6%88%90%E6%A8%A1%E5%9E%8B)

1.  Claude 4系列 (Anthropic)
2.  Gemini 3 Pro (Google)
3.  GPT-5.1-codex (OpenAI，第三方数据)

### [二、图像生成模型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%BA%8C%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90%E6%A8%A1%E5%9E%8B)

1.  Nano Banana Pro (Google)
2.  Nano Banana（第一代）(Google)
3.  GPT-5 Image (OpenAI，第三方数据)
4.  Stable Diffusion 3.5 (Stability AI)
5.  FLUX.1 系列 (Black Forest Labs)
6.  Midjourney

### [三、视频生成模型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%B8%89%E8%A7%86%E9%A2%91%E7%94%9F%E6%88%90%E6%A8%A1%E5%9E%8B)

1.  Veo 3.1-Pro (Google)
2.  Sora 2 Pro (OpenAI)

* * *

## [一、文本生成模型对比分析](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%B8%80%E6%96%87%E6%9C%AC%E7%94%9F%E6%88%90%E6%A8%A1%E5%9E%8B%E5%AF%B9%E6%AF%94%E5%88%86%E6%9E%90)

### [1.1 技术背景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#11-%E6%8A%80%E6%9C%AF%E8%83%8C%E6%99%AF)

**文本生成模型**（Large Language Model, LLM）是一类能够理解和生成自然语言的AI系统。这类模型可以进行对话、代码生成、文档分析等任务。部分模型还支持多模态输入（文本、图像、视频等）。

**核心技术指标**：

*   **上下文窗口**：模型单次处理的文本容量，以tokens计量（1个中文字约等于2-3个tokens）
*   **推理延迟**：生成响应的速度
*   **API定价**：按输入/输出tokens计费

* * *

### [1.2 模型对比概览](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#12-%E6%A8%A1%E5%9E%8B%E5%AF%B9%E6%AF%94%E6%A6%82%E8%A7%88)

模型名称

开发商

核心优势

价格（美元/百万tokens）

推荐场景

Claude Sonnet 4.5

Anthropic

Agent工作流、工具调用、架构文档

Input: $3/M | Output: $15/M

多步骤自动化任务

Claude Opus 4.1

Anthropic

深度推理

Input: $15/M | Output: $75/M

复杂推理任务

Claude Haiku 4.5

Anthropic

高速低成本

Input: $1/M | Output: $5/M

高并发场景

Gemini 3 Pro

Google

前端UI生成、文档撰写、多模态

Input: $2/M | Output: $12/M

视觉理解、UI开发

GPT-5.1-codex

OpenAI

编程任务

Input: $1.25/M | Output: $10/M

专业编程

**术语解释**：

*   **Agent工作流**：AI自主执行包含多个步骤的复杂任务，如”调研竞品→分析数据→生成报告”
*   **工具调用**：AI自主决定使用外部工具（如搜索引擎、计算器、数据库）的能力
*   **多模态**：支持处理多种类型的输入数据（文本、图像、视频、音频）

* * *

### [1.3 Claude Sonnet 4.5 - Agent能力专项优化](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#13-claude-sonnet-45---agent%E8%83%BD%E5%8A%9B%E4%B8%93%E9%A1%B9%E4%BC%98%E5%8C%96)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC)

**发布时间**：2025年9月29日 **模型ID**：`claude-sonnet-4-5-20250929`

技术参数

规格

上下文窗口

200K tokens (标准) / 1M tokens (beta)

最大输出

64K tokens

API定价

Input: $3/M tokens | Output: $15/M tokens

知识截止

2025年1月(可靠) / 2025年7月(训练数据)

推理延迟

快速

#### [核心能力评估](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A0%B8%E5%BF%83%E8%83%BD%E5%8A%9B%E8%AF%84%E4%BC%B0)

根据实际应用测试，Claude Sonnet 4.5在以下领域表现突出：

**1\. Agent工作流**

*   能够自主规划和执行多步骤任务
*   工具调用的稳定性和准确性较高
*   适合构建自动化系统

**2\. 架构文档生成**

*   技术架构文档的结构化组织能力强
*   能够生成层次清晰、逻辑严谨的系统设计文档
*   适合软件工程中的文档编写任务

**3\. 扩展思考模式**

*   支持Extended Thinking功能，适合复杂推理任务
*   可处理需要深度分析的场景

#### [Benchmark表现](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#benchmark%E8%A1%A8%E7%8E%B0)

根据Google官方提供的对比数据：

测试项目

Claude Sonnet 4.5

Gemini 3 Pro

说明

学术推理（Humanity’s Last Exam）

13.7%

37.5%

Gemini领先

屏幕理解（ScreenSpot-Pro）

36.2%

72.7%

Gemini领先

软件工程（SWE-Bench Verified）

77.2%

76.2%

Claude略优

编程竞赛（LiveCodeBench Elo）

1,418

2,439

Gemini领先

**分析**：虽然在部分benchmark上落后于Gemini 3 Pro，但在实际Agent工作流和工具调用场景中，Claude Sonnet 4.5表现稳定可靠。

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF)

**推荐场景**：

*   需要AI自动完成多步骤任务的业务流程
*   技术架构文档、系统设计文档编写
*   需要自动调用多种工具（API、数据库、搜索引擎）的应用
*   复杂业务逻辑处理

**不推荐场景**：

*   前端UI设计（Gemini 3 Pro更适合）
*   纯编程性能要求极高的场景（GPT-5.1-codex更适合）
*   成本极度敏感的场景（使用Haiku 4.5）

* * *

### [1.4 Claude Opus 4.1 - 高端推理模型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#14-claude-opus-41---%E9%AB%98%E7%AB%AF%E6%8E%A8%E7%90%86%E6%A8%A1%E5%9E%8B)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-1)

**发布时间**：2025年8月5日 **模型ID**：`claude-opus-4-1-20250805`

技术参数

规格

上下文窗口

200K tokens

最大输出

32K tokens

API定价

Input: $15/M tokens | Output: $75/M tokens

知识截止

2025年1月(可靠) / 2025年3月(训练数据)

推理延迟

中等

#### [应用评估](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%BA%94%E7%94%A8%E8%AF%84%E4%BC%B0)

**历史定位**：在GPT-5.1-codex发布前，Opus 4.1在编程任务上表现优异。

**当前状态**：

*   编程领域的相对优势减弱
*   价格为Sonnet的5倍，成本效益下降
*   仍在深度推理任务中保持高质量表现

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-1)

**推荐场景**：

*   需要极高推理质量的专业任务（法律分析、学术论文评审）
*   对准确性要求极高的领域（医疗、金融）
*   长篇深度分析
*   预算充足且对质量要求严格的场景

**不推荐场景**：

*   日常编程任务（使用GPT-5.1-codex）
*   一般性工作流任务（使用Sonnet 4.5）
*   成本敏感场景（使用Haiku 4.5）

* * *

### [1.5 Claude Haiku 4.5 - 高性价比选择](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#15-claude-haiku-45---%E9%AB%98%E6%80%A7%E4%BB%B7%E6%AF%94%E9%80%89%E6%8B%A9)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-2)

**发布时间**：2025年10月1日 **模型ID**：`claude-haiku-4-5-20251001`

技术参数

规格

上下文窗口

200K tokens

最大输出

64K tokens

API定价

Input: $1/M tokens | Output: $5/M tokens

知识截止

2025年2月(可靠) / 2025年7月(训练数据)

推理延迟

最快

#### [应用评估](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%BA%94%E7%94%A8%E8%AF%84%E4%BC%B0-1)

**核心优势**：

*   成本仅为Sonnet的1/3，Opus的1/15
*   能力接近Sonnet
*   推理速度在三个变体中最快

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-2)

**推荐场景**：

*   需要大量API调用的应用（每日数千至数万次请求）
*   实时对话系统（客服机器人、实时翻译）
*   预算有限的个人开发者和初创企业
*   对响应速度要求高但不需要顶级能力的场景

* * *

### [1.6 Gemini 3 Pro - 多模态与视觉理解](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#16-gemini-3-pro---%E5%A4%9A%E6%A8%A1%E6%80%81%E4%B8%8E%E8%A7%86%E8%A7%89%E7%90%86%E8%A7%A3)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-3)

**发布时间**：2025年11月 **模型ID**：`gemini-3-pro-preview`

技术参数

规格

上下文窗口

1,048,576 tokens (1M)

最大输出

65,536 tokens

知识截止

2025年1月

API定价

Input: $2/M tokens | Output: $12/M tokens

支持数据类型

文本、图像、视频、音频、PDF

#### [核心能力](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A0%B8%E5%BF%83%E8%83%BD%E5%8A%9B)

**1\. 前端UI生成** 根据实际应用测试，Gemini 3 Pro在将自然语言描述转换为前端代码（HTML/CSS/JavaScript）的任务中表现优异，生成的代码可用性高。

**2\. 文档撰写** 生成的技术文档、用户手册、产品说明具有良好的逻辑结构和清晰的表达。

**3\. 多模态能力** 原生支持文本、图像、视频、音频、PDF的统一处理，避免模态转换的信息损失。

#### [Benchmark表现](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#benchmark%E8%A1%A8%E7%8E%B0-1)

根据Google官方提供的数据：

**学术与推理能力**：

测试项目

Gemini 3 Pro

Claude Sonnet 4.5

GPT-5.1

领先幅度

Humanity’s Last Exam (无工具)

37.5%

13.7%

26.5%

2.7倍 vs Claude

ARC-AGI-2 (视觉推理)

31.1%

13.6%

17.6%

2.3倍 vs Claude

GPQA Diamond (科学知识)

91.9%

83.4%

88.1%

领先8.5%

AIME 2025 (数学，无工具)

95.0%

87.0%

94.0%

领先8%

MathArena Apex

23.4%

1.6%

1.0%

显著领先

**多模态理解能力**：

测试项目

Gemini 3 Pro

Claude Sonnet 4.5

MMMU-Pro

81.0%

68.0%

ScreenSpot-Pro (屏幕理解)

72.7%

36.2%

CharXiv Reasoning

81.4%

68.5%

Video-MMMU

87.6%

77.8%

OmniDocBench 1.5 (OCR)

0.115

0.145

**编程与代理能力**：

测试项目

Gemini 3 Pro

Claude Sonnet 4.5

GPT-5.1

LiveCodeBench Pro (Elo)

2,439

1,418

2,243

Terminal-Bench 2.0

54.2%

42.8%

47.6%

SWE-Bench Verified

76.2%

77.2%

76.3%

τ2-bench (工具使用)

85.4%

84.7%

80.2%

**知识与多语言**：

测试项目

Gemini 3 Pro

Claude Sonnet 4.5

SimpleQA Verified

72.1%

29.3%

MMMLU (多语言)

91.8%

89.1%

MRCR v2 (128K上下文)

77.0%

47.1%

MRCR v2 (1M上下文)

26.3%

不支持

#### [长上下文性能分析](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%95%BF%E4%B8%8A%E4%B8%8B%E6%96%87%E6%80%A7%E8%83%BD%E5%88%86%E6%9E%90)

虽然支持1M tokens上下文，但测试显示性能随上下文长度增加而下降：

*   128K以内：77.0%准确率（优秀）
*   1M：26.3%准确率（明显下降）

**建议**：对于128K以内的文档，Gemini表现优异；超过此长度建议分段处理或使用Claude。

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-3)

**推荐场景**：

*   前端开发：快速生成UI原型和组件
*   视觉任务：UI界面分析、屏幕截图理解
*   文档写作：技术文档、产品说明、用户手册
*   长视频内容分析
*   需要处理多种数据类型的应用

**不推荐场景**：

*   纯编程任务（GPT-5.1-codex更优）
*   需要最高工具调用稳定性的Agent任务（Sonnet 4.5更优）

* * *

### [1.7 GPT-5.1-codex - 编程专项模型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#17-gpt-51-codex---%E7%BC%96%E7%A8%8B%E4%B8%93%E9%A1%B9%E6%A8%A1%E5%9E%8B)

**数据来源说明**：技术规格基于 OpenRouter API 数据。OpenAI 官方未公开完整技术文档。

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-4)

**发布时间**：2025年11月 **模型ID**：`gpt-5.1-codex`

技术参数

规格

上下文窗口

400,000 tokens

最大输出

128,000 tokens

API定价

Input: $1.25/M tokens | Output: $10/M tokens

支持数据类型

文本、图像输入 / 文本输出

#### [模型特性](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A8%A1%E5%9E%8B%E7%89%B9%E6%80%A7)

GPT-5.1-Codex 是 GPT-5.1 的软件工程专项优化版本，专为交互式开发和长时间独立执行复杂工程任务设计。支持从零开始构建项目、功能开发、调试、大规模重构和代码审查。

**核心能力**：

*   项目构建：支持完整软件项目的从零搭建
*   调试与重构：大规模代码库的调试和架构优化
*   代码审查：结构化代码审查，通过依赖分析和测试验证捕获关键缺陷
*   环境集成：支持 CLI、IDE 扩展、GitHub 和云任务集成
*   动态推理：小任务快速响应，大型项目可持续多小时运行
*   多模态支持：接受图像或截图输入，适合 UI 开发

#### [核心能力评估](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A0%B8%E5%BF%83%E8%83%BD%E5%8A%9B%E8%AF%84%E4%BC%B0-1)

根据实际使用反馈：

**1\. 编程能力** 在编程任务中表现优异，超越Claude Opus 4.1，成为当前编程性能较高的模型之一。

**2\. 输入质量敏感** 模型表现与输入质量高度相关。详细、结构化的需求描述能够获得更高质量的代码输出。

**3\. 代码库理解** 能够快速理解大型项目的架构和逻辑关系。

#### [Benchmark表现（来自Google对比数据）](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#benchmark%E8%A1%A8%E7%8E%B0%E6%9D%A5%E8%87%AAgoogle%E5%AF%B9%E6%AF%94%E6%95%B0%E6%8D%AE)

测试项目

GPT-5.1-codex

Claude Opus 4.1

Gemini 3 Pro

AIME 2025 (数学)

94.0%

87.0%

95.0%

LiveCodeBench Elo

2,243

\-

2,439

#### [使用建议](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%BD%BF%E7%94%A8%E5%BB%BA%E8%AE%AE)

**有效使用方法**：提供高质量输入

低质量输入示例：

```
编写一个登录功能
```

高质量输入示例：

```
编写基于JWT的用户认证系统，需求如下：
1. 用户名密码验证（使用bcrypt加密）
2. JWT Token生成（有效期24小时）
3. Token刷新机制
4. 登出功能
技术栈：Express.js + PostgreSQL
```

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-4)

**推荐场景**：

*   专业软件开发
*   算法实现
*   大规模代码重构
*   复杂bug诊断与修复

* * *

## [二、图像生成模型对比分析](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%BA%8C%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90%E6%A8%A1%E5%9E%8B%E5%AF%B9%E6%AF%94%E5%88%86%E6%9E%90)

### [2.1 技术背景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#21-%E6%8A%80%E6%9C%AF%E8%83%8C%E6%99%AF)

**图像生成模型**通过文本描述（prompt）生成图像。主流技术基于扩散模型（Diffusion Model）架构。

**核心技术指标**：

*   **画质等级**：图像细节、真实感、艺术效果
*   **提示词遵循度**：模型理解和执行文本描述的准确性
*   **生成速度**：从输入到输出的时间
*   **分辨率**：生成图像的像素尺寸

* * *

### [2.2 模型对比概览](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#22-%E6%A8%A1%E5%9E%8B%E5%AF%B9%E6%AF%94%E6%A6%82%E8%A7%88)

模型名称

开发商

画质等级

速度

价格

核心优势

Nano Banana Pro

Google

专业级

快

$0.4/图像

2K/4K输出，精细化控制

Nano Banana

Google

T0级

极快

$0.04/图像

高性价比，T0级画质

GPT-5 Image

OpenAI

T0级

快

$0.05/图像

顶级画质

Stable Diffusion 3.5

Stability AI

高

中等

免费/$0.01/图像

开源，可本地部署

FLUX.1

Black Forest Labs

高

中等

$0.04/图像

图像编辑工具丰富

Midjourney

独立开发

极高

较慢

$0.04/图像

艺术风格突出

**术语解释**：

*   **T0级**：Tier 0，业界顶级水平，表示画质达到商业应用标准
*   **开源**：代码公开，可免费下载并在本地运行
*   **扩散模型**：一类通过逐步去噪过程生成图像的AI架构
*   **提示词（Prompt）**：用户提供的文本描述，用于指导AI生成内容

* * *

### [2.3 Nano Banana Pro - 专业级图像生成与编辑](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#23-nano-banana-pro---%E4%B8%93%E4%B8%9A%E7%BA%A7%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90%E4%B8%8E%E7%BC%96%E8%BE%91)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-5)

**全名**：Gemini 3 Pro Image Preview **开发商**：Google **发布时间**：2025年11月20日 **模型ID**：`gemini-3-pro-image-preview`

技术参数

规格

上下文窗口

65.5k tokens 输入 /32.8k tokens 输出

支持数据类型

输入：图像+文本 / 输出：图像+文本

知识截止

2025年6月

分辨率支持

2K/4K输出，灵活宽高比

定价

Input $2 / Output  $12

#### [技术特点](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E7%89%B9%E7%82%B9)

Nano Banana Pro 是 Google 基于 Gemini 3 Pro 构建的高级图像生成与编辑模型，相比第一代 Nano Banana 在多模态推理、真实世界理解和高保真视觉合成方面实现显著提升。

**核心能力**：

1.  **文本渲染领先**
    
    *   支持图像内长文本渲染
    *   多语言版式准确
    *   业界领先的文本-图像一致性
2.  **多元素合成**
    
    *   支持最多5个主体的身份一致性保持
    *   多图像混合能力
    *   适合复杂构图需求
3.  **精细化控制**
    
    *   局部编辑（指定区域修改）
    *   光照和焦点调整
    *   相机视角变换
    *   2K/4K高分辨率输出
4.  **实时信息整合**
    
    *   可通过 Search grounding 整合实时网络信息
    *   适合制作信息图表、数据可视化
    *   支持产品效果图渲染

#### [应用评估](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%BA%94%E7%94%A8%E8%AF%84%E4%BC%B0-2)

**相比第一代的提升**：

*   画质：从 T0 级提升至专业级
*   编辑能力：新增局部编辑、光照控制等精细化工具
*   输出规格：支持 2K/4K，突破第一代分辨率限制
*   多模态理解：基于 Gemini 3 Pro 的推理能力，理解复杂场景描述

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-5)

**推荐场景**：

*   专业设计：产品可视化、故事板制作
*   信息图表：数据可视化、图表生成
*   商业海报：高分辨率印刷品设计
*   复杂构图：多主体、多元素组合场景
*   需要文本渲染的场景（海报、标语、UI mockup）

**不推荐场景**：

*   对成本极度敏感的应用（使用第一代 Nano Banana）
*   艺术风格特化需求（使用 Midjourney）

* * *

### [2.4 Nano Banana（第一代）- 性价比图像生成](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#24-nano-banana%E7%AC%AC%E4%B8%80%E4%BB%A3--%E6%80%A7%E4%BB%B7%E6%AF%94%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-6)

**全名**：Gemini 2.5 Flash Image **开发商**：Google **发布时间**：2025年10月

技术参数

规格

上下文窗口

65,536 tokens输入 / 32,768 tokens输出

支持数据类型

输入：图像+文本 / 输出：图像+文本

知识截止

2025年6月

#### [应用评估](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%BA%94%E7%94%A8%E8%AF%84%E4%BC%B0-3)

**核心优势**：

*   画质达到T0级别，可直接用于商业场景（活动页面、海报设计）
*   生成速度快，适合需要快速迭代的设计流程
*   模型轻量化，运行成本相对较低

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-6)

**推荐场景**：

*   快速设计原型生成
*   电商活动页面配图
*   社交媒体内容制作
*   视频起始帧生成（配合Veo 3.1）

**不推荐场景**：

*   高精度印刷品（建议使用GPT-5 Image）
*   极致艺术效果（建议使用Midjourney）
*   复杂图像编辑（建议使用FLUX.1）

* * *

### [2.5 GPT-5 Image - 高质量图像生成](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#25-gpt-5-image---%E9%AB%98%E8%B4%A8%E9%87%8F%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90)

**数据来源说明**：技术规格基于 OpenRouter API 数据。OpenAI 官方未公开完整技术文档。

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-7)

**开发商**：OpenAI **发布时间**：2025年10月 **模型ID**：`gpt-5-image`

技术参数

规格

上下文窗口

400,000 tokens

最大输出

128,000 tokens

支持数据类型

输入：文本+图像+文件 / 输出：文本+图像

定价

Input & Output: $10/M tokens | Image: $0.01/生成

#### [核心特点](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A0%B8%E5%BF%83%E7%89%B9%E7%82%B9)

GPT-5 Image 结合了 OpenAI 最先进的语言模型与 GPT Image 1 的图像生成能力，在推理能力、代码质量和用户体验方面实现重大改进，同时提供优秀的指令遵循度、文本渲染质量和精细化图像编辑功能。

#### [应用评估](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%BA%94%E7%94%A8%E8%AF%84%E4%BC%B0-4)

**核心优势**：

*   画质达到T0级别
*   细节丰富，质感真实
*   适合正式商业场景
*   对复杂提示词的理解能力强

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-7)

**推荐场景**：

*   商业海报和广告设计
*   产品设计原型
*   高质量内容创作
*   对画质要求严格的应用

* * *

### [2.6 Stable Diffusion 3.5 - 开源方案](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#26-stable-diffusion-35---%E5%BC%80%E6%BA%90%E6%96%B9%E6%A1%88)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-8)

**开发商**：Stability AI **发布时间**：2024年 **许可证**：开源，可商用

#### [模型变体](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A8%A1%E5%9E%8B%E5%8F%98%E4%BD%93)

版本

特点

适用场景

Large

最高画质，1百万像素

专业设计

Turbo

4步生成，速度快

快速迭代

Medium

平衡版本

消费级硬件

#### [技术特点](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E7%89%B9%E7%82%B9-1)

*   完全开源，代码和模型权重公开
*   无API调用费用
*   社区生态成熟，插件和扩展丰富
*   支持本地部署，数据完全自主

#### [部署选项](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%83%A8%E7%BD%B2%E9%80%89%E9%A1%B9)

1.  自托管部署：完全控制，深度定制
2.  API服务：通过第三方平台调用
3.  云合作伙伴：在云平台上使用
4.  Stable Assistant：官方网页平台

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-8)

**推荐场景**：

*   数据隐私要求高的项目
*   预算有限或零预算
*   需要深度定制的应用
*   学习AI图像生成技术

**限制**：

*   需要一定的技术能力进行配置
*   需要GPU硬件支持
*   相比闭源模型，基础版本的提示词理解能力稍弱

* * *

### [2.7 FLUX.1 - 模块化图像工具](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#27-flux1---%E6%A8%A1%E5%9D%97%E5%8C%96%E5%9B%BE%E5%83%8F%E5%B7%A5%E5%85%B7)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-9)

**开发商**：Black Forest Labs **许可证**：FLUX Dev License（开源版），商业版另有API

#### [核心版本](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A0%B8%E5%BF%83%E7%89%88%E6%9C%AC)

1.  **FLUX.1 \[pro\]**：商业API，性能最优
2.  **FLUX.1 \[dev\]**：开源版本，社区可用

#### [工具套件](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%B7%A5%E5%85%B7%E5%A5%97%E4%BB%B6)

FLUX.1提供四个专项工具，每个针对特定的图像处理任务：

工具名称

功能

实际应用

Benchmark表现

FLUX.1 Fill

图像修复与扩展

去除水印、局部编辑、边界扩展

当前最优修复模型

FLUX.1 Depth

深度引导

保持结构，更换材质或风格

超越Midjourney ReTexture

FLUX.1 Canny

边缘引导

保持构图，更换内容

\[pro\]版本业内领先

FLUX.1 Redux

风格重塑

图像变体、风格转换

达到SOTA水平

**术语解释**：

*   **Inpainting（修复）**：编辑图像的指定区域
*   **Outpainting（扩展）**：延伸图像边界，增加画面范围
*   **SOTA**：State-of-the-Art，当前技术最优水平

#### [技术优势](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E4%BC%98%E5%8A%BF)

根据官方benchmark测试：

*   FLUX.1 Fill超越Ideogram 2.0和开源竞品
*   FLUX.1 Depth在深度感知任务上表现稳定
*   FLUX.1 Canny在结构引导方面领先
*   FLUX.1 Redux在图像变体生成达到业界领先水平

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-9)

**推荐场景**：

*   图像后期编辑（修复、换背景、去水印）
*   风格转换（照片转油画、素描转彩色）
*   设计方案快速迭代
*   基于开源进行二次开发

* * *

### [2.8 Midjourney - 艺术风格特化](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#28-midjourney---%E8%89%BA%E6%9C%AF%E9%A3%8E%E6%A0%BC%E7%89%B9%E5%8C%96)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-10)

**使用方式**：Discord or API **定价**：订阅制 **最新版本**：MJ\_Turbo\_Modal

#### [应用评估](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%BA%94%E7%94%A8%E8%AF%84%E4%BC%B0-5)

**核心优势**：

*   美学质量高，艺术感强
*   在概念艺术和插画领域表现突出
*   社区活跃，作品参考丰富

#### [技术限制](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E9%99%90%E5%88%B6)

*   物理准确性（光影、透视）相对较弱
*   提示词遵循度低于部分竞品
*   不适合需要高度写实的应用

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-10)

**推荐场景**：

*   艺术创作、插画设计
*   游戏、影视的概念设计
*   追求艺术风格而非物理准确性的项目

**不推荐场景**：

*   需要写实照片效果（使用Nano Banana或GPT-5 Image）
*   成本敏感项目（使用Stable Diffusion）

* * *

## [三、视频生成模型对比分析](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%B8%89%E8%A7%86%E9%A2%91%E7%94%9F%E6%88%90%E6%A8%A1%E5%9E%8B%E5%AF%B9%E6%AF%94%E5%88%86%E6%9E%90)

### [3.1 技术背景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#31-%E6%8A%80%E6%9C%AF%E8%83%8C%E6%99%AF)

**视频生成模型**通过文本描述生成短视频内容。

**技术现状**：

*   最大时长：约10秒（Sora 2 Pro）
*   分辨率：720p至4K
*   应用场景：主要用于原型验证、创意展示，尚不适合正式生产环境

* * *

### [3.2 模型对比概览](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#32-%E6%A8%A1%E5%9E%8B%E5%AF%B9%E6%AF%94%E6%A6%82%E8%A7%88)

模型名称

开发商

视频时长

分辨率

核心特点

Veo 3.1-Pro

Google

8秒

1080p

原生音频生成，多种控制方式

Sora 2 Pro

OpenAI

5-10秒

4K

音视频同步，物理模拟，Cameos功能

**重要提示**：视频生成技术存在以下限制：

*   时长限制严格
*   生成成本高（估算数美元/视频）
*   复杂场景质量不稳定
*   不建议用于正式商业项目

* * *

### [3.3 Veo 3.1-Pro - Google视频生成方案](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#33-veo-31-pro---google%E8%A7%86%E9%A2%91%E7%94%9F%E6%88%90%E6%96%B9%E6%A1%88)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-11)

**开发商**：Google DeepMind **发布时间**：2025年 **模型ID**：`veo-3.1-generate-preview`

技术参数

规格

视频时长

8秒

分辨率

720p或1080p

音频

原生生成

帧率

待确认

#### [核心功能](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A0%B8%E5%BF%83%E5%8A%9F%E8%83%BD)

**1\. 文本到视频生成** 支持自然语言描述生成视频，涵盖多种视觉风格（写实、动画、电影感等）。

**2\. 视频扩展** 可基于已生成的视频片段进行扩展。

**3\. 帧特定生成** 允许指定首帧和末帧，AI自动生成中间过渡。

**4\. 图像引导生成** 支持使用最多3张参考图像引导视频生成，保持风格一致性。

#### [工作流示例](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%A4%BA%E4%BE%8B)

图像到视频流程：

```
步骤1：使用Nano Banana生成起始图像
步骤2：将图像输入Veo 3.1，指定运动描述
步骤3：生成8秒视频片段
```

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-11)

**推荐场景**：

*   广告创意原型制作
*   产品展示视频
*   社交媒体短视频内容
*   创意方案验证

**不推荐场景**：

*   长视频制作（超过8秒）
*   复杂剧情表现（多场景切换、人物对话）
*   需要极高精度的应用（人物细节、快速运动）
*   正式商业项目（质量稳定性有待提升）

* * *

### [3.4 Sora 2 Pro - OpenAI视频音频生成方案](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#34-sora-2-pro---openai%E8%A7%86%E9%A2%91%E9%9F%B3%E9%A2%91%E7%94%9F%E6%88%90%E6%96%B9%E6%A1%88)

#### [技术规格](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E8%A7%84%E6%A0%BC-12)

**开发商**：OpenAI **发布时间**：2025年9月30日 **模型系列**：Sora 2 (标准版) / Sora 2 Pro (高品质版)

技术参数

规格

视频时长

5-10秒（示例显示）

分辨率

最高 4K

音频

原生音视频同步生成

访问方式

iOS 应用 / sora.com / ChatGPT Pro (Sora 2 Pro)

API

计划发布

可用地区

美国、加拿大（逐步扩展）

定价

初期免费，计算资源受限

#### [核心能力](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%A0%B8%E5%BF%83%E8%83%BD%E5%8A%9B-1)

**1\. 物理准确性突破**

Sora 2 在遵循物理定律方面实现显著提升。早期视频模型会扭曲现实以满足文本指令（如篮球未中时会”传送”到篮筐），而 Sora 2 能正确模拟物理反弹、重力、浮力与刚性动态。模型能演绎奥运级体操动作、冲浪板后空翻等复杂物理场景。

**2\. 音视频同步生成**

作为通用音视频生成系统，Sora 2 能以高度逼真度创作：

*   复杂的背景音景
*   人声对话（支持对话与口型同步）
*   环境音效（如风切变、冰川崩裂）

**3\. 高级可控性**

*   执行跨越多个镜头的复杂指令
*   精确维持世界状态
*   支持写实风格、电影风格、动漫风格

**4\. Cameos（客串）功能**

用户可通过一次简短的视频音频录制捕捉形象特征，将真实的自己或朋友精准置入任何 Sora 场景。该功能具有高度通用性，适用于人类、动物或物体。

#### [技术特点](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%8A%80%E6%9C%AF%E7%89%B9%E7%82%B9-2)

根据 OpenAI 官方发布信息：

**从 Sora 1 到 Sora 2 的演进**：

*   Sora 1（2024年2月）：视频领域的 GPT-1 时刻，实现物体恒常性等基础行为
*   Sora 2（2025年9月）：接近 GPT-3.5 式突破，能完成前代无法实现的任务

**物理模拟能力**：

*   能建模失败场景，而非仅模拟成功（如投篮未中会正确反弹）
*   模型产生的”错误”往往源于内部智能体失误，而非物理定律违背
*   对实用世界模拟器至关重要

**身份还原技术**： 通过观察队友的视频，模型能精准还原其外貌与声音，植入任何 Sora 生成的环境中。

#### [部署形式](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%83%A8%E7%BD%B2%E5%BD%A2%E5%BC%8F)

**1\. Sora iOS 应用**

*   社交应用形式，支持创作、混搭、分享
*   可定制信息流发现新视频
*   Cameos 功能将用户融入场景

**2\. sora.com 网页访问**

*   标准 Sora 2 模型免费开放
*   充裕的初始配额供用户探索

**3\. Sora 2 Pro**

*   ChatGPT Pro 用户专享
*   实验性高品质模型
*   未来将支持 iOS 应用

**4\. API**

*   计划发布（时间待定）
*   Sora 1 Turbo 继续可用

#### [适用场景](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%80%82%E7%94%A8%E5%9C%BA%E6%99%AF-12)

**推荐场景**：

*   短视频内容创作（社交媒体）
*   创意原型制作
*   需要音视频同步的场景
*   个性化视频生成（Cameos 功能）
*   电影级视觉效果预览

**不推荐场景**：

*   长视频制作（时长限制 5-10秒）
*   需要精确控制每一帧的专业制作
*   计算资源充足性敏感的商业项目（当前供应受限）

#### [限制与注意事项](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E9%99%90%E5%88%B6%E4%B8%8E%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

根据 OpenAI 官方声明：

*   模型仍存在错误，远非完美
*   当前计算资源受限，需求超过供应
*   初期免费，未来可能为额外生成提供付费选项
*   安全机制：肖像使用授权、来源追溯、有害内容防范

* * *

## [四、应用场景选型指南](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9B%9B%E5%BA%94%E7%94%A8%E5%9C%BA%E6%99%AF%E9%80%89%E5%9E%8B%E6%8C%87%E5%8D%97)

### [4.1 按任务类型选型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#41-%E6%8C%89%E4%BB%BB%E5%8A%A1%E7%B1%BB%E5%9E%8B%E9%80%89%E5%9E%8B)

#### [场景1：Agent系统开发](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF1agent%E7%B3%BB%E7%BB%9F%E5%BC%80%E5%8F%91)

**首选**：Claude Sonnet 4.5

*   理由：工具调用稳定性高，多步骤任务规划能力强
*   适合：自动化工作流、智能助手系统

**备选**：Gemini 3 Pro

*   理由：多模态能力强，可处理图像、视频输入
*   适合：需要视觉理解的Agent系统

* * *

#### [场景2：专业软件开发](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF2%E4%B8%93%E4%B8%9A%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91)

**首选**：GPT-5.1-codex

*   理由：编程性能较高
*   适合：算法实现、系统开发、性能优化

**备选**：Claude Sonnet 4.5

*   理由：编程能力强，架构文档生成优秀
*   适合：需要同时生成代码和文档的项目

**备选**：Gemini 3 Pro

*   理由：LiveCodeBench Elo评分高
*   适合：算法竞赛、算法题求解

* * *

#### [场景3：前端UI开发](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF3%E5%89%8D%E7%AB%AFui%E5%BC%80%E5%8F%91)

**唯一推荐**：Gemini 3 Pro

*   理由：UI代码生成能力突出，生成代码可用性高
*   适合：快速原型开发、UI组件生成

* * *

#### [场景4：文档编写](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF4%E6%96%87%E6%A1%A3%E7%BC%96%E5%86%99)

**首选**：Gemini 3 Pro

*   理由：文档结构化组织能力强
*   适合：技术文档、产品说明、用户手册

**备选**：Claude Sonnet 4.5

*   理由：架构文档生成质量高
*   适合：系统设计文档、技术规范文档

* * *

#### [场景5：活动页面配图](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF5%E6%B4%BB%E5%8A%A8%E9%A1%B5%E9%9D%A2%E9%85%8D%E5%9B%BE)

**首选**：Nano Banana（第一代）

*   理由：T0级画质，生成速度快，成本相对低（$0.001/图像）
*   适合：大批量生成、快速迭代、成本敏感场景

**备选**：Nano Banana Pro

*   理由：专业级画质，2K/4K输出，精细化控制
*   适合：高质量商业设计、需要文本渲染的海报

**备选**：GPT-5 Image

*   理由：顶级画质
*   适合：对质量要求极高的商业设计

* * *

#### [场景6：图像编辑](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF6%E5%9B%BE%E5%83%8F%E7%BC%96%E8%BE%91)

**唯一推荐**：FLUX.1

*   理由：提供完整的图像编辑工具套件
*   适合：修复、换背景、去水印、风格转换

* * *

#### [场景7：艺术创作](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF7%E8%89%BA%E6%9C%AF%E5%88%9B%E4%BD%9C)

**首选**：Midjourney

*   理由：艺术风格表现突出
*   适合：概念艺术、插画设计

**备选**：Stable Diffusion 3.5

*   理由：开源免费，社区资源丰富
*   适合：预算有限、需要定制化的项目

* * *

#### [场景8：短视频生成](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF8%E7%9F%AD%E8%A7%86%E9%A2%91%E7%94%9F%E6%88%90)

**首选**：Veo 3.1-Pro

*   理由：8秒1080p，原生音频，多种控制方式
*   适合：广告原型、产品展示、社交媒体内容

**备选**：Sora 2 Pro

*   理由：4K高分辨率，音视频同步，物理模拟准确，支持Cameos个性化功能
*   适合：高质量社交媒体内容、个性化视频创作、电影级视觉效果预览

* * *

#### [场景9：成本敏感应用](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9C%BA%E6%99%AF9%E6%88%90%E6%9C%AC%E6%95%8F%E6%84%9F%E5%BA%94%E7%94%A8)

**文本模型首选**：Claude Haiku 4.5

*   理由：每百万tokens仅$1，性价比高
*   适合：高并发、大规模调用、实时对话

**图像模型首选**：Stable Diffusion 3.5

*   理由：完全免费，开源
*   适合：本地部署、数据隐私、零预算项目

* * *

### [4.2 选型决策表](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#42-%E9%80%89%E5%9E%8B%E5%86%B3%E7%AD%96%E8%A1%A8)

#### [文本模型选型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%96%87%E6%9C%AC%E6%A8%A1%E5%9E%8B%E9%80%89%E5%9E%8B)

需求

推荐模型

理由

Agent/自动化

Claude Sonnet 4.5

工具调用稳定

专业编程

GPT-5.1-codex

编程性能高

前端UI

Gemini 3 Pro

UI代码生成能力强

文档写作

Gemini 3 Pro

结构化组织能力强

架构文档

Claude Sonnet 4.5

架构文档质量高

高并发

Claude Haiku 4.5

成本低速度快

长文档(<128K)

Gemini 3 Pro

准确率高

长文档(>128K)

Claude Sonnet 4.5

性能稳定

#### [图像模型选型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%9B%BE%E5%83%8F%E6%A8%A1%E5%9E%8B%E9%80%89%E5%9E%8B)

需求

推荐模型

理由

专业设计/高分辨率

Nano Banana Pro

2K/4K输出，精细化控制

活动页配图

Nano Banana（第一代）

T0级画质，速度快

高质量设计

GPT-5 Image

顶级画质

图像编辑

FLUX.1

工具全面

艺术创作

Midjourney

艺术风格突出

本地部署

Stable Diffusion 3.5

开源免费

#### [视频模型选型](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E8%A7%86%E9%A2%91%E6%A8%A1%E5%9E%8B%E9%80%89%E5%9E%8B)

需求

推荐模型

理由

短视频(8秒)

Veo 3.1-Pro

原生音频，多控制方式

高质量短视频

Sora 2 Pro

4K分辨率，音视频同步，物理模拟

* * *

## [五、技术发展趋势](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%BA%94%E6%8A%80%E6%9C%AF%E5%8F%91%E5%B1%95%E8%B6%8B%E5%8A%BF)

### [5.1 当前技术特点](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#51-%E5%BD%93%E5%89%8D%E6%8A%80%E6%9C%AF%E7%89%B9%E7%82%B9)

#### [1\. Agent能力成为竞争重点](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#1-agent%E8%83%BD%E5%8A%9B%E6%88%90%E4%B8%BA%E7%AB%9E%E4%BA%89%E9%87%8D%E7%82%B9)

所有主流文本模型都在强化Agent能力，包括工具调用、多步骤规划、自主决策等功能。Claude Sonnet 4.5目前在实际应用中表现较为稳定。

#### [2\. 多模态融合加速](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#2-%E5%A4%9A%E6%A8%A1%E6%80%81%E8%9E%8D%E5%90%88%E5%8A%A0%E9%80%9F)

Gemini 3 Pro已实现文本、图像、视频、音频的统一处理。未来趋势是不再区分”文本AI”、“图像AI”，而是统一的多模态系统。

#### [3\. 长上下文能力的技术挑战](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#3-%E9%95%BF%E4%B8%8A%E4%B8%8B%E6%96%87%E8%83%BD%E5%8A%9B%E7%9A%84%E6%8A%80%E6%9C%AF%E6%8C%91%E6%88%98)

虽然多个模型支持100万tokens上下文，但实测显示超长上下文下性能会下降。如Gemini在1M上下文下准确率从77%降至26.3%。

#### [4\. 图像生成质量提升](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#4-%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90%E8%B4%A8%E9%87%8F%E6%8F%90%E5%8D%87)

Nano Banana和GPT-5 Image达到T0级画质，生成的图像可直接用于商业场景。但视频生成仍处于早期阶段，质量和时长都有显著限制。

#### [5\. 开源与闭源竞争格局](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#5-%E5%BC%80%E6%BA%90%E4%B8%8E%E9%97%AD%E6%BA%90%E7%AB%9E%E4%BA%89%E6%A0%BC%E5%B1%80)

*   闭源模型（Claude、Gemini、GPT）：能力领先，但成本较高
*   开源模型（Stable Diffusion、FLUX）：免费可定制，但能力存在15-20%差距

* * *

## [六、常见问题](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%85%AD%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)

### [Q1：模型如何收费？](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#q1%E6%A8%A1%E5%9E%8B%E5%A6%82%E4%BD%95%E6%94%B6%E8%B4%B9)

**主要收费模式**：

1.  **按使用量**（API调用）
    
    *   以tokens为单位计费
    *   示例：Claude Sonnet 4.5为$3/M input tokens
    *   1个中文字约等于2-3个tokens
2.  **订阅制**
    
    *   固定月费
    *   示例：Midjourney采用订阅制

**成本对比**（从低到高）：

1.  Stable Diffusion 3.5（免费）
2.  Claude Haiku 4.5 (Input: $1/M)
3.  Claude Sonnet 4.5 (Input: $3/M)
4.  Claude Opus 4.1 (Input: $15/M)

* * *

### [Q2：什么是”上下文窗口”？](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#q2%E4%BB%80%E4%B9%88%E6%98%AF%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AA%97%E5%8F%A3)

**定义**：模型单次处理的文本容量上限。

**容量对照**：

*   20万tokens ≈ 一本中等长度小说（约7-10万中文字）
*   100万tokens ≈ 5本小说

**影响**：上下文窗口越大，模型能处理的文档越长，但可能出现性能下降。

* * *

### [Q3：Benchmark测试的可信度如何？](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#q3benchmark%E6%B5%8B%E8%AF%95%E7%9A%84%E5%8F%AF%E4%BF%A1%E5%BA%A6%E5%A6%82%E4%BD%95)

**可信部分**：

*   反映模型在特定任务上的相对能力
*   可作为初步筛选的参考

**局限性**：

*   厂商可能针对特定测试进行优化
*   实际应用场景可能与测试环境不同
*   单一厂商提供的对比数据可能存在偏向

**建议**：

*   结合benchmark和实际试用
*   参考多个独立来源的评测
*   在实际业务场景中验证

* * *

### [Q4：视频AI是否可用于商业项目？](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#q4%E8%A7%86%E9%A2%91ai%E6%98%AF%E5%90%A6%E5%8F%AF%E7%94%A8%E4%BA%8E%E5%95%86%E4%B8%9A%E9%A1%B9%E7%9B%AE)

**当前不建议**，原因：

*   时长限制（Veo最多8秒，Sora 2 Pro最多10秒）
*   成本高（估算数美元/视频）
*   质量不稳定
*   复杂场景表现差

**适合的用途**：

*   广告创意原型
*   产品展示demo
*   社交媒体短视频

**不适合的用途**：

*   正式商业项目
*   长视频制作
*   需要精确控制的场景

* * *

### [Q5：开源模型与闭源模型的差距？](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#q5%E5%BC%80%E6%BA%90%E6%A8%A1%E5%9E%8B%E4%B8%8E%E9%97%AD%E6%BA%90%E6%A8%A1%E5%9E%8B%E7%9A%84%E5%B7%AE%E8%B7%9D)

**能力差距**：约15-20%（基于综合benchmark）

**闭源模型优势**：

*   能力更强
*   使用简单（API调用）
*   持续更新维护

**闭源模型劣势**：

*   需要付费
*   数据上传至云端
*   依赖厂商服务

**开源模型优势**：

*   完全免费
*   可本地运行（数据隐私）
*   可深度定制

**开源模型劣势**：

*   能力相对较弱
*   需要技术能力配置
*   需要硬件支持（GPU）

**选择建议**：

*   商业项目：使用闭源模型
*   学习研究/隐私敏感：使用开源模型

* * *

### [Q6：什么是Agent？](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#q6%E4%BB%80%E4%B9%88%E6%98%AFagent)

**定义**：能够自主执行包含多个步骤的复杂任务的AI系统。

**对比**：

**普通AI**：

```
用户：今天天气如何？
AI：晴天，25度
```

**Agent AI**：

```
用户：帮我规划周末旅行
AI：
1. 查询你所在城市的天气预报
2. 根据天气推荐适合的景点
3. 搜索酒店和交通选项
4. 生成完整旅行计划文档
```

**当前最佳Agent模型**：Claude Sonnet 4.5

* * *

### [Q7：如何编写有效的提示词？](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#q7%E5%A6%82%E4%BD%95%E7%BC%96%E5%86%99%E6%9C%89%E6%95%88%E7%9A%84%E6%8F%90%E7%A4%BA%E8%AF%8D)

**提示词质量直接影响生成效果。**

**低质量示例**：

```
一只猫
```

**高质量示例**：

```
一只橘色短毛猫，戴蓝色围巾，坐在木质书桌上。
背景：温馨书房，柔和阳光从窗户照入。
风格：写实照片，高清，电影感。
```

**有效提示词结构**：

1.  **主体**：核心对象（人物、物品、场景）
2.  **细节**：颜色、材质、动作、表情
3.  **背景**：环境设置、氛围
4.  **风格**：写实、油画、动漫、素描等
5.  **质量要求**：高清、4K、专业摄影等

* * *

## [七、数据来源与方法论](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%B8%83%E6%95%B0%E6%8D%AE%E6%9D%A5%E6%BA%90%E4%B8%8E%E6%96%B9%E6%B3%95%E8%AE%BA)

### [7.1 数据来源](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#71-%E6%95%B0%E6%8D%AE%E6%9D%A5%E6%BA%90)

**已验证来源**：

1.  Anthropic Claude官方文档
2.  Google Gemini API官方文档
3.  Google Veo/Imagen官方文档
4.  OpenAI Sora官方文档
5.  Stability AI官方网站
6.  Black Forest Labs官方网站
7.  OpenRouter API（第三方聚合平台，提供GPT-5.1-codex和GPT-5 Image数据）

**对比数据来源**：

*   Google官方benchmark对比表（包含GPT-5.1、Claude、Gemini对比）

* * *

### [7.2 方法论说明](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#72-%E6%96%B9%E6%B3%95%E8%AE%BA%E8%AF%B4%E6%98%8E)

#### [数据处理原则](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86%E5%8E%9F%E5%88%99)

1.  **优先使用官方数据**：来自厂商官方文档的技术参数和benchmark结果
2.  **标注非官方信息**：明确标注数据受限、基于用户反馈等来源
3.  **保持透明性**：说明数据局限性和可能的偏差

#### [主观评价依据](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%B8%BB%E8%A7%82%E8%AF%84%E4%BB%B7%E4%BE%9D%E6%8D%AE)

本文包含的主观评价基于：

1.  官方benchmark测试结果
2.  实际应用测试体验
3.  用户社区反馈
4.  技术文档分析

#### [Benchmark局限性](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#benchmark%E5%B1%80%E9%99%90%E6%80%A7)

**已知限制**：

*   单一测试不能全面反映模型能力
*   厂商可能针对特定测试优化
*   测试环境与实际应用场景可能存在差异
*   单一厂商提供的对比数据可能存在偏向性

**使用建议**：

*   将benchmark作为初步参考
*   结合多个独立来源的评测
*   在实际应用场景中验证
*   关注与自身应用相关的测试指标

* * *

## [八、术语表](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%85%AB%E6%9C%AF%E8%AF%AD%E8%A1%A8)

术语

定义

说明

LLM

Large Language Model

大语言模型，处理和生成自然语言的AI系统

Agent

智能代理

能自主执行多步骤任务的AI系统

上下文窗口

Context Window

模型单次处理的文本容量上限

Token

文本处理单位

模型处理文本的基本单位，1个中文字约2-3个tokens

Benchmark

基准测试

评估AI模型能力的标准化测试

多模态

Multimodal

能处理多种数据类型（文本、图像、视频、音频）的能力

开源

Open Source

代码公开，可免费使用和修改

闭源

Closed Source

代码不公开，仅通过API或客户端使用

API

Application Programming Interface

应用程序接口，程序间交互的标准方式

Prompt

提示词

用户提供给AI的输入指令或描述

推理

Inference

AI模型处理输入并生成输出的过程

T0级

Tier 0

业界最高级别，表示性能达到商业应用标准

SOTA

State-of-the-Art

当前技术最优水平

Elo评分

Elo Rating

相对能力评估系统，分数越高表示能力越强

扩散模型

Diffusion Model

通过逐步去噪生成内容的AI架构

Inpainting

图像修复

编辑和填充图像指定区域的技术

Outpainting

图像扩展

延伸图像边界的技术

* * *

## [九、结论](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E4%B9%9D%E7%BB%93%E8%AE%BA)

### [9.1 核心发现](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#91-%E6%A0%B8%E5%BF%83%E5%8F%91%E7%8E%B0)

基于本文分析，2025年国际AI模型格局呈现以下特点：

**文本模型**：

*   Claude Sonnet 4.5在Agent工作流和工具调用方面表现稳定
*   Gemini 3 Pro在多数benchmark上领先，特别是视觉理解和多模态任务
*   GPT-5.1-codex在编程领域性能较高（但数据来源受限）

**图像模型**：

*   Nano Banana和GPT-5 Image达到T0级画质
*   FLUX.1提供完整的图像编辑工具套件
*   Stable Diffusion保持开源领域领先地位
*   Midjourney在艺术风格方面具有独特优势

**视频模型**：

*   技术仍处早期阶段，存在时长、成本、质量等多重限制
*   Veo 3.1-Pro和Sora 2 Pro为当前主要选择
*   不建议用于正式商业项目

* * *

### [9.2 选型原则](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#92-%E9%80%89%E5%9E%8B%E5%8E%9F%E5%88%99)

**没有绝对最佳的模型，只有最适合特定场景的模型。**

选型需综合考虑：

1.  任务类型和技术要求
2.  性能需求（质量、速度、准确性）
3.  成本预算
4.  部署方式（云API或本地部署）
5.  定制化需求
6.  数据隐私要求

* * *

### [9.3 使用建议](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#93-%E4%BD%BF%E7%94%A8%E5%BB%BA%E8%AE%AE)

1.  **参考benchmark但不依赖benchmark**：将测试结果作为初步筛选依据，最终通过实际应用验证
    
2.  **关注官方更新**：AI领域发展迅速，建议定期查阅官方文档获取最新信息
    
3.  **实际测试验证**：在正式采用前，在实际业务场景中进行小规模测试
    
4.  **成本效益分析**：评估模型性能提升与成本增加的平衡点
    
5.  **保持技术中立**：根据实际需求选择，而非品牌偏好
    

* * *

## [免责声明](https://stellarlink.co/articles/%E5%9B%BD%E5%A4%96%E4%B8%BB%E6%B5%81ai%E6%A8%A1%E5%9E%8B%E6%8A%80%E6%9C%AF%E7%BB%BC%E8%BF%B02025#%E5%85%8D%E8%B4%A3%E5%A3%B0%E6%98%8E)

1.  **数据完整性**：本文基于公开信息撰写。
    
2.  **时效性**：本文数据截至2025年11月，AI领域发展迅速，建议定期更新信息。
    
3.  **主观评价**：文中包含基于实际使用体验的主观评价，仅供参考。
    
4.  **Benchmark局限**：benchmark数据可能存在测试条件差异，实际应用表现可能不同。
    
5.  **独立验证**：建议读者在实际应用前：
    
    *   查阅官方最新文档
    *   参考多个独立评测来源
    *   进行业务场景实测
    *   评估成本与性能的平衡
6.  **数据隐私**：使用云端API时需注意数据隐私政策，敏感数据建议本地部署。
    

* * *

**官方文档链接**：

*   Claude: [https://docs.anthropic.com](https://docs.anthropic.com/)
*   Gemini: [https://ai.google.dev](https://ai.google.dev/)
*   OpenAI: [https://openai.com](https://openai.com/)

**作者声明**：本文为独立技术分析，不代表任何厂商立场。包含的主观评价基于公开数据和实际使用经验，供读者参考。
