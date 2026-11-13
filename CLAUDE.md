# Project rules

Text-first crew management game (Football Manager style, endless). Plain JavaScript + Vite. Hosted on GitHub Pages; will be wrapped for iOS later.

## Architecture (do not break)
- `CODEMAP.md` says where things live and how a run flows: find a file's line there before reading it, and keep the map current when you move things.
- `src/core/` = game logic only. No DOM, no `localStorage`, no `window`. Functions take state and return new state.
- `src/ui/` = the only code that touches the DOM.
- `src/save/save.js` = the only code that touches storage. iOS swaps its three storage functions.
- `src/data/` = content as data (operatives, traits, missions). No game logic here.
- `src/config/names.js` = all placeholder names (title, city, districts). Rename there only.

## Where to read for a task
Read the smallest thing that answers the question: grep for a file name or topic before opening a whole doc.

| Working on | Read first |
| --- | --- |
| A file in `src/core/` or `src/ui/` | Its line in `CODEMAP.md` (`grep -n "<name>.js" CODEMAP.md`; one file per line) |
| A run's flow, `finish()`, pay/heat/reputation | `CODEMAP.md` "The run, in order"; `docs/ARCHITECTURE.md` section 5 "The finish function"; then `core/mission.js` |
| State shape (root, a runner, a job in progress) | `docs/ARCHITECTURE.md` sections 2, 3 and 5 |
| The day tick, the week, money and heat | `docs/ARCHITECTURE.md` section 4 |
| Changing the save shape | `docs/ARCHITECTURE.md` section 8, the newest blocks of `migrate` in `src/save/save.js`, `SAVE_VERSION` in `core/state.js` |
| Tests, sims, helpers | `CODEMAP.md` "Tests and scripts"; `docs/ARCHITECTURE.md` section 10 |
| Fights (both engines) | `docs/BATTLES.md` |
| A job, crisis or beat (content) | `src/data/missions/<job>.js`, then `core/validate.js` and `core/jobcheck.js` for the rules it must meet (`node scripts/check-job.mjs <file>`) |
| Planning read, risk numbers | `core/squad.js`, `core/risk.js` |
| The other tongs (rivals, free names, scouting, buyouts, rival offers) | `docs/RIVAL-TONGS.md` |
| Traits, growth, specialisations | `data/earnedTraits.js`, `core/earned.js`, `core/development.js` |
| Side tasks, hands-off runs | `core/sidetasks.js`, `core/autorun.js` |
| What is on which tab | `docs/SCREENS.md` "Tabs" and "Inside each screen" |
| Any screen or style | `docs/UI-SKIN.md` (the token table, then the bullet for that screen), the newest `docs/screenshots/` set, `CODEMAP.md` "UI files" for the function that draws it |
| Writing in-game text, lore, names | `WRITING_GUIDE.md`, `src/config/names.js`, and from `WORLD.md` only the context block at its end plus the one `##` section the text is about (the whole file only when changing canon); any change to canon goes through the `add-lore` skill (`.claude/skills/add-lore/`), which reads all of it |
| Why something was decided | Grep the topic in `docs/design/` (the decision log; index in `DESIGN.md`) |
| What's next / what shipped | `HANDOFF.md` / grep `docs/changelog/` (never read a whole month) |

## iOS-ready rules
- No information that only appears on hover. Tap/click to reveal.
- Design at phone width first (360-430px), then widen.
- Tap targets at least 44px tall.
- Respect safe areas (`env(safe-area-inset-*)`).
- Randomness goes through `core/rng.js` (seeded), never `Math.random()` in core.

## Design rules
- Every crisis has an `abort` or `extract` choice. Death only follows a risk the player accepted and was shown: pushing on at death's door, a withdrawal ordered by hand, or (in the new fights, `core/fight.js`) the **committed** risk level, which fights on with someone down and says so where it is picked. Cautious and steady crews never lose anyone without a call-in.
- Operatives are always 18+.
- Bump `SAVE_VERSION` in `core/state.js` and add a migration in `save.js` whenever the state shape changes.

## Before any UI work or mockup
- Read `docs/UI-SKIN.md` and look at the newest set in `docs/screenshots/` (its README lists them, newest first). That is the current look: sharp panels with a cut corner, Rajdhani for structure, no rounded cards.
- In `src/ui/styles.css` the first `:root` block is the old plain look; the street-terminal skin further down (search "Skin: street-terminal") overrides its colours and shapes. Read both before borrowing a token.
- Main jobs are planned on the squad board (`src/ui/board.js`: approach, inside team, outside, Joss's picks, the coverage read). The checkbox picker in `renderSidePlan` is only for side work; don't model new screens on it.

## Keep the design log current
`DESIGN.md` holds the narrative, tone, cast and a dated decision log (decision, why, rejected alternatives). The world's lore and the context block for worldbuilding prompts live in `WORLD.md`; the visual style, art rules and art prompts live in `ART.md` (the UI skin in `docs/UI-SKIN.md`); canon changes there still get a DESIGN.md log row. Whenever a design or technical decision is made or changed in a session, add a row to the top of the log in the same change. Never rewrite past entries; supersede them with a new row. The log is split by date into `docs/design/`; new rows go at the top of the newest file there (listed under `## Decision log` in `DESIGN.md`), not in the cast table.

## Tests
Run `npm test` before every push. The tests encode the design promises in DESIGN.md (no death on cautious or steady without "push on", and every death follows push on, a hand-ordered withdrawal or committed risk; exits always save everyone; saves upgrade). Never loosen a test to make a change pass; if a rule changes on purpose, update the test and log the change in DESIGN.md.

## Keep the changelog current
Every change that ships gets an entry at the top of the newest file in `docs/changelog/` (date, what changed, in plain words; `CHANGELOG.md` is only the index). DESIGN.md says why; the changelog says what.

## Keep the screenshot log current
`docs/screenshots/` is the visual history of the game (index and how-to in its `README.md`). After any change that alters how the game looks, run `npm run screenshots -- <slug>` and add a row to the top of the README's Versions table in the same change. Screenshots the owner shares in a session go into their own `<date>-owner-captures` folder with a row of their own. Never delete or overwrite an old set; that's the history.

## Commits
Author and committer: `marcusw <160358373+MarcusW9@users.noreply.github.com>` (set both, e.g. `git -c user.name=marcusw -c user.email=160358373+MarcusW9@users.noreply.github.com commit`). Never use the personal Gmail address; the repo is public. No `Co-Authored-By`, `Claude-Session` or "Generated with" lines in commit messages or PRs: the owner wants every commit under their name only. Big features get their own commit with a clear message.

## Design doc
Core loop: https://claude.ai/artifact/W38zoiZvsjL9vt78jKXgxN
