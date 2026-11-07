# Proposal: piloting, where driving becomes time

Status: proposal, nothing built. Follows the stat-usage sim (2026-11-07): driving was rolled on 7.9% of careful jobs and 2.1% of close-call rolls, and +3 changed week-52 cash by +2.4% ±2.7, right on the line. A Wheels on every job only lifted it from 8.2% to 10.2% of jobs, so the problem is that few jobs ask for it. Add a row to the decision log in `DESIGN.md` when agreed.

## The idea in one paragraph

Driving is renamed **piloting** and covers vans, boats and drones. Its value becomes **speed**: how quickly runners are free again, how fast a pinned crew is pulled out, and how soon help reaches a raided hall or a crew in trouble. A runner tied up is the real cost in a tong game, so time is worth more than another roll.

## Owner's calls first

1. **The name.** Proposed: piloting. Drivers, pilots and drone jockeys all sit under it.
2. **Drones move from tech.** Proposed: drone overwatch rolls piloting; Drone Jockey needs piloting 10. Implant neural load stays.
3. **Getaway step.** Proposed: on every job's way out, rolled by the Wheels, else the team's best pilot.
4. **Faster jobs.** Proposed: a Wheels at 14+ cuts a day off any job of 2+ days; same pay.
5. **Moving between halls.** Proposed: with a pilot (10+) driving, same day, no settling-in day.
6. **Arrival times.** Proposed: the table below, in fight rounds.
7. **Raid support.** Proposed: when a raid comes, you can send runners from another hall; they arrive by the table and join mid-fight.
8. **Backup for a crew out.** Proposed: a crew that calls in can ask for backup from the nearest hall; arrival by the table.
9. **Pinned extraction.** Proposed: a crew that pulls back waits for the van by the table, taking fire each round, instead of today's single van roll.
10. **Boats.** Proposed: harbour crossings two rounds faster with a boat-qualified pilot; later the Ferryman's boats and the Silt.

## On the job

**Getaway step**

| Result | Effect |
| --- | --- |
| Clean (success by 5+) | −1 heat in the district |
| Success | nothing |
| Failure | +1 heat in the district |
| Bad failure (by 5+), or the alert maxed | +1 heat and a tail: the next job there is watched |

- Need: 10 + the job's difficulty + 1 per alert point.
- Ghost Driver's clean-getaway heat bonus now runs through this step.

**Extraction and standby**
- A crew pulling back waits for the van for the rounds in the table (same district row). Each round, the guards still up get shots, as parting shots do today.
- Standby arrives in that many rounds, not at once.
- Wheels bringing the van round becomes this arrival, not a single roll.

## Across the city

**Arrival time (rounds)**

| Distance | No pilot | Piloting 10 | 14 | 18 |
| --- | --- | --- | --- | --- |
| Same district | 3 | 2 | 1 | 1 |
| Next district | 5 | 4 | 3 | 2 |
| Across the island | 6 | 5 | 4 | 3 |
| Across the harbour | 8 | 6 | 5 | 4 |

- Next district: Old Town ↔ Night Market, Old Town ↔ the Basin, the Basin ↔ Glass Heights.
- Across the harbour: anything to or from the Docks (later the Silt and the Amber Reach).
- A boat-qualified pilot takes 2 off the harbour row (call 10).
- Late runners join the fight on the round they arrive, at a free spot by the way in.

**Moving people**
- With a pilot: same day, free for work tomorrow.
- Without: as today (a day settling in).

**Raids and backup**
- The raid warning screen shows who could come and when: "Rook from Old Town, round 3".
- A backup call shows the same before you send anyone.

## Balance: proposed defaults

| Setting | Default |
| --- | --- |
| Getaway difficulty | 10 + job difficulty + alert |
| Clean getaway | −1 heat in the district |
| Failed getaway | +1 heat; tail on a bad failure |
| Faster jobs | −1 day at Wheels 14+, jobs of 2+ days, never under 1 |
| Arrival | table above |
| Boat | −2 on the harbour row |

## Rules we keep

- **Shown risk equals used risk.** The getaway odds, arrival rounds and day saved all show in the planning read and the raid screen.
- **Nobody dies unless you choose "push on".** Waiting for the van can drop someone to down, never past it.
- **Joss's picks** add a Wheels when it lowers the risk or saves a day.

## Measuring it

A roll count misses speed, so `sim-stats.mjs` gets new figures:

| Check | Target |
| --- | --- |
| Jobs where piloting is rolled | 40%+ (the getaway step alone should do this) |
| Share of close-call rolls | over 5% |
| Runner-days saved, tong policy | 5%+ |
| Rounds before backup arrives, median | shown, no target |
| Raids where reinforcements arrive before the fight ends | 30% to 60% |
| Combat's share of close-call rolls on loud runs | back under 35% |
| +3 piloting, week-52 cash (300 seeds) | +2% or better, outside the noise |

Keep piloting if it meets the roll targets and saves 5%+ of runner-days, or clearly changes how raids end. Otherwise cut it then.

**Before building:** find out why +3 driving raised injuries (+1.1) and heat (+1.9) in the 300-seed rerun. A better stat shouldn't make things worse. The likely cause is that Joss staffs Wheels differently, changing who goes inside. The getaway step leans on the same staffing, so fix that first.

## Saves

- Next save version: `driving` renamed `piloting` on every runner, recruit and freelancer; Drone Jockey kept; `boat` flag false for everyone.
- Halls get a `distance` map in `data/halls.js` (no save change).

## Where it would live

- `data/halls.js` or `data/districts.js`: distances.
- `core/piloting.js`: `arrival(pilot, from, to)`, `getaway`, `daysSaved`.
- `core/mission.js`: the getaway step in the way out; `finish` applies heat and tails.
- `core/runbattle.js`, `core/battle.js`: van and standby arrive by rounds; reinforcements join mid-fight.
- `core/raids.js`: sending runners to a raid.
- `core/away.js`: backup calls.
- `core/halls.js moveToHall`: same-day moves.
- `core/jobs.js`: days saved.
- `core/gear.js`, `core/specialisations.js`: drones on piloting.
- `core/squad.js coverage`: getaway odds, days saved.
- `ui`: arrival lines on raid and call-in screens.

## Build order

1. Investigate the +3 driving result.
2. Rename, drones to piloting, save migration.
3. Getaway step; rerun the sim.
4. Faster jobs and same-day moves; add runner-days to the sim.
5. Extraction and standby by rounds.
6. Raid support and backup calls with the arrival table.
7. Boats, with the Silt.

## Open questions

- Should vehicles be gear (a van, a bike, a boat) with their own tiers?
- Can a pilot be ambushed on the way to a raid?
- Should a tail be visible on the Ops map?
