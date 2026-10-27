# Handoff · 2026-10-27

Where the project stands and what to pick up next. Read `CLAUDE.md` first: its rules (architecture, tests, design log, changelog, screenshot log, commit author) are not repeated here. `DESIGN.md`'s decision log has the why for everything below, newest first.

## State

- **`main`:** up to [#20](https://github.com/MarcusW9/syndicate-manager/pull/20) (`6fbbb55`, squash-merged): squad-run slices 1 and 2. **Branch `claude/jolly-keller-6eqry7`** was restarted from `main` and carries slice 3.
- **The game is becoming the squad run** (`PLAN-CORE-LOOP.md`, the build order; `drafts/core-loop.md`, how we got there). **Slices 1-3 are built** (the engine; the squad board and the watch screen; Wheels and standby); slice 4 (sites and district text) is next.
- **Design review:** `STATE-OF-PLAY.md` (2026-10-26) and the owner's calls on it (in the file and in DESIGN.md). Read it instead of re-assessing.
- **Tests:** 263 passing. **Save format v22.**

## What the 2026-10-26/27 session did

- **Design review** (`STATE-OF-PLAY.md`) and the owner's calls: money pressure mostly positive (gear, rooms, clinic bills, tea money); morale cut for mood traits; burnout removed; neural load wired; approaches cost different things; heat per district; relationships as bonds and rifts with grief by personality; repetition layers; competing clients and danger parked. **None of these is built yet** except what slice 1 needed.
- **The core loop rethought:** manager first, with call-ins; build a squad for one of four approaches; incidents handled by the team; saves (overwatch, teammates); alert; specialisations (gear to try, experience to unlock, the player picks); guns standard in the canon (`WORLD.md`).
- **Prototypes** (`drafts/prototypes/`, published as artifacts): v1 plan-watch-report, then v2 with the squad board, coverage read, incidents, saves, alert, standby and an animated site-plan watch screen. The owner called v2 "pretty damn cool".
- **Slice 1 in the game:** `src/data/approaches.js`, `src/data/incidents.js`, `src/core/incidents.js`; `core/mission.js` gains zone and incident steps and `am.pending` decisions; `core/autorun.js` gains `autoStep` and `needsPlayer` (one stepper for live and hands-off runs); planning has four approaches, overwatch and "Call me in…"; the mission screen steps with Next. `tests/incidents.test.js` guards the rules.
- **Slice 2 in the game:** `core/squad.js` (coverage read, Joss's picks), `core/feed.js` (a run's events as watch cards), `ui/board.js` (dossier board, picker sheet, coverage), `ui/siteplan.js` (generic site plan and its animations) and `ui/watch.js` (the timed feed; while a job runs, `app.js` hands it each new state instead of re-rendering). Zones are recorded as events. Tests: `tests/squad.test.js`, `tests/feed.test.js`.
- **Slice 3 in the game:** Wheels (optional; takes every driving roll from the van) and standby (called in at max alert, where the alert stays up and they get a second save, or to rescue the badly hurt). Standby joins by being added to `am.crewIds`. Tests: `tests/standby.test.js`.

## Agreed rules worth remembering

- **No death without the player's choice**, now also: hands-off crews always extract; side tasks cost at most a light injury, heat or a day held; **incidents never go past a serious injury**; every decision a run stops for has an exit.
- **Traits never take a choice away:** downsides are penalties shown in the roll breakdown. At most **two temporary traits**; progress **hidden** until earned. Earning a temporary trait restarts its count (it can't flicker back).
- **Shown risk equals used risk:** any new modifier must appear in the risk read and the crisis read (as notes on `crewRoll`), as intel, traits, extra bodies and the alert do.
- **Randomness that shouldn't shift other dice** (weekly boards, arrivals) comes from `makeRng(seed ^ week)`, not `nextRng(state)`.
- **Crisis ids are unique** (a test checks). Renaming one needs a save migration (see v20).
- **Incidents teach nothing yet** (`XP.incident` 0) so the tuned growth pace holds; retune before raising it.
- **The planning reads use the run's own functions** (`coverage()` calls `handlerFor`/`bestSave`); add new incident modifiers there, never as a separate estimate.
- **The watch is UI-only pacing:** core still steps one move at a time (`autoStep`); never put timers or animation state in `src/core`.

## Next

1. **Merge the slice 3 PR** when the owner's happy with it.
2. **Squad run slice 4** (`PLAN-CORE-LOOP.md`): a site plan per district as data, and the incident text per district (writing task 11). Still open from slice 1: retune growth and earned traits for the loop.
3. Then slices 3-5 (Wheels and standby, sites and district text, gear and specialisations), and the agreed review items: the neural load and burnout cleanup, mood traits, money pressure, relationships with the career page.

## Writing pipeline (owner writes in other chats, pastes back)

`drafts/writing-tasks.md` holds a prompt per task; paste the `WORLD.md` context block first. Done: 1 (report lines), 2 (Container 409 log: go), 7 (stat unlocks), 8 (side tasks), 9 (traits). Waiting: 3-6 (log templates, district packs, Joss lines, authored beats) until real hands-off reports show what's missing; **10 (locked-district jobs) is the next useful one.** New: **11 (incident lines per district)** for the squad run; the Docks and Old Town first.

When a batch comes back: check every line against the game data (ids, costs, injury severity, success-only bonuses: the source dumps show them in brackets), house style ("badly hurt", "Pay -20%, heat +1.", one sentence, "someone" for injuries in focus crises), merge with a script, add a test, then report what was edited.

## Backlogs

- `drafts/earned-traits-backlog.md`: Typhoon Legs (weather), Back-Street Medic (clinic costs), Owes a Favour (client rescues), Hard Exit (rethink); Second Wind's neural half; Client's Favourite's "left out" rule.
- `drafts/crisis-situations-review.md`: the situation calls (owner skimmed; open to changes).
- `drafts/mission-log-prototype.md`: eight questions to check hands-off reports against in real play.
- `drafts/district-hooks.md`: crisis hooks for the locked districts.

## Parked (owner's call; don't start without asking)

- The fixer's backstory, rival crews, festivals calendar, street-language glossary.
- Retirement, scouts improving with experience, several live jobs at once.
- Hand-drawn faces for the named cast: **dropped** (2026-10-26).

## Working with the owner

- **Ask, don't assume,** on anything design-shaped. Multiple-choice questions with a recommended option work well; the owner often adds a twist in the free text. Lay out decisions with their consequences when asked.
- **Commits as `marcusw`** (CLAUDE.md). A stop hook asks for Claude-authored commits; the owner's rule wins. Merge commits pick up the default identity: amend them before pushing.
- **PRs:** the owner merges; open one per feature. Prefer one PR at a time against `main`; if stacking, see the gotcha below.
- **Screenshot sets** for visual changes (`npm run screenshots -- <slug>`); the script can't reach mid-game screens, so add 1x Playwright captures as extra numbered shots and say so in the README row.
- **Lore style:** narrative, second person, present tense in `WORLD.md`; in-game text 1-2 sentences, phone-first. Canon rules: English district names, Cantonese romanisation, everything invented, rumours never confirmed, Szeto suspected not proven.

## Environment gotchas

- `npm run build` needs `npm ci` first in a fresh container. `npm test` needs nothing.
- Browser checks: `npx vite --port 5174` in the background (`setsid`), then Playwright (pre-installed). Phone width 390.
- **Stopping the server:** `pkill -f "[v]ite --port 5174"`. Without the brackets the pattern matches the shell running it and kills the command (exit 144) before anything after it runs.
- **Force-push is denied** by the permission system. After a PR merges, branch fresh from `main` instead of resetting the old branch. When the session must reuse the same branch name (PRs here are squash-merged, so the old remote branch isn't an ancestor of `main`): restart from `main`, commit, then `git merge origin/<branch>` and keep your side (`git checkout --ours -- .`; check first that `git diff origin/main origin/<branch>` is empty), then push normally (done for slice 3).
- github.io isn't reachable from the container; check deploys with the GitHub Actions runs instead.
- **Stacked PRs don't retarget themselves** unless the lower PR's branch is deleted when it merges. On 2026-10-26 #14-#17 were merged into each other's branches instead of `main`, and #18 had to carry them over. Either ask the owner to delete each branch on merge, or after the bottom PR merges, retarget the next PR to `main` (`update_pull_request` with `base: main`) before it's merged.
