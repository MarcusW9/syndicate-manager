// Screenshot the game for the visual history in docs/screenshots/.
//
//   npm run screenshots -- <slug>                       this working tree
//   npm run screenshots -- <slug> --commit <sha>        an older version (git worktree)
//   options: --date YYYY-MM-DD (default: today, or the commit's date)
//
// Plays a fresh game at phone width (390x844, 2x), saves one PNG per
// screen, then one desktop view (1440x900), into docs/screenshots/<date>-<slug>/. Drives the UI through the
// data-action attributes, which every version so far has used, and skips any
// screen an older version doesn't have. Math.random is seeded in the page so
// reruns give the same crew and jobs.
//
// Needs Playwright's Chromium: `npx playwright install chromium` once.

import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repo = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args.splice(i, 2)[1] : null; };
const commit = flag('commit');
let date = flag('date');
const slug = args[0];
if (!slug) { console.error('Usage: npm run screenshots -- <slug> [--commit <sha>] [--date YYYY-MM-DD]'); process.exit(1); }

const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8' }).trim();
if (!date) date = commit ? git('show', '-s', '--format=%ad', '--date=short', commit) : new Date().toISOString().slice(0, 10);

const outDir = join(repo, 'docs', 'screenshots', `${date}-${slug}`);
mkdirSync(outDir, { recursive: true });

// An older version gets its own worktree, sharing this checkout's node_modules.
let root = repo;
let tmp = null;
if (commit) {
  tmp = mkdtempSync(join(tmpdir(), 'shots-'));
  root = join(tmp, 'tree');
  git('worktree', 'add', '--detach', root, commit);
  symlinkSync(join(repo, 'node_modules'), join(root, 'node_modules'));
}

const port = 5300 + Math.floor(Math.random() * 600);
const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['--port', String(port), '--strictPort'], { cwd: root, stdio: 'pipe' });
await new Promise((ok, fail) => {
  server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); });
  server.on('exit', (c) => fail(new Error(`vite exited ${c}`)));
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.error(`page error: ${e.message}`));
await page.addInitScript(() => {
  let s = 20261023;
  Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
});

