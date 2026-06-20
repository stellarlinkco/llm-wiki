---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81"
title: MiniMax M2.1 测评：国产编程模型实测
description: MiniMax M2.1 在 Claude Code、Cline 等工具上的实测表现。VIBE 基准 88.6 分，原型生成可用，后端 API 开发稳定。
resource: "https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81"
tags: []
timestamp: "2026-06-20T06:45:50.790Z"
source_path: "https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81"
source_id: 81d5d3e3a93fbdca4950696d5597c33e13f0a9721d12c309b4c0f6f582266e30
content_hash: 89417c5e8c21829e65d41348096b4c104babf83a2993138ae018ab639fe0d431
---

## [TLDR](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#tldr)

MiniMax M2.1 是国产编程模型中实测表现较好的一款。VIBE 基准 88.6 分接近 Claude Opus 4.5，在 Claude Code、Cline 等工具中可用。实测原型生成、UI 美学能力、后端 API 开发、管理后台生成均达到可用状态。优点是工具调用规范、workflow 遵守好、响应简洁。

**关键数据**：

维度

M2.1 表现

VIBE 综合得分

88.6 分（接近 Opus 4.5）

SWE-bench Verified

持平/超越 Claude Sonnet 4.5

多语言能力

超 Sonnet 4.5、 Gemini 3 Pro

Agent 框架兼容性

Claude Code、Cline、Kilo Code、Roo Code

* * *

## [官方能力概览](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E5%AE%98%E6%96%B9%E8%83%BD%E5%8A%9B%E6%A6%82%E8%A7%88)

### [编程语言能力](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80%E8%83%BD%E5%8A%9B)

M2.1 系统性提升了以下语言的表现：

*   底层系统语言：Rust、C++、Objective-C
*   后端语言：Java、Golang、Kotlin
*   前端语言：TypeScript、JavaScript

官方定位为”业内领先水平”，覆盖从底层系统到应用层开发的完整链路。

### [WebDev 与 AppDev](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#webdev-%E4%B8%8E-appdev)

针对移动端开发短板，M2.1 加强了原生 Android / iOS 开发能力。同时提升了 Web 与 App 场景的设计理解与美学表达能力，官方称可推动 vibe coding 成为可持续、可交付的生产实践。

### [复合指令约束](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E5%A4%8D%E5%90%88%E6%8C%87%E4%BB%A4%E7%BA%A6%E6%9D%9F)

作为开源模型中率先系统性引入 Interleaved Thinking 的系列，M2.1 的 systematic problem-solving 能力升级，关注模型对”复合指令约束”的整合执行能力，在真实办公场景可用性提升。

### [响应效率](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E5%93%8D%E5%BA%94%E6%95%88%E7%8E%87)

相比 M2，模型回复和思维链更简洁，Token 消耗下降，在 AI Coding 与 Agent 驱动的连续工作流中更流畅。

### [Agent 框架兼容性](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#agent-%E6%A1%86%E6%9E%B6%E5%85%BC%E5%AE%B9%E6%80%A7)

在 Claude Code、Droid（Factory AI）、Cline、Kilo Code、Roo Code、BlackBox 等工具中表现一致稳定。对 Skill.md、Claude.md / agent.md / cursorrule、Slash Command 等 Context Management 机制提供可靠支持。

### [基准测试表现](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E5%9F%BA%E5%87%86%E6%B5%8B%E8%AF%95%E8%A1%A8%E7%8E%B0)

