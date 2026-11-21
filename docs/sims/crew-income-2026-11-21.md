# Income by crew size (2026-11-21)

`node scripts/sim-crew-income.mjs 12 3,5,7,10,14`: crew held at a fixed size (pro-tier extras added free, cash topped up so nobody goes broke), a careful player runs every job the free crew can staff each day, 26 weeks, 12 seeds, medians per week. Gross is mission pay only; bill is wages plus rent.

| Crew | Weeks | Gross | Bill | Net | Jobs/wk | Idle crew/day | Open offers/day |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 13-26 | 3,450 | 2,250 | +1,200 | 3 | 1.1 | 0.7 |
| 5 | 13-26 | 3,600 | 3,650 | -50 | 3 | 2.7 | 0.1 |
| 7 | 13-26 | 3,450 | 5,150 | -1,700 | 3 | 4.9 | 0.1 |
| 10 | 13-26 | 7,480 | 7,350 | +130 | 5 | 6.0 | 0.1 |
| 14 | 13-26 | 9,360 | 10,150 | -790 | 6 | 9.0 | 0.0 |

Reading: income is flat from 3 to 7 crew (about 3 jobs a week, the board runs dry: open offers fall to 0.1) while the bill rises with every hire, so a 5-7 person crew loses money. Gross only grows once the crew is large enough for two jobs at once (10+), and even at 14 the net is negative. Roughly half to two thirds of a big crew is idle every day. Caveat: extras are generated "pro" tier, so their wages run higher than an organically grown crew's.
