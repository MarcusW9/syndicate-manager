// Eviction Notice: a rookie job for Mr. Szeto in Old Town. Talk the last tenant on Block 9's
// roof out of his pirate radio shack. Owner's draft (2026-10-25), checked against WORLD.md:
// Block 9 is Doc Siu's building and Szeto's "electrical fires" follow evictions, so this is
// an early hint of his arc. Suspected, never proven. Rolls aimed at 4-8; shared rookie pool too.

/** @type {import('../../core/types.js').MissionTemplate} */
export const EVICTION = {
  id: 'eviction',
  name: 'Eviction Notice',
  district: 'oldTown',
  threat: 1,
  rookie: true,
  pay: 1700,
  days: 1,
  crewSize: 2,
  keyStats: ['tech', 'social'],
  brief: '{szeto} adjusts a silk cuff, looking down at the roofs of Old Town. "A tenant on top of Block 9 runs a radio relay and won\'t move out. I don\'t want him harmed. That creates paperwork. Take down his antenna, bring me his codes, and help him see the wisdom of relocating."',
  beats: [
    'The roof of Block 9 is a forest of rusted aerials and copper wire, all of it humming in the rain.',
    'A tin shack glows amber with valve light. Inside, an old man sits among decades of pirate radio tapes.',
    'Below, the building sleeps: Doc Siu\'s basement, forty families, and one stubborn voice on the roof.',
    'The master feed goes dead and the roof goes quiet. Up on the ridge, {szeto}\'s tower lights stay on all night.',
  ],
  crises: [
    {
      id: 'capacitor',
      situations: ['street-tech', 'entry'],
      text: 'The relay box is shut with an army-surplus padlock, wired to a high-voltage capacitor.',
      focusRole: 'tech',
      choices: [
        { id: 'ground', label: '{op} grounds the capacitor and picks the lock', kind: 'push', stat: 'tech', difficulty: 6,
          success: 'A small spark, a soft click, and the panel swings open.', failure: 'The capacitor dumps its charge through {op}\'s glove in a white flash.', failureInjury: 'light',
          report: { success: '{op} made a booby-trapped relay box safe and opened it.', failure: 'A booby-trapped relay box shocked {op}.' } },
        { id: 'snip', label: 'Cut the power lead at the wall', kind: 'adapt', stat: 'cool', difficulty: 4, cost: { payCut: 0.1 },
          success: 'The wire parts cleanly and the valves fade to black.', failure: 'The line arcs against a beam and blue sparks dance across the tin roof.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'The crew cut the relay\'s power at the wall.', failure: 'Cutting the relay\'s power lit up the roof with sparks. Heat +1.' } },
        { id: 'discharge', label: 'Bleed the charge through the building earth', kind: 'adapt', stat: 'tech', difficulty: 3, requires: { kind: 'stat', value: 'tech', min: 13 }, successCost: { payCut: -0.1 },
          success: 'The capacitor drains silently through the earth line, and the lock comes off clean.', failure: 'The earth lead spits sparks, but there\'s time to pull clear.', failureInjury: 'none',
          report: { success: '{tech} drained the capacitor through the building earth. Pay +10%.', failure: 'The earth lead sparked, but {tech} pulled clear.' } },
        { id: 'abort', label: 'Abort: leave it, and tell Szeto the wiring was lethal', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You go back down the stairwell. "{szeto:disappoint}" he\'ll say, and he\'ll mean it.', failure: '', failureInjury: 'none',
          report: { success: 'The crew left the relay untouched.' } },
      ],
    },
    {
      id: 'live_mic',
      situations: ['crowd', 'threat'],
      after: 1, // the shack has been seen
      text: 'The old man bolts the shack door and grabs his microphone. "One more step and all of Old Town hears Szeto\'s name."',
      choices: [
        { id: 'harder_men', label: '{op} tells him Szeto will only send harder men next time', kind: 'adapt', stat: 'social', difficulty: 5,
          success: 'He looks at his shaking hands for a long time. Then he switches the transmitter off.', failure: 'He flips the switch and shouts into the rain about developers and fires. Half the block is listening.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} talked the tenant into switching off his transmitter.', failure: 'The tenant went on air about Szeto before the crew stopped him. Heat +1.' } },
        { id: 'door', label: 'Force the shack door off its hinges', kind: 'push', stat: 'cool', difficulty: 6,
          success: 'The rotten frame gives with a crack. He hands over his code book without a fight.', failure: 'As the door goes, he throws a glass radio valve at {op}\'s face.', failureInjury: 'light',
          report: { success: 'The crew forced the shack door and took the codes.', failure: 'The tenant hit {op} with a radio valve as the door gave.' } },
        { id: 'audience', label: '{op} gives him a better announcement', kind: 'adapt', stat: 'social', difficulty: 4, requires: { kind: 'stat', value: 'social', min: 11 }, successCost: { payCut: -0.1 },
          success: '{op} hands him words that save face, and he leaves the microphone switched off.', failure: 'He throws the script back and names the crew before the signal cuts.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} gave him a way to save face, and the microphone stayed off. Pay +10%.', failure: 'He threw out {op}\'s script and named the crew. Heat +1.' } },
        { id: 'abort', label: 'Abort: back down the fire escape before he goes live', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You slip into the stairwell. Behind you, his voice crackles on into the rain.', failure: '', failureInjury: 'none',
          report: { success: 'The tenant threatened to broadcast; the crew left.' } },
      ],
    },
    {
      id: 'neighbours',
      situations: ['crowd', 'threat'],
      text: 'Tenants gather on the landing below, some holding iron pipes. Nobody says anything. They just watch.',
      choices: [
        { id: 'level', label: '{op} tells them straight: Szeto wants the building, and he\'ll get it', kind: 'adapt', stat: 'social', difficulty: 6,
          success: 'Silence. Then, one by one, they go back to their doors. Nobody here is surprised.', failure: 'Someone throws a cracked teacup, hard, and it finds {op}\'s head.', failureInjury: 'light',
          report: { success: '{op} faced down the tenants on the landing.', failure: 'Tenants on the landing threw things at {op}.' } },
        { id: 'pay', label: 'Hand out cash for ten minutes of quiet', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -250 },
          success: 'Money talks faster than iron in Old Town. They take it and go downstairs.', failure: '', failureInjury: 'none',
          report: { success: 'The crew paid the tenants ¥250 to look away.' } },
        { id: 'abort', label: 'Abort: climb down the drainpipes and avoid a brawl', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You go down the wet pipes and leave the crowd muttering on the landing.', failure: '', failureInjury: 'none',
          report: { success: 'Tenants gathered; the crew climbed down and left.' } },
      ],
    },
  ],
  heat: 0,
};
