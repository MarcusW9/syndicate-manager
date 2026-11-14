// Earned traits: what happens to people on the job changes them (core/earned.js). The owner's
// list, 2026-10-26: group 1 (12, from the job record) and group 2 (8, from crisis situations,
// data/situations.js). The rest are in drafts/earned-traits-backlog.md, waiting on new systems.
//
// kind: 'lasting' (kept for good) | 'temporary' (fades; at most two at once, the newest
// replacing the oldest). icon: ui/icons.js key for its chip on the runner's page; setback: drawn
// as a setback (red). crew_anchor is shown to the player as a Synergy (2026-11-03). desc is
// what the profile shows; {district}, {client} and {partner} are filled from where it was earned. note is Joss's inbox line; history goes on the profile.

export const EARNED_TRAITS = {
  steady_under_fire: {
    name: 'Steady Under Fire', kind: 'lasting', icon: 'cool',
    desc: '+1 cool once someone else on the job has been hurt.',
    note: 'When things went bad, {op} got quieter. Useful, provided quiet does not become empty.',
    history: 'Held the crew together when jobs turned violent.',
  },
  clinic_hands: {
    name: 'Clinic Hands', kind: 'lasting', icon: 'medkit',
    desc: 'Once a job, gets a lightly hurt crewmate back a day sooner.',
    note: '{op} has stopped asking where the clean bandages are, and just reaches for them.',
    history: 'Learned to keep crewmates working with limited supplies.',
  },
  clean_professional: {
    name: 'Clean Professional', kind: 'lasting', icon: 'flame',
    desc: 'Once a job, a failed roll of theirs draws one less heat.',
    note: 'Ten jobs and nobody has put their face on a board. That is harder than it sounds.',
    history: 'Completed ten jobs without drawing attention to the crew.',
  },
  ghost_driver: {
    name: 'Ghost Driver', kind: 'lasting', icon: 'piloting',
    desc: '+1 piloting in escapes; a clean getaway at the wheel sheds a point of the heat it would cost.',
    note: 'Five clean exits, no scraped paint and nobody remembering the plate. We might be getting good at this.',
    history: 'Built a reputation for leaving trouble without a trace.',
  },
  scarred: {
    name: 'Scarred', kind: 'lasting', icon: 'scar',
    desc: '+1 cool when someone is hurt or squaring up; injuries take a day longer to heal.',
    note: '{op} made it through. We should remember that surviving something and escaping it are not the same.',
    history: 'Survived a critical wound and carried the scars forward.',
  },
  crew_anchor: {
    name: 'Synergy', kind: 'lasting', icon: 'person',
    desc: '+1 cool on jobs with {partner}; shaken (−1 cool) for a job after {partner} is critically hurt.',
    note: '{op} and {partner} have learned each other\'s pauses, bad habits and emergency signals. That is almost trust.',
    history: 'Formed a dependable partnership with {partner}.',
  },
  shaky: {
    name: 'Shaky', kind: 'temporary', icon: 'wave', setback: true,
    desc: '−1 cool, and another −1 when sent alone on side work. Fades after three clean jobs.',
    note: '{op}\'s hands are still shaking when nobody is watching. We are watching.',
    history: 'Came too close and struggled to settle afterwards.',
  },
  riding_high: {
    name: 'Riding High', kind: 'temporary', icon: 'rise',
    desc: '+1 on their first roll of each job. Fades after a failed roll or a week without work.',
    note: 'Three clean jobs and {op} has started walking faster. Let us spend the confidence before it becomes stupidity.',
    history: 'Entered a run of clean work with confidence to spare.',
  },
  district_rhythm: {
    name: 'District Rhythm', kind: 'temporary', icon: 'pin',
    desc: '+1 on their first roll of a job in {district}, −1 on their first roll anywhere else. Fades after two jobs elsewhere.',
    note: '{op} knows when the shutters open and which alleys flood. Elsewhere, {op} keeps looking the wrong way.',
    history: 'Fell into the working rhythm of {district}.',
  },
  known_face: {
    name: 'Known Face', kind: 'temporary', icon: 'eye',
    desc: '−1 stealth and +1 social in {district}. Fades after two weeks without trouble there.',
    note: 'People there know {op}\'s face now. Some smile, some reach for the shutters. Both count.',
    history: 'Became recognisable after repeated trouble in {district}.',
  },
  second_wind: {
    name: 'Second Wind', kind: 'temporary', icon: 'heart',
    desc: 'Once a job, shrugs off being hurt for one roll. Used up after three times.',
    note: '{op} keeps finding something after the tank reads empty. There will still be a bill later.',
    history: 'Learned to push through when a job should have beaten them.',
  },
  client_favourite: {
    name: 'Client\'s Favourite', kind: 'temporary', icon: 'coin',
    desc: '+1 trust from {client}\'s jobs they work. Fades if one of those jobs goes wrong, or after five jobs for others.',
    note: '{client} considers {op} a favourite now.',
    history: 'Became a preferred operative of {client}.',
  },

  // Group 2: these read what kind of situation a crisis is (crisis.situations).
  light_fingered: {
    name: 'Light-Fingered', kind: 'lasting', icon: 'stealth',
    desc: '+1 stealth getting into or out of somewhere secured (not in a chase).',
    note: 'Four locked places, four quiet exits. We have stopped asking how {op} opened the doors.',
    history: 'Learned to enter secured places without leaving a story behind.',
  },
  crowd_reader: {
    name: 'Crowd Reader', kind: 'lasting', icon: 'social',
    desc: '+1 social with a crowd or witnesses around.',
    note: '{op} is learning that a crowd moves before it speaks. Watching the shoulders helps.',
    history: 'Learned to read a crowd before it turned.',
  },
  wirewise: {
    name: 'Wirewise', kind: 'lasting', icon: 'tech',
    desc: '+1 tech on street hardware (not corporate systems).',
    note: 'Give {op} burnt wiring and three incompatible parts, and apparently we have a working machine.',
    history: 'Became skilled at repairing cheap and salvaged technology.',
  },
  corner_fighter: {
    name: 'Corner Fighter', kind: 'lasting', icon: 'combat',
    desc: '+1 combat in a fight once someone on the crew is hurt.',
    note: '{op} fights better when someone is standing behind. We know where to put {op} now.',
    history: 'Learned to hold ground while others escaped.',
  },
  rattled_by_sirens: {
    name: 'Rattled by Sirens', kind: 'temporary', icon: 'siren', setback: true,
    desc: '−1 cool when the Harbour Police are involved. Fades after facing them down twice.',
    note: 'A siren went past the safehouse and {op} stopped talking. We have heard louder silences.',
    history: 'Struggled around Harbour Police after being detained.',
  },
  short_fuse: {
    name: 'Short Fuse', kind: 'temporary', icon: 'bolt',
    desc: '+1 combat once it turns ugly, −1 social trying to stop it. Fades after three jobs without a fight. A third time, and it sticks: they become a Hothead.',
    note: '{op} is arriving angry and waiting for events to justify it. That order concerns us.',
    history: 'Became quick to escalate after repeated confrontations.',
  },
  burned_out: {
    name: 'Burned Out', kind: 'temporary', icon: 'battery', setback: true,
    desc: '−1 tech and cool, and −1 more on neural work. Fades after three days of proper rest.',
    note: 'Memory stutter, flat voice, headache behind the eyes. We are calling this downtime before {op} calls it normal.',
    history: 'Pushed failing hardware until their own nerves pushed back.',
  },
  overconfident: {
    name: 'Overconfident', kind: 'temporary', icon: 'star',
    desc: '+1 on hard rolls (difficulty 6+), −1 on the safest option, which they think beneath them. Fades after a failed roll or an injury.',
    note: 'Four hard calls went {op}\'s way. {op} has started treating caution like a personal insult.',
    history: 'Mistook a run of difficult successes for invulnerability.',
  },
};
