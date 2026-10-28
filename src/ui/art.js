// Drawn art as SVG strings: Joss's icon and generated portraits. No DOM, no randomness:
// everything comes from a stable hash of the character, so a face never changes and
// nothing is added to the save. Portraits are decorative (aria-hidden); every fact they
// show (injured, tired, neural load) is also written as text.

import { CULTURES } from '../data/recruitPools.js';

// Shared drawing style: one palette, one line weight, everything on a 64×64 grid.
export const ART = {
  line: 2,
  ink: '#0f1115',
  panel: '#1b1f28',
  teal: '#36d6c3',
  pink: '#ff4f7b',
  warn: '#f5b942',
  muted: '#8b93a7',
  // Light to deep. Every culture draws from a wide, overlapping band of these.
  skin: ['#f6d7c3', '#efc3a4', '#e3b08f', '#d49a76', '#c68863', '#b07350', '#9a6142', '#855236', '#6f432b', '#5c3623', '#4a2b1d', '#3b2218'],
  hair: ['#17171b', '#241c19', '#3a291e', '#563820', '#7f5428', '#a37540'],
  hairDyed: ['#ff4f7b', '#36d6c3', '#a78bfa', '#f5b942', '#7dd3fc'],
  grey: '#b9bcc4',
};

const SKIN_BANDS = { hk: [1, 6], filipino: [3, 8], south_asian: [3, 10], african: [6, 11], southeast_asian: [2, 8], european: [0, 5] };
const HAIR_STYLES = ['crop', 'buzz', 'long', 'bob', 'bun', 'curls', 'locs', 'undercut', 'slick', 'fiber', 'bald'];
// Textures lean with culture but every style is possible for everyone.
const HAIR_LEAN = { african: ['curls', 'locs', 'buzz', 'curls'], south_asian: ['long', 'crop'], european: ['crop', 'bob'] };

/** Stable 32-bit hash of a string. */
export function hash(str) {
  let h = 2166136261;
  for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}
/** A stream of stable picks from one seed. */
function picker(seed) {
  let s = seed || 1;
  const next = () => { s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0; s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0; return (s ^ (s >>> 16)) >>> 0; };
  return { int: (n) => next() % n, pick: (xs) => xs[next() % xs.length], chance: (p) => next() % 1000 < p * 1000 };
}

/** Culture from the surname, using the same name lists that generate the crew. */
export function cultureOf(name = '') {
  const last = name.trim().split(/\s+/).slice(1).join(' ');
  return CULTURES.find((c) => c.surnames.includes(last))?.id ?? null;
}

/**
 * The stable features of a face. op: { id, name, age }. Hair, chrome and markings are
 * random but fixed per person; expressions come from condition (stateOf), not from here.
 */
export function faceOf(op) {
  return withGear(baseFace(op), op);
}

function baseFace(op) {
  const r = picker(hash(`${op.id}|${op.name}`));
  const culture = cultureOf(op.name);
  const [lo, hi] = SKIN_BANDS[culture] ?? [0, ART.skin.length - 1];
  const lean = HAIR_LEAN[culture] ?? [];
  const style = r.chance(0.35) && lean.length ? r.pick(lean) : r.pick(HAIR_STYLES);
  const older = (op.age ?? 25) >= 45;
  const hairColor = older && r.chance(0.6) ? ART.grey : r.chance(0.15) ? r.pick(ART.hairDyed) : r.pick(ART.hair);
  const visor = r.chance(0.05); // rare: it hides the eyes, where tiredness shows
  return {
    skin: ART.skin[lo + r.int(hi - lo + 1)],
    shape: r.pick(['oval', 'round', 'square', 'long']),
    hair: style,
    hairColor,
    // Split-dye: one side of the hair in a neon second colour.
    splitDye: style !== 'bald' && r.chance(0.12) ? r.pick(ART.hairDyed.filter((c) => c !== hairColor)) : null,
    // Chrome: a temple port is the cheap street standard; the rest are rarer.
    chrome: ((ch) => (visor && ch === 'cybereye' ? 'port' : ch))(r.pick(['port', 'port', 'port', 'cybereye', 'circuit', 'circuit', 'seam'])), // no lens under a visor
    chromeColor: r.pick(['#3de8d8', '#3de8d8', '#ff3d5f', '#f2b544']),
    circuit: r.pick(['jaw', 'temple', 'nose']),
    marking: r.pick(['none', 'none', 'none', 'tattoo', 'barcode', 'scar', 'cut']),
    glasses: !visor && r.chance(0.12),
    visor,
    stubble: r.chance(0.12),
    earring: r.chance(0.25),
    shirt: r.pick(['#262b36', '#2b2433', '#1f2b2a', '#33291f', '#232838']),
  };
}

// Gear and looks added 2026-10-25: masks, conical hats, half-chrome faces, monks and facial
// hair. They come from a second seed, so adding them left every earlier feature exactly as
// it was; some people simply gained gear on top.
const HEADWEAR = ['jingasa', 'jingasa', 'neonhat', 'douli']; // steel war hat is the common one
const MASKS = ['respirator', 'jawplate', 'grille'];
const FULL_MASKS = ['goggles', 'faceplate'];
const MONK_ROBES = ['grey', 'grey', 'ochre', 'cyber'];
const FACIAL_HAIR = ['pencil', 'goatee', 'goatee', 'droop', 'soul', 'beard'];

function withGear(f, op) {
  const r = picker(hash(`${op.id}|${op.name}|gear`));
  // Order of picks is fixed: new looks go at the end, so these never shift either.
  const monk = r.chance(cultureOf(op.name) === 'hk' ? 0.06 : 0.015) ? r.pick(MONK_ROBES) : null;
  const halfFace = r.chance(0.03);
  const mask = r.chance(0.07) ? r.pick(MASKS) : null;
  const headwear = r.chance(0.07) ? r.pick(HEADWEAR) : null;
  const facialHair = r.chance(0.2) ? r.pick(FACIAL_HAIR) : null;
  const monkHat = r.chance(0.35); // a wandering monk's woven hat
  // Full-cover masks hide the eyes too. That's allowed: every condition is also written as text.
  const fullMask = r.chance(0.03) ? r.pick(FULL_MASKS) : null;
  const g = { ...f, monk, halfFace, mask, headwear, facialHair };
  if (monk) Object.assign(g, { hair: 'bald', splitDye: null, earring: false, facialHair: null, headwear: monkHat ? 'douli' : null });
  // Half the face is chrome: it replaces any other chrome, and the lens takes the lit eye.
  if (halfFace) Object.assign(g, { chrome: 'half', glasses: false, visor: false });
  // A full mask takes the place of any lower-face mask, glasses and visor; a faceplate covers chrome too.
  if (fullMask) Object.assign(g, { mask: fullMask, glasses: false, visor: false });
  return g;
}

// Anatomy (design draft, 2026-10-28): the face itself varies, not just what's around it.
// Eyes, brows, nose, mouth, jaw, ears and neck come from continuous measurements on a third
// seed (`id|name|face`), so hair, chrome and gear keep their picks. Off unless asked for
// (portrait(op, { anatomy: true })) until the owner signs off on the draft sheet.
const LIDS = ['mono', 'crease', 'hooded', 'deep'];
// Lids lean with culture the way hair does; every shape is possible for everyone.
const LID_LEAN = { hk: ['mono', 'mono', 'hooded'], southeast_asian: ['mono', 'hooded'], filipino: ['mono', 'crease'], african: ['crease', 'deep'], south_asian: ['crease', 'deep', 'hooded'], european: ['crease', 'deep', 'hooded'] };

export function anatomyOf(op) {
  const r = picker(hash(`${op.id}|${op.name}|face`));
  const span = (lo, hi) => lo + ((hi - lo) * r.int(1001)) / 1000;
  const lean = LID_LEAN[cultureOf(op.name)] ?? [];
  // Order of picks is fixed: new measurements go at the end.
  return {
    headW: span(-1.3, 1.1),
    jawW: span(-2.2, 1.8),
    chinW: span(-1, 1.6),
    chinY: span(-1.2, 1.8),
    eyeGap: span(4.1, 5.2),    // eye centre from the middle of the face (was 4.6)
    eyeY: span(28.5, 29.6),
    eyeW: span(1.6, 2.6),
    eyeH: span(0.45, 1.4),      // how far the upper lid arcs (was 0.85)
    eyeTilt: span(-0.8, 1),   // outer corners up (+) or down (-)
    lid: r.chance(0.5) && lean.length ? r.pick(lean) : r.pick(LIDS),
    browT: span(0.7, 2.6),
    browArch: span(-0.2, 1.5),
    browY: span(-0.6, 0.5),
    noseTip: span(34.6, 37.3),
    noseW: span(1.1, 2.8),
    bridge: r.pick(['straight', 'straight', 'straight', 'hooked', 'button', 'broad']),
    mouthW: span(1.9, 3.4),
    mouthY: span(39.4, 40.9),
    upper: span(0.15, 1),
    lower: span(0.7, 2.6),
    cheek: r.pick(['low', 'low', 'high', 'soft']),
    ear: span(0.85, 1.2),
    earOut: span(0, 0.8),
    neck: span(3.7, 5.1),
    freckles: r.chance(0.1),
    mole: r.chance(0.12) ? r.pick([[35.8, 37.6], [28.2, 38.6], [30.2, 42.8], [38.4, 33.2], [26, 34], [34.8, 22.5]]) : null,
  };
}

/** The base head shape with this person's jaw, chin and width. */
function reshape(g, a) {
  const w = g.w + a.headW;
  return { w, j: Math.min(w - 1.2, g.j + a.jawW), c: Math.max(2.4, Math.min(6, g.c + a.chinW)), chin: g.chin + a.chinY };
}

