# Left-behind sensitivity: the van's numbers (2026-11-12-after-0a)

`node scripts/sim-vanlevers.mjs 100 2026-11-12-after-0a`. Real fight code, the two holdExtract jobs at the difficulty each seed's real run had, the game's own starting rosters (fresh and authored), the best team of each roster by the planning read (chosen once at the base numbers and held), the crew's defaults hands-off, 100 seeds. One lever at a time, then combinations. Nothing in `src/` changed: each row sets `FIGHT` keys at run time. The bar declared in the script: a lever is worth a look if it cuts "someone left behind" by 10+ points without raising downs by more than 0.2 or heat by more than 0.3 a fight. Base numbers: van arrives round 3, waits 4, 3 door slots, boarding step -4, hold 2 rounds.

## Steady risk

| Variant | Roster | Job | Someone left behind | People left | Clean win | Job done | Downs | Heat | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | fresh | warehouse | 33% (−0) | 1.13 | 0% | 33% | 1.75 | 0.17 | 0% |
| base | authored | warehouse | 74% (−0) | 1.94 | 3% | 79% | 2.32 | 0.44 | 0% |
| base | fresh | protection | 44% (−0) | 1.21 | 6% | 53% | 1.71 | 0.18 | 0% |
| base | authored | protection | 55% (−0) | 1.14 | 21% | 90% | 1.48 | 0.21 | 0% |
| van arrives round 4 | fresh | warehouse | 13% (−21) | 0.33 | 0% | 13% | 1.27 | 0.08 | 0% |
| van arrives round 4 | authored | warehouse | 38% (−35) | 0.97 | 6% | 50% | 1.53 | 0.18 | 0% |
| van arrives round 4 | fresh | protection | 26% (−18) | 0.62 | 9% | 38% | 1.21 | 0.12 | 0% |
| van arrives round 4 | authored | protection | 38% (−17) | 0.66 | 17% | 69% | 1.14 | 0.07 | 0% |
| van arrives round 5 | fresh | warehouse | 8% (−25) | 0.23 | 0% | 8% | 1.15 | 0.04 | 0% |
| van arrives round 5 | authored | warehouse | 26% (−47) | 0.65 | 6% | 38% | 1.26 | 0.12 | 0% |
| van arrives round 5 | fresh | protection | 15% (−29) | 0.35 | 9% | 26% | 1.03 | 0.06 | 0% |
| van arrives round 5 | authored | protection | 21% (−34) | 0.24 | 14% | 48% | 0.86 | 0.03 | 0% |
| van waits 5 | fresh | warehouse | 33% (−0) | 1.13 | 0% | 33% | 1.83 | 0.06 | 0% |
| van waits 5 | authored | warehouse | 71% (−3) | 1.91 | 6% | 79% | 2.41 | 0.29 | 0% |
| van waits 5 | fresh | protection | 44% (−0) | 1.21 | 6% | 53% | 1.71 | 0.15 | 0% |
| van waits 5 | authored | protection | 55% (−0) | 1.14 | 21% | 90% | 1.48 | 0.07 | 0% |
| van waits 6 | fresh | warehouse | 33% (−0) | 1.13 | 0% | 33% | 1.85 | 0.06 | 0% |
| van waits 6 | authored | warehouse | 68% (−6) | 2.00 | 9% | 79% | 2.44 | 0.21 | 0% |
| van waits 6 | fresh | protection | 44% (−0) | 1.21 | 6% | 53% | 1.71 | 0.12 | 0% |
| van waits 6 | authored | protection | 55% (−0) | 1.14 | 21% | 90% | 1.48 | 0.03 | 0% |
| van waits 8 | fresh | warehouse | 31% (−2) | 1.13 | 2% | 33% | 1.90 | 0.04 | 0% |
| van waits 8 | authored | warehouse | 62% (−12) | 1.91 | 15% | 79% | 2.62 | 0.15 | 0% |
| van waits 8 | fresh | protection | 41% (−3) | 1.18 | 9% | 53% | 1.71 | 0.00 | 0% |
| van waits 8 | authored | protection | 52% (−3) | 1.10 | 24% | 90% | 1.48 | 0.00 | 0% |
| 4 door slots | fresh | warehouse | 33% (−0) | 1.08 | 0% | 33% | 1.77 | 0.17 | 0% |
| 4 door slots | authored | warehouse | 68% (−6) | 1.82 | 9% | 79% | 2.29 | 0.47 | 0% |
| 4 door slots | fresh | protection | 44% (−0) | 1.21 | 6% | 53% | 1.71 | 0.18 | 0% |
| 4 door slots | authored | protection | 55% (−0) | 1.14 | 21% | 90% | 1.48 | 0.21 | 0% |
| 5 door slots | fresh | warehouse | 33% (−0) | 1.08 | 0% | 33% | 1.77 | 0.17 | 0% |
| 5 door slots | authored | warehouse | 68% (−6) | 1.82 | 9% | 79% | 2.29 | 0.47 | 0% |
| 5 door slots | fresh | protection | 44% (−0) | 1.21 | 6% | 53% | 1.71 | 0.18 | 0% |
| 5 door slots | authored | protection | 55% (−0) | 1.14 | 21% | 90% | 1.48 | 0.21 | 0% |
| boarding step -2 (easier) | fresh | warehouse | 33% (−0) | 1.19 | 0% | 33% | 1.77 | 0.19 | 0% |
| boarding step -2 (easier) | authored | warehouse | 74% (−0) | 2.18 | 6% | 79% | 2.35 | 0.41 | 0% |
| boarding step -2 (easier) | fresh | protection | 47% (+3) | 1.26 | 3% | 53% | 1.71 | 0.18 | 0% |
| boarding step -2 (easier) | authored | protection | 59% (+3) | 1.24 | 21% | 90% | 1.62 | 0.28 | 0% |
| boarding step 0 (easier) | fresh | warehouse | 33% (−0) | 1.23 | 0% | 33% | 1.79 | 0.17 | 0% |
| boarding step 0 (easier) | authored | warehouse | 76% (+3) | 2.21 | 3% | 79% | 2.35 | 0.38 | 0% |
| boarding step 0 (easier) | fresh | protection | 47% (+3) | 1.29 | 3% | 53% | 1.68 | 0.18 | 0% |
| boarding step 0 (easier) | authored | protection | 72% (+17) | 1.48 | 10% | 90% | 1.69 | 0.28 | 0% |
| hold the van 3 rounds | fresh | warehouse | 33% (−0) | 1.08 | 0% | 33% | 1.77 | 0.17 | 0% |
| hold the van 3 rounds | authored | warehouse | 74% (−0) | 1.97 | 3% | 79% | 2.41 | 0.44 | 0% |
| hold the van 3 rounds | fresh | protection | 44% (−0) | 1.21 | 6% | 53% | 1.71 | 0.18 | 0% |
| hold the van 3 rounds | authored | protection | 55% (−0) | 1.14 | 21% | 90% | 1.48 | 0.21 | 0% |
| waits 6 + 4 door slots | fresh | warehouse | 31% (−2) | 1.13 | 2% | 33% | 1.90 | 0.08 | 0% |
| waits 6 + 4 door slots | authored | warehouse | 65% (−9) | 1.91 | 12% | 79% | 2.38 | 0.18 | 0% |
| waits 6 + 4 door slots | fresh | protection | 44% (−0) | 1.21 | 6% | 53% | 1.71 | 0.12 | 0% |
| waits 6 + 4 door slots | authored | protection | 55% (−0) | 1.14 | 21% | 90% | 1.48 | 0.03 | 0% |
| waits 6 + 4 slots + boarding -2 | fresh | warehouse | 33% (−0) | 1.23 | 0% | 33% | 1.88 | 0.06 | 0% |
| waits 6 + 4 slots + boarding -2 | authored | warehouse | 74% (−0) | 2.21 | 6% | 79% | 2.53 | 0.24 | 0% |
| waits 6 + 4 slots + boarding -2 | fresh | protection | 44% (−0) | 1.24 | 6% | 53% | 1.71 | 0.12 | 0% |
| waits 6 + 4 slots + boarding -2 | authored | protection | 55% (−0) | 1.21 | 24% | 90% | 1.62 | 0.07 | 0% |

