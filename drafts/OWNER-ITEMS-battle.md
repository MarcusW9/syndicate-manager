# Battle rework: items waiting on the owner (2026-11-11)

Kept up to date by whoever works on the rework. Tick or strike an item when decided, and log the decision in `docs/design/2026-11.md`.
Where each came from: slice 2 ([PR #132](https://github.com/MarcusW9/syndicate-manager/pull/132)), `drafts/writing-tasks.md` (Task 13 status), `drafts/SPEC-battle-orders.md` section 30.

## Decisions

- [x] **The gate says rework after the steady pull-out change:** accepted (owner, 2026-11-12). The orders stay as they are and battles are mostly sim-driven for now; see the decision row. Not changing the defaults, the difficulty or the orders.
- [x] **Steady's pull-out point** built (owner, 2026-11-12): a third of max pips, rounded up, at least 1, and a watched crew is asked (Pull out / Keep in). Still yours: the call-in's lines and the risk picker's two new sentences are Claude's wording, please rewrite; and whether the log should say why someone pulled out. The gate (`scripts/sim-orders.mjs`) was run on the old flat 2 and not re-run.
- [ ] **If engine 1 is not replaced: fix the repeated "tries to talk the guard down" (and lights).** Seen in play on an away job, Count Against Paper: a runner who leans social talks at a guard every round and fails every round, for the whole fight. Always possible, but it shows much more now that skirmishes play out (the three-round cap used to cut it short). Left alone for now (owner, 2026-11-12) because engine 1 is meant to be replaced. The fix that was built and tested, then backed out: in `core/battle.js`, `actionFor` skips the talk lean once `r.talkFailed` (and the lights lean once `r.lightsFailed`), set in `playRound` when the attempt fails, so the runner shoots afterwards; a player's own orders are unaffected. It costs the careful-player economy about 2 points of "broke after 4 weeks" (37.5% against 35.3%) and about ¥600 of median cash, so `tests/rules.test.js` "a careful player survives the first month but is not rich" needs its 35% limit raised (to about 40%) with a decision row. Lighter alternatives: one retry then fight; reword the failed line each time.
- [ ] **Slice 3 verdict is neither** (`docs/sims/orders-2026-11-11.md`; decision row 2026-11-11). Go to the formal playtest anyway, or change something first? The defaults match the adapted plans in 54% of cells (rework line 67%); adapting clears the bar in 23% (proceed line 67%).
- [x] **`techUnderFire` narrowed** to the tech at half pips with a radio call shown: 82% of hacks down to 2% (decision row 2026-11-11). Also settles "Hit the caller" without a call.
- [ ] **Extractions for starting crews** (`docs/sims/vantiming-2026-11-12.md`, `vanlevers-2026-11-11.md`): the van timing only trades "job failed" against "someone left behind" (round 2: 84% done, 69% left; round 3 now: 67% and 51%; round 5: 30% and 18%); nothing makes "everyone home and done" better than 6-14%. `vanRound` stays 3. The levers left are the two jobs' difficulty or threat, the enemy count, or sending stronger crews in the playtest (strong sim crews get everyone home and done most of the time). Which?
- [ ] **Committed risk on starting crews kills in 15-49% of extractions** (fresh Warehouse 49%, Protection 37%; authored 22% and 15%), against a target of about 1 in 25 that the stronger sim crews met. Decide before anyone playtests committed play: steady-only for the playtest, or look at the bleeding and left-down numbers.
- [ ] **Committed deaths are about 1 in 56** (target about 1 in 25), all in holdExtract. Fine, or raise `bleedChance`/`leftDownDeath`?
- [ ] **"Chance of losing someone"** counts someone killed *or left behind* (missing for 7 days). On cautious and steady the risk line says a death only follows a call you make, yet the chance can be above zero there (left behind). Keep "losing someone", or say "killed or left behind"?
- [x] **"Hit the caller"** is now offered only with a call shown (the dilemma needs one).
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
