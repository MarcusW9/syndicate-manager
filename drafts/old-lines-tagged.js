// Older lines, tagged and tiered so nothing written so far is lost. Backstories went into src/data in step 2; the rest merge in step 3.
// Sources: the 14 current ORIGINS not carried into backstories-batch-1, the 39 usable lines from the first
// (untagged) backstory list, and the 12 current PERSONALITIES split into temperament + habit.
// Edits on intake: "until he saw too much" -> "until they saw too much"; "in Mong Kok" -> "in {district}"
// (real place); the second "minibus driver" line dropped (duplicate); some lines given a {district}.

export const TEMPERAMENTS_OLD = [
  { text: 'Quiet, watchful, and slow to trust.', tags: ['wary', 'calm'], tier: 'common' },
  { text: 'Laughs too loudly and never stops eating.', tags: ['warm', 'hot'], tier: 'common' },
  { text: 'Ambitious and blunt about it.', tags: ['money', 'hot'], tier: 'common' },
  { text: 'Polite to a fault, until the shooting starts.', tags: ['charming', 'hot'], tier: 'common' },
  { text: 'Treats the crew like family from day one.', tags: ['warm'], tier: 'common' },
  { text: 'Superstitious about absolutely everything.', tags: ['superstitious'], tier: 'common' },
];

export const HABITS_OLD = [
  { text: 'Sends money home every week and never says to who.', tags: ['money', 'warm'], tier: 'common' },
  { text: 'Keeps a small shrine in their locker and lights incense before jobs.', tags: ['superstitious'], tier: 'common' },
  { text: 'Reads cheap detective novels between jobs.', tags: ['curious'], tier: 'common' },
  { text: 'Has an opinion about every cha chaan teng in the city.', tags: ['warm', 'charming'], tier: 'common' },
  { text: 'Owes money to somebody dangerous and is trying to fix it.', tags: ['money', 'haunted'], tier: 'uncommon' },
  { text: 'Still lives with parents who think they work in logistics.', tags: ['warm', 'wary'], tier: 'uncommon' },
  { text: 'Avoids the number four and anyone wearing the wrong colour of shoes.', tags: ['superstitious'], tier: 'common' },
];
