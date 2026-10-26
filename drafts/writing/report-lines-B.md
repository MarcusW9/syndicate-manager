# Report lines, batch B

18 crises that need a plain `report` line for every choice. Source text, generated from the game data on 2026-10-26. Paste this whole file after the prompt for task 1 in `drafts/writing-tasks.md`.

### Data Courier Run

CRISIS tail: The van is still on you. {driver} glances in the mirror: "Lose them or lead them in?"
- lose (push, driving): Lose them in the alleys
  - success: {driver} cuts through a fish market and the van is gone.
  - failure: The van clips your rear. {driver} wrenches a shoulder. [injury: light]
- ditch (adapt, stealth): Ditch the car, finish on foot [costs anyway: loses 20% of pay]
  - success: You vanish into the night crowd. The client docks you for lateness.
  - failure: You are spotted on foot and have to run. [injury: light]
- abort (abort, cool): Abort: dump the drive and go home [costs anyway: loses 100% of pay, client trust -10]
  - success: You drop the drive in a canal and drive home. Nobody follows.

CRISIS contact_nervous: The laundromat contact is sweating. He wants to "check the drive" in the back room.
- talk (adapt, social): Talk him down
  - success: You get him laughing. He pays and stops sweating.
  - failure: He panics and pulls a pistol. It goes off. [injury: serious]
- follow (push, cool): Follow him in, carefully
  - success: It is just a scanner. He pays in full.
  - failure: Two men are waiting in the back. [injury: serious]
- abort (abort, cool): Abort: keep the drive, walk out [costs anyway: loses 100% of pay, client trust -5]
  - success: You back out slowly. The contact does not stop you.

CRISIS checkpoint: Police have thrown up a checkpoint on the flyover. They are scanning every car. {driver} has maybe ten seconds to decide.
- talk (adapt, social): Roll through and talk your way past
  - success: A tired officer waves you on without looking up.
  - failure: They search the car, miss the drive, and log your plates. Heat rises. [injury: none, heat +1]
- reroute (push, driving): {driver} cuts down an exit ramp into Old Town [costs anyway: loses 10% of pay]
  - success: A screech, a hard right, and you are deep in the back streets. A little late.
  - failure: You clip a bollard taking the ramp too fast. [injury: light]
- abort (abort, cool): Abort: turn back before the line [costs anyway: loses 100% of pay, client trust -5]
  - success: You U-turn across three lanes and head home. The drive goes back to the client.

CRISIS typhoon: The Signal 8 typhoon warning goes up mid-run. Rain comes sideways and the underpass ahead is already flooding.
- push (push, driving): Floor it through the underpass
  - success: A bow wave over the bonnet, then you are through.
  - failure: The engine coughs and dies in the water. You wade the last stretch. [injury: light]
- wait (adapt, cool): Wait it out at a dai pai dong [costs anyway: loses 30% of pay]
  - success: Two hours of milk tea and fried noodles under a tarp. The client grumbles about the delay.
  - failure: The tarp collapses. Everyone is soaked, nobody is hurt. [injury: none]
- abort (abort, cool): Abort: get everyone home before the roads close [costs anyway: loses 100% of pay]
  - success: You make it back to the safehouse as the shutters come down. The client understands, mostly.

CRISIS beacon: The drive starts pinging. Somebody built a tracker into it, and it just switched on.
- kill (adapt, tech): {tech} kills the beacon
  - success: A pin in the right port and the pinging stops. Clean.
  - failure: The beacon dies, but not before it sends a last location. Heat rises. [injury: none, heat +2]
- foil (push, cool): Wrap it in a crisp packet and hope
  - success: Old trick, still works. The signal drops to nothing.
  - failure: It keeps pinging through the foil. Someone knows where you are now. [injury: none, heat +2]
- abort (abort, cool): Abort: leave the drive in a bin and walk away [costs anyway: loses 100% of pay, client trust -10]
  - success: You dump it and disappear into the crowd. Whoever is tracking it finds a bin.

CRISIS shakedown: At a red light, a man taps on the window. He knows the crew, knows the job, and wants a cut to keep quiet.
- pay (adapt, cool): Pay him off [costs anyway: cash -500]
  - success: He counts the notes, grins and steps back onto the kerb.
- talk (adapt, social): {face} talks him out of it
  - success: By the end he is apologising for interrupting.
  - failure: He walks off muttering and makes a call. Heat rises. [injury: none, heat +1]
- floor (push, driving): {driver} runs the light
  - success: Gone before the light changes. He is left shouting at taillights.
  - failure: A minibus clips you running the light. [injury: light, heat +1]
