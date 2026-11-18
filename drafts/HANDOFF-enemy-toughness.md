# Handoff: after hit size, enemy toughness (and showing the hit)

Written 2026-11-18, after #204 merged (a weapon sets hit size, hit variance, spare sidearms; save v78). Read `CLAUDE.md` first, then `HANDOFF.md`, then this. The agreed order (owner, 2026-11-18, `drafts/PROPOSAL-gear-hit-size.md` Q6): **hit size (done) → enemy toughness → the build vocabulary's trigger step** (`drafts/PROPOSAL-build-vocabulary.md`).

Two pieces of work, best on different models:

| Part | What | Best on | Owner needed? |
| --- | --- | --- | --- |
| A | The enemy toughness **proposal** (design, numbers, sims), then build it once agreed | Opus: several balance levers that depend on each other | Yes: the proposal's questions, before any rule changes |
| B | **Show the hit** on the weapon card and the fight screen (step 2 of the hit-size proposal) | Sonnet: a small UI change | Yes: the wording (`drafts/writing-tasks.md`); draft it and flag it |

Do A first if only one session runs; B can go any time and does not touch the rules.

## What is true now (2026-11-18, re-check against the code)

- **Hits:** `core/fight.js hitOf(damage)` = 10 + 3 × max(0, damage − 2); strong ×2 on one margin (`FIGHT.strongMargin` 12); `landHit` (plate: flat `plateHp` 10 off one hit, one plate a hit; wobble `hitSpreadShare` 0.15). Rule text: `docs/BATTLES.md` "Hit size and variance".
- **Enemies have not moved:** `data/fights.js ENEMIES` 10 or 20 HP, at most one plate; `ENEMY_HIT` 10 or 20; the count by threat is the only difficulty dial (`COUNT_BY_THREAT`). An armed crew (damage 5-6: hits 19-22) one-shots almost everything, so threat 1-3 jobs go trivial once a crew finds guns. That is the problem part A solves.
- **Runner armour is capped:** `fight.js absorbOf` turns armour value into plates, at most 2 (`FIGHT.absorb.pro`), each stopping one enemy shot whole. A vest runs 1-3 (tier step, skin weave), so value 3 is wasted, and the weave's "Takes 1 off every hit" is only true in engine 1. The proposal's note: fix it here as a flat soak per armour point (about 3 HP a point), mirroring damage, once enemy shots grow.
- **Gear in the game:** `docs/sims/weapon-damage-2026-11-18.md` (every starting runner is damage 2; one completed job in about 4 gives a sidearm since the spare piece; most are damage 3-5; the top is 8).
- **Sims don't equip found gear.** The gate sims fight with what crews start or are hired with, so #204's real effect is unmeasured (`docs/sims/hitsize-2026-11-18.md`). Part A needs a sim step that equips the stash (best weapon and vest to the best runners) before tuning anything.
- **Over the committed-death target already:** data_pull 11.5%, quiet_hours 10.0%, still_connected 12.5%, the_wrong_fare 11.3%, wrong_horse 9.7% (target 8%, `sim-gate-teams.mjs` "Against the declared targets"). Not caused by #204 (they were over before); worth a look while tuning.

## Part A: the enemy toughness proposal

Write `drafts/PROPOSAL-enemy-toughness.md` in the style of `drafts/PROPOSAL-gear-hit-size.md` (the problem from the code, the numbers as tables, parts, steps, questions for the owner with a recommended option each, rejected alternatives). Nothing built until the owner answers. It should settle:

1. **What grows with threat** (and later with the week or the tong's standing, for the endless game): enemy HP, plates, enemy hit size, count. One lever at a time keeps the sims readable; say which first.
2. **Tougher swarm bodies** (the HANDOFF's old 2b item): a swarm of many small bodies is Ricochet's job; how small can they stay once guns hit for 19+ without Ricochet becoming the only answer?
3. **Runner armour as a flat soak** (above), tied to enemy hit size growing.
4. **Starting crews unchanged** at threat 1-2 (they are unarmed; the early game was tuned without guns).
5. **The sims:** first the equip-the-stash step (a crew at damage 2, 4 and 6), then before/after on `sim-gate-teams`, `sim-standard-force`, `sim-vectors`, `sim-wayout`. Pace is measured, not guessed (HANDOFF "Agreed rules").
6. **Rules that must hold:** no death on cautious or steady without a call-in; shown risk equals used risk (the planning read replays the real fight, so it follows automatically; check new enemy fields are in `fight.js oddsKey`); a save bump and migration if the fight's shape changes.

Then, once agreed: build it, save version up, tests, sims before and after in `docs/sims/`, `docs/BATTLES.md`, design log, changelog, HANDOFF.

## Part B: show the hit

- **Weapon card** (`src/ui/gear.js`, the sidearm line near the top: "Aim +2 · damage 2 · light and accurate"): add the hit in HP, read from `core/fight.js hitOf` (never a separate sum), e.g. "hits for 16, strong 32". `hitOf` lives in core; the UI may import it.
- **Fight screen** (engine 2 round screen, `ui/fightscreen.js` and its view `core/fightview.js`): the runner's hit beside their weapon, from `r.hit` on the fight's runner.
- **Wording is the owner's.** Write Claude's draft, add it to `drafts/writing-tasks.md` as a small line (the spare-piece line there is the pattern), and say so.
- **Screenshots:** this changes how the game looks: `npm run screenshots -- hit-display` (needs `npm ci` and the playwright link, HANDOFF "Environment gotchas"), a row at the top of `docs/screenshots/README.md`; add Playwright captures for the fight screen (the script can't reach mid-game screens).
- Changelog entry; no design-log row unless a choice is made.

## Not in scope

The build vocabulary's trigger step (after enemy toughness), battle slice 4, the iOS wrapper, anything under "Parked" in `HANDOFF.md`.
