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
    desc: 'Runs the fish-ball stall at the Neon Dragon dai pai dong, talks without stopping, and moves things that aren\'t fish balls. Buys her fish at the old pier before dawn, and keeps the tally on Auntie Fung\'s night loads.',
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
  pang: {
    name: 'Pang Man-ki',
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
  // Glass Heights people (WORLD.md, 2026-11-06). Draft lines for the owner to edit.
  chow: {
    name: 'Chow Nga-man',
    district: 'heights',
    desc: 'Veridian-Apex payroll officer in Glass Heights. Three access cards on her lanyard, a lunch container she has not opened, and the patience to explain a payslip line by line, outside office hours.',
    lines: {
      greet: ['If this is about a payslip, bring the payslip.', 'I have ten minutes before someone finds me a new problem.', 'Not here. The Lower Arcade, by the noodle counter.'],
      approve: ['Nobody got blamed for it. That was the whole job.', 'Thank you. I owe you lunch, at least.', 'My father will never admit it, but he will be glad.'],
      disappoint: ['I asked you to keep my name out of it.', 'Now there is a report, and my name is on the second page.'],
    },
  },
  edith: {
    name: 'Edith Pryce',
    district: 'heights',
    desc: 'Morrow & Venn estates administrator at Venn House. An expensive old coat, practical shoes and a clipboard; she asks before opening drawers and gives everyone a copy of what they sign.',
    lines: {
      greet: ['Before we begin, everyone gets a copy of this.', 'Please touch nothing until it has been written down.', 'My client has a claim. A claim is not the same as ownership.'],
      approve: ['Witnessed, signed and nothing broken. Thank you.', 'You treated their things as theirs. That is rarer than you would think.', 'The inventory is clean, and so is my fee note.'],
      disappoint: ['You took the instructions as proof. They were not.', 'Morrow & Venn will not be defending you. Neither will I.'],
    },
  },
  kwok: {
    name: 'Kwok Mei-yee',
    district: 'heights',
    desc: 'Visiting Hang Yuen Systems integration engineer in Glass Heights. A diagnostic kit on her shoulder, relocation boxes still taped shut at home, and a habit of paying local repairers out of her own pocket.',
    lines: {
      greet: ['It failed for a reason. I can tell you the reason over noodles.', 'Off the record, harbour weather is not an unforeseeable event.', 'Once this is company business, there are conditions.'],
      approve: ['Back before the customer visit. You may have saved my trial.', 'Nobody knows it left the building. Good.', 'I will pay you now. My expense claim can take its time.'],
      disappoint: ['That was the demonstration unit, not a crate.', 'My manager will ask who you were, and I will have to answer.'],
    },
  },
  poon: {
    name: 'Poon Hok-yin',
    district: 'heights',
    desc: 'Facilities coordinator for a shared tower in Glass Heights. Too many keys, a handset that rings the moment he sits down, and spare umbrellas he lends the cleaners.',
    lines: {
      greet: ['I can give you a loading slot. Not a building.', 'Use the Service Steps. The lobby cameras remember faces.', 'Be quick, something on the twelfth floor is leaking.'],
      approve: ['In and out inside the slot. I could almost sit down.', 'Nobody on the night shift had to cover for you. Thank you.', 'Take an umbrella. It is going to rain.'],
      disappoint: ['That pass was for the loading bay, not the lifts.', 'I will not risk the night shift for you. Do not ask again.'],
    },
  },
  binta: {
    name: 'Binta Sarr',
    district: 'heights',
    desc: 'Independent overnight courier in Glass Heights. Waits by the Lower Arcade lockers with a folding trolley and a flask wrapped in a towel, and reads the collection terms before she touches a parcel.',
    lines: {
      greet: ['Let me read the terms first. Then we can argue.', 'That deadline is impossible. I can get you close.', 'I carry it. I do not open it, and I do not ask.'],
      approve: ['Signed for, on time, nobody pretending to be anybody. Good.', 'You read the terms. I could get used to that.', 'Dinner at the Late Counter is on me.'],
      disappoint: ['You promised a time you knew we could not make.', 'Find another courier. One who does not read the terms.'],
    },
  },
  // Racing Association contacts (WORLD.md, 2026-11-22, "Association clients"). Greets open
  // with their canon briefings; the rest are draft lines for the owner to edit.
  hui: {
    name: 'Hui Lai-sum',
    district: 'basin',
    desc: 'Racing Association community-services officer. A reused document wallet, a pencil she keeps losing behind her ear, and a working knowledge of which relief centre still has a freezer that holds temperature.',
    lines: {
      greet: ['I need the refrigerators working. You can explain whose fault it was afterwards.', 'They\'ve already filled in the form. Go and see what they need.', 'The grant paid for a repair. I\'d like to see the repair.'],
      approve: ['The meals went out on time. That\'s the report I care about.', 'You asked them what they needed. Thank you.', 'I\'ll come and look at it myself tomorrow, but I believe you.'],
      disappoint: ['A form is finished. A kitchen is not.', 'I won\'t trade residents\' details for anybody\'s favour, including yours.'],
    },
  },
  yip: {
    name: 'Yip Ka-chun',
    district: 'basin',
    desc: 'Racing Association integrity investigator at Lantern Course. Listens without interrupting, then asks the question the briefing avoided; takes a stable hand\'s word as seriously as an owner\'s.',
    lines: {
      greet: ['I didn\'t ask whether he\'s important. I asked who let him through.', 'Bring back what you find. Not what you think will help my case.', 'Mak keeps the stable passes. Start with his list, not your theory.'],
      approve: ['Untouched and in the bag. That will hold up.', 'You noted what didn\'t fit. Most people tidy it away.', 'The horse is fine. That matters more than the case.'],
      disappoint: ['You improved the evidence. Now it\'s worthless.', 'A famous name doesn\'t make it true, and neither does yours.'],
    },
  },
  chan: {
    name: 'Chan Wing-kei',
    district: 'basin',
    desc: 'Racing Association licensing and commercial-protection officer. Courteous, punctual and precise about deadlines; his notices are worth reading.',
    lines: {
      greet: ['They have had three notices and two extensions. Please don\'t mistake their surprise for a lack of warning.', 'You are collecting the equipment listed. If the list is wrong, call me before touching anything.', 'Nobody is to be touched. The equipment is the matter.'],
      approve: ['Collected as listed, with a signature. Thank you.', 'The record is complete. The rest is for the lawyers.', 'You kept to the list. That is all the Association asks.'],
      disappoint: ['That was not on the list, and now it is my problem.', 'Intimidation is not among the services we contract for.'],
    },
  },
  // Clients across the lines (WORLD.md, 2026-11-22): smaller recurring clients inside
  // institutions. Greets open with their canon briefings; the rest are drafts.
  lau: {
    name: 'Lau Ching-yee',
    district: 'heights',
    desc: 'Morrow & Venn marine claims surveyor. Practical shoes, a waterproof document case, and the habit of asking whether anyone was hurt before she asks what the cargo was worth.',
    lines: {
      greet: ['Photograph it before anyone helpfully tidies up.', 'My client has told me what would be convenient. Now I need to know what happened.', 'Who unloaded it, and was anyone hurt?'],
      approve: ['Witnessed, photographed and still where it fell. Thank you.', 'That account matches the damage. Good.', 'Whatever the settlement, the report will be right.'],
      disappoint: ['You told them the claim was settled. It is not.', 'I pay for evidence, not for the answer you thought I wanted.'],
    },
  },
  choi: {
    name: 'Dr. Choi Pui-ling',
    district: 'heights',
    desc: 'Veridian-Apex neural-device aftercare doctor. Rolls her sleeves above the wrist before examining old hardware and explains a repair before she touches anyone.',
    lines: {
      greet: ['It stopped being supported. It did not stop being inside someone.', 'Bring the whole unit. The part you think is rubbish may be the part I need.', 'Tell me who is wearing it before you tell me what it is worth.'],
      approve: ['Complete, and nobody hurt getting it. Thank you.', 'That one can still be made safe. Good.', 'They agreed to see me. That is harder than the retrieval.'],
      disappoint: ['A patient is not a parts bin.', 'You brought half of it. The other half is still in someone\'s neck.'],
    },
  },
  mok: {
    name: 'Mok Wai-lun',
    district: 'oldTown',
    desc: 'Hoi-Sing Grid & Cable restoration coordinator for Old Town. Eats standing beside a dispatch screen, moving repair teams between faults that all became urgent before breakfast.',
    lines: {
      greet: ['You can argue about the account after we stop the wall getting hot.', 'I need access to the meter room. Not a fight outside it.', 'The street floods first at the bottom. Start there.'],
      approve: ['Crew in, fault fixed, nobody shouting. That\'s a good shift.', 'The supplies are back. I can plan the week again.', 'The lights are on. Don\'t ask what the bill says.'],
      disappoint: ['You made a live cupboard somebody else\'s problem.', 'I lost a shift to this. The street loses a night.'],
    },
  },
  kwan: {
    name: 'Kwan Yiu-kit',
    district: 'docks',
    desc: 'Aether-Harbour Logistics subcontractor-accounts clerk. Carries a cheap calculator despite three company devices, and works through a haulier\'s figures with them instead of pointing at the portal.',
    lines: {
      greet: ['The driver delivered it. The system disagrees. Guess which one has been paid.', 'If this reaches my manager before it reaches the review, we have both wasted our money.', 'Bring me the delivery record, not the story about it.'],
      approve: ['The numbers agree now. That almost never happens.', 'The review has it. Good. Don\'t tell me what else you read.', 'They\'ll be paid this month. Thank you.'],
      disappoint: ['I can\'t make an invented delivery real, and neither can you.', 'My manager has your name now. That was the one thing.'],
    },
  },
  lui: {
    name: 'Lui Shuk-ping',
    district: 'docks',
    desc: 'Red Lanterns freight-yard steward. Keeps a folding chair outside a yard office, remembers which drivers have already paid, and dislikes anyone who collects the same toll twice.',
    lines: {
      greet: ['He paid at the gate. If somebody charged him again, bring me the receipt.', 'I said find out whose money it is. Don\'t spend any while you\'re deciding.', 'The yard workers have nothing to do with it. Leave them that way.'],
      approve: ['Receipt, driver and freight, all where they belong.', 'Good. Now the toll gets paid once, to me.', 'You found where it went. I\'ll handle who took it.'],
      disappoint: ['You blocked my road to settle an argument.', 'Working for me doesn\'t cancel what you owe the Lanterns.'],
    },
  },
  cheuk: {
    name: 'Inspector Cheuk Tak-fai',
    district: 'docks',
    desc: 'Harbour Police inspector, 4th Precinct. Turns his handset face down before ordering tea, remembers names, asks after injuries and never offers to put anything important in writing.',
    lines: {
      greet: ['If I could send officers, I wouldn\'t be buying you tea.', 'You haven\'t been hired by the police. Remember that before you try opening a door with my name.', 'Nothing in writing. Drink your tea.'],
      approve: ['It\'s back where it should have been. We never spoke.', 'Quiet, and nobody hurt. Good.', 'I owe you a tea. Don\'t mistake it for anything else.'],
      disappoint: ['You used my name at a door. That was the one thing.', 'My goodwill isn\'t immunity. You\'ve just found out.'],
    },
  },
  // The owner's hall lore (2026-11-07): the Underterrace's contact, named by Claude (WORLD.md "The tong's halls").
  tse: {
    name: 'Forewoman Tse',
    district: 'heights',
    desc: 'Tse Yuk-lan, a former maintenance forewoman who still handles the cooperative\'s keys at the Underterrace, beneath the Glass Heights terraces, and knows which department answers a call about a leaking wall.',
    lines: {
      greet: ['Keep the drains clear. Pay what you agreed.', 'If someone comes asking, you rent the rooms. Don\'t tell them you discovered them.', 'Lift the grille first. Then we can have tea.'],
      approve: ['Drains clear, rent paid. That\'s all I ever ask.', 'We\'ve been here thirty years. You might manage a few.'],
      disappoint: ['Thirty years, and nobody ever blocked that channel before.', 'The cooperative pays the charges. You pay the cooperative. That was the arrangement.'],
    },
  },
};
