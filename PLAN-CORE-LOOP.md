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

### Slice 4 · Sites and district text — [ ]
- A site plan per district (Docks yard, Old Town tenement, Night Market, Glass Heights
  tower, the Basin), drawn as data.
- Writing task: incident text per district (`drafts/writing-tasks.md`).

### Slice 5 · Gear and specialisations — [ ]
- Rifles and drones become gear (bought, per person); the shared kit goes.
- Specialisations: earned offer, player picks; Marksman and Drone Jockey first.

## Not in this plan
Relationships (bonds feeding saves), money pressure, the morale and burnout cleanup (save
bump of its own), heists and split teams. Each has its own DESIGN.md row.
