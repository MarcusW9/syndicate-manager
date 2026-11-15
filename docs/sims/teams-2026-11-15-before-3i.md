# Hand-picked teams at the real fight difficulty (2026-11-15-before-3i)

`node scripts/sim-teams.mjs 100 2026-11-15-before-3i`. Not part of the declared gate in `scripts/sim-orders.mjs`; the same fight code, with the game's own starting rosters and each job's real fight difficulty.

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
| data_pull | fresh | first 3 | 33 | 21% | 21% | 0% | 1.06 | 0% |
| data_pull | fresh | best of roster | 33 | 18% | 18% | 0% | 1.00 | 0% |
| data_pull | authored | first 3 | 32 | 72% | 72% | 0% | 0.44 | 0% |
| data_pull | authored | best of roster | 32 | 81% | 81% | 0% | 0.22 | 0% |
| data_scrub | fresh | first 2 | 15 | 40% | 40% | 0% | 0.67 | 0% |
| data_scrub | fresh | best of roster | 15 | 60% | 60% | 0% | 0.67 | 0% |
| data_scrub | authored | first 2 | 26 | 92% | 92% | 0% | 0.08 | 0% |
| data_scrub | authored | best of roster | 26 | 92% | 92% | 0% | 0.12 | 0% |
| quiet_hours | fresh | first 3 | 33 | 61% | 61% | 0% | 0.58 | 0% |
| quiet_hours | fresh | best of roster | 33 | 48% | 48% | 0% | 0.76 | 0% |
| quiet_hours | authored | first 3 | 34 | 68% | 68% | 0% | 0.35 | 0% |
| quiet_hours | authored | best of roster | 34 | 91% | 91% | 0% | 0.15 | 0% |
| warehouse | fresh | first 4 | 48 | 17% | 17% | 0% | 0.85 | 0% |
| warehouse | fresh | best of roster | 48 | 23% | 23% | 0% | 0.79 | 0% |
| warehouse | authored | first 4 | 34 | 53% | 53% | 0% | 0.47 | 0% |
| warehouse | authored | best of roster | 34 | 50% | 50% | 0% | 0.47 | 0% |
| protection | fresh | first 3 | 34 | 24% | 24% | 0% | 0.76 | 0% |
| protection | fresh | best of roster | 34 | 35% | 35% | 0% | 0.65 | 0% |
| protection | authored | first 3 | 29 | 52% | 52% | 0% | 0.48 | 0% |
| protection | authored | best of roster | 29 | 72% | 72% | 0% | 0.24 | 0% |

## Reading

- fresh roster, holdHack: first N 41% clean wins and 0% left behind; best team 42% and 0%.
- fresh roster, holdExtract: first N 17% clean wins and 0% left behind; best team 23% and 0%.
- authored roster, holdHack: first N 77% clean wins and 0% left behind; best team 88% and 0%.
- authored roster, holdExtract: first N 53% clean wins and 0% left behind; best team 50% and 0%.
