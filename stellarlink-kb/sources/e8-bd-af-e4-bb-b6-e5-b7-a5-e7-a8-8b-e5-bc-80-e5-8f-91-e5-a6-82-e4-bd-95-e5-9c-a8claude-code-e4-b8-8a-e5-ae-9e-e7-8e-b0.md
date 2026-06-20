---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0"
title: 软件工程开发如何在Claude Code上实现
description: 软件工程开发如何在Claude Code上实现
resource: "https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0"
tags: []
timestamp: "2026-06-20T06:46:14.626Z"
source_path: "https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0"
source_id: e3d045f60fb27f762e5c254178a1542ecaf09864a7a282c83e9fbf719c78e964
content_hash: b75135f85a083755508570931e30a23337010cfc57537876716690f7e9e82337
---

* * *

## [软件工程开发如何在Claude Code上实现](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0-1)

最近在折腾Claude Code的时候，发现这玩意儿确实能够系统性地解决软件开发中的问题。不是那种玩具级别的代码助手，而是真正能够从需求分析到代码部署全流程覆盖的工具。今天就来聊聊如何通过自定义命令把整个软件工程流程跑通。

## [核心思路：从文档驱动到代码实现](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E6%A0%B8%E5%BF%83%E6%80%9D%E8%B7%AF%E4%BB%8E%E6%96%87%E6%A1%A3%E9%A9%B1%E5%8A%A8%E5%88%B0%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0)

整个工作流的核心逻辑很简单：**先把需求搞清楚，再写代码，最后验证**。但实际操作中，大部分团队都是直接上手写代码，需求文档要么没有，要么写完就束之高阁。Claude Code通过自定义命令可以强制执行这个流程。

### [主要工作流程](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E4%B8%BB%E8%A6%81%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%A8%8B)

```
需求分析(/ask) → 代码实现(/code) → 测试用例(/test) → 代码审查(/review) → 优化调整(/optimize, /refactor)
```

这不是什么新鲜概念，但关键在于每个环节都有明确的输入输出，而且可以自动化执行。

## [核心命令详解](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E6%A0%B8%E5%BF%83%E5%91%BD%E4%BB%A4%E8%AF%A6%E8%A7%A3)

### [/ask - 需求分析和架构设计](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#ask---%E9%9C%80%E6%B1%82%E5%88%86%E6%9E%90%E5%92%8C%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1)

这个命令的作用是把模糊的业务需求转化为技术文档。不是简单的问答，而是系统性的架构分析。

**实际使用场景：**

```
/ask 设计一个支持千万级用户的电商平台的微服务架构
```

输出会包含：

*   系统边界定义
*   技术栈选择理由
*   非功能性需求分析
*   潜在风险点识别

关键在于它会强制你思考那些平时容易忽略的问题，比如数据一致性、服务间通信、故障恢复等。输出的文档直接保存到`docs`目录，后续所有开发工作都以此为准。

### [/code - 从文档到代码实现](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#code---%E4%BB%8E%E6%96%87%E6%A1%A3%E5%88%B0%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0)

有了需求文档，`/code`命令会基于文档内容生成具体的代码实现。不是那种简单的代码片段，而是完整的、可运行的代码。

**实际使用场景：**

```
/code @/docs/points_system.md 基于技术方案文档生成代码
```

**请一定要开启Plan模式**

**工作机制：**

*   读取`docs`目录下的需求文档
*   分析现有代码库结构
*   生成符合项目规范的代码
*   确保与现有系统的兼容性

这里有个细节很重要：它不会凭空生成代码，而是基于你的项目上下文。比如你用的是Spring Boot，它就会生成Spring Boot风格的代码；你用的是Node.js，它就会生成Express风格的代码。

### [/test - 测试用例生成](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#test---%E6%B5%8B%E8%AF%95%E7%94%A8%E4%BE%8B%E7%94%9F%E6%88%90)

测试驱动开发（TDD）说了这么多年，真正执行的团队不多。主要原因是写测试用例太费时间，而且很多开发者不知道该测什么。

`/test`命令解决的就是这个问题：

*   基于需求文档自动生成测试用例
*   覆盖单元测试、集成测试、边界条件测试
*   生成可执行的测试代码，不是伪代码

**实际使用场景：**

```
/test @/docs/points_system.md 基于技术方案文档生成单元测试
```

\*\*实际效果：\*\*如果你写了一个用户认证模块，它会自动生成：

*   正常登录流程测试
*   密码错误测试
*   账号锁定测试
*   并发登录测试
*   SQL注入防护测试

### [/review - 文档与代码一致性检查](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#review---%E6%96%87%E6%A1%A3%E4%B8%8E%E4%BB%A3%E7%A0%81%E4%B8%80%E8%87%B4%E6%80%A7%E6%A3%80%E6%9F%A5)

