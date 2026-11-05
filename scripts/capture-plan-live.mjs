// Capture (2026-11-05): the job plan showing what moved. Opens a job (brief in full), switches the
// approach and captures the encounter read and the plan bar with "was …" tags (and the flash), then
// goes back and opens the job again: the brief is two lines with "Read more".
// Run: JOB=data_scrub APPROACH=loud node scripts/capture-plan-live.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const s = createNewGame({ seed: Number(process.env.SEED ?? 21), startCrew: 'fresh' });
s.jobs = [];
addOffer(s, process.env.JOB ?? 'data_scrub');
const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5193', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h, tag] of [[390, 844, 'phone'], [1440, 900, 'desktop']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await p.goto('http://localhost:5193/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/01-brief-first-${tag}.png` });
    if (await p.locator('[data-action="toggle-meet"][aria-expanded="false"]').count()) await p.locator('[data-action="toggle-meet"]').click();
    await p.locator(`[data-action="approach"][data-id="${process.env.APPROACH ?? 'loud'}"]`).first().click();
    await p.waitForTimeout(150);
    await p.evaluate(() => document.querySelector('#risk-read').scrollIntoView({ block: 'start' }));
    await p.screenshot({ path: `${out}/02-changed-flash-${tag}.png` });
    await p.waitForTimeout(1500);
    console.log(tag, await p.evaluate(() => [...document.querySelectorAll('.was')].map((n) => n.textContent).join(', ')));
    await p.screenshot({ path: `${out}/03-changed-${tag}.png` });
    // Then a crew change: the first Try chip (the same encounters, their risks move).
    if (await p.locator('[data-action="plan-why"]').count()) await p.locator('[data-action="plan-why"]').click();
    if (await p.locator('.trychip').count()) {
      console.log(tag, 'try', await p.locator('.trychip').last().textContent());
      await p.locator('.trychip').last().click();
      await p.waitForTimeout(150);
      await p.evaluate(() => document.querySelector('#risk-read').scrollIntoView({ block: 'start' }));
      await p.screenshot({ path: `${out}/03b-crew-changed-flash-${tag}.png` });
      await p.waitForTimeout(1500);
      console.log(tag, 'after try', await p.evaluate(() => [...document.querySelectorAll('.was')].map((n) => n.textContent).join(', ')));
      await p.screenshot({ path: `${out}/03c-crew-changed-${tag}.png` });
    }
    const back = p.locator('[data-action="back"]').filter({ visible: true });
    if (await back.count()) await back.first().click();
    await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
    await p.waitForTimeout(300);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.screenshot({ path: `${out}/04-brief-again-${tag}.png` });
    await p.close();
  }
} finally { await b.close(); process.kill(-srv.pid); }
