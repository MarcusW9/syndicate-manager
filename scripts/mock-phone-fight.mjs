// Mock-up (2026-11-03, fight redesign step 4): the phone fight layout, prototyped on the real game
// with injected CSS, before building it. Map on top, the latest of the log under it, a bottom sheet
// with a crew strip, the picked runner's actions and a sticky Go bar with "⋯".
//   node scripts/mock-phone-fight.mjs <out dir>
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { autoStep, needsPlayer } from '../src/core/autorun.js';
import { arm } from '../tests/play.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const repo = new URL('..', import.meta.url).pathname;
const out = process.argv[2];
mkdirSync(out, { recursive: true });

function fightState() {
  for (let seed = 1; seed < 3000; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    for (const op of s.crew) for (const k of Object.keys(op.stats)) op.stats[k] = Math.min(20, op.stats[k] + 4);
    arm(s, s.crew[0].id, 'pistol:pro', 'vest'); arm(s, s.crew[1].id, 'pistol');
    s.jobs = []; addOffer(s, 'warehouse');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 4).map((o) => o.id), 'loud', { callIn: 'risky', orders: 'steady' });
    for (let g = 0; g < 300 && !s.activeMission.done; g++) {
      const am = s.activeMission;
      if (am.battle && !am.pending && needsPlayer(s) && am.battle.guards.length >= 3 && !am.battle.ambush) return s;
      const next = autoStep(s); s = next !== s ? next : autoStep(s, { force: true });
    }
  }
  throw new Error('no fight');
}

const CSS = `
  body { overflow: hidden !important; }
  #app, #app > *, main { contain: none !important; filter: none !important; will-change: auto !important; transform: none !important; backdrop-filter: none !important; content-visibility: visible !important; overflow: visible !important; clip-path: none !important; }
  .watch { position: fixed; left: 0; right: 0; top: var(--mk-top); bottom: 0; z-index: 60; display: flex !important; flex-direction: column; gap: 0 !important; background: var(--bg); padding: 0 !important; margin: 0 !important; }
  .watch__live { position: static !important; flex: 0 0 auto; padding: 0 !important; }
  .watch__live .siteplan { height: 40svh !important; }
  .watch__tally, .watch__bar, .watch__feed, .ffo-last, .ffo-intents--none, .ffo-title { display: none !important; }
  .mk-log { display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 6px 12px; border-bottom: 1px solid var(--line); background: var(--panel); font-size: 0.82rem; line-height: 1.35; color: var(--text); }
  .mk-log p { margin: 0; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .mk-log b { font: 700 0.7rem var(--display); letter-spacing: 0.12em; color: var(--accent-2); text-transform: uppercase; }
  .mk-log span { color: var(--muted); font-size: 0.75rem; white-space: nowrap; }
  .watch__side { flex: 1; min-height: 0; overflow: auto; max-height: none !important; padding: 0 !important; }
  .watch__callin { margin: 0 !important; }
  .ffo { border: 0 !important; clip-path: none !important; padding: 8px 12px 0 !important; gap: 8px !important; min-height: 100%; align-content: start; }
  .mk-head { display: flex; align-items: center; justify-content: space-between; font: 700 0.78rem var(--display); letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent-2); }
  .mk-head span { color: var(--accent); } .mk-head button { min-width: 36px; min-height: 36px; border: 1px solid var(--line); background: var(--panel-2); color: var(--muted); font: 700 0.9rem var(--display); }
  .ffo-crew { display: flex !important; gap: 6px !important; overflow-x: auto; margin: 0 -12px; padding: 0 12px 2px; scrollbar-width: none; }
  .ffo-row { flex: 0 0 132px; grid-template-columns: 1fr !important; }
  .ffo-who { padding: 4px 6px 0 !important; } .ffo-who .face { width: 28px !important; height: 28px !important; }
  .ffo-who__top .ffo-cover { display: none; }
  .ffo-hpbar { width: 36px !important; }
  .ffo-tag { justify-content: flex-start !important; text-align: left !important; min-height: 30px !important; padding: 2px 8px 4px !important; font-size: 0.7rem !important; border-left: 0 !important; white-space: nowrap; overflow: hidden; }
  .ffo-tray { border-top: 0 !important; padding-top: 0 !important; padding-bottom: 8px; }
  .ffo-threat { font-size: 0.72rem !important; }
  .ffo-targets { flex-wrap: nowrap !important; overflow-x: auto; margin: 0 -12px; padding: 0 12px; }
  .ffo-target { flex: none; min-height: 40px !important; padding: 3px 8px !important; }
  .ffo-act { min-height: 44px !important; padding: 5px 10px !important; }
  .ffo-bar, .ffo-confirm { position: sticky; bottom: 0; margin: 0 -12px; padding: 8px 12px calc(8px + env(safe-area-inset-bottom)); background: linear-gradient(transparent, var(--bg) 14px); display: grid !important; grid-template-columns: auto 1fr auto !important; gap: 6px; }
  .ffo-confirm { grid-template-columns: 1fr !important; background: #160f08; border-top: 1px solid #4a3f1a; }
  .ffo-bar [data-action="fight-auto"], .ffo-bar [data-action="fight-hand-off"] { display: none; }
  .ffo-go { grid-column: auto !important; min-height: 48px !important; }
  .mk-more { min-width: 48px; min-height: 48px; border: 1px solid var(--line); background: var(--panel-2); color: var(--text); font: 700 1.1rem var(--display); }
  .mk-menu { position: absolute; right: 12px; bottom: 64px; display: grid; min-width: 220px; border: 1px solid var(--line); background: var(--panel-2); box-shadow: 0 -8px 24px #000a; }
  .mk-menu button { min-height: 48px; text-align: left; padding: 6px 14px; border: 0; border-bottom: 1px solid var(--line); background: none; color: var(--text); font: 700 0.85rem var(--display); letter-spacing: 0.1em; text-transform: uppercase; }
  .mk-menu small { display: block; font: 500 0.72rem system-ui, sans-serif; letter-spacing: 0; text-transform: none; color: var(--muted); }
  .mk-sheet-log { position: absolute; inset: 0; z-index: 6; overflow: auto; background: var(--bg); padding: 10px 12px; }
  .mk-sheet-log .watch__feed { display: block !important; }
`;

