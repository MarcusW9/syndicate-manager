// Design-session screenshots for fame's payoffs (renown slice 4, 2026-11-04): a crew after forty
// careful weeks (tests/play.js playWeeks, seed 1, fresh start, hiring above ¥10,000) with an Elite.
// If the board has no named offer that day, the first client job (not rookie work; a courier job
// is added if there's none) is made one (askedFor set by
// hand, as core/jobs.js nameAnOffer would), and a fame pay ask is posted (core/fame.js fameRaise's
// message, through core/renewals.js postPayAsk), so both show. Phone width.
//
//   node scripts/capture-named.mjs <folder-name>
//
// Uses a vite dev server on port 5174 (stop a stray one with: pkill -f "[v]ite --port 5174").

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { playWeeks, carefulPolicy } from '../tests/play.js';
import { templateById, namedCandidate, addOffer } from '../src/core/jobs.js';
import { postPayAsk } from '../src/core/renewals.js';
import { FAME_RAISE_TEXT } from '../src/data/fame.js';
const { chromium } = createRequire(import.meta.url)('playwright');

const repo = resolve(new URL('..', import.meta.url).pathname);
const outDir = join(repo, 'docs', 'screenshots', process.argv[2] ?? '2026-11-04-design-session-named-offers');
mkdirSync(outDir, { recursive: true });

const { state } = playWeeks(40, 1, carefulPolicy, { startCrew: 'fresh', hireAbove: 10000 });
state.inbox = state.inbox.filter((m) => !m.blocking || m.resolved); // unanswered pay asks would lock the tabs
state.inbox.forEach((m) => { m.read = true; });
const who = namedCandidate(state) ?? state.crew.find((o) => o.fame === 'elite');
if (!who) throw new Error('no Elite after 40 weeks');
let job = state.jobs.find((j) => j.askedFor);
if (!job) {
  job = state.jobs.find((j) => j.clientId && !templateById(j.templateId).rookie);
  if (!job) { addOffer(state, 'courier'); job = state.jobs.at(-1); } // client work, as nameAnOffer picks
  job.askedFor = who.id;
}
const ask = Math.round((who.wage * 1.2) / 50) * 50;
postPayAsk(state, who, { ask, reason: 'fame',
  subject: FAME_RAISE_TEXT.subject.replace('{op}', who.handle),
  body: FAME_RAISE_TEXT.body.replace('{name}', who.name).replace('{current}', who.wage).replace('{ask}', ask) });
const askId = state.inbox[0].id;

const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['--port', '5174', '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok, fail) => {
  server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); });
  server.on('exit', (c) => fail(new Error(`vite exited ${c}`)));
});
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
await page.addInitScript((save) => {
  if (!localStorage.getItem('named-shot')) {
    localStorage.setItem('syndicate-active-slot', '1');
    localStorage.setItem('syndicate-slot-1', save);
    localStorage.setItem('named-shot', '1');
  }
}, JSON.stringify(state));
await page.goto('http://localhost:5174/');
await page.waitForTimeout(800);
let n = 0;
const shot = async (name) => { await page.screenshot({ path: join(outDir, `${String(++n).padStart(2, '0')}-${name}.png`) }); };
// Click through the DOM: Playwright's visibility wait can stall while the page animates.
const tap = async (sel) => { await page.evaluate((q) => document.querySelector(q).click(), sel); await page.waitForTimeout(300); };
await tap(`[data-action="open-message"][data-id="${askId}"]`);
await page.evaluate(() => window.scrollTo(0, 0));
await shot('fame-pay-ask');
await tap('[data-action="nav"][data-id="jobs"]');
await page.locator(`[data-action="open-job"][data-id="${job.id}"]`).scrollIntoViewIfNeeded();
await shot('job-board-named');
await tap(`[data-action="open-job"][data-id="${job.id}"]`);
await page.locator('.named').scrollIntoViewIfNeeded();
await shot('planning-named');
await browser.close();
server.kill();
console.log(`${n} shots in ${outDir}: ${who.handle} asked for on ${templateById(job.templateId).name}`);
