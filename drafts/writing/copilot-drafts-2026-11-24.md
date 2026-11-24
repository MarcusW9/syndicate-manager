# Alternative game wording — 2026-11-24

Drafts only. Each table gives the current in-game wording and a proposed replacement. Array keys are zero-based; line numbers refer to the current source, not this draft. Braced slots are kept verbatim. Existing people and named places are not renamed.

## 1. Security posts

I would keep **Guard**, **Escort** and **Watch**: they scan quickly as a set. Optional labels are listed with the blurbs. The quiet, good, rough and incident lines stay in their own pools.

### `src/data/contracts.js`

| Line · key | Current | Alternative |
| --- | --- | --- |
| 20 · `guard.name` | Guard | Door Guard |
| 23 · `guard.blurb` | Keep a door. Look like trouble so trouble goes elsewhere. | Keep a door for the client. A quiet shift is a good shift. |
| 25 · `guard.posts[0]` | Stand the back door of {client}'s place in {district} for the week. | Keep watch at {client}'s back door in {district} for a week. |
| 26 · `guard.posts[1]` | Keep the stairwell at {client}'s stockroom in {district} clear of visitors. | Keep visitors off the stairs to {client}'s stockroom in {district}. |
| 27 · `guard.posts[2]` | Sit on {client}'s loading bay in {district} until the shipment is counted. | Watch {client}'s loading bay in {district} while they count the shipment. |
| 30 · `guard.quiet[0]` | {who} kept the door. Nobody tried it. | {who} stood at the door all shift. Nobody gave them a reason to move. |
| 31 · `guard.quiet[1]` | A long night on the post. Rain, noodles, nothing else. | The noodles went cold before the rain stopped. Nothing else to report. |
| 32 · `guard.quiet[2]` | {who} turned away two drunks and a man selling umbrellas. | {who} sent two drunks on their way and turned down an umbrella seller. |
| 33 · `guard.quiet[3]` | Deliveries came and went. {who} checked every one. | {who} checked off the last delivery just as the shift ended. |
| 36 · `guard.good[0]` | {who} spotted a lookout across the street and stared until he left. {client} saw it. | {who} picked out the lookout across the road. They left as soon as they realised they'd been seen, and {client} caught the whole thing. |
| 37 · `guard.good[1]` | A regular slipped {who} a tip for keeping the street calm. | A regular thanked {who} for the quiet night and left a little cash. |
| 40 · `guard.rough[0]` | Someone tested the door at three in the morning. {who} took a knock sending them off. | Someone tried the door well after closing. {who} sent them away but took a knock for it. |
| 41 · `guard.rough[1]` | A shouting match on the step turned into a shove. {who} ended it, not gently. | An argument on the step got physical. {who} broke it up, and nobody left happy. |
| 43 · `guard.incident` | {n} people came at the door together, and they did not come to talk. {who} is holding it and calling it in. | {n} people rushed the door. {who} is still holding it and wants an answer from us. |
| 46 · `escort.name` | Escort | Safe Passage |
| 49 · `escort.blurb` | Get someone or something across the city in one piece. | See a person or a package safely to the other end of the trip. |
| 51 · `escort.posts[0]` | Walk {client}'s courier and a sealed case across {district} and back. | Go with {client}'s courier and their sealed case across {district}, then bring both back. |
| 52 · `escort.posts[1]` | Drive {client}'s cousin to three meetings in {district} without anyone following. | Take {client}'s cousin to three meetings in {district}. Make sure nobody follows. |
| 53 · `escort.posts[2]` | Move a crate for {client} through {district} on the quiet roads. | Take a crate through {district} for {client}. Stick to quiet roads. |
| 56 · `escort.quiet[0]` | The route was clean. {who} took the long way twice to be sure. | {who} allowed extra time both ways. There was no trouble on either trip. |
| 57 · `escort.quiet[1]` | A slow day of waiting outside meetings. Nothing followed them home. | Most of the shift was spent waiting for meetings to finish. Nobody followed them back. |
| 58 · `escort.quiet[2]` | {who} changed cars at the halfway point. Nobody noticed. | {who} swapped cars halfway through the run. It didn't draw a look. |
| 61 · `escort.good[0]` | {who} found a shortcut through a car park nobody watches. {client} was impressed. | {who} spotted a shorter route and got there with time to spare. {client} thanked them for it. |
| 62 · `escort.good[1]` | The package arrived early, and {client} rounded up the fee. | The package made it ahead of schedule. {client} paid a little extra. |
| 65 · `escort.rough[0]` | A bike tailed them for six blocks. {who} lost it, and clipped a kerb doing it. | A bike followed for six blocks. {who} shook it, but the car came back with a scraped wheel. |
| 66 · `escort.rough[1]` | A checkpoint went up on the route. {who} talked them through it, but the street noticed. | {who} got the crew past an unexpected checkpoint, but not without attracting attention. |
| 68 · `escort.incident` | A van boxed them in at a junction, {n} doors opening at once. {who} has the package and is calling it in. | A van has them boxed in and {n} people are getting out. {who} still has the package and is calling us. |
| 71 · `watch.name` | Watch | Keep the Peace |
| 74 · `watch.blurb` | Mind a stall row on market nights. Keep the peace, keep it friendly. | Walk the row and settle arguments before they spoil the night. |
| 76 · `watch.posts[0]` | Mind {client}'s stall row in {district} on market nights this week. | Keep an eye on {client}'s stalls in {district} on market nights this week. |
| 77 · `watch.posts[1]` | Keep the peace at {client}'s mahjong hall in {district} until the tournament ends. | Stay at {client}'s mahjong hall in {district} through the tournament and keep things civil. |
| 78 · `watch.posts[2]` | Walk the arcade in {district} for {client}, and settle arguments before they cost anyone a window. | Patrol the arcade in {district} for {client}. Talk people down before anything gets broken. |
| 81 · `watch.quiet[0]` | {who} walked the row, bought skewers and settled a dispute about a dog. | {who} did the rounds with a skewer in hand. The only argument all night was over whose dog it was. |
| 82 · `watch.quiet[1]` | A busy night, a good-natured crowd. {who} barely had to speak. | There was barely room to walk. {who} still didn't have to raise their voice. |
| 83 · `watch.quiet[2]` | Two stallholders argued about a pitch. {who} split it down the middle. | Two stallholders wanted the same spot. {who} got them to share it. |
| 86 · `watch.good[0]` | {who} heard where a rival crew drinks. It is worth knowing, and {client} paid for it. | {who} heard which place a rival crew drinks at. {client} thought it was worth paying to know. |
| 87 · `watch.good[1]` | The stallholders chipped in for {who} at the end of the night. | At closing, the stallholders passed a hat for {who}. |
| 90 · `watch.rough[0]` | A pickpocket ran and {who} followed. The chase went badly. | {who} went after a pickpocket and came back empty-handed. |
| 91 · `watch.rough[1]` | A protection crew from the next street came by to see who was in charge. {who} was, just. | A protection crew from the next street put {who} on the spot. They backed off, but only just. |
| 93 · `watch.incident` | {n} people from another crew have taken over the row and are collecting from the stalls. {who} is watching and calling it in. | {n} people from another crew are going stall to stall demanding money. {who} has called it in and is keeping watch. |
| 99 · `INCIDENT_LINES.held` | They held. The others backed off, and {client} heard who stood their ground. | The crew kept the post. The others left, and {client} knows who held it. |
| 100 · `INCIDENT_LINES.lost` | They could not hold it. {who} came home hurt and the post is gone. | The post is lost. {who} came back hurt. |
| 101 · `INCIDENT_LINES.gaveUp` | They gave it up and walked away. Everyone came home; {client} is not pleased. | Everyone got home after leaving the post. {client} isn't happy about it. |

## 2. Job-day and side-day logs

Job-day snags are delays or scares only. Side-day lines report what the crew did, not whether the task worked.

### `src/data/advlog/jobDays.js`

| Line · key | Current | Alternative |
| --- | --- | --- |
| 18 · `casing.any[0]` | {who} spent the day learning the place: who opened up, who locked up, and who was late both times. | {who} noted the opening and closing times. The same person kept everyone waiting at both ends. |
| 19 · `casing.any[1]` | {who} walked past the target three times in three different jackets. Nobody looked twice. | {who} passed the place at different times of day. Nobody took much interest. |
| 20 · `casing.any[2]` | The crew counted the doors, then the cameras, then the doors again. The numbers matched. | The crew did another walk past the building to make sure they hadn't missed a door or a camera. |
| 21 · `casing.any[3]` | A day of watching from {place}. {who} has the shift change down to the minute. | From {place}, {who} watched long enough to see one shift hand over to the next. |
| 22 · `casing.any[4]` | {who} sat at {place} with one cup of tea for four hours and a notebook full of times. | {who} made one cup of tea last all afternoon at {place}. The notebook filled faster. |
| 23 · `casing.any[5]` | {contact}, {contactWhat}, knew the building better than its owners did. {who} listened and paid for lunch. | {contact}, {contactWhat}, went over the building room by room. {who} took notes and picked up lunch. |
| 24 · `casing.any[6]` | Casing the place. {who} says the back stairs are the only honest thing about it. | {who} came back with a good look at the building and a low opinion of its upkeep. |
| 27 · `casing.stealth[0]` | {who} went over the back wall after dark, looked, and came out the same way. Nobody the wiser. | {who} slipped out of sight long enough to get a closer look. Nobody came over to check. |
| 28 · `casing.stealth[1]` | {who} followed the night guard on their round and timed every stop, including the one for noodles. | {who} watched a full round without being seen. The longest stop was for noodles. |
| 31 · `casing.tech[0]` | {who} mapped what was networked in the building from a bench across the road. More than it should be. | {who} spent the afternoon on the deck. Half the notes start with “Why is this online?” |
| 32 · `casing.tech[1]` | {who} listened to the cameras talk to each other for an hour. "They are not well looked after." | {who} took a look at the camera feed. “I'd ask for my money back.” |
| 35 · `casing.social[0]` | {who} got chatting to a cleaner on a smoke break. By the second cigarette, the crew had the rota. | {who} went out for a smoke and came back with a cleaner's account of who works when. |
| 36 · `casing.social[1]` | {who} asked {contact} about the place over the counter, casually, three questions spread over an afternoon. | {who} spent the afternoon talking to {contact}. The talk kept coming back to the building. |
| 42 · `setup.any[0]` | The crew spent the day on the night's needs: a van, a spare key, and a back way out nobody watches. | By evening the crew had the keys, the van and a place to meet if they got split up. |
| 43 · `setup.any[1]` | {who} bought rope, tape and a bag of oranges, so the shopping looked like shopping. | {who} came back with the supplies and a bag of oranges. The oranges didn't last the afternoon. |
| 44 · `setup.any[2]` | Setting up. {who} checked the route out twice and the route in once. "Getting in is never the problem." | {who} went over the plan again. Most of the notes were about getting home. |
| 45 · `setup.any[3]` | A day of small errands. By dusk the crew had everything on the list and one thing that wasn't. | The crew crossed the last errand off at dusk. There was still one unlabelled bag on the table. |
| 46 · `setup.any[4]` | {who} left a bag where the night would need it, at {place}. It was still there at closing. | {who} dropped the kit at {place} and checked on it at closing time. |
| 49 · `setup.tech[0]` | {who} planted a relay where the building's cameras could hear it. It stayed quiet, as it should. | {who} spent the afternoon getting the deck ready. It finally stopped giving warnings at dusk. |
| 50 · `setup.tech[1]` | {who} spent the afternoon teaching a cheap lock decoder about one particular lock. | {who} checked the lock decoder again. It was cheap enough to merit a second look. |
| 53 · `setup.piloting[0]` | {who} drove the route at night time, twice, and found the one junction that never clears. | {who} took the van out after dark. The traffic at one junction was as bad as it was at noon. |
| 54 · `setup.piloting[1]` | {who} borrowed a delivery van and drove it round the block until it stopped feeling borrowed. | {who} took the borrowed van round the block a few times to get used to the brakes. |
| 57 · `setup.social[0]` | {who} talked a stallholder into keeping a shutter half up tomorrow night. It cost a promise and some flattery. | {who} spent the afternoon talking the arrangement through with a stallholder. The favour will have to be returned. |
| 58 · `setup.social[1]` | {who} found someone with a spare uniform in the right colour. The price was a favour, to be named later. | {who} asked around until someone offered to lend the right uniform. They'll name their favour later. |
| 64 · `waiting.any[0]` | The right night hasn't come. The crew ate, slept in shifts and watched the weather. | Still too early to move. The crew split the watch and tried to get some sleep. |
| 65 · `waiting.any[1]` | Waiting. {who} has played every card game the crew knows and invented one nobody else can win. | {who} dealt another hand. The rules have changed twice since breakfast. |
| 66 · `waiting.any[2]` | Lying low. The target kept its lights on late, so the crew kept theirs off. | The lights across the road stayed on. The crew waited in the dark. |
| 67 · `waiting.any[3]` | A day of nothing. {who} says this is the part of the job nobody puts in the stories. | {who} says they'd tell us what happened today if anything had. |
| 68 · `waiting.any[4]` | Nothing moved. The crew kept their heads down and their phones charged. | Still waiting for the word to move. At least the phones are charged. |
| 74 · `snag.any[0]` | A street sweeper parked across the route out all afternoon. {who} found another one. | A street sweeper sat in the way most of the day. {who} checked a different route. |
| 75 · `snag.any[1]` | The guard rota changed without warning. {who} spent the day timing it all over again. | A different guard turned up. {who} had to start the watch over. |
| 76 · `snag.any[2]` | Somebody at {place} started asking who the crew were waiting for. {who} moved on before the answer mattered. | Someone at {place} took a little too much interest. {who} called it a day there. |
| 77 · `snag.any[3]` | Rain shorted the streetlight the crew were counting on. {who} says the dark is better anyway, and nearly means it. | The streetlight went out in the rain. {who} needed a while to get their bearings again. |
| 78 · `snag.any[4]` | A delivery came early and blocked the back door for hours. The crew lost the day and kept the plan. | An early delivery held them up until closing. Nothing has to change except the time. |
| 85 · `asides.superstitious[0]` | {who} won't work from the fourth floor of anything and made sure everyone knew it. | {who} counted the floors and asked to wait on any floor but the fourth. |
| 86 · `asides.superstitious[1]` | {who} left an orange at a roadside shrine on the way, just in case. | {who} took the extra minute to leave an orange at the shrine. |
| 89 · `asides.money[0]` | {who} has worked out what the job pays per hour of sitting still, and is not pleased. | {who} divided the fee by the hours spent waiting and wished they hadn't. |
| 90 · `asides.money[1]` | {who} haggled the tea seller down by a coin and talked about it all evening. | {who} talked a coin off the price of tea and brought it up at dinner. |
| 93 · `asides.warm[0]` | {who} came away with a bag of egg tarts and an invitation to somebody's birthday. | {who} saved the last egg tart for whoever was on watch. |
| 94 · `asides.warm[1]` | {who} bought the night guard a coffee. "They looked like they needed it." | {who} brought the night guard coffee without asking for anything. |
| 97 · `asides.hot[0]` | {who} told a taxi driver exactly what they thought of them, in two languages. | {who} was still arguing with the taxi after it had pulled away. |
| 98 · `asides.hot[1]` | {who} kicked a vending machine that kept the coin. It gave up two drinks. | {who} took a vending machine keeping their change personally. |
| 101 · `asides.wary[0]` | {who} changed seats twice to keep a wall at their back. | {who} tried two seats before finding one they liked, with nobody behind it. |
| 102 · `asides.wary[1]` | {who} checked the street behind them more than the street in front. | {who} looked back at every corner, even on the way to lunch. |
| 105 · `asides.calm[0]` | {who} finished their tea first, as always. | {who} waited for the tea to cool before getting up. |
| 106 · `asides.calm[1]` | {who} slept through the loudest part of the afternoon and woke up exactly on time. | {who} took a nap through the afternoon noise and woke when it was their turn. |
| 109 · `asides.cold[0]` | {who} said four words all day. Three of them were times. | {who} gave the crew the times and nothing else. |
| 110 · `asides.cold[1]` | {who} watched a fight break out across the road without putting down their noodles. | Shouting broke out across the road; {who} kept eating. |
| 113 · `asides.charming[0]` | {who} knew the stall owner's name by noon and their life story by two. | {who} stopped to buy tea and ended up hearing all about the stallholder's week. |
| 114 · `asides.charming[1]` | {who} got the good table without asking for it. | {who} got a seat at the good table before they'd finished saying hello. |
| 117 · `asides.curious[0]` | {who} read every notice on every board on the street, including the lost cats. | {who} stopped at every noticeboard, even the one with nothing but lost-cat posters. |
| 118 · `asides.curious[1]` | {who} took a radio apart to see why it hummed. It hums less now, and has fewer parts. | {who} wanted to know why the radio hummed; there are still two screws on the table. |
| 121 · `asides.chrome[0]` | {who} rebooted an optic twice when the street glare got too much. | {who} blinked through another optic restart when the glare came back. |
| 122 · `asides.chrome[1]` | {who} spent the wait tuning a wrist implant and humming along to its start-up tone. | {who} spent the quiet stretch fussing with a wrist implant. |
| 125 · `asides.haunted[0]` | {who} stood a while at the corner where an old crew used to meet, then came away quiet. | {who} took a minute at the old meeting spot and didn't say what for. |
| 126 · `asides.haunted[1]` | {who} kept an old handset switched on all day. Nobody called it. | {who} kept checking an old handset that hadn't rung once. |
| 132 · `pair[0]` | {who} and {other} argued about the route for an hour. {who} was right, and hasn't stopped saying so. | {who} and {other} argued over the map until the van came round. {who} was still pointing at the right turn. |
| 133 · `pair[1]` | {other} kept watch while {who} worked, then ate both their lunches. The lunch dispute continues. | {other} covered the watch for {who} and helped themself to the spare lunch. It wasn't spare. |
| 134 · `pair[2]` | {who} and {other} took turns sleeping in the van. {other} snores; {who} has a recording. | {who} let {other} sleep in the van first. {other} denies snoring, and {who} has offered to play the recording. |
| 135 · `pair[3]` | {who} taught {other} a card game. {other} won every hand after the first, which {who} calls luck. | {who} showed {other} how to play. {other} hasn't lost since, and {who} would like the cards back. |
| 141 · `joss.day[0]` | Joss: "Logged as surveillance. It was mostly noodles." | Joss: “I've filed it under watching the site, not under lunch.” |
| 142 · `joss.day[1]` | Joss: "Receipts received. I will be asking about the oranges." | Joss: “I've got the receipts. Which part of the job needed oranges?” |
| 143 · `joss.day[2]` | Joss: "Everyone checked in on time. I'm writing that down because it may not happen again." | Joss: “Everyone checked in on time. That made my evening easier.” |
| 144 · `joss.day[3]` | Joss: "Quiet day. I like quiet days. Nobody invoices me for quiet days." | Joss: “Nothing new on the board. We can live with that.” |

### `src/data/advlog/sideDays.js`

| Line · key | Current | Alternative |
| --- | --- | --- |
| 8 · `money[0]` | {who} worked the shift and kept count of every hour. "Every single one." | {who} noted the start of the shift and kept an eye on the clock. |
| 9 · `money[1]` | A long day on someone else's clock. {who} says the tea was free, at least. | {who} had tea on the break, then went back for the rest of the shift. |
| 10 · `money[2]` | {who} put in the hours at {place}. Nobody complained, which counts as praise there. | {who} spent the shift at {place}, with a short break to eat. |
| 13 · `training[0]` | {who} did it again, slower, then again, faster. By evening it was starting to stick. | {who} spent the afternoon repeating the same exercise at different speeds. |
| 14 · `training[1]` | A day of practice. {who} got it wrong in new and more useful ways. | {who} is working through the drills one at a time today. |
| 15 · `training[2]` | {who} kept at it until the person teaching them ran out of corrections. | {who} took a drink of water between drills and went straight back to practice. |
| 18 · `trust[0]` | {who} ran the errands without being asked twice. The client noticed, and said nothing, which is a good sign. | {who} checked in with the client and took the next errand on the list. |
| 19 · `trust[1]` | {who} turned up early and left late. Somebody important was keeping count. | {who} got there early to hear what the client needed that day. |
| 20 · `trust[2]` | A day of small favours. {who} remembered everyone's name and nobody's gossip. | {who} spent the day making introductions and running small errands. |
| 23 · `info[0]` | {who} watched from {place} and wrote down everything that moved. | {who} took a seat at {place} with a notebook and stayed through the afternoon. |
| 24 · `info[1]` | A day of listening. {who} has a page of notes and a feeling about two of them. | {who} spent the day listening, with a page left blank for tomorrow. |
| 25 · `info[2]` | {who} asked one careful question an hour, all day, at different counters. | {who} made the rounds of the counters, asking a little at each one. |
| 28 · `any[0]` | Another day down. {who} says the next one is the hard part. | {who} checked in at dusk. They're due back out tomorrow. |
| 29 · `any[1]` | {who} got through the day without anybody asking who sent them. | {who} took a meal break and went back to work. |

## 3. Expeditions and adventure logs

### `src/data/expeditions.js`

| Line · key | Current | Alternative |
| --- | --- | --- |
| 10 · `weapon.name` | A weapon | Weapon search |
| 11 · `weapon.pitch` | Find someone selling a good piece, and get it off them: buy, trade or lift. | Follow up on a good weapon. The crew can buy it, trade for it or bring it back without a deal. |
| 12 · `weapon.met` | a Custom or Premium weapon | a weapon of Custom or Premium quality |
| 12 · `weapon.partial` | a lesser piece | a lower-grade weapon |
| 12 · `weapon.failed` | only what turns up on the way | whatever the crew happens to find |
| 15 · `cash.name` | Cash | Cash run |
| 16 · `cash.pitch` | An old debt, a stash or a skim: small-time money owed or lying about, brought home. | Follow up on a small sum: an unpaid debt, a stash or a cut nobody has collected. |
| 17 · `cash.met` | the whole sum | the full amount |
| 17 · `cash.partial` | half of it | half the sum |
| 17 · `cash.failed` | only what turns up on the way | anything the crew happens to pick up |
| 20 · `recruit.name` | A recruit | Recruit search |
| 21 · `recruit.pitch` | Someone good is said to be looking for a crew. Find them and get a conversation. | Word is an experienced runner might be open to a move. Find out if they're willing to talk. |
| 22 · `recruit.met` | a seasoned runner willing to meet you (in Crew › Leads) | an experienced runner open to a meeting (in Crew › Leads) |
| 22 · `recruit.partial` | a rookie's name instead | the name of a rookie instead |
| 22 · `recruit.failed` | only what turns up on the way | anything else the crew finds on the trip |

### `src/data/advlog/weapon.js`

