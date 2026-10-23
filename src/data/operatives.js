// The five starting operatives. Sample content: edit freely.
// Stats 1-20. Traits are ids from data/traits.js.
// Cast leans Hong Kong Chinese (3 of 5) with a multicultural mix, like the city.

/** @type {import('../core/types.js').Operative[]} */
export const STARTING_CREW = [
  {
    id: 'mei',
    name: 'Mei Lin Chau',
    handle: 'Stitch',
    age: 34,
    origin: 'Ex-ER nurse from Old Town, struck off for treating the wrong people.',
    role: 'medic',
    stats: { combat: 6, stealth: 9, tech: 10, social: 11, driving: 7, medical: 15, cool: 14 },
    traits: ['steady_hands', 'cautious'],
    wage: 600,
    bio: 'Dry, unflappable, keeps a running tally of every life she has saved. Hates waste, including wasted people.',
  },
  {
    id: 'jax',
    name: 'Jax Okafor',
    handle: 'Jax',
    age: 27,
    origin: 'Lagos-born, raised in the Docks. Ex-private security, fired for punching a client.',
    role: 'muscle',
    stats: { combat: 15, stealth: 6, tech: 5, social: 8, driving: 9, medical: 4, cool: 7 },
    traits: ['hothead', 'loyal'],
    wage: 550,
    bio: 'Loud, generous and quick to swing. Would walk into fire for the crew and sometimes does without being asked.',
  },
  {
    id: 'wing',
    name: 'Wing Lam',
    handle: 'Static',
    age: 23,
    origin: 'Grew up above her parents\' electronics stall in the Night Market. Dropped out of a corporate engineering academy in Glass Heights; still has her badge.',
    role: 'tech',
    stats: { combat: 4, stealth: 11, tech: 16, social: 7, driving: 6, medical: 5, cool: 9 },
    traits: ['chromed', 'curious'],
    wage: 650,
    bio: 'Talks fast, thinks faster, pushes her neural implants harder than she should. Thinks rules are puzzles.',
  },
  {
    id: 'teo',
    name: 'Teo Vargas',
    handle: 'Wheels',
    age: 41,
    origin: 'Manila-born street racer. Ran getaway for three crews; two of them are dead.',
    role: 'driver',
    stats: { combat: 8, stealth: 8, tech: 9, social: 10, driving: 17, medical: 6, cool: 13 },
    traits: ['veteran', 'superstitious'],
    wage: 600,
    bio: 'Calm, fatherly, keeps a saint on the dashboard and, after twenty years in the city, avoids the number four like a local. Never leaves anyone behind and never talks about the crews he lost.',
  },
  {
    id: 'cherry',
    name: 'Cherry Tse',
    handle: 'Velvet',
    age: 30,
    origin: 'Raised in her uncle\'s mahjong parlour in Old Town, where she learned to read every face at the table.',
    role: 'face',
    stats: { combat: 7, stealth: 12, tech: 8, social: 16, driving: 7, medical: 5, cool: 12 },
    traits: ['silver_tongue', 'greedy'],
    wage: 650,
    bio: 'Charming, ambitious, always half a step from her own exit plan. Loyal while it pays.',
  },
];

// Starting relationships (operative id -> operative id -> trust -100..100).
// Anything not listed starts at 0.
export const STARTING_TRUST = {
  mei: { teo: 40, jax: 10 },
  jax: { teo: 30, cherry: -20 },
  wing: { mei: 25, cherry: 20 },
  teo: { mei: 40, jax: 30 },
  cherry: { jax: -20, wing: 15 },
};
