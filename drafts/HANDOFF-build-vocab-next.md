# Handoff: the build vocabulary after the trigger step

Written 2026-11-19, after #209 (the generic trigger step, no behaviour change). Read `CLAUDE.md`, then `HANDOFF.md`, then `drafts/PROPOSAL-build-vocabulary.md` ("What makes it scale", the guardrails, the questions at its end), then `docs/BATTLES.md` "The build vocabulary's trigger step". Two parts, best on different models:

| Part | What | Best on | Owner needed? |
| --- | --- | --- | --- |
| A | The combo sweep script and the speed-budget test ("What makes it scale" 2 and 3) | **Sonnet**: measurement and a guard; no rule, number or wording changes | No (report what it finds; do not tune) |
| B | New statuses and pieces (the proposal's status table, the first new words) | **Opus**: design choices that interact, tuned against the death rule | Answered 2026-11-19 (see Part B) |

Do A first; B's pieces then get swept as they land.

## What is true now (re-check against the code)

- Pieces are data: `data/builds.js` `MOVES`/`PAYLOADS`, each with `pieces: [{ when, if?, who, what }]`. The words are `core/fight.js VOCAB`: when `onAttack`/`onHit`/`onKill`; if `enemiesUp`; who `target`/`nextInGroup`/`nearest`; what `burst`/`apply`/`spread`; status `infected` (made by `STATUS.infected` from the payload's `dot`).
- The trigger step: `piecesOn(r, when)` (move, then payload; cached per source), `moveReady`/`pieceHolds`/`moveNeedsUp`; inside `playRound`: `landed` (onHit: shrug, then apply), `fall` (onKill: the killer's pieces, then those the body's statuses bring; one spread of a status a fall), `whoOf`. The tick is the status's own behaviour (`ticksDue`).
- Built pieces: Ricochet (move), Cytotoxic and Contagion (payloads, family `vector`, one slot). Enemy tags: only `synthetic` (drones), immune to the Vectors.
- Existing sims: `scripts/sim-vectors.mjs` (builds against the job's own, swarm and mixed enemies), `scripts/sim-wayout.mjs`. `tests/vocab.test.js` shows how to add a piece as data in a test (and remove it after).
- How #209 proved "no behaviour change" (reuse it for any refactor of the step): a scratch script played 2,592 fights (seeds 1-12 × holdHack/holdExtract/holdYard × heights/docks × 6 builds on the best runner × a second carrier none/cytotoxic/contagion × threat 3 and 5, overwatch on odd seeds) with `playRound` until the end, and hashed every round's lines and the final fight. Same hash before and after. Not committed (the hash moves with any balance change).

## Part A: the combo sweep and the speed budget (Sonnet) — DONE 2026-11-19

Built as written: `scripts/sim-combos.mjs`, `tests/fightspeed.test.js` (ratio about 1.0 to 1.1, bound 1.5), first sweep `docs/sims/combos-2026-11-19.md`. Its findings are in the HANDOFF line and the file's Flags; nothing was tuned.

1. **`scripts/sim-combos.mjs`** (measures only; writes `docs/sims/combos-<date>.md`). Every build a runner can hold (each move or none × each payload or none), given to the best runner of a fixed set of crews (reuse `sim-vectors.mjs`'s rosters or `sim-enemy-toughness.mjs`'s `crewOf`), and also every pair of builds on the two best runners, played against each enemy mix: the job's own, **armoured** (police/secforce: plates), **swarm** (many 10 HP hired), **synthetic** (drones), mixed. Steady and committed. Columns: win, clean win, downs a fight, a death (committed only), rounds, HP lost, and the pieces' own counts from the lines (infects, spreads, shrugs, bounces). Build the list of pieces from `MOVES`/`PAYLOADS`, so a new piece is swept with no script change.
2. **Flag outliers** in the file, plainly: a build or pair whose clean win is more than 15 points above the no-build row on any mix, one that is worse than no build anywhere, a combination that loses someone on cautious or steady (this must never happen; if it does, stop and report), and any piece whose counts are zero on every mix (it never fires). Thresholds at the top of the script, named.
3. **The speed budget test** (`tests/fightspeed.test.js` or in `copyfight.test.js`): play a fixed set of fights with every build mix through `playFight` and assert that the trigger step costs at most a set share more than the same fights with no builds (measure first; set the bound with room, e.g. 1.5×, so the test is not flaky on a slow machine; compare within one run, never against a stored time). Say in the test what it guards: the board replays many fights for its odds (`HANDOFF-speed-pass.md`).
4. Docs: a changelog line (tools only), CODEMAP "Tests and scripts", HANDOFF (delete this part's line, point at part B). No design-log row unless a choice is made.

**Do not** change any piece, number or rule in part A; outliers are for the owner and part B.

## Part B: new statuses and pieces (Opus, owner first)

**The owner's answers, 2026-11-19 (the proposal's five questions are settled; do not ask them again):**

1. **First set of statuses:** `marked`, `exposed` and `shaken`, beside the built `infected`. The rest (`jammed`, `stabilised`, `steadied`) wait until these have been played.
2. **`burning`:** yes, in the first set, but as a plain damage-over-time only. It does **not** spread by itself (no `spread` of it, no onKill jump like `infected`'s). So the first set is four new statuses: `marked`, `exposed`, `shaken`, `burning`.
3. **Reactions** (two statuses on one body make something new): after the plain statuses have been played, not in this step.
4. **Duo pieces:** kept for later (with the offer and menu, `PROPOSAL-runner-shaping.md`).
5. **Drones count as armoured:** yes, both tags. A drone's `foeTags` become `['synthetic', 'armoured']`. Add the `armoured` tag to the enemy data, and add drones to part A's armoured mix in `scripts/sim-combos.mjs` (it is police and secforce only now). Adding the tag changes nothing by itself while no piece reads it. Re-run the sweep before and after.

Then, per agreed status:

- Add the word to `VOCAB`, a `STATUS` maker, its `onTick`/duration handling in the engine (the guardrails: no stacking, spreads weaken a step per jump, caps in data), a log line in `data/fightText.js` (Claude's draft, flagged in `drafts/writing-tasks.md`; the owner writes the wording) and a look on the stage (`data/fightLooks.js`, `ui/fightstage.js`). If the stage cannot draw it, it is not in yet (proposal guardrail 6).
- New triggers the proposal lists as events the engine already has (`onCrack`, `onBreak`, `onAllyDown`, `onHurt`, `onTick`, `roundStart`) are added only when a piece needs them.
- Shown equals used: every new status or trigger shows in `previewRound` and counts in the planning odds (it does if the rule lives in `fight.js`; check `oddsKey` carries any new field on a body or runner).
- Save: a new field on a body or runner in a fight means `SAVE_VERSION` + a migration that gives a fight in progress the old values.
- Sweep each new piece with part A's script before and after; the death rule must hold (no death on cautious or steady without a call-in).
- Docs as usual: BATTLES.md, design log, changelog, CODEMAP, HANDOFF, screenshots if the stage shows something new.

## Not in scope

The offer and the menu for new pieces (runner shaping, `drafts/PROPOSAL-runner-shaping.md`), battle slice 4, the iOS wrapper.
