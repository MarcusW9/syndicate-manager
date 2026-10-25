// The City screen: district cards, factions, street facts and history.
// Trimmed from WORLD.md for phone reading. District names live in
// config/names.js; keys match it (and DISTRICTS in ./districts.js).

/** Open districts first, then the ones that unlock later. */
export const DISTRICT_CARDS = {
  oldTown: {
    chinese: '舊城',
    side: 'Island side',
    pitch: 'The damp, ancestral heart of the city: herbal tea shops hiding favour ledgers, rusted tenements clinging to the hillside.',
    landmarks: ['Auntie Fung\'s tea shop on Alley 4', 'The Red Incense Shrine of To Dei Gung', 'The rusted iron stairwell of Tenement Block 9'],
    control: 'The Brass Anchor Society. Hoi-Sing power nodes and Ghost Circuit tunnels underneath.',
    police: 'Sporadic and corrupt. Officers come in pairs and take bribes to ignore unlicensed generators.',
    night: 'Damp concrete, burning joss paper, mahjong tiles clacking down wet alleys.',
    custom: 'A cup of bitter tea on the doorstep at midnight, for the ghosts of the 2052 blackout.',
  },
  nightMarket: {
    chinese: '夜光街',
    side: 'Island side',
    pitch: 'A neon maze of dai pai dongs, counterfeit implant clinics and alleys where fortunes go on one hand of mahjong.',
    landmarks: ['Madam Rao\'s sari shop, the Silk & Credit Emporium', 'The Neon Dragon dai pai dong', 'The third-floor mahjong parlour'],
    control: 'The Silver Fan Circle. Hoi-Sing power nodes.',
    police: 'Rarely seen and fully complicit. They take their cut at the noodle stalls and never go near the back-alley operating rooms.',
    night: 'Wok smoke, flickering holo-ads, murmuring gamblers.',
    custom: 'If a neon sign flickers three times over your head, toss a coin over your left shoulder.',
  },
  heights: {
    chinese: '玻璃山',
    side: 'Island side, on the ridge',
    pitch: 'Corporate towers, labs and clinics in filtered air. Officially renamed Apex Ridge in 2035; nobody on the street calls it that.',
    landmarks: ['Veridian-Apex Central Tower', 'The Glass-Bridge Promenade', 'Executive Spa & Neural Clinic 1'],
    control: 'Veridian-Apex BioTech.',
    police: 'None to speak of. Security drones and private guards treat anyone without a pass as a biohazard.',
    night: 'Humming air filters and glass towers in cold blue light.',
    custom: 'Never press a lift button with a bare index finger, or the lower districts\' bad karma rubs off.',
  },
  docks: {
    chinese: '霧港',
    side: 'Mainland side',
    pitch: 'A deafening sprawl of automated cranes, diesel and saltwater, where freighters unload contraband into the city.',
    landmarks: ['Pier 12 Gantry Gate', 'The Ferryman\'s night-boat landing', 'The Red Lanterns\' Warehouse 7'],
    control: 'Aether-Harbour Logistics on paper, the Red Lanterns on the tarmac.',
    police: 'Heavy. The Harbour Police "Wet Sleeve" unit runs its rackets alongside the gangs.',
    night: 'Amber floodlights in harbour fog, screeching cranes, clanking steel.',
    custom: 'Never whistle past the container stacks, or the water ghosts will trip you into the harbour.',
  },
  amberReach: {
    chinese: '琥珀坊',
    side: 'The harbour crossing',
    locked: true,
    pitch: 'The transit and money hub where the maglev meets the trams and ferries, and fixers share noodle bars with brokers.',
    landmarks: ['The Central Maglev Rotunda', 'Pearl Haven House, home to the city\'s South Asian, African and Filipino communities', 'The 24-hour Exchange Teahouse'],
    control: 'A corporate transit board under heavy Aether-Harbour influence.',
    police: 'Transit security, and plainclothes detectives hunting counterfeit passes and data runners.',
    night: 'Departure chimes, commuters with glowing optic lines, the hum of rail overhead.',
    custom: 'Buy one steamed bun at the station kiosk and leave it on the turnstile for a safe trip home.',
    teaser: 'Not open to your crew yet. Big money moves here, and someone has to vouch for you first.',
  },
  silt: {
    chinese: '泥灘',
    side: 'Mainland side, on the mudflats',
    locked: true,
    pitch: 'A sinking shanty shelf on the wreckage of the piers the 1994 typhoon destroyed. It floods twice a day at high tide.',
    landmarks: ['The Floating Timber Bridge', 'Uncle Po\'s scrap-battery yard', 'The community pump station'],
    control: 'Nobody. Mutual-aid groups and street runners.',
    police: 'None. They won\'t cross the mud without armoured transport.',
    night: 'Water lapping at rusted stilts, diesel generators, low-tide stink.',
    custom: 'Red ribbons on the door posts at high tide, so the water passes by.',
    teaser: 'Not open to your crew yet. Only one boatman goes out there at night.',
  },
  ironPeak: {
    chinese: '鐵山頂',
    side: 'The island summit',
    locked: true,
    pitch: 'Walled estates where the corp boards live, on the old foundry hill. The richest people in the city live on a hill named after the furnaces they closed.',
    landmarks: ['The Peak Funicular (last car 10pm)', 'The Slag Garden and Foundry Stack 3', 'The Peak Gate checkpoint'],
    control: 'The boards of all three megacorps, guarded by jointly contracted private security.',
    police: 'The Harbour Police need permission to go up.',
    night: 'Wind, silence, guard dogs, the orange glow of the city far below.',
    custom: 'Staff knock three times on a new estate\'s iron gate before the owners move in.',
    teaser: 'Not open to your crew yet. You\'ll need a name on the gate list.',
  },
};

