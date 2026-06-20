---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6"
title: agentsdk-go：完整的 Claude Code 架构 Agent 开发框架
description: agentsdk-go 完整的 Claude Code 架构 Agent 开发框架
resource: "https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6"
tags: []
timestamp: "2026-06-20T06:45:23.443Z"
source_path: "https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6"
source_id: a59b8f9dfaa6377ee905eb427f9a9499e9f6d70860de7671516cf13b7e7b31cb
content_hash: 36d68f8d3719877b4c6c412bf2fc4c6df8686612287260349d5cb063285f03db
---

## [TL;DR](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#tldr)

agentsdk-go 是一个用 Go 实现的 Agent 开发框架，完整移植了 Claude Code 的七大核心能力（Hooks、MCP、Sandbox、Skills、Subagents、Commands、Plugins），并扩展了六层中间件拦截机制。相比 LangGraph 的黑盒架构和 Claude Agent SDK 的资源占用问题，agentsdk-go 提供了更透明的实现、更低的资源消耗和更灵活的扩展能力。核心代码 20,300 行，Agent 主循环仅 189 行，测试覆盖率达 90-93%。

## [一、agentsdk-go 是什么](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E4%B8%80agentsdk-go-%E6%98%AF%E4%BB%80%E4%B9%88)

### [核心定位](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E6%A0%B8%E5%BF%83%E5%AE%9A%E4%BD%8D)

agentsdk-go 是基于 Claude Code 完整架构设计的 Agent 开发框架，面向生产环境的 CLI、CI/CD 和企业平台部署场景。它不是简单的 LLM 调用封装，而是提供了完整的 Agent 工程能力。

### [技术指标](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E6%8A%80%E6%9C%AF%E6%8C%87%E6%A0%87)

*   **代码规模**：约 20,300 行生产代码（不含测试）
*   **核心复杂度**：Agent 主循环 189 行
*   **测试覆盖率**：六大核心模块均达 90-93%（subagents 91.7%，api 91.0%，mcp 90.3%，model 92.2%，sandbox 90.5%，security 90.4%）
*   **模块化程度**：13 个独立包
*   **外部依赖**：anthropic-sdk-go、fsnotify、gopkg.in/yaml.v3、google/uuid、golang.org/x/mod、golang.org/x/net

### [系统架构](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E7%B3%BB%E7%BB%9F%E6%9E%B6%E6%9E%84)

#### [核心层（6 个模块）](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E6%A0%B8%E5%BF%83%E5%B1%826-%E4%B8%AA%E6%A8%A1%E5%9D%97)

1.  **pkg/agent**：Agent 执行循环，协调模型调用和工具执行
2.  **pkg/middleware**：六层拦截点，扩展请求/响应生命周期
3.  **pkg/model**：模型适配器，当前支持 Anthropic Claude
4.  **pkg/tool**：工具注册和执行，包含内置工具和 MCP 工具支持
5.  **pkg/message**：基于 LRU 的会话历史管理
6.  **pkg/api**：统一 API 接口，暴露 SDK 功能

#### [特性层（7 个模块）](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E7%89%B9%E6%80%A7%E5%B1%827-%E4%B8%AA%E6%A8%A1%E5%9D%97)

1.  **pkg/core/hooks**：七种生命周期事件的 Hooks 执行器
2.  **pkg/mcp**：MCP (Model Context Protocol) 客户端，桥接外部工具（stdio/SSE）
3.  **pkg/sandbox**：沙箱隔离层，控制文件系统和网络访问策略
4.  **pkg/runtime/skills**：Skills 管理，支持脚本加载和热重载
5.  **pkg/runtime/subagents**：Subagent 管理，用于多 Agent 编排和调度
6.  **pkg/runtime/commands**：Commands 解析器，处理斜杠命令路由和参数验证
7.  **pkg/plugins**：插件系统，具备签名验证和生命周期钩子

#### [中间件拦截点](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E4%B8%AD%E9%97%B4%E4%BB%B6%E6%8B%A6%E6%88%AA%E7%82%B9)

```
用户请求
  ↓
before_agent  ← 请求验证、审计日志
  ↓
Agent 循环
  ↓
before_model  ← Prompt 处理、上下文优化
  ↓
模型调用
  ↓
after_model   ← 结果过滤、内容检查
  ↓
before_tool   ← 工具参数验证
  ↓
工具执行
  ↓
after_tool    ← 结果后处理
  ↓
after_agent   ← 响应格式化、指标收集
  ↓
用户响应
```

这种六层拦截设计允许开发者在 Agent 执行的关键节点注入自定义逻辑，实现日志记录、性能监控、安全审计等功能。

### [配置系统](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E9%85%8D%E7%BD%AE%E7%B3%BB%E7%BB%9F)

