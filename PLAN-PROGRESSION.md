# Plan: the climb (rookie start) and getting attached to your crew

Agreed 2026-10-25, from the owner's first playtest: "I don't feel invested in
character development. The starting crew already seems strong. We should start
on rookie jobs with a novice squad, to give the sense of a long way to climb.
I want the RimWorld / Football Manager feeling of being invested in your guys."

One step per session, in order. Each step must stand alone: read CLAUDE.md,
this file, and only the code it names. Tick a step off here (and add its
CHANGELOG entry and DESIGN.md log row) in the same commit that ships it.
Playtest after step 1 before starting step 2.

## Why it feels flat today (diagnosis)

- The Lantern Bay Five start at main stat 15-17, at or above rookie graduation (15).
- They have no rolled ceilings, only default headroom by age (`defaultHeadroom` in
  `core/development.js`): Static +2, Jax / Stitch / Velvet +1, Wheels 0. The crew you
  actually play can barely grow; only hired rookies can.
- The 7 jobs all sit on the board from day one, crisis rolls aimed at 9-14.
  A roll succeeds on d20 + stat >= 10 + difficulty, so against difficulty 12:
  stat 16 = 75%, stat 11 = 50%, stat 8 = 35%. The crew starts near the top.
- Growth is invisible between points: `op.progress` is banked but never shown.

The 1-20 scale is not the problem (Football Manager uses it; on a d20 every +1
is a real 5%). Headroom and the starting point are.

## Decisions already made (do not re-open)

| Topic | Decision |
| --- | --- |
| Stat scale | **Keep 1-20 and the d20.** Add a progress bar under each stat showing banked points towards the next +1. A real 1-100 scale was reconsidered on 2026-10-25 (more frequent visible gains at the slower pace) and left out as too much work for now; look for other systems that make each point feel rewarding. |
| Starting crew | **Fresh crew only, all raw rookies.** The Lantern Bay Five and the start-crew choice leave the new-game screen. Every new game generates five rookies, one per core role (medic, muscle, tech, driver, face), aged 18-24. |
| Mentoring at start | None (no veteran). A mentor is something you hire later, part of the climb. |
| Rookie jobs | **New Street-tier rookie jobs** at the bottom of the board: low pay, easy rolls. |
| Job ladder | **Reputation steps inside Street tier**: rookie jobs + courier from 0 rep, threat 2 at ~15, threat 3 at ~35, threat 4 at ~60, threat 5 at ~80 (tune by sim). District unlocks at 100 stay as planned in HANDOFF.md. |
| Attachment features | **Career page, earned traits, crew relationships** (relationships un-parked). Personal wants were not chosen. |
| Order | Climb first (step 1, then playtest), then career page + earned traits, then relationships. |
| Ceilings | **Soft, not hard** (2026-10-25). The hidden potential becomes a *wall*: past it, growth keeps going but much more slowly (each point costs several times more; the multiplier is tuned by sim), up to 20. Supersedes "never passes the ceiling" (tests/development.test.js); update that test on purpose. |
| The Lantern Bay Five | Undecided. Owner's leaning: they live on as city characters, maybe a veteran crew you meet. Not in the new-game flow either way. |

## Steps

### Step 0 · Simulation (no game code) — [x] 2026-10-25
Throwaway sim in the scratchpad or a `tests/` helper, using the real core:
- **Growth:** a crew of five starting rookies (bands below), no mentor, careful job
  choice. Main stat after 10 / 20 / 40 jobs, by ceiling. Target: a good rookie goes
  ~9 -> 13 by the end of season one and reaches 15+ (graduation) in season two.
  If growth from 8-11 is too fast or slow, the knob is `pointCost`'s 1.7 or a
  start-only band, not the shared rookie band.
- **Reputation pacing:** with today's rule (+3 x threat per finished job, -3 per
  abort), weeks to reach each job gate. Target: a new job type every 1-2 weeks of
  play early on, slowing later.
- **Economy:** weekly wage bill of five rookies vs rookie-job pay and rent. Starting
  cash and job pay must leave the opening week a real choice, not a guaranteed loss.
  Propose new economy test bands for the rookie start.
Output: a short table here under "Step 0 results" with proposed numbers. Stop and report.

#### Step 0 results (2026-10-25)
Sim on a scratch copy of `src/` (not committed): five generated rookies (start band
primary -2 / others -1 from today's rookie band, so main 8-11, median 9; ceilings from the
rookie table, median 16; wage bill median ¥2,250), three stand-in rookie jobs (the courier's
crises with roll difficulty -4, i.e. 5-8), soft wall x4, reputation gates by threat
0/15/35/60/80. The sim player takes the best-paying job it can staff each day, never
hires or expands. 40-100 seeds, 52 weeks.

