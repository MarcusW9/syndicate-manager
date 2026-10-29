// Design-session capture (slice 6b): a fight on the watch screen. Builds a loud run with the game's
// own core, stops it as the fight starts, loads it into the page and lets the watch play it live:
// the guards appear, health bars on the tokens, a round plays out, the death's-door call-in.
//
//   node scripts/capture-fights.mjs
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
const out = join(repo, 'docs/screenshots/2026-10-29-design-session-fights');
mkdirSync(out, { recursive: true });

/** A loud run, stepped until the fight's start note is the last thing recorded; then on to death's door. */
function runs() {
  for (let seed = 1; seed < 3000; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, 'warehouse');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 3).map((o) => o.id), 'loud', { callIn: 'risky', orders: 'committed' });
    let atStart = null;
    for (let g = 0; g < 300; g++) {
      const am = s.activeMission;
      if (am.done || am.pending?.kind === 'door') break;
      if (!atStart && am.battle && am.battle.round === 0) atStart = structuredClone(s);
      s = am.pending || am.critical || M.currentStep(am)?.type === 'crisis' ? autoStep(s, { force: true }) : autoStep(s);
    }
    if (atStart && s.activeMission.pending?.kind === 'door' && s.activeMission.battle.guards.length >= 2) return { atStart, atDoor: s };
  }
  throw new Error('no run');
}

const { atStart, atDoor } = runs();
const port = 5960;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
let n = 0;
const open = async (state, w, h) => {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
  page.on('pageerror', (e) => console.error('page error', e.message));
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate((json) => { localStorage.clear(); localStorage.setItem('syndicate-slot-1', json); localStorage.setItem('syndicate-active-slot', '1'); }, JSON.stringify(state));
  await page.reload();
  await page.waitForSelector('#app *');
  await page.locator('[data-action="continue"]').filter({ visible: true }).first().click().catch(() => {});
  return page;
};
const shot = async (page, name, w, full = false) => { await page.waitForTimeout(150); await page.screenshot({ path: join(out, `${String(++n).padStart(2, '0')}-${name}-${w < 500 ? 'phone' : 'desktop'}.png`), fullPage: full }); };
try {
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    // The fight starts and plays live: catch the guards arriving, then a round mid-way.
    const live = await open(atStart, w, h);
    await live.waitForSelector('.siteplan');
    await live.evaluate(() => document.querySelector('.watch__map')?.scrollIntoView({ block: 'start' }));
    await live.waitForSelector('.sp-enemy--guard', { timeout: 20000 });
    await shot(live, 'guards-arrive', w);
    await live.waitForTimeout(2600);
    await shot(live, 'round-playing', w);
    await live.waitForTimeout(4500);
    await shot(live, 'later-round', w);
    await live.close();
    // The same fight at death's door, drawn as it stands, with the call-in.
    const door = await open(atDoor, w, h);
    await door.waitForSelector('.sp-enemy--guard', { timeout: 20000 });
    await door.evaluate(() => document.querySelector('.watch__map')?.scrollIntoView({ block: 'start' }));
    await shot(door, 'death-door-plan', w);
    await door.evaluate(() => document.querySelector('.watch__callin')?.scrollIntoView({ block: 'start' }));
    await shot(door, 'death-door-call-in', w);
    await door.close();
  }
} finally { await browser.close(); server.kill(); }
console.log('done', n, 'in', out);
