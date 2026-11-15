# The five jobs' fights with the roster at each job's gate (2026-11-15-before-3i)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-15-before-3i`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | 10 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 35 | 16 | 24/24 | 8 | 5 / 8 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 27 | 24/24 | 10 | 5 / 8 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |

## The fights

| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | 14 | steady | best of roster | 2400 | 60% | 60% | 40% | 0% | 0.00 | 0.58 | 0.0% |
| data_pull | 14 | steady | first 3 | 2400 | 24% | 24% | 76% | 0% | 0.00 | 0.95 | 0.0% |
| data_pull | 14 | committed | best of roster | 2400 | 82% | 82% | 18% | 0% | 0.00 | 0.88 | 1.2% |
| data_pull | 14 | committed | first 3 | 2400 | 52% | 52% | 48% | 0% | 0.00 | 1.81 | 3.5% |
| data_scrub | 11 | steady | best of roster | 2400 | 79% | 79% | 21% | 0% | 0.00 | 0.26 | 0.0% |
| data_scrub | 11 | steady | first 2 | 2400 | 43% | 43% | 57% | 0% | 0.00 | 0.59 | 0.0% |
| data_scrub | 11 | committed | best of roster | 2400 | 88% | 88% | 12% | 0% | 0.00 | 0.37 | 0.5% |
| data_scrub | 11 | committed | first 2 | 2400 | 61% | 61% | 39% | 0% | 0.00 | 0.99 | 1.4% |
| quiet_hours | 14 | steady | best of roster | 2400 | 75% | 75% | 25% | 0% | 0.00 | 0.33 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 2400 | 34% | 34% | 66% | 0% | 0.00 | 0.77 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 2400 | 92% | 92% | 8% | 0% | 0.00 | 0.52 | 0.5% |
| quiet_hours | 14 | committed | first 3 | 2400 | 68% | 68% | 32% | 0% | 0.00 | 1.50 | 3.8% |
| warehouse | 16 | steady | best of roster | 2400 | 78% | 93% | 7% | 9% | 0.26 | 0.52 | 0.0% |
| warehouse | 16 | steady | first 4 | 2400 | 33% | 71% | 29% | 28% | 0.81 | 1.50 | 0.0% |
| warehouse | 16 | committed | best of roster | 2400 | 87% | 100% | 0% | 13% | 0.32 | 0.58 | 4.4% |
| warehouse | 16 | committed | first 4 | 2400 | 52% | 100% | 0% | 46% | 1.30 | 2.08 | 18.0% |
| protection | 14 | steady | best of roster | 2400 | 71% | 71% | 29% | 0% | 0.00 | 0.30 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 18% | 18% | 82% | 0% | 0.00 | 0.84 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 87% | 87% | 13% | 0% | 0.00 | 0.55 | 2.5% |
| protection | 14 | committed | first 3 | 2400 | 34% | 34% | 67% | 0% | 0.00 | 2.20 | 15.1% |

## Against the declared targets (best team)

- data_pull: a death in 1.2% on committed (within 8%)
- data_scrub: a death in 0.5% on committed (within 8%)
- quiet_hours: a death in 0.5% on committed (within 8%)
- warehouse: left behind 9% on steady (within 15%)
- warehouse: a death in 4.4% on committed (within 8%)
- protection: a death in 2.5% on committed (within 8%)

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
