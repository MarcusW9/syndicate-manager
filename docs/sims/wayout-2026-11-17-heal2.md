# How big should the way out of a hack be? (2026-11-17-heal2)

`node scripts/sim-wayout.mjs 8 60 2026-11-17-heal2`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.5 | no build: with a medic (360 fights) | | 71% | | 0.97 | | | 15.1 |
| 0.5 | no build: no medic (120 fights) | | 78% | | 0.93 | | | 24.1 |
| 0.5 | no build | 480 | 73% | 5% | 0.96 | 0% | 5.2 | 17.4 |
| 0.5 | Ricochet + Contagion: with a medic (360 fights) | | 81% | | 0.79 | | | 11.6 |
| 0.5 | Ricochet + Contagion: no medic (120 fights) | | 90% | | 0.68 | | | 18.7 |
| 0.5 | Ricochet + Contagion | 480 | 83% | 25% | 0.77 | 0% | 6.2 | 13.4 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.5 | no build: with a medic (480 fights) | | 79% | | 0.68 | | | 10.5 |
| 0.5 | no build: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0.5 | no build | 480 | 79% | 31% | 0.68 | 0% | 6.1 | 10.5 |
| 0.5 | Ricochet + Contagion: with a medic (480 fights) | | 84% | | 0.40 | | | 6.4 |
| 0.5 | Ricochet + Contagion: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0.5 | Ricochet + Contagion | 480 | 84% | 59% | 0.40 | 0% | 6.6 | 6.4 |
