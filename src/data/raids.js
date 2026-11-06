// Raids on the tong's halls (DESIGN.md 2026-11-05, the tong's Phase 2, slice 3). Police raids
// first: heat is police attention, so a hall in a hot district can draw a raid. Gang raids (a
// grudge, a settlement) come in a later slice. Numbers are first guesses for the playtest.
// Content only; the rules are in core/raids.js.

export const RAID = {
  heatAt: 6, // a hall's district at this heat or more can draw a raid (was 7; balance pass 2026-11-06)
  dailyChance: 0.25, // each day it's that hot, a seeded roll (owner: rarer and less predictable than every Sunday)
  warnDays: 3, // the warning comes this many days ahead
  cooldownDays: 28, // a hall isn't raided again this soon
  raiders: 2, // officers at the door before the threat adds more (core/battle.js guardsFor)
  shutDays: 7, // a hall the tong walked out of stays shut this long (its people lie low, no work)
  keptPerLevel: 1000, // cash and kit kept at a hall, lost when we walk out: this × the hall's level
  repairs: 1500, // the doors, the locks, what they broke on the way in
  withdrawCools: 3, // they found nothing: heat there drops this much
  holdCools: 2, // they were seen off: heat there drops this much
  holdRep: 1, // the district hears we held: reputation
  pressHeat: 1, // holding the door after the last round: they back off, and remember
  bribe: { base: 3000, perHeat: 500 }, // police on the take are not cheap (core/raids.js raidPrice)
  lateBribe: 1.5, // paying on the day, with them at the door, costs half again
};

/**
 * Police on the take, by district. The Harbour Police's 4th Precinct, the Wet Sleeve, works the
 * Docks and the Night Market borders and wants steady protection money (WORLD.md): they can be
 * paid. Old Town's patrol pairs take small bribes but can't call off a raid; the Basin's police and
 * Glass Heights' Veridian-Apex guards can't be bought (WORLD.md, Power map: Police).
 */
export const RAID_POLICE = {
  docks: { who: 'the Wet Sleeve', onTake: true },
  nightMarket: { who: 'the Wet Sleeve', onTake: true },
  oldTown: { who: 'the police', onTake: false },
  basin: { who: 'the police', onTake: false },
  heights: { who: 'Veridian-Apex security', onTake: false }, // no police up there (WORLD.md)
};

/** A raid as a run: the fight on the hall's map (core/raids.js startRaidFight), never on the board. */
export const raidTemplate = (district) => ({
  id: `raid:${district}`, raid: true, district, name: 'Raid on the hall', threat: 2, pay: 0, heat: 0, days: 0, crewSize: 2,
  keyStats: ['combat', 'cool'], beats: ['They are at the door.'], crises: [],
  brief: 'They are at the hall\'s door, and whoever is home is holding it.',
});
