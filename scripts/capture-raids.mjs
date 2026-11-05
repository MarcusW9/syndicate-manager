// Capture (2026-11-05, raids on the halls): on a phone (390), a Street tong with halls in Old Town
// and the Docks, the Docks at heat 9. A raid is warned for the Docks hall; then the day comes.
// Run: node scripts/capture-raids.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { setHeat } from '../src/core/heat.js';
import { advanceDay } from '../src/core/time.js';
import { openRaids } from '../src/core/raids.js';
import { syncHalls } from '../src/core/halls.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// A tong with a second hall in the Docks, two of ours living there, and the Docks running hot.
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.halls.push({ district: 'docks', beds: 2, rent: 1200, level: 1, opened: 1 });
syncHalls(s);
s.crew[0].hall = 'docks';
s.crew[1].hall = 'docks';
s.cash = 14000;
for (let i = 0; i < 40 && !openRaids(s).length; i++) { setHeat(s, 'docks', 9); s = advanceDay(s); setHeat(s, 'docks', 9); }
// Other news the weeks brought (the fixer's notice about the Docks) is set aside: this is about the raid.
const quiet = (st) => { for (const m of st.inbox) if (m.blocking && m.kind !== 'raid') { m.blocking = false; m.resolved = true; } return st; };
quiet(s);
const warned = structuredClone(s);
for (let i = 0; i < 6 && !s.inbox.some((m) => m.kind === 'raid' && !m.resolved); i++) { s = advanceDay(s); setHeat(s, 'docks', 9); }
const calling = structuredClone(quiet(s));

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5194', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => {
  await p.goto('http://localhost:5194/');
  await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st);
  await p.reload(); await p.waitForTimeout(500);
};
const nav = (p, id) => p.locator(`[data-action="nav"][data-id="${id}"]`).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, warned);
  await p.screenshot({ path: `${out}/01-today-raid-line.png` });
  const warn = warned.inbox.find((m) => m.kind === 'raid-warning');
  await p.locator(`[data-action="open-message"][data-id="${warn.id}"]`).first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/02-raid-warning.png` });
  await nav(p, 'city'); await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/03-city-map-ring.png` });
  await p.locator('.ops').scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/04-out-now-raid.png` });

  await load(p, calling);
  await nav(p, 'city'); await p.waitForTimeout(500);
  await p.locator('.ops').scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/05-at-the-door.png` });
  await p.locator('[data-action="raid-answer"]').first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/06-the-call.png` });
  await p.locator('[data-action="decide"][data-option="hold"]').first().click(); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/07-holding-the-hall.png` });
  console.log(await p.evaluate(() => document.querySelector('main')?.innerText.slice(0, 600)));
} finally {
  await b.close();
  process.kill(-srv.pid);
}
