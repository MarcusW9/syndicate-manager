// Recurring clients. Each offers certain job types and remembers how you treat
// them (trust 0-100, starts at 50). See core/clients.js for the rules.

export const CLIENTS = [
  {
    id: 'fung',
    name: 'Auntie Fung',
    desc: 'Runs three herbal tea shops in Old Town and a quiet fencing business behind them. A senior elder of the Brass Anchor Society. Pays in cash, remembers everything.',
    jobs: ['clinic', 'herbal_run', 'courier', 'protection', 'kidnap', 'favourite'],
  },
  {
    id: 'szeto',
    name: 'Mr. Szeto',
    desc: 'Property developer in Glass Heights. Wants his rivals\' secrets and doesn\'t ask how you get them. Old tenements near his sites have a habit of catching fire.',
    jobs: ['eviction', 'data_pull', 'penthouse', 'casino'],
  },
  {
    id: 'ferryman',
    name: 'The Ferryman',
    desc: 'Leung Ka-wai runs boats in and out of the Docks at night. Nobody has seen him on dry land in years.',
    jobs: ['container409', 'cable', 'warehouse', 'protection', 'courier', 'wrong_horse'],
  },
  {
    id: 'rao',
    name: 'Madam Rao',
    desc: 'Lends money to half the Night Market from a sari shop. Generous until you\'re late.',
    jobs: ['ledger', 'chrome', 'casino', 'kidnap', 'courier'],
  },
  {
    id: 'okonkwo',
    name: 'Ruth Okonkwo',
    desc: 'Broker for Aether-Harbour Logistics\' off-books arm, the part that officially doesn\'t exist. Pays the best and trusts nobody.',
    jobs: ['data_scrub', 'data_pull', 'penthouse', 'warehouse', 'last_ticket'],
  },
];
