// Incidents: the small automatic moments of a run (DESIGN.md, 2026-10-27). Data only; the rules
// are in core/incidents.js. Whoever on the inside team has the best odds with any of `stats`
// handles it. A `danger` incident puts that person at risk: if they fail, one teammate gets a
// save roll (`comp` is the moment they're in trouble). Unsaved failures land `fail`.
//
// Text is generic (Claude's draft, 2026-10-27) with the usual slots: {op} is whoever handles
// it, {district} and {faction} the job's district. District text is a later writing task
// (PLAN-CORE-LOOP.md, slice 4). hOk / hBad are the short headlines; ok / bad the detail.
// diff: added to the job's typical roll difficulty (core/risk.js rollTarget), so incidents
// scale with the work. Failure costs stay small: never worse than a serious injury.
// guards: a danger incident that goes unsaved starts a fight with this many (slice 6;
// core/battle.js), which replaces the old serious-wound roll.

export const INCIDENTS = {
  lock: {
    name: 'Locked door', situations: ['entry', 'street-tech'], stats: ['tech', 'stealth'], diff: 0,
    text: 'The way in has a new mag-lock on it.',
    hOk: '{op} opens the lock', ok: '{op} has it open without a sound.',
    hBad: 'The lock squawks', bad: 'The lock chirps an error at {op}. Somewhere, a light comes on.',
    fail: { alert: 1 },
  },
  camera: {
    name: 'Cameras', situations: ['corp-tech'], stats: ['tech', 'stealth'], diff: 0,
    text: 'A camera sweeps the way ahead.',
    hOk: '{op} loops the camera', ok: '{op} loops the feed. The camera watches an empty corridor on repeat.',
    hBad: 'Caught on camera', bad: 'The camera catches {op}\'s shoulder for half a second.',
    fail: { alert: 1 },
  },
  patrol: {
    name: 'Patrol', situations: ['entry'], stats: ['stealth'], diff: 0, danger: true, guards: 1,
    text: 'A guard on patrol, torch low, coming this way.',
    hOk: '{op} slips the patrol', ok: '{op} waits in the dark until the torch passes.',
    hBad: 'Spotted by a patrol', bad: 'The torch finds {op}.', comp: '"Oi!" The guard is on {op} before they can move.',
    fail: { alert: 1, heat: 1 },
  },
  guard: {
    name: 'Guard up close', situations: ['fight', 'threat'], stats: ['combat'], diff: 0, danger: true, guards: 1,
    text: 'A guard steps round the corner, right in front of {op}.',
    hOk: '{op} drops the guard', ok: '{op} puts him down quietly and zip-ties his wrists.',
    hBad: '{op} is cornered', bad: 'He\'s bigger than he looked, and he has {op} against the wall.', comp: '{op} is cornered.',
    fail: { alert: 1, injury: true },
  },
  backup: {
    name: 'More guards', situations: ['fight'], stats: ['combat'], diff: 1, danger: true, guards: 2,
    text: 'Two more guards come running.',
    hOk: '{op} handles the guards', ok: '{op} meets them in the gap and ends it fast.',
    hBad: '{op} is pinned down', bad: 'They split up and one gets behind {op}.', comp: '{op} is pinned down.',
    fail: { alert: 1, injury: true },
  },
  checkpoint: {
    name: 'Checkpoint', situations: ['law'], stats: ['social'], diff: 0,
    text: 'Someone official is checking passes at the inner door.',
    hOk: '{op} talks through', ok: '{op} hands over the pass and complains about the night shift. Waved through.',
    hBad: 'They want a supervisor', bad: 'The officer wants to call {op}\'s supervisor.',
    fail: { alert: 1 },
  },
  staff: {
    name: 'Staff about', situations: ['crowd'], stats: ['social', 'stealth'], diff: -1,
    text: 'Two night staff on a smoke break, right by the door.',
    hOk: '{op} blends in', ok: '{op} bums a light and walks in behind them.',
    hBad: 'The staff get curious', bad: '{op} gets a long, curious look.',
    fail: { alert: 1 },
  },
  sweep: {
    name: 'Drone sweep', situations: ['corp-tech'], stats: ['tech', 'stealth'], diff: 0,
    text: 'A security drone comes over the roofline, scanning.',
    hOk: '{op} fools the drone', ok: '{op} spoofs its scanner. It drifts off.',
    hBad: 'The drone pings them', bad: 'The drone pings {op} and circles back.',
    fail: { alert: 1 },
  },
  firewall: {
    name: 'Firewall', situations: ['corp-tech', 'neural'], stats: ['tech'], diff: 1,
    text: 'What you came for sits behind a corporate firewall.',
    hOk: '{op} is through the firewall', ok: '{op} is through in ninety seconds.',
    hBad: 'Black ICE bites {op}', bad: 'Black ICE bites. {op} jerks back from the jack, nose bleeding.',
    fail: { alert: 1, neural: 15 },
  },
  safe: {
    name: 'The goods', situations: ['entry'], stats: ['tech', 'stealth'], diff: 0,
    text: 'What you came for is behind one last lock.',
    hOk: '{op} has it', ok: '{op} gets it done and leaves no sign.',
    hBad: '{op} only gets part of it', bad: 'Footsteps. {op} only gets part of it before they have to go.',
    fail: { alert: 1, payCut: 0.15 },
  },
  hold: {
    name: 'Holding the room', situations: ['fight', 'threat'], stats: ['combat', 'cool'], diff: 0, danger: true, guards: 2,
    text: 'The people at the target don\'t want to cooperate.',
    hOk: '{op} holds the room', ok: '{op} keeps everyone on the floor and calm.',
    hBad: 'Someone makes a move', bad: 'Someone goes for {op}.', comp: '{op} has a fight on their hands.',
    fail: { alert: 1, injury: true, payCut: 0.15 },
  },
  mark: {
    name: 'The contact', situations: ['crowd', 'threat'], stats: ['social', 'cool'], diff: 0,
    text: 'The one person with access has to believe {op}.',
    hOk: '{op} sells it', ok: '{op} gets the access and a handshake.',
    hBad: 'The contact gets suspicious', bad: 'The contact hesitates, then makes a call. {op} gets half of what you came for.',
    fail: { alert: 1, payCut: 0.15 },
  },
};

// The zones of a run, in order. The rifle on overwatch can see `open` zones only; the drone sees all.
export const ZONES = {
  in: { name: 'The way in', open: true },
  inside: { name: 'Inside', open: true },
  target: { name: 'The target', open: false },
  out: { name: 'The way out', open: true },
};

// What each approach tends to meet in each zone (incident ids, drawn at random).
export const ZONE_POOLS = {
  in: { stealth: ['patrol', 'lock'], tech: ['camera', 'lock'], loud: ['guard', 'lock'], con: ['checkpoint', 'staff'] },
  inside: { stealth: ['patrol', 'sweep', 'camera'], tech: ['sweep', 'camera'], loud: ['backup', 'guard'], con: ['staff', 'checkpoint'] },
  target: { stealth: ['safe'], tech: ['firewall'], loud: ['hold'], con: ['mark'] },
};

// Off-approach trouble: on any run but a loud one, an inside incident is sometimes a guard up close.
// A fighter (or overwatch) is the insurance.
export const OFF_APPROACH = { chance: 0.25, incident: 'guard' };

// Max alert (3) and a serious injury each stop the run for a decision. Every decision has an exit.
export const ALERT_MAX = 3;
