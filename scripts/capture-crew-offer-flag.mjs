// Design-session capture: a build offer flagged on the Crew tab, the roster row and the top of the runner's page.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { createNewGame } from '../src/core/state.js';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const repo = new URL('..', import.meta.url).pathname;
const out = join(repo, 'docs/screenshots/2026-11-17-crew-offer-flag');
mkdirSync(out, { recursive: true });
const port = 5901;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.error('page error', e.message));
let n = 0;
const shot = async (name) => { await page.waitForTimeout(300); await page.screenshot({ path: join(out, `${String(++n).padStart(2, '0')}-${name}.png`) }); };
const click = async (sel) => { const el = page.locator(sel).filter({ visible: true }).first(); if (!(await el.count())) return false; await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(200); return true; };
try {
  await page.goto(`http://localhost:${port}/`);
  const s = createNewGame({ seed: 21, startCrew: 'fresh' });
  s.inbox = [];
  const op = s.crew[0];
  s.inbox.unshift({ id: `build-${op.id}-${s.day}`, type: 'crew', day: s.day, subject: `${op.handle} could pick up the Cytotoxic Vector`, body: 'An offer from Joss.', kind: 'build',
    options: [{ id: 'cytotoxic', label: 'Take the Cytotoxic Vector' }, { id: 'later', label: 'Not yet' }],
    payload: { opId: op.id, ids: ['cytotoxic'], outcome: null }, blocking: false, resolved: false, read: true });
  await page.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, s);
  await page.reload();
  await page.waitForTimeout(800);
  await click('[data-action="nav"][data-id="crew"]');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot('roster-offer-flag');
  await click('.crewrow:has(.lvltab) [data-action="open-op"]');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot('runner-offer-on-top');
} finally { await browser.close(); server.kill(); }
console.log('done', n);
