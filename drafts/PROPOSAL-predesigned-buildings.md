# Proposal (not built): predesigned, upgradeable buildings

Status: open questions only, written 2026-11-09 after the hall page's compound view (UI only; DESIGN.md row of the same date). Nothing here is decided.

## What is being asked

Today a hall is a compound of parts (`data/sites.js` `parts`). The compound view shows each held inside part as a building; tapping one opens its inside, where rooms are placed freely on the grid (`core/hallbuild.js`) and beds are laid out by `bedsOnFloor`. Defences go outside on the compound. The owner's longer idea: the buildings are **predesigned**, and you upgrade the "barracks", the medic and so on after placing them, instead of placing rooms on a grid inside.

## Open questions

1. **Does a predesigned building replace free placement inside?** Or are they both kept (a building has fixed slots, free squares stay for the rest)? If rooms stop being placed, `canPlace`, `ghost`, the Turn control and the building view's grid go for rooms (defences keep the grid).
2. **How do existing `hall.build` saves migrate?** A placed room (`{ piece, x, y, rot }`) would become a building's upgrade or a slot. Needs a `SAVE_VERSION` bump and a `migrate` step in `save/save.js`; decide what happens to a save with a room in a spot no slot covers, and to `floorOf`/`floorUsed` (rooms are counted in cells now).
3. **How do buildings change the raid map (`floorPieces`) and fights?** Rooms are not cover today (`sp-fit`), only defences and cots are. If a building has its own solid footprint, the fight spots (`core/fightspots.js`), the way in (`raids.js startRaidFight`) and the turret's post need rechecking; and is a raid ever fought inside a building (it is outside today, by design)?
4. **How do building upgrades relate to the hall's level and Expand?** Today the hall's level unlocks parts (`p.lvl`) and rooms have `needs`. Options: a building's tier is separate from the hall's level and capped by it; or Expand (`halls.js nextHallExpansion`) becomes the only way up; or each upgrade has its own price and the level is derived. Rent, beds (`syncHalls`, `bedsOf`) and `BROKER` jobs-per-week all read the level.
5. **What is a building called and what does it do?** Names come from the compound's parts today (the room, the flat, the back kitchen); a "Medic" or "Barracks" would be a new canon name and goes through `add-lore`. Which existing room effects (`ROOM_EFFECT`) belong to which building, and can a building hold more than one?
6. **One of each?** Rooms are `one: true` per hall and the cyber doc is one per tong (`tongOne`). Does a building's upgrade keep those limits?
7. **Beds.** Beds are blocks laid by `bedsOnFloor` from `bedCorner`/`beds` per part. If buildings own their beds, does the bunk room's `+2` move into the building's upgrade?
8. **The other halls.** All five halls share the same layout (mirrored for some). Do all get the same buildings, and when does the art layer roll out to them?
