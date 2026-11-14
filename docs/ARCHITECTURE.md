# Architecture — Syndicate Manager

State shape, saves, the economy loop and tests: the detail behind `CODEMAP.md`. First written as a snapshot of `main` on 2026-11-05 (save v40) and added to since; the save history in section 8 is kept current, the shapes in sections 2 to 5 are checked against the code when touched. Counts and line numbers date quickly; check the code. Where something could not be confirmed it says **unclear**.

**What is not here (one fact, one home):** where each file lives and how a run flows: `CODEMAP.md`. What is on which tab: `docs/SCREENS.md`. The look: `docs/UI-SKIN.md`. Fight rules and numbers: `docs/BATTLES.md`. The other tongs: `docs/RIVAL-TONGS.md`. Project rules: `CLAUDE.md`. Why: the decision log (`docs/design/`).

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

**Files.** What each file in `src/core`, `src/ui` and `src/data` is for: `CODEMAP.md` ("Core files", "UI files", one file per line; grep the file name). Also: `src/offline/serviceWorker.js`, `src/save/save.js`, `src/config/names.js`; tests in `tests/` (section 10).

---
## 2. GAME STATE

**Where it lives.** One live binding `state` in `ui/view.js`, set only by `setGame` from `ui/app.js setState`; saved to localStorage after every change. **Update pattern:** core functions take `prev`, `structuredClone` it, mutate, return it. UI: 
```js
setState(next){ setGame(next); saveGame(state); render(); }
```
`render()` replaces `root.innerHTML` wholesale (topbar, nav, main, dock). Exception: a running job's watch screen is patched in place (`isWatching`/`syncWatch`). Click handling is delegated: `onClick` finds `[data-action]` + `data-id` and switches on the action.

**Root shape** (`createNewGame` in `core/state.js`):
```js
{ version: SAVE_VERSION /*39*/, seed, day: 1, cash: 8000, heat: 0 /*the hottest district*/, heatBy: {} /*district → 0-10*/,
  heatNoticeDay: null, heatWatched: false /*or a district*/, rumour: null, reputation: 0, jobGates: false,
  rank: 'backroom' /*the tong's rank, data/tong.js*/, weekStart: null /*{day, cash, reputation}*/, rent: 4000, difficulty,
  crew, stash: [], inbox: [welcome], memorial: [], jobs: [], jobSeq: 0, rngCounter: 0, activeMission: null,
  awayJobs: [], sideBoard: [], sideOut: [], intel: {}, recruits: [], freelancers: [], recruitSeq: 0,
  rosterCap: 8 /*all halls' beds*/, halls: [] /*{district, beds, rent, level, opened, owned (v44), shutUntil?, build: [{id, piece, x, y, rot, day}]}; home hall set at start*/, hallOffers: [], openings: {} /*each district's opening favour (core/halls.js), v43*/, heists: {} /*heists taken on (core/heists.js), v47*/, rivals: null /*the other tongs { tongs, cards, word, seq } (core/rivals.js), v51*/,
  raids: [] /*raids on the halls: police v40, gangs v41 (raid.by)*/, grudges: { redLanterns: 0, silverFan: 0 } /*v41*/,
  clients: {}, founding: null }
```
'pick'/'fresh' starts also set `rent = 1500`, `jobGates = true`, open board `['clinic','ledger','container409']`, then call `refreshFreelancers`, `refreshSideBoard`, `refreshArmoury` (adds `armoury {day, offers}`), and set `dayStartCash`. Optional fields appear later: `lastJobDay`, `lastBackupDay`, `ironman {id, seq}`, `namedOfferWeek`. `chooseFounders(prev, ids)` picks 3 of 6 candidates. `types.js` typedefs are partly stale.

---
## 3. RUNNERS / OPERATIVES

