# PROPOSAL-runner-renown.md

Owner's design, written outside the repo with an AI (kit: `drafts/ideation-kit.md`), then reviewed against the code on 2026-11-03. **Read "Review decisions" at the bottom first: it changes parts of the text below.** Built in slices; slice 1 (the record, `core/record.js`) is on main, slices 2-6 are not.

## 1. Goal and player-facing behaviour

Players should remember runners by name. Moments land as milestones, each runner builds a visible career record, and a few runners become famous. Fame is earned from the record (option A): there are no separate renown points. Fame changes opportunities, wages and turnover, never dice.

- **Milestones.** A highlighted line in job results, e.g. "Milestone: Static's 10th clean job". It goes into the runner's history and the best ones become their highlights. At most one per runner per job and two per job.
- **Record.** A fold on the runner's page: jobs, at-level jobs, clean jobs, flawless jobs, carries, brought home, unscathed, active weeks, best clean streak.
- **Fame ladder.** Unknown, Known, Respected, Elite, Legend. It sits alongside skill (`op.tier`: rookie/pro/veteran), not in place of it. The badge reads e.g. "ELITE · pro".
- **Paths.** Ghost, Enforcer (was Butcher), Earner, Iron or Lifer. A runner's path is whichever one their record is furthest along. Shown with progress towards Elite and Legend.
- **Standing.** How the street rates them now. It rises with recent at-level work and falls when they're benched or fail. Elite can be lost through low standing. Legend can't, but a Legend's standing word shows, e.g. "Legend · Fading".
- **The city decides.** When a runner meets Legend thresholds, a defining job appears on the board asking for them by name. If it succeeds with them on the crew, they become a Legend. If they die on it after the player pushed on, they become a Legend posthumously.
- **Named offers.** Clients sometimes ask for an Elite or Legend by name, for better pay.
- **Retirement.** Long-serving or battered runners may ask to walk away. The player chooses: persuade them to stay (pay more) or let them go. Nobody leaves without that choice.
- **Hall of Legends.** Retired Elites and Legends, plus fallen ones from the memorial, with path, record and highlights.
- **Decision points.** One highlight line on squad board dossier cards and the crew list.

Out of scope: syndicate reputation (`state.reputation`, `JOB_GATES`), client trust, heat, poaching, the Street Ledger, Fear/Discretion, earned codenames.

## 2. Rules and numbers

### 2.1 Runner level and "at level"
`levelOf(op)`: rookie 1, pro 2, veteran 3. A job is at level for a runner if `am.threat >= levelOf(op)`. Freelancers get no record, fame or milestones. Side tasks don't count. Hands-off runs count fully (they resolve through `finish()`).

### 2.2 Record (written in `finish()`; built in slice 1)
| Field | +1 when |
|---|---|
| `jobs` | Took part (inside crew, overwatch, wheels, standby) |
| `atLevel` | `jobs` and the job was at level |
| `wins` | outcome `completed` |
| `clean` | Completed, `am.wentLoud` false, `heatGain` 0 |
| `flawless` | Completed and nobody went critical |
| `fights` / `fightsWon` | Stood in a fight / the crew won it (replaces `defeated`; see decisions) |
| `carries` | Successful crisis roll (not incident, not exit), difficulty >= 5, on an at-level job. `carriesByStat[stat]++` |
| `broughtHome` | Made the successful stabilise roll |
| `criticalsSurvived` | Was a critical patient and survived |
| `unscathed` | Completed and healthy at the end |
| `bigScores` | Completed, threat >= 4 |
| `seriousInjuries` | Ended the job with a serious/critical injury |
| `cleanStreak` / `bestCleanStreak` | +1 on a clean job; reset on any other |
| `with[otherId]` | +1 per crewmate on the same job |
| `activeWeeks` | +1 each Sunday if they worked in the last 7 days |

### 2.3 Paths (path = highest progress ratio; ties in table order)
Progress ratio = average over the path's conditions of `min(1, value / LegendThreshold)`.
| Path | Legend | Elite |
|---|---|---|
| Ghost | `clean >= 30` and `bestCleanStreak >= 10` | `clean >= 15` and `bestCleanStreak >= 5` |
| Enforcer | fights won and combat carries (**numbers to set in slice 3**; was `defeated >= 40`, `carriesByStat.combat >= 10`) | half of Legend |
| Earner | `bigScores >= 12` and `wins >= 60` | `bigScores >= 6` and `wins >= 30` |
| Iron | `unscathed >= 40` and `broughtHome + criticalsSurvived >= 5` | `unscathed >= 20` and `broughtHome + criticalsSurvived >= 3` |
| Lifer | `activeWeeks >= 52` and `jobs >= 80` | `activeWeeks >= 26` and `jobs >= 40` |

