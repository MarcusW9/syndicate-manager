# The five jobs' fights with the roster at each job's gate (2026-11-17-fourteen)

`node scripts/sim-gate-teams.mjs 6 40 2026-11-17-fourteen`. Real fight code. 6 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 40 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | 5 | 6/6 | 7 | 5 / 7 / 10 | 6 / 9 / 10 | 5 / 6 / 8 |
| 15 | 8 | 6/6 | 8 | 5 / 8 / 10 | 6 / 9 / 10 | 5 / 6 / 8 |
| 35 | 16 | 6/6 | 10 | 6 / 8 / 11 | 7 / 9 / 10 | 5 / 6 / 8 |
| 60 | 39 | 6/6 | 12 | 6 / 9 / 10 | 8 / 9 / 11 | 5 / 6 / 8 |

## The fights

| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | 14 | steady | best of roster | 240 | 78% | 78% | 22% | 0% | 0.00 | 0.37 | 0.0% |
| data_pull | 14 | steady | first 3 | 240 | 27% | 27% | 73% | 0% | 0.00 | 0.84 | 0.0% |
| data_pull | 14 | committed | best of roster | 240 | 88% | 88% | 12% | 0% | 0.00 | 0.79 | 0.8% |
| data_pull | 14 | committed | first 3 | 240 | 73% | 73% | 28% | 0% | 0.00 | 1.52 | 4.6% |
| data_scrub | 11 | steady | best of roster | 240 | 90% | 90% | 10% | 0% | 0.00 | 0.15 | 0.0% |
| data_scrub | 11 | steady | first 2 | 240 | 55% | 55% | 45% | 0% | 0.00 | 0.54 | 0.0% |
| data_scrub | 11 | committed | best of roster | 240 | 94% | 94% | 6% | 0% | 0.00 | 0.23 | 0.0% |
| data_scrub | 11 | committed | first 2 | 240 | 74% | 74% | 26% | 0% | 0.00 | 0.79 | 1.3% |
| quiet_hours | 14 | steady | best of roster | 240 | 75% | 75% | 25% | 0% | 0.00 | 0.31 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 240 | 31% | 31% | 69% | 0% | 0.00 | 0.71 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 240 | 95% | 95% | 5% | 0% | 0.00 | 0.50 | 0.8% |
| quiet_hours | 14 | committed | first 3 | 240 | 79% | 79% | 21% | 0% | 0.00 | 1.37 | 7.5% |
| warehouse | 16 | steady | best of roster | 240 | 90% | 98% | 2% | 6% | 0.17 | 0.45 | 0.0% |
| warehouse | 16 | steady | first 4 | 240 | 48% | 91% | 9% | 32% | 0.95 | 1.49 | 0.0% |
| warehouse | 16 | committed | best of roster | 240 | 93% | 100% | 0% | 7% | 0.15 | 0.41 | 2.1% |
| warehouse | 16 | committed | first 4 | 240 | 61% | 100% | 0% | 38% | 0.99 | 1.45 | 8.3% |
| protection | 14 | steady | best of roster | 240 | 79% | 79% | 21% | 0% | 0.00 | 0.20 | 0.0% |
| protection | 14 | steady | first 3 | 240 | 29% | 29% | 71% | 0% | 0.00 | 0.72 | 0.0% |
| protection | 14 | committed | best of roster | 240 | 96% | 96% | 4% | 0% | 0.00 | 0.24 | 0.4% |
| protection | 14 | committed | first 3 | 240 | 60% | 60% | 40% | 0% | 0.00 | 1.52 | 13.8% |
| dead_air | 16 | steady | best of roster | 240 | 85% | 92% | 8% | 3% | 0.09 | 0.33 | 0.0% |
| dead_air | 16 | steady | first 4 | 240 | 49% | 84% | 16% | 20% | 0.60 | 1.06 | 0.0% |
| dead_air | 16 | committed | best of roster | 240 | 93% | 100% | 0% | 6% | 0.14 | 0.35 | 1.7% |
| dead_air | 16 | committed | first 4 | 240 | 63% | 100% | 0% | 35% | 0.94 | 1.43 | 10.4% |
| still_connected | 16 | steady | best of roster | 240 | 86% | 86% | 14% | 0% | 0.00 | 0.30 | 0.0% |
| still_connected | 16 | steady | first 4 | 240 | 45% | 45% | 55% | 0% | 0.00 | 0.71 | 0.0% |
| still_connected | 16 | committed | best of roster | 240 | 92% | 92% | 8% | 0% | 0.00 | 0.29 | 0.0% |
| still_connected | 16 | committed | first 4 | 240 | 55% | 55% | 45% | 0% | 0.00 | 1.04 | 0.4% |
| not_for_sale | 16 | steady | best of roster | 240 | 82% | 93% | 7% | 5% | 0.14 | 0.38 | 0.0% |
| not_for_sale | 16 | steady | first 4 | 240 | 49% | 83% | 17% | 21% | 0.63 | 1.07 | 0.0% |
| not_for_sale | 16 | committed | best of roster | 240 | 95% | 100% | 0% | 5% | 0.10 | 0.35 | 1.7% |
| not_for_sale | 16 | committed | first 4 | 240 | 64% | 100% | 0% | 33% | 0.91 | 1.45 | 12.5% |
| one_more_song | 14 | steady | best of roster | 240 | 85% | 85% | 15% | 0% | 0.00 | 0.28 | 0.0% |
| one_more_song | 14 | steady | first 3 | 240 | 27% | 27% | 73% | 0% | 0.00 | 0.85 | 0.0% |
| one_more_song | 14 | committed | best of roster | 240 | 90% | 90% | 10% | 0% | 0.00 | 0.45 | 0.0% |
| one_more_song | 14 | committed | first 3 | 240 | 53% | 53% | 47% | 0% | 0.00 | 1.57 | 1.7% |
| still_clocked_in | 14 | steady | best of roster | 240 | 73% | 73% | 28% | 0% | 0.00 | 0.45 | 0.0% |
| still_clocked_in | 14 | steady | first 3 | 240 | 11% | 11% | 89% | 0% | 0.00 | 1.10 | 0.0% |
| still_clocked_in | 14 | committed | best of roster | 240 | 77% | 77% | 23% | 0% | 0.00 | 0.84 | 0.0% |
| still_clocked_in | 14 | committed | first 3 | 240 | 25% | 25% | 75% | 0% | 0.00 | 2.00 | 2.9% |
| the_last_collection | 16 | steady | best of roster | 240 | 82% | 92% | 8% | 5% | 0.15 | 0.44 | 0.0% |
| the_last_collection | 16 | steady | first 4 | 240 | 39% | 80% | 20% | 30% | 0.86 | 1.32 | 0.0% |
| the_last_collection | 16 | committed | best of roster | 240 | 89% | 100% | 0% | 10% | 0.24 | 0.55 | 3.3% |
| the_last_collection | 16 | committed | first 4 | 240 | 60% | 100% | 0% | 39% | 1.07 | 1.55 | 10.4% |
| the_wrong_fare | 14 | steady | best of roster | 240 | 68% | 68% | 32% | 0% | 0.00 | 0.50 | 0.0% |
| the_wrong_fare | 14 | steady | first 4 | 240 | 15% | 15% | 85% | 0% | 0.00 | 1.00 | 0.0% |
| the_wrong_fare | 14 | committed | best of roster | 240 | 83% | 83% | 17% | 0% | 0.00 | 0.56 | 0.0% |
| the_wrong_fare | 14 | committed | first 4 | 240 | 26% | 26% | 74% | 0% | 0.00 | 1.54 | 1.3% |
| kidnap | 16 | steady | best of roster | 240 | 82% | 91% | 9% | 4% | 0.11 | 0.33 | 0.0% |
| kidnap | 16 | steady | first 4 | 240 | 49% | 81% | 19% | 20% | 0.58 | 1.04 | 0.0% |
| kidnap | 16 | committed | best of roster | 240 | 95% | 100% | 0% | 5% | 0.10 | 0.30 | 2.5% |
| kidnap | 16 | committed | first 4 | 240 | 70% | 100% | 0% | 30% | 0.86 | 1.37 | 8.3% |
| casino | 11 | steady | best of roster | 240 | 98% | 98% | 2% | 0% | 0.00 | 0.05 | 0.0% |
| casino | 11 | steady | first 3 | 240 | 64% | 64% | 36% | 0% | 0.00 | 0.21 | 0.0% |
| casino | 11 | committed | best of roster | 240 | 99% | 99% | 1% | 0% | 0.00 | 0.07 | 0.8% |
| casino | 11 | committed | first 3 | 240 | 98% | 98% | 3% | 0% | 0.00 | 0.44 | 0.8% |
| clinic | 6 | steady | best of roster | 240 | 100% | 100% | 0% | 0% | 0.00 | 0.00 | 0.0% |
| clinic | 6 | steady | first 2 | 240 | 87% | 87% | 13% | 0% | 0.00 | 0.12 | 0.0% |
| clinic | 6 | committed | best of roster | 240 | 100% | 100% | 0% | 0% | 0.00 | 0.01 | 0.0% |
| clinic | 6 | committed | first 2 | 240 | 97% | 97% | 3% | 0% | 0.00 | 0.13 | 2.1% |
| ledger | 6 | steady | best of roster | 240 | 98% | 100% | 0% | 0% | 0.00 | 0.01 | 0.0% |
| ledger | 6 | steady | first 2 | 240 | 82% | 96% | 4% | 5% | 0.08 | 0.13 | 0.0% |
| ledger | 6 | committed | best of roster | 240 | 100% | 100% | 0% | 0% | 0.00 | 0.01 | 0.0% |
| ledger | 6 | committed | first 2 | 240 | 95% | 100% | 0% | 4% | 0.08 | 0.16 | 1.7% |
| container409 | 6 | steady | best of roster | 240 | 99% | 100% | 0% | 0% | 0.00 | 0.00 | 0.0% |
| container409 | 6 | steady | first 2 | 240 | 84% | 96% | 4% | 2% | 0.03 | 0.08 | 0.0% |
| container409 | 6 | committed | best of roster | 240 | 100% | 100% | 0% | 0% | 0.00 | 0.01 | 0.0% |
| container409 | 6 | committed | first 2 | 240 | 98% | 100% | 0% | 1% | 0.02 | 0.13 | 1.3% |
| chrome | 6 | steady | best of roster | 240 | 96% | 96% | 4% | 0% | 0.00 | 0.02 | 0.0% |
| chrome | 6 | steady | first 2 | 240 | 76% | 76% | 24% | 0% | 0.00 | 0.20 | 0.0% |
| chrome | 6 | committed | best of roster | 240 | 100% | 100% | 0% | 0% | 0.00 | 0.08 | 0.4% |
| chrome | 6 | committed | first 2 | 240 | 95% | 95% | 5% | 0% | 0.00 | 0.36 | 1.7% |
| low_water | 14 | steady | best of roster | 240 | 82% | 93% | 7% | 8% | 0.18 | 0.39 | 0.0% |
| low_water | 14 | steady | first 3 | 240 | 34% | 60% | 40% | 17% | 0.33 | 0.90 | 0.0% |
| low_water | 14 | committed | best of roster | 240 | 89% | 100% | 0% | 10% | 0.23 | 0.42 | 5.4% |
| low_water | 14 | committed | first 3 | 240 | 52% | 100% | 0% | 46% | 1.15 | 1.70 | 17.5% |
| mooring_watch | 11 | steady | best of roster | 240 | 90% | 90% | 10% | 0% | 0.00 | 0.09 | 0.0% |
| mooring_watch | 11 | steady | first 2 | 240 | 60% | 60% | 40% | 0% | 0.00 | 0.35 | 0.0% |
| mooring_watch | 11 | committed | best of roster | 240 | 97% | 97% | 3% | 0% | 0.00 | 0.13 | 0.8% |
| mooring_watch | 11 | committed | first 2 | 240 | 67% | 67% | 33% | 0% | 0.00 | 0.77 | 8.3% |
| count_against_paper | 11 | steady | best of roster | 240 | 84% | 84% | 16% | 0% | 0.00 | 0.17 | 0.0% |
| count_against_paper | 11 | steady | first 2 | 240 | 51% | 51% | 49% | 0% | 0.00 | 0.45 | 0.0% |
| count_against_paper | 11 | committed | best of roster | 240 | 95% | 95% | 5% | 0% | 0.00 | 0.22 | 0.4% |
| count_against_paper | 11 | committed | first 2 | 240 | 78% | 78% | 22% | 0% | 0.00 | 0.73 | 1.3% |
| quarter_to_two | 11 | steady | best of roster | 240 | 95% | 99% | 1% | 0% | 0.01 | 0.04 | 0.0% |
| quarter_to_two | 11 | steady | first 3 | 240 | 63% | 87% | 13% | 4% | 0.07 | 0.26 | 0.0% |
| quarter_to_two | 11 | committed | best of roster | 240 | 100% | 100% | 0% | 0% | 0.01 | 0.03 | 0.0% |
| quarter_to_two | 11 | committed | first 3 | 240 | 95% | 100% | 0% | 4% | 0.11 | 0.34 | 2.1% |
| manual_handling | 11 | steady | best of roster | 240 | 95% | 99% | 1% | 0% | 0.00 | 0.02 | 0.0% |
| manual_handling | 11 | steady | first 3 | 240 | 61% | 87% | 13% | 5% | 0.10 | 0.30 | 0.0% |
| manual_handling | 11 | committed | best of roster | 240 | 98% | 100% | 0% | 2% | 0.03 | 0.07 | 0.0% |
| manual_handling | 11 | committed | first 3 | 240 | 91% | 100% | 0% | 8% | 0.19 | 0.38 | 4.2% |
| favourite | 11 | steady | best of roster | 240 | 97% | 97% | 3% | 0% | 0.00 | 0.03 | 0.0% |
| favourite | 11 | steady | first 3 | 240 | 83% | 83% | 17% | 0% | 0.00 | 0.17 | 0.0% |
| favourite | 11 | committed | best of roster | 240 | 100% | 100% | 0% | 0% | 0.00 | 0.03 | 0.0% |
| favourite | 11 | committed | first 3 | 240 | 94% | 94% | 6% | 0% | 0.00 | 0.40 | 3.3% |
| last_ticket | 11 | steady | best of roster | 240 | 96% | 99% | 1% | 0% | 0.01 | 0.03 | 0.0% |
| last_ticket | 11 | steady | first 3 | 240 | 64% | 91% | 9% | 4% | 0.10 | 0.26 | 0.0% |
| last_ticket | 11 | committed | best of roster | 240 | 99% | 100% | 0% | 1% | 0.02 | 0.07 | 0.4% |
| last_ticket | 11 | committed | first 3 | 240 | 95% | 100% | 0% | 5% | 0.13 | 0.32 | 1.3% |
| wrong_horse | 14 | steady | best of roster | 240 | 78% | 78% | 22% | 0% | 0.00 | 0.27 | 0.0% |
| wrong_horse | 14 | steady | first 3 | 240 | 30% | 30% | 70% | 0% | 0.00 | 0.73 | 0.0% |
| wrong_horse | 14 | committed | best of roster | 240 | 95% | 95% | 5% | 0% | 0.00 | 0.56 | 0.8% |
| wrong_horse | 14 | committed | first 3 | 240 | 71% | 71% | 29% | 0% | 0.00 | 1.57 | 7.9% |

