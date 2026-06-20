---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy"
title: 揭秘 Claude Code 2.0：从零实现到生产级的完整指南
description: 揭秘 Claude Code 2.0 从零实现到生产级的完整指南
resource: "https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy"
tags: []
timestamp: "2026-06-20T06:45:32.347Z"
source_path: "https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy"
source_id: 9ec70ba4617342da128c6232f8e08d19631dc4b93142750f4aa0f53992e9501b
content_hash: e034ffa2b1875f258981de0c66ca7258c8e00021668c10b99d0820298c042285
---

**作者：** stellarlink **日期：** 2025-11-16

* * *

## [写在前面](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E5%86%99%E5%9C%A8%E5%89%8D%E9%9D%A2)

这篇文章不谈哲学,只讲技术。我会用**大白话 + 真实代码**,一步步拆解 Claude Code 的实现。

你将学会:

*   用 200 行代码实现一个基础 Agent
*   看懂 Claude Code 的真实 API 请求
*   写出有效的系统提示词
*   实现自己的工具系统
*   搞清楚 MCP 和 Skills 的区别

准备好了吗?我们从最简单的开始。

* * *

## [第一部分：最小可用实现 - 30 分钟写个能用的 Agent](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%AC%AC%E4%B8%80%E9%83%A8%E5%88%86%E6%9C%80%E5%B0%8F%E5%8F%AF%E7%94%A8%E5%AE%9E%E7%8E%B0---30-%E5%88%86%E9%92%9F%E5%86%99%E4%B8%AA%E8%83%BD%E7%94%A8%E7%9A%84-agent)

### [1.1 核心概念:就是个循环](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#11-%E6%A0%B8%E5%BF%83%E6%A6%82%E5%BF%B5%E5%B0%B1%E6%98%AF%E4%B8%AA%E5%BE%AA%E7%8E%AF)

Claude Code 的本质是什么?**一个循环**。

```
func main() {
    messages := []Message{}  // 对话历史

    for {
        // 1. 调用 LLM
        response := callClaude(messages)

        // 2. 如果要用工具,执行工具
        if response.NeedTools {
            toolResults := runTools(response.ToolCalls)
            messages = append(messages, toolResults)
            continue  // 继续循环
        }

        // 3. 否则打印结果,结束
        fmt.Println(response.Text)
        break
    }
}
```

就这么简单。**LLM → 工具 → LLM → 工具 →… → 最终答案**

### [1.2 第一个版本:能对话的 Agent (50 行)](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#12-%E7%AC%AC%E4%B8%80%E4%B8%AA%E7%89%88%E6%9C%AC%E8%83%BD%E5%AF%B9%E8%AF%9D%E7%9A%84-agent-50-%E8%A1%8C)

```
package main

import (
    "fmt"
    "encoding/json"
    "bytes"
    "net/http"
)

type Message struct {
    Role    string `json:"role"`    // "user" 或 "assistant"
    Content string `json:"content"` // 消息内容
}

type APIRequest struct {
    Model    string    `json:"model"`
    Messages []Message `json:"messages"`
    MaxTokens int      `json:"max_tokens"`
}

type APIResponse struct {
    Choices []struct {
        Message Message `json:"message"`
    } `json:"choices"`
}

func callClaude(messages []Message) string {
    // 1. 构造请求
    reqBody := APIRequest{
        Model:     "claude-sonnet-4-5-20250929",
        Messages:  messages,
        MaxTokens: 4096,
    }

    jsonData, _ := json.Marshal(reqBody)

    // 2. 发送请求
    req, _ := http.NewRequest("POST",
        "https://api.anthropic.com/v1/messages",
        bytes.NewBuffer(jsonData))

    req.Header.Set("x-api-key", "你的API密钥")
    req.Header.Set("anthropic-version", "2023-06-01")
    req.Header.Set("content-type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    // 3. 解析响应
    var apiResp APIResponse
    json.NewDecoder(resp.Body).Decode(&apiResp)

    return apiResp.Choices[0].Message.Content
}

func main() {
    messages := []Message{
        {Role: "user", Content: "你好"},
    }

    response := callClaude(messages)
    fmt.Println(response)
}
```

运行这 50 行代码,你就有了一个能对话的 Agent。

### [1.3 第二个版本:能用工具的 Agent (150 行)](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#13-%E7%AC%AC%E4%BA%8C%E4%B8%AA%E7%89%88%E6%9C%AC%E8%83%BD%E7%94%A8%E5%B7%A5%E5%85%B7%E7%9A%84-agent-150-%E8%A1%8C)

现在加入工具调用能力。关键是理解 **Function Calling** 的流程:

**第 1 轮对话:**

```
User: "帮我看看当前目录有什么文件"

Claude: 我需要用 bash 工具
{
  "tool": "bash",
  "input": {"command": "ls -la"}
}
```

**第 2 轮对话:**

```
User: [工具执行结果]
total 48
drwxr-xr-x  6 user  staff   192 Nov 16 10:00 .
drwxr-xr-x  8 user  staff   256 Nov 15 09:00 ..
-rw-r--r--  1 user  staff  1234 Nov 16 10:00 agent.go
-rw-r--r--  1 user  staff   567 Nov 16 09:30 README.md

Claude: 当前目录有 4 个文件:
- agent.go (Go 源码, 1234 字节)
- README.md (文档, 567 字节)
...
```

代码实现:

