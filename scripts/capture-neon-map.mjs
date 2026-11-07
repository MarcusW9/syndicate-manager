// Capture (2026-11-05, the command centre's map, part 2): the neon City map on a busy evening. A
// Street tong with halls in Old Town and the Night Market; a crew out at the Docks calling in, another
// in Glass Heights, side work in Old Town; heat in the Docks (7), the Night Market (4) and Old Town
// (1); a raid warned on the Night Market hall. On a phone (390): the map alone, the map with the
// Docks picked, and the map with reduced motion; on a computer (1280), the City screen.
// Run: node scripts/capture-neon-map.mjs <out dir>
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
const send = (s, tid, n, callIn) => {
  addOffer(s, tid, { rng: () => 0.5 });
  const job = s.jobs.find((j) => j.templateId === tid);
  return sendOff(s, job.id, s.crew.filter((o) => !o.condition.awayUntil).slice(0, n).map((o) => o.id), 'stealth', 'steady', { callIn });
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
if (!busy.sideBoard?.length) refreshSideBoard(busy);
const free = busy.crew.filter((o) => !o.condition.awayUntil && !o.settlingDay);
for (const t of busy.sideBoard ?? []) {
  const next = sendOnSideTask(busy, t, free.slice(0, sideTaskById(t).crew).map((o) => o.id));
  if (next !== busy) { busy = next; break; }
}
setHeat(busy, 'docks', 7); setHeat(busy, 'nightMarket', 4); setHeat(busy, 'oldTown', 1);
busy.raids = [{ id: 'raid-nightMarket-x', district: 'nightMarket', by: 'police', warnedDay: busy.day, day: busy.day + 3, answer: null, outcome: null, done: false }];

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5195', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5195/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  for (const [motion, name] of [['no-preference', '01-map'], ['reduce', '03-map-reduced-motion']]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: motion });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await load(p, busy);
    await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(900);
    await p.locator('.citymap').screenshot({ path: `${out}/${name}.png` });
    if (motion === 'no-preference') {
      await p.locator('.cm-label[data-id="docks"]').click(); await p.waitForTimeout(600); // the Docks (MAP_DISTRICTS order)
      await p.locator('.citymap').screenshot({ path: `${out}/02-map-docks-picked.png` });
      await p.screenshot({ path: `${out}/04-phone-city.png` });
    }
    await p.close();
  }
  const d = await b.newPage({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 });
  await load(d, busy);
  await tap(d, '[data-action="nav"][data-id="ops"]'); await d.waitForTimeout(900);
  await d.screenshot({ path: `${out}/05-desktop-city.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