| Line | Current | Alternative |
| --- | --- | --- |
| 10 | {contact}, {contactWhat}, had heard about {itemFull} changing hands somewhere in {district}. {who} went to ask what they knew. | {who} took the rumour to {contact}, {contactWhat}, who'd heard about a sale involving {itemFull} in {district}. |
| 11 | A name attached to {itemFull} led {who} to {place}. Somebody there had seen it recently. | {who} had a name to go with {itemFull} and took it to {place}. Someone there remembered seeing the piece not long ago. |
| 12 | {who} picked up word that {itemFull} was for sale around {place}. The seller wasn't advertising. | Near {place}, {who} heard about a seller with {itemFull}. There was no advert to answer. |
| 13 | Someone had been asking after ammunition for {itemFull}. {who} traced the question back to {contact}, {contactWhat}. | A question about ammunition for {itemFull} reached {who}, who found out it had come from {contact}, {contactWhat}. |
| 14 | {contact}, {contactWhat}, knew somebody trying to move {itemFull} without drawing attention. {who} went looking for the introduction. | Someone wanted a quiet sale for {itemFull}, and {contact}, {contactWhat}, knew who it was. {who} went to ask for a meeting. |
| 15 | A repair receipt led {who} to {place}. Somebody there had recently worked on {itemFull}. | {who} took a repair receipt to {place} and found someone who'd had {itemFull} on the bench not long ago. |
| 16 | {who} started at {place}, where a seller had been showing off {itemFull}. Nobody remembered the asking price the same way. | At {place}, {who} found people who'd been shown {itemFull}. Ask three people the price and you'd get three answers. |
| 17 | The hunt began with {contact}, {contactWhat}, who knew somebody selling {itemFull} to cover a debt. | {contact}, {contactWhat}, gave us our first lead: a seller looking to pay off a debt with {itemFull}. |
| 18 | Someone had left a case at {place} and stopped paying for storage. The description sounded like {itemFull}. | The storage bill on a case at {place} had stopped getting paid. From the description, it might hold {itemFull}. |
| 19 | Word about {itemFull} came through {contact}, {contactWhat}. The introduction cost lunch, paid in advance. | {contact}, {contactWhat}, could introduce us to someone who knew about {itemFull}. Lunch was the fee, and we had to buy it first. |
| 22 | {who} bought {contact}, {contactWhat}, a meal and asked about {itemFull}. The answer came after the bowls were cleared. | {contact}, {contactWhat}, let {who} buy lunch. They waited until the bowls were gone to answer the question about {itemFull}. |
| 23 | A few careful questions got {who} pointed towards {place}. Someone there knew who had {itemFull}. | {who} asked around without making a fuss and got sent to {place}, where somebody knew who had {itemFull}. |
| 26 | {who} followed a sale notice for {itemFull} that had been scrubbed from the local boards. It pointed towards {place}. | The notice for {itemFull} was gone from the local boards, but {who} had enough of it to start at {place}. |
| 27 | A parts listing for {itemFull} was still sitting in an old message cache. {who} traced it back to {contact}, {contactWhat}. | {who} found an old message about parts for {itemFull}. It gave us a name to start with: {contact}, {contactWhat}. |
| 30 | {who} watched {place} until somebody arrived carrying a case about the right size for {itemFull}. | A case about the right size for {itemFull} showed up at {place} while {who} was watching. |
| 31 | Word said {itemFull} was being kept near {place}. {who} went over quietly to see who came and went. | {who} took a quiet look at who was going in and out near {place}. Word was somebody kept {itemFull} close by. |
| 37 | A seller had moved on, but left a number behind. {who} got enough from it to keep looking. | The seller was gone, but the number they left gave {who} something to go on. |
| 38 | The trail crossed a noodle counter and two people who wanted cash before talking. {who} came away with a better address. | After a stop at a noodle counter and two conversations that started with a request for cash, {who} got a better address. |
| 39 | Somebody remembered the case {item} travelled in. {who} followed the description to another part of {district}. | Someone recalled the case that held {item}. Their description took {who} to a different part of {district}. |
| 40 | {who} found somebody who had handled {item} recently. They remembered where it went next. | Someone who'd handled {item} told {who} where it had gone from there. |
| 41 | A rumour about {item} turned out to have a real seller behind it. The price was still unclear. | There was a real seller behind the talk about {item}; we still didn't have a firm price. |
| 42 | A repair bill put {item} in {district} recently. {who} found where the work had been done. | {who} used a recent bill for work on {item} to identify the shop in {district}. |
| 43 | The case had a broken catch repaired with red cord. Somebody remembered carrying it upstairs. | The red cord on the broken catch was what someone remembered. They'd carried that case upstairs themselves. |
| 44 | The asking price had dropped twice. Whoever held it was running short of time. | Whoever had it had lowered the price twice. It sounded like they needed a sale soon. |
| 45 | The trail crossed two counters and a wet stairwell. At the top, somebody had actually seen {item}. | Two counters and a damp flight of stairs later, we found someone who'd seen {item} in person. |
| 46 | Someone had been trying to sell the accessories separately. The crew got a name from the packaging. | The accessories were up for sale on their own. There was a name on the packaging. |
| 49 | {who} found somebody who had seen {item} used in a back-room match. The owner had been taking offers afterwards. | A regular at a back-room match told {who} they'd seen {item} there. The owner had listened to offers after the match. |
| 50 | A bruised door guard recognised the description. {who} got a place and a name without adding to the bruises. | The door guard had bruises and knew the piece from our description. {who} got a name and an address just by asking. |
| 51 | A seller swore {item} had never been used. {who} pointed out the wear and got a more honest introduction. | {who} knew from the wear that {item} wasn't unused. The seller dropped the story and sent us to someone who knew the piece. |
| 54 | {who} followed the suspected seller for three blocks and watched where the case was left. | {who} kept the suspected seller in sight for three blocks and saw where they left the case. |
| 55 | A quiet look through an unattended storeroom turned up packing material for {item}. Whoever moved it hadn't gone far. | The storeroom was empty except for packing from {item}. The piece had been moved, but not far. |
| 56 | {who} watched a hand-off from across the street. The case changed hands, and now the crew knew who had it. | From across the street, {who} saw the case change hands. We knew who had it now. |
| 59 | {who} pulled a partial serial from an old repair record. It matched {item} and gave the crew another name to chase. | An incomplete serial in an old repair record was enough for {who} to link it to {item}. The record gave us another name. |
| 60 | A deleted sale message still had routing data attached. {who} followed it to the next lead. | The sale message was gone, but {who} found a detail in the record that gave us somewhere else to ask. |
| 61 | {who} found a recent diagnostic record for {item}. Somebody had paid to make sure it still worked. | A recent diagnostic for {item} turned up in {who}'s search. Someone had paid for a check to see if it still worked. |
| 64 | {who} let the conversation wander until somebody mentioned {item} without being asked. That gave the crew somewhere useful to look. | {who} kept the conversation going until someone brought up {item} on their own. We left knowing where to look next. |
| 65 | A seller wanted reassurance before giving up a name. {who} talked long enough to get it. | The seller needed to know who they were dealing with. {who} talked it through and came away with a name. |
| 66 | A seller wanted reassurance first. {who} sat through photos of all forty grandchildren and got a name. | The seller took some warming up, so {who} looked at photos of all forty grandchildren. Then we got a name. |
| 67 | A seller wanted reassurance first. {who}: "I know more about her divorce than her lawyer does. But we have a name." | The seller needed some reassurance, and {who} listened long enough to earn a name: "If you need to know about the divorce, I've got the whole thing." |
| 68 | {who} traded a small favour for a better introduction. The next person had actually seen {item}. | A small favour from {who} got us introduced to someone who'd seen {item} for themselves. |
| 69 | The owner of a borrowed trolley remembered exactly who had failed to return it. The case had gone with them. | The trolley never came back, so its owner hadn't forgotten who borrowed it. That was the person who'd taken the case. |
| 72 | {who} followed a delivery van through {district} until it stopped somewhere that matched the rumour. | {who} stayed behind a delivery van across {district}. Where it stopped fit what we'd heard. |
| 73 | A courier remembered moving a case like the one {item} travels in. {who} retraced the route and found where it had been dropped. | A courier recalled carrying a case that looked like the one we'd seen with {item}. {who} went over the route and found the drop-off. |
| 74 | The case had travelled in a hired van. The return yard gave up a collection address once the crew settled an unpaid cleaning fee. | The case went out in a hired van. We covered an unpaid cleaning fee at the return yard and got the collection address. |
| 77 | {who} recognised a clinic dressing on the seller's hand. A discreet word at the clinic got a message passed on. | {who} recognised the dressing on the seller's hand. The clinic agreed to pass a message along quietly. |
| 78 | A repairer was laid up after an implant flare-up. {who} kept the visit short and came away with a name. | An implant flare-up had the repairer off work. {who} got a name without keeping them up long. |
| 81 | The seller tried to make {who} wait all afternoon. {who} waited longer and got the meeting. | The seller left {who} waiting all afternoon, expecting them to leave. {who} stayed and got the meeting. |
| 82 | Somebody tested {who} with three different prices and two bad addresses. Staying calm got the real one. | Someone tried three prices and two bad addresses on {who}. They stayed calm and got the real address. |
| 83 | The broker stopped talking to see who would fill the silence. {who} waited and got the owner's name. | The broker stopped mid-conversation. {who} let the silence sit until the broker named the owner. |
| 89 | The case was the right size. What was inside wasn't {item}. The day went with it. | We spent the day on a case that looked right and held something other than {item}. |
| 90 | {who} followed the rumour across {district}. It ended with somebody selling spare parts and a convincing story. | The rumour took {who} all the way across {district}. There was a good story at the end of it, but only spare parts for sale. |
| 91 | The seller had already gone. Nobody nearby knew where, or admitted they did. | By the time we got there, the seller had left. Nobody nearby would say where. |
| 92 | A promising address turned out to have been empty for weeks. Nothing there moved the hunt forward. | The address had looked good on paper. The place had been empty for weeks. |
| 93 | Someone had mistaken a similar weapon for {item}. {who} checked it anyway and lost the day. | {who} gave up the day to check a lookalike somebody had called {item}. |
| 94 | The trail ended at a locked shop and a neighbour who knew nothing useful. | The shop was locked and the neighbour couldn't tell us anything that helped. |
| 95 | A viewing turned out to be a pitch for something else. The crew left before the instalment plan. | We went to see the piece and got a sales pitch for something else. We left before we heard the terms. |
| 96 | The supposed owner had only borrowed the case. They had never seen what belonged inside. | The person we'd taken for the owner had only borrowed the case. They'd never seen its contents. |
| 97 | The case was the right size. Inside was a karaoke machine, still plugged in. The day went with it. | We lost the day to a case with a karaoke machine inside. It was still plugged in. |
| 98 | The case was the right size. What was inside wasn't {item}. {who} says it was "a very nice umbrella" and would like that noted. | We opened a likely case and found an umbrella instead of {item}. {who} asked us to put down that it was a good umbrella. |
| 101 | {who} spent half the day listening to somebody who claimed to know the seller. They knew stories, not the seller. | {who} gave up half the day to someone who said they knew the seller. All they knew was a few stories. |
| 102 | The introduction was real, but the information was old. {item} had passed through weeks ago. | The introduction checked out; the news didn't. Nobody there had seen {item} in weeks. |
| 103 | A broker promised a name after one more cup of tea. By closing time, the pot was empty and so was the promise. | The broker said one more cup and we'd have a name. The shop closed with the pot empty and no name given. |
| 106 | The sale record {who} found had been copied and reposted so many times the original trail was gone. | By the time {who} saw the sale record, it had been copied so often there was nothing left to tell us where it started. |
| 107 | {who} chased a serial match until the last digit came up. Wrong weapon. | The serial looked right until {who} saw the last digit. It belonged to a different gun. |
| 113 | Somebody realised the crew was looking for {item} and started asking why. {who} backed off before the questions got expensive. | Someone worked out we wanted {item} and began asking what for. {who} left it alone before the questions cost us more. |
| 114 | A small argument over access cost the crew cash and most of the afternoon. The lead survived. | We lost some cash and most of the afternoon over who could go in. We still had the lead. |
| 115 | {who} took a scrape getting out through a service door that closed sooner than expected. | The service door shut early and left {who} with a scrape on the way out. |
| 116 | The seller changed meeting places without warning. By the time {who} caught up, everyone nearby was paying attention. | Nobody told us the meeting had moved. {who} made it to the new spot with half the street watching. |
| 117 | Someone else was looking for {item}. They now knew the crew was too. | We weren't the only crew asking about {item}, and the other buyer had noticed us. |
| 118 | The person holding the case started charging for viewings. The crew paid to keep the appointment. | It turned out there was a charge just to see inside the case. We paid it rather than lose our slot. |
| 119 | Another buyer had heard the same rumour. The seller became much less flexible about the price. | The rumour brought in a second buyer. The seller stopped talking about a lower price. |
| 122 | A discussion over the price got physical before anybody drew a weapon. {who} left bruised, with the lead intact. | The price argument turned into a scuffle, though nobody drew a gun. {who} left with a bruise and the same lead. |
| 123 | Two people decided {who} looked easier to push around than expected. Nobody reached for a gun, but the furniture suffered. | Two people tried to shove {who} around. No gun came out, but the chairs didn't all make it. |
| 124 | Two people decided {who} looked easy to push around. The furniture lost, {who} won, and the stall owner sent us the bill. | Two people tried their luck with {who} and didn't get far. The stall owner put the broken furniture on {who}'s tab. |
| 125 | Two people decided {who} looked easy to push around. {who}'s report, in full: "They started it. The chair finished it." | Two people picked a quarrel with {who}. {who} sent one sentence back: "It wasn't the chair that started it, but that's what they'll remember." |
| 128 | A camera caught more of {who} than they meant it to. They left before anyone came to check. | The camera got a better look at {who} than we'd wanted. They were gone by the time anyone came to look. |
| 129 | {who} slipped through the wrong door and met the person holding the keys. Getting back out cost the crew a little cash. | The wrong door put {who} face to face with the keyholder. It cost us a little to get out again. |
| 132 | A shortcut ended behind a delivery truck with nowhere to turn. {who} lost the tail getting back onto the road. | A blocked shortcut left {who} behind a delivery truck with no room to turn. We lost the vehicle we were following. |
| 133 | The crew's transport was clamped during a meeting. Paying for its release ate into the day's cash. | We came out of the meeting to find a clamp on our transport. The release fee came out of the day's cash. |
| 134 | The van carrying {item} got boxed in at a loading lane, and so did {who}. By the time the lane cleared, the seller was gone. | Both {who} and the van with {item} got stuck in the loading lane. Once it cleared, there was no sign of the seller. |
| 140 | The lead went nowhere, but {who} found an unclaimed parts pouch worth {cash}. | Nothing came of the lead, but {who} came across a parts pouch nobody claimed. It was worth {cash}. |
| 141 | Someone paid {cash} for a small delivery while {who} was already going that way. | {who} was headed that way anyway, so a quick delivery earned us {cash}. |
| 142 | A seller had nothing on {item}, but paid {cash} for help shifting some stock before closing. | The seller knew nothing about {item}, but paid us {cash} to help move stock before the shutters came down. |
| 143 | A shop needed someone to return a hired trolley. The errand paid {cash} and took one street. | We took a hired trolley one street over for a shop and got {cash} for bringing it back. |
| 146 | {who} picked up a box of usable weapon parts nobody at the stall wanted to count. | The stall didn't want to sort through a box of weapon parts. {who} took it and found usable pieces inside. |
| 147 | An unwanted hard case came with its keys still taped inside. The crew kept it. | Nobody wanted the hard case, even with the keys taped inside. We took both. |
| 148 | A repairer let the crew keep a sealed cleaning kit after they carried a cabinet upstairs. | We took a cabinet upstairs for a repairer and got an unopened cleaning kit for it. |
| 151 | The hunt turned up a rumour about another sale in {district}. Nothing useful today, but Joss wrote it down. | Joss noted a rumour about another sale in {district}. It wasn't something we could use today. |
| 158 | Nobody useful showed. {who} watched the street until dark and learned nothing new. | {who} stayed out watching the street until dark. We didn't see anyone who could help. |
| 159 | Nobody useful showed. {who} watched the street until dark and now knows every pigeon on it by sight. | No one worth talking to came past before dark. {who} had been there long enough to tell the pigeons apart. |
| 160 | Nobody useful showed. {who} got so bored they started rating the noodle stalls. "Two stars. Both of them." | With nobody useful in sight, {who} started scoring the noodle stalls: "Two stars each." |
| 161 | Rain kept the shutters down. The crew watched water collect in a bucket beneath the awning. | The shutters stayed down in the rain. We sat under the awning and watched the bucket fill. |
| 162 | A long afternoon produced two meals and no useful conversation. The bowls were better than the lead. | We got through two meals that afternoon without hearing a thing we could use. At least the food was good. |
| 163 | The crew waited on a promised meeting that never happened. No trouble, no progress. | We kept time free for a meeting that didn't happen. Nothing went wrong; nothing went anywhere. |
| 164 | {who} spent the day checking the same names twice. Nothing moved. | {who} went over the same list of names twice. There was nothing to add by the end of the day. |
| 165 | The trail stayed cold. Nobody spent anything, nobody got hurt, nobody learned anything. | Nothing came of the day. No news, no money spent, no one hurt. |
| 166 | A seller asked for another day. {who} left it there rather than turn waiting into trouble. | The seller wanted a day more. {who} didn't push for a different answer. |
| 172 | {contact} had another name by the time {who} came by again. This one sounded closer to {item}. | When {who} went back, {contact} had a new name. It sounded like someone who might know more about {item}. |
| 173 | {contact} remembered one more detail about the person carrying {item}. It was enough to move the hunt on. | A detail about the carrier came back to {contact}. It gave us a fresh direction to look for {item}. |
| 174 | {contact} admitted the first story had left something out. {item} hadn't been sold yet. | {contact} hadn't told us everything last time. It turned out {item} was still for sale. |
| 175 | An old receipt jogged {contact}'s memory. There had been a second person at the handover. | The old receipt reminded {contact} that someone else had been there when the case changed hands. |
| 178 | {contact} wasn't at their usual spot. {who} spent the day finding out where they'd gone, and got nothing for it. | {who} used up the day finding out where {contact} had gone from their usual spot. It didn't help the search. |
| 179 | The crew checked back with {contact} and got the same answer, word for word. Nothing moved. | We got exactly the answer {contact} had given us last time. There was nothing new in it. |
| 182 | Somebody had already asked {contact} about the crew. {who} kept the conversation short after that. | {who} kept the visit brief when {contact} said somebody had been asking about us. |
| 183 | A message from {contact} asked the crew to stop asking so openly. Somebody else had noticed. | {contact} sent word that our questions were getting noticed and asked us to be less open about them. |
| 189 | {who} went back to {place} and watched it properly. The same case appeared again before dusk. | On a closer watch at {place}, {who} saw the same case again before the light went. |
| 190 | {place} looked different with the shutters down. {who} found a second entrance and a better lead. | With the shutters down at {place}, {who} noticed another entrance. It gave us a better lead. |
| 191 | The crew's name had reached {place} before {who} did. Somebody there was suddenly willing to talk. | By the time {who} reached {place}, somebody had heard our name and was ready to talk. |
| 192 | {who} returned to {place} and found the person they'd missed last time. They knew where {item} had gone. | {who} caught the person we'd missed at {place} last time. They could tell us where {item} went. |
| 193 | Someone had cleared the noticeboard at {place}. The crew found the discarded listings in a box beside it. | The board at {place} had been cleared, but the old listings were still in a box beside it. |
| 196 | {who} checked {place} after dark. The lights stayed on, but nobody answered. | After dark, {who} found the lights still on at {place}. Nobody came to answer. |
| 200 | Nothing moved at {place} for hours. Then somebody arrived asking the same questions as the crew. | We had hours of nothing at {place}, then someone came in asking exactly what we'd asked. |
| 207 | {item} was real, working and close enough to take home. Now it was a question of price or nerve. | We'd found {item}, it worked, and it was within reach. Getting it home would take money or nerve. |
| 208 | The crew found {item} exactly where the trail said it would be. The owner was willing to talk. | The lead took us straight to {item}. Its owner was ready to talk terms. |
| 209 | {who} got eyes on {item}. One clean deal would finish the run. | {who} saw {item} in person. All we needed now was a deal that held. |
| 210 | The seller put {item} on the table and named a price. At least nobody was pretending any more. | Once the seller laid out {item} and gave us a number, everyone stopped acting like it wasn't for sale. |
| 211 | A trade was on offer for {item}. The other side wanted something the tong could spare. | The seller would trade {item} for something we didn't need to keep. |
| 214 | {who} found {item}, along with several people who had no intention of giving it up cheaply. | {who} got to {item} and found several people ready to make us pay for it. |
| 215 | {item} was there, but the deal had changed. More money, more risk, or a different way out. | We could see {item}, but the old terms were off. We'd have to pay more, take a bigger risk or find another way out. |
| 216 | The crew reached {item} just as another buyer did. Nobody had drawn anything yet. | Another buyer got to {item} at the same time we did. So far nobody had drawn a weapon. |
| 217 | {item} turned up in the right place with the wrong owner. Getting it home was going to take more than asking. | The address was right, but {item} belonged to somebody else. Asking nicely wasn't going to get it home. |
| 218 | The person holding {item} wasn't the person who had agreed to sell it. Both expected paying. | One person had agreed to the sale and someone else had {item}. Now both wanted our money. |
| 219 | Another buyer arrived during the viewing. The owner began enjoying the meeting considerably more. | The owner was a lot happier about the viewing once there were two buyers in the room. |
| 224 | The deal for {item} broke down when somebody locked the door behind the crew. {who} got clear enough to call it in. | Someone locked us in during the deal for {item}. {who} got far enough away to call it in. |
| 225 | Another buyer reached for {item} before the price was settled. Chairs went over, hands moved, and the crew called it in. | The price was still up in the air when another buyer grabbed for {item}. Chairs went down and the crew called it in. |
| 226 | The seller's friends decided the crew had brought too little cash and too much confidence. The way out filled with bodies, and they're calling it in. | The seller's friends said we'd talked bigger than we'd paid. They crowded the way out, and the crew called it in. |
| 227 | {who} had {item} in sight when somebody recognised the crew from earlier in the hunt. The room went quiet, hands started moving, and they're calling it in. | {who} could see {item} when someone recognised us from earlier. The room fell quiet, people started to move, and we called it in. |
| 228 | The handover stopped when somebody recognised the broker and pulled a weapon. Tables went over, and the crew called it in. | Someone knew the broker and pulled a weapon before the handover was done. The tables went over and we called it in. |
| 233 | The crew came home with {item}. Joss checked the numbers; nobody paid more than they agreed to. | We got home with {item}. Joss checked the books and confirmed we hadn't gone over the price. |
| 234 | {item} made it back wrapped in an old cloth and smelling faintly of machine oil. Job done. | We brought {item} back in a worn cloth that smelled of oil. That was the job done. |
| 235 | {item} made it back wrapped in somebody's good tablecloth. Nobody's admitting whose. | The crew got {item} home in a good tablecloth. So far, nobody's claimed the cloth. |
| 236 | {item} made it back smelling of machine oil. {who} has carried it round the safehouse all evening like a new baby. | We got {item} home with the smell of machine oil still on it. {who} spent the evening at the safehouse cradling it like a baby. |
| 237 | The crew put {item} down beside the ledger. Someone went to put the kettle on. | {item} went beside the ledger when we got in. The next stop was the kettle. |
| 238 | The case came through the safehouse door with {item} inside. Joss asked for the actual cost, not the opening offer. | The case with {item} in it made it through the safehouse door. Joss wanted to know what we paid, not where the price started. |
| 239 | The seller took the deal. The crew brought {item} home and put it on the table. | Once the seller said yes, we took {item} home and set it on the table. |
| 240 | {who} got {item} out cleanly. It was waiting at the safehouse by the time everyone came in. | {who} got {item} away without trouble. It was already at the safehouse when the rest of us got in. |
| 243 | The crew couldn't get {item}, but came home with parts, ammunition and enough useful pieces to make the run count for something. | We didn't get {item}, but there were usable parts and ammunition in what we brought home. |
| 244 | {item} stayed with the seller. The crew recovered some of what had travelled with it and brought that home instead. | The seller kept {item}. We came home with some of the pieces that had come with it. |
| 245 | The deal collapsed before {item} changed hands. {who} salvaged what they could and nobody came home empty-handed. | The deal fell apart before we got {item}. {who} saved what they could from it, so we had something to bring back. |
| 246 | They got close to {item}, not close enough. The crew brought back the useful pieces picked up along the way. | We nearly had {item}. In the end we got home with only the useful bits we'd found along the way. |
| 247 | {who} brought back the service kit, not {item}. It was something, though not what they had gone for. | What {who} had at the door was the service kit, not {item}. It would have to do. |
| 250 | {item} got away from them. The crew came home with what they'd found on the road and nothing more. | We missed out on {item} and got home with just the things we'd picked up on the way. |
| 251 | The trail ended without {item}. Everyone made it back, which was more than the last lead deserved. | We lost the trail to {item}, but everybody got home. The last lead wasn't worth any more than that. |
| 252 | No weapon, no deal. The crew brought home the odds and ends they'd picked up and closed the run. | The crew closed the trip with no deal and no gun. Only the bits we'd found along the way came home. |
| 253 | {item} stayed somewhere in {district}. The crew came back tired, carrying only what the hunt turned up. | We came back from {district} tired and without {item}, with just the things we'd picked up in the search. |
| 254 | The hunt was over, with nothing to show for the main errand. Joss left the weapon entry blank. | The trip ended without the piece we'd gone for, so Joss didn't fill in the weapon line. |
| 260 | {who} blames the black cat that sat on the van at noon, and won't hear otherwise. | {who} still says the day turned when that black cat settled on the van at noon. |
| 261 | {who} told somebody exactly what they thought of them, in two languages. | {who} gave someone the full opinion, then said it again in another language. |
| 262 | {who} also came away with a bag of egg tarts and an invitation to somebody's birthday. | {who} somehow ended up with egg tarts to share and a birthday invitation. |
| 263 | {who} finished their tea first, as always. | As usual, {who} took the last sip of tea before getting up. |
| 267 | {who} and {other} argued about the route for an hour. {who} was right, and hasn't stopped saying so. | After an hour of arguing with {other} over the route, {who} got it right. We haven't heard the end of it from {who}. |
| 268 | {other} kept watch while {who} worked the seller, then ate both their lunches. The lead was good; the lunch dispute continues. | {other} watched the place while {who} talked to the seller. We got the lead, but both lunches went to the lookout and that's still being discussed. |
| 271 | Joss: "Logged as surveillance. It was mostly noodles." | Joss: "I filed it as watch time. The notes were mainly about noodles." |
| 272 | Joss: "Logged, oiled, and not to be fired indoors. I mean it." | Joss: "It's in the ledger and it's been oiled. And no, we're not testing it in here." |

