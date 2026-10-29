# Code map

Where things live and how a run flows, so you can read a few functions instead of whole files. Rules (architecture, tests, docs, commits) are in `CLAUDE.md`; status and what's next in `HANDOFF.md`; why each choice was made in `DESIGN.md`. Keep this file short and current: when you move something, fix its line here.

## Layers (from CLAUDE.md)
- `src/core/` game logic, pure: state in, new state out. `src/ui/` the only DOM. `src/save/save.js` the only storage. `src/data/` content as data. `src/config/names.js` all placeholder names.
- Every roll is `d20 + stat >= 10 + difficulty` (`core/risk.js` `successChance`). Randomness: `nextRng(state)` (`core/random.js`, moves the state's counter) or `makeRng(seed)` (`core/rng.js`, doesn't). Never `Math.random()` in core.

## The run, in order
`startMission` builds `am` (the active mission, `state.activeMission`): a **queue** of steps, `beat | zone | incident | crisis | battle`, and `am.step` points at the next one. One function per step type, all returning a new state:

| Step | Function | File |
| --- | --- | --- |
| beat | `revealBeat` | `core/mission.js` |
| zone | `enterZone` | `core/mission.js` |
| incident | `runIncident` (roll, save, cost; an unsaved danger incident starts a fight) | `core/mission.js` |
| battle | `runBattle` (one round, then `afterRound`); a loud run's first guard always starts one (`loudFightDue`, `core/battle.js`) | `core/runbattle.js` |
| crisis | `describeCrisis` / `chooseOption` (the player's or the orders' choice) | `core/mission.js` |
| critical | `describeCritical` / `resolveCritical` (stabilise, extract, push on) | `core/mission.js` |
| call-in | `describePending` / `resolvePending` (`am.pending`: `alert`, `injury`, `door`, `standoff`) | `core/mission.js` |
| end | `finish` (pay, heat, reputation, growth, report), then `closeMission` | `core/mission.js` |

`core/autorun.js` `autoStep` takes the next step the crew can take on its own; `needsPlayer` says when to stop for a call-in; `autoRun` plays a whole hands-off job. `core/mission.js` sections are marked `// --- name ---`; `grep -n "^// ---"` finds them.

## Core files
- `mission.js` the run engine above. `run.js` shared helpers (who's on the job: `actors`, `crewOf`, `overwatchOp`...; `record`, `grow`). `runbattle.js` a fight's side of the run (start, call-ins, pulling back). `battle.js` a fight's rules: `playRound`, `battleOdds`, HP and armour. `incidents.js` incident rules, saves, `decisionChoices`, `ordersDecision`. `autorun.js` standing orders and hands-off.
- `squad.js` the planning read (`coverage`, `jossPicks`, `leanPicks`, `jobRead`): uses the run's own functions, so shown risk equals used risk. `risk.js` odds and labels. `crew.js` effective stats, `crewRoll`, injuries. `gear.js` stash, loadouts, overwatch kits. `specialisations.js`, `earned.js` (earned traits), `development.js` (growth, mentoring, age).
- World: `jobs.js` (board, offers), `clients.js`, `heat.js`, `rumours.js`, `recruits.js`, `freelance.js`, `sidetasks.js`, `renewals.js`, `loyalty.js`, `time.js` (the day tick), `state.js` (new game, `SAVE_VERSION`), `report.js` (the report summary), `feed.js` (a run's events as watch cards), `upcoming.js` (Today's list).

## The watch screen
`ui/watch.js` runs the feed on a timer and hands each new card's `cue` to `ui/siteplan.js`, which plays it on the site map; a fight's cue is `cue.battle` (`phase`, both sides' health, the round's `lines`), played by `fight()` in `siteplan.js`. `core/feed.js` builds the cards and cues from `am.events`.

## Site maps
`data/sites.js`: plain sites, and districts drawn as parts (`PLOTS`: a plot with approaches, covers and targets; a target with `jobs` is that job's own place). `pickSite(district, jobId, templateId)` picks the parts from the job's id (stable, nothing stored) and `assemble()` makes them a site. Picture only: the core never reads a site. `ui/siteplan.js` draws it. `node scripts/preview-sites.mjs <district>` draws every combination; `tests/sites.test.js` checks each (geometry, routes clear of cover, a job's own target).

## Events and the record
Everything that happens in a run is `record(am, event)` into `am.events`. `feed.js` turns events into watch cards; `report.js` and the report's full log (`ui/app.js` `renderFullLog`) read the same events. A new kind of moment needs its event, a card in `feed.js` and a line in `renderFullLog`.

## Adding things
- **A call-in (pending kind):** `decisionChoices` and `ordersDecision` (`incidents.js`), `describePending` and `resolvePending` (`mission.js`), the title in `ui/app.js` (search `calling in`), a test that it has an exit.
- **An incident:** `data/incidents.js` (and `ZONE_POOLS`), district lines in `data/districtIncidents.js`; `tests/incidents.test.js` checks the shape.
- **Gear:** `data/gear.js`; the rules read it in `core/gear.js` (and `core/battle.js` for fights).
- **Changing the state's shape:** bump `SAVE_VERSION` in `core/state.js` and add a migration in `save/save.js`.
- **A roll modifier:** it must show in the roll's notes and in the planning read (`coverage`), or the shown risk lies.

## Tests and scripts
- `npm run test:fast` (about 40 s: all but four slow files, see `scripts/test-fast.mjs`) while working; `npm test` (about 2 min) before every push. `tests/play.js` has the helpers (`playMission`, `toCrisis`, `arm`, the policies).
- Tuning sims: `scripts/sim-growth.mjs`, `sim-traits.mjs`, `sim-early-game.mjs`, `sim-battles.mjs`. Screenshots: `npm run screenshots -- <slug>`.
