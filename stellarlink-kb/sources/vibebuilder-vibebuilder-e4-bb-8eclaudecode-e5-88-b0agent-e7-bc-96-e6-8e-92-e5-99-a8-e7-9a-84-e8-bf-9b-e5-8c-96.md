---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96"
title: VibeBuilder：从 Claude Code 到 Agent 编排器的进化
description: VibeBuilder 从 Claude Code 到 Agent 编排器的进化
resource: "https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96"
tags: []
timestamp: "2026-06-20T06:45:59.852Z"
source_path: "https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96"
source_id: e493656a21f2e4895bd96f2da8e183994c0a3cf620b220d190298f0a816836f3
content_hash: 5636b5729c3fb3c73929cd3a72a7b4c537437aa8b9f36e6898433ff9357f7f9d
---

## [VibeBuilder：从 Claude Code 到 Agent 编排器的进化](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#vibebuilder%E4%BB%8E-claude-code-%E5%88%B0-agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96)

## [TLDR](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#tldr)

2026 年还在用 IDE 写代码，你就是个糟糕的工程师 —— Steve Yegge。

Claude Code、Cursor 这些工具确实好用，但它们只是过渡品。下一步是 Agent 编排器——你不再写代码，而是管理一支 AI Agent 车队。

VibeBuilder（原 swe-agent.ai）就是这个思路的实践：让 Agent 自己跑完整个开发流程，人只需要定义目标、做关键决策。

维度

Claude Code/Cursor

编排器

定位

单 Agent 助手

多 Agent 编排

交互

人盯着跑

后台自动跑

输出

代码改动

完整开发流程

## [Steve Yegge 的预言：IDE 时代结束了](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#steve-yegge-%E7%9A%84%E9%A2%84%E8%A8%80ide-%E6%97%B6%E4%BB%A3%E7%BB%93%E6%9D%9F%E4%BA%86)

Steve Yegge 是 Sourcegraph 的工程主管，在亚马逊干了 7 年，谷歌干了 13 年。

**核心观点 1：2000 小时法则**

你至少要和 AI 共事一年，大约 2000 小时，才能真正信任它。这里的”信任”不是说模型有多强，而是你能预测它下一步会做什么。如果它是不可预测的，你当然会愤怒。

**核心观点 2：IDE 不是终局**

> ”如果到 2026 年 1 月 1 日你还在用 IDE 来开发代码，那你已经是个糟糕的工程师了。“

原因不在于 IDE 本身，而在于抽象层已经发生迁移——从”模型 + 编辑器”，上移到了全栈 Agent 系统。未来工程师的工作，不是操作工具，而是设计、调度和约束 Agent 的行为。

**核心观点 3：编排器时代来临**

Claude Code 证明了 Agent 编程是可行的，但太难了。你要读大量文本、diff、代码。下一代工具不会是 IDE，而是 Agent 编排控制台：你早上打开，看一眼——这个 Agent 在跑，这个卡住了，这个需要我决策。

**核心观点 4：代码工厂化生产**

软件开发正在进入”代码的工厂化生产”时代。编排器将运行 Claude Code，清洗输出，循环执行”计划–实现–评审–测试”，并在大规模上把编程能力释放给非程序员。

**核心观点 5：Agent 之间的通讯**

Steve 提到了 Jeffrey Emanuel 做的 Agent Mail 概念——让 Agent 之间可以互相发消息、自己协作。他只需要说一句：“你们自己协调，把我刚定义的这个 epic 并行完成。“然后 Agents 就真的开始自己分工了。这正是编排器要走向的方向：核心不是控制单个 Agent，而是让一群 Agent 在轨道上协作、通信。

## [编排器的核心思路](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E6%A0%B8%E5%BF%83%E6%80%9D%E8%B7%AF)

编排器要解决的问题很简单：**怎么让 Agent 自己跑起来，而不是人盯着它跑？**

现在用 Claude Code / Codex，你得一直盯着。它问你问题，你回答；它改完代码，你 review；它跑测试，你看结果。这个过程人是”在线”的。

编排器的思路是：**把人从”在线”变成”离线”**。

你定义好目标和约束，Agent 自己去跑。跑完了通知你，或者遇到问题了再叫你。就像你给团队布置任务，不用每分钟都盯着他们干活。

这里面有几个关键转变：

**从”单次任务”到”流程”**

Claude Code 是单次任务思维：你说一句，它做一件事。编排器是流程思维：你定义一个目标，它自己拆解成多个阶段，一个接一个跑。

**从”人驱动”到”事件驱动”**

现在是你发命令，Agent 才动。编排器是事件驱动：Task 创建了，自动开始；Commit 提交了，自动 Review；Review 通过了，自动合并。人不需要一直在那儿推。

**从”无状态”到”有状态”**

Claude Code 跑完就完了，没有”记忆”。编排器需要知道：当前在哪个阶段？上一步做了什么？下一步该干什么？出问题了怎么恢复？

