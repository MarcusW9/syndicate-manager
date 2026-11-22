// Log lines: recruit. The owner's draft (2026-11-22, docs/log-lines-prompt.md), as pasted.
// Review notes in the session; moves to src/data/advlog/ when the log engine is built.
export default {
  goal: 'recruit',

  open: {
    any: [
      "{contact}, {contactWhat}, had heard of {lead}. {who} went to ask whether an introduction was possible.",
      "A tip about {lead} brought the crew to {place}. They started by asking who could pass on a message.",
      "{who} asked around {place} about {lead}. Someone recognised the description but wanted to know why.",
      "The search began with {contact}, {contactWhat}, who knew of {lead} and refused to hand out an address.",
      "Someone had recommended {lead} without supplying a name. The crew took the description to {place}.",
      "A message from {contact}, {contactWhat}, mentioned {lead}. The crew went to hear the part that hadn't fitted on the handset.",
      "Word put {lead} somewhere near {place}. {who} went looking for an introduction, not a doorstep surprise.",
      "The crew approached {contact}, {contactWhat}, about {lead}. The opening question was whether they were looking for work.",
    ],
    social: [
      "{who} asked {contact}, {contactWhat}, to pass a message to {lead}. No address required.",
      "A meal at {place} turned up word of {lead}. The crew asked who could introduce them properly.",
    ],
    tech: [
      "{who} found an old work notice from {lead}. A public reply address pointed towards {place}.",
      "A public repair thread mentioned {lead} and a meeting at {place}. The crew asked the organiser to forward an enquiry.",
    ],
    stealth: [
      "{who} checked {place} before asking about {lead}. It seemed better to approach without a crowd listening.",
      "The crew visited {place} quietly after hearing about {lead}. Nobody needed the whole street knowing someone might change jobs.",
    ],
  },

  lead: {
    any: [
      "{who} found somebody willing to forward the tong's details. They promised an introduction, not an endorsement.",
      "A former colleague recognised the description and offered to pass on a message.",
      "The reply asked what sort of work the tong actually did. The crew sent a plain answer.",
      "Someone supplied a name to go with the description. The crew checked the spelling before sending anything.",
      "An enquiry reached the right person. They wanted to know whether the fixer would discuss terms directly.",
      "A mutual acquaintance agreed to make contact. The crew left a number and stopped asking for private details.",
      "The conversation moved from whether there was work to what the work involved.",
      "A reference checked out. The person giving it mentioned patience before mentioning skill.",
      "The crew received a question about sleeping arrangements. Somebody was considering the offer seriously enough to ask.",
      "A message asked who would cover implant downtime. {who} sent it to the fixer rather than improvise a promise.",
    ],
    combat: [
      "{who} asked a former training partner about working habits. The answer was useful and refreshingly short on boasts.",
      "A reference described someone who knew when not to draw. {who} asked for an introduction.",
    ],
    stealth: [
      "{who} found a quiet way to leave the invitation without advertising anyone's interest in changing work.",
      "The crew checked the suggested meeting spot from the public lane. There was room to talk without an audience.",
    ],
    tech: [
      "{who} recovered a working public contact address from an old service listing. The enquiry received a reply.",
      "An expired work profile linked to a current noticeboard account. {who} asked its owner to forward the invitation.",
    ],
    social: [
      "{who} answered questions about the tong without turning the conversation into a sales pitch. Another message followed.",
      "A wary acquaintance agreed to introduce the crew after {who} explained what the invitation didn't require.",
    ],
    piloting: [
      "{who} found the public stop named in the reply. The proposed meeting was practical, not just polite.",
      "A former driver knew which dispatch desk could forward a message. {who} reached it before the shift changed.",
    ],
    medical: [
      "{who} asked about rest and neural load before discussing availability. The reply became noticeably less guarded.",
      "A clinic worker agreed to pass on the invitation without sharing patient details. {who} left the fixer's number.",
    ],
    cool: [
      "The reply was blunt about previous employers. {who} answered the actual questions and left the anger alone.",
      "An intermediary tested the crew with a long silence. {who} waited instead of filling it with promises.",
    ],
  },

  deadEnd: {
    any: [
      "The description fitted two people. Neither was the person the crew wanted.",
      "A promising address belonged to a former employer. Nobody there could forward a message.",
      "The work notice was old enough to have changed hands with the handset.",
      "Someone had mistaken a wish to leave work early for a wish to leave the job.",
      "The supposed introduction led to somebody selling access to a list. The crew declined.",
    ],
    social: [
      "{who} heard plenty about a remarkable worker. Nobody telling the stories had actually met them.",
      "An acquaintance had exaggerated the interest in tong work. There was no invitation to pass on.",
    ],
    tech: [
      "The contact account had been abandoned. Its automatic reply was more enthusiastic than its owner.",
      "{who} checked the profile behind the recommendation. It belonged to a recruiter advertising an empty roster.",
    ],
  },

  snag: {
    any: [
      "A broker wanted a fee before forwarding the invitation. The crew paid for the message, not a promise of acceptance.",
      "Someone repeated the enquiry within earshot of an employer. Keeping the approach discreet became harder.",
      "{who} caught a shoulder on a low doorframe while checking an address. The bruise was less impressive than the noise.",
      "A meeting change added another fare to the day's costs.",
      "The room booked for a conversation had been double-booked. Finding somewhere private cost extra.",
    ],
    combat: [
      "A former employer took {who}'s questions as an attempt to poach staff. The crew's name attracted unwelcome attention.",
      "A heavy door swung shut while {who} held it for a visitor. The resulting bruise earned a very apologetic cup of tea.",
    ],
    stealth: [
      "A caretaker noticed the crew checking a meeting entrance. The quiet enquiry became a public discussion.",
      "{who} stepped on a loose stair tread. A scraped shin and a loud complaint from downstairs followed.",
    ],
    piloting: [
      "The crew's transport was clamped while a conversation ran long. The release fee was not negotiable.",
      "{who} clipped a loading barrier while turning out of a narrow lane. The repair added to the bill.",
    ],
  },

  find: {
    cash: [
      "A shopkeeper paid {cash} for delivering a forgotten document pouch along the crew's route.",
      "{who} helped return a hired trolley before the next charge began. Its grateful borrower paid {cash}.",
      "A courier offered {cash} for carrying a sealed parcel to the next staffed desk.",
    ],
    gear: [
      "A workshop clearing old stock offered the crew a pouch of serviceable spare parts.",
      "{who} found an unwanted weapon sling in a box of discarded fittings. The owner said to take it.",
      "A repairer gave the crew a sealed cleaning kit left over from a cancelled order.",
    ],
    rumour: [
      "Someone mentioned a small cash job that might suit the tong later. The crew noted who to ask.",
      "A counter conversation turned up word of surplus equipment due for sale. Nobody had checked the details yet.",
    ],
  },

  quiet: {
    any: [
      "No reply arrived. The crew left the invitation alone rather than turn it into pressure.",
      "{who} waited through the agreed contact window. The handset stayed quiet.",
      "The message remained unanswered. Nobody sent a second version with more adjectives.",
      "A long afternoon passed between enquiries. The crew learned which bench stayed dry.",
      "Nothing changed on the contact board. Someone had corrected the spelling on a noodle advert.",
      "The crew kept the day clear for a conversation that didn't happen. No explanation arrived either.",
    ],
  },

  callbackContact: {
    lead: [
      "{contact} had passed on the invitation. The reply asked for a clearer description of the tong's work.",
      "A note from {contact} supplied a name and permission to use it when making contact.",
      "{who} checked back with {contact}. An introduction was possible if the crew kept the meeting small.",
    ],
    deadEnd: [
      "{contact} had confused two people with similar work histories. The introduction went nowhere.",
      "The message through {contact} reached an old handset. Nobody knew who had it now.",
    ],
    snag: [
      "{contact} mentioned the enquiry too freely. An employer started asking who was recruiting.",
      "A forwarding fee appeared when the crew spoke to {contact}. Keeping the introduction alive cost cash.",
    ],
  },

  callbackPlace: {
    lead: [
      "{who} returned to {place} and found someone authorised to forward the invitation.",
      "A message had been left for the crew at {place}. It asked when the fixer could talk.",
      "The next visit to {place} produced a mutual acquaintance willing to make the introduction.",
    ],
    deadEnd: [
      "The notice at {place} belonged to somebody else with a similar name. The crew checked and crossed it off.",
      "Nobody at {place} could place the description. The original tip had stretched a passing resemblance.",
    ],
    snag: [
      "The crew's questions at {place} attracted an employer's attention. Discretion became harder to maintain.",
      "{who} slipped on a wet step at {place}. A bruised knee made the stairs less appealing.",
    ],
  },

  turn: {
    good: [
      "{leadShort} replied directly. They wanted to hear from the fixer before deciding anything.",
      "The introduction reached {leadShort}, who asked for a choice of meeting times.",
      "A conversation with {leadShort} moved beyond the message chain. The tong sounded worth discussing.",
      "{leadShort} asked where a quiet meeting could happen. Nobody had agreed to join, but the invitation was being considered.",
    ],
    rough: [
      "{leadShort} answered, but wanted a previous promise explained before considering another employer.",
      "The invitation reached {leadShort}. An intermediary then claimed a fee for any meeting that followed.",
      "{leadShort} was willing to hear more, provided the crew stopped letting other people speak on their behalf.",
      "A possible meeting with {leadShort} came with difficult questions about pay, downtime and who carried the risk.",
    ],
  },

  call: [
    "An intermediary demanded payment for letting the crew leave and swung at {who}. The crew called it in.",
    "Someone mistook the enquiry for a debt collection and pulled a weapon. A shot broke the window, and they're calling it in.",
    "A group claiming to control local hiring blocked the stairs. The first shove sent a chair over, and the crew called it in.",
    "The meeting room door opened on people demanding the crew's handsets. Someone threw a punch, and they're calling it in.",
  ],

  close: {
    met: [
      "{leadShort} agreed to meet the fixer. The crew brought the arrangement home without calling it a recruitment.",
      "The search ended with {leadShort} willing to sit down and discuss the tong. Joining remained their decision.",
      "{who} passed on the agreed meeting details. {leadShort} was ready to hear the fixer out.",
      "The invitation was accepted for a conversation, not an oath. {leadShort} would meet the fixer.",
    ],
    partial: [
      "The crew secured a name for {leadShort}, but no meeting. The fixer had someone to approach, not an appointment.",
      "{who} brought home a checked name. {leadShort} hadn't agreed to talk yet.",
      "The search put a name to {leadShort}. Arranging a conversation remained unfinished.",
      "There was a real name in the ledger now, but no meeting beside it. That was as far as the approach had gone.",
    ],
    failed: [
      "The crew closed the search without a usable name or meeting. Only the finds along the way remained.",
      "No introduction held up. The expedition ended with whatever the crew had found en route.",
      "{who} brought the search notes home without a confirmed identity. The side finds were all the run produced.",
      "The approach went nowhere. Joss logged the finds separately and left the recruitment entry empty.",
    ],
  },

  asides: {
    superstitious: [
      "{who} considered a good introduction something worth leaving tea out for.",
      "The number four still troubled {who}, even when it appeared in an otherwise reasonable address.",
    ],
    money: [
      "{who} wanted any future colleague to ask about pay before asking about glory.",
      "A margin note from {who} said that 'like a family' was not a wage figure.",
    ],
    warm: [
      "{who} kept remembering what it felt like to be the person considering a strange crew.",
      "The report from {who} made room for people's worries without turning them into weaknesses.",
    ],
    hot: [
      "{who} had very little patience for people discussing workers as though they owned them.",
      "The phrase 'excellent exposure' had not improved {who}'s opinion of anyone.",
    ],
    wary: [
      "{who} preferred a cautious question to an enthusiastic promise.",
      "An easy answer made {who} want to check the question again.",
    ],
    calm: [
      "{who} treated hesitation as something people were allowed to have.",
      "The report from {who} left room for an answer that wasn't yes.",
    ],
    cold: [
      "{who} kept a recommendation separate from a reference that had actually been checked.",
      "A good story hadn't persuaded {who} to skip the ordinary questions.",
    ],
    charming: [
      "{who} insisted that an invitation should sound like somewhere a person might want to go.",
      "The report from {who} remembered names more carefully than titles.",
    ],
    curious: [
      "{who} wanted to know what made someone stay with a crew after the exciting part wore off.",
      "A note from {who} asked whether everyone remembered their own recruitment more kindly than it happened.",
    ],
    chrome: [
      "{who} considered questions about implant downtime a sign of sense, not fragility.",
      "The report from {who} underlined that a person was not the hardware fitted to them.",
    ],
    haunted: [
      "{who} disliked the phrase 'a fresh start' when it sounded like an instruction to forget.",
      "The word 'loyalty' had made {who} quieter until somebody explained what they meant by it.",
    ],
  },

  pair: [
    "{who} and {other} rehearsed describing the tong. The version without heroic exaggeration took considerably less time.",
    "A wait between enquiries became a debate between {who} and {other} about who had made the worse first impression.",
    "{who} checked the names while {other} checked the numbers. They caught a mistake before sending the invitation.",
    "The crew paused while {who} and {other} argued over whether mentioning the safehouse kettle helped or hurt recruitment.",
    "{who} asked {other} what would have made joining easier. The answer was practical enough to write down.",
    "A quiet afternoon gave {who} and {other} time to agree on one thing: nobody should promise that the stairs were manageable.",
  ],

  joss: {
    day: [
      "Joss: \"An invitation isn't a summons. We can afford to remember that.\"",
      "Joss: \"Tell them what we're actually like. They'll find out about the kettle eventually.\"",
      "Joss: \"I've kept the questions with the report. Don't promise answers we haven't agreed.\"",
      "Joss: \"We need another person, not a description that looks good on the board.\"",
      "Joss: \"Take your time with the names. Being remembered correctly is a reasonable place to start.\"",
      "Joss: \"I've logged what we know. The rest can wait until someone chooses to tell us.\"",
    ],
    met: [
      "Joss: \"A meeting, then. I'll make sure we have clean cups, not a welcome speech.\"",
      "Joss: \"They've agreed to talk. We should probably let them do some of it.\"",
      "Joss: \"Good. No name in the sworn ledger until they choose to write it.\"",
    ],
    failed: [
      "Joss: \"No introduction this time. That doesn't make the next person a replacement for a stranger.\"",
      "Joss: \"I've closed the search. We won't turn an unanswered message into an obligation.\"",
      "Joss: \"Nothing confirmed. Better an empty space than a name we haven't checked.\"",
    ],
  },
};
