# Writing tasks for the owner

Writing that can be done in other chats while the code is built, ordered by when it's needed.
Each task has a prompt to copy. **Always paste the context block from `WORLD.md`
("Context block for worldbuilding prompts") first, then the prompt, then any source file named.**
Paste the results back here as they are; they get checked against WORLD.md and turned into game data.

The fixed output formats matter more than polish: they let each batch go straight into the data
files. Rough lines are fine; anything off gets flagged, not silently changed.

| # | Task | Needed for | Size | Source to paste |
|---|---|---|---|---|
| 1 | ~~Report lines for older crises~~ **Done 2026-10-26** (all 4 batches in the game) | Mission logs, auto-run, side tasks | — | — |
| 2 | ~~Hand-written Container 409 mission log~~ **Done 2026-10-26: go** (see `mission-log-prototype.md`) | The go / no-go test for mission logs | — | — |
| 3 | Action templates by stat and phase (any district) | Mission logs | ~85 templates | none |
| 4 | District pack: the Docks (vocabulary and faction overlays) | Mission logs | ~120 short entries | none |
| 5 | Joss's framing lines | Mission logs | ~45 lines | none |
| 6 | Authored lines for Container 409's key beats | Mission logs | ~12 lines | `drafts/writing/container409-source.md` |
| 7 | ~~Stat-unlock choices~~ **Done 2026-10-26** (17 in the game) | Choices unlocked by stats | — | — |
| 8 | ~~One-off side tasks~~ **Done 2026-10-26** (25 in the game) | Side tasks | — | — |
| 9 | ~~Earned traits~~ **20 of 26 in the game 2026-10-26**; the rest in `drafts/earned-traits-backlog.md` | Progression step 2 | — | — |
| 10 | Jobs for the locked districts | Promotions and districts | 1-2 jobs per district | `drafts/district-hooks.md` |
| 11 | ~~Incident lines per district (the squad run)~~ **Done 2026-10-28** (all five districts in the game) | `PLAN-CORE-LOOP.md` slice 4 | 12 incidents × 1 district a batch | `src/data/incidents.js` |
| 12 | Seventy-One Floors: Mr. Szeto's heist, six prep jobs (A2) | Heists (`data/heists.js` `szetoTower`) | 6 jobs, 3 steps × (first ask + retry) | `docs/new-job-prompt.md` box (+ `src/data/missions/theguestcopy.js` as the model) |
| 13 | Battle screens: fight feed, threats, orders, call-ins, risk picker, report causes (engine 2) | Battle rework slice 2 (the screens); the five engine-2 jobs show placeholders today | ~110 short strings | `src/data/fightText.js` (the keys), `src/data/dilemmas.js` |

Tasks 1 and 2 first: 1 is a prerequisite for everything hands-off, and 2 decides whether
mission logs get built at all. Tasks 3-6 wait until the first mission-log slice is built and shows where words are missing (decided 2026-10-26).
The slice is built (2026-10-26); play some runs before writing 3-6. Task 7 is done.

