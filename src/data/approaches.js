// The four approaches: what gets the crew past the building (DESIGN.md, 2026-10-27). Data only;
// core/crew.js applies the stat bonus, core/mission.js the crisis weighting and the costs.
//
// mods: +1 to the approach's stat on every roll. favours / avoids: crisis and incident
// situations (data/situations.js) this approach meets more or less often. detect: on these
// runs each inside person past the job's recommended crew size is −1 on stealth and social.
// Costs, one each: days (time away), heat (on completion), bribePerThreat (cash up front),
// neural (load per tech roll, on whoever rolls).

export const APPROACHES = {
  stealth: {
    name: 'Stealth', desc: 'Slip past people. +1 stealth. Takes a day longer.',
    mods: { stealth: 1 }, heat: 0, days: 1, detect: true,
    favours: ['entry', 'street-tech', 'corp-tech'], avoids: ['fight', 'crowd'],
  },
  tech: {
    name: 'Tech', desc: 'Machines do the work. +1 tech. Every tech roll costs the hacker neural load.',
    mods: { tech: 1 }, heat: 0, neural: 5,
    favours: ['street-tech', 'corp-tech', 'neural'], avoids: ['fight'],
  },
  loud: {
    name: 'Loud', desc: 'Through the guards. +1 combat. Quicker, but heat +1.',
    mods: { combat: 1 }, heat: 1, days: -1,
    favours: ['fight', 'escape'], avoids: ['entry', 'crowd'],
  },
  con: {
    name: 'Con', desc: 'Talk your way in. +1 social. Props and bribes up front.',
    mods: { social: 1 }, heat: 0, bribePerThreat: 100, detect: true,
    favours: ['crowd', 'threat', 'law'], avoids: ['fight', 'entry'],
  },
};
