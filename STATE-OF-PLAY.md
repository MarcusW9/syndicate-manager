# State of play · 2026-10-26

A design review of the whole game as it stands on `main` (`4ada93b`, save v20, 227 tests), so later sessions don't need to redo it. It's an assessment, not a set of decisions: nothing here is agreed until the owner says so, and agreed items go into `DESIGN.md`'s log as usual. When this file goes stale, write a new review and add a line under it saying which version replaced it, rather than rewriting this one.

## Summary

The foundation is strong: a seeded, pure core; save versions with migrations; tests that encode the design promises; and "shown risk equals used risk" followed through. The content layer is getting rich (situations, earned traits, stat unlocks, side tasks, hands-off runs, mission logs).

**The main gap:** the game keeps adding inputs to rolls (stats, traits, situations, intel) but has few pressures that force hard choices. After the first month, money, heat and danger stop pushing back.

## Simulation

The tests' careful bot (`tests/play.js` `playWeeks`, `carefulPolicy`): fresh rookie crew, 12 seeds, always the stealth approach, takes the best-paying job it can staff.

| Week | Cash (median) | Broke | Reputation | Heat | Deaths | Main stat (median / best) |
|---|---|---|---|---|---|---|
| 8 | ¥12k | 0/12 | 6 | 0 | 0 | 10 / 12 |
| 26 | ¥30k | 0/12 | 23 | 0 | 0 | 11 / 14 |
| 52 | ¥97k | 0/12 | 79 | 0 | 0 | 14 / 17 |

Caveats: the bot never hires, never resolves renewal notices (the wage bill stayed at ¥1,250 all year) and never runs side tasks. The numbers are rough, but the shape is clear: cash piles up with nothing to spend it on, heat never rises, and nobody dies.

Script used (run from `tests/`, then delete it):

```js
import { playWeeks } from './play.js';
import { primaryStat } from '../src/core/development.js';
const { state: s, deaths } = playWeeks(52, 7919, undefined, { startCrew: 'fresh' });
console.log(s.cash, s.reputation, s.heat, deaths, s.crew.map((o) => o.stats[primaryStat(o)]));
```

## What would add depth (Claude's recommendation, in priority order)

1. **Money pressure.** The Sunday rent beat is gone by month two. Options:
   - **The cut:** the crew expect a share of bigger jobs on top of wages. Payday becomes a loyalty decision; heists need the same cut split.
   - **Costs that grow with the crew:** tea money to the Brass Anchor Society once you're noticed, clinic bills for serious injuries, upkeep on safehouse rooms.
   - **A real lender:** Madam Rao lends money, so being broke becomes a story rather than a −10 morale tick.
2. **Wire up or remove values that are tracked but do nothing.**
   - `condition.morale` moves (jobs, deaths, missed payments) but nothing reads it.
   - `condition.burnout` is never used.
   - The neural-load warning in `core/mission.js` ("pushing harder risks a breakdown") promises a breakdown that doesn't exist.
   - Suggestion: morale shapes renewal asks and loyalty, with a visible ±1 at the extremes; neural load over 70 risks the existing Burned Out trait on neural choices; delete `burnout`.
3. **Approaches with real costs.** Stealth only costs −1 combat, so heat stays at 0 forever. Ideas: stealth takes an extra day or more fatigue, social costs bribes, loud is faster or pays more. Heat per district instead of citywide, with hot districts drawing more `law` crises (situations make this cheap).
4. **Clients that compete.** Client trust moves independently today. If Szeto and Auntie Fung want opposite outcomes in Old Town, picking a job becomes a political choice rather than "whatever pays best".
5. **Crew relationships** (PLAN-PROGRESSION.md step 3, not started). The biggest gap in the Football Manager / RimWorld attachment. `op.trust` exists but nothing in the game reads it. Build it alongside the career page.
6. **Repetition.** 8 rookie jobs and 14 shared rookie crises over a rookie period of about ten weeks: players will see repeats often. Before writing many more, consider variants of a crisis by district or recurring character (cast slots already support this).
7. **Danger.** Careful play loses nobody, which keeps the promise, but attachment needs the fear of loss. Make pushing on at a critical tempting (a real bonus for staying), and give serious injuries lasting marks. Both stay inside "death only follows a choice".

**Suggested order** (differs slightly from HANDOFF.md's):
1. Wire up or remove the inert values (small).
2. Career page plus relationships.
3. Money pressure.
4. Heists, then promotions.

Heists need money pressure first, or the cut split won't matter. Promotions fix reputation topping out at 100 (nothing new opens past the threat-5 gate at 80) but wait on the district writing (task 10), which the owner can write in parallel.

## Cleanup

- [x] `HANDOFF.md` said "once #18 is merged"; it's on `main` (fixed with this review).
- [ ] `PLAN-PROGRESSION.md` still shows step 2 unticked, though stat unlocks and earned traits shipped; only the career page is left.
- [ ] `src/ui/app.js` is 78KB in one file, and `src/core/mission.js` is 37KB. Split the UI by screen before heists add more.
- [ ] Rule tests default to the old authored crew (`startCrew: 'classic'`), but players only get the fresh crew. Test the design promises against a fresh crew too.
- [ ] The season bot (`tests/play.js`) never hires, settles renewals or runs side tasks, so tuning from it flatters the economy. A fuller season bot would make tuning honest.
- [ ] Minor: `round50` is defined twice (`core/jobs.js`, `core/pricing.js`); `createNewGame` sets rent to 4,000 and then overwrites it for every fresh game.

## Owner's response

Record the owner's calls here as they come; decisions also get `DESIGN.md` log rows.

- **Item 2, inert values (2026-10-26):** wire neural load as proposed (−1 on `neural` rolls over 70, a failed one earns Burned Out); remove burnout (save v21); morale affects raises and loyalty only, designed with money pressure. See the `DESIGN.md` row. Not built yet.
- **Item 1, money pressure (2026-10-26):** mostly positive. In: gear (never lost or broken), base rooms with upkeep, clinic bills, tea money. Out for now: the cut. See the `DESIGN.md` row. Gear stays worth buying by being per person, tiered by promotion, and limited to what each person can carry on a job. Open: details of gear and rooms.
- **Morale (2026-10-26):** cut, superseding the item 2 call. The meter goes in v21 with burnout; mood comes from three temporary traits (Restless, Sore about pay, Settled) built with money pressure. See the `DESIGN.md` row.
- **Item 3, approaches and heat (2026-10-26):** approaches weight the crisis draw by situation (keeping the +1s) and cost time, heat or money (stealth +1 day; loud −1 day and +1 heat; social a bribe); heat becomes per district. See the `DESIGN.md` row.
- **Item 4, competing clients (2026-10-26):** parked for now; revisit after district heat and promotions.
- Other items: pending.
