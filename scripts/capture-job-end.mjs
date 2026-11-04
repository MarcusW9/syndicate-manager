// A job played to the end (2026-11-03): checks the feed keeps the newest moment in view as it
// plays, and captures the finished job, which now keeps the map and feed with the summary at the
// end of the feed. Run: node scripts/capture-job-end.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const out = process.argv[2];
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5197', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h, tag] of [[1180, 820, 'ipad-landscape'], [390, 844, 'phone']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 900 ? 2 : 1 });
    await p.goto('http://localhost:5197/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    const vis = (sel) => p.locator(sel).filter({ visible: true }).first();
    await vis('[data-action="nav"][data-id="jobs"]').click();
    await vis('[data-action="open-job"]').click();
    await vis('[data-action="joss"]').click();
    // The squad board (2026-10-27): Joss fills it, then the call-in setting is chosen.
    const every = vis('[data-action="callin"][data-id="every"]');
    if (await every.count()) await every.click();
    // Watching it live (2026-11-04): jobs may default to sending the crew away.
    const live = vis('[data-action="mode"][data-id="live"]');
    if (await live.count()) await live.click();
    await vis('[data-action="start-job"]').click();
    await vis('[data-action="watch-speed"]').click();
    let checks = 0; let missed = 0; let lastCount = 0;
    for (let i = 0; i < 600; i++) {
      if (await p.locator('[data-action="close-mission"]').filter({ visible: true }).count()) break;
      const tap = async (sel) => { const l = vis(sel); if (await l.count()) { await l.click(); return true; } return false; };
      if (await tap('[data-action="fight-hand-off"]')) continue;
      if (await tap('[data-action="critical"][data-id="extract"]')) continue;
      const opts = p.locator('[data-action="choose"]:not([disabled])').filter({ visible: true });
      if (await opts.count()) { for (let k = 0; k < await opts.count(); k++) { if (!/abort/.test(await opts.nth(k).getAttribute('data-id'))) { await opts.nth(k).click(); break; } } continue; }
      if (await tap('[data-action="pending"]:not([data-id="out"])')) continue;
      await p.waitForTimeout(400);
      // Following: when a new moment has arrived and no call-in is up, the newest one is in view.
      const r = await p.evaluate(() => {
        const items = document.querySelectorAll('.watch__feed > *'); const last = items[items.length - 1];
        if (!last || document.querySelector('.watch.is-calling')) return { n: items.length, skip: true };
        const box = last.getBoundingClientRect(); const side = document.querySelector('.watch__side').getBoundingClientRect();
        const bar = document.querySelector('.watch__bar')?.getBoundingClientRect().top ?? innerHeight;
        return { n: items.length, inView: box.top < Math.min(innerHeight, side.bottom, bar) && box.bottom > 0 };
      });
      if (!r.skip && r.n > lastCount) { checks++; if (!r.inView) missed++; }
      lastCount = r.n;
    }
    await p.waitForTimeout(800);
    console.log(tag, `follow checks ${checks}, newest out of view ${missed}`);
    await p.screenshot({ path: `${out}/job-end-${tag}.png` });
  }
} finally { await b.close(); process.kill(-srv.pid); }
