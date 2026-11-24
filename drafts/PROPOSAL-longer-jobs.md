# Proposal: harder jobs run like expeditions

Status: **built 2026-11-24** (owner: 1a 2a 3a 4a 5a 6a, "build them together"; save v90; decision log of that date, `CODEMAP.md` `prep.js`). Next: the owner marks the prep stops' text (`drafts/writing-tasks.md`), more district stops, hand-written routes for heists and threat 4-5 jobs, then stakes at home. Was: direction agreed, details open (2026-11-24).

## What the owner said

From the 2026-11-24 playtest: "Missions are decent though they feel very quick and sort of not impactful right now ... most of the time I send my guys away and don't even think about it. They return quite quickly too." And: "I thought jobs would run similar to expeditions, them being multimap etc and having a randomly generated sort of story in between."

Agreed the same day (decision log):
- **Jobs and expeditions stay two things.** A job is client work (pay, fame, trust, planned on the squad board, can be watched). An expedition is the tong's own hunt for one goal (no pay or fame, always hands-off). The split is what you get and who you work for, not the length.
- **Harder jobs run longer**, over several days, with the adventure log's generated lines between **stops on different maps**, then the job's own map.
- **The stops come from a shared library of prep stops** (by district and approach), so every harder job gets them at once; heists and threat 4-5 jobs also get hand-written stops (`/add-job`).
- **Stakes at home while a crew is away** (a raid finds the hall short-handed, a better offer arrives) come later, after this has been played.

## What exists today

- **Lengths** (`src/data/missions/`, `core/jobs.js daysRange`): 74 of 79 jobs are written as 1 day, 4 as 2 days, 1 as 3. An offer can add a day (threat 1-2) or two (threat 3+), capped at `MAX_JOB_DAYS` 4, each extra day +5% pay (`EXTRA_DAY_PAY`). Rookie work never varies. `core/jobcheck.js` allows 1-3 days.
- **The crew is away for the job's days** (`mission.js` sets `awayUntil`), watched or hands-off.
- **The log** (`core/advlog.js`, slice 1): a hands-off job writes a line every day out (casing, setup, waiting, snag), in the district's people and places. A one-day job has no days to write.
- **Stops** (`core/multimap.js`): a job with `maps` plays crises on their own maps before its finale; fixed routes, branches, shortcuts and wrong leads. Three jobs use it (Kidnap Rescue, Salt in the Seals, Signed for the Shift). Sent hands-off, the stops play on the days before the last and the finale on the last day; watched, the whole route plays in one sitting.
- **Prep that changes a job** already exists for heists (`core/heists.js`): prepared steps lower the finale's threat (`threatDelta`), raise its pay (`payMult`) or drop a crisis from its draw (`drop`).

So every part is built. What's missing is that the board's jobs don't use them.

## The proposal

### 1. Lengths by threat

| Work | Days now | Days proposed (the offer can add one) | Prep stops |
| --- | --- | --- | --- |
| Rookie and routine work | 1 | 1 (unchanged) | none |
| Threat 1 | 1 | 1 | none |
| Threat 2 | 1 | 2 | 1 |
| Threat 3 | 1-2 | 3 | 1-2 |
| Threat 4 | 1-2 | 4 | 2 |
| Threat 5 | 3 | 5 | 2-3 |

Threat 4-5 jobs then run as long as expeditions (4-6 days). `MAX_JOB_DAYS` goes from 4 to 6; `jobcheck` allows 1-6. Quick work stays quick: the board still has 37 one-day jobs (rookie, routine, threat 1), so a small crew always has something to do.

### 2. A job, day by day

