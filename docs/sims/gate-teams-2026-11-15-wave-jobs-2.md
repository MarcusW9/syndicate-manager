# The five jobs' fights with the roster at each job's gate (2026-11-15-wave-jobs-2)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-15-wave-jobs-2`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | 10 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 35 | 16 | 24/24 | 8 | 5 / 8 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 29 | 24/24 | 12 | 6 / 8 / 10 | 8 / 9 / 11 | 4 / 6 / 8 |

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
| warehouse | 16 | steady | best of roster | 2400 | 86% | 98% | 2% | 9% | 0.24 | 0.51 | 0.0% |
| warehouse | 16 | steady | first 4 | 2400 | 38% | 82% | 18% | 34% | 0.98 | 1.63 | 0.0% |
| warehouse | 16 | committed | best of roster | 2400 | 88% | 100% | 0% | 11% | 0.26 | 0.46 | 3.5% |
| warehouse | 16 | committed | first 4 | 2400 | 56% | 100% | 0% | 42% | 1.09 | 1.85 | 15.0% |
| protection | 14 | steady | best of roster | 2400 | 74% | 74% | 26% | 0% | 0.00 | 0.25 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 22% | 22% | 78% | 0% | 0.00 | 0.80 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.43 | 2.5% |
| protection | 14 | committed | first 3 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 2.08 | 16.9% |
| dead_air | 16 | steady | best of roster | 2400 | 81% | 94% | 6% | 8% | 0.22 | 0.46 | 0.0% |
| dead_air | 16 | steady | first 4 | 2400 | 35% | 74% | 26% | 25% | 0.74 | 1.35 | 0.0% |
| dead_air | 16 | committed | best of roster | 2400 | 88% | 100% | 0% | 11% | 0.26 | 0.49 | 3.5% |
| dead_air | 16 | committed | first 4 | 2400 | 60% | 100% | 0% | 39% | 1.07 | 1.77 | 14.6% |
| still_connected | 16 | steady | best of roster | 2400 | 83% | 83% | 17% | 0% | 0.00 | 0.27 | 0.0% |
| still_connected | 16 | steady | first 4 | 2400 | 34% | 34% | 66% | 0% | 0.00 | 0.80 | 0.0% |
| still_connected | 16 | committed | best of roster | 2400 | 90% | 90% | 10% | 0% | 0.00 | 0.30 | 0.2% |
| still_connected | 16 | committed | first 4 | 2400 | 48% | 48% | 52% | 0% | 0.00 | 1.31 | 1.9% |
| not_for_sale | 16 | steady | best of roster | 2400 | 84% | 94% | 6% | 7% | 0.19 | 0.40 | 0.0% |
| not_for_sale | 16 | steady | first 4 | 2400 | 34% | 75% | 25% | 26% | 0.75 | 1.36 | 0.0% |
| not_for_sale | 16 | committed | best of roster | 2400 | 88% | 100% | 0% | 12% | 0.29 | 0.53 | 4.0% |
| not_for_sale | 16 | committed | first 4 | 2400 | 58% | 100% | 0% | 41% | 1.12 | 1.84 | 13.6% |
| one_more_song | 14 | steady | best of roster | 2400 | 80% | 80% | 20% | 0% | 0.00 | 0.31 | 0.0% |
| one_more_song | 14 | steady | first 3 | 2400 | 34% | 34% | 66% | 0% | 0.00 | 0.83 | 0.0% |
| one_more_song | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.46 | 0.1% |
| one_more_song | 14 | committed | first 3 | 2400 | 57% | 57% | 43% | 0% | 0.00 | 1.51 | 2.1% |
| still_clocked_in | 14 | steady | best of roster | 2400 | 65% | 65% | 35% | 0% | 0.00 | 0.56 | 0.0% |
| still_clocked_in | 14 | steady | first 3 | 2400 | 17% | 17% | 83% | 0% | 0.00 | 1.07 | 0.0% |
| still_clocked_in | 14 | committed | best of roster | 2400 | 75% | 75% | 25% | 0% | 0.00 | 0.85 | 0.7% |
| still_clocked_in | 14 | committed | first 3 | 2400 | 31% | 31% | 69% | 0% | 0.00 | 1.93 | 2.3% |
| the_last_collection | 16 | steady | best of roster | 2400 | 77% | 95% | 5% | 12% | 0.34 | 0.61 | 0.0% |
| the_last_collection | 16 | steady | first 4 | 2400 | 31% | 74% | 26% | 30% | 0.87 | 1.48 | 0.0% |
| the_last_collection | 16 | committed | best of roster | 2400 | 85% | 100% | 0% | 15% | 0.36 | 0.59 | 4.2% |
| the_last_collection | 16 | committed | first 4 | 2400 | 52% | 100% | 0% | 46% | 1.28 | 2.01 | 17.7% |

## Against the declared targets (best team)

- data_pull: a death in 0.5% on committed (within 8%)
- data_scrub: a death in 0.3% on committed (within 8%)
- quiet_hours: a death in 0.6% on committed (within 8%)
- warehouse: left behind 9% on steady (within 15%)
- warehouse: a death in 3.5% on committed (within 8%)
- protection: a death in 2.5% on committed (within 8%)
- dead_air: left behind 8% on steady (within 15%)
- dead_air: a death in 3.5% on committed (within 8%)
- still_connected: a death in 0.2% on committed (within 8%)
- not_for_sale: left behind 7% on steady (within 15%)
- not_for_sale: a death in 4.0% on committed (within 8%)
- one_more_song: a death in 0.1% on committed (within 8%)
- still_clocked_in: a death in 0.7% on committed (within 8%)
- the_last_collection: left behind 12% on steady (within 15%)
- the_last_collection: a death in 4.2% on committed (within 8%)

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
