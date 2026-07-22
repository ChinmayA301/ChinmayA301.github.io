# CAI Portfolio Architect Worker

Cloudflare Python Worker behind `rag.chinmayarora.com`. It researches a visitor's company, identifies likely priority pain points, retrieves the strongest matching evidence from Chinmay Arora's complete portfolio, and generates a concise consultation.

Related Aegis research: [AI Governance and Privacy: Building the Trust Layer for High-Risk AI Adoption](https://app.chinmayarora.com/blog/ai-governance-privacy-trust-layer/).

## Evidence corpus

The ingestion workflow indexes:

- structured portfolio projects and project reports;
- professional experience and quantified outcomes;
- skill groups linked to project evidence;
- coursework projects;
- research studies and project explorations from the blog;
- portfolio, experience, coursework, projects, reports, ideas, and blog pages;
- product and venture lab material.

The production ingestion job intentionally excludes the legacy Aegis-only manual context file. It uses source quotas and per-title chunk limits so one long post or project family cannot dominate the index.

## Retrieval behavior

The Worker:

1. searches for current company priorities across strategy, product, customer, operations, data, AI, efficiency, growth, and risk;
2. retrieves a larger candidate set from Pinecone;
3. reranks for company-language overlap, evidence strength, and source quality;
4. limits repeated source types and duplicate project families;
5. asks Gemini to connect the top one or two company pains to the strongest transferable work.

If embedding retrieval is rate-limited, the Worker falls back to a diversified set of projects and experience rather than Aegis-only context.

## Local development

```bash
uv sync
npx wrangler dev
```

## Deployment

```bash
npm run deploy
```

The GitHub Actions ingestion workflow refreshes the Pinecone namespace after relevant portfolio content changes. It requires the Gemini and Pinecone repository secrets listed in `.env.example`.