- **Day 1:** the log opens (a contact, a place, as on an expedition).
- **The days between:** a log line each day; on some days a **prep stop**: a crisis on its own map (a stairwell, a mahjong parlour's back room, a loading bay), with an abort as always.
- **The last day:** the job's own map, its crises and its fight, as now.

### 3. Prep stops: a shared library

`src/data/prepStops.js`: each stop has a place and time line, the districts and approaches it fits, one crisis (with abort or extract), and **what it does to the job**:

- **Success:** lowers the finale's threat by 1 (`threatDelta`, as heists do), or takes one crisis out of the finale's draw (`drop`), or opens an inside contact (`am.inside`, already read by `sidetasks.js intelFor`).
- **Failure:** the finale starts with alert +1, or a crisis is added; never an injury past light, never a death.
- **A strong result** can skip the next stop (the multi-map shortcut).

Examples, by approach:
- **Stealth:** case the building from the roof opposite; lift a keycard from a night guard's locker.
- **Tech:** splice into the street camera box; clone a delivery app's login.
- **Con:** meet the client's contact at a tea table; get a tailor to make a uniform.
- **Loud:** lose a tail through the market; buy a van with no questions.

Each district gets 4-6 of its own (its people and places from the district log files), plus about 8 that fit anywhere: **about 30 stops** to start. Claude drafts them; the owner marks them, as with the log lines.

**Picking:** when an offer is made, a hash picks its stops from those that fit its district and its likely approaches. The offer keeps them (`job.prep`), so the board can show the route, and the stops don't change between seeing the job and sending the crew. Jobs written with their own `maps` (the flagships) keep their own route and get no shared stops.

### 4. Pay, from the sim

`LONG=1 PAYX=<x> node scripts/sim-longer-jobs.mjs 8 3,5,7 "" posts`: the board's harder jobs lengthened as in the table (no stops yet, so no extra risk), a careful player running every job the free crew can staff, idle runners on security posts. Margin = net over the weekly bill, weeks 13-26, median of 8 seeds:

| Pay per day added | 3 crew | 5 crew | 7 crew |
| --- | --- | --- | --- |
| today's lengths | +42% | +30% | +35% |
| longer, no pay rise | +29% | +33% | +22% |
| **longer, +50% of base pay per day added** | +29% | +33% | +35% |
| longer, +100% | +29% | +34% | +35% |

Reading:
- **At +50% a day, 5 and 7 crews earn what they earn now.** Fewer, bigger jobs, with idle runners on posts in between.
- **A 3-person crew earns less late on** (+42% → +29%): with three people, a long job is the whole crew gone. Still well in profit, and it is the point (a small crew has to choose between a long job and quick work).
- **Pay above +50% changes little**, because the sim's careful crew stays at reputation 15-35 for 26 weeks, mostly below the threat-3 gate (35). The numbers for threat 4-5 jobs need a longer run (52 weeks), and the fame sim (`tests/fame-sim.test.js`) needs re-running: fewer jobs for a small crew may slow fame.
- Prep stops add rolls and so risk; the sim must be run again once they exist, before the pay is fixed.

### 5. Watching a long job

Today, a watched multi-map job plays its whole route in one sitting, and the crew is then away for its days anyway. With most harder jobs multi-day, that reads oddly ("I watched it all, why are they still away?"). Two ways (Q2):
- **(a) Day by day, always.** A job runs on its days whether watched or not; "watch" means you're called in to each stop and to the finale on their days. Being away becomes real: the crew is out there, and you check in. The call-in system already does this for hands-off jobs (`core/away.js`, `callIn: 'every'`).
- **(b) As now.** Watching plays everything at once; the days are only time the crew is unavailable.

### 6. What it touches

- **Data:** each non-rookie, non-routine job's `days`; `src/data/prepStops.js` (new); `docs/new-job-prompt.md` and `/add-job` (lengths and stops).
- **Core:** `core/jobs.js` (`daysRange`, `MAX_JOB_DAYS`, picking `job.prep` in `addOffer`), `core/multimap.js` (a route built from `job.prep` when the template has no `maps`), `core/mission.js` (prep results into `threatDelta`, `alert`, `drop`), `core/jobcheck.js` and `core/validate.js` (days 1-6; prep stops validated like crises), `core/away.js` (only if Q2 is (a) for watched jobs).
- **UI:** the job page lists the route ("Day 1 · case the place, day 2 · meet a contact, day 3 · the job"); the watch heading between maps; the report's days out (already there).
- **Save:** `job.prep` on offers and a run's prep results (**save v90**, migration: old offers and runs have none and play as now).
- **Tests:** `jobcheck` lengths; `tests/jobs.test.js` day ranges; a new test that every prep stop has an abort and nothing in one can kill; the fame sim; the year-of-play save budget (longer logs, capped at 10 lines).
- **Design rules:** unchanged. Every stop has an exit; prep stops cost at most a light injury; no death outside the shown, accepted risk.

## Suggested order

1. **Slice 1: lengths and the route on the job page,** with a first library of about 12 stops (the 8 that fit anywhere, plus a few for the Docks and Old Town). Re-run the income and fame sims and set the pay.
2. **Slice 2: the rest of the library** (every open district), once the owner has marked the first stops.
3. **Slice 3: hand-written routes** for heists and the threat 4-5 jobs, through `/add-job`.
4. **Later (owner, 2026-11-24): stakes at home** while a crew is away.

## Questions for the owner

1. **Lengths:** (a) the table above: threat 2 two days up to threat 5 five *(recommended)*; (b) shorter: threat 2-3 two days, threat 4-5 three or four; (c) longer: everything threat 2+ at least three days.
2. **Watching a long job:** (a) day by day: you're called in to each stop on its day *(recommended)*; (b) as now: watching plays the whole route at once.
3. **What a prep stop does:** (a) it changes the job: success lowers the threat or drops a crisis, failure raises the alert *(recommended)*; (b) story only, no effect on the job.
4. **The route on the board:** (a) the job page names its stops before you send anyone *(recommended)*; (b) hidden until the crew is out (a surprise each day).
5. **Pay:** (a) +50% of the job's base pay for each day added, re-checked once stops exist *(recommended)*; (b) more (+100%), so long jobs clearly out-earn quick work; (c) no rise: longer jobs earn the same, the reward is the story and the loot.
6. **Who writes the stops:** (a) Claude drafts about 30, the owner marks them (as with the log lines) *(recommended)*; (b) the owner writes them from a prompt, like `docs/log-lines-prompt.md`.
