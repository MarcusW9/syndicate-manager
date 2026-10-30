# Design session: the battle stage, a mockup (2026-10-30)

`node scripts/battle-view-mockup.mjs --shot <png>`: a still mockup, not the game, to agree the look
before building. Real portraits (`ui/art.js`) and the Docks picture (`ui/districtArt.js`); the enemy
art is a rough stand-in.

1. `01-battle-view-mockup-phone.png`: round 2 of "Hold for Static" at phone width. Enemies in a row at
   the top with what they're about to do and a line to their target (orange: the heavy's charge, which
   cover won't stop); the crew's faces at the bottom with health bars (Jax picked, Static dashed: she's
   the goal); the outside crew in a strip (the rifle with its shots, the van, standby); Jax's orders
   underneath, with odds; Auto, Pull back, Go; the last round's log.
2. `02-tactical-view-mockup-phone.png` (`node scripts/battle-view-tactical.mjs --shot <png>`): the same
   fight on a minimal top-down view of the Docks yard (owner: "a bit XCOM style... behind cover"). Containers
   are cover, and everyone stands behind one or in the open. A shield on each token marks the cover (full,
   half, or a yellow OPEN tag). Red dashed lines run from enemies to their targets, each with its chance to
   hit. The heavy's charge is solid orange, and Jax's chosen shot is cyan. The rifle is on the crane, with
   its sight cone drawn across the yard. The van and standby wait on the road.
