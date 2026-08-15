---
layout: post
title: "The Best Human in the World Does Not Exist"
date: 2026-08-09
author: "Chinmay Arora"
description: "Prime Human v0.1 turns a broad-capability tournament into an inspectable measurement proposal: a public taxonomy, floor-gated scoring, a live sensitivity simulator, and explicit failure conditions."
summary: "In a seeded synthetic population of 50,000, only 2.536% clear the median in all eight simulated domains. That result is not evidence about people. It is a stress test of a rule—and a reason to publish the rule before building the arena."
tags: [Measurement, Psychometrics, Sports Science, Human Performance, Experimental Design, Research Artifact]
categories: [Measurement, Human Performance]
content_type: "concept_note"
content_label: "Research Artifact"
search_phrase: "open measurement standard for broad human capability"
positioning_note: "Real scoring code, synthetic data, and no human subjects. The taxonomy, weights, floors, task forms, and title remain unvalidated proposals."
reading_time: "16 min read"
permalink: /blog/human-capability-tournament/
canonical_url: "https://app.chinmayarora.com/blog/human-capability-tournament/"
og_image: "/assets/images/og-human-capability-tournament.png"
image_alt: "Arena floor divided into physical, analytical, construction, and team capability stations."
lang: "en"
toc: true
featured: false
draft: false
schema_type: "TechArticle"
keywords: "Prime Human, human capability index, scoring simulator, psychometrics, measurement invariance, geometric mean, floor score, human performance"
last_modified_at: 2026-08-11
---

![Competitors rotate through physical, analytical, social, and construction stations inside a large arena.](/assets/images/og-human-capability-tournament.png)

*A broad-capability test would need stations that interfere with one another: clear thinking after exertion, cooperation across difference, construction under time, and recovery before the next demand. Illustration generated for this essay.*

<aside class="research-artifact-disclosure" aria-labelledby="how-to-read-prime-human">
  <h2 id="how-to-read-prime-human">How to read this artifact</h2>
  <p><strong>Synthetic data, real code.</strong> The simulator generates 50,000 invented competitors from a seeded factor model. It measures no person and validates no title. The scoring transformations, controls, and ranking reversals are executable.</p>
  <p><strong>What would make it real.</strong> The taxonomy needs cognitive interviews, accessible task forms, preregistered human trials, retest evidence, measurement-invariance tests, and an independent challenge process before any public ranking.</p>
  <p><strong>What is absent.</strong> Human Trials v0.1 and the application specifications remain build documents, not published research artifacts. No unit-economics figure appears because no auditable scenario workbook accompanies this release.</p>
</aside>

## The first cut

The terminal finishes its run. Fifty thousand synthetic names sit behind the screen. At a floor of the 50th percentile in every simulated domain, **1,268 remain**. The other 48,732 fail at least one threshold. The survival rate is **2.536%**.

