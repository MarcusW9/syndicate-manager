// Design session (2026-11-06, owner: the 3:1 frame stretches compact things, "can it not be a square
// shape for a lot of these things"; the stealth tool becomes the ghost kit, with a heat veil and a
// lens blinder beside the picks; a med gun for the trauma kit): the compact items redrawn in a
// square 64×64 frame, drawn like the rifle (flat colour, hard light from the right, no outlines;
// street patched, pro clean with the carrier's neon). Then a mock-up of the armoury row and the gear
// slots holding square and wide drawings together, each fitted into one box.
// Writes drafts/prototypes/gear-options-square.html; with an out dir, screenshots it.
//   node scripts/gear-options-square.mjs [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { mix, gearArt } from '../src/ui/art.js';

const SHADOW = '#1b2340';
const LIGHTS = { cyan: '#3de8d8', red: '#ff3d5f', sodium: '#f2b544', violet: '#9b8cff' };
const NEON = '#3de8d8';
const TAPE = '#f2b544';
const CROSS = '#e8484f';
let uid = 0;
const lit = (c, light, t = 0.45) => mix(c, light, t);
const shade = (c, t = 0.45) => mix(c, SHADOW, t);
const box = (x, y, w, h, fill, light, { r = 0, t = 0.45, top = 1.2 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/><rect x="${x}" y="${y}" width="${w}" height="${Math.min(top, h)}" rx="${Math.min(r, top / 2)}" fill="${lit(fill, light, t)}"/><rect x="${x}" y="${y + h - Math.min(top, h)}" width="${w}" height="${Math.min(top, h)}" fill="${shade(fill)}"/>`;
const glow = (d, c, w = 0.7) => `<path d="${d}" stroke="${c}" stroke-width="${w * 3}" opacity="0.18" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
// The right-hand edge of a shape catching the light: a thin strip along a path.
const rim = (d, light, w = 1) => `<path d="${d}" stroke="${light}" stroke-width="${w}" fill="none" opacity="0.55" stroke-linecap="round"/>`;

// --- armoured vest ------------------------------------------------------------------------
function vestCarrier({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1f242b' : '#55604a';
  const dark = pro ? '#121519' : '#343b2e';
  return [
    `<path d="M20 6 H26 L27 14 H37 L38 6 H44 L45 15 L50 18 V56 H14 V18 L19 15 Z" fill="${cloth}"/>`,
    `<path d="M20 6 H26 L26.2 7.4 H20.1 Z M38 6 H44 L44.1 7.4 H38 Z" fill="${lit(cloth, light, 0.6)}"/>`,
    rim('M45 15 L50 18 V56', light),
    box(21, 18, 22, 17, dark, light, { r: 1.6 }),
    [0, 1, 2].map((r) => `<path d="M16 ${39 + r * 3.4} H48" stroke="${shade(cloth, 0.6)}" stroke-width="1"/>`).join(''),
    box(17, 44, 10, 10, pro ? '#272c35' : '#6b5a3a', light, { r: 1 }), box(37, 44, 10, 10, pro ? '#272c35' : '#4a5340', light, { r: 1 }),
    pro ? glow('M23 33 H41', neon) : `<rect x="27" y="23" width="10" height="3" fill="${TAPE}" opacity="0.85"/><path d="M46 50 l-8 2" stroke="${TAPE}" stroke-width="1.2" opacity="0.7"/>`,
    `<rect x="14" y="55" width="36" height="1.6" fill="${shade(cloth, 0.6)}"/>`,
  ].join('');
}
function vestJacket({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1b1f26' : '#7a2f2a';
  const dark = pro ? '#101317' : '#4f1e1b';
  return [
    `<path d="M22 8 L28 6 L32 9 L36 6 L42 8 L52 15 L58 48 L50 50 L46 28 V58 H18 V28 L14 50 L6 48 L12 15 Z" fill="${cloth}"/>`,
    rim('M42 8 L52 15 L58 48', light, 1.2),
    `<path d="M28 6 L32 9 L36 6 L35 13 L32 15 L29 13 Z" fill="${dark}"/>`,
    `<path d="M32 15 V58" stroke="${shade(cloth, 0.7)}" stroke-width="1"/><path d="M32 15 V58" stroke="#c9ccd3" stroke-width="0.3" stroke-dasharray="1 0.8"/>`,
    [24, 31, 38, 45, 52].map((y) => `<path d="M19 ${y} H45" stroke="${shade(cloth, 0.5)}" stroke-width="0.6"/>`).join(''),
    pro ? glow('M19 27 H45', neon, 0.5) : `<rect x="50" y="34" width="6" height="6" rx="0.8" fill="#3a3f47" transform="rotate(-10 53 37)"/><path d="M36 36 q4 -5 8 -1 q-3 2 -1 5 q2 2 5 0" stroke="#d6a640" stroke-width="0.8" fill="none" opacity="0.85"/>`,
  ].join('');
}
function vestWeave({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#20262e' : '#4b5059';
  const hexes = [];
  for (let r = 0; r < 7; r++) for (let k = 0; k < 6; k++) hexes.push(`<path d="M${17.5 + k * 5 + (r % 2) * 2.5} ${21 + r * 4.6} l2.2 -1.3 l2.2 1.3 v2.4 l-2.2 1.3 l-2.2 -1.3 Z" fill="none" stroke="${pro ? mix(cloth, neon, 0.28) : shade(cloth, 0.3)}" stroke-width="0.45"/>`);
  return [
    `<path d="M26 5 H38 L40 11 L48 14 L50 58 H14 L16 14 L24 11 Z" fill="${cloth}"/>`,
    `<path d="M26 5 H38 L38.3 6.4 H25.7 Z" fill="${lit(cloth, light, 0.55)}"/>`,
    rim('M40 11 L48 14 L50 58', light),
    hexes.join(''),
    `<path d="M14 56.6 H50" stroke="${shade(cloth, 0.6)}" stroke-width="2"/>`,
    pro ? `${glow('M17 15 L32 19 L47 15', neon, 0.5)}<circle cx="32" cy="19" r="1" fill="${neon}"/>` : `<rect x="34" y="38" width="9" height="7" fill="#5a5f68" transform="rotate(8 38 41)"/><path d="M34.6 39.4 l8 1 M34.4 42 l8 1" stroke="#3a3f47" stroke-width="0.5"/>`,
  ].join('');
}

// --- trauma kit ---------------------------------------------------------------------------
function kitBag({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1d2229' : '#7a6a4c';
  return [
    `<path d="M14 26 Q32 2 50 26" stroke="${shade(cloth, 0.3)}" stroke-width="3" fill="none"/>${rim('M33 8 Q44 12 50 26', light, 0.8)}`,
    box(8, 24, 48, 30, cloth, light, { r: 3, top: 1.6 }),
    `<path d="M8 31 H56" stroke="${shade(cloth, 0.5)}" stroke-width="0.8"/>`,
    box(24, 34, 16, 14, pro ? '#262b33' : '#e9e2cf', light, { r: 1.2, t: 0.2 }),
    `<path d="M32 36.6 V45.4 M27.6 41 H36.4" stroke="${pro ? neon : CROSS}" stroke-width="3.2"/>`,
    pro ? glow('M10 51.6 H54', neon, 0.5) : `<rect x="11" y="44" width="10" height="4" fill="${TAPE}" opacity="0.8" transform="rotate(-8 16 46)"/>`,
  ].join('');
}
function kitBox({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#232831' : '#d9d3c4';
  const foam = pro ? '#14171c' : '#2b2f36';
  return [
    `<path d="M10 6 H54 V26 H10 Z" fill="${shade(shell, 0.25)}"/><rect x="16" y="10" width="32" height="12" fill="${pro ? '#101317' : '#bfb7a5'}"/>`,
    `<path d="M24 12.4 V19.6 M20.4 16 H27.6" stroke="${pro ? neon : CROSS}" stroke-width="2.4"/><path d="M31 13.4 h13 M31 16.4 h10 M31 19.4 h12" stroke="${pro ? '#8a93a6' : '#7a7466'}" stroke-width="0.7"/>`,
    box(6, 26, 52, 30, shell, light, { r: 1.6, top: 1.4 }),
    `<rect x="9" y="29" width="46" height="24" rx="1" fill="${foam}"/>`,
    [0, 1, 2, 3].map((i) => `<rect x="${12 + i * 5.4}" y="31.6" width="3.6" height="17" rx="1.6" fill="${pro ? '#e9ecf1' : '#cfd3d9'}"/><rect x="${12 + i * 5.4}" y="31.6" width="3.6" height="3.6" rx="1.4" fill="${[CROSS, TAPE, '#5fe0a5', CROSS][i]}"/>`).join(''),
    `<circle cx="42" cy="36" r="5.6" fill="#efe8dc"/><circle cx="42" cy="36" r="2" fill="${foam}"/>`,
    `<path d="M36 44 L50 51 M36 51 L50 44" stroke="#8a93a6" stroke-width="1.2"/>`,
    pro ? `<circle cx="54" cy="53" r="1" fill="${neon}"/>` : `<path d="M8 52 l4 -3" stroke="${shade(shell, 0.5)}" stroke-width="0.8"/>`,
  ].join('');
}
function kitRoll({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1d2229' : '#3f5a4a';
  return [
    box(6, 10, 52, 44, cloth, light, { r: 1.4, top: 1.4 }),
    `<path d="M6 32 H58" stroke="${shade(cloth, 0.55)}" stroke-width="1"/>`,
    [0, 1, 2, 3].map((i) => `<rect x="${9 + i * 12.4}" y="22" width="11" height="9" fill="${shade(cloth, 0.25)}"/><rect x="${9 + i * 12.4}" y="44" width="11" height="9" fill="${shade(cloth, 0.25)}"/>`).join(''),
    `<rect x="11" y="13" width="3" height="15" rx="1.4" fill="#e9ecf1"/><rect x="16" y="14" width="3" height="14" rx="1.4" fill="#e9ecf1"/><rect x="11" y="13" width="3" height="3" fill="${CROSS}"/><rect x="16" y="14" width="3" height="3" fill="${TAPE}"/>`,
    `<path d="M24 29 q4 -15 8 0" stroke="#ff9a3d" stroke-width="2" fill="none"/>`,
    `<circle cx="44" cy="22" r="5" fill="#e9e2cf"/><circle cx="44" cy="22" r="2" fill="${shade(cloth, 0.25)}"/>`,
    `<rect x="12" y="35" width="3" height="15" rx="1.4" fill="#8a93a6"/><rect x="12" y="35" width="3" height="2.6" rx="1.2" fill="${light}"/>`,
    `<path d="M22 36 L32 50 M22 50 L32 36" stroke="#c9ccd3" stroke-width="1.2"/>`,
    box(38, 36, 14, 14, '#e9e2cf', light, { r: 0.8, t: 0.2 }), `<path d="M45 38.6 V47.4 M40.6 43 H49.4" stroke="${pro ? neon : CROSS}" stroke-width="2.4"/>`,
    pro ? glow('M8 52.6 H56', neon, 0.5) : '',
  ].join('');
}
// D: the med gun. A pistol-grip scanner that reads the wound and fires an injector cartridge.
function kitGun({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#e3e6ea' : '#9aa0a8';
  const dark = pro ? '#1d2229' : '#3a3f47';
  return [
    `<path d="M14 36 L22 36 L18 56 L10 55 Z" fill="${dark}"/>${pro ? '' : `<path d="M12 42 l8 1 M11.4 46 l8 1 M10.8 50 l8 1" stroke="${TAPE}" stroke-width="1" opacity="0.6"/>`}`,
    `<path d="M10 22 Q10 18 14 18 L46 18 Q50 18 50 22 L50 34 Q50 38 46 38 L14 38 Q10 38 10 34 Z" fill="${shell}"/>`,
    `<path d="M10 22 Q10 18 14 18 L46 18 Q50 18 50 22 L50 23.6 Q49.6 19.6 46 19.6 L14 19.6 Q10.4 19.6 10 23.6 Z" fill="${lit(shell, light, 0.5)}"/>`,
    rim('M50 22 V34', light),
    `<rect x="16" y="22" width="18" height="11" rx="1" fill="#0b1a1c"/>`,
    `<path d="M18 28 l3 0 l1.6 -3.6 l2 7 l1.6 -3.4 h6" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="0.8" fill="none"/>`,
    pro ? `<rect x="16" y="10" width="18" height="7" rx="0.8" fill="${neon}" opacity="0.12"/><path d="M18 13.4 h8 M18 15 h12" stroke="${neon}" stroke-width="0.6" opacity="0.8"/>` : '<path d="M30 22 L26 28 L29 31" stroke="#c9ccd3" stroke-width="0.4" fill="none" opacity="0.8"/>',
    `<path d="M50 24 L58 26 V30 L50 32 Z" fill="${dark}"/><circle cx="58" cy="28" r="1" fill="${pro ? neon : light}"/>`,
    box(36, 22, 10, 8, '#e9e2cf', light, { r: 1, t: 0.25 }), `<rect x="38" y="24" width="6" height="2" fill="${CROSS}"/>`,
    `<path d="M22 38 Q24 44 28 42" stroke="${dark}" stroke-width="1.2" fill="none"/>`,
  ].join('');
}

// --- ghost kit ----------------------------------------------------------------------------
function ghostRoll({ tier, light, neon }) {
  const pro = tier === 'pro';
  const leather = pro ? '#1d2229' : '#6b4a2e';
  const steel = pro ? '#c9ccd3' : '#9aa0a8';
  const tips = ['M0 0 l2.6 -2', 'M0 0 q1.3 -2.6 2.6 0 q1.3 2.6 2.6 0', 'M0 0 l1.3 -1.4 l1.3 1.4 l1.3 -1.4 l1.3 1.4', 'M0 0 l3 -2.6'];
  return [
    box(6, 8, 52, 48, leather, light, { r: 1.6, top: 1.4 }),
    `<path d="M6 32 H58" stroke="${shade(leather, 0.55)}" stroke-width="1"/>`,
    tips.map((t, i) => `<path d="M${13 + i * 8} 29 V13" stroke="${steel}" stroke-width="1.2"/><path d="${t}" transform="translate(${13 + i * 8} 13)" stroke="${steel}" stroke-width="1.2" fill="none"/><rect x="${11.2 + i * 8}" y="24" width="3.6" height="6" rx="0.8" fill="${pro ? '#262b33' : '#2b2f36'}"/>`).join(''),
    `<path d="M47 29 V14 h5" stroke="${steel}" stroke-width="1.4" fill="none"/>`,
    [0, 1, 2].map((i) => `<path d="M${11 + i * 3} 52 L${22 + i * 5} 37" stroke="${steel}" stroke-width="1.6" stroke-linecap="round"/>`).join(''),
    box(36, 38, 18, 13, pro ? '#1a1e24' : '#2f6b4a', light, { r: 1 }), `<rect x="38.4" y="40.4" width="6" height="4" fill="#c9a54a"/>`,
    pro ? glow('M38.4 48 H51.6', neon, 0.5) : '<path d="M46.6 41 h5 M46.6 43 h4" stroke="#5a5f68" stroke-width="0.6"/>',
  ].join('');
}
function ghostDecoder({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#1d2229' : '#c2a23a';
  return [
    `<path d="M38 22 a9 9 0 0 1 18 0 v5" stroke="#9aa0a8" stroke-width="3" fill="none"/>`,
    box(34, 25, 26, 22, '#5a5f68', light, { r: 2.4 }), `<circle cx="47" cy="34" r="2.6" fill="#0d1016"/><rect x="46.2" y="34" width="1.6" height="6" fill="#0d1016"/>`,
    `<path d="M30 42 H44" stroke="#c9ccd3" stroke-width="1.2"/>`,
    box(4, 28, 28, 30, shell, light, { r: 3, top: 1.4 }),
    rim('M32 31 V55', light),
    `<rect x="8" y="32" width="20" height="12" rx="0.8" fill="#0b1a1c"/><path d="M10 36 h6 M10 39.6 h12" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="1"/><path d="M19 36 h1.4 M22 36 h1.4 M25 36 h1.4" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="1"/>`,
    `<circle cx="18" cy="51" r="4" fill="${shade(shell, 0.4)}"/><circle cx="18" cy="51" r="2.4" fill="${shade(shell, 0.2)}"/><path d="M18 48.6 v2" stroke="${lit(shell, light, 0.6)}" stroke-width="0.8"/>`,
    pro ? glow('M7 56 H29', neon, 0.5) : '<path d="M7 55 l7 -1.4" stroke="#2b2f36" stroke-width="0.9"/>',
  ].join('');
}
// C: the heat veil. A hooded poncho of heat-damping cloth, front-on, with a glare strip across the
// shoulders that smears a camera's picture. Not invisibility: hard to see on thermal, blurry on a lens.
function ghostVeil({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1b2129' : '#565a55';
  const dark = shade(cloth, 0.35);
  return [
    `<path d="M32 4 Q42 4 44 16 L58 50 Q44 58 32 58 Q20 58 6 50 L20 16 Q22 4 32 4 Z" fill="${cloth}"/>`,
    `<path d="M24 14 Q32 6 40 14 Q40 24 32 26 Q24 24 24 14 Z" fill="${dark}"/>`,
    rim('M44 16 L58 50', light, 1.2),
    [16, 26, 38, 48].map((x) => `<path d="M${x} ${x < 32 ? 30 : 30} Q${x + (x < 32 ? -2 : 2)} 44 ${x + (x < 32 ? -4 : 4)} 56" stroke="${shade(cloth, 0.5)}" stroke-width="0.8" fill="none"/>`).join(''),
    pro ? `<path d="M14 30 Q32 36 50 30 L51 33 Q32 39 13 33 Z" fill="url(#holo)"/>` : `<path d="M14 30 Q32 36 50 30 L51 33 Q32 39 13 33 Z" fill="#9aa0a8" opacity="0.7"/><path d="M20 33 l2 1 M30 35 l2 0.4 M40 34 l2 -0.6" stroke="#2b2f36" stroke-width="0.6"/>`,
    pro ? glow('M24 14 Q32 6 40 14', neon, 0.4) : `<rect x="40" y="44" width="8" height="5" fill="${TAPE}" opacity="0.7" transform="rotate(20 44 46)"/>`,
  ].join('');
}
// D: the lens blinder. A palm-sized emitter with a ring of bright diodes; the camera it's aimed at
// gets nothing but white for a few seconds.
function ghostBlinder({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#1d2229' : '#3a3f47';
  return [
    `<path d="M14 40 L24 30 L36 42 L26 52 Z" fill="${shade(shell, 0.2)}"/>${pro ? '' : `<path d="M16 42 l8 -8 M19 45 l8 -8" stroke="${TAPE}" stroke-width="1.2" opacity="0.7"/>`}`,
    `<circle cx="38" cy="26" r="14" fill="${shell}"/><path d="M38 12 a14 14 0 0 1 14 14" stroke="${lit(shell, light, 0.6)}" stroke-width="1.6" fill="none"/>`,
    `<circle cx="38" cy="26" r="9" fill="#0d1016"/>`,
    [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return `<circle cx="${(38 + Math.cos(a) * 6.4).toFixed(2)}" cy="${(26 + Math.sin(a) * 6.4).toFixed(2)}" r="1.1" fill="${pro ? neon : '#e9ecf1'}"/>`; }).join(''),
    `<circle cx="38" cy="26" r="2.4" fill="${pro ? '#e9ecf1' : light}"/>`,
    pro ? `<circle cx="38" cy="26" r="11" fill="none" stroke="${neon}" stroke-width="0.6" opacity="0.6"/>` : '',
    `<rect x="24" y="42" width="5" height="3" rx="0.8" fill="#ff3d5f" transform="rotate(-45 26 43)"/>`,
  ].join('');
}

// --- implants (the part itself, out of the body) ------------------------------------------
const packaging = (pro, light, neon) => (pro
  ? `${box(4, 50, 56, 8, '#8a929c', light, { r: 1.2, t: 0.5 })}${glow('M8 52 H22', neon, 0.4)}`
  : `<path d="M6 6 H58 V58 H6 Z" fill="#e9ecf1" opacity="0.06"/><path d="M6 6 H58" stroke="#e9ecf1" stroke-width="1.4" opacity="0.25"/><path d="M6 9 H58" stroke="#ff3d5f" stroke-width="0.8" opacity="0.4"/>
     <rect x="36" y="44" width="18" height="10" fill="#e9e2cf" transform="rotate(-6 45 49)"/><path d="M38.6 47.6 q2.4 -1.2 4.8 0 t4.8 0 M38.6 51 q3.4 -1.2 7 0" stroke="#2b5fa8" stroke-width="0.7" fill="none" transform="rotate(-6 45 49)"/>`);
function reflexHarness({ tier, light, neon }) {
  const pro = tier === 'pro';
  const node = pro ? '#2a2f38' : '#5a5f68';
  const wire = pro ? neon : '#c97a2e';
  return [
    packaging(pro, light, neon),
    `<path d="M26 12 Q30 30 26 48" stroke="${shade(node, 0.2)}" stroke-width="2.4" fill="none"/><path d="M26 12 Q30 30 26 48" stroke="${wire}" stroke-width="0.5" fill="none" opacity="0.85"/>`,
    [0, 1, 2, 3, 4, 5].map((i) => { const y = 14 + i * 6.6; const x = 26 + Math.sin((i / 5) * Math.PI) * 3.2; return `${box(x - 4.4, y - 2.6, 8.8, 5.2, node, light, { r: 1.2, top: 0.8 })}<path d="M${x - 6.6} ${y + 2} l2.2 -1.4 M${x + 6.6} ${y + 2} l-2.2 -1.4" stroke="${wire}" stroke-width="0.7"/>`; }).join(''),
    pro ? '' : `<rect x="32" y="20" width="5" height="3" fill="${TAPE}" opacity="0.85"/>`,
  ].join('');
}
function reflexSleeve({ tier, light, neon }) {
  const pro = tier === 'pro';
  const mesh = pro ? '#1f242b' : '#6a6f77';
  const wire = pro ? neon : '#c97a2e';
  return [
    packaging(pro, light, neon),
    `<path d="M14 16 L40 12 Q46 14 46 22 L44 42 Q40 46 34 44 L16 40 Q10 30 14 16 Z" fill="${mesh}"/>`,
    rim('M46 22 L44 42', light),
    [0, 1, 2, 3, 4].map((i) => `<path d="M16 ${19 + i * 4.6} Q30 ${17 + i * 4.6} 44 ${18 + i * 4.6}" stroke="${wire}" stroke-width="0.5" fill="none" opacity="0.85"/>`).join(''),
    [[20, 22], [30, 20], [24, 32], [36, 30]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="5" rx="0.8" fill="${pro ? '#c9ccd3' : '#a8a294'}"/>`).join(''),
    `<path d="M44 36 Q52 38 52 46" stroke="${shade(mesh, 0.2)}" stroke-width="1.6" fill="none"/><rect x="50.4" y="45" width="3.6" height="4.6" rx="0.8" fill="${lit('#3a3f47', light, 0.3)}"/>`,
  ].join('');
}
function cortexChip({ tier, light, neon }) {
  const pro = tier === 'pro';
  const body = pro ? '#1a1e24' : '#2f6b4a';
  return [
    packaging(pro, light, neon),
    [0, 1, 2, 3, 4].map((i) => `<rect x="${17 + i * 6}" y="10" width="1.8" height="4" fill="#c9a54a"/><rect x="${17 + i * 6}" y="42" width="1.8" height="4" fill="#c9a54a"/><rect x="10" y="${17 + i * 6}" width="4" height="1.8" fill="#c9a54a"/><rect x="42" y="${17 + i * 6}" width="4" height="1.8" fill="#c9a54a"/>`).join(''),
    box(13, 13, 30, 30, body, light, { r: 1.4 }),
    box(19, 19, 18, 18, pro ? '#3a414b' : '#8a929c', light, { r: 1, t: 0.55 }),
    pro ? `<circle cx="28" cy="28" r="4.4" fill="none" stroke="${neon}" stroke-width="0.9"/><circle cx="28" cy="28" r="1.4" fill="${neon}"/>` : `<path d="M22 24 h8 M22 27.4 h12 M22 30.8 h6" stroke="#5a616b" stroke-width="0.7"/><rect x="31" y="31" width="3.4" height="3.4" fill="${TAPE}"/>`,
  ].join('');
}
function cortexBud({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#e3e6ea' : '#8a8f96';
  return [
    packaging(pro, light, neon),
    `<path d="M14 40 Q10 14 28 12 Q46 12 44 28 Q42 38 32 37 Q24 36 24 44 Z" fill="${shell}"/>`,
    rim('M30 12.4 Q46 12 44 28', light, 1.4),
    pro ? glow('M20 20 Q28 16 38 22', neon, 0.6) : `<path d="M20 22 L26 28" stroke="#5a5f68" stroke-width="0.8"/><rect x="30" y="18" width="7" height="3" fill="${TAPE}" opacity="0.85"/>`,
    `<path d="M24 43 Q34 50 46 40" stroke="${shade(shell, 0.4)}" stroke-width="1.2" fill="none"/><rect x="45" y="36" width="4" height="5" rx="0.9" fill="${lit('#3a3f47', light, 0.3)}"/><rect x="46.4" y="34" width="1.2" height="2.2" fill="#c9ccd3"/>`,
  ].join('');
}

const square = (shapes, opts, size = 160) => {
  const id = `s${++uid}`;
  const { light } = opts;
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}">
  <defs><linearGradient id="${id}" x1="1" x2="0"><stop offset="0" stop-color="${light}" stop-opacity="0.22"/><stop offset="0.4" stop-color="${light}" stop-opacity="0.08"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></linearGradient>
  <linearGradient id="holo" x1="0" x2="1"><stop offset="0" stop-color="#3de8d8" stop-opacity="0.7"/><stop offset="0.5" stop-color="#b48cff" stop-opacity="0.7"/><stop offset="1" stop-color="#ff5fae" stop-opacity="0.7"/></linearGradient></defs>
  <rect width="64" height="64" fill="#0d1016"/><rect width="64" height="64" fill="url(#${id})"/>${shapes({ ...opts, neon: NEON })}</svg>`;
};

const TAKES = [
  ['Armoured vest', 'A', 'The plate carrier', 'Straps, a front plate, webbing, two pouches. Street: olive canvas, a taped plate.', vestCarrier],
  ['Armoured vest', 'B', 'The jacket', 'Quilted, armour sewn in, collar up. Street: oxblood, a patched elbow, a faded dragon.', vestJacket],
  ['Armoured vest', 'C', 'The weave', 'A slim hex-weave undershirt, worn under clothes. Street: grey, a patch over a tear.', vestWeave],
  ['Trauma kit', 'A', 'The bag', 'A shoulder bag with a cross patch. Street: worn canvas and tape.', kitBag],
  ['Trauma kit', 'B', 'The box', 'A hard case, open: autoinjectors, gauze, shears. Street: an old toolbox painted white.', kitBox],
  ['Trauma kit', 'C', 'The roll', 'A trauma roll laid open: syringes, a tourniquet, tape, a pen torch, a dressing.', kitRoll],
  ['Trauma kit', 'D', 'The med gun', 'A pistol-grip scanner that reads the wound and fires an injector. Street: taped grip, a cracked screen; pro: a clean holo readout.', kitGun],
  ['Ghost kit', 'A', 'The bypass roll', 'Picks, shims and a cheap maglock spoofer card, for the old doors.', ghostRoll],
  ['Ghost kit', 'B', 'The decoder', 'A handheld with its probe in a padlock, for the newer doors. Street: a yellow tool-shop case.', ghostDecoder],
  ['Ghost kit', 'C', 'The heat veil', 'A hooded poncho of heat-damping cloth with a glare strip: hard to see on thermal, blurry on a lens. Pro: a holographic strip.', ghostVeil],
  ['Ghost kit', 'D', 'The lens blinder', 'A palm emitter with a ring of diodes that whites out a camera for a few seconds. Street: taped grip.', ghostBlinder],
  ['Reflex wiring', 'A', 'The harness', 'Nodes on a braided cable, as it runs down the spine. Street: a grey-market bag and a handwritten tag; pro: a clinic tray.', reflexHarness],
  ['Reflex wiring', 'B', 'The sleeve', 'A forearm sleeve of fine wires and contact pads, with its lead.', reflexSleeve],
  ['Cortex co-processor', 'A', 'The chip', 'A module with gold pins and a heat spreader. Pro: black with a glowing ring.', cortexChip],
  ['Cortex co-processor', 'B', 'The bud', 'A curved unit that sits behind the ear, a lead to its jack. Pro: clinic white with a light line.', cortexBud],
].map(([kind, key, name, note, fn]) => ({ kind, key, name, note, fn }));
const kinds = [...new Set(TAKES.map((t) => t.kind))];
const card = (t) => `<article><h3>${t.key}: ${t.name}</h3><div class="sq">
  <figure>${square(t.fn, { tier: 'street', light: LIGHTS.sodium })}<figcaption>street · stash</figcaption></figure>
  <figure>${square(t.fn, { tier: 'pro', light: LIGHTS.sodium })}<figcaption>pro · stash</figcaption></figure>
  <figure>${square(t.fn, { tier: 'street', light: LIGHTS.cyan }, 96)}<figcaption>cyan</figcaption></figure>
  <figure>${square(t.fn, { tier: 'pro', light: LIGHTS.red }, 96)}<figcaption>pro · red</figcaption></figure></div><p>${t.note}</p></article>`;
const sheet = kinds.map((k) => `<section class="kind" data-kind="${k}"><h2>${k}</h2><div class="cards">${TAKES.filter((t) => t.kind === k).map(card).join('')}</div></section>`).join('');

// --- the mixed mock-up: an armoury row and the gear slots, square and wide in one box --------
const fit = (svg) => svg.replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"');
const wide = (type, tier = 'street', look) => fit(gearArt({ uid: 'm1', type, tier, ...(look ? { look } : {}) }, { width: 96 }));
const sq = (fn, tier = 'street') => fit(square(fn, { tier, light: LIGHTS.sodium }));
const row = (art, name, eff, btn) => `<li class="mrow"><span class="mrow__art">${art}</span><span class="mrow__txt"><strong>${name}</strong><span class="eff">${eff}</span></span><span class="mrow__btn">${btn}</span></li>`;
const mock = `
  <section id="mock"><h2>Mock-up: square and wide together</h2>
  <p>Every picture goes in the same 3:2 box beside its name and is fitted inside it: a long item fills the width, a compact one fills the height. The rows get much shorter than today's full-width strips.</p>
  <div class="mockwrap"><div class="phone"><p class="cap">Armoury on a phone (390)</p><ul class="mrows">
    ${row(wide('rifle'), 'Rifle', 'Overwatch · combat 2 shots', 'Sell ¥1,250')}
    ${row(wide('drone', 'street', { frame: 'quad' }), 'Drone', 'Overwatch · tech 3 actions', 'Sell ¥1,500')}
    ${row(sq(vestCarrier), 'Armoured vest', 'Fewer serious wounds', 'Sell ¥600')}
    ${row(sq(kitGun, 'pro'), 'Pro trauma kit', 'Medical +2 · Med gun', 'Sell ¥1,000')}
    ${row(sq(ghostVeil), 'Ghost kit', 'Stealth +1 · Heat veil', 'Sell ¥350')}
    ${row(sq(cortexChip, 'pro'), 'Pro cortex co-processor', 'Tech +2, cool +2', 'Sell ¥4,375')}
  </ul></div>
  <div class="phone"><p class="cap">A runner's four slots</p><div class="slots">
    <div class="slot"><span class="slot__l">Weapon</span><span class="slot__art">${wide('rifle')}</span><strong>Rifle</strong></div>
    <div class="slot"><span class="slot__l">Armour</span><span class="slot__art">${sq(vestJacket)}</span><strong>Armoured vest</strong></div>
    <div class="slot"><span class="slot__l">Tool</span><span class="slot__art">${sq(ghostBlinder, 'pro')}</span><strong>Pro ghost kit</strong></div>
    <div class="slot"><span class="slot__l">Implant</span><span class="slot__art">${sq(reflexHarness)}</span><strong>Reflex wiring</strong></div>
  </div></div></div></section>`;

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Square Gear Options</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
body { margin: 0; background: #0a0c0f; color: #e9ecf1; font: 14px/1.45 system-ui, sans-serif; padding: 24px; }
h1, h2, h3 { font-family: 'Rajdhani', system-ui, sans-serif; text-transform: uppercase; letter-spacing: .12em; }
h1 { font-size: 1.4rem; margin: 0 0 4px; } h2 { color: #3de8d8; margin: 24px 0 8px; } h3 { margin: 0 0 6px; font-size: .95rem; }
p { color: #8a93a6; margin: 6px 0 0; max-width: 80ch; } .cap { margin: 0 0 6px; }
.cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
article { background: #12151b; border: 1px solid #2a303b; padding: 12px 14px; }
.sq { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
figure { margin: 0; } figcaption { color: #8a93a6; font-size: .72rem; margin-top: 3px; } svg { display: block; border: 1px solid #2a303b; }
.mockwrap { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
.phone { width: 390px; background: #12151b; border: 1px solid #2a303b; padding: 14px; }
.mrows { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.mrow { display: grid; grid-template-columns: 84px minmax(0, 1fr) auto; gap: 10px; align-items: center; background: #161a21; border: 1px solid #2a303b; padding: 6px 8px; }
.mrow__art { display: block; width: 84px; height: 56px; background: #0d1016; } .mrow__art svg, .slot__art svg { border: 0; }
.mrow__txt { display: grid; } .mrow__txt strong { font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: .08em; } .eff { color: #3de8d8; font-size: .82rem; }
.mrow__btn { font: 600 .75rem 'Rajdhani', sans-serif; letter-spacing: .1em; text-transform: uppercase; border: 1px solid #2a303b; padding: 8px 10px; white-space: nowrap; }
.slots { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.slot { border: 1px solid #2a303b; background: #161a21; padding: 8px; display: grid; gap: 6px; }
.slot__l { font: 600 .7rem 'Rajdhani', sans-serif; letter-spacing: .14em; color: #8a93a6; }
.slot__art { display: block; aspect-ratio: 3 / 2; background: #0d1016; } .slot strong { font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: .08em; font-size: .9rem; }
</style></head><body>
<h1>Compact gear, in a square frame</h1>
<p>Redrawn 64×64 instead of 96×32, so compact things aren't stretched. Long things (the rifle, the sidearm, the kite drone, the slab deck) keep the wide frame. The stealth tool is now the ghost kit; the trauma kit gains the med gun. Pick a core build for each (others rarer, as with the drone) or vary them evenly.</p>
${sheet}${mock}
</body></html>`;
const file = new URL('../drafts/prototypes/gear-options-square.html', import.meta.url).pathname;
writeFileSync(file, html);
console.log('wrote', file);

const dir = process.argv[2];
if (dir) {
  mkdirSync(dir, { recursive: true });
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(`file://${file}`); await p.waitForTimeout(700);
  const secs = p.locator('section.kind');
  for (let i = 0; i < await secs.count(); i++) await secs.nth(i).screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}-${kinds[i].toLowerCase().split(' ')[0]}.png` });
  await p.locator('#mock').screenshot({ path: `${dir}/${String(kinds.length + 1).padStart(2, '0')}-mixed-mockup.png` });
  await b.close();
}