/** One eye: lid shape, tilt and expression. side -1 is the shadow-side eye, +1 the lit one. */
function eyeShape(side, a, st, c, id) {
  const cx = 32 + side * a.eyeGap, y = a.eyeY, W = a.eyeW;
  const outer = [cx + side * W, y - a.eyeTilt * 0.6], inner = [cx - side * W, y + a.eyeTilt * 0.2];
  const [p, q] = side < 0 ? [outer, inner] : [inner, outer];
  const mid = (p[1] + q[1]) / 2;
  const tired = st.tired, dead = !tired && st.expression === 'dead', stressed = !tired && st.expression === 'stressed';
  const h = tired ? a.eyeH * 0.3 : dead ? 0.1 : stressed ? a.eyeH * 0.6 : a.eyeH;
  const l = (0.35 + a.eyeH * 0.25) * (stressed ? 0.75 : 1);
  const almond = (hh, ll) => `M${p[0]} ${p[1]} Q${cx} ${mid - 2 * hh} ${q[0]} ${q[1]} Q${cx} ${mid + 2 * ll} ${p[0]} ${p[1]} Z`;
  // Lids and sockets go under the eye; age adds bags.
  let under = '';
  if (a.lid === 'deep') under += `<ellipse cx="${cx}" cy="${y - 0.4}" rx="${W + 1}" ry="${a.eyeH + 1.4}" fill="${c.midShade}" opacity="0.75"/>`;
  if (tired) under += `<path d="M${p[0] - side * 0.2} ${p[1] + 0.6} Q${cx} ${mid + 3.2} ${q[0]} ${q[1] + 0.6} Q${cx} ${mid + 1.6} ${p[0]} ${p[1] + 0.6} Z" fill="${c.shade}"/>`;
  let over = '';
  if (!tired && !dead) {
    if (a.lid === 'crease') over = `<path d="M${p[0] + 0.5} ${p[1] - 0.5} Q${cx} ${mid - 2 * h - 1.6} ${q[0] - 0.5} ${q[1] - 0.5}" stroke="${c.lip}" stroke-width="0.4" fill="none" opacity="0.55"/>`;
    // Hooded: a fold of skin over the outer half of the lid.
    if (a.lid === 'hooded') over = `<path d="M${cx - side * W * 0.5} ${y - h - 0.9} Q${cx + side * W * 0.6} ${y - h - 1.1} ${outer[0] + side * 0.4} ${outer[1] + 0.2} Q${cx + side * W * 0.4} ${y - h * 0.9} ${cx - side * W * 0.5} ${y - h - 0.9} Z" fill="${c.midShade}"/>`;
  }
  const iris = dead ? '#26292f' : '#120d0b';
  // Wide-open eyes show their whites, with the iris looking slightly towards the light.
  const whites = !tired && !dead && h > 0.85;
  let eye = whites
    ? `<clipPath id="${id}e${side}"><path d="${almond(h, l)}"/></clipPath><path d="${almond(h, l)}" fill="${mix('#e8e2d8', c.skin, 0.25)}"/><circle cx="${cx + 0.3}" cy="${y - h * 0.15}" r="${Math.min(W * 0.62, h + l * 0.7)}" fill="${iris}" clip-path="url(#${id}e${side})"/><path d="M${p[0]} ${p[1]} Q${cx} ${mid - 2 * h} ${q[0]} ${q[1]}" stroke="${iris}" stroke-width="0.55" fill="none"/>`
    : `<path d="${almond(h, dead ? 0.55 : l)}" fill="${iris}"/>`;
  if (tired) eye += `<path d="M${p[0] - side * 0.2} ${p[1] - 0.4} Q${cx} ${mid - 1.3} ${q[0]} ${q[1] - 0.4}" stroke="${c.lip}" stroke-width="0.8" fill="none"/>`;
  if (dead) eye = `<path d="M${p[0] - side * 0.4} ${p[1] + 1.2} Q${cx} ${mid + 2.6} ${q[0]} ${q[1] + 1.2} Q${cx} ${mid + 1.8} ${p[0]} ${p[1] + 1.2} Z" fill="${c.midShade}"/>${eye}`;
  if (!tired && !dead) eye += `<circle cx="${cx + 0.55}" cy="${y - h * 0.45}" r="${stressed ? 0.35 : 0.45}" fill="#fff" opacity="${stressed ? 0.7 : 0.85}"/>`;
  return under + eye + over;
}

/** Brows as tapered shapes: thickness, arch and height vary; expression moves the ends. */
function browShape(side, a, st, c) {
  const cx = 32 + side * a.eyeGap;
  const ix = cx - side * 2.3, ox = cx + side * (a.eyeW + 0.45);
  const base = a.eyeY - 3.65 + a.browY;
  const [di, dO, arch] = st.tired ? [0.9, 0.9, a.browArch * 0.3]
    : st.expression === 'stressed' ? [0.8, -0.4, a.browArch * 0.6]
    : st.expression === 'dead' ? [0.5, 0.5, 0]
    : st.expression === 'smirk' && side > 0 ? [-0.6, -0.5, a.browArch + 0.3]
    : [0, 0.1, a.browArch];
  const iy = base + di, oy = base + dO, mx = ix + (ox - ix) * 0.55, my = (iy + oy) / 2 - arch;
  const t = a.browT;
  return `<path d="M${ix} ${iy - t / 2} Q${mx} ${my - t * 0.45} ${ox} ${oy - t * 0.2} L${ox} ${oy + t * 0.2} Q${mx} ${my + t * 0.45} ${ix} ${iy + t / 2} Z" fill="${c.brow}"/>`;
}

function noseShape(a, c) {
  const top = a.eyeY + 1, tip = a.noseTip, nw = a.noseW;
  let d = `<path d="M31.5 ${top} L${32 - nw * 1.2} ${tip - 0.5} L32.7 ${tip + 0.3} L31.6 ${tip - 1} Z" fill="${c.shade}"/>
    <path d="M32.9 ${tip - 2.4} L33.5 ${tip - 0.4} L32.7 ${tip + 0.3} Z" fill="${c.lit}" opacity="0.7"/>
    <path d="M${32.1 - nw} ${tip + 0.4} Q32 ${tip + 0.75} ${32.1 + nw * 0.8} ${tip + 0.4}" stroke="${c.lip}" stroke-width="0.7" fill="none" stroke-linecap="round"/>`;
  if (a.bridge === 'hooked') d += `<path d="M32.6 ${top + 1.6} Q33.9 ${(top + tip) / 2 - 0.4} 33.1 ${tip - 1.2}" stroke="${c.midShade}" stroke-width="0.5" fill="none"/>`;
  if (a.bridge === 'button') d += `<circle cx="32.9" cy="${tip - 0.4}" r="0.75" fill="${c.lit}" opacity="0.6"/>`;
  if (a.bridge === 'broad') d += `<path d="M${32 - nw - 0.2} ${tip - 0.9} Q${32 - nw - 1.1} ${tip} ${32 - nw + 0.2} ${tip + 0.5} M${32 + nw * 0.8 + 0.2} ${tip - 0.9} Q${32 + nw * 0.8 + 1.1} ${tip} ${32 + nw * 0.8 - 0.2} ${tip + 0.5}" stroke="${c.midShade}" stroke-width="0.55" fill="none"/>`;
  return d;
}

function mouthShape(a, st, c) {
  const mw = a.mouthW, y = a.mouthY;
  const lipFill = mix(c.skin, '#7a3030', 0.18);
  const lowerLip = (dy = 0.7) => `<path d="M${32 - mw + 0.8} ${y + dy} Q32 ${y + dy + a.lower} ${32 + mw - 0.8} ${y + dy} Z" fill="${lipFill}"/>`;
  const upperLip = a.upper > 0.45 ? `<path d="M${32 - mw + 0.5} ${y} Q31 ${y - a.upper} 32 ${y - a.upper * 0.55} Q33 ${y - a.upper} ${32 + mw - 0.5} ${y} Z" fill="${mix(c.skin, '#7a3030', 0.26)}" opacity="0.8"/>` : '';
  if (!st.tired && st.expression === 'stressed') {
    const x = 32 - mw + 0.4, tw = 2 * (mw - 0.4);
    return `<rect x="${x}" y="${y - 0.6}" width="${tw}" height="1.5" rx="0.4" fill="#e9e2d6"/>
      <path d="M${32 - tw / 4} ${y - 0.6} v1.5 M32 ${y - 0.6} v1.5 M${32 + tw / 4} ${y - 0.6} v1.5" stroke="#b9b2a6" stroke-width="0.3"/>
      <rect x="${x}" y="${y - 0.6}" width="${tw}" height="1.5" rx="0.4" fill="none" stroke="${c.lip}" stroke-width="0.7"/>
      <path d="M${x - 0.8} ${y - 0.4} l-0.6 1 M${x + tw + 0.8} ${y - 0.4} l0.6 1" stroke="${c.lip}" stroke-width="0.5"/>`;
  }
  if (!st.tired && st.expression === 'smirk') {
    return `${upperLip}<path d="M${32 - mw} ${y + 0.4} Q32 ${y + 1} ${32 + mw + 0.3} ${y - 0.8}" stroke="${c.lip}" stroke-width="1.1" fill="none" stroke-linecap="round"/>${lowerLip(0.9)}`;
  }
  const flat = st.tired || st.expression === 'dead';
  return `${upperLip}<path d="M${32 - mw} ${y + (flat ? 0.4 : 0)} Q32 ${y + (flat ? 0.2 : 0.9)} ${32 + mw} ${y + (flat ? 0.4 : 0)}" stroke="${c.lip}" stroke-width="1.1" fill="none" stroke-linecap="round"/>${lowerLip()}`;
}

/** Age lines, freckles and a mole: the details that make a face someone's. */
function skinMarks(a, c, age) {
  let d = '';
  if (age >= 33) {
    const o = Math.min(0.75, (age - 28) / 30);
    const wing = 32 - a.noseW - 0.5, lw = 32 + a.noseW * 0.8 + 0.5;
    d += `<g stroke="${c.midShade}" stroke-width="0.5" fill="none" opacity="${o}">
      <path d="M${wing} ${a.noseTip - 0.2} Q${32 - a.mouthW - 1.5} ${a.mouthY - 1} ${32 - a.mouthW - 0.9} ${a.mouthY + 1.8}"/>
      <path d="M${lw} ${a.noseTip - 0.2} Q${32 + a.mouthW + 1.5} ${a.mouthY - 1} ${32 + a.mouthW + 0.9} ${a.mouthY + 1.8}"/></g>`;
  }
  if (age >= 45) {
    const bag = (cx) => `<path d="M${cx - a.eyeW * 0.8} ${a.eyeY + 1.7} Q${cx} ${a.eyeY + 2.9} ${cx + a.eyeW * 0.8} ${a.eyeY + 1.7}"/>`;
    d += `<g stroke="${c.midShade}" stroke-width="0.45" fill="none" opacity="0.7">${bag(32 - a.eyeGap)}${bag(32 + a.eyeGap)}
      <path d="M27 ${a.eyeY - 7.4} Q32 ${a.eyeY - 8} 37 ${a.eyeY - 7.4}"/></g>`;
  }
  if (a.freckles) {
    const dots = [[28.6, 33.2], [29.8, 32.4], [30.9, 33.6], [33.2, 32.6], [34.4, 33.4], [35.6, 32.5], [27.5, 34.3], [36.6, 34], [31.8, 31.6]];
    d += `<g fill="${mix(c.skin, '#4a2412', 0.38)}">${dots.map(([x, y]) => `<circle cx="${x}" cy="${y + a.eyeY - 29}" r="0.32"/>`).join('')}</g>`;
  }
  if (a.mole) d += `<circle cx="${a.mole[0]}" cy="${a.mole[1]}" r="0.45" fill="${mix(c.skin, '#2a1408', 0.55)}"/>`;
  return d;
}

