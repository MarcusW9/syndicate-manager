# The combo sweep (2026-11-19-statuses-offered)

`node scripts/sim-combos.mjs 10 20 2026-11-19-statuses-offered`. Real fight code, hands-off, no call-ins. Measurement only: nothing here changes a rule, a number or a word, and nothing is tuned.

- **Builds swept:** 14 (moves: none, Ricochet; payloads: none, Cytotoxic Vector, Contagion Vector, Incendiary Rounds, Spotter’s Eye, Breacher, Rout), so 105 rows: the baseline, each build alone (on the best combat runner) and every unordered pair (the first build on the best, the second on the next best).
- **Crews:** 10 grown from the toughness sim's `crewOf` (4 to 6 runners), 20 fights a crew a job, on 2 jobs: warehouse (docks, threat 4); data_pull (heights, threat 3). Every row plays the same seeds.
- **Mixes:** the job's own, armoured, swarm, synthetic, mixed (armoured: two police, two secforce and two drones, one plate each, as the owner counts drones armoured from 2026-11-19; swarm: six hired; synthetic: five drones, immune to the Vectors; mixed: the job's own plus two drones and two corp).
- **Thresholds:** far stronger = clean win more than 15 points above the no-build row on the same mix and risk; worse = more than 3 points below it. Clean win = won with nobody down.
- **Fights played:** 630000.

## Flags

