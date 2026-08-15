# Human Capability Taxonomy v0.1

**Status:** Draft specification. Nothing here has been validated on human data.
**Purpose:** Define what the competition claims to measure, before defining any game.
**Provenance:** Instrument citations are real and drawn from published literature. All
scoring parameters, floor schedules and weightings are proposed values, not fitted ones.

---

## 0. What this document commits to

The competition does **not** claim to identify the best human. It claims to run the
broadest standardised competition of human capability, against a published definition.
The definition is this document. It is versioned, and it is expected to be wrong in
places that data will later expose.

Three commitments follow from that:

1. **The scoring rule is published before the season, not after.** Changing weights
   after results are known converts a sport into a judgement.
2. **Negative results are published.** If a domain turns out to be redundant with
   another, it is cut, publicly, with the correlation matrix that killed it.
3. **The index is never validated against anything that is inside the index.**
   This is why life outcomes are held out (§5).

---

## 1. Scoring architecture

Two numbers per competitor.

| Number | Definition | Role |
|---|---|---|
| **Floor** | Lowest domain percentile across all nine domains | Gates advancement. The marquee stat. |
| **Composite** | Weighted geometric mean of the nine domain percentiles | Ranks survivors. |

**Ranking rule:** clear the round's Floor in *every* domain, then rank by Composite.
Elimination is failure against a fixed published standard, never placing last in a heat.

**Reference population:** percentiles are computed against global, sex- and age-matched
norms, fixed at season open and published in advance. Never locality-matched — that is a
national quota in disguise.

**Stage rule:** percentiles for qualification (comparing people who never meet);
absolute performance for the final (comparing people in the same venue, same conditions).

**Indicative floor schedule** — from 1,000,000 enrolled, under a factor model with mean
inter-domain r ≈ 0.18. Simulated, not observed:

| Round | Floor, all domains | Survivors | Rarity |
|---|---|---|---|
| Open logging | — | 1,000,000 | — |
| City | ≥50th | ~26,400 | 1 in 38 |
| Regional | ≥70th | ~2,590 | 1 in 386 |
| National | ≥80th | ~430 | 1 in 2,345 |
| Continental | ≥85th | ~120 | 1 in 8,529 |
| World final | ≥90th | ~24 | 1 in 42,553 |

The headline claim of the sport lives in the right-hand column. Clearing an 85th-percentile
floor across nine weakly-correlated domains is rarer than being 99.98th percentile at any
one of them — and no existing test measures it, because every existing test is marginal.

---

## 2. The nine domains

Twenty-eight dimensions. Each maps to a published instrument (for norming and validation)
and a candidate competition event (for the sport). The instrument establishes the construct;
the event is what people watch.

### D1 · Physical capacity

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Cardiorespiratory endurance | VO₂max, treadmill ramp or 20 m shuttle | **The Engine** — graded continuous effort to failure | ml/kg/min |
| Maximal strength | Isometric mid-thigh pull; 1RM composite | **The Force** — scaled-load lift ladder | N/kg bodyweight |
| Explosive power | Countermovement jump; Wingate peak | **The Force** — jump and throw block | W/kg |
| Speed | 30 m sprint, timing gates | **The Engine** — sprint block | s |
| Agility | Illinois agility / 505 change-of-direction | Course segment, reactive gates | s |
| Coordination | Bilateral tapping; throw-catch accuracy | **Precision** — moving-target block | hit rate |
| Balance | Y-Balance Test; single-leg posturography | Course segment under load | reach norm. to limb length |
| Accuracy | Projectile / fine-placement task | **Precision** | radial error |
| Mobility | FMS composite; sit-and-reach | Range-of-motion gate on course | screen score |

*Note:* nine dimensions but they collapse substantially. Expect factor analysis to reduce
this to 3–4 (endurance / force-power / control) after season one. Do not defend nine.

### D2 · Cognitive capacity

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Fluid reasoning | Raven's Advanced Progressive Matrices | **The Unknown Rule** — induce a hidden rule from feedback | items / time-to-rule |
| Working memory | Operation span; adaptive n-back | **The Memory Room** — encode and manipulate under interference | span |
| Spatial reasoning | Mental rotation (Vandenberg–Kuse) | **The Labyrinth** — navigate and reconstruct | error / time |
| Processing speed | Choice reaction time; inspection time | Rapid discrimination block | ms |
| Attention / vigilance | Attention Network Test; SART | Signal-in-noise watch | d′ |
| Cognitive flexibility | Task-switching; Wisconsin Card Sorting | **The Reset** — mid-event rule change | switch cost |
| Cognitive endurance | Accuracy slope across a long block | **The Long Game** | slope, not intercept |

