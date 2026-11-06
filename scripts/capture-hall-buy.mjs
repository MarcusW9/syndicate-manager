// Capture (2026-11-06, buying a hall and the work board): on a phone (390), a tong with a Night
// Market hall at level 2. Crew › Halls with Buy the place; the Rooms tab with a work board built;
// after buying, the hall marked ours with no rent; and Sunday's message with the work board's week.
// Run: node scripts/capture-hall-buy.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { syncHalls, buyHall } from '../src/core/halls.js';
import { buildableCells, hallMap, canPlace, placePiece } from '../src/core/hallbuild.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.halls.push({ district: 'nightMarket', beds: 4, rent: 1000, level: 2, opened: 1, build: [], owned: false });
syncHalls(s);
s.cash = 40000;
const at = [...buildableCells(hallMap('nightMarket'))].map((k) => k.split(',').map(Number)).find(([x, y]) => canPlace(s, 'nightMarket', 'workboard', x, y).ok);
s = placePiece(s, 'nightMarket', 'workboard', ...at);
const before = structuredClone(s);
s = buyHall(s, 'nightMarket');
while (!calendar(s.day).isSunday) s = advanceDay(s);
for (const m of s.inbox) if (m.blocking) { m.blocking = false; m.resolved = true; }
const after = s;

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5202', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5202/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const halls = async (p) => { await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300); await p.evaluate(() => { [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Halls')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130); }); await p.waitForTimeout(200); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, before);
  await halls(p);
  await p.evaluate(() => window.scrollBy(0, 300)); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/01-halls-buy-the-place.png` });
  await tap(p, '[data-action="build-hall"][data-id="nightMarket"]'); await p.waitForTimeout(300);
  await tap(p, '[data-action="build-tab"][data-id="room"]'); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/02-rooms-work-board.png`, fullPage: true });
  await load(p, after);
  await halls(p);
  await p.evaluate(() => window.scrollBy(0, 300)); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/03-halls-ours-no-rent.png` });
  const week = after.inbox.find((m) => m.kind === 'week');
  await tap(p, '[data-action="nav"][data-id="inbox"]'); await p.waitForTimeout(300);
  await p.locator(`[data-action="open-message"][data-id="${week.id}"]`).first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/04-sunday-work-board.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
