# Project rules

Text-first crew management game (Football Manager style, endless). Plain JavaScript + Vite. Hosted on GitHub Pages; will be wrapped for iOS later.

## Architecture (do not break)
- `CODEMAP.md` says where things live and how a run flows: read it before reading `src/core/` files, and keep it current when you move things.
- `src/core/` = game logic only. No DOM, no `localStorage`, no `window`. Functions take state and return new state.
- `src/ui/` = the only code that touches the DOM.
- `src/save/save.js` = the only code that touches storage. iOS swaps its three storage functions.
- `src/data/` = content as data (operatives, traits, missions). No game logic here.
- `src/config/names.js` = all placeholder names (title, city, districts). Rename there only.

## Where to read for a task
| Working on | Read first |
| --- | --- |
| Anything in `src/core/` | `CODEMAP.md` |
| State shape, saves, economy loop, tests, how things connect | `docs/ARCHITECTURE.md` |
| A job, crisis or beat (content) | `src/data/missions/<job>.js`, then `core/validate.js` and `core/jobcheck.js` for the rules it must meet (`node scripts/check-job.mjs <file>`) |
| A run's flow, `finish()`, pay/heat/reputation | `CODEMAP.md` "The run, in order", then `core/mission.js` |
| Planning read, risk numbers | `core/squad.js`, `core/risk.js` |
| Traits, growth, specialisations | `data/earnedTraits.js`, `core/earned.js`, `core/development.js` |
| Side tasks, hands-off runs | `core/sidetasks.js`, `core/autorun.js` |
| Changing the save shape | `src/save/save.js` (`migrate`) and `SAVE_VERSION` in `core/state.js` |
| Where content sits across tabs (sitemap) | `docs/SCREENS.md` |
| Any screen or style | "UI skin" in `ART.md`, newest `docs/screenshots/` set, `ui/app.js`, `ui/board.js` |
| Writing in-game text, lore, names | `WRITING_GUIDE.md`, `src/config/names.js`, and from `WORLD.md` only the context block at its end plus the one `##` section the text is about (the whole file only when changing canon); any change to canon goes through the `add-lore` skill (`.claude/skills/add-lore/`), which reads all of it |
| Why something was decided | `DESIGN.md` decision log (grep the topic; rows may be under `docs/design/`) |
| What shipped / what's next | `CHANGELOG.md` / `HANDOFF.md` (`STATE-OF-PLAY.md` is a 2026-10-26 snapshot) |

## iOS-ready rules
- No information that only appears on hover. Tap/click to reveal.
- Design at phone width first (360-430px), then widen.
- Tap targets at least 44px tall.
- Respect safe areas (`env(safe-area-inset-*)`).
- Randomness goes through `core/rng.js` (seeded), never `Math.random()` in core.

## Design rules
- Every crisis has an `abort` or `extract` choice. Death only follows a choice the player made.
- Operatives are always 18+.
- Bump `SAVE_VERSION` in `core/state.js` and add a migration in `save.js` whenever the state shape changes.

## Before any UI work or mockup
- Read the "UI skin" section of `ART.md` and look at the newest set in `docs/screenshots/` (its README lists them, newest first). That is the current look: sharp panels with a cut corner, Rajdhani for structure, no rounded cards.
- In `src/ui/styles.css` the first `:root` block is the old plain look; the street-terminal skin further down (search "Skin: street-terminal") overrides its colours and shapes. Read both before borrowing a token.
- Main jobs are planned on the squad board (`src/ui/board.js`: approach, inside team, outside, Joss's picks, the coverage read). The checkbox picker in `renderSidePlan` is only for side work; don't model new screens on it.

## Keep the design log current
`DESIGN.md` holds the narrative, tone, cast and a dated decision log (decision, why, rejected alternatives). The world's lore and the context block for worldbuilding prompts live in `WORLD.md`; the visual style, art rules and art prompts live in `ART.md`; canon changes there still get a DESIGN.md log row. Whenever a design or technical decision is made or changed in a session, add a row to the top of the log in the same change. Never rewrite past entries; supersede them with a new row. The log is split by date into `docs/design/`; new rows go at the top of the newest file there (listed under `## Decision log` in `DESIGN.md`), not in the cast table.

## Tests
Run `npm test` before every push. The tests encode the design promises in DESIGN.md (no death without "push on", exits always save everyone, saves upgrade). Never loosen a test to make a change pass; if a rule changes on purpose, update the test and log the change in DESIGN.md.

## Keep the changelog current
Every change that ships gets an entry at the top of `CHANGELOG.md` (date, what changed, in plain words). DESIGN.md says why; CHANGELOG.md says what.

## Keep the screenshot log current
`docs/screenshots/` is the visual history of the game (index and how-to in its `README.md`). After any change that alters how the game looks, run `npm run screenshots -- <slug>` and add a row to the top of the README's Versions table in the same change. Screenshots the owner shares in a session go into their own `<date>-owner-captures` folder with a row of their own. Never delete or overwrite an old set; that's the history.

## Commits
Author and committer: `marcusw <160358373+MarcusW9@users.noreply.github.com>` (set both, e.g. `git -c user.name=marcusw -c user.email=160358373+MarcusW9@users.noreply.github.com commit`). Never use the personal Gmail address; the repo is public. No `Co-Authored-By`, `Claude-Session` or "Generated with" lines in commit messages or PRs: the owner wants every commit under their name only. Big features get their own commit with a clear message.

## Design doc
Core loop: https://claude.ai/artifact/W38zoiZvsjL9vt78jKXgxN
