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
  // Lifers swap the at-level count for jobs (their own Elite asks for 40 of them).
  elite: { activeWeeks: 12, atLevel: 20, liferJobs: 40, standing: 40 },
  // Shown as progress only in this slice; Lifers are exempt from the at-level count.
  legend: { activeWeeks: 26, atLevel: 40, tier: 'veteran' },
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
