// Incident text per district (PLAN-CORE-LOOP.md, slice 4; writing task 11 in drafts/writing-tasks.md).
// Content only. Each district can replace any incident's lines; anything not given here falls back
// to the generic text in data/incidents.js. Only these lines can change (the rules can't):
//   text, hOk, ok, hBad, bad, comp (comp only on danger incidents: patrol, guard, backup, hold)
// Keep {op} wherever a person is meant; {district} and {faction} work too.
// Headlines are 3-6 words; each other line is one sentence.
//
// Docks: container yard, yard office, crane and harbour.
// Old Town: alley steps, laundry courtyard, tenement flat and rooftop tank.
// Night Market: market gate, stalls, footbridge, mahjong back room.
// Glass Heights: loading bay, plaza, tower, server room.
// Basin: service gate, stable rows, floodlight tower, vet block.

export const DISTRICT_INCIDENTS = {
  docks: {
    lock: {
      text: 'A new mag-lock holds the yard gate shut beneath a crust of salt.',
      hOk: '{op} opens the yard gate',
      ok: '{op} releases the lock without disturbing the chain against the fence.',
      hBad: 'The yard lock squawks',
      bad: 'The reader chirps an error at {op}, and a light comes on in the gate booth.',
    },

    camera: {
      text: 'A camera on a rusted bracket sweeps the lane between the containers.',
      hOk: '{op} loops the yard camera',
      ok: '{op} loops the feed so the monitor shows the same empty container lane.',
      hBad: 'Caught between the containers',
      bad: 'The camera catches {op}\'s shoulder beneath the amber yard lights.',
    },

    patrol: {
      text: 'A yard guard comes between the container stacks with a torch held below the fog.',
      hOk: '{op} slips the yard patrol',
      ok: '{op} waits behind a container corner until the torch moves on.',
      hBad: 'Spotted in the container lane',
      bad: 'The torch finds {op} against the corrugated steel.',
      comp: 'The guard closes on {op} before they can get behind the next stack.',
    },

    guard: {
      text: 'A yard guard steps around a container corner straight into {op}.',
      hOk: '{op} drops the yard guard',
      ok: '{op} puts the guard down quietly and zip-ties his wrists beside the container.',
      hBad: '{op} is cornered against steel',
      bad: 'The guard drives {op} back against the corrugated container wall.',
      comp: '{op} is trapped between the guard and a locked container door.',
    },

    backup: {
      text: 'Two more guards come running between the stacks as their radios crackle.',
      hOk: '{op} stops the extra guards',
      ok: '{op} catches both guards in the narrow container gap and ends it fast.',
      hBad: '{op} is pinned between stacks',
      bad: 'The guards split around a container and one gets behind {op}.',
      comp: '{op} is caught between two guards in the container lane.',
    },

    checkpoint: {
      text: 'A yard security officer checks work passes at the office entrance.',
      hOk: '{op} talks past yard security',
      ok: '{op} presents the pass and complains about another unpaid night shift until the officer waves them through.',
      hBad: 'Security wants a supervisor',
      bad: 'The officer keeps {op}\'s pass and reaches for the supervisor directory.',
    },

    staff: {
      text: 'Two night-shift cargo clerks smoke beneath the office awning beside the door.',
      hOk: '{op} joins the night shift',
      ok: '{op} bums a light and follows the clerks through the office door.',
      hBad: 'The cargo clerks get curious',
      bad: 'One clerk studies {op} over a cigarette while the other holds the door.',
    },

    sweep: {
      text: 'A security drone clears the container stacks with its scanner sweeping the wet tarmac.',
      hOk: '{op} fools the yard drone',
      ok: '{op} spoofs the scanner and the drone drifts towards the next container row.',
      hBad: 'The yard drone circles back',
      bad: 'The scanner pings {op} and the drone banks back over the stacks.',
    },

    firewall: {
      text: 'The yard-office terminal keeps the target behind an Aether-Harbour corporate firewall.',
      hOk: '{op} breaches the yard firewall',
      ok: '{op} gets through in ninety seconds while the terminal fan grinds against its housing.',
      hBad: 'Yard security ICE bites {op}',
      bad: 'Black ICE hits the connection and {op} pulls back from the jack with blood under their nose.',
    },

    safe: {
      text: 'One last lock seals the target inside a salt-pitted cabinet in the yard office.',
      hOk: '{op} gets the goods',
      ok: '{op} opens the cabinet and finishes without leaving a mark.',
      hBad: '{op} gets only part',
      bad: 'Boots ring on the office steps and {op} takes only what they can reach before leaving.',
    },

    hold: {
      text: 'The people inside the yard office stop talking and refuse to cooperate.',
      hOk: '{op} holds the yard office',
      ok: '{op} keeps everyone calm on the office floor beneath the humming strip light.',
      hBad: 'Someone moves behind the desk',
      bad: 'Someone lunges at {op} from beside the cargo desk.',
      comp: '{op} has a fight on their hands in the cramped yard office.',
    },

    mark: {
      text: 'The yard clerk with access studies {op} through the office hatch and waits for an explanation.',
      hOk: '{op} wins the clerk over',
      ok: '{op} gets the access and a handshake through the hatch.',
      hBad: 'The yard clerk gets suspicious',
      bad: 'The clerk hesitates and makes a call, leaving {op} with only part of what they came for.',
    },
  },

  oldTown: {
    lock: {
      text: 'A new mag-lock holds the tenement gate shut beneath layers of flaking green paint.',
      hOk: '{op} opens the tenement gate',
      ok: '{op} releases the lock without rattling the loose bars.',
      hBad: 'The tenement lock squawks',
      bad: 'The reader chirps an error at {op}, and a light comes on above the stairwell.',
    },

    camera: {
      text: 'A cheap security camera sweeps the courtyard beneath the dripping laundry.',
      hOk: '{op} loops the courtyard camera',
      ok: '{op} loops the feed so the monitor keeps showing an empty courtyard.',
      hBad: 'Caught beneath the laundry',
      bad: 'The camera catches {op}\'s shoulder between two hanging bedsheets.',
    },

    patrol: {
      text: 'A hired watchman comes down the alley steps with a torch trained on the wet concrete.',
      hOk: '{op} slips the alley patrol',
      ok: '{op} waits in a recessed doorway until the torch passes down the steps.',
      hBad: 'Spotted on the alley steps',
      bad: 'The torch finds {op} beside the damp stairwell wall.',
      comp: 'The watchman reaches {op} before they can slip into the courtyard.',
    },

    guard: {
      text: 'A hired guard rounds the stairwell landing and stops directly in front of {op}.',
      hOk: '{op} drops the stairwell guard',
      ok: '{op} puts the guard down quietly and zip-ties his wrists beside the stairs.',
      hBad: '{op} is cornered on concrete',
      bad: 'The guard forces {op} against the stairwell wall beneath the exposed wiring.',
      comp: '{op} is trapped on the landing with the guard blocking the stairs.',
    },

    backup: {
      text: 'Two more guards come running across the courtyard beneath the laundry lines.',
      hOk: '{op} stops the courtyard guards',
      ok: '{op} catches both guards in the narrow passage and ends it fast.',
      hBad: '{op} is pinned in the courtyard',
      bad: 'The guards split around the hanging sheets and one gets behind {op}.',
      comp: '{op} is caught between two guards beneath the dripping laundry.',
    },

    checkpoint: {
      text: 'A building security officer checks work passes at the inner stairwell door.',
      hOk: '{op} talks past building security',
      ok: '{op} presents the pass and complains about another midnight maintenance call until the officer waves them through.',
      hBad: 'Security wants the maintenance supervisor',
      bad: 'The officer asks for {op}\'s supervisor and reaches for the wall handset.',
    },

    staff: {
      text: 'Two night cleaners smoke beside the tenement door with their buckets propping it open.',
      hOk: '{op} blends with the cleaners',
      ok: '{op} bums a light and follows the cleaners through the propped door.',
      hBad: 'The night cleaners get curious',
      bad: 'One cleaner gives {op} a long look over the rim of a chipped tea flask.',
    },

    sweep: {
      text: 'A security drone clears the rooftop water tank and scans down into the courtyard.',
      hOk: '{op} fools the courtyard drone',
      ok: '{op} spoofs the scanner and the drone drifts past the laundry towards the next block.',
      hBad: 'The courtyard drone circles back',
      bad: 'The scanner pings {op} and the drone turns back above the courtyard.',
    },

    firewall: {
      text: 'The target sits behind a corporate firewall on a second-hand terminal inside the flat.',
      hOk: '{op} breaches the terminal firewall',
      ok: '{op} gets through in ninety seconds while the terminal rattles on its folding table.',
      hBad: 'Corporate security ICE bites {op}',
      bad: 'Black ICE hits the connection and {op} jerks away from the jack with blood under their nose.',
    },

    safe: {
      text: 'One last lock seals the target inside a steel cabinet wedged against the flat\'s damp wall.',
      hOk: '{op} gets the goods',
      ok: '{op} opens the cabinet and finishes without disturbing the dust around the lock.',
      hBad: '{op} gets only part',
      bad: 'Footsteps scrape up the stairs and {op} takes only what they can reach before leaving.',
    },

    hold: {
      text: 'The people inside the flat refuse to cooperate and crowd around the folding table.',
      hOk: '{op} holds the tenement flat',
      ok: '{op} keeps everyone calm on the floor between the table and the stacked plastic stools.',
      hBad: 'Someone moves beside the table',
      bad: 'Someone pushes a stool aside and goes for {op}.',
      comp: '{op} has a fight on their hands with barely room to turn inside the flat.',
    },

    mark: {
      text: 'The person with access keeps the flat\'s security chain on while listening to {op}.',
      hOk: '{op} wins the contact over',
      ok: '{op} gets the access and a handshake after the chain comes off.',
      hBad: 'The flat contact gets suspicious',
      bad: 'The contact hesitates and makes a call, leaving {op} with only part of what they came for.',
    },
  },

  nightMarket: {
    lock: {
      text: 'A new mag-lock holds the market service gate shut beneath a flickering implant advertisement.',
      hOk: '{op} opens the market gate',
      ok: '{op} releases the lock without rattling the gate against its grease-stained frame.',
      hBad: 'The market lock squawks',
      bad: 'The reader chirps an error at {op}, and a light comes on behind the service hatch.',
    },

    camera: {
      text: 'A camera above a counterfeit watch stall sweeps the lane between the awnings.',
      hOk: '{op} loops the market camera',
      ok: '{op} loops the feed so the monitor keeps showing an empty stretch of market lane.',
      hBad: 'Caught beneath the shop signs',
      bad: 'The camera catches {op}\'s shoulder between two flickering holo-ads.',
    },

    patrol: {
      text: 'A market guard comes between the shuttered stalls with a torch cutting through the cooking smoke.',
      hOk: '{op} slips the market patrol',
      ok: '{op} waits behind stacked delivery crates until the torch passes towards the gate.',
      hBad: 'Spotted between the market stalls',
      bad: 'The torch finds {op} beside a shuttered implant stall.',
      comp: 'The guard reaches {op} before they can slip into the next stall lane.',
    },

    guard: {
      text: 'A parlour guard pushes through a hanging plastic curtain directly in front of {op}.',
      hOk: '{op} drops the parlour guard',
      ok: '{op} puts the guard down quietly and zip-ties his wrists behind the curtain.',
      hBad: '{op} is cornered behind stalls',
      bad: 'The guard forces {op} against a steel shutter beneath a dead betting display.',
      comp: '{op} is trapped between the guard and the shuttered stall.',
    },

    backup: {
      text: 'Two more guards come running between the stalls with their radios crackling over the market noise.',
      hOk: '{op} stops the extra guards',
      ok: '{op} catches both guards in the narrow gap between the stalls and ends it fast.',
      hBad: '{op} is pinned between stalls',
      bad: 'The guards split around a closed food stall and one gets behind {op}.',
      comp: '{op} is caught between two guards in the cramped market lane.',
    },

    checkpoint: {
      text: 'A security attendant checks staff passes at the mahjong parlour entrance.',
      hOk: '{op} talks past parlour security',
      ok: '{op} presents the pass and complains about another unpaid late shift until the attendant waves them through.',
      hBad: 'Security wants the shift supervisor',
      bad: 'The attendant holds {op}\'s pass beside the reader and reaches for the supervisor handset.',
    },

    staff: {
      text: 'Two parlour workers smoke beside the service door with their aprons rolled under their arms.',
      hOk: '{op} blends with the workers',
      ok: '{op} bums a light and follows the workers through the service door.',
      hBad: 'The parlour workers get curious',
      bad: 'One worker gives {op} a long look while tapping ash into an empty noodle bowl.',
    },

    sweep: {
      text: 'A security drone clears the footbridge and scans the lanes beneath the patched market awnings.',
      hOk: '{op} fools the market drone',
      ok: '{op} spoofs the scanner and the drone drifts away above the stall roofs.',
      hBad: 'The market drone circles back',
      bad: 'The scanner pings {op} and the drone turns back beneath the footbridge.',
    },

    firewall: {
      text: 'The back-room terminal keeps the target behind a corporate firewall running on second-hand hardware.',
      hOk: '{op} breaches the parlour firewall',
      ok: '{op} gets through in ninety seconds while mahjong tiles clack beyond the partition.',
      hBad: 'Back-room security ICE bites {op}',
      bad: 'Black ICE hits the connection and {op} jerks away from the jack with blood under their nose.',
    },

    safe: {
      text: 'One last lock seals the target inside a steel cabinet behind the mahjong parlour.',
      hOk: '{op} gets the goods',
      ok: '{op} opens the cabinet and finishes without leaving a mark around the lock.',
      hBad: '{op} gets only part',
      bad: 'Footsteps stop outside the back room and {op} takes only what they can reach before leaving.',
    },

    hold: {
      text: 'The people in the mahjong back room stop counting money and refuse to cooperate.',
      hOk: '{op} holds the back room',
      ok: '{op} keeps everyone calm on the floor between the mahjong table and the cash cabinets.',
      hBad: 'Someone moves behind the table',
      bad: 'Someone shoves a plastic chair aside and goes for {op}.',
      comp: '{op} has a fight on their hands between the table and the locked cash cabinets.',
    },

    mark: {
      text: 'The parlour attendant with access studies {op} over a chipped cup of milk tea.',
      hOk: '{op} wins the attendant over',
      ok: '{op} gets the access and a handshake across the tea-stained counter.',
      hBad: 'The parlour attendant gets suspicious',
      bad: 'The attendant hesitates and makes a call, leaving {op} with only part of what they came for.',
    },
  },

  heights: {
    lock: {
      text: 'A new mag-lock seals the loading-bay access door beneath a spotless contractor safety notice.',
      hOk: '{op} opens the service door',
      ok: '{op} releases the lock without a sound from the flush-mounted door.',
      hBad: 'The service lock squawks',
      bad: 'The reader chirps an error at {op}, and a light comes on behind the security glass.',
    },

    camera: {
      text: 'A recessed camera sweeps the plaza between the precisely spaced planters.',
      hOk: '{op} loops the plaza camera',
      ok: '{op} loops the feed so the security monitor keeps showing an empty plaza.',
      hBad: 'Caught crossing the corporate plaza',
      bad: 'The camera catches {op}\'s shoulder against the pale stone of the plaza.',
    },

    patrol: {
      text: 'A private security guard crosses the plaza with a torch held low beside the planters.',
      hOk: '{op} slips the plaza patrol',
      ok: '{op} waits behind a concrete planter until the torch passes towards the loading bay.',
      hBad: 'Spotted beside the corporate planters',
      bad: 'The torch finds {op} against the tower\'s spotless service wall.',
      comp: 'The guard closes on {op} before they can get behind the next planter.',
    },

    guard: {
      text: 'A private security guard rounds the service entrance directly in front of {op}.',
      hOk: '{op} drops the corporate guard',
      ok: '{op} puts the guard down quietly and zip-ties his wrists beside the service door.',
      hBad: '{op} is cornered against glass',
      bad: 'The guard forces {op} against the reinforced glass beside the entrance.',
      comp: '{op} is trapped between the guard and the sealed service door.',
    },

    backup: {
      text: 'Two more private guards run across the plaza with their smartlinked weapons held ready.',
      hOk: '{op} stops the corporate backup',
      ok: '{op} catches both guards in the gap between the planters and ends it fast.',
      hBad: '{op} is pinned in the plaza',
      bad: 'The guards split around the planters and one gets behind {op}.',
      comp: '{op} is caught between two private guards on the exposed plaza.',
    },

    checkpoint: {
      text: 'A corporate security officer checks contractor passes at the inner service door.',
      hOk: '{op} talks past corporate security',
      ok: '{op} presents the pass and complains about overnight maintenance until the officer waves them through.',
      hBad: 'Security wants the contractor supervisor',
      bad: 'The officer holds {op}\'s pass against the desk and opens the supervisor directory.',
    },

    staff: {
      text: 'Two overnight maintenance workers smoke beside the loading-bay door beneath a no-smoking notice.',
      hOk: '{op} blends with maintenance staff',
      ok: '{op} bums a light and follows the workers through the loading-bay door.',
      hBad: 'The maintenance workers get curious',
      bad: 'One worker gives {op} a long look while the other pauses beside the door reader.',
    },

    sweep: {
      text: 'A security drone clears the neighbouring tower and scans the plaza in cold blue light.',
      hOk: '{op} fools the corporate drone',
      ok: '{op} spoofs the scanner and the drone drifts towards the next tower.',
      hBad: 'The corporate drone circles back',
      bad: 'The scanner pings {op} and the drone turns back over the plaza.',
    },

    firewall: {
      text: 'The server room keeps the target behind a corporate firewall beneath the steady hum of filtered air.',
      hOk: '{op} breaches the corporate firewall',
      ok: '{op} gets through in ninety seconds beneath the server racks\' cold status lights.',
      hBad: 'Corporate security ICE bites {op}',
      bad: 'Black ICE hits the connection and {op} jerks away from the jack with blood under their nose.',
    },

    safe: {
      text: 'One last lock seals the target inside a secured cabinet in the tower.',
      hOk: '{op} gets the goods',
      ok: '{op} opens the cabinet and finishes without leaving a mark on its brushed-metal face.',
      hBad: '{op} gets only part',
      bad: 'Footsteps approach along the carpeted corridor and {op} takes only what they can reach before leaving.',
    },

    hold: {
      text: 'The people inside the server room refuse to cooperate beneath the corporate conduct notices.',
      hOk: '{op} holds the server room',
      ok: '{op} keeps everyone calm on the floor between the humming server racks.',
      hBad: 'Someone moves between the racks',
      bad: 'Someone steps out from behind a server rack and goes for {op}.',
      comp: '{op} has a fight on their hands in the narrow aisle between the racks.',
    },

    mark: {
      text: 'The technician with access studies {op} through the server room\'s security glass.',
      hOk: '{op} wins the technician over',
      ok: '{op} gets the access and a handshake beneath the contractor conduct notice.',
      hBad: 'The corporate technician gets suspicious',
      bad: 'The technician hesitates and makes a call, leaving {op} with only part of what they came for.',
    },
  },

  basin: {
    lock: {
      text: 'A new mag-lock secures the stable service gate beneath a faded race-night delivery notice.',
      hOk: '{op} opens the stable gate',
      ok: '{op} releases the lock without rattling the gate beside the sleeping stable row.',
      hBad: 'The stable lock squawks',
      bad: 'The reader chirps an error at {op}, and a light comes on in the service booth.',
    },

    camera: {
      text: 'A security camera sweeps the service lane between the stable rows.',
      hOk: '{op} loops the stable camera',
      ok: '{op} loops the feed so the monitor keeps showing an empty lane outside the stalls.',
      hBad: 'Caught beside the stable doors',
      bad: 'The camera catches {op}\'s shoulder beneath the stable row\'s yellow work lights.',
    },

    patrol: {
      text: 'An Association guard walks the stable lane with a torch kept low beneath the stall windows.',
      hOk: '{op} slips the stable patrol',
      ok: '{op} waits behind stacked feed sacks until the torch passes towards the service gate.',
      hBad: 'Spotted along the stable row',
      bad: 'The torch finds {op} beside the stable block\'s hose reel.',
      comp: 'The guard reaches {op} before they can get behind the feed trolley.',
    },

    guard: {
      text: 'An Association guard rounds the stable block directly in front of {op}.',
      hOk: '{op} drops the Association guard',
      ok: '{op} puts the guard down quietly and zip-ties his wrists beside the stable block.',
      hBad: '{op} is cornered by stables',
      bad: 'The guard forces {op} against the stable block\'s concrete outer wall.',
      comp: '{op} is trapped between the guard and a locked stable-block service door.',
    },

    backup: {
      text: 'Two more Association guards come running along the service lane outside the stables.',
      hOk: '{op} stops the Association backup',
      ok: '{op} catches both guards in the gap beside a feed trolley and ends it fast.',
      hBad: '{op} is pinned beside stables',
      bad: 'The guards split around the trolley and one gets behind {op}.',
      comp: '{op} is caught between two Association guards outside the stable block.',
    },

    checkpoint: {
      text: 'An Association security officer checks staff passes at the vet block entrance.',
      hOk: '{op} talks past Association security',
      ok: '{op} presents the pass and complains about another overnight shift until the officer waves them through.',
      hBad: 'Security wants the shift supervisor',
      bad: 'The officer keeps {op}\'s pass beside the reader and reaches for the supervisor roster.',
    },

    staff: {
      text: 'Two night cleaners smoke beside the vet block service door with their trolleys parked against the wall.',
      hOk: '{op} blends with course staff',
      ok: '{op} bums a light and follows the cleaners through the service door.',
      hBad: 'The course cleaners get curious',
      bad: 'One cleaner gives {op} a long look while stubbing a cigarette into a sand-filled tin.',
    },

    sweep: {
      text: 'A security drone clears the vet block roof and scans the stable lanes beneath the floodlights.',
      hOk: '{op} fools the course drone',
      ok: '{op} spoofs the scanner and the drone drifts towards the empty track.',
      hBad: 'The course drone circles back',
      bad: 'The scanner pings {op} and the drone turns back above the service lane.',
    },

    firewall: {
      text: 'The vet block terminal keeps the target behind a corporate-grade Association firewall.',
      hOk: '{op} breaches the Association firewall',
      ok: '{op} gets through in ninety seconds beside a printer stacked with telemetry reports.',
      hBad: 'Association security ICE bites {op}',
      bad: 'Black ICE hits the connection and {op} jerks away from the jack with blood under their nose.',
    },

    safe: {
      text: 'One last lock seals the target inside a secured cabinet in the vet block.',
      hOk: '{op} gets the goods',
      ok: '{op} opens the cabinet and finishes without disturbing the neatly labelled drawers.',
      hBad: '{op} gets only part',
      bad: 'Footsteps approach along the tiled corridor and {op} takes only what they can reach before leaving.',
    },

    hold: {
      text: 'The people inside the vet block office refuse to cooperate and stay crowded around the desk.',
      hOk: '{op} holds the vet office',
      ok: '{op} keeps everyone calm on the office floor beneath the pinned race schedules.',
      hBad: 'Someone moves behind the desk',
      bad: 'Someone pushes away from the desk and goes for {op}.',
      comp: '{op} has a fight on their hands between the desk and the filing cabinets.',
    },

    mark: {
      text: 'The course employee with access studies {op} over a clipboard of overnight work orders.',
      hOk: '{op} wins the employee over',
      ok: '{op} gets the access and a handshake across the work-order clipboard.',
      hBad: 'The course employee gets suspicious',
      bad: 'The employee hesitates and makes a call, leaving {op} with only part of what they came for.',
    },
  },
};
