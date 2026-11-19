# How big should the way out of a hack be? (2026-11-19-soak)

`node scripts/sim-wayout.mjs 8 60 2026-11-19-soak`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 (before) | no build | 480 | 77% | 77% | 0.36 | 0% | 3.8 | 10.7 |
| 0 (before) | Ricochet + Contagion | 480 | 81% | 81% | 0.30 | 0% | 3.8 | 9.0 |
| 0.34 | no build | 480 | 77% | 1% | 1.06 | 0% | 5.0 | 17.8 |
| 0.34 | Ricochet + Contagion | 480 | 80% | 8% | 0.96 | 0% | 5.4 | 16.0 |
| 0.5 | no build | 480 | 77% | 1% | 1.06 | 0% | 5.0 | 17.8 |
| 0.5 | Ricochet + Contagion | 480 | 80% | 8% | 0.96 | 0% | 5.4 | 16.0 |
| 0.67 | no build | 480 | 77% | 0% | 1.05 | 0% | 5.0 | 18.2 |
| 0.67 | Ricochet + Contagion | 480 | 81% | 4% | 0.99 | 0% | 5.3 | 16.6 |
| 1 | no build | 480 | 77% | 0% | 1.05 | 0% | 5.0 | 18.2 |
| 1 | Ricochet + Contagion | 480 | 81% | 4% | 0.99 | 0% | 5.3 | 16.6 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 (before) | no build | 480 | 83% | 83% | 0.25 | 0% | 3.8 | 8.3 |
| 0 (before) | Ricochet + Contagion | 480 | 84% | 84% | 0.22 | 0% | 3.8 | 7.1 |
| 0.34 | no build | 480 | 82% | 18% | 0.83 | 0% | 6.0 | 15.1 |
| 0.34 | Ricochet + Contagion | 480 | 84% | 36% | 0.66 | 0% | 6.4 | 12.3 |
| 0.5 | no build | 480 | 82% | 18% | 0.83 | 0% | 6.0 | 15.1 |
| 0.5 | Ricochet + Contagion | 480 | 84% | 36% | 0.66 | 0% | 6.4 | 12.3 |
| 0.67 | no build | 480 | 82% | 12% | 0.90 | 0% | 5.7 | 15.8 |
| 0.67 | Ricochet + Contagion | 480 | 84% | 29% | 0.73 | 0% | 6.3 | 12.8 |
| 1 | no build | 480 | 82% | 12% | 0.90 | 0% | 5.7 | 15.8 |
| 1 | Ricochet + Contagion | 480 | 84% | 29% | 0.73 | 0% | 6.3 | 12.8 |
