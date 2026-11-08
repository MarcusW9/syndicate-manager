// The getaway and being followed home (drafts/PROPOSAL-piloting.md): how often the getaway is rolled,
// how it comes out, how many raids it brings, and whether a pilot of 14+ cuts them.
//   node scripts/sim-getaway.mjs [seeds=16] [weeks=52] [policies=careful,loud,mixed,wheels]
// One child process per policy (about 8 s a season each).
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { playSeason, POLICIES } from './lib/stat-usage.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const SEEDS = Number(args[0] ?? 16), WEEKS = Number(args[1] ?? 52);

if (process.argv.includes('--child')) {
  const policy = args[2];
  const out = [];
  for (let seed = 1; seed <= SEEDS; seed++) out.push(playSeason({ seed, weeks: WEEKS, policy }).run);
  process.stdout.write(JSON.stringify(out));
} else {
  const policies = (args[2] ?? 'careful,loud,mixed,wheels').split(',').filter((p) => POLICIES[p]);
  const self = fileURLToPath(import.meta.url);
  const results = await Promise.all(policies.map((p) => new Promise((res, rej) => {
    let buf = '';
    const c = spawn('node', [self, String(SEEDS), String(WEEKS), p, '--child']);
    c.stdout.on('data', (d) => (buf += d)); c.stderr.on('data', (d) => process.stderr.write(d));
    c.on('close', (code) => (code ? rej(new Error(`${p} exited ${code}`)) : res([p, JSON.parse(buf)])));
  })));
  const pct = (a, b) => (b ? `${(100 * a / b).toFixed(1)}%` : '-');
  console.log(`Getaway and followed-home raids, ${SEEDS} seeds x ${WEEKS} weeks\n`);
  console.log('policy     jobs  getaway  clean  good  fail   bad  followed  raids(all/followed/bad)  14+ followed  <14 followed');
  const tot = { jobs: 0, rolls: 0, sk: { rolls: 0, followed: 0 }, ot: { rolls: 0, followed: 0 } };
  for (const [p, runs] of results) {
    const g = { rolls: 0, clean: 0, good: 0, fail: 0, bad: 0, followed: 0, sk: { rolls: 0, followed: 0 }, ot: { rolls: 0, followed: 0 } };
    let jobs = 0, raids = 0, fr = 0, br = 0;
    for (const r of runs) {
      jobs += r.jobs; g.rolls += r.getaway.rolls;
      for (const k of ['clean', 'good', 'fail', 'bad']) g[k] += r.getaway.result[k];
      g.followed += r.getaway.skilled.followed + r.getaway.other.followed;
      for (const [d, s] of [['sk', 'skilled'], ['ot', 'other']]) { g[d].rolls += r.getaway[s].rolls; g[d].followed += r.getaway[s].followed; }
      raids += r.raids.all; fr += r.raids.followed; br += r.raids.bad;
    }
    tot.jobs += jobs; tot.rolls += g.rolls;
    for (const d of ['sk', 'ot']) { tot[d].rolls += g[d].rolls; tot[d].followed += g[d].followed; }
    console.log(`${p.padEnd(9)} ${String(jobs).padStart(5)}  ${pct(g.rolls, jobs).padStart(7)} ${pct(g.clean, g.rolls).padStart(6)} ${pct(g.good, g.rolls).padStart(5)} ${pct(g.fail, g.rolls).padStart(5)} ${pct(g.bad, g.rolls).padStart(5)}  ${pct(g.followed, g.rolls).padStart(8)}  ${`${raids}/${fr}/${br}`.padStart(22)}  ${pct(g.sk.followed, g.sk.rolls).padStart(5)} (${g.sk.rolls})  ${pct(g.ot.followed, g.ot.rolls).padStart(5)} (${g.ot.rolls})`);
  }
  console.log(`\nAll: getaway rolled on ${pct(tot.rolls, tot.jobs)} of jobs; followed after ${pct(tot.sk.followed + tot.ot.followed, tot.rolls)} of getaways (14+: ${pct(tot.sk.followed, tot.sk.rolls)}, under 14: ${pct(tot.ot.followed, tot.ot.rolls)}).`);
}