### 2.4 Fame tiers (`op.fame`, recomputed in `finish()` and `settleWeek`)
| Tier | Rule |
|---|---|
| unknown | Default |
| known | `jobs >= 6` |
| respected | `activeWeeks >= 6` and `atLevel >= 10` |
| elite | `activeWeeks >= 12`, `atLevel >= 20` (Lifer: `jobs >= 40`), any path's Elite met, `standing >= 40` when promoted. Automatic, with a milestone message |
| legend | `op.legend` set (permanent). Eligible when `activeWeeks >= 26`, `atLevel >= 40` (Lifer exempt), any path's Legend met, and the veteran condition (see decisions). Eligibility triggers the defining job |

Losing Elite: if `fame === 'elite'` and `standing < 20` on two Sundays in a row, fame drops to respected (history line; `wasElite`). They can regain it. Fame only goes up one tier at a time, once per `finish()`.

### 2.5 Standing (`op.standing`, 0-100)
Completed at-level job +6; below level +2; each carry +3 (max +9 a job); milestone +4; job lost or aborted -5; fight retreat -3; serious injury -10; `settleWeek` with no job: healthy -4, injured -2. Words: >= 70 At their peak, 40-69 Steady, 20-39 Fading, < 20 Washed-up (shown for Elite and Legend).

