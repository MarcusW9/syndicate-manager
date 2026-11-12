# Battle rework, slice 3: the validation gate on the real code (2026-11-12-after-0a)

`node scripts/sim-orders.mjs 100 2026-11-12-after-0a` — played on core/fight.js and core/runfight.js, not the paper rules. The declared gate is the `GATE` block at the top of the script (hash `f440deff`); it was written and the bar confirmed by the owner before this run, and was not changed after.

## Declared gate

- Seeds: 100 per cell, the same seeds for every plan. Encounters: holdHack (Glass Heights: corp and drones, Office Data Pull's rules) and holdExtract (Docks: hired and enforcers), threat 3 (three enemies), base difficulty 14, steady risk, no overwatch, standby or driver.
- Crew groups: Under / On / Over (main stat +0 / +3 / +6, others −5 / −2 / +1, cool −2 / 0 / +3 on a base of 14) x line-ups a (tech, muscle, medic with a deck, gunner), b (tech, muscle, two gunners, one with a machine pistol), c (tech, face, medic, gunner) = 9. Endurance rolled per runner per seed: muscle about 13, others about 8 (a grown crew on the owner's scale); fresh (10 / 5) in the left-behind table.
- Settings: enemy durability D1 (all minimum), D2 (the game's own), D3 (+1 pip) x exposure E1/E2/E3 (aimStep 0 / 2 / 4; E2 is the game's own) = 9. D2 E2 is the shipped data.
- Fixed plans, each one *unchanged* (set once; call-ins answered by the standing orders): attack, hold, protect, support, mixed, defaults. Adapted plans, chosen per cell and encounter as the best clean-win share (then fewest downs) of the 12 candidates: the six fixed plans, and the same six with the **mid-fight layer** (marked `+`): answers to the call-ins (the van by its shown odds; the tech under fire: cover if two shots are on them, else jam if offered, else hit the caller) and Take Command between rounds (the plan's orders come back each round; a hurt tech with open shots gets everyone covering them; an unanswered radio call gets a jammer or the best shot).
- "Effectively as good": within 5 points of clean wins, 0.25 downed runners and 0.3 heat per fight (heat is the only resource a fight spends; specials and consumables do not exist in the game yet).
- Bar: adapting beats an unchanged plan by 7.000000000000001+ points or 0.3+ fewer downs in at least one encounter. **Rework** if some unchanged plan is as good as adapting in both encounters in at least two thirds of cells; **proceed** if adapting clears the bar against every unchanged plan in at least two thirds of cells and no plan is as good in both.
- Measures: *clean win* = the objective done and nobody dead, left behind or walked off (`won`); *job done* also counts a van that left with someone missing; *downs* = runners who went to 0 pips at any point.

## Verdict

**NEITHER** (full adapted set, 81 cells). Rework line (some unchanged plan as good in both encounters): attack 14%, hold 0%, protect 7%, support 17%, mixed 40%, defaults 60%. Adapting clears the bar against every unchanged plan in 20% of cells (20% with no plan as good in both); the line is 67%.

Adapting by choice only (the six fixed plans, no mid-fight layer): **REWORK**; rework line attack 17%, hold 0%, protect 10%, support 23%, mixed 46%, defaults 74%; clears the bar in 12% of cells (12% with no plan as good in both).

### Mean over all cells, per candidate

| Plan | holdHack win | downs | heat | holdExtract win | downs | left behind | heat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| attack | 74% | 0.20 | 0.00 | 69% | 0.18 | 18% | 0.07 |
| hold | 27% | 0.63 | 0.00 | 71% | 0.99 | 17% | 0.23 |
| protect | 91% | 0.14 | 0.00 | 58% | 1.24 | 37% | 0.37 |
| support | 89% | 0.18 | 0.00 | 70% | 1.04 | 24% | 0.28 |
| mixed | 84% | 0.13 | 0.00 | 83% | 0.31 | 12% | 0.09 |
| defaults | 90% | 0.11 | 0.00 | 83% | 0.31 | 12% | 0.09 |
| attack+ | 78% | 0.13 | 0.00 | 76% | 0.18 | 10% | 0.27 |
| hold+ | 54% | 0.31 | 0.00 | 70% | 0.92 | 14% | 0.16 |
| protect+ | 88% | 0.15 | 0.00 | 61% | 1.03 | 34% | 0.22 |
| support+ | 89% | 0.17 | 0.00 | 71% | 0.94 | 23% | 0.16 |
| mixed+ | 84% | 0.10 | 0.00 | 85% | 0.29 | 9% | 0.16 |
| defaults+ | 89% | 0.11 | 0.00 | 85% | 0.29 | 9% | 0.16 |

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
| D1 E1 | 0% | 0% | 0% | 0% | 33% | 0% | 0% | 0% | 0% | 0% | 67% | 0% |
| D1 E2 | 0% | 0% | 0% | 0% | 22% | 0% | 11% | 0% | 0% | 0% | 67% | 0% |
| D1 E3 | 0% | 0% | 0% | 0% | 33% | 0% | 0% | 0% | 0% | 0% | 67% | 0% |
| D2 E1 | 0% | 0% | 0% | 0% | 33% | 0% | 0% | 0% | 0% | 0% | 67% | 0% |
| D2 E2 | 0% | 0% | 0% | 0% | 22% | 0% | 11% | 0% | 0% | 0% | 67% | 0% |
| D2 E3 | 0% | 0% | 0% | 0% | 33% | 0% | 0% | 0% | 0% | 0% | 67% | 0% |
| D3 E1 | 0% | 0% | 0% | 0% | 11% | 0% | 0% | 11% | 0% | 0% | 78% | 0% |
| D3 E2 | 0% | 0% | 0% | 0% | 22% | 0% | 0% | 22% | 0% | 11% | 44% | 0% |
| D3 E3 | 0% | 0% | 0% | 0% | 22% | 0% | 0% | 0% | 0% | 11% | 67% | 0% |

Adapting clears the bar by durability: D1 4%, D2 26%, D3 30%; by exposure: E1 22%, E2 19%, E3 19%; by margin: Under 33%, On 26%, Over 0%.

## Mid-fight adapting, alone

The same plan with and without the layer (mean over every cell and fixed plan):

| Encounter | clean wins gained | downs saved | cells where the layer alone clears the bar |
| --- | --- | --- | --- |
| holdHack | +4.5 points | +0.07 | 23% |
| holdExtract | +2.2 points | +0.07 | 21% |

Answers the layer gave (all layered fights): techUnderFire:jam 174200, pullOutPoint:carryOn 840700, pullOutPoint:cover 315000, techUnderFire:cover 54700, vanCantWait:hold 902300, vanCantWait:goNow 537400.

## Deaths per risk level

The defaults, the game's own settings (D2 E2), all 9 crews x up to 100 seeds, per encounter. Target: none on cautious or steady except after a push on or a hand-ordered withdrawal; about one in 25 committed. "Push on" answers death's door with Keep fighting (the death after a push on is decided by the run's finish, not by the fight, so the fights count those still dying at the end).

"Hand withdraw" orders the most hurt runner out by hand in round 2.

| Door answer | Risk | Encounter | Fights | Deaths in the fight | Causes | Left behind | Clean win | Downs | Pushed on | Still dying at the end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pullBack | cautious | holdHack | 900 | 0 (none) | - | 0% | 83% | 0.11 | 0 | 0 |
| pullBack | cautious | holdExtract | 900 | 0 (none) | - | 9% | 79% | 0.18 | 0 | 0 |
| pullBack | steady | holdHack | 900 | 0 (none) | - | 0% | 89% | 0.11 | 0 | 0 |
| pullBack | steady | holdExtract | 900 | 0 (none) | - | 8% | 87% | 0.18 | 0 | 0 |
| pullBack | committed | holdHack | 900 | 0 (none) | - | 0% | 97% | 0.15 | 0 | 0 |
| pullBack | committed | holdExtract | 900 | 16 (1 in 56) | bleedOut 6, leftDead 11 | 10% | 90% | 0.17 | 0 | 0 |
| pushOn | cautious | holdHack | 900 | 0 (none) | - | 0% | 85% | 0.12 | 21 | 17 |
| pushOn | cautious | holdExtract | 900 | 1 (1 in 900) | bleedOut 1 | 10% | 80% | 0.21 | 17 | 7 |
| pushOn | steady | holdHack | 900 | 0 (none) | - | 0% | 92% | 0.13 | 35 | 24 |
| pushOn | steady | holdExtract | 900 | 2 (1 in 450) | bleedOut 2 | 9% | 88% | 0.22 | 19 | 7 |
| pushOn | committed | holdHack | 900 | 0 (none) | - | 0% | 97% | 0.15 | 0 | 0 |
| pushOn | committed | holdExtract | 900 | 16 (1 in 56) | bleedOut 6, leftDead 11 | 10% | 90% | 0.17 | 0 | 0 |
| handWithdraw | cautious | holdHack | 900 | 4 (1 in 225) | handWithdraw 4 | 0% | 74% | 0.15 | 0 | 0 |
| handWithdraw | cautious | holdExtract | 900 | 11 (1 in 82) | handWithdraw 11 | 9% | 0% | 0.19 | 0 | 0 |
| handWithdraw | steady | holdHack | 900 | 4 (1 in 225) | handWithdraw 4 | 0% | 83% | 0.16 | 0 | 0 |
| handWithdraw | steady | holdExtract | 900 | 10 (1 in 90) | handWithdraw 10 | 8% | 0% | 0.19 | 0 | 0 |
| handWithdraw | committed | holdHack | 900 | 4 (1 in 225) | handWithdraw 4 | 0% | 90% | 0.19 | 0 | 0 |
| handWithdraw | committed | holdExtract | 900 | 27 (1 in 33) | handWithdraw 10, bleedOut 4, leftDead 15 | 10% | 0% | 0.17 | 0 | 0 |

Committed, both encounters: 16 deaths in 1800 fights (about 1 in 113). Cautious and steady, both door answers: 32 deaths in 10800 fights.

## Toughness check

Over vs On, the defaults, D2: gain in clean wins **6%** in aim-heavy fights (E3, normal decks) and **4%** in radio-heavy fights (decks weighted to backup and alarm, E2). The gate asks for the first to be at least twice the second: **NOT met**.

## Left behind (holdExtract)

The defaults, D2 E2, all 9 crews x up to 100 seeds. Grown = muscle 13 / others 8 endurance; fresh = 10 / 5 (slice 2 showed about 57% on a fresh crew on a steady extraction).

| Crew | Risk | Someone left behind | People left a fight | Clean win | Job done | Downs |
| --- | --- | --- | --- | --- | --- | --- |
| grown | cautious | 9% | 0.16 | 79% | 98% | 0.18 |
| grown | steady | 8% | 0.16 | 87% | 98% | 0.18 |
| grown | committed | 10% | 0.18 | 90% | 100% | 0.17 |
| fresh | cautious | 11% | 0.21 | 71% | 96% | 0.28 |
| fresh | steady | 11% | 0.23 | 82% | 97% | 0.29 |
| fresh | committed | 13% | 0.23 | 87% | 100% | 0.29 |

## How often each dilemma comes up

The defaults with the standing answers, D2 E2, all 9 crews x up to 100 seeds: the share of fights that raise it at least once.

| Encounter | Fights | techUnderFire (fights) | calls a fight | vanCantWait (fights) | calls a fight |
| --- | --- | --- | --- | --- | --- |
| holdHack | 900 | 1% | 0.01 | 0% | 0.00 |
| holdExtract | 900 | 0% | 0.00 | 18% | 0.18 |

Across every setting and fixed plan: holdHack techUnderFire 5%; holdExtract vanCantWait 30%.

## The game's own starting crews

Not part of the declared gate. The defaults on the first four runners of a fresh crew and of the authored crew, D2 E2 (the shipped data), threat 3, hands-off (the standing orders answer call-ins), 100 seeds. The sim crews above are built to a spec and are stronger than the fresh crew.

| Crew | Risk | Encounter | Clean win | Job done | Someone left behind | People left a fight | Downs | Died |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fresh | cautious | holdHack | 11% | 11% | 0% | 0.00 | 0.91 | 0% |
| fresh | cautious | holdExtract | 6% | 62% | 49% | 1.16 | 1.50 | 0% |
| fresh | steady | holdHack | 26% | 26% | 0% | 0.00 | 0.97 | 0% |
| fresh | steady | holdExtract | 12% | 65% | 52% | 1.37 | 1.83 | 0% |
| fresh | committed | holdHack | 53% | 53% | 0% | 0.00 | 1.75 | 4% |
| fresh | committed | holdExtract | 12% | 100% | 87% | 2.40 | 2.60 | 33% |
| authored | cautious | holdHack | 61% | 61% | 0% | 0.00 | 0.38 | 0% |
| authored | cautious | holdExtract | 28% | 98% | 58% | 1.26 | 1.35 | 0% |
| authored | steady | holdHack | 77% | 77% | 0% | 0.00 | 0.29 | 0% |
| authored | steady | holdExtract | 35% | 98% | 63% | 1.38 | 1.50 | 0% |
| authored | committed | holdHack | 86% | 86% | 0% | 0.00 | 0.31 | 0% |
| authored | committed | holdExtract | 25% | 100% | 75% | 1.52 | 1.24 | 14% |

## Run-level check (the real wiring)

Fresh-crew runs through `startMission`, `runFight`, `describePending` and `resolvePending` (call-ins answered Leave on time / Carry on, death's door Pull back), 40 per job, to show the sim's loop is the run's loop and nothing in the wiring throws or sticks:

| Job | Runs | Fights finished | Errors | Call-ins | Left behind | Deaths in a fight |
| --- | --- | --- | --- | --- | --- | --- |
| data_pull | 40 | 5 | 0 | {"pullOutPoint":5} | 0 | 0 |
| warehouse | 40 | 6 | 0 | {"pullOutPoint":6,"vanCantWait":5} | 18 | 0 |

## What this could not measure

- Specials and consumables: the engine has none, so the "resources" tolerance is heat only. The Special actions button, standby and overwatch (the planning read models neither for the five jobs) are out of the gate.
- Real players: the mid-fight layer is a fixed rule set, a floor for what a player who reads the screens might do, not a ceiling. The playtest is the test of that.
- The adapted plan is chosen on the same seeds it is scored on (paired), which favours it by a point or two.
- Hand-ordered withdrawals ("Pull out" on one runner) are not in the plans, so the "death after a hand-ordered withdrawal" case is only checked by the counts above (deaths with cause handWithdraw; the others are bleedOut and leftDead, committed only, and shotDead without an order, which should not exist).
- Death after a push on is decided by the run (`mission.js` finish), not by the fight; the table counts those still dying.

## Every cell

Full table in the matching `.csv` (1944 rows).
