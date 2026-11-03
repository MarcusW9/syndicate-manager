// The runner page's traits as chips, and synergies as portraits (2026-11-03), from a staged save:
// one runner with born traits, earned traits (lasting, temporary, a setback) and two synergies.
// Captures: before-style is in git history; here chips with names, icons only (for comparison),
// a chip's card open, a synergy's card open. Run: node scripts/capture-trait-chips.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const [a, b, c] = s.crew;
a.traits = ['hothead', 'loyal'];
a.earned = [
  { id: 'steady_under_fire', day: 5 }, { id: 'corner_fighter', day: 9 },
  { id: 'riding_high', day: 11 }, { id: 'shaky', day: 12 },
  { id: 'crew_anchor', day: 7, partner: b.id }, { id: 'crew_anchor', day: 10, partner: c.id },
];
const out = process.argv[2];
const ICONS_ONLY = '.tchip span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); } .tchip { padding: 0 13px; }';
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5195', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b2 = await chromium.launch();
try {
  for (const [w, h, tag] of [[390, 844, 'phone'], [1180, 820, 'ipad']]) {
    const p = await b2.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.goto('http://localhost:5195/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    await p.locator('[data-action="nav"][data-id="crew"]').filter({ visible: true }).first().click();
    await p.locator(`[data-action="open-op"][data-id="${a.id}"]`).first().click();
    const shot = async (name) => {
      await p.evaluate(() => document.querySelector('.tchips')?.previousElementSibling?.scrollIntoView({ block: 'start' }));
      await p.evaluate(() => window.scrollBy(0, -90));
      await p.waitForTimeout(250);
      await p.screenshot({ path: `${out}/${name}-${tag}.png` });
    };
    await shot('01-chips');
    if (tag === 'phone') {
      const tag2 = await p.addStyleTag({ content: ICONS_ONLY });
      await shot('02-icons-only');
      await tag2.evaluate((el) => el.remove());
    }
    await p.locator('.tchip', { hasText: 'Shaky' }).click();
    await shot('03-card-open');
    await p.locator('.synergy').first().click();
    await shot('04-synergy-open');
  }
} finally { await b2.close(); process.kill(-srv.pid); }
