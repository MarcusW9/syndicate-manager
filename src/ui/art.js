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

/** A colour a good step darker than the skin: lips and lines that show on any tone. */
function deeper(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift) => Math.round(((n >> shift) & 255) * 0.55).toString(16).padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

// --- shared shapes on the 64×64 grid ----------------------------------------------
const HEADS = {
  oval: '<ellipse cx="32" cy="28" rx="12" ry="14"/>',
  round: '<ellipse cx="32" cy="29" rx="13" ry="13"/>',
  square: '<rect x="19.5" y="15" width="25" height="27" rx="9"/>',
  long: '<ellipse cx="32" cy="28" rx="11" ry="15.5"/>',
};
const HAIR_BACK = {
  long: 'M18 27 C16 9 48 9 46 27 L48 50 C44 48 42 44 42 38 L22 38 C22 44 20 48 16 50 Z',
  bob: 'M18 28 C16 10 48 10 46 28 L46 40 C44 41 42 39 42 36 L22 36 C22 39 20 41 18 40 Z',
  locs: 'M17 27 C15 9 49 9 47 27 L49 52 L45 52 L43 36 L21 36 L19 52 L15 52 Z',
};
const HAIR_TOP = {
  crop: 'M19 26 C18 11 46 11 45 26 C42 19 22 19 19 26 Z',
  buzz: 'M20 24 C20 13 44 13 44 24 C41 19 23 19 20 24 Z',
  long: 'M19 27 C18 11 46 11 45 27 C40 18 24 18 19 27 Z',
  bob: 'M19 27 C18 11 46 11 45 27 C42 17 22 17 19 27 Z',
  bun: 'M19 26 C18 12 46 12 45 26 C42 19 22 19 19 26 Z',
  locs: 'M18 26 C17 10 47 10 46 26 C42 18 22 18 18 26 Z',
  undercut: 'M24 24 C22 10 47 10 45 25 C43 20 34 17 24 24 Z',
  curls: '',
  bald: '',
};
const curls = (fill) => [[22, 17, 5], [28, 13, 5.5], [35, 12.5, 5.5], [41, 16, 5], [19, 23, 4], [45, 22, 4]]
  .map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${fill}"/>`).join('');

// Eyes carry a small highlight so they read on every skin tone, light or deep.
const eyes = (tired, color) => (tired
  ? `<path d="M25 29 h5 M34 29 h5" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/><path d="M25.5 30.6 h4 M34.5 30.6 h4" stroke="#fff" stroke-width="0.6" opacity="0.45"/>`
  : `<ellipse cx="27.5" cy="29" rx="1.6" ry="2" fill="${color}"/><ellipse cx="36.5" cy="29" rx="1.6" ry="2" fill="${color}"/><circle cx="28.1" cy="28.3" r="0.55" fill="#fff"/><circle cx="37.1" cy="28.3" r="0.55" fill="#fff"/>`);
