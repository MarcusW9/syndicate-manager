// A runner's death in a live fight (ui/fightstage.js FALL, 2026-11-28). Stages one with scripts/stage-death.mjs (a runner pushed on
// for bleeds out), loads it into the page and lets the watch play the round; shoots the pushed-in moment as "NAME · KILLED" holds in
// the bar, and the map after. node scripts/capture-death.mjs [folder under docs/screenshots]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { stage } from './stage-death.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const repo = new URL('..', import.meta.url).pathname;
const out = join(repo, 'docs/screenshots', process.argv[2] ?? '2026-11-28-death-slowmo');
mkdirSync(out, { recursive: true });
const staged = stage();
if (!staged) throw new Error('no death staged');
const port = 5962;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
let n = 0;
try {
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    page.on('pageerror', (e) => console.error('page error', e.message));
    const shot = async (name) => { await page.waitForTimeout(150); await page.screenshot({ path: join(out, `${String(++n).padStart(2, '0')}-${name}-${w < 500 ? 'phone' : 'desktop'}.png`) }); };
    // The name holds for about 2 s: a watcher in the page tells the script the moment it shows, and the script shoots then.
    let got = false;
    await page.exposeFunction('__captionShown', async () => { if (got) return; got = true; await page.waitForTimeout(300); await shot('killed'); });
    await page.addInitScript(() => {
      new MutationObserver(() => {
        const c = document.querySelector('.watch__caption');
        if (c && !c.hidden && c.dataset.tier === 'killed') window.__captionShown();
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
