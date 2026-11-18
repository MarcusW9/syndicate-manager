// Design-session mockups (2026-11-18): colour variants for the Crew roster's filter dropdown and the panel outline.
// Injects CSS over the live Crew screen, one PNG per variant, into docs/screenshots/<date>-crew-colour-mockups/.
//   node scripts/preview-crew-colours.mjs
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repo = resolve(new URL('..', import.meta.url).pathname);
const out = join(repo, 'docs/screenshots', `${new Date().toISOString().slice(0, 10)}-crew-colour-mockups`);
mkdirSync(out, { recursive: true });

// panel: border + inset glow on .panel; select: the dropdown's colours.
const VARIANTS = [
  ['0-current', ''],
  ['1-cyan', `.panel{border:1px solid #3de8d8;box-shadow:inset 0 0 0 1px rgba(61,232,216,.25),inset 0 0 40px rgba(61,232,216,.06)}
    .crewfilter__select{background-color:#12262a;color:#3de8d8;border:1px solid #3de8d8}`],
  ['2-red', `.panel{border:1px solid #ff3d5f;box-shadow:inset 0 0 0 1px rgba(255,61,95,.25),inset 0 0 40px rgba(255,61,95,.07)}
    .crewfilter__select{background-color:#2a1218;color:#ff7a92;border:1px solid #ff3d5f}`],
  ['3-amber', `.panel{border:1px solid #f2d541;box-shadow:inset 0 0 0 1px rgba(242,213,65,.22),inset 0 0 40px rgba(242,213,65,.05)}
    .crewfilter__select{background-color:#262210;color:#f2d541;border:1px solid #f2d541}`],
  ['4-violet', `.panel{border:1px solid #b98aff;box-shadow:inset 0 0 0 1px rgba(185,138,255,.25),inset 0 0 40px rgba(185,138,255,.07)}
    .crewfilter__select{background-color:#1d1630;color:#d3b6ff;border:1px solid #b98aff}`],
  ['5-split', `.panel{border:1px solid #2a303b;border-top:2px solid #3de8d8;border-left:2px solid #ff3d5f;box-shadow:inset 0 0 40px rgba(61,232,216,.05)}
    .crewfilter__select{background-color:#3de8d8;color:#0a0c0f;border:0}`],
];

const port = 5300 + Math.floor(Math.random() * 600);
const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok, fail) => { server.stdout.on('data', (d) => String(d).includes('Local') && ok()); server.on('exit', (c) => fail(new Error(`vite exited ${c}`))); });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/?seed=21`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#app *');
  for (let i = 0; i < 3 && await page.locator('[data-action="difficulty"], [data-action="pick-start"]').first().isVisible().catch(() => false); i++) await page.locator('[data-action="difficulty"], [data-action="pick-start"]').first().click();
  for (let i = 0; i < 3; i++) await page.locator('[data-action="founder-toggle"]:not(.is-on):not([disabled])').first().click().catch(() => {});
  await page.locator('[data-action="found-crew"]').click().catch(() => {});
  await page.locator('[data-action="nav"][data-id="crew"]').first().click();
  await page.waitForSelector('#crewfilter');
  for (const [name, css] of VARIANTS) {
    await page.evaluate((c) => { document.getElementById('mock')?.remove(); const s = document.createElement('style'); s.id = 'mock'; s.textContent = c; document.head.append(s); }, css);
    await page.screenshot({ path: join(out, `${name}.png`), clip: { x: 0, y: 0, width: 1440, height: 560 } });
  }
  console.log(`${VARIANTS.length} mockups in ${out}`);
} finally { await browser.close(); server.kill(); }
