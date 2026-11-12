# Handoff: Engine 2 watchable combat, director, Overdrive and showcases (corrected, 2026-11-12)

> **Status: for the owner to read. Nothing is built until the owner has read this file.**
> This replaces the first draft of the handoff (pasted in session, 2026-11-12). It folds in the owner's
> eight decisions from the review against the code, and lists in "Flags" everything else found not to
> match the code. Design rationale: the DESIGN.md row of 2026-11-12, "Watchable combat: the handoff
> corrected against the code" (`docs/design/2026-11.md`).

Paste from "Context" down into a new session as its first message. It is written to stand alone.

---

## Context

Lantern Bay is a text-first crew-management game (plain JavaScript + Vite). Read `CLAUDE.md`, then
`CODEMAP.md` (Engine 2 is described under `fight.js` and `runfight.js`), then `docs/BATTLES.md`.

Fights for five jobs run on Engine 2:
- `core/fight.js`: the rules (pure; every roll draws from the rng it is handed).
- `core/runfight.js`: the run's side (rounds, call-ins, the end of a fight mapped onto the run).
- `data/fights.js`: the numbers. `data/dilemmas.js`: authored call-ins. `data/fightText.js`: wording keys.

Raids and every other fight stay on Engine 1 (`core/battle.js`). **Leave Engine 1 alone.**

Goal: make Engine 2 fights watchable and let strong runners visibly dominate, without changing pips,
the core roll, duties, risk levels or the death-risk contract.

## Invariants (must hold after every slice)

1. **Shown equals used.** Planning odds (`fightOdds`, `fightOddsFor`, `vanOdds`) replay the real
   `playRound`. Every new rule lives inside the round function.
2. **Previews never draw or change the fight.** `previewRound`, `resolveOrders`, `exposures`,
   `dueDilemmas`, the director (`direct`) and the map layout (`layoutFight`) leave `b` deep-equal to how
   they found it and never roll a showcase.
3. **Pace never changes outcomes. The criterion is "identical outcomes for identical decisions".** The
   same saved state, played at Watch, Fast or Resolve with the same call-in answers, ends in an identical
   state.
4. **Showcase rolls never touch any rng stream.** They are a pure hash of a stored seed.
5. **Wording goes through `lineText` keys** in `data/fightText.js`. Use placeholder keys; the owner
   writes the text.

## Order of work (owner, 2026-11-12)

Slices 3 to 5 are **not** built straight after Slice 2. A playtest sits between them, because the slice 3
validation sim of the base rules came back "neither" (`docs/sims/orders-*.md`): adding rules that change
balance before readable fights have been tried would tune two things at once.

1. **Slice 0a first, with its test:** always draw ahead, then the determinism test. Nothing else starts
   until that test passes.
2. **The rest of Slice 0**, including the odds cache key (0c).
3. **Slice 1, the director (text only).** In parallel, the owner writes the director's spotlight wording
   (content question 1): with placeholder keys spotlights read flat and a playtest would undersell them.
4. **Slice 2, the map and Fast mode.** Before any map code, a **phone-width mockup** (360px, then wider)
   with six runners and six or more enemies, protectors fanned beside teammates and attackers on lanes;
   the owner approves it, and `data/fightLayouts.js` follows it. Read "UI skin" in `ART.md` and the newest
   `docs/screenshots/` set first.
5. **Playtest gate (owner).** Play holdHack and holdExtract fights at Watch and Fast on today's rules
   against success criteria 1-3: a fight can be understood without the log; the combat specialist and the
   protector can be told apart without names or the log; a good result traces back to the player's own
   orders. Record the findings in DESIGN.md. **The owner decides here how much of Slices 3-5 is still
   needed;** nothing below starts without that call.
6. **Slice 3, in two steps, each its own PR:**
   - **3-i: the approach stage, the `approaching` priority, per-group flee, then waves** (3a, 3b, 3c, 3d;
     3c before 3d, never after). These serve the pillar most directly: "Rook on the door" is an order.
   - **3-ii: Reflex Overdrive** (3e), after 3-i has been played. Content question 3 first.
   - Re-baseline the sims after each step (0f).
7. **Slice 4, showcases, only once the frequency numbers support them.** First a sim of how many eligible
   holdHack fights a player meets per in-game week (only three jobs are holdHack, and a fight starts only
   from an unsaved danger incident), with the 14-day cooldown; set Hold the Line's chance from that, not
   from the "1 per 3-6 eligible fights" guess. Content question 4 first.
