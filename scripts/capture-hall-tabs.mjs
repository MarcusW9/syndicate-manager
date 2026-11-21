// Capture (2026-11-21, the hall page in tabs): Old Town's hall at Overview, Crew, Build and Grow with a raid warned and
// two runners out and due back, at 390x844 (full page), 844x390 and 1440x900. Run: node scripts/capture-hall-tabs.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { followHome } from '../src/core/raids.js';
import { HOME_HALL } from '../src/data/halls.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const state = createNewGame({ seed: 21, startCrew: 'fresh' });
state.cash = 39100;
state.raidCallSeen = true;
followHome(state, HOME_HALL, 'police', 1);
const raid = state.raids.at(-1);
const [a, b] = state.crew;
state.sideOut = [{ taskId: 'x', crewIds: [a.id, b.id], returnDay: raid.day - 1 }];
a.condition.awayUntil = b.condition.awayUntil = raid.day - 1;

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5195', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const br = await chromium.launch();
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
try {
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }], ['desktop', { width: 1440, height: 900 }]]) {
    const p = await br.newPage({ viewport: vp, deviceScaleFactor: 1 });
    await p.goto('http://localhost:5195/');
    await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, state);
    await p.reload(); await p.waitForTimeout(400);
    await vis(p, '[data-action="nav"][data-id="tong"]').click();
    await vis(p, '[data-action="tong-tab"][data-id="halls"]').click().catch(() => {});
    await vis(p, `[data-action="hall-page"][data-id="${HOME_HALL}"]`).click();
    for (const [i, tab] of ['overview', 'crew', 'build', 'grow'].entries()) {
      await vis(p, `[data-action="hall-tab"][data-id="${tab}"]`).click();
      await p.waitForTimeout(250);
      await p.screenshot({ path: `${out}/0${i + 1}-${tag}-${tab}.png`, fullPage: tag !== 'landscape' });
    }
    await p.close();
  }
} finally {
  await br.close();
  process.kill(-srv.pid);
}