/**
 * What the portrait shows about someone's condition today (the same facts the screen
 * writes out). Expression, first match wins: a dead-eyed stare in neural load's danger
 * zone (over 70, as the game warns) or at burnout 60+; stressed below 35 morale; a smirk
 * at 80+ morale; otherwise neutral.
 */
export function stateOf(op) {
  const c = op.condition ?? {};
  const load = c.neuralLoad ?? 0;
  const morale = c.morale ?? 60;
  return {
    injured: ['light', 'serious', 'critical'].includes(c.injury),
    tired: (c.fatigue ?? 0) > 60,
    load: Math.min(1, load / 100),
    expression: load > 70 || (c.burnout ?? 0) >= 60 ? 'dead' : morale < 35 ? 'stressed' : morale >= 80 ? 'smirk' : 'neutral',
  };
}

// --- colour helpers ---------------------------------------------------------------------
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const hex = ([r, g, b]) => `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
/** Blend two colours: t = 0 gives a, t = 1 gives b. */
export function mix(a, b, t) {
  const [x, y] = [rgb(a), rgb(b)];
  return hex(x.map((v, i) => v + (y[i] - v) * t));
}

// --- portraits ------------------------------------------------------------------------
// After Citizen Sleeper: real skin tones, a coloured city light from the right, faces
// built from light and shadow planes with few lines. One style for every character.
const SHADOW = '#1b2340';                 // cool shadow every face falls into
const CITY_LIGHT = ['#3de8d8', '#ff3d5f', '#f2b544', '#9b8cff'];  // cyan, signal red, sodium, violet neon
const PORTRAIT_FRAME = '9 6 46 46';      // head and upper shoulders, square
const HEAD_SHAPES = {
  oval: { w: 11.5, j: 7.5, c: 3.2, chin: 45 },
  round: { w: 12.5, j: 9, c: 4, chin: 44 },
  square: { w: 12, j: 10, c: 5, chin: 45 },
  long: { w: 10.8, j: 7, c: 3, chin: 46.5 },
};
let uid = 0; // clip-path ids must be unique on the page

function headPath({ w, j, c, chin }) {
  const L = 32 - w, R = 32 + w;
  return `M32 11 C${32 + w * 0.75} 11 ${R} 16 ${R} 24 C${R} 30 ${R - 0.6} 33 ${32 + j + 1.5} 38 L${32 + c} ${chin - 0.5} Q32 ${chin + 1.2} ${32 - c} ${chin - 0.5} L${32 - j - 1.5} 38 C${L + 0.6} 33 ${L} 30 ${L} 24 C${L} 16 ${32 - w * 0.75} 11 32 11 Z`;
}

/**
 * Hair as { back, top } paths sized to the head (back is drawn behind it, top over it).
 * The top has volume above the crown, recessed temples and a side parting, so it reads
 * as hair rather than a cap. v: volume above the head; hl: hairline height.
 */
function hairTop(L, R, v = 1.5, hl = 19) {
  return `M${L - 0.8} 27 C${L - 1.8} 17 ${L + 1} ${9 - v} 32 ${8.5 - v} C${R - 1} ${9 - v} ${R + 1.8} 16 ${R + 0.8} 26`
    + ` C${R - 0.6} 22 ${R - 2} 19.5 ${R - 4} ${hl - 0.4} C33 ${hl - 1} 30 ${hl + 1} 28 ${hl} C25 ${hl - 0.5} ${L + 2} ${hl + 1} ${L - 0.8} 27 Z`;
}
function hairPaths(style, w) {
  const L = 32 - w, R = 32 + w;
  switch (style) {
    case 'crop': return { top: hairTop(L, R, 1.5, 19) };
    case 'buzz': return { top: hairTop(L + 0.4, R - 0.4, 0, 18), thin: true };
    case 'long': return {
      back: `M${L - 1.5} 24 C${L - 2.5} 7 ${R + 2.5} 7 ${R + 1.5} 24 L${R + 3} 54 L${R - 3.5} 52 L${R - 2} 35 L${L + 2} 35 L${L + 3.5} 52 L${L - 3} 54 Z`,
      top: hairTop(L, R, 2, 19.5),
    };
    case 'bob': return {
      back: `M${L - 1.5} 24 C${L - 2.5} 7 ${R + 2.5} 7 ${R + 1.5} 24 L${R + 2} 42 L${R - 2.5} 41 L${R - 2} 34 L${L + 2} 34 L${L + 2.5} 41 L${L - 2} 42 Z`,
      top: hairTop(L, R, 2, 19.5),
    };
    case 'bun': return { top: hairTop(L, R, 1, 19), bun: true };
    case 'curls': return { curls: true, back: `M${L - 2.5} 30 C${L - 4} 6 ${R + 4} 6 ${R + 2.5} 30 Z` };
    case 'locs': return {
      back: `M${L - 2} 24 C${L - 2.5} 7 ${R + 2.5} 7 ${R + 2} 24 L${R + 3.5} 56 L${R - 1} 56 L${R - 1.5} 36 L${L + 1.5} 36 L${L + 1} 56 L${L - 3.5} 56 Z`,
      top: hairTop(L, R, 2.5, 19), strands: true,
    };
    case 'slick': return {
      top: `M${L - 0.4} 25 C${L - 1} 13 ${L + 2} 8.6 32 8.4 C${R - 2} 8.6 ${R + 1} 13 ${R + 0.4} 25 C${R - 1} 20 ${R - 3} 17.2 32 16.8 C${L + 3} 17.2 ${L + 1} 20 ${L - 0.4} 25 Z`,
      slick: true,
    };
    case 'fiber': return {
      back: `M${L - 2} 24 C${L - 2.5} 7 ${R + 2.5} 7 ${R + 2} 24 L${R + 3.5} 56 L${R - 1} 56 L${R - 1.5} 36 L${L + 1.5} 36 L${L + 1} 56 L${L - 3.5} 56 Z`,
      top: hairTop(L, R, 2.5, 19), strands: true, fiber: true,
    };
    case 'undercut': return {
      top: `M${L + 3} 21 C${L + 1.5} 9 ${L + 4} 4.5 32 4.5 C${R - 1} 5 ${R + 2} 15 ${R + 0.8} 26 C${R - 0.6} 22 ${R - 2} 19.5 ${R - 4} 18.6 C33 18 30 19.5 ${L + 3} 21 Z`,
      shaved: true,
    };
    default: return {}; // bald
  }
}

/** Light, colour and shading choices for one face, all derived from its stable features. */
function palette(f, op) {
  const light = CITY_LIGHT[hash(`${op.id}|light`) % CITY_LIGHT.length];
  return {
    light,
    skin: f.skin,
    shade: mix(f.skin, SHADOW, 0.42),
    midShade: mix(f.skin, SHADOW, 0.2),
    lit: mix(f.skin, light, 0.38),
    lip: mix(f.skin, '#2a1210', 0.5),
    hair: f.hairColor,
    hairLit: mix(f.hairColor, light, 0.5),
    brow: mix(f.hairColor, '#0d0a09', 0.45),
    shirt: f.shirt,
    shirtLit: mix(f.shirt, light, 0.38),
  };
}

function eye(x, tired, c, expression) {
  const y = 29;
  if (tired) {
    return `<path d="M${x - 2.6} ${y + 1} Q${x} ${y + 3.6} ${x + 2.6} ${y + 1} Q${x} ${y + 2} ${x - 2.6} ${y + 1} Z" fill="${c.shade}"/>
      <path d="M${x - 2.1} ${y} Q${x} ${y - 0.5} ${x + 2.1} ${y} Q${x} ${y + 0.8} ${x - 2.1} ${y} Z" fill="#120d0b"/>
      <path d="M${x - 2.3} ${y - 0.4} Q${x} ${y - 1.3} ${x + 2.3} ${y - 0.4}" stroke="${c.lip}" stroke-width="0.8" fill="none"/>`;
  }
  if (expression === 'dead') {
    // Flat lids, no light in the eyes.
    return `<path d="M${x - 2.6} ${y + 1.2} Q${x} ${y + 2.6} ${x + 2.6} ${y + 1.2} Q${x} ${y + 1.8} ${x - 2.6} ${y + 1.2} Z" fill="${c.midShade}"/>
      <path d="M${x - 2.2} ${y - 0.6} L${x + 2.2} ${y - 0.6} Q${x} ${y + 1.4} ${x - 2.2} ${y - 0.6} Z" fill="#26292f"/>`;
  }
  if (expression === 'stressed') {
    return `<path d="M${x - 2.1} ${y} Q${x} ${y - 1} ${x + 2.1} ${y} Q${x} ${y + 0.8} ${x - 2.1} ${y} Z" fill="#120d0b"/>
      <circle cx="${x + 0.5}" cy="${y - 0.2}" r="0.35" fill="#fff" opacity="0.7"/>`;
  }
  return `<path d="M${x - 2.1} ${y} Q${x} ${y - 1.7} ${x + 2.1} ${y} Q${x} ${y + 1.1} ${x - 2.1} ${y} Z" fill="#120d0b"/>
    <circle cx="${x + 0.6}" cy="${y - 0.45}" r="0.45" fill="#fff" opacity="0.85"/>`;
}

/** Brows and mouth for an expression (tired brows sit lower whatever the mood). */
function browsAndMouth(st, c) {
  const brows = st.tired ? ['25 26.4 L29.6 26.6', '34.4 26.6 L39 26.4']
    : st.expression === 'stressed' ? ['24.9 25 L29.7 26.4', '34.3 26.4 L39.1 25']
    : st.expression === 'smirk' ? ['24.9 25.7 L29.7 25.3', '34.3 24.6 L39.1 25.2']
    : st.expression === 'dead' ? ['24.9 26 L29.7 26', '34.3 26 L39.1 26']
    : ['24.9 25.6 L29.7 25.1', '34.3 25.1 L39.1 25.6'];
  const browPaths = brows.map((d) => `<path d="M${d}" stroke="${c.brow}" stroke-width="1.5" stroke-linecap="round"/>`).join('');
  let mouth;
  if (st.expression === 'stressed') {
    // Clenched: teeth showing between tight lips, a tense line at each corner.
    mouth = `<rect x="29.6" y="39.4" width="4.8" height="1.5" rx="0.4" fill="#e9e2d6"/><path d="M30.8 39.4 v1.5 M32 39.4 v1.5 M33.2 39.4 v1.5" stroke="#b9b2a6" stroke-width="0.3"/>
      <rect x="29.6" y="39.4" width="4.8" height="1.5" rx="0.4" fill="none" stroke="${c.lip}" stroke-width="0.7"/><path d="M28.8 39.6 l-0.6 1 M35.2 39.6 l0.6 1" stroke="${c.lip}" stroke-width="0.5"/>`;
  } else if (st.expression === 'smirk') {
    mouth = `<path d="M29.6 40.4 Q32 41 34.9 39.2" stroke="${c.lip}" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M30.4 40.9 Q32 42.1 33.6 40.6 Z" fill="${mix(c.skin, '#7a3030', 0.18)}"/>`;
  } else {
    const flat = st.tired || st.expression === 'dead';
    mouth = `<path d="M29.4 ${flat ? 40.4 : 40} Q32 ${flat ? 40.2 : 40.9} 34.6 ${flat ? 40.4 : 40}" stroke="${c.lip}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M30.2 40.7 Q32 42.2 33.8 40.7 Z" fill="${mix(c.skin, '#7a3030', 0.18)}"/>`;
  }
  return browPaths + mouth;
}