## Committed risk

| Variant | Roster | Job | Someone left behind | People left | Clean win | Job done | Downs | Heat | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | fresh | warehouse | 96% (−0) | 3.13 | 4% | 100% | 3.40 | 0.00 | 48% |
| base | authored | warehouse | 79% (−0) | 2.12 | 18% | 100% | 2.53 | 0.00 | 35% |
| base | fresh | protection | 85% (−0) | 2.26 | 12% | 100% | 2.47 | 0.00 | 35% |
| base | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.59 | 0.00 | 21% |
| van arrives round 4 | fresh | warehouse | 100% (+4) | 3.29 | 0% | 100% | 3.50 | 0.00 | 48% |
| van arrives round 4 | authored | warehouse | 88% (+9) | 2.32 | 9% | 100% | 2.91 | 0.00 | 32% |
| van arrives round 4 | fresh | protection | 94% (+9) | 2.38 | 6% | 100% | 2.50 | 0.00 | 35% |
| van arrives round 4 | authored | protection | 69% (−14) | 1.66 | 31% | 100% | 2.24 | 0.00 | 17% |
| van arrives round 5 | fresh | warehouse | 92% (−4) | 3.08 | 0% | 92% | 3.52 | 0.00 | 46% |
| van arrives round 5 | authored | warehouse | 76% (−3) | 2.21 | 21% | 100% | 2.76 | 0.00 | 26% |
| van arrives round 5 | fresh | protection | 65% (−21) | 1.47 | 6% | 71% | 2.44 | 0.00 | 26% |
| van arrives round 5 | authored | protection | 66% (−17) | 1.66 | 31% | 97% | 2.28 | 0.00 | 28% |
| van waits 5 | fresh | warehouse | 96% (−0) | 3.13 | 4% | 100% | 3.46 | 0.00 | 44% |
| van waits 5 | authored | warehouse | 79% (−0) | 2.29 | 18% | 100% | 2.82 | 0.00 | 32% |
| van waits 5 | fresh | protection | 82% (−3) | 2.15 | 15% | 100% | 2.50 | 0.00 | 35% |
| van waits 5 | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.62 | 0.00 | 21% |
| van waits 6 | fresh | warehouse | 94% (−2) | 3.08 | 6% | 100% | 3.54 | 0.00 | 44% |
| van waits 6 | authored | warehouse | 74% (−6) | 2.29 | 24% | 100% | 2.97 | 0.00 | 29% |
| van waits 6 | fresh | protection | 82% (−3) | 2.18 | 15% | 100% | 2.56 | 0.00 | 35% |
| van waits 6 | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.62 | 0.00 | 21% |
| van waits 8 | fresh | warehouse | 94% (−2) | 3.10 | 6% | 100% | 3.60 | 0.00 | 46% |
| van waits 8 | authored | warehouse | 71% (−9) | 2.18 | 26% | 100% | 3.09 | 0.00 | 35% |
| van waits 8 | fresh | protection | 82% (−3) | 2.18 | 15% | 100% | 2.56 | 0.00 | 35% |
| van waits 8 | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.62 | 0.00 | 21% |
| 4 door slots | fresh | warehouse | 94% (−2) | 3.10 | 6% | 100% | 3.42 | 0.00 | 48% |
| 4 door slots | authored | warehouse | 85% (+6) | 2.26 | 12% | 100% | 2.65 | 0.00 | 38% |
| 4 door slots | fresh | protection | 85% (−0) | 2.26 | 12% | 100% | 2.47 | 0.00 | 35% |
| 4 door slots | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.59 | 0.00 | 21% |
| 5 door slots | fresh | warehouse | 94% (−2) | 3.10 | 6% | 100% | 3.42 | 0.00 | 48% |
| 5 door slots | authored | warehouse | 85% (+6) | 2.26 | 12% | 100% | 2.65 | 0.00 | 38% |
| 5 door slots | fresh | protection | 85% (−0) | 2.26 | 12% | 100% | 2.47 | 0.00 | 35% |
| 5 door slots | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.59 | 0.00 | 21% |
| boarding step -2 (easier) | fresh | warehouse | 100% (+4) | 3.33 | 0% | 100% | 3.42 | 0.00 | 48% |
| boarding step -2 (easier) | authored | warehouse | 97% (+18) | 2.59 | 3% | 100% | 2.79 | 0.00 | 38% |
| boarding step -2 (easier) | fresh | protection | 94% (+9) | 2.41 | 3% | 100% | 2.47 | 0.00 | 38% |
| boarding step -2 (easier) | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.62 | 0.00 | 21% |
| boarding step 0 (easier) | fresh | warehouse | 100% (+4) | 3.56 | 0% | 100% | 3.50 | 0.00 | 48% |
| boarding step 0 (easier) | authored | warehouse | 97% (+18) | 2.71 | 3% | 100% | 2.79 | 0.00 | 35% |
| boarding step 0 (easier) | fresh | protection | 100% (+15) | 2.62 | 0% | 100% | 2.53 | 0.00 | 38% |
| boarding step 0 (easier) | authored | protection | 93% (+10) | 2.45 | 7% | 100% | 2.59 | 0.00 | 21% |
| hold the van 3 rounds | fresh | warehouse | 96% (−0) | 3.13 | 4% | 100% | 3.40 | 0.00 | 48% |
| hold the van 3 rounds | authored | warehouse | 79% (−0) | 2.12 | 18% | 100% | 2.53 | 0.00 | 35% |
| hold the van 3 rounds | fresh | protection | 85% (−0) | 2.26 | 12% | 100% | 2.47 | 0.00 | 35% |
| hold the van 3 rounds | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.59 | 0.00 | 21% |
| waits 6 + 4 door slots | fresh | warehouse | 94% (−2) | 3.08 | 6% | 100% | 3.56 | 0.00 | 44% |
| waits 6 + 4 door slots | authored | warehouse | 79% (−0) | 2.50 | 18% | 100% | 3.15 | 0.00 | 32% |
| waits 6 + 4 door slots | fresh | protection | 82% (−3) | 2.18 | 15% | 100% | 2.56 | 0.00 | 35% |
| waits 6 + 4 door slots | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.62 | 0.00 | 21% |
| waits 6 + 4 slots + boarding -2 | fresh | warehouse | 100% (+4) | 3.35 | 0% | 100% | 3.60 | 0.00 | 48% |
| waits 6 + 4 slots + boarding -2 | authored | warehouse | 91% (+12) | 2.65 | 9% | 100% | 3.35 | 0.00 | 29% |
| waits 6 + 4 slots + boarding -2 | fresh | protection | 94% (+9) | 2.41 | 3% | 100% | 2.62 | 0.00 | 38% |
| waits 6 + 4 slots + boarding -2 | authored | protection | 83% (−0) | 2.28 | 17% | 100% | 2.66 | 0.00 | 21% |

