# Van timing sweep (2026-11-12)

`node scripts/sim-vantiming.mjs 400 2026-11-12`. Real fight code, the two extraction jobs at their real difficulty, the game's own starting rosters (fresh and authored), the best team of each by the planning read (held for every variant), the crew's defaults hands-off, 400 seeds, on the current rules (steady pulls out at a third of max pips). Nothing in `src/` changed. Outcomes per fight: **clean** = everyone home and the job done; **done, at a cost** = the job done but someone left behind, lost or walked off; **failed** = the crew pulled back (no pay, heat +1, reputation -2). The declared bar: a variant is worth a look if job done does not fall more than 5 points and clean rises 5+ points or left-behind falls 10+ points.

## Mean over both jobs and both rosters (steady)

| Variant | Clean | Done, at a cost | Failed | Job done | Someone left behind | vs base | Downs | Heat | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| base (van round 3) | 11% | 56% | 33% | 67% | 51% | +0 | 1.85 | 0.26 | 4.82 |
| van round 2 | 13% | 70% | 16% | 84% | 69% | +18 | 2.36 | 0.46 | 5.10 |
| van round 4 | 9% | 35% | 57% | 43% | 30% | −21 | 1.32 | 0.15 | 4.40 |
| van round 5 | 7% | 23% | 70% | 30% | 18% | −32 | 1.09 | 0.08 | 4.21 |
| van round 6 | 6% | 16% | 78% | 22% | 12% | −39 | 0.98 | 0.04 | 4.20 |
| van round 4, pressure from round 4 every 3 | 10% | 40% | 50% | 50% | 32% | −19 | 1.32 | 0.14 | 4.62 |
| van round 5, pressure from round 5 every 3 | 9% | 30% | 61% | 39% | 25% | −25 | 1.06 | 0.09 | 4.77 |
| van round 4, waits 6 | 11% | 32% | 57% | 43% | 27% | −23 | 1.40 | 0.09 | 4.62 |
| van round 5, waits 6 | 9% | 21% | 70% | 30% | 16% | −34 | 1.13 | 0.05 | 4.37 |
| pressure from round 4 every 3 (van round 3) | 14% | 55% | 31% | 69% | 50% | −1 | 1.79 | 0.25 | 4.91 |

**Worth a look by the declared bar:** none.

## Fresh roster, steady, by job

| Variant | Job | Clean | Done, at a cost | Failed | Someone left behind | Downs | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| base (van round 3) | warehouse | 2% | 34% | 64% | 34% | 1.81 | 3.36 |
| base (van round 3) | protection | 6% | 48% | 46% | 45% | 1.64 | 4.07 |
| van round 2 | warehouse | 2% | 62% | 36% | 62% | 2.66 | 4.26 |
| van round 2 | protection | 7% | 66% | 27% | 66% | 2.12 | 4.09 |
| van round 4 | warehouse | 1% | 14% | 85% | 14% | 1.28 | 2.80 |
| van round 4 | protection | 6% | 26% | 68% | 24% | 1.19 | 3.79 |
| van round 5 | warehouse | 1% | 8% | 91% | 8% | 1.09 | 2.60 |
| van round 5 | protection | 8% | 15% | 77% | 14% | 1.06 | 3.68 |
| van round 6 | warehouse | 1% | 6% | 93% | 6% | 1.03 | 2.60 |
| van round 6 | protection | 7% | 12% | 81% | 10% | 0.99 | 3.76 |
| van round 4, pressure from round 4 every 3 | warehouse | 1% | 20% | 79% | 20% | 1.43 | 3.07 |
| van round 4, pressure from round 4 every 3 | protection | 10% | 24% | 65% | 19% | 1.02 | 3.73 |
| van round 5, pressure from round 5 every 3 | warehouse | 1% | 13% | 86% | 13% | 1.13 | 3.01 |
| van round 5, pressure from round 5 every 3 | protection | 12% | 17% | 71% | 15% | 0.93 | 3.88 |
| van round 4, waits 6 | warehouse | 3% | 13% | 85% | 13% | 1.31 | 2.90 |
| van round 4, waits 6 | protection | 7% | 24% | 68% | 22% | 1.26 | 3.99 |
| van round 5, waits 6 | warehouse | 2% | 7% | 91% | 7% | 1.10 | 2.70 |
| van round 5, waits 6 | protection | 9% | 14% | 77% | 13% | 1.10 | 3.83 |
| pressure from round 4 every 3 (van round 3) | warehouse | 1% | 40% | 59% | 40% | 1.98 | 3.72 |
| pressure from round 4 every 3 (van round 3) | protection | 12% | 40% | 47% | 39% | 1.42 | 3.90 |

