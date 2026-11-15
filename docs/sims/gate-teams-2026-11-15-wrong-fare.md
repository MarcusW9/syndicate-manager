# The five jobs' fights with the roster at each job's gate (2026-11-15-wrong-fare)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-15-wrong-fare`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | 10 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 35 | 16 | 24/24 | 8 | 5 / 8 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 29 | 24/24 | 12 | 6 / 8 / 10 | 8 / 9 / 10 | 5 / 6 / 8 |

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
| warehouse | 16 | steady | best of roster | 2400 | 86% | 98% | 2% | 9% | 0.23 | 0.48 | 0.0% |
| warehouse | 16 | steady | first 4 | 2400 | 39% | 84% | 17% | 33% | 0.98 | 1.64 | 0.0% |
| warehouse | 16 | committed | best of roster | 2400 | 88% | 100% | 0% | 11% | 0.25 | 0.48 | 3.1% |
| warehouse | 16 | committed | first 4 | 2400 | 57% | 100% | 0% | 42% | 1.07 | 1.80 | 15.2% |
| protection | 14 | steady | best of roster | 2400 | 74% | 74% | 26% | 0% | 0.00 | 0.25 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 22% | 22% | 78% | 0% | 0.00 | 0.80 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.43 | 2.5% |
| protection | 14 | committed | first 3 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 2.08 | 16.9% |
| dead_air | 16 | steady | best of roster | 2400 | 80% | 94% | 6% | 7% | 0.18 | 0.41 | 0.0% |
| dead_air | 16 | steady | first 4 | 2400 | 35% | 76% | 24% | 26% | 0.75 | 1.35 | 0.0% |
| dead_air | 16 | committed | best of roster | 2400 | 90% | 100% | 0% | 10% | 0.25 | 0.46 | 3.3% |
| dead_air | 16 | committed | first 4 | 2400 | 59% | 100% | 0% | 39% | 1.06 | 1.76 | 15.0% |
| still_connected | 16 | steady | best of roster | 2400 | 83% | 83% | 17% | 0% | 0.00 | 0.28 | 0.0% |
| still_connected | 16 | steady | first 4 | 2400 | 36% | 36% | 64% | 0% | 0.00 | 0.83 | 0.0% |
| still_connected | 16 | committed | best of roster | 2400 | 88% | 88% | 12% | 0% | 0.00 | 0.33 | 0.1% |
| still_connected | 16 | committed | first 4 | 2400 | 49% | 49% | 51% | 0% | 0.00 | 1.28 | 1.8% |
| not_for_sale | 16 | steady | best of roster | 2400 | 82% | 94% | 6% | 7% | 0.18 | 0.40 | 0.0% |
| not_for_sale | 16 | steady | first 4 | 2400 | 35% | 76% | 24% | 26% | 0.74 | 1.37 | 0.0% |
| not_for_sale | 16 | committed | best of roster | 2400 | 90% | 100% | 0% | 10% | 0.24 | 0.46 | 3.3% |
| not_for_sale | 16 | committed | first 4 | 2400 | 58% | 100% | 0% | 40% | 1.10 | 1.81 | 13.4% |
| one_more_song | 14 | steady | best of roster | 2400 | 80% | 80% | 20% | 0% | 0.00 | 0.31 | 0.0% |
| one_more_song | 14 | steady | first 3 | 2400 | 34% | 34% | 66% | 0% | 0.00 | 0.83 | 0.0% |
| one_more_song | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.46 | 0.1% |
| one_more_song | 14 | committed | first 3 | 2400 | 57% | 57% | 43% | 0% | 0.00 | 1.51 | 2.1% |
| still_clocked_in | 14 | steady | best of roster | 2400 | 65% | 65% | 35% | 0% | 0.00 | 0.56 | 0.0% |
| still_clocked_in | 14 | steady | first 3 | 2400 | 17% | 17% | 83% | 0% | 0.00 | 1.07 | 0.0% |
| still_clocked_in | 14 | committed | best of roster | 2400 | 75% | 75% | 25% | 0% | 0.00 | 0.85 | 0.7% |
| still_clocked_in | 14 | committed | first 3 | 2400 | 31% | 31% | 69% | 0% | 0.00 | 1.93 | 2.3% |
| the_last_collection | 16 | steady | best of roster | 2400 | 76% | 94% | 6% | 11% | 0.29 | 0.61 | 0.0% |
| the_last_collection | 16 | steady | first 4 | 2400 | 31% | 75% | 25% | 30% | 0.88 | 1.50 | 0.0% |
| the_last_collection | 16 | committed | best of roster | 2400 | 85% | 100% | 0% | 14% | 0.32 | 0.62 | 5.5% |
| the_last_collection | 16 | committed | first 4 | 2400 | 51% | 100% | 0% | 47% | 1.28 | 2.01 | 17.5% |
| the_wrong_fare | 14 | steady | best of roster | 2400 | 63% | 63% | 37% | 0% | 0.00 | 0.55 | 0.0% |
| the_wrong_fare | 14 | steady | first 4 | 2400 | 22% | 22% | 78% | 0% | 0.00 | 0.98 | 0.0% |
| the_wrong_fare | 14 | committed | best of roster | 2400 | 74% | 74% | 26% | 0% | 0.00 | 0.70 | 0.3% |
| the_wrong_fare | 14 | committed | first 4 | 2400 | 28% | 28% | 72% | 0% | 0.00 | 1.51 | 0.9% |

## Against the declared targets (best team)

- data_pull: a death in 0.5% on committed (within 8%)
- data_scrub: a death in 0.3% on committed (within 8%)
- quiet_hours: a death in 0.6% on committed (within 8%)
- warehouse: left behind 9% on steady (within 15%)
- warehouse: a death in 3.1% on committed (within 8%)
- protection: a death in 2.5% on committed (within 8%)
- dead_air: left behind 7% on steady (within 15%)
- dead_air: a death in 3.3% on committed (within 8%)
- still_connected: a death in 0.1% on committed (within 8%)
- not_for_sale: left behind 7% on steady (within 15%)
- not_for_sale: a death in 3.3% on committed (within 8%)
- one_more_song: a death in 0.1% on committed (within 8%)
- still_clocked_in: a death in 0.7% on committed (within 8%)
- the_last_collection: left behind 11% on steady (within 15%)
- the_last_collection: a death in 5.5% on committed (within 8%)
- the_wrong_fare: a death in 0.3% on committed (within 8%)

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
