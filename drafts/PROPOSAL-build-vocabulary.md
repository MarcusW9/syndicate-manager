# Proposal: the build vocabulary (the words every piece is written in)

Status: draft for iteration, 2026-11-18. Nothing built. This is section 2.6.2 of `PROPOSAL-swarm-and-special-moves.md` worked out: the small set of hooks that moves, payloads, traits, gear perks and the medic's, pilot's and leader's abilities are all written in, so they combine without naming each other. Read with `PROPOSAL-combat-builds.md` (the effect library and archetypes), `PROPOSAL-runner-shaping.md` (the one menu) and `docs/research/abilities-and-builds.md` (what other games and designers learned).

## The owner's aim (2026-11-18)

> "Lots of independent things which can combine to make cool effects, even ones you and I may not have thought of. Allowing players to make creative effects such as roguelike ones like Hades. It's difficult to make the actual combat realistic and interesting on a Football Manager view, so I want to make it satisfying and visually pleasing."

So the fights earn their keep by **combinations the player builds and enjoys watching**, not by simulating a firefight in detail.

## What makes it scale (2026-11-18)

1. **A generic trigger step in `fight.js`, built first.** When a trigger fires, every piece listening for it runs its who and what. Ricochet and the Vectors move onto it, with tests that they behave exactly as before. After that, a piece made only of existing words is data, not engine code.
2. **A combo sweep.** A script plays every pair of pieces against each enemy mix (armoured, swarm, synthetic) and flags outliers.
3. **A speed budget.** The board replays many fights for its odds; the trigger step's cost a fight is measured and guarded by a test.
4. **A fixed order** when several pieces fire on one trigger (seat order), and cosmetic rolls never shift a rules roll.
5. **A proper `if` field** for conditions (has status, has tag, enemies up), and later words for scaling and positioning.

## The rule that makes combinations emerge

**A piece is written only in vocabulary words, and never names another piece.** "On kill, your mark jumps" is allowed; "if the runner also has Ricochet, ..." is not. The combination comes from the rules reading the same words. This is already true of the built pieces: Ricochet (a delivery) and the Contagion Vector (a payload) never name each other, yet a bounce that kills an infected enemy makes the infection jump.

A piece is four short fields: **when** (a trigger), **who** (a target rule), **what** (one or more effects) and **limit** (how often). Everything in them comes from the lists below.

## Triggers (when)

Written in the fight's own units (rounds, HP, plates, groups; `docs/BATTLES.md`). Engine 2 moves from pips to HP (owner, 2026-11-18): one old pip is 10 HP, so "loses a pip" below reads "loses 10 HP" until the numbers are retuned.

