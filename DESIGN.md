# Portfolio design system

The live-data observatories extend the incumbent editorial portfolio. They preserve the existing visual identity rather than introducing a separate brand.

## Visual authority

- Shared tokens and typography: `css/editorial.css`.
- Page background: `#121416`; raised chart surface: `#171a1e`.
- Primary text: `#e7e8ea`; secondary text: `#c0c4c9`.
- Accent: `#d1a67d`; use it for the primary data series, active navigation, and focus outlines.
- Instrument Serif for headings; Inter/system sans-serif for controls and data.
- Rules and spacing establish hierarchy. Avoid decorative movement or fabricated operational signals.

## Observatory surfaces

Mode: **Operate**. The visitor inspects source freshness, a real data series, evaluation evidence, and provenance.

- Title and freshness precede controls and charts.
- Seismic: revision-pinned aggregate metrics, interval coverage, temporal-test error, actual workflow history, and exported validation checks.
- Transit: route-direction and history controls, delay estimates, valid vehicle positions, prospective evaluation, and collector health.
- Show missing data and evaluation gates as explicit states; never fill gaps with illustrative readings.
- Keep source time, fetch time, issue time, and target time distinguishable.
- SVG chart dimensions adapt to the actual container so axis labels remain readable on mobile.
- Accessible data tables accompany charts. Controls have visible keyboard focus; tables scroll within their own containers.
- Graphs use genuine observations. Empty or stale feeds retain their meaning; long gaps are not smoothed away.

## Showcase

Compact summaries, direct source links, real artifact previews, and topic filters lead to the work. Dashboard mocks remain labeled as illustrative. Observatory screenshots are dated snapshots that link to the live artifacts.

## Verification record

Desktop and mobile browser inspection covered both live observatories, chart rendering, overflow, route selection, and history selection. The chart-label sizing and near-flat transit y-axis scale were corrected in the bounded confirmation pass. Detailed data/backend acceptance is in `docs/LIVE_DATA_AUDIT.md`.

## Geographic transit inspection

The map uses actual vehicle observations over attributed OpenStreetMap street tiles. Copper markers continue the chart palette; the light basemap preserves street-label legibility. The full-width map precedes detailed graphs, supports keyboard and touch controls, and has a coordinate-table equivalent. Coverage bars use reporting-trip denominators and show counts beside percentages.
