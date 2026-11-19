# Supplied writing, 2026-11-19, REVISED (owner's consolidated batch)

**Supersedes `supplied-2026-11-19.md`** (kept as history). Pasted as received. Proposed copy for owner review: nothing here is
applied to the game except the four small lines already in PR 213. Tracker: `drafts/writing-tasks.md`.
What changed from the first batch: the log copy now has explicit eligibility rules; Joss's summaries make fewer unsupported claims;
the heist jobs mix recovery, machinery, transport, negotiation and discreet access instead of repeating paperwork errands.

```
LANTERN BAY — CONSOLIDATED WRITING BATCH
Revised 2026-11-19

STATUS
- Proposed copy and content for owner review.
- Nothing in this batch has been applied to the game.
- WORLD.md remains the source of truth.
- No new named people, places, factions or technologies are introduced.
- Job outlines are not implementation-ready job files.
- Do not silently change mechanics to accommodate this writing.
- Flag any line whose required event, slot or mechanic is unsupported.

============================================================
1. SMALL LOOSE ENDS
============================================================

B2: SINGLE-PIECE OFFER SUBJECT

Keep:
{op} could pick up the {piece}


B2: CREW-SHEET PERMANENT-CHOICE HELPER

One move and one payload per runner. Once learned, neither can be replaced.

Implementation:
- Use only if both choices remain permanent under the current rules.
- This replaces the separate helper on the crew sheet.
- Do not reopen the already-applied inbox helper unless consistency requires it.


OTHER TONGS: LOOKING.near

Looking for runners much like their own.

Meaning:
- Recruits within 5 of the tong's own average.
- Not runners near their personal peak.
- If the exact calculation needs explaining, put it in a tooltip rather than this habit line.


SPARE-PIECE LOOT REPORT

Gear from the job: {name} ({type}), a spare for the cupboard.

Requirements:
- Keep the opening "Gear from the job".
- Keep {name} and {type}.
- Use only for the spare Standard sidearm fallback, not ordinary loot.


============================================================
2. MISSION-LOG ASSEMBLY SAFEGUARDS
============================================================

These are content-selection requirements, not new gameplay rules.

The crisis report remains the factual record.
Templates, atmosphere and Joss's summaries must not contradict it.

Do not select a line merely because its stat and phase match.

A line must also match:
- the site's actual features;
- the crew and equipment present;
- the action being attempted;
- the recorded outcome;
- any earlier event it refers to;
- the current time and weather, where relevant.

If the current log system cannot express a required condition:
- hold that line out of the random pool;
- do not invent a matching event;
- do not build a new mechanic without owner approval.

Slot compatibility:
- {place} must suit the action: a place someone can cross is not necessarily somewhere they can hide.
- {obstacle} must suit the action: a movable obstruction is not a locked gate or a moving gantry.
- {object} must suit the action: a catchable object is not a tarpaulin or a coil fixed to a bollard.
- {sound} must suit the action: a brief masking noise is not a continuous engine hum.
- {watcher} must be a person who can plausibly notice or speak to the crew.
- {op2} must resolve to another runner actually present.
- Do not create named or numbered enemies from these slots.

Faction overlays:
- Use only when the faction is actually part of the job.
- An overlay does not establish faction involvement by itself.
- A uniform, marking or briefing must support identifying someone as belonging to that faction.

Consequences:
- Minor-check failures may create the track change the engine records.
- They do not independently award Heat, injury, lost pay or other mechanical costs.
- A scrape, discomfort or fatigue in these lines is descriptive, not a new injury status.
- If the engine records a different consequence, use a different line.

Summary selection:
- Joss can summarise a recorded action.
- A stat result alone does not establish the action's details.
- Do not turn every failed tech roll into a lost connection.
- Do not turn every missing medic into an untreated wound.
- Use event-specific lines only when their events occurred.

Time and weather:
- Dawn, darkness, rain, fog and shift changes are conditions, not universal Docks scenery.
- Do not select a dawn line during a run that remains at night.
- Do not advance the job's clock through atmosphere alone.


============================================================
3. TASK 3 — UNIVERSAL ACTION TEMPLATES
============================================================

42 moments, each with a success and failure line.
Present tense follows Task 3's specific instruction.

Keep the existing output format below.
The eligibility notes following the templates are author-facing metadata.
Do not print those notes in the player's log.


COMBAT

combat | approach | time | success: {op} shoulders {obstacle} aside and clears the way. | failure: {op} shifts {obstacle} the wrong way and has to start again.
combat | position | alert | success: {op} catches {object} before it strikes the ground. | failure: {op} misses {object}; the impact draws a look from {watcher}.
combat | position | condition | success: {op} braces the load while {op2} finds a safer grip. | failure: {op} takes too much weight and has to set the load down.
combat | objective | time | success: {op} forces the fastening without damaging what it holds. | failure: {op} bends the fastening into a tighter jam.
combat | objective | condition | success: {op} controls the weight and lowers it without a jolt. | failure: {op} loses their grip and catches the weight awkwardly.
combat | exit | alert | success: {op} holds the loose panel still until everyone passes. | failure: {op} releases the panel too soon; it bangs against its frame.


STEALTH

stealth | approach | alert | success: {op} crosses {place} while {watcher} looks elsewhere. | failure: {op} crosses too early; {watcher} turns towards the movement.
stealth | approach | time | success: {op} finds an unwatched route without doubling back. | failure: {op} finds the route watched and leads the crew back.
stealth | position | alert | success: {op} settles out of sight before {watcher} turns. | failure: {op} leaves a moving shadow where {watcher} can see it.
stealth | objective | time | success: {op} reaches the fastening without disturbing the cover. | failure: {op} catches the cover and stops to settle it again.
stealth | exit | alert | success: {op} times the crossing beneath {sound}. | failure: {op} moves after {sound} stops; their footsteps carry.
stealth | exit | condition | success: {op} finds firm footing through the narrow gap. | failure: {op} squeezes through badly and scrapes a shoulder.


TECH

tech | approach | time | success: {op} reads the access panel and finds the working release. | failure: {op} follows a dead connection before finding the live one.
tech | position | alert | success: {op} loops the camera before the crew enters its view. | failure: {op} catches the camera late; it records a moment of movement.
tech | position | condition | success: {op} steadies the connection before the implant begins to stutter. | failure: {op} holds the connection too long and rubs their temples.
tech | objective | time | success: {op} bypasses the fault without restarting the whole system. | failure: {op} trips a restart and waits through the checks.
tech | objective | alert | success: {op} silences the panel before opening its casing. | failure: {op} opens the casing before muting its warning tone.
tech | exit | time | success: {op} releases the door before the crew reaches it. | failure: {op} loses the release and has to connect again.


SOCIAL

social | approach | alert | success: {op} gives {watcher} an ordinary reason for the crew to pass. | failure: {op} gives too much explanation; {watcher} asks another question.
social | approach | time | success: {op} gets clear directions without explaining the job. | failure: {op} accepts vague directions and has to ask again.
social | position | alert | success: {op} keeps {watcher} talking while the crew gets into place. | failure: {op} runs out of conversation before the crew is ready.
social | objective | time | success: {op} settles the objection before it becomes an argument. | failure: {op} pushes the point and gets the whole objection repeated.
social | objective | condition | success: {op} persuades {watcher} to let the crew set the load down. | failure: {op} cannot win a pause; the crew keeps holding the weight.
social | exit | alert | success: {op} gives {watcher} a routine explanation for the departure. | failure: {op}'s explanation leaves {watcher} watching the crew leave.


DRIVING

driving | approach | time | success: {op} judges the turn and brings the vehicle through without reversing. | failure: {op} takes the turn wide and has to back out.
driving | approach | alert | success: {op} eases past {watcher} without revving the engine. | failure: {op} catches the throttle; {watcher} looks towards the engine.
driving | position | condition | success: {op} brings the vehicle level with the load, sparing the crew a lift. | failure: {op} stops short; the crew hauls the load the remaining distance.
driving | objective | time | success: {op} lines up the vehicle for a straight transfer. | failure: {op} misjudges the angle and has to reposition.
driving | exit | alert | success: {op} pulls away smoothly without spinning a wheel. | failure: {op} pulls away too sharply; a wheel squeals.
driving | exit | condition | success: {op} takes the uneven stretch slowly enough to spare the passengers. | failure: {op} hits the uneven stretch hard; the crew knocks against the seats.


MEDICAL

medical | approach | condition | success: {op} adjusts a rubbing strap before it breaks the skin. | failure: {op} misses the pressure point; the strap keeps rubbing.
medical | position | time | success: {op} recognises the implant tremor and settles it without unpacking the bag. | failure: {op} checks the wrong cause before recognising the implant tremor.
medical | position | condition | success: {op} eases {op2}'s cramped hand before the next lift. | failure: {op} works the cramped hand too quickly; it stays stiff.
medical | objective | alert | success: {op} settles {op2}'s coughing before it carries beyond the cover. | failure: {op} reaches the water too late; {op2}'s cough carries.
medical | exit | condition | success: {op} cleans the scrape before grit works beneath the dressing. | failure: {op} leaves grit under the dressing and has to clean it again.
medical | exit | time | success: {op} checks {op2}'s balance and confirms they can keep moving. | failure: {op} needs a longer check before {op2} can move safely.


COOL

cool | approach | alert | success: {op} keeps an ordinary pace when {watcher} looks over. | failure: {op} stops too suddenly when {watcher} looks over.
cool | position | time | success: {op} waits for the right opening and moves without hesitation. | failure: {op} hesitates through the opening and waits for another.
cool | position | condition | success: {op} slows their breathing until their hands settle. | failure: {op} grips harder as their hands begin to shake.
cool | objective | alert | success: {op} keeps working when {sound} breaks their concentration. | failure: {op} startles at {sound} and knocks the casing.
cool | objective | time | success: {op} checks the sequence once and commits to it. | failure: {op} checks the sequence again after losing their place.
cool | exit | condition | success: {op} keeps the crew moving at a pace everyone can hold. | failure: {op} pushes the pace until the crew needs a breather.


ELIGIBILITY NOTES
Number each stat's six templates in the order above.

combat 1: a physically movable obstruction.
combat 2: a small falling object and a watcher within sight or hearing.
combat 3: a shared heavy load and a second runner.
combat 4: a fastening that can plausibly be forced.
combat 5: a heavy object being lowered.
combat 6: a loose panel beside the exit route.

stealth 1: a traversable place and a watcher with a changing sightline.
stealth 2: alternative routes and an actual source of observation.
stealth 3: usable concealment, directional light and a watcher.
stealth 4: a fastening beneath or behind a physical cover.
stealth 5: a brief sound that can mask footsteps and then stop.
stealth 6: a narrow traversable gap with firm footing available.

tech 1: an electronic access panel.
tech 2: a networked camera the runner can access.
tech 3: an implant-mediated connection and neural-load context.
tech 4: a system fault that can be bypassed or restarted.
tech 5: an electronic casing with an audible warning.
tech 6: a remotely operable door on the exit route.

social 1: a watcher who can be approached without contradicting the job.
social 2: someone available to give directions.
social 3: a watcher who can be distracted through conversation.
social 4: an actual objection from another person.
social 5: a carried load and someone controlling whether the crew may pause.
social 6: a departure observed by someone the runner can address.

driving 1: a ground vehicle and a constrained turn.
driving 2: an engine-powered vehicle passing a watcher.
driving 3: a ground vehicle and cargo being loaded or unloaded.
driving 4: a vehicle involved in a physical transfer.
driving 5: a wheeled ground vehicle on a surface where tyres can squeal.
driving 6: a passenger-carrying ground vehicle and uneven terrain.

medical 1: worn equipment with a rubbing strap.
medical 2: an actual implant tremor; do not invent symptoms from the stat roll.
medical 3: a second runner with a cramped hand and a later lift.
medical 4: a coughing second runner, available water and a need for quiet.
medical 5: an existing minor scrape, dressing supplies and contamination risk.
medical 6: a second runner whose balance genuinely needs checking.

cool 1: a watcher observing the crew.
cool 2: an actual timed opening.
cool 3: a task involving grip or fine hand control.
cool 4: a startling sound and a physical casing within reach.
cool 5: a task with a sequence to follow.
cool 6: a sustained physical journey where pace affects fatigue.


============================================================
4. TASK 4 — THE DOCKS VOCABULARY PACK
============================================================

126 entries.
Entries are not universally interchangeable.
Use the selection safeguards above.


PLACES

place | the shadow beneath a gantry crane
place | the wet approach to Pier 12 Gantry Gate
place | the gap between two container stacks
place | the lee of a diesel generator
place | the floodlit edge of the loading yard
place | the narrow strip beside a mooring bollard
place | the shelter beneath a container office
place | the salt-streaked side of a freight shed
place | the puddled lane between parked trailers
place | the steel steps above the loading apron
place | the harbour side of a chain-link fence
place | the dark end of a working pier


OBSTACLES

obstacle | a chained service gate
obstacle | a fallen stack of empty pallets
obstacle | a freight trolley wedged across the passage
obstacle | a bent section of temporary fencing
obstacle | a trailer parked across the loading lane
obstacle | a cable reel blocking the doorway
obstacle | a shutter stuck above knee height
obstacle | a mooring line stretched across the deck
obstacle | a locked container latch
obstacle | a loose steel panel across the gap
obstacle | a handcart caught in a drain grille
obstacle | a cargo strap pulled tight across the load


SOUNDS

sound | a gantry wheel screeching overhead
sound | a diesel engine coughing into life
sound | a container settling onto steel
sound | a reversing truck's warning tone
sound | water slapping against the pier piles
sound | a loose chain striking a bollard
sound | rain drumming on a container roof
sound | a crane operator's radio crackling
sound | a ferry horn beyond the breakwater
sound | a shutter rattling in the harbour wind


OBJECTS

object | a loose cargo strap
object | an empty steel flask
object | a coil of wet rope
object | a dented tool tin
object | a folded loading sheet
object | a plastic crate of work gloves
object | a wooden wheel chock
object | a roll of sealing tape
object | a salt-stiff tarpaulin
object | a hand torch with a taped grip


WATCHERS

watcher | a night-shift forklift driver
watcher | a crane operator taking a break
watcher | a freight clerk sheltering from the rain
watcher | a mechanic beside an open engine cover
watcher | a boat hand sorting mooring lines
watcher | a loader drinking tea from a flask
watcher | a dispatch worker checking a handset
watcher | a pier worker waiting for the next load


PHASE ATMOSPHERE

phase | approach | The crew follows tyre tracks through puddles bright with amber light.
phase | approach | The crew reaches the yard as the first shift crosses towards the cranes.
phase | approach | The crew keeps beneath the awnings while rain runs from the container roofs.
phase | approach | The crew passes a cold incense tin beside the loading gate.
phase | approach | The crew hears the harbour before the fog lets them see it.

phase | position | The crew waits beneath steel that keeps shedding last night's rain.
phase | position | The crew watches floodlight beams fade into the harbour fog.
phase | position | The crew settles beside a generator warm enough to dry one sleeve.
phase | position | The crew waits while the sky pales behind the crane booms.
phase | position | The crew stands clear as a mooring line tightens across the deck.

phase | objective | The crew works beneath a crane's slow sweep across the yard.
phase | objective | The crew wipes saltwater from the fastening before trying it.
phase | objective | The crew keeps the load above the water collecting on the deck.
phase | objective | The crew works through the change from floodlights to grey morning.
phase | objective | The crew pauses while a passing truck shakes the loose steel underfoot.

phase | exit | The crew leaves wet footprints that the rain quickly fills.
phase | exit | The crew passes incoming loaders with breakfast bags tucked beneath their coats.
phase | exit | The crew reaches the pier as the harbour lights begin to fade.
phase | exit | The crew keeps the cargo covered against spray from the water.
phase | exit | The crew leaves the cranes working behind them.


TRACK LINES

track | alert | rising | A worker looks up from a handset and keeps looking.
track | alert | rising | A torch beam pauses at the end of the row.
track | alert | rising | A nearby radio repeats a description matching the crew.
track | alert | high | Two workers leave their posts to check the passage.
track | alert | high | A floodlight turns towards the gap the crew used.
track | alert | high | Someone at the gate starts describing the crew over a radio.

track | time | rising | Another loading slot passes while the crew is still waiting.
track | time | rising | The next shift begins arriving at the gate.
track | time | rising | A truck queues behind the space the crew needs.
track | time | high | The loading lane is filling before the crew has cleared it.
track | time | high | Workers begin closing the access the crew planned to use.
track | time | high | The agreed window is nearly gone, and the load has not moved.

track | condition | rising | Wet gloves begin slipping on the load.
track | condition | rising | The crew changes hands more often on the heavier pieces.
track | condition | rising | Saltwater finds the scrapes beneath the crew's sleeves.
track | condition | high | The crew stops talking to save breath for the work.
track | condition | high | Each lift takes longer to set down safely.
track | condition | high | Cold hands struggle with the fastenings.

Track-line safeguards:
- Alert lines describe visible or audible attention, not hidden enemy knowledge.
- Radio lines require a radio the crew can hear.
- "The gap the crew used" requires that earlier route.
- Loading-slot and cargo lines require a loading job.
- Shift-change lines require the correct time.
- Scrape lines require an existing scrape.
- Cold and wet lines require matching conditions.
- A high track does not by itself establish every event described here.


CALLBACKS

callback | The crew remembers {earlier} at {time}.
callback | {earlier} at {time} is still fresh in the crew's minds.
callback | The crew has not forgotten {earlier} at {time}.
callback | There is a quiet mention of {earlier} at {time}.
callback | The crew exchanges a look at the mention of {earlier} at {time}.
callback | Someone brings up {earlier} at {time}.

Callback safeguards:
- {earlier} is a short noun phrase, such as "the dropped strap".
- Do not supply a full sentence.
- These lines do not imply a new mechanical consequence.
- Do not claim a repeated location, repeated obstacle or causal connection unless recorded.
- These are neutral fallback callbacks; use a more specific authored callback when the event supports one.


AETHER-HARBOUR LOGISTICS OVERLAY

Aether-Harbour Logistics | obstacle | an AHL service gate with a live access panel
Aether-Harbour Logistics | obstacle | an automated gantry crossing the loading lane
Aether-Harbour Logistics | obstacle | a sealed freight cage awaiting a collection reference
Aether-Harbour Logistics | obstacle | a parked container mover blocking the service door
Aether-Harbour Logistics | watcher | an AHL dispatch clerk checking collection references
Aether-Harbour Logistics | watcher | a yard supervisor beneath an AHL rain hood
Aether-Harbour Logistics | watcher | a maintenance worker watching the gantry controls
Aether-Harbour Logistics | phase | An AHL display advances the loading queue without moving the waiting trucks.
Aether-Harbour Logistics | phase | The gantry stops while an AHL worker checks the space beneath it.
Aether-Harbour Logistics | phase | A clerk compares the collection reference with the number on the freight.


RED LANTERNS OVERLAY

Red Lanterns | obstacle | a toll barrier across the freight road
Red Lanterns | obstacle | a truck held beside the toll desk
Red Lanterns | obstacle | a chained side gate beside Warehouse 7
Red Lanterns | obstacle | a handcart parked across the toll lane
Red Lanterns | watcher | a Red Lantern toll collector counting folded notes
Red Lanterns | watcher | an enforcer sheltering beside the freight barrier
Red Lanterns | watcher | a collector checking a driver's toll receipt
Red Lanterns | phase | A collector sets fresh incense beside the toll desk.
Red Lanterns | phase | The freight queue moves after a driver passes cash through the window.
Red Lanterns | phase | An enforcer watches the crew pass without leaving the shelter of Warehouse 7.


WET SLEEVE OVERLAY

Wet Sleeve | obstacle | a police barrier across the pier approach
Wet Sleeve | obstacle | a patrol van blocking the loading lane
Wet Sleeve | obstacle | a temporary inspection desk beside the gate
Wet Sleeve | obstacle | a cutter blocking the landing approach
Wet Sleeve | watcher | a Wet Sleeve officer checking implant registrations
Wet Sleeve | watcher | a cutter crew member holding a searchlight
Wet Sleeve | watcher | an officer counting cash behind an open van door
Wet Sleeve | phase | A Wet Sleeve cutter passes with its searchlight moving along the pilings.
Wet Sleeve | phase | An officer asks a waiting driver to step away from the queue.
Wet Sleeve | phase | A patrol radio crackles while an officer checks the crew's papers.


============================================================
5. TASK 5 — JOSS'S REPORT FRAMING
============================================================

58 lines.

Joss says "we" as a partner.
That does not mean Joss physically attended the job.

These lines summarise recorded events.
They do not create them.


INTRODUCTIONS

intro | clean | We got what we came for and brought everyone home.
intro | clean | We finished the work without giving ourselves another problem.
intro | clean | We kept this one tidy from the first door to the last.
intro | clean | We have the payment and no difficult calls to make.

intro | messy | We finished the job, though the way back was less tidy.
intro | messy | We got it done and brought a few problems home.
intro | messy | We earned the payment; the report explains the rest.
intro | messy | We made it work after the clean version stopped being available.

intro | aborted | We came home without finishing, which was still a decision worth making.
intro | aborted | We left the job before it took more than we agreed.
intro | aborted | We did not finish this one; we still have our people.
intro | aborted | We called it off when the route stopped making sense.

intro | hurt | We have someone badly hurt; the rest can wait until they are settled.
intro | hurt | We brought everyone home; now we look after the hurt.
intro | hurt | We need a quiet room and a proper look at what happened.
intro | hurt | We paid for this one in more than time.


TURNING POINTS

combat | turning | {op} forced the obstruction clear when the job needed it.
combat | turning | {op} held the weight long enough for the crew to move.

stealth | turning | {op} found an unwatched way through.
stealth | turning | {op} crossed unseen and opened the route for the crew.

tech | turning | {op} got the system answering when we needed it.
tech | turning | {op} bypassed the fault that had stopped the work.

social | turning | {op} gave them a reason to let the crew through.
social | turning | {op} settled the argument before it became everyone's business.

driving | turning | {op} put the vehicle where the crew needed it.
driving | turning | {op} found room to turn when going forward stopped being an option.

medical | turning | {op} got our runner steady enough to move again.
medical | turning | {op} recognised the symptoms before they got worse.

cool | turning | {op} kept working when the pressure nearly broke our timing.
cool | turning | {op} held their nerve until the opening came.


STANDOUTS

combat | standout | {op} handled the weight without losing control of it.
combat | standout | {op} put their strength where the crew needed it.

stealth | standout | {op} kept out of sight through the crossing.
stealth | standout | {op} noticed where the attention was and worked around it.

tech | standout | {op} made the machinery useful instead of merely getting past it.
tech | standout | {op} found the working connection among the ones pretending to work.

social | standout | {op} listened long enough to find the answer we needed.
social | standout | {op} kept the conversation ordinary while the job was anything but.

driving | standout | {op} handled the tight parts without throwing the passengers around.
driving | standout | {op} kept the vehicle moving and the load where it belonged.

medical | standout | {op} noticed the trouble before anyone had to ask for help.
medical | standout | {op} dealt with the symptoms before they forced a stop.

cool | standout | {op} kept their hands steady when the job stopped being predictable.
cool | standout | {op} kept their timing when the pressure rose.


WHAT HURT US: FAILED ROLLS

combat | hurt-fail | {op} lost control of the weight, and putting it right cost us time.
stealth | hurt-fail | {op} moved before the attention passed, and we had to work around it.
tech | hurt-fail | {op} lost the connection, and getting it back cost us time.
social | hurt-fail | {op} pushed the explanation too far and gave them more to question.
driving | hurt-fail | {op} misjudged the space, and getting clear cost us time.
medical | hurt-fail | {op} needed longer to identify the symptoms, so we had to wait.
cool | hurt-fail | {op} hesitated at the opening, and we lost the timing.


WHAT HURT US: CAPABILITY GAPS

combat | hurt-gap | We lacked the strength for the clean lift and took the slower way.
stealth | hurt-gap | We lacked the quiet approach that route needed and spent longer finding another.
tech | hurt-gap | We could not bypass the system with this crew, so we worked around it.
social | hurt-gap | We could not settle the objection quickly, and the argument cost us time.
driving | hurt-gap | We lacked the handling that manoeuvre needed, so we took a wider route.
medical | hurt-gap | We could not settle the symptoms with this crew, so we stopped.
cool | hurt-gap | We lacked the composure to use the opening before it closed.


SUMMARY SELECTION SAFEGUARDS

Introductions:
- "Everyone home" requires every deployed runner to have returned.
- Payment lines require payment actually received.
- "First door to the last" requires a job with doors.
- Aborted lines must match the actual reason for leaving.
- Hurt lines require the corresponding injury outcome.
- Do not use "we still have our people" if someone is missing or left behind.

Turning points and standouts:
- Match the recorded action, not just the stat.
- A successful medical check does not always establish that a runner was unable to move.
- A successful driving check does not always involve passengers or cargo.
- Do not imply a worse outcome was certain without the runner's intervention.

Failed rolls:
- These seven lines describe particular failures and their recorded costs.
- Do not use them as generic fallback text for every failed roll of that stat.

Capability gaps:
- "Lacked" means insufficient capability for this task, not necessarily no runner of that role.
- Do not call a capability gap merely because the crew has no matching role.
- Use only when the recorded alternative and cost match the line.
- If no suitable line exists, omit the summary rather than inventing an event.
```


