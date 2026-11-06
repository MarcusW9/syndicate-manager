// Capture (2026-11-06, the owner's playtest of the plan screen): on a wide computer (1600), a job being
// planned. The runners strip (each one opens their page); a runner's page opened from it, with
// "Back to the job"; the squad board with each card's × (then one taken off); and the Basin's
// stables plan, the track clear of the stable rows. Then the board's × on a phone (390). Then the
// picker: on a phone (cards in groups), sorted by a stat, and on the computer (the table).
// Run: node scripts/capture-plan-playtest.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { templateById } from '../src/core/jobs.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
const job = s.jobs.find((j) => templateById(j.templateId)?.district === 'basin') ?? s.jobs[0];

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5194', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5194/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, s);
  await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(300);
  await tap(p, `[data-action="open-job"][data-id="${job.id}"]`); await p.waitForTimeout(600);
  await tap(p, '[data-action="joss"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/19-plan-runners-and-board.png` });
  await tap(p, '.runners [data-action="op-link"]'); await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: `${out}/20-runner-page-from-the-job.png` });
  await tap(p, '[data-action="back"]'); await p.waitForTimeout(500);
  await p.locator('.board').scrollIntoViewIfNeeded();
  await p.locator('.board').screenshot({ path: `${out}/21-board-with-x.png` });
  await tap(p, '[data-action="unassign"]'); await p.waitForTimeout(400);
  await p.locator('.board').screenshot({ path: `${out}/22-board-one-taken-off.png` });
  const q = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await load(q, s);
  await tap(q, '[data-action="nav"][data-id="jobs"]'); await q.waitForTimeout(300);
  await tap(q, `[data-action="open-job"][data-id="${job.id}"]`); await q.waitForTimeout(600);
  await tap(q, '[data-action="joss"]'); await q.waitForTimeout(400);
  await q.locator('.board').scrollIntoViewIfNeeded();
  await q.locator('.board').screenshot({ path: `${out}/23-board-with-x-phone.png` });
  // The picker (2026-11-06): the extra inside slot on a phone, then sorted by a stat; then on the computer.
  await tap(q, '.dossiers--inside .dossier.is-empty'); await q.waitForTimeout(500);
  await q.locator('.sheet').screenshot({ path: `${out}/25-picker-phone.png` });
  await tap(q, '.picker__cards [data-action="pick-sort"]:not(.is-on)'); await q.waitForTimeout(400);
  await q.locator('.sheet').screenshot({ path: `${out}/26-picker-phone-sorted.png` });
  await tap(p, '.dossiers--inside .dossier.is-empty'); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/27-picker-desktop.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
