// Capture (2026-11-22): Tong › Armoury's Stash in sell mode (option C: tick several, sell them in one go), with two
// ticked; and Today's out line with runners on a security post (its own line, to Jobs › Side). 390x844 (full page),
// 844x390 and 1440x900, 1x. Run: node scripts/capture-sell-mode.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { makeItem } from '../src/core/gear.js';
import { contractsOf, takeContract } from '../src/core/contracts.js';
import { availability } from '../src/core/crew.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let state = createNewGame({ seed: 21, startCrew: 'fresh' });
state.cash = 5050;
state.stash = [['deck', 'verified'], ['vest', 'standard'], ['rifle', 'verified'], ['rifle', 'standard'], ['pistol', 'verified'], ['pistol', 'custom'], ['medkit', 'standard'], ['picks', 'standard']]
  .map(([type, tier]) => makeItem(state, type, tier));
const o = contractsOf(state).offers[0];
state = takeContract(state, o.id, state.crew.filter((op) => availability(state, op).ok).slice(0, 2).map((op) => op.id));

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5195', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5195/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
try {
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }], ['desktop', { width: 1440, height: 900 }]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
    const full = tag !== 'landscape';
    await load(p, state);
    await p.screenshot({ path: `${out}/01-${tag}-today-posts.png`, fullPage: full });
    await vis(p, '[data-action="nav"][data-id="tong"]').click();
    await vis(p, '[data-action="tong-tab"][data-id="armoury"]').click();
    await vis(p, '[data-action="armoury-tab"][data-id="stash"]').click();
    await vis(p, '[data-action="sell-mode"]').click();
    await p.waitForTimeout(200);
    for (let i = 0; i < 2; i++) await p.locator('[data-action="sell-tick"]:not(.is-on)').filter({ visible: true }).last().click();
    await p.waitForTimeout(250);
    await p.screenshot({ path: `${out}/02-${tag}-sell-mode.png`, fullPage: full });
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