agentsdk-go 使用 `.claude/` 目录进行配置，与 Claude Code 完全兼容：

```
.claude/
├── settings.json           # 项目配置
├── settings.local.json     # 本地覆盖（gitignored）
├── skills/                 # Skills 定义
├── commands/               # 斜杠命令定义
├── agents/                 # Subagents 定义
└── plugins/                # 插件目录
```

配置优先级（从高到低）：

1.  托管策略（`/etc/claude-code/managed-settings.json`）
2.  运行时覆盖（CLI/API 提供）
3.  `.claude/settings.local.json`
4.  `.claude/settings.json`
5.  内置默认值

配置示例：

```
{
  "permissions": {
    "allow": ["Bash(ls:*)", "Bash(pwd:*)"],
    "deny": ["Read(.env)", "Read(secrets/**)"]
  },
  "env": {
    "MY_VAR": "value"
  },
  "sandbox": {
    "enabled": false
  }
}
```

## [二、为什么要自己写 agentsdk-go](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E4%BA%8C%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E8%87%AA%E5%B7%B1%E5%86%99-agentsdk-go)

### [LangGraph 的架构问题](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#langgraph-%E7%9A%84%E6%9E%B6%E6%9E%84%E9%97%AE%E9%A2%98)

LangGraph 虽然功能强大，但存在几个核心痛点：

1.  **黑盒架构**：状态图抽象过重，难以追踪 Agent 执行流程，调试困难
2.  **灵活性不足**：固定的图结构限制了动态决策和运行时调整
3.  **工程能力缺失**：缺少 Sandbox、Hooks、MCP 等生产环境必需的能力
4.  **Python 生态绑定**：对 Go 生态支持不佳

### [Claude Agent SDK 的资源瓶颈](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#claude-agent-sdk-%E7%9A%84%E8%B5%84%E6%BA%90%E7%93%B6%E9%A2%88)

Claude Agent SDK 基于 `claude -p` 实现，每次调用都会在本地启动一个完整的 Claude 实例：

*   **CPU 占用**：每个实例独立进程，多任务并发时 CPU 飙升
*   **内存消耗**：每个实例加载完整上下文，内存占用线性增长
*   **启动延迟**：进程冷启动时间影响响应速度

这在 CI/CD 和高并发场景下完全不可接受。

### [agentsdk-go 的优势](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#agentsdk-go-%E7%9A%84%E4%BC%98%E5%8A%BF)

#### [1\. 架构透明性](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#1-%E6%9E%B6%E6%9E%84%E9%80%8F%E6%98%8E%E6%80%A7)

完全遵循 Claude Code 的设计原则，核心 Agent 循环仅 189 行，逻辑清晰：

*   请求接收 → 中间件前置处理 → 模型调用 → 工具执行 → 中间件后置处理 → 响应返回
*   每个环节都可拦截、观测、调试

#### [2\. 资源效率](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#2-%E8%B5%84%E6%BA%90%E6%95%88%E7%8E%87)

*   **单进程模型**：所有 Agent 共享一个运行时，无进程启动开销
*   **会话缓存**：基于 LRU 的消息历史管理，避免重复上下文加载
*   **按需加载**：Skills、Plugins、MCP 工具仅在使用时初始化

#### [3\. 扩展能力](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#3-%E6%89%A9%E5%B1%95%E8%83%BD%E5%8A%9B)

*   **中间件系统**：六层拦截点覆盖完整生命周期
*   **Sandbox 优化**：更细粒度的资源控制（CPU、内存、磁盘、网络）
*   **自定义工具**：简单的 `tool.Tool` 接口，5 分钟完成集成

#### [4\. 生产就绪](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#4-%E7%94%9F%E4%BA%A7%E5%B0%B1%E7%BB%AA)

*   **高测试覆盖率**：核心模块 90%+ 覆盖，保证代码质量
*   **HTTP API**：内置 REST + SSE 服务器，开箱即用
*   **可观测性**：Trace、Metrics、Logs 完整支持

## [三、如何使用 agentsdk-go 开发 Agent](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E4%B8%89%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-agentsdk-go-%E5%BC%80%E5%8F%91-agent)

### [安装和环境准备](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E5%AE%89%E8%A3%85%E5%92%8C%E7%8E%AF%E5%A2%83%E5%87%86%E5%A4%87)

#### [前置要求](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E5%89%8D%E7%BD%AE%E8%A6%81%E6%B1%82)

*   Go 1.24.0 或更高版本
*   Anthropic API Key

#### [安装 SDK](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E5%AE%89%E8%A3%85-sdk)

```
go get github.com/cexll/agentsdk-go
```

### [基础示例：5 分钟创建第一个 Agent](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E5%9F%BA%E7%A1%80%E7%A4%BA%E4%BE%8B5-%E5%88%86%E9%92%9F%E5%88%9B%E5%BB%BA%E7%AC%AC%E4%B8%80%E4%B8%AA-agent)

