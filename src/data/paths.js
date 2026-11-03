// Runner paths (renown slice 3, 2026-11; plan in drafts/PROPOSAL-runner-renown.md section 2.3).
// Declarative: core/fame.js reads these. A runner's path is whichever one their record is
// furthest along towards Legend (ties go to the earlier path in this list).
//
// Each condition names a record field (core/record.js freshRecord): a plain field, a nested one
// ('carriesByStat.combat'), or a list of fields that are added together. elite and legend are
// the numbers to reach; a path's Elite (or Legend) is met when every condition is.
//
// Enforcer's numbers were set in slice 3 from a 78-week simulation (see the 2026-11-03 slice-3
// row in docs/design/2026-11.md): enemies defeated aren't tracked per runner, so it uses fights
// the crew won with them standing in it, and hard crisis rolls they made on combat.
// The wording is a first pass for the owner to rewrite.

export const PATHS = [
  {
    id: 'ghost', name: 'Ghost', line: 'In and out, and nobody remembers the face.',
    conditions: [
      { field: 'clean', label: 'clean jobs', elite: 15, legend: 30 },
      { field: 'bestCleanStreak', label: 'best clean streak', elite: 5, legend: 10 },
    ],
  },
  {
    id: 'enforcer', name: 'Enforcer', line: 'When it turns into a fight, the crew wants them in it.',
    conditions: [
      { field: 'fightsWon', label: 'fights won', elite: 20, legend: 40 },
      { field: 'carriesByStat.combat', label: 'hard calls on combat', elite: 8, legend: 16 },
    ],
  },
  {
    id: 'earner', name: 'Earner', line: 'On the big jobs, and on the ones that pay.',
    conditions: [
      { field: 'bigScores', label: 'big scores', elite: 6, legend: 12 },
      { field: 'wins', label: 'jobs completed', elite: 30, legend: 60 },
    ],
  },
  {
    id: 'iron', name: 'Iron', line: 'Walks out of jobs that put others in the clinic.',
    conditions: [
      { field: 'unscathed', label: 'jobs without a scratch', elite: 20, legend: 40 },
      { field: ['broughtHome', 'criticalsSurvived'], label: 'lives saved or near-deaths survived', elite: 3, legend: 5 },
    ],
  },
  {
    id: 'lifer', name: 'Lifer', line: 'Always there. Week in, week out.',
    conditions: [
      { field: 'activeWeeks', label: 'active weeks', elite: 26, legend: 52 },
      { field: 'jobs', label: 'jobs', elite: 40, legend: 80 },
    ],
  },
];
