# Proposal: a weapon sets how hard a hit lands (engine 2)

Status: draft for the owner, 2026-11-18. Nothing built. Follows the HP move (`docs/BATTLES.md` top: step 1 x10, step 2 the display, then hit variance at ±2 HP, `FIGHT.hitSpread`). This is the next use of "the room HP gives".

## The problem, from the code

In engine 2 (`core/fight.js`) every crew hit that lands does `FIGHT.hit` (10) or `FIGHT.strongHit` (20). A runner's weapon only moves the odds of the 20: `strongMargin(damage)` reads the weapon's damage through `FIGHT.strongMarginByDamage`, **clamped to 2-5**.

What that means today:

- **Damage above 5 does nothing in an engine 2 fight.** Damage is the frame (2-5, `data/gear.js SIDEARM_FRAMES`), plus the tier step (+1 from Verified up), plus quirks and perks (`hot loads` +1, `heavy rounds` +1, the Apex perk "Their hits do 1 more in a fight"). A Premium cannon with hot loads is damage 7 and plays exactly like a plain cannon (5).
- **Item text overpromises.** "Their hits do 1 more in a fight" is true in engine 1 (`core/battle.js` takes damage off the guard's health) but in engine 2 it is at most a slightly better chance of a 20.
- **Gear has no number to grow into.** Enemies are 10 or 20 HP (`ENEMIES`), so in an endless game the only scaling left is more bodies (`COUNT_BY_THREAT`).

## The proposal in one line

A hit's size comes from the weapon: a basic sidearm still hits for 10, each point of damage above it adds HP, a strong hit is still double. Plates take a flat 10 off a hit instead of eating the whole of a plain one. The ±2 spread becomes a share of the hit.

## The numbers (draft)

`hit(damage) = FIGHT.hit + FIGHT.hitPerDamage × max(0, damage − 3)`, with `hitPerDamage` 3; strong = 2 × hit; spread = round(hit × 0.15).

| Weapon damage | Example | Plain hit | Strong hit | Spread |
| --- | --- | --- | --- | --- |
| 2 | unarmed street piece, compact frame | 10 | 20 | ±2 |
| 3 | heritage sidearm (the default) | 10 | 20 | ±2 |
| 4 | revolver; Verified heritage | 13 | 26 | ±2 |
| 5 | cannon; Verified revolver | 16 | 32 | ±2 |
| 6 | Verified cannon | 19 | 38 | ±3 |
| 7 | Premium cannon + hot loads | 22 | 44 | ±3 |
| 8 | the top end today | 25 | 50 | ±4 |

**Damage 3 plays exactly as today** (the spread at 10 is the ±2 already shipped), so a crew on the default sidearm is unchanged and only better guns hit harder. Damage 2 hits the same size too; with Q1 (a) its strong hits come a little more often than now (margin 10, not 12), and damage 4-5 trade their better strong odds for bigger hits.

What the plain hit does to the bodies in the game now (no spread):

| | hired, 10 HP | police / secforce, 10 HP + plate | corp / enforcer, 20 HP |
| --- | --- | --- | --- |
| damage 3 (10) | down | cracks the plate, 0 through (as today) | 2 hits |
| damage 5 (16) | down | cracks, 6 through: 2 hits | 2 hits, 4 left |
| damage 7 (22) | down | cracks, 12 through: **down in one** (today only a strong hit does this) | **down in one** |

So the reward is real and it lands where it should: armoured and heavy bodies.

## The parts

1. **Hit size from damage** (crew attacks, overwatch: rifle 5, drone 3, through the same function; the hall turret through its own `damage`). `runnerOf` stores the runner's `hit` beside `strong`; it is part of `oddsKey` through the runner.
2. **Plates are a flat soak, not a whole hit.** `plateHp` (10) comes off one hit and the rest goes through. At damage 2-3 this is exactly today's rule (a plain 10 is all soaked, a strong 20 passes 10). Piercing still skips the plate.
3. **The spread scales.** `FIGHT.hitSpread` (2) becomes `FIGHT.hitSpreadShare` (0.15, rounded). Same at 10 HP, more swing on big guns.
4. **Strong odds stop reading damage** (needs your call, Q1). Today damage gives a better chance of a strong hit. If damage also sets the hit's size, a big gun counts twice. Recommended: one flat margin (10, today's margin at damage 3), so damage means size and aim means accuracy.
5. **The enemy side is unchanged** in this step: enemy shots stay as `ENEMY_HIT`, and a runner's armour still takes whole hits (Q3).
6. **Plates are a count, one per hit.** A body with two plates (none exists yet; enemy toughness would add them) loses one plate to each hit that lands, 10 off that hit, the rest through. Against two plates and 20 HP: damage 3 needs 4 hits, damage 5 needs 3, damage 7 needs 2, a damage-3 piercing gun needs 2. Plates stay the piercing guns' problem to solve, size stays the big guns' (Q6).

