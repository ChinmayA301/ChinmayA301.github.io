---
layout: post
title: "Influence Maximization using BO"
subtitle: "What actually decides whether an optimizer beats a heuristic isn't the optimizer — it's the search space you hand it."
date: 2026-02-25
categories: [machine-learning, networks, optimization]
tags: [bayesian-optimization, influence-maximization, independent-cascade, graph-theory]
content_type: "research_study"
content_label: "Research Study"
search_phrase: "Bayesian optimization for influence maximization"
positioning_note: "This is a research-style optimization note, not a deployable social influence product guide."
---

Suppose you get to choose twenty accounts on a social network to plant a
message with, and you want it to spread as far as possible. Which twenty?

The obvious answer is *the twenty with the most reach* — the biggest hubs.
It's a good answer. It's so good that beating it turns out to be surprisingly
hard, and the story of *why* it's hard is more interesting than a clean win
would have been.

This post is a build log for a small, honest experiment: using Bayesian
Optimization (BO) to select seed nodes for influence maximization on a real
network, and discovering — across four attempts — that the thing that
determined success or failure was never the optimizer. It was the shape of the
space I asked it to search. All the code is on
[GitHub](https://github.com/ChinmayA301/blog-artifacts).

## The setup

The graph is the [SNAP Higgs Twitter dataset](https://snap.stanford.edu/data/higgs-twitter.html) —
specifically the **retweet network**, because retweets are the actual mechanism
by which a message diffuses. After reducing to the largest weakly-connected
component we have a directed graph of **223,833 nodes and 308,596 edges**.

Spread is measured with the **Independent Cascade (IC)** model: each newly
activated node gets one chance to activate each of its out-neighbours,
independently, with probability *p*. A "seed set" of *k* = 20 nodes is scored
by the mean number of nodes activated over many Monte Carlo cascades. That
mean is a **noisy, expensive, black-box function** of the seed set — which is
exactly the kind of objective Bayesian Optimization exists for.

The baseline to beat is **top-degree**: just seed the twenty highest
out-degree nodes. Also in the ring: top-PageRank, top-k-core, random seeds,
and **CELF**, the standard lazy-greedy algorithm for influence maximization.

The question: *can BO do better than top-degree, and if so, how?*

## Attempt 1 — Let BO tune a ranking rule

The combinatorial space of 20-node subsets is astronomically large, so the
first, most natural move is not to search nodes directly but to search a
*rule* for ranking them. I gave BO three continuous weights — one each on
normalized out-degree, PageRank, and k-core — and let it optimize the blend.
BO picks weights, the weights rank the nodes, the top twenty become the seed
set, IC scores it.

![Convergence trace: BO vs random search, with top-degree and random-seed reference lines. BO reaches the high-spread region in about seven evaluations; random search takes twenty-plus and plateaus lower.](/assets/blog/bo_convergence.png)
*BO reaches high-spread seeds in far fewer objective evaluations than random search. Bands span min-max over five runs on the real Higgs retweet graph.*

BO worked — in the narrow sense. It converged fast (well inside ten
evaluations, versus twenty-plus for random search) and landed at a spread of
**73.5**, edging past top-degree's **73.4**. Against random seeds (**21.5**),
PageRank (**22.3**), and k-core (**23.1**), everything degree-flavoured wins in
a landslide.

![Horizontal bar chart of expected spread by seeding strategy. BO-optimized and top-degree cluster at the top near 73-74; k-core, PageRank, and random seeds sit far below near 21-23.](/assets/blog/bo_seeding_comparison.png)
*On this graph, out-degree dominates. BO rediscovers that fact rather than beating it.*

But look at what BO actually learned: it put most of its weight on out-degree,
a smaller share on k-core, and essentially zero on PageRank. It didn't *beat* the heuristic — it
**rediscovered** it. The optimizer had been handed a search space whose only
good region was "basically top-degree," and it dutifully found it. That's a
real result about the graph (out-degree carries the diffusion signal here), but
it's not a win for BO. It's BO confirming the baseline.

![Bar chart of the normalized BO-optimal blend: out-degree carries most of the signal, k-core contributes a smaller share, and PageRank contributes almost nothing.](/assets/blog/bo_learned_weights.png)
*The learned ranking rule is interpretable: out-degree carries the diffusion signal, with PageRank effectively ignored.*

## Attempt 2 — Give BO room to be different

If reweighting rankings just recovers top-degree, the problem is that the
design space can't *express* anything top-degree can't. So I widened it. Two
changes: raise the cascade probability to *p* = 0.12 (bigger cascades, so seed
*overlap* starts to matter), and add a **redundancy penalty** — a knob that
discounts a candidate node if it sits near nodes already chosen. Now BO can, in
principle, spread its seeds out to cover different regions of the graph, which
is something a pure ranking cannot do.

This time BO reached **178.2** against top-degree's **174.9**, and beat CELF
(**149.6**) comfortably. I ran a proper significance test — 30 high-precision
estimates per seed set — and the gap held: **+2.5%, p < 0.0001**. A real,
statistically significant win.

![Convergence trace for the stronger design space, where BO converges above top-degree and CELF.](/assets/blog/bo_strong_convergence.png)
*The stronger design space moves BO above top-degree and CELF, but the margin is still modest.*

![Horizontal bar chart showing BO beating top-degree by a small but statistically real margin.](/assets/blog/bo_strong_comparison.png)
*The gain is statistically real, but small: refinement, not a wholesale replacement for the heuristic.*

Except the mechanism wasn't what I'd designed for. BO's winning seed set shared
**18 of 20 nodes** with top-degree, and the seed-region overlap was essentially
identical (0.19 vs 0.20). The redundancy penalty barely fired. BO won by
swapping out two weak hubs for two better-placed ones — **fine-tuning, not
diversity.** The honest headline for attempt 2 is: *a small, real refinement of
top-degree, achieved by sharpening the degree signal rather than by the
mechanism I added.*

![Bar chart showing BO shares 18 of 20 seeds with top-degree and only swaps two nodes.](/assets/blog/bo_strong_mechanism.png)
*The mechanism is honest: BO mostly keeps the top-degree seed set and improves it through two better swaps.*

## Attempt 3 — Take the training wheels off

Fine. If I keep constraining BO to degree-adjacent rules, I'll keep getting
degree-adjacent answers. So attempt 3 removed the crutch entirely: let BO pick
**actual nodes**, with no centrality ranking involved at all.

The trick for making that tractable: embed the candidate nodes into a
6-dimensional space using spectral embedding of the graph (nodes close together
have correlated influence regions), then let BO place twenty "anchor points" in
that space, each decoding to its nearest node. A 120-dimensional continuous
search that can, in principle, land anywhere — including genuinely diverse,
non-obvious seed sets no ranking would ever produce.

It was a decisive failure.

![Grouped bar chart across three experiments. Rule-tuning: top-degree 175, BO 179. Free-node naive: top-degree 176, BO collapses to 91. Free-node constrained: top-degree 175, BO 183. Shared-seed counts annotated inside BO bars: 18/20, 1/20, 14/20.](/assets/blog/bo_freenode_progression.png)
*Same graph, same budget, same objective: three ways of framing the search space, three completely different outcomes.*

Free-node BO collapsed to **91.0** against top-degree's **175.8** — a **48%
loss**, p < 0.0001 in the wrong direction. And here's the twist: it achieved
*exactly the diversity I'd been chasing.* Its seed set shared just **1 of 20**
nodes with top-degree; its influence-region overlap was the lowest of any run
(0.11 vs 0.20). Maximal diversity, minimal spread.

Two things broke it. A 120-dimensional space is far too large for the ~50 noisy
evaluations BO had to work with — it never escaped the region it started in.
And the embedding, left unconstrained, decoded to low-influence peripheral
nodes: BO spread its seeds beautifully across parts of the graph that don't
actually propagate anything. **Diversity for its own sake is worthless if it
means seeding dead ends.**

![Convergence trace of naive free-node BO and random search, both plateauing near 90, far below the top-degree line at 176 and the constrained free-node line at 183.](/assets/blog/bo_freenode_failure.png)
*A 120-D search starves at this evaluation budget: both BO and random search stall near 90, nowhere near the baselines.*

## Attempt 4 — Diversity, but only among nodes that matter

The failure diagnosed the fix. Diversity isn't the problem; *unanchored*
diversity is. So attempt 4 constrained the free-node search to a pool of the
strongest candidate nodes and let BO search for the best *diverse subset* among
them — a compact 12-dimensional space, a redundancy penalty it could tune, and
seeds guaranteed to be high-influence to begin with.

This was the best result of the four: **183.1** against top-degree's **175.2**
— **+4.5%, p < 0.0001** — and this time it earned it honestly. BO's seed set
shared only **14 of 20** nodes with top-degree, meaning it replaced **30%** of
the naive hub picks with better-coordinated ones and came out ahead.

![Bar chart of spread for top-degree, rule-tuning BO, and constrained free-node BO (175, 179, 183), overlaid with a red line showing seed diversity rising from 10% to 30% across the three.](/assets/blog/bo_freenode_synthesis.png)
*The synthesis: the constrained free-node design achieves both the highest diversity and the highest spread, which is the combination the first three attempts each missed.*

Diversity finally paid — because it was diversity *among nodes that can carry a
cascade*, not diversity in the abstract.

## The actual finding

Line the four attempts up and the pattern is unmissable. Same graph. Same
evaluation budget. Same objective function. Same optimizer. The only thing that
changed was the **search space**, and the outcomes ran from a decisive loss to
a decisive win:

| Attempt | Search space | Result vs. top-degree | Seeds shared |
|---|---|---|---|
| 1. Rule-tuning | reweight centralities | +0.1% (ties) | 18 / 20 |
| 2. Stronger rule | + redundancy penalty | +2.5% (refinement) | 18 / 20 |
| 3. Free-node, naive | 120-D embedding | **−48%** | 1 / 20 |
| 4. Free-node, constrained | diverse subset of hubs | **+4.5%** | 14 / 20 |

The lesson I actually take from this is not "Bayesian Optimization beats
top-degree for influence maximization." Sometimes it ties it, once it lost
badly to it, and its best win was a few percent. The lesson is that **the
design of the search space determined everything, and the optimizer determined
almost nothing.** A well-posed space let a generic optimizer find a genuinely
better, more diverse answer. A badly-posed space — even one with strictly more
freedom — sent the same optimizer off a cliff. The freedom to pick any node
(attempt 3) produced a *worse* result than the freedom to pick any weighting
(attempt 1), because freedom without structure is just a bigger haystack.

That's a boring-sounding conclusion and I think it's the correct one. Most of
the leverage in applying optimization to a real problem is upstream of the
optimizer — in how you parameterize the thing you're choosing.

## Honest limitations

A few things I'd want a reader to hold onto before generalizing any of this:

The absolute margins are small. A few percent on one graph at one cascade
probability is not a law of nature; it's a result. The structural finding about
search-space design is what I think travels, not the specific numbers.

The naive free-node failure (attempt 3) is partly a **budget artifact**. With
more objective evaluations, or a smarter embedding, an unconstrained search
might recover some ground. I didn't test that, and I'd be careful claiming
free-node search is inherently doomed — only that at a realistic budget it
starved.

Everything is specific to this graph and *p*. Higher cascade probabilities
change how much seed overlap costs you, which is precisely the regime where
diversity should matter more. A natural next experiment is to sweep *p* and
watch whether the diversity payoff in attempt 4 grows.

And CELF underperforming here (149.6, well below top-degree) is itself a known
practical wrinkle: lazy-greedy marginal gains get noisy under stochastic IC at
this scale. It's a fair baseline, not a strawman, but its weakness on this
graph is a property of the estimator, not evidence that greedy influence
maximization is bad in general.

---

*Code, data provenance, and reproduction steps:*
*[github.com/ChinmayA301/blog-artifacts](https://github.com/ChinmayA301/blog-artifacts).*
*The figures above are generated by the scripts in `virality-bayesian-optimization/charts/`; the experiments that produce their inputs are in `pipeline/`, numbered in run order.*
