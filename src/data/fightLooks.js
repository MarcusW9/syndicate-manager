// The live battle view's looks (ui/fightstage.js; drafts/PROPOSAL-live-battle-view.md 5.3 and 5.4, step 4). Content
// only, and picture only: no rule reads anything here. Who is hit, in what order and with what result is the rules'
// (core/fight.js); a look only says how the stage draws it.

// A special move's choreography, from the star's gear and role (owner, 2026-11-14: "weapon / role / archetype based";
// the weapon's archetype first, then the role). Interim: how a special move is unlocked (chosen for a runner, or one
// they have naturally) is still open, and blades are not in the game yet. Read top to bottom, the first match wins:
//   gear: an item type they carry (data/gear.js GEAR; 'blade' waits for blades), frame: a sidearm's frame
//   (data/gear.js SIDEARM_FRAMES), spec: their specialisation (data/specialisations.js), role: their role.
// core/fightmap.js specialLook reads it when the runner enters a fight.
export const SPECIAL_LOOK_RULES = [
  { gear: 'blade', look: 'slash' },
  { gear: 'rifle', look: 'ricochet' },
  { spec: 'marksman', look: 'ricochet' },
  { gear: 'reflex', look: 'slash' },
  { frame: 'coil', look: 'ping' },
  { gear: 'deck', look: 'ping' },
  { gear: 'drone', look: 'ping' },
  { gear: 'cortex', look: 'ping' },
  { spec: 'droneJockey', look: 'ping' },
  { role: 'tech', look: 'ping' },
];
export const SPECIAL_LOOK_DEFAULT = 'ricochet';

// The three choreographies (ms at Watch). title: the lineText key of the move's title over the map (its {who} is the
// star). lead: the letterbox and title before the first attack. slow: how many times longer than an ordinary shot each
// attack of the chain is drawn (the slow motion). gap: between two attacks. wave: ping only, the shockwave before the
// bolts. after: the hold before the camera pulls back and the bars go. Fast plays the move at its own rate and
// shorter (SPECIAL_FAST_CUT); Resolve and reduced motion cut (no tween, no bars).
//   ricochet: one round bouncing target to target, each bounce from where the last landed (a sniper's round).
//   slash:    an afterimage dash target to target with a slash arc at each; the star's own token lunges and stays
//             on its spot (owner, 2026-11-14: the rules keep the star in their cover, so only the ghost travels).
//   ping:     a shockwave from the star, then rapid bolts from the star to each target in the rules' order.
export const SPECIAL_MOVES = {
  ricochet: { title: 'stage.special.ricochet', lead: 900, slow: 2.2, gap: 240, after: 600 },
  slash: { title: 'stage.special.slash', lead: 900, slow: 1.8, gap: 180, after: 600 },
  ping: { title: 'stage.special.ping', lead: 700, wave: 650, slow: 0.9, gap: 70, after: 600 },
};
export const SPECIAL_FAST_CUT = 0.6; // Fast plays a special move at this share of its Watch length (on top of the pace's own rate)

// Swarms (5.4): an enemy kind drawn as a knot of small bodies instead of one portrait token. A knot is ONE rules
// enemy: it is shot at as one, carries that enemy's pips and number, and falls all together when that enemy goes
// down. bodies: [fewest, most], picked by hash of the fight's seed and the enemy's number. rotor: drawn as small
// drones. A kind with no entry is a single portrait token.
// Owner, 2026-11-14 (after seeing knots against one token each on the real map): knots are for one new enemy only, a
// swarm of drones; hired guns and drones stay one token each, and an actual crowd of people or drones is shown as many
// tokens (many rules enemies), not as knots. The swarm-drone kind is not in the rules yet (data/fights.js ENEMIES), so
// `planned` marks it: nothing draws a knot until that kind exists. The preview's --knots flag can still show one.
export const ENEMY_LOOKS = {
  swarmDrone: { bodies: [4, 6], rotor: true, planned: true },
};
