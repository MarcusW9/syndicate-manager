// Twists: hidden extra crises that can turn up on any job (about 1 in 4).
// The job board usually hints at them ("intel unreliable"), but the hint
// is sometimes wrong. Same rules as every crisis: always an exit.

/** @type {import('../core/types.js').Crisis[]} */
export const TWISTS = [
  {
    id: 'twist_more_guards',
    name: 'The client lied',
    text: 'There are twice as many guards as the client said. Somebody either didn\'t know or didn\'t want you to.',
    choices: [
      { id: 'adapt', label: 'Slow down and work around them', kind: 'adapt', stat: 'stealth', difficulty: 12, cost: { payCut: 0.1 },
        success: 'It takes twice as long, but nobody sees you.', failure: 'A guard rounds the corner at the wrong moment.', failureInjury: 'light', failureCost: { heat: 1 } },
      { id: 'push', label: 'Push on as planned', kind: 'push', stat: 'combat', difficulty: 14,
        success: 'Fast and violent, and it works.', failure: 'You walk straight into them.', failureInjury: 'serious' },
      { id: 'abort', label: 'Abort: this isn\'t the job you were sold', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1 },
        success: 'You walk away. The client can explain themselves later.', failure: '', failureInjury: 'none' },
    ],
  },
  {
    id: 'twist_double_cross',
    name: 'Double-cross',
    text: 'At the handover, the client\'s people try to take everything without paying. Hands are already inside jackets.',
    choices: [
      { id: 'talk', label: '{face} reminds them who they\'re dealing with', kind: 'adapt', stat: 'social', difficulty: 13,
        success: 'A calm voice and a long stare. They decide to pay after all.', failure: 'They laugh. Then the shoving starts.', failureInjury: 'light', failureCost: { payCut: 0.5 } },
      { id: 'force', label: '{muscle} makes the first move', kind: 'push', stat: 'combat', difficulty: 13, cost: { heat: 1 },
        success: 'Over in seconds. You leave with the goods and the money.', failure: 'They were ready for it.', failureInjury: 'serious' },
      { id: 'abort', label: 'Abort: hand it over and leave', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1 },
        success: 'You walk away with nothing. The crew will remember who did this.', failure: '', failureInjury: 'none' },
    ],
  },
  {
    id: 'twist_tipoff',
    name: 'Police tip-off',
    text: 'Unmarked cars at both ends of the street. Somebody tipped off the police about this job.',
    choices: [
      { id: 'slip', label: 'Slip out through the back lanes', kind: 'push', stat: 'stealth', difficulty: 12, cost: { payCut: 0.2 },
        success: 'Through a laundry, over a wall, and away. You lose a little of the take on the way.', failure: 'An officer sees you go over the wall.', failureInjury: 'light', failureCost: { heat: 2 } },
      { id: 'drive', label: '{driver} drives through the cordon', kind: 'push', stat: 'driving', difficulty: 14, cost: { heat: 2 },
        success: 'Sirens behind you for six streets, then nothing.', failure: 'A police car clips the van.', failureInjury: 'serious' },
      { id: 'abort', label: 'Abort: dump everything and walk out separately', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1 },
        success: 'You drop the goods in a drain and stroll past the police one by one.', failure: '', failureInjury: 'none' },
    ],
  },
  {
    id: 'twist_rival_crew',
    name: 'Rival crew',
    text: 'Another crew is here for the same job. Masks, guns, and they look as surprised as you are.',
    choices: [
      { id: 'deal', label: '{face} offers to split it', kind: 'adapt', stat: 'social', difficulty: 11, cost: { payCut: 0.4 },
        success: 'Half each, and a nod of respect. You might work with them one day.', failure: 'They don\'t want to share.', failureInjury: 'light', failureCost: { payCut: 0.3 } },
      { id: 'race', label: 'Race them to it', kind: 'push', stat: 'cool', difficulty: 13,
        success: 'You get there first and they back off.', failure: 'You collide in a doorway. It turns into a brawl.', failureInjury: 'serious' },
      { id: 'abort', label: 'Abort: let them have it', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
        success: 'You leave them to it. Nobody gets shot tonight.', failure: '', failureInjury: 'none' },
    ],
  },
  {
    id: 'twist_bonus',
    name: 'Unexpected score',
    text: 'Something the client didn\'t mention: a safe, an unlocked office, a second crate. Nobody would know if you took it.',
    choices: [
      { id: 'take', label: 'Take it', kind: 'push', stat: 'stealth', difficulty: 12, successCost: { payCut: -0.5 },
        success: 'It comes with you. The job pays half as much again.', failure: 'It was alarmed.', failureInjury: 'light', failureCost: { heat: 2 } },
      { id: 'leave', label: 'Leave it: stick to the job', kind: 'adapt', stat: 'cool', sure: true, difficulty: 0,
        success: 'Discipline. The client will hear you played it straight.', failure: '', failureInjury: 'none' },
      { id: 'abort', label: 'Abort: this smells like a trap', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1 },
        success: 'You leave everything, including the job.', failure: '', failureInjury: 'none' },
    ],
  },
];
