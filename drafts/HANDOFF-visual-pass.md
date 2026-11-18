# Handoff: the visual pass (the next chunk that needs no owner call)

## Status, written at the end of the session (2026-11-17)

**Done:** the two test gaps (a shot- or overwatch-felled infected enemy hands on Contagion; the planning read names the Contagion Vector and a drone is still "can't hurt"), and all six effects, UI only: the Contagion jump (`spread` step), the infection tick (`tick`), the shield dome (`dome`/`domeEnd`, flared by a shielded shot), jam (`ping` with `targets`, a flicker on a fail), the way-out alarm (`alarm`) and the medic's patch (`patch`; each stabilise already got the aura). Each has a test in `tests/fightstage.test.js`, CSS in `styles.css` (reduced-motion guards in the same block), a changelog line and a design-log row; captures are in `docs/screenshots/2026-11-17-visual-pass/`. Frame rate 60 a second at `--throttle 4`; every node added is removed (`gone`, `clearDomes`).

**Things to know:**
- The six effects went in **one commit**, not six (they share `fightstage.js`, `styles.css` and one test file); the two test gaps and the CSS were their own commits earlier.
- Only the fields the steps needed were added to core lines (`jumpFrom`, `callers`, `targets`, `shieldedBy`, a tick's `left`/`max`), passed through `feedLine` (now exported) and `feed.js`. No rule, number or roll changed.
- The shield flares on a **shielded shot** (`shieldedBy`), not `shotAbsorbed` (that is a runner's armour; a shielded shot is retargeted to the protector). The handoff's wording was off here.
- The captures of spread, tick, jam, alarm and patch are **forged** by `--effect` (`forceEffect` writes the lines onto a real round), because the rules seldom produce them in the preview fights; the dome also showed up in a real round. A Contagion fight seen end to end in the browser is not checked. The alarm's door is at the map's edge, so its rings are partly clipped in the capture; the camera now takes the door in. The tick capture shows the flaring ring; the drip and pip flash are too quick for the screenshot loop to catch reliably.
- The preview needs `npm install` and playwright linked into `node_modules` (not committed).

**Left:** nothing of the six; eyes on a real Contagion/hack fight at Watch speed, and the wording of the three new stage texts (`stage.jammed` "Jammed", `stage.jamFail` "No lock", `stage.alarm` "The alarm is up") is mine, for the owner to change in `data/fightText.js`. No PR opened.


Written 2026-11-17 for a session that runs while the owner sleeps. Read `CLAUDE.md`, then this. The owner's words: "everything we are doing in this animation should maximise the visual and enjoyment appeal." The model for every effect below is the medic's aura (built 2026-11-17): a glow, something that travels, a landing, a floating word, a pip filling. Read how it is done first: `ui/fightstage.js` (`stageScript`'s `aura` step; the `aura` case in the player; `gone`, `flash`, `float`, `pips`), `ui/styles.css` (search "The medic's aura"), `tests/fightstage.test.js` ("the medic's aura is drawn"), and the capture: `node scripts/preview-livebattle.mjs <dir> --job data_pull --seed 3 --rounds 6 --aura --scale 2`.

## The rule that makes this safe to run alone

**UI only. Do not change a rule, a number or a roll.** The stage draws what the rules did (`docs/BATTLES.md`; the stage's own header comment): it decides nothing, pace changes timing and never the picture, and reduced motion cuts to the end state. The only core change allowed is adding a field to a line a step needs (as `left` and `max` were added to the aura line), and then it must pass through `runfight.js feedLine` and `feed.js` (they whitelist fields; the aura line was never drawn because of this). If an effect needs a rule change, stop and write it up in `drafts/` instead.

## The work, in this order (one commit each, `npm test` before every push)

1. **The Contagion jump** (the owner's favourite picture: a contagion spreading through a swarm). When an infected enemy falls and the infection jumps (`spread` lines carry `enemy` (the new host) and `from`), draw a green arc or orb leaping from the fallen body to the new host, the ring flaring on arrival. Today the `spread` line is a caption only. A chain should read as a chain: one hop per round, the ring pulsing as it lands. Check the swarm preview: `--foes 6` with a Contagion carrier.
2. **The infection tick** (`tick` and `tickOut` lines): a green drip or pulse on the host as it loses its pip; a distinct pop when it falls to the tick. The ring (`fs-infect`) already exists.
3. **Shield** (`shield` actions, `lean` toward the patient already exists): a soft blue-white dome or arc from the protector to who they cover, flaring when it absorbs a shot (`shotAbsorbed`).
4. **Jam**: the `ping` ring exists; add a broken-signal arc from the tech to the caller on `jamOk` and a flicker on `jamFail`.
5. **The way-out beat**: when a hack's work is done (`wayOut` line, `b.stage` becomes 1) play a short alarm beat: a red ring or flash at the entrance, the arrivals streaming in from it (they already `enter` from `entrance`), a stage caption ("The alarm is up"). The goal line already reads "Fighting out".
6. **The medic's hands on the way out** (`stabiliseWayOut`, `wayOutPatch` lines): the same aura picture for each downed runner reached; a soft group pulse for the patch (`wayOutPatch` carries `targets`).

For each: give it its own look in `data/fightLooks.js` if it has several (as the specials do), a `MS` timing in `fightstage.js`, and CSS in the same block style as the aura's. Keep each effect under about a second at Watch, and let the director's ROUTINE set decide what Fast skips (`core/director.js`).

## Checks every effect must pass

- `tests/fightstage.test.js`: one step per line it draws; Resolve gives `dur` 0; the final picture is unchanged (`pace never changes the picture` already runs). Add a test per effect like the aura's.
- **Frame rate:** `preview-livebattle.mjs` prints frames a second; it must stay at about 60 with `--throttle 4` (phone-class). Look for `drawn: {"svgNodes": ...}` growth; remove every node you add (`gone(...)`).
- **Reduced motion:** `deps.reduced()` cuts to the end state; add the CSS `prefers-reduced-motion` guard in the same block.
- **Phone width first** (360-430px), no hover-only information.
- **Captures:** run the preview with a flag for the new effect (add one, as `--aura` was added), take 3 or 4 frames of the effect, crop to the map, and put them in `docs/screenshots/<date>-<slug>/` with a row at the top of `docs/screenshots/README.md`. Never overwrite an old set.
- Changelog entry at the top of `docs/changelog/2026-11.md` (or the newest file) and a design-log row for each decision (`docs/design/2026-11.md`, newest first). Update `CODEMAP.md`'s `ui/fightstage.js` line.

## Two small test gaps to close first (30 minutes)

1. The Contagion Vector's kill by a shot or the overwatch (`spreadFrom` after `attackOut`/`overwatchOut`): `tests/builds.test.js` tests the tick path and the killing-hit path only. Add one that a shot-felled infected enemy hands on its infection.
2. The planning read with a Contagion carrier: `buildRead` (`core/fightview.js`) reads `PAYLOADS` generically; add a test with `payload: 'contagion'` that the advice and the breakdown name the Contagion Vector, and that a drone is still "can't hurt".

## What not to do

- Do not decide any item under "Waiting on the owner" in `HANDOFF.md`. Draft options in `drafts/` and leave them.
- Do not open a PR into `main` while the previous PR is unmerged; stacked PRs do not retarget themselves. Push to a branch (for example `claude/visual-pass` from the tip of `claude/awesome-cerf-p09fsh`, or from `main` once that PR is merged) and leave the PR for the owner.
- Commits under the owner's name only (`CLAUDE.md` "Commits": no `Co-Authored-By`, no session lines).
- If a step fails twice, stop, commit what is green, and write what happened at the top of this file.

## Done when

The six effects above each have a capture, a test and a changelog line; the tests pass; the frame rate holds; and this file's top says what was done and what is left, for the owner to read in the morning.
