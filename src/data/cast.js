// Named characters as data: the narrative voice lives here, so any job can use them.
// In job text, {siu} is the name and {siu:approve} one line from the bank (picked the
// same way every time for a given job and step). Lines are spoken: no quote marks here,
// the job text adds them. Lore and canon checks: WORLD.md.

export const CAST = {
  siu: {
    name: 'Doc Siu',
    district: 'oldTown',
    desc: 'Ex-hospital surgeon who runs an unlicensed clinic under Tenement Block 9. Smokes under the No Smoking sign; her praise is dry and rare.',
    lines: {
      greet: ['Gloves on. If you faint, faint away from the patient.', 'You\'re the new hands? You look it. Wash up.', 'Fung says you\'re clean. Don\'t touch anything I haven\'t told you to.'],
      approve: ['Not bad, new hands.', 'Steady. Good.', 'Crooked as Old Town. It\'ll hold.'],
      disappoint: ['Not everyone has the hands.', 'Hospitals ask questions. I don\'t. That\'s the job.', 'Go home. Sleep. Come back when you\'re useful.'],
    },
  },
  // Clients (dossiers in WORLD.md). Their first lines are their canon briefings.
  rao: {
    name: 'Madam Rao',
    district: 'nightMarket',
    desc: 'Lends money to half the Night Market from a sari shop. Generous until you\'re late.',
    lines: {
      greet: ['I am very generous. On Thursday I will be less generous. Today is Wednesday.', 'Interest is just patience with a price on it, beta.', 'Bring back what they owe. If anyone asks, you were buying silk.'],
      approve: ['Good. You can count. Most people can\'t.', 'You see, beta? Patience, with a price on it.', 'Come back next week. I\'ll have more names.'],
      disappoint: ['Generosity, beta, has a Thursday.', 'I lend money, not second chances. Well. Sometimes second chances.'],
    },
  },
  ferryman: {
    name: 'the Ferryman',
    district: 'docks',
    desc: 'Runs boats in and out of the Docks at night. Nobody has seen him on dry land in years.',
    lines: {
      greet: ['Tide turns at two. Be on the boat at quarter to, or be a swimmer.', 'The harbour doesn\'t care who you are. Neither do I. Load the crates.'],
      approve: ['You kept your eyes open. Good.', 'Same time next tide, if you want it.'],
      disappoint: ['The harbour doesn\'t wait. Neither do I.', 'Swim home, then.'],
    },
  },
  szeto: {
    name: 'Mr. Szeto',
    district: 'heights',
    desc: 'Property developer in Glass Heights. Pays well and on time, and never once asks how you did the job.',
    lines: {
      greet: ['I\'m not paying you to understand the job. I\'m paying you to finish it.', 'In this city, everything old is in the way of something new.'],
      approve: ['Clean. I like clean.', 'My mother used to say the rich can afford to be honest. I\'m working on it.'],
      disappoint: ['I\'ll find someone who finishes things.'],
    },
  },
  okonkwo: {
    name: 'Ruth Okonkwo',
    district: 'heights',
    desc: 'Brokers the work Aether-Harbour Logistics can\'t put its name to. Pays the best and trusts nobody.',
    lines: {
      greet: ['This job doesn\'t exist. Neither do I. The money does.', 'You have six hours and no friends inside. Plan accordingly.', 'I don\'t trust you. That isn\'t personal. It\'s policy.'],
      approve: ['Adequate. That\'s a compliment.', 'You didn\'t exist tonight. Good.'],
      disappoint: ['My department doesn\'t pay for clean-up crews.', 'Noted.'],
    },
  },
  ip: {
    name: 'Mrs. Ip',
    district: 'nightMarket',
    desc: 'Runs the fish-ball stall at the Neon Dragon dai pai dong, talks without stopping, and moves things that aren\'t fish balls.',
    lines: {
      greet: ['Don\'t open it. Don\'t drop it. Don\'t be clever.', 'Heavy? Of course it\'s heavy. Lift with your legs, not your mouth.', 'You\'re late. You\'re not late? Then you\'re lucky.'],
      approve: ['Not dropped! Miracles still happen in this market.', 'Good. Eat these before they go cold.', 'Next week, same time. Don\'t tell anyone.'],
      disappoint: ['Thirty years at this stall. Nobody ever lost a crate before.', 'Go. Go! I\'ll find someone with hands.'],
    },
  },
};
