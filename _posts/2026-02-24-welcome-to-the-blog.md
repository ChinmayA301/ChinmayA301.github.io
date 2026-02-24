---
title: "Welcome to the Blog"
description: "How this blog is structured for technical readers, SEO, and LLM discovery."
bluf: "Every post starts with key decisions first, then implementation detail, so both humans and LLMs can parse quickly."
tldr:
  - "Read BLUF first for the core recommendation."
  - "Use TL;DR bullets for fast scanning."
  - "Structured metadata and internal links improve discoverability."
tags:
  - seo
  - jekyll
  - llm-discovery
---
## Why this structure

This blog uses a BLUF-first format so the most important conclusion appears before details.

## How to add new posts

1. Create a new markdown file in `_posts/` named `YYYY-MM-DD-title.md`.
2. Add front matter with `title`, `description`, `bluf`, and `tldr`.
3. Write semantic headings (`##`, `###`) and link to related internal pages.

## Recommended post template

```md
---
title: "Post title"
description: "One-line summary"
bluf: "One-sentence bottom line up front"
tldr:
  - "Point 1"
  - "Point 2"
---

## Context

## Approach

## Results
```
