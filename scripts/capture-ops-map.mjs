// Capture (2026-11-07, the Ops map: smaller labels, a frame, zoom, Tonight): a crew out at the Docks,
// the Docks warm (heat 4), street talk in Glass Heights. On a phone (390): Ops; the Docks tapped (the map
// zoomed onto it, its landmark on the map, "× Whole city" under it); its card and Tonight below.
// On a computer (1280): Ops; Old Town tapped (zoomed); Esc back to the whole city.
// Run: node scripts/capture-ops-map.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { sendOff } from '../src/core/autorun.js';
import { templateById } from '../src/core/jobs.js';
import { RUMOURS } from '../src/data/rumours.js';
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
s.heatBy = { ...(s.heatBy ?? {}), docks: 4 }; s.heat = 4;
const talk = RUMOURS.find((r) => r.district === 'heights');
if (talk) {
  s.rumour = { id: talk.id, until: s.day + 6 };
  s.inbox.unshift({ id: `rumour-${s.day}`, type: 'rumour', day: s.day, subject: `Street talk: ${talk.tag}`, body: talk.text, blocking: false, read: false, expiresDay: s.day + 6 });
}

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
  await p.screenshot({ path: `${out}/19-ops-phone.png` });
  await tap(p, '.cm-label[data-id="docks"]'); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/20-ops-phone-zoomed.png` });
  await p.evaluate(() => document.querySelector('.tonight')?.scrollIntoView({ block: 'start' }));
  await p.screenshot({ path: `${out}/21-ops-phone-card-tonight.png` });
  await p.setViewportSize({ width: 1280, height: 800 });
  await tap(p, '[data-action="city-whole"].mapframe__out'); await p.waitForTimeout(900); await top(p);
  await p.screenshot({ path: `${out}/22-ops-desktop.png` });
  await tap(p, '.cm-label[data-id="oldTown"]'); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/23-ops-desktop-zoomed.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/24-ops-desktop-esc.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
