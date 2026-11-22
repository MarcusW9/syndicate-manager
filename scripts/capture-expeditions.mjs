// Capture (2026-11-22, expeditions: the adventure log, slice 2): Jobs › Trips with the three goals; the plan for a
// weapon hunt with two picked; two trips out (one on day 4 with its log opened); a deal gone wrong calling in; the
// report when a weapon hunt comes home. Builds the states with the game's own core and loads them into the page.
// Run: node scripts/capture-expeditions.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { sendExpedition, expeditionsOut } from '../src/core/expeditions.js';
import { resolveDecision } from '../src/core/decisions.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const fresh = (seed) => createNewGame({ seed, startCrew: 'fresh' });
const call = (s) => s.inbox.find((m) => m.kind === 'expedition' && !m.resolved);

// Two out: a weapon hunt on day 4 and a cash run on day 2.
let two = null;
for (let seed = 1; seed < 40 && !two; seed++) {
  let s = fresh(seed);
  s = sendExpedition(s, { goal: 'weapon', district: 'docks', crewIds: s.crew.slice(0, 2).map((o) => o.id) });
  s = advanceDay(s); s = advanceDay(s);
  s = sendExpedition(s, { goal: 'cash', district: 'nightMarket', crewIds: s.crew.slice(2, 3).map((o) => o.id) });
  s = advanceDay(s); s = advanceDay(s);
  if (expeditionsOut(s).length === 2 && !call(s)) two = s;
}
// A call, and a weapon hunt that came home with the piece.
let calling = null;
let home = null;
for (let seed = 1; seed < 80 && (!calling || !home); seed++) {
  let s = fresh(seed);
  s = sendExpedition(s, { goal: 'weapon', district: seed % 2 ? 'docks' : 'nightMarket', crewIds: s.crew.slice(0, 2).map((o) => o.id) });
  for (let i = 0; i < 8 && expeditionsOut(s).length && !call(s); i++) s = advanceDay(s);
  if (call(s)) { calling ??= s; continue; }
  const r = s.inbox.find((m) => m.timeline?.expedition?.outcome === 'met');
  if (r && !home) home = { state: s, id: r.id };
}

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5194', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5194/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
const toTrips = async (p) => { await vis(p, '[data-action="nav"][data-id="jobs"]').click(); await vis(p, '[data-action="jobs-tab"][data-id="expeditions"]').click(); await p.waitForTimeout(200); };
try {
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
    const full = tag === 'phone';
    await load(p, fresh(21));
    await toTrips(p);
    await p.screenshot({ path: `${out}/01-${tag}-trips.png`, fullPage: full });
    await vis(p, '[data-action="exp-open"][data-id="weapon"]').click();
    for (let i = 0; i < 2; i++) await vis(p, '[data-action="exp-add"]:not([disabled])').click();
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/02-${tag}-weapon-plan.png`, fullPage: full });
    await load(p, two);
    await toTrips(p);
    await vis(p, '.crewsout__job.is-exp .advlog > summary').click();
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/03-${tag}-two-out-log.png`, fullPage: full });
    await load(p, calling);
    await vis(p, '[data-action="open-message"][data-id^="exp-call-"]').click();
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/04-${tag}-call.png`, fullPage: full });
    await load(p, home.state);
    await vis(p, `[data-action="open-message"][data-id="${home.id}"]`).click();
    await p.waitForTimeout(3500);
    await p.screenshot({ path: `${out}/05-${tag}-report.png`, fullPage: full });
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
