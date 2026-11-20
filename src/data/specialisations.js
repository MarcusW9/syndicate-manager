// Specialisations (PLAN-CORE-LOOP.md, slice 5b; DESIGN.md 2026-10-27 and 2026-10-28). Content
// only: the rules live in core/specialisations.js. Gear lets anyone try a role; doing it, with the
// stats for it, makes it ready to learn at a level-up (core/levelup.js, 2026-11-20; was Joss's offer). One per person. `offer` is
// Joss's line about it, shown when a ready one is opened on the skills list.
//
// kit: the overwatch kit it's about. needs: base stats (before gear and traits). jobs: jobs done
// on overwatch with that kit. effect: what changes on overwatch with that kit:
//   uses (extra shots or actions), bonus (on the save roll), heatOnHit (only a shot that hits
//   costs heat), neural (per drone action, instead of the kit's own).
// Names and numbers are drafts (owner, 2026-10-27).

export const SPECIALISATIONS = {
  marksman: {
    name: 'Marksman', kit: 'rifle', needs: { combat: 10, cool: 8 }, jobs: 3,
    effect: { uses: 1, bonus: 1, heatOnHit: true },
    desc: 'On overwatch with a rifle: one more shot, +1 to hit, and a miss costs no heat.',
    offer: '{op} has the eye for it now. Three jobs behind a scope and they don\'t rush the shot. I can get them proper time on a range: they\'d come back a Marksman.',
  },
  droneJockey: {
    name: 'Drone Jockey', kit: 'drone', needs: { piloting: 10 }, jobs: 3,
    effect: { uses: 1, bonus: 1, neural: 5 },
    desc: 'On overwatch with a drone: one more action, +1, and half the neural load per action.',
    offer: '{op} flies that drone like it\'s part of them. A racing crew I know could sharpen them up, and they\'d be a Drone Jockey: longer in the air, less of it in their head.',
  },
};

