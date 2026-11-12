// Capture (2026-11-12): Today's wide layout, Coming up as a strip over a sticky reader; the week's brief
// as the reader's default; a message opened from far down the list with ‹ › ✕; and the phone's list.
// Run: node scripts/capture-inbox-stack.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
let st = createNewGame({ seed: 21, startCrew: 'fresh' });
for (let i = 0; i < 12; i++) st = advanceDay(st);
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5191', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, s) => { await p.goto('http://localhost:5191/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, s); await p.reload(); await p.waitForTimeout(500); };
try {
  const d = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await load(d, st);
  await d.screenshot({ path: `${out}/01-desktop-week.png` });
  const rows = d.locator('[data-action="open-message"]');
  console.log('messages', await rows.count());
  await d.evaluate(() => window.scrollTo(0, 99999));
  await d.waitForTimeout(200);
  await rows.last().click();
  await d.waitForTimeout(300);
  await d.screenshot({ path: `${out}/02-desktop-open-from-far-down.png` });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await load(p, st);
  await p.screenshot({ path: `${out}/03-phone-today.png` });
  await p.locator('.upcoming--strip').scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${out}/04-phone-coming-up.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
