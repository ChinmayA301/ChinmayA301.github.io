---
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
---

## Key takeaways

- Most AI advisory tools either dress up generic LLM outputs as “strategic insight” or promise causal math that does not fit the data.
- The Success Directory uses reference-class forecasting and structured heuristic lenses instead of fake IRL or miscalibrated CATE scores.
- The core asset is a curated Decision Pattern Library: 150 hand-reviewed cases with sources, outcomes, and counterfactual signals.
- The output is a Decision Brief: a structured artifact that surfaces the outside view, forces disconfirmation, and names its own uncertainty.
- This is not a replacement for judgment. It is a pressure-test for judgment.

---

## 1) Why Another Decision Tool Is Needed

There is no shortage of frameworks for decision-making.

Business schools teach the 2x2. Consultants sell the decision tree. Coaches talk about “trusting your gut.” And now, every AI assistant will cheerfully generate a “strategic recommendation” if you ask it nicely.

But a persistent gap remains between the tools that exist and the actual experience of a high-stakes, ambiguous decision.

Consider what that experience actually looks like.

You are a founder or GM facing a real fork:

- Do you acquire the smaller competitor before they close their Series B, or do you stay focused?
- Do you sunset the legacy product that still generates 30% of ARR, or do you maintain it and accept the engineering drag?
- Do you hire the expensive operator who has done this before, or the cheaper person who might grow into it?

The standard tools fail in three specific ways.

### They are not contextual

A general framework tells you to “weigh expected value against downside risk.”

That is true and useless simultaneously.

What matters is the pattern of choices like this one, in this market, with this constraint set, and what happened to companies that chose each path.

### They are not honest about uncertainty

LLM advisory outputs use confident, polished prose whether or not the underlying evidence is strong.

The calibration is invisible.

You cannot tell when the model is drawing on 40 well-documented analogues or one half-remembered business article.

### They overvalue the final action

Most data systems, even sophisticated ones, inherit the bias of box scores.

They track what happened at the end — the acquisition closed, the product was sunsetted, the hire was made — without modeling what changed in the structure of the situation before that endpoint.

That is the motivation behind the Success Directory: a Decision Intelligence platform that treats historical decision patterns as the core asset, imposes honest calibration, and is explicit about what the math can and cannot tell you.

---

## 2) The Core Idea

The Success Directory is built on a principle borrowed from Daniel Kahneman and Amos Tversky’s work on the outside view:

> Before trusting your inside view of a decision — your logic, your narrative, your confidence in this specific situation — first look at the reference class.

How often do people in structurally similar situations, making structurally similar choices, succeed?

That reframe changes the problem entirely.

The question is no longer:

> Is my reasoning good?

It becomes:

> What does the distribution of outcomes look like for people who reasoned the same way?

This is what the Success Directory operationalizes:

- A curated **Decision Pattern Library** of roughly 150 historical cases, each with domain, decision type, stated rationale, inferred heuristics, outcomes at 12 and 36 months, counterfactual signals, and sources.
- A **Framer** module that structures a user’s raw description into a typed decision schema.
- A **Retriever** that finds the 5–10 most structurally analogous cases using vector search and domain filtering.
- A **Critic** that applies four Expert Reasoning Lenses in parallel, each with a distinct heuristic posture.
- A **Synthesizer** that assembles the final Decision Brief, including calibration notes and a pre-mortem.

The output is not a score.

It is a structured research artifact the user can interrogate.

---

## 3) Why the Original Technical Framing Does Not Work

The project originated from a research brief that proposed three mathematical engines:

1. **Inverse Reinforcement Learning**, or IRL, to recover the “reward function” of historical leaders.
2. **Conditional Average Treatment Effect**, or CATE, estimation to ground recommendations causally.
3. **Bayesian fusion** of the two posteriors into a unified success probability.

Each of these is a real and powerful technique.

Each fails to fit this problem.

---

### 3.1 MaxEnt IRL on Anecdotes

IRL works when you have dense state-action trajectories from an expert operating in a repeatable environment.

