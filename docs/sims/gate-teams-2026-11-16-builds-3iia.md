# The five jobs' fights with the roster at each job's gate (2026-11-16-builds-3iia)

`node scripts/sim-gate-teams.mjs 24 60 2026-11-16-builds-3iia`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 60 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | 10 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 35 | 16 | 24/24 | 8 | 5 / 8 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 29 | 24/24 | 12 | 6 / 8 / 10 | 8 / 9 / 10 | 5 / 6 / 8 |

## The fights

| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | 14 | steady | best of roster | 1440 | 73% | 73% | 27% | 0% | 0.00 | 0.39 | 0.0% |
| data_pull | 14 | steady | first 3 | 1440 | 34% | 34% | 66% | 0% | 0.00 | 0.81 | 0.0% |
| data_pull | 14 | committed | best of roster | 1440 | 88% | 88% | 12% | 0% | 0.00 | 0.59 | 0.4% |
| data_pull | 14 | committed | first 3 | 1440 | 71% | 71% | 29% | 0% | 0.00 | 1.51 | 3.5% |
| data_scrub | 11 | steady | best of roster | 1440 | 90% | 90% | 10% | 0% | 0.00 | 0.14 | 0.0% |
| data_scrub | 11 | steady | first 2 | 1440 | 54% | 54% | 46% | 0% | 0.00 | 0.53 | 0.0% |
| data_scrub | 11 | committed | best of roster | 1440 | 95% | 95% | 5% | 0% | 0.00 | 0.19 | 0.3% |
| data_scrub | 11 | committed | first 2 | 1440 | 68% | 68% | 32% | 0% | 0.00 | 0.87 | 1.0% |
| quiet_hours | 14 | steady | best of roster | 1440 | 78% | 78% | 22% | 0% | 0.00 | 0.28 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 1440 | 36% | 36% | 64% | 0% | 0.00 | 0.73 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 1440 | 94% | 94% | 6% | 0% | 0.00 | 0.49 | 0.6% |
| quiet_hours | 14 | committed | first 3 | 1440 | 74% | 74% | 26% | 0% | 0.00 | 1.40 | 3.3% |
| warehouse | 16 | steady | best of roster | 1440 | 85% | 98% | 2% | 10% | 0.27 | 0.51 | 0.0% |
| warehouse | 16 | steady | first 4 | 1440 | 39% | 85% | 15% | 34% | 1.02 | 1.66 | 0.0% |
| warehouse | 16 | committed | best of roster | 1440 | 89% | 100% | 0% | 11% | 0.23 | 0.46 | 3.1% |
| warehouse | 16 | committed | first 4 | 1440 | 56% | 100% | 0% | 42% | 1.09 | 1.81 | 15.0% |
| protection | 14 | steady | best of roster | 1440 | 74% | 74% | 26% | 0% | 0.00 | 0.26 | 0.0% |
| protection | 14 | steady | first 3 | 1440 | 23% | 23% | 77% | 0% | 0.00 | 0.79 | 0.0% |
| protection | 14 | committed | best of roster | 1440 | 89% | 89% | 11% | 0% | 0.00 | 0.45 | 2.3% |
| protection | 14 | committed | first 3 | 1440 | 35% | 35% | 65% | 0% | 0.00 | 2.10 | 17.4% |
| dead_air | 16 | steady | best of roster | 1440 | 80% | 94% | 6% | 8% | 0.21 | 0.45 | 0.0% |
| dead_air | 16 | steady | first 4 | 1440 | 35% | 75% | 25% | 25% | 0.72 | 1.34 | 0.0% |
| dead_air | 16 | committed | best of roster | 1440 | 89% | 100% | 0% | 10% | 0.26 | 0.46 | 3.3% |
| dead_air | 16 | committed | first 4 | 1440 | 60% | 100% | 0% | 38% | 1.02 | 1.71 | 14.4% |
| still_connected | 16 | steady | best of roster | 1440 | 83% | 83% | 17% | 0% | 0.00 | 0.27 | 0.0% |
| still_connected | 16 | steady | first 4 | 1440 | 36% | 36% | 64% | 0% | 0.00 | 0.83 | 0.0% |
| still_connected | 16 | committed | best of roster | 1440 | 88% | 88% | 12% | 0% | 0.00 | 0.31 | 0.0% |
| still_connected | 16 | committed | first 4 | 1440 | 48% | 48% | 52% | 0% | 0.00 | 1.27 | 1.7% |
| not_for_sale | 16 | steady | best of roster | 1440 | 82% | 94% | 6% | 7% | 0.21 | 0.42 | 0.0% |
| not_for_sale | 16 | steady | first 4 | 1440 | 35% | 76% | 24% | 26% | 0.76 | 1.37 | 0.0% |
| not_for_sale | 16 | committed | best of roster | 1440 | 90% | 100% | 0% | 10% | 0.25 | 0.47 | 2.9% |
| not_for_sale | 16 | committed | first 4 | 1440 | 58% | 100% | 0% | 41% | 1.10 | 1.80 | 12.6% |
| one_more_song | 14 | steady | best of roster | 1440 | 80% | 80% | 20% | 0% | 0.00 | 0.30 | 0.0% |
| one_more_song | 14 | steady | first 3 | 1440 | 35% | 35% | 65% | 0% | 0.00 | 0.83 | 0.0% |
| one_more_song | 14 | committed | best of roster | 1440 | 90% | 90% | 10% | 0% | 0.00 | 0.44 | 0.1% |
| one_more_song | 14 | committed | first 3 | 1440 | 58% | 58% | 42% | 0% | 0.00 | 1.48 | 2.6% |
| still_clocked_in | 14 | steady | best of roster | 1440 | 66% | 66% | 34% | 0% | 0.00 | 0.54 | 0.0% |
| still_clocked_in | 14 | steady | first 3 | 1440 | 18% | 18% | 82% | 0% | 0.00 | 1.07 | 0.0% |
| still_clocked_in | 14 | committed | best of roster | 1440 | 75% | 75% | 25% | 0% | 0.00 | 0.86 | 0.6% |
| still_clocked_in | 14 | committed | first 3 | 1440 | 31% | 31% | 69% | 0% | 0.00 | 1.92 | 2.8% |
| the_last_collection | 16 | steady | best of roster | 1440 | 76% | 94% | 6% | 10% | 0.29 | 0.60 | 0.0% |
| the_last_collection | 16 | steady | first 4 | 1440 | 31% | 76% | 24% | 31% | 0.89 | 1.51 | 0.0% |
| the_last_collection | 16 | committed | best of roster | 1440 | 86% | 100% | 0% | 13% | 0.30 | 0.62 | 5.4% |
| the_last_collection | 16 | committed | first 4 | 1440 | 51% | 100% | 0% | 47% | 1.28 | 2.00 | 17.0% |
| the_wrong_fare | 14 | steady | best of roster | 1440 | 63% | 63% | 37% | 0% | 0.00 | 0.55 | 0.0% |
| the_wrong_fare | 14 | steady | first 4 | 1440 | 20% | 20% | 80% | 0% | 0.00 | 0.99 | 0.0% |
| the_wrong_fare | 14 | committed | best of roster | 1440 | 74% | 74% | 26% | 0% | 0.00 | 0.69 | 0.3% |
| the_wrong_fare | 14 | committed | first 4 | 1440 | 28% | 28% | 72% | 0% | 0.00 | 1.49 | 0.8% |