| Setup | Wk 4 cash (broke) | Wk 13 cash (broke) | Wk 52 cash | Gates opened (week): T2 / T3 / T4 / T5 | Main stat wk 13 / 26 / 52 |
| --- | --- | --- | --- | --- | --- |
| Today's rent ¥4,000, pay ¥1,400 | -6,700 (100%) | -36,800 (100%) | - | 3 / 7 / 12 / 12 | 12 / - / - |
| Rent ¥1,500, pay ¥1,800, today's board (2 new jobs/wk) | 3,850 (3%) | -800 (55%) | 56,000 | 3 / 8 / 13 / 15 | 12 / - / 17 |
| ... + reputation x0.4, growth cost x2 | 3,250 (3%) | -10,950 (95%) | -21,600 | 22 / 34 / 42 / 44 | 10 / 12 / 15 |
| **Rent ¥1,500, pay ¥1,500, board 4 new/wk (max 6), rep x0.4, growth cost x2.5** | **7,550 (0%)** | **11,750 (10%)** | **214,600** | **11 / 21 / 26 / 30** | **11 / 14 / 16** |
| ... same with rep x0.3 | 7,550 (0%) | 8,850 (10%) | 135,000 | 17 / 32 / 36 / 40 | 11 / 13 / 16 |

Findings:
- **Today's rent can't work with rookies.** ¥4,000 a week plus wages is more than rookie jobs pay, so every run goes broke. The start needs a cheaper first safehouse (~¥1,500).
- **The board is the real limit.** With 2 new offers a week, slowing reputation traps the crew on rookie jobs that don't cover costs. More small jobs (4 new a week, up to 6 on the board) fix it.
- **Mid-tier trap.** When threat 3-4 jobs open, a crew that grabs the best-paying one aborts a lot. Some tension is good; the busy board keeps it to ~10% broke.
- **Reputation is too fast as is:** +3 x threat per job puts rep 100 near week 15. x0.4 gives a new tier every ~5-10 weeks and District around the end of season 1.
- **Growth:** at cost x2.5 a rookie goes 9 -> 11 (wk 13) -> 14 (wk 26) -> 16 (wk 52). The wall multiplier barely matters in year one (x4 and x8 gave the same numbers): few people reach it that fast.
- **Late game gets rich** (¥200k+ by week 52) because rent never rises and the sim never hires. Expected; tune with safehouse upgrades and district tiers later, not now.
- Caveats: stand-in rookie jobs; a greedy sim player; no hiring, no freelancers.

Follow-up run (owner asked about lower wages): founding crew on ~60% of market wage
(bill ~¥1,300 a week) with today's board was still 80% broke at week 13; with **3 new
offers a week (max 5)** it was the best result: week 13 ¥8,850 (3% broke), gates T2-T5 at
weeks 15 / 25 / 33 / 39, rep 100 around week 52, main stat 11 / 12 / 15 at weeks 13 / 26 / 52.
Rest is already modelled (fatigue +16 per rookie job, -8 per rest day): five rookies on
two-person jobs manage ~3 jobs a week; bigger jobs (+34 at threat 4) are where rest bites.

