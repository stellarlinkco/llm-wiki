---
type: Source Document
parser: text
source_kind: url
content_type: text/plain
url: "https://stellarlink.co/robots.txt"
title: "https://stellarlink.co/robots.txt"
description: "User-agent: GPTBot"
resource: "https://stellarlink.co/robots.txt"
tags: []
timestamp: "2026-06-20T06:46:20.393Z"
source_path: "https://stellarlink.co/robots.txt"
source_id: a6d35952554071e004046b8e43a723accf000a61aa29b53a0fb073c6013a7c72
content_hash: f474c807e1e679e89937cb6630956814f225c8d85d301253fcc5615d9b5a8726
---

```text
# ===========================================
# AI/LLM Crawlers - Explicitly Allow
# Last Updated: 2025-12-01
# ===========================================

# OpenAI Crawlers
User-agent: GPTBot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: OAI-SearchBot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: ChatGPT-User
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Anthropic Crawlers
User-agent: ClaudeBot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: Claude-SearchBot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: anthropic-ai
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Perplexity
User-agent: PerplexityBot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Common Crawl (训练数据源)
User-agent: CCBot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Google Extended (Gemini 训练)
User-agent: Google-Extended
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Apple Intelligence
User-agent: Applebot-Extended
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Cohere
User-agent: cohere-ai
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Amazon
User-agent: Amazonbot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Meta AI
User-agent: FacebookBot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: Meta-ExternalAgent
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# Emerging AI Crawlers
User-agent: DeepSeek-Bot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: ByteSpider
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: Tongyi-Spider
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: Baiduspider-AI
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: Mistral-Bot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

User-agent: Grok-Bot
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# ===========================================
# Traditional Search Engines
# ===========================================

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Chinese Search Engines
User-agent: Baiduspider
Allow: /

User-agent: Sosospider
Allow: /

User-agent: Sogou
Allow: /

User-agent: 360Spider
Allow: /

User-agent: YisouSpider
Allow: /

User-agent: YodaoBot
Allow: /

# Default
User-agent: *
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

# ===========================================
# Sitemap
# ===========================================
Sitemap: https://stellarlink.co/sitemap.xml

# AI Training Data Feeds
```
