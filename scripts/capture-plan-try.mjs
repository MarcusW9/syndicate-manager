// Capture (2026-11-05): the plan bar's "Try" chips. Opens a job, puts the first N free runners
// inside, captures the screen with the encounter read and the bar, taps the first chip and captures
// again. Run: JOB=casino INSIDE=0 APPROACH=loud node scripts/capture-plan-try.mjs <out dir>
// (the plan opens as Joss's squad, so INSIDE and APPROACH make it worse, as a player would).
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const s = createNewGame({ seed: Number(process.env.SEED ?? 21), startCrew: 'fresh' });
s.jobs = [];
addOffer(s, process.env.JOB ?? 'casino');
const inside = Number(process.env.INSIDE ?? 0);
const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5192', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h, tag] of [[390, 844, 'phone'], [1440, 900, 'desktop']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await p.goto('http://localhost:5192/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
    for (let i = 0; i < inside; i++) {
      const slot = p.locator('.board .dossier.is-empty[data-id^="in:"]').first();
      if (!(await slot.count())) break;
      await slot.click();
      await p.locator('.cand:not(.is-on):not(.is-placed):not([disabled])').first().click();
      await p.waitForTimeout(150);
    }
    if (process.env.APPROACH) await p.locator(`[data-action="approach"][data-id="${process.env.APPROACH}"]`).first().click();
    if (await p.locator('[data-action="toggle-meet"][aria-expanded="false"]').count()) await p.locator('[data-action="toggle-meet"]').click();
    await p.locator('#risk-read').scrollIntoViewIfNeeded();
    await p.evaluate(() => document.querySelector('#risk-read').scrollIntoView({ block: 'start' }));
    await p.waitForTimeout(400);
    console.log(tag, await p.evaluate(() => document.querySelector('.planbar').innerText.replace(/\s+/g, ' ')));
    await p.screenshot({ path: `${out}/try-${tag}.png` });
    if (await p.locator('.trychip').count()) {
      await p.locator('.trychip').first().click();
      await p.waitForTimeout(400);
      await p.evaluate(() => document.querySelector('#risk-read').scrollIntoView({ block: 'start' }));
      await p.waitForTimeout(300);
      console.log(tag, 'after', await p.evaluate(() => document.querySelector('.planbar').innerText.replace(/\s+/g, ' ')));
      await p.screenshot({ path: `${out}/try-${tag}-tapped.png` });
    }
    await p.close();
  }
} finally { await b.close(); process.kill(-srv.pid); }
