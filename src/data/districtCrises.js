// District crises: 3 per open district, added to the crisis pool of every job
// in that district (see missions.js). They come from the district outline in
// WORLD.md, so they must fit any job there. Same rules as every crisis: always
// an exit, and no he/she for operatives (crews are generated).

/** @type {Record<string, import('../core/types.js').Crisis[]>} */
export const DISTRICT_CRISES = {
  oldTown: [
    {
      id: 'ot_seizure',
      text: 'A man drops in the alley outside a tea shop, shaking, his neural port smoking. A crowd closes in around him, and around you.',
      choices: [
        { id: 'help', label: '{medic} kneels and talks him down', kind: 'adapt', stat: 'medical', difficulty: 10,
          success: 'Cold cloth, steady voice, and his breathing slows. An old man in the crowd nods and shows you a shortcut through his kitchen.', failure: 'The fit gets worse. Someone calls an ambulance, and the police follow it.', failureInjury: 'none', failureCost: { heat: 1 } },
        { id: 'push', label: 'Push through the crowd', kind: 'push', stat: 'cool', difficulty: 11,
          success: 'Elbows and apologies, and you\'re through. Somebody spits on the ground behind you.', failure: 'Someone shoves back. It gets ugly fast.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: stay with him until help comes', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'The job is gone by the time the ambulance arrives. He grips your hand as they lift him in.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'ot_shrine',
      text: 'Three Brass Anchor men step out of the incense smoke by the To Dei Gung shrine. They think you\'re the people measuring buildings for a developer.',
      choices: [
        { id: 'talk', label: '{face} explains, politely', kind: 'adapt', stat: 'social', difficulty: 11,
          success: '"Not developers. Just working." They look you over, then step aside.', failure: 'They don\'t like the explanation. The shoving starts.', failureInjury: 'light' },
        { id: 'incense', label: 'Light incense at the shrine and bow', kind: 'adapt', stat: 'cool', difficulty: 9,
          success: 'The oldest of them watches you bow three times, grunts, and lets you pass.', failure: 'The incense won\'t light. They take that as an answer.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: back away and go home the long way', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You leave the long way round. The job doesn\'t wait for you.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'ot_blackout',
      text: 'Somebody\'s illegal grid splice blows in a basement. The whole block goes black: stairwells, streetlights, everything.',
      choices: [
        { id: 'fix', label: '{tech} patches the splice', kind: 'adapt', stat: 'tech', difficulty: 11, requires: { kind: 'role', value: 'tech' }, neural: 10,
          success: 'Sparks, a curse, and the lights flicker back on. Half the block cheers from the windows.', failure: 'The splice bites back, and Hoi-Sing\'s meters notice.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'dark', label: 'Keep moving in the dark', kind: 'push', stat: 'stealth', difficulty: 11,
          success: 'Hands on the walls, counting steps. You come out the far side like you were never there.', failure: 'A missing stair. Somebody goes down hard.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: sit tight and call it off', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You wait out the blackout on a stairwell with the neighbours. The job is gone by the time the lights come back.', failure: '', failureInjury: 'none' },
      ],
    },
  ],

  docks: [
    {
      id: 'dk_drones',
      text: 'A crate seal splits and something inside starts to hum. Corporate security drones, packed in foam, are waking up one at a time.',
      choices: [
        { id: 'jam', label: '{tech} jams them before they lift', kind: 'adapt', stat: 'tech', difficulty: 12, requires: { kind: 'role', value: 'tech' },
          success: 'A handheld jammer, a held breath, and the humming dies.', failure: 'Two get airborne before the jammer bites.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'smash', label: '{muscle} smashes them in the crate', kind: 'push', stat: 'combat', difficulty: 11,
          success: 'A crowbar, six swings and a lot of broken plastic. Quiet again.', failure: 'One lifts off and fires its stun prongs.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'abort', label: 'Abort: drop everything and run', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
          success: 'You leave the crate humming on the dock and don\'t look back.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'dk_gale',
      text: 'The Signal 3 goes up. The dock gates lock themselves for the gale, and Aether-Harbour security starts sweeping the yard.',
      choices: [
        { id: 'fence', label: '{driver} finds a gap in the fence', kind: 'push', stat: 'driving', difficulty: 12,
          success: 'Lights off, engine low, out through a gap the wind tore open.', failure: 'The fence rips along the side of the van and the alarm goes.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'hide', label: 'Hide in an empty container until the sweep passes', kind: 'adapt', stat: 'stealth', difficulty: 10, cost: { payCut: 0.2 },
          success: 'Two hours in a steel box while the wind howls. The sweep goes past, and the client docks you for the delay.', failure: 'A torch beam swings into the container.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'abort', label: 'Abort: walk up to the guard post with a story', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'Lost dockworkers, wrong gate, so sorry. They throw you out into the rain, empty-handed.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'dk_wet_sleeve',
      text: 'Harbour Police at the gate: a "neural-load check". The Wet Sleeve unit wants to scan everyone\'s implants, and they want to be paid for the trouble.',
      choices: [
        { id: 'pay', label: 'Pay them', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -400 },
          success: 'Cash folded into a newspaper. The scanner never gets switched on.', failure: '', failureInjury: 'none' },
        { id: 'talk', label: '{face} talks your way through', kind: 'adapt', stat: 'social', difficulty: 11, failureCost: { heat: 1 },
          success: 'A few names dropped and a joke about the commander. They wave you through, laughing.', failure: 'They scan everyone, slowly, and write down your names.', failureInjury: 'none' },
        { id: 'scan', label: 'Let them scan and hope', kind: 'push', stat: 'cool', difficulty: 12, failureCost: { cash: -600 },
          success: 'The scanner beeps green for everyone. Nothing to fine.', failure: 'The scanner flags somebody\'s chrome. Out comes the fine book.', failureInjury: 'none' },
        { id: 'abort', label: 'Abort: turn round before the gate', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You reverse out of the queue. They watch you go.', failure: '', failureInjury: 'none' },
      ],
    },
  ],

  nightMarket: [
    {
      id: 'nm_tracker',
      text: 'The cash card the client gave you for expenses is pinging. Someone has planted a Silver Fan tracker in your money.',
      choices: [
        { id: 'spoof', label: '{tech} spoofs the signal', kind: 'adapt', stat: 'tech', difficulty: 11, requires: { kind: 'role', value: 'tech' },
          success: 'As far as the Silver Fan knows, you\'re now eating noodles three streets away.', failure: 'The spoof glitches. Somebody knows exactly where you are.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'dump', label: 'Drop the card in a wok of boiling oil', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { payCut: 0.2 },
          success: 'It pops and goes quiet. So does a fifth of your budget.', failure: '', failureInjury: 'none' },
        { id: 'abort', label: 'Abort: split up and walk home', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'Everyone takes a different alley home. The job dies with the card.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'nm_pulse',
      text: 'A data-broker feud spills into the street. Someone fires a pulse that fries every cheap implant on the block, and {tech} grabs their temple.',
      focusRole: 'tech',
      choices: [
        { id: 'cool', label: '{medic} cools them down', kind: 'adapt', stat: 'medical', difficulty: 10, failureCost: { payCut: 0.2 },
          success: 'Ice from a drinks stall, a hand on the neck, slow breathing. The shaking stops.', failure: 'It takes too long, and the night slips away.', failureInjury: 'none' },
        { id: 'through', label: 'Push on and work through it', kind: 'push', stat: 'tech', difficulty: 12, neural: 20,
          success: 'Teeth gritted, nose bleeding, and the job gets done anyway.', failure: 'The world goes white for a second.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: get them home', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You walk them out of the neon and call it a night.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'nm_clinic',
      text: 'The fastest way through is a back-alley chrome clinic. On the table, under the lamp, a senior Harbour Police commander is getting illegal implants. He sees you.',
      choices: [
        { id: 'promise', label: '{face} promises you saw nothing', kind: 'adapt', stat: 'social', difficulty: 12, failureCost: { heat: 2 },
          success: 'He nods once. You were never here, and neither was he.', failure: 'He doesn\'t believe a word. By morning your faces are on every patrol tablet.', failureInjury: 'none' },
        { id: 'photo', label: 'Take a picture on the way past', kind: 'push', stat: 'stealth', difficulty: 12, successCost: { payCut: -0.3 },
          success: 'One blurry, priceless photo. Somebody in the Night Market will pay well for it.', failure: 'The flash goes off. So does the commander.', failureInjury: 'light', failureCost: { heat: 2 } },
        { id: 'abort', label: 'Abort: back out the way you came', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You back out into the rain and lose the night going round.', failure: '', failureInjury: 'none' },
      ],
    },
  ],

  heights: [
    {
      id: 'gh_wiped',
      text: 'Your inside contact\'s badge stops working mid-job. They\'ve just been fired and wiped from the directory, and you\'re forty floors up on their credentials.',
      choices: [
        { id: 'forge', label: '{tech} forges a fresh badge', kind: 'adapt', stat: 'tech', difficulty: 12, requires: { kind: 'role', value: 'tech' },
          success: 'A new name, a new photo, a green light. Welcome back to work.', failure: 'The reader flashes red and a door locks behind you.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'stairs', label: 'Take the service stairs down', kind: 'push', stat: 'stealth', difficulty: 11, cost: { payCut: 0.1 },
          success: 'Forty floors of concrete stairs. Legs burning, but nobody saw you.', failure: 'A cleaner on floor 22 screams.', failureInjury: 'light', failureCost: { heat: 1 } },
        { id: 'abort', label: 'Abort: walk out like you belong', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'Chin up, through the lobby and out the front door. Nobody stops you, and you leave with nothing.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'gh_trial',
      text: 'A neural-enhancement demo in the lobby goes wrong. The broadcast leaks into every implant nearby, and {tech} starts reciting corporate telemetry under their breath.',
      focusRole: 'tech',
      choices: [
        { id: 'pull', label: '{medic} pulls them out of it', kind: 'adapt', stat: 'medical', difficulty: 11, requires: { kind: 'role', value: 'medic' }, failureCost: { heat: 1 },
          success: 'A sedative patch and a firm hand. {tech} blinks, back in the room.', failure: 'It takes too long, and security notices the commotion.', failureInjury: 'none' },
        { id: 'ride', label: 'Let them ride it out and keep working', kind: 'push', stat: 'tech', difficulty: 13, neural: 20,
          success: '{tech} shakes it off and keeps going, eyes streaming.', failure: '{tech} loses a whole minute and comes round not knowing where they are.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: get {tech} out of the building', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'Out through the revolving doors, {tech} still murmuring stock prices.', failure: '', failureInjury: 'none' },
      ],
    },
    {
      id: 'gh_skybridge',
      text: 'Lockdown. The sky-bridge doors seal at both ends with you in the middle, sixty floors over the city. The only other way out is a maintenance hatch, and the wind is howling.',
      choices: [
        { id: 'climb', label: 'Climb out through the hatch', kind: 'push', stat: 'cool', difficulty: 12,
          success: 'Hand over hand along the outside of the bridge, the wind tearing at your clothes. You make it.', failure: 'A gust snatches somebody\'s footing.', failureInjury: 'serious' },
        { id: 'spoof', label: '{tech} fakes a fire drill', kind: 'adapt', stat: 'tech', difficulty: 12, requires: { kind: 'role', value: 'tech' }, failureCost: { heat: 2 },
          success: 'Alarms, sprinklers, and the doors slide open. You walk out with the evacuees.', failure: 'The doors open, and security is waiting on the far side.', failureInjury: 'light' },
        { id: 'abort', label: 'Abort: wait for security with a good story', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, heat: 1, clientTrust: -5 },
          success: 'Contractors, wrong floor, so sorry. They walk you out and keep your faces on file.', failure: '', failureInjury: 'none' },
      ],
    },
  ],
};
