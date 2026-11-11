# Plan: building the battle rework (threats, goals and orders)

Status: **ready to build** (2026-11-11). The design is `drafts/SPEC-battle-orders.md` (read section 30
first: what is settled), the numbers `drafts/NUMBERS-battle-orders.md`, and the rules as they were
played in Step 0 `scripts/sim-step0.mjs` (profile `medic`; the reference implementation of every rule
below, standalone and simplified). The decision log rows are in `docs/design/2026-11.md`
(2026-11-10 and 2026-11-11). The session handoff is `drafts/HANDOFF-battle-rework.md`.

One PR per slice; the owner merges. **Slice 1 is split into three PRs (owner, 2026-11-11):** 1a endurance
(done: the stat, recruits, wages, save v61, which also tags fights in progress `engine: 1`); 1b the engine
on its own with its tests, not wired to any job (1b-1c below); 1c wiring it into the five jobs, call-ins,
the death rule and **battle growth** (1d-1h below). A review pass before each merge. Run `npm test` before every push. Never loosen a test.

## Principles for every slice

- **Engine 2 sits beside engine 1.** Today's fights (`core/battle.js`, `core/runbattle.js`, the
  orders panel) keep running everything that is not one of the five chosen jobs, and raids. New code:
  `core/fight.js` (rules: build, telegraph, resolve orders, play a round, previews, odds) and
  `core/runfight.js` (the run's side: start, call-ins, end), data in `data/fights.js` (`FIGHT`
  tuning, `ENEMIES`, `ENEMY_HIT`, `THREATS`, `FIGHTS`, `CLOCKS`, `SITE_ENEMIES`, `COUNT_BY_THREAT`)
  and `data/dilemmas.js`; wording in `data/fightText.js`. Choose names that read well; keep the split.
- **Port from the sim, don't reinvent.** `scripts/sim-step0.mjs` is the tested shape of every rule
  (telegraph, `resolveOrders` with reservations and door slots, shields by chance x pips, contested
  boarding, carrying and climbing back out, the van and its hold, bleeding, the medic's aura, the
  standby and overwatch). The game version adds what the sim skips: real gear, real stats with notes,
  shown = used previews, the run's RNG, saves, call-ins and the UI.
- **RNG:** the fight draws through the run's existing stream (`nextRng(state)`, as `runbattle.js`
  does) so `state.rngCounter` behaves as today. Previews, "if nothing" and dilemma checks never draw.
- **Shown = used:** every chance on screen comes from the same function the round uses; the planning
  read's `fightOdds` runs `playRound` on fixed seeds.
- **Wording pauses for the owner** (spec section 30): any text-heavy step writes a brief in
  `drafts/writing-tasks.md` (ids, slots, counts, examples of house style, where each line shows) and
  stops; use short placeholder keys in `data/fightText.js` until the text comes back.

## Slice 1: the engine and endurance (save v61)

**1a. Endurance, the eighth stat.**
- Add `endurance` wherever the stats are listed: `core/development.js` `STATS` (growth and age
  decline then work as for every stat), `core/dossier.js`, `core/rating.js`, `core/recruits.js`
  `STAT_KEYS`, `core/jobcheck.js`, `data/operatives.js` (the named starting crew), `src/ui/tongs.js`
  and the stat tiles in `src/ui/app.js`, `tests/development.test.js`. `grep -rn "'medical', 'cool'"`
  finds the lists.
- Generation like the other stats: in `data/recruitPools.js` `ROLE_PROFILES`, muscle's secondaries
  become `['endurance', 'cool']` (piloting drops to a low stat); every other role has it as a low
  stat. A pro muscle rolls about 9-12, a veteran 10-14 (the owner's "solid muscle 12-13"; the best
  19-20 come from growth).
- Wages: `core/pricing.js marketWage` sums every stat, so scale `ECONOMY.wage.perStat` down so the
  average wage stays where it is today (check with `scripts/sim-tong.mjs` or the fame sim's cash
  band, and say the before and after in the PR).
- Not a crisis or incident stat yet (its off-fight uses come later); it shows on the runner's page.
- Migration: every operative, free name and rival card gets a seeded endurance generated the way
  their other stats were (rival cards are built from a hash in `core/dossier.js`: add it there).

**1b. Data. (Built: `data/fights.js`, `data/dilemmas.js`, `data/fightText.js`; the five jobs' `fightType` is `FIGHT_JOBS` in `data/fights.js`, to be read by 1c.)** `data/fights.js` with the settled numbers (numbers sheet section 13 and spec section
30): pips = max(3, endurance / 2), light wound -2, enemies and shots by kind, cover, steps, risk
thresholds, door slots 3, van wait 4, hold 2 rounds +1 heat, bleeding 10% from the second round,
patch 1, the medic's aura, overwatch (one shot at the van), standby at the van, clocks and deadlines.
`data/dilemmas.js` with `techUnderFire` (settled trigger) and `vanCantWait`, wording as placeholder
keys. The five jobs get `fightType` (`data_pull`, `data_scrub`, `quiet_hours` holdHack;
`warehouse`, `protection` holdExtract).

**1c. Rules (`core/fight.js`). (Built in the 1b PR, with `tests/fight.test.js`; the run's side below is the next PR.)** `buildFight`, `telegraph`, `resolveOrders` (precedence, usefulness,
reservations, default orders, stage-aware orders, the safety and medic rules), `playRound` returning
the round result (spec section 19) with each line naming its order, `previewRound` (shown chances,
"if nothing", no RNG), `fightOdds` (cached). Gear: sidearm damage sets the strong-hit margin, pierce
is `ap`, vest tiers absorb 1 or 2 hits, aim bonuses count.

