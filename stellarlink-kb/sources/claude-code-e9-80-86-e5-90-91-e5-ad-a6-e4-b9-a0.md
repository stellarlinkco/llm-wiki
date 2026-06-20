---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/claude-code%E9%80%86%E5%90%91%E5%AD%A6%E4%B9%A0"
title: Claude Code逆向学习
description: Claude Code逆向学习
resource: "https://stellarlink.co/articles/claude-code%E9%80%86%E5%90%91%E5%AD%A6%E4%B9%A0"
tags: []
timestamp: "2026-06-20T06:45:38.522Z"
source_path: "https://stellarlink.co/articles/claude-code%E9%80%86%E5%90%91%E5%AD%A6%E4%B9%A0"
source_id: 33913680cc0d52cd6215f2cfdcd960b6162994cbd82ce62d39143df71fb4241d
content_hash: a1d8b7882d75c43c70fff47d3a2c89cbdbd7b3dcee67577d699259f2341defbc
---

八段式上下文压缩系统

```
Your task is to create a detailed summary of the conversation so far, 
paying close attention to the user's explicit requests and your previous actions.
This summary should be thorough in capturing technical details, code patterns, 
and architectural decisions that would be essential for continuing development 
work without losing context.

Before providing your final summary, wrap your analysis in <analysis> tags to 
organize your thoughts and ensure you've covered all necessary points.

Your summary should include the following sections:

1. Primary Request and Intent: Capture all of the user's explicit requests and intents in detail
2. Key Technical Concepts: List all important technical concepts, technologies, and frameworks discussed.
3. Files and Code Sections: Enumerate specific files and code sections examined, modified, or created. Pay special attention to the most recent messages and include full code snippets where applicable.
4. Errors and fixes: List all errors that you ran into, and how you fixed them. Pay special attention to specific user feedback.
5. Problem Solving: Document problems solved and any ongoing troubleshooting efforts.
6. All user messages: List ALL user messages that are not tool results. These are critical for understanding the users' feedback and changing intent.
7. Pending Tasks: Outline any pending tasks that you have explicitly been asked to work on.
8. Current Work: Describe in detail precisely what was being worked on immediately before this summary request.
9. Optional Next Step: List the next step that you will take that is related to the most recent work you were doing.`
```

这个 prompt 的精妙之处在于它的强制性结构和对细节的强调：

*   `Your task is to...`: 开门见山，直接定义了模型的任务——创建一个详细的摘要。
*   `paying close attention to...`: 强调了两个最重要的信息源：用户的明确请求和AI之前的行为。
*   `thorough in capturing technical details...`: 明确了摘要的质量标准，它不是一个普通的对话总结，而是一个技术档案，目标是“不丢失上下文地继续开发工作”。
*   `<analysis>` 标签: 这是一个巧妙的设计，它让模型在给出正式摘要前，先进行一次自我梳理和思考，这有助于提高最终输出的质量和结构性。
*   八个强制性部分:
    *   使用 **…** Markdown加粗和数字列表，以非常清晰、不容忽视的方式规定了摘要必须包含的八个部分。
    *   每个部分的标题都经过精心设计，直指软件开发过程中的核心信息点（意图、概念、代码、错误、思路、反馈、待办、现状）。
    *   每个部分的描述都给出了具体的要求，例如 Files and Code Sections 部分要求“特别关注最近的消息并包含完整的代码片段”，All user messages 部分强调“这些对于理解用户的反馈和意图变化至关重要”。

Prompt服从性标准

```
Executes a given bash command in a persistent shell session 
with optional timeout, ensuring proper handling and security measures.

Before executing the command, please follow these steps:

1. Directory Verification:
   - If the command will create new directories or files, first use the ${I} 
     tool to verify the parent directory exists and is the correct location
   - For example, before running "mkdir foo/bar", first use ${I} to check 
     that "foo" exists and is the intended parent directory

2. Command Execution:
   - Always quote file paths that contain spaces with double quotes 
     (e.g., cd "path with spaces/file.txt")
   - Examples of proper quoting:
     - cd "/Users/name/My Documents" (correct)
     - cd /Users/name/My Documents (incorrect - will fail)
     - python "/path/with spaces/script.py" (correct)
     - python /path/with spaces/script.py (incorrect - will fail)

Usage notes:
  - The command argument is required.
  - You can specify an optional timeout in milliseconds (up to ${CJ1()}ms / ${CJ1()/60000} minutes). 
    If not specified, commands will timeout after ${Em()}ms (${Em()/60000} minutes).
  - It is very helpful if you write a clear, concise description of what this command does in 5-10 words.
  - If the output exceeds ${KJ1()} characters, output will be truncated before being returned to you.
  - VERY IMPORTANT: You MUST avoid using search commands like \`find\` and \`grep\`. 
    Instead use ${XJ1}, ${FJ1}, or ${cX} to search. You MUST avoid read tools like \`cat\`, 
    \`head\`, \`tail\`, and \`ls\`, and use ${TD} and ${VJ1} to read files.
  - If you _still_ need to run \`grep\`, STOP. ALWAYS USE ripgrep at \`rg\` first, 
    which all Claude Code users have pre-installed.
  - When issuing multiple commands, use the ';' or '&&' operator to separate them. 
    DO NOT use newlines (newlines are ok in quoted strings).
  - Try to maintain your current working directory throughout the session by using 
    absolute paths and avoiding usage of \`cd\`. You may use \`cd\` if the User explicitly requests it.`
```

从本质上讲，这个系统提示词是为AI量身打造的一本详尽的“驾驶员手册”。它并非简单地将车钥匙（即Shell的控制权）交给AI，而是为其设定了严 格的交通规则、安全程序和最佳实践。

*   约束行为: 它将AI的行动严格限制在一个更安全的操作子集内。
    
*   引导方法: 它引导AI采用更可靠、更高效的工作方法。
    

*   强制透明: 它迫使AI必须清晰地解释其每一个行为意图。

这种设计将AI从一个简单的命令执行者，转变为开发过程中一个负责任且值得信赖的合作伙伴。它是一个完美的典范，展示了精心雕琢的自然语言如何能够成为先进AI系统中一个强大而有效的安全与控制层。
