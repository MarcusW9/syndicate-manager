// The furniture pack (2026-11-23, owner: "better variation of the items and furniture ... make them
// cyberpunky ... an asset sort of pack for you to randomly place"). Top-down pieces for inside maps and
// alleys, drawn like the rest of the plan (ui/siteart.js, ui/siteprops.js): flat planes, the city light
// from the right, a hard navy shadow left and down, and only tech and neon glow (ART.md rule 6).
//
// Each piece says how big it is, which rooms it belongs in (`rooms`), whether it would stand as cover
// in a fight (`cover`: not read by any rule yet, owner 2026-11-23: inside maps are visual for now, maybe
// cover later), and how it's drawn at a given box. `furnishRoom` picks and places pieces for a room from
// its kit (`ROOM_KITS`) with a seeded random, never on the keep-clear boxes (the route, the doors).
// Pure strings, no DOM, no game state: decoration only for now. Previewed by
// `node scripts/preview-furniture.mjs <out>` (the catalogue and sample rooms).

const NAVY = '#1b2340';
const LIGHT = '#f2b544';
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const n = (v) => Math.round(v * 10) / 10;

// ---- drawing helpers (map units) ----
const shade = (x, y, w, h, len = 3) => { const d = len * 0.6; return `<polygon points="${n(x + w)},${n(y)} ${n(x + w)},${n(y + h)} ${n(x + w - len)},${n(y + h + d)} ${n(x - len)},${n(y + h + d)} ${n(x - len)},${n(y + d)} ${n(x)},${n(y)}" fill="${NAVY}" opacity="0.8"/>`; };
const box = (x, y, w, h, fill, extra = '') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}"${extra}/>`;
const lit = (x, y, w, h, c = LIGHT, s = 1.2) => box(x + w - s, y, s, h, c, ' opacity="0.35"');
const halo = (x, y, w, h, c, op = 0.16, pad = 2) => box(x - pad, y - pad, w + pad * 2, h + pad * 2, c, ` opacity="${op}"`);
const dot = (x, y, c, r = 0.5) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${c}"/>`;
const pool = (x, y, rx, ry, c, op = 0.14) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${c}" opacity="${op}"/>`;
/** A stable 0..1 from a few numbers (a piece looks the same every time it's drawn at the same place). */
const h01 = (...v) => { const s = Math.sin(v.reduce((a, b, i) => a + b * (12.9898 + i * 7.13), 0)) * 43758.5453; return s - Math.floor(s); };
const pickC = (list, ...v) => list[Math.floor(h01(...v) * list.length)];
const NEON = ['#ff3d5f', '#3de8d8', '#f2d541', '#b48cff', '#ff5fae', '#5fe0a5'];
const CRATE = ['#3a4254', '#4a3644', '#34483f', '#4d4430', '#3d3a52'];
/** Little lights in a row (a rack's LEDs, a panel). */
const leds = (x, y, len, step, c, axis = 'x', seed = 0) => {
  const out = [];
  for (let i = 0; i * step < len; i++) out.push(dot(axis === 'x' ? x + i * step : x, axis === 'x' ? y : y + i * step, h01(seed, i) < 0.25 ? '#ff3d5f' : c, 0.45));
  return out.join('');
};

/** The rooms a piece can be in. Inside maps name their rooms with these. */
export const ROOMS = ['kitchen', 'dining', 'parlour', 'bar', 'office', 'store', 'bedroom', 'lab', 'clinic', 'server', 'garage', 'workshop', 'bathroom', 'hall', 'shrine', 'alley'];

/**
 * The pack: id → { name, w, h, rooms, cover, sides, draw(x, y, w, h) }. `sides`: where it's put in a room
 * (against a wall: n, s, w, e; or anywhere). Sizes are the usual ones; a piece may be drawn bigger.
 * `max`: at most this many in a room (default 2); `turns`: it may turn to run along a side wall (its drawing
 * follows its box); `flat`: it lies on the floor, under the rest.
 */
