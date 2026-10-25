// Mission templates: 10 main jobs with 6 crises each, plus rookie jobs (missions/*.js) (2-3 drawn per run), plus the
// district's own crises from ./districtCrises.js mixed into the pool.
// The three original jobs live here; newer ones each have a file in ./missions/.
// Every crisis MUST include at least one exit: an 'abort' or 'extract' choice
// (enforced by core/validate.js). This is the "no death without a choice" rule.

import { KIDNAP } from './missions/kidnap.js';
import { CASINO } from './missions/casino.js';
import { PENTHOUSE } from './missions/penthouse.js';
import { PROTECTION } from './missions/protection.js';
import { CLINIC } from './missions/clinic.js';
import { HERBAL } from './missions/herbal.js';
import { LEDGER } from './missions/ledger.js';
import { CONTAINER } from './missions/container.js';
import { DELIVERY } from './missions/delivery.js';
import { EVICTION } from './missions/eviction.js';
import { CHROME } from './missions/chrome.js';
import { CABLE } from './missions/cable.js';
import { SCRUB } from './missions/scrub.js';
import { FAVOURITE } from './missions/favourite.js';
import { LAST_TICKET } from './missions/lastticket.js';
import { WRONG_HORSE } from './missions/wronghorse.js';
import { DISTRICT_CRISES } from './districtCrises.js';
import { ROOKIE_CRISES } from './rookieCrises.js';

