# The five jobs' fights with the roster at each job's gate (2026-11-13)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-13`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | 10 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 35 | 16 | 24/24 | 8 | 5 / 8 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 28 | 24/24 | 10 | 6 / 8 / 10 | 8 / 9 / 11 | 4 / 6 / 8 |

## The fights

| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | 14 | steady | best of roster | 2400 | 62% | 62% | 38% | 0% | 0.00 | 0.55 | 0.0% |
| data_pull | 14 | steady | first 3 | 2400 | 22% | 22% | 78% | 0% | 0.00 | 0.93 | 0.0% |
| data_pull | 14 | committed | best of roster | 2400 | 82% | 82% | 18% | 0% | 0.00 | 0.85 | 1.1% |
| data_pull | 14 | committed | first 3 | 2400 | 48% | 48% | 53% | 0% | 0.00 | 1.89 | 4.2% |
| data_scrub | 11 | steady | best of roster | 2400 | 77% | 77% | 23% | 0% | 0.00 | 0.29 | 0.0% |
| data_scrub | 11 | steady | first 2 | 2400 | 43% | 43% | 57% | 0% | 0.00 | 0.59 | 0.0% |
| data_scrub | 11 | committed | best of roster | 2400 | 87% | 87% | 14% | 0% | 0.00 | 0.42 | 0.5% |
| data_scrub | 11 | committed | first 2 | 2400 | 62% | 62% | 38% | 0% | 0.00 | 0.98 | 1.5% |
| quiet_hours | 14 | steady | best of roster | 2400 | 75% | 75% | 25% | 0% | 0.00 | 0.31 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 2400 | 31% | 31% | 69% | 0% | 0.00 | 0.75 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 2400 | 92% | 92% | 8% | 0% | 0.00 | 0.51 | 0.7% |
| quiet_hours | 14 | committed | first 3 | 2400 | 63% | 63% | 37% | 0% | 0.00 | 1.57 | 3.6% |
| warehouse | 16 | steady | best of roster | 2400 | 79% | 93% | 7% | 8% | 0.21 | 0.48 | 0.0% |
| warehouse | 16 | steady | first 4 | 2400 | 27% | 65% | 35% | 26% | 0.70 | 1.36 | 0.0% |
| warehouse | 16 | committed | best of roster | 2400 | 87% | 100% | 0% | 13% | 0.31 | 0.56 | 3.6% |
| warehouse | 16 | committed | first 4 | 2400 | 50% | 100% | 0% | 47% | 1.37 | 2.18 | 19.2% |
| protection | 14 | steady | best of roster | 2400 | 73% | 89% | 11% | 12% | 0.30 | 0.56 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 25% | 51% | 49% | 20% | 0.45 | 1.14 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 82% | 100% | 0% | 18% | 0.43 | 0.67 | 5.0% |
| protection | 14 | committed | first 3 | 2400 | 41% | 100% | 0% | 57% | 1.47 | 2.01 | 21.5% |

## Against the declared targets (best team)

- data_pull: a death in 1.1% on committed (within 8%)
- data_scrub: a death in 0.5% on committed (within 8%)
- quiet_hours: a death in 0.7% on committed (within 8%)
- warehouse: left behind 8% on steady (within 15%)
- warehouse: a death in 3.6% on committed (within 8%)
- protection: left behind 12% on steady (within 15%)
- protection: a death in 5.0% on committed (within 8%)

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