- abort (abort, cool): Abort: call off the run [costs anyway: loses 100% of pay, client trust -5]
  - success: You drive home the long way. The job is blown, but nobody is in his pocket.

### Office Data Pull

CRISIS guard_round: A guard is early on his round. He is heading for the server room with {tech} still inside.
- distract (adapt, social): {face} distracts him
  - success: The guard gets a long story about a broken mop and never reaches the door.
  - failure: He gets suspicious and calls it in. [injury: none]
- hide (push, stealth): {tech} hides and keeps copying
  - success: The guard checks the door handle and moves on.
  - failure: He finds {tech}. There is a struggle. [injury: serious]
- abort (abort, cool): Abort: pull out with a partial copy [costs anyway: loses 60% of pay, client trust -5]
  - success: You leave with forty percent. The client is unhappy but pays something.

CRISIS neural_spike: {tech} is pushing their implants to crack the last layer. A nosebleed starts.
- push (push, tech): Let {tech} finish it
  - success: {tech} cracks it, wipes the blood away and grins. Neural load spikes.
  - failure: {tech} collapses. The vitals are bad. [injury: critical]
- medic (stabilise, medical): Medic steps in, slower approach [costs anyway: heat +1]
  - success: The medic dials {tech} down. It takes longer, but {tech} is fine.
  - failure: Too slow. An alarm trips. [injury: none]
- abort (abort, cool): Abort: unplug {tech} now [costs anyway: loses 60% of pay]
  - success: You unplug {tech} mid-crack. {tech} swears at you all the way home, alive.

CRISIS lockdown: Building security locks the lifts. You are on the thirty-first floor and the stairwell doors are on a timer.
- override (adapt, tech): {tech} overrides the lift controls
  - success: The lift hums back to life and drops you straight to the loading bay.
  - failure: The override trips a full building alert. You get out, but loudly. [injury: none, heat +2]
- stairs (push, cool): Thirty-one flights of stairs, fast
  - success: Burning legs, but you hit the ground floor as the doors unlock.
  - failure: Someone misses a step in the dark stairwell and goes down hard. [injury: light]
- abort (abort, cool): Abort: dump the copy and wait it out as cleaners [costs anyway: loses 60% of pay, client trust -5]
  - success: You sit in a supply cupboard until morning shift, then walk out with your mops.

CRISIS executive: An executive working late walks onto the floor and stares at {face}. "You're not on the cleaning rota."
- newhire (adapt, social): {face} plays the confused new hire
  - success: Five minutes of apologies and he is giving directions to the mop cupboard.
  - failure: He does not buy it and calls security. You leave in a hurry. [injury: none, heat +1]
- charm (push, social): {face} talks him into opening the server room himself
  - success: He badges you in, chatting the whole way, and shows you the backup drive. Bonus data for the client.
  - failure: He gets suspicious halfway and grabs for {face}'s arm. It gets physical. [injury: light]
- hide (push, stealth): Everyone drops behind the desks
  - success: He shrugs, takes his coat and leaves.
  - failure: He spots a shoe under a desk. There is a scuffle in the dark. [injury: light]
- abort (abort, cool): Abort: walk out before he calls anyone [costs anyway: loses 100% of pay, client trust -5]
  - success: You smile, nod, and take the lift down. Nothing copied.

CRISIS trace: Counter-intrusion software catches {tech}. A trace is crawling back up the connection towards {tech}'s implants.
- fight (push, tech): {tech} fights the trace head-on
  - success: {tech} burns the trace out and leaves a mess in their logs, hands shaking.
  - failure: The trace hits {tech}'s implants. {tech} convulses and falls. [injury: serious]
- reroute (adapt, tech): Reroute through the bubble tea shop's wifi downstairs [costs anyway: loses 20% of pay]
  - success: Slower, and the copy is partial, but the trace loses {tech}.
  - failure: The reroute stalls and the trace gets a partial lock. Heat rises. [injury: none, heat +1]
- abort (abort, cool): Abort: rip the cable out [costs anyway: loses 60% of pay]
  - success: You yank the cable. {tech} swears at you, nose bleeding, but clean.

CRISIS fire_alarm: Someone on another floor pulls the fire alarm. Sprinklers start up and the stairwells fill with staff heading out.
- blend (adapt, social): Blend in with the evacuation [costs anyway: loses 30% of pay]
  - success: You walk out in the crowd with a partial copy, soaked and anonymous.
  - failure: A fire warden asks which team you are on. You have to run for it. [injury: light]
- stay (push, tech): Stay and finish the copy in the spray
  - success: Water everywhere, but the copy finishes. Full set.
  - failure: A shorted cable sparks in the water. [injury: serious, heat +1]
