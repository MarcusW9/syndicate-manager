# Proposal: building up a hall

Status: **plan, not built** (2026-11-06). Part of the tong's Phase 2, after a hall map per district
(#84) and the landmarks (#85). The owner's calls so far (2026-11-06):
- What you place both **defends in raids** and adds **rooms with effects**.
- You place it by **tapping a grid cell**.
- **Cash** pays for each piece, and the hall's **level sets the space**.
- You build on **a hall screen opened from Crew › Halls**.

The open questions are in section 8. Read them first.

## 1. What the player does

Each hall on Crew › Halls gets a **Build** button. It opens the hall's plan full-screen: the same
map its raids are fought on (`data/sites.js` HALLS), with a grid over the floor and a palette of
pieces underneath.

- To place a piece, tap a free cell, then a piece in the palette. The piece shows where it would
  go, with its cost, and **Place** confirms it.
- Tap a placed piece to **Rotate** it (2×2 rooms don't rotate) or **Remove** it. Removing refunds
  half its cost.
- A bar on the screen shows the space and the cash: "Floor 7/10 · ¥14,000".
- Nothing takes a day. Building happens between days, like moving the roster about.
- On a raid's fight map, the pieces are there: cover where you put it.

At phone width the plan fills the width (390px is 1.08px a unit), so a 30-unit cell is about 32px.
That's under the 44px tap rule, so a tap selects the cell nearest the touch and the selected cell
gets a thick outline. On wider screens the plan scales up.

## 2. The grid

- 12 × 8 cells of 30 units over the 360 × 240 plan.
- **A cell can be built on** when it's inside the hall's building (`sp-building`). It can't be:
  - on the hall's own furniture or anything solid;
  - within 30 units of the way in (`posts.inside`), the way out (`paths.out` end), or either
    side's start (`paths.inside` end, the post);
  - on the path between those points.

  This keeps a raid always fightable: both sides have somewhere to stand and a clear line to each
  other.
- The buildable cells are worked out from the site (`core/hallbuild.js buildableCells(site)`),
  never stored. Changing a hall's map can't strand a saved piece: any that end up off the grid are
  refunded in full, with a message.
- The fallback HALL map (a district without its own) is buildable the same way.

## 3. Limits

- **Floor:** 6 cells at level 1, plus 4 for each Expand (`HALL_BUILD.floorBase`,
  `floorPerLevel`). A 1-cell piece uses 1 cell and a room uses 4.
- **Cash:** each piece has a price. You can't place a piece you can't afford.
- **Rooms:** one of each kind per hall. Some need a level (below).
- A hall shut after a raid can't be built in until it opens again.

## 4. Pieces

### Defence (1 cell; slice 1)

| Piece | Cost | Drawn as | In a raid |
| --- | --- | --- | --- |
| Barricade | ¥800 | crates and a table, `sp-cover`, 14 × 10 | half cover |
| Steel plate | ¥1,500 | a plate on legs, `sp-cover`, 26 × 6, rotates 0/90 | full cover (24 or more long) |
| Inner wall | ¥1,000 | a wall section, `sp-block`, 30 × 4, rotates 0/90 | solid: nobody stands in it |

They become ordinary shapes on the hall's site, so `core/fightspots.js` uses them as it does any
cover: spots behind them on the side away from the other lot, full cover for a piece 24 or more
long. Nothing in the fight rules changes.

**What this means for a raid:** more of our people start in cover, and fewer of the raiders do if
the pieces are on our side. The raiders' side is limited, because the cells round their way in
can't be built on. **To check by measuring:** the same 60 fights as the raids slice, with 0, 3 and
6 pieces, so that a built-up hall is clearly better but not unbeatable.

### Rooms (2 × 2 cells; slice 2)

| Room | Cost | Needs | Effect (only for the people who live there) |
| --- | --- | --- | --- |
| Clinic | ¥6,000 | level 2 | injuries heal 2 days a day while at home (not out on a job) |
| Bunk room | ¥5,000 | – | +2 beds (the roster limit grows with it) |
| Stash | ¥4,000 | – | walking out of a raid loses half of what was kept there |
| Lookout | ¥4,000 | – | a raid on this hall is warned 4 days ahead, not 3 |

A room is drawn as a room (`sp-room`) with its own thing inside: cots and a cabinet, bunks, a safe,
a window with a stool. A room's walls aren't fight cover, so a fight is the same with or without
it. A room's 2 × 2 must all be buildable cells.

**Left for later:** a workshop (gear: it touches the gear system); rooms that change the job, not the
hall.

## 5. State and save

- `hall.build: [{ piece, x, y, rot }]`, with x and y as grid cells. It's empty for every hall when
  an old save upgrades.
- **Save v42** (`SAVE_VERSION` in `core/state.js`; `save.js migrate`: `hall.build ??= []`).
- What's derived, never stored: the buildable cells, the floor used, the site with the pieces added
  (`siteWithBuild(site, hall)`), the beds with a bunk room (`hallBeds(hall)`, used by `syncHalls`
  and `freeBeds`).

## 6. Code

| Where | What |
| --- | --- |
| `src/data/hallBuild.js` (new) | `HALL_BUILD` (grid, floor numbers, refund share) and `PIECES` (cost, cells, shape(s) per rotation, `needs`, effect tag). Content only. |
| `src/core/hallbuild.js` (new) | `buildableCells(site)`, `floorUsed(hall)`, `floorOf(hall)`, `canPlace(state, district, piece, x, y, rot)` (with a reason), `placePiece`, `removePiece`, `siteWithBuild(site, hall)`, `hasRoom(hall, kind)`. Pure; takes state and returns new state. |
| `src/data/sites.js` | `pickSite` for `raid:<district>` takes the hall and returns `siteWithBuild(HALLS[d] ?? HALL, hall)`. `spotsForJob` needs the state, or the raid passes the built site in: `core/raids.js startRaidFight` already builds the spots, so it passes the site. |
| `src/core/halls.js` | `syncHalls` and `freeBeds` count `hallBeds(hall)` (bunk room). |
| `src/core/time.js` | The day's healing: a resident at home in a hall with a clinic heals 2 days a day. |
| `src/core/raids.js` | `withdrawCost` halves `kept` with a stash; `checkRaids` uses 4 warning days with a lookout. |
| `src/ui/hallbuild.js` (new) | The build screen: the plan (`siteplan.js sitePlanSvg` with the pieces drawn), the grid overlay, the selected cell, the palette, Place / Rotate / Remove, the floor and cash bar. |
| `src/ui/app.js` | The Build button on each hall; the screen's route and actions (`build-cell`, `build-piece`, `build-place`, `build-rotate`, `build-remove`, `build-close`). |
| `src/ui/styles.css` | The grid, the selected cell, the palette (sharp panels, a cut corner, Rajdhani; ART.md "UI skin"). |

## 7. Slices (one PR each)

1. **The grid, the defence pieces and the build screen** (save v42). Tests (`tests/hallbuild.test.js`):
   - buildable cells keep the ways in and out and both starts clear, in every hall;
   - the floor and cash limits work, and removing refunds half;
   - a placed piece shows up on the raid's site and in its fight spots (a plate by our start gives
     full cover);
   - a raid is still fightable with every cell built on;
   - old saves upgrade to `build: []`;
   - the measured raid odds with 0, 3 and 6 pieces.

   Screenshots: the build screen on a phone, a piece being placed, a raid in a built-up hall.
2. **The rooms and their effects.** Tests for each effect:
   - the clinic heals faster only at home;
   - the bunk room's beds count in the roster limit;
   - the stash halves the loss;
   - the lookout warns 4 days ahead;
   - one room of each kind per hall, and the clinic's level.

   Screenshots: each room on the plan; the hall card listing its rooms.
3. (Later, if wanted) a workshop, and raids damaging what's built (section 8).

Each slice gets a DESIGN log row, a CHANGELOG entry, an ART.md line (how pieces and rooms are
drawn), the CODEMAP and ARCHITECTURE notes, and a HANDOFF update.

## 8. Open questions for the owner

1. **Do raiders damage what's built?** Recommendation: **not in slice 1**. Later, maybe a held raid
   knocks out one defence piece, rebuilt at its full price. It gives building a running cost, but
   adds a chore.
2. **The numbers** (prices, floor 6 + 4 a level, the clinic at level 2): first guesses for the
   playtest. Change any now?
3. **The room list:** clinic, bunk room, stash and lookout. Anything to add or drop? The workshop
   is left out (it touches gear).
4. **A mock-up of the build screen before slice 1?** (As with the neon map.)
5. **Rotating:** only the plate and the inner wall rotate (0° or 90°). Is that enough, or should
   rooms be 2 × 3 and rotate too?
