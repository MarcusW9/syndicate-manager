# Handoff · 2026-10-26

Where the project stands and what to pick up next. Read `CLAUDE.md` first: its rules (architecture, tests, design log, changelog, screenshot log, commit author) are not repeated here. `DESIGN.md`'s decision log has the why for everything below, newest first.

## State

- **Live (`main`):** up to "Hands-off crews report back when they return; on every rookie job" (#12), plus the screenshot-log PRs (#10, #11).
- **Five PRs stacked, waiting to merge, in this order:** each targets the one before and retargets to `main` when it merges.
  1. [#13](https://github.com/MarcusW9/syndicate-manager/pull/13) Choices unlocked by stats (17 on rookie jobs); a crisis that names someone is theirs to handle.
  2. [#14](https://github.com/MarcusW9/syndicate-manager/pull/14) Side work for the bench (25 side tasks, weekly board, intel). Save v18.
  3. [#15](https://github.com/MarcusW9/syndicate-manager/pull/15) Earned traits, group 1 (12). Save v19.
  4. [#16](https://github.com/MarcusW9/syndicate-manager/pull/16) Crisis situations (12 kinds on all 118 crises); `collector1`/`collector2`. Save v20.
  5. [#17](https://github.com/MarcusW9/syndicate-manager/pull/17) Earned traits, group 2 (8 more; Ghost Driver and Scarred as written). This file rides on it.
- **Tests:** 227 passing on #17 (`npm test`). **Save format v20.**
- **Merge them before stacking more.** If `main` moves under the stack, merge `main` into the lowest open PR's branch (never rebase or force-push; force-push is blocked here anyway), then work up the stack.

## What this session built (2026-10-26)

- **Jobs trickle in** through the week (three windows, from the seed). **Scout reads** in the game's own terms, with a top band "could be one of the greats".
- **Report lines for every crisis** (183, written by the owner; `tests/reports.test.js` keeps it so).
- **The risk read names every bonus** ("tech 14: Chromed +2, stealth approach +1").
- **Mission logs, first slice:** every job records its run as events (`am.events`: who rolled, stat, notes, die, need, costs kept apart, who was hurt, situations). Reports open with Joss's line, turning point, standout and what hurt us (`core/report.js`), then a "Full log" fold with the dice on tap.
- **Hands-off runs** (`core/autorun.js`): every rookie job can be sent under Cautious / Steady / Committed orders; the crew is away and the job resolves the day they return; the report plays out on first open. A hands-off crew always extracts at a critical, so it can't lose anyone.
- **A choice's `{op}` names whoever rolls**, except where the crisis is about someone (focus role, or the crisis text names `{op}`: then that person handles it).
- **Stat unlocks** (17), **side tasks** (25), **earned traits** (20 of the owner's 26), **crisis situations** (`src/data/situations.js`, field `situations`, not `tags`).

## Agreed rules worth remembering

- **No death without the player's choice**, now also: hands-off crews always extract; side tasks cost at most a light injury, heat or a day held.
- **Traits never take a choice away:** downsides are penalties shown in the roll breakdown. At most **two temporary traits**; progress **hidden** until earned. Earning a temporary trait restarts its count (it can't flicker back).
- **Shown risk equals used risk:** any new modifier must appear in the risk read and the crisis read (as notes on `crewRoll`), as intel and traits do.
- **Randomness that shouldn't shift other dice** (weekly boards, arrivals) comes from `makeRng(seed ^ week)`, not `nextRng(state)`.
- **Crisis ids are unique** (a test checks). Renaming one needs a save migration (see v20).

## Next: what adds depth (recommendation)

1. **Career page** (small, high value now). Earned traits, the job log and growth give each person a real story: firsts, scars, traits earned and lost, best moments, stats then vs now. Mostly UI over data that already exists (`op.history`, `op.earned`, `op.growthLog`, report events); a lifetime growth log needs a small save change. It turns traits into attachment.
2. **Heists with team assembly** (the big depth step). Named role slots tested by specific crises, set-up jobs (could be side tasks), the cut split as a loyalty decision, and extended multi-round crises for the finale. Works with five people; a Street-tier heist can be the first promotion. Needs a short design pass with the owner first (slots, cut split, how prep feeds the finale).
3. **Promotions and districts.** Tier promotions open the Silt, the Amber Reach and Iron Peak. Prerequisite: 1-2 job types per locked district (writing task 10, hooks in `drafts/district-hooks.md`), which the owner can write in parallel.

After those: safehouse rooms (with base tasks), gear (opens choices like stat unlocks; can key on situations), hands-off on bigger jobs, squads, client storylines.

## Writing pipeline (owner writes in other chats, pastes back)

`drafts/writing-tasks.md` holds a prompt per task; paste the `WORLD.md` context block first. Done: 1 (report lines), 2 (Container 409 log: go), 7 (stat unlocks), 8 (side tasks), 9 (traits). Waiting: 3-6 (log templates, district packs, Joss lines, authored beats) until real hands-off reports show what's missing; **10 (locked-district jobs) is the next useful one.**

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
- **PRs:** the owner merges; open one per feature, stacked if needed, and say the merge order.
- **Screenshot sets** for visual changes (`npm run screenshots -- <slug>`); the script can't reach mid-game screens, so add 1x Playwright captures as extra numbered shots and say so in the README row.
- **Lore style:** narrative, second person, present tense in `WORLD.md`; in-game text 1-2 sentences, phone-first. Canon rules: English district names, Cantonese romanisation, everything invented, rumours never confirmed, Szeto suspected not proven.

## Environment gotchas

- `npm run build` needs `npm ci` first in a fresh container. `npm test` needs nothing.
- Browser checks: `npx vite --port 5174` in the background (`setsid`), then Playwright (pre-installed). Phone width 390.
- **Stopping the server:** `pkill -f "[v]ite --port 5174"`. Without the brackets the pattern matches the shell running it and kills the command (exit 144) before anything after it runs.
- **Force-push is denied** by the permission system. After a PR merges, branch fresh from `main` instead of resetting the old branch.
- github.io isn't reachable from the container; check deploys with the GitHub Actions runs instead.