## Mean over both jobs and both rosters (steady)

| Variant | Someone left behind | vs base | Clean win | Downs | vs base | Heat | vs base | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | 52% | +0 | 7% | 1.82 | +0.00 | 0.25 | +0.00 | 4.61 |
| van arrives round 4 | 29% | −23 | 8% | 1.29 | -0.53 | 0.11 | -0.14 | 4.12 |
| van arrives round 5 | 18% | −34 | 7% | 1.08 | -0.74 | 0.06 | -0.18 | 4.06 |
| van waits 5 | 51% | −1 | 8% | 1.86 | +0.04 | 0.14 | -0.10 | 4.73 |
| van waits 6 | 50% | −1 | 9% | 1.87 | +0.06 | 0.11 | -0.14 | 4.81 |
| van waits 8 | 46% | −5 | 12% | 1.93 | +0.11 | 0.05 | -0.20 | 4.94 |
| 4 door slots | 50% | −1 | 9% | 1.81 | -0.00 | 0.26 | +0.01 | 4.61 |
| 5 door slots | 50% | −1 | 9% | 1.81 | -0.00 | 0.26 | +0.01 | 4.61 |
| boarding step -2 (easier) | 53% | +2 | 7% | 1.86 | +0.05 | 0.26 | +0.02 | 4.71 |
| boarding step 0 (easier) | 57% | +6 | 4% | 1.88 | +0.06 | 0.25 | +0.00 | 4.75 |
| hold the van 3 rounds | 52% | +0 | 7% | 1.84 | +0.03 | 0.25 | +0.00 | 4.66 |
| waits 6 + 4 door slots | 49% | −3 | 10% | 1.87 | +0.05 | 0.10 | -0.14 | 4.77 |
| waits 6 + 4 slots + boarding -2 | 52% | +0 | 9% | 1.93 | +0.12 | 0.12 | -0.13 | 4.94 |

**Worth a look by the declared bar (steady, mean):** van arrives round 4; van arrives round 5.

Limits: the team is the planning read's pick from the starting roster, not a player's; only runs that reach a fight are included; heat counts the early van and holds only; a runner left behind is still just missing (slice 4 is not built), so a variant that leaves fewer behind is not yet scored on what leaving someone costs.