这是来自 `examples/01-basic/main.go` 的最小示例，展示了 agentsdk-go 的核心用法：

```
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/cexll/agentsdk-go/pkg/api"
	"github.com/cexll/agentsdk-go/pkg/middleware"
	modelpkg "github.com/cexll/agentsdk-go/pkg/model"
)

func main() {
	// 创建 Anthropic provider
	provider := &modelpkg.AnthropicProvider{
		ModelName: "claude-sonnet-4-5-20250929",
	}

	// 初始化运行时
	traceMW := middleware.NewTraceMiddleware(".trace")
	rt, err := api.New(context.Background(), api.Options{
		ModelFactory: provider,
		Middleware:   []middleware.Middleware{traceMW},
	})
	if err != nil {
		log.Fatalf("build runtime: %v", err)
	}
	defer rt.Close()

	// 发起同步调用
	resp, err := rt.Run(context.Background(), api.Request{
		Prompt: "你好",
	})
	if err != nil {
		log.Fatalf("run: %v", err)
	}

	if resp.Result != nil {
		fmt.Println(resp.Result.Output)
	}
}
```

**关键点**：

1.  **模型初始化**：通过 `AnthropicProvider` 配置模型
2.  **中间件注入**：`TraceMiddleware` 自动记录执行日志到 `.trace` 目录
3.  **运行时创建**：`api.New()` 初始化完整运行时
4.  **同步调用**：`rt.Run()` 阻塞等待结果

运行示例：

```
# 1. 设置环境变量
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# 2. 运行示例
go run ./examples/01-basic
```

### [进阶用法：自定义中间件](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E8%BF%9B%E9%98%B6%E7%94%A8%E6%B3%95%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%AD%E9%97%B4%E4%BB%B6)

中间件是 agentsdk-go 的核心扩展机制，允许在六个关键节点注入逻辑：

```
loggingMiddleware := middleware.Middleware{
	// 请求前：记录输入和启动时间
	BeforeAgent: func(ctx context.Context, req *middleware.AgentRequest) (*middleware.AgentRequest, error) {
		log.Printf("[REQUEST] %s", req.Input)
		req.Meta["start_time"] = time.Now()
		return req, nil
	},

	// 响应后：计算执行时间
	AfterAgent: func(ctx context.Context, resp *middleware.AgentResponse) (*middleware.AgentResponse, error) {
		duration := time.Since(resp.Meta["start_time"].(time.Time))
		log.Printf("[RESPONSE] %s (elapsed: %v)", resp.Output, duration)
		return resp, nil
	},

	// 模型调用前：优化 Prompt
	BeforeModel: func(ctx context.Context, req *middleware.ModelRequest) (*middleware.ModelRequest, error) {
		// 添加系统提示词
		req.Messages = append([]middleware.Message{
			{Role: "system", Content: "你是一个技术专家"},
		}, req.Messages...)
		return req, nil
	},

	// 工具执行前：参数验证
	BeforeTool: func(ctx context.Context, req *middleware.ToolRequest) (*middleware.ToolRequest, error) {
		log.Printf("[TOOL] %s with params: %v", req.Name, req.Parameters)
		return req, nil
	},
}

// 注入中间件
runtime, err := api.New(ctx, api.Options{
	ProjectRoot:  ".",
	ModelFactory: provider,
	Middleware:   []middleware.Middleware{loggingMiddleware},
})
```

### [流式输出：实时获取 Agent 执行进度](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E6%B5%81%E5%BC%8F%E8%BE%93%E5%87%BA%E5%AE%9E%E6%97%B6%E8%8E%B7%E5%8F%96-agent-%E6%89%A7%E8%A1%8C%E8%BF%9B%E5%BA%A6)

对于长时间运行的任务，流式 API 提供实时反馈：

```
events := runtime.RunStream(ctx, api.Request{
	Prompt:    "分析代码仓库结构并生成报告",
	SessionID: "analysis",
})

for event := range events {
	switch event.Type {
	case "content_block_delta":
		// 输出文本内容
		fmt.Print(event.Delta.Text)

	case "tool_execution_start":
		// 工具开始执行
		fmt.Printf("\n[工具执行] %s\n", event.ToolName)

	case "tool_execution_stop":
		// 工具执行完成
		fmt.Printf("[工具结果] %s\n", event.Output)
	}
}
```

### [自定义工具：扩展 Agent 能力](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B7%A5%E5%85%B7%E6%89%A9%E5%B1%95-agent-%E8%83%BD%E5%8A%9B)

agentsdk-go 允许注册自定义工具，接口非常简洁（参考 `examples/05-custom-tools/main.go`）：

