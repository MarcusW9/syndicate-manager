// Capture (2026-11-06, the armoury drawn: the drone and the deck, then the rest, square): on a phone
// (390) and a computer (1280), a stash holding every build of every item, street and pro, and a
// runner carrying a pro kite drone, a jacket, and a reflex harness. The armoury (the stash, the buy rows), the runner's gear page.
// Run: node scripts/capture-gear-art.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { TOOL_FRAMES } from '../src/data/gearLooks.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.cash = 40000;
let n = 100;
s.stash = [];
for (const [type, frames] of Object.entries(TOOL_FRAMES)) for (const frame of Object.keys(frames)) for (const tier of ['street', 'pro']) s.stash.push({ uid: `g${n++}`, type, tier, look: { frame } });
const op = s.crew[0];
op.gear = { ...op.gear, tool: { uid: `g${n++}`, type: 'drone', tier: 'pro', look: { frame: 'kite' } }, armour: { uid: `g${n++}`, type: 'vest', tier: 'street', look: { frame: 'jacket' } }, implant: { uid: `g${n++}`, type: 'reflex', tier: 'pro', look: { frame: 'harness' } } };
const op2 = s.crew[1];
op2.gear = { ...op2.gear, tool: { uid: `g${n++}`, type: 'deck', tier: 'street', look: { frame: 'case' } } };
s.gearSeq = n;

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5193', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5193/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  for (const [w, h, tag, first] of [[390, 844, 'phone', 19], [1280, 800, 'desktop', 22]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await load(p, s);
    await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300);
    await tap(p, '[data-action="open-armoury"]'); await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/${first}-armoury-stash-${tag}.png`, fullPage: tag === 'phone' ? false : true });
    if (tag === 'phone') await p.evaluate(() => [...document.querySelectorAll('h3')].find((x) => /Tool/i.test(x.textContent))?.scrollIntoView({ block: 'start' }));
    if (tag === 'phone') await p.screenshot({ path: `${out}/${first + 1}-armoury-buy-tools-${tag}.png` });
    await tap(p, '[data-action="back"]'); await p.waitForTimeout(300);
    await tap(p, `[data-action="open-op"][data-id="${op.id}"]`); await p.waitForTimeout(500);
    await p.evaluate(() => [...document.querySelectorAll('h2')].find((x) => /Gear/i.test(x.textContent))?.scrollIntoView({ block: 'start' }));
    await p.screenshot({ path: `${out}/${tag === 'phone' ? first + 2 : first + 1}-runner-gear-${tag}.png` });
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
