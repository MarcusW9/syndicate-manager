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
const HAIR_STYLES = ['crop', 'buzz', 'long', 'bob', 'bun', 'curls', 'locs', 'undercut', 'bald'];
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

/** The stable features of a face. op: { id, name, age }. */
export function faceOf(op) {
  const r = picker(hash(`${op.id}|${op.name}`));
  const culture = cultureOf(op.name);
  const [lo, hi] = SKIN_BANDS[culture] ?? [0, ART.skin.length - 1];
  const lean = HAIR_LEAN[culture] ?? [];
  const style = r.chance(0.35) && lean.length ? r.pick(lean) : r.pick(HAIR_STYLES);
  const older = (op.age ?? 25) >= 45;
  return {
    skin: ART.skin[lo + r.int(hi - lo + 1)],
    shape: r.pick(['oval', 'round', 'square', 'long']),
    hair: style,
    hairColor: older && r.chance(0.6) ? ART.grey : r.chance(0.15) ? r.pick(ART.hairDyed) : r.pick(ART.hair),
    implant: r.pick(['none', 'temple', 'temple', 'eye', 'jaw']),
    scar: r.chance(0.2),
    glasses: r.chance(0.15),
    stubble: r.chance(0.12),
    earring: r.chance(0.25),
    shirt: r.pick(['#262b36', '#2b2433', '#1f2b2a', '#33291f', '#232838']),
  };
}

