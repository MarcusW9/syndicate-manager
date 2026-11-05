// Capture (2026-11-04, crews out made visible): on a phone (390), the send-off card as a crew
// leaves; Today with crews out (on the job, calling, lying low) and a crew back with its stamp.
// Builds the states with the game's own core and loads them into the page.
// Run: node scripts/capture-crews-out.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const fresh = (seed) => { const s = createNewGame({ seed, startCrew: 'fresh' }); s.jobs = []; return s; };
const send = (s, tid, n, callIn, approach = 'stealth') => {
  addOffer(s, tid, { rng: () => 0.5 });
  const job = s.jobs.find((j) => j.templateId === tid);
  return sendOff(s, job.id, s.crew.filter((o) => !o.condition.awayUntil).slice(0, n).map((o) => o.id), approach, 'steady', { callIn });
};
// A morning with a crew back from a one-day job, a long job under way and another calling in.
let busy = null;
for (let seed = 1; seed < 300 && !busy; seed++) {
  let s = fresh(seed);
  s.crew.push(...structuredClone(s.crew).map((o, i) => ({ ...o, id: `${o.id}-b`, handle: `${o.handle}-${i}` })).slice(0, 3));
  s = send(s, 'queue_duty', 2, 'never', 'tech');
  s = send(s, 'penthouse', 3, 'never');
  s = send(s, 'warehouse', 3, 'every');
  s = advanceDay(s);
  if (s.inbox.some((m) => m.back?.away) && s.awayJobs.length === 2 && s.awayJobs.some((j) => j.waiting)) busy = s;
}
if (!busy) throw new Error('no morning with a crew back, one out and one calling');
const plan = fresh(21);
addOffer(plan, 'rent_round', { rng: () => 0.5 });

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5189/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await load(p, plan);
  await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
  await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  await p.locator('[data-action="send-job"]').click();
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/01-send-off.png` });
  await load(p, busy);
  await p.locator('.backs').scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -80));
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/02-today-back-and-out.png` });
  await p.locator('.crewsout').scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/03-crews-out.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
