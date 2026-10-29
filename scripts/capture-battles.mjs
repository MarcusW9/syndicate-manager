// Design-session capture (slice 6, battles): a run that turns into a fight, on the watch screen,
// with the death's-door call-in and the report's full log. The state is built with the game's own
// core (a loud warehouse run with two rookies), stopped at death's door, and loaded into the page.
//
//   node scripts/capture-battles.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const repo = new URL('..', import.meta.url).pathname;
const out = join(repo, 'docs/screenshots/2026-10-29-design-session-battles');
mkdirSync(out, { recursive: true });

/** A live run stopped at death's door: the first seed that gets there. */
function doorState() {
  for (let seed = 1; seed < 2000; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, 'warehouse');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 2).map((o) => o.id), 'loud', { callIn: 'risky', orders: 'steady' });
    for (let g = 0; g < 200; g++) {
      const am = s.activeMission;
      if (am.done || am.pending?.kind === 'door') break;
      if (am.pending || am.critical || M.currentStep(am)?.type === 'crisis') s = autoStep(s, { force: true });
      else s = autoStep(s);
    }
    const am = s.activeMission;
    if (am.pending?.kind === 'door' && am.events.filter((e) => e.kind === 'battle' && e.phase === 'round').length >= 2) return s;
  }
  throw new Error('no run reached death\'s door');
}

const state = doorState();
const port = 5950;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
let n = 0;
try {
  for (const [w, h, tag] of [[390, 844, 'phone'], [1440, 900, 'desktop']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: tag === 'phone' ? 2 : 1 });
    page.on('pageerror', (e) => console.error('page error', e.message));
    await page.goto(`http://localhost:${port}/`);
    await page.evaluate((json) => { localStorage.clear(); localStorage.setItem('syndicate-slot-1', json); localStorage.setItem('syndicate-active-slot', '1'); }, JSON.stringify(state));
    await page.reload();
    await page.waitForSelector('#app *');
    await page.locator('[data-action="continue"]').filter({ visible: true }).first().click().catch(() => {});
    await page.waitForTimeout(2500);
    const shot = async (name) => { await page.waitForTimeout(400); await page.screenshot({ path: join(out, `${String(++n).padStart(2, '0')}-${name}-${tag}.png`), fullPage: tag === 'phone' }); };
    await shot('fight-and-call-in');
    if (tag === 'phone') {
      await page.locator('[data-action="pending"]').filter({ visible: true }).first().click();
      await page.waitForTimeout(2500);
      await shot('pulled-back');
    }
    await page.close();
  }
} finally { await browser.close(); server.kill(); }
console.log('done', n, 'in', out);
