// Mock-up for drafts/PROPOSAL-tong-depth.md section 6 (2026-11-13): City › Tongs with the ladder and the
// come-and-gone strip, a house file, and the Anchor's slate as face tiles. Tongs, names, tiers, grades and
// faces are real (seed 1234 played 20 Sundays through core/rivals.js); habits, how a house is doing, how it
// looks at us, the read marks and the moves are invented here, because those rules are not built.
//   node drafts/prototypes/tongs-depth.mjs   → drafts/prototypes/tongs-depth.html
import { readFileSync, writeFileSync } from 'node:fs';
import { createNewGame } from '../../src/core/state.js';
import { weeklyRivals, rivalView } from '../../src/core/rivals.js';
import { bookView } from '../../src/core/book.js';
import { dossierOf } from '../../src/core/dossier.js';
import { portrait } from '../../src/ui/art.js';
import { NAMES } from '../../src/config/names.js';
import { TONG_RANKS } from '../../src/data/tong.js';

const state = createNewGame({ seed: 1234 });
for (let w = 1; w <= 20; w++) { state.day = w * 7; weeklyRivals(state); }
const r = state.rivals;
const view = rivalView(state);
const book = bookView(state);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const font = (w) => readFileSync(new URL(`../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-${w}-normal.woff2`, import.meta.url)).toString('base64');
const COLOUR = { loud: '#ff3d5f', quiet: '#b48cff', corporate: '#3de8d8', street: '#f2d541' };
const letters = (name) => { const w = name.replace(/&/g, '').split(' '); return (w[0].length <= 3 ? w[0] : w[0][0] + (w[1]?.[0] ?? '')).toUpperCase().slice(0, 2); };
const tongs = view.tiers.flatMap((t) => t.tongs.map((x) => ({ ...x, tier: t.tier })));
const tongByName = Object.fromEntries(tongs.map((t) => [t.name, t]));
const seal = (t, cls = '') => (t === 'ours' ? `<span class="seal seal--ours ${cls}">LB</span>`
  : t ? `<span class="seal ${cls}" style="--tong:${COLOUR[t.style]}">${esc(letters(t.name))}</span>` : `<span class="seal seal--free ${cls}"></span>`);
const cardByName = (name) => r.cards.find((c) => c.name === name);
const face = (name, size = 44) => { const c = cardByName(name); return `<span class="face" style="width:${size}px;height:${size}px">${c ? portrait(dossierOf(state, c), { size }) : ''}</span>`; };
const gradeOf = Object.fromEntries(book.groups.flatMap((g) => g.entries.map((e) => [e.name, g.grade])));

// Invented for the mock-up (sections 2 to 5 of the proposal are not built).
const HABIT = ['Short table', 'Grinder', 'Old house', 'Workshop', 'Grinder', 'Old house'];
const DOING = ['Flush', 'Selling', 'Steady', '?', 'Steady', '?'];
const MOOD = ['', 'Cold to us', '', 'Warm to us', '', ''];
tongs.forEach((t, i) => { t.habit = HABIT[i % 6]; t.doing = DOING[i % 6]; t.mood = MOOD[i % 6]; t.cards = r.cards.filter((c) => c.tongId === t.id); });

const chip = (text, kind = '') => (text ? `<span class="chip ${kind}">${esc(text)}</span>` : '');
const doingKind = (d) => (d === 'Stretched' || d === 'Selling' ? 'chip--warn' : d === 'Flush' ? 'chip--good' : d === '?' ? 'chip--unknown' : '');

// --- Screen 1: City › Tongs ---
const rungs = [...TONG_RANKS].reverse().map((k) => {
  const here = tongs.filter((t) => t.tier === k.id);
  const ours = k.id === 'street';
  return `<div class="rung ${ours ? 'rung--ours' : ''}"><span class="rung__name">${esc(k.name)}</span>
    <span class="rung__seals">${here.map((t, i) => `<span class="sealwrap">${seal(t)}${t.name === 'BL Partners' ? '<i class="mv mv--up">▲</i>' : ''}</span>`).join('')}${ours ? `<span class="sealwrap">${seal('ours')}<b class="ourtag">Ours</b></span>` : ''}${!here.length && !ours ? '<span class="rung__none">nobody, yet</span>' : ''}</span></div>`;
}).join('');

