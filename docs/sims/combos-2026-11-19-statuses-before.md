# The combo sweep (2026-11-19-statuses-before)

`node scripts/sim-combos.mjs 10 20 2026-11-19-statuses-before`. Real fight code, hands-off, no call-ins. Measurement only: nothing here changes a rule, a number or a word, and nothing is tuned.

- **Builds swept:** 6 (moves: none, Ricochet; payloads: none, Cytotoxic Vector, Contagion Vector), so 21 rows: the baseline, each build alone (on the best combat runner) and every unordered pair (the first build on the best, the second on the next best).
- **Crews:** 10 grown from the toughness sim's `crewOf` (4 to 6 runners), 20 fights a crew a job, on 2 jobs: warehouse (docks, threat 4); data_pull (heights, threat 3). Every row plays the same seeds.
- **Mixes:** the job's own, armoured, swarm, synthetic, mixed (armoured: two police, two secforce and two drones, one plate each, as the owner counts drones armoured from 2026-11-19; swarm: six hired; synthetic: five drones, immune to the Vectors; mixed: the job's own plus two drones and two corp).
- **Thresholds:** far stronger = clean win more than 15 points above the no-build row on the same mix and risk; worse = more than 3 points below it. Clean win = won with nobody down.
- **Fights played:** 126000.

## Flags

