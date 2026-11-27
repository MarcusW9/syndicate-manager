# Plan: runner levels

Agreed 2026-11-27 (decision log, same date). Mockup: `docs/mockups/2026-11-27-levels.html`. Background: `drafts/REVIEW-research-2026-11-26.md`.

**What's agreed**
- A level fills from all the work a runner does: main and hands-off jobs, trips (expeditions and security posts) and side work.
- About four main jobs a level early on, a little more each level after.
- Levels 1 to 10 build the runner: a stat push at most levels; the skill places at 3 (move), 6 (payload) and 9 (specialisation). A skill level with nothing ready gives a push and keeps the place open.
- A stat push moves the runner's progress toward the next point in a stat they pick halfway. Near their ceiling it gives less; it never passes it.
- Veteran is level 10, with a ceremony. Rookie and pro stay tied to the main stat (pro at 15).
- Past level 10: slower veteran levels, each an upgrade to a skill they hold, a title every fifth. Designed later; not in this plan.

**What it replaces**
- `core/levelup.js`: a level-up every four jobs with the crew, only when a skill is ready (`data/builds.js LEVEL_UP`), so at most three in a career.
- `core/development.js promoteVeteran`: main stat 16 and 50 jobs (`VETERAN_AT`).

---

## Step 1. Trips grow people, and say so

The level bar only works if trips move it. Today a six-day expedition raises any stat for anyone about 5% of the time, a week on a post about 10% (the review, section 1a).

- Keep what `gainXp` returns on expeditions (`core/expeditions.js:168`) and posts (`core/contracts.js:205`): store the rises on the trip entry. A graduation gets the message and history line side tasks already give (`core/sidetasks.js:179`).
- The trip's report lists who grew.
- Tune `EXPEDITION.xpPerDay` (`data/expeditions.js`) and `CONTRACT.xpPerDay` (`core/contracts.js`) with a sim against a main job's growth. Target: a six-day expedition is worth about half a main job to each runner on it; a week on a post about the same. Main jobs stay the bigger teacher.
- **Save:** a growth list on each trip entry (bump `SAVE_VERSION`; `repairCrewsOut`, on the research branch, should default it).
- **Tests:** trips report growth; a graduation on a trip gets its message; the growth sim lands in a band; pace and death tests unchanged.

## Step 2. Experience and the level

- `gainXp` is the one place all growth passes through (jobs through `run.js grow`, side tasks, expeditions, posts). It adds the raw points it was given to `op.xp`, a lifetime total, before age and mentoring (the level counts work, not youth).
- `levelOf(op)` reads the level from `op.xp` against a curve: level 2 costs about four main jobs' worth (measured from a sim of careful play), each next level about 10% more. The curve is data in `data/builds.js` beside `LEVEL_UP`, so it can be tuned.
- Freelancers get no level (they don't get records or level-ups today).
- **Save:** `op.xp` on every runner (bump). An existing runner is seeded from `jobsWithCrew` (four jobs a level), so their level matches the work they've done.
- **Tests:** every kind of work adds experience; age and mentoring don't change it; the curve gives level 10 near 45 to 50 jobs in careful play; old saves seed sensibly.

## Step 3. A pick at every level

- A level reached sets `op.levelUp` (as today) with the level it's for.
- Levels 3, 6 and 9: the skill place for that level (move, payload, specialisation). If a skill for it is ready (`core/abilities.js skillMenu`), the pick is that skill; if not, a push now, and the place stays open until something's ready (shown on the Skills tab).
- Every other level from 2 to 9: a stat push.
- Picks wait as long as the player likes; several can stack (a long trip can fill two levels).
- **Save:** `op.levelUp` gains `level` and `kind` ('push' or 'skill'); `pickAt` goes (bump, migrated).
- **Tests:** the right kind of pick at each level; a skill level with nothing ready offers a push; picks never stack beyond the levels reached; hands-off and cautious runs never pick (the player always does).

## Step 4. The stat push

- `pushStat(op, stat)` in `core/development.js`: adds half of `pointCost(op.stats[stat], ceiling)` to `op.progress[stat]`, through `growStat`, so a push that completes a point raises the stat and is logged like any growth.
- At or past the ceiling `pointCost` is already six times larger (`WALL`), so half of the plain cost is a smaller share: "near the wall, it gives less" comes free.
- The pick offers every stat, with the scout's read in words ("room to grow", "near their wall"); never a number for the ceiling.
- **Tests:** a push moves progress halfway; it can't pass `MAX_STAT`; near the wall it moves less; the scout's read never shows the ceiling.

## Step 5. Veteran at level 10

- `promoteVeteran` reads the level (10), not main stat 16 and 50 jobs. Freelancers still never.
- The promotion waits for a ceremony: a message on Today and a button on the runner's page, reusing the oath's scene (`core/oath.js`, "Hold the ceremony"). The runner is a veteran once it's held.
- Mentoring (`mentorsOf`) is unchanged in shape: a veteran in the same role mentors rookies.
- **Tests:** veteran at level 10 whatever the main stat; the renown sim's veteran timing (`tests/fame.test.js`, `worth.test.js`) is updated with a design-log row; mentoring still meets its +0.75 bar.

## Step 6. The screens

From the mockup:
- L1, the runner's page: the level on the portrait, a bar under the header with the next level in words, and where the levels came from.
- L2, reports (jobs and trips): each runner's bar with this work's share lit; a level reached lights the card and carries the pick button.
- L3 and L4, the pick: a push or a skill; nothing on hover; 44px picks.
- L5, the ladder, on the Career tab.
- L6, the ceremony.
- The crew card and roster row show the level (and keep the level-up chevron).
- Screenshots (`npm run screenshots`) and the screenshot log, as for any look change.

## Numbers to set with sims, not guesses

- Raw experience per main job, per runner, in careful play (sets level 2's cost).
- The curve's growth per level (sets when level 10 lands: target 45 to 50 jobs).
- Trip growth per day (step 1: a six-day expedition about half a job).

## Not in this plan

Veteran levels past 10 (skill upgrades, titles): a design of their own, after this ships. A time-left read for "lately" trait gauges. Clean Professional's bar.
