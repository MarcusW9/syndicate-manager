// Capture (2026-11-24): Today as the desk (decisions with their answers, Joss's line, the crew, the news log) beside the
// classic inbox (Save › Look, pref "today-classic"), on a busy day: a fresh game played some days with jobs left open,
// so the board fills and messages pile up. Sizes: a tablet on its side (1000x690, the owner's iPad), a phone (390x844),
// a phone on its side (844x390) and a desktop (1440x900), 1x. Run: node scripts/capture-desk.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay, isBlocked } from '../src/core/time.js';
import { sendOff } from '../src/core/autorun.js';
import { availability } from '../src/core/crew.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
// Two weeks of sending pairs out hands-off (reports pile up unread), the last one set to call in at a crisis.
let state = createNewGame({ seed: 11, startCrew: 'fresh' });
for (let d = 0; d < 14; d++) {
  const free = state.crew.filter((o) => availability(state, o).ok);
  if (state.jobs.length && free.length >= 2) state = sendOff(state, state.jobs[0].id, free.slice(0, 2).map((o) => o.id), 'stealth', 'steady', { callIn: d === 12 ? 'crisis' : 'never' });
  if (isBlocked(state)) break;
  state = advanceDay(state);
  if (isBlocked(state)) break;
}

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5196', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st, classic) => {
  await p.goto('http://localhost:5196/');
  await p.evaluate(([x, c]) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); if (c) localStorage.setItem('syndicate-pref-today-classic', '1'); }, [st, classic]);
  await p.reload(); await p.waitForTimeout(500);
};
// a quiet day too: a fresh game's second day
const quiet = advanceDay(createNewGame({ seed: 7, startCrew: 'fresh' }));
const sizes = [['tablet', { width: 1000, height: 690 }], ['phone', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }], ['desktop', { width: 1440, height: 900 }]];
try {
  let n = 60; // numbered after the standard set (01 to 48), as in docs/screenshots/2026-11-24-today-desk
  for (const [tag, vp] of sizes) {
    for (const classic of [false, true]) {
      const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
      await load(p, state, classic);
      await p.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-${tag}-${classic ? 'classic' : 'desk'}.png`, fullPage: tag === 'phone' });
      if (!classic && tag === 'tablet') {
        const card = p.locator('.dcard [data-action="open-message"]').filter({ visible: true }).first();
        if (await card.count()) { await card.click(); await p.waitForTimeout(300); await p.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-${tag}-desk-open.png` }); }
      }
      await p.close();
    }
  }
  const p = await b.newPage({ viewport: sizes[0][1], deviceScaleFactor: 1 });
  await load(p, quiet, false);
  await p.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-tablet-desk-quiet.png` });
  await p.close();
  console.log('day', state.day, 'inbox', state.inbox.length, 'jobs', state.jobs.length);
} finally {
  await b.close();
  process.kill(-srv.pid);
}