## 6. Task 12: Seventy-One Floors, revised six-job outline set

These replace the earlier six outlines. Caper outlines, not full job files: they still need the exact new-job template,
difficulty bands, choice outcomes and report lines.

**Shared proposed metadata:** `heistOnly: 'szetoTower'`; `days: 1`; `crewSize: 3`; `threat: 3`; three key stats per job; no heist
effect awarded inside the job; no new gang involvement or grudge by default; no death without the explicit "push on"; every crisis
needs an exit; all participants adults.

**Shared canon limits:** Szeto briefs through `{szeto}`; the penthouse associate stays unnamed; no Lo, fire conspiracy or Pearl Haven
ownership revelation; Poon can arrange a loading slot, not unrestricted tower access; Edith's client having a document does not prove
a right to release it; Kwok's technical help does not grant company-wide authorisation; the crew only learns what it sees, hears or verifies.

**Service-identity reward: required fiction check (owner to confirm against the finale before adopting).** The prep secures a
registered service visit for the finale's lift route. A runner is enrolled as the attending worker, with the rest of the crew recorded
as accompanying workers for that visit. The lift route accepts the registered service party instead of sending it through the separate
facial-scan checkpoint represented by the finale's `facial_scan` crisis. This does NOT: disable facial recognition throughout the building;
give one runner's face to the whole crew; grant unrestricted access; open the vault; remove later checks or obstacles. If the finale cannot
represent a registered service party, flag the mismatch for an owner decision; do not silently change the reward or claim one face
authorises everyone.

