# Enemy toughness step 1: before and after (2026-11-18)

Rule: `docs/BATTLES.md` "Enemy toughness"; why: `drafts/PROPOSAL-enemy-toughness.md`. Before = the commit before step 1 (`bf90c15`); after = save v79 (+5 HP at threat 4, +10 HP at threat 5). Full tables beside this file: `gate-teams-2026-11-18-toughness-before.md` / `gate-teams-2026-11-18-toughness.md` (`sim-gate-teams.mjs 24 100`), `vectors-…` and `wayout-…` (`8 60`). The equip-the-stash sim (`enemy-toughness-2026-11-18-equip.md`, `sim-enemy-toughness.mjs`) is where the numbers were chosen: HP alone at threat 5 costs a damage-6, pro-vest crew 3 HP (the target); HP and a plate together cost 12, so the plate was dropped.

**Read this first:** the gate sims fight with what crews start or are hired with (mostly bare hands, `docs/sims/hitsize-2026-11-18.md`), so they show the unarmed side of threat 4-5, the harsh one. A crew with found guns and vests is in the equip sim, and barely notices.

## The gate teams

- **No death on steady or cautious anywhere** (0.0% on every row).
- **Only jobs with threat 4 or 5 move**, as designed; the threat 1-3 jobs are identical to the before run.
- **Someone left behind on steady** roughly doubles on those jobs: warehouse 6% → 10%, dead_air 6% → 12%, not_for_sale 6% → 12%, kidnap 6% → 13%, **the_last_collection 9% → 18% (over the 15% target)**.
- **Deaths on committed** (the accepted risk): warehouse 2.4% → 3.6%, dead_air 3.5% → 5.8%, not_for_sale 3.2% → 5.4%, kidnap 3.1% → 5.9%, **the_last_collection 3.1% → 7.5% (inside 8%, close)**. The already-over jobs (data_pull 11.5%, quiet_hours 10.0%, the_wrong_fare 11.3%) are unchanged; still_connected 12.5% → 11.6%.

## Vectors and the way out

- Vectors (the sim's threat-5 crowd fight, no build): win 92% → 86%, someone down 5% → 9%. The builds' order is unchanged (Ricochet + Contagion best); builds matter more (no build 86%, Ricochet + Contagion 92%).
- Way out: no change in any row (those jobs are threat 3 and under).

## For the owner

Unarmed crews on the five threat 4-5 jobs have clearly harder fights. The_last_collection is the one that crosses a declared target (left behind 18%, was 9%). Options if that is too much: threat 4 stays as before and only threat 5 grows, or +5 HP at threat 5. Not changed yet.
