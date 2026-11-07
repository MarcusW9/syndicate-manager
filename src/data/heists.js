// Heists (DESIGN.md 2026-11-07, Phase 3 part A; plan in drafts/PROPOSAL-phase-3.md). A heist is a
// big score with prep jobs, each of which changes the finale in a way its plan shows. Content only;
// the rules are in core/heists.js.
//
// Slice A1 builds both heists from existing jobs as stand-ins (owner, 2026-11-07): Madam Rao's is
// the first, the end of the early game and gentler (offered at reputation 15, Casino Con at threat
// 3, prep can bring it to 2); Mr. Szeto's is mid-game content (three halls and reputation 60,
// Penthouse Heist at threat 5). Their own stories are written later (Black Sun, slice A2). The
// text here is a first draft for the owner to rewrite.
//
// A heist: { id, name, contact (a client id), gate: { rep, halls }, finale: templateId,
//   threatDelta (the finale's threat against its template), pay (the finale's pay before trust),
//   weeks (offer to the finale's last day; the finale's own week is the last one),
//   intro (the contact's message), finaleLine (the message when the finale is on the board),
//   prep: [{ id, templates: [first ask, the retry], line (what it's for), effect, shows (what the
//   finale's plan says once it's done) }] }.
// An effect is one of: { threat: -1 } (the finale one step less dangerous), { drop: crisisId }
// (that crisis can't come up), { intel: 'source' } (intel on every roll of the finale, as an info
// task gives: core/sidetasks.js INTEL_BONUS), { pay: 0.2 } (the score is worth 20% more).

export const HEIST_RULES = {
  fixerShare: 0.4, // buying a failed step from a fixer: this share of that step's pay
  retries: 1, // a failed or walked-away step is asked once more, with its second template
  retryBefore: 2, // ... if at least this many days are left before the finale's week
  rep: 5, // reputation for finishing the finale, on top of the job's own
};

export const HEISTS = [
  {
    id: 'raoTable',
    name: 'The Big Table',
    contact: 'rao',
    gate: { rep: 15, halls: 1 },
    finale: 'casino',
    threatDelta: 1,
    pay: 11000,
    weeks: 3,
    intro: "Madam Rao closes her fan. \"The baccarat room over Glow Street is taking a friend of mine for everything. In three weeks the room plays its biggest night, and I want you at the table. Do me three small things first, beta, and the night will be kinder to you.\"",
    finaleLine: "Madam Rao's big night is on the board. What you did for her is in the plan.",
    prep: [
      { id: 'faces', templates: ['ledger', 'chrome'], line: 'Her ledger names everyone who plays that night', effect: { intel: "Madam Rao's ledger" }, shows: 'Intel: +1 on every roll' },
      { id: 'pitBoss', templates: ['quiet_table', 'fitting_room'], line: 'A quiet room, and the pit boss learns his price', effect: { drop: 'pit_boss' }, shows: "The pit boss won't be watching the table" },
      { id: 'reader', templates: ['courier', 'chrome'], line: "The card reader's drive, carried across town", effect: { threat: -1 }, shows: 'Danger one step lower' },
    ],
  },
  {
    id: 'szetoTower',
    name: 'Seventy-One Floors',
    contact: 'szeto',
    gate: { rep: 60, halls: 3 },
    finale: 'penthouse',
    threatDelta: 0,
    pay: 28000,
    weeks: 3,
    intro: "Mr. Szeto doesn't sit down. \"A man I do business with keeps his vault seventy-one floors up. In three weeks he flies to Singapore for three nights. Prepare properly. I don't pay for improvisation.\"",
    finaleLine: "Mr. Szeto's three nights are on the board. What you prepared is in the plan.",
    prep: [
      { id: 'face', templates: ['access_window', 'relay_cover'], line: 'A registered face for the service lift', effect: { drop: 'facial_scan' }, shows: "The lift's face scanner won't stop them" },
      { id: 'power', templates: ['relay_cover', 'access_window'], line: 'The backup power, watched on the night', effect: { threat: -1 }, shows: 'Danger one step lower' },
      { id: 'plans', templates: ['data_pull', 'access_window'], line: "The tower's floor plans", effect: { intel: "the tower's plans" }, shows: 'Intel: +1 on every roll' },
    ],
  },
];

export const heistById = (id) => HEISTS.find((h) => h.id === id) ?? null;
