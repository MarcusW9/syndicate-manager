# Hand-picked teams at the real fight difficulty (2026-11-15-before-newjobs-sim)

`node scripts/sim-teams.mjs 100 2026-11-15-before-newjobs-sim`. Not part of the declared gate in `scripts/sim-orders.mjs`; the same fight code, with the game's own starting rosters and each job's real fight difficulty.

## The fights the five jobs really start

| Job | Fights seen | Difficulty (min / median / max) | Enemies at the start |
| --- | --- | --- | --- |
| data_pull | 33 | 12 / 12 / 14 | threat 3 |
| data_scrub | 15 | 9 / 9 / 10 | threat 2 |
| quiet_hours | 33 | 12 / 12 / 14 | threat 3 |
| warehouse | 48 | 14 / 14 / 16 | threat 4 |
| protection | 34 | 12 / 12 / 14 | threat 3 |

## Played hands-off on the defaults, steady risk

"First N" is the first N runners of the roster (what the earlier tables used); "best" is the team the planning read likes best out of every team of that size (win chance, then fewest lost). Fights at the difficulty each seed's real run had.

| Job | Roster | Team | Fights | Clean win | Job done | Someone left behind | Downs | Died |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data_pull | fresh | first 3 | 33 | 27% | 27% | 0% | 1.06 | 0% |
| data_pull | fresh | best of roster | 33 | 42% | 42% | 0% | 0.70 | 0% |
| data_pull | authored | first 3 | 32 | 78% | 78% | 0% | 0.25 | 0% |
| data_pull | authored | best of roster | 32 | 91% | 91% | 0% | 0.09 | 0% |
| data_scrub | fresh | first 2 | 15 | 53% | 53% | 0% | 0.73 | 0% |
| data_scrub | fresh | best of roster | 15 | 33% | 33% | 0% | 0.87 | 0% |
| data_scrub | authored | first 2 | 26 | 69% | 69% | 0% | 0.31 | 0% |
| data_scrub | authored | best of roster | 26 | 92% | 92% | 0% | 0.15 | 0% |
| quiet_hours | fresh | first 3 | 33 | 64% | 64% | 0% | 0.58 | 0% |
| quiet_hours | fresh | best of roster | 33 | 48% | 48% | 0% | 0.73 | 0% |
| quiet_hours | authored | first 3 | 34 | 68% | 68% | 0% | 0.35 | 0% |
| quiet_hours | authored | best of roster | 34 | 91% | 91% | 0% | 0.15 | 0% |
| warehouse | fresh | first 4 | 48 | 2% | 2% | 0% | 1.06 | 0% |
| warehouse | fresh | best of roster | 48 | 4% | 4% | 0% | 0.96 | 0% |
| warehouse | authored | first 4 | 34 | 9% | 9% | 0% | 0.94 | 0% |
| warehouse | authored | best of roster | 34 | 26% | 26% | 0% | 0.74 | 0% |
| protection | fresh | first 3 | 34 | 32% | 32% | 0% | 0.71 | 0% |
| protection | fresh | best of roster | 34 | 44% | 44% | 0% | 0.56 | 0% |
| protection | authored | first 3 | 29 | 52% | 52% | 0% | 0.55 | 0% |
| protection | authored | best of roster | 29 | 66% | 66% | 0% | 0.34 | 0% |

## Reading

- fresh roster, holdHack: first N 48% clean wins and 0% left behind; best team 41% and 0%.
- fresh roster, holdExtract: first N 2% clean wins and 0% left behind; best team 4% and 0%.
- authored roster, holdHack: first N 72% clean wins and 0% left behind; best team 91% and 0%.
- authored roster, holdExtract: first N 9% clean wins and 0% left behind; best team 26% and 0%.
