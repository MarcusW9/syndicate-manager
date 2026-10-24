# Plan: reputation tiers (the syndicate levels up)

Agreed 2026-10-24. One step per session, in order. Each step must stand alone:
read CLAUDE.md, this file, and only the code it names. Tick a step off here
(and add its CHANGELOG entry and DESIGN.md log row) in the same commit that ships it.

**Why:** playtests say the core loop is fun but nothing *about the syndicate* improves.
Operatives grow; the crew as a whole doesn't. Today `state.reputation` rises
(+3 × threat per finished job, −3 per abort, clamped 0–100, `core/mission.js`)
but nothing reads it, and it maxes out in about six weeks. This plan turns it into
the spine of long-term progress. Training, safehouse rooms, perks and a second crew
come later as their own plans and plug into the tiers.

## Decisions already made (do not re-open)

| Topic | Decision |
| --- | --- |
| Ladder | **5 named tiers, the top one a plateau** (endless play continues there; later depth comes from other systems). Placeholder names: Street crew → Known outfit → Rising firm → Syndicate → Legend. Names live in data, renamed there only. |
| Pacing | **First tier-up after about 2 in-game months** of careful play. Later tiers take longer (target set in step 0). |
| Can slip back | Yes. Reputation can fall, and you can **drop a tier**. |
| What costs reputation | **Aborts, failed crisis rolls, and weeks without work** (no job started Monday–Sunday). **Not** crew deaths, **not** heat. |
| Demotion | **Warning, then drop.** Falling below your tier's drop line sends a "word on the street" notice and starts a **grace period**; recover above the line before it ends and nothing happens, otherwise you drop one tier. Not instant. |
| Unlocks per tier | All four: **bigger jobs, new clients, better recruits, a bigger board** (more offers a week). |
| Bigger jobs | **Scaled versions of the 7 existing jobs first** (harder, better paid); new tier-only job types are written later in batches. |
| Second crew / simultaneous jobs | **Not in this plan.** A separate feature later, unlocked at tier 3 or 4. |
| Display | **Tier name + progress bar** towards the next tier, with a marker for the drop line. **No raw numbers** shown. |
| Old saves | **Placed by their current reputation** (a maxed old save starts higher, not back at tier 1). |
| Training cost (for the later training plan) | Time **and** money. Recorded here so the tier numbers leave room for it. |

## Proposed numbers (step 0 confirms or replaces them)

These are starting points, not decisions. Step 0 simulates them.

- **Scale:** reputation becomes an uncapped running total (no 0–100 clamp). Gain stays +3 × threat per finished job.
- **Tier thresholds (entry):** T2 120 · T3 350 · T4 800 · T5 1,600.
- **Drop line:** 80% of the tier's entry threshold (T2 drops below 96, and so on). T1 has no drop line.
- **Grace:** 2 weeks from the warning, checked on Sundays.
- **Losses:** abort −3 (as today) · each failed crisis roll −1 · a week with no job started −2% of the current tier's entry threshold (min 2).
- **Board:** T1 4 offers / 2 new a week (today) · T2 5 / 2 · T3 5 / 3 · T4 6 / 3 · T5 6 / 3.
- **Clients:** T1 Auntie Fung, The Ferryman, Madam Rao · T2 + Mr. Szeto · T3 + Ruth Okonkwo · T4/T5 one new client each (written later; a placeholder is fine).
- **Job gating:** each template gets `minTier`. T1 courier, data pull, warehouse, casino, protection · T2 kidnap · T3 penthouse. Walk-in work respects it too. *(This takes the ¥12,000 penthouse off the opening board; step 0 must check the T1 economy still holds.)*
- **Grades (scaled jobs):** an offer can roll a grade above the base job. Grade 1 "Serious" from T2: pay ×1.5, every roll 1 harder (the same rule as "hotter"), rep ×1.5. Grade 2 "Major" from T4: pay ×2.2, every roll 2 harder, rep ×2. Chance of a graded offer rises with tier.
- **Recruits:** quality weights (rookie/pro/veteran) T1 50/38/12 (today) · T2 45/40/15 · T3 40/42/18 · T4 35/43/22 · T5 30/45/25. From T3, rookie main-stat ceilings shift up one band (e.g. a 14 becomes a 15).