**Runner armour has the same cap (found 2026-11-18, fixed in the enemy-toughness step, not here).** `fight.js absorbOf` turns armour value into plates, at most 2 (`FIGHT.absorb.pro`), and each plate stops one enemy shot whole. A vest's value runs 1-3 (tier step, a skin weave), so anything above 2 is wasted, and the weave's "Takes 1 off every hit" is a whole plate here (true only in engine 1). The likely fix mirrors this proposal: each armour point takes a flat amount off every hit (about 3 HP a point). It belongs with enemy toughness, because against fixed 10 HP shots a flat soak is either nothing or nearly everything.

## What it does to the rest

- **Builds get distinct jobs.** A big gun answers a few tough bodies; Ricochet (reach 3) answers a crowd of small ones, where a 22 HP hit on a 10 HP body is wasted; the Vectors' 10 HP tick matters more on tougher bodies. That is the variety the build vocabulary is after.
- **The planning read stays honest by itself:** the board's odds replay the real fight (`fightOdds`), so they pick up the new hits with no separate estimate.
- **The death rule is unaffected:** enemies drop faster, the crew takes nothing more. The tests that guard it stay as they are.
- **Fights get easier for well-armed crews**, which is the point, but it makes threat 1-3 jobs trivial once a crew is geared. Step 3 (enemy toughness) answers that; until it lands the gate sims will show it.
- **Engine 1 is untouched** (it already uses damage directly).

## Steps

0. **Measure first, no code change.** Weapon damage across real crews over a long run (`sim-growth` or `sim-early-game`, weeks 1/10/30): how many runners sit at 2-3 (no change) and how many at 6+ (the biggest change). Tells us how much the gate numbers can move.
1. **The rule.** Parts 1-4 in `fight.js` and `data/fights.js`; save v78 adds `hit` to a fight in progress (`migrate` fills it from the runner's weapon, or 10). Tests: a damage-3 crew plays the same fights as before this change (same seeds, same outcomes); a damage-7 hit drops a plated grunt in one; a plate soaks flat. Re-run `sim-standard-force`, `sim-gate-teams`, `sim-battles`, `sim-vectors`, `sim-wayout`, before and after, in `docs/sims/`.
2. **Show it.** The weapon card says the hit in HP ("hits for 16, strong 32") next to damage; the fight screen's runner line shows it. Wording is yours (`drafts/writing-tasks.md`).
3. **Enemy toughness.** Enemy HP rises with the job's threat (and later the week or the tong's standing), which is also the "tougher swarm bodies" item. A separate proposal once step 1's sims are in, since it moves every gate number.

Then the build vocabulary's trigger step (`drafts/PROPOSAL-build-vocabulary.md`), which now has bigger numbers to work with.

## Questions for the owner (six)

1. **Strong odds.** (a) Damage sets size only; one flat strong margin for everyone **(recommended)**. (b) Damage sets size and still improves strong odds (big guns count twice). (c) Leave strong odds as they are, capped at 5.
2. **How steep.** `hitPerDamage` (a) 3: top gun about 2.5× a basic one **(recommended)**; (b) 2: gentler, top gun 1.6×; (c) 5: steep, top gun 3.5×, big guns one-shot nearly anything until enemies scale.
3. **Runner armour.** (a) Leave it taking whole hits until enemy toughness (step 3) **(recommended: one side at a time keeps the sims readable)**; (b) make it a flat soak now, to match enemy plates.
4. **Turret and overwatch.** (a) Same formula from their own damage **(recommended)**; (b) leave them as today.
6. **A big hit against several plates.** (a) One plate per hit, the rest through **(recommended: armour stays a separate problem from health, the stage shows one crack a hit)**; (b) the hit spends itself across plates (a 22 breaks two 10s and sends 2 through): big guns strip armour fast and multi-plate bodies stop meaning much.
5. **Order.** (a) This, then enemy toughness, then the trigger step **(recommended)**; (b) the trigger step first, this after.

## Rejected

- **Combat stat adds to hit size.** Stats already set the chance to hit; gear setting the size keeps the two levers separate and makes loot matter.
- **Variance upward only.** Moves the average, so every number would need retuning for nothing.
- **Keep plates eating a whole hit.** Then a damage-7 gun does nothing more than a damage-3 one against police, the most common armoured body.
- **Raise every enemy's HP now, in the same change.** Two moving parts in one sim; the before-and-after would not say which did what.
