// Capture (2026-11-07, Old Town as a compound): on a phone (390), the Old Town build screen at
// level 1 (the room and the lane held, the flat to take); the flat tapped (Expand); the hall's page
// at level 1; then level 3 (the yard and its gate) and level 4 (the whole block) with things built;
// and a raid held through the yard gate, fought between the buildings. A computer view at level 4.
// Run: node scripts/capture-hall-compound.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { syncHalls, hallIn } from '../src/core/halls.js';
import { setHeat } from '../src/core/heat.js';
import { placePiece, buildableCells, bedCells, hallMap } from '../src/core/hallbuild.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.cash = 60000;
const lvl1 = structuredClone(s);
const grown = (level, pieces) => {
  let st = structuredClone(s);
  const h = hallIn(st, 'oldTown');
  h.level = level; h.beds += 2 * (level - 1);
  syncHalls(st);
  st.cash = 1e6;
  for (const [id, x, y, rot = 0] of pieces) st = placePiece(st, 'oldTown', id, x, y, rot);
  st.cash = 60000;
  return st;
};
const l3 = grown(3, [['plate', 2, 1], ['plate', 7, 2, 1], ['barricade', 3, 2], ['barricade', 5, 4], ['turret', 1, 1], ['clinic', 7, 3]]);
const l4 = grown(4, [['plate', 2, 1], ['plate', 7, 2, 1], ['barricade', 3, 2], ['barricade', 5, 4], ['turret', 1, 1], ['clinic', 7, 3], ['workboard', 9, 1], ['canteen', 1, 5]]);
// A raid through the gate: level 3, the district hot until the police come.
let r = structuredClone(l3);
for (let i = 0; i < 80 && !r.inbox.some((m) => m.kind === 'raid' && !m.resolved && m.payload?.raidId); i++) {
  setHeat(r, 'oldTown', 9); r = advanceDay(r); setHeat(r, 'oldTown', 9);
  for (const m of r.inbox) if (m.blocking && m.kind !== 'raid') { m.blocking = false; m.resolved = true; }
}
const free = (st) => { const h = hallIn(st, 'oldTown'); const beds = bedCells(h); return [...buildableCells(hallMap('oldTown'), h.level)].filter((k) => !beds.has(k)); };

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5196', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((res) => setTimeout(res, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5196/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const page = async (p) => { await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300); await tap(p, '[data-action="hall-page"][data-id="oldTown"]'); await p.waitForTimeout(400); };
const build = async (p) => { await page(p); await tap(p, '[data-action="build-hall"][data-id="oldTown"]'); await p.waitForTimeout(400); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, lvl1);
  await build(p);
  await p.screenshot({ path: `${out}/01-level-1-build.png` });
  await p.locator('[data-action="build-part"][data-id="flat"]').click({ force: true }); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/02-the-flat-to-take.png` });
  await page(p);
  await p.screenshot({ path: `${out}/03-level-1-hall-page.png`, fullPage: true });
  await load(p, l3);
  await build(p);
  await p.screenshot({ path: `${out}/04-level-3-build.png` });
  await load(p, l4);
  await page(p);
  await p.screenshot({ path: `${out}/05-level-4-hall-page.png` });
  await build(p);
  await p.screenshot({ path: `${out}/06-level-4-build.png` });
  const call = r.inbox.find((m) => m.kind === 'raid' && !m.resolved);
  if (call) {
    await load(p, r);
    await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(400);
    await tap(p, '[data-action="raid-answer"]'); await p.waitForTimeout(400);
    await tap(p, '[data-action="decide"][data-option="hold"]'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/07-holding-the-compound.png` });
  } else console.error('no raid came');
  await p.setViewportSize({ width: 1280, height: 900 });
  await load(p, l4);
  await build(p);
  await p.screenshot({ path: `${out}/08-desktop-build.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