export const FURNITURE = {
  // ---- seating and tables ----
  mahjong: { name: 'Auto mahjong table', w: 28, h: 28, rooms: ['parlour'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x + 5, y + 5, w - 10, h - 10, 2)}
      ${[[x + w / 2 - 4, y, 8, 4], [x + w / 2 - 4, y + h - 4, 8, 4], [x, y + h / 2 - 4, 4, 8], [x + w - 4, y + h / 2 - 4, 4, 8]].map(([a, b, c, d]) => box(a, b, c, d, '#5a4a6a')).join('')}
      ${box(x + 5, y + 5, w - 10, h - 10, '#244a3a')}${box(x + 7, y + 7, w - 14, h - 14, '#2f5a46')}
      ${box(x + w / 2 - 3, y + h / 2 - 3, 6, 6, '#141922')}${halo(x + w / 2 - 2, y + h / 2 - 2, 4, 4, '#3de8d8', 0.35, 0.6)}
      ${[0, 1, 2, 3].map((i) => box(x + 8 + i * 3, y + 8, 2, 1.4, '#e8e0c8') + box(x + 8 + i * 3, y + h - 9.4, 2, 1.4, '#e8e0c8')).join('')}
      ${lit(x + 5, y + 5, w - 10, h - 10)}` },
  booth: { name: 'Diner booth', w: 32, h: 22, rooms: ['dining', 'bar'], cover: true, sides: ['n', 's'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${box(x, y, w, 5, '#6a3040')}${box(x, y + h - 5, w, 5, '#6a3040')}
      ${box(x + 1, y + 1, w - 2, 1.2, '#8a4052')}${box(x + 4, y + 7, w - 8, h - 14, '#c9c3b0')}${box(x + 4, y + 7, w - 8, 1, '#e8e2d0')}
      ${dot(x + 9, y + h / 2, '#6b7f8f', 1.3)}${dot(x + w - 11, y + h / 2, '#8a6a4a', 1.1)}${lit(x, y, w, h)}` },
  roundTable: { name: 'Café table and stools', w: 22, h: 22, rooms: ['dining', 'bar', 'parlour'], cover: false, sides: ['any'],
    draw: (x, y, w, h) => `<circle cx="${x + w / 2 - 1.5}" cy="${y + h / 2 + 1.2}" r="${w / 4}" fill="${NAVY}" opacity="0.8"/>
      ${[[0, -1], [0, 1], [-1, 0], [1, 0]].map(([a, b]) => `<circle cx="${x + w / 2 + a * w / 2.6}" cy="${y + h / 2 + b * h / 2.6}" r="2.4" fill="#5a4a3a"/>`).join('')}
      <circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 4}" fill="#c9c3b0"/><circle cx="${x + w / 2 + 1}" cy="${y + h / 2}" r="1.6" fill="#f7efc8"/>` },
  barCounter: { name: 'Bar with a neon edge', w: 56, h: 12, rooms: ['bar', 'parlour', 'dining'], cover: true, sides: ['n', 's'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#2a2230')}${box(x, y, w, 3, '#4a3a2c')}
      ${box(x, y + h - 1, w, 1, '#ff5fae')}${halo(x, y + h - 1, w, 1, '#ff5fae', 0.22, 1.5)}
      ${[0.15, 0.3, 0.45, 0.6, 0.75].map((t) => dot(x + w * t, y + 1.5, pickC(['#3de8d8', '#f2d541', '#ff3d5f'], x, t), 0.8)).join('')}${lit(x, y, w, h)}` },
  stools: { name: 'Bar stools', w: 40, h: 6, rooms: ['bar', 'dining', 'kitchen'], cover: false, sides: ['any'],
    draw: (x, y, w) => Array.from({ length: Math.max(2, Math.floor(w / 9)) }, (_, i) => `<circle cx="${x + 3 + i * 9 - 1}" cy="${y + 3 + 0.8}" r="2.6" fill="${NAVY}" opacity="0.7"/><circle cx="${x + 3 + i * 9}" cy="${y + 3}" r="2.6" fill="#6a3040"/><circle cx="${x + 3.6 + i * 9}" cy="${y + 2.6}" r="1" fill="#8a4052"/>`).join('') },
  sofa: { name: 'Patched sofa', w: 30, h: 14, rooms: ['bedroom', 'office', 'hall', 'parlour'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2.5)}${box(x, y, w, h, '#3d3a52')}${box(x, y, w, 4, '#2f2c42')}${box(x, y, 4, h, '#2f2c42')}${box(x + w - 4, y, 4, h, '#2f2c42')}
      ${box(x + 6, y + 6, 7, 5, '#f2d541', ' opacity="0.55"')}${box(x + w / 2, y + 5, 1, 6, '#2f2c42')}${lit(x, y, w, h)}` },
  desk: { name: 'Desk and chair', w: 26, h: 18, rooms: ['office', 'bedroom', 'workshop'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h - 6, 2)}${box(x, y, w, h - 6, '#4a3a2c')}${box(x + 3, y + 2, 9, 5, '#141922')}${box(x + 4, y + 3, 7, 3, '#3de8d8', ' opacity="0.6"')}
      ${box(x + 15, y + 3, 6, 4, '#c9c3b0')}<circle cx="${x + w / 2}" cy="${y + h - 2.5}" r="3" fill="#2a303b"/>${lit(x, y, w, h - 6)}` },

  // ---- sleeping ----
  bunk: { name: 'Bunk bed', w: 20, h: 34, rooms: ['bedroom', 'hall'], cover: true, sides: ['n', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 4)}${box(x, y, w, h, '#2f3442')}${box(x + 1.5, y + 1.5, w - 3, h - 3, '#4a4f62')}
      ${box(x + 3, y + 3, w - 6, 6, '#c9c3b0')}${box(x + 1.5, y + h * 0.55, w - 3, h * 0.45 - 1.5, '#5a3a4a')}
      ${box(x, y, 1.2, h, '#6a7389')}${box(x + w - 1.2, y, 1.2, h, '#6a7389')}${lit(x, y, w, h)}` },
  capsule: { name: 'Sleep capsule', w: 20, h: 36, rooms: ['bedroom', 'hall'], cover: true, sides: ['n', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 4)}${box(x, y, w, h, '#d8dde6')}${box(x + 2, y + 6, w - 4, h - 8, '#1a1f29')}
      ${box(x + 3, y + 7, w - 6, 5, '#c9c3b0')}${box(x + 3, y + 14, w - 6, h - 17, '#2a3a5a')}
      ${box(x + 2, y + 2, w - 4, 2, '#3de8d8')}${halo(x + 2, y + 2, w - 4, 2, '#3de8d8', 0.25, 1.5)}${leds(x + 4, y + 4.8, w - 8, 2.5, '#5fe0a5', 'x', x + y)}${lit(x, y, w, h, LIGHT, 1.5)}` },
  mattress: { name: 'Mattress on the floor', w: 18, h: 30, rooms: ['bedroom', 'store', 'hall'], cover: false, sides: ['n', 's', 'w', 'e', 'any'],
    draw: (x, y, w, h) => `${box(x, y, w, h, '#4a4f62')}${box(x + 2, y + 2, w - 5, 6, '#c9c3b0')}${box(x + 1, y + h * 0.45, w - 2, h * 0.5, '#3a5a4a')}${box(x + w * 0.6, y + h * 0.4, w * 0.4, 3, '#3a5a4a')}` },

  // ---- tech ----
  serverRack: { name: 'Server rack', w: 12, h: 30, max: 4, rooms: ['server', 'office', 'lab'], cover: true, sides: ['w', 'e', 'n'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 6)}${box(x, y, w, h, '#141922')}${box(x + 1, y + 1, w - 2, h - 2, '#1d2430')}
      ${Array.from({ length: Math.floor((h - 2) / 3) }, (_, i) => box(x + 1.5, y + 1.8 + i * 3, w - 3, 2, '#262e3c') + leds(x + 2.5, y + 2.8 + i * 3, w - 6, 1.6, '#5fe0a5', 'x', x * 7 + i)).join('')}
      ${halo(x, y, w, h, '#3de8d8', 0.06, 1.5)}${lit(x, y, w, h, '#3de8d8', 1)}` },
  terminal: { name: 'Terminal with holo screens', w: 30, h: 16, rooms: ['office', 'server', 'lab', 'workshop'], cover: true, sides: ['n', 's'],
    draw: (x, y, w, h) => `${shade(x, y + 4, w, h - 4, 2)}${box(x, y + 4, w, h - 4, '#262c38')}${box(x + 6, y + 8, w - 12, 3, '#1a1f29')}${leds(x + 8, y + 9.5, w - 16, 1.8, '#c9d3e0', 'x', x)}
      ${[0, 1, 2].map((i) => box(x + 2 + i * (w - 4) / 3, y - 2, (w - 4) / 3 - 1.5, 5, '#3de8d8', ' opacity="0.18"') + box(x + 2 + i * (w - 4) / 3, y - 2, (w - 4) / 3 - 1.5, 0.6, '#3de8d8', ' opacity="0.7"')).join('')}
      ${pool(x + w / 2, y + 1, w / 2, 5, '#3de8d8', 0.1)}${lit(x, y + 4, w, h - 4)}` },
  deckBench: { name: 'Cyberdeck workbench', w: 34, h: 14, rooms: ['workshop', 'lab', 'bedroom', 'office'], cover: true, sides: ['n', 's'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${box(x, y, w, h, '#3a3226')}${box(x + 3, y + 3, 11, 7, '#1a1f29')}${box(x + 4, y + 4, 9, 2, '#b48cff', ' opacity="0.7"')}
      ${leds(x + 4, y + 8, 8, 1.4, '#f2d541', 'x', x + 3)}<path d="M${x + 14} ${y + 6} C ${x + 20} ${y + 2}, ${x + 22} ${y + 12}, ${x + 28} ${y + 7}" stroke="#3de8d8" stroke-width="0.5" fill="none"/>
      ${box(x + 24, y + 3, 6, 3, '#5a6272')}${box(x + 18, y + 9, 3, 3, '#c9c3b0')}${dot(x + 31, y + 10, '#ff3d5f', 0.6)}${lit(x, y, w, h)}` },
  arcade: { name: 'Arcade cabinet', w: 10, h: 12, rooms: ['parlour', 'bar', 'dining'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => { const c = pickC(NEON, x, y); return `${shade(x, y, w, h, 4)}${box(x, y, w, h, '#1a1f29')}${box(x + 1, y + h - 5, w - 2, 4, c, ' opacity="0.55"')}${halo(x, y + h - 1, w, 1, c, 0.25, 2)}${dot(x + w / 2 - 2, y + 3.5, '#ff3d5f', 0.9)}${dot(x + w / 2 + 2, y + 3.5, '#f2d541', 0.9)}${lit(x, y, w, h, c, 1)}`; } },
  pachinko: { name: 'Pachinko row', w: 48, h: 10, rooms: ['parlour', 'bar'], cover: true, sides: ['n', 's'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 4)}${Array.from({ length: Math.floor(w / 8) }, (_, i) => box(x + i * 8, y, 7, h, '#20242e') + box(x + i * 8 + 1, y + 1, 5, h - 2, pickC(NEON, x, i), ' opacity="0.45"') + dot(x + i * 8 + 3.5, y + h / 2, '#f7efc8', 0.7)).join('')}
      ${halo(x, y + h, w, 1, '#f2d541', 0.12, 2)}${lit(x, y, w, h)}` },
  droneDock: { name: 'Drone charging dock', w: 16, h: 16, rooms: ['workshop', 'garage', 'server', 'lab', 'store'], cover: false, sides: ['any'],
    draw: (x, y, w, h) => `${box(x, y, w, h, '#1d222c')}<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 - 2}" fill="none" stroke="#3de8d8" stroke-width="0.7" stroke-dasharray="2 1.5"/>
      <circle cx="${x + w / 2 - 2}" cy="${y + h / 2 + 1.4}" r="3" fill="${NAVY}" opacity="0.7"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="3" fill="#4a5266"/><circle cx="${x + w / 2 + 0.8}" cy="${y + h / 2 + 0.6}" r="0.9" fill="#3de8d8"/>` },
  tvStack: { name: 'A stack of old screens', w: 16, h: 12, rooms: ['store', 'workshop', 'bedroom', 'alley', 'parlour'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w / 2, h / 2, '#2a303b')}${box(x + w / 2, y, w / 2, h / 2, '#262c37')}${box(x, y + h / 2, w / 2, h / 2, '#262c37')}${box(x + w / 2, y + h / 2, w / 2, h / 2, '#2a303b')}
      ${box(x + 1, y + 1, w / 2 - 2, h / 2 - 2, '#3de8d8', ' opacity="0.35"')}${box(x + w / 2 + 1, y + h / 2 + 1, w / 2 - 2, h / 2 - 2, '#ff5fae', ' opacity="0.3"')}${box(x + 1, y + h / 2 + 1, w / 2 - 2, h / 2 - 2, '#0a0c10')}${lit(x, y, w, h)}` },
  generator: { name: 'Generator', w: 22, h: 14, max: 1, rooms: ['garage', 'store', 'workshop', 'alley'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#4d4430')}${box(x + 2, y + 2, w - 9, h - 4, '#2a2618')}
      ${Array.from({ length: 4 }, (_, i) => box(x + 3, y + 3 + i * 2.2, w - 11, 0.8, '#5a5038')).join('')}${box(x + w - 6, y + 3, 4, 4, '#f2d541')}${dot(x + w - 4, y + h - 3, '#5fe0a5', 0.7)}${lit(x, y, w, h)}` },
  robotArm: { name: 'Robot arm', w: 18, h: 18, rooms: ['workshop', 'lab', 'garage'], cover: false, sides: ['any'],
    draw: (x, y, w, h) => `<circle cx="${x + 5}" cy="${y + h - 5}" r="4.5" fill="#2a303b"/><circle cx="${x + 5}" cy="${y + h - 5}" r="2" fill="#f2d541"/>
      <path d="M${x + 5} ${y + h - 5} L${x + 11} ${y + 7} L${x + w - 2} ${y + 4}" stroke="#d8dde6" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <path d="M${x + 4} ${y + h - 3} L${x + 10} ${y + 9}" stroke="${NAVY}" stroke-width="2" opacity="0.6" fill="none"/>
      <circle cx="${x + 11}" cy="${y + 7}" r="1.4" fill="#f2d541"/>${dot(x + w - 2, y + 4, '#ff3d5f', 0.9)}` },
  holoTable: { name: 'Holo table', w: 26, h: 18, max: 1, rooms: ['office', 'lab', 'server', 'hall'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${box(x, y, w, h, '#1d222c')}${box(x + 2, y + 2, w - 4, h - 4, '#141922')}
      <polygon points="${x + w / 2},${y + 3} ${x + w - 5},${y + h / 2} ${x + w / 2},${y + h - 3} ${x + 5},${y + h / 2}" fill="none" stroke="#3de8d8" stroke-width="0.6" opacity="0.8"/>
      <circle cx="${x + w / 2}" cy="${y + h / 2}" r="2.5" fill="#3de8d8" opacity="0.5"/>${halo(x + 2, y + 2, w - 4, h - 4, '#3de8d8', 0.1, 3)}${lit(x, y, w, h)}` },

  // ---- kitchen ----
  wok: { name: 'Wok station', w: 34, h: 12, rooms: ['kitchen'], cover: true, sides: ['n', 's'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#5a6272')}${box(x, y, w, 2, '#6a7389')}
      ${[0, 1, 2].map((i) => `<circle cx="${x + 6 + i * 11}" cy="${y + h / 2 + 0.5}" r="3.6" fill="#141922"/><circle cx="${x + 6 + i * 11}" cy="${y + h / 2 + 0.5}" r="3.6" fill="none" stroke="#ff8a3c" stroke-width="0.7" opacity="${i === 1 ? 0.9 : 0.35}"/>`).join('')}
      ${pool(x + 17, y + h / 2, 5, 4, '#ff8a3c', 0.18)}${lit(x, y, w, h)}` },
  fridge: { name: 'Fridge', w: 12, h: 12, rooms: ['kitchen', 'bar', 'store', 'clinic'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 5)}${box(x, y, w, h, '#d8dde6')}${box(x, y + h * 0.4, w, 0.6, '#9aa3b2')}${box(x + w - 2.5, y + 2, 1, 3, '#5a6272')}${dot(x + 2, y + h - 2, '#3de8d8', 0.6)}${lit(x, y, w, h)}` },
  noodleVats: { name: 'Noodle vats', w: 24, h: 10, rooms: ['kitchen'], cover: true, sides: ['n', 's'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${box(x, y, w, h, '#5a6272')}${[0, 1].map((i) => `<circle cx="${x + 6 + i * 12}" cy="${y + h / 2}" r="3.8" fill="#c9b37a"/><circle cx="${x + 6 + i * 12}" cy="${y + h / 2}" r="3.8" fill="none" stroke="#3a4152" stroke-width="0.8"/>`).join('')}
      <polygon points="${x + 4},${y} ${x + 10},${y} ${x + 6},${y - 6} ${x},${y - 5}" fill="#c9d3e0" opacity="0.1"/>${lit(x, y, w, h)}` },
  sink: { name: 'Sink', w: 14, h: 9, rooms: ['kitchen', 'bathroom', 'clinic'], cover: false, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${box(x, y, w, h, '#9aa3b2')}${box(x + 2, y + 2, w - 4, h - 4, '#3a4a5a')}${dot(x + w / 2, y + 1.2, '#d8dde6', 0.8)}${lit(x, y, w, h)}` },
  riceSacks: { name: 'Rice sacks', w: 20, h: 12, rooms: ['kitchen', 'store'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${[[0, 0], [w / 2, 0], [w / 4, h / 2.4]].map(([a, b], i) => `<rect x="${x + a}" y="${y + b}" width="${w / 2 - 0.5}" height="${h / 1.7}" rx="2" fill="${i === 2 ? '#d8cfa8' : '#c9bf96'}"/><rect x="${x + a + 2}" y="${y + b + 2}" width="${w / 4}" height="1.5" fill="#ff3d5f" opacity="0.6"/>`).join('')}` },

  // ---- storage ----
  crate: { name: 'Crate', w: 16, h: 14, rooms: ['store', 'garage', 'workshop', 'alley', 'kitchen', 'hall'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => { const c = pickC(CRATE, x, y); return `${shade(x, y, w, h, 3)}${box(x, y, w, h, c)}${box(x, y + h / 2 - 0.4, w, 0.8, mix(c, '#000000', 0.35))}${box(x + w / 2 - 0.4, y, 0.8, h, mix(c, '#000000', 0.35))}${lit(x, y, w, h)}`; } },
  hazardCrate: { name: 'Hazard crate', w: 18, h: 14, rooms: ['store', 'garage', 'workshop', 'lab'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#3a4254')}${Array.from({ length: Math.floor(w / 4) }, (_, i) => `<polygon points="${x + i * 4},${y} ${x + i * 4 + 2},${y} ${x + i * 4},${y + 3}" fill="#f2d541"/>`).join('')}
      ${box(x, y, w, 3, 'none', ' stroke="#f2d541" stroke-width="0.4"')}<circle cx="${x + w / 2}" cy="${y + h / 2 + 1.5}" r="2.4" fill="none" stroke="#f2d541" stroke-width="0.7"/>${lit(x, y, w, h)}` },
  pallet: { name: 'Pallet of boxes', w: 22, h: 18, rooms: ['store', 'garage', 'alley'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#6a5a3a')}${[[1, 1], [w / 2, 1], [1, h / 2], [w / 2, h / 2]].map(([a, b], i) => box(x + a, y + b, w / 2 - 1.5, h / 2 - 1.5, i % 3 ? '#a08a5a' : '#8a7448')).join('')}
      ${box(x + 3, y + 3, 5, 1.2, '#ff3d5f', ' opacity="0.7"')}<path d="M${x} ${y} L${x + w} ${y + h}" stroke="#d8dde6" stroke-width="0.25" opacity="0.4"/>${lit(x, y, w, h)}` },
  shelving: { name: 'Shelving', w: 40, h: 9, turns: true, rooms: ['store', 'garage', 'workshop', 'kitchen', 'server', 'clinic'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => { const across = w >= h; const len = across ? w : h; const k = Math.max(2, Math.floor(len / 9)); return `${shade(x, y, w, h, 5)}${box(x, y, w, h, '#2a303b')}
      ${Array.from({ length: k }, (_, i) => { const t = 1 + i * (len - 2) / k; const s = (len - 2) / k - 1.2; return across ? box(x + t, y + 1.2, s, h - 2.4, pickC(CRATE, x, i)) : box(x + 1.2, y + t, w - 2.4, s, pickC(CRATE, y, i)); }).join('')}${lit(x, y, w, h)}`; } },
  barrels: { name: 'Drums', w: 18, h: 9, rooms: ['store', 'garage', 'alley', 'workshop'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => Array.from({ length: Math.max(1, Math.floor(w / 9)) }, (_, i) => `<circle cx="${x + 4.5 + i * 9 - 2}" cy="${y + h / 2 + 1.2}" r="4.2" fill="${NAVY}" opacity="0.8"/><circle cx="${x + 4.5 + i * 9}" cy="${y + h / 2}" r="4.2" fill="${pickC(['#7a3030', '#2f4a5a', '#4d4430'], x, i)}"/><circle cx="${x + 4.5 + i * 9}" cy="${y + h / 2}" r="2.6" fill="none" stroke="#000" stroke-width="0.4" opacity="0.4"/><circle cx="${x + 6 + i * 9}" cy="${y + h / 2 - 1.5}" r="0.6" fill="#c9c3b0"/>`).join('') },
  gunLocker: { name: 'Gun locker', w: 14, h: 8, rooms: ['store', 'hall', 'office', 'garage'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 5)}${box(x, y, w, h, '#262c37')}${box(x + w / 2 - 0.3, y, 0.6, h, '#141922')}${box(x + 1.5, y + h - 2, w - 3, 0.8, '#ff3d5f')}${halo(x, y + h - 1, w, 1, '#ff3d5f', 0.2, 1.5)}${dot(x + w / 2 + 1.4, y + 3, '#5fe0a5', 0.5)}${lit(x, y, w, h)}` },
  safe: { name: 'Safe', w: 10, h: 10, max: 1, rooms: ['office', 'store', 'bedroom'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#3a4152')}${box(x + 1, y + 1, w - 2, h - 2, '#2a303b')}<circle cx="${x + w / 2}" cy="${y + h / 2}" r="2" fill="none" stroke="#9aa3b2" stroke-width="0.6"/>${box(x + w - 3, y + 2, 1.4, 1, '#3de8d8')}${lit(x, y, w, h)}` },

  // ---- the body shop ----
  ripperChair: { name: 'Ripperdoc chair', w: 16, h: 30, max: 1, rooms: ['clinic', 'lab'], cover: false, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${box(x + 2, y + 2, w - 4, h - 4, '#c9c3b0')}${box(x + 4, y + 4, w - 8, 6, '#9aa3b2')}
      ${box(x, y + 12, 2.4, 7, '#5a6272')}${box(x + w - 2.4, y + 12, 2.4, 7, '#5a6272')}${pool(x + w / 2, y + h / 2, w * 0.9, h * 0.55, '#f7efc8', 0.12)}
      <circle cx="${x + w / 2}" cy="${y + 7}" r="3" fill="#f7efc8" opacity="0.6"/>${dot(x + w - 1, y + 3, '#3de8d8', 0.7)}` },
  vat: { name: 'Grow vat', w: 14, h: 14, rooms: ['clinic', 'lab'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `<circle cx="${x + w / 2 - 2}" cy="${y + h / 2 + 1.5}" r="${w / 2}" fill="${NAVY}" opacity="0.8"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2}" fill="#2a3a3a"/>
      <circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 - 1.6}" fill="#5fe0a5" opacity="0.55"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 + 2}" fill="#5fe0a5" opacity="0.12"/>
      ${dot(x + w / 2 - 1.5, y + h / 2 - 1, '#d8ffe8', 0.6)}${dot(x + w / 2 + 2, y + h / 2 + 1.5, '#d8ffe8', 0.4)}` },
  limbRack: { name: 'Rack of cyber limbs', w: 30, h: 8, rooms: ['clinic', 'workshop', 'lab'], cover: true, sides: ['n', 's'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#262c37')}${Array.from({ length: Math.floor(w / 6) }, (_, i) => `<rect x="${x + 1.5 + i * 6}" y="${y + 1}" width="3" height="${h - 2}" rx="1.4" fill="${i % 2 ? '#d8dde6' : '#9aa3b2'}"/>${dot(x + 3 + i * 6, y + 2, '#3de8d8', 0.4)}`).join('')}${lit(x, y, w, h)}` },
  ivStand: { name: 'Drip and monitor', w: 8, h: 8, rooms: ['clinic', 'bedroom'], cover: false, sides: ['any'],
    draw: (x, y, w, h) => `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 - 0.5}" fill="#3a4152"/><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h / 2 - 1}" fill="#141922"/>
      <path d="M${x + 1.5} ${y + h / 4 + 0.5} l1.2 0 l0.8 -1.5 l0.8 2.5 l0.8 -1 l1 0" stroke="#5fe0a5" stroke-width="0.4" fill="none"/>` },

  // ---- the home and the shrine ----
  shrine: { name: 'Shrine', w: 14, h: 8, max: 1, rooms: ['shrine', 'dining', 'parlour', 'hall', 'bedroom', 'kitchen', 'store'], cover: false, sides: ['n', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${box(x, y, w, h, '#7a2030')}${box(x + 1, y + 1, w - 2, 2, '#c9a04a')}${dot(x + 3.5, y + 5.5, '#f2d541', 0.9)}${dot(x + w - 3.5, y + 5.5, '#f2d541', 0.9)}${box(x + w / 2 - 1, y + 4, 2, 3, '#e8e0c8')}
      ${pool(x + w / 2, y + h + 1.5, w * 0.5, 2.5, '#ff8a3c', 0.14)}${box(x + 1, y + h - 1.2, w - 2, 0.8, '#ff3d5f')}` },
  aquarium: { name: 'Fish tank', w: 26, h: 8, max: 1, rooms: ['parlour', 'dining', 'office', 'bar'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#1a2a3a')}${box(x + 1, y + 1, w - 2, h - 2, '#2a7aa0', ' opacity="0.55"')}${halo(x, y, w, h, '#3de8d8', 0.12, 2.5)}
      ${dot(x + w * 0.3, y + h / 2, '#ff8a3c', 0.9)}${dot(x + w * 0.65, y + h / 2 + 1, '#f2d541', 0.7)}${dot(x + w * 0.8, y + h / 2 - 1, '#ff8a3c', 0.6)}` },
  plant: { name: 'Potted plant', w: 9, h: 9, rooms: ['office', 'dining', 'parlour', 'bedroom', 'hall', 'bar'], cover: false, sides: ['any'],
    draw: (x, y, w, h) => `<circle cx="${x + w / 2 - 1.5}" cy="${y + h / 2 + 1.2}" r="${w / 2}" fill="${NAVY}" opacity="0.7"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 3}" fill="#6a4a3a"/>
      ${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${x + w / 2 + Math.cos(i * 1.26) * 2.6}" cy="${y + h / 2 + Math.sin(i * 1.26) * 2.6}" rx="2.6" ry="1.4" transform="rotate(${i * 72} ${x + w / 2 + Math.cos(i * 1.26) * 2.6} ${y + h / 2 + Math.sin(i * 1.26) * 2.6})" fill="${i % 2 ? '#2f6a4a' : '#3a7a52'}"/>`).join('')}` },
  rug: { name: 'Rug', w: 30, h: 20, max: 1, rooms: ['bedroom', 'parlour', 'office', 'hall'], cover: false, sides: ['any'], flat: true,
    draw: (x, y, w, h) => { const c = pickC(['#4a2a3a', '#2a3a4a', '#3a3a2a'], x, y); return `${box(x, y, w, h, c, ' opacity="0.7"')}${box(x + 2, y + 2, w - 4, h - 4, 'none', ` stroke="${mix(c, '#f2d541', 0.4)}" stroke-width="0.5" opacity="0.6"`)}<polygon points="${x + w / 2},${y + 4} ${x + w - 6},${y + h / 2} ${x + w / 2},${y + h - 4} ${x + 6},${y + h / 2}" fill="none" stroke="${mix(c, '#ff5fae', 0.4)}" stroke-width="0.5" opacity="0.6"/>`; } },
  washer: { name: 'Washing machines', w: 24, h: 10, rooms: ['bathroom', 'store', 'hall', 'kitchen'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${Array.from({ length: Math.max(1, Math.floor(w / 12)) }, (_, i) => box(x + i * 12, y, 11.4, h, '#d8dde6') + `<circle cx="${x + i * 12 + 5.7}" cy="${y + h / 2 + 0.5}" r="3.2" fill="#3a4a5a"/><circle cx="${x + i * 12 + 5.7}" cy="${y + h / 2 + 0.5}" r="1.8" fill="#5a8ab0" opacity="0.6"/>` + dot(x + i * 12 + 9.5, y + 1.6, '#5fe0a5', 0.45)).join('')}${lit(x, y, w, h)}` },
  toilet: { name: 'Toilet', w: 8, h: 11, max: 1, rooms: ['bathroom'], cover: false, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${box(x, y, w, 3.5, '#c9c3b0')}<ellipse cx="${x + w / 2}" cy="${y + 7}" rx="${w / 2 - 0.5}" ry="3.6" fill="#d8dde6"/><ellipse cx="${x + w / 2}" cy="${y + 7}" rx="${w / 2 - 2}" ry="2.2" fill="#9aa3b2"/>` },
  karaoke: { name: 'Karaoke screen', w: 28, h: 6, max: 1, rooms: ['bar', 'parlour'], cover: false, sides: ['n'],
    draw: (x, y, w, h) => `${box(x, y, w, h, '#141922')}${box(x + 1, y + 1, w - 2, h - 2, '#b48cff', ' opacity="0.5"')}${box(x + 3, y + h / 2 - 0.4, w * 0.55, 0.8, '#f7efc8', ' opacity="0.9"')}${pool(x + w / 2, y + h + 6, w / 2, 7, '#b48cff', 0.12)}` },

  // ---- the street and alleys ----
  dumpster: { name: 'Dumpster', w: 24, h: 12, rooms: ['alley', 'garage'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#2f4a3f')}${box(x, y, w / 2, h, '#34503f')}${box(x + 2, y + h - 2, w - 4, 1, '#f2d541', ' opacity="0.6"')}${box(x + w / 2 - 0.3, y, 0.6, h, '#1d2a24')}${lit(x, y, w, h)}` },
  trashBags: { name: 'Rubbish bags', w: 16, h: 10, rooms: ['alley', 'kitchen', 'store'], cover: false, sides: ['any'],
    draw: (x, y, w, h) => [[3, 4, 3.6], [8, 3, 3.2], [12, 6, 3], [6, 7.5, 2.8]].map(([a, b, r]) => `<circle cx="${x + a - 1}" cy="${y + b + 0.8}" r="${r}" fill="${NAVY}" opacity="0.6"/><circle cx="${x + a}" cy="${y + b}" r="${r}" fill="#1a1d22"/><circle cx="${x + a + r * 0.4}" cy="${y + b - r * 0.4}" r="${r * 0.3}" fill="#3a4152"/>`).join('') },
  acUnit: { name: 'AC unit', w: 12, h: 9, rooms: ['alley'], cover: true, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 2)}${box(x, y, w, h, '#9aa3b2')}<circle cx="${x + w / 2 - 1}" cy="${y + h / 2}" r="3.4" fill="#3a4152"/><path d="M${x + w / 2 - 4} ${y + h / 2}h6M${x + w / 2 - 1} ${y + h / 2 - 3}v6" stroke="#9aa3b2" stroke-width="0.5"/>
      <polygon points="${x},${y + 2} ${x},${y + h - 2} ${x - 5},${y + h} ${x - 6},${y}" fill="#c9d3e0" opacity="0.07"/>${dot(x + w - 1.5, y + 1.5, '#5fe0a5', 0.4)}` },
  noodleCart: { name: 'Noodle cart', w: 24, h: 12, max: 1, rooms: ['alley'], cover: true, sides: ['any'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 3)}${box(x, y, w, h, '#7a2030')}${box(x + 2, y + 2, w - 9, h - 4, '#5a6272')}<circle cx="${x + 7}" cy="${y + h / 2}" r="2.6" fill="#c9b37a"/>
      ${box(x + w - 6, y, 6, h, '#2a303b')}${box(x - 1, y - 2, w + 2, 2, '#f2d541')}${halo(x - 1, y - 2, w + 2, 2, '#f2d541', 0.2, 2)}${dot(x + w - 3, y + h / 2, '#ff3d5f', 0.8)}` },
  scooter: { name: 'Scooter', w: 18, h: 6, rooms: ['alley', 'garage', 'hall'], cover: false, sides: ['any'],
    draw: (x, y, w, h) => `<rect x="${x - 1.5}" y="${y + 1.5}" width="${w}" height="${h - 1}" rx="2.5" fill="${NAVY}" opacity="0.6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="${pickC(['#ff5fae', '#3de8d8', '#f2d541'], x, y)}" opacity="0.85"/>
      ${box(x + 5, y + 1.2, 6, h - 2.4, '#141922')}${box(x + w - 3, y - 1, 1, h + 2, '#9aa3b2')}${dot(x + w - 0.5, y + h / 2, '#f7efc8', 0.6)}` },
  fusebox: { name: 'Fuse box', w: 9, h: 6, rooms: ['alley', 'garage', 'store', 'server', 'hall'], cover: false, sides: ['n', 's', 'w', 'e'],
    draw: (x, y, w, h) => `${shade(x, y, w, h, 1.5)}${box(x, y, w, h, '#262c37')}${box(x + w - 2, y, 2, h, '#323a48')}${leds(x + 1.5, y + 1.6, w - 4, 1.6, '#5fe0a5', 'x', x)}${leds(x + 1.5, y + 3.8, w - 4, 1.6, '#f2b544', 'x', y)}
      <path d="M${x + w / 2} ${y + h} q 2 4 -1 8" stroke="#141922" stroke-width="0.8" fill="none"/>` },
  neonSign: { name: 'Neon sign on the wall', w: 22, h: 4, rooms: ['bar', 'parlour', 'alley', 'dining', 'hall'], cover: false, sides: ['n', 's'],
    draw: (x, y, w, h) => { const c = pickC(NEON, x, y); return `${halo(x, y, w, h, c, 0.22, 2.5)}${box(x, y, w, h, '#141922')}${Array.from({ length: Math.floor((w - 2) / 3) }, (_, i) => box(x + 1 + i * 3, y + 1, 2, h - 2, c, h01(x, i) < 0.15 ? ' opacity="0.25"' : '')).join('')}${pool(x + w / 2, y + h + 5, w / 1.6, 6, c, 0.1)}`; } },
};

