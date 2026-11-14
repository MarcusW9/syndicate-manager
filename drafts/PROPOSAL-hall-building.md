# Proposal: building up a hall

Status: **plan, not built** (2026-11-06). Part of the tong's Phase 2, after a hall map per district
(#84) and the landmarks (#85). The owner's calls so far (2026-11-06):
- What you place both **defends in raids** and adds **rooms with effects**.
- You place it by **tapping a grid cell**.
- **Cash** pays for each piece, and the hall's **level sets the space**.
- You build on **a hall screen opened from Crew › Halls**.

The owner's answers on the plan (2026-11-06):
- Raiders don't damage what's built, not yet.
- Prices go up, in line with gear (a sidearm ¥600, a Pro implant about ¥8,750).
- Add turrets and defences, a cyber doc for augments, entertainment for loyalty, and a canteen.
- A mock-up of the build screen first.
- Rotation: a mix of options a and b. Most rooms are 2 × 2 and don't turn; the long ones are 2 × 3 and
  turn (section 4).

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
| Barricade | ¥2,000 | crates and a table, `sp-cover`, 14 × 10 | half cover |
| Steel plate | ¥4,000 | a plate on legs, `sp-cover`, 26 × 6, rotates 0/90 | full cover (24 or more long) |
| Inner wall | ¥3,000 | a wall section, `sp-block`, 30 × 4, rotates 0/90 | solid: nobody stands in it |
| Auto turret | ¥12,000, level 2 | a gun on a post, 1 cell, one per hall | slice 3 (built): fires on the nearest raider each round with nobody on it, aim 8, damage 5, 6 bursts; can't be knocked out (owner, 2026-11-06). |

They become ordinary shapes on the hall's site, so `core/fightspots.js` uses them as it does any
cover: spots behind them on the side away from the other lot, full cover for a piece 24 or more
long. Nothing in the fight rules changes.

**What this means for a raid:** more of our people start in cover, and fewer of the raiders do if
the pieces are on our side. The raiders' side is limited, because the cells round their way in
can't be built on. **To check by measuring:** the same 60 fights as the raids slice, with 0, 3 and
6 pieces, so that a built-up hall is clearly better but not unbeatable.

### Rooms (2 × 2, or 2 × 3 for the long ones; slice 2)

| Room | Cost | Needs | Effect (only for the people who live there) |
| --- | --- | --- | --- |
| Clinic | ¥18,000 | level 2 | injuries heal 2 days a day while at home (not out on a job) |
| Bunk room (2 × 3) | ¥15,000 | level 2 | +2 beds (the roster limit grows with it) |
| Canteen (2 × 3) | ¥10,000 | level 2 | residents shed fatigue faster at home (12 a day, not 8) |
| Stash | ¥10,000 | – | walking out of a raid loses half of what was kept there |
| Lookout | ¥12,000 | – | a raid on this hall is warned 4 days ahead, not 3 |
| Den (mahjong, karaoke; 2 × 3) | ¥14,000 | level 2 | loyalty: residents' renewals ask a little less (`core/loyalty.js`, counted as 10 more jobs together, still capped at the 25% discount; built with 10, not 5, see DESIGN.md) |
| Cyber doc | ¥25,000 | level 3, one in the whole tong | implants cost the tong a quarter less while it has one (`core/gear.js`; built tong-wide, since implants are bought for the stash, see DESIGN.md); the doc's chair as the room |

A room is drawn as a room (`sp-room`) with its own thing inside: cots and a cabinet, bunks, a safe,
a window with a stool. A room's walls aren't fight cover, so a fight is the same with or without
it. All of a room's cells must be buildable. The clinic, stash, lookout and cyber doc are 2 × 2; the bunk room, canteen and den are 2 × 3 and turn (3 wide or 3 tall). A 2 × 3 room needs level 2, because it would fill a level-1 hall's 6 cells.

**Left for later:** a workshop (gear repairs and mods); rooms that change the job, not the hall; a
reinforced door at the way in (it would need the fight to start with the raiders held back).

### Rotation (the options)

- **Chosen (owner, 2026-11-06): a mix of a and b.** The plate, the inner wall and the 2 × 3 rooms turn 0° or 90°; the 2 × 2 rooms don't.
- **a. Long pieces turn 0° or 90°; rooms don't turn.** The plate and the inner wall
  run across or along, rooms are square (2 × 2). It's simple, and works on a grid.
- **b. Rooms of 2 × 3 that turn too.** The clinic or den could be long and fit along a wall. It's more
  fitting to do, but a 2 × 3 room uses 6 of a level-1 hall's 6 cells.
- **c. Any angle.** It doesn't sit on a grid, so it's fiddly with a thumb and fight cover gets harder
  to read. Not recommended.

### What defences do (slice 1c, owner 2026-11-06)

Cover alone barely moved the odds (measured in DESIGN.md), so every 3 defence pieces also lower a
raid's threat by 1, never below 1. Measured: 6 pieces hold every raid up to heat 10. It's strong,
and flagged for the playtest.

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
| `src/ui/styles.css` | The grid, the selected cell, the palette (sharp panels, a cut corner, Rajdhani; `docs/UI-SKIN.md`). |

## 7. Slices (one PR each)

1. **The grid, the defence pieces (no turret) and the build screen** (save v42). It's split for
   session size: 1a the logic and save, 1b the screen, 1c measuring raid odds and tuning prices. Tests (`tests/hallbuild.test.js`):
   - buildable cells keep the ways in and out and both starts clear, in every hall;
   - the floor and cash limits work, and removing refunds half;
   - a placed piece shows up on the raid's site and in its fight spots (a plate by our start gives
     full cover);
   - a raid is still fightable with every cell built on;
   - old saves upgrade to `build: []`;
   - the measured raid odds with 0, 3 and 6 pieces.

   Screenshots: the build screen on a phone, a piece being placed, a raid in a built-up hall.
2. **The rooms and their effects** (split for session size: 2a the clinic, bunk room, canteen, stash
   and lookout; 2b the den and the cyber doc). Tests for each effect:
   - the clinic heals faster only at home;
   - the bunk room's beds count in the roster limit;
   - the stash halves the loss;
   - the lookout warns 4 days ahead;
   - one room of each kind per hall, and the clinic's level.

   Screenshots: each room on the plan; the hall card listing its rooms.
3. **The turret** (the fight engine gains a shooter that isn't one of ours).
4. (Later, if wanted) a workshop, and raids damaging what's built.

Each slice gets a DESIGN log row, a CHANGELOG entry, an ART.md line (how pieces and rooms are
drawn), the CODEMAP and ARCHITECTURE notes, and a HANDOFF update.

## 8. Open questions for the owner

1. The mock-up: `drafts/prototypes/hall-build.png` (section 1's screen, with the Night Market hall).