/** Chrome, glowing brighter as neural load rises (the one place the face shows load). */
function chromeMarks(f, load, w, tired, eyeAt = [36.6, 29]) {
  // The lens sits where the lit eye is (it moves with the anatomy draft; the old face never moves it).
  const shift = (s) => (eyeAt[0] === 36.6 && eyeAt[1] === 29 ? s : `<g transform="translate(${eyeAt[0] - 36.6} ${eyeAt[1] - 29})">${s}</g>`);
  const col = f.chromeColor;
  const glow = 0.5 + load * 0.5;
  const halo = (x, y) => (load > 0.4 ? `<circle cx="${x}" cy="${y}" r="${3 + load * 5}" fill="${col}" opacity="${(load - 0.3) * 0.45}"/>` : '');
  const R = 32 + w;
  switch (f.chrome) {
    case 'half':
      // The half-chrome face: a lens set in the plate, and a metal disc where the ear was.
      return `<circle cx="${R - 0.3}" cy="30" r="2.3" fill="#4a515b" stroke="#2b3038" stroke-width="0.4"/><circle cx="${R - 0.3}" cy="30" r="0.8" fill="${col}" opacity="${glow}"/>
        ${shift(`${halo(36.6, 29)}<circle cx="36.6" cy="29" r="2.9" fill="#1a1d22"/><circle cx="36.6" cy="29" r="2.2" fill="#0b0f12" stroke="#9aa3ad" stroke-width="0.5"/>
        <circle cx="36.6" cy="29" r="1.3" fill="${col}" opacity="${glow}"/><circle cx="36.6" cy="29" r="0.4" fill="#0b0f12"/>`)}`;
    case 'cybereye':
      // The lit-side eye is a lens: metal rim, glowing iris, a fine seam round the socket.
      return shift(`${halo(36.6, 29)}<path d="M33.3 26.2 Q36.6 24.6 39.9 26.6 L40.2 31.4 Q36.6 33.2 33.2 31.6 Z" fill="none" stroke="${mix(f.skin, '#000', 0.45)}" stroke-width="0.4"/>
        <circle cx="36.6" cy="29" r="2.4" fill="#0b0f12" stroke="#9aa3ad" stroke-width="0.6"/>
        <circle cx="36.6" cy="29" r="1.25" fill="${col}" opacity="${glow}"/><circle cx="36.6" cy="29" r="0.45" fill="#0b0f12"/>
        ${tired ? `<path d="M34 28 Q36.6 26.6 39.2 28 L39.2 26.4 L34 26.4 Z" fill="${mix(f.skin, SHADOW, 0.2)}"/>` : ''}`);
    case 'circuit': {
      const paths = {
        jaw: `M${R - 1.5} 31 L${R - 3} 35 L${R - 6} 38.5 L35.5 41.5 M${R - 3} 35 L${R - 1} 37`,
        temple: `M${R - 1.6} 19 L${R - 3.5} 21.5 L${R - 3.5} 24.5 L39.8 25.2 M${R - 3.5} 22.6 L${R - 1.4} 23.6`,
        nose: `M29.3 27.4 L31 28.6 L33 28.6 L34.7 27.4 M32 28.6 V31`,
      };
      const node = { jaw: [35.5, 41.5], temple: [39.8, 25.2], nose: [32, 31] }[f.circuit];
      return `${halo(node[0], node[1])}<path d="${paths[f.circuit]}" stroke="${col}" stroke-width="0.55" fill="none" stroke-linejoin="round" opacity="${glow}"/>
        <circle cx="${node[0]}" cy="${node[1]}" r="0.6" fill="${col}" opacity="${glow}"/>`;
    }
    case 'seam':
      // Synthetic skin on the lit cheek: a slightly cooler patch with a clean-cut edge.
      return `<path d="M${R - 0.5} 23 L${R - 5.5} 24.5 L${R - 6} 31.5 L${R - 2.5} 35 L${R - 0.6} 33 Z" fill="${mix(f.skin, '#c9d2dc', 0.3)}" opacity="0.85"/>
        <path d="M${R - 0.5} 23 L${R - 5.5} 24.5 L${R - 6} 31.5 L${R - 2.5} 35" stroke="${mix(f.skin, '#000', 0.5)}" stroke-width="0.45" fill="none"/>
        ${halo(R - 5.5, 24.5)}<circle cx="${R - 5.5}" cy="24.5" r="0.65" fill="${col}" opacity="${glow}"/>`;
    default: {
      const x = R - 2.6;
      return `${halo(x, 23)}<path d="M${x} 19 V27" stroke="${col}" stroke-width="1.1" stroke-linecap="round" opacity="${glow}"/><circle cx="${x}" cy="27.5" r="0.9" fill="${col}" opacity="${glow}"/>`;
    }
  }
}

/** Tattoos, barcodes and scars. Ink is a thin neon so it shows on every skin tone. */
function markings(f, c, w) {
  const L = 32 - w;
  switch (f.marking) {
    case 'tattoo': return `<g stroke="${c.light}" stroke-width="0.5" fill="none" opacity="0.75"><path d="M${L + 3} 31 L${L + 5.5} 35.5 L${L + 0.8} 35.5 Z"/><path d="M${L + 2.4} 37.3 h4 M${L + 3.2} 38.6 h2.4"/></g>`;
    case 'barcode': return `<g fill="${mix(c.skin, '#05080c', 0.7)}" opacity="0.85">${[0, 0.9, 1.4, 2.5, 3, 3.8].map((dx, i) => `<rect x="${33.4 + dx}" y="42.5" width="${i % 2 ? 0.35 : 0.55}" height="3.6"/>`).join('')}</g>`;
    case 'scar': return `<path d="M${L + 2.5} 22 L${L + 4} 24 L${L + 3.2} 25.2 L${L + 5} 28" stroke="${mix(c.skin, '#ffd5d5', 0.35)}" stroke-width="0.75" fill="none" stroke-linejoin="bevel"/>`;
    case 'cut': return `<path d="M${L + 3} 22.5 L${L + 6} 27" stroke="${mix(c.skin, '#ffd5d5', 0.35)}" stroke-width="0.7"/>`;
    default: return '';
  }
}

/** Facial hair, in the hair colour. Drawn over the mouth area, under any mask. */
function facialHairMarks(f, c, g, id) {
  const w = g.w, L = 32 - w, R = 32 + w;
  const ink = c.hair;
  switch (f.facialHair) {
    case 'pencil': return `<path d="M29.5 38.4 Q32 37.5 34.5 38.4" stroke="${ink}" stroke-width="0.85" fill="none" stroke-linecap="round"/>`;
    case 'droop': return `<path d="M29.2 37.9 Q32 36.9 34.8 37.9 L35.5 44.2 L34.7 44.2 L34 39.2 Q32 38.5 30 39.2 L29.3 44.2 L28.5 44.2 Z" fill="${ink}"/>`;
    case 'soul': return `<path d="M31.1 41.9 L32.9 41.9 L32 43.8 Z" fill="${ink}"/>`;
    case 'goatee': return `<path d="M29.3 38.5 Q32 37.3 34.7 38.5 Q32 39 29.3 38.5 Z" fill="${ink}"/>
      <path d="M30.1 41.9 Q32 42.7 33.9 41.9 L33.3 45.2 Q32 46.2 30.7 45.2 Z" fill="${ink}"/>`;
    case 'beard': return `<g clip-path="url(#${id}h)"><path fill-rule="evenodd" d="M${L - 1} 30 L${L + 2} 30 Q${L + 3} 37 29 38.6 Q32 37.6 35 38.6 Q${R - 3} 37 ${R - 2} 30 L${R + 1} 30 L${R + 1} 52 L${L - 1} 52 Z M28.8 40.4 Q32 38.6 35.2 40.4 Q32 42.6 28.8 40.4 Z" fill="${ink}" opacity="0.92"/>
      <path d="M${32 + g.j - 1} 36 L${R + 1} 30 L${R + 1} 52 L${32 + g.c} 52 Z" fill="${c.hairLit}" opacity="0.35"/></g>
      <path d="M${32 - g.c - 1.2} ${g.chin - 1} Q32 ${g.chin + 3} ${32 + g.c + 1.2} ${g.chin - 1} Z" fill="${ink}" opacity="0.92"/>`;
    default: return '';
  }
}

