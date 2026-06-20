---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84"
title: Claude Code 代码与接口完全揭秘
description: Claude Code 代码与接口完全揭秘
resource: "https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84"
tags: []
timestamp: "2026-06-20T06:46:12.500Z"
source_path: "https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84"
source_id: 3201337fb0d57b4fa26019641522fb1c4e0d069453f2562ba63e320779c6336c
content_hash: 000296495768f9bbbba5b9305652acedd528c96af8ec16d189258493dac787f6
---

## [通过抓包与逆向打开黑盒](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#%E9%80%9A%E8%BF%87%E6%8A%93%E5%8C%85%E4%B8%8E%E9%80%86%E5%90%91%E6%89%93%E5%BC%80%E9%BB%91%E7%9B%92)

通过**接口抓包**和**代码逆向**,我们可以完整了解 Claude Code 的全貌,并学习其实现来打造自己的 Agent。

抓包工具 [claude-trace](https://github.com/badlogic/lemmy/tree/main/apps/claude-trace)

本文基于以下关键材料:

**代码实现层 (`request`):**

*   Go 实现 (`agent.go`) - 核心 Agent 循环
*   完整系统提示词 (`system-prompt`) - 行为约束与工具策略
*   工具定义 (`tools.json`) - 15+ 工具的 JSON Schema

**接口设计层 (`response`):**

*   真实 API 请求体 - 完整的消息结构、工具数组、缓存策略
*   SSE 流式响应 - model 选择、token 计数、流式输出协议

通过对比 **request**(代码如何组装请求)与 **response**(Anthropic 如何设计接口与选择模型),我们将揭秘:

*   Agent 核心循环代码
*   系统提示词如何塑造行为
*   工具定义即能力边界
*   MCP 与 Skills 的本质区别(80% 上下文节省)
*   Prompt Caching 如何节省 90% 成本

让我们从最简单的代码开始,一步步看透 Claude Code 的全部技术细节。

* * *

## [第一部分：核心循环](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#%E7%AC%AC%E4%B8%80%E9%83%A8%E5%88%86%E6%A0%B8%E5%BF%83%E5%BE%AA%E7%8E%AF)

### [1.1 主循环](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#11-%E4%B8%BB%E5%BE%AA%E7%8E%AF)

打开 `agent.go`,第 374-432 行是整个 Agent 的核心:

```
func query(cfg Config, messages []Message) ([]Message, error) {
    sysPrompt := fmt.Sprintf(systemPrompt, cfg.WorkDir)

    for idx := 0; idx < maxAgentIterations; idx++ {
        spin := newSpinner("Waiting for model")
        spin.Start()
        resp, err := callOpenAI(cfg, fullMessages)
        spin.Stop()

        if err != nil {
            return messages, err
        }

        // 打印文本内容
        if assistantMsg.Content != "" {
            fmt.Println(assistantMsg.Content)
        }

        // 检查是否有 tool calls
        if choice.FinishReason == "tool_calls" && len(assistantMsg.ToolCalls) > 0 {
            // 执行所有工具
            for _, tc := range assistantMsg.ToolCalls {
                result := dispatchToolCall(cfg, tc)
                messages = append(messages, result)
                fullMessages = append(messages, result)
            }
            continue
        }

        // 跟踪没有使用 todo 的轮次
        agentState.mu.Lock()
        agentState.roundsWithoutTodo++
        if agentState.roundsWithoutTodo > 10 {
            ensureContextBlock(nagReminder)
        }
        agentState.mu.Unlock()

        return messages, nil
    }

    return messages, errors.New("agent max iterations reached")
}
```

核心逻辑可以总结为三步:

1.  **调用模型** - 等待 LLM 响应
2.  **执行工具** - 如果模型请求工具调用,执行并返回结果
3.  **循环** - 重复直到模型返回最终答案或达到最大迭代次数

对比传统 Agent 框架动辄几千行的状态管理代码,这种极简设计令人震撼。

### [1.2 工具分发:Unix 哲学的体现](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#12-%E5%B7%A5%E5%85%B7%E5%88%86%E5%8F%91unix-%E5%93%B2%E5%AD%A6%E7%9A%84%E4%BD%93%E7%8E%B0)

第 515-567 行的 `dispatchToolCall` 函数展示了工具调用的处理方式:

```
func dispatchToolCall(cfg Config, tc ToolCall) Message {
    // 解析参数
    var input map[string]interface{}
    json.Unmarshal([]byte(tc.Function.Arguments), &input)

    // 显示工具调用
    var displayText string
    switch tc.Function.Name {
    case "TodoWrite":
        displayText = "updating todos"
    default:
        displayText = fmt.Sprintf("%v", input)
    }
    prettyToolLine(tc.Function.Name, displayText)

    var result string
    var err error

    // 分发到具体工具
    switch tc.Function.Name {
    case "Bash":
        result, err = runBash(cfg, input)
    case "Read":
        result, err = runRead(cfg, input)
    case "Write":
        result, err = runWrite(cfg, input)
    case "Edit":
        result, err = runEdit(cfg, input)
    case "TodoWrite":
        result, err = runTodoUpdate(cfg, input)
    default:
        err = fmt.Errorf("unknown tool: %s", tc.Function.Name)
    }

    if err != nil {
        result = err.Error()
    }

    prettySubLine(clampText(result, 2000))

    return Message{
        Role:       "tool",
        ToolCallID: tc.ID,
        Name:       tc.Function.Name,
        Content:    clampText(result, cfg.MaxResult),
    }
}
```

每个工具都是**独立的纯函数**,输入参数,输出结果,不维护任何状态。这正是 Unix 哲学 “Do one thing and do it well” 的代码体现。

### [1.3 Todo 管理:模型的自我追踪](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#13-todo-%E7%AE%A1%E7%90%86%E6%A8%A1%E5%9E%8B%E7%9A%84%E8%87%AA%E6%88%91%E8%BF%BD%E8%B8%AA)

第 757-818 行实现了一个巧妙的 Todo 系统:

```
func runTodoUpdate(cfg Config, input map[string]interface{}) (string, error) {
    itemsList, ok := input["items"].([]interface{})
    if !ok {
        return "", errors.New("items must be an array")
    }

    items := make([]TodoItem, 0, len(itemsList))
    for i, rawItem := range itemsList {
        itemMap, ok := rawItem.(map[string]interface{})
        if !ok {
            return "", fmt.Errorf("item %d is not an object", i)
        }

        items = append(items, TodoItem{
            ID:         getString(itemMap, "id"),
            Content:    getString(itemMap, "content"),
            Status:     getString(itemMap, "status"),
            ActiveForm: getString(itemMap, "activeForm"),
        })
    }

    boardView, err := todoBoard.Update(items)
    if err != nil {
        return "", err
    }

    // 重置轮次计数器
    agentState.mu.Lock()
    agentState.roundsWithoutTodo = 0
    agentState.mu.Unlock()

    stats := todoBoard.Stats()
    summary := fmt.Sprintf("Status updated: %d completed, %d in progress.",
        stats["completed"], stats["in_progress"])

    return boardView + "\n\n" + summary, nil
}
```

这不是给用户看的任务列表,而是**模型的自我管理工具**。模型通过 TodoWrite 工具:

*   规划多步任务
*   跟踪执行进度
*   自我提醒下一步

更妙的是第 421-427 行的监控逻辑:如果连续 10 轮没使用 Todo,系统会自动注入提醒。这是一种**软性约束**,不强制,但引导模型养成良好习惯。

### [1.4 上下文注入:隐形的引导](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#14-%E4%B8%8A%E4%B8%8B%E6%96%87%E6%B3%A8%E5%85%A5%E9%9A%90%E5%BD%A2%E7%9A%84%E5%BC%95%E5%AF%BC)

第 879-900 行展示了上下文注入机制:

```
func injectReminders(userText string) interface{} {
    if len(pendingContextBlocks) == 0 {
        return userText // 简单字符串
    }
    blocks := make([]ContentBlock, len(pendingContextBlocks))
    copy(blocks, pendingContextBlocks)
    blocks = append(blocks, ContentBlock{Type: "text", Text: userText})
    pendingContextBlocks = nil
    return blocks
}

func ensureContextBlock(text string) {
    for _, block := range pendingContextBlocks {
        if block.Text == text {
            return
        }
    }
    pendingContextBlocks = append(pendingContextBlocks, ContentBlock{
        Type: "text",
        Text: text,
    })
}
```

系统可以在用户消息前**静默插入提示**,比如:

*   第 53 行定义的 `initialReminder` - 提醒使用 Todo 工具
*   第 54 行的 `nagReminder` - 超过 10 轮的警告

这些提醒对用户**不可见**,但会影响模型行为。这是一种精妙的行为塑造技术 —— 通过上下文微调而非硬编码规则来引导模型。

* * *

## [第二部分：系统提示词 - 行为塑造的艺术](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#%E7%AC%AC%E4%BA%8C%E9%83%A8%E5%88%86%E7%B3%BB%E7%BB%9F%E6%8F%90%E7%A4%BA%E8%AF%8D---%E8%A1%8C%E4%B8%BA%E5%A1%91%E9%80%A0%E7%9A%84%E8%89%BA%E6%9C%AF)

### [2.1 提示词结构:从宏观到微观的层次设计](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#21-%E6%8F%90%E7%A4%BA%E8%AF%8D%E7%BB%93%E6%9E%84%E4%BB%8E%E5%AE%8F%E8%A7%82%E5%88%B0%E5%BE%AE%E8%A7%82%E7%9A%84%E5%B1%82%E6%AC%A1%E8%AE%BE%E8%AE%A1)

抓包得到 `system-prompt`,你会发现一个精心组织的 200+ 行提示词,分为以下层次:

**第 1 层:身份与约束**

```
You are Claude Code, Anthropic's official CLI for Claude.
You are an interactive CLI tool that helps users with software engineering tasks.

IMPORTANT: Assist with authorized security testing...
IMPORTANT: You must NEVER generate or guess URLs...
```

开门见山定义身份,然后立即设置**安全边界**。

**第 2 层:沟通风格**

```
# Tone and style
- Only use emojis if the user explicitly requests it.
- Your output will be displayed on a command line interface.
  Your responses should be short and concise.
- Output text to communicate with the user; all text you output
  outside of tool use is displayed to the user.
```

强调 CLI 环境的特殊性 —— 简洁、直接、避免表情符号。这与 Web 聊天界面的提示完全不同。

**第 3 层:专业客观性**

```
# Professional objectivity
Prioritize technical accuracy and truthfulness over validating
the user's beliefs. Focus on facts and problem-solving...
Avoid using over-the-top validation or excessive praise when
responding to users such as "You're absolutely right"...
```

这是 **Anti-RLHF** 的体现。传统聊天模型被训练成”讨好用户”,但 Agent 需要**说真话,即使用户不爱听**。

**第 4 层:任务管理策略**

```
# Task Management
You have access to the TodoWrite tools to help you manage and
plan tasks. Use these tools VERY frequently...

It is critical that you mark todos as completed as soon as you
are done with a task. Do not batch up multiple tasks before
marking them as completed.
```

详细定义了何时使用 Todo、如何拆分任务、什么时候标记完成。这些规则配合代码中的监控机制,形成了完整的任务管理体系。

### [2.2 工具使用策略:优先级与禁忌](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#22-%E5%B7%A5%E5%85%B7%E4%BD%BF%E7%94%A8%E7%AD%96%E7%95%A5%E4%BC%98%E5%85%88%E7%BA%A7%E4%B8%8E%E7%A6%81%E5%BF%8C)

提示词中最长的部分是工具使用指南,包含大量实战智慧:

**并行执行规则**

```
You can call multiple tools in a single response. If you intend
to call multiple tools and there are no dependencies between them,
make all independent tool calls in parallel. Maximize use of
parallel tool calls where possible to increase efficiency.
```

模型被明确告知:能并行就并行。这直接影响执行效率。

**工具选择层次**

```
Use specialized tools instead of bash commands when possible:
- File search: Use Glob (NOT find or ls)
- Content search: Use Grep (NOT grep or rg)
- Read files: Use Read (NOT cat/head/tail)
- Edit files: Use Edit (NOT sed/awk)
- Write files: Use Write (NOT echo >/cat <<EOF)
```

建立了清晰的**工具优先级**。虽然 Bash 能做所有事,但专用工具更可靠、更好追踪。

**探索式搜索委托**

```
VERY IMPORTANT: When exploring the codebase to gather context
or to answer a question that is not a needle query for a specific
file/class/function, it is CRITICAL that you use the Task tool
with subagent_type=Explore instead of running search commands
directly.
```

这解决了一个关键问题:**复杂搜索任务应该委托给子 Agent,而不是自己循环搜索**。避免主 Agent 陷入”搜索地狱”。

### [2.3 Git 操作规范:细节中的工程智慧](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#23-git-%E6%93%8D%E4%BD%9C%E8%A7%84%E8%8C%83%E7%BB%86%E8%8A%82%E4%B8%AD%E7%9A%84%E5%B7%A5%E7%A8%8B%E6%99%BA%E6%85%A7)

Git 相关的提示词占了 100+ 行,包含大量实战经验:

**Commit 流程 - 并行+串行的混合策略**

```
1. Run multiple bash commands in parallel:
   - Run a git status command
   - Run a git diff command
   - Run a git log command

2. Analyze all staged changes and draft a commit message

3. Run the following commands:
   - Add relevant untracked files to the staging area
   - Create the commit with a message ending with:
     🤖 Generated with [Claude Code](https://claude.com/claude-code "Claude Code")
     Co-Authored-By: Claude <noreply@anthropic.com>
   - Run git status after the commit completes to verify success
     Note: git status depends on the commit completing,
     so run it sequentially after the commit.
```

注意这里的策略:**信息收集并行,操作执行串行**。这是实践中总结出的最优模式。

**安全协议 - 永远不要做的事**

```
Git Safety Protocol:
- NEVER update the git config
- NEVER run destructive/irreversible git commands unless explicitly requested
- NEVER skip hooks (--no-verify, --no-gpg-sign, etc)
- NEVER run force push to main/master
- NEVER commit changes unless the user explicitly asks you to
```

这些硬约束是从血泪教训中学来的。Agent 的自主性很强,必须有明确的**禁区**。

### [2.4 上下文工程:CLAUDE.md 的巧妙设计](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#24-%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8Bclaudemd-%E7%9A%84%E5%B7%A7%E5%A6%99%E8%AE%BE%E8%AE%A1)

提示词最后引用了项目级配置:

```
<system-reminder>
As you answer the user's questions, you can use the following context:
# claudeMd
Codebase and user instructions are shown below. Be sure to adhere
to these instructions. IMPORTANT: These instructions OVERRIDE any
default behavior and you MUST follow them exactly as written.

Contents of /Users/xxxxxx/.claude/CLAUDE.md (user's private
global instructions for all projects):
...

Contents of /Users/xxxxxx/CLAUDE.md (project
instructions, checked into the codebase):
...
</system-reminder>
```

这里引入了**三层配置体系**:

1.  **全局配置** (`~/.claude/CLAUDE.md`) - 用户偏好,跨项目生效
2.  **项目配置** (`project/CLAUDE.md`) - 团队约定,纳入版本控制
3.  **系统默认** - Anthropic 内置的基础提示

优先级明确:**项目配置 > 全局配置 > 系统默认**。

这相当于给了用户**修改系统提示的能力**,同时保证了团队协作的一致性。非常巧妙的设计。

* * *

## [第三部分:工具定义 - API 即能力边界](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#%E7%AC%AC%E4%B8%89%E9%83%A8%E5%88%86%E5%B7%A5%E5%85%B7%E5%AE%9A%E4%B9%89---api-%E5%8D%B3%E8%83%BD%E5%8A%9B%E8%BE%B9%E7%95%8C)

### [3.1 工具 Schema 的设计哲学](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#31-%E5%B7%A5%E5%85%B7-schema-%E7%9A%84%E8%AE%BE%E8%AE%A1%E5%93%B2%E5%AD%A6)

`tools.json` 定义了 15+ 个工具,每个工具都遵循 OpenAI Function Calling 规范:

```
{
  "name": "Bash",
  "description": "Executes a given bash command...",
  "input_schema": {
    "type": "object",
    "properties": {
      "command": {"type": "string", "description": "The command to execute"},
      "timeout": {"type": "number", "description": "Optional timeout in milliseconds"},
      "description": {"type": "string", "description": "Clear, concise description..."}
    },
    "required": ["command"],
    "additionalProperties": false
  }
}
```

关键设计原则:

**1\. Description 即 Prompt**

工具的 `description` 字段其实是给模型看的文档。比如 Bash 工具的描述长达 300+ 行,包含:

*   使用场景定义
*   参数说明
*   使用禁忌
*   最佳实践
*   错误案例

这些信息直接影响模型的工具使用行为。**工具定义本身就是一种提示工程**。

**2\. 严格的 Schema 验证**

每个工具都设置了 `"additionalProperties": false"`,拒绝模型传入未定义的参数。这是一种**接口防御**,避免模型”创造性”地使用工具。

**3\. 可选参数的默认值策略**

以 Grep 工具为例:

```
{
  "name": "Grep",
  "properties": {
    "pattern": {"type": "string", "description": "The regular expression pattern..."},
    "output_mode": {
      "type": "string",
      "enum": ["content", "files_with_matches", "count"],
      "description": "Output mode... Defaults to 'files_with_matches'."
    },
    "head_limit": {
      "type": "number",
      "description": "Limit output to first N lines... Defaults based on 'cap' experiment value: 0 (unlimited), 20, or 100."
    }
  },
  "required": ["pattern"]
}
```

只有 `pattern` 是必需的,其他参数都有智能默认值。这降低了模型的使用门槛,同时保留了高级控制能力。

### [3.2 核心工具解析](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#32-%E6%A0%B8%E5%BF%83%E5%B7%A5%E5%85%B7%E8%A7%A3%E6%9E%90)

**Task - Agent 套 Agent**

```
{
  "name": "Task",
  "description": "Launch a new agent to handle complex, multi-step tasks autonomously...",
  "properties": {
    "subagent_type": {
      "type": "string",
      "description": "The type of specialized agent to use for this task"
    },
    "prompt": {"type": "string"},
    "model": {
      "type": "string",
      "enum": ["sonnet", "opus", "haiku"],
      "description": "Optional model to use. Prefer haiku for quick tasks..."
    }
  }
}
```

这是 Claude Code 的**多层 Agent 架构**关键。主 Agent 可以启动子 Agent 处理特定任务,每个子 Agent 可以:

*   使用不同模型 (降低成本)
*   独立的上下文 (隔离复杂度)
*   失败不影响主流程 (容错)

描述中明确说 “Prefer haiku for quick tasks”,这是在提示模型**成本意识**。

**TodoWrite - 自我管理的接口**

```
{
  "name": "TodoWrite",
  "description": "Use this tool to create and manage a structured task list...",
  "properties": {
    "todos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "content": {"type": "string", "minLength": 1},
          "status": {
            "type": "string",
            "enum": ["pending", "in_progress", "completed"]
          },
          "activeForm": {"type": "string", "minLength": 1}
        },
        "required": ["content", "status", "activeForm"]
      }
    }
  }
}
```

注意 `activeForm` 字段 —— 要求提供”进行时”的表述 (如 “Running tests”)。这让 UI 可以显示更友好的进度提示,同时强制模型用**动词而非名词**描述任务。

**Read - 增量加载设计**

```
{
  "name": "Read",
  "properties": {
    "file_path": {"type": "string"},
    "offset": {
      "type": "number",
      "description": "The line number to start reading from. Only provide if the file is too large..."
    },
    "limit": {
      "type": "number",
      "description": "The number of lines to read. Only provide if the file is too large..."
    }
  }
}
```

支持**分块读取**大文件。模型可以先读前 100 行,如果需要再读接下来的部分。避免一次性加载巨型文件炸掉上下文窗口。

### [3.3 MCP 工具集成:扩展性的体现](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#33-mcp-%E5%B7%A5%E5%85%B7%E9%9B%86%E6%88%90%E6%89%A9%E5%B1%95%E6%80%A7%E7%9A%84%E4%BD%93%E7%8E%B0)

`tools.json` 最后包含了 MCP (Model Context Protocol) 工具:

```
{
  "name": "mcp__fetch__fetch",
  "description": "Fetches a URL from the internet and optionally extracts its contents as markdown..."
},
{
  "name": "mcp__ide__getDiagnostics",
  "description": "Get language diagnostics from VS Code"
},
{
  "name": "mcp__ide__executeCode",
  "description": "Execute python code in the Jupyter kernel..."
}
```

这些以 `mcp__` 前缀的工具来自**外部 MCP 服务器**。Claude Code 本身只提供核心工具,复杂能力通过 MCP 协议接入。

这是一种**插件化架构**:

*   核心保持简洁
*   能力可无限扩展
*   第三方可贡献工具

* * *

## [第四部分:实际请求 - 理论到实践的最后一环](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#%E7%AC%AC%E5%9B%9B%E9%83%A8%E5%88%86%E5%AE%9E%E9%99%85%E8%AF%B7%E6%B1%82---%E7%90%86%E8%AE%BA%E5%88%B0%E5%AE%9E%E8%B7%B5%E7%9A%84%E6%9C%80%E5%90%8E%E4%B8%80%E7%8E%AF)

### [4.1 请求结构剖析](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#41-%E8%AF%B7%E6%B1%82%E7%BB%93%E6%9E%84%E5%89%96%E6%9E%90)

打开 `request` 文件,看到一个完整的 API 请求:

```
{
  "model": "claude-sonnet-4-5-20250929",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "<system-reminder>\n这是系统提示...\n</system-reminder>"
        },
        {
          "type": "text",
          "text": "基于 docs/refactor-simple-agent-design.md 开发文档进行 code review"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {"type": "text", "text": "我来对基于这两份设计文档的代码实现进行全面审查。"},
        {
          "type": "tool_use",
          "id": "toolu_017EWM5QoGex4Y8GPLyGZkc1",
          "name": "Read",
          "input": {"file_path": "/Users/.../refactor-simple-agent-design.md"}
        },
        {
          "type": "tool_use",
          "id": "toolu_01HWzrYBbM3EiPwUtxFGraeA",
          "name": "Read",
          "input": {"file_path": "/Users/.../simple_agent_optimization.md"},
          "cache_control": {"type": "ephemeral"}
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "tool_use_id": "toolu_01HWzrYBbM3EiPwUtxFGraeA",
          "type": "tool_result",
          "content": "     1→# Simple Agent 优化开发文档\n...",
          "cache_control": {"type": "ephemeral"}
        }
      ]
    }
  ],
  "system": [
    {
      "type": "text",
      "text": "You are Claude Code, Anthropic's official CLI for Claude.",
      "cache_control": {"type": "ephemeral"}
    },
    {
      "type": "text",
      "text": "完整的系统提示词...",
      "cache_control": {"type": "ephemeral"}
    }
  ],
  "tools": [...],
  "max_tokens": 32000,
  "stream": true
}
```

几个关键发现:

### [4.2 Prompt Caching 策略](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#42-prompt-caching-%E7%AD%96%E7%95%A5)

注意到多处 `"cache_control": {"type": "ephemeral"}"`。这是 Anthropic 的 **Prompt Caching** 特性:

*   **System 消息缓存** - 系统提示词几乎不变,每次请求复用缓存
*   **Tool 定义缓存** - 工具 Schema 很大但固定,缓存后省 90% token
*   **长文档缓存** - 读取的文件内容标记为可缓存

这大幅降低了成本。据 Anthropic 披露,Prompt Caching 可节省 **90% 的输入 token 费用**。

### [4.3 上下文注入的实际形态](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#43-%E4%B8%8A%E4%B8%8B%E6%96%87%E6%B3%A8%E5%85%A5%E7%9A%84%E5%AE%9E%E9%99%85%E5%BD%A2%E6%80%81)

User 消息的第一个 content block 是:

```
<system-reminder>
This is a reminder that your todo list is currently empty.
DO NOT mention this to the user explicitly...
</system-reminder>
```

这就是前面代码中 `ensureContextBlock` 函数注入的内容。它被包装在 `<system-reminder>` 标签里,并明确告诉模型**不要提及这个提醒**。

这是一种**隐形引导** —— 影响模型行为但对用户透明。

### [4.4 多模态内容的组织](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#44-%E5%A4%9A%E6%A8%A1%E6%80%81%E5%86%85%E5%AE%B9%E7%9A%84%E7%BB%84%E7%BB%87)

User 消息可以包含多个 content blocks:

```
{
  "role": "user",
  "content": [
    {"type": "text", "text": "<system-reminder>...</system-reminder>"},
    {"type": "text", "text": "IDE 打开文件的提醒"},
    {"type": "text", "text": "CLAUDE.md 的内容"},
    {"type": "text", "text": "用户的实际输入"}
  ]
}
```

这种结构让系统可以在用户输入前后**插入任意数量的上下文**,且保持清晰的分隔。

### [4.5 工具调用的完整流程](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#45-%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E7%9A%84%E5%AE%8C%E6%95%B4%E6%B5%81%E7%A8%8B)

从请求中可以看到一个完整的工具使用循环:

**第 1 轮 (Assistant 主动)**:

```
{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "我来审查代码"},
    {"type": "tool_use", "name": "Read", "input": {...}},
    {"type": "tool_use", "name": "Read", "input": {...}}
  ]
}
```

**第 2 轮 (User 返回结果)**:

```
{
  "role": "user",
  "content": [
    {"type": "tool_result", "tool_use_id": "...", "content": "文件内容..."}
  ]
}
```

**第 3 轮 (Assistant 继续)**:

```
{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "根据文档分析..."}
  ]
}
```

这是标准的 **OpenAI Function Calling** 协议,但 Anthropic 的实现更灵活:**允许在一轮中同时调用多个工具**。

* * *

## [第五部分：扩展机制全景 - MCP、Skills 与整个生态](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#%E7%AC%AC%E4%BA%94%E9%83%A8%E5%88%86%E6%89%A9%E5%B1%95%E6%9C%BA%E5%88%B6%E5%85%A8%E6%99%AF---mcpskills-%E4%B8%8E%E6%95%B4%E4%B8%AA%E7%94%9F%E6%80%81)

这部分最容易混淆。让我从**API 请求的实际数据**入手,揭示它们的本质区别。

### [5.1 从 API 请求看 MCP 的真实成本](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#51-%E4%BB%8E-api-%E8%AF%B7%E6%B1%82%E7%9C%8B-mcp-%E7%9A%84%E7%9C%9F%E5%AE%9E%E6%88%90%E6%9C%AC)

还记得第二部分的 `request` 文件吗?让我们看看 MCP 工具在 `tools` 数组中的真实样子:

```
{
  "model": "claude-sonnet-4-5-20250929",
  "tools": [
    // 内置工具
    {
      "name": "Bash",
      "description": "Execute a shell command...",
      "input_schema": {...}
    },

    // MCP 工具 - 每个都要完整传递!
    {
      "name": "mcp__fetch__fetch",
      "description": "Fetches a URL from the internet and optionally extracts its contents as markdown...",
      "input_schema": {
        "type": "object",
        "properties": {
          "url": {"type": "string", "format": "uri", "minLength": 1},
          "raw": {"type": "boolean", "default": false},
          "max_length": {"type": "integer", "default": 5000}
        },
        "required": ["url"]
      }
    },
    {
      "name": "mcp__ide__getDiagnostics",
      "description": "Get language diagnostics from VS Code",
      "input_schema": {
        "type": "object",
        "properties": {
          "uri": {"type": "string", "description": "Optional file URI..."}
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

### [5.2 Skills 的懒加载机制](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#52-skills-%E7%9A%84%E6%87%92%E5%8A%A0%E8%BD%BD%E6%9C%BA%E5%88%B6)

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

### [5.3 MCP vs Skills - 从接口到场景的完整对比](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#53-mcp-vs-skills---%E4%BB%8E%E6%8E%A5%E5%8F%A3%E5%88%B0%E5%9C%BA%E6%99%AF%E7%9A%84%E5%AE%8C%E6%95%B4%E5%AF%B9%E6%AF%94)

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

### [5.4 Claude Code 的完整扩展生态](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#54-claude-code-%E7%9A%84%E5%AE%8C%E6%95%B4%E6%89%A9%E5%B1%95%E7%94%9F%E6%80%81)

MCP 和 Skills 只是冰山一角。Claude Code 有 **5 种扩展机制**,每种都有自己的价值:

#### [1\. **Slash Command** - 快速指令](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#1-slash-command---%E5%BF%AB%E9%80%9F%E6%8C%87%E4%BB%A4)

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

#### [2\. **Hooks** - 事件钩子](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#2-hooks---%E4%BA%8B%E4%BB%B6%E9%92%A9%E5%AD%90)

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

#### [3\. **Subagent** - 子 Agent](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#3-subagent---%E5%AD%90-agent)

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

* * *

#### [4\. **MCP** - 外部工具集成](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#4-mcp---%E5%A4%96%E9%83%A8%E5%B7%A5%E5%85%B7%E9%9B%86%E6%88%90)

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

#### [5\. **Skills** - 知识模块](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#5-skills---%E7%9F%A5%E8%AF%86%E6%A8%A1%E5%9D%97)

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

### [5.5 组合使用的威力](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#55-%E7%BB%84%E5%90%88%E4%BD%BF%E7%94%A8%E7%9A%84%E5%A8%81%E5%8A%9B)

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

### [5.6 何时用什么?决策树](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#56-%E4%BD%95%E6%97%B6%E7%94%A8%E4%BB%80%E4%B9%88%E5%86%B3%E7%AD%96%E6%A0%91)

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

### [5.7 实战案例:完整的部署流程](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#57-%E5%AE%9E%E6%88%98%E6%A1%88%E4%BE%8B%E5%AE%8C%E6%95%B4%E7%9A%84%E9%83%A8%E7%BD%B2%E6%B5%81%E7%A8%8B)

**场景:代码审查后自动部署到 K8s**

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

## [第六部分:设计哲学的终极解读](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#%E7%AC%AC%E5%85%AD%E9%83%A8%E5%88%86%E8%AE%BE%E8%AE%A1%E5%93%B2%E5%AD%A6%E7%9A%84%E7%BB%88%E6%9E%81%E8%A7%A3%E8%AF%BB)

### [6.1 Model-First 架构的代码证据](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#61-model-first-%E6%9E%B6%E6%9E%84%E7%9A%84%E4%BB%A3%E7%A0%81%E8%AF%81%E6%8D%AE)

从代码到请求,所有细节都在验证一个核心思想:**让模型承担 80% 的智能**。

**证据 1:极简的控制流**

*   While loop 主循环
*   没有状态机,没有流程图
*   所有决策都在模型内部

**证据 2:丰富的提示工程**

*   系统提示词 200+ 行
*   工具描述 3000+ 行
*   CLAUDE.md 自定义配置

智能不在代码逻辑里,在提示词里。

**证据 3:工具的原子性**

*   每个工具都是无状态函数
*   输入 → 输出,无副作用
*   组合由模型决定

传统框架用代码组合工具,Claude Code 让模型组合工具。

### [6.2 Unix 哲学的现代演绎](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#62-unix-%E5%93%B2%E5%AD%A6%E7%9A%84%E7%8E%B0%E4%BB%A3%E6%BC%94%E7%BB%8E)

Ken Thompson 说:“When in doubt, use brute force.”

Claude Code 的设计完美诠释了这句话:

*   **Grep 而非向量检索** - 暴力搜索,但可靠
*   **循环而非状态机** - 简单粗暴,但易懂
*   **文本而非结构化数据** - 朴素,但通用

在 LLM 时代,这些”暴力”方法反而是**最优雅的解决方案**。

### [6.3 边界设计:给自由,也给约束](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#63-%E8%BE%B9%E7%95%8C%E8%AE%BE%E8%AE%A1%E7%BB%99%E8%87%AA%E7%94%B1%E4%B9%9F%E7%BB%99%E7%BA%A6%E6%9D%9F)

Claude Code 的巧妙在于**平衡自主性与安全性**:

**自由的地方**:

*   任务拆解 - 模型自己决定
*   工具组合 - 没有固定流程
*   错误恢复 - 自主重试

**约束的地方**:

*   Git 操作 - 明确禁止危险命令
*   文件系统 - 路径校验防止逃逸
*   最大迭代 - 避免无限循环

这种设计类似**沙盒**:给你一个安全的游乐场,里面随便玩。

### [6.4 数据飞轮:产品即训练](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#64-%E6%95%B0%E6%8D%AE%E9%A3%9E%E8%BD%AE%E4%BA%A7%E5%93%81%E5%8D%B3%E8%AE%AD%E7%BB%83)

最后一个洞察:**Claude Code 本身是数据收集工具**。

每一次用户对话都在训练下一代模型:

*   工具使用模式
*   错误恢复策略
*   任务拆解逻辑

Anthropic 用 $200/月 的价格,换来了:**成千上万高级开发者的行为标注数据**。

这比雇标注员便宜 100 倍,且质量更高。

* * *

## [简单的力量](https://stellarlink.co/articles/%E6%8F%AD%E7%A7%98claude-code-2-0-%E4%BB%8E%E4%BB%A3%E7%A0%81%E5%88%B0%E5%93%B2%E5%AD%A6%E7%9A%84%E5%AE%8C%E6%95%B4%E8%A7%A3%E6%9E%84#%E7%AE%80%E5%8D%95%E7%9A%84%E5%8A%9B%E9%87%8F)

当我们把所有材料串起来,会发现 Claude Code 的设计遵循一个惊人的一致性:

**代码极简** → 600 行就可实现完整 Agent **提示详尽** → 3000+ 行引导模型行为 **工具原子** → Unix 哲学的函数组合 **架构开放** → MCP 协议无限扩展

这不是传统意义上的”工程设计”,更像是一种**人机协作的艺术**:

*   人类设计边界和规则
*   模型在其中自由探索
*   工具提供必要支持

最终的产品,既强大又可控,既灵活又可靠。

**在 2025 年,也许最好的 Agent 架构,就是让模型成为 Agent,而不是把 Agent 塞进框架。**

* * *

**参考资料**

1.  [mini-claude-code-go](https://github.com/cexll/mini-claude-code-go) - Go 语言实现
2.  [Anthropic Prompt Caching](https://docs.claude.com/en/docs/build-with-claude/prompt-caching) - 缓存机制文档
3.  [MCP Protocol](https://modelcontextprotocol.io/) - 工具扩展协议
4.  [揭开 Claude Code 的面纱](https://mp.weixin.qq.com/s/fxOkLVMB391I_Ed6n-9yww) - 设计哲学解析

* * *

如果你对 Agent 工程感兴趣,建议:

1.  克隆 `mini-claude-code-go` 仓库
2.  读懂核心循环的 100 行代码
3.  自己实现一个最小可用版本

**理论千行不如实践一次。**

Talk is cheap. Show me the code. - Linus Torvalds