- abort (abort, cool): Abort: leave with the crowd, nothing copied [costs anyway: loses 100% of pay, client trust -5]
  - success: You stand in the rain with three hundred office workers and then go home.

### Warehouse Lift

CRISIS guards_return: Headlights. The rival crew is back early: four of them, armed. {muscle} is already reaching for a weapon.
- fight (push, combat): Hold the ground and fight
  - success: Short, loud and ugly, but they break and run.
  - failure: They are better than expected. {muscle} goes down hard. [injury: critical]
- half (adapt, driving): Grab half the crates and run [costs anyway: loses 50% of pay, heat +1]
  - success: Three crates, nobody hurt, tyres screaming.
  - failure: Shots hit the van as you pull out. [injury: light]
- abort (abort, cool): Abort: leave everything, get out [costs anyway: loses 100% of pay, client trust -10]
  - success: You are gone before they see you. Empty-handed, all alive.

CRISIS forklift: A night-shift forklift driver rounds the corner and stops dead. He has a radio on his belt.
- grab (push, combat): {muscle} grabs him before he can call
  - success: He is zip-tied behind a pallet, unharmed and very quiet.
  - failure: He fights back hard and gets a shout out. [injury: light]
- bribe (adapt, social): Pay him to forget tonight [costs anyway: cash -500]
  - success: He pockets the cash and suddenly needs a long cigarette break.
  - failure: He takes the money and calls it in anyway. [injury: none]
- abort (abort, cool): Abort: leave before he raises the alarm [costs anyway: loses 100% of pay, client trust -10]
  - success: You slip out through the fence. Nothing taken, nobody hurt.

CRISIS dog: The guard dog slips its chain and comes straight at the crew, barking loud enough to wake the whole dock.
- hold (push, combat): {muscle} holds it off
  - success: A firm grip on the collar and a lot of patience. The dog sits.
  - failure: It gets a good bite in before it lets go. [injury: serious]
- sedate (adapt, medical): {medic} sedates it
  - success: One quick jab and it is asleep, snoring. Nobody hurt, dog included.
  - failure: The needle misses. The dog does not. [injury: light]
- charsiu (adapt, cool): Throw it the char siu from dinner
  - success: The barking stops. Best-fed guard dog in the Docks.
  - failure: It wants the pork and the hand holding it. [injury: light]
- abort (abort, cool): Abort: back over the fence [costs anyway: loses 100% of pay, client trust -10]
  - success: You scramble back over the fence and drive off to the sound of barking.

CRISIS tracked_crate: One of the crates has a blinking light under the lid. Someone has put a tracker on the shipment.
- disable (adapt, tech): {tech} disables the tracker
  - success: A few seconds with a multitool and the light goes dark.
  - failure: It goes dark, but it already sent its location. Heat rises. [injury: none, heat +2]
- leave (adapt, cool): Leave the tracked crate behind [costs anyway: loses 25% of pay]
  - success: Five crates instead of six. Nobody can follow you home.
- take (push, cool): Take it anyway and deal with it later [costs anyway: heat +2]
  - success: All six crates. Someone will come looking.
- abort (abort, cool): Abort: it could be a set-up, get out [costs anyway: loses 100% of pay, client trust -10]
  - success: You leave the crates where they are. If it was a trap, it caught nobody.

CRISIS toll: Three cars block the dock road out. Red Lantern enforcers. This is their road, and they want a toll for using it.
- pay (adapt, cool): Pay the toll [costs anyway: cash -1000]
  - success: The envelope disappears and the cars roll back.
- debt (adapt, social): {face} calls in an old favour with their boss
  - success: A phone call, a long pause, and they wave you through. You owe somebody now.
  - failure: The name means nothing to them, and they are insulted you tried. [injury: light]
- ram (push, driving): {driver} rams through the gap [costs anyway: heat +2]
  - success: Metal screams and you are through, crates and all. The Red Lanterns will remember this.
  - failure: The van spins into a bollard. They get a few hits in before you escape. [injury: serious]
- abort (abort, cool): Abort: leave the crates with them [costs anyway: loses 100% of pay, client trust -10]
  - success: You hand over the van keys and walk. Humiliating, but everyone is breathing.

CRISIS sampan: Two crates are already on a sampan pulling away from the pier. The tide is going out fast.
- board (push, stealth): Jump for the boat
  - success: A long leap, a soft landing, and two crates pushed back onto the pier.
  - failure: You fall between the boat and the pier. [injury: serious]
- let_go (adapt, cool): Let those two go [costs anyway: loses 35% of pay]
  - success: Four crates is still a good night.
- abort (abort, cool): Abort: cut losses and leave [costs anyway: loses 100% of pay, client trust -5]
  - success: You watch the boat disappear into the fog and head home empty-handed.
