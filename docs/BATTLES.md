# How battles work

Checked against the code on 2026-11-13 (the way-out section: 2026-11-17) (`src/core/fight.js`, `runfight.js`, `battle.js`, `data/fights.js`, `data/dilemmas.js`, `data/battle.js`). The code and the data files win if this ever disagrees; fix this file when they change. Why each rule is what it is: `DESIGN.md` decision log (`docs/design/2026-11.md`, rows from 2026-11-10 on) and `drafts/SPEC-battle-orders.md` (section 30 is what was settled). Where things live: `CODEMAP.md`.

## The way out of a hack (2026-11-17)

A hack fight (type `holdHack`) has two stages. Stage 0 is the hack: the technician works `FIGHT.workNeeded` (4) rounds, with the deadline of 7 rounds, and everyone else covers them. When the work is done the alarm brings in half the opening force's count again (`b.wayOut`, read when the fight is built, `FIGHT.wayOutShare` 0.5 rounded up; they arrive together next round as one group) and the fight goes to stage 1, the way out. In stage 1 everyone attacks (the work is finished, so the technician is one of the crew), there is no deadline, and the fight is won only when every enemy is down or fled and none is on the way (`end.wayOutWon`), as the yard is. The alarm clock can still bring a few reinforcements (`maxExtraEnemies`). Losing the technician or the technician pulling out ends the fight only in stage 0. Breaking off in stage 1 (someone down on cautious or steady, or "pull back" at death's door) keeps the objective and the pay (`objectiveDone`, `end.wayOutPulled`) at the cost of whoever is down; the planning odds count it as a win. The medic's hands (`treatWayOut` in `checkEnd`): before a way-out ends, the best healer still standing rolls to stabilise each downed runner (`FIGHT.wayOutTreatStep`) and gives each hurt runner who is up `wayOutTreatHeal` pips; a runner so steadied skips the serious injury and the death's-door prompt. A fight saved before this has no `wayOut` and still ends with the hack.

## Two engines

| | Engine 2 (the new fights) | Engine 1 (the old fights) |
| --- | --- | --- |
| Plays | The jobs in `FIGHT_JOBS` (26 by 2026-11-17; started as five: `data_pull`, `data_scrub`, `quiet_hours`, `warehouse`, `protection`), `data/fights.js`; and since 2026-11-17 every raid on a hall (type `holdHall`, built by `core/raids.js startRaidFight`). | Every other fight (and a raid saved mid-fight before that date). |
