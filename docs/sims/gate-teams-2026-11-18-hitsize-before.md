# The five jobs' fights with the roster at each job's gate (2026-11-18-hitsize-before)

`node scripts/sim-gate-teams.mjs 24 100 2026-11-18-hitsize-before`. Real fight code. 24 campaigns played as `scripts/sim-tong.mjs` plays them; each job is fought by the roster of the day reputation reached its gate, 100 fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played 2 below the job difficulty shown (`fightDiff`). Declared before the run: for the best team, someone left behind in at most 15% of steady extractions and a death in at most 8% of committed fights (the owner's aim is about 1 in 25).

## The rosters

| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | 5 | 24/24 | 7 | 5 / 7 / 10 | 7 / 8 / 10 | 4 / 6 / 8 |
| 15 | 10 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 35 | 17 | 24/24 | 8 | 5 / 7 / 10 | 7 / 9 / 10 | 4 / 6 / 8 |
| 60 | 32 | 23/24 | 11 | 6 / 8 / 10 | 7 / 9 / 11 | 5 / 6 / 8 |

## The fights

| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | 14 | steady | best of roster | 2400 | 2% | 2% | 99% | 0% | 0.00 | 1.03 | 0.0% |
| data_pull | 14 | steady | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.06 | 0.0% |
| data_pull | 14 | committed | best of roster | 2400 | 7% | 7% | 93% | 0% | 0.00 | 2.79 | 8.7% |
| data_pull | 14 | committed | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 2.88 | 11.7% |
| data_scrub | 11 | steady | best of roster | 2400 | 24% | 24% | 76% | 0% | 0.00 | 0.76 | 0.0% |
| data_scrub | 11 | steady | first 2 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.01 | 0.0% |
| data_scrub | 11 | committed | best of roster | 2400 | 36% | 36% | 64% | 0% | 0.00 | 1.34 | 4.3% |
| data_scrub | 11 | committed | first 2 | 2400 | 2% | 2% | 98% | 0% | 0.00 | 1.93 | 3.8% |
| quiet_hours | 14 | steady | best of roster | 2400 | 17% | 17% | 83% | 0% | 0.00 | 0.84 | 0.0% |
| quiet_hours | 14 | steady | first 3 | 2400 | 3% | 3% | 97% | 0% | 0.00 | 0.96 | 0.0% |
| quiet_hours | 14 | committed | best of roster | 2400 | 36% | 36% | 64% | 0% | 0.00 | 2.12 | 8.6% |
| quiet_hours | 14 | committed | first 3 | 2400 | 9% | 9% | 91% | 0% | 0.00 | 2.73 | 12.2% |
| warehouse | 16 | steady | best of roster | 2300 | 87% | 98% | 2% | 8% | 0.20 | 0.55 | 0.0% |
| warehouse | 16 | steady | first 4 | 2300 | 49% | 86% | 14% | 26% | 0.73 | 1.42 | 0.0% |
| warehouse | 16 | committed | best of roster | 2300 | 90% | 100% | 0% | 9% | 0.20 | 0.49 | 2.9% |
| warehouse | 16 | committed | first 4 | 2300 | 65% | 100% | 0% | 33% | 0.83 | 1.54 | 11.9% |
| protection | 14 | steady | best of roster | 2400 | 72% | 72% | 28% | 0% | 0.00 | 0.28 | 0.0% |
| protection | 14 | steady | first 3 | 2400 | 22% | 22% | 78% | 0% | 0.00 | 0.80 | 0.0% |
| protection | 14 | committed | best of roster | 2400 | 87% | 87% | 13% | 0% | 0.00 | 0.55 | 3.0% |
| protection | 14 | committed | first 3 | 2400 | 39% | 39% | 61% | 0% | 0.00 | 2.06 | 19.9% |
| dead_air | 16 | steady | best of roster | 2300 | 79% | 95% | 5% | 9% | 0.23 | 0.55 | 0.0% |
| dead_air | 16 | steady | first 4 | 2300 | 43% | 76% | 24% | 20% | 0.56 | 1.24 | 0.0% |
| dead_air | 16 | committed | best of roster | 2300 | 89% | 100% | 0% | 10% | 0.24 | 0.55 | 3.7% |
| dead_air | 16 | committed | first 4 | 2300 | 66% | 100% | 0% | 32% | 0.84 | 1.58 | 12.0% |
| still_connected | 16 | steady | best of roster | 2300 | 2% | 2% | 98% | 0% | 0.00 | 1.06 | 0.0% |
| still_connected | 16 | steady | first 4 | 2300 | 0% | 0% | 100% | 0% | 0.00 | 1.08 | 0.0% |
| still_connected | 16 | committed | best of roster | 2300 | 7% | 7% | 93% | 0% | 0.00 | 3.61 | 13.4% |
| still_connected | 16 | committed | first 4 | 2300 | 0% | 0% | 100% | 0% | 0.00 | 3.16 | 10.7% |
| not_for_sale | 16 | steady | best of roster | 2300 | 81% | 95% | 5% | 7% | 0.17 | 0.47 | 0.0% |
| not_for_sale | 16 | steady | first 4 | 2300 | 43% | 77% | 23% | 21% | 0.58 | 1.23 | 0.0% |
| not_for_sale | 16 | committed | best of roster | 2300 | 89% | 100% | 0% | 11% | 0.26 | 0.56 | 3.1% |
| not_for_sale | 16 | committed | first 4 | 2300 | 64% | 100% | 0% | 34% | 0.90 | 1.63 | 12.2% |
| one_more_song | 14 | steady | best of roster | 2400 | 3% | 3% | 97% | 0% | 0.00 | 1.00 | 0.0% |
| one_more_song | 14 | steady | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.07 | 0.0% |
| one_more_song | 14 | committed | best of roster | 2400 | 10% | 10% | 90% | 0% | 0.00 | 2.73 | 6.9% |
| one_more_song | 14 | committed | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 2.78 | 6.8% |
| still_clocked_in | 14 | steady | best of roster | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.06 | 0.0% |
| still_clocked_in | 14 | steady | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.14 | 0.0% |
| still_clocked_in | 14 | committed | best of roster | 2400 | 1% | 1% | 99% | 0% | 0.00 | 2.81 | 5.2% |
| still_clocked_in | 14 | committed | first 3 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 2.64 | 5.4% |
| the_last_collection | 16 | steady | best of roster | 2300 | 78% | 96% | 4% | 11% | 0.31 | 0.63 | 0.0% |
| the_last_collection | 16 | steady | first 4 | 2300 | 40% | 77% | 23% | 25% | 0.74 | 1.40 | 0.0% |
| the_last_collection | 16 | committed | best of roster | 2300 | 85% | 100% | 0% | 15% | 0.34 | 0.65 | 4.7% |
| the_last_collection | 16 | committed | first 4 | 2300 | 57% | 100% | 0% | 41% | 1.10 | 1.83 | 14.2% |
| the_wrong_fare | 14 | steady | best of roster | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.07 | 0.0% |
| the_wrong_fare | 14 | steady | first 4 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 1.13 | 0.0% |
| the_wrong_fare | 14 | committed | best of roster | 2400 | 3% | 3% | 98% | 0% | 0.00 | 3.50 | 11.2% |
| the_wrong_fare | 14 | committed | first 4 | 2400 | 0% | 0% | 100% | 0% | 0.00 | 2.76 | 7.0% |
| kidnap | 16 | steady | best of roster | 2300 | 79% | 94% | 6% | 8% | 0.21 | 0.53 | 0.0% |
| kidnap | 16 | steady | first 4 | 2300 | 45% | 76% | 24% | 19% | 0.52 | 1.18 | 0.0% |
| kidnap | 16 | committed | best of roster | 2300 | 88% | 100% | 0% | 11% | 0.26 | 0.56 | 3.3% |
| kidnap | 16 | committed | first 4 | 2300 | 67% | 100% | 0% | 32% | 0.86 | 1.59 | 11.6% |
| casino | 11 | steady | best of roster | 2400 | 84% | 84% | 16% | 0% | 0.00 | 0.16 | 0.0% |
| casino | 11 | steady | first 3 | 2400 | 46% | 46% | 54% | 0% | 0.00 | 0.53 | 0.0% |
| casino | 11 | committed | best of roster | 2400 | 95% | 95% | 5% | 0% | 0.00 | 0.25 | 2.4% |
| casino | 11 | committed | first 3 | 2400 | 67% | 67% | 33% | 0% | 0.00 | 1.20 | 12.8% |
| clinic | 6 | steady | best of roster | 2400 | 98% | 98% | 2% | 0% | 0.00 | 0.01 | 0.0% |
| clinic | 6 | steady | first 2 | 2400 | 76% | 76% | 24% | 0% | 0.00 | 0.19 | 0.0% |
| clinic | 6 | committed | best of roster | 2400 | 100% | 100% | 0% | 0% | 0.00 | 0.02 | 0.3% |
| clinic | 6 | committed | first 2 | 2400 | 91% | 91% | 9% | 0% | 0.00 | 0.29 | 4.4% |
| ledger | 6 | steady | best of roster | 2400 | 98% | 99% | 1% | 0% | 0.00 | 0.02 | 0.0% |
| ledger | 6 | steady | first 2 | 2400 | 77% | 94% | 6% | 4% | 0.05 | 0.18 | 0.0% |
| ledger | 6 | committed | best of roster | 2400 | 100% | 100% | 0% | 0% | 0.00 | 0.03 | 0.2% |
| ledger | 6 | committed | first 2 | 2400 | 94% | 100% | 0% | 5% | 0.10 | 0.26 | 1.8% |
| container409 | 6 | steady | best of roster | 2400 | 98% | 99% | 1% | 0% | 0.01 | 0.03 | 0.0% |
| container409 | 6 | steady | first 2 | 2400 | 79% | 94% | 6% | 4% | 0.04 | 0.15 | 0.0% |
| container409 | 6 | committed | best of roster | 2400 | 100% | 100% | 0% | 0% | 0.01 | 0.02 | 0.2% |
| container409 | 6 | committed | first 2 | 2400 | 95% | 100% | 0% | 4% | 0.08 | 0.21 | 1.9% |
| chrome | 6 | steady | best of roster | 2400 | 87% | 87% | 13% | 0% | 0.00 | 0.11 | 0.0% |
| chrome | 6 | steady | first 2 | 2400 | 42% | 42% | 58% | 0% | 0.00 | 0.45 | 0.0% |
| chrome | 6 | committed | best of roster | 2400 | 96% | 96% | 4% | 0% | 0.00 | 0.14 | 1.5% |
| chrome | 6 | committed | first 2 | 2400 | 63% | 63% | 37% | 0% | 0.00 | 0.84 | 8.0% |
| low_water | 14 | steady | best of roster | 2400 | 76% | 92% | 8% | 11% | 0.26 | 0.49 | 0.0% |
| low_water | 14 | steady | first 3 | 2400 | 35% | 64% | 36% | 19% | 0.45 | 1.07 | 0.0% |
| low_water | 14 | committed | best of roster | 2400 | 84% | 100% | 0% | 16% | 0.38 | 0.63 | 4.2% |
| low_water | 14 | committed | first 3 | 2400 | 52% | 100% | 0% | 46% | 1.13 | 1.74 | 17.5% |
| mooring_watch | 11 | steady | best of roster | 2400 | 85% | 85% | 15% | 0% | 0.00 | 0.14 | 0.0% |
| mooring_watch | 11 | steady | first 2 | 2400 | 38% | 38% | 62% | 0% | 0.00 | 0.58 | 0.0% |
| mooring_watch | 11 | committed | best of roster | 2400 | 93% | 93% | 7% | 0% | 0.00 | 0.20 | 1.3% |
| mooring_watch | 11 | committed | first 2 | 2400 | 59% | 59% | 41% | 0% | 0.00 | 0.96 | 10.4% |
| count_against_paper | 11 | steady | best of roster | 2400 | 49% | 49% | 51% | 0% | 0.00 | 0.49 | 0.0% |
| count_against_paper | 11 | steady | first 2 | 2400 | 12% | 12% | 89% | 0% | 0.00 | 0.83 | 0.0% |
| count_against_paper | 11 | committed | best of roster | 2400 | 64% | 64% | 36% | 0% | 0.00 | 0.83 | 4.1% |
| count_against_paper | 11 | committed | first 2 | 2400 | 21% | 21% | 79% | 0% | 0.00 | 1.63 | 7.2% |
| quarter_to_two | 11 | steady | best of roster | 2400 | 96% | 99% | 1% | 1% | 0.02 | 0.06 | 0.0% |
| quarter_to_two | 11 | steady | first 3 | 2400 | 73% | 90% | 10% | 4% | 0.09 | 0.35 | 0.0% |
| quarter_to_two | 11 | committed | best of roster | 2400 | 99% | 100% | 0% | 1% | 0.02 | 0.06 | 0.3% |
| quarter_to_two | 11 | committed | first 3 | 2400 | 94% | 100% | 0% | 5% | 0.12 | 0.42 | 2.7% |
| manual_handling | 11 | steady | best of roster | 2400 | 95% | 99% | 1% | 1% | 0.02 | 0.06 | 0.0% |
| manual_handling | 11 | steady | first 3 | 2400 | 74% | 90% | 10% | 3% | 0.07 | 0.32 | 0.0% |
| manual_handling | 11 | committed | best of roster | 2400 | 99% | 100% | 0% | 1% | 0.02 | 0.05 | 0.1% |
| manual_handling | 11 | committed | first 3 | 2400 | 93% | 100% | 0% | 6% | 0.13 | 0.41 | 2.8% |
| favourite | 11 | steady | best of roster | 2400 | 98% | 98% | 2% | 0% | 0.00 | 0.02 | 0.0% |
| favourite | 11 | steady | first 3 | 2400 | 74% | 74% | 26% | 0% | 0.00 | 0.26 | 0.0% |
| favourite | 11 | committed | best of roster | 2400 | 100% | 100% | 0% | 0% | 0.00 | 0.04 | 0.2% |
| favourite | 11 | committed | first 3 | 2400 | 93% | 93% | 7% | 0% | 0.00 | 0.47 | 7.5% |
| last_ticket | 11 | steady | best of roster | 2400 | 96% | 99% | 1% | 1% | 0.02 | 0.06 | 0.0% |
| last_ticket | 11 | steady | first 3 | 2400 | 74% | 92% | 8% | 3% | 0.08 | 0.32 | 0.0% |
| last_ticket | 11 | committed | best of roster | 2400 | 99% | 100% | 0% | 1% | 0.03 | 0.07 | 0.6% |
| last_ticket | 11 | committed | first 3 | 2400 | 94% | 100% | 0% | 5% | 0.12 | 0.40 | 2.7% |
| wrong_horse | 14 | steady | best of roster | 2400 | 16% | 16% | 84% | 0% | 0.00 | 0.85 | 0.0% |
| wrong_horse | 14 | steady | first 3 | 2400 | 3% | 3% | 97% | 0% | 0.00 | 0.97 | 0.0% |
| wrong_horse | 14 | committed | best of roster | 2400 | 37% | 37% | 63% | 0% | 0.00 | 2.11 | 8.9% |
| wrong_horse | 14 | committed | first 3 | 2400 | 9% | 9% | 91% | 0% | 0.00 | 2.72 | 13.9% |

## Against the declared targets (best team)

- data_pull: a death in 8.7% on committed (over 8%)
- data_scrub: a death in 4.3% on committed (within 8%)
- quiet_hours: a death in 8.6% on committed (over 8%)
- warehouse: left behind 8% on steady (within 15%)
- warehouse: a death in 2.9% on committed (within 8%)
- protection: a death in 3.0% on committed (within 8%)
- dead_air: left behind 9% on steady (within 15%)
- dead_air: a death in 3.7% on committed (within 8%)
- still_connected: a death in 13.4% on committed (over 8%)
- not_for_sale: left behind 7% on steady (within 15%)
- not_for_sale: a death in 3.1% on committed (within 8%)
- one_more_song: a death in 6.9% on committed (within 8%)
- still_clocked_in: a death in 5.2% on committed (within 8%)
- the_last_collection: left behind 11% on steady (within 15%)
- the_last_collection: a death in 4.7% on committed (within 8%)
- the_wrong_fare: a death in 11.2% on committed (over 8%)
- kidnap: left behind 8% on steady (within 15%)
- kidnap: a death in 3.3% on committed (within 8%)
- casino: a death in 2.4% on committed (within 8%)
- clinic: a death in 0.3% on committed (within 8%)
- ledger: left behind 0% on steady (within 15%)
- ledger: a death in 0.2% on committed (within 8%)
- container409: left behind 0% on steady (within 15%)
- container409: a death in 0.2% on committed (within 8%)
- chrome: a death in 1.5% on committed (within 8%)
- low_water: left behind 11% on steady (within 15%)
- low_water: a death in 4.2% on committed (within 8%)
- mooring_watch: a death in 1.3% on committed (within 8%)
- count_against_paper: a death in 4.1% on committed (within 8%)
- quarter_to_two: left behind 1% on steady (within 15%)
- quarter_to_two: a death in 0.3% on committed (within 8%)
- manual_handling: left behind 1% on steady (within 15%)
- manual_handling: a death in 0.1% on committed (within 8%)
- favourite: a death in 0.2% on committed (within 8%)
- last_ticket: left behind 1% on steady (within 15%)
- last_ticket: a death in 0.6% on committed (within 8%)
- wrong_horse: a death in 8.9% on committed (over 8%)

## Builds: the best team with and without the given build (Ricochet and the Cytotoxic Vector on the best combat runner)

Same teams, same seeds; each pair differs only by the build. "Fires" is the share of fights where Ricochet fired, with the median-ish mean round; "Vector kills" is defeats by the tick a fight (of all defeats).

| Job | Risk | Team | Fights | Clean win | Someone left | Downs | A death | Fires (mean round) | Vector kills / defeats | Mean rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | steady | no build | 2400 | 2% | 0% | 1.03 | 0.0% | - | - | 5.1 |
| data_pull | steady | **built** | 2400 | 7% | 0% | 0.96 | 0.0% | 79% (2.6) | 0.51 / 1.78 | 5.6 |
| data_pull | committed | no build | 2400 | 7% | 0% | 2.79 | 8.7% | - | - | 8.1 |
| data_pull | committed | **built** | 2400 | 25% | 0% | 2.42 | 9.3% | 92% (2.9) | 0.97 / 3.29 | 8.9 |
| data_scrub | steady | no build | 2400 | 24% | 0% | 0.76 | 0.0% | - | - | 7.9 |
| data_scrub | steady | **built** | 2400 | 36% | 0% | 0.63 | 0.0% | 88% (4.1) | 0.36 / 2.39 | 8.0 |
| data_scrub | committed | no build | 2400 | 36% | 0% | 1.34 | 4.3% | - | - | 10.2 |
| data_scrub | committed | **built** | 2400 | 51% | 0% | 1.08 | 3.4% | 96% (4.2) | 0.52 / 3.24 | 10.1 |
| quiet_hours | steady | no build | 2400 | 17% | 0% | 0.84 | 0.0% | - | - | 6.2 |
| quiet_hours | steady | **built** | 2400 | 37% | 0% | 0.64 | 0.0% | 79% (3.2) | 0.59 / 3.26 | 7.1 |
| quiet_hours | committed | no build | 2400 | 36% | 0% | 2.12 | 8.6% | - | - | 9.5 |
| quiet_hours | committed | **built** | 2400 | 62% | 0% | 1.39 | 7.0% | 94% (3.4) | 0.99 / 4.86 | 9.7 |
| warehouse | steady | no build | 2300 | 87% | 8% | 0.55 | 0.0% | - | - | 5.4 |
| warehouse | steady | **built** | 2300 | 93% | 2% | 0.17 | 0.0% | 100% (1.0) | 0.37 / 2.06 | 5.0 |
| warehouse | committed | no build | 2300 | 90% | 9% | 0.49 | 2.9% | - | - | 5.3 |
| warehouse | committed | **built** | 2300 | 98% | 2% | 0.19 | 0.5% | 100% (1.0) | 0.38 / 2.08 | 5.1 |
| protection | steady | no build | 2400 | 72% | 0% | 0.28 | 0.0% | - | - | 5.7 |
| protection | steady | **built** | 2400 | 89% | 0% | 0.11 | 0.0% | 100% (1.0) | 0.67 / 3.63 | 4.1 |
| protection | committed | no build | 2400 | 87% | 0% | 0.55 | 3.0% | - | - | 7.0 |
| protection | committed | **built** | 2400 | 99% | 0% | 0.14 | 0.9% | 100% (1.0) | 0.75 / 3.94 | 4.5 |
| dead_air | steady | no build | 2300 | 79% | 9% | 0.55 | 0.0% | - | - | 5.1 |
| dead_air | steady | **built** | 2300 | 87% | 1% | 0.14 | 0.0% | 100% (1.0) | 0.58 / 2.74 | 4.9 |
| dead_air | committed | no build | 2300 | 89% | 10% | 0.55 | 3.7% | - | - | 5.3 |
| dead_air | committed | **built** | 2300 | 98% | 2% | 0.17 | 0.8% | 99% (1.0) | 0.61 / 2.83 | 5.0 |
| still_connected | steady | no build | 2300 | 2% | 0% | 1.06 | 0.0% | - | - | 5.0 |
| still_connected | steady | **built** | 2300 | 10% | 0% | 0.95 | 0.0% | 92% (1.8) | 0.43 / 2.55 | 5.6 |
| still_connected | committed | no build | 2300 | 7% | 0% | 3.61 | 13.4% | - | - | 7.9 |
| still_connected | committed | **built** | 2300 | 25% | 0% | 3.07 | 13.0% | 98% (2.0) | 0.67 / 4.02 | 9.0 |
| not_for_sale | steady | no build | 2300 | 81% | 7% | 0.47 | 0.0% | - | - | 5.1 |
| not_for_sale | steady | **built** | 2300 | 88% | 1% | 0.14 | 0.0% | 99% (1.0) | 0.59 / 2.75 | 4.8 |
| not_for_sale | committed | no build | 2300 | 89% | 11% | 0.56 | 3.1% | - | - | 5.3 |
| not_for_sale | committed | **built** | 2300 | 98% | 1% | 0.15 | 0.6% | 99% (1.0) | 0.61 / 2.82 | 5.0 |
| one_more_song | steady | no build | 2400 | 3% | 0% | 1.00 | 0.0% | - | - | 5.4 |
| one_more_song | steady | **built** | 2400 | 8% | 0% | 0.93 | 0.0% | 76% (3.5) | 0.25 / 1.37 | 5.7 |
| one_more_song | committed | no build | 2400 | 10% | 0% | 2.73 | 6.9% | - | - | 8.3 |
| one_more_song | committed | **built** | 2400 | 21% | 0% | 2.47 | 8.0% | 93% (3.7) | 0.45 / 2.57 | 8.8 |
| still_clocked_in | steady | no build | 2400 | 0% | 0% | 1.06 | 0.0% | - | - | 4.7 |
| still_clocked_in | steady | **built** | 2400 | 3% | 0% | 1.03 | 0.0% | 60% (3.0) | 0.16 / 0.79 | 4.9 |
| still_clocked_in | committed | no build | 2400 | 1% | 0% | 2.81 | 5.2% | - | - | 6.8 |
| still_clocked_in | committed | **built** | 2400 | 6% | 0% | 2.73 | 6.6% | 84% (3.7) | 0.31 / 1.71 | 7.3 |
| the_last_collection | steady | no build | 2300 | 78% | 11% | 0.63 | 0.0% | - | - | 5.3 |
| the_last_collection | steady | **built** | 2300 | 86% | 2% | 0.17 | 0.0% | 99% (1.0) | 0.58 / 2.75 | 4.9 |
| the_last_collection | committed | no build | 2300 | 85% | 15% | 0.65 | 4.7% | - | - | 5.4 |
| the_last_collection | committed | **built** | 2300 | 96% | 3% | 0.21 | 1.1% | 100% (1.0) | 0.60 / 2.78 | 5.1 |
| the_wrong_fare | steady | no build | 2400 | 0% | 0% | 1.07 | 0.0% | - | - | 4.8 |
| the_wrong_fare | steady | **built** | 2400 | 5% | 0% | 1.03 | 0.0% | 75% (2.1) | 0.30 / 1.81 | 5.0 |
| the_wrong_fare | committed | no build | 2400 | 3% | 0% | 3.50 | 11.2% | - | - | 7.7 |
| the_wrong_fare | committed | **built** | 2400 | 15% | 0% | 3.09 | 12.0% | 86% (2.5) | 0.47 / 3.22 | 8.2 |
| kidnap | steady | no build | 2300 | 79% | 8% | 0.53 | 0.0% | - | - | 5.1 |
| kidnap | steady | **built** | 2300 | 88% | 1% | 0.14 | 0.0% | 100% (1.0) | 0.60 / 2.76 | 4.9 |
| kidnap | committed | no build | 2300 | 88% | 11% | 0.56 | 3.3% | - | - | 5.3 |
| kidnap | committed | **built** | 2300 | 98% | 2% | 0.16 | 0.6% | 100% (1.0) | 0.64 / 2.82 | 5.0 |
| casino | steady | no build | 2400 | 84% | 0% | 0.16 | 0.0% | - | - | 8.2 |
| casino | steady | **built** | 2400 | 91% | 0% | 0.09 | 0.0% | 93% (3.1) | 0.48 / 4.34 | 7.9 |
| casino | committed | no build | 2400 | 95% | 0% | 0.25 | 2.4% | - | - | 9.0 |
| casino | committed | **built** | 2400 | 98% | 0% | 0.12 | 1.4% | 97% (3.2) | 0.53 / 4.63 | 8.3 |
| clinic | steady | no build | 2400 | 98% | 0% | 0.01 | 0.0% | - | - | 3.9 |
| clinic | steady | **built** | 2400 | 99% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.26 / 2.28 | 2.1 |
| clinic | committed | no build | 2400 | 100% | 0% | 0.02 | 0.3% | - | - | 3.9 |
| clinic | committed | **built** | 2400 | 100% | 0% | 0.01 | 0.1% | 100% (1.0) | 0.25 / 2.28 | 2.1 |
| ledger | steady | no build | 2400 | 98% | 0% | 0.02 | 0.0% | - | - | 4.4 |
| ledger | steady | **built** | 2400 | 98% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.30 / 2.40 | 4.2 |
| ledger | committed | no build | 2400 | 100% | 0% | 0.03 | 0.2% | - | - | 4.4 |
| ledger | committed | **built** | 2400 | 100% | 0% | 0.01 | 0.1% | 100% (1.0) | 0.30 / 2.40 | 4.2 |
| container409 | steady | no build | 2400 | 98% | 0% | 0.03 | 0.0% | - | - | 4.4 |
| container409 | steady | **built** | 2400 | 99% | 0% | 0.01 | 0.0% | 100% (1.0) | 0.31 / 2.40 | 4.2 |
| container409 | committed | no build | 2400 | 100% | 0% | 0.02 | 0.2% | - | - | 4.4 |
| container409 | committed | **built** | 2400 | 100% | 0% | 0.02 | 0.2% | 100% (1.0) | 0.32 / 2.41 | 4.2 |
| chrome | steady | no build | 2400 | 87% | 0% | 0.11 | 0.0% | - | - | 8.5 |
| chrome | steady | **built** | 2400 | 93% | 0% | 0.06 | 0.0% | 96% (4.6) | 0.40 / 4.45 | 7.3 |
| chrome | committed | no build | 2400 | 96% | 0% | 0.14 | 1.5% | - | - | 9.0 |
| chrome | committed | **built** | 2400 | 99% | 0% | 0.07 | 1.5% | 99% (4.6) | 0.47 / 4.69 | 7.6 |
| low_water | steady | no build | 2400 | 76% | 11% | 0.49 | 0.0% | - | - | 4.6 |
| low_water | steady | **built** | 2400 | 86% | 1% | 0.13 | 0.0% | 100% (1.0) | 0.65 / 2.68 | 4.3 |
| low_water | committed | no build | 2400 | 84% | 16% | 0.63 | 4.2% | - | - | 5.0 |
| low_water | committed | **built** | 2400 | 97% | 2% | 0.17 | 1.3% | 100% (1.0) | 0.70 / 2.78 | 4.5 |
| mooring_watch | steady | no build | 2400 | 85% | 0% | 0.14 | 0.0% | - | - | 6.2 |
| mooring_watch | steady | **built** | 2400 | 95% | 0% | 0.06 | 0.0% | 100% (1.0) | 0.54 / 2.70 | 3.5 |
| mooring_watch | committed | no build | 2400 | 93% | 0% | 0.20 | 1.3% | - | - | 6.7 |
| mooring_watch | committed | **built** | 2400 | 99% | 0% | 0.06 | 1.3% | 100% (1.0) | 0.54 / 2.82 | 3.6 |
| count_against_paper | steady | no build | 2400 | 49% | 0% | 0.49 | 0.0% | - | - | 8.3 |
| count_against_paper | steady | **built** | 2400 | 66% | 0% | 0.32 | 0.0% | 87% (4.1) | 0.67 / 3.57 | 8.0 |
| count_against_paper | committed | no build | 2400 | 64% | 0% | 0.83 | 4.1% | - | - | 10.3 |
| count_against_paper | committed | **built** | 2400 | 83% | 0% | 0.47 | 2.8% | 96% (4.1) | 0.92 / 4.32 | 9.4 |
| quarter_to_two | steady | no build | 2400 | 96% | 1% | 0.06 | 0.0% | - | - | 4.4 |
| quarter_to_two | steady | **built** | 2400 | 97% | 0% | 0.03 | 0.0% | 97% (1.1) | 0.34 / 2.28 | 4.2 |
| quarter_to_two | committed | no build | 2400 | 99% | 1% | 0.06 | 0.3% | - | - | 4.5 |
| quarter_to_two | committed | **built** | 2400 | 100% | 0% | 0.03 | 0.1% | 96% (1.1) | 0.38 / 2.28 | 4.3 |
| manual_handling | steady | no build | 2400 | 95% | 1% | 0.06 | 0.0% | - | - | 4.4 |
| manual_handling | steady | **built** | 2400 | 96% | 0% | 0.03 | 0.0% | 97% (1.1) | 0.37 / 2.26 | 4.2 |
| manual_handling | committed | no build | 2400 | 99% | 1% | 0.05 | 0.1% | - | - | 4.4 |
| manual_handling | committed | **built** | 2400 | 100% | 0% | 0.03 | 0.2% | 97% (1.1) | 0.35 / 2.30 | 4.3 |
| favourite | steady | no build | 2400 | 98% | 0% | 0.02 | 0.0% | - | - | 4.5 |
| favourite | steady | **built** | 2400 | 99% | 0% | 0.02 | 0.0% | 97% (1.1) | 0.32 / 2.67 | 2.9 |
| favourite | committed | no build | 2400 | 100% | 0% | 0.04 | 0.2% | - | - | 4.6 |
| favourite | committed | **built** | 2400 | 100% | 0% | 0.02 | 0.0% | 98% (1.1) | 0.33 / 2.70 | 3.0 |
| last_ticket | steady | no build | 2400 | 96% | 1% | 0.06 | 0.0% | - | - | 4.4 |
| last_ticket | steady | **built** | 2400 | 97% | 0% | 0.02 | 0.0% | 97% (1.1) | 0.35 / 2.28 | 4.3 |
| last_ticket | committed | no build | 2400 | 99% | 1% | 0.07 | 0.6% | - | - | 4.5 |
| last_ticket | committed | **built** | 2400 | 100% | 0% | 0.03 | 0.0% | 97% (1.1) | 0.35 / 2.29 | 4.3 |
| wrong_horse | steady | no build | 2400 | 16% | 0% | 0.85 | 0.0% | - | - | 6.1 |
| wrong_horse | steady | **built** | 2400 | 36% | 0% | 0.64 | 0.0% | 79% (3.2) | 0.62 / 3.25 | 6.9 |
| wrong_horse | committed | no build | 2400 | 37% | 0% | 2.11 | 8.9% | - | - | 9.6 |
| wrong_horse | committed | **built** | 2400 | 65% | 0% | 1.35 | 6.6% | 94% (3.4) | 1.03 / 5.00 | 9.8 |

## The counter: the same fights with every enemy a drone (at least 5), steady, best team

| Job | Team | Fights | Clean win | Someone left | Downs | A death | Fires (mean round) | Vector kills / defeats | Mean rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | no build | 2400 | 0% | 0% | 0.98 | 0.0% | - | - | 5.1 |
| data_pull | **built** | 2400 | 1% | 0% | 0.97 | 0.0% | 89% (2.7) | 0.05 / 1.11 | 5.2 |
| data_scrub | no build | 2400 | 4% | 0% | 0.88 | 0.0% | - | - | 6.3 |
| data_scrub | **built** | 2400 | 7% | 0% | 0.84 | 0.0% | 84% (3.9) | 0.05 / 1.66 | 6.6 |
| quiet_hours | no build | 2400 | 1% | 0% | 0.95 | 0.0% | - | - | 5.3 |
| quiet_hours | **built** | 2400 | 3% | 0% | 0.92 | 0.0% | 91% (2.9) | 0.05 / 1.51 | 5.6 |
| warehouse | no build | 2300 | 73% | 9% | 0.75 | 0.0% | - | - | 5.1 |
| warehouse | **built** | 2300 | 80% | 4% | 0.47 | 0.0% | 100% (1.0) | 0.01 / 2.04 | 4.9 |
| protection | no build | 2400 | 52% | 0% | 0.47 | 0.0% | - | - | 8.1 |
| protection | **built** | 2400 | 65% | 0% | 0.33 | 0.0% | 100% (1.0) | 0.15 / 5.21 | 7.8 |
| dead_air | no build | 2300 | 73% | 10% | 0.73 | 0.0% | - | - | 5.2 |
| dead_air | **built** | 2300 | 78% | 5% | 0.50 | 0.0% | 100% (1.0) | 0.01 / 2.09 | 5.0 |
| still_connected | no build | 2300 | 0% | 0% | 1.07 | 0.0% | - | - | 5.1 |
| still_connected | **built** | 2300 | 1% | 0% | 1.04 | 0.0% | 96% (1.9) | 0.03 / 2.05 | 5.0 |
| not_for_sale | no build | 2300 | 71% | 9% | 0.70 | 0.0% | - | - | 5.0 |
| not_for_sale | **built** | 2300 | 78% | 5% | 0.49 | 0.0% | 100% (1.0) | 0.01 / 2.14 | 5.0 |
| one_more_song | no build | 2400 | 1% | 0% | 0.98 | 0.0% | - | - | 5.5 |
| one_more_song | **built** | 2400 | 2% | 0% | 0.96 | 0.0% | 90% (3.0) | 0.03 / 1.27 | 5.7 |
| still_clocked_in | no build | 2400 | 0% | 0% | 1.01 | 0.0% | - | - | 5.0 |
| still_clocked_in | **built** | 2400 | 1% | 0% | 1.01 | 0.0% | 73% (2.8) | 0.02 / 0.96 | 5.1 |
| the_last_collection | no build | 2300 | 66% | 17% | 0.99 | 0.0% | - | - | 5.4 |
| the_last_collection | **built** | 2300 | 74% | 11% | 0.74 | 0.0% | 100% (1.0) | 0.01 / 2.14 | 5.3 |
| the_wrong_fare | no build | 2400 | 0% | 0% | 1.05 | 0.0% | - | - | 5.0 |
| the_wrong_fare | **built** | 2400 | 2% | 0% | 1.03 | 0.0% | 81% (2.3) | 0.03 / 1.84 | 5.0 |
| kidnap | no build | 2300 | 74% | 8% | 0.66 | 0.0% | - | - | 5.1 |
| kidnap | **built** | 2300 | 78% | 5% | 0.47 | 0.0% | 100% (1.0) | 0.01 / 2.12 | 4.9 |
| casino | no build | 2400 | 23% | 0% | 0.74 | 0.0% | - | - | 7.4 |
| casino | **built** | 2400 | 35% | 0% | 0.62 | 0.0% | 95% (3.0) | 0.13 / 4.05 | 7.6 |
| clinic | no build | 2400 | 81% | 0% | 0.13 | 0.0% | - | - | 10.4 |
| clinic | **built** | 2400 | 91% | 0% | 0.07 | 0.0% | 100% (1.0) | 0.19 / 6.59 | 7.9 |
| ledger | no build | 2400 | 94% | 2% | 0.09 | 0.0% | - | - | 4.8 |
| ledger | **built** | 2400 | 92% | 0% | 0.10 | 0.0% | 100% (1.0) | 0.00 / 2.28 | 4.5 |
| container409 | no build | 2400 | 94% | 2% | 0.10 | 0.0% | - | - | 4.8 |
| container409 | **built** | 2400 | 93% | 1% | 0.10 | 0.0% | 100% (1.0) | - | 4.5 |
| chrome | no build | 2400 | 65% | 0% | 0.28 | 0.0% | - | - | 10.6 |
| chrome | **built** | 2400 | 74% | 0% | 0.20 | 0.0% | 95% (4.2) | 0.29 / 6.51 | 9.9 |
| low_water | no build | 2400 | 68% | 12% | 0.60 | 0.0% | - | - | 4.8 |
| low_water | **built** | 2400 | 72% | 8% | 0.48 | 0.0% | 100% (1.0) | 0.00 / 1.56 | 4.6 |
| mooring_watch | no build | 2400 | 32% | 0% | 0.61 | 0.0% | - | - | 9.0 |
| mooring_watch | **built** | 2400 | 52% | 0% | 0.42 | 0.0% | 100% (1.0) | 0.19 / 4.45 | 8.0 |
| count_against_paper | no build | 2400 | 5% | 0% | 0.90 | 0.0% | - | - | 5.7 |
| count_against_paper | **built** | 2400 | 9% | 0% | 0.86 | 0.0% | 77% (3.7) | 0.10 / 1.51 | 5.8 |
| quarter_to_two | no build | 2400 | 82% | 5% | 0.31 | 0.0% | - | - | 4.8 |
| quarter_to_two | **built** | 2400 | 85% | 2% | 0.24 | 0.0% | 100% (1.0) | 0.00 / 2.20 | 4.5 |
| manual_handling | no build | 2400 | 83% | 5% | 0.30 | 0.0% | - | - | 4.7 |
| manual_handling | **built** | 2400 | 85% | 2% | 0.23 | 0.0% | 100% (1.0) | 0.01 / 2.19 | 4.5 |
| favourite | no build | 2400 | 78% | 0% | 0.21 | 0.0% | - | - | 8.6 |
| favourite | **built** | 2400 | 85% | 0% | 0.15 | 0.0% | 100% (1.0) | 0.15 / 6.16 | 7.3 |
| last_ticket | no build | 2400 | 83% | 5% | 0.29 | 0.0% | - | - | 4.8 |
| last_ticket | **built** | 2400 | 85% | 2% | 0.24 | 0.0% | 100% (1.0) | 0.00 / 2.19 | 4.5 |
| wrong_horse | no build | 2400 | 1% | 0% | 0.96 | 0.0% | - | - | 5.4 |
| wrong_horse | **built** | 2400 | 3% | 0% | 0.93 | 0.0% | 92% (2.9) | 0.05 / 1.57 | 5.7 |

Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read's pick, which a player may not send.
