# Handoff · 2026-11-18

Now and next, on one screen. Read `CLAUDE.md` first; its rules are not repeated here. The why for anything below is in the decision log (`docs/design/2026-11.md`, grep the topic); what shipped is in `docs/changelog/`. Older session histories, build-order notes and backlog detail: `docs/handoff-archive.md` (grep it, don't read it).

**Keep this file to one screen.** When something here is done, delete the line (the changelog and decision log already hold it); don't add session histories.

## State

- **`main`:** everything up to #199: #199 the purity pass (the core never reads the clock, a test keeps the layers apart; `createNewGame` takes a seed, `ui/seed.js`), #198 the handoffs; #195 the visual pass (the Contagion jump, the infection tick, the shield dome, jam, the way-out alarm, the medic's patch on the stage) and #197 the speed pass (the board's fight odds back to their pre-#194 speed, same outputs). Before them, everything up to #193 (gear tiers, Apex, builds 3-ii-a/b, the offer on the crew sheet, hall raids on engine 2). **#194 is merged (2026-11-18):** the planning read's build advice (Joss, closed to start), the Contagion Vector, hack jobs ending with a fight out (save v76), the medic's hands on the way out, the medic's aura drawn on the stage, and the sims behind them (`docs/sims/vectors-*`, `wayout-*`). PRs are squash-merged, one per feature.
- **Built and in the game:** the tong (halls with compounds, posts and forecourts, heat per district, police and gang raids, heists slice A1, the other tongs C0-C5 with the Anchor's Book, retirement, loyalty, rival offers, the oath); the navigation rework (`docs/SCREENS.md`); the battle rework slices 1-3 (Engine 2, `core/fight.js`, on five jobs; raids and every other fight stay on Engine 1, `docs/BATTLES.md`); watchable combat slices 0-1 and the live battle view steps 1-3 (fights play on the job's own map); job maps in hard light.
- **Tests:** 1188 passing (2026-11-18). `npm run test:fast` while working; `npm test` before every push (it takes several minutes).

## Next

The agreed order (owner, 2026-11-16): **the save fix (done, #185), then builds, then the playtest.** Everything else is parked until then.

1. **No unattended chunk is queued** (the purity pass is merged, #199: `drafts/HANDOFF-purity-pass.md`). **Waiting on the owner (do not decide for them):** the way out's injury cost (the medic's roll is not the limit; options 1 and 2 in the chat of 2026-11-17: any healer counts, or a downed medic is steadied; or lighter injuries), `FIGHT.wayOutShare` (0.5, the agreed default was 1), the Contagion/Vector trade-off (Contagion is now better in a crowd), the planning read's "protect needs a Ricochet carrier" line (left out), the wording drafts (`drafts/writing-tasks.md`, and the visual pass's three stage texts in `data/fightText.js`: `stage.jammed`, `stage.jamFail`, `stage.alarm`), and whether drones count as armoured. **For the playtest's eyes:** the visual pass's effects in a real Contagion or hack fight at Watch speed (its captures were forged; `drafts/HANDOFF-visual-pass.md` top). **If the board feels slow in the playtest:** what is left of the speed pass is at the top of `drafts/HANDOFF-speed-pass.md`; Today is the slowest tab to draw (`drafts/NOTE-render-cost-2026-11-18.md`). Also open: more pieces and recruits arriving with a piece (need wording and balance calls), an "on my call" switch (parked), tune shots that miss too often, move kidnap to Engine 2.
2. **Reconcile medical, piloting and leadership with the build frame:** drafted (2026-11-18) in `drafts/RECONCILE-medical-piloting-leadership.md`, with six questions for the owner at its end. Nothing is decided; fold the answers into the three proposals and the decision log.
3. **The playtest** after 3-ii-a (`drafts/PLAN-battle-slices.md` "After the slices"), on the fight the owner wants.
4. **Parked until then:** the other tongs' E4 (`drafts/PROPOSAL-tong-depth.md`), battle slice 4 (left behind, rescue, ransom), the iOS wrapper (`PLAN-IOS.md`; review findings 2-4) and the rest of `drafts/REVIEW-2026-11-13.md`, the locked districts, everything under "Parked" in the archive.
5. **Owner's writing, any time:** the save banner's "Not saved yet" line (Claude's draft); `drafts/writing-tasks.md`; battle items in `drafts/OWNER-ITEMS-battle.md`; hall part names in `drafts/BRIEF-hall-compounds.md`.

## Open branches

No open PRs. The remote was cleared of squash-merged leftovers on 2026-11-18 (about 150 branches; GitHub's "automatically delete head branches" is on). Five older branches were kept because their work may not be in `main`: `claude/tongs-overreach-e2-v70` (E2, save v70), `claude/awesome-cerf-p09fsh` (handoffs, medical proposal), `claude/hopeful-noether-me42zb` (swarm proposal), `claude/vigilant-dijkstra-87smp8` (decision-log rows), `claude/brave-clarke-eux927` (hall bunk-room art). Check each before deleting.

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
