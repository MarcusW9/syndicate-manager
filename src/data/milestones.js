// Runner milestones (renown slice 2, 2026-11; plan in drafts/PROPOSAL-runner-renown.md section 2.9).
// Declarative: core/milestones.js reads these and decides who earns what. The wording is a first
// pass for the owner to rewrite; {op} is the runner's handle, {other} a crewmate's (bonds), {n} the
// number reached.
//
// rank is the priority when several are ready at once (lower first): 2 firsts, 3 counts, 4 streaks,
// 5 bonds, 6 tenure (rank 1, path progress, comes with fame in slice 3). field is the record
// counter checked against at; weight ranks highlights (the best three are kept on the profile).

export const MILESTONES = [
  // Firsts
  { id: 'firstAtLevel', rank: 2, field: 'atLevel', at: 1, weight: 15, text: '{op} worked a job that matched their level. The first of many.' },
  { id: 'firstClean', rank: 2, field: 'clean', at: 1, weight: 15, text: '{op} got through a job without anyone noticing. A first.' },
  { id: 'firstFlawless', rank: 2, field: 'flawless', at: 1, weight: 15, text: '{op} finished a job with nobody close to dying. A first.' },
  { id: 'firstCarry', rank: 2, field: 'carries', at: 1, weight: 15, text: '{op} made the hard call and it held. The crew noticed.' },
  { id: 'firstBroughtHome', rank: 2, field: 'broughtHome', at: 1, weight: 60, text: '{op} kept a crewmate alive on the way out. Nobody forgets that.' },
  { id: 'firstBack', rank: 2, field: 'criticalsSurvived', at: 1, weight: 50, text: '{op} was nearly lost on a job, and came home. They are not the same, but they are here.' },
  // Counts
  { id: 'jobs10', rank: 3, field: 'jobs', at: 10, weight: 20, text: '{op}: ten jobs with the crew.' },
  { id: 'jobs25', rank: 3, field: 'jobs', at: 25, weight: 25, text: '{op}: twenty-five jobs. The crew stops counting them.' },
  { id: 'jobs50', rank: 3, field: 'jobs', at: 50, weight: 30, text: '{op}: fifty jobs. They know every way this work goes wrong.' },
  { id: 'jobs100', rank: 3, field: 'jobs', at: 100, weight: 35, text: '{op}: a hundred jobs. Hardly anyone lasts that long.' },
  { id: 'clean10', rank: 3, field: 'clean', at: 10, weight: 30, text: '{op}: ten clean jobs. Nobody saw a thing.' },
  { id: 'clean25', rank: 3, field: 'clean', at: 25, weight: 35, text: '{op}: twenty-five clean jobs. A ghost, as far as the city can tell.' },
  { id: 'carries10', rank: 3, field: 'carries', at: 10, weight: 30, text: '{op} has made ten hard calls that held. The crew leans on them.' },
  { id: 'carries25', rank: 3, field: 'carries', at: 25, weight: 35, text: '{op} has carried twenty-five hard moments. Joss builds jobs around them.' },
  { id: 'unscathed25', rank: 3, field: 'unscathed', at: 25, weight: 30, text: '{op} has walked away from twenty-five jobs without a scratch.' },
  { id: 'bigScores5', rank: 3, field: 'bigScores', at: 5, weight: 30, text: '{op} has been on five of the big ones.' },
  { id: 'bigScores10', rank: 3, field: 'bigScores', at: 10, weight: 35, text: '{op} has been on ten of the big ones. The city has started to ask who they are.' },
  { id: 'fights10', rank: 3, field: 'fightsWon', at: 10, weight: 25, text: '{op} has stood in ten fights the crew won.' },
  { id: 'fights25', rank: 3, field: 'fightsWon', at: 25, weight: 30, text: '{op} has stood in twenty-five fights the crew won. People cross the road for that.' },
  // Streaks
  { id: 'streak5', rank: 4, field: 'bestCleanStreak', at: 5, weight: 30, text: '{op}: five clean jobs in a row.' },
  { id: 'streak10', rank: 4, field: 'bestCleanStreak', at: 10, weight: 45, text: '{op}: ten clean jobs in a row. Nobody saw a thing.' },
  { id: 'streak15', rank: 4, field: 'bestCleanStreak', at: 15, weight: 45, text: '{op}: fifteen clean jobs in a row. Luck stopped being the word for it.' },
  // Bonds (per partner; the id is bond10:<partner id>)
  { id: 'bond10', rank: 5, field: 'with', at: 10, weight: 30, text: '{op} and {other}: ten jobs side by side. They have stopped needing to talk.' },
  { id: 'bond25', rank: 5, field: 'with', at: 25, weight: 40, text: '{op} and {other}: twenty-five jobs alongside. The crew treats them as a pair.' },
  // Tenure
  { id: 'weeks12', rank: 6, field: 'activeWeeks', at: 12, weight: 20, text: '{op} has been working steadily for twelve weeks.' },
  { id: 'weeks26', rank: 6, field: 'activeWeeks', at: 26, weight: 25, text: '{op} has been working steadily for half a year.' },
  { id: 'weeks52', rank: 6, field: 'activeWeeks', at: 52, weight: 30, text: '{op} has been working steadily for a year. Rare in this city.' },
];

export const MILESTONES_PER_JOB = 2;
export const HIGHLIGHTS_KEPT = 3;
