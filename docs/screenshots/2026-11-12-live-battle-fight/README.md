# Live battle view, step 2: a fight on the site map (2026-11-12)

Frames from `node scripts/preview-livebattle.mjs <dir>`, which builds a save at an engine-2 fight and plays rounds in the
game at 1x. The standard `npm run screenshots` run hands fights off, so it never shows one live; these frames do.

- `phone-watch/` (390 wide, Watch pace, the warehouse job): `01` the fight starts and the crew takes cover on the yard's
  fight spots (enemies in red rings with their number, pips under every token, low grey barriers where the rules give
  half cover and the site has no half spot); `02` round 1 mid-exchange (a hired gun's shot lands, the runner falls with
  "Down"), with the death's-door call-in below; `03` the round's picture settled.
- `desktop-fast/` (1440 wide, Fast pace, Quiet Hours): `01` the start; `02`-`05` two rounds playing on their own, the round
  feed beside the map.

Shipped in the live battle view's step 2 PR.
