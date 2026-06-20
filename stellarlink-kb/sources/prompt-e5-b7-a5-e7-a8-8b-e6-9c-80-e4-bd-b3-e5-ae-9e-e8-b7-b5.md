---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5"
title: Prompt 工程最佳实践
description: Prompt 工程最佳实践
resource: "https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5"
tags: []
timestamp: "2026-06-20T06:45:54.052Z"
source_path: "https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5"
source_id: 71468e16bd2068abc7ea39768c9494ce7d06787afa01e7ed56e4b2b60035e966
content_hash: cdfe4f1106ee044eb25b3edb00aadbfe95aa5977583ebbb36891719ae2dc6ae8
---

* * *

本指南提供针对 Claude 4.x 模型的具体 prompt 工程技术,包括对 Sonnet 4.5、Haiku 4.5 和 Opus 4.5 的专门指导。这些模型经过训练,在指令遵循方面比前几代 Claude 模型更加精确。

## [通用原则](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E9%80%9A%E7%94%A8%E5%8E%9F%E5%88%99)

### [明确你的指令](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E6%98%8E%E7%A1%AE%E4%BD%A0%E7%9A%84%E6%8C%87%E4%BB%A4)

Claude 4.x 模型对清晰、明确的指令响应良好。具体说明你期望的输出可以帮助提升结果。如果客户希望获得早期 Claude 模型那种”超越预期”的行为,可能需要在新模型中更明确地请求这些行为。

**效果较差:**

```
创建一个分析仪表板
```

**效果更好:**

```
创建一个分析仪表板。尽可能包含更多相关功能和交互。超越基础功能,创建一个完整的实现。
```

### [添加上下文以提升性能](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E6%B7%BB%E5%8A%A0%E4%B8%8A%E4%B8%8B%E6%96%87%E4%BB%A5%E6%8F%90%E5%8D%87%E6%80%A7%E8%83%BD)

提供指令背后的上下文或动机,例如向 Claude 解释为什么这种行为很重要,可以帮助 Claude 4.x 模型更好地理解你的目标并提供更有针对性的响应。

**效果较差:**

```
绝不使用省略号
```

**效果更好:**

```
你的响应会被文本转语音引擎朗读,因此绝不要使用省略号,因为文本转语音引擎不知道如何发音它们。
```

Claude 足够智能,能够从解释中进行泛化。

### [对示例和细节保持警惕](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E5%AF%B9%E7%A4%BA%E4%BE%8B%E5%92%8C%E7%BB%86%E8%8A%82%E4%BF%9D%E6%8C%81%E8%AD%A6%E6%83%95)

Claude 4.x 模型对细节和示例高度关注,这是其精确指令遵循能力的一部分。确保你的示例与你想要鼓励的行为一致,并最小化你想要避免的行为。

### [长期推理和状态跟踪](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E9%95%BF%E6%9C%9F%E6%8E%A8%E7%90%86%E5%92%8C%E7%8A%B6%E6%80%81%E8%B7%9F%E8%B8%AA)

Claude 4.5 模型在长期推理任务中表现出色,具有卓越的状态跟踪能力。它通过专注于渐进式进展来保持在扩展会话中的方向感——一次只在少数事项上取得稳步进展,而不是试图同时处理所有事情。这种能力特别在跨越多个 context window 或任务迭代时显现,Claude 可以处理一个复杂任务,保存状态,并在新的 context window 中继续。

#### [Context 感知和多窗口工作流](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#context-%E6%84%9F%E7%9F%A5%E5%92%8C%E5%A4%9A%E7%AA%97%E5%8F%A3%E5%B7%A5%E4%BD%9C%E6%B5%81)

