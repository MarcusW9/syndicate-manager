// Design session (2026-10-28): quieter ways to mark Joss's risk in a job card's corner. Plays a
// fresh game to the job board, then swaps the corner's CSS for each option and captures the cards.
// Run: node scripts/risk-corner-options.mjs  (writes docs/screenshots/2026-10-28-design-session-risk-corner/)

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const repo = new URL('..', import.meta.url).pathname;
const out = join(repo, 'docs/screenshots/2026-10-28-design-session-risk-corner');
mkdirSync(out, { recursive: true });

// Sizes still carry the level (rule 1: never colour alone): low, mid, high, extreme.
const SIZES = { low: 10, moderate: 14, high: 19, extreme: 25 };
const COLOURS = { low: '#5fe0a5', moderate: 'var(--warn)', high: '#ff9a5a', extreme: 'var(--danger)' };
const each = (fn) => Object.keys(SIZES).map((l) => `.riskcorner--${l} { ${fn(SIZES[l], COLOURS[l], l)} }`).join('\n');

const OPTIONS = {
  'today-filled-corner': '/* as it is */',
  'A-smaller-fill': each((s, c) => `width: ${Math.round(s * 0.6)}px; height: ${Math.round(s * 0.6)}px; background: ${c};`),
  'B-coloured-edge': `.riskcorner { clip-path: none; background: none !important; border-top: 2px solid; border-right: 2px solid; }\n`
    + each((s, c) => `width: ${s + 6}px; height: ${s + 6}px; border-color: ${c};`),
  'C-inner-bracket': `.riskcorner { clip-path: none; background: none !important; top: 4px; right: 4px; border-top: 1.5px solid; border-right: 1.5px solid; }\n`
    + each((s, c) => `width: ${s}px; height: ${s}px; border-color: ${c};`),
  'D-cut-corner-hairline': `.riskcorner { clip-path: polygon(0 0, 100% 0, 100% 100%); }\n`
    + each((s, c) => `width: ${s}px; height: ${s}px; background: linear-gradient(to top right, transparent calc(50% - 1px), ${c} calc(50% - 1px), ${c} calc(50% + 0.6px), var(--panel) calc(50% + 0.6px)) !important;`),
};

const port = 5300 + Math.floor(Math.random() * 600);
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.addInitScript(() => { let s = 20261023; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; }; });
try {
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#app *');
  const pick = page.locator('[data-action="difficulty"]').filter({ visible: true }).first();
  if (await pick.count()) await pick.click();
  // A few days in, so the board has more than one level of risk on it.
  for (let i = 0; i < 6; i++) { const c = page.locator('[data-action="continue"]:not([disabled])').filter({ visible: true }).first(); if (await c.count()) { await c.click(); await page.waitForTimeout(1300); } }
  await page.locator('[data-action="nav"][data-id="jobs"]').first().click();
  await page.waitForTimeout(400);
  let n = 0;
  for (const [name, css] of Object.entries(OPTIONS)) {
    const tag = await page.addStyleTag({ content: css });
    await page.waitForTimeout(150);
    const list = page.locator('.jobcard').first().locator('xpath=ancestor::ul[1]');
    await list.screenshot({ path: join(out, `${String(++n).padStart(2, '0')}-${name}.png`) });
    await tag.evaluate((el) => el.remove());
  }
} finally { await browser.close(); server.kill(); }
console.log('done');
