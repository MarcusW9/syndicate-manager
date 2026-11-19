# Locked-district jobs (drafts, 2026-11-19)

Six full job files from the owner's outlines (`drafts/writing/supplied-2026-11-19-revised.md`, section 7), each in the game's
job format with six crises, an exit on every crisis and a report line on every choice. **Not registered in `src/data/missions.js`
and not offered to any client**: the three districts are locked and the game has no way to unlock them or deal their jobs yet
(`WORLD.md`: "Unlocking: planned, not built"). Registering them now would put them on the board before their districts open.

| File | Job | District | Client | Threat / pay |
| --- | --- | --- | --- | --- |
| `abovethewaterline.js` | Above the Waterline | the Silt | the Ferryman | 3 / ¥4,600 |
| `beforethesurvey.js` | Before the Survey | the Silt | Ruth Okonkwo | 3 / ¥4,400 |
| `readitback.js` | Read It Back | the Amber Reach | Madam Rao | 4 / ¥6,200 |
| `thelastconnection.js` | The Last Connection | the Amber Reach | Ruth Okonkwo | 4 / ¥6,500 |
| `beforethelastcar.js` | Before the Last Car | Iron Peak | Mr. Szeto | 4 / ¥6,800 |
| `thegardeninventory.js` | The Garden Inventory | Iron Peak | Ruth Okonkwo | 4 / ¥6,500 |

## Checked

`node scripts/check-job.mjs <file>` rejects the district (it only knows the five open ones), so each file was checked with its
district swapped for `docks`: 0 errors on all six. Every exit is an `abort` (the job ends; nobody is left behind), every sure choice
costs something, and no child, secret or new named canon appears (names used: the Ferryman, Uncle Po, Ruth Okonkwo, Madam Rao, Uncle
Tariq, Tita Mila, Mr. Szeto, the pump people, and places from `WORLD.md`).

Pay is aimed at the district's tier: the Silt is poor (¥4,400-4,600, threat 3); the Amber Reach and Iron Peak are threat 4.

## To ship one, the game needs (not done)

1. The district in `NAMES.districts` (`config/names.js`) and in the job checker, with its `locked` state wired to the promotion that opens it
   (Street to District: the Silt; District to City: the Amber Reach; City to Regional: Iron Peak).
2. A site plan for each (`data/sites.js` `SITES`) and a shared crisis pool (`DISTRICT_CRISES`) so fights and the shared draw have somewhere to happen.
3. The client's job list (`data/clients.js`) and a rule that keeps these jobs off the board while their district is locked (today `dealJobs`
   offers any job whose reputation gate is met).
4. A `heistOnly`-style or `lockedDistrict` flag on the templates until then.

Then `/add-job` steps 4-9 apply as normal, plus a `DESIGN.md` row and a changelog line.

## Reconciled with `drafts/district-hooks.md`

The hooks there (funicular cut for a "VIP movement", a housekeeper leaving, a generator blowing at Uncle Po's yard, a revoked pass in the Amber
Reach...) are not used by these six; they remain open for later jobs. None of these six contradicts a hook.
