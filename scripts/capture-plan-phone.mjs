// The squad board on a phone (390×844) with four inside, for the owner to compare (2026-10-29):
// "quite tight here maybe we can have 2 on a row or a horizontal swipe". Captures the board as it
// renders now; pass extra CSS as a second argument to try an option before it ships.
// Run: node scripts/capture-plan-phone.mjs <out dir> [name] [css]
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const [out, name = 'board-phone', css = ''] = process.argv.slice(2);
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const width of [390, 360]) {
    const p = await b.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 2 });
    await p.goto('http://localhost:5189/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    if (css) await p.addStyleTag({ content: css });
    await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
    // Fill four inside: each empty inside card, first free candidate.
    for (let i = 0; i < 4; i++) {
      const slot = p.locator('.board .dossier.is-empty[data-id^="in:"]').first();
      if (!(await slot.count())) break;
      await slot.click();
      await p.locator('.cand:not(.is-on):not(.is-placed):not([disabled])').first().click();
      await p.waitForTimeout(150);
      if (await p.locator('[data-action="close-picker"]').count()) await p.locator('.sheet__x').click().catch(() => {});
    }
    await p.evaluate(() => document.querySelector('.board')?.scrollIntoView({ block: 'start' }));
    await p.evaluate(() => window.scrollBy(0, -60));
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/${name}-${width}.png` });
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
