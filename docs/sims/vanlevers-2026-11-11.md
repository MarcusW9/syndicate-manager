# Left-behind sensitivity: the van's numbers (2026-11-11)

`node scripts/sim-vanlevers.mjs 400 2026-11-11`. Real fight code, the two holdExtract jobs at the difficulty each seed's real run had, the game's own starting rosters (fresh and authored), the best team of each roster by the planning read (chosen once at the base numbers and held), the crew's defaults hands-off, 400 seeds. One lever at a time, then combinations. Nothing in `src/` changed: each row sets `FIGHT` keys at run time. The bar declared in the script: a lever is worth a look if it cuts "someone left behind" by 10+ points without raising downs by more than 0.2 or heat by more than 0.3 a fight. Base numbers: van arrives round 3, waits 4, 3 door slots, boarding step -4, hold 2 rounds.

## Steady risk

| Variant | Roster | Job | Someone left behind | People left | Clean win | Job done | Downs | Heat | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | fresh | warehouse | 39% (−0) | 0.97 | 2% | 41% | 1.57 | 0.09 | 0% |
| base | authored | warehouse | 78% (−0) | 2.04 | 9% | 92% | 2.27 | 0.53 | 0% |
| base | fresh | protection | 46% (−0) | 0.89 | 3% | 55% | 1.39 | 0.08 | 0% |
| base | authored | protection | 62% (−0) | 1.30 | 26% | 96% | 1.55 | 0.41 | 0% |
| van arrives round 4 | fresh | warehouse | 17% (−21) | 0.31 | 1% | 19% | 1.12 | 0.02 | 0% |
| van arrives round 4 | authored | warehouse | 64% (−14) | 1.42 | 7% | 80% | 1.66 | 0.26 | 0% |
| van arrives round 4 | fresh | protection | 18% (−28) | 0.27 | 2% | 26% | 0.99 | 0.03 | 0% |
| van arrives round 4 | authored | protection | 50% (−13) | 0.93 | 24% | 89% | 1.20 | 0.24 | 0% |
| van arrives round 5 | fresh | warehouse | 7% (−32) | 0.10 | 1% | 8% | 1.01 | 0.01 | 0% |
| van arrives round 5 | authored | warehouse | 48% (−31) | 0.90 | 8% | 64% | 1.25 | 0.13 | 0% |
| van arrives round 5 | fresh | protection | 11% (−35) | 0.14 | 3% | 17% | 0.94 | 0.01 | 0% |
| van arrives round 5 | authored | protection | 44% (−18) | 0.75 | 17% | 71% | 1.04 | 0.14 | 0% |
| van waits 5 | fresh | warehouse | 39% (−0) | 0.97 | 2% | 41% | 1.58 | 0.06 | 0% |
| van waits 5 | authored | warehouse | 76% (−3) | 2.13 | 10% | 92% | 2.46 | 0.42 | 0% |
| van waits 5 | fresh | protection | 45% (−1) | 0.91 | 4% | 55% | 1.42 | 0.05 | 0% |
| van waits 5 | authored | protection | 58% (−5) | 1.32 | 31% | 96% | 1.62 | 0.31 | 0% |
| van waits 6 | fresh | warehouse | 39% (−0) | 0.98 | 2% | 41% | 1.58 | 0.02 | 0% |
| van waits 6 | authored | warehouse | 73% (−5) | 2.17 | 13% | 92% | 2.53 | 0.32 | 0% |
| van waits 6 | fresh | protection | 45% (−1) | 0.91 | 4% | 55% | 1.42 | 0.04 | 0% |
| van waits 6 | authored | protection | 58% (−5) | 1.33 | 31% | 96% | 1.68 | 0.17 | 0% |
| van waits 8 | fresh | warehouse | 38% (−1) | 0.97 | 3% | 41% | 1.59 | 0.02 | 0% |
| van waits 8 | authored | warehouse | 69% (−10) | 2.10 | 18% | 92% | 2.58 | 0.11 | 0% |
| van waits 8 | fresh | protection | 45% (−1) | 0.91 | 4% | 55% | 1.42 | 0.00 | 0% |
| van waits 8 | authored | protection | 57% (−5) | 1.35 | 32% | 96% | 1.72 | 0.06 | 0% |
| 4 door slots | fresh | warehouse | 39% (+1) | 0.96 | 2% | 41% | 1.57 | 0.09 | 0% |
| 4 door slots | authored | warehouse | 80% (+1) | 2.06 | 8% | 92% | 2.29 | 0.54 | 0% |
| 4 door slots | fresh | protection | 46% (−0) | 0.89 | 3% | 55% | 1.39 | 0.08 | 0% |
| 4 door slots | authored | protection | 62% (−0) | 1.30 | 26% | 96% | 1.55 | 0.41 | 0% |
| 5 door slots | fresh | warehouse | 39% (+1) | 0.96 | 2% | 41% | 1.57 | 0.09 | 0% |
| 5 door slots | authored | warehouse | 80% (+1) | 2.06 | 8% | 92% | 2.29 | 0.54 | 0% |
| 5 door slots | fresh | protection | 46% (−0) | 0.89 | 3% | 55% | 1.39 | 0.08 | 0% |
| 5 door slots | authored | protection | 62% (−0) | 1.30 | 26% | 96% | 1.55 | 0.41 | 0% |
| boarding step -2 (easier) | fresh | warehouse | 40% (+2) | 1.05 | 1% | 41% | 1.58 | 0.10 | 0% |
| boarding step -2 (easier) | authored | warehouse | 84% (+5) | 2.17 | 6% | 92% | 2.24 | 0.50 | 0% |
| boarding step -2 (easier) | fresh | protection | 47% (+1) | 0.97 | 2% | 55% | 1.38 | 0.08 | 0% |
| boarding step -2 (easier) | authored | protection | 71% (+9) | 1.47 | 18% | 96% | 1.59 | 0.43 | 0% |
| boarding step 0 (easier) | fresh | warehouse | 41% (+2) | 1.09 | 0% | 41% | 1.55 | 0.08 | 0% |
| boarding step 0 (easier) | authored | warehouse | 88% (+10) | 2.39 | 2% | 92% | 2.23 | 0.49 | 0% |
| boarding step 0 (easier) | fresh | protection | 48% (+2) | 0.99 | 2% | 55% | 1.38 | 0.09 | 0% |
| boarding step 0 (easier) | authored | protection | 80% (+17) | 1.62 | 12% | 96% | 1.64 | 0.44 | 0% |
| hold the van 3 rounds | fresh | warehouse | 39% (−0) | 0.97 | 2% | 41% | 1.58 | 0.09 | 0% |
| hold the van 3 rounds | authored | warehouse | 78% (−0) | 2.10 | 9% | 92% | 2.35 | 0.53 | 0% |
| hold the van 3 rounds | fresh | protection | 46% (−0) | 0.89 | 3% | 55% | 1.39 | 0.08 | 0% |
| hold the van 3 rounds | authored | protection | 62% (−1) | 1.31 | 27% | 96% | 1.56 | 0.41 | 0% |
| waits 6 + 4 door slots | fresh | warehouse | 39% (−0) | 0.97 | 2% | 41% | 1.59 | 0.03 | 0% |
| waits 6 + 4 door slots | authored | warehouse | 73% (−6) | 2.16 | 14% | 92% | 2.55 | 0.32 | 0% |
| waits 6 + 4 door slots | fresh | protection | 45% (−1) | 0.91 | 4% | 55% | 1.42 | 0.04 | 0% |
| waits 6 + 4 door slots | authored | protection | 58% (−5) | 1.33 | 31% | 96% | 1.68 | 0.17 | 0% |
| waits 6 + 4 slots + boarding -2 | fresh | warehouse | 40% (+2) | 1.03 | 1% | 41% | 1.61 | 0.03 | 0% |
| waits 6 + 4 slots + boarding -2 | authored | warehouse | 80% (+1) | 2.33 | 9% | 92% | 2.59 | 0.30 | 0% |
| waits 6 + 4 slots + boarding -2 | fresh | protection | 47% (+1) | 0.97 | 2% | 55% | 1.40 | 0.04 | 0% |
| waits 6 + 4 slots + boarding -2 | authored | protection | 65% (+2) | 1.46 | 25% | 96% | 1.76 | 0.23 | 0% |

