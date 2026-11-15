# Battle rework, slice 3: the validation gate on the real code (2026-11-15-before-3i)

`node scripts/sim-orders.mjs 100 2026-11-15-before-3i` — played on core/fight.js and core/runfight.js, not the paper rules. The declared gate is the `GATE` block at the top of the script (hash `f440deff`); it was written and the bar confirmed by the owner before this run, and was not changed after.

## Declared gate

- Seeds: 100 per cell, the same seeds for every plan. Encounters: holdHack (Glass Heights: corp and drones, Office Data Pull's rules) and holdExtract (Docks: hired and enforcers), threat 3 (three enemies), base difficulty 14, steady risk, no overwatch, standby or driver.
- Crew groups: Under / On / Over (main stat +0 / +3 / +6, others −5 / −2 / +1, cool −2 / 0 / +3 on a base of 14) x line-ups a (tech, muscle, medic with a deck, gunner), b (tech, muscle, two gunners, one with a machine pistol), c (tech, face, medic, gunner) = 9. Endurance rolled per runner per seed: muscle about 13, others about 8 (a grown crew on the owner's scale); fresh (10 / 5) in the left-behind table.
- Settings: enemy durability D1 (all minimum), D2 (the game's own), D3 (+1 pip) x exposure E1/E2/E3 (aimStep 0 / 2 / 4; E2 is the game's own) = 9. D2 E2 is the shipped data.
- Fixed plans, each one *unchanged* (set once; call-ins answered by the standing orders): attack, hold, protect, support, mixed, defaults. Adapted plans, chosen per cell and encounter as the best clean-win share (then fewest downs) of the 12 candidates: the six fixed plans, and the same six with the **mid-fight layer** (marked `+`): answers to the call-ins (the van by its shown odds; the tech under fire: cover if two shots are on them, else jam if offered, else hit the caller) and Take Command between rounds (the plan's orders come back each round; a hurt tech with open shots gets everyone covering them; an unanswered radio call gets a jammer or the best shot).
- "Effectively as good": within 5 points of clean wins, 0.25 downed runners and 0.3 heat per fight (heat is the only resource a fight spends; specials and consumables do not exist in the game yet).
- Bar: adapting beats an unchanged plan by 7.000000000000001+ points or 0.3+ fewer downs in at least one encounter. **Rework** if some unchanged plan is as good as adapting in both encounters in at least two thirds of cells; **proceed** if adapting clears the bar against every unchanged plan in at least two thirds of cells and no plan is as good in both.
- Measures: *clean win* = the objective done and nobody dead, left behind or walked off (`won`); *job done* also counts a van that left with someone missing; *downs* = runners who went to 0 pips at any point.

## Verdict

**REWORK** (full adapted set, 81 cells). Rework line (some unchanged plan as good in both encounters): attack 15%, hold 0%, protect 14%, support 23%, mixed 42%, defaults 70%. Adapting clears the bar against every unchanged plan in 15% of cells (15% with no plan as good in both); the line is 67%.

Adapting by choice only (the six fixed plans, no mid-fight layer): **REWORK**; rework line attack 19%, hold 0%, protect 15%, support 27%, mixed 46%, defaults 74%; clears the bar in 12% of cells (12% with no plan as good in both).

### Mean over all cells, per candidate

| Plan | holdHack win | downs | heat | holdExtract win | downs | left behind | heat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| attack | 74% | 0.20 | 0.00 | 76% | 0.18 | 11% | 0.07 |
| hold | 27% | 0.63 | 0.00 | 83% | 0.57 | 3% | 0.05 |
| protect | 91% | 0.14 | 0.00 | 76% | 0.82 | 16% | 0.19 |
| support | 89% | 0.18 | 0.00 | 83% | 0.63 | 9% | 0.11 |
| mixed | 84% | 0.13 | 0.00 | 91% | 0.18 | 3% | 0.03 |
| defaults | 90% | 0.11 | 0.00 | 91% | 0.18 | 3% | 0.03 |
| attack+ | 78% | 0.13 | 0.00 | 77% | 0.18 | 9% | 0.04 |
| hold+ | 54% | 0.31 | 0.00 | 80% | 0.56 | 3% | 0.02 |
| protect+ | 88% | 0.15 | 0.00 | 79% | 0.64 | 14% | 0.06 |
| support+ | 89% | 0.17 | 0.00 | 82% | 0.59 | 10% | 0.03 |
| mixed+ | 84% | 0.10 | 0.00 | 91% | 0.17 | 3% | 0.01 |
| defaults+ | 89% | 0.11 | 0.00 | 91% | 0.17 | 3% | 0.01 |

### Best candidate per setting (share of the 9 crew groups where it is best, per encounter)

**holdHack**

| Setting | attack | hold | protect | support | mixed | defaults | attack+ | hold+ | protect+ | support+ | mixed+ | defaults+ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 E1 | 22% | 0% | 33% | 0% | 44% | 0% | 0% | 0% | 0% | 0% | 0% | 0% |
| D1 E2 | 22% | 0% | 11% | 0% | 11% | 11% | 0% | 0% | 0% | 0% | 22% | 22% |
| D1 E3 | 22% | 0% | 0% | 0% | 11% | 22% | 0% | 0% | 0% | 0% | 22% | 22% |
| D2 E1 | 0% | 0% | 33% | 11% | 0% | 11% | 11% | 0% | 11% | 0% | 22% | 0% |
| D2 E2 | 0% | 0% | 33% | 0% | 11% | 22% | 11% | 0% | 11% | 0% | 0% | 11% |
| D2 E3 | 0% | 0% | 33% | 0% | 0% | 22% | 11% | 0% | 11% | 11% | 0% | 11% |
| D3 E1 | 0% | 0% | 22% | 44% | 0% | 0% | 11% | 0% | 11% | 11% | 0% | 0% |
| D3 E2 | 0% | 0% | 33% | 44% | 0% | 0% | 0% | 0% | 11% | 0% | 0% | 11% |
| D3 E3 | 0% | 0% | 33% | 33% | 0% | 11% | 0% | 0% | 11% | 0% | 0% | 11% |

**holdExtract**

| Setting | attack | hold | protect | support | mixed | defaults | attack+ | hold+ | protect+ | support+ | mixed+ | defaults+ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 E1 | 0% | 0% | 0% | 11% | 56% | 0% | 0% | 0% | 0% | 0% | 33% | 0% |
| D1 E2 | 0% | 0% | 0% | 0% | 44% | 0% | 0% | 0% | 0% | 0% | 56% | 0% |
| D1 E3 | 0% | 0% | 0% | 0% | 44% | 0% | 0% | 0% | 0% | 0% | 56% | 0% |
| D2 E1 | 0% | 0% | 0% | 11% | 56% | 0% | 0% | 0% | 0% | 0% | 33% | 0% |
| D2 E2 | 0% | 0% | 0% | 0% | 44% | 0% | 0% | 0% | 0% | 0% | 56% | 0% |
| D2 E3 | 0% | 0% | 0% | 0% | 44% | 0% | 0% | 0% | 0% | 0% | 56% | 0% |
| D3 E1 | 0% | 0% | 11% | 11% | 33% | 0% | 0% | 11% | 0% | 0% | 33% | 0% |
| D3 E2 | 0% | 0% | 0% | 11% | 22% | 0% | 0% | 11% | 0% | 11% | 44% | 0% |
| D3 E3 | 0% | 11% | 0% | 0% | 44% | 0% | 0% | 11% | 0% | 11% | 22% | 0% |

Adapting clears the bar by durability: D1 0%, D2 22%, D3 22%; by exposure: E1 15%, E2 11%, E3 19%; by margin: Under 22%, On 22%, Over 0%.

## Mid-fight adapting, alone

The same plan with and without the layer (mean over every cell and fixed plan):

| Encounter | clean wins gained | downs saved | cells where the layer alone clears the bar |
| --- | --- | --- | --- |
| holdHack | +4.5 points | +0.07 | 23% |
| holdExtract | -0.1 points | +0.04 | 7% |

Answers the layer gave (all layered fights): techUnderFire:jam 174200, pullOutPoint:carryOn 840700, pullOutPoint:cover 315000, techUnderFire:cover 54700, vanCantWait:goNow 303600, vanCantWait:hold 138200.

## Deaths per risk level

The defaults, the game's own settings (D2 E2), all 9 crews x up to 100 seeds, per encounter. Target: none on cautious or steady except after a push on or a hand-ordered withdrawal; about one in 25 committed. "Push on" answers death's door with Keep fighting (the death after a push on is decided by the run's finish, not by the fight, so the fights count those still dying at the end).

"Hand withdraw" orders the most hurt runner out by hand in round 2.

| Door answer | Risk | Encounter | Fights | Deaths in the fight | Causes | Left behind | Clean win | Downs | Pushed on | Still dying at the end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pullBack | cautious | holdHack | 900 | 0 (none) | - | 0% | 83% | 0.11 | 0 | 0 |
| pullBack | cautious | holdExtract | 900 | 0 (none) | - | 1% | 85% | 0.08 | 0 | 0 |
| pullBack | steady | holdHack | 900 | 0 (none) | - | 0% | 89% | 0.11 | 0 | 0 |
| pullBack | steady | holdExtract | 900 | 0 (none) | - | 1% | 94% | 0.08 | 0 | 0 |
| pullBack | committed | holdHack | 900 | 0 (none) | - | 0% | 97% | 0.15 | 0 | 0 |
| pullBack | committed | holdExtract | 900 | 5 (1 in 180) | leftDead 5 | 1% | 99% | 0.09 | 0 | 0 |
| pushOn | cautious | holdHack | 900 | 0 (none) | - | 0% | 85% | 0.12 | 21 | 17 |
| pushOn | cautious | holdExtract | 900 | 0 (none) | - | 2% | 86% | 0.09 | 17 | 8 |
| pushOn | steady | holdHack | 900 | 0 (none) | - | 0% | 92% | 0.13 | 35 | 24 |
| pushOn | steady | holdExtract | 900 | 0 (none) | - | 1% | 96% | 0.10 | 19 | 9 |
| pushOn | committed | holdHack | 900 | 0 (none) | - | 0% | 97% | 0.15 | 0 | 0 |
| pushOn | committed | holdExtract | 900 | 5 (1 in 180) | leftDead 5 | 1% | 99% | 0.09 | 0 | 0 |
| handWithdraw | cautious | holdHack | 900 | 4 (1 in 225) | handWithdraw 4 | 0% | 74% | 0.15 | 0 | 0 |
| handWithdraw | cautious | holdExtract | 900 | 11 (1 in 82) | handWithdraw 11 | 2% | 0% | 0.09 | 0 | 0 |
| handWithdraw | steady | holdHack | 900 | 4 (1 in 225) | handWithdraw 4 | 0% | 83% | 0.16 | 0 | 0 |
| handWithdraw | steady | holdExtract | 900 | 10 (1 in 90) | handWithdraw 10 | 2% | 0% | 0.10 | 0 | 0 |
| handWithdraw | committed | holdHack | 900 | 4 (1 in 225) | handWithdraw 4 | 0% | 90% | 0.19 | 0 | 0 |
| handWithdraw | committed | holdExtract | 900 | 16 (1 in 56) | handWithdraw 10, leftDead 5, bleedOut 2 | 2% | 0% | 0.10 | 0 | 0 |

Committed, both encounters: 5 deaths in 1800 fights (about 1 in 360). Cautious and steady, both door answers: 29 deaths in 10800 fights.

## Toughness check

Over vs On, the defaults, D2: gain in clean wins **4%** in aim-heavy fights (E3, normal decks) and **2%** in radio-heavy fights (decks weighted to backup and alarm, E2). The gate asks for the first to be at least twice the second: **NOT met**.

## Left behind (holdExtract)

The defaults, D2 E2, all 9 crews x up to 100 seeds. Grown = muscle 13 / others 8 endurance; fresh = 10 / 5 (slice 2 showed about 57% on a fresh crew on a steady extraction).

| Crew | Risk | Someone left behind | People left a fight | Clean win | Job done | Downs |
| --- | --- | --- | --- | --- | --- | --- |
| grown | cautious | 1% | 0.03 | 85% | 98% | 0.08 |
| grown | steady | 1% | 0.02 | 94% | 98% | 0.08 |
| grown | committed | 1% | 0.03 | 99% | 100% | 0.09 |
| fresh | cautious | 4% | 0.08 | 76% | 96% | 0.18 |
| fresh | steady | 3% | 0.07 | 89% | 97% | 0.19 |
| fresh | committed | 4% | 0.08 | 96% | 100% | 0.21 |

## How often each dilemma comes up

The defaults with the standing answers, D2 E2, all 9 crews x up to 100 seeds: the share of fights that raise it at least once.

| Encounter | Fights | techUnderFire (fights) | calls a fight | vanCantWait (fights) | calls a fight |
| --- | --- | --- | --- | --- | --- |
| holdHack | 900 | 1% | 0.01 | 0% | 0.00 |
| holdExtract | 900 | 0% | 0.00 | 1% | 0.01 |

Across every setting and fixed plan: holdHack techUnderFire 5%; holdExtract vanCantWait 9%.

## The game's own starting crews

Not part of the declared gate. The defaults on the first four runners of a fresh crew and of the authored crew, D2 E2 (the shipped data), threat 3, hands-off (the standing orders answer call-ins), 100 seeds. The sim crews above are built to a spec and are stronger than the fresh crew.

| Crew | Risk | Encounter | Clean win | Job done | Someone left behind | People left a fight | Downs | Died |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fresh | cautious | holdHack | 11% | 11% | 0% | 0.00 | 0.91 | 0% |
| fresh | cautious | holdExtract | 14% | 62% | 24% | 0.52 | 1.10 | 0% |
| fresh | steady | holdHack | 26% | 26% | 0% | 0.00 | 0.97 | 0% |
| fresh | steady | holdExtract | 40% | 65% | 21% | 0.57 | 1.44 | 0% |
| fresh | committed | holdHack | 53% | 53% | 0% | 0.00 | 1.75 | 4% |
| fresh | committed | holdExtract | 52% | 100% | 47% | 1.17 | 2.25 | 22% |
| authored | cautious | holdHack | 61% | 61% | 0% | 0.00 | 0.38 | 0% |
| authored | cautious | holdExtract | 60% | 98% | 19% | 0.47 | 0.79 | 0% |
| authored | steady | holdHack | 77% | 77% | 0% | 0.00 | 0.29 | 0% |
| authored | steady | holdExtract | 78% | 98% | 20% | 0.49 | 0.99 | 0% |
| authored | committed | holdHack | 86% | 86% | 0% | 0.00 | 0.31 | 0% |
| authored | committed | holdExtract | 74% | 100% | 25% | 0.52 | 0.91 | 4% |

## Run-level check (the real wiring)

Fresh-crew runs through `startMission`, `runFight`, `describePending` and `resolvePending` (call-ins answered Leave on time / Carry on, death's door Pull back), 40 per job, to show the sim's loop is the run's loop and nothing in the wiring throws or sticks:

| Job | Runs | Fights finished | Errors | Call-ins | Left behind | Deaths in a fight |
| --- | --- | --- | --- | --- | --- | --- |
| data_pull | 40 | 9 | 0 | {"pullOutPoint":5} | 0 | 0 |
| warehouse | 40 | 2 | 0 | {"pullOutPoint":9} | 0 | 0 |

## What this could not measure

- Specials and consumables: the engine has none, so the "resources" tolerance is heat only. The Special actions button, standby and overwatch (the planning read models neither for the five jobs) are out of the gate.
- Real players: the mid-fight layer is a fixed rule set, a floor for what a player who reads the screens might do, not a ceiling. The playtest is the test of that.
- The adapted plan is chosen on the same seeds it is scored on (paired), which favours it by a point or two.
- Hand-ordered withdrawals ("Pull out" on one runner) are not in the plans, so the "death after a hand-ordered withdrawal" case is only checked by the counts above (deaths with cause handWithdraw; the others are bleedOut and leftDead, committed only, and shotDead without an order, which should not exist).
- Death after a push on is decided by the run (`mission.js` finish), not by the fight; the table counts those still dying.

## Every cell

Full table in the matching `.csv` (1944 rows).
