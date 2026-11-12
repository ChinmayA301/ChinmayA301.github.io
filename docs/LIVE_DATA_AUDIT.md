# Live Data Lab — implementation and acceptance audit

Date: November 12, 2026. This document distinguishes inspected source, executed tests, and remaining evidence limits. It is not a claim that every possible failure or future data distribution has been tested.

## Delivered artifacts

- [Seismic observatory](https://chinmay-live-data-lab.chinmayarora30.workers.dev/observatories/seismic/)
- [Transit reliability lab](https://chinmay-live-data-lab.chinmayarora30.workers.dev/observatories/transit/)
- Backend and runbook: `live-data/README.md`.
- Reproducible deployment acceptance capture: `live-data/evidence/acceptance.json`.
- Football scope, milestones, effort estimates, source/access gates, and evaluation: `docs/FOOTBALL_MATCH_PULSE_PLAN.md`.

The observatories are deployed independently. Portfolio source links/previews are prepared in this checkout; the existing portfolio domain and DNS are unchanged.

## Source verification

### Seismic

Inspected upstream tree, metrics, status, scoring, training, monitoring, configuration, and workflow at commit `043c939e1b3d892bfd7d7f263ad4a096d03fd6d1` in [Live-Seismic-ML-Pipeline](https://github.com/ChinmayA301/Live-Seismic-ML-Pipeline/tree/043c939e1b3d892bfd7d7f263ad4a096d03fd6d1).

- Confirmed a configured six-hourly model pipeline and report commits.
- Confirmed that catalog scoring includes more than the held-out temporal test set. The UI keeps those populations separate.
- Imported twelve real published metric revisions, not invented intermediate points.
- For each imported revision, fetched metrics, status, and quality report using the same commit SHA; checked printed status metrics against raw values within rounding precision.
- Independently fetched the latest pinned `_metrics.json` from the deployed acceptance script and compared its full object with the API response.
- The referenced drift HTML and event-level scored table are not exported in the inspected public tree. No drift or per-event prediction visualization is fabricated.
- The existing PNG's displayed R² differs from the latest metrics JSON. Its cause was not established. Current observatory metrics come from the revision-pinned JSON/status bundle, not the PNG or README headline.

### Transit

Verified the [official provider feed documentation](https://svc.metrotransit.org/) and fetched actual trip-update, vehicle-position, and NexTrip route-label responses.

- Provider documentation states a five-second realtime-feed refresh; the implemented collector runs once per minute.
- A recorded source feed at `2026-11-12T07:33:54Z` contained 27 trip entities and 27 vehicle entities. Parsing at its actual capture time produced 25 valid locations and rejected two invalid/missing/stale location records. A `(0, 0)` example was present in the inspected response.
- Live production collection subsequently wrote advancing source timestamps without browser ingestion. The timestamped acceptance capture records distinct successful source times from persisted scheduled runs.
- Delay values are provider estimates for an upcoming stop, not observed actual arrival times. Missing delays do not become zero; early negative estimates remain negative.
- Raw payload hashes are checked during replay. Downloaded stored bytes reproduce the original normalized routes, locations, and rejection counts at the original capture time.

## Corrections made during verification

1. **Protobuf defaults:** absent timestamps can appear as prototype defaults. Switched the trip-timestamp check to explicit field presence and tested missing/zero/negative data cases.
2. **Replay transport:** an end-to-end checksum check exposed double gzip encoding. Confirmed Workers' documented `encodeBody` behavior and set precompressed replay responses to manual encoding. The deployed replay then passed.
3. **Forecast clocks:** separated source feature time, response capture time, and actual forecast issue time. Targets are exactly ten minutes after issue. Early development records with a null `feature_ts` are preserved but excluded from the new evaluation/training cohort.
4. **Normalization atomicity:** a failed route write cannot publish a partial snapshot. The integration test deliberately creates a constraint failure and verifies state rollback.
5. **Model memory:** bounded the fitting query to sixteen recently active groups and 180 matured records per group. The full fit/store/update/forecast path is tested with explicitly synthetic fixtures that never enter production.
6. **Mobile charts:** changed fixed desktop SVG dimensions to container-based dimensions. Adjusted time labels and the transit y-axis range so minor changes are not exaggerated by a near-flat auto-zoom.

## Executed checks

- TypeScript check with Wrangler-generated environment/runtime types.
- Thirteen domain/SQLite integration tests: field defaults, stale/future feeds, duplicates, cancellations, missing coordinates/timestamps, forecast horizon, temporal holdout purging, raw replay, idempotency, monotonic state, atomic rollback, read-only API, stale-feed quarantine/last-state retention, and ridge persistence/update/inference.
- Deployed raw-byte replay with SHA-256 verification and independent normalization, repeated against a later live snapshot.
- Three initial real matured network forecasts independently recomputed from constituent route-direction observations; verified the ten-minute horizon, outcome-matching window, and both absolute-error fields. The timestamped examples are in `live-data/evidence/outcome-check.json`; they verify mechanics, not predictive quality.
- Deployed API acceptance: real data available, at least two independent scheduled source snapshots, pinned upstream metric equality, selector validation, rejected public writes, and distinct forecast/source clocks.
- Production dependency advisory check: zero reported advisories at the time of the check. This is a registry result, not a guarantee of security.
- Main Jekyll build and SEO template/schema checks.
- Separate Brain Vomit build and publication-boundary validation.
- Desktop and 390-pixel mobile inspection of both observatories; route/history controls, actual charts, within-page overflow, and console errors. No console errors were observed in the captured browser pass.
- Design detector ran in degraded regex mode because parser dependencies were unavailable; its font warnings refer to the deliberately retained portfolio system. It was not treated as a full accessibility audit.

## Remaining evidence limits and operational follow-ups

- The transit live-history window starts when this collector was deployed. It cannot supply past realtime snapshots that were never collected.
- Prospective outcomes and ridge eligibility accumulate from real data. Current counts are recorded in the dated acceptance JSON; no accuracy gain, calibration claim, or mature service-reliability conclusion is asserted.
- Consecutive ten-minute forecasts overlap and are correlated. Sample eligibility gates do not establish statistical power. Model errors refer to subsequent provider estimates, not independently measured arrivals.
- The full trained-ridge path is tested with labeled fixtures; production training must still meet its live-data gates before any real held-out result appears.
- Source publication can stop or change. Stale/error handling is tested; long-duration upstream outages, high-volume daytime load, and multi-day retention behavior have not yet been observed in production.
- Hourly cleanup applies six-hour raw/quarantine retention targets and size budgets. An object can remain until the next cleanup. Normalized history has a seven-day retention target; stored per-snapshot position payloads are compacted after six hours.
- No football account, paid subscription, collection job, or prediction model has been started. Provider access, permitted redistribution, competition choice, and a budget remain plan gates.

## Transit incident and recovery — November 12, 2026

The user reported failed collection and an empty vehicle chart. Initial API inspection found a last accepted source timestamp of `2026-11-12T08:51:02Z` with zero usable locations, followed by repeated `Duplicate feed entity identifiers` failures. Occasional upstream HTTP 522 responses were also present. The original all-or-nothing entity-ID check was too strict for the provider's vehicle feed: it discarded valid observations along with malformed placeholders.

A source response timestamped `2026-11-12T09:54:53Z`, captured at `09:55:01.907Z`, contained 75 vehicle entities. Six repeated ID occurrences paired schedule placeholders with other records; 62 entities had unusable zero coordinates and absent timestamps. Independent parsing of the complete recording after the fix retained 13 valid locations and excluded 62. A three-entity, unmodified subset reproducing the defect is checked in at `live-data/tests/fixtures/metro-duplicate-vehicle.json`, with source provenance and the full original response's SHA-256. The test replays at its recorded capture time.

The deployed correction validates vehicle records individually before resolving entity and physical vehicle identities. It excludes invalid records, keeps the newest valid observation per identity, and drops ambiguous conflicts rather than choosing by input order. It reports repeated source IDs and invalid/redundant/conflicting exclusions separately. Trip-update entity ID collisions and stale/differential feeds still fail validation. Vehicle ages are checked against the capture clock as well as the feed header. Transit HTTP/network retries are limited to one retry, with ten seconds per attempt; permanent HTTP and size failures remain immediate failures. Raw bytes are preserved without rewriting provider coordinates.

Worker version `40fb31c8-1691-42cb-9f8f-306ed6705392` restored independent scheduled collection. Two consecutive scheduled source snapshots at `10:02:02Z` and `10:03:05Z` contained 18 and 20 valid locations respectively. The latter excluded 80 invalid records and reported six repeated entity ID occurrences. Deployed replay verified SHA-256 and reproduced normalized routes, locations, and quality counters from stored raw bytes. Updated acceptance at `10:03:31Z` verifies two distinct successful source times, a successful latest attempt, fresh timestamps from both feeds, and complete vehicle-record accounting.

Nineteen domain/fetch/SQLite integration tests pass, including the real duplicate-placeholder regression, input-order independence, contradictory locations, deleted records, capture-clock age, bounded 522 retry, and the scheduled collector-to-public-API path. Browser inspection confirmed 20 plotted points, non-stale status, working route filtering (`54|0` showed the real vehicle `2029`), no horizontal overflow at the inspected desktop viewport, and no captured console warnings/errors. The portfolio preview image now shows this recovered live chart.

This recovery does not backfill the missing observations during the outage. The existing history keeps that collection gap visible. Continued availability remains dependent on the upstream provider; these checks establish the observed recovery, not a guarantee against future outages.
