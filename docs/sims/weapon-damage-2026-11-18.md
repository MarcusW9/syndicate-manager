# Weapon damage as the game hands it out (2026-11-18)

Step 0 of `drafts/PROPOSAL-gear-hit-size.md`; no rules changed. Script: `node scripts/sim-weapon-damage.mjs` (4000 sidearms a tier, made by the game's own `makeItem`, read through `core/battle.js weaponOf`). "hit" is the plain hit as built, 10 + 3 x max(0, damage - 2) (the base moved from 3 to 2 the same day, owner). No sim plays a long game that buys and equips gear, so this is what a crew can hold, not what one does.

```
Sidearm damage by tier (4000 each). Unarmed: damage 2.

| tier | dmg 1 (hit 10) | dmg 2 (hit 10) | dmg 3 (hit 13) | dmg 4 (hit 16) | dmg 5 (hit 19) | dmg 6 (hit 22) | dmg 7 (hit 25) | above 5 (wasted before hit size) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| standard | 3% | 19% | 31% | 26% | 17% | 4% | 0% | 4% |
| verified | 0% | 2% | 17% | 40% | 25% | 12% | 4% | 16% |
| custom | 0% | 2% | 17% | 40% | 25% | 12% | 4% | 16% |
| premium | 0% | 2% | 17% | 40% | 25% | 12% | 4% | 16% |

A job's drop: 35% of jobs drop gear, 22% of drops are sidearms, so about one job in 13 drops one.
With the spare piece (a Standard sidearm instead of scrap, 25% of misses): about one job in 4.2 gives a sidearm.
A dropped sidearm by damage: 1: 2%, 2: 12%, 3: 25%, 4: 31%, 5: 20%, 6: 8%, 7: 2%.
Apex Signal Ten: damage 5 (hit 19).
Apex Last Word: damage 4 (hit 16).
Starting crews (200 games): dmg 2: 100%.
```

## What it says

- **Every starting runner is unarmed (damage 2)**, so a new crew plays exactly as today under the proposal. The change only shows once gear arrives.
- **About one job in 13 drops a sidearm.** A dropped one is mostly damage 3-5 (76%); 10% are 6-7.
- **Above Standard, a sidearm is damage 4-5 two times in three, and 6-7 one time in six.** Today that 6-7 plays exactly like a 5 in engine 2.
- **Sidearm perks never add damage.** The only damage perk, Targeting overlay (+1, capped at 1), sits on a deck or an implant, so the top end a runner can reach is 8 (a damage-7 sidearm plus the overlay): a plain hit of 28.
- **Damage 1 exists** (a compact frame with light loads); it hits for 10, like unarmed, so a bad roll is never worse than bare hands.
- **The two Apex sidearms are damage 5 and 4** (hits 19 and 16); their perks are pierce and stats, not damage.

## For the proposal

Most crews will hold damage 3-5, so most fights will see hits of 13-19, and the 22-28 hits are rare finds. That fits "a better gun hits harder, a top gun is a prize". The gate sims in step 1 should test crews at damage 2 (the start), 4 and 6.