/** Half the face is chrome: a metal plate over the lit side, seamed into the skin. */
function halfFacePlate(f, c, g) {
  const R = 32 + g.w;
  const metal = '#58606b';
  const edge = 'M32.6 9 L33.6 22 L34.4 27.5 L35.4 33 L35.7 37.5 L35.6 41.5 L34.4 47';
  return `<path d="${edge} L34.4 64 L64 64 L64 0 L32.6 0 Z" fill="${metal}"/>
    <path d="M64 0 L${R - 1.8} 12 L${R - 1.3} 30 L${32 + g.j - 0.3} 40.5 L64 64 Z" fill="${mix(metal, c.light, 0.35)}"/>
    <path d="${edge}" stroke="${mix(c.skin, '#2a1210', 0.55)}" stroke-width="0.9" fill="none"/>
    <g stroke="#2b3038" stroke-width="0.45" fill="none">
      <path d="M35.4 18 L${R - 1} 19.5"/><path d="M36.6 33.6 L${R - 1} 31.5"/><path d="M36.3 40.6 L${R - 2.6} 37"/>
      <path d="M38.5 36.2 h2.6 M38.8 37.4 h2.2"/>
    </g>
    <circle cx="36.4" cy="19.6" r="0.35" fill="#2b3038"/><circle cx="${R - 2}" cy="31.8" r="0.35" fill="#2b3038"/>`;
}