- FAR STRONGER: **Ricochet + Contagion Vector** on armoured, steady: clean win 44% against 24% with no build (+19 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds** on armoured, steady: clean win 49% against 24% with no build (+25 points).
- FAR STRONGER: **Ricochet + Breacher** on armoured, steady: clean win 45% against 24% with no build (+21 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Contagion Vector** on armoured, steady: clean win 45% against 24% with no build (+20 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Incendiary Rounds** on armoured, steady: clean win 49% against 24% with no build (+25 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Breacher** on armoured, steady: clean win 46% against 24% with no build (+22 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Rout** on armoured, steady: clean win 39% against 24% with no build (+15 points).
- FAR STRONGER: **Contagion Vector / Contagion Vector** on armoured, steady: clean win 40% against 24% with no build (+16 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Contagion Vector** on armoured, steady: clean win 46% against 24% with no build (+22 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Incendiary Rounds** on armoured, steady: clean win 51% against 24% with no build (+27 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Breacher** on armoured, steady: clean win 48% against 24% with no build (+24 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Rout** on armoured, steady: clean win 41% against 24% with no build (+17 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Contagion Vector** on armoured, steady: clean win 45% against 24% with no build (+21 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Incendiary Rounds** on armoured, steady: clean win 50% against 24% with no build (+26 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Breacher** on armoured, steady: clean win 46% against 24% with no build (+22 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Rout** on armoured, steady: clean win 40% against 24% with no build (+16 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Contagion Vector** on armoured, steady: clean win 44% against 24% with no build (+19 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Incendiary Rounds** on armoured, steady: clean win 49% against 24% with no build (+25 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Breacher** on armoured, steady: clean win 46% against 24% with no build (+21 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Rout** on armoured, steady: clean win 41% against 24% with no build (+16 points).
- FAR STRONGER: **Breacher / Ricochet + Contagion Vector** on armoured, steady: clean win 45% against 24% with no build (+21 points).
- FAR STRONGER: **Breacher / Ricochet + Incendiary Rounds** on armoured, steady: clean win 51% against 24% with no build (+26 points).
- FAR STRONGER: **Breacher / Ricochet + Breacher** on armoured, steady: clean win 47% against 24% with no build (+22 points).
- FAR STRONGER: **Breacher / Ricochet + Rout** on armoured, steady: clean win 40% against 24% with no build (+15 points).
- FAR STRONGER: **Rout / Ricochet + Contagion Vector** on armoured, steady: clean win 46% against 24% with no build (+21 points).
- FAR STRONGER: **Rout / Ricochet + Incendiary Rounds** on armoured, steady: clean win 50% against 24% with no build (+26 points).
- FAR STRONGER: **Rout / Ricochet + Breacher** on armoured, steady: clean win 48% against 24% with no build (+24 points).
- FAR STRONGER: **Rout / Ricochet + Rout** on armoured, steady: clean win 40% against 24% with no build (+16 points).
- FAR STRONGER: **Ricochet / Ricochet** on armoured, steady: clean win 44% against 24% with no build (+19 points).
- FAR STRONGER: **Ricochet / Ricochet + Cytotoxic Vector** on armoured, steady: clean win 50% against 24% with no build (+25 points).
- FAR STRONGER: **Ricochet / Ricochet + Contagion Vector** on armoured, steady: clean win 59% against 24% with no build (+35 points).
- FAR STRONGER: **Ricochet / Ricochet + Incendiary Rounds** on armoured, steady: clean win 62% against 24% with no build (+38 points).
- FAR STRONGER: **Ricochet / Ricochet + Spotter’s Eye** on armoured, steady: clean win 44% against 24% with no build (+19 points).
- FAR STRONGER: **Ricochet / Ricochet + Breacher** on armoured, steady: clean win 52% against 24% with no build (+28 points).
- FAR STRONGER: **Ricochet / Ricochet + Rout** on armoured, steady: clean win 52% against 24% with no build (+28 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector** on armoured, steady: clean win 53% against 24% with no build (+29 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector** on armoured, steady: clean win 60% against 24% with no build (+36 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds** on armoured, steady: clean win 64% against 24% with no build (+39 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye** on armoured, steady: clean win 46% against 24% with no build (+21 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Breacher** on armoured, steady: clean win 54% against 24% with no build (+30 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Rout** on armoured, steady: clean win 54% against 24% with no build (+29 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Contagion Vector** on armoured, steady: clean win 62% against 24% with no build (+38 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Incendiary Rounds** on armoured, steady: clean win 67% against 24% with no build (+43 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Spotter’s Eye** on armoured, steady: clean win 52% against 24% with no build (+27 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Breacher** on armoured, steady: clean win 58% against 24% with no build (+34 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Rout** on armoured, steady: clean win 57% against 24% with no build (+33 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds** on armoured, steady: clean win 70% against 24% with no build (+46 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye** on armoured, steady: clean win 58% against 24% with no build (+34 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Breacher** on armoured, steady: clean win 65% against 24% with no build (+40 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Rout** on armoured, steady: clean win 64% against 24% with no build (+39 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye** on armoured, steady: clean win 44% against 24% with no build (+19 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Breacher** on armoured, steady: clean win 56% against 24% with no build (+32 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Rout** on armoured, steady: clean win 55% against 24% with no build (+31 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Breacher** on armoured, steady: clean win 62% against 24% with no build (+37 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Rout** on armoured, steady: clean win 60% against 24% with no build (+36 points).
- FAR STRONGER: **Ricochet + Rout / Ricochet + Rout** on armoured, steady: clean win 57% against 24% with no build (+33 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Ricochet + Contagion Vector** on swarm, steady: clean win 83% against 60% with no build (+23 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Ricochet + Rout** on swarm, steady: clean win 78% against 60% with no build (+17 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Cytotoxic Vector** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Contagion Vector** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Incendiary Rounds** on swarm, steady: clean win 79% against 60% with no build (+18 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Rout** on swarm, steady: clean win 79% against 60% with no build (+18 points).
- FAR STRONGER: **Contagion Vector / Contagion Vector** on swarm, steady: clean win 76% against 60% with no build (+16 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Cytotoxic Vector** on swarm, steady: clean win 79% against 60% with no build (+19 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Contagion Vector** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Incendiary Rounds** on swarm, steady: clean win 79% against 60% with no build (+19 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Rout** on swarm, steady: clean win 80% against 60% with no build (+19 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Cytotoxic Vector** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Contagion Vector** on swarm, steady: clean win 82% against 60% with no build (+22 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Incendiary Rounds** on swarm, steady: clean win 79% against 60% with no build (+18 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Rout** on swarm, steady: clean win 79% against 60% with no build (+18 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Cytotoxic Vector** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Contagion Vector** on swarm, steady: clean win 83% against 60% with no build (+23 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Incendiary Rounds** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Rout** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Breacher / Ricochet + Cytotoxic Vector** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Breacher / Ricochet + Contagion Vector** on swarm, steady: clean win 83% against 60% with no build (+23 points).
- FAR STRONGER: **Breacher / Ricochet + Incendiary Rounds** on swarm, steady: clean win 78% against 60% with no build (+18 points).
- FAR STRONGER: **Breacher / Ricochet + Rout** on swarm, steady: clean win 78% against 60% with no build (+17 points).
- FAR STRONGER: **Rout / Ricochet + Cytotoxic Vector** on swarm, steady: clean win 79% against 60% with no build (+19 points).
- FAR STRONGER: **Rout / Ricochet + Contagion Vector** on swarm, steady: clean win 84% against 60% with no build (+24 points).
- FAR STRONGER: **Rout / Ricochet + Incendiary Rounds** on swarm, steady: clean win 79% against 60% with no build (+19 points).
- FAR STRONGER: **Rout / Ricochet + Rout** on swarm, steady: clean win 79% against 60% with no build (+18 points).
- FAR STRONGER: **Ricochet / Ricochet** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Ricochet / Ricochet + Cytotoxic Vector** on swarm, steady: clean win 87% against 60% with no build (+27 points).
- FAR STRONGER: **Ricochet / Ricochet + Contagion Vector** on swarm, steady: clean win 90% against 60% with no build (+30 points).
- FAR STRONGER: **Ricochet / Ricochet + Incendiary Rounds** on swarm, steady: clean win 87% against 60% with no build (+26 points).
- FAR STRONGER: **Ricochet / Ricochet + Spotter’s Eye** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Ricochet / Ricochet + Breacher** on swarm, steady: clean win 83% against 60% with no build (+23 points).
- FAR STRONGER: **Ricochet / Ricochet + Rout** on swarm, steady: clean win 87% against 60% with no build (+27 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector** on swarm, steady: clean win 90% against 60% with no build (+29 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector** on swarm, steady: clean win 92% against 60% with no build (+32 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds** on swarm, steady: clean win 90% against 60% with no build (+29 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye** on swarm, steady: clean win 86% against 60% with no build (+26 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Breacher** on swarm, steady: clean win 86% against 60% with no build (+26 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Rout** on swarm, steady: clean win 89% against 60% with no build (+29 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Contagion Vector** on swarm, steady: clean win 95% against 60% with no build (+35 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Incendiary Rounds** on swarm, steady: clean win 93% against 60% with no build (+33 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Spotter’s Eye** on swarm, steady: clean win 90% against 60% with no build (+29 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Breacher** on swarm, steady: clean win 90% against 60% with no build (+29 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Rout** on swarm, steady: clean win 93% against 60% with no build (+32 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds** on swarm, steady: clean win 90% against 60% with no build (+29 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye** on swarm, steady: clean win 86% against 60% with no build (+26 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Breacher** on swarm, steady: clean win 86% against 60% with no build (+26 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Rout** on swarm, steady: clean win 89% against 60% with no build (+29 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Breacher** on swarm, steady: clean win 83% against 60% with no build (+23 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Rout** on swarm, steady: clean win 87% against 60% with no build (+27 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Breacher** on swarm, steady: clean win 83% against 60% with no build (+22 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Rout** on swarm, steady: clean win 87% against 60% with no build (+26 points).
- FAR STRONGER: **Ricochet + Rout / Ricochet + Rout** on swarm, steady: clean win 91% against 60% with no build (+31 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Incendiary Rounds** on synthetic, steady: clean win 83% against 67% with no build (+16 points).
- FAR STRONGER: **Ricochet / Ricochet + Incendiary Rounds** on synthetic, steady: clean win 89% against 67% with no build (+22 points).
- FAR STRONGER: **Ricochet / Ricochet + Breacher** on synthetic, steady: clean win 86% against 67% with no build (+19 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector** on synthetic, steady: clean win 82% against 67% with no build (+15 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector** on synthetic, steady: clean win 82% against 67% with no build (+15 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds** on synthetic, steady: clean win 90% against 67% with no build (+23 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Breacher** on synthetic, steady: clean win 87% against 67% with no build (+20 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Contagion Vector** on synthetic, steady: clean win 82% against 67% with no build (+15 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Incendiary Rounds** on synthetic, steady: clean win 90% against 67% with no build (+23 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Breacher** on synthetic, steady: clean win 87% against 67% with no build (+20 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds** on synthetic, steady: clean win 93% against 67% with no build (+26 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye** on synthetic, steady: clean win 85% against 67% with no build (+18 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Breacher** on synthetic, steady: clean win 90% against 67% with no build (+23 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Rout** on synthetic, steady: clean win 85% against 67% with no build (+18 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Breacher** on synthetic, steady: clean win 86% against 67% with no build (+19 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Breacher** on synthetic, steady: clean win 88% against 67% with no build (+21 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Rout** on synthetic, steady: clean win 84% against 67% with no build (+16 points).
- FAR STRONGER: **Ricochet / Ricochet + Contagion Vector** on mixed, steady: clean win 22% against 3% with no build (+19 points).
- FAR STRONGER: **Ricochet / Ricochet + Incendiary Rounds** on mixed, steady: clean win 19% against 3% with no build (+16 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector** on mixed, steady: clean win 21% against 3% with no build (+18 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector** on mixed, steady: clean win 23% against 3% with no build (+20 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds** on mixed, steady: clean win 20% against 3% with no build (+18 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Breacher** on mixed, steady: clean win 18% against 3% with no build (+15 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Rout** on mixed, steady: clean win 20% against 3% with no build (+17 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Contagion Vector** on mixed, steady: clean win 24% against 3% with no build (+21 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Incendiary Rounds** on mixed, steady: clean win 23% against 3% with no build (+21 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Spotter’s Eye** on mixed, steady: clean win 20% against 3% with no build (+17 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Breacher** on mixed, steady: clean win 21% against 3% with no build (+18 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Rout** on mixed, steady: clean win 22% against 3% with no build (+20 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds** on mixed, steady: clean win 21% against 3% with no build (+18 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Breacher** on mixed, steady: clean win 18% against 3% with no build (+15 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Rout** on mixed, steady: clean win 19% against 3% with no build (+17 points).
- FAR STRONGER: **Ricochet + Contagion Vector** on armoured, committed: clean win 45% against 24% with no build (+21 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds** on armoured, committed: clean win 49% against 24% with no build (+25 points).
- FAR STRONGER: **Ricochet + Breacher** on armoured, committed: clean win 45% against 24% with no build (+21 points).
- FAR STRONGER: **Ricochet + Rout** on armoured, committed: clean win 40% against 24% with no build (+16 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Contagion Vector** on armoured, committed: clean win 46% against 24% with no build (+22 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Incendiary Rounds** on armoured, committed: clean win 50% against 24% with no build (+26 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Breacher** on armoured, committed: clean win 46% against 24% with no build (+21 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Rout** on armoured, committed: clean win 41% against 24% with no build (+16 points).
- FAR STRONGER: **Contagion Vector / Contagion Vector** on armoured, committed: clean win 40% against 24% with no build (+16 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Cytotoxic Vector** on armoured, committed: clean win 39% against 24% with no build (+15 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Contagion Vector** on armoured, committed: clean win 48% against 24% with no build (+23 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Incendiary Rounds** on armoured, committed: clean win 52% against 24% with no build (+28 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Breacher** on armoured, committed: clean win 48% against 24% with no build (+24 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Rout** on armoured, committed: clean win 43% against 24% with no build (+18 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Contagion Vector** on armoured, committed: clean win 47% against 24% with no build (+23 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Incendiary Rounds** on armoured, committed: clean win 51% against 24% with no build (+27 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Breacher** on armoured, committed: clean win 46% against 24% with no build (+22 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Rout** on armoured, committed: clean win 42% against 24% with no build (+17 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Contagion Vector** on armoured, committed: clean win 45% against 24% with no build (+21 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Incendiary Rounds** on armoured, committed: clean win 49% against 24% with no build (+25 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Breacher** on armoured, committed: clean win 45% against 24% with no build (+21 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Rout** on armoured, committed: clean win 42% against 24% with no build (+18 points).
- FAR STRONGER: **Breacher / Ricochet + Contagion Vector** on armoured, committed: clean win 47% against 24% with no build (+23 points).
- FAR STRONGER: **Breacher / Ricochet + Incendiary Rounds** on armoured, committed: clean win 52% against 24% with no build (+27 points).
- FAR STRONGER: **Breacher / Ricochet + Breacher** on armoured, committed: clean win 47% against 24% with no build (+22 points).
- FAR STRONGER: **Breacher / Ricochet + Rout** on armoured, committed: clean win 41% against 24% with no build (+17 points).
- FAR STRONGER: **Rout / Ricochet + Contagion Vector** on armoured, committed: clean win 48% against 24% with no build (+23 points).
- FAR STRONGER: **Rout / Ricochet + Incendiary Rounds** on armoured, committed: clean win 51% against 24% with no build (+26 points).
- FAR STRONGER: **Rout / Ricochet + Breacher** on armoured, committed: clean win 48% against 24% with no build (+24 points).
- FAR STRONGER: **Rout / Ricochet + Rout** on armoured, committed: clean win 42% against 24% with no build (+18 points).
- FAR STRONGER: **Ricochet / Ricochet** on armoured, committed: clean win 44% against 24% with no build (+20 points).
- FAR STRONGER: **Ricochet / Ricochet + Cytotoxic Vector** on armoured, committed: clean win 50% against 24% with no build (+26 points).
- FAR STRONGER: **Ricochet / Ricochet + Contagion Vector** on armoured, committed: clean win 58% against 24% with no build (+34 points).
- FAR STRONGER: **Ricochet / Ricochet + Incendiary Rounds** on armoured, committed: clean win 62% against 24% with no build (+38 points).
- FAR STRONGER: **Ricochet / Ricochet + Spotter’s Eye** on armoured, committed: clean win 44% against 24% with no build (+20 points).
- FAR STRONGER: **Ricochet / Ricochet + Breacher** on armoured, committed: clean win 54% against 24% with no build (+29 points).
- FAR STRONGER: **Ricochet / Ricochet + Rout** on armoured, committed: clean win 53% against 24% with no build (+28 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector** on armoured, committed: clean win 53% against 24% with no build (+29 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector** on armoured, committed: clean win 60% against 24% with no build (+35 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds** on armoured, committed: clean win 64% against 24% with no build (+40 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye** on armoured, committed: clean win 46% against 24% with no build (+21 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Breacher** on armoured, committed: clean win 55% against 24% with no build (+31 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Rout** on armoured, committed: clean win 54% against 24% with no build (+30 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Contagion Vector** on armoured, committed: clean win 62% against 24% with no build (+38 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Incendiary Rounds** on armoured, committed: clean win 68% against 24% with no build (+43 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Spotter’s Eye** on armoured, committed: clean win 52% against 24% with no build (+28 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Breacher** on armoured, committed: clean win 59% against 24% with no build (+35 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Rout** on armoured, committed: clean win 58% against 24% with no build (+34 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds** on armoured, committed: clean win 70% against 24% with no build (+46 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye** on armoured, committed: clean win 57% against 24% with no build (+33 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Breacher** on armoured, committed: clean win 65% against 24% with no build (+40 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Rout** on armoured, committed: clean win 63% against 24% with no build (+39 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye** on armoured, committed: clean win 44% against 24% with no build (+20 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Breacher** on armoured, committed: clean win 57% against 24% with no build (+33 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Rout** on armoured, committed: clean win 56% against 24% with no build (+32 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Breacher** on armoured, committed: clean win 63% against 24% with no build (+38 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Rout** on armoured, committed: clean win 61% against 24% with no build (+37 points).
- FAR STRONGER: **Ricochet + Rout / Ricochet + Rout** on armoured, committed: clean win 58% against 24% with no build (+34 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Ricochet + Rout** on swarm, committed: clean win 78% against 63% with no build (+16 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Cytotoxic Vector** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Incendiary Rounds** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Rout** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Contagion Vector / Contagion Vector** on swarm, committed: clean win 79% against 63% with no build (+16 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Cytotoxic Vector** on swarm, committed: clean win 81% against 63% with no build (+18 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+22 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Incendiary Rounds** on swarm, committed: clean win 81% against 63% with no build (+18 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Rout** on swarm, committed: clean win 81% against 63% with no build (+19 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Cytotoxic Vector** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Contagion Vector** on swarm, committed: clean win 83% against 63% with no build (+21 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Incendiary Rounds** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Rout** on swarm, committed: clean win 80% against 63% with no build (+17 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Cytotoxic Vector** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Incendiary Rounds** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Rout** on swarm, committed: clean win 79% against 63% with no build (+16 points).
- FAR STRONGER: **Breacher / Ricochet + Cytotoxic Vector** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Breacher / Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Breacher / Ricochet + Incendiary Rounds** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Breacher / Ricochet + Rout** on swarm, committed: clean win 78% against 63% with no build (+16 points).
- FAR STRONGER: **Rout / Ricochet + Cytotoxic Vector** on swarm, committed: clean win 80% against 63% with no build (+17 points).
- FAR STRONGER: **Rout / Ricochet + Contagion Vector** on swarm, committed: clean win 84% against 63% with no build (+22 points).
- FAR STRONGER: **Rout / Ricochet + Incendiary Rounds** on swarm, committed: clean win 80% against 63% with no build (+17 points).
- FAR STRONGER: **Rout / Ricochet + Rout** on swarm, committed: clean win 79% against 63% with no build (+17 points).
- FAR STRONGER: **Ricochet / Ricochet** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Ricochet / Ricochet + Cytotoxic Vector** on swarm, committed: clean win 88% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet / Ricochet + Contagion Vector** on swarm, committed: clean win 91% against 63% with no build (+29 points).
- FAR STRONGER: **Ricochet / Ricochet + Incendiary Rounds** on swarm, committed: clean win 87% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet / Ricochet + Spotter’s Eye** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Ricochet / Ricochet + Breacher** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Ricochet / Ricochet + Rout** on swarm, committed: clean win 88% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector** on swarm, committed: clean win 91% against 63% with no build (+28 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector** on swarm, committed: clean win 93% against 63% with no build (+31 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds** on swarm, committed: clean win 90% against 63% with no build (+28 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye** on swarm, committed: clean win 87% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Breacher** on swarm, committed: clean win 87% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Rout** on swarm, committed: clean win 90% against 63% with no build (+28 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Contagion Vector** on swarm, committed: clean win 96% against 63% with no build (+33 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Incendiary Rounds** on swarm, committed: clean win 94% against 63% with no build (+31 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Spotter’s Eye** on swarm, committed: clean win 90% against 63% with no build (+28 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Breacher** on swarm, committed: clean win 90% against 63% with no build (+28 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Rout** on swarm, committed: clean win 93% against 63% with no build (+30 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds** on swarm, committed: clean win 90% against 63% with no build (+28 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye** on swarm, committed: clean win 87% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Breacher** on swarm, committed: clean win 87% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Rout** on swarm, committed: clean win 90% against 63% with no build (+28 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Breacher** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Rout** on swarm, committed: clean win 88% against 63% with no build (+26 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Breacher** on swarm, committed: clean win 84% against 63% with no build (+21 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Rout** on swarm, committed: clean win 87% against 63% with no build (+25 points).
- FAR STRONGER: **Ricochet + Rout / Ricochet + Rout** on swarm, committed: clean win 91% against 63% with no build (+28 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Incendiary Rounds** on synthetic, committed: clean win 84% against 68% with no build (+16 points).
- FAR STRONGER: **Ricochet / Ricochet + Incendiary Rounds** on synthetic, committed: clean win 90% against 68% with no build (+22 points).
- FAR STRONGER: **Ricochet / Ricochet + Breacher** on synthetic, committed: clean win 86% against 68% with no build (+19 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds** on synthetic, committed: clean win 90% against 68% with no build (+22 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Breacher** on synthetic, committed: clean win 87% against 68% with no build (+19 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Incendiary Rounds** on synthetic, committed: clean win 90% against 68% with no build (+22 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Breacher** on synthetic, committed: clean win 87% against 68% with no build (+19 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds** on synthetic, committed: clean win 93% against 68% with no build (+25 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye** on synthetic, committed: clean win 85% against 68% with no build (+18 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Breacher** on synthetic, committed: clean win 90% against 68% with no build (+22 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Rout** on synthetic, committed: clean win 85% against 68% with no build (+18 points).
- FAR STRONGER: **Ricochet + Spotter’s Eye / Ricochet + Breacher** on synthetic, committed: clean win 86% against 68% with no build (+19 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Breacher** on synthetic, committed: clean win 88% against 68% with no build (+20 points).
- FAR STRONGER: **Ricochet + Breacher / Ricochet + Rout** on synthetic, committed: clean win 83% against 68% with no build (+16 points).
- FAR STRONGER: **Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Cytotoxic Vector / Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Contagion Vector / Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+16 points).
- FAR STRONGER: **Incendiary Rounds / Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Spotter’s Eye / Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Breacher / Ricochet + Contagion Vector** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Ricochet / Ricochet + Contagion Vector** on mixed, committed: clean win 23% against 3% with no build (+19 points).
- FAR STRONGER: **Ricochet / Ricochet + Incendiary Rounds** on mixed, committed: clean win 20% against 3% with no build (+16 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector** on mixed, committed: clean win 21% against 3% with no build (+18 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector** on mixed, committed: clean win 24% against 3% with no build (+21 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds** on mixed, committed: clean win 22% against 3% with no build (+19 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Breacher** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Ricochet + Cytotoxic Vector / Ricochet + Rout** on mixed, committed: clean win 20% against 3% with no build (+17 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Contagion Vector** on mixed, committed: clean win 26% against 3% with no build (+23 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Incendiary Rounds** on mixed, committed: clean win 26% against 3% with no build (+23 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Spotter’s Eye** on mixed, committed: clean win 22% against 3% with no build (+18 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Breacher** on mixed, committed: clean win 22% against 3% with no build (+19 points).
- FAR STRONGER: **Ricochet + Contagion Vector / Ricochet + Rout** on mixed, committed: clean win 24% against 3% with no build (+21 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds** on mixed, committed: clean win 22% against 3% with no build (+19 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Breacher** on mixed, committed: clean win 19% against 3% with no build (+15 points).
- FAR STRONGER: **Ricochet + Incendiary Rounds / Ricochet + Rout** on mixed, committed: clean win 20% against 3% with no build (+17 points).

Deaths on cautious or steady: **none** (every combination, every mix, both risks).

## Each piece's own counts (committed, summed over every row that holds it)

| Piece | the job's own | armoured | swarm | synthetic | mixed |
| --- | --- | --- | --- | --- | --- |
| Ricochet | 114091 | 115544 | 121756 | 124904 | 106027 |
| Cytotoxic Vector | 18378 | 12708 | 16118 | 25321 | 18449 |
| Contagion Vector | 23253 | 25865 | 36151 | 26033 | 31112 |
| Incendiary Rounds | 18317 | 23493 | 16119 | 25619 | 19455 |
| Spotter’s Eye | 18206 | 22214 | 15815 | 25334 | 18454 |
| Breacher | 1038 | 9689 | 260 | 8334 | 3436 |
| Rout | 2389 | 7986 | 12627 | 0 | 3074 |

A count is the piece's own lines: a move's bounces, a payload's statuses put on and spreads (and the shrugs an immune body gives it).

## the job's own, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 87% | 86% | 0.15 | 0% | 6.0 | 47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 90% | 89% | 0.12 | 0% | 6.0 | 45 | 0.00 | 0.87 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.31 |
| Contagion Vector | 400 | 91% | 89% | 0.12 | 0% | 5.9 | 42 | 0.00 | 0.76 | 0.00 | 0.00 | 0.00 | 0.00 | 0.67 | 0.31 |
| Incendiary Rounds | 400 | 90% | 89% | 0.12 | 0% | 5.9 | 44 | 0.00 | 0.00 | 1.19 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 87% | 86% | 0.15 | 0% | 6.0 | 47 | 0.00 | 0.00 | 0.00 | 1.17 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 88% | 87% | 0.15 | 0% | 6.0 | 46 | 0.00 | 0.00 | 0.00 | 0.00 | 0.09 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 87% | 86% | 0.15 | 0% | 6.0 | 46 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.14 | 0.00 | 0.00 |
| Ricochet | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 32 | 2.73 | 1.63 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.52 |
| Ricochet + Contagion Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 1.41 | 0.00 | 0.00 | 0.00 | 0.00 | 0.58 | 0.52 |
| Ricochet + Incendiary Rounds | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 0.00 | 2.16 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 2.15 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 88% | 88% | 0.12 | 0% | 5.8 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.11 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.00 | 0.28 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 90% | 89% | 0.12 | 0% | 5.9 | 42 | 0.00 | 1.76 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.48 |
| Cytotoxic Vector / Contagion Vector | 400 | 91% | 89% | 0.12 | 0% | 5.8 | 41 | 0.00 | 1.56 | 0.00 | 0.00 | 0.00 | 0.00 | 0.59 | 0.49 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 91% | 90% | 0.11 | 0% | 5.9 | 42 | 0.00 | 0.95 | 1.23 | 0.00 | 0.00 | 0.00 | 0.00 | 0.19 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 88% | 87% | 0.14 | 0% | 6.0 | 45 | 0.00 | 0.94 | 0.00 | 1.21 | 0.00 | 0.00 | 0.00 | 0.19 |
| Cytotoxic Vector / Breacher | 400 | 89% | 88% | 0.14 | 0% | 6.0 | 44 | 0.00 | 0.93 | 0.00 | 0.00 | 0.09 | 0.00 | 0.00 | 0.19 |
| Cytotoxic Vector / Rout | 400 | 88% | 87% | 0.14 | 0% | 6.0 | 44 | 0.00 | 0.96 | 0.00 | 0.00 | 0.00 | 0.14 | 0.00 | 0.19 |
| Cytotoxic Vector / Ricochet | 400 | 89% | 89% | 0.11 | 0% | 5.8 | 34 | 2.73 | 0.82 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.14 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 92% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 2.37 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.68 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 30 | 2.73 | 2.08 | 0.00 | 0.00 | 0.00 | 0.00 | 0.52 | 0.68 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 93% | 92% | 0.07 | 0% | 5.8 | 30 | 2.73 | 0.85 | 2.17 | 0.00 | 0.00 | 0.00 | 0.00 | 0.18 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 89% | 89% | 0.11 | 0% | 5.8 | 34 | 2.73 | 0.82 | 0.00 | 2.15 | 0.00 | 0.00 | 0.00 | 0.14 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 89% | 89% | 0.11 | 0% | 5.8 | 34 | 2.73 | 0.80 | 0.00 | 0.00 | 0.11 | 0.00 | 0.00 | 0.14 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 89% | 89% | 0.11 | 0% | 5.8 | 33 | 2.73 | 0.83 | 0.00 | 0.00 | 0.00 | 0.28 | 0.00 | 0.14 |
| Contagion Vector / Contagion Vector | 400 | 92% | 91% | 0.09 | 0% | 5.8 | 40 | 0.00 | 1.43 | 0.00 | 0.00 | 0.00 | 0.00 | 1.05 | 0.49 |
| Contagion Vector / Incendiary Rounds | 400 | 92% | 91% | 0.09 | 0% | 5.9 | 40 | 0.00 | 0.86 | 1.23 | 0.00 | 0.00 | 0.00 | 0.77 | 0.18 |
| Contagion Vector / Spotter’s Eye | 400 | 89% | 88% | 0.13 | 0% | 5.9 | 43 | 0.00 | 0.85 | 0.00 | 1.19 | 0.00 | 0.00 | 0.77 | 0.19 |
| Contagion Vector / Breacher | 400 | 90% | 89% | 0.12 | 0% | 5.9 | 43 | 0.00 | 0.84 | 0.00 | 0.00 | 0.09 | 0.00 | 0.77 | 0.18 |
| Contagion Vector / Rout | 400 | 89% | 88% | 0.13 | 0% | 5.9 | 42 | 0.00 | 0.87 | 0.00 | 0.00 | 0.00 | 0.14 | 0.75 | 0.19 |
| Contagion Vector / Ricochet | 400 | 90% | 90% | 0.10 | 0% | 5.8 | 33 | 2.73 | 0.75 | 0.00 | 0.00 | 0.00 | 0.00 | 0.59 | 0.14 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 92% | 92% | 0.08 | 0% | 5.8 | 30 | 2.73 | 2.16 | 0.00 | 0.00 | 0.00 | 0.00 | 0.36 | 0.68 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 92% | 91% | 0.09 | 0% | 5.8 | 30 | 2.73 | 1.98 | 0.00 | 0.00 | 0.00 | 0.00 | 0.70 | 0.68 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 30 | 2.73 | 0.80 | 2.16 | 0.00 | 0.00 | 0.00 | 0.59 | 0.18 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 90% | 90% | 0.10 | 0% | 5.8 | 33 | 2.73 | 0.75 | 0.00 | 2.14 | 0.00 | 0.00 | 0.59 | 0.14 |
| Contagion Vector / Ricochet + Breacher | 400 | 90% | 90% | 0.10 | 0% | 5.7 | 33 | 2.73 | 0.73 | 0.00 | 0.00 | 0.11 | 0.00 | 0.59 | 0.14 |
| Contagion Vector / Ricochet + Rout | 400 | 90% | 90% | 0.10 | 0% | 5.8 | 33 | 2.73 | 0.77 | 0.00 | 0.00 | 0.00 | 0.28 | 0.55 | 0.14 |
| Incendiary Rounds / Incendiary Rounds | 400 | 92% | 90% | 0.11 | 0% | 5.9 | 41 | 0.00 | 0.00 | 2.27 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 89% | 88% | 0.14 | 0% | 5.9 | 44 | 0.00 | 0.00 | 1.13 | 1.20 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 89% | 88% | 0.13 | 0% | 5.9 | 44 | 0.00 | 0.00 | 1.13 | 0.00 | 0.09 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 89% | 88% | 0.14 | 0% | 5.9 | 43 | 0.00 | 0.00 | 1.15 | 0.00 | 0.00 | 0.14 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 89% | 89% | 0.11 | 0% | 5.8 | 34 | 2.73 | 0.00 | 0.95 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 91% | 91% | 0.09 | 0% | 5.7 | 31 | 2.73 | 1.62 | 0.99 | 0.00 | 0.00 | 0.00 | 0.00 | 0.53 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 91% | 91% | 0.09 | 0% | 5.7 | 30 | 2.73 | 1.40 | 0.98 | 0.00 | 0.00 | 0.00 | 0.57 | 0.53 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 92% | 92% | 0.08 | 0% | 5.7 | 30 | 2.73 | 0.00 | 3.06 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 89% | 89% | 0.11 | 0% | 5.8 | 34 | 2.73 | 0.00 | 0.95 | 2.14 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 89% | 88% | 0.12 | 0% | 5.7 | 33 | 2.73 | 0.00 | 0.94 | 0.00 | 0.11 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 89% | 89% | 0.11 | 0% | 5.8 | 33 | 2.73 | 0.00 | 0.96 | 0.00 | 0.00 | 0.28 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 87% | 86% | 0.15 | 0% | 6.0 | 47 | 0.00 | 0.00 | 0.00 | 2.19 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 88% | 87% | 0.14 | 0% | 6.0 | 46 | 0.00 | 0.00 | 0.00 | 1.12 | 0.10 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 87% | 86% | 0.15 | 0% | 6.0 | 45 | 0.00 | 0.00 | 0.00 | 1.15 | 0.00 | 0.15 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.94 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 32 | 2.73 | 1.63 | 0.00 | 0.98 | 0.00 | 0.00 | 0.00 | 0.52 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 1.41 | 0.00 | 0.98 | 0.00 | 0.00 | 0.58 | 0.52 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 0.00 | 2.16 | 1.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 88% | 88% | 0.12 | 0% | 5.8 | 35 | 2.73 | 0.00 | 0.00 | 0.94 | 0.12 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.96 | 0.00 | 0.31 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 88% | 87% | 0.15 | 0% | 6.0 | 46 | 0.00 | 0.00 | 0.00 | 0.00 | 0.14 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 87% | 86% | 0.15 | 0% | 5.9 | 45 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 0.14 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.05 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 32 | 2.73 | 1.63 | 0.00 | 0.00 | 0.05 | 0.00 | 0.00 | 0.50 |
| Breacher / Ricochet + Contagion Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 1.41 | 0.00 | 0.00 | 0.05 | 0.00 | 0.59 | 0.50 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 92% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 0.00 | 2.14 | 0.00 | 0.04 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 2.13 | 0.05 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 89% | 89% | 0.12 | 0% | 5.8 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.16 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.05 | 0.28 | 0.00 | 0.00 |
| Rout / Rout | 400 | 87% | 86% | 0.15 | 0% | 6.0 | 44 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.33 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 32 | 2.73 | 1.62 | 0.00 | 0.00 | 0.00 | 0.12 | 0.00 | 0.52 |
| Rout / Ricochet + Contagion Vector | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 1.41 | 0.00 | 0.00 | 0.00 | 0.12 | 0.58 | 0.52 |
| Rout / Ricochet + Incendiary Rounds | 400 | 91% | 91% | 0.09 | 0% | 5.8 | 31 | 2.73 | 0.00 | 2.15 | 0.00 | 0.00 | 0.12 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 2.14 | 0.00 | 0.13 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 88% | 88% | 0.12 | 0% | 5.8 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.11 | 0.13 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 89% | 89% | 0.11 | 0% | 5.9 | 35 | 2.73 | 0.00 | 0.00 | 0.00 | 0.00 | 0.37 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 27 | 5.30 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 95% | 95% | 0.06 | 0% | 5.7 | 25 | 5.29 | 1.08 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.46 |
| Ricochet / Ricochet + Contagion Vector | 400 | 95% | 95% | 0.06 | 0% | 5.7 | 25 | 5.29 | 0.93 | 0.00 | 0.00 | 0.00 | 0.00 | 0.59 | 0.46 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 95% | 95% | 0.06 | 0% | 5.8 | 24 | 5.29 | 0.00 | 1.52 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 27 | 5.30 | 0.00 | 0.00 | 1.58 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 93% | 93% | 0.08 | 0% | 5.8 | 26 | 5.28 | 0.00 | 0.00 | 0.00 | 0.11 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 26 | 5.30 | 0.00 | 0.00 | 0.00 | 0.00 | 0.25 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 96% | 96% | 0.04 | 0% | 5.7 | 24 | 5.30 | 2.46 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.78 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 96% | 95% | 0.05 | 0% | 5.6 | 24 | 5.30 | 2.28 | 0.00 | 0.00 | 0.00 | 0.00 | 0.29 | 0.78 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 96% | 96% | 0.04 | 0% | 5.7 | 23 | 5.30 | 1.63 | 1.53 | 0.00 | 0.00 | 0.00 | 0.00 | 0.36 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 26 | 5.32 | 1.60 | 0.00 | 1.57 | 0.00 | 0.00 | 0.00 | 0.33 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 25 | 5.30 | 1.60 | 0.00 | 0.00 | 0.11 | 0.00 | 0.00 | 0.34 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 25 | 5.32 | 1.59 | 0.00 | 0.00 | 0.00 | 0.25 | 0.00 | 0.33 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 96% | 96% | 0.04 | 0% | 5.6 | 23 | 5.30 | 2.09 | 0.00 | 0.00 | 0.00 | 0.00 | 0.58 | 0.78 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 96% | 96% | 0.04 | 0% | 5.7 | 23 | 5.30 | 1.40 | 1.53 | 0.00 | 0.00 | 0.00 | 0.54 | 0.36 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 95% | 95% | 0.05 | 0% | 5.7 | 25 | 5.32 | 1.39 | 0.00 | 1.57 | 0.00 | 0.00 | 0.55 | 0.33 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 95% | 95% | 0.05 | 0% | 5.7 | 24 | 5.29 | 1.39 | 0.00 | 0.00 | 0.11 | 0.00 | 0.55 | 0.34 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 95% | 95% | 0.05 | 0% | 5.7 | 25 | 5.32 | 1.38 | 0.00 | 0.00 | 0.00 | 0.25 | 0.55 | 0.33 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 96% | 96% | 0.04 | 0% | 5.7 | 23 | 5.28 | 0.00 | 3.26 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 94% | 94% | 0.06 | 0% | 5.8 | 25 | 5.30 | 0.00 | 1.91 | 1.59 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 94% | 94% | 0.07 | 0% | 5.8 | 25 | 5.28 | 0.00 | 1.92 | 0.00 | 0.11 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 94% | 94% | 0.06 | 0% | 5.8 | 25 | 5.30 | 0.00 | 1.90 | 0.00 | 0.00 | 0.25 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 27 | 5.30 | 0.00 | 0.00 | 3.24 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 93% | 93% | 0.08 | 0% | 5.8 | 26 | 5.28 | 0.00 | 0.00 | 1.93 | 0.12 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 26 | 5.30 | 0.00 | 0.00 | 1.91 | 0.00 | 0.28 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 92% | 92% | 0.08 | 0% | 5.8 | 26 | 5.27 | 0.00 | 0.00 | 0.00 | 0.18 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 93% | 93% | 0.08 | 0% | 5.8 | 26 | 5.29 | 0.00 | 0.00 | 0.00 | 0.07 | 0.25 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 93% | 93% | 0.07 | 0% | 5.8 | 26 | 5.30 | 0.00 | 0.00 | 0.00 | 0.00 | 0.47 | 0.00 | 0.00 |

## armoured, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 43% | 24% | 1.34 | 0% | 5.8 | 134 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 46% | 27% | 1.23 | 0% | 5.7 | 132 | 0.00 | 0.47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.19 |
| Contagion Vector | 400 | 52% | 35% | 0.98 | 0% | 5.7 | 125 | 0.00 | 0.41 | 0.00 | 0.00 | 0.00 | 0.00 | 1.15 | 0.21 |
| Incendiary Rounds | 400 | 49% | 30% | 1.13 | 0% | 5.8 | 129 | 0.00 | 0.00 | 1.27 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 43% | 24% | 1.34 | 0% | 5.8 | 134 | 0.00 | 0.00 | 0.00 | 1.21 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 46% | 28% | 1.27 | 0% | 5.8 | 131 | 0.00 | 0.00 | 0.00 | 0.00 | 0.53 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 46% | 31% | 1.18 | 0% | 5.7 | 128 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.51 | 0.00 | 0.00 |
| Ricochet | 400 | 43% | 30% | 1.18 | 0% | 5.6 | 120 | 2.74 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 48% | 35% | 0.99 | 0% | 5.5 | 115 | 2.74 | 0.76 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.57 |
| Ricochet + Contagion Vector | 400 | 55% | 44% | 0.75 | 0% | 5.4 | 105 | 2.74 | 0.65 | 0.00 | 0.00 | 0.00 | 0.00 | 1.67 | 0.61 |
| Ricochet + Incendiary Rounds | 400 | 61% | 49% | 0.64 | 0% | 5.5 | 103 | 2.74 | 0.00 | 2.91 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 43% | 30% | 1.18 | 0% | 5.6 | 120 | 2.74 | 0.00 | 0.00 | 2.65 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 56% | 45% | 0.84 | 0% | 5.7 | 108 | 2.74 | 0.00 | 0.00 | 0.00 | 1.35 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 50% | 38% | 0.97 | 0% | 5.5 | 111 | 2.74 | 0.00 | 0.00 | 0.00 | 0.00 | 0.82 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 47% | 30% | 1.17 | 0% | 5.7 | 130 | 0.00 | 0.82 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.32 |
| Cytotoxic Vector / Contagion Vector | 400 | 52% | 37% | 0.94 | 0% | 5.6 | 124 | 0.00 | 0.73 | 0.00 | 0.00 | 0.00 | 0.00 | 1.14 | 0.36 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 50% | 33% | 1.07 | 0% | 5.7 | 127 | 0.00 | 0.35 | 1.28 | 0.00 | 0.00 | 0.00 | 0.00 | 0.17 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 44% | 27% | 1.28 | 0% | 5.7 | 132 | 0.00 | 0.35 | 0.00 | 1.22 | 0.00 | 0.00 | 0.00 | 0.15 |
| Cytotoxic Vector / Breacher | 400 | 47% | 31% | 1.22 | 0% | 5.8 | 129 | 0.00 | 0.34 | 0.00 | 0.00 | 0.53 | 0.00 | 0.00 | 0.17 |
| Cytotoxic Vector / Rout | 400 | 47% | 34% | 1.14 | 0% | 5.7 | 127 | 0.00 | 0.34 | 0.00 | 0.00 | 0.00 | 0.51 | 0.00 | 0.17 |
| Cytotoxic Vector / Ricochet | 400 | 44% | 31% | 1.13 | 0% | 5.5 | 119 | 2.74 | 0.31 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.14 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 48% | 36% | 0.96 | 0% | 5.4 | 113 | 2.74 | 1.06 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.72 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 55% | 45% | 0.73 | 0% | 5.4 | 105 | 2.74 | 0.90 | 0.00 | 0.00 | 0.00 | 0.00 | 1.63 | 0.77 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 61% | 49% | 0.61 | 0% | 5.5 | 101 | 2.74 | 0.30 | 2.92 | 0.00 | 0.00 | 0.00 | 0.00 | 0.21 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 44% | 31% | 1.13 | 0% | 5.5 | 119 | 2.74 | 0.31 | 0.00 | 2.66 | 0.00 | 0.00 | 0.00 | 0.14 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 58% | 46% | 0.81 | 0% | 5.7 | 107 | 2.74 | 0.28 | 0.00 | 0.00 | 1.34 | 0.00 | 0.00 | 0.21 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 50% | 39% | 0.93 | 0% | 5.4 | 109 | 2.74 | 0.29 | 0.00 | 0.00 | 0.00 | 0.82 | 0.00 | 0.19 |
| Contagion Vector / Contagion Vector | 400 | 56% | 40% | 0.80 | 0% | 5.5 | 119 | 0.00 | 0.67 | 0.00 | 0.00 | 0.00 | 0.00 | 1.70 | 0.37 |
| Contagion Vector / Incendiary Rounds | 400 | 54% | 37% | 0.89 | 0% | 5.6 | 122 | 0.00 | 0.30 | 1.28 | 0.00 | 0.00 | 0.00 | 0.79 | 0.17 |
| Contagion Vector / Spotter’s Eye | 400 | 49% | 32% | 1.04 | 0% | 5.6 | 126 | 0.00 | 0.30 | 0.00 | 1.22 | 0.00 | 0.00 | 0.83 | 0.16 |
| Contagion Vector / Breacher | 400 | 53% | 35% | 0.98 | 0% | 5.6 | 123 | 0.00 | 0.29 | 0.00 | 0.00 | 0.53 | 0.00 | 0.85 | 0.18 |
| Contagion Vector / Rout | 400 | 52% | 37% | 0.94 | 0% | 5.5 | 122 | 0.00 | 0.30 | 0.00 | 0.00 | 0.00 | 0.51 | 0.80 | 0.18 |
| Contagion Vector / Ricochet | 400 | 47% | 35% | 0.98 | 0% | 5.4 | 114 | 2.74 | 0.28 | 0.00 | 0.00 | 0.00 | 0.00 | 0.54 | 0.14 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 50% | 38% | 0.85 | 0% | 5.3 | 110 | 2.74 | 1.01 | 0.00 | 0.00 | 0.00 | 0.00 | 0.45 | 0.73 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 56% | 46% | 0.69 | 0% | 5.4 | 104 | 2.74 | 0.88 | 0.00 | 0.00 | 0.00 | 0.00 | 1.78 | 0.77 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 61% | 51% | 0.58 | 0% | 5.5 | 100 | 2.74 | 0.27 | 2.92 | 0.00 | 0.00 | 0.00 | 0.49 | 0.21 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 47% | 35% | 0.98 | 0% | 5.4 | 114 | 2.74 | 0.28 | 0.00 | 2.66 | 0.00 | 0.00 | 0.54 | 0.14 |
| Contagion Vector / Ricochet + Breacher | 400 | 60% | 48% | 0.71 | 0% | 5.6 | 103 | 2.74 | 0.25 | 0.00 | 0.00 | 1.34 | 0.00 | 0.53 | 0.21 |
| Contagion Vector / Ricochet + Rout | 400 | 52% | 41% | 0.84 | 0% | 5.3 | 106 | 2.74 | 0.26 | 0.00 | 0.00 | 0.00 | 0.82 | 0.49 | 0.19 |
| Incendiary Rounds / Incendiary Rounds | 400 | 50% | 35% | 1.02 | 0% | 5.7 | 125 | 0.00 | 0.00 | 2.17 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 45% | 30% | 1.19 | 0% | 5.7 | 129 | 0.00 | 0.00 | 0.97 | 1.23 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 48% | 33% | 1.12 | 0% | 5.7 | 126 | 0.00 | 0.00 | 0.97 | 0.00 | 0.53 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 49% | 36% | 1.04 | 0% | 5.6 | 123 | 0.00 | 0.00 | 0.98 | 0.00 | 0.00 | 0.51 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 45% | 32% | 1.07 | 0% | 5.5 | 117 | 2.74 | 0.00 | 0.70 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 49% | 37% | 0.93 | 0% | 5.4 | 112 | 2.74 | 0.77 | 0.72 | 0.00 | 0.00 | 0.00 | 0.00 | 0.58 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 55% | 45% | 0.72 | 0% | 5.4 | 104 | 2.74 | 0.65 | 0.73 | 0.00 | 0.00 | 0.00 | 1.66 | 0.61 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 61% | 50% | 0.60 | 0% | 5.5 | 101 | 2.74 | 0.00 | 3.51 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 45% | 32% | 1.07 | 0% | 5.5 | 117 | 2.74 | 0.00 | 0.70 | 2.66 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 59% | 46% | 0.77 | 0% | 5.7 | 105 | 2.74 | 0.00 | 0.70 | 0.00 | 1.34 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 51% | 40% | 0.89 | 0% | 5.4 | 108 | 2.74 | 0.00 | 0.72 | 0.00 | 0.00 | 0.82 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 43% | 24% | 1.34 | 0% | 5.8 | 134 | 0.00 | 0.00 | 0.00 | 2.03 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 46% | 28% | 1.26 | 0% | 5.8 | 131 | 0.00 | 0.00 | 0.00 | 0.91 | 0.60 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 49% | 35% | 1.06 | 0% | 5.6 | 123 | 0.00 | 0.00 | 0.00 | 0.94 | 0.00 | 0.60 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 43% | 30% | 1.18 | 0% | 5.6 | 120 | 2.74 | 0.00 | 0.00 | 0.70 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 48% | 35% | 0.99 | 0% | 5.5 | 115 | 2.74 | 0.76 | 0.00 | 0.72 | 0.00 | 0.00 | 0.00 | 0.57 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 55% | 44% | 0.75 | 0% | 5.4 | 105 | 2.74 | 0.65 | 0.00 | 0.73 | 0.00 | 0.00 | 1.67 | 0.61 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 61% | 49% | 0.64 | 0% | 5.5 | 103 | 2.74 | 0.00 | 2.91 | 0.77 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 43% | 30% | 1.18 | 0% | 5.6 | 120 | 2.74 | 0.00 | 0.00 | 3.15 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 58% | 46% | 0.81 | 0% | 5.7 | 107 | 2.74 | 0.00 | 0.00 | 0.68 | 1.40 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 51% | 41% | 0.90 | 0% | 5.4 | 107 | 2.74 | 0.00 | 0.00 | 0.71 | 0.00 | 0.91 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 45% | 28% | 1.26 | 0% | 5.8 | 129 | 0.00 | 0.00 | 0.00 | 0.00 | 0.94 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 48% | 33% | 1.14 | 0% | 5.7 | 127 | 0.00 | 0.00 | 0.00 | 0.00 | 0.45 | 0.51 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 45% | 31% | 1.10 | 0% | 5.5 | 118 | 2.74 | 0.00 | 0.00 | 0.00 | 0.25 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 47% | 36% | 0.95 | 0% | 5.5 | 113 | 2.74 | 0.74 | 0.00 | 0.00 | 0.26 | 0.00 | 0.00 | 0.58 |
| Breacher / Ricochet + Contagion Vector | 400 | 56% | 45% | 0.70 | 0% | 5.4 | 103 | 2.74 | 0.63 | 0.00 | 0.00 | 0.25 | 0.00 | 1.67 | 0.62 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 62% | 51% | 0.59 | 0% | 5.5 | 101 | 2.74 | 0.00 | 2.83 | 0.00 | 0.28 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 45% | 32% | 1.08 | 0% | 5.5 | 117 | 2.74 | 0.00 | 0.00 | 2.58 | 0.30 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 58% | 47% | 0.78 | 0% | 5.7 | 106 | 2.74 | 0.00 | 0.00 | 0.00 | 1.53 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 51% | 40% | 0.92 | 0% | 5.5 | 109 | 2.74 | 0.00 | 0.00 | 0.00 | 0.24 | 0.84 | 0.00 | 0.00 |
| Rout / Rout | 400 | 48% | 35% | 1.10 | 0% | 5.7 | 126 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.79 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 45% | 32% | 1.09 | 0% | 5.5 | 118 | 2.74 | 0.00 | 0.00 | 0.00 | 0.00 | 0.18 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 49% | 37% | 0.91 | 0% | 5.4 | 112 | 2.74 | 0.77 | 0.00 | 0.00 | 0.00 | 0.17 | 0.00 | 0.57 |
| Rout / Ricochet + Contagion Vector | 400 | 56% | 46% | 0.69 | 0% | 5.4 | 104 | 2.74 | 0.66 | 0.00 | 0.00 | 0.00 | 0.16 | 1.64 | 0.60 |
| Rout / Ricochet + Incendiary Rounds | 400 | 61% | 50% | 0.62 | 0% | 5.5 | 101 | 2.74 | 0.00 | 2.90 | 0.00 | 0.00 | 0.15 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 46% | 34% | 1.06 | 0% | 5.4 | 116 | 2.74 | 0.00 | 0.00 | 2.66 | 0.00 | 0.26 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 59% | 48% | 0.77 | 0% | 5.7 | 105 | 2.74 | 0.00 | 0.00 | 0.00 | 1.35 | 0.19 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 51% | 40% | 0.90 | 0% | 5.4 | 108 | 2.74 | 0.00 | 0.00 | 0.00 | 0.00 | 0.97 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 53% | 44% | 0.81 | 0% | 5.5 | 103 | 5.22 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 58% | 50% | 0.62 | 0% | 5.4 | 97 | 5.26 | 0.78 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.55 |
| Ricochet / Ricochet + Contagion Vector | 400 | 66% | 59% | 0.46 | 0% | 5.4 | 90 | 5.32 | 0.69 | 0.00 | 0.00 | 0.00 | 0.00 | 1.53 | 0.56 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 69% | 62% | 0.44 | 0% | 5.5 | 89 | 5.47 | 0.00 | 2.48 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 53% | 44% | 0.81 | 0% | 5.5 | 103 | 5.22 | 0.00 | 0.00 | 2.38 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 61% | 52% | 0.65 | 0% | 5.6 | 94 | 5.39 | 0.00 | 0.00 | 0.00 | 0.98 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 58% | 52% | 0.66 | 0% | 5.4 | 94 | 5.24 | 0.00 | 0.00 | 0.00 | 0.00 | 0.97 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 60% | 53% | 0.55 | 0% | 5.3 | 93 | 5.28 | 1.57 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.99 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 67% | 60% | 0.44 | 0% | 5.4 | 89 | 5.33 | 1.39 | 0.00 | 0.00 | 0.00 | 0.00 | 1.43 | 1.04 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 70% | 64% | 0.42 | 0% | 5.5 | 88 | 5.49 | 0.88 | 2.48 | 0.00 | 0.00 | 0.00 | 0.00 | 0.66 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 54% | 46% | 0.76 | 0% | 5.4 | 100 | 5.24 | 0.80 | 0.00 | 2.37 | 0.00 | 0.00 | 0.00 | 0.57 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 62% | 54% | 0.62 | 0% | 5.6 | 93 | 5.40 | 0.74 | 0.00 | 0.00 | 0.97 | 0.00 | 0.00 | 0.62 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 60% | 54% | 0.61 | 0% | 5.4 | 91 | 5.25 | 0.75 | 0.00 | 0.00 | 0.00 | 0.96 | 0.00 | 0.65 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 68% | 62% | 0.41 | 0% | 5.4 | 87 | 5.35 | 1.27 | 0.00 | 0.00 | 0.00 | 0.00 | 2.01 | 1.09 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 72% | 67% | 0.36 | 0% | 5.5 | 84 | 5.51 | 0.79 | 2.50 | 0.00 | 0.00 | 0.00 | 1.34 | 0.68 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 59% | 52% | 0.58 | 0% | 5.3 | 93 | 5.26 | 0.69 | 0.00 | 2.39 | 0.00 | 0.00 | 1.42 | 0.60 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 65% | 58% | 0.52 | 0% | 5.5 | 88 | 5.42 | 0.66 | 0.00 | 0.00 | 0.96 | 0.00 | 1.40 | 0.64 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 63% | 57% | 0.51 | 0% | 5.3 | 87 | 5.27 | 0.68 | 0.00 | 0.00 | 0.00 | 0.96 | 1.28 | 0.67 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 73% | 70% | 0.34 | 0% | 5.6 | 84 | 5.58 | 0.00 | 4.66 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 63% | 58% | 0.48 | 0% | 5.4 | 90 | 5.33 | 0.00 | 2.54 | 2.47 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 69% | 65% | 0.40 | 0% | 5.6 | 84 | 5.50 | 0.00 | 2.53 | 0.00 | 0.97 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 67% | 64% | 0.40 | 0% | 5.4 | 83 | 5.34 | 0.00 | 2.55 | 0.00 | 0.00 | 0.93 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 53% | 44% | 0.81 | 0% | 5.5 | 103 | 5.22 | 0.00 | 0.00 | 4.11 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 62% | 56% | 0.57 | 0% | 5.5 | 91 | 5.39 | 0.00 | 0.00 | 2.31 | 1.34 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 60% | 55% | 0.59 | 0% | 5.3 | 88 | 5.24 | 0.00 | 0.00 | 2.42 | 0.00 | 1.26 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 67% | 62% | 0.46 | 0% | 5.6 | 83 | 5.46 | 0.00 | 0.00 | 0.00 | 1.86 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 63% | 60% | 0.48 | 0% | 5.4 | 82 | 5.30 | 0.00 | 0.00 | 0.00 | 0.98 | 1.00 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 63% | 57% | 0.53 | 0% | 5.3 | 87 | 5.24 | 0.00 | 0.00 | 0.00 | 0.00 | 1.53 | 0.00 | 0.00 |

## swarm, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 69% | 60% | 0.56 | 0% | 5.8 | 90 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 71% | 65% | 0.46 | 0% | 5.7 | 86 | 0.00 | 0.70 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 |
| Contagion Vector | 400 | 76% | 71% | 0.35 | 0% | 5.7 | 80 | 0.00 | 0.65 | 0.00 | 0.00 | 0.00 | 0.00 | 1.81 | 0.09 |
| Incendiary Rounds | 400 | 71% | 65% | 0.46 | 0% | 5.7 | 86 | 0.00 | 0.00 | 0.77 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 69% | 60% | 0.56 | 0% | 5.8 | 90 | 0.00 | 0.00 | 0.00 | 0.78 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 69% | 60% | 0.56 | 0% | 5.8 | 90 | 0.00 | 0.00 | 0.00 | 0.00 | 0.02 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 74% | 67% | 0.47 | 0% | 5.8 | 84 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.82 | 0.00 | 0.00 |
| Ricochet | 400 | 74% | 71% | 0.36 | 0% | 5.7 | 71 | 2.85 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 80% | 78% | 0.24 | 0% | 5.6 | 61 | 2.85 | 1.69 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.11 |
| Ricochet + Contagion Vector | 400 | 84% | 83% | 0.17 | 0% | 5.5 | 54 | 2.85 | 1.33 | 0.00 | 0.00 | 0.00 | 0.00 | 2.82 | 0.12 |
| Ricochet + Incendiary Rounds | 400 | 80% | 78% | 0.23 | 0% | 5.6 | 61 | 2.85 | 0.00 | 1.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 74% | 71% | 0.36 | 0% | 5.7 | 71 | 2.85 | 0.00 | 0.00 | 1.77 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 75% | 71% | 0.36 | 0% | 5.7 | 70 | 2.85 | 0.00 | 0.00 | 0.00 | 0.02 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 80% | 78% | 0.28 | 0% | 5.6 | 58 | 2.85 | 0.00 | 0.00 | 0.00 | 0.00 | 1.49 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 72% | 67% | 0.40 | 0% | 5.7 | 83 | 0.00 | 1.48 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 |
| Cytotoxic Vector / Contagion Vector | 400 | 77% | 72% | 0.30 | 0% | 5.6 | 78 | 0.00 | 1.39 | 0.00 | 0.00 | 0.00 | 0.00 | 1.77 | 0.15 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 72% | 67% | 0.40 | 0% | 5.7 | 83 | 0.00 | 0.78 | 0.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 71% | 62% | 0.47 | 0% | 5.7 | 87 | 0.00 | 0.76 | 0.00 | 0.80 | 0.00 | 0.00 | 0.00 | 0.06 |
| Cytotoxic Vector / Breacher | 400 | 71% | 62% | 0.47 | 0% | 5.7 | 87 | 0.00 | 0.76 | 0.00 | 0.00 | 0.02 | 0.00 | 0.00 | 0.06 |
| Cytotoxic Vector / Rout | 400 | 75% | 68% | 0.40 | 0% | 5.7 | 81 | 0.00 | 0.77 | 0.00 | 0.00 | 0.00 | 0.82 | 0.00 | 0.07 |
| Cytotoxic Vector / Ricochet | 400 | 75% | 72% | 0.34 | 0% | 5.6 | 69 | 2.85 | 0.66 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 80% | 78% | 0.23 | 0% | 5.6 | 60 | 2.85 | 2.32 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.17 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 84% | 83% | 0.17 | 0% | 5.5 | 54 | 2.85 | 1.91 | 0.00 | 0.00 | 0.00 | 0.00 | 2.77 | 0.18 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 80% | 79% | 0.22 | 0% | 5.5 | 60 | 2.85 | 0.66 | 1.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.08 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 75% | 72% | 0.34 | 0% | 5.6 | 69 | 2.85 | 0.66 | 0.00 | 1.77 | 0.00 | 0.00 | 0.00 | 0.07 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 75% | 72% | 0.34 | 0% | 5.6 | 69 | 2.85 | 0.66 | 0.00 | 0.00 | 0.02 | 0.00 | 0.00 | 0.06 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 81% | 79% | 0.25 | 0% | 5.6 | 57 | 2.85 | 0.66 | 0.00 | 0.00 | 0.00 | 1.50 | 0.00 | 0.09 |
| Contagion Vector / Contagion Vector | 400 | 80% | 76% | 0.24 | 0% | 5.6 | 73 | 0.00 | 1.28 | 0.00 | 0.00 | 0.00 | 0.00 | 2.75 | 0.17 |
| Contagion Vector / Incendiary Rounds | 400 | 76% | 73% | 0.30 | 0% | 5.6 | 77 | 0.00 | 0.67 | 0.81 | 0.00 | 0.00 | 0.00 | 1.51 | 0.08 |
| Contagion Vector / Spotter’s Eye | 400 | 75% | 70% | 0.33 | 0% | 5.7 | 79 | 0.00 | 0.65 | 0.00 | 0.82 | 0.00 | 0.00 | 1.56 | 0.07 |
| Contagion Vector / Breacher | 400 | 75% | 70% | 0.33 | 0% | 5.7 | 79 | 0.00 | 0.65 | 0.00 | 0.00 | 0.02 | 0.00 | 1.56 | 0.07 |
| Contagion Vector / Rout | 400 | 78% | 75% | 0.28 | 0% | 5.7 | 75 | 0.00 | 0.67 | 0.00 | 0.00 | 0.00 | 0.81 | 1.45 | 0.08 |
| Contagion Vector / Ricochet | 400 | 76% | 74% | 0.29 | 0% | 5.6 | 66 | 2.85 | 0.60 | 0.00 | 0.00 | 0.00 | 0.00 | 1.01 | 0.06 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 81% | 79% | 0.21 | 0% | 5.5 | 59 | 2.85 | 2.14 | 0.00 | 0.00 | 0.00 | 0.00 | 0.82 | 0.18 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 84% | 83% | 0.17 | 0% | 5.5 | 53 | 2.85 | 1.84 | 0.00 | 0.00 | 0.00 | 0.00 | 2.95 | 0.19 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 81% | 79% | 0.20 | 0% | 5.5 | 59 | 2.85 | 0.62 | 1.81 | 0.00 | 0.00 | 0.00 | 0.95 | 0.08 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 76% | 74% | 0.29 | 0% | 5.6 | 66 | 2.85 | 0.60 | 0.00 | 1.78 | 0.00 | 0.00 | 1.01 | 0.06 |
| Contagion Vector / Ricochet + Breacher | 400 | 76% | 74% | 0.28 | 0% | 5.6 | 65 | 2.85 | 0.60 | 0.00 | 0.00 | 0.02 | 0.00 | 1.01 | 0.06 |
| Contagion Vector / Ricochet + Rout | 400 | 82% | 80% | 0.22 | 0% | 5.6 | 55 | 2.85 | 0.62 | 0.00 | 0.00 | 0.00 | 1.49 | 0.88 | 0.09 |
| Incendiary Rounds / Incendiary Rounds | 400 | 72% | 67% | 0.40 | 0% | 5.6 | 83 | 0.00 | 0.00 | 1.61 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 71% | 62% | 0.47 | 0% | 5.7 | 87 | 0.00 | 0.00 | 0.82 | 0.80 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 71% | 62% | 0.47 | 0% | 5.7 | 87 | 0.00 | 0.00 | 0.81 | 0.00 | 0.02 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 75% | 68% | 0.40 | 0% | 5.7 | 81 | 0.00 | 0.00 | 0.83 | 0.00 | 0.00 | 0.82 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 75% | 72% | 0.34 | 0% | 5.6 | 69 | 2.85 | 0.00 | 0.72 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 80% | 78% | 0.23 | 0% | 5.6 | 60 | 2.85 | 1.69 | 0.74 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 84% | 82% | 0.17 | 0% | 5.5 | 54 | 2.85 | 1.34 | 0.79 | 0.00 | 0.00 | 0.00 | 2.81 | 0.11 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 80% | 79% | 0.22 | 0% | 5.5 | 60 | 2.85 | 0.00 | 2.50 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 75% | 72% | 0.34 | 0% | 5.6 | 69 | 2.85 | 0.00 | 0.72 | 1.77 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 75% | 72% | 0.34 | 0% | 5.6 | 69 | 2.85 | 0.00 | 0.72 | 0.00 | 0.02 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 81% | 79% | 0.25 | 0% | 5.6 | 57 | 2.85 | 0.00 | 0.75 | 0.00 | 0.00 | 1.50 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 69% | 60% | 0.56 | 0% | 5.8 | 90 | 0.00 | 0.00 | 0.00 | 1.56 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 69% | 60% | 0.56 | 0% | 5.8 | 90 | 0.00 | 0.00 | 0.00 | 0.80 | 0.02 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 74% | 67% | 0.46 | 0% | 5.8 | 83 | 0.00 | 0.00 | 0.00 | 0.82 | 0.00 | 0.89 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 74% | 71% | 0.36 | 0% | 5.7 | 71 | 2.85 | 0.00 | 0.00 | 0.72 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 80% | 78% | 0.24 | 0% | 5.6 | 61 | 2.85 | 1.69 | 0.00 | 0.73 | 0.00 | 0.00 | 0.00 | 0.11 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 84% | 83% | 0.17 | 0% | 5.5 | 54 | 2.85 | 1.33 | 0.00 | 0.80 | 0.00 | 0.00 | 2.82 | 0.12 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 80% | 78% | 0.23 | 0% | 5.6 | 61 | 2.85 | 0.00 | 1.79 | 0.73 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 74% | 71% | 0.36 | 0% | 5.7 | 71 | 2.85 | 0.00 | 0.00 | 2.45 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 75% | 71% | 0.36 | 0% | 5.7 | 70 | 2.85 | 0.00 | 0.00 | 0.71 | 0.03 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 80% | 78% | 0.27 | 0% | 5.6 | 58 | 2.85 | 0.00 | 0.00 | 0.74 | 0.00 | 1.57 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 69% | 60% | 0.56 | 0% | 5.8 | 90 | 0.00 | 0.00 | 0.00 | 0.00 | 0.04 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 74% | 67% | 0.47 | 0% | 5.8 | 84 | 0.00 | 0.00 | 0.00 | 0.00 | 0.01 | 0.82 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 74% | 71% | 0.36 | 0% | 5.7 | 70 | 2.85 | 0.00 | 0.00 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 80% | 78% | 0.24 | 0% | 5.6 | 61 | 2.85 | 1.69 | 0.00 | 0.00 | 0.01 | 0.00 | 0.00 | 0.10 |
| Breacher / Ricochet + Contagion Vector | 400 | 84% | 83% | 0.17 | 0% | 5.5 | 54 | 2.85 | 1.33 | 0.00 | 0.00 | 0.01 | 0.00 | 2.82 | 0.11 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 80% | 78% | 0.23 | 0% | 5.6 | 61 | 2.85 | 0.00 | 1.79 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 74% | 71% | 0.36 | 0% | 5.7 | 70 | 2.85 | 0.00 | 0.00 | 1.77 | 0.01 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 75% | 71% | 0.36 | 0% | 5.7 | 70 | 2.85 | 0.00 | 0.00 | 0.00 | 0.03 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 80% | 78% | 0.28 | 0% | 5.6 | 58 | 2.85 | 0.00 | 0.00 | 0.00 | 0.01 | 1.49 | 0.00 | 0.00 |
| Rout / Rout | 400 | 75% | 69% | 0.42 | 0% | 5.8 | 80 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.35 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 75% | 72% | 0.34 | 0% | 5.6 | 68 | 2.85 | 0.00 | 0.00 | 0.00 | 0.00 | 0.34 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 81% | 79% | 0.22 | 0% | 5.5 | 60 | 2.85 | 1.69 | 0.00 | 0.00 | 0.00 | 0.30 | 0.00 | 0.11 |
| Rout / Ricochet + Contagion Vector | 400 | 85% | 84% | 0.16 | 0% | 5.5 | 53 | 2.85 | 1.34 | 0.00 | 0.00 | 0.00 | 0.27 | 2.79 | 0.12 |
| Rout / Ricochet + Incendiary Rounds | 400 | 81% | 79% | 0.22 | 0% | 5.5 | 60 | 2.85 | 0.00 | 1.80 | 0.00 | 0.00 | 0.30 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 76% | 73% | 0.32 | 0% | 5.6 | 67 | 2.85 | 0.00 | 0.00 | 1.78 | 0.00 | 0.47 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 76% | 72% | 0.34 | 0% | 5.7 | 68 | 2.85 | 0.00 | 0.00 | 0.00 | 0.02 | 0.34 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 81% | 79% | 0.25 | 0% | 5.6 | 56 | 2.85 | 0.00 | 0.00 | 0.00 | 0.00 | 1.71 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 85% | 83% | 0.18 | 0% | 5.7 | 54 | 5.75 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 88% | 87% | 0.14 | 0% | 5.7 | 49 | 5.72 | 1.37 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 |
| Ricochet / Ricochet + Contagion Vector | 400 | 91% | 90% | 0.10 | 0% | 5.7 | 44 | 5.67 | 1.05 | 0.00 | 0.00 | 0.00 | 0.00 | 2.52 | 0.10 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 87% | 87% | 0.14 | 0% | 5.7 | 49 | 5.72 | 0.00 | 1.47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 85% | 83% | 0.18 | 0% | 5.7 | 54 | 5.75 | 0.00 | 0.00 | 1.47 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 85% | 83% | 0.17 | 0% | 5.7 | 54 | 5.75 | 0.00 | 0.00 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 88% | 87% | 0.14 | 0% | 5.6 | 43 | 5.71 | 0.00 | 0.00 | 0.00 | 0.00 | 1.51 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 90% | 90% | 0.10 | 0% | 5.6 | 46 | 5.71 | 2.95 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.26 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 93% | 92% | 0.08 | 0% | 5.6 | 42 | 5.66 | 2.42 | 0.00 | 0.00 | 0.00 | 0.00 | 2.33 | 0.28 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 90% | 90% | 0.11 | 0% | 5.6 | 46 | 5.71 | 1.62 | 1.51 | 0.00 | 0.00 | 0.00 | 0.00 | 0.18 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 88% | 86% | 0.14 | 0% | 5.7 | 50 | 5.74 | 1.60 | 0.00 | 1.51 | 0.00 | 0.00 | 0.00 | 0.19 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 88% | 86% | 0.14 | 0% | 5.7 | 50 | 5.74 | 1.60 | 0.00 | 0.00 | 0.01 | 0.00 | 0.00 | 0.19 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 90% | 89% | 0.11 | 0% | 5.6 | 40 | 5.70 | 1.54 | 0.00 | 0.00 | 0.00 | 1.48 | 0.00 | 0.21 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 96% | 95% | 0.05 | 0% | 5.7 | 39 | 5.62 | 2.09 | 0.00 | 0.00 | 0.00 | 0.00 | 3.24 | 0.30 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 94% | 93% | 0.07 | 0% | 5.6 | 42 | 5.67 | 1.30 | 1.54 | 0.00 | 0.00 | 0.00 | 2.25 | 0.20 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 91% | 90% | 0.10 | 0% | 5.7 | 45 | 5.71 | 1.31 | 0.00 | 1.54 | 0.00 | 0.00 | 2.29 | 0.20 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 91% | 90% | 0.11 | 0% | 5.7 | 45 | 5.71 | 1.31 | 0.00 | 0.00 | 0.01 | 0.00 | 2.29 | 0.20 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 93% | 93% | 0.08 | 0% | 5.6 | 37 | 5.67 | 1.29 | 0.00 | 0.00 | 0.00 | 1.43 | 2.10 | 0.23 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 90% | 90% | 0.11 | 0% | 5.6 | 46 | 5.71 | 0.00 | 3.21 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 88% | 86% | 0.14 | 0% | 5.7 | 50 | 5.74 | 0.00 | 1.79 | 1.51 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 88% | 86% | 0.14 | 0% | 5.7 | 50 | 5.74 | 0.00 | 1.79 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 90% | 89% | 0.11 | 0% | 5.6 | 40 | 5.70 | 0.00 | 1.75 | 0.00 | 0.00 | 1.48 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 85% | 83% | 0.18 | 0% | 5.7 | 54 | 5.75 | 0.00 | 0.00 | 3.17 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 85% | 83% | 0.17 | 0% | 5.7 | 54 | 5.75 | 0.00 | 0.00 | 1.76 | 0.02 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 88% | 87% | 0.13 | 0% | 5.6 | 41 | 5.71 | 0.00 | 0.00 | 1.69 | 0.00 | 1.84 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 85% | 83% | 0.18 | 0% | 5.7 | 54 | 5.75 | 0.00 | 0.00 | 0.00 | 0.05 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 87% | 87% | 0.14 | 0% | 5.6 | 43 | 5.71 | 0.00 | 0.00 | 0.00 | 0.04 | 1.51 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 91% | 91% | 0.09 | 0% | 5.7 | 36 | 5.68 | 0.00 | 0.00 | 0.00 | 0.00 | 2.37 | 0.00 | 0.00 |

## synthetic, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 71% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.28 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.22 |
| Contagion Vector | 400 | 72% | 68% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.28 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 1.22 |
| Incendiary Rounds | 400 | 73% | 70% | 0.30 | 0% | 5.9 | 78 | 0.00 | 0.00 | 1.53 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 71% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.00 | 0.00 | 1.50 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 72% | 70% | 0.32 | 0% | 6.0 | 80 | 0.00 | 0.00 | 0.00 | 0.00 | 0.51 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 71% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 74% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.38 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.74 |
| Ricochet + Contagion Vector | 400 | 74% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.37 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 2.74 |
| Ricochet + Incendiary Rounds | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 60 | 2.97 | 0.00 | 3.23 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 3.13 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 80% | 78% | 0.23 | 0% | 6.0 | 60 | 2.97 | 0.00 | 0.00 | 0.00 | 1.24 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 81 | 0.00 | 0.55 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.10 |
| Cytotoxic Vector / Contagion Vector | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 81 | 0.00 | 0.55 | 0.00 | 0.00 | 0.00 | 0.00 | 0.04 | 2.10 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 72% | 70% | 0.30 | 0% | 5.9 | 78 | 0.00 | 0.29 | 1.53 | 0.00 | 0.00 | 0.00 | 0.00 | 1.03 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 70% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.29 | 0.00 | 1.50 | 0.00 | 0.00 | 0.00 | 1.02 |
| Cytotoxic Vector / Breacher | 400 | 72% | 70% | 0.32 | 0% | 6.0 | 80 | 0.00 | 0.28 | 0.00 | 0.00 | 0.51 | 0.00 | 0.00 | 0.97 |
| Cytotoxic Vector / Rout | 400 | 70% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.29 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.02 |
| Cytotoxic Vector / Ricochet | 400 | 74% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.25 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.69 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 75% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.59 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 3.25 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 75% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.59 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 3.25 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 83% | 82% | 0.19 | 0% | 5.9 | 59 | 2.97 | 0.33 | 3.23 | 0.00 | 0.00 | 0.00 | 0.00 | 0.74 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 74% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.25 | 0.00 | 3.13 | 0.00 | 0.00 | 0.00 | 0.69 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 81% | 78% | 0.22 | 0% | 6.0 | 60 | 2.97 | 0.34 | 0.00 | 0.00 | 1.24 | 0.00 | 0.00 | 0.58 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 74% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.25 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.69 |
| Contagion Vector / Contagion Vector | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 81 | 0.00 | 0.54 | 0.00 | 0.00 | 0.00 | 0.00 | 0.06 | 2.10 |
| Contagion Vector / Incendiary Rounds | 400 | 72% | 70% | 0.30 | 0% | 5.8 | 78 | 0.00 | 0.29 | 1.53 | 0.00 | 0.00 | 0.00 | 0.04 | 1.03 |
| Contagion Vector / Spotter’s Eye | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.28 | 0.00 | 1.50 | 0.00 | 0.00 | 0.04 | 1.02 |
| Contagion Vector / Breacher | 400 | 73% | 70% | 0.31 | 0% | 6.0 | 80 | 0.00 | 0.28 | 0.00 | 0.00 | 0.51 | 0.00 | 0.05 | 0.97 |
| Contagion Vector / Rout | 400 | 71% | 68% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.28 | 0.00 | 0.00 | 0.00 | 0.00 | 0.04 | 1.02 |
| Contagion Vector / Ricochet | 400 | 74% | 71% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.24 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 0.69 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 75% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.58 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 3.25 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 75% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.57 | 0.00 | 0.00 | 0.00 | 0.00 | 0.08 | 3.25 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 83% | 82% | 0.19 | 0% | 5.9 | 59 | 2.97 | 0.33 | 3.23 | 0.00 | 0.00 | 0.00 | 0.10 | 0.74 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 74% | 71% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.24 | 0.00 | 3.13 | 0.00 | 0.00 | 0.05 | 0.69 |
| Contagion Vector / Ricochet + Breacher | 400 | 81% | 78% | 0.22 | 0% | 5.9 | 60 | 2.97 | 0.33 | 0.00 | 0.00 | 1.24 | 0.00 | 0.09 | 0.58 |
| Contagion Vector / Ricochet + Rout | 400 | 74% | 71% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.24 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 0.69 |
| Incendiary Rounds / Incendiary Rounds | 400 | 74% | 72% | 0.28 | 0% | 5.9 | 76 | 0.00 | 0.00 | 2.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 72% | 70% | 0.32 | 0% | 5.9 | 80 | 0.00 | 0.00 | 1.35 | 1.51 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 74% | 72% | 0.29 | 0% | 6.0 | 78 | 0.00 | 0.00 | 1.29 | 0.00 | 0.51 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 72% | 70% | 0.32 | 0% | 5.9 | 80 | 0.00 | 0.00 | 1.35 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 75% | 72% | 0.30 | 0% | 6.0 | 69 | 2.97 | 0.00 | 0.96 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 76% | 73% | 0.29 | 0% | 5.9 | 69 | 2.97 | 0.38 | 0.96 | 0.00 | 0.00 | 0.00 | 0.00 | 2.76 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 76% | 73% | 0.29 | 0% | 5.9 | 69 | 2.97 | 0.37 | 0.96 | 0.00 | 0.00 | 0.00 | 0.06 | 2.76 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 84% | 83% | 0.17 | 0% | 5.9 | 59 | 2.97 | 0.00 | 4.14 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 75% | 72% | 0.30 | 0% | 6.0 | 69 | 2.97 | 0.00 | 0.96 | 3.15 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 81% | 79% | 0.21 | 0% | 6.0 | 59 | 2.97 | 0.00 | 0.93 | 0.00 | 1.24 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 75% | 72% | 0.30 | 0% | 6.0 | 69 | 2.97 | 0.00 | 0.96 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 71% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.00 | 0.00 | 2.65 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 72% | 69% | 0.32 | 0% | 6.0 | 80 | 0.00 | 0.00 | 0.00 | 1.23 | 0.57 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 71% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.00 | 0.00 | 1.31 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 0.93 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 74% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.38 | 0.00 | 0.93 | 0.00 | 0.00 | 0.00 | 2.74 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 74% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.37 | 0.00 | 0.93 | 0.00 | 0.00 | 0.05 | 2.74 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 60 | 2.97 | 0.00 | 3.23 | 1.07 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 3.85 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 80% | 78% | 0.23 | 0% | 6.0 | 60 | 2.97 | 0.00 | 0.00 | 0.91 | 1.26 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 0.93 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 74% | 71% | 0.30 | 0% | 6.0 | 77 | 0.00 | 0.00 | 0.00 | 0.00 | 0.88 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 73% | 69% | 0.32 | 0% | 6.0 | 79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.42 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 74% | 71% | 0.30 | 0% | 6.0 | 69 | 2.97 | 0.00 | 0.00 | 0.00 | 0.26 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 75% | 72% | 0.30 | 0% | 5.9 | 69 | 2.97 | 0.37 | 0.00 | 0.00 | 0.26 | 0.00 | 0.00 | 2.62 |
| Breacher / Ricochet + Contagion Vector | 400 | 75% | 72% | 0.30 | 0% | 5.9 | 69 | 2.97 | 0.36 | 0.00 | 0.00 | 0.26 | 0.00 | 0.06 | 2.62 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 83% | 82% | 0.19 | 0% | 5.9 | 59 | 2.97 | 0.00 | 3.09 | 0.00 | 0.27 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 74% | 72% | 0.30 | 0% | 5.9 | 69 | 2.97 | 0.00 | 0.00 | 2.99 | 0.31 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 80% | 78% | 0.23 | 0% | 5.9 | 59 | 2.97 | 0.00 | 0.00 | 0.00 | 1.37 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 74% | 71% | 0.30 | 0% | 6.0 | 69 | 2.97 | 0.00 | 0.00 | 0.00 | 0.26 | 0.00 | 0.00 | 0.00 |
| Rout / Rout | 400 | 71% | 67% | 0.34 | 0% | 5.9 | 82 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 74% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.38 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.74 |
| Rout / Ricochet + Contagion Vector | 400 | 74% | 71% | 0.31 | 0% | 5.9 | 70 | 2.97 | 0.37 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 2.74 |
| Rout / Ricochet + Incendiary Rounds | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 60 | 2.97 | 0.00 | 3.23 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 3.13 | 0.00 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 80% | 78% | 0.23 | 0% | 6.0 | 60 | 2.97 | 0.00 | 0.00 | 0.00 | 1.24 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 73% | 70% | 0.32 | 0% | 5.9 | 70 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 57 | 5.93 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 82% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.41 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.06 |
| Ricochet / Ricochet + Contagion Vector | 400 | 82% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.41 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 | 2.06 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 90% | 89% | 0.11 | 0% | 5.9 | 49 | 5.90 | 0.00 | 2.48 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 57 | 5.93 | 0.00 | 0.00 | 2.48 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 86% | 86% | 0.14 | 0% | 6.0 | 51 | 5.95 | 0.00 | 0.00 | 0.00 | 0.74 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 57 | 5.93 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 83% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.89 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 3.78 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 83% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.87 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 | 3.78 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 90% | 90% | 0.10 | 0% | 5.9 | 48 | 5.90 | 0.58 | 2.48 | 0.00 | 0.00 | 0.00 | 0.00 | 2.29 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 82% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.53 | 0.00 | 2.48 | 0.00 | 0.00 | 0.00 | 2.31 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 88% | 87% | 0.13 | 0% | 6.0 | 51 | 5.95 | 0.57 | 0.00 | 0.00 | 0.74 | 0.00 | 0.00 | 2.20 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 82% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.53 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.31 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 84% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.84 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 | 3.78 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 91% | 90% | 0.10 | 0% | 5.9 | 48 | 5.90 | 0.55 | 2.48 | 0.00 | 0.00 | 0.00 | 0.14 | 2.29 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 83% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.52 | 0.00 | 2.48 | 0.00 | 0.00 | 0.10 | 2.31 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 88% | 87% | 0.13 | 0% | 5.9 | 51 | 5.95 | 0.55 | 0.00 | 0.00 | 0.74 | 0.00 | 0.10 | 2.20 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 83% | 82% | 0.18 | 0% | 5.9 | 56 | 5.93 | 0.52 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 | 2.31 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 93% | 93% | 0.07 | 0% | 5.9 | 45 | 5.90 | 0.00 | 4.82 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 86% | 85% | 0.15 | 0% | 5.9 | 51 | 5.93 | 0.00 | 2.85 | 2.52 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 91% | 90% | 0.10 | 0% | 6.0 | 46 | 5.95 | 0.00 | 2.76 | 0.00 | 0.74 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 86% | 85% | 0.15 | 0% | 5.9 | 51 | 5.93 | 0.00 | 2.85 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 57 | 5.93 | 0.00 | 0.00 | 4.67 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 87% | 86% | 0.14 | 0% | 6.0 | 50 | 5.95 | 0.00 | 0.00 | 2.66 | 1.01 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 57 | 5.93 | 0.00 | 0.00 | 2.83 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 89% | 88% | 0.12 | 0% | 5.9 | 44 | 5.94 | 0.00 | 0.00 | 0.00 | 1.52 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 84% | 84% | 0.17 | 0% | 5.9 | 50 | 5.93 | 0.00 | 0.00 | 0.00 | 0.87 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 82% | 81% | 0.19 | 0% | 5.9 | 57 | 5.93 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## mixed, steady

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 16% | 3% | 1.83 | 0% | 4.4 | 135 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 17% | 3% | 1.78 | 0% | 4.4 | 134 | 0.00 | 0.52 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.36 |
| Contagion Vector | 400 | 20% | 5% | 1.66 | 0% | 4.3 | 131 | 0.00 | 0.45 | 0.00 | 0.00 | 0.00 | 0.00 | 0.93 | 0.37 |
| Incendiary Rounds | 400 | 17% | 4% | 1.77 | 0% | 4.4 | 134 | 0.00 | 0.00 | 0.91 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 16% | 3% | 1.83 | 0% | 4.4 | 135 | 0.00 | 0.00 | 0.00 | 0.85 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 16% | 3% | 1.83 | 0% | 4.4 | 135 | 0.00 | 0.00 | 0.00 | 0.00 | 0.18 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 19% | 5% | 1.70 | 0% | 4.3 | 132 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.19 | 0.00 | 0.00 |
| Ricochet | 400 | 25% | 9% | 1.48 | 0% | 4.4 | 125 | 2.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 27% | 13% | 1.30 | 0% | 4.4 | 120 | 2.60 | 1.42 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.02 |
| Ricochet + Contagion Vector | 400 | 30% | 17% | 1.19 | 0% | 4.4 | 115 | 2.60 | 1.11 | 0.00 | 0.00 | 0.00 | 0.00 | 1.62 | 1.03 |
| Ricochet + Incendiary Rounds | 400 | 29% | 14% | 1.23 | 0% | 4.4 | 117 | 2.60 | 0.00 | 2.47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 25% | 9% | 1.48 | 0% | 4.4 | 125 | 2.60 | 0.00 | 0.00 | 2.35 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 24% | 10% | 1.52 | 0% | 4.5 | 126 | 2.60 | 0.00 | 0.00 | 0.00 | 0.51 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 26% | 11% | 1.42 | 0% | 4.4 | 122 | 2.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.33 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 19% | 4% | 1.69 | 0% | 4.3 | 131 | 0.00 | 1.02 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.55 |
| Cytotoxic Vector / Contagion Vector | 400 | 22% | 6% | 1.59 | 0% | 4.3 | 129 | 0.00 | 0.92 | 0.00 | 0.00 | 0.00 | 0.00 | 0.86 | 0.56 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 19% | 4% | 1.68 | 0% | 4.4 | 131 | 0.00 | 0.55 | 0.92 | 0.00 | 0.00 | 0.00 | 0.00 | 0.20 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 19% | 3% | 1.73 | 0% | 4.4 | 132 | 0.00 | 0.55 | 0.00 | 0.86 | 0.00 | 0.00 | 0.00 | 0.20 |
| Cytotoxic Vector / Breacher | 400 | 19% | 3% | 1.73 | 0% | 4.4 | 133 | 0.00 | 0.55 | 0.00 | 0.00 | 0.19 | 0.00 | 0.00 | 0.19 |
| Cytotoxic Vector / Rout | 400 | 21% | 5% | 1.60 | 0% | 4.3 | 129 | 0.00 | 0.54 | 0.00 | 0.00 | 0.00 | 0.19 | 0.00 | 0.20 |
| Cytotoxic Vector / Ricochet | 400 | 25% | 10% | 1.44 | 0% | 4.4 | 124 | 2.60 | 0.32 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.12 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 27% | 14% | 1.28 | 0% | 4.4 | 120 | 2.60 | 1.71 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.11 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 29% | 17% | 1.19 | 0% | 4.4 | 115 | 2.60 | 1.36 | 0.00 | 0.00 | 0.00 | 0.00 | 1.58 | 1.13 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 28% | 14% | 1.22 | 0% | 4.4 | 117 | 2.60 | 0.36 | 2.47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 25% | 10% | 1.44 | 0% | 4.4 | 124 | 2.60 | 0.32 | 0.00 | 2.35 | 0.00 | 0.00 | 0.00 | 0.12 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 24% | 10% | 1.47 | 0% | 4.5 | 125 | 2.60 | 0.34 | 0.00 | 0.00 | 0.51 | 0.00 | 0.00 | 0.11 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 26% | 12% | 1.36 | 0% | 4.4 | 121 | 2.60 | 0.32 | 0.00 | 0.00 | 0.00 | 0.33 | 0.00 | 0.13 |
| Contagion Vector / Contagion Vector | 400 | 23% | 6% | 1.51 | 0% | 4.3 | 127 | 0.00 | 0.84 | 0.00 | 0.00 | 0.00 | 0.00 | 1.43 | 0.57 |
| Contagion Vector / Incendiary Rounds | 400 | 21% | 5% | 1.59 | 0% | 4.3 | 129 | 0.00 | 0.45 | 0.92 | 0.00 | 0.00 | 0.00 | 0.79 | 0.21 |
| Contagion Vector / Spotter’s Eye | 400 | 21% | 4% | 1.63 | 0% | 4.3 | 130 | 0.00 | 0.45 | 0.00 | 0.86 | 0.00 | 0.00 | 0.79 | 0.21 |
| Contagion Vector / Breacher | 400 | 21% | 4% | 1.65 | 0% | 4.3 | 131 | 0.00 | 0.46 | 0.00 | 0.00 | 0.18 | 0.00 | 0.79 | 0.20 |
| Contagion Vector / Rout | 400 | 23% | 6% | 1.53 | 0% | 4.3 | 128 | 0.00 | 0.45 | 0.00 | 0.00 | 0.00 | 0.19 | 0.74 | 0.21 |
| Contagion Vector / Ricochet | 400 | 26% | 11% | 1.39 | 0% | 4.4 | 123 | 2.60 | 0.28 | 0.00 | 0.00 | 0.00 | 0.00 | 0.61 | 0.12 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 28% | 14% | 1.27 | 0% | 4.5 | 119 | 2.60 | 1.58 | 0.00 | 0.00 | 0.00 | 0.00 | 0.52 | 1.12 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 30% | 17% | 1.18 | 0% | 4.5 | 115 | 2.60 | 1.32 | 0.00 | 0.00 | 0.00 | 0.00 | 1.70 | 1.13 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 29% | 15% | 1.22 | 0% | 4.4 | 116 | 2.60 | 0.32 | 2.46 | 0.00 | 0.00 | 0.00 | 0.57 | 0.13 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 26% | 11% | 1.39 | 0% | 4.4 | 123 | 2.60 | 0.28 | 0.00 | 2.35 | 0.00 | 0.00 | 0.61 | 0.12 |
| Contagion Vector / Ricochet + Breacher | 400 | 26% | 11% | 1.39 | 0% | 4.5 | 123 | 2.60 | 0.30 | 0.00 | 0.00 | 0.51 | 0.00 | 0.61 | 0.11 |
| Contagion Vector / Ricochet + Rout | 400 | 27% | 12% | 1.32 | 0% | 4.3 | 119 | 2.60 | 0.29 | 0.00 | 0.00 | 0.00 | 0.33 | 0.52 | 0.13 |
| Incendiary Rounds / Incendiary Rounds | 400 | 19% | 4% | 1.69 | 0% | 4.4 | 131 | 0.00 | 0.00 | 1.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 19% | 3% | 1.73 | 0% | 4.4 | 132 | 0.00 | 0.00 | 0.74 | 0.86 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 19% | 3% | 1.73 | 0% | 4.4 | 133 | 0.00 | 0.00 | 0.75 | 0.00 | 0.18 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 21% | 5% | 1.60 | 0% | 4.3 | 129 | 0.00 | 0.00 | 0.75 | 0.00 | 0.00 | 0.19 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 25% | 10% | 1.41 | 0% | 4.4 | 124 | 2.60 | 0.00 | 0.44 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 28% | 14% | 1.25 | 0% | 4.4 | 119 | 2.60 | 1.42 | 0.46 | 0.00 | 0.00 | 0.00 | 0.00 | 1.02 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 30% | 16% | 1.15 | 0% | 4.4 | 115 | 2.60 | 1.11 | 0.48 | 0.00 | 0.00 | 0.00 | 1.61 | 1.03 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 29% | 14% | 1.20 | 0% | 4.4 | 116 | 2.60 | 0.00 | 2.88 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 25% | 10% | 1.41 | 0% | 4.4 | 124 | 2.60 | 0.00 | 0.44 | 2.35 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 24% | 10% | 1.46 | 0% | 4.5 | 125 | 2.60 | 0.00 | 0.45 | 0.00 | 0.51 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 26% | 12% | 1.39 | 0% | 4.4 | 121 | 2.60 | 0.00 | 0.45 | 0.00 | 0.00 | 0.33 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 16% | 3% | 1.83 | 0% | 4.4 | 135 | 0.00 | 0.00 | 0.00 | 1.52 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 17% | 3% | 1.83 | 0% | 4.4 | 135 | 0.00 | 0.00 | 0.00 | 0.73 | 0.23 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 20% | 5% | 1.67 | 0% | 4.3 | 132 | 0.00 | 0.00 | 0.00 | 0.74 | 0.00 | 0.21 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 25% | 9% | 1.48 | 0% | 4.4 | 125 | 2.60 | 0.00 | 0.00 | 0.45 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 27% | 13% | 1.30 | 0% | 4.4 | 120 | 2.60 | 1.42 | 0.00 | 0.46 | 0.00 | 0.00 | 0.00 | 1.02 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 30% | 17% | 1.19 | 0% | 4.4 | 115 | 2.60 | 1.11 | 0.00 | 0.49 | 0.00 | 0.00 | 1.62 | 1.03 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 29% | 14% | 1.23 | 0% | 4.4 | 117 | 2.60 | 0.00 | 2.47 | 0.49 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 25% | 9% | 1.48 | 0% | 4.4 | 125 | 2.60 | 0.00 | 0.00 | 2.71 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 24% | 10% | 1.50 | 0% | 4.5 | 126 | 2.60 | 0.00 | 0.00 | 0.45 | 0.55 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 26% | 11% | 1.42 | 0% | 4.4 | 122 | 2.60 | 0.00 | 0.00 | 0.46 | 0.00 | 0.38 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 17% | 3% | 1.83 | 0% | 4.4 | 135 | 0.00 | 0.00 | 0.00 | 0.00 | 0.28 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 19% | 5% | 1.69 | 0% | 4.4 | 132 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 | 0.19 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 25% | 10% | 1.45 | 0% | 4.4 | 124 | 2.60 | 0.00 | 0.00 | 0.00 | 0.03 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 28% | 14% | 1.26 | 0% | 4.4 | 119 | 2.60 | 1.42 | 0.00 | 0.00 | 0.03 | 0.00 | 0.00 | 1.02 |
| Breacher / Ricochet + Contagion Vector | 400 | 31% | 17% | 1.18 | 0% | 4.4 | 115 | 2.60 | 1.11 | 0.00 | 0.00 | 0.04 | 0.00 | 1.62 | 1.02 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 30% | 14% | 1.21 | 0% | 4.4 | 116 | 2.60 | 0.00 | 2.46 | 0.00 | 0.04 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 25% | 10% | 1.45 | 0% | 4.4 | 124 | 2.60 | 0.00 | 0.00 | 2.33 | 0.05 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 24% | 10% | 1.49 | 0% | 4.5 | 125 | 2.60 | 0.00 | 0.00 | 0.00 | 0.54 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 27% | 12% | 1.38 | 0% | 4.4 | 122 | 2.60 | 0.00 | 0.00 | 0.00 | 0.04 | 0.33 | 0.00 | 0.00 |
| Rout / Rout | 400 | 20% | 6% | 1.67 | 0% | 4.3 | 132 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.29 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 25% | 10% | 1.49 | 0% | 4.4 | 125 | 2.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 28% | 14% | 1.28 | 0% | 4.4 | 120 | 2.60 | 1.41 | 0.00 | 0.00 | 0.00 | 0.09 | 0.00 | 1.02 |
| Rout / Ricochet + Contagion Vector | 400 | 30% | 17% | 1.19 | 0% | 4.4 | 116 | 2.60 | 1.11 | 0.00 | 0.00 | 0.00 | 0.08 | 1.59 | 1.03 |
| Rout / Ricochet + Incendiary Rounds | 400 | 29% | 14% | 1.23 | 0% | 4.4 | 117 | 2.60 | 0.00 | 2.46 | 0.00 | 0.00 | 0.09 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 25% | 10% | 1.48 | 0% | 4.4 | 125 | 2.60 | 0.00 | 0.00 | 2.35 | 0.00 | 0.11 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 24% | 10% | 1.51 | 0% | 4.5 | 126 | 2.60 | 0.00 | 0.00 | 0.00 | 0.51 | 0.10 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 26% | 12% | 1.43 | 0% | 4.4 | 123 | 2.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.39 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 24% | 14% | 1.36 | 0% | 4.4 | 117 | 4.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 29% | 18% | 1.21 | 0% | 4.4 | 112 | 4.69 | 1.16 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.85 |
| Ricochet / Ricochet + Contagion Vector | 400 | 33% | 22% | 1.06 | 0% | 4.3 | 107 | 4.73 | 0.91 | 0.00 | 0.00 | 0.00 | 0.00 | 1.53 | 0.86 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 31% | 19% | 1.17 | 0% | 4.4 | 111 | 4.70 | 0.00 | 2.08 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 24% | 14% | 1.36 | 0% | 4.4 | 117 | 4.60 | 0.00 | 0.00 | 1.99 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 26% | 15% | 1.32 | 0% | 4.4 | 117 | 4.61 | 0.00 | 0.00 | 0.00 | 0.37 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 28% | 17% | 1.28 | 0% | 4.4 | 114 | 4.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.37 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 31% | 21% | 1.09 | 0% | 4.3 | 108 | 4.70 | 2.25 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.39 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 34% | 23% | 0.99 | 0% | 4.4 | 105 | 4.74 | 1.86 | 0.00 | 0.00 | 0.00 | 0.00 | 1.32 | 1.41 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 32% | 20% | 1.07 | 0% | 4.4 | 108 | 4.71 | 1.32 | 2.07 | 0.00 | 0.00 | 0.00 | 0.00 | 0.69 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 27% | 18% | 1.24 | 0% | 4.3 | 113 | 4.61 | 1.29 | 0.00 | 1.96 | 0.00 | 0.00 | 0.00 | 0.66 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 29% | 18% | 1.19 | 0% | 4.4 | 113 | 4.61 | 1.32 | 0.00 | 0.00 | 0.36 | 0.00 | 0.00 | 0.64 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 31% | 20% | 1.17 | 0% | 4.4 | 110 | 4.61 | 1.31 | 0.00 | 0.00 | 0.00 | 0.38 | 0.00 | 0.68 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 35% | 24% | 0.95 | 0% | 4.3 | 104 | 4.75 | 1.65 | 0.00 | 0.00 | 0.00 | 0.00 | 1.86 | 1.43 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 34% | 23% | 0.96 | 0% | 4.3 | 105 | 4.72 | 1.09 | 2.07 | 0.00 | 0.00 | 0.00 | 1.33 | 0.70 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 30% | 20% | 1.08 | 0% | 4.3 | 107 | 4.61 | 1.05 | 0.00 | 1.96 | 0.00 | 0.00 | 1.35 | 0.68 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 32% | 21% | 1.05 | 0% | 4.3 | 107 | 4.62 | 1.06 | 0.00 | 0.00 | 0.36 | 0.00 | 1.37 | 0.65 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 34% | 22% | 1.03 | 0% | 4.3 | 106 | 4.61 | 1.07 | 0.00 | 0.00 | 0.00 | 0.38 | 1.29 | 0.69 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 32% | 21% | 1.05 | 0% | 4.4 | 107 | 4.73 | 0.00 | 3.75 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 28% | 18% | 1.21 | 0% | 4.3 | 112 | 4.63 | 0.00 | 1.98 | 1.97 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 30% | 18% | 1.18 | 0% | 4.4 | 112 | 4.63 | 0.00 | 1.98 | 0.00 | 0.36 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 32% | 19% | 1.14 | 0% | 4.3 | 109 | 4.63 | 0.00 | 2.02 | 0.00 | 0.00 | 0.37 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 24% | 14% | 1.36 | 0% | 4.4 | 117 | 4.60 | 0.00 | 0.00 | 3.53 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 27% | 16% | 1.31 | 0% | 4.4 | 116 | 4.61 | 0.00 | 0.00 | 1.87 | 0.53 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 29% | 17% | 1.24 | 0% | 4.4 | 113 | 4.60 | 0.00 | 0.00 | 1.97 | 0.00 | 0.46 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 28% | 17% | 1.25 | 0% | 4.4 | 114 | 4.61 | 0.00 | 0.00 | 0.00 | 0.67 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 28% | 17% | 1.26 | 0% | 4.4 | 113 | 4.61 | 0.00 | 0.00 | 0.00 | 0.31 | 0.37 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 29% | 18% | 1.23 | 0% | 4.4 | 111 | 4.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.57 | 0.00 | 0.00 |

## the job's own, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 97% | 86% | 0.27 | 1% | 6.5 | 53 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 99% | 89% | 0.18 | 1% | 6.3 | 49 | 0.00 | 0.92 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.31 |
| Contagion Vector | 400 | 99% | 90% | 0.17 | 0% | 6.2 | 46 | 0.00 | 0.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.70 | 0.32 |
| Incendiary Rounds | 400 | 99% | 90% | 0.18 | 1% | 6.3 | 48 | 0.00 | 0.00 | 1.25 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 97% | 86% | 0.27 | 1% | 6.5 | 53 | 0.00 | 0.00 | 0.00 | 1.24 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 97% | 87% | 0.26 | 1% | 6.4 | 53 | 0.00 | 0.00 | 0.00 | 0.00 | 0.09 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 97% | 86% | 0.26 | 1% | 6.5 | 52 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.14 | 0.00 | 0.00 |
| Ricochet | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.19 | 0% | 6.2 | 38 | 2.79 | 1.68 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.53 |
| Ricochet + Contagion Vector | 400 | 98% | 92% | 0.18 | 0% | 6.1 | 37 | 2.79 | 1.45 | 0.00 | 0.00 | 0.00 | 0.00 | 0.61 | 0.53 |
| Ricochet + Incendiary Rounds | 400 | 98% | 92% | 0.17 | 0% | 6.1 | 37 | 2.79 | 0.00 | 2.22 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.79 | 0.00 | 0.00 | 2.22 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 98% | 89% | 0.23 | 0% | 6.3 | 42 | 2.79 | 0.00 | 0.00 | 0.00 | 0.11 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 42 | 2.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.27 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 99% | 90% | 0.16 | 0% | 6.2 | 46 | 0.00 | 1.85 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.49 |
| Cytotoxic Vector / Contagion Vector | 400 | 99% | 90% | 0.16 | 0% | 6.1 | 44 | 0.00 | 1.63 | 0.00 | 0.00 | 0.00 | 0.00 | 0.61 | 0.51 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 99% | 90% | 0.15 | 0% | 6.2 | 45 | 0.00 | 1.00 | 1.29 | 0.00 | 0.00 | 0.00 | 0.00 | 0.19 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 98% | 87% | 0.23 | 1% | 6.4 | 50 | 0.00 | 0.99 | 0.00 | 1.25 | 0.00 | 0.00 | 0.00 | 0.20 |
| Cytotoxic Vector / Breacher | 400 | 98% | 88% | 0.22 | 1% | 6.3 | 50 | 0.00 | 0.98 | 0.00 | 0.00 | 0.09 | 0.00 | 0.00 | 0.20 |
| Cytotoxic Vector / Rout | 400 | 98% | 87% | 0.23 | 1% | 6.3 | 49 | 0.00 | 1.01 | 0.00 | 0.00 | 0.00 | 0.14 | 0.00 | 0.20 |
| Cytotoxic Vector / Ricochet | 400 | 98% | 90% | 0.20 | 0% | 6.2 | 40 | 2.77 | 0.84 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.15 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.17 | 0% | 6.1 | 36 | 2.77 | 2.44 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.69 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 98% | 91% | 0.17 | 0% | 6.1 | 35 | 2.77 | 2.15 | 0.00 | 0.00 | 0.00 | 0.00 | 0.53 | 0.69 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 99% | 93% | 0.14 | 0% | 6.1 | 34 | 2.77 | 0.87 | 2.20 | 0.00 | 0.00 | 0.00 | 0.00 | 0.18 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 98% | 90% | 0.20 | 0% | 6.2 | 40 | 2.77 | 0.84 | 0.00 | 2.21 | 0.00 | 0.00 | 0.00 | 0.15 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 98% | 89% | 0.20 | 0% | 6.2 | 40 | 2.77 | 0.83 | 0.00 | 0.00 | 0.11 | 0.00 | 0.00 | 0.15 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 98% | 90% | 0.20 | 0% | 6.2 | 39 | 2.77 | 0.85 | 0.00 | 0.00 | 0.00 | 0.27 | 0.00 | 0.15 |
| Contagion Vector / Contagion Vector | 400 | 99% | 92% | 0.13 | 0% | 6.0 | 42 | 0.00 | 1.47 | 0.00 | 0.00 | 0.00 | 0.00 | 1.08 | 0.51 |
| Contagion Vector / Incendiary Rounds | 400 | 99% | 92% | 0.13 | 0% | 6.1 | 43 | 0.00 | 0.90 | 1.28 | 0.00 | 0.00 | 0.00 | 0.79 | 0.19 |
| Contagion Vector / Spotter’s Eye | 400 | 99% | 89% | 0.19 | 1% | 6.2 | 47 | 0.00 | 0.88 | 0.00 | 1.24 | 0.00 | 0.00 | 0.82 | 0.20 |
| Contagion Vector / Breacher | 400 | 99% | 89% | 0.18 | 1% | 6.2 | 47 | 0.00 | 0.87 | 0.00 | 0.00 | 0.09 | 0.00 | 0.81 | 0.20 |
| Contagion Vector / Rout | 400 | 99% | 89% | 0.19 | 1% | 6.2 | 46 | 0.00 | 0.90 | 0.00 | 0.00 | 0.00 | 0.14 | 0.80 | 0.20 |
| Contagion Vector / Ricochet | 400 | 98% | 91% | 0.19 | 0% | 6.2 | 39 | 2.78 | 0.77 | 0.00 | 0.00 | 0.00 | 0.00 | 0.63 | 0.16 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.16 | 0% | 6.1 | 35 | 2.78 | 2.23 | 0.00 | 0.00 | 0.00 | 0.00 | 0.38 | 0.70 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 98% | 92% | 0.17 | 0% | 6.1 | 35 | 2.78 | 2.04 | 0.00 | 0.00 | 0.00 | 0.00 | 0.73 | 0.70 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 99% | 93% | 0.14 | 0% | 6.0 | 34 | 2.78 | 0.82 | 2.19 | 0.00 | 0.00 | 0.00 | 0.60 | 0.19 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 98% | 91% | 0.19 | 0% | 6.2 | 39 | 2.78 | 0.77 | 0.00 | 2.20 | 0.00 | 0.00 | 0.63 | 0.16 |
| Contagion Vector / Ricochet + Breacher | 400 | 98% | 90% | 0.19 | 0% | 6.1 | 38 | 2.78 | 0.75 | 0.00 | 0.00 | 0.11 | 0.00 | 0.63 | 0.16 |
| Contagion Vector / Ricochet + Rout | 400 | 98% | 91% | 0.19 | 0% | 6.2 | 38 | 2.78 | 0.79 | 0.00 | 0.00 | 0.00 | 0.27 | 0.58 | 0.16 |
| Incendiary Rounds / Incendiary Rounds | 400 | 99% | 91% | 0.15 | 0% | 6.1 | 45 | 0.00 | 0.00 | 2.37 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 98% | 88% | 0.22 | 1% | 6.3 | 49 | 0.00 | 0.00 | 1.19 | 1.24 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 98% | 88% | 0.21 | 1% | 6.3 | 49 | 0.00 | 0.00 | 1.19 | 0.00 | 0.09 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 98% | 88% | 0.22 | 1% | 6.3 | 48 | 0.00 | 0.00 | 1.21 | 0.00 | 0.00 | 0.14 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 98% | 89% | 0.21 | 0% | 6.2 | 40 | 2.78 | 0.00 | 0.99 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 98% | 91% | 0.17 | 0% | 6.1 | 36 | 2.78 | 1.66 | 1.03 | 0.00 | 0.00 | 0.00 | 0.00 | 0.54 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 98% | 91% | 0.17 | 0% | 6.1 | 35 | 2.78 | 1.43 | 1.02 | 0.00 | 0.00 | 0.00 | 0.59 | 0.54 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 99% | 92% | 0.15 | 0% | 6.0 | 34 | 2.78 | 0.00 | 3.14 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 98% | 89% | 0.21 | 0% | 6.2 | 40 | 2.78 | 0.00 | 0.99 | 2.20 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 98% | 89% | 0.21 | 0% | 6.2 | 40 | 2.78 | 0.00 | 0.98 | 0.00 | 0.11 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 98% | 89% | 0.21 | 0% | 6.2 | 40 | 2.78 | 0.00 | 1.00 | 0.00 | 0.00 | 0.27 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 97% | 86% | 0.27 | 1% | 6.5 | 53 | 0.00 | 0.00 | 0.00 | 2.29 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 97% | 87% | 0.26 | 1% | 6.4 | 53 | 0.00 | 0.00 | 0.00 | 1.17 | 0.10 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 97% | 86% | 0.26 | 1% | 6.5 | 52 | 0.00 | 0.00 | 0.00 | 1.19 | 0.00 | 0.15 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.79 | 0.00 | 0.00 | 0.99 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.19 | 0% | 6.2 | 38 | 2.79 | 1.68 | 0.00 | 1.02 | 0.00 | 0.00 | 0.00 | 0.53 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 98% | 92% | 0.18 | 0% | 6.1 | 37 | 2.79 | 1.45 | 0.00 | 1.02 | 0.00 | 0.00 | 0.61 | 0.53 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 98% | 92% | 0.17 | 0% | 6.1 | 37 | 2.79 | 0.00 | 2.22 | 1.03 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.79 | 0.00 | 0.00 | 3.07 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 98% | 89% | 0.23 | 0% | 6.3 | 42 | 2.79 | 0.00 | 0.00 | 0.98 | 0.12 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 42 | 2.79 | 0.00 | 0.00 | 1.00 | 0.00 | 0.30 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 97% | 87% | 0.26 | 1% | 6.4 | 52 | 0.00 | 0.00 | 0.00 | 0.00 | 0.14 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 97% | 86% | 0.26 | 1% | 6.4 | 52 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 0.14 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.78 | 0.00 | 0.00 | 0.00 | 0.05 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.19 | 0% | 6.2 | 38 | 2.78 | 1.67 | 0.00 | 0.00 | 0.05 | 0.00 | 0.00 | 0.51 |
| Breacher / Ricochet + Contagion Vector | 400 | 98% | 92% | 0.18 | 0% | 6.1 | 37 | 2.78 | 1.44 | 0.00 | 0.00 | 0.05 | 0.00 | 0.61 | 0.51 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 98% | 92% | 0.17 | 0% | 6.1 | 37 | 2.78 | 0.00 | 2.20 | 0.00 | 0.04 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.78 | 0.00 | 0.00 | 2.19 | 0.05 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 98% | 89% | 0.23 | 0% | 6.3 | 42 | 2.78 | 0.00 | 0.00 | 0.00 | 0.16 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 42 | 2.78 | 0.00 | 0.00 | 0.00 | 0.05 | 0.27 | 0.00 | 0.00 |
| Rout / Rout | 400 | 97% | 87% | 0.26 | 1% | 6.4 | 51 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.33 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 98% | 92% | 0.19 | 0% | 6.2 | 38 | 2.79 | 1.67 | 0.00 | 0.00 | 0.00 | 0.12 | 0.00 | 0.53 |
| Rout / Ricochet + Contagion Vector | 400 | 98% | 92% | 0.18 | 0% | 6.1 | 37 | 2.79 | 1.44 | 0.00 | 0.00 | 0.00 | 0.12 | 0.61 | 0.53 |
| Rout / Ricochet + Incendiary Rounds | 400 | 98% | 92% | 0.17 | 0% | 6.1 | 37 | 2.79 | 0.00 | 2.21 | 0.00 | 0.00 | 0.12 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 43 | 2.79 | 0.00 | 0.00 | 2.20 | 0.00 | 0.13 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 98% | 89% | 0.23 | 0% | 6.3 | 42 | 2.79 | 0.00 | 0.00 | 0.00 | 0.11 | 0.13 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 98% | 90% | 0.23 | 0% | 6.3 | 42 | 2.79 | 0.00 | 0.00 | 0.00 | 0.00 | 0.36 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.33 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 100% | 95% | 0.08 | 0% | 5.9 | 27 | 5.32 | 1.10 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.46 |
| Ricochet / Ricochet + Contagion Vector | 400 | 100% | 95% | 0.09 | 0% | 5.9 | 26 | 5.32 | 0.94 | 0.00 | 0.00 | 0.00 | 0.00 | 0.59 | 0.46 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 100% | 95% | 0.08 | 0% | 5.9 | 26 | 5.32 | 0.00 | 1.54 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.33 | 0.00 | 0.00 | 1.60 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.31 | 0.00 | 0.00 | 0.00 | 0.11 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.33 | 0.00 | 0.00 | 0.00 | 0.00 | 0.25 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 100% | 96% | 0.06 | 0% | 5.8 | 25 | 5.32 | 2.47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.78 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 100% | 96% | 0.07 | 0% | 5.8 | 25 | 5.32 | 2.30 | 0.00 | 0.00 | 0.00 | 0.00 | 0.29 | 0.78 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 100% | 96% | 0.06 | 0% | 5.8 | 25 | 5.31 | 1.63 | 1.53 | 0.00 | 0.00 | 0.00 | 0.00 | 0.36 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 100% | 94% | 0.08 | 0% | 5.9 | 27 | 5.33 | 1.61 | 0.00 | 1.59 | 0.00 | 0.00 | 0.00 | 0.33 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 100% | 94% | 0.08 | 0% | 5.9 | 27 | 5.31 | 1.61 | 0.00 | 0.00 | 0.11 | 0.00 | 0.00 | 0.34 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 100% | 94% | 0.08 | 0% | 5.9 | 27 | 5.33 | 1.60 | 0.00 | 0.00 | 0.00 | 0.25 | 0.00 | 0.33 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 100% | 96% | 0.06 | 0% | 5.8 | 24 | 5.32 | 2.10 | 0.00 | 0.00 | 0.00 | 0.00 | 0.59 | 0.78 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 100% | 96% | 0.05 | 0% | 5.8 | 24 | 5.32 | 1.40 | 1.54 | 0.00 | 0.00 | 0.00 | 0.54 | 0.36 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 100% | 95% | 0.07 | 0% | 5.9 | 26 | 5.33 | 1.39 | 0.00 | 1.60 | 0.00 | 0.00 | 0.56 | 0.33 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 100% | 95% | 0.07 | 0% | 5.9 | 25 | 5.31 | 1.39 | 0.00 | 0.00 | 0.11 | 0.00 | 0.56 | 0.34 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 100% | 95% | 0.07 | 0% | 5.9 | 26 | 5.33 | 1.38 | 0.00 | 0.00 | 0.00 | 0.25 | 0.56 | 0.33 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 100% | 96% | 0.06 | 0% | 5.8 | 24 | 5.29 | 0.00 | 3.27 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 100% | 95% | 0.08 | 0% | 5.9 | 27 | 5.31 | 0.00 | 1.92 | 1.61 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 100% | 94% | 0.08 | 0% | 5.9 | 26 | 5.29 | 0.00 | 1.93 | 0.00 | 0.11 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 100% | 95% | 0.08 | 0% | 5.9 | 26 | 5.31 | 0.00 | 1.91 | 0.00 | 0.00 | 0.25 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.33 | 0.00 | 0.00 | 3.29 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.31 | 0.00 | 0.00 | 1.95 | 0.12 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.33 | 0.00 | 0.00 | 1.93 | 0.00 | 0.28 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 100% | 93% | 0.11 | 0% | 6.1 | 29 | 5.30 | 0.00 | 0.00 | 0.00 | 0.18 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.32 | 0.00 | 0.00 | 0.00 | 0.07 | 0.25 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 100% | 94% | 0.10 | 0% | 6.1 | 29 | 5.33 | 0.00 | 0.00 | 0.00 | 0.00 | 0.47 | 0.00 | 0.00 |

## armoured, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 51% | 24% | 1.62 | 9% | 6.7 | 151 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 55% | 27% | 1.53 | 6% | 6.7 | 149 | 0.00 | 0.53 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.29 |
| Contagion Vector | 400 | 61% | 35% | 1.27 | 4% | 6.6 | 141 | 0.00 | 0.47 | 0.00 | 0.00 | 0.00 | 0.00 | 1.25 | 0.30 |
| Incendiary Rounds | 400 | 59% | 31% | 1.38 | 5% | 6.7 | 144 | 0.00 | 0.00 | 1.48 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 51% | 24% | 1.62 | 9% | 6.7 | 151 | 0.00 | 0.00 | 0.00 | 1.39 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 54% | 28% | 1.59 | 7% | 6.8 | 149 | 0.00 | 0.00 | 0.00 | 0.00 | 0.58 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 56% | 31% | 1.46 | 8% | 6.6 | 144 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.54 | 0.00 | 0.00 |
| Ricochet | 400 | 55% | 32% | 1.49 | 9% | 6.6 | 139 | 2.76 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 61% | 36% | 1.30 | 6% | 6.6 | 135 | 2.76 | 0.86 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.66 |
| Ricochet + Contagion Vector | 400 | 70% | 45% | 1.00 | 2% | 6.4 | 122 | 2.76 | 0.71 | 0.00 | 0.00 | 0.00 | 0.00 | 1.80 | 0.68 |
| Ricochet + Incendiary Rounds | 400 | 75% | 49% | 0.85 | 2% | 6.4 | 117 | 2.76 | 0.00 | 3.08 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 55% | 32% | 1.49 | 9% | 6.6 | 139 | 2.76 | 0.00 | 0.00 | 2.87 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 69% | 45% | 1.09 | 3% | 6.7 | 124 | 2.76 | 0.00 | 0.00 | 0.00 | 1.36 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 60% | 40% | 1.27 | 6% | 6.4 | 127 | 2.76 | 0.00 | 0.00 | 0.00 | 0.00 | 0.87 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 56% | 30% | 1.47 | 6% | 6.6 | 147 | 0.00 | 0.93 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.49 |
| Cytotoxic Vector / Contagion Vector | 400 | 62% | 38% | 1.24 | 4% | 6.6 | 140 | 0.00 | 0.84 | 0.00 | 0.00 | 0.00 | 0.00 | 1.23 | 0.49 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 60% | 34% | 1.33 | 5% | 6.7 | 142 | 0.00 | 0.42 | 1.48 | 0.00 | 0.00 | 0.00 | 0.00 | 0.23 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 53% | 27% | 1.56 | 9% | 6.7 | 149 | 0.00 | 0.41 | 0.00 | 1.40 | 0.00 | 0.00 | 0.00 | 0.21 |
| Cytotoxic Vector / Breacher | 400 | 55% | 30% | 1.55 | 8% | 6.8 | 148 | 0.00 | 0.40 | 0.00 | 0.00 | 0.58 | 0.00 | 0.00 | 0.23 |
| Cytotoxic Vector / Rout | 400 | 56% | 34% | 1.42 | 7% | 6.6 | 142 | 0.00 | 0.41 | 0.00 | 0.00 | 0.00 | 0.55 | 0.00 | 0.24 |
| Cytotoxic Vector / Ricochet | 400 | 56% | 33% | 1.46 | 9% | 6.5 | 138 | 2.76 | 0.36 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.17 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 63% | 37% | 1.27 | 6% | 6.5 | 133 | 2.76 | 1.20 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.82 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 70% | 46% | 0.99 | 2% | 6.3 | 121 | 2.76 | 1.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.76 | 0.87 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 76% | 50% | 0.83 | 2% | 6.4 | 116 | 2.76 | 0.33 | 3.09 | 0.00 | 0.00 | 0.00 | 0.00 | 0.25 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 56% | 33% | 1.46 | 9% | 6.5 | 138 | 2.76 | 0.36 | 0.00 | 2.88 | 0.00 | 0.00 | 0.00 | 0.17 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 71% | 46% | 1.06 | 3% | 6.6 | 123 | 2.76 | 0.32 | 0.00 | 0.00 | 1.36 | 0.00 | 0.00 | 0.24 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 62% | 41% | 1.24 | 6% | 6.3 | 126 | 2.76 | 0.35 | 0.00 | 0.00 | 0.00 | 0.87 | 0.00 | 0.20 |
| Contagion Vector / Contagion Vector | 400 | 66% | 40% | 1.12 | 2% | 6.5 | 136 | 0.00 | 0.78 | 0.00 | 0.00 | 0.00 | 0.00 | 1.84 | 0.50 |
| Contagion Vector / Incendiary Rounds | 400 | 65% | 37% | 1.19 | 3% | 6.5 | 137 | 0.00 | 0.36 | 1.49 | 0.00 | 0.00 | 0.00 | 0.89 | 0.23 |
| Contagion Vector / Spotter’s Eye | 400 | 59% | 32% | 1.37 | 5% | 6.6 | 143 | 0.00 | 0.36 | 0.00 | 1.41 | 0.00 | 0.00 | 0.93 | 0.21 |
| Contagion Vector / Breacher | 400 | 62% | 35% | 1.35 | 5% | 6.7 | 142 | 0.00 | 0.35 | 0.00 | 0.00 | 0.58 | 0.00 | 0.93 | 0.24 |
| Contagion Vector / Rout | 400 | 62% | 37% | 1.26 | 5% | 6.5 | 138 | 0.00 | 0.35 | 0.00 | 0.00 | 0.00 | 0.53 | 0.89 | 0.24 |
| Contagion Vector / Ricochet | 400 | 61% | 36% | 1.36 | 7% | 6.5 | 135 | 2.77 | 0.33 | 0.00 | 0.00 | 0.00 | 0.00 | 0.67 | 0.17 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 66% | 39% | 1.20 | 5% | 6.5 | 131 | 2.77 | 1.15 | 0.00 | 0.00 | 0.00 | 0.00 | 0.56 | 0.84 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 71% | 48% | 0.97 | 2% | 6.4 | 121 | 2.77 | 0.98 | 0.00 | 0.00 | 0.00 | 0.00 | 1.95 | 0.88 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 78% | 52% | 0.79 | 2% | 6.4 | 114 | 2.77 | 0.30 | 3.10 | 0.00 | 0.00 | 0.00 | 0.58 | 0.25 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 61% | 36% | 1.36 | 7% | 6.5 | 135 | 2.77 | 0.33 | 0.00 | 2.89 | 0.00 | 0.00 | 0.67 | 0.17 |
| Contagion Vector / Ricochet + Breacher | 400 | 74% | 48% | 0.99 | 3% | 6.6 | 121 | 2.77 | 0.30 | 0.00 | 0.00 | 1.36 | 0.00 | 0.63 | 0.25 |
| Contagion Vector / Ricochet + Rout | 400 | 64% | 43% | 1.19 | 5% | 6.3 | 124 | 2.77 | 0.33 | 0.00 | 0.00 | 0.00 | 0.86 | 0.59 | 0.21 |
| Incendiary Rounds / Incendiary Rounds | 400 | 64% | 35% | 1.26 | 5% | 6.7 | 139 | 0.00 | 0.00 | 2.57 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 58% | 30% | 1.45 | 8% | 6.7 | 146 | 0.00 | 0.00 | 1.18 | 1.41 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 61% | 33% | 1.44 | 7% | 6.8 | 144 | 0.00 | 0.00 | 1.18 | 0.00 | 0.56 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 62% | 36% | 1.30 | 6% | 6.6 | 139 | 0.00 | 0.00 | 1.20 | 0.00 | 0.00 | 0.55 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 58% | 34% | 1.43 | 8% | 6.5 | 137 | 2.76 | 0.00 | 0.83 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 64% | 38% | 1.25 | 7% | 6.5 | 132 | 2.76 | 0.86 | 0.84 | 0.00 | 0.00 | 0.00 | 0.00 | 0.66 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 71% | 47% | 0.97 | 2% | 6.4 | 121 | 2.76 | 0.72 | 0.84 | 0.00 | 0.00 | 0.00 | 1.80 | 0.68 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 77% | 51% | 0.81 | 2% | 6.4 | 115 | 2.76 | 0.00 | 3.77 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 58% | 34% | 1.43 | 8% | 6.5 | 137 | 2.76 | 0.00 | 0.83 | 2.89 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 72% | 46% | 1.03 | 3% | 6.6 | 122 | 2.76 | 0.00 | 0.80 | 0.00 | 1.36 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 64% | 42% | 1.21 | 6% | 6.4 | 126 | 2.76 | 0.00 | 0.84 | 0.00 | 0.00 | 0.86 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 51% | 24% | 1.62 | 9% | 6.7 | 151 | 0.00 | 0.00 | 0.00 | 2.33 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 54% | 28% | 1.59 | 7% | 6.8 | 149 | 0.00 | 0.00 | 0.00 | 1.06 | 0.65 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 58% | 35% | 1.36 | 7% | 6.6 | 139 | 0.00 | 0.00 | 0.00 | 1.10 | 0.00 | 0.64 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 55% | 32% | 1.49 | 9% | 6.6 | 139 | 2.76 | 0.00 | 0.00 | 0.83 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 61% | 36% | 1.30 | 6% | 6.6 | 135 | 2.76 | 0.86 | 0.00 | 0.83 | 0.00 | 0.00 | 0.00 | 0.66 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 70% | 45% | 1.00 | 2% | 6.4 | 122 | 2.76 | 0.71 | 0.00 | 0.85 | 0.00 | 0.00 | 1.80 | 0.68 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 75% | 49% | 0.85 | 2% | 6.4 | 117 | 2.76 | 0.00 | 3.08 | 0.86 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 55% | 32% | 1.49 | 9% | 6.6 | 139 | 2.76 | 0.00 | 0.00 | 3.46 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 70% | 45% | 1.06 | 3% | 6.7 | 124 | 2.76 | 0.00 | 0.00 | 0.78 | 1.42 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 62% | 42% | 1.20 | 6% | 6.3 | 123 | 2.76 | 0.00 | 0.00 | 0.83 | 0.00 | 0.96 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 56% | 28% | 1.55 | 8% | 6.9 | 147 | 0.00 | 0.00 | 0.00 | 0.00 | 1.01 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 59% | 33% | 1.39 | 7% | 6.7 | 142 | 0.00 | 0.00 | 0.00 | 0.00 | 0.46 | 0.53 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 56% | 32% | 1.44 | 8% | 6.6 | 138 | 2.76 | 0.00 | 0.00 | 0.00 | 0.28 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 63% | 37% | 1.26 | 6% | 6.6 | 133 | 2.76 | 0.84 | 0.00 | 0.00 | 0.30 | 0.00 | 0.00 | 0.66 |
| Breacher / Ricochet + Contagion Vector | 400 | 71% | 47% | 0.95 | 2% | 6.3 | 120 | 2.76 | 0.70 | 0.00 | 0.00 | 0.27 | 0.00 | 1.79 | 0.68 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 77% | 52% | 0.81 | 1% | 6.4 | 115 | 2.76 | 0.00 | 2.98 | 0.00 | 0.31 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 57% | 33% | 1.42 | 7% | 6.6 | 137 | 2.76 | 0.00 | 0.00 | 2.79 | 0.34 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 71% | 47% | 1.02 | 3% | 6.7 | 122 | 2.76 | 0.00 | 0.00 | 0.00 | 1.56 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 62% | 41% | 1.22 | 6% | 6.4 | 126 | 2.76 | 0.00 | 0.00 | 0.00 | 0.27 | 0.89 | 0.00 | 0.00 |
| Rout / Rout | 400 | 58% | 34% | 1.35 | 7% | 6.6 | 140 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.87 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 57% | 34% | 1.43 | 7% | 6.5 | 137 | 2.76 | 0.00 | 0.00 | 0.00 | 0.00 | 0.24 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 63% | 38% | 1.23 | 5% | 6.5 | 132 | 2.76 | 0.86 | 0.00 | 0.00 | 0.00 | 0.23 | 0.00 | 0.66 |
| Rout / Ricochet + Contagion Vector | 400 | 71% | 48% | 0.95 | 2% | 6.3 | 120 | 2.76 | 0.72 | 0.00 | 0.00 | 0.00 | 0.20 | 1.77 | 0.68 |
| Rout / Ricochet + Incendiary Rounds | 400 | 76% | 51% | 0.82 | 1% | 6.4 | 116 | 2.76 | 0.00 | 3.08 | 0.00 | 0.00 | 0.20 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 58% | 35% | 1.40 | 7% | 6.5 | 136 | 2.76 | 0.00 | 0.00 | 2.88 | 0.00 | 0.32 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 72% | 48% | 1.01 | 3% | 6.7 | 122 | 2.76 | 0.00 | 0.00 | 0.00 | 1.36 | 0.24 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 62% | 42% | 1.22 | 6% | 6.3 | 125 | 2.76 | 0.00 | 0.00 | 0.00 | 0.00 | 1.06 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 67% | 44% | 1.06 | 4% | 6.5 | 119 | 5.39 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 73% | 50% | 0.87 | 2% | 6.4 | 113 | 5.43 | 0.85 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.63 |
| Ricochet / Ricochet + Contagion Vector | 400 | 78% | 58% | 0.66 | 1% | 6.3 | 103 | 5.46 | 0.72 | 0.00 | 0.00 | 0.00 | 0.00 | 1.64 | 0.62 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 82% | 62% | 0.67 | 1% | 6.5 | 103 | 5.62 | 0.00 | 2.66 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 67% | 44% | 1.06 | 4% | 6.5 | 119 | 5.39 | 0.00 | 0.00 | 2.57 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 76% | 54% | 0.81 | 3% | 6.5 | 106 | 5.51 | 0.00 | 0.00 | 0.00 | 1.01 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 72% | 53% | 0.85 | 3% | 6.3 | 107 | 5.40 | 0.00 | 0.00 | 0.00 | 0.00 | 1.03 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 75% | 53% | 0.79 | 1% | 6.3 | 109 | 5.44 | 1.72 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.14 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 79% | 60% | 0.63 | 0% | 6.2 | 101 | 5.47 | 1.48 | 0.00 | 0.00 | 0.00 | 0.00 | 1.50 | 1.17 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 82% | 64% | 0.63 | 1% | 6.4 | 101 | 5.62 | 0.94 | 2.64 | 0.00 | 0.00 | 0.00 | 0.00 | 0.72 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 69% | 46% | 0.99 | 3% | 6.4 | 116 | 5.40 | 0.88 | 0.00 | 2.55 | 0.00 | 0.00 | 0.00 | 0.67 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 78% | 55% | 0.78 | 2% | 6.5 | 105 | 5.52 | 0.80 | 0.00 | 0.00 | 1.00 | 0.00 | 0.00 | 0.67 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 74% | 54% | 0.80 | 2% | 6.3 | 105 | 5.41 | 0.83 | 0.00 | 0.00 | 0.00 | 1.00 | 0.00 | 0.73 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 82% | 62% | 0.55 | 1% | 6.1 | 97 | 5.49 | 1.33 | 0.00 | 0.00 | 0.00 | 0.00 | 2.08 | 1.21 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 86% | 68% | 0.52 | 1% | 6.2 | 94 | 5.64 | 0.82 | 2.65 | 0.00 | 0.00 | 0.00 | 1.39 | 0.76 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 75% | 52% | 0.80 | 2% | 6.3 | 107 | 5.42 | 0.75 | 0.00 | 2.56 | 0.00 | 0.00 | 1.49 | 0.70 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 82% | 59% | 0.64 | 1% | 6.3 | 97 | 5.54 | 0.69 | 0.00 | 0.00 | 0.97 | 0.00 | 1.44 | 0.70 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 78% | 58% | 0.69 | 1% | 6.2 | 99 | 5.42 | 0.73 | 0.00 | 0.00 | 0.00 | 0.99 | 1.34 | 0.77 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 89% | 70% | 0.43 | 1% | 6.2 | 91 | 5.70 | 0.00 | 4.91 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 80% | 57% | 0.65 | 1% | 6.2 | 101 | 5.48 | 0.00 | 2.74 | 2.63 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 87% | 65% | 0.48 | 1% | 6.3 | 91 | 5.60 | 0.00 | 2.65 | 0.00 | 0.99 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 83% | 63% | 0.53 | 1% | 6.1 | 92 | 5.49 | 0.00 | 2.71 | 0.00 | 0.00 | 0.96 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 67% | 44% | 1.06 | 4% | 6.5 | 119 | 5.39 | 0.00 | 0.00 | 4.48 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 78% | 57% | 0.73 | 3% | 6.5 | 103 | 5.51 | 0.00 | 0.00 | 2.43 | 1.37 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 74% | 56% | 0.79 | 3% | 6.2 | 101 | 5.40 | 0.00 | 0.00 | 2.58 | 0.00 | 1.33 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 84% | 63% | 0.61 | 1% | 6.5 | 96 | 5.57 | 0.00 | 0.00 | 0.00 | 1.89 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 79% | 61% | 0.68 | 2% | 6.4 | 96 | 5.45 | 0.00 | 0.00 | 0.00 | 1.00 | 1.03 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 75% | 58% | 0.71 | 2% | 6.2 | 99 | 5.41 | 0.00 | 0.00 | 0.00 | 0.00 | 1.61 | 0.00 | 0.00 |

## swarm, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 85% | 63% | 0.70 | 3% | 6.6 | 101 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 88% | 68% | 0.57 | 2% | 6.5 | 96 | 0.00 | 0.82 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 |
| Contagion Vector | 400 | 91% | 74% | 0.42 | 2% | 6.3 | 88 | 0.00 | 0.73 | 0.00 | 0.00 | 0.00 | 0.00 | 1.94 | 0.10 |
| Incendiary Rounds | 400 | 88% | 68% | 0.57 | 2% | 6.5 | 96 | 0.00 | 0.00 | 0.92 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 85% | 63% | 0.70 | 3% | 6.6 | 101 | 0.00 | 0.00 | 0.00 | 0.94 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 85% | 62% | 0.70 | 3% | 6.6 | 101 | 0.00 | 0.00 | 0.00 | 0.00 | 0.02 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 87% | 68% | 0.58 | 3% | 6.5 | 94 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.86 | 0.00 | 0.00 |
| Ricochet | 400 | 90% | 72% | 0.57 | 2% | 6.6 | 85 | 2.91 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 94% | 79% | 0.43 | 1% | 6.4 | 74 | 2.91 | 1.78 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 |
| Ricochet + Contagion Vector | 400 | 94% | 84% | 0.34 | 0% | 6.2 | 64 | 2.91 | 1.38 | 0.00 | 0.00 | 0.00 | 0.00 | 2.89 | 0.13 |
| Ricochet + Incendiary Rounds | 400 | 94% | 79% | 0.43 | 1% | 6.4 | 73 | 2.91 | 0.00 | 1.92 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 90% | 72% | 0.57 | 2% | 6.6 | 85 | 2.91 | 0.00 | 0.00 | 1.90 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 90% | 72% | 0.56 | 2% | 6.6 | 84 | 2.91 | 0.00 | 0.00 | 0.00 | 0.03 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 91% | 78% | 0.46 | 1% | 6.4 | 69 | 2.91 | 0.00 | 0.00 | 0.00 | 0.00 | 1.51 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 90% | 68% | 0.53 | 1% | 6.5 | 93 | 0.00 | 1.67 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.17 |
| Cytotoxic Vector / Contagion Vector | 400 | 92% | 74% | 0.38 | 1% | 6.3 | 85 | 0.00 | 1.52 | 0.00 | 0.00 | 0.00 | 0.00 | 1.88 | 0.18 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 90% | 68% | 0.53 | 1% | 6.5 | 93 | 0.00 | 0.86 | 0.93 | 0.00 | 0.00 | 0.00 | 0.00 | 0.09 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 87% | 64% | 0.63 | 2% | 6.5 | 97 | 0.00 | 0.85 | 0.00 | 0.94 | 0.00 | 0.00 | 0.00 | 0.08 |
| Cytotoxic Vector / Breacher | 400 | 87% | 64% | 0.63 | 2% | 6.5 | 97 | 0.00 | 0.85 | 0.00 | 0.00 | 0.03 | 0.00 | 0.00 | 0.07 |
| Cytotoxic Vector / Rout | 400 | 89% | 69% | 0.52 | 1% | 6.4 | 90 | 0.00 | 0.84 | 0.00 | 0.00 | 0.00 | 0.85 | 0.00 | 0.09 |
| Cytotoxic Vector / Ricochet | 400 | 91% | 73% | 0.54 | 1% | 6.5 | 83 | 2.90 | 0.77 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.09 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 95% | 79% | 0.41 | 1% | 6.3 | 72 | 2.90 | 2.51 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.21 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 95% | 84% | 0.34 | 1% | 6.2 | 64 | 2.90 | 2.04 | 0.00 | 0.00 | 0.00 | 0.00 | 2.83 | 0.21 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 95% | 79% | 0.41 | 1% | 6.3 | 72 | 2.90 | 0.76 | 1.91 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 91% | 73% | 0.54 | 1% | 6.5 | 83 | 2.90 | 0.77 | 0.00 | 1.90 | 0.00 | 0.00 | 0.00 | 0.09 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 91% | 73% | 0.53 | 1% | 6.5 | 83 | 2.90 | 0.77 | 0.00 | 0.00 | 0.03 | 0.00 | 0.00 | 0.08 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 92% | 79% | 0.43 | 1% | 6.4 | 68 | 2.90 | 0.75 | 0.00 | 0.00 | 0.00 | 1.51 | 0.00 | 0.11 |
| Contagion Vector / Contagion Vector | 400 | 93% | 79% | 0.31 | 1% | 6.1 | 78 | 0.00 | 1.39 | 0.00 | 0.00 | 0.00 | 0.00 | 2.88 | 0.18 |
| Contagion Vector / Incendiary Rounds | 400 | 91% | 74% | 0.43 | 1% | 6.2 | 85 | 0.00 | 0.72 | 0.93 | 0.00 | 0.00 | 0.00 | 1.61 | 0.10 |
| Contagion Vector / Spotter’s Eye | 400 | 89% | 71% | 0.48 | 1% | 6.3 | 88 | 0.00 | 0.71 | 0.00 | 0.93 | 0.00 | 0.00 | 1.64 | 0.09 |
| Contagion Vector / Breacher | 400 | 89% | 71% | 0.48 | 1% | 6.3 | 88 | 0.00 | 0.71 | 0.00 | 0.00 | 0.02 | 0.00 | 1.64 | 0.08 |
| Contagion Vector / Rout | 400 | 91% | 76% | 0.39 | 1% | 6.2 | 82 | 0.00 | 0.72 | 0.00 | 0.00 | 0.00 | 0.84 | 1.51 | 0.10 |
| Contagion Vector / Ricochet | 400 | 93% | 76% | 0.47 | 1% | 6.4 | 78 | 2.91 | 0.71 | 0.00 | 0.00 | 0.00 | 0.00 | 1.16 | 0.09 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 96% | 81% | 0.37 | 1% | 6.3 | 69 | 2.91 | 2.31 | 0.00 | 0.00 | 0.00 | 0.00 | 0.93 | 0.23 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 96% | 84% | 0.31 | 1% | 6.1 | 62 | 2.91 | 1.96 | 0.00 | 0.00 | 0.00 | 0.00 | 3.08 | 0.22 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 96% | 81% | 0.37 | 1% | 6.3 | 69 | 2.91 | 0.70 | 1.92 | 0.00 | 0.00 | 0.00 | 1.07 | 0.10 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 93% | 76% | 0.47 | 1% | 6.4 | 78 | 2.91 | 0.71 | 0.00 | 1.90 | 0.00 | 0.00 | 1.16 | 0.09 |
| Contagion Vector / Ricochet + Breacher | 400 | 93% | 76% | 0.46 | 1% | 6.4 | 78 | 2.91 | 0.70 | 0.00 | 0.00 | 0.02 | 0.00 | 1.16 | 0.08 |
| Contagion Vector / Ricochet + Rout | 400 | 94% | 81% | 0.38 | 1% | 6.3 | 65 | 2.91 | 0.70 | 0.00 | 0.00 | 0.00 | 1.51 | 0.98 | 0.11 |
| Incendiary Rounds / Incendiary Rounds | 400 | 90% | 68% | 0.53 | 1% | 6.5 | 93 | 0.00 | 0.00 | 1.84 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 87% | 64% | 0.63 | 2% | 6.5 | 97 | 0.00 | 0.00 | 0.93 | 0.94 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 87% | 64% | 0.63 | 2% | 6.5 | 97 | 0.00 | 0.00 | 0.92 | 0.00 | 0.03 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 89% | 69% | 0.51 | 1% | 6.4 | 89 | 0.00 | 0.00 | 0.93 | 0.00 | 0.00 | 0.85 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 90% | 73% | 0.54 | 1% | 6.5 | 83 | 2.90 | 0.00 | 0.86 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 95% | 79% | 0.41 | 0% | 6.3 | 72 | 2.90 | 1.78 | 0.86 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 96% | 83% | 0.34 | 0% | 6.2 | 64 | 2.90 | 1.39 | 0.90 | 0.00 | 0.00 | 0.00 | 2.88 | 0.13 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 95% | 79% | 0.41 | 0% | 6.3 | 72 | 2.90 | 0.00 | 2.73 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 90% | 73% | 0.54 | 1% | 6.5 | 83 | 2.90 | 0.00 | 0.86 | 1.90 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 91% | 73% | 0.53 | 1% | 6.5 | 83 | 2.90 | 0.00 | 0.85 | 0.00 | 0.03 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 92% | 80% | 0.43 | 1% | 6.3 | 68 | 2.90 | 0.00 | 0.86 | 0.00 | 0.00 | 1.51 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 85% | 63% | 0.70 | 3% | 6.6 | 101 | 0.00 | 0.00 | 0.00 | 1.80 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 85% | 62% | 0.70 | 3% | 6.6 | 101 | 0.00 | 0.00 | 0.00 | 0.88 | 0.02 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 87% | 68% | 0.58 | 3% | 6.5 | 93 | 0.00 | 0.00 | 0.00 | 0.91 | 0.00 | 0.93 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 90% | 72% | 0.57 | 2% | 6.6 | 85 | 2.91 | 0.00 | 0.00 | 0.84 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 94% | 79% | 0.43 | 1% | 6.4 | 74 | 2.91 | 1.78 | 0.00 | 0.83 | 0.00 | 0.00 | 0.00 | 0.13 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 94% | 84% | 0.34 | 0% | 6.2 | 64 | 2.91 | 1.38 | 0.00 | 0.89 | 0.00 | 0.00 | 2.89 | 0.13 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 94% | 79% | 0.43 | 1% | 6.4 | 73 | 2.91 | 0.00 | 1.92 | 0.84 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 90% | 72% | 0.57 | 2% | 6.6 | 85 | 2.91 | 0.00 | 0.00 | 2.68 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 90% | 72% | 0.56 | 2% | 6.6 | 84 | 2.91 | 0.00 | 0.00 | 0.83 | 0.03 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 91% | 79% | 0.46 | 1% | 6.4 | 69 | 2.91 | 0.00 | 0.00 | 0.84 | 0.00 | 1.60 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 85% | 62% | 0.70 | 3% | 6.6 | 101 | 0.00 | 0.00 | 0.00 | 0.00 | 0.04 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 87% | 68% | 0.58 | 3% | 6.5 | 94 | 0.00 | 0.00 | 0.00 | 0.00 | 0.01 | 0.86 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 90% | 72% | 0.57 | 2% | 6.6 | 85 | 2.90 | 0.00 | 0.00 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 94% | 79% | 0.43 | 1% | 6.4 | 74 | 2.90 | 1.78 | 0.00 | 0.00 | 0.02 | 0.00 | 0.00 | 0.13 |
| Breacher / Ricochet + Contagion Vector | 400 | 94% | 84% | 0.34 | 0% | 6.2 | 64 | 2.90 | 1.38 | 0.00 | 0.00 | 0.02 | 0.00 | 2.89 | 0.12 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 94% | 79% | 0.43 | 1% | 6.4 | 73 | 2.90 | 0.00 | 1.91 | 0.00 | 0.02 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 90% | 72% | 0.57 | 2% | 6.6 | 85 | 2.90 | 0.00 | 0.00 | 1.90 | 0.01 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 90% | 72% | 0.56 | 2% | 6.6 | 84 | 2.90 | 0.00 | 0.00 | 0.00 | 0.04 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 91% | 78% | 0.46 | 1% | 6.4 | 69 | 2.90 | 0.00 | 0.00 | 0.00 | 0.02 | 1.51 | 0.00 | 0.00 |
| Rout / Rout | 400 | 89% | 70% | 0.53 | 2% | 6.4 | 88 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.40 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 90% | 73% | 0.55 | 1% | 6.6 | 82 | 2.91 | 0.00 | 0.00 | 0.00 | 0.00 | 0.40 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 94% | 80% | 0.41 | 1% | 6.3 | 71 | 2.91 | 1.79 | 0.00 | 0.00 | 0.00 | 0.35 | 0.00 | 0.13 |
| Rout / Ricochet + Contagion Vector | 400 | 94% | 84% | 0.33 | 0% | 6.1 | 62 | 2.91 | 1.39 | 0.00 | 0.00 | 0.00 | 0.31 | 2.85 | 0.13 |
| Rout / Ricochet + Incendiary Rounds | 400 | 94% | 80% | 0.41 | 1% | 6.3 | 71 | 2.91 | 0.00 | 1.92 | 0.00 | 0.00 | 0.35 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 91% | 73% | 0.53 | 1% | 6.5 | 81 | 2.91 | 0.00 | 0.00 | 1.91 | 0.00 | 0.52 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 90% | 73% | 0.54 | 1% | 6.6 | 82 | 2.91 | 0.00 | 0.00 | 0.00 | 0.02 | 0.40 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 91% | 79% | 0.44 | 1% | 6.3 | 67 | 2.91 | 0.00 | 0.00 | 0.00 | 0.00 | 1.77 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 97% | 84% | 0.22 | 0% | 6.2 | 58 | 5.83 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 99% | 88% | 0.15 | 0% | 6.0 | 52 | 5.81 | 1.42 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 |
| Ricochet / Ricochet + Contagion Vector | 400 | 99% | 91% | 0.11 | 0% | 5.9 | 46 | 5.74 | 1.08 | 0.00 | 0.00 | 0.00 | 0.00 | 2.54 | 0.10 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 99% | 87% | 0.15 | 0% | 6.0 | 52 | 5.81 | 0.00 | 1.52 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 97% | 84% | 0.22 | 0% | 6.2 | 58 | 5.83 | 0.00 | 0.00 | 1.52 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 97% | 84% | 0.22 | 0% | 6.2 | 58 | 5.83 | 0.00 | 0.00 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 98% | 88% | 0.16 | 0% | 6.0 | 46 | 5.79 | 0.00 | 0.00 | 0.00 | 0.00 | 1.52 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 99% | 91% | 0.12 | 0% | 5.9 | 48 | 5.79 | 3.04 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.27 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 99% | 93% | 0.09 | 0% | 5.8 | 43 | 5.72 | 2.47 | 0.00 | 0.00 | 0.00 | 0.00 | 2.35 | 0.30 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 99% | 90% | 0.12 | 0% | 5.9 | 48 | 5.79 | 1.67 | 1.56 | 0.00 | 0.00 | 0.00 | 0.00 | 0.19 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 98% | 87% | 0.18 | 0% | 6.0 | 53 | 5.81 | 1.65 | 0.00 | 1.56 | 0.00 | 0.00 | 0.00 | 0.19 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 98% | 87% | 0.18 | 0% | 6.0 | 53 | 5.81 | 1.65 | 0.00 | 0.00 | 0.01 | 0.00 | 0.00 | 0.19 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 98% | 90% | 0.13 | 0% | 5.9 | 43 | 5.76 | 1.59 | 0.00 | 0.00 | 0.00 | 1.48 | 0.00 | 0.21 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 99% | 96% | 0.06 | 0% | 5.8 | 40 | 5.67 | 2.12 | 0.00 | 0.00 | 0.00 | 0.00 | 3.28 | 0.30 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 99% | 94% | 0.08 | 0% | 5.8 | 43 | 5.74 | 1.32 | 1.58 | 0.00 | 0.00 | 0.00 | 2.28 | 0.20 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 98% | 90% | 0.14 | 0% | 5.9 | 48 | 5.77 | 1.32 | 0.00 | 1.57 | 0.00 | 0.00 | 2.33 | 0.20 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 98% | 90% | 0.14 | 0% | 5.9 | 48 | 5.77 | 1.32 | 0.00 | 0.00 | 0.02 | 0.00 | 2.33 | 0.20 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 98% | 93% | 0.10 | 0% | 5.8 | 39 | 5.72 | 1.31 | 0.00 | 0.00 | 0.00 | 1.44 | 2.15 | 0.22 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 99% | 90% | 0.12 | 0% | 5.9 | 48 | 5.79 | 0.00 | 3.31 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 98% | 87% | 0.18 | 0% | 6.0 | 53 | 5.81 | 0.00 | 1.84 | 1.56 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 98% | 87% | 0.18 | 0% | 6.0 | 53 | 5.81 | 0.00 | 1.84 | 0.00 | 0.01 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 98% | 90% | 0.13 | 0% | 5.8 | 43 | 5.76 | 0.00 | 1.80 | 0.00 | 0.00 | 1.48 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 97% | 84% | 0.22 | 0% | 6.2 | 58 | 5.83 | 0.00 | 0.00 | 3.26 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 97% | 84% | 0.22 | 0% | 6.1 | 58 | 5.83 | 0.00 | 0.00 | 1.81 | 0.03 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 98% | 88% | 0.15 | 0% | 6.0 | 44 | 5.79 | 0.00 | 0.00 | 1.74 | 0.00 | 1.85 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 97% | 84% | 0.22 | 0% | 6.1 | 58 | 5.83 | 0.00 | 0.00 | 0.00 | 0.06 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 98% | 87% | 0.16 | 0% | 6.0 | 46 | 5.79 | 0.00 | 0.00 | 0.00 | 0.04 | 1.52 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 98% | 91% | 0.12 | 0% | 5.9 | 38 | 5.75 | 0.00 | 0.00 | 0.00 | 0.00 | 2.40 | 0.00 | 0.00 |

## synthetic, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 91% | 68% | 0.66 | 1% | 7.3 | 103 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 93% | 68% | 0.63 | 1% | 7.3 | 102 | 0.00 | 0.41 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.32 |
| Contagion Vector | 400 | 93% | 69% | 0.62 | 1% | 7.3 | 102 | 0.00 | 0.40 | 0.00 | 0.00 | 0.00 | 0.00 | 0.09 | 1.31 |
| Incendiary Rounds | 400 | 95% | 71% | 0.52 | 1% | 7.1 | 95 | 0.00 | 0.00 | 1.75 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 91% | 68% | 0.66 | 1% | 7.3 | 103 | 0.00 | 0.00 | 0.00 | 1.73 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 93% | 70% | 0.58 | 1% | 7.2 | 98 | 0.00 | 0.00 | 0.00 | 0.00 | 0.52 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 91% | 68% | 0.66 | 1% | 7.3 | 103 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.51 | 1% | 7.1 | 86 | 2.97 | 0.47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.78 |
| Ricochet + Contagion Vector | 400 | 95% | 72% | 0.51 | 1% | 7.0 | 85 | 2.97 | 0.45 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 | 2.78 |
| Ricochet + Incendiary Rounds | 400 | 98% | 82% | 0.30 | 0% | 6.6 | 68 | 2.97 | 0.00 | 3.29 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 3.26 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 96% | 79% | 0.38 | 1% | 6.8 | 72 | 2.97 | 0.00 | 0.00 | 0.00 | 1.24 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 93% | 68% | 0.61 | 1% | 7.3 | 100 | 0.00 | 0.73 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.27 |
| Cytotoxic Vector / Contagion Vector | 400 | 93% | 69% | 0.61 | 1% | 7.2 | 100 | 0.00 | 0.72 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 | 2.27 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 95% | 71% | 0.52 | 1% | 7.0 | 94 | 0.00 | 0.36 | 1.75 | 0.00 | 0.00 | 0.00 | 0.00 | 1.10 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 92% | 68% | 0.64 | 1% | 7.3 | 101 | 0.00 | 0.34 | 0.00 | 1.73 | 0.00 | 0.00 | 0.00 | 1.10 |
| Cytotoxic Vector / Breacher | 400 | 93% | 70% | 0.57 | 1% | 7.2 | 97 | 0.00 | 0.33 | 0.00 | 0.00 | 0.52 | 0.00 | 0.00 | 1.02 |
| Cytotoxic Vector / Rout | 400 | 92% | 68% | 0.64 | 1% | 7.3 | 101 | 0.00 | 0.34 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.10 |
| Cytotoxic Vector / Ricochet | 400 | 94% | 71% | 0.54 | 1% | 7.1 | 87 | 2.97 | 0.32 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.74 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.76 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 3.33 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.73 | 0.00 | 0.00 | 0.00 | 0.00 | 0.09 | 3.33 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 98% | 83% | 0.29 | 0% | 6.5 | 67 | 2.97 | 0.39 | 3.29 | 0.00 | 0.00 | 0.00 | 0.00 | 0.79 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 94% | 71% | 0.54 | 1% | 7.1 | 87 | 2.97 | 0.32 | 0.00 | 3.27 | 0.00 | 0.00 | 0.00 | 0.74 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 96% | 79% | 0.37 | 0% | 6.8 | 72 | 2.97 | 0.40 | 0.00 | 0.00 | 1.24 | 0.00 | 0.00 | 0.62 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 94% | 71% | 0.54 | 1% | 7.1 | 87 | 2.97 | 0.32 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.74 |
| Contagion Vector / Contagion Vector | 400 | 93% | 69% | 0.61 | 1% | 7.2 | 100 | 0.00 | 0.72 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 | 2.27 |
| Contagion Vector / Incendiary Rounds | 400 | 95% | 71% | 0.52 | 1% | 7.0 | 94 | 0.00 | 0.35 | 1.74 | 0.00 | 0.00 | 0.00 | 0.07 | 1.10 |
| Contagion Vector / Spotter’s Eye | 400 | 92% | 68% | 0.64 | 1% | 7.2 | 101 | 0.00 | 0.33 | 0.00 | 1.73 | 0.00 | 0.00 | 0.07 | 1.10 |
| Contagion Vector / Breacher | 400 | 93% | 71% | 0.57 | 1% | 7.1 | 97 | 0.00 | 0.32 | 0.00 | 0.00 | 0.52 | 0.00 | 0.08 | 1.02 |
| Contagion Vector / Rout | 400 | 92% | 68% | 0.64 | 1% | 7.2 | 101 | 0.00 | 0.33 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 | 1.10 |
| Contagion Vector / Ricochet | 400 | 94% | 71% | 0.54 | 1% | 7.1 | 87 | 2.97 | 0.31 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 | 0.74 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.72 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 | 3.33 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.70 | 0.00 | 0.00 | 0.00 | 0.00 | 0.14 | 3.33 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 98% | 83% | 0.29 | 0% | 6.5 | 67 | 2.97 | 0.38 | 3.29 | 0.00 | 0.00 | 0.00 | 0.11 | 0.79 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 94% | 71% | 0.54 | 1% | 7.1 | 87 | 2.97 | 0.31 | 0.00 | 3.27 | 0.00 | 0.00 | 0.07 | 0.74 |
| Contagion Vector / Ricochet + Breacher | 400 | 96% | 79% | 0.37 | 0% | 6.8 | 71 | 2.97 | 0.39 | 0.00 | 0.00 | 1.24 | 0.00 | 0.11 | 0.63 |
| Contagion Vector / Ricochet + Rout | 400 | 94% | 71% | 0.54 | 1% | 7.1 | 87 | 2.97 | 0.31 | 0.00 | 0.00 | 0.00 | 0.00 | 0.07 | 0.74 |
| Incendiary Rounds / Incendiary Rounds | 400 | 97% | 72% | 0.43 | 0% | 6.9 | 89 | 0.00 | 0.00 | 3.08 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 93% | 70% | 0.56 | 0% | 7.1 | 97 | 0.00 | 0.00 | 1.47 | 1.71 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 94% | 72% | 0.51 | 1% | 7.1 | 93 | 0.00 | 0.00 | 1.40 | 0.00 | 0.52 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 93% | 70% | 0.56 | 0% | 7.1 | 97 | 0.00 | 0.00 | 1.47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 95% | 73% | 0.50 | 1% | 7.1 | 85 | 2.97 | 0.00 | 1.10 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 96% | 73% | 0.48 | 1% | 7.0 | 83 | 2.97 | 0.51 | 1.10 | 0.00 | 0.00 | 0.00 | 0.00 | 2.80 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 96% | 73% | 0.47 | 1% | 6.9 | 82 | 2.97 | 0.48 | 1.09 | 0.00 | 0.00 | 0.00 | 0.11 | 2.80 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 98% | 84% | 0.28 | 0% | 6.5 | 67 | 2.97 | 0.00 | 4.30 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 95% | 73% | 0.50 | 1% | 7.1 | 85 | 2.97 | 0.00 | 1.10 | 3.32 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 97% | 80% | 0.35 | 0% | 6.8 | 70 | 2.97 | 0.00 | 1.04 | 0.00 | 1.24 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 95% | 73% | 0.50 | 1% | 7.1 | 85 | 2.97 | 0.00 | 1.10 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 91% | 68% | 0.66 | 1% | 7.3 | 103 | 0.00 | 0.00 | 0.00 | 2.98 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 92% | 70% | 0.59 | 1% | 7.2 | 98 | 0.00 | 0.00 | 0.00 | 1.33 | 0.58 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 91% | 68% | 0.66 | 1% | 7.3 | 103 | 0.00 | 0.00 | 0.00 | 1.43 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 1.06 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.51 | 1% | 7.1 | 86 | 2.97 | 0.47 | 0.00 | 1.05 | 0.00 | 0.00 | 0.00 | 2.78 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 95% | 72% | 0.51 | 1% | 7.0 | 85 | 2.97 | 0.45 | 0.00 | 1.05 | 0.00 | 0.00 | 0.10 | 2.78 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 98% | 82% | 0.30 | 0% | 6.6 | 68 | 2.97 | 0.00 | 3.29 | 1.17 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 4.09 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 96% | 79% | 0.38 | 1% | 6.8 | 72 | 2.97 | 0.00 | 0.00 | 1.02 | 1.26 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 1.06 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 93% | 71% | 0.56 | 2% | 7.1 | 94 | 0.00 | 0.00 | 0.00 | 0.00 | 0.89 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 91% | 69% | 0.62 | 1% | 7.2 | 98 | 0.00 | 0.00 | 0.00 | 0.00 | 0.43 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 94% | 72% | 0.53 | 1% | 7.2 | 86 | 2.97 | 0.00 | 0.00 | 0.00 | 0.27 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.50 | 1% | 7.1 | 84 | 2.97 | 0.47 | 0.00 | 0.00 | 0.26 | 0.00 | 0.00 | 2.66 |
| Breacher / Ricochet + Contagion Vector | 400 | 95% | 72% | 0.49 | 1% | 7.0 | 84 | 2.97 | 0.46 | 0.00 | 0.00 | 0.26 | 0.00 | 0.10 | 2.66 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 98% | 82% | 0.30 | 0% | 6.6 | 68 | 2.97 | 0.00 | 3.16 | 0.00 | 0.28 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 94% | 72% | 0.53 | 1% | 7.1 | 86 | 2.97 | 0.00 | 0.00 | 3.13 | 0.32 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 96% | 78% | 0.38 | 1% | 6.8 | 72 | 2.97 | 0.00 | 0.00 | 0.00 | 1.38 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 94% | 72% | 0.53 | 1% | 7.2 | 86 | 2.97 | 0.00 | 0.00 | 0.00 | 0.27 | 0.00 | 0.00 | 0.00 |
| Rout / Rout | 400 | 91% | 68% | 0.66 | 1% | 7.3 | 103 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 95% | 72% | 0.51 | 1% | 7.1 | 86 | 2.97 | 0.47 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.78 |
| Rout / Ricochet + Contagion Vector | 400 | 95% | 72% | 0.51 | 1% | 7.0 | 85 | 2.97 | 0.45 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 | 2.78 |
| Rout / Ricochet + Incendiary Rounds | 400 | 98% | 82% | 0.30 | 0% | 6.6 | 68 | 2.97 | 0.00 | 3.29 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 3.26 | 0.00 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 96% | 79% | 0.38 | 1% | 6.8 | 72 | 2.97 | 0.00 | 0.00 | 0.00 | 1.24 | 0.00 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 94% | 71% | 0.55 | 1% | 7.2 | 88 | 2.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 98% | 82% | 0.33 | 1% | 6.8 | 67 | 5.96 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 99% | 82% | 0.29 | 0% | 6.6 | 65 | 5.96 | 0.49 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.09 |
| Ricochet / Ricochet + Contagion Vector | 400 | 99% | 82% | 0.29 | 0% | 6.6 | 65 | 5.96 | 0.48 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 | 2.09 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 100% | 90% | 0.16 | 0% | 6.3 | 53 | 5.92 | 0.00 | 2.54 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 98% | 82% | 0.33 | 1% | 6.8 | 67 | 5.96 | 0.00 | 0.00 | 2.57 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 99% | 86% | 0.24 | 0% | 6.5 | 58 | 5.96 | 0.00 | 0.00 | 0.00 | 0.74 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 98% | 82% | 0.33 | 1% | 6.8 | 67 | 5.96 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 99% | 83% | 0.29 | 0% | 6.6 | 64 | 5.96 | 1.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 3.83 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 99% | 83% | 0.28 | 0% | 6.6 | 64 | 5.96 | 0.97 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 | 3.83 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 100% | 90% | 0.15 | 0% | 6.2 | 52 | 5.92 | 0.63 | 2.52 | 0.00 | 0.00 | 0.00 | 0.00 | 2.31 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 98% | 82% | 0.32 | 0% | 6.7 | 67 | 5.96 | 0.59 | 0.00 | 2.56 | 0.00 | 0.00 | 0.00 | 2.33 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 99% | 87% | 0.23 | 0% | 6.5 | 58 | 5.96 | 0.61 | 0.00 | 0.00 | 0.74 | 0.00 | 0.00 | 2.22 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 98% | 82% | 0.32 | 0% | 6.7 | 67 | 5.96 | 0.59 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 2.33 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 99% | 83% | 0.28 | 0% | 6.5 | 64 | 5.96 | 0.94 | 0.00 | 0.00 | 0.00 | 0.00 | 0.16 | 3.83 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 100% | 90% | 0.15 | 0% | 6.2 | 52 | 5.92 | 0.59 | 2.52 | 0.00 | 0.00 | 0.00 | 0.14 | 2.31 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 98% | 82% | 0.32 | 0% | 6.7 | 66 | 5.96 | 0.58 | 0.00 | 2.56 | 0.00 | 0.00 | 0.11 | 2.33 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 99% | 87% | 0.23 | 0% | 6.4 | 58 | 5.96 | 0.60 | 0.00 | 0.00 | 0.74 | 0.00 | 0.12 | 2.22 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 98% | 82% | 0.32 | 0% | 6.7 | 66 | 5.96 | 0.58 | 0.00 | 0.00 | 0.00 | 0.00 | 0.11 | 2.33 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 100% | 93% | 0.10 | 0% | 6.0 | 46 | 5.92 | 0.00 | 4.85 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 98% | 85% | 0.23 | 0% | 6.4 | 58 | 5.96 | 0.00 | 2.87 | 2.57 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 99% | 90% | 0.15 | 0% | 6.3 | 49 | 5.95 | 0.00 | 2.77 | 0.00 | 0.74 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 98% | 85% | 0.23 | 0% | 6.4 | 58 | 5.96 | 0.00 | 2.87 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 98% | 82% | 0.33 | 1% | 6.8 | 67 | 5.96 | 0.00 | 0.00 | 4.82 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 99% | 86% | 0.24 | 0% | 6.5 | 57 | 5.96 | 0.00 | 0.00 | 2.71 | 1.01 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 98% | 82% | 0.33 | 1% | 6.8 | 67 | 5.96 | 0.00 | 0.00 | 2.92 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 99% | 88% | 0.20 | 0% | 6.4 | 50 | 5.95 | 0.00 | 0.00 | 0.00 | 1.52 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 98% | 83% | 0.28 | 0% | 6.6 | 58 | 5.96 | 0.00 | 0.00 | 0.00 | 0.87 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 98% | 82% | 0.33 | 1% | 6.8 | 67 | 5.96 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## mixed, committed

| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Put infected | Put burning | Put marked | Put exposed | Put shaken | Spreads | Shrugs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no build | 400 | 24% | 3% | 2.63 | 13% | 5.7 | 168 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cytotoxic Vector | 400 | 28% | 4% | 2.56 | 16% | 5.7 | 165 | 0.00 | 0.66 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.44 |
| Contagion Vector | 400 | 32% | 5% | 2.38 | 11% | 5.7 | 161 | 0.00 | 0.56 | 0.00 | 0.00 | 0.00 | 0.00 | 1.19 | 0.46 |
| Incendiary Rounds | 400 | 28% | 4% | 2.54 | 16% | 5.8 | 164 | 0.00 | 0.00 | 1.14 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye | 400 | 24% | 3% | 2.63 | 13% | 5.7 | 168 | 0.00 | 0.00 | 0.00 | 1.06 | 0.00 | 0.00 | 0.00 | 0.00 |
| Breacher | 400 | 25% | 3% | 2.60 | 14% | 5.7 | 167 | 0.00 | 0.00 | 0.00 | 0.00 | 0.20 | 0.00 | 0.00 | 0.00 |
| Rout | 400 | 25% | 6% | 2.54 | 12% | 5.7 | 166 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.20 | 0.00 | 0.00 |
| Ricochet | 400 | 34% | 8% | 2.31 | 10% | 5.7 | 158 | 2.61 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector | 400 | 40% | 14% | 2.06 | 9% | 5.8 | 152 | 2.61 | 1.54 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.08 |
| Ricochet + Contagion Vector | 400 | 47% | 19% | 1.89 | 10% | 5.9 | 146 | 2.61 | 1.21 | 0.00 | 0.00 | 0.00 | 0.00 | 1.88 | 1.10 |
| Ricochet + Incendiary Rounds | 400 | 44% | 16% | 1.99 | 7% | 5.9 | 149 | 2.61 | 0.00 | 2.72 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye | 400 | 34% | 8% | 2.31 | 10% | 5.7 | 158 | 2.61 | 0.00 | 0.00 | 2.50 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher | 400 | 34% | 9% | 2.24 | 11% | 5.8 | 156 | 2.61 | 0.00 | 0.00 | 0.00 | 0.53 | 0.00 | 0.00 | 0.00 |
| Ricochet + Rout | 400 | 36% | 10% | 2.21 | 9% | 5.7 | 154 | 2.61 | 0.00 | 0.00 | 0.00 | 0.00 | 0.35 | 0.00 | 0.00 |
| Cytotoxic Vector / Cytotoxic Vector | 400 | 30% | 5% | 2.50 | 15% | 5.8 | 164 | 0.00 | 1.22 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.68 |
| Cytotoxic Vector / Contagion Vector | 400 | 33% | 6% | 2.34 | 12% | 5.7 | 160 | 0.00 | 1.08 | 0.00 | 0.00 | 0.00 | 0.00 | 1.10 | 0.72 |
| Cytotoxic Vector / Incendiary Rounds | 400 | 30% | 5% | 2.49 | 15% | 5.8 | 163 | 0.00 | 0.64 | 1.15 | 0.00 | 0.00 | 0.00 | 0.00 | 0.26 |
| Cytotoxic Vector / Spotter’s Eye | 400 | 26% | 4% | 2.57 | 14% | 5.7 | 166 | 0.00 | 0.60 | 0.00 | 1.07 | 0.00 | 0.00 | 0.00 | 0.25 |
| Cytotoxic Vector / Breacher | 400 | 28% | 4% | 2.53 | 14% | 5.7 | 165 | 0.00 | 0.62 | 0.00 | 0.00 | 0.21 | 0.00 | 0.00 | 0.24 |
| Cytotoxic Vector / Rout | 400 | 27% | 6% | 2.47 | 12% | 5.7 | 164 | 0.00 | 0.59 | 0.00 | 0.00 | 0.00 | 0.21 | 0.00 | 0.26 |
| Cytotoxic Vector / Ricochet | 400 | 34% | 8% | 2.29 | 11% | 5.7 | 157 | 2.61 | 0.35 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.13 |
| Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 41% | 14% | 2.03 | 9% | 5.8 | 151 | 2.61 | 1.87 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.19 |
| Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 47% | 19% | 1.88 | 9% | 5.9 | 146 | 2.61 | 1.49 | 0.00 | 0.00 | 0.00 | 0.00 | 1.81 | 1.24 |
| Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 43% | 16% | 1.97 | 7% | 5.9 | 148 | 2.61 | 0.38 | 2.71 | 0.00 | 0.00 | 0.00 | 0.00 | 0.15 |
| Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 34% | 8% | 2.29 | 11% | 5.7 | 157 | 2.61 | 0.35 | 0.00 | 2.50 | 0.00 | 0.00 | 0.00 | 0.13 |
| Cytotoxic Vector / Ricochet + Breacher | 400 | 34% | 10% | 2.21 | 11% | 5.7 | 155 | 2.61 | 0.39 | 0.00 | 0.00 | 0.53 | 0.00 | 0.00 | 0.12 |
| Cytotoxic Vector / Ricochet + Rout | 400 | 37% | 11% | 2.17 | 10% | 5.7 | 153 | 2.61 | 0.35 | 0.00 | 0.00 | 0.00 | 0.35 | 0.00 | 0.14 |
| Contagion Vector / Contagion Vector | 400 | 36% | 6% | 2.25 | 10% | 5.7 | 158 | 0.00 | 0.99 | 0.00 | 0.00 | 0.00 | 0.00 | 1.81 | 0.72 |
| Contagion Vector / Incendiary Rounds | 400 | 33% | 6% | 2.38 | 15% | 5.8 | 161 | 0.00 | 0.52 | 1.16 | 0.00 | 0.00 | 0.00 | 1.04 | 0.27 |
| Contagion Vector / Spotter’s Eye | 400 | 28% | 5% | 2.47 | 13% | 5.7 | 165 | 0.00 | 0.49 | 0.00 | 1.07 | 0.00 | 0.00 | 1.04 | 0.27 |
| Contagion Vector / Breacher | 400 | 30% | 4% | 2.43 | 14% | 5.7 | 163 | 0.00 | 0.51 | 0.00 | 0.00 | 0.20 | 0.00 | 1.05 | 0.25 |
| Contagion Vector / Rout | 400 | 31% | 6% | 2.39 | 11% | 5.7 | 162 | 0.00 | 0.49 | 0.00 | 0.00 | 0.00 | 0.21 | 0.98 | 0.27 |
| Contagion Vector / Ricochet | 400 | 35% | 9% | 2.23 | 12% | 5.7 | 156 | 2.61 | 0.31 | 0.00 | 0.00 | 0.00 | 0.00 | 0.74 | 0.13 |
| Contagion Vector / Ricochet + Cytotoxic Vector | 400 | 41% | 14% | 2.00 | 11% | 5.8 | 150 | 2.61 | 1.72 | 0.00 | 0.00 | 0.00 | 0.00 | 0.62 | 1.19 |
| Contagion Vector / Ricochet + Contagion Vector | 400 | 47% | 19% | 1.86 | 10% | 5.9 | 145 | 2.61 | 1.43 | 0.00 | 0.00 | 0.00 | 0.00 | 1.99 | 1.23 |
| Contagion Vector / Ricochet + Incendiary Rounds | 400 | 45% | 17% | 1.94 | 8% | 5.9 | 147 | 2.61 | 0.35 | 2.70 | 0.00 | 0.00 | 0.00 | 0.69 | 0.16 |
| Contagion Vector / Ricochet + Spotter’s Eye | 400 | 35% | 9% | 2.23 | 12% | 5.7 | 156 | 2.61 | 0.31 | 0.00 | 2.51 | 0.00 | 0.00 | 0.74 | 0.13 |
| Contagion Vector / Ricochet + Breacher | 400 | 37% | 11% | 2.13 | 11% | 5.7 | 153 | 2.61 | 0.34 | 0.00 | 0.00 | 0.53 | 0.00 | 0.76 | 0.12 |
| Contagion Vector / Ricochet + Rout | 400 | 38% | 11% | 2.10 | 11% | 5.7 | 151 | 2.61 | 0.32 | 0.00 | 0.00 | 0.00 | 0.35 | 0.65 | 0.14 |
| Incendiary Rounds / Incendiary Rounds | 400 | 29% | 4% | 2.52 | 17% | 5.8 | 164 | 0.00 | 0.00 | 1.99 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Spotter’s Eye | 400 | 26% | 4% | 2.58 | 14% | 5.8 | 167 | 0.00 | 0.00 | 0.88 | 1.08 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Breacher | 400 | 27% | 3% | 2.55 | 14% | 5.8 | 166 | 0.00 | 0.00 | 0.88 | 0.00 | 0.21 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Rout | 400 | 28% | 6% | 2.48 | 12% | 5.8 | 164 | 0.00 | 0.00 | 0.88 | 0.00 | 0.00 | 0.21 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet | 400 | 34% | 9% | 2.27 | 11% | 5.7 | 157 | 2.61 | 0.00 | 0.49 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Cytotoxic Vector | 400 | 41% | 14% | 2.02 | 9% | 5.8 | 151 | 2.61 | 1.55 | 0.52 | 0.00 | 0.00 | 0.00 | 0.00 | 1.07 |
| Incendiary Rounds / Ricochet + Contagion Vector | 400 | 48% | 19% | 1.85 | 9% | 5.8 | 145 | 2.61 | 1.21 | 0.57 | 0.00 | 0.00 | 0.00 | 1.86 | 1.09 |
| Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 44% | 16% | 1.96 | 7% | 5.9 | 148 | 2.61 | 0.00 | 3.15 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 34% | 9% | 2.27 | 11% | 5.7 | 157 | 2.61 | 0.00 | 0.49 | 2.51 | 0.00 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Breacher | 400 | 35% | 10% | 2.19 | 11% | 5.7 | 154 | 2.61 | 0.00 | 0.51 | 0.00 | 0.53 | 0.00 | 0.00 | 0.00 |
| Incendiary Rounds / Ricochet + Rout | 400 | 36% | 11% | 2.17 | 11% | 5.7 | 153 | 2.61 | 0.00 | 0.50 | 0.00 | 0.00 | 0.35 | 0.00 | 0.00 |
| Spotter’s Eye / Spotter’s Eye | 400 | 24% | 3% | 2.63 | 13% | 5.7 | 168 | 0.00 | 0.00 | 0.00 | 1.81 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Breacher | 400 | 26% | 3% | 2.59 | 14% | 5.7 | 167 | 0.00 | 0.00 | 0.00 | 0.84 | 0.26 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Rout | 400 | 26% | 5% | 2.51 | 12% | 5.7 | 165 | 0.00 | 0.00 | 0.00 | 0.85 | 0.00 | 0.23 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet | 400 | 34% | 8% | 2.31 | 10% | 5.7 | 158 | 2.61 | 0.00 | 0.00 | 0.49 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Cytotoxic Vector | 400 | 40% | 14% | 2.06 | 9% | 5.8 | 152 | 2.61 | 1.54 | 0.00 | 0.51 | 0.00 | 0.00 | 0.00 | 1.08 |
| Spotter’s Eye / Ricochet + Contagion Vector | 400 | 47% | 19% | 1.89 | 10% | 5.9 | 146 | 2.61 | 1.21 | 0.00 | 0.56 | 0.00 | 0.00 | 1.88 | 1.10 |
| Spotter’s Eye / Ricochet + Incendiary Rounds | 400 | 44% | 16% | 1.99 | 7% | 5.9 | 149 | 2.61 | 0.00 | 2.72 | 0.53 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 34% | 8% | 2.31 | 10% | 5.7 | 158 | 2.61 | 0.00 | 0.00 | 2.91 | 0.00 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Breacher | 400 | 34% | 10% | 2.22 | 11% | 5.8 | 155 | 2.61 | 0.00 | 0.00 | 0.52 | 0.56 | 0.00 | 0.00 | 0.00 |
| Spotter’s Eye / Ricochet + Rout | 400 | 36% | 10% | 2.21 | 9% | 5.7 | 154 | 2.61 | 0.00 | 0.00 | 0.51 | 0.00 | 0.40 | 0.00 | 0.00 |
| Breacher / Breacher | 400 | 25% | 3% | 2.61 | 14% | 5.7 | 167 | 0.00 | 0.00 | 0.00 | 0.00 | 0.32 | 0.00 | 0.00 | 0.00 |
| Breacher / Rout | 400 | 25% | 6% | 2.54 | 12% | 5.7 | 166 | 0.00 | 0.00 | 0.00 | 0.00 | 0.12 | 0.21 | 0.00 | 0.00 |
| Breacher / Ricochet | 400 | 34% | 8% | 2.29 | 10% | 5.7 | 157 | 2.61 | 0.00 | 0.00 | 0.00 | 0.03 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Cytotoxic Vector | 400 | 41% | 14% | 2.03 | 9% | 5.8 | 151 | 2.61 | 1.54 | 0.00 | 0.00 | 0.03 | 0.00 | 0.00 | 1.07 |
| Breacher / Ricochet + Contagion Vector | 400 | 47% | 19% | 1.88 | 10% | 5.9 | 146 | 2.61 | 1.21 | 0.00 | 0.00 | 0.04 | 0.00 | 1.88 | 1.09 |
| Breacher / Ricochet + Incendiary Rounds | 400 | 44% | 16% | 1.98 | 7% | 5.9 | 148 | 2.61 | 0.00 | 2.71 | 0.00 | 0.04 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Spotter’s Eye | 400 | 34% | 9% | 2.29 | 10% | 5.7 | 157 | 2.61 | 0.00 | 0.00 | 2.48 | 0.04 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Breacher | 400 | 34% | 10% | 2.23 | 10% | 5.8 | 155 | 2.61 | 0.00 | 0.00 | 0.00 | 0.56 | 0.00 | 0.00 | 0.00 |
| Breacher / Ricochet + Rout | 400 | 37% | 11% | 2.19 | 9% | 5.7 | 153 | 2.61 | 0.00 | 0.00 | 0.00 | 0.04 | 0.36 | 0.00 | 0.00 |
| Rout / Rout | 400 | 26% | 6% | 2.50 | 11% | 5.7 | 165 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.32 | 0.00 | 0.00 |
| Rout / Ricochet | 400 | 34% | 9% | 2.29 | 11% | 5.7 | 157 | 2.61 | 0.00 | 0.00 | 0.00 | 0.00 | 0.10 | 0.00 | 0.00 |
| Rout / Ricochet + Cytotoxic Vector | 400 | 41% | 14% | 2.02 | 10% | 5.8 | 151 | 2.61 | 1.53 | 0.00 | 0.00 | 0.00 | 0.10 | 0.00 | 1.08 |
| Rout / Ricochet + Contagion Vector | 400 | 47% | 18% | 1.88 | 10% | 5.9 | 146 | 2.61 | 1.20 | 0.00 | 0.00 | 0.00 | 0.09 | 1.85 | 1.10 |
| Rout / Ricochet + Incendiary Rounds | 400 | 44% | 16% | 1.97 | 6% | 5.9 | 148 | 2.61 | 0.00 | 2.71 | 0.00 | 0.00 | 0.09 | 0.00 | 0.00 |
| Rout / Ricochet + Spotter’s Eye | 400 | 34% | 9% | 2.28 | 11% | 5.7 | 157 | 2.61 | 0.00 | 0.00 | 2.51 | 0.00 | 0.12 | 0.00 | 0.00 |
| Rout / Ricochet + Breacher | 400 | 34% | 10% | 2.20 | 11% | 5.8 | 154 | 2.61 | 0.00 | 0.00 | 0.00 | 0.52 | 0.10 | 0.00 | 0.00 |
| Rout / Ricochet + Rout | 400 | 36% | 10% | 2.20 | 10% | 5.7 | 154 | 2.61 | 0.00 | 0.00 | 0.00 | 0.00 | 0.42 | 0.00 | 0.00 |
| Ricochet / Ricochet | 400 | 37% | 14% | 2.12 | 8% | 5.9 | 152 | 4.86 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Cytotoxic Vector | 400 | 46% | 18% | 1.86 | 8% | 5.9 | 144 | 4.96 | 1.38 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.96 |
| Ricochet / Ricochet + Contagion Vector | 400 | 53% | 23% | 1.60 | 6% | 5.8 | 135 | 5.01 | 1.05 | 0.00 | 0.00 | 0.00 | 0.00 | 1.71 | 0.97 |
| Ricochet / Ricochet + Incendiary Rounds | 400 | 50% | 20% | 1.76 | 7% | 5.9 | 140 | 4.96 | 0.00 | 2.37 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Spotter’s Eye | 400 | 37% | 14% | 2.12 | 8% | 5.9 | 152 | 4.86 | 0.00 | 0.00 | 2.28 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Breacher | 400 | 38% | 15% | 2.10 | 9% | 5.9 | 151 | 4.87 | 0.00 | 0.00 | 0.00 | 0.39 | 0.00 | 0.00 | 0.00 |
| Ricochet / Ricochet + Rout | 400 | 39% | 17% | 2.01 | 9% | 5.9 | 147 | 4.86 | 0.00 | 0.00 | 0.00 | 0.00 | 0.37 | 0.00 | 0.00 |
| Ricochet + Cytotoxic Vector / Ricochet + Cytotoxic Vector | 400 | 51% | 21% | 1.70 | 6% | 5.9 | 140 | 4.95 | 2.60 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 1.55 |
| Ricochet + Cytotoxic Vector / Ricochet + Contagion Vector | 400 | 57% | 24% | 1.48 | 4% | 5.8 | 131 | 5.00 | 2.12 | 0.00 | 0.00 | 0.00 | 0.00 | 1.46 | 1.60 |
| Ricochet + Cytotoxic Vector / Ricochet + Incendiary Rounds | 400 | 55% | 22% | 1.61 | 5% | 5.9 | 135 | 4.95 | 1.47 | 2.37 | 0.00 | 0.00 | 0.00 | 0.00 | 0.80 |
| Ricochet + Cytotoxic Vector / Ricochet + Spotter’s Eye | 400 | 44% | 18% | 1.89 | 7% | 5.8 | 146 | 4.84 | 1.43 | 0.00 | 2.26 | 0.00 | 0.00 | 0.00 | 0.75 |
| Ricochet + Cytotoxic Vector / Ricochet + Breacher | 400 | 44% | 19% | 1.86 | 8% | 5.9 | 144 | 4.85 | 1.43 | 0.00 | 0.00 | 0.38 | 0.00 | 0.00 | 0.71 |
| Ricochet + Cytotoxic Vector / Ricochet + Rout | 400 | 45% | 20% | 1.82 | 6% | 5.8 | 142 | 4.84 | 1.44 | 0.00 | 0.00 | 0.00 | 0.38 | 0.00 | 0.77 |
| Ricochet + Contagion Vector / Ricochet + Contagion Vector | 400 | 59% | 26% | 1.42 | 3% | 5.7 | 129 | 4.99 | 1.84 | 0.00 | 0.00 | 0.00 | 0.00 | 2.07 | 1.62 |
| Ricochet + Contagion Vector / Ricochet + Incendiary Rounds | 400 | 60% | 26% | 1.44 | 4% | 5.8 | 130 | 4.95 | 1.20 | 2.35 | 0.00 | 0.00 | 0.00 | 1.50 | 0.81 |
| Ricochet + Contagion Vector / Ricochet + Spotter’s Eye | 400 | 50% | 22% | 1.69 | 5% | 5.7 | 139 | 4.84 | 1.15 | 0.00 | 2.25 | 0.00 | 0.00 | 1.55 | 0.75 |
| Ricochet + Contagion Vector / Ricochet + Breacher | 400 | 51% | 22% | 1.65 | 6% | 5.7 | 137 | 4.85 | 1.15 | 0.00 | 0.00 | 0.38 | 0.00 | 1.55 | 0.72 |
| Ricochet + Contagion Vector / Ricochet + Rout | 400 | 50% | 24% | 1.64 | 4% | 5.7 | 136 | 4.84 | 1.17 | 0.00 | 0.00 | 0.00 | 0.38 | 1.47 | 0.77 |
| Ricochet + Incendiary Rounds / Ricochet + Incendiary Rounds | 400 | 57% | 22% | 1.59 | 5% | 6.0 | 136 | 5.01 | 0.00 | 4.31 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Spotter’s Eye | 400 | 47% | 18% | 1.84 | 7% | 6.0 | 145 | 4.91 | 0.00 | 2.22 | 2.31 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Breacher | 400 | 47% | 19% | 1.83 | 9% | 5.9 | 144 | 4.91 | 0.00 | 2.19 | 0.00 | 0.38 | 0.00 | 0.00 | 0.00 |
| Ricochet + Incendiary Rounds / Ricochet + Rout | 400 | 49% | 20% | 1.77 | 6% | 6.0 | 141 | 4.91 | 0.00 | 2.26 | 0.00 | 0.00 | 0.38 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Spotter’s Eye | 400 | 37% | 14% | 2.12 | 8% | 5.9 | 152 | 4.86 | 0.00 | 0.00 | 4.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Breacher | 400 | 38% | 16% | 2.07 | 9% | 5.9 | 150 | 4.87 | 0.00 | 0.00 | 2.04 | 0.55 | 0.00 | 0.00 | 0.00 |
| Ricochet + Spotter’s Eye / Ricochet + Rout | 400 | 41% | 18% | 1.97 | 8% | 5.8 | 146 | 4.86 | 0.00 | 0.00 | 2.17 | 0.00 | 0.46 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Breacher | 400 | 41% | 17% | 2.02 | 9% | 5.9 | 148 | 4.86 | 0.00 | 0.00 | 0.00 | 0.70 | 0.00 | 0.00 | 0.00 |
| Ricochet + Breacher / Ricochet + Rout | 400 | 41% | 17% | 1.99 | 9% | 5.9 | 146 | 4.86 | 0.00 | 0.00 | 0.00 | 0.33 | 0.37 | 0.00 | 0.00 |
| Ricochet + Rout / Ricochet + Rout | 400 | 40% | 18% | 1.97 | 8% | 5.9 | 145 | 4.86 | 0.00 | 0.00 | 0.00 | 0.00 | 0.58 | 0.00 | 0.00 |
