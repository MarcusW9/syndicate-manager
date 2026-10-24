// Kidnap rescue: get a hostage out alive. Aborting means leaving them behind.

/** @type {import('../../core/types.js').MissionTemplate} */
export const KIDNAP = {
  id: 'kidnap',
  name: 'Kidnap Rescue',
  district: 'oldTown',
  threat: 4,
  pay: 7000,
  days: 2,
  crewSize: 4,
  keyStats: ['combat', 'stealth', 'medical'],
  brief: 'A shipping heiress\'s accountant was snatched off the street. He\'s being held above a closed-down cha chaan teng in Old Town. Bring him back breathing.',
  beats: [
    'The cha chaan teng\'s shutters are down, but there\'s light on the second floor. {driver} parks two streets away.',
    'Up the back stairs, past crates of condensed milk. Somebody upstairs is watching football too loudly.',
    'The accountant is zip-tied to a chair, glasses broken, alive.',
    'Down the stairs, into the van. He keeps saying thank you until {medic} tells him to stop talking.',
  ],
  crises: [
    {
      id: 'lookout',
      text: 'A lookout is smoking in the alley by the back door. If he sees you, the hostage gets moved, or worse.',
      choices: [
        { id: 'quiet', label: '{muscle} takes him down quietly', kind: 'push', stat: 'stealth', difficulty: 11,
          success: 'One arm round the neck, a soft landing on the bins. Out cold.', failure: 'He gets a shout out before he goes down. Upstairs goes quiet.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'distract', label: '{face} plays a lost tourist asking for directions', kind: 'adapt', stat: 'social', difficulty: 10, requires: { kind: 'role', value: 'face' },
          success: 'He walks her to the corner to point the way. You slip in behind him.', failure: 'He doesn\'t buy it and calls upstairs.', failureInjury: 'none', failureCost: { heat: 1 } },
        { id: 'abort', label: 'Abort: pull back and leave him there', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -15 },
          success: 'You drive away. Nobody on the crew says anything for a long time.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'moving',
      text: 'Footsteps on the stairs. The kidnappers are moving the hostage to a car, right now.',
      choices: [
        { id: 'ambush', label: 'Hit them on the stairs', kind: 'push', stat: 'combat', difficulty: 13,
          success: 'Tight stairwell, fast work. The kidnappers go down and the hostage is yours.', failure: 'They fight back hard in the narrow space. {muscle} takes a knife.', failureInjury: 'serious' },
        { id: 'follow', label: '{driver} tails the car to wherever they take him', kind: 'adapt', stat: 'driving', difficulty: 11, cost: { payCut: 0.15 },
          success: 'A slow tail through the night markets, then a quieter flat with fewer guards. Easier, if later.', failure: 'You lose them at a light, then find them again, but they\'ve seen you.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: let the car go', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -15 },
          success: 'The car turns the corner and is gone. So is the accountant.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'hostage_hurt',
      text: 'The accountant has been beaten badly. He can barely stand, and the stairs are steep.',
      choices: [
        { id: 'patch', label: '{medic} patches him up first', kind: 'adapt', stat: 'medical', difficulty: 10, requires: { kind: 'role', value: 'medic' },
          success: 'Tape, a splint and a lot of encouragement. He walks out on his own feet.', failure: 'It takes too long. Someone downstairs hears the commotion.', failureInjury: 'light' },
        { id: 'carry', label: '{muscle} carries him down', kind: 'push', stat: 'combat', difficulty: 9,
          success: 'Over the shoulder like a sack of rice, and down the stairs fast.', failure: '{muscle} slips on the stairs with the weight.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: get your own people out', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -15 },
          success: 'You leave him in the chair. He watches you go.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'ransom_call',
      text: 'The kidnappers\' phone rings. It\'s their boss. If nobody answers, he\'ll send more people.',
      choices: [
        { id: 'voice', label: '{face} answers and fakes a kidnapper\'s voice', kind: 'adapt', stat: 'social', difficulty: 12, requires: { kind: 'role', value: 'face' },
          success: '"All quiet, boss." A grunt on the other end, and the line goes dead.', failure: 'The boss asks a question only his people would know. The line goes dead, and so does your time.', failureInjury: 'none', failureCost: { heat: 2 } },
        { id: 'hurry', label: 'Ignore it and move fast', kind: 'push', stat: 'cool', difficulty: 11,
          success: 'You\'re three streets away before anyone else arrives.', failure: 'A car screeches up as you\'re loading the van.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'abort', label: 'Abort: get out before they arrive', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -15 },
          success: 'You leave the way you came. The hostage stays.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'wrong_floor',
      text: 'The floor plan was wrong. There\'s a mahjong game going in the next room: six men, and they\'re all armed.',
      choices: [
        { id: 'sneak', label: 'Slip past while the tiles are loud', kind: 'push', stat: 'stealth', difficulty: 13,
          success: 'You time every step to the clatter of tiles. Nobody looks up.', failure: 'A floorboard creaks between hands. Six heads turn.', failureInjury: 'serious' },
        { id: 'lock', label: '{tech} locks them in from the outside', kind: 'adapt', stat: 'tech', difficulty: 11, requires: { kind: 'role', value: 'tech' },
          success: 'A zip tie through the door handles and a wedge under the door. They don\'t notice until you\'re gone.', failure: 'The lock clicks loudly. Someone tries the door.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'abort', label: 'Abort: six guns is too many', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
          success: 'You back out quietly. The client won\'t forgive this easily.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'police_sirens',
      text: 'Sirens. Someone called the police about the noise. They\'ll be here in minutes, and the hostage is a witness.',
      choices: [
        { id: 'leave_him', label: 'Leave the hostage for the police to find', kind: 'adapt', stat: 'cool', sure: true, difficulty: 0, cost: { payCut: 0.5, clientTrust: -5 },
          success: 'He\'s safe, and the police get the credit. The client gets him back, but not from you.', failure: '', failureInjury: 'none' },
        { id: 'run', label: 'Take him and run before they arrive', kind: 'push', stat: 'driving', difficulty: 12, failureCost: { heat: 2 },
          success: '{driver} takes the back lanes. The sirens pass the end of the street.', failure: 'A patrol car spots the van. You lose them, but they got the plates.', failureInjury: 'none' },
        { id: 'abort', label: 'Abort: scatter, everyone on foot', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
          success: 'Five people walk away in five directions. The police find the hostage.', failure: '', failureInjury: 'none' },
      ],
    },
  ],
  heat: 0,
};
