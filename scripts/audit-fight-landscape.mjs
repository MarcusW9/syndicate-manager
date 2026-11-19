// Landscape-phone audit of the live fight (2026-11-19): the same measure as audit-landscape.mjs, on a real engine-2 fight (the staging comes
// from scripts/preview-livebattle.mjs) at 844x390, 932x430 and 667x375, plus portrait 390x844 for comparison. For the fight's start (orders),
// the first round playing and the round's end it records the bars, the free height, the map's height, whether the next action is on screen
// without scrolling, sideways overflow and small tap targets. Changes nothing in the game.
//   node scripts/audit-fight-landscape.mjs [out dir] [--job warehouse] [--seed 1] [--engine 1]
// --engine 1 stages an old-engine command fight instead (ui/fightorders.js: pick a runner, give an order, Go), e.g. --job herbal_run.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { createNewGame } = await import('../src/core/state.js');
const M = await import('../src/core/mission.js');
const { addOffer, templateById } = await import('../src/core/jobs.js');
const { autoStep } = await import('../src/core/autorun.js');

const args = process.argv.slice(2);
const flag = (name, d = null) => { const i = args.indexOf(`--${name}`); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const job = flag('job', 'warehouse');
const seed = Number(flag('seed', '1'));
const engine1 = flag('engine', '2') === '1';
const repo = resolve(new URL('..', import.meta.url).pathname);
const out = resolve(args[0] ?? join(repo, 'docs/audits/2026-11-19-landscape-fights'));
mkdirSync(out, { recursive: true });

function atFight() {
  for (let k = seed; k < seed + 40; k++) {
    let s = createNewGame({ seed: k, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, job);
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(job).crewSize).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady' });
    for (let g = 0; g < 400 && !s.activeMission.done; g++) {
      if ((s.activeMission.battle?.engine === 2) === !engine1 && s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle') return s;
      const next = autoStep(s, { force: true });
      if (next === s) break;
      s = next;
    }
  }
  throw new Error('no engine-2 fight found');
}
const save = atFight();

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
      localStorage.setItem('syndicate-pref-fight-watch', '1');
    }, [JSON.stringify(save)]);
    const measure = () => page.evaluate(() => {
      const vh = innerHeight, vw = innerWidth;
      let top = 0, bottom = 0, side = 0;
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 20 || r.height < 8 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        if (r.width < vw * 0.5 && r.height > vh * 0.5) { side = Math.max(side, r.width); continue; }
        if (r.top <= 4 && r.bottom < vh * 0.6) top = Math.max(top, r.bottom);
        else if (r.top > vh * 0.4 && r.bottom > vh * 0.6) bottom = Math.max(bottom, vh - r.top);
      }
      const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width), top: Math.round(r.top), seen: Math.round(Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))) }; };
      const map = box('.siteplan') ?? box('.fs-map') ?? box('.sp-stage');
      const act = [...document.querySelectorAll('[data-action="fs-next"], [data-action="pending"], [data-action="fight-go"], [data-action="orders-go"], .watch__bar button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      const onScreen = act.some((e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= vh; });
      const small = [...document.querySelectorAll('button, a[href], [data-action]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 44 && getComputedStyle(e).visibility !== 'hidden'; }).length;
      return { top: Math.round(top), bottom: Math.round(bottom), side: Math.round(side), free: Math.round(vh - top - bottom), screens: +(document.documentElement.scrollHeight / vh).toFixed(1), overflowX: document.documentElement.scrollWidth > vw + 1, small, mapSeenPct: map ? Math.round((map.seen / vh) * 100) : null, mapH: map?.h ?? null, mapW: map?.w ?? null, actions: act.length, actionOnScreen: onScreen };
    });
    let k = 0;
    const record = async (name) => {
      await page.evaluate(() => window.scrollTo(0, 0));
      const m = await measure();
      const file = `${w}x${h}-${String(++k).padStart(2, '0')}-${name.replace(/ /g, '-')}.png`;
      await page.screenshot({ path: join(out, file) });
      rows.push({ size: `${w}x${h}`, name, file, ...m });
    };
    await page.goto(`http://localhost:${port}/`);
    await page.waitForSelector('.watch', { timeout: 15000 }).catch(async (e) => { await page.screenshot({ path: join(out, `${w}x${h}-no-watch.png`) }); console.error('no .watch:', (await page.locator('body').innerText()).slice(0, 300).replace(/\n+/g, ' | ')); throw e; });
    await page.waitForTimeout(1500);
    await record('fight start');
    if (process.env.SCROLL && w === 844) { const probe = () => page.evaluate(() => document.querySelector('.watch__side')?.scrollTop); await page.evaluate(() => { const s = document.querySelector('.watch__side'); s.scrollTop = 0; window.__log = []; s.addEventListener('scroll', () => window.__log.push([Math.round(performance.now()), s.scrollTop])); }); console.log('after reset', await probe()); await page.waitForTimeout(1500); console.log('later', await probe(), JSON.stringify(await page.evaluate(() => window.__log))); }
    if (process.env.SCROLL && w === 844) console.log('scroll', await page.evaluate(() => ({ y: scrollY, side: document.querySelector('.watch__side')?.scrollTop, sideH: document.querySelector('.watch__side')?.scrollHeight, live: document.querySelector('.watch__live')?.getBoundingClientRect().top })));
    if (process.env.DUMP && w === 844) console.log(await page.evaluate(() => { const lines = []; const walk = (e, d) => { if (d > 3) return; for (const c of e.children) { if (c.closest('svg') && c.tagName.toLowerCase() !== 'svg') continue; { const r = c.getBoundingClientRect(); if (r.height > 6) lines.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}.${String(c.getAttribute('class') ?? '').split(' ').join('.')} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`); walk(c, d + 1); } } }; walk(document.querySelector('.watch'), 0); return lines.join('\n'); }));
    if (engine1) {
      // A command fight: pick the first runner, give the first order, then Go.
      const click = async (sel) => { const e = page.locator(sel).filter({ visible: true }).first(); if (!(await e.count()) || !(await e.isEnabled())) return false; await e.scrollIntoViewIfNeeded().catch(() => {}); const ok = await e.click({ timeout: 4000 }).then(() => true, () => false); await page.waitForTimeout(400); if (!ok) console.error(`${w}x${h}: could not click ${sel} (covered or off screen)`); return ok; };
      if (await click('button[data-action="fight-sel"]')) { await record('a runner picked'); if (await click('button[data-action="fight-order"]')) await record('an order given'); }
      if (await click('button[data-action="fight-go"]')) { await page.waitForTimeout(1500); await record('after Go'); }
      await page.close();
      continue;
    }
    const next = page.locator('[data-action="fs-next"]').filter({ visible: true }).first();
    if (await next.count()) { await next.click(); await page.waitForTimeout(1300); await record('round playing'); await page.waitForTimeout(4500); await record('round ends'); }
    else console.error(`no fs-next at ${w}x${h}`);
    await page.close();
  }
} finally { await browser.close(); server.kill(); }

const by = (size, name) => rows.find((r) => r.size === size && r.name === name);
const lines = ['# Landscape phone audit: the live fight, 2026-11-19', '',
  `Made by \`node scripts/audit-fight-landscape.mjs\` on a real ${job} fight (seed ${seed}). Nothing was changed. "Free" is the height left once fixed bars are taken off; "map seen" is how much of the screen the fight map fills; "action on screen" says whether the next tap (Next, an order) is visible without scrolling.`, '',
  '| Size | Moment | Top | Bottom | Side | Free | Map seen | Map px | Screens long | Action on screen | Other | Shot |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.size} | ${r.name} | ${r.top} | ${r.bottom} | ${r.side} | **${r.free}** (${Math.round((r.free / Number(r.size.split('x')[1])) * 100)}%) | ${r.mapSeenPct ?? '?'}% | ${r.mapW ?? '?'}x${r.mapH ?? '?'} | ${r.screens} | ${r.actionOnScreen ? 'yes' : `**no** (${r.actions} found)`} | ${[r.overflowX ? 'sideways scroll' : '', r.small ? `${r.small} small targets` : ''].filter(Boolean).join(', ') || '-'} | [${r.file}](${r.file}) |`), ''];
writeFileSync(join(out, 'README.md'), lines.join('\n'));
console.log(lines.join('\n'));
