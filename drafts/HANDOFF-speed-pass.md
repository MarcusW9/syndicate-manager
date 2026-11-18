# Handoff: speed on the Jobs board (review items 6 and 7, and the cost the way out added)

## Result, 2026-11-18 (the unattended session, branch `claude/speed-pass`, no PR)

**What was done.** Three commits on top of `main` (ed402d2, #194 squashed) plus this write-up. No rule, number, roll or wording changed; no test expectation changed; one test file added (`tests/copyfight.test.js`, a guard). Every step was checked against a golden file (fightOddsFor over every fight job x 3 difficulties x 3 risks x 3 crews, vanOdds mid-fight, and jobRead on four 20-week campaigns), byte for byte, and the full suite passes (1180).

1. **Wordless planning fights.** `playFight` returns only the fight, so its rounds' lines were built and thrown away. While it plays, `say` does nothing and the names made only for a line's slots are skipped (`fight.js wordless`). `b.end`'s text is still written.
2. **A quick copy instead of `structuredClone`** (`core/copy.js copier`): copies plain objects and dense arrays itself, keeps shared references shared, and hands anything else to `structuredClone`. The parts no round writes into are shared, not copied: engine 2's orders and each runner's stats and build (`fight.js KEPT`), engine 1's spots and stats (`battle.js BATTLE_KEPT`). `tests/copyfight.test.js` freezes those and plays fights against `structuredClone` copies, so a future in-place write fails the suite. Used by `stepTally`, `vanOdds` and `stepBattleTally`, found once per tally.
3. **`firstBy`**: a round's single picks (lowest pips, worst shot, most hurt, overwatch's target) take the first by the comparator instead of sorting a copy (the same element as a stable sort's first); `enemyOrder` builds each enemy's key once.

**Numbers.** Same machine, same session; "before #194" is `b3e546e`, "main" is `ed402d2`.

| Benchmark | before #194 | main | this branch | target |
| --- | --- | --- | --- | --- |
| The brief's script (cold, ms a team), data_pull | 16.0 | 21.9 | 16.8 | <= 15 |
| quiet_hours | 12.0 | 18.0 | 14.8 | <= 13 |
| protection | 17.6 | 17.3 | 11.7 | no regression |
| warehouse | 26.7 | 24.4 | 15.4 | no regression |
| Same, warm (JIT warmed on other crews; median of 5), data_pull | 9.9 | 13.5 | 9.0 | |
| quiet_hours | 8.5 | 12.7 | 9.5 | |
| Hack jobs, every crew x 6 difficulties x 3 risks (ms, one process) | ~3500 | ~5500 | ~3800 | |
| Cold board reads, median / p90 (ms), main's 8 x 30-week states | 69 / 442 | 73 / 453 | 40 / 340 | 40 / 170 |
| Same, on the pre-#194 code's own states | 42 / 195 | 44 / 199 | 35 / 139 | |
| The brief's board method (each version on its own campaigns) | 40 / 158 | 113 / 546 | 43-48 / 307-342 | |

**Against the targets.** Warm, the hack jobs are back to the pre-#194 figures (data_pull better, quiet_hours within about 10%). Cold, they are 1-2 ms short of the literal targets: the first job measured pays the JIT warm-up, and the script's numbers on this machine move 1-2 ms run to run. The other two jobs are a third faster than before. The board's median target is met. **The board's p90 target is not, and cannot be met by speed alone on the brief's method:** it compares each version on its own campaigns, and main's 30-week campaigns offer heavier jobs (wrong_horse, dead_air, kidnap with 3,000-4,000 engine-2 fights per read, a penthouse with 13,500 engine-1 battles) that take 300-450 ms even on the pre-#194 code. On identical boards this branch is faster than the pre-#194 code at every percentile.

**Item 7.** The backup half is already on `main` (`save.js backupInfo` reads a small meta key). `render()` at 4x was measured, nothing changed: `drafts/NOTE-render-cost-2026-11-18.md` (tabs 30-60 ms warm, Today 90-130 ms; a save 6-12 ms). Suggested next: profile the Today tab before any patch-instead-of-replace work.

**Tried and dropped.** Skipping the arguments of `say` in wordless play (`wordless || say(...)` at 50 call sites): about 3%, inside the noise, not worth the edit. `Object.keys` instead of `for...in` in the copy: no difference.

**What is left (for whoever picks it up).**
- The heavy board reads are the fights themselves now (`playRound`, `resolveOrders` and the copy at about 10%). The next real gain is structural, and each needs care to stay exact: playing the three risk levels' fights together until the first round a risk level is read (`riskThreshold`, `committed`, the van), or caching `standing`/`enemiesUp` within a round. Neither was started.
- Engine 1's `playRound` builds every line's text in its arguments; a wordless mode there means touching each line (penthouse-type reads would gain).
- `kidnap` moving to engine 2 is already on `HANDOFF.md`'s list; it is one of the heavy reads.
- Stacking: this branch sits on `main` after #194's squash (rebased per the owner's session's message: the old branch's last commit `a081a9c` had the same tree as `ed402d2`; the two brief commits were replayed). No PR opened.

Written 2026-11-17 for a session that runs without the owner. Read `CLAUDE.md`, `docs/ARCHITECTURE.md` section 10 ("Tests, sims, helpers"), the review's items 6 and 7 (`drafts/REVIEW-2026-11-13.md`), then this. No design calls: **the output of every function must stay exactly the same; only the time it takes changes.** That is what makes this safe to run alone.

## Where it stands

- **#169 (merged) already did the big part of item 6:** a pruned squad search (exact: `tests/squadsearch.test.js` checks it against `tests/squad-ref.js`), a shortlist (`JOSS_SHORTLIST`), kept reads, and a Web Worker. Do not redo it.
- **PR #194 (open, `claude/awesome-cerf-p09fsh`) made hack jobs slower to price.** A hack fight now has a way out (`docs/BATTLES.md`), so each simulated fight is about twice as long. Measured on 2026-11-17 on the same code with and without the PR (`fightOddsFor`, uncached, one crew each, full-speed Node): data_pull 13.5 -> 25.2 ms a team, quiet_hours 11.6 -> 19.9 ms; protection and warehouse unchanged (17 -> 22 and 23 -> 21, within noise). Cold board reads (the first read of each job) went from a median of 34 ms to 88 ms and a 90th percentile of 157 -> 440 ms on eight seeded 30-week states. At the review's 4x phone slowdown that is the difference between a board that opens at once and one that does not.
- **Item 7 is untouched:** `render()` rewrites the whole page on every tap and `setState` -> `saveGame` parses the whole backup just to compare its day and seed.

## The rule

Same outputs, less time. The tests that prove it: `tests/squadsearch.test.js` (the pruned search is exact), `tests/fight.test.js` ("fightOdds plays playRound on fixed seeds: the same read twice, and the same as playing it by hand"), `tests/fightpace.test.js`, and the whole suite. If any of them needs to change, you changed behaviour: stop and undo.

## The work, in this order

1. **Profile before touching anything.** `node --cpu-prof` on a script that calls `fightOddsFor` for a hack job over ten crews (a starting point is the benchmark at the bottom of this file). Read the top functions by self time. Expected suspects, to check and not assume: `structuredClone` of the fight per run (`fightTally`/`stepTally` in `core/fight.js`), `exposures`/`resolveOrders`/`previewRound` called more than once a round, `oddsKey` building a large array each call, `shuffle` of enemy decks, `lineText` filling wording for lines nobody reads (the planning fights run with `lines` that are thrown away: skipping the text for a fight played only for its result is a free win, if `say` can be told so, but only if no test or read reads those lines).
2. **Fix the biggest cost first, measure, commit, repeat.** Keep each change small and keep a table of before and after in the commit message. Ideas that keep the output identical: a cheaper copy than `structuredClone` for the fight; computing a round's `exposures` once; not building text in planning runs; caching per crew across the three risk levels where the fight is identical until the risk matters (check that it is: `risk` changes thresholds from round 1, so it may not be).
3. **Early exit in the tallies.** `winRange`/`stepTallies` already bound the win share from the fights played so far; check that every caller that only needs "does this team beat that one" stops as soon as the bound decides. Only if the answer is provably the same.
4. **The way out's own cost.** If the profile says the second stage dominates, look at what `startRound`/`telegraph` do for the arriving group (decks, `shuffle`) and whether the arrivals can be built lazily. Do not change `FIGHT.wayOutShare` or the rules: that is the owner's call (`HANDOFF.md`).
5. **Item 7 (only after the above is measured and merged-ready):** remember the backup's day and seed instead of parsing it in `save/save.js saveGame` (the three storage functions are the only iOS-facing surface: keep them as they are); and measure `render()`'s cost at 4x before deciding whether to patch instead of replacing (do not start a rewrite: report the numbers in a note in `drafts/`).

## Targets (declare them first, in the first commit message)

- Hack-job fight odds per team back within 10% of the pre-PR figures: data_pull <= 15 ms, quiet_hours <= 13 ms, with no regression on the others.
- Cold board read median <= 40 ms and 90th percentile <= 170 ms on the eight-seed benchmark.
- Nothing in the suite changes except its running time.

## Measuring (copy this, it is the benchmark behind the numbers above)

```js
// node bench.mjs <repo root>   (run it once on `main` in a worktree, once on the branch)
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const root = process.argv[2];
const { createNewGame } = await import(root + '/src/core/state.js');
const Fight = await import(root + '/src/core/fight.js');
const { templateById } = await import(root + '/src/core/jobs.js');
const { FIGHT_JOBS } = await import(root + '/src/data/fights.js');
const crew = createNewGame({ seed: 5, startCrew: 'classic' }).crew;
const subsets = (list, k) => (k === 0 ? [[]] : list.flatMap((x, i) => subsets(list.slice(i + 1), k - 1).map((r) => [x, ...r])));
for (const job of ['data_pull', 'quiet_hours', 'protection', 'warehouse']) {
  const tpl = templateById(job);
  const teams = subsets(crew, tpl.crewSize).slice(0, 12); // distinct crews: the odds are cached per crew, so repeats measure nothing
  const t0 = performance.now();
  for (const t of teams) Fight.fightOddsFor({ type: FIGHT_JOBS[job], diff: Fight.fightDiff(14), threat: tpl.threat, site: tpl.district, approach: 'stealth', job, risk: 'steady', crew: t });
  console.log(job, ((performance.now() - t0) / teams.length).toFixed(1), 'ms a team');
}
```
For the board, time `jobRead(state, job)` (`core/squad.js`) for each job of states from `playWeeks(30, seed)` (`tests/play.js`), first read only (a second read is cached).

## What not to do

- Do not change a rule, a number, a roll or a wording. Do not change what any test expects.
- Do not touch anything under "Waiting on the owner" in `HANDOFF.md`.
- Do not open a PR into `main` while #194 is unmerged; push to a branch stacked on `claude/awesome-cerf-p09fsh` and leave the PR for the owner (stacked PRs do not retarget themselves).
- Commits under the owner's name only (`CLAUDE.md` "Commits").

## Done when

The targets are met on the benchmark, the full suite passes unchanged, a changelog entry says what got faster and by how much, and this file's top says what was done and what is left.