| Word | Fires when | Built today? |
| --- | --- | --- |
| `onHit` | a runner's attack lands (damage 1+, past the plate) | yes (the Vectors infect on it) |
| `onCrack` | a runner's attack only cracks a plate | the event exists (`cracked`); no piece reads it |
| `onKill` | an enemy goes down to a runner's attack, burst, tick or overwatch | yes (Contagion's jump reads a fall) |
| `onTick` | a status ticks at the round's end | yes (the Vector's tick) |
| `onBreak` | an enemy group flees (its share up falls below `fleeBelow`) | the flee exists; no piece reads it |
| `onAllyDown` | a crewmate is downed | the event exists; no piece reads it |
| `onHurt` | the runner themself loses HP | the event exists; no piece reads it |
| `roundStart` | the round begins, after arrivals and the telegraph | yes (moves check `when` there) |
| `enemiesUp n` | at least n enemies are up (a condition, not an event) | yes (Ricochet's `when`) |

**Proposed first set:** all of them. Each is an event the engine already has; reading it is new, adding it is not.

## Target rules (who)

| Word | Meaning |
| --- | --- |
| `self` | the runner with the piece |
| `target` | the enemy the trigger was about |
| `nextInGroup` | the first other enemy of the same group that is up (Contagion's rule today) |
| `nearest n` | up to n enemies, in the rules' order (Ricochet's rule today) |
| `group` | every enemy of the target's group |
| `ally` | the crewmate the trigger was about (for `onAllyDown`) |
| `crew` | every runner inside |

## Statuses (what a target carries)

A status is a named mark on a body that other pieces can read. **This is where most combinations come from:** one runner's piece puts a status on, another's reads it.

| Status | On | Does by itself | Read by | Built today? |
| --- | --- | --- | --- | --- |
| `infected` | enemy | loses a pip each `onTick` | Contagion's jump | yes |
| `marked` | enemy | nothing; a mark for others to read | pieces that hit marked targets harder, "a marked kill ..." | no |
| `exposed` | enemy | its next hit taken ignores the plate | any attack | no (the effect library's "nanite/acid") |
| `jammed` | enemy (synthetic) or a radio call | loses its next action | anything that wants it quiet | partly (the jam call-in stops a radio call) |
| `shaken` | enemy | counts as down for its group's flee check | `onBreak` pieces | no |
| `burning` | enemy | loses a pip `onTick` and can spread on a kill like `infected` | the reactions below | no |
| `stabilised` | runner | cannot lose pips this round | medic pieces | partly (stabilise is an order) |
| `steadied` | runner | their next roll that misses by 1-2 holds | leader pieces | no (the leadership proposal's steady hand) |

Each status has: a duration in rounds (or until it falls), whether it stacks (default: no, the first stands, as the Vector does), the tags that are immune to it, a short log word, and a look on the stage (`data/fightLooks.js`).

## Effects (what happens)

| Word | Meaning |
| --- | --- |
| `apply <status>` | put a status on the who |
| `spread <status>` | move or copy a status to `nextInGroup` (copy loses a step; see the guardrails) |
| `extraHit` | one more attack on the who, rolled like any attack |
| `hp ±n` | the who loses or regains HP |
| `crackPlate` | the who loses a plate without a roll |
| `refreshUse` | a move gets a use back |

## Tags (what a body is)

Enemy tags (`foeTags` in `data/fights.js`) are the counters: `synthetic` today (immune to the Vectors). Proposed next: `armoured` (plates; the owner's open question "do drones count as armoured?" goes here), `swarm` (many weak bodies), `boss` (immune to `jammed` and `shaken`, as the effect library's guardrail says for control), `organic`. A status lists the tags immune to it; a piece never checks a tag itself.

## Guardrails (from `PROPOSAL-combat-builds.md` section 8, made concrete)

1. **No loops.** A spread or `extraHit` caused by a piece cannot fire `onHit`/`onKill` pieces again in the same chain. One chain per trigger.
2. **Spreads weaken.** A copied status has one round less, or one tick less, per jump.
3. **No stacking.** A status already on a body is not renewed or doubled.
4. **Caps live in data.** Uses per fight, reach, durations: named numbers in `src/data/`, tuned by feel (the owner's 2.6.5).
5. **Shown equals used.** Every trigger and status shows in the round preview and counts in the planning odds (the fight is replayed, so this comes free if the rules live in `fight.js`).
6. **Readable.** Every effect has a log word and a look. If the stage cannot draw it, it is not in the vocabulary yet.
7. **The death rule does not move.** No piece changes who can die or when.

## Ten example pieces, written only in the vocabulary

| Piece | When | Who | What | Limit |
| --- | --- | --- | --- | --- |
| Ricochet (built) | `roundStart` + `enemiesUp 2` | `nearest 3` | `extraHit` each | 1 a fight |
| Cytotoxic Vector (built) | `onHit` | `target` | `apply infected` (until it falls) | |
| Contagion Vector (built) | `onHit`; `onKill` of an infected | `target`; `nextInGroup` | `apply infected` (2 rounds); `spread infected` | |
| Spotter's Eye | `onCrack` | `target` | `apply marked` | |
| Executioner | `onKill` of a marked enemy | `nextInGroup` | `extraHit` | 1 a round |
| Plate Breaker | `onHit` of a marked enemy | `target` | `apply exposed` | |
| Rout | `onKill` | `group` | `apply shaken` to one | 1 a round |
| Panic Spreader | `onBreak` | `nextInGroup` of the next group | `apply shaken` | 1 a fight |
| Field Medic | `onAllyDown` | `ally` | `apply stabilised` | 1 a fight per ally |
| Steady Voice (leader) | `roundStart` | `crew` | `apply steadied` to one | 1 a fight |

## Combinations the ten produce (none written as a pair)

| Pieces | What happens on the stage |
| --- | --- |
| Ricochet + Contagion | The bounces infect three; each fall jumps the infection on. A swarm burns down. (Built.) |
| Spotter's Eye + Plate Breaker | A plain shot cracks an armoured enemy's plate and marks it; the next hit makes it exposed; the one after goes straight through. Armour becomes a two-runner job. |
| Spotter's Eye + Executioner | A cracked enemy is marked; whoever kills it gets a free shot at the next one in its group. |
| Ricochet + Spotter's Eye | A bounce that only cracks still marks: one burst marks three armoured enemies at once. |
| Contagion + Rout | Every infected enemy that falls shakes another; ticks and fear drag a group under its flee line together. |
| Rout + Panic Spreader | One group breaks, and the fear jumps to the next group. A chain rout across the map. |
| Executioner + Contagion | A tick kill on a marked enemy is still a kill: the free shot fires from the tick. (Allowed: the tick is a new chain, not a loop.) |
| Field Medic + Steady Voice | A downed runner is held up for the round, and the leader steadies the next shaky roll. Support that reads in the log, not a heal-bot. |

The point of the table: Spotter's Eye was written for armour, and it turns out to make Ricochet a marking tool too. That is the kind of combination the owner wants to find in play.

## How a piece shows in the menu

Each menu entry (`PROPOSAL-runner-shaping.md`) is one piece: its name, its four fields in plain words ("When a shot only cracks a plate, mark the target"), its stat gate, and its log word and look. Statuses get one shared glossary line each, so the player learns the words once and then reads every piece in them.

## Open for the owner

1. **The first set of statuses:** all eight above, or start with `marked`, `exposed` and `shaken` beside the built `infected`?
2. **`burning` as a second damage over time:** worth having, or too close to `infected`? (The effect library's "plague fire" reaction needs two.)
3. **Reactions** (two statuses on one body make something new, `PROPOSAL-combat-builds.md` section 5): in the first set, or after the plain statuses have been played?
4. **Duo pieces** (offered only when two conditions both hold): keep for later?
5. **Do drones count as armoured?** (Already open in HANDOFF.md; it decides `armoured`.)

## A check for later

When pieces are built: a test that every piece in `src/data/` uses only vocabulary words and names no other piece, so the "no pairs" rule cannot quietly break.
