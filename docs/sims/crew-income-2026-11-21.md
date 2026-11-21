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

## Board settings compared (same day)

`node scripts/sim-crew-income.mjs 10 <sizes> "<ARRIVALS overrides>"`, weeks 13-26, margin = net over the bill:

| ARRIVALS | 3 crew | 5 crew | 7 crew | 10 crew | 14 crew |
| --- | --- | --- | --- | --- | --- |
| over 5, per 2.5, routine 0.75 (old) | +53% | -2% | -33% | -6% | |
| over 5, per 2.5, routine 0.4 | +53% | -2% | -33% | -3% | |
| over 3, per 1.5, routine 0.75 | +53% | +44% | +48% | +54% | |
| over 3, per 1.5, routine 0.4 | +53% | +48% | +36% | +75% | |
| over 3, per 2, routine 0.4 | +53% | +48% | +36% | +31% | +33% |
| over 3, per 2, routine 0.75 | +53% | +44% | +48% | +25% | +30% |
| **over 4, per 2, routine 0.75 (chosen)** | +53% | -2% | +7% | +25% | +30% |
| over 5, per 1.5, routine 0.75 | +53% | -2% | +7% | +25% | +47% |
| over 5, per 1, routine 0.75 | +53% | -2% | +48% | +61% | +109% |

The routine share barely matters; the number of offers per runner is the lever. First pick: over 3, per 2, the setting nearest the target band (+20-40% for 5-10 crew). It failed two tests: the fame sim plays a five-person crew, which got a fourth offer a week, so the median run had three Elites by week 52 (target one or two), and a year's save went 2% over budget. Chosen instead: over 4, per 2, which leaves one to five runners exactly as before and lifts six and up. The five-person band stays at break-even; moving it needs the owner to move the Elite target, or another source of money (standing contracts).

## With security posts (same day, board at over 4, per 2)

`node scripts/sim-crew-income.mjs 10 3,5,7,10 "" posts` (and `POST_PAY=0.8`): after the day's jobs, idle runners (cheapest first, at most two a post) take this week's posts; a hit post is given up. Margin over the bill:

| Slot pay | Weeks | 3 crew | 5 crew | 7 crew | 10 crew |
| --- | --- | --- | --- | --- | --- |
| first draft (¥550-850) | 1-4 / 5-12 / 13-26 | +49% / +32% / +37% | +39% / +27% / +50% | +26% / +32% / +47% | +39% / +35% / +64% |
| **80% (¥450-700, chosen)** | 1-4 / 5-12 / 13-26 | +40% / +24% / +27% | +30% / +15% / +38% | +20% / +22% / +38% | +27% / +26% / +57% |

Chosen: 80%. Five to seven runners now sit in the +20-40% band most of the year. The sim's player posts everyone it can, so a three-person crew gives up about one job a week to posts (2 jobs a week late on, against 3): a real player would choose. The ten-person late figure is mostly the board and reputation (+25% without posts).
