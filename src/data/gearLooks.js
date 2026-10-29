// Gear looks (DESIGN.md 2026-10-29): what a gun is made of and what it's called. Content only:
// core/looks.js rolls them, ui/art.js draws them (its palettes use the same ids).
//
// A rifle's look is { frame, finish, engraving, charm, glow? }; a sidearm's { frame, finish, mod,
// charm, glow? }. Names are two words: one from what it's made of, one from the frame ("Vermilion
// Heron", "Ultraviolet Volt Fox"). glows: true marks a part that lights up; only a gun with one
// rolls a glow colour, so most guns don't glow.

// The colours a gun's lights can glow (light strips, vents, circuits, holo sights; a laser is always red).
export const GLOWS = {
  cyan: { name: 'cyan', words: ['Ice', 'Cyan'] },
  violet: { name: 'neon purple', words: ['Violet', 'Ultraviolet'] },
  red: { name: 'red', words: ['Crimson', 'Red Neon'] },
  gold: { name: 'gold', words: ['Sodium', 'Gold Neon'] },
};

export const RIFLE_LOOKS = {
  frames: {
    marksman: { name: 'marksman frame', nouns: ['Heron', 'Long Eye', 'Watchman', 'Crane', 'Lighthouse'] },
    carbine: { name: 'carbine', nouns: ['Sparrow', 'Hornet', 'Kite', 'Swallow', 'Firecracker'] },
    bullpup: { name: 'bullpup', nouns: ['Mantis', 'Junk', 'Tram', 'Scorpion', 'Abacus'] },
    heavy: { name: 'heavy frame', nouns: ['Typhoon', 'Temple Bell', 'Breaker', 'Ox', 'Pile Driver'] },
    heritage: { name: 'heritage frame', nouns: ['Heirloom', 'Old Ferry', 'Elder', 'Grandfather', 'Ancestor'] },
  },
  // tier: which shop shelf it turns up on (street or pro).
  finishes: {
    street: { name: 'gunmetal and old wood', tier: 'street', words: ['Old', 'Dockyard', 'Workhorse'] },
    rust: { name: 'rust', tier: 'street', words: ['Rusty', 'Ghost', 'Scrapyard'] },
    urban: { name: 'urban camo', tier: 'street', words: ['Concrete', 'Overpass', 'Grey'] },
    bamboo: { name: 'bamboo', tier: 'street', words: ['Bamboo', "Hermit's", 'Green'] },
    candy: { name: 'candy-pink paint', tier: 'street', words: ['Candy', 'Night Market', 'Neon'] },
    rosewood: { name: 'rosewood and brass', tier: 'pro', words: ['Rosewood', 'Teahouse', 'Parlour'] },
    carbon: { name: 'carbon', tier: 'pro', glows: true, words: ['Midnight', 'Black', 'Shadow'] },
    cinnabar: { name: 'cinnabar lacquer', tier: 'pro', words: ['Vermilion', 'Cinnabar', 'Red'] },
    jade: { name: 'jade and bronze', tier: 'pro', words: ['Jade', 'Emerald', 'Bureau'] },
    bronze: { name: 'temple bronze', tier: 'pro', words: ['Temple', 'Bronze', "Abbot's"] },
    blackgold: { name: 'black lacquer and gold', tier: 'pro', words: ['Golden', 'Triad', 'Gilded'] },
    ceramic: { name: 'white ceramic', tier: 'pro', glows: true, words: ['Porcelain', 'Glass', 'White'] },
  },
  engravings: {
    clouds: { name: 'gold clouds', words: ['Cloud', 'Auspicious'] },
    scales: { name: 'dragon scales', words: ['Dragon', 'Scaled'] },
    circuit: { name: 'a neon circuit', glows: true, words: ['Wired', 'Neon'] },
  },
  charms: {
    tassel: { name: 'a red silk tassel', words: ['Silk', 'Red Thread'] },
    talisman: { name: 'a paper talisman', words: ['Spirit', 'Paper'] },
    coin: { name: 'a lucky coin', words: ['Lucky', 'Copper'] },
    mala: { name: 'prayer beads', words: ['Prayer', "Monk's"] },
    mahjong: { name: 'a mahjong tile', words: ['Mahjong', 'Thirteen'] },
    sticker: { name: 'a lucky sticker', words: ['Happy', 'Sticker'] },
    hazard: { name: 'hazard tape', words: ['Hazard', 'Caution'] },
  },
  // How often each tier has an engraving or a charm, and which charms each shelf stocks.
  odds: {
    street: { engraving: 0.15, charm: 0.55, charms: ['talisman', 'sticker', 'hazard', 'coin', 'mahjong', 'tassel'] },
    pro: { engraving: 0.6, charm: 0.5, charms: ['tassel', 'coin', 'mala', 'mahjong', 'talisman'] },
  },
};