- FAR STRONGER: **Ricochet + Contagion Vector** on armoured, steady: clean win 44% against 24% with no build (+19 points).
- FAR STRONGER: **Cytotoxic Vector | Ricochet + Contagion Vector** on armoured, steady: clean win 45% against 24% with no build (+20 points).
- FAR STRONGER: **Contagion Vector | Contagion Vector** on armoured, steady: clean win 40% against 24% with no build (+16 points).
- FAR STRONGER: **Contagion Vector | Ricochet + Contagion Vector** on armoured, steady: clean win 46% against 24% with no build (+22 points).
- FAR STRONGER: **Ricochet | Ricochet** on armoured, steady: clean win 44% against 24% with no build (+19 points).
- FAR STRONGER: **Ricochet | Ricochet + Cytotoxic Vector** on armoured, steady: clean win 50% against 24% with no build (+25 points).
- FAR STRONGER: **Ricochet | Ricochet + Contagion Vector** on armoured, steady: clean win 59% against 24% with no build (+35 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector** on armoured, steady: clean win 53% against 24% with no build (+29 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector** on armoured, steady: clean win 60% against 24% with no build (+36 points).
- FAR STRONGER: **Ricochet + Contagion Vector | Ricochet + Contagion Vector** on armoured, steady: clean win 62% against 24% with no build (+38 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Ricochet + Contagion Vector** on swarm, steady: clean win 83% against 60% with no build (+23 points).
- FAR STRONGER: **Cytotoxic Vector | Ricochet + Cytotoxic Vector** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Cytotoxic Vector | Ricochet + Contagion Vector** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Contagion Vector | Contagion Vector** on swarm, steady: clean win 76% against 60% with no build (+16 points).
- FAR STRONGER: **Contagion Vector | Ricochet + Cytotoxic Vector** on swarm, steady: clean win 79% against 60% with no build (+19 points).
- FAR STRONGER: **Contagion Vector | Ricochet + Contagion Vector** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Ricochet | Ricochet** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Ricochet | Ricochet + Cytotoxic Vector** on swarm, steady: clean win 87% against 60% with no build (+27 points).
- FAR STRONGER: **Ricochet | Ricochet + Contagion Vector** on swarm, steady: clean win 90% against 60% with no build (+30 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector** on swarm, steady: clean win 90% against 60% with no build (+29 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector** on swarm, steady: clean win 92% against 60% with no build (+32 points).
- FAR STRONGER: **Ricochet + Contagion Vector | Ricochet + Contagion Vector** on swarm, steady: clean win 95% against 60% with no build (+35 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector** on synthetic, steady: clean win 82% against 67% with no build (+15 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector** on synthetic, steady: clean win 82% against 67% with no build (+15 points).
- FAR STRONGER: **Ricochet + Contagion Vector | Ricochet + Contagion Vector** on synthetic, steady: clean win 82% against 67% with no build (+15 points).
- FAR STRONGER: **Ricochet | Ricochet + Contagion Vector** on mixed, steady: clean win 22% against 3% with no build (+19 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector** on mixed, steady: clean win 21% against 3% with no build (+18 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector** on mixed, steady: clean win 23% against 3% with no build (+20 points).
- FAR STRONGER: **Ricochet + Contagion Vector | Ricochet + Contagion Vector** on mixed, steady: clean win 24% against 3% with no build (+21 points).
- FAR STRONGER: **Ricochet + Contagion Vector** on armoured, committed: clean win 45% against 24% with no build (+21 points).
- FAR STRONGER: **Cytotoxic Vector | Ricochet + Contagion Vector** on armoured, committed: clean win 46% against 24% with no build (+22 points).
- FAR STRONGER: **Contagion Vector | Contagion Vector** on armoured, committed: clean win 40% against 24% with no build (+16 points).
- FAR STRONGER: **Contagion Vector | Ricochet + Cytotoxic Vector** on armoured, committed: clean win 39% against 24% with no build (+15 points).
- FAR STRONGER: **Contagion Vector | Ricochet + Contagion Vector** on armoured, committed: clean win 48% against 24% with no build (+23 points).
- FAR STRONGER: **Ricochet | Ricochet** on armoured, committed: clean win 44% against 24% with no build (+20 points).
- FAR STRONGER: **Ricochet | Ricochet + Cytotoxic Vector** on armoured, committed: clean win 50% against 24% with no build (+26 points).
- FAR STRONGER: **Ricochet | Ricochet + Contagion Vector** on armoured, committed: clean win 58% against 24% with no build (+34 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector** on armoured, committed: clean win 53% against 24% with no build (+29 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector** on armoured, committed: clean win 60% against 24% with no build (+35 points).
- FAR STRONGER: **Ricochet + Contagion Vector | Ricochet + Contagion Vector** on armoured, committed: clean win 62% against 24% with no build (+38 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Cytotoxic Vector | Ricochet + Cytotoxic Vector** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Cytotoxic Vector | Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Contagion Vector | Contagion Vector** on swarm, committed: clean win 79% against 63% with no build (+16 points).
- FAR STRONGER: **Contagion Vector | Ricochet + Cytotoxic Vector** on swarm, committed: clean win 81% against 63% with no build (+18 points).
- FAR STRONGER: **Contagion Vector | Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+22 points).
- FAR STRONGER: **Ricochet | Ricochet** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Ricochet | Ricochet + Cytotoxic Vector** on swarm, committed: clean win 88% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet | Ricochet + Contagion Vector** on swarm, committed: clean win 91% against 63% with no build (+29 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector** on swarm, committed: clean win 91% against 63% with no build (+28 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector** on swarm, committed: clean win 93% against 63% with no build (+31 points).
- FAR STRONGER: **Ricochet + Contagion Vector | Ricochet + Contagion Vector** on swarm, committed: clean win 96% against 63% with no build (+33 points).
- FAR STRONGER: **Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Cytotoxic Vector | Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Contagion Vector | Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+16 points).
- FAR STRONGER: **Ricochet | Ricochet + Contagion Vector** on mixed, committed: clean win 23% against 3% with no build (+19 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector** on mixed, committed: clean win 21% against 3% with no build (+18 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector** on mixed, committed: clean win 24% against 3% with no build (+21 points).
- FAR STRONGER: **Ricochet + Contagion Vector | Ricochet + Contagion Vector** on mixed, committed: clean win 26% against 3% with no build (+23 points).

Deaths on cautious or steady: **none** (every combination, every mix, both risks).

## Each piece's own counts (committed, summed over every row that holds it)

| Piece | the job's own | armoured | swarm | synthetic | mixed |
| --- | --- | --- | --- | --- | --- |
| Ricochet | 22774 | 23019 | 24288 | 25002 | 21301 |
| Cytotoxic Vector | 8208 | 5873 | 7254 | 11500 | 8552 |
| Contagion Vector | 9979 | 11907 | 16177 | 11677 | 14167 |

A count is the piece's own lines: a move's bounces, a payload's infects and spreads (and the shrugs a machine gives it).

## the job's own, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 87% | 86% | 0.15 | 0% | 6.0 | 47 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 90% | 89% | 0.12 | 0% | 6.0 | 45 | 0.00 | 0.87 | 0.00 | 0.31 |
| Contagion Vector | 400 | 91% | 89% | 0.12 | 0% | 5.9 | 42 | 0.00 | 0.76 | 0.67 | 0.31 |
| Ricochet | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 32 | 2.73 | 1.63 | 0.00 | 0.52 |
| Ricochet + Contagion Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 1.41 | 0.58 | 0.52 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 90% | 89% | 0.12 | 0% | 5.9 | 42 | 0.00 | 1.76 | 0.00 | 0.48 |
| Cytotoxic Vector | Contagion Vector | 400 | 91% | 89% | 0.12 | 0% | 5.8 | 41 | 0.00 | 1.56 | 0.59 | 0.49 |
| Cytotoxic Vector | Ricochet | 400 | 89% | 89% | 0.11 | 0% | 5.8 | 34 | 2.73 | 0.82 | 0.00 | 0.14 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 92% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 2.37 | 0.00 | 0.68 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 30 | 2.73 | 2.08 | 0.52 | 0.68 |
| Contagion Vector | Contagion Vector | 400 | 92% | 91% | 0.09 | 0% | 5.8 | 40 | 0.00 | 1.43 | 1.05 | 0.49 |
| Contagion Vector | Ricochet | 400 | 90% | 90% | 0.10 | 0% | 5.8 | 33 | 2.73 | 0.75 | 0.59 | 0.14 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 92% | 92% | 0.08 | 0% | 5.8 | 30 | 2.73 | 2.16 | 0.36 | 0.68 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 92% | 91% | 0.09 | 0% | 5.8 | 30 | 2.73 | 1.98 | 0.70 | 0.68 |
| Ricochet | Ricochet | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 27 | 5.30 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 95% | 95% | 0.06 | 0% | 5.7 | 25 | 5.29 | 1.08 | 0.00 | 0.46 |
| Ricochet | Ricochet + Contagion Vector | 400 | 95% | 95% | 0.06 | 0% | 5.7 | 25 | 5.29 | 0.93 | 0.59 | 0.46 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 96% | 96% | 0.04 | 0% | 5.7 | 24 | 5.30 | 2.46 | 0.00 | 0.78 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 96% | 95% | 0.05 | 0% | 5.6 | 24 | 5.30 | 2.28 | 0.29 | 0.78 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 96% | 96% | 0.04 | 0% | 5.6 | 23 | 5.30 | 2.09 | 0.58 | 0.78 |

## armoured, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 43% | 24% | 1.34 | 0% | 5.8 | 134 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 46% | 27% | 1.23 | 0% | 5.7 | 132 | 0.00 | 0.47 | 0.00 | 0.19 |
| Contagion Vector | 400 | 52% | 35% | 0.98 | 0% | 5.7 | 125 | 0.00 | 0.41 | 1.15 | 0.21 |
| Ricochet | 400 | 43% | 30% | 1.18 | 0% | 5.6 | 120 | 2.74 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 48% | 35% | 0.99 | 0% | 5.5 | 115 | 2.74 | 0.76 | 0.00 | 0.57 |
| Ricochet + Contagion Vector | 400 | 55% | 44% | 0.75 | 0% | 5.4 | 105 | 2.74 | 0.65 | 1.67 | 0.61 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 47% | 30% | 1.17 | 0% | 5.7 | 130 | 0.00 | 0.82 | 0.00 | 0.32 |
| Cytotoxic Vector | Contagion Vector | 400 | 52% | 37% | 0.94 | 0% | 5.6 | 124 | 0.00 | 0.73 | 1.14 | 0.36 |
| Cytotoxic Vector | Ricochet | 400 | 44% | 31% | 1.13 | 0% | 5.5 | 119 | 2.74 | 0.31 | 0.00 | 0.14 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 48% | 36% | 0.96 | 0% | 5.4 | 113 | 2.74 | 1.06 | 0.00 | 0.72 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 55% | 45% | 0.73 | 0% | 5.4 | 105 | 2.74 | 0.90 | 1.63 | 0.77 |
| Contagion Vector | Contagion Vector | 400 | 56% | 40% | 0.80 | 0% | 5.5 | 119 | 0.00 | 0.67 | 1.70 | 0.37 |
| Contagion Vector | Ricochet | 400 | 47% | 35% | 0.98 | 0% | 5.4 | 114 | 2.74 | 0.28 | 0.54 | 0.14 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 50% | 38% | 0.85 | 0% | 5.3 | 110 | 2.74 | 1.01 | 0.45 | 0.73 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 56% | 46% | 0.69 | 0% | 5.4 | 104 | 2.74 | 0.88 | 1.78 | 0.77 |
| Ricochet | Ricochet | 400 | 53% | 44% | 0.81 | 0% | 5.5 | 103 | 5.22 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 58% | 50% | 0.62 | 0% | 5.4 | 97 | 5.26 | 0.78 | 0.00 | 0.55 |
| Ricochet | Ricochet + Contagion Vector | 400 | 66% | 59% | 0.46 | 0% | 5.4 | 90 | 5.32 | 0.69 | 1.53 | 0.56 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 60% | 53% | 0.55 | 0% | 5.3 | 93 | 5.28 | 1.57 | 0.00 | 0.99 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 67% | 60% | 0.44 | 0% | 5.4 | 89 | 5.33 | 1.39 | 1.43 | 1.04 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 68% | 62% | 0.41 | 0% | 5.4 | 87 | 5.35 | 1.27 | 2.01 | 1.09 |

## swarm, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 69% | 60% | 0.56 | 0% | 5.8 | 90 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 71% | 65% | 0.46 | 0% | 5.7 | 86 | 0.00 | 0.70 | 0.00 | 0.07 |
| Contagion Vector | 400 | 76% | 71% | 0.35 | 0% | 5.7 | 80 | 0.00 | 0.65 | 1.81 | 0.09 |
| Ricochet | 400 | 74% | 71% | 0.36 | 0% | 5.7 | 71 | 2.85 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 80% | 78% | 0.24 | 0% | 5.6 | 61 | 2.85 | 1.69 | 0.00 | 0.11 |
| Ricochet + Contagion Vector | 400 | 84% | 83% | 0.17 | 0% | 5.5 | 54 | 2.85 | 1.33 | 2.82 | 0.12 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 72% | 67% | 0.40 | 0% | 5.7 | 83 | 0.00 | 1.48 | 0.00 | 0.13 |
| Cytotoxic Vector | Contagion Vector | 400 | 77% | 72% | 0.30 | 0% | 5.6 | 78 | 0.00 | 1.39 | 1.77 | 0.15 |
| Cytotoxic Vector | Ricochet | 400 | 75% | 72% | 0.34 | 0% | 5.6 | 69 | 2.85 | 0.66 | 0.00 | 0.07 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 80% | 78% | 0.23 | 0% | 5.6 | 60 | 2.85 | 2.32 | 0.00 | 0.17 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 84% | 83% | 0.17 | 0% | 5.5 | 54 | 2.85 | 1.91 | 2.77 | 0.18 |
| Contagion Vector | Contagion Vector | 400 | 80% | 76% | 0.24 | 0% | 5.6 | 73 | 0.00 | 1.28 | 2.75 | 0.17 |
| Contagion Vector | Ricochet | 400 | 76% | 74% | 0.29 | 0% | 5.6 | 66 | 2.85 | 0.60 | 1.01 | 0.06 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 81% | 79% | 0.21 | 0% | 5.5 | 59 | 2.85 | 2.14 | 0.82 | 0.18 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 84% | 83% | 0.17 | 0% | 5.5 | 53 | 2.85 | 1.84 | 2.95 | 0.19 |
| Ricochet | Ricochet | 400 | 85% | 83% | 0.18 | 0% | 5.7 | 54 | 5.75 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 88% | 87% | 0.14 | 0% | 5.7 | 49 | 5.72 | 1.37 | 0.00 | 0.10 |
| Ricochet | Ricochet + Contagion Vector | 400 | 91% | 90% | 0.10 | 0% | 5.7 | 44 | 5.67 | 1.05 | 2.52 | 0.10 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 90% | 90% | 0.10 | 0% | 5.6 | 46 | 5.71 | 2.95 | 0.00 | 0.26 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 93% | 92% | 0.08 | 0% | 5.6 | 42 | 5.66 | 2.42 | 2.33 | 0.28 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 96% | 95% | 0.05 | 0% | 5.7 | 39 | 5.62 | 2.09 | 3.24 | 0.30 |

## synthetic, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 71% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.28 | 0.00 | 1.22 |
| Contagion Vector | 400 | 72% | 68% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.28 | 0.05 | 1.22 |
| Ricochet | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 74% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.38 | 0.00 | 2.74 |
| Ricochet + Contagion Vector | 400 | 74% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.37 | 0.05 | 2.74 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 81 | 0.00 | 0.55 | 0.00 | 2.10 |
| Cytotoxic Vector | Contagion Vector | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 81 | 0.00 | 0.55 | 0.04 | 2.10 |
| Cytotoxic Vector | Ricochet | 400 | 74% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.25 | 0.00 | 0.69 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 75% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.59 | 0.00 | 3.25 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 75% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.59 | 0.05 | 3.25 |
| Contagion Vector | Contagion Vector | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 81 | 0.00 | 0.54 | 0.06 | 2.10 |
| Contagion Vector | Ricochet | 400 | 74% | 71% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.24 | 0.05 | 0.69 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 75% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.58 | 0.05 | 3.25 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 75% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.57 | 0.08 | 3.25 |
| Ricochet | Ricochet | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 57 | 5.93 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 82% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.41 | 0.00 | 2.06 |
| Ricochet | Ricochet + Contagion Vector | 400 | 82% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.41 | 0.07 | 2.06 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 83% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.89 | 0.00 | 3.78 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 83% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.87 | 0.07 | 3.78 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 84% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.84 | 0.13 | 3.78 |

## mixed, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 16% | 3% | 1.83 | 0% | 4.4 | 135 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 17% | 3% | 1.78 | 0% | 4.4 | 134 | 0.00 | 0.52 | 0.00 | 0.36 |
| Contagion Vector | 400 | 20% | 5% | 1.66 | 0% | 4.3 | 131 | 0.00 | 0.45 | 0.93 | 0.37 |
| Ricochet | 400 | 25% | 9% | 1.48 | 0% | 4.4 | 125 | 2.60 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 27% | 13% | 1.30 | 0% | 4.4 | 120 | 2.60 | 1.42 | 0.00 | 1.02 |
| Ricochet + Contagion Vector | 400 | 30% | 17% | 1.19 | 0% | 4.4 | 115 | 2.60 | 1.11 | 1.62 | 1.03 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 19% | 4% | 1.69 | 0% | 4.3 | 131 | 0.00 | 1.02 | 0.00 | 0.55 |
| Cytotoxic Vector | Contagion Vector | 400 | 22% | 6% | 1.59 | 0% | 4.3 | 129 | 0.00 | 0.92 | 0.86 | 0.56 |
| Cytotoxic Vector | Ricochet | 400 | 25% | 10% | 1.44 | 0% | 4.4 | 124 | 2.60 | 0.32 | 0.00 | 0.12 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 27% | 14% | 1.28 | 0% | 4.4 | 120 | 2.60 | 1.71 | 0.00 | 1.11 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 29% | 17% | 1.19 | 0% | 4.4 | 115 | 2.60 | 1.36 | 1.58 | 1.13 |
| Contagion Vector | Contagion Vector | 400 | 23% | 6% | 1.51 | 0% | 4.3 | 127 | 0.00 | 0.84 | 1.43 | 0.57 |
| Contagion Vector | Ricochet | 400 | 26% | 11% | 1.39 | 0% | 4.4 | 123 | 2.60 | 0.28 | 0.61 | 0.12 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 28% | 14% | 1.27 | 0% | 4.5 | 119 | 2.60 | 1.58 | 0.52 | 1.12 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 30% | 17% | 1.18 | 0% | 4.5 | 115 | 2.60 | 1.32 | 1.70 | 1.13 |
| Ricochet | Ricochet | 400 | 24% | 14% | 1.36 | 0% | 4.4 | 117 | 4.60 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 29% | 18% | 1.21 | 0% | 4.4 | 112 | 4.69 | 1.16 | 0.00 | 0.85 |
| Ricochet | Ricochet + Contagion Vector | 400 | 33% | 22% | 1.06 | 0% | 4.3 | 107 | 4.73 | 0.91 | 1.53 | 0.86 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 31% | 21% | 1.09 | 0% | 4.3 | 108 | 4.70 | 2.25 | 0.00 | 1.39 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 34% | 23% | 0.99 | 0% | 4.4 | 105 | 4.74 | 1.86 | 1.32 | 1.41 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 35% | 24% | 0.95 | 0% | 4.3 | 104 | 4.75 | 1.65 | 1.86 | 1.43 |

## the job's own, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 97% | 86% | 0.27 | 1% | 6.5 | 53 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 99% | 89% | 0.18 | 1% | 6.3 | 49 | 0.00 | 0.92 | 0.00 | 0.31 |
| Contagion Vector | 400 | 99% | 90% | 0.17 | 0% | 6.2 | 46 | 0.00 | 0.79 | 0.70 | 0.32 |
| Ricochet | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.79 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.19 | 0% | 6.2 | 38 | 2.79 | 1.68 | 0.00 | 0.53 |
| Ricochet + Contagion Vector | 400 | 98% | 92% | 0.18 | 0% | 6.1 | 37 | 2.79 | 1.45 | 0.61 | 0.53 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 99% | 90% | 0.16 | 0% | 6.2 | 46 | 0.00 | 1.85 | 0.00 | 0.49 |
| Cytotoxic Vector | Contagion Vector | 400 | 99% | 90% | 0.16 | 0% | 6.1 | 44 | 0.00 | 1.63 | 0.61 | 0.51 |
| Cytotoxic Vector | Ricochet | 400 | 98% | 90% | 0.20 | 0% | 6.2 | 40 | 2.77 | 0.84 | 0.00 | 0.15 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.17 | 0% | 6.1 | 36 | 2.77 | 2.44 | 0.00 | 0.69 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 98% | 91% | 0.17 | 0% | 6.1 | 35 | 2.77 | 2.15 | 0.53 | 0.69 |
| Contagion Vector | Contagion Vector | 400 | 99% | 92% | 0.13 | 0% | 6.0 | 42 | 0.00 | 1.47 | 1.08 | 0.51 |
| Contagion Vector | Ricochet | 400 | 98% | 91% | 0.19 | 0% | 6.2 | 39 | 2.78 | 0.77 | 0.63 | 0.16 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.16 | 0% | 6.1 | 35 | 2.78 | 2.23 | 0.38 | 0.70 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 98% | 92% | 0.17 | 0% | 6.1 | 35 | 2.78 | 2.04 | 0.73 | 0.70 |
| Ricochet | Ricochet | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.33 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 100% | 95% | 0.08 | 0% | 5.9 | 27 | 5.32 | 1.10 | 0.00 | 0.46 |
| Ricochet | Ricochet + Contagion Vector | 400 | 100% | 95% | 0.09 | 0% | 5.9 | 26 | 5.32 | 0.94 | 0.59 | 0.46 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 100% | 96% | 0.06 | 0% | 5.8 | 25 | 5.32 | 2.47 | 0.00 | 0.78 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 100% | 96% | 0.07 | 0% | 5.8 | 25 | 5.32 | 2.30 | 0.29 | 0.78 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 100% | 96% | 0.06 | 0% | 5.8 | 24 | 5.32 | 2.10 | 0.59 | 0.78 |

## armoured, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 51% | 24% | 1.62 | 9% | 6.7 | 151 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 55% | 27% | 1.53 | 6% | 6.7 | 149 | 0.00 | 0.53 | 0.00 | 0.29 |
| Contagion Vector | 400 | 61% | 35% | 1.27 | 4% | 6.6 | 141 | 0.00 | 0.47 | 1.25 | 0.30 |
| Ricochet | 400 | 55% | 32% | 1.49 | 9% | 6.6 | 139 | 2.76 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 61% | 36% | 1.30 | 6% | 6.6 | 135 | 2.76 | 0.86 | 0.00 | 0.66 |
| Ricochet + Contagion Vector | 400 | 70% | 45% | 1.00 | 2% | 6.4 | 122 | 2.76 | 0.71 | 1.80 | 0.68 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 56% | 30% | 1.47 | 6% | 6.6 | 147 | 0.00 | 0.93 | 0.00 | 0.49 |
| Cytotoxic Vector | Contagion Vector | 400 | 62% | 38% | 1.24 | 4% | 6.6 | 140 | 0.00 | 0.84 | 1.23 | 0.49 |
| Cytotoxic Vector | Ricochet | 400 | 56% | 33% | 1.46 | 9% | 6.5 | 138 | 2.76 | 0.36 | 0.00 | 0.17 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 63% | 37% | 1.27 | 6% | 6.5 | 133 | 2.76 | 1.20 | 0.00 | 0.82 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 70% | 46% | 0.99 | 2% | 6.3 | 121 | 2.76 | 1.00 | 1.76 | 0.87 |
| Contagion Vector | Contagion Vector | 400 | 66% | 40% | 1.12 | 2% | 6.5 | 136 | 0.00 | 0.78 | 1.84 | 0.50 |
| Contagion Vector | Ricochet | 400 | 61% | 36% | 1.36 | 7% | 6.5 | 135 | 2.77 | 0.33 | 0.67 | 0.17 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 66% | 39% | 1.20 | 5% | 6.5 | 131 | 2.77 | 1.15 | 0.56 | 0.84 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 71% | 48% | 0.97 | 2% | 6.4 | 121 | 2.77 | 0.98 | 1.95 | 0.88 |
| Ricochet | Ricochet | 400 | 67% | 44% | 1.06 | 4% | 6.5 | 119 | 5.39 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 73% | 50% | 0.87 | 2% | 6.4 | 113 | 5.43 | 0.85 | 0.00 | 0.63 |
| Ricochet | Ricochet + Contagion Vector | 400 | 78% | 58% | 0.66 | 1% | 6.3 | 103 | 5.46 | 0.72 | 1.64 | 0.62 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 75% | 53% | 0.79 | 1% | 6.3 | 109 | 5.44 | 1.72 | 0.00 | 1.14 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 79% | 60% | 0.63 | 0% | 6.2 | 101 | 5.47 | 1.48 | 1.50 | 1.17 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 82% | 62% | 0.55 | 1% | 6.1 | 97 | 5.49 | 1.33 | 2.08 | 1.21 |

## swarm, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 85% | 63% | 0.70 | 3% | 6.6 | 101 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 88% | 68% | 0.57 | 2% | 6.5 | 96 | 0.00 | 0.82 | 0.00 | 0.10 |
| Contagion Vector | 400 | 91% | 74% | 0.42 | 2% | 6.3 | 88 | 0.00 | 0.73 | 1.94 | 0.10 |
| Ricochet | 400 | 90% | 72% | 0.57 | 2% | 6.6 | 85 | 2.91 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 94% | 79% | 0.43 | 1% | 6.4 | 74 | 2.91 | 1.78 | 0.00 | 0.13 |
| Ricochet + Contagion Vector | 400 | 94% | 84% | 0.34 | 0% | 6.2 | 64 | 2.91 | 1.38 | 2.89 | 0.13 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 90% | 68% | 0.53 | 1% | 6.5 | 93 | 0.00 | 1.67 | 0.00 | 0.17 |
| Cytotoxic Vector | Contagion Vector | 400 | 92% | 74% | 0.38 | 1% | 6.3 | 85 | 0.00 | 1.52 | 1.88 | 0.18 |
| Cytotoxic Vector | Ricochet | 400 | 91% | 73% | 0.54 | 1% | 6.5 | 83 | 2.90 | 0.77 | 0.00 | 0.09 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 95% | 79% | 0.41 | 1% | 6.3 | 72 | 2.90 | 2.51 | 0.00 | 0.21 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 95% | 84% | 0.34 | 1% | 6.2 | 64 | 2.90 | 2.04 | 2.83 | 0.21 |
| Contagion Vector | Contagion Vector | 400 | 93% | 79% | 0.31 | 1% | 6.1 | 78 | 0.00 | 1.39 | 2.88 | 0.18 |
| Contagion Vector | Ricochet | 400 | 93% | 76% | 0.47 | 1% | 6.4 | 78 | 2.91 | 0.71 | 1.16 | 0.09 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 96% | 81% | 0.37 | 1% | 6.3 | 69 | 2.91 | 2.31 | 0.93 | 0.23 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 96% | 84% | 0.31 | 1% | 6.1 | 62 | 2.91 | 1.96 | 3.08 | 0.22 |
| Ricochet | Ricochet | 400 | 97% | 84% | 0.22 | 0% | 6.2 | 58 | 5.83 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 99% | 88% | 0.15 | 0% | 6.0 | 52 | 5.81 | 1.42 | 0.00 | 0.10 |
| Ricochet | Ricochet + Contagion Vector | 400 | 99% | 91% | 0.11 | 0% | 5.9 | 46 | 5.74 | 1.08 | 2.54 | 0.10 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 99% | 91% | 0.12 | 0% | 5.9 | 48 | 5.79 | 3.04 | 0.00 | 0.27 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 99% | 93% | 0.09 | 0% | 5.8 | 43 | 5.72 | 2.47 | 2.35 | 0.30 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 99% | 96% | 0.06 | 0% | 5.8 | 40 | 5.67 | 2.12 | 3.28 | 0.30 |

## synthetic, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 91% | 68% | 0.66 | 1% | 7.3 | 103 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 93% | 68% | 0.63 | 1% | 7.3 | 102 | 0.00 | 0.41 | 0.00 | 1.32 |
| Contagion Vector | 400 | 93% | 69% | 0.62 | 1% | 7.3 | 102 | 0.00 | 0.40 | 0.09 | 1.31 |
| Ricochet | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.51 | 1% | 7.1 | 86 | 2.97 | 0.47 | 0.00 | 2.78 |
| Ricochet + Contagion Vector | 400 | 95% | 72% | 0.51 | 1% | 7.0 | 85 | 2.97 | 0.45 | 0.10 | 2.78 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 93% | 68% | 0.61 | 1% | 7.3 | 100 | 0.00 | 0.73 | 0.00 | 2.27 |
| Cytotoxic Vector | Contagion Vector | 400 | 93% | 69% | 0.61 | 1% | 7.2 | 100 | 0.00 | 0.72 | 0.07 | 2.27 |
| Cytotoxic Vector | Ricochet | 400 | 94% | 71% | 0.54 | 1% | 7.1 | 87 | 2.97 | 0.32 | 0.00 | 0.74 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.76 | 0.00 | 3.33 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.73 | 0.09 | 3.33 |
| Contagion Vector | Contagion Vector | 400 | 93% | 69% | 0.61 | 1% | 7.2 | 100 | 0.00 | 0.72 | 0.10 | 2.27 |
| Contagion Vector | Ricochet | 400 | 94% | 71% | 0.54 | 1% | 7.1 | 87 | 2.97 | 0.31 | 0.07 | 0.74 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.72 | 0.07 | 3.33 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.70 | 0.14 | 3.33 |
| Ricochet | Ricochet | 400 | 98% | 82% | 0.33 | 1% | 6.8 | 67 | 5.96 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 99% | 82% | 0.29 | 0% | 6.6 | 65 | 5.96 | 0.49 | 0.00 | 2.09 |
| Ricochet | Ricochet + Contagion Vector | 400 | 99% | 82% | 0.29 | 0% | 6.6 | 65 | 5.96 | 0.48 | 0.13 | 2.09 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 99% | 83% | 0.29 | 0% | 6.6 | 64 | 5.96 | 1.00 | 0.00 | 3.83 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 99% | 83% | 0.28 | 0% | 6.6 | 64 | 5.96 | 0.97 | 0.10 | 3.83 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 99% | 83% | 0.28 | 0% | 6.5 | 64 | 5.96 | 0.94 | 0.16 | 3.83 |

## mixed, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 24% | 3% | 2.63 | 13% | 5.7 | 168 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 28% | 4% | 2.56 | 16% | 5.7 | 165 | 0.00 | 0.66 | 0.00 | 0.44 |
| Contagion Vector | 400 | 32% | 5% | 2.38 | 11% | 5.7 | 161 | 0.00 | 0.56 | 1.19 | 0.46 |
| Ricochet | 400 | 34% | 8% | 2.31 | 10% | 5.7 | 158 | 2.61 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 40% | 14% | 2.06 | 9% | 5.8 | 152 | 2.61 | 1.54 | 0.00 | 1.08 |
| Ricochet + Contagion Vector | 400 | 47% | 19% | 1.89 | 10% | 5.9 | 146 | 2.61 | 1.21 | 1.88 | 1.10 |
| Cytotoxic Vector | Cytotoxic Vector | 400 | 30% | 5% | 2.50 | 15% | 5.8 | 164 | 0.00 | 1.22 | 0.00 | 0.68 |
| Cytotoxic Vector | Contagion Vector | 400 | 33% | 6% | 2.34 | 12% | 5.7 | 160 | 0.00 | 1.08 | 1.10 | 0.72 |
| Cytotoxic Vector | Ricochet | 400 | 34% | 8% | 2.29 | 11% | 5.7 | 157 | 2.61 | 0.35 | 0.00 | 0.13 |
| Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 41% | 14% | 2.03 | 9% | 5.8 | 151 | 2.61 | 1.87 | 0.00 | 1.19 |
| Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 47% | 19% | 1.88 | 9% | 5.9 | 146 | 2.61 | 1.49 | 1.81 | 1.24 |
| Contagion Vector | Contagion Vector | 400 | 36% | 6% | 2.25 | 10% | 5.7 | 158 | 0.00 | 0.99 | 1.81 | 0.72 |
| Contagion Vector | Ricochet | 400 | 35% | 9% | 2.23 | 12% | 5.7 | 156 | 2.61 | 0.31 | 0.74 | 0.13 |
| Contagion Vector | Ricochet + Cytotoxic Vector | 400 | 41% | 14% | 2.00 | 11% | 5.8 | 150 | 2.61 | 1.72 | 0.62 | 1.19 |
| Contagion Vector | Ricochet + Contagion Vector | 400 | 47% | 19% | 1.86 | 10% | 5.9 | 145 | 2.61 | 1.43 | 1.99 | 1.23 |
| Ricochet | Ricochet | 400 | 37% | 14% | 2.12 | 8% | 5.9 | 152 | 4.86 | 0.00 | 0.00 | 0.00 |
| Ricochet | Ricochet + Cytotoxic Vector | 400 | 46% | 18% | 1.86 | 8% | 5.9 | 144 | 4.96 | 1.38 | 0.00 | 0.96 |
| Ricochet | Ricochet + Contagion Vector | 400 | 53% | 23% | 1.60 | 6% | 5.8 | 135 | 5.01 | 1.05 | 1.71 | 0.97 |
| Ricochet + Cytotoxic Vector | Ricochet + Cytotoxic Vector | 400 | 51% | 21% | 1.70 | 6% | 5.9 | 140 | 4.95 | 2.60 | 0.00 | 1.55 |
| Ricochet + Cytotoxic Vector | Ricochet + Contagion Vector | 400 | 57% | 24% | 1.48 | 4% | 5.8 | 131 | 5.00 | 2.12 | 1.46 | 1.60 |
| Ricochet + Contagion Vector | Ricochet + Contagion Vector | 400 | 59% | 26% | 1.42 | 3% | 5.7 | 129 | 4.99 | 1.84 | 2.07 | 1.62 |
