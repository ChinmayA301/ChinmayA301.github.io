
layout: post
title: "The Success Directory: A Decision Intelligence Framework for High-Stakes, Ambiguous Choices"
date: 2026-04-24
author: "Chinmay Arora"
description: "A technical framework for a Decision-as-a-Service platform that helps users navigate ambiguous, high-stakes decisions by surfacing structured reference classes, heuristic lenses, and honest calibration — without the fake math."
summary: "The Success Directory is a proposed Decision Intelligence platform designed to capture the latent heuristics of expert decision-making without overpromising on the math. Rather than using Inverse Reinforcement Learning on anecdotes or running CATE on n=1 strategic choices, it uses reference-class forecasting, a curated Decision Pattern Library, and four Expert Reasoning Lenses to produce a Decision Brief — a pressure-tested artifact that bridges the gap between data and real-world judgment."
categories: [Decision-Intelligence, Data-Science, Applied-Research]
tags: [Decision-Science, Causal-AI, IRL, Reference-Class-Forecasting, Bayesian-Reasoning, LLM-Applications, Strategy, Product-Design]
permalink: /blog/success-directory-decision-intelligence/
canonical_url: "https://app.chinmayarora.com/blog/success-directory-decision-intelligence/"
og_image: "/assets/images/success-directory-cover.png"
image_alt: "Architecture diagram for the Success Directory Decision Intelligence framework linking Framer, Retriever, Critic, and Synthesizer modules."
lang: "en"
reading_time: "12 min"
toc: true
featured: false
draft: false
schema_type: "Article"
keywords: "decision intelligence, decision-as-a-service, reference class forecasting, inverse reinforcement learning, CATE, causal AI, expert heuristics, LLM applications, strategy tool"
last_modified_at: 2026-04-24

Key takeaways

Most AI advisory tools either dress up generic LLM outputs as "strategic insight" or promise causal math that doesn't fit the data.
The Success Directory uses reference-class forecasting and structured heuristic lenses instead of fake IRL or miscalibrated CATE scores.
The core asset is a curated Decision Pattern Library — 150 hand-reviewed cases with sources, outcomes, and counterfactual signals.
The output is a Decision Brief: a structured artifact that surfaces the outside view, forces disconfirmation, and names its own uncertainty.
This is not a replacement for judgment. It is a pressure-test for judgment.


1) Why Another Decision Tool Is Needed
There is no shortage of frameworks for decision-making. Business schools teach the 2x2. Consultants sell the decision tree. Coaches talk about "trusting your gut." And now, every AI assistant will cheerfully generate a "strategic recommendation" if you ask it nicely.
But a persistent gap remains between the tools that exist and the actual experience of a high-stakes, ambiguous decision.
Consider what that experience actually looks like. You are a founder or GM facing a real fork: do you acquire the smaller competitor before they close their Series B, or do you stay focused? Do you sunset the legacy product that still generates 30% of ARR, or do you maintain it and accept the engineering drag? Do you hire the expensive operator who has done this before, or the cheaper person who might grow into it?
The standard tools fail in three specific ways:
They are not contextual. A general framework tells you to "weigh expected value against downside risk." That is true and useless simultaneously. What matters is the pattern of choices like this one, in this market, with this constraint set, and what happened to companies that chose each path.
They are not honest about uncertainty. LLM advisory outputs use confident, polished prose whether or not the underlying evidence is strong. The calibration is invisible. You cannot tell when the model is drawing on 40 well-documented analogues or one half-remembered HBR article.
They overvalue the final action. Most data systems, even sophisticated ones, inherit the bias of box scores. They track what happened at the end — the acquisition closed, the product was sunsetted, the hire was made — without modeling what changed in the structure of the situation before that endpoint.
That is the motivation behind the Success Directory: a Decision Intelligence platform that treats historical decision patterns as the core asset, imposes honest calibration, and is explicit about what the math can and cannot tell you.
2) The Core Idea
The Success Directory is built on a principle borrowed from Daniel Kahneman and Amos Tversky's work on the outside view:
Before trusting your inside view of a decision — your logic, your narrative, your confidence in this specific situation — first look at the reference class. How often do people in structurally similar situations, making structurally similar choices, succeed?
That reframe changes the problem entirely. The question is no longer "is my reasoning good?" It is "what does the distribution of outcomes look like for people who reasoned the same way?"
This is what the Success Directory operationalizes:

