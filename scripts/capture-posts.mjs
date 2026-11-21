// Capture (2026-11-21, security posts): Jobs › Side with this week's posts; a post's plan with two
// runners on it (phone, 390 wide, and landscape 844x390); a post running, with its log; a hit post
// calling in. Builds the states with the game's own core and loads them into the page.
// Run: node scripts/capture-posts.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { CONTRACT, contractsOf, takeContract } from '../src/core/contracts.js';
import { availability } from '../src/core/crew.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const fresh = () => createNewGame({ seed: 21, startCrew: 'fresh' });
const free = (s) => s.crew.filter((o) => availability(s, o).ok);

// A post running three days, and a post that is hit (difficulty raised for the capture only).
let running = fresh();
const g = contractsOf(running).offers.find((o) => o.kind === 'guard');
running = takeContract(running, g.id, free(running).slice(0, 2).map((o) => o.id));
for (let i = 0; i < 3; i++) running = advanceDay(running);
running.inbox = running.inbox.filter((m) => m.kind !== 'contract');
let hit = fresh();
const w = contractsOf(hit).offers.find((o) => o.kind === 'watch');
hit = takeContract(hit, w.id, free(hit).slice(0, 2).map((o) => o.id));
const was = CONTRACT.difficulty; CONTRACT.difficulty = 40; hit = advanceDay(hit); CONTRACT.difficulty = was;

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5191', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5191/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
const toSide = async (p) => { await vis(p, '[data-action="nav"][data-id="jobs"]').click(); await vis(p, '[data-action="jobs-tab"][data-id="side"]').click(); await p.waitForTimeout(200); };
const plan = async (p) => {
  await toSide(p);
  await vis(p, '[data-action="open-post"]').click();
  for (let i = 0; i < 2; i++) await vis(p, '[data-action="post-add"]:not([disabled])').click();
  await p.waitForTimeout(200);
};
try {
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
    await load(p, fresh());
    await toSide(p);
    await p.screenshot({ path: `${out}/01-${tag}-side-posts.png`, fullPage: tag === 'phone' });
    await plan(p);
    await p.screenshot({ path: `${out}/02-${tag}-post-plan.png`, fullPage: tag === 'phone' });
    await load(p, running);
    await toSide(p);
    await p.screenshot({ path: `${out}/03-${tag}-post-running.png`, fullPage: tag === 'phone' });
    await load(p, hit);
    await p.screenshot({ path: `${out}/04-${tag}-post-hit.png`, fullPage: tag === 'phone' });
    await vis(p, '[data-action="open-message"][data-id^="ct-call-"]').click();
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/05-${tag}-post-call.png`, fullPage: tag === 'phone' });
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
