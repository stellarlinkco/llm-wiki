---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F"
title: Code Mode：使用MCP的更好方式
description: Code Mode 使用MCP的更好方式
resource: "https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F"
tags: []
timestamp: "2026-06-20T06:45:41.729Z"
source_path: "https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F"
source_id: 75729afe3f283497a61a1fe5111fa2d9f36390dd11cc47b7958370a0a6662251
content_hash: 44e44c63d60645d8fc8b7b98bb4427dc98440fb37ef1ab93904dc5b9c4609976
---

> 原文：[Code Mode: the better way to use MCP](https://blog.cloudflare.com/code-mode/) 作者：Kenton Varda, Sunil Pai 发布时间：2025年9月26日

事实证明，我们一直以来使用MCP的方式都是错误的。

目前大多数智能体使用MCP的方式是直接将”工具”暴露给[大语言模型（LLM）](https://www.cloudflare.com/learning/ai/what-is-large-language-model/)。

我们尝试了一种不同的方法：将MCP工具转换为TypeScript API，然后让LLM编写调用该API的代码。

结果令人震撼：

1.  **我们发现，当工具以TypeScript API的形式呈现时，智能体能够处理更多数量和更复杂的工具，而不是直接暴露工具。** 这可能是因为LLM的训练集中包含了大量真实世界的TypeScript代码，但只有少量人为构造的工具调用示例。
    
2.  **当智能体需要串联多个调用时，这种方法尤其出色。** 使用传统方法时，每个工具调用的输出必须先输入到LLM的神经网络中，然后才能复制到下一个调用的输入中，浪费了时间、能源和token。而当LLM可以编写代码时，它可以跳过所有这些步骤，只读取它需要的最终结果。
    

简而言之，**LLM在编写代码调用MCP方面比直接调用MCP更出色**。

## [什么是MCP？](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E4%BB%80%E4%B9%88%E6%98%AFmcp)

对于不熟悉的人来说：[模型上下文协议（Model Context Protocol）](https://modelcontextprotocol.io/docs/getting-started/intro)是一个标准协议，用于为AI智能体提供外部工具访问权限，使它们能够直接执行工作，而不仅仅是与你聊天。

换个角度看，MCP是一种统一的方式来：

*   暴露执行某项操作的API
*   提供LLM理解它所需的文档
*   在带外处理授权

MCP在2025年掀起了巨大波澜，因为它突然大幅扩展了AI智能体的能力。

MCP服务器暴露的”API”表达为一组”工具”。每个工具本质上是一个远程过程调用（RPC）函数——使用一些参数调用它，并返回响应。大多数现代LLM都具有[使用”工具”（有时称为”函数调用”）的能力](https://developers.cloudflare.com/workers-ai/features/function-calling/)，这意味着它们经过训练，当想要调用工具时，会以特定格式输出文本。调用LLM的程序看到这种格式后，会按照指定调用工具，然后将结果作为输入反馈回LLM。

### [工具调用的解剖](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E7%9A%84%E8%A7%A3%E5%89%96)

在底层，LLM生成表示其输出的”token”流。一个token可能代表一个单词、一个音节、某种标点符号或文本的其他组成部分。

然而，工具调用涉及一个**没有**任何文本等效物的token。LLM经过训练（或者更常见的是微调）来理解一个特殊的token，它可以输出该token来表示”以下内容应被解释为工具调用”，以及另一个特殊token来表示”这是工具调用的结束”。在这两个token之间，LLM通常会写入对应于某种JSON消息的token，该消息描述调用。

例如，假设你已将智能体连接到提供天气信息的MCP服务器，然后询问智能体Austin, TX的天气如何。在底层，LLM可能会生成如下输出。请注意，这里我们使用`<|`和`|>`中的单词来表示我们的特殊token，但实际上这些token根本不代表文本；这只是为了说明。

```
我将使用天气MCP服务器查找Austin, TX的天气。

<|tool_call|>
{
  "name": "get_current_weather",
  "arguments": {
    "location": "Austin, TX, USA"
  }
}
<|end_tool_call|>
```

在输出中看到这些特殊token后，LLM的线束（harness）会将该序列解释为工具调用。看到结束token后，线束暂停LLM的执行。它解析JSON消息并将其作为结构化API结果的单独组件返回。调用LLM API的智能体看到工具调用，调用相关的MCP服务器，然后将结果发送回LLM API。然后，LLM的线束将使用另一组特殊token将结果反馈回LLM：

```
<|tool_result|>
{
  "location": "Austin, TX, USA",
  "temperature": 93,
  "unit": "fahrenheit",
  "conditions": "sunny"
}
<|end_tool_result|>
```

LLM读取这些token的方式与读取用户输入完全相同——只是用户无法产生这些特殊token，因此LLM知道这是工具调用的结果。然后LLM继续像往常一样生成输出。

不同的LLM可能使用不同的工具调用格式，但基本思想就是这样。

### [这有什么问题？](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E8%BF%99%E6%9C%89%E4%BB%80%E4%B9%88%E9%97%AE%E9%A2%98)

工具调用中使用的特殊token是LLM在实际环境中从未见过的东西。它们必须基于合成训练数据进行专门训练才能使用工具。它们并不总是那么擅长。如果你向LLM提供太多工具或过于复杂的工具，它可能很难选择正确的工具或正确使用它。因此，鼓励MCP服务器设计者提供大大简化的API，而不是他们可能向开发者暴露的更传统的API。

与此同时，LLM在编写代码方面变得非常出色。实际上，当LLM被要求针对通常暴露给开发者的完整、复杂的API编写代码时，似乎并没有太大困难。那么，为什么MCP接口必须”降低智商”呢？编写代码和调用工具几乎是同一件事，但似乎LLM在其中一项上的表现要好得多？

答案很简单：**LLM见过很多代码。它们没有见过很多”工具调用”。** 实际上，它们见过的工具调用可能仅限于LLM自己的开发者构建的人为训练集，目的是尝试训练它。而它们见过来自数百万个开源项目的真实世界代码。

**让LLM使用工具调用执行任务，就像让莎士比亚上一个月的汉语速成班，然后要求他用汉语写一部戏剧。这不会是他的最佳作品。**

### [但MCP仍然有用，因为它是统一的](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E4%BD%86mcp%E4%BB%8D%E7%84%B6%E6%9C%89%E7%94%A8%E5%9B%A0%E4%B8%BA%E5%AE%83%E6%98%AF%E7%BB%9F%E4%B8%80%E7%9A%84)

MCP是为工具调用设计的，但实际上它**不必**以这种方式使用。

MCP服务器暴露的”工具”实际上只是带有附加文档的RPC接口。我们真的**不必**将它们作为工具呈现。我们可以获取这些工具，并将它们转换为编程语言API。

但是，当编程语言API已经独立存在时，我们为什么要这样做呢？几乎每个MCP服务器只是现有传统API的包装器——为什么不暴露那些API呢？

嗯，事实证明MCP还做了另一件非常有用的事情：**它提供了一种统一的方式来连接和学习API。**

即使智能体的开发者从未听说过特定的MCP服务器，并且MCP服务器的开发者从未听说过特定的智能体，AI智能体也可以使用MCP服务器。这在过去传统API中很少出现。通常，客户端开发者总是确切地知道他们为哪个API编码。因此，每个API都能够以略微不同的方式处理基本连接、授权和文档等事项。

即使当AI智能体编写代码时，这种统一性也很有用。我们希望AI智能体在沙箱中运行，这样它只能访问我们提供给它的工具。MCP使智能框架能够实现这一点，通过以标准方式处理连接和授权，独立于AI代码。我们也不希望AI必须在互联网上搜索文档；MCP直接在协议中提供它。

## [好的，它是如何工作的？](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E5%A5%BD%E7%9A%84%E5%AE%83%E6%98%AF%E5%A6%82%E4%BD%95%E5%B7%A5%E4%BD%9C%E7%9A%84)

我们已经扩展了[Cloudflare Agents SDK](https://developers.cloudflare.com/agents/)以支持这种新模型！

例如，假设你有一个使用ai-sdk构建的应用程序，如下所示：

```
const stream = streamText({
  model: openai("gpt-5"),
  system: "You are a helpful assistant",
  messages: [
    { role: "user", content: "Write a function that adds two numbers" }
  ],
  tools: {
    // 工具定义
  }
})
```

你可以使用codemode辅助函数包装工具和提示，并在应用程序中使用它们：

```
import { codemode } from "agents/codemode/ai";

const {system, tools} = codemode({
  system: "You are a helpful assistant",
  tools: {
    // 工具定义
  },
  // ...config
})

const stream = streamText({
  model: openai("gpt-5"),
  system,
  tools,
  messages: [
    { role: "user", content: "Write a function that adds two numbers" }
  ]
})
```

通过这个更改，你的应用程序现在将开始生成并运行代码，这些代码本身将调用你定义的工具，包括MCP服务器。我们将在不久的将来为其他库引入变体。[阅读文档](https://github.com/cloudflare/agents/blob/main/docs/codemode.md)以获取更多详细信息和示例。

### [将MCP转换为TypeScript](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E5%B0%86mcp%E8%BD%AC%E6%8D%A2%E4%B8%BAtypescript)

当你在”代码模式”下连接到MCP服务器时，Agents SDK将获取MCP服务器的架构，然后将其转换为TypeScript API，包括基于架构的文档注释。

例如，连接到[https://gitmcp.io/cloudflare/agents](https://gitmcp.io/cloudflare/agents)的MCP服务器将生成如下TypeScript定义：

```
interface FetchAgentsDocumentationInput {
  [k: string]: unknown;
}
interface FetchAgentsDocumentationOutput {
  [key: string]: any;
}

interface SearchAgentsDocumentationInput {
  /**
   * 用于查找相关文档的搜索查询
   */
  query: string;
}
interface SearchAgentsDocumentationOutput {
  [key: string]: any;
}

interface SearchAgentsCodeInput {
  /**
   * 用于查找相关代码文件的搜索查询
   */
  query: string;
  /**
   * 要检索的页码（从1开始）。每页包含30个结果。
   */
  page?: number;
}
interface SearchAgentsCodeOutput {
  [key: string]: any;
}

interface FetchGenericUrlContentInput {
  /**
   * 要获取的文档或页面的URL
   */
  url: string;
}
interface FetchGenericUrlContentOutput {
  [key: string]: any;
}

declare const codemode: {
  /**
   * 从GitHub仓库cloudflare/agents获取完整的文档文件。
   * 适用于一般性问题。如果被问到cloudflare/agents，请始终首先调用此工具。
   */
  fetch_agents_documentation: (
    input: FetchAgentsDocumentationInput
  ) => Promise<FetchAgentsDocumentationOutput>;

  /**
   * 在从GitHub仓库cloudflare/agents获取的文档中进行语义搜索。
   * 适用于特定查询。
   */
  search_agents_documentation: (
    input: SearchAgentsDocumentationInput
  ) => Promise<SearchAgentsDocumentationOutput>;

  /**
   * 使用GitHub Search API（精确匹配）在GitHub仓库"cloudflare/agents"中搜索代码。
   * 返回匹配的文件，以便你进一步查询（如果相关）。
   */
  search_agents_code: (
    input: SearchAgentsCodeInput
  ) => Promise<SearchAgentsCodeOutput>;

  /**
   * 通用工具，用于从任何绝对URL获取内容，遵守robots.txt规则。
   * 使用此工具检索先前获取的文档中提到的引用URL（绝对URL）。
   */
  fetch_generic_url_content: (
    input: FetchGenericUrlContentInput
  ) => Promise<FetchGenericUrlContentOutput>;
};
```

然后，这个TypeScript被加载到智能体的上下文中。目前，整个API都被加载，但未来的改进可以允许智能体更动态地搜索和浏览API——很像智能编码助手那样。

### [在沙箱中运行代码](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E5%9C%A8%E6%B2%99%E7%AE%B1%E4%B8%AD%E8%BF%90%E8%A1%8C%E4%BB%A3%E7%A0%81)

我们的智能体不再看到所有已连接MCP服务器的所有工具，而是只看到一个工具，它只是执行一些TypeScript代码。

然后代码在安全沙箱中执行。沙箱与互联网完全隔离。它访问外部世界的唯一途径是通过表示其已连接MCP服务器的TypeScript API。

这些API由RPC调用支持，该调用回调到智能体循环。在那里，Agents SDK将调用分派到适当的MCP服务器。

沙箱代码以明显的方式将结果返回给智能体：通过调用`console.log()`。当脚本完成时，所有输出日志都会传递回智能体。

![Code Mode架构图](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/6DRERHP138FSj3GG0QYj3M/99e8c09b352560b7d4547ca299482c27/image2.png)

## [动态Worker加载：这里没有容器](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E5%8A%A8%E6%80%81worker%E5%8A%A0%E8%BD%BD%E8%BF%99%E9%87%8C%E6%B2%A1%E6%9C%89%E5%AE%B9%E5%99%A8)

这种新方法需要访问一个安全沙箱，可以在其中运行任意代码。那么我们在哪里找到一个呢？我们必须运行容器吗？那很贵吗？

不。这里没有容器。我们有更好的东西：**isolates（隔离区）**。

Cloudflare Workers平台一直基于V8 isolates，即由[V8 JavaScript引擎](https://v8.dev/)提供支持的隔离JavaScript运行时。

**Isolates比容器轻量得多。** 一个isolate可以在几毫秒内启动，只使用几兆字节的内存。

Isolates如此之快，以至于我们可以为智能体运行的每段代码创建一个新的。无需重用它们。无需预热它们。只需按需创建它，运行代码，然后丢弃它。这一切发生得如此之快，以至于开销可以忽略不计；就好像你只是直接eval()代码一样。但有安全保障。

### [Worker Loader API](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#worker-loader-api)

然而，到目前为止，还没有办法让Worker直接加载包含任意代码的isolate。所有Worker代码都必须通过Cloudflare API上传，然后全球部署，以便它可以在任何地方运行。这不是我们想要用于Agents的！我们希望代码就在智能体所在的位置运行。

为此，我们为Workers平台添加了一个新的API：[Worker Loader API](https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/)。使用它，你可以按需加载Worker代码。它的样子如下：

```
// 获取具有给定ID的Worker，如果不存在这样的Worker则创建它。
let worker = env.LOADER.get(id, async () => {
  // 如果Worker尚不存在，则调用此回调来获取其代码。

  return {
    compatibilityDate: "2025-06-01",

    // 指定worker的代码（模块文件）。
    mainModule: "foo.js",
    modules: {
      "foo.js":
        "export default {\n" +
        "  fetch(req, env, ctx) { return new Response('Hello'); }\n" +
        "}\n",
    },

    // 指定动态Worker的环境（`env`）。
    env: {
      // 它可以包含基本的可序列化数据类型...
      SOME_NUMBER: 123,

      // ...以及使用新的`ctx.exports`环回绑定API绑定回父worker导出的RPC接口。
      SOME_RPC_BINDING: ctx.exports.MyBindingImpl({props})
    },

    // 将Worker的`fetch()`和`connect()`重定向到通过父worker代理，
    // 以监视或过滤所有互联网访问。你也可以通过传递`null`完全阻止互联网访问。
    globalOutbound: ctx.exports.OutboundProxy({props}),
  };
});

// 现在你可以获取Worker的入口点并向其发送请求。
let defaultEntrypoint = worker.getEntrypoint();
await defaultEntrypoint.fetch("http://example.com");

// 你也可以获取非默认入口点，并指定要传递给入口点的`ctx.props`值。
let someEntrypoint = worker.getEntrypoint("SomeEntrypointClass", {
  props: {someProp: 123}
});
```

你现在可以在使用Wrangler本地运行`workerd`时开始使用这个API（[查看文档](https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/)），并且你可以[注册beta访问权限](https://forms.gle/MoeDxE9wNiqdf8ri9)以在生产环境中使用它。

## [Workers是更好的沙箱](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#workers%E6%98%AF%E6%9B%B4%E5%A5%BD%E7%9A%84%E6%B2%99%E7%AE%B1)

Workers的设计使其在沙箱方面异常出色，特别是对于这个用例，原因有几个：

### [更快、更便宜、一次性的沙箱](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E6%9B%B4%E5%BF%AB%E6%9B%B4%E4%BE%BF%E5%AE%9C%E4%B8%80%E6%AC%A1%E6%80%A7%E7%9A%84%E6%B2%99%E7%AE%B1)

[Workers平台使用isolates而不是容器。](https://developers.cloudflare.com/workers/reference/how-workers-works/)Isolates更轻量，启动速度更快。启动一个新的isolate只需几毫秒，而且非常便宜，我们可以为智能体生成的每个代码片段创建一个新的isolate。无需担心池化isolates以重用、预热等。

我们尚未最终确定Worker Loader API的定价，但由于它基于isolates，我们将能够以显著低于基于容器的解决方案的成本提供它。

### [默认隔离，但通过绑定连接](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E9%BB%98%E8%AE%A4%E9%9A%94%E7%A6%BB%E4%BD%86%E9%80%9A%E8%BF%87%E7%BB%91%E5%AE%9A%E8%BF%9E%E6%8E%A5)

Workers在处理隔离方面就是更好。

在Code Mode中，我们禁止沙箱worker与互联网通信。全局`fetch()`和`connect()`函数会抛出错误。

但在大多数平台上，这会是一个问题。在大多数平台上，访问私有资源的方式是，你**首先**拥有一般网络访问权限。然后，使用该网络访问权限，你向特定服务发送请求，向它们传递某种API密钥以授权私有访问。

但Workers一直有更好的答案。在Workers中，“环境”（`env`对象）不仅包含字符串，[它包含活动对象](https://blog.cloudflare.com/workers-environment-live-object-bindings/)，也称为”绑定”。这些对象可以提供对私有资源的直接访问，而无需涉及通用网络请求。

在Code Mode中，我们为沙箱提供了表示它连接到的MCP服务器的绑定访问权限。因此，智能体可以特别访问那些MCP服务器，**而无需**一般网络访问权限。

通过绑定限制访问比通过网络级过滤或HTTP代理等方式更清晰。过滤对LLM和监督者都很困难，因为边界通常不清楚：监督者可能很难准确识别哪些流量是与API通信所必需的。同时，LLM可能很难猜测哪些类型的请求会被阻止。使用绑定方法，它是明确定义的：绑定提供JavaScript接口，该接口允许被使用。这样更好。

### [没有API密钥泄露](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E6%B2%A1%E6%9C%89api%E5%AF%86%E9%92%A5%E6%B3%84%E9%9C%B2)

绑定的另一个好处是它们隐藏了API密钥。绑定本身提供了一个已授权的客户端接口到MCP服务器。对它进行的所有调用首先到达智能体监督者，监督者持有访问令牌并将它们添加到发送到MCP的请求中。

这意味着AI不可能编写泄露任何密钥的代码，解决了当今AI编写的代码中常见的安全问题。

## [实践：code-mode-mcp](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E5%AE%9E%E8%B7%B5code-mode-mcp)

想要体验 Code Mode 的强大？查看这个开源实践项目：[https://github.com/cexll/code-mode-mcp](https://github.com/cexll/code-mode-mcp)

* * *

### [🚀 如何在 Claude Code 中使用](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#-%E5%A6%82%E4%BD%95%E5%9C%A8-claude-code-%E4%B8%AD%E4%BD%BF%E7%94%A8)

#### [方式一：独立运行（推荐新手）](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E6%96%B9%E5%BC%8F%E4%B8%80%E7%8B%AC%E7%AB%8B%E8%BF%90%E8%A1%8C%E6%8E%A8%E8%8D%90%E6%96%B0%E6%89%8B)

```
# 1. 克隆项目
git clone git@github.com:cexll/code-mode-mcp.git
cd code-mode-mcp

# 2. 一键安装
./setup.sh

# 3. 生成 MCP API
npm run generate-api

# 4. 设置 API key
export ANTHROPIC_API_KEY='sk-ant-api03-your-key'

# 5. 运行交互式 Agent
tsx examples/chat.ts
```

现在你可以对话了：

```
You: 列出当前目录的所有 TypeScript 文件

Agent: [生成代码 → 沙箱执行 → 返回结果]
```

#### [方式二：在 Claude Desktop 中集成](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E6%96%B9%E5%BC%8F%E4%BA%8C%E5%9C%A8-claude-desktop-%E4%B8%AD%E9%9B%86%E6%88%90)

**1\. 创建 MCP Server 包装器**

创建 `examples/mcp-server.js`（详见 USAGE.md）

**2\. 配置 Claude Desktop**

编辑配置文件：

*   macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
*   Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```
{
  "mcpServers": {
    "code-mode": {
      "command": "node",
      "args": ["/path/to/code-mode-mcp/examples/mcp-server.js"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-api03-your-key"
      }
    }
  }
}
```

**3\. 重启 Claude Desktop**

现在在 Claude Desktop 中，你可以使用 `execute_code_mode` 工具！

#### [方式三：在你的项目中集成](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E6%96%B9%E5%BC%8F%E4%B8%89%E5%9C%A8%E4%BD%A0%E7%9A%84%E9%A1%B9%E7%9B%AE%E4%B8%AD%E9%9B%86%E6%88%90)

```
// your-project/agent.ts
import { CodeModeAgent } from 'code-mode-mcp/src/agent.js';

const agent = new CodeModeAgent(
  process.env.ANTHROPIC_API_KEY!,
  './node_modules/code-mode-mcp/generated-api'
);

await agent.connectMCPServer('filesystem', 'npx', [...]);
await agent.connectMCPServer('fetch', 'npx', [...]);

const response = await agent.chat('你的任务');
console.log(response);
```

* * *

### [💡 实际使用示例](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#-%E5%AE%9E%E9%99%85%E4%BD%BF%E7%94%A8%E7%A4%BA%E4%BE%8B)

#### [示例 1：数据分析](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E7%A4%BA%E4%BE%8B-1%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90)

```
You: 读取 sales.csv，计算总销售额，找出前 5 名产品
```

Agent 自动生成并执行代码：

*   读取 CSV
*   解析数据
*   计算总额
*   排序找 Top 5
*   返回结果

**Token 消耗**: ~3,000（vs 传统模式 ~20,000）

#### [示例 2：GitHub 批量操作](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E7%A4%BA%E4%BE%8B-2github-%E6%89%B9%E9%87%8F%E6%93%8D%E4%BD%9C)

```
You: 读取 users.json，为每个用户查询 GitHub 资料并汇总
```

Agent 自动执行：

*   读取用户列表
*   for 循环调用 API
*   汇总数据
*   返回结果

**1 轮完成**（vs 传统模式 100 轮）

#### [示例 3：复杂工作流](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E7%A4%BA%E4%BE%8B-3%E5%A4%8D%E6%9D%82%E5%B7%A5%E4%BD%9C%E6%B5%81)

```
You: 从 Google Drive 下载文档，转换格式，上传到 GitHub
```

Agent 管道式处理：

```
Google Drive → 格式转换 → GitHub
```

数据在沙箱内流动，不经过 LLM

* * *

### [🎯 核心优势](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#-%E6%A0%B8%E5%BF%83%E4%BC%98%E5%8A%BF)

指标

传统 MCP

Code Mode

提升

Token 消耗

~150K

~2K

98.7% ↓

响应时间

6-8秒

2秒

75% ↓

往返次数

3-100轮

1轮

99% ↓

大文件

容易超限

无限制

✅

复杂逻辑

困难

for/if/try-catch

✅

* * *

### [📋 快速命令参考](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#-%E5%BF%AB%E9%80%9F%E5%91%BD%E4%BB%A4%E5%8F%82%E8%80%83)

```
# 查看核心概念演示（无需安装）
node quick-demo.js

# 安装依赖
./setup.sh

# 生成 MCP TypeScript API
npm run generate-api

# 运行交互式 Agent
export ANTHROPIC_API_KEY='your-key'
tsx examples/chat.ts

# 查看生成的文件
tree generated-api/
```

* * *

### [⚙️ 沙箱配置](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%EF%B8%8F-%E6%B2%99%E7%AE%B1%E9%85%8D%E7%BD%AE)

编辑 `~/.srt-settings.json`：

```
{
  "network": {
    "allowedDomains": ["github.com", "*.github.com", "api.github.com"]
  },
  "filesystem": {
    "denyRead": ["~/.ssh", "~/.aws"],
    "allowWrite": [".", "/tmp"],
    "denyWrite": [".env", ".git"]
  }
}
```

* * *

### [🆘 常见问题](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#-%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)

**Q: 如何添加更多 MCP servers？**

编辑 `examples/generate-api.ts`：

```
await generator.connectServer('my-server', 'npx', [
  '-y', '@modelcontextprotocol/server-my-server'
]);
```

**Q: 生成的 API 在哪里？**

```
generated-api/servers/
├── filesystem/
│   ├── readFile.ts
│   └── writeFile.ts
└── fetch/
    └── fetch.ts
```

**Q: 如何调试？**

查看 USAGE.md 的”调试技巧”章节。

**Q: 生产环境如何部署？**

查看 USAGE.md 的”生产环境部署”章节（包含 Docker 配置）。

* * *

### [🎓 学习路径](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#-%E5%AD%A6%E4%B9%A0%E8%B7%AF%E5%BE%84)

#### [初学者（10 分钟）](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E5%88%9D%E5%AD%A6%E8%80%8510-%E5%88%86%E9%92%9F)

1.  `node quick-demo.js` - 查看核心概念
2.  `cat QUICKSTART.md` - 阅读快速开始
3.  `./setup.sh && npm run generate-api` - 安装和生成 API

#### [进阶使用（30 分钟）](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E8%BF%9B%E9%98%B6%E4%BD%BF%E7%94%A830-%E5%88%86%E9%92%9F)

1.  `tsx examples/chat.ts` - 运行交互式 Agent
2.  `cat USAGE.md` - 阅读完整使用指南
3.  尝试 3 个实际示例

#### [深度集成（1-2 小时）](https://stellarlink.co/articles/code-mode-%E4%BD%BF%E7%94%A8mcp%E7%9A%84%E6%9B%B4%E5%A5%BD%E6%96%B9%E5%BC%8F#%E6%B7%B1%E5%BA%A6%E9%9B%86%E6%88%901-2-%E5%B0%8F%E6%97%B6)

1.  `cat MIGRATION.md` - 阅读迁移指南
2.  集成到你的项目
3.  配置自定义 MCP servers
