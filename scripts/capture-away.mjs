// Capture (2026-11-04, away-crew call-ins): on a phone (390), the planning screen's How and Call me
// in; Today with a crew out; Today with a crew waiting on a call; the call on the watch screen; the
// end-of-day card. Builds the states with the game's own core and loads them into the page.
// Run: node scripts/capture-away.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { sendOff, needsPlayer, autoStep } from '../src/core/autorun.js';
import { takeCall, canLetRun } from '../src/core/away.js';
import { advanceDay } from '../src/core/time.js';
import { chooseOption, crisisOdds, currentStep, resolvePending, describePending, resolveCritical } from '../src/core/mission.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const fresh = (seed) => { const s = createNewGame({ seed, startCrew: 'fresh' }); s.jobs = []; addOffer(s, 'penthouse'); addOffer(s, 'clinic'); return s; };
const send = (s, tid, n, callIn) => sendOff(s, s.jobs.find((j) => j.templateId === tid).id, s.crew.filter((o) => !o.condition.awayUntil).slice(0, n).map((o) => o.id), 'stealth', 'steady', { callIn });

// A day with one crew out (hands-off) and one waiting on a call.
let calling = null;
for (let seed = 1; seed < 200 && !calling; seed++) {
  let s = send(send(fresh(seed), 'clinic', 2, 'never'), 'penthouse', 3, 'every');
  s = advanceDay(s);
  if (s.awayJobs.length === 2 && s.inbox.some((m) => m.kind === 'callin' && !m.resolved) && s.awayJobs.some((j) => !j.waiting && j.mission.templateId === 'clinic')) calling = s;
  if (!calling) { s = advanceDay(s); }
}
if (!calling) throw new Error('no crew called in');
const quiet = structuredClone(calling); // Today without the call: the clinic crew only
quiet.awayJobs = quiet.awayJobs.filter((j) => !j.waiting); quiet.inbox = quiet.inbox.filter((m) => m.kind !== 'callin');
let onCall = takeCall(calling, calling.awayJobs.find((j) => j.waiting).mission.jobId);
let dayEnd = onCall;
const answer = (s) => {
  const am = s.activeMission;
  if (am.critical) return resolveCritical(s, 'extract');
  if (am.pending) return resolvePending(s, describePending(s).choices.find((c) => c.exit)?.id ?? describePending(s).choices[0].id);
  if (currentStep(am)?.type === 'crisis') { const o = crisisOdds(s); return chooseOption(s, (o.filter((x) => !x.exit).sort((a, b) => b.chance - a.chance)[0] ?? o[0]).choice.id); }
  return autoStep(s);
};
for (let g = 0; g < 300 && !dayEnd.activeMission.done && !canLetRun(dayEnd); g++) dayEnd = needsPlayer(dayEnd) ? answer(dayEnd) : autoStep(dayEnd);

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5189/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  // 01: planning a job: How and Call me in.
  await load(p, fresh(21));
  await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
  await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(300);
  if (await p.locator('[data-action="toggle-orders"][aria-expanded="false"]').count()) await p.locator('[data-action="toggle-orders"]').first().click(); // The plan's orders fold to one line (2026-11-05): open them first.
  await p.locator('[data-action="mode"]').first().scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, 250));
  await p.screenshot({ path: `${out}/01-plan-how.png` });
  // 02: Today with a crew out. 03: a crew waiting on a call.
  await load(p, quiet); await p.screenshot({ path: `${out}/02-today-crew-out.png` });
  await load(p, calling); await p.screenshot({ path: `${out}/03-today-call-waiting.png` });
  // 04: the call on the watch screen. 05: the end of the day.
  await load(p, onCall); await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/04-the-call.png` });
  if (!dayEnd.activeMission.done) { await load(p, dayEnd); await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/05-day-done.png` }); }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
