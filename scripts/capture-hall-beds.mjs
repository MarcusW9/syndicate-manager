// Capture (2026-11-07, beds as blocks and a whole floor): on a phone (390), the Old Town build
// screen of a new game (its beds on the floor, slept in or free); a bed tapped (who sleeps there);
// a free square picked with a barricade ready; then each hall's plan with its beds (every district
// open, level 2, with a plate and a barricade built); and the Old Town build screen on a computer.
// Run: node scripts/capture-hall-beds.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { syncHalls } from '../src/core/halls.js';
import { placePiece, buildableCells, bedCells, hallMap } from '../src/core/hallbuild.js';
import { HALL_SITES } from '../src/data/halls.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.cash = 19400;
const fresh = structuredClone(s);
let all = structuredClone(s);
for (const d of Object.keys(HALL_SITES)) if (d !== 'oldTown') all.halls.push({ district: d, beds: 4, rent: 1000, level: 2, opened: 1, build: [] });
all.halls.find((h) => h.district === 'oldTown').level = 2;
syncHalls(all);
all.cash = 1e6;
all.crew.forEach((o, i) => { o.hall = Object.keys(HALL_SITES)[i % 5]; });
const freeCells = (st, d) => { const beds = bedCells(st.halls.find((h) => h.district === d)); return [...buildableCells(hallMap(d))].filter((k) => !beds.has(k)).map((k) => k.split(',').map(Number)); };
for (const d of Object.keys(HALL_SITES)) {
  const c = freeCells(all, d);
  all = placePiece(all, d, 'plate', ...c.at(-1), 0);
  all = placePiece(all, d, 'barricade', ...c.at(-3));
}
const oldFree = freeCells(fresh, 'oldTown');
const firstBed = [...bedCells(fresh.halls[0])][0];

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5198', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5198/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const build = async (p, d) => { await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300); await tap(p, `[data-action="build-hall"][data-id="${d}"]`); await p.waitForTimeout(400); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, fresh);
  await build(p, 'oldTown');
  await p.screenshot({ path: `${out}/01-old-town-build.png` });
  await p.locator(`[data-action="build-cell"][data-id="${firstBed}"]`).click({ force: true }); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/02-a-bed-tapped.png` });
  await p.locator(`[data-action="build-cell"][data-id="${oldFree[10].join(',')}"]`).click({ force: true }); await p.waitForTimeout(200);
  await tap(p, '[data-action="build-piece"][data-id="barricade"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/03-placing-a-barricade.png` });
  await load(p, all);
  let n = 4;
  for (const d of Object.keys(HALL_SITES)) {
    await build(p, d);
    await p.locator('.bplan').screenshot({ path: `${out}/0${n++}-plan-${d}.png` });
    await tap(p, '[data-action="back"]'); await p.waitForTimeout(300);
  }
  await p.setViewportSize({ width: 1280, height: 900 });
  await load(p, fresh);
  await build(p, 'oldTown');
  await p.screenshot({ path: `${out}/09-desktop-build.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
