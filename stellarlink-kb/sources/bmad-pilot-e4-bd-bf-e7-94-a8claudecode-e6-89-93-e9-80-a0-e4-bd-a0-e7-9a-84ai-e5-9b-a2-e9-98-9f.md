---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F"
title: 使用 Claude Code 打造你的 AI 团队 (类似Devin)
description: 使用 Claude Code 打造你的 AI 团队 (类似Devin)
resource: "https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F"
tags: []
timestamp: "2026-06-20T06:45:33.675Z"
source_path: "https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F"
source_id: 92a1ace9f33ce8fa52dfece457f55bb35c41adb47c377736f61580ce41b078df
content_hash: 7ebfee5ed13ea6e5438cc76c077f8b2f0f050c1619e702d7a6f64862056d332e
---

## [使用 Claude Code 打造你的 AI 团队 (类似Devin)](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E4%BD%BF%E7%94%A8-claude-code-%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84-ai-%E5%9B%A2%E9%98%9F-%E7%B1%BB%E4%BC%BCdevin)

先把话说明白：这篇是踩坑复盘，不是“技术白皮书”。我从 Kiro 的 spec/space 到把它们拼成 workflow，又一路换成 requirements-pilot，最后落在 bmad-pilot。中间爽点和雷点都写在这——不兜圈子。

## [路线回顾：从 Kiro space 到“流水线梦碎”](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E8%B7%AF%E7%BA%BF%E5%9B%9E%E9%A1%BE%E4%BB%8E-kiro-space-%E5%88%B0%E6%B5%81%E6%B0%B4%E7%BA%BF%E6%A2%A6%E7%A2%8E)

*   起点：我先是用 Kiro 的 space/spec，把一句话生成“很专业”的文档，看起来气势很足。
*   升级：我把这些文档拼到一个 workflow 上，想要“一键流转：requirements → design → tasks → code”。
*   现实：好看，不好用。线性长闭环，问题都在后面才爆。为了让文档看起来完整，工程被撕成一地碎片——这和我在《SPEC 别再装了…》里说的是一回事：专业废纸+缝合怪。

## [转向：requirements-pilot = vibe coding pipeline](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E8%BD%AC%E5%90%91requirements-pilot--vibe-coding-pipeline)

*   我把路子改成“先确认，后开干”。
*   流程：AI 总结 → 打分 → 问你是否开始 → 你说“上” → 它自动 generate → code → review → testing。
*   体验：顺滑。确认过口径，直接上手，短闭环，不内耗。
*   痛点：文档不够“专业”。可以交付，但当项目变复杂（跨模块、多人协作、需要约束与兼容性），就会缺统一口径与可追溯的“专业文档”。

