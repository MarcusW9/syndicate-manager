// Capture (2026-11-17, builds slice 3-iii): Joss's build advice on the plan screen, closed to start and then opened.
// Run: node scripts/capture-plan-build-advice.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { withBuild } from '../src/core/builds.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.crew = s.crew.map((op, i) => (i === 0 ? { ...op, build: { move: 'ricochet', payload: 'cytotoxic' } } : op));
s.crew.forEach((op) => { op.stats.combat = Math.max(op.stats.combat, 12); }); // so Joss's picks include the carrier
s.jobs = [];
addOffer(s, process.env.JOB ?? 'data_pull');
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5903', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  await p.goto('http://localhost:5903/');
  await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
  await p.reload();
  await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
  await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
  await p.locator('[data-action="approach"][data-id="loud"]').first().click().catch(() => {});
  for (let i = 0; i < templateById(process.env.JOB ?? 'data_pull').crewSize; i++) {
    const slot = p.locator('.board .dossier.is-empty[data-id^="in:"]').first();
    if (!(await slot.count())) break;
    await slot.click();
    await p.locator('.cand:not(.is-on):not(.is-placed):not([disabled])').first().click();
    await p.waitForTimeout(150);
  }
  const fs = p.locator('.fs--plan');
  await fs.scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  await fs.screenshot({ path: `${out}/01-advice-closed.png` });
  await p.locator('[data-action="fight-advice"]').click();
  await p.waitForTimeout(300);
  await p.locator('.fs--plan').screenshot({ path: `${out}/02-advice-open.png` });
} finally { await b.close(); process.kill(-srv.pid); }