```
// 定义自定义工具
type EchoTool struct{}

func (t *EchoTool) Name() string {
	return "echo"
}

func (t *EchoTool) Description() string {
	return "返回提供的文本"
}

func (t *EchoTool) Schema() *tool.JSONSchema {
	return &tool.JSONSchema{
		Type: "object",
		Properties: map[string]any{
			"text": map[string]any{
				"type":        "string",
				"description": "要返回的文本",
			},
		},
		Required: []string{"text"},
	}
}

func (t *EchoTool) Execute(ctx context.Context, params map[string]any) (*tool.ToolResult, error) {
	return &tool.ToolResult{
		Output: fmt.Sprint(params["text"]),
	}, nil
}

// 注册工具
rt, err := api.New(ctx, api.Options{
	ProjectRoot:         ".",
	ModelFactory:        provider,
	EnabledBuiltinTools: []string{"bash", "file_read"}, // 选择性启用内置工具
	CustomTools:         []tool.Tool{&EchoTool{}},      // 添加自定义工具
})
```

**工具注册规则**：

*   `EnabledBuiltinTools: nil` → 启用所有内置工具
*   `EnabledBuiltinTools: []string{}` → 禁用所有内置工具
*   `EnabledBuiltinTools: []string{"bash", "file_read"}` → 仅启用指定工具（大小写不敏感）
*   `CustomTools` → 追加自定义工具

### [高级特性：完整工程能力](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E9%AB%98%E7%BA%A7%E7%89%B9%E6%80%A7%E5%AE%8C%E6%95%B4%E5%B7%A5%E7%A8%8B%E8%83%BD%E5%8A%9B)

`examples/04-advanced` 展示了生产环境所需的全部功能：

#### [1\. Sandbox 隔离](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#1-sandbox-%E9%9A%94%E7%A6%BB)

```
opts := api.Options{
	Sandbox: &sandbox.Options{
		Enabled:     true,
		Root:        "/app/workspace",
		AllowedHosts: []string{"api.example.com"},
		CPULimit:    50.0,  // CPU 使用率限制 50%
		MemLimit:    512,   // 内存限制 512MB
		DiskLimit:   1024,  // 磁盘限制 1GB
	},
}
```

#### [2\. MCP 工具集成](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#2-mcp-%E5%B7%A5%E5%85%B7%E9%9B%86%E6%88%90)

```
opts := api.Options{
	MCPServers: []mcp.ServerConfig{
		{
			Name:    "time-server",
			Command: "uvx",
			Args:    []string{"mcp-server-time"},
		},
	},
}
```

#### [3\. Skills 和 Subagents](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#3-skills-%E5%92%8C-subagents)

```
opts := api.Options{
	Skills: []skills.Skill{
		{Name: "code-review", Path: ".claude/skills/code-review"},
	},
	Subagents: []subagents.Config{
		{Name: "analyzer", Prompt: "专注于代码分析"},
	},
}
```

### [五层示例路径](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E4%BA%94%E5%B1%82%E7%A4%BA%E4%BE%8B%E8%B7%AF%E5%BE%84)

agentsdk-go 提供渐进式学习路径：

1.  **01-basic**：最小化的单次请求/响应
2.  **02-cli**：交互式 REPL，支持会话历史
3.  **03-http**：REST + SSE 服务器（监听 `:8080`）
4.  **04-advanced**：完整管道（中间件、Hooks、MCP、Sandbox、Skills、Subagents）
5.  **05-custom-tools**：选择性内置工具 + 自定义工具注册

## [总结](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E6%80%BB%E7%BB%93)

agentsdk-go 不是简单的 API 封装，而是完整的 Agent 工程框架：

*   **架构透明**：189 行核心循环，逻辑清晰可追溯
*   **资源高效**：单进程模型，无冷启动开销
*   **扩展灵活**：六层中间件 + 自定义工具 + MCP 集成
*   **生产就绪**：90%+ 测试覆盖，HTTP API 开箱即用

如果你在使用 LangGraph 时感到束缚，或因 Claude Agent SDK 的资源占用而困扰，不妨试试 agentsdk-go——一个真正为工程师设计的 Agent 开发框架。

## [参考资源](https://stellarlink.co/articles/agentsdk-go-%E5%AE%8C%E6%95%B4%E7%9A%84-claude-code-%E6%9E%B6%E6%9E%84-agent-%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6#%E5%8F%82%E8%80%83%E8%B5%84%E6%BA%90)

*   GitHub 仓库：[https://github.com/cexll/agentsdk-go](https://github.com/cexll/agentsdk-go)
*   示例代码：[https://github.com/cexll/agentsdk-go/tree/main/examples](https://github.com/cexll/agentsdk-go/tree/main/examples)
*   Claude Code 文档：[https://docs.anthropic.com/en/docs/agents](https://docs.anthropic.com/en/docs/agents)