## Steps

### Step 0 · Ladder simulation (no game code) — [ ]
Write a throwaway sim (scratchpad or a `tests/` helper next to `tests/develop-sim.js`) using the careful policy in `tests/play.js` and the numbers above, over 200 seeds and 2 seasons:
- weeks to reach each tier (median, 10th and 90th percentile); target: T2 around week 8;
- how often careful play gets a drop warning, and how often it actually drops; a player who takes a 3-week break; a player who aborts a lot;
- T1 economy with job gating (median cash and % broke at weeks 4 and 8, against today's ~¥10,500 / ~¥12,100 / 12%);
- pay and survival on graded jobs at T2 and T4 with a typical crew for that point in the run.

Output: a short table in this file under "Step 0 results", the numbers to use, and any test bands that will need to change. Stop and report before building anything.

### Step 1 · Reputation core, tiers and display — [ ]
- `src/data/reputation.js`: tier list (id, name, entry threshold, drop line, board size, flavour line). Numbers from step 0.
- `src/core/reputation.js`: `tierOf(state)`, `progress(state)` (0–1 towards the next tier, plus where the drop line sits), `gainRep` / `loseRep`, and the Sunday check (idle-week loss, drop warning, grace, demotion, promotion). The rep line in `core/mission.js` `finish` moves here; failed crisis rolls call `loseRep`.
- State: `reputation` uncapped, `repTier`, `repWarning: { day } | null`. Bump `SAVE_VERSION`, add the migration in `save.js` (old 0–100 rep × 1.2, so a maxed old save lands at the T2 entry point, then set the tier from it).
- Promotion is an inbox message with the new tier's flavour line; the warning is a non-blocking inbox message; demotion is a message that says what you lost.
- UI: tier name and bar on the inbox (and the Jobs screen header), drop-line marker, tap to see what the next tier unlocks. Phone width first, at least 44px tap targets.
- Tests: tier boundaries; rep never makes a death more likely; a warning then a recovery doesn't drop you; a warning then no recovery drops exactly one tier; idle weeks cost rep; deaths and heat don't; save migration.
- **No unlocks yet.** Tiers are visible but change nothing, so this step can be played and judged on its own.

### Step 2 · Unlocks: clients, job gating, board size — [ ]
- `minTier` on clients (`data/clients.js`) and mission templates; `callingClients` and walk-in work in `core/jobs.js` respect it; `MAX_OFFERS` and new-per-week come from the tier.
- If you drop a tier, offers already on the board stay until they expire (no yanking a job you've planned).
- The tier screen lists what's unlocked and what the next tier adds.
- Tests: no offer above your tier; dropping a tier doesn't remove live offers; the economy band (`tests/rules.test.js`) updated **on purpose** from step 0's numbers and logged in DESIGN.md.

### Step 3 · Graded jobs (scaled-up versions) — [ ]
- `grade` on an offer (0/1/2), rolled in `addOffer` with a tier-based chance. `jobView` applies pay, difficulty and the rep multiplier; the board labels them ("Serious", "Major").
- Difficulty goes through the existing roll-rule pipeline (`core/crew.js`), so the risk read and the real roll match.
- Tests: grade never offered below its tier; difficulty shows in both the risk read and the real roll; "no death without push on" and "abort always brings everyone home" still pass on graded jobs.

### Step 4 · Better recruits by tier — [ ]
- `QUALITY` weights in `core/recruits.js` and the rookie ceiling table in `core/development.js` take the tier (numbers from step 0, data in `data/reputation.js`). Freelancers follow the same weights.
- Tests: quality mix per tier over many rolls within bands; recruits still always 18+; market prices still go through `pricing.js`.

## Later (separate plans, not this one)
- New tier-only job types (1–2 per tier), written with `WRITING_GUIDE.md`.
- Training weeks (time + money) and safehouse rooms.
- Signature perks at milestones; morale/burnout consequences; wiring the unused trait effects.
- A second crew running jobs at the same time (T3 or T4).

## Session prompts (copy into a new session)

- "Read CLAUDE.md and PLAN-REPUTATION.md. Do step 0 only. Report the numbers; don't build."
- "Read CLAUDE.md and PLAN-REPUTATION.md. Do step N only. Run npm test, commit as marcusw, push under me."
