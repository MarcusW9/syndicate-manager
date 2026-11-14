// Capture (2026-11-14, Apex gear): stages what a normal scripted run almost never shows, because an Apex piece is a
// 1-in-100 drop. An Armoury stash holding Apex pieces with their history and unique perk, a perk opened by a tap, a runner
// carrying one, the gear sheet offering a second one as a swap, saying which piece goes back to the stash, and a real job report whose gear line is an Apex find
// (the job is played for real in this script with the tier odds forced to Apex, so the report and the stash are what a
// lucky drop would give). Checks every screen at 360 and 390 wide for sideways overflow and prints the height of every perk row.
// Run: node scripts/capture-gear-apex.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoRun } from '../src/core/autorun.js';
import { makeItem, makeApex } from '../src/core/gear.js';
import { LOOT, TIERS } from '../src/data/gear.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// The stash: three Apex pieces among ordinary gear. One runner carries Signal Ten, so the gear sheet has a second to swap in.
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.cash = 40000;
const op = s.crew[0];
op.gear = { armour: makeItem(s, 'vest', 'verified'), implants: [], bag: [{ item: makeApex(s, 'signalten'), x: 0, y: 0 }] };
s.stash = [makeApex(s, 'winningpost'), makeApex(s, 'meterghost'), makeApex(s, 'secondshift'), makeItem(s, 'rifle', 'premium'), makeItem(s, 'deck', 'standard')];