Ziebart et al.’s 2008 formulation assumes you can recover a latent reward function \( R_\theta \) by maximizing:

$$
L(\theta) = \sum_{(\omega, a) \in \mathcal{D}} \log \frac{e^{R_{\theta}(\omega, a)}}{\int e^{R_{\theta}(\omega, a')} da'}
$$

This works beautifully for robot locomotion, game-playing agents, and structured recommendation tasks.

It does not work when the “expert” is Steve Jobs, the “state space” is a business situation described in a biography, and the dataset is 200 documented decisions across a decade.

What you get in practice is not a meaningful \( \theta \).

You get a weight vector that reflects whatever the prompt-engineer emphasized in context selection.

Confirmation bias with a log-partition function attached.

---

### 3.2 CATE on Strategic Decisions

Double Machine Learning and related CATE estimators are the right tool when you have many units — companies, individuals, markets — some of which received a “treatment” and some of which did not, with sufficient overlap for causal identification.

The problem is that strategic business decisions are largely \( n = 1 \).

“Should we acquire Competitor X?” does not have a control group.

There is no population of companies identical to yours in the same week with the same capital position that did not acquire Competitor X.

Even where you can find near-analogues, the unobserved confounders dominate the causal signal:

- internal politics
- customer relationship quality
- team morale
- founder psychology
- market timing
- hidden financing pressure

The honest output of DML on strategic decision data is confidence intervals wide enough to swallow any conclusion.

---

### 3.3 The Bayesian Fusion Equation

The original brief proposed:

$$
P(\text{Success} \mid D, C) \propto P(O \mid D, C)_{\text{Causal}} \times P(D \mid C, \pi_{\text{expert}})_{\text{Instinct}}
$$

The mathematical problem is that the two terms are not conditionally independent given \( C \).

The same context \( C \) drove both the expert’s choice distribution \( \pi_{\text{expert}} \) and the outcome distribution \( O \).

Multiplying them without accounting for this dependence double-counts context.

The product design problem is worse.

Users will read the output number as:

> The AI says I have a 73% chance of success.

That number is epistemically meaningless, but the UI makes it feel authoritative.

This is a failure mode, not a feature.

---

### 3.4 What Replaces Them

| Original proposal | Replacement | Why |
|---|---|---|
| IRL | Heuristic extraction via human + LLM annotation of a closed-vocabulary tag set | Auditable, correctable, and honest about what is known |
| CATE | Reference-class forecasting | Shows empirical distributions without pretending to have causal identification |
| Bayesian fusion | Two-panel output | Separates reference-class base rates from Expert Lens critiques |

The user integrates the evidence.

That is the correct division of labor.

---

## 4) The Decision Pattern Library

The core asset of the Success Directory is not the model.

It is the data.

Every entry in the Decision Pattern Library is a **Case**: a single historical decision, fully sourced, tagged, and reviewed.

The schema captures:

### Decision framing

What was actually being chosen, the alternatives considered, and the stated rationale at the time.

### Inferred heuristics

A closed vocabulary of roughly 40 tags, such as:

- `margin_of_safety`
- `reversibility_first`
- `concentration_bet`
- `optionality_preserve`
- `speed_over_consensus`

Every tag has a two-sentence definition.

New tags require documented justification.

### Outcomes

Narrative outcomes at 12 and 36 months, with an `outcome_label` of:

- `success`
- `mixed`
- `failure`
- `too_early`

### Counterfactual signal

What comparable peers did differently and what happened to them.

This is required.

If it cannot be found, the case is flagged as `uncontrolled` and down-weighted in retrieval.

### Era dependence

Each case is labeled as:

- `high`
- `medium`
- `low`

This captures whether the decision logic depended on a regulatory, capital, or technology environment that has materially shifted.

### Sources

Each case requires a minimum of two sources, with primary sources preferred.

This is enforced at ingestion.

No case is served to users until it carries:

```yaml
review_status: reviewed
reviewed_by: human_reviewer_id
