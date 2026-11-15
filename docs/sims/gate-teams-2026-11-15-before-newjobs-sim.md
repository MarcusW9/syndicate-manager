# The five jobs' fights with the roster at each job's gate (2026-11-15-before-newjobs-sim)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-15-before-newjobs-sim`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | 10 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 35 | 16 | 24/24 | 8 | 5 / 8 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 26 | 24/24 | 10 | 5 / 8 / 10 | 7 / 9 / 10 | 5 / 6 / 8 |

## The fights

| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | 14 | steady | best of roster | 2400 | 73% | 73% | 27% | 0% | 0.00 | 0.39 | 0.0% |
| data_pull | 14 | steady | first 3 | 2400 | 34% | 34% | 66% | 0% | 0.00 | 0.82 | 0.0% |
| data_pull | 14 | committed | best of roster | 2400 | 90% | 90% | 10% | 0% | 0.00 | 0.60 | 0.5% |
| data_pull | 14 | committed | first 3 | 2400 | 71% | 71% | 29% | 0% | 0.00 | 1.51 | 3.3% |
| data_scrub | 11 | steady | best of roster | 2400 | 69% | 69% | 31% | 0% | 0.00 | 0.38 | 0.0% |
| data_scrub | 11 | steady | first 2 | 2400 | 18% | 18% | 82% | 0% | 0.00 | 0.86 | 0.0% |
| data_scrub | 11 | committed | best of roster | 2400 | 77% | 77% | 23% | 0% | 0.00 | 0.50 | 0.6% |
| data_scrub | 11 | committed | first 2 | 2400 | 24% | 24% | 76% | 0% | 0.00 | 1.38 | 0.9% |
| quiet_hours | 14 | steady | best of roster | 2400 | 78% | 78% | 22% | 0% | 0.00 | 0.28 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 0.73 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 2400 | 94% | 94% | 6% | 0% | 0.00 | 0.48 | 0.6% |
| quiet_hours | 14 | committed | first 3 | 2400 | 73% | 73% | 27% | 0% | 0.00 | 1.41 | 3.6% |
| warehouse | 16 | steady | best of roster | 2400 | 63% | 92% | 8% | 25% | 0.71 | 1.29 | 0.0% |
| warehouse | 16 | steady | first 4 | 2400 | 17% | 68% | 32% | 45% | 1.36 | 2.15 | 0.0% |
| warehouse | 16 | committed | best of roster | 2400 | 69% | 100% | 0% | 30% | 0.72 | 1.27 | 10.0% |
| warehouse | 16 | committed | first 4 | 2400 | 27% | 100% | 0% | 71% | 2.03 | 2.94 | 23.9% |
| protection | 14 | steady | best of roster | 2400 | 75% | 75% | 26% | 0% | 0.00 | 0.25 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 22% | 22% | 78% | 0% | 0.00 | 0.80 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.43 | 2.5% |
| protection | 14 | committed | first 3 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 2.08 | 16.8% |

## Against the declared targets (best team)

- data_pull: a death in 0.5% on committed (within 8%)
- data_scrub: a death in 0.6% on committed (within 8%)
- quiet_hours: a death in 0.6% on committed (within 8%)
- warehouse: left behind 25% on steady (over 15%)
- warehouse: a death in 10.0% on committed (over 8%)
- protection: a death in 2.5% on committed (within 8%)

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
