// Capture (2026-11-06, the overwatch card: the kit's uses on their own line under the stat): a runner
// carrying a rifle put on overwatch by Joss's picks; the squad board's outside cards on a phone (390)
// and a computer (1280). Run: node scripts/capture-overwatch-card.mjs <out dir>
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';

const out = process.argv[2];
mkdirSync(out, { recursive: true });
const st = createNewGame({ seed: 21, startCrew: 'fresh' });
st.inbox = st.inbox.filter((m) => m.id !== 'welcome');
const op = [...st.crew].sort((a, b) => b.stats.combat - a.stats.combat)[0];
op.gear = { ...op.gear, weapon: { uid: 'g900', type: 'rifle', tier: 'standard' } };
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const tap = (p, sel) => p.locator(sel).filter({ visible: true }).first().click();
try {
  for (const [w, h, n, file] of [[390, 1400, 'phone', 24], [1280, 900, 'desktop', 25]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await p.goto('http://localhost:5189/');
    await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st);
    await p.reload(); await p.waitForTimeout(500);
    await tap(p, '[data-action="nav"][data-id="jobs"]'); await p.waitForTimeout(300);
    await tap(p, '[data-action="open-job"]'); await p.waitForTimeout(500);
    await tap(p, '[data-action="joss"]'); await p.waitForTimeout(400);
    if (!(await p.locator('.dossier__note .kituses').count())) await tap(p, '.slotchip[data-id="over"]').then(() => tap(p, `.cand[data-id="${op.id}"]`)).catch(() => {});
    await p.waitForTimeout(300);
    const card = p.locator('.dossier:has(.kituses)').first();
    await card.scrollIntoViewIfNeeded();
    await p.locator('.board').screenshot({ path: `${out}/${file}-overwatch-card-${n}.png` });
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
