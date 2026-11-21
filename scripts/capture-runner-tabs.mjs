// Capture (2026-11-21, the runner's page in tabs): Overview, Skills, Gear and Career for a runner with
// some history, at 390x844 (full page), 844x390 and 1440x900. Run: node scripts/capture-runner-tabs.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { playWeeks } from '../tests/play.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let { state } = playWeeks(10, 21, undefined, { startCrew: 'fresh' }); // ten weeks in: a record, milestones, history
if (!state) state = createNewGame({ seed: 21, startCrew: 'fresh' });
state.activeMission = null;
state.inbox = state.inbox.map((m) => ({ ...m, blocking: false, resolved: m.blocking ? true : m.resolved }));
const op = [...state.crew].sort((a, b) => (b.record?.jobs ?? 0) - (a.record?.jobs ?? 0))[0];

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5192', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5192/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
try {
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }], ['desktop', { width: 1440, height: 900 }]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
    await load(p, state);
    await vis(p, '[data-action="nav"][data-id="crew"]').click();
    await vis(p, `[data-action="open-op"][data-id="${op.id}"]`).click();
    await p.waitForTimeout(300);
    for (const [i, tab] of ['overview', 'skills', 'gear', 'career'].entries()) {
      await vis(p, `[data-action="op-tab"][data-id="${tab}"]`).click();
      await p.waitForTimeout(250);
      await p.screenshot({ path: `${out}/0${i + 1}-${tag}-${tab}.png`, fullPage: tag === 'phone' });
    }
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