### `src/data/advlog/weaponShared.js`

| Line | Current | Alternative |
| --- | --- | --- |
| 11 | {who} started asking after {itemFull} in {district}. Someone pointed us towards {contact}, {contactWhat}, who had handled a similar sale. | When {who} began asking about {itemFull} in {district}, someone sent us to {contact}, {contactWhat}. They'd dealt with a sale like this before. |
| 12 | The hunt for {itemFull} took us to {place}. A seller had left a collection notice there. | At {place}, we found a notice from a seller about where to collect {itemFull}. |
| 13 | We followed a handwritten advert for {itemFull} to {place}. The price had been crossed out twice. | The handwritten ad for {itemFull} sent us to {place}. There were two prices crossed out before the one we could read. |
| 14 | {contact}, {contactWhat}, had heard we wanted {itemFull}. {who} arranged a conversation over tea. | Word that we wanted {itemFull} had reached {contact}, {contactWhat}. {who} set a time to talk over tea. |
| 15 | Someone had offered {itemFull} as payment for a debt. {who} traced the offer to {place}. | {who} followed an offer to settle a debt with {itemFull} back to {place}. |
| 18 | {who} asked who might part with {itemFull}. {contact}, {contactWhat}, offered an introduction once the lunch rush was over. | {contact}, {contactWhat}, knew someone who might sell {itemFull}. When {who} asked, they said they could put us in touch after lunch service. |
| 19 | Over a shared table, {who} mentioned we were looking for {itemFull}. {contact}, {contactWhat}, wrote a seller's name on the receipt. | {who} brought up {itemFull} at a table we were sharing. {contact}, {contactWhat}, slid over the receipt with the seller's name on it. |
| 22 | {who} traced an advert for {itemFull} to a collection point at {place}. The listing was old, but the account was still answering. | An old ad for {itemFull} gave {who} a pickup spot at {place}. The seller was still replying through the listing. |
| 23 | A repair listing mentioned {itemFull} among the uncollected work. {who} arranged to inspect the records at {place}. | {itemFull} showed up on a repair list as work nobody had picked up. {who} set up a look at the records at {place}. |
| 26 | {who} watched a case matching {itemFull} change hands outside {place}. We stayed far enough behind to look uninterested. | Outside {place}, {who} saw someone hand over a case that looked right for {itemFull}. We didn't let on that we'd noticed. |
| 27 | A seller advertising {itemFull} had stopped answering messages. {who} picked up the trail at {place}. | The messages about {itemFull} had stopped getting replies. {who} found a lead at {place} anyway. |
| 33 | {who} found the person who had carried the case. They remembered the buyer because the buyer had refused to pay for the stairs. | The person who carried the case told {who} they hadn't forgotten that buyer. There was still the matter of the unpaid stair fee. |
| 34 | The seller's old number still worked. We had a collection window to check. | We tried the old number and got through. Now we knew when to check for a collection. |
| 35 | A repair receipt put the gun in a workshop rather than a private collection. {who} arranged to ask about unclaimed work. | The repair receipt said the gun was at a workshop, not in somebody's collection. {who} set up a chat about work nobody had picked up. |
| 36 | Someone recognised the wrapping on the case. We had the name of the business that packed it. | The wrapping looked familiar to someone we asked. They named the shop that had packed the case. |
| 37 | The owner was willing to sell, but wanted a replacement lined up. {who} got the specification. | The owner said they'd sell if they could get a replacement. They told {who} exactly what they were after. |
| 38 | A handwritten inventory listed {item} under a different name. The storage reference matched. | Someone had entered {item} by hand under another name. The storage reference was the same. |
| 39 | {who} found a buyer who had walked away from the asking price. They passed on the seller's number. | A buyer told {who} the asking price had been too high and gave us the number they'd called. |
| 40 | The case had gone through a local delivery service. Its dispatcher agreed to forward our offer. | A local delivery service had handled the case. The dispatcher said they'd pass our offer on. |
| 43 | {who} recognised the wear around the grip in a sale photo. It matched the piece we were tracking. | The sale photo showed wear by the grip that {who} remembered from the piece we'd been looking for. |
| 44 | A seller had described {item} badly enough to put everyone off. {who} asked the right questions and secured an inspection. | The listing for {item} had put other buyers off. {who} knew what to ask about it and got us a look. |
| 47 | {who} followed the empty case trolley to its storage room. We knew which door mattered. | Once the case was off the trolley, {who} saw where the trolley went back to. That gave us a door to check. |
| 48 | The seller kept changing meeting points. {who} watched the handovers and worked out where the stock stayed. | There was a different meeting spot every time. {who} watched the handovers until it was clear where the stock was kept. |
| 51 | {who} matched a serial number in an old repair record. The workshop still had a forwarding address. | An old workshop record had a serial number {who} could match. The workshop could still tell us where to ask next. |
| 52 | The sale photos had been copied, but the collection message was local. {who} traced it to an active seller. | The pictures came from another listing, but the pickup note was local. It gave {who} a seller who was still taking calls. |
| 55 | {who} persuaded a broker to pass our offer on without adding another introduction fee. | The broker usually took another fee for an introduction. {who} got our offer passed along at no extra charge. |
| 56 | The owner had ignored every message asking for a discount. {who} asked when an inspection would suit and got an answer. | Requests for a lower price went unanswered. {who} asked for a time to see the piece instead, and the owner wrote back. |
| 59 | {who} recognised the delivery route from the collection times. We narrowed the search to one unloading stop. | The pickup times told {who} which route it must have taken. That left just one place it could have been unloaded. |
| 60 | A driver remembered carrying the case. {who} talked through the route and found the address missing from the receipt. | The driver recalled the case but the receipt was missing an address. {who} got it by going over the stops with them. |
| 63 | {who} let the seller finish explaining why nothing was for sale. The conversation ended with an inspection time. | {who} heard the seller out when they said they had nothing to sell. By the time they'd finished talking, we had a time to look. |
| 64 | The broker left a long silence after our offer. {who} waited it out and got the owner's actual asking price. | Nobody spoke for a while after we made our offer. {who} let the broker break the silence with the price the owner actually wanted. |
| 70 | The case was the right size. Inside was a karaoke machine; the owner offered to demonstrate. | We opened a likely case and found a karaoke machine. Its owner asked if we'd like to hear it. |
| 71 | {who} waited through the collection window. The seller had given everyone the same wrong address. | The pickup time came and went while {who} waited. It turned out the seller had sent everyone to the wrong address. |
| 72 | The advert was genuine, but the sale had happened months ago. Nobody had taken it down. | It was a real ad. The piece had sold months ago and the listing was still up. |
| 73 | A promising storage reference led to an empty cupboard. Even the shelf brackets had gone. | The storage number took us to a cupboard with nothing in it, not even brackets for the shelves. |
| 74 | The owner wanted to show us a collection, not sell anything. {who} sat through the whole tour. | The owner wasn't selling; they just wanted to show off the collection. {who} stayed to see all of it. |
| 75 | Someone had mistaken a carrying case for the gun inside it. The case was available, if we wanted to remain disappointed. | The gun and the case had got mixed up in the telling. We could buy the case, but there was nothing to put in it. |
| 78 | {who} spent the afternoon getting an introduction to someone who only knew the same broker we did. | By the time {who} got the introduction, most of the afternoon was gone. The new contact could only send us to the broker we already knew. |
| 79 | The seller's friend vouched for everything except having seen {item}. There was nobody else to ask. | The seller's friend had plenty to say but hadn't actually seen {item}. We had no one else to try. |
| 82 | {who} checked the listing history. Every photograph came from the same completed sale. | The listing history told {who} all the photos were from one sale that had already gone through. |
| 83 | The inventory entry was a training example left in the live system. {who} read the help text twice to be sure. | Someone had left a practice entry in the real inventory. {who} went over the help text a second time before giving up on it. |
| 89 | A broker charged us for an introduction, then charged for passing the reply back. We paid rather than lose the appointment. | There was a fee to get the introduction and another to hear what came back. We paid both to keep the appointment. |
| 90 | {who} caught a palm on a broken case latch. A scrape, and a pause to clean it. | A broken latch left a scrape on {who}'s palm. We stopped long enough to clean it. |
| 91 | The seller moved the appointment after we had paid for transport. The fare was gone. | We'd already paid the fare when the seller changed the appointment. We didn't get that money back. |
| 92 | A loose stair tread gave way under {who}. One bruised shin and a much slower descent. | A stair tread gave out under {who}. They took the rest of the stairs slowly on a bruised shin. |
| 93 | A building attendant demanded a visitor fee that had not existed on the way in. We paid to keep the meeting quiet. | On the way out, the attendant wanted a visitor fee nobody had mentioned on the way in. We paid rather than make a fuss. |
| 94 | The storage desk charged for opening the wrong locker. Apparently checking the number counted as a separate service. | We paid to open a locker that turned out to be the wrong one. Checking the number would have cost extra. |
| 97 | {who} checked a stiff mechanism at the seller's request and pinched a finger. The inspection paused for a plaster. | At the seller's request, {who} looked at a part that was sticking and pinched a finger. We stopped while they got a plaster. |
| 98 | The demonstration stand folded while {who} was checking its balance. A bruised wrist was the extent of it. | The stand gave way while {who} was checking how it balanced. All they got was a bruised wrist. |
| 101 | {who} caught a sleeve on a service-door alarm. We left before anyone arrived, but the building logged the visit. | A service-door alarm snagged {who}'s sleeve. We were gone before anyone showed, but our visit was on record. |
| 102 | A camera turned towards {who} at the wrong moment. The watch desk circulated a still before we cleared the corridor. | The camera was facing {who} at exactly the wrong time. The watch desk had sent a picture round before we'd left the corridor. |
| 105 | The collection address had nowhere to stop. {who} found the vehicle ticketed after a circuit on foot. | There was no place to stop at the pickup address. By the time {who} got back from looking on foot, there was a ticket on the vehicle. |
| 106 | {who} took the low access ramp and scraped the vehicle's underside. The repair ate into our spending money. | The low ramp scraped the bottom of the vehicle when {who} took it. We had less to spend after paying for the repair. |
| 112 | {who} helped a stallholder shift a jammed shutter. They paid {cash} for the trouble. | A stallholder couldn't get the shutter to move. They gave {who} {cash} for helping free it. |
| 113 | A workshop needed a sealed parcel carried round the corner. {who} earned {cash} while the seller kept us waiting. | While we waited for the seller, {who} made {cash} taking a workshop's sealed parcel round the corner. |
| 114 | {who} spotted a duplicate charge on a delivery receipt. The dispatcher refunded {cash} in cash. | A charge appeared twice on the delivery receipt. When {who} pointed it out, the dispatcher handed back {cash}. |
| 117 | A repairer let {who} take a box of spare springs from the discard shelf. Several were still wrapped. | The repairer said {who} could have the box of springs on the discard shelf. A few hadn't even been unwrapped. |
| 118 | {who} found an unopened packet of ammunition in a clearance tray. The owner waved it through with the empty packaging. | There was a sealed packet of ammunition among the clearance stock. The owner let {who} take it along with the empty packaging. |
| 119 | Someone had thrown out a sound carrying case because its handle had split. {who} kept it for the fittings. | The handle was split, but the discarded case was sound. {who} took it for the fittings. |
| 122 | A repairer mentioned a workshop clearing its unclaimed stock next month. {who} kept the address for another trip. | A repairer said a workshop would clear its unclaimed stock next month. {who} wrote down the address for another day. |
| 123 | {who} heard about a courier looking for occasional cover. We saved the number for when we were not chasing a gun. | A courier needed someone to cover now and then, or so {who} heard. We kept the number for after the gun hunt. |
| 129 | {who} watched the collection entrance through a whole lunch service. Nobody carrying a case used it. | By the end of lunch service, {who} still hadn't seen anyone take a case through the collection entrance. |
| 130 | The seller asked us to wait for a message. We waited; the handset stayed quiet. | We held off like the seller asked. The message never came. |
| 131 | Rain kept everyone under the same awning. We heard plenty about the weather and nothing useful. | The rain put us all under one awning. All anyone had to talk about was the rain. |
| 132 | The appointment board had not changed. {who} checked it anyway, then found somewhere to sit. | {who} looked at the appointment board again just in case. With nothing new on it, they went and sat down. |
| 133 | We kept the afternoon free for a viewing that never got confirmed. {who} called it a very expensive way to drink tea. | We left the afternoon open and the viewing never got a time. {who} said we'd spent a lot on sitting with a cup of tea. |
| 139 | {contact} answered our message with a storage reference. {who} arranged to check it. | The reply from {contact} included a storage reference. {who} set up a time to look into it. |
| 140 | A note from {contact} named the person authorised to release the case. We had someone specific to ask for. | {contact} sent us the name of the person who could sign the case out. We knew who to ask for now. |
| 141 | {who} showed {contact} the sale photograph. They recognised the counter behind it and gave us an address. | When {who} brought the sale photo to {contact}, they knew where that counter was and gave us the address. |
| 142 | The owner had replied to {contact}. Our offer was enough to get a viewing. | The owner told {contact} our offer was enough to let us see the piece. |
| 145 | {contact} had passed on a story heard from someone else. {who} followed it back to the advert we already had. | {who} checked the second-hand story from {contact}. It led right back to the ad we'd already seen. |
| 146 | The number {contact} gave us belonged to a business that had closed. Nobody nearby knew where the stock went. | We tried the number from {contact} and found the business gone. No one nearby could say where its stock had ended up. |
| 149 | {contact} asked for an introduction fee before forwarding our message. We paid it to keep the conversation open. | We paid {contact} an introduction fee so our message would get passed on. |
| 150 | A loose shelf tipped while {who} waited for {contact}. We paid for the tea set it took with it. | A shelf came down as {who} waited for {contact}. The tea set went with it, and we got the bill. |
| 156 | A fresh collection notice had appeared at {place}. {who} copied the reference before it was taken down. | There was a new pickup notice at {place}. {who} got the reference down before someone cleared it away. |
| 157 | {who} checked the delivery book at {place}. The case had been signed for under a business name. | At {place}, {who} found a business name next to the signature for the case in the delivery book. |
| 158 | Someone at {place} recognised the seller's description. We left with a working number. | The seller sounded familiar to someone at {place}. The number they gave us actually worked. |
| 159 | The attendant at {place} agreed to forward our offer. A reply arrived before the desk closed. | We left our offer with the attendant at {place}. The answer came back while the desk was still open. |
| 162 | The appointment at {place} turned out to concern an empty case. Nobody had thought to mention that. | We got to the appointment at {place} before anyone thought to say we were there to see an empty case. |
| 163 | {who} checked the old notices at {place}. Every useful number had been disconnected. | None of the numbers worth trying on the old notices at {place} still worked. {who} checked them all. |
| 166 | The desk at {place} charged a handling fee before letting us inspect the records. We paid and kept the receipt. | At {place}, we had to pay to see the records. We made sure we got a receipt for it. |
| 167 | {who} slipped on a wet step outside {place}. A bruised hip made the rest of the walk less cheerful. | A wet step outside {place} left {who} with a bruised hip. The walk felt longer after that. |
| 173 | {who} inspected {item} and agreed terms with its owner. All that remained was the handover. | After a look at {item}, {who} settled on terms with the owner. Now it just had to change hands. |
| 174 | The storage clerk brought out {item}, and the release paperwork matched. We had a collection slot. | The clerk took {item} out of storage and the release papers were in order. We got a time to collect it. |
| 175 | Our trade offer was accepted. {who} checked the piece and arranged the exchange. | They'd take the trade. {who} looked over the piece and set up the handover. |
| 176 | The owner accepted our price after the inspection. The case was packed and waiting for collection. | We looked it over and the owner agreed to our price. They packed the case and left it ready to pick up. |
| 179 | {who} found {item}, but the owner wanted more than we had set aside. A cheaper piece was offered alongside it. | The owner of {item} wanted more than we'd put aside. When {who} found it, there was a cheaper piece on offer too. |
| 180 | The inspection showed {item} needed work we could not arrange here. The seller offered the usable parts separately. | We looked over {item} and saw it needed work we couldn't get done here. The seller said we could buy the good parts on their own. |
| 181 | The owner would only sell {item} with the rest of the lot. {who} asked what could be split off. | The owner said {item} went with the whole lot or not at all. {who} asked if anything could be sold separately. |
| 182 | The release papers named two owners, and only one had signed. The clerk offered a lesser piece with clear paperwork. | Two people had to sign it out, and one hadn't. The clerk had a lesser piece they could release without the extra signature. |
| 187 | Someone lunged for the case as the handover began. {who} took cover behind the counter and called it in. | The case was just changing hands when someone made a grab for it. {who} got behind the counter and called it in. |
| 188 | The seller's minder swung at the broker and turned towards our crew. {who} called it in from the doorway. | The seller's minder took a swing at the broker and turned on us. {who} called it in from the door. |
| 189 | A rival buyer shoved the table over and came at us with a raised chair. The crew held by the exit and called it in. | The other buyer tipped the table and came our way with a chair raised. We stayed by the exit and called it in. |
| 190 | The collection shutter dropped, and someone threw a punch at {who}. The crew called it in. | The shutter came down at the collection desk and somebody swung at {who}. We called it in. |
| 195 | We brought {item} home in a case with somebody else's initials. {who} put it down carefully. | The case we brought home with {item} had someone else's initials on it. {who} set it down gently. |
| 196 | {who} handed over {item} and the agreed receipt. The hunt was done. | With {item} and the receipt in hand, {who} handed both over at home. That closed the search. |
| 197 | The crew got home with {item}. Someone had wrapped the case in a tablecloth; nobody had asked for it back. | We brought {item} home in a case wrapped up in a tablecloth. So far no one's asked for the cloth back. |
| 198 | We got {item} through the door and onto the bench. {who} asked for tea before questions. | We had {item} on the bench back home. {who} wanted a cup of tea before anyone started asking questions. |
| 201 | We brought home usable parts, but not {item}. {who} laid them out so we could see what the trip had bought. | What we brought home wasn't {item}, but the parts were usable. {who} spread them out to show us what we'd got for the trip. |
| 202 | {who} returned with a lesser piece instead of {item}. It was not the brief, but it was something we could use. | Instead of {item}, {who} came home with a lesser piece. Not what we'd asked for, but it'll do some work. |
| 203 | The crew brought back what could be salvaged from the sale. The hunt for {item} remained open. | We took home what we could save from the sale. We were still looking for {item}. |
| 206 | We got home without {item}. Anything picked up along the way was all the trip had yielded. | We didn't have {item} when we got back. All we had was whatever we'd picked up during the search. |
| 207 | {who} closed the search without the gun. There was no prize beyond whatever we had found on the road. | {who} ended the hunt without the gun. All there was to bring home was what we'd found on the way. |
| 208 | The crew returned without the piece we wanted. {who} put the search notes on the table and left the kettle to someone else. | We got back without the piece. {who} left the notes on the table and let somebody else put the kettle on. |
| 214 | {who} had kept the same folded offering in a pocket all day and refused to call it a system. | {who} kept the folded offering in the same pocket all day and said that didn't make it a system. |
| 215 | {who} had counted the steps twice and declined to explain the result. | {who} went back and counted the steps again, but kept the number to themselves. |
| 218 | {who} had kept every receipt, including one written on the back of another receipt. | {who} saved both receipts even when one was written on the back of the other. |
| 219 | {who} priced the tea against the serving size and remained offended. | {who} saw how little tea the price had bought and was still annoyed after drinking it. |
| 222 | {who} asked whether everyone had eaten before finishing the report. | Before wrapping up the report, {who} made sure to ask who still needed food. |
| 223 | {who} saved the least crushed bun for whoever was reading this at home. | {who} put aside the bun that had come through best for whoever got the report at home. |
| 226 | {who} rewrote the report after deciding the original contained too many opinions about strangers. | {who} sent a second version of the report with fewer remarks about people we'd just met. |
| 227 | {who} described their own patience as exceptional, without anyone having asked. | Nobody asked, but {who} still put in a word for how patient they'd been. |
| 230 | {who} left the names out of the voice message and sent them separately. | {who} sent the voice report without the names and put them in a separate note. |
| 231 | {who} checked who could see the handset before sending the report. | {who} took a look around to see who could read the handset before sending anything. |
| 234 | {who} folded the notes neatly before sending a photograph of them. | {who} squared up the folds in the notes before taking the picture to send. |
| 235 | {who} waited for the tea to cool rather than arguing with it. | The tea was too hot, so {who} let it sit without a word. |
| 238 | {who} removed three adjectives from the report and considered it improved. | {who} took exactly three adjectives out of the report and liked it better that way. |
| 239 | {who} answered the question about morale with a battery percentage. | When we asked how everyone was holding up, {who} just told us how much battery was left. |
| 242 | {who} addressed the report to our esteemed kettle committee. | {who} sent the report with "To the Kettle Committee, with respect" at the top. |
| 243 | {who} claimed the handwriting was charming rather than difficult to read. | {who} insisted the handwriting had character and wasn't hard to read at all. |
| 246 | {who} added a question about a wall-mounted machine that had nothing to do with the hunt. | {who} finished the report with a question about a machine on the wall that wasn't part of the job. |
| 247 | {who} wanted to know why every repair counter seemed to own the same chipped mug. | Seeing yet another chipped mug at a repair counter, {who} asked if they all came from the same cupboard. |
| 250 | {who} adjusted an implant setting and complained that the cheaper version had been easier to use. | After changing an implant setting, {who} said it had been simpler on the cheap one. |
| 251 | {who} blamed the odd pause in the recording on second-hand hardware. | {who} said the gap in the recording was just the second-hand kit acting up. |
| 254 | {who} recognised a song in the background and left that part out of the recording. | A familiar song came on in the background, and {who} didn't include that bit in the recording. |
| 255 | {who} paused over an old date in the notes, then carried on without explaining. | {who} stopped at an old date in the notes for a moment, then went on without a word about it. |
| 260 | {who} and {other} disagreed over the route until they compared their notes. Both had written down the wrong entrance. | {who} and {other} argued about the route, then opened their notebooks. Same wrong entrance in both. |
| 261 | Over tea, {who} explained how to recognise a copied sale photograph. {other} found one before the explanation was finished. | {who} was still telling us over tea what a copied sale photo looked like when {other} spotted one. |
| 262 | {who} kept our place in the queue while {other} fetched food. The report devoted more space to the missing sauce than the wait. | {other} went for food while {who} held our spot in line. We heard more about the sauce that didn't come with it than how long the queue took. |
| 263 | The broker spoke too quietly for {who} to hear. {other} repeated every word, including the complaint about being overheard. | The broker was too quiet for {who}, so {other} said it all again. That included the bit about not wanting anyone else to hear. |
| 264 | {who} and {other} compared the collection times against the delivery route. One stop appeared on both lists. | {who} and {other} put the delivery route beside the list of pickup times. There was one stop in common. |
| 265 | While {who} asked about the case, {other} kept the paperwork in order. We left with a viewing reference rather than another promise. | {other} looked after the papers while {who} asked about the case. This time we left with a viewing reference, not just someone's word. |
| 270 | Joss: "I put the useful number above the noodle review. Both remain on file." | Joss: "I saved the noodle review too. The number we need is on the line above it." |
| 271 | Joss: "We have room for a case. I moved the bucket." | Joss: "The case will fit now. The bucket's out of the way." |
| 272 | Joss: "I could read most of that receipt. The tea was unusually clear." | Joss: "Most of the receipt was legible. I had no trouble making out the tea stain." |
| 273 | Joss: "Your message came through. The kettle was louder than the last sentence." | Joss: "I got the report, right up to where the kettle took over." |
| 274 | Joss: "We can settle the expenses from the receipts. Please stop using them as coasters." | Joss: "I've got the receipts to sort out what we spent. Use something else for the cups next time." |
| 277 | Joss: "We got what we went for. I cleared the bench; please keep it pointed away from the kettle." | Joss: "We got it. I made room on the bench, though I'd like the kettle left out of this." |
| 278 | Joss: "Logged under equipment. The tablecloth can have its own entry if we are keeping it." | Joss: "The gear is in the ledger. Let me know if we're keeping the tablecloth as well." |
| 281 | Joss: "We did not get it. The notes are saved, and there is food left." | Joss: "We missed out. I've kept the notes, and there's still something to eat." |
| 282 | Joss: "I closed the trip, not the search. We can decide what comes next after tea." | Joss: "I've marked the trip done and left the search open. We can talk about it after tea." |

