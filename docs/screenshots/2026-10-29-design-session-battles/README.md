# Design session: a fight on the watch screen (2026-10-29)

Slice 6a, the battle engine (`PLAN-CORE-LOOP.md`). Taken with `node scripts/capture-battles.mjs`:
a loud Warehouse Lift run with two rookies, played by the game's own core until someone hits
death's door, then loaded into the page. Shipped in the commit that adds this folder.

1. `01-fight-and-call-in-phone.png`: the watch feed at phone width. The guard-up-close incident
   fails and its save misses; "It's a fight" note; one card per round with each moment ("Scalpel
   hits the guard for 1 (armour 1)"); the death's-door call-in: pull back (safe, listed first) or
   keep fighting (extreme risk).
2. `02-pulled-back-phone.png`: after pulling back: the guard's parting shot, the exit card and
   the aborted job (paid ¥0, heat +1).
3. `03-fight-and-call-in-desktop.png`: the same call-in at desktop width.

The fight's own look on the site plan (HP on tokens, guard tokens) comes in slice 6b.
