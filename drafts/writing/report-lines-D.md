# Report lines, batch D

12 crises that need a plain `report` line for every choice. Source text, generated from the game data on 2026-10-26. Paste this whole file after the prompt for task 1 in `drafts/writing-tasks.md`.

### Penthouse Heist

CRISIS facial_scan: The service lift has a facial scanner nobody mentioned. It wants a registered face.
- spoof (adapt, tech): {tech} spoofs the scanner
  - success: The scanner sees a cleaner who retired in 2019. The doors open.
  - failure: The scanner flags an intrusion attempt. Building security is alerted. [injury: none, heat +2]
- climb (push, stealth): {infiltrator} climbs the lift shaft
  - success: Seventy-one floors of cables and grease. {infiltrator} opens the lift from the inside.
  - failure: A hand slips on a greasy cable. [injury: serious]
- abort (abort, cool): Abort: the job was sold to you wrong [costs anyway: loses 100% of pay, client trust -10]
  - success: You walk back out past the concierge, who is still asleep.

CRISIS laser_grid: The study has a laser grid across the floor, invisible until {tech} sprays the air.
- thread (push, stealth): Thread through the beams
  - success: Slow, twisting, holding breath. Nobody touches a beam.
  - failure: An elbow clips a beam. Alarms start counting down. [injury: none, heat +2, loses 30% of pay]
- loop (adapt, tech): {tech} loops the sensor feed
  - success: The grid stays on, but it's watching a recording now. You walk straight through.
  - failure: The loop glitches and the grid resets louder. [injury: none, heat +2]
- abort (abort, cool): Abort: back out of the study [costs anyway: loses 100% of pay, client trust -10]
  - success: You leave the vault untouched and the beams unbroken.

CRISIS owner_home: The front door opens. The executive is home early, with a bodyguard and a bottle of champagne.
- hide (push, stealth): Everyone hides and waits
  - success: An hour behind the curtains while he drinks. Then he falls asleep on the sofa.
  - failure: The bodyguard sweeps the room and finds someone behind the curtains. [injury: serious]
- pose (adapt, social): {face} poses as the building's night manager
  - success: "Sir, a water leak upstairs, we needed to check your ceiling." He apologises for the trouble.
  - failure: The bodyguard calls the real night manager. [injury: light, heat +2]
- abort (abort, cool): Abort: out the balcony and down the fire stairs [costs anyway: loses 100% of pay, client trust -5]
  - success: Seventy-one flights of fire stairs. Legs shaking, everyone alive.

CRISIS vault_timer: The vault has a time lock. {tech} can force it, but it will push their brain to its limit.
- force (push, tech): {tech} forces the time lock
  - success: Ninety seconds of silence, then a click. {tech}'s hands are shaking badly.
  - failure: {tech}'s implants overload. {tech} drops to the floor, convulsing. [injury: critical]
- jade_only (adapt, stealth): Forget the vault, take the jade on display [costs anyway: loses 50% of pay]
  - success: Three jade carvings from the shelves. Half the score, none of the risk.
- abort (abort, cool): Abort: leave it all [costs anyway: loses 100% of pay, client trust -10]
  - success: You leave the penthouse exactly as you found it.

CRISIS drone: A security drone rises outside the window, lights sweeping across the glass.
- freeze (push, cool): Freeze and wait for it to pass
  - success: Nobody moves. The lights pass over, and the drone drifts away.
  - failure: Someone flinches. The drone hovers and starts recording. [injury: none, heat +2]
- hack (adapt, tech): {tech} takes control of the drone
  - success: The drone wobbles, then flies off to film the harbour.
  - failure: The drone's owner fights back. It crashes into the glass. [injury: none, heat +2]
- abort (abort, cool): Abort: get out before it calls it in [costs anyway: loses 100% of pay, client trust -10]
  - success: Down the stairs as the drone hovers at the empty window.

CRISIS lockdown_tower: Tower security locks down the lobby. The only way out is the roof, or the loading dock past two guards.
- dock (push, driving): {driver} rams the loading dock gate [costs anyway: heat +2]
  - success: The gate folds like paper. You're on the flyover before the guards reach their radios.
  - failure: The van takes the gate badly. Glass everywhere. [injury: serious]
- roof (push, stealth): Out over the roof to the next tower
  - success: A plank between towers, 300 metres up. Nobody looks down.
  - failure: The plank shifts. Someone nearly falls. [injury: serious]
