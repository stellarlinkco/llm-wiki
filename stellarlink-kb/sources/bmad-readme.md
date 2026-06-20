---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/bmad-readme"
title: BMAD方法论 Claude Code 使用指南
description: BMAD方法论 Claude Code 使用指南
resource: "https://stellarlink.co/articles/bmad-readme"
tags: []
timestamp: "2026-06-20T06:45:33.966Z"
source_path: "https://stellarlink.co/articles/bmad-readme"
source_id: 0bbaecb8fbcb512b2f65c4dc74e5efcf0082198756f5c18e43a8b51416c016fa
content_hash: d5b88a8fa1497011ca4183be71f25242fb88dfacc2d5bb65e8fe14b9b008408b
---

## [BMAD方法论 Claude Code 使用指南](https://stellarlink.co/articles/bmad-readme#bmad%E6%96%B9%E6%B3%95%E8%AE%BA-claude-code-%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)

[![BMAD Method](https://img.shields.io/badge/BMAD-Method-blue)](https://github.com/bmadcode/BMAD-METHOD) [![Claude Code](https://img.shields.io/badge/Claude-Code-green)](https://claude.ai/code)

> 从产品理念到代码实现的完整AI驱动敏捷开发工作流

BMAD (Business, Market, Architecture, Development) 是一个AI驱动的敏捷开发方法论，通过专业化代理团队实现从商业需求到技术实现的完整工作流程。

### [核心理念](https://stellarlink.co/articles/bmad-readme#%E6%A0%B8%E5%BF%83%E7%90%86%E5%BF%B5)

*   **智能体规划**: 专门代理协作创建详细、一致的PRD和架构文档
*   **上下文工程开发**: 将详细计划转换为超详细的开发故事
*   **角色专业化**: 每个代理专注特定领域，避免角色切换导致的质量下降

## [🏗️ BMAD代理体系](https://stellarlink.co/articles/bmad-readme#%EF%B8%8F-bmad%E4%BB%A3%E7%90%86%E4%BD%93%E7%B3%BB)

### [代理角色说明](https://stellarlink.co/articles/bmad-readme#%E4%BB%A3%E7%90%86%E8%A7%92%E8%89%B2%E8%AF%B4%E6%98%8E)

*   **PO (Product Owner)** - 产品负责人Sarah：需求分析、用户故事、验收标准
*   **Analyst** - 业务分析师Mary：市场研究、竞争分析、商业案例
*   **Architect** - 系统架构师Winston：技术架构、系统设计、技术选择
*   **SM (Scrum Master)** - 敏捷教练：任务分解、冲刺规划、流程协调
*   **Dev (Developer)** - 开发工程师：代码实现、技术文档
*   **QA (Quality Assurance)** - 质量保证：测试策略、质量验证
*   **UX Expert** - 用户体验专家：交互设计、可用性测试

## [🚀 快速开始](https://stellarlink.co/articles/bmad-readme#-%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)

### [安装配置](https://stellarlink.co/articles/bmad-readme#%E5%AE%89%E8%A3%85%E9%85%8D%E7%BD%AE)

BMAD方法论已集成到您的Claude Code系统中，无需额外安装。

### [基本使用方法](https://stellarlink.co/articles/bmad-readme#%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)

#### [1\. 完整BMAD工作流](https://stellarlink.co/articles/bmad-readme#1-%E5%AE%8C%E6%95%B4bmad%E5%B7%A5%E4%BD%9C%E6%B5%81)

```
# 一键执行完整开发流程
/bmad-pilot "实现企业级用户管理系统，支持RBAC权限控制和LDAP集成"

# 执行流程：PO → Architect → SM → Dev → QA
```

#### [2\. 常用选项](https://stellarlink.co/articles/bmad-readme#2-%E5%B8%B8%E7%94%A8%E9%80%89%E9%A1%B9)

```
# 跳过测试（PO → Architect → SM → Dev）
/bmad-pilot "实现支付网关API" --skip-tests

# 直接从架构进入开发（跳过 SM 规划）
/bmad-pilot "设计微服务电商平台" --direct-dev

# 跳过仓库扫描（不推荐）
/bmad-pilot "用户界面优化" --skip-scan
```

#### [3\. 直接开发与部分流程](https://stellarlink.co/articles/bmad-readme#3-%E7%9B%B4%E6%8E%A5%E5%BC%80%E5%8F%91%E4%B8%8E%E9%83%A8%E5%88%86%E6%B5%81%E7%A8%8B)

```
# 技术焦点（架构后直接进入开发与测试）
/bmad-pilot "API网关实现" --direct-dev

# 完整设计流程（需求→架构→规划→开发→测试）
/bmad-pilot "系统重构规划"

# 仅业务相关分析 → 请使用下方“独立代理使用”中的 /bmad-po 与 /bmad-analyst
```

#### [4\. 独立代理使用](https://stellarlink.co/articles/bmad-readme#4-%E7%8B%AC%E7%AB%8B%E4%BB%A3%E7%90%86%E4%BD%BF%E7%94%A8)

```
# 产品需求分析
/bmad-po "企业CRM系统功能需求定义"

# 市场调研分析
/bmad-analyst "SaaS市场竞争格局和机会分析"

# 系统架构设计
/bmad-architect "高并发分布式系统架构设计"

# 主协调器（可转换为任意代理）
/bmad-orchestrator "协调多代理完成复杂项目"
```

## [📋 详细命令说明](https://stellarlink.co/articles/bmad-readme#-%E8%AF%A6%E7%BB%86%E5%91%BD%E4%BB%A4%E8%AF%B4%E6%98%8E)

### [`/bmad-pilot` - 完整工作流执行](https://stellarlink.co/articles/bmad-readme#bmad-pilot---%E5%AE%8C%E6%95%B4%E5%B7%A5%E4%BD%9C%E6%B5%81%E6%89%A7%E8%A1%8C)

**用法**: `/bmad-pilot <项目描述> [选项]`

**选项**:

*   `--skip-tests`: 跳过 QA 阶段
*   `--direct-dev`: 跳过 SM 冲刺计划，架构后直接进入开发
*   `--skip-scan`: 跳过初始仓库扫描（不推荐）

**示例**:

```
/bmad-pilot "构建在线教育平台，支持直播、录播、作业系统"
/bmad-pilot "API网关设计" --direct-dev
/bmad-pilot "支付模块" --skip-tests
```

### [`/bmad-po` - 产品负责人](https://stellarlink.co/articles/bmad-readme#bmad-po---%E4%BA%A7%E5%93%81%E8%B4%9F%E8%B4%A3%E4%BA%BA)

**角色**: Sarah - 技术产品负责人 & 流程管家 **专长**: 需求分析、用户故事、验收标准、冲刺规划

**用法**: `/bmad-po <需求描述>`

**工作流程**:

1.  需求分解和功能点识别
2.  用户故事创建（As a… I want… So that…）
3.  验收标准定义和优先级排序
4.  利益相关者验证和签署

**示例**:

```
/bmad-po "设计企业级权限管理系统，支持多租户和细粒度权限控制"
/bmad-po "移动端电商APP功能需求分析"
```

### [`/bmad-analyst` - 业务分析师](https://stellarlink.co/articles/bmad-readme#bmad-analyst---%E4%B8%9A%E5%8A%A1%E5%88%86%E6%9E%90%E5%B8%88)

**角色**: Mary - 洞察分析师 & 战略合作伙伴 **专长**: 市场研究、竞争分析、商业案例开发、利益相关者分析

**用法**: `/bmad-analyst <分析主题>`

**工作流程**:

1.  市场格局和竞争对手分析
2.  商业案例开发和ROI分析
3.  利益相关者分析和需求收集
4.  项目简报和战略建议

**示例**:

```
/bmad-analyst "企业级认证市场分析，JWT vs OAuth2.0 vs SAML"
/bmad-analyst "云原生架构迁移的商业价值和风险评估"
```

### [`/bmad-architect` - 系统架构师](https://stellarlink.co/articles/bmad-readme#bmad-architect---%E7%B3%BB%E7%BB%9F%E6%9E%B6%E6%9E%84%E5%B8%88)

**角色**: Winston - 全栈系统架构师 & 技术领导者 **专长**: 系统设计、技术选择、API设计、基础架构规划

**用法**: `/bmad-architect <系统设计需求>`

**工作流程**:

1.  系统需求和约束分析
2.  技术栈和架构模式选择
3.  组件设计和系统架构图
4.  实施策略和开发指导

**示例**:

```
/bmad-architect "微服务架构设计，支持事件驱动和最终一致性"
/bmad-architect "高可用API网关架构，支持限流、熔断、监控"
```

### [`/bmad-orchestrator` - 主协调器](https://stellarlink.co/articles/bmad-readme#bmad-orchestrator---%E4%B8%BB%E5%8D%8F%E8%B0%83%E5%99%A8)

**角色**: BMAD主协调器 **专长**: 工作流协调、代理转换、多代理任务管理

**用法**: `/bmad-orchestrator [命令] [参数]`

**功能**:

*   动态转换为任意专门代理
*   协调复杂多代理工作流
*   管理代理间的上下文传递
*   提供工作流指导和建议

## [🔄 与现有系统集成](https://stellarlink.co/articles/bmad-readme#-%E4%B8%8E%E7%8E%B0%E6%9C%89%E7%B3%BB%E7%BB%9F%E9%9B%86%E6%88%90)

### [现有系统 vs BMAD方法论](https://stellarlink.co/articles/bmad-readme#%E7%8E%B0%E6%9C%89%E7%B3%BB%E7%BB%9F-vs-bmad%E6%96%B9%E6%B3%95%E8%AE%BA)

特性

Requirements-Pilot

BMAD方法论

**执行时间**

30分钟

1-2小时

**适用场景**

快速功能开发

企业级项目

**覆盖范围**

技术实现

商业+技术全流程

**质量门控**

90%技术质量

多维度质量验证

**代理数量**

4个技术代理

7个全角色代理

### [使用场景建议](https://stellarlink.co/articles/bmad-readme#%E4%BD%BF%E7%94%A8%E5%9C%BA%E6%99%AF%E5%BB%BA%E8%AE%AE)

#### [🚅 快速开发（推荐现有系统）](https://stellarlink.co/articles/bmad-readme#-%E5%BF%AB%E9%80%9F%E5%BC%80%E5%8F%91%E6%8E%A8%E8%8D%90%E7%8E%B0%E6%9C%89%E7%B3%BB%E7%BB%9F)

```
# 简单功能快速实现
/requirements-pilot "添加用户登录功能"
/requirements-pilot "实现数据导出API"
```

#### [🏢 企业级项目（推荐BMAD）](https://stellarlink.co/articles/bmad-readme#-%E4%BC%81%E4%B8%9A%E7%BA%A7%E9%A1%B9%E7%9B%AE%E6%8E%A8%E8%8D%90bmad)

```
# 复杂系统完整流程
/bmad-pilot "构建企业级ERP系统，集成财务、人事、项目管理模块"
/bmad-pilot "设计多租户SaaS平台，支持自定义配置和第三方集成"
```

#### [🔄 混合模式（规划+实现）](https://stellarlink.co/articles/bmad-readme#-%E6%B7%B7%E5%90%88%E6%A8%A1%E5%BC%8F%E8%A7%84%E5%88%92%E5%AE%9E%E7%8E%B0)

```
# 先用BMAD做规划（在 PRD/架构确认门停留）
/bmad-pilot "电商平台架构设计"

# 再用现有系统快速实现
/requirements-pilot "基于架构规格实现用户服务模块"
/requirements-pilot "基于架构规格实现订单服务模块"
```

## [🎯 典型工作流示例](https://stellarlink.co/articles/bmad-readme#-%E5%85%B8%E5%9E%8B%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%A4%BA%E4%BE%8B)

### [示例1: 企业级认证系统](https://stellarlink.co/articles/bmad-readme#%E7%A4%BA%E4%BE%8B1-%E4%BC%81%E4%B8%9A%E7%BA%A7%E8%AE%A4%E8%AF%81%E7%B3%BB%E7%BB%9F)

```
# 完整BMAD流程
/bmad-pilot "企业级JWT认证系统，支持RBAC权限控制、LDAP集成、审计日志、高可用部署"

# 预期输出：
# 1. PO: 详细用户故事和验收标准
# 2. Architect: 完整系统架构和技术选择
# 3. SM: 开发任务分解和冲刺计划
# 4. Dev: 生产就绪代码实现
# 5. QA: 测试策略与用例并执行（可选）
```

### [示例2: API网关开发](https://stellarlink.co/articles/bmad-readme#%E7%A4%BA%E4%BE%8B2-api%E7%BD%91%E5%85%B3%E5%BC%80%E5%8F%91)

```
# 技术焦点流程（跳过SM，架构后直接进入开发）
/bmad-pilot "高性能API网关，支持限流、熔断、监控、服务发现" --direct-dev

# 执行流程：
# 1. Architect: 系统架构设计
# 2. Dev: 代码实现
# 3. QA: 性能测试和质量验证
```

### [示例3: 产品市场分析](https://stellarlink.co/articles/bmad-readme#%E7%A4%BA%E4%BE%8B3-%E4%BA%A7%E5%93%81%E5%B8%82%E5%9C%BA%E5%88%86%E6%9E%90)

```
# 业务分析流程（使用独立代理）
/bmad-po "云原生数据库市场机会分析的产品需求假设与范围界定"
/bmad-analyst "云原生数据库市场机会分析"

# 执行流程：
# 1. PO: 产品需求定义
# 2. Analyst: 市场研究和竞争分析
```

## [📊 质量保证体系](https://stellarlink.co/articles/bmad-readme#-%E8%B4%A8%E9%87%8F%E4%BF%9D%E8%AF%81%E4%BD%93%E7%B3%BB)

### [BMAD质量标准](https://stellarlink.co/articles/bmad-readme#bmad%E8%B4%A8%E9%87%8F%E6%A0%87%E5%87%86)

*   **需求完整性**: 90+ 分需求清晰度评分
*   **商业对齐**: 明确的价值主张和市场定位
*   **架构完善**: 全面的系统设计和技术选择
*   **实现就绪**: 可执行的开发规格和质量标准

### [集成现有质量门控](https://stellarlink.co/articles/bmad-readme#%E9%9B%86%E6%88%90%E7%8E%B0%E6%9C%89%E8%B4%A8%E9%87%8F%E9%97%A8%E6%8E%A7)

*   保持90%技术质量阈值
*   增加商业价值验证维度
*   多代理交叉验证机制
*   自动化质量反馈循环

## [🔧 高级用法和最佳实践](https://stellarlink.co/articles/bmad-readme#-%E9%AB%98%E7%BA%A7%E7%94%A8%E6%B3%95%E5%92%8C%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)

### [1\. 渐进式复杂度管理](https://stellarlink.co/articles/bmad-readme#1-%E6%B8%90%E8%BF%9B%E5%BC%8F%E5%A4%8D%E6%9D%82%E5%BA%A6%E7%AE%A1%E7%90%86)

```
# MVP阶段
/bmad-workflow "用户管理系统MVP版本" --phase=development

# 功能增强阶段
/bmad-analyst "用户反馈分析和功能增强建议"
/requirements-pilot "基于反馈实现增强功能"

# 企业级增强
/bmad-workflow "企业级安全增强和合规支持" --agents=architect,dev,qa
```

### [2\. 跨项目知识管理](https://stellarlink.co/articles/bmad-readme#2-%E8%B7%A8%E9%A1%B9%E7%9B%AE%E7%9F%A5%E8%AF%86%E7%AE%A1%E7%90%86)

```
# 项目文档化
/bmad-orchestrator "将当前项目架构文档化，便于后续项目参考"

# 最佳实践提取
/bmad-architect "基于项目经验总结微服务架构最佳实践"
```

### [3\. 团队协作优化](https://stellarlink.co/articles/bmad-readme#3-%E5%9B%A2%E9%98%9F%E5%8D%8F%E4%BD%9C%E4%BC%98%E5%8C%96)

```
# 团队能力评估
/bmad-analyst "评估团队技术栈和能力匹配度"

# 开发计划调整
/bmad-po "根据团队能力调整功能优先级和实现计划"
```

## [🚦 故障排除](https://stellarlink.co/articles/bmad-readme#-%E6%95%85%E9%9A%9C%E6%8E%92%E9%99%A4)

### [常见问题](https://stellarlink.co/articles/bmad-readme#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)

**Q: BMAD工作流执行时间较长，如何优化？** A:

*   简单功能使用 `/requirements-pilot`
*   复杂项目使用分阶段执行 `--phase=planning`
*   使用自定义代理序列减少不必要的步骤

**Q: 如何在BMAD和现有系统间选择？** A:

*   项目复杂度 < 中等：使用 `/requirements-pilot`
*   项目复杂度 ≥ 高：使用 `/bmad-workflow`
*   需要商业分析：必须使用BMAD
*   纯技术实现：可选择任一系统

**Q: 代理输出质量不符合预期怎么办？** A:

*   提供更详细的项目描述
*   使用分阶段执行，逐步细化
*   结合独立代理使用进行专项优化

## [🎉 开始你的BMAD之旅](https://stellarlink.co/articles/bmad-readme#-%E5%BC%80%E5%A7%8B%E4%BD%A0%E7%9A%84bmad%E4%B9%8B%E6%97%85)

### [第一次使用](https://stellarlink.co/articles/bmad-readme#%E7%AC%AC%E4%B8%80%E6%AC%A1%E4%BD%BF%E7%94%A8)

```
# 体验完整BMAD工作流
/bmad-workflow "构建一个简单的博客系统，支持文章发布、评论、用户管理"
```

### [学习不同代理角色](https://stellarlink.co/articles/bmad-readme#%E5%AD%A6%E4%B9%A0%E4%B8%8D%E5%90%8C%E4%BB%A3%E7%90%86%E8%A7%92%E8%89%B2)

```
# 产品思维
/bmad-po "分析博客系统的用户需求和使用场景"

# 商业思维
/bmad-analyst "个人博客vs企业CMS市场定位分析"

# 技术思维
/bmad-architect "可扩展博客系统架构设计"
```

## [📚 进阶学习资源](https://stellarlink.co/articles/bmad-readme#-%E8%BF%9B%E9%98%B6%E5%AD%A6%E4%B9%A0%E8%B5%84%E6%BA%90)

*   [BMAD-METHOD原理](https://github.com/bmadcode/BMAD-METHOD)
*   [Claude Code文档](https://docs.anthropic.com/en/docs/claude-code)
*   [敏捷开发最佳实践](https://agilemanifesto.org/)

* * *

**BMAD方法论 + Claude Code = 从理念到代码的完整AI开发工作流** 🚀

开始使用BMAD方法论，体验专业化AI代理团队带来的开发效率和质量提升！
