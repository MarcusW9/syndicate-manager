# Left-behind sensitivity: the van's numbers (2026-11-15-before-newjobs)

`node scripts/sim-vanlevers.mjs 100 2026-11-15-before-newjobs`. Real fight code, the two holdExtract jobs at the difficulty each seed's real run had, the game's own starting rosters (fresh and authored), the best team of each roster by the planning read (chosen once at the base numbers and held), the crew's defaults hands-off, 100 seeds. One lever at a time, then combinations. Nothing in `src/` changed: each row sets `FIGHT` keys at run time. The bar declared in the script: a lever is worth a look if it cuts "someone left behind" by 10+ points without raising downs by more than 0.2 or heat by more than 0.3 a fight. Base numbers: van arrives round 3, waits 4, 3 door slots, boarding step undefined, hold 2 rounds.

## Steady risk

| Variant | Roster | Job | Someone left behind | People left | Clean win | Job done | Downs | Heat | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| base | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| base | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| base | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| van arrives round 4 | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| van arrives round 4 | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| van arrives round 4 | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| van arrives round 4 | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| van arrives round 5 | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| van arrives round 5 | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| van arrives round 5 | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| van arrives round 5 | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| van waits 5 | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| van waits 5 | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| van waits 5 | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| van waits 5 | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| van waits 6 | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| van waits 6 | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| van waits 6 | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| van waits 6 | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| van waits 8 | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| van waits 8 | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| van waits 8 | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| van waits 8 | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| 4 door slots | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| 4 door slots | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| 4 door slots | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| 4 door slots | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| 5 door slots | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| 5 door slots | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| 5 door slots | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| 5 door slots | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| hold the van 3 rounds | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| hold the van 3 rounds | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| hold the van 3 rounds | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| hold the van 3 rounds | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |
| waits 6 + 4 door slots | fresh | warehouse | 0% (−0) | 0.00 | 23% | 23% | 0.77 | 0.00 | 0% |
| waits 6 + 4 door slots | authored | warehouse | 0% (−0) | 0.00 | 65% | 65% | 0.38 | 0.00 | 0% |
| waits 6 + 4 door slots | fresh | protection | 0% (−0) | 0.00 | 38% | 38% | 0.62 | 0.00 | 0% |
| waits 6 + 4 door slots | authored | protection | 0% (−0) | 0.00 | 72% | 72% | 0.28 | 0.00 | 0% |

## Committed risk

| Variant | Roster | Job | Someone left behind | People left | Clean win | Job done | Downs | Heat | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| base | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| base | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| base | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| van arrives round 4 | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| van arrives round 4 | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| van arrives round 4 | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| van arrives round 4 | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| van arrives round 5 | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| van arrives round 5 | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| van arrives round 5 | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| van arrives round 5 | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| van waits 5 | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| van waits 5 | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| van waits 5 | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| van waits 5 | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| van waits 6 | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| van waits 6 | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| van waits 6 | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| van waits 6 | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| van waits 8 | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| van waits 8 | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| van waits 8 | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| van waits 8 | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| 4 door slots | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| 4 door slots | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| 4 door slots | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| 4 door slots | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| 5 door slots | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| 5 door slots | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| 5 door slots | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| 5 door slots | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| hold the van 3 rounds | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| hold the van 3 rounds | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| hold the van 3 rounds | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| hold the van 3 rounds | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |
| waits 6 + 4 door slots | fresh | warehouse | 0% (−0) | 0.00 | 52% | 52% | 2.04 | 0.00 | 19% |
| waits 6 + 4 door slots | authored | warehouse | 0% (−0) | 0.00 | 79% | 79% | 0.97 | 0.00 | 6% |
| waits 6 + 4 door slots | fresh | protection | 0% (−0) | 0.00 | 56% | 56% | 1.59 | 0.00 | 15% |
| waits 6 + 4 door slots | authored | protection | 0% (−0) | 0.00 | 79% | 79% | 0.90 | 0.00 | 0% |

## Mean over both jobs and both rosters (steady)

| Variant | Someone left behind | vs base | Clean win | Downs | vs base | Heat | vs base | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| van arrives round 4 | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| van arrives round 5 | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| van waits 5 | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| van waits 6 | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| van waits 8 | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| 4 door slots | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| 5 door slots | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| hold the van 3 rounds | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |
| waits 6 + 4 door slots | 0% | +0 | 50% | 0.51 | +0.00 | 0.00 | +0.00 | 4.81 |

**Worth a look by the declared bar (steady, mean):** none.

Limits: the team is the planning read's pick from the starting roster, not a player's; only runs that reach a fight are included; heat counts the early van and holds only; a runner left behind is still just missing (slice 4 is not built), so a variant that leaves fewer behind is not yet scored on what leaving someone costs.