const moves = [
  { name: 'Marisol dela Cruz', from: 'Cleaver Fist', to: null, note: 'Let go' },
  { name: 'Marco Petrov', from: 'BL Partners', to: 'Service Steps Lot', note: 'Landed' },
  { name: 'Jun Garcia', from: null, to: 'Salt Cormorant Hand', note: 'Signed' },
  { name: 'Zara Khan', from: 'Third Mist Society', to: 'Basin Court', note: 'Moved' },
].map((m) => `<div class="move">${face(m.name, 40)}<span class="move__who">${esc(m.name.split(' ')[0])}</span>
  <span class="move__path">${seal(tongByName[m.from], 'seal--sm')}<i>→</i>${seal(tongByName[m.to], 'seal--sm')}</span><span class="move__note">${esc(m.note)}</span></div>`).join('');

const houseCard = (t, story) => `<div class="house" style="--tong:${COLOUR[t.style]}">
  <div class="house__top">${seal(t, 'seal--lg')}<div class="house__what"><span class="house__name">${esc(t.name)}</span>
    <span class="small muted">${esc(NAMES.districts[t.home])} · run by ${esc(t.head ?? '')}</span></div><span class="go">›</span></div>
  <div class="chips">${chip(t.habit)}${chip(t.doing === '?' ? 'Not watched' : t.doing, doingKind(t.doing))}${chip(t.mood, t.mood.startsWith('Cold') ? 'chip--cold' : 'chip--good')}</div>
  <div class="faces">${t.cards.slice(0, t.doing === '?' ? 3 : 5).map((c) => face(c.name, 36)).join('')}${t.doing === '?' ? '<span class="face face--blank" style="width:36px;height:36px"></span><span class="small muted">and others</span>' : ''}</div>
  ${story ? `<div class="story"><span class="pips">${[0, 1, 2].map((i) => `<i class="${i < story.at ? 'on' : ''}"></i>`).join('')}</span><span class="story__word">${esc(story.word)}</span><span class="small">${esc(story.line)}</span></div>` : ''}
</div>`;

const tierGroup = (id, label) => {
  const here = tongs.filter((t) => t.tier === id);
  if (!here.length) return '';
  return `<h2 class="sec">${esc(label)} tongs</h2>${here.map((t) => houseCard(t,
    t.name === 'Cleaver Fist' ? { at: 2, word: 'Selling', line: 'Letting names go, and not by choice.' }
      : t.name === 'BL Partners' ? { at: 1, word: 'Rising', line: 'A District tong now, and acting like it.' } : null)).join('')}`;
};

const screen1 = `<div class="phone"><div class="panel">
  <div class="head"><h1>City</h1><span class="kicker">Lantern Bay tonight</span><span class="bookbtn">Book</span></div>
  <div class="tabs"><span>Map</span><span>Districts</span><span class="on">Tongs</span></div>
  <div class="slatecard"><span class="slatecard__s">S</span><div><span class="house__name">The Anchor's slate · this month</span>
    <span class="small">One of ours is up. Three names we know better than the chalk does.</span></div><span class="go">›</span></div>
  <h2 class="sec">Where everyone stands</h2>
  <div class="ladder">${rungs}</div>
  <h2 class="sec">Come and gone</h2>
  <div class="moves">${moves}</div>
  ${tierGroup('district', 'District')}${tierGroup('street', 'Street')}
</div></div>`;

