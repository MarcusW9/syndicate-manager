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
  // C3 (DESIGN.md 2026-11-08 "C3 designed"; proposal C.13). Numbers proposed, the owner may tune.
  freeGap: [3, 6], // weeks between one free name being put forward and the next (random, a hash)
  freeWeeks: 3, // a free name left alone this long goes to a rival
  scoutMax: 3, // scout trips that sharpen a read (level 3: the potential read is exact)
  foldWeeks: 6, foldPrestige: 25, foldWealth: 6000, minTongs: 4, // a tong this poor for this many Sundays folds; never below minTongs
  formRating: 40, formSeasonRating: 45, formChance: 0.5, // a folded tong's best card may form their own; a season's end may form one
  newTong: { prestige: 8, wealth: 1280 },
  regard: { min: -5, max: 5, poach: -2, split: 1, cold: -2, warm: 2, splitMonthDays: 28 },
  buyout: { weeks: 6, richStep: 10000, richPer: 0.1, richCap: 0.5, cold: 1.25, warm: 0.9 },
  premiumMax: 0.35, // the most a runner asks over the market wage to be convinced
  notYet: 15, // persuasion under this: "not yet"
  clientChance: 0.2, // a client job in a tong's own district: the client mentions that tong wanted it (flavour only)
  driftChance: 0.04, // a young name moving tongs, per card per week
  // C4 (DESIGN.md 2026-11-09 "C4: rivals feel alive").
  cardBands: [30, 55], // a card's rating bands (rookie, pro, veteran): the same cut-offs as core/dossier.js tierForRating
  threadTimeout: 4, // weeks without a new beat before a story thread closes
  calmWeeks: 4, // Sundays out of the fold-risk condition that end a decline as "recovered"
  threadKeep: 24, // threads kept (open ones, then the newest closed ones)
  formerFreeWeight: 0.5, // between two free names of equal rating, the chance a former runner of ours is put forward first
  formerMax: 10, // names shown under "Gone elsewhere"
  formerMonday: 1, // former-runner lines per Monday
  threadMonday: 1, // continued-thread lines per Monday
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
  took_work: ['{tong} took work in {home} off somebody else.', 'Word is {tong} has the contracts in {home} this month.', 'Somebody in {home} is paying {tong} now, and not the somebody who used to.', 'They say {tong} is the name to call in {home} this month.'],
  name_travelling: ['{name} is a name people are passing round, and {tong} is not shy about it.', "They're saying {name}'s worth hiring. {tong} would agree.", '{name} was seen at the door of {tong}. Not for the first time.', '{tong} has found a seat for {name}, or the other way round.'],
  free_name: ['{name} is looking for a table to sit at.', '{name} is between tongs, for now.', 'Nobody has quite signed {name} yet.'],
  gone_quiet: ['{tong} has gone quiet lately.', 'Nobody has seen {tong} on a job in a while.', 'The lights at {tong} stay low these days.', "{tong} isn't taking calls, they say."],
  stepped_up: ['{tong} has moved up in the world. People say they are a {tier} tong now.', '{tong} is carrying more weight than it did. The {tier} crowd has noticed.', "{tong} has been seen at tables it wasn't asked to before.", 'More doors open for {tong} than used to.'],
  slipped: ['{tong} has lost ground. The {tier} crowd is less sure of it.', "People who used to nod at {tong} don't, any more.", '{tong} is getting fewer calls than it did.', "The {tier} crowd has stopped saving {tong} a seat."],
  new_face: ['A new name in {home}: {name}, and nobody can say who taught them.', 'Somebody in {home} has a new runner, {name}, and is not saying where from.', '{name} is new in {home}. Give it a month.'],
  same_door: ['{tong} had people at the same door as yours in {home}.', "Somebody saw {tong} and your crew after the same job in {home}. Nobody says who blinked.", "{tong} wanted the same work in {home} as you did. It happens."],
  folded: ['{tong} has shut its front room.', 'The lights at {tong} are out for good, they say.', '{tong} is done. People are already asking who has its names.'],
  went_free: ['{name} is out of work. {tong} has no use for a runner any more.', '{name} left {tong} with a bag and no plan.'],
  formed: ['A new tong in {home}: {tong}, and {name} is behind it.', '{name} has put a name over a door in {home}: {tong}.'],
  cold_shoulder: ['{tong} has stopped nodding at us in the street.', "{tong} will remember who took their runner."],
  warm_nod: ['{tong} has been saying decent things about us.', "People at {tong} nod at us now. It counts."],
  your_name: ['People have started saying your name in {home}.', 'Somebody in {home} asked about your crew by name.', 'Your name came up in {home} today. Nobody said it was bad.'],
  // C4 threads: one story told in up to three beats (decline, founding, rise). Talk, never results.
  decline_begin: ['{tong} has given up a hall. People are watching to see whether it stops there.', '{tong} let a hall go this week. Nobody says why.', 'One of the halls {tong} used to keep has gone dark.'],
  decline_middle: ['{tong} is taking any work it can get now, and not asking who pays.', 'Word is {tong} has started saying yes to jobs it would have laughed at.', 'People in {home} say {tong} will take anything this month.'],
  decline_folded: ['It ended the way people said it would: {tong} has shut its doors.', '{tong} could not stop the slide. Its front room is empty.', 'The last hall {tong} was holding on to is gone. That is the end of {tong}.'],
  decline_recovered: ['{tong} has stopped sliding. People were wrong to write it off.', 'The lights at {tong} are steady again.', '{tong} is back on its feet. Nobody is calling it finished now.'],
  founding_begin: ['Somebody has hung a lantern over a door in {home}: {tong}. That is {name}\'s doing.', '{tong} is new in {home}. {name} is the face of it.', 'A new sign in {home}: {tong}, and {name} is the reason.'],
  founding_middle: ['{tong} has a front room in {home} and is keeping it open.', 'The door at {tong} stays open after dark now.', '{tong} is more than a rumour in {home}. It has a room, and a kettle.'],
  founding_end: ['{name} has joined {tong}. It is not just a sign over a door any more.', '{tong} has a name from outside now: {name}.', 'They say {name} went to {tong}, and not for the money.'],
  rise_begin: ['{tong} is a {tier} tong now, and acting like it.', 'The {tier} crowd is talking about {tong}. Not all of it kindly.', '{tong} has grown a hall and people have noticed.'],
  rise_end: ['With {tong} climbing, people say it is picking up names. {name} is the latest.', "{tong} is making offers to other tongs' people. {name} took one.", 'The talk is that {tong} has money to spend on runners. {name} said yes.'],
  // Names you let go (C4.3): the street still remembers whose they were.
  former_signed: ['{name}, one of yours once, has signed with {tong}.', 'You will remember {name}. {tong} has them now.', '{name} is at {tong} these days. One of yours, once.'],
  former_tier: ['{name}, one of yours once, has stepped up a level.', 'Bigger work is coming to {name} now. You may remember them.', 'Someone you let go is moving up: {name}.'],
  former_fame: ["People are saying {name}'s name more than they did. One of yours, once.", '{name}, who used to work for you, is a bigger name than they were.', '{name} is getting known. Not for your sake, but you were there first.'],
  former_free: ['{name}, one of yours once, is out of work.', '{name} is between tongs again. You know the name.', 'Nobody holds {name} now. They used to be yours.'],
  // C5: the Monday lead when the Book is published (the Anchor's slate), counted in the three lines.
  book_up: ["The Anchor's slate is up. Half the street read it before the tea was poured.", "The Anchor's slate is up in Old Town, and the elders are already arguing over it.", "The Anchor's slate is up. Somebody will not like what the chalk says."],
  your_tier: ["They're calling yours a {tier} tong now. Somebody had to say it first.", 'The {tier} crowd has started to nod at your tong.', 'Your tong carries further than it did. People say {tier}.'],
};

