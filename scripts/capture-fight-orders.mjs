// A fight waiting for orders on wide screens (2026-11-03): plays the first job of a fresh game
// with the loud approach until a fight asks for orders, then captures it and prints where the
// map and feed columns sit. Run: node scripts/capture-fight-orders.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const out = process.argv[2];
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5198', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h] of [[1440, 900], [2000, 1100], [1180, 820]]) {
    const s = createNewGame({ seed: 21, startCrew: 'fresh' });
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://localhost:5198/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    const vis = (sel) => p.locator(sel).filter({ visible: true }).first();
    await vis('[data-action="nav"][data-id="jobs"]').click();
    await vis('[data-action="open-job"]').click();
    const loud = p.locator('[data-action="approach"][data-id="loud"]');
    if (await loud.count()) await loud.first().click();
    await vis('[data-action="joss"]').click();
    await vis('[data-action="start-job"]').click();
    await vis('[data-action="watch-speed"]').click();
    for (let i = 0; i < 300; i++) {
      if (await p.locator('[data-action="fight-go"]').filter({ visible: true }).count()) {
        await p.waitForTimeout(1500);
        await p.screenshot({ path: `${out}/fight-orders-${w}x${h}.png` });
        console.log(`${w}x${h}`, JSON.stringify(await p.evaluate(() => {
          const r = (q) => { const e = document.querySelector(q); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
          return { screen: innerHeight, topbar: r('.topbar'), map: r('.watch__live'), feed: r('.watch__side') };
        })));
        break;
      }
      if (await p.locator('[data-action="close-mission"]').filter({ visible: true }).count()) { console.log(`${w}x${h}`, 'no fight this run'); break; }
      const opts = p.locator('[data-action="choose"]:not([disabled])').filter({ visible: true });
      if (await opts.count()) { await opts.first().click(); continue; }
      const pend = p.locator('[data-action="pending"]:not([data-id="out"])').filter({ visible: true });
      if (await pend.count()) { await pend.first().click(); continue; }
      await p.waitForTimeout(400);
    }
    await p.close();
  }
} finally { await b.close(); process.kill(-srv.pid); }
