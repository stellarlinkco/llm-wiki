---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1"
title: 揭开Claude Code的面纱
description: 揭开Claude Code的面纱
resource: "https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1"
tags: []
timestamp: "2026-06-20T06:46:11.093Z"
source_path: "https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1"
source_id: c14b202beeba7db20426c7e0cc8d211226eb249567096573e3b4b203acd17408
content_hash: d0e08abf4236803aa9133fc4ef0b012600b1bd4124272a9c052fdbea91399332
---

最近在看Claude Code的设计，发现一个有意思的现象：当所有AI编程助手都在卷向量索引、语义搜索的时候，Claude Code反其道而行——用Grep和Glob。

Grep，1973年诞生的文本搜索工具。Glob，Unix shell里最基础的文件匹配。

这个选择在技术圈引发了不小的争议。Milvus的博客说”Claude Code的grep-only方式会烧掉太多tokens”，HackerNews上也有人质疑：“Cursor用向量搜索，Claude用grep，这不是倒退吗？“

但Anthropic团队在访谈里透露了个细节：他们测过RAG、向量索引这些方案，最后发现这种”agentic search”（让模型智能地使用Grep/Glob）的效果反而最好。

为什么会这样？

## [什么是”Agentic Search”](https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1#%E4%BB%80%E4%B9%88%E6%98%AFagentic-search)

Claude Code的搜索能力，核心靠两个工具：

*   **Glob** - 文件模式匹配，找文件。支持`**/*.go`、`src/**/*.ts`这样的模式
*   **Grep** - 内容搜索，搜代码。支持正则表达式，可以过滤文件类型

这两个工具本身很蠢。Glob只会按文件名匹配，Grep只会按正则搜索，都不懂语义。

但当模型来驱动它们时，就不一样了。

用户说：“找处理用户认证的代码”

**传统向量索引的做法**：

```
工具: 语义搜索 "user authentication"
返回: login(), handleAuth(), verifyUser() ...
（工具自己理解语义）
```

**Claude Code的做法**：

```
模型: 先用Glob找可能相关的文件
工具: glob **/*auth*.go
返回: auth.go, auth_handler.go, middleware/auth.go

模型: 在这些文件里搜关键词
工具: grep "func.*Login" auth.go
返回: func LoginHandler(...)

模型: 读一下这个函数
工具: read auth.go:35-60
返回: 函数实现代码
```

看出区别了吗？

向量索引是让**工具**来理解语义，然后给模型喂结果。 Agentic search是让**模型**来理解语义，然后指挥工具执行。

所有的智能都在模型里，工具只负责最基础的操作。

## [为什么简单工具更好](https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1#%E4%B8%BA%E4%BB%80%E4%B9%88%E7%AE%80%E5%8D%95%E5%B7%A5%E5%85%B7%E6%9B%B4%E5%A5%BD)

传统IDE的做法是让工具自己变聪明。IntelliJ IDEA启动要构建PSI树、stub索引，运行时要维护语法树、更新索引，几个GB内存、几十个后台线程就这么没了。

Cursor更进一步，用Merkle树索引代码库，智能分块后生成向量嵌入，存到远程数据库。确实能做语义搜索——搜”用户认证”能找到login、authenticate、verifyUser这些不同命名的函数。

但问题是：当模型已经足够强大的时候，这些工具层的智能是多余的。

向量搜索失败的时候，你要调试：

*   嵌入质量有问题？
*   语义理解偏了？
*   索引过期了？
*   分块策略不对？
*   向量数据库抖动？
*   排序算法有bug？

Grep失败就一个原因：正则不匹配。改正则，重新搜。

而且，模型可以做很多向量索引做不到的事：

*   组合使用Glob和Grep，先缩小范围再精确搜索
*   根据上一次搜索结果调整策略
*   理解上下文，知道在哪些文件里搜索更有可能找到
*   出错后自我修正，换个关键词再试

这就是”agentic”的含义——让模型成为agent，工具只是手。

## [Claude Code的工具箱](https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1#claude-code%E7%9A%84%E5%B7%A5%E5%85%B7%E7%AE%B1)

看看Claude Code实际提供的工具：

**文件搜索**：

*   Glob - 按文件名模式匹配
*   Grep - 按内容搜索
*   LS - 列文件

**文件操作**：

*   Read - 读文件
*   Edit/MultiEdit - 编辑文件
*   Write - 写文件

**执行**：

*   Bash - 执行命令

**其他**：

*   WebFetch - 抓取网页
*   WebSearch - 网络搜索
*   Agent/Task - 启动子agent
*   TodoWrite - 任务管理

没有语法分析，没有类型推导，没有符号索引。都是最基础的操作。

复杂的事情交给模型：

