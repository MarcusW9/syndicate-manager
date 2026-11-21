// Security contracts: posts a client pays the tong to keep (owner, 2026-11-21;
// drafts/PROPOSAL-security-contracts.md). Content only; the rules are in core/contracts.js.
//
// A kind says which stats keep the post, how many runners it wants, how long it runs and how
// its pay is shaped. Its posts are what the client asks for ({client} and {district} are filled
// in). Its day lines are the log the crew sends back: quiet days, good days, rough days, and
// the call that stops the day (an incident, which comes to the player).
//
// Draft text by Claude for the owner to mark (owner, 2026-11-21: Claude drafts, owner marks).

/** Pay per runner-slot for a week, by district (Old Town low, the Heights high). */
// 2026-11-21: 80% of the first draft (550-850), from scripts/sim-crew-income.mjs with posts (docs/sims/crew-income-2026-11-21.md).
export const SLOT_PAY = { oldTown: 450, docks: 500, nightMarket: 500, amberReach: 550, basin: 600, heights: 700 };

/** How hard a district's posts are to keep, added to CONTRACT.difficulty. */
export const POST_THREAT = { oldTown: 0, docks: 1, nightMarket: 1, amberReach: 1, basin: 2, heights: 3 };

export const CONTRACT_KINDS = {
  guard: {
    name: 'Guard',
    stats: ['combat', 'cool'],
    slots: 2, days: [7, 7], payShape: 1,
    blurb: 'Keep a door. Look like trouble so trouble goes elsewhere.',
    posts: [
      'Stand the back door of {client}\'s place in {district} for the week.',
      'Keep the stairwell at {client}\'s stockroom in {district} clear of visitors.',
      'Sit on {client}\'s loading bay in {district} until the shipment is counted.',
    ],
    quiet: [
      '{who} kept the door. Nobody tried it.',
      'A long night on the post. Rain, noodles, nothing else.',
      '{who} turned away two drunks and a man selling umbrellas.',
      'Deliveries came and went. {who} checked every one.',
    ],
    good: [
      '{who} spotted a lookout across the street and stared until he left. {client} saw it.',
      'A regular slipped {who} a tip for keeping the street calm.',
    ],
    rough: [
      'Someone tested the door at three in the morning. {who} took a knock sending them off.',
      'A shouting match on the step turned into a shove. {who} ended it, not gently.',
    ],
    incident: '{n} people came at the door together, and they did not come to talk. {who} is holding it and calling it in.',
  },
  escort: {
    name: 'Escort',
    stats: ['piloting', 'stealth'],
    slots: 3, days: [2, 4], payShape: 1.5,
    blurb: 'Get someone or something across the city in one piece.',
    posts: [
      'Walk {client}\'s courier and a sealed case across {district} and back.',
      'Drive {client}\'s cousin to three meetings in {district} without anyone following.',
      'Move a crate for {client} through {district} on the quiet roads.',
    ],
    quiet: [
      'The route was clean. {who} took the long way twice to be sure.',
      'A slow day of waiting outside meetings. Nothing followed them home.',
      '{who} changed cars at the halfway point. Nobody noticed.',
    ],
    good: [
      '{who} found a shortcut through a car park nobody watches. {client} was impressed.',
      'The package arrived early, and {client} rounded up the fee.',
    ],
    rough: [
      'A bike tailed them for six blocks. {who} lost it, and clipped a kerb doing it.',
      'A checkpoint went up on the route. {who} talked them through it, but the street noticed.',
    ],
    incident: 'A van boxed them in at a junction, {n} doors opening at once. {who} has the package and is calling it in.',
  },
  watch: {
    name: 'Watch',
    stats: ['social', 'cool'],
    slots: 2, days: [7, 7], payShape: 1,
    blurb: 'Mind a stall row on market nights. Keep the peace, keep it friendly.',
    posts: [
      'Mind {client}\'s stall row in {district} on market nights this week.',
      'Keep the peace at {client}\'s mahjong hall in {district} until the tournament ends.',
      'Walk the arcade in {district} for {client}, and settle arguments before they cost anyone a window.',
    ],
    quiet: [
      '{who} walked the row, bought skewers and settled a dispute about a dog.',
      'A busy night, a good-natured crowd. {who} barely had to speak.',
      'Two stallholders argued about a pitch. {who} split it down the middle.',
    ],
    good: [
      '{who} heard where a rival crew drinks. It is worth knowing, and {client} paid for it.',
      'The stallholders chipped in for {who} at the end of the night.',
    ],
    rough: [
      'A pickpocket ran and {who} followed. The chase went badly.',
      'A protection crew from the next street came by to see who was in charge. {who} was, just.',
    ],
    incident: '{n} people from another crew have taken over the row and are collecting from the stalls. {who} is watching and calling it in.',
  },
};

/** The player's answer when a post is hit (an incident). Lines for how it went. */
export const INCIDENT_LINES = {
  held: 'They held. The others backed off, and {client} heard who stood their ground.',
  lost: 'They could not hold it. {who} came home hurt and the post is gone.',
  gaveUp: 'They gave it up and walked away. Everyone came home; {client} is not pleased.',
};

/** A post's fight as a run (core/contracts.js startPostFight): never on the board. id `post:<district>:<kind>`. */
export const postTemplate = (district, kind = 'guard') => ({
  id: `post:${district}:${kind}`, post: true, district, name: `${CONTRACT_KINDS[kind]?.name ?? 'Guard'} post`, threat: 2, pay: 0, heat: 0, days: 0, crewSize: 2,
  keyStats: CONTRACT_KINDS[kind]?.stats ?? ['combat', 'cool'], beats: ['The post is hit.'], crises: [],
  brief: 'The post is hit, and whoever is on it is holding it.',
});
