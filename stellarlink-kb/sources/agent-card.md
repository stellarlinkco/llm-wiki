---
type: Source Document
parser: json
source_kind: url
content_type: application/json
url: "https://stellarlink.co/.well-known/agent-card.json"
title: "https://stellarlink.co/.well-known/agent-card.json"
description: json
resource: "https://stellarlink.co/.well-known/agent-card.json"
tags: []
timestamp: "2026-06-20T06:46:23.541Z"
source_path: "https://stellarlink.co/.well-known/agent-card.json"
source_id: e9f2a52f6d46cf027721e2b7831e63cbf15acc112bb9439cd1dac5d255d8dd7a
content_hash: 5a9432d67c54ba688983e1e9c52384d34877769e6b1aeba50ef3c930a8d7b2d2
---

```json
{
  "name": "stellarlink-site-agent",
  "version": "1.0.0",
  "description": "Agent discovery card for StellarLink public website content, products, articles and contact facts.",
  "url": "https://stellarlink.co/",
  "provider": {
    "organization": "重庆星纬智联科技有限公司",
    "url": "https://stellarlink.co/"
  },
  "documentationUrl": "https://stellarlink.co/llm.txt",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false,
    "stateTransitionHistory": false
  },
  "defaultInputModes": [
    "application/json"
  ],
  "defaultOutputModes": [
    "application/json"
  ],
  "skills": [
    {
      "id": "list-products",
      "name": "List Products",
      "description": "Returns the main product lineup, product URLs and pricing URLs."
    },
    {
      "id": "latest-articles",
      "name": "Latest Articles",
      "description": "Returns recent article metadata from the official article index."
    },
    {
      "id": "company-facts",
      "name": "Company Facts",
      "description": "Returns company identity, contact path and machine-readable discovery resources."
    }
  ],
  "supportedInterfaces": [
    {
      "url": "https://stellarlink.co/",
      "transport": "web"
    }
  ]
}
```
