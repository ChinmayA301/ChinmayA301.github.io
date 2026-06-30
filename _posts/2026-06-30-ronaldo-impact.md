---
layout: post
title: "Cristiano Ronaldo and Portugal: A Data-Driven Look at Impact, Tradeoffs, and the Lazy Myth of Addition by Subtraction"
date: 2026-06-29
author: "Chinmay Arora"

description: "A football analytics research note on Cristiano Ronaldo's impact on Portugal, separating legacy, tactical tradeoffs, pressing decline, xG variance, and cultural influence from lazy narratives about whether Portugal are better without him."
summary: "Cristiano Ronaldo is no longer Portugal's entire tactical system. But the claim that Portugal are simply better without him is statistically weak. This piece uses recent with-vs-without samples, xG context, pressing profiles, shot volume, box-touch behavior, and Portuguese football development indicators to evaluate Ronaldo as what he now is: an elite box-value player with real aging-related tactical costs."
tags: [football-analytics, sports-data-science, portugal, cristiano-ronaldo, expected-goals, tactical-analysis, data-science]
categories: [Sports Analytics, Data Science, Football]
---

# Cristiano Ronaldo and Portugal: A Data-Driven Look at Impact, Tradeoffs, and the Lazy Myth of Addition by Subtraction

There are two bad ways to talk about Cristiano Ronaldo and Portugal.

The first is nostalgia.

Ronaldo is the greatest Portuguese footballer ever, therefore he must still start every major game, play every minute, take every attacking touch, and remain immune from tactical criticism.

That is not analysis.

The second is reactionary “modern football” discourse.

Ronaldo is old, presses less, and did not score at Euro 2024, therefore Portugal are automatically better without him.

That is also not analysis.

The more honest framing is less viral but much more accurate:

> Cristiano Ronaldo is no longer Portugal’s entire attacking system. But the claim that he simply hurts Portugal is statistically weak. He is now a high-value, high-tradeoff player: elite box gravity and shot generation on one side, reduced pressing and repeated mobility on the other.

This post treats the Ronaldo-Portugal debate like a data science and football analytics problem rather than a fan argument.

The core question is not:

> Is Ronaldo still Ronaldo?

He is not. Not in the 2008, 2012, 2016, or even 2018 sense.

The better question is:

> Given Portugal’s current squad, what does Ronaldo still add, what does he now cost, and when does the tradeoff become worth it?

![Forward role quadrant](/assets/blog/forward-role-quadrant.png)

---

## 1. The Baseline Problem: People Compare the Wrong Eras

A common argument against Ronaldo is built by comparing current Portugal with Ronaldo to current Portugal without Ronaldo.

That is useful, but incomplete.

Portugal today have Bruno Fernandes, Bernardo Silva, Vitinha, João Neves, Rafael Leão, Nuno Mendes, Pedro Neto, Gonçalo Ramos, João Félix, Rúben Dias, Diogo Costa, and a much deeper player pool than many previous Portuguese teams.

So when people say “Portugal look better now without Ronaldo,” they are often comparing:

- Ronaldo at age 39–41
- against one of Portugal’s deepest generations ever
- in a tiny sample of games
- often against uneven opposition
- while ignoring the long-run effect Ronaldo had on Portugal’s football identity

That is bad causal framing.

The fairer question has three layers:

1. **Historical impact**: How did Portugal’s international profile change during Ronaldo’s era?
2. **Recent tactical value**: What does Ronaldo still add or subtract in the last 4–6 years?
3. **Role optimization**: Should he start, rotate, or be used situationally?

---

## 2. Portugal’s Historical Success Before and During Ronaldo

Portugal had great footballers before Ronaldo. Eusébio, Luís Figo, Rui Costa, Deco, Fernando Couto, Pauleta, and others were not minor figures.

But Portugal before Ronaldo were not a sustained tournament-winning national team.

During Ronaldo’s senior international era, Portugal became a permanent fixture in major tournaments and won their first senior men’s international trophies.

The senior trophy record is simple:

| Tournament | Portugal Result | Ronaldo Era? |
|---|---:|---:|
| UEFA Euro 2016 | Champions | Yes |
| UEFA Nations League 2019 | Champions | Yes |
| UEFA Nations League 2025 | Champions | Yes |

