// Gear (PLAN-CORE-LOOP.md, slice 5; DESIGN.md 2026-10-28). Content only: the rules live in
// core/gear.js. Each runner has four slots; an item sits in the safehouse stash until it's put
// on someone, and stays on them between jobs. No wear and no repairs (owner's call).
//
// bonus: { stat: n } added to that person's rolls (shown in the roll breakdown, like traits).
// overwatch: what the item does from overwatch (only the rifle and the drone). uses: shots or
//   drone actions a job; heat per shot; neural load per action; indoors: sees inside the target.
// serious: takes this off the chance that an unsaved incident leaves a serious wound.
// patch: counts this much extra towards the medical a teammate needs to patch a serious wound.
// neuralFloor: implants keep the wearer's neural load from resting below this.
// damage: what a hit does in a fight (slice 6; weapons, and the rifle and drone from overwatch).
// armour: flat soak in a fight, taken off every hit (a hit that lands always does at least 1).
// Tiers add their step to the item's bonus (or its overwatch roll), its damage and its armour,
// and multiply the price.

export const SLOTS = {
  weapon: { name: 'Weapon' },
  armour: { name: 'Armour' },
  tool: { name: 'Tool' },
  implant: { name: 'Implant' },
};

export const TIERS = {
  street: { name: 'Street', step: 0, price: 1 },
  pro: { name: 'Pro', step: 1, price: 2.5 },
};

export const GEAR = {
  rifle: {
    name: 'Rifle', slot: 'weapon', price: 2500,
    desc: 'Lets them take overwatch with the combat stat. Sees the open ground, not inside. Every shot is heat +1.',
    overwatch: { stat: 'combat', uses: 2, heat: 1, neural: 0, indoors: false, damage: 5 },
  },
  pistol: {
    name: 'Sidearm', slot: 'weapon', price: 600, bonus: { combat: 1 }, damage: 3,
    desc: 'A reliable handgun.',
  },
  vest: {
    name: 'Armoured vest', slot: 'armour', price: 1200, serious: 0.1, armour: 1,
    desc: 'Plates under a work jacket. Takes 1 off every hit in a fight.',
  },
  drone: {
    name: 'Drone', slot: 'tool', price: 3000,
    desc: 'Lets them take overwatch with the tech stat. Sees everywhere. Every action is neural load +10 for the pilot.',
    overwatch: { stat: 'tech', uses: 3, heat: 0, neural: 10, indoors: true, damage: 3 },
  },
  deck: {
    name: 'Cyberdeck', slot: 'tool', price: 1000, bonus: { tech: 1 },
    desc: 'A street-built deck for locks, cameras and firewalls.',
  },
  medkit: {
    name: 'Trauma kit', slot: 'tool', price: 800, bonus: { medical: 1 }, patch: 2,
    desc: 'Clotting foam, staples, a stim. They can patch a serious wound with less training.',
  },
  picks: {
    name: 'Lockpicks and shims', slot: 'tool', price: 700, bonus: { stealth: 1 },
    desc: 'Quiet tools for doors and windows.',
  },
  reflex: {
    name: 'Reflex wiring', slot: 'implant', price: 3500, bonus: { combat: 1, driving: 1 }, neuralFloor: 10,
    desc: 'Boosted nerves, but their neural load never rests below 10.',
  },
  cortex: {
    name: 'Cortex co-processor', slot: 'implant', price: 3500, bonus: { tech: 1, cool: 1 }, neuralFloor: 10,
    desc: 'A second brain behind the ear, but their neural load never rests below 10.',
  },
};

// What a recruit can bring with them, by role: [chance, item]. Rolled once when the lead appears.
export const RECRUIT_GEAR = {
  muscle: [[0.35, 'pistol'], [0.15, 'rifle'], [0.15, 'vest']],
  tech: [[0.35, 'deck'], [0.1, 'drone']],
  medic: [[0.4, 'medkit']],
  face: [[0.2, 'pistol']],
  driver: [[0.2, 'pistol'], [0.15, 'picks']],
};

// Sidearm strengths (2026-10-30, owner: "randomly generated strengths, and in the future perks").
// A sidearm's numbers come from its frame (data/gearLooks.js SIDEARM_LOOKS) and a quirk rolled with
// its look (core/looks.js). aim: added to the carrier's combat rolls (the sidearm's bonus); damage:
// what a hit does; pierce: armour points a hit ignores. A pro sidearm adds its tier step to aim and
// damage, as every pro item does. A sidearm with no frame (old saves, tests) is a heritage pistol:
// aim 1, damage 3, the sidearm as it always was. Perks are for later: they'd sit beside the quirk.
export const SIDEARM_FRAMES = {
  compact: { aim: 2, damage: 2, pierce: 0, trait: 'light and accurate' },
  heritage: { aim: 1, damage: 3, pierce: 0, trait: 'steady' },
  revolver: { aim: 1, damage: 4, pierce: 0, trait: 'hits hard' },
  machine: { aim: 0, damage: 3, pierce: 1, trait: 'sprays: some rounds get through armour' },
  cannon: { aim: 0, damage: 5, pierce: 0, trait: 'hits very hard, kicks' },
  smart: { aim: 3, damage: 3, pierce: 0, trait: 'the rounds find their mark' },
  coil: { aim: 1, damage: 3, pierce: 2, trait: 'punches through armour' },
};
// The quirk each sidearm rolls, by weight: most are as made, some are better, some trade one thing
// for another, a few are worn.
export const SIDEARM_QUIRKS = {
  none: { weight: 40, name: null },
  sights: { weight: 15, name: 'true sights', aim: 1 },
  hotloads: { weight: 15, name: 'hot loads', damage: 1 },
  hairtrigger: { weight: 10, name: 'hair trigger', aim: 1, damage: -1 },
  heavyrounds: { weight: 10, name: 'heavy rounds', aim: -1, damage: 1 },
  worn: { weight: 5, name: 'worn barrel', aim: -1 },
  lightloads: { weight: 5, name: 'light loads', damage: -1 },
};
// Price: each point of strength over the plain sidearm's (aim 1, damage 3) adds this share; a
// point of pierce counts half.
export const SIDEARM_PRICE_PER_POINT = 0.15;