## Against the declared targets (best team)

- data_pull: a death in 0.4% on committed (within 8%)
- data_scrub: a death in 0.3% on committed (within 8%)
- quiet_hours: a death in 0.6% on committed (within 8%)
- warehouse: left behind 10% on steady (within 15%)
- warehouse: a death in 3.1% on committed (within 8%)
- protection: a death in 2.3% on committed (within 8%)
- dead_air: left behind 8% on steady (within 15%)
- dead_air: a death in 3.3% on committed (within 8%)
- still_connected: a death in 0.0% on committed (within 8%)
- not_for_sale: left behind 7% on steady (within 15%)
- not_for_sale: a death in 2.9% on committed (within 8%)
- one_more_song: a death in 0.1% on committed (within 8%)
- still_clocked_in: a death in 0.6% on committed (within 8%)
- the_last_collection: left behind 10% on steady (within 15%)
- the_last_collection: a death in 5.4% on committed (within 8%)
- the_wrong_fare: a death in 0.3% on committed (within 8%)

## Builds: the best team with and without the given build (Ricochet and the Cytotoxic Vector on the best combat runner)

Same teams, same seeds; each pair differs only by the build. "Fires" is the share of fights where Ricochet fired, with the median-ish mean round; "Vector kills" is defeats by the tick a fight (of all defeats).

