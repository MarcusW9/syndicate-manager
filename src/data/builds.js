// Builds, slice 3-ii-a (2026-11-16; drafts/HANDOFF-builds-3iia.md, drafts/PROPOSAL-swarm-and-special-moves.md 2.1-2.3 and 2.6.2,
// drafts/PROPOSAL-combat-builds.md). Content only: the rules that read these words are in core/fight.js, and the stage only draws
// them. Every number is a first value, named and in one place, for the owner to tune by feel (2.6.5); nothing in core hard-codes one.
//
// A runner's build is { move, payload }, each an id below or null (`op.build`; no real operative has one yet: this slice gives it
// in data, the next earns it by offer). The two are independent axes: a move is the DELIVERY (how it gets there), a payload is
// what a hit CARRIES. They never name each other; the combination comes from the rules.
//
// Names are drafts, the owner's to write (drafts/writing-tasks.md): "Ricochet", "Cytotoxic Vector" and the short log word "Vector".
//
// The build vocabulary (2026-11-19, drafts/PROPOSAL-build-vocabulary.md, the generic trigger step): what a piece does is written in
// `pieces`, each { when, if?, who, what }, using only the words below, and never names another piece. core/fight.js runs every piece
// listening for a trigger when it fires (`piecesOn`), in a fixed order (the move's, then the payload's). Words so far:
//   when  'onAttack' (the runner's attack is chosen: a move's chance to fire), 'onHit' (a runner's attack lands past the plate and
//         leaves the target up), 'onKill' (an enemy goes down: to the runner's attack or bounce, or, for a status already on it, to anything)
//   if    { enemiesUp: n } (at least n enemies up)
//   who   'target' (the enemy the trigger was about), 'nextInGroup' (the first other enemy of its group that is up, without the status
//         and not immune to it), 'nearest' (up to the move's `reach` enemies, in the rules' order)
//   what  'burst' (one attack on each of the who), { apply: status } (put a status on), { spread: status } (copy it to the who)
// Statuses: 'infected' (its numbers are the payload's `dot`; it ticks at the round's end, core/fight.js ticksDue); from part B (2026-11-19)
// 'burning', 'marked', 'exposed' and 'shaken' (core/fight.js VOCAB says what each does), with 'onCrack' and the `if` word 'targetHas'. A status a body
// carries brings its payload's onKill pieces with it, so it can jump whoever drops its host. The engine's guardrails: a status never
// stacks or renews; an immune body shrugs it off (said once a body, on any landed hit that carries it) and never passes it on; a fall
// spreads a status at most once (the killer's own piece first).

// Moves: a burst of attacks with sequential retargeting (2.1), fired by itself when its condition holds (2.2).
//   reach: the most enemies one burst hits, one attack each, in the rules' order. It is agnostic of the rest of the crew (owner, 2026-11-17): a bounce may land on an enemy a teammate is already shooting.
//   uses: how many times a fight (one: a runner's move is a showcase, not a rate of fire).
//   pieces: when it fires by itself (onAttack, read at the start of the runner's action, any round, if its `if` holds) and what it does.
//   look: how the stage draws it (data/fightLooks.js SPECIAL_MOVES).
//   Earning (slice 3-ii-b): slot 'move'; needs: base stats (before gear and traits) a runner needs before Joss can offer it; desc and offer
//   are draft wording, the owner's to write (drafts/writing-tasks.md).
export const MOVES = {
  ricochet: {
    id: 'ricochet', name: 'Ricochet', reach: 3, uses: 1, look: 'ricochet',
    pieces: [{ when: 'onAttack', if: { enemiesUp: 2 }, who: 'nearest', what: 'burst' }],
    slot: 'move', needs: { combat: 10 },
    desc: 'Once per fight, automatically fires when at least two enemies are standing: one round ricochets through up to three targets.',
    offer: '{op} has the eye for Ricochet: one round through several targets. We could make something of that.',
  },
};

