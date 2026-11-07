// Stat usage (drafts/PLAN-stat-usage.md): does each stat decide outcomes often enough to be a stat?
// Plays 52-week seasons under five policies, counting every roll by stat (scripts/lib/stat-usage.mjs:
// it reads the events the game already writes and never touches a roll), then reruns the careful
// policy seven times with +3 in one stat for everyone, on the same seeds. Prints a table per policy,
// the counterfactuals, a breakdown by approach and threat, and the verdict against the plan's agreed
// thresholds; writes the lot to docs/sims/stat-usage-<date>.csv.
//
//   node scripts/sim-stats.mjs [seeds=60] [weeks=52] [policies=careful,loud,mixed,tong,wheels] [--no-boost | --boost=driving,medical] [--tag=name]
//
// About 8 s a season (18 s for tong) on one core; it spreads them over every core. 60 seeds of
// everything is ~660 seasons: about half an hour on four cores.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { mkdirSync, writeFileSync } from 'node:fs';
import { STATS, APPROACH_IDS, POLICIES, playSeason } from './lib/stat-usage.mjs';

// The plan's thresholds (drafts/PLAN-stat-usage.md, agreed before running).
export const RULES = {
  cutJobs: 0.20, // rolled on fewer than this share of jobs...
  cutDecisive: 0.05, // ...and less than this share of all decisive rolls...
  cutCash: 0.02, // ...and +3 moves week-52 cash by less than this: cut or merge
  hogDecisive: 0.35, // more than this share of decisive rolls: rebalance
  idleUtil: 0.30, // specialists roll their main stat on fewer than this share of their jobs: flagged, not a verdict on its own
};

