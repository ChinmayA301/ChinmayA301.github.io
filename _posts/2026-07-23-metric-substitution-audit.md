---
layout: post
title: "The Proxy Gap: When Access Stops Measuring Capability"
date: 2026-07-23
author: "Chinmay Arora"

description: "A source-audited study of metric substitution using ASER 2024 state data and official enforcement statistics, with a reproducible 27-state analysis and an interactive denominator lab."
summary: "Across 27 ASER 2024 state and UT panels, rural enrollment is almost universal while foundational reading varies dramatically. The result is not that access stopped mattering; it is that a saturated access proxy can no longer stand in for capability."
tags: [metric-substitution, education, aser, public-policy, governance, evidence, data-science, india]
categories: [Data Science, Public Policy, Research]
content_type: "research_study"
content_label: "Research Study"
reading_time: "12 min read"
search_phrase: "ASER 2024 enrollment learning metric substitution"
positioning_note: "This is a descriptive, cross-sectional audit of public aggregates. It tests whether a saturated proxy distinguishes current outcomes; it does not estimate a causal effect."
image: "/assets/blog/metric-substitution-audit/proxy-gap-social.png"
---

## The argument in one sentence

When a proxy becomes nearly universal, it can remain politically important while becoming statistically weak at distinguishing the capability it was meant to represent.

That is the idea behind **metric substitution**: the visible, countable measure gradually replaces the harder outcome in public discussion.

School enrollment is a clean place to test it. Access is indispensable. But once almost every child is enrolled, the remaining variation in enrollment may tell us very little about whether children can read at the expected level.

