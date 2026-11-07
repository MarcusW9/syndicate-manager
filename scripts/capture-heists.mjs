// Capture (2026-11-07, heists, slice A1): on a phone (390), Madam Rao's heist, The Big Table, a
// week in: one prep step done, one gone wrong twice (buyable), one on the board. Her message; Today's
// Monday line; Ops with the heist at the top; a prep job's board flag and its plan line; then the
// finale's week: the finale on the board and its plan with what was prepared. One desktop view of Ops.
// Run: node scripts/capture-heists.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { introduceHeists, heistOf, heistResult, finaleWeekStart, tickHeists } from '../src/core/heists.js';
import { heistById } from '../src/data/heists.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const RAO = heistById('raoTable');
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.reputation = RAO.gate.rep;
s.cash = 14000;
s.jobs = [];
introduceHeists(s);
const take = (step) => { const id = heistOf(s, 'raoTable').steps[step].jobId; s.jobs = s.jobs.filter((j) => j.id !== id); return id; };
heistResult(s, take('faces'), 'completed');
heistResult(s, take('pitBoss'), 'aborted'); // asked again with another job
heistResult(s, take('pitBoss'), 'loss'); // gone wrong twice: buy it or do without
s.inbox = s.inbox.filter((m) => m.kind === 'heist');
const week1 = s;

const fin = structuredClone(s);
fin.day = finaleWeekStart(heistOf(fin, 'raoTable'));
fin.jobs = fin.jobs.filter((j) => !j.heistStep);
tickHeists(fin);

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5202', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5202/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, week1);
  const msg = week1.inbox.find((m) => m.kind === 'heist');
  await p.locator(`[data-action="open-message"][data-id="${msg.id}"]`).first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/01-rao-offers-the-heist.png` });
  await tap(p, '[data-action="nav"][data-id="inbox"]'); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.weekbrief')?.scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: `${out}/02-today-monday-line.png` });
  await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector('.heist')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); });
  await p.screenshot({ path: `${out}/03-ops-heist.png` });
  await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('.jobcard')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/04-board-prep-flag.png` });
  await tap(p, '.heist__go[data-action="open-job"], [data-action="open-job"]'); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.heistline')?.scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: `${out}/05-plan-prep-line.png` });
  await load(p, fin);
  await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector('.heist')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); });
  await p.screenshot({ path: `${out}/06-ops-finale-up.png` });
  await tap(p, '.heist__finale'); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.heistline')?.scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: `${out}/07-plan-finale.png` });
  const d = await b.newPage({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 });
  d.on('pageerror', (e) => console.error('page error', e.message));
  await load(d, week1);
  await tap(d, '[data-action="nav"][data-id="ops"]'); await d.waitForTimeout(600);
  await d.screenshot({ path: `${out}/08-desktop-ops.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