**How a log is assembled (2026-10-26, owner's feedback):** the crisis report lines are the
factual record and are never contradicted. Around them the log is built from (1) universal
action templates by stat and phase, (2) a district pack of places, obstacles, sounds and
objects, (3) faction overlays used only when that faction is actually in the job,
(4) authored lines for a job's most important beats, and (5) callbacks assembled from events
recorded earlier in the same run. Joss frames the report; the log itself is what the crew
experienced. Templates times packs gives variety without writing every combination by hand.

---

## Shared rules (already in the context block; repeated because logs are new)

- Plain, objective report voice for tasks 1, 3, 4 and 6: past tense, one sentence, no jokes
  that need the crisis text to make sense. The narrative voice belongs to crisis text, not reports.
- Use slots, not names: `{op}` for whoever acted, `{op2}` for a second crew member, or role
  slots `{driver}` `{tech}` `{face}` `{muscle}` `{medic}`. Never a character name.
- Gender-neutral: "they", or the slot. Crews are generated.
- Say consequences plainly at the end of a line: `Heat +1.` / `{op} was hurt.` (light) /
  `{op} was badly hurt.` (serious) / `{op} was critically hurt.` (critical).
- 1 sentence, under ~20 words. Phone-first.
- **Lantern Bay only.** Draw from the context block's districts, factions, clients and tech.
  Never invent a new faction, place, technology, or a supernatural cause. No generic
  "cyberpunk action".
- **The crew only knows what it saw.** No hidden motives, no naming an unseen enemy, no
  explaining who's really behind something. "A Wet Sleeve cutter drifts in without lights",
  not "a cutter working for the Red Lanterns".
- **Rumours stay rumours.** Superstition (whistling by the water, incense, unlucky numbers)
  can shape how people act and the mood, but never causes anything. Something odd can be
  seen ("an unlit lighter that doesn't show on the scanner"), never explained.
- **Show what the stat did,** in the prose, not as a tag:
  - combat: force, confrontation, physical control
  - stealth: concealment, quiet movement, getting in unnoticed
  - tech: manipulating, repairing or bypassing machines and systems
  - social: persuasion, deception, negotiation, rapport
  - driving: handling vehicles, pursuit, escape, moving cargo
  - medical: diagnosis, stabilising, managing neural-load symptoms
  - cool: composure, nerve, timing, functioning under pressure

---

## Task 1 · Report lines for older crises

**Done 2026-10-26:** every crisis in the game has its report lines, and `tests/reports.test.js`
keeps it that way. New jobs and crises need them from the start; this prompt still works
for any new crisis written without them (paste the crisis text where it says SOURCE).

```
TASK: For each crisis below, write a plain one-line `report` for every choice: a success
line and (except for aborts) a failure line. These go in the after-action report, so a
reader who never saw the crisis must understand what happened.

RULES:
- Past tense, plain and objective, one sentence each, under ~20 words.
- Use {op} for whoever acted (or the role slot the choice already uses, e.g. {tech}).
  No character names. Gender-neutral.
- End with the consequence when there is one, using the tags in [brackets]:
  heat → "Heat +1."  light injury → "{op} was hurt."  serious → "{op} was badly hurt."
  critical → "{op} was critically hurt."  An abort says the crew left / gave up the job.
- Don't add events that aren't in the source text.

FORMAT (exactly this, one block per crisis, ids copied from the source):
CRISIS <crisis id>
- <choice id> | success: <line> | failure: <line>
- <abort id> | success: <line>

EXAMPLE:
CRISIS cutter
- shadow | success: A Wet Sleeve cutter swept the stack; the crew stayed hidden. | failure: A Wet Sleeve cutter's light caught {op}. Heat +1.
- abort | success: A Wet Sleeve cutter came close; the crew left their post.

SOURCE:
(paste the crises here)
```

---

## Task 2 · Hand-written Container 409 mission log (the go / no-go test)

```
TASK: Write one complete mission log for the job below, as the player would read it in
their inbox after sending two crew to do it hands-off. This is a test of the format: we
want to see whether a reader can tell WHY the job went the way it did, and which stats
helped or hurt.

HOW A RUN WORKS:
- Four phases: Approach → In position → Objective → Exit, each with in-world times
  (e.g. 23:40, 00:31).
- Line types: FLAVOUR (atmosphere, no roll) · MINOR CHECK (a small roll that nudges a
  track) · KEY MOMENT (one of the job's crises, with the option chosen by the crew's
  orders) · CRITICAL (the crew gets out automatically; nobody dies on a hands-off job).
- Three tracks: ALERT (how close to being noticed), TIME (on schedule or not), CONDITION
  (fatigue and knocks). Minor checks move them; high tracks make later key moments harder.
- Orders: Cautious / Steady / Committed (pick one for this run). They decide which
  option the crew takes at key moments and when they give up.
- Who acts: the crisis's role if that person is on the job, else the best person for the stat.
- Show the working: who acted and why ("Egg Tart takes point, the quietest of the two"),
  the stat after the roll ("Stealth ✓" / "Cool ✗"), at least one callback to an earlier
  event, a trait helping or hurting, and the cost of a gap in the crew.

- Joss frames the report (intro, turning point, standout, what hurt us); the LOG is the
  crew's own account. Neither claims to know more than the crew saw: no hidden motives,
  no unseen enemies named, no rumours confirmed, nothing supernatural.
- Keep it in the Docks: fog, floodlights, cranes, diesel, Aether-Harbour, Red Lantern
  roads, Wet Sleeve cutters, Pier 12, no whistling by the water. Show what each stat did
  in the prose, not only as a tag.

FORMAT:
JOSS: <one-line intro>
SUMMARY
- Turning point: <the roll that decided it>
- Standout: <who, and with what stat>
- What hurt us: <the costliest failure or gap>
- Result: <pay, heat, injuries>

LOG
<time> · <PHASE> · <line>   [tags: stat ✓/✗, track change, e.g. "Stealth ✓ · Alert −"]
(12-20 lines in total; 2 key moments)

Write it for two crew from the table, with Steady orders. Then, if you have the energy,
a second short log for the SAME job with a different pair, so we can see whether
different crews make different stories.

SOURCE:
(paste drafts/writing/container409-source.md here)
```

---

## Task 3 · Action templates by stat and phase (any district)

```
TASK: Write short action templates for a mission log. A template is a small moment between
the big crises: one crew member, one stat, a quick roll. Templates are used in EVERY
district, so the place details are slots filled from a district pack:
  {place}    a spot ("the container stacks", "the stairwell of Block 9")
  {obstacle} something in the way ("a locked gate", "a security drone")
  {sound}    a noise ("a crane's screech", "mahjong tiles slapping")
  {object}   a thing to use or lose ("a loose strap", "a crate of fish balls")
  {watcher}  someone who might notice ("a night-shift forklift driver", "a stall owner")
and {op} / {op2} for crew. Every slot's text is written to work after "the" being
included, e.g. "{op} slips past {obstacle}" → "Kit slips past a locked gate".

For EACH of the 7 stats, write 6 moments, spread over the four phases (approach, position,
objective, exit) and the three tracks: ALERT (being noticed), TIME (schedule), CONDITION
(fatigue, knocks). Each moment has a success and a failure line. The line must SHOW what
the stat did (see the stat meanings in the rules).

RULES: present tense (a live log), one sentence, under ~18 words, gender-neutral. The
failure is small: noise, delay, a scrape; never an injury worse than a knock. No district,
faction or client names: those come from the packs.

FORMAT (exactly):
<stat> | <phase> | <track> | success: <line> | failure: <line>

EXAMPLE:
stealth | approach | alert | success: {op} waits for {sound} to cover each step past {watcher}. | failure: {op} knocks {object}; {watcher} looks up.
```

---

## Task 4 · District pack: the Docks

One chat per district later (Old Town, the Night Market, Glass Heights, the Basin); the
Docks first, to test with Container 409.

```
TASK: Write the vocabulary pack for the Docks. Everything here gets dropped into slots in
mission-log templates, so each entry must read naturally on its own and stay specific to
this district (harbour fog, amber floodlights, wet tarmac, cranes, diesel, salt water,
clanking steel, Aether-Harbour infrastructure, Pier 12, night boats, the custom against
whistling near the water).

WRITE:
- place: 12 spots, each a short noun phrase ("the shadow of a gantry crane")
- obstacle: 12 things in the way
- sound: 10 noises
- object: 10 things a crew could use, drop or knock over
- watcher: 8 people who might notice the crew (no names)
- phase: 5 atmosphere lines per phase (approach, position, objective, exit), present
  tense, one sentence, using "the crew", some at night, some at dawn or in rain
- track: for each track (alert, time, condition) 3 "rising" lines and 3 "high" lines
- callback: 6 lines that refer back to an earlier event, using {time} for when it
  happened and {earlier} for a 2-4 word reminder of it ("the dropped strap"):
  "Since {earlier} at {time}, the night shift has been walking every row."

FACTION OVERLAYS: for each faction with a presence in the Docks (Aether-Harbour Logistics,
the Red Lanterns, the Wet Sleeve), 4 obstacles, 3 watchers and 3 phase lines that only
appear when that faction is part of the job. Only what the crew could see or hear.

RULES: everything in the context block's canon; no new factions, places or tech; nothing
supernatural (people may still avoid whistling); entries under ~12 words, phase and
track lines under ~20.

FORMAT:
<slot> | <entry>                    e.g.  sound | a crane's screech overhead
<faction> | <slot> | <entry>         e.g.  Red Lanterns | obstacle | a toll booth with its shutter half down
phase | <phase> | <line>
track | <track> | rising/high | <line>
callback | <line>
```

---

## Task 5 · Joss's framing lines

```
TASK: Write Joss's lines that frame a mission report. Joss (they/them) introduces the
report and names the turning point and the standout; the log underneath is the crew's
own account. Dry and warm, says "we", never claims to know more than the crew saw: no
hidden motives, no naming unseen enemies, no confirming rumours.

WRITE:
- intro: 4 lines each for: clean success, messy success, aborted, someone badly hurt
- turning point: 2 per stat (7 stats), naming {op} and showing what the stat did
- standout: 2 per stat, naming {op}
- what hurt us: 1 per stat for a failed roll, 1 per stat for a GAP (nobody on the crew
  had it): "Nobody could talk us past the gate. A face would have saved the bonus."

RULES: one sentence, under ~18 words, gender-neutral, no district or faction names
(these are used everywhere).

EXAMPLE (intro, messy success): "They got the crate out. The Wet Sleeve nearly made that
someone else's problem."
(That one names the Wet Sleeve, so it would live in a Docks pack instead: keep yours
generic.)

FORMAT:
intro | <clean/messy/aborted/hurt> | <line>
<stat> | turning | <line>
<stat> | standout | <line>
<stat> | hurt-fail | <line>
<stat> | hurt-gap | <line>
```

---

## Task 6 · Authored lines for Container 409's key beats

```
TASK: Write the hand-authored lines for the moments in Container 409 that templates
shouldn't handle: the arrival at Pier 12, the crate coming off the gantry, the
Ferryman's handover at dawn, and one lead-in line before each of the job's 6 crises
(what the crew notices just before it happens).

RULES: present tense, one sentence, under ~22 words, the job's own voice (see its beats);
the Ferryman's dialogue only from what's in the context block; nothing that contradicts
the crisis text.

FORMAT:
beat | <arrival/crate/handover> | <line>
leadin | <crisis id> | <line>

SOURCE:
(paste drafts/writing/container409-source.md here)
```

---

## Task 7 · Stat-unlock choices (done 2026-10-26)

Done: 17 unlocks on rookie jobs. The prompt stays for bigger jobs later; regenerate a source file
for those jobs' crises the same way.

```
TASK: Rookie jobs in this game are a series of crises; each crisis offers 2-3 choices,
each tested on one stat (d20 + stat must reach 10 + difficulty), plus an abort. I want
EXTRA choices that only unlock once someone on the crew has grown a stat high enough:
a cleaner, cleverer way through that a greener crew can't attempt. The player sees
them greyed out ("Needs driving 12+") until then, so each one is a small goal to grow
towards. The numbers, and every crisis to choose from, are in the SOURCE below.

WRITE about 16 unlock choices, at most one per crisis:
- 3 each for combat, driving and medical (rookie jobs barely use them, so the crew's
  muscle, driver and medic rarely get a moment), and 2 each for tech, stealth, social
  and cool.
- Spread them over all 8 jobs and the shared pool.

THRESHOLD (on the person's own stat): 11 or 13 for a stat that is a role's main stat
(see "Main stat by role" in the source); 9 or 10 for a stat that isn't.

MAKE THEM WORTH IT: better than the crisis's existing choices in at least one way:
- lower difficulty (2-5 on rookie jobs), or
- a bonus on success (pay +10% or +20%), or
- avoiding a cost the existing choices carry (heat, a pay cut, client unhappy).
The failure is never worse than the existing choices' (on rookie jobs, at most a light
injury or heat +1).

WHO: {op} means the person who makes the roll (whoever is best on the crew at that stat),
and on a failure they're the one hurt. Use {op} in the label ("{op} takes the van down the
fish-market lane"). EXCEPT in a crisis marked "(about the X)": there {op} means that X, so
phrase the label without a name ("Floor it to the clinic on Pitt Street"), and use
"someone" for any injury.

REPORT LINES: every choice also needs a plain report line for success and failure: past
tense, ONE sentence under ~20 words, {op} for the person (or "someone", as above), the
consequence at the end once ("Heat +1." "Pay +10%." "{op} was hurt."). A crew's account,
not a police report.

STYLE: Lantern Bay only (no new factions, places or tech); nothing supernatural; gender-
neutral; labels are short actions; success and failure text 1-2 sentences in the game's
present-tense voice.

FORMAT (exactly, one block per unlock):
CRISIS <crisis id>
- id: <new choice id, one word> | needs: <stat> <threshold> | stat rolled: <stat> |
  difficulty: <number> | bonus: <pay +10% / pay +20% / none> | label: <label>
  success: <text> | failure: <text> [injury: none/light] [cost: heat +1 / none]
  report success: <line> | report failure: <line>

SOURCE:
(paste drafts/writing/stat-unlocks-source.md here)
```

---

## Task 8 · One-off side tasks

```
TASK: Write one-off side tasks a fixer can send 1-2 crew members on, hands-off, while
others do the main jobs. They run for 1-3 days and come back with a short report. They pay
less than real jobs; they're how the bench trains, earns a bit, builds client trust or
gathers information.

Write 5 tasks for EACH open district: Old Town, the Docks, the Night Market, Glass Heights,
the Basin. Mix the four purposes: MONEY, TRAINING, TRUST (with a named client), INFO
(e.g. better risk reads on that district's jobs for a week).

RULES: nobody can die on a side task; the worst outcome is a light injury, heat +1, or
someone held by the police for a day or two. Gender-neutral, no character names for crew.
Clients and factions only from the context block.

FORMAT:
NAME: <short name>
DISTRICT: <district> · PURPOSE: <money/training/trust/info> · DAYS: <1-3> · CREW: <1-2>
STAT: <the stat it trains or tests>
PITCH: <1 sentence, who wants what>
GOES WELL: <1 sentence report line>
GOES BADLY: <1 sentence report line> [cost: light injury / heat +1 / held 1 day / none]
```

---

## Task 9 · Earned traits

```
TASK: Draft about 10 traits an operative can EARN from what happens to them on jobs (not
traits they're born with). Each should change how the player uses them, not just add
flavour.

Mix: some good, some bad, some that fade. Ideas to start from: Scarred (survived a
critical wound), Shaky (after a near-death; fades with clean jobs), Ghost Driver (several
clean getaways), Steady Under Fire.

FORMAT:
NAME: <trait>
EARNED WHEN: <the event or count that triggers it>
EFFECT: <a small, concrete game effect, e.g. +1 cool on crisis rolls, or refuses Loud jobs>
FADES: <never / how>
INBOX NOTE: <1 sentence, Joss's voice, telling the player it happened>
HISTORY LINE: <1 short line for the operative's history, past tense>
```

---

## Task 10 · Jobs for the locked districts

Use the "new job type" template in `WRITING_GUIDE.md`. One or two jobs each for the Silt,
the Amber Reach and Iron Peak, built from the hooks in `drafts/district-hooks.md`. Paste
the context block, the template and the hooks for that district into one chat per district.

## Task 11 · Incident lines per district (the squad run)

Incidents are the small automatic moments of a run (a locked door, a patrol, a guard up close),
added 2026-10-27 (`PLAN-CORE-LOOP.md`). Their text in `src/data/incidents.js` is Claude's generic
draft and reads the same in every district. This task gives each district its own version. One
district a batch; the Docks and Old Town first (most rookie jobs are there).

Prompt (after the context block):

```
The crew is on a job in [DISTRICT]. Below are 12 "incidents": small moments that happen
during a job and are resolved by a dice roll. Rewrite each one for [DISTRICT], keeping
its meaning and its outcome. For each, give exactly these lines, one sentence each:
- text: what happens (present tense; {op} is whoever deals with it)
- hOk: a 3-6 word headline when it goes well ("{op} opens the lock")
- ok: the detail when it goes well
- hBad: a 3-6 word headline when it goes wrong
- bad: the detail when it goes wrong
- comp (only for patrol, guard, backup, hold): the moment {op} is in trouble
Keep {op} where a person is meant. No new injuries or costs: the game decides those.
```

Then paste the list of incident ids and names from `src/data/incidents.js`.

Where it goes (slice 4, 2026-10-28): `src/data/districtIncidents.js`, one object per district,
`{ incidentId: { text, hOk, ok, hBad, bad, comp } }`. Only the lines you write change; the rest
falls back to the generic text, and a test checks each line keeps `{op}` where the generic has it.
Each district also has its own site plan now (`src/data/sites.js`: the Docks yard and crane,
Old Town's alley, courtyard and flat, the Night Market's stalls, footbridge and mahjong back room,
Glass Heights' plaza, tower and server room, the Basin's stables, floodlight and vet block), so the
lines can name those places.

**Done 2026-10-28:** all five districts (the Docks, Old Town, the Night Market, Glass Heights, the
Basin), all 12 incidents, every line, in the game. A district added later falls back to the generic
lines until it gets its own; a test keeps every district complete.

## Task 12: Seventy-One Floors, Mr. Szeto's heist (A2, 2026-11-08)

**What this is.** Madam Rao's heist, The Big Table, has six prep jobs of its own, written for it (`data/missions/theguestcopy.js`, `aftertheapplause.js`, `anoldaccount.js`, `someonetocover.js`, `serviceincluded.js`, `manualhandling.js`: all `heistOnly`, never dealt at random). Mr. Szeto's heist, **Seventy-One Floors** (`data/heists.js`, id `szetoTower`), is still on stand-ins: `access_window`, `relay_cover` and `data_pull`, routine jobs reused with a heist line on top. This task writes its own six, the same way: three steps, each a first ask and a retry (a different job, in a different place if you like, for when the first goes wrong).

**How to use it.** For each of the six, open a fresh chat, paste the box from `docs/new-job-prompt.md` (it holds the world context, the rules and the format), replace its PITCH with the one below, and check what comes back. Then `/add-job` each in a Claude Code session (Sonnet is enough). Say when all six are in and I'll point the heist at them, add `heistOnly: 'szetoTower'` and run the checks. The finale (`penthouse`, the generic 71st-floor vault job) is not part of this; a heist-only finale of its own is a separate piece if you want one (see the last section).

**The heist, for every pitch.** Mr. Szeto (Glass Heights developer; pays well and on time, never asks how a job was done) says a business associate keeps something of his in a penthouse vault, seventy-one floors up, and leaves the city for three nights in three weeks. Three things to arrange before then, each a prep step that changes the finale on its plan. The jobs are the crew's, not Szeto's: he never appears except through the brief, and he doesn't explain. Gate: reputation 60, three halls, so the crew are well past rookies.

| Step | What the finale gets (the game applies it; the job's text doesn't need to say so) | First ask | Retry |
| --- | --- | --- | --- |
| `face` | A registered service identity for the lift: **the facial-scan crisis can't appear** | job A1 | job A2 |
| `power` | Cover at the backup-power controls: **the finale is one step less dangerous** | job B1 | job B2 |
| `plans` | The current floor plans, renovations and service routes: **+1 on every finale roll** | job C1 | job C2 |

**What each job should be** (the pitch is yours to bend; these are leads, not requirements):
- **A, the service identity.** Getting someone the building's scanner already expects. Lead: **Poon Hok-yin** (Glass Heights facilities coordinator, `{poon}`) can arrange a legitimate loading slot but cannot turn a delivery pass into unrestricted access (`WORLD.md`, Glass Heights people). The Lower Arcade, the Service Steps and the Late Counter are places to use. A1 and A2 are two different ways to the same registered face.
- **B, the power cover.** Someone has to stand at the backup-power controls so a supply switch doesn't close the route. Lead: Hoi-Sing maintenance contractors, a tower's plant room, Poon's keys. **Do not bring in Lo, the electrician** (Szeto's secret; `WORLD.md`, Mr. Szeto), and nothing that hints the crew is being set up around fires.
- **C, the floor plans.** The owner's copy predates the last renovation. Lead: **Morrow & Venn** (Venn House; estates administrator **Edith Pryce**, `{edith}`) holds property and lending records, and considers property lending proposals from developers such as Szeto; or the Demonstration Floor and Hang Yuen's installation drawings (**Kwok Mei-yee**, `{kwok}`). A sealed envelope is not proof the sender has a right to what is inside.