A curated Decision Pattern Library of ~150 historical cases, each with domain, decision type, stated rationale, inferred heuristics, outcomes at 12 and 36 months, counterfactual signals, and sources.
A Framer module that structures a user's raw description into a typed decision schema.
A Retriever that finds the 5–10 most structurally analogous cases using vector search and domain filtering.
A Critic that applies four Expert Reasoning Lenses in parallel, each with a distinct heuristic posture.
A Synthesizer that assembles the final Decision Brief, including calibration notes and a pre-mortem.

The output is not a score. It is a structured research artifact the user can interrogate.
3) Why the Original Technical Framing Does Not Work
The project originated from a research brief that proposed three mathematical engines: Inverse Reinforcement Learning (IRL) to recover the "reward function" of historical leaders, Conditional Average Treatment Effect (CATE) estimation to ground recommendations causally, and a Bayesian fusion of the two posteriors into a unified success probability.
Each of these is a real and powerful technique. Each fails to fit this problem.
3.1 MaxEnt IRL on anecdotes
IRL works when you have dense state-action trajectories from an expert operating in a repeatable environment. Ziebart et al.'s 2008 formulation assumes you can recover a latent reward function RθR_\theta
Rθ​ by maximizing:
L(θ)=∑(ω,a)∈Dlog⁡eRθ(ω,a)∫eRθ(ω,a′)da′L(\theta) = \sum_{(\omega, a) \in \mathcal{D}} \log \frac{e^{R_{\theta}(\omega, a)}}{\int e^{R_{\theta}(\omega, a')} da'}L(θ)=(ω,a)∈D∑​log∫eRθ​(ω,a′)da′eRθ​(ω,a)​
This works beautifully for robot locomotion, game-playing agents, and structured recommendation tasks. It does not work when the "expert" is Steve Jobs, the "state space" is a business situation described in a biography, and the dataset is 200 documented decisions across a decade.
What you get in practice is not a meaningful θ\theta
θ. You get a weight vector that reflects whatever the prompt-engineer emphasized in context selection. Confirmation bias with a log-partition function attached.
3.2 CATE on strategic decisions
Double Machine Learning and related CATE estimators are the right tool when you have many units — companies, individuals, markets — some of which received a "treatment" and some of which did not, with sufficient overlap for causal identification.
The problem is that strategic business decisions are largely n=1n=1
n=1. "Should we acquire Competitor X" does not have a control group. There is no population of companies identical to yours in the same week with the same capital position that did not acquire Competitor X.
Even where you can find near-analogues, the unobserved confounders — internal politics, customer relationship quality, team morale, founder psychology — dominate the causal signal. The honest output of DML on strategic decision data is confidence intervals wide enough to swallow any conclusion.
3.3 The Bayesian fusion equation
The original brief proposed:
P(Success∣D,C)∝P(O∣D,C)Causal×P(D∣C,πexpert)InstinctP(\text{Success}|D, C) \propto P(O|D, C)_{\text{Causal}} \times P(D|C, \pi_{\text{expert}})_{\text{Instinct}}P(Success∣D,C)∝P(O∣D,C)Causal​×P(D∣C,πexpert​)Instinct​
The mathematical problem is that the two terms are not conditionally independent given CC
C. The same context CC
C drove both the expert's choice distribution πexpert\pi_{\text{expert}}
πexpert​ and the outcome distribution OO
O. Multiplying them without accounting for this dependence double-counts context.
The product design problem is worse. Users will read the output number as "the AI says I have a 73% chance of success." That number is epistemically meaningless but the UI makes it feel authoritative. This is a failure mode, not a feature.
3.4 What replaces them

IRL → Heuristic extraction via human + LLM annotation of a closed-vocabulary tag set. Auditable. Correctable. Honest about what we know.
CATE → Reference-class forecasting. Show the empirical distribution of outcomes for structurally analogous cases. Report the sample size. Report the confidence interval. Name the weak reference class when it is weak.
Bayesian fusion → Two-panel output. The reference class base rate and the Expert Lens critiques are shown separately. The user integrates them. That is the correct division of labor.

4) The Decision Pattern Library
The core asset of the Success Directory is not the model. It is the data.
Every entry in the Decision Pattern Library is a Case: a single historical decision, fully sourced, tagged, and reviewed. The schema captures:

Decision framing: what was actually being chosen, the alternatives considered, the stated rationale at the time.
Inferred heuristics: a closed vocabulary of ~40 tags (e.g., margin_of_safety, reversibility_first, concentration_bet, optionality_preserve, speed_over_consensus). Every tag has a two-sentence definition. New tags require documented justification.
Outcomes: narrative outcomes at 12 and 36 months, with an outcome_label of success, mixed, failure, or too_early.
Counterfactual signal: what comparable peers did differently and what happened to them. Required. If it cannot be found, the case is flagged as "uncontrolled" and down-weighted in retrieval.
Era dependence: high, medium, or low — whether the decision logic depended on a regulatory, capital, or technology environment that has materially shifted.
Sources: minimum two, primary preferred. Enforced at ingestion.

No case is served to users until it carries review_status: reviewed and a reviewed_by field. The MVP ships with 150 cases. That is not a research program. That is a six-week curation sprint.
5) The Reasoning Loop
Each user request flows through four modules with typed contracts between them.
USER INPUT
  ↓
