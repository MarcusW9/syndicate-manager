// Capture (2026-11-07, a page per hall): on a phone (390), a tong with halls in Old Town and the
// Night Market (level 2, two people moved in, a plate built). Crew › Halls as rows; the Night
// Market's page from Crew (plan, who sleeps here, move someone in, Expand / Buy); its build screen
// and back; Ops with the Night Market picked and "Manage the hall ›"; its page from Ops; a computer.
// Run: node scripts/capture-hall-pages.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { syncHalls } from '../src/core/halls.js';
import { placePiece, buildableCells, bedCells, hallMap } from '../src/core/hallbuild.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.halls.push({ district: 'nightMarket', beds: 4, rent: 500, level: 2, opened: 1, build: [] });
syncHalls(s);
s.crew[0].hall = 'nightMarket'; s.crew[1].hall = 'nightMarket';
s.cash = 40000;
const beds = bedCells(s.halls[1]);
const free = [...buildableCells(hallMap('nightMarket'))].filter((k) => !beds.has(k)).map((k) => k.split(',').map(Number));
s = placePiece(s, 'nightMarket', 'plate', ...free.at(-1), 1);

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5197', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5197/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, s);
  await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Halls')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130); });
  await p.screenshot({ path: `${out}/01-crew-halls.png` });
  await tap(p, '[data-action="hall-page"][data-id="nightMarket"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/02-hall-page.png` });
  await p.screenshot({ path: `${out}/03-hall-page-full.png`, fullPage: true });
  await tap(p, '[data-action="build-hall"][data-id="nightMarket"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/04-build-from-the-hall.png` });
  await tap(p, '[data-action="back"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/05-back-to-the-hall.png` });
  await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(400);
  await p.locator('[data-action="city-district"][data-id="nightMarket"]').first().click({ force: true }); await p.waitForTimeout(900);
  await p.locator('[data-action="hall-page"][data-id="nightMarket"]').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/06-ops-manage-the-hall.png` });
  await tap(p, '[data-action="hall-page"][data-id="nightMarket"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/07-hall-page-from-ops.png` });
  await p.setViewportSize({ width: 1280, height: 900 }); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/08-desktop-hall-page.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