const mouth = (tired, color) => `<path d="${tired ? 'M28.5 37.5 q3.5 -1 7 0' : 'M28.5 36.5 q3.5 2 7 0'}" stroke="${color}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;

function implantMark(kind, load) {
  const glow = 0.45 + load * 0.55;
  const halo = load > 0.5 ? `<circle cx="${kind === 'eye' ? 36.5 : 43}" cy="${kind === 'jaw' ? 36 : kind === 'eye' ? 29 : 23}" r="${4 + load * 4}" fill="${ART.teal}" opacity="${(load - 0.4) * 0.5}"/>` : '';
  if (kind === 'temple') return `${halo}<rect x="41" y="20" width="3.5" height="6" rx="1.2" fill="${ART.teal}" opacity="${glow}"/>`;
  if (kind === 'eye') return `${halo}<circle cx="36.5" cy="29" r="3.2" fill="none" stroke="${ART.teal}" stroke-width="1.3" opacity="${glow}"/>`;
  if (kind === 'jaw') return `${halo}<path d="M38 38 L43 33" stroke="${ART.teal}" stroke-width="1.6" stroke-linecap="round" opacity="${glow}"/>`;
  return '';
}
const bandage = '<g transform="rotate(-14 32 20)"><rect x="20" y="17" width="24" height="5" rx="2" fill="#f1efe8"/><path d="M30 17 v5 M34 17 v5" stroke="#d8d3c6" stroke-width="0.8"/></g>';

// Portraits frame head and upper shoulders (the 64×64 grid cropped in); icons use it all.
const PORTRAIT_FRAME = '8 3 48 48';
function svg(inner, { size, frame = '0 0 64 64' }) {
  return `<svg class="art" viewBox="${frame}" width="${size}" height="${size}" aria-hidden="true" focusable="false">${inner}</svg>`;
}

// --- portrait styles ------------------------------------------------------------------
/**
 * A head-and-shoulders portrait. style: 'flat' (flat colour with a rim of the person's
 * badge colour), 'line' (comms-ID line art), 'noir' (half-lit silhouette).
 */
export function portrait(op, { style = 'flat', size = 40, accent } = {}) {
  const f = faceOf(op);
  const st = stateOf(op);
  const rim = accent ?? op.color ?? ART.teal;
  const head = HEADS[f.shape];
  const back = HAIR_BACK[f.hair] ? `<path d="${HAIR_BACK[f.hair]}"/>` : '';
  const top = f.hair === 'curls' ? curls(f.hairColor) : HAIR_TOP[f.hair] ? `<path d="${HAIR_TOP[f.hair]}" fill="${f.hairColor}"/>` : '';
  const bun = f.hair === 'bun' ? `<circle cx="32" cy="9" r="5" fill="${f.hairColor}"/>` : '';
  const shoulders = 'M7 64 C9 50 20 45 32 45 C44 45 55 50 57 64 Z';
  const extras = (ink) => [
    f.scar ? `<path d="M23 33 l3 4" stroke="${ink}" stroke-width="1" opacity="0.6"/>` : '',
    f.stubble ? `<path d="M24 37 Q32 45 40 37" stroke="${ink}" stroke-width="3" fill="none" opacity="0.18"/>` : '',
    f.glasses ? `<g fill="none" stroke="${ink}" stroke-width="1.2"><circle cx="27.5" cy="29" r="3.6"/><circle cx="36.5" cy="29" r="3.6"/><path d="M31.1 29 h1.8"/></g>` : '',
    f.earring ? `<circle cx="${f.shape === 'round' ? 18.5 : 19.5}" cy="34" r="1.3" fill="${ART.warn}"/>` : '',
  ].join('');

  if (style === 'line') {
    const c = rim;
    return svg(`
      <g fill="none" stroke="${c}" stroke-width="${ART.line}" stroke-linejoin="round">
        <path d="${shoulders}" fill="${f.shirt}"/>
        ${back ? back.replace('<path', `<path fill="${f.hairColor}" fill-opacity="0.35"`) : ''}
        <rect x="27" y="38" width="10" height="9" fill="${f.skin}" fill-opacity="0.35" stroke="none"/>
        ${head.replace('/>', ` fill="${f.skin}" fill-opacity="0.35"/>`)}
      </g>
      ${top.replace(/fill="[^"]+"/g, `fill="${f.hairColor}" fill-opacity="0.55" stroke="${c}" stroke-width="1.2"`)}${bun.replace(/fill="[^"]+"/, `fill="${f.hairColor}" fill-opacity="0.55" stroke="${c}" stroke-width="1.2"`)}
      ${eyes(st.tired, c)}${mouth(st.tired, c)}${extras(c)}
      ${implantMark(f.implant, st.load)}${st.injured ? bandage : ''}`, { size, frame: PORTRAIT_FRAME });
  }

  if (style === 'noir') {
    // Lit from the right in the person's colour; the left half falls into shadow.
    return svg(`
      <defs><linearGradient id="noir-${hash(op.id)}" x1="0" x2="1"><stop offset="0.5" stop-color="${ART.ink}"/><stop offset="0.5" stop-color="${f.skin}"/></linearGradient></defs>
      <path d="${shoulders}" fill="#14171d" stroke="${rim}" stroke-width="1.2"/>
      ${back ? back.replace('<path', `<path fill="${f.hairColor}"`) : ''}
      <rect x="27" y="38" width="10" height="9" fill="url(#noir-${hash(op.id)})"/>
      ${head.replace('/>', ` fill="url(#noir-${hash(op.id)})" stroke="${rim}" stroke-width="1.2"/>`)}
      ${top}${bun}
      ${st.tired ? '<path d="M34 29 h5" stroke="#1b1f28" stroke-width="1.6" stroke-linecap="round"/>' : `<ellipse cx="36.5" cy="29" rx="1.6" ry="2" fill="${ART.ink}"/>`}
      <ellipse cx="27.5" cy="29" rx="1.4" ry="1.8" fill="${rim}" opacity="0.7"/>
      ${implantMark(f.implant, st.load)}${st.injured ? bandage : ''}`, { size, frame: PORTRAIT_FRAME });
  }

  // flat
  return svg(`
    <path d="${shoulders}" fill="${f.shirt}" stroke="${rim}" stroke-width="1.5"/>
    ${back ? back.replace('<path', `<path fill="${f.hairColor}"`) : ''}
    <rect x="27" y="38" width="10" height="9" fill="${f.skin}"/><rect x="27" y="38" width="10" height="3" fill="#000" opacity="0.15"/>
    ${head.replace('/>', ` fill="${f.skin}"/>`)}
    ${top}${bun}
    ${eyes(st.tired, '#0b0b0d')}${mouth(st.tired, deeper(f.skin))}${extras('#1b1b1f')}
    ${implantMark(f.implant, st.load)}${st.injured ? bandage : ''}`, { size, frame: PORTRAIT_FRAME });
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
