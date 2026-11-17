// The live battle view in a real browser (ui/fightstage.js): builds a save at an engine-2 fight in node, loads it in the
// game at phone width and plays rounds on the site map, taking a picture mid-round and after each round.
//
//   node scripts/preview-livebattle.mjs <out-dir> [--job warehouse] [--seed 1] [--pace watch|fast] [--rounds 3] [--wide] [--reduced]
//        [--aura] [--special ricochet|slash|ping] [--knots hired,drone|none] [--foes 10] [--crew 6] [--throttle 4] [--scale 2]
//
// --special forces a special move on each round's attacks (the rules side is not built; ui/fightstage.js forceSpecial),
// with frames taken while it plays. --knots draws those enemy kinds as swarm knots instead of data/fightLooks.js's
// choice ('none': one token each). --foes and --crew pad the preview fight (more hired guns, more runners from the
// roster) to measure a crowd; --throttle slows the CPU that many times (Chromium's CDP) for a phone-class frame rate.
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
const special = flag('special');
const effect = flag('effect'); // --effect spread|tick|shield|jam|wayout: forge that effect's lines onto each round (ui/fightstage.js forceEffect) and keep frames while it is on screen
const aura = bool('aura'); // --aura: poll while a round plays and keep a frame for each stage of the medic's aura (glow, orb, landing)
const knots = flag('knots');
const foes = Number(flag('foes', '0'));
const crewN = Number(flag('crew', '0'));
const throttle = Number(flag('throttle', '0'));
const scale = Number(flag('scale', '1'));
const out = resolve(args[0] ?? 'livebattle-shots');
mkdirSync(out, { recursive: true });

