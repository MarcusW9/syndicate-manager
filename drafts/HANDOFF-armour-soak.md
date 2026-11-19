# Handoff: enemy toughness step 2, runner armour as a flat soak

Written 2026-11-19, after enemy toughness step 1 (save v79) and the hit display. Read `CLAUDE.md`, then `HANDOFF.md`, then `drafts/PROPOSAL-enemy-toughness.md` (part 3 and Q4), then this. **Best on Opus:** it is a rule change that has to be tuned against the death rule with sims; a Sonnet session can do the mechanical build once the numbers below are settled, but should not pick them.

## What is true now
- `core/fight.js absorbOf` turns armour value into plates, at most 2 (`FIGHT.absorb`, `data/fights.js`), and each plate stops one enemy shot whole (the shot resolution in `playRound`, near `v.absorb -= 1`). A vest runs 1-3, so value 3 is wasted; the weave's "Takes 1 off every hit" is only true in engine 1.
- Enemy shots are `ENEMY_HIT` (10 or 20) plus a draw of `spread`. Enemies have +5 HP at threat 4 and 5 (`TOUGHNESS_BY_THREAT`); enemy shots have not grown.
- Owner's answers (2026-11-18, all recommended): **4(a) the soak is 3 HP per armour point**, min 1 through; one side at a time, so this step changes armour only; enemy shot growth (part 4) only if this proves too strong at threat 5; steps 2 and 3 get their own sim pairs.
- `scripts/sim-enemy-toughness.mjs` (with `HPMULT`, `PLATES`, `EHIT`) measures a crew at damage 2/4/6 with 1 or 2 plates; it must learn a soak setting. The gate sims still do not equip found gear.
- Open, from the step-1 sim: **the_last_collection is over the 15% left-behind target (18% steady, committed deaths 7.5%)**; threat 4's +5 HP did it, not threat 5 (`docs/sims/enemy-toughness-2026-11-19-half.md`). Ask the owner whether to pull threat 4 back before or after this step.

## The build
1. Armour value to a flat soak: each point takes `FIGHT.soakPerArmour` (3) off every landing enemy shot, at least 1 through, replacing the plates (`runnerOf`'s `absorb`; a runner carries `soak`; piercing is the enemy side, none exists yet). The drone's own `droneAbsorb` is an enemy's plate, untouched.
2. Show it: the gear text says "Takes 1 off every hit" for the weave; make it say the HP ("takes 3 off every hit", wording is the owner's: draft in `drafts/writing-tasks.md`), and the armoury card likewise.
3. `oddsKey` gets `r.soak`. Save v80: a fight in progress keeps its plates (`soak` 0, `absorb` as it stands) so a saved fight plays under the old rule.
4. Tests: a value-3 vest takes 9 off a 10 shot (1 through), a 20 shot loses 9; soak never takes a hit below 1; cautious and steady still lose nobody without a call-in; an unarmoured runner is as before.
5. Sims before and after into `docs/sims/`: the equip sim (add a soak setting), `sim-gate-teams`, `sim-standard-force`, `sim-vectors`, `sim-wayout`. Watch: against 10 HP shots a vest 3 stops 9 of 10: that is the proposal's warning; if threat 1-3 become untouchable for an armoured crew, say so and propose the enemy shot growth (part 4) rather than weakening the soak.
6. `docs/BATTLES.md`, design-log row, changelog, CODEMAP, HANDOFF, screenshots if the armour text shows.

## Rules that must hold
No death on cautious or steady without a call-in; shown risk equals used risk; the early game (threat 1-2, unarmed crews) must not move.
