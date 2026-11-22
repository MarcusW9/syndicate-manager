// Log lines: job days, generic (any hands-off job). Claude's draft (2026-11-22) for the owner to mark,
// in the JOB DAYS format of docs/log-lines-prompt.md. No job has a job-days file of its own yet, so
// every hands-off job reads these (core/advlog.js jobDayLine). The job's own beats and crises tell the
// night itself; these lines fill the days out. {place} and {contact} come from the district's file
// (src/data/advlog/<district>.js); a line that needs one is skipped where the district has none.
//
// Snags here cost nothing: a hands-off job's costs come from its own rolls, so a job-day snag is a
// small delay or a scare, never money or a wound (the district files' snags, which do cost, wait for
// expeditions, slice 2).
//
// Asides, pair and joss are the personality pools (prompt, "Personality"): the JOB DAYS format had
// none, so this file carries its own until each job has a file.
export default {
  job: 'any',

  casing: {
    any: [
      '{who} spent the day learning the place: who opened up, who locked up, and who was late both times.',
      '{who} walked past the target three times in three different jackets. Nobody looked twice.',
      'The crew counted the doors, then the cameras, then the doors again. The numbers matched.',
      'A day of watching from {place}. {who} has the shift change down to the minute.',
      '{who} sat at {place} with one cup of tea for four hours and a notebook full of times.',
      '{contact}, {contactWhat}, knew the building better than its owners did. {who} listened and paid for lunch.',
      'Casing the place. {who} says the back stairs are the only honest thing about it.',
    ],
    stealth: [
      '{who} went over the back wall after dark, looked, and came out the same way. Nobody the wiser.',
      '{who} followed the night guard on their round and timed every stop, including the one for noodles.',
    ],
    tech: [
      '{who} mapped what was networked in the building from a bench across the road. More than it should be.',
      '{who} listened to the cameras talk to each other for an hour. "They are not well looked after."',
    ],
    social: [
      '{who} got chatting to a cleaner on a smoke break. By the second cigarette, the crew had the rota.',
      '{who} asked {contact} about the place over the counter, casually, three questions spread over an afternoon.',
    ],
  },

  setup: {
    any: [
      'The crew spent the day on the night\'s needs: a van, a spare key, and a back way out nobody watches.',
      '{who} bought rope, tape and a bag of oranges, so the shopping looked like shopping.',
      'Setting up. {who} checked the route out twice and the route in once. "Getting in is never the problem."',
      'A day of small errands. By dusk the crew had everything on the list and one thing that wasn\'t.',
      '{who} left a bag where the night would need it, at {place}. It was still there at closing.',
    ],
    tech: [
      '{who} planted a relay where the building\'s cameras could hear it. It stayed quiet, as it should.',
      '{who} spent the afternoon teaching a cheap lock decoder about one particular lock.',
    ],
    piloting: [
      '{who} drove the route at night time, twice, and found the one junction that never clears.',
      '{who} borrowed a delivery van and drove it round the block until it stopped feeling borrowed.',
    ],
    social: [
      '{who} talked a stallholder into keeping a shutter half up tomorrow night. It cost a promise and some flattery.',
      '{who} found someone with a spare uniform in the right colour. The price was a favour, to be named later.',
    ],
  },

  waiting: {
    any: [
      'The right night hasn\'t come. The crew ate, slept in shifts and watched the weather.',
      'Waiting. {who} has played every card game the crew knows and invented one nobody else can win.',
      'Lying low. The target kept its lights on late, so the crew kept theirs off.',
      'A day of nothing. {who} says this is the part of the job nobody puts in the stories.',
      'Nothing moved. The crew kept their heads down and their phones charged.',
    ],
  },

  snag: {
    any: [
      'A street sweeper parked across the route out all afternoon. {who} found another one.',
      'The guard rota changed without warning. {who} spent the day timing it all over again.',
      'Somebody at {place} started asking who the crew were waiting for. {who} moved on before the answer mattered.',
      'Rain shorted the streetlight the crew were counting on. {who} says the dark is better anyway, and nearly means it.',
      'A delivery came early and blocked the back door for hours. The crew lost the day and kept the plan.',
    ],
  },

  // Personality: one sentence after about one day in three, by {who}'s temperament tags.
  asides: {
    superstitious: [
      '{who} won\'t work from the fourth floor of anything and made sure everyone knew it.',
      '{who} left an orange at a roadside shrine on the way, just in case.',
    ],
    money: [
      '{who} has worked out what the job pays per hour of sitting still, and is not pleased.',
      '{who} haggled the tea seller down by a coin and talked about it all evening.',
    ],
    warm: [
      '{who} came away with a bag of egg tarts and an invitation to somebody\'s birthday.',
      '{who} bought the night guard a coffee. "They looked like they needed it."',
    ],
    hot: [
      '{who} told a taxi driver exactly what they thought of them, in two languages.',
      '{who} kicked a vending machine that kept the coin. It gave up two drinks.',
    ],
    wary: [
      '{who} changed seats twice to keep a wall at their back.',
      '{who} checked the street behind them more than the street in front.',
    ],
    calm: [
      '{who} finished their tea first, as always.',
      '{who} slept through the loudest part of the afternoon and woke up exactly on time.',
    ],
    cold: [
      '{who} said four words all day. Three of them were times.',
      '{who} watched a fight break out across the road without putting down their noodles.',
    ],
    charming: [
      '{who} knew the stall owner\'s name by noon and their life story by two.',
      '{who} got the good table without asking for it.',
    ],
    curious: [
      '{who} read every notice on every board on the street, including the lost cats.',
      '{who} took a radio apart to see why it hummed. It hums less now, and has fewer parts.',
    ],
    chrome: [
      '{who} rebooted an optic twice when the street glare got too much.',
      '{who} spent the wait tuning a wrist implant and humming along to its start-up tone.',
    ],
    haunted: [
      '{who} stood a while at the corner where an old crew used to meet, then came away quiet.',
      '{who} kept an old handset switched on all day. Nobody called it.',
    ],
  },

  // A day about {who} and {other} together (crews of two or more).
  pair: [
    '{who} and {other} argued about the route for an hour. {who} was right, and hasn\'t stopped saying so.',
    '{other} kept watch while {who} worked, then ate both their lunches. The lunch dispute continues.',
    '{who} and {other} took turns sleeping in the van. {other} snores; {who} has a recording.',
    '{who} taught {other} a card game. {other} won every hand after the first, which {who} calls luck.',
  ],

  // Joss at home, reading the day (rarely).
  joss: {
    day: [
      'Joss: "Logged as surveillance. It was mostly noodles."',
      'Joss: "Receipts received. I will be asking about the oranges."',
      'Joss: "Everyone checked in on time. I\'m writing that down because it may not happen again."',
      'Joss: "Quiet day. I like quiet days. Nobody invoices me for quiet days."',
    ],
  },
};
