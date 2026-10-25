// Joss, the crew's bootleg AI (WORLD.md, "Joss"). They/them. A partner and one of the
// crew: says "we", never claims to know more than the screen shows.
// Slots: {amount} {total} {short} {job} {jobs} {count} {name} {role} {names} {subject}.

export const PARTNER = {
  // One line at the top of Today, picked by the day's mood (first match wins in the UI).
  moods: {
    first: [
      'First day. Read my note, then the board. Small work pays rent.',
    ],
    decision: [
      'Something\'s waiting on you. I can\'t sign for us. Legally or otherwise.',
      'There\'s a decision on the pile. I\'ve put it at the top so you can\'t pretend you missed it.',
      'One for you to call. I have opinions, but it\'s your name on it.',
    ],
    broke: [
      'We\'re in the red. I keep refreshing the number. It keeps being true.',
      'Cash is below zero. The crew can count too.',
    ],
    short: [
      'We need money before Sunday. I\'m not saying panic. I\'m saying soon.',
      'Bills on Sunday and we\'re short. I\'ve done the sums three times. They don\'t change.',
      'Rent wants feeding and we can\'t feed it yet. The board\'s where the money is.',
    ],
    hurt: [
      'Not everyone\'s fit today. Pick work that doesn\'t need them.',
      'Someone\'s laid up. I\'ve told them to rest. They listen to me about as well as they listen to you.',
      'We\'re a body short. Plan around it, not through it.',
    ],
    sunday: [
      'Bills are paid. We live another week.',
      'Rent\'s gone out. The landlord said nothing, which is his version of thanks.',
      'Wages are in. Somebody\'s already spent theirs at the Night Market. I\'m not saying who.',
    ],
    monday: [
      'New week. Here\'s what came in overnight, and there\'s fresh work on the board.',
      'Monday. Fresh jobs and fresh gossip. Read the street talk before you pick.',
      'Board\'s been reshuffled overnight. Some of it\'s even worth doing.',
    ],
    quiet: [
      'Quiet one. I\'ll take it.',
      'Nothing on fire. I checked twice.',
      'Board\'s up, crew\'s fed. Your move.',
      'I\'d put the kettle on if I had hands.',
      'All quiet. Somebody burned joss paper on the doorstep again. Doesn\'t hurt.',
    ],
  },

  // Today's alert lines in Joss's voice. Same facts as the plain alert, nothing more.
  alerts: {
    decision: ['{subject}. That one needs you, not me.', '{subject}. Your call, and it can\'t wait.'],
    broke: ['We\'re {amount} in the red. Morale drops every Sunday we stay there.', '{amount} and falling. The crew feels it each Sunday we\'re below zero.'],
    'bills-short': ['Sunday\'s bills are {total}. We\'re {short} short.', 'We owe {total} on Sunday and we\'re {short} short. The board\'s the only fix I know.'],
    'job-last': ['Last day for {job}. Tomorrow it goes to someone else.', '{job} comes off the board after today.'],
    'jobs-last': ['{count} jobs come off the board after today: {jobs}.', 'Last day for {jobs}.'],
    'lead-last': ['{name} the {role} walks tomorrow if we don\'t sign them.', 'Last chance on {name} ({role}). After today they\'ll find another crew.'],
    'crew-out': ['Can\'t work today: {names}. Plan around them.', '{names} sitting this one out. Doctor\'s orders, or mine.'],
  },
};
