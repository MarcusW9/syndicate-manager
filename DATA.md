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

## Inbox message
`type` (`job`, `crew`, `warning`, `rival`, `report`, `scout`, `finance`), `subject`, `body`, `day`, optional `expiresDay`. `blocking: true` stops Continue until resolved.

## Game state
`day` (day 1 = Monday, week 1, season 1; 364-day seasons), `cash`, `heat` 0-10, `reputation`, `tier`, `rent`, `crew`, `inbox`, `memorial`, `difficulty`, `seed`, `version`.
