# Report lines, batch A

17 crises that need a plain `report` line for every choice. Source text, generated from the game data on 2026-10-26. Paste this whole file after the prompt for task 1 in `drafts/writing-tasks.md`.

### District crises: oldTown (any job there)

CRISIS ot_seizure: A man drops in the alley outside a tea shop, shaking, his neural port smoking. A crowd closes in around him, and around you.
- help (adapt, medical): {medic} kneels and talks him down
  - success: Cold cloth, steady voice, and his breathing slows. An old man in the crowd nods and shows you a shortcut through his kitchen.
  - failure: The fit gets worse. Someone calls an ambulance, and the police follow it. [injury: none, heat +1]
- push (push, cool): Push through the crowd
  - success: Elbows and apologies, and you're through. Somebody spits on the ground behind you.
  - failure: Someone shoves back. It gets ugly fast. [injury: light]
- abort (abort, cool): Abort: stay with him until help comes [costs anyway: loses 100% of pay, client trust -5]
  - success: The job is gone by the time the ambulance arrives. He grips your hand as they lift him in.

CRISIS ot_shrine: Three Brass Anchor men step out of the incense smoke by the To Dei Gung shrine. They think you're the people measuring buildings for a developer.
- talk (adapt, social): {face} explains, politely
  - success: "Not developers. Just working." They look you over, then step aside.
  - failure: They don't like the explanation. The shoving starts. [injury: light]
- incense (adapt, cool): Light incense at the shrine and bow
  - success: The oldest of them watches you bow three times, grunts, and lets you pass.
  - failure: The incense won't light. They take that as an answer. [injury: light]
- abort (abort, cool): Abort: back away and go home the long way [costs anyway: loses 100% of pay, client trust -5]
  - success: You leave the long way round. The job doesn't wait for you.

CRISIS ot_blackout: Somebody's illegal grid splice blows in a basement. The whole block goes black: stairwells, streetlights, everything.
- fix (adapt, tech): {tech} patches the splice
  - success: Sparks, a curse, and the lights flicker back on. Half the block cheers from the windows.
  - failure: The splice bites back, and Hoi-Sing's meters notice. [injury: light, heat +1]
- dark (push, stealth): Keep moving in the dark
  - success: Hands on the walls, counting steps. You come out the far side like you were never there.
  - failure: A missing stair. Somebody goes down hard. [injury: light]
- abort (abort, cool): Abort: sit tight and call it off [costs anyway: loses 100% of pay, client trust -5]
  - success: You wait out the blackout on a stairwell with the neighbours. The job is gone by the time the lights come back.

### District crises: docks (any job there)

CRISIS dk_drones: A crate seal splits and something inside starts to hum. Corporate security drones, packed in foam, are waking up one at a time.
- jam (adapt, tech): {tech} jams them before they lift
  - success: A handheld jammer, a held breath, and the humming dies.
  - failure: Two get airborne before the jammer bites. [injury: light, heat +1]
- smash (push, combat): {muscle} smashes them in the crate
  - success: A crowbar, six swings and a lot of broken plastic. Quiet again.
  - failure: One lifts off and fires its stun prongs. [injury: light, heat +1]
- abort (abort, cool): Abort: drop everything and run [costs anyway: loses 100% of pay, client trust -10]
  - success: You leave the crate humming on the dock and don't look back.

CRISIS dk_gale: The Signal 3 goes up. The dock gates lock themselves for the gale, and Aether-Harbour security starts sweeping the yard.
- fence (push, driving): {driver} finds a gap in the fence
  - success: Lights off, engine low, out through a gap the wind tore open.
  - failure: The fence rips along the side of the van and the alarm goes. [injury: light, heat +1]
- hide (adapt, stealth): Hide in an empty container until the sweep passes [costs anyway: loses 20% of pay]
  - success: Two hours in a steel box while the wind howls. The sweep goes past, and the client docks you for the delay.
  - failure: A torch beam swings into the container. [injury: light, heat +1]
- abort (abort, cool): Abort: walk up to the guard post with a story [costs anyway: loses 100% of pay, client trust -5]
  - success: Lost dockworkers, wrong gate, so sorry. They throw you out into the rain, empty-handed.

