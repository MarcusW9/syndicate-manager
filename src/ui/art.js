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
const SHAOLIN_ODDS = { hk: 0.04, southeast_asian: 0.03 };

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
  // Shaolin warrior monks (added 2026-10-28): leaning East and Southeast Asian, anyone can be one.
  const shaolin = !monk && r.chance(SHAOLIN_ODDS[cultureOf(op.name)] ?? 0.004);
  const g = { ...f, monk, halfFace, mask, headwear, facialHair };
  if (monk) Object.assign(g, { hair: 'bald', splitDye: null, earring: false, facialHair: null, headwear: monkHat ? 'douli' : null });
  // A Shaolin monk shows the whole face: shaved crown with its ordination dots, no mask, hat or glasses.
  if (shaolin) return { ...g, monk: 'shaolin', halfFace: false, hair: 'bald', splitDye: null, earring: false, facialHair: null, headwear: null, mask: null, glasses: false, visor: false };
  // Half the face is chrome: it replaces any other chrome, and the lens takes the lit eye.
  if (halfFace) Object.assign(g, { chrome: 'half', glasses: false, visor: false });
  // A full mask takes the place of any lower-face mask, glasses and visor; a faceplate covers chrome too.
  if (fullMask) Object.assign(g, { mask: fullMask, glasses: false, visor: false });
  return g;
}

// Anatomy (2026-10-28): the face itself varies, not just what's around it. Eyes, brows,
// nose, mouth, jaw, ears and neck come from continuous measurements on a third seed
// (`id|name|face`), so hair, chrome and gear keep their picks. portrait(op, { anatomy: false })
// still draws the earlier shared face, for comparison sheets.
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

// --- career marks (core/marks.js) ---------------------------------------------------------
// The game records that a mark happened; where it sits comes from the person's own seed, so
// a scar never moves. Drawn on the anatomy face only.
const SCAR_SITES = ['cheek', 'brow', 'lip', 'chin', 'nose', 'litcheek'];

function scarSites(op, f, n) {
  const sites = [];
  for (let i = 0; sites.length < n; i++) {
    const s = SCAR_SITES[hash(`${op.id}|${op.name}|scar${i}`) % SCAR_SITES.length];
    // Not under the half-chrome plate, and not beside the scar some faces start with.
    const clash = (s === 'litcheek' && f.chrome === 'half') || (s === 'brow' && ['scar', 'cut'].includes(f.marking));
    if (i > 40 || (!sites.includes(s) && !clash)) sites.push(s);
  }
  return sites;
}

/** Healed scars: a pale raised line with stitch marks, at each person's own spots. */
function scarMarks(sites, a, g, c) {
  const L = 32 - g.w, R = 32 + g.w;
  const scar = mix(c.skin, '#ffe0dc', 0.5), edge = mix(c.skin, '#2a1210', 0.45), stitch = edge;
  // A raised line: a dark edge below, the pale scar on top, stitch marks across it.
  const line = (x1, y1, x2, y2, ticks = 2) => {
    let d = `<path d="M${x1 + 0.3} ${y1 + 0.4} L${x2 + 0.3} ${y2 + 0.4}" stroke="${edge}" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
      <path d="M${x1} ${y1} L${x2} ${y2}" stroke="${scar}" stroke-width="1.05" stroke-linecap="round"/>`;
    const nx = -(y2 - y1), ny = x2 - x1, len = Math.hypot(nx, ny) || 1;
    for (let k = 1; k <= ticks; k++) {
      const t = k / (ticks + 1), x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      d += `<path d="M${x - (nx / len) * 0.85} ${y - (ny / len) * 0.85} L${x + (nx / len) * 0.85} ${y + (ny / len) * 0.85}" stroke="${stitch}" stroke-width="0.3" opacity="0.8"/>`;
    }
    return d;
  };
  const ex = 32 - a.eyeGap;
  return sites.map((s) => {
    switch (s) {
      // Through the brow: the hair doesn't grow back, so the brow has a gap.
      case 'brow': return `<path d="M${ex - 0.2} ${a.eyeY - 6} L${ex + 0.5} ${a.eyeY - 1.6}" stroke="${c.shade}" stroke-width="1.1"/>${line(ex - 0.2, a.eyeY - 6.2, ex + 0.5, a.eyeY - 1.6, 1)}`;
      case 'lip': return line(32.9, a.mouthY - 3, 33.5, a.mouthY + 1.3, 1);
      case 'chin': return line(30.2, g.chin - 2.4, 33.4, g.chin - 1.5, 2);
      case 'nose': return line(30.4, a.eyeY + 1.9, 33.6, a.eyeY + 3, 1);
      case 'litcheek': return line(R - 5, a.eyeY + 2.4, R - 2.2, a.eyeY + 7, 2);
      default: return line(L + 2.6, a.eyeY + 2.2, L + 6.4, a.eyeY + 6.8, 3);
    }
  }).join('');
}

/** Chrome added on the job, on the shadow side (bought chrome sits on the lit side). */
function implantMarks(n, f, g, a, load) {
  const L = 32 - g.w, col = f.chromeColor, glow = 0.5 + load * 0.5;
  const halo = (x, y) => (load > 0.4 ? `<circle cx="${x}" cy="${y}" r="${2.5 + load * 4}" fill="${col}" opacity="${(load - 0.3) * 0.4}"/>` : '');
  let d = `${halo(L + 3.6, 25.4)}<rect x="${L + 0.2}" y="19.2" width="1.6" height="1.6" fill="#2b3038" stroke="${col}" stroke-width="0.3" opacity="${glow}"/>
    <path d="M${L + 1} 20.8 L${L + 1.6} 24 L${L + 3.6} 25.4" stroke="${col}" stroke-width="0.5" fill="none" stroke-linejoin="round" opacity="${glow}"/>
    <circle cx="${L + 3.6}" cy="25.4" r="0.55" fill="${col}" opacity="${glow}"/>`;
  if (n > 1) {
    const [x1, y1, x2, y2] = [L + 1.4, a.eyeY + 4.5, 32 - g.j - 0.6, 38.4];
    d += [0.15, 0.5, 0.85].map((t) => `<circle cx="${x1 + (x2 - x1) * t}" cy="${y1 + (y2 - y1) * t}" r="0.55" fill="#2b3038" stroke="${col}" stroke-width="0.3"/><circle cx="${x1 + (x2 - x1) * t}" cy="${y1 + (y2 - y1) * t}" r="0.22" fill="${col}" opacity="${glow}"/>`).join('');
  }
  return d;
}

/** The crew's mark: a small neon lantern (the city is Lantern Bay) under the shadow-side eye. */
function crewMark(a, c) {
  const x = 32 - a.eyeGap + 0.4, y = a.eyeY + 4.2;
  return `<g stroke="${c.light}" stroke-width="0.4" fill="none" opacity="0.9" stroke-linecap="round">
    <path d="M${x - 0.5} ${y - 1.4} h1 M${x - 0.5} ${y + 1.4} h1 M${x} ${y + 1.4} v0.9"/>
    <rect x="${x - 0.85}" y="${y - 1.1}" width="1.7" height="2.2" rx="0.7"/></g>`;
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
  // The lens sits where the lit eye is (anatomy moves it; the earlier shared face never does).
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
  const robe = { grey: '#6b6f78', ochre: '#5e4630', cyber: '#22252d', shaolin: '#c8681c' }[f.monk];
  return `<path d="M6 64 C8 52 18 47 32 47 C46 47 56 52 58 64 Z" fill="${robe}"/>
    <g clip-path="url(#${id}s)"><path d="M64 44 L40 47 L46 64 L64 64 Z" fill="${mix(robe, c.light, 0.32)}"/>
    ${f.monk === 'ochre' ? `<path d="M6 64 C8 52 18 47 27.5 47 L46 64 Z" fill="#b06a24"/><path d="M14 52 L22 64 M20 49 L31 64" stroke="#8a4f17" stroke-width="0.5"/>` : ''}</g>`;
}
function monkCollar(f, c) {
  const band = { grey: '#33363d', ochre: '#3f2f20', cyber: '#16181e', shaolin: '#7a3410' }[f.monk];
  const edge = f.monk === 'cyber' ? f.chromeColor : mix(band, '#000', 0.3);
  // The Shaolin mala is heavier: fewer, bigger, darker beads.
  const big = f.monk === 'shaolin', n = big ? 10 : 12;
  const beads = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.PI * (0.08 + 0.84 * (i / n));
    beads.push([32 - Math.cos(t) * 7.6, 45.8 + Math.sin(t) * 5]);
  }
  // Crossed collar, left over right, then the mala hanging over it (all inside the crop).
  return `<path d="M37.4 46.2 L35.4 45.8 L31.6 49.4 L32.6 51 Z" fill="${band}" stroke="${edge}" stroke-width="0.35"/>
    <path d="M26.2 46.2 L28.8 45.6 L37.6 53 L34.4 53 Z" fill="${band}" stroke="${edge}" stroke-width="0.35"/>
    ${beads.map(([x, y], i) => `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${big ? 1.2 : 0.95}" fill="${f.monk === 'cyber' && i % 3 === 0 ? f.chromeColor : big ? '#3a2214' : '#7a4a2a'}"/>`).join('')}
    ${beads.map(([x, y]) => `<circle cx="${(x + 0.3).toFixed(2)}" cy="${(y - 0.3).toFixed(2)}" r="0.3" fill="#fff" opacity="0.3"/>`).join('')}`;
}

/** Ordination dots on a Shaolin monk's crown: nine small scars in three rows. */
function jieba(c) {
  const dots = [];
  for (const [y, xs] of [[12.6, [30.2, 32, 33.8]], [14.4, [30, 32, 34]], [16.2, [29.8, 32, 34.2]]]) for (const x of xs) dots.push([x, y]);
  return dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.58" fill="${mix(c.skin, '#f3e2d6', 0.55)}"/><circle cx="${x}" cy="${y + 0.25}" r="0.58" fill="none" stroke="${c.midShade}" stroke-width="0.2" opacity="0.6"/>`).join('');
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

