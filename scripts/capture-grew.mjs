// Capture (2026-11-26, who grew while away, core/grew.js): an expedition's report on a phone with the crew cards
// showing who grew. The runners start a hair short of their next point in every stat, since with today's numbers a
// trip gives about a point of experience a day and a stat point costs 25 or more; one starts as a rookie one point
// short of graduating. Builds the state with the game's own core and loads it into the page.
// Run: node scripts/capture-grew.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { resolveDecision } from '../src/core/decisions.js';
import { sendExpedition, expeditionsOut } from '../src/core/expeditions.js';
import { GOALS } from '../src/data/expeditions.js';
import { pointCost, prepareOperative, primaryStat, GRADUATE_AT } from '../src/core/development.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

let s = null;
for (let seed = 1; seed < 200 && !s; seed++) for (const goal of Object.keys(GOALS)) {
  if (s) break;
  let t = createNewGame({ seed, startCrew: 'fresh' });
  const first = t.crew.find((o) => GOALS[goal].stats.includes(primaryStat(o)));
  if (!first) continue;
  const ids = [first.id, t.crew.find((o) => o.id !== first.id).id];
  for (const id of ids) {
    const op = t.crew.find((o) => o.id === id);
    prepareOperative(op);
    for (const st of Object.keys(op.stats)) op.progress[st] = Math.max(0, pointCost(op.stats[st], op.potential?.[st] ?? op.stats[st]) - 0.5);
  }
  const rookie = t.crew.find((o) => o.id === ids[0]);
  rookie.tier = 'rookie';
  const main = primaryStat(rookie);
  rookie.stats[main] = GRADUATE_AT - 1;
  rookie.potential[main] = Math.max(rookie.potential[main], GRADUATE_AT + 2);
  rookie.progress[main] = pointCost(rookie.stats[main], rookie.potential[main]) - 0.5;
  t = sendExpedition(t, { goal, district: 'nightMarket', crewIds: ids });
  for (let i = 0; i < 8 && expeditionsOut(t).length; i++) {
    t = advanceDay(t);
    for (let m = t.inbox.find((x) => x.kind === 'expedition' && !x.resolved); m; m = t.inbox.find((x) => x.kind === 'expedition' && !x.resolved)) t = resolveDecision(t, m.id, 'give');
  }
  const r = t.inbox.find((m) => m.timeline?.expedition);
  if (r?.back.growth.length >= 2 && r.back.graduated.length) s = t;
}
if (!s) throw new Error('no trip with growth and a graduation');
const report = s.inbox.find((m) => m.timeline?.expedition);

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5193', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5193/');
  await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, s);
  await p.reload(); await p.waitForTimeout(500);
  await p.evaluate((id) => document.querySelector(`[data-action="open-message"][data-id="${id}"]`)?.click(), report.id);
  await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.report')?.click()); // skip the play-in
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.rcrew')?.scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/01-phone-report-who-grew.png` });
  await p.evaluate(() => document.querySelector('.timeline__results')?.scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/02-phone-report-came-back-sharper.png` });
  // The days out, short and in full (2026-11-26).
  await p.evaluate(() => document.querySelector('.advlog--report')?.scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/03-phone-days-out-short.png` });
  await p.evaluate(() => document.querySelector('[data-action="days-full"]')?.click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.advlog--report')?.scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/04-phone-days-out-full.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
