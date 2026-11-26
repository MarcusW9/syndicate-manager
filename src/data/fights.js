// Engine 2: the fights of the battle rework (drafts/SPEC-battle-orders.md, drafts/NUMBERS-battle-orders.md
// section 13 is the single source for these numbers; spec section 30 says what is settled). Numbers
// and content only; the rules live in core/fight.js. Engine 1 (data/battle.js, core/battle.js) keeps
// running every fight that is not one of the five jobs below. Raids play here too (type holdHall).
//
// Roll rule as everywhere: d20 + stat >= 10 + difficulty. A fight's `diff` is the job's typical roll
// (the incident difficulty); `base` below means that. Every number is a first value, to be tuned in
// data once slice 3's sim runs on the real code.

export const FIGHT = {
  // A fight is played this much below the job's difficulty (core/fight.js fightDiff; 2026-11-13, sims/gate-teams-2026-11-13.md).
  ease: 2,
  // HP (2026-11-18, the move from pips: one old pip is hpUnit HP, and every amount below is in HP). hpUnit is also the size of a
  // health-bar segment on the screens and the unit the pull-out points round to.
  // HP (spec 10a): max(minHp, floor(endurance / endurancePerPip) x hpUnit); a light wound starts a fight lightWoundHp down.
  hpUnit: 10, endurancePerPip: 2, minHp: 30, lightWoundHp: 20,
  // Shots: aimChance = clamp((11 + aimStep - (cool - base) - cover - (hunker ? hunkerStep : 0)) / 20, aimFloor, aimCeil);
  // hunker also raises cover one step. A runner making for the van is in the open. Damage comes from
  // ENEMY_HIT. A runner's armour is a flat soak (2026-11-19, owner; drafts/PROPOSAL-enemy-toughness.md part 3): soakPerArmour HP off every
  // enemy shot that lands, per armour point, at least soakMin through. soakShots: how many shots a soak is counted for when the crew's
  // defaults pick the toughest protector. Enemies keep plates (their absorb; the drone's is droneAbsorb); ap ignores them.
  aimStep: 2, aimFloor: 0.1, aimCeil: 0.9,
  cover: { open: 0, half: 2, full: 4 }, startCover: 'half', hunkerStep: 4,
  soakPerArmour: 5, soakMin: 1, soakShots: 2,
  droneAbsorb: 1,
  // Runner actions: d20 + stat >= 10 + base + step (+ the target's cover for attacks).
  // Boarding and carrying need no roll (2026-11-13): a boarder spends the round in the open and takes a door slot.
  // Bad luck softener (owner, 2026-11-17): each shot a runner misses in a row lines the next one up, +missBonus to the roll, up to missBonusCap;
  // a hit resets it. Per fight, kept on the runner (`misses`).
  missBonus: 3, missBonusCap: 9, // +3 a miss to +9 since 2026-11-20 (was +2 to +6; owner, docs/sims/misses-2026-11-20-v5-twothirds-softener.md)
  // The crew's shots and the job's difficulty (owner, 2026-11-20; docs/sims/misses-2026-11-20.md and -v5-twothirds-softener.md): above attackClimbFrom,
  // a crew attack (a runner's, a bounce, the overwatch, a turret) feels only this share of the difficulty's climb (1: all of it, as before), so
  // shots at threats 4-5 miss about 30% of the time instead of about half. Enemy shots are unchanged.
  attackClimbShare: 0.67, attackClimbFrom: 6,
  attackStep: -2, jamStep: 0, patchStep: 0, stabiliseStep: 2, overwatchStep: -1,
  // Hit size (2026-11-18, owner; drafts/PROPOSAL-gear-hit-size.md): a weapon's damage sets what its hit takes off, hit + hitPerDamage
  // for each point of damage above hitBaseDamage (2, unarmed: what every starting runner carries, so damage 2 or less hits for hit, 10; owner, 2026-11-18, after the damage-3 default sidearm hit no harder than bare hands); a strong hit is strongMult times that. Crew
  // attacks, overwatch and the hall turret, each from its own damage (core/fight.js hitOf). A plate takes plateHp off one hit and
  // the rest goes through; a hit breaks at most one plate. strongHit is the strong hit at the base damage (the screens' fixed numbers).
  hit: 10, hitPerDamage: 3, hitBaseDamage: 2, strongMult: 2, strongHit: 20, plateHp: 10,
  // Hit variance (2026-11-18): a hit that lands, a crew's or an enemy's, wobbles by up to hitSpreadShare of its size either way, rounded
  // to whole HP (±2 at 10, ±3 at 20, ±4 at 25). The share of what gets past a plate wobbles too; a plain hit all soaked stays 0.
  hitSpreadShare: 0.15,
  // A hit is strong on this margin over the roll's need, the same for every weapon (owner, 2026-11-18, Q1: damage sets the hit's
  // size, not its odds; 12 is the old margin at damage 2, what every starting runner carries, so a new crew's fights are unchanged).
  strongMargin: 12,
  patchHeal: 10,
  medicAura: { heal: 10, stopsBleeding: true }, // while a medic stands in the fight: the most hurt standing runner +heal a round
  // Targeting: the chance a shot goes at the protected runner, then at the lowest-HP runner.
  targetFocus: 0.5, protectFocus: 0.75,
  // Risk (spec 10): pull out at or below these HP at round start. Cautious: half of their HP, rounded up to a whole hpUnit. Steady: a third of
  // their HP, rounded up to a whole hpUnit, at least minHp (owner, 2026-11-12: a flat 2 made a 3-pip runner leave after one hit; sims/pullout-2026-11-12.md).
  // Committed never pulls out, fights on with someone down (bleeding, below) and presses past the deadline.
  risk: { cautious: { pullAt: 'half' }, steady: { pullDiv: 3, minHp: 10 }, committed: { pullAt: 0, press: true, fightsOnWithDown: true } },
  // Bleeding (spec 10b; committed only): a downed runner not stabilised, carried or out of the fight
  // starts bleeding from the second round after going down; each round after, they die with bleedChance.
  bleedGrace: 2, bleedChance: 0.1, leftDownDeath: 0.1,
  // The van (spec 8).
  vanRound: 3, vanEarlyHeat: 1, doorSlots: 3, vanWait: 4, holdRounds: 2, holdHeat: 1, overwatchUsesAtVan: 1,
  // Left behind (spec 8; the owner's numbers). Slice 4 builds the rescue, the ransom and the waiting.
  missingDays: 7, ransomWeeks: 3, missingDeath: 0.1,
  // Injury from HP left (share of max); 0 HP = critical, as in engine 1.
  lightBelow: 0.5, seriousBelow: 0.25,
  // Ends.
  partingShotFloor: 1, retreat: { heat: 1, rep: 2 }, press: { alert: 1, heat: 1 },
  deadline: { holdHack: 7 }, // holdExtract ends when the van leaves
  workNeeded: 4,
  wayOutTreatHeal: 10, // ... and the HP a healer standing at the end gives each runner who is up and hurt (HP become the injury: core/fight.js injuryFromHp)
  wayOutTreatStep: -4, // the medic's hands on the way out (2026-11-17): the stabilise roll's step for a healer treating the downed before the crew leaves (the plain stabilise action is +2: harder)
  wayOutShare: 0.5, // the way out of a hack (2026-11-17): the share of the opening force's count (rounded up, at least one) that comes in when the work is done. The owner's default was 1 (the same again); 0.67 and up tipped a hands-off year of play (tests/inbox.test.js), so it is half. docs/sims/wayout-2026-11-17.md
  // The director (Slice 1): how long a beat holds at playback (ms; a hint only), and how many spotlights a pace plays as spotlights
  // (the rest play as notable; Resolve plays none but still lists them). Applied by the UI, never by core.
  beatMs: { routine: 600, notable: 1200, spotlight: 2200, showcase: 3000 },
  spotlightBudget: { watch: 4, fast: 3, resolve: 0 },
  maxExtraEnemies: 2, oddsRuns: 120,
};

