// Capture (2026-11-06, building up a hall): on a phone (390), a Street tong with halls in Old Town
// and the Night Market (level 2). Crew › Halls with the Build button; the Night Market's build
// screen with a plate, a barricade and a wall placed; a free square picked with a steel plate ready
// to place; a placed piece picked (turn, remove); the Rooms tab with a clinic and a bunk room built
// (slice 2a); and a raid held in the built-up hall.
// Run: node scripts/capture-hall-build.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { syncHalls, hallIn } from '../src/core/halls.js';
import { setHeat } from '../src/core/heat.js';
import { placePiece, buildableCells, hallMap, pieceCells, canPlace } from '../src/core/hallbuild.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.halls.push({ district: 'nightMarket', beds: 4, rent: 2000, level: 2, opened: 1, build: [] });
syncHalls(s);
s.crew[0].hall = 'nightMarket'; s.crew[1].hall = 'nightMarket'; s.crew[2].hall = 'nightMarket';
s.cash = 40000;
const site = hallMap('nightMarket');
const anchor = site.paths.inside.at(-1);
const cells = [...buildableCells(site)].map((k) => k.split(',').map(Number))
  .sort((a, b) => Math.hypot(a[0] * 30 + 15 - anchor[0], a[1] * 30 + 15 - anchor[1]) - Math.hypot(b[0] * 30 + 15 - anchor[0], b[1] * 30 + 15 - anchor[1]));
s = placePiece(s, 'nightMarket', 'plate', ...cells[0], 0);
s = placePiece(s, 'nightMarket', 'barricade', ...cells[1]);
s = placePiece(s, 'nightMarket', 'wall', ...cells[3], 1);
const built = structuredClone(s);
// Rooms: a clinic and a bunk room, where they fit.
const fit = (st, id, rot = 0) => { for (const k of buildableCells(site)) { const [x, y] = k.split(',').map(Number); if (canPlace(st, 'nightMarket', id, x, y, rot).ok) return [x, y]; } return null; };
let roomy = structuredClone(built);
roomy.halls.find((h) => h.district === 'nightMarket').level = 3;
for (const [id, rot] of [['clinic', 0], ['bunks', 1]]) { const at = fit(roomy, id, rot); if (at) roomy = placePiece(roomy, 'nightMarket', id, ...at, rot); }
const roomCell = fit(roomy, 'lookout');
const pick = cells[2];
// A raid on the built-up hall: the Night Market run hot until the police come.
for (let i = 0; i < 60 && !s.inbox.some((m) => m.kind === 'raid' && !m.resolved); i++) {
  setHeat(s, 'nightMarket', 9); s = advanceDay(s); setHeat(s, 'nightMarket', 9);
  for (const m of s.inbox) if (m.blocking && m.kind !== 'raid') { m.blocking = false; m.resolved = true; }
}
const calling = s;

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5199', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5199/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, built);
  await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Halls')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130); });
  await p.screenshot({ path: `${out}/01-halls-build-button.png` });
  await tap(p, '[data-action="build-hall"][data-id="nightMarket"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/02-build-screen.png` });
  await p.locator(`[data-action="build-cell"][data-id="${pick.join(',')}"]`).click({ force: true }); await p.waitForTimeout(200);
  await tap(p, '[data-action="build-piece"][data-id="plate"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/03-placing-a-plate.png` });
  await tap(p, '[data-action="build-place"]'); await p.waitForTimeout(300);
  await p.locator(`[data-action="build-cell"][data-id="${cells[3].join(',')}"]`).click({ force: true }); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/04-a-wall-picked.png` });
  await p.setViewportSize({ width: 1280, height: 900 }); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/05-desktop-build.png` });
  await p.setViewportSize({ width: 390, height: 844 });
  await load(p, roomy);
  await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300);
  await tap(p, '[data-action="build-hall"][data-id="nightMarket"]'); await p.waitForTimeout(300);
  await tap(p, '[data-action="build-tab"][data-id="room"]'); await p.waitForTimeout(200);
  if (roomCell) { await p.locator(`[data-action="build-cell"][data-id="${roomCell.join(',')}"]`).click({ force: true }); await p.waitForTimeout(200); }
  await tap(p, '[data-action="build-piece"][data-id="lookout"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/07-rooms-tab.png`, fullPage: true });
  await load(p, calling);
  await tap(p, '[data-action="nav"][data-id="city"]'); await p.waitForTimeout(400);
  await tap(p, '[data-action="raid-answer"]'); await p.waitForTimeout(400);
  await tap(p, '[data-action="decide"][data-option="hold"]'); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/06-holding-the-built-hall.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