### A1: Expected Upstairs
Step `face`, first ask · Glass Heights · social, tech, cool · ¥5,200
- **Brief:** "The lift expects a service visit. Arrange for it to expect us."
- **Pitch:** A legitimate maintenance visit can carry a small service party up the tower, but the contractor needs its diagnostic case recovered before it will confirm the booking. The case was collected by mistake with returned equipment and is now inside a loading cage scheduled to leave. Poon can provide a loading slot; he cannot explain the crew into every room beyond it.
- **1. The cage is moving:** the crew reaches the loading area as the returned equipment is prepared for dispatch. Approaches: talk the dispatch worker into holding the cage; identify and release the correct cage through its access panel; reach the case unnoticed while the load is checked. *Exit:* let the shipment go rather than interfere with moving machinery.
- **2. The case has been opened:** the case is present but its contents are mixed with another return. Approaches: identify the equipment from its diagnostic markings; get the workers who handled the return to reconstruct it; keep the collection calm while the crew checks each item. *Exit:* return with the incomplete case and report exactly what is missing.
- **3. The visit must match:** the contractor confirms the service party only if the returned kit, attending worker and booking agree. Approaches: resolve the booking discrepancy directly; correct the equipment record using the verified case contents; handle the live confirmation without contradicting the agreed cover. *Exit:* decline a registration the crew cannot support.
- **Human detail:** Poon has left his meal beside the handset. He asks the crew not to make this the reason the night shift loses its loading slots.
- **Clean result:** The contractor confirms the registered service party for the agreed visit and lift route.

