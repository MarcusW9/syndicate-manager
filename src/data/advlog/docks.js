// Log lines: the Docks. The owner's draft (2026-11-22, docs/log-lines-prompt.md), as pasted.
// In use since slice 1 (2026-11-22): core/advlog.js reads contacts, places and quiet.
export default {
  district: 'docks',

  contacts: [
    { name: 'Lau Wing-sum', what: 'a retired tally clerk who still checks freight totals for the pier shops' },
    { name: 'Nelia Ramos', what: 'a night-shift canteen owner who keeps meals aside for delayed crews' },
    { name: 'Yusuf Aden', what: 'a relief driver who knows which loading queues actually move' },
    { name: 'Cheng Sau-king', what: 'a rope seller who keeps disputed orders tied with different coloured string' },
    { name: 'Arun Bedi', what: 'a young dispatch clerk who writes backup instructions on packing cardboard' },
    { name: 'Fong Mei-ling', what: 'a clinic nurse who treats dockworkers between shifts' },
    { name: 'Celia Baptista', what: 'a marine electrician who refuses to quote before seeing the corrosion' },
    { name: 'Tang Pak-lam', what: 'an elderly handcart repairer who lends tools against a written name' },
    { name: 'Mariam Conteh', what: 'a warehouse caretaker who remembers every key issued on her shift' },
    { name: 'Poon Chi-kit', what: 'a junior freight surveyor who photographs damaged seals before touching them' },
    { name: 'Saira Mir', what: 'a shipping-paper translator who charges extra for documents brought in wet' },
    { name: 'Leila Mensah', what: 'a ferry stores clerk who keeps a separate shelf for uncollected parcels' },
  ],

  places: [
    'the public shelter outside Pier 12 Gantry Gate',
    'the canteen beneath the crane maintenance stairs',
    'the freight counter beside the public weighbridge',
    'the rope shop facing the diesel ferry queue',
    'the handcart repair bench under the overhead monorail',
    'the covered waiting bay beside the container-yard offices',
    'the public noticeboard outside the relief drivers’ room',
    'the shipping-paper kiosk opposite the bonded stores',
    'the parcel shelf at the ferry stores counter',
    'the clinic waiting room above the marine supply shop',
    'the rain shelter beside the old pier clock',
    'the shared washbasins behind the dockside food stalls',
  ],

  quiet: [
    "The crane above the waiting bay stayed parked for inspection. Its warning light blinked through the entire afternoon.",
    "Fog hid the far side of the harbour. The crew heard three ferries before seeing any of them.",
    "A canteen queue formed around the arrival board. Nobody left when the times changed.",
    "The tide lifted a tyre against a pier post at regular intervals. {who} began anticipating the squeak.",
    "An empty container rang every time the wind caught its loose door. Nothing else interrupted the wait.",
    "The crew watched a crane operator eat lunch high above the yard. The lunch break ended; theirs didn't.",
    "A dockside radio repeated the same weather bulletin between freight announcements. Nobody had news for the crew.",
    "Someone had put a plastic stool beneath the departure display. {who} watched three different people claim it.", // fixed: smoother end
  ],

  snag: [
    "Saltwater had got into the public charging point. Replacing a damaged charging lead cost the crew cash.",
    "A Red Lantern toll collector noticed the crew asking freight questions. Their interest in the yard stopped being private.",
    "The Wet Sleeve stopped {who} for a neural-load check. The paperwork disappeared after a cash payment.",
    "A loose edge on a loading-bay barrier scraped {who}'s arm. The canteen owner supplied a dressing.",
    "A truck sprayed dirty water across the crew's paperwork. Replacing the damaged copies cost cash.",
    "The pier office charged a visitor processing fee that wasn't on the board. The clerk pointed to a newer board behind the desk.",
  ],
};
