# The five jobs' fights with the roster at each job's gate (2026-11-15-after-extra0)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-15-after-extra0`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | 10 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 35 | 16 | 24/24 | 8 | 5 / 8 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 29 | 24/24 | 11 | 6 / 8 / 10 | 8 / 9 / 11 | 4 / 6 / 8 |

## The fights

| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | 14 | steady | best of roster | 2400 | 73% | 73% | 27% | 0% | 0.00 | 0.39 | 0.0% |
| data_pull | 14 | steady | first 3 | 2400 | 34% | 34% | 66% | 0% | 0.00 | 0.81 | 0.0% |
| data_pull | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.58 | 0.5% |
| data_pull | 14 | committed | first 3 | 2400 | 71% | 71% | 29% | 0% | 0.00 | 1.51 | 3.4% |
| data_scrub | 11 | steady | best of roster | 2400 | 90% | 90% | 10% | 0% | 0.00 | 0.14 | 0.0% |
| data_scrub | 11 | steady | first 2 | 2400 | 55% | 55% | 45% | 0% | 0.00 | 0.51 | 0.0% |
| data_scrub | 11 | committed | best of roster | 2400 | 94% | 94% | 6% | 0% | 0.00 | 0.19 | 0.3% |
| data_scrub | 11 | committed | first 2 | 2400 | 69% | 69% | 31% | 0% | 0.00 | 0.85 | 1.0% |
| quiet_hours | 14 | steady | best of roster | 2400 | 78% | 78% | 22% | 0% | 0.00 | 0.28 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 0.73 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 2400 | 94% | 94% | 6% | 0% | 0.00 | 0.48 | 0.6% |
| quiet_hours | 14 | committed | first 3 | 2400 | 73% | 73% | 27% | 0% | 0.00 | 1.41 | 3.6% |
| warehouse | 16 | steady | best of roster | 2400 | 86% | 98% | 2% | 9% | 0.26 | 0.51 | 0.0% |
| warehouse | 16 | steady | first 4 | 2400 | 43% | 84% | 16% | 33% | 0.95 | 1.60 | 0.0% |
| warehouse | 16 | committed | best of roster | 2400 | 88% | 100% | 0% | 11% | 0.26 | 0.48 | 3.2% |
| warehouse | 16 | committed | first 4 | 2400 | 56% | 100% | 0% | 43% | 1.10 | 1.84 | 14.9% |
| protection | 14 | steady | best of roster | 2400 | 74% | 74% | 26% | 0% | 0.00 | 0.25 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 22% | 22% | 78% | 0% | 0.00 | 0.80 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.43 | 2.5% |
| protection | 14 | committed | first 3 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 2.08 | 16.9% |
| dead_air | 16 | steady | best of roster | 2400 | 82% | 94% | 6% | 7% | 0.18 | 0.41 | 0.0% |
| dead_air | 16 | steady | first 4 | 2400 | 38% | 75% | 25% | 24% | 0.70 | 1.31 | 0.0% |
| dead_air | 16 | committed | best of roster | 2400 | 91% | 100% | 0% | 9% | 0.20 | 0.45 | 3.0% |
| dead_air | 16 | committed | first 4 | 2400 | 59% | 100% | 0% | 40% | 1.09 | 1.79 | 14.8% |
| still_connected | 16 | steady | best of roster | 2400 | 83% | 83% | 17% | 0% | 0.00 | 0.28 | 0.0% |
| still_connected | 16 | steady | first 4 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 0.83 | 0.0% |
| still_connected | 16 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.32 | 0.1% |
| still_connected | 16 | committed | first 4 | 2400 | 47% | 47% | 53% | 0% | 0.00 | 1.32 | 2.0% |
| not_for_sale | 16 | steady | best of roster | 2400 | 82% | 94% | 6% | 6% | 0.16 | 0.38 | 0.0% |
| not_for_sale | 16 | steady | first 4 | 2400 | 38% | 76% | 24% | 25% | 0.69 | 1.32 | 0.0% |
| not_for_sale | 16 | committed | best of roster | 2400 | 90% | 100% | 0% | 9% | 0.23 | 0.48 | 2.7% |
| not_for_sale | 16 | committed | first 4 | 2400 | 58% | 100% | 0% | 41% | 1.12 | 1.83 | 13.7% |
| one_more_song | 14 | steady | best of roster | 2400 | 80% | 80% | 20% | 0% | 0.00 | 0.31 | 0.0% |
| one_more_song | 14 | steady | first 3 | 2400 | 34% | 34% | 66% | 0% | 0.00 | 0.83 | 0.0% |
| one_more_song | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.46 | 0.1% |
| one_more_song | 14 | committed | first 3 | 2400 | 57% | 57% | 43% | 0% | 0.00 | 1.51 | 2.1% |
| the_wrong_fare | 16 | steady | best of roster | 2400 | 31% | 95% | 5% | 62% | 1.97 | 2.65 | 0.0% |
| the_wrong_fare | 16 | steady | first 4 | 2400 | 2% | 84% | 16% | 81% | 2.70 | 3.27 | 0.0% |
| the_wrong_fare | 16 | committed | best of roster | 2400 | 31% | 100% | 0% | 68% | 1.95 | 2.70 | 26.0% |
| the_wrong_fare | 16 | committed | first 4 | 2400 | 3% | 100% | 0% | 97% | 3.12 | 3.82 | 36.7% |

## Against the declared targets (best team)

- data_pull: a death in 0.5% on committed (within 8%)
- data_scrub: a death in 0.3% on committed (within 8%)
- quiet_hours: a death in 0.6% on committed (within 8%)
- warehouse: left behind 9% on steady (within 15%)
- warehouse: a death in 3.2% on committed (within 8%)
- protection: a death in 2.5% on committed (within 8%)
- dead_air: left behind 7% on steady (within 15%)
- dead_air: a death in 3.0% on committed (within 8%)
- still_connected: a death in 0.1% on committed (within 8%)
- not_for_sale: left behind 6% on steady (within 15%)
- not_for_sale: a death in 2.7% on committed (within 8%)
- one_more_song: a death in 0.1% on committed (within 8%)
- the_wrong_fare: left behind 62% on steady (over 15%)
- the_wrong_fare: a death in 26.0% on committed (over 8%)

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
