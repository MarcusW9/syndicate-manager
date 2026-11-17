# How big should the way out of a hack be? (2026-11-17-medic-treats)

`node scripts/sim-wayout.mjs 8 60 2026-11-17-medic-treats`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | no build: with a medic (360 fights) | | 71% | | 0.39 | | | 8.6 |
| 0 | no build: no medic (120 fights) | | 78% | | 0.23 | | | 8.9 |
| 0 (before) | no build | 480 | 73% | 73% | 0.35 | 0% | 3.7 | 8.6 |
| 0 | Ricochet + Contagion: with a medic (360 fights) | | 79% | | 0.29 | | | 6.4 |
| 0 | Ricochet + Contagion: no medic (120 fights) | | 90% | | 0.11 | | | 4.9 |
| 0 (before) | Ricochet + Contagion | 480 | 82% | 82% | 0.25 | 0% | 3.8 | 6.0 |
| 0.5 | no build: with a medic (360 fights) | | 70% | | 0.97 | | | 16.3 |
| 0.5 | no build: no medic (120 fights) | | 78% | | 0.93 | | | 24.1 |
| 0.5 | no build | 480 | 72% | 5% | 0.96 | 0% | 5.2 | 18.3 |
| 0.5 | Ricochet + Contagion: with a medic (360 fights) | | 78% | | 0.83 | | | 13.1 |
| 0.5 | Ricochet + Contagion: no medic (120 fights) | | 90% | | 0.68 | | | 18.7 |
| 0.5 | Ricochet + Contagion | 480 | 81% | 22% | 0.80 | 0% | 6.0 | 14.5 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | no build: with a medic (480 fights) | | 78% | | 0.27 | | | 6.2 |
| 0 | no build: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0 (before) | no build | 480 | 78% | 78% | 0.27 | 0% | 3.7 | 6.2 |
| 0 | Ricochet + Contagion: with a medic (480 fights) | | 82% | | 0.20 | | | 4.6 |
| 0 | Ricochet + Contagion: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0 (before) | Ricochet + Contagion | 480 | 82% | 82% | 0.20 | 0% | 3.7 | 4.6 |
| 0.5 | no build: with a medic (480 fights) | | 76% | | 0.69 | | | 12.5 |
| 0.5 | no build: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0.5 | no build | 480 | 76% | 29% | 0.69 | 0% | 5.9 | 12.5 |
| 0.5 | Ricochet + Contagion: with a medic (480 fights) | | 81% | | 0.45 | | | 8.4 |
| 0.5 | Ricochet + Contagion: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0.5 | Ricochet + Contagion | 480 | 81% | 54% | 0.45 | 0% | 6.3 | 8.4 |
