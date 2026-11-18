// Builds, slice 3-ii-a (2026-11-16; drafts/HANDOFF-builds-3iia.md, drafts/PROPOSAL-swarm-and-special-moves.md 2.1-2.3 and 2.6.2,
// drafts/PROPOSAL-combat-builds.md). Content only: the rules that read these words are in core/fight.js, and the stage only draws
// them. Every number is a first value, named and in one place, for the owner to tune by feel (2.6.5); nothing in core hard-codes one.
//
// A runner's build is { move, payload }, each an id below or null (`op.build`; no real operative has one yet: this slice gives it
// in data, the next earns it by offer). The two are independent axes: a move is the DELIVERY (how it gets there), a payload is
// what a hit CARRIES. They never name each other; the combination comes from the rules.
//
// Names are drafts, the owner's to write (drafts/writing-tasks.md): "Ricochet", "Cytotoxic Vector" and the short log word "Vector".

// Moves: a burst of attacks with sequential retargeting (2.1), fired by itself when its condition holds (2.2).
//   reach: the most enemies one burst hits, one attack each, in the rules' order. It is agnostic of the rest of the crew (owner, 2026-11-17): a bounce may land on an enemy a teammate is already shooting.
//   uses: how many times a fight (one: a runner's move is a showcase, not a rate of fire).
//   when: the condition that fires it by itself, read at the start of the runner's action: `enemies` or more enemies up. Any round.
//   look: how the stage draws it (data/fightLooks.js SPECIAL_MOVES).
//   Earning (slice 3-ii-b): slot 'move'; needs: base stats (before gear and traits) a runner needs before Joss can offer it; desc and offer
//   are draft wording, the owner's to write (drafts/writing-tasks.md).
export const MOVES = {
  ricochet: {
    id: 'ricochet', name: 'Ricochet', reach: 3, uses: 1, when: { enemies: 2 }, look: 'ricochet',
    slot: 'move', needs: { combat: 10 },
    desc: 'Once a fight, as soon as two or more enemies are up, one round bounces through up to three of them.',
    offer: '{op} has the eye for a bounce shot now: one round, three bodies. I know a range that teaches it.',
  },
};

// Payloads: what a landed hit carries.
//   dot: damage over time. A hit that gets past the plate (damage 1 or more) and leaves the target up infects it; a hit that only cracks a
//        plate does not (owner, 2026-11-17).
//        `tick` HP lost at the end of each round (before the groups' flee checks, so a tick counts like any other loss), for
//        `rounds` rounds (null: until the target dies; owner, 2026-11-16). It does not spread by itself; a re-hit does not stack
//        and does not renew (the first infection stands).
//   spread: when an infected enemy goes down (a hit, a tick or the overwatch), or when the killing hit itself carries it (a one-pip enemy never lives to be infected), the infection jumps to one other enemy of its group that is up,
//           not already infected and not immune; the jump is not a hit, so a plate does not stop it. The new infection starts with `rounds` in full
//           and ticks from the next round (Contagion, slice 3-iii, 2026-11-17; draft numbers).
//   immune: enemy tags (data/fights.js ENEMIES `foeTags`) that shrug it off.
//   family: payloads of one family are variations of the same thing and share the slot, so a runner picks one (the vectors: Cytotoxic holds on one target until it falls; Contagion burns out sooner but jumps).
//   word: the short log word.
//   Earning (slice 3-ii-b): slot 'payload', needs and the draft wording, as for a move.
export const PAYLOADS = {
  cytotoxic: {
    id: 'cytotoxic', name: 'Cytotoxic Vector', family: 'vector', word: 'Vector', dot: { tick: 10, rounds: null }, immune: ['synthetic'],
    slot: 'payload', needs: {},
    desc: 'A hit that gets past the armour infects: the target loses a pip every round until it falls. Machines shrug it off.',
    offer: 'There is a chemist on the Basin side who sells something nasty for the rounds. {op} could carry it: slow, and it does not stop.',
  },
  // Contagion Vector (draft, 2026-11-17): the owner's bio weapon (PROPOSAL-swarm-and-special-moves.md 2.3), a variation of the Cytotoxic Vector (family 'vector'): the same slot, so a
  // runner picks one. It trades staying power for reach: the infection burns out after `rounds` rounds, but it jumps when its host falls.
  contagion: {
    id: 'contagion', name: 'Contagion Vector', family: 'vector', word: 'Contagion', dot: { tick: 10, rounds: 2 }, spread: true, immune: ['synthetic'],
    slot: 'payload', needs: { medical: 8 },
    desc: 'A hit that gets past the armour infects: the target loses a pip a round for two rounds. When an infected enemy falls, the infection jumps to another in its group. Machines shrug it off.',
    offer: 'The chemist has a second vector, a stranger one that passes from body to body. {op} has the steady hands to carry it. It burns out fast, but it will not stay in one place. It takes the same place as the other vector, so it is one or the other.',
  },
};

// The offer (slice 3-ii-b, 2026-11-17; placeholders, the owner tunes them by feel, 2.6.5). A runner holds one move and one payload (a slot each).
// Joss offers a piece for an empty slot once they have done `firstAtJobs` jobs with the crew, then again `everyJobs` jobs after the last one
// they took, and shows up to `size` pieces they qualify for (all there are, until the library grows); "Not yet" waits `snoozeDays`.
export const BUILD_OFFER = { firstAtJobs: 4, everyJobs: 4, size: 3, snoozeDays: 14 };

// The build the sims and the tests give (drafts/HANDOFF-builds-3iia.md: "given, not earned"). core/builds.js `withBuild` puts it on
// the best combat runner of a crew. Not read by the game itself.
export const GIVEN_BUILD = { move: 'ricochet', payload: 'cytotoxic' };