function atFight() {
  for (let k = seed; k < seed + 40; k++) {
    let s = createNewGame({ seed: k, startCrew: 'fresh' });
    s.jobs = [];
    // --crew past the roster: copies of the first runner under new ids (a preview save only).
    for (let k = s.crew.length; k < crewN; k++) s.crew.push({ ...structuredClone(s.crew[0]), id: `${s.crew[0].id}-x${k}`, handle: `${s.crew[0].handle} ${k}` });
    addOffer(s, job);
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, Math.max(templateById(job).crewSize, crewN)).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady' });
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
// A crowd for the frame rate (standard-force police, plated, so the armour crack shows): more guns, each a copy of the first enemy at the next number, on the enemies' spots.
{
  const b = save.activeMission.battle;
  const first = b.enemies[0];
  for (let n = b.enemies.length + 1; n <= foes; n++) b.enemies.push({ ...structuredClone(first), n, kind: 'police', pips: 1, max: 1, absorb: 1, out: false, fled: false });
}
console.log(`fight: ${job}, ${save.activeMission.battle.enemies.length} enemies, ${save.activeMission.battle.runners.length} runners`);

const repo = resolve(new URL('..', import.meta.url).pathname);
const port = 5900 + Math.floor(Math.random() * 90);
const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok, fail) => { server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }); server.on('exit', (c) => fail(new Error(`vite exited ${c}`))); });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: wide ? { width: 1440, height: 900 } : { width: 390, height: 844 }, deviceScaleFactor: scale, reducedMotion: reduced ? 'reduce' : 'no-preference' });
page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
await page.addInitScript(([state, watch]) => {
  if (sessionStorage.getItem('seeded')) return;
  sessionStorage.setItem('seeded', '1');
  localStorage.setItem('syndicate-active-slot', '1');
  localStorage.setItem('syndicate-slot-1', state);
  localStorage.setItem('syndicate-pref-fight-watch', watch ? '1' : '0');
}, [JSON.stringify(save), pace === 'watch']);
if (special || knots || effect) await page.addInitScript((p) => { window.__stagePreview = p; }, { ...(effect ? { effect } : {}), ...(special ? { special } : {}), ...(knots ? { knots: knots === 'none' ? [] : knots.split(',') } : {}) });
if (throttle > 1) { const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
let n = 0;
const shot = async (name) => { const f = join(out, `${String(++n).padStart(2, '0')}-${name}.png`); await page.screenshot({ path: f }); console.log(f); };
try {
  await page.goto(`http://localhost:${port}/`);
  await page.waitForSelector('.watch', { timeout: 15000 });
  await page.waitForTimeout(1500);
  await shot('fight-start');
  // Frame times for the whole run (requestAnimationFrame), to read the frame rate while each round plays.
  await page.evaluate(() => { window.__frames = []; const tick = (t) => { window.__frames.push(t); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  const rate = async (from, to) => page.evaluate(([a, b]) => { const f = window.__frames.filter((t) => t >= a && t <= b); const gaps = f.slice(1).map((t, i) => t - f[i]).sort((x, y) => x - y); return { fps: Math.round((f.length - 1) / ((f.at(-1) - f[0]) / 1000)), p95: Math.round(gaps[Math.floor(gaps.length * 0.95)] ?? 0), worst: Math.round(gaps.at(-1) ?? 0) }; }, [from, to]);
  const now = () => page.evaluate(() => performance.now());
  for (let r = 1; r <= rounds; r++) {
    const t0 = await now();
    const next = page.locator('[data-action="fs-next"]').filter({ visible: true }).first();
    if (pace === 'watch') {
      if (!(await next.count())) { const p = page.locator('[data-action="pending"]:not([data-id="out"])').filter({ visible: true }).first(); if (await p.count()) { await p.click(); continue; } break; }
      await next.click();
    }
    if (effect) {
      const sel = { spread: '.fs-hop, .fs-hopper, .sp-flash--spread', tick: '.fs-drip, .fs-pop, .is-tickloss, .sp-flash--tick', shield: '.fs-dome', jam: '.fs-jamarc, .fs-static, .fs-ping', wayout: '.fs-alarm-ring, .fs-groupwave, .fs-aura' }[effect];
      let k = 0;
      for (let t = 0; t < 6000 && k < 8; t += 130) {
        await page.waitForTimeout(130);
        if (await page.evaluate((q) => !!document.querySelector(q), sel)) { await shot(`round-${r}-${effect}-${++k}`); if (effect === 'wayout' && k === 1) console.log('door:', await page.evaluate(() => [...document.querySelectorAll('.fs-alarm-ring')].map((e) => [e.getAttribute('cx'), e.getAttribute('cy')]))); }
      }
    } else if (aura) {
      // Frames only while the aura is on screen, at most 8 a round, to see the glow grow and flash, the orb cross and the pip fill.
      let k = 0;
      for (let t = 0; t < 6000 && k < 8; t += 90) {
        await page.waitForTimeout(90);
        if (await page.evaluate(() => !!document.querySelector('.fs-aura, .fs-orb, .sp-flash--heal'))) await shot(`round-${r}-aura-${++k}`);
      }
    } else if (special) {
      await page.waitForTimeout(700); await shot(`round-${r}-special-title`);
      for (let k = 1; k <= 6; k++) { await page.waitForTimeout(260); await shot(`round-${r}-special-${k}`); }
    } else { await page.waitForTimeout(1300); await shot(`round-${r}-mid`); }
    await page.waitForTimeout(pace === 'watch' ? 4500 : 2600);
    const t1 = await now();
    await shot(`round-${r}-after`);
    const fr = await rate(t0, t1);
    console.log(`round ${r}: ${fr.fps} frames a second while it played (95% of frames within ${fr.p95} ms, worst ${fr.worst} ms)`);
  }
  console.log('drawn:', JSON.stringify(await page.evaluate(() => ({ foes: document.querySelectorAll('.fs-foe').length, knots: document.querySelectorAll('.fs-knot').length, svgNodes: document.querySelectorAll('.siteplan *').length, barriers: document.querySelectorAll('.fs-barrier').length, bodies: document.querySelectorAll('.fs-body').length, staged: !!document.querySelector('.siteplan.is-staged') }))));
  // Frame rate while a round plays (rough: requestAnimationFrame callbacks a second).
  const fps = await page.evaluate(() => new Promise((ok) => { let f = 0; const t0 = performance.now(); const tick = () => { f++; if (performance.now() - t0 < 1000) requestAnimationFrame(tick); else ok(f); }; requestAnimationFrame(tick); }));
  console.log(`frames in a second: ${fps}`);
} finally {
  await browser.close();
  server.kill();
}
