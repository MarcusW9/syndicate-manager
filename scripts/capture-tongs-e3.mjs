// E3 screenshots (2026-11-14): City > Tongs with watched tongs, a tong's file at level 2 (unsettled names, the quiet name),
// a name's profile with the age of our read and the slate mark, and the Book's tile mark, from a staged seed-1234 save.
// Run: node scripts/capture-tongs-e3.mjs <out dir>   (from inside the repo, so playwright resolves)
import { createNewGame } from '../src/core/state.js';
import { weeklyRivals, rivalView } from '../src/core/rivals.js';
import { bookView } from '../src/core/book.js';
import { raisedRead, raisedHouseRead } from '../src/core/reads.js';
import { isQuiet, unsettledOf, rosterOf } from '../src/core/houses.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const s = createNewGame({ seed: 1234, startCrew: 'fresh' });
for (let w = 0; w < 30; w++) { s.day = 7 * (w + 1); weeklyRivals(s); }
s.day += 1;
const r = s.rivals; const act = r.tongs.filter((t) => t.status === 'active');
// A tong we have watched twice (unsettled names), one once, the rest not at all; and one we looked at long ago.
const big = act.find((t) => unsettledOf(r, t, s.day).length) ?? act[0];
r.houseRead[big.id] = { level: 2, day: s.day - 7 };
const one = act.find((t) => t !== big); r.houseRead[one.id] = { level: 1, day: s.day - 14 };
// A quiet name at the tong we watched.
const q = rosterOf(r, big).find((c) => c.id !== big.headId); q.quiet = true; q.age = 22;
// Names: one with a fresh full read the slate gets wrong, one with an old read, one that has moved since we looked.
const slated = bookView(s).groups.flatMap((g) => g.entries.map((e) => ({ ...e, grade: g.grade }))).filter((e) => e.id && !e.yours);
const cards = slated.map((e) => r.cards.find((c) => c.name === e.name));
const gradeIx = (g) => 'SABCD'.indexOf(g);
const marked = cards[0]; marked.rating = gradeIx(slated[0].grade) >= 2 ? 78 : 14; r.scouted[marked.id] = raisedRead(s, marked); r.scouted[marked.id].level = 3;
const old = r.cards.find((c) => c.tongId && c !== marked && c !== q); r.scouted[old.id] = { level: 3, day: s.day - 200, band: 'pro', tongId: old.tongId };
const moved = r.cards.find((c) => c.tongId && ![marked, old, q].includes(c)); r.scouted[moved.id] = { level: 2, day: s.day - 20, band: 'rookie', tongId: 'elsewhere' };
const out = process.argv[2];
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5187', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((res) => setTimeout(res, 4000));
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5187/');
  await p.evaluate((st) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(st)); }, s);
  await p.reload();
  await p.locator('[data-action="nav"][data-id="city"]').filter({ visible: true }).first().click();
  await p.locator('[data-action="city-tab"][data-id="tongs"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(500);
  const card = p.locator(`[data-action="tong-page"][data-id="${big.id}"]`).first();
  await card.scrollIntoViewIfNeeded(); await p.screenshot({ path: `${out}/01-house-cards-chips.png` });
  await card.click(); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/02-file-level-2.png`, fullPage: true });
  await p.locator('[data-action="back"]').first().click(); await p.waitForTimeout(300);
  for (const [c, file] of [[marked, '03-name-slate-mark.png'], [old, '04-name-old-read.png'], [moved, '05-name-changed.png']]) {
    await p.evaluate(() => window.scrollTo(0, 0));
    const link = p.locator(`[data-action="tong-name"][data-id="${c.name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}"]`).first();
    if (await link.count()) { await link.scrollIntoViewIfNeeded(); await link.click(); await p.waitForTimeout(400); await p.screenshot({ path: `${out}/${file}` }); await p.locator('[data-action="back"]').first().click(); await p.waitForTimeout(300); }
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.locator('[data-action="tong-page"][data-id="book"]').first().click(); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/06-slate-marks.png`, fullPage: true });
} finally {
  await b.close();
  process.kill(-srv.pid);
}
