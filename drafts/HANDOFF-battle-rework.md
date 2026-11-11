# Handoff: build the battle rework, slice 1 (2026-11-11)

Paste the block below into a new session as its first message. It is written to stand alone.

---

You're picking up the battle rework for this game (a text-first crew management game, plain
JavaScript + Vite). The design is finished and agreed with the owner; your job is **slice 1: the new
fight engine and the endurance stat (save v61)**, as one PR on a fresh branch from `main`.

**Read first, in this order:**
1. `CLAUDE.md` (project rules: architecture, tests, design log, changelog, commits, screenshots).
2. `drafts/PLAN-battle-slices.md` (the build plan: slice 1 is your task; follow its principles).
3. `drafts/SPEC-battle-orders.md`, **section 30 first** (everything settled), then the sections it
   points to (8, 10, 10a, 10b, 12-16, 19, 22, 23).
4. `drafts/NUMBERS-battle-orders.md`, section 13 (the keys) and section 12 (why the numbers are what
   they are).
5. `scripts/sim-step0.mjs`: the reference implementation of every rule, as played in Step 0
   (profile `medic`, plus the settled changes in spec section 30: bleeding 10%, patch 1, light wound
   -2 pips, overwatch one shot at the van, a 3-pip floor). Port from it; don't reinvent.
6. `CODEMAP.md` and the code you'll touch: `core/battle.js`, `core/runbattle.js`, `core/mission.js`
   (fight start and end, call-ins), `core/autorun.js`, `core/away.js`, `core/fightspots.js`,
   `core/gear.js`, `core/development.js`, `core/dossier.js`, `core/rating.js`, `core/recruits.js`,
   `src/save/save.js`, `core/state.js`, `tests/battle.test.js`, `tests/play.js`.

**What slice 1 is** (details in the plan):
- Endurance as the eighth stat, everywhere stats are listed; generated, grown and aged like the
  others (muscle's decent stats become endurance and cool); a solid muscle 12-13, the best 19-20;
  shown on the runner's page; counted in wages with the per-stat rate scaled so average wages don't
  move.
- Engine 2 beside engine 1: `core/fight.js` (rules), `core/runfight.js` (the run's side),
  `data/fights.js`, `data/dilemmas.js`, `data/fightText.js` (placeholder wording keys). Only the five
  chosen jobs use it (`data_pull`, `data_scrub`, `quiet_hours` holdHack; `warehouse`, `protection`
  holdExtract); every other fight and raids stay on engine 1.
- Call-ins through the existing `am.pending` path; hands-off answers by risk level.
- The new death rule: `CLAUDE.md`'s design rule and the death tests change as the plan says (update,
  never loosen).
- Save v61 with a migration and a test; `tests/fight.test.js` with the tests in spec section 23.
- `CODEMAP.md`, `docs/ARCHITECTURE.md`, `CHANGELOG.md`, and a decision row (newest file in
  `docs/design/`) for anything you decide while building.

**Rules that matter most here:**
- `src/core/` is pure: no DOM, storage or `window`; randomness through the run's stream
  (`nextRng(state)`), never `Math.random()`. Previews, "if nothing" text and dilemma checks never
  draw.
- Shown risk equals used risk: every chance shown comes from the function the round uses.
- Run `npm test` before every push (2-3 minutes; `npm run test:fast` while working). 865 tests pass
  today. Never loosen a test to make a change pass.
- Commits as `marcusw <160358373+MarcusW9@users.noreply.github.com>`, author and committer, with no
  co-author, session or "generated with" lines (`CLAUDE.md`).
- **Wording is the owner's.** In slice 1 use short placeholder keys. Whenever a step needs a lot of
  in-game text, write a brief in `drafts/writing-tasks.md` (ids, slots, counts, examples of house
  style from `WRITING_GUIDE.md`, where each line shows) and **stop and ask the owner** for it rather
  than writing it yourself.
- Ask the owner before deciding anything design-shaped that the spec doesn't settle; a short
  multiple-choice question with your recommendation works best.

**Done when:** the five jobs play their fights on engine 2 from start to finish (commanded and
hands-off), everything else plays as before, saves upgrade from v60, `npm test` passes, and the PR
describes what changed and what's left for slice 2 (the screens).

---

## Notes for whoever picks this up

- **Where this came from:** a long design session on 2026-11-10/11 (the decision log rows of those
  dates in `docs/design/2026-11.md` tell the story: the brief and its amendments, suppression
  removed, the orders layer, endurance, shots by kind, contested boarding, the van, carrying,
  bleeding out, the medic's aura, left behind).
- **Step 0 ended without a gate verdict on purpose:** the sim compares fixed plans and can't see
  mid-fight adapting; slice 3 re-runs the gate on the real code with call-ins (plan, slice 3).
- **The sim's numbers aren't the game's:** Step 0's crews are abstract (stats relative to the fight's
  difficulty). Expect to retune in data once the real code runs; slice 3's sim is the place.
- **Kidnap Rescue** is held back until Old Town has an enemy list. **Rescue jobs, ransom and the
  death chance for missing runners** are slice 4.
