// Capture (2026-11-22, the adventure log, slice 1): City › Map's Out now with a hands-off crew on its third day
// in the Docks (the day's log line first, the beat under it) and The log opened; a two-day side task with its
// first day's line; the report when the crew is back, with The days out. The Docks job is stretched to four days
// for the capture only (most jobs are one day). Builds the states with the game's own core and loads them into the page.
// Run: node scripts/capture-advlog.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { sendOnSideTask } from '../src/core/sidetasks.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

const JOB = 'container409';
function staged(seed) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, JOB);
  const crew = s.crew.slice(0, templateById(JOB).crewSize).map((o) => o.id);
  s = sendOff(s, s.jobs[0].id, crew, 'stealth', 'steady', { callIn: 'never' });
  s.awayJobs[0].mission.days = 4; // the capture only
  s.awayJobs[0].returnDay = s.day + 4;
  for (const id of crew) s.crew.find((o) => o.id === id).condition.awayUntil = s.day + 4;
  return s;
}
let out3 = null;
let back = null;
for (let seed = 1; seed < 40 && !back; seed++) {
  let s = staged(seed);
  for (let i = 0; i < 2; i++) s = advanceDay(s);
  // A two-day side task out the day before, so its card has its first day's line.
  s.sideBoard = ['trike_practice'];
  for (const o of s.crew) if (!s.sideOut?.length) s = sendOnSideTask(s, 'trike_practice', [o.id]); // the first one free
  s = advanceDay(s);
  if (!s.awayJobs.length || !s.sideOut?.length || s.inbox.some((m) => m.blocking && !m.resolved)) continue;
  out3 = structuredClone(s);
  for (let i = 0; i < 4 && s.awayJobs.length; i++) s = advanceDay(s);
  const r = s.inbox.find((m) => m.type === 'report' && m.timeline?.days?.length >= 4);
  if (r && !s.inbox.some((m) => m.blocking && !m.resolved)) back = { state: s, id: r.id };
}
if (!back) throw new Error('no seed kept the crew out four days');

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5193', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5193/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
const toCity = async (p) => { await vis(p, '[data-action="goto"][data-id="city:map"]').click(); await p.waitForTimeout(400); await vis(p, '.ops').scrollIntoViewIfNeeded(); };
try {
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
    await load(p, out3);
    await toCity(p);
    await vis(p, '.ops').screenshot({ path: `${out}/01-${tag}-crew-out-day3.png` });
    await p.evaluate(() => [...document.querySelectorAll('.outrow.is-side')].find((e) => e.offsetParent)?.scrollIntoView({ block: 'center' }));
    await vis(p, '.outrow.is-side').screenshot({ path: `${out}/01b-${tag}-side-task-day1.png` });
    await vis(p, '.outrow.is-job summary').click(); await p.waitForTimeout(200); // rows that open (2026-11-26)
    await vis(p, '.outrow.is-job .advlog > summary').click();
    await p.waitForTimeout(200);
    await vis(p, '.ops').screenshot({ path: `${out}/02-${tag}-log-open.png` });
    await load(p, back.state);
    await vis(p, `[data-action="open-message"][data-id="${back.id}"]`).click();
    await p.waitForTimeout(3000);
    await p.screenshot({ path: `${out}/03-${tag}-report-days-out.png`, fullPage: tag === 'phone' });
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
