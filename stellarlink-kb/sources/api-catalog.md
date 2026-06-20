---
type: Source Document
parser: json
source_kind: url
content_type: application/linkset+json
url: "https://stellarlink.co/.well-known/api-catalog"
title: "https://stellarlink.co/.well-known/api-catalog"
description: json
resource: "https://stellarlink.co/.well-known/api-catalog"
tags: []
timestamp: "2026-06-20T06:46:22.689Z"
source_path: "https://stellarlink.co/.well-known/api-catalog"
source_id: de8759ffc19f6685d7d58611015cb3cf8f6a8cd3e6b88ea5abd31183a1cbe8f4
content_hash: 3b63e1095ca41d87afa57fe3ed525bcc3bc953627e0fa75aea492c282dc03b7c
---

```json
{
  "linkset": [
    {
      "anchor": "https://stellarlink.co/",
      "item": [
        {
          "href": "https://stellarlink.co/.well-known/mcp/server-card.json",
          "rel": "describedby",
          "type": "application/json",
          "title": "StellarLink MCP server card"
        },
        {
          "href": "https://stellarlink.co/.well-known/agent-card.json",
          "rel": "describedby",
          "type": "application/json",
          "title": "StellarLink A2A agent card"
        },
        {
          "href": "https://stellarlink.co/.well-known/agent-skills/index.json",
          "rel": "describedby",
          "type": "application/json",
          "title": "StellarLink agent skills index"
        },
        {
          "href": "https://stellarlink.co/index.md",
          "rel": "alternate",
          "type": "text/markdown",
          "title": "Homepage markdown representation"
        },
        {
          "href": "https://stellarlink.co/feed.json",
          "rel": "service-doc",
          "type": "application/feed+json",
          "title": "Official JSON feed"
        },
        {
          "href": "https://stellarlink.co/llm.txt",
          "rel": "service-doc",
          "type": "text/plain",
          "title": "LLM-facing site summary"
        }
      ]
    },
    {
      "anchor": "https://stellarlink.co/feed.json",
      "item": [
        {
          "href": "https://stellarlink.co/feed.json",
          "rel": "service-desc",
          "type": "application/feed+json",
          "title": "Article feed endpoint"
        },
        {
          "href": "https://stellarlink.co/articles",
          "rel": "service-doc",
          "type": "text/html",
          "title": "Articles archive"
        }
      ]
    },
    {
      "anchor": "https://stellarlink.co/jobs.json",
      "item": [
        {
          "href": "https://stellarlink.co/jobs.json",
          "rel": "service-desc",
          "type": "application/json",
          "title": "Jobs feed"
        },
        {
          "href": "https://stellarlink.co/jobs",
          "rel": "service-doc",
          "type": "text/html",
          "title": "Jobs page"
        }
      ]
    }
  ]
}
```
