// Capture (2026-11-04): the job's planning screen with a crew picked: the client line (background
// on tap), "What they'll likely meet" grouped by zone, and the plan bar's notes, at phone, iPad and
// desktop widths. Run: node scripts/capture-plan-read.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const s = createNewGame({ seed: 21, startCrew: 'fresh' });
for (const op of s.crew.slice(0, 2)) op.condition.fatigue = 70; // warnings for the plan bar's notes
const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5190', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h, tag] of [[390, 844, 'phone'], [1024, 1366, 'ipad'], [1440, 900, 'desktop']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await p.goto('http://localhost:5190/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
    for (let i = 0; i < 3; i++) {
      const slot = p.locator('.board .dossier.is-empty[data-id^="in:"]').first();
      if (!(await slot.count())) break;
      await slot.click();
      await p.locator('.cand:not(.is-on):not(.is-placed):not([disabled])').first().click();
      await p.waitForTimeout(150);
    }
    if (await p.locator('[data-action="toggle-meet"][aria-expanded="false"]').count()) await p.locator('[data-action="toggle-meet"]').click();
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/plan-${tag}.png`, fullPage: true });
    await p.locator('[data-action="client-info"]').first().click().catch(() => {});
    if (await p.locator('[data-action="plan-why"]').count()) await p.locator('[data-action="plan-why"]').click();
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/plan-${tag}-opened.png`, fullPage: true });
    await p.close();
  }
} finally { await b.close(); process.kill(-srv.pid); }
