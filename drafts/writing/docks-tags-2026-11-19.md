# Docks pack: compatibility and condition tags (draft, 2026-11-19)

Tags for the 126 entries in `drafts/writing/supplied-2026-11-19-revised.md` section 4, so a template only draws an entry that suits it
(the revision's "slot compatibility" and "selection safeguards"). **Data only: nothing here is in the game.** The tags are proposals;
the entry text is not changed. Read with `log-audit-2026-11-19.md` (what the log can support) and the eligibility notes in section 3.

## How to read it

- A **slot entry** (place, obstacle, sound, object, watcher) gets tags that say what actions it suits. A template may draw an entry only if the entry has the tag that template needs (the pools at the end).
- A **phase, track or callback line** gets a **condition**: a fact about the run that must be true before it can be drawn. Facts the run does not record today are marked **HOLD** (do not draw yet).
- `site:` says which part of the Docks job site the entry needs. The Docks plot in `data/sites.js` draws only: container rows (stacks), a **crane** (label), a fence with a **gate** and a **quay/jetty** beside the **water**, a road with the **van**, pallets by the gate, a target building and door, and the perch. Everything else (generators, bollards, trailers, steps, a shed) is **scenery by text only**: it can be drawn into a line, but the map does not show it. "plot" = on the map today; "text" = prose only.

## Tag vocabulary

| Tag | Meaning |
| --- | --- |
| `cross` | someone can walk across it (stealth 1) |
| `hide` | someone can settle out of sight in it (no template uses it yet; kept for later) |
| `movable` | one runner can shift it by hand or shoulder (combat 1) |
| `fastening` | a fixture a runner could force or work at (combat 4, stealth 4) |
| `fixed` / `machine` / `vehicle` | not shifted by hand; a machine or vehicle also moves or is operated by someone |
| `brief` | a short noise that starts and stops: can cover footsteps (stealth 5) |
| `sudden` | an unexpected onset that can startle (cool 4) |
| `continuous` | a steady or repeating noise: never a masking noise, never a startle |
| `catchable` | small and light enough to catch, and loud when it lands (combat 2) |
| `talk` | can be spoken to by a runner (social 1, 3, 6) |
| `busy` | attention is held by something else: easy to slip past or to keep talking (stealth 1, social 3, cool 1) |
| `lane` | works near a vehicle lane or the van's route (driving 2) |
| `faction-owned` | belongs to a faction: never drawn without that faction in the job, never for force |

## Places (12)

| Entry | cross | hide | site |
| --- | --- | --- | --- |
| the shadow beneath a gantry crane | yes | yes | plot: crane |
| the wet approach to Pier 12 Gantry Gate | yes | no | plot: gate / quay (a named place: keep to the Docks) |
| the gap between two container stacks | yes | yes | plot: container rows |
| the lee of a diesel generator | no | yes | text only |
| the floodlit edge of the loading yard | yes | no | plot: yard / road |
| the narrow strip beside a mooring bollard | yes | no | text (water side) |
| the shelter beneath a container office | no | yes | plot: target building (nearest) |
| the salt-streaked side of a freight shed | yes | no | text only |
| the puddled lane between parked trailers | yes | yes | text only; needs trailers and wet ground (rain or after rain) |
| the steel steps above the loading apron | yes | no | text only; noisy to cross |
| the harbour side of a chain-link fence | yes | no | plot: fence and water |
| the dark end of a working pier | yes | yes | plot: quay / jetty; night |

Used by: stealth 1 ("crosses {place}") needs `cross`. A place with `cross: no` must never fill it.

## Obstacles (12) and the three faction obstacles

| Entry | Tag | Used by combat 1 ("shoulders aside")? |
| --- | --- | --- |
| a chained service gate | fixed | no |
| a fallen stack of empty pallets | movable | yes |
| a freight trolley wedged across the passage | movable | yes |
| a bent section of temporary fencing | movable | yes |
| a trailer parked across the loading lane | vehicle | no |
| a cable reel blocking the doorway | movable (heavy) | yes |
| a shutter stuck above knee height | fixed, forceable | no (a force-open line, not a shove) |
| a mooring line stretched across the deck | fixed (step over or lift) | no |
| a locked container latch | fastening | no (combat 4 / stealth 4's fastening) |
| a loose steel panel across the gap | movable (heavy) | yes |
| a handcart caught in a drain grille | movable | yes |
| a cargo strap pulled tight across the load | fastening | no |

Pool for combat 1: **6 entries**. Pool for the fastening templates (combat 4, stealth 4): latch, strap, shutter.
Overlay obstacles: none is `movable` except the Red Lanterns handcart across the toll lane, and moving a faction's cart is a confrontation:
tag it `faction-owned`; never draw it for a force template. The AHL gate, gantry, freight cage and container mover are `fixed` or `machine`;
the Red Lanterns barrier, held truck and chained gate are `fixed` or `vehicle`; the Wet Sleeve barrier, patrol van, inspection desk and cutter are
`fixed`, `vehicle` or `faction-owned`. A `machine` (the automated gantry) is **never** a thing to lift or shoulder.

## Sounds (10)

| Entry | brief | sudden | continuous | requires |
| --- | --- | --- | --- | --- |
| a gantry wheel screeching overhead | yes | yes | no | crane |
| a diesel engine coughing into life | no | yes | after the start | a diesel engine on site |
| a container settling onto steel | yes | yes | no | containers being moved |
| a reversing truck's warning tone | no | no | yes (while it reverses) | a truck |
| water slapping against the pier piles | no | no | yes | water side |
| a loose chain striking a bollard | yes | yes | no | a chain, wind or movement |
| rain drumming on a container roof | no | no | yes | rain |
| a crane operator's radio crackling | no | yes | no | a radio the crew can hear (also fits the radio track line) |
| a ferry horn beyond the breakwater | yes | no | no | water side |
| a shutter rattling in the harbour wind | no | no | yes | wind |

Pools: **stealth 5** ("times the crossing beneath {sound}", then it stops) needs `brief`: gantry wheel, container, chain, ferry horn (**4**).
**cool 4** ("startles at {sound}") needs `sudden`: gantry wheel, engine, container, chain, radio (**5**).

## Objects (10)

| Entry | catchable and loud when it lands |
| --- | --- |
| a loose cargo strap | no (lands quietly, so "the impact draws a look" is false) |
| an empty steel flask | yes |
| a coil of wet rope | no |
| a dented tool tin | yes |
| a folded loading sheet | no (silent) |
| a plastic crate of work gloves | yes |
| a wooden wheel chock | yes |
| a roll of sealing tape | no (quiet) |
| a salt-stiff tarpaulin | no |
| a hand torch with a taped grip | yes |

Pool for combat 2: **5 entries** (flask, tin, crate, chock, torch).

## Watchers (8): `talk` for all; extra tags

| Entry | busy | lane | requires |
| --- | --- | --- | --- |
| a night-shift forklift driver | no | yes | night; a forklift |
| a crane operator taking a break | yes | no | crane |
| a freight clerk sheltering from the rain | yes | no | rain |
| a mechanic beside an open engine cover | yes | yes | a vehicle being worked on |
| a boat hand sorting mooring lines | yes | no | water side |
| a loader drinking tea from a flask | yes | no | loading job |
| a dispatch worker checking a handset | yes | no | none |
| a pier worker waiting for the next load | no | no | loading job |

Pools: **driving 2** (passing a watcher in a vehicle) needs `lane`: forklift driver, mechanic (**2**; add the van-side watchers when the plot has them).
**social 3 / cool 1 / stealth 1 / stealth 3** need `busy` (or any watcher for cool 1). Overlay watchers (AHL clerk and supervisor,
Red Lantern collector and enforcer, Wet Sleeve officer) are people in uniform: draw only when that faction is in the job, and a watcher
that can **be talked to** (`talk`) may still be the wrong one to **shake**: the Wet Sleeve and enforcer watchers must not be used by `stealth` or `cool` lines as if ordinary workers.

## Phase atmosphere (20): conditions

`time:` night, dawn or any. **HOLD** = the run has no clock or weather, so the line cannot be drawn yet.

| Phase | Line (first words) | Condition |
| --- | --- | --- |
| approach | follows tyre tracks through puddles | wet ground (rain or after rain) and lit: **HOLD** (weather) |
| approach | reaches the yard as the first shift crosses | shift change, dawn: **HOLD** (clock) |
| approach | keeps beneath the awnings while rain runs | rain: **HOLD** |
| approach | passes a cold incense tin | none (any time): **usable now** |
| approach | hears the harbour before the fog | fog: **HOLD** |
| position | waits beneath steel shedding last night's rain | rain the night before: **HOLD** |
| position | floodlight beams fade into the fog | fog, night: **HOLD** |
| position | settles beside a generator | generator on site; cold: text only, **usable now** if the job names one |
| position | sky pales behind the crane booms | dawn, crane: **HOLD** |
| position | stands clear as a mooring line tightens | a vessel or a mooring: needs the water side |
| objective | works beneath a crane's slow sweep | crane active: **usable now** on the Docks plot |
| objective | wipes saltwater from the fastening | a fastening in the run; water side |
| objective | keeps the load above the water on the deck | a load; water on the deck (rain or spray): **HOLD** |
| objective | works through floodlights to grey morning | the clock actually passes dawn **during this phase**: **HOLD** (never advance the clock by atmosphere) |
| objective | pauses while a passing truck shakes the steel | a truck on the lane and loose steel on site |
| exit | leaves wet footprints that the rain fills | rain: **HOLD** |
| exit | passes incoming loaders with breakfast bags | morning shift: **HOLD** |
| exit | reaches the pier as the harbour lights fade | dawn, a pier: **HOLD** |
| exit | keeps the cargo covered against spray | carrying cargo; water side |
| exit | leaves the cranes working behind them | crane active: **usable now** |

Usable now with no new data: **4** (the incense tin, the crane's sweep, the cranes working, the generator if named).

## Track lines (18)

Only the `alert` track exists; `time` and `condition` lines have **no track** to cross: **HOLD all 12** until tracks exist (or run as colour only after the owner's call).

| Track and level | Line (first words) | Needs |
| --- | --- | --- |
| alert, rising | A worker looks up from a handset | a worker with a handset (any watcher) |
| alert, rising | A torch beam pauses at the end of the row | night; a row of stacks (plot) |
| alert, rising | A nearby radio repeats a description matching the crew | a radio the crew can hear **and** a recorded "seen" event (a failed patrol, camera or checkpoint roll): the line says the crew is described |
| alert, high | Two workers leave their posts | two or more workers on site |
| alert, high | A floodlight turns towards the gap the crew used | a recorded gap or route the crew used |
| alert, high | Someone at the gate describes the crew over a radio | a gate and a radio, and a recorded "seen" event |
| time, rising | Another loading slot passes while waiting | a loading job and the crew waiting: **HOLD** |
| time, rising | The next shift begins arriving | the shift-change time: **HOLD** |
| time, rising | A truck queues behind the space the crew needs | a van job and a lane |
| time, high | The loading lane fills before the crew has cleared it | a loading job: **HOLD** |
| time, high | Workers begin closing the access the crew planned to use | a recorded plan: **HOLD** |
| time, high | The agreed window is nearly gone and the load has not moved | a job with an agreed window and a load: **HOLD** |
| condition, rising | Wet gloves begin slipping | wet and a load: **HOLD** |
| condition, rising | The crew changes hands more often | a heavy load: **HOLD** |
| condition, rising | Saltwater finds the scrapes beneath the sleeves | water side and an existing scrape: **HOLD** |
| condition, high | The crew stops talking to save breath | heavy work: **HOLD** |
| condition, high | Each lift takes longer to set down safely | lifting: **HOLD** |
| condition, high | Cold hands struggle with the fastenings | cold and fastenings: **HOLD** |

Usable on `alert` with today's data: the **handset** line, the **torch** line (night), the **two workers** line. The other three alert lines need a recorded "seen" or a route.

## Callbacks (6)

All six are neutral and need only `{earlier}` and `{time}`, but neither exists in the run today:
- **`{time}`**: the run has no clock. Proposed: replace "at {time}" with the zone ("in the way in", "inside", "at the target", "on the way out"), which the run does record (`ZONES`). This is a small change to the six lines; a wording decision for the owner.
- **`{earlier}`**: needs a short noun phrase for each earlier event. Proposed labels from the incidents already in the log (outcome-neutral, so they work after a success or a failure): lock "the lock", camera "the camera", patrol "the patrol", guard "the guard", backup "the second guards", checkpoint "the checkpoint", staff "the staff on their break", sweep "the drone sweep", firewall "the firewall", safe "the last lock", hold "the room", mark "the contact".
- A callback may only be drawn when that event is recorded in this run. Never claim a repeated place or cause (the revision's rule).

## Faction overlays (30 lines)

Each of the three overlay sets is drawn **only when the faction is in the job**.
- The job's `against` field records a gang (today `silverFan` and `redLanterns`). So **Red Lanterns** can be keyed to `against: redLanterns`; **Wet Sleeve** (the police) and **Aether-Harbour Logistics** are not gangs: key them to a job's situations (`police` / `law`; `corp-tech`) or a new flag. Decide how before drawing any Wet Sleeve or AHL line.
- Never draw an overlay obstacle for a force template (see above). Never draw an overlay watcher for a stealth line unless the job puts that person on the site.
- The Wet Sleeve overlay lines about an officer checking papers and counting cash assume an officer is present; the revision's rule that a uniform must support the faction applies.

## Pools after tagging (what the templates actually get)

| Template | Slot | Eligible entries |
| --- | --- | --- |
| combat 1 | obstacle | 6 of 12 |
| combat 2 | object | 5 of 10 |
| stealth 1 | place | 10 of 12 with `cross` (the generator's lee and the office shelter are `hide`-only) |
| stealth 5 | sound | 4 of 10 |
| cool 4 | sound | 5 of 10 |
| driving 2 | watcher | 2 of 8 |
| social 1, 3, 6; stealth 1, 3; cool 1 | watcher | 6 to 8 of 8, depending on the tag (`busy`) |

The smallest pools (driving 2's two watchers, stealth 5's four sounds) will repeat quickly. Either add entries for them or let those templates
draw rarely.

## What this needs next

1. The owner confirms the tag vocabulary and the pools (especially the "not catchable" and "not movable" calls).
2. A small authoring pass on `data/sites.js`: give the Docks plot feature names the tags can match (crane, stacks, fence, gate, quay, water, pallets, van); today only a few are drawn.
3. The code step (separate, owner's call): carry these tags in a data file and read them in the template selector, once the minor-check hook exists.
