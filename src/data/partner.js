// Joss, the crew's bootleg AI (WORLD.md, "Joss"). They/them.
// A partner and one of the crew: says "we", never claims to know more
// than the screen shows. Warm, practical and occasionally dry.
// Slots: {amount} {total} {short} {job} {jobs} {count} {name} {role} {names} {subject}.

export const PARTNER = {
  // Why Joss picked who they picked, one line on the squad board (2026-11-05): what each runner
  // covers on this job, by the stat they cover it with. "{name}" is the runner; the overwatch line
  // is for whoever's on the rifle or drone. Short: the line holds up to three of these.
  pickReasons: {
    stealth: '{name} keeps us out of sight',
    tech: '{name} takes the locks and cameras',
    social: '{name} does the talking',
    combat: '{name} handles anyone who won\'t move',
    medical: '{name} keeps us breathing',
    driving: '{name} gets us out',
    cool: '{name} keeps their head when it goes loud',
    overwatch: '{name} watches from up high',
    wheels: '{name} has the van',
  },
  // One line at the top of Today, picked by the day's mood
  // (first match wins in the UI).
  moods: {
    first: [
      'Our first day. There\'s a note from me, then the board. We\'ll start small and find our feet. Figuratively, in my case.',
    ],
    decision: [
      'Something needs your call. Have a look when you\'re ready; we\'ll take it from there.',
      'There\'s a decision waiting for us. You don\'t have to solve the whole week, just this bit.',
      'One for you to decide. I\'ll keep the numbers straight while you think.',
    ],
    broke: [
      'We\'re in the red. Not where we wanted to be, but let\'s work out our next step.',
      'Cash is below zero. We need to take that seriously, one job at a time.',
    ],
    short: [
      'We\'re short for Sunday. We\'ll keep that in mind when we choose the next job.',
      'Bills on Sunday, and we\'re not there yet. Small work still counts.',
      'We need a little more breathing room before Sunday. The board\'s the place to find it.',
    ],
    hurt: [
      'Not everyone\'s fit today. Let\'s give them time and work with who we\'ve got.',
      'Someone needs a rest. I know the bills don\'t take days off. People still need days off.',
      'We\'re short-handed today. We\'ll find work that leaves room for people to recover.',
    ],
    sunday: [
      'Bills paid. Another week with a roof over us. That matters.',
      'Rent\'s paid. I\'d put the kettle on to celebrate, but we\'ve discussed my limitations.',
      'Wages paid, bills settled. It\'s good to have this bit taken care of.',
    ],
    monday: [
      'New week, fresh work on the board. Let\'s have a look before we commit to anything.',
      'Monday. Fresh jobs and street talk. We\'ll see what\'s worth our time.',
      'The board\'s been refreshed. Here\'s to finding something that suits our people.',
    ],
    quiet: [
      'Quiet one. It\'s nice to have a moment, isn\'t it?',
      'Nothing urgent. We don\'t have to turn that into a problem.',
      'Board\'s there when you\'re ready. No need to rush the quiet bit.',
      'I\'d put the kettle on if I had hands. You\'ll have to do our half of that.',
      'Quiet today. Don\'t forget the tea on the doorstep tonight. Some habits are worth keeping.',
    ],
  },

  // Today's alert lines in Joss's voice.
  // Same facts as the plain alert, nothing more.
  alerts: {
    decision: [
      '{subject}. This one needs your call when you\'re ready.',
      '{subject}. One for you to decide; I\'ll keep the details here.',
    ],
    broke: [
      'We\'re {amount} in the red. Morale drops each Sunday we stay below zero. Let\'s keep an eye on it.',
      'We\'re {amount} below zero. Each Sunday there takes a toll on morale. Our people feel it too.',
    ],
    'bills-short': [
      'Sunday\'s bills are {total}. We\'re {short} short. That\'s the gap we need to close.',
      'We need {total} for Sunday, with {short} still to find. We\'ll plan with that in mind.',
    ],
    'job-last': [
      'Last day for {job}. Worth a look before it leaves the board.',
      '{job} comes off the board after today. Time to decide whether it suits us.',
    ],
    'jobs-last': [
      '{count} jobs leave the board after today: {jobs}. Any of them suit us?',
      'Last day for {jobs}. Worth a look, not a reason to rush into the wrong work.',
    ],
    'lead-last': [
      '{name}, the {role}, is only available until today ends. Worth a look if we have room.',
      'Last chance to sign {name} ({role}) today. Let\'s see whether they\'d fit here.',
    ],
    'crew-out': [
      'Unavailable today: {names}. We\'ll plan with the others.',
      '{names} can\'t work today. The rest of us can cover.',
    ],
  },
  // The send-off card (ui/app.js, 2026-11-04): one line as a crew leaves. {job}
  sendOff: [
    'They\'re on their way. I\'ll keep the line open for them.',
    'Off they go to {job}. I\'ll tell you the moment they need us.',
    'Out the door, all of them. I\'ll keep an eye on things from here.',
    'They\'re off. Try not to pace; I\'ll call if anything comes up.',
  ],

  // The back card on Today, by how it went: people first, then the money.
  back: {
    completed: [
      'Everyone\'s home, and paid. Good to have them back.',
      'They\'re back safe, money in. Well done, all of us.',
    ],
    aborted: [
      'They walked away from it, and they\'re all home. That counts.',
      'Back early, everyone in one piece. We\'ll read why together.',
    ],
    setback: [
      'They\'re back. It went badly, but they\'re here. Let\'s check on them.',
    ],
    loss: [
      'Not everyone came home. I\'m here. The rest can wait.',
    ],
  },

  // The first line of a job report, picked by how it went (core/report.js).
  // Only what the report itself shows: no guessing at causes or hidden events.
  reports: {
    clean: [
      'Everyone home, full pay. I was hoping we\'d get a day like this.',
      'Clean work. Nobody hurt, and all the money\'s there. Let\'s enjoy that for a moment.',
      'Full pay, no injuries. Well done, all of us.',
    ],

    // Every roll held; a choice you made cost something.
    // The log says what, so Joss doesn't assume the kind or number of costs.
    spent: [
      'The crew held up their end. We chose to take a cost along the way; the details are in the log.',
      'Every roll held. There was a cost to our choices, but let\'s give the crew their due.',
      'Good work from our people. The log separates what they handled from what we chose to spend.',
    ],

    // A roll failed somewhere.
    // No assumptions about pay, injuries, noise or the kind of cost.
    messy: [
      'Not everything held together. Let\'s read it through and see what we can learn.',
      'A rough one in places. We\'ll go through the details, not just the headline.',
      'Some of it went sideways. We\'ll want to know where before we choose the next job.',
    ],

    aborted: [
      'We pulled out. Time to go through what happened and take stock.',
      'The job stopped here. We can look at the next step after we\'ve read the log.',
      'We walked away from this one. Let\'s understand the call before we judge it.',
    ],

    hurt: [
      'Someone came back hurt. Let\'s check on them before we think about the next job.',
      'An injury on this one. Our people first; the next job can wait a moment.',
    ],

    loss: [
      'We lost someone. I\'m here. We don\'t have to do the rest right now.',
      'Not everyone came home. They were one of us. The rest can wait.',
    ],
  },
};
