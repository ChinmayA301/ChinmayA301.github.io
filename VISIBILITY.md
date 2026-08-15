# Visibility Checklist

This file tracks visibility work that cannot be completed purely from repo code.

## Completed in Code

- Dynamic `sitemap.xml` generated from Jekyll pages and posts.
- `robots.txt` allows public content, blocks `/upload/` and `/aegis-backend/`, and points to the sitemap.
- Homepage Person schema expanded with `sameAs`, `knowsAbout`, occupation, and University of Minnesota affiliation.
- BlogPosting schema now includes stronger author identity, keywords, article section, and explicit study-or-concept genre metadata.
- Blog index separates evidence-bearing research studies from proposals, frameworks, and product theses.
- Evidence-bearing posts use `content_type: research_study`; proposal-style writing uses `content_type: concept_note`.
- Repository README now links canonical pages, `llms.txt`, and sitemap.

## Manual Indexing Tasks

1. Add `https://app.chinmayarora.com/` as a URL-prefix property in Google Search Console.
2. Submit `https://app.chinmayarora.com/sitemap.xml`.
3. Use URL Inspection and request indexing for:
   - `https://app.chinmayarora.com/`
   - `https://app.chinmayarora.com/blog/`
   - `https://app.chinmayarora.com/projects/`
   - `https://app.chinmayarora.com/ideas/`
   - `https://app.chinmayarora.com/ideas/aegis-ai-strategy/`
   - `https://app.chinmayarora.com/blog/ai-governance-privacy-trust-layer/`
   - `https://app.chinmayarora.com/blog/data-science-career-audit/`
4. Add the same site and sitemap in Bing Webmaster Tools.
5. Add the portfolio URL to LinkedIn contact info and GitHub profile README.

## Domain Decision

Current canonical domain is `app.chinmayarora.com`.

Recommended future migration:

- Make `chinmayarora.com` or `www.chinmayarora.com` the canonical portfolio domain.
- Set a 301 redirect from `app.chinmayarora.com` to the chosen canonical domain.
- Update `_config.yml`, `CNAME`, homepage canonicals, sitemap, robots, and external profile links in one release.
- Re-submit the new sitemap in Google Search Console and Bing Webmaster Tools.

Do not switch canonicals in repo until DNS, hosting, and redirect behavior are ready.
