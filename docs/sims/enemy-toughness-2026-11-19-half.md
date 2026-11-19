# Enemy toughness: threat 5 halved to +5 HP (2026-11-19)

Owner's call after `enemy-toughness-2026-11-18-step1.md`. Same scripts and seeds: `gate-teams-2026-11-19-toughness-half.md` (`sim-gate-teams.mjs 24 100`), `vectors-2026-11-19-toughness-half.md` (`sim-vectors.mjs 8 60`). Compare with the `-2026-11-18-toughness` pair (threat 5 at +10 HP) and its `-before` pair (no toughness).

**Result: the gate "Against the declared targets" section is identical to the +10 run, line for line.** The five jobs that got harder in step 1 (warehouse, dead_air, not_for_sale, the_last_collection, kidnap) are **threat 4** jobs, and threat 4 stayed at +5 HP; the game has only one threat-5 job (8 are threat 4), and none of the gate teams' fights is at threat 5. So halving threat 5 does not touch any of the numbers the owner was worried about.

- the_last_collection is still **left behind 18% on steady (over 15%)** and a death in 7.5% on committed (before step 1: 9% and 3.1%).
- Threat 5 matters only in the equip sim (`enemy-toughness-2026-11-18-equip.md`, a bare crew at threat 5 lost 51 HP at +10 and 36 at +5; a damage-6 pro-vest crew 3 HP either way) and the vectors sim's threat-5 crowd, whose rows moved (see the vectors file).

If the_last_collection should go back under 15%, the lever is threat 4 (for example +0 at threat 4 and +5 at threat 5), not threat 5.