Claude 4.5 模型具有 [context 感知](https://stellarlink.co/docs/en/build-with-claude/context-windows#context-awareness-in-claude-sonnet-4-5)功能,使模型能够在整个对话过程中跟踪其剩余的 context window(即”token 预算”)。这使 Claude 能够通过了解自己有多少工作空间来更有效地执行任务和管理 context。

**管理 context 限制:**

如果你在一个会压缩 context 或允许将 context 保存到外部文件的 agent harness 中使用 Claude(如 Claude Code),我们建议将此信息添加到你的 prompt 中,以便 Claude 可以相应地行事。否则,Claude 有时可能会在接近 context 限制时自然地尝试结束工作。以下是一个示例 prompt:

```
你的 context window 在接近限制时会自动压缩,允许你从离开的地方无限期地继续工作。因此,不要因为 token 预算担忧而提前停止任务。当你接近 token 预算限制时,在 context window 刷新之前将当前进度和状态保存到内存中。始终尽可能持久和自主,即使预算即将用尽也要完整完成任务。无论剩余多少 context,永远不要人为地提前停止任何任务。
```

[Memory tool](https://stellarlink.co/docs/en/agents-and-tools/tool-use/memory-tool) 与 context 感知自然配合,实现无缝的 context 转换。

#### [多 context window 工作流](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E5%A4%9A-context-window-%E5%B7%A5%E4%BD%9C%E6%B5%81)

对于跨越多个 context window 的任务:

1.  **为第一个 context window 使用不同的 prompt**: 使用第一个 context window 建立框架(编写测试、创建设置脚本),然后使用未来的 context window 在待办事项列表上迭代。
    
2.  **让模型以结构化格式编写测试**: 要求 Claude 在开始工作之前创建测试,并以结构化格式(例如 `tests.json`)跟踪它们。这会带来更好的长期迭代能力。提醒 Claude 测试的重要性:“删除或编辑测试是不可接受的,因为这可能导致功能缺失或出现 bug。“
    
3.  **设置生活质量工具**: 鼓励 Claude 创建设置脚本(例如 `init.sh`)来优雅地启动服务器、运行测试套件和 linter。这可以防止在从新 context window 继续时重复工作。
    
4.  **重新开始 vs 压缩**: 当 context window 被清除时,考虑使用全新的 context window 而不是使用压缩。Claude 4.5 模型在从本地文件系统发现状态方面极其有效。在某些情况下,你可能希望利用这一点而不是压缩。对它应该如何开始要有规定性:
    
    *   “调用 pwd;你只能在此目录中读写文件。"
    *   "查看 progress.txt、tests.json 和 git 日志。"
    *   "在继续实现新功能之前,手动运行基本集成测试。“
5.  **提供验证工具**: 随着自主任务长度的增长,Claude 需要在没有持续人工反馈的情况下验证正确性。像 Playwright MCP server 或用于测试 UI 的计算机使用功能这样的工具很有帮助。
    
6.  **鼓励完整使用 context**: Prompt Claude 在继续之前高效地完成组件:
    

```
这是一个非常长的任务,因此明确规划你的工作可能会有所帮助。鼓励你在整个输出 context 上工作任务——只需确保在有大量未提交的工作时不会耗尽 context。系统地持续工作,直到完成此任务。
```

#### [状态管理最佳实践](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)

*   **对状态数据使用结构化格式**: 在跟踪结构化信息(如测试结果或任务状态)时,使用 JSON 或其他结构化格式来帮助 Claude 理解 schema 要求
*   **对进度笔记使用非结构化文本**: 自由形式的进度笔记适合跟踪一般进度和 context
*   **使用 git 进行状态跟踪**: Git 提供已完成工作的日志和可以恢复的检查点。Claude 4.5 模型在使用 git 跨多个会话跟踪状态方面表现特别出色。
*   **强调渐进式进展**: 明确要求 Claude 跟踪其进度并专注于增量工作

```
// 结构化状态文件 (tests.json)
{
  "tests": [
    {"id": 1, "name": "authentication_flow", "status": "passing"},
    {"id": 2, "name": "user_management", "status": "failing"},
    {"id": 3, "name": "api_endpoints", "status": "not_started"}
  ],
  "total": 200,
  "passing": 150,
  "failing": 25,
  "not_started": 25
}
```

```
// 进度笔记 (progress.txt)
Session 3 progress:
- Fixed authentication token validation
- Updated user model to handle edge cases
- Next: investigate user_management test failures (test #2)
- Note: Do not remove tests as this could lead to missing functionality
```

### [沟通风格](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E6%B2%9F%E9%80%9A%E9%A3%8E%E6%A0%BC)

与之前的模型相比,Claude 4.5 模型具有更简洁和自然的沟通风格:

*   **更直接和务实**: 提供基于事实的进度报告,而不是自我庆祝的更新
*   **更对话化**: 稍微更流畅和口语化,不那么机械
*   **不那么冗长**: 为了效率可能会跳过详细摘要,除非另有提示

这种沟通风格准确反映了已完成的工作,没有不必要的详细阐述。

## [特定情况的指导](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E7%89%B9%E5%AE%9A%E6%83%85%E5%86%B5%E7%9A%84%E6%8C%87%E5%AF%BC)

### [平衡冗长度](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E5%B9%B3%E8%A1%A1%E5%86%97%E9%95%BF%E5%BA%A6)

Claude 4.5 模型倾向于高效,可能会在工具调用后跳过口头总结,直接跳到下一个操作。虽然这创建了一个精简的工作流,但你可能更希望对其推理过程有更多的可见性。

如果你希望 Claude 在工作时提供更新:

```
在完成涉及工具使用的任务后,提供你所做工作的快速摘要。
```

### [工具使用模式](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E5%B7%A5%E5%85%B7%E4%BD%BF%E7%94%A8%E6%A8%A1%E5%BC%8F)

Claude 4.5 模型经过训练以进行精确的指令遵循,并受益于明确指导使用特定工具。如果你说”你能建议一些更改吗”,它有时会提供建议而不是实施它们——即使进行更改可能是你的意图。

要让 Claude 采取行动,要更明确:

**效果较差(Claude 只会建议):**

```
你能建议一些更改来改进这个函数吗?
```

**效果更好(Claude 会进行更改):**

```
修改这个函数以提高其性能。
```

或者:

```
对身份验证流程进行这些编辑。
```

要使 Claude 默认情况下更主动地采取行动,你可以将此添加到你的系统 prompt 中:

```
<default_to_action>
默认情况下,实施更改而不是仅建议它们。如果用户的意图不明确,推断最有用的可能行动并继续,使用工具发现任何缺失的细节而不是猜测。尝试推断用户是否打算进行工具调用(例如文件编辑或读取),并相应地采取行动。
</default_to_action>
```

另一方面,如果你希望模型默认情况下更谨慎,不太容易直接跳入实现,并且只在请求时才采取行动,你可以使用如下 prompt 来引导这种行为:

```
<do_not_act_before_instructions>
除非明确指示进行更改,否则不要跳入实现或更改文件。当用户的意图模糊时,默认提供信息、进行研究和提供建议,而不是采取行动。只有在用户明确请求时才继续进行编辑、修改或实现。
</do_not_act_before_instructions>
```

### [工具使用和触发](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E5%B7%A5%E5%85%B7%E4%BD%BF%E7%94%A8%E5%92%8C%E8%A7%A6%E5%8F%91)

Claude Opus 4.5 比之前的模型对系统 prompt 更敏感。如果你的 prompt 旨在减少工具或技能的触发不足,Claude Opus 4.5 现在可能会过度触发。解决方法是减弱任何激进的语言。你可能说过”关键:你必须在…时使用此工具”,你可以使用更正常的 prompt,如”在…时使用此工具”。

### [控制响应格式](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E6%8E%A7%E5%88%B6%E5%93%8D%E5%BA%94%E6%A0%BC%E5%BC%8F)

我们发现在 Claude 4.x 模型中以下几种方法在引导输出格式方面特别有效:

1.  **告诉 Claude 该做什么而不是不该做什么**
    
    *   而不是:“不要在响应中使用 markdown”
    *   尝试:“你的响应应该由流畅的散文段落组成。“
2.  **使用 XML 格式指示器**
    
    *   尝试:“在 <smoothly\_flowing\_prose\_paragraphs> 标签中编写响应的散文部分。“
3.  **使你的 prompt 风格与期望的输出匹配**
    
    你的 prompt 中使用的格式风格可能会影响 Claude 的响应风格。如果你在输出格式的可控性方面仍然遇到问题,我们建议你尽可能使你的 prompt 风格与期望的输出风格匹配。例如,从你的 prompt 中删除 markdown 可以减少输出中 markdown 的数量。
    
4.  **对特定格式偏好使用详细的 prompt**
    
    要更好地控制 markdown 和格式使用,请提供明确的指导:
    

```
<avoid_excessive_markdown_and_bullet_points>
在编写报告、文档、技术解释、分析或任何长篇内容时,使用完整的段落和句子编写清晰流畅的散文。使用标准段落分隔进行组织,并主要为 `inline code`、代码块(```...```)和简单标题(### 和 ###)保留 markdown。避免使用 **粗体** 和 *斜体*。

不要使用有序列表(1. ...)或无序列表(*)除非:a)你呈现的是真正离散的项目,其中列表格式是最佳选择,或者 b)用户明确请求列表或排名

不要用项目符号或数字列出项目,而是将它们自然地融入句子中。这个指导特别适用于技术写作。使用散文而不是过度格式化将提高用户满意度。永远不要输出一系列过于简短的项目符号点。

你的目标是可读的、流畅的文本,自然地引导读者理解想法,而不是将信息分割成孤立的点。
</avoid_excessive_markdown_and_bullet_points>
```

### [研究和信息收集](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E7%A0%94%E7%A9%B6%E5%92%8C%E4%BF%A1%E6%81%AF%E6%94%B6%E9%9B%86)

Claude 4.5 模型展示了卓越的 agentic 搜索能力,可以有效地从多个来源查找和综合信息。为了获得最佳研究结果:

1.  **提供明确的成功标准**: 定义什么构成研究问题的成功答案
    
2.  **鼓励来源验证**: 要求 Claude 跨多个来源验证信息
    
3.  **对于复杂的研究任务,使用结构化方法**:
    

```
以结构化的方式搜索此信息。在收集数据时,发展几个竞争性假设。在进度笔记中跟踪你的置信水平以改进校准。定期自我批评你的方法和计划。更新假设树或研究笔记文件以持久化信息并提供透明度。系统地分解这个复杂的研究任务。
```

这种结构化方法允许 Claude 查找和综合几乎任何信息片段,并迭代地批评其发现,无论语料库的大小如何。

### [Subagent 编排](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#subagent-%E7%BC%96%E6%8E%92)

Claude 4.5 模型展示了显著改进的原生 subagent 编排能力。这些模型可以识别任务何时会从将工作委托给专门的 subagent 中受益,并主动这样做,而无需明确的指令。

要利用这种行为:

1.  **确保定义良好的 subagent 工具**: 在工具定义中提供并描述 subagent 工具
2.  **让 Claude 自然编排**: Claude 会适当地委托,无需明确指令
3.  **如果需要调整保守性**:

```
只有在任务明确受益于具有新 context window 的单独 agent 时才委托给 subagent。
```

### [模型自我认知](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E6%A8%A1%E5%9E%8B%E8%87%AA%E6%88%91%E8%AE%A4%E7%9F%A5)

如果你希望 Claude 在你的应用程序中正确识别自己或使用特定的 API 字符串:

```
助手是 Claude,由 Anthropic 创建。当前模型是 Claude Sonnet 4.5。
```

对于需要指定模型字符串的 LLM 驱动应用:

```
当需要 LLM 时,除非用户另有要求,否则请默认使用 Claude Sonnet 4.5。Claude Sonnet 4.5 的确切模型字符串是 claude-sonnet-4-5-20250929。
```

### [Thinking 敏感性](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#thinking-%E6%95%8F%E6%84%9F%E6%80%A7)

当 extended thinking 被禁用时,Claude Opus 4.5 对”think”这个词及其变体特别敏感。我们建议用传达类似含义的替代词替换”think”,例如”consider”、“believe”和”evaluate”。

### [利用 thinking 和交错 thinking 能力](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E5%88%A9%E7%94%A8-thinking-%E5%92%8C%E4%BA%A4%E9%94%99-thinking-%E8%83%BD%E5%8A%9B)

Claude 4.x 模型提供 thinking 能力,这对于涉及工具使用后反思或复杂多步推理的任务特别有用。你可以引导其初始或交错 thinking 以获得更好的结果。

```
在收到工具结果后,仔细反思它们的质量并在继续之前确定最佳的下一步。使用你的 thinking 根据这些新信息进行规划和迭代,然后采取最佳的下一步行动。
```

### [文档创建](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E6%96%87%E6%A1%A3%E5%88%9B%E5%BB%BA)

Claude 4.5 模型在创建演示文稿、动画和视觉文档方面表现出色。这些模型在这个领域与 Claude Opus 4.1 相当或超越,具有令人印象深刻的创意天赋和更强的指令遵循能力。在大多数情况下,模型第一次就能生成精美、可用的输出。

为了获得文档创建的最佳结果:

```
创建一个关于[主题]的专业演示文稿。适当地包含深思熟虑的设计元素、视觉层次结构和引人入胜的动画。
```

### [改进的视觉能力](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E6%94%B9%E8%BF%9B%E7%9A%84%E8%A7%86%E8%A7%89%E8%83%BD%E5%8A%9B)

与之前的 Claude 模型相比,Claude Opus 4.5 具有改进的视觉能力。它在图像处理和数据提取任务上表现更好,特别是当 context 中存在多个图像时。这些改进延续到计算机使用中,模型可以更可靠地解释屏幕截图和 UI 元素。你还可以通过将视频分解为帧来使用 Claude Opus 4.5 分析视频。

我们发现一种有效提升性能的技术是给 Claude Opus 4.5 一个裁剪工具或 [skill](https://stellarlink.co/docs/en/agents-and-tools/agent-skills/overview)。当 Claude 能够”放大”图像的相关区域时,我们在图像评估上看到了一致的提升。我们在[这里](https://github.com/anthropics/claude-cookbooks/blob/main/multimodal/crop_tool.ipynb)整理了裁剪工具的 cookbook。

### [优化并行工具调用](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E4%BC%98%E5%8C%96%E5%B9%B6%E8%A1%8C%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8)

Claude 4.x 模型在并行工具执行方面表现出色,Sonnet 4.5 在同时触发多个操作方面特别积极。Claude 4.x 模型将:

*   在研究期间运行多个推测性搜索
*   一次读取多个文件以更快地构建 context
*   并行执行 bash 命令(这甚至可能会成为系统性能的瓶颈)

这种行为很容易引导。虽然模型在没有 prompt 的情况下在并行工具调用中有很高的成功率,但你可以将其提升到约 100%或调整侵略性水平:

```
<use_parallel_tool_calls>
如果你打算调用多个工具并且工具调用之间没有依赖关系,请并行进行所有独立的工具调用。优先同时调用工具,只要操作可以并行而不是顺序完成。例如,在读取 3 个文件时,并行运行 3 个工具调用,同时将所有 3 个文件读入 context。尽可能最大化使用并行工具调用以提高速度和效率。但是,如果某些工具调用依赖于先前的调用来通知依赖值(如参数),则不要并行调用这些工具,而是顺序调用它们。永远不要在工具调用中使用占位符或猜测缺失的参数。
</use_parallel_tool_calls>
```

```
在每个步骤之间短暂暂停,按顺序执行操作以确保稳定性。
```

### [减少 agentic coding 中的文件创建](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E5%87%8F%E5%B0%91-agentic-coding-%E4%B8%AD%E7%9A%84%E6%96%87%E4%BB%B6%E5%88%9B%E5%BB%BA)

Claude 4.x 模型有时可能会创建新文件用于测试和迭代目的,特别是在处理代码时。这种方法允许 Claude 使用文件,特别是 python 脚本,作为”临时草稿纸”,然后再保存其最终输出。使用临时文件可以改善结果,特别是对于 agentic coding 用例。

如果你更希望最小化净新文件创建,你可以指示 Claude 在完成后清理:

```
如果你为迭代创建任何临时新文件、脚本或辅助文件,请在任务结束时删除这些文件进行清理。
```

### [过度热情和文件创建](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E8%BF%87%E5%BA%A6%E7%83%AD%E6%83%85%E5%92%8C%E6%96%87%E4%BB%B6%E5%88%9B%E5%BB%BA)

Claude Opus 4.5 倾向于通过创建额外文件、添加不必要的抽象或构建未请求的灵活性来过度工程化。如果你看到这种不希望的行为,添加明确的 prompt 以保持解决方案最小化。

例如:

```
避免过度工程。只进行直接请求或明确必要的更改。保持解决方案简单和专注。

不要添加功能、重构代码或进行超出要求的"改进"。修复 bug 不需要清理周围的代码。一个简单的功能不需要额外的可配置性。

不要为不可能发生的场景添加错误处理、后备或验证。信任内部代码和框架保证。只在系统边界(用户输入、外部 API)进行验证。当你可以直接更改代码时,不要使用向后兼容性垫片。

不要为一次性操作创建辅助函数、实用程序或抽象。不要为假设的未来需求进行设计。正确的复杂度是当前任务所需的最小值。尽可能重用现有抽象并遵循 DRY 原则。
```

### [前端设计](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E5%89%8D%E7%AB%AF%E8%AE%BE%E8%AE%A1)

Claude 4.x 模型,特别是 Opus 4.5,在构建具有强大前端设计的复杂、真实世界 Web 应用方面表现出色。然而,如果没有指导,模型可能会默认使用通用模式,创造出用户所说的”AI 低质量”美学。要创建独特、有创意的前端,让人惊喜和愉悦:

以下是你可以使用的系统 prompt 片段,以鼓励更好的前端设计:

```
<frontend_aesthetics>
你倾向于收敛到通用的、"在分布上"的输出。在前端设计中,这创造了用户所说的"AI 低质量"美学。避免这种情况:制作有创意的、独特的前端,让人惊喜和愉悦。

专注于:
- 排版:选择美丽、独特和有趣的字体。避免像 Arial 和 Inter 这样的通用字体;而是选择能够提升前端美学的独特选择。
- 颜色和主题:致力于一个有凝聚力的美学。使用 CSS 变量保持一致性。具有鲜明重点的主导颜色优于胆怯、均匀分布的调色板。从 IDE 主题和文化美学中汲取灵感。
- 动效:为效果和微交互使用动画。优先考虑 HTML 的纯 CSS 解决方案。在可用时为 React 使用 Motion 库。专注于高影响时刻:一个精心编排的页面加载与交错显示(animation-delay)比分散的微交互创造更多愉悦感。
- 背景:创造氛围和深度,而不是默认使用纯色。分层 CSS 渐变,使用几何图案,或添加与整体美学匹配的上下文效果。

避免通用的 AI 生成美学:
- 过度使用的字体系列(Inter、Roboto、Arial、系统字体)
- 陈词滥调的配色方案(特别是白色背景上的紫色渐变)
- 可预测的布局和组件模式
- 缺乏上下文特定特色的千篇一律设计

创造性地解释并做出对上下文真正感觉设计过的意外选择。在浅色和深色主题、不同字体、不同美学之间变化。你仍然倾向于在各代中收敛到常见选择(例如 Space Grotesk)。避免这种情况:跳出框框思考至关重要!
</frontend_aesthetics>
```

你还可以参考[这里](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)的完整 skill。

### [避免专注于通过测试和硬编码](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E9%81%BF%E5%85%8D%E4%B8%93%E6%B3%A8%E4%BA%8E%E9%80%9A%E8%BF%87%E6%B5%8B%E8%AF%95%E5%92%8C%E7%A1%AC%E7%BC%96%E7%A0%81)

Claude 4.x 模型有时可能过于专注于使测试通过,以牺牲更通用的解决方案为代价,或者可能使用辅助脚本等变通方法进行复杂重构,而不是直接使用标准工具。为了防止这种行为并确保健壮、可泛化的解决方案:

```
请使用可用的标准工具编写高质量、通用的解决方案。不要创建辅助脚本或变通方法来更有效地完成任务。实施一个对所有有效输入都正确工作的解决方案,而不仅仅是测试用例。不要硬编码值或创建仅适用于特定测试输入的解决方案。相反,实施通常解决问题的实际逻辑。

专注于理解问题需求并实施正确的算法。测试是为了验证正确性,而不是定义解决方案。提供遵循最佳实践和软件设计原则的原则性实现。

如果任务不合理或不可行,或者如果任何测试不正确,请告知我而不是绕过它们。解决方案应该是健壮的、可维护的和可扩展的。
```

### [鼓励代码探索](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E9%BC%93%E5%8A%B1%E4%BB%A3%E7%A0%81%E6%8E%A2%E7%B4%A2)

Claude Opus 4.5 能力很强,但在探索代码时可能过于保守。如果你注意到模型在没有查看代码的情况下提出解决方案或对它没有读过的代码做出假设,最好的解决方案是向 prompt 添加明确的指令。Claude Opus 4.5 是我们迄今为止最具可控性的模型,对直接指导反应可靠。

例如:

```
在提出代码编辑之前,始终读取并理解相关文件。不要推测你没有检查过的代码。如果用户引用特定的文件/路径,你必须在解释或提出修复之前打开并检查它。在搜索代码中的关键事实时要严格和持久。在实施新功能或抽象之前,彻底审查代码库的风格、约定和抽象。
```

### [最小化 agentic coding 中的幻觉](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E6%9C%80%E5%B0%8F%E5%8C%96-agentic-coding-%E4%B8%AD%E7%9A%84%E5%B9%BB%E8%A7%89)

Claude 4.x 模型不太容易产生幻觉,并根据代码提供更准确、务实、智能的答案。为了更多地鼓励这种行为并最小化幻觉:

```
<investigate_before_answering>
永远不要推测你没有打开的代码。如果用户引用特定文件,你必须在回答之前读取该文件。确保在回答有关代码库的问题之前调查并读取相关文件。在调查之前永远不要对代码做出任何声明,除非你确定正确的答案——给出务实和无幻觉的答案。
</investigate_before_answering>
```

## [迁移考虑因素](https://stellarlink.co/articles/prompt-%E5%B7%A5%E7%A8%8B%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5#%E8%BF%81%E7%A7%BB%E8%80%83%E8%99%91%E5%9B%A0%E7%B4%A0)

在迁移到 Claude 4.5 模型时:

1.  **对期望的行为要具体**: 考虑准确描述你希望在输出中看到什么。
    
2.  **使用修饰语框架你的指令**: 添加鼓励 Claude 提高其输出质量和细节的修饰语可以帮助更好地塑造 Claude 的性能。例如,不要说”创建一个分析仪表板”,而是使用”创建一个分析仪表板。尽可能包含更多相关功能和交互。超越基础功能,创建一个完整的实现。“
    
3.  **明确请求特定功能**: 当需要时,应明确请求动画和交互元素。