*   代码补全 → 模型理解上下文
*   智能重构 → 模型理解语义
*   错误检查 → 模型知道类型系统
*   代码导航 → 模型组合Grep和Read
*   意图理解 → 模型本身就是

工具层保持简单，模型层承担智能。

## [无状态的优势](https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1#%E6%97%A0%E7%8A%B6%E6%80%81%E7%9A%84%E4%BC%98%E5%8A%BF)

Unix的设计哲学：每个程序只做一件事，并且做好。Grep做搜索，不管搜索结果怎么用；Glob找文件，不管文件内容是什么。

Claude Code继承了这个思想。

对比有索引的系统：

*   启动：构建索引（几分钟）
*   运行：维护索引（后台线程）
*   崩溃：恢复索引（检查一致性）
*   修改：更新索引（增量or全量？）

Grep/Glob：

*   启动：立即可用
*   运行：实时执行
*   崩溃：重启就行
*   修改：下次自动看到

每次搜索都是全新的，每次结果都是最新的。没有状态，就没有状态管理的复杂度。

这也是为什么几百行代码就能实现一个基础的agent——当你不需要维护索引、缓存、状态时，代码自然就简单了。

## [什么时候简单比复杂更好](https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1#%E4%BB%80%E4%B9%88%E6%97%B6%E5%80%99%E7%AE%80%E5%8D%95%E6%AF%94%E5%A4%8D%E6%9D%82%E6%9B%B4%E5%A5%BD)

Linus在选择宏内核vs微内核的时候说过：“微内核在理论上很美，但实践中复杂度爆炸。“

向量索引在理论上很美：

*   语义搜索，理解意图
*   上下文推荐，智能补全
*   预构建索引，搜索快

但实践中：

*   需要上传代码（隐私问题）
*   需要维护索引（一致性问题）
*   需要同步状态（分布式问题）
*   搜索失败难调试（黑盒问题）

Grep/Glob在理论上很蠢：

*   只能模式匹配
*   每次都重新搜
*   不理解语义

但实践中：

*   本地执行（零隐私风险）
*   无需维护（零一致性问题）
*   实时搜索（零同步问题）
*   行为确定（零黑盒问题）

当你有GPT-4/Claude这样的模型时，工具的”蠢”不是缺点，而是优点。因为**所有智能都在模型里，工具只要可靠就够了**。

## [2025年的启示](https://stellarlink.co/articles/%E6%8F%AD%E5%BC%80claude_code%E7%9A%84%E9%9D%A2%E7%BA%B1#2025%E5%B9%B4%E7%9A%84%E5%90%AF%E7%A4%BA)

现在回头看，Claude Code的选择并不是倒退，而是一种清醒。

在AI能力已经很强的2025年，真正稀缺的不是智能，而是：

*   **可预测性** - 工具行为确定，不是”大概率对”
*   **可调试性** - 出错能定位，不是AI黑盒
*   **可组合性** - 工具能自由组合，不是封闭系统
*   **可信赖性** - 关键时刻不掉链子

向量索引这些”聪明”的工具，在90%的场景下很酷，但在10%的关键时刻让你抓狂——当你最需要它准确的时候，它给了你”语义相似”的错误答案。

Grep/Glob这种”愚蠢”的工具，在100%的场景下都可靠。搜错了？改正则。找不到文件？换个模式。每一步都清晰可控。

作为一个程序员，我更喜欢后者。

* * *

Linus说过：“Talk is cheap. Show me the code.”

Unix哲学说：“Do one thing and do it well.”

Grep做了50年的搜索，Glob做了50年的文件匹配，现在还在用，这本身就是最好的证明。

Claude Code选择了一条看似”倒退”的路——不用向量数据库，不建代码索引，就用最基础的Unix工具。但这条路上有Unix的影子，有Linus的实用主义，有极简设计的智慧。

**在一个AI能力爆炸的时代，也许最先进的设计，就是让模型承担100%的智能，让工具保持100%的简单。**

* * *

提供 最小化 Claude Code 实现

*   Python 实现 mini-claude-code [GitHub - shareAI-lab/mini\_claude\_code: 0 -1 diy your agent cli.](https://github.com/shareAI-lab/mini_claude_code)
    
*   Golang 实现 mini-claude-code [GitHub - cexll/mini-claude-code-go: mini claude code for go](https://github.com/cexll/mini-claude-code-go)
    

* * *

_参考资料：_

1.  [谈谈Claude Code的设计哲学：为什么最好的设计是”健忘”的](https://mp.weixin.qq.com/s/hsuu0eXHRac1fPbjX7UFVw)
2.  [Claude Code: Anthropic’s Agent in Your Terminal](https://www.latent.space/p/claude-code)
3.  [How Claude Code is built - Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/how-claude-code-is-built)
4.  [Unix Philosophy](https://en.wikipedia.org/wiki/Unix_philosophy)