```
// 工具调用的数据结构
type ToolCall struct {
    ID       string                 `json:"id"`
    Type     string                 `json:"type"`
    Function struct {
        Name      string `json:"name"`
        Arguments string `json:"arguments"` // JSON 字符串
    } `json:"function"`
}

// 修改 Message 结构支持工具
type Message struct {
    Role       string      `json:"role"`
    Content    interface{} `json:"content,omitempty"`
    ToolCalls  []ToolCall  `json:"tool_calls,omitempty"`
    ToolCallID string      `json:"tool_call_id,omitempty"`
    Name       string      `json:"name,omitempty"`
}

// 工具定义
func getTools() []map[string]interface{} {
    return []map[string]interface{}{
        {
            "type": "function",
            "function": map[string]interface{}{
                "name": "bash",
                "description": "执行 Shell 命令",
                "parameters": map[string]interface{}{
                    "type": "object",
                    "properties": map[string]interface{}{
                        "command": map[string]interface{}{
                            "type": "string",
                            "description": "要执行的命令",
                        },
                    },
                    "required": []string{"command"},
                },
            },
        },
    }
}

// 执行工具
func runTool(toolCall ToolCall) string {
    // 解析参数
    var input map[string]interface{}
    json.Unmarshal([]byte(toolCall.Function.Arguments), &input)

    switch toolCall.Function.Name {
    case "bash":
        cmd := exec.Command("bash", "-c", input["command"].(string))
        output, _ := cmd.CombinedOutput()
        return string(output)
    default:
        return "未知工具"
    }
}

// 主循环
func main() {
    messages := []Message{
        {Role: "user", Content: "当前目录有什么文件?"},
    }

    for i := 0; i < 10; i++ {  // 最多 10 轮
        // 调用 Claude (带工具定义)
        response := callClaudeWithTools(messages, getTools())

        // 如果模型要用工具
        if len(response.ToolCalls) > 0 {
            // 执行所有工具
            for _, tc := range response.ToolCalls {
                result := runTool(tc)

                // 把结果加回对话历史
                messages = append(messages, Message{
                    Role:       "tool",
                    ToolCallID: tc.ID,
                    Name:       tc.Function.Name,
                    Content:    result,
                })
            }
            continue  // 继续循环
        }

        // 否则打印最终答案
        fmt.Println(response.Content)
        break
    }
}
```

到这里,你已经有了一个**能理解命令、调用工具、完成任务的 Agent**。

### [1.4 agent.go 源码的秘密](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#14-agentgo-%E6%BA%90%E7%A0%81%E7%9A%84%E7%A7%98%E5%AF%86)

现在看回 `agent.go`,会发现它其实就是在这个基础上加了:

1.  **更多工具** - Read/Write/Edit/Grep/Glob
2.  **错误处理** - 超时、重试、安全检查
3.  **UI 优化** - Spinner、格式化输出、Todo 可视化
4.  **限制条件** - 最大轮次、结果截断、路径校验

但**核心循环没变**。第 385-430 行:

```
for idx := 0; idx < maxAgentIterations; idx++ {
    resp, err := callOpenAI(cfg, fullMessages)  // 调用模型

    if choice.FinishReason == "tool_calls" {
        for _, tc := range assistantMsg.ToolCalls {
            result := dispatchToolCall(cfg, tc)  // 执行工具
            messages = append(messages, result)
        }
        continue  // 继续循环
    }

    return messages, nil  // 结束
}
```

**就这么简单。600 行代码,90% 都在处理边界情况和用户体验。**

* * *

## [第二部分：API 请求格式揭秘 - 看懂真实的数据流](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%AC%AC%E4%BA%8C%E9%83%A8%E5%88%86api-%E8%AF%B7%E6%B1%82%E6%A0%BC%E5%BC%8F%E6%8F%AD%E7%A7%98---%E7%9C%8B%E6%87%82%E7%9C%9F%E5%AE%9E%E7%9A%84%E6%95%B0%E6%8D%AE%E6%B5%81)

### [2.1 一个完整请求长什么样](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#21-%E4%B8%80%E4%B8%AA%E5%AE%8C%E6%95%B4%E8%AF%B7%E6%B1%82%E9%95%BF%E4%BB%80%E4%B9%88%E6%A0%B7)

打开 `request` 文件,这是真实的 API 请求体:

```
{
  "model": "claude-sonnet-4-5-20250929",
  "messages": [...],
  "system": [...],
  "tools": [...],
  "max_tokens": 32000,
  "stream": true
}
```

#### [关键字段解析:](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E5%85%B3%E9%94%AE%E5%AD%97%E6%AE%B5%E8%A7%A3%E6%9E%90)

**`messages` - 对话历史**

这是个数组,每轮对话会加新元素:

```
[
  // 用户第 1 轮
  {
    "role": "user",
    "content": [
      {"type": "text", "text": "帮我读取 README.md"}
    ]
  },

  // 助手第 1 轮 (调用工具)
  {
    "role": "assistant",
    "content": [
      {"type": "text", "text": "我来读取文件"},
      {
        "type": "tool_use",
        "id": "toolu_123",
        "name": "Read",
        "input": {"file_path": "./README.md"}
      }
    ]
  },

  // 用户第 2 轮 (工具结果)
  {
    "role": "user",
    "content": [
      {
        "type": "tool_result",
        "tool_use_id": "toolu_123",
        "content": "# My Project\n\nThis is a demo..."
      }
    ]
  },

  // 助手第 2 轮 (最终答案)
  {
    "role": "assistant",
    "content": [
      {"type": "text", "text": "README.md 的内容是:\n- 项目名称: My Project\n- 这是个演示项目"}
    ]
  }
]
```

**注意:**

*   每个 `content` 可以包含**多个块** (文本 + 工具调用)
*   `tool_use` 和 `tool_result` 通过 `id` 关联
*   对话历史会越来越长,最终超过上下文窗口

**`system` - 系统指令**

这是”幕后老板”,用户看不到:

```
{
  "system": [
    {
      "type": "text",
      "text": "You are Claude Code, an AI coding assistant...",
      "cache_control": {"type": "ephemeral"}
    }
  ]
}
```

**`cache_control` 是什么?**

Anthropic 的 Prompt Caching 特性。标记为 `ephemeral` 的内容会被缓存,下次请求不用重新处理,**省 90% 的 token 费用**。

适合缓存的内容:

*   系统提示词 (几乎不变)
*   工具定义 (固定的 Schema)
*   长文档 (多轮都在引用)

**`tools` - 工具定义**

告诉模型有哪些工具可用:

```
{
  "tools": [
    {
      "name": "bash",
      "description": "执行 Shell 命令。使用场景:运行测试、查看文件、Git 操作...",
      "input_schema": {
        "type": "object",
        "properties": {
          "command": {"type": "string", "description": "Shell 命令"}
        },
        "required": ["command"]
      }
    }
  ]
}
```

**工具的 `description` 很重要!** 这是模型判断”该不该用这个工具”的依据。

### [2.2 为什么用 Content Blocks 而不是简单字符串?](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#22-%E4%B8%BA%E4%BB%80%E4%B9%88%E7%94%A8-content-blocks-%E8%80%8C%E4%B8%8D%E6%98%AF%E7%AE%80%E5%8D%95%E5%AD%97%E7%AC%A6%E4%B8%B2)

