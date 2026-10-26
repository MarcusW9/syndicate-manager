// Counterfeit Chrome: a rookie job for Madam Rao in the Night Market. Shut down a back-alley
// doc selling Silver Fan fakes to her debtors. Owner's draft (2026-10-25), checked against
// WORLD.md: Rao isn't Silver Fan (they hate her), and the fakes are theirs; the Night Market is
// their turf, so the pitch is "whose money built his clinic". Rolls aimed at 4-8; shared pool too.

/** @type {import('../../core/types.js').MissionTemplate} */
export const CHROME = {
  id: 'chrome',
  name: 'Counterfeit Chrome',
  district: 'nightMarket',
  threat: 1,
  rookie: true,
  pay: 1600,
  days: 1,
  crewSize: 2,
  keyStats: ['cool', 'tech'],
  brief: '{rao} fans herself in a velvet armchair above the Glow Street arcade. "Dr. Lim is selling Silver Fan fake eyes to people who owe me money. Three of them have gone blind this week, and blind people don\'t pay. My money built his clinic. Take his stock, break his rig, and make sure he remembers that."',
  beats: [
    'Below the flickering neon dragons of Glow Street, steam rises from the basement operating rooms.',
    'Dr. Lim\'s clinic smells of surgical spirit, burnt copper and cold dumplings.',
    'A crate of cheap glass eyes sits beside a rusted calibration laser on a dented tray.',
    'You come up into the neon drizzle with the crate, and carry it back to {rao}. "{rao:approve}"',
  ],
  crises: [
    {
      id: 'bone_drill',
      after: 1, // inside the clinic
      text: 'Dr. Lim snatches a pneumatic bone drill off the rack. His hands are shaking so hard the bit rattles.',
      choices: [
        { id: 'disarm', label: '{op} steps inside his reach and twists the drill away', kind: 'push', stat: 'cool', difficulty: 6,
          success: 'One quick twist and the drill clatters across the concrete.', failure: 'The bit grazes {op}\'s forearm before they pin him to the table.', failureInjury: 'light',
          report: { success: '{op} took a bone drill off Dr. Lim.', failure: 'Dr. Lim cut {op} with a bone drill before they pinned him.' } },
        { id: 'remind', label: 'Remind him what Madam Rao does to people who bleed her customers', kind: 'adapt', stat: 'social', difficulty: 5,
          success: 'He goes white, drops the drill and backs into the corner with his hands up.', failure: 'Panic wins. He swings wildly and a shelf of chemicals smashes on the floor.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'Dr. Lim gave up when the crew named Madam Rao.', failure: 'Dr. Lim panicked and smashed a shelf of chemicals. Heat +1.' } },
        { id: 'abort', label: 'Abort: grab what\'s on the desk and get out', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6, clientTrust: -5 },
          success: 'You sweep a box of stock off the desk and kick the door shut on his shouting.', failure: '', failureInjury: 'none',
          report: { success: 'Dr. Lim pulled a drill; the crew took some stock and left.' } },
      ],
    },
    {
      id: 'laser_rig',
      after: 2, // the rig has been seen
      text: 'The calibration rig is still running, its unshielded laser humming over the tray.',
      focusRole: 'tech',
      choices: [
        { id: 'disable', label: '{op} pulls the diode array out with precision tools', kind: 'push', stat: 'tech', difficulty: 5,
          success: 'A clean pop, and the laser goes dark for good.', failure: 'A stray beam bounces off a steel tray and singes {op}\'s sleeve.', failureInjury: 'light',
          report: { success: '{op} disabled Dr. Lim\'s calibration laser.', failure: 'Dr. Lim\'s calibration laser burned {op}.' } },
        { id: 'wrench', label: 'Smash the power unit with a wrench', kind: 'adapt', stat: 'cool', difficulty: 4, cost: { payCut: 0.05 },
          success: 'A shower of sparks and a puff of acrid smoke. The rig is scrap.', failure: 'The breaker goes with a bang and cuts the power to the next three stalls.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'The crew smashed Dr. Lim\'s rig.', failure: 'Smashing Dr. Lim\'s rig blacked out the neighbouring stalls. Heat +1.' } },
        { id: 'abort', label: 'Abort: leave the rig, take the crate, and go', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.4 },
          success: 'You leave the machine humming. Rao will want to know why.', failure: '', failureInjury: 'none',
          report: { success: 'The crew took the stock but left the rig running.' } },
      ],
    },
    {
      id: 'patient',
      after: 1,
      text: 'A man with a bandaged eye is still in the chair. He begs you not to take his new lens.',
      choices: [
        { id: 'real_clinic', label: 'Give him ¥100 for a real clinic', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -100 },
          success: 'He takes it with a wet nod and stumbles out into the alley.', failure: '', failureInjury: 'none',
          report: { success: 'The crew gave one of Dr. Lim\'s patients ¥100 for a real clinic.' } },
        { id: 'explain', label: '{op} tells him what the fake will do to him', kind: 'adapt', stat: 'social', difficulty: 5,
          success: 'He touches the bandage, understands, and goes quietly.', failure: 'He panics, shoves {op} aside and runs up the stairs shouting.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} talked one of Dr. Lim\'s patients out of a fake lens.', failure: 'One of Dr. Lim\'s patients ran out shouting. Heat +1.' } },
        { id: 'examine', label: '{op} shows him the lens is poisoning him', kind: 'adapt', stat: 'medical', difficulty: 4, requires: { kind: 'stat', value: 'medical', min: 13 }, successCost: { payCut: -0.2 },
          success: '{op} shows him the inflamed tissue, and he hands over the lens with the rest.', failure: 'The examination hurts him, and {op} takes a fist for it before backing off.', failureInjury: 'light',
          report: { success: '{op} showed the patient the lens was poisoning him. Pay +20%.', failure: 'The examination went badly, and {op} was hurt.' } },
        { id: 'abort', label: 'Abort: leave him his lens and take the shelf stock', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.5 },
          success: 'You step round his chair, take what\'s on the shelves, and leave him to it.', failure: '', failureInjury: 'none',
          report: { success: 'The crew took Dr. Lim\'s shelf stock and left a patient his fake lens.' } },
      ],
    },
  ],
  heat: 0,
};