这是整个流程中最关键的一环。很多项目的问题就在于代码和文档不一致，时间长了就没人知道系统到底是怎么设计的。

**实际使用场景：**

```
/review @/docs/points_system.md 基于技术方案文档检查代码是否符合 列出不符合内容以及二次优化方案
```

`/review`命令会：

*   对比需求文档和实际代码
*   检查代码质量和安全问题
*   验证性能和可扩展性
*   识别架构偏离

如果发现问题，会明确指出哪里不符合预期，以及具体的修改建议。

### [/optimize 和 /refactor - 问题修复和优化](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#optimize-%E5%92%8C-refactor---%E9%97%AE%E9%A2%98%E4%BF%AE%E5%A4%8D%E5%92%8C%E4%BC%98%E5%8C%96)

当`/review`发现问题后，就需要用这两个命令来修复：

**实际使用场景：**

```
/refactor @/docs/points_system.md 基于技术方案文档优化/重构代码
```

**`/optimize`** 主要处理性能问题：

*   算法复杂度优化
*   资源使用优化
*   并发处理优化
*   缓存策略调整

**`/refactor`** 主要处理代码结构问题：

*   设计模式应用
*   代码复用性提升
*   可维护性改进
*   技术债务清理

## [实际开发案例](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E5%AE%9E%E9%99%85%E5%BC%80%E5%8F%91%E6%A1%88%E4%BE%8B)

举个具体例子，开发一个用户认证系统：

### [第一步：需求分析](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E7%AC%AC%E4%B8%80%E6%AD%A5%E9%9C%80%E6%B1%82%E5%88%86%E6%9E%90)

```
/ask 设计支持JWT的用户认证系统，包含登录、注册、密码重置功能
```

输出文档包含：

*   API接口设计
*   数据库表结构
*   安全策略
*   错误处理机制

### [第二步：代码实现](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E7%AC%AC%E4%BA%8C%E6%AD%A5%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0)

```
/code 实现用户认证系统的后端API
```

生成完整的后端代码，包括：

*   Controller层接口
*   Service层业务逻辑
*   Repository层数据访问
*   JWT工具类
*   异常处理

### [第三步：测试用例](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E7%AC%AC%E4%B8%89%E6%AD%A5%E6%B5%8B%E8%AF%95%E7%94%A8%E4%BE%8B)

```
/test 用户认证功能的全面测试
```

自动生成：

*   单元测试（每个方法）
*   集成测试（API接口）
*   安全测试（注入攻击防护）
*   性能测试（并发场景）

### [第四步：代码审查](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E7%AC%AC%E5%9B%9B%E6%AD%A5%E4%BB%A3%E7%A0%81%E5%AE%A1%E6%9F%A5)

```
/review 用户认证模块
```

检查结果可能包括：

*   密码加密强度不够
*   缺少请求频率限制
*   错误信息泄露敏感信息
*   数据库查询可以优化

### [第五步：问题修复](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E7%AC%AC%E4%BA%94%E6%AD%A5%E9%97%AE%E9%A2%98%E4%BF%AE%E5%A4%8D)

```
/optimize 用户认证API性能优化/refactor 用户认证代码结构优化
```

针对review发现的问题进行修复和优化。

## [实际使用体验](https://stellarlink.co/articles/%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B%E5%BC%80%E5%8F%91%E5%A6%82%E4%BD%95%E5%9C%A8claude-code%E4%B8%8A%E5%AE%9E%E7%8E%B0#%E5%AE%9E%E9%99%85%E4%BD%BF%E7%94%A8%E4%BD%93%E9%AA%8C)

用了一段时间后，发现几个明显的好处：

**1\. 强制规范化流程**不能再随意跳过文档和测试环节，因为后续的命令都依赖前面的输出。

**2\. 提高代码质量**自动化的review能发现很多人工容易忽略的问题，特别是安全和性能方面。

**3\. 减少返工**前期把需求和架构想清楚，后面写代码就很少需要大改。

**4\. 知识沉淀**每个项目都有完整的文档记录，新人接手或者后期维护都很方便。

当然也有一些限制：

**1\. 学习成本**需要适应这种工作方式，习惯了直接写代码的开发者可能不太适应。

**2\. 命令设计复杂**每个命令的提示词都很长，需要仔细调优才能达到理想效果。

**3\. 上下文依赖**命令之间有强依赖关系，中间某个环节出问题会影响后续流程。

**4\. LLM上下文限制**每个命令执行时必须要使用`/clear`清理上下文，否则被Claude code自动压缩后质量降低非常多。

> 自定义commands 提示词文档 [https://claude.ai/public/artifacts/e2725e41-cca5-48e5-9c15-6eab92012e75](https://claude.ai/public/artifacts/e2725e41-cca5-48e5-9c15-6eab92012e75)
