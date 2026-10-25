// District flavour shown on the job board and planning screen. In job text, {faction} becomes
// `faction`; {district} comes from config/names.js (districtsInText). Names live in
// config/names.js; the full lore is in WORLD.md.

export const DISTRICTS = {
  oldTown: { faction: 'Brass Anchor', turf: 'Brass Anchor turf', pitch: 'Damp tenements on the hillside, herbal tea shops and mahjong tiles clacking down wet alleys.' },
  docks: { faction: 'Red Lantern', turf: 'Red Lantern turf', pitch: 'Cranes, containers and harbour fog. Aether-Harbour owns the paperwork; the Red Lanterns own the road.' },
  nightMarket: { faction: 'Silver Fan', turf: 'Silver Fan turf', pitch: 'Neon, wok smoke and back-alley chrome clinics, where fortunes go on one hand of mahjong.' },
  heights: { faction: 'Veridian-Apex', turf: 'Veridian-Apex ground', pitch: 'Corporate towers in filtered air, where anyone without a pass is treated as a hazard.' },
};