### `src/data/advlog/cash.js`

Line 107 describes a repair bill, but “scraped” in the current text makes the game classify it as an injury. This alternative keeps the repair bill and avoids that accidental trigger.

| Line | Current | Alternative |
| --- | --- | --- |
| 7 | {contact}, {contactWhat}, knew of money the tong could earn with a little legwork. {who} asked how much legwork 'a little' covered. | {contact}, {contactWhat}, knew a way for the tong to make some money. “How much running around?” {who} asked. |
| 8 | A cash opportunity brought the crew to {place}. The person offering it wanted a conversation away from the supper queue. | The crew went to {place} about a cash job. The person offering it asked to talk where the supper queue couldn't hear. |
| 9 | {who} started at {place}, where somebody needed a discreet collection handled. The fee was apparently the uncomplicated part. | At {place}, {who} heard about a collection that had to stay quiet. The fee sounded like the easy part. |
| 10 | The run began with {contact}, {contactWhat}, and a folded note naming someone who could authorise payment. | {contact}, {contactWhat}, started the crew off with a folded note. It said who could approve the payment. |
| 11 | Someone at {place} had offered a share for recovering misplaced takings. The crew checked whether 'misplaced' meant lost or stolen. | At {place}, someone offered the crew a share if they got the takings back. The crew asked whether they'd gone missing on their own. |
| 12 | A message from {contact}, {contactWhat}, mentioned a paid errand nobody had finished. {who} went to find out why. | {contact}, {contactWhat}, sent word about an unfinished job that paid. {who} went to ask why it was still open. |
| 13 | Word of an unclaimed payment led the crew to {place}. There was supposedly a recovery fee for sorting out the paperwork. | The crew went to {place} to ask about money nobody had claimed. They heard there was a fee for getting the paperwork sorted. |
| 14 | The crew approached {contact}, {contactWhat}, about a small cash job. The explanation required moving three bowls off the table. | When the crew asked {contact}, {contactWhat}, about a small cash job, three bowls had to come off the table before the story could start. |
| 17 | {who} asked {contact}, {contactWhat}, who needed something settled badly enough to pay promptly. | “Who needs this done badly enough to pay on time?” {who} asked {contact}, {contactWhat}. |
| 18 | A conversation at {place} turned up an awkward collection. {who} asked whether the person promising payment was also the person holding it. | Talking to people at {place} turned up a tricky collection. {who} asked if the person offering the fee actually had the money. |
| 21 | {who} found a paid recovery notice buried beneath clinic adverts. The reply directed the crew to {place}. | While looking through the notices, {who} spotted a recovery job that paid under a stack of clinic ads. The reply told the crew to go to {place}. |
| 22 | A disputed payment reference led to {contact}, {contactWhat}. Untangling it might earn the tong a share. | A payment reference that didn't add up took the crew to {contact}, {contactWhat}. There might be a share in it for the tong if they could sort it out. |
| 25 | {who} checked {place} before approaching anyone about the cash offer. The meeting looked easier without the neighbouring tables listening. | Before raising the cash offer, {who} had a look around {place}. There were too many ears at the nearby tables. |
| 26 | The crew quietly approached {contact}, {contactWhat}, about money left behind after a hurried shop move. | After a shop moved out in a hurry, the crew had a quiet word with {contact}, {contactWhat}, about the cash it left behind. |
| 31 | A counterkeeper recognised the envelope's description. It had gone upstairs with the evening accounts. | From the description, the counterkeeper knew which envelope it was and said it had gone upstairs with the day's accounts. |
| 32 | {who} found the person who had signed for the collection. They remembered the handover because somebody had spilt soup on the receipt. | The person who signed for the collection remembered it when {who} asked. It was the receipt with soup on it. |
| 33 | The offered fee survived a second conversation. The crew now had a name for whoever could approve it. | The fee was still the same when the crew asked again, and this time they got the name of the person who could sign off on it. |
| 34 | An old account book supplied a working number. Someone answered between orders and agreed to talk. | A number in an old ledger still worked. Someone picked up between orders and said they'd talk. |
| 35 | A missing receipt turned up beneath a till drawer. The signature pointed towards the next person to ask. | Under the till drawer was the receipt everyone was looking for, with a signature that gave the crew someone to ask. |
| 36 | Someone had written the collection address on a takeaway menu. The crew separated the directions from the lunch specials. | The crew found the collection address scrawled beside the lunch specials on a takeaway menu. |
| 37 | The person holding the money agreed to a meeting. 'An actual place and time,' {who} reported, 'not a philosophical position.' | Whoever had the cash agreed to meet. “We've got a time and an address for once,” {who} said. |
| 38 | A supplier confirmed which payment had gone astray. The crew stopped chasing the other three amounts being argued about. | A supplier told the crew which payment was missing. That let them cross the other three amounts off their list. |
| 39 | The trail reached a clerk who could release the funds. The remaining question was which documents the clerk would accept. | The crew found the clerk who could pay out. All that was left to find out was what paperwork they'd take. |
| 40 | An argument over the total produced the missing page. Nobody had enjoyed being wrong enough to hide it again. | While everyone was arguing about the sum, someone pulled out the missing page to prove a point. It went back in the book this time. |
| 43 | {who} recognised a guard contractor's stamp on the collection slip. Its dispatch counter supplied a forwarding address. | The stamp on the collection slip was from a guard contractor {who} knew. The dispatch desk gave the crew a forwarding address. |
| 44 | A nervous cashier wanted someone present during the count. {who} arranged the handover without promising to frighten anybody. | The cashier didn't want to do the count alone. {who} set up the handover and said the crew could stand by without leaning on anyone. |
| 47 | {who} watched the collection counter from the public tables. The person making the rounds matched the description. | From a public table, {who} spotted someone on the collection rounds who fit the description. |
| 48 | The crew found a quiet moment to check the posted collection schedule. It named a different counter from the one everyone had suggested. | When it went quiet, the crew had a look at the posted collection times. The schedule sent them to a different counter. |
| 51 | {who} matched two references filed under different shop names. They led to the same payment desk. | There were two shop names on the records, but {who} matched the references and found they both went through the same payment desk. |
| 52 | A damaged receipt still held a readable transaction number. The clerk used it to locate the disputed payment. | The receipt was damaged, but the clerk could still read the transaction number and look up the payment in dispute. |
| 55 | {who} persuaded both sides to compare their copies. One had been arguing from the deposit, the other from the balance. | When {who} got both sides to put their copies on the table, it turned out one meant the deposit and the other meant what was left to pay. |
| 56 | A reluctant intermediary agreed to forward the enquiry. 'Apparently asking politely was the unusual part,' {who} said. | The go-between didn't want to get involved, but agreed to pass the question on. “All I did was ask nicely,” {who} said. |
| 59 | {who} retraced the collection route and found a stop missing from the written schedule. | On a second pass along the collection route, {who} spotted a stop that wasn't on the schedule. |
| 60 | A delivery driver remembered the address by its impossible loading turn. The crew found it without needing to attempt the turn. | A driver remembered the address because the turn into the loading bay was so tight. The crew found it without having to make the turn. |
| 63 | The account holder couldn't manage a long meeting under the strip lights. {who} arranged a short conversation somewhere quieter and got the authorisation details. | The strip lights were too much for the account holder. {who} got the approval details in a quick chat somewhere quieter. |
| 64 | {who} kept the questions brief when a collector needed rest. The useful answer was which desk held the payment. | The collector needed rest, so {who} only asked what mattered and found out which desk had the money. |
| 67 | The broker waited for the crew to accept a smaller share. {who} waited for the agreed terms. | The broker let a lower offer sit on the table. {who} waited until the original terms were back on it. |
| 68 | Three people talked over the same receipt. {who} let them finish, then asked who actually had the envelope. | After three people talked over each other about the receipt, {who} asked the one question nobody had answered: who had the envelope? |
| 69 | A clerk kept returning to an irrelevant missing stamp. {who} calmly asked which written rule required it and got the correct form instead. | The clerk kept asking for a stamp. When {who} asked to see where it was required, the clerk handed over the right form. |
| 70 | The payer tried silence after running out of objections. The crew let the silence work until a meeting time followed. | When the payer went quiet, the crew didn't rush to fill the gap. It was the payer who eventually suggested a time to meet. |
| 75 | The envelope held expired meal vouchers. The person describing it had been very confident about the word 'cash'. | The envelope held meal vouchers past their date, not the cash someone had sworn was inside. |
| 76 | A supposed reserve turned out to be money somebody expected to make next week. | The money set aside for the job turned out to be takings someone only hoped to have next week. |
| 77 | The address existed. The business offering payment had left behind a sign and an unpaid electricity bill. | The crew found the address, but the business was gone. Its sign and an overdue power bill were still there. |
| 78 | Someone had already collected the money. The notice remained because nobody wanted to climb up and remove it. | By the time the crew saw the notice, the money had already been picked up. Nobody had wanted to climb up and take the notice down. |
| 79 | The fee depended on a payment that depended on a winning bet. The crew stopped following that particular chain. | The crew dropped the lead when they found out their fee depended on somebody else's bet coming in. |
| 82 | {who} heard an excellent explanation of why payment was certain. It contained no available money. | Someone talked {who} through all the reasons the money was as good as paid. When it came to the cash itself, there wasn't any. |
| 83 | The introduction led to someone seeking a loan. 'Wrong side of the transaction,' {who} reported. | The person they'd been sent to wanted to borrow money. “They thought we were lending,” {who} reported. |
| 86 | The payment confirmation was a saved draft. Nothing had actually been transferred. | What looked like proof of payment was a draft that had never gone through. |
| 87 | {who} recovered the missing attachment. It was a photograph of the same invoice from a slightly worse angle. | When {who} got the missing attachment open, it was just a blurrier photo of the invoice they already had. |
| 92 | A broker added a forwarding fee after arranging the appointment. The crew paid to keep the meeting. | Once the appointment was booked, the broker asked for a forwarding fee. The crew paid so the meeting would go ahead. |
| 93 | {who} scraped a palm on a cracked counter edge. The owner supplied a dressing from beside the till. | A crack in the counter took some skin off {who}'s palm. The owner pulled a dressing out from beside the till. |
| 94 | The meeting moved to a private room with a table charge. Apparently discretion came with a minimum order. | The crew had to pay for a table when the meeting moved into a private room. There was a minimum order even if nobody was hungry. |
| 95 | The Wet Sleeve took an interest in the crew's collection paperwork. A cash payment shortened the inspection. | The Wet Sleeve took a look at the collection papers. The check ended early, and the crew came away a little lighter on cash. |
| 98 | {who} caught a slipping cash drawer before it hit the floor. The bruise arrived before the thank-you. | The cash drawer slipped, and {who} caught it before it hit the floor. There was a bruise by the time anyone said thanks. |
| 99 | A former guard mistook the crew's questions for a challenge to the collection arrangement. Their name reached people who hadn't needed to hear it. | A former guard took the crew's questions as a challenge over who got to collect. Word about the crew got around. |
| 102 | A watcher noticed the crew checking the handover point. Keeping the collection discreet became harder. | Someone keeping watch saw the crew check the meeting spot. The handover wasn't going to be as quiet now. |
| 103 | {who} caught a shin on a crate beneath an awning. The scrape was small; the opinion of the crate was not. | Under the awning, {who} scraped a shin on a crate and had a few words for it. |
| 106 | The crew's transport was clamped while a meeting ran long. The release fee came out of their pocket. | The meeting took long enough for the crew's transport to get clamped. They paid to get it released. |
| 107 | {who} scraped a loading barrier while reversing through the delivery lane. Its owner wanted the repair paid before anyone left. | Backing up in the delivery lane, {who} clipped a barrier. The owner made the crew pay for the damage before they left. |
| 112 | A stallholder paid {cash} for taking a forgotten order to the correct counter. | For taking an order that had been left behind to the right counter, the crew got {cash} from a stallholder. |
| 113 | {who} helped carry a returned delivery down the street before closing. The supplier paid {cash}. | The supplier gave {who} {cash} for helping carry a returned order down the street before closing. |
| 114 | A courier offered {cash} for covering a short collection while a trolley wheel was repaired. | While a trolley wheel was being fixed, the crew covered a quick pickup for a courier and got {cash} for it. |
| 117 | A repair stall clearing a shelf offered the crew a pouch of usable implant parts. | The crew got a pouch of implant parts that still worked from a repair stall making room on a shelf. |
| 118 | {who} found a serviceable pistol holster among a trader's unwanted fittings. The trader said it could go with the empty packaging. | Among the fittings a trader was throwing out, {who} spotted a pistol holster that was still good. The trader let it go with the empty boxes. |
| 119 | A clinic technician gave the crew a spare trauma bag after replacing its worn strap. | After putting a new strap on a spare trauma bag, a clinic technician let the crew have it. |
| 122 | A stallholder mentioned surplus equipment due for sale after a shop move. The crew noted who to ask later. | A stallholder said some spare equipment would go up for sale after a shop moved. The crew made a note of who to ask. |
| 123 | Someone in the supper queue knew of another paid collection. The crew kept the tip separate from the current run. | Word of another collection that paid came from the supper queue. The crew saved it for another run. |
| 128 | The payment desk stayed closed. Its handwritten opening hours continued to make a persuasive case for being open. | According to the handwritten hours, the payment desk should have been open. It stayed shut. |
| 129 | {who} waited through an entire kettle. Nobody arrived with anything to sign. | By the time {who} emptied the kettle, nobody had shown up with the paperwork. |
| 130 | The promised reply didn't come. Upstairs, the mahjong players had considerably more to say. | There was still no reply. The mahjong game upstairs was about the only thing anyone heard. |
| 131 | Nothing changed except the queue. It acquired a second argument and no extra clerk. | The queue picked up another argument, but nobody sent out a second clerk. |
| 132 | A cashier said the approval was pending. 'Still pending after lunch,' {who} reported, 'but better fed.' | The cashier said approval was still pending. {who} checked after lunch and got the same answer. |
| 133 | The crew watched the collection point beneath a looping holo-ad. The advert made more promises than the broker, narrowly. | While the crew kept an eye on the collection point, the same holo-ad kept coming round. It was only just ahead of the broker on promises. |
| 138 | {contact} found the missing receipt beneath a newer stack. It named the person authorised to release payment. | Under a stack of newer receipts, {contact} found the one that showed who could release the money. |
| 139 | A message from {contact} supplied a meeting time and a number that actually worked. | {contact} sent word of when to meet and included a number the crew could reach. |
| 140 | {who} checked in with {contact}. Somebody had agreed to discuss the amount after the evening rush. | When {who} asked {contact} for news, there was an offer to talk figures once the evening rush was over. |
| 143 | {contact} had mistaken money promised for money available. The distinction occupied most of the conversation. | What {contact} thought was cash on hand was only a promise. It took most of the conversation to get that straight. |
| 144 | The number from {contact} reached a disconnected handset. There was no second number to try. | The handset on the number {contact} gave them was out of service, and that was the only number they had. |
| 147 | {contact} mentioned the collection within earshot of a rival broker. The crew's business became street gossip. | A rival broker overheard {contact} talking about the collection. Soon it wasn't just the crew's business. |
| 148 | An extra introduction fee appeared when {who} spoke to {contact}. Paying it kept the appointment available. | When {who} got hold of {contact}, the introduction came with a new fee. The crew paid rather than lose the appointment. |
| 153 | {who} returned to {place} with the reference number. Someone recognised it and fetched the correct ledger. | Back at {place}, {who} gave the reference to someone who knew it and brought out the right ledger. |
| 154 | A different clerk was working at {place}. This one knew where the envelope had gone. | This time there was a clerk at {place} who knew what had happened to the envelope. |
| 155 | The crew checked {place} during collection hours. The person they needed arrived carrying the account book. | During collection hours at {place}, the person the crew was looking for turned up with the account book. |
| 158 | The offer at {place} had been posted for somebody else. Nobody knew how to reach them. | Someone at {place} said the offer was meant for another person, but nobody had a way to contact them. |
| 159 | A second enquiry at {place} exposed an old notice beneath a new date. The money had gone months ago. | When the crew asked again at {place}, they found out someone had put a fresh date on an old notice. The cash had been gone for months. |
| 162 | A collector at {place} began asking why the tong was enquiring about payments nearby. The crew attracted unwanted attention. | The crew's questions about nearby payments drew a collector's attention at {place}. Now the collector had questions of their own. |
| 163 | {who} slipped on wet paving at {place}. A bruised knee made the nearest stool worth considering. | On the wet paving at {place}, {who} slipped and bruised a knee. A stool nearby looked good after that. |
| 168 | The money was there, counted and available. The remaining step was the agreed handover. | The cash had been counted and was ready. It just needed to change hands as agreed. |
| 169 | Both sides accepted the figures. Somebody fetched the cash box instead of another explanation. | Once everyone agreed on the sum, someone went for the cash box instead of arguing it again. |
| 170 | The authorised payer arrived with the envelope. The name matched the paperwork. | The person with the envelope showed up, and the paperwork said they were the one allowed to pay. |
| 171 | The recovery fee was agreed in writing. 'Same number out loud and on paper,' {who} reported. | {who} reported that the recovery fee was down in writing and matched what they'd agreed aloud. |
| 174 | The cash appeared, along with a new claim on it. The crew asked everyone to keep their receipts visible. | The money was on the table when someone else laid claim to it. The crew asked everyone to leave their receipts where they could see them. |
| 175 | The payer offered less than agreed and called it a convenience adjustment. | The payer came up short and said the difference was for the convenience. |
| 176 | Someone had counted the money differently. The disagreement began before the envelope opened. | Before anyone even opened the envelope, somebody said the count was wrong. |
| 177 | The collection was within reach when a second intermediary demanded a share. The payer looked almost relieved to have another excuse. | Just as the crew was about to collect, another go-between asked for a cut. The payer looked glad of the delay. |
| 181 | A rival collector grabbed the envelope and swung at the person holding it. The crew got caught at the counter and called it in. | At the counter, a rival collector seized the envelope and took a swing at the person who had it. The crew was still there and called it in. |
| 182 | The payer's companions blocked the exit and demanded the crew's own cash. A stool came swinging, and they're calling it in. | The people with the payer blocked the door and wanted the crew's cash. When someone swung a stool, the crew called it in. |
| 183 | Someone pulled a weapon during the count. The first shot broke a light, and the crew called it in. | A weapon came out while they were counting the cash. The first shot took out a light, and the crew called it in. |
| 184 | The handover stopped when a second group forced through the curtain. A table went over under the first shove, and they're calling it in. | Another group shoved through the curtain in the middle of the handover. The table went over as the pushing started, and the crew called it in. |
| 188 | The crew brought the agreed sum home. Joss counted it without accepting anybody's rounded version. | Back home with the agreed amount, the crew gave it to Joss to count. Joss used the exact figure. |
| 189 | The full amount reached the safehouse in a plain envelope. Someone had written 'cabbage' on the front. | All the money made it back to the safehouse in an envelope marked “cabbage”. |
| 190 | {who} put the envelope beside the ledger. 'Actual money. You can stop looking at me like that.' | {who} set the envelope by the ledger. “It's all there, if you want to count it yourself.” |
| 191 | The run paid what it was meant to pay. Joss filed the receipt before it acquired a noodle stain. | The crew got the full sum, and Joss filed the receipt before the noodles got anywhere near it. |
| 194 | The crew brought home part of the sum. The unpaid balance stayed unpaid, whatever the promises said. | Only part of the sum made it home. There was a promise for the rest, but no cash. |
| 195 | Some of the money reached the safehouse, not all of it. Joss recorded the difference. | Joss took down what reached the safehouse and how much was still owing. |
| 196 | {who} put a smaller envelope on the table than the tong had hoped for. 'Less than planned. More than an apology.' | {who} set a thin envelope on the table. “Not what we went for, but at least it's money.” |
| 197 | The run covered part of the target. Nobody tried to count assurances as banknotes. | The crew made part of the target and left the promises out of the count. |
| 200 | The main collection paid nothing. Only the finds along the way counted towards the run. | Nothing came out of the collection itself. All the crew had to show for it were the side finds. |
| 201 | No money reached the safehouse. Joss kept the side finds separate from the empty collection. | The collection brought no cash back to the safehouse. Joss logged what the crew had picked up on the side separately. |
| 202 | {who} closed the run without securing the sum. 'The promises were very generously sized.' | {who} called it without the money. “Plenty of promises, if anyone wants those.” |
| 203 | The promised money never materialised. Whatever the journey had turned up was all there was. | The cash they were promised never turned up. The crew had only what they'd picked up along the way. |
| 208 | {who} kept a folded lucky receipt separate from anything Joss might need to audit. | {who} tucked a folded lucky receipt away from the stack for Joss. |
| 209 | A note from {who} suggested that bad luck and handling charges were becoming difficult to distinguish. | {who} wrote in the notes that it was getting hard to tell a handling fee from a run of bad luck. |
| 212 | {who} regarded the phrase 'only a small fee' as an invitation to become extremely attentive. | At “only a small fee”, {who} leaned in to hear the exact amount. |
| 213 | The word 'approximately' had received a firm underline in {who}'s notes. | {who} underlined “approximately” hard enough to leave a mark on the next page. |
| 216 | {who} kept asking whether people had eaten, even when they were being difficult. | Even when someone made things difficult, {who} still asked if they'd had supper. |
| 217 | A margin note from {who} remembered the counter staff more kindly than the arrangements they worked under. | In the margin, {who} put in a good word for the counter staff and none for the way the place was run. |
| 220 | {who} had developed a very specific opinion about people who said 'just a moment'. | {who} had a few choice words about people who said “just a moment”. |
| 221 | The report from {who} contained one sentence crossed out hard enough to make it interesting. | {who} crossed out one sentence so hard the paper nearly tore. |
| 224 | {who} preferred promises with a name, a date and somebody willing to answer the telephone. | {who} wrote down the name and date, then asked for a number someone would actually answer. |
| 225 | The word 'straightforward' had made {who} less comfortable, not more. | At the word “straightforward”, {who} started asking what had been left out. |
| 228 | {who} treated the waiting as weather: inconvenient, not personally arranged. | {who} waited it out without saying a word about whose fault the delay was. |
| 229 | The notes from {who} remained neatly written, which was more restraint than the paperwork deserved. | Even with the paperwork a mess, {who} kept every line of the notes neat. |
| 232 | {who} kept the amount separate from the story told about it. | {who} wrote down the amount on its own line, away from the story that came with it. |
| 233 | Sympathy hadn't changed {who}'s view that an unpaid sum was still unpaid. | {who} heard out the whole story and still marked the amount unpaid. |
| 236 | {who} maintained that good manners were free and therefore excellent value. | {who} said being polite was the one thing nobody had charged for yet. |
| 237 | The report from {who} gave everyone's name correctly, including the people nobody liked. | {who} got every name right in the report, even the ones nobody wanted to hear again. |
| 240 | {who} wanted to know why cash boxes so often smelled faintly of biscuits. | {who} asked if anyone else thought cash boxes always smelled a bit like biscuits. |
| 241 | A question in {who}'s notes asked when handling charges had become a profession. | {who} scribbled a question in the notes about when charging handling fees had become a job in itself. |
| 244 | {who} blamed a flickering optic display for making every total look negotiable. | {who} said the total seemed to change every time their optic display flickered. |
| 245 | The report included {who}'s reminder that implant upkeep also required actual money. | {who} added a note that whoever serviced their implants would want cash too. |
| 248 | {who} still disliked the sound of coins being counted behind a closed door. | {who} went still at the sound of coins being counted on the other side of a closed door. |
| 249 | The phrase 'you can trust me' had left {who} quieter than the rest of the conversation. | At “you can trust me”, {who} stopped saying much at all. |
| 253 | {who} and {other} compared copies of the figures over tea. Neither trusted the other's arithmetic until both totals matched. | Over tea, {who} and {other} each added up a copy of the figures. Neither put the numbers down until they got the same total. |
| 254 | A route discussion between {who} and {other} became an argument about which stairs counted as a shortcut. | {who} and {other} went over the route and ended up arguing about whether the stairs saved any time. |
| 255 | {who} practised asking for payment while {other} supplied increasingly implausible excuses. Both recognised too many of them. | While {who} rehearsed asking for the money, {other} tried out one bad excuse after another. They'd both heard most of them before. |
| 256 | The crew waited between appointments while {who} and {other} debated whether a free biscuit created an obligation. | Between appointments, {who} and {other} tried to decide what you owed someone after taking a free biscuit. |
| 257 | {who} checked the references while {other} checked the addresses. They caught a transposed number before setting off. | With {who} reading the references and {other} checking the addresses, the crew spotted two digits the wrong way round before they left. |
| 258 | A quiet stretch gave {who} and {other} time to compare their worst-paying jobs. Neither accepted the other's winner. | During a lull, {who} and {other} each picked the worst-paying job they'd ever done. Neither would concede. |
| 262 | Joss: "I've left room for the actual figure. Optimism doesn't need its own column." | Joss: “I've left the amount blank. We can fill it in when there's a number we can count.” |
| 263 | Joss: "Keep the receipts dry. I can read a stain, but it rarely says anything useful." | Joss: “Keep the receipts away from the tea. A ring where the total should be doesn't help me much.” |
| 264 | Joss: "Our expenses remain expenses even when someone calls them a courtesy." | Joss: “They can call it a courtesy if they like. It still goes under expenses.” |
| 265 | Joss: "Eat something. Being hungry won't improve anyone's arithmetic." | Joss: “Get some food in you before you add it all up again. The numbers can wait a minute.” |
| 268 | Joss: "Counted and entered. We can enjoy it now, preferably without spending it twice." | Joss: “It's in the books. We can enjoy having it without finding two ways to spend it.” |
| 269 | Joss: "The full amount. A pleasingly uncomplicated number." | Joss: “We got the whole sum. Nice not to have to explain a difference for once.” |
| 270 | Joss: "That's ours, then. Put the kettle on before somebody invents another fee." | Joss: “It's ours now. Let's have tea while nobody's charging us for anything.” |
| 273 | Joss: "I've closed the collection. We can be disappointed without leaving the books open." | Joss: “I've closed the entry for the collection. No need to leave it open just because we wanted a better result.” |
| 274 | Joss: "No money. I've recorded the finds separately, exactly as reported." | Joss: “Nothing from the collection. I put the finds in separately, just as you reported them.” |
| 275 | Joss: "You're here. The money isn't. We'll plan from those facts." | Joss: “You're back and the cash isn't. We can work out what to do next from there.” |