/** Glasses sized to this person's eyes. */
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
export function portrait(op, { size = 44, anatomy = true } = {}) {
  const f = faceOf(op);
  const st = stateOf(op);
  const severity = op.condition?.injury;
  const c = palette(f, op);
  const a = anatomy ? anatomyOf(op) : null;
  const g = a ? reshape(HEAD_SHAPES[f.shape], a) : HEAD_SHAPES[f.shape];
  const eyeAt = a ? [32 + a.eyeGap, a.eyeY] : [36.6, 29];
  const nk = a?.neck, ear = a?.ear, earOut = a?.earOut;
  const markCount = (kind) => (op.marks ?? []).filter((m) => m.kind === kind).length;
  const scars = a ? scarSites(op, f, Math.min(3, markCount('scar'))) : [];
  const implants = Math.min(2, markCount('implant')), tattooed = markCount('tattoo') > 0;
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
  ${a ? `<path d="M${32 - nk} 37 L${32 - nk} 48 Q32 51 ${32 + nk} 48 L${32 + nk} 37 Z" fill="${c.shade}"/><path d="M${32 + nk - 1.8} 38 L${32 + nk} 37 L${32 + nk} 48 L${32 + nk - 1.8} 49 Z" fill="${c.lit}" opacity="0.8"/>` : `<path d="M27.6 37 L27.6 48 Q32 51 36.4 48 L36.4 37 Z" fill="${c.shade}"/><path d="M34.6 38 L36.4 37 L36.4 48 L34.6 49 Z" fill="${c.lit}" opacity="0.8"/>`}
  ${f.monk ? monkCollar(f, c) : ''}

  ${a ? `<ellipse cx="${L + 0.3 - earOut}" cy="30" rx="${1.9 * ear}" ry="${3.4 * ear}" fill="${c.shade}"/>
  <ellipse cx="${R - 0.3 + earOut}" cy="30" rx="${1.9 * ear}" ry="${3.4 * ear}" fill="${c.skin}"/><path d="M${R + 0.6 + earOut} ${30 - 2.5 * ear} Q${R + 1.5 * ear + earOut} 30 ${R + 0.4 + earOut} ${30 + 3 * ear}" stroke="${c.lit}" stroke-width="0.9" fill="none"/>` : `<ellipse cx="${L + 0.3}" cy="30" rx="1.9" ry="3.4" fill="${c.shade}"/>
  <ellipse cx="${R - 0.3}" cy="30" rx="1.9" ry="3.4" fill="${c.skin}"/><path d="M${R + 0.6} 27.5 Q${R + 1.5} 30 ${R + 0.4} 33" stroke="${c.lit}" stroke-width="0.9" fill="none"/>`}
  ${f.earring ? `<circle cx="${R}" cy="34" r="0.9" fill="#f2b544"/>` : ''}

  <path d="${head}" fill="${c.skin}"/>
  <g clip-path="url(#${id}h)">
    <path d="M0 0 L${32 - w * 0.12} 9 C${32 - w * 0.55} 20 ${32 - w * 0.48} 31 ${30.5} 48 L0 64 Z" fill="${c.shade}"/>
    ${a?.cheek === 'high' ? `<path d="M${32 + w * 0.25} 33 L${R - 0.8} 29.8 L${32 + g.j + 1} 37.6 Z" fill="${c.midShade}" opacity="0.75"/>`
      : `<path d="M${32 + w * 0.3} 34.5 L${R - 0.8} 31.5 L${32 + g.j + 1} 39 Z" fill="${c.midShade}" opacity="${a?.cheek === 'soft' ? 0.3 : 0.55}"/>`}
    <path d="M64 0 L${R - 1.8} 12 L${R - 1.3} 30 L${32 + g.j - 0.3} 40.5 L64 64 Z" fill="${c.lit}"/>
        ${f.stubble ? `<path d="M${L} 36 Q32 50 ${R} 36 L${R} 50 L${L} 50 Z" fill="${c.hair}" opacity="0.28"/>` : ''}
    ${f.monk === 'shaolin' ? jieba(c) : ''}
    ${hair.shaved ? `<path d="M${L - 1} 15 L${L + 4} 15 L${L + 3} 27 L${L - 1} 27 Z" fill="${c.hair}" opacity="0.3"/>${shavedInk}` : ''}
    <g ${a ? `transform="translate(0 ${eyeAt[1] - 29})"` : ''}><path d="M${L + 2} 26.5 Q28 25.6 30.4 27.6 L28 28.2 Z" fill="${c.midShade}"/></g>
    ${a ? skinMarks(a, c, op.age ?? 25) : ''}
    ${a && scars.length && f.mask !== 'faceplate' ? scarMarks(scars, a, g, c) : ''}
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
  ${a && tattooed && f.mask !== 'faceplate' ? crewMark(a, c) : ''}
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
  ${a && implants && f.mask !== 'faceplate' ? implantMarks(implants, f, g, a, st.load) : ''}
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

// --- rifle looks (2026-10-29) -----------------------------------------------------------
// A kit of parts: a frame (the silhouette), a finish (materials and colours), an engraving and
// a charm. Which parts exist, their names and the odds are data (data/gearLooks.js); core/looks.js
// rolls each rifle's look; these are the drawings. An item without a look keeps the drawing
// above. Same 96×32 frame, muzzle right, lit from the right.

export const RIFLE_FINISHES = {
  street: { stock: '#6b4a2e', metal: '#454c57', dark: '#2b3038', guard: 'dark', grain: true, tape: true },
  carbon: { stock: '#272c35', metal: '#1d2129', dark: '#121519', guard: 'metal', skeleton: true, neonLine: true },
  rosewood: { stock: '#5a2a1c', metal: '#a07c44', dark: '#2e2420', guard: 'stock', grain: true, inlay: '#e9e1cc' },
  cinnabar: { stock: '#a8261e', metal: '#1b1b20', dark: '#121216', guard: 'stock', gloss: true, trim: '#d9a441' },
  jade: { stock: '#3d8a68', metal: '#7a5c34', dark: '#2a2620', guard: 'stock', gloss: true, veins: '#9ad8b8' },
  bamboo: { stock: '#b8995a', metal: '#3a3f47', dark: '#24282e', guard: 'stock', nodes: true },
  bronze: { stock: '#4a3a2a', metal: '#8a6a3c', dark: '#3a3024', guard: 'metal', patina: '#6fa08a', trim: '#c9a24a' },
  blackgold: { stock: '#16171b', metal: '#202127', dark: '#0f1013', guard: 'metal', gloss: true, trim: '#c9a24a' },
  ceramic: { stock: '#d8dce2', metal: '#aeb5bf', dark: '#353a43', guard: 'stock', neonLine: true },
  candy: { stock: '#ff4f7b', metal: '#2a2d36', dark: '#191b21', guard: 'stock', gloss: true },
  urban: { stock: '#5b616b', metal: '#3a3f47', dark: '#24282e', guard: 'stock', camo: ['#7b818b', '#3e434c', '#9aa0a8'] },
  rust: { stock: '#4b4f3b', metal: '#6b4733', dark: '#3a2a22', guard: 'dark', chips: true, tape: true },
};

/**
 * Frames: the parts of each silhouette. role picks the colour (stock, guard, metal, dark);
 * box is [x0, y0, x1, y1] for the lit top edge and shaded bottom edge. Anchors place charms:
 * tail (the back of the stock, for things that hang), face (flat on the stock), swivel (the
 * front sling swivel).
 */
const rect = (x, y, w, h) => ({ d: `M${x} ${y} H${x + w} V${y + h} H${x} Z`, box: [x, y, x + w, y + h] });
export const RIFLE_FRAMES = {
  marksman: {
    parts: [
      { role: 'stock', d: 'M6 12.6 L12 12 L25 13.6 L25 19.4 L19 19.8 L13 21.4 L6 21.8 Z', box: [6, 12, 25, 21.8] },
      { role: 'dark', ...rect(5.2, 12.4, 1.6, 9.6) },
      { role: 'stock', ...rect(12.5, 10.6, 8.5, 2) },
      { role: 'dark', d: 'M29.6 19 L34 19 L32.4 25.4 L28.6 25.2 Z', box: [28.6, 19, 34, 25.4], grip: true },
      { role: 'dark', d: 'M37.6 19 L41.4 19 L42 24.6 L38.2 25 Z', box: [37.6, 19, 42, 25] },
      { role: 'metal', ...rect(25, 13.2, 19, 6), receiver: true },
      { role: 'guard', ...rect(44, 13.8, 18, 4.6), handguard: true },
      { role: 'metal', ...rect(62, 15.2, 19, 1.8) },
      { role: 'dark', ...rect(81, 14.3, 11, 3.6) },
      { role: 'dark', ...rect(26.4, 7.8, 17.6, 3.2) },
      { role: 'dark', d: 'M44 7.4 L48.6 6.6 L48.6 12.2 L44 11.4 Z', box: [44, 6.6, 48.6, 12.2] },
      { role: 'dark', ...rect(24.4, 8, 2.4, 2.8) },
    ],
    extra: (c) => `<path d="M34.4 19.2 Q35 21.8 37.6 21.6" stroke="${c.dark}" stroke-width="0.7" fill="none"/>
      <path d="M40.6 14 L43 11.4" stroke="${c.metal}" stroke-width="0.9" stroke-linecap="round"/><circle cx="43.2" cy="11.2" r="1" fill="${c.lit(c.metal, 0.5)}"/>
      ${[46, 49.5, 53, 56.5].map((x) => `<rect x="${x}" y="15.3" width="2.2" height="1.4" rx="0.5" fill="#0d1016" opacity="0.8"/>`).join('')}
      <path d="M83 16.6 h7" stroke="${c.shade(c.dark)}" stroke-width="0.4"/><path d="M52 18.4 L61.5 19.6 M52 18.9 L61 20.3" stroke="${c.dark}" stroke-width="0.6"/>
      <rect x="29.6" y="10.8" width="1.6" height="2.6" fill="${c.dark}"/><rect x="38.4" y="10.8" width="1.6" height="2.6" fill="${c.dark}"/>
      <rect x="48" y="6.9" width="0.9" height="5" rx="0.4" fill="${c.light}"/>`,
    sling: [15, 21.4, 54, 18.6], neon: 'M25.6 17.6 H43.4 M44.6 17.6 H61.4',
    anchors: { tail: [6.4, 21.6], face: [17, 16.4], swivel: [52.6, 19] },
  },
  carbine: {
    parts: [
      { role: 'metal', ...rect(16, 14, 10, 2.4) },
      { role: 'stock', d: 'M12 12.8 L17 12.4 L17 21.2 L12 21.6 Z', box: [12, 12.4, 17, 21.6] },
      { role: 'stock', d: 'M17 12.4 L24 13.2 L24 15 L17 14.6 Z', box: [17, 12.4, 24, 15] },
      { role: 'dark', d: 'M30 19.2 L34.2 19.2 L32.6 25.6 L28.8 25.4 Z', box: [28.8, 19.2, 34.2, 25.6], grip: true },
      { role: 'dark', d: 'M37.4 19.2 L41.6 19.2 Q42.6 23 44.6 26.4 L40.6 27.4 Q38.8 23.6 37.4 19.2 Z', box: [37.4, 19.2, 44.6, 27.4] },
      { role: 'metal', ...rect(26, 13, 18, 6.2), receiver: true },
      { role: 'guard', ...rect(44, 13.4, 16, 5), handguard: true },
      { role: 'metal', ...rect(60, 15.2, 10, 1.8) },
      { role: 'dark', ...rect(70, 14.6, 5, 3) },
      { role: 'dark', ...rect(30, 10.8, 8, 2.4) },
      { role: 'dark', d: 'M31 10.8 L31 7.6 Q34 6.4 37 7.6 L37 10.8 Z', box: [31, 6.6, 37, 10.8] },
    ],
    extra: (c) => `<path d="M34.6 19.4 Q35.2 22 37.6 21.8" stroke="${c.dark}" stroke-width="0.7" fill="none"/>
      ${[46, 50, 54].map((x) => `<rect x="${x}" y="15.4" width="3" height="1.1" rx="0.5" fill="#0d1016" opacity="0.8"/>`).join('')}
      ${[71, 72.6, 74].map((x) => `<rect x="${x}" y="15.4" width="0.5" height="1.4" fill="#0d1016"/>`).join('')}
      <rect x="57.4" y="11" width="0.9" height="2.4" fill="${c.dark}"/><circle cx="36.4" cy="9" r="1" fill="${c.light}" opacity="0.8"/><circle cx="34" cy="9" r="0.4" fill="#ff3d5f"/>`,
    sling: [17, 21, 52, 18.6], neon: 'M26.6 17.8 H43.4 M44.6 17.8 H59.4',
    anchors: { tail: [12.6, 21.4], face: [52, 15.8], swivel: [50.4, 18.6] },
  },
  bullpup: {
    parts: [
      { role: 'dark', ...rect(7.2, 12, 1.6, 10) },
      { role: 'stock', d: 'M8 12.4 L14 11.6 L50 12.4 Q54 12.8 54 15 L54 19.6 L44 20.4 L40 21 L26 21.4 L14 22 L8 22 Z', box: [8, 11.6, 54, 22], handguard: true }, // the shell is both
      { role: 'dark', d: 'M18 21.6 L23 21.4 L23.6 27.6 L18.6 27.8 Z', box: [18, 21.4, 23.6, 27.8] },
      { role: 'dark', d: 'M36 20.8 L40.4 20.8 L38.8 27 L35 26.8 Z', box: [35, 20.8, 40.4, 27], grip: true },
      { role: 'metal', ...rect(54, 15.3, 16, 1.8) },
      { role: 'dark', ...rect(70, 13.8, 7, 4.4) },
      { role: 'dark', ...rect(22, 8.2, 22, 3) },
      { role: 'dark', d: 'M44 7.8 L48 7 L48 12 L44 11.2 Z', box: [44, 7, 48, 12] },
    ],
    extra: (c) => `<rect x="24" y="14.4" width="6" height="1.6" fill="${c.dark}"/><path d="M40.8 21 Q41.4 23.6 44 23.4" stroke="${c.dark}" stroke-width="0.7" fill="none"/>
      <rect x="25" y="11" width="1.6" height="1.6" fill="${c.dark}"/><rect x="38" y="11" width="1.6" height="1.6" fill="${c.dark}"/>
      ${[71.4, 73.2, 75].map((x) => `<rect x="${x}" y="14.8" width="0.7" height="2.4" fill="#0d1016"/>`).join('')}
      <rect x="47.4" y="7.4" width="0.8" height="4.4" rx="0.4" fill="${c.light}"/>`,
    sling: [10, 21.6, 50, 20], neon: 'M14 19.6 H52',
    anchors: { tail: [9, 21.8], face: [30, 17], swivel: [48, 20.2] },
  },
  heavy: {
    parts: [
      { role: 'stock', d: 'M5 11.8 L12 11.2 L25 12.8 L25 20.2 L19 20.8 L13 22.6 L5 23 Z', box: [5, 11.2, 25, 23] },
      { role: 'dark', ...rect(4.2, 11.6, 1.6, 11.6) },
      { role: 'dark', d: 'M29.6 20 L34 20 L32.4 26.4 L28.6 26.2 Z', box: [28.6, 20, 34, 26.4], grip: true },
      { role: 'dark', ...rect(37.6, 20, 8, 7.6) },
      { role: 'metal', ...rect(25, 12.6, 21, 7.4), receiver: true },
      { role: 'guard', ...rect(46, 13.4, 18, 5.2), handguard: true },
      { role: 'metal', ...rect(64, 14.9, 20, 2.4) },
      { role: 'dark', ...rect(84, 13, 8, 6.2) },
      { role: 'dark', ...rect(22, 5.6, 24, 3.8) },
      { role: 'dark', d: 'M46 5 L52 4 L52 11 L46 10 Z', box: [46, 4, 52, 11] },
    ],
    extra: (c) => `<path d="M34.4 20.2 Q35 22.8 37.6 22.6" stroke="${c.dark}" stroke-width="0.7" fill="none"/>
      ${[48, 52, 56, 60].map((x) => `<rect x="${x}" y="15.2" width="2.4" height="1.6" rx="0.5" fill="#0d1016" opacity="0.8"/>`).join('')}
      ${[85.6, 88, 90.4].map((x) => `<rect x="${x}" y="13.8" width="0.9" height="4.6" fill="#0d1016"/>`).join('')}
      <rect x="27" y="9.4" width="1.8" height="3.2" fill="${c.dark}"/><rect x="41" y="9.4" width="1.8" height="3.2" fill="${c.dark}"/><rect x="33.4" y="4" width="2.2" height="1.8" fill="${c.dark}"/>
      <path d="M54 18.6 L65 20 M54 19.2 L64.4 20.8" stroke="${c.dark}" stroke-width="0.8"/><rect x="51.4" y="4.4" width="0.9" height="6.2" rx="0.4" fill="${c.light}"/>`,
    sling: [15, 22.4, 56, 19], neon: 'M25.6 19 H45.4 M46.6 18.2 H63.4',
    anchors: { tail: [5.6, 22.8], face: [15, 17], swivel: [54.6, 19.6] },
  },
  heritage: {
    parts: [
      { role: 'stock', d: 'M5 13.4 L10 12.6 L26 14.6 L30 14.6 L30 18.6 L24 18.8 L14 21.6 L5 22.4 Z', box: [5, 12.6, 30, 22.4] },
      { role: 'stock', d: 'M30 14.6 L78 14.8 L80 15.4 L80 18 L30 18.6 Z', box: [30, 14.6, 80, 18.6], handguard: true, always: true },
      { role: 'metal', ...rect(80, 15.6, 12, 1.6) },
      { role: 'metal', ...rect(28, 13.2, 12, 4), receiver: true },
      { role: 'metal', ...rect(52, 14.4, 1.4, 4.6) },
      { role: 'metal', ...rect(74, 14.6, 1.4, 4.2) },
      { role: 'dark', ...rect(31, 18.6, 6, 0.9) },
    ],
    extra: (c) => `<path d="M31.6 18.8 Q32.4 21.6 35.4 21.2" stroke="${c.dark}" stroke-width="0.7" fill="none"/>
      <path d="M37 17.2 L39.4 20.4" stroke="${c.metal}" stroke-width="0.9"/><circle cx="39.6" cy="20.8" r="1" fill="${c.lit(c.metal, 0.5)}"/>
      <path d="M44 13.4 h3 v1.4 h-3 Z" fill="${c.dark}"/><path d="M89.6 13.4 h0.8 v2.2 h-0.8 Z" fill="${c.dark}"/><rect x="91.4" y="15.4" width="1.2" height="2" fill="${c.dark}"/>`,
    sling: [18, 21, 66, 18.8], neon: 'M30 17.4 H78',
    anchors: { tail: [5.6, 22.2], face: [16, 17.6], swivel: [64.4, 19.2] },
  },
};


/** Engravings on the furniture, in the finish's trim colour (gold by default). */
function rifleEngraving(kind, fr, c, clip) {
  const gold = c.f.trim ?? '#d9a441';
  if (kind === 'clouds') {
    // Xiangyun: two curling cloud scrolls on the stock.
    const [x, y] = fr.anchors.face;
    const curl = (cx, cy, s) => `<path d="M${cx - 2.4 * s} ${cy + 0.6 * s} Q${cx - 2.4 * s} ${cy - 1.4 * s} ${cx - 0.8 * s} ${cy - 1.2 * s} Q${cx + 0.4 * s} ${cy - 1 * s} ${cx + 0.2 * s} ${cy} Q${cx} ${cy + 0.7 * s} ${cx - 0.6 * s} ${cy + 0.3 * s} M${cx + 0.2 * s} ${cy} Q${cx + 1.4 * s} ${cy - 1.6 * s} ${cx + 2.6 * s} ${cy - 0.4 * s} Q${cx + 3.2 * s} ${cy + 0.6 * s} ${cx + 2.2 * s} ${cy + 0.8 * s}"/>`;
    return `<g clip-path="url(#${clip})" stroke="${gold}" stroke-width="0.4" fill="none" opacity="0.9" stroke-linecap="round">${curl(x - 4, y - 0.6, 1)}${curl(x + 3, y + 1.4, 0.8)}</g>`;
  }
  if (kind === 'scales') {
    const g = fr.parts.find((p) => p.handguard) ?? fr.parts[0];
    const [x0, y0, x1, y1] = g.box;
    const arcs = [];
    for (let y = y0 + 1.2, row = 0; y < y1; y += 1.3, row++) for (let x = x0 + (row % 2 ? 1.2 : 0.2); x < x1 - 0.5; x += 2.2) arcs.push(`<path d="M${x} ${y} Q${x + 1.1} ${y + 1.3} ${x + 2.2} ${y}"/>`);
    return `<g clip-path="url(#${clip}g)" stroke="${gold}" stroke-width="0.3" fill="none" opacity="0.75">${arcs.join('')}</g>`;
  }
  if (kind === 'circuit') {
    const r = fr.parts.find((p) => p.receiver) ?? fr.parts.find((p) => p.handguard);
    const [x0, y0, x1, y1] = r.box, my = (y0 + y1) / 2;
    return `<path d="M${x0 + 1} ${my} H${x0 + 5} L${x0 + 6.4} ${my - 1.4} H${x1 - 4} M${x0 + 8} ${my} L${x0 + 9.4} ${my + 1.4} H${x1 - 2}" stroke="${c.neon}" stroke-width="0.35" fill="none" opacity="0.9"/>
      <circle cx="${x1 - 4}" cy="${my - 1.4}" r="0.45" fill="${c.neon}"/><circle cx="${x1 - 2}" cy="${my + 1.4}" r="0.45" fill="${c.neon}"/>`;
  }
  return '';
}

/** Charms that hang from the rifle or sit on it. */
function rifleCharm(kind, fr, c) {
  const [tx, ty] = fr.anchors.tail, [fx, fy] = fr.anchors.face, [sx, sy] = fr.anchors.swivel;
  const red = '#c62a2a', redLit = mix(red, c.light, 0.4), gold = '#d4a640';
  switch (kind) {
    case 'tassel': return `<path d="M${tx} ${ty} Q${tx - 1} ${ty + 1.8} ${tx - 0.4} ${ty + 3}" stroke="${red}" stroke-width="0.5" fill="none"/>
      <path d="M${tx - 0.4} ${ty + 2.6} l1 1 l-1 1 l-1 -1 Z" fill="${red}"/><circle cx="${tx - 0.4}" cy="${ty + 5}" r="0.6" fill="${gold}"/>
      <path d="M${tx - 1.4} ${ty + 5.4} L${tx + 0.6} ${ty + 5.4} L${tx + 1} ${ty + 9.4} L${tx - 1.8} ${ty + 9.4} Z" fill="${red}"/>
      <path d="M${tx - 1} ${ty + 6} V${ty + 9.2} M${tx - 0.2} ${ty + 6} V${ty + 9.2} M${tx + 0.5} ${ty + 6} V${ty + 9.2}" stroke="${mix(red, '#000', 0.35)}" stroke-width="0.25"/>
      <path d="M${tx + 0.6} ${ty + 5.4} L${tx + 1} ${ty + 9.4}" stroke="${redLit}" stroke-width="0.35"/>`;
    case 'talisman': return `<g transform="rotate(6 ${fx} ${fy})"><path d="M${fx - 1.4} ${fy - 3.4} H${fx + 1.4} V${fy + 4.4} l-0.5 0.5 l-0.5 -0.5 l-0.5 0.5 l-0.5 -0.5 l-0.5 0.5 l-0.4 -0.5 Z" fill="#e9d27c"/>
      <path d="M${fx + 1.4} ${fy - 3.4} V${fy + 4.4}" stroke="${mix('#e9d27c', c.light, 0.5)}" stroke-width="0.35"/>
      <g stroke="#b3261e" stroke-width="0.32" fill="none" stroke-linecap="round"><circle cx="${fx}" cy="${fy - 2.2}" r="0.6"/><path d="M${fx - 0.8} ${fy - 0.9} H${fx + 0.8} M${fx} ${fy - 0.9} Q${fx - 0.7} ${fy + 0.6} ${fx + 0.4} ${fy + 1.2} Q${fx + 0.9} ${fy + 2} ${fx - 0.5} ${fy + 2.6} M${fx - 0.7} ${fy + 3.4} H${fx + 0.7}"/></g></g>`;
    case 'coin': return `<path d="M${sx} ${sy} V${sy + 3.4}" stroke="${red}" stroke-width="0.45"/>
      <circle cx="${sx}" cy="${sy + 5}" r="1.7" fill="${gold}"/><path d="M${sx} ${sy + 3.3} A1.7 1.7 0 0 1 ${sx + 1.7} ${sy + 5}" stroke="${mix(gold, c.light, 0.5)}" stroke-width="0.4" fill="none"/>
      <rect x="${sx - 0.45}" y="${sy + 4.55}" width="0.9" height="0.9" fill="#0d1016"/><path d="M${sx} ${sy + 6.7} l-0.4 1.2 M${sx} ${sy + 6.7} l0.4 1.2" stroke="${red}" stroke-width="0.4"/>`;
    case 'mala': {
      const beads = [];
      for (let i = 0; i <= 10; i++) { const t = Math.PI * (i / 10); beads.push([sx - Math.cos(t) * 3, sy + 0.4 + Math.sin(t) * 3.6]); }
      return `${beads.map(([x, y]) => `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.62" fill="#6a3f22"/><circle cx="${(x + 0.2).toFixed(2)}" cy="${(y - 0.2).toFixed(2)}" r="0.2" fill="#fff" opacity="0.35"/>`).join('')}
        <circle cx="${sx}" cy="${sy + 4.8}" r="0.9" fill="#3a2214"/><path d="M${sx - 0.5} ${sy + 5.6} L${sx + 0.5} ${sy + 5.6} L${sx + 0.7} ${sy + 8} L${sx - 0.7} ${sy + 8} Z" fill="${red}"/>`;
    }
    case 'mahjong': return `<path d="M${sx} ${sy} V${sy + 2.6}" stroke="${red}" stroke-width="0.45"/>
      <rect x="${sx - 1.3}" y="${sy + 2.6}" width="2.6" height="3.6" rx="0.4" fill="#ece6d6"/><rect x="${sx + 0.9}" y="${sy + 2.6}" width="0.4" height="3.6" fill="#9db08a"/>
      <circle cx="${sx - 0.2}" cy="${sy + 3.7}" r="0.45" fill="${red}"/><path d="M${sx - 0.8} ${sy + 4.9} h1.2 M${sx - 0.8} ${sy + 5.5} h1.2" stroke="#2e7d4f" stroke-width="0.35"/>`;
    case 'sticker': return `<circle cx="${fx}" cy="${fy}" r="2" fill="#fff"/><circle cx="${fx}" cy="${fy}" r="1.7" fill="#ff4f7b"/>
      <circle cx="${fx - 0.6}" cy="${fy - 0.3}" r="0.25" fill="#1b1f28"/><circle cx="${fx + 0.6}" cy="${fy - 0.3}" r="0.25" fill="#1b1f28"/><path d="M${fx - 0.5} ${fy + 0.5} Q${fx} ${fy + 1} ${fx + 0.5} ${fy + 0.5}" stroke="#1b1f28" stroke-width="0.25" fill="none"/>
      <path d="M${fx - 1.3} ${fy - 1.1} l0.3 -0.9 l0.5 0.6 M${fx + 1.3} ${fy - 1.1} l-0.3 -0.9 l-0.5 0.6" fill="#ff4f7b" stroke="#fff" stroke-width="0.2"/>`;
    case 'hazard': {
      const g = fr.parts.find((p) => p.handguard) ?? fr.parts[0];
      const [x0, y0, , y1] = g.box;
      return [x0 + 3, x0 + 9].map((x) => `<rect x="${x}" y="${y0 - 0.2}" width="2.6" height="${y1 - y0 + 0.4}" fill="#f2b544"/>
        <path d="M${x} ${y0 + 1} l2.6 -1.2 M${x} ${y0 + 2.6} l2.6 -1.2 M${x} ${y0 + 4.2} l2.6 -1.2" stroke="#1b1f28" stroke-width="0.55"/>`).join('');
    }
    default: return '';
  }
}

/** A rifle from the kit. look: { frame, finish, engraving?, charm? }. */
export function rifleBuild({ light, neon: carrierNeon, look }) {
  const neon = GLOW_COLOURS[look.glow] ?? carrierNeon;
  const fr = RIFLE_FRAMES[look.frame] ?? RIFLE_FRAMES.marksman;
  const f = RIFLE_FINISHES[look.finish] ?? RIFLE_FINISHES.street;
  const lit = (col, t = 0.45) => mix(col, light, t);
  const shade = (col) => mix(col, SHADOW, 0.45);
  const c = { f, light, neon, lit, shade, metal: f.metal, dark: f.dark };
  const colour = (p) => (p.role === 'guard' ? f[f.guard ?? 'dark'] : f[p.role]);
  const id = `rb${++uid}`;
  const isWood = (p) => p.role === 'stock' || (p.role === 'guard' && f.guard === 'stock');
  const wood = fr.parts.filter(isWood);
  const guard = fr.parts.filter((p) => p.handguard);
  const metal = fr.parts.filter((p) => p.role === 'metal');
  const box = (ps) => ps.reduce((b, p) => [Math.min(b[0], p.box[0]), Math.min(b[1], p.box[1]), Math.max(b[2], p.box[2]), Math.max(b[3], p.box[3])], [99, 99, 0, 0]);
  const [wx0, wy0, wx1, wy1] = box(wood);

  const parts = fr.parts.map((p, i) => {
    const col = colour(p);
    const [x0, y0, x1, y1] = p.box;
    return `<clipPath id="${id}p${i}"><path d="${p.d}"/></clipPath><path d="${p.d}" fill="${col}"/>
      <g clip-path="url(#${id}p${i})"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="0.8" fill="${lit(col, f.gloss ? 0.6 : 0.45)}"/><rect x="${x0}" y="${y1 - 0.8}" width="${x1 - x0}" height="0.8" fill="${shade(col)}"/></g>`;
  }).join('');

  // Finish details, clipped to the furniture (or the metal).
  const onWood = [];
  if (f.grain) for (let k = 1; k <= 3; k++) { const y = wy0 + ((wy1 - wy0) * k) / 4; onWood.push(`<path d="M${wx0} ${y} Q${(wx0 + wx1) / 2} ${y - 0.7} ${wx1} ${y + 0.3}" stroke="${shade(f.stock)}" stroke-width="0.35" fill="none" opacity="0.8"/>`); }
  if (f.veins) onWood.push(`<path d="M${wx0 + 2} ${wy0 + 2} Q${wx0 + 8} ${wy0 + 5} ${wx0 + 12} ${wy0 + 3} T${wx0 + 22} ${wy0 + 6} M${wx0 + 4} ${wy1 - 2} Q${wx0 + 10} ${wy1 - 4} ${wx0 + 16} ${wy1 - 2.6}" stroke="${f.veins}" stroke-width="0.4" fill="none" opacity="0.7"/>`);
  if (f.nodes) for (let x = wx0 + 4; x < wx1; x += 7) onWood.push(`<path d="M${x} ${wy0} V${wy1}" stroke="${shade(f.stock)}" stroke-width="0.7"/><path d="M${x + 0.6} ${wy0} V${wy1}" stroke="${lit(f.stock, 0.5)}" stroke-width="0.35"/>`);
  if (f.gloss) onWood.push(`<path d="M${wx0 + 1} ${wy0 + 1.6} L${wx1 - 2} ${wy0 + 1.9}" stroke="#fff" stroke-width="0.5" opacity="0.28"/>`);
  if (f.camo) for (let k = 0; k < 14; k++) { const x = wx0 + ((k * 7.3) % (wx1 - wx0)), y = wy0 + ((k * 3.1) % (wy1 - wy0)); onWood.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${2 + (k % 3)}" height="${1.2 + (k % 2)}" fill="${f.camo[k % 3]}"/>`); }
  if (f.inlay) { const [x, y] = fr.anchors.face; onWood.push(`<path d="M${x - 3} ${y} l1 -1 l1 1 l-1 1 Z M${x + 3} ${y} l1 -1 l1 1 l-1 1 Z" fill="${f.inlay}" opacity="0.9"/><circle cx="${x + 0.5}" cy="${y}" r="0.5" fill="${f.inlay}"/>`); }
  if (f.skeleton) { const [x, y] = fr.anchors.face; onWood.push(`<path d="M${x - 4} ${y - 1.2} Q${x} ${y - 1.8} ${x + 3} ${y - 0.8} L${x + 2.6} ${y + 1.6} Q${x - 0.6} ${y + 1.8} ${x - 3.6} ${y + 2.2} Z" fill="#0d1016" opacity="0.85"/>`); }
  if (f.chips) for (let k = 0; k < 8; k++) onWood.push(`<circle cx="${wx0 + 2 + ((k * 5.7) % (wx1 - wx0 - 4))}" cy="${wy0 + 1.5 + ((k * 2.3) % (wy1 - wy0 - 3))}" r="0.35" fill="${lit(f.stock, 0.6)}" opacity="0.7"/>`);
  const onMetal = [];
  if (f.patina) for (let k = 0; k < 10; k++) { const p = metal[k % metal.length]; const [x0, y0, x1, y1] = p.box; onMetal.push(`<ellipse cx="${x0 + ((k * 4.1) % (x1 - x0))}" cy="${(y0 + y1) / 2}" rx="1.4" ry="0.7" fill="${f.patina}" opacity="0.6"/>`); }
  if (f.chips) for (const p of metal) onMetal.push(`<rect x="${p.box[0] + 2}" y="${p.box[1] + 0.8}" width="1.6" height="0.6" fill="#8a5a3a" opacity="0.8"/>`);
  // Trim: a gold line just inside the top of each piece of furniture, and one along the receiver.
  if (f.trim) for (const p of wood) onWood.push(`<path d="M${p.box[0] + 0.8} ${p.box[1] + 1.3} L${p.box[2] - 0.8} ${p.box[1] + 1.3}" stroke="${f.trim}" stroke-width="0.35" opacity="0.9"/>`);
  const rcv = fr.parts.find((p) => p.receiver);
  const trim = f.trim && rcv ? `<path d="M${rcv.box[0] + 0.6} ${rcv.box[1] + 1.4} H${rcv.box[2] - 0.6}" stroke="${f.trim}" stroke-width="0.35" opacity="0.9"/>` : '';
  const grip = fr.parts.find((p) => p.grip);
  const tape = f.tape && grip ? `<path d="M${grip.box[0] + 0.8} ${grip.box[1] + 2} h3.8 M${grip.box[0] + 0.4} ${grip.box[1] + 3.6} h3.8 M${grip.box[0] + 0.2} ${grip.box[1] + 5.2} h3.6" stroke="#f2b544" stroke-width="0.5" opacity="0.55"/>` : '';
  const neonLine = f.neonLine ? `<path d="${fr.neon}" stroke="${neon}" stroke-width="0.5"/>` : '';
  const sling = (() => { const [x1, y1, x2, y2] = fr.sling; const col = f.dark; return `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.max(y1, y2) + 9} ${x2} ${y2}" stroke="${col}" stroke-width="1.4" fill="none"/><path d="M${x1} ${y1 - 0.4} Q${(x1 + x2) / 2} ${Math.max(y1, y2) + 8.4} ${x2} ${y2 - 0.4}" stroke="${lit(col, 0.3)}" stroke-width="0.35" fill="none"/>`; })();

  return `<defs><clipPath id="${id}"><path d="${wood.map((p) => p.d).join(' ')}"/></clipPath><clipPath id="${id}g"><path d="${guard.map((p) => p.d).join(' ')}"/></clipPath>
    <clipPath id="${id}m"><path d="${metal.map((p) => p.d).join(' ')}"/></clipPath></defs>
    ${parts}${fr.extra(c)}
    <g clip-path="url(#${id})">${onWood.join('')}</g><g clip-path="url(#${id}m)">${onMetal.join('')}</g>
    ${trim}${tape}${neonLine}
    ${look.engraving ? rifleEngraving(look.engraving, fr, c, id) : ''}
    ${sling}
    ${look.charm ? rifleCharm(look.charm, fr, c) : ''}`;
}

// --- sidearm looks (2026-10-29) ---------------------------------------------------------
// The same kit idea as the rifles, drawn bigger in the same 96×32 frame (muzzle right), and
// leaning into the city's neon: light strips, glowing vents, laser lines and holo sights. A glow
// is a wide, faint stroke under a bright thin one, never a blur, so it stays flat. Sidearms show
// in the armoury and on gear tiles, not on faces (owner's call, 2026-10-29).

// A gun's glow colour is part of its look (look.glow, data/gearLooks.js GLOWS); a gun that lights
// up but has none (rifles bought before glows) takes the carrier's chrome.
export const GLOW_COLOURS = { cyan: '#3de8d8', violet: '#b26bff', red: '#ff3d5f', gold: '#ffc23d' };

const glowPath = (d, col, w = 0.5, o = 0.22) => `<path d="${d}" stroke="${col}" stroke-width="${w * 6}" fill="none" opacity="${o * 0.6}" stroke-linecap="round"/><path d="${d}" stroke="${col}" stroke-width="${w * 3}" fill="none" opacity="${o * 1.3}" stroke-linecap="round"/><path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

export const SIDEARM_FINISHES = {
  blued: { slide: '#2f3640', frame: '#232830', grip: '#1a1d23', dark: '#14171c', stipple: true },
  stainless: { slide: '#b7bec8', frame: '#8e96a1', grip: '#5a3a22', dark: '#2a2e36', grain: true },
  polymer: { slide: '#2a2e36', frame: '#1c1f25', grip: '#1c1f25', dark: '#121419', stipple: true },
  tan: { slide: '#2a2e36', frame: '#9a8460', grip: '#9a8460', dark: '#1c1f25', stipple: true },
  hazard: { slide: '#e0b23a', frame: '#2a2d36', grip: '#2a2d36', dark: '#16181d', stripes: true },
  neon: { slide: '#15171c', frame: '#15171c', grip: '#15171c', dark: '#0d0e12', neonEdge: true },
  cinnabar: { slide: '#1b1b20', frame: '#a8261e', grip: '#a8261e', dark: '#121216', gloss: true, trim: '#d9a441' },
  jade: { slide: '#7a5c34', frame: '#3a3226', grip: '#3d8a68', dark: '#221e18', gloss: true, veins: '#9ad8b8' },
  pearl: { slide: '#c9ced6', frame: '#8e96a1', grip: '#e9e3d6', dark: '#2a2e36', pearl: true },
  rosewood: { slide: '#a07c44', frame: '#2e2420', grip: '#5a2a1c', dark: '#1e1814', grain: true, inlay: '#e9e1cc' },
  blackgold: { slide: '#16171b', frame: '#16171b', grip: '#16171b', dark: '#0d0e11', gloss: true, trim: '#c9a24a', medallion: true },
  holo: { slide: '#3a4a6a', frame: '#20232b', grip: '#20232b', dark: '#121419', holo: ['#7dd3fc', '#c4b5fd', '#f9a8d4'] },
  synth: { slide: '#e6e9ee', frame: '#c9ced6', grip: '#3a3f48', dark: '#2a2e36', ledStrip: true },
  ronin: { slide: '#101114', frame: '#101114', grip: '#2a1416', dark: '#08090b', wrap: '#8a2222', redEye: true },
};

/** Sidearm frames: parts by role (slide, frame, grip, dark), and anchors for mods and charms. */
export const SIDEARM_FRAMES = {
  compact: {
    parts: [
      { role: 'grip', d: 'M27 18 L40 18 L37.5 30 L24.5 30 Z', box: [24.5, 18, 40, 30] },
      { role: 'frame', d: 'M26 14 L68 14 L68 17.4 L44 17.4 L40 18.4 L26 18.4 Z', box: [26, 14, 68, 18.4] },
      { role: 'slide', d: 'M22 7 L70 7 L71 8 L71 14 L22 14 Z', box: [22, 7, 71, 14], slide: true },
      { role: 'dark', ...rect(24, 29.4, 13.8, 1.4) },
    ],
    extra: (c) => `<path d="M40 18.4 Q41 23.4 47 22.6 L48 17.4" stroke="${c.f.frame}" stroke-width="1.2" fill="none"/><path d="M42.4 18.4 Q43.4 20 42.8 21.6" stroke="${c.f.dark}" stroke-width="0.8" fill="none"/>
      ${[24.4, 25.8, 27.2, 28.6, 30].map((x) => `<path d="M${x} 8.6 V12.6" stroke="${c.shade(c.f.slide)}" stroke-width="0.5"/>`).join('')}
      <rect x="46" y="8.2" width="8" height="2" fill="${c.f.dark}"/><rect x="23" y="5.6" width="2.4" height="1.4" fill="${c.f.dark}"/><rect x="67.6" y="5.8" width="1.2" height="1.2" fill="${c.f.dark}"/>`,
    rail: [54, 17.4], lanyard: [25.4, 30.6], face: [31.4, 24.4], body: [36, 10.6, 66, 10.6], sightAt: [44, 7],
  },
  revolver: {
    parts: [
      { role: 'grip', d: 'M25 19 Q20.6 23 21.6 30.4 L31.4 30.4 Q31 24.4 35 20 Z', box: [20.6, 19, 35, 30.4] },
      { role: 'frame', d: 'M24 7 L52 7 L52 19.6 L44 19.6 L40 20.4 L26 20.4 L24 17 Z', box: [24, 7, 52, 20.4] },
      { role: 'slide', d: 'M50 8.6 L82 8.6 L82 13.2 L50 13.2 Z', box: [50, 8.6, 82, 13.2], slide: true },
      { role: 'slide', ...rect(50, 7.4, 32, 1.4) },
      { role: 'slide', d: 'M35 8 L48 8 Q50 8 50 10 L50 16.6 Q50 18.6 48 18.6 L35 18.6 Q33 18.6 33 16.6 L33 10 Q33 8 35 8 Z', box: [33, 8, 50, 18.6] },
      { role: 'frame', ...rect(52, 13.2, 22, 1.4) },
    ],
    extra: (c) => `${[10.4, 13.2, 16].map((y) => `<path d="M35 ${y} H48" stroke="${c.shade(c.f.slide)}" stroke-width="0.6"/>`).join('')}
      <path d="M24 7.6 L21 5 L22.6 4 L26 7 Z" fill="${c.f.dark}"/><rect x="80" y="5.8" width="1.4" height="1.8" fill="${c.f.dark}"/>
      <path d="M36 20 Q37 25 43 24.2 L44 19.6" stroke="${c.f.frame}" stroke-width="1.2" fill="none"/><path d="M38.4 20.2 Q39.4 21.8 38.8 23.2" stroke="${c.f.dark}" stroke-width="0.8" fill="none"/>`,
    rail: [56, 14.6], lanyard: [22.6, 31], face: [27, 25], body: [52, 10.9, 80, 10.9], sightAt: [56, 7.4],
  },
  machine: {
    parts: [
      { role: 'grip', d: 'M30 16 L39 16 L37.4 25 L28.4 25 Z', box: [28.4, 16, 39, 25] },
      { role: 'dark', d: 'M29 25 L37.2 25 L36.4 31.6 L28.2 31.6 Z', box: [28.2, 25, 37.2, 31.6] },
      { role: 'grip', d: 'M54 16 L58.6 16 L58 24 L54.6 24 Z', box: [54, 16, 58.6, 24] },
      { role: 'slide', ...rect(18, 8, 46, 8), slide: true },
      { role: 'dark', ...rect(64, 9.4, 12, 5.2) },
      { role: 'dark', ...rect(76, 11, 4, 2) },
      { role: 'dark', ...rect(6.6, 8.8, 1.6, 7) },
      { role: 'dark', ...rect(24, 6.6, 30, 1.4) },
    ],
    extra: (c) => `<path d="M18 9.5 L8 9.5 L8 15 L18 15" stroke="${c.f.frame}" stroke-width="1.2" fill="none"/>
      ${[66.4, 69.6, 72.8].map((x) => `<circle cx="${x}" cy="12" r="0.9" fill="#0d1016"/>`).join('')}
      ${[27, 31, 35, 39, 43, 47, 51].map((x) => `<rect x="${x}" y="6.6" width="0.8" height="0.7" fill="#0d1016"/>`).join('')}
      <path d="M39 16 Q40 20.4 45 19.8 L46 16" stroke="${c.f.frame}" stroke-width="1.2" fill="none"/><rect x="42" y="9" width="8" height="2" fill="${c.f.dark}"/>`,
    rail: [60, 16], lanyard: [7.4, 16.4], face: [33.4, 20.6], body: [20, 12, 62, 12], sightAt: [30, 6.6],
  },
  heritage: {
    parts: [
      { role: 'grip', d: 'M24 15 Q17.4 19 19 30.4 L28.4 30.4 Q27 22.4 31.6 15.4 Z', box: [17.4, 15, 31.6, 30.4] },
      { role: 'frame', d: 'M38 15.4 L48 15.4 L47.4 22.4 L38.6 22.4 Z', box: [38, 15.4, 48, 22.4] },
      { role: 'slide', ...rect(24, 8, 28, 7.4), slide: true },
      { role: 'slide', ...rect(52, 9.4, 32, 3) },
    ],
    extra: (c) => `<circle cx="23" cy="8.2" r="1.6" fill="none" stroke="${c.f.dark}" stroke-width="0.8"/><rect x="82" y="7.8" width="1.2" height="1.6" fill="${c.f.dark}"/>
      <path d="M31.6 15.4 Q32.6 20.4 37.6 20 L38 15.4" stroke="${c.f.frame}" stroke-width="1.2" fill="none"/><path d="M45 6.6 L48 6.6 L48 8 L45 8 Z" fill="${c.f.dark}"/>
      ${[19, 21.4, 23.8, 26.2, 28.6].map((y) => `<path d="M${20.6 + (y - 19) * 0.12} ${y} L${27.4 + (y - 19) * 0.2} ${y - 0.6}" stroke="${c.shade(c.f.grip)}" stroke-width="0.4"/>`).join('')}`,
    rail: [56, 12.4], lanyard: [19.6, 30.8], face: [24, 23], body: [26, 11.7, 50, 11.7], sightAt: [60, 7.6],
  },
  cannon: {
    parts: [
      { role: 'grip', d: 'M23 20 L40 20 L37 31.6 L20 31.6 Z', box: [20, 20, 40, 31.6] },
      { role: 'frame', d: 'M22 15 L78 15 L78 19 L46 19 L42 20.4 L22 20.4 Z', box: [22, 15, 78, 20.4] },
      { role: 'slide', d: 'M18 5 L80 5 L82 7 L82 15 L18 15 Z', box: [18, 5, 82, 15], slide: true },
      { role: 'dark', ...rect(82, 6, 8, 8.6) },
      { role: 'dark', ...rect(24, 3.6, 40, 1.4) },
    ],
    extra: (c) => `${[64, 68, 72, 76].map((x) => `<rect x="${x}" y="5" width="2" height="1.6" fill="#0d1016"/>`).join('')}${[84, 86.4, 88.6].map((x) => `<rect x="${x}" y="7.4" width="0.8" height="5.8" fill="#0d1016"/>`).join('')}
      ${[20.6, 22, 23.4, 24.8, 26.2].map((x) => `<path d="M${x} 7 V13" stroke="${c.shade(c.f.slide)}" stroke-width="0.5"/>`).join('')}
      <path d="M42 20.4 Q43.4 26 50 25 L51 19" stroke="${c.f.frame}" stroke-width="1.3" fill="none"/><rect x="48" y="7" width="9" height="2.4" fill="${c.f.dark}"/>`,
    rail: [56, 19], lanyard: [21, 31.8], face: [29.4, 25.6], body: [30, 10, 78, 10], sightAt: [36, 3.6],
  },
  smart: {
    parts: [
      { role: 'grip', d: 'M27 18 L40 18 L38 29.6 L25 29.6 Z', box: [25, 18, 40, 29.6] },
      { role: 'frame', d: 'M26 14.4 L66 14.4 L64 17.6 L44 17.6 L40 18.6 L26 18.6 Z', box: [26, 14.4, 66, 18.6] },
      { role: 'slide', d: 'M22 8 L68 8 Q73 8.4 73 11 Q73 14 68 14.4 L22 14.4 Z', box: [22, 8, 73, 14.4], slide: true },
    ],
    extra: (c) => `<path d="M40 18.6 Q41 23 46.6 22.4 L47.4 17.6" stroke="${c.f.frame}" stroke-width="1.2" fill="none"/>
      <path d="M31 29.6 Q31 32 26 31.6 Q14 30.6 4 31.4" stroke="${c.f.dark}" stroke-width="1" fill="none"/>${glowPath('M31 29.8 Q31 31.6 26 31.3 Q14 30.4 4 31.1', c.neon, 0.3, 0.15)}
      ${glowPath('M24 12.8 H69', c.neon, 0.55)}${[21, 23, 25].map((y, i) => `<circle cx="26.6" cy="${y}" r="0.45" fill="${i === 2 ? '#3dff9a' : c.neon}"/>`).join('')}
      <rect x="40" y="1.6" width="12" height="5.4" fill="${c.neon}" opacity="0.12" stroke="${c.neon}" stroke-width="0.35"/><circle cx="46" cy="4.3" r="1.2" fill="none" stroke="${c.neon}" stroke-width="0.35"/><circle cx="46" cy="4.3" r="0.25" fill="${c.neon}"/><rect x="45" y="7" width="2" height="1" fill="${c.f.dark}"/>`,
    rail: [52, 17.6], lanyard: [26, 30], face: [32.4, 23.6], body: [28, 10.6, 66, 10.6], sightAt: null,
  },
  coil: {
    parts: [
      { role: 'grip', d: 'M27 16 L39 16 L37 29.6 L24.6 29.6 Z', box: [24.6, 16, 39, 29.6] },
      { role: 'slide', d: 'M22 8 L52 8 L54 10 L54 16 L22 16 Z', box: [22, 8, 54, 16], slide: true },
      { role: 'slide', ...rect(54, 8.4, 30, 2) },
      { role: 'slide', ...rect(54, 14, 30, 2) },
      { role: 'dark', ...rect(84, 8, 2, 8) },
      { role: 'dark', ...rect(15, 9.6, 7, 5.4) },
    ],
    extra: (c) => `${glowPath('M56 12.2 H83', c.neon, 0.6, 0.3)}${[58, 62, 66, 70, 74, 78].map((x) => `<rect x="${x}" y="10.2" width="1.6" height="3.8" fill="${c.f.frame}"/><rect x="${x}" y="10.2" width="1.6" height="0.6" fill="${c.lit(c.f.frame)}"/>`).join('')}
      <rect x="16.2" y="10.8" width="4.6" height="3" fill="${c.neon}" opacity="0.85"/><rect x="16.2" y="10.8" width="4.6" height="3" fill="none" stroke="${c.neon}" stroke-width="1.6" opacity="0.15"/>
      <path d="M18.6 9.6 Q18.6 5 30 5.4 L52 6.4 L55 8.4" stroke="${c.f.dark}" stroke-width="0.9" fill="none"/>${glowPath('M18.6 9.4 Q18.6 5.2 30 5.6', c.neon, 0.25, 0.12)}
      <path d="M39 16 Q40 21 45.6 20.4 L46.4 16" stroke="${c.f.frame}" stroke-width="1.2" fill="none"/>`,
    rail: [44, 16], lanyard: [25.4, 30], face: [31.6, 22.6], body: [26, 12, 52, 12], sightAt: [34, 8],
  },
};

/** Mods: the cyberpunk ones glow in the carrier's chrome colour (a laser is always red). */
function sidearmMod(kind, fr, c, id) {
  const [rx, ry] = fr.rail;
  const [bx0, by, bx1] = fr.body;
  const gold = c.f.trim ?? '#d9a441';
  switch (kind) {
    case 'laser': return `<rect x="${rx}" y="${ry}" width="9" height="2.8" rx="0.6" fill="${c.f.dark}"/><rect x="${rx}" y="${ry}" width="9" height="0.6" fill="${c.lit(c.f.dark)}"/>
      <circle cx="${rx + 9}" cy="${ry + 1.4}" r="0.7" fill="#ff3d5f"/>${glowPath(`M${rx + 9.6} ${ry + 1.4} H96`, '#ff3d5f', 0.35, 0.25)}`;
    case 'holo': return fr.sightAt ? `<rect x="${fr.sightAt[0]}" y="${fr.sightAt[1] - 1.2}" width="5" height="1.2" fill="${c.f.dark}"/>
      <path d="M${fr.sightAt[0] + 0.6} ${fr.sightAt[1] - 1.2} L${fr.sightAt[0] - 0.4} ${fr.sightAt[1] - 6.2} L${fr.sightAt[0] + 5.6} ${fr.sightAt[1] - 6.2} L${fr.sightAt[0] + 4.4} ${fr.sightAt[1] - 1.2} Z" fill="${c.neon}" opacity="0.14" stroke="${c.neon}" stroke-width="0.35"/>
      <circle cx="${fr.sightAt[0] + 2.6}" cy="${fr.sightAt[1] - 3.7}" r="0.9" fill="none" stroke="${c.neon}" stroke-width="0.3"/><circle cx="${fr.sightAt[0] + 2.6}" cy="${fr.sightAt[1] - 3.7}" r="0.25" fill="${c.neon}"/>` : '';
    case 'vents': {
      const n = 4, step = (bx1 - bx0 - 8) / n;
      return Array.from({ length: n }, (_, i) => { const x = bx0 + 6 + i * step; return `<rect x="${x}" y="${by - 0.9}" width="${step * 0.55}" height="1.8" rx="0.4" fill="${c.neon}" opacity="0.9"/><rect x="${x - 0.6}" y="${by - 1.6}" width="${step * 0.55 + 1.2}" height="3.2" rx="1" fill="${c.neon}" opacity="0.18"/>`; }).join('');
    }
    case 'ledmag': { const [fx, fy] = fr.face; return `<rect x="${fx - 1.6}" y="${fy - 2.6}" width="3.2" height="5.4" rx="0.4" fill="#0b0d10"/>${[0, 1, 2, 3].map((i) => `<rect x="${fx - 1}" y="${fy - 2 + i * 1.25}" width="2" height="0.8" fill="${i === 0 ? c.f.dark : c.neon}" opacity="${i === 0 ? 1 : 0.95}"/>`).join('')}<rect x="${fx - 2.2}" y="${fy - 3.2}" width="4.4" height="6.6" rx="1" fill="${c.neon}" opacity="0.12"/>`; }
    case 'scales': { const arcs = []; for (let y = by - 2.2, row = 0; y <= by + 1.6; y += 1.3, row++) for (let x = bx0 + (row % 2 ? 1.1 : 0); x < bx1 - 2; x += 2.2) arcs.push(`<path d="M${x} ${y} Q${x + 1.1} ${y + 1.3} ${x + 2.2} ${y}"/>`); return `<g clip-path="url(#${id}s)" stroke="${gold}" stroke-width="0.3" fill="none" opacity="0.8">${arcs.join('')}</g>`; }
    case 'clouds': { const curl = (cx, cy, s) => `<path d="M${cx - 2.4 * s} ${cy + 0.6 * s} Q${cx - 2.4 * s} ${cy - 1.4 * s} ${cx - 0.8 * s} ${cy - 1.2 * s} Q${cx + 0.4 * s} ${cy - 1 * s} ${cx + 0.2 * s} ${cy} Q${cx} ${cy + 0.7 * s} ${cx - 0.6 * s} ${cy + 0.3 * s} M${cx + 0.2 * s} ${cy} Q${cx + 1.4 * s} ${cy - 1.6 * s} ${cx + 2.6 * s} ${cy - 0.4 * s} Q${cx + 3.2 * s} ${cy + 0.6 * s} ${cx + 2.2 * s} ${cy + 0.8 * s}"/>`; const mx = (bx0 + bx1) / 2; return `<g clip-path="url(#${id}s)" stroke="${gold}" stroke-width="0.4" fill="none" opacity="0.9">${curl(mx - 6, by, 1)}${curl(mx + 4, by + 0.6, 0.8)}</g>`; }
    case 'circuit': return `${glowPath(`M${bx0 + 1} ${by + 1} H${bx0 + 6} L${bx0 + 7.4} ${by - 0.6} H${bx1 - 6} M${bx0 + 10} ${by + 1} H${bx1 - 3}`, c.neon, 0.35, 0.18)}<circle cx="${bx1 - 6}" cy="${by - 0.6}" r="0.5" fill="${c.neon}"/><circle cx="${bx1 - 3}" cy="${by + 1}" r="0.5" fill="${c.neon}"/>`;
    default: return '';
  }
}

/** Charms on a lanyard from the grip, or flat on it. The cyber ones glow. */
function sidearmCharm(kind, fr, c) {
  const [lx, ly] = fr.lanyard, [fx, fy] = fr.face;
  const red = '#c62a2a', gold = '#d4a640';
  const cord = (len, col = red) => `<path d="M${lx} ${ly} Q${lx - 1.4} ${ly + len / 2} ${lx - 0.6} ${ly + len}" stroke="${col}" stroke-width="0.45" fill="none"/>`;
  const end = [lx - 0.6, ly];
  switch (kind) {
    case 'tassel': return `${cord(1.4)}<path d="M${end[0] - 1} ${ly + 1.4} L${end[0] + 1} ${ly + 1.4} L${end[0] + 1.4} ${Math.min(31.8, ly + 5)} L${end[0] - 1.4} ${Math.min(31.8, ly + 5)} Z" fill="${red}"/><circle cx="${end[0]}" cy="${ly + 1.2}" r="0.5" fill="${gold}"/>`;
    case 'coin': return `${cord(0.6)}<circle cx="${end[0]}" cy="${Math.min(30.4, ly + 1.6)}" r="1.4" fill="${gold}"/><rect x="${end[0] - 0.35}" y="${Math.min(30.4, ly + 1.6) - 0.35}" width="0.7" height="0.7" fill="#0d1016"/>`;
    case 'talisman': return `<g transform="rotate(-4 ${fx} ${fy})"><rect x="${fx - 1.2}" y="${fy - 3}" width="2.4" height="6" fill="#e9d27c"/><g stroke="#b3261e" stroke-width="0.3" fill="none"><circle cx="${fx}" cy="${fy - 1.8}" r="0.5"/><path d="M${fx - 0.6} ${fy - 0.6} H${fx + 0.6} M${fx} ${fy - 0.6} Q${fx - 0.6} ${fy + 0.8} ${fx + 0.4} ${fy + 1.4} M${fx - 0.6} ${fy + 2.2} H${fx + 0.6}"/></g></g>`;
    case 'mahjong': return `${cord(0.6)}<rect x="${end[0] - 1.1}" y="${ly + 0.6}" width="2.2" height="${Math.min(3, 31.8 - ly - 0.6)}" rx="0.3" fill="#ece6d6"/><circle cx="${end[0] - 0.2}" cy="${ly + 1.5}" r="0.4" fill="${red}"/>`;
    case 'sticker': return `<circle cx="${fx}" cy="${fy}" r="1.8" fill="#fff"/><circle cx="${fx}" cy="${fy}" r="1.5" fill="#ff4f7b"/><circle cx="${fx - 0.5}" cy="${fy - 0.3}" r="0.22" fill="#1b1f28"/><circle cx="${fx + 0.5}" cy="${fy - 0.3}" r="0.22" fill="#1b1f28"/><path d="M${fx - 0.4} ${fy + 0.4} Q${fx} ${fy + 0.8} ${fx + 0.4} ${fy + 0.4}" stroke="#1b1f28" stroke-width="0.22" fill="none"/>`;
    case 'cube': { const y = Math.min(29, ly + 0.8); return `${cord(0.8, '#2a2e36')}<rect x="${end[0] - 1.2}" y="${y}" width="2.4" height="2.4" fill="${c.neon}" opacity="0.2"/><rect x="${end[0] - 1}" y="${y + 0.2}" width="2" height="2" fill="none" stroke="${c.neon}" stroke-width="0.4"/><rect x="${end[0] - 0.3}" y="${y + 0.9}" width="0.6" height="0.6" fill="${c.neon}"/><rect x="${end[0] - 2.2}" y="${y - 1}" width="4.4" height="4.4" fill="${c.neon}" opacity="0.1"/>`; }
    case 'shard': { const y = Math.min(28.4, ly + 0.6); return `${cord(0.6, '#2a2e36')}<path d="M${end[0]} ${y} L${end[0] + 1.1} ${y + 1.4} L${end[0]} ${y + 3.4} L${end[0] - 1.1} ${y + 1.4} Z" fill="${c.neon}" opacity="0.35" stroke="${c.neon}" stroke-width="0.3"/><path d="M${end[0]} ${y} V${y + 3.4}" stroke="#fff" stroke-width="0.2" opacity="0.6"/>`; }
    case 'cat': return `${glowPath(`M${fx - 1.4} ${fy + 1.2} V${fy - 0.6} L${fx - 1} ${fy - 1.8} L${fx - 0.4} ${fy - 0.9} H${fx + 0.4} L${fx + 1} ${fy - 1.8} L${fx + 1.4} ${fy - 0.6} V${fy + 1.2} Z`, '#ff8ad8', 0.3, 0.22)}<circle cx="${fx - 0.5}" cy="${fy - 0.1}" r="0.2" fill="#ff8ad8"/><circle cx="${fx + 0.5}" cy="${fy - 0.1}" r="0.2" fill="#ff8ad8"/><path d="M${fx + 1.4} ${fy} l1 -1.2" stroke="#ff8ad8" stroke-width="0.3"/>`;
    default: return '';
  }
}

/** A sidearm from the kit. look: { frame, finish, mod?, charm? }. */
export function sidearmBuild({ light, neon: carrierNeon, look }) {
  const neon = GLOW_COLOURS[look.glow] ?? carrierNeon;
  const fr = SIDEARM_FRAMES[look.frame] ?? SIDEARM_FRAMES.compact;
  const f = SIDEARM_FINISHES[look.finish] ?? SIDEARM_FINISHES.blued;
  const lit = (col, t = 0.45) => mix(col, light, t);
  const shade = (col) => mix(col, SHADOW, 0.45);
  const c = { f, light, neon, lit, shade };
  const id = `sb${++uid}`;
  const of = (role) => fr.parts.filter((p) => p.role === role);
  const box = (ps) => ps.reduce((b, p) => [Math.min(b[0], p.box[0]), Math.min(b[1], p.box[1]), Math.max(b[2], p.box[2]), Math.max(b[3], p.box[3])], [99, 99, 0, 0]);
  const parts = fr.parts.map((p, i) => {
    const col = f[p.role];
    const [x0, y0, x1, y1] = p.box;
    return `<clipPath id="${id}p${i}"><path d="${p.d}"/></clipPath><path d="${p.d}" fill="${col}"/>
      <g clip-path="url(#${id}p${i})"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="0.8" fill="${lit(col, f.gloss ? 0.6 : 0.45)}"/><rect x="${x0}" y="${y1 - 0.8}" width="${x1 - x0}" height="0.8" fill="${shade(col)}"/></g>`;
  }).join('');
  const [gx0, gy0, gx1, gy1] = box(of('grip'));
  const [sx0, sy0, sx1, sy1] = box(of('slide'));
  const onGrip = [], onSlide = [];
  if (f.stipple) for (let y = gy0 + 2; y < gy1 - 1; y += 1.4) for (let x = gx0 + 1; x < gx1 - 1; x += 1.4) onGrip.push(`<circle cx="${x + ((y * 3) % 1.4) * 0.3}" cy="${y}" r="0.22" fill="${shade(f.grip)}"/>`);
  if (f.grain) for (let k = 1; k <= 4; k++) { const y = gy0 + ((gy1 - gy0) * k) / 5; onGrip.push(`<path d="M${gx0} ${y} Q${(gx0 + gx1) / 2} ${y - 0.8} ${gx1} ${y + 0.2}" stroke="${shade(f.grip)}" stroke-width="0.35" fill="none"/>`); }
  if (f.veins) onGrip.push(`<path d="M${gx0 + 1} ${gy0 + 2} Q${gx0 + 5} ${gy0 + 5} ${gx0 + 3} ${gy0 + 8} T${gx0 + 6} ${gy1 - 1}" stroke="${f.veins}" stroke-width="0.4" fill="none" opacity="0.75"/>`);
  if (f.pearl) onGrip.push(`<path d="M${gx0 + 2} ${gy0 + 2} Q${gx0 + 6} ${gy0 + 4} ${gx0 + 4} ${gy0 + 8}" stroke="#f9c6e0" stroke-width="0.6" fill="none" opacity="0.6"/><path d="M${gx0 + 4} ${gy0 + 3} Q${gx0 + 8} ${gy0 + 6} ${gx0 + 5} ${gy1 - 2}" stroke="#bfeaf5" stroke-width="0.6" fill="none" opacity="0.6"/>`);
  if (f.inlay) { const [fx, fy] = fr.face; onGrip.push(`<path d="M${fx} ${fy - 1.4} l1 1.4 l-1 1.4 l-1 -1.4 Z" fill="${f.inlay}"/>`); }
  if (f.medallion) { const [fx, fy] = fr.face; onGrip.push(`<circle cx="${fx}" cy="${fy}" r="1.6" fill="${f.trim}"/><circle cx="${fx}" cy="${fy}" r="1" fill="none" stroke="${shade(f.trim)}" stroke-width="0.3"/>`); }
  if (f.wrap) for (let y = gy0 + 1; y < gy1; y += 2.2) onGrip.push(`<path d="M${gx0} ${y} L${(gx0 + gx1) / 2} ${y + 1.1} L${gx1} ${y} M${gx0} ${y + 2.2} L${(gx0 + gx1) / 2} ${y + 1.1} L${gx1} ${y + 2.2}" stroke="${f.wrap}" stroke-width="0.7" fill="none"/>`);
  if (f.stripes) for (let x = sx0 + 2; x < sx1; x += 3) onSlide.push(`<path d="M${x} ${sy1} L${x + 2.4} ${sy0}" stroke="#16181d" stroke-width="0.9"/>`);
  if (f.holo) f.holo.forEach((col, i) => onSlide.push(`<path d="M${sx0 + i * 9} ${sy1} L${sx0 + 9 + i * 9} ${sy0} L${sx0 + 15 + i * 9} ${sy0} L${sx0 + 6 + i * 9} ${sy1} Z" fill="${col}" opacity="0.55"/><path d="M${sx0 + 30 + i * 9} ${sy1} L${sx0 + 39 + i * 9} ${sy0} L${sx0 + 44 + i * 9} ${sy0} L${sx0 + 35 + i * 9} ${sy1} Z" fill="${col}" opacity="0.45"/>`));
  if (f.gloss) onSlide.push(`<path d="M${sx0 + 1} ${sy0 + 1.6} L${sx1 - 2} ${sy0 + 1.6}" stroke="#fff" stroke-width="0.4" opacity="0.25"/>`);
  if (f.trim) onSlide.push(`<path d="M${sx0 + 0.6} ${sy1 - 1.4} H${sx1 - 0.6}" stroke="${f.trim}" stroke-width="0.35"/>`);
  const neonEdge = f.neonEdge ? fr.parts.filter((p) => p.role !== 'dark').map((p) => glowPath(p.d, neon, 0.3, 0.15)).join('') : '';
  const ledStrip = f.ledStrip ? glowPath(`M${sx0 + 2} ${sy1 - 1.4} H${sx1 - 3}`, neon, 0.5) : '';
  const redEye = f.redEye ? `${[0, 1.4, 2.8].map((dx) => `<circle cx="${sx1 - 6 - dx}" cy="${sy0 + 2}" r="0.35" fill="#ff3d5f"/>`).join('')}${glowPath(`M${sx0 + 3} ${sy1 - 1.2} H${sx0 + 12}`, '#ff3d5f', 0.3, 0.2)}` : '';
  return `<defs><clipPath id="${id}g"><path d="${of('grip').map((p) => p.d).join(' ')}"/></clipPath><clipPath id="${id}s"><path d="${of('slide').map((p) => p.d).join(' ')}"/></clipPath></defs>
    ${parts}${fr.extra(c)}
    <g clip-path="url(#${id}g)">${onGrip.join('')}</g><g clip-path="url(#${id}s)">${onSlide.join('')}</g>
    ${neonEdge}${ledStrip}${redEye}
    ${look.mod ? sidearmMod(look.mod, fr, c, id) : ''}
    ${look.charm ? sidearmCharm(look.charm, fr, c) : ''}`;
}

const GEAR_SHAPES = { rifle: rifleShapes };

/** True when this item type has a drawing (otherwise the UI shows its line icon). */
export const hasGearArt = (type) => !!GEAR_SHAPES[type];

/**
 * An item's drawing as an SVG string, or null if it has none yet. carrier: the person carrying
 * it (their light and chrome colour); without one it sits under the safehouse's sodium lamp.
 */
export function gearArt(item, { carrier = null, width = 96 } = {}) {
  const build = item.look && { rifle: rifleBuild, pistol: sidearmBuild }[item.type];
  const shapes = build ? (o) => build({ ...o, look: item.look }) : GEAR_SHAPES[item.type];
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
    back: `<g class="gear-rifle" transform="translate(4 72) rotate(-44) scale(0.9) translate(0 -16)">${item.look ? rifleBuild({ light: c.light, neon: f.chromeColor, look: item.look }) : rifleShapes({ tier, light: c.light, neon: f.chromeColor })}</g>`,
    front: `<path d="M46 48.5 L18 57" stroke="${sling}" stroke-width="1.8"/><path d="M46 47.8 L18 56.3" stroke="${mix(sling, c.light, 0.35)}" stroke-width="0.4"/>`,
  };
}
