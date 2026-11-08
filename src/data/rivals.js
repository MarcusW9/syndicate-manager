// The other tongs (DESIGN.md 2026-11-08 "No league"; WORLD.md "The other tongs"; plan in
// drafts/PROPOSAL-phase-3.md part C). Content and tuning only: the naming kit by style, the text
// table that turns core's word keys into lines (core keeps no wording, C.1 rule 6), the Brass
// Anchor Society, and the numbers `core/rivals.js` runs on. No tong is based in the Silt.

export const STYLES = ['loud', 'quiet', 'corporate', 'street'];

// Invented names only: no digits, no real society, no canon firm's initials (AHL, VA, HS, MV, HY).
export const NAMING = {
  loud: { first: ['Black Heron', 'Cleaver', 'Jade Mantis', 'Rust Pangolin', 'Salt Cormorant', 'Hook', 'Grey Wolfhound', 'Halberd'], last: ['Hand', 'Fist'] },
  quiet: { first: ['Third Mist', 'Late Rain', 'Grey Hour', 'Cold Dew', 'Still Water', 'Slow Frost', 'Dim Hour'], last: ['Society'] },
  corporate: { first: ['K&W', 'MT', 'D&L', 'TP', 'S&Y', 'RC', 'F&N', 'BL'], last: ['Holdings', 'Partners'] },
  // A canon place from WORLD.md (open districts only) and the district it sits in.
  street: {
    places: [
      { name: 'Basin', home: 'basin' }, { name: 'Gantry Gate', home: 'docks' }, { name: 'Lower Arcade', home: 'heights' },
      { name: 'Service Steps', home: 'heights' }, { name: 'Old Stand', home: 'basin' }, { name: 'Neon Dragon', home: 'nightMarket' },
      { name: 'Wash Passage', home: 'nightMarket' }, { name: 'Rain Passage', home: 'heights' }, { name: 'Pier Walkway', home: 'docks' },
    ],
    last: ['Lot', 'Row', 'Court'],
  },
};

// Districts a rival may be based in. Never the Silt (WORLD.md; owner, 2026-11-08).
export const RIVAL_HOMES = ['oldTown', 'docks', 'nightMarket', 'heights', 'basin'];

// Fixed elder, never simulated or tiered. It sits beside the ladder (WORLD.md "The other tongs").
export const BRASS_ANCHOR = { id: 'brass-anchor', name: 'Brass Anchor Society', home: 'oldTown' };

export const RIVALS = {
  tongs: 6,
  freeNames: 10, // cards without a tong
  perTong: [4, 6], // named runners kept per tong
  wordMax: 24, // entries kept in state.rivals.word
  wordWeeks: 4, // talk older than this goes on Sundays
  mondayLines: 3,
  namesMax: 8, // Names on the street
  // Hall marks: a rival's next hall opens when prestige and wealth both pass its mark, and the
  // last one closes when prestige falls well under its mark (hysteresis). Index = halls held.
  marks: [null, { prestige: 22, wealth: 4000 }, { prestige: 40, wealth: 14000 }, { prestige: 58, wealth: 32000 }, { prestige: 76, wealth: 60000 }],
  closeBelow: 8, // prestige this far under the held hall's mark closes it
  // Weekly drift by style: how far prestige pulls toward `aim`, noise, and wealth per prestige point.
  styles: {
    loud: { noise: 7, pull: 0.07, wealth: 22, aim: [20, 75] },
    quiet: { noise: 3, pull: 0.1, wealth: 26, aim: [30, 68] },
    corporate: { noise: 4, pull: 0.06, wealth: 38, aim: [25, 72] },
    street: { noise: 5, pull: 0.08, wealth: 18, aim: [15, 60] },
  },
  aimEvery: 8, // weeks between a tong picking a new aim
  startPrestige: [8, 46],
  startWealth: [800, 9000],
  upkeep: 260, // wealth spent per hall a week
  cardAgeRetire: [44, 56],
  driftChance: 0.04, // a young name moving tongs, per card per week
};

// Rating words (core/rating.js ratingWord) → what the street says. {name} is the runner, {home} the
// district as it reads mid-sentence, {role} their trade.
export const RATING_WORDS = {
  standout: 'the best {role} in {home}',
  solid: 'steady, and trusted with real work',
  rising: 'on the way up',
  fading: 'past their best',
  green: 'a name to watch, one day',
};

export const FAME_LINE = { unknown: 'hardly known', known: 'known', respected: 'respected', elite: 'a big name', legend: 'a legend' };

// How a style reads on the screen: a label and one line.
export const STYLE_TEXT = {
  loud: { label: 'Loud', line: 'Likes to be seen, and heard.' },
  quiet: { label: 'Quiet', line: 'Prefers not to be noticed until it matters.' },
  corporate: { label: 'Corporate', line: 'Invoices first, and everything else after.' },
  street: { label: 'Street', line: 'Knows every lane of its patch.' },
};

// Beside the ladder, not on it (WORLD.md "The other tongs").
export const ELDER_LINE = 'The Brass Anchor Society is older than all of them, and nobody here is measured against it.';

// The Word: talk, never results (WORLD.md). Keys are `kind`; {tong} {home} {name} {tier} fill in.
export const WORD_TEXT = {
  took_work: ['{tong} took the {home} work off somebody else.', 'Word is {tong} has the {home} contracts this month.'],
  name_travelling: ['{name} is a name people are passing round, and {tong} is not shy about it.', "They're saying {name}'s worth hiring. {tong} would agree."],
  free_name: ['{name} is looking for a table to sit at.', '{name} is between tongs, for now.'],
  gone_quiet: ['{tong} has gone quiet lately.', 'Nobody has seen {tong} on a job in a while.'],
  stepped_up: ['{tong} has moved up in the world. People say they are a {tier} tong now.', "{tong} is carrying more weight than it did. The {tier} crowd has noticed."],
  slipped: ['{tong} has lost ground. The {tier} crowd is less sure of it.', "People who used to nod at {tong} don't, any more."],
  new_face: ['A new name in {home}: {name}, and nobody can say who taught them.'],
  your_name: ['People have started saying your name in {home}.'],
};

/** Fill a template. Pure formatting; the key choices live in core/rivals.js. */
export const fill = (template, vars) => template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
/** One of rivalView's word entries as a line. The variant comes from the entry's own text, so it is stable. */
export function wordLine(entry) {
  const variants = WORD_TEXT[entry.kind] ?? [];
  if (!variants.length) return '';
  const seed = [...`${entry.tong ?? ''}${entry.name ?? ''}${entry.kind}`].reduce((n, c) => n + c.charCodeAt(0), 0);
  return fill(variants[seed % variants.length], entry);
}

// Names a rival's runner never takes: canon people (WORLD.md), so nobody reads as one of them.
export const RESERVED_NAMES = ['Fung', 'Siu', 'Tang', 'Mak', 'Lo', 'Chow', 'Kwok', 'Ip', 'Tse', 'Ho', 'Lim', 'Po', 'Pang', 'Poon', 'Okonkwo', 'Rao', 'Szeto', 'Leung', 'Sarr', 'Pryce', 'Mila', 'Mateo', 'Prakash', 'Gurung', 'Zainab', 'Binta', 'Meena', 'Edith', 'Lourdes', 'Tariq', 'Wai-chiu', 'Joss'];