```js
{ id, name, handle, age, origin, role /*medic|muscle|tech|driver|face|infiltrator*/,
  stats: {combat, stealth, tech, social, piloting, medical, cool, endurance},   // 1–20; endurance since v61 (never rolled yet)
  traits, wage, color, bio, potential, scoutError, scoutReport, tier /*rookie|pro|veteran*/,
  condition: {fatigue, morale, neuralLoad, burnout, injury /*healthy|light|…*/, injuryDays, awayUntil},
  trust: {},            // op→op; nothing reads it
  history: [strings], progress, startStats, growthLog, status: [{id, until}],
  jobsWithCrew, contractMainStat, lastNoticeDay, renewalAgain,
  gear: {armour, implants: [≤2], bag: [{item, x, y}]} (the carry grid, v45; was {weapon, armour, tool, implant}), marks: [{kind: 'scar'|'implant'|'tattoo', day}],
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

`time.js advanceDay`: daily per operative — statuses expire, fatigue −8, neural load −3 (to implant floor), injury countdown; then `dailyTraits`, `checkSpecialisations`, renewal re-asks, inbox expiry and `trimInbox` (`core/inbox.js`: old news goes, anything actionable stays), `tickJobs` (board arrivals), recruits expire, `returnSideTasks`, and last `advanceAway` (each crew out plays today's share; one that needs the player waits with a blocking call). Wednesday: `scoutWeek`. Monday: `driftTrust`, `refreshFreelancers`, `refreshSideBoard`, `refreshArmoury`, `rollRumour`, `introduceHalls`; Monday of week 1: `newSeason` (aging). The Monday briefing (`week.js mondayBrief`) is read by the UI. **Sunday: `settleWeek`** — `weekSummary` (the week's jobs and money, before the bills), `weeklyRecord` (active weeks), `weeklyFame` (bench standing decay, Elite lapse), wages + rent deducted (if broke: morale −10), every district's heat −2 (`HEAT_COOL_WEEKLY`), `checkHeatNotice` (the hottest district at 6+, 14-day cooldown), fixer. `isBlocked` = active mission, founding, or unresolved blocking messages. `weeklyBill`.

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
- **Loot (2026-11-13):** a `completed` outcome calls `lootFor` (`core/loot.js`): one gear item into `state.stash`, or scrap cash (`LOOT.scrap`), plus one report line (tone `good` with a `tier`, or `plain`). `hashRng` only. Side tasks never reach `finish()`; hands-off runs do. A Custom or Premium drop is made by `makeItem` with its `perks` (`rollPerks`, `hashRng(seed, 'perks', uid)`, never the shared stream); the report line carries them as `perks`. Perks (`data/gearPerks.js`) are read by the same functions as the rest of the gear (`gearMods`, `seriousGuard`, `patchBonus`, `neuralFloor`, `overwatchKit`, and `weaponOf`/`armourOf` in `core/battle.js`, which both fight engines use), each held to `PERK_CAPS`; none adds to the stat its item already boosts (`perksFor` drops any that would).
- **Client trust:** `adjustTrust(clientId, base + am.clientTrust + favourite)`, base = −3 on abort else `completionTrust(threat) = 4 + threat`.
- **Survivors:** `jobsWithCrew++`, growth (`XP.job`, `XP.craft`), graduation inbox message, `checkRenewal`, specialisations, fatigue `+10+threat*6`, `awayUntil`, morale ±, `history` line, marks, neural warning.
- **Result:** `am.result {report, outcome:'loss'|'aborted'|'completed', pay, heatGain, injuries, deaths, freelance, growth, graduated, client, trustChange}`; inbox report message with `timeline {result, steps, outcome, events, summary: summariseRun(...), orders, callIn, liveOrders}` (old full logs trimmed to `REPORT_LOGS_KEPT`).
- Renown (2026-11): `recordJob` before deaths are removed (the dead too; their memorial entry gets a short `record`), `checkMilestones` for survivors (report line `Milestone: …`, tone `milestone`), `afterJobFame` (standing, fame, Elite message; line `Fame: …`). Crisis roll events now carry `difficulty` (carries need it).
- Then `reactToJob` (rumours) and `afterJob` (earned traits).
- Fights (full rules for both engines: `docs/BATTLES.md`): pulling back (`runbattle.js retreat`) sets payCut 1, adds heat, `am.repCut += BATTLE.retreat.rep`. The five jobs of the battle rework (`data/fights.js FIGHT_JOBS`) play engine 2: `am.battle` has `engine: 2` and the shape in `core/fight.js`'s header (`type`, `stage`, `round`, `enemies`, `runners` with pips, `threats` drawn for the round, `orders`, `risk`, `goal`, `end`), plus `startLines` and `auto`; its call-ins are `am.pending` `{ kind: 'dilemma', id, key, day, slots }` or `door`; `am.fightDead` (ids killed in the moment, finished in `finish()`), `am.missing` ([{ id, until, down }], left behind) and `condition.missing` { since, until } on a runner are optional and read with defaults.

**Concurrent jobs.** One live `state.activeMission` (the watch screen), plus any number of crews out: `state.awayJobs [{returnDay, mission, waiting?, today}]`, where `mission.away = {beats, day, command}` (save v35). `advanceAway` plays each a share a day (`beatsByDay`); when a step needs the player the entry is `waiting` with a blocking `kind: 'callin'` message. `takeCall` moves it into `activeMission`, `letThemRun` hands it back for the rest of the day, `takeCommand` plays the rest live. A crew's lead (`lead.js`, `autorun.js leadTakes`) may take one risky call. Plus `state.sideOut` (side tasks). Hands-off crews always extract at a critical, never push on.

**Mission log / report text.** Every run records `am.events` (kinds: beat, zone, roll incl. incident, save, decision, exit, battle, critical, aftermath, twist, sure). `core/report.js` builds Joss's opening line, turning point, standout, what hurt; the inbox report has a "Full log" fold with dice. Per-crisis report lines (`choice.report.{success,failure}`) are hand-written and a test keeps them present.

---
### Adding a client (2026-11-07)

Clients are data. To add one:

1. **`src/data/clients.js`**: an entry with `id` (lower case, used as `{id}` in job text), `name`, `desc`, `district` (where they work), `affiliation` (who they work for or belong to, or `null`) and `jobs` (the templates they offer on the board). `affiliation` is description only: a client's trust, a faction's standing (`core/gangs.js` grudges) and hall access (`data/halls.js`) are kept apart, and where someone works is not who they work for.
2. **`src/data/cast.js`**: an entry with the same `id` and name (lines: `greet`, `approve`, `disappoint`) if job text names them with `{id}` or `{id:approve}`.
3. **Their jobs**: `src/data/missions/<job>.js` as usual. A hall's opening favour is not listed in `jobs`: `HALL_SITES[district].opening` names the job and `.contact` the client who asks it (and whose trust it moves); the template carries neither.
4. **Lore**: their dossier in `WORLD.md` "The clients" and a line in the context block (and its copy in `docs/new-job-prompt.md`), through the `add-lore` skill.

No save change: trust is `state.clients[id]`, and a client nobody has met reads as neutral (`START_TRUST`). The Jobs tab's client strip, Lore › Clients, the weekly drift and the board's client picks all read `CLIENTS`. `tests/clients.test.js` checks each entry.

## 6. CRISES & CONTENT

A crisis is shown in §5's template: `{id (globally unique), situations[], text, choices[]}` with choice fields above. Extra: `rookieCrises.js`, `districtCrises.js`, `incidents.js`/`districtIncidents.js` (smaller zone incidents), `twists.js` (e.g. `twist_rival_crew`), `situations.js` (tags like police/law/crowd/hardware used by earned traits). Content lives in `src/data/`; names in `src/config/names.js`; narrative/lore in WORLD.md/DESIGN.md. **Validation:** `core/validate.js` — `validateMissions` (beats exist, `after` in range, an abort/extract exists, failure text present, rookie report lines), `validateCrew` (18+), `validateRecruit`; run at dev boot and in tests.

---
## 7. RANDOMNESS

Seeded and saved. `makeRng(seed)` is mulberry32 (`core/rng.js`). `nextRng(state)` (`core/random.js`) advances the saved `state.rngCounter` (`seed + counter*7919`), so results are reproducible after load/save. Weekly boards and arrivals use `makeRng(seed ^ week)` so they don't shift the shared counter. The only `Math.random` is in `save.js` (Ironman id).

---
## 8. SAVES

Format: JSON of the state in `localStorage`. Keys: `syndicate-active-slot`, `syndicate-slot-N`, `…-backup` (weekly), `…-unreadable`, `syndicate-ironman-progress`, legacy `syndicate-save-v1`. `storageGet/Set/Remove` are the only storage calls (swap for iOS). `saveGame` writes slot + weekly backup (not in Ironman). `loadGame` migrates; on failure `keepUnreadable` and returns null. `exportSave` downloads JSON; `importSave(file)` migrates then `checkIronman`; `loadBackup`.

**Versioning:** `SAVE_VERSION` 67 in `core/state.js`. What each version added, newest first (one per line; grep `v52:`):

- v67: E1, each rival tong gains `habit` ('grinder' | 'boutique' | 'workshop' | 'oldhouse'), `releasedDay`, `signedSeason`; each card gains `best`, `bestDay`, `path` [{ tongId, day }] (and `fromTier` while it is between tongs); `state.rivals.keptSeason`; migration draws each habit by the new-game rule, `best` = today's rating, `path` from `fromTong` (`core/houses.js`).
- v66: gear perks: an item may carry `perks` (ids from `data/gearPerks.js`): a Custom item one, a Premium item two. Nothing in a v65 save has either tier, so the migration normally rewrites nothing; a Custom or Premium item with no `perks` is given the ones `rollPerks` makes from its own uid and the save's seed.
- v65: gear tiers renamed: an item's (or armoury offer's) tier `street` is now `standard`, `pro` is `verified` (stash, worn and carried, the fallen's, offers, copies inside a job in progress). A tong rank `street` and a runner tier `pro` are left alone. Drops on a completed main job (`core/loot.js`) need no state.
- v64: `state.tongName`, our tong's name (`core/tongname.js`); old saves get `NAMES.defaultTong`.
- v63: an engine-2 fight in progress gains `am.battle.spots`, its staging on the site map (`core/fightmap.js stageSpots`), computed from the job's site and the fight's start zone; staging only.
- v62: `raid.posts`.
- v61: endurance, the eighth stat (`op.stats.endurance`, with its `potential` and `startStats`), on every stored runner (crew, freelancers, leads, founder candidates), rolled from a hash of the seed and the runner's id with the bands their other stats came from (`core/recruits.js rollEndurance`); a fight in progress gets `am.battle.engine = 1` (the old fight code; battle rework slice 1).
- v60: C5, `state.rivals.book` { absMonth, entries [{ runnerId, name, grade 'S'..'D', move }], watch [runnerId], gone [{ runnerId, name }], everBooked [runnerId], base { runnerId: int }, prev { absMonth, entries } } or null until the first slate (`core/book.js`); `base` is hidden bookkeeping (last month's street score without the wobble) and never leaves the core.
- v59: C4, `state.rivals.threads` [{ id, tongId, family 'decline'|'founding'|'rise', stage, startWeek, lastBeatWeek, open, calm }] (stories told in beats, `core/rivals.js`), every rival card gains `runnerId` and `formerOf` ('player' for a runner of ours who left through D3, else null), every runner gains `runnerId` (one stable id across signing and leaving; `core/dossier.js`, `core/mobility.js`); migration backfills them and marks an `op:` card as ours.
- v55-v57: retirement and the Hall, loyalty, sworn runners, see DESIGN.md 2026-11-09.
- v54: `state.rivals` gains `offer` { cardId, day, expiresDay } (the free name put forward), `scouted` { cardId: 0-3 }, `lastScout`, `offerSeq`, `nextOfferDay`, `lastOffer`; each tong's `grudge` becomes `regard` (-5 to +5) and gains `poorWeeks`, `splitDay`, `foldedDay`; a card may carry `fromTong`; a tong's `status` can be 'folded'; signed cards leave `rivals.cards` (`core/dossier.js`, `core/rivals.js`).
- v53: runners gain `legend` { day, path, jobId } (null until earned; fame 'legend') and `legendCall` { day, tries, offerId, retryDay } (null until first called); offers and runs gain `defining` (a runner id); a memorial entry gains `legend` { day, path, jobId, posthumous } and `fame` (`core/legend.js`).
- v52: `state.rivals` { tongs: [{ id (a slug of the name), name, home, style, prestige, wealth, halls, depth, grudge, headId, status, formedDay, aim, aimDay }], cards: [{ id, name, tongId, home, role, rating, age, peak, form, fame, since }], word: [{ day, kind, refs }], seq, playerRank (the player's rank id when last seen, for The Word's tier-up line) }, all hidden from the player and read through `rivalView` only; old saves are seeded from their own seed (`core/rivals.js`; the branch's numbers moved up one when main's piloting took v51, DESIGN.md 2026-11-08 "Save versions renumbered").
- v51: the stat `driving` is `piloting` everywhere.
- v50: no shape change, Glass Heights' opening favour moved to Tse.
- v47: `state.heists` { heistId: { status 'open'|'done'|'failed'|'missed', offeredDay, finaleDay, finaleJobId, steps: { stepId: { status 'asked'|'done'|'failed'|'bought', jobId, tries, templateId } } } }, and on offers `job.heistStep`, `job.heist`, `job.drop`, `job.inside`, with `am.inside` on a run (`core/heists.js`); older saves start with none.
- v46: no shape change; the migration trims old inbox messages with `core/inbox.js trimInbox`, as the day tick now does.
- v45: the carry grid, `op.gear` {armour, implants, bag}.
- v44: `hall.owned`, a hall bought outright: its rent is 0 and expanding it adds none (`core/halls.js buyHall`).
- v43: `state.openings` { district: { status 'asked'|'failed'|'done', jobId, retryDay?, retry? } }, each district's opening favour; halls already offered or opened count as done (`core/halls.js`).
- v42: `hall.build` [{ id, piece, x, y, rot, day }], what's built in each hall, x and y in grid cells (`core/hallbuild.js`).
- v41: `state.grudges` { gangId: 0-10 } and `raid.by` (`'police'` or a gang id; old raids become `'police'`) (`core/gangs.js`).
- v40: `state.raids` [{ id, district, by, warnedDay, day, answer, outcome, done, called?, paid? }] and `hall.shutUntil` after a hall is walked out of (`core/raids.js`).
- v39: `state.heatBy` { district: 0-10 }, heat per district; `state.heat` is the hottest; `state.heatWatched` names a district (`core/heat.js`).
- v38: `state.halls` [{ district, beds, rent, level, opened }] and `state.hallOffers`; `op.hall`; `state.safehouseLevel` gone (`core/halls.js`).
- v37: `state.weekStart` `{ day, cash, reputation }` for the Sunday summary, and `am.lead` on a job (`core/lead.js`).
- v36: `job.days`, an offer's own days (`core/jobs.js` `daysRange`).
- v35: away jobs play a share a day and can call in: `am.away` `{ beats, day, command }`, and on each `state.awayJobs` entry `waiting` and `today` (`core/away.js`).
- v34: `state.rank` replaces `state.tier`, the tong rank.
- v33, renown slice 4: `job.askedFor` / `am.askedFor` for named offers, `state.namedOfferWeek`, and `payload.reason` on pay-rise messages, `growth` or `fame`.

`migrate(state)` (`src/save/save.js`) throws on a missing or newer version, then runs a chain of blocks `if (state.version === N) { …; state.version = N+1; }` from v1 up; each block's comment says what the version added. Read the newest two blocks there before writing one.

**To add a version:** bump `SAVE_VERSION` in `core/state.js`, append a block `if (state.version === N) {…; state.version = N+1;}` to `migrate`, add a test (tests/saves cover "v1 save upgrades", "newer saves refused"), log in the decision log and the changelog.

---
## 9. UI

What is on which tab and sub-tab: `docs/SCREENS.md`. Which function draws it and how navigation works (`ui/nav.js`): `CODEMAP.md` "UI files". Tokens, type and the look of each screen: `docs/UI-SKIN.md`. The update pattern (`setState` → save → `render`, delegated clicks on `[data-action]`) is in section 2.

**Styling:** single `styles.css`, CSS variables; breakpoints 420/520/760/900/1100/1400; `--tap: 44px`; `env(safe-area-inset-*)`; reduced-motion rules. The phone rules themselves are in `CLAUDE.md` "iOS-ready rules".

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
