# Sim: how the Cytotoxic Vector should scale (2026-11-20-identity)

Round 2: a new identity (through armour, or the infection weakens) instead of more damage. Round 1 (bigger ticks) is `docs/sims/cytotoxic-2026-11-20.md`.

Owner, 2026-11-20: Contagion matches or beats Cytotoxic everywhere, so Cytotoxic should scale to deal more damage over time. It has no spread, but paired with Ricochet (one round through up to three targets, once a fight) it might do better. Measurement only: the variants exist only inside `scripts/sim-cytotoxic.mjs`.

- **Fights played:** 662400 (20 crews of 4 to 6, 40 fights a crew a job, 2 jobs: warehouse (docks, threat 4); data_pull (heights, threat 3)); 128 s.
- **Builds go to** the best combat runner (and the second best in the "x2" rows). Their Medical is 6 to 14 (the sim crews), so "by Medical" plays all three of its steps.
- **Mixes:** the job's own, threat 5, heavy, armoured, swarm, mixed. Threat 5: each job at threat 5 (+5 HP a body). Heavy: three enforcers and three corp (20 HP each, 25 at threat 4). Armoured: two police, two secforce, two drones (plates; drones are immune to both vectors). Swarm: six hired (10 HP). Mixed: the job's own plus two drones and two corp.
- **Clean win** = won with nobody down. **Tick HP** = HP the infection dealt a fight; **tick kills** = bodies the tick itself finished, a fight.

## The vectors

| Vector | What it does |
| --- | --- |
| Cyto: today | 10 HP a round until it falls (the game today) |
| Cyto: tick 20 | a flat 20 HP a round |
| Cyto: through armour | a hit that only cracks a plate infects too |
| Cyto: weakens aim | an infected enemy is 20 points less likely to hit |
| Cyto: weakens hits | an infected enemy hits for half |
| Cyto: armour + weakens aim | both: cracking infects, and the infected aim worse |
| Contagion | 10 HP a round for 2 rounds; jumps when the host falls (the game today) |

## Clean wins, steady

| Build | the job's own | threat 5 | heavy | armoured | swarm | mixed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| no build | 87% | 56% | 2% | 29% | 65% | 5% |
| Ricochet | 87% | 60% | 2% | 35% | 74% | 10% |
| Cyto: today | 88% | 58% | 2% | 31% | 67% | 5% |
| Ricochet + Cyto: today | 88% | 63% | 5% | 40% | 79% | 13% |
| Ricochet + Cyto: today, x2 | 96% | 76% | 14% | 60% | 92% | 23% |
| Cyto: tick 20 | 89% | 59% | 2% | 31% | 67% | 5% |
| Ricochet + Cyto: tick 20 | 88% | 64% | 5% | 40% | 79% | 14% |
| Ricochet + Cyto: tick 20, x2 | 96% | 78% | 15% | 60% | 92% | 25% |
| Cyto: through armour | 88% | 58% | 2% | 33% | 67% | 5% |
| Ricochet + Cyto: through armour | 88% | 63% | 5% | 50% | 79% | 13% |
| Ricochet + Cyto: through armour, x2 | 96% | 76% | 14% | 71% | 92% | 23% |
| Cyto: weakens aim | 89% | 59% | 2% | 31% | 68% | 6% |
| Ricochet + Cyto: weakens aim | 89% | 65% | 7% | 41% | 80% | 15% |
| Ricochet + Cyto: weakens aim, x2 | 97% | 79% | 18% | 61% | 93% | 27% |
| Cyto: weakens hits | 90% | 60% | 2% | 32% | 69% | 6% |
| Ricochet + Cyto: weakens hits | 91% | 68% | 8% | 43% | 82% | 16% |
| Ricochet + Cyto: weakens hits, x2 | 99% | 85% | 24% | 62% | 95% | 31% |
| Cyto: armour + weakens aim | 89% | 59% | 2% | 34% | 68% | 6% |
| Ricochet + Cyto: armour + weakens aim | 89% | 65% | 7% | 53% | 80% | 15% |
| Ricochet + Cyto: armour + weakens aim, x2 | 97% | 79% | 18% | 76% | 93% | 27% |
| Contagion | 89% | 60% | 2% | 36% | 72% | 6% |
| Ricochet + Contagion | 89% | 64% | 8% | 47% | 82% | 17% |
| Ricochet + Contagion, x2 | 97% | 77% | 21% | 67% | 96% | 29% |