| Job | Risk | Team | Fights | Clean win | Someone left | Downs | A death | Fires (mean round) | Vector kills / defeats | Mean rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | steady | no build | 1440 | 73% | 0% | 0.39 | 0.0% | - | - | 3.7 |
| data_pull | steady | **built** | 1440 | 76% | 0% | 0.33 | 0.0% | 53% (1.6) | 0.31 / 0.96 | 3.7 |
| data_pull | committed | no build | 1440 | 88% | 0% | 0.59 | 0.4% | - | - | 4.0 |
| data_pull | committed | **built** | 1440 | 92% | 0% | 0.49 | 0.5% | 57% (1.8) | 0.32 / 1.03 | 4.0 |
| data_scrub | steady | no build | 1440 | 90% | 0% | 0.14 | 0.0% | - | - | 3.9 |
| data_scrub | steady | **built** | 1440 | 91% | 0% | 0.13 | 0.0% | 18% (2.0) | 0.10 / 0.30 | 3.9 |
| data_scrub | committed | no build | 1440 | 95% | 0% | 0.19 | 0.3% | - | - | 4.0 |
| data_scrub | committed | **built** | 1440 | 96% | 0% | 0.17 | 0.3% | 18% (2.0) | 0.12 / 0.31 | 4.0 |
| quiet_hours | steady | no build | 1440 | 78% | 0% | 0.28 | 0.0% | - | - | 3.7 |
| quiet_hours | steady | **built** | 1440 | 81% | 0% | 0.23 | 0.0% | 43% (1.9) | 0.13 / 1.02 | 3.7 |
| quiet_hours | committed | no build | 1440 | 94% | 0% | 0.49 | 0.6% | - | - | 4.0 |
| quiet_hours | committed | **built** | 1440 | 95% | 0% | 0.40 | 0.5% | 47% (2.0) | 0.17 / 1.16 | 4.0 |
| warehouse | steady | no build | 1440 | 85% | 10% | 0.51 | 0.0% | - | - | 5.3 |
| warehouse | steady | **built** | 1440 | 90% | 4% | 0.25 | 0.0% | 77% (1.3) | 0.54 / 2.27 | 5.1 |
| warehouse | committed | no build | 1440 | 89% | 11% | 0.46 | 3.1% | - | - | 5.3 |
| warehouse | committed | **built** | 1440 | 94% | 5% | 0.23 | 1.2% | 77% (1.3) | 0.55 / 2.32 | 5.2 |
| protection | steady | no build | 1440 | 74% | 0% | 0.26 | 0.0% | - | - | 4.7 |
| protection | steady | **built** | 1440 | 83% | 0% | 0.17 | 0.0% | 80% (1.4) | 0.16 / 3.32 | 3.9 |
| protection | committed | no build | 1440 | 89% | 0% | 0.45 | 2.3% | - | - | 5.6 |
| protection | committed | **built** | 1440 | 94% | 0% | 0.26 | 1.5% | 86% (1.7) | 0.18 / 3.80 | 4.6 |
| dead_air | steady | no build | 1440 | 80% | 8% | 0.45 | 0.0% | - | - | 5.0 |
| dead_air | steady | **built** | 1440 | 85% | 4% | 0.26 | 0.0% | 77% (1.3) | 0.18 / 2.71 | 4.9 |
| dead_air | committed | no build | 1440 | 89% | 10% | 0.46 | 3.3% | - | - | 5.2 |
| dead_air | committed | **built** | 1440 | 95% | 5% | 0.24 | 1.6% | 77% (1.3) | 0.19 / 2.82 | 5.1 |
| still_connected | steady | no build | 1440 | 83% | 0% | 0.27 | 0.0% | - | - | 3.9 |
| still_connected | steady | **built** | 1440 | 87% | 0% | 0.21 | 0.0% | 42% (1.5) | 0.43 / 1.32 | 3.9 |
| still_connected | committed | no build | 1440 | 88% | 0% | 0.31 | 0.0% | - | - | 4.0 |
| still_connected | committed | **built** | 1440 | 92% | 0% | 0.24 | 0.0% | 41% (1.5) | 0.45 / 1.32 | 4.0 |
| not_for_sale | steady | no build | 1440 | 82% | 7% | 0.42 | 0.0% | - | - | 5.0 |
| not_for_sale | steady | **built** | 1440 | 87% | 3% | 0.24 | 0.0% | 78% (1.3) | 0.16 / 2.69 | 4.9 |
| not_for_sale | committed | no build | 1440 | 90% | 10% | 0.47 | 2.9% | - | - | 5.2 |
| not_for_sale | committed | **built** | 1440 | 94% | 6% | 0.27 | 1.7% | 78% (1.3) | 0.18 / 2.78 | 5.1 |
| one_more_song | steady | no build | 1440 | 80% | 0% | 0.30 | 0.0% | - | - | 3.8 |
| one_more_song | steady | **built** | 1440 | 84% | 0% | 0.25 | 0.0% | 38% (1.7) | 0.37 / 0.79 | 3.8 |
| one_more_song | committed | no build | 1440 | 90% | 0% | 0.44 | 0.1% | - | - | 4.0 |
| one_more_song | committed | **built** | 1440 | 91% | 0% | 0.40 | 0.3% | 39% (1.7) | 0.40 / 0.81 | 4.0 |
| still_clocked_in | steady | no build | 1440 | 66% | 0% | 0.54 | 0.0% | - | - | 3.7 |
| still_clocked_in | steady | **built** | 1440 | 71% | 0% | 0.49 | 0.0% | 30% (1.5) | 0.24 / 0.61 | 3.8 |
| still_clocked_in | committed | no build | 1440 | 75% | 0% | 0.86 | 0.6% | - | - | 4.0 |
| still_clocked_in | committed | **built** | 1440 | 78% | 0% | 0.78 | 0.7% | 30% (1.5) | 0.24 / 0.62 | 4.0 |
| the_last_collection | steady | no build | 1440 | 76% | 10% | 0.60 | 0.0% | - | - | 5.1 |
| the_last_collection | steady | **built** | 1440 | 83% | 7% | 0.40 | 0.0% | 72% (1.3) | 0.16 / 2.69 | 5.1 |
| the_last_collection | committed | no build | 1440 | 86% | 13% | 0.62 | 5.4% | - | - | 5.3 |
| the_last_collection | committed | **built** | 1440 | 91% | 8% | 0.42 | 3.8% | 75% (1.3) | 0.17 / 2.71 | 5.2 |
| the_wrong_fare | steady | no build | 1440 | 63% | 0% | 0.55 | 0.0% | - | - | 3.8 |
| the_wrong_fare | steady | **built** | 1440 | 69% | 0% | 0.46 | 0.0% | 43% (1.5) | 0.42 / 1.14 | 3.8 |
| the_wrong_fare | committed | no build | 1440 | 74% | 0% | 0.69 | 0.3% | - | - | 4.0 |
| the_wrong_fare | committed | **built** | 1440 | 81% | 0% | 0.58 | 0.3% | 42% (1.5) | 0.43 / 1.25 | 4.0 |

