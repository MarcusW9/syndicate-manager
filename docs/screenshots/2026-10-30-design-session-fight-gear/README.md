# Design session: gear in the fight (2026-10-30)

`PHONE_ONLY=1 node scripts/capture-command.mjs <folder>`: a Docks fight, with one runner in a pro sidearm and a vest,
one in a sidearm, and the rest with nothing.

1. `01-orders-phone`: the fight waiting for orders.
2. `02-orders-full-phone`: the whole panel. Each runner's chip shows their gun and its damage, and their armour
   ("Pro sidearm 4 · Armoured vest −1", "Sidearm 3 · no armour"). Each guard's aim shows the chance and the
   damage after armour. Shoot shows what a hit does and how many it takes to drop the guard. Hunker shows the
   damage coming at you.
3. `03-orders-given-phone`: orders given.
