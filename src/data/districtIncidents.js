// Incident text per district (PLAN-CORE-LOOP.md, slice 4; writing task 11 in drafts/writing-tasks.md).
// Content only. Each district can replace any incident's lines; anything not given here falls back
// to the generic text in data/incidents.js. Only these lines can change (the rules can't):
//   text, hOk, ok, hBad, bad, comp (comp only on danger incidents: patrol, guard, backup, hold)
// Keep {op} wherever a person is meant; {district} and {faction} work too.
// Headlines are 3-6 words; each other line is one sentence.
//
// Docks: container yard, yard office, crane and harbour.
// Old Town: alley steps, laundry courtyard, tenement flat and rooftop tank.

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

  nightMarket: {},
  heights: {},
  basin: {},
};
