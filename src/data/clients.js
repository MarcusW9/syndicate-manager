// Recurring clients. Each offers certain job types and remembers how you treat
// them (trust 0-100, starts at 50). See core/clients.js for the rules.
//
// Adding a client is data (owner, 2026-11-07: "a system we can easily add clients"); the checklist
// is in docs/ARCHITECTURE.md "Adding a client", and tests/clients.test.js checks the entry:
//   id, name, desc, district: where they work;
//   affiliation: who they work for or belong to, or null. Nothing reads it as standing with that
//     faction: personal trust (this file), faction standing (core/gangs.js grudges) and hall access
//     (data/halls.js) are three different things, and where someone works is not who they work for;
//   jobs: the templates they offer on the board (an opening favour isn't listed here: data/halls.js
//     HALL_SITES names the client who asks it, `contact`);
//   a matching entry in data/cast.js (same id) for {id} tokens and their lines in job text.

export const CLIENTS = [
  {
    id: 'fung',
    name: 'Auntie Fung',
    district: 'oldTown',
    affiliation: 'the Brass Anchor Society',
    desc: 'Runs three herbal tea shops in Old Town and a quiet fencing business behind them. A senior elder of the Brass Anchor Society. Pays in cash, remembers everything.',
    jobs: ['clinic', 'herbal_run', 'courier', 'protection', 'kidnap', 'favourite', 'second_hand_heart', 'last_sitting', 'a_steady_hand', 'cold_chain', 'queue_duty', 'shutter_watch', 'paper_collection', 'clean_sheets', 'dry_shelf'],
  },
  {
    id: 'szeto',
    name: 'Mr. Szeto',
    district: 'heights',
    affiliation: null,
    desc: 'Property developer in Glass Heights. Wants his rivals\' secrets and doesn\'t ask how you get them. Old tenements near his sites have a habit of catching fire.',
    jobs: ['eviction', 'data_pull', 'penthouse', 'casino', 'borrowed_glory', 'access_window', 'relay_cover'],
  },
  {
    id: 'ferryman',
    name: 'The Ferryman',
    district: 'docks',
    affiliation: null,
    desc: 'Leung Ka-wai runs boats in and out of the Docks at night. Nobody has seen him on dry land in years.',
    jobs: ['container409', 'cable', 'warehouse', 'protection', 'courier', 'wrong_horse', 'low_water', 'landing_hands', 'mooring_watch'],
  },
  {
    id: 'rao',
    name: 'Madam Rao',
    district: 'nightMarket',
    affiliation: null,
    desc: 'Lends money to half the Night Market from a sari shop. Generous until you\'re late.',
    jobs: ['ledger', 'chrome', 'casino', 'kidnap', 'courier', 'paid_in_full', 'house_advantage', 'fitting_room', 'quiet_table', 'kit_return'],
  },
  {
    id: 'okonkwo',
    name: 'Ruth Okonkwo',
    district: 'amberReach',
    affiliation: 'Aether-Harbour Logistics, off the books',
    desc: 'Broker for Aether-Harbour Logistics\' off-books arm, the part that officially doesn\'t exist. Pays the best and trusts nobody.',
    jobs: ['data_scrub', 'data_pull', 'penthouse', 'warehouse', 'last_ticket', 'exit_interview', 'quiet_hours', 'clear_the_ramp', 'eyes_on_the_seal', 'count_against_paper'],
  },
  // Promoted from the street cast (owner, 2026-11-07): smaller clients with modest work of their own,
  // and the clients who ask the Night Market's and Glass Heights' opening favours (data/halls.js).
  {
    id: 'ip',
    name: 'Mrs. Ip',
    district: 'nightMarket',
    affiliation: null, // works on Silver Fan turf; isn't Silver Fan
    desc: 'Runs the fish-ball stall at the Neon Dragon and never stops talking. Deliveries, supplier disputes, missing stock: practical work where keeping people fed matters more than looking impressive. Introduced the tong to Wok Court.',
    jobs: ['closing_stack', 'crate_return', 'inspection_hours'],
  },
  {
    id: 'tse',
    name: 'Forewoman Tse',
    district: 'heights',
    affiliation: 'the Underterrace maintenance cooperative', // deals with Veridian-Apex's estate contractors; doesn't work for them
    desc: 'Tse Yuk-lan, a former maintenance forewoman who still keeps the cooperative\'s keys at the Underterrace. Contractor disputes, equipment recovery, missing records, workers caught between employers: the infrastructure beneath corporate comfort.',
    jobs: [],
  },
];
