// Capture (2026-11-06, a runner's stat tiles: each progress bar on its tile's bottom edge): a runner
// with a trait note on two stats and "career +1" on another, on a phone (390) and a computer (1280).
// Run: node scripts/capture-stat-bars.mjs <out dir>
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import { ensureRecord } from '../src/core/record.js';

const out = process.argv[2];
mkdirSync(out, { recursive: true });
const st = createNewGame({ seed: 21, startCrew: 'fresh' });
st.inbox = st.inbox.filter((m) => m.id !== 'welcome');
const op = st.crew[0];
ensureRecord(op);
op.traits = [...new Set([...op.traits, 'hothead'])];
op.startStats = { ...op.stats, tech: op.stats.tech - 1 };
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5190', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h, n, file] of [[390, 1600, 'phone', 19], [1280, 800, 'desktop', 20]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await p.goto('http://localhost:5190/');
    await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st);
    await p.reload(); await p.waitForTimeout(500);
    await p.locator('[data-action="nav"][data-id="crew"]').filter({ visible: true }).first().click(); await p.waitForTimeout(300);
    await p.locator(`[data-action="open-op"][data-id="${op.id}"]`).filter({ visible: true }).first().click(); await p.waitForTimeout(500);
    await p.locator('.opgrid dl.stats').first().screenshot({ path: `${out}/${file}-stat-tiles-${n}.png` });
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
