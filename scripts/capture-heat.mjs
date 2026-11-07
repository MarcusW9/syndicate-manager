// Capture (2026-11-05, heat per district): on a phone (390), the City map with heat tags under the
// plates and the heat line in the city summary; the fixer's notice about the hottest district.
// Run: node scripts/capture-heat.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { setHeat, checkHeatNotice } from '../src/core/heat.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
setHeat(s, 'docks', 7); setHeat(s, 'nightMarket', 4); setHeat(s, 'oldTown', 1);
checkHeatNotice(s);
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5189/');
  await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, s);
  await p.reload(); await p.waitForTimeout(400);
  const notice = s.inbox.find((m) => m.kind === 'heat');
  await p.locator(`[data-action="open-message"][data-id="${notice.id}"]`).first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/01-fixer-notice.png` });
  await p.locator('[data-action="nav"][data-id="ops"]').filter({ visible: true }).first().click(); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/02-city-map-heat.png` });
  await p.locator('.tonight, .mapframe').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/03-city-heat-line.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
