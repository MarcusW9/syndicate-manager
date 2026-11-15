# Hand-picked teams at the real fight difficulty (2026-11-15-after-extra0)

`node scripts/sim-teams.mjs 100 2026-11-15-after-extra0`. Not part of the declared gate in `scripts/sim-orders.mjs`; the same fight code, with the game's own starting rosters and each job's real fight difficulty.

## The fights the five jobs really start

| Job | Fights seen | Difficulty (min / median / max) | Enemies at the start |
| --- | --- | --- | --- |
| data_pull | 33 | 12 / 12 / 14 | threat 3 |
| data_scrub | 15 | 9 / 9 / 10 | threat 2 |
| quiet_hours | 33 | 12 / 12 / 14 | threat 3 |
| warehouse | 48 | 14 / 14 / 16 | threat 4 |
| protection | 34 | 12 / 12 / 14 | threat 3 |
| dead_air | 30 | 14 / 14 / 16 | threat 4 |
| still_connected | 37 | 14 / 14 / 16 | threat 4 |
| not_for_sale | 33 | 14 / 14 / 16 | threat 4 |
| one_more_song | 39 | 12 / 12 / 14 | threat 3 |
| the_wrong_fare | 34 | 14 / 14 / 16 | threat 4 |

## Played hands-off on the defaults, steady risk

"First N" is the first N runners of the roster (what the earlier tables used); "best" is the team the planning read likes best out of every team of that size (win chance, then fewest lost). Fights at the difficulty each seed's real run had.

| Job | Roster | Team | Fights | Clean win | Job done | Someone left behind | Downs | Died |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | fresh | first 3 | 33 | 27% | 27% | 0% | 1.06 | 0% |
| data_pull | fresh | best of roster | 33 | 42% | 42% | 0% | 0.70 | 0% |
| data_pull | authored | first 3 | 32 | 78% | 78% | 0% | 0.25 | 0% |
| data_pull | authored | best of roster | 32 | 91% | 91% | 0% | 0.09 | 0% |
| data_scrub | fresh | first 2 | 15 | 87% | 87% | 0% | 0.13 | 0% |
| data_scrub | fresh | best of roster | 15 | 87% | 87% | 0% | 0.33 | 0% |
| data_scrub | authored | first 2 | 26 | 96% | 96% | 0% | 0.04 | 0% |
| data_scrub | authored | best of roster | 26 | 100% | 100% | 0% | 0.00 | 0% |
| quiet_hours | fresh | first 3 | 33 | 64% | 64% | 0% | 0.58 | 0% |
| quiet_hours | fresh | best of roster | 33 | 48% | 48% | 0% | 0.73 | 0% |
| quiet_hours | authored | first 3 | 34 | 68% | 68% | 0% | 0.35 | 0% |
| quiet_hours | authored | best of roster | 34 | 91% | 91% | 0% | 0.15 | 0% |
| warehouse | fresh | first 4 | 48 | 8% | 8% | 0% | 0.94 | 0% |
| warehouse | fresh | best of roster | 48 | 13% | 13% | 0% | 0.88 | 0% |
| warehouse | authored | first 4 | 34 | 41% | 41% | 0% | 0.56 | 0% |
| warehouse | authored | best of roster | 34 | 56% | 56% | 0% | 0.44 | 0% |
| protection | fresh | first 3 | 34 | 32% | 32% | 0% | 0.71 | 0% |
| protection | fresh | best of roster | 34 | 44% | 44% | 0% | 0.56 | 0% |
| protection | authored | first 3 | 29 | 52% | 52% | 0% | 0.55 | 0% |
| protection | authored | best of roster | 29 | 66% | 66% | 0% | 0.34 | 0% |
| dead_air | fresh | first 4 | 30 | 27% | 27% | 0% | 0.73 | 0% |
| dead_air | fresh | best of roster | 30 | 20% | 20% | 0% | 0.83 | 0% |
| dead_air | authored | first 4 | 36 | 61% | 61% | 0% | 0.44 | 0% |
| dead_air | authored | best of roster | 36 | 72% | 72% | 0% | 0.28 | 0% |
| still_connected | fresh | first 4 | 37 | 19% | 19% | 0% | 1.05 | 0% |
| still_connected | fresh | best of roster | 37 | 32% | 32% | 0% | 0.89 | 0% |
| still_connected | authored | first 4 | 34 | 62% | 62% | 0% | 0.53 | 0% |
| still_connected | authored | best of roster | 34 | 59% | 59% | 0% | 0.41 | 0% |
| not_for_sale | fresh | first 4 | 33 | 30% | 30% | 0% | 0.67 | 0% |
| not_for_sale | fresh | best of roster | 33 | 21% | 21% | 0% | 0.76 | 0% |
| not_for_sale | authored | first 4 | 37 | 54% | 54% | 0% | 0.51 | 0% |
| not_for_sale | authored | best of roster | 37 | 70% | 70% | 0% | 0.30 | 0% |
| one_more_song | fresh | first 3 | 39 | 36% | 36% | 0% | 0.85 | 0% |
| one_more_song | fresh | best of roster | 39 | 41% | 41% | 0% | 0.85 | 0% |
| one_more_song | authored | first 3 | 37 | 86% | 86% | 0% | 0.19 | 0% |
| one_more_song | authored | best of roster | 37 | 92% | 92% | 0% | 0.08 | 0% |
| the_wrong_fare | fresh | first 4 | 34 | 0% | 0% | 0% | 1.03 | 0% |
| the_wrong_fare | fresh | best of roster | 34 | 0% | 0% | 0% | 1.03 | 0% |
| the_wrong_fare | authored | first 4 | 35 | 0% | 0% | 0% | 1.14 | 0% |
| the_wrong_fare | authored | best of roster | 35 | 3% | 3% | 0% | 1.17 | 0% |

## Reading

- fresh roster, holdHack: first N 46% clean wins and 0% left behind; best team 50% and 0%.
- fresh roster, holdExtract: first N 16% clean wins and 0% left behind; best team 13% and 0%.
- authored roster, holdHack: first N 78% clean wins and 0% left behind; best team 87% and 0%.
- authored roster, holdExtract: first N 39% clean wins and 0% left behind; best team 50% and 0%.
