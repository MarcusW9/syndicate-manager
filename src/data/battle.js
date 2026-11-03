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
  // difficulty, plus the target's cover; overwatch one easier again, as for saves. Guards hit with
  // the fight's difficulty plus guardStep as their skill, against the runner's cool plus their cover.
  // Half cover is built into these steps (2026-10-30): a fight with everyone in half cover plays as
  // fights did before cover existed (shootStep -2, guardStep -2, no cover).
  shootStep: -4, overwatchStep: -1, guardStep: 0,

  // Cover (command fights, 2026-10-30, after XCOM): everyone stands somewhere, and a shot at them is
  // this much harder. Everyone starts a fight in startCover until the site map gives them spots.
  cover: { open: 0, half: 2, full: 4 },
  // Districts whose fights stand on spots read off the site map (core/fightspots.js; step 2 the
  // Docks, step 3 the rest). Anywhere else everyone stands in startCover.
  spotsIn: ['docks', 'oldTown', 'nightMarket', 'heights', 'basin'],
  hunkerStep: 4, // hunkering: one step better cover and this much on top, for the round (no shot)
  startCover: 'half',
  // The player's orders, a round at a time (the crew's own call, core/battle.js actionFor, is the
  // default): hunker (one step better cover this round, no shot), flank (round a guard's cover: they
  // count as in the open for every shot this round, and so does the flanker for the guards' turn).

  // Guards by threat (index = threat 1-5): health, armour (flat soak), damage per hit.
  // More guards on bigger work, each lighter (2026-10-29): armour only on threat 5 security.
  guardHp: [0, 4, 4, 5, 5, 6],
  guardArmour: [0, 0, 0, 0, 0, 1],
  guardDamage: [0, 2, 2, 3, 3, 3],
  // How many: the incident's own count (1 or 2), plus more on bigger work (index = threat), at most
  // maxGuards (owner, 2026-10-29: more guards a fight, each a bit weaker).
  extraGuards: [0, 0, 0, 1, 1, 2], maxGuards: 4,
  breakBelow: 0.5, // under this share of their HP a guard breaks and runs, if they're the last one up or half their side is down (alert +fledAlert)
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
