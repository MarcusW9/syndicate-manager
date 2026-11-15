# Standard force prototype sim, 2026-11-15

`node scripts/sim-standard-force.mjs 40 60` (40 seeded crews of 4-6, 60 fights each, hands-off on default orders, loud approach, the job's real difficulty). Crews: combat 11-16, cool 6-14, tech 8-14 (first runner 11+), medical 6-14 (second runner 11+). Declared in the script header before the run. Shipped setting: one extra body (`OPPOSITION.*.extra` 1). With 2 extra, Warehouse Lift on steady was 65% win / 57% someone down / 17% someone lost; that was too hard and was backed off.

| job | setup | risk | enemies at start | win | someone down | someone dead | someone lost | rounds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| warehouse | old | cautious | 3.0 | 81% | 5% | 0% | 1% | 5.0 |
| warehouse | old | steady | 3.0 | 97% | 5% | 0% | 0% | 5.0 |
| warehouse | old | committed | 3.0 | 99% | 5% | 0% | 1% | 5.1 |
| warehouse | new | cautious | 4.0 | 57% | 23% | 0% | 7% | 5.4 |
| warehouse | new | steady | 4.0 | 89% | 24% | 0% | 6% | 5.5 |
| warehouse | new | committed | 4.0 | 90% | 24% | 2% | 10% | 5.6 |
| data_scrub | old | cautious | 2.0 | 100% | 0% | 0% | 0% | 4.0 |
| data_scrub | old | steady | 2.0 | 100% | 0% | 0% | 0% | 4.0 |
| data_scrub | old | committed | 2.0 | 100% | 0% | 0% | 0% | 4.0 |
| data_scrub | new | cautious | 3.0 | 92% | 1% | 0% | 0% | 4.0 |
| data_scrub | new | steady | 3.0 | 99% | 2% | 0% | 0% | 4.0 |
| data_scrub | new | committed | 3.0 | 99% | 2% | 0% | 0% | 4.0 |

Rerun after the flee fix (grunts break like the hired): win, down, dead and lost are unchanged on every row; rounds on Warehouse Lift (new) fall by 0.1 to 0.2 (5.3, 5.4, 5.5 for cautious, steady, committed). The table above is the pre-fix run.

Reads: deaths are 0 on cautious and steady (the death rule holds); the only deaths are committed (2%). 'Someone lost' on cautious/steady is a runner left behind at the van, not a death. Fight length barely moves because the work clock and the van end these fights, not the body count. Standard force is a damage sponge (2 plain hits each: crack, then drop), so the crew fires more shots per fight and downs rise; the win rate on Warehouse Lift steady drops 97% to 89%.
