// Capture (2026-11-09, the Hall page visual and layout pass): the Old Town hall at 390 and 1180.
// Four views: empty hall (level 1), level 2 with a police raid warned and some building done, the
// same with Expand next, and the build screen on a phone.
// Run: node scripts/capture-hall-art.mjs <out dir> [--art]   (--art turns the art layer on first)
import { createNewGame } from '../src/core/state.js';
import { setHeat } from '../src/core/heat.js';
import { expandHall, syncHalls } from '../src/core/halls.js';
import { placePiece, buildableCells, bedCells, hallMap, partAt } from '../src/core/hallbuild.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out, flag] = process.argv.slice(2);
const art = flag === '--art';
mkdirSync(out, { recursive: true });
const base = () => { const s = createNewGame({ seed: 21, startCrew: 'fresh' }); s.inbox = s.inbox.filter((m) => m.id !== 'welcome'); s.cash = 90000; return s; };
const empty = base();
let raid = base();
raid = expandHall(raid, 'oldTown');
setHeat(raid, 'oldTown', 8);
const outside = [...buildableCells(hallMap('oldTown'), 2)].filter((k) => !bedCells(raid.halls[0]).has(k)).map((k) => k.split(',').map(Number));
const yardish = outside.filter(([x, y]) => !partAt(hallMap('oldTown'), x, y).inside);
const roomish = outside.filter(([x, y]) => partAt(hallMap('oldTown'), x, y).inside);
raid = placePiece(raid, 'oldTown', 'plate', ...yardish[0], 1);
raid = placePiece(raid, 'oldTown', 'barricade', ...yardish[3]);
raid = placePiece(raid, 'oldTown', 'barricade', ...yardish.at(-1));
raid = placePiece(raid, 'oldTown', 'workboard', ...roomish.find(([x, y]) => outside.some(([a, b]) => a === x + 1 && b === y) && outside.some(([a, b]) => a === x && b === y + 1) && outside.some(([a, b]) => a === x + 1 && b === y + 1)) ?? roomish[0]);
raid.raids = [{ id: 'raid-oldTown-3', district: 'oldTown', by: 'police', warnedDay: raid.day, day: raid.day + 3, answer: null, outcome: null, done: false, followed: null }];

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5199', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => {
  await p.goto('http://localhost:5199/');
  await p.evaluate(([x, a]) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); if (a) localStorage.setItem('syndicate-pref-hallart', '1'); }, [st, art]);
  await p.reload(); await p.waitForTimeout(600);
};
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  for (const [w, h, tag] of [[390, 844, '390'], [1180, 900, '1180']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    for (const [name, st] of [['empty', empty], ['raid', raid]]) {
      await load(p, st);
      await tap(p, '[data-action="nav"][data-id="tong"]'); await p.waitForTimeout(300);
      await tap(p, '[data-action="hall-page"][data-id="oldTown"]'); await p.waitForTimeout(500);
      await p.screenshot({ path: `${out}/${tag}-${name}-hall.png`, fullPage: tag === '390' });
      if (tag === '1180' && name === 'empty') {
        await tap(p, '[data-action="build-hall"][data-id="oldTown"]'); await p.waitForTimeout(300);
        await tap(p, '[data-action="build-piece"][data-id="plate"]'); await p.waitForTimeout(200);
        await p.locator('.bgrid__cell:not(.is-bed)').last().click({ force: true }); await p.waitForTimeout(300);
        await p.screenshot({ path: `${out}/${tag}-${name}-placing.png` });
        await tap(p, '[data-action="build-place"]'); await p.waitForTimeout(400);
        await p.screenshot({ path: `${out}/${tag}-${name}-placed.png` });
      }
      if (tag === '390' && name === 'raid') {
        await tap(p, '[data-action="build-hall"][data-id="oldTown"]'); await p.waitForTimeout(400);
        await p.screenshot({ path: `${out}/${tag}-${name}-build.png`, fullPage: true });
      }
    }
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