## Against the declared targets (best team)

- data_pull: a death in 0.8% on committed (within 8%)
- data_scrub: a death in 0.0% on committed (within 8%)
- quiet_hours: a death in 0.8% on committed (within 8%)
- warehouse: left behind 6% on steady (within 15%)
- warehouse: a death in 2.1% on committed (within 8%)
- protection: a death in 0.4% on committed (within 8%)
- dead_air: left behind 3% on steady (within 15%)
- dead_air: a death in 1.7% on committed (within 8%)
- still_connected: a death in 0.0% on committed (within 8%)
- not_for_sale: left behind 5% on steady (within 15%)
- not_for_sale: a death in 1.7% on committed (within 8%)
- one_more_song: a death in 0.0% on committed (within 8%)
- still_clocked_in: a death in 0.0% on committed (within 8%)
- the_last_collection: left behind 5% on steady (within 15%)
- the_last_collection: a death in 3.3% on committed (within 8%)
- the_wrong_fare: a death in 0.0% on committed (within 8%)
- kidnap: left behind 4% on steady (within 15%)
- kidnap: a death in 2.5% on committed (within 8%)
- casino: a death in 0.8% on committed (within 8%)
- clinic: a death in 0.0% on committed (within 8%)
- ledger: left behind 0% on steady (within 15%)
- ledger: a death in 0.0% on committed (within 8%)
- container409: left behind 0% on steady (within 15%)
- container409: a death in 0.0% on committed (within 8%)
- chrome: a death in 0.4% on committed (within 8%)
- low_water: left behind 8% on steady (within 15%)
- low_water: a death in 5.4% on committed (within 8%)
- mooring_watch: a death in 0.8% on committed (within 8%)
- count_against_paper: a death in 0.4% on committed (within 8%)
- quarter_to_two: left behind 0% on steady (within 15%)
- quarter_to_two: a death in 0.0% on committed (within 8%)
- manual_handling: left behind 0% on steady (within 15%)
- manual_handling: a death in 0.0% on committed (within 8%)
- favourite: a death in 0.0% on committed (within 8%)
- last_ticket: left behind 0% on steady (within 15%)
- last_ticket: a death in 0.4% on committed (within 8%)
- wrong_horse: a death in 0.8% on committed (within 8%)