if (!isMainThread) {
  parentPort.on('message', (task) => {
    if (task === 'done') return process.exit(0);
    const r = playSeason(task);
    parentPort.postMessage({ task, cash: r.cash, deaths: r.deaths, run: r.run });
  });
} else {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const SEEDS = Number(args[0] ?? 60);
  const WEEKS = Number(args[1] ?? 52);
  const policies = (args[2] ?? Object.keys(POLICIES).join(',')).split(',');
  const flag = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
  const boosts = process.argv.includes('--no-boost') ? [] : flag('boost') ? flag('boost').split(',') : STATS;
  const tag = flag('tag');
  const tasks = [];
  for (const policy of policies) for (let i = 1; i <= SEEDS; i++) tasks.push({ policy, seed: i, weeks: WEEKS, boost: null });
  for (const boost of boosts) for (let i = 1; i <= SEEDS; i++) tasks.push({ policy: 'careful', seed: i, weeks: WEEKS, boost });
  // The slow ones first, so the last worker isn't left with a tong season.
  tasks.sort((a, b) => (b.policy === 'tong') - (a.policy === 'tong'));

  const results = [];
  const started = Date.now();
  await new Promise((done, fail) => {
    let next = 0;
    let live = 0;
    const n = Math.max(1, Math.min(cpus().length, tasks.length));
    for (let k = 0; k < n; k++) {
      const w = new Worker(new URL(import.meta.url), {});
      live++;
      const feed = () => (next < tasks.length ? w.postMessage(tasks[next++]) : w.postMessage('done'));
      w.on('message', (m) => {
        results.push(m);
        if (results.length % 20 === 0) process.stderr.write(`  ${results.length}/${tasks.length} seasons, ${Math.round((Date.now() - started) / 1000)} s\n`);
        feed();
      });
      w.on('error', fail);
      w.on('exit', () => { if (--live === 0) done(); });
      feed();
    }
  });

  const key = (t) => `${t.policy}${t.boost ? `+${t.boost}` : ''}`;
  const groups = new Map();
  for (const r of results) { const k = key(r.task); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
  for (const g of groups.values()) g.sort((a, b) => a.task.seed - b.task.seed);

  /** Sum the runs' counts. */
  function pool(runs) {
    const t = Object.fromEntries(STATS.map((s) => [s, { rolls: 0, jobs: 0, decisive: 0, costly: 0, fails: 0 }]));
    const spec = Object.fromEntries(STATS.map((s) => [s, { jobs: 0, rolled: 0 }]));
    const by = { approach: {}, threat: {} };
    let jobs = 0;
    for (const { run } of runs) {
      jobs += run.jobs + run.sideJobs;
      for (const s of STATS) {
        for (const f of Object.keys(t[s])) t[s][f] += run.all[s][f];
        spec[s].jobs += run.spec[s].jobs;
        spec[s].rolled += run.spec[s].rolled;
      }
      for (const [dim, src] of [['approach', run.byApproach], ['threat', run.byThreat]]) {
        for (const [k, v] of Object.entries(src)) {
          const d = (by[dim][k] ??= { jobs: 0, t: Object.fromEntries(STATS.map((s) => [s, { rolls: 0, jobs: 0, decisive: 0, costly: 0, fails: 0 }])) });
          d.jobs += v.jobs;
          for (const s of STATS) for (const f of Object.keys(d.t[s])) d.t[s][f] += v.t[s][f];
        }
      }
    }
    return { t, spec, by, jobs, weeks: runs.length * WEEKS };
  }

  const pct = (x) => (x == null || Number.isNaN(x) ? '-' : `${(x * 100).toFixed(1)}%`);
  const num = (x, d = 2) => (x == null || Number.isNaN(x) ? '-' : x.toFixed(d));
  const mean = (a) => a.reduce((n, x) => n + x, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((n, x) => n + (x - m) ** 2, 0) / Math.max(1, a.length - 1)); };

  function rowsOf(p) {
    const dec = STATS.reduce((n, s) => n + p.t[s].decisive, 0);
    return STATS.map((s) => {
      const x = p.t[s];
      return { stat: s, rollsWk: x.rolls / p.weeks, jobsPct: x.jobs / p.jobs, decShare: dec ? x.decisive / dec : 0, decRate: x.rolls ? x.decisive / x.rolls : 0, costlyWk: x.costly / p.weeks, specUtil: p.spec[s].jobs ? p.spec[s].rolled / p.spec[s].jobs : null, specJobs: p.spec[s].jobs };
    });
  }

  // The counterfactuals: paired against the careful policy's own seeds.
  const base = groups.get('careful');
  const boost = {};
  for (const s of boosts) {
    const g = groups.get(`careful+${s}`);
    if (!base || !g) continue;
    const baseCash = mean(base.map((r) => r.cash));
    const d = g.map((r, i) => r.cash - base[i].cash);
    const inj = g.map((r, i) => r.run.injuries - base[i].run.injuries);
    const heat = g.map((r, i) => r.run.heat - base[i].run.heat);
    boost[s] = {
      cash: mean(d) / Math.abs(baseCash), cashNoise: (2 * sd(d)) / Math.sqrt(d.length) / Math.abs(baseCash),
      injuries: mean(inj), heat: mean(heat), deaths: mean(g.map((r, i) => r.deaths - base[i].deaths)),
    };
  }

  const csv = [['policy', 'slice', 'stat', 'jobs', 'rolls_per_week', 'jobs_pct', 'decisive_share', 'decisive_rate', 'costly_per_week', 'spec_util', 'spec_jobs', 'plus3_cash_pct', 'plus3_cash_noise_pct', 'plus3_injuries', 'plus3_heat', 'plus3_deaths'].join(',')];
  const head = `${'stat'.padEnd(8)} ${'rolls/wk'.padStart(8)} ${'jobs%'.padStart(7)} ${'dec-share'.padStart(9)} ${'dec-rate'.padStart(8)} ${'costly/wk'.padStart(9)} ${'spec-util'.padStart(9)}`;
  function table(title, p, policy, slice = 'all', withBoost = false) {
    console.log(`\n${title} (${p.jobs} jobs over ${p.weeks / WEEKS} seasons)`);
    console.log(head + (withBoost ? `  ${'+3 cash@52'.padStart(14)} ${'+3 inj'.padStart(7)} ${'+3 heat'.padStart(8)}` : ''));
    for (const r of rowsOf(p)) {
      const b = withBoost ? boost[r.stat] : null;
      console.log(`${r.stat.padEnd(8)} ${num(r.rollsWk).padStart(8)} ${pct(r.jobsPct).padStart(7)} ${pct(r.decShare).padStart(9)} ${pct(r.decRate).padStart(8)} ${num(r.costlyWk).padStart(9)} ${(r.specUtil == null ? '-' : pct(r.specUtil)).padStart(9)}`
        + (b ? `  ${`${b.cash >= 0 ? '+' : ''}${pct(b.cash)}±${(b.cashNoise * 100).toFixed(1)}`.padStart(14)} ${num(b.injuries, 1).padStart(7)} ${num(b.heat, 1).padStart(8)}` : ''));
      csv.push([policy, slice, r.stat, p.jobs, num(r.rollsWk, 3), num(r.jobsPct, 4), num(r.decShare, 4), num(r.decRate, 4), num(r.costlyWk, 3), r.specUtil == null ? '' : num(r.specUtil, 4), r.specJobs,
        b ? num(b.cash * 100, 2) : '', b ? num(b.cashNoise * 100, 2) : '', b ? num(b.injuries, 2) : '', b ? num(b.heat, 2) : '', b ? num(b.deaths, 2) : ''].join(','));
    }
  }

  const pooled = {};
  for (const policy of policies) {
    const g = groups.get(policy);
    if (!g) continue;
    pooled[policy] = pool(g);
    const cash = g.map((r) => r.cash).sort((a, b) => a - b);
    table(`${POLICIES[policy].name}: median cash at week ${WEEKS} ¥${cash[Math.floor(cash.length / 2)]}, deaths ${g.reduce((n, r) => n + r.deaths, 0)}`, pooled[policy], policy, 'all', policy === 'careful' && boosts.length > 0);
  }
  const every = pool(policies.flatMap((p) => groups.get(p) ?? []));
  table('All policies together', every, 'all');

  // By approach (every policy) and by threat (every policy): rolls per job and decisive rolls per job.
  for (const [dim, keys] of [['approach', APPROACH_IDS], ['threat', ['1', '2', '3', '4', '5']]]) {
    console.log(`\nBy ${dim}, all policies: rolls per job (decisive per job)`);
    console.log(`${dim.padEnd(8)} ${'jobs'.padStart(6)} ${STATS.map((s) => s.padStart(12)).join(' ')}`);
    for (const k of keys) {
      const d = every.by[dim][k];
      if (!d?.jobs) continue;
      console.log(`${k.padEnd(8)} ${String(d.jobs).padStart(6)} ${STATS.map((s) => `${num(d.t[s].rolls / d.jobs)} (${num(d.t[s].decisive / d.jobs)})`.padStart(12)).join(' ')}`);
      const p = { t: d.t, spec: Object.fromEntries(STATS.map((s) => [s, { jobs: 0, rolled: 0 }])), jobs: d.jobs, weeks: every.weeks };
      for (const r of rowsOf(p)) csv.push(['all', `${dim}:${k}`, r.stat, d.jobs, num(d.t[r.stat].rolls / d.jobs, 3) + '/job', num(r.jobsPct, 4), num(r.decShare, 4), num(r.decRate, 4), '', '', '', '', '', '', '', ''].join(','));
    }
  }

  // The verdict, by the plan's rules: usage from every policy together, +3 from the careful counterfactuals.
  console.log('\nVerdict (drafts/PLAN-stat-usage.md rules)');
  for (const r of rowsOf(every)) {
    const b = boost[r.stat];
    const lowUse = r.jobsPct < RULES.cutJobs && r.decShare < RULES.cutDecisive;
    const flat = b ? Math.abs(b.cash) < RULES.cutCash : null;
    const idle = r.specUtil != null && r.specUtil < RULES.idleUtil;
    let call = 'healthy';
    if (r.decShare > RULES.hogDecisive) call = 'rebalance: takes too many of the decisive rolls';
    else if (lowUse && flat) call = 'cut or merge';
    else if (lowUse && flat === false) call = 'rework: rarely rolled, but +3 matters when it is';
    else if (lowUse) call = 'rarely rolled (no +3 run to decide)';
    if (idle) call += `; specialists idle (they roll it on ${pct(r.specUtil)} of their jobs)`;
    console.log(`${r.stat.padEnd(8)} jobs ${pct(r.jobsPct).padStart(6)}, decisive ${pct(r.decShare).padStart(6)}, spec-util ${(r.specUtil == null ? '-' : pct(r.specUtil)).padStart(6)}, +3 cash ${b ? pct(b.cash) : '-'}: ${call}`);
  }

  const date = new Date().toISOString().slice(0, 10);
  mkdirSync(new URL('../docs/sims/', import.meta.url), { recursive: true });
  const file = new URL(`../docs/sims/stat-usage-${date}${tag ? `-${tag}` : ''}.csv`, import.meta.url);
  writeFileSync(file, csv.join('\n') + '\n');
  console.log(`\nWrote ${file.pathname.replace(/.*\/docs\//, 'docs/')} (${results.length} seasons, ${Math.round((Date.now() - started) / 1000)} s)`);
}