## Clean wins, committed

| Build | the job's own | threat 5 | heavy | armoured | swarm | mixed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| no build | 88% | 57% | 2% | 30% | 66% | 5% |
| Ricochet | 87% | 61% | 3% | 35% | 74% | 10% |
| Cyto: today | 89% | 59% | 2% | 31% | 68% | 6% |
| Ricochet + Cyto: today | 89% | 64% | 6% | 40% | 79% | 14% |
| Ricochet + Cyto: today, x2 | 97% | 77% | 17% | 60% | 93% | 25% |
| Cyto: tick 20 | 89% | 59% | 2% | 31% | 68% | 6% |
| Ricochet + Cyto: tick 20 | 89% | 66% | 6% | 40% | 79% | 15% |
| Ricochet + Cyto: tick 20, x2 | 97% | 79% | 18% | 60% | 93% | 26% |
| Cyto: through armour | 89% | 59% | 2% | 34% | 68% | 6% |
| Ricochet + Cyto: through armour | 89% | 64% | 6% | 50% | 79% | 14% |
| Ricochet + Cyto: through armour, x2 | 97% | 77% | 17% | 72% | 93% | 25% |
| Cyto: weakens aim | 89% | 60% | 2% | 32% | 69% | 6% |
| Ricochet + Cyto: weakens aim | 90% | 66% | 8% | 41% | 80% | 16% |
| Ricochet + Cyto: weakens aim, x2 | 98% | 80% | 22% | 61% | 93% | 28% |
| Cyto: weakens hits | 90% | 61% | 2% | 32% | 70% | 6% |
| Ricochet + Cyto: weakens hits | 91% | 69% | 9% | 43% | 82% | 16% |
| Ricochet + Cyto: weakens hits, x2 | 99% | 85% | 26% | 62% | 95% | 32% |
| Cyto: armour + weakens aim | 89% | 60% | 2% | 35% | 69% | 6% |
| Ricochet + Cyto: armour + weakens aim | 90% | 66% | 8% | 53% | 80% | 16% |
| Ricochet + Cyto: armour + weakens aim, x2 | 98% | 80% | 22% | 76% | 93% | 28% |
| Contagion | 90% | 61% | 2% | 36% | 73% | 7% |
| Ricochet + Contagion | 89% | 65% | 10% | 47% | 82% | 18% |
| Ricochet + Contagion, x2 | 97% | 79% | 25% | 68% | 96% | 31% |

## What the infection did, steady (a fight)