- abort (abort, cool): Abort: leave the bag, walk out as cleaners [costs anyway: loses 100% of pay, client trust -10]
  - success: You dump the bag in a laundry chute and walk out in uniforms. Nobody stops you.

### Protection Run

CRISIS tail_bikes: Two motorbikes fall in behind the van. The riders aren't wearing helmets, and they're in no hurry to pass.
- lose (push, driving): {driver} loses them in the wet market
  - success: Through a wet market at speed, fish flying. The bikes slide out.
  - failure: A stall clips the van. Everyone gets thrown around. [injury: light]
- stare (adapt, cool): {muscle} leans out and stares them down
  - success: One long look. They peel off at the next junction.
  - failure: They take it as a challenge and pull alongside. [injury: light, heat +1]
- abort (abort, cool): Abort: turn back to the Docks [costs anyway: loses 100% of pay, client trust -10]
  - success: You U-turn and take her back. She is not happy.

CRISIS roadblock: A cart full of cardboard has been pushed across the road. Men are waiting in the doorways either side.
- ram (push, driving): {driver} drives straight through [costs anyway: heat +1]
  - success: Cardboard everywhere, but the van is through and moving.
  - failure: The cart catches under the van. It stalls. [injury: serious]
- fight (push, combat): Get out and clear it
  - success: A short, loud fight. They scatter.
  - failure: There are more of them than you thought. [injury: serious]
- abort (abort, cool): Abort: reverse out and go home [costs anyway: loses 100% of pay, client trust -10]
  - success: Reverse gear, all the way back to the main road.

CRISIS toll_collector: A polite young man in a suit flags the van down. "Red Lantern road. There's a fee."
- pay (adapt, cool): Pay the fee [costs anyway: cash -800]
  - success: He counts it, thanks you, and wishes the herbalist good health.
- talk (adapt, social): {face} negotiates [costs anyway: cash -300]
  - success: Half price, and a promise to buy herbs from her shop.
  - failure: He takes the full fee and adds a bit for wasting his time. [injury: none, cash -800]
- abort (abort, cool): Abort: refuse and turn around [costs anyway: loses 100% of pay, client trust -10]
  - success: You turn around. He watches you go, still smiling.

CRISIS client_panic: The herbalist sees someone she knows on the street and panics. She wants to get out of the van, now.
- calm (adapt, social): {face} calms her down
  - success: A long talk about her grandchildren. By the end she is laughing.
  - failure: She opens the door at a red light. [injury: none, loses 30% of pay]
- drive (push, cool): Keep driving, explain later
  - success: She shouts for two minutes, then sulks. The van keeps moving.
  - failure: She grabs the wheel. [injury: light]
- abort (abort, cool): Abort: let her out, call it off [costs anyway: loses 100% of pay, client trust -10]
  - success: She gets out and walks off with her thermos. The cargo comes back with you.

CRISIS ambush: A car pulls across the van at a junction. Doors open. This was planned.
- fight (push, combat): {muscle} holds them off while you reverse
  - success: {muscle} buys ten seconds. Ten seconds is enough.
  - failure: {muscle} is outnumbered and goes down. [injury: critical]
- swerve (push, driving): {driver} swerves through the gap
  - success: Mirrors gone, paint gone, but you're through.
  - failure: The gap was smaller than it looked. [injury: serious]
- abort (abort, cool): Abort: give them the cargo [costs anyway: loses 100% of pay, client trust -15]
  - success: You hand over the van keys. They take the van and leave you on the pavement, alive.

CRISIS checkpoint_goods: Customs officers are inspecting vans at the district border. Some of the dried goods are not exactly legal.
- papers (adapt, social): {face} shows the herbalist's paperwork with confidence
  - success: "Traditional medicine, officer." He waves you through with a cough.
  - failure: He opens a crate and starts asking questions. [injury: none, heat +2]
- detour (adapt, driving): Take the long way round [costs anyway: loses 15% of pay]
  - success: An extra hour through back streets. Late, but clean.
  - failure: The detour runs straight into a Red Lantern street. [injury: light]
- abort (abort, cool): Abort: turn back before the line [costs anyway: loses 100% of pay, client trust -5]
  - success: Back to the Docks. The herbalist will have to find another way.
