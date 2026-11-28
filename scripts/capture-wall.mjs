// The wall panel that opens a report when someone died (2026-11-28, the owner's pick A of docs/mockups/2026-11-28-death-report.html).
// Plays a real run with scripts/stage-death.mjs (a runner kept fighting for, by the player's call, bleeds out), closes it, loads the
// save and opens the report. node scripts/capture-wall.mjs [folder under docs/screenshots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { stage } from './stage-death.mjs';
import { autoStep } from '../src/core/autorun.js';
import * as M from '../src/core/mission.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const repo = new URL('..', import.meta.url).pathname;
const out = join(repo, 'docs/screenshots', process.argv[2] ?? '2026-11-28-death-wall');
mkdirSync(out, { recursive: true });
let s = structuredClone(stage().before);
const dying = s.activeMission.battle.runners[2];
s.activeMission.events.push({ kind: 'decision', push: true, text: '', choice: `Keep fighting with ${dying.handle} down`, why: null, report: `The crew kept fighting with ${dying.handle} down and bleeding.` });
for (let g = 0; g < 300 && !s.activeMission.done; g++) s = autoStep(s, { force: true });
s = M.closeMission(s);
const report = s.inbox.find((m) => m.type === 'report');
for (const m of s.inbox) m.read = true; report.read = false;
const port = 5963;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
try {
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    page.on('pageerror', (e) => console.error('page error', e.message));
    await page.goto(`http://localhost:${port}/`);
    await page.evaluate((json) => { localStorage.clear(); localStorage.setItem('syndicate-slot-1', json); localStorage.setItem('syndicate-active-slot', '1'); }, JSON.stringify(s));
    await page.reload();
    await page.waitForSelector('#app *');
    await page.locator(`[data-action="open-message"][data-id="${report.id}"]`).filter({ visible: true }).first().click();
    await page.waitForSelector('.wall', { timeout: 10000 });
    await page.locator('.report').click().catch(() => {}); // skip the report's play-in
    await page.waitForTimeout(800);
    await page.evaluate(() => { document.querySelector('.wall')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -200); });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(out, `01-report-wall-${w < 500 ? 'phone' : 'desktop'}.png`) });
    await page.close();
  }
} finally { await browser.close(); server.kill(); }
console.log('done in', out);
