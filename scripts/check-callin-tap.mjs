// Check (2026-11-24): an open call-in message on Today at landscape phone sizes. Taps "Take the call" the way a finger
// would (a plain Playwright click: no force, no el.click()), so a bar laid over the button fails it. Also checks every
// button in the open message is 44px tall and inside the viewport once scrolled to.
//   node scripts/check-callin-tap.mjs [out dir]     shots go to the dir when given
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = process.argv[2] ? resolve(process.argv[2]) : null;
if (out) mkdirSync(out, { recursive: true });
const SIZES = [[844, 390], [932, 430], [667, 375], [390, 844], [1280, 800]];

// A morning with a crew calling in.
let calling = null;
for (let seed = 1; seed < 300 && !calling; seed++) {
  let s = createNewGame({ seed, startCrew: 'fresh' }); s.jobs = [];
  addOffer(s, 'warehouse', { rng: () => 0.5 });
  const job = s.jobs.find((j) => j.templateId === 'warehouse');
  s = sendOff(s, job.id, s.crew.slice(0, 3).map((o) => o.id), 'stealth', 'steady', { callIn: 'every' });
  s = advanceDay(s);
  if (s.inbox.some((m) => m.kind === 'callin' && !m.resolved)) calling = s;
}
if (!calling) throw new Error('no morning with a crew calling in');
const msg = calling.inbox.find((m) => m.kind === 'callin' && !m.resolved);

const root = new URL('..', import.meta.url).pathname;
const port = 5800 + Math.floor(Math.random() * 90);
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
let failed = 0;
try {
  for (const [w, h] of SIZES) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: out ? 2 : 1 });
    await p.goto(`http://localhost:${port}/`);
    await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, calling);
    await p.reload(); await p.waitForTimeout(500);
    await p.locator(`[data-action="open-message"][data-id="${msg.id}"]`).filter({ visible: true }).first().click();
    await p.waitForTimeout(300);
    // Crew names in the text are inline links (.namelink), sized by the line they sit in, so they are left out of the 44px count.
    const btns = p.locator(".inbox__detail button:not(.namelink), .inbox__detail a[href]").filter({ visible: true });
    const small = [];
    for (let i = 0; i < await btns.count(); i++) {
      const el = btns.nth(i);
      await el.scrollIntoViewIfNeeded();
      const r = await el.boundingBox();
      if (r.height < 44) small.push(`${(await el.textContent()).trim().slice(0, 30)} ${Math.round(r.height)}px`);
    }
    const take = p.locator('[data-action="take-call"]').filter({ visible: true }).first();
    await take.scrollIntoViewIfNeeded();
    if (out) await p.screenshot({ path: `${out}/${w}x${h}-callin-open.png` });
    let tap = 'ok';
    try { await take.click({ timeout: 2500 }); } catch (e) { tap = `FAILED: ${(/intercepts pointer events/.test(e.message) ? e.message.match(/<[^>]+> from <[^>]+> subtree intercepts|<[^>]+> intercepts/)?.[0] : e.message.split('\n')[0])}`; }
    await p.waitForTimeout(400);
    const moved = tap === 'ok' ? await p.evaluate(() => !document.querySelector('[data-action="take-call"]')) : false;
    if (tap !== 'ok' || !moved || small.length) failed++;
    console.log(`${w}x${h}: tap ${tap}${tap === 'ok' ? (moved ? ', the call opened' : ', but nothing happened') : ''}; under 44px: ${small.join(', ') || 'none'}`);
    await p.close();
  }
} finally { await b.close(); process.kill(-srv.pid); }
process.exit(failed ? 1 : 0);
