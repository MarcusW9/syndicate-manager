# How big should the way out of a hack be? (2026-11-17-medic)

`node scripts/sim-wayout.mjs 8 60 2026-11-17-medic`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | no build: with a medic (360 fights) | | 71% | | 0.39 | | |
| 0 | no build: no medic (120 fights) | | 78% | | 0.23 | | |
| 0 (before) | no build | 480 | 73% | 73% | 0.35 | 0% | 3.7 |
| 0 | Ricochet + Contagion: with a medic (360 fights) | | 79% | | 0.29 | | |
| 0 | Ricochet + Contagion: no medic (120 fights) | | 90% | | 0.11 | | |
| 0 (before) | Ricochet + Contagion | 480 | 82% | 82% | 0.25 | 0% | 3.8 |
| 0.5 | no build: with a medic (360 fights) | | 70% | | 0.97 | | |
| 0.5 | no build: no medic (120 fights) | | 78% | | 0.93 | | |
| 0.5 | no build | 480 | 72% | 5% | 0.96 | 0% | 5.2 |
| 0.5 | Ricochet + Contagion: with a medic (360 fights) | | 78% | | 0.83 | | |
| 0.5 | Ricochet + Contagion: no medic (120 fights) | | 90% | | 0.68 | | |
| 0.5 | Ricochet + Contagion | 480 | 81% | 22% | 0.80 | 0% | 6.0 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | no build: with a medic (480 fights) | | 78% | | 0.27 | | |
| 0 | no build: no medic (0 fights) | | 0% | | 0.00 | | |
| 0 (before) | no build | 480 | 78% | 78% | 0.27 | 0% | 3.7 |
| 0 | Ricochet + Contagion: with a medic (480 fights) | | 82% | | 0.20 | | |
| 0 | Ricochet + Contagion: no medic (0 fights) | | 0% | | 0.00 | | |
| 0 (before) | Ricochet + Contagion | 480 | 82% | 82% | 0.20 | 0% | 3.7 |
| 0.5 | no build: with a medic (480 fights) | | 76% | | 0.69 | | |
| 0.5 | no build: no medic (0 fights) | | 0% | | 0.00 | | |
| 0.5 | no build | 480 | 76% | 29% | 0.69 | 0% | 5.9 |
| 0.5 | Ricochet + Contagion: with a medic (480 fights) | | 81% | | 0.45 | | |
| 0.5 | Ricochet + Contagion: no medic (0 fights) | | 0% | | 0.00 | | |
| 0.5 | Ricochet + Contagion | 480 | 81% | 54% | 0.45 | 0% | 6.3 |

## What it says (Claude's read, 2026-11-17)

Run with `MEDIC=1 SHARES=0,0.5`. Rows split the best team by whether it has a medic.

- **Most teams already have one:** 75% of data_pull teams (360 of 480 fights) and all of quiet_hours.
- **The medic does not lower runners-down on the way out.** data_pull with the way out: 0.97 downs with a medic against 0.93 without (0.83 and 0.68 with Ricochet and the Contagion Vector). The aura heals one pip a round and stops bleeding, but it does not stop the first runner going down, and on steady the first down breaks the fight off.
- **The "downs" column over-counts the injury cost.** It counts anyone who was down at any point, even a runner a medic stabilised, who does not take the serious 21-day injury (`runfight.js fightInjuries`). The real recovery days are not measured here; the next step is to measure injury days with the stabilise split out before picking any numbers.