| Build | Mix | Clean win | Won | Downs | Rounds | Tick HP | Tick kills | Infects | Stacks added | Jumps |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| no build | the job's own | 87% | 88% | 0.1 | 6.0 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet | the job's own | 87% | 87% | 0.1 | 5.8 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cyto: today | the job's own | 88% | 89% | 0.1 | 5.9 | 2.2 | 0.20 | 0.86 | 0.00 | 0.00 |
| Ricochet + Cyto: today | the job's own | 88% | 89% | 0.1 | 5.7 | 3.6 | 0.33 | 1.69 | 0.00 | 0.00 |
| Ricochet + Cyto: today, x2 | the job's own | 96% | 96% | 0.0 | 5.8 | 5.6 | 0.50 | 2.44 | 0.00 | 0.00 |
| Cyto: tick 20 | the job's own | 89% | 90% | 0.1 | 5.9 | 4.2 | 0.21 | 0.86 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20 | the job's own | 88% | 89% | 0.1 | 5.7 | 7.0 | 0.35 | 1.69 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20, x2 | the job's own | 96% | 96% | 0.0 | 5.8 | 10.7 | 0.53 | 2.44 | 0.00 | 0.00 |
| Cyto: through armour | the job's own | 88% | 89% | 0.1 | 5.9 | 2.2 | 0.20 | 0.86 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour | the job's own | 88% | 89% | 0.1 | 5.7 | 3.6 | 0.33 | 1.69 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour, x2 | the job's own | 96% | 96% | 0.0 | 5.8 | 5.6 | 0.50 | 2.44 | 0.00 | 0.00 |
| Cyto: weakens aim | the job's own | 89% | 90% | 0.1 | 5.9 | 2.2 | 0.20 | 0.86 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim | the job's own | 89% | 90% | 0.1 | 5.8 | 3.6 | 0.33 | 1.68 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim, x2 | the job's own | 97% | 97% | 0.0 | 5.8 | 5.6 | 0.50 | 2.44 | 0.00 | 0.00 |
| Cyto: weakens hits | the job's own | 90% | 90% | 0.1 | 6.0 | 2.3 | 0.21 | 0.86 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits | the job's own | 91% | 91% | 0.1 | 5.8 | 3.6 | 0.33 | 1.68 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits, x2 | the job's own | 99% | 99% | 0.0 | 5.8 | 5.6 | 0.50 | 2.43 | 0.00 | 0.00 |
| Cyto: armour + weakens aim | the job's own | 89% | 90% | 0.1 | 5.9 | 2.2 | 0.20 | 0.86 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim | the job's own | 89% | 90% | 0.1 | 5.8 | 3.6 | 0.33 | 1.68 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim, x2 | the job's own | 97% | 97% | 0.0 | 5.8 | 5.6 | 0.50 | 2.44 | 0.00 | 0.00 |
| Contagion | the job's own | 89% | 90% | 0.1 | 5.9 | 4.5 | 0.37 | 0.77 | 0.00 | 0.68 |
| Ricochet + Contagion | the job's own | 89% | 89% | 0.1 | 5.7 | 4.5 | 0.39 | 1.44 | 0.00 | 0.57 |
| Ricochet + Contagion, x2 | the job's own | 97% | 97% | 0.0 | 5.7 | 6.4 | 0.56 | 2.08 | 0.00 | 0.60 |
| no build | threat 5 | 56% | 61% | 0.5 | 5.6 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet | threat 5 | 60% | 61% | 0.4 | 5.3 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cyto: today | threat 5 | 58% | 63% | 0.4 | 5.5 | 2.5 | 0.21 | 0.84 | 0.00 | 0.00 |
| Ricochet + Cyto: today | threat 5 | 63% | 64% | 0.4 | 5.3 | 6.0 | 0.48 | 1.83 | 0.00 | 0.00 |
| Ricochet + Cyto: today, x2 | threat 5 | 76% | 76% | 0.2 | 5.6 | 10.8 | 0.78 | 3.10 | 0.00 | 0.00 |
| Cyto: tick 20 | threat 5 | 59% | 63% | 0.4 | 5.5 | 4.6 | 0.23 | 0.84 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20 | threat 5 | 64% | 65% | 0.4 | 5.3 | 10.8 | 0.54 | 1.84 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20, x2 | threat 5 | 78% | 79% | 0.2 | 5.6 | 18.5 | 0.93 | 3.15 | 0.00 | 0.00 |
| Cyto: through armour | threat 5 | 58% | 63% | 0.4 | 5.5 | 2.5 | 0.21 | 0.84 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour | threat 5 | 63% | 64% | 0.4 | 5.3 | 6.0 | 0.48 | 1.83 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour, x2 | threat 5 | 76% | 76% | 0.2 | 5.6 | 10.8 | 0.78 | 3.10 | 0.00 | 0.00 |
| Cyto: weakens aim | threat 5 | 59% | 63% | 0.4 | 5.6 | 2.5 | 0.21 | 0.85 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim | threat 5 | 65% | 65% | 0.4 | 5.4 | 6.1 | 0.49 | 1.84 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim, x2 | threat 5 | 79% | 79% | 0.2 | 5.7 | 10.9 | 0.79 | 3.15 | 0.00 | 0.00 |
| Cyto: weakens hits | threat 5 | 60% | 64% | 0.4 | 5.6 | 2.6 | 0.22 | 0.85 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits | threat 5 | 68% | 68% | 0.3 | 5.4 | 6.3 | 0.51 | 1.85 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits, x2 | threat 5 | 85% | 85% | 0.2 | 5.8 | 11.2 | 0.81 | 3.20 | 0.00 | 0.00 |
| Cyto: armour + weakens aim | threat 5 | 59% | 63% | 0.4 | 5.6 | 2.5 | 0.21 | 0.85 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim | threat 5 | 65% | 65% | 0.4 | 5.4 | 6.1 | 0.49 | 1.84 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim, x2 | threat 5 | 79% | 79% | 0.2 | 5.7 | 10.9 | 0.79 | 3.15 | 0.00 | 0.00 |
| Contagion | threat 5 | 60% | 63% | 0.4 | 5.5 | 7.0 | 0.45 | 0.73 | 0.00 | 0.85 |
| Ricochet + Contagion | threat 5 | 64% | 64% | 0.4 | 5.3 | 8.8 | 0.64 | 1.51 | 0.00 | 0.95 |
| Ricochet + Contagion, x2 | threat 5 | 77% | 78% | 0.2 | 5.6 | 13.9 | 0.91 | 2.50 | 0.00 | 1.04 |
| no build | heavy | 2% | 8% | 1.7 | 3.4 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet | heavy | 2% | 9% | 1.7 | 3.5 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cyto: today | heavy | 2% | 8% | 1.7 | 3.4 | 1.6 | 0.13 | 0.55 | 0.00 | 0.00 |
| Ricochet + Cyto: today | heavy | 5% | 13% | 1.4 | 3.4 | 9.3 | 0.61 | 1.87 | 0.00 | 0.00 |
| Ricochet + Cyto: today, x2 | heavy | 14% | 24% | 1.1 | 3.7 | 14.3 | 1.06 | 3.34 | 0.00 | 0.00 |
| Cyto: tick 20 | heavy | 2% | 8% | 1.7 | 3.4 | 2.9 | 0.15 | 0.55 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20 | heavy | 5% | 14% | 1.4 | 3.4 | 16.1 | 0.80 | 1.89 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20, x2 | heavy | 15% | 25% | 1.1 | 3.7 | 25.4 | 1.27 | 3.37 | 0.00 | 0.00 |
| Cyto: through armour | heavy | 2% | 8% | 1.7 | 3.4 | 1.6 | 0.13 | 0.55 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour | heavy | 5% | 13% | 1.4 | 3.4 | 9.3 | 0.61 | 1.87 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour, x2 | heavy | 14% | 24% | 1.1 | 3.7 | 14.3 | 1.06 | 3.34 | 0.00 | 0.00 |
| Cyto: weakens aim | heavy | 2% | 8% | 1.7 | 3.4 | 1.7 | 0.14 | 0.55 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim | heavy | 7% | 16% | 1.4 | 3.6 | 10.1 | 0.67 | 1.91 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim, x2 | heavy | 18% | 29% | 1.0 | 4.0 | 15.5 | 1.15 | 3.49 | 0.00 | 0.00 |
| Cyto: weakens hits | heavy | 2% | 8% | 1.7 | 3.5 | 1.7 | 0.14 | 0.56 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits | heavy | 8% | 20% | 1.4 | 3.9 | 11.1 | 0.75 | 1.97 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits, x2 | heavy | 24% | 35% | 1.0 | 4.4 | 16.7 | 1.25 | 3.62 | 0.00 | 0.00 |
| Cyto: armour + weakens aim | heavy | 2% | 8% | 1.7 | 3.4 | 1.7 | 0.14 | 0.55 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim | heavy | 7% | 16% | 1.4 | 3.6 | 10.1 | 0.67 | 1.91 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim, x2 | heavy | 18% | 29% | 1.0 | 4.0 | 15.5 | 1.15 | 3.49 | 0.00 | 0.00 |
| Contagion | heavy | 2% | 9% | 1.6 | 3.4 | 8.0 | 0.30 | 0.43 | 0.00 | 0.75 |
| Ricochet + Contagion | heavy | 8% | 17% | 1.2 | 3.3 | 20.2 | 0.94 | 1.58 | 0.00 | 1.43 |
| Ricochet + Contagion, x2 | heavy | 21% | 29% | 0.9 | 3.6 | 28.5 | 1.44 | 2.55 | 0.00 | 2.37 |
| no build | armoured | 29% | 46% | 1.2 | 5.9 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet | armoured | 35% | 48% | 1.0 | 5.7 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cyto: today | armoured | 31% | 47% | 1.2 | 5.9 | 1.0 | 0.10 | 0.35 | 0.00 | 0.00 |
| Ricochet + Cyto: today | armoured | 40% | 51% | 0.9 | 5.6 | 2.6 | 0.26 | 0.80 | 0.00 | 0.00 |
| Ricochet + Cyto: today, x2 | armoured | 60% | 64% | 0.5 | 5.5 | 5.4 | 0.53 | 1.66 | 0.00 | 0.00 |
| Cyto: tick 20 | armoured | 31% | 47% | 1.2 | 5.9 | 2.0 | 0.10 | 0.35 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20 | armoured | 40% | 51% | 0.9 | 5.6 | 5.1 | 0.26 | 0.80 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20, x2 | armoured | 60% | 65% | 0.5 | 5.5 | 10.7 | 0.54 | 1.66 | 0.00 | 0.00 |
| Cyto: through armour | armoured | 33% | 49% | 1.1 | 5.9 | 3.4 | 0.31 | 0.84 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour | armoured | 50% | 58% | 0.6 | 5.5 | 9.3 | 0.72 | 1.93 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour, x2 | armoured | 71% | 75% | 0.3 | 5.7 | 15.1 | 1.35 | 3.43 | 0.00 | 0.00 |
| Cyto: weakens aim | armoured | 31% | 47% | 1.2 | 5.9 | 1.0 | 0.10 | 0.35 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim | armoured | 41% | 51% | 0.8 | 5.6 | 2.6 | 0.26 | 0.80 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim, x2 | armoured | 61% | 66% | 0.5 | 5.6 | 5.5 | 0.55 | 1.67 | 0.00 | 0.00 |
| Cyto: weakens hits | armoured | 32% | 48% | 1.2 | 5.9 | 1.0 | 0.10 | 0.35 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits | armoured | 43% | 53% | 0.8 | 5.6 | 2.7 | 0.27 | 0.80 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits, x2 | armoured | 62% | 67% | 0.4 | 5.6 | 5.5 | 0.54 | 1.67 | 0.00 | 0.00 |
| Cyto: armour + weakens aim | armoured | 34% | 50% | 1.1 | 5.9 | 3.4 | 0.31 | 0.85 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim | armoured | 53% | 60% | 0.6 | 5.6 | 9.4 | 0.74 | 1.94 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim, x2 | armoured | 76% | 79% | 0.3 | 5.8 | 15.3 | 1.38 | 3.48 | 0.00 | 0.00 |
| Contagion | armoured | 36% | 52% | 1.0 | 5.8 | 5.7 | 0.39 | 0.30 | 0.00 | 0.79 |
| Ricochet + Contagion | armoured | 47% | 56% | 0.6 | 5.5 | 10.0 | 0.71 | 0.71 | 0.00 | 1.40 |
| Ricochet + Contagion, x2 | armoured | 67% | 72% | 0.3 | 5.6 | 14.8 | 1.15 | 1.35 | 0.00 | 2.04 |
| no build | swarm | 65% | 73% | 0.5 | 5.9 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet | swarm | 74% | 78% | 0.3 | 5.7 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cyto: today | swarm | 67% | 74% | 0.4 | 5.8 | 2.1 | 0.21 | 0.74 | 0.00 | 0.00 |
| Ricochet + Cyto: today | swarm | 79% | 80% | 0.2 | 5.6 | 4.7 | 0.46 | 1.66 | 0.00 | 0.00 |
| Ricochet + Cyto: today, x2 | swarm | 92% | 93% | 0.1 | 5.7 | 7.7 | 0.76 | 2.95 | 0.00 | 0.00 |
| Cyto: tick 20 | swarm | 67% | 74% | 0.4 | 5.8 | 4.2 | 0.21 | 0.74 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20 | swarm | 79% | 80% | 0.2 | 5.6 | 9.3 | 0.46 | 1.66 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20, x2 | swarm | 92% | 93% | 0.1 | 5.7 | 15.3 | 0.77 | 2.95 | 0.00 | 0.00 |
| Cyto: through armour | swarm | 67% | 74% | 0.4 | 5.8 | 2.1 | 0.21 | 0.74 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour | swarm | 79% | 80% | 0.2 | 5.6 | 4.7 | 0.46 | 1.66 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour, x2 | swarm | 92% | 93% | 0.1 | 5.7 | 7.7 | 0.76 | 2.95 | 0.00 | 0.00 |
| Cyto: weakens aim | swarm | 68% | 75% | 0.4 | 5.9 | 2.2 | 0.21 | 0.74 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim | swarm | 80% | 81% | 0.2 | 5.7 | 4.7 | 0.47 | 1.67 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim, x2 | swarm | 93% | 94% | 0.1 | 5.8 | 7.7 | 0.76 | 2.96 | 0.00 | 0.00 |
| Cyto: weakens hits | swarm | 69% | 76% | 0.4 | 5.9 | 2.2 | 0.22 | 0.74 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits | swarm | 82% | 83% | 0.2 | 5.7 | 4.8 | 0.47 | 1.66 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits, x2 | swarm | 95% | 95% | 0.1 | 5.8 | 7.7 | 0.76 | 2.96 | 0.00 | 0.00 |
| Cyto: armour + weakens aim | swarm | 68% | 75% | 0.4 | 5.9 | 2.2 | 0.21 | 0.74 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim | swarm | 80% | 81% | 0.2 | 5.7 | 4.7 | 0.47 | 1.67 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim, x2 | swarm | 93% | 94% | 0.1 | 5.8 | 7.7 | 0.76 | 2.96 | 0.00 | 0.00 |
| Contagion | swarm | 72% | 77% | 0.3 | 5.8 | 7.0 | 0.56 | 0.63 | 0.00 | 1.41 |
| Ricochet + Contagion | swarm | 82% | 82% | 0.2 | 5.6 | 11.6 | 0.93 | 1.36 | 0.00 | 2.42 |
| Ricochet + Contagion, x2 | swarm | 96% | 96% | 0.0 | 5.7 | 16.0 | 1.43 | 2.13 | 0.00 | 3.26 |
| no build | mixed | 5% | 18% | 1.8 | 4.5 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Ricochet | mixed | 10% | 22% | 1.5 | 4.5 | 0.0 | 0.00 | 0.00 | 0.00 | 0.00 |
| Cyto: today | mixed | 5% | 19% | 1.7 | 4.5 | 1.6 | 0.13 | 0.45 | 0.00 | 0.00 |
| Ricochet + Cyto: today | mixed | 13% | 27% | 1.3 | 4.4 | 6.4 | 0.47 | 1.27 | 0.00 | 0.00 |
| Ricochet + Cyto: today, x2 | mixed | 23% | 35% | 1.0 | 4.6 | 11.0 | 0.85 | 2.36 | 0.00 | 0.00 |
| Cyto: tick 20 | mixed | 5% | 19% | 1.7 | 4.5 | 2.9 | 0.15 | 0.46 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20 | mixed | 14% | 27% | 1.3 | 4.4 | 10.9 | 0.55 | 1.28 | 0.00 | 0.00 |
| Ricochet + Cyto: tick 20, x2 | mixed | 25% | 36% | 1.0 | 4.6 | 19.1 | 0.95 | 2.38 | 0.00 | 0.00 |
| Cyto: through armour | mixed | 5% | 19% | 1.7 | 4.5 | 1.6 | 0.13 | 0.45 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour | mixed | 13% | 27% | 1.3 | 4.4 | 6.4 | 0.47 | 1.27 | 0.00 | 0.00 |
| Ricochet + Cyto: through armour, x2 | mixed | 23% | 35% | 1.0 | 4.6 | 11.0 | 0.85 | 2.36 | 0.00 | 0.00 |
| Cyto: weakens aim | mixed | 6% | 19% | 1.7 | 4.6 | 1.6 | 0.13 | 0.46 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim | mixed | 15% | 29% | 1.3 | 4.5 | 6.6 | 0.49 | 1.29 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens aim, x2 | mixed | 27% | 39% | 1.0 | 4.7 | 11.3 | 0.88 | 2.41 | 0.00 | 0.00 |
| Cyto: weakens hits | mixed | 6% | 20% | 1.7 | 4.6 | 1.6 | 0.13 | 0.46 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits | mixed | 16% | 30% | 1.3 | 4.6 | 6.9 | 0.53 | 1.30 | 0.00 | 0.00 |
| Ricochet + Cyto: weakens hits, x2 | mixed | 31% | 42% | 0.9 | 4.9 | 11.7 | 0.91 | 2.45 | 0.00 | 0.00 |
| Cyto: armour + weakens aim | mixed | 6% | 19% | 1.7 | 4.6 | 1.6 | 0.13 | 0.46 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim | mixed | 15% | 29% | 1.3 | 4.5 | 6.6 | 0.49 | 1.29 | 0.00 | 0.00 |
| Ricochet + Cyto: armour + weakens aim, x2 | mixed | 27% | 39% | 1.0 | 4.7 | 11.3 | 0.88 | 2.41 | 0.00 | 0.00 |
| Contagion | mixed | 6% | 21% | 1.7 | 4.5 | 8.5 | 0.35 | 0.38 | 0.00 | 0.72 |
| Ricochet + Contagion | mixed | 17% | 29% | 1.1 | 4.3 | 18.2 | 0.81 | 1.01 | 0.00 | 1.35 |
| Ricochet + Contagion, x2 | mixed | 29% | 39% | 0.9 | 4.6 | 25.0 | 1.27 | 1.74 | 0.00 | 1.90 |

