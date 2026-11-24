# Plan: visual variety for the job maps (2026-11-23)

The owner asked for more variety in how jobs look, so the same district stops feeling like the same map: more maps per district, lighting moods, the insides of buildings for multi-map stops, fully-inside floors in the dark with a close camera, and a pack of cyberpunk furniture placed at random. Everything here was mocked up and approved in one session (decision log, 2026-11-23). This is the order to build it in.

**Ground rules for every phase**
- **Visual only for now.** Nothing here changes a roll, a fight's odds or a death rule. Inside maps, the dark and the furniture are pictures. The owner may want them to matter later (dark rooms hiding guards, the drone scouting ahead, furniture as cover inside), so keep the data ready for it (`cover` on each piece, rooms on the site) without any rule reading it.
- **The route line stays as it is.** The owner preferred the current line to the glowing one in the lighting mockup.
- **Nothing in the save.** Every map, mood, room and piece comes from a hash of the job's id (and the stop's), like `pickSite` today. Same job, same map, every time. No `SAVE_VERSION` bump unless a phase stores something.
- **Seeded randomness only** (`core/rng.js hashRng`, or a seeded generator taking its seed from the job and stop). Never `Math.random()`.
- **Every generated map passes the map tests**: on the map, routes join, the route never crosses a wall or a piece of cover, guards stand on the map, the rifle never sees the target. Generated kinds are tested over a few hundred seeds each.

## The mockups (all in `docs/mockups/`)
| File | What it shows |
| --- | --- |
| `2026-11-23-map-lighting.*` | Lighting moods on the Docks and Old Town: now, lit night (B), rain and district colour (C) |
| `2026-11-23-interiors.*` | Generated interiors: lock-up, mahjong parlour, tenement stairwell, alley (generator in the `.mjs`) |
| `2026-11-23-dark-floors.*` | A two-floor building with no outside, rooms dark until entered, a hallway lit where walked, the stairs to the next floor, a close camera on the crew |
| `2026-11-23-furniture.*` | The furniture pack (`src/ui/furniture.js`): 50 pieces and a room of each kind furnished from its kit |

## Phase 1: the furniture pack in the maps (small)
Built: `src/ui/furniture.js` (pieces, room kits, `furnishRoom`, `furnitureLayer`), `tests/furniture.test.js`, `scripts/preview-furniture.mjs`.
- Draw placed pieces in `ui/siteplan.js sitePlanSvg` as their own layer (over the shapes, under the props and route), from a site's `furniture` list (`[{ id, x, y, w, h }]`).
- The hall maps (`data/sites.js HALLS`) can swap their plain rects for pieces later; not needed now.
- Add pieces as they're wanted: each is a size, its rooms, `cover`, and a draw function. Check with the preview.

## Phase 2: lighting moods (small)
- A site gets a `mood`: `plain`, `night` (B) or `rain` (C), picked by hash from the job's id (weights to taste: most plain or night, rain now and then). Districts carry their night tint, fog colour and light positions (the lamp, window and sign points from the mockup) next to their `glow` in `data/sites.js`.
- `ui/siteart.js` draws the mood as one layer under the route (the mockup's `layers()`): the darkening, light pools, cones, vignette; rain adds the district colour, fog, rain and wet-road reflections. The route keeps its current look.
- Optional, later: switch to `rain` when a job's alarm goes off or a crisis calls in.
- Respect reduced motion: no rain or flicker animation when it's on.

## Phase 3: more maps per district (medium; content)
- Move the Night Market, Glass Heights and the Basin onto parts (approach, middle, target) like the Docks, and fill out Old Town (it has one approach and one middle).
- Target about 3 approaches × 3 middles × 3 targets a district. Each part is hand-drawn data in `data/sites.js`; `tests/sites.test.js` already checks every combination.
- Furniture and props can dress the parts; moods apply to all of them.

## Phase 4: generated places for multi-map stops (medium)
- A generator module (data in `src/data/`, the generating in `src/core/` as pure functions, or both in `src/data/places.js` if it only builds content) for the place kinds: `lockup`, `parlour`, `stairwell`, `alley`, plus a plain `shop` and `warehouse`. Each kind sets its rooms' kinds (for the furniture kits), sizes, the target room's name and the district's look and light.
- A multi-map stop names its kind: `place: { kind: 'lockup' }` in a job's `maps.stops`. `core/multimap.js runPlace` already gives each stop its own key; `pickSite` builds the stop's site from the kind and `${jobId}:${stop}` when it has one, else the district's map as now.
- Kidnap Rescue first: the lock-up (lockup), the back room (parlour), the courier's door (stairwell), the wrong leads (a yard and a flat above a stall). Update `docs/new-job-prompt.md` "Multi-map jobs" and `core/validate.js validateMaps` for the new field.
- Fights on a generated map: cover is the furniture with `cover: true`; spots come from `core/fightspots.js` as for any site. Test that every kind gives both sides spots.

## Phase 5: fully-inside floors, the dark and the close camera (larger)
- A site can be `inside: true`: no street, the whole map is one floor (the mockup's ground floor and upper floor generators). A building is a list of floors; each floor is its own map, joined by stairs (a stop or the finale can be "G/F → 1/F → roof"). Each floor change gets the "UP TO 1/F" card.
- **The dark** (visual only): rooms dark until the crew walks in, a glimpse through an open door they pass, a hallway lit along the stretch they've walked. Drawn by `ui/siteplan.js` from the crew's position as the watch plays; nothing stored.
- **The close camera**: the watch's camera sits on the crew with about one room in frame and is kept inside the building, so its outline is never seen. A fight zooms out to the room it's in (still dark beyond the walls) and closes back in after. Check on phones in portrait and landscape (844x390) and the fight camera's existing rules.
- Where's the target: nothing on screen; Joss or the feed gives the direction. (An arrow at the screen's edge is the alternative if playtests get lost.)
- Later, if the owner wants it to matter: guards in unseen rooms hidden until the door opens; the drone reveals rooms ahead; crises triggered on entering a room. Each of these changes play and gets its own decision row.

## Phase 6: polish
- More pieces in the pack per district (Docks: forklifts, cable reels; Heights: glass desks, server walls; Basin: tack, feed bins; Night Market: stalls' stock).
- Screenshot sets and audits after each phase (`npm run screenshots`, `scripts/audit-landscape.mjs`, the fight landscape audit).

## Not doing
- A glowing route line (the owner kept the current one).
- Storing maps in the save.
- The dark or furniture changing any roll, for now.
