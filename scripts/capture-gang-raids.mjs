// Capture (2026-11-05, gang raids): on a phone (390), a Street tong with halls in Old Town and the
// Night Market, the Silver Fan's grudge at 7 and the Red Lanterns' at 2. The board with Chrome (a job
// against the Silver Fan) and its plan's grudge line; Who's who with each gang's grudge; the Night
// Market's card; the warning; the call at the door with Settle; holding the hall against collectors.
// Run: node scripts/capture-gang-raids.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { addOffer } from '../src/core/jobs.js';
import { openRaids } from '../src/core/raids.js';
import { syncHalls } from '../src/core/halls.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.halls.push({ district: 'nightMarket', beds: 2, rent: 1000, level: 1, opened: 1 });
syncHalls(s);
s.crew[0].hall = 'nightMarket';
s.crew[1].hall = 'nightMarket';
s.cash = 14000;
s.grudges = { redLanterns: 2, silverFan: 7 };
s.jobs = [];
addOffer(s, 'chrome', { rng: () => 0.5 });
const board = structuredClone(s);
for (let i = 0; i < 40 && !openRaids(s).length; i++) { s.grudges.silverFan = 7; s = advanceDay(s); s.grudges.silverFan = 7; }
const quiet = (st) => { for (const m of st.inbox) if (m.blocking && m.kind !== 'raid') { m.blocking = false; m.resolved = true; } return st; };
const warned = structuredClone(quiet(s));
for (let i = 0; i < 6 && !s.inbox.some((m) => m.kind === 'raid' && !m.resolved); i++) { s = advanceDay(s); s.grudges.silverFan = 7; }
const calling = structuredClone(quiet(s));

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5196', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5196/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, board);
  await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(400);
  await p.locator('.jobcard').first().screenshot({ path: `${out}/01-board-against-silver-fan.png` });
  await tap(p, '[data-action="open-job"]'); await p.waitForTimeout(600);
  await p.locator('.grudgeline').scrollIntoViewIfNeeded(); await p.evaluate(() => document.querySelector('.grudgeline').scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: `${out}/02-plan-grudge-line.png` });
  await tap(p, '[data-action="nav"][data-id="city"]'); await p.waitForTimeout(400);
  await tap(p, '[data-action="city-tab"][data-id="factions"]'); await p.waitForTimeout(400);
  await p.evaluate(() => [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Gangs')?.scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/03-whos-who-grudges.png` });
  await load(p, warned);
  await tap(p, '[data-action="nav"][data-id="city"]'); await p.waitForTimeout(500);
  await p.locator('.ops').scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/04-out-now-gang-raid.png` });
  await p.locator('.cm-hit').nth(4).click({ force: true }); await p.waitForTimeout(600); // the Night Market
  await p.locator('.citycard__grudge').scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${out}/05-night-market-card.png` });
  const warn = warned.inbox.find((m) => m.kind === 'raid-warning');
  await tap(p, '[data-action="nav"][data-id="inbox"]'); await p.waitForTimeout(300);
  await p.locator(`[data-action="open-message"][data-id="${warn.id}"]`).first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/06-gang-raid-warning.png` });
  await load(p, calling);
  await tap(p, '[data-action="nav"][data-id="city"]'); await p.waitForTimeout(400);
  await tap(p, '[data-action="raid-answer"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/07-the-call-settle.png` });
  await tap(p, '[data-action="decide"][data-option="hold"]'); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/08-holding-against-collectors.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
