// Mockup (not shipped): the planning read's build tags and "why", drawn with the real stylesheet.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import { join } from 'node:path';
const repo = new URL('..', import.meta.url).pathname;
const port = 5902;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const { jossIcon } = await import('../src/ui/art.js');
const joss = (mood, line, open) => `
  <button class="joss" data-x aria-expanded="${open}">
    <span class="joss__badge">${jossIcon({ mood: 'neutral', size: 32 })}</span>
    <span class="joss__body"><span class="joss__name">Joss</span><span class="joss__line">${line}</span></span>
    <span class="joss__fold" aria-hidden="true">${open ? '▾' : '▸'}</span>
  </button>`;
const detail = (variant) => `
  <h4 class="fs-h">What you'll be up against</h4>
  <ul class="fs-list">
    <li class="fs-runner"><span class="fs-runner__top"><strong>A group of four hired guns</strong></span><span class="fs-order">They arrive together, so a crew that can only hit one enemy at a time will struggle.</span></li>
    <li class="fs-runner"><span class="fs-runner__top"><strong>Three drones</strong></span><span class="fs-order">Drones are machines. Poisons and infections have no effect on them.</span></li>
    <li class="fs-runner"><span class="fs-runner__top"><strong>One armoured enforcer</strong></span><span class="fs-order">Their plate blocks ordinary hits until it cracks.</span></li>
  </ul>
  <h4 class="fs-h">What your squad can do about it</h4>
  <ul class="fs-list">
    <li class="fs-runner"><span class="fs-runner__top"><strong>Hotwire</strong><em class="fs-tag">Ricochet</em><em class="fs-tag">Cytotoxic Vector</em></span><span class="fs-order">Ricochet bounces their shot to up to three enemies, which suits the hired guns. Their infection works on the enforcer but not on the drones.</span></li>
    <li class="fs-runner"><span class="fs-runner__top"><strong>Viper</strong></span><span class="fs-order">Viper has no build yet, so they shoot one enemy at a time.</span></li>
  </ul>`;
const html = (variant) => {
  const line = variant === 'closed'
    ? 'Hotwire is the right one for the hired guns, but nobody here can deal with the drones. Bring a tech who can jam them.'
    : 'Hotwire is the right one for the hired guns, but nobody here can deal with the drones. Bring a tech who can jam them.';
  return `<section class="panel"><section class="fs fs--plan">
  <p class="fs-title">The fight</p>
  <p class="fs-planline">Your crew has to hold the yard until the van arrives, then get everyone aboard. The risk is medium.</p>
  ${joss('neutral', line, variant === 'open')}
  ${variant === 'open' ? detail() : ''}
</section></section>`;
};
try {
  await page.goto(`http://localhost:${port}/`); await page.waitForSelector('#app *');
  for (const v of ['closed', 'open']) { await page.evaluate((h) => { document.querySelector('#app').innerHTML = h; window.scrollTo(0, 0); }, html(v)); await page.waitForTimeout(300); await page.screenshot({ path: `/tmp/claude-0/mock-${v}.png`, fullPage: true }); }
} finally { await browser.close(); server.kill(); }
