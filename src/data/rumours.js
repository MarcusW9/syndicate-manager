// Street talk. Each Monday one weekly rumour goes round (core/rumours.js), and
// it is true: it changes that week's jobs in its district. Either
//   threat: +1 / -1  every job there is a step hotter or quieter (shown on the board), or
//   crisis: id       that district crisis is likely to come up on jobs there.
// `tag` is the short label on the job board.

export const RUMOURS = [
  // Old Town
  { id: 'ot_fire', district: 'oldTown', threat: 1, tag: 'on edge after a fire',
    text: 'Another tenement burned off Alley 9 last night. Old Town is on edge, and everyone is watching strangers.' },
  { id: 'ot_elders', district: 'oldTown', threat: -1, tag: 'thin patrols',
    text: 'The Brass Anchor elders have told the police to keep out of Old Town this week. Patrols are thin.' },
  { id: 'ot_substations', district: 'oldTown', crisis: 'ot_blackout', tag: 'blackouts likely',
    text: 'Hoi-Sing is "upgrading" Old Town\'s substations this week. Expect the lights to go out.' },
  { id: 'ot_measuring', district: 'oldTown', crisis: 'ot_shrine', tag: 'Brass Anchor watching',
    text: 'Somebody has been measuring buildings round the To Dei Gung shrine. The Brass Anchor men are stopping strangers.' },
  // The Docks
  { id: 'dk_standoff', district: 'docks', threat: 1, tag: 'tension on the road',
    text: 'The Red Lanterns and Aether-Harbour security are squaring up on the dock road. Everyone is jumpy.' },
  { id: 'dk_wedding', district: 'docks', threat: -1, tag: 'police distracted',
    text: 'Half the Wet Sleeve unit is at a wedding banquet this week. The Docks are quiet.' },
  { id: 'dk_checks', district: 'docks', crisis: 'dk_wet_sleeve', tag: 'police checks',
    text: 'Word on the waterfront: the Wet Sleeve are running neural-load checks at the dock gates all week.' },
  { id: 'dk_drone_freight', district: 'docks', crisis: 'dk_drones', tag: 'drone shipments',
    text: 'Aether-Harbour has been moving crates of security drones through the Docks. Mind what you open.' },
  // The Night Market
  { id: 'nm_collectors', district: 'nightMarket', threat: 1, tag: 'collectors about',
    text: 'Silver Fan collectors are out in force in the Night Market. Nobody is paying on time, and it shows.' },
  { id: 'nm_festival', district: 'nightMarket', threat: -1, tag: 'festival crowds',
    text: 'A temple festival is filling the Night Market: drums, crowds, and police too busy to look at anyone.' },
  { id: 'nm_feud', district: 'nightMarket', crisis: 'nm_pulse', tag: 'broker feud',
    text: 'Two data brokers are feuding in the Night Market. Keep your cheap chrome switched off.' },
  { id: 'nm_trackers', district: 'nightMarket', crisis: 'nm_tracker', tag: 'trackers in cash',
    text: 'The Silver Fan has started hiding trackers in cash cards. Check your money before you spend it.' },
  // Glass Heights
  { id: 'gh_audit', district: 'heights', threat: 1, tag: 'security audit',
    text: 'Veridian-Apex is running a security audit. In Glass Heights, every badge is getting checked twice.' },
  { id: 'gh_gala', district: 'heights', threat: -1, tag: 'gala night',
    text: 'There\'s a charity gala at the Veridian-Apex tower. Half of security is on the door, not on the floors.' },
  { id: 'gh_layoffs', district: 'heights', crisis: 'gh_wiped', tag: 'layoffs',
    text: 'Veridian-Apex is laying people off in Glass Heights. Inside contacts are getting nervous, and some are getting fired.' },
  { id: 'gh_demo', district: 'heights', crisis: 'gh_trial', tag: 'neural demo',
    text: 'Veridian-Apex is demoing a new neural enhancement in its lobby all week. Stay away from the broadcast.' },
];

// The city talks about what your crew did. {job} is the job's name.
export const REACTIONS = {
  loud: {
    oldTown: ['Old Town is talking about the noise on that {job}. The Brass Anchor elders want to know who.'],
    docks: ['Somebody made a mess of the dock road on a {job}. The Red Lanterns are asking around.'],
    nightMarket: ['The whole Night Market heard about that {job}. The Silver Fan is asking whose crew it was.'],
    heights: ['Veridian-Apex security is going through the footage from that {job}, frame by frame.'],
  },
  clean: [
    'Street talk: whoever did that {job} was a ghost. Nobody saw a thing.',
    'People are talking about that {job}. Clean in, clean out, and nobody knows who.',
    'Word is a crew did a {job} so quietly the client had to check it happened.',
  ],
};
