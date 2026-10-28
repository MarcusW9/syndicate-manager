# Art bible

How the game looks, and how to make more of it so it fits. The values here are the ones the code uses (`src/ui/art.js`, the skin block at the end of `src/ui/styles.css`). If you change one, change both, and log the change in `DESIGN.md`.

**Who this is for:** a future coding session extending the art, someone generating reference or promo images, or an illustrator commissioned for portraits. Each has a copy-paste prompt in [Prompts](#prompts).

---

## The look in one paragraph

A street terminal in a wet neon city, after Cyberpunk 2077's interface and Citizen Sleeper's calm. Dark, sharp panels with one corner cut off; a condensed display font for structure and numbers; readable system text for anything you read. Faces are flat-colour vector portraits with hard light and shadow shapes instead of outlines, real skin tones, and one colour of city neon falling across each face from the right. Warm with an edge: friendly faces, cute Joss, but scars, chrome and bandages are part of the city.

## Rules that never change

1. **Text first.** Every picture is decorative to a screen reader (`aria-hidden`). Anything a picture shows (injured, tired, neural load, mood) is also written as text.
2. **Faces tell the truth.** Expression and condition come from game state, never from chance. A dead-eyed stare means burnout or dangerous neural load. Gear may *hide* condition (a mask over the eyes, a visor), since the text always says it; a face must never *show* a condition that isn't true.
3. **Real skin tones for everyone.** The city is Cantonese at its base, with Filipino, South Asian, Southeast Asian, African and European communities. Every face is fully readable on every tone: eyes carry a highlight, lips are a shade of the skin, tattoos are thin neon ink.
4. **No caricature.** Culture only widens or narrows a broad, overlapping band of skin tones and nudges hair texture. Every style is possible for everyone. No "tribal" tattoos; use geometric line work.
5. **Everyone is 18 or older**, and drawn with adult proportions.
6. **No magic.** Chrome is cheap, second-hand, glitchy street hardware (`WORLD.md`, Tech and neural load). Nothing glows that isn't technology or neon.
7. **One face per person, forever.** Faces are built from a stable hash of the person's ID and name. Nothing about the face is stored in the save; nothing is random at draw time.
8. **Works offline.** Fonts and art ship with the game (the iOS app has no network guarantee).

---

## UI skin ("street terminal")

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0a0c0f` | page, with a faint 32px cyan grid (`rgba(61,232,216,0.025)`) and static scanlines |
| `--panel` / `--panel-2` | `#12151b` / `#161a21` | panels (vertical gradient 2 → 1) |
| `--line` | `#2a303b` | borders, hairlines |
| `--text` / `--muted` | `#e9ecf1` / `#8a93a6` | reading text / secondary |
| `--accent` | `#ff3d5f` signal red | actions (Continue, Start), the active tab marker |
| `--accent-2` | `#3de8d8` cyan | structure: section heads, panel tabs, unread, Joss |
| `--warn` | `#f2d541` sodium yellow | warnings, tier badge |
| `--danger` | `#ff4a4a` | money short, losses |
| `--radius` / `--cut` | `2px` / `10px` | everything is sharp; panels lose their top-right corner |

- **Type:** Rajdhani 500/600/700 (bundled, Latin only, OFL) for headings, labels, tabs, buttons, badges and numbers, uppercase with 0.06–0.18em tracking. Body text stays in the system font.
- **Panels:** top-right corner cut (`clip-path`), a hairline across the cut, a 36×2px cyan tab on the top edge.
- **Buttons and cards:** two corners cut (8px) or bottom-right cut (7px).
- **Gauges:** segmented (4px on, 1px off).
- **Motion:** a blink, a breathing light, a new-day flash. Nothing loops fast; everything stops for reduced motion.
- **City map** (`src/ui/citymap.js`, fed by `cityMap()` in `src/ui/app.js`): Lantern Bay from above, at night. A made-up coast (never traced from a real city or another game's map), seeded so it never changes: the island with the Peak in the middle, a wild island to the west, the Amber Reach out in the harbour, the mainland with its piers and the Silt's dotted mudflats. Land `#0b1317` with soft hill shading (lit slopes cyan, shadow navy, drawn once into an image) and contour rings round the summits; the sea `#070a0e` with a faint wave-scale pattern; coasts a thin glowing cyan line. Streets are thin signal-red lines, a different grain per district (corporate grid on the ridge, crooked lanes in Old Town, dense tangle in the market, haul roads at the docks, almost none in the Silt, switchbacks up the Peak); locked districts go grey and hatched. The Basin is a bowl (a dip in the shading, a contour round its rim) with Lantern Course drawn as a floodlit cream oval `#f7efc8` with a faint green infield, the one landmark drawn on the map. District borders take the turf colour (Brass Anchor sodium `#f2d541`, Red Lantern red `#ff3d5f`, Silver Fan violet `#b48cff`, Veridian-Apex cyan `#3de8d8`, Racing Association floodlight orange `#ff9a3d`; others grey) with a written key under the map. Names in sodium Rajdhani caps, 14 units, with the live readout under them at 12 units (cyan for work, sodium for street talk), both with a dark halo; both stay at least about 10px on a 360px phone. Chinese names live on the district card, not the map. Motion: a ferry light crosses, the selected district's border breathes, the street-talk dot blinks; all still for reduced motion. New districts are one entry in `DISTRICT_MAP`; the north shore, the valley east of the Peak and the west island have room for them.
- **Icons** (`src/ui/icons.js`): line icons drawn like Joss's face, a 24-unit grid with 1.8 strokes, round caps and joins, no fills, in the text's colour (`currentColor`). One idea each: combat a blade, stealth an eye struck through, tech a chip, social a speech bubble, driving a steering wheel, medical a cross, cool a steady pulse, a person as head and shoulders (crew sizes on side-work cards show one figure and the number, "[figure] 4"). **Gear** (2026-10-28) has one icon per item type, the same way: a rifle with its scope, a handgun, a plated vest, a quadcopter drone, a deck, a bag with a cross, a key for lockpicks, a head with a chip for implants; always beside the item's name. They sit beside their word (rule 1) wherever a stat is a label you scan (dossiers, the picker, the crew list, the profile's stats), not inside sentences. **One exception, the job board's cards** (2026-10-28): the key stats show as icons alone, because the same words are one tap away on the planning screen; each icon still carries its name for screen readers and as a hover title on desktop, and the reputation (i) above the board holds the key.
- **Risk corner** (job board cards, 2026-10-28, owner's call after Cyberpunk 2077's inventory slots): a thin bracket inside the card's top-right corner, 4px in, 14px each way, 1.5px lines at 70% opacity, coloured by Joss's read: low `#5fe0a5`, mid `--warn`, high `#ff9a5a`, extreme `--danger`. All the same size: the colour alone tells the levels apart on the card (the owner's call); the word is on the planning screen, for screen readers and as a hover title. Flags on a card are outlined boxes in display caps, only when something is unusual.
- **Site plans** (`src/data/sites.js`, drawn by `src/ui/siteplan.js`): the watch screen's map of a job, one per district, from above at night on the same dark ground as the city map. Flat shapes, no outlines on cover; buildings `#171b24` with a grey edge; the target room a dashed signal-red outline; the crew's route a cyan line with ring nodes; overwatch a sodium perch; the rifle's sight a faint sodium wedge, the drone's cyan. Each district reads at a glance: rust and teal containers and the harbour (Docks), lit windows, laundry lines and an alley of steps (Old Town), neon stalls and a grey crowd (Night Market), a cyan-edged glass tower over a planted plaza (Glass Heights), the cream racecourse oval and timber stables (Basin). Labels are small grey caps; the target's is white.
- **Gear** (`src/ui/gear.js`): the armoury is rows on `--panel-2` with the bottom-right corner cut, the item's drawing above (or its cyan line icon beside) its name in display caps and what it does in cyan. A runner's four slots are tiles in a 2×2 grid, each with the item drawn big in a 3:1 frame; empty ones are dashed with a +. Buying shows one row per item with a button per tier ("¥2,500", "PRO +1 ¥6,250").
- **Gear drawings** (`gearArt` in `src/ui/art.js`, 2026-10-28): items drawn like the faces: flat colour, hard light from the right, no outlines, top edges and lenses catching the city light, undersides falling to the navy shadow `#1b2340`. A 96×32 frame, front to the right, on `#0d1016` with the light as a gradient from the right. One drawing per item type; only three things change: the **tier** (street: gunmetal `#454c57`, worn wood `#6b4a2e`, sodium tape, canvas sling; pro: carbon `#1d2129`, skeleton polymer stock, a neon line in the carrier's chrome colour), the **light** (the carrier's city light; sodium `#f2b544` in the stash) and the **neon**. So far: the rifle (scope, vented handguard, suppressor, folded bipod, sling). Others keep their line icon until drawn.
- **Gear on portraits:** one item at a time, the most telling (only the rifle so far). The rifle hangs across the back: drawn behind everything at `translate(4 72) rotate(-44) scale(0.9)` in the 64-grid, stock low on the left, scope and muzzle up behind the lit shoulder, with the sling across the chest in front of the shirt. From game state, like injuries; never random.
- **Freelancers** (squad picker and board): violet `#b48cff`, the one colour nothing else on the board uses: a 3px stripe down the left of their picker row on a violet-tinted `#1c1928`, a "Freelance" tag in display caps over their cut, and a violet bar along the bottom of their dossier.
- **Tap targets** stay at least 44px. **Layout** is phone first (360–430px), with a sidebar from 900px.

---

## Portraits

### Frame and grid
- Drawn on a **64×64 grid**, shown cropped to `9 6 46 46` (head and upper shoulders), in a **square with the top-right corner cut** (7px at 48px size, 12px at 104px).
- Sizes in the game: 48px (Crew list, leads, level-up cards), 104px (profiles, a lead's page, graduation cards), 32px (memorial wall, job planning picks, on-the-job crew strip).
- One pose for everyone: straight on, neutral head angle.

### Lighting recipe (the core of the style)
Every face is lit by **one city-light colour from the right**, chosen from the person's ID:

| City light | Hex |
| --- | --- |
| Cyan | `#3de8d8` |
| Signal red | `#ff3d5f` |
| Sodium | `#f2b544` |
| Violet neon | `#9b8cff` |

Colours are blends of the skin (or hair, or shirt) with the light or the shadow:

| Part | Recipe |
| --- | --- |
| Background | `#0d1016`, with the light as a gradient from the right edge (28% opacity, fading by 65%; 10% when tired) |
| Shadow side of the face (left, a broad plane) | skin blended 42% toward cool navy `#1b2340` |
| Mid shadows (eye sockets, under the cheekbone) | skin blended 20% toward `#1b2340` |
| Lit rim (right edge of face, neck, ear) | skin blended 38% toward the light |
| Lips and fine lines | skin blended 50% toward `#2a1210` |
| Brows | hair blended 45% toward `#0d0a09` |
| Hair highlight band (right side) | hair blended 50% toward the light |
| Shirt lit side | shirt blended 38% toward the light |
| Eyes | `#120d0b` almond shapes with a small white catchlight |

No outlines around the head. Depth comes from the planes: shadow side, cheekbone, nose side, lit rim.

### Skin tones
Twelve tones, light to deep: `#f6d7c3 #efc3a4 #e3b08f #d49a76 #c68863 #b07350 #9a6142 #855236 #6f432b #5c3623 #4a2b1d #3b2218`.

Culture comes from the surname, using the game's own name lists (`src/data/recruitPools.js`). It sets a wide band, and the bands overlap:

| Culture | Tones (index) |
| --- | --- |
| Hong Kong / Cantonese | 1–6 |
| Filipino | 3–8 |
| South Asian | 3–10 |
| Southeast Asian | 2–8 |
| African | 6–11 |
| European | 0–5 |
| Unknown | all |

### Head shapes
Four (half-width / jaw / chin / chin height): oval 11.5/7.5/3.2/45, round 12.5/9/4/44, square 12/10/5/45, long 10.8/7/3/46.5. Eyes sit at y 29, brows around y 25, mouth at y 40, hairline around y 19.

### Features and how often they appear (random, fixed per person)

| Feature | Options and odds |
| --- | --- |
| Hair style | crop, buzz, long, bob, bun, curls, locs, undercut (with a geometric tattoo on the shaved side), slick-back (wet shine), fiber-optic dreads (glowing strands and tips), bald. A third of the time the style leans by culture (African: curls, locs, buzz; South Asian: long, crop; European: crop, bob). |
| Hair colour | natural `#17171b #241c19 #3a291e #563820 #7f5428 #a37540`; 15% dyed `#ff4f7b #36d6c3 #a78bfa #f5b942 #7dd3fc`; grey `#b9bcc4` for 60% of those 45 or older |
| Split-dye | 12% of people with hair: the left half in a second neon colour |
| Chrome | temple port (3 in 7; the cheap street standard), circuit lines on the jaw, temple or nose bridge (2 in 7), cyber-eye lens on the lit side (1 in 7), synthetic-skin patch with a clean-cut seam (1 in 7). Chrome colour: cyan (half), red or amber. |
| Markings | none (3 in 7), geometric neon tattoo, neck barcode, jagged street scar, clean cut |
| Eyewear | visor 5% (never with a cyber-eye); glasses 12% otherwise |
| Other | stubble 12%, earring 25% (sodium gold), shirt in one of five dark colours |

**Gear and looks** (added 2026-10-25). Drawn from a **second seed** (`id|name|gear`, in `withGear()`), so adding them left every feature above exactly as it was. New gear goes at the end of that pick list, never in the middle.

| Feature | Options and odds |
| --- | --- |
| Monk | 6% of Hong Kong names, 1.5% of everyone else. Shaved head; no earring, dye or facial hair. Robes replace the shirt: **grey** (2 in 4), a Chinese crossed-collar robe `#6b6f78` with a dark collar band; **ochre**, a brown robe `#5e4630` with an ochre kasaya `#b06a24` across the left shoulder, patchwork seams; **cyber**, a dark robe `#22252d` with a collar edged in the chrome colour. All wear a mala of 13 wooden beads `#7a4a2a` round the neck (the cyber monk's every third bead glows in the chrome colour). 35% of monks wear the woven hat. |
| Half-chrome face | 3%. A gunmetal plate `#58606b` over the lit half of the face, seamed into the skin just right of the nose and mouth, with panel lines, rivets and a cheek vent; the lit-side eye is a lens and the ear a metal disc, both glowing with neural load. It replaces any other chrome, glasses and visor. |
| Mask | 7%: **Respirator**: rounded `#2a2f38` with twin filter cans and a status LED. **Jaw plate**: angular gunmetal `#4a525d` from nose to chin with breathing slots. **LED grille**: black `#101318` with an LED line where the mouth is, drawn to match the real mood (flat, smirk, zigzag when stressed, dotted and dim for the dead stare, drooping when tired). These can come with a visor. A mask hides facial hair. |
| Full mask | 3%, from its own pick, replacing any other mask, glasses and visor; it hides the eyes. **Goggles**: the respirator plus sealed round goggles with tinted lenses that catch the city light, on a strap. **Faceplate**: a smooth plate `#2b3039` over the whole face with a centre seam, mouth vents and two angled LED eye slits in the chrome colour that brighten (and halo) with neural load; it hides other chrome, and injury shows as a crack across the plate instead of a plaster. |
| Conical hat | 7% (non-monks). **Steel war hat** (2 in 4): a shallow riveted cone `#5b636e` with ribs and a lit rim. **Carbon hat with a neon rim**: dark `#1c2028`, its rim a glowing line in the chrome colour. **Woven hat**: a deeper straw cone `#a8844c` with weave lines and a chin cord. All cast a shadow band across the brow; hair is clipped under the cone and a bun is hidden. |
| Facial hair | 20%, anyone, in the hair colour: pencil moustache, goatee (2 in 6), long drooping moustache, soul patch, short full beard (follows the jaw, with a chin tuft). |

### Condition and expression (from game state, never random)

| What the game says | What the face shows |
| --- | --- |
| Light injury | a crossed plaster on the lit cheek |
| Serious or critical injury | gauze band across the brow (small blood spot) plus the plaster |
| Fatigue over 60 | heavy lids, shadowed eyes, flatter mouth, the city light dims |
| Neural load | chrome glows brighter, with a halo above 40% |
| Neural load over 70 or burnout 60+ | dead-eyed stare: flat lids, no catchlight |
| Morale below 35 | stressed: narrow eyes, inward brows, clenched teeth |
| Morale 80+ | smirk: one mouth corner up, one brow raised |
| Fallen (memorial wall) | greyscale at 70% opacity |

Tired eyes override any expression. First match wins: dead stare, then stressed, then smirk, then neutral.

---

## Joss

The crew's bootleg AI (`WORLD.md`, "Joss"). They/them.

- **Current design:** a **cracked second-hand handset**: dark body `#1b1f28` with a cyan outline `#36d6c3`, a screen `#0f2a2c` with a hairline crack across one corner, a strip of sodium-yellow tape across the lower left, a bent antenna top right with a pink-red light that breathes (`#ff4f7b`), a round home button.
- **Face on the screen:** cyan strokes (2.4 wide, round caps): two short eye strokes and a mouth. Four moods:
  - **neutral:** straight eyes, flat mouth.
  - **happy:** arched eyes, smile (quiet days, first day).
  - **worried:** brows angled up, frown (bills short, broke, crew hurt).
  - **smug:** one eye squinting, crooked smile (Sunday, bills paid).
- **Frame on Today:** a hexagon "comms channel" badge with a cyan tint, labelled "JOSS · ONLINE".
- **Motion:** blinks every 6 seconds; antenna light breathes every 3; both stop for reduced motion.
- **Still open:** the final design. The owner hasn't committed yet; options tested were the handset, a round droid and a relay box. Any redesign should stay specific to the canon (the cracked handset and salvaged relay boards under the safehouse sink), not a generic robot.

---

## Prompts

### 1. For a coding session (paste at the start of a new chat)

```
You're extending the art in Syndicate Manager (repo MarcusW9/syndicate-manager).
Read CLAUDE.md, then ART.md, then src/ui/art.js before changing anything.

The art is inline SVG drawn in code (src/ui/art.js), no image files. Portraits:
64×64 grid cropped to "9 6 46 46", square frame with the top-right corner cut,
flat-colour vector, Citizen Sleeper style: real skin tones lit from the right by one
city-light colour per person (cyan #3de8d8, red #ff3d5f, sodium #f2b544, violet
#9b8cff), shadow side blended 42% toward navy #1b2340, lit rim 38% toward the light,
no outlines, depth from light and shadow planes.

Non-negotiables: faces come from a stable hash of id+name (no Math.random, nothing
stored in the save); expressions and condition marks come from game state only
(stateOf), never chance; every tone readable (catchlights, neon ink); no "tribal"
designs; everyone 18+; portraits are aria-hidden and every fact they show is also in
text; no DOM in src/core. New features: add the choice with its odds at the END of
withGear()'s picks (never earlier, or existing faces change), draw
it in portrait(), add a row to ART.md's feature table, add a test in
tests/art.test.js, log the decision in DESIGN.md, and add a CHANGELOG.md entry.
Check results by rendering a sheet of real generated crew with Playwright at 48px and
104px before committing.
```

### 2. For an image-generation tool (reference, mood boards, promo)

Using AI-generated images in the game itself is the owner's decision (rights, consistency and how players feel about it). These prompts are for reference and exploration unless the owner says otherwise.

**Style prompt (use as-is, then add a character line):**
```
Flat-colour vector portrait, head and upper shoulders, straight-on, neutral pose,
square crop. Minimalist cyberpunk illustration in the style of Citizen Sleeper:
bold flat shapes, hard-edged light and shadow planes, no outlines, very little line
detail, small almond eyes with a tiny highlight, short thick brows. Real natural
skin tone. One coloured city light falling from the right side of the face (choose:
cyan #3de8d8 / signal red #ff3d5f / sodium yellow #f2b544 / violet #9b8cff), the left
half of the face in cool navy shadow (#1b2340). Dark near-black background (#0d1016)
with a soft glow of the same light colour from the right edge. Muted, grown-up, warm
with an edge. Adult, 18+.
```

**Negative prompt:**
```
photorealistic, 3D render, painterly brush texture, thick outlines, anime, chibi,
exaggerated features, caricature, tribal tattoos, magic, glowing eyes without
hardware, text, watermark, busy background, multiple people, child, teenager
```

**Character line, fill the brackets:**
```
Character: [name], [age], [role]. [skin tone: e.g. deep brown / light olive / tan].
Hair: [style and colour]. Chrome: [temple port / cyber-eye lens in cyan / glowing
circuit lines along the jaw / synthetic skin patch with a clean seam]. Marking:
[none / small geometric neon tattoo on the cheek / barcode on the neck / jagged scar].
Wearing [dark shirt or jacket]. Expression: [neutral / slight smirk / tired, heavy
lids / stressed, jaw clenched / blank dead-eyed stare]. Condition: [none / plaster on
the cheek / gauze across the brow].
```

**Named cast, ready to use with the style prompt.** Ages, jobs and props come from `WORLD.md`; skin tone, hair and clothing beyond what it says are **suggestions, not canon**. Confirm them with the owner (and add them to `WORLD.md`) before final art.
- **Auntie Fung:** 71, Old Town tea-shop elder and quiet fence. Light olive skin, deeply lined, grey hair in a low bun, reading glasses pushed down her nose, plain dark high-collared top. Sodium-yellow light. Expression: calm, knowing, unreadable. Chrome: an old, scuffed temple port.
- **Mr. Szeto:** property developer, Glass Heights. Light tan skin, neat short black hair greying at the temples, expensive charcoal suit, white shirt, no tie. Cold cyan light. Expression: composed, faint smile that doesn't reach the eyes. Chrome: none visible (he's rich: the hardware is hidden).
- **The Ferryman ("Leung Ka-wai"):** older boatman who never steps ashore. Weathered brown skin, short salt-and-pepper hair, stubble, a clove cigarette held backwards between his lips, salt-stained work jacket. Signal-red light like a harbour lamp. Expression: guarded, tired eyes.
- **Madam Rao:** Night Market moneylender in a silk shop. Medium brown skin, black hair pulled back, gold earrings, a saffron-and-crimson silk sari border at the shoulder. Sodium-yellow light. Expression: a warm smile that's the dangerous part.
- **Ruth Okonkwo:** off-books broker for Aether-Harbour. Deep brown skin, short natural hair, grey suit, plain earrings. Violet light. Expression: flat, watchful, gives nothing away. Chrome: a thin circuit line at the temple.
- **Doc Siu:** ex-hospital surgeon, unlicensed clinic under Tenement Block 9. Light olive skin, hair scraped back, a cigarette, surgical mask pulled under the chin. Cyan light. Expression: dry, unimpressed.
- **Joss:** not a face. A cracked second-hand smartphone with tape on one corner and a bent antenna, a simple line-drawn face glowing cyan on its screen, dark background, the same flat-vector style.

### 3. For an illustrator (commissioning a parts kit)

> We're making a text-first crew-management game set in a fictional, Hong Kong-inspired cyberpunk city in 2057. Hundreds of characters are generated, so we need portraits as a **kit of vector parts** that code assembles and colours, in the style described in our art bible (ART.md, attached).
>
> **Style:** flat colour, hard light and shadow planes, no outlines, minimal line detail, like Citizen Sleeper. Straight-on, head and upper shoulders, one pose.
>
> **Format:** SVG, one part per file, on a shared 64×64 grid (head centred at x 32, eyes at y 29). Flat fills only, named by role so code can recolour them: `skin`, `skin-shadow`, `skin-mid`, `skin-lit`, `hair`, `hair-lit`, `brow`, `lip`, `shirt`, `shirt-lit`, `chrome`, `ink`. No gradients, filters or embedded raster.
>
> **Parts:**
> - 4–6 head shapes, each with its shadow, cheek and rim planes.
> - 12+ hairstyles, each with a back layer, top layer and highlight: crop, buzz, long, bob, bun, curls, locs, undercut, slick-back, fiber dreads, bald.
> - Eyes in 5 states: neutral, tired, stressed, dead stare, smirk.
> - Brows and mouths matching those states.
> - 3 noses, 2 ears.
> - Chrome: temple port, cyber-eye, 3 circuit routes, synthetic seam.
> - Markings: 4 geometric tattoos, barcode, 2 scars.
> - Injuries: plaster, gauze.
> - Glasses, visor, earring, stubble.
> - Facial hair: pencil moustache, goatee, long drooping moustache, soul patch, short beard.
> - Gear: 3 masks (respirator, jaw plate, LED grille), 3 conical hats (steel war hat, carbon with neon rim, woven straw), a half-chrome face plate.
> - Monk robes: grey crossed-collar, ochre kasaya over a brown robe, dark cyber robe; a mala of beads.
> - 5 shirt or jacket shapes.
>
> **Must:** work on every skin tone from very light to very deep; adult proportions (all characters are 18+); no "tribal" tattoo designs; readable at 48px.
>
> **Also wanted, separately:** finished portraits of 6 named characters (see "Named cast" in ART.md), and Joss, the crew's AI, drawn as a cracked handset.
