# Report lines, batch C

12 crises that need a plain `report` line for every choice. Source text, generated from the game data on 2026-10-26 (updated the same day to show success-only bonuses). Paste this whole file after the prompt for task 1 in `drafts/writing-tasks.md`.

### Kidnap Rescue

CRISIS lookout: A lookout is smoking in the alley by the back door. If he sees you, the hostage gets moved, or worse.
- quiet (push, stealth): {muscle} takes him down quietly
  - success: One arm round the neck, a soft landing on the bins. Out cold.
  - failure: He gets a shout out before he goes down. Upstairs goes quiet. [injury: light, heat +1]
- distract (adapt, social): {face} plays a lost tourist asking for directions
  - success: He walks {face} to the corner to point the way. You slip in behind him.
  - failure: He doesn't buy it and calls upstairs. [injury: none, heat +1]
- abort (abort, cool): Abort: pull back and leave him there [costs anyway: loses 100% of pay, client trust -15]
  - success: You drive away. Nobody on the crew says anything for a long time.

CRISIS moving: Footsteps on the stairs. The kidnappers are moving the hostage to a car, right now.
- ambush (push, combat): Hit them on the stairs
  - success: Tight stairwell, fast work. The kidnappers go down and the hostage is yours.
  - failure: They fight back hard in the narrow space. {muscle} takes a knife. [injury: serious]
- follow (adapt, driving): {driver} tails the car to wherever they take him [costs anyway: loses 15% of pay]
  - success: A slow tail through the night markets, then a quieter flat with fewer guards. Easier, if later.
  - failure: You lose them at a light, then find them again, but they've seen you. [injury: light]
- abort (abort, cool): Abort: let the car go [costs anyway: loses 100% of pay, client trust -15]
  - success: The car turns the corner and is gone. So is the accountant.

CRISIS hostage_hurt: The accountant has been beaten badly. He can barely stand, and the stairs are steep.
- patch (adapt, medical): {medic} patches him up first
  - success: Tape, a splint and a lot of encouragement. He walks out on his own feet.
  - failure: It takes too long. Someone downstairs hears the commotion. [injury: light]
- carry (push, combat): {muscle} carries him down
  - success: Over the shoulder like a sack of rice, and down the stairs fast.
  - failure: {muscle} slips on the stairs with the weight. [injury: light]
- abort (abort, cool): Abort: get your own people out [costs anyway: loses 100% of pay, client trust -15]
  - success: You leave him in the chair. He watches you go.

CRISIS ransom_call: The kidnappers' phone rings. It's their boss. If nobody answers, he'll send more people.
- voice (adapt, social): {face} answers and fakes a kidnapper's voice
  - success: "All quiet, boss." A grunt on the other end, and the line goes dead.
  - failure: The boss asks a question only his people would know. The line goes dead, and so does your time. [injury: none, heat +2]
- hurry (push, cool): Ignore it and move fast
  - success: You're three streets away before anyone else arrives.
  - failure: A car screeches up as you're loading the van. [injury: light, heat +1]
- abort (abort, cool): Abort: get out before they arrive [costs anyway: loses 100% of pay, client trust -15]
  - success: You leave the way you came. The hostage stays.

CRISIS wrong_floor: The floor plan was wrong. There's a mahjong game going in the next room: six men, and they're all armed.
- sneak (push, stealth): Slip past while the tiles are loud
  - success: You time every step to the clatter of tiles. Nobody looks up.
  - failure: A floorboard creaks between hands. Six heads turn. [injury: serious]
- lock (adapt, tech): {tech} locks them in from the outside
  - success: A zip tie through the door handles and a wedge under the door. They don't notice until you're gone.
  - failure: The lock clicks loudly. Someone tries the door. [injury: light, heat +1]
- abort (abort, cool): Abort: six guns is too many [costs anyway: loses 100% of pay, client trust -10]
  - success: You back out quietly. The client won't forgive this easily.

CRISIS police_sirens: Sirens. Someone called the police about the noise. They'll be here in minutes, and the hostage is a witness.
- leave_him (adapt, cool): Leave the hostage for the police to find [costs anyway: loses 50% of pay, client trust -5]
  - success: He's safe, and the police get the credit. The client gets him back, but not from you.
- run (push, driving): Take him and run before they arrive
  - success: {driver} takes the back lanes. The sirens pass the end of the street.
  - failure: A patrol car spots the van. You lose them, but they got the plates. [injury: none, heat +2]
