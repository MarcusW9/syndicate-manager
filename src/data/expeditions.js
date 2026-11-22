// Expeditions (the adventure log, slice 2; owner, 2026-11-21/22; drafts/HANDOFF-revenue-next.md). Our own
// tong's errands, not jobs: no client, no pay, no fame. The goal is the reward. Numbers here, logic in
// core/expeditions.js, lines in src/data/advlog/ (one file per goal, one per district).
//
// days: how long the trip is (day 1 opens, the last day turns and closes, the days between roll progress).
// stats: what the progress rolls are on (the crew's best at each). need: progress for the goal to be met
// (one short of it is a partial). A weapon is the hardest and longest; cash the shortest.
export const GOALS = {
  weapon: {
    name: 'A weapon', days: 6, need: 3, stats: ['stealth', 'social', 'tech', 'combat'],
    pitch: 'Find someone selling a good piece, and get it off them: buy, trade or lift.',
    met: 'a Custom or Premium weapon', partial: 'a lesser piece', failed: 'only what turns up on the way',
  },
  cash: {
    name: 'Cash', days: 4, need: 1, stats: ['social', 'cool', 'tech'],
    pitch: 'An old debt, a stash or a skim: small-time money owed or lying about, brought home.',
    met: 'the whole sum', partial: 'half of it', failed: 'only what turns up on the way',
  },
  recruit: {
    name: 'A recruit', days: 5, need: 2, stats: ['social', 'cool', 'medical'],
    pitch: 'Someone good is said to be looking for a crew. Find them and get a conversation.',
    met: 'a seasoned runner willing to meet you (in Crew › Leads)', partial: 'a rookie\'s name instead', failed: 'only what turns up on the way',
  },
};
export const GOAL_ORDER = ['weapon', 'cash', 'recruit'];

// Only districts with a log file of their own (people and places) for now (owner's call left open in the
// handoff; DESIGN.md 2026-11-22). Old Town and Glass Heights joined with their files (2026-11-22); the Basin joins when its is written.
export const EXPEDITION_DISTRICTS = ['oldTown', 'docks', 'nightMarket', 'heights'];

export const EXPEDITION = {
  maxCrew: 3,
  maxOut: 2, // expeditions out at once (income sim 2026-11-22: uncapped cash runs lifted a 7-crew's margin from about 30% to 80%)
  difficulty: 6, // side-task level: a 9 in the stat needs a 7 on the die
  findChance: 0.15, // a middle day that turns up something on the side instead of a progress roll
  snagDie: 5, // a failed roll on this die or lower is a snag (a small cost); other misses are dead ends or quiet days
  findCash: [100, 300], // a cash find
  snagCash: [100, 250], // a snag that costs money (one that hurts is a light injury instead)
  cashPerPersonDay: 200, // the sum a cash run brings home when met (half on a partial); below a side task's 250 a day, as the finds add to it
  callChance: 0.5, // a rough turn breaks into a fight that calls you in, this share of the time
  threat: 2, // the fight's threat (district adds as on posts)
  xpPerDay: 1, // growth in each day's stat, per person
  fatiguePerDay: 5,
  prizeTiers: { custom: 0.7, premium: 0.3 }, // a weapon hunt's prize
  prizeTypes: { pistol: 0.7, rifle: 0.3 },
};

/** An expedition's fight as a run (core/expeditions.js startExpeditionFight): never on the board. id `exp:<district>:<goal>`. */
export const expeditionTemplate = (district, goal = 'weapon') => ({
  id: `exp:${district}:${goal}`, expedition: true, district, name: `${GOALS[goal]?.name ?? 'An errand'}: the hunt`, threat: EXPEDITION.threat, pay: 0, heat: 0, days: 0, crewSize: 2,
  keyStats: ['combat', 'cool'], beats: ['The deal goes wrong.'], crises: [],
  brief: 'The deal went wrong, and the crew is in a fight.',
});
