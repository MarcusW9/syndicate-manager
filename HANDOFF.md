# Handoff · 2026-11-16

Now and next, on one screen. Read `CLAUDE.md` first; its rules are not repeated here. The why for anything below is in the decision log (`docs/design/2026-11.md`, grep the topic); what shipped is in `docs/changelog/`. Older session histories, build-order notes and backlog detail: `docs/handoff-archive.md` (grep it, don't read it).

**Keep this file to one screen.** When something here is done, delete the line (the changelog and decision log already hold it); don't add session histories.

## State

- **`main`:** gear tiers, drops and perks (Custom, Premium) are merged; **save v69 on branch `claude/eloquent-hamilton-q1e007`, no PR yet**: Apex, eight named pieces (`data/apexGear.js`), each found once per save (`state.apexFound`), one per runner, each with a unique perk. The owner reads the pieces before a PR is opened. Next for loot: nothing agreed. PRs are squash-merged, one per feature, and the owner merges. No PR is open (2026-11-13).
- **Built and in the game:** the tong (halls with compounds, posts and forecourts, heat per district, police and gang raids, heists slice A1, the other tongs C0-C5 with the Anchor's Book, retirement, loyalty, rival offers, the oath); the navigation rework (`docs/SCREENS.md`); the battle rework slices 1-3 (Engine 2, `core/fight.js`, on five jobs; raids and every other fight stay on Engine 1, `docs/BATTLES.md`); watchable combat slices 0-1 and the live battle view steps 1-3 (fights play on the job's own map); job maps in hard light.
- **Tests:** 1044 passing (2026-11-14). `npm run test:fast` while working; `npm test` before every push (it takes several minutes).

## Next

The agreed order (owner, 2026-11-16): **the save fix (done, #185), then builds, then the playtest.** Everything else is parked until then.

1. **Builds slice 3-ii-a, the first combo on screen: built (2026-11-16, save v74), waiting on the owner's read of the sims** (`docs/sims/gate-teams-2026-11-16-builds-3iia.md`; the DESIGN row says the burst, not the vector, carries it, so drones are a weak counter; the owner's call on reach and the drone rule; wording `drafts/writing-tasks.md` B1). The brief: `drafts/HANDOFF-builds-3iia.md` (Ricochet and the Cytotoxic Vector, given in data; the synthetic tag as the first counter). An Opus session. The frame is `drafts/PROPOSAL-swarm-and-special-moves.md` 2.6-2.7 and the owner's ideation `drafts/PROPOSAL-combat-builds.md`. Next slices: earning by offer and slots, Contagious, the planning read's tags.
2. **Reconcile medical, piloting and leadership with the build frame** before any is built (owner, 2026-11-16): map each `drafts/PROPOSAL-*.md` onto the build axes and roles; what does not fit stays standalone. A docs pass, alongside 3-ii-a.
3. **The playtest** after 3-ii-a (`drafts/PLAN-battle-slices.md` "After the slices"), on the fight the owner wants.
4. **Parked until then:** the other tongs' E4 (`drafts/PROPOSAL-tong-depth.md`), battle slice 4 (left behind, rescue, ransom), the iOS wrapper (`PLAN-IOS.md`; review findings 2-4) and the rest of `drafts/REVIEW-2026-11-13.md`, the locked districts, everything under "Parked" in the archive.
5. **Owner's writing, any time:** the save banner's "Not saved yet" line (Claude's draft); `drafts/writing-tasks.md`; battle items in `drafts/OWNER-ITEMS-battle.md`; hall part names in `drafts/BRIEF-hall-compounds.md`.

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
