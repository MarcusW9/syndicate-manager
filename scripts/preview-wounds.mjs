// Design-session preview (2026-11-18): job-map tokens with a light and a serious injury, for looking at the wound marker.
// Run: node scripts/preview-wounds.mjs <out dir>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const repo = new URL('..', import.meta.url).pathname;
const out = process.argv[2] ?? join(repo, 'docs/screenshots/2026-11-18-wound-plaster');
mkdirSync(out, { recursive: true });
const port = 5904;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 8 });
  page.on('pageerror', (e) => console.error('page error', e.message));
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(async () => {
    const { createNewGame } = await import('/src/core/state.js');
    const { sitePlanSvg, bindSitePlan, siteFor } = await import('/src/ui/siteplan.js');
    const s = createNewGame({ seed: 21, startCrew: 'fresh' });
    const team = s.crew.slice(0, 3);
    team[0].condition = { ...team[0].condition, injury: 'light' };
    team[1].condition = { ...team[1].condition, injury: 'serious' };
    const site = siteFor('oldTown', null, null);
    document.body.innerHTML = `<div id="m" style="width:1200px">${sitePlanSvg({ kit: 'rifle', site })}</div>`;
    const plan = bindSitePlan(document.querySelector('.siteplan'), { team, site, out: [] });
    window.plan = plan; window.ids = team.map((o) => o.id);
    window.plan.hurt(window.ids[0], 'light'); window.plan.hurt(window.ids[1], 'serious');
  });
  await page.waitForTimeout(1500);
  const boxes = await page.locator('.sp-token').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }));
  const x0 = Math.min(...boxes.map((b) => b[0])) - 30, y0 = Math.min(...boxes.map((b) => b[1])) - 30, x1 = Math.max(...boxes.map((b) => b[2])) + 30, y1 = Math.max(...boxes.map((b) => b[3])) + 30;
  await page.screenshot({ path: join(out, 'wounds-closeup.png'), clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } });
} finally { await browser.close(); server.kill(); }