That number looks sharp on the dark glass. It is not a population estimate. The people are invented, the factor loadings are assumptions, and the seed is fixed at \`20260807\`. The result says something narrower: when a rule demands median-or-better performance across eight partly correlated domains, the intersection becomes small very quickly.

An earlier draft carried a second headline: physical performance would consume 30–40% of composite variance under naive scoring. The attached simulator does not reproduce it. Under its default open norms, equal weights, and arithmetic aggregation, the display attributes **5.2%** of composite variance to the physical domain. At the first floor, physical weakness accounts for **15.5%** of eliminations; the other domains range from **10.9% to 14.0%**.

I am leaving the failed headline on the record because this is what an artifact is for. The chart below comes from the released seed and parameters. The red bar is noticeable, not sovereign.

![Horizontal bar chart showing each domain's share of first-floor eliminations. Physical is highest at 15.5 percent; the eight domains range from 10.9 to 15.5 percent.](/assets/blog/prime-human/domain-elimination-share.png)

*Figure 1. Weakest-domain attribution among competitors eliminated at the 50th-percentile floor. Synthetic N=50,000; open norms; eight-domain simulator v0.1. The [data](/blog-artifacts/prime-human/domain-elimination-share.json) and [renderer](/blog-artifacts/prime-human/render_domain_elimination_share.py) are published beside the figure.*

## Move the rule; move the winner

On the arena wall, a leaderboard feels like an answer. In the code, it is a function. Change the reference group, the aggregation rule, a domain weight, the eligible ages, or the floor schedule, and the same synthetic performances produce a different order.

<div class="research-dashboard-shell research-dashboard-shell--prime-human">
  <div class="research-dashboard-toolbar">
    <p><strong>Scoring-rule simulator v0.1</strong><br><span>Move the controls. The leaderboard reorders—same synthetic athletes, same performances, different rule.</span></p>
    <a href="/blog-artifacts/prime-human/scoring-rule-simulator-v0.1.html" target="_blank" rel="noopener">Open full simulator ↗</a>
  </div>
  <iframe
    src="/blog-artifacts/prime-human/scoring-rule-simulator-v0.1.html"
    title="Interactive Prime Human scoring-rule sensitivity simulator"
    loading="lazy"
    sandbox="allow-scripts allow-same-origin"
  >
    <a href="/blog-artifacts/prime-human/scoring-rule-simulator-v0.1.html">Open the scoring simulator.</a>
  </iframe>
</div>

The default schedule raises the floor from the 50th to the 65th, 75th, and 85th percentiles. In this run, the field moves from 50,000 to 1,268, then 222, 50, and finally 8. Those counts are not forecasts for an event. They expose how violently an apparently modest floor schedule can narrow a field.

The simulator also exposes a seam between artifacts. Its eight domains stop at creativity. The taxonomy proposes a ninth domain, integrity, but the code does not simulate it. That omission is deliberate. A one-shot “secret” moral test would be easy to stage, hard to retest, and culturally brittle. Until repeated observed-choice tasks show reliability, integrity belongs in the conduct and safety rules—not in the number over a competitor's head.

## The proposal that broke the method

In an early draft, medals, ventures, patents, difficult careers, and civic achievements sat on the scoring sheet. The idea had intuitive heat. A person who had already built something under pressure seemed to bring evidence that a laboratory station could not capture.

Then the validation plan reached the same sheet. If past achievement enters the score, and later achievement is used to claim that the score predicts consequential performance, the loop closes on itself. Opportunity, inherited wealth, geography, discrimination, health, and institutional access enter twice: first as points, then as supposed confirmation.

The achievement score came out.

What survived was a task called **The Venture**. Each participant receives a bounded problem, the same resource budget, a deadline, and blind judging against published constraints. The station observes planning, learning, coordination, and delivery in the room. It does not award points for the biography carried through the door.

A season format may retain prior achievement only as a capped tiebreak, published before the season and excluded from criterion validation. My preference for v0.1 is stricter: no biography in the primary ranking. If the tiebreak cannot be defended without prestige leaking into measurement, it should disappear as well.

## What the instrument refuses to count

At the registration desk, exclusion rules matter as much as task rules. They stop a broad-capability test from quietly becoming a census of privilege.

| Excluded signal | Why it stays outside the score |
|---|---|
| Personality | Descriptive, not a capability; high context dependence |
| Administered IQ | Licensing and fairness burden; poor fit with a public, observable event |
| Inherited wealth or status | Not capability |
| Achievement and accolades | Dominated by access, timing, and survivorship bias |
| Audience voting | Popularity is not validity |
| Luck | Difficult to norm and easy to narrate after the fact |
| National norming | Encourages country rankings and demographic storytelling |

The complete rationale lives in the [Human Capability Taxonomy v0.1](/blog-artifacts/prime-human/human-capability-taxonomy-v0.1.md). Nothing in that document has been validated on human participants.

## A floor before a crown

At the workbench, additive scoring can hide a dangerous weakness. A participant at the 99th percentile in one domain and the 10th in another may still rank highly if the weights are generous. The total looks broad while the profile remains brittle.

Let $p_{id} \in (0,1]$ be participant $i$'s normed percentile in domain $d$. The floor is the weakest measured domain:

$$
F_i = \min_d p_{id}
$$

A round publishes its threshold $\tau_r$ before the season. Advancement requires:

$$
F_i \geq \tau_r
$$

Among those who clear the floor, a weighted geometric mean rewards breadth while limiting compensation:

$$
B_i =
\exp\left(
\frac{\sum_{d=1}^{D} w_d \ln(p_{id}+\epsilon)}
{\sum_{d=1}^{D} w_d}
\right)
$$

The weights $w_d$ are not natural constants. They are governance decisions. The small $\epsilon$ is numerical protection, not permission to bury a zero. Both belong in a versioned rulebook, alongside sensitivity plots that show when a leader changes under plausible alternatives.

The taxonomy proposes nine domains: physical capacity, cognitive capability, adaptability, decision quality, social capability, emotional capability, resilience, creativity, and integrity. The tournament should not force those nine labels to survive contact with data. If factor analysis collapses them into fewer stable constructs, the next protocol should use fewer names.

## Four rules that constitute the competition

Under bright arena lights, format details become part of the measurement. A dramatic producer's choice can turn one unlucky station into a season-ending event. The [Competition Format Specification v0.1](/blog-artifacts/prime-human/competition-format-spec-v0.1.md) therefore begins with four rules that cannot be traded for spectacle:

1. **Elimination means failure against a published standard, never placing last.**
2. **The floor schedule and norming rules are published before the season.** No mid-season change is allowed.
3. **The capability catalog is public; the exact station instantiation is hidden.** Participants know the construct, not the puzzle.
4. **No single event ends a season.** Every domain receives at least three attempts before a floor can eliminate someone.

These rules change the emotional geometry of the arena. A competitor does not stare at the athlete in last place and hope they slip. Each person faces the same line painted across the floor.

The season and the world title also need different clocks. A season can gather repeated evidence across open sessions, qualifying circuits, and multiple station forms. A world final is shorter and more theatrical, which makes it statistically weaker. The title should therefore depend on a minimum evidence bundle, not a single televised night.

## Capability appears when tasks collide

On a clean table, a rested participant can diagnose a radio fault. The harder question begins after a loaded carry, when sweat softens the paper schematic and a teammate points to the wrong wire.

Independent stations reveal peaks. Interference stations reveal transfer:

- reasoning after physical fatigue;
- communication after a visible personal error;
- learning a second symbol system after mastering the first;
- leading, then following, with the same teammates;
- repairing a failed artifact instead of receiving a clean restart.

The protocol can observe three longitudinal quantities without pretending they are already calibrated: learning gain $L_i$, recovery $R_i$, and team contribution $T_i$ across randomized groups. A provisional research score could be written:

$$
S_i = B_i + \alpha L_i + \beta R_i + \gamma T_i
$$

No value for $\alpha$, $\beta$, or $\gamma$ belongs on the scoreboard yet. A sports scientist can make the fatigue sequence safe. A psychometrician can estimate retest reliability. An accessibility researcher can identify when an adaptation preserves the construct and when it creates a different task. A public-service or logistics team can supply realistic scenarios without donating confidential incidents. These are research partnerships, not endorsements.

## Human Trials v0.1 is the next gate

The first real room should be a university gym, rehabilitation lab, training center, or public-service facility—not a stadium. Fifty to one hundred consenting adults would rotate through multiple task forms while station order, teammate assignment, missingness, and recovery intervals are logged.

The study would preregister its hypotheses, exclusions, transformations, stopping rule, and criteria for abandoning the composite. It would test reliability, factor structure, order effects, team variance, and measurement invariance across language, sex, age, disability, and cultural groups. The [NIH Toolbox](https://nihtoolbox.org/assessments/) offers a useful precedent for standardized multidomain assessment, while its [cognition validation study](https://pubmed.ncbi.nlm.nih.gov/23479546/) shows the amount of reliability and validity work that a new instrument must earn.

Human Trials v0.1 exists as the next build gate, but it is not published here. A protocol involving consent, safety, accommodations, privacy, and adverse-event handling should not be reduced to blog decoration. It needs formal review and accountable research partners before recruitment.

## How the method could spread

In a school gym, a fire station, or a recreation center, the useful social object is not a global podium. It is a local open session that a group can inspect and repeat.

A **Season Open** could use inexpensive equipment and several equivalent task forms. Everyone completes the full circuit; nobody is eliminated. Each participant receives a profile with uncertainty, a weakest measured domain, and a retest date. A group then chooses one floor to practice together: communication under fatigue, calibrated decisions, recovery, or unfamiliar-tool learning.

Four weeks later, fresh tape marks the floor and a new task form lands on the table. The retest becomes useful only if local organizers publish what failed: a translation that changed the negotiation, a movement that excluded too many bodies, a ceiling effect, an unreliable rating rubric, or a sensor that behaved differently across skin and body types.

Open task specifications, assessor training, protocol versioning, and de-identified benchmark data would let independent sites challenge the method. Social spread should operate as distributed error correction. A copied logo proves nothing; a reproducible criticism does.

## Published artifacts

The release is intentionally small:

- [Scoring-rule simulator v0.1](/blog-artifacts/prime-human/scoring-rule-simulator-v0.1.html) — the executable synthetic model embedded above;
- [Human Capability Taxonomy v0.1](/blog-artifacts/prime-human/human-capability-taxonomy-v0.1.md) — domains, dimensions, exclusions, scoring proposal, and open problems;
- [Competition Format Specification v0.1](/blog-artifacts/prime-human/competition-format-spec-v0.1.md) — constitutive rules, season shape, advancement, and format risks;
- [Elimination-share data](/blog-artifacts/prime-human/domain-elimination-share.json) and [figure renderer](/blog-artifacts/prime-human/render_domain_elimination_share.py) — the static chart's provenance.

The taxonomy and format specification are linked source documents rather than compressed into this post. The Human Trials protocol, application specifications, and unpublished economic model remain outside the release.

### A narrow bridge to Aegis

Prime Human remains an independent measurement and human-performance proposal. I plan to carry its strongest methods into [Aegis](/ideas/aegis-ai-strategy/): floor-based readiness gates, sensitivity analysis, accessible assessment design, and longitudinal retesting could improve how Aegis evaluates whether people and teams are prepared to oversee consequential AI. Aegis borrows the method; it does not become the premise of this article.

## The open problems are the conclusion

When the arena empties, the tape still holds unresolved questions to the concrete:

1. **Measurement invariance is unproven.** A score that changes meaning across language, disability, sex, age, or culture cannot support a shared ranking.
2. **The taxonomy may be too large.** Nine domains and 28 dimensions may collapse into fewer empirical factors.
3. **A minimum is noisy.** The floor amplifies one bad measurement, one injury, or one unfamiliar station.
4. **A world final is too short.** A title decided by one compact trial may contradict the repeated evidence of a season.
5. **Integrity is unresolved.** One-shot observed behavior is vulnerable to staging, context, and weak retest reliability.
6. **Reference norms may reproduce access.** A global label can conceal unequal equipment, nutrition, safety, coaching, and prior exposure.
7. **Hidden instantiations create an integrity burden.** Leaked stations or inconsistent judging could overpower the construct.
8. **Spectacle can corrupt the instrument.** A visually dramatic event may receive weight that its reliability does not deserve.

The floor lights click off one row at a time. No podium resolves those problems. Until human evidence does, Prime Human v0.1 is a public hypothesis with runnable code—not a claim that the world's best human has been found.

## References

- Prime Human, [Human Capability Taxonomy v0.1](/blog-artifacts/prime-human/human-capability-taxonomy-v0.1.md).
- Prime Human, [Competition Format Specification v0.1](/blog-artifacts/prime-human/competition-format-spec-v0.1.md).
- Prime Human, [Scoring-rule simulator v0.1](/blog-artifacts/prime-human/scoring-rule-simulator-v0.1.html).
- NIH Toolbox, [Assessment system overview](https://nihtoolbox.org/assessments/).
- Weintraub et al., [“Cognition Assessment Using the NIH Toolbox”](https://pubmed.ncbi.nlm.nih.gov/23479546/), *Neurology*, 2013.

## Related essays

- [Successful Key Moment Metric](/blog/successful-key-moment-metric/) asks how sport can measure context rather than reward only visible outcomes.
- [Decision Intelligence](/blog/success-directory-decision-intelligence/) examines calibrated action under incomplete information.
- [AI and Human Imperfection](/blog/ai-human-imperfection/) argues that human variation should not be flattened into one clean score.
