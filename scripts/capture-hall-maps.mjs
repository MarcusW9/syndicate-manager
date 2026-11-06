// Capture (2026-11-05, a hall map per district): on a phone (390), a police raid held in each
// district's own hall: Old Town's room above the noodle shop, the Night Market's rooms above the sari
// shop, the Docks' container office, the Basin's flat over the tack workshop, the Glass Heights
// service floor. Each district runs at heat 9 until the raid comes; we hold the hall.
// Run: node scripts/capture-hall-maps.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { setHeat } from '../src/core/heat.js';
import { advanceDay } from '../src/core/time.js';
import { syncHalls } from '../src/core/halls.js';
import { HALL_SITES } from '../src/data/halls.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const quiet = (st) => { for (const m of st.inbox) if (m.blocking && m.kind !== 'raid') { m.blocking = false; m.resolved = true; } return st; };
const calling = (d) => {
  let s = createNewGame({ seed: 21, startCrew: 'fresh' });
  s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
  if (d !== 'oldTown') {
    s.halls.push({ district: d, beds: 2, rent: HALL_SITES[d].rent, level: 1, opened: 1 });
    syncHalls(s);
    s.crew[0].hall = d; s.crew[1].hall = d;
  }
  s.cash = 14000;
  for (let i = 0; i < 60 && !s.inbox.some((m) => m.kind === 'raid' && !m.resolved); i++) { setHeat(s, d, 9); s = advanceDay(s); setHeat(s, d, 9); quiet(s); }
  if (!s.inbox.some((m) => m.kind === 'raid' && !m.resolved)) throw new Error(`no raid on the ${d} hall`);
  return quiet(s);
};
const days = Object.fromEntries(Object.keys(HALL_SITES).map((d) => [d, calling(d)]));

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5197', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5197/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  let n = 1;
  for (const [d, st] of Object.entries(days)) {
    await load(p, st);
    await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(400);
    await tap(p, '[data-action="raid-answer"]'); await p.waitForTimeout(400);
    await tap(p, '[data-action="decide"][data-option="hold"]'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-hold-${d}.png` });
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
