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
    muscle: '{op} sat down across from you. "My knees say it is time. {weeks} weeks is a long run for this work. I can stay one more season if the money is right, or I can go quietly."',
    tech: '{op} put a cold cup of tea on your desk. "I have been doing this {weeks} weeks and my hands are not what they were. Pay me more and I will stay a season. Or let me walk."',
    driver: '{op} turned the keys over in their hand. "{weeks} weeks of other people\'s getaways. I would like to stop, or stay one more season at a better rate. Your call."',
    face: '{op} smiled the way they do. "{weeks} weeks of talking my way through doors. I am tired. One more season, if you make it worth it, or I step out."',
    infiltrator: '{op} was already half out of the door. "{weeks} weeks of staying unseen and I would like to be seen once, doing nothing. One more season for more, or let me go."',
    medic: '{op} washed their hands twice before speaking. "{weeks} weeks of patching this crew. I would stay a season for better pay, or I could put the bag down for good."',
  },
  fallback: '{op} asked for a word. "{weeks} weeks is a long time in this city. I will stay a season for more money, or I will go. Whichever you decide."',
};

export const RETIRE_REPLY = {
  stay: '{op} nodded. "One more season." The wage is now {wage} a week.',
  go: '{op} shook your hand and went. Their gear is back in the stash.',
  goHall: '{op} shook your hand and went. Their gear is back in the stash, and their name goes on the wall of the Hall of Legends.',
};

/** Lines on the Hall of Legends wall, by fame; the generic one fits anyone. */
export const HALL_EPITAPH = {
  legend: 'A Legend. The street still tells it.',
  elite: 'Elite for as long as it counted.',
  generic: 'Worked long enough to be missed.',
};
