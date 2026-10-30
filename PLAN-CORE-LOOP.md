# Plan: the squad run (manager-first core loop)

Agreed 2026-10-27 after the core-loop discussion (`drafts/core-loop.md`) and two prototypes
(`drafts/prototypes/container409-plan.html`, `drafts/prototypes/container409-squad.html`).
The owner played v2 and called it "pretty damn cool". The design calls are in `DESIGN.md`'s
log (rows dated 2026-10-26 and 2026-10-27); this file is the build order.

One slice per session, one PR per slice. Each slice must leave the game playable and every
test green. Tick a slice off here (and add its CHANGELOG entry and DESIGN.md log row) in the
same commit that ships it.

## What the loop is

Pick an approach, build a squad for it, watch them handle what comes up, step in on the big
moments. Plan → watch → call-ins → report.

- **Approaches** (4): stealth, tech, loud, con. Each gives +1 to its stat, changes which
  crises and incidents come up, and costs something different (stealth: time; tech: neural
  load; loud: heat; con: money).
- **Squad:** an inside team (the job's crew), plus outside slots: overwatch (rifle or drone),
  later Wheels and standby.
- **Incidents:** many small automatic rolls, handled by whoever inside has the best odds. A
  person in danger who fails gets one save roll from a teammate (overwatch with sight of the
  spot, or the best fighter inside).
- **Alert:** unsaved failures raise it (0-3); each point makes every later roll harder. At 3
  the crew calls you in: go loud or pull out.
- **Crises** (the authored ones) stay exactly as they are, and become the call-ins.
- **Call-in rule:** every crisis / only risky ones / never. "Never" sends the crew away and
  the report comes back when they do (today's hands-off). When the crew doesn't call you,
  the existing standing orders (Cautious / Steady / Committed) decide.

## Rules that must hold (tests)

- **No death without "push on".** Incidents can cause a serious injury, never critical or
  death. Criticals still come only from crises and are always the player's call on a live
  run; hands-off crews always extract.
- **Death only after "keep fighting" (slice 6).** A fight puts someone at death's door, never
  dead; only the player's "keep fighting" makes them critical, and any exit after it saves them.
- **Every decision has an exit.** Crises (validator), the alert call-in and the injury
  call-in all offer a way out that brings everyone home.
- **Shown risk equals used risk.** Every new modifier (approach, extra bodies on stealth and
  con, alert, overwatch) appears in the roll notes and the planning read.
- **Randomness through `core/rng.js`.** Incidents draw from the mission's rng like crises.

## Architecture

- `src/data/approaches.js`: the four approaches as data (stat bonus, favoured and avoided
  situations, cost). `core/crew.js` re-exports `APPROACHES` so callers don't change.
- `src/data/incidents.js`: the incident library and which incidents each approach meets in
  each zone (the way in, inside, the target). Generic text with slots; district text is a
  later writing task.
- `src/core/incidents.js`: building the run (where incidents go in the queue), resolving an
  incident, saves, alert, and the alert and injury decisions. Pure; mutates the cloned state
  passed in by `mission.js`.
- `src/core/mission.js`: the queue gains `zone` and `incident` steps and a pending decision
  (`am.pending`, like `am.critical`). Crises, criticals, growth, reports and earned traits
  are unchanged and read incident rolls like any other roll (event kind `roll`, flagged
  `incident`).
- `src/core/autorun.js`: `autoStep(state)` advances one step the crew can take on its own
  (beats, incidents, crises and decisions under orders when the call-in rule allows);
  `needsPlayer(state)` says when to stop. `autoRun` and the live UI both use them.
- `src/ui/`: the planning screen and the mission screen. Slice 1 adapted today's screens;
  slice 2 replaced them with the squad board (`ui/board.js`) and the watch screen (`ui/watch.js`,
  `ui/siteplan.js`), fed by `core/squad.js` and `core/feed.js`.

## Slices

### Slice 1 · The engine (and a playable minimal UI) — [x] 2026-10-27 (see DESIGN.md for the calls made while building)
- Approaches as data: stealth / tech / loud / con (con replaces social). Weighted crisis draw
  by situation. Costs: stealth +1 day away; loud −1 day (min 1) and +1 heat; con ¥100 per
  threat up front; tech +5 neural load per tech roll.
- Extra bodies: on stealth and con runs, each inside person past two is −1 on stealth and
  social rolls (a crew rule, so it shows in every read).
- Incidents in the queue: one on the way in, one or two inside, one at the target; a zone
  marker before each zone.
- Saves: overwatch (one person outside the crew; the shared rifle: 2 shots, +1 heat a shot,
  can't see inside the target building; the shared drone: 3 actions, +10 neural load each,
  sees everywhere) or the best fighter inside.
- Alert 0-3, +1 difficulty per point on every later roll (incidents and crises).
- Decisions: max alert (go loud / pull out) and a serious injury (keep going without them /
  pull out). Hands-off orders decide them when the crew doesn't call you.
- Call-in rule on the active mission; `autoStep` / `needsPlayer`.
- Save v21: `social` → `con`; new active-mission fields; jobs in progress keep today's
  behaviour (call-in rule "every crisis").
- UI: four approaches, an overwatch pick and kit, the call-in rule beside the orders; the
  mission screen steps with "Next" and shows incidents, saves and decisions in the log.
- Tests: `tests/incidents.test.js` (the rules above, saves, alert, overwatch sight, costs,
  extra bodies, migration) and existing tests updated where a rule changed on purpose.

Follow-ups found while building slice 1: retune growth and earned traits for the new loop (incidents teach nothing
and count for no traits yet; mentoring's edge fell to ~0.75; trait moments ~0.9 a week); the mission log doesn't yet show the crew's reason for a crisis they decided themselves (slice 2's
cards will); the way out has no zone heading.

### Slice 2 · The watch screen and the squad board — [x] 2026-10-27 (see DESIGN.md for the calls made while building)
- Planning: the dossier board (inside team, overwatch), Joss's picks, the coverage read
  (`core/risk.js` `coverage()`: each likely incident, who handles it, risk with and without
  a save).
- Watching: a timed feed with headlines, Pause and Faster, a generic site plan with camera
  pans and the map animations from the prototype; call-ins inline.
- Report: saves and alert in the summary and full log.
- Screenshot script reaches the new screens; a screenshot set.

Built as `core/squad.js` (coverage read, Joss's picks; not `risk.js`, to avoid an import cycle), `core/feed.js`
(events as watch cards), `ui/board.js`, `ui/siteplan.js` and `ui/watch.js`; tests in `tests/squad.test.js` and
`tests/feed.test.js`. Done from slice 1's follow-ups: the crew's reason on cards they decided, the way out's heading.
Retuned since (DESIGN.md, 2026-10-27): incidents teach and count towards traits. Found while building: the planning screen is long on
phones (approach, board, two reads, call-ins); the generic site plan doesn't match every job (slice 4).

### Slice 3 · Wheels and standby — [x] 2026-10-27 (owner's calls and build calls in DESIGN.md)
- Wheels (optional): the person in the van takes every driving roll, alone.
- Standby: one person at the van; called in at max alert (they join; the alert stays up; once
  in, they get their own save attempt after overwatch or a teammate) or to rescue someone
  seriously hurt (they take the hurt person's place). Cautious orders never use them.

Built in `core/mission.js` (Wheels in `rollerFor`, standby in `resolvePending` and the save
loop in `runIncident`), `core/incidents.js` (`decisionChoices`, `ordersDecision`,
`standbySave`), `core/squad.js` (Joss), `ui/board.js` (two more outside slots) and the watch.
Save v22. Tests: `tests/standby.test.js`.

### Slice 4 · Sites and district text — [x] 2026-10-28 (sites; district text for all five districts)
- A site plan per district (Docks yard, Old Town tenement, Night Market, Glass Heights
  tower, the Basin), drawn as data.
- Writing task: incident text per district (`drafts/writing-tasks.md`).

Built as `src/data/sites.js` (shapes, points, the path per zone, camera views, rifle and drone
sight; a generic site for anywhere else), drawn by `ui/siteplan.js` for the job's district. The
district text has its slot, `src/data/districtIncidents.js` (writing task 11, all five districts
written; each incident falls back to the generic lines, `core/incidents.js` `incidentIn`). Tests:
`tests/sites.test.js` (routes join, views 3:2 and on the map, the rifle can't see the target and
the drone can; district lines only change words and keep `{op}`).

### Slice 5 · Gear and specialisations — [x] 2026-10-28 (owner's calls, DESIGN.md)
- **5a, gear — [x] 2026-10-28.** A stash and four slots per runner (weapon, armour, tool,
  implant); the rifle and the drone are items, and overwatch needs one. No wear. A new crew
  starts with nothing; some recruits bring their own. Built as `src/data/gear.js` and
  `src/core/gear.js`, drawn by `src/ui/gear.js` (the armoury from the Crew screen, the loadout on
  a runner's page). Save v23. Tests: `tests/gear.test.js`.
- **5b, specialisations — [x] 2026-10-28.** Stats plus experience unlock an offer from Joss; the
  player picks (or "not yet"). Marksman (combat 10, cool 8, three overwatch jobs with a rifle) and
  Drone Jockey (tech 10, three with a drone). Built as `src/data/specialisations.js` and
  `src/core/specialisations.js`; the effect lives in `core/gear.js` `overwatchKit`. Tests:
  `tests/specialisations.test.js`. Next directions (Breacher, Netrunner, Ghost...) come in batches.

### Slice 6 · Battles — 6a, the engine: [x] 2026-10-29 · 6b, the watch screen: [ ]
Fights are automatic exchanges of up to 3 rounds on the watch feed. You watch; you're called in
only when something big happens. Designed with the owner on 2026-10-29 (DESIGN.md rows); built as
`src/core/battle.js` (pure, seeded), numbers in `src/data/battle.js`, the run's side in
`core/runbattle.js` (`runBattle`, started from `runIncident` in `core/mission.js`; a `battle` step in the queue, `am.battle`, save v26). Tuned with
`node scripts/sim-battles.mjs`. Tests: `tests/battle.test.js`.

- **When:** when a run escalates, and always on a loud run (2026-10-29, owner: "every loud run pretty much"): the first danger incident of a loud run, or after "go loud", is a fight whatever the roll, and winning the roll gives the crew the jump (the guards get no shot in round 1). Otherwise a danger incident (patrol, guard up close, more guards,
  holding the room) that goes unsaved starts a fight instead of the old serious-wound roll. Each
  says how many guards (`guards` in `data/incidents.js`); one more on threat 5 work. Every other
  incident stays one roll. Loud runs meet more danger incidents, so they fight more.
- **Who:** the inside team still standing, overwatch if it can see the zone and has uses left
  (one shot or drone action a round, spent from its uses: heat and neural load as before), and
  Wheels, who can bring the van round once (then pulling back costs no parting shots).
- **Health:** runners have 10 + cool/4 HP (3 less if already lightly hurt). Guards by threat:
  HP 4-8, armour 0/0/1/1/2, damage 2-4. Guns are standard (WORLD.md): no weapon means a street
  piece (2); sidearm 3, rifle 5 and drone taser 3 from overwatch; pro gear +1.
- **Armour, first version: XCOM's flat soak** (owner's call, 2026-10-29: "see how it plays
  out"). Each point takes 1 off every hit, and **a hit that lands always does at least 1**.
  Street vest 1, pro vest 2. Armour never wears and is full every job. The feed says what it took
  ("Armoured vest took 1"). **Later, if it plays flat:** shred and pierce tags on weapons, armour
  adding HP, a heavy vest costing stealth and social, or Battle Brothers' armour as a second bar.
- **A round:** overwatch, then each runner, then Wheels, then every guard still up. A runner's
  action is picked by one rule (no player input): stabilise someone left dying (medical 7+),
  patch someone under half HP if medical beats their combat (+3, trauma kit more), talk a guard
  into backing off if social beats combat by 2 (two harder than the fight), kill the lights if
  tech beats combat by 2 (guards −3 to hit for the rest of the fight), else shoot the most hurt
  guard. Shots are 2 easier than the fight's difficulty (the incident's); overwatch 1 easier
  again. Guards hit with the fight's difficulty −2 against the runner's cool, and half their
  attacks go for whoever is hurt worst.
- **Morale (after Battle Brothers):** the last guard standing, under half HP, breaks and runs:
  the fight is won, but the alert goes up 1 (they're on the radio).
- **Death's door (Darkest Dungeon):** at 0 HP a runner is down, never dead. You're called in:
  **pull back** (listed first: everyone home), **send standby in** to drag them clear and take
  their place in the fight (if standby is waiting), or **keep fighting** with them down. Keeping
  on fighting is the push on: they become critical and untreated, the existing rule decides at
  the end of the job whether they make it, a medic in the fight can stabilise them, and any later
  exit still brings them home. Someone alone who goes down is dragged out without a call.
- **After round 3 with guards still up:** a call-in: push past them (alert +1, heat +1) or pull back.
- **Pulling back costs** (owner's calls): no pay, heat +1, reputation −2 on top of the abort's,
  and a parting shot from every guard still up as the crew runs: it can hurt anyone but never
  drops them below 1 HP.
- **After the fight:** HP left becomes the injury the game tracks: half or more fine, under half
  light, under a quarter serious (out of the job; the usual call-in follows). Someone dragged out
  from death's door is badly hurt for 21 days.
- **Orders, when the crew decides (also on live runs, between call-ins):** Cautious pulls back
  once anyone is under half HP; Steady once anyone is under a quarter; Committed doesn't, and
  pushes past at the end. At death's door every order pulls back, or sends standby in (Steady
  and Committed). Hands-off never keeps fighting.
- **The planning read:** each danger row runs the fight 120 times on fixed seeds with the same
  round function (`battleOdds`, cached), counts a fight won with nobody down as getting through,
  and says "If it comes to a fight: low risk" on the board. Joss's picks use it too.
- **The watch, for now:** a note when the fight starts, a card per round (each moment with its
  dice, HP in the card's setup), "Pulling back", a note when it's over; the full log in the
  report shows the same. The call-in names death's door and shows "Keep fighting" as extreme risk.
- **Measured (`sim-battles.mjs`, 300 runs a row):** rookie jobs: about 1 run in 10 becomes a
  fight and rookies win nearly all of them, nobody goes down. Threat 4 with a grown crew (+4 every
  stat), loud: wins 22% with no kit, 44% with a sidearm and vest, 69% with pro kit; someone goes
  down in 9%, 4%, 0% of rounds. Growth sims stay on target; earned traits fell from 2.5 to 2.2
  moments a week (fight rolls don't count towards traits yet).

**Not yet (6b or later):** the watch screen's own look for fights (HP on the tokens, guard tokens
on the site plan, round pacing); a runner dragged out from death's door dropping their weapon;
reinforcements as a call-in; fight rolls counting towards earned traits (Corner Fighter is about
exactly this); toning the early game down (rookie-tier fights are easy).

## Not in this plan
Relationships (bonds feeding saves), money pressure, the morale and burnout cleanup (save
bump of its own), heists and split teams. Each has its own DESIGN.md row.
