# The five jobs' fights with the roster at each job's gate (2026-11-19-soak)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-19-soak`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | 5 | 24/24 | 7 | 5 / 7 / 10 | 6 / 8 / 9 | 4 / 6 / 8 |
| 15 | 9 | 24/24 | 8 | 5 / 7 / 10 | 7 / 8 / 10 | 4 / 6 / 8 |
| 35 | 16 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 34 | 23/24 | 11 | 6 / 8 / 10 | 8 / 9 / 11 | 5 / 6 / 8 |

## The fights

| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | 14 | steady | best of roster | 2400 | 2% | 2% | 98% | 0% | 0.00 | 1.02 | 0.0% |
| data_pull | 14 | steady | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.10 | 0.0% |
| data_pull | 14 | committed | best of roster | 2400 | 10% | 10% | 90% | 0% | 0.00 | 2.74 | 11.7% |
| data_pull | 14 | committed | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 2.91 | 11.6% |
| data_scrub | 11 | steady | best of roster | 2400 | 22% | 22% | 79% | 0% | 0.00 | 0.77 | 0.0% |
| data_scrub | 11 | steady | first 2 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.01 | 0.0% |
| data_scrub | 11 | committed | best of roster | 2400 | 34% | 34% | 66% | 0% | 0.00 | 1.39 | 6.1% |
| data_scrub | 11 | committed | first 2 | 2400 | 2% | 2% | 98% | 0% | 0.00 | 1.93 | 3.7% |
| quiet_hours | 14 | steady | best of roster | 2400 | 21% | 21% | 79% | 0% | 0.00 | 0.79 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 2400 | 3% | 3% | 97% | 0% | 0.00 | 1.00 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 2400 | 41% | 41% | 59% | 0% | 0.00 | 2.00 | 11.2% |
| quiet_hours | 14 | committed | first 3 | 2400 | 9% | 9% | 91% | 0% | 0.00 | 2.75 | 13.1% |
| warehouse | 16 | steady | best of roster | 2300 | 86% | 98% | 2% | 9% | 0.23 | 0.66 | 0.0% |
| warehouse | 16 | steady | first 4 | 2300 | 42% | 84% | 16% | 31% | 0.88 | 1.64 | 0.0% |
| warehouse | 16 | committed | best of roster | 2300 | 88% | 100% | 0% | 12% | 0.26 | 0.61 | 3.6% |
| warehouse | 16 | committed | first 4 | 2300 | 60% | 100% | 0% | 38% | 0.96 | 1.80 | 12.8% |
| protection | 14 | steady | best of roster | 2400 | 75% | 75% | 25% | 0% | 0.00 | 0.25 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 23% | 23% | 77% | 0% | 0.00 | 0.79 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 89% | 89% | 11% | 0% | 0.00 | 0.49 | 2.5% |
| protection | 14 | committed | first 3 | 2400 | 42% | 42% | 59% | 0% | 0.00 | 2.00 | 19.9% |
| dead_air | 16 | steady | best of roster | 2300 | 74% | 93% | 7% | 12% | 0.32 | 0.77 | 0.0% |
| dead_air | 16 | steady | first 4 | 2300 | 32% | 71% | 29% | 29% | 0.81 | 1.63 | 0.0% |
| dead_air | 16 | committed | best of roster | 2300 | 83% | 100% | 0% | 16% | 0.37 | 0.84 | 5.8% |
| dead_air | 16 | committed | first 4 | 2300 | 49% | 100% | 0% | 48% | 1.30 | 2.22 | 17.3% |
| still_connected | 16 | steady | best of roster | 2300 | 0% | 0% | 100% | 0% | 0.00 | 1.09 | 0.0% |
| still_connected | 16 | steady | first 4 | 2300 | 0% | 0% | 100% | 0% | 0.00 | 1.10 | 0.0% |
| still_connected | 16 | committed | best of roster | 2300 | 0% | 0% | 100% | 0% | 0.00 | 3.76 | 13.4% |
| still_connected | 16 | committed | first 4 | 2300 | 0% | 0% | 100% | 0% | 0.00 | 3.09 | 9.3% |
| not_for_sale | 16 | steady | best of roster | 2300 | 75% | 93% | 7% | 11% | 0.29 | 0.73 | 0.0% |
| not_for_sale | 16 | steady | first 4 | 2300 | 32% | 72% | 28% | 29% | 0.83 | 1.64 | 0.0% |
| not_for_sale | 16 | committed | best of roster | 2300 | 83% | 100% | 0% | 16% | 0.37 | 0.83 | 5.3% |
| not_for_sale | 16 | committed | first 4 | 2300 | 51% | 100% | 0% | 48% | 1.31 | 2.20 | 15.7% |
| one_more_song | 14 | steady | best of roster | 2400 | 4% | 4% | 96% | 0% | 0.00 | 0.98 | 0.0% |
| one_more_song | 14 | steady | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.10 | 0.0% |
| one_more_song | 14 | committed | best of roster | 2400 | 12% | 12% | 88% | 0% | 0.00 | 2.65 | 9.1% |
| one_more_song | 14 | committed | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 2.83 | 6.9% |
| still_clocked_in | 14 | steady | best of roster | 2400 | 1% | 1% | 99% | 0% | 0.00 | 1.05 | 0.0% |
| still_clocked_in | 14 | steady | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.20 | 0.0% |
| still_clocked_in | 14 | committed | best of roster | 2400 | 3% | 3% | 97% | 0% | 0.00 | 2.76 | 6.2% |
| still_clocked_in | 14 | committed | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 2.67 | 5.3% |
| the_last_collection | 16 | steady | best of roster | 2300 | 71% | 95% | 5% | 17% | 0.49 | 0.98 | 0.0% |
| the_last_collection | 16 | steady | first 4 | 2300 | 28% | 73% | 27% | 35% | 1.02 | 1.77 | 0.0% |
| the_last_collection | 16 | committed | best of roster | 2300 | 78% | 100% | 0% | 21% | 0.50 | 0.99 | 7.3% |
| the_last_collection | 16 | committed | first 4 | 2300 | 42% | 100% | 0% | 55% | 1.53 | 2.40 | 19.7% |
| the_wrong_fare | 14 | steady | best of roster | 2400 | 1% | 1% | 99% | 0% | 0.00 | 1.07 | 0.0% |
| the_wrong_fare | 14 | steady | first 4 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.19 | 0.0% |
| the_wrong_fare | 14 | committed | best of roster | 2400 | 5% | 5% | 95% | 0% | 0.00 | 3.46 | 11.7% |
| the_wrong_fare | 14 | committed | first 4 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 2.78 | 6.7% |
| kidnap | 16 | steady | best of roster | 2300 | 72% | 92% | 8% | 12% | 0.31 | 0.79 | 0.0% |
| kidnap | 16 | steady | first 4 | 2300 | 34% | 74% | 26% | 29% | 0.83 | 1.60 | 0.0% |
| kidnap | 16 | committed | best of roster | 2300 | 83% | 100% | 0% | 16% | 0.37 | 0.85 | 5.2% |
| kidnap | 16 | committed | first 4 | 2300 | 52% | 100% | 0% | 46% | 1.24 | 2.16 | 16.9% |
| casino | 11 | steady | best of roster | 2400 | 85% | 85% | 15% | 0% | 0.00 | 0.15 | 0.0% |
| casino | 11 | steady | first 3 | 2400 | 46% | 46% | 54% | 0% | 0.00 | 0.53 | 0.0% |
| casino | 11 | committed | best of roster | 2400 | 96% | 96% | 4% | 0% | 0.00 | 0.24 | 2.6% |
| casino | 11 | committed | first 3 | 2400 | 67% | 67% | 33% | 0% | 0.00 | 1.20 | 12.5% |
| clinic | 6 | steady | best of roster | 2400 | 98% | 98% | 2% | 0% | 0.00 | 0.01 | 0.0% |
| clinic | 6 | steady | first 2 | 2400 | 76% | 76% | 24% | 0% | 0.00 | 0.19 | 0.0% |
| clinic | 6 | committed | best of roster | 2400 | 100% | 100% | 0% | 0% | 0.00 | 0.02 | 0.2% |
| clinic | 6 | committed | first 2 | 2400 | 91% | 91% | 9% | 0% | 0.00 | 0.29 | 4.5% |
| ledger | 6 | steady | best of roster | 2400 | 98% | 99% | 1% | 0% | 0.00 | 0.02 | 0.0% |
| ledger | 6 | steady | first 2 | 2400 | 78% | 94% | 6% | 4% | 0.05 | 0.17 | 0.0% |
| ledger | 6 | committed | best of roster | 2400 | 100% | 100% | 0% | 0% | 0.00 | 0.02 | 0.1% |
| ledger | 6 | committed | first 2 | 2400 | 94% | 100% | 0% | 5% | 0.10 | 0.26 | 1.8% |
| container409 | 6 | steady | best of roster | 2400 | 98% | 99% | 1% | 0% | 0.01 | 0.03 | 0.0% |
| container409 | 6 | steady | first 2 | 2400 | 79% | 94% | 6% | 3% | 0.04 | 0.15 | 0.0% |
| container409 | 6 | committed | best of roster | 2400 | 100% | 100% | 0% | 0% | 0.01 | 0.02 | 0.2% |
| container409 | 6 | committed | first 2 | 2400 | 94% | 100% | 0% | 5% | 0.09 | 0.22 | 1.9% |
| chrome | 6 | steady | best of roster | 2400 | 87% | 87% | 13% | 0% | 0.00 | 0.11 | 0.0% |
| chrome | 6 | steady | first 2 | 2400 | 42% | 42% | 58% | 0% | 0.00 | 0.45 | 0.0% |
| chrome | 6 | committed | best of roster | 2400 | 95% | 95% | 5% | 0% | 0.00 | 0.15 | 1.6% |
| chrome | 6 | committed | first 2 | 2400 | 63% | 63% | 37% | 0% | 0.00 | 0.84 | 8.0% |
| low_water | 14 | steady | best of roster | 2400 | 78% | 92% | 8% | 9% | 0.23 | 0.44 | 0.0% |
| low_water | 14 | steady | first 3 | 2400 | 38% | 65% | 35% | 19% | 0.45 | 1.07 | 0.0% |
| low_water | 14 | committed | best of roster | 2400 | 86% | 100% | 0% | 14% | 0.33 | 0.56 | 3.2% |
| low_water | 14 | committed | first 3 | 2400 | 55% | 100% | 0% | 43% | 1.06 | 1.67 | 16.5% |
| mooring_watch | 11 | steady | best of roster | 2400 | 87% | 87% | 13% | 0% | 0.00 | 0.12 | 0.0% |
| mooring_watch | 11 | steady | first 2 | 2400 | 38% | 38% | 62% | 0% | 0.00 | 0.58 | 0.0% |
| mooring_watch | 11 | committed | best of roster | 2400 | 93% | 93% | 7% | 0% | 0.00 | 0.19 | 1.4% |
| mooring_watch | 11 | committed | first 2 | 2400 | 59% | 59% | 41% | 0% | 0.00 | 0.97 | 10.3% |
| count_against_paper | 11 | steady | best of roster | 2400 | 52% | 52% | 48% | 0% | 0.00 | 0.46 | 0.0% |
| count_against_paper | 11 | steady | first 2 | 2400 | 11% | 11% | 89% | 0% | 0.00 | 0.83 | 0.0% |
| count_against_paper | 11 | committed | best of roster | 2400 | 67% | 67% | 33% | 0% | 0.00 | 0.76 | 4.3% |
| count_against_paper | 11 | committed | first 2 | 2400 | 21% | 21% | 79% | 0% | 0.00 | 1.64 | 7.1% |
| quarter_to_two | 11 | steady | best of roster | 2400 | 96% | 99% | 1% | 1% | 0.01 | 0.06 | 0.0% |
| quarter_to_two | 11 | steady | first 3 | 2400 | 73% | 90% | 10% | 4% | 0.09 | 0.35 | 0.0% |
| quarter_to_two | 11 | committed | best of roster | 2400 | 99% | 100% | 0% | 1% | 0.02 | 0.07 | 0.3% |
| quarter_to_two | 11 | committed | first 3 | 2400 | 94% | 100% | 0% | 5% | 0.11 | 0.42 | 2.5% |
| manual_handling | 11 | steady | best of roster | 2400 | 96% | 98% | 2% | 1% | 0.01 | 0.07 | 0.0% |
| manual_handling | 11 | steady | first 3 | 2400 | 74% | 90% | 10% | 3% | 0.07 | 0.32 | 0.0% |
| manual_handling | 11 | committed | best of roster | 2400 | 99% | 100% | 0% | 1% | 0.01 | 0.06 | 0.3% |
| manual_handling | 11 | committed | first 3 | 2400 | 93% | 100% | 0% | 6% | 0.13 | 0.41 | 3.1% |
| favourite | 11 | steady | best of roster | 2400 | 97% | 97% | 3% | 0% | 0.00 | 0.03 | 0.0% |
| favourite | 11 | steady | first 3 | 2400 | 74% | 74% | 26% | 0% | 0.00 | 0.26 | 0.0% |
| favourite | 11 | committed | best of roster | 2400 | 100% | 100% | 0% | 0% | 0.00 | 0.04 | 0.3% |
| favourite | 11 | committed | first 3 | 2400 | 93% | 93% | 7% | 0% | 0.00 | 0.47 | 7.8% |
| last_ticket | 11 | steady | best of roster | 2400 | 96% | 99% | 1% | 1% | 0.02 | 0.06 | 0.0% |
| last_ticket | 11 | steady | first 3 | 2400 | 74% | 91% | 9% | 3% | 0.07 | 0.32 | 0.0% |
| last_ticket | 11 | committed | best of roster | 2400 | 99% | 100% | 0% | 1% | 0.02 | 0.07 | 0.7% |
| last_ticket | 11 | committed | first 3 | 2400 | 94% | 100% | 0% | 5% | 0.12 | 0.39 | 2.5% |
| wrong_horse | 14 | steady | best of roster | 2400 | 20% | 20% | 80% | 0% | 0.00 | 0.81 | 0.0% |
| wrong_horse | 14 | steady | first 3 | 2400 | 3% | 3% | 97% | 0% | 0.00 | 1.00 | 0.0% |
| wrong_horse | 14 | committed | best of roster | 2400 | 41% | 41% | 59% | 0% | 0.00 | 1.99 | 11.3% |
| wrong_horse | 14 | committed | first 3 | 2400 | 9% | 9% | 91% | 0% | 0.00 | 2.75 | 14.0% |

