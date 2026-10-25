// Data Scrub: a threat-2 job for Ruth Okonkwo in Glass Heights, her first test of a crew that's
// starting to get a name (opens at reputation 15, see JOB_GATES). Owner's draft (2026-10-25),
// checked against WORLD.md: Okonkwo brokers for Aether-Harbour's off-books arm, so this is
// espionage against a Veridian-Apex lab, and she meets crews in a car park, not an office.
// Not rookie work: its own rolls are aimed at 8-10, and it draws the Glass Heights crises (11-13).

/** @type {import('../../core/types.js').MissionTemplate} */
export const SCRUB = {
  id: 'data_scrub',
  name: 'Data Scrub',
  district: 'heights',
  threat: 2,
  pay: 3000,
  days: 1,
  crewSize: 2,
  keyStats: ['tech', 'stealth'],
  brief: '{okonkwo} meets you on Level 3 of a car park where the cameras have been broken since spring. "A Veridian-Apex lab left a prototype diagnostic chip in an open terminal overnight. Take the chip, wipe the drive. Security walks past every twelve minutes. {okonkwo:greet}"',
  beats: [
    'Glass Heights at three in the morning: filtered air, sterile corridors, cold blue light.',
    'The lab door answers Okonkwo\'s borrowed key with a soft pneumatic hiss.',
    'Inside, glass server racks hum in rows and a cleaning drone sweeps the floor in slow circles.',
    'You come out onto the Glass-Bridge Promenade into the mist, the chip in a shielded pouch. Your phone buzzes once: "{okonkwo:approve}"',
  ],
  crises: [
    {
      id: 'ceiling_drone',
      after: 1, // inside the lab
      text: 'A security drone glides along its ceiling track, sweeping a blue sensor across the terminal desk.',
      focusRole: 'tech',
      choices: [
        { id: 'blind', label: '{op} pulses its lens blind', kind: 'push', stat: 'tech', difficulty: 9,
          success: 'The sensor flickers and resets, and you get a clean thirty seconds.', failure: 'The pulse kicks back through {op}\'s deck and up their arm.', failureInjury: 'light',
          report: { success: '{op} blinded a lab security drone.', failure: 'A pulse at a security drone backfired on {op}.' } },
        { id: 'freeze', label: 'Freeze under the desk until the sweep passes', kind: 'adapt', stat: 'stealth', difficulty: 8,
          success: 'The beam slides a finger\'s width over your knuckles and moves on.', failure: 'A buckle catches the light. Somewhere, a yellow alert blinks on.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'The crew hid from a lab security drone.', failure: 'A lab security drone flagged the crew. Heat +1.' } },
        { id: 'abort', label: 'Abort: out through the ventilation duct', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You crawl out the way you came and leave the terminal untouched. "{okonkwo:disappoint}"', failure: '', failureInjury: 'none',
          report: { success: 'A security drone came; the crew left the lab untouched.' } },
      ],
    },
    {
      id: 'handprint',
      after: 1,
      text: 'The terminal wants a biometric handprint before it will release the chip.',
      focusRole: 'tech',
      choices: [
        { id: 'clip', label: '{op} bridges the reader with a bypass clip', kind: 'push', stat: 'tech', difficulty: 10,
          success: 'Green lights ripple across the console, and the chip tray slides out without a sound.', failure: 'The console locks and gives a thin, high warning chime.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} bypassed the terminal\'s handprint lock.', failure: 'The terminal locked down and chimed an alarm. Heat +1.' } },
        { id: 'ghost_print', label: 'Try the silicone ghost print from the kit', kind: 'adapt', stat: 'cool', difficulty: 8, cost: { payCut: 0.1 },
          success: 'A soft beep. The scanner takes the ghost print for a real hand.', failure: 'The pad rejects it and wipes half the drive before you can stop it.', failureInjury: 'none', failureCost: { payCut: 0.3 },
          report: { success: 'A ghost print fooled the terminal.', failure: 'The terminal rejected the ghost print and wiped half its data.' } },
        { id: 'abort', label: 'Abort: rip out the board and run', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.5, clientTrust: -5 },
          success: 'You yank the whole board, cracked casing and all, and go. The core might still be good.', failure: '', failureInjury: 'none',
          report: { success: 'The crew ripped the board out of the terminal and ran.' } },
      ],
    },
    {
      id: 'early_guard',
      after: 1,
      text: 'A Veridian-Apex guard comes back early from his break, whistling, his footsteps loud on the glass floor.',
      choices: [
        { id: 'alcove', label: '{op} presses flat into the door alcove', kind: 'adapt', stat: 'stealth', difficulty: 9,
          success: 'He walks straight past, eyes on his feed.', failure: 'He stops at the door\'s reflection, and his hand goes to his baton.', failureInjury: 'light',
          report: { success: 'A guard came back early and walked past the crew.', failure: 'A guard came back early and caught {op} in the doorway.' } },
        { id: 'green', label: 'Spoof the room sensor to show it empty', kind: 'adapt', stat: 'tech', difficulty: 8,
          success: 'The door light stays green and he keeps walking.', failure: 'The panel glitches red. He taps his radio and asks for a sweep.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'The crew spoofed the room sensor and a guard walked on.', failure: 'A spoofed sensor glitched and a guard called a sweep. Heat +1.' } },
        { id: 'abort', label: 'Abort: down the disposal chute', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1 },
          success: 'You drop down the laundry chute to the loading bay and walk out into the mist.', failure: '', failureInjury: 'none',
          report: { success: 'A guard came back early; the crew left by the disposal chute.' } },
      ],
    },
  ],
  heat: 0,
};
