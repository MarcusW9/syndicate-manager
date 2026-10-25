// Pier 12 Escort: a rookie job for Auntie Fung, walking Mr. Lau from her Old Town tea shop to
// the Ferryman's landing at Pier 12, the Docks. Lau carries a handwritten ledger from the 2052
// blackout; Fung doesn't tell the crew what's in it. Owner's draft (2026-10-25), checked against
// WORLD.md. Job-level characters, not canon unless promoted: Mr. Lau (an elderly bookkeeper who
// tracked generator fuel in the blackout), Sergeant Ho (runs Wet Sleeve neural-load checkpoints
// as a cash racket) and Kei (a 19-year-old courier in trouble with the Red Lanterns).
// Rolls aimed at 4-8; shared rookie pool too.

/** @type {import('../../core/types.js').MissionTemplate} */
export const ESCORT = {
  id: 'protection_run',
  name: 'Pier 12 Escort',
  district: 'oldTown',
  threat: 1,
  rookie: true,
  pay: 2200,
  days: 1,
  crewSize: 3,
  keyStats: ['social', 'driving', 'cool'],
  brief: 'Auntie Fung pours tea for an elderly man in a faded raincoat. "Mr. Lau is taking an old account book to Pier 12. Some people would prefer he lost it on the way. Keep him dry, keep him breathing, and do not open the book."',
  beats: [
    'Mr. Lau waits outside the Alley 4 tea shop with a battered case chained to his wrist.',
    'The route drops through Old Town, past wet tenements, generator stalls and Hoi-Sing junction boxes humming behind locked grilles.',
    'At the edge of the Docks, container traffic and police checkpoints squeeze every road towards Pier 12.',
    'The Ferryman holds his boat off the landing without tying up. Mr. Lau jumps aboard, case still chained to his wrist, and Auntie Fung\'s payment clears a minute later.',
  ],
  crises: [
    {
      id: 'underpass_gate',
      after: 1, // Old Town
      order: -2,
      text: 'The lights die halfway through an Old Town underpass. A Hoi-Sing junction box hangs open ahead, and somebody has chained the exit gate shut.',
      focusRole: 'tech',
      choices: [
        { id: 'restore_gate', label: '{op} gets the gate controls back online', kind: 'push', stat: 'tech', difficulty: 7, cost: { heat: 1 },
          success: 'The junction spits blue light and the gate rattles open before footsteps reach the underpass.', failure: 'The wet junction kicks current through {op}\'s implant and throws them against the wall.', failureInjury: 'serious',
          report: { success: '{op} restored power to the chained underpass gate. Heat +1.', failure: '{op} was shocked while trying to restore the underpass gate.' } },
        { id: 'break_chain', label: '{op} forces the chain off the gate', kind: 'adapt', stat: 'combat', difficulty: 5,
          success: 'The chain gives with a crack, and the crew gets Mr. Lau onto the next street.', failure: 'The gate buckles back into {op} and knocks them onto the concrete.', failureInjury: 'light',
          report: { success: '{op} forced open the chained underpass gate.', failure: '{op} was struck by the gate while trying to force it open.' } },
        { id: 'abort', label: 'Abort: double back and leave Mr. Lau somewhere public', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You return Mr. Lau to a crowded tea stall. He is safe, but the ledger never reaches Pier 12.', failure: '', failureInjury: 'none',
          report: { success: 'The blocked underpass forced the crew to return Mr. Lau to safety.' } },
      ],
    },
    {
      id: 'courier',
      after: 1,
      order: -1,
      text: 'A young courier crashes a scooter beside the convoy. Their dead ID flashes nineteen, and two Red Lantern runners round the corner shouting that Kei stole from them.',
      focusRole: 'face',
      choices: [
        { id: 'take_kei', label: '{op} pulls Kei into the convoy and talks the runners down', kind: 'push', stat: 'social', difficulty: 7, cost: { heat: 1 },
          success: 'The runners back off for now. Kei points out a service road that bypasses the next checkpoint.', failure: 'The argument becomes a close, ugly street fight before the convoy can move.', failureInjury: 'serious',
          report: { success: '{op} protected a courier named Kei from two Red Lantern runners. Heat +1.', failure: 'Red Lantern runners attacked when {op} tried to protect Kei.' } },
        { id: 'keep_moving', label: 'Keep moving and stay focused on Mr. Lau', kind: 'adapt', stat: 'cool', difficulty: 4,
          success: 'The crew stays on schedule while the runners stop for Kei.', failure: 'Mr. Lau sees what happens, panics and tries to leave the crew in the next crowd.', failureInjury: 'none', failureCost: { clientTrust: -5 },
          report: { success: 'The crew left Kei behind and kept Mr. Lau moving.', failure: 'Leaving Kei behind shook Mr. Lau\'s trust in the crew.' } },
        { id: 'abort', label: 'Abort: put Mr. Lau in a licensed tram cab', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -3 },
          success: 'You pay the driver, give Mr. Lau the cab number and end the protection contract there.', failure: '', failureInjury: 'none',
          report: { success: 'The crew ended the contract and placed Mr. Lau in a licensed tram cab.' } },
      ],
    },
    {
      id: 'navigation_loop',
      after: 1,
      order: 0,
      text: 'Halfway down the hill, the driver\'s old navigation implant starts looping the same junction. Their optic feed shows a clear road, but everyone else can see a delivery tram crossing it.',
      focusRole: 'driver',
      choices: [
        { id: 'drive_blind', label: '{op} kills the implant and drives by sight', kind: 'push', stat: 'driving', difficulty: 7,
          success: '{op} trusts the street instead of the feed and slips behind the tram.', failure: 'The vehicle clips a concrete divider and spins across the wet road.', failureInjury: 'serious',
          report: { success: '{op} disabled a looping navigation implant and drove by sight.', failure: '{op} hit a divider while driving without navigation support.' } },
        { id: 'let_it_settle', label: 'Stop somewhere dim and let the implant settle', kind: 'adapt', stat: 'cool', difficulty: 4, cost: { clientTrust: -2 },
          success: 'The ghost junction clears and the crew finds another route towards the Docks.', failure: 'The convoy\'s tail catches up while the vehicle is parked.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: 'The crew stopped to let the driver\'s navigation implant recover.', failure: 'A tail found the crew while the driver\'s implant recovered. Heat +1.' } },
        { id: 'abort', label: 'Abort: leave the vehicle and put Mr. Lau on a public tram', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'Mr. Lau boards with the case under his coat. The crew leaves the vehicle behind and ends the job.', failure: '', failureInjury: 'none',
          report: { success: 'The crew abandoned the vehicle and sent Mr. Lau on by public tram.' } },
      ],
    },
    {
      id: 'wet_sleeve_checkpoint',
      after: 2, // edge of the Docks
      order: 1,
      text: 'A Wet Sleeve patrol waves the crew into a roadside neural-load checkpoint. Sergeant Ho recognises Mr. Lau and says the inspection can take five minutes or five hours.',
      focusRole: 'face',
      choices: [
        { id: 'pay_ho', label: '{op} pays Sergeant Ho for five minutes', kind: 'adapt', stat: 'social', difficulty: 5, cost: { payCut: 0.15 },
          success: 'Ho pockets the cash and waves everyone through without scanning Mr. Lau or the case.', failure: 'Ho takes the money, then orders another officer to scan the crew anyway.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} bribed Sergeant Ho to clear the checkpoint.', failure: 'Sergeant Ho took the crew\'s bribe and scanned them anyway. Heat +1.' } },
        { id: 'bluff_papers', label: '{op} bluffs the patrol with transit paperwork', kind: 'push', stat: 'cool', difficulty: 7,
          success: 'Ho decides there are easier people to shake down tonight and stamps the papers.', failure: 'A second officer spots a false routing code and pulls the crew aside.', failureInjury: 'none', failureCost: { heat: 1, payCut: 0.1 },
          report: { success: '{op} bluffed the Wet Sleeve checkpoint with transit paperwork.', failure: 'The Wet Sleeve found a false routing code in the crew\'s papers. Heat +1.' } },
        { id: 'abort', label: 'Abort: back out of the queue and call Auntie Fung', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You reverse out before Ho can wave you in. One of Fung\'s nephews collects Mr. Lau from a noodle stall, and the ledger goes nowhere tonight.', failure: '', failureInjury: 'none',
          report: { success: 'The crew backed out of a Wet Sleeve checkpoint and handed Mr. Lau back to Auntie Fung\'s people.' } },
      ],
    },
    {
      id: 'joss_lane',
      after: 2,
      order: 2,
      text: 'The shortest route to Pier 12 cuts through a container lane hung with strips of wet joss paper. Mr. Lau refuses to cross and says somebody has marked the lane for the dead.',
      focusRole: 'infiltrator',
      choices: [
        { id: 'maintenance_lane', label: '{op} finds another way through the container stacks', kind: 'push', stat: 'stealth', difficulty: 7, cost: { clientTrust: -1 },
          success: '{op} finds an unmonitored maintenance lane, and nobody has to touch the paper.', failure: 'A Red Lantern lookout spots the detour and calls the crew\'s route over the radio.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{op} found a maintenance route around the joss-paper lane.', failure: 'A Red Lantern lookout spotted the crew detouring through the stacks. Heat +1.' } },
        { id: 'cross_lane', label: '{op} convinces Mr. Lau that it is only paper', kind: 'adapt', stat: 'social', difficulty: 5,
          success: 'Mr. Lau swears under his breath, grips the case and follows the crew through.', failure: 'Mr. Lau freezes halfway across just as a container carrier turns into the lane.', failureInjury: 'light',
          report: { success: '{op} persuaded Mr. Lau to cross the joss-paper lane.', failure: 'Mr. Lau froze in the container lane and {op} was clipped pulling him clear.' } },
        { id: 'abort', label: 'Abort: return Mr. Lau to the last safe street', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -3 },
          success: 'The crew turns around without touching the paper. Mr. Lau is safe, but Pier 12 is out of reach.', failure: '', failureInjury: 'none',
          report: { success: 'The crew turned back rather than cross the marked container lane.' } },
      ],
    },
    {
      id: 'vehicle_box',
      after: 2,
      order: 3,
      text: 'Three vehicles box the crew in on the final road to Pier 12. The lead car kills its lights, and someone calls Mr. Lau\'s phone: "You know why we\'re here."',
      focusRole: 'driver',
      choices: [
        { id: 'break_box', label: '{op} drives through the narrowing gap', kind: 'push', stat: 'driving', difficulty: 8, cost: { heat: 1 },
          success: '{op} finds half a vehicle\'s width between a barrier and the rear car and takes it.', failure: 'The escape ends against the barrier hard enough to fold the front of the vehicle.', failureInjury: 'serious',
          report: { success: '{op} broke through a three-vehicle box near Pier 12. Heat +1.', failure: '{op} crashed while trying to break through a three-vehicle box.' } },
        { id: 'make_them_hesitate', label: '{op} calls back and gives them a reason to hesitate', kind: 'adapt', stat: 'social', difficulty: 6, cost: { payCut: 0.2 },
          success: '{op} convinces the caller that taking Mr. Lau here will bring attention neither side wants. One car moves.', failure: 'The caller does not buy it. The vehicles close the box until the crew has nowhere left to drive.', failureInjury: 'none', failureCost: { clientTrust: -5 },
          report: { success: '{op} talked the intercepting crew into opening the vehicle box.', failure: 'The intercepting crew ignored {op} and closed the road around Mr. Lau.' } },
        { id: 'abort', label: 'Abort: leave the vehicle and slip Mr. Lau into the stacks on foot', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'You leave the doors open and walk Mr. Lau through a gap in the containers to a Brass Anchor night watchman. He is safe, but the Ferryman\'s boat leaves without him.', failure: '', failureInjury: 'none',
          report: { success: 'The crew abandoned the vehicle and got Mr. Lau away from the box on foot. He missed the boat.' } },
      ],
    },
  ],
  heat: 0,
};