/** Fill a template. Pure formatting; the key choices live in core/rivals.js. */
export const fill = (template, vars) => template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
/** One of rivalView's word entries as a line. The variant comes from the entry's own text, so it is stable. */
export function wordLine(entry) {
  const variants = WORD_TEXT[entry.kind] ?? [];
  if (!variants.length) return '';
  // `v` is a letter key from the view (a, b, c...); without one, a stable pick from the entry's own text.
  const seed = entry.v ? entry.v.charCodeAt(0) - 97 : [...`${entry.tong ?? ''}${entry.name ?? ''}${entry.kind}`].reduce((n, c) => n + c.charCodeAt(0), 0);
  return fill(variants[seed % variants.length], entry);
}

// Names a rival's runner never takes: canon people (WORLD.md), so nobody reads as one of them.
export const RESERVED_NAMES = ['Fung', 'Siu', 'Tang', 'Mak', 'Lo', 'Chow', 'Kwok', 'Ip', 'Tse', 'Ho', 'Lim', 'Po', 'Pang', 'Poon', 'Okonkwo', 'Rao', 'Szeto', 'Leung', 'Sarr', 'Pryce', 'Mila', 'Mateo', 'Prakash', 'Gurung', 'Zainab', 'Binta', 'Meena', 'Edith', 'Lourdes', 'Tariq', 'Wai-chiu', 'Joss'];

// A client's passing remark that a tong wanted this job (flavour; no effect). {client} {tong}.
export const CLIENT_RIVAL_TEXT = [
  '{client} mentions that {tong} wanted this one. "I would rather you."',
  '"{tong} asked about this," says {client}. "I did not like their answer."',
  '{client} lets slip that {tong} put in for the work first. It is yours now.',
];
// The same remark when the tong's real state is known (C4.1): a tong that is busy, or stretched. No digits.
export const CLIENT_RIVAL_MOOD_TEXT = {
  busy: [
    '{client} says {tong} would have taken this, but they have more work than hands right now. "So, you."',
    '"{tong} is overbooked," says {client}. "That is your luck."',
  ],
  stretched: [
    '{client} says {tong} would have been the first call once. "They are stretched now."',
    '"I used to give this to {tong}," says {client}. "I am not sure they are up to it any more."',
  ],
};
/** The remark for one job: the variant comes from the job's own id, so it never changes. `mood` is 'busy' or 'stretched' when the tong's state is known. */
export function clientRivalLine({ client, tong, jobId, mood = null }) {
  const seed = [...String(jobId)].reduce((n, c) => n + c.charCodeAt(0), 0);
  const list = CLIENT_RIVAL_MOOD_TEXT[mood] ?? CLIENT_RIVAL_TEXT;
  return fill(list[seed % list.length], { client, tong });
}

