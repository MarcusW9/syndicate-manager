# Battle rework, slice 3: the validation gate on the real code (2026-11-15-after-newjobs)

`node scripts/sim-orders.mjs 100 2026-11-15-after-newjobs` — played on core/fight.js and core/runfight.js, not the paper rules. The declared gate is the `GATE` block at the top of the script (hash `f440deff`); it was written and the bar confirmed by the owner before this run, and was not changed after.

## Declared gate

- Seeds: 100 per cell, the same seeds for every plan. Encounters: holdHack (Glass Heights: corp and drones, Office Data Pull's rules) and holdExtract (Docks: hired and enforcers), threat 3 (three enemies), base difficulty 14, steady risk, no overwatch, standby or driver.
- Crew groups: Under / On / Over (main stat +0 / +3 / +6, others −5 / −2 / +1, cool −2 / 0 / +3 on a base of 14) x line-ups a (tech, muscle, medic with a deck, gunner), b (tech, muscle, two gunners, one with a machine pistol), c (tech, face, medic, gunner) = 9. Endurance rolled per runner per seed: muscle about 13, others about 8 (a grown crew on the owner's scale); fresh (10 / 5) in the left-behind table.
- Settings: enemy durability D1 (all minimum), D2 (the game's own), D3 (+1 pip) x exposure E1/E2/E3 (aimStep 0 / 2 / 4; E2 is the game's own) = 9. D2 E2 is the shipped data.
- Fixed plans, each one *unchanged* (set once; call-ins answered by the standing orders): attack, hold, protect, support, mixed, defaults. Adapted plans, chosen per cell and encounter as the best clean-win share (then fewest downs) of the 12 candidates: the six fixed plans, and the same six with the **mid-fight layer** (marked `+`): answers to the call-ins (the van by its shown odds; the tech under fire: cover if two shots are on them, else jam if offered, else hit the caller) and Take Command between rounds (the plan's orders come back each round; a hurt tech with open shots gets everyone covering them; an unanswered radio call gets a jammer or the best shot).
- "Effectively as good": within 5 points of clean wins, 0.25 downed runners and 0.3 heat per fight (heat is the only resource a fight spends; specials and consumables do not exist in the game yet).
- Bar: adapting beats an unchanged plan by 7.000000000000001+ points or 0.3+ fewer downs in at least one encounter. **Rework** if some unchanged plan is as good as adapting in both encounters in at least two thirds of cells; **proceed** if adapting clears the bar against every unchanged plan in at least two thirds of cells and no plan is as good in both.
- Measures: *clean win* = the objective done and nobody dead, left behind or walked off (`won`); *job done* also counts a van that left with someone missing; *downs* = runners who went to 0 pips at any point.

## Verdict

**REWORK** (full adapted set, 81 cells). Rework line (some unchanged plan as good in both encounters): attack 0%, hold 0%, protect 15%, support 33%, mixed 47%, defaults 83%. Adapting clears the bar against every unchanged plan in 5% of cells (5% with no plan as good in both); the line is 67%.

Adapting by choice only (the six fixed plans, no mid-fight layer): **REWORK**; rework line attack 0%, hold 0%, protect 15%, support 33%, mixed 47%, defaults 84%; clears the bar in 4% of cells (4% with no plan as good in both).

### Mean over all cells, per candidate

| Plan | holdHack win | downs | heat | holdExtract win | downs | left behind | heat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| attack | 79% | 0.15 | 0.00 | 58% | 0.17 | 30% | 0.06 |
| hold | 38% | 0.51 | 0.00 | 84% | 0.49 | 3% | 0.04 |
| protect | 94% | 0.10 | 0.00 | 78% | 0.70 | 14% | 0.16 |
| support | 95% | 0.11 | 0.00 | 84% | 0.46 | 7% | 0.08 |
| mixed | 89% | 0.09 | 0.00 | 92% | 0.15 | 2% | 0.03 |
| defaults | 95% | 0.06 | 0.00 | 92% | 0.15 | 2% | 0.03 |
| attack+ | 82% | 0.10 | 0.00 | 68% | 0.18 | 18% | 0.29 |
| hold+ | 60% | 0.24 | 0.00 | 81% | 0.46 | 2% | 0.01 |
| protect+ | 92% | 0.11 | 0.00 | 81% | 0.50 | 12% | 0.04 |
| support+ | 92% | 0.12 | 0.00 | 84% | 0.42 | 7% | 0.02 |
| mixed+ | 86% | 0.08 | 0.00 | 92% | 0.13 | 2% | 0.01 |
| defaults+ | 93% | 0.07 | 0.00 | 92% | 0.13 | 2% | 0.01 |

### Best candidate per setting (share of the 9 crew groups where it is best, per encounter)

**holdHack**

| Setting | attack | hold | protect | support | mixed | defaults | attack+ | hold+ | protect+ | support+ | mixed+ | defaults+ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 E1 | 33% | 0% | 22% | 0% | 22% | 22% | 0% | 0% | 0% | 0% | 0% | 0% |
| D1 E2 | 22% | 0% | 33% | 0% | 0% | 44% | 0% | 0% | 0% | 0% | 0% | 0% |
| D1 E3 | 22% | 0% | 33% | 0% | 11% | 33% | 0% | 0% | 0% | 0% | 0% | 0% |
| D2 E1 | 0% | 0% | 22% | 22% | 11% | 11% | 11% | 0% | 0% | 0% | 0% | 22% |
| D2 E2 | 0% | 0% | 11% | 22% | 11% | 33% | 11% | 0% | 0% | 0% | 0% | 11% |
| D2 E3 | 0% | 0% | 11% | 22% | 0% | 44% | 11% | 0% | 11% | 0% | 0% | 0% |
| D3 E1 | 0% | 0% | 22% | 33% | 0% | 11% | 11% | 0% | 22% | 0% | 0% | 0% |
| D3 E2 | 0% | 0% | 11% | 67% | 0% | 11% | 0% | 0% | 11% | 0% | 0% | 0% |
| D3 E3 | 0% | 0% | 0% | 56% | 0% | 11% | 0% | 0% | 22% | 0% | 0% | 11% |

**holdExtract**

| Setting | attack | hold | protect | support | mixed | defaults | attack+ | hold+ | protect+ | support+ | mixed+ | defaults+ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 E1 | 0% | 0% | 0% | 0% | 56% | 0% | 0% | 11% | 0% | 11% | 22% | 0% |
| D1 E2 | 0% | 0% | 0% | 0% | 67% | 0% | 0% | 0% | 0% | 0% | 33% | 0% |
| D1 E3 | 0% | 0% | 0% | 0% | 56% | 0% | 0% | 0% | 0% | 0% | 44% | 0% |
| D2 E1 | 0% | 0% | 0% | 0% | 56% | 0% | 0% | 11% | 0% | 11% | 22% | 0% |
| D2 E2 | 0% | 0% | 0% | 0% | 67% | 0% | 0% | 0% | 0% | 0% | 33% | 0% |
| D2 E3 | 0% | 0% | 0% | 0% | 56% | 0% | 0% | 0% | 0% | 0% | 44% | 0% |
| D3 E1 | 0% | 0% | 0% | 0% | 67% | 0% | 0% | 11% | 0% | 11% | 11% | 0% |
| D3 E2 | 0% | 11% | 0% | 0% | 44% | 0% | 0% | 11% | 0% | 11% | 22% | 0% |
| D3 E3 | 0% | 22% | 0% | 0% | 67% | 0% | 0% | 0% | 0% | 11% | 0% | 0% |

Adapting clears the bar by durability: D1 0%, D2 0%, D3 15%; by exposure: E1 4%, E2 4%, E3 7%; by margin: Under 7%, On 7%, Over 0%.

## Mid-fight adapting, alone

The same plan with and without the layer (mean over every cell and fixed plan):

| Encounter | clean wins gained | downs saved | cells where the layer alone clears the bar |
| --- | --- | --- | --- |
| holdHack | +2.5 points | +0.05 | 21% |
| holdExtract | +1.4 points | +0.05 | 17% |

Answers the layer gave (all layered fights): techUnderFire:jam 178100, pullOutPoint:carryOn 826700, pullOutPoint:cover 224500, techUnderFire:cover 32600, vanCantWait:hold 306600, vanCantWait:goNow 377100.

## Deaths per risk level

The defaults, the game's own settings (D2 E2), all 9 crews x up to 100 seeds, per encounter. Target: none on cautious or steady except after a push on or a hand-ordered withdrawal; about one in 25 committed. "Push on" answers death's door with Keep fighting (the death after a push on is decided by the run's finish, not by the fight, so the fights count those still dying at the end).

"Hand withdraw" orders the most hurt runner out by hand in round 2.

| Door answer | Risk | Encounter | Fights | Deaths in the fight | Causes | Left behind | Clean win | Downs | Pushed on | Still dying at the end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pullBack | cautious | holdHack | 900 | 0 (none) | - | 0% | 91% | 0.05 | 0 | 0 |
| pullBack | cautious | holdExtract | 900 | 0 (none) | - | 2% | 85% | 0.08 | 0 | 0 |
| pullBack | steady | holdHack | 900 | 0 (none) | - | 0% | 95% | 0.07 | 0 | 0 |
| pullBack | steady | holdExtract | 900 | 0 (none) | - | 1% | 94% | 0.08 | 0 | 0 |
| pullBack | committed | holdHack | 900 | 0 (none) | - | 0% | 99% | 0.08 | 0 | 0 |
| pullBack | committed | holdExtract | 900 | 5 (1 in 180) | bleedOut 1, leftDead 5 | 2% | 98% | 0.08 | 0 | 0 |
| pushOn | cautious | holdHack | 900 | 0 (none) | - | 0% | 93% | 0.05 | 16 | 13 |
| pushOn | cautious | holdExtract | 900 | 0 (none) | - | 2% | 86% | 0.09 | 13 | 6 |
| pushOn | steady | holdHack | 900 | 0 (none) | - | 0% | 98% | 0.07 | 28 | 20 |
| pushOn | steady | holdExtract | 900 | 0 (none) | - | 2% | 95% | 0.09 | 13 | 5 |
| pushOn | committed | holdHack | 900 | 0 (none) | - | 0% | 99% | 0.08 | 0 | 0 |
| pushOn | committed | holdExtract | 900 | 5 (1 in 180) | bleedOut 1, leftDead 5 | 2% | 98% | 0.08 | 0 | 0 |
| handWithdraw | cautious | holdHack | 900 | 3 (1 in 300) | handWithdraw 3 | 0% | 83% | 0.09 | 0 | 0 |
| handWithdraw | cautious | holdExtract | 900 | 6 (1 in 150) | handWithdraw 6 | 1% | 0% | 0.07 | 0 | 0 |
| handWithdraw | steady | holdHack | 900 | 3 (1 in 300) | handWithdraw 3 | 0% | 90% | 0.10 | 0 | 0 |
| handWithdraw | steady | holdExtract | 900 | 4 (1 in 225) | handWithdraw 4 | 1% | 0% | 0.07 | 0 | 0 |
| handWithdraw | committed | holdHack | 900 | 3 (1 in 300) | handWithdraw 3 | 0% | 95% | 0.13 | 0 | 0 |
| handWithdraw | committed | holdExtract | 900 | 5 (1 in 180) | handWithdraw 4, leftDead 1 | 2% | 0% | 0.07 | 0 | 0 |

Committed, both encounters: 5 deaths in 1800 fights (about 1 in 360). Cautious and steady, both door answers: 16 deaths in 10800 fights.

## Toughness check

Over vs On, the defaults, D2: gain in clean wins **2%** in aim-heavy fights (E3, normal decks) and **1%** in radio-heavy fights (decks weighted to backup and alarm, E2). The gate asks for the first to be at least twice the second: **NOT met**.

## Left behind (holdExtract)

The defaults, D2 E2, all 9 crews x up to 100 seeds. Grown = muscle 13 / others 8 endurance; fresh = 10 / 5 (slice 2 showed about 57% on a fresh crew on a steady extraction).

| Crew | Risk | Someone left behind | People left a fight | Clean win | Job done | Downs |
| --- | --- | --- | --- | --- | --- | --- |
| grown | cautious | 2% | 0.04 | 85% | 99% | 0.08 |
| grown | steady | 1% | 0.03 | 94% | 99% | 0.08 |
| grown | committed | 2% | 0.05 | 98% | 100% | 0.08 |
| fresh | cautious | 3% | 0.07 | 76% | 97% | 0.14 |
| fresh | steady | 3% | 0.07 | 89% | 98% | 0.15 |
| fresh | committed | 4% | 0.08 | 96% | 100% | 0.18 |

## How often each dilemma comes up

The defaults with the standing answers, D2 E2, all 9 crews x up to 100 seeds: the share of fights that raise it at least once.

| Encounter | Fights | techUnderFire (fights) | calls a fight | vanCantWait (fights) | calls a fight |
| --- | --- | --- | --- | --- | --- |
| holdHack | 900 | 0% | 0.00 | 0% | 0.00 |
| holdExtract | 900 | 0% | 0.00 | 2% | 0.02 |

Across every setting and fixed plan: holdHack techUnderFire 4%; holdExtract vanCantWait 14%.

## The game's own starting crews

Not part of the declared gate. The defaults on the first four runners of a fresh crew and of the authored crew, D2 E2 (the shipped data), threat 3, hands-off (the standing orders answer call-ins), 100 seeds. The sim crews above are built to a spec and are stronger than the fresh crew.

| Crew | Risk | Encounter | Clean win | Job done | Someone left behind | People left a fight | Downs | Died |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fresh | cautious | holdHack | 18% | 18% | 0% | 0.00 | 0.78 | 0% |
| fresh | cautious | holdExtract | 17% | 68% | 18% | 0.42 | 0.97 | 0% |
| fresh | steady | holdHack | 37% | 37% | 0% | 0.00 | 0.81 | 0% |
| fresh | steady | holdExtract | 47% | 69% | 16% | 0.48 | 1.17 | 0% |
| fresh | committed | holdHack | 76% | 76% | 0% | 0.00 | 1.34 | 7% |
| fresh | committed | holdExtract | 60% | 100% | 37% | 0.97 | 1.87 | 21% |
| authored | cautious | holdHack | 74% | 74% | 0% | 0.00 | 0.25 | 0% |
| authored | cautious | holdExtract | 60% | 98% | 17% | 0.37 | 0.67 | 0% |
| authored | steady | holdHack | 86% | 86% | 0% | 0.00 | 0.16 | 0% |
| authored | steady | holdExtract | 74% | 99% | 24% | 0.55 | 1.03 | 0% |
| authored | committed | holdHack | 93% | 93% | 0% | 0.00 | 0.19 | 0% |
| authored | committed | holdExtract | 73% | 100% | 27% | 0.58 | 0.82 | 6% |

## Run-level check (the real wiring)

Fresh-crew runs through `startMission`, `runFight`, `describePending` and `resolvePending` (call-ins answered Leave on time / Carry on, death's door Pull back), 40 per job, to show the sim's loop is the run's loop and nothing in the wiring throws or sticks:

| Job | Runs | Fights finished | Errors | Call-ins | Left behind | Deaths in a fight |
| --- | --- | --- | --- | --- | --- | --- |
| data_pull | 40 | 9 | 0 | {"pullOutPoint":5} | 0 | 0 |
| warehouse | 40 | 2 | 0 | {"pullOutPoint":8} | 0 | 0 |

## What this could not measure

- Specials and consumables: the engine has none, so the "resources" tolerance is heat only. The Special actions button, standby and overwatch (the planning read models neither for the five jobs) are out of the gate.
- Real players: the mid-fight layer is a fixed rule set, a floor for what a player who reads the screens might do, not a ceiling. The playtest is the test of that.
- The adapted plan is chosen on the same seeds it is scored on (paired), which favours it by a point or two.
- Hand-ordered withdrawals ("Pull out" on one runner) are not in the plans, so the "death after a hand-ordered withdrawal" case is only checked by the counts above (deaths with cause handWithdraw; the others are bleedOut and leftDead, committed only, and shotDead without an order, which should not exist).
- Death after a push on is decided by the run (`mission.js` finish), not by the fight; the table counts those still dying.

## Every cell

Full table in the matching `.csv` (1944 rows).
