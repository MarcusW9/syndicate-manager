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
//   reach: the most enemies one burst hits, one attack each, in the rules' order, never an enemy another attacker has reserved.
//   uses: how many times a fight (one: a runner's move is a showcase, not a rate of fire).
//   when: the condition that fires it by itself, read at the start of the runner's action: `enemies` or more enemies up (and as many
//         free to take: a burst of one is just an attack, so it waits). Any round.
//   look: how the stage draws it (data/fightLooks.js SPECIAL_MOVES).
export const MOVES = {
  ricochet: { id: 'ricochet', name: 'Ricochet', reach: 3, uses: 1, when: { enemies: 2 }, look: 'ricochet' },
};

// Payloads: what a landed hit carries.
//   dot: damage over time. A landed hit infects the target (a hit that only cracks a plate still lands: the vector gets under it).
//        `tick` pips lost at the end of each round (before the groups' flee checks, so a tick counts like any other loss), for
//        `rounds` rounds (null: until the target dies; owner, 2026-11-16). It does not spread by itself; a re-hit does not stack
//        and does not renew (the first infection stands).
//   immune: enemy tags (data/fights.js ENEMIES `foeTags`) that shrug it off.
//   word: the short log word.
export const PAYLOADS = {
  cytotoxic: { id: 'cytotoxic', name: 'Cytotoxic Vector', word: 'Vector', dot: { tick: 1, rounds: null }, immune: ['synthetic'] },
};

// The build the sims and the tests give (drafts/HANDOFF-builds-3iia.md: "given, not earned"). core/builds.js `withBuild` puts it on
// the best combat runner of a crew. Not read by the game itself.
export const GIVEN_BUILD = { move: 'ricochet', payload: 'cytotoxic' };
