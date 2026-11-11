# Battle rework: items waiting on the owner (2026-11-11)

Kept up to date by whoever works on the rework. Tick or strike an item when decided, and log the decision in `docs/design/2026-11.md`.
Where each came from: slice 2 ([PR #132](https://github.com/MarcusW9/syndicate-manager/pull/132)), `drafts/writing-tasks.md` (Task 13 status), `drafts/SPEC-battle-orders.md` section 30.

## Decisions

- [ ] **"Chance of losing someone"** counts someone killed *or left behind* (missing for 7 days). On cautious and steady the risk line says a death only follows a call you make, yet the chance can be above zero there (left behind). Keep "losing someone", or say "killed or left behind"?
- [ ] **"Hit the caller"** (techUnderFire) is still offered when no radio call is shown (the dilemma also fires on two shots at the tech). Offer it only with a call, as the jam now is?
- [ ] **Special actions button:** in the approved list, not built, because the engine has no specials. What should a special be (spec 12 mentions `order.special`), or drop the button?
- [ ] **Four lines Claude wrote** because the screens needed them: "Likely enemies: {kinds}.", "{who} can jam radio calls.", "If the tech jams, they stop working the hack that round.", and the van call's "Outside: …" and "Chance anyone outside is left behind: …". Skim and replace.
- [ ] **One test changed** (`tests/renewals.test.js`, "no death without push on"): its random policy now never answers "fight" at death's door. Skim it.
- [ ] **The holdHack deadline call-in:** spec 11 says push past or pull back; spec 30's built rule is that the deadline fails the objective. The unused call-in text is gone; say if you want the call-in back.
- [ ] **Save-size test** (`tests/inbox.test.js`): the seed moved from 7 to 1 in #129 with the 250,000 budget unchanged; seeds 3, 7 and 9 sit near the budget. Engine-2 fights add round lines to saved reports. Seed and budget are worth a look as their own change.

## Not built, and why

- **Map overlay** for engine-2 fights: engine 2 has no site spots, so the map shows no positions.
- **Standby and ambush** in the planning read for the five jobs: not modelled.
- **Items:** no jammer item (a cyberdeck or any tech can jam), no smoke or stims.
- **Battle growth** (endurance growth points from fights): a later session, as asked.
- **Rescue job, ransom and the 7-day wait for someone left behind:** slice 4. Until then a runner left behind is missing for 7 days and comes back with a serious injury.

## Still to check by eye

- The 360px captures in `docs/screenshots/2026-11-11-battle-orders/` were measured (no overflow, no tap under 44px) but not played through on a phone. A short playthrough on the real device of: a round, Change orders, the van call, death's door.
