# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are collaborators, readers, and potential venture partners. They arrive through search, shared writing, social links, GitHub, or direct referrals to understand Chinmay Arora’s work, find an idea or capability relevant to them, evaluate the underlying evidence, and decide whether to start a conversation.

Recruiters, hiring managers, and technical or product leaders evaluating Chinmay for data science, AI engineering, analytics, responsible AI, or AI product work are an important secondary audience.

## Product Purpose

The product exists to grow a relevant audience and generate qualified contacts while helping visitors understand where Chinmay fits across AI engineering, data science, analytics, governance, product building, research, and venture exploration.

Visitors should be able to move from an initial topic, role, or idea to concrete projects and writing that let them verify the work for themselves. Success means more relevant people reaching the site, exploring enough evidence to understand Chinmay’s capabilities and interests, and contacting him about collaboration, readership, ventures, or employment.

## Positioning

This is a connected public body of work rather than a conventional résumé site or isolated technical blog. The portfolio, project reports, interactive demonstrations, venture lab, and Brain Vomit publication let visitors evaluate the same builder through working systems, analysis, ideas, and long-form reasoning.

The differentiating mechanism is the relationship between those artifacts: a visitor can move from a claim or area of interest to a build, report, article, source trail, or live interaction instead of relying on a single self-description.

## Operating Context

Visitors commonly enter through the portfolio homepage, a specific project or article, GitHub, search results, or a shared link. They can browse by role, capability, topic, project, report, experience, or venture idea; use the portfolio assistant and interactive explorations; open the résumé; join the future newsletter; participate in public article discussions; or contact Chinmay directly.

The owner publishes portfolio records from structured JSON and blog posts from Markdown. The same repository produces the main portfolio and the standalone Brain Vomit publication. ContentOS can consume the public post catalog and per-article evidence packets for downstream editorial workflows.

## Capabilities and Constraints

- The existing implementation is a static Jekyll site using shared HTML, CSS, JavaScript, JSON data, and Markdown posts.
- The main portfolio is served at `app.chinmayarora.com`; Brain Vomit is served at `brainvomit.blog` from a separate Cloudflare Pages build of the shared repository.
- Git is the publication source of truth. Production builds must continue to validate internal links, canonical URLs, sitemap and feed output, and the standalone blog boundary.
- The portfolio contains projects, experience and education, capabilities, coursework, reports, résumé access, portfolio intelligence, a product and venture lab, a chatbot, globe-based exploration, and 3D exploration.
- Brain Vomit contains research studies, evidence audits, engineering case studies, explorations, essays, topic indexing, public comments, sharing, a future-newsletter form, a privacy policy, and a public ContentOS catalog at `/api/posts.json` with per-post evidence packets.
- The public content must not expose private repositories, credentials, personal financial data, private product implementation details, or unpublished user information.
- Explicit maturity labels, evidence-boundary language, AI-assistance disclosure, a hiring-first content hierarchy, and strict anti-fabrication language are preferred editorial practices, not immutable product constraints. Future work must not treat them as locked requirements without reconfirmation.

## Brand Commitments

The primary identity is Chinmay Arora. Brain Vomit is the named publication and remains connected to the portfolio through authorship, projects, and shared subject matter.

The established voice is technically literate, candid, curious, ambitious, evidence-aware, and willing to be playful. It can acknowledge unfinished work, uncertainty, experimentation, and AI assistance without turning those acknowledgements into instructional copy for visitors.

Existing public names and contact points include:

- Chinmay Arora
- Brain Vomit
- Product and Venture Lab
- `contact@brainvomit.blog`

## Evidence on Hand

- Structured project records with roles, descriptions, stacks, results, maturity, evidence, and privacy notes in `data/projects.json`.
- Experience and education records in `data/experience.json`.
- Capability records in `data/skills.json`.
- Project reports in `data/project_reports.json` and coursework evidence in `data/coursework_projects.json`.
- Role-specific résumé PDFs and a master résumé under `assets/`, indexed by `data/resumes.json`.
- Thirty-seven published articles under `_posts/`, including research studies, engineering case studies, technical reports, essays, and project explorations.
- Article figures, charts, diagrams, and social or Open Graph assets under `assets/blog/` and `assets/images/`.
- Aegis context and governance evidence in `data/aegis_rag_context.json` and related project/report records.
- The ContentOS publishing contract and operational notes in `docs/CONTENTOS_BLOG_PIPELINE.md`.
- Public privacy disclosures at `blog/privacy.md`.

Future work must distinguish supplied evidence from illustrative, incomplete, private, or not-yet-established material. It must not invent testimonials, customers, commercial adoption, performance results, or third-party validation that is not present in the repository or supplied by the user.

## Product Principles

1. **Grow relationships, not empty traffic.** Discoverability should lead relevant people toward useful work and a credible reason to make contact.
2. **Let visitors choose their own entry point.** Roles, topics, projects, writing, and venture ideas should provide multiple understandable paths into the same body of work.
3. **Keep evidence close to the claim.** Visitors should be able to move from positioning to the artifact that helps them evaluate it.
4. **Make the portfolio and publication compound each other.** Projects create writing material; writing gives projects context; both should strengthen the same public identity.
5. **Prefer editorial judgment over rigid taxonomy.** Labels, disclosures, and hierarchy should improve comprehension and trust without becoming permanent ceremony that prevents the product from evolving.

## Accessibility & Inclusion

No product-specific conformance standard has been confirmed. The current implementation supports responsive web layouts, keyboard focus states, reduced-motion behavior, readable light and dark themes, semantic article structure, and privacy disclosures. Future changes should preserve equivalent access unless the user explicitly changes that direction.

## Open Decisions

- The exact analytics used to define relevant traffic, meaningful reading, and a qualified contact have not been fixed.
- The long-term boundary between `app.chinmayarora.com` and `brainvomit.blog` is established operationally but has not been declared immutable.
- The editorial preferences around maturity labeling, AI disclosure, hiring priority, and evidence language may be tightened, relaxed, or made surface-specific in later work.
