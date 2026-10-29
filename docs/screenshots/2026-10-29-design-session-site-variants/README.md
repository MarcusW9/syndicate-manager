# Design session: site variants, the Docks (2026-10-29)

`node scripts/preview-sites.mjs docks <out.png>` draws every site plan with the rifle's sight, for
authoring layouts (`src/data/sites.js`).

1. `01-docks-three-layouts.png`: the Docks' base yard (the office top right, the gate at the left),
   "quay gate" (the van at the harbour end, the office on the left), and "pump house" (a pump house
   in the middle of the yard, the crane on the left). Each job in the Docks gets one of the three,
   picked from the job's id.