export const FACTIONS = [
  { group: 'Megacorps', name: 'Aether-Harbour Logistics', where: 'The Docks, the Amber Reach', line: 'Clandestine shipping and unlogged freight. Small crews are disposable.', rumour: 'Their unmarked cargo lighters are piloted by backups of executives who died years ago.' },
  { group: 'Megacorps', name: 'Veridian-Apex BioTech', where: 'Glass Heights', line: 'Oxygen quotas and neural therapies. Sold the street its implants, now sells the cure.', rumour: 'The board\'s longevity tonics are grown on Old Town\'s waste runoff.' },
  { group: 'Megacorps', name: 'Hoi-Sing Grid & Cable', where: 'Old Town, the Night Market', line: 'The power company. Surge pricing, theft fines, battery leases.', rumour: 'It blacks out the Night Market whenever its gambling algorithms need a distraction.' },
  { group: 'Gangs', name: 'The Red Lanterns', where: 'The Docks', line: 'Road tolls and dockside rackets. Pay on time and they share the gossip.', rumour: 'Their dragon head asks a blind fortune-teller before every big hijacking.' },
  { group: 'Gangs', name: 'The Silver Fan Circle', where: 'The Night Market', line: 'Street loans, gambling and fake designer implants.', rumour: 'Lose at mahjong on the third floor and you pay with your biometric keys.' },
  { group: 'Gangs', name: 'The Brass Anchor Society', where: 'Old Town', line: 'Old Town\'s elders, keeping the developers out. Prove yourself over beef chow fun.', rumour: 'They hold debt ledgers from the blackout that could ruin any developer.' },
  { group: 'Police', name: 'Harbour Police, 4th Precinct', where: 'The Docks, the Night Market', line: 'The "Wet Sleeve" unit. Neural-load checks that end in a fine or a bribe.', rumour: 'The commander\'s office has a back door into a Red Lantern warehouse.' },
  { group: 'Wildcard', name: 'The Ghost Circuit', where: 'Under Old Town', line: 'Data liberators in the drainage tunnels, handing out free neural scrubbers.', rumour: 'Led by a single mind, five dockworkers whose implants fused in the blackout.' },
];

export const STREET_FACTS = [
  'Never take a night boat when the Ferryman is smoking a clove cigarette facing backwards.',
  'If Auntie Fung\'s tea is sweeter than usual, someone just cleared a debt, or a body went through her back room.',
  'During a Signal 8, the Glass Heights towers ground their delivery drones, and corporate supplies move by road.',
  'Madam Rao takes cash, gold or verified secrets. Pay in corporate chips and she adds a 30% bad-luck tax.',
  'Mr. Szeto\'s permits come through two days before another old tenement has an "electrical fire".',
];

export const HISTORY = [
  { year: '1970', text: 'The Reclamation Boom pushes the Docks and Old Town out into the harbour.' },
  { year: '1994', text: 'The Great Signal 10 typhoon wipes out the southern piers.' },
  { year: '2018', text: 'The Neural Integration Act puts implants into dockworkers. The first burnouts follow.' },
  { year: '2035', text: 'Corporate landlords bulldoze the ridge to build Glass Heights.' },
  { year: '2040s', text: 'The Iron Peak foundries close, and the corp boards move onto the hill.' },
  { year: '2052', text: 'The Grid Blackout: three weeks without power. Crew politics have run on favours ever since.' },
];
