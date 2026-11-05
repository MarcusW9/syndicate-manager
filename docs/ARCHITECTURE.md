# Architecture — Syndicate Manager

Snapshot of `main` at `b988fd6` ("City becomes the command centre, part 1", #78), plus raids (save v40), `SAVE_VERSION` 40, about 473 top-level `test(` calls in 55 test files (564 tests). Refreshed 2026-11-05. Counts and line numbers date quickly; check the code. Short orientation lives in `CODEMAP.md`. Where something could not be confirmed it says **unclear**.

---
## 1. STACK & STRUCTURE

**Stack.** Plain JavaScript (ES modules) + Vite 5.4. No UI framework, no state library. Deps: `@fontsource/rajdhani`; devDeps `vite`, `playwright 1.63.0`. Scripts: `dev`, `build`, `preview`, `test` (`node --test tests/*.test.js`), `test:fast` (skips the slow files development, fame-sim, heat, rules, startcrew), `screenshots`. `vite.config.js` uses `base: './'` (GitHub Pages / iOS wrap) and the build writes an offline service worker `sw.js`.

**Layering (enforced by CLAUDE.md):** `src/core` = pure logic (clone state, mutate the clone, return it; no DOM, no storage, no `Math.random`). `src/ui` = only DOM code. `src/save/save.js` = only storage code. `src/data` = content as data. `src/config/names.js` = all names.

**Entry point.** `index.html` has `<div id="app">` and loads `src/main.js`:
```js
if (import.meta.env.DEV) { const problems = [...validateMissions(MISSIONS), ...validateCrew(STARTING_CREW)]; if (problems.length) console.error(...) }
let state = loadGame();
if (!state) { state = createNewGame({ startCrew: 'pick' }); saveGame(state); }
mountApp(document.getElementById('app'), state);
// PROD only: navigator.serviceWorker.register('./sw.js')
```

**src/core** (purpose from each file's header):
| file | purpose |
|---|---|
| state.js | `createNewGame`, `SAVE_VERSION`, founders, `freshCondition` |
| time.js | `advanceDay` (ends with `advanceAway`), `settleWeek`, `weeklyBill`, `isBlocked` |
| week.js | the weekly rhythm: `billDue`, `mondayBrief`, `weekSummary` (Sunday), `crewStandard` / `crewAgainstStandard` |
| mission.js (~1050 lines) | squad run: `startMission`, crises, criticals, `advance`, private `finish` |
| runbattle.js / battle.js / fightspots.js | fights inside a run; command fights; map spots/cover |
| autorun.js | hands-off steps and orders (`autoStep`, `needsPlayer`, `dayDone`, `leadTakes`) |
| away.js | crews out play a share a day: `advanceAway`, `takeCall`, `letThemRun`, `takeCommand`, `crewsOut`, `phaseOf` |
| lead.js | a crew's lead (`crewLead`) |
| jobs.js | job offers, board arrivals (grow with the roster: `arrivalsPerWeek`, `maxOffers`), an offer's days (`daysRange`), named offers, reputation gates |
| clients.js | client trust |
| crew.js | availability, `crewRoll`, roll-modifier rule lists, injuries |
| development.js | XP / growth / graduation |
| earned.js | earned traits (`afterJob`, `earn`, `noteInjury`) |
| recruits.js | generation, scouting, hiring |
| halls.js | the tong's halls, one per district (`openHall`, `expandHall`, `moveToHall`, `introduceHalls`, `syncHalls` keeps `rosterCap`, `rent`, rank) |
| tong.js | the tong's rank (`rankOf`) |
| raids.js | police raids on the halls: `checkRaids` (day tick: warns, knocks), `payOffRaid`, `RAID_RESOLVER`, `startRaidFight` (the hold as a job `raid:<district>`), `finishRaid` (called by `finish()`) |
| renewals.js | contract renewals |
| heat.js | heat per district (`heatIn`, `addHeat`, `coolHeat`, `hottest`, `watchedIn`), fixer notice |
| money.js, pricing.js | formatting; wages |
| squad.js, risk.js | planning read (`coverage`, `planRead`, `planTries`, `jossPicks`, `leanPicks`), `successChance`, `riskLabel` |
| worth.js | a runner's value (`crewValue`) and what a job gives them (`jobGain`, the picker sheet) |
| report.js, feed.js, upcoming.js | report text / run feed events / "coming up" |
| sidetasks.js | one-roll bench tasks |
| gear.js, looks.js, marks.js | gear shop/loadouts, gun looks, scars/tattoos |
| specialisations.js, tiered.js, statuses (data) | specialisms etc. |
| rumours.js, incidents.js, decisions.js, loyalty.js, freelance.js | rumours; incidents woven into runs; blocking decision messages; unclear loyalty (see §12); freelancers |
| rng.js, random.js | mulberry32 + saved-counter wrapper |
| validate.js, types.js | content validators; JSDoc typedefs (partly stale) |
| record.js | runner record: per-person job counters (`recordJob` in `finish()`, `weeklyRecord`, `seedRecord`); counts only |
| milestones.js | moments a record crosses a line: `checkMilestones` after a job, `addHighlight` (best three kept) |
| fame.js | fame tiers (unknown to elite), standing 0-100, paths, Elite lapse, Legend readiness (`afterJobFame`, `weeklyFame`, `seedFame`) |
| jobcheck.js | lints a job template beyond `validate.js` (`scripts/check-job.mjs`) |

**src/data:** fame, milestones, paths (renown numbers and wording, declarative), approaches, battle, cast, city, clients, districtCrises, districtIncidents, districts, earnedTraits, economy, gear, gearLooks, growthLines, incidents, `missions.js` + `missions/*.js` (54 jobs), away (quiet-day lines), halls, tong (ranks), operatives (authored "Lantern Bay Five"), partner, recruitPools, rookieCrises, rumours, sideTasks, sites, situations, specialisations, statuses, tags, traits, twists.

**src/ui:** app.js (~2400 lines, all screens + routing), board.js (squad board/plan), citymap.js, districtArt.js, siteplan.js, fightorders.js, watch.js (live run view), gear.js, art.js, icons.js, styles.css.
**Also:** `src/offline/serviceWorker.js`, `src/save/save.js`, `src/config/names.js`.

**tests/**: 55 `*.test.js` files (rules, economy/development/heat/startcrew sims, founders, reports, earned, sidetasks, autorun, saves, battle, etc.) and helpers `play.js`, `develop-sim.js`, `heat-sim.js`. Docs: CODEMAP.md, DESIGN.md, CHANGELOG.md, STATE-OF-PLAY.md, HANDOFF.md, WORLD.md, ART.md, PLAN-*.md.

---
## 2. GAME STATE

**Where it lives.** One module-level `let state` in `ui/app.js`; saved to localStorage after every change. **Update pattern:** core functions take `prev`, `structuredClone` it, mutate, return it. UI: 
```js
setState(next){ state = next; saveGame(state); render(); }
```
`render()` replaces `root.innerHTML` wholesale (topbar, nav, main, dock). Exception: a running job's watch screen is patched in place (`isWatching`/`syncWatch`). Click handling is delegated: `onClick` finds `[data-action]` + `data-id` and switches on the action.

**Root shape** (`createNewGame` in `core/state.js`):
```js
{ version: SAVE_VERSION /*39*/, seed, day: 1, cash: 8000, heat: 0 /*the hottest district*/, heatBy: {} /*district → 0-10*/,
  heatNoticeDay: null, heatWatched: false /*or a district*/, rumour: null, reputation: 0, jobGates: false,
  rank: 'backroom' /*the tong's rank, data/tong.js*/, weekStart: null /*{day, cash, reputation}*/, rent: 4000, difficulty,
  crew, stash: [], inbox: [welcome], memorial: [], jobs: [], jobSeq: 0, rngCounter: 0, activeMission: null,
  awayJobs: [], sideBoard: [], sideOut: [], intel: {}, recruits: [], freelancers: [], recruitSeq: 0,
  rosterCap: 8 /*all halls' beds*/, halls: [] /*{district, beds, rent, level, opened, shutUntil?}; home hall set at start*/, hallOffers: [],
  raids: [] /*police raids on the halls, v40*/,
  clients: {}, founding: null }
```
'pick'/'fresh' starts also set `rent = 1500`, `jobGates = true`, open board `['clinic','ledger','container409']`, then call `refreshFreelancers`, `refreshSideBoard`, `refreshArmoury` (adds `armoury {day, offers}`), and set `dayStartCash`. Optional fields appear later: `lastJobDay`, `lastBackupDay`, `ironman {id, seq}`, `namedOfferWeek`. `chooseFounders(prev, ids)` picks 3 of 6 candidates. `types.js` typedefs are partly stale.

---
## 3. RUNNERS / OPERATIVES

```js
{ id, name, handle, age, origin, role /*medic|muscle|tech|driver|face|infiltrator*/,
  stats: {combat, stealth, tech, social, driving, medical, cool},   // 1–20
  traits, wage, color, bio, potential, scoutError, scoutReport, tier /*rookie|pro|veteran*/,
  condition: {fatigue, morale, neuralLoad, burnout, injury /*healthy|light|…*/, injuryDays, awayUntil},
  trust: {},            // op→op; nothing reads it
  history: [strings], progress, startStats, growthLog, status: [{id, until}],
  jobsWithCrew, contractMainStat, lastNoticeDay, renewalAgain,
  gear: {weapon, armour, tool, implant}, marks: [{kind: 'scar'|'implant'|'tattoo', day}],
  hall /*the district whose hall they sleep in (core/halls.js); freelancers have none*/ }
// renown (2026-11), written once a job finishes: record: {jobs, atLevel, wins, clean, flawless, fights, fightsWon, carries, carriesByStat,
//   broughtHome, criticalsSurvived, unscathed, bigScores, seriousInjuries, cleanStreak, bestCleanStreak, with:{opId:n}, activeWeeks, lastJobDay,
//   milestones:[ids], highlights:[{id,day,text,weight}] (best 3), lowWeeks, wasElite, estimated},
//   fame: 'unknown'|'known'|'respected'|'elite', standing: 0-100. None of these touch a roll, pay, heat or the risk read.
// added lazily: earned: [{id, day, district?, client?, partner?, uses?}], track: {hidden counters},
//               spec: {id, day}, specSnooze, freelance (flag)
```
Morale and burnout exist and are written (in `finish`, `settleWeek`) but nothing reads morale; STATE-OF-PLAY says the owner agreed to cut them, main still has them.

**Generation** (`core/recruits.js`): `generateRecruit(state, {role, quality, founder})`. Quality weights: rookie 50 (primary stat 10–13), pro 38 (13–16), veteran 12 (15–18); founders primary 8–11. Wage = `marketWage × (founder 0.6 | rookie 0.5 | 1)`. Also rolls `potential`, `scoutError`, may carry gear; id `r${recruitSeq}`. `generateFounderCandidates` (6), `generateStartingCrew` (5, 'fresh'). `scoutWeek` (Wednesday: 1 lead, 2 if crew < 4, lead lasts 7 days), `hire` (signing fee = wage), `recruitToOperative`, `expandSafehouse`. The 'classic' start uses the authored Lantern Bay Five (`data/operatives.js`).

**Per-runner history.** Skill tier moves rookie to pro (`GRADUATE_AT`) and pro to veteran (`VETERAN_AT`: main stat 16 and 50 jobs, checked after each job, `promoteVeteran` in development.js); fame is separate from tier. `op.history` (strings such as "Day 12: graduated from rookie"), `jobsWithCrew` counter, `growthLog`, `marks` (scar/implant/tattoo around 10 jobs), earned traits with hidden `op.track`, `spec`. **No per-runner kill, job-by-job win/loss or per-client record exists** — **unclear/not tracked** (kills aren't recorded; battle events record guard actions only).

**Death / critical / memorial.** A failed roll can injure (`setInjury`, `noteInjury`); a bad injury makes the runner *critical* (`am.critical`). The player then chooses stabilise (difficulty 9, +1 heat), extract (serious injury, 21 days, payCut +0.5, job aborted) or push on (adds them to `am.untreated`). All deaths are resolved in `finish`: chance = 1 if story/aborted-rule case else 0.35 (+0.3 w/ medic). Design rule: **death only follows a player choice**. Dead are removed from `crew` and:
```js
memorial.push({id,name,handle,role,color,age,marks,day,cause, record: recordSummary(op)})
```
Others on the crew get morale −15.

---
## 4. TIME & ECONOMY LOOP

`time.js advanceDay`: daily per operative — statuses expire, fatigue −8, neural load −3 (to implant floor), injury countdown; then `dailyTraits`, `checkSpecialisations`, renewal re-asks, inbox expiry, `tickJobs` (board arrivals), recruits expire, `returnSideTasks`, and last `advanceAway` (each crew out plays today's share; one that needs the player waits with a blocking call). Wednesday: `scoutWeek`. Monday: `driftTrust`, `refreshFreelancers`, `refreshSideBoard`, `refreshArmoury`, `rollRumour`, `introduceHalls`; Monday of week 1: `newSeason` (aging). The Monday briefing (`week.js mondayBrief`) is read by the UI. **Sunday: `settleWeek`** — `weekSummary` (the week's jobs and money, before the bills), `weeklyRecord` (active weeks), `weeklyFame` (bench standing decay, Elite lapse), wages + rent deducted (if broke: morale −10), every district's heat −2 (`HEAT_COOL_WEEKLY`), `checkHeatNotice` (the hottest district at 6+, 14-day cooldown), fixer. `isBlocked` = active mission, founding, or unresolved blocking messages. `weeklyBill`.

**Money (`state.cash`) change points:** heat.js (fixer ¥1500) · recruits.js (signing fee; expansion) · sidetasks.js (pay) · gear.js (buy/sell) · mission.js (con bribe at start; choice success/failure cash; `finish` pay) · time.js (weekly bill).

**Heat (per district since v39, `core/heat.js`):** `state.heatBy` holds each district's heat (0–10); `state.heat` is kept as the hottest, for the top bar and anything that reads one number. It changes only in `finish` (`addHeat(state, tpl.district, heatGain)`), side-task failure (the task's district), the fixer (pays to cool the named district) and weekly cooling (every district −2). Letting the fixer's warning ride sets `state.heatWatched` to that district: the next job *there* starts watched (−1 on its first crisis roll). Sources of `am.extraHeat`: overwatch shots, incident failures, going loud (+2), choice costs, stabilise (+1), battle rounds, press, retreat; Ghost Driver / Clean Professional shave 1.

---
## 5. JOBS & MISSIONS

**Offer** (`core/jobs.js`): `{id:'job-N', templateId, clientId, payMult, threatDelta, twist, hinted, offeredDay, expiresDay, days, askedFor?}` (`days` rolled from `daysRange`, pay +`EXTRA_DAY_PAY` 5% a day over the template's; `askedFor` names the runner a named offer wants). Board: at least `MAX_OFFERS 5`, more as the roster grows (`maxOffers`, `arrivalsPerWeek`); arrivals spread over `ARRIVAL_WINDOWS [[0,1],[2,3],[4,5,6]]` from `makeRng(seed ^ week)`; `postJobs` puts rookie work first when gated, `TWIST_CHANCE 0.25`. **Reputation gates:** `JOB_GATES = {1:10, 2:15, 3:35, 4:60, 5:80}` (threat level → reputation needed; rookie jobs always open). `jobView` applies rumour threat shift and client `trustPay`.

**Template (shortened, container409):**
```js
{ id:'container409', name, district:'docks', threat:1, rookie:true, pay:1600, days:1, crewSize:2, keyStats, brief, beats:[…4],
  crises:[ { id:'cutter', situations:['police','law'], text:'A Wet Sleeve cutter cuts its engine…',
    choices:[ { id:'shadow', label:'{op} melts into the shadow…', kind:'adapt', stat:'stealth', difficulty:6, success, failure,
                failureInjury:'none', failureCost:{heat:1}, report:{success, failure} },
              { id:'splash', kind:'push', stat:'cool', difficulty:5, failureInjury:'light', … },
              { id:'abort', kind:'abort', stat:'cool', difficulty:0, cost:{payCut:1, clientTrust:-5}, … } ] } ] }
```
Other choice fields: `requires {kind: role|stat|trait, value, min}`, `successCost`, `sure`, `neural`, `focusRole`, `after`, `order`.

**Roll rule everywhere:** `d20 + stat >= 10 + difficulty`. Modifiers are rule lists `{id, applies, value, note}` in `core/crew.js` (OPERATIVE_RULES, CREW_RULES). "Shown risk equals used risk."

**Planning risk read** (`core/squad.js`, `core/risk.js`): `coverage(template, crew, approach, {threat, overwatch, intel, wheels, jobId})` returns rows per likely incident (handler, chance, save, fight odds, effective risk) and `toughest`; `planRead(state, job, {crew, approach, overwatch, kit, wheels})` takes the worse of `assessJob` and coverage. `successChance(stat, difficulty)` clamped 0.05–0.95; `riskLabel` thresholds 0.75/0.5/0.3 → safe/low/moderate/high/extreme; rookie jobs eased by `ROOKIE_EASE 2.5`.

**Approaches** (`data/approaches.js`): stealth (+1 stealth, +1 day), tech (+1 tech, neural 5/roll), loud (+1 combat, heat 1, −1 day), con (+1 social, bribe 100/threat). Each has `favours`/`avoids` situation lists.

**Run flow** (`core/mission.js`):
1. `startMission(prev, jobId, crewIds, approach, opts={overwatch:{id,kit}, wheels, standby, callIn:'every'|'risky'|'never', orders})` — draws 2 crises (3 at threat 4+) weighted by approach favours/avoids and rumour boost; spreads between beats; weaves incidents (`planIncidents`/`weaveIncidents`); inserts any twist; charges con bribe; `days = tpl.days + ap.days`. Builds `state.activeMission`:
```js
{ jobId, templateId, crewIds, approach, days, bribe, overwatch:{id,kit,left}|null, wheels, standby:{id,used}|null, callIn, orders,
  alert:0, out:[], pending:null, wentLoud:false, battle:null, fought:false, pay, threat, threatDelta, clientId, twist, queue, step:0,
  log:[], payCut:0, extraHeat:0, clientTrust:0, watched, critical:null, stabiliseFailed:false, untreated:[], focusOp:null,
  aborted:false, done:false, result:null, growth:[], graduated:[], report:[], events:[] }
```
2. Steps: `revealBeat`, `enterZone`, `runIncident`, `runBattle`, `describeCrisis`/`chooseOption`, `describeCritical`/`resolveCritical`, `describePending`/`resolvePending`, `exitRun`, `advance`, `closeMission`.
3. `chooseOption` roll:
```js
const die = choice.sure ? null : d20(rng); const need = 10 + rollDifficulty(am, choice);
const success = choice.sure || die + roller.value >= need;
```
records an event `{actor, stat, value, notes, die, need, success, outcomeCost, injury}`; failure may injure/make critical. Aborts/extracts end the run through `exitRun`.
4. `advance` calls `finish` when the queue is empty.

**The finish function.** `finish(state)` in `src/core/mission.js` (~line 861; private, not exported). Called from `advance`, `exitRun`, `resolvePending`, `resolveCritical`. Input: the (cloned) state with `activeMission`. Writes:
- **Deaths** for `untreated` (→ remove from `crew`, push to `memorial`).
- **Cash:** `pay = round50(basePay*(1-payCut))`; `cash += pay − freelancer cuts`.
- **Heat:** `heatGain = (aborted ? 0 : tpl.heat + APPROACHES[approach].heat) + extraHeat`; `state.heat = clampHeat(...)`.
- **Reputation:**
```js
const gain = (am.aborted ? -ABORT_REP : threat * REP_PER_THREAT) - (am.repCut ?? 0);
state.reputation = Math.round(Math.max(0, Math.min(100, state.reputation + gain)) * 10) / 10;
// REP_PER_THREAT = 0.75, ABORT_REP = 3
```
- **Client trust:** `adjustTrust(clientId, base + am.clientTrust + favourite)`, base = −3 on abort else `completionTrust(threat) = 4 + threat`.
- **Survivors:** `jobsWithCrew++`, growth (`XP.job`, `XP.craft`), graduation inbox message, `checkRenewal`, specialisations, fatigue `+10+threat*6`, `awayUntil`, morale ±, `history` line, marks, neural warning.
- **Result:** `am.result {report, outcome:'loss'|'aborted'|'completed', pay, heatGain, injuries, deaths, freelance, growth, graduated, client, trustChange}`; inbox report message with `timeline {result, steps, outcome, events, summary: summariseRun(...), orders, callIn, liveOrders}` (old full logs trimmed to `REPORT_LOGS_KEPT`).
- Renown (2026-11): `recordJob` before deaths are removed (the dead too; their memorial entry gets a short `record`), `checkMilestones` for survivors (report line `Milestone: …`, tone `milestone`), `afterJobFame` (standing, fame, Elite message; line `Fame: …`). Crisis roll events now carry `difficulty` (carries need it).
- Then `reactToJob` (rumours) and `afterJob` (earned traits).
- Fights: pulling back (`runbattle.js retreat`) sets payCut 1, adds heat, `am.repCut += BATTLE.retreat.rep`.

**Concurrent jobs.** One live `state.activeMission` (the watch screen), plus any number of crews out: `state.awayJobs [{returnDay, mission, waiting?, today}]`, where `mission.away = {beats, day, command}` (save v35). `advanceAway` plays each a share a day (`beatsByDay`); when a step needs the player the entry is `waiting` with a blocking `kind: 'callin'` message. `takeCall` moves it into `activeMission`, `letThemRun` hands it back for the rest of the day, `takeCommand` plays the rest live. A crew's lead (`lead.js`, `autorun.js leadTakes`) may take one risky call. Plus `state.sideOut` (side tasks). Hands-off crews always extract at a critical, never push on.

**Mission log / report text.** Every run records `am.events` (kinds: beat, zone, roll incl. incident, save, decision, exit, battle, critical, aftermath, twist, sure). `core/report.js` builds Joss's opening line, turning point, standout, what hurt; the inbox report has a "Full log" fold with dice. Per-crisis report lines (`choice.report.{success,failure}`) are hand-written and a test keeps them present.

---
## 6. CRISES & CONTENT

A crisis is shown in §5's template: `{id (globally unique), situations[], text, choices[]}` with choice fields above. Extra: `rookieCrises.js`, `districtCrises.js`, `incidents.js`/`districtIncidents.js` (smaller zone incidents), `twists.js` (e.g. `twist_rival_crew`), `situations.js` (tags like police/law/crowd/hardware used by earned traits). Content lives in `src/data/`; names in `src/config/names.js`; narrative/lore in WORLD.md/DESIGN.md. **Validation:** `core/validate.js` — `validateMissions` (beats exist, `after` in range, an abort/extract exists, failure text present, rookie report lines), `validateCrew` (18+), `validateRecruit`; run at dev boot and in tests.

---
## 7. RANDOMNESS

Seeded and saved. `makeRng(seed)` is mulberry32 (`core/rng.js`). `nextRng(state)` (`core/random.js`) advances the saved `state.rngCounter` (`seed + counter*7919`), so results are reproducible after load/save. Weekly boards and arrivals use `makeRng(seed ^ week)` so they don't shift the shared counter. The only `Math.random` is in `save.js` (Ironman id).

---
## 8. SAVES

Format: JSON of the state in `localStorage`. Keys: `syndicate-active-slot`, `syndicate-slot-N`, `…-backup` (weekly), `…-unreadable`, `syndicate-ironman-progress`, legacy `syndicate-save-v1`. `storageGet/Set/Remove` are the only storage calls (swap for iOS). `saveGame` writes slot + weekly backup (not in Ironman). `loadGame` migrates; on failure `keepUnreadable` and returns null. `exportSave` downloads JSON; `importSave(file)` migrates then `checkIronman`; `loadBackup`.

**Versioning:** `SAVE_VERSION` 40 in `core/state.js` (v40: `state.raids` [{ id, district, by, warnedDay, day, answer, outcome, done, called?, paid? }] and `hall.shutUntil` after a hall is walked out of (`core/raids.js`). v39: `state.heatBy` { district: 0-10 }, heat per district; `state.heat` is the hottest; `state.heatWatched` names a district (`core/heat.js`). v38: `state.halls` [{ district, beds, rent, level, opened }] and `state.hallOffers`; `op.hall`; `state.safehouseLevel` gone (`core/halls.js`). v37: `state.weekStart` `{ day, cash, reputation }` for the Sunday summary, and `am.lead` on a job (`core/lead.js`). v36: `job.days`, an offer's own days (`core/jobs.js` `daysRange`). v35: away jobs play a share a day and can call in: `am.away` `{ beats, day, command }`, and on each `state.awayJobs` entry `waiting` and `today` (`core/away.js`). v34: `state.rank` replaces `state.tier`, the tong rank. v33, renown slice 4: `job.askedFor` / `am.askedFor` for named offers, `state.namedOfferWeek`, and `payload.reason` on pay-rise messages, `growth` or `fame`). `migrate(state)` throws on missing or newer version, then runs a chain `if (state.version === N) { …; state.version = N+1; }` from v1 to v40. Real code from `src/save/save.js` (head of the chain, then the v26→v32 blocks; v1→v25 and v33→v39 omitted for length, see the file):
```js
// Upgrade old save formats when SAVE_VERSION changes.
function migrate(state) {
  if (typeof state?.version !== 'number') throw new Error('Not a save file');
  if (state.version > SAVE_VERSION) throw new Error('This save is from a newer version of the game. Reload the page to update, then try again.');
  if (state.version === 1) {
    // v2 added the job board and missions.
    state.jobs = state.jobs ?? [];
    state.jobSeq = state.jobSeq ?? 0;
    state.rngCounter = state.rngCounter ?? 0;
  // … v1→v25 blocks omitted …
  if (state.version === 26) {
    // v27: a loud run's first guard is always a fight (am.fought: has this run had one yet). A job
    // saved mid-way has fought if its record shows a fight.
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) {
      if (am) am.fought = am.fought ?? (am.events ?? []).some((e) => e.kind === 'battle' && e.phase === 'start');
    }
    state.version = 27;
  }
  if (state.version === 27) {
    // v28: command fights. Everyone in a fight stands in cover (cover; now: this round's, if an order
    // changed it; spot: where on the site map's spots, if the fight has any), the guards' next move is
    // rolled ahead (intents; none yet means the round rolls it), and a fight can be left to the crew (auto).
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) {
      for (const x of am?.battle ? [...am.battle.guards, ...am.battle.runners] : []) { x.cover = x.cover ?? 'half'; x.now = x.now ?? null; }
      if (am?.battle) Object.assign(am.battle, { intents: am.battle.intents ?? null, spots: am.battle.spots ?? null, auto: am.battle.auto ?? false });
      for (const x of am?.battle ? [...am.battle.guards, ...am.battle.runners] : []) x.spot = x.spot ?? null;
    }
    state.version = 28;
  }
  if (state.version === 28) {
    // v29: career marks and gun looks (brought in 2026-10-30 from the branch where they were made,
    // as its v25-v27). Career marks (core/marks.js): nobody has scars or chrome on record yet;
    // anyone who has already worked ten jobs with the crew gets the crew's mark now, with a line
    // saying so. Rifles already owned keep the look they had (gunmetal and wood, or carbon for pro)
    // and get a name; sidearms already owned become plain blued compact pistols with a name; the
    // armoury stocks its first rifles and sidearms. A sidearm may carry a rolled quirk (item.quirk);
    // none means the plain sidearm's numbers (core/gear.js sidearmStats).
    for (const op of state.crew) {
      op.marks = op.marks ?? [];
      if (!op.freelance && (op.jobsWithCrew ?? 0) >= TATTOO_JOBS && !op.marks.some((m) => m.kind === 'tattoo')) {
        op.marks.push({ kind: 'tattoo', day: state.day });
        op.history = [...(op.history ?? []), `Day ${state.day}: got the crew's mark (${TATTOO_JOBS} jobs together)`];
      }
    }
    for (const entry of state.memorial ?? []) entry.marks = entry.marks ?? [];
    const owned = [...(state.stash ?? []), ...state.crew.flatMap((op) => Object.values(op.gear ?? {}))];
    for (const item of owned.filter((i) => i?.type === 'rifle' && !i.look)) {
      item.look = { frame: 'marksman', finish: item.tier === 'pro' ? 'carbon' : 'street', engraving: null, charm: null };
      item.name = nameLook(state, `item|${item.uid}`, item.look);
    }
    for (const item of owned.filter((i) => i?.type === 'pistol' && !i.look)) {
      item.look = { frame: 'compact', finish: 'blued', mod: null, charm: null };
      item.name = nameLook(state, `item|${item.uid}`, item.look, 'pistol');
    }
    if (!state.armoury) refreshArmoury(state);
    else if (!state.armoury.offers.some((o) => o.type === 'pistol')) state.armoury.offers.push(...stockShelf(state, 'pistol'));
    state.version = 29;
  }
  if (state.version === 29) {
    // v30: runner record (core/record.js). Everyone who has worked gets one, guessed from the jobs they've
    // done (marked estimated); the memorial keeps no record for people who were lost before it began.
    for (const op of state.crew) seedRecord(op, { today: state.day });
    for (const m of state.memorial ?? []) m.record = m.record ?? null;
    state.version = 30;
  }
  if (state.version === 30) {
    // v31: milestones and highlights on the record (core/milestones.js). What a record has already
    // reached counts as earned, so an old crew doesn't get a flood of milestones on its next job.
    for (const op of state.crew) { if (op.record) delete op.record.milestones; seedMilestones(op); }
    state.version = 31;
  }
  if (state.version === 31) {
    // v32: fame and standing (core/fame.js). Everyone with a record gets standing from their jobs
    // (3 a job, at most 50) and the fame their record reaches, capped at respected: nobody starts
    // as Elite (it comes with its message once standing and the record back it up). The record
    // gains lowWeeks and wasElite (Elite lapsing). Memorial entries are unchanged.
    for (const op of state.crew) seedFame(op);
    state.version = 32;
  }
  return state;
```
**To add a version:** bump `SAVE_VERSION` in `core/state.js`, append a block `if (state.version === N) {…; state.version = N+1;}` to `migrate`, add a test (tests/saves cover "v1 save upgrades", "newer saves refused"), log in DESIGN.md/CHANGELOG.md.

---
## 9. UI

Screens (`screen` var in app.js): `inbox` (Today), `crew`, `jobs`, `city`, `settings` (Save); sub-views via module vars (`openMessageId`, `openOperativeId`, `openRecruitId`, `openArmoury`, `plan`, `sidePlan`, `cityTab`…). Founding screen renders first for new games. Nav: Today / Crew / Jobs / City (the command centre: crews out under the map), topbar with cash, heat, tier and a ☰ Save button; dock with Continue. Watch screen is `renderMission`. Main jobs are planned on the squad board (`ui/board.js`).

**Small example (`renderClients()`):**
```js
function renderClients() {
  return `
      <h2>Clients</h2>
      <div class="infoline"><p class="muted small">Where you stand with each.</p>${infoButton('clients', 'About client trust')}</div>
      ${infoText('clients', `${TRUST_NOTE} Who they are: City tab.`)}
      <ul class="clientstrip">
        ${CLIENTS.map((c) => { const t = trustOf(state, c.id);
          return `<li class="clientchip"><strong>${esc(c.name)}</strong><span class="trust trust--${trustTone(t)}">${esc(trustLabel(t))} · ${t}</span></li>`; }).join('')}
      </ul>`;
}
```
Reputation UI: a "Rep" compact line in the jobs screen (segmented track to the next `JOB_GATES` unlock + (i) info button); tier in topbar. **Styling:** single `styles.css`, CSS variables, "street-terminal" skin; shared classes `.panel .row .chip .jobcard .risk--{safe,low,moderate,high,extreme} .timeline .btn .seg/.segmented .dossier .watch`. **Mobile-first:** phone width 360–430 first, `--tap: 44px`, `env(safe-area-inset-*)`, breakpoints 420/520/760/900/1100/1400, no hover-only info (tap (i) to reveal), reduced-motion rules.

---
## 10. TESTS

Runner: Node built-in `node:test` (`npm test`); 55 files in `tests/`, one concern per file (rules, record/milestones/fame (renown), economy/development/heat/startcrew sims, founders, reports, earned, sidetasks, autorun, saves, battle…). Helpers: `play.js` (`playMission`, `randomPolicy`, `carefulPolicy`, `playWeeks`, `autoFounders`, `toCrisis`, `arm`, `testFight`, `commandOrders`), `develop-sim.js`, `heat-sim.js`.

**`tests/rules.test.js` rule tests:** (1) content passes validation; (2) every mission type has ≥6 crises; (3) nobody dies unless "push on" (3,000 random missions); (4) aborting always brings everyone home (300); (5) Story difficulty: nobody dies even pushing on (500); (6) no unfilled `{placeholder}`; (7) a v1 save upgrades with a job board; (8) newer saves are refused; (9) economy: a careful player survives the first month but is not rich; (10) heat cools by 2 every Sunday and stays 0–10.

**Economy "sane band" test** simulates 200 seeds of 4 weeks:
```js
for (let seed = 1; seed <= 200; seed++) results.push(playWeeks(4, seed));
// asserts: median cash > 0 && < 30000; broke < 35%; deathsPerRun < 0.1   (bands tuned 2026-10-23)
```
`playWeeks(weeks, seed, policy=carefulPolicy, {startCrew='classic', hireAbove})`: each non-Sunday day it takes the best-paying job it can staff (medic first, stealth approach), plays it with the policy, `closeMission`, optionally hires, then `advanceDay`. `founders.test.js` repeats it for the 3-founder start (broke <10%, nobody lost).
**Example test shape:** loop random seeds → `startMission` → `playMission(state, randomPolicy)` → assert `result.deaths.length === 0` unless push-on was chosen. (Exact source not pasted; **see tests/rules.test.js**.)

---
## 11. PROJECT RULES

**CLAUDE.md:** has a "Where to read for a task" routing table; read CODEMAP.md first; layer rules (§1); iOS rules (no hover-only info, phone-first, 44px taps, safe areas, seeded RNG); design rules (abort/extract on every crisis, death only after a player choice, operatives 18+, bump `SAVE_VERSION` + migration on any state-shape change); keep DESIGN.md log rows (supersede, never rewrite), CHANGELOG, screenshot log current; run `npm test` before pushing and never loosen tests; commits authored as `marcusw`, no Co-Authored-By / Claude-Session / "Generated with" lines.

**DESIGN.md:** sections — game in one paragraph, Setting, World, Tone, Starting crew, Decision log (now split by date into `docs/design/`; the index is in `DESIGN.md`; 246 rows from 2026-10-23 → 2026-10-30 plus newer files), Open questions. Row themes: foundations and death rules; development, renewals, pricing; world canon; progression and rookie start; UI skin/portraits; mission logs, hands-off, traits, situations, side tasks; money pressure, morale cut, per-district heat, relationships; squad run (approaches, incidents, overwatch, wheels, standby); gear, specialisations, sites, district art, offline; battles and command fights, sidearms.

---
## 12. PLAYTEST STATUS

CHANGELOG.md has no section titled "first playtest"; the playtest notes are mostly in DESIGN.md.
- **First playtest (2026-10-25, DESIGN.md):** owner felt "no sense of a climb" and no investment in crew development (the Five started near their ceilings with every job open). Changes after: five generated raw rookies, rent ¥1,500, gated job board (`jobGates`, save v12), reputation 0.75/threat, rookie jobs, growth cost ×2.5, then career/earned traits and the City map.
- **2026-10-27 owner playtest feedback (CHANGELOG + DESIGN):** squad picker separates free crew from the squad ("Already on the squad" greyed, slot tags); run feed is one line per moment with details on tap; "less to read" on Today and the job board (grouped "back from the job" lines, side-work one-liner, stat icons); crises name the right person (fixed 2026-10-28).
- **2026-10-28 owner feedback:** smaller (i) buttons, a reputation line styled like the Heat meter, tidier job-card icons.
- **2026-11-05 owner playtest of the tong's Phase 1 (HANDOFF + DESIGN):** call-ins about right; Take Command nice to have; outcomes readable; money fine; Today busy. Not happening yet: sending "the cheapest crew I trust" (the owner sent the best) and the bench mostly sat; lean picks (#75) were the first answer, districts as presence (Phase 2) the next.
- Later notes: owner feedback that hands-off results arrive too quickly led to animated/next-day report playback; open DESIGN question on whether heat "earns its place" (cut it if nobody notices). No later formal playtest is recorded — **unclear**.