8. **Slice 5, reuse in holdExtract** (configuration only).

Each slice is its own PR, with `npm test` green, a CHANGELOG entry and a DESIGN.md row.

---

## Slice 0: foundations

### 0a. Always draw ahead (owner decision 1)

Today the stream a round uses depends on the pace:
- a watched fight draws the coming round ahead with one `nextRng(state)` (`runfight.js drawAhead`, gated
  by `waitsForOrders`), and `runFight` then plays the round with a second `nextRng`;
- a hands-off or away fight draws and plays the round from one `nextRng` inside `runFight`.

So the same seed gives different fights depending on whether anyone watched. Change:
- `drawAhead` draws at **every** pace: drop the `waitsForOrders(am)` gate (keep `b && !b.end && !b.drawn`).
  Hands-off, handed-off and away fights draw the next round as soon as the last one ends, exactly as a
  watched fight does.
- `runFight` keeps its `if (!b.drawn)` fallback for fights saved before this change (mid-fight saves).
- **Fast is the watched path plus a UI timer, nothing else.** No core code branches on Fast.
- `playFight`, `fightOdds`, `fightOddsFor` and `vanOdds` keep their single stream; they are unchanged.

This is a deliberate one-off sequence shift for hands-off and away fights. Log it in DESIGN.md and
CHANGELOG.md. Any existing test pinned to a hands-off fight's exact rolls is re-pinned, and the re-pin
is noted in the PR; no assertion is loosened.

**Determinism test** (`tests/fightpace.test.js`), at the `runFight` level:
- Build a run state that reaches an Engine 2 fight (one holdHack, one holdExtract, a few seeds each).
- Play it three ways from the same state: watched with no order changes (Watch and Fast are the same
  core path; the test plays it once as "watch/fast"), handed off from the first round (`handOffFight`),
  and with `callIn: 'never'`.
- Call-ins are answered by a script equal to `fightAnswer(am)`; the death's-door call-in is answered
  "pull back" (what an unwatched crew does on its own, `afterRound`).
- Assert identical `Fight.outcomeOf(b)`, `b.end`, `am.extraHeat` and `state.rngCounter` across all three.

### 0b. The showcase seed and `hash01` (owner decision 2)

- `core/rng.js`: `export const hash01 = (...parts) => hash(...parts) / 2 ** 32;` reusing the existing
  FNV-1a `hash`. No new mulberry or xmur3 code.
- `buildFight`, as its last draw: `b.showcaseSeed = Math.floor(rng() * 2 ** 32)`. Live fights keep this
  one draw at build. (The build's rng is local to `startFight` and `fightOddsFor`'s builds, so this
  moves no later roll; see Flag F1.)
- `fightOdds` and `vanOdds`: inside each run, after `structuredClone`, set
  `b.showcaseSeed = hash('odds', i)` (with `vanOdds` keyed on its own label, e.g. `hash('van', hold, i)`).
  Nothing is drawn from the run's `makeRng(...)` for it, so the odds streams do not move.
- `showcaseSeed` is **not** in the odds cache key (each run reseeds).

### 0c. The odds cache key (owner decision 3)

`fightOdds` builds its cache key from a fixed list of fields (`fight.js` near `oddsCache`). Add:
- each runner's `overdrive` (`{ cap, uses }` or null);
- `b.showcaseEligible`;
- `b.maxExtra`;
- the fight's recipe and waves (`b.recipe`, including which waves are still to come);
- each enemy's `approaching` (and `group`, which the flee rule reads).

Add a test: two fights equal but for one runner's Overdrive give different keys (and, once Overdrive
exists, different odds).

### 0d. Lines keep their slots (owner decision 8)

- `say()` in `startRound` and `playRound` keeps `slots` on the line it pushes (`{ kind, key, slots, ...extra, text }`).
  There is no separate `fullLines` field: `result.lines` is already the full list.
- `runfight.js feedLine` carries `key` and `slots` through to the recorded event, so the director and a
  report can be re-read from saved events.
- Retention reuses `REPORT_LOGS_KEPT` (`core/report.js`, 20): the newest reports keep their full
  `timeline.events`, older ones keep the summary, as now. No exception for spotlight or showcase fights
  (owner, F8): a showcase lasts in `op.showcases` and its run-report line.

### 0e. Preview tests (owner decision 7)

