# Brief: builds slice 3-ii-a, the first combo on screen (2026-11-16)

The second step in the agreed order (save fix, then builds, then the playtest). Start a new **Opus** session; this
changes how fights play and needs the sims.

Read first: `CLAUDE.md`, `drafts/PROPOSAL-swarm-and-special-moves.md` (2.1-2.3, 2.6, 2.7, section 4's invariants),
`drafts/PROPOSAL-combat-builds.md` (sections 1-2 and 8), `docs/BATTLES.md` (engine 2), `docs/fight-recipe-template.md`.

## What it proves

That a built runner is satisfying to watch and visibly carries a fight against numbers, before any of the progression
(earning, offers, slots) is built around it. The owner's calls of 2026-11-16 (`docs/design/2026-11.md`):

- **One move: Ricochet.** A burst of attacks with sequential retargeting (2.1): each bounce is a hit on the next enemy,
  never an enemy another attacker has reserved. Fires by itself when its condition holds (2.2; "on my call" is not in
  this slice). One use a fight. The stage already draws its look (`data/fightLooks.js`, ricochet).
- **One payload: Cytotoxic Vector** (draft name; the owner writes names; "Vector" as the short log word). A bioweapon:
  a hit infects the target, which loses pips over the following rounds (damage over time). **It does not spread by
  itself.** Spreading comes from other pieces: Ricochet distributes it (every bounce infects a new target); a later
  "Contagious" piece makes it jump when an infected enemy dies (the proposal's Contagion perk, 2.3; the next slice).
- **One enemy tag: synthetic.** Cytotoxic means it kills cells: drones shrug it off. The first counter, for free: a
  vector build is the wrong pick against a drone swarm (the firmware virus, the machine version, is a later piece).
- **Given, not earned.** The move and the payload are put on a runner in data (a test roster and the sims' built team);
  earning by offer and slots are the next slice. Nothing temporary should outlive the slice in the save.

## What to build

1. **The effect words as data** (`src/data/`), read by `core/fight.js`: a multi-target burst (Ricochet), damage over time
   (the vector: pips a tick, rounds it lasts), and the synthetic tag on enemy kinds (`drone`). Numbers are named
   placeholders, one place each; the owner tunes them by feel (2.6.5).
2. **The rules** in `playRound`: the burst, infection on hit, the tick at the round's end (before flee checks), immunity.
   Per-group flee (3-i) reads ticks like any other loss.
3. **Shown equals used.** The round preview shows the burst's targets and each infection's coming ticks; `fightOddsFor`
   plays them; previews never draw.
4. **Watching.** One short, distinct log line each for a bounce, an infection, a tick and an immunity (`data/fightText.js`
   keys, draft text for the owner), and a drawn effect for infected enemies on the stage.
5. **The save.** Infection on a fight in progress; bump `SAVE_VERSION`, add a migration.
6. **Sims.** `scripts/sim-gate-teams.mjs` gains a built team (one runner with Ricochet and the vector). Report: crews with
   no build still pass today's bars on every fight job (no regression); the built team against organic enemies (Docks
   jobs, corporate security) against the same team with no build; the built team against a drone-heavy fight (the
   counter). The safety bars and the death rule do not move.

## Open for the owner (ask first, multiple choice)

- The tick: **1 pip every round (owner, 2026-11-16)**, chosen because it reads best when watched. It lasts **until the target
  dies** (owner, 2026-11-16). Still open: whether a strong hit infects harder. Note: most enemies
  have 1 pip (hired, drone, police, secforce; corp and enforcer have 2), so on them a tick is a delayed kill. If damage
  over time needs room to show, the owner's options are doubling pip counts or adding health beside pips (owner: leave
  it and see how it works); that is its own balance change with its own
  sims, decided after this slice's sims, not inside it.
- Ricochet's targets (3, or one per enemy group up to 4?) and its condition (3 or more enemies up, round 2 or later?).
- Who carries it in the test roster and the sims (the best combat runner, or a rifle archetype?).
- The wording of every new line.

## Not in this slice

Earning by offer, slots, the planning read's tags and "why" (2.7), Contagious, other moves and payloads, zones, the swarm
drone, swarm jobs.
