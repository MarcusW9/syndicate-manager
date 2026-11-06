// Capture (2026-11-06, the armoury drawn, then the carry grid): on a phone (390) and a computer
// (1280), a stash holding every build of every item, street and pro, and a runner wearing a jacket
// and two implants, with a kite drone, a heat veil and a revolver in the bag; then the sidearm picked
// up (the cells it fits lit) and the sheet for an empty cell (what fits there). The armoury (the stash, the buy rows), the runner's gear page.
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
// The carry grid (save v45): worn armour, two sockets, and a bag with a drone, a sidearm and a ghost kit.
op.gear = {
  armour: { uid: `g${n++}`, type: 'vest', tier: 'street', look: { frame: 'jacket' } },
  implants: [{ uid: `g${n++}`, type: 'reflex', tier: 'pro', look: { frame: 'harness' } }, { uid: `g${n++}`, type: 'cortex', tier: 'street', look: { frame: 'chip' } }],
  bag: [
    { item: { uid: `g${n++}`, type: 'drone', tier: 'pro', look: { frame: 'kite' } }, x: 0, y: 0 },
    { item: { uid: `g${n++}`, type: 'picks', tier: 'street', look: { frame: 'veil' } }, x: 3, y: 0 },
    { item: { uid: `g${n++}`, type: 'pistol', tier: 'street', look: { frame: 'revolver', finish: 'blued' }, quirk: 'none', name: 'Old Tiger' }, x: 0, y: 1 },
  ],
};
const op2 = s.crew[1];
op2.gear = { armour: null, implants: [], bag: [{ item: { uid: `g${n++}`, type: 'deck', tier: 'street', look: { frame: 'case' } }, x: 0, y: 0 }] };
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
    if (tag === 'phone') {
      // Pick up the sidearm: the cells it fits light up; then tap the empty cell for what fits there.
      await tap(p, '.bag__item[aria-label^="Old Tiger"]'); await p.waitForTimeout(300);
      await p.evaluate(() => document.querySelector('.bag')?.scrollIntoView({ block: 'center' }));
      await p.screenshot({ path: `${out}/24-bag-picked-up-phone.png` });
      await tap(p, '.bag__item[aria-label^="Old Tiger"]'); await p.waitForTimeout(300);
      await tap(p, '.bag__cell'); await p.waitForTimeout(400);
      await p.screenshot({ path: `${out}/25-bag-what-fits-phone.png` });
      await tap(p, '.sheet__x'); await p.waitForTimeout(200);
    }
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