// A real job with the odds forced so its drop is an Apex piece: the report in the inbox.
function reportState() {
  const { chance } = LOOT; const { drop } = TIERS.apex;
  LOOT.chance = 1; TIERS.apex.drop = 100;
  try {
    for (let seed = 1; seed < 200; seed++) {
      let g = createNewGame({ seed, startCrew: 'fresh' });
      g.jobs = [];
      addOffer(g, 'clinic');
      g = M.startMission(g, g.jobs[0].id, g.crew.slice(0, templateById('clinic').crewSize).map((o) => o.id), 'stealth');
      const done = M.closeMission(autoRun(g, 'steady'));
      const line = done.inbox.find((m) => m.type === 'report')?.timeline?.outcome.find((o) => o.apex);
      if (line) { done.inbox = done.inbox.filter((m) => m.id !== 'welcome'); return { state: done, apex: line.apex, seed }; }
    }
  } finally { LOOT.chance = chance; TIERS.apex.drop = drop; }
  throw new Error('no apex drop found');
}
const rep = reportState();
console.log(`report seed ${rep.seed}: ${rep.apex}`);

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5194', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5194/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(600); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const problems = [];
/** Sideways overflow, and the size of every tap target a perk or a gear row adds. */
const audit = async (p, label, w) => {
  const r = await p.evaluate((vw) => {
    const over = [...document.querySelectorAll('.gearrow *, .loadout *, .perks *, .timeline__results *, .bag__list *')].filter((e) => e.getBoundingClientRect().right > vw + 0.5 && e.getBoundingClientRect().width > 0).map((e) => `${e.tagName}.${e.className}`.slice(0, 60));
    const rows = [...document.querySelectorAll('.perk summary')].map((e) => Math.round(e.getBoundingClientRect().height));
    return { scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth, over: [...new Set(over)], rows };
  }, w);
  console.log(`${w}px ${label}: page overflow ${r.scroll}px, ${r.rows.length} perk rows (min height ${Math.min(...r.rows, 999)}px), ${r.over.length ? `elements past the edge: ${r.over.join(', ')}` : 'nothing past the edge'}`);
  if (r.scroll > 0 || r.over.length || r.rows.some((h) => h < 44)) problems.push(`${w} ${label}`);
};
try {
  for (const w of [390, 360]) {
    const p = await b.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await load(p, s);
    await tap(p, '[data-action="nav"][data-id="tong"]'); await p.waitForTimeout(300);
    await tap(p, '[data-action="tong-tab"][data-id="armoury"]'); await p.waitForTimeout(500);
    const p0 = await b.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 }); // a page of its own: the bars are hidden for this one
    await load(p0, s);
    await tap(p0, '[data-action="nav"][data-id="tong"]'); await p0.waitForTimeout(300);
    await tap(p0, '[data-action="tong-tab"][data-id="armoury"]'); await p0.waitForTimeout(500);
    await p0.evaluate(() => document.querySelectorAll('*').forEach((e) => { if (['fixed', 'sticky'].includes(getComputedStyle(e).position)) e.style.display = 'none'; }));
    await p0.locator('.gearlist').first().screenshot({ path: `${out}/60-armoury-stash-apex-${w}.png` });
    await p0.close();
    await audit(p, 'armoury stash with Apex pieces', w);
    await p.evaluate(() => document.querySelector('.gearlist')?.scrollIntoView({ block: 'start' }));
    await tap(p, '.gearrow .perk summary'); await p.waitForTimeout(200);
    await p.evaluate(() => document.querySelector('.perk[open]')?.scrollIntoView({ block: 'center' }));
    await p.screenshot({ path: `${out}/61-armoury-apex-perk-opened-${w}.png` });
    await audit(p, 'armoury, the unique perk open', w);
    await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300);
    await tap(p, `[data-action="open-op"][data-id="${op.id}"]`); await p.waitForTimeout(500);
    await p.evaluate(() => [...document.querySelectorAll('h2')].find((x) => /Gear/i.test(x.textContent))?.scrollIntoView({ block: 'start' }));
    await p.evaluate(() => document.querySelector('.bag__list')?.scrollIntoView({ block: 'center' }));
    await tap(p, '.bag__list .perk summary'); await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/62-runner-carrying-apex-${w}.png` });
    await audit(p, 'a runner carrying Signal Ten', w);
    await p.evaluate(() => window.scrollTo(0, 0));
    await tap(p, '[data-action="bag-cell"][data-id="0,1"]'); await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/63-gear-sheet-second-apex-swap-${w}.png` });
    const swaps = await p.evaluate(() => [...document.querySelectorAll('.sheet .gearrow')].map((r) => ({ name: r.querySelector('strong')?.textContent, button: r.querySelector('[data-action="equip"]')?.textContent, disabled: r.querySelector('[data-action="equip"]')?.disabled, why: r.querySelector('.apex__swap')?.textContent ?? null })));
    console.log(`${w}px gear sheet rows: ${JSON.stringify(swaps)}`);
    if (!swaps.some((r) => r.name === 'Winning Post' && !r.disabled && r.button === 'Swap in' && /back to the stash/.test(r.why ?? ''))) problems.push(`${w} sheet does not offer the second Apex piece as a swap`);
    if (!(await p.locator('.sheet .apex__conflict').first().isVisible())) problems.push(`${w} sheet shows no conflict notice`);
    await audit(p, 'gear sheet swapping in a second Apex piece', w);
    await p.close();
    const q = await b.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
    q.on('pageerror', (e) => console.error('page error', e.message));
    await load(q, rep.state);
    await tap(q, '[data-action="nav"][data-id="inbox"]'); await q.waitForTimeout(300);
    await q.locator('[data-action="open-message"]').filter({ visible: true, hasText: /completed/i }).first().click(); await q.waitForTimeout(800);
    // The report plays its steps in turn and follows them down the page: wait for the Apex line, then for the scrolling to stop.
    await q.locator('.timeline__results .loot--apex .perk summary').first().waitFor({ state: 'visible', timeout: 30000 });
    await q.evaluate(() => Promise.all([...document.querySelectorAll('.timeline li')].flatMap((li) => li.getAnimations()).map((x) => x.finished.catch(() => {}))));
    await q.waitForTimeout(500);
    await q.evaluate(() => document.querySelector('.loot--apex')?.scrollIntoView({ block: 'center' }));
    await q.waitForTimeout(300);
    await q.screenshot({ path: `${out}/64-report-apex-loot-line-${w}.png` });
    await audit(q, 'report, an Apex loot line', w);
    await tap(q, '.loot--apex .perk summary'); await q.waitForTimeout(200);
    await q.evaluate(() => document.querySelector('.loot--apex')?.scrollIntoView({ block: 'center' }));
    await q.waitForTimeout(300);
    await q.screenshot({ path: `${out}/65-report-apex-perk-opened-${w}.png` });
    await q.close();
  }
  console.log(problems.length ? `PROBLEMS: ${problems.join('; ')}` : 'no overflow, every perk row 44px or taller');
} finally {
  await b.close();
  process.kill(-srv.pid);
}
