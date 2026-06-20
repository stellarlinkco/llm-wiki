---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98"
title: 研究 PRD / SPEC / BMAD，我们在追求什么
description: 研究 PRD SPEC BMAD 我们在追求什么
resource: "https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98"
tags: []
timestamp: "2026-06-20T06:46:03.696Z"
source_path: "https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98"
source_id: 16514b527ca6e4e77144560cf6f285b66d44d0e2bd4852fa4efc7a33b065cb42
content_hash: 17b86b0b394737bd62a49fcb0d2696dc13f65e8b9df2e197d3910dfc43493264
---

## [研究 PRD / SPEC / BMAD，我们在追求什么](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#%E7%A0%94%E7%A9%B6-prd--spec--bmad%E6%88%91%E4%BB%AC%E5%9C%A8%E8%BF%BD%E6%B1%82%E4%BB%80%E4%B9%88)

> 公众号地址 欢迎关注 [https://mp.weixin.qq.com/s/p1hnI3omEEp\_OiMvoiegFQ](https://mp.weixin.qq.com/s/p1hnI3omEEp_OiMvoiegFQ)

## [背景与动机](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#%E8%83%8C%E6%99%AF%E4%B8%8E%E5%8A%A8%E6%9C%BA)

真实场景大概是这样：今天即兴 vibe 了一下午，撸出一个 MVP；之后因为上下文长度受限，只能开新 session 接着做。新 session 里，模型对你之前的决策、边界、坑点一无所知，你只能一点点把“做过什么、为什么这么做、这次要改什么”重新喂进去。重复沟通、反复铺垫，效率直线下降。

后来大家发现：把上次的重要内容“总结/压缩”进文档，下次开发时直接 @ 引用，就能把上下文串起来。这个朴素做法，后来被称为“上下文工程”。之后很多方法（SPEC、PRD、BMAD、工作流、角色分工）都是在它之上演进的外衣。

我们关心的目标只有一个：让交付“质量可控”，过程“人工干预极少”，最好能“无人化”。

## [SPEC、PRD、BMAD：外衣不同，本质相同](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#specprdbmad%E5%A4%96%E8%A1%A3%E4%B8%8D%E5%90%8C%E6%9C%AC%E8%B4%A8%E7%9B%B8%E5%90%8C)

*   SPEC 把需求拆成 requirements/design/tasks，看起来很专业，但经常把上下文碾得过碎，线性长闭环导致问题在集成/验收才爆。更糟的是，在一段时间里模型“降智”，就很难产出质量可控的代码。
*   PRD 回到“做事用”的文档：目标、范围、验收口径清楚，能直接驱动实现与测试；不追求厚度，追求可执行。
*   BMAD 引入角色做分工：PO 写 PRD、Architect 写 system architecture、SM 写 sprint plan，Dev/QA 执行与门控。实质仍是上下文工程：把关键口径写入对应产物，串好接力。

我看到很多人花大量时间研究角色与工作流，结果是在换着方式做同一件事。思想不变：只用 PRD 也能产出可控的代码。更值得投入的是：如何保证整条交付链路质量可控，从需求到开发到测试到验收到上线的“少人干预，尽量无人化”。

## [什么是“上下文工程”（Context Engineering）](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#%E4%BB%80%E4%B9%88%E6%98%AF%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8Bcontext-engineering)

定义：围绕一次开发/调用时需要的上下文，做获取、筛选、组织、压缩与治理的系统化方法，让输出可控、可复现。

为什么重要：模型能力接近时，谁的上下文更准、更干净、布局更好，谁的效果就稳定（更低幻觉、更高成功率、更低时延与成本）。

关键组成：

*   需求与评测：任务定义、成功指标、离线/在线评测集合。
*   上下文素材：系统约束、用户意图、few-shot、工具 schema/结果、知识片段、会话状态。
*   检索与重排：BM25/向量/混合索引，查询改写，多跳检索，重排器。
*   组织与布局：信息分区与顺序（约束→工具→证据→示例→任务）、结构化格式、引用标注。
*   压缩与预算：摘要、去重、语义压缩、token 预算策略。
*   路由与编排：模型/提示选择，Agent/工具调用，回退与重试。
*   安全与合规：过滤、输出约束、工具白名单。
*   观测与版本：日志回放、A/B、数据血缘、模板/索引版本。

和 Prompt 工程的区别：Prompt 工程偏“写好指令与示例”；上下文工程覆盖“检索、布局、压缩、路由、评测与治理”的全链路，是更大的系统工程。

常见范式：

*   RAG 2.0：查询改写 → 多索引检索 → 重排 → 证据去冗压缩 → 生成（带引用）。
*   工具增强：函数调用/工具执行 → 结果注入上下文 → 继续推理。
*   记忆体系：短期会话缓存 + 长期任务档案（可检索）。
*   模板分层：系统指令模块化 + 任务槽位化 + 证据段落。

关键指标：任务成功率、可溯源性、幻觉率、引用命中率、延迟、成本、token 利用率、召回/覆盖@k。

落地清单（速用）：

1.  定义任务与评测集合（黄金问答/任务脚本）；
2.  建索引：清洗→分块→向量/关键词混合索引→重排；
3.  设计模板：明确区块顺序与输出 JSON Schema；
4.  压缩策略：检索后做去重与摘要；
5.  上线观测：日志+回放+A/B，版本化迭代检索与模板。

示意模板（简化）：

```
# system
你是{角色}。必须遵守：{约束...}

# task
{用户意图/指令}

# tools (schema & results)
{可调用工具定义/最近一次调用结果}

# grounding (top-k)
{检索证据片段+来源}

# examples
{few-shot 边界对齐}

# output
请只输出符合此 JSON Schema 的结果：{schema}
```

## [PRD 一条路，也能跑出可控交付](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#prd-%E4%B8%80%E6%9D%A1%E8%B7%AF%E4%B9%9F%E8%83%BD%E8%B7%91%E5%87%BA%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98)

PRD 要“轻但能用”，信息以可执行为准：

*   Goals、FR/NFR、Epic、Stories、AC、Out of Scope（删赘述）。
*   最少集：
    *   文件路径/函数签名
    *   API 请求/响应与错误码
    *   数据迁移与回滚脚本
    *   配置项与灰度开关
    *   日志字段、监控指标与报警阈值

两道门槛：

1.  需求确认 ≥90 分（歧义打光且获批准）才开工；
2.  规格必须“可执行”（缺路径/签名/示例/迁移/观测的不算规格）。

流水线：确认 → 规格 → 实现 → 评审 → 测试 → 验收。评审只看：需求符合、集成可行、代码不作恶（安全/性能）、测试覆盖足够。未达标，退回。

## [角色是分工，不是目的](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#%E8%A7%92%E8%89%B2%E6%98%AF%E5%88%86%E5%B7%A5%E4%B8%8D%E6%98%AF%E7%9B%AE%E7%9A%84)

*   PO → 产出 PRD：目标/范围/AC 清楚，Out of Scope 明确。
*   Architect → 产出 system architecture：运行时、依赖、集成边界、迁移/回滚、观测前置。
*   SM → 产出 sprint plan：按“可见产物”的垂直切片排顺序。
*   Dev/QA → 执行与门控：变更清单、测试记录、质量门槛达标再过。

复杂项目、多人协作时再引角色/并行流水线，用“各自的小上下文”减少污染与负担；别为了热闹而热闹。

## [小例子：邀请码有效期](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#%E5%B0%8F%E4%BE%8B%E5%AD%90%E9%82%80%E8%AF%B7%E7%A0%81%E6%9C%89%E6%95%88%E6%9C%9F)

口径先定：

*   起算点：首次使用，不是创建；
*   时区：统一 UTC，边界秒判定清楚；
*   历史兼容：存量无有效期如何处置；
*   错误返回：错误码与 HTTP 状态码映射；
*   回退策略：迁移/回滚、灰度与开关。

规格到动作： SQL（迁移与回滚各一份）：

```
ALTER TABLE invitations ADD COLUMN expires_at TIMESTAMP NULL;
-- 回滚：ALTER TABLE invitations DROP COLUMN expires_at;
```

验证函数：

```
// 首次使用时写 first_used_at，过期返回标准错误
function validateInvitation(code: string): ValidationResult
```

API：

```
POST /invitations/validate
响应（过期）：{ "error": "INVITATION_EXPIRED", "code": 4001 }
```

观测：

*   指标：过期命中次数、拒绝率；
*   日志：校验入参、判定结论、错误码；
*   告警：拒绝率异常阈值。

测试优先级：

*   边界秒；
*   历史无有效期兼容；
*   配置变更生效路径；
*   错误码与 HTTP 状态码一致性。

## [反模式清单](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#%E5%8F%8D%E6%A8%A1%E5%BC%8F%E6%B8%85%E5%8D%95)

*   为了 Prompt 而 Prompt：词很满，事很空；
*   角色崇拜：沉迷设定，忽略可执行与可验证；
*   文档堆砌：没有路径/签名/迁移/观测的内容，都是噪音；
*   上下文泛洪：不清理、不切片，质量衰减、成本上升；
*   只跑快乐路径：边界与失败不测，后期集中爆雷。

## [落地路线](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#%E8%90%BD%E5%9C%B0%E8%B7%AF%E7%BA%BF)

1.  选一个小需求（如“邀请码有效期”）完整跑完：确认 → 规格 → 实现 → 测试；
2.  给核心模块补 `CLAUDE.md`（索引化），确保可 @ 引用到“短事实”；
3.  把 CI 门槛立起来：覆盖率、静态扫描、关键用例不过线不合并；
4.  复杂时再引 BMAD 分工与并行流水线，让各段上下文更小、更干净。

## [结语](https://stellarlink.co/articles/%E4%B8%8D%E6%98%AF%E4%B8%BA%E4%BA%86prompt%E8%80%8Cprompt-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%8F%AF%E6%8E%A7%E4%BA%A4%E4%BB%98#%E7%BB%93%E8%AF%AD)

研究 PRD、SPEC、BMAD，不是为了流程更精致，而是为了把“上下文”这件事做稳，最后得到“质量可控、人工干预极少、可走向无人化”的交付。先把上下文工程打牢，剩下的是自动化与规模化。
