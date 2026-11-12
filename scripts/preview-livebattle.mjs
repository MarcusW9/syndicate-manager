// The live battle view in a real browser (ui/fightstage.js): builds a save at an engine-2 fight in node, loads it in the
// game at phone width and plays rounds on the site map, taking a picture mid-round and after each round.
//
//   node scripts/preview-livebattle.mjs <out-dir> [--job warehouse] [--seed 1] [--pace watch|fast] [--rounds 3] [--wide] [--reduced]
//
// Pictures only; it changes nothing in the repo. Uses the pre-installed Playwright Chromium.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { createNewGame } = await import('../src/core/state.js');
const M = await import('../src/core/mission.js');
const { addOffer, templateById } = await import('../src/core/jobs.js');
const { autoStep } = await import('../src/core/autorun.js');

const args = process.argv.slice(2);
const flag = (name, d = null) => { const i = args.indexOf(`--${name}`); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = (name) => { const i = args.indexOf(`--${name}`); if (i < 0) return false; args.splice(i, 1); return true; };
const job = flag('job', 'warehouse');
const seed = Number(flag('seed', '1'));
const pace = flag('pace', 'watch');
const rounds = Number(flag('rounds', '3'));
const wide = bool('wide');
const reduced = bool('reduced');
const out = resolve(args[0] ?? 'livebattle-shots');
mkdirSync(out, { recursive: true });

function atFight() {
  for (let k = seed; k < seed + 40; k++) {
    let s = createNewGame({ seed: k, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, job);
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(job).crewSize).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady' });
    for (let g = 0; g < 400 && !s.activeMission.done; g++) {
      if (s.activeMission.battle?.engine === 2 && M.currentStep(s.activeMission)?.type === 'battle') return s;
      const next = autoStep(s, { force: true });
      if (next === s) break;
      s = next;
    }
  }
  throw new Error('no engine-2 fight found');
}
const save = atFight();
console.log(`fight: ${job}, ${save.activeMission.battle.enemies.length} enemies, ${save.activeMission.battle.runners.length} runners`);

const repo = resolve(new URL('..', import.meta.url).pathname);
const port = 5900 + Math.floor(Math.random() * 90);
const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok, fail) => { server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }); server.on('exit', (c) => fail(new Error(`vite exited ${c}`))); });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: wide ? { width: 1440, height: 900 } : { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
await page.addInitScript(([state, watch]) => {
  if (sessionStorage.getItem('seeded')) return;
  sessionStorage.setItem('seeded', '1');
  localStorage.setItem('syndicate-active-slot', '1');
  localStorage.setItem('syndicate-slot-1', state);
  localStorage.setItem('syndicate-pref-fight-watch', watch ? '1' : '0');
}, [JSON.stringify(save), pace === 'watch']);
let n = 0;
const shot = async (name) => { const f = join(out, `${String(++n).padStart(2, '0')}-${name}.png`); await page.screenshot({ path: f }); console.log(f); };
try {
  await page.goto(`http://localhost:${port}/`);
  await page.waitForSelector('.watch', { timeout: 15000 });
  await page.waitForTimeout(1500);
  await shot('fight-start');
  for (let r = 1; r <= rounds; r++) {
    const next = page.locator('[data-action="fs-next"]').filter({ visible: true }).first();
    if (pace === 'watch') {
      if (!(await next.count())) { const p = page.locator('[data-action="pending"]:not([data-id="out"])').filter({ visible: true }).first(); if (await p.count()) { await p.click(); continue; } break; }
      await next.click();
    }
    await page.waitForTimeout(1300);
    await shot(`round-${r}-mid`);
    await page.waitForTimeout(pace === 'watch' ? 4500 : 2600);
    await shot(`round-${r}-after`);
  }
  console.log('drawn:', JSON.stringify(await page.evaluate(() => ({ foes: document.querySelectorAll('.fs-foe').length, barriers: document.querySelectorAll('.fs-barrier').length, bodies: document.querySelectorAll('.fs-body').length, staged: !!document.querySelector('.siteplan.is-staged') }))));
  // Frame rate while a round plays (rough: requestAnimationFrame callbacks a second).
  const fps = await page.evaluate(() => new Promise((ok) => { let f = 0; const t0 = performance.now(); const tick = () => { f++; if (performance.now() - t0 < 1000) requestAnimationFrame(tick); else ok(f); }; requestAnimationFrame(tick); }));
  console.log(`frames in a second: ${fps}`);
} finally {
  await browser.close();
  server.kill();
}
