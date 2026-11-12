# Hand-picked teams at the real fight difficulty (2026-11-12-before-0a)

`node scripts/sim-teams.mjs 100 2026-11-12-before-0a`. Not part of the declared gate in `scripts/sim-orders.mjs`; the same fight code, with the game's own starting rosters and each job's real fight difficulty.

## The fights the five jobs really start

| Job | Fights seen | Difficulty (min / median / max) | Enemies at the start |
| --- | --- | --- | --- |
| data_pull | 33 | 14 / 14 / 16 | threat 3 |
| data_scrub | 15 | 11 / 11 / 12 | threat 2 |
| quiet_hours | 33 | 14 / 14 / 16 | threat 3 |
| warehouse | 48 | 16 / 16 / 18 | threat 4 |
| protection | 34 | 14 / 14 / 16 | threat 3 |

## Played hands-off on the defaults, steady risk

"First N" is the first N runners of the roster (what the earlier tables used); "best" is the team the planning read likes best out of every team of that size (win chance, then fewest lost). Fights at the difficulty each seed's real run had.

| Job | Roster | Team | Fights | Clean win | Job done | Someone left behind | Downs | Died |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | fresh | first 3 | 33 | 21% | 21% | 0% | 1.09 | 0% |
| data_pull | fresh | best of roster | 33 | 15% | 15% | 0% | 1.06 | 0% |
| data_pull | authored | first 3 | 32 | 47% | 47% | 0% | 0.59 | 0% |
| data_pull | authored | best of roster | 32 | 63% | 63% | 0% | 0.53 | 0% |
| data_scrub | fresh | first 2 | 15 | 33% | 33% | 0% | 0.80 | 0% |
| data_scrub | fresh | best of roster | 15 | 53% | 53% | 0% | 0.73 | 0% |
| data_scrub | authored | first 2 | 26 | 85% | 85% | 0% | 0.19 | 0% |
| data_scrub | authored | best of roster | 26 | 77% | 77% | 0% | 0.27 | 0% |
| quiet_hours | fresh | first 3 | 33 | 55% | 55% | 0% | 0.67 | 0% |
| quiet_hours | fresh | best of roster | 33 | 33% | 33% | 0% | 0.85 | 0% |
| quiet_hours | authored | first 3 | 34 | 56% | 56% | 0% | 0.44 | 0% |
| quiet_hours | authored | best of roster | 34 | 91% | 91% | 0% | 0.15 | 0% |
| warehouse | fresh | first 4 | 48 | 0% | 44% | 44% | 1.83 | 0% |
| warehouse | fresh | best of roster | 48 | 2% | 38% | 35% | 1.67 | 0% |
| warehouse | authored | first 4 | 34 | 21% | 94% | 71% | 2.32 | 0% |
| warehouse | authored | best of roster | 34 | 6% | 82% | 71% | 2.50 | 0% |
| protection | fresh | first 3 | 34 | 3% | 68% | 62% | 1.82 | 0% |
| protection | fresh | best of roster | 34 | 6% | 47% | 41% | 1.71 | 0% |
| protection | authored | first 3 | 29 | 10% | 97% | 86% | 2.21 | 0% |
| protection | authored | best of roster | 29 | 17% | 86% | 52% | 1.72 | 0% |

## Reading

- fresh roster, holdHack: first N 36% clean wins and 0% left behind; best team 34% and 0%.
- fresh roster, holdExtract: first N 1% clean wins and 53% left behind; best team 4% and 38%.
- authored roster, holdHack: first N 62% clean wins and 0% left behind; best team 77% and 0%.
- authored roster, holdExtract: first N 15% clean wins and 78% left behind; best team 12% and 61%.