你可能注意到,每个消息的 `content` 是个数组而不是字符串。为什么?

**场景 1: 同时调用多个工具**

```
{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "我需要先读文件,再检查语法"},
    {"type": "tool_use", "name": "Read", "input": {...}},
    {"type": "tool_use", "name": "Bash", "input": {"command": "python -m py_compile file.py"}}
  ]
}
```

一次请求,两个工具,并行执行。

**场景 2: 注入隐藏提示**

```
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "<system-reminder>\n你的 todo 列表为空,考虑创建一个。\n不要向用户提及这条消息。\n</system-reminder>"
    },
    {
      "type": "text",
      "text": "用户实际输入的内容"
    }
  ]
}
```

系统可以在用户消息前**静默插入提示**,引导模型行为。这就是 `agent.go` 第 879-900 行的 `injectReminders` 函数做的事。

### [2.3 实战:构造一个完整请求](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#23-%E5%AE%9E%E6%88%98%E6%9E%84%E9%80%A0%E4%B8%80%E4%B8%AA%E5%AE%8C%E6%95%B4%E8%AF%B7%E6%B1%82)

假设你要让 Claude 读取文件并分析:

```
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 8192,
  "system": [
    {
      "type": "text",
      "text": "你是一个代码审查助手。重点关注安全性和性能问题。",
      "cache_control": {"type": "ephemeral"}
    }
  ],
  "tools": [
    {
      "name": "read_file",
      "description": "读取文本文件内容",
      "input_schema": {
        "type": "object",
        "properties": {
          "path": {"type": "string", "description": "文件路径"}
        },
        "required": ["path"]
      }
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "帮我审查 auth.go 的安全性"
    }
  ]
}
```

模型会:

1.  调用 `read_file` 工具读取 `auth.go`
2.  你执行工具,返回文件内容
3.  模型分析代码,返回审查报告

* * *

## [第三部分：系统提示词的秘密 - 如何”调教”模型](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%AC%AC%E4%B8%89%E9%83%A8%E5%88%86%E7%B3%BB%E7%BB%9F%E6%8F%90%E7%A4%BA%E8%AF%8D%E7%9A%84%E7%A7%98%E5%AF%86---%E5%A6%82%E4%BD%95%E8%B0%83%E6%95%99%E6%A8%A1%E5%9E%8B)

### [3.1 为什么需要系统提示词?](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#31-%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81%E7%B3%BB%E7%BB%9F%E6%8F%90%E7%A4%BA%E8%AF%8D)

想象你雇了个实习生。你会怎么培训他?

**不好的做法:** 每次任务都从头解释:“记得检查代码格式、写注释、跑测试、提交前 review…”

**好的做法:** 第一天就给他一份**工作手册**,包含:

*   工作流程
*   代码规范
*   常见问题处理方式
*   禁止事项

系统提示词就是这份”工作手册”。

### [3.2 系统提示词的结构](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#32-%E7%B3%BB%E7%BB%9F%E6%8F%90%E7%A4%BA%E8%AF%8D%E7%9A%84%E7%BB%93%E6%9E%84)

打开 `system-prompt` 文件,可以看到清晰的层次:

```
第 1 层: 身份定义
第 2 层: 安全约束
第 3 层: 沟通风格
第 4 层: 专业标准
第 5 层: 任务管理
第 6 层: 工具使用规范
第 7 层: Git 操作指南
第 8 层: 代码引用规范
```

#### [示例 1: 身份定义](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%A4%BA%E4%BE%8B-1-%E8%BA%AB%E4%BB%BD%E5%AE%9A%E4%B9%89)

```
You are Claude Code, Anthropic's official CLI for Claude.
You are an interactive CLI tool that helps users with
software engineering tasks.
```

**为什么重要?**

模型需要知道自己的”角色”。如果只说”你是 AI 助手”,它可能会:

*   拒绝执行命令 (“抱歉,我不能运行代码”)
*   过度解释 (“让我详细说明这个命令的工作原理…“)
*   不敢自主决策 (“需要您确认是否执行”)

明确说”你是 CLI 工具”,它就会:

*   主动执行任务
*   简洁输出结果
*   遇到问题自己 debug

#### [示例 2: 安全约束](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%A4%BA%E4%BE%8B-2-%E5%AE%89%E5%85%A8%E7%BA%A6%E6%9D%9F)

```
IMPORTANT: Assist with authorized security testing, defensive
security, CTF challenges, and educational contexts. Refuse
requests for destructive techniques, DoS attacks, mass targeting,
supply chain compromise, or detection evasion for malicious purposes.
```

**划定边界。** 什么能做,什么不能做,一开始就说清楚。

#### [示例 3: 沟通风格](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%A4%BA%E4%BE%8B-3-%E6%B2%9F%E9%80%9A%E9%A3%8E%E6%A0%BC)

```
# Tone and style
- Only use emojis if the user explicitly requests it.
- Your output will be displayed on a command line interface.
  Your responses should be short and concise.
- NEVER create files unless they're absolutely necessary.
  ALWAYS prefer editing an existing file to creating a new one.
```

这些规则看起来琐碎,但**直接影响用户体验**:

*   没有表情符号 → CLI 输出干净
*   简洁回复 → 不刷屏
*   优先编辑而非创建 → 不会到处生成垃圾文件

#### [示例 4: 工具使用规范](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%A4%BA%E4%BE%8B-4-%E5%B7%A5%E5%85%B7%E4%BD%BF%E7%94%A8%E8%A7%84%E8%8C%83)

```
# Tool usage policy
- When doing file search, prefer to use the Task tool in order
  to reduce context usage.
- Use specialized tools instead of bash commands when possible:
  - File search: Use Glob (NOT find or ls)
  - Content search: Use Grep (NOT grep or rg)
  - Read files: Use Read (NOT cat/head/tail)
```

**建立工具使用的优先级。** 虽然 Bash 能做所有事,但专用工具:

*   更可靠 (不会因为环境差异出错)
*   更好追踪 (知道模型在干什么)
*   更安全 (参数校验)

### [3.3 实战案例:写一个好的系统提示词](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#33-%E5%AE%9E%E6%88%98%E6%A1%88%E4%BE%8B%E5%86%99%E4%B8%80%E4%B8%AA%E5%A5%BD%E7%9A%84%E7%B3%BB%E7%BB%9F%E6%8F%90%E7%A4%BA%E8%AF%8D)