// Payloads: what a landed hit carries.
//   dot: damage over time. A hit that gets past the plate (damage 1 or more) and leaves the target up infects it; a hit that only cracks a
//        plate does not (owner, 2026-11-17), unless the payload also carries an onCrack piece (Cytotoxic does, 2026-11-20).
//        `tick` HP lost at the end of each round (before the groups' flee checks, so a tick counts like any other loss), for
//        `rounds` rounds (null: until the target dies; owner, 2026-11-16). It does not spread by itself; a re-hit does not stack
//        and does not renew (the first infection stands).
//   the onKill spread piece (Contagion): when an infected enemy goes down (a hit, a tick or the overwatch), or when the killing hit itself carries it (a one-pip enemy never lives to be infected), the infection jumps to one other enemy of its group that is up,
//           not already infected and not immune; the jump is not a hit, so a plate does not stop it. The new infection starts with `rounds` in full
//           and ticks from the next round (Contagion, slice 3-iii, 2026-11-17; draft numbers).
//   immune: enemy tags (data/fights.js ENEMIES `foeTags`) that shrug it off.
//   family: payloads of one family are variations of the same thing and share the slot, so a runner picks one (the vectors: Cytotoxic holds on one target until it falls; Contagion burns out sooner but jumps).
//   word: the short log word.
//   Earning (slice 3-ii-b): slot 'payload', needs and the draft wording, as for a move.
export const PAYLOADS = {
  cytotoxic: {
    id: 'cytotoxic', name: 'Cytotoxic Vector', family: 'vector', word: 'Vector', dot: { tick: 10, rounds: null }, immune: ['synthetic'],
    // Through armour (owner, 2026-11-20; docs/sims/cytotoxic-2026-11-20-identity.md): a hit that only cracks a plate infects too (the onCrack
    // piece), so Cytotoxic is the answer to plates and Contagion to crowds. Supersedes the 2026-11-17 rule for this payload only.
    pieces: [{ when: 'onHit', who: 'target', what: { apply: 'infected' } }, { when: 'onCrack', who: 'target', what: { apply: 'infected' } }],
    slot: 'payload', needs: {},
    desc: 'A hit infects a surviving target, even one that only cracks their armour, dealing 10 HP at each round’s end until they fall. Does not stack or affect machines.',
    offer: '{op} could carry Cytotoxic Vector. Get it past the armour and it keeps eating away until the target drops.',
  },
  // Contagion Vector (draft, 2026-11-17): the owner's bio weapon (PROPOSAL-swarm-and-special-moves.md 2.3), a variation of the Cytotoxic Vector (family 'vector'): the same slot, so a
  // runner picks one. It trades staying power for reach: the infection burns out after `rounds` rounds, but it jumps when its host falls.
  contagion: {
    id: 'contagion', name: 'Contagion Vector', family: 'vector', word: 'Contagion', dot: { tick: 10, rounds: 2 }, immune: ['synthetic'],
    pieces: [{ when: 'onHit', who: 'target', what: { apply: 'infected' } }, { when: 'onKill', who: 'nextInGroup', what: { spread: 'infected' } }],
    slot: 'payload', needs: { medical: 8 },
    desc: 'A damaging hit infects a surviving target: 10 HP at each round’s end for two rounds. When the host falls, or a carrying hit drops a target outright, it jumps to one uninfected enemy in the same group. The jump bypasses armour and starts dealing damage next round. Does not stack or affect machines.',
    offer: '{op} could carry Contagion Vector. It burns out sooner, but jumps when the target drops. We choose this or Cytotoxic, not both.',
  },
};

