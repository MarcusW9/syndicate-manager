// Earned traits: what happens to people on the job changes them (core/earned.js). The owner's
// list, 2026-10-26; the first 12 (the ones the game can already detect and apply). The rest are
// in drafts/earned-traits-backlog.md, waiting on crisis tags or new systems.
//
// kind: 'lasting' (kept for good) | 'temporary' (fades; at most two at once, the newest
// replacing the oldest). desc is what the profile shows; {district}, {client} and {partner}
// are filled from where it was earned. note is Joss's inbox line; history goes on the profile.

export const EARNED_TRAITS = {
  steady_under_fire: {
    name: 'Steady Under Fire', kind: 'lasting',
    desc: '+1 cool once someone else on the job has been hurt.',
    note: 'When things went bad, they got quieter. Useful, provided quiet does not become empty.',
    history: 'Held the crew together when jobs turned violent.',
  },
  clinic_hands: {
    name: 'Clinic Hands', kind: 'lasting',
    desc: 'Once a job, gets a lightly hurt crewmate back a day sooner.',
    note: 'They have stopped asking where the clean bandages are. They just reach for them.',
    history: 'Learned to keep crewmates working with limited supplies.',
  },
  clean_professional: {
    name: 'Clean Professional', kind: 'lasting',
    desc: 'Once a job, a failed roll of theirs draws one less heat.',
    note: 'Ten jobs and nobody has put their face on a board. That is harder than it sounds.',
    history: 'Completed ten jobs without drawing attention to the crew.',
  },
  ghost_driver: {
    name: 'Ghost Driver', kind: 'lasting',
    desc: '+1 driving.',
    note: 'Five clean exits, no scraped paint and nobody remembering the plate. We might be getting good at this.',
    history: 'Built a reputation for leaving trouble without a trace.',
  },
  scarred: {
    name: 'Scarred', kind: 'lasting',
    desc: '+1 cool while hurt; injuries take a day longer to heal.',
    note: 'They made it through. We should remember that surviving something and escaping it are not the same.',
    history: 'Survived a critical wound and carried the scars forward.',
  },
  crew_anchor: {
    name: 'Crew Anchor', kind: 'lasting',
    desc: '+1 cool on jobs with {partner}; shaken (−1 cool) for a job after {partner} is critically hurt.',
    note: 'They have learned each other\'s pauses, bad habits and emergency signals. That is almost trust.',
    history: 'Formed a dependable partnership with {partner}.',
  },
  shaky: {
    name: 'Shaky', kind: 'temporary',
    desc: '−1 cool, and another −1 when sent alone on side work. Fades after three clean jobs.',
    note: 'Their hands are still shaking when nobody is watching. We are watching.',
    history: 'Came too close and struggled to settle afterwards.',
  },
  riding_high: {
    name: 'Riding High', kind: 'temporary',
    desc: '+1 on their first roll of each job. Fades after a failed roll or a week without work.',
    note: 'Three clean jobs and they have started walking faster. Let us spend the confidence before it becomes stupidity.',
    history: 'Entered a run of clean work with confidence to spare.',
  },
  district_rhythm: {
    name: 'District Rhythm', kind: 'temporary',
    desc: '+1 on their first roll of a job in {district}, −1 on their first roll anywhere else. Fades after two jobs elsewhere.',
    note: 'They know when the shutters open and which alleys flood. Elsewhere, they keep looking the wrong way.',
    history: 'Fell into the working rhythm of {district}.',
  },
  known_face: {
    name: 'Known Face', kind: 'temporary',
    desc: '−1 stealth and +1 social in {district}. Fades after two weeks without trouble there.',
    note: 'People there know their face now. Some smile, some reach for the shutters. Both count.',
    history: 'Became recognisable after repeated trouble in {district}.',
  },
  second_wind: {
    name: 'Second Wind', kind: 'temporary',
    desc: 'Once a job, shrugs off being hurt for one roll. Used up after three times.',
    note: 'They keep finding something after the tank reads empty. There will still be a bill later.',
    history: 'Learned to push through when a job should have beaten them.',
  },
  client_favourite: {
    name: 'Client\'s Favourite', kind: 'temporary',
    desc: '+1 trust from {client}\'s jobs they work. Fades if one of those jobs goes wrong, or after five jobs for others.',
    note: 'The client asked whether they were coming. Not the crew. Them. That can open doors and close others.',
    history: 'Became a preferred operative of {client}.',
  },
};