/** @type {import('../core/types.js').MissionTemplate[]} */
const BASE_MISSIONS = [
  {
    id: 'courier',
    name: 'Data Courier Run',
    district: 'oldTown',
    threat: 1,
    pay: 2500,
    days: 1,
    crewSize: 2,
    keyStats: ['driving', 'stealth'],
    brief: 'A shell drive needs to get across Old Town before midnight. No questions, no detours.',
    beats: [
      'The pickup is a noodle bar back room. The drive is warm, like someone just pulled it.',
      'Old Town traffic crawls. {driver} takes the alleys.',
      'Two blocks from the drop, a black van has been behind you for six turns.',
      'The drop point is a laundromat. The contact counts the cash twice.',
    ],
    crises: [
      {
        id: 'tail',
        text: 'The van is still on you. {driver} glances in the mirror: "Lose them or lead them in?"',
        focusRole: 'driver',
        choices: [
          { id: 'lose', label: 'Lose them in the alleys', kind: 'push', stat: 'driving', difficulty: 10,
            success: '{driver} cuts through a fish market and the van is gone.', failure: 'The van clips your rear. {driver} wrenches a shoulder.', failureInjury: 'light' },
          { id: 'ditch', label: 'Ditch the car, finish on foot', kind: 'adapt', stat: 'stealth', difficulty: 9, cost: { payCut: 0.2 },
            success: 'You vanish into the night crowd. The client docks you for lateness.', failure: 'You are spotted on foot and have to run.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: dump the drive and go home', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You drop the drive in a canal and drive home. Nobody follows.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'contact_nervous',
        text: 'The laundromat contact is sweating. He wants to "check the drive" in the back room.',
        choices: [
          { id: 'talk', label: 'Talk him down', kind: 'adapt', stat: 'social', difficulty: 11,
            success: 'You get him laughing. He pays and stops sweating.', failure: 'He panics and pulls a pistol. It goes off.', failureInjury: 'serious' },
          { id: 'follow', label: 'Follow him in, carefully', kind: 'push', stat: 'cool', difficulty: 12,
            success: 'It is just a scanner. He pays in full.', failure: 'Two men are waiting in the back.', failureInjury: 'serious' },
          { id: 'abort', label: 'Abort: keep the drive, walk out', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
            success: 'You back out slowly. The contact does not stop you.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'checkpoint',
        text: 'Police have thrown up a checkpoint on the flyover. They are scanning every car. {driver} has maybe ten seconds to decide.',
        focusRole: 'driver',
        choices: [
          { id: 'talk', label: 'Roll through and talk your way past', kind: 'adapt', stat: 'social', difficulty: 9, failureCost: { heat: 1 },
            success: 'A tired officer waves you on without looking up.', failure: 'They search the car, miss the drive, and log your plates. Heat rises.', failureInjury: 'none' },
          { id: 'reroute', label: '{driver} cuts down an exit ramp into Old Town', kind: 'push', stat: 'driving', difficulty: 10, cost: { payCut: 0.1 },
            success: 'A screech, a hard right, and you are deep in the back streets. A little late.', failure: 'You clip a bollard taking the ramp too fast.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: turn back before the line', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
            success: 'You U-turn across three lanes and head home. The drive goes back to the client.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'typhoon',
        text: 'The Signal 8 typhoon warning goes up mid-run. Rain comes sideways and the underpass ahead is already flooding.',
        focusRole: 'driver',
        choices: [
          { id: 'push', label: 'Floor it through the underpass', kind: 'push', stat: 'driving', difficulty: 11,
            success: 'A bow wave over the bonnet, then you are through.', failure: 'The engine coughs and dies in the water. You wade the last stretch.', failureInjury: 'light' },
          { id: 'wait', label: 'Wait it out at a dai pai dong', kind: 'adapt', stat: 'cool', difficulty: 2, cost: { payCut: 0.3 },
            success: 'Two hours of milk tea and fried noodles under a tarp. The client grumbles about the delay.', failure: 'The tarp collapses. Everyone is soaked, nobody is hurt.', failureInjury: 'none' },
          { id: 'abort', label: 'Abort: get everyone home before the roads close', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1 },
            success: 'You make it back to the safehouse as the shutters come down. The client understands, mostly.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'beacon',
        text: 'The drive starts pinging. Somebody built a tracker into it, and it just switched on.',
        choices: [
          { id: 'kill', label: '{tech} kills the beacon', kind: 'adapt', stat: 'tech', difficulty: 10, requires: { kind: 'role', value: 'tech' },
            success: 'A pin in the right port and the pinging stops. Clean.', failure: 'The beacon dies, but not before it sends a last location. Heat rises.', failureInjury: 'none', failureCost: { heat: 2 } },
          { id: 'foil', label: 'Wrap it in a crisp packet and hope', kind: 'push', stat: 'cool', difficulty: 12, failureCost: { heat: 2 },
            success: 'Old trick, still works. The signal drops to nothing.', failure: 'It keeps pinging through the foil. Someone knows where you are now.', failureInjury: 'none' },
          { id: 'abort', label: 'Abort: leave the drive in a bin and walk away', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You dump it and disappear into the crowd. Whoever is tracking it finds a bin.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'shakedown',
        text: 'At a red light, a man taps on the window. He knows the crew, knows the job, and wants a cut to keep quiet.',
        choices: [
          { id: 'pay', label: 'Pay him off', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -500 },
            success: 'He counts the notes, grins and steps back onto the kerb.', failure: '', failureInjury: 'none' },
          { id: 'talk', label: '{face} talks him out of it', kind: 'adapt', stat: 'social', difficulty: 11, requires: { kind: 'role', value: 'face' }, failureCost: { heat: 1 },
            success: 'By the end he is apologising for interrupting.', failure: 'He walks off muttering and makes a call. Heat rises.', failureInjury: 'none' },
          { id: 'floor', label: '{driver} runs the light', kind: 'push', stat: 'driving', difficulty: 12, failureCost: { heat: 1 },
            success: 'Gone before the light changes. He is left shouting at taillights.', failure: 'A minibus clips you running the light.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: call off the run', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
            success: 'You drive home the long way. The job is blown, but nobody is in his pocket.', failure: '', failureInjury: 'none' },
        ],
      },
    ],
    heat: 0,
  },
  {
    id: 'data_pull',
    name: 'Office Data Pull',
    district: 'heights',
    threat: 3,
    pay: 5000,
    days: 2,
    crewSize: 3,
    keyStats: ['tech', 'stealth', 'social'],
    brief: 'A mid-tier firm in Glass Heights keeps its payroll offline. Get it, copy it, leave no trace.',
    beats: [
      'You go in as night cleaners. {face} handles the front desk.',
      '{tech} finds the server room behind a door that is not on the floor plan.',
      'The copy bar crawls. Forty percent. Sixty.',
      'Out through the loading bay, into the van.',
    ],
    crises: [
      {
        id: 'guard_round',
        text: 'A guard is early on his round. He is heading for the server room with {tech} still inside.',
        focusRole: 'tech',
        choices: [
          { id: 'distract', label: '{face} distracts him', kind: 'adapt', stat: 'social', difficulty: 11, requires: { kind: 'role', value: 'face' },
            success: 'The guard gets a long story about a broken mop and never reaches the door.', failure: 'He gets suspicious and calls it in.', failureInjury: 'none' },
          { id: 'hide', label: '{tech} hides and keeps copying', kind: 'push', stat: 'stealth', difficulty: 13,
            success: 'The guard checks the door handle and moves on.', failure: 'He finds {tech}. There is a struggle.', failureInjury: 'serious' },
          { id: 'abort', label: 'Abort: pull out with a partial copy', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6, clientTrust: -5 },
            success: 'You leave with forty percent. The client is unhappy but pays something.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'neural_spike',
        text: '{tech} is pushing their implants to crack the last layer. A nosebleed starts.',
        focusRole: 'tech',
        choices: [
          { id: 'push', label: 'Let {tech} finish it', kind: 'push', stat: 'tech', difficulty: 12, neural: 25,
            success: '{tech} cracks it, wipes the blood away and grins. Neural load spikes.', failure: '{tech} collapses. The vitals are bad.', failureInjury: 'critical' },
          { id: 'medic', label: 'Medic steps in, slower approach', kind: 'stabilise', stat: 'medical', difficulty: 9, requires: { kind: 'role', value: 'medic' }, cost: { heat: 1 },
            success: 'The medic dials {tech} down. It takes longer, but {tech} is fine.', failure: 'Too slow. An alarm trips.', failureInjury: 'none' },
          { id: 'abort', label: 'Abort: unplug {tech} now', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6 },
            success: 'You unplug {tech} mid-crack. {tech} swears at you all the way home, alive.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'lockdown',
        text: 'Building security locks the lifts. You are on the thirty-first floor and the stairwell doors are on a timer.',
        choices: [
          { id: 'override', label: '{tech} overrides the lift controls', kind: 'adapt', stat: 'tech', difficulty: 12, requires: { kind: 'role', value: 'tech' }, failureCost: { heat: 2 },
            success: 'The lift hums back to life and drops you straight to the loading bay.', failure: 'The override trips a full building alert. You get out, but loudly.', failureInjury: 'none' },
          { id: 'stairs', label: 'Thirty-one flights of stairs, fast', kind: 'push', stat: 'cool', difficulty: 10,
            success: 'Burning legs, but you hit the ground floor as the doors unlock.', failure: 'Someone misses a step in the dark stairwell and goes down hard.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: dump the copy and wait it out as cleaners', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6, clientTrust: -5 },
            success: 'You sit in a supply cupboard until morning shift, then walk out with your mops.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'executive',
        text: 'An executive working late walks onto the floor and stares at {face}. "You\'re not on the cleaning rota."',
        focusRole: 'face',
        choices: [
          { id: 'newhire', label: '{face} plays the confused new hire', kind: 'adapt', stat: 'social', difficulty: 12, requires: { kind: 'role', value: 'face' }, failureCost: { heat: 1 },
            success: 'Five minutes of apologies and he is giving directions to the mop cupboard.', failure: 'He does not buy it and calls security. You leave in a hurry.', failureInjury: 'none' },
          { id: 'charm', label: '{face} talks him into opening the server room himself', kind: 'push', stat: 'social', difficulty: 14, requires: { kind: 'trait', value: 'silver_tongue' }, successCost: { payCut: -0.2 },
            success: 'He badges you in, chatting the whole way, and shows you the backup drive. Bonus data for the client.', failure: 'He gets suspicious halfway and grabs for {face}\'s arm. It gets physical.', failureInjury: 'light' },
          { id: 'hide', label: 'Everyone drops behind the desks', kind: 'push', stat: 'stealth', difficulty: 11,
            success: 'He shrugs, takes his coat and leaves.', failure: 'He spots a shoe under a desk. There is a scuffle in the dark.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: walk out before he calls anyone', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
            success: 'You smile, nod, and take the lift down. Nothing copied.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'trace',
        text: 'Counter-intrusion software catches {tech}. A trace is crawling back up the connection towards {tech}\'s implants.',
        focusRole: 'tech',
        choices: [
          { id: 'fight', label: '{tech} fights the trace head-on', kind: 'push', stat: 'tech', difficulty: 13, neural: 20, requires: { kind: 'role', value: 'tech' },
            success: '{tech} burns the trace out and leaves a mess in their logs, hands shaking.', failure: 'The trace hits {tech}\'s implants. {tech} convulses and falls.', failureInjury: 'serious' },
          { id: 'reroute', label: 'Reroute through the bubble tea shop\'s wifi downstairs', kind: 'adapt', stat: 'tech', difficulty: 10, neural: 10, cost: { payCut: 0.2 },
            success: 'Slower, and the copy is partial, but the trace loses {tech}.', failure: 'The reroute stalls and the trace gets a partial lock. Heat rises.', failureInjury: 'none', failureCost: { heat: 1 } },
          { id: 'abort', label: 'Abort: rip the cable out', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6 },
            success: 'You yank the cable. {tech} swears at you, nose bleeding, but clean.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'fire_alarm',
        text: 'Someone on another floor pulls the fire alarm. Sprinklers start up and the stairwells fill with staff heading out.',
        choices: [
          { id: 'blend', label: 'Blend in with the evacuation', kind: 'adapt', stat: 'social', difficulty: 9, cost: { payCut: 0.3 },
            success: 'You walk out in the crowd with a partial copy, soaked and anonymous.', failure: 'A fire warden asks which team you are on. You have to run for it.', failureInjury: 'light' },
          { id: 'stay', label: 'Stay and finish the copy in the spray', kind: 'push', stat: 'tech', difficulty: 12, failureCost: { heat: 1 },
            success: 'Water everywhere, but the copy finishes. Full set.', failure: 'A shorted cable sparks in the water.', failureInjury: 'serious' },
          { id: 'abort', label: 'Abort: leave with the crowd, nothing copied', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
            success: 'You stand in the rain with three hundred office workers and then go home.', failure: '', failureInjury: 'none' },
        ],
      },
    ],
    heat: 0,
  },
  {
    id: 'warehouse',
    name: 'Warehouse Lift',
    district: 'docks',
    threat: 4,
    pay: 6000,
    days: 2,
    crewSize: 4,
    keyStats: ['combat', 'stealth', 'driving'],
    brief: 'A rival crew is storing stolen implants in a Docks warehouse. Take the crates before they ship.',
    beats: [
      'Fog off the water. {driver} kills the headlights a block out.',
      'The fence is cut. Six crates, two guards, one dog.',
      'Halfway through loading, the dog starts barking at nothing. Everyone freezes, then keeps going.',
      'The van sits low on its springs. {driver} pulls away slowly.',
    ],
    crises: [
      {
        id: 'guards_return',
        text: 'Headlights. The rival crew is back early: four of them, armed. {muscle} is already reaching for a weapon.',
        focusRole: 'muscle',
        choices: [
          { id: 'fight', label: 'Hold the ground and fight', kind: 'push', stat: 'combat', difficulty: 14,
            success: 'Short, loud and ugly, but they break and run.', failure: 'They are better than expected. {muscle} goes down hard.', failureInjury: 'critical' },
          { id: 'half', label: 'Grab half the crates and run', kind: 'adapt', stat: 'driving', difficulty: 11, cost: { payCut: 0.5, heat: 1 },
            success: 'Three crates, nobody hurt, tyres screaming.', failure: 'Shots hit the van as you pull out.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: leave everything, get out', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You are gone before they see you. Empty-handed, all alive.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'forklift',
        text: 'A night-shift forklift driver rounds the corner and stops dead. He has a radio on his belt.',
        choices: [
          { id: 'grab', label: '{muscle} grabs him before he can call', kind: 'push', stat: 'combat', difficulty: 9,
            success: 'He is zip-tied behind a pallet, unharmed and very quiet.', failure: 'He fights back hard and gets a shout out.', failureInjury: 'light' },
          { id: 'bribe', label: 'Pay him to forget tonight', kind: 'adapt', stat: 'social', difficulty: 10, cost: { cash: -500 },
            success: 'He pockets the cash and suddenly needs a long cigarette break.', failure: 'He takes the money and calls it in anyway.', failureInjury: 'none' },
          { id: 'abort', label: 'Abort: leave before he raises the alarm', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You slip out through the fence. Nothing taken, nobody hurt.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'dog',
        text: 'The guard dog slips its chain and comes straight at the crew, barking loud enough to wake the whole dock.',
        choices: [
          { id: 'hold', label: '{muscle} holds it off', kind: 'push', stat: 'combat', difficulty: 11,
            success: 'A firm grip on the collar and a lot of patience. The dog sits.', failure: 'It gets a good bite in before it lets go.', failureInjury: 'serious' },
          { id: 'sedate', label: '{medic} sedates it', kind: 'adapt', stat: 'medical', difficulty: 10, requires: { kind: 'role', value: 'medic' },
            success: 'One quick jab and it is asleep, snoring. Nobody hurt, dog included.', failure: 'The needle misses. The dog does not.', failureInjury: 'light' },
          { id: 'charsiu', label: 'Throw it the char siu from dinner', kind: 'adapt', stat: 'cool', difficulty: 9,
            success: 'The barking stops. Best-fed guard dog in the Docks.', failure: 'It wants the pork and the hand holding it.', failureInjury: 'light' },
          { id: 'abort', label: 'Abort: back over the fence', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You scramble back over the fence and drive off to the sound of barking.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'tracked_crate',
        text: 'One of the crates has a blinking light under the lid. Someone has put a tracker on the shipment.',
        choices: [
          { id: 'disable', label: '{tech} disables the tracker', kind: 'adapt', stat: 'tech', difficulty: 12, requires: { kind: 'role', value: 'tech' }, failureCost: { heat: 2 },
            success: 'A few seconds with a multitool and the light goes dark.', failure: 'It goes dark, but it already sent its location. Heat rises.', failureInjury: 'none' },
          { id: 'leave', label: 'Leave the tracked crate behind', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { payCut: 0.25 },
            success: 'Five crates instead of six. Nobody can follow you home.', failure: '', failureInjury: 'none' },
          { id: 'take', label: 'Take it anyway and deal with it later', kind: 'push', sure: true, stat: 'cool', difficulty: 0, cost: { heat: 2 },
            success: 'All six crates. Someone will come looking.', failure: '', failureInjury: 'none' },
          { id: 'abort', label: 'Abort: it could be a set-up, get out', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You leave the crates where they are. If it was a trap, it caught nobody.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'toll',
        text: 'Three cars block the dock road out. Red Lantern enforcers. This is their road, and they want a toll for using it.',
        choices: [
          { id: 'pay', label: 'Pay the toll', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -1000 },
            success: 'The envelope disappears and the cars roll back.', failure: '', failureInjury: 'none' },
          { id: 'debt', label: '{face} calls in an old favour with their boss', kind: 'adapt', stat: 'social', difficulty: 13, requires: { kind: 'role', value: 'face' },
            success: 'A phone call, a long pause, and they wave you through. You owe somebody now.', failure: 'The name means nothing to them, and they are insulted you tried.', failureInjury: 'light' },
          { id: 'ram', label: '{driver} rams through the gap', kind: 'push', stat: 'driving', difficulty: 13, cost: { heat: 2 },
            success: 'Metal screams and you are through, crates and all. The Red Lanterns will remember this.', failure: 'The van spins into a bollard. They get a few hits in before you escape.', failureInjury: 'serious' },
          { id: 'abort', label: 'Abort: leave the crates with them', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -10 },
            success: 'You hand over the van keys and walk. Humiliating, but everyone is breathing.', failure: '', failureInjury: 'none' },
        ],
      },
      {
        id: 'sampan',
        text: 'Two crates are already on a sampan pulling away from the pier. The tide is going out fast.',
        choices: [
          { id: 'board', label: 'Jump for the boat', kind: 'push', stat: 'stealth', difficulty: 12,
            success: 'A long leap, a soft landing, and two crates pushed back onto the pier.', failure: 'You fall between the boat and the pier.', failureInjury: 'serious' },
          { id: 'let_go', label: 'Let those two go', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { payCut: 0.35 },
            success: 'Four crates is still a good night.', failure: '', failureInjury: 'none' },
          { id: 'abort', label: 'Abort: cut losses and leave', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
            success: 'You watch the boat disappear into the fog and head home empty-handed.', failure: '', failureInjury: 'none' },
        ],
      },
    ],
    heat: 0,
  },
];

// Rookie jobs (rookie: true) draw the shared rookie pool instead of the district crises:
// those are aimed at 9-14, too hard for a new crew.
export const MISSIONS = [...BASE_MISSIONS, KIDNAP, CASINO, PENTHOUSE, PROTECTION, CLINIC, HERBAL, LEDGER, CONTAINER, DELIVERY, EVICTION, CHROME, CABLE, SCRUB, FAVOURITE, LAST_TICKET, WRONG_HORSE]
  .map((m) => ({ ...m, crises: [...m.crises, ...(m.rookie ? ROOKIE_CRISES : DISTRICT_CRISES[m.district] ?? [])] }));