### A2: The Replacement Visit
Step `face`, retry · Glass Heights · social, stealth, tech · ¥5,700
- **Brief:** "The first arrangement is no longer useful. Find another way onto the list."
- **Pitch:** A different contractor can register a replacement service party, but the worker responsible for the booking has walked off a disputed installation and left the job materials behind. Recover the materials and persuade the worker to complete a proper handover. A different contractor and route from A1; it does not require A1 to have reached any particular crisis.
- **1. The empty work area:** the installation space is being cleared, the contractor's materials mixed among items marked for disposal. Approaches: slip into the cleared area and locate the booking materials; use the equipment records to distinguish the contractor's property; persuade the clearance supervisor to pause the removal. *Exit:* leave the disputed materials rather than take unrelated property.
- **2. The worker will not sign:** at the Late Counter the adult worker refuses to confirm a visit that could leave them responsible for unfinished work. Approaches: agree a handover that records the unfinished work honestly; verify which faults belong to the visit and which do not; obtain the missing evidence from the installation without attracting the wrong attention. *Exit:* accept the refusal rather than forge the worker's consent.
- **3. The replacement check:** the tower calls back to verify the replacement party while the contractor still disputes the original cancellation. Approaches: keep the explanation consistent with the documented handover; resolve the conflicting booking entries; deliver the supporting record through the permitted service route. *Exit:* withdraw the replacement request before the crew commits to a false record.
- **Human detail:** The worker has kept every message about the unpaid visit. Their tea has gone cold while they scroll back to the first one.
- **Clean result:** The replacement service party is registered for the agreed visit and lift route.

