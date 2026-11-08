// The Legend defining job (renown slice 5, 2026-11; drafts/PROPOSAL-runner-renown.md 2.7 with review
// decision 6; DESIGN.md 2026-11-08). Numbers and words; core/legend.js applies them.
//
// PLACEHOLDER WORDING: one generic set, in house style, so the mechanics can be played. The owner's
// content list (proposal section 8) asks for five Legend-call briefs, five Legend-earned messages and
// a posthumous one, per path; replace LEGEND_TEXT with those when they come back.

export const LEGEND = {
  threats: [3, 4], // the template's own threat (review decision 6)
  threatDelta: 1, // one step harder, clamped by jobView to the template's range
  payMult: 1.5,
  days: 7, // on the board this long
  retryDays: 28, // after a failure, an abort or an expiry, the city asks again
  highlightWeight: 100, // proposal 2.10: legend 100, elite 80
};

export const LEGEND_TEXT = {
  call: {
    subject: '{op}: the city is asking',
    body: "Across Lantern Bay people have started asking the same thing about {op}: can they really do it? A job has come in that wants {op} by name, hard enough to settle it. It pays half as much again, and it's on the board for a week. Do it with {op} on the crew and {name} is a Legend. If it goes wrong, the city will ask again in four weeks.",
  },
  callFinale: {
    subject: '{op}: the finale is theirs',
    body: "People are saying {op} is the one for {heist}. The finale is the job that settles it: do it with {op} on the crew and {name} is a Legend. If it goes wrong, the city will ask again in four weeks.",
  },
  earned: {
    subject: '{op} is a Legend',
    body: "After the {job}, nobody in Lantern Bay needs telling who {name} is. A Legend now, and it stays with them.",
    report: '{op} is a Legend now.',
  },
  posthumous: {
    subject: '{name} is a Legend',
    body: "{name} died on the {job}, and the city has decided anyway. A Legend, for good. It will say so on the wall.",
    report: '{op} is a Legend, for good.',
  },
  failed: { report: "The {job} didn't make {op} a Legend. The city will ask again in four weeks." },
  skipped: { report: "{op} wasn't on the {job}, so the city's question about them stands. It will ask again in four weeks." },
  history: { earned: 'became a Legend on the {job}', posthumous: 'became a Legend, for good, on the {job}' },
  chip: 'Their moment: {op}',
  plan: "A defining job: {op}'s moment. It pays half as much again and runs one step harder. Do it with them on the crew (inside, outside or on standby) and they become a Legend. Without them it is an ordinary job.",
};
