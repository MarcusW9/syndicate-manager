// Capture (2026-11-20, raid end card and the bad-headcount twist). Derived from capture-gang-raids.mjs.
// Run: node scripts/capture-raid-end.mjs <out dir>
// (older header follows) Capture (2026-11-05, gang raids): on a phone (390), a Street tong with halls in Old Town and the
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

// A job with the "More guards than briefed" twist, to play live.
const twisted = createNewGame({ seed: 21, startCrew: 'fresh' });
twisted.inbox = twisted.inbox.filter((m) => m.id !== 'welcome');
twisted.jobs = [];
addOffer(twisted, 'chrome', { rng: () => 0.5 });
twisted.jobs[0].twist = 'twist_more_guards';

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5196', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5196/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(600); };
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
const tap = (p, sel) => vis(p, sel).click();
const has = async (p, sel) => (await p.locator(sel).filter({ visible: true }).count()) > 0;
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  // 1. Hold the hall, play to the end card.
  await load(p, calling);
  for (let i = 0; i < 400 && !(await has(p, '.finale')); i++) {
    if (await has(p, '[data-action="watch-speed"]')) { await tap(p, '[data-action="watch-speed"]'); continue; }
    if (await has(p, '[data-action="fight-hand-off"]')) { await tap(p, '[data-action="fight-hand-off"]'); continue; }
    if (await has(p, '[data-action="pending"]:not([data-id="out"])')) { await tap(p, '[data-action="pending"]:not([data-id="out"])'); continue; }
    await p.waitForTimeout(400);
  }
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${out}/01-raid-pulled-back-end-card.png` });
  await tap(p, '[data-action="finale-close"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/02-raid-pulled-back-feed.png` });
  // 2. The twist at the door, then the abort.
  await load(p, twisted);
  await tap(p, '[data-action="nav"][data-id="jobs"]'); await tap(p, '[data-action="open-job"]');
  await tap(p, '[data-action="joss"]');
  const fold = vis(p, '[data-action="toggle-orders"][aria-expanded="false"]'); if (await fold.count()) await fold.click();
  const live = vis(p, '[data-action="mode"][data-id="live"]'); if (await live.count()) await live.click();
  await tap(p, '[data-action="start-job"]');
  await tap(p, '[data-action="watch-speed"]'); // once: it cycles the speed
  for (let i = 0; i < 240 && !(await has(p, '[data-action="choose"][data-id="abort"]')); i++) {
    if (await has(p, '[data-action="finale-close"]')) break;
    await p.waitForTimeout(500);
  }
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/03-twist-at-the-door.png` });
  if (await has(p, '[data-action="choose"][data-id="abort"]')) {
    await tap(p, '[data-action="choose"][data-id="abort"]');
    for (let i = 0; i < 200 && !(await has(p, '.finale')); i++) await p.waitForTimeout(400);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/04-twist-abort-end-card.png` });
    await tap(p, '[data-action="finale-close"]'); await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/05-twist-abort-report.png` });
  } else console.error('twist abort choice never appeared');
} finally {
  await b.close();
  process.kill(-srv.pid);
}
