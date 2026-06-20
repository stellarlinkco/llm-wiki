---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid"
title: 三个魔法词让Claude Code写出更可用的代码：KISS、YAGNI、SOLID
description: 三个魔法词让Claude Code写出更可用的代码 KISS YAGNI SOLID
resource: "https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid"
tags: []
timestamp: "2026-06-20T06:46:02.901Z"
source_path: "https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid"
source_id: 8ff48843955bae69960b7590689c109f6b760e4672d3bae66f3862816005ba17
content_hash: 8895770b499f31ff64c6cbfd87b45760a84a5734a7aeb8b1eae57a3f11dcf50a
---

用Claude Code写代码时遇到过这种情况吗？明明只要一个简单的登录功能，Claude却给你生成了包含OAuth、策略模式、完整权限框架的几百行代码。用是能用，但维护起来简直是噩梦。

之前我也被这种”过度聪明”的代码折磨过，直到发现了一个简单技巧：在提示词里加上三个开发原则。效果立竿见影——代码长度直接砍半，可读性大幅提升。

## [Claude为什么会过度设计？](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#claude%E4%B8%BA%E4%BB%80%E4%B9%88%E4%BC%9A%E8%BF%87%E5%BA%A6%E8%AE%BE%E8%AE%A1)

使用Claude Code时，经常会遇到这些问题：

*   要个简单功能，给你整套架构
*   代码充满各种”万一”的预留接口
*   明明几行能解决，非要搞出复杂的抽象层
*   看起来很专业，实际根本用不上

原因很简单：AI习惯展示全面的技术能力，但实际项目需要的是能用、好维护的代码。

## [三个原则，改变一切](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E4%B8%89%E4%B8%AA%E5%8E%9F%E5%88%99%E6%94%B9%E5%8F%98%E4%B8%80%E5%88%87)

### [KISS (Keep It Simple, Stupid)](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#kiss-keep-it-simple-stupid)

直译就是”保持简单”，核心思想：

*   能用最直接的方法解决，就别绕弯子
*   代码要让同事一眼看懂
*   复杂的设计模式不是炫技工具

### [YAGNI (You Aren’t Gonna Need It)](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#yagni-you-arent-gonna-need-it)

“你不会需要它”，专治过度设计：

*   当前版本用不到的功能，一律不写
*   别为了”将来可能”的需求提前铺路
*   真需要时再加，重构比预设更可靠

### [SOLID原则](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#solid%E5%8E%9F%E5%88%99)

五个设计原则的合集，确保代码结构不乱：

*   每个类/函数只干一件事
*   代码易于扩展和维护
*   接口设计清晰合理

## [实际使用效果如何？](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E5%AE%9E%E9%99%85%E4%BD%BF%E7%94%A8%E6%95%88%E6%9E%9C%E5%A6%82%E4%BD%95)

### [最简单的用法](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E6%9C%80%E7%AE%80%E5%8D%95%E7%9A%84%E7%94%A8%E6%B3%95)

在任何代码请求前加上这三个原则：

```
请遵循KISS、YAGNI、SOLID原则，实现一个用户登录功能
```

**直接对比：**

之前的请求：`实现用户登录功能` 结果：OAuth集成、多重认证策略、权限管理系统…

现在的请求：`请遵循KISS、YAGNI、SOLID原则，实现基本的用户登录功能`  
结果：简洁的用户名密码验证、基础JWT认证、清晰的错误处理。

代码从300行缩减到80行，功能完全够用。

### [结合Claude Code命令使用](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E7%BB%93%E5%90%88claude-code%E5%91%BD%E4%BB%A4%E4%BD%BF%E7%94%A8)

#### [直接改造现有命令](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E7%9B%B4%E6%8E%A5%E6%94%B9%E9%80%A0%E7%8E%B0%E6%9C%89%E5%91%BD%E4%BB%A4)

```
/ask 设计用户认证系统，要求遵循KISS、YAGNI、SOLID原则
/code 实现认证功能，遵循KISS、YAGNI、SOLID原则
/review 检查代码是否符合KISS、YAGNI、SOLID原则
```

#### [创建专用命令](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E5%88%9B%E5%BB%BA%E4%B8%93%E7%94%A8%E5%91%BD%E4%BB%A4)

我在`~/.claude/commands/`目录下创建了`simple.md`文件：

```
# Simple Code Generation

你是一个注重代码质量的开发者，请严格遵循以下原则：

## 核心原则
- **KISS (Keep It Simple, Stupid)**: 选择最简单有效的解决方案
- **YAGNI (You Aren't Gonna Need It)**: 只实现当前明确需要的功能  
- **SOLID**: 确保代码设计合理，职责清晰

## 开发要求
1. **先理解需求** - 不要急着写代码，先确认要解决什么问题
2. **最小实现** - 用最少的代码解决核心问题
3. **避免过度设计** - 不要添加"可能用得上"的功能
4. **保持清晰** - 代码要容易理解和维护

## 禁止行为
- 过度抽象和复杂的设计模式
- 添加当前用不到的配置项
- 为了"扩展性"而增加复杂度
- 实现规格说明之外的功能

请基于这些原则完成开发任务。
```

