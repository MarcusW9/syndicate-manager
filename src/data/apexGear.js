// Apex gear (2026-11-14, owner: "a named piece with a history"). Content only: the rules live in
// core/gear.js (makeApex, perksOf, equip) and core/loot.js (which piece drops).
//
// Eight hand-written pieces, each in a save at most once: a piece that has been found never drops
// again, whether it was sold or lost with a runner (state.apexFound). A runner wears or carries at
// most one. Each has one fixed unique perk, worth about two ordinary perks (data/gearPerks.js), made
// of the same effect keys the rules already read (bonus, serious, patch, armour, pierce, damage,
// uses, heat, floor) so it flows through gearMods, the fights and the planning read like any perk.
// Like an ordinary perk it never adds to the stat its own item boosts (tests/apex.test.js checks).
//
// type: a GEAR type. name: what it is called. history: one or two plain sentences, street level; it
//   leans only on people, places, factions and events already in WORLD.md (no new canon).
// look: for a rifle { frame, finish, engraving, charm }, a sidearm { frame, finish, mod, charm }
//   (data/gearLooks.js), for any other type { frame } (TOOL_FRAMES).
// perk: { name, desc, effect } with one line of plain words for what it does.
export const APEX_GEAR = {
  signalten: {
    type: 'pistol', name: 'Signal Ten',
    history: 'Dug out of the mud of the southern piers after the Great Signal 10, its cylinder still sealed with wax. Everyone who has carried it since swears it has never failed on a wet night.',
    look: { frame: 'revolver', finish: 'stainless', mod: null, charm: 'talisman' },
    perk: { name: 'Wax-sealed', desc: 'Never fouls in the wet. Their hits get through some armour in a fight, and Cool +1.', effect: { pierce: 1, bonus: { cool: 1 } } },
  },
  lastword: {
    type: 'pistol', name: 'Last Word',
    history: 'Kept in a drawer under the slate at the Brass Anchor Society\'s teahouse in Old Town, for arguments tea cannot settle. It is lent, never given, and always comes back.',
    look: { frame: 'heritage', finish: 'rosewood', mod: 'clouds', charm: 'coin' },
    perk: { name: 'Heard out', desc: 'A room goes quiet when this is on the table. Social +1, and a serious wound is 5 points less likely after an unsaved incident.', effect: { bonus: { social: 1 }, serious: 0.05 } },
  },
  winningpost: {
    type: 'rifle', name: 'Winning Post',
    history: 'Kept in a cupboard above the winning post at Lantern Course by Racing Association stewards, for the night someone tried to fix a race. Whether it was ever fired depends who you ask.',
    look: { frame: 'marksman', finish: 'rosewood', engraving: 'clouds', charm: 'coin' },
    perk: { name: 'Race-night hush', desc: 'Built to be fired under floodlights without a head turning. One more overwatch shot, and its shots draw no heat.', effect: { uses: 1, heat: -1 } },
  },
  generatorcoat: {
    type: 'vest', name: 'Generator Coat',
    history: 'A work jacket plated by neighbours through the three weeks of the Grid Blackout, one plate from every block that still had a diesel generator. It has been handed on ever since.',
    look: { frame: 'jacket' },
    perk: { name: 'Every block pitched in', desc: 'Stitched by a lot of hands. Cool +1, and counts +1 towards the medical a teammate needs to patch a serious wound.', effect: { bonus: { cool: 1 }, patch: 1 } },
  },
  meterghost: {
    type: 'deck', name: 'Meter Ghost',
    history: 'Soldered together by the Ghost Circuit in the drainage tunnels under Old Town, out of dead Hoi-Sing meters. The serial plate still says it is paid up on a flat nobody can find.',
    look: { frame: 'case' },
    perk: { name: 'Borrowed serial', desc: 'Reads as just another meter on the wire. Stealth +1 and Piloting +1.', effect: { bonus: { stealth: 1, piloting: 1 } } },
  },
  fleetorphan: {
    type: 'drone', name: 'Fleet Orphan',
    history: 'A ducted-fan drone from one of Hang Yuen\'s half-tested fleets at the Docks. Its software was never finished, and nobody at Hang Yuen has asked for it back.',
    look: { frame: 'duct' },
    perk: { name: 'Half-tested', desc: 'Runs on unfinished code that does more than it should. One more drone action from overwatch, and Tech +1.', effect: { uses: 1, bonus: { tech: 1 } } },
  },
  secondshift: {
    type: 'reflex', name: 'Second Shift',
    history: 'Fitted to a dockworker in the first wave after the Neural Integration Act, and pulled out when the burnouts began. It has been through more hands since than anyone has kept count of.',
    look: { frame: 'harness' },
    perk: { name: 'Worn in', desc: 'Years of other people\'s nerves have worn it smooth. Their neural load rests 10 lower than the implants would hold it.', effect: { floor: 10 } },
  },
  ridgelock: {
    type: 'cortex', name: 'Ridge Lock',
    history: 'Lifted from a Veridian-Apex clinic\'s reject bin and flashed in a Night Market chrome clinic. The corporate lock was never fully cut, so it still behaves as if it is on the ridge.',
    look: { frame: 'chip' },
    perk: { name: 'Still on the ridge', desc: 'The old corporate calibration is still in there. Their hits do 1 more in a fight, and Stealth +1.', effect: { damage: 1, bonus: { stealth: 1 } } },
  },
};
