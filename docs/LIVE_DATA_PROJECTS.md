# Live-data data-science project shortlist

Updated November 12, 2026. The seismic observatory and transit lab are implemented prototypes; football and 311 remain proposed builds. The objective is a dashboard whose charts update from a real data pipeline, demonstrating data engineering and evaluated data science together.

## Existing showcase: Live Seismic ML Pipeline

[GitHub repository](https://github.com/ChinmayA301/Live-Seismic-ML-Pipeline) · [scheduled workflow](https://github.com/ChinmayA301/Live-Seismic-ML-Pipeline/blob/main/.github/workflows/pipeline.yml) · [auto-generated status](https://github.com/ChinmayA301/Live-Seismic-ML-Pipeline/blob/main/reports/STATUS.md)

Verified from the public source: scheduled six-hourly USGS ingestion, DuckDB upserts, Great Expectations validation, training and conformal calibration, scoring, MLflow tracking, Evidently drift checks, and refreshed reports. It estimates catalog magnitude for already-detected events; it does not predict earthquakes. A live source and a six-hourly job are distinct cadences.

The portfolio features the original evaluation figure and links to the deployed [seismic observatory](https://chinmay-live-data-lab.chinmayarora30.workers.dev/observatories/seismic/), code, and status. The figure is a historical snapshot. The observatory imports revision-pinned reports and renders current aggregate metrics.

The implemented observatory displays published temporal-test error and interval coverage, workflow history, source age, and exported validation checks. Event-level scored records and a machine-readable drift series are not exported upstream, so these are not shown or inferred. Those would require an explicit upstream exporter. The original model remains on its six-hour schedule.

## 1. Twin Cities Transit Reliability Lab — implemented prototype

**Fit:** civic analytics, geospatial modeling, operational decisions, and an app useful for choosing routes or departure times.

**Verified source:** [Metro Transit schedule and realtime feeds](https://svc.metrotransit.org/). The agency documents GTFS-realtime trip updates, vehicle positions, and alerts refreshed every five seconds. Static schedules are separately versioned. A proposed first collector can poll every 30–60 seconds rather than ingest every source refresh.

**Charts:** route delay distribution over time; route/stop reliability heatmap; vehicle progress; headway variability; source freshness and pipeline lag. Begin with a few routes the owner actually uses.

**Data science:** compare a time-of-week baseline with a model for route-level delay in the next ten minutes. Evaluate predictions against subsequently observed feed snapshots using rolling temporal splits. Published ETA estimates and inferred arrivals must remain distinct from independently observed actual arrivals. Add change detection and prediction intervals after the baseline is measurable.

**Pipeline evidence:** static/realtime joins, event time versus ingest time, duplicate snapshots, late/missing positions, schedule-version changes, replay, and reproducible feature windows.

## 2. Football Match Pulse

**Fit:** extends SKM Football Analytics and TransferSignal, with clear personal use while following matches.

**Verified source:** [football-data.org plans](https://www.football-data.org/pricing). The free plan has delayed scores; live scores require a paid plan. Choose the feed and budget before implementation. Historical StatsBomb files can support research, but are not a live match feed.

**Charts:** score/time events, updated result probabilities, uncertainty, live table scenarios, and forecast-versus-final-outcome history. Do not promise xG, tracking coordinates, or shot events without confirming provider access to those fields.

**Data science:** start with a score/time-conditioned probability baseline. Log each forecast before the outcome occurs, then evaluate Brier score, log loss, and calibration after matches finish. Accumulate real in-play snapshots before claiming an evaluated in-play model.

**Pipeline evidence:** polling within provider quotas, match-state transitions, score corrections, postponed matches, deduplication, caching, backfill, and a clearly labeled feed delay.

## 3. Minneapolis 311 Service Pressure

**Fit:** the most direct continuation of the existing 311 segmentation and county service-access work.

**Source/access gate:** [MinneapolisData](https://www.minneapolismn.gov/government/government-data/minneapolis-data/) and the [city's November 5, 2026 system update](https://www.minneapolismn.gov/news/2026/november/new-311-system/). The city recently changed its 311 platform. Confirm a usable public endpoint, fields, record identifiers, and actual publication cadence before committing to a live dashboard. Do not assume the existing 2024 extract is a current feed.

**Charts:** incoming versus closed requests, backlog age, category/neighborhood pressure, and completion-time distributions. Show publication lag alongside pipeline lag; use a scheduled refresh if the source is batch-published.

**Data science:** forecast request volume and compare completion-time baselines. Open requests are right-censored; avoid treating them as completed or calculating completion times from completed cases alone without explaining the bias. Keep geographic aggregates separate from claims about resident demographics or need.

**Pipeline evidence:** incremental upserts, status revisions, reopenings, schema changes after migration, geospatial joins, backfill, and historical snapshots.

## Common implementation and acceptance criteria

Proposed starting architecture:

`source → scheduled collector → immutable raw snapshots → validation/quarantine → normalized store → rolling features/model → serving API → updating charts`

Start with Python, Parquet snapshots and DuckDB or PostgreSQL, a small API, and a chart client. Browser polling is sufficient for the first version. Introduce a queue or streaming broker only when durable event delivery or independent consumers justify it.

Demonstrate these properties in the public artifact:

- Ingestion runs independently of the visitor's browser and retains history.
- Stable identifiers and checkpoints make retries idempotent.
- Late events, missing fields, revisions, and upstream outages have explicit behavior.
- Raw inputs can be replayed to rebuild features and charts.
- Source event time, fetch time, last successful processing time, and display time are distinct.
- The UI retains the last valid snapshot, marks it stale during an outage, and never invents fresh readings.
- A temporal baseline and one improved method are evaluated; plots report the evaluation window and sample size.
- Pipeline runs expose row counts, lag, validation failures, and scoring/model versions.
- One-command reproduction and a deployed artifact accompany a short architecture diagram and an actual pipeline-failure/recovery demonstration.

Sequence: feature the existing seismic evidence now; add its live observatory for the fastest visible result; choose transit for a distinct new frequent-update project. Keep the other directions in the backlog until one project is operating end to end.