使用方式：

```
/simple 实现用户注册功能
```

#### [方法三：结合现有工作流](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E6%96%B9%E6%B3%95%E4%B8%89%E7%BB%93%E5%90%88%E7%8E%B0%E6%9C%89%E5%B7%A5%E4%BD%9C%E6%B5%81)

利用Claude Code的`/spec`工作流，在每个阶段都强调简洁原则：

```
/spec 实现商品管理功能，全程遵循KISS、YAGNI、SOLID原则，避免过度设计
```

### [真实案例：重构一个API接口](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E7%9C%9F%E5%AE%9E%E6%A1%88%E4%BE%8B%E9%87%8D%E6%9E%84%E4%B8%80%E4%B8%AAapi%E6%8E%A5%E5%8F%A3)

#### [之前的代码（用传统方式生成）](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E4%B9%8B%E5%89%8D%E7%9A%84%E4%BB%A3%E7%A0%81%E7%94%A8%E4%BC%A0%E7%BB%9F%E6%96%B9%E5%BC%8F%E7%94%9F%E6%88%90)

请求：`/code 实现用户注册API`

生成了包含：

*   复杂的验证器类层次结构
*   抽象的用户工厂模式
*   预留的多种认证方式接口
*   各种”可能用到”的配置项

结果：280行代码，看起来很专业，但团队新人要花半天才能理解。

#### [现在的代码（应用三原则）](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E7%8E%B0%E5%9C%A8%E7%9A%84%E4%BB%A3%E7%A0%81%E5%BA%94%E7%94%A8%E4%B8%89%E5%8E%9F%E5%88%99)

请求：`/simple 实现基本的用户注册，只需要邮箱、密码、确认密码`

生成的代码：

*   直接的输入验证
*   简单的密码加密
*   基础的数据库操作
*   清晰的错误返回

结果：65行代码，新人5分钟就能上手修改。

这就是区别——同样的功能，实用性天差地别。

#### [具体实施步骤](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E5%85%B7%E4%BD%93%E5%AE%9E%E6%96%BD%E6%AD%A5%E9%AA%A4)

**第一步：明确需求**

```
/ask 设计最简单的用户认证，只需要注册、登录、验证token三个功能，遵循KISS原则
```

**第二步：简洁实现**

```
/code 基于需求实现用户认证，严格遵循YAGNI原则，不添加额外功能
```

**第三步：质量检查**

```
/review 检查认证代码是否符合SOLID原则，是否存在过度设计
```

### [配置项目级原则](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E9%85%8D%E7%BD%AE%E9%A1%B9%E7%9B%AE%E7%BA%A7%E5%8E%9F%E5%88%99)

在项目的`CLAUDE.md`中添加全局约束：

```
# 代码开发原则

## 必须遵循的原则
- **KISS**: 保持简单，优先可读性
- **YAGNI**: 只做当前需要的，不要预设功能
- **SOLID**: 确保设计合理，职责清晰

## 开发约束
- 新功能只实现明确的需求
- 避免"可能用得上"的设计
- 优先简单直接的解决方案
- 代码要让团队新人也能理解

请在所有代码生成中严格遵循这些原则。
```

## [实际效果总结](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E5%AE%9E%E9%99%85%E6%95%88%E6%9E%9C%E6%80%BB%E7%BB%93)

使用这三个原则几个月后，项目的变化：

### [代码质量改善](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E4%BB%A3%E7%A0%81%E8%B4%A8%E9%87%8F%E6%94%B9%E5%96%84)

*   新功能代码行数平均减少40%
*   团队code review时间缩短一半
*   线上bug率明显下降

### [开发效率提升](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E5%BC%80%E5%8F%91%E6%95%88%E7%8E%87%E6%8F%90%E5%8D%87)

*   不用花时间理解复杂的设计模式
*   新成员上手速度快了很多
*   重构和维护变得简单

### [使用建议](https://stellarlink.co/articles/%E4%B8%89%E4%B8%AA%E9%AD%94%E6%B3%95%E8%AF%8D%E8%AE%A9claude-code%E5%86%99%E5%87%BA%E6%9B%B4%E4%BC%98%E9%9B%85%E7%9A%84%E4%BB%A3%E7%A0%81-kiss-yagni-solid#%E4%BD%BF%E7%94%A8%E5%BB%BA%E8%AE%AE)

1.  **明确当前需求**
    
    ```
    /code 实现当前版本需要的用户搜索，不考虑复杂搜索条件
    ```
    
2.  **限制功能范围**
    
    ```
    /simple 只实现基本文件上传，不需要批量、进度条等功能
    ```
    
3.  **避免过度抽象**
    
    ```
    /code 直接实现订单创建，不使用工厂模式或策略模式
    ```
    

记住核心一点：让Claude回归解决问题的本质，而不是展示技术。

在任何提示词前加上”请遵循KISS、YAGNI、SOLID原则”，你会发现代码变得更实用、更好维护。毕竟最好的代码不是最复杂的，而是最有效解决问题的。
