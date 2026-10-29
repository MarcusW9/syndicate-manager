// Captures the City screen (2026-10-29): the map, the Docks' card with its picture, and the city
// summary, at desktop and phone width, from a staged save. Run: node scripts/capture-city.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const out = process.argv[2];
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5186', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h, name, n] of [[1440, 1000, 'desktop', 1], [390, 844, 'phone', 3]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.goto('http://localhost:5186/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    await p.locator('[data-action="nav"][data-id="city"]').filter({ visible: true }).first().click();
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/0${n}-city-${name}.png` });
    await p.locator('.cm-plate[data-id="docks"]').click();
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${out}/0${n + 1}-city-docks-${name}.png` });
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
