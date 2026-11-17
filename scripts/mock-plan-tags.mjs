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
const html = (variant) => `
<section class="panel"><section class="fs fs--plan">
  <p class="fs-title">The fight</p>
  <p class="fs-planline">Hold the yard, then get everyone aboard. Mid risk.</p>
  <p class="fs-muted">Likely enemies: hired guns, enforcers, drones.</p>

  <h4 class="fs-h">What it throws</h4>
  <ul class="chips">
    <li class="chip"><strong>Groups</strong><span>4 hired guns arrive together</span></li>
    <li class="chip"><strong>Machines</strong><span>3 drones: shrug off infection</span></li>
    <li class="chip"><strong>Armoured</strong><span>1 enforcer in a plate</span></li>
  </ul>

  <h4 class="fs-h">What your squad answers</h4>
  <ul class="fs-list">
    <li class="fs-runner"><span class="fs-runner__top"><strong>Hotwire</strong><em class="fs-tag">Ricochet</em><em class="fs-tag">Cytotoxic Vector</em></span>
      <span class="fs-order">${variant === 'gap' ? 'Answers: groups (bounces to 3). Not machines.' : 'Answers: groups (bounces to 3), armour (infection past the plate). Not machines.'}</span></li>
    <li class="fs-runner"><span class="fs-runner__top"><strong>Viper</strong></span><span class="fs-order">No build. Plain shots.</span></li>
  </ul>
  <ul class="fs-gaps">
    ${variant === 'gap'
      ? '<li>Nobody here can answer the 3 drones: the Vector will not take on machines, and Viper has no jammer.</li><li>Protect (the van) wants a Ricochet carrier on the door: Hotwire is the only one, and she cannot be in both places.</li>'
      : '<li>Covered: the groups (Ricochet) and the plate (Vector). Drones fall to plain shots.</li>'}
  </ul>
</section></section>`;
try {
  await page.goto(`http://localhost:${port}/`); await page.waitForSelector('#app *');
  for (const v of ['gap', 'covered']) { await page.evaluate((h) => { document.querySelector('#app').innerHTML = h; window.scrollTo(0, 0); }, html(v)); await page.waitForTimeout(300); await page.screenshot({ path: `/tmp/claude-0/mock-${v}.png`, fullPage: true }); }
} finally { await browser.close(); server.kill(); }
