// Log lines: weapon. The owner's draft (2026-11-22, from docs/log-lines-prompt.md), put into the
// prompt's second format by Claude. Changes from the owner's text are marked "// fixed:"; gaps
// to fill are marked "// needs". Moves to src/data/advlog/ when the log engine is built.
export default {
  goal: 'weapon',

  open: {
    any: [
      '{contact}, {contactWhat}, had heard about {itemFull} changing hands somewhere in {district}. {who} went to ask what they knew.', // fixed: contact intro
      'A name attached to {itemFull} led {who} to {place}. Somebody there had seen it recently.',
      '{who} picked up word that {itemFull} was for sale around {place}. The seller wasn\'t advertising.',
      'Someone had been asking after ammunition for {itemFull}. {who} traced the question back to {contact}, {contactWhat}.',
      '{contact}, {contactWhat}, knew somebody trying to move {itemFull} without drawing attention. {who} went looking for the introduction.',
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
    ],
    combat: [
      '{who} found somebody who had seen {item} used in a back-room match. The owner had been taking offers afterwards.',
      'A bruised door guard recognised the description. {who} got a place and a name without adding to the bruises.', // fixed: smoother end
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
      '{who} traded a small favour for a better introduction. The next person had actually seen {item}.',
    ],
    piloting: [
      '{who} followed a delivery van through {district} until it stopped somewhere that matched the rumour.',
      'A courier remembered moving a case like the one {item} travels in. {who} retraced the route and found where it had been dropped.', // fixed: "the one for {item}" read oddly with "the Kestrel-9"
    ],
    cool: [
      'The seller tried to make {who} wait all afternoon. {who} waited longer and got the meeting.',
      'Somebody tested {who} with three different prices and two bad addresses. Staying calm got the real one.',
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
    ],
    social: [
      '{who} spent half the day listening to somebody who claimed to know the seller. They knew stories, not the seller.',
      'The introduction was real, but the information was old. {item} had passed through weeks ago.',
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
    ],
    combat: [
      'A discussion over the price got physical before anybody drew a weapon. {who} left bruised, with the lead intact.', // fixed: fewer {item}
      'Two people decided {who} looked easier to push around than expected. Nobody reached for a gun, but the furniture suffered.',
    ],
    stealth: [
      'A camera caught more of {who} than they meant it to. They left before anyone came to check.', // fixed: no longer assumes a heat veil (rule 14)
      '{who} slipped through the wrong door and met the person holding the keys. Getting back out cost the crew a little cash.',
    ],
    piloting: [
      'A shortcut ended behind a delivery truck with nowhere to turn. {who} lost the tail getting back onto the road.',
      'The van carrying {item} got boxed in at a loading lane, and so did {who}. By the time the lane cleared, the seller was gone.', // fixed: "the vehicle following {item}" was the wrong way round
    ],
  },

  find: {
    cash: [
      'The lead went nowhere, but {who} found an unclaimed parts pouch worth {cash}.', // fixed: "came back with the crew" (rule 11)
      'Someone paid {cash} for a small delivery while {who} was already going that way.',
      'A seller had nothing on {item}, but paid {cash} for help shifting some stock before closing.',
    ],
    gear: [
      '{who} picked up a box of usable weapon parts nobody at the stall wanted to count.',
      // needs 2 more
    ],
    rumour: [
      'The hunt turned up a rumour about another sale in {district}. Nothing useful today, but Joss wrote it down.',
      // needs 1 more
    ],
  },

  quiet: {
    any: [
      'Nobody useful showed. {who} watched the street until dark and learned nothing new.', // fixed: "came back" (rule 11)
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
    ],
    deadEnd: [
      '{contact} wasn\'t at their usual spot. {who} spent the day finding out where they\'d gone, and got nothing for it.',
      // needs 1 more
    ],
    snag: [
      'Somebody had already asked {contact} about the crew. {who} kept the conversation short after that.',
      // needs 1 more
    ],
  },

  callbackPlace: {
    lead: [
      '{who} went back to {place} and watched it properly. The same case appeared again before dusk.',
      '{place} looked different with the shutters down. {who} found a second entrance and a better lead.',
      'The crew\'s name had reached {place} before {who} did. Somebody there was suddenly willing to talk.',
      '{who} returned to {place} and found the person they\'d missed last time. They knew where {item} had gone.',
    ],
    deadEnd: [
      // needs 2
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
    ],
    rough: [
      '{who} found {item}, along with several people who had no intention of giving it up cheaply.',
      '{item} was there, but the deal had changed. More money, more risk, or a different way out.',
      'The crew reached {item} just as another buyer did. Nobody had drawn anything yet.',
      '{item} turned up in the right place with the wrong owner. Getting it home was going to take more than asking.',
    ],
  },

  call: [
    'The deal for {item} broke down when somebody locked the door behind the crew. {who} got clear enough to call it in.',
    'Another buyer reached for {item} before the price was settled. Chairs went over, hands moved, and the crew called it in.', // fixed: "towards waistbands" is a stock phrase
    'The seller\'s friends decided the crew had brought too little cash and too much confidence. The way out filled with bodies, and they\'re calling it in.',
    '{who} had {item} in sight when somebody recognised the crew from earlier in the hunt. The room went quiet, hands started moving, and they\'re calling it in.',
  ],

  close: {
    met: [
      'The crew came home with {item}. Joss checked the numbers; nobody paid more than they agreed to.',
      '{item} made it back wrapped in an old cloth and smelling faintly of machine oil. Job done.',
      'The seller took the deal. The crew brought {item} home and put it on the table.',
      '{who} got {item} out cleanly. It was waiting at the safehouse by the time everyone came in.',
    ],
    partial: [
      'The crew couldn\'t get {item}, but came home with parts, ammunition and enough useful pieces to make the run count for something.',
      '{item} stayed with the seller. The crew recovered some of what had travelled with it and brought that home instead.',
      'The deal collapsed before {item} changed hands. {who} salvaged what they could and nobody came home empty-handed.',
      'They got close to {item}, not close enough. The crew brought back the useful pieces picked up along the way.',
    ],
    failed: [
      '{item} got away from them. The crew came home with what they\'d found on the road and nothing more.',
      'The trail ended without {item}. Everyone made it back, which was more than the last lead deserved.',
      'No weapon, no deal. The crew brought home the odds and ends they\'d picked up and closed the run.',
      '{item} stayed somewhere in {district}. The crew came back tired, carrying only what the hunt turned up.', // fixed: "scraped" (rule 12: injuries are reported by the game)
    ],
  },

  // needs: personality pools (prompt, 2026-11-22), and a quote from {who} in about one line in four.
  asides: { superstitious: [], money: [], warm: [], hot: [], wary: [], curious: [] },
  pair: [],
  joss: { day: [], met: [], failed: [] },
};