- abort (abort, cool): Abort: scatter, everyone on foot [costs anyway: loses 100% of pay, client trust -10]
  - success: Five people walk away in five directions. The police find the hostage.

### Casino Con

CRISIS pit_boss: The pit boss is watching {face}'s hands closely. He signals for the dealer to change the shoe.
- charm (adapt, social): {face} tips him and asks about his family
  - success: Ten minutes on his daughter's exams and he forgets to change the shoe.
  - failure: He smiles, changes the shoe anyway, and calls security over to watch. [injury: none, loses 30% of pay]
- lose (adapt, cool): Lose a few hands on purpose [costs anyway: loses 15% of pay]
  - success: A few bad hands and some loud swearing. He relaxes.
  - failure: You lose more than you meant to. [injury: none, loses 20% of pay]
- abort (abort, cool): Abort: cash out now with what you have [costs anyway: loses 60% of pay, client trust -5]
  - success: You leave with a fraction of what you came for.

CRISIS signal_lost: The casino's jammer kicks in. {tech}'s link to {face}'s earpiece drops to static.
- fix (adapt, tech): {tech} finds a gap in the jammer
  - success: A different frequency, a little interference, and the voice is back.
  - failure: The jammer sweeps and finds the earpiece. Security starts looking around. [injury: none, heat +1]
- solo (push, cool): {face} plays on alone, by instinct
  - success: No signals, no help. Just nerve. The chips keep coming.
  - failure: Without the signals, the luck runs out. [injury: none, loses 40% of pay]
- abort (abort, cool): Abort: walk away from the table [costs anyway: loses 70% of pay]
  - success: You finish your drink and leave. Small winnings.

CRISIS recognised: A regular at the table squints at {face}. "Don't I know you? You were at the Macau tables last year."
- deny (adapt, social): {face} laughs it off
  - success: "Everyone says I look like someone." He shrugs and goes back to his cards.
  - failure: He keeps talking, louder. The pit boss comes over. [injury: none, heat +1, loses 20% of pay]
- buy (adapt, cool): Buy his silence with chips [costs anyway: loses 20% of pay]
  - success: A tall stack slides across the table. Suddenly he doesn't remember anything.
- abort (abort, cool): Abort: leave before he remembers [costs anyway: loses 100% of pay, client trust -5]
  - success: You leave mid-hand. He shouts something after you.

CRISIS back_room: Security asks {face} to come to the back room "for a chat". Two of them, both big.
- go (push, cool): {face} goes along and bluffs
  - success: Twenty minutes of questions. {face} doesn't blink. They apologise for the trouble.
  - failure: They search {face} and find the earpiece. It gets rough. [injury: serious]
- scene (adapt, social): Cause a scene in the main room [costs anyway: heat +1]
  - success: A spilled drink, a shouting match, and you slip out in the chaos with the chips.
  - failure: The scene gets out of hand. Someone throws a punch. [injury: light]
- abort (abort, cool): Abort: drop the chips and run [costs anyway: loses 100% of pay, client trust -5]
  - success: Down the fire escape and into the market crowd. Empty-handed.

CRISIS triad_owner: The owner comes down to watch. He has a Red Lantern tattoo on his wrist. This is their room.
- respect (adapt, cool): {face} pays respect: a share of the winnings [costs anyway: loses 25% of pay]
  - success: A respectful envelope. He nods and goes back upstairs. Business is business.
- continue (push, social): Keep winning in front of him [costs anyway: heat +1]
  - success: He watches every hand and finds nothing. He even laughs at the end.
  - failure: He sees enough. You're escorted out and told never to come back. [injury: light, loses 50% of pay]
- abort (abort, cool): Abort: not worth crossing the Red Lanterns [costs anyway: loses 100% of pay, client trust -5]
  - success: You fold, thank the dealer and leave.

CRISIS big_hand: One last hand. The whole stack on the table. {tech} says the signal is good, but not certain.
- all_in (push, tech): Go all in
  - success: Natural nine. The table goes silent. The job pays 40% more. [pay +40%]
  - failure: The cards turn the wrong way. You lose the stack. [injury: none, loses 80% of pay]
- walk (adapt, cool): Walk away with what you have
  - success: You stand, stretch and cash out. A good night.
- abort (abort, cool): Abort: something feels wrong, leave now [costs anyway: loses 50% of pay]
  - success: You leave half the chips on the table and go.