// Word kinds by how Monday treats them (C4.4): a story continuing, a name of ours, or ordinary talk.
export const THREAD_CONTINUES = ['decline_middle', 'decline_folded', 'decline_recovered', 'founding_middle', 'founding_end', 'rise_end'];
export const BOOK_LEAD = 'book_up';
export const FORMER_KINDS = ['former_signed', 'former_tier', 'former_fame', 'former_free'];

// Scouting and signing (C3b). {op} the scout, {name} the name they watched.
export const SCOUT_TEXT = {
  sent: { subject: '{op} is watching {name}', body: '{op} is out for two days to see what {name} can really do.' },
  ok: { subject: '{op} is back: a better look at {name}', body: '{op} came back with a better look at {name}. It is on their page now.' },
  miss: { subject: '{op} is back: nothing on {name}', body: '{op} lost {name} in the crowd and learned nothing. Another try would cost two more days.' },
  gone: { subject: '{op} is back: {name} has moved on', body: '{op} got there too late. Somebody else had already signed {name}.' },
};
export const POTENTIAL_TEXT = {
  peaked: "They've hit their wall. More comes slow from here.",
  close: "They're nearly at their wall.",
  legend: 'Could be one of the best Lantern Bay has ever had.',
  special: 'Could be top-tier, the kind a crew builds its biggest jobs around.',
  strong: 'Will grow into the hard jobs, given the work.',
  some: 'A steady pair of hands, but the big jobs will always be a stretch.',
};
export const SCOUT_LEVEL_TEXT = {
  none: "We only know what the street says. A scout trip would show their stats.",
  seen: 'A first look. First looks can be wrong about how far they will go.',
  sharper: 'A fair read of how far they will go, though it could be a point off.',
  full: 'A sure read.',
};
export const SIGN_REASON = {
  head: "A head doesn't leave their tong.",
  no_bed: 'No free bed in any hall.',
  no_cash: 'Not enough cash for the signing fee and any buyout.',
  not_yet: "Not yet. Our name doesn't carry far enough for them.",
  gone: 'Somebody else has signed them.',
};
export const SCOUT_DAYS_TEXT = '2d · 1 runner';

// --- C5, the Anchor's Book (DESIGN.md 2026-11-09 "C5: the Anchor's Book"; WORLD.md "The Anchor's Book") ---
// The street's opinion of the city's runners, chalked monthly: built from what is public (fame, form, age) plus
// a lasting bias and a small monthly wobble, never from the hidden rating. Letters, no numbers. Numbers are tuning.
export const BOOK = {
  grades: ['S', 'A', 'B', 'C', 'D'],
  caps: { S: 3, A: 5, B: 6, C: 6, D: 5 }, // 25 names at most
  listSize: 25,
  thresholds: { S: 43, A: 34, B: 25, C: 17, D: 10 }, // street score needed for a grade (caps then push the overflow down)
  famePoints: { unknown: 0, known: 14, respected: 30, elite: 46, legend: 60 },
  formWeight: 3,
  ageTrend: [[24, 4], [34, 0], [44, -3], [99, -7]], // [up to this age, points]
  biasSpread: 7, // a runner's lasting bias, from -spread to +spread (hashRng 'book-bias:' + runnerId)
  styleSkew: { loud: 4, quiet: -4, corporate: 0, street: 0 }, // loud tongs are overrated, quiet ones underrated
  fameSkew: { unknown: 0, known: 0, respected: 1, elite: 3, legend: 3 }, // and the better known, the more
  wobble: 3, // a monthly +/- (hashRng 'book:' + absMonth + ':' + runnerId)
  watchMax: 5, prospectAge: 24, goneMax: 3,
};

export const BOOK_TEXT = {
  moves: { up: 'Up', down: 'Down', new: 'New', returns: 'Back', steady: 'Steady' },
  // Joss, once per Book, if one of ours went up, reached S, or is down as one to watch. First pass for the owner to rewrite.
  joss: {
    subject: "The Anchor's slate is up",
    intro: "The Anchor elders chalked their slate this morning. It's their opinion, not the truth, but people read it.",
    up: '{op} moved up.',
    top: '{op} is chalked S. Expect people to start asking about them.',
    watch: 'The elders have {op} down as one to watch.',
  },
  // Added to a rival's offer when the runner was on the slate (wording only: the odds do not read the Book).
  poachNote: 'The slate put a target on them.',
  empty: "The Anchor hasn't chalked a slate yet. The elders do it on the first Monday of the month.",
  note: "The Anchor's elders chalk this once a month. It's their opinion, not the truth: it flatters some, misses others. Scouting is how you know.",
};
