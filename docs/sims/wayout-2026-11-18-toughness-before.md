# How big should the way out of a hack be? (2026-11-18-toughness-before)

`node scripts/sim-wayout.mjs 8 60 2026-11-18-toughness-before`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 (before) | no build | 480 | 77% | 77% | 0.36 | 0% | 3.8 | 10.6 |
| 0 (before) | Ricochet + Contagion | 480 | 81% | 81% | 0.31 | 0% | 3.8 | 8.9 |
| 0.34 | no build | 480 | 77% | 1% | 1.06 | 0% | 5.0 | 17.9 |
| 0.34 | Ricochet + Contagion | 480 | 81% | 8% | 0.97 | 0% | 5.4 | 15.8 |
| 0.5 | no build | 480 | 77% | 1% | 1.06 | 0% | 5.0 | 17.9 |
| 0.5 | Ricochet + Contagion | 480 | 81% | 8% | 0.97 | 0% | 5.4 | 15.8 |
| 0.67 | no build | 480 | 77% | 0% | 1.06 | 0% | 5.0 | 18.2 |
| 0.67 | Ricochet + Contagion | 480 | 81% | 4% | 1.00 | 0% | 5.4 | 16.8 |
| 1 | no build | 480 | 77% | 0% | 1.06 | 0% | 5.0 | 18.2 |
| 1 | Ricochet + Contagion | 480 | 81% | 4% | 1.00 | 0% | 5.4 | 16.8 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 (before) | no build | 480 | 83% | 83% | 0.26 | 0% | 3.8 | 8.5 |
| 0 (before) | Ricochet + Contagion | 480 | 85% | 85% | 0.21 | 0% | 3.8 | 7.2 |
| 0.34 | no build | 480 | 82% | 14% | 0.88 | 0% | 5.9 | 14.3 |
| 0.34 | Ricochet + Contagion | 480 | 85% | 31% | 0.71 | 0% | 6.4 | 12.2 |
| 0.5 | no build | 480 | 82% | 14% | 0.88 | 0% | 5.9 | 14.3 |
| 0.5 | Ricochet + Contagion | 480 | 85% | 31% | 0.71 | 0% | 6.4 | 12.2 |
| 0.67 | no build | 480 | 83% | 9% | 0.93 | 0% | 5.7 | 14.9 |
| 0.67 | Ricochet + Contagion | 480 | 85% | 25% | 0.76 | 0% | 6.3 | 12.7 |
| 1 | no build | 480 | 83% | 9% | 0.93 | 0% | 5.7 | 14.9 |
| 1 | Ricochet + Contagion | 480 | 85% | 25% | 0.76 | 0% | 6.3 | 12.7 |