// Part B's first new statuses (2026-11-19; the owner's answers in drafts/HANDOFF-build-vocab-next.md: marked, exposed, shaken and a plain
// burning). Four payloads, one per status, written only in the vocabulary's words. Offered by Joss like the others since the owner's call
// (2026-11-19, "Joss offers them now"); their names and wording are still Claude's drafts (drafts/writing-tasks.md). A piece marked
// `draft: true` would be neither offered nor shown as reachable (core/builds.js eligiblePieces, core/abilities.js). Every number is a first value. All four take the
// payload slot, so the combinations between them (a spotter beside a breacher) are a two-runner job, as the proposal wanted.
//   burning   Incendiary: a hit, or a shot that only cracks a plate, sets the body burning: `dot` like a vector, but it never jumps,
//             and machines burn (no immune tags). The counter to plates and drones the Vectors lack.
//   marked    Spotter's Eye: whatever it hits or cracks is marked. Does nothing by itself; Breacher and Rout read it.
//   exposed   Breacher: a shot that only cracks a plate shows the crew how the next body of that group opens: it is exposed (its next hit
//             taken ignores its plate and deals `expose.extra` more HP; owner, 2026-11-19). A hit on a marked body does the same.
//   shaken    Rout: a kill shakes the next body of the group (it counts as gone when its group decides whether to run); a marked kill
//             shakes one more. Only bodies that break run, so it does nothing to corp, enforcers or drones.
Object.assign(PAYLOADS, {
  incendiary: {
    id: 'incendiary', name: 'Incendiary Rounds', family: 'fire', word: 'Fire', dot: { tick: 10, rounds: 2 }, immune: [],
    pieces: [{ when: 'onHit', who: 'target', what: { apply: 'burning' } }, { when: 'onCrack', who: 'target', what: { apply: 'burning' } }],
    slot: 'payload', needs: { combat: 10 },
    desc: 'Hits and armour cracks cause burning: 10 HP at round-end for two rounds, including machines. Burning never spreads, stacks or renews.',
    offer: '{op} could leave a target burning, even when the shot only cracks its armour.',
  },
  spotter: {
    id: 'spotter', name: 'Spotter’s Eye', family: 'mark', word: 'Mark', immune: [],
    pieces: [{ when: 'onHit', who: 'target', what: { apply: 'marked' } }, { when: 'onCrack', who: 'target', what: { apply: 'marked' } }],
    slot: 'payload', needs: { cool: 10 },
    desc: 'Hits and armour cracks mark the target for the crew. Marks do nothing alone, but Breacher and Rout use them.',
    offer: '{op} could mark whoever they hit, giving the crew something to work with.',
  },
  breacher: {
    id: 'breacher', name: 'Breacher', family: 'breach', word: 'Breach', immune: [], expose: { extra: 10 },
    pieces: [{ when: 'onCrack', who: 'nextInGroup', what: { apply: 'exposed' } }, { when: 'onHit', if: { targetHas: 'marked' }, who: 'nextInGroup', what: { apply: 'exposed' } }],
    slot: 'payload', needs: { tech: 10 },
    desc: 'Armour cracks or hits on marked enemies expose the next armoured enemy in that group. The next hit it takes ignores its armour plate, deals 10 HP extra and consumes Exposed.',
    offer: '{op} could read one enemy’s armour and show us how to get through another’s.',
  },
  rout: {
    id: 'rout', name: 'Rout', family: 'fear', word: 'Fear', immune: [],
    pieces: [{ when: 'onKill', who: 'nextInGroup', what: { apply: 'shaken' } }, { when: 'onKill', if: { targetHas: 'marked' }, who: 'nextInGroup', what: { apply: 'shaken' } }],
    slot: 'payload', needs: { cool: 10 },
    desc: 'Each kill shakes the next eligible enemy in that group; a marked kill shakes one more. Shaken enemies count as gone for retreat decisions; corp, enforcers and drones are unaffected.',
    offer: '{op} could make a fall shake the others, if they’re the kind who run.',
  },
});

// Level-ups (save v83, 2026-11-20; drafts/PROPOSAL-runner-shaping.md step 4). They replaced Joss's offers (slice 3-ii-b, 2026-11-17,
// `BUILD_OFFER`), keeping its rhythm so the pace holds: a runner levels up when a skill is ready for them (its stat gates met, its
// place open, and for a specialisation its jobs on overwatch done) and they have `firstAtJobs` jobs with the crew, then `everyJobs`
// more after each pick. The player then picks any ready skill on their page (core/levelup.js).
export const LEVEL_UP = { firstAtJobs: 4, everyJobs: 4 };

// The build the sims and the tests give (drafts/HANDOFF-builds-3iia.md: "given, not earned"). core/builds.js `withBuild` puts it on
// the best combat runner of a crew. Not read by the game itself.
export const GIVEN_BUILD = { move: 'ricochet', payload: 'cytotoxic' };
