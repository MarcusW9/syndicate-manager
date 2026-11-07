// Capture (2026-11-07, the owner's playtest): the plan bar with Send / Watch live and the orders as
// chips under it (a wide computer, 1600), the squad cards with each runner's main gear drawn, and
// the same board on a phone (390). Later steps add the other playtest changes.
// Run: node scripts/capture-playtest-1107.mjs <out dir> [only]
import { createNewGame } from '../src/core/state.js';
import { loadoutOf } from '../src/core/gear.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out, only] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
const kits = [['rifle'], ['drone'], ['deck', 'medkit'], ['pistol'], []];
s.crew.forEach((op, i) => { op.gear = loadoutOf(s, kits[i % kits.length]); });
const job = s.jobs[0];

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5195', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5195/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(500); };
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
const want = (k) => !only || only === k;
try {
  if (want('plan')) {
    const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await load(p, s);
    await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(300);
    await tap(p, `[data-action="open-job"][data-id="${job.id}"]`); await p.waitForTimeout(600);
    await tap(p, '[data-action="joss"]'); await p.waitForTimeout(400);
    await tap(p, '[data-action="pick-slot"][data-id="over"]'); await p.waitForTimeout(400);
    await tap(p, '.sheet [data-action="assign"]:not([disabled])'); await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/24-plan-send-watch-orders.png` });
    await p.locator('.board').screenshot({ path: `${out}/25-board-gear.png` });
    const q = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await load(q, s);
    await tap(q, '[data-action="nav"][data-id="jobs"]'); await q.waitForTimeout(300);
    await tap(q, `[data-action="open-job"][data-id="${job.id}"]`); await q.waitForTimeout(600);
    await tap(q, '[data-action="joss"]'); await q.waitForTimeout(400);
    await q.locator('.board').scrollIntoViewIfNeeded();
    await q.screenshot({ path: `${out}/26-board-gear-phone.png` });
  }
  // The face-off over the map on a live job, on a phone and a computer: as the die tumbles, then
  // as it lands; then the finished job's report with who went at the top.
  if (want('watch')) {
    for (const [w, h, tag, dpr] of [[390, 844, 'phone', 2], [1440, 900, 'desktop', 1]]) {
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
      p.on('pageerror', (e) => console.error('page error', e.message));
      await load(p, s);
      await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(300);
      await tap(p, `[data-action="open-job"][data-id="${job.id}"]`); await p.waitForTimeout(600);
      await tap(p, '[data-action="joss"]'); await p.waitForTimeout(400);
      await tap(p, '[data-action="start-job"]');
      let got = { rolling: false, landed: false };
      for (let i = 0; i < 400 && !(got.rolling && got.landed); i++) {
        if (!got.rolling && await p.locator('.duel.is-rolling').count()) { await p.screenshot({ path: `${out}/27-duel-rolling-${tag}.png` }); got.rolling = true; }
        if (!got.landed && await p.locator('.duel.is-landed').count()) { await p.waitForTimeout(350); await p.screenshot({ path: `${out}/28-duel-landed-${tag}.png` }); got.landed = true; }
        // a call-in: take the first offered choice so the run carries on
        const c = p.locator('.watch__callin button:not([disabled])').filter({ visible: true });
        if (await c.count()) await c.first().click().catch(() => {});
        await p.waitForTimeout(50);
      }
      if (tag === 'phone') {
        for (let i = 0; i < 600; i++) {
          if (await p.locator('.watch.is-done').count()) break;
          const c = p.locator('.watch__callin button:not([disabled])').filter({ visible: true });
          if (await c.count()) await c.first().click().catch(() => {});
          await p.waitForTimeout(100);
        }
        await p.locator('.watch__end button').filter({ visible: true }).first().click().catch(() => {}); await p.waitForTimeout(500);
        await tap(p, '[data-action="nav"][data-id="inbox"]').catch(() => {}); await p.waitForTimeout(400);
        await p.locator('[data-action="open-message"]:has(.tag--report)').filter({ visible: true }).first().click(); await p.waitForTimeout(500);
        await p.evaluate(() => window.scrollTo(0, 0));
        await p.waitForTimeout(4000);
        await p.screenshot({ path: `${out}/29-report-crew-phone.png` });
        // Today with the unread filter
        await tap(p, '[data-action="back"]').catch(() => {}); await p.waitForTimeout(300);
        await tap(p, '[data-action="inbox-filter"][data-id="unread"]').catch(() => {}); await p.waitForTimeout(300);
        await p.locator('.inboxfilter').scrollIntoViewIfNeeded().catch(() => {});
        await p.screenshot({ path: `${out}/30-today-unread-phone.png` });
      }
    }
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