## Committed risk

| Variant | Roster | Job | Someone left behind | People left | Clean win | Job done | Downs | Heat | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | fresh | warehouse | 99% (−0) | 3.24 | 1% | 100% | 3.53 | 0.00 | 49% |
| base | authored | warehouse | 90% (−0) | 2.22 | 10% | 100% | 2.14 | 0.00 | 22% |
| base | fresh | protection | 91% (−0) | 2.37 | 9% | 100% | 2.65 | 0.00 | 37% |
| base | authored | protection | 72% (−0) | 1.55 | 25% | 100% | 1.59 | 0.00 | 15% |
| van arrives round 4 | fresh | warehouse | 99% (+1) | 3.36 | 1% | 100% | 3.59 | 0.00 | 49% |
| van arrives round 4 | authored | warehouse | 85% (−5) | 2.16 | 15% | 100% | 2.35 | 0.00 | 28% |
| van arrives round 4 | fresh | protection | 92% (+1) | 2.38 | 5% | 97% | 2.69 | 0.00 | 37% |
| van arrives round 4 | authored | protection | 75% (+3) | 1.62 | 23% | 100% | 1.62 | 0.00 | 20% |
| van arrives round 5 | fresh | warehouse | 93% (−6) | 3.11 | 1% | 93% | 3.58 | 0.00 | 50% |
| van arrives round 5 | authored | warehouse | 85% (−5) | 2.18 | 14% | 100% | 2.37 | 0.00 | 33% |
| van arrives round 5 | fresh | protection | 69% (−22) | 1.76 | 6% | 77% | 2.65 | 0.00 | 34% |
| van arrives round 5 | authored | protection | 67% (−5) | 1.44 | 31% | 98% | 1.62 | 0.00 | 25% |
| van waits 5 | fresh | warehouse | 98% (−1) | 3.28 | 2% | 100% | 3.66 | 0.00 | 50% |
| van waits 5 | authored | warehouse | 88% (−3) | 2.39 | 12% | 100% | 2.55 | 0.00 | 29% |
| van waits 5 | fresh | protection | 91% (−1) | 2.36 | 9% | 100% | 2.70 | 0.00 | 37% |
| van waits 5 | authored | protection | 69% (−3) | 1.61 | 28% | 100% | 1.80 | 0.00 | 17% |
| van waits 6 | fresh | warehouse | 97% (−2) | 3.31 | 3% | 100% | 3.75 | 0.00 | 51% |
| van waits 6 | authored | warehouse | 83% (−7) | 2.44 | 17% | 100% | 2.86 | 0.00 | 33% |
| van waits 6 | fresh | protection | 88% (−3) | 2.34 | 11% | 100% | 2.73 | 0.00 | 37% |
| van waits 6 | authored | protection | 64% (−8) | 1.62 | 32% | 100% | 1.90 | 0.00 | 19% |
| van waits 8 | fresh | warehouse | 97% (−2) | 3.32 | 3% | 100% | 3.82 | 0.00 | 53% |
| van waits 8 | authored | warehouse | 76% (−14) | 2.37 | 24% | 100% | 3.08 | 0.00 | 34% |
| van waits 8 | fresh | protection | 88% (−3) | 2.34 | 11% | 100% | 2.73 | 0.00 | 37% |
| van waits 8 | authored | protection | 60% (−12) | 1.54 | 36% | 100% | 1.98 | 0.00 | 20% |
| 4 door slots | fresh | warehouse | 99% (−0) | 3.25 | 1% | 100% | 3.54 | 0.00 | 49% |
| 4 door slots | authored | warehouse | 90% (−0) | 2.22 | 10% | 100% | 2.17 | 0.00 | 24% |
| 4 door slots | fresh | protection | 91% (−0) | 2.37 | 9% | 100% | 2.65 | 0.00 | 37% |
| 4 door slots | authored | protection | 72% (−0) | 1.55 | 25% | 100% | 1.59 | 0.00 | 15% |
| 5 door slots | fresh | warehouse | 99% (−0) | 3.25 | 1% | 100% | 3.54 | 0.00 | 49% |
| 5 door slots | authored | warehouse | 90% (−0) | 2.22 | 10% | 100% | 2.17 | 0.00 | 24% |
| 5 door slots | fresh | protection | 91% (−0) | 2.37 | 9% | 100% | 2.65 | 0.00 | 37% |
| 5 door slots | authored | protection | 72% (−0) | 1.55 | 25% | 100% | 1.59 | 0.00 | 15% |
| boarding step -2 (easier) | fresh | warehouse | 99% (+1) | 3.41 | 1% | 100% | 3.56 | 0.00 | 48% |
| boarding step -2 (easier) | authored | warehouse | 96% (+6) | 2.46 | 4% | 100% | 2.18 | 0.00 | 22% |
| boarding step -2 (easier) | fresh | protection | 95% (+4) | 2.47 | 5% | 100% | 2.65 | 0.00 | 40% |
| boarding step -2 (easier) | authored | protection | 79% (+7) | 1.63 | 19% | 100% | 1.63 | 0.00 | 16% |
| boarding step 0 (easier) | fresh | warehouse | 100% (+1) | 3.62 | 0% | 100% | 3.57 | 0.00 | 49% |
| boarding step 0 (easier) | authored | warehouse | 99% (+9) | 2.52 | 1% | 100% | 2.12 | 0.00 | 23% |
| boarding step 0 (easier) | fresh | protection | 99% (+7) | 2.63 | 1% | 100% | 2.65 | 0.00 | 41% |
| boarding step 0 (easier) | authored | protection | 89% (+17) | 1.81 | 10% | 100% | 1.63 | 0.00 | 17% |
| hold the van 3 rounds | fresh | warehouse | 99% (−0) | 3.24 | 1% | 100% | 3.53 | 0.00 | 49% |
| hold the van 3 rounds | authored | warehouse | 90% (−0) | 2.22 | 10% | 100% | 2.14 | 0.00 | 22% |
| hold the van 3 rounds | fresh | protection | 91% (−0) | 2.37 | 9% | 100% | 2.65 | 0.00 | 37% |
| hold the van 3 rounds | authored | protection | 72% (−0) | 1.55 | 25% | 100% | 1.59 | 0.00 | 15% |
| waits 6 + 4 door slots | fresh | warehouse | 97% (−2) | 3.32 | 3% | 100% | 3.75 | 0.00 | 50% |
| waits 6 + 4 door slots | authored | warehouse | 83% (−7) | 2.49 | 17% | 100% | 2.91 | 0.00 | 34% |
| waits 6 + 4 door slots | fresh | protection | 88% (−3) | 2.34 | 11% | 100% | 2.73 | 0.00 | 37% |
| waits 6 + 4 door slots | authored | protection | 64% (−8) | 1.62 | 32% | 100% | 1.90 | 0.00 | 19% |
| waits 6 + 4 slots + boarding -2 | fresh | warehouse | 99% (+1) | 3.47 | 1% | 100% | 3.76 | 0.00 | 51% |
| waits 6 + 4 slots + boarding -2 | authored | warehouse | 92% (+1) | 2.69 | 8% | 100% | 2.97 | 0.00 | 35% |
| waits 6 + 4 slots + boarding -2 | fresh | protection | 94% (+2) | 2.47 | 6% | 100% | 2.76 | 0.00 | 37% |
| waits 6 + 4 slots + boarding -2 | authored | protection | 72% (−0) | 1.72 | 24% | 100% | 1.95 | 0.00 | 22% |

