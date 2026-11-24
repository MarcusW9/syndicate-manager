// Log lines: weapon. Draft for the owner to mark.
// Shared goal pool for Old Town, Glass Heights and the Basin.
// Contacts and places come from the selected district file.
// (The owner's second weapon draft, 2026-11-22. In use since expeditions (slice 2): core/advlog.js joins it to weapon.js,
// so every district's weapon hunt draws from both.)
export default {
  goal: 'weapon',

  open: {
    any: [
      "{who} started asking after {itemFull} in {district}. Someone pointed us towards {contact}, {contactWhat}, who had handled a similar sale.",
      "The hunt for {itemFull} took us to {place}. A seller had left a collection notice there.",
      "We followed a handwritten advert for {itemFull} to {place}. The price had been crossed out twice.",
      "{contact}, {contactWhat}, had heard we wanted {itemFull}. {who} arranged a conversation over tea.",
      "Someone had offered {itemFull} as payment for a debt. {who} traced the offer to {place}.",
    ],
    social: [
      "{who} asked who might part with {itemFull}. {contact}, {contactWhat}, offered an introduction once the lunch rush was over.",
      "Over a shared table, {who} mentioned we were looking for {itemFull}. {contact}, {contactWhat}, wrote a seller's name on the receipt.",
    ],
    tech: [
      "{who} traced an advert for {itemFull} to a collection point at {place}. The listing was old, but the account was still answering.",
      "A repair listing mentioned {itemFull} among the uncollected work. {who} arranged to inspect the records at {place}.",
    ],
    stealth: [
      "{who} watched a case matching {itemFull} change hands outside {place}. We stayed far enough behind to look uninterested.",
      "A seller advertising {itemFull} had stopped answering messages. {who} picked up the trail at {place}.",
    ],
  },

  lead: {
    any: [
      "{who} found the person who had carried the case. They remembered the buyer because the buyer had refused to pay for the stairs.",
      "The seller's old number still worked. We had a collection window to check.",
      "A repair receipt put the gun in a workshop rather than a private collection. {who} arranged to ask about unclaimed work.",
      "Someone recognised the wrapping on the case. We had the name of the business that packed it.",
      "The owner was willing to sell, but wanted a replacement lined up. {who} got the specification.",
      "A handwritten inventory listed {item} under a different name. The storage reference matched.",
      "{who} found a buyer who had walked away from the asking price. They passed on the seller's number.",
      "The case had gone through a local delivery service. Its dispatcher agreed to forward our offer.",
    ],
    combat: [
      "{who} recognised the wear around the grip in a sale photo. It matched the piece we were tracking.",
      "A seller had described {item} badly enough to put everyone off. {who} asked the right questions and secured an inspection.",
    ],
    stealth: [
      "{who} followed the empty case trolley to its storage room. We knew which door mattered.",
      "The seller kept changing meeting points. {who} watched the handovers and worked out where the stock stayed.",
    ],
    tech: [
      "{who} matched a serial number in an old repair record. The workshop still had a forwarding address.",
      "The sale photos had been copied, but the collection message was local. {who} traced it to an active seller.",
    ],
    social: [
      "{who} persuaded a broker to pass our offer on without adding another introduction fee.",
      "The owner had ignored every message asking for a discount. {who} asked when an inspection would suit and got an answer.",
    ],
    piloting: [
      "{who} recognised the delivery route from the collection times. We narrowed the search to one unloading stop.",
      "A driver remembered carrying the case. {who} talked through the route and found the address missing from the receipt.",
    ],
    cool: [
      "{who} let the seller finish explaining why nothing was for sale. The conversation ended with an inspection time.",
      "The broker left a long silence after our offer. {who} waited it out and got the owner's actual asking price.",
    ],
  },

  deadEnd: {
    any: [
      "The case was the right size. Inside was a karaoke machine; the owner offered to demonstrate.",
      "{who} waited through the collection window. The seller had given everyone the same wrong address.",
      "The advert was genuine, but the sale had happened months ago. Nobody had taken it down.",
      "A promising storage reference led to an empty cupboard. Even the shelf brackets had gone.",
      "The owner wanted to show us a collection, not sell anything. {who} sat through the whole tour.",
      "Someone had mistaken a carrying case for the gun inside it. The case was available, if we wanted to remain disappointed.",
    ],
    social: [
      "{who} spent the afternoon getting an introduction to someone who only knew the same broker we did.",
      "The seller's friend vouched for everything except having seen {item}. There was nobody else to ask.",
    ],
    tech: [
      "{who} checked the listing history. Every photograph came from the same completed sale.",
      "The inventory entry was a training example left in the live system. {who} read the help text twice to be sure.",
    ],
  },

  snag: {
    any: [
      "A broker charged us for an introduction, then charged for passing the reply back. We paid rather than lose the appointment.",
      "{who} caught a palm on a broken case latch. A scrape, and a pause to clean it.",
      "The seller moved the appointment after we had paid for transport. The fare was gone.",
      "A loose stair tread gave way under {who}. One bruised shin and a much slower descent.",
      "A building attendant demanded a visitor fee that had not existed on the way in. We paid to keep the meeting quiet.",
      "The storage desk charged for opening the wrong locker. Apparently checking the number counted as a separate service.",
    ],
    combat: [
      "{who} checked a stiff mechanism at the seller's request and pinched a finger. The inspection paused for a plaster.",
      "The demonstration stand folded while {who} was checking its balance. A bruised wrist was the extent of it.",
    ],
    stealth: [
      "{who} caught a sleeve on a service-door alarm. We left before anyone arrived, but the building logged the visit.",
      "A camera turned towards {who} at the wrong moment. The watch desk circulated a still before we cleared the corridor.",
    ],
    piloting: [
      "The collection address had nowhere to stop. {who} found the vehicle ticketed after a circuit on foot.",
      "{who} took the low access ramp and damaged the underside of the vehicle. The repair ate into our spending money.",
    ],
  },

  find: {
    cash: [
      "{who} helped a stallholder shift a jammed shutter. They paid {cash} for the trouble.",
      "A workshop needed a sealed parcel carried round the corner. {who} earned {cash} while the seller kept us waiting.",
      "{who} spotted a duplicate charge on a delivery receipt. The dispatcher refunded {cash} in cash.",
    ],
    gear: [
      "A repairer let {who} take a box of spare springs from the discard shelf. Several were still wrapped.",
      "{who} found an unopened packet of ammunition in a clearance tray. The owner waved it through with the empty packaging.",
      "Someone had thrown out a sound carrying case because its handle had split. {who} kept it for the fittings.",
    ],
    rumour: [
      "A repairer mentioned a workshop clearing its unclaimed stock next month. {who} kept the address for another trip.",
      "{who} heard about a courier looking for occasional cover. We saved the number for when we were not chasing a gun.",
    ],
  },

  quiet: {
    any: [
      "{who} watched the collection entrance through a whole lunch service. Nobody carrying a case used it.",
      "The seller asked us to wait for a message. We waited; the handset stayed quiet.",
      "Rain kept everyone under the same awning. We heard plenty about the weather and nothing useful.",
      "The appointment board had not changed. {who} checked it anyway, then found somewhere to sit.",
      "We kept the afternoon free for a viewing that never got confirmed. {who} called it a very expensive way to drink tea.",
    ],
  },

  callbackContact: {
    lead: [
      "{contact} answered our message with a storage reference. {who} arranged to check it.",
      "A note from {contact} named the person authorised to release the case. We had someone specific to ask for.",
      "{who} showed {contact} the sale photograph. They recognised the counter behind it and gave us an address.",
      "The owner had replied to {contact}. Our offer was enough to get a viewing.",
    ],
    deadEnd: [
      "{contact} had passed on a story heard from someone else. {who} followed it back to the advert we already had.",
      "The number {contact} gave us belonged to a business that had closed. Nobody nearby knew where the stock went.",
    ],
    snag: [
      "{contact} asked for an introduction fee before forwarding our message. We paid it to keep the conversation open.",
      "A loose shelf tipped while {who} waited for {contact}. We paid for the tea set it took with it.",
    ],
  },

  callbackPlace: {
    lead: [
      "A fresh collection notice had appeared at {place}. {who} copied the reference before it was taken down.",
      "{who} checked the delivery book at {place}. The case had been signed for under a business name.",
      "Someone at {place} recognised the seller's description. We left with a working number.",
      "The attendant at {place} agreed to forward our offer. A reply arrived before the desk closed.",
    ],
    deadEnd: [
      "The appointment at {place} turned out to concern an empty case. Nobody had thought to mention that.",
      "{who} checked the old notices at {place}. Every useful number had been disconnected.",
    ],
    snag: [
      "The desk at {place} charged a handling fee before letting us inspect the records. We paid and kept the receipt.",
      "{who} slipped on a wet step outside {place}. A bruised hip made the rest of the walk less cheerful.",
    ],
  },

  turn: {
    good: [
      "{who} inspected {item} and agreed terms with its owner. All that remained was the handover.",
      "The storage clerk brought out {item}, and the release paperwork matched. We had a collection slot.",
      "Our trade offer was accepted. {who} checked the piece and arranged the exchange.",
      "The owner accepted our price after the inspection. The case was packed and waiting for collection.",
    ],
    rough: [
      "{who} found {item}, but the owner wanted more than we had set aside. A cheaper piece was offered alongside it.",
      "The inspection showed {item} needed work we could not arrange here. The seller offered the usable parts separately.",
      "The owner would only sell {item} with the rest of the lot. {who} asked what could be split off.",
      "The release papers named two owners, and only one had signed. The clerk offered a lesser piece with clear paperwork.",
    ],
  },

  call: [
    "Someone lunged for the case as the handover began. {who} took cover behind the counter and called it in.",
    "The seller's minder swung at the broker and turned towards our crew. {who} called it in from the doorway.",
    "A rival buyer shoved the table over and came at us with a raised chair. The crew held by the exit and called it in.",
    "The collection shutter dropped, and someone threw a punch at {who}. The crew called it in.",
  ],

  close: {
    met: [
      "We brought {item} home in a case with somebody else's initials. {who} put it down carefully.",
      "{who} handed over {item} and the agreed receipt. The hunt was done.",
      "The crew got home with {item}. Someone had wrapped the case in a tablecloth; nobody had asked for it back.",
      "We got {item} through the door and onto the bench. {who} asked for tea before questions.",
    ],
    partial: [
      "We brought home usable parts, but not {item}. {who} laid them out so we could see what the trip had bought.",
      "{who} returned with a lesser piece instead of {item}. It was not the brief, but it was something we could use.",
      "The crew brought back what could be salvaged from the sale. The hunt for {item} remained open.",
    ],
    failed: [
      "We got home without {item}. Anything picked up along the way was all the trip had yielded.",
      "{who} closed the search without the gun. There was no prize beyond whatever we had found on the road.",
      "The crew returned without the piece we wanted. {who} put the search notes on the table and left the kettle to someone else.",
    ],
  },

  asides: {
    superstitious: [
      "{who} had kept the same folded offering in a pocket all day and refused to call it a system.",
      "{who} had counted the steps twice and declined to explain the result.",
    ],
    money: [
      "{who} had kept every receipt, including one written on the back of another receipt.",
      "{who} priced the tea against the serving size and remained offended.",
    ],
    warm: [
      "{who} asked whether everyone had eaten before finishing the report.",
      "{who} saved the least crushed bun for whoever was reading this at home.",
    ],
    hot: [
      "{who} rewrote the report after deciding the original contained too many opinions about strangers.",
      "{who} described their own patience as exceptional, without anyone having asked.",
    ],
    wary: [
      "{who} left the names out of the voice message and sent them separately.",
      "{who} checked who could see the handset before sending the report.",
    ],
    calm: [
      "{who} folded the notes neatly before sending a photograph of them.",
      "{who} waited for the tea to cool rather than arguing with it.",
    ],
    cold: [
      "{who} removed three adjectives from the report and considered it improved.",
      "{who} answered the question about morale with a battery percentage.",
    ],
    charming: [
      "{who} addressed the report to our esteemed kettle committee.",
      "{who} claimed the handwriting was charming rather than difficult to read.",
    ],
    curious: [
      "{who} added a question about a wall-mounted machine that had nothing to do with the hunt.",
      "{who} wanted to know why every repair counter seemed to own the same chipped mug.",
    ],
    chrome: [
      "{who} adjusted an implant setting and complained that the cheaper version had been easier to use.",
      "{who} blamed the odd pause in the recording on second-hand hardware.",
    ],
    haunted: [
      "{who} recognised a song in the background and left that part out of the recording.",
      "{who} paused over an old date in the notes, then carried on without explaining.",
    ],
  },

  pair: [
    "{who} and {other} disagreed over the route until they compared their notes. Both had written down the wrong entrance.",
    "Over tea, {who} explained how to recognise a copied sale photograph. {other} found one before the explanation was finished.",
    "{who} kept our place in the queue while {other} fetched food. The report devoted more space to the missing sauce than the wait.",
    "The broker spoke too quietly for {who} to hear. {other} repeated every word, including the complaint about being overheard.",
    "{who} and {other} compared the collection times against the delivery route. One stop appeared on both lists.",
    "While {who} asked about the case, {other} kept the paperwork in order. We left with a viewing reference rather than another promise.",
  ],

  joss: {
    day: [
      'Joss: "I put the useful number above the noodle review. Both remain on file."',
      'Joss: "We have room for a case. I moved the bucket."',
      'Joss: "I could read most of that receipt. The tea was unusually clear."',
      'Joss: "Your message came through. The kettle was louder than the last sentence."',
      'Joss: "We can settle the expenses from the receipts. Please stop using them as coasters."',
    ],
    met: [
      'Joss: "We got what we went for. I cleared the bench; please keep it pointed away from the kettle."',
      'Joss: "Logged under equipment. The tablecloth can have its own entry if we are keeping it."',
    ],
    failed: [
      'Joss: "We did not get it. The notes are saved, and there is food left."',
      'Joss: "I closed the trip, not the search. We can decide what comes next after tea."',
    ],
  },
};
