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
function chromeMarks(f, load, w, tired) {
  const col = f.chromeColor;
  const glow = 0.5 + load * 0.5;
  const halo = (x, y) => (load > 0.4 ? `<circle cx="${x}" cy="${y}" r="${3 + load * 5}" fill="${col}" opacity="${(load - 0.3) * 0.45}"/>` : '');
  const R = 32 + w;
  switch (f.chrome) {
    case 'cybereye':
      // The lit-side eye is a lens: metal rim, glowing iris, a fine seam round the socket.
      return `${halo(36.6, 29)}<path d="M33.3 26.2 Q36.6 24.6 39.9 26.6 L40.2 31.4 Q36.6 33.2 33.2 31.6 Z" fill="none" stroke="${mix(f.skin, '#000', 0.45)}" stroke-width="0.4"/>
        <circle cx="36.6" cy="29" r="2.4" fill="#0b0f12" stroke="#9aa3ad" stroke-width="0.6"/>
        <circle cx="36.6" cy="29" r="1.25" fill="${col}" opacity="${glow}"/><circle cx="36.6" cy="29" r="0.45" fill="#0b0f12"/>
        ${tired ? `<path d="M34 28 Q36.6 26.6 39.2 28 L39.2 26.4 L34 26.4 Z" fill="${mix(f.skin, SHADOW, 0.2)}"/>` : ''}`;
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
export function portrait(op, { size = 44 } = {}) {
  const f = faceOf(op);
  const st = stateOf(op);
  const severity = op.condition?.injury;
  const c = palette(f, op);
  const g = HEAD_SHAPES[f.shape];
  const w = g.w;
  const id = `pf${++uid}`;
  const head = headPath(g);
  const hair = hairPaths(f.hair, w);
  const L = 32 - w, R = 32 + w;

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
  </defs>
  <rect x="0" y="0" width="64" height="64" fill="#0d1016"/><rect x="0" y="0" width="64" height="64" fill="url(#${id}bg)"/>

  ${hair.back ? `<path d="${hair.back}" fill="${c.hair}"/>${f.splitDye ? `<g clip-path="url(#${id}b)"><rect x="0" y="0" width="32" height="64" fill="${f.splitDye}"/></g>` : ''}${fiberLines}` : ''}
  ${hair.curls ? `<g fill="${c.hair}">${curlBlobs}</g><path d="${hair.back}" fill="${c.hair}"/>` : ''}

  <path d="M6 64 C8 52 18 47 32 47 C46 47 56 52 58 64 Z" fill="${c.shirt}"/>
  <g clip-path="url(#${id}s)"><path d="M64 44 L40 47 L46 64 L64 64 Z" fill="${c.shirtLit}"/><path d="M27 46 L32 54 L37 46 Z" fill="${mix(c.shirt, '#000', 0.35)}"/></g>
  <path d="M27.6 37 L27.6 48 Q32 51 36.4 48 L36.4 37 Z" fill="${c.shade}"/><path d="M34.6 38 L36.4 37 L36.4 48 L34.6 49 Z" fill="${c.lit}" opacity="0.8"/>

  <ellipse cx="${L + 0.3}" cy="30" rx="1.9" ry="3.4" fill="${c.shade}"/>
  <ellipse cx="${R - 0.3}" cy="30" rx="1.9" ry="3.4" fill="${c.skin}"/><path d="M${R + 0.6} 27.5 Q${R + 1.5} 30 ${R + 0.4} 33" stroke="${c.lit}" stroke-width="0.9" fill="none"/>
  ${f.earring ? `<circle cx="${R}" cy="34" r="0.9" fill="#f2b544"/>` : ''}

  <path d="${head}" fill="${c.skin}"/>
  <g clip-path="url(#${id}h)">
    <path d="M0 0 L${32 - w * 0.12} 9 C${32 - w * 0.55} 20 ${32 - w * 0.48} 31 ${30.5} 48 L0 64 Z" fill="${c.shade}"/>
    <path d="M${32 + w * 0.3} 34.5 L${R - 0.8} 31.5 L${32 + g.j + 1} 39 Z" fill="${c.midShade}" opacity="0.55"/>
    <path d="M64 0 L${R - 1.8} 12 L${R - 1.3} 30 L${32 + g.j - 0.3} 40.5 L64 64 Z" fill="${c.lit}"/>
        ${f.stubble ? `<path d="M${L} 36 Q32 50 ${R} 36 L${R} 50 L${L} 50 Z" fill="${c.hair}" opacity="0.28"/>` : ''}
    ${hair.shaved ? `<path d="M${L - 1} 15 L${L + 4} 15 L${L + 3} 27 L${L - 1} 27 Z" fill="${c.hair}" opacity="0.3"/>${shavedInk}` : ''}
    <path d="M${L + 2} 26.5 Q28 25.6 30.4 27.6 L28 28.2 Z" fill="${c.midShade}"/>
  </g>

  <path d="M31.5 30 L30.1 35.4 L32.7 36.2 L31.6 34.9 Z" fill="${c.shade}"/>
  <path d="M32.9 33.6 L33.5 35.6 L32.7 36.2 Z" fill="${c.lit}" opacity="0.7"/>
  <path d="M30.6 36.3 h2.6" stroke="${c.lip}" stroke-width="0.7" stroke-linecap="round"/>
  ${eye(27.4, st.tired, c, st.expression)}${f.chrome === 'cybereye' ? '' : eye(36.6, st.tired, c, st.expression)}
  ${browsAndMouth(st, c)}
  ${markings(f, c, w)}
  ${f.glasses && f.chrome !== 'cybereye' ? `<g fill="${c.light}" fill-opacity="0.12" stroke="#0d0d0f" stroke-width="0.8"><rect x="24.3" y="27" width="6.2" height="4.2" rx="1.2"/><rect x="33.5" y="27" width="6.2" height="4.2" rx="1.2"/></g><path d="M30.5 28.6 h3" stroke="#0d0d0f" stroke-width="0.8"/>` : ''}

  ${hair.top ? `<path d="${hair.top}" fill="${c.hair}" ${hair.thin ? 'opacity="0.6"' : ''}/>
    <g clip-path="url(#${id}t)">${f.splitDye ? `<rect x="0" y="0" width="32" height="64" fill="${f.splitDye}" ${hair.thin ? 'opacity="0.6"' : ''}/>` : ''}<path d="M${32 + w * 0.25} 0 L64 0 L64 30 L${32 + w * 0.6} 30 Z" fill="${c.hairLit}" opacity="0.75"/>${strands}
    ${hair.slick ? `<g stroke="${mix(c.hair, '#000', 0.35)}" stroke-width="0.5" fill="none"><path d="M${L + 2} 21 Q30 11 ${R - 2} 13"/><path d="M${L + 4} 19 Q32 12 ${R - 1} 17"/></g><path d="M${32 + w * 0.15} 11 Q${R - 2} 12 ${R - 0.8} 19" stroke="#fff" stroke-width="0.9" fill="none" opacity="0.35"/>` : ''}</g>` : ''}
  ${hair.curls ? `<g fill="${c.hairLit}" opacity="0.55">${[[R - 6, 11, 2.2], [R - 1.5, 16.5, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>` : ''}
  ${hair.bun ? `<circle cx="33" cy="4.5" r="4.4" fill="${c.hair}"/><path d="M34 0.6 A4.4 4.4 0 0 1 37.3 5.4 L34.5 4.5 Z" fill="${c.hairLit}" opacity="0.7"/>` : ''}
  ${!hair.top && !hair.curls ? `<path d="M${32 + w * 0.2} 12.5 Q${R - 1} 14 ${R - 0.6} 21" stroke="${c.lit}" stroke-width="1" fill="none" opacity="0.6"/>` : ''}

  ${f.visor ? `<path d="M${L - 1} 26.2 L${R + 1} 25.8 L${R + 0.6} 31.2 L${L - 0.6} 31.6 Z" fill="#0b0f14"/><path d="M${L - 0.4} 27.2 L${R + 0.4} 26.8" stroke="${c.light}" stroke-width="0.6" opacity="${st.tired ? 0.35 : 0.85}"/><path d="M${R - 7} 29.6 h2 M${R - 4.4} 29.6 h1" stroke="${c.light}" stroke-width="0.5" opacity="0.6"/>` : ''}
  ${chromeMarks(f, st.load, w, st.tired)}
  ${st.injured ? injuryMarks(severity, w) : ''}
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