## Mean over both jobs and both rosters (steady)

| Variant | Someone left behind | vs base | Clean win | Downs | vs base | Heat | vs base | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | 56% | +0 | 10% | 1.69 | +0.00 | 0.28 | +0.00 | 4.93 |
| van arrives round 4 | 37% | −19 | 8% | 1.24 | -0.45 | 0.14 | -0.14 | 4.69 |
| van arrives round 5 | 27% | −29 | 7% | 1.06 | -0.63 | 0.07 | -0.21 | 4.59 |
| van waits 5 | 54% | −2 | 12% | 1.77 | +0.07 | 0.21 | -0.07 | 5.09 |
| van waits 6 | 54% | −3 | 13% | 1.80 | +0.11 | 0.14 | -0.14 | 5.18 |
| van waits 8 | 52% | −4 | 14% | 1.83 | +0.13 | 0.05 | -0.23 | 5.26 |
| 4 door slots | 57% | +0 | 10% | 1.70 | +0.00 | 0.28 | +0.00 | 4.93 |
| 5 door slots | 57% | +0 | 10% | 1.70 | +0.00 | 0.28 | +0.00 | 4.93 |
| boarding step -2 (easier) | 61% | +4 | 7% | 1.70 | +0.01 | 0.28 | -0.00 | 4.99 |
| boarding step 0 (easier) | 64% | +8 | 4% | 1.70 | +0.01 | 0.28 | -0.00 | 5.04 |
| hold the van 3 rounds | 56% | −0 | 10% | 1.72 | +0.03 | 0.28 | +0.00 | 4.97 |
| waits 6 + 4 door slots | 53% | −3 | 13% | 1.81 | +0.11 | 0.14 | -0.14 | 5.19 |
| waits 6 + 4 slots + boarding -2 | 58% | +1 | 9% | 1.84 | +0.15 | 0.15 | -0.13 | 5.36 |

**Worth a look by the declared bar (steady, mean):** van arrives round 4; van arrives round 5.

Limits: the team is the planning read's pick from the starting roster, not a player's; only runs that reach a fight are included; heat counts the early van and holds only; a runner left behind is still just missing (slice 4 is not built), so a variant that leaves fewer behind is not yet scored on what leaving someone costs.
