// Mahjong Ledger: a rookie job for Madam Rao in the Night Market. A runner called Ah-Wah
// has her ledger and her money. Owner's draft (2026-10-25), checked against WORLD.md and
// merged with three crises from the first debt-collection draft. Rolls aimed at 4-8;
// draws the shared rookie pool too. Every choice has a plain `report` line.

/** @type {import('../../core/types.js').MissionTemplate} */
export const LEDGER = {
  id: 'ledger',
  name: 'Mahjong Ledger',
  district: 'nightMarket',
  threat: 1,
  rookie: true,
  pay: 1800,
  days: 1,
  crewSize: 2,
  keyStats: ['social', 'cool'],
  brief: '{rao} doesn\'t look up from her mahjong tiles. "A runner called Ah-Wah thinks my money is his retirement fund. Bring me my ledger. Bring me my money. If you must bleed him, do it on the linoleum. Not my carpet."',
  beats: [
    'The back room of the Neon Dragon at two in the morning: clacking tiles, hissed bets and the spit of hot grease.',
    '{rao} slides an address across the felt with two cups of lukewarm bitter melon tea. "{rao:greet}"',
    'Ah-Wah\'s door is four flights up a stairwell soaked in neon and old rain.',
    'Dawn bleeds pink through the smog as you lay the ledger on Rao\'s desk. "{rao:approve}"',
  ],
  crises: [
    {
      id: 'gate',
      after: 2, order: -1, // at Ah-Wah's door
      text: 'Behind a rusted security gate you can hear Ah-Wah panicking: drawers slamming, a suitcase zip straining.',
      focusRole: 'tech',
      choices: [
        { id: 'pick', label: '{op} picks the lock before he hears you', kind: 'push', stat: 'tech', difficulty: 6,
          success: 'A soft click. The gate swings open while he\'s still fighting a jammed zip.', failure: 'The pick snaps in the rusted keyway with a loud ping, and the whole floor hears it.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} picked the lock on Ah-Wah\'s gate.', failure: '{op} broke a pick in Ah-Wah\'s lock and woke the floor. Heat +1.' } },
        { id: 'kick', label: 'Kick the frame and catch him flat-footed', kind: 'push', stat: 'cool', difficulty: 5,
          success: 'Rotten wood splinters. Ah-Wah trips over his own duffel bag and lands hard.', failure: 'The gate holds and {op}\'s shoulder takes the hit. Inside, Ah-Wah grabs a cleaver.', failureInjury: 'light',
          report: { success: 'The crew kicked in Ah-Wah\'s door.', failure: 'Ah-Wah\'s gate held and {op} hurt a shoulder on it.' } },
        { id: 'abort', label: 'Abort: back down the stairs and leave him to it', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You walk back down four flights. Above you, the suitcase zip finally gives.', failure: '', failureInjury: 'none',
          report: { success: 'The crew left Ah-Wah\'s door without going in.' } },
      ],
    },
    {
      id: 'doorway',
      after: 2,
      text: 'A woman blocks the bedroom doorway, eyes red, swearing through tears that Ah-Wah left town yesterday.',
      choices: [
        { id: 'quiet', label: '{op} leans in and speaks low and calm', kind: 'adapt', stat: 'social', difficulty: 5,
          success: 'She looks at {op} for a long second, swallows, and steps aside.', failure: 'She screams for the neighbours, and every door on the corridor starts to open.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} talked Ah-Wah\'s partner out of the doorway.', failure: 'Ah-Wah\'s partner screamed the building awake. Heat +1.' } },
        { id: 'search', label: 'Push past her and check the rooms', kind: 'push', stat: 'cool', difficulty: 6,
          success: 'You find Ah-Wah behind a wall of mildewed winter coats in the wardrobe.', failure: 'She swings a brass kettle into the side of {op}\'s head.', failureInjury: 'light',
          report: { success: 'The crew searched the flat and found Ah-Wah in a wardrobe.', failure: 'Ah-Wah\'s partner hit {op} with a kettle.' } },
        { id: 'abort', label: 'Abort: take the petty cash box and leave', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.7, clientTrust: -5 },
          success: 'You pocket the cash box and his pawn tickets, and back out before the neighbours gather.', failure: '', failureInjury: 'none',
          report: { success: 'The crew took Ah-Wah\'s petty cash and left without the ledger.' } },
      ],
    },
    {
      id: 'short',
      after: 2, order: 1, // the ledger is found last
      text: 'The ledger is in a black leather bag. The cash pouch with it is three hundred short.',
      choices: [
        { id: 'deeper', label: '{op} backs him against the wall until he digs deeper', kind: 'push', stat: 'social', difficulty: 7,
          success: 'Shaking, he twists a gold-and-jade ring off his thumb and drops it in {op}\'s palm.', failure: 'He swears on his ancestors he\'s broke, and ten minutes of searching says he\'s right.', failureInjury: 'none', failureCost: { payCut: 0.2 },
          report: { success: 'The money was short; {op} made Ah-Wah pay with a jade ring.', failure: 'The money was short and Ah-Wah had nothing more.' } },
        { id: 'cover', label: 'Cover the missing ¥300 yourselves', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -300 },
          success: 'Madam Rao counts the stack, smiles thinly, and pours the crew a glass of real rice wine.', failure: '', failureInjury: 'none',
          report: { success: 'The money was short; the crew covered ¥300 themselves.' } },
        { id: 'abort', label: 'Abort: hand over the short stack and let Rao deal with him', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.4 },
          success: 'Rao takes the ledger with an icy nod and docks your pay for the gap.', failure: '', failureInjury: 'none',
          report: { success: 'The crew handed over a short payment; Rao docked their pay.' } },
      ],
    },
    {
      id: 'bolt',
      after: 1, order: -1, // on the stairs
      text: 'Ah-Wah sees you on the stairs and bolts past, a cash box under his arm, down into the Glow Street crowd.',
      focusRole: 'muscle',
      choices: [
        { id: 'chase', label: '{op} runs him down', kind: 'push', stat: 'combat', difficulty: 6,
          success: '{op} catches him by the collar at the noodle stalls. He hands the box over without a word.', failure: 'He hurls the box over his shoulder. It catches {op} on the jaw, and he\'s gone.', failureInjury: 'light', failureCost: { payCut: 0.3 },
          report: { success: 'Ah-Wah ran; {op} caught him at the noodle stalls.', failure: 'Ah-Wah ran, hit {op} with his cash box and got away.' } },
        { id: 'cut_off', label: 'Cut him off through the back alleys', kind: 'adapt', stat: 'stealth', difficulty: 6,
          success: 'He turns a corner straight into you. "Fine! Fine. Take it."', failure: 'The alley ends in a wall. He doesn\'t.', failureInjury: 'none', failureCost: { payCut: 0.3 },
          report: { success: 'Ah-Wah ran; the crew cut him off in an alley.', failure: 'Ah-Wah ran and the crew lost him in the alleys.' } },
        { id: 'abort', label: 'Abort: let him go and call it a night', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You watch him vanish into the neon. Madam Rao will hear about this.', failure: '', failureInjury: 'none',
          report: { success: 'Ah-Wah ran and the crew gave up.' } },
      ],
    },
    {
      id: 'first_claim',
      after: 2,
      text: 'Two Silver Fan collectors are already on Ah-Wah\'s landing. "Ours first," one says. "Rao can have what\'s left."',
      choices: [
        { id: 'rao_money', label: '{op} reminds them whose money this is', kind: 'adapt', stat: 'social', difficulty: 7,
          success: '"Rao\'s?" They trade a look and step back. Nobody in the market quite dares to touch her.', failure: 'They laugh, take the lot, and one flicks {op}\'s ear on the way past.', failureInjury: 'none', failureCost: { payCut: 0.4 },
          report: { success: 'Silver Fan collectors backed off when {op} named Madam Rao.', failure: 'Silver Fan collectors took Ah-Wah\'s money first.' } },
        { id: 'split', label: 'Split it with them', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { payCut: 0.3 },
          success: 'Half each. Nobody\'s happy, which is how you know it\'s fair.', failure: '', failureInjury: 'none',
          report: { success: 'The crew split Ah-Wah\'s money with Silver Fan collectors.' } },
        { id: 'abort', label: 'Abort: leave him to the Silver Fan', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You back away. They wave goodbye with your money.', failure: '', failureInjury: 'none',
          report: { success: 'The crew left Ah-Wah to the Silver Fan.' } },
      ],
    },
    {
      id: 'hired_help',
      after: 2,
      text: 'Ah-Wah has spent some of Rao\'s money on help: a big man in a vest, cracking his knuckles on the landing.',
      choices: [
        { id: 'square_up', label: '{op} squares up to him', kind: 'push', stat: 'combat', difficulty: 7,
          success: 'One look at {op} and he decides this isn\'t worth what he\'s being paid. He steps aside.', failure: 'He hits first. {op} goes backwards down half a flight of stairs.', failureInjury: 'light',
          report: { success: 'Ah-Wah\'s hired muscle backed down from {op}.', failure: 'Ah-Wah\'s hired muscle knocked {op} down the stairs.' } },
        { id: 'walk', label: 'Offer him a cut to take a walk', kind: 'adapt', stat: 'social', difficulty: 5, cost: { payCut: 0.15 },
          success: 'He pockets the notes and goes for a smoke. "Didn\'t see you."', failure: 'He takes the money and stays exactly where he is.', failureInjury: 'none', failureCost: { payCut: 0.2 },
          report: { success: 'The crew paid Ah-Wah\'s hired muscle to look away.', failure: 'Ah-Wah\'s hired muscle took a bribe and stayed.' } },
        { id: 'abort', label: 'Abort: not worth a broken nose', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You go back down the stairs. "{rao:disappoint}" she\'ll say, and she\'ll mean it.', failure: '', failureInjury: 'none',
          report: { success: 'Ah-Wah had hired muscle; the crew left.' } },
      ],
    },
  ],
  heat: 0,
};