// Rebuild the mock bits after each re-render (the panel is redrawn on every tap).
const DECORATE = (menu) => {
  // The page's panels clip (cut corners) and so would clip the full-screen layer: let it out.
  for (let n = document.querySelector('.watch').parentElement; n && n !== document.body; n = n.parentElement) Object.assign(n.style, { clipPath: 'none', overflow: 'visible', contain: 'none', transform: 'none', filter: 'none' });
  const top = document.querySelector('.topbar, header')?.getBoundingClientRect().bottom ?? 0;
  document.documentElement.style.setProperty('--mk-top', `${top}px`);
  const live = document.querySelector('.watch__live');
  if (!document.querySelector('.mk-log')) {
    const items = [...document.querySelectorAll('.watch__feed .wf-item, .watch__feed > *')].filter((n) => n.textContent.trim());
    const lastTxt = items.at(-1)?.innerText.split('\n').filter(Boolean).slice(-2).join(' ') ?? '';
    const log = document.createElement('div'); log.className = 'mk-log';
    log.innerHTML = `<p><b>Round 1</b> ${lastTxt}</p><span>Log ▾</span>`;
    live.after(log);
  }
  const ffo = document.querySelector('.ffo');
  if (ffo && !ffo.querySelector('.mk-head')) {
    const t = ffo.querySelector('.ffo-title');
    const h = document.createElement('div'); h.className = 'mk-head';
    h.innerHTML = `<div>Fight · round 1 · <span>${t?.querySelector('span')?.textContent ?? ''}</span></div><button>?</button>`;
    ffo.prepend(h);
    const bar = ffo.querySelector('.ffo-bar');
    if (bar) { const m = document.createElement('button'); m.className = 'mk-more'; m.textContent = '⋯'; bar.append(m); }
  }
  if (menu && !document.querySelector('.mk-menu')) {
    const m = document.createElement('div'); m.className = 'mk-menu';
    m.innerHTML = '<button>Auto round<small>Play this round on the crew’s calls</small></button><button>Auto fight<small>Leave the rest of the fight to them</small></button><button>How fights work<small>The rules, in full</small></button>';
    document.querySelector('.watch__side').append(m);
  }
};

const s = fightState();
const port = 5962;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.error('page error', e.message));
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate((json) => { localStorage.clear(); localStorage.setItem('syndicate-slot-1', json); localStorage.setItem('syndicate-active-slot', '1'); }, JSON.stringify(s));
  await page.reload();
  await page.waitForSelector('.ffo');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({ content: CSS });
  await page.waitForTimeout(4000);
  await page.evaluate(DECORATE, false);
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, 'a-start.png') });
  // An order or two given: flank, then the next runner hunkers; their tray is on screen.
  if (await page.locator('.ffo-target').count() > 1) await page.locator('.ffo-target').nth(1).dispatchEvent('click');
  const flank = page.locator('.ffo-act[data-kind="flank"]');
  await ((await flank.count()) ? flank : page.locator('.ffo-act[data-kind="shoot"]')).first().dispatchEvent('click');
  await page.waitForTimeout(400);
  await page.evaluate(DECORATE, false);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(out, 'b-order-given.png') });
  await page.evaluate(DECORATE, true);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, 'c-more-menu.png') });
  await page.evaluate(() => document.querySelector('.mk-menu')?.remove());
  await page.locator('[data-action="fight-pull-ask"]').dispatchEvent('click');
  await page.waitForTimeout(400);
  await page.evaluate(DECORATE, false);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, 'd-pull-back.png') });
} finally { await browser.close(); server.kill(); }
