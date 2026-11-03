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
  // Added from a worldbuilding batch (2026-11-03): Rao's circle and the corporate faces.
  meena: {
    name: 'Meena D\'Sa',
    district: 'nightMarket',
    desc: 'Seamstress and counterkeeper at Madam Rao\'s shop. Measures a jacket without asking you to take it off, and puts your wet coat somewhere safe before asking whether you brought money or trouble.',
    lines: {
      greet: ['Mind the pins, we have already had one expensive misunderstanding today.', 'Madam is occupied, but I can tell you whether this needs her.', 'Put your coat there, the dry chair is for people.'],
      approve: ['You brought everything back, including the bits nobody counted.', 'Good, now somebody gets to wear this instead of argue over it.', 'I have put your things aside, somewhere without a leak.'],
      disappoint: ['You promised quiet and brought an audience.', 'That was somebody\'s good coat, not spare wrapping.'],
    },
  },
  tang: {
    name: 'Tang Wai-chiu',
    district: 'nightMarket',
    desc: 'Silver Fan Circle collector for the third-floor mahjong parlour. Wears a spotless bowling shirt and opens a folding stool before discussing overdue money, then moves it for anyone carrying hot food.',
    lines: {
      greet: ['Sit if you like, standing does not improve the figures.', 'Are we discussing your business or somebody else\'s mistake?', 'Madam Rao has sent people with clean shoes this time.'],
      approve: ['That settles the amount we actually discussed.', 'You kept the stall open, which means next week remains possible.', 'Good, nobody upstairs needs a more interesting version.'],
      disappoint: ['I asked for a receipt, not a street meeting.', 'Now I have to explain why a small debt has witnesses.'],
    },
  },
  tariq: {
    name: 'Uncle Tariq',
    district: 'amberReach',
    desc: 'Keeps the remittance booth at Pearl Haven House, behind a scratched window with three pens clipped to his shirt and a fan aimed at the customers. Reads every receipt aloud, then waits while you check it again.',
    lines: {
      greet: ['Check the name before you check the amount.', 'If Madam sent you, come round the side and stop blocking the queue.', 'The fan is for everyone, you may stand closer.'],
      approve: ['Good, the receipt and the person agree.', 'You let them decide without making them feel foolish.', 'Sit down, I can close five minutes late.'],
      disappoint: ['You said their business where the whole queue could hear.', 'Being in a hurry does not make somebody else\'s money yours.'],
    },
  },
  yip: {
    name: 'Yip Man-ki',
    district: 'heights',
    desc: 'Veridian-Apex clinic administrator in Glass Heights. Wears a pale clinic jacket over an immaculate suit, turns her appointment screen away before you reach the desk, and dims the waiting-room lights when a patient flinches.',
    lines: {
      greet: ['Give me the reference number before you give me the circumstances.', 'This desk handles appointments, not the promises made when the implant was fitted.', 'If you are here for the collection, your names are not required.'],
      approve: ['The discrepancy is closed and your fee is authorised.', 'You followed the collection terms without adding a patient complaint.', 'Leave the envelope there and we need not extend this appointment.'],
      disappoint: ['You have made an internal correction externally visible.', 'Your involvement ends here, whether or not your invoice is settled.'],
    },
  },
  ho: {
    name: 'Ho Sze-lam',
    district: 'oldTown',
    desc: 'Hoi-Sing Grid & Cable field supervisor for Old Town. Arrives in a rain-darkened utility jacket with a numbered seal pouch and a thermos wrapped in electrical tape, and checks the stairwell lighting before opening his work order.',
    lines: {
      greet: ['Which meter, and has anyone touched the seal?', 'Auntie can complain about the bill after I check whether the cupboard is live.', 'Keep the landing clear, I am not carrying this kit up twice.'],
      approve: ['That is the access I asked for, nothing more.', 'The readings match, so we can stop arguing about the handwriting.', 'Your fee covers today, not a standing arrangement.'],
      disappoint: ['You touched a sealed cupboard and made it my report.', 'If this becomes an investigation, you are not my contractors.'],
    },
  },
  mak: {
    name: 'Mak Chi-on',
    district: 'basin',
    desc: 'Lantern Bay Racing Association stable-access official at Lantern Course. Stands beside the stable gate in a pressed Association jacket, checking passes against a paper list despite the scanner on his wrist.',
    lines: {
      greet: ['Names first, purpose second, pockets stay closed.', 'A familiar face still needs a current pass.', 'Lower your voice, the horses have heard enough people today.'],
      approve: ['The record now says what actually happened.', 'You stayed outside the rail and still got your answer.', 'Your temporary access is finished, hand the pass back.'],
      disappoint: ['You turned a missing form into an integrity matter.', 'Whoever sent you can explain this without using my name.'],
    },
  },
};