// Sidearm looks (2026-10-29). Frames with a tier only turn up on that shelf (the smart and coil
// pistols are pro).
export const SIDEARM_LOOKS = {
  frames: {
    compact: { name: 'compact pistol', nouns: ['Wasp', 'Needle', 'Cricket', 'Pocket Moon'] },
    revolver: { name: 'revolver', nouns: ['Fortune Wheel', 'Lotus', 'Old Tiger', 'Six Lanterns'] },
    machine: { name: 'machine pistol', nouns: ['Cicada', 'Hailstorm', 'Rattle', 'Firecracker'] },
    heritage: { name: 'heritage pistol', nouns: ['Magistrate', 'Old Consul', 'Elder Brother', 'Lamplighter'] },
    cannon: { name: 'hand cannon', nouns: ['Harbour Hammer', 'Bull', 'Thunderclap', 'Pile Driver'] },
    smart: { name: 'smart pistol', tier: 'pro', glows: true, nouns: ['Ghost Link', 'Synapse', 'Familiar', 'Echo'] },
    coil: { name: 'coil pistol', tier: 'pro', glows: true, nouns: ['Storm Coil', 'Arc', 'Volt Fox', 'Lightning'] },
  },
  finishes: {
    blued: { name: 'blued steel', tier: 'street', words: ['Blue', 'Steel', 'Plain'] },
    stainless: { name: 'stainless steel and walnut', tier: 'street', words: ['Silver', 'Bright', 'Walnut'] },
    polymer: { name: 'black polymer', tier: 'street', words: ['Service', 'Black', 'Issue'] },
    tan: { name: 'desert tan', tier: 'street', words: ['Desert', 'Dust', 'Sand'] },
    hazard: { name: 'hazard yellow', tier: 'street', words: ['Hazard', 'Dockside', 'Caution'] },
    neon: { name: 'black with neon edges', tier: 'street', glows: true, words: ['Neon', 'Glow', 'Afterhours'] },
    cinnabar: { name: 'cinnabar lacquer', tier: 'pro', words: ['Vermilion', 'Cinnabar', 'Red'] },
    jade: { name: 'jade grips and bronze', tier: 'pro', words: ['Jade', 'Emerald', 'Bureau'] },
    pearl: { name: 'pearl grips', tier: 'pro', words: ['Pearl', 'Moon', 'Opal'] },
    rosewood: { name: 'rosewood and brass', tier: 'pro', words: ['Rosewood', 'Teahouse', 'Parlour'] },
    blackgold: { name: 'black and gold', tier: 'pro', words: ['Golden', 'Triad', 'Gilded'] },
    holo: { name: 'holographic chrome', tier: 'pro', words: ['Prism', 'Holo', 'Mirage'] },
    synth: { name: 'clinic white with a light strip', tier: 'pro', glows: true, words: ['White', 'Clinic', 'Sterile'] },
    ronin: { name: 'matte black with a wrapped grip', tier: 'pro', words: ['Ronin', 'Red-Eye', 'Midnight'] },
  },
  mods: {
    laser: { name: 'a laser sight', words: ['Laser', 'Red Line'] },
    holo: { name: 'a holo sight', glows: true, words: ['Holo', 'Ghost'] },
    vents: { name: 'glowing vents', glows: true, words: ['Hot', 'Furnace'] },
    ledmag: { name: 'an LED ammo counter', glows: true, words: ['Counting', 'Digital'] },
    scales: { name: 'dragon scales', words: ['Dragon', 'Scaled'] },
    clouds: { name: 'gold clouds', words: ['Cloud', 'Auspicious'] },
    circuit: { name: 'a neon circuit', glows: true, words: ['Wired', 'Neon'] },
  },
  charms: {
    tassel: { name: 'a red silk tassel', words: ['Silk', 'Red Thread'] },
    coin: { name: 'a lucky coin', words: ['Lucky', 'Copper'] },
    talisman: { name: 'a paper talisman', words: ['Spirit', 'Paper'] },
    mahjong: { name: 'a mahjong tile', words: ['Mahjong', 'Thirteen'] },
    sticker: { name: 'a lucky sticker', words: ['Happy', 'Sticker'] },
    cube: { name: 'a neon keychain', glows: true, words: ['Keychain', 'Pixel'] },
    shard: { name: 'a data shard', glows: true, words: ['Shard', 'Data'] },
    cat: { name: 'a hologram lucky cat', words: ['Lucky Cat', 'Waving'] },
  },
  odds: {
    street: { mod: 0.45, charm: 0.5, mods: ['laser', 'vents', 'ledmag', 'circuit', 'holo'], charms: ['sticker', 'cube', 'coin', 'talisman', 'shard', 'mahjong'] },
    pro: { mod: 0.75, charm: 0.5, mods: ['laser', 'holo', 'vents', 'ledmag', 'scales', 'clouds', 'circuit'], charms: ['tassel', 'coin', 'cat', 'shard', 'mahjong', 'talisman'] },
  },
};

// Guns on the armoury's shelf each week, by type and tier.
export const ARMOURY_STOCK = { rifle: { street: 2, pro: 1 }, pistol: { street: 1, pro: 1 } };
