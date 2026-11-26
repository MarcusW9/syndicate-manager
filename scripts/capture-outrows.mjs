// Capture (2026-11-26, crews out as rows that open, ui/outrows.js): City › Map's Out now with a job calling in, an
// expedition and side work out, all closed; then the expedition opened; then two across at tablet width; and Jobs ›
// Trips. Builds the state with the game's own core and loads it into the page.
// Run: node scripts/capture-outrows.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { sendExpedition, canSend, expeditionsOut } from '../src/core/expeditions.js';
import { sendOnSideTask } from '../src/core/sidetasks.js';
import { GOALS } from '../src/data/expeditions.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

let s = createNewGame({ seed: 3, startCrew: 'fresh' });
s.crew.push(...structuredClone(s.crew).map((o, i) => ({ ...o, id: `${o.id}-b`, handle: `${o.handle}${i}` })));
s.jobs = [];
addOffer(s, 'clinic');
s = sendOff(s, s.jobs[0].id, s.crew.slice(0, templateById('clinic').crewSize).map((o) => o.id), 'stealth', 'steady', { callIn: 'every' });
const free = () => s.crew.filter((o) => !o.condition.awayUntil || o.condition.awayUntil <= s.day).map((o) => o.id);
s = sendExpedition(s, { goal: 'weapon', district: 'nightMarket', crewIds: free().slice(0, 2) });
if ((s.sideBoard ?? [])[0]) s = sendOnSideTask(s, s.sideBoard[0], free().slice(0, 1));
for (let i = 0; i < 3; i++) {
  s = advanceDay(s);
  if (s.inbox.some((m) => m.kind === 'callin' && !m.resolved)) break;
}
const tripId = expeditionsOut(s)[0]?.id;

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5191', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p) => {
  await p.goto('http://localhost:5191/');
  await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, s);
  await p.reload(); await p.waitForTimeout(500);
};
const toOutNow = async (p) => {
  await p.locator('[data-action="nav"][data-id="city"]').first().click(); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.outrows')?.scrollIntoView({ block: 'start' })); await p.waitForTimeout(200);
};
try {
  const phone = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await load(phone); await toOutNow(phone);
  await phone.screenshot({ path: `${out}/01-phone-out-now.png` });
  await phone.locator(`[data-action="out-open"][data-id="trip-${tripId}"]`).click(); await phone.waitForTimeout(300);
  await phone.evaluate(() => document.querySelector('.outrow.is-open')?.scrollIntoView({ block: 'start' })); await phone.waitForTimeout(200);
  await phone.screenshot({ path: `${out}/02-phone-trip-open.png` });
  const job = s.awayJobs[0]?.mission.jobId;
  await phone.locator(`[data-action="out-open"][data-id="job-${job}"]`).click(); await phone.waitForTimeout(300);
  await phone.evaluate(() => document.querySelector('.outrow.is-open')?.scrollIntoView({ block: 'start' })); await phone.waitForTimeout(200);
  await phone.screenshot({ path: `${out}/03-phone-job-open.png` });
  await phone.locator('[data-action="nav"][data-id="jobs"]').first().click(); await phone.waitForTimeout(300);
  await phone.locator('[data-action="jobs-tab"][data-id="expeditions"]').first().click(); await phone.waitForTimeout(300);
  await phone.screenshot({ path: `${out}/04-phone-jobs-trips.png` });
  const tab = await b.newPage({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2 });
  await load(tab); await toOutNow(tab);
  await tab.screenshot({ path: `${out}/05-tablet-out-now.png` });
  const land = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
  await load(land); await toOutNow(land);
  await land.screenshot({ path: `${out}/06-landscape-out-now.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
