// Prep stops: the shared library a long job's days draw from (owner, 2026-11-24; drafts/PROPOSAL-longer-jobs.md).
// Content only; core/prep.js picks them for an offer and builds its route, core/mission.js plays them.
//
// A stop is a crisis on its own map before the job itself, with an abort as always. What it does to the job:
//   successCost.ease: 1        the job's later rolls are 1 easier (am.threatDelta)
//   successCost.dropCrisis: 1  one crisis comes out of the job's own draw
//   failureCost.alert: 1       the job starts 1 alert up (every later roll 1 harder; the alert can tip a job loud)
// A failure costs at most a light injury and never kills (tests/prep.test.js).
//
// districts: null fits anywhere; otherwise the districts it fits. stats: what its choices roll, so a job whose key
// stats match draws it more often. {law}, {faction}, {district} and {op} fill as in any crisis (core/mission.js fill).
//
// Claude's first draft (2026-11-24), for the owner to mark: drafts/writing-tasks.md "Prep stops".

const abort = (id, success) => ({
  id, label: 'Abort: walk away from the job', kind: 'abort', stat: 'cool', difficulty: 0,
  cost: { payCut: 1, clientTrust: -3 },
  success, failure: '', failureInjury: 'none',
  report: { success: 'The crew walked away before the job. No pay. The client is unhappy.' },
});

