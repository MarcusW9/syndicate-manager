// Retirement and the Hall of Legends (renown slice 6; part D1 of drafts/PROPOSAL-phase-3.md).
// Content and numbers as data; the rules are in core/retirement.js.

export const RETIREMENT = {
  minWeeks: 52, // no request before this many active weeks (owner, 2026-11-09)
  base: 0.005, // a week's chance once past minWeeks
  perTenWeeks: 0.001, // added for every further 10 active weeks
  perSerious: 0.01, // added for every serious injury on record
  over40: 1.5, over50: 2, // age only ever raises the chance a little
  eliteCap: 0.015, // an Elite or Legend under 40 is capped here
  cap: 0.15, // the most any week can be
  expiryDays: 7, // an unanswered request lapses after this many days: they stay
  snoozeStay: 56, // after Stay one more season
  snoozeLapse: 28, // after a request lapses
  wageUp: [1.2, 1.35], // the pay rise to stay: the first time, then every time after
  hallWeeks: 26, // a runner with this many active weeks goes in the Hall, famous or not
};

export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

/** Request wording by role: the subject, then a body. {op} is the handle, {weeks} the active weeks. */
export const RETIRE_TEXT = {
  subject: '{op} wants a word',
  bodies: {
    muscle: `{op} sat down across from you and rubbed one knee. "{weeks} weeks. My knees have started keeping count. Pay me a bit more and I'll do one more season. Or I go quietly. Your call."`,
    tech: `{op} put a cup of tea on your desk and let it go cold. "{weeks} weeks of other people's locks, and my hands shake before breakfast now. One more season at a better rate, or let me walk."`,
    driver: `{op} turned the keys over in their hand. "{weeks} weeks of other people's getaways. I'd like to drive somewhere slowly for once. One more season if the money's better. Otherwise these are yours."`,
    face: `{op} smiled the way they do when they want something. "{weeks} weeks of talking my way through doors. I'm tired of my own voice. Make it worth it and I'll do one more season. Otherwise I'll leave you my numbers."`,
    infiltrator: `{op} was already halfway to the door. "{weeks} weeks of nobody seeing me. I'd like to sit at a dai pai dong and be seen doing nothing. One more season, for more. Or let me go."`,
    medic: `{op} washed their hands twice before they spoke. "{weeks} weeks of stitching this crew back together. I'll stay a season for better pay. Or I put the bag down, and you find someone who still sleeps."`,
  },
  fallback: `{op} asked for a word. "{weeks} weeks is a long time in this city. One more season if the money's better, or I go. You decide."`,
};

export const RETIRE_REPLY = {
  stay: `{op} nodded. "One more season, then." Their wage is now {wage} a week.`,
  go: `{op} shook your hand and went. Their gear's back in the stash, and there's an empty hook by the door.`,
  goHall: `{op} shook your hand and went. Their gear's back in the stash, and Joss has put their name on the wall in the Hall of Legends.`,
};

/** Lines on the Hall of Legends wall, by fame; the generic one fits anyone. */
export const HALL_EPITAPH = {
  legend: 'Legend. The street still tells it, and gets it wrong.',
  elite: 'Elite, for as long as it counted.',
  generic: 'Stayed long enough to be missed.',
};
