# Proposal: the swarm feel, and the crew's answers to it (special moves, area attacks, the swarm drone)

Status: **direction agreed by the owner (2026-11-15); nothing here is built.** Each part below is its own slice and PR, with the
owner's calls first where marked. Design row: `docs/design/2026-11.md`, 2026-11-15, "the swarm feel comes from the crew's
multi-target tools".

Read first: `CLAUDE.md`, `docs/BATTLES.md`, `drafts/HANDOFF-watchable-combat.md` (the invariants; slice 3e Reflex Overdrive and
slice 4 showcases, which this proposal reshapes), `docs/sims/slice3i-2026-11-15.md`, `docs/fight-recipe-template.md`.

## 1. Why

The owner wants fights that feel like a swarm: many weak enemies, a few brutes, and a star who cuts through the pack. Today every
runner makes one attack against one target a round, so the crew's damage grows slowly while enemy numbers can grow fast. Measured
on 2026-11-15 (`sim-gate-teams`, the roster each job really has at its gate): two waves on a hack job left the best team winning
15% on steady; two waves on a van job left someone behind 28% of the time and killed someone in 10.6% of committed fights (the
bars are 15% and 8%). Taking the grunts' plate off barely changed it: **the number of enemies up at once, and when they arrive,
is what breaks a fight**, not how tough each one is. So bigger swarms need the crew to have answers that scale with the number of
enemies. Until then, a job gets at most light waves (the two jobs added on 2026-11-15 have one each).

## 2. The pieces

### 2.1 Special moves, earned like traits (owner, 2026-11-15)

- A **special move** is a burst of attacks with sequential retargeting, one attack line per target in the rules' order (the
  owner's decision of 2026-11-12: a showcase and Reflex Overdrive are the same thing). The stage already draws three looks for it
  (`data/fightLooks.js`, `ui/fightstage.js`: ricochet, slash, ping; built in #172 against a forced flag).
- **A runner has a move, or doesn't.** Moves are earned like earned traits (`data/earnedTraits.js`, `core/earned.js`), and some
  recruits arrive with one. The owner's examples, each tied to an archetype: **Blade Dance** (a blade; the slash look),
  **Ricochet** (a sniper or rifle), **Reflex Overdrive** (Reflex wiring), **Quickburst** (a gunman with a sidearm). The aim is
  customisation: a runner's moves, traits, strengths and weapon should **synergise**.
- Each move is data: its name, the archetype or gear it needs, how it is earned, how many targets it reaches, its trigger
  condition, its look. The rules read it in `core/fight.js`; nothing in `src/data/` decides anything.

### 2.2 The trigger: by itself, or on your call (owner: "fires by itself but you can also call it manual"; Claude's proposal)

- **One use per fight** per runner.
- **By default it fires by itself** when its condition holds (for example: 3 or more enemies up, round 2 or later; the handoff's
  Flag F7). Hands-off and away fights keep working.
- **Any runner can be switched to "on my call"**: the move waits for the player to order it, with its odds shown before they
  commit. This is the lever the orders gate is missing (`sim-orders` after 3-i: the default plan is as good as any in 83% of
  cells): a good result that traces back to the player's own call.
- Shown equals used: the planning odds (`fightOddsFor`) and the round preview play the move exactly as the round does; previews
  never draw.

### 2.3 Area attacks: gear perks first, role abilities later (owner)

- **Gear perks** on Custom, Premium and Apex gear (`data/gearPerks.js`), capped like the others (`PERK_CAPS`). First ideas:
  - **Spread:** a hit also strikes one more enemy of the same group.
  - **Contagion** (the owner's bio weapon): a hit marks the target; a marked enemy loses a pip at the end of each round; when it
    goes down, the mark jumps to another enemy of its group. New to engine 2 (damage over time): it must show in the round
    preview and count in the odds.
- **Role abilities** later: for example, a tech's ping that jams or stuns a whole group.
- Per-group flee (3-i) makes these feel right: drop most of a group and the rest of it breaks, so a swarm collapses.

### 2.4 The swarm drone (owner: fragile, poor aim)

- A new enemy kind: 1 pip, no plate, a poorer aim than the others, breaks quickly as a group, and a jam can take one out (as the
  drone). It comes in waves of several. Drawn as a knot of small rotors (`data/fightLooks.js ENEMY_LOOKS.swarmDrone`, planned;
  the drawing is built).

### 2.5 Swarm jobs

- Once the crew has the tools: jobs built around swarms (drafted with `docs/new-job-prompt.md`'s Fight section, wired by
  `/add-job`), and second waves for the two jobs that lost them. The safety bars do not change.

## 3. Order of work (each its own PR; sims before and after, `npm test` green, CHANGELOG, DESIGN row)

1. **Special moves, the rules (slice 3-ii, reshaped).** The move as data; who has one (earned, or arrived with); one use per
   fight; the trigger (auto, or on my call); the burst in `playRound` with sequential retargeting that never takes another
   attacker's reserved enemy; the odds and preview; the record (`burst` lines the stage already draws). Save change. The round
   screen gains the "on my call" switch and the order.
2. **Area perks** (Spread, then Contagion).
3. **The swarm drone.**
4. **Swarm jobs**, and the second waves back.
5. **Role abilities.**

## 4. Invariants (unchanged)

Shown equals used; previews never draw or change the fight; pace never changes outcomes; units are the rules' units; cosmetic
randomness is seeded; the death rule (no death on cautious or steady without a call-in); wording through `lineText` keys, the
owner's to write.

## 5. Open for the owner (before each slice; do not guess)

- **Moves:** how each is earned (a count of fights with that archetype? a milestone? a trainer, like a specialisation offer from
  Joss?); how often a recruit arrives with one, and at which tier; whether a runner can hold several and picks one to carry.
- **The list of moves** and their names (Blade Dance, Ricochet, Reflex Overdrive, Quickburst, more?), each move's target count
  and condition.
- **Contagion's numbers** (pips a round, how far it spreads), and which gear can roll Spread and Contagion.
- **Role abilities:** which roles, and what each does to a group.
- **Wording** for every new line (draft text until the owner writes it).
