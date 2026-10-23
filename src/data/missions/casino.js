// Casino con: a face-led job. Low violence, high nerve.

/** @type {import('../../core/types.js').MissionTemplate} */
export const CASINO = {
  id: 'casino',
  name: 'Casino Con',
  district: 'nightMarket',
  threat: 2,
  pay: 4500,
  days: 1,
  crewSize: 3,
  keyStats: ['social', 'tech', 'cool'],
  brief: 'A floating baccarat room above the Night Market is taking a property developer for everything he has. Win it back from them, quietly.',
  beats: [
    'Red lanterns, cigarette smoke and the click of chips. {face} takes a seat at the high table.',
    '{tech} is in the back with a laptop, reading the shuffler\'s signals.',
    'The pile of chips in front of {face} keeps growing. The pit boss starts to notice.',
    'Cash out, slowly, with a smile. Down the stairs into the noise of the market.',
  ],
  crises: [
    {
      id: 'pit_boss',
      text: 'The pit boss is watching {face}\'s hands closely. He signals for the dealer to change the shoe.',
      focusRole: 'face',
      choices: [
        { id: 'charm', label: '{face} tips him and asks about his family', kind: 'adapt', stat: 'social', difficulty: 11,
          success: 'Ten minutes on his daughter\'s exams and he forgets to change the shoe.', failure: 'He smiles, changes the shoe anyway, and calls security over to watch.', failureInjury: 'none', failureCost: { payCut: 0.3 } },
        { id: 'lose', label: 'Lose a few hands on purpose', kind: 'adapt', stat: 'cool', difficulty: 9, cost: { payCut: 0.15 },
          success: 'A few bad hands and some loud swearing. He relaxes.', failure: 'You lose more than you meant to.', failureInjury: 'none', failureCost: { payCut: 0.2 } },
        { id: 'abort', label: 'Abort: cash out now with what you have', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6, clientTrust: -5 },
          success: 'You leave with a fraction of what you came for.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'signal_lost',
      text: 'The casino\'s jammer kicks in. {tech}\'s link to {face}\'s earpiece drops to static.',
      focusRole: 'tech',
      choices: [
        { id: 'fix', label: '{tech} finds a gap in the jammer', kind: 'adapt', stat: 'tech', difficulty: 12, requires: { kind: 'role', value: 'tech' }, neural: 10,
          success: 'A different frequency, a little interference, and the voice is back.', failure: 'The jammer sweeps and finds the earpiece. Security starts looking around.', failureInjury: 'none', failureCost: { heat: 1 } },
        { id: 'solo', label: '{face} plays on alone, by instinct', kind: 'push', stat: 'cool', difficulty: 13,
          success: 'No signals, no help. Just nerve. The chips keep coming.', failure: 'Without the signals, the luck runs out.', failureInjury: 'none', failureCost: { payCut: 0.4 } },
        { id: 'abort', label: 'Abort: walk away from the table', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.7 },
          success: 'You finish your drink and leave. Small winnings.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'recognised',
      text: 'A regular at the table squints at {face}. "Don\'t I know you? You were at the Macau tables last year."',
      focusRole: 'face',
      choices: [
        { id: 'deny', label: '{face} laughs it off', kind: 'adapt', stat: 'social', difficulty: 12,
          success: '"Everyone says I look like someone." He shrugs and goes back to his cards.', failure: 'He keeps talking, louder. The pit boss comes over.', failureInjury: 'none', failureCost: { heat: 1, payCut: 0.2 } },
        { id: 'buy', label: 'Buy his silence with chips', kind: 'adapt', stat: 'cool', sure: true, difficulty: 0, cost: { payCut: 0.2 },
          success: 'A tall stack slides across the table. Suddenly he doesn\'t remember anything.', failure: '', failureInjury: 'none' },
        { id: 'abort', label: 'Abort: leave before he remembers', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You leave mid-hand. He shouts something after you.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'back_room',
      text: 'Security asks {face} to come to the back room "for a chat". Two of them, both big.',
      focusRole: 'face',
      choices: [
        { id: 'go', label: '{face} goes along and bluffs', kind: 'push', stat: 'cool', difficulty: 12,
          success: 'Twenty minutes of questions. {face} doesn\'t blink. They apologise for the trouble.', failure: 'They search {face} and find the earpiece. It gets rough.', failureInjury: 'serious' },
        { id: 'scene', label: 'Cause a scene in the main room', kind: 'adapt', stat: 'social', difficulty: 10, cost: { heat: 1 },
          success: 'A spilled drink, a shouting match, and you slip out in the chaos with the chips.', failure: 'The scene gets out of hand. Someone throws a punch.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: drop the chips and run', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'Down the fire escape and into the market crowd. Empty-handed.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'triad_owner',
      text: 'The owner comes down to watch. He has a Red Lantern tattoo on his wrist. This is their room.',
      choices: [
        { id: 'respect', label: '{face} pays respect: a share of the winnings', kind: 'adapt', stat: 'cool', sure: true, difficulty: 0, cost: { payCut: 0.25 },
          success: 'A respectful envelope. He nods and goes back upstairs. Business is business.', failure: '', failureInjury: 'none' },
        { id: 'continue', label: 'Keep winning in front of him', kind: 'push', stat: 'social', difficulty: 14, cost: { heat: 1 },
          success: 'He watches every hand and finds nothing. He even laughs at the end.', failure: 'He sees enough. You\'re escorted out and told never to come back.', failureInjury: 'light', failureCost: { payCut: 0.5 } },
        { id: 'abort', label: 'Abort: not worth crossing the Red Lanterns', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You fold, thank the dealer and leave.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'big_hand',
      text: 'One last hand. The whole stack on the table. {tech} says the signal is good, but not certain.',
      choices: [
        { id: 'all_in', label: 'Go all in', kind: 'push', stat: 'tech', difficulty: 11, successCost: { payCut: -0.4 },
          success: 'Natural nine. The table goes silent. The job pays 40% more.', failure: 'The cards turn the wrong way. You lose the stack.', failureInjury: 'none', failureCost: { payCut: 0.8 } },
        { id: 'walk', label: 'Walk away with what you have', kind: 'adapt', stat: 'cool', sure: true, difficulty: 0,
          success: 'You stand, stretch and cash out. A good night.', failure: '', failureInjury: 'none' },
        { id: 'abort', label: 'Abort: something feels wrong, leave now', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.5 },
          success: 'You leave half the chips on the table and go.', failure: '', failureInjury: 'none' },
      ],
    },
  ],
  heat: 0,
};