假设你要做个”Python 代码审查助手”,提示词可以这样写:

```
你是一个 Python 代码审查专家,专注于发现潜在问题。

# 工作流程
1. 使用 read_file 工具读取代码
2. 分析以下方面:
   - 安全性 (SQL 注入、XSS、路径遍历等)
   - 性能 (N+1 查询、不必要的循环、内存泄漏)
   - 可维护性 (复杂度、命名、注释)
3. 给出具体的改进建议,包含代码示例

# 输出格式
- 按严重程度排序 (严重 > 警告 > 建议)
- 每个问题包含:
  - 位置 (文件名:行号)
  - 问题描述
  - 修复建议 (代码片段)
  - 严重程度评分 (1-10)

# 约束
- 不要给出模糊的建议,必须有具体代码
- 如果没有问题,明确说"未发现问题"
- 不要过度优化,只指出真正的问题

# 工具使用
- 读文件: 使用 read_file 而非 bash cat
- 搜索: 使用 grep 工具而非 bash grep
- 如果需要运行代码测试,使用 bash 工具
```

**这个提示词的好处:**

1.  **明确任务** - 知道要做什么
2.  **规定流程** - 按步骤执行
3.  **定义输出格式** - 结果结构化
4.  **设置约束** - 避免废话
5.  **工具指导** - 正确使用工具

### [3.4 提示词的常见误区](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#34-%E6%8F%90%E7%A4%BA%E8%AF%8D%E7%9A%84%E5%B8%B8%E8%A7%81%E8%AF%AF%E5%8C%BA)

**误区 1: 太客气**

❌ “如果方便的话,麻烦你帮我…” ✅ “读取 config.yaml 并验证格式”

模型不需要礼貌用语,反而会浪费 token。

**误区 2: 太啰嗦**

❌ “你是一个非常专业的、经验丰富的、具有多年实战经验的高级软件工程师…” ✅ “你是高级软件工程师”

模型不会因为夸它就变聪明。

**误区 3: 自相矛盾**

❌ “保持简洁” + “详细解释每个步骤” ✅ “简洁输出,仅在出错时解释”

前后冲突的指令会让模型困惑。

**误区 4: 没有约束**

❌ “帮我优化代码” ✅ “优化性能,但保持代码可读性。不要改变 API。“

没有边界,模型可能做出你意想不到的修改。

* * *

## [第四部分：工具系统深度解析 - 手把手实现](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%AC%AC%E5%9B%9B%E9%83%A8%E5%88%86%E5%B7%A5%E5%85%B7%E7%B3%BB%E7%BB%9F%E6%B7%B1%E5%BA%A6%E8%A7%A3%E6%9E%90---%E6%89%8B%E6%8A%8A%E6%89%8B%E5%AE%9E%E7%8E%B0)

### [4.1 工具的本质:给模型一双手](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#41-%E5%B7%A5%E5%85%B7%E7%9A%84%E6%9C%AC%E8%B4%A8%E7%BB%99%E6%A8%A1%E5%9E%8B%E4%B8%80%E5%8F%8C%E6%89%8B)

模型只能”思考”,不能”行动”。工具就是它的手脚。

**最基础的工具:Bash**

```
func runBash(input map[string]interface{}) string {
    command := input["command"].(string)

    // 执行命令
    cmd := exec.Command("bash", "-c", command)
    output, err := cmd.CombinedOutput()

    if err != nil {
        return fmt.Sprintf("错误: %v\n%s", err, output)
    }

    return string(output)
}
```

就这么简单。**接收命令,返回输出。**

### [4.2 工具定义的艺术](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#42-%E5%B7%A5%E5%85%B7%E5%AE%9A%E4%B9%89%E7%9A%84%E8%89%BA%E6%9C%AF)

一个好的工具定义包含:

**1\. 清晰的名称**

❌ `execute_command` ✅ `bash` (简短,明确)

**2\. 详细的描述**

```
{
  "name": "bash",
  "description": "执行 Shell 命令。使用场景:\n- 运行测试 (pytest, npm test)\n- 查看文件 (ls, find)\n- Git 操作 (git status, git diff)\n\n注意事项:\n- 避免危险命令 (rm -rf /)\n- 超时时间为 30 秒\n- 输出超过 10KB 会被截断"
}
```

**描述就是给模型看的文档。** 越详细,模型用得越准确。

**3\. 严格的 Schema**

```
{
  "input_schema": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "description": "要执行的 Shell 命令"
      },
      "timeout": {
        "type": "integer",
        "description": "超时时间(秒),默认 30",
        "minimum": 1,
        "maximum": 300
      }
    },
    "required": ["command"],
    "additionalProperties": false  // 不允许额外参数
  }
}
```

**`additionalProperties: false` 很重要!** 防止模型传入奇怪的参数。

### [4.3 核心工具实现](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#43-%E6%A0%B8%E5%BF%83%E5%B7%A5%E5%85%B7%E5%AE%9E%E7%8E%B0)

#### [Read - 读文件](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#read---%E8%AF%BB%E6%96%87%E4%BB%B6)

```
func runRead(input map[string]interface{}) string {
    path := input["file_path"].(string)

    // 安全检查:防止读取系统文件
    if strings.HasPrefix(path, "/etc") || strings.HasPrefix(path, "/sys") {
        return "错误: 无权访问系统目录"
    }

    // 读取文件
    data, err := os.ReadFile(path)
    if err != nil {
        return fmt.Sprintf("错误: %v", err)
    }

    // 截断过长内容
    content := string(data)
    if len(content) > 100000 {  // 100KB 限制
        content = content[:100000] + "\n...(内容过长,已截断)"
    }

    return content
}
```

**关键点:**

*   **安全检查** - 防止读敏感文件
*   **长度限制** - 避免炸掉上下文窗口
*   **错误处理** - 友好的错误信息

#### [Write - 写文件](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#write---%E5%86%99%E6%96%87%E4%BB%B6)

```
func runWrite(input map[string]interface{}) string {
    path := input["file_path"].(string)
    content := input["content"].(string)

    // 安全检查:只能写当前项目目录
    absPath, _ := filepath.Abs(path)
    workDir, _ := os.Getwd()

    if !strings.HasPrefix(absPath, workDir) {
        return "错误: 只能写入项目目录内的文件"
    }

    // 创建目录(如果不存在)
    dir := filepath.Dir(path)
    os.MkdirAll(dir, 0755)

    // 写入文件
    err := os.WriteFile(path, []byte(content), 0644)
    if err != nil {
        return fmt.Sprintf("错误: %v", err)
    }

    return fmt.Sprintf("成功写入 %d 字节到 %s", len(content), path)
}
```

