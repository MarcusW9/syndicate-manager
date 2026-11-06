// Capture (2026-11-06, the lighter top bar): on a phone (390) the top bar with no heat, with the
// Docks at 4 (amber chip) and at 7 (red), then the rank on the Ops heading with its explainer open;
// on a computer (1280), the bar with the Docks at 7. Then 360 wide, hot.
// Run: node scripts/capture-topbar.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const game = (heat) => {
  const s = createNewGame({ seed: 21, startCrew: 'fresh' });
  s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
  s.heatBy = heat ? { docks: heat, oldTown: 1 } : {};
  s.heat = heat;
  s.dayStartCash = s.cash - 1050; // a day the cash moved, so the change shows
  return s;
};

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5192', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5192/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const bar = (p, path) => p.locator('.topbar').screenshot({ path });
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  for (const [n, heat, name] of [[19, 0, 'quiet'], [20, 4, 'warm'], [21, 7, 'hot']]) { await load(p, game(heat)); await bar(p, `${out}/${n}-topbar-${name}-phone.png`); }
  await p.locator('.heatchip').click(); await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.locator('[data-action="info"][data-id="tong"]').click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/22-ops-with-the-rank-phone.png` });
  const w = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await load(w, game(7)); await bar(w, `${out}/23-topbar-hot-desktop.png`);
  const n = await b.newPage({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 });
  await load(n, game(7)); await bar(n, `${out}/24-topbar-hot-360.png`);
  console.log('scroll width at 360:', await n.evaluate(() => document.documentElement.scrollWidth));
} finally {
  await b.close();
  process.kill(-srv.pid);
}
