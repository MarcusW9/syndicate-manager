// Older lines, tagged and tiered so nothing written so far is lost. Merge with the batch-1 files in steps 2 and 3.
// Sources: the 14 current ORIGINS not carried into backstories-batch-1, the 39 usable lines from the first
// (untagged) backstory list, and the 12 current PERSONALITIES split into temperament + habit.
// Edits on intake: "until he saw too much" -> "until they saw too much"; "in Mong Kok" -> "in {district}"
// (real place); the second "minibus driver" line dropped (duplicate); some lines given a {district}.

export const ORIGINS_OLD = {
  medic: [
    { text: 'Struck-off vet who now patches people up in a back room in {district}.', tags: ['warm', 'wary'], tier: 'common' },
    { text: 'Dropped out of medical school to pay off a family debt.', tags: ['money', 'warm'], tier: 'common' },
    { text: 'Spent five years working the night shift in an underground wetware clinic.', tags: ['chrome', 'calm'], tier: 'common' },
    { text: 'Grew up in a family of traditional herbalists who hated cyberware.', tags: ['superstitious', 'wary'], tier: 'uncommon' },
    { text: 'Ex-lab technician who stole a crate of experimental processors to pay rent.', tags: ['money', 'chrome'], tier: 'uncommon' },
  ],
  muscle: [
    { text: 'Former Muay Thai fighter who threw one fight too many.', tags: ['money', 'haunted'], tier: 'common' },
    { text: 'Dock worker who got tired of breaking crates instead of people.', tags: ['hot'], tier: 'common' },
    { text: 'Deserted a private security firm after refusing to fire on dockworkers.', tags: ['warm', 'haunted'], tier: 'uncommon' },
    { text: 'Raised by a retired triad enforcer who taught them to keep quiet.', tags: ['calm', 'cold'], tier: 'common' },
    { text: 'Trained in a corporate boot camp before faking their own death.', tags: ['cold', 'chrome'], tier: 'rare' },
    { text: 'Grew up in the neon shadows of the container terminals in {district}.', tags: ['wary'], tier: 'common' },
    { text: 'Spent a decade working security for high-end jewel brokers.', tags: ['calm', 'money'], tier: 'common' },
  ],
  tech: [
    { text: 'Laid off from a Glass Heights bank\'s security team.', tags: ['cold', 'chrome'], tier: 'common' },
    { text: 'Forum hacking legend who finally decided to get paid for it.', tags: ['curious', 'money'], tier: 'common' },
    { text: 'Learned hardware repair by salvaging burnt-out drones from the harbour mud.', tags: ['curious', 'chrome'], tier: 'common' },
    { text: 'Spent years installing AR billboard filters before learning to hack them.', tags: ['curious', 'chrome'], tier: 'common' },
    { text: 'Ex-telecoms worker who tapped public lines to sell gossip to local tabloids.', tags: ['curious', 'money'], tier: 'common' },
    { text: 'Learned signal jamming while running an illegal rooftop radio station.', tags: ['curious', 'hot'], tier: 'uncommon' },
    { text: 'Used to route black-market power lines through the city\'s old storm drains.', tags: ['chrome', 'wary'], tier: 'common' },
    { text: 'Used to manufacture bootleg memory chips in a ventilated basement in {district}.', tags: ['chrome', 'money'], tier: 'common' },
    { text: 'Former maintenance tech for the city\'s automated street-sweeper drones.', tags: ['chrome', 'calm'], tier: 'common' },
    { text: 'Former air-traffic monitor who mapped the blind spots in city drone grids.', tags: ['chrome', 'curious'], tier: 'uncommon' },
  ],
  driver: [
    { text: 'Ex-delivery rider with three crashed scooters and no fear.', tags: ['hot'], tier: 'common' },
    { text: 'Drove for a Glass Heights executive until they saw too much.', tags: ['haunted', 'wary'], tier: 'uncommon' },
    { text: 'Ran courier packages through typhoon warnings before getting into real crime.', tags: ['hot', 'superstitious'], tier: 'common' },
    { text: 'Ex-courier who lost their leg and original job to a high-speed drone crash.', tags: ['chrome', 'haunted'], tier: 'uncommon' },
    { text: 'Used to operate grey-market ferry runs across the harbour after midnight.', tags: ['calm', 'money'], tier: 'common' },
    { text: 'Ex-smuggler who used custom underwater scooters to dodge harbour patrols.', tags: ['curious', 'chrome'], tier: 'rare' },
    { text: 'Grew up in a floating house on an old wooden fishing sampan.', tags: ['calm', 'superstitious'], tier: 'common' },
    { text: 'Used to smuggle untagged synthetic meats across the harbour border.', tags: ['money', 'wary'], tier: 'common' },
  ],
  face: [
    { text: 'Former estate agent who could sell a shoebox flat for a fortune.', tags: ['charming', 'money'], tier: 'common' },
    { text: 'Ran a mahjong parlour in {district} until the triads took it.', tags: ['charming', 'haunted'], tier: 'common' },
    { text: 'Luxury shop assistant who learned how the rich talk.', tags: ['charming', 'curious'], tier: 'common' },
    { text: 'Former casino dealer who learned to read people under harsh fluorescent lights.', tags: ['charming', 'calm'], tier: 'common' },
    { text: 'Ex-corporate wage-slave who traded high-rise air conditioning for street-level freedom.', tags: ['warm', 'chrome'], tier: 'common' },
    { text: 'Former bank teller who noticed where the corporate slush funds were hidden.', tags: ['curious', 'money'], tier: 'uncommon' },
    { text: 'Ex-pawnshop appraiser who can spot counterfeit chrome from ten paces.', tags: ['chrome', 'money'], tier: 'common' },
    { text: 'Grew up running errands for local bookies around the horse tracks.', tags: ['charming', 'money'], tier: 'common' },
    { text: 'Grew up selling cheap souvenir trinkets to tourists on the Star Ferry.', tags: ['charming', 'warm'], tier: 'common' },
    { text: 'Former street cook whose stall got cleared out by corporate developers.', tags: ['warm', 'hot'], tier: 'common' },
    { text: 'Grew up sleeping in the back of a twenty-four-hour noodle shop in {district}.', tags: ['warm'], tier: 'common' },
  ],
  infiltrator: [
    { text: 'Rooftop climber who used to post videos from the rooftops of {district}.', tags: ['hot', 'curious'], tier: 'common' },
    { text: 'Ex-cleaner who still has keycards to half of Glass Heights.', tags: ['calm', 'curious'], tier: 'common' },
    { text: 'Former cat burglar, retired twice already.', tags: ['charming', 'haunted'], tier: 'uncommon' },
    { text: 'Used to maintain neon billboards fifty storeys above the wet pavements.', tags: ['calm'], tier: 'common' },
    { text: 'Grew up in a crowded cage home high above the night markets.', tags: ['wary'], tier: 'common' },
    { text: 'Learned to pick locks while helping neighbours who lost their keycards.', tags: ['warm', 'curious'], tier: 'common' },
    { text: 'Spent years scraping barnacles and micro-drones off cargo ship hulls.', tags: ['calm'], tier: 'common' },
    { text: 'Former elevator mechanic who knows every service shaft in Glass Heights.', tags: ['curious', 'calm'], tier: 'common' },
    { text: 'Used to clean cooling towers on top of seventy-storey corporate towers.', tags: ['calm', 'chrome'], tier: 'common' },
    { text: 'Grew up in an old public housing estate in {district} slated for demolition.', tags: ['warm', 'haunted'], tier: 'common' },
    { text: 'Raised in a family-run dry cleaner that doubled as a dead-drop point.', tags: ['wary', 'curious'], tier: 'uncommon' },
    { text: 'Ex-corporate janitor who overheard three years of board-level secrets.', tags: ['curious', 'chrome'], tier: 'rare' },
  ],
};

