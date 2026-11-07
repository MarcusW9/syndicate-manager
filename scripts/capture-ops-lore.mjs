// Capture (2026-11-06, Ops gets its own tab, second; City becomes Lore, last): on a phone (390), a
// crew out at the Docks. Ops (the map, Out now); a district picked on Ops (its live card, "About
// the Docks on Lore"); Lore › Districts (the picture cards); one opened (the write-up); the locked
// districts; Ops and Lore on a computer (1280).
// Shots 19-25 of docs/screenshots/2026-11-06-ops-tab. Run: node scripts/capture-ops-lore.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { sendOff } from '../src/core/autorun.js';
import { templateById } from '../src/core/jobs.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.cash = 14000;
const job = s.jobs.find((j) => templateById(j.templateId)?.district === 'docks') ?? s.jobs[0];
const crew = s.crew.slice(0, templateById(job.templateId).crewSize?.min ?? 2).map((o) => o.id);
try { s = sendOff(s, job.id, crew, 'stealth', 'steady', {}); } catch (e) { console.error('no send-off:', e.message); }

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5199', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5199/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const top = (p) => p.evaluate(() => window.scrollTo(0, 0));
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await load(p, s);
  await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(500); await top(p);
  await p.screenshot({ path: `${out}/19-ops.png` });
  await tap(p, '.cm-label[data-id="docks"]'); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/20-ops-district-card.png` });
  await tap(p, '[data-action="nav"][data-id="lore"]'); await p.waitForTimeout(500); await top(p);
  await p.screenshot({ path: `${out}/21-lore-districts.png` });
  await tap(p, '[data-action="lore-district"][data-id="oldTown"]'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.lorecard.is-open .lorecard__body')?.scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: `${out}/22-lore-district-open.png` });
  await p.evaluate(() => [...document.querySelectorAll('.lorecard')].find((l) => l.textContent.includes('Silt'))?.scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: `${out}/23-lore-locked.png` });
  await p.setViewportSize({ width: 1280, height: 800 });
  await tap(p, '[data-action="nav"][data-id="ops"]'); await p.waitForTimeout(500); await top(p);
  await p.screenshot({ path: `${out}/24-ops-desktop.png` });
  await tap(p, '[data-action="nav"][data-id="lore"]'); await p.waitForTimeout(500); await top(p);
  await p.screenshot({ path: `${out}/25-lore-desktop.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
