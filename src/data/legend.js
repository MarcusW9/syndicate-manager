// The Legend defining job (renown slice 5, 2026-11; drafts/PROPOSAL-runner-renown.md 2.7 with review
// decision 6; DESIGN.md 2026-11-08). Numbers and words; core/legend.js applies them.
//
// Wording: the owner's per-path messages (2026-11-08) for the call, the earned and the posthumous
// message; the generic `body` of each stays as the fallback for an unknown path. The subjects, the
// report lines and the plan note are the first-pass generic ones.

export const LEGEND = {
  threats: [3, 4], // the template's own threat (review decision 6)
  threatDelta: 1, // one step harder, clamped by jobView to the template's range
  payMult: 1.5,
  days: 7, // on the board this long
  retryDays: 28, // after a failure, an abort or an expiry, the city asks again
  highlightWeight: 100, // proposal 2.10: legend 100, elite 80
};

export const LEGEND_TEXT = {
  // The owner's wording (2026-11-08), one per path (core/fame.js pathOf: ghost, enforcer, earner, iron,
  // lifer). {op} their handle, {name} their full name, {job} the defining job's name, {heist} the heist's
  // name for a finale, or the job's own name for any other defining job. "the {job}" and "the {heist}"
  // drop their "the" when the name already starts with an article ("The Favourite", "An Old Account").
  call: {
    subject: '{op}: the city is asking',
    subjectFinale: '{op}: the finale is theirs',
    body: "Across Lantern Bay people have started asking the same thing about {op}: can they really do it? The {heist} wants {op} by name, hard enough to settle it. It pays half as much again, and it's on the board for a week. Do it with {op} on the crew and {name} is a Legend. If it goes wrong, the city will ask again in four weeks.",
    byPath: {
      ghost: "Lantern Bay's grid is humming your name tonight, {op}. The {heist} is wide open, and nobody else can slip through the wire without tripping the alarms. Get clean, get quiet, and let them wonder who let the ghosts in.",
      enforcer: "Word from the pavement is the heavy hitters want a reckoning, {op}. The {heist} needs someone who doesn't blink when the lead starts flying. Lock down your gear, show 'em why your name makes the corridors sweat, and leave the street talking.",
      earner: "The ledger's balancing out, {op}, and the big players are looking your way for the {heist}. Every ledger needs a master hand to tilt the numbers where they count. Make it profitable, make it clean, and let the house pay up.",
      iron: "They need a wall that doesn't crack when the pressure hits, {op}. The {heist} is coming down heavy, and they're calling your name to take the impact. Brace your chrome, hold the line, and show them what unyielding iron looks like in this city.",
      lifer: "The old neighbourhood remembers who stayed through the storm, {op}. When the {heist} came up, there was only one name on the wall everyone trusted. Suit up one more time for the alleys that raised you.",
    },
  },
  earned: {
    subject: '{op} is a Legend',
    body: "After the {job}, nobody in Lantern Bay needs telling who {name} is. A Legend now, and it stays with them.",
    report: '{op} is a Legend now.',
    byPath: {
      ghost: "You walked through the digital haze without leaving a footprint, {op}. The data streams whisper your ghost story across every terminal from Old Town to the Basin. You're not just a runner any more. You're a Legend in the dark.",
      enforcer: "The smoke cleared, the bodies dropped, and you're still standing over the wreckage, {op}. The enforcers in the Docks and Night Market speak your handle with genuine caution now. You carved your legend out of raw bone and lead.",
      earner: "The balance sheet has a brand new entry, {op}, and it's backed by absolute power. Every fixer and merchant from Glass Heights to the Docks knows your accounts are sacred. You didn't just survive the game; you bought the board.",
      iron: "The pressure tested every single circuit and composite plate you wear, {op}, and not a single rivet popped. They couldn't break you, and now the whole city knows your name is anchored in stone. True iron doesn't bend.",
      lifer: "You started in the damp gutters and stayed loyal when the grid went dark, {op}. Every street corner and dai pai dong in Lantern Bay drinks to your name tonight. You're a true lifer of the Bay, and the streets won't ever forget.",
    },
  },
  posthumous: {
    subject: '{name} is a Legend',
    body: "{name} died on the {job}, and the city has decided anyway. A Legend, for good. It will say so on the wall.",
    report: '{op} is a Legend, for good.',
    byPath: {
      ghost: "The signal flatlined and {op} ({name}) faded into the deep static during the {job}. They slipped past the corporate security forever, leaving only ghosts behind in the wires. May your ghost run eternally free in the dark nodes.",
      enforcer: "The iron finally gave out on {op} ({name}) during the {job}, but not before leaving a mountain of wreckage in their wake. The street enforcers pour one out on the pavement for a true heavy. Rest easy; the violence won't touch you any more.",
      earner: "The ledger closed its final balance for {op} ({name}) midway through the {job}. Every yen you stacked is locked in safety, secured by a name the city won't ever cross out. The house finally pays out your permanent dividend.",
      iron: "The pressure finally crushed the shell of {op} ({name}) during the {job}. They held the line until the very last rivet sheared off in the grit. Rest in the bedrock of Lantern Bay.",
      lifer: "{op} ({name}) went down on the job during the {job}, right where they spent every waking hour keeping the crew safe. The neighbourhood remembers every favour you ever traded. Welcome home to the soil of the Bay, lifer.",
    },
  },
  failed: { report: "The {job} didn't make {op} a Legend. The city will ask again in four weeks." },
  skipped: { report: "{op} wasn't on the {job}, so the city's question about them stands. It will ask again in four weeks." },
  history: { earned: 'became a Legend on the {job}', posthumous: 'became a Legend, for good, on the {job}' },
  chip: 'Their moment: {op}',
  plan: "A defining job: {op}'s moment. It pays half as much again and runs one step harder. Do it with them on the crew (inside, outside or on standby) and they become a Legend. Without them it is an ordinary job.",
};
