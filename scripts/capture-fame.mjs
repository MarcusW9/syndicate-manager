// Design-session screenshots for fame and paths (renown slice 3, 2026-11-03): a crew that has
// played thirty careful weeks (tests/play.js playWeeks, seed 1, fresh start), loaded into the
// page at phone width. Shots: the crew list (an Elite runner's badge), the Elite runner's page,
// the same with the path's (i) open, and a runner who isn't Elite yet.
//
//   node scripts/capture-fame.mjs <folder-name>
//
// Uses a vite dev server on port 5174 (stop a stray one with: pkill -f "[v]ite --port 5174").

import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { playWeeks, carefulPolicy } from '../tests/play.js';

const repo = resolve(new URL('..', import.meta.url).pathname);
const outDir = join(repo, 'docs', 'screenshots', process.argv[2] ?? '2026-11-03-design-session-fame');
mkdirSync(outDir, { recursive: true });

// 30 weeks since Elite moved to 60 jobs at their level (2026-11-03); the first set used 16.
const { state } = playWeeks(30, 1, carefulPolicy, { startCrew: 'fresh', hireAbove: 10000 });
state.inbox.forEach((m) => { m.read = true; });
state.inbox = state.inbox.filter((m) => !m.blocking || m.resolved); // unanswered pay asks would lock the tabs
const elite = state.crew.find((o) => o.fame === 'elite');
const other = state.crew.find((o) => o.fame !== 'elite' && o.record?.jobs);
if (!elite) throw new Error('no Elite runner after 30 weeks');

const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['--port', '5174', '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok, fail) => {
  server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); });
  server.on('exit', (c) => fail(new Error(`vite exited ${c}`)));
});
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
await page.addInitScript((save) => {
  if (!localStorage.getItem('fame-shot')) {
    localStorage.setItem('syndicate-active-slot', '1');
    localStorage.setItem('syndicate-slot-1', save);
    localStorage.setItem('fame-shot', '1');
  }
}, JSON.stringify(state));
await page.goto('http://localhost:5174/');
await page.waitForTimeout(800);
let n = 0;
// Click through the DOM: Playwright's visibility wait can stall while the page animates.
const tap = async (sel) => { await page.evaluate((q) => document.querySelector(q).click(), sel); await page.waitForTimeout(300); };
const shot = async (name, full = false) => { await page.screenshot({ path: join(outDir, `${String(++n).padStart(2, '0')}-${name}.png`), fullPage: full }); };
await tap('[data-action="nav"][data-id="crew"]');
await page.waitForTimeout(300);
await page.locator(`[data-action="open-op"][data-id="${elite.id}"]`).scrollIntoViewIfNeeded();
await shot('crew-list');
await tap(`[data-action="open-op"][data-id="${elite.id}"]`);
await page.waitForTimeout(300);
await page.evaluate(() => window.scrollTo(0, 0));
await shot('elite-runner');
await page.locator('h2:has-text("Path")').scrollIntoViewIfNeeded();
await shot('elite-path');
await tap(`[data-action="info"][data-id="path-${elite.id}"]`);
await page.waitForTimeout(200);
await page.locator('h2:has-text("Path")').scrollIntoViewIfNeeded();
await shot('elite-path-info');
if (other) {
  await tap('[data-action="back"]');
  await tap(`[data-action="open-op"][data-id="${other.id}"]`);
  await page.waitForTimeout(300);
  await page.locator('h2:has-text("Path")').scrollIntoViewIfNeeded();
  await shot('path-not-elite');
}
await browser.close();
server.kill();
console.log(`${n} shots in ${outDir}: Elite ${elite.handle} (${elite.tier}, standing ${elite.standing}); other ${other?.handle} (${other?.fame})`);