[FRAMER]    → FramedDecision
  ↓
[RETRIEVER] → ReferenceClass
  ↓
[CRITIC × 4, parallel] → list[LensCritique]
  ↓
[SYNTHESIZER] → DecisionBrief
5.1 Framer
The Framer takes raw user text — one to three paragraphs describing a decision — and structures it into a typed FramedDecision:

choice_being_made: one sentence, binary or small-discrete-set.
alternatives: minimum two, including the status quo.
domain: one of pricing, M&A, market entry, key hire, product sunset, capital allocation.
decision_type: reversible, one-way, or sequential.
time_horizon_months, key_uncertainties, constraints.
user_apparent_leaning: if the user signaled which way they're leaning, captured separately to drive disconfirmation matching.

If the Framer cannot responsibly fill these fields — the user is venting rather than deciding, no clear alternatives exist, the domain is out of scope — it returns a FramerClarification with one to three specific questions. It does not fabricate a framing.
5.2 Retriever
The Retriever embeds context_summary + choice_being_made and runs a cosine search over the Pattern Library via pgvector. It then reranks by domain match and decision type alignment, and penalizes cases with era_dependence: high unless the user's context shares that era's markers.
The output includes a BaseRate: how many cases in the reference class ended in success, mixed, or failure. If fewer than four cases match, weak_reference_class is set to true, and the UI surfaces this prominently. Small evidence should look like small evidence.
5.3 Critic
Four Expert Reasoning Lenses run in parallel, each applying a distinct reasoning template to the framed decision and reference class. The four lenses for v1 cover a deliberate 2×2: (concentrate vs. diversify) × (commit vs. defer).
LensCore questionInspired byMargin-of-SafetyWhat is the worst plausible outcome and can we survive it?Buffett, GrahamReversibilityIs this a one-way door, and have we paid the cost of slowness?BezosConcentrationIf we are right, is the upside large enough to justify a focused bet?Jobs, ThielOptionalityDoes this preserve our ability to respond to information we don't yet have?Taleb
Each lens returns a LensCritique: a verdict (endorses, endorses_with_caveats, rejects, or abstains), three to five sentences of reasoning specific to this decision, and two to three key questions the user can answer in a day. The abstains verdict is explicitly supported — a lens should be allowed to say this decision is not in its domain.
The lenses are reasoning templates, not celebrity impersonations. The system never generates first-person quotes from real people.
5.4 Synthesizer
The Synthesizer assembles the DecisionBrief and runs three calibration checks before returning it:

At least three cases must be cited across all lens critiques.
At least one lens must reference a failure outcome from the reference class.
Pairwise embedding distance between critiques must exceed a threshold — lenses must actually disagree.

