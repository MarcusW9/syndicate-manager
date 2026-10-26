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
| 7 | **Stat-unlock choices (next)** | Choices unlocked by stats | ~16 choices | `drafts/writing/stat-unlocks-source.md` |
| 8 | One-off side tasks | Side tasks | ~20 tasks | none |
| 9 | Earned traits | Progression step 2 | ~10 traits | none |
| 10 | Jobs for the locked districts | Promotions and districts | 1-2 jobs per district | `drafts/district-hooks.md` |

Tasks 1 and 2 first: 1 is a prerequisite for everything hands-off, and 2 decides whether
mission logs get built at all. Tasks 3-6 wait until the first mission-log slice is built and shows where words are missing (decided 2026-10-26).
The slice is built (2026-10-26); play some runs before writing 3-6. **Task 7 is next.**

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

## Task 7 · Stat-unlock choices (next, 2026-10-26)

Paste the context block, this prompt, then `drafts/writing/stat-unlocks-source.md`.

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
