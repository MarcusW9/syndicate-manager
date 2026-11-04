// Capture (2026-11-04): jobs taking a range of days. The job board and a 4-day Penthouse Heist's
// planning header on a phone (390), showing its days and pay. Run: node scripts/capture-job-days.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.jobs = [];
for (let i = 0; i < 40 && !s.jobs.some((j) => j.templateId === 'penthouse' && j.days === 4); i++) { s.jobs = []; s.jobSeq = i * 7; addOffer(s, 'penthouse', { rng: () => 0.5 }); }
addOffer(s, 'warehouse', { rng: () => 0.5 });
addOffer(s, 'clinic');
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5189/');
  await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
  await p.reload();
  await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/01-board.png` });
  await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/02-plan-4-days.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