### `src/data/advlog/recruit.js`

| Line | Current | Alternative |
| --- | --- | --- |
| 8 | {contact}, {contactWhat}, had heard of {lead}. {who} asked whether a message could get through. | {contact}, {contactWhat}, knew who the crew meant by {lead}. {who} asked if there was a way to pass on a note. |
| 9 | Word of {lead} brought the crew to {place}. The introduction apparently began with buying lunch. | The crew went to {place} on a tip about {lead}. It turned out lunch came before introductions. |
| 10 | {who} started at {place}, asking about {lead} between the lunch rush and the washing-up. | Once the lunch crowd thinned at {place}, {who} started asking about {lead} over the clatter of bowls. |
| 11 | The search began with {contact}, {contactWhat}, who knew of {lead} but wanted to know what sort of tong was asking. | Before saying any more about {lead}, {contact}, {contactWhat}, asked what kind of work our tong took on. |
| 12 | Someone had recommended {lead} over a noisy counter. The crew took the description to {place} before the details got any thinner. | The crew caught a few words about {lead} over the counter noise and took what they could remember to {place}. |
| 13 | A note from {contact}, {contactWhat}, mentioned {lead}. Underneath was written: 'Ask properly. Don't just turn up.' | At the bottom of a note about {lead}, {contact}, {contactWhat}, had added: "Get introduced. Don't knock on their door." |
| 14 | The crew followed word of {lead} to {place}. Somebody there had offered to make an introduction. | Someone at {place} had said they could put the crew in touch with {lead}. The crew went there to take them up on it. |
| 15 | An enquiry about {lead} reached {contact}, {contactWhat}. {who} went along with a number to pass on and no expectation of an address. | When word got to {contact}, {contactWhat}, that the crew was looking for {lead}, {who} brought a number to leave and didn't ask where anyone lived. |
| 18 | {who} asked {contact}, {contactWhat}, about {lead} while helping clear the empty bowls. The answer came without the usual audience. | While helping stack the bowls, {who} asked {contact}, {contactWhat}, about {lead}. By then the people who liked to listen in had gone. |
| 19 | A conversation at {place} turned towards {lead}. {who} asked who could introduce the tong without making it sound like a collection. | When {lead} came up at {place}, {who} asked who could make it clear that the tong had an offer, not a bill to collect. |
| 22 | {who} found an old work notice from {lead} on a local message board. Its replies pointed towards {place}. | On the local message board, {who} dug up an old work notice from {lead}. The replies gave the crew a reason to try {place}. |
| 23 | A public repair discussion mentioned {lead} and {contact}, {contactWhat}. The crew asked for a message to be forwarded. | Both {lead} and {contact}, {contactWhat}, came up in a public thread about repairs. The crew asked if someone there would pass on a note. |
| 26 | {who} checked {place} after hearing about {lead}. There was somewhere to ask questions without the next table listening. | {who} took a look around {place} after a tip about {lead}. There was a spot where an enquiry could stay between two people. |
| 27 | The crew approached {contact}, {contactWhat}, quietly about {lead}. Changing work was nobody else's evening entertainment. | No one at the next table heard the crew ask {contact}, {contactWhat}, about {lead}. A change of job didn't need spectators. |
| 32 | A stallholder recognised the description and offered to pass on the tong's number after closing. | The description rang a bell with a stallholder, who said the tong's number would go out once the shutters came down. |
| 33 | {who} found someone who had worked alongside the person they wanted. The reference included a warning about terrible singing. | Someone {who} found had done shifts with the runner and vouched for the work, if not for the singing. |
| 34 | The invitation reached the right handset. A reply asked what a normal week with the tong looked like. | We knew the message had got through when the reply came back: "What do you lot do in a normal week?" |
| 35 | Someone supplied a name and corrected the pronunciation twice. The crew practised before sending the message. | The name came with two corrections to how we said it. The crew tried it out loud before sending anything. |
| 36 | A former colleague agreed to make the introduction. 'Don't do the speech about opportunity. Just say what you pay.' | A former workmate said they'd put in a word. "Leave out the big pitch. Tell them what the wages are." |
| 37 | The reply asked whether the tong expected people to work through neural load. {who} sent the question to the fixer. | "Do we still have to go out when the neural load gets bad?" {who} passed the reply straight to the fixer. |
| 38 | A counterkeeper remembered who had collected the last repair order. That gave the crew someone useful to ask. | The person behind the counter remembered who'd picked up the last repair. At least the crew had someone to ask now. |
| 39 | The enquiry moved from a public board to a direct message. Somebody wanted to know more without the whole street commenting. | A private reply came in to the public post. Whoever sent it had questions they didn't want the neighbours answering for them. |
| 40 | An acquaintance offered to arrange a short conversation between shifts. The crew asked what time actually meant between shifts. | An acquaintance offered a few minutes between shifts. The crew asked when that was, by the clock. |
| 41 | The person forwarding messages asked for the fixer's name. This time it was going on an invitation, not another list of questions. | This time the go-between needed the fixer's name for an invitation, not another round of enquiries. |
| 44 | {who} checked a reference with a former door guard. The useful part concerned restraint, not the story about the broken table. | A former door guard gave {who} a reference. There was a story about a table, but what mattered was knowing when to stop. |
| 45 | A clinic attendant remembered someone keeping a frightened customer calm during a security scare. {who} asked whether an introduction was possible. | The clinic attendant remembered who'd talked a customer through a security scare. {who} asked if the attendant could put them in touch. |
| 48 | {who} found a quiet moment to leave the invitation while the nearby collectors were occupied elsewhere. | When things went quiet near the collectors, {who} found a moment to leave the invitation without a fuss. |
| 49 | The proposed meeting corner was overlooked by a busy gambling room. {who} suggested a less public table and got an agreement. | Everyone in the gambling room could see the suggested meeting spot. {who} got the other side to agree to a quieter table. |
| 52 | {who} traced a public work notice to an active account. Its owner agreed to forward the enquiry. | The account behind the public work notice was still active. {who} got a reply from its owner offering to pass the message on. |
| 53 | A repair stall still had permission to contact its former subcontractor. The owner sent the tong's message while the crew waited. | The repair stall was still on speaking terms with its old subcontractor. The owner had permission to send our note and did it while we waited. |
| 56 | {who} answered questions over noodles without promising an easy life. The next reply asked when the fixer was available. | Over noodles, {who} told them what the work was like on a bad day as well as a good one. They asked when the fixer had time. |
| 57 | A suspicious acquaintance softened after hearing the crew describe an ordinary working day. 'That sounds more believable than exciting.' | The acquaintance stopped looking for the catch once the crew got onto the ordinary work. "Well, that sounds like a real job." |
| 60 | {who} found the dispatch counter where a message could be left between delivery runs. The clerk confirmed it would reach the right person. | At the dispatch counter, {who} found a place to leave a note between runs. The clerk knew who it was for and said it would get there. |
| 61 | A delivery driver recognised the description from the late rounds. {who} arranged for an invitation to travel with the next collection slip. | One of the late-round drivers knew the description. {who} got the invitation included with the next collection slip. |
| 64 | {who} asked about rest arrangements before availability. The intermediary stopped giving rehearsed answers and offered an introduction. | Before asking when the runner could start, {who} asked what time they'd need to rest. The go-between dropped the stock answers and offered to introduce us. |
| 65 | A clinic worker agreed to forward the invitation without sharing patient details. {who} left a number and kept the conversation brief. | The clinic worker kept the records private but agreed to send the note along. {who} left a number and didn't press for anything else. |
| 68 | The reply listed several reasons not to trust a tong. {who} answered the questions underneath them. | Most of the reply was about why tongs couldn't be trusted. {who} kept to the questions the person actually wanted answered. |
| 69 | An intermediary let the silence stretch over three rounds of mahjong downstairs. {who} waited and got permission to send a message. | Three games of mahjong went by downstairs before the go-between spoke again. {who} hadn't pushed, and got the go-ahead to send the note. |
| 74 | The description fitted someone who had moved on months ago. The stallholder still spoke about them in the present tense. | The stallholder talked as if the person still came by every week. It turned out they'd been gone for months. |
| 75 | A promising introduction led to someone looking for customers, not work. The crew received a very thorough price list. | The person we'd been sent to was drumming up business, not looking for a job. We left with every price they charged. |
| 76 | The note had been pinned over an older note. Everyone had been reading the wrong telephone number. | One note was pinned right over another, leaving the old number visible. That's the number everyone had been calling. |
| 77 | Someone had confused leaving a shift with leaving an employer. 'Understandable ambition,' {who} said. | It turned out they'd clocked off, not quit. "Easy to get the two mixed up if you hate the job," {who} said. |
| 78 | The person behind the recommendation admitted to knowing only a nickname. Three different people answered to it. | The person making the recommendation could only give a nickname. Three people turned at the sound of it. |
| 81 | {who} heard an excellent account of someone's abilities. The storyteller eventually admitted it had come from a customer of a customer. | The reference sounded good until {who} asked how the storyteller knew any of it. The whole thing had come from a customer's customer. |
| 82 | A broker promised an introduction after supper. Supper ended, the stools went up, and the introduction remained theoretical. | We waited out supper on the strength of the broker's promise. By the time the stools were stacked, there was nobody left to introduce. |
| 85 | The work profile was still active because a stall kept reposting old adverts. Nobody had checked the replies. | A stall kept putting up the same old work ads, so the profile looked current. No one there was reading the answers. |
| 86 | {who} recovered the missing contact details. They belonged to the shop that had printed the notice. | When {who} found the contact details that were missing, all they got us was the shop that printed the notice. |
| 87 | The contact account had been abandoned. Its automatic reply was more enthusiastic than its owner. | "Thanks for getting in touch," said the automatic reply from an account nobody used any more. |
| 92 | A broker charged a forwarding fee that hadn't been mentioned over the handset. The crew paid to keep the enquiry moving. | The broker had left the forwarding charge out of the call. We paid it rather than let the message sit there. |
| 93 | {who} scraped a knuckle on a broken stool while making room at a counter. The owner produced a dressing from beside the till. | A busted stool scraped {who}'s knuckle as they made room at the counter. The stallholder reached under the till for a dressing. |
| 94 | A changed appointment meant paying for a private table elsewhere. The original table had become a birthday dinner. | By the time the appointment moved, our old table was full of birthday guests. The crew had to pay for another table with some privacy. |
| 95 | The Wet Sleeve took an interest in the crew's questions. A cash payment shortened the discussion. | The Wet Sleeve wanted to know why we were asking around. It took cash to end the conversation. |
| 96 | A former employer heard the enquiry and began asking which tong was taking staff. The crew's name travelled further than intended. | Word reached a former employer, who started asking which tong was after their staff. More people knew our name than we'd meant to tell. |
| 99 | A bouncer at the meeting spot decided {who} looked like trouble and said so with a shoulder. The bruise lasted longer than the argument. | The bouncer took one look at {who} and decided they were trouble. The shoulder left a bruise long after the words were forgotten. |
| 100 | {who} was asked to prove they could handle themselves before anyone would talk. The proof cost a sleeve and some pride. | Nobody would talk until {who} showed they could handle themselves. They got their answers with one sleeve torn and nothing to brag about. |
| 101 | {who} caught a falling stack of stools before it reached the table. The resulting bruise earned an apology and no discount. | The stools tipped towards the table, and {who} caught the stack. They got a bruise and a sorry, but the bill stayed the same. |
| 104 | A watcher noticed the crew checking a meeting spot. The quiet approach stopped being quiet. | Someone had been watching the meeting spot and saw the crew looking it over. So much for keeping the visit to ourselves. |
| 105 | {who} caught a shin on a crate tucked beneath an awning. The scrape was small; the crate received a detailed review. | There was a crate under the awning that {who} didn't see until it scraped their shin. The crate got an earful. |
| 108 | The delivery lane closed while the crew were inside. Getting their transport released cost a storage fee. | While we were indoors, the delivery lane closed. We couldn't get our transport back without paying for storage. |
| 109 | {who} scraped a barrier while reversing out of a crowded loading bay. The owner wanted the repair paid in cash. | The loading bay was packed, and {who} scraped a barrier backing out. The owner asked for cash for the damage. |
| 114 | A stallholder paid {cash} for taking a forgotten order to the correct counter. | A stallholder handed over {cash} after the crew dropped a forgotten order at the counter it was meant for. |
| 115 | {who} helped carry a returned delivery down the street before closing. The supplier paid {cash}. | The supplier gave {who} {cash} for helping lug a returned order down the street before the shutters came down. |
| 116 | A courier offered {cash} for covering a short collection while a trolley wheel was repaired. | With a trolley wheel off for repair, a courier paid the crew {cash} to make a nearby pickup. |
| 119 | A repair stall clearing a shelf offered the crew a pouch of usable implant parts. | The repair stall needed the shelf space more than it needed a pouch of working implant parts, so the crew got the pouch. |
| 120 | {who} found a serviceable pistol holster among a trader's unwanted fittings. The trader waved it away with the empty packaging. | Among the fittings being thrown out, {who} spotted a pistol holster that was still good. The trader said to take it. |
| 121 | A clinic technician gave the crew a spare trauma bag after replacing its worn strap. | The clinic technician had just put a new strap on a spare trauma bag and sent it along with the crew. |
| 124 | A stallholder mentioned surplus equipment due for sale after a shop move. The crew noted who to ask later. | A stallholder said some equipment would go up for sale after a shop moved. We wrote down who to ask when the time came. |
| 125 | Someone in the supper queue knew of a paid collection nobody had taken yet. It remained a tip, not an arrangement. | In the supper queue we heard about a pickup that paid and still had no takers. Nobody booked it. |
| 130 | No reply arrived. {who} watched a cook fold dumplings with increasingly unreasonable speed. | While the crew waited for a reply that never came, {who} watched the cook fold dumplings faster than anyone could count them. |
| 131 | The crew waited beneath an awning while the same holo-ad restarted every few minutes. Nobody learned anything new. | We stayed under the awning long enough to see the holo-ad loop a dozen times. Nothing else happened. |
| 132 | A promised call never came. The mahjong room upstairs supplied enough noise to suggest several other people were having a day. | The handset didn't make a sound. The mahjong room upstairs made up for it. |
| 133 | Nothing changed on the message board. Someone had added a moustache to an implant advert. | The board had no replies for us. The only fresh work on it was a moustache drawn on an implant ad. |
| 134 | The invitation stayed unanswered. 'We could try looking less available,' {who} suggested from the same stool. | "Maybe we look too keen," {who} said, still on the same stool and still waiting for an answer. |
| 139 | {contact} had passed on the invitation. The reply asked whether the fixer would meet somewhere outside the tong's hall. | After {contact} passed the note along, the reply came back with a question: could the fixer meet away from the hall? |
| 140 | A message from {contact} supplied a name and permission to mention the introduction. | The crew got a name from {contact} and the go-ahead to say who'd put them in touch. |
| 141 | {who} checked in with {contact}. A short conversation could be arranged once the evening rush eased. | When {who} asked {contact} about timing, the answer was a few minutes once the evening crowd cleared. |
| 144 | {contact} had mixed up two people who used the same repair stall. Neither introduction reached the person the crew wanted. | Two people went to the same repair stall, and {contact} had them mixed up. Both introductions missed the person we were after. |
| 145 | The message through {contact} reached an abandoned account. There was no current number to try. | The account {contact} sent the note to was no longer in use. Nobody had a newer number. |
| 148 | {contact} discussed the enquiry within earshot of a collector. The crew's recruitment plans became street gossip. | A collector overheard {contact} talking about our enquiry. By then the crew weren't the only ones talking about who we might hire. |
| 149 | A message-handling fee appeared when {who} spoke to {contact}. Paying it kept the introduction available. | {who} hadn't been told that {contact} charged to pass on a message. The crew paid so the introduction would still go ahead. |
| 154 | {who} returned to {place} and found a reply tucked behind the counter. It asked what the tong expected from a new runner. | Behind the counter at {place}, {who} found a note back: "What would you have me doing if I joined?" |
| 155 | Someone at {place} recognised the description and offered to pass on the invitation after work. | At {place}, someone knew who we meant and said they'd take the note over once their shift was done. |
| 156 | The next visit to {place} produced a mutual acquaintance willing to introduce the fixer. | On the way back through {place}, the crew found someone both sides knew who'd be happy to introduce the fixer. |
| 159 | The recommendation at {place} had been copied from an old notice. Nobody knew whether its subject still worked nearby. | The tip from {place} came off a notice that had been up for ages. No one could say if the person still worked in the area. |
| 160 | A second enquiry at {place} exposed a misunderstanding. The person being recommended wanted a repair job done, not a new employer. | When we asked again at {place}, we found out why they'd asked around: they needed something fixed, not a job. |
| 163 | A collector at {place} started asking why the tong was recruiting nearby. The crew's questions became harder to keep discreet. | A collector at {place} started asking people why our tong was looking for staff. It was harder to ask around without being noticed after that. |
| 164 | {who} slipped on wet paving at {place}. A bruised knee made the nearest stool suddenly attractive. | Finding a seat took priority after {who} slipped on the wet paving at {place} and bruised a knee. |
| 169 | {leadShort} replied directly and asked when the fixer could talk. No intermediary needed to improve the wording. | The fixer got a reply from {leadShort} without anyone passing it on: "When can you talk?" |
| 170 | The invitation reached {leadShort}, who suggested somewhere quiet enough to hear the answers. | Once {leadShort} got the invitation, they suggested a table where neither side would have to raise their voice. |
| 171 | A message from {leadShort} asked about pay, downtime and the people already in the tong. The conversation was within reach. | {leadShort} sent back three things to talk about: wages, time off and who else worked here. We were close to getting a conversation. |
| 172 | {leadShort} wanted to hear the offer in person. The crew had a chance to arrange it without anyone charging for another introduction. | {leadShort} wanted the offer face to face, which meant the crew could set something up without paying another go-between. |
| 175 | {leadShort} answered, but wanted an old story about the tong explained before considering a meeting. | Before {leadShort} would consider sitting down, they wanted our side of a story they'd heard about the tong. |
| 176 | An intermediary claimed a fee just as {leadShort} became willing to talk. Nobody had mentioned owning the conversation before. | Just when {leadShort} said they'd talk, the go-between announced there was a fee. That was news to both sides. |
| 177 | {leadShort} was interested enough to ask difficult questions and unimpressed by the answers passed through other people. | The questions from {leadShort} were hard but fair. They didn't think much of getting the answers second-hand. |
| 178 | A possible meeting with {leadShort} came with one condition: no promises the fixer hadn't personally agreed to keep. | There was a chance of meeting {leadShort}, provided the fixer could stand behind every promise the crew made. |
| 182 | A broker demanded payment for letting the crew leave and swung a stool at {who}. The crew called it in. | The broker tried to charge the crew to leave, then swung a stool at {who}. The crew called for help. |
| 183 | A group claiming to control local hiring blocked the passage. Someone threw a punch, and they're calling it in. | People who said they ran hiring round here blocked the way. A punch was thrown and the crew called it in. |
| 184 | The conversation stopped when armed collectors forced through the curtain. A shot broke the counter light, and the crew called it in. | Armed collectors came through the curtain and cut the talk short. A shot put out the light over the counter, and the crew called it in. |
| 185 | Someone mistook the enquiry for an attempt to collect a debt and lunged across the table. The crew backed towards the doorway and called it in. | Someone thought we'd come for a debt and came across the table at us. The crew backed away and called it in. |
| 189 | {leadShort} agreed to meet the fixer. The crew brought the details home without calling it a new recruit. | The crew got a time for the fixer to sit down with {leadShort}. That's what they brought home, not a new runner. |
| 190 | The search ended with {leadShort} willing to discuss joining. The decision still belonged to the person coming through the door. | {leadShort} was willing to hear what joining would mean for them. It was still their call once they'd heard the offer. |
| 191 | {who} passed on the agreed meeting details. 'A conversation. Don't start assigning a bed.' | {who} handed over the time and place. "That's a meeting. Keep the spare bed spare." |
| 192 | The invitation was accepted for a meeting, not an oath. {leadShort} would hear the fixer out. | There'd be no swearing in yet. {leadShort} had only said yes to hearing the fixer out. |
| 195 | The crew brought home a checked name for {leadShort}, but no meeting. The introduction still needed work. | The name the crew brought back for {leadShort} checked out. They still needed someone to get a meeting. |
| 196 | There was a real name in the notes now. {leadShort} hadn't agreed to talk. | The notes had a name we could trust, but no agreement from {leadShort} to sit down. |
| 197 | {who} put the confirmed name beside the original description. The space for a meeting stayed blank. | Next to the description, {who} wrote the name we'd checked. The line for a time and place stayed empty. |
| 198 | The search identified {leadShort} without securing a conversation. That was progress, not a recruitment. | We worked out who {leadShort} was, but never got to put the offer to them. |
| 201 | The crew closed the search without a usable name or meeting. Only the finds along the way remained. | By the end, we had neither a name we could use nor a meeting. Anything we picked up on the side was all we kept. |
| 202 | No introduction held up. The expedition produced whatever the crew had found between enquiries. | None of the introductions came to anything. All the trip yielded was what the crew picked up between enquiries. |
| 203 | {who} brought the search notes home without a confirmed identity. The side finds were all there was to log. | {who} came home with a stack of notes and no confirmed name. Only the side finds went in the log. |
| 204 | The approach went nowhere. Joss recorded the finds separately and left the recruitment entry empty. | There was nothing to put down under recruitment. Joss gave the side finds their own entry. |
| 209 | {who} considered a proper introduction worth more than a lucky number, though having both seemed sensible. | {who} kept the lucky number on the note but still asked who'd be making the introduction. |
| 210 | A note from {who} asked whether mentioning the tong's altar made the invitation reassuring or ominous. | "Does the bit about the altar put people at ease or do the opposite?" {who} wrote beside the draft. |
| 213 | {who} wanted any prospective colleague to ask about wages before asking about reputation. | When the talk turned to the tong's name, {who} tapped the wages line and asked why nobody had started there. |
| 214 | The phrase 'a share of future success' had received a firm underline in {who}'s notes. | {who} drew a line under "a share of future success" and wrote "How much this week?" |
| 217 | {who} bought the contact's nephew a sugar cane drink and heard the whole family history for it. | {who} got a sugar cane drink for one of the contact's relatives and had heard the whole family history before the cup was empty. |
| 218 | A margin note from {who} said to ask about food preferences before choosing anywhere for a meeting. | Beside the choice of meeting spot, {who} wrote, "Ask what they eat before we pick a table." |
| 221 | {who} had little patience for anyone who described changing employers as betrayal. | {who} put the cup down hard at the word "betrayal" and said, "It's a change of job." |
| 222 | The report from {who} contained a strongly worded opinion about charging people to introduce themselves. | {who} left a note by the introduction fee: "At that price they can introduce themselves." |
| 225 | {who} preferred an awkward question to an answer that arrived too easily. | {who} heard an answer that came too fast and asked the awkward question anyway. |
| 226 | A cautious reply would have reassured {who} more than an immediate yes. | At the immediate yes, {who} left the box unticked and asked what the other side needed time to think over. |
| 229 | {who} let the silence run until the other side filled it. | When the talk stopped, {who} waited with both hands round the cup until the other person spoke. |
| 230 | The notes from {who} left room for an answer that wasn't the one the tong wanted. | Below the reply we hoped for, {who} left a blank line for whatever answer came back. |
| 233 | {who} checked the reference with three people the reference didn't know about. | {who} checked the reference with three people the person who gave it wouldn't have thought to ask. |
| 234 | {who} kept recommendations in one column and checked facts in another. | {who} drew a line down the page, with what we'd heard on one side and what we'd checked on the other. |
| 237 | {who} insisted that recruitment should sound less like arranging a dental appointment. | {who} read the draft aloud and said, "Are we inviting them to talk or booking a filling?" |
| 238 | The report from {who} included a reminder that remembering someone's name was not an advanced technique. | {who} put the person's name back in the draft where we'd written only "the candidate". |
| 241 | {who} wondered which detail about the tong would sound strangest to somebody new. | {who} read the description of the tong back to the crew and asked which bit we'd have to explain twice. |
| 242 | A question in {who}'s notes asked what people wished they had known before joining their previous crews. | {who} left a question in the margin: "What did your last crew leave out when you joined?" |
| 245 | {who} considered questions about implant downtime evidence of experience, not a lack of commitment. | When implant downtime came up, {who} marked it as a question from someone who'd done the work before. |
| 246 | The report from {who} underlined that useful hardware did not tell anyone whether its owner was good company. | {who} circled the list of implants and wrote next to it, "Fine, but can you share a table with them?" |
| 249 | {who} disliked invitations that sounded as though a person was expected to leave their old life at the door. | {who} crossed out "a fresh start" and wrote "a job offer" in its place. |
| 250 | The word 'family' had made {who} pause longer than the rest of the recruitment pitch. | When the pitch got to the word "family", {who} stopped reading and took a sip of tea. |
| 254 | {who} and {other} rehearsed describing the tong over tea. Each removed a detail the other had thought sounded welcoming. | Over tea, {who} and {other} tried out their versions of the pitch. Each crossed out something the other had meant as a welcome. |
| 255 | A wait between enquiries became an argument about which of {who} and {other} had looked more suspicious when joining. | While the crew waited for an answer, {who} and {other} each made a case for why the other had looked shadier on joining day. |
| 256 | {who} checked the names while {other} checked the numbers. They caught a mistake before sending the invitation. | {who} read out the names and {other} matched them to the numbers. One didn't fit, and the invitation hadn't gone out yet. |
| 257 | The crew paused while {who} and {other} debated whether mentioning the stairs counted as honesty or sabotage. | {who} wanted to warn them about the stairs. {other} asked if we were trying to get anyone through the door at all. |
| 258 | {who} asked {other} what would have made joining easier. The answer began with better directions and became unexpectedly thoughtful. | When {who} asked what would have helped on joining day, {other} started with directions and ended with what it was like to be the new person. |
| 259 | A quiet stretch gave {who} and {other} time to agree on a recruitment rule: nobody got described as 'the sensible one' without being present. | With time to spare, {who} and {other} agreed to call nobody "the sensible one" unless that person was there to object. |
| 260 | The crew paused while {who} and {other} argued over whether mentioning the safehouse kettle helped or hurt recruitment. | {who} called the safehouse kettle a point in our favour. {other} asked when it had last boiled the whole way through. |
| 264 | Joss: "Tell them what we're actually like. They can discover the kettle's personality in their own time." | Joss: "Just tell them how we work. The kettle can make its own introduction." |
| 265 | Joss: "I've kept their questions with the report. Let's answer those before inventing a welcome speech." | Joss: "Their questions are in with the report. Let's do those before we write the speech." |
| 266 | Joss: "We need another person, not a list of abilities that agrees with us." | Joss: "We're asking someone to work with us. A list of skills won't tell us how that goes." |
| 267 | Joss: "An unanswered message is still unanswered. We don't need to make it mean anything else yet." | Joss: "Nothing back yet. I'll leave it at that until they answer." |
| 270 | Joss: "A meeting, then. I'll remind everyone that listening is allowed." | Joss: "We've got a meeting. Let's leave enough room for them to get a word in." |
| 271 | Joss: "Good. Clean cups, clear terms, no one telling the embarrassing story before they've sat down." | Joss: "I'll remind everyone about the cups and the terms. The story can wait till they're sitting down." |
| 272 | Joss: "They're coming to talk. The ledger can wait until they choose to write in it." | Joss: "We've got time to talk. The ledger stays shut unless they want to sign it." |
| 273 | Joss: "Good. No name in the sworn ledger until they choose to write it." | Joss: "Good. If they decide to swear in, they write their own name." |
| 276 | Joss: "I've closed the search. No confirmed name, no invented explanation." | Joss: "Search closed. We didn't confirm a name, and we don't know why it went nowhere." |
| 277 | Joss: "We didn't get an introduction. That isn't a verdict on us or on someone we haven't met." | Joss: "No one put us in touch. That's all we know about them, and all it says about us." |
| 278 | Joss: "The finds are logged separately. We'll start the next search from what we actually know." | Joss: "I've put the finds in their own entry. Next time we'll start with what we can check." |

