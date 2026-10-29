// Battles (PLAN-CORE-LOOP.md, slice 6; DESIGN.md 2026-10-29). Numbers only; the rules live in
// core/battle.js. A battle starts when a danger incident goes unsaved (the run escalates), and
// plays out in rounds on the watch feed. Every number here is a draft, tuned with
// `node scripts/sim-battles.mjs`.
//
// Roll rule as everywhere: d20 + stat >= 10 + difficulty. The fight's difficulty is the incident's
// (the job's typical roll, the incident's step and the alert), so fights scale with the work.

export const BATTLE = {
  rounds: 3, // after this many with guards still up, the crew calls in (push past or pull back)

  // Runners' health: base + cool / perCool (rounded down). Someone already lightly hurt starts
  // `lightWound` down.
  hp: 10, hpPerCool: 4, lightWound: 3,
  // Guns are standard kit (WORLD.md): someone with nothing in the weapon slot has a street piece.
  unarmed: { name: 'Street piece', damage: 2 },

  // What a runner does with their turn. They shoot unless another stat beats their combat by
  // `lean` (a medic patches, a face talks, a tech kills the lights), or a teammate needs saving.
  lean: 2,
  patchHeal: 3, // HP back from a patch (a trauma kit adds its patch bonus)
  patchMin: 7, // medical needed to patch or stabilise in a fight (as for patching a serious wound)
  stabilise: 9, // difficulty to stabilise someone at death's door (as a critical's)
  talkStep: 2, // talking a guard into backing off is this much harder than the fight
  lightsOff: 3, // with the lights out, guards are this much worse at hitting anyone

  // Shots: a guard is an easier mark than a lock, so shooting is shootStep easier than the fight's
  // difficulty; overwatch one easier again, as for saves. Guards hit with the fight's difficulty
  // plus guardStep as their skill, against the runner's cool.
  shootStep: -2, overwatchStep: -1, guardStep: -2,

  // Guards by threat (index = threat 1-5): health, armour (flat soak), damage per hit.
  guardHp: [0, 4, 5, 6, 7, 8],
  guardArmour: [0, 0, 0, 1, 1, 2],
  guardDamage: [0, 2, 3, 3, 4, 4],
  extraGuardFrom: 5, // one more guard on threat 5 work
  breakBelow: 0.5, // the last guard standing breaks and runs under this share of their HP (alert +fledAlert)
  fledAlert: 1,
  guardsFocus: 0.5, // share of guard attacks that go for whoever is hurt worst (the rest pick anyone)

  // HP left after a fight becomes the injury the game already tracks (share of their max).
  lightBelow: 0.5, seriousBelow: 0.25,

  // Pulling back (owner's calls): the job and its pay, heat, reputation, and a parting exchange
  // that can hurt anyone running but never kill (nobody drops below 1 HP from it).
  retreat: { heat: 1, rep: 2 },
  // Pushing past guards still standing after the last round: they raise the alarm.
  press: { alert: 1, heat: 1 },

  // Standing orders in a fight, when the crew decides (core/autorun.js ORDERS):
  // pullAtHurt: pull back once anyone standing is under this share of their HP (Cautious: hurt;
  // Steady: badly hurt); press: push past guards still up after the last round, rather than pull back.
  orders: {
    cautious: { pullAtHurt: 0.5, press: false },
    steady: { pullAtHurt: 0.25, press: false },
    committed: { pullAtHurt: 0, press: true },
  },

  oddsRuns: 120, // fights simulated for the planning read (same function as the run, fixed seeds)
};
