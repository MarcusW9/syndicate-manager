// District flavour shown on the job board and planning screen. In job text, {faction} becomes
// `faction`; {district} comes from config/names.js (districtsInText). Names live in
// config/names.js; the full lore is in WORLD.md.

export const DISTRICTS = {
  oldTown: { faction: 'Brass Anchor', turf: 'Brass Anchor turf', pitch: 'Damp tenements on the hillside, herbal tea shops and mahjong tiles clacking down wet alleys.' },
  docks: { faction: 'Red Lantern', turf: 'Red Lantern turf', pitch: 'Cranes, containers and harbour fog. Aether-Harbour owns the paperwork; the Red Lanterns own the road.' },
  nightMarket: { faction: 'Silver Fan', turf: 'Silver Fan turf', pitch: 'Neon, wok smoke and back-alley chrome clinics, where fortunes go on one hand of mahjong.' },
  basin: { faction: 'Racing Association', turf: 'Racing Association ground', pitch: 'A bowl of towers round a floodlit 1891 racecourse, where real horses run and forty thousand people watch the odds change in their eyes.' },
  heights: { faction: 'Veridian-Apex', turf: 'Veridian-Apex ground', pitch: 'Corporate towers in filtered air, where anyone without a pass is treated as a hazard.' },
};

// Where the crew's safehouse is (the damp room above a noodle shop): its HOME tag on the City map.
export const SAFEHOUSE_DISTRICT = 'oldTown';
