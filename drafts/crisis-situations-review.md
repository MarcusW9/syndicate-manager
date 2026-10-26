# Crisis situations: review

Claude's draft (2026-10-26) of what kind of situation each crisis is. They're already in the
game data as `situations` (not yet used by anything the player sees). The owner skimmed it on
2026-10-26; say if anything else should change. Earned traits group 2 use them next.

## The list
- `escape`: Getting away under pressure: a pursuit, a lockdown, a cordon.
- `entry`: Getting into, or past, somewhere secured or guarded.
- `crowd`: Crowds, witnesses or bystanders who could turn it.
- `street-tech`: Cheap, salvaged, damaged or improvised hardware.
- `corp-tech`: Corporate or luxury systems: towers, labs, security.
- `fight`: A physical confrontation is on the table.
- `threat`: Someone threatens, squeezes or blocks the crew.
- `injury`: Someone badly hurt, or a medical emergency.
- `police`: Harbour Police or the Wet Sleeve.
- `law`: Any authority: police, customs officers, inspectors (every police crisis is law too).
- `neural`: Implants, neural load, work that pushes the brain.
- `weather`: Typhoon signals and gales.

## Settled with the owner (2026-10-26)
- **law**: added as the umbrella for any authority. Every `police` crisis is `law` too; customs
  officers (checkpoint_goods) and the Hoi-Sing meter inspector (meter_man) are `law` but not `police`
  (Rattled by Sirens stays about the Harbour Police).
- **Dogs count as a `fight`** (dock_dog, dog): Corner Fighter counts them.
- **The two "collector" crises** are now collector1 (The Favourite) and collector2 (Last Ticket).

## Still worth a second look
- **cutter** (a Wet Sleeve cutter drifting at the stack): `police` only, not `escape`: the crew
  hides or distracts, they don't run.