**关键点:**

*   **路径校验** - 防止逃逸到项目外
*   **自动创建目录** - 用户体验优化
*   **明确的成功反馈** - 让模型知道操作完成

#### [Grep - 搜索代码](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#grep---%E6%90%9C%E7%B4%A2%E4%BB%A3%E7%A0%81)

```
func runGrep(input map[string]interface{}) string {
    pattern := input["pattern"].(string)
    path := input["path"].(string)  // 默认 "."

    // 使用 ripgrep (比 grep 快 10 倍)
    cmd := exec.Command("rg",
        pattern,      // 搜索模式
        path,         // 搜索路径
        "-n",         // 显示行号
        "--color=never", // 不要颜色代码
    )

    output, err := cmd.CombinedOutput()

    if err != nil {
        // 没找到匹配不是错误
        if strings.Contains(err.Error(), "exit status 1") {
            return "未找到匹配"
        }
        return fmt.Sprintf("错误: %v", err)
    }

    // 限制结果数量
    lines := strings.Split(string(output), "\n")
    if len(lines) > 100 {
        lines = lines[:100]
        lines = append(lines, "...(结果过多,仅显示前 100 条)")
    }

    return strings.Join(lines, "\n")
}
```

**为什么用 ripgrep 而不是 grep?**

*   速度快 10 倍
*   自动忽略 .git、node\_modules
*   默认递归搜索
*   支持正则和字面量模式

### [4.4 高级工具:TodoWrite](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#44-%E9%AB%98%E7%BA%A7%E5%B7%A5%E5%85%B7todowrite)

这是 Claude Code 的独特设计 —— **让模型管理自己的任务列表**。

```
type TodoItem struct {
    Content    string `json:"content"`      // "修复 bug"
    Status     string `json:"status"`       // "pending" | "in_progress" | "completed"
    ActiveForm string `json:"active_form"`  // "修复 bug 中"
}

var todoList = []TodoItem{}

func runTodoWrite(input map[string]interface{}) string {
    items := input["todos"].([]interface{})

    // 解析 todo 列表
    newList := []TodoItem{}
    for _, item := range items {
        itemMap := item.(map[string]interface{})
        newList = append(newList, TodoItem{
            Content:    itemMap["content"].(string),
            Status:     itemMap["status"].(string),
            ActiveForm: itemMap["activeForm"].(string),
        })
    }

    // 验证:最多只能有 1 个 in_progress
    inProgressCount := 0
    for _, todo := range newList {
        if todo.Status == "in_progress" {
            inProgressCount++
        }
    }

    if inProgressCount > 1 {
        return "错误: 同时只能有一个任务在进行中"
    }

    // 更新列表
    todoList = newList

    // 渲染 UI
    return renderTodoList(newList)
}

func renderTodoList(todos []TodoItem) string {
    if len(todos) == 0 {
        return "☐ 任务列表为空"
    }

    result := []string{}
    for _, todo := range todos {
        mark := "☐"
        if todo.Status == "completed" {
            mark = "☒"
        }

        line := fmt.Sprintf("%s %s", mark, todo.Content)
        if todo.Status == "in_progress" {
            line = "→ " + todo.ActiveForm  // "→ 修复 bug 中"
        }

        result = append(result, line)
    }

    return strings.Join(result, "\n")
}
```

**模型如何使用:**

第 1 轮:

```
{
  "tool": "TodoWrite",
  "input": {
    "todos": [
      {"content": "读取配置文件", "status": "in_progress", "activeForm": "正在读取配置文件"},
      {"content": "验证配置格式", "status": "pending", "activeForm": "验证配置格式中"},
      {"content": "生成报告", "status": "pending", "activeForm": "生成报告中"}
    ]
  }
}
```

第 5 轮:

```
{
  "tool": "TodoWrite",
  "input": {
    "todos": [
      {"content": "读取配置文件", "status": "completed", "activeForm": "正在读取配置文件"},
      {"content": "验证配置格式", "status": "completed", "activeForm": "验证配置格式中"},
      {"content": "生成报告", "status": "in_progress", "activeForm": "生成报告中"}
    ]
  }
}
```

**这让模型能:**

*   拆解复杂任务
*   跟踪执行进度
*   不会忘记下一步

### [4.5 如何设计新工具](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#45-%E5%A6%82%E4%BD%95%E8%AE%BE%E8%AE%A1%E6%96%B0%E5%B7%A5%E5%85%B7)

**原则 1: 单一职责**

❌ `file_operation` (读、写、删除都能做) ✅ `read_file`、`write_file`、`delete_file`

**原则 2: 明确的输入输出**

```
{
  "name": "format_code",
  "input_schema": {
    "properties": {
      "language": {"type": "string", "enum": ["python", "javascript", "go"]},
      "code": {"type": "string"}
    }
  },
  "output": "格式化后的代码,或错误信息"
}
```

**原则 3: 防御性编程**

```
func runFormatCode(input map[string]interface{}) string {
    // 1. 参数校验
    lang, ok := input["language"].(string)
    if !ok {
        return "错误: 缺少 language 参数"
    }

    code, ok := input["code"].(string)
    if !ok {
        return "错误: 缺少 code 参数"
    }

    // 2. 长度限制
    if len(code) > 1000000 {  // 1MB
        return "错误: 代码过长(最大 1MB)"
    }

    // 3. 实际逻辑
    switch lang {
    case "python":
        return formatPython(code)
    case "javascript":
        return formatJavaScript(code)
    default:
        return "错误: 不支持的语言"
    }
}
```

* * *

## [第五部分：扩展机制全景 - MCP、Skills 与整个生态](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E7%AC%AC%E4%BA%94%E9%83%A8%E5%88%86%E6%89%A9%E5%B1%95%E6%9C%BA%E5%88%B6%E5%85%A8%E6%99%AF---mcpskills-%E4%B8%8E%E6%95%B4%E4%B8%AA%E7%94%9F%E6%80%81)

这部分最容易混淆。让我从**API 请求的实际数据**入手,揭示它们的本质区别。

