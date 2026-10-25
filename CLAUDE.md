# Project rules

Text-first crew management game (Football Manager style, endless). Plain JavaScript + Vite. Hosted on GitHub Pages; will be wrapped for iOS later.

## Architecture (do not break)
- `src/core/` = game logic only. No DOM, no `localStorage`, no `window`. Functions take state and return new state.
- `src/ui/` = the only code that touches the DOM.
- `src/save/save.js` = the only code that touches storage. iOS swaps its three storage functions.
- `src/data/` = content as data (operatives, traits, missions). No game logic here.
- `src/config/names.js` = all placeholder names (title, city, districts). Rename there only.

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

## Keep the design log current
`DESIGN.md` holds the narrative, tone, cast and a dated decision log (decision, why, rejected alternatives). The world's lore and the context block for worldbuilding prompts live in `WORLD.md`; canon changes there still get a DESIGN.md log row. Whenever a design or technical decision is made or changed in a session, add a row to the top of the log in the same change. Never rewrite past entries; supersede them with a new row. New rows go under `## Decision log`, not the first table in the file (that's the cast table).

## Tests
Run `npm test` before every push. The tests encode the design promises in DESIGN.md (no death without "push on", exits always save everyone, saves upgrade). Never loosen a test to make a change pass; if a rule changes on purpose, update the test and log the change in DESIGN.md.

## Keep the changelog current
Every change that ships gets an entry at the top of `CHANGELOG.md` (date, what changed, in plain words). DESIGN.md says why; CHANGELOG.md says what.

## Commits
Author and committer: `marcusw <160358373+MarcusW9@users.noreply.github.com>` (set both, e.g. `git -c user.name=marcusw -c user.email=160358373+MarcusW9@users.noreply.github.com commit`). Never use the personal Gmail address; the repo is public. No `Co-Authored-By`, `Claude-Session` or "Generated with" lines in commit messages or PRs: the owner wants every commit under their name only. Big features get their own commit with a clear message.

## Design doc
Core loop: https://claude.ai/artifact/W38zoiZvsjL9vt78jKXgxN
