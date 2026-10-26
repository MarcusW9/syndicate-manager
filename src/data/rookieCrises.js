// Crises any rookie job can draw, mixed into every rookie job's own pool (see missions.js).
// Written for reuse: {district} and {faction} come from the job's district, {op} is whoever
// it happens to. Rolls aimed at 4-8. Every choice has a plain `report` line.

export const ROOKIE_CRISES = [
  {
    id: 'old_classmate',
    text: 'Someone squints at {op}. "No way. Form Four, Miss Chan\'s class?" By tomorrow half of {district} could know what {op} does at night.',
    choices: [
      { id: 'ask', label: '{op} asks them to keep it quiet', kind: 'adapt', stat: 'social', difficulty: 5,
        success: 'They grin and swear on their grandmother. Somehow, you believe them.', failure: 'They promise. By lunchtime their whole group chat knows.', failureInjury: 'none', failureCost: { heat: 1 },
        report: { success: 'An old classmate recognised {op} and agreed to keep quiet.', failure: 'An old classmate recognised {op} and told everyone. Heat +1.' } },
      { id: 'pay', label: 'Slip them some cash', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { payCut: 0.15 },
        success: 'The notes disappear into a pocket. Money buys a lot of silence in {district}.', failure: '', failureInjury: 'none',
        report: { success: 'An old classmate recognised {op}; the crew paid for their silence.' } },
      { id: 'reunion', label: '{op} turns it into an ordinary reunion', kind: 'adapt', stat: 'cool', difficulty: 3, requires: { kind: 'stat', value: 'cool', min: 9 },
        success: '{op} laughs, trades harmless memories and leaves looking like someone with nothing to hide.', failure: 'The laughter lands wrong, and the classmate starts asking around.', failureInjury: 'none', failureCost: { heat: 1 },
        report: { success: '{op} made it look like an ordinary reunion.', failure: 'The classmate got suspicious of {op} and started asking around. Heat +1.' } },
      { id: 'abort', label: 'Abort: leave before anyone else recognises you', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.8 },
        success: 'You make an excuse and go. Nobody stops you.', failure: '', failureInjury: 'none',
        report: { success: 'Recognised by an old classmate; the crew left the job early.' } },
    ],
  },
  {
    id: 'faction_toll',
    text: 'A {faction} runner falls into step beside {op}, all smiles. "New faces on our streets pay a little something. First time, it\'s cheap."',
    choices: [
      { id: 'pay', label: 'Pay the toll', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -200 },
        success: 'The runner counts it twice and pats {op}\'s cheek. "See? Friends."', failure: '', failureInjury: 'none',
        report: { success: 'A {faction} runner took a ¥200 toll.' } },
      { id: 'talk', label: '{op} says you\'re only passing through', kind: 'adapt', stat: 'social', difficulty: 6,
        success: '"Passing through. Sure." The runner laughs and drifts off. "Next time, you pay."', failure: 'The smile goes. "Then you pay double." Two friends appear behind them.', failureInjury: 'none', failureCost: { cash: -400 },
        report: { success: 'A {faction} runner asked for a toll; {op} talked their way past.', failure: 'A {faction} runner took a double toll (¥400) after {op} argued.' } },
      { id: 'abort', label: 'Abort: back away and take the long way home', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1 },
        success: 'You turn round and go. Behind you, the runner is laughing.', failure: '', failureInjury: 'none',
        report: { success: 'Stopped by a {faction} runner; the crew turned back.' } },
    ],
  },
  {
    id: 'signal_three',
    text: 'The sky opens. Typhoon Signal 3 goes up over {district}, shutters slam, and the street empties in a minute.',
    choices: [
      { id: 'push', label: 'Keep going through the rain', kind: 'push', stat: 'cool', difficulty: 5,
        success: 'Soaked to the bone, but the job gets done. Nobody else was mad enough to be out.', failure: 'A sign tears loose in the wind and clips {op} on the way down.', failureInjury: 'light',
        report: { success: 'Typhoon Signal 3; the crew worked through it.', failure: 'Typhoon Signal 3; {op} was hit by a falling sign.' } },
      { id: 'wait', label: 'Wait it out at a dai pai dong', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { payCut: 0.2 },
        success: 'Two hours, three bowls of noodles, and the rain stops. You finish late and get paid less.', failure: '', failureInjury: 'none',
        report: { success: 'Typhoon Signal 3; the crew waited it out and finished late.' } },
      { id: 'drainage', label: '{op} follows the roads with working drains', kind: 'adapt', stat: 'driving', difficulty: 5, requires: { kind: 'stat', value: 'driving', min: 13 }, successCost: { payCut: -0.2 },
        success: '{op} reads the flood and threads the crew home before the low roads go under.', failure: 'A flooded corner stalls them, but {op} gets everyone out dry enough.', failureInjury: 'none',
        report: { success: '{op} followed the working drains and beat the flooding home. Pay +20%.', failure: 'Floodwater stalled them, but {op} got everyone out.' } },
      { id: 'abort', label: 'Abort: everyone home before the roads close', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1 },
        success: 'You make the last tram with water in your shoes.', failure: '', failureInjury: 'none',
        report: { success: 'Typhoon Signal 3; the crew went home.' } },
    ],
  },
];
