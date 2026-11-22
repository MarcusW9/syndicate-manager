// Capture (2026-11-22, a job that follows a trail: Kidnap Rescue rebuilt, core/trail.js): the watch screen at the
// trail's second stop (its own map, the stop headings in the feed, the stop's crisis waiting for a call), and the
// report of a rescue whose trail took a wrong lead. 390x844 (full page) and 844x390, 1x.
// Run: node scripts/capture-trail.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import * as M from '../src/core/mission.js';
import { autoStep, autoRun } from '../src/core/autorun.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
function game(seed) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.crew = ['face', 'tech', 'muscle', 'medic'].map((role) => recruitToOperative(generateRecruit(s, { role, quality: 'pro' }), { condition: { injury: 'healthy', injuryDays: 0, fatigue: 0, morale: 70, neuralLoad: 0, awayUntil: 0 }, history: [] }));
  s.jobs = [];
  addOffer(s, 'kidnap');
  return M.startMission(s, s.jobs[0].id, s.crew.map((o) => o.id), 'stealth', { callIn: 'every' });
}
// Live, waiting at the second stop's crisis.
let live = null;
for (let seed = 1; seed < 60 && !live; seed++) {
  let s = game(seed);
  for (let g = 0; g < 40 && !s.activeMission.done; g++) {
    const am = s.activeMission;
    const step = M.currentStep(am);
    if (step?.type === 'crisis' && am.trail.path.length === 2 && am.trail.at !== 'held') { live = s; break; }
    if (step?.type === 'crisis') { const odds = M.crisisOdds(s).filter((o) => !o.exit).sort((a, b) => b.chance - a.chance); s = M.chooseOption(s, odds[0].choice.id); continue; }
    const next = autoStep(s, { force: true });
    if (next === s) break;
    s = next;
  }
}
// A finished rescue whose trail took a wrong lead, closed into its report.
let report = null;
for (let seed = 1; seed < 200 && !report; seed++) {
  const s = autoRun(game(seed), 'steady');
  const am = s.activeMission;
  if (am.result.outcome === 'completed' && am.events.some((e) => e.kind === 'stop' && e.wrong)) {
    const closed = M.closeMission(s);
    report = { state: closed, id: closed.inbox.find((m) => m.type === 'report').id };
  }
}
if (!live || !report) throw new Error('no state found');

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5196', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5196/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
try {
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
    await load(p, live);
    await p.waitForTimeout(4000);
    await p.screenshot({ path: `${out}/01-${tag}-trail-stop.png`, fullPage: tag === 'phone' });
    await load(p, report.state);
    const later = p.getByText('Decide later').filter({ visible: true }); // the rescue's heat can bring a raid warning: put it off
    if (await later.count()) { await later.first().click(); await p.waitForTimeout(300); }
    await vis(p, `[data-action="open-message"][data-id="${report.id}"]`).click({ timeout: 5000 });
    await p.waitForTimeout(6000);
    await p.screenshot({ path: `${out}/02-${tag}-trail-report.png`, fullPage: tag === 'phone' });
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
