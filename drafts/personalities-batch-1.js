// Batch 1 for PLAN-PERSONALITY step 3. Checked 2026-10-24: tags all allowed, tier mix 15/6/3/1 in both lists.
// Edits on intake: "Easygoing with strangers..." charming+wary -> charming+cold (charming/wary is a clash pair);
// "FIERCELY" -> "Fiercely"; "harbor" -> "harbour".

export const TEMPERAMENTS = [
  // COMMON (15)
  { text: 'Quick to laugh, quicker to walk away.', tags: ['warm', 'wary'], tier: 'common' },
  { text: 'Quietly watchful in crowded markets.', tags: ['calm', 'wary'], tier: 'common' },
  { text: 'Soft-spoken, polite, and completely unyielding.', tags: ['calm', 'cold'], tier: 'common' },
  { text: 'Loud and cheerful until money comes up.', tags: ['warm', 'money'], tier: 'common' },
  { text: 'Sharp-tongued, but checks on everyone.', tags: ['hot', 'warm'], tier: 'common' },
  { text: 'Easily distracted by bright neon advertising.', tags: ['curious'], tier: 'common' },
  { text: 'Restless, always scanning the high-rises.', tags: ['wary'], tier: 'common' },
  { text: 'Easygoing with strangers, defensive with friends.', tags: ['charming', 'cold'], tier: 'common' },
  { text: 'Brisk, efficient, and chronically impatient.', tags: ['cold', 'hot'], tier: 'common' },
  { text: 'Mellow, slow to anger, hard to shake.', tags: ['calm'], tier: 'common' },
  { text: 'Sarcastic, but keeps their promises.', tags: ['charming'], tier: 'common' },
  { text: 'Constantly bargaining for a better price.', tags: ['money', 'wary'], tier: 'common' },
  { text: 'Polite to a fault, even under fire.', tags: ['calm', 'charming'], tier: 'common' },
  { text: 'Irritably protective of their personal space.', tags: ['hot', 'wary'], tier: 'common' },
  { text: 'Nervously energetic, always tapping a rhythm.', tags: ['curious'], tier: 'common' },

  // UNCOMMON (6)
  { text: 'Smooth talker with a cold glare.', tags: ['charming', 'cold'], tier: 'uncommon' },
  { text: 'Intensely curious about high-corp gossip.', tags: ['curious', 'chrome'], tier: 'uncommon' },
  { text: 'Quietly obsessed with old ancestral debts.', tags: ['haunted', 'money'], tier: 'uncommon' },
  { text: 'Fiercely loyal to small-time stall owners.', tags: ['warm', 'hot'], tier: 'uncommon' },
  { text: 'Unsettlingly relaxed during firefights.', tags: ['calm', 'chrome'], tier: 'uncommon' },
  { text: 'Suspicious of anyone without cyberware.', tags: ['wary', 'chrome'], tier: 'uncommon' },

  // RARE (3)
  { text: 'Distantly polite, as if speaking through static.', tags: ['cold', 'haunted'], tier: 'rare' },
  { text: 'Eerily charismatic, with a mercenary heart.', tags: ['charming', 'money'], tier: 'rare' },
  { text: 'Prone to sudden, icy stillness when challenged.', tags: ['cold', 'hot'], tier: 'rare' },

  // EXOTIC (1)
  { text: 'Hauntingly serene, carrying a deceased partner’s grudge.', tags: ['haunted', 'cold'], tier: 'exotic' },
];

export const HABITS = [
  // COMMON (15)
  { text: 'Burns incense outside their flat before every night job.', tags: ['superstitious'], tier: 'common' },
  { text: 'Leaves an extra fishball on the altar for good fortune.', tags: ['superstitious'], tier: 'common' },
  { text: 'Counts jade beads on a wrist bracelet during negotiations.', tags: ['superstitious', 'money'], tier: 'common' },
  { text: 'Refuses to walk under wet scaffolding late at night.', tags: ['superstitious', 'wary'], tier: 'common' },
  { text: 'Flips a lucky coin before entering corporate towers.', tags: ['superstitious'], tier: 'common' },
  { text: 'Always taps the table twice when accepting tea or dim sum.', tags: ['warm'], tier: 'common' },
  { text: 'Keeps a battered physical notebook for off-grid tallies.', tags: ['wary', 'money'], tier: 'common' },
  { text: 'Spits onto the wet street whenever a patrol drone passes.', tags: ['hot'], tier: 'common' },
  { text: 'Swaps local street gossip with stall vendors for free chili oil.', tags: ['charming', 'warm'], tier: 'common' },
  { text: 'Cleans cheap optical lenses with a greasy silk handkerchief.', tags: ['chrome'], tier: 'common' },
  { text: 'Wipes down cybernetic fingers before eating night market noodles.', tags: ['chrome'], tier: 'common' },
  { text: 'Mutes neural ad-blockers just to hear corporate radio jingles.', tags: ['chrome', 'curious'], tier: 'common' },
  { text: 'Reboots cheap optic implants whenever sensory lag gets noticeable.', tags: ['chrome'], tier: 'common' },
  { text: 'Checks the harbour water level to predict market drops.', tags: ['money', 'curious'], tier: 'common' },
  { text: 'Barters old tech scrap for fresh herbal tea packets.', tags: ['money', 'chrome'], tier: 'common' },

  // UNCOMMON (6)
  { text: 'Scans every passerby’s port interface for hidden data beacons.', tags: ['chrome', 'wary'], tier: 'uncommon' },
  { text: 'Overclocks thermal wrist vents to warm up cold milk tea.', tags: ['chrome'], tier: 'uncommon' },
  { text: 'Carries a bricked corporate security badge as a paperweight.', tags: ['chrome'], tier: 'uncommon' },
  { text: 'Pays stallholders in mixed currency, including obsolete physical tokens.', tags: ['money'], tier: 'uncommon' },
  { text: 'Feeds micro-drone scraps to stray rooftop cats.', tags: ['warm', 'chrome'], tier: 'uncommon' },
  { text: 'Leaves paper hell money hidden inside corporate elevator shafts.', tags: ['superstitious', 'haunted'], tier: 'uncommon' },

  // RARE (3)
  { text: 'Tells fortunes using glitch patterns on discarded AR billboards.', tags: ['superstitious', 'chrome'], tier: 'rare' },
  { text: 'Listens to corrupted audio logs of wiped corporate workers.', tags: ['haunted', 'chrome'], tier: 'rare' },
  { text: 'Pawned a secondary lung module just to settle a family gambling debt.', tags: ['money', 'chrome'], tier: 'rare' },

  // EXOTIC (1)
  { text: 'Streams dead operative telemetry to ghost channels for extra coin.', tags: ['haunted', 'money'], tier: 'exotic' },
];
