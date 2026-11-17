# How battles work

Checked against the code on 2026-11-13 (`src/core/fight.js`, `runfight.js`, `battle.js`, `data/fights.js`, `data/dilemmas.js`, `data/battle.js`). The code and the data files win if this ever disagrees; fix this file when they change. Why each rule is what it is: `DESIGN.md` decision log (`docs/design/2026-11.md`, rows from 2026-11-10 on) and `drafts/SPEC-battle-orders.md` (section 30 is what was settled). Where things live: `CODEMAP.md`.

## Two engines

| | Engine 2 (the new fights) | Engine 1 (the old fights) |
| --- | --- | --- |
| Plays | The jobs in `FIGHT_JOBS` (26 by 2026-11-17; started as five: `data_pull`, `data_scrub`, `quiet_hours`, `warehouse`, `protection`), `data/fights.js`; and since 2026-11-17 every raid on a hall (type `holdHall`, built by `core/raids.js startRaidFight`). | Every other fight (and a raid saved mid-fight before that date). |
