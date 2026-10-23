# Data shapes

Plain-English reference for the game's data. The code version is `src/core/types.js` (JSDoc).

## Operative
| Field | Meaning |
| --- | --- |
| `id`, `name`, `handle` | Internal id, full name, street name used in narration |
| `age` | Always 18+ (checked by `validate.js`) |
| `role` | `medic`, `muscle`, `tech`, `driver`, `face`, `infiltrator` |
| `stats` | 1-20: `combat`, `stealth`, `tech`, `social`, `driving`, `medical`, `cool`. 10 = competent pro |
| `traits` | Ids from `src/data/traits.js` |
| `wage` | Paid every Sunday |
| `condition` | `fatigue`, `morale`, `neuralLoad`, `burnout` (0-100), `injury` + `injuryDays` |
| `trust` | Other operative id -> -100..100 |
| `bio`, `origin` | Personality and background text |
| `history` | Notable events, for story memory and the memorial |
| `tier` | `rookie`, `pro` or `veteran`. Rookies become pros at 15 in their main stat |
| `potential` | Hidden ceiling per stat. Never shown as a number |
| `progress` | Growth points banked per stat towards the next +1 |
| `startStats` | Stats on the day they joined (to show growth) |
| `scoutError` | How far off (-2..2) the crew's read of their main-stat ceiling is |

## Development (src/core/development.js)
Growth points: 4 to whoever rolls in a crisis (a failure counts too), 1 to the rest of the crew, plus 2 per key stat and 3 in their own main stat for finishing a job. Points are multiplied by age (under 25 x1.5, 25-34 x1, 35+ x0.5) and by 1.5 for a mentored rookie (crew has a veteran-trait operative or a same-role veteran). The next +1 costs (stat + 4) x 1.7, doubled for the last point below the ceiling. At each new season everyone ages a year; past 40 each stat may drop 1.

## Recruit (src/core/recruits.js)
Same shape as an Operative, plus `culture`, `quality` (`rookie`/`pro`/`veteran`, becomes `tier` on hiring), `expiresDay`, `haggled`, `haggleResult`, `scoutReport` (the scout's opinion in words). Pools live in `src/data/recruitPools.js` (cultures and names, handles, origins per role, personalities, badge colours). Hiring strips the recruit-only fields and adds `condition`, `trust` and `history`.

## Injury ladder
`healthy` -> `light` (days) -> `serious` (weeks, may leave a scar trait) -> `critical` (triggers a crisis now) -> `dead`.

## Mission template
| Field | Meaning |
| --- | --- |
| `threat` | 1-5, drives the risk read |
| `pay`, `days`, `crewSize`, `heat` | Reward, time away, crew needed, heat gained |
| `keyStats` | Stats the risk read compares against the crew |
| `beats` | Narrated text in order. Placeholders: `{driver}`, `{tech}`, `{face}`, `{muscle}`, `{medic}`, `{op}` |
| `crises` | Pool of crises; 2-3 are drawn per run |

## Crisis and choices
Each choice has a `kind`: `push`, `adapt`, `abort`, `stabilise` or `extract`.

**Rule: every crisis has at least one `abort` or `extract` choice.** That is the "no death without a choice" promise, enforced at startup.

A choice tests one `stat` against `difficulty` (d20 + stat vs 10 + difficulty, tuned later), may need a role or trait (`requires`), and may cost cash, heat, client trust or a share of pay. On failure it applies `failureInjury`.

Optional fields: `failureCost` (extra heat/pay/cash lost only on a failed roll), `sure: true` (no roll, always succeeds, shown as "certain"), negative `payCut` in `cost` (bonus pay). `neural: n` adds neural load to whoever rolls (x1.5 if Chromed).

A crisis with `focusRole` centres on that operative: they take the injury if a choice fails. Without one, whoever made the attempt is hurt.

## Mission flow (src/core/mission.js)
1. `startMission` draws 2 crises (3 at threat 4+ if the pool has them) and spreads them between beats.
2. `revealBeat` shows the next beat. `chooseOption` resolves a crisis choice: roll `d20 + stat >= 10 + difficulty`.
3. If someone goes **critical**, `resolveCritical` must be called first: `stabilise` (medic, difficulty 9), `extract` (job ends, +50% pay cut, op saved) or `push` (op may die at the end: 35% survival, 65% with a medic, 100% on Story or if the job is later aborted).
4. `finish` pays out, adds heat and fatigue, sets the crew away for `days`, moves the dead to the memorial and posts a report.

## Inbox message
`type` (`job`, `crew`, `warning`, `rival`, `report`, `scout`, `finance`), `subject`, `body`, `day`, optional `expiresDay`. `blocking: true` stops Continue until resolved.

## Game state
`day` (day 1 = Monday, week 1, season 1; 364-day seasons), `cash`, `heat` 0-10, `reputation`, `tier`, `rent`, `crew`, `inbox`, `memorial`, `jobs` (offers on the board), `activeMission` (null or the mission in progress, saved so a reload resumes it), `difficulty`, `seed`, `rngCounter`, `recruits` (open leads), `recruitSeq`, `rosterCap` (beds), `safehouseLevel`, `lastJobDay`, `version` (currently 4).