![M2.1 模型能力概览](https://vrfi1sk8a0.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTUzNDdiMmY4MDEzYTJkMTRhNDA1NzM2YzFmMDIzMGFfTjA2aHJPVFpzQU9ndzF0RkZNSnZTMmxMdjJLMmZNOUdfVG9rZW46QjBkQmJIZmpib1loNEd4MWd6T2NZcU4wbjRiXzE3NjY0OTY5ODM6MTc2NjUwMDU4M19WNA)

**软件工程榜单**：

![基准测试概览](https://vrfi1sk8a0.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmIyN2UyMmJkMGI4MGRjNWRhYWUyZTlkZGU3OGQ0MTFfUkcyNDRBaDN6aElMRjhUUWVMckZxbTRTSGhubXhQWlVfVG9rZW46QUh3aGJETzFnb1JRRFp4SWdCT2NpZXZ5bmdmXzE3NjY0OTY5ODM6MTc2NjUwMDU4M19WNA)

在 SWE-bench Verified 测试中，M2.1 在不同 coding agent 框架上表现稳定。在测试用例生成、代码性能优化、代码审阅（SWE-Review）、指令遵从（OctoCodingBench）等场景相比 M2 全面提升，持平或超过 Claude Sonnet 4.5。

![SWE-bench Verified 测试结果](https://vrfi1sk8a0.feishu.cn/space/api/box/stream/download/asynccode/?code=M2FjNDYxNDQ3OWU0MDIwNWNiZWQ5ZGUyYjM5NjY0YTJfMXhyd2xHQnhWcEhVek9ROTVnWE9Lc0RoTHRKN25hN0xfVG9rZW46UU5MUWJQV29sb3Z5a1J4d2phQWN3WndpbjVmXzE3NjY0OTY5ODM6MTc2NjUwMDU4M19WNA)

**VIBE 基准测试**：

VIBE (Visual & Interactive Benchmark for Execution in Application Development) 涵盖 Web、仿真、Android、iOS 及后端五大子集，通过 Agent-as-a-Verifier (AaaV) 范式评估生成应用在真实运行环境中的交互逻辑与视觉美感。

VIBE：[https://huggingface.co/datasets/MiniMaxAI/VIBE](https://huggingface.co/datasets/MiniMaxAI/VIBE)

![VIBE 基准测试结果](https://vrfi1sk8a0.feishu.cn/space/api/box/stream/download/asynccode/?code=OWM1ODc1YzRhODRhOTk3YjQxMmE4MzQyZDE3YzA5YzBfbWhJcnpuZXFacTNORGd6RGlqZzFDMU1YU2k2a0NNVTVfVG9rZW46RU96M2I4dzhkb0dQN0t4aUVrcWNOZGxIbmlJXzE3NjY0OTY5ODM6MTc2NjUwMDU4M19WNA)

MiniMax-M2.1 在 VIBE 综合榜单中平均 88.6 分，展现接近 Claude Opus 4.5 的全栈构建能力，在几乎所有子集上显著优于 Claude Sonnet 4.5。

**办公场景能力**：

![办公场景能力提升](https://vrfi1sk8a0.feishu.cn/space/api/box/stream/download/asynccode/?code=NWI1NTBhMTkyYTQxMDczMDZlMmNiY2NhMDFiNmEzMWJfRXo4eVVQd0pvSmd0ZTdpek5VWHZNQ09LdUxqR01wNHpfVG9rZW46SHhobmJDb3FTbzBLaDR4MHQ3eWNxSDBIbm9kXzE3NjY0OTY5ODM6MTc2NjUwMDU4M19WNA)

* * *

## [实测：原型生成](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E5%AE%9E%E6%B5%8B%E5%8E%9F%E5%9E%8B%E7%94%9F%E6%88%90)

先测一下原型生成能力。丢了个潮玩盲盒电商 app 的需求给它。

![潮玩盲盒电商 App 原型生成截图 1](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-rla.png)

![潮玩盲盒电商 App 原型生成截图 2](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-ron.png)

生成效果怎么说呢，和 gemini3 一个梯队，比 claude sonnet4.5/opus4.5、gpt5.2 效果都要好。

![盲盒星球 App 运行效果 1](https://stellarlink.co/articles/assets/minimaxm21/%E7%9B%B2%E7%9B%92%E6%98%9F%E7%90%83-%E6%BD%AE%E7%8E%A9%E6%8A%BD%E7%9B%92-12-23-2025_07_54_PM.png)

![盲盒星球 App 运行效果 2](https://stellarlink.co/articles/assets/minimaxm21/%E7%9B%B2%E7%9B%92%E6%98%9F%E7%90%83-%E6%BD%AE%E7%8E%A9%E6%8A%BD%E7%9B%92-12-23-2025_08_00_PM.png)

![盲盒星球 App 运行效果 3](https://stellarlink.co/articles/assets/minimaxm21/%E7%9B%B2%E7%9B%92%E6%98%9F%E7%90%83-%E6%BD%AE%E7%8E%A9%E6%8A%BD%E7%9B%92-12-23-2025_08_01_PM.png)

![盲盒星球 App 运行效果 4](https://stellarlink.co/articles/assets/minimaxm21/%E7%9B%B2%E7%9B%92%E6%98%9F%E7%90%83-%E6%BD%AE%E7%8E%A9%E6%8A%BD%E7%9B%92-12-23-2025_08_01_PM%20\(1\).png)

![盲盒星球 App 运行效果 5](https://stellarlink.co/articles/assets/minimaxm21/%E7%9B%B2%E7%9B%92%E6%98%9F%E7%90%83-%E6%BD%AE%E7%8E%A9%E6%8A%BD%E7%9B%92-12-23-2025_08_01_PM%20\(2\).png)

原型图拿出来可以直接和产品对，沟通清楚功能之后，选 expo / react native 就能直接写 app 了，做小程序直接选 taro。

再测一个，类似小宇宙的播客 app。

![小宇宙播客 App 原型生成截图 1](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-rqc.png)

![小宇宙播客 App 原型生成截图 2](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-rqp.png)

一次生成效果也不错，对完功能和业务逻辑就能进二开了。

![小宇宙播客 App 运行效果](https://stellarlink.co/articles/assets/minimaxm21/%E5%B0%8F%E5%AE%87%E5%AE%99-%E6%92%AD%E5%AE%A2-App-%E5%8E%9F%E5%9E%8B-12-23-2025_08_04_PM.png)

* * *

## [实测：后端 API 开发](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E5%AE%9E%E6%B5%8B%E5%90%8E%E7%AB%AF-api-%E5%BC%80%E5%8F%91)

继续测试，给了个 feed 后端 api 的需求。

![Feed API 生成截图 1](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-rpe.png)

![Feed API 生成截图 2](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-rqw.png)

开了 claude code yolo 模式之后，直接不用管了，自己在那吭哧吭哧开发、跑测试、修 bug。

![Feed API 开发完成](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-sny.png)

![Feed API 测试通过](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-sqi.png)

确实牛，完全托管开发。跑了个 e2e 检查，api 全都能用。

![Feed API E2E 测试](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-t0k.png)

* * *

## [实测：Admin 页面](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E5%AE%9E%E6%B5%8Badmin-%E9%A1%B5%E9%9D%A2)

api 搞完了，那顺便生成个 admin 页面吧。

![Admin 页面生成 - askUserQuestion 调用](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-t91.png)

直接调用了 askUserQuestion tools 让我选技术方案，丝滑，和 claude 用起来没区别。

![Admin 页面生成 - /dev 工作流触发](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-ta3.png)

回车确认之后，它主动调了我的 /dev 工作流。

哇塞，这个是真的惊讶。sonnet4.5 有时候都不一定会这么遵守提示词，opus4.5 就更不用说了，基本上不爱遵守。

![Admin 页面生成 - 开始 Coding](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-tcu.png)

回车之后直接开始 coding，等一会就开发完了。

![Admin 页面开发完成](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-tva.png)

跑起来看看效果。

![Admin Dashboard 运行效果 1](https://stellarlink.co/articles/assets/minimaxm21/Feed-App-Admin-Dashboard-12-23-2025_09_30_PM.png)

![Admin Dashboard 运行效果 2](https://stellarlink.co/articles/assets/minimaxm21/Feed-App-Admin-Dashboard-12-23-2025_09_36_PM.png)

![Admin 页面 E2E 测试 1](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-ul2.png)

![Admin 页面 E2E 测试 2](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-ul5.png)

![Admin 页面 E2E 测试 3](https://stellarlink.co/articles/assets/minimaxm21/SCR-20251223-ul7.png)

效果挺 nice 的。

* * *

## [优缺点](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E4%BC%98%E7%BC%BA%E7%82%B9)

### [好的地方](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E5%A5%BD%E7%9A%84%E5%9C%B0%E6%96%B9)

维度

表现

原型生成

一次生成能达到可用状态，代码结构清晰

后端开发

全自动流程，测试验证完整

工具调用

规范使用 askUserQuestion 等工具

workflow 遵守

主动调用 /dev 工作流，符合预期

响应简洁

token 消耗较低，响应速度较快

UI 美学能力

接近 Gemini3 水平

### [还差点意思的地方](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E8%BF%98%E5%B7%AE%E7%82%B9%E6%84%8F%E6%80%9D%E7%9A%84%E5%9C%B0%E6%96%B9)

维度

情况

skills

对 skills 支持一般，没有主动调用 codeagent，但明确要求会调用

系统架构

和 sonnet4.5 的软件架构能力存在差距

多模态

不是多模态模型，识别图片依赖 mcp

* * *

## [总结](https://stellarlink.co/articles/minimax-m2-1-%E6%B5%8B%E8%AF%84-%E5%BD%93%E5%9B%BD%E4%BA%A7%E6%A8%A1%E5%9E%8B%E5%BC%80%E5%A7%8B%E8%AE%A4%E7%9C%9F%E5%86%99%E4%BB%A3%E7%A0%81#%E6%80%BB%E7%BB%93)

MiniMax M2.1 是国产编程模型里实测表现较好的一款。VIBE 基准 88.6 分，接近 Claude Opus 4.5 水平。

在 Claude Code 里用起来挺正常的，工具调用规范，workflow 遵守得好。日常开发替 sonnet4.5 用没问题，但复杂的系统架构需求还是得 sonnet4.5 或 opus4.5 上。

* * *
