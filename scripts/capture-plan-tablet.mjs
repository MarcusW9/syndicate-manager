// Planning a job on an iPad in landscape (1180×820), three ways, for the owner to compare
// (2026-10-29): today; option 1, the job list hidden while planning below 1400px; option 2, a
// narrower job list. The options are injected as CSS, so this captures before anything ships.
// Run: node scripts/capture-plan-tablet.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const OPTIONS = {
  today: '',
  'option-1-list-hidden': '.jobsplit { display: block !important; } .jobsplit__list { display: none !important; } .jobsplit__plan [data-action="back"] { display: inline-flex !important; }',
  'option-2-narrow-list': '.jobsplit { grid-template-columns: 300px minmax(0, 1fr) !important; }',
};
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const out = process.argv[2];
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5188', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  let n = 0;
  for (const [name, css] of Object.entries(OPTIONS)) {
    const p = await b.newPage({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2 });
    await p.goto('http://localhost:5188/');
    await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
    await p.reload();
    if (css) await p.addStyleTag({ content: css });
    await p.locator('[data-action="nav"][data-id="jobs"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="open-job"]').filter({ visible: true }).first().click();
    await p.locator('[data-action="joss"]').filter({ visible: true }).first().click().catch(() => {});
    await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelector('.board')?.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/${String(++n + 1).padStart(2, '0')}-${name}.png` });
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
