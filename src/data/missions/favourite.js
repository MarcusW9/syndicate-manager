// The Favourite: Auntie Fung's horse runs in the sixth at Lantern Course, and someone is
// paying stable hands to stop her. From the owner's Basin pitch (2026-10-25); canon in
// WORLD.md (the Basin, Lantern Course). Fung bets on one horse every time it runs and
// won't say why: this is that horse. Rolls aimed at 9-13. Every choice has a `report` line.

/** @type {import('../../core/types.js').MissionTemplate} */
export const FAVOURITE = {
  id: 'favourite',
  name: 'The Favourite',
  district: 'basin',
  threat: 2,
  pay: 4000,
  days: 1,
  crewSize: 3,
  keyStats: ['social', 'stealth', 'medical'],
  brief: 'Auntie Fung pours tea and doesn\'t drink it. "Pepper runs in the sixth tonight. She\'s the favourite, and somebody is paying stable hands to make sure she isn\'t by post time. Find out who. Don\'t ask me why I care about a horse."',
  beats: [
    'Race night at Lantern Course: warm rain, forty thousand people, and floodlights you can see from Old Town.',
    'The service level smells of hay, liniment and frying garlic. In a stable jacket, nobody looks at you twice.',
    'Pepper\'s stall is at the end of the row. Upstairs she\'s Asset Twelve. Down here she has a name, and she likes pears.',
    'Post time. The gates open, the whole Basin screams, and Pepper runs like nobody ever touched her.',
    'Auntie Fung folds her ticket twice and carries it out through the gates. She doesn\'t say what she won.',
  ],
  crises: [
    {
      id: 'service_gate',
      after: 0, order: -1, // getting in
      text: 'Racing Association security at the service gate is scanning every pass twice tonight. Yours are borrowed.',
      choices: [
        { id: 'talk', label: '{face} complains loudly about the feed delivery being late', kind: 'adapt', stat: 'social', difficulty: 10, requires: { kind: 'role', value: 'face' },
          success: 'The guard waves you through to get rid of the noise.', failure: 'The guard calls a supervisor, who takes your picture before letting you in.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{face} talked the crew through the service gate.', failure: 'Security photographed the crew at the service gate. Heat +1.' } },
        { id: 'feed', label: 'Ride in on the back of the hay truck', kind: 'push', stat: 'stealth', difficulty: 11,
          success: 'Buried in hay, past the scanner, and off before the truck stops.', failure: 'The truck brakes hard and {op} goes off the back onto the concrete.', failureInjury: 'light',
          report: { success: 'The crew rode the hay truck past security.', failure: '{op} fell off the hay truck getting in.' } },
        { id: 'abort', label: 'Abort: tell Auntie Fung the gate was shut tight', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You go back to Old Town. She listens, nods, and doesn\'t pour you any tea.', failure: '', failureInjury: 'none',
          report: { success: 'The crew couldn\'t get into the stables and walked away.' } },
      ],
    },
    {
      id: 'new_chrome',
      after: 1,
      text: 'A young stable hand is showing off a brand-new wrist port and more cash than a month\'s wages.',
      choices: [
        { id: 'chat', label: '{face} admires the chrome and asks who\'s paying so well', kind: 'adapt', stat: 'social', difficulty: 11, requires: { kind: 'role', value: 'face' },
          success: 'He brags before he thinks: a man in the Undercroft, paying in Silver Fan chips.', failure: 'He goes quiet, then goes looking for whoever paid him.', failureInjury: 'none', failureCost: { payCut: 0.2 },
          report: { success: '{face} got a bribed stable hand to brag about the Undercroft.', failure: 'A bribed stable hand clammed up and ran to warn someone.' } },
        { id: 'tail', label: 'Follow him on his break', kind: 'push', stat: 'stealth', difficulty: 12,
          success: 'He leads you down a back stair to a bookmaker\'s table under the betting hall.', failure: 'He spots you on the stair and two of his friends block the way back.', failureInjury: 'light',
          report: { success: 'The crew tailed a bribed stable hand to the Undercroft.', failure: 'A bribed stable hand spotted the tail; {op} took a beating on the stair.' } },
        { id: 'abort', label: 'Abort: leave him be and get out before he talks', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You slip out through the wash bay with nothing to tell her.', failure: '', failureInjury: 'none',
          report: { success: 'The crew left the stables before anyone started talking.' } },
      ],
    },
    {
      id: 'old_hand',
      after: 2, order: -1, // at Pepper's stall
      text: 'A grey-haired stable hand steps out of Pepper\'s stall with a pitchfork. "Seven years I\'ve brushed her. Nobody touches her tonight."',
      choices: [
        { id: 'truth', label: '{op} tells him the truth: someone paid to stop her', kind: 'adapt', stat: 'social', difficulty: 9,
          success: 'He lowers the fork. "The lad with the new wrist. I knew it." He keeps watch with you.', failure: 'He doesn\'t believe a word, and shouts for security.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'Pepper\'s stable hand believed the crew and kept watch with them.', failure: 'Pepper\'s stable hand shouted for security. Heat +1.' } },
        { id: 'pear', label: 'Hold out a pear for Pepper and wait', kind: 'adapt', stat: 'cool', difficulty: 10,
          success: 'Pepper takes it, the old man laughs despite himself, and lets you in.', failure: 'Pepper shies at a stranger and kicks the stall door into {op}\'s knee.', failureInjury: 'light',
          report: { success: 'A pear for Pepper got the crew past her stable hand.', failure: 'Pepper kicked the stall door into {op}\'s knee.' } },
        { id: 'abort', label: 'Abort: back away from the stall', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
          success: 'You leave the old man guarding her alone. Maybe that\'s enough. Probably not.', failure: '', failureInjury: 'none',
          report: { success: 'The crew backed off from Pepper\'s stall.' } },
      ],
    },
    {
      id: 'feed_bucket',
      after: 2,
      text: 'There\'s a smell in Pepper\'s feed bucket that isn\'t oats. Somebody has already been here.',
      focusRole: 'medic',
      choices: [
        { id: 'test', label: '{medic} tests the feed before she eats', kind: 'adapt', stat: 'medical', difficulty: 11, requires: { kind: 'role', value: 'medic' },
          success: 'A sedative, dosed to make her run a length slow. The bucket goes in a bag for Auntie Fung.', failure: 'The test strip says nothing. You throw the bucket out anyway, and lose the proof.', failureInjury: 'none', failureCost: { payCut: 0.2 },
          report: { success: '{medic} found a sedative in Pepper\'s feed and kept it as proof.', failure: '{medic} couldn\'t prove what was in Pepper\'s feed.' } },
        { id: 'swap', label: 'Swap the bucket for one from the next stall', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { payCut: 0.15 },
          success: 'Clean feed, no proof. Pepper eats like nothing happened.', failure: '', failureInjury: 'none',
          report: { success: 'The crew swapped Pepper\'s feed for a clean bucket.' } },
        { id: 'abort', label: 'Abort: tip the bucket out and go', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.8, clientTrust: -5 },
          success: 'The feed goes down the drain, and you go out the wash bay.', failure: '', failureInjury: 'none',
          report: { success: 'The crew tipped out Pepper\'s feed and left.' } },
      ],
    },
    {
      id: 'vet',
      after: 2,
      text: 'A vet in a Veridian-Apex lab coat arrives with a case. "Routine pre-race scan." Nobody booked one.',
      choices: [
        { id: 'stall', label: '{face} asks to see his Association papers, slowly', kind: 'adapt', stat: 'social', difficulty: 12, requires: { kind: 'role', value: 'face' },
          success: 'His papers are a day out of date. He leaves with his case still shut.', failure: 'His papers are perfect, and now he wants your names.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{face} sent a Veridian-Apex vet away from Pepper.', failure: 'A Veridian-Apex vet took the crew\'s names. Heat +1.' } },
        { id: 'watch', label: 'Let him scan, and watch his hands', kind: 'push', stat: 'cool', difficulty: 12,
          success: '{op} catches the second needle before it goes in. He leaves fast.', failure: 'He\'s quicker than {op}. Something goes in under her mane.', failureInjury: 'none', failureCost: { payCut: 0.3 },
          report: { success: '{op} caught a vet trying to inject Pepper.', failure: 'A vet got a needle into Pepper while {op} watched.' } },
        { id: 'abort', label: 'Abort: leave him to it and go', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
          success: 'You leave him opening his case. Auntie Fung will hear about it from someone else.', failure: '', failureInjury: 'none',
          report: { success: 'The crew left a vet alone with Pepper.' } },
      ],
    },
    {
      id: 'collector',
      after: 2, order: 1, // the name, before post time
      text: 'Under the betting hall, a Silver Fan collector says he knows who paid the stable hands. Information costs.',
      choices: [
        { id: 'pay', label: 'Pay him ¥800 for the name', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -800 },
          success: 'A bookmaker who took too many bets on Pepper. Auntie Fung will want to meet him.', failure: '', failureInjury: 'none',
          report: { success: 'The crew paid a Silver Fan collector ¥800 for the name.' } },
        { id: 'lean', label: '{muscle} leans on him instead', kind: 'push', stat: 'combat', difficulty: 12, cost: { heat: 1 }, requires: { kind: 'role', value: 'muscle' },
          success: 'He gives the name and a bloody nose and wishes you a lucky night.', failure: 'His friends come out from behind the betting screens.', failureInjury: 'serious',
          report: { success: '{muscle} got the name out of a Silver Fan collector. Heat +1.', failure: 'Silver Fan collectors beat {op} under the betting hall. Heat +1.' } },
        { id: 'abort', label: 'Abort: walk away without the name', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.5 },
          success: 'Pepper is safe tonight. Whoever paid will try again.', failure: '', failureInjury: 'none',
          report: { success: 'The crew kept Pepper safe but never got the name.' } },
      ],
    },
  ],
  heat: 0,
};
