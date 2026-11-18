# How big should the way out of a hack be? (2026-11-18-hitsize-before)

`node scripts/sim-wayout.mjs 8 60 2026-11-18-hitsize-before`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 (before) | no build | 480 | 73% | 73% | 0.40 | 0% | 3.7 | 11.0 |
| 0 (before) | Ricochet + Contagion | 480 | 77% | 77% | 0.36 | 0% | 3.7 | 9.8 |
| 0.34 | no build | 480 | 73% | 0% | 1.07 | 0% | 4.7 | 17.1 |
| 0.34 | Ricochet + Contagion | 480 | 77% | 2% | 1.04 | 0% | 5.0 | 16.3 |
| 0.5 | no build | 480 | 73% | 0% | 1.07 | 0% | 4.7 | 17.1 |
| 0.5 | Ricochet + Contagion | 480 | 77% | 2% | 1.04 | 0% | 5.0 | 16.3 |
| 0.67 | no build | 480 | 73% | 0% | 1.07 | 0% | 4.8 | 17.5 |
| 0.67 | Ricochet + Contagion | 480 | 77% | 1% | 1.04 | 0% | 5.0 | 15.8 |
| 1 | no build | 480 | 73% | 0% | 1.07 | 0% | 4.8 | 17.5 |
| 1 | Ricochet + Contagion | 480 | 77% | 1% | 1.04 | 0% | 5.0 | 15.8 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 (before) | no build | 480 | 79% | 79% | 0.31 | 0% | 3.8 | 9.1 |
| 0 (before) | Ricochet + Contagion | 480 | 82% | 82% | 0.24 | 0% | 3.8 | 7.3 |
| 0.34 | no build | 480 | 79% | 10% | 0.94 | 0% | 5.6 | 15.3 |
| 0.34 | Ricochet + Contagion | 480 | 81% | 31% | 0.72 | 0% | 6.4 | 12.7 |
| 0.5 | no build | 480 | 79% | 10% | 0.94 | 0% | 5.6 | 15.3 |
| 0.5 | Ricochet + Contagion | 480 | 81% | 31% | 0.72 | 0% | 6.4 | 12.7 |
| 0.67 | no build | 480 | 79% | 7% | 0.98 | 0% | 5.4 | 15.9 |
| 0.67 | Ricochet + Contagion | 480 | 81% | 23% | 0.80 | 0% | 6.3 | 13.4 |
| 1 | no build | 480 | 79% | 7% | 0.98 | 0% | 5.4 | 15.9 |
| 1 | Ricochet + Contagion | 480 | 81% | 23% | 0.80 | 0% | 6.3 | 13.4 |
