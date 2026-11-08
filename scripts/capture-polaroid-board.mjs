// Capture (2026-11-08, the squad board as polaroids over an inventory on a gear mat): the board on a
// phone (390) and a computer (1600, overwatch with their kit), the approach's tint on a loud run, an
// empty recommended slot pulsing, and the mat's flash when a change moves the risk. Adapted from the
// 'plan' part of scripts/capture-playtest-1107.mjs, with the same crew and gear.
// Run: node scripts/capture-polaroid-board.mjs <out dir> [first number, default 30]
import { createNewGame } from '../src/core/state.js';
import { loadoutOf } from '../src/core/gear.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out, from = '30'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
const kits = [['rifle', 'pistol'], ['drone'], ['deck', 'medkit'], ['pistol', 'vest'], []];
s.crew.forEach((op, i) => { op.gear = loadoutOf(s, kits[i % kits.length]); });
const job = s.jobs[0];

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5196', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5196/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
let n = Number(from);
const name = (what) => `${out}/${String(n++).padStart(2, '0')}-${what}.png`;
const openPlan = async (p) => {
  await load(p, s);
  await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(300);
  await tap(p, `[data-action="open-job"][data-id="${job.id}"]`); await p.waitForTimeout(600);
  await tap(p, '[data-action="joss"]'); await p.waitForTimeout(400);
};
try {
  // A phone: four columns across, the first row of gear, "+N" for the rest.
  const q = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  q.on('pageerror', (e) => console.error('page error', e.message));
  await openPlan(q);
  await q.locator('.board').scrollIntoViewIfNeeded();
  await q.locator('.board').screenshot({ path: name('board-phone') });
  // The approach's colour: a loud run washes the mat red, LOUD in the corner.
  await tap(q, '[data-action="approach"][data-id="loud"]'); await q.waitForTimeout(900);
  await q.locator('.board').screenshot({ path: name('board-phone-loud') });
  // One taken off: the risk moves, so the mat flashes; then the empty recommended slot pulses.
  await tap(q, '[data-action="unassign"][data-id="in:1"]'); await q.waitForTimeout(60);
  await q.locator('.board').screenshot({ path: name('board-phone-flash') });
  await q.waitForTimeout(1100);
  await q.locator('.board').screenshot({ path: name('board-phone-empty') });

  // A computer: 104px columns, the whole 2×2 inventory with names, overwatch with their kit first.
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await openPlan(p);
  await tap(p, '[data-action="pick-slot"][data-id="over"]'); await p.waitForTimeout(400);
  await tap(p, '.sheet [data-action="assign"]:not([disabled])'); await p.waitForTimeout(1000);
  await p.screenshot({ path: name('plan-desktop') });
  await p.locator('.board').screenshot({ path: name('board-desktop') });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