CRISIS dk_wet_sleeve: Harbour Police at the gate: a "neural-load check". The Wet Sleeve unit wants to scan everyone's implants, and they want to be paid for the trouble.
- pay (adapt, cool): Pay them [costs anyway: cash -400]
  - success: Cash folded into a newspaper. The scanner never gets switched on.
- talk (adapt, social): {face} talks your way through
  - success: A few names dropped and a joke about the commander. They wave you through, laughing.
  - failure: They scan everyone, slowly, and write down your names. [injury: none, heat +1]
- scan (push, cool): Let them scan and hope
  - success: The scanner beeps green for everyone. Nothing to fine.
  - failure: The scanner flags somebody's chrome. Out comes the fine book. [injury: none, cash -600]
- abort (abort, cool): Abort: turn round before the gate [costs anyway: loses 100% of pay, client trust -5]
  - success: You reverse out of the queue. They watch you go.

### District crises: nightMarket (any job there)

CRISIS nm_tracker: The cash card the client gave you for expenses is pinging. Someone has planted a Silver Fan tracker in your money.
- spoof (adapt, tech): {tech} spoofs the signal
  - success: As far as the Silver Fan knows, you're now eating noodles three streets away.
  - failure: The spoof glitches. Somebody knows exactly where you are. [injury: light, heat +1]
- dump (adapt, cool): Drop the card in a wok of boiling oil [costs anyway: loses 20% of pay]
  - success: It pops and goes quiet. So does a fifth of your budget.
- abort (abort, cool): Abort: split up and walk home [costs anyway: loses 100% of pay, client trust -5]
  - success: Everyone takes a different alley home. The job dies with the card.

CRISIS nm_pulse: A data-broker feud spills into the street. Someone fires a pulse that fries every cheap implant on the block, and {tech} grabs their temple.
- cool (adapt, medical): {medic} cools them down
  - success: Ice from a drinks stall, a hand on the neck, slow breathing. The shaking stops.
  - failure: It takes too long, and the night slips away. [injury: none, loses 20% of pay]
- through (push, tech): Push on and work through it
  - success: Teeth gritted, nose bleeding, and the job gets done anyway.
  - failure: The world goes white for a second. [injury: light]
- abort (abort, cool): Abort: get them home [costs anyway: loses 100% of pay, client trust -5]
  - success: You walk them out of the neon and call it a night.

CRISIS nm_clinic: The fastest way through is a back-alley chrome clinic. On the table, under the lamp, a senior Harbour Police commander is getting illegal implants. He sees you.
- promise (adapt, social): {face} promises you saw nothing
  - success: He nods once. You were never here, and neither was he.
  - failure: He doesn't believe a word. By morning your faces are on every patrol tablet. [injury: none, heat +2]
- photo (push, stealth): Take a picture on the way past
  - success: One blurry, priceless photo. Somebody in the Night Market will pay well for it.
  - failure: The flash goes off. So does the commander. [injury: light, heat +2]
- abort (abort, cool): Abort: back out the way you came [costs anyway: loses 100% of pay, client trust -5]
  - success: You back out into the rain and lose the night going round.

### District crises: heights (any job there)

CRISIS gh_wiped: Your inside contact's badge stops working mid-job. They've just been fired and wiped from the directory, and you're forty floors up on their credentials.
- forge (adapt, tech): {tech} forges a fresh badge
  - success: A new name, a new photo, a green light. Welcome back to work.
  - failure: The reader flashes red and a door locks behind you. [injury: light, heat +1]
- stairs (push, stealth): Take the service stairs down [costs anyway: loses 10% of pay]
  - success: Forty floors of concrete stairs. Legs burning, but nobody saw you.
  - failure: A cleaner on floor 22 screams. [injury: light, heat +1]
- abort (abort, cool): Abort: walk out like you belong [costs anyway: loses 100% of pay, client trust -5]
  - success: Chin up, through the lobby and out the front door. Nobody stops you, and you leave with nothing.

CRISIS gh_trial: A neural-enhancement demo in the lobby goes wrong. The broadcast leaks into every implant nearby, and {tech} starts reciting corporate telemetry under their breath.
- pull (adapt, medical): {medic} pulls them out of it
  - success: A sedative patch and a firm hand. {tech} blinks, back in the room.
  - failure: It takes too long, and security notices the commotion. [injury: none, heat +1]
- ride (push, tech): Let them ride it out and keep working
  - success: {tech} shakes it off and keeps going, eyes streaming.
  - failure: {tech} loses a whole minute and comes round not knowing where they are. [injury: light]