### [5.1 从 API 请求看 MCP 的真实成本](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#51-%E4%BB%8E-api-%E8%AF%B7%E6%B1%82%E7%9C%8B-mcp-%E7%9A%84%E7%9C%9F%E5%AE%9E%E6%88%90%E6%9C%AC)

还记得第二部分的 `request` 文件吗?让我们看看 MCP 工具在 `tools` 数组中的真实样子:

```
{
  "model": "claude-sonnet-4-5-20250929",
  "tools": [
    // 内置工具
    {
      "name": "bash",
      "description": "Execute a shell command...",
      "input_schema": {...}
    },

    // MCP 工具 - 每个都要完整传递!
    {
      "name": "mcp__fetch__fetch",
      "description": "Fetches a URL from the internet and optionally extracts its contents as markdown. Takes a URL and a prompt as input. Fetches the URL content, converts HTML to markdown. Processes the content with the prompt using a small, fast model. Returns the model's response about the content...",
      "input_schema": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "format": "uri",
            "minLength": 1,
            "title": "Url",
            "description": "The URL to fetch content from"
          },
          "raw": {
            "type": "boolean",
            "default": false,
            "title": "Raw",
            "description": "Get the actual HTML content of the requested page, without simplification."
          },
          "max_length": {
            "type": "integer",
            "default": 5000,
            "exclusiveMaximum": 1000000,
            "exclusiveMinimum": 0,
            "title": "Max Length",
            "description": "Maximum number of characters to return."
          },
          "start_index": {
            "type": "integer",
            "minimum": 0,
            "title": "Start Index",
            "description": "On return output starting at this character index..."
          }
        },
        "required": ["url"],
        "title": "Fetch"
      }
    },
    {
      "name": "mcp__ide__getDiagnostics",
      "description": "Get language diagnostics from VS Code",
      "input_schema": {
        "type": "object",
        "properties": {
          "uri": {
            "type": "string",
            "description": "Optional file URI to get diagnostics for. If not provided, gets diagnostics for all files."
          }
        }
      }
    }
    // ... 更多 MCP 工具
  ]
}
```

**上下文占用计算:**

*   1 个 MCP 工具的完整 schema ≈ **1,000 tokens**
*   10 个 MCP 工具 = **10,000 tokens**
*   **每次请求都要传递完整的 tools 数组**

这就是 MCP 的代价:**每个工具都会占用持久的上下文**。

### [5.2 Skills 的懒加载机制](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#52-skills-%E7%9A%84%E6%87%92%E5%8A%A0%E8%BD%BD%E6%9C%BA%E5%88%B6)

现在看看 Skills 是怎么做的。在 `tools` 数组中:

```
{
  "tools": [
    {
      "name": "Skill",
      "description": "Execute a skill within the main conversation...",
      "input_schema": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string",
            "description": "The skill name (no arguments). E.g., \"pdf\" or \"xlsx\""
          }
        },
        "required": ["command"]
      }
    }
  ]
}
```

**就这一个!** 不管你有多少个 Skill,`tools` 数组里永远只有这一个 `Skill` 工具。

那可用的 Skill 在哪?在 **system prompt** 里以轻量级 YAML 列出:

```
<available_skills>
<skill>
<name>codex</name>
<description>Execute Codex CLI for code analysis, refactoring...</description>
<location>user</location>
</skill>
<skill>
<name>requirements-clarity</name>
<description>Clarify ambiguous requirements through focused dialogue...</description>
<location>user</location>
</skill>
<skill>
<name>web-search</name>
<description>This skill should be used when web search is needed...</description>
<location>user</location>
</skill>
</available_skills>
```

每个 Skill 的描述只有 **~100 tokens**。

**关键区别:只有在模型调用时才加载完整内容**

```
User: 帮我用 codex 分析这段代码

Claude: [调用 Skill 工具]
{
  "tool": "Skill",
  "input": {"command": "codex"}
}

System: [此时才读取 .claude/skills/codex/SKILL.md 的完整内容]
[把完整 Skill 加载到 system prompt 中]

Claude: [现在有了完整的 codex skill 知识,开始分析代码]
```

**上下文节约对比:**

场景

MCP

Skills

注册 10 个扩展

10 × 1,000 = **10,000 tokens**

1 × 200 (工具定义) + 10 × 100 (YAML) = **1,200 tokens**

使用 1 个扩展

已在上下文中

+2,000 tokens (加载 SKILL.md)

**总计 (注册 10 个,用 1 个)**

**10,000 tokens**

**3,200 tokens**

**节约**

\-

**~68%**

这就是为什么 Skills **节约了 80% 的上下文** —— 它只在用的时候才加载完整内容!

### [5.3 MCP vs Skills - 从接口到场景的完整对比](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#53-mcp-vs-skills---%E4%BB%8E%E6%8E%A5%E5%8F%A3%E5%88%B0%E5%9C%BA%E6%99%AF%E7%9A%84%E5%AE%8C%E6%95%B4%E5%AF%B9%E6%AF%94)

维度

MCP

Skills

**本质**

外部工具协议

提示词模块

**注册方式**

每个工具在 `tools` 数组中完整定义

`tools` 中只有 1 个 `Skill` 入口 + YAML 列表

**上下文占用**

1 个 MCP ≈ 1k tokens,10 个 = 10k

10 个 Skills 注册 ≈ 1k tokens

**加载时机**

每次请求都传递完整 schema

**只在使用时加载完整内容**

**实现位置**

外部进程 (独立 server)

文件系统 (`.claude/skills/*.md`)

**适用场景**

外部系统集成 (数据库、API、云服务)

领域知识注入 (代码审查、调试)

**成本**

高 - 每次都占用上下文

低 - 按需加载

**隔离性**

强 - 独立进程,权限可控

弱 - 模型内部,依赖提示词

**它们是互补的,不是替代关系!**

*   MCP 解决 “能力” 问题 —— 连接外部系统
*   Skills 解决 “知识” 问题 —— 注入专业经验

### [5.4 Claude Code 的完整扩展生态](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#54-claude-code-%E7%9A%84%E5%AE%8C%E6%95%B4%E6%89%A9%E5%B1%95%E7%94%9F%E6%80%81)

MCP 和 Skills 只是冰山一角。Claude Code 有 **5 种扩展机制**,每种都有自己的价值:

