// Capture (2026-11-20, training focus): the Development panel on a runner's page at 390 and 360 wide, with no focus and
// after tapping two stats; also landscape (844x390) to check the picker fits.
// Run: node scripts/capture-focus.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = [];

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5198', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h] of [[390, 3200], [360, 3200], [844, 390]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await p.goto('http://localhost:5198/');
    await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, s);
    await p.reload(); await p.waitForTimeout(600);
    await p.locator('[data-action="nav"][data-id="crew"]').filter({ visible: true }).first().click(); await p.waitForTimeout(300);
    await p.locator('[data-action="open-op"]').filter({ visible: true }).first().click(); await p.waitForTimeout(400);
    const sec = async (name) => {
      const head = p.locator('h2', { hasText: /^Development$/ });
      await head.scrollIntoViewIfNeeded();
      if (h < 1000) { await p.locator('.focuspick').evaluate((el) => el.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150); await p.screenshot({ path: `${out}/${name}-${w}x${h}.png` }); return; }
      const top = await head.boundingBox();
      const end = await p.locator('h2', { hasText: /^Condition$/ }).boundingBox();
      await p.screenshot({ path: `${out}/${name}-${w}.png`, clip: { x: 0, y: Math.max(0, top.y - 12), width: w, height: end.y - top.y + 4 } });
    };
    await sec('focus-none');
    await p.locator('[data-action="focus"][data-id="tech"]').click(); await p.waitForTimeout(250);
    await p.locator('[data-action="focus"][data-id="medical"]').click(); await p.waitForTimeout(250);
    await sec('focus-two');
    const pressed = await p.locator('[data-action="focus"][aria-pressed="true"]').count();
    const sizes = await p.locator('[data-action="focus"]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    console.log(w, h, { pressed, minHeight: Math.min(...sizes) });
    if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) console.error(`horizontal overflow at ${w}`);
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
