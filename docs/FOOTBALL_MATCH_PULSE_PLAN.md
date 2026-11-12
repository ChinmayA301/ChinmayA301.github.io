# Football Match Pulse — project plan

Planning date: November 12, 2026. This is a proposed project, not an implemented product. Effort figures below are planning estimates for one builder. No provider account, subscription, league preference, or paid data access is assumed.

## Product and intended use

A personal match companion that answers: “What changed in this match, how did that change the result probabilities, and how fresh is the underlying information?” It extends the owner's football analytics interests while demonstrating continuous ingestion, reliable state handling, forecasting, and prospective evaluation.

The first release covers one explicitly selected competition. It shows the current score and provider-reported match state, a score-state timeline, home/draw/away probability history, and collector health. It retains history independently of whether anyone has the dashboard open.

Success is a working artifact used during real matches, with replayable inputs, forecasts recorded before outcomes, and honest evidence of model quality. Better-than-baseline accuracy is a research question, not a promised deliverable.

## Verified source options and access gate

Sources checked November 12, 2026:

- [football-data.org pricing](https://www.football-data.org/pricing): the free plan lists delayed scores and 10 calls/minute; the entry live-score plan lists €12/month and 20 calls/minute. VAT may apply. Coverage and effective latency must be confirmed against the chosen competition and actual account.
- [Match resource documentation](https://docs.football-data.org/general/v4/match.html): the resource documents identifiers, competition/season, match status, score, minute, and update metadata. Documentation examples do not establish which fields an individual subscription returns.
- [Coverage](https://www.football-data.org/coverage) and the provider's current usage/redistribution terms must be checked before publicly republishing score snapshots or retaining a public raw archive.

The implementation does not begin with a paid purchase. At the access gate, choose either a clearly labeled delayed-data prototype or an explicitly approved live-data subscription. Confirm minute/period availability and semantics from real responses. If the chosen plan lacks a reliable match clock, ship the state/timeline dashboard first and hold in-play probabilities behind that unmet requirement.

No xG, shot locations, tracking data, possession, lineups, or disciplinary-event model is included unless the selected feed actually provides those fields under usable terms. Historical research datasets are not described as live feeds.

## MVP scope

### Included

- Match selection for one chosen competition; kickoff, score, status, and source timestamps.
- A timeline of observed score-state changes. Label the time the provider reported a change; do not invent an exact goal timestamp from a polling observation.
- An interpretable home/draw/away baseline and candidate probability trace when the clock/access gate is satisfied.
- Durable snapshot history, canonical match state, correction handling, outage/stale states, and replay.
- An evaluation view comparing forecasts with final regulation-time outcomes after results settle.
- Exportable aggregate evaluation and reproducible setup documentation, subject to provider terms.

### Later releases

- Live standings scenarios after validating the competition's tie-breaking rules.
- Team watchlists and richer match-event explanations.
- SKM tactical context as a separate, clearly sourced historical view.
- TransferSignal integration where it supplies relevant provenance or team context; do not let unverified transfer claims become model features by default.

## Proposed architecture

`provider → independent scheduler → raw response archive → validation → revision-aware match store → forecast service → stored prediction log → read-only API → dashboard`

Use Python for modeling, a small database-backed collector, and the portfolio's existing chart stack. The deployed transit backend offers reusable patterns for scheduling, raw hashes, validation, API freshness, and failure handling; reuse proven components after checking their football-specific semantics.

Start with one bounded polling job. Cache shared responses, increase collection frequency only around active matches, and remain below the verified provider quota. Visitors must not each trigger their own provider request. A queue or stream broker is a later architectural decision, not an MVP requirement.

## Data contract

| Record | Key fields | Rules |
| --- | --- | --- |
| Collection attempt | run ID, started/finished time, status, HTTP status, response hash, quota metadata when supplied | Record failures and rate limits; never log the API token. |
| Raw snapshot | provider, fetched-at UTC, provider-updated-at when present, content hash, payload reference | Immutable, deduplicated; retention and redistribution follow verified terms. |
| Match identity | provider match ID, competition, season, home/away team IDs, kickoff | Team names are display fields, not join keys. |
| State revision | match ID, provider timestamp, collection timestamp, status, score, clock fields, raw hash | Preserve corrections and postponed/rescheduled states; do not force scores to be monotonic. |
| Forecast | model version, match ID, source-state hash, issued-at, available information cutoff, probabilities | Write once before the outcome; probabilities finite, each in [0,1], sum to one within tolerance. |
| Outcome | match ID, regulation-time score, settled-at, outcome revision | Keep extra-time and penalty outcomes separate; corrections can invalidate or supersede evaluation rows. |

Store provider event time, source revision time, ingestion time, forecast issue time, and browser fetch time separately. A newly fetched old response is still old data.

## Data science design

### Baselines and candidate

1. **League outcome-frequency baseline:** estimate from training-period matches only.
2. **Frozen prematch baseline:** regularized team attack/defense strength with a home effect, fitted from completed historical matches available before kickoff; convert goal-rate estimates to result probabilities with a documented Poisson formulation.
3. **In-play candidate:** condition on the observed score and verified match clock, then model remaining goals. Start with the frozen prematch rates scaled by a documented remaining-time rule. This is a mechanistic first candidate, not a trained event-level model.

Promoted/recent teams need an explicit shrinkage or fallback policy. If source history is insufficient, report that and use the league baseline rather than silently fitting unstable team parameters. Do not infer match minute from wall-clock time across halftime, suspensions, or missing kickoff information.

The probability computation needs numerical tests for normalization, near-zero remaining time, tied scores, extreme scores, and truncated Poisson tail mass. Ninety-minute regulation outcomes must be separated from extra time and penalty shootouts. Stoppage-time handling is a documented model assumption to test, not a source fact.

### Leakage controls

- Chronological training/validation/test boundaries; all observations from one match stay in the same partition.
- Features use only information available at forecast issue time; no final score, final table, or retrospectively revised event can enter an earlier forecast.
- Retain original forecasts when the provider revises a score. Mark affected records and apply a predeclared correction policy.
- Exclude snapshots already marked finished from prospective in-play scoring.
- Keep training-period parameter selection separate from the final held-out comparison.

### Evaluation

- Multiclass Brier score with the exact normalization defined in code, and log loss with a documented numerical probability floor.
- Reliability/calibration plots for home/draw/away outcomes when sample sizes support them.
- Compare candidate and baselines on the same eligible matches and clock checkpoints.
- Report distinct matches as well as snapshot count. Thousands of correlated snapshots from one match are not thousands of independent games.
- Use predeclared clock checkpoints when provider semantics permit. Quantify uncertainty with match-level resampling; treat early intervals as unstable when few matches have settled.
- Separate historical prematch evaluation from prospectively collected in-play evaluation.

No fixed performance gain is an acceptance requirement. A reliable negative result is publishable evidence.

## Delivery milestones

| Gate | Estimated effort | Deliverable | Exit criteria |
| --- | --- | --- | --- |
| 0. Source and scope | 0.5–1 day | Verified feed contract and competition choice | Real authorized responses inspected; required fields, latency, quota, budget, and terms recorded. Paid access requires owner approval. |
| 1. Reliable collection | 1–2 days | Scheduler, raw archive, schema, attempt logs | Duplicate/revised fixtures, rate limits, upstream failure, and restart/replay tests pass; collection continues with the browser closed. |
| 2. Match-state product | 1–2 days | Score-state timeline and freshness UI | Observe an actual match-state transition; distinguish source delay from collection lag; retain last accepted state during an outage. |
| 3. Forecasting baseline | 2–3 days | Reproducible model package and versioned forecast writer | Clock gate satisfied; normalization and leakage tests pass; first forecasts are stored before outcomes. |
| 4. Prospective evaluation | 1–2 days of engineering, plus real match-collection time | Outcome join, paired metrics, calibration view | Match-level partitions and correction policies verified; no fabricated or retrospectively backfilled “live” predictions. |
| 5. Portfolio release | 1 day | Deployed artifact, architecture, model card, short demo | A real end-to-end match replay works; source/latency limits are visible; code and checks are reproducible. |

Estimated engineering total: **6.5–11 days**, excluding access delays and the time needed to accumulate meaningful match outcomes. An initial live artifact can precede a defensible predictive-performance claim. The competition calendar determines the evaluation accumulation period; it is not assumed here.

## Audit and release checklist

- Compare a sample of provider responses against the provider's own match view at capture time; record discrepancies instead of manually rewriting them.
- Independently recompute a small forecast/outcome sample from the immutable prediction log and compare with the dashboard metrics.
- Verify score corrections, VAR reversals when reflected by the feed, halftime, suspension, postponement, cancellation, extra time, penalties, and missing fields.
- Test 429/backoff behavior, network timeout, stale source, corrupted payload, duplicate response, process restart, and replay determinism.
- Run a browser check on desktop and mobile, including keyboard selection, empty matchdays, errors, and the last accepted snapshot during an outage.
- Confirm secrets remain server-side and that public exports respect the verified data license.
- Publish a factual README, data contract, model card, runbook, known limitations, and a short incident/recovery record.

## Decisions still needed

1. Competition and teams to follow.
2. Delayed free prototype or approved paid live feed, including a spending ceiling.
3. Acceptable data latency for the intended viewing experience.
4. Whether public deployment may include provider score data and what retention is permitted under the chosen plan.

The seismic and transit implementations remain the active builds. This plan does not initiate a football subscription or collection job.