// Enemies at their default toughness: HP, where they stand, and the deck their threats are drawn
// from (shuffled per enemy, seeded by the fight). Fleeing is side-wide (see fleeBelow).
export const ENEMIES = {
  hired: { hp: 10, cover: 'half', deck: ['aim', 'aim', 'alarm'], fleeBelow: 0.4 },
  corp: { hp: 20, cover: 'half', deck: ['aim', 'backup', 'aim', 'flank'] },
  drone: { hp: 10, cover: 'open', deck: ['aim', 'alarm'], absorb: 1, jamTakesOut: true, foeTags: ['synthetic', 'armoured'] },
  enforcer: { hp: 20, cover: 'half', deck: ['aim', 'aim', 'flank'] },
  // Standard force (prototype, 2026-11-15): the rank and file of a job's `opposition`. 10 HP behind one plate of armour,
  // so a plain hit only cracks the plate and a second one drops them; they come in numbers. The two kinds are the same body in
  // a different uniform (names and looks are placeholders, not canon).
  // fleeBelow marks a kind that breaks; the threshold itself is hired's (core/fight.js `breaks`).
  police: { hp: 10, cover: 'half', deck: ['aim', 'aim', 'alarm'], absorb: 1, fleeBelow: 0.4, foeTags: ['armoured'] },
  secforce: { hp: 10, cover: 'half', deck: ['aim', 'aim', 'backup'], absorb: 1, fleeBelow: 0.4, foeTags: ['armoured'] },
};
// Enemy tags (slice 3-ii-a, 2026-11-16): `foeTags` on a kind above. A payload that lists a tag in its `immune` (data/builds.js)
// does nothing to a body that has it. 'synthetic' is the first: machines, which the Cytotoxic Vector cannot touch. 'armoured' (2026-11-19):
// a kind that starts behind a plate; drones count too (owner, 2026-11-19). No piece lists it as immune yet; the build read names it.
// HP a shot of each kind takes (20 is the most any shot does).
export const ENEMY_HIT = { hired: 10, drone: 10, corp: 20, enforcer: 20, police: 10, secforce: 10 };
// Who a site (a district id, data/incidents.js ZONES aside: names.js districts) sends, in rotation by slot.
export const SITE_ENEMIES = { heights: ['corp', 'drone'], docks: ['hired', 'hired', 'enforcer'] };
// How many enemies a fight starts with, by the job's threat 1-5: the difficulty dial.
export const COUNT_BY_THREAT = [0, 1, 1, 3, 3, 4];
// Enemy toughness (2026-11-18, drafts/PROPOSAL-enemy-toughness.md, step 1): by the job's threat 1-5, how many steps tougher every body
// is: each step adds `hpStep` HP, and from `plateAtStep` steps up a body gets one more plate. Threat 1-3 are as before (the early
// game, unarmed crews); threat 4 and 5 are +5 HP (threat 5 was +10 until the owner halved it, 2026-11-19). No threat reaches plateAtStep yet: the first sim (docs/sims/enemy-toughness-2026-11-18-step1.md)
// found HP and a plate together far above the target, so plates wait for the week or standing steps. The index is the threat; 0 is unused.
export const TOUGHNESS_BY_THREAT = [0, 0, 0, 0, 1, 1];
export const TOUGHNESS = { hpStep: 5, plateAtStep: 3 };
// A job's optional `opposition` (data/missions/*.js): who stands against the crew. The fight keeps the district's own kind as
// the one leader and fills the rest with this force's grunts, `extra` more bodies than the count above (0 since 2026-11-15, owner: with 1, Warehouse Lift broke both safety bars once the gate sim fought its police, sims/newjobs-2026-11-15.md; #176 had set 1 from strong made-up crews, sims/standard-force-2026-11-15.md). A job without one plays as before.
export const OPPOSITION = {
  police: { grunt: 'police', extra: 0 },
  corporate: { grunt: 'secforce', extra: 0 },
};

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

