# Writing tasks for the owner

Writing that can be done in other chats while the code is built, ordered by when it's needed.
Each task has a prompt to copy. **Always paste the context block from `WORLD.md`
("Context block for worldbuilding prompts") first, then the prompt, then any source file named.**
Paste the results back here as they are; they get checked against WORLD.md and turned into game data.

The fixed output formats matter more than polish: they let each batch go straight into the data
files. Rough lines are fine; anything off gets flagged, not silently changed.

| # | Task | Needed for | Size | Source to paste |
|---|---|---|---|---|
| 1 | Report lines for older crises (4 batches) | Mission logs, auto-run, side tasks | 59 crises, ~180 lines | `drafts/writing/report-lines-A.md` … `D.md` |
| 2 | Hand-written Container 409 mission log | The go / no-go test for mission logs | One log | `drafts/writing/container409-source.md` |
| 3 | Minor-check lines, the Docks | Mission logs | ~85 lines | none |
| 4 | Track lines, the Docks | Mission logs | ~30 lines | none |
| 5 | Phase lines, the Docks | Mission logs | ~20 lines | none |
| 6 | Summary lines (any district) | Mission logs | ~40 lines | none |
| 7 | Stat-unlock choices | Choices unlocked by stats | ~15 choices | a report-lines batch, or `container409-source.md` |
| 8 | One-off side tasks | Side tasks | ~20 tasks | none |
| 9 | Earned traits | Progression step 2 | ~10 traits | none |
| 10 | Jobs for the locked districts | Promotions and districts | 1-2 jobs per district | `drafts/district-hooks.md` |

Tasks 1 and 2 first: 1 is a prerequisite for everything hands-off, and 2 decides whether
mission logs get built at all. Do 3-6 only if the log in task 2 reads well.

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

---

## Task 1 · Report lines for older crises

Four batches (A: district crises and twists, B: Courier/Data Pull/Warehouse, C: Kidnap/Casino,
D: Penthouse/Protection). One chat per batch is fine.

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
(paste drafts/writing/report-lines-A.md here)
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

FORMAT:
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

## Task 3 · Minor-check lines, the Docks

```
TASK: Write short "minor check" lines for jobs in the Docks. A minor check is a small
moment between the big crises: one crew member, one stat, a quick roll. The success line
and failure line each nudge a track: ALERT (being noticed), TIME (schedule) or CONDITION
(fatigue, knocks).

For EACH of the 7 stats (combat, stealth, tech, social, driving, medical, cool), write 6
moments. Each moment has a success line and a failure line. Spread them over the four
phases (approach, position, objective, exit) and over the three tracks.

RULES: present tense (this is a live log), one sentence, under ~18 words. {op} for the
person rolling; {op2} for a second crew member if needed. Gender-neutral. Docks texture:
cranes, containers, gantries, salt fog, forklifts, Red Lantern toll booths, Wet Sleeve
cutters, AHL night shift, feral dogs, diesel. Nothing that needs a reply or a choice.
The failure is small: noise, delay, a scrape. Never an injury worse than a knock.

FORMAT (exactly, one line per moment):
<stat> | <phase> | <track> | success: <line> | failure: <line>

EXAMPLE:
stealth | approach | alert | success: {op} times the gantry lights and slips between the stacks unseen. | failure: {op}'s boot rings on a loose deck plate. Somewhere a radio crackles.
```

---

## Task 4 · Track lines, the Docks

```
TASK: Write lines that show a mission's tracks building up, for jobs in the Docks, and
lines that call back to that build-up later. Tracks: ALERT (how close the crew is to
being noticed), TIME (behind schedule), CONDITION (tired, knocked about).

For EACH track write:
- 3 "rising" lines (the track just went up a step),
- 3 "high" lines (it's now high, and the next big moment will be harder),
- 4 "callback" lines that refer back to when it started, using {time} for the moment it
  first rose (e.g. "Since the clang at {time}, the guards have been checking every row.").

RULES: present tense, one sentence, under ~18 words, gender-neutral, {op} if a person is
needed. Docks texture. No new events that would need a roll.

FORMAT:
<track> | rising | <line>
<track> | high | <line>
<track> | callback | <line>
```

---

## Task 5 · Phase lines, the Docks

```
TASK: Write atmosphere lines that open each phase of a job in the Docks. No rolls, no
events: just where the crew is and what it feels like.

Phases: APPROACH (getting there), POSITION (in place, waiting), OBJECTIVE (doing the
thing), EXIT (getting out). 5 lines per phase, some at night, some at dawn or in rain.

RULES: present tense, one sentence, under ~20 words. Docks texture. Gender-neutral; use
"the crew" rather than names.

FORMAT:
<phase> | <line>
```

---

## Task 6 · Summary lines (any district)

```
TASK: Write the short lines that open a mission report's summary. Each names a stat so
the player can see what it did.

Write, for EACH of the 7 stats (combat, stealth, tech, social, driving, medical, cool):
- 2 TURNING POINT lines: the roll that decided the job ("{op}'s nerve at the gate decided it.")
- 2 STANDOUT lines: the person who carried it ("{op} carried it on stealth: three clean checks.")
- 2 WHAT HURT US lines, one for a failed roll and one for a GAP (nobody on the crew had the
  stat): "Nobody could talk their way past; a face would have saved the bonus."

RULES: past tense, one sentence, under ~18 words, gender-neutral, {op} for the person.
No district-specific details: these are used everywhere.

FORMAT:
<stat> | turning | <line>
<stat> | standout | <line>
<stat> | hurt-fail | <line>
<stat> | hurt-gap | <line>
```

---

## Task 7 · Stat-unlock choices

```
TASK: For each crisis below, write ONE extra choice that only appears if someone on the
crew has a high enough stat. It should feel like a reward for growth: a cleaner, cleverer
way through that a weaker crew can't attempt. It's still a roll, just a good one.

Pick the stat that makes sense and a threshold: 10 (a decent rookie), 12 (a solid pro),
14 (a specialist). Rookie jobs should use 10-12.

RULES: same style as the existing choices (label as an action, "{op} ..."); success and
failure lines 1-2 sentences; failure no worse than the existing choices'. Add a plain
report line for each (see task 1's style).

FORMAT:
CRISIS <crisis id>
- <new choice id> | needs: <stat> <threshold> | label: <label> | difficulty: easy/normal/hard |
  success: <line> | failure: <line> [injury: none/light/serious] [cost: heat +1 / none] |
  report success: <line> | report failure: <line>

SOURCE:
(paste drafts/writing/container409-source.md, or a batch from task 1)
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
