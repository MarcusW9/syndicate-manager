// Capture (2026-11-06, opening jobs): on a phone (390), a tong welcome in the Night Market. Madam
// Rao's message asking the favour; Back Rent on the board flagged "Opens the Night Market hall"; its
// plan's favour line; Crew › Halls saying she wants a favour first; and, once it's done, the hall
// offered and ready to open.
// Run: node scripts/capture-opening-jobs.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { introduceHalls, openingOf, openingResult } from '../src/core/halls.js';
import { HALL_SITES } from '../src/data/halls.js';
import { adjustTrust } from '../src/core/clients.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.reputation = HALL_SITES.nightMarket.rep;
adjustTrust(s, 'rao', HALL_SITES.nightMarket.trust - 50);
s.cash = 20000;
s.jobs = [];
introduceHalls(s);
const asked = structuredClone(s);
openingResult(s, openingOf(s, 'nightMarket').jobId, 'completed');
s.jobs = s.jobs.filter((j) => j.templateId !== 'back_rent');
const done = s;

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5201', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5201/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const halls = async (p) => { await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300); await p.evaluate(() => { [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Open a hall')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130); }); await p.waitForTimeout(200); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, asked);
  const msg = asked.inbox.find((m) => m.kind === 'opening');
  await p.locator(`[data-action="open-message"][data-id="${msg.id}"]`).first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/01-rao-asks-a-favour.png` });
  await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(400);
  await p.locator('.jobcard').first().screenshot({ path: `${out}/02-board-opens-the-hall.png` });
  await tap(p, '[data-action="open-job"]'); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.openingline')?.scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: `${out}/03-plan-favour-line.png` });
  await halls(p);
  await p.screenshot({ path: `${out}/04-halls-favour-first.png` });
  await load(p, done);
  await halls(p);
  await p.screenshot({ path: `${out}/05-halls-ready-to-open.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