I turned that claim into a reproducible pilot using the full set of 27 state and union-territory panels in the [ASER 2024 rural report](https://asercentre.org/aser-2024/). I then built a separate denominator lab from [official Enforcement Directorate statistics](https://enforcementdirectorate.gov.in/performance/statistics/) to show a related problem: a percentage is not interpretable until its denominator and pipeline stage are named.

The code, extracted data, source audit, methods, results, and figures are together in the [research artifact](https://github.com/ChinmayA301/blog-artifacts/tree/codex/metric-substitution-audit/metric-substitution-audit).

---

## The first source check changed the claim

The original discussion cited **23.4%** as the national share of Standard III children able to read a Standard II text.

That number exists, but its scope matters. ASER's 23.4% figure is for **government-school** Standard III students in 2024. The corresponding all-children table reports **27.0%**, while the government-plus-private weighted estimate is **27.1%**.

This is not a cosmetic correction. A study about misleading proxies cannot quietly mix populations in its own headline. The state analysis therefore uses the all-children reading measure throughout.

The larger argument survives the correction. It is simply better specified.

---

## Study A: access is compressed; capability is not

For each state or UT, I paired:

| Construct | Measure | Source |
|---|---|---|
| Access proxy | Children age 6–14 enrolled in school | ASER State Table 1 |
| Capability outcome | Standard III children able to read a Standard II text | ASER State Table 4 |
| Descriptive wedge | Enrollment minus reading, in percentage points | Derived |

The contrast is stark:

- Enrollment occupies a narrow **95.9%–99.9%** range.
- Reading occupies a **6.2%–50.6%** range.
- Reading's coefficient of variation is about **37 times** enrollment's.
- The cross-state Pearson correlation is **0.11**.
- A fixed-seed permutation test gives **p = 0.59**.
- The bootstrap 95% interval for the correlation is **−0.23 to 0.44**.

![Scatter plot comparing ASER 2024 rural enrollment and Standard III reading across 27 states and union territories](/assets/blog/metric-substitution-audit/aser-access-vs-learning.png)

In this cross-section, enrollment has very little discriminatory power for foundational reading. States clustered near 99% enrollment can still sit far apart on capability.

This does **not** show that enrollment policy is unimportant. It does not show that enrollment causes poor reading, or that reducing access would improve learning. It shows something narrower:

> Once access is saturated, access alone is a weak summary of current capability.

The 27 observations are geographic aggregates, not independent randomized units. The calculated “wedge” is descriptive, not a treatment effect.

---

## Study B: the denominator is part of the claim

Official Enforcement Directorate statistics, reported through 31 March 2026, list:

- **8,851** ECIRs recorded
- **2,396** prosecution complaints filed
- **60** completed trials
- **56** conviction outcomes
- **4** acquittals

Using the same numerator—56—produces very different percentages:

![Denominator comparison using official Enforcement Directorate aggregate statistics](/assets/blog/metric-substitution-audit/enforcement-denominator-lab.png)

| Calculation | Result | What it actually describes |
|---|---:|---|
| 56 / 60 completed trials | **93.33%** | Share of concluded trial cases ending in conviction |
| 56 / 2,396 complaints | **2.34%** | Conviction outcomes relative to complaints filed |
| 56 / 8,851 ECIRs | **0.63%** | Conviction outcomes relative to recorded investigations |

These are not three rival estimates of one “true conviction rate.” They answer different pipeline questions, and they mix cases of different ages. Calling all three a conviction rate would hide the analytical choice inside the denominator.

The aggregate table also cannot establish partisan selectivity. It has no party-coded case records, matched exposure groups, filing dates, stage transitions, or comparable dispositions.

A defensible selectivity study would need a verified case-level panel with at least:

1. person and office identifiers,
2. party status at each event date,
3. investigation, complaint, charge, trial, and disposition dates,
4. alleged offense and monetary exposure,
5. comparable non-target or opposition/government exposure groups, and
6. a preregistered estimand that separates scrutiny, progression, delay, and outcome.

Until that panel exists, aggregate counts can audit throughput. They cannot prove motive.

---

## Explore the dashboard

The interactive version lets you inspect every state, switch denominator views, download the underlying CSVs, and trace each number back to its source.

<div class="research-dashboard-shell">
  <div class="research-dashboard-toolbar">
    <p><strong>The Proxy Gap</strong><br><span>Interactive ASER 2024 state audit and enforcement denominator lab</span></p>
    <a href="https://proxy-gap-india.chinmayarora2001.chatgpt.site" target="_blank" rel="noopener noreferrer">Open full dashboard ↗</a>
  </div>
  <iframe
    src="https://proxy-gap-india.chinmayarora2001.chatgpt.site"
    title="The Proxy Gap interactive research dashboard"
    loading="lazy"
    allow="fullscreen"
    allowfullscreen
  ></iframe>
</div>

If the embedded view is too narrow on your device, [open the dashboard directly](https://proxy-gap-india.chinmayarora2001.chatgpt.site).

---

## What the audit changes

The goal is not to replace enrollment with one new magic metric. Reading is itself only one dimension of learning. The better lesson is to make the measurement chain explicit:

1. **Name the construct.** What do we actually care about?
2. **Name the proxy.** What observable measure is standing in for it?
3. **Check saturation.** Does the proxy still vary enough to distinguish outcomes?
4. **Name the denominator.** Which population and pipeline stage does the percentage describe?
5. **Separate description from causation.** What can this design not identify?
6. **Publish the audit trail.** Let readers inspect sources, corrections, transformations, and code.

Public systems often optimize what is visible. Good analysis keeps asking whether the visible number still tracks the thing that matters.

That question is useful well beyond education: hospital capacity versus recovery, infrastructure spending versus service reliability, investigations versus concluded cases, or AI adoption versus realized operational value.

The proxy can be real. The progress can be real. The gap can still be real too.

---

## Sources and reproducibility

Primary sources:

- [ASER 2024 report hub and state pages](https://asercentre.org/aser-2024/)
- [ASER 2024 national findings](https://asercentre.org/wp-content/uploads/2022/12/ASER-2024-National-findings.pdf)
- [ASER 2024 all-India tables](https://asercentre.org/wp-content/uploads/2022/12/India.pdf)
- [Directorate of Enforcement statistics](https://enforcementdirectorate.gov.in/performance/statistics/)
- [FATF/APG/EAG 2024 mutual evaluation of India](https://www.enforcementdirectorate.gov.in/media/mer/7a11bcc5-23ec-4a4e-ab93-2e44b378fb4b_India-MER-2024.pdf.coredownload.inline.pdf)
- [Election Commission electoral-bond disclosure](https://www.eci.gov.in/disclosure-of-electoral-bonds)

The complete [metric-substitution-audit folder](https://github.com/ChinmayA301/blog-artifacts/tree/codex/metric-substitution-audit/metric-substitution-audit) contains the README, extraction and analysis scripts, four source CSVs, derived results, methodology notes, source notes, and both generated charts.