In `tests/fight.test.js` (extended as the director and map arrive):
- For `previewRound`, `resolveOrders`, `dueDilemmas`, and later `direct` and `layoutFight`: deep-compare
  `structuredClone(b)` before and after the call.
- Assert that no output of a preview contains a line or action of kind `showcaseStart`, `showcaseEnd`,
  `overdriveStart` or `showcase`. (Overdrive's *planned* action is shown; see 3d. The burst's lines
  never are.)

### 0f. Re-baseline the sims once

The engine-2 sims on the real code are `scripts/sim-orders.mjs` (plays `runFight`, so 0a moves it),
`sim-teams.mjs`, `sim-vanlevers.mjs` and `sim-pullout.mjs` (all `fightOdds`). Re-run them after 0a and
again at the end of Slice 3, with before and after kept in `docs/sims/`. `sim-step0.mjs` is the Step 0
script's own model, not the real code, so re-running it measures nothing here (Flag F12).

---

## Slice 1: the director (text only)

New file `core/director.js`, pure:

```js
// direct(b, roundResult, memory) -> { beats, memory }
Beat = {
  tier: 'routine' | 'notable' | 'spotlight' | 'showcase',
  lines: [line],        // the round's lines grouped into one beat (cause -> effect kept together)
  focus: [id],          // runner ids and/or enemy n's to frame
  key: string | null,   // director line key for spotlight/showcase text
  slots: {},
  holdMs: number,       // playback hint only
}
Memory = {              // carried across rounds on b.director; never read by the rules
  defeats: { [runnerId]: [{ round, enemy }] },
  shields: { [runnerId]: { [forId]: count } },
  lowPipRounds: { [runnerId]: count },
}
```

Tiers:
- **Routine:** attack hit or miss, shot miss, hunker, aura.
- **Notable:** downed, shot absorbed, shield taken, jam ok, arrive, approach, work progress, board, van lines.
- **Spotlight detectors:**
  - Streak: one runner with 3+ defeats within 2 rounds.
  - Shield wall: the same protector shields the same runner 3+ times.
  - Last stand: a runner at 1 pip acts 2+ rounds.
  - Clutch hack: work completes at round >= deadline - 1.
  - Denied: a jam cancels 2+ radio threats.
  - Carry home: a `carriedInVan` line.
- **Showcase:** the lines of a showcase (Slice 4).

The director is pace-free in core: it tags every detected spotlight. The spotlight budget
(`FIGHT.spotlightBudget = { watch: 4, fast: 3, resolve: 0 }`) is applied at playback; over budget a
spotlight plays as notable. Resolve still lists spotlights in the timeline. (Owner, F2: the budget lives
in the UI, not core.)

Wire it in `runfight.js playOn`: `direct` runs after `playRound`, its beats go on the round's recorded
event, and `b.director` holds the memory. Nothing it returns feeds back into the rules.

---

## Slice 2: the map and Fast mode (holdHack)

New file `core/fightmap.js`, pure:

```js
// layoutFight(b, preview) -> { anchors, markers, links }
anchors (data/fightLayouts.js, normalised 0..1):
  holdHack:    { terminal, centre, cover: [...], entrances: [a, b] }
  holdExtract: { holdPoint, centre, cover: [...], entrances: [a, b], van }
Marker = {
  id, side: 'crew' | 'enemy', glyph, handle?, kind?,
  anchor, offset,               // offset fans out markers sharing an anchor
  state: 'up' | 'down' | 'dead' | 'aboard' | 'withdrawn' | 'out' | 'fled' | 'approaching',
  pips, max, absorb,
}
Link = { type: 'threat' | 'shield' | 'target', from, to, threatKind? }
```

- **Runner anchors from the preview's action** (`previewRound`, never a draw):
  - work: terminal
  - shield/protect: beside the protected runner
  - attack/overdrive: the target enemy's lane
  - support/jam/patch/stabilise: centre
  - board/carry: van
  - hunker: nearest cover
  - withdraw: off-map edge
- **Enemy anchors:** `approaching`: `entrances[e.entrance]`. Otherwise the lane between their entrance
  and the centre. `e.entrance = (e.n - 1) % entrances.length`, set in `newEnemy`.
- Links: threat links from `b.threats` (aim and flank) and shield links from the actions. The UI shows
  them on the telegraph or on selection.
- UI: `ui/fightmap.js` renders SVG/DOM glyphs and animates between layouts at each beat. Down, absorbed
  and fled marks persist. Teams of up to 6.