## [两种模式：单次任务 vs 全流程编排](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#%E4%B8%A4%E7%A7%8D%E6%A8%A1%E5%BC%8F%E5%8D%95%E6%AC%A1%E4%BB%BB%E5%8A%A1-vs-%E5%85%A8%E6%B5%81%E7%A8%8B%E7%BC%96%E6%8E%92)

编排器不是要取代 Claude Code，而是在它上面加一层。所以设计了两种模式：

**单次任务模式**：就是现在 Claude Code 的用法。你发个命令，Agent 去改代码，改完了告诉你。人盯着跑，适合小改动、快速迭代。

**全流程编排模式**：你创建一个任务，然后就可以去睡觉了。Agent 会自动跑完整个流程。

最妙的是两种模式可以互通。全流程跑到一半，你觉得 Agent 搞错了，可以直接手动干预。系统会暂停自动流程，执行你的手动任务，然后恢复。

## [核心挑战与解决思路](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#%E6%A0%B8%E5%BF%83%E6%8C%91%E6%88%98%E4%B8%8E%E8%A7%A3%E5%86%B3%E6%80%9D%E8%B7%AF)

做编排器没有想象中那么简单。

**挑战 1：合并（Merging）**

Steve Yegge 说这是”所有人都在撞的那堵墙”。当多名工程师（及 AI）同时产生大量代码时，代码合并变得极其复杂。你我同时工作两三个小时，各自生成 3 万行改动。你的先合进主干，而我这边改了日志系统、架构、API——那已经不是”修冲突”了，而是重新在你的改动之上再发明一次我的改动。

**解决思路**：任务隔离，每个任务独立工作空间。但这只是缓解，不是根治。真正的解法可能需要 Agent 之间的通信协调——在动手之前先”打招呼”。

**挑战 2：安全**

全流程编排是全自动的，安全问题更严重：

*   谁有权限触发全自动流程？不能随便一个人就能让 AI 改代码
*   自动创建子任务会不会死循环？A 创建 B，B 又触发 A
*   多个流程同时跑会不会打架？
*   服务挂了重启，进度丢不丢？

**挑战 3：状态管理**

编排器需要”记忆”：当前在哪个阶段？上一步做了什么？下一步该干什么？出问题了怎么恢复？服务重启了能不能接着跑？

这些问题没有银弹，但方向是清晰的：**把状态持久化，把流程原子化，把权限收紧**。

## [工具权限收敛：不同阶段不同能力](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#%E5%B7%A5%E5%85%B7%E6%9D%83%E9%99%90%E6%94%B6%E6%95%9B%E4%B8%8D%E5%90%8C%E9%98%B6%E6%AE%B5%E4%B8%8D%E5%90%8C%E8%83%BD%E5%8A%9B)

这是个容易被忽略但很重要的思路。

你让 Agent 写 PRD，它可能顺手就把代码改了。你让它做 Review，它可能直接帮你 merge 了。LLM 会”越权”，这是它的特性。

**解决思路**：不同阶段给不同的工具。

*   写 PRD 的时候，只能读文件、搜索、分析，不能写代码
*   拆任务的时候，只能创建Task，不能动代码
*   写代码的时候，不能自己 merge
*   做 Review 的时候，只能评论，不能改代码

**核心原则**：禁止靠提示，要靠权限。

Prompt 里说”不要做 X”是软约束，工具层面不给它 X 的能力才是硬约束。就像你不会给实习生 root 权限然后告诉他”别乱删东西”。

## [2026 年的 Vibe Coding 趋势](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#2026-%E5%B9%B4%E7%9A%84-vibe-coding-%E8%B6%8B%E5%8A%BF)

Steve Yegge 对 2026 年的预测：

1.  **开源模型之年**：开源模型目前落后前沿模型约七个月，差距在缩小。到明年夏天，开源模型可能达到当前顶尖闭源模型的水平。
    
2.  **模型不再是瓶颈**：真正的挑战变成工具必须更聪明地拆解任务，把子任务分配给”合适规模、合适成本”的模型。
    
3.  **重写比修补更快**：Joel Spolsky 的”永远不要重写代码”开始失效。对于越来越多的代码库，从零重写比修修补补更快、更好。
    
4.  **工程师角色转变**：未来的工程师更像是一个拥有深厚工程背景的产品经理，站在更高的抽象层级上工作。你不再关心”怎么写”，而是关心”它是怎么工作的”。
    

## [我的思考：人类参与会降到多少？](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#%E6%88%91%E7%9A%84%E6%80%9D%E8%80%83%E4%BA%BA%E7%B1%BB%E5%8F%82%E4%B8%8E%E4%BC%9A%E9%99%8D%E5%88%B0%E5%A4%9A%E5%B0%91)

回顾一下 AI 编程的进化路径：

阶段

模型

交互方式

人类参与度

Tab 补全

GPT-3.5 / Sonnet 3.5

