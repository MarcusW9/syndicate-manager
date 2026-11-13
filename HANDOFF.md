# Handoff · 2026-11-13

Now and next, on one screen. Read `CLAUDE.md` first; its rules are not repeated here. The why for anything below is in the decision log (`docs/design/2026-11.md`, grep the topic); what shipped is in `docs/changelog/`. Older session histories, build-order notes and backlog detail: `docs/handoff-archive.md` (grep it, don't read it).

**Keep this file to one screen.** When something here is done, delete the line (the changelog and decision log already hold it); don't add session histories.

## State

- **`main`:** up to [#153](https://github.com/MarcusW9/syndicate-manager/pull/153), **save v63**. PRs are squash-merged, one per feature, and the owner merges. No PR is open (2026-11-13).
- **Built and in the game:** the tong (halls with compounds, posts and forecourts, heat per district, police and gang raids, heists slice A1, the other tongs C0-C5 with the Anchor's Book, retirement, loyalty, rival offers, the oath); the navigation rework (`docs/SCREENS.md`); the battle rework slices 1-3 (Engine 2, `core/fight.js`, on five jobs; raids and every other fight stay on Engine 1, `docs/BATTLES.md`); watchable combat slices 0-1 and the live battle view steps 1-3 (fights play on the job's own map); job maps in hard light.
- **Tests:** 1020 passing (2026-11-13). `npm run test:fast` while working; `npm test` before every push (it takes several minutes).

## Next

1. **Session-cost restructure (this handoff's own work, 2026-11-13):** step 1 (docs trimmed and split) is done. Left: step 2 (one fact, one home across `CODEMAP.md`, `docs/ARCHITECTURE.md`, `docs/SCREENS.md`), step 3 (split `src/ui/app.js` by screen, pure moves), step 4 (a review written to `drafts/REVIEW-<date>.md`). One PR each; ask the owner before each.
2. **The other tongs, deeper:** slice E0 (the Tongs screens; no rules, no save change) is ready to build from `drafts/HANDOFF-tongs-screens.md`; then E1-E4 (`drafts/PROPOSAL-tong-depth.md`, the owner took every call in section 9 as proposed).
3. **Battles:** the owner's open items are in `drafts/OWNER-ITEMS-battle.md` (the slice 3 verdict, wording to rewrite, the Special actions button). Not built: slice 4, left behind (rescue job, ransom, the 7-day wait; `drafts/PLAN-battle-slices.md`), then the formal playtest and what follows it ("After the slices" there). Watchable combat's slices 3-5 (Overdrive, showcases) wait behind a playtest (`drafts/HANDOFF-watchable-combat.md`).
4. **Owner's writing:** `drafts/writing-tasks.md` (A2: Mr. Szeto's heist and its six prep jobs is task 12; the oath ceremony goes through `add-lore`). Hall part names: `drafts/BRIEF-hall-compounds.md`.
5. **Later, ask first:** back-room roles, leadership and judgment as stats, piloting, medical (`drafts/PROPOSAL-*.md`); the locked districts (the Silt first); everything under "Parked" in the archive.

## Open branches

No open PRs. The remote holds 100+ old `claude/*` session branches; all the ones checked are squash-merged leftovers (their commits look "ahead" of `main` only because of the squash). Deleting them is the owner's call.

## Agreed rules still live

- **No death without the player's choice or an accepted, shown risk** (CLAUDE.md "Design rules"); also: hands-off crews always extract; side tasks cost at most a light injury, heat or a day held; incidents never go past a serious injury; every decision a run stops for has an exit.
- **Traits never take a choice away:** downsides are penalties shown in the roll breakdown. At most two temporary traits; progress hidden until earned.
- **Shown risk equals used risk:** any new modifier must appear in the risk read and the crisis read (as notes on `crewRoll`). The planning reads call the run's own functions (`coverage()` → `handlerFor`/`bestSave`; fight odds replay the real fight); never a separate estimate.
- **Randomness that shouldn't shift other dice** (weekly boards, arrivals) comes from `makeRng(seed ^ week)`, not `nextRng(state)`.
- **Crisis ids are unique** (a test checks). Renaming one needs a save migration.
- **Pace is measured, not guessed:** re-run the matching `scripts/sim-*.mjs` after changing XP, traits, fights or money.
- **Watching is UI-only pacing:** core steps one move at a time (`autoStep`); no timers or animation state in `src/core`.

## Working with the owner

- **Ask, don't assume,** on anything design-shaped. Multiple-choice questions with a recommended option work well. The owner writes the game's wording: pause and brief them in `drafts/writing-tasks.md` for text-heavy steps.
- **Commits** under the owner's name only (CLAUDE.md "Commits"). A stop hook may ask for Claude-authored commits; the owner's rule wins. Merge commits pick up the default identity: amend before pushing.
- **PRs:** ask before opening; one at a time against `main`. Stacked PRs don't retarget themselves when the lower one merges.
- **Screenshots:** `npm run screenshots -- <slug>` (pass the slug without a date); the script can't reach mid-game screens, so add Playwright captures as extra numbered shots and say so in the README row.

## Environment gotchas

- `npm run build` and `npm run screenshots` need `npm ci` first in a fresh container; screenshots also need `ln -sfn "$(npm root -g)/playwright" node_modules/playwright`. `npm test` needs nothing.
- Browser checks: `npx vite --port 5174` in the background (`setsid`), then Playwright at phone width 390. Stop it with `pkill -f "[v]ite --port 5174"` (the brackets stop the pattern matching its own shell).
- Force-push is denied. After a PR merges, branch fresh from `main`; to reuse a branch name, restart from `main`, commit, `git merge origin/<branch>` keeping your side, then push normally.
- github.io isn't reachable from the container; check deploys through the GitHub Actions runs.