### B1: Someone at the Controls
Step `power`, first ask · Glass Heights · tech, combat, cool · ¥5,400
- **Brief:** "A supply change must not close the route. Find someone who can keep it open."
- **Pitch:** A maintenance worker can cover the backup-power controls during the required window, but first needs help completing a plant-room repair the contractor has left short-handed. The crew is not being hired to become electricians; its job is to make the repair possible while the worker handles the specialist work.
- **1. The blocked approach:** a stalled equipment trolley blocks the safe working route into the plant room. Approaches: shift the load under the worker's direction; restore the trolley's powered release; time the move around the plant's operating cycle. *Exit:* stop rather than move the load through an unsafe route.
- **2. The labels disagree:** the maintenance sheet and the live panel identify the same connection differently. Approaches: trace the connection and verify the correct panel; hold the work steady while the worker checks it; keep the shutdown sequence controlled while the discrepancy is resolved. *Exit:* leave the disputed connection untouched.
- **3. The restart:** the repaired equipment must come back without interrupting neighbouring service systems. Approaches: monitor the restart through the maintenance interface; keep the physical release clear while the worker operates it; follow the sequence without rushing the final checks. *Exit:* leave the system safely stopped and report the incomplete repair.
- **Human detail:** The worker has written the correct panel number on tape. It is the third correction on the same strip.
- **Clean result:** The repair is complete. The worker agrees to attend the backup-power controls during the specified window, with the necessary authority and instructions.

