// Design-session capture: career marks in the game (a save edited so the crew have them).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import { join } from 'node:path';
const repo = new URL('..', import.meta.url).pathname;
const out = join(repo, 'docs/screenshots/2026-10-28-design-session-face-anatomy');
const port = 5901;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.error('page error', e.message));
await page.addInitScript(() => { let s = 20261023; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; }; });
const shot = async (name) => { await page.waitForTimeout(300); await page.screenshot({ path: join(out, name) }); };
const click = async (sel) => { const el = page.locator(sel).filter({ visible: true }).first(); if (!(await el.count())) return false; await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(200); return true; };
try {
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#app *');
  await click('[data-action="difficulty"]');
  await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => /^syndicate-slot-\d+$/.test(k));
    const s = JSON.parse(localStorage.getItem(key));
    const mark = (op, kinds, lines) => { op.marks = kinds.map((kind) => ({ kind, day: 1 })); op.history.push(...lines.map((l) => `Day 1: ${l}`)); };
    mark(s.crew[0], ['scar', 'scar', 'implant', 'tattoo'], ['scarred (a serious wound)', 'scarred (a critical wound)', 'more chrome (neural load in the danger zone)', "got the crew's mark (10 jobs together)"]);
    mark(s.crew[1], ['scar'], ['scarred (a serious wound)']);
    mark(s.crew[2], ['implant', 'implant'], ['more chrome (neural load in the danger zone)', 'more chrome (neural load in the danger zone)']);
    mark(s.crew[3], ['tattoo'], ["got the crew's mark (10 jobs together)"]);
    localStorage.setItem(key, JSON.stringify(s));
  });
  await page.reload();
  await page.waitForSelector('#app *');
  await click('[data-action="nav"][data-id="crew"]');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot('10-crew-list-marked.png');
  await click('[data-action="open-op"]');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot('11-profile-marked.png');
} finally { await browser.close(); server.kill(); }
console.log('done');
