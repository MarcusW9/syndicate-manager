// Rival offers to our runners (part D3 of drafts/PROPOSAL-phase-3.md). Numbers and wording as data;
// the rules are in core/mobility.js. Wording is a first pass for the owner to rewrite.

export const MOBILITY = {
  minRank: 'street', // rivals only approach a tong this big (owner, 2026-11-09)
  base: { rookie: 0.08, pro: 0.05, veteran: 0.025 }, // a week's chance before loyalty
  eliteMult: 0.5, legendMult: 0.1,
  loyaltyPower: 1.5, // chance x (1 - loyalty/100)^this: a loyal runner is almost never approached
  expiryDays: 7, // Joss warns a week ahead; unanswered, they go at the end of it
  raise: 1.15, // matching means their pay goes to this share of the larger of today's wage and market value
  snoozeDays: 56, // no new offer for this long after one is answered
  matchLoyalty: 5, // being fought for
  goLoyalty: -2, // the rest of the crew sees someone go
  cashCover: 4, // the buyer must hold the buyout plus this many weeks of the runner's wage
};

export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

export const POACH_TEXT = {
  subject: '{tong} wants {op}',
  body: `Joss: "{tong} has made {op} an offer: {pay} a week, and {buyout} to us for letting them go. {op} told us first, which counts for something. We've got a week. Match it and they stay, or take the money and wish them well."`,
  match: `{op} stays on at {pay} a week. They noticed we fought for them.`,
  go: `{op} has gone to {tong}. {buyout} paid to us. The crew noticed the empty bunk.`,
  lapsed: `We let the week run out, so {op} went to {tong}. {buyout} paid to us.`,
  // Added when the runner who leaves is sworn (everyone else loses loyalty, once); follows go or lapsed, so it opens on the ledger.
  soldSworn: `Their name is still in the ledger. Nobody at the table says much tonight.`,
};
