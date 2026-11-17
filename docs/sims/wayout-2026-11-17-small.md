# How big should the way out of a hack be? (2026-11-17-small)

`node scripts/sim-wayout.mjs 8 60 2026-11-17-small`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.2 | no build | 480 | 72% | 7% | 0.96 | 0% | 5.2 |
| 0.2 | Ricochet + Contagion | 480 | 80% | 30% | 0.70 | 0% | 5.8 |
| 0.34 | no build | 480 | 72% | 5% | 0.96 | 0% | 5.1 |
| 0.34 | Ricochet + Contagion | 480 | 80% | 21% | 0.80 | 0% | 5.9 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.2 | no build | 480 | 77% | 39% | 0.60 | 0% | 6.1 |
| 0.2 | Ricochet + Contagion | 480 | 81% | 59% | 0.39 | 0% | 6.3 |
| 0.34 | no build | 480 | 78% | 30% | 0.68 | 0% | 6.0 |
| 0.34 | Ricochet + Contagion | 480 | 81% | 54% | 0.44 | 0% | 6.3 |
