// Landmarks on the City map (command centre, part 2, 2026-11-05; owner: "the quality of the face
// portraits is what I'm looking for"): one small illustration per district, drawn like the
// portraits and the district pictures (ui/districtArt.js): flat colour planes, hard light from the
// right in the district gang's colour, a navy shadow on the left, no outlines, lit windows and neon.
// Each is drawn in a 48 x 44 box standing on its bottom edge; the map scales and places it.
// Locked districts get a muted silhouette (lights off, no neon) until they open. Pure strings.

import { mix } from './art.js';

const SHADOW = '#1b2340';
const f = (n) => (Math.round(n * 10) / 10).toString();
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${extra}/>`;
const poly = (pts, fill, extra = '') => `<path d="M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z" fill="${fill}" ${extra}/>`;

/** Lit and shaded tones of a colour, for one light. */
const tones = (light) => ({ lt: (c, t = 0.45) => mix(c, light, t), dk: (c, t = 0.45) => mix(c, SHADOW, t) });

/** A pool of the gang's light on the ground under a landmark. */
const pool = (id, light, cx = 26, w = 26) => `<radialGradient id="${id}-pool"><stop offset="0" stop-color="${light}" stop-opacity="0.45" /><stop offset="1" stop-color="${light}" stop-opacity="0" /></radialGradient><ellipse cx="${cx}" cy="43" rx="${w}" ry="5" fill="url(#${id}-pool)" />`;
const glow = (id, col) => `<radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity="0.6" /><stop offset="1" stop-color="${col}" stop-opacity="0" /></radialGradient>`;

/** A row of windows, lit or dark by a fixed pattern (the same every time). */
function windows(x, y, cols, rows, gw, gh, ww, wh, lit, pattern) {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const on = pattern[(r * cols + c) % pattern.length] === '1';
    s += rect(x + c * gw, y + r * gh, ww, wh, on ? lit : '#0c0f15', on ? 'opacity="0.9"' : '');
  }
  return s;
}

// --- the Docks · Red Lantern red: a gantry crane over the stacks, container 409 ------------------
function docks(id, light) {
  const { lt, dk } = tones(light);
  let s = pool(id, light, 26, 28) + `<defs>${glow(`${id}-lamp`, '#f2b544')}</defs>`;
  // The crane: two legs, the boom reaching left, the cab, neon strip along the boom.
  s += poly([[30, 44], [32, 10], [35, 10], [34, 44]], dk('#3a2a30', 0.3)) + poly([[40, 44], [39, 10], [42, 10], [44, 44]], lt('#3a2a30', 0.5));
  s += rect(6, 8, 42, 3.4, '#3a2a30') + rect(6, 8, 42, 1.2, lt('#3a2a30', 0.7));
  s += rect(6, 11.4, 42, 0.9, light, 'opacity="0.9"');
  s += poly([[33, 8], [38, 1], [40, 1], [42, 8]], '#3a2a30') + poly([[38, 1], [40, 1], [42, 8], [40, 8]], lt('#3a2a30', 0.6));
  s += rect(32, 12, 9, 6, '#262a35') + rect(38, 12, 3, 6, lt('#262a35', 0.5)) + rect(33, 13.5, 4, 2.4, '#f2b544', 'opacity="0.85"');
  s += `<path d="M14 11.4V20" stroke="#8a93a6" stroke-width="0.5" />` + rect(11, 20, 6, 3, '#2f3442');
  s += `<circle cx="7" cy="9.5" r="1.1" fill="${light}" /><circle cx="7" cy="9.5" r="3.5" fill="${light}" opacity="0.25" />`;
  // The stacks: rust, teal and navy boxes with ribs, lit faces on the right; one is 409.
  const box = (x, y, w, c, label = '') => {
    let o = rect(x, y, w, 7, c) + rect(x + w - 2.4, y, 2.4, 7, lt(c, 0.5)) + rect(x, y, w, 0.9, lt(c, 0.35));
    for (let k = x + 2; k < x + w - 3; k += 2.4) o += rect(k, y + 1.4, 0.6, 4.8, dk(c, 0.35));
    if (label) o += `<text x="${f(x + w / 2 - 1)}" y="${f(y + 5.2)}" font-size="3.6" font-weight="700" fill="#e9ecf1" opacity="0.85" text-anchor="middle" font-family="Rajdhani, sans-serif">${label}</text>`;
    return o;
  };
  s += box(2, 37, 16, '#6b2a2a') + box(19, 37, 15, '#1f4a4f') + box(35, 37, 13, '#25304a');
  s += box(5, 30, 15, '#2a3a5a') + box(21, 30, 16, '#7a3a24', '409') + box(38, 30, 9, '#4a2030');
  s += box(12, 23, 14, '#1f4a4f');
  // A sodium lamp on a pole by the stacks.
  s += rect(1, 18, 0.9, 19, '#2b3038') + rect(0, 17, 4, 1.4, '#2b3038') + `<circle cx="2.4" cy="19" r="6" fill="url(#${id}-lamp)" /><circle cx="2.4" cy="18.6" r="0.9" fill="#f2b544" />`;
  return s;
}

// --- Old Town · Brass Anchor sodium: a tenement with caged balconies, the shrine's red glow ------
function oldTown(id, light) {
  const { lt, dk } = tones(light);
  let s = pool(id, light, 24, 26) + `<defs>${glow(`${id}-incense`, '#ff3d5f')}</defs>`;
  // The tenement: damp concrete, a rust stain, the lit edge on the right.
  const c = '#2b2a2e';
  s += rect(8, 6, 26, 38, c) + rect(31, 6, 3, 38, lt(c, 0.5)) + rect(8, 6, 26, 1.2, lt(c, 0.4)) + rect(8, 6, 3, 38, dk(c, 0.35));
  s += windows(11, 9, 4, 6, 5.6, 5.6, 3, 2.6, light, '100101101100100110010011');
  // Caged balconies on two floors, laundry on a line, an air-con box dripping.
  for (const by of [14.8, 26]) s += `<path d="M7 ${by}h28M7 ${by + 3}h28M9 ${by}v3M14 ${by}v3M19 ${by}v3M24 ${by}v3M29 ${by}v3M34 ${by}v3" stroke="#4a4f5c" stroke-width="0.5" />`;
  s += `<path d="M34 12Q40 14 46 12" stroke="#4a4f5c" stroke-width="0.4" fill="none" />` + rect(36, 12.8, 2.4, 3.4, '#ff3d5f', 'opacity="0.8"') + rect(40, 13.4, 2.6, 3, '#3de8d8', 'opacity="0.6"') + rect(43.4, 12.6, 2, 3.6, light, 'opacity="0.7"');
  s += rect(34, 20, 5, 4, '#3a3d47') + rect(37.6, 20, 1.4, 4, lt('#3a3d47', 0.5));
  // The roof: a water tank, an antenna.
  s += rect(12, 2, 7, 4, '#34363d') + rect(17, 2, 2, 4, lt('#34363d', 0.5)) + `<path d="M27 6V0.5M25 2h4" stroke="#4a4f5c" stroke-width="0.5" />`;
  // The shrine of To Dei Gung at the foot: a small red roof, incense glowing, a cup of tea on the step.
  s += `<circle cx="41" cy="38" r="7" fill="url(#${id}-incense)" />`;
  s += poly([[35, 36], [41, 32], [47, 36]], '#7a2028') + poly([[41, 32], [47, 36], [44, 36]], lt('#7a2028', 0.4));
  s += rect(36.5, 36, 9, 7, '#3a1a1e') + rect(38.5, 37.4, 5, 4, '#ff3d5f', 'opacity="0.55"') + `<path d="M40 37.6v-3M41.4 37.6v-3.6M42.8 37.6v-3" stroke="#f2b544" stroke-width="0.4" opacity="0.8" />`;
  s += rect(4, 41, 2.4, 2, '#d8cfae') + rect(4, 40.6, 2.4, 0.5, light);
  return s;
}

// --- the Night Market · Silver Fan violet: a stall under paper lanterns, the wok's fire ----------
function nightMarket(id, light) {
  const { lt, dk } = tones(light);
  let s = pool(id, light, 24, 28) + `<defs>${glow(`${id}-fire`, '#ff9a3d')}${glow(`${id}-lan`, '#ff3d5f')}</defs>`;
  // The block behind: a vertical neon sign with 夜, holo-ad panels.
  const c = '#25213a';
  s += rect(2, 2, 22, 30, c) + rect(21, 2, 3, 30, lt(c, 0.5)) + windows(4, 5, 3, 4, 5.5, 6, 3, 2.4, light, '101011100');
  s += rect(26, 0, 7, 20, '#0e0f14') + `<rect x="26.5" y="0.5" width="6" height="19" fill="none" stroke="#ff5fae" stroke-width="0.6" />` + `<text x="29.5" y="8" font-size="5.6" fill="#ff5fae" text-anchor="middle">夜</text><text x="29.5" y="16" font-size="5.6" fill="#ff5fae" text-anchor="middle">市</text>`;
  s += rect(25, -1, 9, 22, '#ff5fae', 'opacity="0.12"');
  s += rect(35, 6, 12, 8, '#0e0f14') + rect(35.6, 6.6, 10.8, 6.8, light, 'opacity="0.45"') + rect(35.6, 11, 10.8, 2.4, '#3de8d8', 'opacity="0.4"');
  // The stall: a striped awning, the counter, the wok's fire.
  s += poly([[4, 26], [46, 26], [48, 31], [2, 31]], '#3a2a5a');
  for (let k = 0; k < 6; k++) s += poly([[4 + k * 7, 26], [7.5 + k * 7, 26], [8 + k * 7, 31], [4.5 + k * 7, 31]], k % 2 ? lt('#3a2a5a', 0.5) : '#d8cfae', 'opacity="0.9"');
  s += rect(5, 31, 40, 13, '#1c1a26') + rect(42, 31, 3, 13, lt('#1c1a26', 0.5)) + rect(5, 35, 40, 1, dk('#1c1a26', 0.3));
  s += `<circle cx="16" cy="34" r="8" fill="url(#${id}-fire)" />` + `<path d="M12 35Q16 28 20 35Z" fill="#ff9a3d" opacity="0.85" /><path d="M14 35Q16 31 18 35Z" fill="#f7efc8" />`;
  s += rect(26, 33, 14, 2, '#d8cfae', 'opacity="0.5"');
  // Paper lanterns on a string across the front.
  s += `<path d="M2 23Q25 27 48 22" stroke="#4a4f5c" stroke-width="0.4" fill="none" />`;
  for (const [x, y, col] of [[8, 24.4, '#ff3d5f'], [17, 25.6, '#f2b544'], [27, 25.8, '#ff3d5f'], [37, 24.8, light], [45, 23.2, '#ff3d5f']]) {
    s += `<circle cx="${x}" cy="${y + 1.6}" r="3.4" fill="url(#${id}-lan)" opacity="0.7" /><ellipse cx="${x}" cy="${y + 1.6}" rx="1.6" ry="2" fill="${col}" /><rect x="${f(x - 0.9)}" y="${f(y - 0.6)}" width="1.8" height="0.6" fill="#2b3038" />`;
  }
  return s;
}

// --- Glass Heights · Veridian-Apex cyan: the Central Tower's crown, glass towers, a drone ---------
function heights(id, light) {
  const { lt } = tones(light);
  let s = pool(id, light, 24, 30) + `<defs>${glow(`${id}-logo`, light)}</defs>`;
  // Glass towers: curtain walls in a fine cyan grid, a cold lit edge on the right (as the card's picture).
  const tower = (x, w, top, c = '#18222c') => {
    let o = rect(x, top, w, 44 - top, c);
    let grid = '';
    for (let gy = top + 2.4; gy < 44; gy += 2.4) grid += `M${f(x)} ${f(gy)}h${f(w)}`;
    for (let gx = x + 2.4; gx < x + w; gx += 3) grid += `M${f(gx)} ${f(top)}V44`;
    o += `<path d="${grid}" stroke="${light}" stroke-width="0.25" opacity="0.28" />`;
    o += rect(x + w - 1.4, top, 1.4, 44 - top, lt(c, 0.6)) + rect(x, top, w, 0.8, lt(c, 0.75));
    return o;
  };
  s += tower(0, 11, 20, '#1a2028') + tower(36, 12, 14);
  // The Central Tower: the tallest, a stepped crown, the V of the logo glowing, a red light on its mast.
  s += tower(13, 21, 9, '#16212b');
  s += poly([[13, 9], [17, 4], [30, 4], [34, 9]], '#16212b') + poly([[30, 4], [34, 9], [32.6, 9], [29.4, 4.6]], lt('#16212b', 0.6));
  s += `<path d="M23.5 4V0" stroke="${light}" stroke-width="0.4" /><circle cx="23.5" cy="0.4" r="0.7" fill="#ff3d5f" />`;
  s += `<circle cx="23.5" cy="15" r="6" fill="url(#${id}-logo)" /><path d="M20 12.6L23.5 18L27 12.6M21.6 12.6L23.5 15.6L25.4 12.6" stroke="${light}" stroke-width="0.8" fill="none" />`;
  // The Glass-Bridge Promenade: a lit tube from the Central Tower to the next.
  s += rect(34, 24, 3, 2.6, '#1d2a34') + rect(34, 24, 3, 2.6, light, 'opacity="0.35"') + rect(34, 26.2, 3, 0.4, light);
  // A security drone with its scan cone.
  s += `<path d="M42 7.6L38 20L46 20Z" fill="${light}" opacity="0.1" /><ellipse cx="42" cy="6.6" rx="2.6" ry="0.9" fill="#1d2a34" /><rect x="38.4" y="5.8" width="7.2" height="0.5" fill="#2b3640" /><circle cx="42" cy="7.4" r="0.45" fill="#ff3d5f" />`;
  return s;
}

// --- the Basin · Racing Association orange: floodlight towers over the Old Stand, the track ------
function basin(id, light) {
  const { lt, dk } = tones(light);
  let s = pool(id, light, 24, 30) + `<defs><linearGradient id="${id}-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}" stop-opacity="0.35" /><stop offset="1" stop-color="${light}" stop-opacity="0" /></linearGradient></defs>`;
  // The floodlight towers: lattice masts, banks of lamps burning, beams falling on the track.
  for (const x of [6, 40]) {
    s += poly([[x - 1.6, 44], [x - 0.4, 6], [x + 0.6, 6], [x + 1.8, 44]], dk('#2b2a30', 0.3));
    s += `<path d="M${x - 1.2} 36L${x + 1.4} 30M${x - 1} 28L${x + 1.2} 22M${x - 0.8} 20L${x + 1} 14" stroke="#4a4f5c" stroke-width="0.35" />`;
    s += rect(x - 3.4, 3, 7, 3.4, '#22242c') + windows(x - 2.8, 3.6, 3, 2, 2.2, 1.5, 1.6, 1, '#fff2c8', '111111');
    s += poly([[x - 3, 6.4], [x + 3.6, 6.4], [x + (x < 20 ? 14 : -8), 36], [x + (x < 20 ? -2 : -20), 36]], `url(#${id}-beam)`);
  }
  // The Old Stand: a long roof on struts, the crowd as rows of heads, pennants on top.
  const c = '#2d2620';
  s += poly([[8, 22], [40, 20], [40, 23], [8, 25]], '#3a302a') + poly([[30, 20.6], [40, 20], [40, 23], [30, 23.6]], lt('#3a302a', 0.5));
  s += rect(10, 25, 28, 11, c) + rect(35, 25, 3, 11, lt(c, 0.45)) + rect(10, 25, 3, 11, dk(c, 0.3));
  for (let r = 0; r < 3; r++) for (let k = 0; k < 11; k++) s += `<circle cx="${f(12 + k * 2.3 + (r % 2) * 1.1)}" cy="${f(27.6 + r * 2.8)}" r="0.8" fill="${r === 0 ? lt('#5a4a3a', 0.4) : '#4a3d32'}" />`;
  for (const [x, col] of [[12, '#ff3d5f'], [20, '#f2d541'], [28, '#3de8d8'], [36, light]]) s += `<path d="M${x} 21.6V17.6L${x + 2.6} 18.6L${x} 19.6" fill="${col}" stroke="#4a4f5c" stroke-width="0.3" />`;
  // The odds board glowing, and the track's turn in front.
  s += `<path d="M0 42Q24 34 48 42" stroke="#d8cfae" stroke-width="2.2" fill="none" opacity="0.5" /><path d="M0 44Q24 37 48 44" stroke="#2f5a34" stroke-width="2" fill="none" />`;
  s += `<path d="M20 39.4l1.6-1.4l1.6 1.4" stroke="#e9ecf1" stroke-width="0.6" fill="none" opacity="0.8" /><path d="M28 39l1.4-1.2l1.4 1.2" stroke="#ff9a3d" stroke-width="0.6" fill="none" />`;
  return s;
}

