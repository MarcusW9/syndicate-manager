// Capture (2026-11-21, the armoury in sub-tabs): Tong › Armoury's Stash (by kind, best first), Carried (a row
// per runner) and Shop, with a stash like the owner's playtest (a dozen pieces across kinds and tiers), at
// 390x844 (full page), 844x390 and 1440x900. Run: node scripts/capture-armoury-tabs.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { makeItem } from '../src/core/gear.js';
import { arm } from '../tests/play.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const state = createNewGame({ seed: 21, startCrew: 'fresh' });
state.cash = 5050;
state.stash = [['deck', 'verified'], ['reflex', 'verified'], ['deck', 'standard'], ['vest', 'standard'], ['rifle', 'verified'], ['rifle', 'standard'],
  ['pistol', 'verified'], ['pistol', 'custom'], ['vest', 'verified'], ['drone', 'standard'], ['rifle', 'premium'], ['medkit', 'standard'], ['cortex', 'standard']]
  .map(([type, tier]) => { try { return makeItem(state, type, tier); } catch { return null; } }).filter(Boolean);
arm(state, state.crew[0].id, 'rifle', 'vest');
arm(state, state.crew[1].id, 'pistol');

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5194', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5194/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
try {
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }], ['desktop', { width: 1440, height: 900 }]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
    await load(p, state);
    await vis(p, '[data-action="nav"][data-id="tong"]').click();
    await vis(p, '[data-action="tong-tab"][data-id="armoury"]').click();
    for (const [i, tab] of ['stash', 'carried', 'shop'].entries()) {
      await vis(p, `[data-action="armoury-tab"][data-id="${tab}"]`).click();
      await p.waitForTimeout(250);
      await p.screenshot({ path: `${out}/0${i + 1}-${tag}-${tab}.png`, fullPage: tag !== 'landscape' });
    }
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