于是我基于 [BMAD-METHOD](https://github.com/bmadcode/BMAD-METHOD) 做了 bmad-pilot：把“确认后开干”的顺滑，和“专业文档与角色分工”的秩序，合在一条流水线上。

*   角色不是摆设：
    *   PO 写清楚“为了啥、做到啥、什么不做”；
    *   Architect 把“能跑通”的约束与边界放在前面；
    *   SM 排出顺序化的垂直切片；
    *   Dev/QA 作为一组跑完实现与验证；
    *   需要 Analyst/UX 时再加，不强行。
*   产物不是 PPT：
    *   PRD = 做事用的文档（Goals/FR/NFR/Epic/Story/AC + OUT OF SCOPE）；
    *   架构 = 决策用的约束（依赖、兼容、迁移/回滚、观测）；
    *   故事 = 端到端切片（能看到结果的那种）。
*   体验用一句话形容：一个默契的“小团队”在替你干活，节奏是稳的，结果是可见的。

## [为什么 workflow 不行，而 bmad-pilot 行？](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E4%B8%BA%E4%BB%80%E4%B9%88-workflow-%E4%B8%8D%E8%A1%8C%E8%80%8C-bmad-pilot-%E8%A1%8C)

*   workflow 求“自动”，把不确定性藏在后面；
*   bmad-pilot 求“确定”，把决策前置，然后自动化可自动化的那段；
*   一个假装自动化，一个是真正减少返工。

## [怎么用](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E6%80%8E%E4%B9%88%E7%94%A8)

*   复杂事（跨模块/有集成/多人协作）： /bmad-pilot “实现企业级用户管理系统，支持RBAC权限控制和LDAP集成”
    *   如果你已经拍好架构口径： /bmad-pilot “高性能API网关” —direct-dev
*   小需求与修复： /requirements-pilot “新增登录失败的节流与告警”
*   指定只要几位“队友”： /bmad-pilot “创建认证中间件” —agents=architect,dev,qa

提示：别一次性把所有角色全开。先跑最短链路，把第一条用户路径打通，再扩。

## [一天跑通：从 0 到第一条可用功能](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E4%B8%80%E5%A4%A9%E8%B7%91%E9%80%9A%E4%BB%8E-0-%E5%88%B0%E7%AC%AC%E4%B8%80%E6%9D%A1%E5%8F%AF%E7%94%A8%E5%8A%9F%E8%83%BD)

1.  目标对齐

*   bmad-po 产出精简 PRD：3–5 个 Goals，5–10 个 FR/NFR，1 个 Epic + 3–6 个顺序故事，列清楚 OUT OF SCOPE。

2.  技术约束

*   bmad-architect 把“能跑通”的约束写前面：运行时、数据源、集成边界、鉴权、日志、测试策略。

3.  切故事

*   垂直切片：从入口走到结果，有可见产物（API/页面/日志/脚本）。

4.  执行

*   /bmad-pilot —direct-dev 或 /requirements-pilot 进入 SM→Dev→QA；
*   Dev 给变更清单+测试全绿；QA 以“高级开发者”的标准把它改到顺眼再标 Done。

5.  复盘

*   看三件事：Lead Time、返工率、缺陷密度；
*   把无用的话删掉，文档只留“对下一条故事有用”的信息。

## [规范，但只服务“能落地”](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E8%A7%84%E8%8C%83%E4%BD%86%E5%8F%AA%E6%9C%8D%E5%8A%A1%E8%83%BD%E8%90%BD%E5%9C%B0)

*   PRD 不是背景论文：保留 Goals/FR/NFR/Epic/Story/AC，删赘述；
*   架构不是画图比赛：写约束/依赖/兼容/迁移回滚/观测；
*   故事不是 TODO：每条都要有可验证产物。

## [什么时候用哪条链](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E4%BB%80%E4%B9%88%E6%97%B6%E5%80%99%E7%94%A8%E5%93%AA%E6%9D%A1%E9%93%BE)

*   /requirements-pilot：
    *   小事、修复、边角料；
    *   你要快、要顺；
    *   generate→code→review→testing 一口气。
*   /bmad-pilot：
    *   跨模块/多人协作/有外部依赖；
    *   需要统一口径、减少返工；
    *   用 —direct-dev 或 —skip-tests 按场景裁剪。

## [落地检查清单（临上之前过一遍）](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E8%90%BD%E5%9C%B0%E6%A3%80%E6%9F%A5%E6%B8%85%E5%8D%95%E4%B8%B4%E4%B8%8A%E4%B9%8B%E5%89%8D%E8%BF%87%E4%B8%80%E9%81%8D)

*   PRD 只保留“对实现有用”的内容，OUT OF SCOPE 清楚；
*   架构包含约束、兼容、迁移/回滚、观测；
*   每个故事都有可见产物（API/页面/日志/脚本）；
*   Dev 有变更清单与测试记录；
*   QA 作为高级开发者完成最后的“抛光”；
*   看板可见 Lead Time / 返工率 / 缺陷密度；
*   下一条故事开始前，清空上下文，保持轻。

## [配置](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E9%85%8D%E7%BD%AE)

```
git clone https://github.com/cexll/myclaude
mkdir -p ~/.claude/{commands,agents}
cp -R myclaude/commands/* ~/.claude/commands/
cp -R myclaude/agents/* ~/.claude/agents/
```

## [最后想说](https://stellarlink.co/articles/bmad-pilot-%E4%BD%BF%E7%94%A8claudecode%E6%89%93%E9%80%A0%E4%BD%A0%E7%9A%84ai%E5%9B%A2%E9%98%9F#%E6%9C%80%E5%90%8E%E6%83%B3%E8%AF%B4)

我试过把东西“自动化到飞起”，也试过“先把话说清楚再干”。后者更诚实，也更稳。requirements-pilot 让人顺手，bmad-pilot 让人安心。前者像一把趁手的小刀，后者是一整套手术器械——对得上场景，才是真的爽。

注：在 IDE 阶段把 docs/prd.md 与 docs/architecture.md 分片到 docs/prd/ 与 docs/architecture/，方便 SM/Dev/QA 用小上下文跑活。