## Against the declared targets (best team)

- data_pull: a death in 11.7% on committed (over 8%)
- data_scrub: a death in 6.1% on committed (within 8%)
- quiet_hours: a death in 11.2% on committed (over 8%)
- warehouse: left behind 9% on steady (within 15%)
- warehouse: a death in 3.6% on committed (within 8%)
- protection: a death in 2.5% on committed (within 8%)
- dead_air: left behind 12% on steady (within 15%)
- dead_air: a death in 5.8% on committed (within 8%)
- still_connected: a death in 13.4% on committed (over 8%)
- not_for_sale: left behind 11% on steady (within 15%)
- not_for_sale: a death in 5.3% on committed (within 8%)
- one_more_song: a death in 9.1% on committed (over 8%)
- still_clocked_in: a death in 6.2% on committed (within 8%)
- the_last_collection: left behind 17% on steady (over 15%)
- the_last_collection: a death in 7.3% on committed (within 8%)
- the_wrong_fare: a death in 11.7% on committed (over 8%)
- kidnap: left behind 12% on steady (within 15%)
- kidnap: a death in 5.2% on committed (within 8%)
- casino: a death in 2.6% on committed (within 8%)
- clinic: a death in 0.2% on committed (within 8%)
- ledger: left behind 0% on steady (within 15%)
- ledger: a death in 0.1% on committed (within 8%)
- container409: left behind 0% on steady (within 15%)
- container409: a death in 0.2% on committed (within 8%)
- chrome: a death in 1.6% on committed (within 8%)
- low_water: left behind 9% on steady (within 15%)
- low_water: a death in 3.2% on committed (within 8%)
- mooring_watch: a death in 1.4% on committed (within 8%)
- count_against_paper: a death in 4.3% on committed (within 8%)
- quarter_to_two: left behind 1% on steady (within 15%)
- quarter_to_two: a death in 0.3% on committed (within 8%)
- manual_handling: left behind 1% on steady (within 15%)
- manual_handling: a death in 0.3% on committed (within 8%)
- favourite: a death in 0.3% on committed (within 8%)
- last_ticket: left behind 1% on steady (within 15%)
- last_ticket: a death in 0.7% on committed (within 8%)
- wrong_horse: a death in 11.3% on committed (over 8%)

