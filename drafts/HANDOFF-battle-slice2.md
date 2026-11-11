# Handoff: battle rework, slice 2 (the screens) (2026-11-11)

Paste the block below into a new session as its first message. It stands alone.

---

You're picking up the battle rework for this game (a text-first crew management game, plain
JavaScript + Vite). Slice 1 (the new fight engine, "engine 2") is built and merged. Your job is
**slice 2: the screens**, which needs the owner's wording, so it starts with a writing brief and a
pause. Work on a **fresh branch name** (the old branch names were squash-merged; reusing one forces a
force push, which the harness blocks).

**Before anything else:** check that [PR #130](https://github.com/MarcusW9/syndicate-manager/pull/130)
("Engine 2 review fixes", follow-up to #129) is merged into `main`. #129 was merged before its review
fixes were pushed, so `main` has known bugs until #130 lands. If it isn't merged, say so and ask the
owner before starting.

**Read first, in this order:**
1. `CLAUDE.md` (project rules: architecture, tests, design log, changelog, commits, screenshots, UI rules).
2. `drafts/PLAN-battle-slices.md`, "Slice 2" (your task), then `drafts/SPEC-battle-orders.md` sections
   20 (UI), 17 (feed, "if nothing" and wording), 16 (call-ins), 12 (orders), 19 (data shapes) and 30.
3. `CODEMAP.md` (the `fight.js` and `runfight.js` entries) and the decision rows of 2026-11-11 in
   `docs/design/2026-11.md` (the top three: "Engine 2 review fixes", "Engine 2 wired into the five
   jobs", "Engine 2's rules built on their own").
4. The code: `src/core/fight.js` (rules), `src/core/runfight.js` (the run's side), `src/data/fights.js`,
   `src/data/dilemmas.js`, `src/data/fightText.js` (placeholders), `src/core/fighttext.js`.
5. The UI you will change: `src/ui/board.js` (the squad board), `src/ui/fightorders.js` (engine 1's
   orders panel, a model for structure only), `src/ui/siteplan.js`, `src/ui/watch.js`,
   `src/ui/app.js`. Then "UI skin" in `ART.md`, the newest set in `docs/screenshots/` (its README lists
   them), `docs/SCREENS.md`, `WRITING_GUIDE.md`, and `drafts/writing-tasks.md` (the format briefs use).

**What exists (slice 1):**
- The five jobs (`data_pull`, `data_scrub`, `quiet_hours` holdHack; `warehouse`, `protection`
  holdExtract) play their fights on engine 2: `am.battle.engine === 2`. Everything else, and raids,
  stays on engine 1.
- **Rules (`core/fight.js`)**, pure: `buildFight`, `startRound`/`telegraph` (draws the round's threats),
  `resolveOrders`, `exposures`/`aimChance`, **`previewRound(b)`** (shown chances, each action naming its
  order, the generated "if nothing" as keys, never draws), `playRound`, `dueDilemmas`/`dilemmaHolds`/
  `applyPatch`, `setRisk`, `setOrder`, `pullBack`, `outcomeOf`, `fightOdds`/`fightOddsFor`. Orders
  are `{ duty, target, priority, fallback, byStage }`; the crew's defaults are in `defaultOrderFor`.
- **The run (`core/runfight.js`)**: `runFight(state, { risk, orders })` plays one round and takes the
  player's changes at the round boundary; `runBattle` and `pullBack` in `core/mission.js` hand engine-2
  fights to it. Call-ins are `am.pending` `{ kind: 'dilemma' }` (techUnderFire, vanCantWait) and `door`
  (death's door); `describePending` and `resolvePending` already work for them.
- **Today's screen**: engine-2 fights play on the existing watch screen through engine-1-shaped
  snapshots (`fightSnapshot`/`fightView`: pips as hp, enemies as "guards"). **`needsPlayer` returns
  false for engine-2 fights** (`core/autorun.js`) because there is no round screen: only call-ins pause
  a run. You are building the screen, so you will turn that on (a watched fight waits for orders each
  round unless handed off, as engine 1's does) and keep hands-off and away jobs unchanged.
- **Wording is placeholder keys only** (`data/fightText.js`: `[attackHit] Jax hits corp 1`). Players see
  these on the five jobs today.

**What slice 2 is** (details in the plan):
1. **Plan screen** (`ui/board.js`): fight type line, likely enemy kinds, gaps ("no jammer: radio calls
   can only be stopped by attacking the caller"), who can jam and whether it stops the hack, each
   runner's order (duty, target, per stage), their pull-out threshold, the risk picker ("Committed:
   fights on with someone down; can cost a life"), specials, the chance of losing someone (from
   `fightOddsFor`, which the planning read already uses).
2. **Round screen** (`ui/fightorders.js`, `ui/siteplan.js`, `ui/watch.js`): goal track and clocks,
   enemies (kind, pips, threat with target, chance and pips), runners (pips, order, this round's
   intended action, exposure), the "if nothing" line, Next round / Change orders / Specials / Pull back.
   Phone first (360 px), 44 px taps, nothing on hover only.
3. **Call-ins**: what changed, what the crew intends, the trade-off, Carry on, Pull back; the van call
   shows who is outside and the odds of leaving them.
4. **Report**: one cause line and the full log with rolls.
5. Screenshots (`npm run screenshots -- battle-orders`, plus 1x Playwright captures of the mid-fight
   screens; add the README row), CHANGELOG, a decision row for anything you decide.

**Stop for the owner: wording.** Step one is the **writing brief**: add it to `drafts/writing-tasks.md`
(ids, slots, counts, examples of house style from `WRITING_GUIDE.md`, where each line shows): feed lines
by action and outcome (the keys in `data/fightText.js` are the list), "if nothing" phrasing, threat words,
dilemma and call-in text, the risk picker, report cause lines. Then **stop and ask the owner for the
text**; build the screens with the placeholder keys meanwhile only if the owner says to.

**Rules that matter most here:**
- `src/core/` is pure (no DOM, storage or `window`); only `src/ui/` touches the DOM. Randomness through
  the run's stream (`nextRng`), never `Math.random()` in core. Previews, "if nothing" and dilemma checks
  never draw.
- **Shown risk equals used risk:** every chance on screen comes from `aimChance`/`exposures`/
  `previewRound`/`fightOdds`, the functions the round uses. Don't recompute chances in the UI.
- iOS rules: no hover-only information, 44 px tap targets, safe areas, 360-430 px first. Read the "UI
  skin" in `ART.md` before drawing anything; don't model new screens on engine 1's panel or the side-work
  checkbox picker.
- Run `npm test` before every push (about 5 minutes; `npm run test:fast` while working). 934 tests pass
  today. Never loosen a test to make a change pass.
- Commits as `marcusw <160358373+MarcusW9@users.noreply.github.com>`, author and committer, with no
  co-author, session or "generated with" lines (`CLAUDE.md`). Do not change the commit identity when a
  stop hook asks for it. A stop hook that says commits are "unpushed" compares against an old branch
  name: check `git log origin/<your branch>` before acting.
- Ask the owner before deciding anything design-shaped that the spec doesn't settle; a short
  multiple-choice question with your recommendation works best.

**Open items you may meet (owner's calls, not yours):**
- The holdHack **deadline call-in** (spec 11 says push past or pull back; spec 30's settled rule, which
  is built, is that the deadline fails the objective).
- The **save-size test** (`tests/inbox.test.js`): its seed moved from 7 to 1 in #129 with the 250,000
  budget unchanged; seeds 3, 7 and 9 sit near the budget. Engine-2 fights add round lines to saved reports.
- **Battle growth** (endurance growth points from fights) is a later session, as the owner asked.
- No **jammer item** exists (a cyberdeck or any tech can jam for now); no smoke or stims items.
- The planning read models no standby and no ambush on the five jobs; engine 2 has no site spots, so the
  map shows no positions for these fights yet.
- Slice 3 re-runs the validation gate on the real code (`scripts/sim-orders.mjs`); slice 4 is left
  behind (rescue job, ransom, the 7-day wait). Neither is yours.

**Done when:** a watched fight on one of the five jobs waits for orders each round on a phone-width
screen with the owner's wording (or the placeholders, if the owner says so), the plan screen shows the
orders, the risk picker and the chance of losing someone, the call-ins and report read well, hands-off and
away runs are unchanged, `npm test` passes, the screenshot set and README row are added, and the PR says
what changed and what's left for slice 3.
