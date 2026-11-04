// Capture (2026-11-04): a threat-4 job's planning screen on a phone, scrolled to "Call me in…",
// where "never" (send them off hands-off) is now offered for every job, not only rookie work.
// Run: node scripts/capture-handsoff.mjs <out dir> [job id]
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out, job = 'warehouse'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.jobs = [];
addOffer(s, job);
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
  await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/01-plan-top.png` });
  await p.locator('[data-action="callin"]').first().scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, 200));
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/02-call-me-in.png` });
  const never = p.locator('[data-action="callin"][data-id="never"]');
  if (await never.count()) { await never.click(); await p.waitForTimeout(200); await p.locator('[data-action="callin"]').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 200)); await p.screenshot({ path: `${out}/03-never-picked.png` }); }
  console.log('never offered:', await never.count());
} finally {
  await b.close();
  process.kill(-srv.pid);
}