If the lenses converge, the Synthesizer re-runs the Critic with a divergence injection prompt. One retry, maximum.
The brief includes a tension_summary — two sentences on where the lenses disagreed and why — and a pre_mortem drawn explicitly from failure cases in the reference class. It also includes calibration_notes: surface-level honesty flags ("reference class contains only 4 cases," "two lenses abstained," "era dependence is high for three retrieved cases").
6) What the Decision Brief Looks Like
A DecisionBrief is not a recommendation. It is a structured pressure-test.
A typical brief for a $14M ARR SaaS company deciding whether to build an enterprise tier might include:

Framed decision: "Whether to commit 25% of engineering capacity over three months to build SOC 2, SSO, and audit-log capabilities in response to three inbound enterprise prospects."
Reference class: 8 analogous cases, 3 success, 2 mixed, 3 failure. Base rate: 43% unambiguous success among decided cases.
Margin-of-Safety lens: endorses_with_caveats. The build itself is rarely what sinks companies in this reference class — the second and third quarters of unscoped enterprise work that follows is.
Reversibility lens: endorses. The initial commitment is two-way if scope is capped. The cultural drift toward enterprise is not.
Concentration lens: rejects. Three inbound asks is signal, not demand density. The upside case requires assumptions that the reference class does not support.
Optionality lens: endorses_with_caveats. A lightweight compliance partnership preserves more future optionality than a full build at this stage.
Tension: Reversibility and Optionality diverge on whether a partnership approach is viable at this company's stage.
Pre-mortem: The three most common failure patterns in the reference class are scope creep post-launch, sales team expectations diverging from product reality, and runway compression from deal length extension.
Calibration note: Reference class is borderline (8 cases); Concentration lens assigned low confidence.

The user does not receive a probability of success. They receive the structure of the problem, the honest evidence base, and the strongest arguments from four distinct postures.
7) Guardrails and Honest Limitations
The same intellectual honesty that drove the mathematical corrections applies to the product design.
7.1 Survivorship in the case library
Every case in the library requires a counterfactual signal: what did a comparable organization do differently, and what happened? Without this, the library systematically overrepresents the logic of people who succeeded, because those are the people who wrote books and gave interviews.
7.2 Non-stationarity
Cases tagged era_dependence: high are down-weighted in retrieval unless the user's context shares that era's markers. A 19th-century resource consolidation strategy is not a reference class for a 2026 SaaS pricing decision.
7.3 Selection bias transparency
The brief always shows the reference class size. If only two cases matched, the user sees "2 cases." There is no algorithmic smoothing to make thin evidence look thick.
7.4 No outsourced thinking
The UI requires users to write their own decision rationale before they see the brief. You cannot receive the analysis without first articulating your own view. This is not a UX friction point. It is the most important feature.
7.5 Attribution is hard
Football analytics learned this. A high-value action in a possession sequence is often created by earlier positioning, movement, and spacing that never appears in an event log. Strategic decisions have the same problem. The person who made the final call was standing on the reasoning of six other people. The Success Directory is honest that it can evaluate the decision as documented — it cannot fully attribute credit.
8) The Evaluation Architecture
Most AI advisory tools have no evaluation strategy beyond "users seem to like it." That is insufficient and, in the specific case of decision tools, potentially dangerous.
The Success Directory ships with three evaluation layers from day one.
Process evals run on every commit. They check that the Framer produces valid typed output for 90%+ of test inputs, that the Retriever finds at least four cases for 90%+ of decisions, that lens critiques are genuinely divergent, that cited case IDs actually exist in the database, and that the API meets latency and cost budgets.
Decision-quality evals run weekly. Five human reviewers score ten anonymized briefs on steelmanning, reference-class fit, heuristic specificity, and calibration — each on a 1–5 rubric. The target is median ≥ 4 by week six. Inter-rater agreement is tracked.
Outcome tracking is optional and long-horizon. Users self-report what they chose and how it went at 90, 180, and 365 days. We do not publish aggregated success rates as evidence the tool works. We use the data to find briefs that missed obvious risks, to grow the case library, and to detect quality drift over time.
There is one explicit anti-goal: we do not optimize for user satisfaction. Users tend to like flattering advice. The Success Directory is specifically designed to produce the opposite.
9) The Modeling Pipeline
A production implementation has four layers of increasing power.
Layer 1 uses event-style data — the typed fields in the Case schema — to create a first approximation of the reference class and heuristic tags.
Layer 2 integrates possession-value-style reasoning: transition probabilities across phases of a decision, not just final outcomes. This is analogous to how xT and VAEP improved on raw event counts in football by modeling the probability of eventually reaching a valuable terminal state.
Layer 3 adds context pressure modeling. What constraints were actually binding? What was the competitive tempo? This is where tracking-level data would unlock significant additional value — and where, as in football analytics, the gap between public-data and tracking-data capability is largest.
Layer 4 introduces role-aware normalization: the reference class retrieval accounts for the user's specific organizational role, capital structure, and market position, not just the surface domain of the decision.
The MVP ships Layer 1 with a rigorous version of Layer 2. Layers 3 and 4 are defined, scoped, and parked for Phase 3.
10) Why This Matters
Decision-making tools have failed in the same way that football metrics failed for a decade: by measuring what is easy to measure rather than what matters.
Goals and assists have always been the dominant football currency because they are visible, attributable, and final. But the midfielder who breaks the defensive press in the 71st minute to release a counterattack, the center-back who steps three meters into space to compress the opposition's passing window — these are often the decisive moments in the structure of a match, invisible to the box score.
Strategic decisions have the same problem. The acquisition that transformed a company was usually preceded by a dozen quieter decisions about capital allocation, product discipline, and organizational design that made it possible. The obvious move gets the credit; the enabling moves do not.
The Success Directory is an attempt to move from:

