# Proposal: the swarm feel, and the crew's answers to it (special moves, area attacks, the swarm drone)

Status: **direction agreed by the owner (2026-11-15); nothing here is built.** Section 2.6 (the build system and how fights scale with it) added the same day from the owner's vision; its caps are left open on purpose (2.6.5). Each part below is its own slice and PR, with the
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

### 2.6 The build system, and how fights scale with it (owner's vision, 2026-11-15)

The owner's ideation for this section (archetypes, axes, the effect library, reactions, combo fantasies, guardrails, open
questions) is in `drafts/PROPOSAL-combat-builds.md` (2026-11-16): read it with this section.

The aim: a runner's build is something the player puts together and enjoys watching work. Think of a roguelite like Hades,
where boons combine: a runner's stats lean them one way, what they earn and what they carry push that further, and the right
combination produces an effect that is fun to watch, a contagion spreading through a swarm and wiping it out.

**2.6.1 Four layers.**

| Layer | What it gives | Where it lives |
| --- | --- | --- |
| Base stats and specialisation | The lean: which direction suits a runner (an eye for range or overwatch, the mix that suits a blade) | `core/development.js STATS`, `core/specialisations.js` |
| Traits and perks (earned) | Passive bonuses that change how effects behave | `data/earnedTraits.js`, `core/earned.js` |
| Moves (earned, or arrived with) | The active burst, the showcase | 2.1 and 2.2 |
| Gear (found, rolled) | What a hit carries | `data/gearPerks.js` (Spread, Contagion, 2.3) |

The owner's example combines all four: a trait that gives bonus damage over time, the luck of a contagion weapon that spreads
it, and a move that marks several enemies at once.

**2.6.2 A shared effect vocabulary, so combinations emerge.** The pieces never name each other. Each hooks into a small common
set of words, and the combinations come from the rules, not from hand-written pairs:
- effects: mark (damage over time), spread, stun or jam, break (a group's nerve);
- triggers: on hit, on kill, on a mark's tick, on a group breaking.

A gear perk says "on kill, the mark jumps"; a trait says "a marked enemy loses one more pip a tick"; a move says "hit up to 4,
each hit marks". Each is data in `src/data/`; `core/fight.js` reads them. This vocabulary comes before the first move, so the
moves are written in it.

**2.6.3 Earned by offer, not handed out.** At a milestone a runner is offered two or three pieces, weighted by their stats,
weapon and what they already hold, and the player picks one. The roguelite luck sits in what is offered and what gear drops.
Runners persist, so a build grows over a career, not one run. Recruits can arrive with a piece, which seeds a direction.
Limited slots (a move and a few traits, say) force a choice, so two blade runners can end up different. A few rare pieces are
offered only when two conditions both hold (a contagion weapon and a damage-over-time trait, say): the jackpot moments.

**2.6.4 Scaling: fights grow with the tools.** Today's fights are tuned for crews with no builds: a few enemies, one attack
each. Built as written on top of that, these pieces would be overpowered (owner). So:
- **Power that grows with the number of enemies, not raw damage.** Most pieces pay off only against numbers: a move needs 3 or
  more enemies up, Spread a second enemy in the group, Contagion someone to jump to. Against today's 3 or 4 enemies they add a
  little; against a swarm they decide it. Swarms are where builds shine, and today's jobs stay as they are.
- **Enemy pressure rises as tools arrive.** Each slice gives the crew a tool, then gives the enemies the problem it answers:
  the swarm drone, swarm jobs, the waves that were cut (section 3).
- **Sims that test builds.** `scripts/sim-gate-teams.mjs` fights crews with no builds. It gains a second team, a plausible
  built crew at each gate. Each slice checks both: crews without builds still pass today's bars, and built crews beat swarms
  by a margin that feels good without trivialising the old jobs. The safety bars and the death rule do not change.

**2.6.5 Caps: left open on purpose (owner).** The owner will not fix the caps up front (slot counts, how far marks stack, how
far a spread reaches, how often a move fires) and will judge them by feel as the slices land. Each slice ships with
conservative placeholder numbers in `src/data/` (one place per number, named, easy to change), the sims report what they do,
and the owner tunes from play. Nothing hard-codes a cap in `core/`.

### 2.7 What matters most: watching, power, and the choices before the run (owner, 2026-11-16)

The owner's priorities for everything in section 2: **fights are enjoyable to watch, and the strong runners feel
powerful.** Most fights are watched or hands-off; the player enjoys their crew fighting. **The choices that matter are the
ones made before the run**: who goes, their builds and gear, and the counters picked for what the job will throw at them.

What follows from it:
- **Before the run.** The planning read shows what a build answers: the job's enemy mix and tags (swarm, machines,
  chromed, a boss) and its site's terrain tags, so picking the crew and their builds is the decision. The coverage read
  (`fightOddsFor`) already prices a squad; it should also say why ("no answer to a drone swarm").
- **Moves fire by themselves first.** 2.2's "on my call" stays possible but is secondary; the automatic trigger and the
  default orders must play builds well, since that is how most fights are seen.
- **Positioning stays abstract in the rules** (groups, cover, tags on the fight; no coordinates). The stage shows it:
  pulls, knockbacks, marks hopping, a chain of pops are drawn from what the rules did, as the special looks already are
  (`data/fightLooks.js`, `ui/fightstage.js`). Zones (close, mid, far, with terrain) are a later slice if terrain needs it;
  real coordinates in engine 2 are not planned (Claude's estimate: a rework of the rules, odds and preview, for little
  over zones in a game watched mostly hands-off).
- **Power shows.** A built star should visibly carry a fight against numbers: bursts, chains and spreads each get one
  short, distinct log line and a drawn effect. The safety bars and the death rule do not move.

## 3. Order of work (each its own PR; sims before and after, `npm test` green, CHANGELOG, DESIGN row)

1. **The effect vocabulary and special moves, the rules (slice 3-ii, reshaped).** The effect words and triggers (2.6.2) first, then the move as data in them; who has one (earned, or arrived with); one use per
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

- **Moves and the build (reshaped by 2.6):** the effect words and triggers to start with; what milestone brings an offer and
  how many pieces it shows; how offers are weighted (stats, weapon, what the runner holds); how often a recruit arrives with a
  piece, and at which tier; whether a runner holds one move or several; the first rare two-condition pieces, if any.
- **The tuning target for swarm jobs:** a crew with no build (builds are a bonus) or the expected build at each gate (builds
  matter). Suggested: the expected build for swarm jobs, no build for today's jobs.
- **Caps:** not now (owner, 2.6.5). Placeholders ship with each slice; the owner tunes by feel.
- **The list of moves** and their names (Blade Dance, Ricochet, Reflex Overdrive, Quickburst, more?), each move's target count
  and condition.
- **Contagion's numbers** (pips a round, how far it spreads), and which gear can roll Spread and Contagion.
- **Role abilities:** which roles, and what each does to a group.
- **Wording** for every new line (draft text until the owner writes it).
