# How big should the way out of a hack be? (2026-11-19-anyhealer-before)

`node scripts/sim-wayout.mjs 8 60 2026-11-19-anyhealer-before`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | no build: with a medic (360 fights) | | 77% | | 0.37 | | | 9.3 |
| 0 | no build: no medic (120 fights) | | 78% | | 0.31 | | | 14.7 |
| 0 (before) | no build | 480 | 77% | 77% | 0.36 | 0% | 3.8 | 10.7 |
| 0 | Ricochet + Contagion: with a medic (360 fights) | | 80% | | 0.33 | | | 8.5 |
| 0 | Ricochet + Contagion: no medic (120 fights) | | 83% | | 0.22 | | | 10.4 |
| 0 (before) | Ricochet + Contagion | 480 | 81% | 81% | 0.30 | 0% | 3.8 | 9.0 |
| 0.34 | no build: with a medic (360 fights) | | 77% | | 1.07 | | | 13.6 |
| 0.34 | no build: no medic (120 fights) | | 78% | | 1.01 | | | 30.2 |
| 0.34 | no build | 480 | 77% | 1% | 1.06 | 0% | 5.0 | 17.8 |
| 0.34 | Ricochet + Contagion: with a medic (360 fights) | | 80% | | 1.03 | | | 13.4 |
| 0.34 | Ricochet + Contagion: no medic (120 fights) | | 81% | | 0.74 | | | 23.6 |
| 0.34 | Ricochet + Contagion | 480 | 80% | 8% | 0.96 | 0% | 5.4 | 16.0 |
| 0.5 | no build: with a medic (360 fights) | | 77% | | 1.07 | | | 13.6 |
| 0.5 | no build: no medic (120 fights) | | 78% | | 1.01 | | | 30.2 |
| 0.5 | no build | 480 | 77% | 1% | 1.06 | 0% | 5.0 | 17.8 |
| 0.5 | Ricochet + Contagion: with a medic (360 fights) | | 80% | | 1.03 | | | 13.4 |
| 0.5 | Ricochet + Contagion: no medic (120 fights) | | 81% | | 0.74 | | | 23.6 |
| 0.5 | Ricochet + Contagion | 480 | 80% | 8% | 0.96 | 0% | 5.4 | 16.0 |
| 0.67 | no build: with a medic (360 fights) | | 77% | | 1.05 | | | 14.0 |
| 0.67 | no build: no medic (120 fights) | | 78% | | 1.07 | | | 30.8 |
| 0.67 | no build | 480 | 77% | 0% | 1.05 | 0% | 5.0 | 18.2 |
| 0.67 | Ricochet + Contagion: with a medic (360 fights) | | 80% | | 1.03 | | | 13.5 |
| 0.67 | Ricochet + Contagion: no medic (120 fights) | | 83% | | 0.88 | | | 26.1 |
| 0.67 | Ricochet + Contagion | 480 | 81% | 4% | 0.99 | 0% | 5.3 | 16.6 |
| 1 | no build: with a medic (360 fights) | | 77% | | 1.05 | | | 14.0 |
| 1 | no build: no medic (120 fights) | | 78% | | 1.07 | | | 30.8 |
| 1 | no build | 480 | 77% | 0% | 1.05 | 0% | 5.0 | 18.2 |
| 1 | Ricochet + Contagion: with a medic (360 fights) | | 80% | | 1.03 | | | 13.5 |
| 1 | Ricochet + Contagion: no medic (120 fights) | | 83% | | 0.88 | | | 26.1 |
| 1 | Ricochet + Contagion | 480 | 81% | 4% | 0.99 | 0% | 5.3 | 16.6 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | no build: with a medic (420 fights) | | 85% | | 0.22 | | | 6.5 |
| 0 | no build: no medic (60 fights) | | 65% | | 0.48 | | | 20.2 |
| 0 (before) | no build | 480 | 83% | 83% | 0.25 | 0% | 3.8 | 8.3 |
| 0 | Ricochet + Contagion: with a medic (420 fights) | | 87% | | 0.19 | | | 5.8 |
| 0 | Ricochet + Contagion: no medic (60 fights) | | 68% | | 0.42 | | | 16.5 |
| 0 (before) | Ricochet + Contagion | 480 | 84% | 84% | 0.22 | 0% | 3.8 | 7.1 |
| 0.34 | no build: with a medic (420 fights) | | 85% | | 0.80 | | | 12.9 |
| 0.34 | no build: no medic (60 fights) | | 63% | | 1.03 | | | 30.7 |
| 0.34 | no build | 480 | 82% | 18% | 0.83 | 0% | 6.0 | 15.1 |
| 0.34 | Ricochet + Contagion: with a medic (420 fights) | | 87% | | 0.63 | | | 10.3 |
| 0.34 | Ricochet + Contagion: no medic (60 fights) | | 68% | | 0.90 | | | 26.4 |
| 0.34 | Ricochet + Contagion | 480 | 84% | 36% | 0.66 | 0% | 6.4 | 12.3 |
| 0.5 | no build: with a medic (420 fights) | | 85% | | 0.80 | | | 12.9 |
| 0.5 | no build: no medic (60 fights) | | 63% | | 1.03 | | | 30.7 |
| 0.5 | no build | 480 | 82% | 18% | 0.83 | 0% | 6.0 | 15.1 |
| 0.5 | Ricochet + Contagion: with a medic (420 fights) | | 87% | | 0.63 | | | 10.3 |
| 0.5 | Ricochet + Contagion: no medic (60 fights) | | 68% | | 0.90 | | | 26.4 |
| 0.5 | Ricochet + Contagion | 480 | 84% | 36% | 0.66 | 0% | 6.4 | 12.3 |
| 0.67 | no build: with a medic (420 fights) | | 85% | | 0.88 | | | 13.7 |
| 0.67 | no build: no medic (60 fights) | | 65% | | 1.03 | | | 31.1 |
| 0.67 | no build | 480 | 82% | 12% | 0.90 | 0% | 5.7 | 15.8 |
| 0.67 | Ricochet + Contagion: with a medic (420 fights) | | 86% | | 0.70 | | | 11.0 |
| 0.67 | Ricochet + Contagion: no medic (60 fights) | | 68% | | 0.90 | | | 25.9 |
| 0.67 | Ricochet + Contagion | 480 | 84% | 29% | 0.73 | 0% | 6.3 | 12.8 |
| 1 | no build: with a medic (420 fights) | | 85% | | 0.88 | | | 13.7 |
| 1 | no build: no medic (60 fights) | | 65% | | 1.03 | | | 31.1 |
| 1 | no build | 480 | 82% | 12% | 0.90 | 0% | 5.7 | 15.8 |
| 1 | Ricochet + Contagion: with a medic (420 fights) | | 86% | | 0.70 | | | 11.0 |
| 1 | Ricochet + Contagion: no medic (60 fights) | | 68% | | 0.90 | | | 25.9 |
| 1 | Ricochet + Contagion | 480 | 84% | 29% | 0.73 | 0% | 6.3 | 12.8 |
