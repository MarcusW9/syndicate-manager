// Capture (2026-11-05, the landmarks off the map): on a phone (390), a Street tong with halls in Old
// Town and the Night Market, the Silver Fan's grudge at 7. Crew › Halls with each hall's landmark
// (the Night Market's glowing red for the raid coming, the halls not yet opened dim); the raid in
// Out now; the warning; the call at the door.
// Run: node scripts/capture-landmarks.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { openRaids } from '../src/core/raids.js';
import { syncHalls } from '../src/core/halls.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.halls.push({ district: 'nightMarket', beds: 2, rent: 1000, level: 1, opened: 1 });
syncHalls(s);
s.crew[0].hall = 'nightMarket';
s.crew[1].hall = 'nightMarket';
s.cash = 14000;
s.grudges = { redLanterns: 2, silverFan: 7 };
s.jobs = [];
for (let i = 0; i < 40 && !openRaids(s).length; i++) { s.grudges.silverFan = 7; s = advanceDay(s); s.grudges.silverFan = 7; }
const quiet = (st) => { for (const m of st.inbox) if (m.blocking && m.kind !== 'raid') { m.blocking = false; m.resolved = true; } return st; };
const warned = structuredClone(quiet(s));
for (let i = 0; i < 6 && !s.inbox.some((m) => m.kind === 'raid' && !m.resolved); i++) { s = advanceDay(s); s.grudges.silverFan = 7; }
const calling = structuredClone(quiet(s));

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5198', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5198/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, warned);
  await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Halls')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -130); });
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/01-crew-halls.png` });
  await tap(p, '[data-action="nav"][data-id="city"]'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.crewsout__job.is-raid').scrollIntoView({ block: 'center' })); await p.waitForTimeout(200);
  await p.locator('.crewsout__job.is-raid').first().screenshot({ path: `${out}/02-out-now-raid.png` });
  const warn = warned.inbox.find((m) => m.kind === 'raid-warning');
  await tap(p, '[data-action="nav"][data-id="inbox"]'); await p.waitForTimeout(300);
  await p.locator(`[data-action="open-message"][data-id="${warn.id}"]`).first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/03-raid-warning.png` });
  await load(p, calling);
  await tap(p, '[data-action="nav"][data-id="city"]'); await p.waitForTimeout(400);
  await tap(p, '[data-action="raid-answer"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/04-the-call.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
