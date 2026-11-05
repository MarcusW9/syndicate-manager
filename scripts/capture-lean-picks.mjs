// Capture (2026-11-05, after the playtest): Joss's lean picks and what a job gives each runner.
// A crew with one veteran star; a rookie job's plan (Joss leaves the star home) and its picker sheet
// with each candidate's few words. Phone (390). Run: node scripts/capture-lean-picks.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 1, startCrew: 'fresh' });
const star = s.crew[0];
star.tier = 'veteran'; star.fame = 'elite';
for (const k of Object.keys(star.stats)) star.stats[k] = Math.min(20, star.stats[k] + 6);
s.crew[1].stats[Object.keys(s.crew[1].stats).find((k) => k === 'medical') ?? 'medical'] = 14;
s.jobs = []; addOffer(s, 'clinic');
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5189/');
  await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, s);
  await p.reload(); await p.waitForTimeout(400);
  await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/01-board.png` });
  await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  await p.locator('.board').scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${out}/02-plan-lean.png` });
  await p.locator('.board .dossier[data-id^="in:"]').first().click();
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/03-picker-gains.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