### `src/data/advlog/oldTown.js`

Contact names are retained verbatim; no canonical short or long forms are established for these contacts.

| Line | Current | Alternative |
| --- | --- | --- |
| 7 (name) | Yip Sau-lin | Yip Sau-lin |
| 7 (what) | a tea-shop counterkeeper who remembered orders better than names | a tea-shop counterkeeper who could put the right cup down without knowing whose it was |
| 8 (name) | Chan Wing-sum | Chan Wing-sum |
| 8 (what) | a retired lift mechanic with a folding chair outside the workshop | a retired lift mechanic who still set out a folding chair by the workshop door |
| 9 (name) | Farah Qureshi | Farah Qureshi |
| 9 (what) | a handset repairer who kept customers waiting while they tested the repair | a handset repairer who never handed a repair back until it worked twice |
| 10 (name) | Celina Ramos | Celina Ramos |
| 10 (what) | a laundry counterkeeper who knew the block by its work uniforms | a laundry counterkeeper who could tell which shift had finished by the uniforms at the window |
| 11 (name) | Lau Pak-cheung | Lau Pak-cheung |
| 11 (what) | a second-hand case dealer who measured everything with string | a second-hand case dealer who sized up every case with a length of string |
| 12 (name) | Adjoa Mensah | Adjoa Mensah |
| 12 (what) | a parcel-shop owner who made senders read the address back | a parcel-shop owner who wouldn’t take a parcel until the sender read the address aloud |
| 13 (name) | Tong Mei-suen | Tong Mei-suen |
| 13 (what) | a hardware-shop assistant saving to buy the retiring owner out | a hardware-shop assistant putting money aside to buy the shop when the owner retired |
| 14 (name) | Nalin Perera | Nalin Perera |
| 14 (what) | a generator repairer with a thermos strapped to the tool trolley | a generator repairer whose thermos had a permanent place on the tool trolley |
| 15 (name) | Leung Siu-ping | Leung Siu-ping |
| 15 (what) | a mahjong-parlour attendant who kept the lost property in biscuit tins | a mahjong-parlour attendant who sorted lost property into old biscuit tins |
| 16 (name) | Cheng Wai-kit | Cheng Wai-kit |
| 16 (what) | a handcart courier who charged by the staircase rather than the distance | a handcart courier who wanted to know how many flights before quoting a fare |
| 17 (name) | Marta Vale | Marta Vale |
| 17 (what) | a watch repairer who rented half a counter in a herbal shop | a watch repairer with just half a herbal shop counter to work on |
| 18 (name) | Lo Yuk-chun | Lo Yuk-chun |
| 18 (what) | a tenement caretaker who kept spare keys in labelled tea tins | a tenement caretaker who filed spare keys by landing in old tea tins |
| 22 | the rusted iron stairwell of Tenement Block 9 | the rusted iron stairs of Tenement Block 9 |
| 23 | the public landing beside the Red Incense Shrine | the public landing right next to the Red Incense Shrine |
| 24 | the covered tea tables on Alley 4 | the tea tables under cover on Alley 4 |
| 25 | the handset repair counter beneath the tenement stairs | the handset counter tucked under the tenement stairs |
| 26 | the laundry collection window under the dripping balconies | the laundry pick-up window below the dripping balconies |
| 27 | the second-hand case stall beside the tram stop | the stall selling second-hand cases by the tram stop |
| 28 | the parcel counter behind the herbal shop | the parcel desk at the back of the herbal shop |
| 29 | the hardware shop with drawer handles tied on with string | the hardware shop with string holding its drawer handles on |
| 30 | the generator workshop below the washing lines | the generator workshop under the lines of washing |
| 31 | the mahjong-parlour entrance above the shutter repair shop | the door to the mahjong parlour over the shutter repair shop |
| 32 | the handcart shelter beside the hillside tram stop | the cart shelter at the hillside tram stop |
| 33 | the watch repair counter inside the herbal shop | the watch bench inside the herbal shop |
| 34 | the public bench above the drainage-tunnel steps | the public bench at the top of the drainage-tunnel steps |
| 35 | the dai pai dong beneath the patched green awning | the dai pai dong under the green awning with the patches |
| 39 | {who} waited beneath Block 9's stairs while washing dripped into a row of buckets. Nobody came asking for us. | Under Block 9's stairs, {who} listened to washing drip into the buckets. There was no knock for us. |
| 40 | The tea-shop tables filled with people comparing old electricity bills. Our handset stayed quiet. | At the tea shop, whole tables compared electricity bills down to the last digit. We had nothing on our handset to read. |
| 41 | Mahjong tiles clacked above the waiting spot all afternoon. We heard every argument through the ceiling and nothing useful through the door. | Every dispute at the mahjong tables came through the ceiling. At the door where we were waiting, not a sound. |
| 42 | Rain drove us under a herbal shop's awning. The owner brought the drying roots inside and left us room to stand. | We stood under the herbal shop’s awning while the owner rescued the drying roots. There was just enough dry pavement for all of us. |
| 43 | A Hoi-Sing announcement kept repeating from a speaker with a torn cone. {who} waited through enough versions to learn which words were missing. | The torn speaker ate a different word each time it played the Hoi-Sing announcement. {who} pieced it together while we waited. |
| 44 | We sat beside the Red Incense Shrine while neighbours replaced the rain covers over the offerings. Nobody we were waiting for appeared. | Beside the Red Incense Shrine, we watched the neighbours put fresh covers over the offerings. Nobody came for us. |
| 45 | The old radio man on Block 9's roof played the same recording twice. {who} noticed; the appointment remained unconfirmed. | The old radio hand on Block 9's roof played the recording again. ‘Same one,’ said {who}, still waiting for confirmation. |
| 46 | Under the dai pai dong awning, a cook shelled peas between orders. We waited until the bowl was full. | Under the dai pai dong awning, the cook shelled peas between orders. By the time the bowl was full, we were still waiting. |
| 47 | Laundry hid most of the opposite landing. {who} watched the gap between two work shirts; nobody used the door. | Between two shirts on the line, {who} could see the opposite landing door. It stayed shut. |
| 48 | The tram-stop bench stayed damp even after the rain stopped. We waited standing up. | The rain let up before the tram-stop bench dried. We stood beside it and waited. |
| 49 | At midnight, cups of bitter tea appeared on the doorsteps along the lane. Our message still had no reply. | At midnight the doorsteps along the lane got their bitter tea. We still hadn’t had so much as a word back. |
| 50 | Somebody upstairs practised a mahjong shuffle on an empty table. {who} listened from the landing until the corridor lights switched to night mode. | From the landing, {who} heard someone upstairs practising a mahjong shuffle. The corridor lights dimmed; the tiles kept going. |
| 54 | A passing handcart caught our tea-shop table and tipped the pot. We paid for the broken cups before moving on. | A handcart brushed the tea-shop table and sent the pot over. The broken cups went on our bill. |
| 55 | {who} caught a palm on a rusted stair rail in Block 9. A shallow scrape needed cleaning before we carried on. | The rusted rail on the stairs in Block 9 left {who} with a scrape across the palm. We stopped to clean it. |
| 56 | The hillside tram stopped below our destination with a Hoi-Sing fault notice on its doors. We paid a shared-van fare for the rest of the climb. | The hillside tram went no further once the Hoi-Sing fault notice came up. We split a van fare for the rest of the hill. |
| 57 | Water from a tenement balcony soaked the papers {who} was carrying. The parcel shop charged to print fresh copies. | A balcony’s runoff soaked the papers {who} had brought. The parcel shop put a fresh set through the printer, at our expense. |
| 58 | A patrol pair took an interest in us beside an unlicensed generator. A small cash payment ended the conversation. | A patrol pair made us wait beside the unlicensed generator. We left a little lighter in the cash department. |
| 59 | The tea-shop owner needed the waiting table for lunch customers. We bought another pot to keep the seats. | Lunch customers were waiting for our tea-shop table. Another pot bought us a little more time on the same seats. |
| 60 | {who} slipped on wet joss-paper ash beside a doorstep. A bruised knee made the stairs less appealing. | Wet joss-paper ash sent {who} down onto one knee. The bruise could be felt on every stair. |
| 61 | A handcart courier wanted a separate stair fee after seeing the slope. We paid rather than leave the load in the rain. | The handcart fare went up when the courier saw the stairs. We paid it rather than let the load get any wetter. |
| 62 | The mahjong-parlour attendant charged a table minimum while we waited downstairs. Apparently the downstairs chairs counted too. | The mahjong-parlour attendant added the table minimum to our bill downstairs. We hadn’t even been given a table. |
| 63 | A loose awning hook tore the cover on our bag. The laundry counter charged a little to stitch it before the rain got in. | The bag cover snagged and tore on an awning hook. We paid the laundry counter to sew it up before the next shower. |

### `src/data/advlog/docks.js`

Contact names are retained verbatim; no canonical short or long forms are established for these contacts.

| Line | Current | Alternative |
| --- | --- | --- |
| 7 (name) | Lau Wing-sum | Lau Wing-sum |
| 7 (what) | a retired tally clerk who still checks freight totals for the pier shops | a retired tally clerk the pier shops still asked to check their freight figures |
| 8 (name) | Nelia Ramos | Nelia Ramos |
| 8 (what) | a night-shift canteen owner who keeps meals aside for delayed crews | a night-shift canteen owner who kept a plate covered when a crew ran late |
| 9 (name) | Yusuf Aden | Yusuf Aden |
| 9 (what) | a relief driver who knows which loading queues actually move | a relief driver who could tell a slow loading queue from one that had stopped for good |
| 10 (name) | Cheng Sau-king | Cheng Sau-king |
| 10 (what) | a rope seller who keeps disputed orders tied with different coloured string | a rope seller who set disputed orders apart with coloured string |
| 11 (name) | Arun Bedi | Arun Bedi |
| 11 (what) | a young dispatch clerk who writes backup instructions on packing cardboard | an early-career dispatch clerk who kept a spare set of instructions on the back of packing cardboard |
| 12 (name) | Fong Mei-ling | Fong Mei-ling |
| 12 (what) | a clinic nurse who treats dockworkers between shifts | a clinic nurse who fitted dockworkers in at change of shift |
| 13 (name) | Celia Baptista | Celia Baptista |
| 13 (what) | a marine electrician who refuses to quote before seeing the corrosion | a marine electrician who wanted a look at the rust before naming a price |
| 14 (name) | Tang Pak-lam | Tang Pak-lam |
| 14 (what) | an elderly handcart repairer who lends tools against a written name | an elderly handcart repairer who kept a book of names for borrowed tools |
| 15 (name) | Mariam Conteh | Mariam Conteh |
| 15 (what) | a warehouse caretaker who remembers every key issued on her shift | a warehouse caretaker who could account for every key handed out on shift |
| 16 (name) | Poon Chi-kit | Poon Chi-kit |
| 16 (what) | a junior freight surveyor who photographs damaged seals before touching them | a junior freight surveyor who took a picture of each damaged seal as it was found |
| 17 (name) | Saira Mir | Saira Mir |
| 17 (what) | a shipping-paper translator who charges extra for documents brought in wet | a translator of shipping papers whose rates went up if the papers came in wet |
| 18 (name) | Leila Mensah | Leila Mensah |
| 18 (what) | a ferry stores clerk who keeps a separate shelf for uncollected parcels | a ferry stores clerk who set unclaimed parcels apart on their own shelf |
| 22 | the public shelter outside Pier 12 Gantry Gate | the public waiting shelter by Pier 12 Gantry Gate |
| 23 | the canteen beneath the crane maintenance stairs | the canteen under the stairs used by the crane maintenance crew |
| 24 | the freight counter beside the public weighbridge | the freight desk next to the public weighbridge |
| 25 | the rope shop facing the diesel ferry queue | the rope shop across from the diesel ferry queue |
| 26 | the handcart repair bench under the overhead monorail | the handcart bench below the overhead monorail |
| 27 | the covered waiting bay beside the container-yard offices | the waiting bay under cover next to the container-yard offices |
| 28 | the public noticeboard outside the relief drivers’ room | the public noticeboard by the door to the relief drivers’ room |
| 29 | the shipping-paper kiosk opposite the bonded stores | the kiosk for shipping papers across from the bonded stores |
| 30 | the parcel shelf at the ferry stores counter | the ferry stores counter’s parcel shelf |
| 31 | the clinic waiting room above the marine supply shop | the clinic’s waiting room over the marine supply shop |
| 32 | the rain shelter beside the old pier clock | the covered shelter next to the old pier clock |
| 33 | the shared washbasins behind the dockside food stalls | the communal washbasins at the back of the dockside food stalls |
| 37 | The crane above the waiting bay stayed parked for inspection. Its warning light blinked through the entire afternoon. | Inspection kept the crane above the waiting bay parked. All afternoon, the only thing it did was blink. |
| 38 | Fog hid the far side of the harbour. The crew heard three ferries before seeing any of them. | Across the harbour there was nothing but fog. We heard three ferries before we saw a bow. |
| 39 | A canteen queue formed around the arrival board. Nobody left when the times changed. | The canteen queue bent round the arrival board. The board put the times back; the queue stayed put. |
| 40 | The tide lifted a tyre against a pier post at regular intervals. {who} began anticipating the squeak. | The tide kept nudging a tyre into the pier post. After a while {who} could hear the squeak coming. |
| 41 | An empty container rang every time the wind caught its loose door. Nothing else interrupted the wait. | The wind kept making an empty container ring like a bell. Nobody came at the sound. |
| 42 | The crew watched a crane operator eat lunch high above the yard. The lunch break ended; theirs didn't. | High above the yard, a crane operator finished lunch and went back to work. We were still waiting with our wrappers folded. |
| 43 | A dockside radio repeated the same weather bulletin between freight announcements. Nobody had news for the crew. | The radio between the freight calls had the same weather every time. There was no news for us on it or anywhere else. |
| 44 | Someone had put a plastic stool beneath the departure display. {who} watched three different people claim it. | There was one plastic stool beneath the departure display. {who} watched it change hands three times without moving an inch. |
| 48 | Saltwater had got into the public charging point. Replacing a damaged charging lead cost the crew cash. | Saltwater got into the public charging point and ruined our lead. The replacement came out of the day’s cash. |
| 49 | A Red Lantern toll collector noticed the crew asking freight questions. Their interest in the yard stopped being private. | A Red Lantern toll collector heard us asking about freight. The yard heard about us soon enough, and there was a toll on the way out. |
| 50 | The Wet Sleeve stopped {who} for a neural-load check. The paperwork disappeared after a cash payment. | The Wet Sleeve kept {who} back for a neural-load check. The stop only ended after we were out some cash. |
| 51 | A loose edge on a loading-bay barrier scraped {who}'s arm. The canteen owner supplied a dressing. | The rough edge of a loading-bay barrier left {who} with a scrape on the arm. The canteen had a clean dressing. |
| 52 | A truck sprayed dirty water across the crew's paperwork. Replacing the damaged copies cost cash. | The papers were dry until a truck went through the puddle by the kerb. We paid for a clean set. |
| 53 | The pier office charged a visitor processing fee that wasn't on the board. The clerk pointed to a newer board behind the desk. | The visitor fee wasn’t on the pier office board we could read. The clerk turned a board round on the desk and charged us anyway. |

