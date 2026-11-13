# Handoff: make future sessions cheaper (docs and module restructure)

Paste everything below the line into a new session (best on the strongest model you have).

---

## Goal

Make every future session on this repo cheaper and faster: fewer tokens read to find the right file, the current state and the rules. **Do not change how the game plays or looks, and do not slow the App Store release.** This is housekeeping that should make the iOS work easier, not a rewrite.

Read `CLAUDE.md` first and follow all of it (tests, changelog, design log, commit author, no attribution lines).

## Why

Measured 2026-11-13 (rough tokens at ~4 chars each):

| File | Size | Problem |
| --- | --- | --- |
| `CHANGELOG.md` | 192 KB (~48k) | One file; every session adds to its top |
| `src/ui/app.js` | 238 KB (~60k) | Nearly every UI task opens it |
| `src/ui/art.js` | 146 KB (~36k) | Art tasks open all of it |
| `WORLD.md` | 104 KB | Already read by section; leave as is unless step 2 finds overlap |
| `ART.md` | 55 KB | UI tasks only need its "UI skin" section |
| `docs/SCREENS.md` | 52 KB | Check for overlap with `CODEMAP.md` |
| `HANDOFF.md` | 27 KB | Meant as "state now", has grown into a history |
| `CODEMAP.md` | 27 KB | Read before every core task |

Re-measure before starting; the numbers may have moved.

## Before you start

- List open branches and PRs. The battle rework (`drafts/HANDOFF-battle-rework.md`, `drafts/PLAN-battle-slices.md`) may be in flight; its slice 2 touches the UI screens. **If it is in progress, do steps 1-2 only and leave step 3 until it has merged**, so the split doesn't cause large conflicts.
- Run `npm test` and note the pass count. It must match at the end of every step.

## Steps (one PR each, in this order; stop after each and report to the owner)

### Step 1: trim the always-read docs (docs only)
- `HANDOFF.md`: cut to one screen: current state, what's next, open branches, and the agreed rules that are still live. Move the session histories into `docs/handoff-archive.md` (moved word for word, not rewritten).
- `CHANGELOG.md`: split by month like the design log (`docs/changelog/2026-11.md` etc.). `CHANGELOG.md` becomes a short index pointing at the newest file, and the `CLAUDE.md` rule changes to "add the entry at the top of the newest file in `docs/changelog/`". Move entries word for word.
- `ART.md`: move the "UI skin" section into its own file (e.g. `docs/UI-SKIN.md`) and leave a pointer in `ART.md`. Update every reference to it (`CLAUDE.md`, skills in `.claude/skills/`, `docs/`).
- Mark `STATE-OF-PLAY.md` clearly as an archived snapshot, or move it under `docs/`, so sessions don't read it by default.

### Step 2: one fact, one home (docs only)
- Find facts repeated across `HANDOFF.md`, `CODEMAP.md`, `docs/ARCHITECTURE.md`, `docs/SCREENS.md` and `STATE-OF-PLAY.md`. Keep each in the file whose job it is (`CODEMAP` = where code lives and how a run flows; `ARCHITECTURE` = state shape, saves, economy, tests; `SCREENS` = what's on which tab; `HANDOFF` = now and next) and replace the copies with a link.
- Rewrite the "Where to read for a task" table in `CLAUDE.md` so each row points at the smallest file or section that answers it. Keep `CLAUDE.md` itself short; it's loaded into every session.
- Never rewrite decision-log rows or canon. Moving is fine; rewording is not.

### Step 3: split the big UI files (code; behaviour must not change)
- Split `src/ui/app.js` into one module per screen or area (Today, City, Roster, the job screen, the hall builder, shared helpers...). Choose the cut from how the code is actually organised; aim for files under ~30 KB. Do the same for `src/ui/art.js` only if a natural cut exists.
- Pure moves: no renames of exported behaviour, no logic changes, no "while I'm here" fixes (list those for the owner instead).
- Keep the rules: only `src/ui/` touches the DOM; `src/core/` is untouched in this step.
- Check it: `npm test` passes with the same count; `npm run build` works; take screenshots before and after (`npm run screenshots -- <slug>`) and confirm they match. Add the new layout to `CODEMAP.md`.
- This should make the iOS work easier (smaller files to profile and adjust per screen). Don't add anything iOS-specific here.

### Step 4: code review (report only)
- Review the restructured code for correctness bugs, dead code, and anything that would cause trouble in a phone WebView (iOS rules in `CLAUDE.md`: no hover-only info, 44px tap targets, safe areas, phone width first; also memory and performance on long runs).
- Write findings to `drafts/REVIEW-<date>.md`, most severe first. **Fix nothing in this step**; the owner picks what to fix.

## Each step finishes with
- `npm test` passing at the same count as before.
- A `CHANGELOG` entry and a design-log row (why the docs or modules moved, rejected alternatives).
- A commit under the owner's name per `CLAUDE.md`, pushed to the session's branch. Ask before opening a PR.
- A short report: what moved where, the before/after size of the files sessions read most, and anything left undone.

## Out of scope
- Gameplay, balance, wording, look, save format (no `SAVE_VERSION` bump should be needed; if one is, stop and ask).
- Refactoring `src/core/` beyond what the review reports.
- Starting the iOS wrapper itself.