## Builds: the best team with and without the given build (Ricochet and the Cytotoxic Vector on the best combat runner)

Same teams, same seeds; each pair differs only by the build. "Fires" is the share of fights where Ricochet fired, with the median-ish mean round; "Vector kills" is defeats by the tick a fight (of all defeats).

| Job | Risk | Team | Fights | Clean win | Someone left | Downs | A death | Fires (mean round) | Vector kills / defeats | Mean rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | steady | no build | 240 | 78% | 0% | 0.37 | 0.0% | - | - | 3.7 |
| data_pull | steady | **built** | 240 | 82% | 0% | 0.30 | 0.0% | 75% (1.5) | 0.42 / 1.32 | 3.8 |
| data_pull | committed | no build | 240 | 88% | 0% | 0.79 | 0.8% | - | - | 4.1 |
| data_pull | committed | **built** | 240 | 92% | 0% | 0.59 | 0.8% | 87% (1.6) | 0.67 / 1.67 | 4.1 |
| data_scrub | steady | no build | 240 | 90% | 0% | 0.15 | 0.0% | - | - | 3.9 |
| data_scrub | steady | **built** | 240 | 91% | 0% | 0.15 | 0.0% | 23% (1.9) | 0.04 / 0.20 | 3.9 |
| data_scrub | committed | no build | 240 | 94% | 0% | 0.23 | 0.0% | - | - | 4.1 |
| data_scrub | committed | **built** | 240 | 95% | 0% | 0.22 | 0.0% | 23% (1.9) | 0.07 / 0.24 | 4.1 |
| quiet_hours | steady | no build | 240 | 75% | 0% | 0.31 | 0.0% | - | - | 3.7 |
| quiet_hours | steady | **built** | 240 | 78% | 0% | 0.25 | 0.0% | 33% (1.8) | 0.10 / 0.92 | 3.7 |
| quiet_hours | committed | no build | 240 | 95% | 0% | 0.50 | 0.8% | - | - | 4.0 |
| quiet_hours | committed | **built** | 240 | 98% | 0% | 0.43 | 0.0% | 40% (2.0) | 0.15 / 1.08 | 4.0 |
| warehouse | steady | no build | 240 | 90% | 6% | 0.45 | 0.0% | - | - | 5.3 |
| warehouse | steady | **built** | 240 | 94% | 1% | 0.19 | 0.0% | 100% (1.0) | 0.10 / 2.07 | 5.1 |
| warehouse | committed | no build | 240 | 93% | 7% | 0.41 | 2.1% | - | - | 5.3 |
| warehouse | committed | **built** | 240 | 98% | 1% | 0.21 | 1.3% | 100% (1.0) | 0.09 / 2.08 | 5.1 |
| protection | steady | no build | 240 | 79% | 0% | 0.20 | 0.0% | - | - | 4.0 |
| protection | steady | **built** | 240 | 97% | 0% | 0.04 | 0.0% | 100% (1.0) | 0.24 / 3.37 | 2.6 |
| protection | committed | no build | 240 | 96% | 0% | 0.24 | 0.4% | - | - | 4.4 |
| protection | committed | **built** | 240 | 100% | 0% | 0.05 | 0.0% | 100% (1.0) | 0.21 / 3.38 | 2.5 |
| dead_air | steady | no build | 240 | 85% | 3% | 0.33 | 0.0% | - | - | 4.8 |
| dead_air | steady | **built** | 240 | 91% | 0% | 0.09 | 0.0% | 100% (1.0) | 0.23 / 3.04 | 4.8 |
| dead_air | committed | no build | 240 | 93% | 6% | 0.35 | 1.7% | - | - | 5.1 |
| dead_air | committed | **built** | 240 | 98% | 2% | 0.12 | 0.8% | 100% (1.0) | 0.29 / 3.07 | 5.0 |
| still_connected | steady | no build | 240 | 86% | 0% | 0.30 | 0.0% | - | - | 3.9 |
| still_connected | steady | **built** | 240 | 83% | 0% | 0.29 | 0.0% | 67% (1.0) | 0.07 / 1.27 | 3.8 |
| still_connected | committed | no build | 240 | 92% | 0% | 0.29 | 0.0% | - | - | 4.0 |
| still_connected | committed | **built** | 240 | 91% | 0% | 0.35 | 0.4% | 67% (1.0) | 0.08 / 1.32 | 4.0 |
| not_for_sale | steady | no build | 240 | 82% | 5% | 0.38 | 0.0% | - | - | 4.9 |
| not_for_sale | steady | **built** | 240 | 92% | 0% | 0.09 | 0.0% | 100% (1.0) | 0.28 / 3.03 | 4.9 |
| not_for_sale | committed | no build | 240 | 95% | 5% | 0.35 | 1.7% | - | - | 5.1 |
| not_for_sale | committed | **built** | 240 | 100% | 0% | 0.10 | 0.0% | 100% (1.0) | 0.23 / 3.06 | 5.0 |
| one_more_song | steady | no build | 240 | 85% | 0% | 0.28 | 0.0% | - | - | 3.9 |
| one_more_song | steady | **built** | 240 | 87% | 0% | 0.25 | 0.0% | 45% (1.7) | 0.04 / 0.66 | 3.9 |
| one_more_song | committed | no build | 240 | 90% | 0% | 0.45 | 0.0% | - | - | 4.0 |
| one_more_song | committed | **built** | 240 | 92% | 0% | 0.38 | 0.0% | 40% (1.6) | 0.05 / 0.58 | 4.0 |
| still_clocked_in | steady | no build | 240 | 73% | 0% | 0.45 | 0.0% | - | - | 3.7 |
| still_clocked_in | steady | **built** | 240 | 75% | 0% | 0.42 | 0.0% | 44% (1.6) | 0.09 / 0.43 | 3.8 |
| still_clocked_in | committed | no build | 240 | 77% | 0% | 0.84 | 0.0% | - | - | 4.0 |
| still_clocked_in | committed | **built** | 240 | 80% | 0% | 0.75 | 0.0% | 38% (1.4) | 0.12 / 0.35 | 4.0 |
| the_last_collection | steady | no build | 240 | 82% | 5% | 0.44 | 0.0% | - | - | 4.9 |
| the_last_collection | steady | **built** | 240 | 90% | 1% | 0.19 | 0.0% | 100% (1.0) | 0.22 / 3.00 | 4.8 |
| the_last_collection | committed | no build | 240 | 89% | 10% | 0.55 | 3.3% | - | - | 5.2 |
| the_last_collection | committed | **built** | 240 | 97% | 3% | 0.20 | 2.1% | 100% (1.0) | 0.23 / 2.98 | 5.0 |
| the_wrong_fare | steady | no build | 240 | 68% | 0% | 0.50 | 0.0% | - | - | 3.8 |
| the_wrong_fare | steady | **built** | 240 | 68% | 0% | 0.45 | 0.0% | 100% (1.0) | 0.21 / 2.03 | 3.7 |
| the_wrong_fare | committed | no build | 240 | 83% | 0% | 0.56 | 0.0% | - | - | 4.0 |
| the_wrong_fare | committed | **built** | 240 | 79% | 0% | 0.58 | 0.0% | 100% (1.0) | 0.13 / 2.17 | 4.0 |
| kidnap | steady | no build | 240 | 82% | 4% | 0.33 | 0.0% | - | - | 4.8 |
| kidnap | steady | **built** | 240 | 93% | 0% | 0.10 | 0.0% | 100% (1.0) | 0.24 / 3.13 | 4.9 |
| kidnap | committed | no build | 240 | 95% | 5% | 0.30 | 2.5% | - | - | 5.1 |
| kidnap | committed | **built** | 240 | 99% | 1% | 0.13 | 0.4% | 100% (1.0) | 0.28 / 3.16 | 5.0 |
| casino | steady | no build | 240 | 98% | 0% | 0.05 | 0.0% | - | - | 4.0 |
| casino | steady | **built** | 240 | 99% | 0% | 0.02 | 0.0% | 60% (1.6) | 0.10 / 1.66 | 4.0 |
| casino | committed | no build | 240 | 99% | 0% | 0.07 | 0.8% | - | - | 4.0 |
| casino | committed | **built** | 240 | 100% | 0% | 0.05 | 0.4% | 67% (1.9) | 0.09 / 1.81 | 4.0 |
| clinic | steady | no build | 240 | 100% | 0% | 0.00 | 0.0% | - | - | 2.9 |
| clinic | steady | **built** | 240 | 100% | 0% | 0.00 | 0.0% | 100% (1.0) | 0.05 / 2.02 | 1.4 |
| clinic | committed | no build | 240 | 100% | 0% | 0.01 | 0.0% | - | - | 2.9 |
| clinic | committed | **built** | 240 | 100% | 0% | 0.00 | 0.0% | 100% (1.0) | 0.08 / 2.01 | 1.4 |
| ledger | steady | no build | 240 | 98% | 0% | 0.01 | 0.0% | - | - | 4.2 |
| ledger | steady | **built** | 240 | 97% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.10 / 2.69 | 4.0 |
| ledger | committed | no build | 240 | 100% | 0% | 0.01 | 0.0% | - | - | 4.3 |
| ledger | committed | **built** | 240 | 100% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.09 / 2.72 | 4.1 |
| container409 | steady | no build | 240 | 99% | 0% | 0.00 | 0.0% | - | - | 4.3 |
| container409 | steady | **built** | 240 | 100% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.07 / 2.74 | 4.0 |
| container409 | committed | no build | 240 | 100% | 0% | 0.01 | 0.0% | - | - | 4.3 |
| container409 | committed | **built** | 240 | 100% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.10 / 2.70 | 4.1 |
| chrome | steady | no build | 240 | 96% | 0% | 0.02 | 0.0% | - | - | 4.0 |
| chrome | steady | **built** | 240 | 96% | 0% | 0.02 | 0.0% | 36% (2.1) | 0.10 / 0.88 | 4.0 |
| chrome | committed | no build | 240 | 100% | 0% | 0.08 | 0.4% | - | - | 4.0 |
| chrome | committed | **built** | 240 | 100% | 0% | 0.07 | 0.4% | 47% (2.2) | 0.14 / 1.11 | 4.0 |
| low_water | steady | no build | 240 | 82% | 8% | 0.39 | 0.0% | - | - | 4.4 |
| low_water | steady | **built** | 240 | 89% | 0% | 0.09 | 0.0% | 100% (1.0) | 0.30 / 3.11 | 4.1 |
| low_water | committed | no build | 240 | 89% | 10% | 0.42 | 5.4% | - | - | 4.6 |
| low_water | committed | **built** | 240 | 99% | 1% | 0.10 | 0.4% | 100% (1.0) | 0.32 / 3.15 | 4.3 |
| mooring_watch | steady | no build | 240 | 90% | 0% | 0.09 | 0.0% | - | - | 3.4 |
| mooring_watch | steady | **built** | 240 | 98% | 0% | 0.02 | 0.0% | 100% (1.0) | 0.13 / 2.28 | 2.1 |
| mooring_watch | committed | no build | 240 | 97% | 0% | 0.13 | 0.8% | - | - | 3.9 |
| mooring_watch | committed | **built** | 240 | 100% | 0% | 0.04 | 0.4% | 100% (1.0) | 0.15 / 2.33 | 2.1 |
| count_against_paper | steady | no build | 240 | 84% | 0% | 0.17 | 0.0% | - | - | 3.8 |
| count_against_paper | steady | **built** | 240 | 85% | 0% | 0.17 | 0.0% | 38% (2.2) | 0.12 / 0.67 | 3.8 |
| count_against_paper | committed | no build | 240 | 95% | 0% | 0.22 | 0.4% | - | - | 4.0 |
| count_against_paper | committed | **built** | 240 | 96% | 0% | 0.19 | 0.4% | 40% (2.4) | 0.14 / 0.78 | 4.0 |
| quarter_to_two | steady | no build | 240 | 95% | 0% | 0.04 | 0.0% | - | - | 4.1 |
| quarter_to_two | steady | **built** | 240 | 97% | 0% | 0.02 | 0.0% | 95% (1.0) | 0.11 / 2.57 | 4.2 |
| quarter_to_two | committed | no build | 240 | 100% | 0% | 0.03 | 0.0% | - | - | 4.2 |
| quarter_to_two | committed | **built** | 240 | 100% | 0% | 0.00 | 0.0% | 99% (1.0) | 0.13 / 2.56 | 4.2 |
| manual_handling | steady | no build | 240 | 95% | 0% | 0.02 | 0.0% | - | - | 4.1 |
| manual_handling | steady | **built** | 240 | 95% | 0% | 0.02 | 0.0% | 98% (1.0) | 0.10 / 2.52 | 4.2 |
| manual_handling | committed | no build | 240 | 98% | 2% | 0.07 | 0.0% | - | - | 4.3 |
| manual_handling | committed | **built** | 240 | 100% | 0% | 0.02 | 0.0% | 96% (1.0) | 0.09 / 2.55 | 4.2 |
| favourite | steady | no build | 240 | 97% | 0% | 0.03 | 0.0% | - | - | 3.0 |
| favourite | steady | **built** | 240 | 98% | 0% | 0.03 | 0.0% | 95% (1.0) | 0.12 / 2.37 | 2.1 |
| favourite | committed | no build | 240 | 100% | 0% | 0.03 | 0.0% | - | - | 3.2 |
| favourite | committed | **built** | 240 | 100% | 0% | 0.02 | 0.0% | 98% (1.1) | 0.10 / 2.43 | 2.2 |
| last_ticket | steady | no build | 240 | 96% | 0% | 0.03 | 0.0% | - | - | 4.2 |
| last_ticket | steady | **built** | 240 | 96% | 0% | 0.02 | 0.0% | 96% (1.0) | 0.11 / 2.53 | 4.2 |
| last_ticket | committed | no build | 240 | 99% | 1% | 0.07 | 0.4% | - | - | 4.2 |
| last_ticket | committed | **built** | 240 | 100% | 0% | 0.02 | 0.0% | 98% (1.0) | 0.10 / 2.53 | 4.2 |
| wrong_horse | steady | no build | 240 | 78% | 0% | 0.27 | 0.0% | - | - | 3.7 |
| wrong_horse | steady | **built** | 240 | 79% | 0% | 0.25 | 0.0% | 37% (1.7) | 0.13 / 1.02 | 3.7 |
| wrong_horse | committed | no build | 240 | 95% | 0% | 0.56 | 0.8% | - | - | 4.0 |
| wrong_horse | committed | **built** | 240 | 97% | 0% | 0.47 | 1.7% | 33% (2.2) | 0.11 / 1.10 | 4.0 |