**Agreed for step 1 (owner, 2026-10-25):** first safehouse rent ¥1,500; the founding five
on street wages (60% of `marketWage`, rounded to 50; recruits keep market price, and renewals
raise the founders' pay as they grow); rookie jobs ~¥1,500; the board adds 3 offers a week
(max 5), rookie work the most common; reputation gain x0.4; growth cost scale 1.7 -> 4.25
(x2.5; development test targets re-derived on purpose); soft wall x4. The slower pace is
wanted (replayability, a long climb). New economy test bands from step 1's own runs.

### Step 1 · The climb — [x] 2026-10-25 (built; see DESIGN.md for what changed from the plan, and measurements)
- **Rookie start.** `generateStartingCrew` (`core/recruits.js`): all five slots
  `rookie`, with a start-only band (proposal: primary 8-11, secondary 5-9, other 2-6;
  ceilings from the normal rookie table, 14-20). Wage bill band re-derived from step 0.
  Remove the start-crew choice from the new-game flow (`ui/app.js`); `newGame` defaults
  to fresh. Keep `STARTING_CREW` in `data/operatives.js` for now (tests and old saves);
  old saves keep their crew.
- **Rookie jobs.** 2-3 new threat-1 job types in `src/data/missions/`, crisis rolls
  aimed at 5-8, pay ~¥1,000-1,800, every crisis with an abort or extract. Proposals:
  *Back-alley Clinic Night* (medical, cool: also fixes the slow medic growth logged
  2026-10-23), *Debt Collection* (social, combat: the job a district hook once assumed),
  *Market Lookout* (stealth, driving). Gender-neutral text; Lantern Bay districts only.
- **Reputation gates.** Each job type gets a minimum reputation (by threat, numbers
  from step 0). The board only offers jobs you've earned; the next locked job shows
  as a one-line teaser ("Word is, someone's hiring for bigger work. Rep 15.").
  Rep at 100 stays the tier promotion (HANDOFF.md step 2).
- **Soft wall.** In `growStat` (`core/development.js`), past `potential` a point costs
  `pointCost × WALL` (WALL from step 0) instead of stopping; hard cap 20. The first time
  someone reaches their wall in a stat, one line in the report: "{name} has hit a wall
  in {stat}. It'll come slower from here." The scout reads ("at their peak") change to
  match ("past the easy gains").
- **Progress bars.** A thin bar per stat on the operative screen = `progress / cost`.
  Past the wall the bar simply fills slower, so a plateau shows as slow progress,
  never as a number. No hover-only info; bars 4-6px, inside rows that stay 44px+.
- **Tests:** update the start-crew and economy bands on purpose (log why); add tests
  that the starting crew is five rookies aged 18-24, one per role; that no job above
  your reputation is offered; that every new crisis has an exit.
- Save version: bump only if the state shape changes (job gating should read
  existing `state.reputation`).
Then **playtest** before step 2.

### Follow-ups found in step 1
- [x] **Founders' backstories** (fixed 2026-10-25): rookies draw only origins marked `young`.
- [x] **Crisis order** (fixed 2026-10-25): optional `after` and `order` on crises.
- [x] **Data Scrub** (2026-10-25): a threat-2 job for Okonkwo, opening at reputation 15.
- [x] **Abort penalty** stays -3 on purpose (owner, 2026-10-25): aborting should be costly.

### Step 2 · Career page + earned traits — [ ]
- **Candidate (owner liked it, 2026-10-25): skill thresholds that unlock crisis choices** (e.g. tech 12: kill a beacon quietly; driving 14: lose them on the flyover), so a +1 can change what a crew can do. Uses the existing `requires: { kind: 'stat' }`.
- **Career page** (tap an operative): stats on the day they joined vs now, jobs run,
  firsts ("first clean job, day 12"), injuries and scars, best moment, graduation day.
  Built from `op.history`, `op.startStats`, `op.growthLog` (needs a lifetime log: today's
  growthLog resets each season), plus a small `op.career` record. Save bump + migration.
- **Earned traits:** events add or change traits. Draft list to agree with the owner
  before building, e.g. *Scarred* (survived critical: +cool), *Shaky* (after a near-death,
  fades with clean jobs), *Ghost Driver* (several clean getaways), *Steady Under Fire*.
  Each earned trait gets a history line and an inbox note. Content in `data/traits.js`.

### Step 3 · Crew relationships — [ ]
Supersedes the 2026-10-25 "Crew relationships parked" row. Use the existing
`op.trust` map: trust moves from shared jobs (saved each other, a botched roll that
got someone hurt, trait clashes from `data/tags.js`). Pairs that trust each other get
a small roll bonus together; rivals a penalty or a refusal line. Shown on the career
page and the planning screen. Templates for relationship lines (`{a}`, `{b}`), not
hand-written pairs. Design details to agree before building.

## Writing and autonomy (agreed 2026-10-25, see DESIGN.md)
- Rookie jobs use the narrative voice (second person, named characters, short dialogue)
  but are built for reuse: characters in `data/cast.js` with line banks (`{siu}`,
  `{siu:approve}`), district slots (`{district}`, `{faction}`), and a shared rookie crisis
  pool (`data/rookieCrises.js`) mixed into every rookie job.
- Every choice in a rookie job has a one-line `report` (plain, objective) used in the
  after-action message, ready for autonomous runs later.
- Autonomy (orders and call-ins) is a direction, not part of this plan.

## Open questions (ask the owner when the step comes up)
- What becomes of the Lantern Bay Five (leaning: city characters / a veteran crew).
- Step 2's earned-trait list and their effects.
- Whether starting rookies should show a hint of their ceiling on day one (the scout read
  needs a crew-mate; with five rookies the read is everyone's guess).
