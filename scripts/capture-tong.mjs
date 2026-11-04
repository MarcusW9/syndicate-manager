// Capture (2026-11-04): the tong's rank in the top bar, closed and tapped open (Joss's line), on a
// phone (390) and a computer (1440). Run: node scripts/capture-tong.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h, tag] of [[390, 844, 'phone'], [1440, 900, 'desktop']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.goto('http://localhost:5189/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    await p.waitForTimeout(300);
    const clip = { x: 0, y: 0, width: w, height: 220 };
    await p.screenshot({ path: `${out}/${tag}-01-rank.png`, clip });
    await p.locator('[data-action="info"][data-id="tong"]').click();
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/${tag}-02-explainer.png`, clip });
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