/**
 * What a room of each kind holds: `must` pieces first, then `may` picks up to a count that grows with
 * the room's size. Ids from FURNITURE. A room kind not here gets crates and shelving.
 */
export const ROOM_KITS = {
  kitchen: { must: ['wok', 'fridge'], may: ['noodleVats', 'sink', 'riceSacks', 'shelving', 'crate', 'trashBags', 'shrine', 'stools'] },
  dining: { must: ['booth'], may: ['booth', 'roundTable', 'roundTable', 'barCounter', 'aquarium', 'plant', 'shrine', 'arcade', 'neonSign'] },
  parlour: { must: ['mahjong'], may: ['mahjong', 'mahjong', 'roundTable', 'pachinko', 'arcade', 'aquarium', 'shrine', 'sofa', 'neonSign', 'karaoke'] },
  bar: { must: ['barCounter', 'stools'], may: ['booth', 'roundTable', 'arcade', 'karaoke', 'neonSign', 'fridge', 'plant'] },
  office: { must: ['desk'], may: ['desk', 'terminal', 'safe', 'sofa', 'plant', 'holoTable', 'serverRack', 'aquarium', 'gunLocker', 'rug'] },
  store: { must: ['shelving'], may: ['crate', 'crate', 'pallet', 'hazardCrate', 'barrels', 'riceSacks', 'tvStack', 'gunLocker', 'mattress'] },
  bedroom: { must: ['bunk'], may: ['capsule', 'mattress', 'desk', 'sofa', 'tvStack', 'deckBench', 'rug', 'plant', 'safe', 'ivStand', 'shrine'] },
  lab: { must: ['terminal'], may: ['robotArm', 'vat', 'holoTable', 'serverRack', 'hazardCrate', 'limbRack', 'deckBench', 'droneDock'] },
  clinic: { must: ['ripperChair'], may: ['ivStand', 'vat', 'limbRack', 'sink', 'fridge', 'shelving', 'terminal'] },
  server: { must: ['serverRack', 'serverRack'], may: ['serverRack', 'terminal', 'fusebox', 'holoTable', 'droneDock'] },
  garage: { must: ['generator'], may: ['pallet', 'barrels', 'crate', 'robotArm', 'droneDock', 'scooter', 'shelving', 'dumpster', 'hazardCrate'] },
  workshop: { must: ['deckBench'], may: ['robotArm', 'tvStack', 'shelving', 'generator', 'droneDock', 'limbRack', 'crate', 'terminal'] },
  bathroom: { must: ['toilet', 'sink'], may: ['washer', 'shelving'] },
  hall: { must: [], may: ['plant', 'shrine', 'neonSign', 'fusebox', 'scooter', 'crate', 'gunLocker'] },
  shrine: { must: ['shrine'], may: ['plant', 'rug', 'shrine', 'neonSign'] },
  alley: { must: ['dumpster'], may: ['trashBags', 'trashBags', 'acUnit', 'acUnit', 'noodleCart', 'scooter', 'fusebox', 'crate', 'barrels', 'tvStack', 'generator'] },
};