/** Masks over the nose and mouth. The LED grille shows the mood the mouth would have. */
function maskMarks(f, c, g, st, id) {
  const L = 32 - g.w, R = 32 + g.w, j = g.j;
  const col = f.chromeColor;
  const straps = `<path d="M${L + 2.2} 34.2 L${L - 0.6} 31.5 M${R - 2.2} 34.2 L${R + 0.6} 31.5" stroke="#15181d" stroke-width="0.9"/>`;
  switch (f.mask) {
    case 'respirator': return `${straps}
      <path d="M${L + 2.5} 34.4 Q32 31.4 ${R - 2.5} 34.4 L${32 + j + 0.4} 41 Q32 47.4 ${32 - j - 0.4} 41 Z" fill="#2a2f38"/>
      <path d="M32.5 32.6 Q${R - 4} 33 ${R - 2.5} 34.4 L${32 + j + 0.4} 41 Q34 45.6 32.5 46 Z" fill="${mix('#2a2f38', c.light, 0.3)}"/>
      ${[[26, 41.2], [38, 41.2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.7" fill="#3a404b"/><circle cx="${x}" cy="${y}" r="1.7" fill="#14171c"/><path d="M${x - 1.2} ${y} h2.4 M${x} ${y - 1.2} v2.4" stroke="#5a616d" stroke-width="0.35"/>`).join('')}
      <path d="M30.6 37 h2.8 M30.9 38.2 h2.2" stroke="#14171c" stroke-width="0.5"/>
      <circle cx="${R - 4.6}" cy="36.2" r="0.5" fill="${col}"/>`;
    case 'jawplate': return `${straps}
      <path d="M${L + 2} 34.6 L32 33 L${R - 2} 34.6 L${32 + j} 41 L${32 + g.c} ${g.chin - 0.5} L${32 - g.c} ${g.chin - 0.5} L${32 - j} 41 Z" fill="#4a525d"/>
      <path d="M32 33 L${R - 2} 34.6 L${32 + j} 41 L${32 + g.c} ${g.chin - 0.5} L32 ${g.chin - 0.5} Z" fill="${mix('#4a525d', c.light, 0.35)}"/>
      <g stroke="#1b1f25" stroke-width="0.55"><path d="M29.4 38.4 h5.2"/><path d="M29.8 40.1 h4.4"/><path d="M30.3 41.8 h3.4"/></g>
      <path d="M32 33 V${g.chin - 0.5}" stroke="#2b3038" stroke-width="0.35"/>`;
    case 'goggles': {
      // Respirator plus sealed goggles: tinted lenses catch the city light; the eyes are hidden.
      const lens = (x) => `<circle cx="${x}" cy="29" r="3.4" fill="#2b3038"/><circle cx="${x}" cy="29" r="2.6" fill="${mix('#0b0f14', c.light, 0.25)}"/>
        <path d="M${x - 1.4} 27.4 Q${x} 26.6 ${x + 1.4} 27.4" stroke="#fff" stroke-width="0.5" fill="none" opacity="0.45"/>`;
      return `<path d="M${L - 0.8} 28.4 H${R + 0.8} V30 H${L - 0.8} Z" fill="#15181d"/>${lens(27.4)}${lens(36.6)}<path d="M30.4 28.8 h3.2" stroke="#2b3038" stroke-width="1"/>
      ${maskMarks({ ...f, mask: 'respirator' }, c, g, st)}`;
    }
    case 'faceplate': {
      // A smooth plate over the whole face, two LED slits for eyes (they brighten with neural
      // load, like chrome), a seam down the middle, and a crack when hurt.
      const glow = 0.55 + st.load * 0.45;
      return `<g clip-path="url(#${id}h)">
        <path d="M0 0 H64 V64 H0 Z" fill="#2b3039"/>
        <path d="M64 0 L${R - 1.8} 12 L${R - 1.3} 30 L${32 + j - 0.3} 40.5 L64 64 Z" fill="${mix('#2b3039', c.light, 0.3)}"/>
        <path d="M0 0 L${32 - g.w * 0.12} 9 C${32 - g.w * 0.55} 20 ${32 - g.w * 0.48} 31 30.5 48 L0 64 Z" fill="#1d2129"/>
        <path d="M32 9 V${g.chin + 1}" stroke="#14171c" stroke-width="0.4"/>
        <g stroke="#14171c" stroke-width="0.5"><path d="M29.4 39.6 h5.2"/><path d="M29.9 41.2 h4.2"/></g>
        ${st.injured ? `<path d="M${R - 3} 20 L${R - 5.5} 24 L${R - 4.5} 26 L${R - 7} 30" stroke="#0b0d10" stroke-width="0.6" fill="none"/>` : ''}
      </g>
      ${st.load > 0.4 ? `<ellipse cx="32" cy="28.8" rx="${8 + st.load * 3}" ry="${2 + st.load * 2}" fill="${f.chromeColor}" opacity="${(st.load - 0.3) * 0.35}"/>` : ''}
      <path d="M24.4 28 L30.2 29.2 L29.8 30.4 L24.6 29.4 Z M39.6 28 L33.8 29.2 L34.2 30.4 L39.4 29.4 Z" fill="${f.chromeColor}" opacity="${glow}"/>`;
    }
    case 'grille': {
      // An LED strip where the mouth is, drawn to match the face's real mood.
      const mood = st.tired ? 'M29.8 40.6 Q32 40 34.2 40.6' : {
        stressed: 'M29.6 40.2 l1.1 -0.8 l1.1 0.8 l1.1 -0.8 l1.1 0.8',
        smirk: 'M29.8 40.6 Q32 41 34.4 39.4',
        dead: 'M29.8 40.2 h4.4',
      }[st.expression] ?? 'M29.8 40.2 Q32 41 34.2 40.2';
      return `${straps}
      <path d="M${L + 2.5} 34.4 Q32 31.6 ${R - 2.5} 34.4 L${32 + j} 41.5 Q32 47 ${32 - j} 41.5 Z" fill="#101318"/>
      <path d="M32.5 32.8 Q${R - 4} 33 ${R - 2.5} 34.4 L${32 + j} 41.5 Q34 45.4 32.5 45.8 Z" fill="${mix('#101318', c.light, 0.22)}"/>
      <path d="${mood}" stroke="${col}" stroke-width="0.8" fill="none" stroke-linecap="round" ${st.expression === 'dead' ? 'stroke-dasharray="0.6 0.7" opacity="0.6"' : ''}/>`;
    }
    default: return '';
  }
}

/** Robes and prayer beads for monks, in place of the shirt (collar and beads go over the neck). */
function monkRobe(f, c, id) {
  const robe = { grey: '#6b6f78', ochre: '#5e4630', cyber: '#22252d' }[f.monk];
  return `<path d="M6 64 C8 52 18 47 32 47 C46 47 56 52 58 64 Z" fill="${robe}"/>
    <g clip-path="url(#${id}s)"><path d="M64 44 L40 47 L46 64 L64 64 Z" fill="${mix(robe, c.light, 0.32)}"/>
    ${f.monk === 'ochre' ? `<path d="M6 64 C8 52 18 47 27.5 47 L46 64 Z" fill="#b06a24"/><path d="M14 52 L22 64 M20 49 L31 64" stroke="#8a4f17" stroke-width="0.5"/>` : ''}</g>`;
}
function monkCollar(f, c) {
  const band = { grey: '#33363d', ochre: '#3f2f20', cyber: '#16181e' }[f.monk];
  const edge = f.monk === 'cyber' ? f.chromeColor : mix(band, '#000', 0.3);
  const beads = [];
  for (let i = 0; i <= 12; i++) {
    const t = Math.PI * (0.08 + 0.84 * (i / 12));
    beads.push([32 - Math.cos(t) * 7.6, 45.8 + Math.sin(t) * 5]);
  }
  // Crossed collar, left over right, then the mala hanging over it (all inside the crop).
  return `<path d="M37.4 46.2 L35.4 45.8 L31.6 49.4 L32.6 51 Z" fill="${band}" stroke="${edge}" stroke-width="0.35"/>
    <path d="M26.2 46.2 L28.8 45.6 L37.6 53 L34.4 53 Z" fill="${band}" stroke="${edge}" stroke-width="0.35"/>
    ${beads.map(([x, y], i) => `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.95" fill="${f.monk === 'cyber' && i % 3 === 0 ? f.chromeColor : '#7a4a2a'}"/>`).join('')}
    ${beads.map(([x, y]) => `<circle cx="${(x + 0.3).toFixed(2)}" cy="${(y - 0.3).toFixed(2)}" r="0.3" fill="#fff" opacity="0.3"/>`).join('')}`;
}

/** Conical hats: a steel war hat, a carbon one with a neon rim, and a deep woven one. */
const HAT_SHAPES = {
  jingasa: { L: 13, R: 51, brim: 19.5, apex: 8.5, sag: 3 },
  neonhat: { L: 13.5, R: 50.5, brim: 19.2, apex: 9.5, sag: 2.6 },
  douli: { L: 11, R: 53, brim: 21.5, apex: 6.8, sag: 3.4 },
};
/** Everything below a hat's surface (hair is clipped to it so nothing pokes through). */
const underHat = (h) => `M0 64 L0 ${h.brim} L${h.L} ${h.brim} L32 ${h.apex} L${h.R} ${h.brim} L64 ${h.brim} L64 64 Z`;
function hatMarks(f, c, id) {
  const h = HAT_SHAPES[f.headwear];
  const { L, R, brim, apex, sag } = h;
  const base = { jingasa: '#5b636e', neonhat: '#1c2028', douli: '#a8844c' }[f.headwear];
  const outline = `M${L} ${brim} L32 ${apex} L${R} ${brim} Q32 ${brim + sag} ${L} ${brim} Z`;
  const ribs = f.headwear === 'douli'
    ? [0.3, 0.55, 0.8].map((t) => { const y = apex + (brim - apex) * t; const dx = (R - 32) * t; return `<path d="M${32 - dx} ${y} Q32 ${y + sag * t} ${32 + dx} ${y}"/>`; }).join('')
    : [-0.6, -0.25, 0.25, 0.6].map((k) => `<path d="M32 ${apex} L${32 + (R - 32) * k} ${brim + sag * (1 - k * k) * 0.95}"/>`).join('');
  return `<g clip-path="url(#${id}h)"><path d="M0 ${brim} H64 V${brim + 4.5} H0 Z" fill="${SHADOW}" opacity="0.45"/></g>
    <path d="${outline}" fill="${base}"/>
    <path d="M32 ${apex} L${R} ${brim} Q${32 + (R - 32) * 0.5} ${brim + sag * 0.9} 32 ${brim + sag} Z" fill="${mix(base, c.light, f.headwear === 'neonhat' ? 0.18 : 0.4)}"/>
    <path d="M${L} ${brim} Q32 ${brim + sag} ${R} ${brim} Q32 ${brim + sag * 0.55} ${L} ${brim} Z" fill="${mix(base, '#000', 0.45)}"/>
    <g stroke="${mix(base, '#000', 0.35)}" stroke-width="0.4" fill="none">${ribs}</g>
    ${f.headwear === 'douli'
      ? `<path d="M${L + 9} ${brim + 1.4} L28 46 M${R - 9} ${brim + 1.4} L36 46" stroke="#3a2c1a" stroke-width="0.45"/>`
      : `<circle cx="32" cy="${apex + 0.6}" r="0.9" fill="${mix(base, c.light, 0.5)}"/>`}
    ${f.headwear === 'neonhat' ? `<path d="M${L} ${brim} Q32 ${brim + sag} ${R} ${brim}" stroke="${f.chromeColor}" stroke-width="0.8" fill="none"/>
      <path d="M${L} ${brim} Q32 ${brim + sag} ${R} ${brim}" stroke="${f.chromeColor}" stroke-width="2.4" fill="none" opacity="0.18"/>` : ''}
    ${f.headwear === 'jingasa' ? `<path d="M${L} ${brim} Q32 ${brim + sag} ${R} ${brim}" stroke="${mix(base, c.light, 0.6)}" stroke-width="0.4" fill="none"/>` : ''}`;
}

/** Glasses sized to this person's eyes (anatomy draft). */
function glassesAt(a, c) {
  const lw = Math.max(5.6, 2 * a.eyeW + 1.6), y = a.eyeY - 2;
  const l = 32 - a.eyeGap - lw / 2, r = 32 + a.eyeGap - lw / 2;
  return `<g fill="${c.light}" fill-opacity="0.12" stroke="#0d0d0f" stroke-width="0.8"><rect x="${l}" y="${y}" width="${lw}" height="4.2" rx="1.2"/><rect x="${r}" y="${y}" width="${lw}" height="4.2" rx="1.2"/></g><path d="M${l + lw} ${y + 1.6} H${r}" stroke="#0d0d0f" stroke-width="0.8"/>`;
}

function injuryMarks(severity, w) {
  const plaster = `<g transform="rotate(-32 ${32 + w * 0.55} 34)"><rect x="${32 + w * 0.55 - 3.5}" y="33" width="7" height="2.2" fill="#ece3d3"/></g>
    <g transform="rotate(28 ${32 + w * 0.55} 34)"><rect x="${32 + w * 0.55 - 3.5}" y="33" width="7" height="2.2" fill="#ece3d3" opacity="0.9"/></g>`;
  if (severity === 'light') return plaster;
  // Serious or worse: a gauze band across the brow as well.
  return `<path d="M${32 - w - 1} 21.5 Q32 18.5 ${32 + w + 1} 21 L${32 + w + 1} 24.8 Q32 22.3 ${32 - w - 1} 25.3 Z" fill="#efe8dc"/>
    <path d="M${32 - w} 23.6 Q32 20.9 ${32 + w} 23.2" stroke="#cfc6b6" stroke-width="0.5" fill="none"/>
    <circle cx="${32 + w * 0.45}" cy="22.4" r="1.1" fill="#b4473f" opacity="0.55"/>${plaster}`;
}

/**
 * A portrait: head and upper shoulders in a square frame. Shows injury (plaster, gauze),
 * tiredness (heavy lids, shadowed eyes) and neural load (the implant glows). Fallen
 * operatives are greyed by the frame (CSS), not here.
 */
export function portrait(op, { size = 44, anatomy = false } = {}) {
  const f = faceOf(op);
  const st = stateOf(op);
  const severity = op.condition?.injury;
  const c = palette(f, op);
  const a = anatomy ? anatomyOf(op) : null;
  const g = a ? reshape(HEAD_SHAPES[f.shape], a) : HEAD_SHAPES[f.shape];
  const eyeAt = a ? [32 + a.eyeGap, a.eyeY] : [36.6, 29];
  const nk = a ? a.neck : 4.4, ear = a ? a.ear : 1, earOut = a ? a.earOut : 0;
  const w = g.w;
  const id = `pf${++uid}`;
  const head = headPath(g);
  const hair = hairPaths(f.hair, w);
  const hat = f.headwear ? HAT_SHAPES[f.headwear] : null;
  const hairClip = hat ? `clip-path="url(#${id}u)"` : '';
  const L = 32 - w, R = 32 + w;
  const gear = portraitGear(op, c, f); // the rifle on their back, if they carry one

  const curlBlobs = hair.curls ? [[L + 1, 18, 5.2], [L + 6, 12.5, 5.6], [32, 10.5, 5.8], [R - 6, 12, 5.6], [R - 1, 17.5, 5.2], [L - 1, 25, 4], [R + 1, 24, 4]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('') : '';
  const strands = hair.strands ? [-5, -1.5, 2, 5.5].map((dx) => `<path d="M${32 + dx} 16 V22" stroke="${hair.fiber ? f.chromeColor : mix(c.hair, '#000', 0.35)}" stroke-width="${hair.fiber ? 0.6 : 0.8}" ${hair.fiber ? 'opacity="0.8"' : ''}/>`).join('') : '';
  // Fiber-optic dreads: glowing lines down the hanging strands, bright at the tips.
  const fiberLines = hair.fiber ? [[L - 1.5, 54], [L + 1.2, 54], [R - 1.2, 54], [R + 1.5, 54]].map(([x, y]) =>
    `<path d="M${x} 36 V${y - 2}" stroke="${f.chromeColor}" stroke-width="0.5" opacity="0.7"/><circle cx="${x}" cy="${y - 1.6}" r="0.7" fill="${f.chromeColor}"/>`).join('') : '';
  // Undercut: the shaved side carries a geometric tattoo.
  const shavedInk = hair.shaved ? `<path d="M${L - 0.2} 17.5 l2.4 2.4 l-2.4 2.4 M${L + 1.4} 23.6 h2.2" stroke="${c.light}" stroke-width="0.5" fill="none" opacity="0.7"/>` : '';

  return `<svg class="art portrait" viewBox="${PORTRAIT_FRAME}" width="${size}" height="${size}" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${id}bg" x1="1" x2="0"><stop offset="0" stop-color="${c.light}" stop-opacity="${st.tired ? 0.1 : 0.28}"/><stop offset="0.65" stop-color="${c.light}" stop-opacity="0"/></linearGradient>
    <clipPath id="${id}h"><path d="${head}"/></clipPath>
    <clipPath id="${id}s"><path d="M6 64 C8 52 18 47 32 47 C46 47 56 52 58 64 Z"/></clipPath>
    ${hair.top ? `<clipPath id="${id}t"><path d="${hair.top}"/></clipPath>` : ''}
    ${hair.back ? `<clipPath id="${id}b"><path d="${hair.back}"/></clipPath>` : ''}
    ${hat ? `<clipPath id="${id}u"><path d="${underHat(hat)}"/></clipPath>` : ''}
  </defs>
  <rect x="0" y="0" width="64" height="64" fill="#0d1016"/><rect x="0" y="0" width="64" height="64" fill="url(#${id}bg)"/>
  ${gear.back}

  <g ${hairClip}>
  ${hair.back ? `<path d="${hair.back}" fill="${c.hair}"/>${f.splitDye ? `<g clip-path="url(#${id}b)"><rect x="0" y="0" width="32" height="64" fill="${f.splitDye}"/></g>` : ''}${fiberLines}` : ''}
  ${hair.curls ? `<g fill="${c.hair}">${curlBlobs}</g><path d="${hair.back}" fill="${c.hair}"/>` : ''}
  </g>

  ${f.monk ? monkRobe(f, c, id) : `<path d="M6 64 C8 52 18 47 32 47 C46 47 56 52 58 64 Z" fill="${c.shirt}"/>
  <g clip-path="url(#${id}s)"><path d="M64 44 L40 47 L46 64 L64 64 Z" fill="${c.shirtLit}"/><path d="M27 46 L32 54 L37 46 Z" fill="${mix(c.shirt, '#000', 0.35)}"/></g>`}
  ${gear.front}
  <path d="M${32 - nk} 37 L${32 - nk} 48 Q32 51 ${32 + nk} 48 L${32 + nk} 37 Z" fill="${c.shade}"/><path d="M${32 + nk - 1.8} 38 L${32 + nk} 37 L${32 + nk} 48 L${32 + nk - 1.8} 49 Z" fill="${c.lit}" opacity="0.8"/>
  ${f.monk ? monkCollar(f, c) : ''}

  <ellipse cx="${L + 0.3 - earOut}" cy="30" rx="${1.9 * ear}" ry="${3.4 * ear}" fill="${c.shade}"/>
  <ellipse cx="${R - 0.3 + earOut}" cy="30" rx="${1.9 * ear}" ry="${3.4 * ear}" fill="${c.skin}"/><path d="M${R + 0.6 + earOut} ${30 - 2.5 * ear} Q${R + 1.5 * ear + earOut} 30 ${R + 0.4 + earOut} ${30 + 3 * ear}" stroke="${c.lit}" stroke-width="0.9" fill="none"/>
  ${f.earring ? `<circle cx="${R}" cy="34" r="0.9" fill="#f2b544"/>` : ''}

  <path d="${head}" fill="${c.skin}"/>
  <g clip-path="url(#${id}h)">
    <path d="M0 0 L${32 - w * 0.12} 9 C${32 - w * 0.55} 20 ${32 - w * 0.48} 31 ${30.5} 48 L0 64 Z" fill="${c.shade}"/>
    ${a?.cheek === 'high' ? `<path d="M${32 + w * 0.25} 33 L${R - 0.8} 29.8 L${32 + g.j + 1} 37.6 Z" fill="${c.midShade}" opacity="0.75"/>`
      : `<path d="M${32 + w * 0.3} 34.5 L${R - 0.8} 31.5 L${32 + g.j + 1} 39 Z" fill="${c.midShade}" opacity="${a?.cheek === 'soft' ? 0.3 : 0.55}"/>`}
    <path d="M64 0 L${R - 1.8} 12 L${R - 1.3} 30 L${32 + g.j - 0.3} 40.5 L64 64 Z" fill="${c.lit}"/>
        ${f.stubble ? `<path d="M${L} 36 Q32 50 ${R} 36 L${R} 50 L${L} 50 Z" fill="${c.hair}" opacity="0.28"/>` : ''}
    ${hair.shaved ? `<path d="M${L - 1} 15 L${L + 4} 15 L${L + 3} 27 L${L - 1} 27 Z" fill="${c.hair}" opacity="0.3"/>${shavedInk}` : ''}
    <path d="M${L + 2} ${26.5 + eyeAt[1] - 29} Q28 ${25.6 + eyeAt[1] - 29} 30.4 ${27.6 + eyeAt[1] - 29} L28 ${28.2 + eyeAt[1] - 29} Z" fill="${c.midShade}"/>
    ${a ? skinMarks(a, c, op.age ?? 25) : ''}
  </g>

  ${a ? `${noseShape(a, c)}${eyeShape(-1, a, st, c, id)}${f.chrome === 'cybereye' || f.chrome === 'half' ? '' : eyeShape(1, a, st, c, id)}
  ${browShape(-1, a, st, c)}${browShape(1, a, st, c)}${mouthShape(a, st, c)}`
  : `<path d="M31.5 30 L30.1 35.4 L32.7 36.2 L31.6 34.9 Z" fill="${c.shade}"/>
  <path d="M32.9 33.6 L33.5 35.6 L32.7 36.2 Z" fill="${c.lit}" opacity="0.7"/>
  <path d="M30.6 36.3 h2.6" stroke="${c.lip}" stroke-width="0.7" stroke-linecap="round"/>
  ${eye(27.4, st.tired, c, st.expression)}${f.chrome === 'cybereye' || f.chrome === 'half' ? '' : eye(36.6, st.tired, c, st.expression)}
  ${browsAndMouth(st, c)}`}
  ${f.mask ? '' : a ? `<g transform="translate(0 ${(a.mouthY - 40).toFixed(2)})">${facialHairMarks(f, c, g, id)}</g>` : facialHairMarks(f, c, g, id)}
  ${markings(f, c, w)}
  ${f.chrome === 'half' ? `<g clip-path="url(#${id}h)">${halfFacePlate(f, c, g)}</g>` : ''}
  ${f.mask ? maskMarks(f, c, g, st, id) : ''}
  ${f.glasses && f.chrome !== 'cybereye' ? (a ? glassesAt(a, c) : `<g fill="${c.light}" fill-opacity="0.12" stroke="#0d0d0f" stroke-width="0.8"><rect x="24.3" y="27" width="6.2" height="4.2" rx="1.2"/><rect x="33.5" y="27" width="6.2" height="4.2" rx="1.2"/></g><path d="M30.5 28.6 h3" stroke="#0d0d0f" stroke-width="0.8"/>`) : ''}

  <g ${hairClip}>
  ${hair.top ? `<path d="${hair.top}" fill="${c.hair}" ${hair.thin ? 'opacity="0.6"' : ''}/>
    <g clip-path="url(#${id}t)">${f.splitDye ? `<rect x="0" y="0" width="32" height="64" fill="${f.splitDye}" ${hair.thin ? 'opacity="0.6"' : ''}/>` : ''}<path d="M${32 + w * 0.25} 0 L64 0 L64 30 L${32 + w * 0.6} 30 Z" fill="${c.hairLit}" opacity="0.75"/>${strands}
    ${hair.slick ? `<g stroke="${mix(c.hair, '#000', 0.35)}" stroke-width="0.5" fill="none"><path d="M${L + 2} 21 Q30 11 ${R - 2} 13"/><path d="M${L + 4} 19 Q32 12 ${R - 1} 17"/></g><path d="M${32 + w * 0.15} 11 Q${R - 2} 12 ${R - 0.8} 19" stroke="#fff" stroke-width="0.9" fill="none" opacity="0.35"/>` : ''}</g>` : ''}
  ${hair.curls ? `<g fill="${c.hairLit}" opacity="0.55">${[[R - 6, 11, 2.2], [R - 1.5, 16.5, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>` : ''}
  ${hair.bun && !hat ? `<circle cx="33" cy="4.5" r="4.4" fill="${c.hair}"/><path d="M34 0.6 A4.4 4.4 0 0 1 37.3 5.4 L34.5 4.5 Z" fill="${c.hairLit}" opacity="0.7"/>` : ''}
  ${!hair.top && !hair.curls ? `<path d="M${32 + w * 0.2} 12.5 Q${R - 1} 14 ${R - 0.6} 21" stroke="${c.lit}" stroke-width="1" fill="none" opacity="0.6"/>` : ''}
  </g>
  ${hat ? hatMarks(f, c, id) : ''}

  ${f.visor ? `<path d="M${L - 1} 26.2 L${R + 1} 25.8 L${R + 0.6} 31.2 L${L - 0.6} 31.6 Z" fill="#0b0f14"/><path d="M${L - 0.4} 27.2 L${R + 0.4} 26.8" stroke="${c.light}" stroke-width="0.6" opacity="${st.tired ? 0.35 : 0.85}"/><path d="M${R - 7} 29.6 h2 M${R - 4.4} 29.6 h1" stroke="${c.light}" stroke-width="0.5" opacity="0.6"/>` : ''}
  ${f.mask === 'faceplate' ? '' : chromeMarks(f, st.load, w, st.tired, eyeAt)}
  ${st.injured && f.mask !== 'faceplate' ? injuryMarks(severity, w) : ''}