### `src/data/advlog/nightMarket.js`

Contact names are retained verbatim; no canonical short or long forms are established for these contacts.

| Line | Current | Alternative |
| --- | --- | --- |
| 7 (name) | Choi Sau-lin | Choi Sau-lin |
| 7 (what) | an elderly congee seller who keeps delivery messages beneath the clean bowls | an elderly congee seller who tucked delivery notes under the stack of clean bowls |
| 8 (name) | Lorna Abad | Lorna Abad |
| 8 (what) | a second-hand handset dealer who makes customers test the microphone by calling someone they miss | a second-hand handset dealer whose microphone test was a call to someone the customer missed |
| 9 (name) | Imran Dar | Imran Dar |
| 9 (what) | a young accounts clerk who balances stallholders’ books after finishing the washing-up | an early-career accounts clerk who did the stallholders’ books once the bowls were washed |
| 10 (name) | Leung Mei-wan | Leung Mei-wan |
| 10 (what) | a mahjong-room attendant who remembers coats, umbrellas and unpaid tea | a mahjong-room attendant who knew which coat went with which umbrella and who still owed for tea |
| 11 (name) | Adjoa Sowe | Adjoa Sowe |
| 11 (what) | a clinic nurse who writes aftercare instructions large enough to read with tired eyes | a clinic nurse who wrote aftercare notes in a hand even tired eyes could read |
| 12 (name) | Yip Chun-kit | Yip Chun-kit |
| 12 (what) | a neon repairer who carries customers’ broken signs on a handcart | a neon repairer whose handcart was usually full of other people’s signs |
| 13 (name) | Rafiq Mistry | Rafiq Mistry |
| 13 (what) | a middle-aged alterations tailor who keeps uncollected garments in dated paper sleeves | a middle-aged alterations tailor who wrote the date on every sleeve of uncollected clothing |
| 14 (name) | Tess Villanueva | Tess Villanueva |
| 14 (what) | a supper-stall cook who feeds late delivery workers before washing the last wok | a supper-stall cook who kept a wok unwashed until the late delivery workers had eaten |
| 15 (name) | Kwong Wai-shun | Kwong Wai-shun |
| 15 (what) | a retired shopkeeper who now copies forms and reads difficult letters aloud | a retired shopkeeper people brought forms to copy and letters they needed read aloud |
| 16 (name) | Musa Kamara | Musa Kamara |
| 16 (what) | a delivery dispatcher who writes loading times on a board nobody is allowed to erase without asking | a delivery dispatcher who made everyone ask before changing a loading time on the board |
| 17 (name) | Pang Siu-ying | Pang Siu-ying |
| 17 (what) | a young clinic receptionist who knows which technicians have actually arrived for their appointments | an early-career clinic receptionist who knew the difference between a technician on the rota and one in the room |
| 18 (name) | Devika Naik | Devika Naik |
| 18 (what) | a costume-jewellery trader who weighs repairs as carefully as new stock | a costume-jewellery trader who put repairs on the scales with the same care as new stock |
| 19 (name) | Alma de Vera | Alma de Vera |
| 19 (what) | a laundry-counter owner who keeps forgotten receipts in a biscuit tin | a laundry-counter owner who saved left-behind receipts in an old biscuit tin |
| 20 (name) | Lo Man-tat | Lo Man-tat |
| 20 (what) | a caretaker who manages the keys and parcel shelf for a block above the food stalls | a block caretaker who looked after the keys and parcels above the food stalls |
| 21 (name) | Boubacar Fall | Boubacar Fall |
| 21 (what) | a used-parts trader who marks tested components with a dab of yellow paint | a used-parts trader who put a dab of yellow paint on each part that passed a test |
| 22 (name) | Chan Oi-lan | Chan Oi-lan |
| 22 (what) | a caterers’ booking clerk who sends supplies up to the Hei Lok and insists on signed returns | a caterers’ booking clerk who sent supplies up to the Hei Lok and wanted a signature on everything that came back |
| 26 | the covered tables beside the Neon Dragon | the tables under cover next to the Neon Dragon |
| 27 | the public noticeboard beneath the Hei Lok mooring mast | the public noticeboard below the mooring mast of the Hei Lok |
| 28 | the parcel shelf at the foot of the mahjong-parlour stairs | the parcel shelf at the bottom of the mahjong-parlour stairs |
| 29 | the handset counter opposite the late congee stall | the handset counter across from the late congee stall |
| 30 | the copying desk beneath the alterations shop | the desk for copies under the alterations shop |
| 31 | the sheltered bench outside the back-alley implant clinics | the bench under cover outside the back-alley implant clinics |
| 32 | the tea counter on the mahjong parlour’s second-floor landing | the mahjong parlour’s tea counter on the second-floor landing |
| 33 | the laundry collection window beside the market service lane | the laundry pick-up window off the market service lane |
| 34 | the used-parts counter beneath the flickering green pharmacy sign | the used-parts counter under the green pharmacy sign that flickers |
| 35 | the delivery board behind the row of supper stalls | the board for deliveries at the back of the supper stalls |
| 36 | the repair bench beside the neon sign workshop | the repair bench next to the workshop that fixes neon signs |
| 37 | the public waiting rail beside the Hei Lok cage lift | the public rail for people waiting by the Hei Lok cage lift |
| 38 | the caterers’ collection desk below the Hei Lok service gantry | the desk for caterers’ collections below the Hei Lok service gantry |
| 39 | the jewellery repair counter facing the covered food tables | the jewellery repair counter across from the covered food tables |
| 40 | the shared parcel counter between the cloth stalls | the communal parcel desk between the cloth stalls |
| 41 | the rain shelter beside the market’s public washbasins | the covered spot next to the market’s public washbasins |
| 42 | the takeaway hatch beneath the third-floor mahjong parlour | the hatch for takeaway orders under the third-floor mahjong parlour |
| 43 | the building caretaker’s window behind the stacked delivery baskets | the caretaker’s window beyond the pile of delivery baskets |
| 47 | The crew waited beneath an awning while a cook folded dumplings without looking down. Nobody arrived for the meeting. | Under the awning, the cook folded dumplings without once looking down. We kept looking up at people who weren’t there for us. |
| 48 | {who} watched the Hei Lok cage lift make the same journey above the stalls. The handset stayed quiet. | The Hei Lok cage lift went up and down above the stalls. {who} watched it instead of the handset, which hadn’t made a sound. |
| 49 | A mahjong table upstairs fell silent, then erupted over a rule nobody downstairs could hear. The crew's own afternoon remained uneventful. | The mahjong players went quiet just long enough for us to hear the tiles. Then the argument resumed and we carried on waiting. |
| 50 | The clinic queue moved one plastic stool at a time. Nothing changed in the crew's messages. | Every time the clinic door opened, the queue shifted up a stool. There was no such movement in our messages. |
| 51 | An implant advert kept restarting just before the promised price appeared. 'Probably the most honest bit,' {who} said. | The implant advert looped back to the smile just before it showed the price. ‘There’s the small print,’ said {who}. |
| 52 | Rain drummed on the patched awnings and ran between two empty tables. The crew waited on the dry side. | Rain ran off the patched awnings and straight between the tables. We took the dry seats and waited. |
| 53 | Someone tested a repaired neon sign through every colour it could manage. The promised call never came. | A repaired neon sign went through its colours one by one. The promised call never lit up the handset. |
| 54 | The supper rush filled the lane, emptied it and left a stack of bowls behind. There was still no reply. | The supper rush came and went, leaving us with a stack of used bowls for company. Still no answer. |
| 55 | {who} watched a mahjong-room attendant sort abandoned umbrellas by size. 'Better organised than this appointment.' | The mahjong-room attendant lined up the forgotten umbrellas by height. ‘At least somebody’s got a system,’ said {who}. |
| 56 | A delivery worker slept upright beside a stack of empty baskets. The crew kept the neighbouring stools free and waited. | We left the stools around the sleeping delivery worker empty. Nobody came to claim ours, either. |
| 57 | The market loudspeaker asked the owner of a missing trolley to collect it. After several announcements, it began describing the trolley's faults. | By the time the market loudspeaker got to the trolley’s bad wheel, we knew why nobody wanted to claim it. |
| 58 | Up above, the Hei Lok glowed through the cooking smoke. Down below, the crew's handset remained stubbornly ordinary. | The Hei Lok came into view through the wok smoke. Our handset gave us nothing to look at. |
| 62 | A Silver Fan collector noticed the crew asking questions near the gambling rooms. Their interest became somebody else's conversation. | A Silver Fan collector heard our questions by the gambling rooms and repeated them. We paid for somewhere else to meet. |
| 63 | {who} scraped a knuckle on a broken stool while making room at a counter. The stallholder supplied a dressing and removed the stool. | A broken stool at the counter left {who} with a scraped knuckle. The stallholder brought a dressing and took the stool away. |
| 64 | The Wet Sleeve stopped the crew beside the noodle stalls for a neural-load check. A cash payment brought the inspection to an end. | The Wet Sleeve held us up at the noodle stalls for a neural-load check. We left with less cash and nothing on paper. |
| 65 | A handcart wheel caught a puddle and soaked the crew's paperwork. Paying for fresh copies added to the day's costs. | A handcart went through a puddle and the papers took most of it. We paid the copying desk for another set. |
| 66 | The room booked for a private conversation had become somebody's stock cupboard. Finding another quiet table cost a booking fee. | Our private room was full of somebody else’s stock. We paid for a quieter table elsewhere. |
| 67 | An unsecured awning pole swung down as a stall closed. {who} caught a bruised shoulder and a very sincere apology. | An awning pole dropped as a stall was closing and left {who} with a bruised shoulder. The apology took longer than the packing up. |
| 68 | A broker repeated the crew's enquiry loudly enough for the neighbouring collectors to hear. Discretion became harder to recover. | A broker said the quiet part of our enquiry loud enough for the collectors next door. We paid for another room and kept the visit short. |
| 69 | The delivery lane closed before the crew could move their transport. The release charge came with a receipt and no sympathy. | The delivery lane shut with our transport still in it. The release fee was the only thing they were quick about. |

### `src/data/advlog/basin.js`

Contact names are retained verbatim; no canonical short or long forms are established for these contacts.

| Line | Current | Alternative |
| --- | --- | --- |
| 8 (name) | Wong Suk-fan | Wong Suk-fan |
| 8 (what) | a retired betting-shop cashier who checked the form over a flask of tea | a retired betting-shop cashier who poured tea from a flask before going over the form |
| 9 (name) | Arun Desai | Arun Desai |
| 9 (what) | a tack repairer who kept customers talking while the leather dressing soaked in | a tack repairer who could keep a conversation going for as long as it took the dressing to sink into the leather |
| 10 (name) | Lorna Bautista | Lorna Bautista |
| 10 (what) | a stable laundry operator who labelled every bundle twice | a stable laundry operator who put a label inside each bundle as well as outside |
| 11 (name) | Choi Kin-lok | Choi Kin-lok |
| 11 (what) | a pawn-shop assistant who tested clasps before discussing prices | a pawn-shop assistant who always tried the clasp before naming a price |
| 12 (name) | Aissatou Diallo | Aissatou Diallo |
| 12 (what) | a night-shift caterer who saved the uncollected meals for course workers | a night-shift caterer who set unclaimed dinners aside for people still working at the course |
| 13 (name) | Tam Mei-ha | Tam Mei-ha |
| 13 (what) | a licensed betting-shop owner who refused to lend customers their stake | a licensed betting-shop owner who wouldn’t spot a customer the price of a bet |
| 14 (name) | Rui Seabra | Rui Seabra |
| 14 (what) | a race-screen repairer who watched the picture rather than the horses | a race-screen repairer who watched for a bad picture while everyone else watched the horses |
| 15 (name) | Yau Chi-ming | Yau Chi-ming |
| 15 (what) | a stable-supplies driver who kept pear slices in a separate lunch tin | a stable-supplies driver who packed the sliced pear in a tin of its own |
| 16 (name) | Nisha Fernando | Nisha Fernando |
| 16 (what) | a hospitality-uniform seamstress who knew which pockets needed reinforcing | a hospitality-uniform tailor who knew which pockets wouldn’t last a shift |
| 17 (name) | Pang Wai-lun | Pang Wai-lun |
| 17 (what) | a cleaning supervisor who counted the crew out before locking the stores | a cleaning supervisor who never locked the stores until everyone was accounted for |
| 18 (name) | Ho Kam-ying | Ho Kam-ying |
| 18 (what) | a noodle-stall owner who kept the racing commentary below conversation volume | a noodle-stall owner who kept the racing commentary just quiet enough to take an order |
| 19 (name) | Cheung Pak-sum | Cheung Pak-sum |
| 19 (what) | a retired saddler who still opened the workshop to take small repairs | a retired saddler who still lifted the workshop shutter for little jobs |
| 21 (name) | Tsui Yuk-ling | Tsui Yuk-ling |
| 21 (what) | a form-sheet seller who marked corrections in red before opening | a form-sheet seller who got the red pen out before raising the shutter |
| 22 (name) | Samuel Dacosta | Samuel Dacosta |
| 22 (what) | a course kitchen porter who took the same outside table after every shift | a course kitchen porter who finished each shift at the same table outside |
| 23 (name) | Lai Man-chun | Lai Man-chun |
| 23 (what) | a second-hand binocular dealer who let customers test them on the course clock | a second-hand binocular dealer who pointed customers at the course clock for a test |
| 24 (name) | Deepa Raman | Deepa Raman |
| 24 (what) | a veterinary laundry clerk who could identify a stable by its missing buttons | a veterinary laundry clerk who knew which stable a uniform came from by the buttons it lacked |
| 25 (name) | Fung Siu-wai | Fung Siu-wai |
| 25 (what) | a retired tram driver who minded a betting-shop counter during lunch breaks | a retired tram driver who covered lunch breaks behind the betting-shop counter |
| 26 (name) | Amadou Sow | Amadou Sow |
| 26 (what) | a hospitality equipment repairer who carried replacement trolley wheels in a shopping bag | a hospitality equipment repairer whose shopping bag was full of spare trolley wheels |
| 27 (name) | Corazon Reyes | Corazon Reyes |
| 27 (what) | a breakfast-stall owner who opened for stable workers before the betting shops | a breakfast-stall owner who already had stable workers eating by the time the betting shops opened |
| 28 (name) | Mok Nga-ki | Mok Nga-ki |
| 28 (what) | a print-shop assistant who checked race dates before accepting an urgent order | a print-shop assistant who looked at the race calendar before promising a rush job |
| 32 | the public benches outside the Old Stand | the benches for the public just outside the Old Stand |
| 33 | the noodle stall beneath the Old Stand approach | the noodle stall under the approach to the Old Stand |
| 34 | the licensed betting shop opposite the course gates | the licensed betting shop across from the course gates |
| 35 | the tack repair counter on Workshop Row | the Workshop Row counter for tack repairs |
| 36 | the covered handcart bay at the street end of Buckle Passage | the handcart bay under cover where Buckle Passage meets the street |
| 37 | the pawn-shop window below the race-screen repair stall | the pawn shop’s window beneath the stall that repairs race screens |
| 38 | the stable laundry collection hatch outside the course perimeter | the pick-up hatch for stable laundry just outside the course perimeter |
| 39 | the public waiting shelter beside the stable delivery checkpoint | the shelter for the public next to the stable delivery checkpoint |
| 40 | the tea counter at the street entrance to the Undercroft | the tea counter by the street door to the Undercroft |
| 41 | the second-hand case stall beneath the betting-hall stairs | the stall selling second-hand cases under the betting-hall stairs |
| 42 | the uniform alterations counter facing the course tram stop | the counter for uniform alterations across from the course tram stop |
| 43 | the covered noticeboard outside the licensed betting halls | the covered public noticeboard by the licensed betting halls |
| 44 | the dai pai dong below the corporate hospitality footbridge | the dai pai dong under the footbridge for corporate hospitality |
| 45 | the race-screen repair stall above the pawn shop | the stall that repairs race screens over the pawn shop |
| 47 | the binocular repair counter facing the course clock | the binocular repair counter across from the course clock |
| 48 | the breakfast stall outside the stable workers’ entrance | the breakfast stall by the door the stable workers use |
| 49 | the form-sheet kiosk beside the Old Stand tram shelter | the kiosk selling form sheets next to the Old Stand tram shelter |
| 50 | the public benches below the Glass Galleries approach | the public benches below the approach to the Glass Galleries |
| 51 | the hospitality trolley repair shop on Workshop Row | the Workshop Row shop that fixes hospitality trolleys |
| 52 | the print counter beneath the licensed betting screens | the printing desk under the licensed betting screens |
| 53 | the covered pavement outside the veterinary laundry depot | the stretch of pavement under cover in front of the veterinary laundry depot |
| 54 | the pawn-shop collection hatch facing the Old Stand | the pawn shop’s pick-up hatch across from the Old Stand |
| 58 | {who} waited outside the Old Stand while pensioners compared form sheets. Nobody agreed about the favourite, and nobody came looking for us. | Outside the Old Stand, {who} heard the pensioners argue the favourite down to its last bad run. None of them was there for us. |
| 59 | The tack repairer worked dressing into an old saddle while we waited. Our handset stayed quiet on the counter. | The tack repairer kept rubbing dressing into a saddle that had seen better days. Our handset sat silent beside it. |
| 60 | A race replay ran above the betting-shop door all afternoon. {who} knew the result by heart before the appointment time passed. | The replay above the betting-shop door always ended the same way. By the time the appointment passed, {who} could call the finish. |
| 61 | Stable staff collected their laundry in bundles labelled by shift. Nobody stopped at our table. | The stable laundry went out in bundles sorted by shift. People collected theirs without a glance at our table. |
| 62 | We waited beneath the corporate hospitality footbridge while catering trolleys rattled overhead. The public gate stayed shut. | The wheels of catering trolleys rattled over the corporate hospitality footbridge. Down by the public gate, we were still waiting for it to open. |
| 63 | The betting-shop owner flattened a stack of used form sheets for scrap paper. No message arrived. | Used form sheets went under a weight on the betting-shop counter, ready to be written on again. There was still nothing new to read on our handset. |
| 64 | At the stable delivery checkpoint, a horse refused to pass a puddle. We watched the patient negotiations from the public shelter. | A horse came as far as the puddle at the stable delivery checkpoint and stopped. From the public shelter we watched an argument conducted entirely in soft voices. |
| 65 | Rain softened the discarded betting slips outside the course gates. {who} waited under the noticeboard until the ink began to run. | Under the noticeboard by the course gates, {who} watched the rain turn the betting slips to pulp. Still no sign of anyone for us. |
| 66 | The Undercroft tea counter changed shifts without closing. We ordered another pot and kept the same seats. | One shift poured our tea at the Undercroft counter and another took the pot away. We hadn’t moved. |
| 67 | A pensioner folded a collected winning ticket twice before carrying it through the gates. Our appointment remained unconfirmed. | A pensioner put two neat folds in a winning ticket and carried it out through the gates. Our appointment hadn’t got as far as a reply. |
| 68 | The race-screen repairer adjusted the colour until the grass looked right. We waited through three versions of green. | The race-screen repairer kept asking whether the grass looked right yet. After three shades of green, we were still waiting. |
| 69 | After racing, cleaning drones worked through the paper slips beneath the Old Stand. Nobody answered our message. | Under the Old Stand, cleaning drones got to the last of the race slips. Our message was still waiting for an answer. |
| 71 | {who} waited beside a form-sheet seller who corrected the same misprint on every copy. By lunch, the seller had stopped apologising for it. | The seller was still putting the same correction on form sheets at lunch. ‘I could do that one now,’ said {who}, who’d been waiting long enough to learn it. |
| 72 | A stable worker ate breakfast with a pear left untouched beside the bowl. Our message stayed unread. | A stable worker finished breakfast without touching the pear beside the bowl. Nobody touched our message, either. |
| 73 | The public odds screen froze while the adverts kept moving. Nobody at our table looked surprised. | The odds held still while the adverts ran perfectly. Not one person at our table bothered to point it out. |
| 74 | We waited below the Glass Galleries while someone upstairs tested a microphone. The apology for the noise was considerably louder. | A microphone test drifted down from the Glass Galleries while we waited. The apology arrived at twice the volume. |
| 75 | At the binocular counter, {who} watched the course clock through three different pairs. The appointment was late through all of them. | Three pairs of binoculars brought the course clock into focus for {who}. Not one made the appointment any less late. |
| 76 | A saddler left the radio on for company while we waited. Every caller claimed to have backed the winner. | The saddler kept the radio on while we waited. Judging by the callers, there hadn’t been a losing ticket in the district. |
| 77 | The breakfast-stall owner knew the stable shift by its orders. We were still there when the bowls changed to lunch. | The breakfast-stall owner called the stable shift’s orders from memory. We were still waiting when the lunch bowls came out. |
| 78 | Someone beneath the betting screens explained a prediction model to an audience of one. The audience kept trying to finish a sandwich. | Under the betting screens, someone explained a prediction model to a person holding half a sandwich. We waited through the explanation; the sandwich waited too. |
| 79 | The Old Stand emptied slowly after a replay review. Nobody stopped at the agreed bench. | People took their time leaving the Old Stand after the replay review. The one bench we were watching stayed empty. |
| 80 | A cleaner swept around a punter who was still checking a losing ticket. {who} kept the next seat free. | A punter checked a losing ticket while the cleaner swept round the chair. {who} kept the next seat free without saying anything. |
| 81 | We waited outside the veterinary laundry while staff counted towels into sealed bundles. The collection hatch stayed closed. | Outside the veterinary laundry, we counted along as towels went into sealed bundles. The collection hatch didn’t open. |
| 82 | A horse called from behind the stable wall. Three people at the breakfast counter answered without looking up. | The horse behind the stable wall called once. Three people eating breakfast called back into their bowls. |
| 83 | The pawn-shop owner polished a watch and put it back in exactly the same place. Our handset had nothing new. | The watch in the pawn shop got a polish and went right back into its place. Nothing changed on our handset. |
| 84 | A hospitality worker sat below the private entrance with their shoes off. We waited quietly at the other end of the bench. | Below the private entrance, a hospitality worker took both shoes off with a sigh. We waited at the other end of the bench and gave the silence its due. |
| 85 | The course lights came on above balconies full of drying washing. Nobody confirmed our meeting. | The course lights picked out the washing on the balconies. Our appointment was no more certain in better light. |
| 86 | At the Undercroft entrance, two bookmakers argued over who had borrowed a stool. We heard both accounts while waiting for a reply. | Two bookmakers at the Undercroft entrance both claimed the other had borrowed the stool. We heard both sides and nothing from our handset. |
| 87 | A form-sheet seller covered the unsold copies against the rain. {who} helped hold the corners; the appointment remained unconfirmed. | The form-sheet seller threw a cover over the unsold copies. {who} held down a corner until the rain eased, with no word about the meeting. |
| 88 | The tack workshop clock ran several minutes ahead of the course clock. We waited past the appointment on both. | The tack workshop’s clock put us past the meeting time ahead of the course clock. We were still waiting when they both agreed. |
| 89 | A pensioner studied live odds through an optic implant, then wrote the figures on a paper slip. Our table stayed otherwise empty. | A pensioner read the live odds off an optic implant and put them down on paper. There was still nobody else at our table. |
| 90 | The noodle-stall owner turned the commentary down when a stable worker fell asleep over an empty bowl. We kept waiting. | When the stable worker nodded off over an empty bowl, the noodle-stall owner turned down the commentary. We waited a little more quietly. |
| 91 | A courier beneath the Glass Galleries counted catering trays while a manager counted them again upstairs. Neither count brought our message any closer. | Below the Glass Galleries, a courier counted the trays. Someone counted them again upstairs while we waited for a reply. |
| 92 | We watched a repairer replace the wheel on a hospitality trolley. The trolley left before the person we were waiting for arrived. | A repairer put a fresh wheel on the hospitality trolley. It had somewhere to go; we were still waiting. |
| 93 | The crowd roared beyond the Old Stand wall, followed a few seconds later by the counter radio. {who} waited through both finishes. | The finish came through the Old Stand wall as a roar, then out of the counter radio a few seconds later. {who} heard both from the same seat. |
| 94 | At the course tram shelter, someone offered a detailed explanation of why the wrong horse had won. Nobody had asked, but there was time. | At the course tram shelter we got the whole case for why the wrong horse had won. There was time for the long version. |
| 98 | The cheap bar introduced a race-night table minimum while we waited. We paid it rather than lose the agreed meeting spot. | By race time the cheap bar wanted a minimum spend on our table. We paid it to keep the meeting where we’d said it would be. |
| 99 | {who} caught a finger on a bent staple beneath a tack-shop counter. A shallow cut needed cleaning before we continued. | A bent staple under the tack-shop counter left {who} with a small cut. We took a moment to clean it. |
| 100 | The course tram stop closed for crowd control. We paid a shared-van fare to move the load round the perimeter. | With the course tram stop shut for the crowd, we paid for a seat in a shared van and took the load round the perimeter. |
| 101 | A hospitality trolley clipped our tea table beneath the footbridge. We paid for the broken pot while the catering staff argued about whose route it was. | Under the footbridge a hospitality trolley sent our teapot off the table. The catering staff disputed the route while we paid for the pot. |
| 102 | The parcel counter charged an extra holding fee once the race-night shutters went down. We paid to keep the collection available. | The parcel counter’s holding rate went up when the race-night shutters came down. We paid to keep the collection there. |
| 103 | {who} slipped on wet betting slips outside the Old Stand. A bruised knee made the steps slower. | The wet betting slips outside the Old Stand went from under {who} all at once. The stairs felt longer with a bruised knee. |
| 104 | The handcart hire ran past its return time while a course delivery blocked the lane. We paid for another period. | A course delivery sat across the lane until our handcart hire ran over. We paid for time we’d spent standing still. |
| 105 | A Silver Fan collector charged us for waiting beside an Undercroft counter. We paid rather than turn the appointment into a dispute. | Waiting at a counter in the Undercroft turned out to carry a charge from a Silver Fan collector. We paid it to keep the appointment from turning into an argument. |
| 106 | A loose buckle on a workshop display tore our bag. The tack repairer charged a little to stitch the seam. | A buckle on the workshop display pulled a seam open in our bag. We paid the tack repairer for a few stitches. |
| 107 | The betting-hall lockers switched to event rates before we collected our things. We paid the difference to open the door. | By collection time the betting-hall lockers were on event rates. The door stayed shut until we paid the difference. |
| 109 | A sudden shower soaked our collection slip outside the Old Stand. We paid the print counter for a fresh copy. | The shower outside the Old Stand left our collection slip unreadable. A new copy from the print counter went on the bill. |
| 110 | {who} scraped a knuckle on a tack-shop drawer that stuck halfway open. The repairer supplied a clean cloth. | A stuck drawer in the tack shop left {who} with a scrape across a knuckle. The repairer passed over a clean cloth. |
| 111 | The course crowd filled every ordinary luggage locker. We paid for a larger one to keep our things out of the crush. | The course crowd had taken every ordinary locker. We paid for a big one rather than carry our things through the press. |
| 112 | A delivery trolley rolled over the corner of our bag outside the laundry depot. We paid the alterations counter to replace the fastening. | Outside the laundry depot, a delivery trolley caught the corner of our bag. The alterations counter charged to fit a new fastening. |
| 113 | The handcart depot charged a cleaning fee for the wet paper caught round its wheels. We paid after the attendant pointed to the sign. | Wet paper wound itself round the hired handcart’s wheels. The depot attendant pointed to the cleaning fee and added it to the bill. |
| 114 | {who} bumped a shoulder against a low beam beneath the betting-hall stairs. A small bruise was enough to make the return trip more careful. | A low beam under the betting-hall stairs left {who} with a bruised shoulder. The next trip under it was slower. |
| 115 | The café beside the licensed betting shop switched to race-night prices before bringing the bill. We paid and kept the menu photograph. | By the time the bill came, the café by the licensed betting shop was charging race-night prices. We paid and kept the photo of the menu. |
| 116 | A passing trolley knocked our document wallet into a gutter outside the course. We paid to reprint the pages the water had reached. | Outside the course, a passing trolley sent our document wallet into the gutter. Only the wet pages needed printing again, but we had to pay for them. |
| 117 | The public collection counter closed while we waited in its queue. We paid for overnight storage rather than move the load again. | The public collection counter closed with us still in the queue. Overnight storage cost less than moving the whole load again. |
| 118 | {who} caught a thumb beneath a folding bench outside the Old Stand. A small scrape interrupted the wait. | The folding bench outside the Old Stand closed on {who}’s thumb. We stopped to look at the scrape. |
| 119 | The workshop charged a call-out fee after our appointment ran beyond its normal hours. We paid to keep the shutter open. | Our appointment ran beyond closing at the workshop. Keeping the shutter up cost a call-out fee. |
| 120 | A patrol pair outside the course asked whether our handcart needed a commercial permit. A cash payment settled their interest. | A patrol pair held us up outside the course over the handcart’s permit. The question cost us cash in the end. |

