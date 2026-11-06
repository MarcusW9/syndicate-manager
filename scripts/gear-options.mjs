// Design session (2026-11-06, owner: "add drawings [for] the armoured vest, the trauma kit, the
// lockpicks and the two implants ... an options sheet for them next, in the same style"): takes on
// each, drawn like the rifle and the drone (ui/art.js): a 96×32 frame, flat colour, hard light from
// the right (the carrier's city light, or the safehouse's sodium in the stash), no outlines; street
// second-hand and patched, pro clean with the carrier's neon. Implants are drawn as the part itself,
// out of the body: street in a grey-market bag with a handwritten tag, pro on a clinic tray.
// Writes drafts/prototypes/gear-options.html; with an out dir, screenshots each take.
//   node scripts/gear-options.mjs [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { mix } from '../src/ui/art.js';

const SHADOW = '#1b2340';
const LIGHTS = { cyan: '#3de8d8', red: '#ff3d5f', sodium: '#f2b544', violet: '#9b8cff' };
const NEON = '#3de8d8';
const TAPE = '#f2b544';
const CROSS = '#e8484f';
let uid = 0;
const lit = (c, light, t = 0.45) => mix(c, light, t);
const shade = (c, t = 0.45) => mix(c, SHADOW, t);
const box = (x, y, w, h, fill, light, { r = 0, t = 0.45, top = 0.9 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/><rect x="${x}" y="${y}" width="${w}" height="${Math.min(top, h)}" rx="${Math.min(r, top / 2)}" fill="${lit(fill, light, t)}"/><rect x="${x}" y="${y + h - Math.min(top, h)}" width="${w}" height="${Math.min(top, h)}" fill="${shade(fill)}"/>`;
const glow = (d, c, w = 0.5) => `<path d="${d}" stroke="${c}" stroke-width="${w * 3}" opacity="0.18" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

// --- armoured vest ------------------------------------------------------------------------
// A: the plate carrier, front-on: shoulder straps, a front plate, rows of webbing, two pouches.
function vestCarrier({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1f242b' : '#55604a';
  const dark = pro ? '#121519' : '#343b2e';
  return [
    `<path d="M33 3 L40 3 L41 9 L55 9 L56 3 L63 3 L64 10 L70 13 L70 29 L26 29 L26 13 L32 10 Z" fill="${cloth}"/>`,
    `<path d="M33 3 L40 3 L40.4 4.2 L33.2 4.2 Z M56 3 L63 3 L63.2 4.2 L56 4.2 Z" fill="${lit(cloth, light, 0.55)}"/>`,
    `<path d="M26 13 L32 10 L64 10 L70 13 L70 14.2 L64 11.2 L32 11.2 L26 14.2 Z" fill="${lit(cloth, light, 0.4)}"/>`,
    box(34, 12, 28, 9, dark, light, { r: 1.2, top: 0.8 }),
    [0, 1, 2].map((r) => `<path d="M28 ${22.4 + r * 2.2} H68" stroke="${shade(cloth, 0.6)}" stroke-width="0.8"/>`).join(''),
    box(29, 21.6, 9, 6.6, pro ? '#272c35' : '#6b5a3a', light, { r: 0.8, top: 0.6 }), box(58, 21.6, 9, 6.6, pro ? '#272c35' : '#4a5340', light, { r: 0.8, top: 0.6 }),
    pro ? glow('M36 20 H60', neon, 0.4) : `<rect x="44" y="14.6" width="8" height="2" fill="${TAPE}" opacity="0.8"/><path d="M66 26 l-6 1.4" stroke="${TAPE}" stroke-width="0.9" opacity="0.7"/>`,
    `<rect x="26" y="28.2" width="44" height="1.4" fill="${shade(cloth, 0.6)}"/>`,
  ].join('');
}
// B: the jacket. A quilted street jacket with armour sewn in: the collar up, quilting lines, a
// zip. Street: patched elbow, a faded dragon on the back panel; pro: a sleek coat with a light line.
function vestJacket({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1b1f26' : '#7a2f2a';
  const dark = pro ? '#101317' : '#4f1e1b';
  return [
    `<path d="M30 6 L40 3 L48 6 L56 3 L66 6 L78 12 L82 27 L74 28 L70 17 L70 30 L26 30 L26 17 L22 28 L14 27 L18 12 Z" fill="${cloth}"/>`,
    `<path d="M30 6 L40 3 L48 6 L56 3 L66 6 L78 12 L78.6 13.4 L66 7.4 L56 4.4 L48 7.4 L40 4.4 L30 7.4 L18.6 13.4 L18 12 Z" fill="${lit(cloth, light, 0.5)}"/>`,
    `<path d="M40 3 L48 6 L56 3 L54 9 L48 11 L42 9 Z" fill="${dark}"/>`,
    `<path d="M48 11 V30" stroke="${shade(cloth, 0.7)}" stroke-width="0.8"/><path d="M48 11 V30" stroke="#c9ccd3" stroke-width="0.25" stroke-dasharray="0.8 0.6"/>`,
    [14, 18.4, 22.8, 27].map((y) => `<path d="M27 ${y} H69" stroke="${shade(cloth, 0.5)}" stroke-width="0.5"/>`).join(''),
    `<path d="M16 22 L22 22.6" stroke="${shade(cloth, 0.5)}" stroke-width="0.5"/><path d="M74 22.6 L80 22" stroke="${shade(cloth, 0.5)}" stroke-width="0.5"/>`,
    pro ? glow('M27 16.2 H69', neon, 0.35) : `<rect x="74.4" y="19" width="5" height="4" rx="0.6" fill="#3a3f47" transform="rotate(-12 77 21)"/><path d="M58 20 q4 -3 7 0 q-3 2 -1 4" stroke="#d6a640" stroke-width="0.6" fill="none" opacity="0.8"/>`,
  ].join('');
}
// C: the weave. A slim armoured undershirt: a hex-weave panel front-on, high collar, fitted.
function vestWeave({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#20262e' : '#4b5059';
  const hexes = [];
  for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) hexes.push(`<path d="M${32.5 + k * 3.6 + (r % 2) * 1.8} ${11 + r * 4} l1.6 -1 l1.6 1 v1.8 l-1.6 1 l-1.6 -1 Z" fill="none" stroke="${pro ? mix(cloth, neon, 0.25) : shade(cloth, 0.3)}" stroke-width="0.35"/>`);
  return [
    `<path d="M40 3 L56 3 L58 7 L66 9 L68 30 L28 30 L30 9 L38 7 Z" fill="${cloth}"/>`,
    `<path d="M40 3 L56 3 L56.4 4 L39.6 4 Z M30 9 L38 7 L58 7 L66 9 L66.2 10 L58 8 L38 8 L30 10 Z" fill="${lit(cloth, light, 0.5)}"/>`,
    hexes.join(''),
    `<path d="M28 29 H68" stroke="${shade(cloth, 0.6)}" stroke-width="1.4"/>`,
    pro ? `${glow('M31 9.6 L48 12 L65 9.6', neon, 0.35)}<circle cx="48" cy="12" r="0.8" fill="${neon}"/>` : `<rect x="54" y="20" width="7" height="5" fill="#5a5f68" transform="rotate(8 57 22)"/><path d="M54.6 21 l6 1 M54.4 23 l6 1" stroke="#3a3f47" stroke-width="0.4"/>`,
  ].join('');
}

// --- trauma kit ---------------------------------------------------------------------------
// A: the bag. A canvas shoulder bag with a red cross patch, its strap over the top, a side pouch.
function kitBag({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1d2229' : '#7a6a4c';
  return [
    `<path d="M26 12 Q48 -2 70 12" stroke="${shade(cloth, 0.3)}" stroke-width="2" fill="none"/><path d="M26 12 Q48 -2 70 12" stroke="${lit(cloth, light, 0.4)}" stroke-width="0.5" fill="none"/>`,
    box(22, 11, 52, 18, cloth, light, { r: 2.4, top: 1.2 }),
    `<path d="M22 15 H74" stroke="${shade(cloth, 0.5)}" stroke-width="0.6"/>`,
    box(42, 17, 12, 9, pro ? '#262b33' : '#e9e2cf', light, { r: 1, top: 0.6, t: 0.2 }),
    `<path d="M48 18.6 V24.4 M45.1 21.5 H50.9" stroke="${pro ? neon : CROSS}" stroke-width="2.2"/>`,
    box(74, 15, 6, 11, shade(cloth, 0.2), light, { r: 1, top: 0.6 }),
    pro ? glow('M24 27.6 H72', neon, 0.35) : `<rect x="26" y="24" width="8" height="3" rx="0.4" fill="${TAPE}" opacity="0.75" transform="rotate(-6 30 25)"/>`,
  ].join('');
}
// B: the box. A hard trauma case, open: autoinjectors in foam, a gauze roll, shears, in the lid a
// laminated card. Street: a scuffed old toolbox painted white; pro: a clinic case with a status light.
function kitBox({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#232831' : '#d9d3c4';
  const foam = pro ? '#14171c' : '#2b2f36';
  return [
    `<path d="M24 3 L72 3 L72 13 L24 13 Z" fill="${shade(shell, 0.25)}"/><rect x="34" y="5" width="28" height="6" fill="${pro ? '#101317' : '#bfb7a5'}"/>`,
    `<path d="M45 6.2 V9.8 M43.2 8 H46.8" stroke="${pro ? neon : CROSS}" stroke-width="1.4"/><path d="M50 6.6 h9 M50 8.6 h7" stroke="${pro ? '#8a93a6' : '#7a7466'}" stroke-width="0.5"/>`,
    box(20, 13, 56, 16, shell, light, { r: 1.2, top: 1 }),
    `<rect x="23" y="15" width="50" height="11.6" rx="0.8" fill="${foam}"/>`,
    [0, 1, 2, 3].map((i) => `<rect x="${26 + i * 5}" y="16.6" width="3" height="8.4" rx="1.2" fill="${pro ? '#e9ecf1' : '#cfd3d9'}"/><rect x="${26 + i * 5}" y="16.6" width="3" height="2.2" rx="1" fill="${[CROSS, TAPE, '#5fe0a5', CROSS][i]}"/>`).join(''),
    `<circle cx="53" cy="20.8" r="4" fill="#efe8dc"/><circle cx="53" cy="20.8" r="1.4" fill="${foam}"/><path d="M49.6 18.6 a4 4 0 0 1 6.8 0" stroke="${lit('#efe8dc', light, 0.5)}" stroke-width="0.6" fill="none"/>`,
    `<path d="M61 17 L70 24 M61 24 L70 17" stroke="#8a93a6" stroke-width="0.9"/><circle cx="61.6" cy="17.4" r="1.2" fill="none" stroke="#3a3f47" stroke-width="0.7"/><circle cx="61.6" cy="23.6" r="1.2" fill="none" stroke="#3a3f47" stroke-width="0.7"/>`,
    pro ? `<circle cx="72" cy="27" r="0.7" fill="${neon}"/>` : `<path d="M22 27 l3 -2 M70 14.6 l3 1" stroke="${shade(shell, 0.5)}" stroke-width="0.6"/>`,
  ].join('');
}
// C: the roll. A trauma roll laid open flat: pockets of syringes, a tourniquet, tape, a pen torch.
function kitRoll({ tier, light, neon }) {
  const pro = tier === 'pro';
  const cloth = pro ? '#1d2229' : '#3f5a4a';
  return [
    box(8, 9, 80, 18, cloth, light, { r: 1, top: 0.9 }),
    [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${12 + i * 12.6}" y="17" width="11" height="9" fill="${shade(cloth, 0.25)}"/>`).join(''),
    `<rect x="14" y="11" width="2.4" height="12" rx="1" fill="#e9ecf1"/><rect x="18.4" y="11.6" width="2.4" height="11" rx="1" fill="#e9ecf1"/><rect x="14" y="11" width="2.4" height="2.4" fill="${CROSS}"/><rect x="18.4" y="11.6" width="2.4" height="2.4" fill="${TAPE}"/>`,
    `<path d="M28 21 q4 -12 8 0" stroke="#ff9a3d" stroke-width="1.6" fill="none"/><rect x="30" y="20" width="4" height="3" fill="#2b2f36"/>`,
    `<circle cx="46" cy="20" r="4.2" fill="#e9e2cf"/><circle cx="46" cy="20" r="1.8" fill="${shade(cloth, 0.25)}"/>`,
    `<rect x="54" y="12" width="2.6" height="12" rx="1.2" fill="#8a93a6"/><rect x="54" y="12" width="2.6" height="2" rx="1" fill="${light}"/>`,
    `<path d="M64 13 L72 22 M64 22 L72 13" stroke="#c9ccd3" stroke-width="0.9"/>`,
    box(76, 13, 8, 10, '#e9e2cf', light, { r: 0.6, top: 0.5, t: 0.2 }), `<path d="M80 14.8 V21 M77 17.9 H83" stroke="${pro ? neon : CROSS}" stroke-width="1.6"/>`,
    pro ? glow('M10 25.6 H86', neon, 0.35) : `<path d="M8 13 h4 M8 15 h4" stroke="${TAPE}" stroke-width="0.8" opacity="0.7"/>`,
  ].join('');
}

// --- lockpicks and shims ------------------------------------------------------------------
// A: the pick roll. A leather roll open: hooks, rakes and tension wrenches in their loops.
function picksRoll({ tier, light, neon }) {
  const pro = tier === 'pro';
  const leather = pro ? '#1d2229' : '#6b4a2e';
  const steel = pro ? '#c9ccd3' : '#9aa0a8';
  const tips = ['M0 0 l2 -1.6', 'M0 0 q1 -2 2 0 q1 2 2 0', 'M0 0 l1 -1 l1 1 l1 -1 l1 1', 'M0 0 l2.4 -2', 'M0 0 q1.4 -1.6 2.6 -0.4'];
  return [
    box(10, 8, 76, 20, leather, light, { r: 1.4, top: 1 }),
    pro ? '' : `<path d="M12 12 Q30 11 50 12.4 M12 23 Q34 22 60 23.6" stroke="${shade(leather, 0.35)}" stroke-width="0.35" fill="none"/>`,
    tips.map((t, i) => `<path d="M${18 + i * 9} 25 V12" stroke="${steel}" stroke-width="0.9"/><path d="${t}" transform="translate(${18 + i * 9} 12)" stroke="${steel}" stroke-width="0.9" fill="none"/><rect x="${16.6 + i * 9}" y="21" width="2.8" height="5" rx="0.6" fill="${pro ? '#262b33' : '#2b2f36'}"/>`).join(''),
    `<path d="M64 25 V14 h4" stroke="${steel}" stroke-width="1.1" fill="none"/><path d="M71 25 V14 h3" stroke="${steel}" stroke-width="1.1" fill="none"/>`,
    `<path d="M10 18 H86" stroke="${shade(leather, 0.55)}" stroke-width="0.7"/>`,
    `<path d="M84 18 q6 0 6 6" stroke="${shade(leather, 0.2)}" stroke-width="1.2" fill="none"/>`,
    pro ? glow('M12 26.6 H84', neon, 0.35) : '',
  ].join('');
}
// B: the shims. Bump keys on a ring, a fan of thin shims, a slim jim along the bottom.
function picksShims({ tier, light, neon }) {
  const pro = tier === 'pro';
  const steel = pro ? '#d4d7dd' : '#a8a294';
  const key = (x, rot) => `<g transform="rotate(${rot} 30 14)"><circle cx="${x}" cy="14" r="3" fill="${steel}"/><circle cx="${x}" cy="14" r="1.1" fill="#0d1016"/><path d="M${x + 3} 13 h12 l0 2 h-1 l-1 -1 l-1 1 l-1 -1 l-1 1 l-1 -1 l-1 1 h-5 Z" fill="${steel}"/><path d="M${x + 3} 13 h12" stroke="${lit(steel, light, 0.6)}" stroke-width="0.4"/></g>`;
  return [
    `<circle cx="30" cy="14" r="5" fill="none" stroke="${pro ? '#2b313a' : '#7a7466'}" stroke-width="1"/>`,
    key(26, -30), key(26, 10), key(26, 45),
    [0, 1, 2, 3].map((i) => `<path d="M54 22 L${70 + i * 4} ${6 + i}" stroke="${steel}" stroke-width="1.4" stroke-linecap="round" opacity="${0.6 + i * 0.1}"/>`).join(''),
    `<path d="M10 27 H82 l3 -2" stroke="${pro ? '#2b313a' : '#5a5f68'}" stroke-width="1.6" fill="none"/><path d="M10 26.4 H82" stroke="${lit(pro ? '#2b313a' : '#5a5f68', light, 0.5)}" stroke-width="0.4"/>`,
    pro ? `<rect x="11" y="25.4" width="10" height="3.2" rx="0.6" fill="#1d2229"/>${glow('M12 27 H20', neon, 0.3)}` : `<rect x="11" y="25.2" width="9" height="3.6" fill="${TAPE}" opacity="0.8"/>`,
  ].join('');
}
// C: the decoder. A handheld lock decoder with a probe in a padlock: a small screen, a dial.
function picksDecoder({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#1d2229' : '#c2a23a';
  return [
    `<path d="M66 13 a8 8 0 0 1 16 0 v4" stroke="#9aa0a8" stroke-width="2.2" fill="none"/>`,
    box(62, 15, 24, 14, '#5a5f68', light, { r: 2, top: 0.9 }), `<circle cx="74" cy="21" r="2" fill="#0d1016"/><rect x="73.4" y="21" width="1.2" height="4" fill="#0d1016"/>`,
    `<path d="M52 21 H72" stroke="#c9ccd3" stroke-width="0.9"/>`,
    box(14, 10, 38, 18, shell, light, { r: 2.4, top: 1 }),
    `<rect x="18" y="13" width="18" height="9" rx="0.6" fill="#0b1a1c"/><path d="M20 16 h4 M20 18.6 h9" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="0.8"/><path d="M27 16 h1 M29 16 h1 M31 16 h1" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="0.8"/>`,
    `<circle cx="44" cy="17.6" r="4" fill="${shade(shell, 0.4)}"/><circle cx="44" cy="17.6" r="2.4" fill="${shade(shell, 0.2)}"/><path d="M44 15.2 v2" stroke="${lit(shell, light, 0.6)}" stroke-width="0.6"/>`,
    pro ? glow('M16 26 H50', neon, 0.35) : '<path d="M16 25 l6 -1 M38 26 l8 -2" stroke="#2b2f36" stroke-width="0.7"/>',
  ].join('');
}

// --- implants (the part, out of the body) -------------------------------------------------
// Street: in a grey-market zip bag with a handwritten tag. Pro: on a steel clinic tray.
const packaging = (pro, light, neon) => (pro
  ? `${box(6, 22, 84, 6, '#8a929c', light, { r: 1, top: 0.7, t: 0.5 })}<path d="M8 27.4 H88" stroke="#5a616b" stroke-width="0.5"/>${glow('M10 23.4 H24', neon, 0.3)}`
  : `<path d="M8 4 H84 V29 H8 Z" fill="#e9ecf1" opacity="0.06"/><path d="M8 4 H84" stroke="#e9ecf1" stroke-width="1" opacity="0.25"/><path d="M8 6 H84" stroke="#ff3d5f" stroke-width="0.6" opacity="0.4"/>
     <rect x="64" y="20" width="16" height="7" fill="#e9e2cf" transform="rotate(-4 72 23)"/><path d="M66 22.6 q2 -1 4 0 t4 0 M66 25 q3 -1 6 0" stroke="#2b5fa8" stroke-width="0.5" fill="none" transform="rotate(-4 72 23)"/>`);
// Reflex wiring A: the harness. A ladder of nodes on a braided cable, as it would run down the spine.
function reflexHarness({ tier, light, neon }) {
  const pro = tier === 'pro';
  const node = pro ? '#2a2f38' : '#5a5f68';
  const wire = pro ? neon : '#c97a2e';
  return [
    packaging(pro, light, neon),
    `<path d="M12 16 Q48 8 84 16" stroke="${shade(node, 0.2)}" stroke-width="1.6" fill="none"/><path d="M12 16 Q48 8 84 16" stroke="${wire}" stroke-width="0.4" fill="none" opacity="0.8"/>`,
    [0, 1, 2, 3, 4, 5, 6].map((i) => { const x = 16 + i * 10.6; const y = 16 - Math.sin((i / 6) * Math.PI) * 6; return `${box(x - 2.6, y - 2.4, 5.2, 4.8, node, light, { r: 1, top: 0.6 })}<path d="M${x - 4} ${y + 3} l1.4 -1 M${x + 4} ${y + 3} l-1.4 -1" stroke="${wire}" stroke-width="0.5"/>`; }).join(''),
    pro ? '' : `<rect x="38" y="6.4" width="4" height="2.2" fill="${TAPE}" opacity="0.8"/>`,
  ].join('');
}
// Reflex wiring B: the sleeve. A forearm sleeve of fine wires and contact pads, cut open flat.
function reflexSleeve({ tier, light, neon }) {
  const pro = tier === 'pro';
  const mesh = pro ? '#1f242b' : '#6a6f77';
  const wire = pro ? neon : '#c97a2e';
  return [
    packaging(pro, light, neon),
    `<path d="M14 9 L70 7 Q76 11 70 19 L14 21 Q10 15 14 9 Z" fill="${mesh}"/><path d="M14 9 L70 7 Q73 8.6 73.4 10 L14 11 Z" fill="${lit(mesh, light, 0.45)}"/>`,
    [0, 1, 2, 3, 4].map((i) => `<path d="M16 ${10.6 + i * 2.2} Q42 ${9.4 + i * 2.2} 70 ${9 + i * 2.2}" stroke="${wire}" stroke-width="0.35" fill="none" opacity="0.85"/>`).join(''),
    [22, 34, 46, 58].map((x) => `<rect x="${x}" y="12" width="4" height="4" rx="0.6" fill="${pro ? '#c9ccd3' : '#a8a294'}"/>`).join(''),
    `<path d="M70 13 Q80 12 82 18" stroke="${shade(mesh, 0.2)}" stroke-width="1.2" fill="none"/><rect x="80.6" y="17" width="3" height="3.6" rx="0.6" fill="${lit('#3a3f47', light, 0.3)}"/>`,
  ].join('');
}
// Cortex co-processor A: the chip. A square module with gold pins, a heat spreader, a glow.
function cortexChip({ tier, light, neon }) {
  const pro = tier === 'pro';
  const body = pro ? '#1a1e24' : '#2f6b4a';
  return [
    packaging(pro, light, neon),
    [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${32 + i * 5}" y="4" width="1.4" height="3" fill="#c9a54a"/><rect x="${32 + i * 5}" y="20" width="1.4" height="3" fill="#c9a54a"/>`).join(''),
    box(28, 6.6, 34, 14, body, light, { r: 1, top: 0.8 }),
    box(36, 9, 18, 9.4, pro ? '#3a414b' : '#8a929c', light, { r: 0.6, top: 0.7, t: 0.55 }),
    pro ? `<circle cx="45" cy="13.7" r="2.4" fill="none" stroke="${neon}" stroke-width="0.6"/><circle cx="45" cy="13.7" r="0.8" fill="${neon}"/>` : `<path d="M38 12 h6 M38 14.6 h10" stroke="#5a616b" stroke-width="0.5"/><rect x="50" y="15" width="2.4" height="2.4" fill="${TAPE}"/>`,
  ].join('');
}
// Cortex co-processor B: the bud. A curved unit that sits behind the ear, a short lead to its jack.
function cortexBud({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#e3e6ea' : '#8a8f96';
  return [
    packaging(pro, light, neon),
    `<path d="M24 20 Q22 6 36 5 Q50 5 48 14 Q46 20 38 19 Q32 18 32 22 Z" fill="${shell}"/>`,
    `<path d="M24 20 Q22 6 36 5 Q50 5 48 14 L46.8 13.6 Q48 6.4 36 6.2 Q23.4 7.2 25.2 20 Z" fill="${lit(shell, light, 0.5)}"/>`,
    pro ? glow('M30 9 Q38 7 44 11', neon, 0.4) : `<path d="M30 10 L34 14" stroke="#5a5f68" stroke-width="0.6"/><rect x="38" y="8" width="5" height="2.2" fill="${TAPE}" opacity="0.8"/>`,
    `<path d="M32 21 Q40 26 56 18" stroke="${shade(shell, 0.4)}" stroke-width="0.9" fill="none"/><rect x="55" y="15.6" width="3" height="4" rx="0.7" fill="${lit('#3a3f47', light, 0.3)}"/><rect x="56" y="14" width="1" height="1.8" fill="#c9ccd3"/>`,
  ].join('');
}

const item = (shapes, opts, width = 288) => {
  const id = `o${++uid}`;
  const { light } = opts;
  return `<svg viewBox="0 0 96 32" width="${width}" height="${Math.round((width * 32) / 96)}">
  <defs><linearGradient id="${id}" x1="1" x2="0"><stop offset="0" stop-color="${light}" stop-opacity="0.2"/><stop offset="0.35" stop-color="${light}" stop-opacity="0.09"/><stop offset="0.75" stop-color="${light}" stop-opacity="0.02"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></linearGradient></defs>
  <rect width="96" height="32" fill="#0d1016"/><rect width="96" height="32" fill="url(#${id})"/>${shapes({ ...opts, neon: NEON })}</svg>`;
};

export const TAKES = [
  { kind: 'Armoured vest', key: 'A', name: 'The plate carrier', note: 'Front-on: straps, a front plate, webbing and two pouches. Street: olive canvas, a taped plate, an odd pouch.', fn: vestCarrier },
  { kind: 'Armoured vest', key: 'B', name: 'The jacket', note: 'A quilted jacket with armour sewn in, collar up. Street: oxblood, a patched elbow, a faded dragon.', fn: vestJacket },
  { kind: 'Armoured vest', key: 'C', name: 'The weave', note: 'A slim hex-weave undershirt, high collar; worn under clothes. Street: grey, a patch over a tear.', fn: vestWeave },
  { kind: 'Trauma kit', key: 'A', name: 'The bag', note: 'A shoulder bag with a cross patch and a side pouch. Street: worn canvas and tape.', fn: kitBag },
  { kind: 'Trauma kit', key: 'B', name: 'The box', note: 'A hard case, open: autoinjectors in foam, gauze, shears, a card in the lid. Street: an old toolbox painted white.', fn: kitBox },
  { kind: 'Trauma kit', key: 'C', name: 'The roll', note: 'A trauma roll laid open: syringes, a tourniquet, tape, a pen torch, a dressing.', fn: kitRoll },
  { kind: 'Lockpicks and shims', key: 'A', name: 'The pick roll', note: 'A leather roll open: hooks, rakes and tension wrenches in their loops.', fn: picksRoll },
  { kind: 'Lockpicks and shims', key: 'B', name: 'The shims', note: 'Bump keys on a ring, a fan of shims, a slim jim. Street: brass-coloured, the jim taped.', fn: picksShims },
  { kind: 'Lockpicks and shims', key: 'C', name: 'The decoder', note: 'A handheld decoder with its probe in a padlock: a screen and a dial. Street: a yellow tool-shop case.', fn: picksDecoder },
  { kind: 'Reflex wiring', key: 'A', name: 'The harness', note: 'Nodes on a braided cable, as it runs down the spine. Street in a grey-market bag with a handwritten tag; pro on a clinic tray.', fn: reflexHarness },
  { kind: 'Reflex wiring', key: 'B', name: 'The sleeve', note: 'A forearm sleeve of fine wires and contact pads, laid flat, with its lead.', fn: reflexSleeve },
  { kind: 'Cortex co-processor', key: 'A', name: 'The chip', note: 'A module with gold pins and a heat spreader. Street: a green board, a sticker; pro: black with a glowing ring.', fn: cortexChip },
  { kind: 'Cortex co-processor', key: 'B', name: 'The bud', note: 'A curved unit that sits behind the ear, a short lead to its jack. Pro: clinic white with a light line.', fn: cortexBud },
];
const kinds = [...new Set(TAKES.map((t) => t.kind))];
const section = (kind) => `<h2>${kind}</h2>${TAKES.filter((t) => t.kind === kind).map((t) => `
  <article><h3>${t.kind} ${t.key}: ${t.name}</h3><p>${t.note}</p>
    <div class="pair"><figure>${item(t.fn, { tier: 'street', light: LIGHTS.sodium })}<figcaption>Street · in the stash (sodium)</figcaption></figure>
    <figure>${item(t.fn, { tier: 'pro', light: LIGHTS.sodium })}<figcaption>Pro · in the stash</figcaption></figure>
    <figure>${item(t.fn, { tier: 'street', light: LIGHTS.cyan }, 200)}<figcaption>street · cyan</figcaption></figure>
    <figure>${item(t.fn, { tier: 'pro', light: LIGHTS.red }, 200)}<figcaption>pro · red</figcaption></figure></div>
  </article>`).join('')}`;

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gear Drawing Options</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
body { margin: 0; background: #0a0c0f; color: #e9ecf1; font: 14px/1.45 system-ui, sans-serif; padding: 24px; }
h1, h2, h3 { font-family: 'Rajdhani', system-ui, sans-serif; text-transform: uppercase; letter-spacing: .12em; }
h1 { font-size: 1.4rem; margin: 0 0 4px; } h2 { color: #3de8d8; margin: 28px 0 8px; } h3 { margin: 0 0 2px; font-size: 1rem; }
p { color: #8a93a6; margin: 0 0 10px; max-width: 80ch; }
article { background: #12151b; border: 1px solid #2a303b; padding: 14px 16px; margin-bottom: 14px; }
.pair { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
figure { margin: 0; } figcaption { color: #8a93a6; font-size: .75rem; margin-top: 3px; }
svg { display: block; border: 1px solid #2a303b; }
</style></head><body>
<h1>The rest of the armoury, as items</h1>
<p>Drawn like the rifle, the drone and the deck: a 96×32 frame, flat colour, hard light from the right, no outlines. Street is second-hand and patched; pro is clean, with the carrier's neon. Implants are the part itself, out of the body: street in a grey-market bag with a handwritten tag, pro on a clinic tray. Pick a core one for each (others can be rarer builds, as with the drone), or mix parts.</p>
${kinds.map(section).join('')}
</body></html>`;
const file = new URL('../drafts/prototypes/gear-options.html', import.meta.url).pathname;
writeFileSync(file, html);
console.log('wrote', file);

const dir = process.argv[2];
if (dir) {
  mkdirSync(dir, { recursive: true });
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(`file://${file}`); await p.waitForTimeout(600);
  const arts = p.locator('article');
  const slug = (t) => t.kind.toLowerCase().split(' ')[0].replace('armoured', 'vest').replace('lockpicks', 'picks');
  for (let i = 0; i < await arts.count(); i++) await arts.nth(i).screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}-${slug(TAKES[i])}-${TAKES[i].key}.png` });
  await b.close();
}