- **ot_seizure** (a man's neural port smoking in a crowd): `crowd`, `injury` and `neural`, all three.
- **beacon**, **tracked_crate**, **nm_tracker**: trackers called `street-tech`, not `corp-tech`.
- **client_panic** (the herbalist sees someone she knows): `crowd`, as a street with eyes on it.
- **gallery** (the owner's people "very curious about our horse"): `threat` and `escape`.
- **Untagged on purpose**: sampan, pit_boss, big_hand, shrine, cracked_vial, whistler, backwards,
  leak, catwalk, new_chrome, feed_bucket, forger, twist_bonus. None fits a trait cleanly.

## Shared crises (any job in a district, or any rookie job)
- **ot_seizure** `crowd` `injury` `neural`: A man drops in the alley outside a tea shop, shaking, his neural port smoking. A crowd closes in around him, and around …
- **ot_shrine** `threat`: Three Brass Anchor men step out of the incense smoke by the To Dei Gung shrine. They think you're the people measuring b…
- **ot_blackout** `street-tech`: Somebody's illegal grid splice blows in a basement. The whole block goes black: stairwells, streetlights, everything.
- **dk_drones** `corp-tech` `fight`: A crate seal splits and something inside starts to hum. Corporate security drones, packed in foam, are waking up one at …
- **dk_gale** `weather` `escape`: The Signal 3 goes up. The dock gates lock themselves for the gale, and Aether-Harbour security starts sweeping the yard.
- **dk_wet_sleeve** `police` `law` `threat` `neural`: Harbour Police at the gate: a "neural-load check". The Wet Sleeve unit wants to scan everyone's implants, and they want …
- **nm_tracker** `street-tech`: The cash card the client gave you for expenses is pinging. Someone has planted a Silver Fan tracker in your money.
- **nm_pulse** `neural` `street-tech` `crowd`: A data-broker feud spills into the street. Someone fires a pulse that fries every cheap implant on the block, and {tech}…
- **nm_clinic** `police` `law` `threat`: The fastest way through is a back-alley chrome clinic. On the table, under the lamp, a senior Harbour Police commander i…
- **gh_wiped** `corp-tech` `escape`: Your inside contact's badge stops working mid-job. They've just been fired and wiped from the directory, and you're fort…
- **gh_trial** `neural` `corp-tech` `crowd`: A neural-enhancement demo in the lobby goes wrong. The broadcast leaks into every implant nearby, and {tech} starts reci…
- **gh_skybridge** `escape` `corp-tech`: Lockdown. The sky-bridge doors seal at both ends with you in the middle, sixty floors over the city. The only other way …
- **old_classmate** `crowd`: Someone squints at {op}. "No way. Form Four, Miss Chan's class?" By tomorrow half of {district} could know what {op} doe…
- **faction_toll** `threat`: A {faction} runner falls into step beside {op}, all smiles. "New faces on our streets pay a little something. First time…
- **signal_three** `weather`: The sky opens. Typhoon Signal 3 goes up over {district}, shutters slam, and the street empties in a minute.

## Data Courier Run
- **tail** `escape`: The van is still on you. {driver} glances in the mirror: "Lose them or lead them in?"
- **contact_nervous** `threat`: The laundromat contact is sweating. He wants to "check the drive" in the back room.
- **checkpoint** `police` `law` `escape`: Police have thrown up a checkpoint on the flyover. They are scanning every car. {driver} has maybe ten seconds to decide…
- **typhoon** `weather`: The Signal 8 typhoon warning goes up mid-run. Rain comes sideways and the underpass ahead is already flooding.
- **beacon** `street-tech`: The drive starts pinging. Somebody built a tracker into it, and it just switched on.
- **shakedown** `threat`: At a red light, a man taps on the window. He knows the crew, knows the job, and wants a cut to keep quiet.

## Office Data Pull
- **guard_round** `entry`: A guard is early on his round. He is heading for the server room with {tech} still inside.
- **neural_spike** `neural` `corp-tech`: {tech} is pushing their implants to crack the last layer. A nosebleed starts.
- **lockdown** `escape` `corp-tech`: Building security locks the lifts. You are on the thirty-first floor and the stairwell doors are on a timer.
- **executive** `entry`: An executive working late walks onto the floor and stares at {face}. "You're not on the cleaning rota."
- **trace** `corp-tech` `neural`: Counter-intrusion software catches {tech}. A trace is crawling back up the connection towards {tech}'s implants.
- **fire_alarm** `crowd` `escape`: Someone on another floor pulls the fire alarm. Sprinklers start up and the stairwells fill with staff heading out.

## Warehouse Lift
- **guards_return** `fight` `threat` `escape`: Headlights. The rival crew is back early: four of them, armed. {muscle} is already reaching for a weapon.
- **forklift** `fight`: A night-shift forklift driver rounds the corner and stops dead. He has a radio on his belt.
- **dog** `fight`: The guard dog slips its chain and comes straight at the crew, barking loud enough to wake the whole dock.
- **tracked_crate** `street-tech`: One of the crates has a blinking light under the lid. Someone has put a tracker on the shipment.
- **toll** `threat` `fight` `escape`: Three cars block the dock road out. Red Lantern enforcers. This is their road, and they want a toll for using it.
- **sampan** _(none)_: Two crates are already on a sampan pulling away from the pier. The tide is going out fast.

## Kidnap Rescue
- **lookout** `entry` `fight`: A lookout is smoking in the alley by the back door. If he sees you, the hostage gets moved, or worse.
- **moving** `fight`: Footsteps on the stairs. The kidnappers are moving the hostage to a car, right now.
- **hostage_hurt** `injury` `escape`: The accountant has been beaten badly. He can barely stand, and the stairs are steep.
- **ransom_call** `threat`: The kidnappers' phone rings. It's their boss. If nobody answers, he'll send more people.
- **wrong_floor** `entry` `threat`: The floor plan was wrong. There's a mahjong game going in the next room: six men, and they're all armed.
- **police_sirens** `police` `law` `escape`: Sirens. Someone called the police about the noise. They'll be here in minutes, and the hostage is a witness.

## Casino Con
- **pit_boss** _(none)_: The pit boss is watching {face}'s hands closely. He signals for the dealer to change the shoe.
- **signal_lost** `corp-tech`: The casino's jammer kicks in. {tech}'s link to {face}'s earpiece drops to static.
- **recognised** `crowd`: A regular at the table squints at {face}. "Don't I know you? You were at the Macau tables last year."
- **back_room** `threat` `fight`: Security asks {face} to come to the back room "for a chat". Two of them, both big.
- **triad_owner** `threat`: The owner comes down to watch. He has a Red Lantern tattoo on his wrist. This is their room.
- **big_hand** _(none)_: One last hand. The whole stack on the table. {tech} says the signal is good, but not certain.

## Penthouse Heist
- **facial_scan** `entry` `corp-tech`: The service lift has a facial scanner nobody mentioned. It wants a registered face.
- **laser_grid** `entry` `corp-tech`: The study has a laser grid across the floor, invisible until {tech} sprays the air.
- **owner_home** `entry` `threat`: The front door opens. The executive is home early, with a bodyguard and a bottle of champagne.
- **vault_timer** `entry` `corp-tech` `neural`: The vault has a time lock. {tech} can force it, but it will push their brain to its limit.
- **drone** `corp-tech`: A security drone rises outside the window, lights sweeping across the glass.
- **lockdown_tower** `escape` `corp-tech`: Tower security locks down the lobby. The only way out is the roof, or the loading dock past two guards.

## Protection Run
- **tail_bikes** `escape` `threat`: Two motorbikes fall in behind the van. The riders aren't wearing helmets, and they're in no hurry to pass.
- **roadblock** `fight` `threat` `escape`: A cart full of cardboard has been pushed across the road. Men are waiting in the doorways either side.
- **toll_collector** `threat`: A polite young man in a suit flags the van down. "Red Lantern road. There's a fee."
- **client_panic** `crowd`: The herbalist sees someone she knows on the street and panics. She wants to get out of the van, now.
- **ambush** `fight` `escape`: A car pulls across the van at a junction. Doors open. This was planned.
- **checkpoint_goods** `law`: Customs officers are inspecting vans at the district border. Some of the dried goods are not exactly legal.

## Clinic Night
- **bleeder** `injury`: The door bangs open and a man half-falls down the stairs, a towel pressed to his ribs. {siu} doesn't look up from the ch…
- **collectors** `threat` `fight`: Two men with Silver Fan pins come down the stairs, polite as bankers. "Mr. Tam owes us money. We know he's here."
- **power_cut** `street-tech`: The bulb dies mid-stitch. Upstairs, someone swears at a Hoi-Sing meter. In the dark, the doc's voice is very calm: "Ligh…
- **screaming_implant** `neural` `street-tech` `injury`: A delivery rider clutches their ear: the implant is shrieking feedback only they can hear. {siu} slaps pliers into {op}'…
- **police_pair** `police` `law` `threat`: Two officers come down the stairs, in a pair as always in Old Town. One taps the humming generator with his baton. "Lice…

## Herbal Run
- **wet_steps** `street-tech`: Black algae coats the stone steps of Alley 4, and each crate weighs forty kilos.
- **silver_fan_arch** `threat`: Two Silver Fan runners in leather jackets lean against the archway, a long way from the Night Market and smoking like th…
- **cracked_vial** _(none)_: A vial cracks inside crate two, and a sharp, bitter mist starts hissing out through the joints.
- **ghost_tunnel** `neural` `street-tech`: A Ghost Circuit runner steps out of a drain mouth. "Tunnels go straight up the hill. Free, if one of you tries our new n…
- **shrine** _(none)_: At the Red Incense Shrine an old woman blocks the stair, holding out a stick of incense. "Nobody carries medicine past T…
- **cant_breathe** `injury`: {siu} meets you on the fourth landing, coat over her pyjamas. "Someone upstairs can't breathe. Open a crate. Now."

## Mahjong Ledger
- **gate** `entry` `street-tech`: Behind a rusted security gate you can hear Ah-Wah panicking: drawers slamming, a suitcase zip straining.
- **doorway** `entry`: A woman blocks the bedroom doorway, eyes red, swearing through tears that Ah-Wah left town yesterday.
- **short** `threat`: The ledger is in a black leather bag. The cash pouch with it is three hundred short.
- **bolt** `crowd` `fight`: Ah-Wah sees you on the stairs and bolts past, a cash box under his arm, down into the Glow Street crowd.
- **first_claim** `threat`: Two Silver Fan collectors are already on Ah-Wah's landing. "Ours first," one says. "Rao can have what's left."
- **hired_help** `fight` `threat`: Ah-Wah has spent some of Rao's money on help: a big man in a vest, cracking his knuckles on the landing.

## Container 409
- **cutter** `police` `law`: A Wet Sleeve cutter cuts its engine and drifts blind through the fog towards your stack.
- **groaning_stack** `street-tech`: The wind shifts off the bay. A stack of rusted containers above you groans and starts to creep.
- **dock_dog** `fight`: A feral dock dog, ribs showing through wet fur, snarls at the hum of your earpieces.
- **whistler** _(none)_: An Aether-Harbour night-shift forklift comes down your row, headlights on. The driver is whistling.
- **boxed_in** `escape`: A container truck has parked across the only road out. The driver is asleep in the cab.
- **backwards** _(none)_: On the boat, the Ferryman lights a clove cigarette and turns it to face backwards. Everyone on the waterfront knows what…

## Market Delivery
- **crush** `crowd`: A mahjong parlour lets out and the alley fills shoulder to shoulder. The crate is slipping.
- **meter_man** `threat` `law`: A Hoi-Sing meter inspector in a hi-vis jacket waves the trike down. "That battery charged off a stall? Show me the recei…
- **leak** _(none)_: The crate starts dripping. It isn't water: it smells of ozone and burnt sugar, and it hisses where it lands.
- **raincoat** `crowd`: A man in a raincoat has been three stalls behind you since the Neon Dragon. He stops when you stop.

## Eviction Notice
- **capacitor** `street-tech` `entry`: The relay box is shut with an army-surplus padlock, wired to a high-voltage capacitor.
- **live_mic** `crowd` `threat`: The old man bolts the shack door and grabs his microphone. "One more step and all of Old Town hears Szeto's name."
- **neighbours** `crowd` `threat`: Tenants gather on the landing below, some holding iron pipes. Nobody says anything. They just watch.

## Counterfeit Chrome
- **bone_drill** `fight` `threat`: Dr. Lim snatches a pneumatic bone drill off the rack. His hands are shaking so hard the bit rattles.
- **laser_rig** `street-tech`: The calibration rig is still running, its unshielded laser humming over the tray.
- **patient** `injury`: A man with a bandaged eye is still in the chair. He begs you not to take his new lens.

## Submerged Cable
- **catwalk** _(none)_: The maintenance catwalk is slick with weed, and the water underneath is pulling hard.
- **frayed_core** `street-tech`: The core is frayed in three places, and the salt is already eating into the copper.
- **sonar** `corp-tech`: An Aether-Harbour survey drone glides under the pier, its sonar pinging off the pylons.

## Data Scrub
- **ceiling_drone** `corp-tech` `entry`: A security drone glides along its ceiling track, sweeping a blue sensor across the terminal desk.
- **handprint** `corp-tech` `entry`: The terminal wants a biometric handprint before it will release the chip.
- **early_guard** `entry` `corp-tech`: A Veridian-Apex guard comes back early from his break, whistling, his footsteps loud on the glass floor.

## The Favourite
- **service_gate** `entry`: Racing Association security at the service gate is scanning every pass twice tonight. Yours are borrowed.
- **new_chrome** _(none)_: A young stable hand is showing off a brand-new wrist port and more cash than a month's wages.
- **old_hand** `threat`: A grey-haired stable hand steps out of Pepper's stall with a pitchfork. "Seven years I've brushed her. Nobody touches he…
- **feed_bucket** _(none)_: There's a smell in Pepper's feed bucket that isn't oats. Somebody has already been here.
- **vet** `corp-tech`: A vet in a Veridian-Apex lab coat arrives with a case. "Routine pre-race scan." Nobody booked one.
- **collector1** `threat` `fight`: Under the betting hall, a Silver Fan collector says he knows who paid the stable hands. Information costs.

## Last Ticket
- **eleven_seconds** `street-tech`: The hall's security footage skips exactly eleven seconds. Hoi-Sing's log calls it a routine fault.
- **sweepers** `corp-tech`: Cleaning drones are already vacuuming the hall's slips into a compactor. The ticket might be in there.
- **runner** `crowd`: A young runner in cleaner's gloves sees you coming and bolts up the terrace steps into the crowd.
- **forger** _(none)_: An Undercroft forger offers you "your ticket" for ¥2,000. It looks perfect. That's the problem.
- **collector2** `threat` `fight`: A Silver Fan collector has the ticket pinned to his board against a jockey's debt. "Possession is the whole law, down he…
- **window** `corp-tech`: At the payout window the clerk frowns. "Big ticket. I need the holder's biometrics." The holder is in Glass Heights.

## Wrong Horse
- **stall_nine** `entry` `threat`: Private security in Glass Galleries colours is standing on stall nine. The Association doesn't hire them.
- **chip** `corp-tech`: The registration chip under the horse's neck reads perfectly. Too perfectly: no wear on the log at all.
- **scar** `corp-tech`: Under the mane there's a neat surgical scar, three days old. Racing's one line: nothing tells a horse how to run.
- **apex_vet** `fight`: A Veridian-Apex vet arrives with a cold box for blood samples from stall nine. He is in a hurry.
- **real_horse** `entry`: An old stable hand pulls you aside. "The real one's in the old ice store under the Undercroft. She's not eating."
- **gallery** `threat` `escape`: The owner's people come down from the Glass Galleries. "You've been very curious about our horse."

## Twists (any job)
- **twist_more_guards** `fight` `entry`: There are twice as many guards as the client said. Somebody either didn't know or didn't want you to.
- **twist_double_cross** `threat` `fight`: At the handover, the client's people try to take everything without paying. Hands are already inside jackets.
- **twist_tipoff** `police` `law` `escape`: Unmarked cars at both ends of the street. Somebody tipped off the police about this job.
- **twist_rival_crew** `threat` `fight`: Another crew is here for the same job. Masks, guns, and they look as surprised as you are.
- **twist_bonus** _(none)_: Something the client didn't mention: a safe, an unlocked office, a second crate. Nobody would know if you took it.

