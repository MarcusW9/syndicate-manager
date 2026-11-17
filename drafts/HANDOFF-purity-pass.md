# Handoff: keep the core pure, and the UI honest about state (review items 12 and 13)

Written 2026-11-17 for a session that runs without the owner. Read `CLAUDE.md` first (the "Architecture (do not break)" block is the whole point), then `docs/ARCHITECTURE.md` section 1 ("Layering") and the "Update pattern" paragraph, then this. Source: `drafts/REVIEW-2026-11-13.md` items 12 and 13. Small chunk (an hour or two), no design calls, touches few files, so it can run beside the visual pass (it does not touch `fightstage.js` or `styles.css`).

## What is already true (re-check it, the review is four days old)

- **Item 12, "the UI edits the game state in place in three spots", looks already fixed.** `ui/actions.js` now marks a message read through the core: `markRead(state, id)` in `core/inbox.js`, handed to `setState` (lines near 111, 122, 307 and 420). `setState` (`ui/app.js`) is the one place the live state is set and saved. Your first job is to **prove** that, not to assume it: sweep `src/ui/` for any other write to the game state outside `setState` (a `state.x = ...`, a `.push`/`splice` on something that came from `state`, a core function called and its result thrown away, a `saveGame` call outside `setState` and `main.js`). `ui/fightscreen.js`'s `draft` is module-level UI state, not game state: it is fine. `V` (`ui/view.js`) is UI state: fine. Write down what the sweep found, even if it is nothing.
- **Item 13, the one clock read in `src/core`, is still there:** `core/state.js` line 41, `createNewGame({ seed = Date.now() % 2147483647, ... })`. That is the only `Date.now`/`Math.random` in `src/core` or `src/data` (checked 2026-11-17). It is harmless in play but breaks "core = game logic only, randomness through `core/rng.js`", and it is why `npm run screenshots` never gives the same game twice.

## The change

1. **Core takes the seed, never invents one.** `createNewGame` stops defaulting to the clock. Options, in order of preference: (a) the seed becomes a required argument and the two UI call sites pass it; (b) it defaults to a fixed constant (say `1`) so that a call without a seed is deterministic. Pick (a) if the tests allow it (only `tests/rules.test.js:91` calls it with no arguments); otherwise (b). Say which in the commit message.
2. **The UI passes the clock.** `src/main.js` (the first game) and `src/ui/actions.js` (the "new game" action near line 456) pass `seed: Date.now() % 2147483647`. That is the only place the clock may be read, and it is UI/boot code.
3. **Screenshots become repeatable.** `scripts/screenshots.mjs` and the capture scripts that call `createNewGame` without a seed should pass a fixed one (many already pass `seed: 21`). Check each: a script that relied on a random game for variety should keep its variety by taking `--seed` from the command line, defaulting to a fixed number.
4. **A test that keeps it pure.** Add `tests/purity.test.js`: read every file under `src/core/` and `src/data/` as text (strip comments and string contents first, or match on a code-only pass) and assert none contains `Math.random`, `Date.now`, `new Date(` (a date built from a number or string is allowed: grep first and list any that exist), `performance.now`, `localStorage`, `sessionStorage`, `document.`, `window.`, `navigator.`, `fetch(`, `setTimeout`, `setInterval`. `src/save/save.js` and `src/ui/` are the only places those belong. If a legitimate use turns up, do not weaken the test: move the use to the UI or the save layer, or, if that truly cannot be done, add that one file to a short named allowlist in the test with a comment saying why.
5. **A test for the other half.** The same test file (or one beside it) asserts the update pattern: `setState` is the only caller of `saveGame` in `src/ui/` (read the files as text and count), and `src/ui/` contains no assignment into `state.`. It is crude but it fails loudly if someone adds a shortcut later.

## Checks

- `npm test` passes, including the screenshot determinism: run `npm run screenshots -- purity-check` twice and compare two images of the first screen (they must now match byte for byte, or differ only by anything that is a time of day; if any differ, find the clock read and report it, do not hide it).
- A save made before this change loads and plays the same: the seed is stored in the state (`state.seed`), so nothing about old saves depends on how a new game's seed was chosen. Confirm by reading `core/state.js` and `save/save.js`, then by loading a v76 save in `tests/` (an existing save test does this).
- Docs: the review file's items 12 and 13 get a "fixed 2026-xx-xx" line (the review says "nothing here is fixed"; add the dates, do not rewrite it); a changelog entry (`docs/changelog/`, newest file, top); a design-log row if you chose (b) over (a) (`docs/design/`, newest file, top); `CODEMAP.md`'s `core/state.js` line if the signature changed.
- Commits under the owner's name only (`CLAUDE.md` "Commits"). One commit for the seed change, one for the tests.

## What not to do

- Do not touch anything under "Waiting on the owner" in `HANDOFF.md`.
- Do not open a PR into `main` while another PR is unmerged (#194 is open at the time of writing); push to a branch and leave the PR for the owner.
- Do not rewrite `core/rng.js` or any roll. The only behaviour change allowed is where a new game's seed comes from.

## Done when

The core and data folders contain no clock, no `Math.random`, no storage and no DOM; the UI passes the seed; `setState` is the only writer; the two new tests pass; and the review's items 12 and 13 say fixed.
