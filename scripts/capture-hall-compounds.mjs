// Capture (2026-11-07, every hall a compound): on a phone (390), each of the four other halls'
// build plans at level 1 (just opened) and at level 4 (the whole compound, defences in the lane and
// the yard, rooms inside); the Docks' build screen at level 2; and a raid on the Docks held.
// Run: node scripts/capture-hall-compounds.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { syncHalls, hallIn } from '../src/core/halls.js';
import { setHeat } from '../src/core/heat.js';
import { placePiece, buildableCells, bedCells, hallMap, partAt } from '../src/core/hallbuild.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const D = ['nightMarket', 'docks', 'basin', 'heights'];
const base = createNewGame({ seed: 21, startCrew: 'fresh' });
base.inbox = base.inbox.filter((m) => m.id !== 'welcome');
const at = (level) => {
  let s = structuredClone(base);
  for (const d of D) s.halls.push({ district: d, beds: 2 + 2 * (level - 1), rent: 500, level, opened: 1, build: [] });
  s.crew.forEach((o, i) => { o.hall = ['oldTown', ...D][i % 5]; });
  syncHalls(s);
  s.cash = 1e6;
  if (level > 1) for (const d of D) {
    const site = hallMap(d);
    const beds = bedCells(hallIn(s, d));
    const free = [...buildableCells(site, level)].filter((k) => !beds.has(k)).map((k) => k.split(',').map(Number));
    const outside = free.filter(([x, y]) => !partAt(site, x, y).inside);
    const inside = free.filter(([x, y]) => partAt(site, x, y).inside);
    ['plate', 'barricade', 'plate', 'turret', 'barricade', 'wall'].forEach((p, i) => { if (outside[i * 2]) s = placePiece(s, d, p, ...outside[i * 2], i % 2); });
    for (const room of ['clinic', 'stash', 'workboard']) { const c = inside.find(([x, y]) => placePiece(s, d, room, x, y) !== s); if (c) s = placePiece(s, d, room, ...c); }
  }
  s.cash = 60000;
  return s;
};
const l1 = at(1), l2 = at(2), l4 = at(4);
let r = structuredClone(l4);
for (let i = 0; i < 80 && !r.inbox.some((m) => m.kind === 'raid' && !m.resolved && m.payload?.district === 'docks'); i++) {
  for (const d of D.concat('oldTown')) setHeat(r, d, d === 'docks' ? 9 : 0);
  r = advanceDay(r);
  for (const m of r.inbox) if (m.blocking && m.kind !== 'raid') { m.blocking = false; m.resolved = true; }
}

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5195', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((res) => setTimeout(res, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5195/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const build = async (p, d) => { await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300); await tap(p, `[data-action="hall-page"][data-id="${d}"]`); await p.waitForTimeout(300); await tap(p, `[data-action="build-hall"][data-id="${d}"]`); await p.waitForTimeout(400); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  let n = 1;
  for (const [st, tag] of [[l1, 'level-1'], [l4, 'level-4']]) {
    await load(p, st);
    for (const d of D) {
      await build(p, d);
      await p.locator('.bplan').screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-${d}-${tag}.png` });
      await tap(p, '[data-action="back"]'); await p.waitForTimeout(200);
    }
  }
  await load(p, l2);
  await build(p, 'docks');
  await p.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-docks-build-level-2.png` });
  if (r.inbox.some((m) => m.kind === 'raid' && !m.resolved)) {
    await load(p, r);
    await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(400);
    await tap(p, '[data-action="raid-answer"]'); await p.waitForTimeout(400);
    await tap(p, '[data-action="decide"][data-option="hold"]'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-docks-raid.png` });
  } else console.error('no raid on the docks');
} finally {
  await b.close();
  process.kill(-srv.pid);
}