export const PREP_STOPS = [
  // --- anywhere ---
  {
    id: 'prep_roof_opposite', districts: null, stats: ['stealth', 'tech'],
    time: '22:10', place: 'a roof across the street from the place',
    arrive: 'The crew spends the evening on a roof across the street, counting who comes and goes.',
    crisis: {
      id: 'prep_roof_opposite', stop: true, situations: ['entry'],
      text: 'A building manager comes up to check the water tanks and stops at the sight of the crew’s camera on its little tripod.',
      choices: [
        { id: 'roof_hide', label: 'Pack the camera away and lie flat', kind: 'push', stat: 'stealth', difficulty: 12, successCost: { ease: 1 },
          success: '{op} folds the tripod into the shadow of a tank. The manager shrugs and goes back down; the count goes on all night.',
          failure: 'The manager sees enough to call the building’s guard. The crew leaves with half a count.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} kept the roof watch going all night: the job gets easier.', failure: 'The roof watch was seen. The job starts on alert.' } },
        { id: 'roof_story', label: 'Say it’s a survey for the tank company', kind: 'adapt', stat: 'social', difficulty: 13, successCost: { ease: 1 },
          success: '{op} complains about the overtime. The manager complains back and leaves them to it.',
          failure: 'The manager asks for a name to check. The crew is gone before he dials.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} talked the roof watch through: the job gets easier.', failure: 'The survey story didn’t hold. The job starts on alert.' } },
        abort('roof_abort', 'The crew packs up and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_keycard_locker', districts: null, stats: ['stealth', 'cool'],
    time: '05:40', place: 'a staff locker room at the end of a night shift',
    arrive: 'Before dawn, the crew is in a staff locker room as a night shift changes.',
    crisis: {
      id: 'prep_keycard_locker', stop: true, situations: ['entry'],
      text: 'The guard whose keycard the crew needs hangs his jacket in an open locker, then sits down on the bench beside it to eat his breakfast.',
      choices: [
        { id: 'locker_lift', label: 'Lift the card while he eats', kind: 'push', stat: 'stealth', difficulty: 13, successCost: { dropCrisis: 1 },
          success: '{op} has the card cloned and back in the jacket before the man finishes his bun.',
          failure: 'He turns at the wrong moment. {op} gets away, but he knows someone was at his jacket.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} cloned a keycard: one less problem on the job.', failure: 'The keycard lift was noticed. The job starts on alert.' } },
        { id: 'locker_wait', label: 'Wait for him to shower', kind: 'adapt', stat: 'cool', difficulty: 12, successCost: { dropCrisis: 1 },
          success: '{op} waits out two cigarettes and a long phone call. The card is cloned in the time the water runs.',
          failure: 'The day shift crowds in. {op} gives up and walks out with the rest.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} cloned a keycard: one less problem on the job.', failure: 'The crew waited too long for the keycard. The job starts on alert.' } },
        abort('locker_abort', 'The crew leaves the locker room and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_camera_box', districts: null, stats: ['tech', 'stealth'],
    time: '02:15', place: 'a street camera box on a lamp post',
    arrive: 'At two in the morning, the crew opens the street camera box on the corner.',
    crisis: {
      id: 'prep_camera_box', stop: true, situations: ['entry'],
      text: 'The camera box is newer than the map said. It answers the crew’s splice with a request for a maintenance code.',
      choices: [
        { id: 'camera_loop', label: 'Feed it last night’s footage', kind: 'push', stat: 'tech', difficulty: 13, successCost: { ease: 1 },
          success: '{op} finds last night’s recording in its cache and plays it back to itself. The corner is blind for the job.',
          failure: 'The box logs the attempt and pings a maintenance van. The crew closes it up and goes.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} blinded the street camera: the job gets easier.', failure: 'The camera box logged the splice. The job starts on alert.' } },
        { id: 'camera_cover', label: 'Close it and plan around its view', kind: 'adapt', stat: 'cool', difficulty: 11,
          success: '{op} paces out the camera’s view and marks a way round it. Slower, but clean.',
          failure: 'Nobody can agree on where its view ends. The crew will go in guessing.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} paced a way round the camera.', failure: 'The crew couldn’t map the camera’s view. The job starts on alert.' } },
        abort('camera_abort', 'The crew closes the box and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_tea_contact', districts: null, stats: ['social', 'cool'],
    time: '15:30', place: 'a tea table at the back of a cha chaan teng',
    arrive: 'In the afternoon, the crew meets a contact at a back table over milk tea.',
    crisis: {
      id: 'prep_tea_contact', stop: true, situations: ['threat'],
      text: 'The contact knows the place inside out, and wants twice what was agreed before saying a word about it.',
      choices: [
        { id: 'tea_pay', label: 'Pay what he asks', kind: 'adapt', stat: 'social', difficulty: 10, cost: { payCut: 0.1 }, successCost: { ease: 1 },
          success: '{op} pushes the envelope across. The contact draws the back stairs on a napkin.',
          failure: 'He takes the money and gives them a floor plan from two refits ago.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} paid for a good floor plan: the job gets easier. Pay -10%.', failure: 'The contact sold the crew an old floor plan. The job starts on alert. Pay -10%.' } },
        { id: 'tea_hold', label: 'Hold to the price', kind: 'push', stat: 'cool', difficulty: 13, successCost: { ease: 1 },
          success: '{op} finishes the tea and stands to leave. The contact talks before they reach the door.',
          failure: 'He lets them leave, and makes a phone call as they do.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} held the price and got the floor plan: the job gets easier.', failure: 'The contact walked and made a call. The job starts on alert.' } },
        abort('tea_abort', 'The crew pays for the tea and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_uniform', districts: null, stats: ['social', 'tech'],
    time: '11:00', place: 'a tailor’s stall in a covered market',
    arrive: 'Late morning, the crew is in a tailor’s stall, being measured for uniforms that aren’t theirs.',
    crisis: {
      id: 'prep_uniform', stop: true, situations: ['entry'],
      text: 'The tailor has the cloth, but the badge on the photo is a printed chip. She can sew; she can’t print.',
      choices: [
        { id: 'uniform_badge', label: 'Print the badge chip in the back room', kind: 'push', stat: 'tech', difficulty: 13, successCost: { dropCrisis: 1 },
          success: '{op} borrows her laminator and a blank chip. By evening the uniforms would pass a glance and a scan.',
          failure: 'The chip reads as blank. The uniforms will pass a glance, no more.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} made uniforms that pass a scan: one less problem on the job.', failure: 'The badge chips came out blank. The job starts on alert.' } },
        { id: 'uniform_contact', label: 'Ask who on the row prints badges', kind: 'adapt', stat: 'social', difficulty: 12, cost: { payCut: 0.05 }, successCost: { dropCrisis: 1 },
          success: '{op} gets a name two stalls down. The chips cost more than the cloth, and they work.',
          failure: 'The badge printer two stalls down asks too many questions. The crew walks.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} found a badge printer: one less problem on the job. Pay -5%.', failure: 'The badge printer asked too many questions. The job starts on alert. Pay -5%.' } },
        abort('uniform_abort', 'The crew pays for the fitting and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_tail', districts: null, stats: ['piloting', 'stealth', 'cool'],
    time: '19:45', place: 'the evening traffic on the way back from the place',
    arrive: 'On the way back from a look at the place, a car has been behind the crew for six turns.',
    crisis: {
      id: 'prep_tail', stop: true, situations: ['escape'],
      text: 'The same grey saloon has made every turn the crew has. It might be {law}. It might be someone who wants the same thing.',
      choices: [
        { id: 'tail_lose', label: 'Lose them in the traffic', kind: 'push', stat: 'piloting', difficulty: 13,
          success: '{op} threads a bus lane and a car park ramp. The saloon is gone, and so is whoever was in it.',
          failure: 'The saloon keeps up long enough to see where the crew turns in.',
          failureInjury: 'light', failureCost: { alert: 1 },
          report: { success: '{op} lost the tail.', failure: 'The tail saw where the crew went. The job starts on alert.' } },
        { id: 'tail_walk', label: 'Park and split up on foot', kind: 'adapt', stat: 'stealth', difficulty: 12,
          success: '{op} sends everyone a different way through the market. They meet up an hour later with nobody behind them.',
          failure: 'Someone gets followed onto a tram. They come home the long way round, late and worried.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} split the crew up and lost the tail.', failure: 'One of the crew was followed. The job starts on alert.' } },
        abort('tail_abort', 'The crew drives straight home and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_van', districts: null, stats: ['piloting', 'social'],
    time: '13:20', place: 'a back-street garage with a van for sale',
    arrive: 'After lunch, the crew looks over a van with no questions attached.',
    crisis: {
      id: 'prep_van', stop: true, situations: ['escape'],
      text: 'The van runs. The seller swears it’s clean, but the plate under the new plate says otherwise.',
      choices: [
        { id: 'van_swap', label: 'Swap the plates and the transponder', kind: 'push', stat: 'tech', difficulty: 12, successCost: { ease: 1 },
          success: '{op} has the old transponder out and a dead one in before the seller finishes his cigarette.',
          failure: 'The transponder is wired into the dash. The van will be known to anyone who scans it.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} cleaned up a getaway van: the job gets easier.', failure: 'The van stayed traceable. The job starts on alert.' } },
        { id: 'van_haggle', label: 'Make him find a clean one', kind: 'adapt', stat: 'social', difficulty: 13, successCost: { ease: 1 },
          success: '{op} points at the plate. Twenty minutes later there’s a different van, actually clean.',
          failure: 'He takes offence and the deal’s off. The crew will use what it has.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} got a clean getaway van: the job gets easier.', failure: 'No clean van. The job starts on alert.' } },
        abort('van_abort', 'The crew walks out of the garage and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_guard_drink', districts: null, stats: ['social', 'medical'],
    time: '23:30', place: 'a late bar where the place’s guards drink',
    arrive: 'Near midnight, the crew is in the bar where the place’s guards go after their shift.',
    crisis: {
      id: 'prep_guard_drink', stop: true, situations: ['crowd'],
      text: 'One guard is loud and unhappy about his rota. He’d tell anyone anything; so would anyone listening at the next table.',
      choices: [
        { id: 'drink_buy', label: 'Buy him a round and listen', kind: 'push', stat: 'social', difficulty: 12, successCost: { dropCrisis: 1 },
          success: '{op} gets the rota, the gap in it, and the name of the supervisor who never checks.',
          failure: 'He sobers up enough to ask who’s asking. The crew finishes its drinks and goes.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} got the guards’ rota: one less problem on the job.', failure: 'The guard got suspicious. The job starts on alert.' } },
        { id: 'drink_help', label: 'Get him home when he can’t stand', kind: 'adapt', stat: 'medical', difficulty: 11, successCost: { dropCrisis: 1 },
          success: '{op} walks him to a taxi and keeps him talking all the way. He won’t remember a word of it.',
          failure: 'He’s sick on the kerb and his friends take over. Nothing learned.',
          failureInjury: 'none',
          report: { success: '{op} got the guards’ rota on the walk home: one less problem on the job.', failure: 'The guard’s friends took him home. Nothing learned.' } },
        abort('drink_abort', 'The crew leaves the bar and lets the job go.'),
      ],
    },
  },
  // --- the Docks ---
  {
    id: 'prep_docks_tally', districts: ['docks'], stats: ['social', 'tech'],
    time: '06:50', place: 'the freight counter beside the public weighbridge',
    arrive: 'At the first shift, the crew is at the weighbridge freight counter with a tally clerk who owes someone a favour.',
    crisis: {
      id: 'prep_docks_tally', stop: true, situations: ['threat'],
      text: 'The clerk can put the crew’s van on tonight’s gate list, but a {faction} runner is leaning on the same counter, reading over his shoulder.',
      choices: [
        { id: 'tally_wait', label: 'Wait for the runner to move on', kind: 'adapt', stat: 'cool', difficulty: 12, successCost: { ease: 1 },
          success: '{op} buys a coffee and lets the runner get bored. The van goes on the list with a smudged entry.',
          failure: 'The runner stays, and the clerk loses his nerve.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} got the van on the gate list: the job gets easier.', failure: 'The gate list fell through. The job starts on alert.' } },
        { id: 'tally_terminal', label: 'Add the van from the clerk’s terminal', kind: 'push', stat: 'tech', difficulty: 13, successCost: { ease: 1 },
          success: '{op} leans over to “help with the printer” and types the entry in.',
          failure: 'The terminal wants a supervisor’s thumb. The runner watches the crew leave.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} put the van on the gate list: the job gets easier.', failure: 'The terminal needed a supervisor. The job starts on alert.' } },
        abort('tally_abort', 'The crew leaves the weighbridge and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_docks_crane', districts: ['docks'], stats: ['stealth', 'combat'],
    time: '03:05', place: 'the crane maintenance stairs above the container yard',
    arrive: 'At three in the morning, the crew climbs the crane maintenance stairs for a look over the yard.',
    crisis: {
      id: 'prep_docks_crane', stop: true, situations: ['entry', 'threat'],
      text: 'Two {faction} men are sharing a cigarette on the landing the crew needs, and they’re in no hurry.',
      choices: [
        { id: 'crane_wait', label: 'Wait them out on the stairs below', kind: 'push', stat: 'stealth', difficulty: 12, successCost: { ease: 1 },
          success: '{op} keeps everyone still on the cold steel for twenty minutes. Then the yard is theirs to look at.',
          failure: 'A boot scrapes. The men come down to look and the crew has to go the quick way.',
          failureInjury: 'light', failureCost: { alert: 1 },
          report: { success: '{op} got the crew a look over the yard: the job gets easier.', failure: 'The crew was nearly caught on the crane stairs. The job starts on alert.' } },
        { id: 'crane_move', label: 'Move them on, quietly', kind: 'adapt', stat: 'combat', difficulty: 13, successCost: { ease: 1 },
          success: '{op} walks up as if they belong and says the foreman’s looking for them. They go.',
          failure: 'They don’t go. There’s some shoving before everyone backs off.',
          failureInjury: 'light', failureCost: { alert: 1 },
          report: { success: '{op} cleared the crane landing: the job gets easier.', failure: 'A shoving match on the crane stairs. The job starts on alert.' } },
        abort('crane_abort', 'The crew climbs back down and lets the job go.'),
      ],
    },
  },
  // --- Old Town ---
  {
    id: 'prep_oldtown_mahjong', districts: ['oldTown'], stats: ['social', 'cool'],
    time: '20:40', place: 'a mahjong parlour’s back room on Alley 4',
    arrive: 'In the evening, the crew sits in on a game in a mahjong parlour’s back room, where the right people play.',
    crisis: {
      id: 'prep_oldtown_mahjong', stop: true, situations: ['crowd'],
      text: 'The auntie who runs the table knows what the crew wants to know. She also expects them to lose politely first.',
      choices: [
        { id: 'mahjong_lose', label: 'Lose politely', kind: 'adapt', stat: 'cool', difficulty: 11, cost: { payCut: 0.05 }, successCost: { dropCrisis: 1 },
          success: '{op} loses three hands with good grace. Over the fourth, the auntie tells them what they came for.',
          failure: '{op} loses too obviously. The auntie is insulted and the table goes quiet.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} lost at mahjong and learned what they needed: one less problem on the job. Pay -5%.', failure: 'The mahjong auntie took offence. The job starts on alert. Pay -5%.' } },
        { id: 'mahjong_win', label: 'Play to win and earn her respect', kind: 'push', stat: 'social', difficulty: 14, successCost: { dropCrisis: 1, payCut: -0.05 },
          success: '{op} takes the pot. The auntie laughs, pours tea, and talks.',
          failure: 'The crew wins and the room turns cold. Nobody talks to a winner on Alley 4.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} won at mahjong and the auntie talked: one less problem on the job. Pay +5%.', failure: 'Winning at mahjong turned the room. The job starts on alert.' } },
        abort('mahjong_abort', 'The crew settles up and lets the job go.'),
      ],
    },
  },
  {
    id: 'prep_oldtown_stairwell', districts: ['oldTown'], stats: ['stealth', 'medical'],
    time: '04:20', place: 'Block 9’s stairwell',
    arrive: 'Before dawn, the crew walks the route in through Block 9’s stairwell, floor by floor.',
    crisis: {
      id: 'prep_oldtown_stairwell', stop: true, situations: ['entry', 'injury'],
      text: 'An old man is sitting on the sixth-floor landing in his vest, short of breath and grey in the face. He waves them on.',
      choices: [
        { id: 'stairwell_help', label: 'Stop and see to him', kind: 'adapt', stat: 'medical', difficulty: 12, successCost: { ease: 1 },
          success: '{op} sits him up and gets his tablets from his flat. His daughter, the block’s caretaker, leaves the side door unlocked for them.',
          failure: 'He needs more than the crew can give. Someone calls an ambulance, and the block wakes up.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} helped a neighbour, and the side door was left open: the job gets easier.', failure: 'An ambulance woke the block. The job starts on alert.' } },
        { id: 'stairwell_on', label: 'Do as he says and keep going', kind: 'push', stat: 'stealth', difficulty: 12, successCost: { ease: 1 },
          success: '{op} walks the route to the roof and back without another door opening.',
          failure: 'A door opens on the ninth floor. Someone will remember faces in the stairwell.',
          failureInjury: 'none', failureCost: { alert: 1 },
          report: { success: '{op} walked the route in: the job gets easier.', failure: 'The crew was seen in the stairwell. The job starts on alert.' } },
        abort('stairwell_abort', 'The crew goes back down and lets the job go.'),
      ],
    },
  },
];

/**
 * The last map of a long job with prep stops: the job's day. By the approach chosen at the start (data/approaches.js
 * ids); `any` when the approach has no line of its own.
 */
export const PREP_FINALE = {
  time: 'The day of the job',
  arrive: {
    stealth: 'The prep is done. The crew goes in quietly.',
    tech: 'The prep is done. The crew goes in with the gear ready.',
    loud: 'The prep is done. The crew goes in hard.',
    con: 'The prep is done. The crew goes in with the story ready.',
    any: 'The prep is done. The crew goes in.',
  },
};

export const PREP_HEADING = 'Setting it up';

/** A prep stop's crisis by id (core/mission.js crisisById falls back to it). */
export const prepCrisisById = (id) => PREP_STOPS.find((s) => s.crisis.id === id)?.crisis ?? null;
export const prepStopById = (id) => PREP_STOPS.find((s) => s.id === id) ?? null;