- abort (abort, cool): Abort: get {tech} out of the building [costs anyway: loses 100% of pay, client trust -5]
  - success: Out through the revolving doors, {tech} still murmuring stock prices.

CRISIS gh_skybridge: Lockdown. The sky-bridge doors seal at both ends with you in the middle, sixty floors over the city. The only other way out is a maintenance hatch, and the wind is howling.
- climb (push, cool): Climb out through the hatch
  - success: Hand over hand along the outside of the bridge, the wind tearing at your clothes. You make it.
  - failure: A gust snatches somebody's footing. [injury: serious]
- spoof (adapt, tech): {tech} fakes a fire drill
  - success: Alarms, sprinklers, and the doors slide open. You walk out with the evacuees.
  - failure: The doors open, and security is waiting on the far side. [injury: light, heat +2]
- abort (abort, cool): Abort: wait for security with a good story [costs anyway: loses 100% of pay, heat +1, client trust -5]
  - success: Contractors, wrong floor, so sorry. They walk you out and keep your faces on file.

### Twists (any job)

CRISIS twist_more_guards: There are twice as many guards as the client said. Somebody either didn't know or didn't want you to.
- adapt (adapt, stealth): Slow down and work around them [costs anyway: loses 10% of pay]
  - success: It takes twice as long, but nobody sees you.
  - failure: A guard rounds the corner at the wrong moment. [injury: light, heat +1]
- push (push, combat): Push on as planned
  - success: Fast and violent, and it works.
  - failure: You walk straight into them. [injury: serious]
- abort (abort, cool): Abort: this isn't the job you were sold [costs anyway: loses 100% of pay]
  - success: You walk away. The client can explain themselves later.

CRISIS twist_double_cross: At the handover, the client's people try to take everything without paying. Hands are already inside jackets.
- talk (adapt, social): {face} reminds them who they're dealing with
  - success: A calm voice and a long stare. They decide to pay after all.
  - failure: They laugh. Then the shoving starts. [injury: light, loses 50% of pay]
- force (push, combat): {muscle} makes the first move [costs anyway: heat +1]
  - success: Over in seconds. You leave with the goods and the money.
  - failure: They were ready for it. [injury: serious]
- abort (abort, cool): Abort: hand it over and leave [costs anyway: loses 100% of pay]
  - success: You walk away with nothing. The crew will remember who did this.

CRISIS twist_tipoff: Unmarked cars at both ends of the street. Somebody tipped off the police about this job.
- slip (push, stealth): Slip out through the back lanes [costs anyway: loses 20% of pay]
  - success: Through a laundry, over a wall, and away. You lose a little of the take on the way.
  - failure: An officer sees you go over the wall. [injury: light, heat +2]
- drive (push, driving): {driver} drives through the cordon [costs anyway: heat +2]
  - success: Sirens behind you for six streets, then nothing.
  - failure: A police car clips the van. [injury: serious]
- abort (abort, cool): Abort: dump everything and walk out separately [costs anyway: loses 100% of pay]
  - success: You drop the goods in a drain and stroll past the police one by one.

CRISIS twist_rival_crew: Another crew is here for the same job. Masks, guns, and they look as surprised as you are.
- deal (adapt, social): {face} offers to split it [costs anyway: loses 40% of pay]
  - success: Half each, and a nod of respect. You might work with them one day.
  - failure: They don't want to share. [injury: light, loses 30% of pay]
- race (push, cool): Race them to it
  - success: You get there first and they back off.
  - failure: You collide in a doorway. It turns into a brawl. [injury: serious]
- abort (abort, cool): Abort: let them have it [costs anyway: loses 100% of pay, client trust -5]
  - success: You leave them to it. Nobody gets shot tonight.

CRISIS twist_bonus: Something the client didn't mention: a safe, an unlocked office, a second crate. Nobody would know if you took it.
- take (push, stealth): Take it
  - success: It comes with you. The job pays half as much again.
  - failure: It was alarmed. [injury: light, heat +2]
- leave (adapt, cool): Leave it: stick to the job
  - success: Discipline. The client will hear you played it straight.
- abort (abort, cool): Abort: this smells like a trap [costs anyway: loses 100% of pay]
  - success: You leave everything, including the job.