// --- locked districts: silhouettes, lights off, until they open ---------------------------------
function ironPeak() {
  let s = poly([[0, 44], [14, 22], [24, 14], [34, 22], [48, 44]], '#1a1d25') + poly([[24, 14], [34, 22], [48, 44], [36, 44], [28, 22]], '#20242e');
  s += rect(17, 16, 14, 7, '#232733') + poly([[16, 16], [24, 11], [32, 16]], '#262a36') + rect(14, 23, 20, 1, '#2a2f3b');
  s += windows(19, 18, 3, 1, 3.6, 0, 2, 1.4, '#3a3f4b', '101');
  s += `<path d="M6 40L22 18" stroke="#2a2f3b" stroke-width="0.6" stroke-dasharray="1 1" />`;
  return s;
}
function amberReach() {
  let s = `<ellipse cx="24" cy="30" rx="18" ry="10" fill="#1d2028" /><path d="M6 30A18 10 0 0 1 42 30" fill="#232733" />`;
  s += rect(4, 30, 40, 14, '#1a1d25') + windows(7, 33, 8, 2, 4.4, 4, 2.4, 1.6, '#3a3f4b', '1010011010');
  s += rect(0, 38, 48, 1.4, '#2a2f3b') + rect(18, 12, 12, 18, '#20242e') + windows(20, 14, 2, 3, 5, 5, 3, 2, '#3a3f4b', '100110');
  return s;
}
function silt() {
  let s = rect(0, 40, 48, 4, '#141820');
  for (const [x, w, h] of [[2, 12, 10], [16, 14, 13], [32, 13, 9]]) {
    s += rect(x, 40 - h - 6, w, h, '#1d2028') + poly([[x - 1, 40 - h - 6], [x + w / 2, 40 - h - 10], [x + w + 1, 40 - h - 6]], '#232733');
    for (const sx of [x + 1, x + w / 2, x + w - 2]) s += rect(sx, 34, 0.8, 8, '#2a2f3b');
    s += rect(x + 3, 40 - h - 3, 2.4, 2, '#3a3f4b');
  }
  s += `<path d="M0 41.4Q6 40.6 12 41.4T24 41.4T36 41.4T48 41.4" stroke="#2a2f3b" stroke-width="0.6" fill="none" />`;
  return s;
}

const DRAW = { docks, oldTown, nightMarket, heights, basin, ironPeak, amberReach, silt };

/**
 * A district's landmark as an SVG group, `size` units wide, its bottom-centre at (x, y). light: the
 * gang's colour (ignored when locked). The same every time.
 */
export function landmark(key, { x, y, size = 40, light = '#3de8d8', locked = false } = {}) {
  const draw = DRAW[key];
  if (!draw) return '';
  const k = size / 48;
  const body = draw(`lm-${key}`, light);
  return `<g class="cm-landmark ${locked ? 'is-locked' : ''}" transform="translate(${f(x - size / 2)} ${f(y - 44 * k)}) scale(${f(k)})">${body}</g>`;
}
