// Engine 2 dilemmas (drafts/SPEC-battle-orders.md section 16): authored situations with explicit
// conditions that can pause an unwatched fight as a call-in. The engine evaluates only these, never
// infers "serious danger". Data only: the conditions are read by core/fight.js dilemmaDue and the
// patches applied by applyPatch. Wording is placeholder keys in data/fightText.js (the owner writes it).
//
// when (the grammar, claude's plumbing; spec section 30):
//   stage: n                       the fight is in this stage
//   of: 'protected'                who the pip and shot conditions are about (the specialist)
//   pipsAtMost: n | pipsAtMostShare: 0..1    their pips are at or under n, or that share of their max
//   shotsOnAtLeast: n              this many aim threats are drawn at them
//   radioShown: true               a backup or alarm threat is in this round's draw
//   vanLastRound: true             the van leaves at the end of this round
//   outsideAtLeast: n              this many runners are outside (standing or down)
//   any: [ ...conditions ]         at least one of these holds; all other keys must hold too
// ordersPatch selectors: all, others, protected, exposed, bestAttacker, bestProtector, backupSource
//   (a patch is { selector: { duty, target } }; targets may be 'protected', 'backupSource', 'exposed').
// vanWait: a change to the van's wait ({ hold: true } holds it holdRounds more rounds for +holdHeat).

export const DILEMMAS = {
  techUnderFire: {
    fight: ['holdHack'],
    // Owner, 2026-11-11: two or more shots on the tech, or the tech at half pips or below with a radio call shown.
    when: { of: 'protected', any: [{ shotsOnAtLeast: 2 }, { pipsAtMostShare: 0.5, radioShown: true }] },
    options: [
      { id: 'cover', ordersPatch: { all: { duty: 'protect', target: 'protected' } } },
      { id: 'radio', ordersPatch: { bestAttacker: { duty: 'attack', target: 'backupSource' } } },
      { id: 'jam', ordersPatch: { protected: { duty: 'support', target: 'backupSource' } } }, // no hack progress that round
      { id: 'carryOn', ordersPatch: null },
    ],
  },
  vanCantWait: {
    fight: ['holdExtract'],
    when: { stage: 1, vanLastRound: true, outsideAtLeast: 1 },
    options: [
      { id: 'goNow', ordersPatch: null, vanWait: { hold: false } }, // whoever is outside is left behind
      { id: 'hold', ordersPatch: null, vanWait: { hold: true }, cost: { heat: 1 } },
      { id: 'carryOn', ordersPatch: null }, // = go on time
    ],
  },
};
