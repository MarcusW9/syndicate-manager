# Armour as a flat soak: enemy toughness step 2 (2026-11-19, save v80)

What changed: a runner's armour stops being plates (value 1 = one whole shot stopped, value 2 or more = two) and becomes a flat soak, `FIGHT.soakPerArmour` HP per armour point off every enemy shot that lands, at least 1 through. The proposal agreed 3 HP a point (`drafts/PROPOSAL-enemy-toughness.md` Q4). The first run showed 3 was far **weaker** than the plates, not stronger as the proposal feared, so **the owner chose 5** (2026-11-19). Everything below the first table is at 5.

## The equip sim (`scripts/sim-enemy-toughness.mjs`, 20 crews x 40 fights a row, committed, a combat 11-16 crew of 4-6, every runner in the same vest)

Plates: `node scripts/sim-enemy-toughness.mjs` (the old rule, kept as the default to compare against). Soak: `ARMOUR=soak [SOAKPER=n] node scripts/sim-enemy-toughness.mjs`. **Average HP the crew lost in a fight**; plates are 1 / 2, soak is armour value 1 / 2 / 3. Win is 98-100% everywhere and nobody died in any row (full tables: the commands above).

| Threat | Damage (hit) | Plates (today) | Soak 3 a point | Soak 4 | **Soak 5 (built)** |
| --- | --- | --- | --- | --- | --- |
| 1 | 2 (hit 10) | 5 / 2 | 15 / 10 / 6 | 13 / 7 / 4 | **12 / 5 / 3** |
| 1 | 4 (hit 16) | 1 / 0 | 8 / 6 / 4 | 7 / 4 / 2 | **6 / 3 / 2** |
| 1 | 6 (hit 22) | 2 / 0 | 7 / 5 / 3 | 7 / 4 / 2 | **6 / 3 / 2** |
| 2 | 2 (hit 10) | 5 / 2 | 15 / 10 / 6 | 13 / 7 / 4 | **12 / 5 / 3** |
| 2 | 4 (hit 16) | 1 / 0 | 8 / 6 / 4 | 7 / 4 / 2 | **6 / 3 / 2** |
| 2 | 6 (hit 22) | 2 / 0 | 7 / 5 / 3 | 7 / 4 / 2 | **6 / 3 / 2** |
| 3 | 2 (hit 10) | 11 / 4 | 24 / 17 / 10 | 22 / 12 / 7 | **19 / 9 / 5** |
| 3 | 4 (hit 16) | 3 / 1 | 13 / 9 / 6 | 11 / 7 / 4 | **10 / 5 / 3** |
| 3 | 6 (hit 22) | 3 / 1 | 11 / 8 / 5 | 10 / 6 / 4 | **9 / 4 / 2** |
| 4 | 2 (hit 10) | 14 / 7 | 30 / 21 / 13 | 27 / 15 / 9 | **24 / 11 / 6** |
| 4 | 4 (hit 16) | 5 / 1 | 16 / 11 / 7 | 14 / 8 / 5 | **12 / 6 / 3** |
| 4 | 6 (hit 22) | 3 / 1 | 12 / 9 / 6 | 11 / 7 / 4 | **10 / 5 / 3** |
| 5 | 2 (hit 10) | 35 / 19 | 54 / 38 / 24 | 49 / 28 / 16 | **43 / 21 / 12** |
| 5 | 4 (hit 16) | 10 / 4 | 26 / 18 / 11 | 23 / 13 / 8 | **20 / 10 / 6** |
| 5 | 6 (hit 22) | 7 / 2 | 21 / 15 / 10 | 19 / 12 / 7 | **17 / 9 / 5** |

Reading it:
- **Why the soak came out weaker:** a fight lands only a few shots on each runner (about 5 rounds), and most enemy shots are 10 HP. A plate stopped a whole one, 10 or 20 HP, and a pro vest stopped two. A 3 HP soak takes 30% of a 10 HP shot. The proposal's worry ("a value-3 vest stops 9 of 10, untouchable") assumed many shots a fight.
- **At 5 a point**, value 2 (soak 10) is about what the old pro vest was (threat 5, bare hands: 21 HP against 19). Value 1 is a little weaker than the old street vest (43 against 35), and **value 3 now counts** (12; under the plates it was the same as value 2).
- **Threat means something again for a geared crew.** A damage-6 crew in a value-2 vest loses 3 HP at threat 1 and 9 at threat 5; under the plates it was 0 and 2. That was the proposal's aim (threat 5 should cost a geared crew about what threat 3 cost a mid crew).
- Nobody is untouchable: at least 1 HP gets through every shot, and no threat-1-3 row reaches 0.
- **Enemy shot growth (step 3) is not needed:** the soak is not too strong at threat 5.

## The gate and other sims (unarmoured or barely armoured crews)

Same scripts and seeds before (`-soak-before`, the `main` of #207) and after (`-soak`, at 5 a point). The gate sims do not equip found gear; only a hire who comes with a vest wears one, so these show that **crews without armour do not move**.

- `sim-standard-force.mjs` (40 x 60): identical, line for line.
- `sim-vectors.mjs 8 60` (`vectors-2026-11-19-soak*.md`): every row within 0.07 downs a fight. Clean wins are at most 6 points better (a few runners with vests), and someone left is at most 3 points lower.
- `sim-wayout.mjs 8 60` (`wayout-2026-11-19-soak*.md`): within 0.05 downs a fight and 5 points of clean wins; no deaths before or after.
- `sim-gate-teams.mjs 24 100` (`gate-teams-2026-11-19-soak*.md`): someone left behind on steady is flat or a point lower (warehouse 10 → 9%, not_for_sale 12 → 11%, the_last_collection 18 → 17%, still over 15%). **Deaths on committed went up on some jobs:** one_more_song 7.3 → 9.1% (**now over 8%**), still_connected 11.6 → 13.4%, quiet_hours 10.0 → 11.2%, data_scrub 5.0 → 6.1%, still_clocked_in 5.4 → 6.2%; the rest within 0.2. With 2,400 fights a row, a 1-2 point move is outside the noise. The likely cause: the few hires who carry a vest mostly have value 1, and a value-1 vest is a little weaker than the old street plate (the equip table: 43 HP lost against 35 at threat 5, bare hands). Not tuned here; a question for the owner (HANDOFF).