### B2: Cover the Late Shift
Step `power`, retry · **the Docks** · driving, social, tech · ¥5,900
- **Brief:** "The controls still need attending. The person who can do it is across the water."
- **Pitch:** An alternative maintenance worker can provide the cover but is finishing a disputed equipment collection at the Docks. Recover the correct kit, resolve the handover and get the worker back to Glass Heights. Does not depend on B1's repair or worker.
- **1. The wrong pallet:** the kit is listed as collected, but the pallet at the loading point holds a different return. Approaches: trace the equipment identifiers through the collection record; get the loaders to reconstruct the mistaken handover; reposition the vehicle to inspect the held pallets safely. *Exit:* leave without the kit rather than accept an unverified substitute.
- **2. The collection is contested:** a dispatch supervisor releases the equipment only if someone accepts liability for damage already recorded against it. Approaches: establish when the damage was recorded; show which faults predate the collection; negotiate a witnessed release that preserves the dispute. *Exit:* refuse the liability and abandon the collection.
- **3. The crossing:** the planned vehicle crossing is disrupted, and the worker will not abandon the equipment needed for the cover. Approaches: find and drive a viable alternative route; arrange an authorised transfer through the freight queue; verify another transport option can safely carry the kit. *Exit:* miss the cover window rather than take an unsafe crossing.
- **Human detail:** The worker checks the kit before checking the time. They know which one they will be blamed for.
- **Clean result:** The alternative worker reaches the tower with verified equipment and agrees to cover the backup-power controls.

### C1: The Current Copy
Step `plans`, first ask · Glass Heights · social, stealth, cool · ¥5,300
- **Brief:** "The copy I have is old. Bring me the one people are working from."
- **Pitch:** Morrow & Venn's records can identify the latest renovation pack, but the working copy has been sent out with an estate inventory. Edith can establish what the firm is permitted to release; she will not pretend Szeto's instructions settle ownership. Reach the inventory before the documents are separated and packed away.
- **1. The release limit:** the request covers more material than Edith can authorise. Approaches: agree a narrower request for the relevant plans; identify the correct pack without exposing unrelated records; keep the discussion precise while the inventory deadline approaches. *Exit:* accept that the requested material cannot be released.
- **2. The room is being cleared:** the relevant document case is among possessions being inventoried. Approaches: find the case without disturbing the surrounding property; persuade the inventory staff to check it in the crew's presence; keep the collection orderly while competing claims are heard. *Exit:* leave the case under a witnessed hold.
- **3. The copy and the original:** the crew can obtain the relevant plans, but the case also holds private material outside the release. Approaches: secure an agreed copy of the permitted documents; separate the authorised material without disturbing the rest; resolve the handover before the room is sealed. *Exit:* return with the release record rather than take the whole case.
- **Human detail:** Edith asks the crew to leave the ordinary photographs in their original order.
- **Clean result:** The crew obtains the latest relevant renovation and service plans, with their revision status established.

