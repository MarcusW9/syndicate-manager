// Gear perks (2026-11-14, owner; docs/design). Content only: the rules that read them live in
// core/gear.js. A Custom item carries one perk and a Premium item two different ones (TIERS `perks`
// in data/gear.js), rolled when the item is made from the perks valid for its type, by weight.
//
// Perks are sideways. The risk read and the fights are balanced around +1 a tier step on an item's
// own stat, so a perk never adds to the stat its item already boosts (core/gear.js `perksFor` drops
// any that would). Each perk has one effect key:
//   bonus: { stat: n }  a roll bonus in a different stat (named in the roll breakdown, like traits)
//   serious: n          takes this off the chance that an unsaved incident leaves a serious wound
//   patch: n            counts this much extra towards the medical a teammate needs to patch a wound (and a patch's
//                       heal in the old fights); it does not make a healer of anyone in the new ones
//   armour: n           flat soak in a fight, taken off every hit (a worn weave; a vest stays the vest)
//   pierce: n           armour points the wielder's hits ignore
//   damage: n           what the wielder's hits do in a fight
//   uses: n             more shots or drone actions from overwatch (the kit that carries it)
//   heat: n             heat on every overwatch shot (negative: less)
//   floor: n            lowers the neural load their implants hold them above
// types: the item types it can roll on. weight: how often, among the perks its type can roll.
// PERK_CAPS: the most one runner gets from perks of one kind across everything they carry (a
// bonus is capped per stat), so a bag full of perks never stacks into a different game.
export const PERK_CAPS = { bonus: 2, serious: 0.1, patch: 2, armour: 1, pierce: 1, damage: 1, floor: 10 };

export const PERKS = {
  padded: { name: 'Padded fit', desc: 'Sits well and never pulls. Cool +1.', weight: 3, effect: { bonus: { cool: 1 } }, types: ['pistol', 'vest', 'deck', 'medkit', 'picks', 'rifle', 'drone', 'reflex'] },
  muffled: { name: 'Muffled fittings', desc: 'Nothing rattles or glints. Stealth +1.', weight: 3, effect: { bonus: { stealth: 1 } }, types: ['pistol', 'vest', 'rifle', 'drone', 'deck', 'medkit', 'reflex', 'cortex'] },
  sparechip: { name: 'Spare chip', desc: 'A second chip taped inside the casing. Tech +1.', weight: 3, effect: { bonus: { tech: 1 } }, types: ['vest', 'rifle', 'drone', 'medkit', 'picks', 'reflex'] },
  dressings: { name: 'Sewn-in dressings', desc: 'Dressings stitched into the lining. Medical +1.', weight: 3, effect: { bonus: { medical: 1 } }, types: ['pistol', 'vest', 'rifle', 'drone', 'deck', 'picks', 'reflex', 'cortex'] },
  linked: { name: 'Linked controls', desc: 'Hooked into the wearer\'s own rig. Piloting +1.', weight: 2, effect: { bonus: { piloting: 1 } }, types: ['deck', 'cortex', 'picks'] },
  shockpad: { name: 'Shock padding', desc: 'Takes the worst out of a bad hit: a serious wound is 5 points less likely after an unsaved incident.', weight: 2, effect: { serious: 0.05 }, types: ['pistol', 'rifle', 'drone', 'deck', 'medkit', 'picks', 'reflex', 'cortex'] },
  sutures: { name: 'Suture strip', desc: 'Counts +1 towards the medical a teammate needs to patch a serious wound.', weight: 2, effect: { patch: 1 }, types: ['vest', 'drone', 'deck', 'picks', 'reflex', 'cortex'] },
  weave: { name: 'Skin weave', desc: 'A weave under the skin. Takes 1 off every hit in a fight.', weight: 1, effect: { armour: 1 }, types: ['reflex', 'cortex'] },
  hardened: { name: 'Hardened rounds', desc: 'Their sidearm\'s hits get through some armour in a fight.', weight: 2, effect: { pierce: 1 }, types: ['pistol'] },
  overlay: { name: 'Targeting overlay', desc: 'Their hits do 1 more in a fight.', weight: 2, effect: { damage: 1 }, types: ['deck', 'reflex', 'cortex'] },
  magazine: { name: 'Spare magazine', desc: 'One more shot or drone action from overwatch.', weight: 2, effect: { uses: 1 }, types: ['rifle', 'drone'] },
  suppressor: { name: 'Suppressor', desc: 'Overwatch shots from this rifle draw no heat.', weight: 2, effect: { heat: -1 }, types: ['rifle'] },
  damped: { name: 'Damped feedback', desc: 'Their neural load rests 5 lower than the implant would hold it.', weight: 2, effect: { floor: 5 }, types: ['reflex', 'cortex'] },
};