## Authored roster, steady, by job

| Variant | Job | Clean | Done, at a cost | Failed | Someone left behind | Downs | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| base (van round 3) | warehouse | 11% | 78% | 11% | 75% | 2.46 | 6.65 |
| base (van round 3) | protection | 26% | 64% | 10% | 48% | 1.51 | 5.20 |
| van round 2 | warehouse | 12% | 86% | 1% | 86% | 2.76 | 6.67 |
| van round 2 | protection | 32% | 67% | 2% | 60% | 1.89 | 5.37 |
| van round 4 | warehouse | 8% | 58% | 34% | 54% | 1.72 | 6.16 |
| van round 4 | protection | 20% | 41% | 39% | 29% | 1.08 | 4.84 |
| van round 5 | warehouse | 7% | 41% | 52% | 37% | 1.35 | 5.90 |
| van round 5 | protection | 13% | 26% | 61% | 14% | 0.85 | 4.64 |
| van round 6 | warehouse | 8% | 29% | 63% | 25% | 1.07 | 5.77 |
| van round 6 | protection | 8% | 16% | 76% | 6% | 0.81 | 4.66 |
| van round 4, pressure from round 4 every 3 | warehouse | 11% | 62% | 27% | 59% | 1.83 | 6.63 |
| van round 4, pressure from round 4 every 3 | protection | 18% | 53% | 29% | 29% | 0.98 | 5.03 |
| van round 5, pressure from round 5 every 3 | warehouse | 9% | 53% | 38% | 50% | 1.36 | 6.80 |
| van round 5, pressure from round 5 every 3 | protection | 12% | 39% | 49% | 23% | 0.81 | 5.38 |
| van round 4, waits 6 | warehouse | 14% | 52% | 34% | 48% | 1.92 | 6.69 |
| van round 4, waits 6 | protection | 20% | 41% | 39% | 27% | 1.10 | 4.91 |
| van round 5, waits 6 | warehouse | 12% | 36% | 52% | 32% | 1.47 | 6.26 |
| van round 5, waits 6 | protection | 14% | 25% | 61% | 13% | 0.85 | 4.68 |
| pressure from round 4 every 3 (van round 3) | warehouse | 17% | 75% | 8% | 71% | 2.36 | 6.78 |
| pressure from round 4 every 3 (van round 3) | protection | 26% | 65% | 8% | 49% | 1.39 | 5.24 |

## Committed (deaths), mean over both jobs and rosters

| Variant | Clean | Failed | Someone left behind | Deaths in a fight |
| --- | --- | --- | --- | --- |
| base (van round 3) | 14% | 0% | 85% | 35% |
| van round 2 | 15% | 0% | 84% | 31% |
| van round 4 | 14% | 1% | 85% | 35% |
| van round 5 | 15% | 9% | 75% | 36% |
| van round 6 | 15% | 26% | 57% | 34% |
| van round 4, pressure from round 4 every 3 | 16% | 0% | 82% | 30% |
| van round 5, pressure from round 5 every 3 | 17% | 6% | 75% | 32% |
| van round 4, waits 6 | 17% | 1% | 81% | 37% |
| van round 5, waits 6 | 18% | 9% | 71% | 37% |
| pressure from round 4 every 3 (van round 3) | 17% | 0% | 81% | 29% |

Limits: the team is the planning read's pick, not a player's; only runs that reach a fight are included; a runner left behind is still just missing (slice 4 is not built), so the cost of leaving someone is not scored beyond counting it.