let n = 0;
const shots = [];
async function shot(name) {
  await page.waitForTimeout(250);
  const file = `${String(++n).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: join(outDir, file) });
  shots.push(file);
}
const visible = (sel) => page.locator(sel).filter({ visible: true });
async function click(sel) {
  const el = visible(sel).first();
  if (!(await el.count()) || !(await el.isEnabled())) return false;
  await el.scrollIntoViewIfNeeded();
  await el.click();
  await page.waitForTimeout(150);
  return true;
}
const top = () => page.evaluate(() => window.scrollTo(0, 0));

try {
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#app *');
  await shot('first-load');

  // Settle a start-of-game choice, if this version opens with one.
  for (let i = 0; i < 3 && await click('[data-action="difficulty"], [data-action="pick-start"]'); i++);

  if (await click('[data-action="nav"][data-id="inbox"]')) {
    await click('[data-action="open-message"]');
    await top(); await shot('inbox');
    await click('[data-action="back"]');
  }

  // Gear (2026-10-28, slice 5): buy a rifle in the armoury and put it on someone, so overwatch is possible.
  if (await click('[data-action="nav"][data-id="crew"]') && await click('[data-action="open-armoury"]')) {
    await top(); await shot('armoury');
    await click('[data-action="buy"][data-id="rifle"][data-tier="street"]');
    await click('[data-action="back"]');
    if (await click('[data-action="open-op"]:has-text("muscle")') || await click('[data-action="open-op"]')) {
      await click('[data-action="gear-slot"][data-id="weapon"]');
      await shot('gear-sheet');
      await click('.sheet [data-action="equip"]');
      await page.evaluate(() => document.querySelector('.loadout')?.scrollIntoView({ block: 'center' }));
      await shot('operative-gear');
      await click('[data-action="back"]');
    }
  }

  if (await click('[data-action="nav"][data-id="jobs"]')) {
    await top(); await shot('job-board');
    if (await click('[data-action="open-job"]')) {
      await top(); await shot('planning');
      // The squad board (2026-10-27, slice 2): Joss fills it; a look at the picker sheet.
      if (await click('[data-action="joss"]')) {
        await click('[data-action="callin"][data-id="every"]');
        await page.evaluate(() => document.querySelector('.board')?.scrollIntoView({ block: 'center' }));
        await shot('squad-board');
        await page.evaluate(() => document.querySelector('#risk-read')?.scrollIntoView({ block: 'center' }));
        await shot('coverage-read');
        if (await click('[data-action="pick-slot"]')) { await shot('squad-picker'); await click('.sheet [data-action="close-picker"]'); }
      } else {
        for (let i = 0; i < 4; i++) await click('[data-action="toggle-crew"]:not(.is-on):not([disabled])');
        // The squad run (2026-10-27): someone on overwatch, and call-ins at every crisis so one shows up.
        await click('[data-action="overwatch"]');
        await click('[data-action="callin"][data-id="every"]');
      }
      await shot('planning-crew-picked');
      if (await click('[data-action="start-job"]')) {
        let crisisShot = false;
        let watchShots = 0;
        let waits = 0;
        for (let i = 0; i < 400; i++) {
          if (await visible('[data-action="close-mission"]').count()) break;
          if (await visible('[data-action="choose"], [data-action="critical"]').count()) {
            if (!crisisShot) { await shot('crisis'); crisisShot = true; }
            // Play it safe: extract on a critical, otherwise the first option that isn't an abort.
            if (await click('[data-action="critical"][data-id="extract"]')) continue;
            const opts = visible('[data-action="choose"]:not([disabled])');
            const count = await opts.count();
            let picked = false;
            for (let k = 0; k < count && !picked; k++) {
              const id = await opts.nth(k).getAttribute('data-id');
              if (!/abort/i.test(id ?? '')) { await opts.nth(k).click(); picked = true; }
            }
            if (!picked && !(await click('[data-action="choose"], [data-action="critical"]'))) break;
            await page.waitForTimeout(150);
            continue;
          }
          // A decision the run stops for (max alert, someone down): carry on rather than pull out.
          if (await visible('[data-action="pending"]').count()) {
            if (!(await click('[data-action="pending"]:not([data-id="out"])'))) await click('[data-action="pending"]');
            continue;
          }
          if (await click('[data-action="step"], [data-action="beat"]')) continue;
          // The watch screen (slice 2) plays on its own: wait, and catch it mid-run twice.
          if (!(await visible('.watch').count())) break;
          await page.waitForTimeout(500);
          waits++;
          if ((waits === 4 && watchShots === 0) || (waits === 14 && watchShots === 1)) await shot(`watch-${++watchShots}`);
        }
        await shot('mission-end');
        if (await click('[data-action="close-mission"]')) {
          await click('[data-action="nav"][data-id="inbox"]');
          const report = visible('[data-action="open-message"]').filter({ hasText: /report/i }).first();
          if (await report.count()) { await report.click(); await top(); await shot('report'); await click('[data-action="back"]'); }
        }
      }
    }
  }

  if (await click('[data-action="nav"][data-id="crew"]')) {
    await top(); await shot('crew');
    if (await click('[data-action="open-op"]')) { await top(); await shot('operative'); await click('[data-action="back"]'); }
  }
  if (await click('[data-action="nav"][data-id="city"]')) { await top(); await shot('city'); }
  if (await click('[data-action="nav"][data-id="today"]')) { await top(); await shot('today'); }

  // One wide view of the home screen, to show the desktop layout.
  await page.setViewportSize({ width: 1440, height: 900 });
  await click('[data-action="nav"][data-id="today"]') || await click('[data-action="nav"][data-id="inbox"]');
  await top(); await shot('desktop');
} finally {
  await browser.close();
  server.kill();
  if (commit) {
    git('worktree', 'remove', '--force', root);
    rmSync(tmp, { recursive: true, force: true });
  }
}

console.log(`${shots.length} screenshots in ${outDir}`);
if (!existsSync(join(outDir, shots[0] ?? '-'))) process.exit(1);
