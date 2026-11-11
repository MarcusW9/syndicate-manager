// Engine 2's screens (battle rework slice 2), captured from states built with the real core: a round waiting for orders,
// the order editor, the tech-under-fire call-in, death's door, the van that cannot wait with someone outside, a one-pip
// threat, and the plan screen's fight block. Each state is saved to localStorage and the page is opened on it, at 1x and
// 360px wide (the owner's phone-first width), plus 390px. Run: node scripts/capture-battle-orders.mjs <out dir> [--checks]
//   --checks  also measure what the checks need (tap targets under 44px, horizontal overflow, text clipped) and print it.
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const out = process.argv[2];
const checks = process.argv.includes('--checks');
mkdirSync(out, { recursive: true });
const root = new URL('..', import.meta.url).pathname;

// --- states ---------------------------------------------------------------------------------------
function begin(seed, templateId, opts = {}) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  return M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(templateId).crewSize).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady', ...opts });
}
const inFight = (s) => !!s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle';
/** Step the run (forced steps) until `stop` holds, a fight waiting for orders being the usual place to stop. */
function until(s, stop, limit = 500) {
  for (let g = 0; g < limit && !s.activeMission.done; g++) {
    if (stop(s)) return s;
    const next = autoStep(s, { force: true });
    if (next === s) throw new Error('stuck');
    s = next;
  }
  return stop(s) ? s : null;
}
function find(template, stop, { to = 400, orders = 'steady', before = (s) => s } = {}) {
  for (let seed = 1; seed <= to; seed++) {
    let s = begin(seed, template, { orders });
    s.activeMission.orders = orders;
    s = until(s, stop);
    if (s && stop(s)) return before(s);
  }
  return null;
}
const hasThreat = (s, pred) => s.activeMission.battle?.drawn && s.activeMission.battle.threats.some(pred);

const scenes = {
  'round-waiting': () => find('data_pull', (s) => inFight(s) && !s.activeMission.pending && s.activeMission.battle.drawn && s.activeMission.battle.round >= 2 && s.activeMission.battle.threats.some((t) => t.kind === 'aim')),
  'one-pip-threat': () => find('data_pull', (s) => inFight(s) && !s.activeMission.pending && hasThreat(s, (t) => t.kind === 'aim' && t.hit === 1), { to: 600 }),
  'tech-under-fire': () => find('data_pull', (s) => s.activeMission.pending?.id === 'techUnderFire', { to: 600 }),
  'deaths-door': () => find('warehouse', (s) => s.activeMission.pending?.kind === 'door', { to: 600 }),
  'van-cannot-wait': () => find('warehouse', (s) => s.activeMission.pending?.id === 'vanCantWait', { to: 800 }),
};

// --- pages ----------------------------------------------------------------------------------------
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5197', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const report = {};
try {
  for (const [name, make] of Object.entries(scenes)) {
    const s = make();
    if (!s) { console.log(name, 'NO STATE FOUND'); continue; }
    for (const w of [360, 390]) {
      const p = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 1 });
      p.on('pageerror', (e) => console.log(`page error (${name}): ${e.message}`));
      await p.goto('http://localhost:5197/');
      await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
      await p.reload();
      await p.waitForSelector('#app *');
      // The fight lives on the watch screen: open the active job.
      for (const sel of ['[data-action="nav"][data-id="jobs"]', '[data-action="resume-mission"]', '[data-action="open-mission"]']) {
        const el = p.locator(sel).filter({ visible: true }).first();
        if (await el.count()) { await el.click().catch(() => {}); await p.waitForTimeout(300); }
      }
      await p.waitForSelector('.fs', { timeout: 6000 }).catch(() => console.log(name, w, 'no .fs on screen'));
      await p.waitForTimeout(800);
      const card = p.locator('.fs').first();
      // The card itself: the watch screen keeps its map stuck to the top while you are called in, which a page capture would show over the card.
      await p.addStyleTag({ content: '.watch__live, .topbar, header { position: static !important; }' });
      if (await card.count()) await card.screenshot({ path: `${out}/${name}-${w}.png` });
      if (checks) {
        report[`${name}-${w}`] = await p.evaluate(() => {
          const root = document.querySelector('.fs');
          const small = [...(root?.querySelectorAll('button, summary, a') ?? [])].filter((e) => e.offsetParent).map((e) => ({ t: (e.textContent || '').trim().slice(0, 30), h: Math.round(e.getBoundingClientRect().height) })).filter((x) => x.h < 44);
          return { scrollW: document.documentElement.scrollWidth, innerW: innerWidth, overflowX: document.documentElement.scrollWidth > innerWidth, fsW: root ? Math.round(root.getBoundingClientRect().width) : null, tapsUnder44: small, text: (root?.innerText ?? '').slice(0, 1500) };
        });
      }
      if (name === 'round-waiting' && w === 360) {
        const open = p.locator('[data-action="fs-panel"]').first();
        if (await open.count()) { await open.click(); await p.waitForTimeout(300); await p.locator('.fs').first().screenshot({ path: `${out}/round-orders-editor-${w}.png` }); }
      }
      await p.close();
    }
  }
  // The plan screen's fight block, for a hack job and an extraction job.
  for (const [name, job] of [['plan-hack', 'data_pull'], ['plan-extract', 'warehouse']]) {
    const st = createNewGame({ seed: 21, startCrew: 'fresh' });
    st.jobs = [];
    addOffer(st, job);
    for (const w of [360]) {
      const p = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 1 });
      p.on('pageerror', (e) => console.log(`page error (${name}): ${e.message}`));
      await p.goto('http://localhost:5197/');
      await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st);
      await p.reload();
      await p.waitForSelector('#app *');
      const vis = (sel) => p.locator(sel).filter({ visible: true }).first();
      await vis('[data-action="nav"][data-id="jobs"]').click();
      await vis('[data-action="open-job"]').click();
      const loud = p.locator('[data-action="approach"][data-id="loud"]');
      if (await loud.count()) await loud.first().click();
      await vis('[data-action="joss"]').click();
      await p.addStyleTag({ content: '.topbar, header { position: static !important; }' });
      await p.waitForSelector('.fs--plan', { timeout: 6000 }).catch(() => console.log(name, 'no plan block'));
      await p.waitForTimeout(500);
      const card = p.locator('.fs--plan').first();
      if (await card.count()) await card.screenshot({ path: `${out}/${name}-${w}.png` });
      if (checks) report[`${name}-${w}`] = await p.evaluate(() => { const r = document.querySelector('.fs--plan'); return { overflowX: document.documentElement.scrollWidth > innerWidth, tapsUnder44: [...(r?.querySelectorAll('button') ?? [])].filter((e) => e.offsetParent && e.getBoundingClientRect().height < 44).map((e) => e.textContent.trim()), text: r?.innerText }; });
      await p.close();
    }
  }
  if (checks) console.log(JSON.stringify(report, null, 1));
} finally { await b.close(); try { process.kill(-srv.pid); } catch {} }
