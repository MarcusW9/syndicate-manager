# Proposal: enemies grow with the job, and armour becomes a flat soak (engine 2)

Status: **step 1 built 2026-11-18 (save v79), the owner agreed all the recommended answers; changed while building: HP only, no plate at threat 5 (HP and a plate together cost a damage-6 pro-vest crew 12 HP, target about 3; `docs/sims/enemy-toughness-2026-11-18-step1.md`). Threat 5 then halved to +5 HP by the owner, 2026-11-19. **Step 2 built 2026-11-19 (save v80) at 5 HP a point, not 3 (Q4 answered again by the owner): the sim found the soak weaker than the plates, not stronger, so part 3's warning and part 4's shot growth do not apply as written (`docs/sims/armour-soak-2026-11-19.md`).** Step 3 not built.** Originally: draft, nothing built. Step 3 of the agreed order (hit size → this → the build vocabulary's trigger step). Needs the owner's answers to the questions at the end. Numbers come from `scripts/sim-enemy-toughness.mjs` (new, measures only) and `docs/sims/enemy-toughness-2026-11-18-equip.md`.

## The problem, from the code and the sim

Enemies have not moved since the fights began: `data/fights.js ENEMIES` are 10 or 20 HP with at most one plate, `ENEMY_HIT` is 10 or 20, and the only difficulty dial is how many bodies start (`COUNT_BY_THREAT` = 2, 2, 3, 3, 4 for threat 1-5). Hit size (#204) gave a weapon a number to grow into; enemies have nothing to grow against.

The new equip step gives every runner damage 2, 4 or 6 (hit 10, 16, 22) and a street (1 plate) or pro (2 plates) vest, and plays threat 1-5 fights with today's enemies (committed, a combat 11-16 crew of 4-6, so a strong crew: it shows the floor, not the middle). Average **HP the crew lost in a fight**:

| Threat | Bare hands (10), 1 plate | Damage 4 (16), 1 plate | Damage 6 (22), 1 plate | Damage 6 (22), 2 plates |
| --- | --- | --- | --- | --- |
| 1-2 | 7 | 1 | 2 | 0 |
| 3-4 | 11 | 3 | 3 | 1 |
| 5 | 20 | 8 | 3 | 1 |

- A damage-4 gun cuts the loss by 60-85% on every threat; a damage-6 gun with a pro vest makes **threat 5 cost 1 HP**. Win stays 100% and nobody dies at any of these.
- **Threat stops meaning anything once a crew has found guns and vests.** Threat 1 and threat 5 lose about the same HP for a damage-6 crew (2 and 3). Threat 1-2 are already trivial for the damage-4 crew.
- Armour has the same problem the other way round: two plates stop two shots of any size, so a pro vest halves the damage at every threat, and a vest's third point (value 3 exists) is wasted. At the 20 HP shot a corp or enforcer fires, a plate is worth 20 HP; at a 10 HP shot, 10.
- Unarmed crews are the early game. The numbers there are the ones the early game was tuned on and **must not move** (below).

## What each lever does (the same sim, one lever at a time, committed, 1 plate)

Average HP lost, win %, someone down %:

| Lever | Threat 1, bare | Threat 5, bare | Threat 5, damage 4 | Threat 5, damage 6 |
| --- | --- | --- | --- | --- |
| Today | 7 · 100% · 0% | 20 · 100% · 2% | 8 · 100% · 1% | 3 · 100% · 1% |
| **Enemy HP ×2** | 14 · 100% · 1% | 62 · 95% · 23% | 36 · 99% · 10% | 10 · 100% · 1% |
| **+1 plate each** | 10 · 100% · 0% | 51 · 97% · 14% | 28 · 99% · 5% | 9 · 100% · 1% |
| **Enemy shot +5** | 10 · 100% · 1% | 30 · 97% · 8% | 12 · 100% · 3% | 5 · 100% · 1% |
| HP ×2 and shot +5 | 19 · 100% · 3% | 83 · 84% · 44% | 48 · 95% · 21% | 14 · 100% · 3% |

Reading it:

- **HP and plates are the levers that scale the way a gun does.** They hold a bare crew's loss down at threat 1 (7 → 14 or 10, not a new fight) while pulling a damage-6 crew at threat 5 from 3 to 9-10, which is what the threat number should mean. The bare crew at threat 5 does take a hit (20 → 51-62, and 14-23% someone down): that is the intended dial, since a threat 5 job against bare hands was never meant to be easy, and the real job gates (`sim-gate-teams`) decide where it lands.
- **Enemy shot size is the wrong first lever.** It hits the unarmed crew hardest where they are weakest (threat 1 is the only place a new crew can go) and does little to a geared crew with two plates (a plate takes a whole shot at any size). It belongs with armour as a flat soak (part 3), not on its own.
- **Plates scale with piercing and armour differently from HP** (plates are the piercing guns' problem; HP is the big guns'), so using both gives gear two separate jobs.

## The proposal in one line

Enemies get HP and plates from a **toughness** of the job (threat first, the week or the tong's standing later), bodies at threat 1-2 stay exactly as they are, and armour becomes a flat soak so a vest point is worth the same everywhere.

## The parts

1. **What grows, and in what order.** One lever at a time: **plates, then HP**, both by threat; enemy shot size and count last.
   - Count stays on `COUNT_BY_THREAT`.
   - Plates: threat 1-4 as today; threat 5 +1 on every body (a drone, police, secforce go to 2; hired, corp, enforcer go to 1).
   - HP: threat 4 +5 on every body, threat 5 +10. (HP reads from one table `TOUGHNESS_BY_THREAT`, `[0, 0, 0, 0, 1, 2]` steps of 5 HP, plates from the same index, so a later week or standing adds a step without new code.)
   - Starting values are guesses; the first build tunes them against `sim-gate-teams` and the equip sim until threat 5 costs a damage-6, pro-vest crew about what threat 3 costs a damage-4, 1-plate crew today (about 3 HP).
2. **Swarm bodies.** The small bodies (hired, police, secforce: 10 HP) stay 10 HP at threat 1-3. At damage 6 (hit 22) a 10 HP body is already a one-shot and a swarm of them is Ricochet's job; above threat 3 they grow by the same table, so a damage-6 plain hit (22) still one-shots a threat-4 body (15 HP) but not a threat-5 (20 HP, 25 with a plate). That keeps Ricochet the best answer to a crowd without making it the only one: a big gun answers a few, a spread answers many, and a body that survives a hit gives the Vectors' 10 HP tick something to do.
3. **Runner armour as a flat soak.** `absorbOf` stops turning armour value into at most two whole-shot plates. Each armour point takes a flat **3 HP off every shot** (enemy shots: 10, 20; a vest 1-3 takes 3, 6 or 9), min 1 through, the same shape as the weapon's hit, so the weave's "Takes 1 off every hit" stops being a whole plate and becomes real. The data text on a vest ("armour: flat soak in a fight, taken off every hit", `data/gear.js`) is already the engine-1 rule; this makes engine 2 say the same.
   - Piercing already ignores armour on the other side; the same guns' players now meet the flat number.
   - Against today's 10 HP shots a value-3 vest would stop 9 of 10, which is why this waits until enemy shots grow (part 4): without growth, a flat soak is either nothing or nearly everything.
4. **Enemy shot size follows, late.** Once armour soaks flat, enemy shots grow with threat too: `ENEMY_HIT` +5 at threat 5 only, applied in the same threat table. This is the last step and optional for the first build (Q3).
5. **Starting crews unchanged at threat 1-2.** Every table row at threat 1-2 keeps today's enemies exactly (same HP, same plates, same shots). A save in progress needs nothing for them.
6. **Rules that must hold.**
   - No death on cautious or steady without a call-in; the committed-death tests stay as they are, and the gate sims print the declared targets.
   - **Shown risk equals used risk.** The planning read replays the real fight (`fightOdds`), so new enemy HP and plates follow by themselves; the new fields (an enemy's `max`, `absorb`, the table's value) are in the enemy state already, so `oddsKey` needs only the runner's new soak value added (`r.soak`).
   - **Save:** the fight's shape changes (runner `soak`, enemies carry their own HP already), so bump `SAVE_VERSION` and have `migrate` give a fight in progress the old values: a runner `soak` of 0 and `absorb` as it stands, so a saved fight plays out under the old rules.

## Steps

0. **Measure first.** Done here: `scripts/sim-enemy-toughness.mjs` and its `docs/sims/` file (the equip step; a crew at damage 2, 4 and 6, 1 and 2 plates). Next: put the same equip step into `sim-gate-teams` as an option (best weapon and vest from the stash to the best runners) so the 26 jobs are measured geared too.
1. **Enemies by threat** (parts 1-2, 5): the table, the build step, tests (threat 1-2 fights are byte-for-byte as before on the same seeds; a threat-5 enemy has its extra HP and plate). Sims before and after: `sim-gate-teams`, `sim-standard-force`, `sim-vectors`, `sim-wayout`, into `docs/sims/`.
2. **Armour as a flat soak** (part 3), its own commit and its own sim pair: one side at a time keeps the sims readable.
3. **Enemy shot growth** (part 4), only if step 2 shows the soak is too strong at threat 5.
4. `docs/BATTLES.md`, the design log, the changelog, HANDOFF.

## Questions for the owner (recommended option first)

1. **Which lever first?** (a) Plates and HP from threat, shot size later **(recommended)**: scales a gun and an armour piece separately, and bare crews at threat 1-2 do not move. (b) Shot size first: hits the unarmed crew hardest and does little to a pro vest (see the table). (c) HP only, no plates: simplest, but the piercing guns then have nothing to answer.
2. **How far at threat 5?** (a) +1 plate and +10 HP **(recommended; the sim here ran each lever alone, so the first build measures the pair)**: bare crews take real damage at threat 5, geared ones still win. (b) +1 plate and +5 HP: gentler, threat 5 stays close to today for a damage-4 crew. (c) Double HP (62 HP lost for a bare crew, 23% someone down in the sim): threat 5 becomes a job a new crew should not take.
3. **Enemy shot growth.** (a) Only if the soak step is too strong **(recommended)**; (b) always, +5 at threat 5, with the soak.
4. **Armour soak per point.** (a) 3 HP **(recommended)**, a value-3 vest takes 9 off a 10 HP shot, 1 gets through; (b) 2 HP: weaker, a pro vest matters less; (c) keep the plates and add the soak on top.
5. **Where it ends.** Threat is capped at 5 and the game is endless. (a) The table stops at 5 and the week or the tong's standing adds steps later, in its own proposal **(recommended)**. (b) Add the week to the table now.
6. **Current death-rate overshoots** (data_pull 11.5%, quiet_hours 10.0%, still_connected 12.5%, the_wrong_fare 11.3%, wrong_horse 9.7%; target 8%). (a) Leave them, as they were over before #204 and tougher enemies do not make them smaller **(recommended)**; (b) tune them as part of step 1.

## Rejected

- **Everything up at once** (the last table row: HP ×2 and shot +5). A bare crew at threat 5 wins 84% with 44% someone down and 4% a death on committed; too sharp, and the sims could not say which lever did what.
- **Per-enemy random toughness.** The planning read replays one fight and would still be honest, but a player could not read a threat number off the job.
- **Scaling the crew's HP.** Hit size already moved their side; this step is the enemies'.
- **Plates that grow without a limit.** At two plates a damage-3 gun needs 4 hits; past that only piercing guns work and the weapon variety collapses.