#### [1\. **Slash Command** - 快速指令](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#1-slash-command---%E5%BF%AB%E9%80%9F%E6%8C%87%E4%BB%A4)

**定义:**

`.claude/commands/deploy.md`

```
部署应用到生产环境。

步骤:
1. 检查 Git 状态
2. 运行测试
3. 构建镜像
4. 推送到 K8s
```

**使用:**

```
/deploy production
```

**工作原理:**

*   用户输入 `/deploy` 时,读取 `deploy.md` 作为 prompt
*   相当于快捷输入预定义提示词

**适用场景:**

*   重复性任务的快捷入口
*   团队统一的工作流触发器

* * *

#### [2\. **Hooks** - 事件钩子](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#2-hooks---%E4%BA%8B%E4%BB%B6%E9%92%A9%E5%AD%90)

**定义:**

`.claude/hooks/validate-commit.sh`

```
#!/bin/bash
# 阻止提交到 main 分支

branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "main" ]; then
  echo "错误: 不能直接提交到 main 分支"
  exit 1
fi
```

**配置:**

```
{
  "hooks": {
    "user-prompt-submit": "~/.claude/hooks/validate.sh",
    "tool-call-before": "~/.claude/hooks/log-tool.sh"
  }
}
```

**工作原理:**

*   在特定事件发生时执行 shell 脚本
*   可以拦截、修改、记录操作

**适用场景:**

*   安全验证 (阻止危险操作)
*   日志记录 (审计工具调用)
*   自动化流程 (提交前检查)

* * *

#### [3\. **Subagent** - 子 Agent](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#3-subagent---%E5%AD%90-agent)

**使用:**

```
{
  "tool": "Task",
  "input": {
    "subagent_type": "Explore",
    "prompt": "Find all authentication related code",
    "model": "haiku"
  }
}
```

**工作原理:**

*   主 Agent 可以启动子 Agent 处理特定任务
*   子 Agent 有独立的上下文和工具
*   完成后返回结果给主 Agent

**适用场景:**

*   复杂搜索任务 (探索代码库)
*   成本优化 (简单任务用 haiku)
*   并行处理 (多个子任务同时进行)

**代码证据 (agent.go 第 1002-1019 行):**

```
{
    "type": "function",
    "function": map[string]interface{}{
        "name":        "Task",
        "description": "Launch a new agent to handle complex, multi-step tasks autonomously...",
        "parameters": map[string]interface{}{
            "properties": map[string]interface{}{
                "subagent_type": {"type": "string", "description": "The type of specialized agent..."},
                "prompt":        {"type": "string"},
                "model":         {"type": "string", "enum": []string{"sonnet", "opus", "haiku"}},
            },
        },
    },
}
```

* * *

#### [4\. **MCP** - 外部工具集成](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#4-mcp---%E5%A4%96%E9%83%A8%E5%B7%A5%E5%85%B7%E9%9B%86%E6%88%90)

**实现 (Python):**

```
from mcp import Server

server = Server("database")

@server.tool(name="query_db", description="Execute SQL query")
def query_database(sql: str) -> str:
    conn = sqlite3.connect("my.db")
    return json.dumps(conn.execute(sql).fetchall())

server.run()
```

**配置:**

```
{
  "mcp_servers": {
    "database": {"url": "http://localhost:5000"}
  }
}
```

**工作原理:**

*   外部程序实现 MCP 协议
*   Claude Code 通过 IPC/HTTP 调用
*   工具完整定义在 `tools` 数组中

**适用场景:**

*   数据库操作 (敏感凭证隔离)
*   云服务集成 (AWS/GCP/K8s)
*   企业系统对接 (CRM/ERP)

* * *

#### [5\. **Skills** - 知识模块](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#5-skills---%E7%9F%A5%E8%AF%86%E6%A8%A1%E5%9D%97)

**定义:**

`.claude/skills/code-review/SKILL.md`

```
# Code Review Skill

你是代码审查专家。重点关注:
- 安全漏洞 (SQL 注入、XSS)
- 性能问题 (N+1 查询)
- 代码质量 (复杂度、命名)
```

**使用:**

```
{
  "tool": "Skill",
  "input": {"command": "code-review"}
}
```

**工作原理:**

*   存储在 `.claude/skills/*/SKILL.md`
*   懒加载 - 只在调用时读取
*   注入到 system prompt

**适用场景:**

*   专业领域知识 (代码审查规范)
*   特定框架专家 (React/Vue 最佳实践)
*   团队共享工作流 (部署流程)

* * *

### [5.5 组合使用的威力](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#55-%E7%BB%84%E5%90%88%E4%BD%BF%E7%94%A8%E7%9A%84%E5%A8%81%E5%8A%9B)

**场景:自动化代码审查 + 部署**

```
1. Slash Command 触发
   用户输入: /deploy-with-review staging

2. Hook 验证
   user-prompt-submit hook 检查权限

3. Skill 加载
   加载 code-review skill (+2k tokens)

4. Subagent 并行执行
   - 子 Agent A: 用 haiku 快速扫描测试覆盖率
   - 子 Agent B: 用 haiku 检查依赖版本

5. MCP 工具调用
   - 调用 mcp__kubernetes__deploy
   - 调用 mcp__slack__notify

6. 主 Agent 整合结果
   生成部署报告
```

**这套组合:**

*   **Slash Command** - 入口 (快速触发)
*   **Hooks** - 安全控制 (阻止违规操作)
*   **Skills** - 领域知识 (审查规范)
*   **Subagent** - 并行优化 (降低成本)
*   **MCP** - 实际操作 (K8s 部署、Slack 通知)

### [5.6 何时用什么?决策树](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#56-%E4%BD%95%E6%97%B6%E7%94%A8%E4%BB%80%E4%B9%88%E5%86%B3%E7%AD%96%E6%A0%91)

```
需要外部系统集成?
  ├─ 是 → MCP
  │   例子: 数据库查询、云服务部署、企业系统对接
  └─ 否 → 需要领域知识?
      ├─ 是 → Skills
      │   例子: 代码审查规范、框架最佳实践
      └─ 否 → 需要快速入口?
          ├─ 是 → Slash Command
          │   例子: 重复性任务、团队工作流
          └─ 否 → 需要事件拦截?
              ├─ 是 → Hooks
              │   例子: 安全验证、审计日志
              └─ 否 → 需要并行处理?
                  ├─ 是 → Subagent
                  │   例子: 复杂搜索、成本优化
                  └─ 否 → 内置工具即可
```

