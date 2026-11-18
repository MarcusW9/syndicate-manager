// Design-session capture (2026-11-18): the hall build screen with a bunk room, in the plain look and the Hall art look.
// Run: node scripts/capture-bunk-room.mjs [out dir]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { createNewGame } from '../src/core/state.js';
import { expandHall } from '../src/core/halls.js';
import { placePiece, canPlace, buildableCells, bedCells, hallMap, partAt } from '../src/core/hallbuild.js';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const repo = new URL('..', import.meta.url).pathname;
const out = process.argv[2] ?? join(repo, 'docs/screenshots/2026-11-18-bunk-room');
mkdirSync(out, { recursive: true });
let s = createNewGame({ seed: 21, startCrew: 'fresh' });
s.inbox = s.inbox.filter((m) => m.id !== 'welcome');
s.cash = 90000;
s = expandHall(s, 'oldTown');
const map = hallMap('oldTown');
const cells = [...buildableCells(map, s.halls[0].level)].map((k) => k.split(',').map(Number)).filter(([x, y]) => partAt(map, x, y).inside);
let built = null;
for (const [x, y] of cells) { for (const rot of [0, 1]) if (!built && canPlace(s, 'oldTown', 'bunks', x, y, rot).ok) { s = placePiece(s, 'oldTown', 'bunks', x, y, rot); built = [x, y, rot]; } }
if (!built) throw new Error('no place for a bunk room');
console.log('bunks at', built);
const port = 5903;
const server = spawn(join(repo, 'node_modules/.bin/vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }));
const browser = await chromium.launch();
const tap = async (p, sel) => { await p.locator(sel).filter({ visible: true }).first().click(); await p.waitForTimeout(350); };
try {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.error('page error', e.message));
  for (const [tag, art] of [['plain', false], ['hall-art', true]]) {
    await p.goto(`http://localhost:${port}/`);
    await p.evaluate(([x, a]) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); if (a) localStorage.setItem('syndicate-pref-hallart', '1'); }, [s, art]);
    await p.reload(); await p.waitForTimeout(600);
    await tap(p, '[data-action="nav"][data-id="tong"]');
    await tap(p, '[data-action="hall-page"][data-id="oldTown"]');
    await tap(p, '[data-action="build-hall"][data-id="oldTown"]');
    if (await p.locator('[data-action="hall-building"]').count()) {
      for (const el of await p.locator('[data-action="hall-building"]').all()) { await el.click(); await p.waitForTimeout(300); if ((await p.locator('.bplan').innerHTML()).includes('Bunk') || true) break; }
    }
    await p.locator('.bplan').screenshot({ path: join(out, `${tag}-plan.png`) });
    await p.screenshot({ path: join(out, `${tag}-screen.png`) });
  }
} finally { await browser.close(); server.kill(); }
