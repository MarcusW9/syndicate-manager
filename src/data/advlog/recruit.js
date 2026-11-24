// Log lines: recruit. The owner's drafts (2026-11-22): the Night Market version as the base, made
// district-free, with the best of the first draft and the review's fixes. Night Market-only lines
// moved to nightMarket.js. Asides still lean to reflections: give them a moments pass (prompt rule 16).
export default {
  goal: 'recruit',
  open: {
    any: [
      '{contact}, {contactWhat}, had heard of {lead}. {who} asked whether a message could get through.',
      'Word of {lead} brought the crew to {place}. The introduction apparently began with buying lunch.',
      '{who} started at {place}, asking about {lead} between the lunch rush and the washing-up.',
      'The search began with {contact}, {contactWhat}, who knew of {lead} but wanted to know what sort of tong was asking.',
      'Someone had recommended {lead} over a noisy counter. The crew took the description to {place} before the details got any thinner.',
      'A note from {contact}, {contactWhat}, mentioned {lead}. Underneath was written: \'Ask properly. Don\'t just turn up.\'',
      'The crew followed word of {lead} to {place}. Somebody there had offered to make an introduction.',
      'An enquiry about {lead} reached {contact}, {contactWhat}. {who} went along with a number to pass on and no expectation of an address.',
    ],
    social: [
      '{who} asked {contact}, {contactWhat}, about {lead} while helping clear the empty bowls. The answer came without the usual audience.',
      'A conversation at {place} turned towards {lead}. {who} asked who could introduce the tong without making it sound like a collection.',
    ],
    tech: [
      '{who} found an old work notice from {lead} on a local message board. Its replies pointed towards {place}.',
      'A public repair discussion mentioned {lead} and {contact}, {contactWhat}. The crew asked for a message to be forwarded.',
    ],
    stealth: [
      '{who} checked {place} after hearing about {lead}. There was somewhere to ask questions without the next table listening.',
      'The crew approached {contact}, {contactWhat}, quietly about {lead}. Changing work was nobody else\'s evening entertainment.',
    ],
  },
  lead: {
    any: [
      'A stallholder recognised the description and offered to pass on the tong\'s number after closing.',
      '{who} found someone who had worked alongside the person they wanted. The reference included a warning about terrible singing.',
      'The invitation reached the right handset. A reply asked what a normal week with the tong looked like.',
      'Someone supplied a name and corrected the pronunciation twice. The crew practised before sending the message.',
      'A former colleague agreed to make the introduction. \'Don\'t do the speech about opportunity. Just say what you pay.\'',
      'The reply asked whether the tong expected people to work through neural load. {who} sent the question to the fixer.',
      'A counterkeeper remembered who had collected the last repair order. That gave the crew someone useful to ask.',
      'The enquiry moved from a public board to a direct message. Somebody wanted to know more without the whole street commenting.',
      'An acquaintance offered to arrange a short conversation between shifts. The crew asked what time actually meant between shifts.',
      'The person forwarding messages asked for the fixer\'s name. This time it was going on an invitation, not another list of questions.',
    ],
    combat: [
      '{who} checked a reference with a former door guard. The useful part concerned restraint, not the story about the broken table.',
      'A clinic attendant remembered someone keeping a frightened customer calm during a security scare. {who} asked whether an introduction was possible.',
    ],
    stealth: [
      '{who} found a quiet moment to leave the invitation while the nearby collectors were occupied elsewhere.',
      'The proposed meeting corner was overlooked by a busy gambling room. {who} suggested a less public table and got an agreement.',
    ],
    tech: [
      '{who} traced a public work notice to an active account. Its owner agreed to forward the enquiry.',
      'A repair stall still had permission to contact its former subcontractor. The owner sent the tong\'s message while the crew waited.',
    ],
    social: [
      '{who} answered questions over noodles without promising an easy life. The next reply asked when the fixer was available.',
      'A suspicious acquaintance softened after hearing the crew describe an ordinary working day. \'That sounds more believable than exciting.\'',
    ],
    piloting: [
      '{who} found the dispatch counter where a message could be left between delivery runs. The clerk confirmed it would reach the right person.',
      'A delivery driver recognised the description from the late rounds. {who} arranged for an invitation to travel with the next collection slip.',
    ],
    medical: [
      '{who} asked about rest arrangements before availability. The intermediary stopped giving rehearsed answers and offered an introduction.',
      'A clinic worker agreed to forward the invitation without sharing patient details. {who} left a number and kept the conversation brief.',
    ],
    cool: [
      'The reply listed several reasons not to trust a tong. {who} answered the questions underneath them.',
      'An intermediary let the silence stretch over three rounds of mahjong downstairs. {who} waited and got permission to send a message.',
    ],
  },
  deadEnd: {
    any: [
      'The description fitted someone who had moved on months ago. The stallholder still spoke about them in the present tense.',
      'A promising introduction led to someone looking for customers, not work. The crew received a very thorough price list.',
      'The note had been pinned over an older note. Everyone had been reading the wrong telephone number.',
      'Someone had confused leaving a shift with leaving an employer. \'Understandable ambition,\' {who} said.',
      'The person behind the recommendation admitted to knowing only a nickname. Three different people answered to it.',
    ],
    social: [
      '{who} heard an excellent account of someone\'s abilities. The storyteller eventually admitted it had come from a customer of a customer.',
      'A broker promised an introduction after supper. Supper ended, the stools went up, and the introduction remained theoretical.',
    ],
    tech: [
      'The work profile was still active because a stall kept reposting old adverts. Nobody had checked the replies.',
      '{who} recovered the missing contact details. They belonged to the shop that had printed the notice.',
      'The contact account had been abandoned. Its automatic reply was more enthusiastic than its owner.',
    ],
  },
  snag: {
    any: [
      'A broker charged a forwarding fee that hadn\'t been mentioned over the handset. The crew paid to keep the enquiry moving.',
      '{who} scraped a knuckle on a broken stool while making room at a counter. The owner produced a dressing from beside the till.',
      'A changed appointment meant paying for a private table elsewhere. The original table had become a birthday dinner.',
      'The Wet Sleeve took an interest in the crew\'s questions. A cash payment shortened the discussion.',
      'A former employer heard the enquiry and began asking which tong was taking staff. The crew\'s name travelled further than intended.',
    ],
    combat: [
      'A bouncer at the meeting spot decided {who} looked like trouble and said so with a shoulder. The bruise lasted longer than the argument.',
      '{who} was asked to prove they could handle themselves before anyone would talk. The proof cost a sleeve and some pride.',
      '{who} caught a falling stack of stools before it reached the table. The resulting bruise earned an apology and no discount.',
    ],
    stealth: [
      'A watcher noticed the crew checking a meeting spot. The quiet approach stopped being quiet.',
      '{who} caught a shin on a crate tucked beneath an awning. The scrape was small; the crate received a detailed review.',
    ],
    piloting: [
      'The delivery lane closed while the crew were inside. Getting their transport released cost a storage fee.',
      '{who} backed into a barrier in a crowded loading bay. The owner wanted cash for the damage.',
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
      '{who} found a serviceable pistol holster among a trader\'s unwanted fittings. The trader waved it away with the empty packaging.',
      'A clinic technician gave the crew a spare trauma bag after replacing its worn strap.',
    ],
    rumour: [
      'A stallholder mentioned surplus equipment due for sale after a shop move. The crew noted who to ask later.',
      'Someone in the supper queue knew of a paid collection nobody had taken yet. It remained a tip, not an arrangement.',
    ],
  },
  quiet: {
    any: [
      'No reply arrived. {who} watched a cook fold dumplings with increasingly unreasonable speed.',
      'The crew waited beneath an awning while the same holo-ad restarted every few minutes. Nobody learned anything new.',
      'A promised call never came. The mahjong room upstairs supplied enough noise to suggest several other people were having a day.',
      'Nothing changed on the message board. Someone had added a moustache to an implant advert.',
      'The invitation stayed unanswered. \'We could try looking less available,\' {who} suggested from the same stool.',
    ],
  },
  callbackContact: {
    lead: [
      '{contact} had passed on the invitation. The reply asked whether the fixer would meet somewhere outside the tong\'s hall.',
      'A message from {contact} supplied a name and permission to mention the introduction.',
      '{who} checked in with {contact}. A short conversation could be arranged once the evening rush eased.',
    ],
    deadEnd: [
      '{contact} had mixed up two people who used the same repair stall. Neither introduction reached the person the crew wanted.',
      'The message through {contact} reached an abandoned account. There was no current number to try.',
    ],
    snag: [
      '{contact} discussed the enquiry within earshot of a collector. The crew\'s recruitment plans became street gossip.',
      'A message-handling fee appeared when {who} spoke to {contact}. Paying it kept the introduction available.',
    ],
  },
  callbackPlace: {
    lead: [
      '{who} returned to {place} and found a reply tucked behind the counter. It asked what the tong expected from a new runner.',
      'Someone at {place} recognised the description and offered to pass on the invitation after work.',
      'The next visit to {place} produced a mutual acquaintance willing to introduce the fixer.',
    ],
    deadEnd: [
      'The recommendation at {place} had been copied from an old notice. Nobody knew whether its subject still worked nearby.',
      'A second enquiry at {place} exposed a misunderstanding. The person being recommended wanted a repair job done, not a new employer.',
    ],
    snag: [
      'A collector at {place} started asking why the tong was recruiting nearby. The crew\'s questions became harder to keep discreet.',
      '{who} slipped on wet paving at {place}. A bruised knee made the nearest stool suddenly attractive.',
    ],
  },
  turn: {
    good: [
      '{leadShort} replied directly and asked when the fixer could talk. No intermediary needed to improve the wording.',
      'The invitation reached {leadShort}, who suggested somewhere quiet enough to hear the answers.',
      'A message from {leadShort} asked about pay, downtime and the people already in the tong. The conversation was within reach.',
      '{leadShort} wanted to hear the offer in person. The crew had a chance to arrange it without anyone charging for another introduction.',
    ],
    rough: [
      '{leadShort} answered, but wanted an old story about the tong explained before considering a meeting.',
      'An intermediary claimed a fee just as {leadShort} became willing to talk. Nobody had mentioned owning the conversation before.',
      '{leadShort} was interested enough to ask difficult questions and unimpressed by the answers passed through other people.',
      'A possible meeting with {leadShort} came with one condition: no promises the fixer hadn\'t personally agreed to keep.',
    ],
  },
  call: [
    'A broker demanded payment for letting the crew leave and swung a stool at {who}. The crew called it in.',
    'A group claiming to control local hiring blocked the passage. Someone threw a punch, and they\'re calling it in.',
    'The conversation stopped when armed collectors forced through the curtain. A shot broke the counter light, and the crew called it in.',
    'Someone mistook the enquiry for an attempt to collect a debt and lunged across the table. The crew backed towards the doorway and called it in.',
  ],
  close: {
    met: [
      '{leadShort} agreed to meet the fixer. The crew brought the details home without calling it a new recruit.',
      'The search ended with {leadShort} willing to discuss joining. The decision still belonged to the person coming through the door.',
      '{who} passed on the agreed meeting details. \'A conversation. Don\'t start assigning a bed.\'',
      'The invitation was accepted for a meeting, not an oath. {leadShort} would hear the fixer out.',
    ],
    partial: [
      'The crew brought home a checked name for {leadShort}, but no meeting. The introduction still needed work.',
      'There was a real name in the notes now. {leadShort} hadn\'t agreed to talk.',
      '{who} put the confirmed name beside the original description. The space for a meeting stayed blank.',
      'The search identified {leadShort} without securing a conversation. That was progress, not a recruitment.',
    ],
    failed: [
      'The crew closed the search without a usable name or meeting. Only the finds along the way remained.',
      'No introduction held up. The expedition produced whatever the crew had found between enquiries.',
      '{who} brought the search notes home without a confirmed identity. The side finds were all there was to log.',
      'The approach went nowhere. Joss recorded the finds separately and left the recruitment entry empty.',
    ],
  },
  asides: {
    superstitious: [
      '{who} considered a proper introduction worth more than a lucky number, though having both seemed sensible.',
      'A note from {who} asked whether mentioning the tong\'s altar made the invitation reassuring or ominous.',
    ],
    money: [
      '{who} wanted any prospective colleague to ask about wages before asking about reputation.',
      'The phrase \'a share of future success\' had received a firm underline in {who}\'s notes.',
    ],
    warm: [
      '{who} bought the contact\'s nephew a sugar cane drink and heard the whole family history for it.',
      'A margin note from {who} said to ask about food preferences before choosing anywhere for a meeting.',
    ],
    hot: [
      '{who} had little patience for anyone who described changing employers as betrayal.',
      'The report from {who} contained a strongly worded opinion about charging people to introduce themselves.',
    ],
    wary: [
      '{who} preferred an awkward question to an answer that arrived too easily.',
      'A cautious reply would have reassured {who} more than an immediate yes.',
    ],
    calm: [
      '{who} let the silence run until the other side filled it.',
      'The notes from {who} left room for an answer that wasn\'t the one the tong wanted.',
    ],
    cold: [
      '{who} checked the reference with three people the reference didn\'t know about.',
      '{who} kept recommendations in one column and checked facts in another.',
    ],
    charming: [
      '{who} insisted that recruitment should sound less like arranging a dental appointment.',
      'The report from {who} included a reminder that remembering someone\'s name was not an advanced technique.',
    ],
    curious: [
      '{who} wondered which detail about the tong would sound strangest to somebody new.',
      'A question in {who}\'s notes asked what people wished they had known before joining their previous crews.',
    ],
    chrome: [
      '{who} considered questions about implant downtime evidence of experience, not a lack of commitment.',
      'The report from {who} underlined that useful hardware did not tell anyone whether its owner was good company.',
    ],
    haunted: [
      '{who} disliked invitations that sounded as though a person was expected to leave their old life at the door.',
      'The word \'family\' had made {who} pause longer than the rest of the recruitment pitch.',
    ],
  },
  pair: [
    '{who} and {other} rehearsed describing the tong over tea. Each removed a detail the other had thought sounded welcoming.',
    'A wait between enquiries became an argument about which of {who} and {other} had looked more suspicious when joining.',
    '{who} checked the names while {other} checked the numbers. They caught a mistake before sending the invitation.',
    'The crew paused while {who} and {other} debated whether mentioning the stairs counted as honesty or sabotage.',
    '{who} asked {other} what would have made joining easier. The answer began with better directions and became unexpectedly thoughtful.',
    'A quiet stretch gave {who} and {other} time to agree on a recruitment rule: nobody got described as \'the sensible one\' without being present.',
    'The crew paused while {who} and {other} argued over whether mentioning the safehouse kettle helped or hurt recruitment.',
  ],
  joss: {
    day: [
      'Joss: "Tell them what we\'re actually like. They can discover the kettle\'s personality in their own time."',
      'Joss: "I\'ve kept their questions with the report. Let\'s answer those before inventing a welcome speech."',
      'Joss: "We need another person, not a list of abilities that agrees with us."',
      'Joss: "An unanswered message is still unanswered. We don\'t need to make it mean anything else yet."',
    ],
    met: [
      'Joss: "A meeting, then. I\'ll remind everyone that listening is allowed."',
      'Joss: "Good. Clean cups, clear terms, no one telling the embarrassing story before they\'ve sat down."',
      'Joss: "They\'re coming to talk. The ledger can wait until they choose to write in it."',
      'Joss: "Good. No name in the sworn ledger until they choose to write it."',
    ],
    failed: [
      'Joss: "I\'ve closed the search. No confirmed name, no invented explanation."',
      'Joss: "We didn\'t get an introduction. That isn\'t a verdict on us or on someone we haven\'t met."',
      'Joss: "The finds are logged separately. We\'ll start the next search from what we actually know."',
    ],
  },
};