UEFA lists Portugal as the first two-time UEFA Nations League winner after their 2025 win over Spain, and UEFA’s own record pages place Ronaldo at the center of the country’s modern tournament era. [[1]](#sources-and-further-reading)

That does not mean Ronaldo alone won every trophy. Football is not tennis.

But it does mean this:

> Portugal’s greatest period of senior national-team achievement happened during the Ronaldo era.

That is not a social media opinion. That is the trophy record.

Ronaldo’s individual Portugal record is also structurally abnormal. UEFA’s June 2026 update lists him as the all-time leading scorer in men’s international football, with 143 goals for Portugal. [[2]](#sources-and-further-reading)

From a data standpoint, this matters because it sets the prior.

The prior should not be:

> Ronaldo is old, therefore he must be harmful.

The prior should be:

> Ronaldo has historically generated extreme attacking value for Portugal, but age likely changes the form and cost of that value.

That is the actual research question.

---

## 3. Recent With-vs-Without Ronaldo Data: Useful, but Easy to Abuse

The cleanest current debate is whether Portugal perform better without Ronaldo.

Flashscore’s recent with-vs-without analysis after the 2022 World Cup gives a useful starting point. In matches Ronaldo featured in, Portugal had a reported win rate of 70% and scored 2.2 goals per game. Without Ronaldo, the win rate was 66.6%, while goals per game jumped to 4.8. [[3]](#sources-and-further-reading)

![Portugal with vs without Ronaldo](/assets/blog/with-vs-without-ronaldo.png)

That table looks like this:

| Sample Since 2022 World Cup | Win Rate | Goals Per Game | Interpretation |
|---|---:|---:|---|
| Portugal with Ronaldo | 70.0% | 2.2 | Stable winning, lower goal volume |
| Portugal without Ronaldo | 66.6% | 4.8 | Higher scoring, tiny sample, outlier-sensitive |

A lazy anti-Ronaldo read says:

> Portugal score more without him. Therefore they are better without him.

That is not rigorous.

The without-Ronaldo sample is small. It is heavily influenced by blowout wins. A few high-scoring matches can distort goals per game very quickly. In small samples, goal difference and goals per game are volatile, especially in international football where opponent quality varies sharply.

The better interpretation is:

> Portugal may become more fluid without Ronaldo in some match contexts, but the available with-vs-without sample does not prove they are better overall without him.

This is an important distinction.

The data supports a tactical question.

It does not support a sweeping verdict.

---

## 4. Ronaldo’s Current Player Profile: Box Value, Not Full-Pitch Value

The modern Ronaldo profile is very different from younger Ronaldo.

Younger Ronaldo gave you:

- elite ball carrying
- repeated channel running
- transition speed
- aerial dominance
- one-v-one threat
- long-range shooting
- weak-side finishing
- counterattack carrying
- defensive effort that varied by era and system, but came with more athletic range

Current Ronaldo gives you something narrower:

- penalty-box movement
- high shot volume
- box gravity
- aerial threat
- penalty and set-piece gravity
- experience and dressing-room hierarchy
- finishing volume, though with more tournament variance
- much less pressing and repeat defensive running

That means his value has become more conditional.

He is not a modern all-phase forward in the style of Diogo Jota, Julian Álvarez, Darwin Núñez, Gabriel Jesus, or younger versions of Benzema/Suárez-level connective forwards.

He is now closer to a high-usage penalty-area weapon.

That can still be very valuable.

But it has to be priced correctly.

![Ronaldo tactical tradeoff profile](/assets/blog/ronaldo-tradeoff-profile.png)

---

## 5. Pressing: This Is the Strongest Anti-Ronaldo Argument

If the argument is that Ronaldo is not Portugal’s best pressing forward, the data and eye test agree.

Ronaldo is no longer a high-volume defensive forward. Reuters described Diogo Jota as a modern, high-energy forward suited to intense pressing systems, and that profile is clearly more useful for a team trying to defend from the front. [[4]](#sources-and-further-reading)

In available FotMob World Cup 2026 defensive contribution data, Ronaldo appears with 3 defensive contributions and 1.5 per 90 in the tournament sample. That is not a high defensive workload profile. [[5]](#sources-and-further-reading)

The point is not that Ronaldo does nothing defensively.

The point is that Ronaldo is not the player you choose if your first tactical requirement is front-foot counter-pressing.

A rough role comparison:

| Forward Profile | Pressing Value | Box Value | Transition Running | Best Use |
|---|---:|---:|---:|---|
| Cristiano Ronaldo | Low | High | Medium-low | Low blocks, box service, controlled possession |
| Diogo Jota | High | Medium-high | High | Pressing, chaotic games, second-ball attacks |
| Gonçalo Ramos | Medium | High | Medium | Structured striker role, pressing upgrade over Ronaldo |
| Rafael Leão | Low-medium | Medium-high | High | Open space, counterattack, carrying |
| Pedro Neto | Medium-high | Medium | High | Width, speed, direct transition |

The defensive tradeoff is real.

The mistake is pretending that one tradeoff defines the whole player.

---

## 6. Speed: Max Speed Is Not the Same as Repeat Mobility

A common criticism says Ronaldo is simply slow now.

That is too crude.

Reports from Euro 2024 had Ronaldo reaching a top speed of 32.7 km/h at age 39. [[6]](#sources-and-further-reading)

That is not slow.

But max speed is not the same as football mobility.

The more useful distinction is:

| Speed Concept | What It Measures | Ronaldo Now |
|---|---|---|
| Top speed | Peak sprint velocity in one action | Still surprisingly strong |
| Acceleration frequency | How often a player explodes into runs | Lower than younger forwards |
| Repeat sprint ability | Ability to keep making high-intensity runs | Declining |
| Recovery sprinting | Ability to sprint backward/defensively after attacks | Lower |
| Pressing mobility | Ability to close angles repeatedly | Low |

This is where online debate gets sloppy.

Ronaldo can still hit a sprint.

But Portugal cannot build a 90-minute high-pressing system around his repeated sprint capacity.

That is the actual issue.

---

## 7. Channel Running and Counterattack Value

There is no perfect public metric called “channel runs per 90” for Portugal.

With paid event data from StatsBomb, Wyscout, SkillCorner, or Second Spectrum-style tracking, we would measure:

- runs in behind per 90
- high-speed runs into channels
- off-ball runs creating xThreat
- possessions where Ronaldo’s run displaced a center-back
- counterattack involvements
- box-arrival timing
- receiver vs decoy-run value

Without that, we rely on proxies:

- touches in the opposition box
- total touches
- shots
- dribbles
- progressive carries
- offsides
- shot locations
- transition possessions
- defensive recoveries after attacking runs

Current Ronaldo profiles as a box endpoint, not a transition carrier.

FootyStats’ 2025/26 Ronaldo page lists 161 shots in 30 Saudi Pro League matches, 60 on target, and 28 goals. It also gives him 0.96 goals per 90 and roughly 0.81 non-penalty xG per 90. [[7]](#sources-and-further-reading)

That is high shot and xG volume.

But it does not describe a player carrying Portugal up the pitch in transition.

The current role is clearer:

> Ronaldo is still useful as the final receiver in transition. He is no longer the main transition engine.

That distinction matters.

Rafael Leão, Pedro Neto, João Félix, and historically Jota-like profiles offer more open-field dynamism. Ronaldo offers more box occupation and finishing gravity.

---

## 8. xG and Finishing: Euro 2024 Was Bad, but One Tournament Is Not a Career Model

Euro 2024 is the strongest evidence for the anti-Ronaldo case.

He had 23 shots and zero goals. ESPN noted his scoreless group stage, and public tournament analysis widely reported his finishing underperformance. [[8]](#sources-and-further-reading)

The more aggressive version of the critique is that Ronaldo became a shot sink: Portugal created chances, Ronaldo absorbed shots, and the attack lost efficiency.

That is a valid tournament-level criticism.

But the data science issue is sample size.

Finishing is noisy. xG overperformance or underperformance across five tournament matches is informative, but not definitive.

This is not just a fan excuse. Recent football analytics research has specifically warned that xG-based finishing evaluation is noisy, sample-size sensitive, and affected by model bias. Davis and Robberechts argue that xG models can confound finishing ability, especially when using raw goals-minus-xG as a simple skill measure. [[9]](#sources-and-further-reading)

So the correct conclusion is:

> Ronaldo’s Euro 2024 finishing was poor. But one tournament does not prove permanent finishing collapse.

Season-level numbers still show strong output. In 2025/26 league data, Ronaldo is listed with 28 goals in 30 matches, 161 shots, and 0.96 goals per 90. [[7]](#sources-and-further-reading)

That does not mean Saudi Pro League output transfers perfectly to Portugal at elite tournament level.

It does mean the “he cannot finish anymore” take is too broad.

The more accurate statement is:

> Ronaldo still generates and converts shot volume, but Portugal must manage the risk of him becoming an inefficient shot sink against elite tournament defenses.

![Shot conversion comparison](/assets/blog/shot-conversion-comparison.png)

---

## 9. Shot Conversion and Usage

A high-usage shooter can look inefficient because he absorbs more of the attack.

This matters for Ronaldo because his current attacking value is shot-centric.

Using available public data:

| Player / Sample | Goals | Shots | Approx. Shot Conversion |
|---|---:|---:|---:|
| Cristiano Ronaldo, Saudi Pro League 2025/26 | 28 | 161 | 17.4% |
| Ronaldo, Euro 2024 | 0 | 23 | 0.0% |

The gap is the point.

Ronaldo is not always inefficient.

But when he is inefficient, the cost is large because he takes a lot of shots.

That is the shot-volume risk.

For Portugal, the tactical question becomes:

> Is Ronaldo taking shots that would otherwise fall to Bruno, Bernardo, Leão, Ramos, Jota, Neto, or arriving midfielders in better contexts?

This is where a possession-level model would help.

Standard xG only evaluates shots that happen. It does not fully answer whether Portugal’s possession would have created a better shot with a different forward movement pattern. Recent work on xG+ argues for modeling shot occurrence and shot quality together at the possession level, which is exactly the kind of framework needed here. [[10]](#sources-and-further-reading)

A better Ronaldo evaluation would measure:

- probability Portugal generates a shot with Ronaldo on the pitch
- expected quality of that shot
- who receives the shot
- whether his movement creates shots for others
- whether possessions are being over-funneled into him
- defensive transition cost after failed attacks

That is the real analysis.

Not “0 goals, finished.”

Not “143 Portugal goals, immune.”

---

## 10. Possession Loss: Not the Strongest Criticism

The argument that Ronaldo constantly loses possession is weaker than the pressing argument.

Older forwards who receive high-pressure final-third passes will naturally lose the ball more than midfielders recycling possession. The question is not raw possession lost. The question is:

> Did the loss happen in a valuable attacking context, and was the risk worth the expected reward?

A failed first-time shot from a cross is not the same as a careless midfield turnover.

A mistimed layoff in the box is not the same as losing the ball while Portugal’s fullbacks are both advanced.

For Ronaldo, the better criticism is not “he loses the ball too much.”

The better criticism is:

> His low-touch, high-shot profile means Portugal must get enough value from his final actions to justify the reduced pressing and reduced open-play involvement.

That is a much stronger argument.

---

## 11. The Culture Question: Did Ronaldo Help Produce a Better Portugal?

This is the hardest part to prove causally.

A bad argument would say:

> Ronaldo inspired João Neves, therefore Ronaldo caused Portugal’s new generation.

That is not serious.

Portugal’s talent pipeline is driven by many factors:

- Benfica, Sporting, and Porto academies
- domestic scouting networks
- agent and transfer-market infrastructure
- Champions League exposure
- coaching development
- federation investment
- immigration and diaspora talent flows
- the global commercialization of Portuguese football

But Ronaldo’s cultural effect is still real.

UEFA reported that the Portuguese Football Federation had aimed to grow football participation to 300,000 players by 2024, almost double the 2012 figure. [[11]](#sources-and-further-reading)

That does not prove Ronaldo alone caused participation growth.

But it supports the idea that Portuguese football culture grew significantly during the modern era in which Ronaldo was the country’s global sporting symbol.

The fair version of the claim is:

> Ronaldo was not the sole cause of Portugal’s talent boom. But he became the global proof-of-concept that a Portuguese player could become the face of world football. That matters for aspiration, commercial attention, academy credibility, and national football identity.

The direct causal link is messy.

The ecosystem link is credible.

---

## 12. A Simple Impact Framework

To evaluate Ronaldo now, I would not use one metric.

I would use a role-adjusted impact score.

### Ronaldo Role-Adjusted Impact Index

```text
Ronaldo Impact =
  Box Threat
+ Shot Quality Generated
+ Gravity Created for Teammates
+ Set-Piece / Penalty Value
+ Leadership / Tournament Experience Proxy
- Pressing Cost
- Transition Defense Cost
- Possession Funnel Risk
- Opportunity Cost for Other Forwards
```

More formally:

```text
RAI = β1(Box_xG)
    + β2(Shot_Volume_Adjusted_xG)
    + β3(Gravity_Assist_Proxy)
    + β4(SetPiece_Value)
    + β5(LateGame_Composure_Proxy)
    - β6(Pressing_Deficit)
    - β7(Transition_Exposure)
    - β8(Shot_Funnel_Inefficiency)
    - β9(Replacement_Opportunity_Cost)
```

Where:

- `Box_xG` measures shot quality received inside the box.
- `Shot_Volume_Adjusted_xG` penalizes low-quality shot inflation.
- `Gravity_Assist_Proxy` estimates how often defenders collapse toward Ronaldo and open space elsewhere.
- `Pressing_Deficit` compares him against alternatives like Jota, Ramos, Neto, or Leão.
- `Transition_Exposure` measures how exposed Portugal become after failed attacks.
- `Replacement_Opportunity_Cost` asks what Portugal lose by not using a more mobile forward.

This is the right structure because Ronaldo’s value is not one-dimensional.

---

## 13. Tactical Recommendation: Conditional Deployment

Portugal should not make Ronaldo the default full-game solution.

They also should not discard him for ideological reasons.

The role should be conditional.

![Conditional Ronaldo deployment model](/assets/blog/conditional-deployment-model.png)

### Start Ronaldo When:

- Portugal expect territorial dominance
- the opponent defends in a low or mid block
- Portugal can create wide service
- Bruno and Bernardo can control possession
- Nuno Mendes / Cancelo-style fullback delivery is available
- Portugal need penalty-box occupation
- set pieces are likely to matter
- game state rewards composure and box finishing

### Rotate or Limit Ronaldo When:

- Portugal need intense first-line pressing
- the opponent builds cleanly from the back
- Portugal need constant channel running
- defensive transition risk is high
- the game requires repeated sprint recovery
- Portugal’s attack becomes too predictable through him
- Ramos/Jota/Neto/Leão profiles better match the opponent

This is the serious football answer.

Ronaldo should be treated like a tactical weapon, not a sacred object.

---

## 14. Final Verdict

Cristiano Ronaldo is no longer Portugal’s entire tactical engine.

That era is over.

But the claim that Portugal are simply better without him is not proven by the data. The recent with-vs-without sample is too small, opponent-adjustment matters, and goals-per-game inflation without him is vulnerable to outlier blowouts.

The valid criticism is narrower and stronger:

- Ronaldo presses less than Portugal’s younger alternatives.
- His repeat channel-running is lower.
- His transition carrying is lower.
- His defensive workload is lower.
- His shot volume can become inefficient if Portugal over-service him.
- Euro 2024 was a poor finishing tournament.

But the pro-Ronaldo case is also real:

- He remains an elite box-occupation player.
- He still generates high shot and xG volume.
- He creates defensive gravity.
- He carries set-piece and penalty threat.
- He has historical tournament authority.
- Portugal’s most successful national-team era happened with him as the defining figure.

The best one-line conclusion is this:

> Ronaldo is no longer Portugal’s system. He is a high-leverage attacking module with real defensive and mobility costs. Portugal’s job is not to worship him or discard him. It is to price the tradeoff correctly.

That is where most football discourse fails.

It wants a binary.

The data gives a role optimization problem.

---

## Dashboard Concept

A good dashboard for this analysis should not be a Ronaldo propaganda board.

It should be a balanced decision dashboard with five panels:

### 1. Historical Portugal Impact

Metrics:

- Portugal major trophies before/during Ronaldo
- tournament qualification consistency
- Ronaldo caps and goals
- Portugal Elo/FIFA ranking trend
- major tournament knockout-stage frequency

### 2. Recent With-vs-Without Ronaldo

Metrics:

- win rate
- goals per game
- xG per game
- goals conceded per game
- opponent strength adjustment
- match state adjustment
- sample size warning

### 3. Player Role Comparison

Compare Ronaldo, Ramos, Jota, Leão, Neto, Félix.

Metrics:

- goals/90
- npxG/90
- shots/90
- touches in box/90
- pressures/90
- defensive actions/90
- progressive carries/90
- runs in behind/90 if tracking data is available

### 4. Tactical Tradeoff Panel

Show:

- box threat score
- pressing score
- transition score
- possession fluidity score
- set-piece threat
- replacement opportunity cost

### 5. Matchup Recommendation

For each opponent type:

| Opponent Type | Ronaldo Role |
|---|---|
| Low block | Start / high value |
| Mid block | Conditional start |
| High press elite team | Reduced minutes |
| Portugal chasing late goal | High-value substitute or focal point |
| Portugal defending lead | Lower value unless set-piece threat needed |

---

## Visual Reproduction Script

The visuals in this post were generated using the included `generate_visuals.py` script.

To regenerate the visuals locally:

```bash
python generate_visuals.py
```

The script writes images to:

```text
assets/images/ronaldo-portugal-impact/
```

---

## Sources and Further Reading

1. UEFA — Portugal meet the Nations League winners. <https://www.uefa.com/uefanationsleague/news/0297-1d5ccb0b6747-d10a8fc4eb86-1000--portugal-meet-the-nations-league-winners/>
2. UEFA — Cristiano Ronaldo: all-time leading scorer in men’s international football. <https://www.uefa.com/european-qualifiers/news/026a-1297500e1b34-a17bbbcad258-1000--cristiano-ronaldo-all-time-leading-scorer-in-men-s-interna/>
3. Flashscore — Are Portugal better off without Cristiano Ronaldo? <https://www.flashscore.com/news/soccer-world-cup-are-portugal-better-off-without-cristiano-ronaldo-here-s-what-the-numbers-say/dOPVrBqK/>
4. Reuters — Jota provided blueprint for modern football forward. <https://www.reuters.com/sports/soccer/jota-provided-blueprint-modern-football-forward-2025-07-03/>
5. FotMob — World Cup player defensive contributions. <https://www.fotmob.com/leagues/77/stats/season/24254/players/defensive_contributions/world-cup-players>
6. Reported UEFA Euro 2024 top speed discussion. <https://www.facebook.com/mahifromsideline/posts/according-to-uefa-cristiano-ronaldo-recorded-his-fastest-top-speed-in-the-euros-/493239413229656/>
7. FootyStats — Cristiano Ronaldo player statistics. <https://footystats.org/players/portugal/cristiano-ronaldo>
8. ESPN — Euro 2024 statistics note on Ronaldo’s scoreless group stage. <https://www.espn.com/soccer/story/_/id/40441540/euro-2024-stats-cristiano-ronaldo-zero-group-stage-goals-romelu-lukaku-missed-chances-record>
9. Davis & Robberechts — Biases in Expected Goals Models Confound Finishing Ability. <https://arxiv.org/abs/2401.09940>
10. Pipping, Feng & Sabin — Beyond Expected Goals: A Probabilistic Framework for Shot Occurrences in Soccer. <https://arxiv.org/abs/2512.00203>
11. UEFA — Developing football in Portugal. <https://www.uefa.com/news-media/news/0283-187b3ed7424c-ae2149ccb61a-1000--developing-football-in-portugal/>

## Related Portfolio Directions

- Successful Key Moment Metric: a role-adjusted football metric for judging player impact beyond goals and assists.
- Football Transfer Rumor Tracker: probability-weighted transfer intelligence with tactical-fit simulation.
- Portugal/Ronaldo Dashboard: with-vs-without impact, tactical tradeoff scoring, and role recommendation engine.
