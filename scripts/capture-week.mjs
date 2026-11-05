// Capture (2026-11-04, Phase 1's weekly rhythm): on a phone (390), the top bar with what's due on
// Sunday and Monday's briefing on Today; a job's planning screen with the crew standard and a
// crew lead; the Sunday summary. Run: node scripts/capture-week.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { advanceDay } from '../src/core/time.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let monday = createNewGame({ seed: 21, startCrew: 'fresh' });
monday.crew[1].fame = 'respected';
monday.crew[1].tier = 'veteran';
monday.jobs = [];
addOffer(monday, 'warehouse', { rng: () => 0.5 });
addOffer(monday, 'rent_round', { rng: () => 0.5 });
addOffer(monday, 'queue_duty');
let sunday = monday;
for (let i = 0; i < 6; i++) sunday = advanceDay(sunday);
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5189/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await load(p, monday);
  await p.locator('.weekbrief').scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -120));
  await p.screenshot({ path: `${out}/01-monday-briefing.png` });
  await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/02-board-standards.png` });
  await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  await p.locator('.standard').scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -200));
  await p.screenshot({ path: `${out}/03-plan-standard.png` });
  if (await p.locator('[data-action="toggle-orders"][aria-expanded="false"]').count()) await p.locator('[data-action="toggle-orders"]').first().click(); // The plan's orders fold to one line (2026-11-05): open them first.
  await p.locator('.lead, [data-action="callin"]').first().scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, 150));
  await p.screenshot({ path: `${out}/04-plan-lead.png` });
  await load(p, sunday);
  const week = sunday.inbox.find((m) => m.kind === 'week');
  await p.locator(`[data-action="open-message"][data-id="${week.id}"]`).first().click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/05-sunday-summary.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
