# Brief: the four halls as compounds (for the owner to write the lore)

2026-11-07. The Night Market, Docks, Basin and Glass Heights halls are now compounds that grow with Expand, built the same way as Old Town. The game uses **placeholder names** for their parts (in `src/data/sites.js`, `HALLS`). Once the lore is written, the names, descriptions and raid lines get swapped in, and the new places go into `WORLD.md` through `add-lore`.

## What's fixed by the game (same for every hall)

Every hall has five parts and two outdoor strips:

| Part | Level | Size (squares) | Inside or outside | Beds | Expand cost |
| --- | --- | --- | --- | --- | --- |
| **The first building** (today's hall) | 1 | 4 × 4 | inside: rooms and beds | holds 2 (Old Town 8) | (opening deposit) |
| **The lane** beside it | 1 | 2 × 4 | outside: defences; raids from the front are fought here | none | |
| **The second building**, across the lane | 2 | 4 × 4 | inside | holds 4 (levels 2 and 3 each add 2) | ¥20,000 (Heights ¥25,000) |
| **The yard** behind, walled, with a **gate** | 3 | 7 × 2 | outside; the gate is a second way in for raids | none (its 2 go in the second building) | ¥30,000 (Heights ¥35,000) |
| **The small building** across a passage | 4 | 3 × 2 | inside | holds 2 (level 4's) | ¥40,000 (Heights ¥45,000) |

- **Front strip** (along the bottom): where a raid comes from at every level, up the lane.
- **Back strip** (along the top): where a raid can come from once the yard is held, through its gate.
- **Fights happen outside**, between the buildings, and the buildings are solid. So the lane, the yard and the two strips are where people take cover.
- **Outside things** (8 items): a few objects in the yard, the passage and the two strips, used as cover. Pallets, bins and crates for now; each hall's can be renamed and recoloured.

What the lore can change freely: every name, what each place was before, who owns it, why the tong can take it, what's lying about outside, and the line a raid opens with. What it can't change without a design change: the number of parts, their sizes and the order they're taken in.

---

## 1. The Night Market: above Madam Rao's sari shop

**Today's canon:** "two rooms above her sari shop" (`data/halls.js`), contact Madam Rao, opened with her favour *Back Rent*. Silver Fan turf. Up the shop's back stair; out through the roof hatch.

| Slot | Placeholder | What it needs |
| --- | --- | --- |
| First building | Our rooms (above the sari shop) | keep, or say more |
| Lane | The back stair | where the shop's back stair comes down between the buildings |
| Second building | The loft | what's across the stair: a tailor's loft? a dye room? whose? |
| Yard + gate | The cart court, gate onto the market lane | the court behind, where hawkers leave carts; who used it, why it's walled |
| Small building | The corner stall | a shuttered stall: whose was it? |
| Front strip | the street, sign "SILK & CREDIT" | |
| Back strip | THE MARKET LANE | the lane the gate opens onto |
| Raid lines | "come up the back stair from the street" / "come through the court gate from the market" | |
| Outside things | saris on a rack, crates, a water drum, stall awnings, a cart, bolts of silk, a hawker's cart, a scooter | |

**Questions:** does Madam Rao own the block or broker it? Does taking the court cost her something with Silver Fan? Is the corner stall someone's debt?

## 2. The Docks: the container office on the old pier

**Today's canon:** "a container office on the old pier, with a stove", contact the Ferryman, opened with *Quarter to Two*. Red Lantern turf. Along the pier from the yard; out down the ladder to a boat. Drawn mirrored (the office on the right).

| Slot | Placeholder | What it needs |
| --- | --- | --- |
| First building | The office | keep, or say more |
| Lane | The deck | the deck between the containers, up from the container yard |
| Second building | The bunk container | the container across the deck: what it held, who fitted it out |
| Yard + gate | The fenced pier, gate onto the walkway | the pier end behind, fenced; what the jetty gate is |
| Small building | The net loft | an old loft across the gap |
| Front strip | THE CONTAINER YARD | |
| Back strip | THE WALKWAY | the pier walkway the gate opens onto |
| Raid lines | "come along the deck from the container yard" / "come through the jetty gate" | |
| Outside things | pallets, a crate, a fuel drum, bollards, a crate, a container's end, a bollard, a forklift | |

**Questions:** whose pier is it on paper, and is it the Ferryman's in fact? Does the boat stay part of the way out? Does Red Lantern care that we fence a pier end?

## 3. The Basin: the flat over the tack workshop

**Today's canon:** "a flat over a tack workshop, with a view of the Old Stand", contact Ruth Okonkwo, opened with *The Flat Doesn't Exist*. Racing Association / Silver Fan. Up through the workshop's trapdoor; out by the stair to the stable yard. Drawn mirrored.

| Slot | Placeholder | What it needs |
| --- | --- | --- |
| First building | Our flat | keep, or say more ("the flat that doesn't exist") |
| Lane | The passage | the passage between the buildings, up from the street |
| Second building | The tack store | across the passage: whose store, what's still in it |
| Yard + gate | The stable yard, gate onto the course lane | the stable yard behind; which stables, whose horses |
| Small building | The hay loft | across the way |
| Front strip | THE WORKSHOP (street) | |
| Back strip | THE COURSE LANE | the lane to Lantern Course the gate opens onto |
| Raid lines | "come up the passage from the street" / "come through the stable-yard gate" | |
| Outside things | hay bales, a saddle rack, a water trough, hay, a tack trunk, crates, a tip-seller's cart, a horsebox | |

**Questions:** are there still horses in the yard, and does the Association know? Is the hay loft how the flat "doesn't exist" on paper?

## 4. Glass Heights: the service floor nobody upstairs remembers

**Today's canon:** "a service floor nobody upstairs remembers", contact Szeto, opened with *There Is No Forty-First Floor*. Veridian-Apex. Out of the service lift; away down the maintenance stair. Here "outside" means the open plant deck between rooms on the same floor.

| Slot | Placeholder | What it needs |
| --- | --- | --- |
| First building | The service room | keep, or say more |
| Lane | The plant deck | the open deck between the plant, up from the maintenance stair |
| Second building | The server hall | a dead server hall across the deck: whose, why it's dead |
| Yard + gate | The loading bay, with the freight lift | the bay behind; the freight lift is the second way in |
| Small building | The control room | across the gap: what it once controlled |
| Front strip | MAINTENANCE STAIR | |
| Back strip | SERVICE CORRIDOR | |
| Raid lines | "come up the maintenance stair" / "come out of the freight lift" | |
| Outside things | server racks and air handlers | |

**Questions:** is the forty-first floor on the building's plans at all? Who still has a key card for the freight lift? Does Veridian-Apex security ever walk the corridor?

---

**When it's written:** paste the lore back. I'll put the names, descriptions and raid lines into `src/data/sites.js`, add the places to `WORLD.md` through `add-lore`, and update the hall descriptions in `data/halls.js` if they change.