## The counter: the same fights with every enemy a drone (at least 5), steady, best team

| Job | Team | Fights | Clean win | Someone left | Downs | A death | Fires (mean round) | Vector kills / defeats | Mean rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | no build | 1440 | 72% | 0% | 0.29 | 0.0% | - | - | 3.4 |
| data_pull | **built** | 1440 | 74% | 0% | 0.25 | 0.0% | 59% (2.0) | - | 3.4 |
| data_scrub | no build | 1440 | 71% | 0% | 0.18 | 0.0% | - | - | 3.4 |
| data_scrub | **built** | 1440 | 72% | 0% | 0.18 | 0.0% | 21% (2.0) | - | 3.4 |
| quiet_hours | no build | 1440 | 73% | 0% | 0.17 | 0.0% | - | - | 3.4 |
| quiet_hours | **built** | 1440 | 73% | 0% | 0.16 | 0.0% | 63% (2.0) | - | 3.4 |
| warehouse | no build | 1440 | 61% | 9% | 0.72 | 0.0% | - | - | 4.6 |
| warehouse | **built** | 1440 | 69% | 6% | 0.50 | 0.0% | 90% (1.3) | 0.02 / 2.41 | 4.6 |
| protection | no build | 1440 | 44% | 0% | 0.55 | 0.0% | - | - | 6.3 |
| protection | **built** | 1440 | 61% | 0% | 0.38 | 0.0% | 90% (1.4) | - | 6.3 |
| dead_air | no build | 1440 | 60% | 9% | 0.73 | 0.0% | - | - | 4.5 |
| dead_air | **built** | 1440 | 68% | 6% | 0.54 | 0.0% | 91% (1.3) | - | 4.5 |
| still_connected | no build | 1440 | 77% | 0% | 0.19 | 0.0% | - | - | 3.7 |
| still_connected | **built** | 1440 | 78% | 0% | 0.17 | 0.0% | 53% (1.7) | 0.00 / 1.32 | 3.7 |
| not_for_sale | no build | 1440 | 60% | 10% | 0.74 | 0.0% | - | - | 4.6 |
| not_for_sale | **built** | 1440 | 68% | 6% | 0.53 | 0.0% | 91% (1.3) | - | 4.6 |
| one_more_song | no build | 1440 | 76% | 0% | 0.15 | 0.0% | - | - | 3.5 |
| one_more_song | **built** | 1440 | 77% | 0% | 0.14 | 0.0% | 54% (2.0) | - | 3.5 |
| still_clocked_in | no build | 1440 | 69% | 0% | 0.30 | 0.0% | - | - | 3.5 |
| still_clocked_in | **built** | 1440 | 71% | 0% | 0.28 | 0.0% | 45% (2.0) | - | 3.5 |
| the_last_collection | no build | 1440 | 50% | 17% | 1.04 | 0.0% | - | - | 4.7 |
| the_last_collection | **built** | 1440 | 59% | 12% | 0.80 | 0.0% | 89% (1.3) | - | 4.7 |
| the_wrong_fare | no build | 1440 | 71% | 0% | 0.35 | 0.0% | - | - | 3.8 |
| the_wrong_fare | **built** | 1440 | 71% | 0% | 0.34 | 0.0% | 58% (2.0) | 0.01 / 1.45 | 3.8 |

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
