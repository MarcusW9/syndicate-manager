# Proposal: the live battle view (Engine 2 played on the site map)

Status: **for the owner to approve, then for a new session to build** (written so it can be pasted in cold; Opus suggested by the owner
for the build). Nothing in this file is built. It replaces the Slice 2 "map" in `drafts/HANDOFF-watchable-combat.md` (that handoff's
rules slices, the director and the invariants all stand; this changes what the map is). Design row: `docs/design/2026-11.md`, 2026-11-12,
"the live battle view".

Read first: `CLAUDE.md`, `CODEMAP.md`, `drafts/HANDOFF-watchable-combat.md` (the invariants and Slices 0-1, already built), `docs/BATTLES.md`.
Mock-ups to open (self-contained pages, run them): `drafts/prototypes/fight-on-map.html` (**the target look and feel**),
`fight-map-showcase.html` (the star's showcase: ricochet, slash, swarm), `fight-map-motion.html`, `fight-map-faces.html`.
Stills: `docs/screenshots/2026-11-12-design-session-*`. Regenerate a mock-up with `node drafts/prototypes/<name>.mjs`.

## 1. What the owner wants (in their words, condensed)

"Not in an instance UI: on the map where the portraits are circular like during the run, moving around like units on an RTS, basically
representing what the script engine is deciding. The live-action sim you see in Football Manager when you sim a game: the guys running
around. When it comes to a battle we see them running around fighting, moving back and forth, shooting, jamming. Then the showcase
happens and our star guy absolutely destroys them: a sniper whose shot ricochets from enemy portrait to enemy portrait in slow
motion, a close-combat guy moving into the pack and slashing like a samurai, or a swarm of weak guys coming and the star pings them all."
References the owner gave: a top-down shootout with muzzle flashes, tracers and bodies left on the ground; a dense crowd with a few brutes.

## 2. The idea in one paragraph

The engine stays exactly as it is: orders, d20 rolls from a seeded rng, no positions. The watch screen's **existing site map**
(`ui/siteplan.js`, the one the run already plays on, with its fight camera and cover) becomes the stage. A new presentation layer, the
**stage**, turns each round's recorded result into continuous, readable motion: tokens run to the cover the rules say they hold, shoot
at the targets the rules chose, hit and miss as the dice did, fall where they fell. Between decisions the units are never still (strafing,
suppressive fire), like a match view. A showcase is the same ordered list of attack lines, drawn as a set piece with slow motion, a
following camera and letterbox bars. The picture shows the engine's decisions and decides nothing.

## 3. Hard rules (do not break; they are what makes this safe)

1. **The stage reads, never writes.** It takes recorded events and returns pictures. Nothing it does reaches `core/` or the save,
   and it draws no roll that matters. (The handoff's invariants 1-5 stand.)
2. **Pace never changes outcomes.** Fast, Watch and Resolve end in an identical state. In the mock-ups this is asserted by comparing a
   state dump across the three paces; keep that test (a headless check of the final token states, and the core determinism test that exists).
3. **Positions are staging.** The rules have cover (`full`, `half`, `open`) and no coordinates. A token stands on a fight spot whose cover
   matches the rules' cover for that unit that round (`core/fightspots.js` already ranks spots full / half / open). Nothing may look in
   or out of range, in or out of cover, in a way the rules do not have. If the picture and the rules disagree, the rules are right.
4. **Units are the rules' units.** A swarm is drawn as each rules enemy being a knot of small bodies; the enemy is what goes down. Never show
   more units than the rules hold. Bodies stay on the ground after a defeat.
5. **Cosmetic randomness is seeded.** Idle motion and ambient fire use `hash01(b.showcaseSeed, round, unit, tick)` (built in Slice 0b), not
   `Math.random()`, so the same fight looks the same every replay and a saved fight resumes identically.
6. **Mobile first.** Tap targets 44px, safe areas, no hover-only information, reduced motion respected (cut instead of tween), 60 fps on a
   mid phone with 6 crew and up to 10 enemy units plus effects. Everything is also written in the commentary/log.
7. All wording through `lineText` keys in `data/fightText.js`; the owner writes the text, use placeholders.

## 4. What exists already (use it, do not rebuild)

- `ui/siteplan.js`: `sitePlanSvg`, `bindSitePlan`, tokens (`.sp-token`, a 13px face in a ring, scaled 1.2 in a fight via `.is-fight`),
  the fight camera `frameFight`, cover marks, `.sp-fx` for effects. Engine 1 already plays fights here, on `core/fightspots.js` spots.
- `core/fightspots.js`: `fightSpots(site, zone, need)` and `spotsForJob`; spots are `{ at, cover }`, crew best-cover-first, guards nearest their post.
- `core/director.js` (built, PR #144): beats with tiers (routine / notable / spotlight / showcase), `focus`, `holdMs`; `playable(beats, pace)` is the spotlight budget.
- Events: every round is recorded with `lines` (each with `kind`, `key`, `slots`, `actor`, `enemy`/`target`/`targetId`, `success`, `roll`) and `beats` (indices into the lines).
- Engine 2 today draws a separate round panel (`ui/fightscreen.js`, fed by `core/fightview.js`) in the call-in slot, with no map overlay.

## 5. What to build

### 5.1 Spots for Engine 2 (core, small, save change)
`startFight` (`core/runfight.js`) computes the fight's spots like `runbattle.js startBattle` does (`spotsForJob`) and stores them on the
fight; **bump `SAVE_VERSION`** and migrate (`save.js`): an old fight in progress gets spots computed on load. New pure
`core/fightmap.js`: `layoutFight(b, spots) -> { [unitId]: { spot, cover } }`, a deterministic mapping from the rules' state (each runner's
`cover`, hunker/boarding/leaving stances, each enemy's `cover`, `approaching`, `fled`) to spots. It never draws and leaves `b` deep-equal
(add it to the preview tests). The map's cover is then the fight's cover: that is the "shown equals used" for the picture.

### 5.2 The stage (UI): `ui/fightstage.js`
A choreographer bound to the existing site plan. It consumes a round's events and plays them as a timeline of **scenes** (not one
animation per line):
- **Re-stance** at the start of a round: tokens move to the spots `layoutFight` gives; enemies that arrive run in from their door.
- **Orders in motion:** a protector steps beside who they cover; a medic moves to the patient; the tech stays at the objective; the driver goes to the van.
- **Exchange:** each attack line plays as a short run-and-fire (tracer, muzzle flash, hit flash and shake, or a miss that passes wide), in
  the order the rules resolved them (overwatch, the crew by seat, the threats). A knock-down is a fall; a body mark stays.
- **Ambient life:** units are never static: small seeded strafing, suppressive tracers between random live pairs (no hit mark, so they
  imply no result), enemy fire pinning the crew. This is what makes it read as a sim. It must stay visually quieter than the real events.
- **Camera:** the game's fight box (a box round the fight spots), tweened; a push-in and follow on spotlight and showcase beats.
- **Pace:** Watch holds each beat (`holdMs`, spotlight slow-mo); Fast plays about 0.6x and shortens holds; Resolve jumps to the final
  stance. Call-ins still pause exactly as now (`am.pending`). Pace is a UI preference (`save.js getPref`), never read by core.
- **Commentary:** the director's beats as a one-line strip plus a timestamped log, so a fight can be understood without watching.

### 5.3 Showcase choreographies (UI only; the rules are Slice 4 of the handoff)
Chosen from the star's **gear and role**, not from the rules: a rifle ricochets (a bolt bouncing target to target, camera following), a
blade dashes and slashes through the pack (afterimage trail, slash arcs), an area ability pings the pack (a shockwave, then rapid
bolts). The order of the rules' attack lines is the order the picture visits the targets. Letterbox bars, slow motion, a "Showcase" title, then the camera pulls back.
**Open (owner, content question 4):** does a showcase do something Overdrive cannot, rules-wise, or is it a bigger look for the same burst?

### 5.4 Swarms and crowds
Small weak enemies are drawn as a knot of 4-6 small bodies per rules enemy; brutes are single portrait tokens. A body count on screen
never exceeds what the rules hold as units (rule 4). Use a canvas layer if SVG is too heavy at that count.

## 6. Order of work (each its own PR; `npm test` green; CHANGELOG, DESIGN row, screenshots README row)

1. **Spots and layout (5.1)**: `fightmap.js`, the save migration, tests (deterministic, deep-equal, cover matches).
2. **The stage, static then moving**: engine-2 fights shown on the site plan with circular tokens in place (replace the round panel's role as the
   main view; keep the panel's orders and call-ins), then re-stance and exchange scenes. Pace chips Fast / Watch / Resolve.
3. **Camera, ambient life, commentary.**
4. **Showcase choreographies and swarms**, once the handoff's Slice 4 rules exist, or earlier against a forced showcase flag for testing.
5. **Playtest gate (owner)**: can a fight be understood without the log; can the specialist and the protector be told apart; does a good result trace to your own orders. Findings to DESIGN.md.

Acceptance: the pace-invariance test passes (identical end state at three paces); previews and `layoutFight` leave `b` deep-equal;
a forced showcase plays and records identically at every pace; no token is ever drawn in cover the rules do not give it; reduced motion cuts; 60 fps on a phone-class device (measure, do not guess).

## 7. Risks and how to hold them

- **The picture implies mechanics that do not exist** (range, line of sight, chasing). Mitigation: rule 3; spots from rules' cover only; ambient fire shows no hit or miss.
- **Clutter hides cause and effect.** Mitigation: ambient motion quieter than events; events get a tracer, a flash and a caption; the log is always there.
- **Cost on phones.** Mitigation: SVG tokens (cheap), transform-only motion, a canvas layer only for crowds, measure early in step 2.
- **Scope.** This is the largest UI job in the project. Keep step 2 shippable on its own (a fight on the map with simple motion) before any showcase work.
- **Engine 1 fights** still use the old stage. Decide later whether to port raids; keep the stage's input format neutral (lines and beats) so it could.
