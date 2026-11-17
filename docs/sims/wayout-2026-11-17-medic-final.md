# How big should the way out of a hack be? (2026-11-17-medic-final)

`node scripts/sim-wayout.mjs 8 60 2026-11-17-medic-final`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (8 campaigns, 60 fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).

## data_pull (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | no build: with a medic (360 fights) | | 72% | | 0.38 | | | 8.2 |
| 0 | no build: no medic (120 fights) | | 78% | | 0.23 | | | 8.9 |
| 0 (before) | no build | 480 | 74% | 74% | 0.34 | 0% | 3.8 | 8.3 |
| 0 | Ricochet + Contagion: with a medic (360 fights) | | 82% | | 0.26 | | | 5.5 |
| 0 | Ricochet + Contagion: no medic (120 fights) | | 90% | | 0.11 | | | 4.9 |
| 0 (before) | Ricochet + Contagion | 480 | 84% | 84% | 0.22 | 0% | 3.8 | 5.4 |
| 0.5 | no build: with a medic (360 fights) | | 71% | | 0.97 | | | 15.1 |
| 0.5 | no build: no medic (120 fights) | | 78% | | 0.93 | | | 24.1 |
| 0.5 | no build | 480 | 73% | 5% | 0.96 | 0% | 5.2 | 17.4 |
| 0.5 | Ricochet + Contagion: with a medic (360 fights) | | 81% | | 0.79 | | | 11.6 |
| 0.5 | Ricochet + Contagion: no medic (120 fights) | | 90% | | 0.68 | | | 18.7 |
| 0.5 | Ricochet + Contagion | 480 | 83% | 25% | 0.77 | 0% | 6.2 | 13.4 |

## quiet_hours (8 teams)

| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds | Recovery days a fight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | no build: with a medic (480 fights) | | 79% | | 0.26 | | | 5.8 |
| 0 | no build: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0 (before) | no build | 480 | 79% | 79% | 0.26 | 0% | 3.7 | 5.8 |
| 0 | Ricochet + Contagion: with a medic (480 fights) | | 84% | | 0.18 | | | 4.0 |
| 0 | Ricochet + Contagion: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0 (before) | Ricochet + Contagion | 480 | 84% | 84% | 0.18 | 0% | 3.8 | 4.0 |
| 0.5 | no build: with a medic (480 fights) | | 79% | | 0.68 | | | 10.5 |
| 0.5 | no build: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0.5 | no build | 480 | 79% | 31% | 0.68 | 0% | 6.1 | 10.5 |
| 0.5 | Ricochet + Contagion: with a medic (480 fights) | | 84% | | 0.40 | | | 6.4 |
| 0.5 | Ricochet + Contagion: no medic (0 fights) | | 0% | | 0.00 | | | 0.0 |
| 0.5 | Ricochet + Contagion | 480 | 84% | 59% | 0.40 | 0% | 6.6 | 6.4 |

## What it says (Claude's read, 2026-11-17, the medic version built)

Recovery days a fight: a downed runner who is not stabilised is 21 days; a standing runner left at serious is 14, at light 3 (as `runfight.js fightInjuries` writes them). Before the way out, data_pull cost 8.3 days a fight and quiet_hours 5.8.

- **The medic version halves the gap, not all of it.** With the way out, data_pull costs 17.4 days (no build) and quiet_hours 10.5. A team with a medic standing costs 15.1 on data_pull against 24.1 without one: the medic takes 37% off. With Ricochet and the Contagion Vector: 11.6 with a medic, 18.7 without.
- **Where the rest comes from.** About 70% of runners who go down on the way out still come home unstabilised, mostly because the medic is the one down or is not on the team, or the stabilise roll fails (difficulty 14, step -4). Standing runners at serious are rare (10 in 1,900).
- **Before the change the medic did almost nothing here** (21.0 against 24.1 days): the fight ended the instant someone went down, so the medic never had a turn.
- **No deaths in any row.** Job done is unchanged (72% to 73%).
- **The levers** are `FIGHT.wayOutTreatStep` (the roll, -4; -8 only reaches 14.8 days, so the roll is not the limit), `FIGHT.wayOutTreatHeal` (the patch, 1 pip; it changed nothing here), and `FIGHT.wayOutShare` (the size of the second group). To bring a medic team all the way back to 8 days the choice is an automatic steady for everyone the medic can reach (no roll), a second healer's worth of help, or lighter injuries for the unstabilised: the owner's call.
