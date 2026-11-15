# Fight recipes: the template

A **fight recipe** gives one job's fight its own authored **waves** of enemies (slice 3-i, 2026-11-15). Recipes live in
`src/data/fights.js` as `FIGHT_RECIPES`, keyed by job id. The rules that read them are in `core/fight.js` (`buildFight`
sets `b.recipe` and `b.maxExtra`; `startRound` spawns the waves). Which jobs get waves, and what they are, is the owner's
call: write one in this format (or in plain words, "Quiet Hours: 3 hired at round 3") and hand it over.

## The format

```js
// In src/data/fights.js
export const FIGHT_RECIPES = {
  <job id>: {
    maxExtraEnemies: <number>,          // optional
    waves: [
      { round: <number>, count: <number>, kind: '<enemy kind>' },  // kind is optional
      // ...more waves
    ],
  },
};
```

| Field | Meaning | Rules |
| --- | --- | --- |
| `round` | The round the wave arrives at the start of | 1 or more. Round 1 means it comes in with the fight's first round. |
| `count` | How many enemies in the wave | 1 or more. A wave of 1 never runs (a lone arrival). |
| `kind` | Who they are | Optional. Left out, the wave sends who the clocks send (`reinforceKind`): the job's `opposition` grunt (police or corporate), else the district's first kind. Or name one: `hired`, `corp`, `drone`, `enforcer`, `police`, `secforce` (`data/fights.js ENEMIES`). |
| `maxExtraEnemies` | Cap on the *reactive* arrivals: backup calls, the alarm clock, the pressure clock | Optional; default `FIGHT.maxExtraEnemies` (2). Waves never count toward it. |

## How a wave behaves

- It arrives at the start of its round, before the threats are drawn, and the log says so (`wave`).
- It spends that round **coming in** (`approaching`): it can be shot at its cover, but its aimed shot and flank are spent
  unplayed (radio calls, backup and alarm, still play), and it cannot run. The round screen tags it "Coming in".
- Each wave is **its own group**: it runs once fewer than 40% of its breaking bodies (hired, police, secforce) are still up,
  except anyone still coming in. Corp, drones and enforcers never run.
- An attacker with the `approaching` priority goes for it first (no screen sets priority words yet).

## The jobs, and where waves make sense

| Job id | Fight | How it ends | Starting enemies | Who the clocks send |
| --- | --- | --- | --- | --- |
| `data_pull` | holdHack: hold while the tech hacks | Work done, or the round 7 deadline | Threat 3: 3 | Heights: corp (district kinds corp, drone) |
| `quiet_hours` | holdHack | Same | Threat 3: 3 | Docks: hired (district kinds hired, hired, enforcer) |
| `data_scrub` | holdHack | Same | Threat 2: a leader + `secforce` grunts (corporate) | `secforce` |
| `warehouse` (Warehouse Lift) | holdExtract: hold for the van, then board | The van comes round 3 and leaves 4 rounds later (about round 7) | Threat 4: a leader + `police` grunts | `police` |
| `protection` | holdYard: win by rout | Every enemy down or run, none still on the way | Threat 3: 3 | Docks: hired (district kinds hired, hired, enforcer) |

Check `FIGHT_JOBS`, `SITE_ENEMIES`, `COUNT_BY_THREAT` and `OPPOSITION` in `data/fights.js` and each job's `threat` and
`opposition` in `data/missions/` for the numbers as they stand; this table is a snapshot.

Practical limits:
- **holdHack jobs:** a wave at round 7 or later never arrives (the deadline).
- **Warehouse:** a wave after about round 7 comes too late; rounds 4 to 6 hit while the crew is boarding, the hardest moment.
- **Protection:** every wave makes the fight longer, because it has to be routed too.
- **Toughness:** hired, drone, police and secforce are 1 pip (police and secforce also carry a plate that the first plain hit
  only cracks); corp and enforcer are 2 pips and hit for 2.

## Example (made up, for the shape only)

```js
export const FIGHT_RECIPES = {
  quiet_hours: {
    waves: [
      { round: 3, count: 3, kind: 'hired' },    // a gang comes in mid-hack
    ],
  },
  protection: {
    maxExtraEnemies: 1,
    waves: [
      { round: 2, count: 2 },                   // more of who the clocks send
      { round: 4, count: 1, kind: 'enforcer' }, // then the heavy
    ],
  },
};
```

## A new job built around waves

New fight jobs are drafted with `docs/new-job-prompt.md` (its optional `/* FIGHT */` block: the fight type, the opposition, the
waves with a story reason for each) and added with `/add-job`, which turns the block into a `FIGHT_JOBS` entry, the job's
`opposition` and a `FIGHT_RECIPES` entry in this format. Prefer new jobs for wave-heavy fights; waves on the five existing jobs
change fights players already know (owner, 2026-11-15). Only the Heights and the Docks have their own enemy kinds
(`SITE_ENEMIES`); a fight job in another district gets the Docks' mix unless its waves and opposition name kinds.

## Adding one (checklist)

1. Add the job's block to `FIGHT_RECIPES` in `src/data/fights.js`.
2. Re-run the fight sims before and after and write the comparison to `docs/sims/` (the commands are at the top of
   `docs/sims/slice3i-2026-11-15.md`); check the declared bars in `sim-gate-teams` still hold.
3. `npm test` (a recipe changes the planning odds too: the board reads the same fight, so shown equals used).
4. A changelog entry and a DESIGN.md row (which job, which waves, why).
