// Capture (2026-11-20, level-ups): a runner with a level-up waiting, at 390 and 360 wide and 844x390: the crew row's pill, the
// Skills list's banner, a Ready skill opened with its Learn button, the list after learning it, and the notice in Today.
// Run: node scripts/capture-levelup.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { checkLevelUps } from '../src/core/levelup.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = [];
const op = s.crew[0];
op.stats = { ...op.stats, combat: 12, cool: 9, tech: 7, medical: 8, piloting: 4 };
op.jobsWithCrew = 4;
checkLevelUps(s);
if (!op.levelUp) throw new Error('no level-up staged');

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5199', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [w, h] of [[390, 2600], [360, 2600], [844, 390]]) {
    const tag = h < 1000 ? `${w}x${h}` : `${w}`;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await p.goto('http://localhost:5199/');
    await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, s);
    await p.reload(); await p.waitForTimeout(600);
    if (w === 390) await p.screenshot({ path: `${out}/levelup-today-${tag}.png`, clip: { x: 0, y: 0, width: w, height: 844 } });
    await p.locator('[data-action="nav"][data-id="crew"]').filter({ visible: true }).first().click(); await p.waitForTimeout(300);
    if (w === 390) await p.screenshot({ path: `${out}/levelup-crew-${tag}.png`, clip: { x: 0, y: 0, width: w, height: 844 } });
    await p.locator('[data-action="open-op"]').filter({ visible: true }).first().click(); await p.waitForTimeout(400);
    const sec = async (name) => {
      if (h < 1000) { await p.locator('h2', { hasText: /^Skills$/ }).evaluate((el) => el.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150); await p.screenshot({ path: `${out}/${name}-${tag}.png` }); return; }
      const hd = await p.locator('h2', { hasText: /^Skills$/ }).boundingBox();
      const l = await p.locator('.skilllist').boundingBox();
      await p.screenshot({ path: `${out}/${name}-${tag}.png`, clip: { x: 0, y: Math.max(0, hd.y - 12), width: w, height: Math.min(1400, l.y + l.height - hd.y + 24) } });
    };
    await sec('levelup-skills');
    await p.locator('[data-action="skill-tab"][data-id="ready"]').click(); await p.waitForTimeout(200);
    await p.locator('[data-action="skill-open"]').filter({ hasText: 'Ricochet' }).click(); await p.waitForTimeout(200);
    await sec('levelup-ready-open');
    await p.locator('[data-action="learn"]').click(); await p.waitForTimeout(300);
    await p.locator('[data-action="skill-tab"][data-id="all"]').click(); await p.waitForTimeout(200);
    await sec('levelup-learned');
    const banner = await p.locator('.levelup').count();
    const slot = await p.locator('.skillslot').first().innerText();
    const learn = await p.locator('[data-action="learn"]').count();
    console.log(tag, { bannerAfter: banner, moveSlot: slot.replace(/\s+/g, ' ').trim(), learnButtonsAfter: learn });
    if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) console.error(`horizontal overflow at ${tag}`);
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