const overlap = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;

/**
 * Furnish a room: rng() 0..1 (seeded by the caller), room { x, y, w, h }, kind a ROOM_KITS key,
 * blocked: boxes to keep clear (the route, the doors). Returns the placed pieces [{ id, x, y, w, h }];
 * a piece that doesn't fit after a few tries is left out. Pieces marked `turns` run along a side wall.
 */
export function furnishRoom(rng, room, kind, blocked = []) {
  const kit = ROOM_KITS[kind] ?? { must: ['shelving'], may: ['crate', 'crate', 'pallet'] };
  const want = Math.min(10, Math.max(3, Math.round((room.w * room.h) / 1500)));
  const ids = [...kit.must];
  const count = (id) => ids.filter((x) => x === id).length;
  for (let tries = 0; ids.length < want && kit.may.length && tries < 60; tries++) {
    const id = kit.may[Math.floor(rng() * kit.may.length)];
    if (count(id) < (FURNITURE[id]?.max ?? 2)) ids.push(id);
  }
  const placed = [];
  for (const id of ids) {
    const f = FURNITURE[id];
    if (!f) continue;
    for (let k = 0; k < 30; k++) {
      const side = f.sides[Math.floor(rng() * f.sides.length)];
      // a long piece against a side wall turns to run along it
      const turn = f.turns && (side === 'w' || side === 'e') && f.w > f.h * 1.5;
      const w = turn ? f.h : f.w, h = turn ? f.w : f.h;
      let x = room.x + 4 + rng() * Math.max(0, room.w - w - 8), y = room.y + 4 + rng() * Math.max(0, room.h - h - 8);
      if (side === 'n') y = room.y + 4; if (side === 's') y = room.y + room.h - h - 4;
      if (side === 'w') x = room.x + 4; if (side === 'e') x = room.x + room.w - w - 4;
      const b = { x: Math.round(x), y: Math.round(y), w, h };
      if (b.x < room.x + 3 || b.y < room.y + 3 || b.x + w > room.x + room.w - 3 || b.y + h > room.y + room.h - 3) continue;
      if (blocked.some((q) => overlap(b, q)) || placed.some((q) => (f.flat || FURNITURE[q.id].flat ? false : overlap(b, q, 3)))) continue;
      placed.push({ id, ...b });
      break;
    }
  }
  // flat pieces (rugs) under the rest
  return placed.sort((a, b) => (FURNITURE[b.id].flat ? 1 : 0) - (FURNITURE[a.id].flat ? 1 : 0));
}

/** One placed piece as SVG. */
export const furnitureSvg = ({ id, x, y, w, h }) => FURNITURE[id]?.draw(x, y, w ?? FURNITURE[id].w, h ?? FURNITURE[id].h) ?? '';

/** Placed pieces as one layer. */
export const furnitureLayer = (pieces) => (pieces.length ? `<g class="sp-furniture">${pieces.map(furnitureSvg).join('')}</g>` : '');
