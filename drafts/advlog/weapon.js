// Log lines: weapon. The owner's draft (2026-11-22, from docs/log-lines-prompt.md), put into the
// prompt's second format by Claude. Changes from the owner's text are marked "// fixed:"; gaps
// to fill are marked "// needs". Lines marked "// v2" come from the owner's second draft (2026-11-22),
// the best of it sorted into this format. Moves to src/data/advlog/ when the log engine is built.
export default {
  goal: 'weapon',

  open: {
    any: [
      '{contact}, {contactWhat}, had heard about {itemFull} changing hands somewhere in {district}. {who} went to ask what they knew.', // fixed: contact intro
      'A name attached to {itemFull} led {who} to {place}. Somebody there had seen it recently.',
      '{who} picked up word that {itemFull} was for sale around {place}. The seller wasn\'t advertising.',
      'Someone had been asking after ammunition for {itemFull}. {who} traced the question back to {contact}, {contactWhat}.',
      '{contact}, {contactWhat}, knew somebody trying to move {itemFull} without drawing attention. {who} went looking for the introduction.',
      'A repair receipt led {who} to {place}. Somebody there had recently worked on {itemFull}.', // v2
      '{who} started at {place}, where a seller had been showing off {itemFull}. Nobody remembered the asking price the same way.', // v2
      'The hunt began with {contact}, {contactWhat}, who knew somebody selling {itemFull} to cover a debt.', // v2
      'Someone had left a case at {place} and stopped paying for storage. The description sounded like {itemFull}.', // v2
      'Word about {itemFull} came through {contact}, {contactWhat}. The introduction cost lunch, paid in advance.', // v2
    ],
    social: [
      '{who} bought {contact}, {contactWhat}, a meal and asked about {itemFull}. The answer came after the bowls were cleared.',
      'A few careful questions got {who} pointed towards {place}. Someone there knew who had {itemFull}.',
    ],
    tech: [
      '{who} followed a sale notice for {itemFull} that had been scrubbed from the local boards. It pointed towards {place}.', // fixed: named the item, so the trip says what is hunted
      'A parts listing for {itemFull} was still sitting in an old message cache. {who} traced it back to {contact}, {contactWhat}.',
    ],
    stealth: [
      '{who} watched {place} until somebody arrived carrying a case about the right size for {itemFull}.',
      'Word said {itemFull} was being kept near {place}. {who} went over quietly to see who came and went.',
    ],
  },

  lead: {
    any: [
      'A seller had moved on, but left a number behind. {who} got enough from it to keep looking.',
      'The trail crossed a noodle counter and two people who wanted cash before talking. {who} came away with a better address.',
      'Somebody remembered the case {item} travelled in. {who} followed the description to another part of {district}.',
      '{who} found somebody who had handled {item} recently. They remembered where it went next.',
      'A rumour about {item} turned out to have a real seller behind it. The price was still unclear.',
      'A repair bill put {item} in {district} recently. {who} found where the work had been done.',
      'The case had a broken catch repaired with red cord. Somebody remembered carrying it upstairs.', // v2
      'The asking price had dropped twice. Whoever held it was running short of time.', // v2
      'The trail crossed two counters and a wet stairwell. At the top, somebody had actually seen {item}.', // v2
      'Someone had been trying to sell the accessories separately. The crew got a name from the packaging.', // v2
    ],
    combat: [
      '{who} found somebody who had seen {item} used in a back-room match. The owner had been taking offers afterwards.',
      'A bruised door guard recognised the description. {who} got a place and a name without adding to the bruises.', // fixed: smoother end
      'A seller swore {item} had never been used. {who} pointed out the wear and got a more honest introduction.', // v2
    ],
    stealth: [
      '{who} followed the suspected seller for three blocks and watched where the case was left.',
      'A quiet look through an unattended storeroom turned up packing material for {item}. Whoever moved it hadn\'t gone far.',
      '{who} watched a hand-off from across the street. The case changed hands, and now the crew knew who had it.',
    ],
    tech: [
      '{who} pulled a partial serial from an old repair record. It matched {item} and gave the crew another name to chase.',
      'A deleted sale message still had routing data attached. {who} followed it to the next lead.',
      '{who} found a recent diagnostic record for {item}. Somebody had paid to make sure it still worked.',
    ],
    social: [
      '{who} let the conversation wander until somebody mentioned {item} without being asked. That gave the crew somewhere useful to look.',
      'A seller wanted reassurance before giving up a name. {who} talked long enough to get it.',
      'A seller wanted reassurance first. {who} sat through photos of all forty grandchildren and got a name.',
      'A seller wanted reassurance first. {who}: "I know more about her divorce than her lawyer does. But we have a name."',
      '{who} traded a small favour for a better introduction. The next person had actually seen {item}.',
      'The owner of a borrowed trolley remembered exactly who had failed to return it. The case had gone with them.', // v2
    ],
    piloting: [
      '{who} followed a delivery van through {district} until it stopped somewhere that matched the rumour.',
      'A courier remembered moving a case like the one {item} travels in. {who} retraced the route and found where it had been dropped.', // fixed: "the one for {item}" read oddly with "the Kestrel-9"
      'The case had travelled in a hired van. The return yard gave up a collection address once the crew settled an unpaid cleaning fee.', // v2
    ],
    medical: [ // v2
      '{who} recognised a clinic dressing on the seller\'s hand. A discreet word at the clinic got a message passed on.',
      'A repairer was laid up after an implant flare-up. {who} kept the visit short and came away with a name.',
    ],
    cool: [
      'The seller tried to make {who} wait all afternoon. {who} waited longer and got the meeting.',
      'Somebody tested {who} with three different prices and two bad addresses. Staying calm got the real one.',
      'The broker stopped talking to see who would fill the silence. {who} waited and got the owner\'s name.', // v2
    ],
  },

  deadEnd: {
    any: [
      'The case was the right size. What was inside wasn\'t {item}. The day went with it.',
      '{who} followed the rumour across {district}. It ended with somebody selling spare parts and a convincing story.',
      'The seller had already gone. Nobody nearby knew where, or admitted they did.',
      'A promising address turned out to have been empty for weeks. Nothing there moved the hunt forward.',
      'Someone had mistaken a similar weapon for {item}. {who} checked it anyway and lost the day.',
      'The trail ended at a locked shop and a neighbour who knew nothing useful.',
      'A viewing turned out to be a pitch for something else. The crew left before the instalment plan.', // v2
      'The supposed owner had only borrowed the case. They had never seen what belonged inside.', // v2
      'The case was the right size. Inside was a karaoke machine, still plugged in. The day went with it.',
      'The case was the right size. What was inside wasn\'t {item}. {who} says it was "a very nice umbrella" and would like that noted.',
    ],
    social: [
      '{who} spent half the day listening to somebody who claimed to know the seller. They knew stories, not the seller.',
      'The introduction was real, but the information was old. {item} had passed through weeks ago.',
      'A broker promised a name after one more cup of tea. By closing time, the pot was empty and so was the promise.', // v2
    ],
    tech: [
      'The sale record {who} found had been copied and reposted so many times the original trail was gone.',
      '{who} chased a serial match until the last digit came up. Wrong weapon.',
    ],
  },

  snag: {
    any: [
      'Somebody realised the crew was looking for {item} and started asking why. {who} backed off before the questions got expensive.',
      'A small argument over access cost the crew cash and most of the afternoon. The lead survived.',
      '{who} took a scrape getting out through a service door that closed sooner than expected.',
      'The seller changed meeting places without warning. By the time {who} caught up, everyone nearby was paying attention.',
      'Someone else was looking for {item}. They now knew the crew was too.',
      'The person holding the case started charging for viewings. The crew paid to keep the appointment.', // v2
      'Another buyer had heard the same rumour. The seller became much less flexible about the price.', // v2
    ],
    combat: [
      'A discussion over the price got physical before anybody drew a weapon. {who} left bruised, with the lead intact.', // fixed: fewer {item}
      'Two people decided {who} looked easier to push around than expected. Nobody reached for a gun, but the furniture suffered.',
      'Two people decided {who} looked easy to push around. The furniture lost, {who} won, and the stall owner sent us the bill.',
      'Two people decided {who} looked easy to push around. {who}\'s report, in full: "They started it. The chair finished it."',
    ],
    stealth: [
      'A camera caught more of {who} than they meant it to. They left before anyone came to check.', // fixed: no longer assumes a heat veil (rule 14)
      '{who} slipped through the wrong door and met the person holding the keys. Getting back out cost the crew a little cash.',
    ],
    piloting: [
      'A shortcut ended behind a delivery truck with nowhere to turn. {who} lost the tail getting back onto the road.',
      'The crew\'s transport was clamped during a meeting. Paying for its release ate into the day\'s cash.', // v2
      'The van carrying {item} got boxed in at a loading lane, and so did {who}. By the time the lane cleared, the seller was gone.', // fixed: "the vehicle following {item}" was the wrong way round
    ],
  },

  find: {
    cash: [
      'The lead went nowhere, but {who} found an unclaimed parts pouch worth {cash}.', // fixed: "came back with the crew" (rule 11)
      'Someone paid {cash} for a small delivery while {who} was already going that way.',
      'A seller had nothing on {item}, but paid {cash} for help shifting some stock before closing.',
      'A shop needed someone to return a hired trolley. The errand paid {cash} and took one street.', // v2
    ],
    gear: [
      '{who} picked up a box of usable weapon parts nobody at the stall wanted to count.',
      'An unwanted hard case came with its keys still taped inside. The crew kept it.', // v2
      'A repairer let the crew keep a sealed cleaning kit after they carried a cabinet upstairs.', // v2
    ],
    rumour: [
      'The hunt turned up a rumour about another sale in {district}. Nothing useful today, but Joss wrote it down.',
      // needs 1 more
    ],
  },

  quiet: {
    any: [
      'Nobody useful showed. {who} watched the street until dark and learned nothing new.', // fixed: "came back" (rule 11)
      'Nobody useful showed. {who} watched the street until dark and now knows every pigeon on it by sight.',
      'Nobody useful showed. {who} got so bored they started rating the noodle stalls. "Two stars. Both of them."',
      'Rain kept the shutters down. The crew watched water collect in a bucket beneath the awning.', // v2
      'A long afternoon produced two meals and no useful conversation. The bowls were better than the lead.', // v2
      'The crew waited on a promised meeting that never happened. No trouble, no progress.',
      '{who} spent the day checking the same names twice. Nothing moved.',
      'The trail stayed cold. Nobody spent anything, nobody got hurt, nobody learned anything.', // fixed: "came back" (rule 11)
      'A seller asked for another day. {who} left it there rather than turn waiting into trouble.',
    ],
  },

  callbackContact: {
    lead: [
      '{contact} had another name by the time {who} came by again. This one sounded closer to {item}.',
      '{contact} remembered one more detail about the person carrying {item}. It was enough to move the hunt on.',
      '{contact} admitted the first story had left something out. {item} hadn\'t been sold yet.',
      'An old receipt jogged {contact}\'s memory. There had been a second person at the handover.', // v2
    ],
    deadEnd: [
      '{contact} wasn\'t at their usual spot. {who} spent the day finding out where they\'d gone, and got nothing for it.',
      'The crew checked back with {contact} and got the same answer, word for word. Nothing moved.', // v2
    ],
    snag: [
      'Somebody had already asked {contact} about the crew. {who} kept the conversation short after that.',
      'A message from {contact} asked the crew to stop asking so openly. Somebody else had noticed.', // v2
    ],
  },

  callbackPlace: {
    lead: [
      '{who} went back to {place} and watched it properly. The same case appeared again before dusk.',
      '{place} looked different with the shutters down. {who} found a second entrance and a better lead.',
      'The crew\'s name had reached {place} before {who} did. Somebody there was suddenly willing to talk.',
      '{who} returned to {place} and found the person they\'d missed last time. They knew where {item} had gone.',
      'Someone had cleared the noticeboard at {place}. The crew found the discarded listings in a box beside it.', // v2
    ],
    deadEnd: [
      '{who} checked {place} after dark. The lights stayed on, but nobody answered.', // v2
      // needs 1 more
    ],
    snag: [
      'Nothing moved at {place} for hours. Then somebody arrived asking the same questions as the crew.',
      // needs 1 more
    ],
  },

  turn: {
    good: [
      '{item} was real, working and close enough to take home. Now it was a question of price or nerve.',
      'The crew found {item} exactly where the trail said it would be. The owner was willing to talk.',
      '{who} got eyes on {item}. One clean deal would finish the run.',
      'The seller put {item} on the table and named a price. At least nobody was pretending any more.',
      'A trade was on offer for {item}. The other side wanted something the tong could spare.', // v2
    ],
    rough: [
      '{who} found {item}, along with several people who had no intention of giving it up cheaply.',
      '{item} was there, but the deal had changed. More money, more risk, or a different way out.',
      'The crew reached {item} just as another buyer did. Nobody had drawn anything yet.',
      '{item} turned up in the right place with the wrong owner. Getting it home was going to take more than asking.',
      'The person holding {item} wasn\'t the person who had agreed to sell it. Both expected paying.', // v2
      'Another buyer arrived during the viewing. The owner began enjoying the meeting considerably more.', // v2
    ],
  },

  call: [
    'The deal for {item} broke down when somebody locked the door behind the crew. {who} got clear enough to call it in.',
    'Another buyer reached for {item} before the price was settled. Chairs went over, hands moved, and the crew called it in.', // fixed: "towards waistbands" is a stock phrase
    'The seller\'s friends decided the crew had brought too little cash and too much confidence. The way out filled with bodies, and they\'re calling it in.',
    '{who} had {item} in sight when somebody recognised the crew from earlier in the hunt. The room went quiet, hands started moving, and they\'re calling it in.',
    'The handover stopped when somebody recognised the broker and pulled a weapon. Tables went over, and the crew called it in.', // v2
  ],

  close: {
    met: [
      'The crew came home with {item}. Joss checked the numbers; nobody paid more than they agreed to.',
      '{item} made it back wrapped in an old cloth and smelling faintly of machine oil. Job done.',
      '{item} made it back wrapped in somebody\'s good tablecloth. Nobody\'s admitting whose.',
      '{item} made it back smelling of machine oil. {who} has carried it round the safehouse all evening like a new baby.',
      'The crew put {item} down beside the ledger. Someone went to put the kettle on.', // v2
      'The case came through the safehouse door with {item} inside. Joss asked for the actual cost, not the opening offer.', // v2
      'The seller took the deal. The crew brought {item} home and put it on the table.',
      '{who} got {item} out cleanly. It was waiting at the safehouse by the time everyone came in.',
    ],
    partial: [
      'The crew couldn\'t get {item}, but came home with parts, ammunition and enough useful pieces to make the run count for something.',
      '{item} stayed with the seller. The crew recovered some of what had travelled with it and brought that home instead.',
      'The deal collapsed before {item} changed hands. {who} salvaged what they could and nobody came home empty-handed.',
      'They got close to {item}, not close enough. The crew brought back the useful pieces picked up along the way.',
      '{who} brought back the service kit, not {item}. It was something, though not what they had gone for.', // v2
    ],
    failed: [
      '{item} got away from them. The crew came home with what they\'d found on the road and nothing more.',
      'The trail ended without {item}. Everyone made it back, which was more than the last lead deserved.',
      'No weapon, no deal. The crew brought home the odds and ends they\'d picked up and closed the run.',
      '{item} stayed somewhere in {district}. The crew came back tired, carrying only what the hunt turned up.', // fixed: "scraped" (rule 12: injuries are reported by the game)
      'The hunt was over, with nothing to show for the main errand. Joss left the weapon entry blank.', // v2
    ],
  },

  // Personality (prompt, 2026-11-22). Claude's variations the owner liked; needs more in each.
  asides: {
    superstitious: ['{who} blames the black cat that sat on the van at noon, and won\'t hear otherwise.'],
    hot: ['{who} told somebody exactly what they thought of them, in two languages.'],
    warm: ['{who} also came away with a bag of egg tarts and an invitation to somebody\'s birthday.'],
    calm: ['{who} finished their tea first, as always.'],
    money: [], wary: [], curious: [],
  },
  pair: [
    '{who} and {other} argued about the route for an hour. {who} was right, and hasn\'t stopped saying so.', // owner's pick
    '{other} kept watch while {who} worked the seller, then ate both their lunches. The lead was good; the lunch dispute continues.',
  ],
  joss: {
    day: ['Joss: "Logged as surveillance. It was mostly noodles."'],
    met: ['Joss: "Logged, oiled, and not to be fired indoors. I mean it."'],
    failed: [],
  },
};