// The fight types (spec 11; holdYard added 2026-11-13). Stages count from 0: holdExtract's 0 is "hold for the van", 1 "board".
export const FIGHTS = {
  holdHack: {
    goal: 'work', protect: 'tech', stages: 1, clock: 'alarm', friendlyReinforce: true, enemyReinforce: true,
    overwatchKit: 'drone',
  },
  // holdYard (2026-11-13): no van. The crew wins by rout: every enemy down or broken, and none still on the way. The pressure clock still brings more.
  holdYard: {
    goal: 'rout', stages: 1, clock: 'pressure', friendlyReinforce: true, enemyReinforce: true,
    overwatchKit: 'rifle',
  },
  // holdHall (2026-11-17): a raid on one of our halls. No van, no clocks, no reinforcements: the raiders come in at once. The hall holds by
  // rout (every raider down or running) or by the round cap (they back off at `cap`, the door held), with the hall's turret firing on its own.
  holdHall: {
    goal: 'rout', stages: 1, clock: null, friendlyReinforce: false, enemyReinforce: false,
    overwatchKit: null,
  },
  holdExtract: {
    goal: 'hold+board', stages: 2, clock: 'pressure', friendlyReinforce: true, enemyReinforce: true,
    overwatchKit: 'rifle',
  },
};