// --- Screen 2: a house file ---
const cf = tongByName['Cleaver Fist'];
const tile = (c, i) => {
  const head = c.id === r.tongs.find((t) => t.id === cf.id).headId;
  const read = ['fresh', 'fading', 'none', 'fresh', 'none', 'fading'][i % 6];
  const unsettled = i === 2;
  return `<div class="tile ${unsettled ? 'tile--unsettled' : ''}">${face(c.name, 64)}
    ${gradeOf[c.name] ? `<b class="grade grade--${gradeOf[c.name]}">${gradeOf[c.name]}</b>` : ''}<i class="read read--${read}"></i>
    <span class="tile__name">${esc(c.name.split(' ')[0])}</span><span class="tile__role">${head ? 'Head' : esc(c.role)}</span>
    ${unsettled ? '<span class="tile__flag">Unsettled</span>' : ''}</div>`;
};
const screen2 = `<div class="phone"><div class="panel" style="--tong:${COLOUR[cf.style]}">
  <span class="back">‹ Tongs</span>
  <div class="filehead">${seal(cf, 'seal--xl')}<div><h1 class="filename">${esc(cf.name)}</h1>
    <span class="small muted">A District tong · ${esc(NAMES.districts[cf.home])}</span></div></div>
  <div class="chips">${chip('Loud')}${chip('Grinder')}${chip('Selling', 'chip--warn')}${chip('Cold to us', 'chip--cold')}</div>
  <p class="small">Signs them young and cheap, and keeps the ones who last.</p>
  <h2 class="sec">Their story</h2>
  <ol class="track">
    <li class="on"><b>This week</b><span>Letting names go, and not by choice.</span></li>
    <li class="on"><b>Three weeks back</b><span>Spending like a bigger tong than it is.</span></li>
    <li class="next"><b>Next</b><span>It steadies, or it breaks.</span></li>
    <li class="old"><b>In the spring</b><span>Grew a hall. People noticed.</span></li>
  </ol>
  <h2 class="sec">The table</h2>
  <div class="tiles">${cf.cards.map(tile).join('')}</div>
  <p class="legend"><i class="read read--fresh"></i> watched this month <i class="read read--fading"></i> fading <i class="read read--none"></i> never watched</p>
  <h2 class="sec">Works in</h2>
  <div class="chips">${chip('Old Town', 'chip--place')}${chip('The Docks', 'chip--place')}</div>
  <h2 class="sec">Between us</h2>
  <p class="small"><b class="cold">Cold.</b> We took Marisol off them, and a job they wanted. They ask more for their people, and they want the work we want in the Docks. It fades if we leave them be.</p>
  <span class="btn">Watch this house · 3 days</span>
  <p class="small muted">What we know is from last season.</p>
</div></div>`;

// --- Screen 3: the slate ---
const MOVE = { up: '<i class="mv mv--up">▲</i>', down: '<i class="mv mv--down">▼</i>', new: '<i class="mv mv--new">NEW</i>', back: '<i class="mv mv--new">BACK</i>', steady: '' };
const MARK = { 'Dewi Rahman': 'Flattered', 'Sunita Thapa': 'Sold short', 'Ken Ma': 'Sold short' };
const slateTile = (e, i, g) => {
  const ours = g === 'B' && i === 0;
  const name = ours ? 'Wren' : e.name.split(' ')[0];
  return `<div class="stile ${ours ? 'stile--ours' : ''}">${face(e.name, 52)}${ours ? seal('ours', 'seal--xs') : seal(tongByName[e.tong], 'seal--xs')}${ours ? MOVE.up : MOVE[e.move] ?? ''}
    <span class="tile__name">${esc(name)}</span>${MARK[e.name] && !ours ? `<span class="stile__mark">${MARK[e.name]}</span>` : ''}</div>`;
};
const bands = book.groups.map((g) => `<div class="band band--${g.grade}"><span class="band__letter">${g.grade}</span><div class="band__names">${g.entries.map((e, i) => slateTile(e, i, g.grade)).join('')}</div></div>`).join('');
const screen3 = `<div class="phone"><div class="panel">
  <span class="back">‹ Tongs</span>
  <h1 class="filename">The Anchor's Book</h1>
  <p class="small muted">The elders' opinion, chalked once a month. It flatters some and misses others. Watching is how you know.</p>
  <div class="filters"><span class="on">All</span><span>Ours</span><span>Free</span>${tongs.slice(0, 3).map((t) => seal(t, 'seal--sm')).join('')}</div>
  <div class="slate">${bands}</div>
  <p class="small"><b class="know">Three names here we know better than the Anchor does.</b></p>
  <h2 class="sec">Ones to watch</h2>
  <div class="watch">${book.watch.map((n) => `<div class="watchrow">${face(n.name, 48)}<div class="house__what"><span class="house__name">${esc(n.name)}</span><span class="small muted">${esc(n.tong ?? 'Between tongs')} · never watched</span></div><span class="btn btn--sm">Scout ›</span></div>`).join('')}</div>
</div></div>`;

