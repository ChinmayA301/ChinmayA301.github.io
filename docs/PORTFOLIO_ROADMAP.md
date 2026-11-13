# Portfolio build backlog

Updated November 12, 2026. New project names below are ideas, not completed portfolio work.

## Showcase shipped locally

- Artifact-led homepage selection and compact project gallery with topic filters and skill search.
- Public Minneapolis 311 clustering and document-intake benchmarks surfaced as separate projects with direct source links.
- Live Operations Control Tower Looker Studio report and its actual overview screenshot.
- Live Seismic ML Pipeline leads the homepage selection with an actual evaluation figure, GitHub implementation, and auto-generated status report. A Pipelines & MLOps topic groups the relevant work.
- County service access, Luthra internal search/reporting, and freight-finance interactive dashboard mocks. Every mock uses synthetic examples and is labeled accordingly. Replace the mocks with approved report exports or public report URLs when available.
- Course-specific graduate ML and sequential-decision experiments, the real-estate pipeline, and undergraduate data-structures work surfaced from their public folders.

## Build status and next projects

Prioritize personal use. These are proposed MVP boundaries, not assumptions about an existing implementation.

| Priority | Idea | First useful version | Acceptance criteria |
| --- | --- | --- | --- |
| 1 | Follow-on coach | A personal follow-through tool: record a commitment, its next action, a due date, and a short check-in. Review active and overdue commitments. “Follow-on” meaning still needs confirmation before implementation. | Persist/export records; complete, defer, and reopen an action; show the next action without a chat session; use it for a week and record what changed. No outbound messages in the first version. |
| 2 | Live-data DS dashboard | A new data-science project whose charts update from a real ingestion, validation, storage, and inference pipeline. Implemented: live Twin Cities Transit Reliability Lab with independent collection; outcome history is accumulating. See [LIVE_DATA_PROJECTS.md](LIVE_DATA_PROJECTS.md) for the ranked shortlist. | Durable raw history; idempotent ingestion; incremental aggregates; a temporal evaluation baseline; updating charts; visible source/ingestion timestamps; stale-feed behavior; replay/backfill; pipeline health. |
| 3 | Video intelligence for intentional viewing | Import a video URL plus a user-provided transcript; find chapters, unanswered questions, and moments worth returning to. Save a timestamped watch queue. | Source-linked timestamps; transcript evidence for summaries; search and bookmark; resume a saved video; handle missing transcripts and unanswerable questions clearly. Confirm video source and transcript access before integration. |

## Finish theory-based projects

Do not mark every concept complete or start several at once. Select one theory with a measurable claim, then:

1. State the hypothesis, intended user decision, and failure criterion in a short README.
2. Identify a public or explicitly authorized dataset; freeze a reproducible input snapshot.
3. Implement one baseline and one proposed method, with a held-out comparison where applicable.
4. Publish the runnable code, environment, aggregate results, limitations, and one usable artifact.
5. Add the artifact to the showcase only after it runs and the public evidence is available.

The sequential-decision archive and the existing public-sector evaluation work offer starting points; the owner still needs to choose the theory to finish.

## Content follow-ups

- Replace the county, Luthra, and freight mock previews with approved artifacts when available. Preserve the mock labels until then.
- Reconcile older coursework descriptions against actual source folders before promoting them. A repository root is not evidence for every named project.
- Keep small scripts discoverable through the coursework topic and direct folder links; promote a small project when it has a working artifact worth opening.
- Use `data/projects.json` for summary, topic, preview, and action metadata. Keep detailed background in source repositories, reports, or experience.

## Football Match Pulse

See [FOOTBALL_MATCH_PULSE_PLAN.md](FOOTBALL_MATCH_PULSE_PLAN.md) for the source/access gate, model design, milestones, evaluation, and estimated effort. No football subscription or collector has been started.

## Migration

Move the portfolio from `app.chinmayarora.com` to `chinmayarora.com` using [DOMAIN_MIGRATION.md](DOMAIN_MIGRATION.md). Hosting cutover is still pending.
