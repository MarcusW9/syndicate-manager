// Submerged Cable: a rookie job for the Ferryman under Pier 12, the Docks. Splice his private
// line to the Silt before the tide comes in. Owner's draft (2026-10-25), checked against
// WORLD.md: he never sets foot on land, so he briefs from his boat. Rolls aimed at 4-8;
// shared rookie pool too.

/** @type {import('../../core/types.js').MissionTemplate} */
export const CABLE = {
  id: 'cable',
  name: 'Submerged Cable',
  district: 'docks',
  threat: 1,
  rookie: true,
  pay: 1500,
  days: 1,
  crewSize: 2,
  keyStats: ['tech', 'cool'],
  brief: 'The Ferryman holds his boat off the pylons under Pier 12, chewing betel nut. "A barge snagged an old cable down there. The Wet Sleeve think it\'s rubbish. It carries my calls to the Silt. Cut it free and splice it before the tide comes in."',
  beats: [
    'Cold spray coats the rusted ladders that hang under Pier 12.',
    'Below the deck, green water slaps against slime-covered pylons. The boat waits out in the dark, engine off.',
    'The cable is a thick armoured bundle, wedged tight against a rotting timber frame.',
    'The tide is at your knees when the splice light turns green. Out in the dark: "{ferryman:approve}"',
  ],
  crises: [
    {
      id: 'catwalk',
      order: -1,
      text: 'The maintenance catwalk is slick with weed, and the water underneath is pulling hard.',
      focusRole: 'tech',
      choices: [
        { id: 'clamp', label: '{op} fixes a magnetic safety clamp to the pylon', kind: 'push', stat: 'tech', difficulty: 6,
          success: 'The clamp locks on with a heavy thud, and the catwalk stops trying to throw you off.', failure: 'The clamp won\'t hold on the rust, and {op} slides a metre towards the water.', failureInjury: 'light',
          report: { success: '{op} clamped a safety line to the pylon.', failure: '{op} slipped on the catwalk when a clamp failed.' } },
        { id: 'crawl', label: 'Get down and crawl along the grating', kind: 'adapt', stat: 'cool', difficulty: 4, cost: { payCut: 0.05 },
          success: 'Slow and soaking, but you reach the junction box.', failure: 'A wave comes over the grating and floods the tool bag. One cutter is ruined.', failureInjury: 'none', failureCost: { payCut: 0.2 },
          report: { success: 'The crew crawled the catwalk to the cable.', failure: 'A wave soaked the crew\'s tools on the catwalk.' } },
        { id: 'abort', label: 'Abort: back up the ladder and wait for another night', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You climb back to the deck, dripping. "{ferryman:disappoint}" comes up from the water.', failure: '', failureInjury: 'none',
          report: { success: 'The catwalk was too dangerous; the crew climbed back up.' } },
      ],
    },
    {
      id: 'frayed_core',
      after: 2, order: 1, // the cable has been found
      text: 'The core is frayed in three places, and the salt is already eating into the copper.',
      focusRole: 'tech',
      choices: [
        { id: 'fuse', label: '{op} fuses the fibres with a waterproof splicer', kind: 'push', stat: 'tech', difficulty: 7,
          success: 'Tiny blue arcs, a held breath, and the signal comes back clean.', failure: 'A drop of spray hits the heater and two fibres shatter.', failureInjury: 'none', failureCost: { payCut: 0.3 },
          report: { success: '{op} spliced the Ferryman\'s cable clean.', failure: '{op}\'s splice failed and two fibres were lost.' } },
        { id: 'jumper', label: 'Bridge the damaged section with a patch cable', kind: 'adapt', stat: 'cool', difficulty: 5,
          success: 'The patch holds. The signal is a little rough, but it works.', failure: 'The joint leaks under the water and the signal drops in and out.', failureInjury: 'none', failureCost: { clientTrust: -5 },
          report: { success: 'The crew patched the Ferryman\'s cable.', failure: 'The crew\'s patch on the Ferryman\'s cable leaked.' } },
        { id: 'abort', label: 'Abort: tape it up as best you can and go', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.5 },
          success: 'You wrap the worst of it in tape and climb out. It won\'t last the week.', failure: '', failureInjury: 'none',
          report: { success: 'The crew taped the cable and left the splice unfinished.' } },
      ],
    },
    {
      id: 'sonar',
      after: 1, // under the pier
      text: 'An Aether-Harbour survey drone glides under the pier, its sonar pinging off the pylons.',
      choices: [
        { id: 'still', label: '{op} presses into the shadow of a pylon and goes still', kind: 'adapt', stat: 'stealth', difficulty: 5,
          success: 'The green light sweeps past your boots and carries on out to sea.', failure: 'A spanner slips and splashes. The drone turns, and hovers, and records.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'A survey drone passed under the pier without seeing the crew.', failure: 'A survey drone recorded the crew under the pier. Heat +1.' } },
        { id: 'noise', label: 'Drop a noise-maker in the water to scramble its sonar', kind: 'adapt', stat: 'tech', difficulty: 6,
          success: 'The drone turns in confused circles and drifts away.', failure: 'The noise brings a second drone in from the channel.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'The crew scrambled a survey drone\'s sonar.', failure: 'A noise-maker drew a second survey drone. Heat +1.' } },
        { id: 'wake', label: '{op} moves inside the drone\'s wake', kind: 'adapt', stat: 'stealth', difficulty: 3, requires: { kind: 'stat', value: 'stealth', min: 11 }, successCost: { payCut: -0.1 },
          success: '{op} matches the drone\'s slow sweep and crosses behind its sonar trail.', failure: 'The drone catches a blurred return and circles once before moving on.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} crossed unseen in the survey drone\'s wake. Pay +10%.', failure: 'The drone caught a blurred return of {op} and circled back. Heat +1.' } },
        { id: 'abort', label: 'Abort: up into the girders and leave the job', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6 },
          success: 'You haul yourselves into the dark iron above the waterline and wait until it\'s gone, and so is the tide.', failure: '', failureInjury: 'none',
          report: { success: 'A survey drone came; the crew hid and the tide beat them.' } },
      ],
    },
  ],
  heat: 0,
};
