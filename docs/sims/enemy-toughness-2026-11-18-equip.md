# Enemy toughness, step A0: the equip-the-stash sim (2026-11-18)

Run: node scripts/sim-enemy-toughness.mjs 12 25 (12 crews of 4-6, combat 11-16, 25 fights each, committed risk, warehouse fight at diff 12, docks enemies, no opposition). Every runner is given damage 2, 4 or 6 (hit 10, 16, 22) and 1 plate (street vest) or 2 (pro vest). Levers by env var: HPMULT, PLATES (extra on every enemy), EHIT (added to every enemy shot). No rule changed; the script only edits the fight it builds. Enemies still up is a count at the end of the fight (a win ends it when the job's goal is met, not when the room is clear). Win is 100% nearly everywhere, so HP lost is the readable column.

## Today's enemies

| threat | damage | plates | risk | win | someone down | someone dead | rounds | HP lost | enemies still up at end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 (hit 10) | 1 | committed | 100% | 0% | 0% | 5.1 | 7 | 1.6 |
| 1 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 3 | 1.6 |
| 1 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 1 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.2 |
| 1 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.2 |
| 1 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.2 |
| 2 | 2 (hit 10) | 1 | committed | 100% | 0% | 0% | 5.1 | 7 | 1.6 |
| 2 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 3 | 1.6 |
| 2 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 2 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.2 |
| 2 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.2 |
| 2 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.2 |
| 3 | 2 (hit 10) | 1 | committed | 100% | 0% | 0% | 5.1 | 11 | 1.6 |
| 3 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 4 | 1.6 |
| 3 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 3 | 1.2 |
| 3 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 3 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 3 | 1.2 |
| 3 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 4 | 2 (hit 10) | 1 | committed | 100% | 0% | 0% | 5.1 | 11 | 1.6 |
| 4 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 4 | 1.6 |
| 4 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 3 | 1.2 |
| 4 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 4 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 3 | 1.2 |
| 4 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 5 | 2 (hit 10) | 1 | committed | 100% | 2% | 0% | 5.1 | 20 | 1.9 |
| 5 | 2 (hit 10) | 2 | committed | 100% | 2% | 0% | 5.1 | 10 | 1.9 |
| 5 | 4 (hit 16) | 1 | committed | 100% | 1% | 0% | 5.1 | 8 | 1.3 |
| 5 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.1 | 3 | 1.3 |
| 5 | 6 (hit 22) | 1 | committed | 100% | 1% | 0% | 5.0 | 3 | 1.2 |
| 5 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |

## HPMULT=2 (enemy HP doubled)

| threat | damage | plates | risk | win | someone down | someone dead | rounds | HP lost | enemies still up at end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 (hit 10) | 1 | committed | 100% | 1% | 0% | 5.1 | 14 | 1.9 |
| 1 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 7 | 1.9 |
| 1 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 5 | 1.4 |
| 1 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.4 |
| 1 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.3 |
| 1 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.3 |
| 2 | 2 (hit 10) | 1 | committed | 100% | 1% | 0% | 5.1 | 14 | 1.9 |
| 2 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 7 | 1.9 |
| 2 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 5 | 1.4 |
| 2 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.4 |
| 2 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.3 |
| 2 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.3 |
| 3 | 2 (hit 10) | 1 | committed | 100% | 4% | 0% | 5.3 | 32 | 2.6 |
| 3 | 2 (hit 10) | 2 | committed | 100% | 2% | 0% | 5.2 | 16 | 2.6 |
| 3 | 4 (hit 16) | 1 | committed | 100% | 1% | 0% | 5.1 | 16 | 1.8 |
| 3 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.1 | 7 | 1.8 |
| 3 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 5 | 1.4 |
| 3 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.4 |
| 4 | 2 (hit 10) | 1 | committed | 100% | 4% | 0% | 5.3 | 32 | 2.6 |
| 4 | 2 (hit 10) | 2 | committed | 100% | 2% | 0% | 5.2 | 16 | 2.6 |
| 4 | 4 (hit 16) | 1 | committed | 100% | 1% | 0% | 5.1 | 16 | 1.8 |
| 4 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.1 | 7 | 1.8 |
| 4 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 5 | 1.4 |
| 4 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.4 |
| 5 | 2 (hit 10) | 1 | committed | 95% | 23% | 1% | 5.5 | 62 | 3.6 |
| 5 | 2 (hit 10) | 2 | committed | 99% | 12% | 0% | 5.4 | 37 | 3.6 |
| 5 | 4 (hit 16) | 1 | committed | 99% | 10% | 0% | 5.3 | 36 | 2.5 |
| 5 | 4 (hit 16) | 2 | committed | 100% | 5% | 0% | 5.2 | 19 | 2.5 |
| 5 | 6 (hit 22) | 1 | committed | 100% | 1% | 0% | 5.0 | 10 | 1.4 |
| 5 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.4 |

## PLATES=1 (one more plate on every enemy)

| threat | damage | plates | risk | win | someone down | someone dead | rounds | HP lost | enemies still up at end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 (hit 10) | 1 | committed | 100% | 0% | 0% | 5.1 | 10 | 1.8 |
| 1 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 4 | 1.8 |
| 1 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 5 | 1.4 |
| 1 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.4 |
| 1 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.3 |
| 1 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.3 |
| 2 | 2 (hit 10) | 1 | committed | 100% | 0% | 0% | 5.1 | 10 | 1.8 |
| 2 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 4 | 1.8 |
| 2 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 5 | 1.4 |
| 2 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.4 |
| 2 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.3 |
| 2 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.3 |
| 3 | 2 (hit 10) | 1 | committed | 100% | 4% | 0% | 5.2 | 29 | 2.4 |
| 3 | 2 (hit 10) | 2 | committed | 100% | 2% | 0% | 5.2 | 15 | 2.4 |
| 3 | 4 (hit 16) | 1 | committed | 99% | 2% | 0% | 5.1 | 12 | 1.6 |
| 3 | 4 (hit 16) | 2 | committed | 100% | 1% | 0% | 5.1 | 5 | 1.6 |
| 3 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.3 |
| 3 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.3 |
| 4 | 2 (hit 10) | 1 | committed | 100% | 4% | 0% | 5.2 | 29 | 2.4 |
| 4 | 2 (hit 10) | 2 | committed | 100% | 2% | 0% | 5.2 | 15 | 2.4 |
| 4 | 4 (hit 16) | 1 | committed | 99% | 2% | 0% | 5.1 | 12 | 1.6 |
| 4 | 4 (hit 16) | 2 | committed | 100% | 1% | 0% | 5.1 | 5 | 1.6 |
| 4 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.3 |
| 4 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.3 |
| 5 | 2 (hit 10) | 1 | committed | 97% | 14% | 1% | 5.4 | 51 | 3.3 |
| 5 | 2 (hit 10) | 2 | committed | 99% | 10% | 0% | 5.4 | 32 | 3.3 |
| 5 | 4 (hit 16) | 1 | committed | 99% | 5% | 0% | 5.2 | 28 | 2.2 |
| 5 | 4 (hit 16) | 2 | committed | 100% | 1% | 0% | 5.2 | 13 | 2.2 |
| 5 | 6 (hit 22) | 1 | committed | 100% | 1% | 0% | 5.0 | 9 | 1.4 |
| 5 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 3 | 1.4 |

## EHIT=5 (every enemy shot +5)

| threat | damage | plates | risk | win | someone down | someone dead | rounds | HP lost | enemies still up at end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 (hit 10) | 1 | committed | 100% | 1% | 0% | 5.1 | 10 | 1.6 |
| 1 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 4 | 1.6 |
| 1 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.2 |
| 1 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.2 |
| 1 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.2 |
| 1 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.2 |
| 2 | 2 (hit 10) | 1 | committed | 100% | 1% | 0% | 5.1 | 10 | 1.6 |
| 2 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 4 | 1.6 |
| 2 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.2 |
| 2 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.2 |
| 2 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.2 |
| 2 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 0 | 1.2 |
| 3 | 2 (hit 10) | 1 | committed | 99% | 3% | 0% | 5.1 | 15 | 1.6 |
| 3 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 5 | 1.6 |
| 3 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.2 |
| 3 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 3 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.2 |
| 3 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 4 | 2 (hit 10) | 1 | committed | 99% | 3% | 0% | 5.1 | 15 | 1.6 |
| 4 | 2 (hit 10) | 2 | committed | 100% | 0% | 0% | 5.1 | 5 | 1.6 |
| 4 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.2 |
| 4 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 4 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.2 |
| 4 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |
| 5 | 2 (hit 10) | 1 | committed | 97% | 8% | 1% | 5.2 | 30 | 1.9 |
| 5 | 2 (hit 10) | 2 | committed | 99% | 4% | 0% | 5.2 | 13 | 1.9 |
| 5 | 4 (hit 16) | 1 | committed | 100% | 3% | 0% | 5.1 | 12 | 1.3 |
| 5 | 4 (hit 16) | 2 | committed | 100% | 2% | 0% | 5.1 | 4 | 1.3 |
| 5 | 6 (hit 22) | 1 | committed | 100% | 1% | 0% | 5.0 | 5 | 1.2 |
| 5 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.2 |

## HPMULT=2 and EHIT=5

| threat | damage | plates | risk | win | someone down | someone dead | rounds | HP lost | enemies still up at end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 (hit 10) | 1 | committed | 100% | 3% | 0% | 5.2 | 19 | 1.9 |
| 1 | 2 (hit 10) | 2 | committed | 100% | 2% | 0% | 5.2 | 9 | 1.9 |
| 1 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 7 | 1.4 |
| 1 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.4 |
| 1 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.3 |
| 1 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.3 |
| 2 | 2 (hit 10) | 1 | committed | 100% | 3% | 0% | 5.2 | 19 | 1.9 |
| 2 | 2 (hit 10) | 2 | committed | 100% | 2% | 0% | 5.2 | 9 | 1.9 |
| 2 | 4 (hit 16) | 1 | committed | 100% | 0% | 0% | 5.0 | 7 | 1.4 |
| 2 | 4 (hit 16) | 2 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.4 |
| 2 | 6 (hit 22) | 1 | committed | 100% | 0% | 0% | 5.0 | 4 | 1.3 |
| 2 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 1 | 1.3 |
| 3 | 2 (hit 10) | 1 | committed | 95% | 15% | 1% | 5.4 | 44 | 2.6 |
| 3 | 2 (hit 10) | 2 | committed | 99% | 6% | 0% | 5.3 | 22 | 2.6 |
| 3 | 4 (hit 16) | 1 | committed | 98% | 6% | 0% | 5.2 | 22 | 1.8 |
| 3 | 4 (hit 16) | 2 | committed | 100% | 2% | 0% | 5.1 | 10 | 1.8 |
| 3 | 6 (hit 22) | 1 | committed | 100% | 1% | 0% | 5.0 | 6 | 1.4 |
| 3 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.4 |
| 4 | 2 (hit 10) | 1 | committed | 95% | 15% | 1% | 5.4 | 44 | 2.6 |
| 4 | 2 (hit 10) | 2 | committed | 99% | 6% | 0% | 5.3 | 22 | 2.6 |
| 4 | 4 (hit 16) | 1 | committed | 98% | 6% | 0% | 5.2 | 22 | 1.8 |
| 4 | 4 (hit 16) | 2 | committed | 100% | 2% | 0% | 5.1 | 10 | 1.8 |
| 4 | 6 (hit 22) | 1 | committed | 100% | 1% | 0% | 5.0 | 6 | 1.4 |
| 4 | 6 (hit 22) | 2 | committed | 100% | 0% | 0% | 5.0 | 2 | 1.4 |
| 5 | 2 (hit 10) | 1 | committed | 84% | 44% | 4% | 5.8 | 83 | 3.6 |
| 5 | 2 (hit 10) | 2 | committed | 95% | 28% | 2% | 5.6 | 50 | 3.6 |
| 5 | 4 (hit 16) | 1 | committed | 95% | 21% | 2% | 5.4 | 48 | 2.5 |
| 5 | 4 (hit 16) | 2 | committed | 98% | 13% | 1% | 5.3 | 27 | 2.5 |
| 5 | 6 (hit 22) | 1 | committed | 100% | 3% | 0% | 5.0 | 14 | 1.4 |
| 5 | 6 (hit 22) | 2 | committed | 100% | 2% | 0% | 5.0 | 5 | 1.4 |