## Builds: the best team with and without the given build (Ricochet and the Cytotoxic Vector on the best combat runner)

Same teams, same seeds; each pair differs only by the build. "Fires" is the share of fights where Ricochet fired, with the median-ish mean round; "Vector kills" is defeats by the tick a fight (of all defeats).

| Job | Risk | Team | Fights | Clean win | Someone left | Downs | A death | Fires (mean round) | Vector kills / defeats | Mean rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | steady | no build | 2400 | 2% | 0% | 1.02 | 0.0% | - | - | 5.2 |
| data_pull | steady | **built** | 2400 | 10% | 0% | 0.92 | 0.0% | 80% (2.6) | 0.55 / 2.05 | 5.7 |
| data_pull | committed | no build | 2400 | 10% | 0% | 2.74 | 11.7% | - | - | 8.3 |
| data_pull | committed | **built** | 2400 | 31% | 0% | 2.29 | 11.0% | 92% (2.9) | 1.02 / 3.68 | 9.0 |
| data_scrub | steady | no build | 2400 | 22% | 0% | 0.77 | 0.0% | - | - | 7.7 |
| data_scrub | steady | **built** | 2400 | 33% | 0% | 0.65 | 0.0% | 88% (4.3) | 0.32 / 2.29 | 7.9 |
| data_scrub | committed | no build | 2400 | 34% | 0% | 1.39 | 6.1% | - | - | 10.2 |
| data_scrub | committed | **built** | 2400 | 50% | 0% | 1.12 | 4.8% | 96% (4.4) | 0.49 / 3.18 | 10.2 |
| quiet_hours | steady | no build | 2400 | 21% | 0% | 0.79 | 0.0% | - | - | 6.3 |
| quiet_hours | steady | **built** | 2400 | 43% | 0% | 0.57 | 0.0% | 82% (3.2) | 0.60 / 3.59 | 7.1 |
| quiet_hours | committed | no build | 2400 | 41% | 0% | 2.00 | 11.2% | - | - | 9.4 |
| quiet_hours | committed | **built** | 2400 | 68% | 0% | 1.23 | 8.1% | 94% (3.3) | 0.97 / 5.15 | 9.6 |
| warehouse | steady | no build | 2300 | 86% | 9% | 0.66 | 0.0% | - | - | 5.5 |
| warehouse | steady | **built** | 2300 | 92% | 2% | 0.25 | 0.0% | 100% (1.0) | 0.84 / 1.87 | 5.1 |
| warehouse | committed | no build | 2300 | 88% | 12% | 0.61 | 3.6% | - | - | 5.4 |
| warehouse | committed | **built** | 2300 | 96% | 4% | 0.24 | 1.0% | 100% (1.0) | 0.81 / 1.87 | 5.2 |
| protection | steady | no build | 2400 | 75% | 0% | 0.25 | 0.0% | - | - | 5.5 |
| protection | steady | **built** | 2400 | 90% | 0% | 0.10 | 0.0% | 100% (1.0) | 0.60 / 3.58 | 3.9 |
| protection | committed | no build | 2400 | 89% | 0% | 0.49 | 2.5% | - | - | 6.7 |
| protection | committed | **built** | 2400 | 99% | 0% | 0.13 | 0.6% | 100% (1.0) | 0.67 / 3.87 | 4.4 |
| dead_air | steady | no build | 2300 | 74% | 12% | 0.77 | 0.0% | - | - | 5.2 |
| dead_air | steady | **built** | 2300 | 83% | 1% | 0.19 | 0.0% | 100% (1.0) | 1.19 / 2.73 | 4.8 |
| dead_air | committed | no build | 2300 | 83% | 16% | 0.84 | 5.8% | - | - | 5.4 |
| dead_air | committed | **built** | 2300 | 97% | 2% | 0.23 | 1.2% | 100% (1.0) | 1.25 / 2.84 | 5.0 |
| still_connected | steady | no build | 2300 | 0% | 0% | 1.09 | 0.0% | - | - | 4.9 |
| still_connected | steady | **built** | 2300 | 1% | 0% | 1.08 | 0.0% | 88% (1.8) | 0.74 / 1.38 | 4.8 |
| still_connected | committed | no build | 2300 | 0% | 0% | 3.76 | 13.4% | - | - | 7.7 |
| still_connected | committed | **built** | 2300 | 7% | 0% | 3.54 | 16.7% | 93% (2.0) | 1.21 / 2.61 | 8.3 |
| not_for_sale | steady | no build | 2300 | 75% | 11% | 0.73 | 0.0% | - | - | 5.2 |
| not_for_sale | steady | **built** | 2300 | 84% | 1% | 0.19 | 0.0% | 100% (1.0) | 1.16 / 2.74 | 4.8 |
| not_for_sale | committed | no build | 2300 | 83% | 16% | 0.83 | 5.3% | - | - | 5.4 |
| not_for_sale | committed | **built** | 2300 | 97% | 2% | 0.22 | 1.0% | 100% (1.0) | 1.25 / 2.83 | 5.0 |
| one_more_song | steady | no build | 2400 | 4% | 0% | 0.98 | 0.0% | - | - | 5.5 |
| one_more_song | steady | **built** | 2400 | 12% | 0% | 0.89 | 0.0% | 74% (3.6) | 0.23 / 1.62 | 6.0 |
| one_more_song | committed | no build | 2400 | 12% | 0% | 2.65 | 9.1% | - | - | 8.5 |
| one_more_song | committed | **built** | 2400 | 26% | 0% | 2.34 | 9.8% | 93% (3.8) | 0.45 / 2.93 | 9.0 |
| still_clocked_in | steady | no build | 2400 | 1% | 0% | 1.05 | 0.0% | - | - | 4.8 |
| still_clocked_in | steady | **built** | 2400 | 4% | 0% | 1.00 | 0.0% | 65% (2.9) | 0.21 / 1.08 | 5.2 |
| still_clocked_in | committed | no build | 2400 | 3% | 0% | 2.76 | 6.2% | - | - | 7.0 |
| still_clocked_in | committed | **built** | 2400 | 8% | 0% | 2.64 | 7.5% | 88% (3.6) | 0.43 / 2.15 | 7.6 |
| the_last_collection | steady | no build | 2300 | 71% | 17% | 0.98 | 0.0% | - | - | 5.5 |
| the_last_collection | steady | **built** | 2300 | 83% | 3% | 0.23 | 0.0% | 100% (1.0) | 1.15 / 2.66 | 4.9 |
| the_last_collection | committed | no build | 2300 | 78% | 21% | 0.99 | 7.3% | - | - | 5.6 |
| the_last_collection | committed | **built** | 2300 | 95% | 4% | 0.27 | 1.4% | 100% (1.0) | 1.19 / 2.75 | 5.1 |
| the_wrong_fare | steady | no build | 2400 | 1% | 0% | 1.07 | 0.0% | - | - | 4.9 |
| the_wrong_fare | steady | **built** | 2400 | 9% | 0% | 0.99 | 0.0% | 76% (2.1) | 0.34 / 2.18 | 5.3 |
| the_wrong_fare | committed | no build | 2400 | 5% | 0% | 3.46 | 11.7% | - | - | 7.9 |
| the_wrong_fare | committed | **built** | 2400 | 19% | 0% | 2.91 | 12.3% | 87% (2.5) | 0.52 / 3.56 | 8.3 |
| kidnap | steady | no build | 2300 | 72% | 12% | 0.79 | 0.0% | - | - | 5.2 |
| kidnap | steady | **built** | 2300 | 83% | 1% | 0.20 | 0.0% | 100% (1.0) | 1.22 / 2.79 | 4.8 |
| kidnap | committed | no build | 2300 | 83% | 16% | 0.85 | 5.2% | - | - | 5.4 |
| kidnap | committed | **built** | 2300 | 98% | 1% | 0.21 | 0.7% | 100% (1.0) | 1.27 / 2.87 | 5.0 |
| casino | steady | no build | 2400 | 85% | 0% | 0.15 | 0.0% | - | - | 8.2 |
| casino | steady | **built** | 2400 | 91% | 0% | 0.08 | 0.0% | 94% (2.9) | 0.48 / 4.37 | 7.9 |
| casino | committed | no build | 2400 | 96% | 0% | 0.24 | 2.6% | - | - | 8.8 |
| casino | committed | **built** | 2400 | 99% | 0% | 0.12 | 1.4% | 98% (2.9) | 0.54 / 4.64 | 8.3 |
| clinic | steady | no build | 2400 | 98% | 0% | 0.01 | 0.0% | - | - | 4.2 |
| clinic | steady | **built** | 2400 | 99% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.24 / 2.27 | 2.1 |
| clinic | committed | no build | 2400 | 100% | 0% | 0.02 | 0.2% | - | - | 4.2 |
| clinic | committed | **built** | 2400 | 100% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.23 / 2.27 | 2.1 |
| ledger | steady | no build | 2400 | 98% | 0% | 0.02 | 0.0% | - | - | 4.4 |
| ledger | steady | **built** | 2400 | 98% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.28 / 2.41 | 4.2 |
| ledger | committed | no build | 2400 | 100% | 0% | 0.02 | 0.1% | - | - | 4.4 |
| ledger | committed | **built** | 2400 | 100% | 0% | 0.01 | 0.1% | 100% (1.0) | 0.28 / 2.41 | 4.2 |
| container409 | steady | no build | 2400 | 98% | 0% | 0.03 | 0.0% | - | - | 4.4 |
| container409 | steady | **built** | 2400 | 98% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.28 / 2.40 | 4.2 |
| container409 | committed | no build | 2400 | 100% | 0% | 0.02 | 0.2% | - | - | 4.4 |
| container409 | committed | **built** | 2400 | 100% | 0% | 0.02 | 0.3% | 100% (1.0) | 0.30 / 2.43 | 4.2 |
| chrome | steady | no build | 2400 | 87% | 0% | 0.11 | 0.0% | - | - | 8.5 |
| chrome | steady | **built** | 2400 | 93% | 0% | 0.06 | 0.0% | 96% (4.5) | 0.43 / 4.46 | 7.3 |
| chrome | committed | no build | 2400 | 95% | 0% | 0.15 | 1.6% | - | - | 9.1 |
| chrome | committed | **built** | 2400 | 99% | 0% | 0.07 | 1.2% | 99% (4.5) | 0.49 / 4.68 | 7.6 |
| low_water | steady | no build | 2400 | 78% | 9% | 0.44 | 0.0% | - | - | 4.6 |
| low_water | steady | **built** | 2400 | 87% | 1% | 0.13 | 0.0% | 100% (1.0) | 0.57 / 2.75 | 4.2 |
| low_water | committed | no build | 2400 | 86% | 14% | 0.56 | 3.2% | - | - | 4.9 |
| low_water | committed | **built** | 2400 | 97% | 2% | 0.17 | 1.1% | 100% (1.0) | 0.61 / 2.81 | 4.4 |
| mooring_watch | steady | no build | 2400 | 87% | 0% | 0.12 | 0.0% | - | - | 6.0 |
| mooring_watch | steady | **built** | 2400 | 95% | 0% | 0.05 | 0.0% | 100% (1.0) | 0.49 / 2.66 | 3.3 |
| mooring_watch | committed | no build | 2400 | 93% | 0% | 0.19 | 1.4% | - | - | 6.5 |
| mooring_watch | committed | **built** | 2400 | 99% | 0% | 0.05 | 1.2% | 100% (1.0) | 0.50 / 2.77 | 3.5 |
| count_against_paper | steady | no build | 2400 | 52% | 0% | 0.46 | 0.0% | - | - | 8.3 |
| count_against_paper | steady | **built** | 2400 | 69% | 0% | 0.29 | 0.0% | 89% (4.1) | 0.63 / 3.72 | 8.0 |
| count_against_paper | committed | no build | 2400 | 67% | 0% | 0.76 | 4.3% | - | - | 10.2 |
| count_against_paper | committed | **built** | 2400 | 85% | 0% | 0.41 | 2.5% | 96% (4.1) | 0.82 / 4.38 | 9.2 |
| quarter_to_two | steady | no build | 2400 | 96% | 1% | 0.06 | 0.0% | - | - | 4.4 |
| quarter_to_two | steady | **built** | 2400 | 97% | 0% | 0.03 | 0.0% | 97% (1.1) | 0.35 / 2.28 | 4.2 |
| quarter_to_two | committed | no build | 2400 | 99% | 1% | 0.07 | 0.3% | - | - | 4.5 |
| quarter_to_two | committed | **built** | 2400 | 100% | 0% | 0.03 | 0.1% | 96% (1.1) | 0.39 / 2.27 | 4.3 |
| manual_handling | steady | no build | 2400 | 96% | 1% | 0.07 | 0.0% | - | - | 4.4 |
| manual_handling | steady | **built** | 2400 | 96% | 0% | 0.04 | 0.0% | 97% (1.1) | 0.38 / 2.26 | 4.2 |
| manual_handling | committed | no build | 2400 | 99% | 1% | 0.06 | 0.3% | - | - | 4.4 |
| manual_handling | committed | **built** | 2400 | 100% | 0% | 0.04 | 0.2% | 97% (1.1) | 0.36 / 2.30 | 4.3 |
| favourite | steady | no build | 2400 | 97% | 0% | 0.03 | 0.0% | - | - | 4.4 |
| favourite | steady | **built** | 2400 | 98% | 0% | 0.02 | 0.0% | 97% (1.1) | 0.31 / 2.65 | 2.9 |
| favourite | committed | no build | 2400 | 100% | 0% | 0.04 | 0.3% | - | - | 4.5 |
| favourite | committed | **built** | 2400 | 100% | 0% | 0.02 | 0.0% | 98% (1.1) | 0.32 / 2.68 | 3.0 |
| last_ticket | steady | no build | 2400 | 96% | 1% | 0.06 | 0.0% | - | - | 4.4 |
| last_ticket | steady | **built** | 2400 | 97% | 0% | 0.02 | 0.0% | 97% (1.1) | 0.37 / 2.28 | 4.3 |
| last_ticket | committed | no build | 2400 | 99% | 1% | 0.07 | 0.7% | - | - | 4.5 |
| last_ticket | committed | **built** | 2400 | 100% | 0% | 0.03 | 0.0% | 97% (1.1) | 0.37 / 2.29 | 4.3 |
| wrong_horse | steady | no build | 2400 | 20% | 0% | 0.81 | 0.0% | - | - | 6.2 |
| wrong_horse | steady | **built** | 2400 | 42% | 0% | 0.58 | 0.0% | 82% (3.2) | 0.62 / 3.59 | 7.0 |
| wrong_horse | committed | no build | 2400 | 41% | 0% | 1.99 | 11.3% | - | - | 9.5 |
| wrong_horse | committed | **built** | 2400 | 68% | 0% | 1.22 | 7.6% | 95% (3.4) | 0.96 / 5.14 | 9.6 |