**具体例子:**

需求

方案

原因

查询数据库

MCP

凭证隔离,权限控制,独立进程

代码审查

Skills

知识注入,团队共享,按需加载

快速部署

Slash Command

重复任务,一键触发

记录工具调用

Hooks

审计需求,安全合规

探索大型代码库

Subagent

复杂搜索,成本优化,并行执行

格式化代码

内置工具 (Bash)

简单任务,无需扩展

### [5.7 实战案例:完整的部署流程](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#57-%E5%AE%9E%E6%88%98%E6%A1%88%E4%BE%8B%E5%AE%8C%E6%95%B4%E7%9A%84%E9%83%A8%E7%BD%B2%E6%B5%81%E7%A8%8B)

假设你要实现 “代码审查后自动部署到 K8s” 的完整流程:

**1\. 定义 Slash Command**

`.claude/commands/deploy-reviewed.md`

```
执行代码审查后部署到 K8s 集群。

流程:
1. 使用 code-review skill 审查代码
2. 如果有严重问题,停止部署
3. 运行测试
4. 构建 Docker 镜像
5. 部署到 K8s
6. 发送 Slack 通知
```

**2\. 添加安全 Hook**

`.claude/hooks/pre-deploy.sh`

```
#!/bin/bash
# 检查是否在 main 分支
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" != "main" ]; then
  echo "错误: 只能从 main 分支部署"
  exit 1
fi
```

**3\. 创建 Code Review Skill**

`.claude/skills/code-review/SKILL.md`

```
# Code Review Skill

你是代码审查专家。

## 审查标准
- 严重: SQL 注入、XSS、硬编码密码
- 警告: N+1 查询、未处理错误
- 建议: 复杂度 > 10、函数 > 50 行

## 输出格式
返回 JSON: {"severity": "high|medium|low", "issues": [...]}
```

**4\. 部署 MCP Server**

```
# kubernetes_mcp.py
@server.tool(name="k8s_deploy")
def deploy(yaml_path: str, namespace: str) -> str:
    subprocess.run(["kubectl", "apply", "-f", yaml_path, "-n", namespace])
    return "Deployed successfully"

@server.tool(name="slack_notify")
def notify(channel: str, message: str) -> str:
    requests.post(SLACK_WEBHOOK, json={"channel": channel, "text": message})
    return "Notification sent"
```

**5\. 使用流程**

```
User: /deploy-reviewed staging

System:
  1. [Hook] pre-deploy.sh 检查分支 ✓
  2. [Skill] 加载 code-review skill
  3. [Subagent A] Haiku 扫描测试覆盖率 (并行)
  4. [Subagent B] Haiku 检查依赖版本 (并行)
  5. [Skill] 生成审查报告: {"severity": "low", "issues": []}
  6. [Bash] 运行测试: pytest --cov
  7. [Bash] 构建镜像: docker build -t myapp:v1.2.3
  8. [MCP] k8s_deploy(yaml_path="k8s/staging.yaml", namespace="staging")
  9. [MCP] slack_notify(channel="#deployments", message="Deployed myapp:v1.2.3 to staging")

Claude: 部署完成! 访问地址: https://staging.myapp.com
```

**这个流程用到了所有 5 种机制:**

*   ✅ Slash Command - 快速触发
*   ✅ Hooks - 安全检查
*   ✅ Skills - 审查知识
*   ✅ Subagent - 并行优化
*   ✅ MCP - 外部集成

**上下文占用分析:**

*   Slash Command: ~200 tokens (命令定义)
*   Hooks: 0 tokens (在 Claude 之外执行)
*   Skills (未使用): 100 tokens (YAML 注册)
*   Skills (使用时): +2,000 tokens (加载 SKILL.md)
*   Subagent: 0 tokens (独立上下文)
*   MCP (2 个工具): 2,000 tokens (tools 数组)

**总计: ~4,300 tokens**

如果全用 MCP 实现 (code-review + test + build + k8s + slack):

*   5 个 MCP 工具 × 1,000 = **5,000 tokens**
*   每次都占用,即使不用

**Skills + MCP 组合节约了 ~15% 的上下文,且更灵活。**

* * *

## [总结](https://stellarlink.co/articles/analyze-claude-code-%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E9%9B%B6%E5%AE%9E%E7%8E%B0%E5%88%B0%E7%94%9F%E4%BA%A7%E7%BA%A7%E7%9A%84%E5%AE%8C%E6%95%B4%E6%8C%87%E5%8D%97-copy#%E6%80%BB%E7%BB%93)

这篇文章从**实现代码**出发,一步步揭秘了 Claude Code 的技术内幕:

**核心循环:**

*   本质是个简单的 for 循环
*   LLM → 工具 → LLM → 最终答案
*   600 行代码,90% 在处理边界情况

**API 请求:**

*   Messages 数组记录对话历史
*   System 定义行为
*   Tools 声明能力
*   Caching 节省成本

**系统提示词:**

*   相当于”员工手册”
*   定义身份、约束、流程、输出格式
*   200+ 行的行为塑造

**工具系统:**

*   每个工具是独立的纯函数
*   输入参数 → 输出结果
*   关键是 Schema 定义和安全检查

**MCP vs Skills:**

*   MCP = 外部工具接口 (扩展能力)
*   Skills = 专业角色设定 (引导行为)
*   两者互补,不是替代关系

**最重要的启发:**

Claude Code 的成功不在于复杂的架构,而在于:

1.  **极简的控制流** - 让模型做决策
2.  **详尽的提示词** - 引导模型行为
3.  **原子化的工具** - 可靠且可组合
4.  **清晰的边界** - 自由与约束平衡

**现在,你可以:**

*   30 分钟实现基础版
*   1 周打造可用版
*   1 月达到生产级

**Talk is cheap. Show me the code.**

动手试试吧!

* * *

**参考资源**

*   [mini-claude-code-go](https://github.com/cexll/mini-claude-code-go) - 完整的 Go 实现
*   [Anthropic API 文档](https://docs.anthropic.com/claude/reference) - 官方 API 参考
*   [MCP 协议规范](https://modelcontextprotocol.io/) - 工具扩展标准
*   [Prompt Caching 指南](https://docs.anthropic.com/claude/docs/prompt-caching) - 省钱秘籍
