// Landscape-phone audit of the live job's other screens (2026-11-19): the face-off (ui/duel.js, a pop-up over the map when a moment comes
// down to one roll) and the finale (the result and the team at the end of a job). Starts a real job in the game and waits for each to show,
// then measures it the way audit-fight-landscape.mjs does. Changes nothing in the game.
//   node scripts/audit-watch-landscape.mjs [out dir] [--job delivery] [--seed 1]
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { createNewGame } = await import('../src/core/state.js');
const M = await import('../src/core/mission.js');
const { addOffer, templateById } = await import('../src/core/jobs.js');

const args = process.argv.slice(2);
const flag = (name, d = null) => { const i = args.indexOf(`--${name}`); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const job = flag('job', 'delivery');
const seed = Number(flag('seed', '1'));
const repo = resolve(new URL('..', import.meta.url).pathname);
const out = resolve(args[0] ?? join(repo, 'docs/audits/2026-11-19-landscape-watch'));
mkdirSync(out, { recursive: true });

let save = createNewGame({ seed, startCrew: 'fresh' });
save.jobs = [];
addOffer(save, job);
save = M.startMission(save, save.jobs[0].id, save.crew.slice(0, templateById(job).crewSize).map((o) => o.id), 'loud', { callIn: 'never', orders: 'steady' });

const port = 5900 + Math.floor(Math.random() * 90);
const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok, fail) => { server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); }); server.on('exit', (c) => fail(new Error(`vite exited ${c}`))); });

const SIZES = [[844, 390], [932, 430], [667, 375], [390, 844]];
const browser = await chromium.launch();
const rows = [];
try {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
    await page.addInitScript(([state]) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('syndicate-active-slot', '1');
      localStorage.setItem('syndicate-slot-1', state);
    }, [JSON.stringify(save)]);
    const measure = (sel) => page.evaluate((q) => {
      const vh = innerHeight, vw = innerWidth;
      const el = document.querySelector(q);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const inView = r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw;
      const fixed = [...document.querySelectorAll('body *')].filter((e) => { const c = getComputedStyle(e); if (c.position !== 'fixed' && c.position !== 'sticky') return false; const b = e.getBoundingClientRect(); return b.width > 20 && b.height > 8; });
      const covers = fixed.some((e) => { if (e.contains(el) || el.contains(e)) return false; const b = e.getBoundingClientRect(); return b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top; });
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left), inView, covered: covers, screens: +(document.documentElement.scrollHeight / vh).toFixed(1), overflowX: document.documentElement.scrollWidth > vw + 1 };
    }, sel);
    await page.goto(`http://localhost:${port}/`);
    await page.waitForSelector('.watch', { timeout: 15000 });
    // Faster shortens the feed (a speed control on the bar), so the job finishes within the wait.
    await page.locator('[data-action="speed"]').filter({ visible: true }).last().click({ timeout: 2000 }).catch(() => {});
    const seen = { duel: false, finale: false };
    for (let t = 0; t < 600 && !(seen.duel && seen.finale); t++) {
      await page.waitForTimeout(200);
      for (const [name, sel] of [['duel', '.duel.is-in'], ['finale', '.finale']]) {
        if (seen[name]) continue;
        if (await page.locator(sel).count()) {
          if (name === 'finale') await page.locator('.finale__go').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
          await page.waitForTimeout(name === 'duel' ? 500 : 800);
          const m = await measure(name === 'duel' ? '.duel' : '.finale');
          if (name === 'finale') { const go = await measure('.finale__go'); if (m) { m.go = go ? (go.inView ? 'yes' : '**no**') : 'none found'; } }
          const file = `${w}x${h}-${name}.png`;
          await page.screenshot({ path: join(out, file) });
          rows.push({ size: `${w}x${h}`, name, file, ...(m ?? {}) }); seen[name] = true;
        }
      }
    }
    for (const n of ['duel', 'finale']) if (!seen[n]) { rows.push({ size: `${w}x${h}`, name: n, file: '', missing: true }); console.error(`${w}x${h}: no ${n} appeared`); }
    await page.close();
  }
} finally { await browser.close(); server.kill(); }

const lines = ['# Landscape phone audit: the face-off and the finale, 2026-11-19', '',
  `Made by \`node scripts/audit-watch-landscape.mjs\` on a real ${job} job (seed ${seed}). Nothing was changed. "In view" says whether the whole thing is inside the screen; "covered" whether a fixed bar sits over it.`, '',
  '| Size | Screen | Width x height | In view | Covered | Screens long | Continue button in view | Other | Shot |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map((r) => r.missing ? `| ${r.size} | ${r.name} | - | - | - | - | - | did not appear | - |` : `| ${r.size} | ${r.name} | ${r.w}x${r.h} | ${r.inView ? 'yes' : '**no**'} | ${r.covered ? '**yes**' : 'no'} | ${r.screens} | ${r.go ?? '-'} | ${r.overflowX ? 'sideways scroll' : '-'} | [${r.file}](${r.file}) |`), ''];
writeFileSync(join(out, 'README.md'), lines.join('\n'));
console.log(lines.join('\n'));
