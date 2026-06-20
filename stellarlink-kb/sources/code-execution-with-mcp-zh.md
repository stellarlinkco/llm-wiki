---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/code-execution-with-mcp-zh"
title: "使用 MCP 进行代码执行:构建更高效的 AI 代理"
description: "使用 MCP 进行代码执行:构建更高效的 AI 代理"
resource: "https://stellarlink.co/articles/code-execution-with-mcp-zh"
tags: []
timestamp: "2026-06-20T06:45:41.132Z"
source_path: "https://stellarlink.co/articles/code-execution-with-mcp-zh"
source_id: 7374621ece6dba6d07b6e0c55cf1650c3db41f280cf5e7610f4e148e8731f359
content_hash: 96f0b8df54c60b3f9c6b98a29ead821e676417222da329827095ad191aad9534
---

## [使用 MCP 进行代码执行:构建更高效的 AI 代理](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E4%BD%BF%E7%94%A8-mcp-%E8%BF%9B%E8%A1%8C%E4%BB%A3%E7%A0%81%E6%89%A7%E8%A1%8C%E6%9E%84%E5%BB%BA%E6%9B%B4%E9%AB%98%E6%95%88%E7%9A%84-ai-%E4%BB%A3%E7%90%86)

![文章主图](https://www-cdn.anthropic.com/images/4zrzovbb/website/42f40f6fae9ec2d7cf2e5a98908a16d0216b91be-1000x1000.svg)

直接工具调用会为每个定义和结果消耗上下文。代理通过编写代码来调用工具可以更好地扩展。以下是它如何与 MCP 配合使用。

[模型上下文协议(Model Context Protocol, MCP)](https://modelcontextprotocol.io/) 是一个用于将 AI 代理连接到外部系统的开放标准。将代理连接到工具和数据传统上需要为每一对进行定制集成,这会造成碎片化和重复工作,使真正连接的系统难以规模化。MCP 提供了一个通用协议——开发者在其代理中实现一次 MCP,就可以解锁整个集成生态系统。

自2024年11月推出 MCP 以来,采用率迅速增长:社区已经构建了数千个 [MCP 服务器](https://github.com/modelcontextprotocol/servers),所有主要编程语言都提供了 [SDK](https://modelcontextprotocol.io/docs/sdk),业界已将 MCP 采纳为连接代理与工具和数据的事实标准。

如今,开发者通常构建可访问数十个 MCP 服务器上数百或数千个工具的代理。然而,随着连接工具数量的增长,预先加载所有工具定义并通过上下文窗口传递中间结果会减慢代理速度并增加成本。

在本文中,我们将探讨代码执行如何使代理能够更高效地与 MCP 服务器交互,在使用更少 token 的同时处理更多工具。

## [工具的过度 token 消耗使代理效率降低](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E5%B7%A5%E5%85%B7%E7%9A%84%E8%BF%87%E5%BA%A6-token-%E6%B6%88%E8%80%97%E4%BD%BF%E4%BB%A3%E7%90%86%E6%95%88%E7%8E%87%E9%99%8D%E4%BD%8E)

随着 MCP 使用规模的扩大,有两种常见模式会增加代理成本和延迟:

1.  工具定义使上下文窗口过载;
2.  中间工具结果消耗额外的 token。

### [1\. 工具定义使上下文窗口过载](https://stellarlink.co/articles/code-execution-with-mcp-zh#1-%E5%B7%A5%E5%85%B7%E5%AE%9A%E4%B9%89%E4%BD%BF%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AA%97%E5%8F%A3%E8%BF%87%E8%BD%BD)

大多数 MCP 客户端会预先将所有工具定义直接加载到上下文中,使用直接工具调用语法将它们暴露给模型。这些工具定义可能如下所示:

```
gdrive.getDocument
     描述: 从 Google Drive 检索文档
     参数:
                documentId (必需, string): 要检索的文档ID
                fields (可选, string): 要返回的特定字段
     返回: 包含标题、正文内容、元数据、权限等的文档对象
```

```
salesforce.updateRecord
    描述: 更新 Salesforce 中的记录
    参数:
               objectType (必需, string): Salesforce 对象类型 (Lead, Contact, Account 等)
               recordId (必需, string): 要更新的记录ID
               data (必需, object): 要更新的字段及其新值
     返回: 已更新的记录对象及确认
```

工具描述占用更多上下文窗口空间,增加响应时间和成本。在代理连接到数千个工具的情况下,它们需要在读取请求之前处理数十万个 token。

### [2\. 中间工具结果消耗额外的 token](https://stellarlink.co/articles/code-execution-with-mcp-zh#2-%E4%B8%AD%E9%97%B4%E5%B7%A5%E5%85%B7%E7%BB%93%E6%9E%9C%E6%B6%88%E8%80%97%E9%A2%9D%E5%A4%96%E7%9A%84-token)

大多数 MCP 客户端允许模型直接调用 MCP 工具。例如,你可能会问你的代理:“从 Google Drive 下载我的会议记录并将其附加到 Salesforce 潜在客户。“

模型将进行如下调用:

```
TOOL CALL: gdrive.getDocument(documentId: "abc123")
        → 返回 "讨论了Q4目标...\n[完整记录文本]"
           (加载到模型上下文中)

TOOL CALL: salesforce.updateRecord(
			objectType: "SalesMeeting",
			recordId: "00Q5f000001abcXYZ",
  			data: { "Notes": "讨论了Q4目标...\n[完整记录文本写出]" }
		)
		(模型需要再次将整个记录写入上下文)
```

每个中间结果都必须通过模型传递。在这个例子中,完整的通话记录流经两次。对于一个2小时的销售会议,这可能意味着处理额外的50,000个 token。更大的文档甚至可能超过上下文窗口限制,导致工作流中断。

对于大型文档或复杂数据结构,模型在工具调用之间复制数据时更容易出错。

![MCP 客户端如何工作](https://www-cdn.anthropic.com/images/4zrzovbb/website/9ecf165020005c09a22a9472cee6309555485619-1920x1080.png)

_MCP 客户端将工具定义加载到模型的上下文窗口中,并编排一个消息循环,其中每个工具调用和结果在操作之间通过模型传递。_

随着代码执行环境对代理来说变得越来越普遍,一个解决方案是将 MCP 服务器表示为代码 API,而不是直接工具调用。然后代理可以编写代码来与 MCP 服务器交互。这种方法解决了两个挑战:代理只能加载它们需要的工具,并在将结果传递回模型之前在执行环境中处理数据。

有多种方法可以做到这一点。一种方法是从连接的 MCP 服务器生成所有可用工具的文件树。以下是使用 TypeScript 的实现:

```
servers
├── google-drive
│   ├── getDocument.ts
│   ├── ... (其他工具)
│   └── index.ts
├── salesforce
│   ├── updateRecord.ts
│   ├── ... (其他工具)
│   └── index.ts
└── ... (其他服务器)
```

然后每个工具对应一个文件,类似于:

```
// ./servers/google-drive/getDocument.ts
import { callMCPTool } from "../../../client.js";

interface GetDocumentInput {
  documentId: string;
}

interface GetDocumentResponse {
  content: string;
}

/* 从 Google Drive 读取文档 */
export async function getDocument(input: GetDocumentInput): Promise<GetDocumentResponse> {
  return callMCPTool<GetDocumentResponse>('google_drive__get_document', input);
}
```

上面的 Google Drive 到 Salesforce 示例变成了代码:

```
// 从 Google Docs 读取记录并添加到 Salesforce 潜在客户
import * as gdrive from './servers/google-drive';
import * as salesforce from './servers/salesforce';

const transcript = (await gdrive.getDocument({ documentId: 'abc123' })).content;
await salesforce.updateRecord({
  objectType: 'SalesMeeting',
  recordId: '00Q5f000001abcXYZ',
  data: { Notes: transcript }
});
```

代理通过探索文件系统来发现工具:列出 `./servers/` 目录以查找可用的服务器(如 `google-drive` 和 `salesforce`),然后读取它需要的特定工具文件(如 `getDocument.ts` 和 `updateRecord.ts`)以了解每个工具的接口。这让代理只加载当前任务所需的定义。这将 token 使用量从150,000个 token 减少到2,000个 token——时间和成本节省了98.7%。

Cloudflare [发布了类似的发现](https://blog.cloudflare.com/code-mode/),将使用 MCP 进行代码执行称为”代码模式”。核心见解是一样的:LLM 擅长编写代码,开发者应该利用这一优势来构建更高效地与 MCP 服务器交互的代理。

## [使用 MCP 进行代码执行的好处](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E4%BD%BF%E7%94%A8-mcp-%E8%BF%9B%E8%A1%8C%E4%BB%A3%E7%A0%81%E6%89%A7%E8%A1%8C%E7%9A%84%E5%A5%BD%E5%A4%84)

使用 MCP 进行代码执行使代理能够通过按需加载工具、在数据到达模型之前过滤数据以及在单个步骤中执行复杂逻辑来更高效地使用上下文。使用这种方法还有安全性和状态管理方面的好处。

### [渐进式披露](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E6%B8%90%E8%BF%9B%E5%BC%8F%E6%8A%AB%E9%9C%B2)

模型非常擅长导航文件系统。将工具表示为文件系统上的代码允许模型按需读取工具定义,而不是预先读取所有定义。

或者,可以向服务器添加 `search_tools` 工具来查找相关定义。例如,在使用上面使用的假设 Salesforce 服务器时,代理搜索”salesforce”并仅加载当前任务所需的那些工具。在 `search_tools` 工具中包含详细级别参数,允许代理选择所需的详细级别(例如仅名称、名称和描述,或带有架构的完整定义)也有助于代理节省上下文并高效地查找工具。

### [上下文高效的工具结果](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E4%B8%8A%E4%B8%8B%E6%96%87%E9%AB%98%E6%95%88%E7%9A%84%E5%B7%A5%E5%85%B7%E7%BB%93%E6%9E%9C)

在处理大型数据集时,代理可以在返回结果之前在代码中过滤和转换结果。考虑获取一个10,000行的电子表格:

```
// 没有代码执行 - 所有行都流经上下文
TOOL CALL: gdrive.getSheet(sheetId: 'abc123')
        → 返回10,000行到上下文中手动过滤

// 使用代码执行 - 在执行环境中过滤
const allRows = await gdrive.getSheet({ sheetId: 'abc123' });
const pendingOrders = allRows.filter(row =>
  row["Status"] === 'pending'
);
console.log(`找到 ${pendingOrders.length} 个待处理订单`);
console.log(pendingOrders.slice(0, 5)); // 仅记录前5个供审查
```

代理看到五行而不是10,000行。类似的模式适用于聚合、跨多个数据源的连接或提取特定字段——所有这些都不会使上下文窗口膨胀。

#### [更强大且上下文高效的控制流](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E6%9B%B4%E5%BC%BA%E5%A4%A7%E4%B8%94%E4%B8%8A%E4%B8%8B%E6%96%87%E9%AB%98%E6%95%88%E7%9A%84%E6%8E%A7%E5%88%B6%E6%B5%81)

循环、条件和错误处理可以使用熟悉的代码模式完成,而不是链接单个工具调用。例如,如果你需要在 Slack 中获得部署通知,代理可以编写:

```
let found = false;
while (!found) {
  const messages = await slack.getChannelHistory({ channel: 'C123456' });
  found = messages.some(m => m.text.includes('deployment complete'));
  if (!found) await new Promise(r => setTimeout(r, 5000));
}
console.log('已收到部署通知');
```

这种方法比通过代理循环在 MCP 工具调用和睡眠命令之间交替更有效。

此外,能够写出被执行的条件树也节省了”首个 token 时间”延迟:代理可以让代码执行环境来做这件事,而不必等待模型评估 if 语句。

### [隐私保护操作](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E9%9A%90%E7%A7%81%E4%BF%9D%E6%8A%A4%E6%93%8D%E4%BD%9C)

当代理使用 MCP 进行代码执行时,中间结果默认保留在执行环境中。这样,代理只看到你明确记录或返回的内容,这意味着你不希望与模型共享的数据可以流经你的工作流,而不会进入模型的上下文。

对于更敏感的工作负载,代理框架可以自动标记化敏感数据。例如,想象你需要将客户联系详细信息从电子表格导入 Salesforce。代理编写:

```
const sheet = await gdrive.getSheet({ sheetId: 'abc123' });
for (const row of sheet.rows) {
  await salesforce.updateRecord({
    objectType: 'Lead',
    recordId: row.salesforceId,
    data: {
      Email: row.email,
      Phone: row.phone,
      Name: row.name
    }
  });
}
console.log(`已更新 ${sheet.rows.length} 个潜在客户`);
```

MCP 客户端拦截数据并在数据到达模型之前标记化 PII:

```
// 如果记录 sheet.rows,代理将看到:
[
  { salesforceId: '00Q...', email: '[EMAIL_1]', phone: '[PHONE_1]', name: '[NAME_1]' },
  { salesforceId: '00Q...', email: '[EMAIL_2]', phone: '[PHONE_2]', name: '[NAME_2]' },
  ...
]
```

然后,当在另一个 MCP 工具调用中共享数据时,通过 MCP 客户端中的查找对其进行去标记化。真实的电子邮件地址、电话号码和姓名从 Google Sheets 流向 Salesforce,但从不通过模型。这可以防止代理意外记录或处理敏感数据。你还可以使用它来定义确定性安全规则,选择数据可以流向何处。

### [状态持久化和技能](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E7%8A%B6%E6%80%81%E6%8C%81%E4%B9%85%E5%8C%96%E5%92%8C%E6%8A%80%E8%83%BD)

具有文件系统访问权限的代码执行允许代理跨操作维护状态。代理可以将中间结果写入文件,使它们能够恢复工作并跟踪进度:

```
const leads = await salesforce.query({
  query: 'SELECT Id, Email FROM Lead LIMIT 1000'
});
const csvData = leads.map(l => `${l.Id},${l.Email}`).join('\n');
await fs.writeFile('./workspace/leads.csv', csvData);

// 后续执行从中断处继续
const saved = await fs.readFile('./workspace/leads.csv', 'utf-8');
```

代理还可以将自己的代码持久化为可重用函数。一旦代理为任务开发了可工作的代码,它就可以保存该实现以供将来使用:

```
// 在 ./skills/save-sheet-as-csv.ts 中
import * as gdrive from './servers/google-drive';
export async function saveSheetAsCsv(sheetId: string) {
  const data = await gdrive.getSheet({ sheetId });
  const csv = data.map(row => row.join(',')).join('\n');
  await fs.writeFile(`./workspace/sheet-${sheetId}.csv`, csv);
  return `./workspace/sheet-${sheetId}.csv`;
}

// 之后,在任何代理执行中:
import { saveSheetAsCsv } from './skills/save-sheet-as-csv';
const csvPath = await saveSheetAsCsv('abc123');
```

这与 [Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)(可重用指令、脚本和资源的文件夹,供模型改进特定任务的性能)的概念密切相关。向这些保存的函数添加 SKILL.md 文件会创建模型可以引用和使用的结构化技能。随着时间的推移,这允许你的代理构建一个更高级别能力的工具箱,不断发展它最有效工作所需的脚手架。

请注意,代码执行引入了自己的复杂性。运行代理生成的代码需要具有适当[沙箱](https://www.anthropic.com/engineering/claude-code-sandboxing)、资源限制和监控的安全执行环境。这些基础设施要求增加了直接工具调用所避免的操作开销和安全考虑。代码执行的好处——降低 token 成本、更低的延迟和改进的工具组合——应该与这些实现成本进行权衡。

## [总结](https://stellarlink.co/articles/code-execution-with-mcp-zh#%E6%80%BB%E7%BB%93)

MCP 为代理连接到许多工具和系统提供了基础协议。然而,一旦连接了太多服务器,工具定义和结果可能会消耗过多的 token,降低代理效率。

尽管这里的许多问题感觉很新颖——上下文管理、工具组合、状态持久化——但它们在软件工程中都有已知的解决方案。代码执行将这些既定模式应用于代理,让它们使用熟悉的编程结构来更高效地与 MCP 服务器交互。如果你实现了这种方法,我们鼓励你与 [MCP 社区](https://modelcontextprotocol.io/community/communication)分享你的发现。

> 原文 [https://www.anthropic.com/engineering/code-execution-with-mcp](https://www.anthropic.com/engineering/code-execution-with-mcp)

* * *