## The counter: the same fights with every enemy a drone (at least 5), steady, best team

| Job | Team | Fights | Clean win | Someone left | Downs | A death | Fires (mean round) | Vector kills / defeats | Mean rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | no build | 240 | 69% | 0% | 0.17 | 0.0% | - | - | 3.4 |
| data_pull | **built** | 240 | 70% | 0% | 0.19 | 0.0% | 92% (2.0) | - | 3.5 |
| data_scrub | no build | 240 | 70% | 0% | 0.15 | 0.0% | - | - | 3.5 |
| data_scrub | **built** | 240 | 71% | 0% | 0.15 | 0.0% | 32% (2.0) | - | 3.5 |
| quiet_hours | no build | 240 | 58% | 0% | 0.17 | 0.0% | - | - | 3.2 |
| quiet_hours | **built** | 240 | 60% | 0% | 0.17 | 0.0% | 72% (2.0) | - | 3.2 |
| warehouse | no build | 240 | 63% | 8% | 0.73 | 0.0% | - | - | 4.5 |
| warehouse | **built** | 240 | 73% | 4% | 0.52 | 0.0% | 100% (1.0) | - | 4.6 |
| protection | no build | 240 | 43% | 0% | 0.51 | 0.0% | - | - | 5.7 |
| protection | **built** | 240 | 73% | 0% | 0.24 | 0.0% | 100% (1.0) | - | 5.9 |
| dead_air | no build | 240 | 65% | 8% | 0.68 | 0.0% | - | - | 4.5 |
| dead_air | **built** | 240 | 72% | 3% | 0.40 | 0.0% | 100% (1.0) | - | 4.5 |
| still_connected | no build | 240 | 91% | 0% | 0.14 | 0.0% | - | - | 3.9 |
| still_connected | **built** | 240 | 82% | 0% | 0.19 | 0.0% | 67% (1.0) | - | 3.8 |
| not_for_sale | no build | 240 | 65% | 4% | 0.60 | 0.0% | - | - | 4.3 |
| not_for_sale | **built** | 240 | 73% | 4% | 0.44 | 0.0% | 100% (1.0) | - | 4.5 |
| one_more_song | no build | 240 | 74% | 0% | 0.14 | 0.0% | - | - | 3.6 |
| one_more_song | **built** | 240 | 75% | 0% | 0.10 | 0.0% | 77% (2.0) | - | 3.6 |
| still_clocked_in | no build | 240 | 78% | 0% | 0.23 | 0.0% | - | - | 3.7 |
| still_clocked_in | **built** | 240 | 81% | 0% | 0.21 | 0.0% | 78% (2.0) | - | 3.7 |
| the_last_collection | no build | 240 | 57% | 8% | 0.86 | 0.0% | - | - | 4.2 |
| the_last_collection | **built** | 240 | 67% | 7% | 0.68 | 0.0% | 100% (1.0) | - | 4.5 |
| the_wrong_fare | no build | 240 | 72% | 0% | 0.25 | 0.0% | - | - | 3.6 |
| the_wrong_fare | **built** | 240 | 57% | 0% | 0.37 | 0.0% | 100% (1.0) | - | 3.4 |
| kidnap | no build | 240 | 66% | 8% | 0.68 | 0.0% | - | - | 4.5 |
| kidnap | **built** | 240 | 78% | 4% | 0.42 | 0.0% | 100% (1.0) | - | 4.7 |
| casino | no build | 240 | 67% | 0% | 0.15 | 0.0% | - | - | 3.4 |
| casino | **built** | 240 | 70% | 0% | 0.14 | 0.0% | 88% (2.0) | - | 3.4 |
| clinic | no build | 240 | 76% | 0% | 0.13 | 0.0% | - | - | 8.9 |
| clinic | **built** | 240 | 94% | 0% | 0.03 | 0.0% | 100% (1.0) | - | 5.8 |
| ledger | no build | 240 | 92% | 0% | 0.05 | 0.0% | - | - | 4.7 |
| ledger | **built** | 240 | 91% | 0% | 0.11 | 0.0% | 100% (1.0) | - | 4.2 |
| container409 | no build | 240 | 91% | 1% | 0.09 | 0.0% | - | - | 4.7 |
| container409 | **built** | 240 | 91% | 0% | 0.10 | 0.0% | 100% (1.0) | - | 4.2 |
| chrome | no build | 240 | 92% | 0% | 0.01 | 0.0% | - | - | 3.9 |
| chrome | **built** | 240 | 92% | 0% | 0.01 | 0.0% | 65% (2.0) | - | 3.9 |
| low_water | no build | 240 | 62% | 7% | 0.59 | 0.0% | - | - | 4.0 |
| low_water | **built** | 240 | 63% | 5% | 0.47 | 0.0% | 100% (1.0) | - | 3.9 |
| mooring_watch | no build | 240 | 26% | 0% | 0.59 | 0.0% | - | - | 6.1 |
| mooring_watch | **built** | 240 | 51% | 0% | 0.34 | 0.0% | 100% (1.0) | - | 6.2 |
| count_against_paper | no build | 240 | 57% | 0% | 0.18 | 0.0% | - | - | 3.3 |
| count_against_paper | **built** | 240 | 60% | 0% | 0.17 | 0.0% | 59% (2.0) | - | 3.3 |
| quarter_to_two | no build | 240 | 65% | 7% | 0.41 | 0.0% | - | - | 4.4 |
| quarter_to_two | **built** | 240 | 79% | 2% | 0.23 | 0.0% | 100% (1.0) | - | 4.4 |
| manual_handling | no build | 240 | 72% | 5% | 0.38 | 0.0% | - | - | 4.3 |
| manual_handling | **built** | 240 | 79% | 3% | 0.22 | 0.0% | 100% (1.0) | - | 4.5 |
| favourite | no build | 240 | 62% | 0% | 0.38 | 0.0% | - | - | 6.5 |
| favourite | **built** | 240 | 83% | 0% | 0.17 | 0.0% | 100% (1.0) | - | 5.9 |
| last_ticket | no build | 240 | 68% | 6% | 0.42 | 0.0% | - | - | 4.2 |
| last_ticket | **built** | 240 | 82% | 2% | 0.20 | 0.0% | 100% (1.0) | - | 4.4 |
| wrong_horse | no build | 240 | 59% | 0% | 0.16 | 0.0% | - | - | 3.1 |
| wrong_horse | **built** | 240 | 59% | 0% | 0.17 | 0.0% | 73% (2.0) | - | 3.1 |

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
