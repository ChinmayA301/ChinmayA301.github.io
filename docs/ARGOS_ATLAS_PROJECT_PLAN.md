# Regional mobility disruption brief — proposed project

Recommendation: keep this separate from the transit snapshot dashboard. The dashboard answers where vehicles were observed and what schedule estimates were available. A disruption brief answers which published events affect a chosen corridor and what deserves investigation. This is a proposed backlog item, not completed work or a claim of operational impact.

Assumption: “Argos Atlas” means https://argosatlas.com/. Its current pricing page assigns API/MCP access to Agency and labels some export/embed functions as forthcoming. No free API, redistribution entitlement or account access has been verified. Do not make the MVP depend on that access.

## MVP and acceptance gates

1. **Source feasibility (1–2 work sessions, estimate):** choose one personally useful Twin Cities corridor. Inspect official transit alerts, road closures and weather sources; record endpoints, licensing, geographic coverage, refresh cadence and outages. Proceed with only sources whose access and reuse have been verified.
2. **Pipeline (2–3 sessions, estimate):** ingest at a permitted cadence; retain source IDs, event/validity times, retrieval times and geometry; deduplicate revisions; distinguish ended events from unavailable feeds; use SQLite plus exportable GeoJSON. Replay one recorded source update and one outage without duplicate or fabricated incidents.
3. **Analyst view (2 sessions, estimate):** one corridor map, active-event list and plain-language “what changed” brief. Filters are location and time. Every statement links to evidence and its age. Missing coverage is explicit; no invented congestion, risk or delay scores.
4. **Evaluation and portfolio evidence (1–2 sessions, estimate):** manually review a dated sample against source pages; report sample size, observed errors and publication lag. Include a pipeline diagram, reproducible example, map and short decision walkthrough. Set numerical performance targets only after measuring baseline behavior.

Argos can initially serve as a manual source-discovery/reference tool. Add direct integration only after verifying API availability, terms, cost and whether it contributes evidence beyond the official sources. Public camera links may provide context; automated camera ingestion or redistribution is outside this MVP.

This connects to the county/geospatial and freight interests in the portfolio while keeping a narrow stakeholder task. The transit project's validated collector and map components can be reused without combining the two interfaces.

Sources checked during this work:
- [Argos pricing and API/export availability](https://argosatlas.com/en/pricing/)
- [Argos source methodology and origin-specific licensing](https://argosatlas.com/en/fuentes-y-metodologia/)
