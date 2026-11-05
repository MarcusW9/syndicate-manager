// Capture (2026-11-05, City becomes the command centre, part 1): on a phone (390), Today's one line
// about the crews out; City with the map and the list under it (a call waiting, a crew on the job,
// side work); a crew's district picked in the list (the map lit, the card with the hall's faces, the list narrowed); the
// Save button in the top bar; and City on a computer (1280), the list beside the map.
// Run: node scripts/capture-command-centre.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { refreshSideBoard, sendOnSideTask, sideTaskById } from '../src/core/sidetasks.js';
import { openHall, moveToHall } from '../src/core/halls.js';
import { adjustTrust } from '../src/core/clients.js';
import { HALL_SITES } from '../src/data/halls.js';
import { setHeat } from '../src/core/heat.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const send = (s, tid, n, callIn, approach = 'stealth') => {
  addOffer(s, tid, { rng: () => 0.5 });
  const job = s.jobs.find((j) => j.templateId === tid);
  return sendOff(s, job.id, s.crew.filter((o) => !o.condition.awayUntil).slice(0, n).map((o) => o.id), approach, 'steady', { callIn });
};
let busy = null;
for (let seed = 1; seed < 300 && !busy; seed++) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  s.crew.push(...structuredClone(s.crew).map((o, i) => ({ ...o, id: `${o.id}-b`, handle: `${o.handle}-${i}` })).slice(0, 4));
  s.reputation = HALL_SITES.nightMarket.rep; adjustTrust(s, 'rao', HALL_SITES.nightMarket.trust - 50); s.cash = 40000;
  s = openHall(s, 'nightMarket');
  s = moveToHall(s, s.crew.at(-1).id, 'nightMarket');
  s = moveToHall(s, s.crew.at(-2).id, 'nightMarket');
  s = send(s, 'penthouse', 3, 'never');
  s = send(s, 'warehouse', 3, 'every');
  s = advanceDay(s);
  if (s.awayJobs.length === 2 && s.awayJobs.some((j) => j.waiting)) busy = s;
}
if (!busy) throw new Error('no morning with one crew out and one calling');
if (!busy.sideBoard?.length) refreshSideBoard?.(busy);
const free = busy.crew.filter((o) => !o.condition.awayUntil && !o.settlingDay);
for (const t of busy.sideBoard ?? []) {
  const next = sendOnSideTask(busy, t, free.slice(0, sideTaskById(t).crew).map((o) => o.id));
  if (next !== busy) { busy = next; break; }
}
setHeat(busy, 'docks', 4);
const wanted = busy.awayJobs.find((j) => j.waiting);

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5189/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await load(p, busy);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/01-today-out-line.png` });
  await tap(p, '.outnow'); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/02-city-map.png` });
  await p.locator('.ops').scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -70)); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/03-city-list.png` });
  await tap(p, '.crewsout__where[data-id="oldTown"]'); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/04-district-picked-map.png` });
  await p.locator('.citycard__hall').scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 160)); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/05-district-card-and-list.png` });
  await tap(p, '.savebtn'); await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: `${out}/06-save-button.png` });
  const d = await b.newPage({ viewport: { width: 1280, height: 860 } });
  await load(d, busy);
  await tap(d, '[data-action="nav"][data-id="city"]'); await d.waitForTimeout(500);
  await d.screenshot({ path: `${out}/07-desktop-city.png` });
  console.log('call waiting on', wanted?.mission.templateId, 'side out', busy.sideOut?.length);
} finally {
  await b.close();
  process.kill(-srv.pid);
}