## Committed deaths (a share of fights with a death)

| Build | the job's own | threat 5 | heavy | armoured | swarm | mixed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| no build | 0.6% | 3.5% | 16.3% | 6.2% | 1.8% | 14.6% |
| Ricochet | 0.4% | 1.7% | 14.4% | 4.9% | 0.6% | 9.9% |
| Cyto: today | 0.4% | 3.4% | 15.8% | 6.0% | 1.3% | 13.6% |
| Ricochet + Cyto: today | 0.3% | 1.5% | 10.3% | 3.7% | 0.6% | 8.1% |
| Ricochet + Cyto: today, x2 | 0.0% | 0.8% | 6.3% | 1.1% | 0.0% | 4.8% |
| Cyto: tick 20 | 0.4% | 3.4% | 15.4% | 6.0% | 1.3% | 13.7% |
| Ricochet + Cyto: tick 20 | 0.3% | 1.6% | 9.4% | 3.7% | 0.6% | 7.7% |
| Ricochet + Cyto: tick 20, x2 | 0.0% | 0.6% | 6.2% | 1.1% | 0.0% | 4.8% |
| Cyto: through armour | 0.4% | 3.4% | 15.8% | 5.6% | 1.3% | 13.6% |
| Ricochet + Cyto: through armour | 0.3% | 1.5% | 10.3% | 1.4% | 0.6% | 8.1% |
| Ricochet + Cyto: through armour, x2 | 0.0% | 0.8% | 6.3% | 0.4% | 0.0% | 4.8% |
| Cyto: weakens aim | 0.4% | 3.3% | 16.1% | 5.9% | 1.3% | 13.8% |
| Ricochet + Cyto: weakens aim | 0.3% | 1.3% | 8.9% | 3.5% | 0.4% | 7.6% |
| Ricochet + Cyto: weakens aim, x2 | 0.0% | 0.7% | 6.0% | 1.1% | 0.0% | 4.4% |
| Cyto: weakens hits | 0.4% | 3.1% | 15.9% | 5.8% | 1.4% | 13.6% |
| Ricochet + Cyto: weakens hits | 0.3% | 1.0% | 8.8% | 3.5% | 0.4% | 8.1% |
| Ricochet + Cyto: weakens hits, x2 | 0.0% | 0.4% | 4.7% | 1.5% | 0.0% | 4.8% |
| Cyto: armour + weakens aim | 0.4% | 3.3% | 16.1% | 5.3% | 1.3% | 13.8% |
| Ricochet + Cyto: armour + weakens aim | 0.3% | 1.3% | 8.9% | 1.5% | 0.4% | 7.6% |
| Ricochet + Cyto: armour + weakens aim, x2 | 0.0% | 0.7% | 6.0% | 0.4% | 0.0% | 4.4% |
| Contagion | 0.4% | 3.2% | 14.9% | 4.4% | 0.8% | 12.8% |
| Ricochet + Contagion | 0.3% | 1.3% | 8.3% | 1.9% | 0.3% | 6.8% |
| Ricochet + Contagion, x2 | 0.0% | 0.6% | 4.8% | 0.8% | 0.0% | 4.2% |
