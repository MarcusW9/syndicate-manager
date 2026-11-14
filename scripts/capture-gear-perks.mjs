// Capture (2026-11-14, gear perks): stages what a normal scripted run might not drop. A stash holding one item of
// each live tier with its perks, a perk's line opened by a tap, a runner wearing and carrying perked gear (and
// the sheet for a slot), and a real job report whose loot line is a Custom or Premium drop with its perks. Also
// checks the screens at 360px wide for sideways overflow and prints the height of every perk row and button.
// Run: node scripts/capture-gear-perks.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoRun } from '../src/core/autorun.js';
import { makeItem } from '../src/core/gear.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// The stash: one of each live tier, different types, so every kind of perk line shows.
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.cash = 40000;
s.stash = [['rifle', 'standard'], ['vest', 'verified'], ['pistol', 'custom'], ['reflex', 'premium'], ['rifle', 'premium'], ['deck', 'custom']].map(([type, tier]) => makeItem(s, type, tier));
const op = s.crew[0];
op.gear = {
  armour: makeItem(s, 'vest', 'custom'),
  implants: [makeItem(s, 'cortex', 'premium')],
  bag: [{ item: makeItem(s, 'drone', 'premium'), x: 0, y: 0 }, { item: makeItem(s, 'medkit', 'custom'), x: 3, y: 0 }],
};

// A real job whose drop is a Custom or Premium item: the report in the inbox.
function reportState() {
  for (let seed = 1; seed < 800; seed++) {
    let g = createNewGame({ seed, startCrew: 'fresh' });
    g.jobs = [];
    addOffer(g, 'clinic');
    g = M.startMission(g, g.jobs[0].id, g.crew.slice(0, templateById('clinic').crewSize).map((o) => o.id), 'stealth');
    const done = M.closeMission(autoRun(g, 'steady'));
    const line = done.inbox.find((m) => m.type === 'report')?.timeline?.outcome.find((o) => o.perks?.length >= 2);
    if (line) { done.inbox = done.inbox.filter((m) => m.id !== 'welcome'); return { state: done, tier: line.tier, seed }; }
  }
  throw new Error('no premium drop found');
}
const rep = reportState();
console.log(`report seed ${rep.seed}: ${rep.tier}`);

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
    await p.evaluate(() => document.querySelector('.gearlist')?.scrollIntoView({ block: 'start' }));
    const p0 = await b.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 }); // a page of its own: the bars are hidden for this one
    await load(p0, s);
    await tap(p0, '[data-action="nav"][data-id="tong"]'); await p0.waitForTimeout(300);
    await tap(p0, '[data-action="tong-tab"][data-id="armoury"]'); await p0.waitForTimeout(500);
    await p0.evaluate(() => document.querySelectorAll('*').forEach((e) => { if (['fixed', 'sticky'].includes(getComputedStyle(e).position)) e.style.display = 'none'; })); // bars would be stitched into a tall shot
    await p0.locator('.gearlist').first().screenshot({ path: `${out}/50-armoury-stash-tiers-${w}.png` }); // the whole stash list, one item of each live tier
    await p0.close();
    await audit(p, 'armoury stash', w);
    await tap(p, '.gearrow .perk summary'); await p.waitForTimeout(200);
    await p.evaluate(() => document.querySelector('.perk[open]')?.scrollIntoView({ block: 'center' }));
    await p.screenshot({ path: `${out}/51-armoury-perk-opened-${w}.png` });
    await audit(p, 'armoury, a perk open', w);
    await tap(p, '[data-action="nav"][data-id="crew"]'); await p.waitForTimeout(300);
    await tap(p, `[data-action="open-op"][data-id="${op.id}"]`); await p.waitForTimeout(500);
    await p.evaluate(() => [...document.querySelectorAll('h2')].find((x) => /Gear/i.test(x.textContent))?.scrollIntoView({ block: 'start' }));
    await p.screenshot({ path: `${out}/52-runner-gear-perks-${w}.png` });
    await audit(p, 'runner gear', w);
    await p.evaluate(() => document.querySelector('.bag__list')?.scrollIntoView({ block: 'center' }));
    await tap(p, '.bag__list .perk summary'); await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/53-runner-bag-perk-opened-${w}.png` });
    await tap(p, '[data-action="gear-slot"][data-id="armour"]'); await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/54-gear-sheet-perks-${w}.png` });
    await audit(p, 'gear sheet', w);
    await p.close();
    const q = await b.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
    q.on('pageerror', (e) => console.error('page error', e.message));
    await load(q, rep.state);
    await tap(q, '[data-action="nav"][data-id="inbox"]'); await q.waitForTimeout(300);
    await q.locator('[data-action="open-message"]').filter({ visible: true, hasText: /completed/i }).first().click(); await q.waitForTimeout(800);
    // The report plays its steps in turn and follows them down the page: wait for the loot line's perks, then for the scrolling to stop.
    await q.locator('.timeline__results .perk summary').first().waitFor({ state: 'visible', timeout: 30000 });
    await q.evaluate(() => Promise.all([...document.querySelectorAll('.timeline li')].flatMap((li) => li.getAnimations()).map((x) => x.finished.catch(() => {}))));
    await q.waitForTimeout(500);
    await q.evaluate(() => document.querySelector('.timeline__results .perk')?.scrollIntoView({ block: 'center' }));
    await q.waitForTimeout(300);
    await q.screenshot({ path: `${out}/55-report-loot-line-${w}.png` });
    await audit(q, 'report loot line', w);
    await tap(q, '.timeline__results .perk summary'); await q.waitForTimeout(200);
    await q.evaluate(() => document.querySelector('.timeline__results .perk[open]')?.scrollIntoView({ block: 'center' }));
    await q.waitForTimeout(300);
    await q.screenshot({ path: `${out}/56-report-loot-perk-opened-${w}.png` });
    await audit(q, 'report, a perk open', w);
    await q.close();
  }
  console.log(problems.length ? `PROBLEMS: ${problems.join('; ')}` : 'no overflow, every perk row 44px or taller');
} finally {
  await b.close();
  process.kill(-srv.pid);
}
