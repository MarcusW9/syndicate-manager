// Mock-up (2026-11-06, owner: the top bar "looks packed ... is Backroom necessary there or can we
// move it to ops ... heat per district so what does this represent?"): the top bar now and as
// proposed, on a phone (390) and a computer (1280): the rank moves to the Ops heading, heat shows
// only from 3 (a chip naming the district, amber, red from 6 when raids can come), the date drops
// the season, the bills line drops "Day 1". Writes drafts/prototypes/topbar.html; with an out dir,
// also screenshots it.
//   node scripts/mockup-topbar.mjs [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const squares = (today = 0) => `<span class="week">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<span class="sq ${i < today ? 'done' : i === today ? 'today' : ''} ${i === 6 ? 'bills' : ''}"></span>`).join('')}</span>`;
const before = `
  <header class="bar bar--phone">
    <div class="when"><b class="date">MON · WK 1 · <br>S1</b>${squares()}<span class="note">DAY 1 · ¥2,750 DUE<br>SUN</span></div>
    <div class="stats"><span class="cash">¥40,000 <span class="up">▲¥32,000</span></span><span class="heat"><span class="lab">HEAT</span> <span class="track"></span> 0/10</span><span class="rank">BACK ROOM</span></div>
    <span class="menu">☰</span>
  </header>`;
const after = (chip = '', day = 0, dateNote = '¥2,750 due Sun', cashUp = '▲¥32,000') => `
  <header class="bar bar--phone bar--new">
    <div class="when"><b class="date">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][day]} · WK 1</b>${squares(day)}<span class="note">${dateNote}</span></div>
    <div class="stats"><span class="cash">¥40,000</span>${cashUp ? `<span class="up">${cashUp}</span>` : ''}</div>
    ${chip}
    <span class="menu">☰</span>
  </header>`;
const chip = (d, n) => `<button class="hchip ${n >= 6 ? 'hot' : 'warm'}"><span class="hchip__l">Heat</span> ${d} <b>${n}</b></button>`;
const deskBefore = `
  <header class="bar bar--desk"><div class="when"><b class="date">MON · WK 1 · S1</b>${squares()}<span class="note">DAY 1 · ¥2,750 DUE SUN</span></div>
    <div class="stats"><span class="lab">CASH</span> <span class="cash">¥40,000 <span class="up">▲¥32,000</span></span><span class="heat"><span class="lab">HEAT · DOCKS</span> <span class="track track--hot"></span> <span class="red">7/10</span></span><span class="rank">BACK ROOM TONG</span></div>
    <span class="go">CONTINUE → TUE<small>3 JOBS OPEN</small></span></header>`;
const deskAfter = `
  <header class="bar bar--desk bar--new"><div class="when"><b class="date">MON · WK 1</b>${squares()}<span class="note">¥2,750 due Sun</span></div>
    <div class="stats"><span class="lab">CASH</span> <span class="cash">¥40,000 <span class="up">▲¥32,000</span></span>${chip('Docks', 7)}</div>
    <span class="go">CONTINUE → TUE<small>3 JOBS OPEN</small></span></header>`;
const opsHead = `
  <div class="ops"><h1>OPS <span class="sub">LANTERN BAY TONIGHT</span></h1><button class="rank rank--ops">BACK ROOM TONG</button></div>
  <p class="opsnote">The rank is on Ops now: tap it for what a tong is, and what it takes to move up.</p>`;

