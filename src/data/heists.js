// Heists: multi-job scores whose preparation changes the finale.
// Rules live in core/heists.js. (DESIGN.md 2026-11-07; plan in drafts/PROPOSAL-phase-3.md.)
//
// These finales currently use existing mission templates.
// Keep template IDs and crisis IDs aligned with those templates.
//
// Text: the owner's rewrite (2026-11-07). Madam Rao's prep jobs are her own six, written for the
// heist (data/missions/theguestcopy.js and the rest, heistOnly). Mr. Szeto's still use stand-ins.
//
// A heist: { id, name, contact (a client id), gate: { rep, halls }, finale: templateId,
//   threatDelta (the finale's threat against its template), pay (the finale's pay before trust),
//   weeks (offer to the finale's last day; the finale's own week is the last one),
//   independent (optional: the target belongs to no named faction, so the finale adds no gang
//   grudge even when its template is against one), exclude (optional: crises of the template that
//   don't fit this heist's target, kept out of the finale's draw and not shown as prep),
//   intro (the contact's message), finaleLine (the message when the finale is on the board),
//   prep: [{ id, templates: [first ask, the retry], line (what it's for), effect, shows (what the
//   finale's plan says once it's done), fixer (optional: { label, description, confirmation },
//   the words for buying it) }] }.
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
    // An independent casino in the Night Market (owner, 2026-11-07): the crew's first big score,
    // not a declaration of war. Casino Con's Red Lantern grudge, and its crisis naming the owner as
    // a Red Lantern, stay with the ordinary job.
    independent: true,
    exclude: ['triad_owner'],
    intro:
      'Madam Rao sets a casino counter beside your tea. "A friend keeps losing upstairs. Now he is borrowing downstairs to pay for it. In three weeks, that room holds its biggest night. I want some of its money leaving with us, beta. Three things would help. We can still go without them; I would rather we did not."',
    finaleLine:
      'Madam Rao slides the casino counter back across the table. "Tonight, beta. What we managed to arrange is in the plan. Read it before you choose who goes."',
    prep: [
      {
        id: 'faces',
        templates: ['the_guest_copy', 'after_the_applause'],
        line: 'Build a verified briefing on the guests, staff and service routes.',
        effect: { intel: "Rao's casino briefing" },
        shows: 'Casino briefing secured: +1 on every finale roll',
        fixer: {
          label: 'Buy a verified casino briefing',
          description: 'Another operator can assemble the guest notes, staff timings and service routes through their own contacts.',
          confirmation: 'Rao checks the delivered briefing and confirms it is current. The casino intel is ready.',
        },
      },
      {
        id: 'pitBoss',
        templates: ['an_old_account', 'someone_to_cover'],
        line: 'Arrange the pit boss’s confirmed absence during the score.',
        effect: { drop: 'pit_boss' },
        shows: 'Pit boss diverted: his crisis cannot appear',
        fixer: {
          label: 'Arrange the pit boss’s absence',
          description: 'A broker can secure an outside appointment and approved shift cover for the required window.',
          confirmation: 'Rao receives the appointment and approved-cover confirmations. The pit boss will be elsewhere.',
        },
      },
      {
        id: 'reader',
        templates: ['service_included', 'manual_handling'],
        line: 'Secure a maintenance window that slows linked alerts and coordination.',
        effect: { threat: -1 },
        shows: 'Maintenance window secured: danger one step lower',
        fixer: {
          label: 'Secure a maintenance window',
          description: 'A specialist can supply compatible equipment and arrange an approved service slot through another contractor.',
          confirmation: 'Rao receives the accepted service booking. Linked alerts will require manual handling during the score.',
        },
      },
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
    intro:
      'Mr. Szeto places a tower photograph on the desk, face down. "A business associate keeps something of mine in his penthouse vault. Seventy-one floors up. In three weeks, he leaves the city for three nights." He rests one finger on the photograph. "Prepare the lift, the power and the route. I am paying for a retrieval, not a story about why it failed."',
    finaleLine:
      'Mr. Szeto sends a departure confirmation and nothing else. A second message follows: "The penthouse is empty. The building is not. Check your plan."',
    prep: [
      {
        id: 'face',
        templates: ['access_window', 'relay_cover'],
        line: 'Arrange a registered service identity for the crew’s lift access. The scanner needs to recognise someone it expects.',
        effect: { drop: 'facial_scan' },
        shows: 'Service identity registered: facial-scan crisis cannot appear',
      },
      {
        id: 'power',
        templates: ['relay_cover', 'access_window'],
        line: 'Arrange cover at the backup-power controls. If the tower switches supply, someone needs to keep it from closing your route.',
        effect: { threat: -1 },
        shows: 'Backup-power cover arranged: danger one step lower',
      },
      {
        id: 'plans',
        templates: ['data_pull', 'access_window'],
        line: 'Get the current floor plans, including service routes and alterations. Szeto’s copy predates the owner’s last renovation.',
        effect: { intel: "the tower's current floor plans" },
        shows: 'Current floor plans secured: +1 on every finale roll',
      },
    ],
  },
];

export const heistById = (id) => HEISTS.find((h) => h.id === id) ?? null;
