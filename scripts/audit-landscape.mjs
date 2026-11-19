// Landscape-phone audit (2026-11-19): plays a fresh game, visits each main screen and tab at landscape phone sizes, and measures what is
// left for the screen itself once the fixed bars are counted. Changes nothing in the game. Writes shots and a ranked report.
//
//   node scripts/audit-landscape.mjs [out dir]     default docs/audits/2026-11-19-landscape-phone
//
// Per screen and size it records: the height taken by fixed or sticky bars at the top and bottom, the height left for content, the
// page's scroll height (in screens), horizontal overflow, and how many tap targets are shorter than 44px. The score ranks the worst
// first: the less content height is left, the worse. Sizes: 844x390 (iPhone 14 landscape), 932x430 (Pro Max), 667x375 (small).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repo = resolve(new URL('..', import.meta.url).pathname);
const out = resolve(process.argv[2] ?? join(repo, 'docs/audits/2026-11-19-landscape-phone'));
mkdirSync(out, { recursive: true });
const SIZES = [[844, 390], [932, 430], [667, 375]];
const SEED = 21;

const port = 5900 + Math.floor(Math.random() * 90);
const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok, fail) => { server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }); server.on('exit', (c) => fail(new Error(`vite exited ${c}`))); });

const browser = await chromium.launch();
const rows = [];
try {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
    await page.addInitScript(() => { let s = 20261023; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; }; });
    const visible = (sel) => page.locator(sel).filter({ visible: true });
    const click = async (sel) => {
      const later = visible('.raidsheet [data-action="raid-call"][data-id="|later"]').first();
      if (await later.count()) await later.click();
      const el = visible(sel).first();
      if (!(await el.count()) || !(await el.isEnabled())) return false;
      await el.scrollIntoViewIfNeeded(); await el.click(); await page.waitForTimeout(200); return true;
    };
    const measure = () => page.evaluate(() => {
      const vh = innerHeight, vw = innerWidth;
      let top = 0, bottom = 0, side = 0;
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 20 || r.height < 8 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        if (r.width < vw * 0.5 && r.height > vh * 0.5) { side = Math.max(side, r.width); continue; } // a side rail
        if (r.top <= 4 && r.bottom < vh * 0.6) top = Math.max(top, r.bottom);
        else if (r.top > vh * 0.4 && r.bottom > vh * 0.6) bottom = Math.max(bottom, vh - r.top); // the tab bar, and the Continue bar above it
      }
      const small = [...document.querySelectorAll('button, a[href], [data-action]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 44 && getComputedStyle(e).visibility !== 'hidden'; }).length;
      return { top: Math.round(top), bottom: Math.round(bottom), side: Math.round(side), free: Math.round(vh - top - bottom), screens: +(document.documentElement.scrollHeight / vh).toFixed(1), overflowX: document.documentElement.scrollWidth > vw + 1, small };
    });
    let shotN = 0;
    const record = async (name) => {
      await page.waitForTimeout(250);
      await page.evaluate(() => window.scrollTo(0, 0));
      const m = await measure();
      const file = `${w}x${h}-${String(++shotN).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
      await page.screenshot({ path: join(out, file) });
      rows.push({ size: `${w}x${h}`, name, file, ...m });
    };

    await page.goto(`http://localhost:${port}/?seed=${SEED}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload(); await page.waitForSelector('#app *');
    await record('first load');
    for (let i = 0; i < 3 && await click('[data-action="difficulty"], [data-action="pick-start"]'); i++);
    if (await visible('[data-action="founder-toggle"]').count()) {
      await record('founders pick');
      for (let i = 0; i < 3; i++) await click('[data-action="founder-toggle"]:not(.is-on):not([disabled])');
      await click('[data-action="found-crew"]');
    }
    for (const id of ['inbox', 'city', 'tong', 'crew', 'jobs', 'settings']) {
      if (!(await click(`[data-action="nav"][data-id="${id}"]`))) continue;
      if (id === 'jobs') await page.waitForFunction(() => !document.querySelector('.jobcard.is-reading'), null, { timeout: 15000 }).catch(() => {});
      await record(id);
      const tabs = await visible('.subtab').evaluateAll((els) => els.map((e) => ({ action: e.dataset.action, id: e.dataset.id, label: e.textContent.trim().replace(/\s+/g, ' ') })));
      for (const t of tabs.slice(1)) { if (await click(`.subtab[data-action="${t.action}"][data-id="${t.id}"]`)) await record(`${id} / ${t.label}`); }
      if (tabs[0]) await click(`.subtab[data-action="${tabs[0].action}"][data-id="${tabs[0].id}"]`);
      if (id === 'crew') { if (await click('[data-action="open-op"]')) { await record('crew / runner page'); await click('[data-action="back"]'); } }
      if (id === 'jobs') { if (await click('[data-action="open-job"]')) { await record('jobs / planning (squad board)'); await click('[data-action="back"]'); } }
      if (id === 'inbox') { if (await click('[data-action="open-message"]')) { await record('inbox / a message'); await click('[data-action="back"]'); } }
    }
    await page.close();
  }
} finally { await browser.close(); server.kill(); }

// Report: worst first at the main size, then the same screens at the other two.
const main = rows.filter((r) => r.size === '844x390').sort((a, b) => a.free - b.free);
const by = (size, name) => rows.find((r) => r.size === size && r.name === name);
const flag = (r) => [r.overflowX ? 'sideways scroll' : '', r.small ? `${r.small} small targets` : ''].filter(Boolean).join(', ') || '-';
const lines = ['# Landscape phone audit, 2026-11-19', '',
  'Made by `node scripts/audit-landscape.mjs`. The game as it is today, on a fresh seed-21 game, at landscape phone sizes. Nothing was changed.',
  '"Bars" is the height held by fixed or sticky bars (top plus bottom); "free" is what is left for the screen itself; "screens" is the page length in screens of that height (1.0 = no scrolling).', '',
  '## 844 x 390 (iPhone 14), worst first', '', '| Screen | Top bar | Bottom bar | Side rail | Free height | Screens long | Other | 932x430 free | 667x375 free | Shot |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...main.map((r) => `| ${r.name} | ${r.top} | ${r.bottom} | ${r.side} | **${r.free}** (${Math.round((r.free / 390) * 100)}%) | ${r.screens} | ${flag(r)} | ${by('932x430', r.name)?.free ?? '?'} | ${by('667x375', r.name)?.free ?? '?'} | [${r.file}](${r.file}) |`), ''];
writeFileSync(join(out, 'README.md'), lines.join('\n'));
console.log(lines.join('\n'));
