// Engine 2: the fights of the battle rework (drafts/SPEC-battle-orders.md, drafts/NUMBERS-battle-orders.md
// section 13 is the single source for these numbers; spec section 30 says what is settled). Numbers
// and content only; the rules live in core/fight.js. Engine 1 (data/battle.js, core/battle.js) keeps
// running every fight that is not one of the five jobs below, and raids.
//
// Roll rule as everywhere: d20 + stat >= 10 + difficulty. A fight's `diff` is the job's typical roll
// (the incident difficulty); `base` below means that. Every number is a first value, to be tuned in
// data once slice 3's sim runs on the real code.

export const FIGHT = {
  // Pips (spec 10a): pips = max(minPips, floor(endurance / endurancePerPip)); a light wound starts a fight 2 down.
  endurancePerPip: 2, minPips: 3, lightWoundPips: 2,
  // Shots: aimChance = clamp((11 + aimStep - (cool - base) - cover - (hunker ? hunkerStep : 0)) / 20, aimFloor, aimCeil);
  // hunker also raises cover one step. A runner making for the van is in the open. Damage comes from
  // ENEMY_HIT; armour absorbs whole hits (absorb); a drone's own absorb is droneAbsorb; ap ignores it.
  aimStep: 2, aimFloor: 0.1, aimCeil: 0.9,
  cover: { open: 0, half: 2, full: 4 }, startCover: 'half', hunkerStep: 4,
  absorb: { none: 0, street: 1, pro: 2 }, droneAbsorb: 1,
  // Runner actions: d20 + stat >= 10 + base + step (+ the target's cover for attacks).
  attackStep: -2, jamStep: 0, patchStep: 0, stabiliseStep: 2, boardStep: -4, carryStep: 2, overwatchStep: -1,
  hit: 1, strongHit: 2,
  // A runner's hit is strong (2 pips) on this margin over the roll's need, by their sidearm's damage
  // (damage 2 or less reads as 2, 5 or more as 5): a harder-hitting gun is strong more often.
  strongMarginByDamage: { 2: 12, 3: 10, 4: 8, 5: 6 },
  patchHeal: 1,
  medicAura: { heal: 1, stopsBleeding: true }, // while a medic stands in the fight: the most hurt standing runner +1 a round
  // Targeting: the chance a shot goes at the protected runner, then at the lowest-pips runner.
  targetFocus: 0.5, protectFocus: 0.75,
  // Risk (spec 10): pull out at or below these pips at round start. Cautious: half of their pips, rounded up. Steady: a third of
  // their pips, rounded up, at least minPips (owner, 2026-11-12: a flat 2 made a 3-pip runner leave after one hit; sims/pullout-2026-11-12.md).
  // Committed never pulls out, fights on with someone down (bleeding, below) and presses past the deadline.
  risk: { cautious: { pullAt: 'half' }, steady: { pullDiv: 3, minPips: 1 }, committed: { pullAt: 0, press: true, fightsOnWithDown: true } },
  // Bleeding (spec 10b; committed only): a downed runner not stabilised, carried or out of the fight
  // starts bleeding from the second round after going down; each round after, they die with bleedChance.
  bleedGrace: 2, bleedChance: 0.1, leftDownDeath: 0.1,
  // The van (spec 8).
  vanRound: 3, vanEarlyHeat: 1, doorSlots: 3, vanWait: 4, holdRounds: 2, holdHeat: 1, overwatchUsesAtVan: 1,
  // Left behind (spec 8; the owner's numbers). Slice 4 builds the rescue, the ransom and the waiting.
  missingDays: 7, ransomWeeks: 3, missingDeath: 0.1,
  // Injury from pips left (share of max); 0 pips = critical, as in engine 1.
  lightBelow: 0.5, seriousBelow: 0.25,
  // Ends.
  partingShotFloor: 1, retreat: { heat: 1, rep: 2 }, press: { alert: 1, heat: 1 },
  deadline: { holdHack: 7 }, // holdExtract ends when the van leaves
  workNeeded: 4,
  maxExtraEnemies: 2, oddsRuns: 120,
};

// Enemies at their default toughness: pips, where they stand, and the deck their threats are drawn
// from (shuffled per enemy, seeded by the fight). Fleeing is side-wide (see fleeBelow).
export const ENEMIES = {
  hired: { pips: 1, cover: 'half', deck: ['aim', 'aim', 'alarm'], fleeBelow: 0.4 },
  corp: { pips: 2, cover: 'half', deck: ['aim', 'backup', 'aim', 'flank'] },
  drone: { pips: 1, cover: 'open', deck: ['aim', 'alarm'], absorb: 1, jamTakesOut: true },
  enforcer: { pips: 2, cover: 'half', deck: ['aim', 'aim', 'flank'] },
};
// Pips a shot of each kind takes (2 is the most any shot does).
export const ENEMY_HIT = { hired: 1, drone: 1, corp: 2, enforcer: 2 };
// Who a site (a district id, data/incidents.js ZONES aside: names.js districts) sends, in rotation by slot.
export const SITE_ENEMIES = { heights: ['corp', 'drone'], docks: ['hired', 'hired', 'enforcer'] };
// How many enemies a fight starts with, by the job's threat 1-5: the difficulty dial.
export const COUNT_BY_THREAT = [0, 2, 2, 3, 3, 4];

// The threats an enemy's deck can draw. `answers` are the responses that stop one; `radio` ones are
// stopped by a jam or by attacking their source.
export const THREATS = {
  aim: { target: 'runner', answers: ['shield', 'hunker', 'attack'] },
  backup: { target: null, radio: true, answers: ['jam', 'attack'], needs: 'enemyReinforce' },
  alarm: { target: null, radio: true, answers: ['jam', 'attack'] },
  flank: { target: 'runner', answers: ['attack'] },
};

// Escalation clocks. alarm (holdHack): counts down 1 a round (and 1 more per alarm threat that gets
// through); at 0 one more enemy is on the way and it resets. pressure (holdExtract): another enemy at
// round `firstRound`, then every `every` rounds; an alarm that gets through brings the next one a round
// earlier per `alarmBringsForward`.
export const CLOCKS = {
  alarm: { startsAt: 5, tickPerRound: 1, extraTick: 'alarm', onZero: 'addEnemy', resetTo: 3 },
  pressure: { firstRound: 3, every: 2, alarmBringsForward: 1, enemy: 'first' },
};

// The two fight types (spec 11). Stages count from 0: holdExtract's 0 is "hold for the van", 1 "board".
export const FIGHTS = {
  holdHack: {
    goal: 'work', protect: 'tech', stages: 1, clock: 'alarm', friendlyReinforce: true, enemyReinforce: true,
    overwatchKit: 'drone',
  },
  holdExtract: {
    goal: 'hold+board', stages: 2, clock: 'pressure', friendlyReinforce: true, enemyReinforce: true,
    overwatchKit: 'rifle',
  },
};

// The five jobs that play on engine 2 (spec section 30). Everything else stays on engine 1.
export const FIGHT_JOBS = {
  data_pull: 'holdHack', data_scrub: 'holdHack', quiet_hours: 'holdHack',
  warehouse: 'holdExtract', protection: 'holdExtract',
};

// The priority words an order's tie-breaks may use (spec 12; the grammar is core/fight.js enemyOrder).
export const PRIORITY_WORDS = ['protected', 'radio', 'low', 'exposed'];
export const DUTIES = ['attack', 'protect', 'support', 'hold', 'push', 'withdraw'];
export const RISK_LEVELS = ['cautious', 'steady', 'committed'];