手写 + Tab 补全

90%+

Copilot 时代

GPT-4 / Sonnet 3.5

写注释 → 生成代码

70%

Vibe Coding

Sonnet 4 / Opus 4.5

描述需求 → Agent 实现

10-30%

编排器时代

?

定义目标 → 全自动流水线

1-5%?

从 Sonnet 3.5 到 Sonnet 4.5，模型能力跃升了一个量级。AI 编程也从”Tab 补全”进化到了”Vibe Coding”——从最初的手写代码 + Tab 补全，到现在完全交给 Claude Code / Codex。

**人工参与会慢慢降到 5%，甚至 1%。**

这不是危言耸听。想想看：

*   Tab 时代：手工 > AI，你写代码，AI 补全
*   Vibe Coding 时代：Review > Coding，AI 写代码，你审查
*   编排器时代：连 Review 都交给 AI？

**AI 越来越快，效率越来越高，人还有必要参与 Coding 工作吗？**

怎么说呢，LLM 虽然是按 Token 操作的，但它仍然比人类快太多了。一个 Agent 跑 10 分钟能产出的代码量，人类可能要写一天。而且 Agent 不会累、不会分心、不会忘记上下文（好吧，会忘记，但可以通过工程手段解决）。

## [测试怎么办？视觉模型来了](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#%E6%B5%8B%E8%AF%95%E6%80%8E%E4%B9%88%E5%8A%9E%E8%A7%86%E8%A7%89%E6%A8%A1%E5%9E%8B%E6%9D%A5%E4%BA%86)

开发完成了，测试怎么办？这是很多人的疑问。

答案是：**视觉模型 + 浏览器自动化**。

随着视觉模型的迭代，特别是 Google Gemini 的多模态能力，给 AI 接入浏览器 MCP 让它自动测试变成了可运行的方案。AutoGLM 和豆包手机已经给出了答案——AI 可以像人一样操作界面、点击按钮、填写表单、验证结果。

想象一下这个流程：

1.  Agent 写完代码，自动部署到测试环境
2.  视觉 Agent 打开浏览器，按照测试用例操作
3.  截图、对比、验证，发现问题自动提 Bug
4.  开发 Agent 接收 Bug，修复，再测试
5.  循环直到通过

这不是科幻，这是正在发生的事情。

## [把 AI 能做的发挥到极致](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#%E6%8A%8A-ai-%E8%83%BD%E5%81%9A%E7%9A%84%E5%8F%91%E6%8C%A5%E5%88%B0%E6%9E%81%E8%87%B4)

我的核心观点：**把 AI 能做的，尽可能发挥到极致。**

人类在 AI 面前还是太慢了。不是说人类不重要，而是说人类应该做人类擅长的事情：

*   定义目标和约束
*   做关键决策
*   处理模糊和创造性的问题
*   承担责任

而不是：

*   手写 for 循环
*   调试 CSS 对齐问题
*   写单元测试
*   做重复性的 Code Review

**那么，还有什么是 AI 不能做的？**

AI 能做的

AI 还差点意思的

写代码

定义”什么是好的产品”

测试

理解用户真正想要什么

Code Review

做商业决策

修 Bug

承担法律和道德责任

重构

处理完全未知的问题

写文档

跨领域的创造性整合

编排器的意义就在于：把 AI 能做的事情串起来，让它自己跑。人类只需要在关键节点介入——定义目标、做决策、处理异常。

这不是”AI 取代人类”，而是”人类站在更高的抽象层”。就像 Steve Yegge 说的：未来的工程师更像是一个拥有深厚工程背景的产品经理。

## [总结](https://stellarlink.co/articles/vibebuilder-vibebuilder-%E4%BB%8Eclaudecode-%E5%88%B0agent-%E7%BC%96%E6%8E%92%E5%99%A8%E7%9A%84%E8%BF%9B%E5%8C%96#%E6%80%BB%E7%BB%93)

Steve Yegge 说的编排器时代确实在来。Claude Code、Cursor 这些工具是过渡品，它们证明了 Agent 编程可行，但交互方式还是”人盯着 Agent 跑”。下一步是”Agent 自己跑，人只管决策”。

编排器的核心思路就三句话：

*   **让 Agent 自己跑**：从人驱动变成事件驱动
*   **让 Agent 有记忆**：知道在哪、该干什么、出问题能恢复
*   **让 Agent 有边界**：不同阶段不同能力，硬约束比软提示靠谱

2026 年还用 IDE？不至于那么夸张。但如果你还没开始思考”怎么让 Agent 自己跑起来”，确实该抓紧了。

* * *

参考资料：

*   Steve Yegge AI Engineer Summit 访谈 [https://www.youtube.com/watch?v=zuJyJP517Uw](https://www.youtube.com/watch?v=zuJyJP517Uw)
*   VibeBuilder [https://vibebuilder.cc](https://vibebuilder.cc/)
