# The five jobs' fights with the roster at each job's gate (2026-11-15-before-newjobs)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-15-before-newjobs`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

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
| data_scrub | 11 | steady | best of roster | 2400 | 87% | 87% | 13% | 0% | 0.00 | 0.17 | 0.0% |
| data_scrub | 11 | steady | first 2 | 2400 | 53% | 53% | 47% | 0% | 0.00 | 0.46 | 0.0% |
| data_scrub | 11 | committed | best of roster | 2400 | 94% | 94% | 6% | 0% | 0.00 | 0.24 | 0.2% |
| data_scrub | 11 | committed | first 2 | 2400 | 74% | 74% | 26% | 0% | 0.00 | 0.81 | 0.8% |
| quiet_hours | 14 | steady | best of roster | 2400 | 78% | 78% | 22% | 0% | 0.00 | 0.28 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 0.73 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 2400 | 94% | 94% | 6% | 0% | 0.00 | 0.48 | 0.6% |
| quiet_hours | 14 | committed | first 3 | 2400 | 73% | 73% | 27% | 0% | 0.00 | 1.41 | 3.6% |
| warehouse | 16 | steady | best of roster | 2400 | 78% | 92% | 8% | 8% | 0.21 | 0.48 | 0.0% |
| warehouse | 16 | steady | first 4 | 2400 | 35% | 74% | 26% | 26% | 0.74 | 1.37 | 0.0% |
| warehouse | 16 | committed | best of roster | 2400 | 89% | 100% | 0% | 11% | 0.26 | 0.53 | 4.3% |
| warehouse | 16 | committed | first 4 | 2400 | 57% | 100% | 0% | 41% | 1.11 | 1.84 | 14.3% |
| protection | 14 | steady | best of roster | 2400 | 75% | 75% | 26% | 0% | 0.00 | 0.25 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 22% | 22% | 78% | 0% | 0.00 | 0.80 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.43 | 2.5% |
| protection | 14 | committed | first 3 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 2.08 | 16.8% |

## Against the declared targets (best team)

- data_pull: a death in 0.5% on committed (within 8%)
- data_scrub: a death in 0.2% on committed (within 8%)
- quiet_hours: a death in 0.6% on committed (within 8%)
- warehouse: left behind 8% on steady (within 15%)
- warehouse: a death in 4.3% on committed (within 8%)
- protection: a death in 2.5% on committed (within 8%)

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