### C2: What Was Installed
Step `plans`, retry · Glass Heights · tech, stealth, combat · ¥5,800
- **Brief:** "If the drawings are wrong, find out what was actually fitted."
- **Pitch:** Hang Yuen's installation records offer another route to the current service layout. Kwok can identify the right installation, but the final corrections remain with a returned equipment unit awaiting dismantling. Recover the record and verify it against the installed system before the unit is stripped.
- **1. Behind the demonstration:** the public showroom copy describes the sales configuration, not the version installed in the tower. Approaches: read the equipment's revision history; reach the returned unit through the permitted staff collection route; move the returned housing so its identifiers can be checked. *Exit:* leave with the unverified showroom drawing clearly marked as such.
- **2. The unit is coming apart:** a repair team has begun dismantling the returned equipment. Approaches: recover the stored installation notes before the relevant board is removed; reach the annotated service sheet among the separated parts; support the housing while the repairer retrieves the record safely. *Exit:* stop the recovery rather than damage the equipment or injure a worker.
- **3. The last difference:** one route on the corrected drawing does not match the installation notes. Approaches: compare the control record with the final revision; check the accessible service approach without entering restricted tenant space; open a heavy inspection cover under the maintenance worker's direction. *Exit:* return the discrepancy explicitly rather than call the plans verified.
- **Human detail:** Kwok recognises her handwriting beneath a stamp marked "superseded". The correction was right; the filing was not.
- **Clean result:** The crew returns with verified current plans, renovations and service routes.
- **Implementation:** any unresolved discrepancy must prevent a clean "verified plans" result. Do not award the full prep effect for an outcome that explicitly leaves the relevant route uncertain unless the owner chooses that rule.

## 7. Task 10: locked-district job outlines (revised)

Proposals within `WORLD.md`, not replacements for the unseen hooks in `drafts/district-hooks.md`; check that file before turning
these into full jobs. Each needs: the exact job schema; threat, pay, duration and crew size; complete crisis choices; success and failure
text; report lines; aborts and explicit push-on handling where relevant. No hourly tide simulation: the Silt's tide is authored scene context only.

### The Silt: Above the Waterline
Client: the Ferryman · driving, combat, tech
- **Brief:** "Filters for the Pump House. Keep them dry. They cost more than the boat."
- **Job:** Carry replacement filters from the Tide Steps to the Pump House as the mud roads give way to water routes.
- **Crises:** (1) the handcart route is already taking water; (2) a damaged wrapping exposes part of the load to spray; (3) a filter's coupling does not match the fitting the pump people expected.
- **Approaches:** handle a small cargo boat through the flooded route; move the load above the rising water without dropping it; check the coupling and identify whether the filter can be fitted safely.
- **Exit:** deliver the sound filters and return the doubtful one. Do not fit an unsafe part to manufacture a complete success.
- **Human centre:** the pump people care more about whether the filters work than whether the crew arrived impressively.
- **Canon safeguards:** the Ferryman remains aboard his boat; the pump people retain authority over the installation; no named children or children in the job; no mechanical tide clock.

### The Silt: Before the Survey
Client: Ruth Okonkwo · tech, stealth, social
- **Brief:** "A survey marker has moved. I want to know whether the ground did."
- **Job:** Compare an AHL survey's marked boundary with what the crew can physically observe.
- **Crises:** (1) residents want to know who commissioned the visit; (2) the recorded survey position does not match a visible marker; (3) a new fence blocks the last comparison point.
- **Approaches:** explain the visit without pretending to represent the residents; compare the survey data with fixed visible reference points; reach an observation point without damaging homes or equipment.
- **Exit:** return observations with an explicit uncertainty rather than manufacture a definite answer.
- **Human centre:** a resident points to where their doorstep stood before the last repair and asks which version the survey recognises.
- **Canon safeguards:** the crew does not settle ownership; a moved marker is not proof of a corporate conspiracy; Ruth's private motives remain unknown; the Silt stays unclaimed and contested, not secretly ruled by a new faction.

### The Amber Reach: Read It Back
Client: Madam Rao · social, tech, cool
- **Brief:** "Tariq reads every receipt aloud. Someone would prefer he stopped."
- **Job:** Recover the supporting record for a disputed remittance before an intermediary's deadline leaves Uncle Tariq carrying the loss.
- **Crises:** (1) the customer's receipt and the intermediary's record disagree; (2) transit security holds the courier carrying the supporting paperwork; (3) the intermediary offers a quick settlement that transfers liability to Tariq.
- **Approaches:** reconstruct the transaction from records the crew can legitimately inspect; resolve the courier's collection problem without claiming police authority; keep the dispute precise under pressure to accept the quick settlement.
- **Exit:** bring back a complete dispute record or witnessed refusal instead of accepting the bad settlement.
- **Human centre:** Tariq keeps the fan pointed at the waiting customers while explaining the problem for the fourth time.
- **Canon safeguards:** Rao's backing does not make her the booth's owner; Tariq is sharp and fair, not a helpless victim; the crew gains no access to unrelated customers' identities.

### The Amber Reach: The Last Connection
Client: Ruth Okonkwo · driving, social, cool
- **Brief:** "One passenger. No company check-in. Get them to the agreed connection."
- **Job:** Arrange discreet passage for an adult worker leaving an abusive corporate household, at Tita Mila's request through Ruth.
- **Crises:** (1) a service disruption breaks the planned connection; (2) the available pass admits the passenger to the wrong part of the interchange; (3) the passenger rejects an alternative that would put them back under corporate registration.
- **Approaches:** find a viable road connection without promising an impossible arrival; resolve the access problem through a route the passenger accepts; keep the departure calm when the original plan falls apart.
- **Exit:** take the passenger to an agreed safe waiting place and miss the connection rather than override their decision.
- **Human centre:** the passenger has packed work clothes and one ordinary thing they did not want to leave behind.
- **Canon safeguards:** the passenger is an adult with agency; do not make abuse graphic; the household and executive remain unnamed; the crew does not discover Ruth's own escape plans; the Quiet Room is not used for weapons or crew business.