export const TEMPERAMENTS_OLD = [
  { text: 'Quiet, watchful, and slow to trust.', tags: ['wary', 'calm'], tier: 'common' },
  { text: 'Laughs too loudly and never stops eating.', tags: ['warm', 'hot'], tier: 'common' },
  { text: 'Ambitious and blunt about it.', tags: ['money', 'hot'], tier: 'common' },
  { text: 'Polite to a fault, until the shooting starts.', tags: ['charming', 'hot'], tier: 'common' },
  { text: 'Treats the crew like family from day one.', tags: ['warm'], tier: 'common' },
  { text: 'Superstitious about absolutely everything.', tags: ['superstitious'], tier: 'common' },
];

export const HABITS_OLD = [
  { text: 'Sends money home every week and never says to who.', tags: ['money', 'warm'], tier: 'common' },
  { text: 'Keeps a small shrine in their locker and lights incense before jobs.', tags: ['superstitious'], tier: 'common' },
  { text: 'Reads cheap detective novels between jobs.', tags: ['curious'], tier: 'common' },
  { text: 'Has an opinion about every cha chaan teng in the city.', tags: ['warm', 'charming'], tier: 'common' },
  { text: 'Owes money to somebody dangerous and is trying to fix it.', tags: ['money', 'haunted'], tier: 'uncommon' },
  { text: 'Still lives with parents who think they work in logistics.', tags: ['warm', 'wary'], tier: 'uncommon' },
  { text: 'Avoids the number four and anyone wearing the wrong colour of shoes.', tags: ['superstitious'], tier: 'common' },
];
