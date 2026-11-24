// Capture (2026-11-24, longer jobs and rewards you can see): stages what a fresh game takes weeks to show. A long
// threat-4 job's page with its route and spoils, the plan bar's "Watch each stop", a real job report whose drop is a
// Custom piece (the odds forced for the run) with the spoils card on top, Today's "New in the stash" line, the stash's
// NEW tag, and a watched long job calling in at a prep stop and on the map there. Checks each screen at 360 and 390
// wide (and 844x390) for sideways overflow.
// Run: node scripts/capture-longjobs-rewards.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById, isLongJob } from '../src/core/jobs.js';
import { autoRun, watchOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { makeItem } from '../src/core/gear.js';
import { LOOT } from '../src/data/gear.js';
import { MISSIONS } from '../src/data/missions.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

/** A game past its founding with four pros, the welcome gone, and cash in hand. */
function game(seed) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.crew = ['face', 'tech', 'muscle', 'medic'].map((role) => recruitToOperative(generateRecruit(s, { role, quality: 'pro' }), { condition: { injury: 'healthy', injuryDays: 0, fatigue: 0, morale: 70, neuralLoad: 0, awayUntil: 0 }, history: [] }));
  s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
  s.cash = 30000;
  s.reputation = 70;
  return s;
}
let n = 7;
const rng = () => ((n = (n * 9301 + 49297) % 233280) / 233280);

// 1. A long job on the board, with its prep stops.
const LONGS = MISSIONS.filter((m) => isLongJob(m) && !m.maps && m.threat >= 4);
const board = game(31);
board.jobs = [];
for (let i = 0; i < 6 && !board.jobs.some((j) => (j.prep ?? []).length >= 2); i++) addOffer(board, LONGS[i % LONGS.length].id, { rng });
const longJob = board.jobs.find((j) => (j.prep ?? []).length >= 2) ?? board.jobs[0];
console.log(`long job: ${longJob.templateId}, ${longJob.days} days, prep ${longJob.prep}`);

// 2. A real job whose drop is forced to Custom: the report, Today's line and the stash.
function reportState() {
  const rows = structuredClone(LOOT.byThreat); const chance = LOOT.chance;
  LOOT.chance = 1;
  for (const r of Object.values(LOOT.byThreat)) Object.assign(r, { verified: 0, custom: 100, premium: 0, apex: 0 });
  try {
    for (let seed = 1; seed < 100; seed++) {
      let g = game(seed);
      g.jobs = [];
      addOffer(g, 'clinic');
      g = M.startMission(g, g.jobs[0].id, g.crew.slice(0, templateById('clinic').crewSize).map((o) => o.id), 'stealth');
      const done = M.closeMission(autoRun(g, 'steady'));
      const line = done.inbox.find((m) => m.type === 'report')?.timeline?.outcome.find((o) => o.uid && o.tier === 'custom');
      if (line) { done.stash.push(makeItem(done, 'deck', 'standard')); return done; }
    }
  } finally { LOOT.byThreat = rows; LOOT.chance = chance; }
  throw new Error('no drop');
}
const rep = reportState();

// 3. A watched long job, calling in at its first stop.
function watchState() {
  for (let seed = 1; seed < 40; seed++) {
    const g = game(seed);
    g.jobs = [];
    addOffer(g, LONGS[0].id, { rng });
    if (!(g.jobs[0].prep ?? []).length) continue;
    let s = watchOff(g, g.jobs[0].id, g.crew.map((o) => o.id), 'stealth', 'steady', {});
    s = advanceDay(s);
    if (s.inbox.some((m) => m.kind === 'callin' && !m.resolved)) return s;
  }
  throw new Error('no watched call');
}
const watched = watchState();

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5196', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5196/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(700); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const problems = [];
const audit = async (p, label, w) => {
  const r = await p.evaluate((vw) => ({
    scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    over: [...new Set([...document.querySelectorAll('.spoils *, .newgear *, .routeplan *, .spoilsline, .stashrow *')].filter((e) => e.getBoundingClientRect().right > vw + 0.5 && e.getBoundingClientRect().width > 0).map((e) => `${e.tagName}.${e.className}`.slice(0, 60)))],
    small: [...document.querySelectorAll('.spoils__go .btn, .newgear__go .btn')].filter((e) => e.getBoundingClientRect().height < 43.5 && e.getBoundingClientRect().height > 0).length,
  }), w);
  if (r.scroll > 0 || r.over.length || r.small) problems.push(`${label} @${w}: scroll ${r.scroll}, over ${r.over.join(',')}, small taps ${r.small}`);
};
try {
  for (const [w, h] of [[390, 844], [360, 780], [844, 390]]) {
    const tag = `${w}x${h}`;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    // The long job's page.
    await load(p, board);
    await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(300);
    await tap(p, `[data-action="open-job"][data-id="${longJob.id}"]`); await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelector('.routeplan')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/01-long-job-route-and-spoils-${tag}.png` });
    await audit(p, 'job page', w);
    await p.evaluate(() => document.querySelector('.planbar__go')?.scrollIntoView({ block: 'end' })); await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/02-plan-bar-watch-each-stop-${tag}.png` });
    // The report with its spoils card.
    await load(p, rep);
    await tap(p, '[data-action="nav"][data-id="inbox"]'); await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/03-today-new-in-the-stash-${tag}.png` });
    await audit(p, 'today', w);
    await p.locator('[data-action="open-message"]').filter({ visible: true, hasText: /completed/i }).first().click(); await p.waitForTimeout(800);
    await p.locator('.spoils').first().waitFor({ state: 'visible', timeout: 30000 });
    await p.evaluate(() => Promise.all([...document.querySelectorAll('.timeline li, .spoils')].flatMap((li) => li.getAnimations()).map((x) => x.finished.catch(() => {}))));
    await p.evaluate(() => document.querySelector('.spoils')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/04-report-spoils-card-${tag}.png` });
    await audit(p, 'report', w);
    // The stash, with the NEW tag.
    await tap(p, '[data-action="nav"][data-id="tong"]'); await p.waitForTimeout(300);
    await tap(p, '[data-action="tong-tab"][data-id="armoury"]'); await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/05-stash-new-tag-${tag}.png` });
    await audit(p, 'stash', w);
    // A watched long job calling at its first stop, then on the map there.
    await load(p, watched);
    await tap(p, '[data-action="nav"][data-id="inbox"]'); await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/06-watched-job-calls-at-a-stop-${tag}.png` });
    await p.locator('[data-action="open-message"]').filter({ visible: true, hasText: /day 1/ }).first().click({ timeout: 5000 }).catch(() => console.log(`${tag}: the call message is not in view`)); await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/06b-watched-job-call-message-${tag}.png` });
    const take = p.locator('[data-action="take-call"]').filter({ visible: true }).first();
    if (await take.count()) {
      // At 844x390 the sticky Coming up strip sits over the reader's button (a layout issue older than this change): press it directly.
      await take.evaluate((el) => el.click()); await p.waitForTimeout(2500);
      await p.screenshot({ path: `${out}/07-watched-job-at-the-stop-${tag}.png` });
    }
    await p.close();
  }
  console.log(problems.length ? `PROBLEMS: ${problems.join('; ')}` : 'no overflow; every new button 44px or taller');
} finally {
  await b.close();
  process.kill(-srv.pid);
}