**1d. The run (`core/runfight.js`, `core/mission.js`). (Built in the 1c PR; see the decision row "Engine 2 wired into the five jobs" for what was decided, what is not built (the deadline call-in, a round screen, battle growth) and why.)** When a fight starts on a job with
`fightType`, build an engine-2 fight (`am.battle.engine = 2`); everything else stays engine 1.
Call-ins through the existing `am.pending` / `describePending` / `resolvePending` path: death's door
(watched), the deadline, `vanCantWait`, `techUnderFire`, pull back; hands-off answers by risk
(cautious and steady pull back at a critical and hold the van; committed fights on and lets the van
go). `autorun.js needsPlayer` and the away-job day rules as spec section 30. Left behind in slice 1:
mark the runner missing for 7 days, back with a serious injury (slice 4 adds rescue, ransom and the
death chance). **Battle growth (owner, 2026-11-11):** endurance is rolled nowhere else, so engine-2 fights award it
growth points at the fight's end (through `development.js applyGrowth`, like a job's XP), which is how the
19-20 bodies come about; the amounts are tuned in slice 3's sim (propose numbers, ask the owner).
Fight end: pips left become the injury (light below half, serious below a quarter,
down = critical), the career `defeated` count, heat.

**1e. The death rule.** Update `CLAUDE.md`'s design rule to "death only follows a risk the player
accepted and was shown", and the death tests to: no death on cautious or steady without push on;
every death follows push on, a hand-ordered withdrawal or committed risk; the shown chance of a
death equals the played one. Log it (a decision row exists: 2026-11-11; add the "built" row).

**1f. Save v61.** `SAVE_VERSION` 61 in `core/state.js`, a migration in `src/save/save.js`
(endurance; fights in progress tagged `engine: 1`), a migration test.

**1g. Tests** (spec section 23), a new `tests/fight.test.js`: determinism; previews never draw;
precedence and usefulness; reservations (a partial attack never answers a shot); shields one shot and
resolve against the protector; hunker never cancels; hack progress only for rounds worked; no
extraction before the van; the van hold; carrying; the medic's aura and stabilising; bleeding only on
committed; pips from endurance with the floor; the five jobs start engine-2 fights and finish.

**1h. Docs.** `CODEMAP.md` (where engine 2 lives and how a fight flows), `docs/ARCHITECTURE.md`
(state shape), `CHANGELOG.md`, a decision row for anything decided while building.

**Stop for the owner:** none needed for the rules; the placeholder wording is fine in slice 1 because
the screens come in slice 2.

## Slice 2: the screens

- **Plan screen** (`ui/board.js`, the squad board): the fight type line, likely enemy kinds, gaps
  ("No jammer: radio calls can only be stopped by attacking the caller"), who can jam and whether it
  stops the hack, each runner's order (duty, target, per stage), their pull-out threshold, the risk
  picker ("Committed: fights on with someone down; can cost a life"), specials, the chance of losing
  someone.
- **Round screen** (the fight view: `ui/fightorders.js`, `ui/siteplan.js`, `ui/watch.js`): goal track
  and clocks, enemies (kind, pips, threat with target, chance and pips), runners (pips, order, this
  round's intended action, exposure), the "if nothing" line, Next round / Change orders / Specials /
  Pull back. Phone first (360 px), 44 px taps, nothing on hover only.
- **Call-ins:** what changed, what the crew intends, the trade-off, Carry on, Pull back; the van
  call shows who is outside and the odds of leaving them.
- **Report:** one cause line and the full log with rolls.
- **Stop for the owner: wording.** Write the brief (feed lines by action and outcome, "if nothing"
  phrasing, threat words, dilemma and call-in text, risk picker, report cause lines) in
  `drafts/writing-tasks.md` and pause.
- Screenshots (`npm run screenshots -- battle-orders`, plus 1x Playwright captures of the mid-fight
  screens; README row), CHANGELOG.

## Slice 3: the sims on the real code

- `scripts/sim-orders.mjs` against the gate in spec section 24, with the tolerances in the numbers
  sheet section 11 and the bar at 7 points or 0.3 downs, declared in the script before the run.
- Include mid-fight adapting: call-in answers (the van hold, `techUnderFire`) and Take Command at
  round boundaries (a small fixed set of between-round order changes), so the gate measures what
  Step 0 could not.
- Also report deaths per risk level (target: none on cautious and steady; about one in 25 committed
  fights), the toughness check, dilemma frequency.
- Results and the declared targets in CHANGELOG; a decision row with the verdict.

## Slice 4: left behind

- A missing runner's card: days left, and the three ways through with their odds.
- **Ransom** through the fixer (3 weeks of their wage; back next day, light injury).
- **Rescue job:** appears within a day, a holdExtract-style fight at the place they were left;
  success brings them back with their injury. **Stop for the owner:** the rescue job's brief and
  lines, the missing card and ransom text.
- **Waiting:** at day 7, back with a serious injury, or the shown 10% that they don't come back.

## After the slices

1. **The playtest** (spec section 28): holdHack then holdExtract, once commanded, once hands-off with
   a call-in; attribution, tension, trust.
2. The owner's calls from it: one-off per-runner actions, more fight types and jobs (Kidnap Rescue
   with an Old Town enemy list), raids on engine 2 (`defendHall`), retiring engine 1.
3. Endurance's off-fight uses (fatigue, healing, away-job stamina), then **leadership and judgment as
   stats** (owner, 2026-11-11: on the 1-20 scale, in wages and the rating, judgment hidden behind
   words, grown from the record, little decline with age; `drafts/PROPOSAL-leadership.md`, with the
   hooks in spec section 16), with their own migration and wage rescale, then `scripts/sim-stats.mjs`
   again for the new stats.
