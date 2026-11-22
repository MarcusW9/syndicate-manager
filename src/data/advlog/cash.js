// Log lines: cash. The owner's draft (2026-11-22), made district-free; Night Market-only lines
// moved to nightMarket.js. Finds are the same as recruit.js's: a shared finds pool may be simpler.
export default {
  goal: 'cash',
  open: {
    any: [
      '{contact}, {contactWhat}, knew of money the tong could earn with a little legwork. {who} asked how much legwork \'a little\' covered.',
      'A cash opportunity brought the crew to {place}. The person offering it wanted a conversation away from the supper queue.',
      '{who} started at {place}, where somebody needed a discreet collection handled. The fee was apparently the uncomplicated part.',
      'The run began with {contact}, {contactWhat}, and a folded note naming someone who could authorise payment.',
      'Someone at {place} had offered a share for recovering misplaced takings. The crew checked whether \'misplaced\' meant lost or stolen.',
      'A message from {contact}, {contactWhat}, mentioned a paid errand nobody had finished. {who} went to find out why.',
      'Word of an unclaimed payment led the crew to {place}. There was supposedly a recovery fee for sorting out the paperwork.',
      'The crew approached {contact}, {contactWhat}, about a small cash job. The explanation required moving three bowls off the table.',
    ],
    social: [
      '{who} asked {contact}, {contactWhat}, who needed something settled badly enough to pay promptly.',
      'A conversation at {place} turned up an awkward collection. {who} asked whether the person promising payment was also the person holding it.',
    ],
    tech: [
      '{who} found a paid recovery notice buried beneath clinic adverts. The reply directed the crew to {place}.',
      'A disputed payment reference led to {contact}, {contactWhat}. Untangling it might earn the tong a share.',
    ],
    stealth: [
      '{who} checked {place} before approaching anyone about the cash offer. The meeting looked easier without the neighbouring tables listening.',
      'The crew quietly approached {contact}, {contactWhat}, about money left behind after a hurried shop move.',
    ],
  },
  lead: {
    any: [
      'A counterkeeper recognised the envelope\'s description. It had gone upstairs with the evening accounts.',
      '{who} found the person who had signed for the collection. They remembered the handover because somebody had spilt soup on the receipt.',
      'The offered fee survived a second conversation. The crew now had a name for whoever could approve it.',
      'An old account book supplied a working number. Someone answered between orders and agreed to talk.',
      'A missing receipt turned up beneath a till drawer. The signature pointed towards the next person to ask.',
      'Someone had written the collection address on a takeaway menu. The crew separated the directions from the lunch specials.',
      'The person holding the money agreed to a meeting. \'An actual place and time,\' {who} reported, \'not a philosophical position.\'',
      'A supplier confirmed which payment had gone astray. The crew stopped chasing the other three amounts being argued about.',
      'The trail reached a clerk who could release the funds. The remaining question was which documents the clerk would accept.',
      'An argument over the total produced the missing page. Nobody had enjoyed being wrong enough to hide it again.',
    ],
    combat: [
      '{who} recognised a guard contractor\'s stamp on the collection slip. Its dispatch counter supplied a forwarding address.',
      'A nervous cashier wanted someone present during the count. {who} arranged the handover without promising to frighten anybody.',
    ],
    stealth: [
      '{who} watched the collection counter from the public tables. The person making the rounds matched the description.',
      'The crew found a quiet moment to check the posted collection schedule. It named a different counter from the one everyone had suggested.',
    ],
    tech: [
      '{who} matched two references filed under different shop names. They led to the same payment desk.',
      'A damaged receipt still held a readable transaction number. The clerk used it to locate the disputed payment.',
    ],
    social: [
      '{who} persuaded both sides to compare their copies. One had been arguing from the deposit, the other from the balance.',
      'A reluctant intermediary agreed to forward the enquiry. \'Apparently asking politely was the unusual part,\' {who} said.',
    ],
    piloting: [
      '{who} retraced the collection route and found a stop missing from the written schedule.',
      'A delivery driver remembered the address by its impossible loading turn. The crew found it without needing to attempt the turn.',
    ],
    medical: [
      'The account holder couldn\'t manage a long meeting under the strip lights. {who} arranged a short conversation somewhere quieter and got the authorisation details.',
      '{who} kept the questions brief when a collector needed rest. The useful answer was which desk held the payment.',
    ],
    cool: [
      'The broker waited for the crew to accept a smaller share. {who} waited for the agreed terms.',
      'Three people talked over the same receipt. {who} let them finish, then asked who actually had the envelope.',
      'A clerk kept returning to an irrelevant missing stamp. {who} calmly asked which written rule required it and got the correct form instead.',
      'The payer tried silence after running out of objections. The crew let the silence work until a meeting time followed.',
    ],
  },
  deadEnd: {
    any: [
      'The envelope held expired meal vouchers. The person describing it had been very confident about the word \'cash\'.',
      'A supposed reserve turned out to be money somebody expected to make next week.',
      'The address existed. The business offering payment had left behind a sign and an unpaid electricity bill.',
      'Someone had already collected the money. The notice remained because nobody wanted to climb up and remove it.',
      'The fee depended on a payment that depended on a winning bet. The crew stopped following that particular chain.',
    ],
    social: [
      '{who} heard an excellent explanation of why payment was certain. It contained no available money.',
      'The introduction led to someone seeking a loan. \'Wrong side of the transaction,\' {who} reported.',
    ],
    tech: [
      'The payment confirmation was a saved draft. Nothing had actually been transferred.',
      '{who} recovered the missing attachment. It was a photograph of the same invoice from a slightly worse angle.',
    ],
  },
  snag: {
    any: [
      'A broker added a forwarding fee after arranging the appointment. The crew paid to keep the meeting.',
      '{who} scraped a palm on a cracked counter edge. The owner supplied a dressing from beside the till.',
      'The meeting moved to a private room with a table charge. Apparently discretion came with a minimum order.',
      'The Wet Sleeve took an interest in the crew\'s collection paperwork. A cash payment shortened the inspection.',
    ],
    combat: [
      '{who} caught a slipping cash drawer before it hit the floor. The bruise arrived before the thank-you.',
      'A former guard mistook the crew\'s questions for a challenge to the collection arrangement. Their name reached people who hadn\'t needed to hear it.',
    ],
    stealth: [
      'A watcher noticed the crew checking the handover point. Keeping the collection discreet became harder.',
      '{who} caught a shin on a crate beneath an awning. The scrape was small; the opinion of the crate was not.',
    ],
    piloting: [
      'The crew\'s transport was clamped while a meeting ran long. The release fee came out of their pocket.',
      '{who} scraped a loading barrier while reversing through the delivery lane. Its owner wanted the repair paid before anyone left.',
    ],
  },
  find: {
    cash: [
      'A stallholder paid {cash} for taking a forgotten order to the correct counter.',
      '{who} helped carry a returned delivery down the street before closing. The supplier paid {cash}.',
      'A courier offered {cash} for covering a short collection while a trolley wheel was repaired.',
    ],
    gear: [
      'A repair stall clearing a shelf offered the crew a pouch of usable implant parts.',
      '{who} found a serviceable pistol holster among a trader\'s unwanted fittings. The trader said it could go with the empty packaging.',
      'A clinic technician gave the crew a spare trauma bag after replacing its worn strap.',
    ],
    rumour: [
      'A stallholder mentioned surplus equipment due for sale after a shop move. The crew noted who to ask later.',
      'Someone in the supper queue knew of another paid collection. The crew kept the tip separate from the current run.',
    ],
  },
  quiet: {
    any: [
      'The payment desk stayed closed. Its handwritten opening hours continued to make a persuasive case for being open.',
      '{who} waited through an entire kettle. Nobody arrived with anything to sign.',
      'The promised reply didn\'t come. Upstairs, the mahjong players had considerably more to say.',
      'Nothing changed except the queue. It acquired a second argument and no extra clerk.',
      'A cashier said the approval was pending. \'Still pending after lunch,\' {who} reported, \'but better fed.\'',
      'The crew watched the collection point beneath a looping holo-ad. The advert made more promises than the broker, narrowly.',
    ],
  },
  callbackContact: {
    lead: [
      '{contact} found the missing receipt beneath a newer stack. It named the person authorised to release payment.',
      'A message from {contact} supplied a meeting time and a number that actually worked.',
      '{who} checked in with {contact}. Somebody had agreed to discuss the amount after the evening rush.',
    ],
    deadEnd: [
      '{contact} had mistaken money promised for money available. The distinction occupied most of the conversation.',
      'The number from {contact} reached a disconnected handset. There was no second number to try.',
    ],
    snag: [
      '{contact} mentioned the collection within earshot of a rival broker. The crew\'s business became street gossip.',
      'An extra introduction fee appeared when {who} spoke to {contact}. Paying it kept the appointment available.',
    ],
  },
  callbackPlace: {
    lead: [
      '{who} returned to {place} with the reference number. Someone recognised it and fetched the correct ledger.',
      'A different clerk was working at {place}. This one knew where the envelope had gone.',
      'The crew checked {place} during collection hours. The person they needed arrived carrying the account book.',
    ],
    deadEnd: [
      'The offer at {place} had been posted for somebody else. Nobody knew how to reach them.',
      'A second enquiry at {place} exposed an old notice beneath a new date. The money had gone months ago.',
    ],
    snag: [
      'A collector at {place} began asking why the tong was enquiring about payments nearby. The crew attracted unwanted attention.',
      '{who} slipped on wet paving at {place}. A bruised knee made the nearest stool worth considering.',
    ],
  },
  turn: {
    good: [
      'The money was there, counted and available. The remaining step was the agreed handover.',
      'Both sides accepted the figures. Somebody fetched the cash box instead of another explanation.',
      'The authorised payer arrived with the envelope. The name matched the paperwork.',
      'The recovery fee was agreed in writing. \'Same number out loud and on paper,\' {who} reported.',
    ],
    rough: [
      'The cash appeared, along with a new claim on it. The crew asked everyone to keep their receipts visible.',
      'The payer offered less than agreed and called it a convenience adjustment.',
      'Someone had counted the money differently. The disagreement began before the envelope opened.',
      'The collection was within reach when a second intermediary demanded a share. The payer looked almost relieved to have another excuse.',
    ],
  },
  call: [
    'A rival collector grabbed the envelope and swung at the person holding it. The crew got caught at the counter and called it in.',
    'The payer\'s companions blocked the exit and demanded the crew\'s own cash. A stool came swinging, and they\'re calling it in.',
    'Someone pulled a weapon during the count. The first shot broke a light, and the crew called it in.',
    'The handover stopped when a second group forced through the curtain. A table went over under the first shove, and they\'re calling it in.',
  ],
  close: {
    met: [
      'The crew brought the agreed sum home. Joss counted it without accepting anybody\'s rounded version.',
      'The full amount reached the safehouse in a plain envelope. Someone had written \'cabbage\' on the front.',
      '{who} put the envelope beside the ledger. \'Actual money. You can stop looking at me like that.\'',
      'The run paid what it was meant to pay. Joss filed the receipt before it acquired a noodle stain.',
    ],
    partial: [
      'The crew brought home part of the sum. The unpaid balance stayed unpaid, whatever the promises said.',
      'Some of the money reached the safehouse, not all of it. Joss recorded the difference.',
      '{who} put a smaller envelope on the table than the tong had hoped for. \'Less than planned. More than an apology.\'',
      'The run covered part of the target. Nobody tried to count assurances as banknotes.',
    ],
    failed: [
      'The main collection paid nothing. Only the finds along the way counted towards the run.',
      'No money reached the safehouse. Joss kept the side finds separate from the empty collection.',
      '{who} closed the run without securing the sum. \'The promises were very generously sized.\'',
      'The promised money never materialised. Whatever the journey had turned up was all there was.',
    ],
  },
  asides: {
    superstitious: [
      '{who} kept a folded lucky receipt separate from anything Joss might need to audit.',
      'A note from {who} suggested that bad luck and handling charges were becoming difficult to distinguish.',
    ],
    money: [
      '{who} regarded the phrase \'only a small fee\' as an invitation to become extremely attentive.',
      'The word \'approximately\' had received a firm underline in {who}\'s notes.',
    ],
    warm: [
      '{who} kept asking whether people had eaten, even when they were being difficult.',
      'A margin note from {who} remembered the counter staff more kindly than the arrangements they worked under.',
    ],
    hot: [
      '{who} had developed a very specific opinion about people who said \'just a moment\'.',
      'The report from {who} contained one sentence crossed out hard enough to make it interesting.',
    ],
    wary: [
      '{who} preferred promises with a name, a date and somebody willing to answer the telephone.',
      'The word \'straightforward\' had made {who} less comfortable, not more.',
    ],
    calm: [
      '{who} treated the waiting as weather: inconvenient, not personally arranged.',
      'The notes from {who} remained neatly written, which was more restraint than the paperwork deserved.',
    ],
    cold: [
      '{who} kept the amount separate from the story told about it.',
      'Sympathy hadn\'t changed {who}\'s view that an unpaid sum was still unpaid.',
    ],
    charming: [
      '{who} maintained that good manners were free and therefore excellent value.',
      'The report from {who} gave everyone\'s name correctly, including the people nobody liked.',
    ],
    curious: [
      '{who} wanted to know why cash boxes so often smelled faintly of biscuits.',
      'A question in {who}\'s notes asked when handling charges had become a profession.',
    ],
    chrome: [
      '{who} blamed a flickering optic display for making every total look negotiable.',
      'The report included {who}\'s reminder that implant upkeep also required actual money.',
    ],
    haunted: [
      '{who} still disliked the sound of coins being counted behind a closed door.',
      'The phrase \'you can trust me\' had left {who} quieter than the rest of the conversation.',
    ],
  },
  pair: [
    '{who} and {other} compared copies of the figures over tea. Neither trusted the other\'s arithmetic until both totals matched.',
    'A route discussion between {who} and {other} became an argument about which stairs counted as a shortcut.',
    '{who} practised asking for payment while {other} supplied increasingly implausible excuses. Both recognised too many of them.',
    'The crew waited between appointments while {who} and {other} debated whether a free biscuit created an obligation.',
    '{who} checked the references while {other} checked the addresses. They caught a transposed number before setting off.',
    'A quiet stretch gave {who} and {other} time to compare their worst-paying jobs. Neither accepted the other\'s winner.',
  ],
  joss: {
    day: [
      'Joss: "I\'ve left room for the actual figure. Optimism doesn\'t need its own column."',
      'Joss: "Keep the receipts dry. I can read a stain, but it rarely says anything useful."',
      'Joss: "Our expenses remain expenses even when someone calls them a courtesy."',
      'Joss: "Eat something. Being hungry won\'t improve anyone\'s arithmetic."',
    ],
    met: [
      'Joss: "Counted and entered. We can enjoy it now, preferably without spending it twice."',
      'Joss: "The full amount. A pleasingly uncomplicated number."',
      'Joss: "That\'s ours, then. Put the kettle on before somebody invents another fee."',
    ],
    failed: [
      'Joss: "I\'ve closed the collection. We can be disappointed without leaving the books open."',
      'Joss: "No money. I\'ve recorded the finds separately, exactly as reported."',
      'Joss: "You\'re here. The money isn\'t. We\'ll plan from those facts."',
    ],
  },
};