const css = `
:root { --bg:#0a0c0f; --panel:#12151b; --line:#2a303b; --text:#e9ecf1; --muted:#8a93a6; --accent:#ff3d5f; --cyan:#3de8d8; --warn:#f2d541; --amber:#f2b544; --danger:#ff4a4a; --good:#5fe0a5; --display:'Rajdhani','Arial Narrow',system-ui,sans-serif; }
* { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.4 system-ui, sans-serif; padding: 24px; }
h2 { font: 700 .85rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--cyan); margin: 26px 0 8px; }
.cap { color: var(--muted); font-size: .8rem; margin: 6px 0 0; max-width: 60ch; }
.row { display: flex; flex-wrap: wrap; gap: 22px; align-items: flex-start; }
.bar { display: flex; align-items: center; gap: 10px; background: rgba(10,12,15,.92); border: 1px solid var(--line); padding: 12px; position: relative; font-family: var(--display); }
.bar::after { content: ''; position: absolute; left: 12px; bottom: -1px; width: 48px; height: 2px; background: var(--accent); }
.bar--phone { width: 390px; } .bar--desk { width: 1180px; padding: 12px 20px; gap: 28px; }
.when { display: grid; gap: 4px; flex: 1 1 auto; min-width: 0; }
.bar--desk .when { flex: 0 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 2px 12px; }
.date { font-size: 1.15rem; letter-spacing: .06em; }
.week { display: grid; grid-template-columns: repeat(7, 14px); gap: 3px; } .sq { height: 8px; background: var(--line); } .sq.bills { box-shadow: inset 0 0 0 1px var(--warn); } .sq.done { background: #2a6b63; } .sq.today { background: var(--cyan); }
.note { color: var(--muted); font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; }
.bar--desk .note { flex: 1 1 100%; }
.stats { display: grid; justify-items: end; gap: 4px 10px; grid-template-columns: auto auto; align-items: center; font-size: 1.05rem; font-weight: 600; }
.bar--phone .stats .cash { grid-column: 1 / -1; }
.bar--new.bar--phone .stats { grid-template-columns: auto; gap: 0; }
.bar--desk .stats { display: flex; gap: 14px; flex: 1 1 auto; justify-content: center; }
.up { color: var(--good); font-size: .8rem; } .lab { color: var(--muted); font-size: .72rem; letter-spacing: .12em; }
.heat { display: inline-flex; align-items: center; gap: 6px; } .track { width: 36px; height: 6px; background: var(--line); } .track--hot { background: linear-gradient(90deg, var(--danger) 70%, var(--line) 70%); } .red { color: var(--danger); }
.rank { border: 1px solid var(--warn); color: var(--warn); padding: 4px 10px; font: 700 .75rem var(--display); letter-spacing: .12em; background: none; border-radius: 6px; }
.menu { color: var(--muted); font-size: 1.4rem; padding: 0 4px; }
.go { background: var(--accent); color: #fff; font: 700 1rem var(--display); letter-spacing: .12em; padding: 6px 18px; display: grid; justify-items: center; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%); margin-left: auto; } .go small { font-size: .7rem; font-weight: 600; opacity: .9; }
.hchip { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 10px; background: none; font: 700 .85rem var(--display); letter-spacing: .1em; text-transform: uppercase; cursor: pointer; }
.hchip b { font-size: 1.05rem; } .hchip__l { font-weight: 600; font-size: .7rem; opacity: .8; }
.hchip.warm { border: 1px solid var(--amber); color: var(--amber); background: rgba(242,181,68,.08); }
.hchip.hot { border: 1px solid var(--danger); color: var(--danger); background: rgba(255,74,74,.1); box-shadow: 0 0 10px rgba(255,74,74,.25); }
.ops { width: 390px; background: var(--panel); border: 1px solid var(--line); padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ops h1 { margin: 0; font: 700 1.6rem var(--display); letter-spacing: .04em; } .ops .sub { font-size: .75rem; color: var(--muted); letter-spacing: .14em; }
.opsnote { color: var(--muted); font-size: .8rem; max-width: 390px; margin: 6px 0 0; }
`;
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Top Bar Mock-up</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body>
<section id="phone">
<h2>Phone: now</h2>${before}<p class="cap">Seven things, three lines deep. Heat 0/10 is the hottest district's number, unnamed; the rank rarely changes.</p>
<h2>Phone: proposed, no heat anywhere (most days)</h2>${after()}<p class="cap">The date, the week, the bills; cash; ☰. Two lines.</p>
<h2>Phone: proposed, a district warming (3 to 5)</h2>${after(chip('Docks', 4))}<p class="cap">A chip appears, amber, naming the district. Tap it: that district on Ops.</p>
<h2>Phone: proposed, hot (6 and up: raids can come)</h2>${after(chip('Docks', 7), 2, '¥2,750 due Sun', '')}<p class="cap">Red, with a soft glow. The cash change shows only on the day it changes.</p>
<h2>The rank, on the Ops heading</h2>${opsHead}
</section>
<section id="desk">
<h2>Computer: now (with heat 7 in the Docks)</h2>${deskBefore}
<h2>Computer: proposed</h2>${deskAfter}<p class="cap">The same rules: no season, no "Day 1", no rank; heat as a chip only from 3. Save is already in the sidebar.</p>
</section>
</body></html>`;
const file = new URL('../drafts/prototypes/topbar.html', import.meta.url).pathname;
writeFileSync(file, html);
console.log('wrote', file);
const dir = process.argv[2];
if (dir) {
  mkdirSync(dir, { recursive: true });
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1260, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(`file://${file}`); await p.waitForTimeout(700);
  await p.locator('#phone').screenshot({ path: `${dir}/topbar-phone.png` });
  await p.locator('#desk').screenshot({ path: `${dir}/topbar-desktop.png` });
  await b.close();
}