- **Pace** (owner, F2): Watch or Fast is a UI preference (`save.js getPref`/`setPref`, like Hall art),
  never in the save and never read by core; no save bump for it. Resolve is the existing `b.auto`.
  - Watch: as today (`waitsForOrders`).
  - Fast: the same core path; the UI plays the round with the current orders when the last beat's
    `holdMs` has passed. Call-ins (dilemmas, death's door) still pause, because `runFight` raises them
    as `am.pending` exactly as in Watch.
  - Resolve: `handOffFight` (`b.auto = true`), as today; the risk level answers (`fightAnswer`).
  - Defaults to Fast. Switchable mid-fight between Watch and Fast at any time; out of Resolve needs a
    new core call (Flag F3).

---

## Slice 3: the power fantasy

### 3a. The approach stage

- `newEnemy(b, kind, rng, { arriving = false, group })` sets `e.approaching = arriving` and `e.group`.
  Arrivals from `b.arriving`, the pressure clock and waves pass `arriving: true`. Starting enemies don't.
- In `telegraph`, an approaching enemy draws as normal (the deck advances). **On purpose:** a drawn
  `aim` or `flank` is discarded (no threat pushed, and the card is spent); radio cards (`backup`,
  `alarm`) apply as normal. Draw the target roll or not consistently in both cases; whichever is chosen,
  write it down in the code comment.
- At the end of `playRound`, clear `approaching` on all enemies.
- Approaching enemies can be attacked normally, at their cover.
- New line kind `approach` (key `approach`) for each enemy still approaching at round start, for the
  director and the map.

### 3b. The `approaching` priority

Add `'approaching'` to `PRIORITY_WORDS`. In `enemyOrder`: `p === 'approaching' ? (e.approaching ? 0 : 1)`.

### 3c. Flee per group (owner decision 4; built before waves)

- Each enemy has `group`: 0 for the starting enemies; each startRound arrival batch, pressure arrival
  and wave gets a new group number (`b.nextGroup`).
- `b.hiredTotal` becomes `b.hiredTotal[group]`. The flee check runs per group: a group's hired still up
  over that group's hired total, below `ENEMIES.hired.fleeBelow`, and the group flees.
- **An enemy cannot flee in its approach round:** the check skips enemies with `approaching` set (it runs
  before they are cleared at the end of `playRound`).
- This changes every docks fight where hired backup arrives, not only waves (Flag F6).

### 3d. Waves (owner decision: their own budget)

- `FIGHT_RECIPES[templateId] = { maxExtraEnemies?, waves: [{ round, kind, count }] }` in `data/fights.js`.
- `b.maxExtra` is set at build (recipe, else `FIGHTS[type].maxExtraEnemies`, else `FIGHT.maxExtraEnemies`).
  Replace every read of `FIGHT.maxExtraEnemies` with `b.maxExtra`. **`maxExtra` caps reactive
  reinforcements only** (backup calls, the alarm clock, the pressure clock).
- **Waves have their own authored budget and do not count toward `b.extras`.** `b.recipe` keeps the
  waves still to come.
- `startRound` spawns due waves (`arriving: true`, one new group per wave) before `telegraph`.
- Waves use `hired` as the minion.

### 3e. Reflex Overdrive

Runner field, set in `runnerOf`:

```js
overdrive: { cap, uses } | null
// tier = reflexTierOf(op): 1 for street Reflex wiring, 2 for pro, 0 without it
// null when tier is 0; else cap = min(FIGHT.overdrive.maxCap, FIGHT.overdrive.base + tier), so 3 or 4
// uses = FIGHT.overdrive.usesPerFight (hook: + a bonus from rank or experience later)
FIGHT.overdrive = { base: 2, maxCap: 5, usesPerFight: 1, minTargets: 2 }
```

- `reflexTierOf(op)` in `core/gear.js`: the runner's implants include `type: 'reflex'`; street is 1, pro
  is 2 (`TIERS`). The item is `reflex` in `data/gear.js` ("Reflex wiring"). No placeholder, no debug flag.
- **Eligibility:** wearing the wiring (`overdrive` not null, `uses > 0`) and on attack duty.
- **When it fires (automatic, deterministic, holds):** in `resolveOrders`, in `tryDuty('attack')`, when
  the runner is eligible and either
  - 2 or more **approaching** enemies are up, or
  - no recipe waves remain to come, 3 or more enemies are up, and it is round 2 or later (owner, F7).
  Then return `{ kind: 'overdrive', targets: [n...] }`.
- **Targets:** up to `cap` from `enemyOrder` with the runner's priority, skipping enemies already covered
  by other attackers' reservations, and reserving damage on each (`res.damage`).
- The preview shows "Overdrive" with its planned targets. This is a plan, not a roll.
- In `playRound`, for each attack in turn:
  - take the next planned target; if it is out or fled, take the next up enemy by `enemyOrder` **that no
    other attacker has reserved** (owner decision 6; no draw). Ordinary attacks keep `attackGone`.
  - roll exactly like `attack`: same step, cover, strong margin, absorb and AP rules;
  - stop at `cap` attacks or when no unreserved enemy is up.
  - Then `uses -= 1`.
- Lines: one `overdriveStart` line, then each attack as `kind: 'attack'` with `burst: true`. Defeats go
  into `defeated` as normal.

---

## Slice 4: showcases

New file `data/showcases.js`, using the dilemma `when` grammar plus runner eligibility:

```js
export const SHOWCASES = {
  holdTheLine: {
    fight: ['holdHack'],
    when: { approachingAtLeast: 2 },     // new condition key in holds() (Flag F5 for where it goes)
    runner: {                             // eligibility, checked per standing runner
      duty: 'attack',
      notProtected: true,
      statAtLeast: { combat: 6 },         // tune
      pipsAtLeastShare: 0.5,
      notOnCooldown: true,                // id in b.showcaseEligible
    },
    chance: { base: 0.15, perStatOver: { combat: 0.03 }, max: 0.45 }, // tune to ~1 per 3-6 eligible fights
    effect: { kind: 'burst', targets: 'approaching', attacks: 'overdriveCapOr3', attackBonus: 3 },
    oncePerFight: true,
    rep: 1,
  },
};
```

- **Cooldown lives outside the fight, and eligibility is computed in `buildFight`** (Flag F3b): from each
  operative's `op.showcases = [{ id, day }]` and `FIGHT.showcaseCooldownDays` (14), with `day` a new
  `buildFight` argument. `b.showcaseEligible = { [showcaseId]: [runnerIds not on cooldown] }`. The
  planning odds (`fightOddsFor`) then see the same eligibility as the live fight.
- **Roll in `playRound` only**, after `resolveOrders` and before the actions loop:
  - For each showcase that holds and hasn't fired, take the first eligible runner (by seat) whose
    resolved action is `attack` or `overdrive`.
  - Roll `hash01(b.showcaseSeed, b.round, id, r.id) < chance`.
  - On success, replace that runner's action with the showcase effect, release that runner's
    reservations, and set `b.showcasesFired[id] = r.id`.
  - **A showcase that replaces a planned Overdrive does not spend its use.**
- **Effect `burst`:** attacks resolve like Overdrive attacks with `attackBonus`, approaching enemies
  first, then any; retargets skip enemies reserved by other attackers (owner decision 6). It never
  spends `overdrive.uses`.
- Lines: `showcaseStart` (key `showcase.holdTheLine.start`), the attacks with `showcase: id`, and
  `showcaseEnd`. The director gives them the showcase tier with a choreography id.
- **The run's side** (`runfight.js endFight` and `retreatFight`, at every pace):
  - push `{ id, day, job }` to `op.showcases`;
  - add a run-report line;
  - add `rep` to `state.reputation`, capped at `FIGHT.showcaseRepPerRun = 1` a run (Flag F9).
- **Safeguards:** no effect changes a runner's pips, stabilises, boards or ends the fight directly;
  `checkEnd` runs as normal; `previewRound` never shows a showcase.
- **Save:** `op.showcases` and the new fight fields change the state shape: bump `SAVE_VERSION` (62 to 63)
  and add a migration (Flag F4).

## Slice 5: reuse

- holdExtract gets layout anchors and a recipe with waves: configuration only.
- No new code paths beyond data. If one is needed, flag it rather than special-casing it.

---

## Flags: things that did not match the code (owner's call where marked)

- **F1. The showcase seed moves nothing in live fights.** `buildFight`'s rng is a fresh `nextRng` used
  only for the build (and fixed seeds in `fightOddsFor`), so drawing the seed last shifts no later roll.
  The only real sequence shift in this work is 0a.
- **F2. Where pace lives (decided).** `am.pace` in core would have been a save change for what is UI only,
  and would have made the spotlight budget depend on pace. Owner: Watch or Fast is a UI preference
  (`save.js getPref`, like Hall art); Resolve stays `b.auto`; the director tags spotlights pace-free and
  the budget is applied at playback.
- **F3. Resolve is one-way today.** `handOffFight` sets `b.auto = true` and nothing sets it back.
  "Switchable mid-fight" out of Resolve needs a new `takeBackFight` in `runbattle.js` (sets `b.auto = false`;
  after 0a the round is already drawn). Small, but it is new.
  **F3b.** Showcase eligibility must be computed in `buildFight`, not `startFight` as the first draft
  said: the planning odds (`squad.js` via `fightOddsFor`) never call `startFight`.
- **F4. Save shape.** The first draft did not mention a save bump. `op.showcases`, and on `am.battle`
  `showcaseSeed`, `showcaseEligible`, `showcasesFired`, `maxExtra`, `recipe`, `director`, `nextGroup`,
  per-group `hiredTotal`, enemy `approaching`/`group`/`entrance` and runner `overdrive` all change what a
  mid-fight save holds. Migration: `op.showcases = []`; a fight in progress gets the defaults (no
  showcase eligibility, `hiredTotal` as `{ 0: n }`, `maxExtra` from data, no Overdrive).
- **F5. `holds()` returns false for specialist keys when there is no protected runner.** The new
  `approachingAtLeast` key must sit above the "the rest are about the specialist" line, or it can never
  hold in holdExtract.
- **F6. Per-group flee is a balance change everywhere hired backup arrives** (docks fights), not only
  with waves. A lone hired arrival is a group of one and never flees. The Slice 3 re-baseline measures it.
- **F7. Overdrive in fights without a recipe (decided).** "No recipe waves remain" is always true there,
  so at threat 3-5 it would fire in round 1. Owner: the second trigger also needs round 2 or later.
- **F8. Full lines for spotlight and showcase fights (decided).** `REPORT_LOGS_KEPT` works per report and
  there is no per-fight store. Owner: the exception is dropped; a showcase's record lives in
  `op.showcases` and its run-report line.
- **F9. Reputation has no per-run accumulator.** The bonus is added straight to `state.reputation` in
  `endFight`/`retreatFight`; the per-run cap is tracked on `am` (`am.showcaseRep`).
- **F10. Death's door at Resolve.** `afterRound` asks at death's door whenever `am.callIn !== 'never'`,
  even with `b.auto` set: a handed-off fight still pauses there. That is correct by the death rule; the
  determinism test scripts "pull back" for it.
- **F11. `vanOdds` reseeds too** (0b), with its own hash label.
- **F12. `sim-step0.mjs` is not the real code.** The first draft asked to re-run it; the sims that
  measure this work are `sim-orders`, `sim-teams`, `sim-vanlevers` and `sim-pullout`.

## Content questions for the owner (do not invent)

1. All new `lineText` keys: `approach`, `overdriveStart`, the `showcase.holdTheLine.*` keys, the
   director's spotlight keys. Use placeholders.
2. Wave recipes per job, and Hold the Line's stat threshold.
3. **Overdrive's source (before 3-ii).** As written only Reflex wiring unlocks it, so a muscle runner
   without the implant never dominates. Should a combat specialisation also unlock it?
4. **What Hold the Line does that Overdrive doesn't (before Slice 4).** As written both are a burst of
   attacks on arriving enemies, so a player won't feel the difference. A showcase should do something
   the normal rules can't, within the safeguards (no runner pips changed, no fight ended directly).
5. **Raids next? (no slice here).** Raids and every other fight stay on Engine 1, so the game has two
   looks for fights. If raids are the next Engine 2 port, the layout format in `data/fightLayouts.js`
   should allow for a hall's map.

## Acceptance

- Every invariant test passes (determinism at `runFight` level, previews deep-equal, cache key).
- Sims re-baselined, with before and after documented in `docs/sims/`.
- In a holdHack fight with a wave and an eligible runner on attack with the `approaching` priority, the
  arrivals are engaged during their approach round, and a wave cannot flee in that round.
- Overdrive lines show sequential retargeting that never takes another attacker's reserved enemy.
- A forced-success showcase plays and is recorded identically in Watch, Fast and Resolve.
- Odds with Overdrive and showcases differ from odds without.
- holdExtract plays the map and director with no fight-type-specific director or map code beyond layout data.
