// Capture (2026-11-19, the skills list): a runner who holds Ricochet and Contagion Vector, at 390 and 360 wide: the list, a locked
// skill opened, the Ready filter, and a runner with nothing learned yet.
// Run: node scripts/capture-skills-list.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

const stage = (learned) => {
  const s = createNewGame({ seed: 21, startCrew: 'fresh' });
  s.inbox = [];
  const op = s.crew[0];
  op.stats = { ...op.stats, combat: 12, cool: 9, tech: 7, medical: 8, piloting: 4 };
  op.build = learned ? { move: 'ricochet', payload: 'contagion' } : null;
  return s;
};

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5197', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const w of [390, 360]) {
    for (const learned of [true, false]) {
      const p = await b.newPage({ viewport: { width: w, height: 2600 }, deviceScaleFactor: 2 });
      p.on('pageerror', (e) => console.error('page error', e.message));
      await p.goto('http://localhost:5197/');
      await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, stage(learned));
      await p.reload(); await p.waitForTimeout(600);
      await p.locator('[data-action="nav"][data-id="crew"]').filter({ visible: true }).first().click(); await p.waitForTimeout(300);
      await p.locator('[data-action="open-op"]').filter({ visible: true }).first().click(); await p.waitForTimeout(400);
      // The section alone (heading to the end of the list), on a tall viewport so the fixed bars sit below it.
      const sec = async (name) => {
        const h = await p.locator('h2', { hasText: /^Skills$/ }).boundingBox();
        const l = await p.locator('.skilllist').boundingBox();
        await p.screenshot({ path: `${out}/${name}-${w}.png`, clip: { x: 0, y: Math.max(0, h.y - 12), width: w, height: l.y + l.height - h.y + 24 } });
      };
      const tag = learned ? 'skills' : 'skills-none';
      await sec(`${tag}-list`);
      if (learned) {
        await p.locator('[data-action="skill-open"]').filter({ hasText: 'Breacher' }).click(); await p.waitForTimeout(200);
        await sec('skills-locked-open');
        await p.locator('[data-action="skill-tab"][data-id="ready"]').click(); await p.waitForTimeout(200);
        await sec('skills-ready-filter');
      }
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) console.error(`horizontal overflow at ${w}`);
      await p.close();
    }
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
