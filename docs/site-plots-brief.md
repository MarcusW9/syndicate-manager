# Brief: site maps as plots and parts

A context pack for thinking about the job maps outside a Claude Code session. Paste everything below the line into a fresh chat (with WORLD.md's context block from `docs/new-job-prompt.md` too, if you want the world's details), think it through, then bring the result back in the format at the end.

Written 2026-11-03 from `src/data/sites.js`, `src/core/fightspots.js`, `tests/sites.test.js` and ART.md. The picture of the Docks' twelve combinations is `docs/screenshots/2026-10-29-design-session-site-variants/02-docks-parts-twelve-combinations.png`.

---

## What the map is for

Syndicate Manager is a text-first crew management game set in Lantern Bay (fictional, Hong Kong-inspired, 2057, no magic). When the crew runs a job, the watch screen shows a **site map** from above at night: the crew's tokens walk the route while a play-by-play feed tells the story. The run has four zones in order: **the way in** (van to the gate), **inside** (the open ground), **the target** (the building the job is about, the only closed zone), **the way out** (back to the van). Each zone has its own zoomed camera view.

The map isn't only decoration. It carries game rules:
- **Overwatch:** a crew member on a perch with a rifle sees a wedge of the open ground, never inside the target. A drone sees everything.
- **Guards** wait on posts in each zone until the crew reaches them.
- **Fights** happen where the crew is when a guard turns hostile. Everyone stands behind the cover drawn on the map: a container-sized block (24+ units long) is full cover, a smaller crate or desk is half cover, otherwise they're in the open. The same map always gives the same fight positions.

## Plots and parts (after XCOM 2's plots and parcels)

A district is a **plot**: a fixed base plus three slots, each with a few hand-drawn options.

- **Base** (always there): the street or road, the landmark, the **overwatch perch**, what the drone sees, and the **hub**, a point in the middle where every way in ends and every target's route starts. The hub is what lets any option in one slot work with any option in the others.
- **Approach** (slot 1): where the van stops, the gate or entrance, the route to the hub, the camera views for the way in and inside, the guard posts there, a little cover by the gate.
- **Cover** (slot 2): what fills the open ground between. It shapes fights; no route may cross it.
- **Target** (slot 3): the building the job is about, with its route from the hub, its camera view, its guard post, and the rifle's sight past it. A target can belong to one job ("Container 409" for the Container 409 job); the others are the district's usual targets for every other job there.

The game picks one option per slot from the job's id: the same job always looks the same, different jobs differ, nothing random is stored. Options multiply: 2 approaches × 2 covers × 3 targets = 12 maps. One new target in that district adds 4 more maps.

## Rules every map must meet (checked by tests)

- The map is **360 × 240** units, landscape. Everything sits on it; anyone can stand within 6 units of the edge (the road too).
- Routes join: the way in starts at the van; inside starts where the way in ends; the target route starts where inside ends and ends at the target; the way out runs from the target back to the van.
- Camera views are **3:2 boxes** on the map, and each shows its whole route. (On wide screens the game stretches them taller within the map.)
- Each zone's guard post is inside that zone's view.
- **The rifle can't see the target**, but it sees the end of the inside route. **The drone sees** the end of the way in, all of inside, and the target.
- Labels are short caps (about 5 units a letter) and fit on the map; exactly one label (the target's) is highlighted.

## How it's drawn (ART.md)

From above, at night, on dark ground. Flat shapes with no outlines on cover; buildings dark slate `#171b24` with a grey edge; the target room a dashed signal-red outline; the crew's route a cyan line with ring nodes; the perch sodium yellow; the rifle's sight a faint sodium wedge, the drone's cyan. Cover is flat blocks in the district's muted tones (containers, crates, desks, stalls, planters, cots, stable blocks). Labels are small grey caps; the target's is white. Each district should read at a glance:
- **The Docks:** rust and teal containers, the harbour.
- **Old Town:** lit windows, laundry lines, an alley of steps.
- **The Night Market:** neon stalls, a grey crowd.
- **Glass Heights:** a cyan-edged glass tower over a planted plaza.
- **The Basin:** the cream racecourse oval, timber stables.

## Where each district is now

| District | Now | Its single map / parts |
| --- | --- | --- |
| **The Docks** (a container yard) | Plot | Base: road, crane perch, harbour. Approaches: *gate* (van left), *quay* (van right). Covers: *stacks* (rows of containers), *open* (a few crates). Targets: *yard office* (usual), *Pier 12 hut* (Submerged Cable), *Container 409* (Container 409). 12 maps. |
| **Old Town** (a tenement) | Plot, one option in most slots | Approach: *alley* (the lane, the van and an alley of steps). Cover: *laundry*. Targets: *flat* (usual), *clinic* (Block 9, Doc Siu's clinic, for Clinic Night). 2 maps; room for a second approach and cover. |
| **The Night Market** | One fixed map | The gate and the van, lanes of stalls with crowds, a mahjong parlour with a back room (the target), a footbridge for overwatch. |
| **Glass Heights** (a corporate tower) | One fixed map | The service road and the van, the loading bay, a plaza with planters, the tower with a server room (the target), the next tower over for overwatch. |
| **The Basin** (the racecourse stables) | One fixed map | The service gate and the van, the edge of the track, rows of stables, the vet block (the target), a floodlight tower for overwatch. |

Jobs per district today (any of them could get its own target): Old Town: Data Courier Run, Kidnap Rescue, Clinic Night, Herbal Run, Eviction Notice. The Docks: Warehouse Lift, Protection Run, Container 409, Submerged Cable. The Night Market: Casino Con, Mahjong Ledger, Market Delivery, Counterfeit Chrome. Glass Heights: Office Data Pull, Penthouse Heist, Data Scrub. The Basin: The Favourite, Last Ticket, Wrong Horse.

## Questions worth thinking about

1. For the Night Market, Glass Heights and the Basin: what's the fixed base (landmark, perch, hub), and what are two ways in, two kinds of open ground and two or three targets?
2. Which jobs deserve their own target (the place the story is about)? For example, the Mahjong Ledger's back room, Wrong Horse's stall nine, the Penthouse.
3. Does every district want the same three slots, or does one want something different (the Basin's track as a slot; Glass Heights going up floors instead of across)?
4. How different should two options in one slot feel in play? More or less cover, a longer or shorter walk, the rifle seeing more or less.
5. What makes each district unmistakable at a glance, beyond what's listed above?
6. Later districts (the Silt, the Amber Reach, Iron Peak): what would their plots be?

## Bring it back like this

Plain words are fine; Claude turns them into coordinates, runs the checks and shows you a preview sheet of every combination before anything ships. For each district or part:

```
DISTRICT: (name)
BASE: landmark, where the overwatch perch is, where the hub is (roughly: "centre", "left third"), what's always there
APPROACH <name>: where the van stops (edge of the map), the entrance, the route to the hub, what's by the gate
COVER <name>: what fills the open ground, roughly how much (lots / some / little), where
TARGET <name> (usual / for <job>): what the building is, where (top-left, right edge...), the route from the hub, what overwatch can see near it
NOTES: anything about feel, play or art
```
