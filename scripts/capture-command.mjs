// Capture (command fights, step 2): a Docks fight waiting for orders on the watch screen, a few
// orders given (the overlay shows them), and the round after Go. Builds the run with the game's
// own core, stops it at the fight's first orders, and loads it into the page.
//
//   node scripts/capture-command.mjs [folder under docs/screenshots]
//   JOB=kidnap PHONE_ONLY=1 PREFIX=oldtown- MIN_GUARDS=2 node scripts/capture-command.mjs <folder>
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep, needsPlayer } from '../src/core/autorun.js';
import { arm } from '../tests/play.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const JOB = process.env.JOB ?? 'warehouse'; // JOB=kidnap etc. for another district's map
const SIZES = process.env.PHONE_ONLY ? [[390, 844]] : [[390, 844], [1440, 900]];
const PREFIX = process.env.PREFIX ?? '';
const repo = new URL('..', import.meta.url).pathname;
const out = process.argv[2]?.startsWith('/') ? process.argv[2] : join(repo, 'docs/screenshots', process.argv[2] ?? 'command-fight-scratch');
mkdirSync(out, { recursive: true });

/** A loud Docks run with four grown runners, stepped to its first fight's orders (other call-ins decided by the orders). */
function fightState() {
  for (let seed = Number(process.env.SEED ?? 1); seed < 3000; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    // Grown a season or so (every stat +4, as in scripts/sim-battles.mjs), so threat-4 work is a fair fight.
    for (const op of s.crew) for (const k of Object.keys(op.stats)) op.stats[k] = Math.min(20, op.stats[k] + 4);
    // Mixed kit, so the panel shows what gear does: a pro sidearm and a vest, a sidearm, then nothing.
    arm(s, s.crew[0].id, 'pistol:pro', 'vest');
    arm(s, s.crew[1].id, 'pistol');
    s.jobs = [];
    addOffer(s, JOB);
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, Math.min(4, templateById(JOB).crewSize + 1)).map((o) => o.id), 'loud', { callIn: 'risky', orders: 'steady' });
    for (let g = 0; g < 300 && !s.activeMission.done; g++) {
      const am = s.activeMission;
      if (am.battle && !am.pending && needsPlayer(s) && am.battle.guards.length >= (process.env.MIN_GUARDS ?? 3) && (process.env.JUMP || !am.battle.ambush)) return s;
      const next = autoStep(s);
      s = next !== s ? next : autoStep(s, { force: true });
    }
  }
  throw new Error('no fight');
}

const s = fightState();
const port = 5961;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
let n = 0;
const shot = async (page, name, w, full = false) => { await page.waitForTimeout(400); await page.screenshot({ path: join(out, `${PREFIX}${String(++n).padStart(2, '0')}-${name}-${w < 500 ? 'phone' : 'desktop'}.png`), fullPage: full }); };
try {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    page.on('pageerror', (e) => console.error('page error', e.message));
    page.on('console', (m) => m.type() === 'error' && console.error('console', m.text()));
    await page.goto(`http://localhost:${port}/`);
    await page.evaluate((json) => { localStorage.clear(); localStorage.setItem('syndicate-slot-1', json); localStorage.setItem('syndicate-active-slot', '1'); }, JSON.stringify(s));
    await page.reload();
    await page.waitForSelector('.ffo');
    await page.waitForTimeout(800);
    await page.evaluate(() => document.querySelector('.watch__callin').scrollIntoView({ block: 'start' }));
    await shot(page, 'orders', w);
    await shot(page, 'orders-full', w, true);
    // The first runner flanks a guard in cover, the second hunkers.
    if (await page.locator('.ffo-target').count() > 1) await page.locator('.ffo-target').nth(1).dispatchEvent('click');
    await page.waitForTimeout(200);
    // (Flank shows only against a guard in cover; else they shoot.)
    const flank = page.locator('.ffo-act[data-kind="flank"]');
    await ((await flank.count()) ? flank : page.locator('.ffo-act[data-kind="shoot"]')).first().dispatchEvent('click');
    await page.locator('.ffo-act[data-kind="hunker"]').first().dispatchEvent('click');
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('.watch__callin').scrollIntoView({ block: 'start' }));
    await shot(page, 'orders-given', w);
    await page.locator('[data-action="fight-go"]').dispatchEvent('click');
    await page.waitForTimeout(9000);
    await shot(page, 'after-go', w);
    await shot(page, 'after-go-full', w, true);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(`shots in ${out}`);