**Numbers to match** (Rao's six, for the same slot in the game): `district` Glass Heights for most, one retry may sit elsewhere as in Rao's (`manualhandling` is at the Docks); `days: 1`; `crewSize: 3`; `keyStats` three of the seven; **threat 3** for these (Rao's are 2, but this heist's crew is a tier up) and **pay about ¥5,000-6,500** each, the retry a little more (Rao's run ¥3,200-4,000 against a ¥11,000 finale; this finale pays ¥28,000). The rules in the box still apply: an exit on every crisis, difficulty bands by threat, no death without "push on".

**Canon cautions.**
- **No new named people or places without asking.** Use the cast above, or invent a minor unnamed one ("a night-shift supervisor") that nobody will need to recur. A named recurring person is new canon and goes through the `add-lore` skill: confirm with the owner first.
- **The associate in the penthouse stays unnamed**, as the heist's intro leaves him.
- Szeto's briefing voice is dry and exact ("I'm not paying you to understand the job. I'm paying you to finish it."). He doesn't thank anyone. The briefing in each job comes from `{szeto}` (check the token against `src/data/cast.js`).
- All characters 18+; Cantonese romanisation; ¥ for money; no real companies or places.

**Each job's file** also needs, as in Rao's, a comment at the top (what heist, which step, first ask or retry), `heistOnly: 'szetoTower'`, and **no heist effect inside the job** (`core/heists.js` awards it when the step is done). No `against` (no gang) and no grudge unless you want one. The id is the file's job id (snake_case), and the retry for a step can't be the same job as its first ask.

**Optional, later: the finale.** `penthouse` is the original generic job: a vault in a penthouse while "an executive is in Singapore", with a facial scanner, laser grid, the owner home, a vault timer and a drone. A heist-only finale written for Szeto (the same crises with the associate's real name and the thing in the vault, or new ones) would finish A2. The prep effects name crises by id (`facial_scan` is the one dropped here), so a rewritten finale must keep `facial_scan` or I update the heist data to match.

## Task 13: Battle screens wording (engine 2, 2026-11-11)

**What this is.** The five jobs that play on engine 2 (`data_pull`, `data_scrub`, `quiet_hours`, `warehouse`, `protection`) show placeholder text today: `[attackHit] Jax hits corp 1`. The screens (slice 2) cannot ship until the words are real. The rules never read these strings, so replacing them changes no mechanics. Every id below is a key in `src/data/fightText.js`; keep the key, replace the string. Section 17 and 20 of `drafts/SPEC-battle-orders.md` say where each line shows.

**Voice and rules (same as the shared rules above, plus these).**
- Round feed and threats: **present tense**, plain, one short line, under ~14 words (it is read at 360 px, many lines a round). Report cause lines: **past tense**, one sentence. If you would rather have the feed in past tense, say so and it goes that way everywhere.
- Slots are `{name}` and must stay in the line (a test checks they are kept; a line may use fewer if noted "optional"). `{who}` and `{target}` are runner handles. `{enemy}` is the kind word plus its number ("corp 2", "hired 1"; see "Kind words" below). `{n}`, `{round}`, `{leaves}`, `{rounds}`, `{chance}`, `{pips}`, `{why}`, `{outside}`, `{protected}` are shown as given.
- Hits are in pips, not hit points: "puts down" means the last pip. Never mention numbers in a hit line (the numbers sit beside it).
- The crew only knows what it saw. No unseen motives, no naming who sent a guard.
- No new names, places, factions or tech. Lantern Bay only (Glass Heights corp security and drones, Docks hired hands and enforcers).
- Deaths are plain and short, no gore ("{who} hits ... dead" is the whole line).
- Gender-neutral, always 18+.

**A. Kind words (4, plus a short plural each).** `hired`, `corp`, `drone`, `enforcer`. Today they read "hired 1", "corp 2". Give each a short noun phrase for a single one, e.g. "hired gun", "security guard", "drone", "enforcer". The number stays after it. *(4 × 2 forms.)*

**B. Round feed (39 lines, id: slots, shows in the watch feed and the report log).** Each has a hit/miss/out variant where listed; write them as a set so they do not repeat.
- Arrivals: `arrive` {kind} {n}; `pressure` {kind} {n} (a reinforcement walks in mid-fight); `standbyOut` {who}; `climbBack` {who} {target}.
- Van: `vanEarly` {round}; `vanIn` {leaves}; `vanCantWait` {outside}; `vanHeld` {rounds}.
- Overwatch (the covering shot at the door): `overwatchHit`, `overwatchMiss`, `overwatchOut`: {who} {enemy}.
- Attacks: `attackHit`, `attackOut`, `attackMiss`: {who} {enemy}; `attackGone` {who} (the target went down first).
- Work and medicine: `jamOk`, `jamFail` {who}; `stabilise`, `stabiliseFail`, `patch`, `patchFail`: {who} {target}.
- Boarding: `board`, `boardFail` {who}; `carry`, `carryFail` {who} {target}; `inVan` {who}; `carriedInVan` {target}.
- Enemy shots: `shotMiss`, `shotHit`, `shotAbsorbed` (vest takes it), `shotDown`: {enemy} {who}; `shotDead` {enemy} {who} (dies pulling out).
- Enemy moves: `flanked` {enemy} {who}; `backupCalled` {enemy}; `alarmClock` (no slots).
- Others: `withdrew` {who}; `enemyFled` (the rest of the hired run); `aura` {who} {target} (the medic keeps someone going, +1); `bleedOut` {who}; `leftDead` {who}.

**C. Threat words (4, shown before the round with a chance).** `threat.aim` {enemy} {who} {chance} {pips}; `threat.flank` {enemy} {who}; `threat.backup` {enemy}; `threat.alarm` {enemy}. Example shape: "corp 2 aims at Jax (60%, 2 pips)". Keep chance and pips in the line.

**D. What each order will do (11, the "intent" line under each runner).** `intent.attack` {who} {enemy} {why}; `.shield` {who} {target} {why}; `.patch`; `.stabilise`; `.jam` {who} {why}; `.work` {who} {why} (works the hack); `.board`; `.carry` {who} {target} {why}; `.move`; `.hunker`; `.withdraw`. `{why}` is the order behind it, short ("protecting Switch", "priority: radio", "fallback", "pull-out threshold"), which I fill; do not write it. Example: "Rook shields Switch (protecting Switch)".

**E. "If nothing" (4, generated from the orders, never promises an outcome).** `ifNothing.shielded` {n} (shots a shield takes); `.radio` {n} (calls with no one on them); `.shots` {n} (shots with no response); `.clear`. Say what is left uncovered, never what will happen. Good: "The radio call has no one on it." Not: "Backup arrives."

**F. Ends: the cause line on the report (8, past tense, one sentence).** `end.won`; `end.lost` {who} (hack lost); `end.abandoned` {who}; `end.extracted` (someone down, the crew pulls back); `end.pulledBack`; `end.deadline`; `end.leftBehind` {who}; `end.gone` (nobody left); `end.lostRunner` {who} (the van goes without them). Example from the spec: "No one had a jammer, so the radio call went out."

**G. Call-ins (the two authored dilemmas and the two door calls).**
- `techUnderFire` (hack: the tech is in trouble) shows **what changed** (`.changed`, {protected}) and four options: `.cover` {protected} (everyone covers them), `.radio` (an attacker takes out the radio), `.jam` {protected} (they jam it, no hack progress this round), `.carryOn`. Each option label under ~4 words, plus **one line each** saying the trade-off ("no hack progress this round"). *(1 + 4 labels + 3 trade-offs.)*
- `vanCantWait` (extract: the van leaves with people outside) shows `.changed` {outside}, and `.goNow` (they are left behind), `.hold` (+1 heat, holds the van two more rounds), `.carryOn`. One trade-off line each; the screen also shows the odds of leaving them.
- `callin.deathsDoor` {who} (at death's door: fight on or pull back); `callin.deadline` (the hack is out of time, shown if kept); `callin.pullBack` (the button, 2 words).
- Also one line each for the crew's intent in a call-in ("The crew is set to ...", built from the intent lines in D, so only write the lead-in: 1 line).

**H. Risk picker (3 labels plus 3 one-line explainers, shown on the plan screen and the round screen).** `cautious` (pulls out at half their pips), `steady` (pulls out at 2 pips), `committed` (never pulls out, fights on with someone down, **can cost a life**). The explainers must say plainly when someone can die: "Committed: fights on with someone down; can cost a life." is the spec's example. *(3 + 3.)*

**I. Plan screen lines (about 12).** The fight type line for **hack** ("Hack: 4 rounds of work. Keep {tech} working.") and **extract** (guess: "Extract: hold the door, then get everyone into the van."); gap lines: no jammer, no medic, no armour on the tech (each: what it means, one line, e.g. "No jammer: radio calls can only be stopped by attacking the caller."); the labels for the chance of losing someone ("Chance of losing someone: 4%", short form and a plain one for 0%); and the buttons **Next round**, **Change orders**, **Specials**, **Pull back** (2-3 words each).

**Where it goes.** `src/data/fightText.js` (the strings above), `src/data/dilemmas.js` (the call-in text), and `src/ui/` for button and label text. Paste the results back as `key: "text"` lines in the same order; anything off is flagged, not changed. Rough lines are fine.

**Order if short on time:** B (the feed, it shows every round), then G (the call-ins), then F, C, D, E, H, I, A. Anything left on a placeholder reads as `[key]`, which the owner can see is pending.

### Task 13: what came back (2026-11-11)

**In the game now** (`src/data/fightText.js`, `src/data/dilemmas.js` unchanged): the round feed (B), the threat words (C), the order intents (D), "if nothing" (E), the end causes (F), the call-in text with a trade-off line per option (G), and the four enemy kind words (A, singular; the number follows: "security guard 2"). The five engine-2 jobs show them now. The report's event log reuses the feed lines as they are.

**Adjusted against the rules** (the engine says otherwise, so the line changed; details in the DESIGN.md row of 2026-11-11, "Battle wording"): `arrive`/`pressure` (one enemy arrives, `{n}` is its number, not a count); `vanIn` (`{leaves}` is a round number); `vanEarly` (the van arrives at the end of the round); `board` ("climbs into" is only true once `inVan` follows); `overwatch*` (it is not always at a doorway); `attackHit`/`shotHit`/`stabilise`/`flanked` (drones, and "they" pointing at the enemy); `leftDead`; `ifNothing.*` (the counts are shots a shield takes, shots with no shield, and radio calls with no *jam* assigned: an attack on a caller is not counted as an answer, it can miss; "clear" means no shots or calls at all); `intent.*` (jam, carry and board are attempts); `techUnderFire.radio` ("Hit the caller": the shot can miss); `vanCantWait.goNow` ("Leave on time": the van goes at the end of the round, so runners can still board in it); `vanCantWait.carryOn` (it is the same as leaving on time).

**Held for the screens** (no key exists and nothing reads them yet; they go into `fightText.js` with the screens that show them). Corrected where the rules differ from the supplied text:
- Risk picker. Cautious: "Pulls out at half their pips or fewer (rounded up). Someone can still go down; a death only follows a call you make." Steady: "Pulls out at 2 pips or fewer. Someone can still go down; a death only follows a call you make." Committed: "Never pulls out on their own, even with someone down. Fighting on can cost a life." (The supplied "not a guarantee of survival" was dropped: on cautious and steady nobody dies without a call-in, which the design promises.)
- Plan: "Hack: {work} rounds of work; keep {tech} working." (four today, `FIGHT.workNeeded`); "Extract: hold until the van arrives, then get everyone aboard."; "No jammer: radio calls can only be stopped by hitting the caller first."; "No medic: nobody keeps the hurt on their feet." (patching and stabilising also work for anyone with a patch bonus; the aura is the medic's); "No armour on {tech}: nothing soaks a hit."; "Chance of losing someone: {chance}"; short "Loss risk: {chance}"; zero "No chance of losing someone in this forecast." (the forecast is the plan's odds at these orders, not a promise for the job).
- Buttons: Next round, Change orders, Special actions, Pull back.
- Call-in lead-in: "The crew is set to:".
- Kind words, plural: hired guns, security guards, drones, enforcers.

### Task 13: close-out (2026-11-11)

**The runtime wording pass is not complete: one blocker is open (the jam option, below).** The battle-screen task stays open until the lines below are wired and reviewed.

**Still open until the screens (slice 2) wire them.** No runtime keys are added for these before a screen reads them:
- [ ] Plan-screen copy (the fight type lines and gap lines above).
- [ ] Risk-picker labels and explanations.
- [ ] Buttons (Next round, Change orders, Special actions, Pull back).
- [ ] Call-in intent lead-in ("The crew is set to:").
- [ ] Plural kind words, wherever a screen needs them (hired guns, security guards, drones, enforcers).
- [ ] **`{chance}` and `{pips}` in `threat.aim`:** the screen must supply them with their units and the right singular or plural: `{chance}` as "60%" (no second percent sign in the line), `{pips}` as "1 pip" or "2 pips". The line itself adds neither. A test on the screen's output should cover a 1-pip threat.
- [ ] Visual check at 360 px (not done: the new screens do not exist yet): the death's-door call-in, and a van departure with someone outside.

**Follow-ups kept outside the wording pass** (each its own change):
1. **Jam-option eligibility (blocker for a clean pass).** "Have {protected} jam" rewrites the tech's order to `support` for the rest of the fight, not for one round (`applyPatch` keeps it until the orders are changed). Played out on 60 seeds: with a jammer and a radio call shown the tech jams while calls keep coming, but the hack never advances in those rounds; once there is no call, or if the tech cannot jam, the tech hunkers, shields a teammate or pulls out under the safety rule instead, with no hack progress, round after round. The option is offered whether or not a call is shown and whether or not the tech can jam. The trade-off line now says what happens, but the option can still waste the tech's rounds. Fix options for the owner: offer it only when a call is shown and the tech can jam, and/or make it last one round. Not changed here.
2. **The duplicate van choice.** "Leave on time" and "Keep current orders" do the same thing. Either drop one or make them differ. Whichever stays, the text keeps this: leaving on time still plays the round, so runners can board before the van departs.
3. **`callin.deadline`.** The key exists, no call-in uses it (the holdHack deadline ends the fight, spec 30). Decide whether to give it a consumer or remove it.

