// Fame and standing (renown slice 3, 2026-11; plan in drafts/PROPOSAL-runner-renown.md sections
// 2.4 and 2.5). Declarative numbers and words; core/fame.js applies them. Fame and standing never
// touch a roll, pay, heat or the planning read.
//
// Fame climbs one tier at a time: unknown, known, respected, elite. Legend (slice 5) comes only
// from a defining job; this slice shows how close someone is ("ready for their moment").

export const FAME_TIERS = ['unknown', 'known', 'respected', 'elite'];
export const FAME_NAMES = { unknown: 'Unknown', known: 'Known', respected: 'Respected', elite: 'Elite', legend: 'Legend' };

export const FAME_RULES = {
  known: { jobs: 6 },
  respected: { activeWeeks: 6, atLevel: 10 },
  // Lifers swap the at-level count for jobs. atLevel was 20 and liferJobs 40 (proposal 2.4) until
  // the owner's target (2026-11-03): first Elite around week 20-30, one or two by week 52. At 20,
  // careful crews had an Elite in week 12 and four by week 52 (docs/design/2026-11.md).
  elite: { activeWeeks: 12, atLevel: 60, liferJobs: 120, standing: 40 },
  // Shown as progress only in this slice; Lifers are exempt from the at-level count. atLevel was 40,
  // raised with Elite's so Legend still asks for more (twice Elite, like the paths).
  legend: { activeWeeks: 26, atLevel: 120, tier: 'veteran' },
};

// Elite lapses to respected after this many Sundays in a row with standing under `below`.
export const ELITE_LAPSE = { below: 20, sundays: 2 };

// How the street rates them now, 0-100. Not a roll modifier.
export const STANDING = {
  atLevel: 6, // a completed job at their level
  belowLevel: 2, // a completed job below it
  carry: 3, carryMax: 9, // each hard call that held, up to this much a job
  milestone: 4, // each milestone earned on the job
  lost: -5, // the job was lost or aborted
  retreat: -3, // the crew pulled back from a fight
  seriousInjury: -10, // came back with a serious or critical wound
  benchHealthy: -4, benchInjured: -2, // a Sunday with no job that week
};
export const STANDING_START = 0; // a runner who has never worked
export const STANDING_WORDS = [[70, 'At their peak'], [40, 'Steady'], [20, 'Fading'], [0, 'Washed-up']];

// Messages. {op} is the runner's handle, {name} their full name, {path} their path's name.
// First-pass wording for the owner to rewrite.
export const ELITE_TEXT = {
  ghost: { subject: '{op} is Elite', body: 'People talk about jobs {name} was on, and can never say who did them. Elite now: a Ghost.' },
  enforcer: { subject: '{op} is Elite', body: 'The street knows {name} by reputation: when it turns into a fight, they finish it. Elite now: an Enforcer.' },
  earner: { subject: '{op} is Elite', body: '{name} has been on enough of the big ones that clients ask whether they\'re coming. Elite now: an Earner.' },
  iron: { subject: '{op} is Elite', body: '{name} keeps walking out of jobs that should have put them in the clinic. The street has noticed. Elite now: Iron.' },
  lifer: { subject: '{op} is Elite', body: '{name} has been at it longer than most crews last. Elite now: a Lifer.' },
};
export const ELITE_BACK = { subject: '{op} is Elite again', body: '{name} has the street talking again. Back to Elite.' };
export const ELITE_LOST = { subject: '{op} has lost their edge', body: 'Two weeks without the work to back it up, and the street has stopped saying {name}\'s name. Respected, no longer Elite. They can win it back.' };
export const FAME_HISTORY = {
  known: 'people on the street know the name now',
  respected: 'respected on the street',
  elite: 'Elite ({path})',
  eliteBack: 'Elite again ({path})',
  eliteLost: 'lost Elite: respected now',
};
export const ELITE_HIGHLIGHT_WEIGHT = 80; // proposal 2.10: legend 100, elite 80

// --- Fame's payoffs (renown slice 4, 2026-11-04). None touches a roll or the planning read. ---

// Named offers: once a week, a 20% chance a new client job asks for an Elite by name (standing
// 50+; the highest standing if several). Sent with them on the job (any role), it pays +15%.
// Without them it's an ordinary job at its ordinary pay.
export const NAMED_OFFER = { chance: 0.2, standing: 50, payBonus: 0.15 };
export const NAMED_TEXT = {
  chip: 'Asks for {op}',
  bonus: '+{pct}% if {op} goes',
  subject: '{client} wants {op}',
  body: '{client} has work, and they asked for {name} by name. Send them and it pays {pct}% more. Without them it\'s a normal job.',
  report: '{client} asked for {op} by name: +{pct}% pay.',
};

// The fame pay ask (proposal review decision 2, owner's numbers 2026-11-04): on first becoming
// Elite, a 35% chance they ask for more. Greedy runners ask more often, loyal ones less. The ask
// is today's wage times one of `steps`, picked at random. It's the usual pay-rise message
// (core/renewals.js): accept, haggle or refuse (refusing makes them unhappy for four weeks).
export const FAME_RAISE = { chance: 0.35, greedy: 1.5, loyal: 0.5, steps: [1.1, 1.15, 1.2, 1.25, 1.3] };
export const FAME_RAISE_TEXT = {
  subject: '{op} knows what Elite is worth',
  body: 'The street talks about {name} now, and so do other crews. On {current} a week; asking for {ask}.',
};

// Recruits: with an Elite on the crew, better people come looking (proposal 2.6). The usual
// weights are in core/recruits.js QUALITY (rookie 50, pro 38, veteran 12).
export const ELITE_RECRUIT_WEIGHTS = { rookie: 42, pro: 42, veteran: 16 };
