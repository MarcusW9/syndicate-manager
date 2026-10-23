// Mission templates. Sample content: 3 types, 2 crises each.
// Target for the MVP is about 6 crises per type so runs don't repeat.
// Every crisis MUST include at least one exit: an 'abort' or 'extract' choice
// (enforced by core/validate.js). This is the "no death without a choice" rule.

/** @type {import('../core/types.js').MissionTemplate[]} */
export const MISSIONS = [
  {
    id: 'courier',
    name: 'Data Courier Run',
    district: 'oldTown',
    threat: 1,
    pay: 2500,
    days: 1,
    crewSize: 2,
    keyStats: ['driving', 'stealth'],
    brief: 'A shell drive needs to get across Old Town before midnight. No questions, no detours.',
    beats: [
      'The pickup is a noodle bar back room. The drive is warm, like someone just pulled it.',
      'Old Town traffic crawls. {driver} takes the alleys.',
      'Two blocks from the drop, a black van has been behind you for six turns.',
      'The drop point is a laundromat. The contact counts the cash twice.',
    ],
    crises: [
      {
        id: 'tail',
        text: 'The van is still on you. {driver} glances in the mirror: "Lose them or lead them in?"',
        focusRole: 'driver',
        choices: [
          { id: 'lose', label: 'Lose them in the alleys', kind: 'push', stat: 'driving', difficulty: 10,
            success: '{driver} cuts through a fish market and the van is gone.', failure: 'The van clips your rear. {driver} wrenches a shoulder.', failureInjury: 'light' },
          { id: 'ditch', label: 'Ditch the car, finish on foot', kind: 'adapt', stat: 'stealth', difficulty: 9, cost: { payCut: 0.2 },
            success: 'You vanish into the night crowd. The client docks you for lateness.', failure: 'You are spotted on foot and have to run.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: dump the drive and go home', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You drop the drive in a canal and drive home. Nobody follows.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'contact_nervous',
        text: 'The laundromat contact is sweating. He wants to "check the drive" in the back room.',
        choices: [
          { id: 'talk', label: 'Talk him down', kind: 'adapt', stat: 'social', difficulty: 11,
            success: 'You get him laughing. He pays and stops sweating.', failure: 'He panics and pulls a pistol. It goes off.', failureInjury: 'serious' },
          { id: 'follow', label: 'Follow him in, carefully', kind: 'push', stat: 'cool', difficulty: 12,
            success: 'It is just a scanner. He pays in full.', failure: 'Two men are waiting in the back.', failureInjury: 'serious' },
          { id: 'abort', label: 'Abort: keep the drive, walk out', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
            success: 'You back out slowly. The contact does not stop you.', failure: '', failureInjury: 'none' },
        ],
      },
    ],
    heat: 0,
  },
  {
    id: 'data_pull',
    name: 'Office Data Pull',
    district: 'heights',
    threat: 3,
    pay: 5000,
    days: 2,
    crewSize: 3,
    keyStats: ['tech', 'stealth', 'social'],
    brief: 'A mid-tier firm in Glass Heights keeps its payroll offline. Get it, copy it, leave no trace.',
    beats: [
      'You go in as night cleaners. {face} handles the front desk.',
      '{tech} finds the server room behind a door that is not on the floor plan.',
      'The copy bar crawls. Forty percent. Sixty.',
      'Out through the loading bay, into the van.',
    ],
    crises: [
      {
        id: 'guard_round',
        text: 'A guard is early on his round. He is heading for the server room with {tech} still inside.',
        focusRole: 'tech',
        choices: [
          { id: 'distract', label: '{face} distracts him', kind: 'adapt', stat: 'social', difficulty: 11, requires: { kind: 'role', value: 'face' },
            success: 'The guard gets a long story about a broken mop and never reaches the door.', failure: 'He gets suspicious and calls it in.', failureInjury: 'none' },
          { id: 'hide', label: '{tech} hides and keeps copying', kind: 'push', stat: 'stealth', difficulty: 13,
            success: 'The guard checks the door handle and moves on.', failure: 'He finds her. There is a struggle.', failureInjury: 'serious' },
          { id: 'abort', label: 'Abort: pull out with a partial copy', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6, clientTrust: -5 },
            success: 'You leave with forty percent. The client is unhappy but pays something.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'neural_spike',
        text: '{tech} is pushing her implants to crack the last layer. Her nose starts bleeding.',
        focusRole: 'tech',
        choices: [
          { id: 'push', label: 'Let her finish it', kind: 'push', stat: 'tech', difficulty: 12, cost: {},
            success: 'She cracks it, wipes her nose and grins. Neural load spikes.', failure: 'She collapses. Her vitals are bad.', failureInjury: 'critical' },
          { id: 'medic', label: 'Medic steps in, slower approach', kind: 'stabilise', stat: 'medical', difficulty: 9, requires: { kind: 'role', value: 'medic' }, cost: { heat: 1 },
            success: 'The medic dials her down. It takes longer, but she is fine.', failure: 'Too slow. An alarm trips.', failureInjury: 'none' },
          { id: 'abort', label: 'Abort: unplug her now', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6 },
            success: 'You unplug her mid-crack. She swears at you all the way home, alive.', failure: '', failureInjury: 'none' },
        ],
      },
    ],
    heat: 1,
  },
  {
    id: 'warehouse',
    name: 'Warehouse Lift',
    district: 'docks',
    threat: 4,
    pay: 6000,
    days: 2,
    crewSize: 4,
    keyStats: ['combat', 'stealth', 'driving'],
    brief: 'A rival crew is storing stolen implants in a Docks warehouse. Take the crates before they ship.',
    beats: [
      'Fog off the water. {driver} kills the headlights a block out.',
      'The fence is cut. Six crates, two guards, one dog.',
      'Halfway through loading, a forklift starts up somewhere inside.',
      'The van sits low on its springs. {driver} pulls away slowly.',
    ],
    crises: [
      {
        id: 'guards_return',
        text: 'Headlights. The rival crew is back early: four of them, armed. {muscle} is already reaching for a weapon.',
        focusRole: 'muscle',
        choices: [
          { id: 'fight', label: 'Hold the ground and fight', kind: 'push', stat: 'combat', difficulty: 14,
            success: 'Short, loud and ugly, but they break and run.', failure: 'They are better than expected. {muscle} goes down hard.', failureInjury: 'critical' },
          { id: 'half', label: 'Grab half the crates and run', kind: 'adapt', stat: 'driving', difficulty: 11, cost: { payCut: 0.5, heat: 1 },
            success: 'Three crates, nobody hurt, tyres screaming.', failure: 'Shots hit the van as you pull out.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: leave everything, get out', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You are gone before they see you. Empty-handed, all alive.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'man_down',
        text: '{op} is down behind a crate, bleeding badly. The crew is looking at you.',
        choices: [
          { id: 'stabilise', label: 'Medic stabilises them here', kind: 'stabilise', stat: 'medical', difficulty: 10, requires: { kind: 'role', value: 'medic' }, cost: { heat: 1 },
            success: 'The bleeding stops. They will live, but they are out for weeks.', failure: 'The medic cannot stop the bleeding in time.', failureInjury: 'critical' },
          { id: 'extract', label: 'Carry them to the van now', kind: 'extract', stat: 'driving', difficulty: 8, cost: { payCut: 0.5 },
            success: 'You drop the job and floor it to a street clinic.', failure: 'The road is blocked. Precious minutes lost.', failureInjury: 'serious' },
          { id: 'push', label: 'Finish the job first', kind: 'push', stat: 'combat', difficulty: 13,
            success: 'You finish, then rush them out. It was close.', failure: 'By the time you reach them, it is too late.', failureInjury: 'critical' },
        ],
      },
    ],
    heat: 2,
  },
];
