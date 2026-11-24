// Design-session capture: the clutch finish (core/director.js) in a live fight. Stages one with scripts/stage-clutch.mjs (one enemy
// left burning on 8 HP, a runner down), loads it into the page and lets the watch play the round; shoots the map before, the
// CLUTCH caption as it holds, and the fight's end. node scripts/capture-clutch.mjs [folder under docs/screenshots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { stage } from './stage-clutch.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const repo = new URL('..', import.meta.url).pathname;
const out = join(repo, 'docs/screenshots', process.argv[2] ?? '2026-11-24-design-session-clutch');
mkdirSync(out, { recursive: true });
const staged = stage();
if (!staged) throw new Error('no clutch staged');
const port = 5961;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
let n = 0;
try {
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    page.on('pageerror', (e) => console.error('page error', e.message));
    const shot = async (name) => { await page.waitForTimeout(150); await page.screenshot({ path: join(out, `${String(++n).padStart(2, '0')}-${name}-${w < 500 ? 'phone' : 'desktop'}.png`) }); };
    // The caption holds for 2.6 s: a watcher in the page tells the script the moment it shows, and the script shoots then.
    let got = false;
    await page.exposeFunction('__captionShown', async () => { if (got) return; got = true; await page.waitForTimeout(450); await shot('clutch-caption'); });
    await page.addInitScript(() => {
      new MutationObserver(() => {
        const c = document.querySelector('.watch__caption');
        if (c && !c.hidden && c.dataset.tier === 'clutch') window.__captionShown();
      }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
    });
    await page.goto(`http://localhost:${port}/`);
    await page.evaluate((json) => { localStorage.clear(); localStorage.setItem('syndicate-slot-1', json); localStorage.setItem('syndicate-active-slot', '1'); }, JSON.stringify(staged.before));
    await page.reload();
    await page.waitForSelector('#app *');
    await page.locator('[data-action="continue"]').filter({ visible: true }).first().click().catch(() => {});
    await page.waitForSelector('.siteplan', { timeout: 20000 });
    await page.evaluate(() => document.querySelector('.watch__map')?.scrollIntoView({ block: 'start' }));
    for (let i = 0; i < 60 && !got; i++) await page.waitForTimeout(500);
    if (!got) console.error('no caption at', w);
    await page.waitForTimeout(4500);
    await shot('after');
    await page.close();
  }
} finally { await browser.close(); server.kill(); }
console.log('done', n, 'in', out);
