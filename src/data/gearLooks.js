// Gear looks (DESIGN.md 2026-10-29): what a rifle is made of and what it's called. Content only:
// core/looks.js rolls them, ui/art.js draws them (its palettes use the same ids).
//
// A look is { frame, finish, engraving, charm }. Names are two words: one from the finish, an
// engraving or a charm, one from the frame ("Vermilion Heron", "Ghost Heirloom").

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
    carbon: { name: 'carbon', tier: 'pro', words: ['Midnight', 'Black', 'Shadow'] },
    cinnabar: { name: 'cinnabar lacquer', tier: 'pro', words: ['Vermilion', 'Cinnabar', 'Red'] },
    jade: { name: 'jade and bronze', tier: 'pro', words: ['Jade', 'Emerald', 'Bureau'] },
    bronze: { name: 'temple bronze', tier: 'pro', words: ['Temple', 'Bronze', "Abbot's"] },
    blackgold: { name: 'black lacquer and gold', tier: 'pro', words: ['Golden', 'Triad', 'Gilded'] },
    ceramic: { name: 'white ceramic', tier: 'pro', words: ['Porcelain', 'Glass', 'White'] },
  },
  engravings: {
    clouds: { name: 'gold clouds', words: ['Cloud', 'Auspicious'] },
    scales: { name: 'dragon scales', words: ['Dragon', 'Scaled'] },
    circuit: { name: 'a neon circuit', words: ['Wired', 'Neon'] },
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

export const ARMOURY_STOCK = { street: 2, pro: 1 }; // rifles on offer each week
