// Capture (2026-11-12, hall plans simpler): the Night Market hall at level 2 with a few defences, on a
// phone (the hall page, then the Build screen) and on a computer (looking, then building in place).
// Run: node scripts/capture-hall-modes.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { syncHalls, hallIn } from '../src/core/halls.js';
import { placePiece } from '../src/core/hallbuild.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.halls.push({ district: 'nightMarket', beds: 4, rent: 1500, level: 2, opened: 1, build: [] });
syncHalls(s);
s.cash = 1e6;
for (const [id, x, y, rot = 0] of [['barricade', 5, 4], ['plate', 6, 5, 1]]) s = placePiece(s, 'nightMarket', id, x, y, rot);
s.cash = 24500;

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5197', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((res) => setTimeout(res, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5197/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const page = async (p) => { await tap(p, '[data-action="nav"][data-id="tong"]'); await p.waitForTimeout(300); await tap(p, '[data-action="hall-page"][data-id="nightMarket"]'); await p.waitForTimeout(400); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, s);
  await page(p);
  await p.screenshot({ path: `${out}/01-phone-looking.png`, fullPage: true });
  await tap(p, '[data-action="build-hall"][data-id="nightMarket"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/02-phone-building.png`, fullPage: true });
  await p.setViewportSize({ width: 1280, height: 900 });
  await load(p, s);
  await page(p);
  await p.screenshot({ path: `${out}/03-desktop-looking.png` });
  await tap(p, '[data-action="build-hall"][data-id="nightMarket"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/04-desktop-building.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
