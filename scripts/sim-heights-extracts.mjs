// The Heights extracts (2026-11-20): why three of them leave runners behind, and what would fix it. MEASURES ONLY.
//
//   SAVE_ROSTERS=/tmp/rosters.json node scripts/sim-misses.mjs 8 1 scratch   (grows the rosters; then)
//   node scripts/sim-heights-extracts.mjs /tmp/rosters.json
//
// Each job plays its own fight 40 times a roster (8 campaigns, the roster at the job's gate) on each risk, as today's extract, with corp backup
// capped at 1 or 0 (FIGHT_RECIPES maxExtraEnemies), and as a hack or a yard. Done: the job's objective kept (a left-behind runner still counts).
const R = new URL('../src/', import.meta.url).href;
const { existsSync, readFileSync } = await import('node:fs');
const Fight = await import(R + 'core/fight.js');
const { FIGHT_JOBS, FIGHT_RECIPES } = await import(R + 'data/fights.js');
const { templateById, JOB_GATES } = await import(R + 'core/jobs.js');
const { rollTarget } = await import(R + 'core/risk.js');
const { fightAnswer } = await import(R + 'core/runfight.js');
const { DILEMMAS } = await import(R + 'data/dilemmas.js');
const { makeRng, hash } = await import(R + 'core/rng.js');
globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const rosters = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const JOBS = ['the_current_copy', 'exit_interview', 'penthouse'];
const FIGHTS = 40;
function teamOf(crew, tpl, type) {
  const by = [...crew].sort((a, b) => b.stats.combat - a.stats.combat || a.id.localeCompare(b.id)); const team = [];
  const want = (p) => { const o = by.find((x) => p(x) && !team.includes(x)); if (o && team.length < tpl.crewSize) team.push(o); };
  if (type === 'holdHack') want((o) => o.role === 'tech'); if (tpl.crewSize >= 3) want((o) => o.role === 'medic');
  for (const o of by) if (team.length < tpl.crewSize && !team.includes(o)) team.push(o); return team;
}
const VARIANTS = [
  ['extract (today)', 'holdExtract', null],
  ['extract, at most 1 backup', 'holdExtract', { maxExtraEnemies: 1 }],
  ['extract, no backup', 'holdExtract', { maxExtraEnemies: 0 }],
  ['hack', 'holdHack', null],
  ['yard', 'holdYard', null],
];
for (const id of JOBS) {
  const tpl = templateById(id); const gate = JOB_GATES[tpl.threat];
  console.log(`\n${id} (threat ${tpl.threat}, crew ${tpl.crewSize})`);
  for (const [name, type, recipe] of VARIANTS) {
    FIGHT_JOBS[id] = type; if (recipe) FIGHT_RECIPES[id] = recipe; else delete FIGHT_RECIPES[id];
    const line = [];
    for (const risk of ['cautious', 'steady', 'committed']) {
      const t = { n: 0, done: 0, left: 0, down: 0, dead: 0 };
      for (const { seed, snaps } of rosters) {
        const snap = snaps[gate]; if (!snap) continue;
        const team = teamOf(snap.crew, tpl, type);
        for (let i = 0; i < FIGHTS; i++) {
          const b = Fight.buildFight({ type, diff: Fight.fightDiff(rollTarget(tpl)), threat: tpl.threat, site: tpl.district, opposition: tpl.opposition ?? null, job: id, crew: team, approach: 'loud', risk, watched: true }, makeRng(hash('hb', id, seed, i, risk)));
          const rng = makeRng(hash('hp', id, seed, i, risk));
          const ever = new Set();
          while (!b.end && b.round < 30) {
            if (!b.drawn) Fight.startRound(b, rng);
            for (const key of Object.keys(b.dilemmasFired)) if (!Fight.dilemmaHolds(b, key.split(':')[0])) delete b.dilemmasFired[key];
            const due = Fight.dueDilemmas(b)[0];
            if (due) { b.dilemmasFired[due.key] = true; const o = DILEMMAS[due.id].options.find((x) => x.id === fightAnswer({ battle: b, pending: { id: due.id } }).id); if (o?.ordersPatch) Fight.applyPatch(b, o.ordersPatch); if (o?.vanWait) b.vanHold = !!o.vanWait.hold; }
            Fight.playRound(b, rng);
            for (const r of b.runners) if (r.down || r.dead) ever.add(r.id);
          }
          if (!b.end) Fight.playFight(b, rng);
          const res = b.end?.result;
          t.n++; t.done += ['won', 'lostRunner', 'leftBehind', 'held'].includes(res) || Fight.objectiveDone(b); t.left += res === 'leftBehind'; t.down += ever.size; t.dead += b.runners.some((r) => r.dead);
        }
      }
      const P = (x) => `${Math.round(100 * x / t.n)}%`.padStart(4);
      line.push(`${risk}: done ${P(t.done)} left ${P(t.left)} downs ${(t.down / t.n).toFixed(2)}${t.dead ? ` dead ${P(t.dead)}` : ''}`);
    }
    console.log(`  ${name.padEnd(26)} ${line.join(' | ')}`);
  }
}