### `src/data/advlog/heights.js`

Contact names and the Late Counter place label are retained verbatim: no supported variant preserves those names and, for the place label, both named landmarks.

| Line | Current | Alternative |
| --- | --- | --- |
| 8 (name) | Yuen Ka-lai | Yuen Ka-lai |
| 8 (what) | a parcel-locker attendant who checked collection numbers before looking up | a parcel-locker attendant who wanted the collection number before so much as a hello |
| 9 (name) | Marisol de Vera | Marisol de Vera |
| 9 (what) | a cleaning-shift supervisor who kept spare meal vouchers for late staff | a cleaning-shift supervisor who saved meal vouchers for staff kept late |
| 10 (name) | Fong Chi-keung | Fong Chi-keung |
| 10 (what) | a retired lift technician covering a repair kiosk three afternoons a week | a retired lift technician who still took three afternoons a week at a repair kiosk |
| 11 (name) | Devika Shah | Devika Shah |
| 11 (what) | a serviced-apartment receptionist who knew which luggage had outlasted its booking | a serviced-apartment receptionist who knew which bags had stayed longer than their bookings |
| 12 (name) | Ko Wing-yan | Ko Wing-yan |
| 12 (what) | a junior laboratory stores clerk who ate lunch with the stockroom door open | a junior laboratory stores clerk who kept the stockroom door open even while eating lunch |
| 13 (name) | Idrissa Ba | Idrissa Ba |
| 13 (what) | a loading-bay dispatcher who wrote actual arrival times beside the scheduled ones | a loading-bay dispatcher who logged when a delivery turned up alongside when it was due |
| 14 (name) | Teresa Leal | Teresa Leal |
| 14 (what) | a document-shop owner who kept a magnifying glass beside the signature pad | a document-shop owner who reached for a magnifying glass when a signature was hard to read |
| 15 (name) | Cheung Suk-yee | Cheung Suk-yee |
| 15 (what) | a uniform alterations worker who let night staff collect after closing | a uniform alterations worker who kept finished jobs on hand for night staff after closing |
| 16 (name) | Rafiq Mirza | Rafiq Mirza |
| 16 (what) | a ventilation contractor who carried filter samples in a biscuit tin | a ventilation contractor whose biscuit tin held filter samples instead of biscuits |
| 17 (name) | Lam Hoi-ting | Lam Hoi-ting |
| 17 (what) | a catering assistant who remembered which meeting rooms returned untouched food | a catering assistant who could name the meeting rooms that sent their food back untouched |
| 18 (name) | Nelia Santos | Nelia Santos |
| 18 (what) | a repair-counter owner who tested every charger before accepting it | a repair-counter owner who plugged in every charger before agreeing to take it |
| 19 (name) | Tsang Man-fai | Tsang Man-fai |
| 19 (what) | a night-shift cloakroom attendant who studied accountancy between collections | a night-shift cloakroom attendant who opened the accountancy books whenever nobody had a coat to collect |
| 23 | the parcel lockers at the public end of the Lower Arcade | the parcel lockers in the public stretch of the Lower Arcade |
| 24 | the noodle-counter tables in the Lower Arcade | the tables by the noodle counter in the Lower Arcade |
| 25 | the repair kiosk beneath the Lower Arcade escalators | the repair kiosk under the escalators in the Lower Arcade |
| 26 | the luggage benches outside the Transfer Lounge | the benches for luggage just outside the Transfer Lounge |
| 27 | the window table beside the Transfer Lounge departure screen | the Transfer Lounge table by the window next to the departure screen |
| 28 | the lowest landing of the Service Steps | the landing at the foot of the Service Steps |
| 29 | the sheltered bench opposite the Service Steps shrine | the bench under cover across from the shrine on the Service Steps |
| 30 | the public reception desk at Venn House | the desk for public reception at Venn House |
| 31 | the visitor seats beneath the Venn House reception clock | the seats for visitors under the reception clock at Venn House |
| 32 | the public reception counter outside the Demonstration Floor | the public reception desk just outside the Demonstration Floor |
| 33 | the Late Counter beside the Lower Arcade shutters | the Late Counter beside the Lower Arcade shutters |
| 34 | the document shop facing the Lower Arcade parcel lockers | the document shop across from the parcel lockers in the Lower Arcade |
| 35 | the uniform alterations counter below the serviced apartments | the counter for uniform alterations under the serviced apartments |
| 36 | the covered courier waiting area outside the loading entrance | the spot under cover for couriers waiting outside the loading entrance |
| 40 | {who} waited beside the Lower Arcade lockers while office staff collected parcels without breaking their calls. Our collection number never appeared. | Office staff collected from the Lower Arcade lockers without putting their calls on hold. {who} was still watching for our number when they’d gone. |
| 41 | The Venn House clock ticked through the afternoon. Reception offered another glass of water, but no message. | At Venn House, the clock kept ticking and reception kept the water coming. There was still no word for us. |
| 42 | At the Transfer Lounge, someone slept against a suitcase with an accommodation approval open on their handset. We waited at the next table. | In the Transfer Lounge, someone fell asleep against a suitcase with the accommodation approval still up on the handset. We waited one table over. |
| 43 | Cleaners ate beside the exhaust vents while the lobby café stacked its chairs. Nobody answered our message. | The lobby café put its chairs up while the cleaners ate by the vents. We still had no answer by the time they finished. |
| 44 | The Demonstration Floor sorted the same spotless parcels behind the glass. {who} watched enough circuits to recognise a dent in one box. | Behind the glass on the Demonstration Floor, the same boxes kept coming round. {who} could pick out the one with the dent by the end. |
| 45 | A security drone checked the edge of the public arcade at regular intervals. We stayed at our table; the appointment remained unconfirmed. | The security drone made another pass along the edge of the public arcade. We kept our seats and waited for confirmation. |
| 46 | The Late Counter owner put covered meals aside for the laboratory shift. Our handset stayed quiet beside the cutlery pot. | At the Late Counter, covered meals were set aside for the laboratory shift. Nothing came through on the handset beside the cutlery. |
| 47 | Above the Service Steps shrine, a cleaner straightened the incense tin before heading upstairs. We waited on the bench opposite. | From the bench opposite, we watched a cleaner straighten the incense tin at the Service Steps shrine and head up. We stayed where we were. |
| 48 | The executive windows went dark while lights stayed on in the laboratories. We still had no reply. | The executive floors went dark before the labs did. There was still nothing back from anyone upstairs. |
| 49 | A receptionist answered every external call with 'Apex Ridge' and gave directions to Glass Heights between calls. Nobody called for us. | ‘Apex Ridge’ on the phone, Glass Heights when someone asked for directions in person. We heard reception do both all afternoon without a call for us. |
| 50 | The public arcade filled with people waiting for the rain to ease before walking downhill. {who} kept watching the agreed entrance. | Everyone in the public arcade seemed to be waiting for the rain to let up. {who} kept an eye on the entrance instead of the weather. |
| 51 | A visiting engineer rehearsed the same explanation over tea at the Transfer Lounge. Our appointment time passed without confirmation. | The visiting engineer at the Transfer Lounge got another rehearsal in over the tea. Our meeting time came and went without a word. |
| 55 | Our collection reference covered the parcel but not the loading bay. We paid for it to be brought down to the public counter. | Our reference got us the parcel but didn’t get us into the loading bay. Bringing it down to the public counter cost extra. |
| 56 | {who} caught a finger in a folding visitor chair at Venn House. A small cut needed a plaster before we continued. | A visitor chair at Venn House folded on {who}’s finger. Reception had a plaster for the small cut. |
| 57 | The loading desk charged a missed-slot fee while the authorising manager was still answering our message. We paid to keep the collection booked. | The manager hadn’t answered when the loading slot expired. We paid the desk to keep the collection on the books. |
| 58 | The Transfer Lounge required another purchase to keep the table. We bought tea at serviced-apartment prices. | At the Transfer Lounge we needed a fresh receipt to stay at the table. We bought the cheapest tea and it wasn’t cheap. |
| 59 | A tower's parcel desk rejected our bag as unsuitable for its collection trolley. We paid for a rigid carrier from the arcade shop. | Our bag wasn’t rigid enough for the tower’s parcel trolley. The arcade shop had a carrier the desk would take, at a price. |
| 60 | {who} slipped on the wet Service Steps. A bruised shin slowed the climb. | The wet Service Steps sent {who} down hard enough to bruise a shin. The rest of the climb took longer. |
| 61 | The public lift was out, and the service lift needed permission we did not have. We paid a porter to move the load by the approved route. | The public lift was out and our permission didn’t cover the service lift. A porter took the load the approved way, for a fee. |
| 62 | A tenant's collection form needed a printed signature rather than the message on our handset. The document shop charged for the print and scan. | The collection desk wanted the signature on paper, not on the handset. We paid the document shop to print it and scan it back in. |
| 63 | The parcel desk's storage allowance expired while we waited for approval upstairs. We paid the extra holding charge. | Our storage time ran out at the parcel desk while the approval was still upstairs. We paid for the extra hold. |
| 64 | The loading entrance closed before our paperwork cleared. We paid to leave the load in supervised storage rather than carry it downhill again. | The loading entrance shut while the papers were still being checked. We paid for supervised storage rather than lug everything back downhill. |

## 4. Fight stage words

### `src/data/fightText.js`

| Line · key | Current | Alternative |
| --- | --- | --- |
| 44 · `stage.jammed` | Jammed | Call blocked |
| 45 · `stage.jamFail` | No lock | Jam failed |
| 46 · `stage.alarm` | The alarm is up | Alarm raised |

## 5. Small UI lines

Template values from JavaScript are shown as `{slots}` here so you can read the copy without the markup. In the fade subject, `{district}` is optional in the game and can also be the client's name; omit the whole parenthesis when there's no label.

### `src/ui/gear.js` — stash sell mode

| Position | Current | Alternative |
| --- | --- | --- |
| 152, enter sell mode | Sell… | Select to sell… |
| 152, leave sell mode | Done | Exit sell mode |
| 151, in sell mode | Tick what to sell. | Tap the items you want to sell. |
| 151, normal stash helper | Nobody is carrying these. Tap one to give it to someone or sell it. | This gear is unassigned. Tap an item to give it to someone or sell it. |
| 227, no selection | Nothing ticked yet | No items selected |
| 227, selection count | {n} picked | {n} selected |
| 228, sell button with selection | Sell {n} · {money} | Sell {n} for {money} |

### `src/ui/crew.js` — tapped stat and level-up chevron

| Position | Current | Alternative |
| --- | --- | --- |
| 58, current period | this season | so far this season |
| 58, previous period | last season | in the previous season |
| 59, gain | up {n} {when} (was {old}) | rose by {n} {when} (was {old}) |
| 60, loss | down {n} {when} (was {old}) | fell by {n} {when} (was {old}) |
| 60, unchanged | no change {when} | stayed the same {when} |
| 62, role's main stat | Their main stat, as {role}: it decides most of what they do on a job. | The main stat for their work as {role}. |
| 62, one of the next two | One of their two best after {main}. | Apart from {main}, this is one of their two highest stats. |
| 65, trait adjustment | Includes {bonus} from traits. | Traits account for {bonus} of this rating. |
| 65, age note | Age takes a little each season past 40. | After 40, age can lower stats a little each season. |
| 65, previous-season note | A new season has just begun: until they change this season, the strip shows last season's, in grey. | Grey shows last season's changes until this season's come in. |
| 65, full stats | Their page has every stat. | See their page for all stats. |
| 110, chevron label | Level up waiting | Level-up available |

### `src/core/earned.js` — `fade` crew update

| Position | Current | Alternative |
| --- | --- | --- |
| 169, subject | {op}: no longer {trait} ({district}) | {op}: {trait} has faded ({district}) |
| 165, no reason | That's passed. {op} is back to their usual self on that front. | It has passed. {op} is back to normal. |
| 164, with reason | {op} is back to their usual self on that front: {why}. | Things are back to normal for {op}. Reason: {why}. |
| 163, displaced by a newer trait | {op} carries two passing traits at most, and {new} has pushed out {old}, the older one. | {op} can have two passing traits at once. {new} has replaced {old}, the older trait. |

### Fame tier, messages, history, meter and pay ask

I'd keep **Renowned**: it says the runner's name carries without confusing fame with skill or with Legend. **Acclaimed** is an alternative if you want a harder break from the old word “Elite.” The surrounding copy below assumes **Renowned** stays.

| File · key or position | Current | Alternative |
| --- | --- | --- |
| `src/data/fame.js` · `FAME_NAMES.elite` | Renowned | Acclaimed |
| `src/data/fame.js` · `ELITE_TEXT.*.subject` (five paths) | {op} is Renowned | {op} has reached Renowned |
| `src/data/fame.js` · `ELITE_TEXT.ghost.body` | People talk about jobs {name} was on, and can never say who did them. Renowned now: a Ghost. | People remember the jobs but never saw {name} do them. Renowned as a Ghost. |
| `src/data/fame.js` · `ELITE_TEXT.enforcer.body` | The street knows {name} by reputation: when it turns into a fight, they finish it. Renowned now: an Enforcer. | The street knows how a fight tends to end when {name} is there. Renowned as an Enforcer. |
| `src/data/fame.js` · `ELITE_TEXT.earner.body` | {name} has been on enough of the big ones that clients ask whether they're coming. Renowned now: an Earner. | On the big jobs, clients have started asking for {name}. Renowned as an Earner. |
| `src/data/fame.js` · `ELITE_TEXT.iron.body` | {name} keeps walking out of jobs that should have put them in the clinic. The street has noticed. Renowned now: Iron. | {name} has come back from enough hard jobs that the street has taken notice. Renowned as Iron. |
| `src/data/fame.js` · `ELITE_TEXT.lifer.body` | {name} has been at it longer than most crews last. Renowned now: a Lifer. | Crews have come and gone while {name} kept working. Renowned as a Lifer. |
| `src/data/fame.js` · `ELITE_BACK.subject` | {op} is Renowned again | {op} has regained Renowned status |
| `src/data/fame.js` · `ELITE_BACK.body` | {name} has the street talking again. Back to Renowned. | The street is saying {name}'s name again. They're back to Renowned. |
| `src/data/fame.js` · `ELITE_LOST.subject` | {op} has lost their edge | {op} drops back to Respected |
| `src/data/fame.js` · `ELITE_LOST.body` | Two weeks without the work to back it up, and the street has stopped saying {name}'s name. Respected, no longer Renowned. They can win it back. | After two weeks with their standing too low, {name} is back to Respected. They can earn Renowned again. |
| `src/data/fame.js` · `FAME_HISTORY.elite` | Renowned ({path}) | Reached Renowned ({path}) |
| `src/data/fame.js` · `FAME_HISTORY.eliteBack` | Renowned again ({path}) | Regained Renowned ({path}) |
| `src/data/fame.js` · `FAME_HISTORY.eliteLost` | no longer Renowned: respected now | returned to Respected from Renowned |
| `src/core/fame.js` · 99, Legend checklist | Renowned | Renowned status |
| `src/core/fame.js` · 132, career highlight | {op} became Renowned: a {path}. | {op} reached Renowned on the {path} path. |
| `src/core/fame.js` · 194, fame update | {op} is Renowned now ({path}). | {op} has reached Renowned ({path}). |
| `src/data/retirement.js` · `HALL_EPITAPH.elite` | Renowned, for as long as it counted. | Renowned. The street knew their name. |
| `src/ui/crew.js` · 344, path targets | {label}: {value} (Renowned {elite}, Legend {legend}) | {label}: {value} (Renowned at {elite}, Legend at {legend}) |
| `src/ui/crew.js` · 347, path requirements | Renowned also needs {activeWeeks} active weeks, {atLevel} jobs at their level and standing {standing} (how the street rates them now: good work at their level raises it, the bench wears it down). | For Renowned, they also need {activeWeeks} active weeks, {atLevel} jobs at their level and standing of {standing} (good work at their level raises it; time on the bench lowers it). |
| `src/ui/crew.js` · 354, path meter | To Renowned | Renowned progress |
| `src/ui/messages.js` · 281, fame pay ask | They became Renowned: the street knows the name. Loyal runners ask less often; greedy ones more. | They're Renowned now and asking for more pay. Loyal runners ask less often; greedy ones ask more. |
