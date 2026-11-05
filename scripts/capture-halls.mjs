// Capture (2026-11-05, halls: the tong's Phase 2 slice 1): on a phone (390), Madam Rao's offer of a
// hall in the Night Market; the Crew screen's halls after opening it; a runner's Home with "Move
// to Night Market"; the City map with the Night Market's HALL tag.
// Run: node scripts/capture-halls.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import { introduceHalls, openHall, moveToHall } from '../src/core/halls.js';
import { HALL_SITES } from '../src/data/halls.js';
import { adjustTrust } from '../src/core/clients.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const offered = createNewGame({ seed: 21, startCrew: 'fresh' });
offered.reputation = HALL_SITES.nightMarket.rep;
adjustTrust(offered, 'rao', 10);
offered.cash = 26000;
introduceHalls(offered);
let opened = openHall(offered, 'nightMarket');
opened = moveToHall(opened, opened.crew[1].id, 'nightMarket');
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5189', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
const load = async (p, st) => { await p.goto('http://localhost:5189/'); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, st); await p.reload(); await p.waitForTimeout(400); };
const tab = (p, id) => p.locator(`[data-action="nav"][data-id="${id}"]`).filter({ visible: true }).first().click();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await load(p, offered);
  await p.locator('[data-action="open-message"][data-id="hall-offer-nightMarket"]').first().click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/01-the-offer.png` });
  await load(p, opened);
  await tab(p, 'crew'); await p.waitForTimeout(300);
  await p.locator('.halls').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -60));
  await p.screenshot({ path: `${out}/02-crew-halls.png` });
  await p.locator(`[data-action="open-op"][data-id="${opened.crew[0].id}"]`).first().click(); await p.waitForTimeout(300);
  await p.locator('[data-action="move-hall"]').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -160));
  await p.screenshot({ path: `${out}/03-runner-home.png` });
  await tab(p, 'city'); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/04-city-hall-tag.png` });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