</svg>`;
}

function svg(inner, { size, frame = '0 0 64 64' }) {
  return `<svg class="art" viewBox="${frame}" width="${size}" height="${size}" aria-hidden="true" focusable="false">${inner}</svg>`;
}

// --- Joss -------------------------------------------------------------------------------
const JOSS_FACE = {
  neutral: { eyes: 'M23 26 v4 M33 26 v4', mouth: 'M24 37 h8' },
  happy: { eyes: 'M21.5 28 q2 -2.5 4 0 M31.5 28 q2 -2.5 4 0', mouth: 'M23 35 q5 4 10 0' },
  worried: { eyes: 'M23 27 v3.5 M33 27 v3.5', brows: 'M21 23.5 l4 1.5 M35 23.5 l-4 1.5', mouth: 'M23.5 38 q4.5 -3 9 0' },
  smug: { eyes: 'M21.5 28 h4 M33 26 v4', mouth: 'M24 36 q6 2 9 -2' },
};
function jossFace(mood, dx = 0, dy = 0, scale = 1) {
  const f = JOSS_FACE[mood] ?? JOSS_FACE.neutral;
  // The face is drawn around (28, 31); scale it about that point, then move it onto the screen.
  return `<g transform="translate(${dx + 28} ${dy + 31}) scale(${scale}) translate(-28 -31)" fill="none" stroke="${ART.teal}" stroke-width="2.4" stroke-linecap="round">
    <g class="joss-eyes"><path d="${f.eyes}"/></g>${f.brows ? `<path d="${f.brows}" stroke-width="1.6"/>` : ''}<path d="${f.mouth}"/></g>`;
}

/**
 * Joss's icon. variant: 'handset' (a cracked second-hand phone with tape and a bent
 * antenna, as WORLD.md has it), 'bot' (a round little droid), 'relay' (a box of salvaged
 * relay boards with LED eyes). mood: neutral, happy, worried, smug.
 */
export function jossIcon({ variant = 'handset', mood = 'neutral', size = 36 } = {}) {
  if (variant === 'bot') {
    return svg(`
      <path d="M32 10 V4" stroke="${ART.muted}" stroke-width="2"/><circle class="joss-led" cx="32" cy="4" r="2.6" fill="${ART.pink}"/>
      <rect x="8" y="26" width="5" height="12" rx="2" fill="${ART.muted}"/><rect x="51" y="26" width="5" height="12" rx="2" fill="${ART.muted}"/>
      <circle cx="32" cy="33" r="21" fill="${ART.panel}" stroke="${ART.teal}" stroke-width="2"/>
      <rect x="17" y="22" width="30" height="21" rx="9" fill="#0f2a2c"/>
      ${jossFace(mood, 4, 1)}`, { size });
  }
  if (variant === 'relay') {
    return svg(`
      <path d="M14 52 C10 58 6 56 4 60 M50 52 C54 58 58 56 60 60" stroke="${ART.pink}" stroke-width="1.6" fill="none"/>
      <rect x="8" y="12" width="48" height="40" rx="5" fill="${ART.panel}" stroke="${ART.teal}" stroke-width="2"/>
      <path d="M12 46 h40 M12 18 h8 M44 18 h8" stroke="${ART.muted}" stroke-width="1" opacity="0.6"/>
      <rect x="15" y="22" width="34" height="20" rx="3" fill="#0f2a2c"/>
      ${jossFace(mood, 4, 0)}
      <circle class="joss-led" cx="50" cy="48" r="1.8" fill="${ART.pink}"/>`, { size });
  }
  // handset
  return svg(`
    <path d="M42 8 L47 2" stroke="${ART.muted}" stroke-width="2" stroke-linecap="round"/><circle class="joss-led" cx="47.5" cy="2.5" r="2" fill="${ART.pink}"/>
    <rect x="14" y="7" width="36" height="54" rx="7" fill="${ART.panel}" stroke="${ART.teal}" stroke-width="2"/>
    <rect x="18" y="13" width="28" height="36" rx="3" fill="#0f2a2c"/>
    <path d="M38 13 L34 21 L39 26 L35 33" stroke="${ART.muted}" stroke-width="0.9" fill="none" opacity="0.7"/>
    <rect x="10" y="40" width="14" height="5" rx="1" transform="rotate(-28 17 42)" fill="${ART.warn}" opacity="0.85"/>
    <circle cx="32" cy="55" r="2.2" fill="none" stroke="${ART.muted}" stroke-width="1.2"/>
    ${jossFace(mood, 4, 0, 1.3)}`, { size });
}

// --- Gear ---------------------------------------------------------------------------------
// Items drawn like the faces (2026-10-28, owner's design session): flat colour, hard light from
// the right, no outlines, the city light on the top edges. One drawing per item type, in a 96×32
// frame, muzzle or front to the right; only the tier, the light and the neon accent change. The
// same drawing goes in the armoury, in a gear slot and on the portrait. Items without a drawing
// yet keep their line icon (ui/icons.js). See ART.md, Gear.

/** The city light that falls on this person (their portrait's, and their gear's). */
export const lightOf = (op) => CITY_LIGHT[hash(`${op.id}|light`) % CITY_LIGHT.length];

const STASH_LIGHT = '#f2b544'; // sodium: the safehouse's own lamp, for gear nobody carries

/** The rifle's shapes in its 96×32 frame. pro: carbon with a neon line; street: gunmetal and wood. */
function rifleShapes({ tier, light, neon }) {
  const pro = tier === 'pro';
  const metal = pro ? '#1d2129' : '#454c57';
  const dark = pro ? '#121519' : '#2b3038';
  const lit = (c, t = 0.45) => mix(c, light, t);
  const shade = (c) => mix(c, SHADOW, 0.45);
  const stock = pro ? '#272c35' : '#6b4a2e';
  const sling = pro ? '#1a1d24' : '#3a3125';
  return [
    // Stock: old wood on the street rifle (with grain), skeleton polymer with a thumbhole on the pro.
    `<path d="M6 12.6 L12 12 L25 13.6 L25 19.4 L19 19.8 L13 21.4 L6 21.8 Z" fill="${stock}"/>`,
    `<path d="M6 12.6 L12 12 L25 13.6 L25 14.4 L12 12.9 L6 13.5 Z" fill="${lit(stock, 0.5)}"/>`,
    `<path d="M6 21.8 L13 21.4 L19 19.8 L25 19.4 L25 18.6 L19 19 L13 20.6 L6 21 Z" fill="${shade(stock)}"/>`,
    pro ? '<path d="M12.5 15.2 Q16 14.6 19.5 15.6 L19 18.2 Q15.8 18.4 13 18.8 Z" fill="#0d1016" opacity="0.85"/>'
      : `<path d="M8 15 Q15 14.2 23 15.4 M8 17.6 Q15 17 22 18" stroke="${shade(stock)}" stroke-width="0.35" fill="none" opacity="0.8"/>`,
    `<rect x="5.2" y="12.4" width="1.6" height="9.6" rx="0.4" fill="${dark}"/>`,
    `<rect x="12.5" y="10.6" width="8.5" height="2" rx="0.8" fill="${pro ? dark : stock}"/><rect x="12.5" y="10.6" width="8.5" height="0.6" rx="0.3" fill="${lit(pro ? dark : stock, 0.5)}"/>`,
    // Grip (taped on the street rifle), trigger guard, magazine.
    `<path d="M29.6 19 L34 19 L32.4 25.4 L28.6 25.2 Z" fill="${dark}"/>`,
    pro ? '' : '<path d="M29.4 21 L33.4 21.2 M29 22.6 L33 22.8 M28.8 24.2 L32.6 24.3" stroke="#f2b544" stroke-width="0.5" opacity="0.55"/>',
    `<path d="M34.4 19.2 Q35 21.8 37.6 21.6" stroke="${dark}" stroke-width="0.7" fill="none"/>`,
    `<path d="M37.6 19 L41.4 19 L42 24.6 L38.2 25 Z" fill="${dark}"/><path d="M41.4 19 L42 24.6 L41.2 24.7 L40.7 19 Z" fill="${lit(dark, 0.4)}"/>`,
    // Receiver and bolt.
    `<rect x="25" y="13.2" width="19" height="6" fill="${metal}"/><rect x="25" y="13.2" width="19" height="1" fill="${lit(metal)}"/><rect x="25" y="18.2" width="19" height="1" fill="${shade(metal)}"/>`,
    `<path d="M28 16 h7 M37 16 h5" stroke="${shade(metal)}" stroke-width="0.4"/>`,
    `<path d="M40.6 14 L43 11.4" stroke="${metal}" stroke-width="0.9" stroke-linecap="round"/><circle cx="43.2" cy="11.2" r="1" fill="${lit(metal, 0.5)}"/>`,
    // Vented handguard, barrel, suppressor, folded bipod.
    `<rect x="44" y="13.8" width="18" height="4.6" fill="${pro ? metal : dark}"/><rect x="44" y="13.8" width="18" height="0.8" fill="${lit(pro ? metal : dark)}"/>`,
    [46, 49.5, 53, 56.5].map((x) => `<rect x="${x}" y="15.3" width="2.2" height="1.4" rx="0.5" fill="#0d1016" opacity="0.8"/>`).join(''),
    `<rect x="62" y="15.2" width="19" height="1.8" fill="${metal}"/><rect x="62" y="15.2" width="19" height="0.55" fill="${lit(metal)}"/>`,
    `<rect x="81" y="14.3" width="11" height="3.6" rx="0.7" fill="${dark}"/><rect x="81" y="14.3" width="11" height="0.9" rx="0.45" fill="${lit(dark, 0.5)}"/>`,
    `<path d="M83 16.6 h7" stroke="${shade(dark)}" stroke-width="0.4"/>`,
    `<path d="M52 18.4 L61.5 19.6 M52 18.9 L61 20.3" stroke="${dark}" stroke-width="0.6"/>`,
    // Scope: rings, tube, objective bell, eyepiece, and the lens catching the light.
    `<rect x="29.6" y="10.8" width="1.6" height="2.6" fill="${dark}"/><rect x="38.4" y="10.8" width="1.6" height="2.6" fill="${dark}"/>`,
    `<rect x="26.4" y="7.8" width="17.6" height="3.2" rx="1.5" fill="${dark}"/><rect x="26.4" y="7.8" width="17.6" height="0.9" rx="0.45" fill="${lit(dark, 0.55)}"/>`,
    `<path d="M44 7.4 L48.6 6.6 L48.6 12.2 L44 11.4 Z" fill="${dark}"/><path d="M44 7.4 L48.6 6.6 L48.6 7.5 L44 8.1 Z" fill="${lit(dark, 0.55)}"/>`,
    `<rect x="24.4" y="8" width="2.4" height="2.8" rx="0.6" fill="${dark}"/>`,
    `<rect x="48" y="6.9" width="0.9" height="5" rx="0.4" fill="${light}"/>`,
    pro ? `<path d="M25.6 17.6 H43.4 M44.6 17.6 H61.4" stroke="${neon}" stroke-width="0.5"/><rect x="32" y="8.9" width="5" height="0.7" fill="${neon}"/><circle cx="27.4" cy="16" r="0.7" fill="${neon}"/>` : '',
    // The sling, hanging below.
    `<path d="M15 21.4 Q34 31 54 18.6" stroke="${sling}" stroke-width="1.4" fill="none"/><path d="M15 21 Q34 30.4 54 18.2" stroke="${lit(sling, 0.3)}" stroke-width="0.35" fill="none"/>`,
  ].join('');
}

const GEAR_SHAPES = { rifle: rifleShapes };

/** True when this item type has a drawing (otherwise the UI shows its line icon). */
export const hasGearArt = (type) => !!GEAR_SHAPES[type];

/**
 * An item's drawing as an SVG string, or null if it has none yet. carrier: the person carrying
 * it (their light and chrome colour); without one it sits under the safehouse's sodium lamp.
 */
export function gearArt(item, { carrier = null, width = 96 } = {}) {
  const shapes = GEAR_SHAPES[item.type];
  if (!shapes) return null;
  const light = carrier ? lightOf(carrier) : STASH_LIGHT;
  const neon = carrier ? faceOf(carrier).chromeColor : '#3de8d8';
  const id = `ga${++uid}`;
  return `<svg class="art gearart" viewBox="0 0 96 32" width="${width}" height="${Math.round((width * 32) / 96)}" aria-hidden="true" focusable="false">
  <defs><linearGradient id="${id}" x1="1" x2="0"><stop offset="0" stop-color="${light}" stop-opacity="0.2"/><stop offset="0.35" stop-color="${light}" stop-opacity="0.09"/><stop offset="0.75" stop-color="${light}" stop-opacity="0.02"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></linearGradient></defs>
  <rect width="96" height="32" fill="#0d1016"/><rect width="96" height="32" fill="url(#${id})"/>
  ${shapes({ tier: item.tier ?? 'street', light, neon })}</svg>`;
}

// What shows on a portrait: one item at a time (owner's call), the most telling first. Only the
// rifle has a drawing so far; it hangs across the back, stock low on the left, muzzle up behind
// the right shoulder, with its sling across the chest.
const ON_PORTRAIT = ['rifle'];

function portraitGear(op, c, f) {
  const item = Object.values(op.gear ?? {}).filter(Boolean).find((i) => ON_PORTRAIT.includes(i.type));
  if (!item) return { back: '', front: '' };
  const tier = item.tier ?? 'street';
  const sling = tier === 'pro' ? '#1a1d24' : '#3a3125';
  return {
    back: `<g class="gear-rifle" transform="translate(4 72) rotate(-44) scale(0.9) translate(0 -16)">${rifleShapes({ tier, light: c.light, neon: f.chromeColor })}</g>`,
    front: `<path d="M46 48.5 L18 57" stroke="${sling}" stroke-width="1.8"/><path d="M46 47.8 L18 56.3" stroke="${mix(sling, c.light, 0.35)}" stroke-width="0.4"/>`,
  };
}
