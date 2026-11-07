# Plan: does every stat earn its place? (stat usage, 2026-11-07)

The question: does each of the seven stats (combat, stealth, tech, social, medical, driving, cool) decide outcomes often enough to be a stat? This plan measures it without changing the game, sets the rules for deciding **before** the numbers come in, and lists what follows from each answer. Driving is the stat in question; the others are measured so a fix for driving doesn't push one of them out of the healthy band.

Tool: `node scripts/sim-stats.mjs [seeds=60] [weeks=52] [policies] [--no-boost]` (counting in `scripts/lib/stat-usage.mjs`, test in `tests/statusage.test.js`). Output: a table on the console and `docs/sims/stat-usage-<date>.csv`.

## 1. What it measures

| Metric | What it tells you |
| --- | --- |
| Rolls per stat per week | Raw usage. |
| Jobs touched | Share of jobs where the stat is rolled at least once: everywhere, or niche. |
| Decisive share | Its share of all **decisive** rolls (the runner had a 15-85% chance). The rolls where the stat mattered, not near-certain passes or hopeless tries. Decisive rate (its own decisive rolls / its rolls) is shown beside it. |
| Costly failures per week | Failed rolls that led to heat, an injury, lost pay or a fight (definitions below). |
| Specialist utilisation | For runners whose main stat is S (their role's primary: medic → medical, driver → driving, ...), the share of the jobs they went on where they rolled S. Does a driver or medic earn their bed? Cool has no role of its own, so it has none. |
| Marginal value (+3) | The change in week-52 cash, injuries and heat if every runner has +3 in that stat, against the same seeds without it. **The real test**: raw counts make a stat look busy when its rolls are trivial. |

Breakdowns by approach (stealth, tech, loud, con) and by threat (1-5), because driving may only matter on loud or high-threat work.

### How a roll is counted
Every roll in the game is `d20 + value >= need`. The counter reads the events a run already writes, so it **never calls the RNG** and a run's results don't change (the test plays the same seeds with and without it and checks cash and deaths match).

- **On a job**: a finished job's report keeps its full `events` (`core/mission.js finish`, `timeline.events`). Crises (`chooseOption`, through `crewRoll`), incidents (`runIncident`), saves and patches, stabilising a critical, and every fight line (`core/battle.js`: shoot, flank, talk, lights, patch, stabilise, overwatch, the van) already carry `stat, value, die, need, success`. Nothing needed adding: the one roll without a stat is the hall's auto turret, which has no runner behind it and isn't counted.
- **Guards' attacks** (`guardAttack`) are written from the guard's side (value = their skill, need = 10 + the runner's cool and cover). The counter turns them round: the runner's cool roll succeeds when the guard misses, at 1 minus the guard's chance.
- **Off the job**: side work's roll is in its report (`timeline.side`) and is counted. Haggles over hires and renewals don't record their die, and raids need the player to answer the call; **none of the harness policies haggle, send side work or answer a raid**, so off-job rolls read zero in these runs. If a policy that does them is added, haggles need their die written down first.
- **Costly**: a failed crisis roll with a heat, pay or cash cost, an injury, or a fight straight after; a failed incident roll that no save rescued and that cost heat, pay, an injury or started a fight; the last save that missed; a failed stabilise (on a critical or in a fight); a guard's hit that did damage (a failed cool roll); failed side work that cost pay, heat, an injury or a night in the cells. A missed shot is not a cost on its own.

## 2. Runs

52 weeks, 60 seeds per policy (seeds 1-60), as in the earlier long runs (`tests/fame-sim.test.js`).

| Policy | What it plays |
| --- | --- |
| `careful` (baseline) | `tests/play.js playWeeks`'s player (fresh start, hires up to five above ¥10,000, the best-paying job the free crew can staff, Monday to Saturday, `carefulPolicy`), stealth, crew from **Joss's picks** (`core/squad.js jossPicks`: team, overwatch, Wheels where a crisis can drive, standby). |
| `loud` | The same, loud. |
| `mixed` | The same, each job's approach drawn at random from the four (on the sim's own dice, never the game's). |
| `tong` | `scripts/sim-tong.mjs`'s player: every crew out hands-off at once, stealth, Steady orders, never call; hires while cash allows, expands the safehouse. |
| `wheels` | `careful`, but a Wheels on every job (the best free driver), even where Joss wouldn't: driving's best case. |

Counterfactuals: `careful` seven more times, each with +3 to one stat for every runner (founders, and each hire the day they join, capped at 20), on the same seeds. The +3 change in cash is a paired difference (the same seed with and without), shown with ± two standard errors, so a change inside the noise reads as one.

## 3. Decision rules (agreed before running)

Usage numbers are from all five policies together; the +3 numbers from the `careful` counterfactuals.

1. **Cut or merge** a stat if it is rolled on **fewer than 20% of jobs**, takes **less than 5% of decisive rolls**, and **+3 changes week-52 cash by less than 2%**.
2. **Rework instead of cutting** if it is rarely rolled (the first two conditions) **but +3 has a real effect** (2% or more). For driving that means the getaway step and drone piloting (part 2 below).
3. **Rebalance** any stat that takes **more than 35% of decisive rolls**: it makes the others feel optional.
4. **Specialists idle** is flagged, not a verdict on its own: a role whose runners roll their main stat on fewer than 30% of their jobs.
5. **Rerun after each change.** The piloting and getaway work should move driving into the healthy band without pulling the others out of it.

The thresholds live in `RULES` at the top of `scripts/sim-stats.mjs`; the script prints the verdict for each stat.

## 4. What follows

### Part 1: measure (no game change)
The counter, the sim, this plan, the CSV, and a decision-log row once the results decide driving's fate.

### Part 2: fix driving (only if the sim confirms it's underused)
- Rename it **piloting**: vans, boats and drones.
- Move drone overwatch from tech to piloting, and Drone Jockey to piloting 10.
- Add a **getaway step** to every job's way out. A clean getaway sheds heat in that district; a failed one adds heat or a tail.
- Rerun the sim. If piloting still falls below the bar, cut it then.

### Part 3: leadership
One visible attribute that isn't rolled. It sets how many risky calls a lead takes before calling you in, morale recovery and how much mentoring helps, and who can run a hall. Old saves get a starting value from cool, jobs worked and fame. It shows in the planning read (shown risk equals used risk). Save version bump and migration.

### Part 4: hold until Phase 3
- **Judgment**: a hidden attribute that shapes standing-order choices, which scouts hint at.
- **Combat range bands**: rifles better at range, sidearms up close, a close-quarters specialisation. Heists will need these anyway.
- Combat stays one stat.

## 5. Results

See the next section (filled in from the first run).