const css = `
@font-face{font-family:Rajdhani;font-weight:500;src:url(data:font/woff2;base64,${font(500)})}
@font-face{font-family:Rajdhani;font-weight:600;src:url(data:font/woff2;base64,${font(600)})}
@font-face{font-family:Rajdhani;font-weight:700;src:url(data:font/woff2;base64,${font(700)})}
:root{--bg:#0a0c0f;--panel:#12151b;--panel-2:#161a21;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--accent:#ff3d5f;--cyan:#3de8d8;--warn:#f2d541;--green:#5fe0a5;--d:Rajdhani,'Arial Narrow',sans-serif}
*{box-sizing:border-box}body{margin:0;padding:24px;background:var(--bg);color:var(--text);font:15px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;
 background-image:linear-gradient(rgba(61,232,216,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(61,232,216,.025) 1px,transparent 1px);background-size:32px 32px}
.note{max-width:1240px;margin:0 auto 20px;color:var(--muted)}.note h1{font:700 1.5rem var(--d);letter-spacing:.08em;text-transform:uppercase;color:var(--text);margin:0 0 6px}
.row{display:flex;flex-wrap:wrap;gap:28px;justify-content:center;align-items:flex-start}
.col h3{font:700 .85rem var(--d);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
.phone{width:390px;padding:16px}
.panel{position:relative;padding:18px 16px 22px;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line);clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.panel::before{content:'';position:absolute;left:0;top:0;width:36px;height:2px;background:var(--cyan)}
h1,h2{margin:0}.head{display:flex;align-items:baseline;gap:8px}.head h1{font:700 1.6rem var(--d);letter-spacing:.06em;text-transform:uppercase}
.kicker{font:600 .78rem var(--d);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);flex:1}
.bookbtn{font:700 .78rem var(--d);letter-spacing:.14em;text-transform:uppercase;color:var(--warn);border:1px solid var(--warn);padding:5px 9px}
.tabs{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line);margin:12px 0 14px}
.tabs span{font:600 .85rem var(--d);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-align:center;padding:12px 0}
.tabs .on{color:var(--cyan);box-shadow:inset 0 -2px var(--cyan)}
.sec{display:flex;align-items:center;gap:10px;font:700 .82rem var(--d);letter-spacing:.2em;text-transform:uppercase;color:var(--cyan);margin:18px 0 8px}
.sec::after{content:'';flex:1;height:1px;background:var(--line)}
.small{font-size:.84rem;display:block}.muted{color:var(--muted)}p.small{margin:6px 0}
.go{color:var(--cyan);font:700 1.2rem var(--d)}
.back{color:var(--cyan);font-size:.9rem;display:block;margin-bottom:12px}
.face{flex:none;display:inline-block;line-height:0;background:#0d1016;box-shadow:inset 0 0 0 1px var(--line);clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)}
.face svg{display:block;width:100%;height:100%}.face--blank{background:repeating-linear-gradient(135deg,#161a21 0 4px,#0d1016 4px 8px)}
/* The seal: a house's face everywhere. */
.seal{flex:none;display:inline-grid;place-items:center;width:34px;height:34px;font:700 .82rem var(--d);letter-spacing:.04em;color:var(--tong);border:1.5px solid var(--tong);background:color-mix(in srgb,var(--tong) 12%,#0d1016);clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))}
.seal--ours{--tong:var(--cyan);background:var(--cyan);color:#06211f}
.seal--free{--tong:var(--green);border-style:dashed;background:none}.seal--free::after{content:'';width:6px;height:6px;background:var(--green);border-radius:50%}
.seal--sm{width:24px;height:24px;font-size:.62rem;clip-path:polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))}
.seal--xs{position:absolute;right:-5px;top:-5px;width:20px;height:20px;font-size:.55rem;clip-path:none;border-width:1px}
.seal--lg{width:44px;height:44px;font-size:1rem}.seal--xl{width:60px;height:60px;font-size:1.4rem;border-width:2px}
/* The ladder */
.ladder{border:1px solid var(--line);background:#0d1016}
.rung{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 10px;border-bottom:1px solid var(--line);position:relative}
.rung:last-child{border-bottom:0}.rung::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--line)}
.rung--ours{background:linear-gradient(90deg,rgba(61,232,216,.09),transparent 70%)}.rung--ours::before{background:var(--cyan)}
.rung__name{width:84px;font:700 .8rem var(--d);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}.rung--ours .rung__name{color:var(--text)}
.rung__seals{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.rung__none{font-size:.78rem;color:#4b5364;font-style:italic}
.sealwrap{position:relative;display:inline-flex;align-items:center;gap:5px}
.ourtag{font:700 .68rem var(--d);letter-spacing:.14em;text-transform:uppercase;color:var(--cyan)}
.mv{font-style:normal;font:700 .62rem var(--d);letter-spacing:.06em}.mv--up{color:var(--green)}.mv--down{color:var(--accent)}.mv--new{color:var(--warn)}
.sealwrap .mv{position:absolute;right:-7px;top:-7px}
/* Come and gone */
.moves{display:flex;gap:8px;overflow:hidden}
.move{flex:none;width:82px;display:grid;justify-items:center;gap:3px;padding:8px 4px;background:var(--panel-2);border:1px solid var(--line);clip-path:polygon(0 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%)}
.move__who{font:700 .78rem var(--d);letter-spacing:.08em;text-transform:uppercase}.move__path{display:flex;align-items:center;gap:4px}.move__path i{color:var(--muted);font-style:normal}
.move__note{font-size:.68rem;color:var(--muted)}
/* House cards */
.house{position:relative;margin-bottom:8px;padding:10px 12px;background:var(--panel-2);border:1px solid var(--line);clip-path:polygon(0 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%)}
.house::before{content:'';position:absolute;left:-1px;top:-1px;width:16px;height:2px;background:var(--tong)}
.house__top{display:flex;align-items:center;gap:10px}.house__what{flex:1;min-width:0;display:grid;gap:1px}
.house__name{font:700 .95rem var(--d);letter-spacing:.1em;text-transform:uppercase}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}
.chip{font:600 .72rem var(--d);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);padding:2px 7px}
.chip--warn{color:var(--warn);border-color:var(--warn)}.chip--good{color:var(--green);border-color:color-mix(in srgb,var(--green) 55%,transparent)}
.chip--cold{color:#8fb7ff;border-color:#4a6aa8}.chip--unknown{border-style:dashed}.chip--place{color:var(--text)}
.faces{display:flex;align-items:center;gap:5px}
.story{display:grid;grid-template-columns:auto auto 1fr;align-items:center;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid var(--line)}
.pips{display:flex;gap:2px}.pips i{width:9px;height:8px;background:#2a303b}.pips i.on{background:var(--warn)}
.story__word{font:700 .72rem var(--d);letter-spacing:.14em;text-transform:uppercase;color:var(--warn)}
.slatecard{display:flex;align-items:center;gap:12px;padding:10px 12px;background:#101216;border:1px solid #3a3f2a;clip-path:polygon(0 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%)}
.slatecard__s{font:700 2rem/1 var(--d);color:var(--warn);width:34px;text-align:center}.slatecard>div{flex:1;display:grid;gap:2px}
/* House file */
.filehead{display:flex;gap:12px;align-items:center}.filename{font:700 1.5rem/1.1 var(--d);letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}
.track{list-style:none;margin:0;padding:0 0 0 6px}
.track li{position:relative;padding:0 0 10px 18px;border-left:2px solid var(--line);display:grid;gap:1px;font-size:.84rem}
.track li::before{content:'';position:absolute;left:-6px;top:3px;width:10px;height:10px;background:var(--panel);border:2px solid var(--line)}
.track li b{font:700 .7rem var(--d);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.track .on{border-left-color:var(--warn)}.track .on::before{background:var(--warn);border-color:var(--warn)}.track .on b{color:var(--warn)}
.track .next{border-left-style:dashed;color:var(--muted)}.track .next::before{border-style:dashed}.track .old{color:var(--muted);border-left-color:transparent}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.tile{position:relative;display:grid;justify-items:center;gap:1px;padding:6px 2px 6px;background:var(--panel-2);border:1px solid var(--line);min-height:44px}
.tile--unsettled{border-color:var(--warn)}
.tile__name{font:700 .78rem var(--d);letter-spacing:.08em;text-transform:uppercase}.tile__role{font-size:.66rem;color:var(--muted);text-transform:capitalize}
.tile__flag{white-space:nowrap;font:700 .6rem var(--d);letter-spacing:.1em;text-transform:uppercase;color:var(--warn)}
.grade{position:absolute;left:3px;top:2px;font:700 .95rem var(--d)}.grade--S{color:var(--warn)}.grade--A{color:var(--cyan)}.grade--B{color:var(--text)}.grade--C,.grade--D{color:var(--muted)}
.read{position:absolute;right:4px;top:5px;width:8px;height:8px;border:1.5px solid var(--cyan)}.read--fresh{background:var(--cyan)}.read--fading{background:linear-gradient(135deg,var(--cyan) 50%,transparent 50%)}.read--none{border-color:#4b5364}
.legend{font-size:.72rem;color:var(--muted);display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:8px 0 0}.legend .read{position:static;display:inline-block;margin-left:6px}
.cold{color:#8fb7ff}.know{color:var(--cyan);font-weight:600}
.btn{display:block;text-align:center;margin-top:14px;padding:13px;font:700 .9rem var(--d);letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);border:1px solid var(--cyan);clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)}
.btn--sm{margin:0;padding:10px 12px;font-size:.76rem}
/* The slate */
.filters{display:flex;align-items:center;gap:6px;margin:12px 0}
.filters span:not(.seal){font:600 .76rem var(--d);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);padding:6px 10px}
.filters .on{color:#06211f!important;background:var(--cyan);border-color:var(--cyan)!important}
.slate{background:#0e1012;border:1px solid #33372c;box-shadow:inset 0 0 40px rgba(0,0,0,.5)}
.band{display:grid;grid-template-columns:44px 1fr;border-bottom:1px dashed #33372c}.band:last-child{border-bottom:0}
.band__letter{display:grid;place-items:center;font:700 2rem var(--d);color:var(--bandc);border-right:1px dashed #33372c;text-shadow:0 0 12px color-mix(in srgb,var(--bandc) 40%,transparent)}
.band--S{--bandc:var(--warn)}.band--A{--bandc:var(--cyan)}.band--B{--bandc:#e9ecf1}.band--C{--bandc:#8a93a6}.band--D{--bandc:#5a6272}
.band__names{display:flex;flex-wrap:wrap;gap:10px 8px;padding:10px 8px}
.stile{position:relative;width:60px;display:grid;justify-items:center;gap:2px}
.stile .mv{position:absolute;left:-2px;top:-4px;background:#0e1012;padding:0 2px}
.stile--ours .face{box-shadow:0 0 0 2px var(--cyan)}.stile--ours .tile__name{color:var(--cyan)}
.stile__mark{white-space:nowrap;font:700 .58rem var(--d);letter-spacing:.08em;text-transform:uppercase;color:var(--cyan);border:1px solid var(--cyan);padding:0 3px}
.watchrow{display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:6px;background:var(--panel-2);border:1px solid var(--line)}
`;

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The other tongs, deeper: screens (mock-up)</title><style>${css}</style></head><body>
<div class="note"><h1>The other tongs, deeper: screens</h1>
<p>Mock-up for <code>drafts/PROPOSAL-tong-depth.md</code> section 6, at phone width. Tongs, names, tiers, grades and faces are the game's own (seed 1234, week 20). Habits, how a house is doing, how it looks at us, read marks and moves are invented here: those rules are not built. No digits about a rival anywhere.</p></div>
<div class="row">
<div class="col"><h3>1 · City › Tongs: the ladder, come and gone, house cards</h3>${screen1}</div>
<div class="col"><h3>2 · A house file</h3>${screen2}</div>
<div class="col"><h3>3 · The Anchor's slate</h3>${screen3}</div>
</div></body></html>`;
writeFileSync(new URL('./tongs-depth.html', import.meta.url), html);
console.log('wrote tongs-depth.html', Math.round(html.length / 1024) + ' KB');