### 2.6 Effects (none touch rolls; `crewRoll`, `OPERATIVE_RULES`, `CREW_RULES`, `planRead` unchanged)
- **Wages.** Fame multiplier on the asking wage: respected x1.05, elite x1.20, legend x(1.15 + 0.25 x standing/100). **Changed by review:** see decisions (a random ask after fame promotes).
- **Named offers.** In `postJobs`, if the crew has an elite or legend with `standing >= 50`: 20% chance (`makeRng(seed ^ week)`) an offer asks for them (`offer.askedFor`, `payMult += 0.15`, applied in `finish()` only if they're on the crew). One a week at most.
- **Recruits.** In `scoutWeek`, with any elite or legend on the crew, lead quality weights become rookie 42 / pro 42 / veteran 16.

### 2.7 The city decides (defining job)
On first Legend eligibility: `op.legendCall`. Next `postJobs` adds one defining offer: a template the board could already offer, `threat >= 3` (3-4, see decisions), `threatDelta +1`, `payMult 1.5`, `askedFor`, `defining: opId`, 7 days. Success with them on the crew: `op.legend = { day, path, jobId }`, `fame = 'legend'`, special message. Failure, abort or expiry: `tries += 1`, a new call after 28 days, unlimited. Death after push-on on that job: the memorial entry gets `legend: { ..., posthumous: true }`.

### 2.8 Retirement (in `settleWeek`, after wages)
Eligible: not freelance, not on a job/away/side task, no open retirement message, `day >= retireSnoozeUntil`. **Rebased by review on tenure and injuries, not raw age** (see decisions). One request a week across the crew. Decision message (non-blocking, expires after 7 days): **Stay one more season** (wage x1.20 first time, x1.35 after; `retireSnoozeUntil = day + 56`) or **Let them go** (removed; gear to stash; Hall entry if elite/legend or `activeWeeks >= 26`). Expiry: they stay, `retireSnoozeUntil = day + 28`, **set when the message is sent** (expiry runs no code). Nobody leaves without a choice.

### 2.9 Milestones (priority order decides which fire when capped)
1. Path progress: reached Elite; halfway to Legend. 2. Firsts: at-level job, clean job, flawless job, carry, teammate brought home, job back after critical. 3. Counts: jobs 10/25/50/100; clean 10/25; carries 10/25; unscathed 25; bigScores 5/10; fights won 10/25. 4. Streaks: 5/10/15. 5. Bonds: `with[x]` 10 or 25 (one milestone for the per-job cap). 6. Tenure: activeWeeks 12/26/52.
Caps: one per runner per job, two per job; the rest queue in `record.pending` (max 3) and fire next job. Existing messages (crew tattoo at `TATTOO_JOBS`, graduation, earned traits) aren't duplicated; jobs 10 is suppressed when the tattoo fires the same job.

### 2.10 Highlights
`record.highlights`, max 3: `{ id, day, text, weight }`. Weights: legend 100, elite 80, defining job 70, brought home 60, critical survived 50, streak 10+ 45, bond 25 40, counts 20-35, firsts 15. A heavier one replaces the lowest.

## 3. State
Runner (all new): `fame`, `standing`, `legend`, `legendCall`, `retireSnoozeUntil`, and `record` (slice 1: see `freshRecord()` in `core/record.js`; slice 2+ adds `milestones`, `pending`, `highlights`, and slice 3 adds `lowWeeks`, `wasElite`, `stayed`). Root: `hall: []`. Memorial entries gain `fame`, `path`, `legend`, `record` (short summary). Offers gain `askedFor`, `defining`. Retirement is a decision message (`kind: 'retirement'`, add to `RESOLVERS` in `core/decisions.js`).

## 4. Hook points
`finish()` (mission.js): record, standing, milestones, fame, defining-job resolution, named-offer pay. `settleWeek` (time.js): `weeklyRecord` (done), decay, Elite lapse, `checkRetirement`. `postJobs`/`addOffer` (jobs.js): named and defining offers. `scoutWeek` (recruits.js): quality weights. `renewals.js`: fame wage ask. New modules: `core/record.js` (done), `milestones.js`, `fame.js`/`career.js`, `retirement.js`, `legend.js`; data `milestones.js`, `paths.js`, `retirement.js`.

## 5. UI
Runner page: badge line, Record fold (done), path bar, highlights. Squad board dossier and crew list: fame badge for elite/legend only plus one highlight line. Job cards: "Asks for X" chip; defining job "Their moment" tag. Reports: milestone lines. Crew screen: Hall beside the memorial. Inbox: retirement decision (two 44px buttons).

## 6. Save migration
v29 to v30 (done for the record). Later slices add fields with defaults and bump again (v31...).

## 7. Tests
Rule tests per slice (see the record tests in `tests/record.test.js`). Later: never more than 2 milestones a job or 1 per runner; fame never skips a tier; Legend never drops; Elite drops only after 2 low Sundays; `planRead`/`successChance` identical before and after fame changes; a defining offer's risk read includes its `threatDelta`; posthumous Legend only after push-on; nobody retires without the choice; no retirement while on a job; retirement and named-offer rolls don't change `state.rngCounter`; content has no unfilled `{placeholder}`.
Balance sim (new `tests/fame-sim.test.js`, `playWeeks(78, seed, carefulPolicy, { startCrew: 'fresh', hireAbove: 10000 })`, 60 seeds): median first Legend >= week 30; >= 40% of runs no Legend by 78; never more than 2 living Legends; Elites at week 52 median 0-3; retirements by 78 median 0-2 and >= 20% of runs have one; death bands unchanged. Re-run the existing economy bands and `scripts/sim-early-game.mjs` at 26 weeks and re-measure the baseline (the proposal's "¥24,150" was not found in the repo; the owner said not to worry about it).

## 8. Content to write (owner)
~35 milestone lines (one per id, variants for the 6 commonest; tags `{op}`, `{other}`, `{n}`, `{district}`); 5 path names and one-liners; 5 Elite messages; 5 Legend-call briefs; 5 Legend-earned + 1 posthumous; 1 Elite-lost; 6 retirement requests (per role); 6 stay + 6 let-go replies; 5 Hall epitaphs + 1 generic; 3 named-offer chips; 4 standing words (fixed).

## 9. Risks
Economy drift (named offers add cash, fame wages remove it; both Elite+ only). Recruit shift strengthens late hiring. Legend pile-up if retirement is too rare (the sim catches it; levers are retirement chances or path thresholds, never a cap). Tone: "Enforcer" over "Butcher". Morale is being cut: nothing here reads it. `op.trust` stays unused; bonds use `record.with`.

## 10. Draft decision-log row
Logged as the 2026-11-03 row in `docs/design/2026-11.md` (slice 1). The full row for the whole system is written when slice 3 lands.

---
## Review decisions (2026-11-03, owner + code review; these override the text above)
1. **Pro to veteran promotion is added** (slice 3), so the veteran condition for Legend can be met by growth, not only by recruiting (veterans were 12% of leads, and `development.js` only promoted rookie to pro). Threshold to be set in slice 3 and checked against the growth, wage and renewal tests.
2. **Fame wage:** when fame promotes a runner, a random chance they ask for a raise (a renewal-style message), instead of a multiplier on a renewal that rarely triggers for near-ceiling runners.
3. **Retirement is based on tenure and injuries, low when young and rising with tenure.** Proposed: 0% until 52 active weeks; then 0.5% a week plus 0.1% per further 10 active weeks; +1% a week per serious injury; age only ever raises it a little (x1.5 over 40, x2 over 50; no effect under 40); an Elite or Legend under 40 is capped at 1.5% a week; overall cap 15% a week; one request a week across the crew. (Raw age 45 would have hit hired veterans, aged 38-52, on day one and never touched rookies.)
4. **Event `difficulty`:** crisis roll events now record `choice.difficulty` (done in slice 1) so carries can tell hard from easy.
5. **Enemies defeated is dropped** (per-runner credit isn't tracked). `fights`/`fightsWon` (everyone who stood in the fight shares it) replace it; Enforcer uses fights won and combat carries.
6. **Defining jobs use threat 3-4 templates:** `jobView` clamps `threatDelta` to the template's range, so +1 does nothing on a threat-5 template.
7. **Name:** `op.record` (not `career`); Enforcer (not Butcher); memorial and Hall entries store a short summary, not the whole record; a `hash` helper for retirement/named-offer rolls is new in `core/rng.js`.
8. **Baseline:** don't pin the proposal's ¥24,150; re-measure when needed.