### Iron Peak: Before the Last Car
Client: Mr. Szeto · social, stealth, cool
- **Brief:** "Collect the signed refusal. A refusal is still a document."
- **Job:** Retrieve a property decision from an estate office before the last public funicular. The office has agreed to release the document, but the staff member holding it is finishing an inventory elsewhere on the estate.
- **Crises:** (1) Szeto's gate-list entry does not cover the whole crew; (2) the document has not reached the agreed collection point; (3) the last funicular approaches while the office offers a verbal answer instead.
- **Approaches:** negotiate a limited, recorded collection arrangement; reach the authorised handover point without wandering into private rooms; hold the collection to its actual terms under time pressure.
- **Exit:** leave with a witnessed refusal to release the document, or arrange an authorised later departure if one is genuinely available.
- **Human centre:** the estate staff are also trying to finish before the last car; the crew's delay is becoming theirs.
- **Canon safeguards:** Szeto's name is not unrestricted access; private security cannot be bribed; no invented guaranteed after-hours escape route; Iron Peak is an estate district, not an operating foundry.

### Iron Peak: The Garden Inventory
Client: Ruth Okonkwo · tech, social, combat
- **Brief:** "A contractor left equipment on the Peak. Bring back what the inventory says is theirs."
- **Job:** Recover leased maintenance equipment near the Slag Garden after a contractor change.
- **Crises:** (1) the collection list and estate inventory describe the equipment differently; (2) a heavy item cannot be moved safely by the obvious route; (3) jointly contracted security stops the load for a final ownership check.
- **Approaches:** verify equipment identifiers and maintenance records; agree which items are undisputed; move the heavy equipment without damaging the landscaped site.
- **Exit:** recover the undisputed items and leave the contested piece under a signed record.
- **Human centre:** a maintenance worker knows which replacement parts came from the contractor and which were bought out of their own pocket.
- **Canon safeguards:** Foundry Stack 3 and the old slag are not salvage; the crew gains no control of estate infrastructure; security follows the joint contract, not a new faction; a contractor's claim is not proof of ownership.

## 8. Source-dependent writing still required (do not mark complete)

| Batch | Source | Needed / caution |
| --- | --- | --- |
| Four combat pieces | `PAYLOADS.incendiary`, `spotter`, `breacher`, `rout`; mechanics and offer slots | name, log word, desc, offer. Do not infer duration, stacking, targeting or effects from the names. (Source file and prompt: `drafts/writing/combat-pieces-source.md`.) |
| Enemy status wording | `view.status.*`; application, expiry, spreading rules | labels, tap-open explanations, last-round and "until it falls" endings, `view.status.jumps` |
| Status log variants | existing keys, slots, call sites | `burn`, `burnTick`, `burnOut`, `mark`, `expose`, `shake`; three variants each, slots kept |
| Director spotlights | current keys, triggers, slots | never imply an event the trigger does not establish |
| Live-view pace and stage marks | current draft strings and screen context | distinguish controls, headings, current events, forecasts, stage transitions |
| Special-move titles | current move definitions and titles | must not promise unsupported targeting, damage or secondary effects |
| Wave and approaching wording | current strings and arrival timing | keep distinct: approaching; due next round; entering now; already active |
| Other-tong habits | current habit definitions and draft strings | do not invent recruitment or behaviour rules |
| Anchor's Book | current draft strings and grade presentation | grades runners, never tongs; the elders' opinion, not objective truth; slate at the Anchor's teahouse in Old Town; first Monday of each month; wiped and chalked again next month; no permanent scoreboard implied |
| Container 409 authored beats | `drafts/writing/container409-source.md` | arrival, crate, handover, six lead-ins on the actual crisis ids; do not invent the sequence or Ferryman dialogue |
| Six remaining earned traits | `drafts/earned-traits-backlog.md`, implemented traits | check whether writing or only implementation is missing; duplicate names and effects; trigger support; fading rules |
| Full heist job files | `docs/new-job-prompt.md`, `theguestcopy.js`, current `szetoTower` and finale | use the revised outlines only after confirming the reward fiction |
| Full locked-district job files | `WRITING_GUIDE.md` new-job template, `drafts/district-hooks.md` | reconcile with the existing hooks before drafting |

## 9. Decisions and review, not fresh copy

- **Hit the caller:** recommendation only, not applied. Show the option only when a radio call is actually present; the player should not be offered an answer to a threat that is not shown.
- **Special actions:** reconcile the old "no specials exist" note with the current build system. Do not add a non-functional button; do not remove a working feature on an outdated tracker entry; do not assume build pieces and manually triggered specials are the same thing.
- **Armour descriptions:** `view.soak` is already supplied and applied. Check owner approval of the vest and skin-weave descriptions separately; do not reopen the approved soak line.
- **Battle-screen review:** still captures were checked at 360 and 390 wide; do not describe that as a device playthrough. Review current screens after any relevant wording or mechanics change.

## 10. Status after this revised batch

**Drafted for review:** single-piece offer subject retained; crew-sheet permanent-choice helper; `LOOKING.near`; spare-piece loot report; 42 universal action moments (84 lines) with eligibility notes; the complete Docks pack; time, weather, faction and event-selection safeguards; 58 Joss lines with selection safeguards; six revised Szeto prep-job outlines and the proposed service-party explanation; six locked-district outlines.

**Not complete:** source-dependent combat and rival wording; Container 409 beats; remaining earned-trait review; implementation-ready heist and locked-district jobs; code integration; runtime validation.

**Handoff:** (1) review the proposed copy; (2) check which selection conditions the existing log system supports; (3) hold unsupported lines out of random pools; (4) confirm the service-party explanation against the finale; (5) reconcile district-job proposals with the existing hooks; (6) supply the source-dependent blocks for the next wording pass; (7) apply approved writing and run the relevant tests; (8) record any actual canon or mechanics changes in `DESIGN.md`.
