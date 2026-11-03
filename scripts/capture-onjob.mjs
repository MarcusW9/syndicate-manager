// A job in progress with the tabs stepped aside and the larger site map (2026-11-03), at phone,
// iPad portrait, iPad landscape and desktop widths. Run: node scripts/capture-onjob.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const out = process.argv[2];
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5196', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h, tag] of [[390, 844, 'phone'], [820, 1180, 'ipad-portrait'], [1180, 820, 'ipad-landscape'], [1440, 900, 'desktop']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 900 ? 2 : 1 });
    await p.goto('http://localhost:5196/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="joss"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="start-job"]').filter({ visible: true }).first().click();
    await p.waitForTimeout(5000);
    await p.screenshot({ path: `${out}/onjob-${tag}.png` });
  }
} finally { await b.close(); process.kill(-srv.pid); }