// The jobs that play on engine 2: the five of spec section 30, then new jobs drafted with a /* FIGHT */ block (/add-job,
// 2026-11-15). Everything else stays on engine 1.
export const FIGHT_JOBS = {
  data_pull: 'holdHack', data_scrub: 'holdHack', quiet_hours: 'holdHack',
  warehouse: 'holdExtract', protection: 'holdYard',
  dead_air: 'holdExtract', still_connected: 'holdHack', not_for_sale: 'holdExtract', one_more_song: 'holdHack',
  still_clocked_in: 'holdHack', the_last_collection: 'holdExtract',
  // 2026-11-23 (/add-job): inquiries and inspections, technical or records work, so they hold the hack. No recipes.
  salt_in_the_seals: 'holdHack', signed_for_the_shift: 'holdHack', the_demonstration_passed: 'holdHack', the_last_call_out: 'holdHack',
  the_wrong_fare: 'holdHack',
  // The fourteen jobs with a fight in their own crises, moved to engine 2 together (owner, 2026-11-17): no recipes, the district's own force.
  kidnap: 'holdExtract', casino: 'holdHack', clinic: 'holdYard', ledger: 'holdExtract', container409: 'holdExtract', chrome: 'holdHack',
  low_water: 'holdExtract', mooring_watch: 'holdYard', count_against_paper: 'holdHack', quarter_to_two: 'holdExtract',
  manual_handling: 'holdExtract', favourite: 'holdYard', last_ticket: 'holdExtract', wrong_horse: 'holdHack',
  // The last fifty-one jobs moved on 2026-11-19; see drafts/REVIEW-fight-types-2026-11-20.md for the review.
  cable: 'holdHack', eviction: 'holdHack', signal_walk: 'holdExtract', house_advantage: 'holdExtract', the_flat_doesnt_exist: 'holdHack',
  the_guest_copy: 'holdExtract', service_included: 'holdHack', someone_at_the_controls: 'holdHack', cover_the_late_shift: 'holdExtract',
  what_was_installed: 'holdHack', expected_upstairs: 'holdHack', the_replacement_visit: 'holdHack', after_the_applause: 'holdExtract',
  relay_cover: 'holdYard', a_steady_hand: 'holdExtract',
  courier: 'holdExtract', penthouse: 'holdExtract', herbal_run: 'holdExtract', delivery: 'holdExtract', paid_in_full: 'holdExtract',
  second_hand_heart: 'holdExtract', borrowed_glory: 'holdExtract', exit_interview: 'holdExtract', cold_chain: 'holdExtract',
  paper_collection: 'holdExtract', clean_sheets: 'holdExtract', crate_return: 'holdExtract', kit_return: 'holdExtract', landing_hands: 'holdYard',
  after_hours: 'holdExtract', rent_round: 'holdExtract', back_rent: 'holdHack', an_old_account: 'holdExtract', the_current_copy: 'holdExtract',
  last_sitting: 'holdExtract',
  queue_duty: 'holdYard', shutter_watch: 'holdYard', fitting_room: 'holdYard', quiet_table: 'holdYard', race_night_door: 'holdYard',
  inspection_hours: 'holdYard', closing_stack: 'holdYard', closing_sweep: 'holdYard', stable_turnover: 'holdYard', clear_the_ramp: 'holdYard',
  eyes_on_the_seal: 'holdYard', access_window: 'holdYard', tack_ledger: 'holdYard', dry_shelf: 'holdYard', still_on_the_books: 'holdHack',
  someone_to_cover: 'holdHack',
};

// The priority words an order's tie-breaks may use (spec 12; the grammar is core/fight.js enemyOrder).
export const PRIORITY_WORDS = ['protected', 'radio', 'low', 'exposed', 'approaching'];

// Fight recipes by job id (slice 3d): a job's own waves and its cap on reactive reinforcements. waves: [{ round, kind?, count }],
// spawned at the start of that round, all approaching, one new group per wave, on their own budget (never counted in the
// fight's `extras`). kind: an ENEMIES kind; left out, a wave sends who the clocks send (core/fight.js reinforceKind: the
// job's opposition's grunt, else the district's first kind; owner, 2026-11-15). maxExtraEnemies: the cap on backup calls,
// the alarm clock and the pressure clock, else FIGHT.maxExtraEnemies. Which jobs get waves is the owner's to write
// (the handoff's content question 2). The format and a checklist: docs/fight-recipe-template.md.
export const FIGHT_RECIPES = {
  still_connected: {
    waves: [
      { round: 3, count: 2, kind: 'secforce' }, // the shift office sends another pair to reclaim the crane's maintenance station
    ],
  },
  still_clocked_in: { maxExtraEnemies: 1, waves: [{ round: 3, kind: 'secforce', count: 2 }] }, // the patrol the records terminal's access alert brings
  the_last_collection: { maxExtraEnemies: 1, waves: [{ round: 4, kind: 'hired', count: 2 }] }, // a second collection crew answers the call
  the_wrong_fare: { waves: [{ round: 2, count: 2, kind: 'secforce' }] }, // the vehicle checkpoint sends a response pair to the stopped taxi
  // The Heights extracts (owner, 2026-11-20; docs/sims/heights-extracts-2026-11-20.md): corp backup calls left runners behind far past the
  // ~15% target on steady. One backup group at most on the two threat 3-4 jobs, none on penthouse (threat 5).
  the_current_copy: { maxExtraEnemies: 1 }, exit_interview: { maxExtraEnemies: 1 }, penthouse: { maxExtraEnemies: 0 },
};
export const DUTIES = ['attack', 'protect', 'support', 'hold', 'push', 'withdraw'];
export const RISK_LEVELS = ['cautious', 'steady', 'committed'];