final action to action chain
outcome to expected value shift under uncertainty
confident recommendation to calibrated evidence surface
stat line to match reality

The hardest thing to design in a decision tool is not the math. It is the honesty. Telling a user "your reference class has four cases and two of your four lenses abstained" is less satisfying than a clean 74% success probability. It is also true.
A great decision tool should not flatten judgment into numbers. It should make the numbers worthy of the judgment.
11) Future Directions
The most interesting extensions to the current framework would include:

Graph-based influence modeling: attributing decision credit across the chain of enabling choices, not only the terminal action.
Role-conditioned sequence models: retrieving reference cases conditioned on organizational structure and capital stage, not just decision domain.
Momentum-sensitive context weighting: decisions made under capital pressure, competitive acceleration, or team-composition instability require different reference class filtering.
Off-action credit assignment: capturing the influence of decisions not made — the competitor not acquired, the product not launched, the hire not made — using counterfactual simulation where data supports it.
Real-time brief overlays: a lightweight version usable in board meetings or investor conversations to surface reference-class patterns in real time.
Style clustering by heuristic signature: grouping decision-makers not by industry but by revealed heuristic weight — a way to ask "who else has made decisions with this pattern, and what happened to them?"

12) Final Thought
The original research brief that drove this project ended with the right question: does the math align with the data infrastructure, or should we focus more on the causal graph design for specific industry use cases?
The honest answer is neither. The math was too ambitious for the available data. The causal graph is a valuable eventual direction but not the right first problem.
The right first problem is the library. One hundred and fifty well-sourced, honestly tagged, counterfactual-anchored cases — reviewed by a human before they ship — are worth more than any model applied to poorly curated data.
The moat in decision intelligence is not the algorithm. It is the quality of the patterns you have collected, the rigor with which you have documented what happened and why, and the discipline to say "we don't know" when the evidence is thin.
That is the real intelligence the Success Directory is trying to build.
Related Work

SKM: A Football Metric for Real Match Influence
Severance-Style Segmentation and Geo-Visualization
Interactive Cultural Timeline Map

References / Further Directions

Reference-class forecasting literature (Kahneman, Lovallo, Flyvbjerg)
MaxEnt IRL: Ziebart et al. 2008, Maximum Entropy Inverse Reinforcement Learning
Double Machine Learning: Chernozhukov et al. 2018
Possession value and expected threat frameworks in sports analytics (xT, VAEP, OBV)
Structural Causal Models: Pearl, Causality (2009)
Decision provenance and outcome-oriented evaluation in applied ML
