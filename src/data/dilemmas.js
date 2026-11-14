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
//   atPullOut: true                someone standing is at the pull-out point of the crew's risk level (cautious, steady) and not kept in; never while the van is there
//   any: [ ...conditions ]         at least one of these holds; all other keys must hold too
// ordersPatch selectors: all, others, protected, exposed, bestAttacker, bestProtector, backupSource
//   (a patch is { selector: { duty, target } }; targets may be 'protected', 'backupSource', 'exposed').
//   protectedCanJam: true          the specialist can jam (canJam); only used in an option's `requires`
// An option's `requires` uses the same conditions; an option whose requirement fails is not offered.
// An ordersPatch lasts one resolved round: core/fight.js applyPatch records the orders it replaces and playRound restores them.
// keepIn: true on an option keeps the call's runners in the fight until they lose another pip (core/fight.js keepIn).
// vanWait: a change to the van's wait ({ hold: true } holds it holdRounds more rounds for +holdHeat).

export const DILEMMAS = {
  techUnderFire: {
    fight: ['holdHack'],
    // Owner, 2026-11-11 (narrowed after the slice 3 sim, where "two or more shots on the tech" came up in 82% of hacks):
    // the tech at half pips or below with a radio call shown. A radio call is always shown, so Hit the caller always has a caller.
    when: { of: 'protected', pipsAtMostShare: 0.5, radioShown: true },
    options: [
      { id: 'cover', ordersPatch: { all: { duty: 'protect', target: 'protected' } } },
      { id: 'radio', ordersPatch: { bestAttacker: { duty: 'attack', target: 'backupSource' } } },
      // The tech stops working to jam: no hack progress that round. Offered only when a radio call is shown and the tech can jam (canJam).
      { id: 'jam', requires: { radioShown: true, protectedCanJam: true }, ordersPatch: { protected: { duty: 'support', target: 'backupSource' } } },
      { id: 'carryOn', ordersPatch: null },
    ],
  },
  vanCantWait: {
    fight: ['holdExtract'],
    when: { stage: 1, vanLastRound: true, outsideAtLeast: 1 },
    options: [
      { id: 'goNow', ordersPatch: null, vanWait: { hold: false } }, // the round still plays; whoever is not aboard at its end is left behind
      { id: 'hold', ordersPatch: null, vanWait: { hold: true }, cost: { heat: 1 } },
    ],
  },
  // The crew's pull-out point (owner, 2026-11-12: "make it a notified choice"): a watched player is told when a runner reaches the point
  // where their risk level pulls them out, and chooses. Hands-off crews pull out, as the risk level says. Asked again if they lose another pip.
  pullOutPoint: {
    fight: ['holdHack', 'holdExtract', 'holdYard'],
    when: { atPullOut: true },
    options: [
      { id: 'pullOut', ordersPatch: null },
      { id: 'stayIn', ordersPatch: null, keepIn: true },
    ],
  },
};