*Note:* no IQ test is administered as a competition event. Instruments are for norming and
construct validation only. Competition measures observable cognition under time pressure.

### D3 · Learning and adaptation

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Learning rate | Probabilistic reversal learning | **The Unknown** — an entirely novel skill, scored on improvement | trials-to-criterion |
| Transfer | Near/far transfer paradigm | Second novel task sharing deep structure | transfer gain |
| Rule induction | Artificial grammar learning | **The Unknown Rule** | accuracy on novel items |
| Strategy switching | Reversal after contingency change | **The Reset** | recovery latency |

*Note:* this is the domain most vulnerable to practice effects and therefore the one where
undisclosed event design matters most. Competitors know the capability; never the task.

### D4 · Decision intelligence

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Probabilistic reasoning | Berlin Numeracy Test | **The Market** — bet under stated odds | accuracy |
| Calibration | Brier / log score on forecasts | Forecast ledger across the whole season | Brier |
| Risk posture | Balloon Analogue Risk Task | **The Market** — variance choice under known EV | deviation from EV-optimal |
| Resource allocation | Multi-armed bandit; sequential search | **The Market** | regret vs. optimal |
| Metacognition | Confidence–accuracy resolution | Confidence rating on every scored answer | meta-d′ |

*Note:* Iowa Gambling Task is deliberately excluded — construct validity is contested and
performance confounds learning with risk attitude. Calibration is the strongest single
measure here and the cheapest to run continuously.

### D5 · Social intelligence

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Emotion perception | RMET (see caveat) | Live read of a counterpart's state | accuracy |
| Theory of mind | False-belief / strategic depth games | **The Exchange** — asymmetric information | level-k depth |
| Negotiation | Multi-issue integrative bargaining | **The Exchange** | joint + own surplus |
| Persuasion | Randomised persuasion trial | Argue an assigned position to naive judges | opinion shift |
| Cooperation | Public goods game | **Relay** — rotating teams | contribution profile |
| Team contribution | Marginal effect over rotating teams | All team events | player impact estimate |

*Caveat:* the Reading the Mind in the Eyes Test has documented psychometric weaknesses
and cultural loading. Retained in v0.1 for continuity with the literature, flagged for
replacement. Do not build a scored event on it alone.

### D6 · Emotional and regulatory capacity

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Emotion understanding | MSCEIT (ability EI, not self-report) | — (norming only) | branch score |
| Emotion regulation | Stress-reactivity recovery slope | **Crisis** — perform after adverse news | HRV / performance recovery |
| Impulse control | Delay discounting; go/no-go | Cost-carrying temptation in-event | k parameter |
| Composure | Stroop / fine motor under acute stressor | **Precision** under crowd and clock | performance retention |

*Rule:* no self-report EQ instrument is ever used for scoring. Ability-based only.

### D7 · Creative capability

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Divergent thinking | Alternate Uses Task, CAT-scored | **The Workshop** — ten objects, one problem | originality × usefulness |
| Synthesis | Remote Associates Test | Constraint-combination puzzle | items |
| Invention | Design-build under constraint | **The Workshop** | judged rubric, blinded |
| Improvisation | Constraint removed mid-task | **The Workshop**, phase 2 | adaptation delta |

*Note:* creativity correlates with intelligence at roughly r ≈ .25 — enough overlap to
require partialling, not enough to fold it into D2. Scoring must be blinded and
multi-rater or it becomes a taste contest.

### D8 · Agency under adversity

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Performance retention | Stressed score ÷ baseline score | **Interference** phase, all events | ratio |
| Persistence | Time-to-quit on unsolvable task | Unbounded-effort segment | s |
| Recovery | Return-to-baseline latency | Post-**Crisis** re-test | s |
| Leadership impact | Randomised leader assignment | **Crisis**, rotating command | causal effect on team output |

*Note:* this domain is a **ratio**, not a level. A competitor who scores 92 → 84 under
stress outranks one who scores 97 → 63. That is the philosophical centre of the format
and should be stated as such publicly.

### D9 · Integrity *(new in v0.1)*

Observed prosocial and honest behaviour under real personal cost. Never reputation,
never self-report, never a CV.