/** What the portrait shows about someone's condition today (the same facts the screen writes out). */
export function stateOf(op) {
  const c = op.condition ?? {};
  return {
    injured: ['light', 'serious', 'critical'].includes(c.injury),
    tired: (c.fatigue ?? 0) > 60,
    load: Math.min(1, (c.neuralLoad ?? 0) / 100),
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

function eye(x, tired, c) {
  const y = 29;
  if (tired) {
    return `<path d="M${x - 2.6} ${y + 1} Q${x} ${y + 3.6} ${x + 2.6} ${y + 1} Q${x} ${y + 2} ${x - 2.6} ${y + 1} Z" fill="${c.shade}"/>
      <path d="M${x - 2.1} ${y} Q${x} ${y - 0.5} ${x + 2.1} ${y} Q${x} ${y + 0.8} ${x - 2.1} ${y} Z" fill="#120d0b"/>
      <path d="M${x - 2.3} ${y - 0.4} Q${x} ${y - 1.3} ${x + 2.3} ${y - 0.4}" stroke="${c.lip}" stroke-width="0.8" fill="none"/>`;
  }
  return `<path d="M${x - 2.1} ${y} Q${x} ${y - 1.7} ${x + 2.1} ${y} Q${x} ${y + 1.1} ${x - 2.1} ${y} Z" fill="#120d0b"/>
    <circle cx="${x + 0.6}" cy="${y - 0.45}" r="0.45" fill="#fff" opacity="0.85"/>`;
}

function implantMark(kind, load, w) {
  const glow = 0.5 + load * 0.5;
  const cyan = '#3de8d8';
  const halo = (x, y) => (load > 0.4 ? `<circle cx="${x}" cy="${y}" r="${3 + load * 5}" fill="${cyan}" opacity="${(load - 0.3) * 0.45}"/>` : '');
  if (kind === 'temple') {
    const x = 32 + w - 2.6;
    return `${halo(x, 23)}<path d="M${x} 19 V27" stroke="${cyan}" stroke-width="1.1" stroke-linecap="round" opacity="${glow}"/><circle cx="${x}" cy="27.5" r="0.9" fill="${cyan}" opacity="${glow}"/>`;
  }
  if (kind === 'eye') return `${halo(36.5, 29)}<path d="M33.6 27 A3.2 3.2 0 0 1 39.6 27.6" stroke="${cyan}" stroke-width="0.9" fill="none" opacity="${glow}"/><circle cx="39.7" cy="28" r="0.6" fill="${cyan}" opacity="${glow}"/>`;
  if (kind === 'jaw') return `${halo(40, 36)}<path d="M37 40.5 L${32 + w - 1.5} 34" stroke="${cyan}" stroke-width="1" stroke-linecap="round" opacity="${glow}"/><circle cx="37" cy="40.5" r="0.7" fill="${cyan}" opacity="${glow}"/>`;
  return '';
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
  const strands = hair.strands ? [-5, -1.5, 2, 5.5].map((dx) => `<path d="M${32 + dx} 16 V22" stroke="${mix(c.hair, '#000', 0.35)}" stroke-width="0.8"/>`).join('') : '';

  return `<svg class="art portrait" viewBox="${PORTRAIT_FRAME}" width="${size}" height="${size}" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${id}bg" x1="1" x2="0"><stop offset="0" stop-color="${c.light}" stop-opacity="${st.tired ? 0.1 : 0.28}"/><stop offset="0.65" stop-color="${c.light}" stop-opacity="0"/></linearGradient>
    <clipPath id="${id}h"><path d="${head}"/></clipPath>
    <clipPath id="${id}s"><path d="M6 64 C8 52 18 47 32 47 C46 47 56 52 58 64 Z"/></clipPath>
    ${hair.top ? `<clipPath id="${id}t"><path d="${hair.top}"/></clipPath>` : ''}
  </defs>
  <rect x="0" y="0" width="64" height="64" fill="#0d1016"/><rect x="0" y="0" width="64" height="64" fill="url(#${id}bg)"/>

  ${hair.back ? `<path d="${hair.back}" fill="${c.hair}"/>` : ''}
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
    ${hair.shaved ? `<path d="M${L - 1} 15 L${L + 4} 15 L${L + 3} 27 L${L - 1} 27 Z" fill="${c.hair}" opacity="0.3"/>` : ''}
    <path d="M${L + 2} 26.5 Q28 25.6 30.4 27.6 L28 28.2 Z" fill="${c.midShade}"/>
  </g>

  <path d="M31.5 30 L30.1 35.4 L32.7 36.2 L31.6 34.9 Z" fill="${c.shade}"/>
  <path d="M32.9 33.6 L33.5 35.6 L32.7 36.2 Z" fill="${c.lit}" opacity="0.7"/>
  <path d="M30.6 36.3 h2.6" stroke="${c.lip}" stroke-width="0.7" stroke-linecap="round"/>
  ${eye(27.4, st.tired, c)}${eye(36.6, st.tired, c)}
  <path d="M${st.tired ? '25 26.4 L29.6 26.6' : '24.9 25.6 L29.7 25.1'}" stroke="${c.brow}" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M${st.tired ? '34.4 26.6 L39 26.4' : '34.3 25.1 L39.1 25.6'}" stroke="${c.brow}" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M29.4 ${st.tired ? 40.4 : 40} Q32 ${st.tired ? 40.1 : 40.9} 34.6 ${st.tired ? 40.4 : 40}" stroke="${c.lip}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  <path d="M30.2 40.7 Q32 42.2 33.8 40.7 Z" fill="${mix(c.skin, '#7a3030', 0.18)}"/>
  ${f.scar ? `<path d="M${L + 3} 22.5 L${L + 6} 27" stroke="${mix(c.skin, '#ffd5d5', 0.35)}" stroke-width="0.7"/>` : ''}
  ${f.glasses ? `<g fill="${c.light}" fill-opacity="0.12" stroke="#0d0d0f" stroke-width="0.8"><rect x="24.3" y="27" width="6.2" height="4.2" rx="1.2"/><rect x="33.5" y="27" width="6.2" height="4.2" rx="1.2"/></g><path d="M30.5 28.6 h3" stroke="#0d0d0f" stroke-width="0.8"/>` : ''}

  ${hair.top ? `<path d="${hair.top}" fill="${c.hair}" ${hair.thin ? 'opacity="0.6"' : ''}/>
    <g clip-path="url(#${id}t)"><path d="M${32 + w * 0.25} 0 L64 0 L64 30 L${32 + w * 0.6} 30 Z" fill="${c.hairLit}" opacity="0.75"/>${strands}</g>` : ''}
  ${hair.curls ? `<g fill="${c.hairLit}" opacity="0.55">${[[R - 6, 11, 2.2], [R - 1.5, 16.5, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>` : ''}
  ${hair.bun ? `<circle cx="33" cy="4.5" r="4.4" fill="${c.hair}"/><path d="M34 0.6 A4.4 4.4 0 0 1 37.3 5.4 L34.5 4.5 Z" fill="${c.hairLit}" opacity="0.7"/>` : ''}
  ${!hair.top && !hair.curls ? `<path d="M${32 + w * 0.2} 12.5 Q${R - 1} 14 ${R - 0.6} 21" stroke="${c.lit}" stroke-width="1" fill="none" opacity="0.6"/>` : ''}

  ${implantMark(f.implant, st.load, w)}
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