## The counter: the same fights with every enemy a drone (at least 5), steady, best team

| Job | Team | Fights | Clean win | Someone left | Downs | A death | Fires (mean round) | Vector kills / defeats | Mean rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | no build | 2400 | 0% | 0% | 0.97 | 0.0% | - | - | 5.1 |
| data_pull | **built** | 2400 | 2% | 0% | 0.95 | 0.0% | 90% (2.6) | 0.06 / 1.38 | 5.3 |
| data_scrub | no build | 2400 | 4% | 0% | 0.89 | 0.0% | - | - | 6.2 |
| data_scrub | **built** | 2400 | 6% | 0% | 0.86 | 0.0% | 81% (4.0) | 0.05 / 1.50 | 6.4 |
| quiet_hours | no build | 2400 | 2% | 0% | 0.93 | 0.0% | - | - | 5.5 |
| quiet_hours | **built** | 2400 | 7% | 0% | 0.89 | 0.0% | 93% (2.8) | 0.06 / 2.00 | 5.9 |
| warehouse | no build | 2300 | 76% | 8% | 0.63 | 0.0% | - | - | 5.1 |
| warehouse | **built** | 2300 | 83% | 4% | 0.44 | 0.0% | 100% (1.0) | 0.02 / 2.07 | 5.1 |
| protection | no build | 2400 | 56% | 0% | 0.43 | 0.0% | - | - | 8.0 |
| protection | **built** | 2400 | 67% | 0% | 0.31 | 0.0% | 100% (1.0) | 0.13 / 5.27 | 7.5 |
| dead_air | no build | 2300 | 74% | 8% | 0.63 | 0.0% | - | - | 5.0 |
| dead_air | **built** | 2300 | 80% | 4% | 0.44 | 0.0% | 100% (1.0) | 0.02 / 2.18 | 4.9 |
| still_connected | no build | 2300 | 0% | 0% | 1.07 | 0.0% | - | - | 5.2 |
| still_connected | **built** | 2300 | 0% | 0% | 1.05 | 0.0% | 92% (2.0) | 0.05 / 1.40 | 4.8 |
| not_for_sale | no build | 2300 | 75% | 7% | 0.62 | 0.0% | - | - | 5.0 |
| not_for_sale | **built** | 2300 | 82% | 4% | 0.44 | 0.0% | 100% (1.0) | 0.02 / 2.20 | 5.0 |
| one_more_song | no build | 2400 | 1% | 0% | 0.97 | 0.0% | - | - | 5.7 |
| one_more_song | **built** | 2400 | 5% | 0% | 0.93 | 0.0% | 90% (2.9) | 0.02 / 1.64 | 5.9 |
| still_clocked_in | no build | 2400 | 0% | 0% | 1.02 | 0.0% | - | - | 5.2 |
| still_clocked_in | **built** | 2400 | 2% | 0% | 1.00 | 0.0% | 77% (3.0) | 0.02 / 1.24 | 5.4 |
| the_last_collection | no build | 2300 | 69% | 14% | 0.89 | 0.0% | - | - | 5.3 |
| the_last_collection | **built** | 2300 | 78% | 9% | 0.64 | 0.0% | 100% (1.0) | 0.03 / 2.18 | 5.2 |
| the_wrong_fare | no build | 2400 | 1% | 0% | 1.04 | 0.0% | - | - | 5.3 |
| the_wrong_fare | **built** | 2400 | 5% | 0% | 1.00 | 0.0% | 81% (2.3) | 0.03 / 2.24 | 5.3 |
| kidnap | no build | 2300 | 76% | 7% | 0.57 | 0.0% | - | - | 5.0 |
| kidnap | **built** | 2300 | 81% | 4% | 0.45 | 0.0% | 100% (1.0) | 0.02 / 2.19 | 4.9 |
| casino | no build | 2400 | 24% | 0% | 0.73 | 0.0% | - | - | 7.4 |
| casino | **built** | 2400 | 37% | 0% | 0.60 | 0.0% | 96% (2.7) | 0.12 / 4.24 | 7.7 |
| clinic | no build | 2400 | 85% | 0% | 0.09 | 0.0% | - | - | 10.9 |
| clinic | **built** | 2400 | 91% | 0% | 0.07 | 0.0% | 100% (1.0) | 0.16 / 6.56 | 7.7 |
| ledger | no build | 2400 | 93% | 2% | 0.10 | 0.0% | - | - | 4.7 |
| ledger | **built** | 2400 | 92% | 1% | 0.11 | 0.0% | 100% (1.0) | 0.00 / 2.36 | 4.5 |
| container409 | no build | 2400 | 92% | 2% | 0.11 | 0.0% | - | - | 4.7 |
| container409 | **built** | 2400 | 92% | 1% | 0.10 | 0.0% | 100% (1.0) | - | 4.5 |
| chrome | no build | 2400 | 64% | 0% | 0.30 | 0.0% | - | - | 10.6 |
| chrome | **built** | 2400 | 73% | 0% | 0.21 | 0.0% | 95% (4.0) | 0.28 / 6.43 | 9.9 |
| low_water | no build | 2400 | 72% | 9% | 0.52 | 0.0% | - | - | 4.6 |
| low_water | **built** | 2400 | 72% | 6% | 0.43 | 0.0% | 100% (1.0) | 0.00 / 1.75 | 4.5 |
| mooring_watch | no build | 2400 | 35% | 0% | 0.58 | 0.0% | - | - | 9.2 |
| mooring_watch | **built** | 2400 | 54% | 0% | 0.41 | 0.0% | 100% (1.0) | 0.17 / 4.59 | 8.0 |
| count_against_paper | no build | 2400 | 6% | 0% | 0.90 | 0.0% | - | - | 5.6 |
| count_against_paper | **built** | 2400 | 10% | 0% | 0.85 | 0.0% | 75% (3.6) | 0.08 / 1.62 | 5.8 |
| quarter_to_two | no build | 2400 | 82% | 5% | 0.32 | 0.0% | - | - | 4.7 |
| quarter_to_two | **built** | 2400 | 84% | 2% | 0.24 | 0.0% | 100% (1.0) | 0.00 / 2.13 | 4.5 |
| manual_handling | no build | 2400 | 83% | 4% | 0.31 | 0.0% | - | - | 4.7 |
| manual_handling | **built** | 2400 | 84% | 2% | 0.23 | 0.0% | 100% (1.0) | 0.00 / 2.12 | 4.5 |
| favourite | no build | 2400 | 76% | 0% | 0.23 | 0.0% | - | - | 8.3 |
| favourite | **built** | 2400 | 83% | 0% | 0.16 | 0.0% | 100% (1.0) | 0.14 / 6.08 | 7.2 |
| last_ticket | no build | 2400 | 83% | 5% | 0.31 | 0.0% | - | - | 4.7 |
| last_ticket | **built** | 2400 | 84% | 2% | 0.24 | 0.0% | 100% (1.0) | 0.00 / 2.10 | 4.5 |
| wrong_horse | no build | 2400 | 3% | 0% | 0.94 | 0.0% | - | - | 5.6 |
| wrong_horse | **built** | 2400 | 7% | 0% | 0.89 | 0.0% | 94% (2.8) | 0.05 / 2.01 | 5.9 |

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