| Dimension | Reference instrument | Candidate event | Unit |
|---|---|---|---|
| Honesty under incentive | Die-roll / coin-report paradigm | Unobserved self-reported score | deviation from chance |
| Promise-keeping | Trust game, second mover | **The Exchange** — unenforceable agreements | return rate |
| Costly cooperation | Public goods with punishment | **Relay** | contribution at own cost |
| Third-party enforcement | Third-party punishment game | Response to an observed cheat | cost borne |
| Sacrifice | Own-score-for-teammate choice | Embedded in team events | binary + magnitude |

**Design requirement:** competitors are told at protocol level that conduct is scored
somewhere in the season. They are never told which event is scoring it. Disclose the
first fact publicly; it is the only thing that makes this both ethical and ungameable.

---

## 3. Explicitly excluded, and why

| Excluded | Reason |
|---|---|
| **Personality traits (Big Five)** | Real predictors, but scoring a trait rewards being a type rather than doing a thing. Instead, build conditions where conscientiousness pays, and score the output. |
| **IQ as an administered test** | The construct is used for norming; a sit-down test is not an event and not observable capability. |
| **Inherited wealth, family status** | The largest reservation system in existence. Cannot be trained away in a season. |
| **Achievement record / accolades** | Confounded by opportunity ceiling and by runway (a 34-year-old has nine more years than a 25-year-old). Recast as a *capability* — see **The Venture**, §4 — or held as tiebreak only, with weights published pre-season. |
| **Audience voting** | Measures popularity and camera time. Permitted to select *which* certified-equivalent event runs; never to eliminate or score. |
| **Luck** | Not a stable trait. Belongs in the game architecture as variance management (D4), never in the ontology. |
| **National or regional norming** | A quota wearing a lab coat. Global norms only. |

---

## 4. The Venture

The honest way to measure "built success" without importing biography.

A resourced project, real budget, real deadline, real external deliverable, run across the
qualifying season rather than inside a studio. Scored on what actually ships, judged blind
by domain-external assessors. Loads on D3, D4, D7 and D8 simultaneously.

This measures the capacity to produce impact rather than the accumulated evidence of having
done so — which is age-fair, opportunity-fair, and does not burn the validation programme.

---

## 5. Validation programme — outcomes are held out

Life outcomes are collected with explicit consent and **never enter any score**. They exist
to answer the question that makes this property worth more than a format licence:

> Does Floor-at-27 predict trajectory-at-40?

**Held-out variables:** educational attainment, occupational complexity, income trajectory,
ventures founded and survival, civic and community roles, dependants supported, health span
markers, self-reported life satisfaction, third-party-nominated community impact.

**Study design:** prospective cohort from the open-logging population, re-contacted at
5-year intervals. Pre-register hypotheses and analysis plan before season one closes.

**Why this is the asset:** an index with demonstrated criterion validity can be licensed to
selection contexts — institutions, teams, training programmes. An index with status baked
into it can never demonstrate criterion validity, because the outcome sits inside the
predictor. This is the single strongest reason not to score achievement.

**Season-one analyses to publish regardless of result:** inter-test correlation matrix;
exploratory and confirmatory factor structure; test–retest reliability per domain; ranking
stability under alternative weightings; event-order effects; measurement invariance across
sex, age band and region; variance attributable to chance.

---

## 6. Open problems in v0.1

1. **Measurement invariance is unproven.** Until it is demonstrated across regions and
   language groups, cross-national comparison is not defensible and should not be marketed.
2. **Nine domains is almost certainly too many.** Physical will collapse to 3–4 factors;
   D3 may not separate from D2. Expect v0.2 to be smaller.
3. **Floor is a minimum, so it is a noisy statistic.** One bad day in one domain ends a
   season. Mitigation — best-of-N attempts per domain within a season window — needs
   specifying, and interacts badly with cost of certified venue time.
4. **The final is a single trial and therefore not a precise measurement.** Resolve by
   publishing two things: the season ranking (the reliable instrument) and the world title
   (the single-day outcome). Marathon world record versus Olympic champion.
5. **Integrity events are one-shot by nature.** Reliability will be poor. May need to
   function as a gate (a threshold you must not fall below) rather than a scored domain.
6. **Reference norms inherit the reach of the testing network.** If norms come only from
   people who can reach a certified urban facility in a wealthy country, the percentiles
   are false. Mobile units and a low-equipment protocol variant are a *measurement
   requirement*, not outreach.

---

*v0.1 — expected to be substantially wrong. That is the point of versioning it.*
