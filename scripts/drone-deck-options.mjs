// Design session (2026-11-06, owner: "add the assets in the same drawing style for the drones,
// cyberdecks"): the drone and the cyberdeck as items, drawn like the rifle (ui/art.js rifleShapes):
// a 96×32 frame, front to the right, flat colour, hard light from the right (the carrier's city
// light, or the safehouse's sodium), no outlines; street is second-hand and patched, pro is clean
// with the carrier's neon. Three takes each, street and pro, under each city light.
// Writes drafts/prototypes/drone-deck-options.html; with an out dir, screenshots it too.
//   node scripts/drone-deck-options.mjs [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { mix } from '../src/ui/art.js';

const SHADOW = '#1b2340';
const LIGHTS = { cyan: '#3de8d8', red: '#ff3d5f', sodium: '#f2b544', violet: '#9b8cff' };
const NEON = '#3de8d8';
const TAPE = '#f2b544';
let uid = 0;

/** Shared kit: a lit top edge and a shaded bottom edge on a rect, the house's way of showing light. */
const box = (x, y, w, h, fill, light, { r = 0, lit = 0.45, top = 0.9 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>` +
  `<rect x="${x}" y="${y}" width="${w}" height="${Math.min(top, h)}" rx="${Math.min(r, top / 2)}" fill="${mix(fill, light, lit)}"/>` +
  `<rect x="${x}" y="${y + h - Math.min(top, h)}" width="${w}" height="${Math.min(top, h)}" fill="${mix(fill, SHADOW, 0.45)}"/>`;
const glow = (d, c, w = 0.5) => `<path d="${d}" stroke="${c}" stroke-width="${w * 3}" opacity="0.18" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

// --- the drone ----------------------------------------------------------------------------
// A: the quad. Side view: a pod body, two arms out to rotor hubs with their spinning discs, a
// camera gimbal hung under the nose. Street: grey plastic, a taped arm, one odd orange guard.
function droneQuad({ tier, light, neon }) {
  const pro = tier === 'pro';
  const body = pro ? '#1f242c' : '#5a616b';
  const dark = pro ? '#121519' : '#30353d';
  const arm = pro ? '#191d24' : '#3d434c';
  const lit = (c, t = 0.45) => mix(c, light, t);
  const disc = (cx) => `<ellipse cx="${cx}" cy="9" rx="13" ry="1.3" fill="${lit('#2a303b', 0.3)}" opacity="0.55"/><ellipse cx="${cx}" cy="9" rx="13" ry="0.5" fill="${lit('#e9ecf1', 0.4)}" opacity="0.35"/>`;
  return [
    disc(18), disc(78),
    // Arms from the pod to the motors, motors and hubs.
    `<path d="M30 15 L18 11 L18 12.6 L30 17 Z" fill="${arm}"/><path d="M66 15 L78 11 L78 12.6 L66 17 Z" fill="${arm}"/>`,
    `<path d="M66 15 L78 11 L78 11.6 L66 15.7 Z" fill="${lit(arm)}"/>`,
    box(15.5, 9.6, 5, 3.4, dark, light, { r: 0.6, top: 0.6 }), box(75.5, 9.6, 5, 3.4, dark, light, { r: 0.6, top: 0.6 }),
    `<rect x="17.6" y="8.2" width="0.8" height="1.6" fill="${dark}"/><rect x="77.6" y="8.2" width="0.8" height="1.6" fill="${dark}"/>`,
    pro ? '' : `<path d="M70 12.6 L72 15.4 M71.4 12 L73.4 14.8" stroke="${TAPE}" stroke-width="0.9" opacity="0.8"/>`,
    pro ? '' : `<path d="M5 9 Q18 5.6 31 9" stroke="#ff9a3d" stroke-width="0.9" fill="none" opacity="0.85"/>`,
    // The pod: battery on top, the body, its nose.
    box(36, 9.6, 22, 3, pro ? '#14171c' : '#3a3f47', light, { r: 1, top: 0.6 }),
    `<path d="M30 13 L64 12.4 Q68 13.4 67 17.6 L60 20.6 L34 20.8 Q29.6 19.6 30 13 Z" fill="${body}"/>`,
    `<path d="M30 13 L64 12.4 Q66.4 12.8 67 14.2 L30 14.4 Z" fill="${lit(body, 0.5)}"/>`,
    `<path d="M34 20.8 L60 20.6 L62.6 19.4 L33 19.6 Z" fill="${mix(body, SHADOW, 0.45)}"/>`,
    pro ? `<rect x="36" y="16.2" width="20" height="0.6" fill="${neon}"/>` : '<path d="M38 17 h6 M46 17 h4" stroke="#262b33" stroke-width="0.5"/>',
    // Gimbal and camera, the lens catching the light; legs.
    `<rect x="54" y="20.4" width="2" height="2" fill="${dark}"/>`,
    box(51, 22, 9, 5, dark, light, { r: 1.2, top: 0.8 }),
    `<circle cx="59.4" cy="24.5" r="1.7" fill="#0d1016"/><circle cx="59.8" cy="24" r="0.7" fill="${light}"/>`,
    pro ? `<circle cx="52.6" cy="23.2" r="0.45" fill="#ff3d5f"/>` : '',
    `<path d="M38 20.8 L35 27.6 M48 20.8 L50 27.6" stroke="${dark}" stroke-width="0.9"/><path d="M33 27.6 h4.4 M48.2 27.6 h4" stroke="${dark}" stroke-width="1"/>`,
  ].join('');
}

// B: the kite. A flying wing seen from the side and a little above: a long swept wing, a pusher
// prop at the tail, a camera blister under the nose. Street: patched foam, a sticker; pro: carbon.
function droneKite({ tier, light, neon }) {
  const pro = tier === 'pro';
  const wing = pro ? '#1d2229' : '#8a8f96';
  const dark = pro ? '#111418' : '#3a3f47';
  const lit = (c, t = 0.45) => mix(c, light, t);
  return [
    // Far wing, behind, darker.
    `<path d="M30 14 L10 6 L16 6 L44 13 Z" fill="${mix(wing, SHADOW, 0.5)}"/>`,
    // Fuselage pod.
    `<path d="M14 15.6 L70 13.6 Q86 14 88 16.6 Q86 19.4 70 19.6 L14 18.4 Z" fill="${wing}"/>`,
    `<path d="M14 15.6 L70 13.6 Q86 14 88 16.6 L70 15 L14 16.6 Z" fill="${lit(wing, 0.5)}"/>`,
    // Near wing, swept, in front.
    `<path d="M40 17.4 L22 28 L30 28.4 L58 18.4 Z" fill="${wing}"/><path d="M40 17.4 L22 28 L23.6 28.1 L42 17.9 Z" fill="${lit(wing, 0.55)}"/>`,
    `<path d="M22 28 L30 28.4 L30.4 27.4 L23.4 27.2 Z" fill="${mix(wing, SHADOW, 0.4)}"/>`,
    pro ? glow('M24 27.6 L56 18.6', neon, 0.35) : `<rect x="34" y="21.6" width="5" height="2.6" transform="rotate(-24 36 23)" fill="${TAPE}" opacity="0.75"/><path d="M44 19.4 l3 -1" stroke="#ff3d5f" stroke-width="0.8"/>`,
    // Tail fin and the pusher prop.
    `<path d="M16 15.8 L12 9 L15.4 9 L21 15.4 Z" fill="${dark}"/>`,
    `<rect x="8.6" y="15.2" width="5.4" height="3" rx="0.8" fill="${dark}"/>`,
    `<ellipse cx="7.6" cy="16.7" rx="0.8" ry="6.4" fill="${lit('#2a303b', 0.3)}" opacity="0.6"/>`,
    // Camera blister and lens.
    `<path d="M70 19.4 Q74 23.6 79 19.2 Z" fill="${dark}"/><circle cx="76.4" cy="20.4" r="1.2" fill="#0d1016"/><circle cx="76.8" cy="20" r="0.5" fill="${light}"/>`,
    pro ? `<circle cx="84" cy="16.4" r="0.5" fill="${neon}"/>` : '',
  ].join('');
}

// C: the ducted fan. A drum-shaped shroud seen side-on with the fan's blur showing through the
// top grille, a sensor eye on the front, a short skid. Street: a dented shroud, a zip-tied light.
function droneDuct({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#1d2229' : '#4f5660';
  const dark = pro ? '#111418' : '#2d3239';
  const lit = (c, t = 0.45) => mix(c, light, t);
  return [
    // Shroud: a wide drum.
    `<path d="M24 9 Q48 5 72 9 L74 20 Q48 25 22 20 Z" fill="${shell}"/>`,
    `<path d="M24 9 Q48 5 72 9 L72.4 11 Q48 7 23.6 11 Z" fill="${lit(shell, 0.55)}"/>`,
    `<path d="M22 20 Q48 25 74 20 L73.6 18.4 Q48 23.2 22.4 18.4 Z" fill="${mix(shell, SHADOW, 0.45)}"/>`,
    // Top grille and the fan blur under it.
    `<ellipse cx="48" cy="8.4" rx="22" ry="2.2" fill="#0d1016" opacity="0.85"/>`,
    `<ellipse cx="48" cy="8.4" rx="19" ry="1.4" fill="${lit('#2a303b', 0.35)}" opacity="0.7"/>`,
    [30, 36, 42, 48, 54, 60, 66].map((x) => `<path d="M${x} 6.8 L${x} 10" stroke="${dark}" stroke-width="0.5"/>`).join(''),
    // Band round the middle, the sensor eye at the front.
    `<path d="M23 14.4 Q48 18 73 14.4" stroke="${dark}" stroke-width="1.4" fill="none"/>`,
    box(70, 12, 8, 5.4, dark, light, { r: 1.6, top: 0.8 }),
    `<circle cx="76.4" cy="14.7" r="1.8" fill="#0d1016"/><circle cx="76.8" cy="14.2" r="0.8" fill="${pro ? neon : light}"/>`,
    pro ? glow('M28 17.6 Q48 20.6 68 17.6', neon, 0.35) : `<path d="M38 12 q3 2 6 0" stroke="${mix(shell, SHADOW, 0.6)}" stroke-width="0.6" fill="none"/>`,
    pro ? '' : `<rect x="26" y="11.6" width="4" height="3" rx="0.6" fill="#e9ecf1" opacity="0.85"/><path d="M25.6 13 h5" stroke="#111" stroke-width="0.5"/>`,
    // Skids.
    `<path d="M32 21.6 L30 27 M64 21.6 L66 27" stroke="${dark}" stroke-width="0.9"/><path d="M26 27 h8 M62 27 h8" stroke="${dark}" stroke-width="1.1" stroke-linecap="round"/>`,
  ].join('');
}

// --- the deck -----------------------------------------------------------------------------
// A: the slab. A thick keyboard slab seen from the front and a little above, a small flip-up
// screen at the back, a coiled cable out to a neural jack. Street: mismatched keycaps, tape.
function deckSlab({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#1c2027' : '#5d554a';
  const dark = pro ? '#111418' : '#2e2b27';
  const lit = (c, t = 0.45) => mix(c, light, t);
  const keys = [];
  for (let row = 0; row < 3; row++) {
    for (let k = 0; k < 11; k++) {
      const x = 18 + row * 1.2 + k * 4.2;
      const odd = !pro && (k * 7 + row * 3) % 9 === 0;
      keys.push(`<rect x="${x}" y="${19 + row * 2.6}" width="3.4" height="1.9" rx="0.3" fill="${odd ? '#b8a27a' : pro ? '#262b33' : '#3c3833'}"/><rect x="${x}" y="${19 + row * 2.6}" width="3.4" height="0.5" fill="${lit(odd ? '#b8a27a' : pro ? '#262b33' : '#3c3833', 0.4)}"/>`);
    }
  }
  return [
    // Screen on its hinge, the glow on its face.
    `<path d="M40 4 L70 4 L72 16 L38 16 Z" fill="${dark}"/><path d="M41.4 5.4 L68.8 5.4 L70.4 14.6 L39.8 14.6 Z" fill="#0b1a1c"/>`,
    `<path d="M43 7.4 h12 M43 9.4 h18 M43 11.4 h9" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="0.7" opacity="0.85"/>`,
    `<path d="M70 4 L72 16 L71 16 L69 4 Z" fill="${lit(dark, 0.5)}"/>`,
    // The slab: top face (keys) and front edge.
    `<path d="M14 17 L82 17 L86 27.4 L10 27.4 Z" fill="${shell}"/><path d="M14 17 L82 17 L82.4 18 L13.6 18 Z" fill="${lit(shell, 0.55)}"/>`,
    keys.join(''),
    `<rect x="10" y="27.4" width="76" height="2.6" fill="${mix(shell, SHADOW, 0.4)}"/>`,
    pro ? glow('M12 28.6 H84', neon, 0.4) : `<rect x="64" y="27.6" width="9" height="2.2" fill="${TAPE}" opacity="0.7"/>`,
    // Status lights, the cable coiling off the right to a jack.
    `<circle cx="78" cy="20" r="0.6" fill="#5fe0a5"/><circle cx="80" cy="20" r="0.6" fill="${pro ? neon : '#ff3d5f'}"/>`,
    `<path d="M86 24 q5 -1 4 -5 q-1 -4 2 -6 q3 -2 2 -6" stroke="${dark}" stroke-width="1" fill="none"/>`,
    `<rect x="92.4" y="3.6" width="2.4" height="4" rx="0.6" fill="${lit(dark, 0.4)}"/><rect x="93.1" y="2.2" width="1" height="1.6" fill="#c9ccd3"/>`,
  ].join('');
}

// B: the case. A hard-shell carry case, open: the lid stands up with the screen in it, the keys
// and a patch of boards in the base, an antenna. Street: stickers, a dented corner; pro: carbon.
function deckCase({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#1b1f26' : '#3e5560';
  const dark = pro ? '#0f1216' : '#24323a';
  const lit = (c, t = 0.45) => mix(c, light, t);
  return [
    // Lid, standing open, the screen in it.
    `<path d="M22 2.6 L70 2.6 L70 17 L22 17 Z" fill="${shell}"/><rect x="22" y="2.6" width="48" height="0.9" fill="${lit(shell, 0.55)}"/>`,
    `<rect x="25" y="5" width="42" height="10" fill="#0b1a1c"/>`,
    `<path d="M27 7.4 h14 M27 9.6 h22 M27 11.8 h10" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="0.7" opacity="0.85"/>`,
    `<path d="M52 7 L64 7 L64 13 L52 13 Z" fill="none" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="0.45" opacity="0.7"/><path d="M53 12 l3 -3 l3 2 l4 -3" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="0.45" fill="none"/>`,
    // Base: a box, keys and a board, the latch.
    `<path d="M18 17 L74 17 L78 28 L14 28 Z" fill="${shell}"/><path d="M18 17 L74 17 L74.4 18 L17.6 18 Z" fill="${lit(shell, 0.55)}"/>`,
    `<rect x="20" y="19" width="34" height="6.6" rx="0.6" fill="${dark}"/>`,
    [0, 1, 2].map((r) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<rect x="${21 + k * 4.1 + r * 0.6}" y="${19.8 + r * 1.9}" width="3.2" height="1.3" fill="${pro ? '#262b33' : '#3d4a52'}"/>`).join('')).join(''),
    box(57, 19, 15, 6.6, '#1d3b2c', light, { r: 0.4, top: 0.5, lit: 0.3 }),
    `<path d="M59 21 h4 v2 h3 M65 20.4 v4" stroke="#c9a54a" stroke-width="0.4" fill="none"/><rect x="66.4" y="21.2" width="3.4" height="2.6" fill="#111"/>`,
    `<rect x="14" y="28" width="64" height="2.4" fill="${mix(shell, SHADOW, 0.4)}"/>`,
    `<rect x="43" y="27.6" width="6" height="2" fill="${lit(dark, 0.3)}"/>`,
    // Antenna, off the back right.
    `<path d="M73 17 L82 3" stroke="${dark}" stroke-width="0.9"/><circle cx="82" cy="3" r="0.9" fill="${pro ? neon : '#ff3d5f'}"/>`,
    pro ? glow('M14.6 29.2 H77.4', neon, 0.4)
      : `<rect x="28" y="20.6" width="0" height="0"/><circle cx="62" cy="10" r="0"/><rect x="58" y="3.6" width="7" height="0.9" fill="#ff3d5f" opacity="0.9"/><path d="M16 28 l2.4 -2.4" stroke="${mix(shell, SHADOW, 0.6)}" stroke-width="0.8"/><rect x="31" y="3.2" width="5" height="1.2" fill="${TAPE}" opacity="0.8"/>`,
  ].join('');
}

// C: the brick. A handheld deck, held sideways: a chunky body with a small screen and thumb
// keys, a whip antenna, and the trode cable looping out to a jack. Street: taped, a cracked screen.
function deckBrick({ tier, light, neon }) {
  const pro = tier === 'pro';
  const shell = pro ? '#1d2229' : '#6a5d4b';
  const dark = pro ? '#111418' : '#2f2a24';
  const lit = (c, t = 0.45) => mix(c, light, t);
  return [
    `<path d="M20 8 L60 8 Q64 8 64 12 L64 24 Q64 28 60 28 L20 28 Q16 28 16 24 L16 12 Q16 8 20 8 Z" fill="${shell}"/>`,
    `<path d="M20 8 L60 8 Q64 8 64 12 L64 12.8 Q63.6 9.2 60 9.2 L20 9.2 Q16.4 9.2 16 12.8 L16 12 Q16 8 20 8 Z" fill="${lit(shell, 0.55)}"/>`,
    `<path d="M16 24 Q16 28 20 28 L60 28 Q64 28 64 24 L64 25 Q63.6 27 60 27 L20 27 Q16.4 27 16 25 Z" fill="${mix(shell, SHADOW, 0.45)}"/>`,
    // Screen, and the crack on the street one.
    `<rect x="20" y="11" width="24" height="13" rx="0.8" fill="#0b1a1c"/>`,
    `<path d="M22 14 h10 M22 16.4 h16 M22 18.8 h8 M22 21.2 h12" stroke="${pro ? neon : '#5fe0a5'}" stroke-width="0.7" opacity="0.85"/>`,
    pro ? '' : '<path d="M38 11 L34 16 L36 18 L31 24" stroke="#c9ccd3" stroke-width="0.35" fill="none" opacity="0.8"/>',
    // Thumb keys.
    [0, 1, 2].map((r) => [0, 1, 2].map((k) => `<rect x="${47.4 + k * 4.6}" y="${12 + r * 4.2}" width="3.6" height="3" rx="0.6" fill="${pro ? '#262b33' : '#3b342c'}"/><rect x="${47.4 + k * 4.6}" y="${12 + r * 4.2}" width="3.6" height="0.7" rx="0.35" fill="${lit(pro ? '#262b33' : '#3b342c', 0.4)}"/>`).join('')).join(''),
    pro ? glow('M17 26 H63', neon, 0.35) : `<rect x="15.4" y="15" width="2.4" height="8" fill="${TAPE}" opacity="0.75"/>`,
    // Whip antenna, the cable out to the jack.
    `<path d="M58 8 L62 1" stroke="${dark}" stroke-width="0.9"/><circle cx="62" cy="1" r="0.7" fill="${pro ? neon : '#ff3d5f'}"/>`,
    `<path d="M64 20 q8 0 9 4 q1 4 6 3 q5 -1 6 -6" stroke="${dark}" stroke-width="1" fill="none"/>`,
    `<rect x="83.6" y="16.4" width="3" height="4.6" rx="0.8" fill="${lit(dark, 0.4)}"/><rect x="84.6" y="14.8" width="1" height="1.8" fill="#c9ccd3"/>`,
  ].join('');
}

const item = (shapes, opts, width = 288) => {
  const id = `o${++uid}`;
  const { light } = opts;
  return `<svg viewBox="0 0 96 32" width="${width}" height="${Math.round((width * 32) / 96)}">
  <defs><linearGradient id="${id}" x1="1" x2="0"><stop offset="0" stop-color="${light}" stop-opacity="0.2"/><stop offset="0.35" stop-color="${light}" stop-opacity="0.09"/><stop offset="0.75" stop-color="${light}" stop-opacity="0.02"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></linearGradient></defs>
  <rect width="96" height="32" fill="#0d1016"/><rect width="96" height="32" fill="url(#${id})"/>${shapes({ ...opts, neon: NEON })}</svg>`;
};

const TAKES = [
  { kind: 'Drone', key: 'A', name: 'The quad', note: 'Four rotors, a camera on a gimbal. The street one: grey plastic, a taped arm, one odd orange guard.', fn: droneQuad },
  { kind: 'Drone', key: 'B', name: 'The kite', note: 'A small flying wing with a pusher prop, quiet and long-legged. Street: patched foam and a sticker.', fn: droneKite },
  { kind: 'Drone', key: 'C', name: 'The ducted fan', note: 'A drum with its fan inside and a sensor eye; hovers in a corridor. Street: dented, a zip-tied torch.', fn: droneDuct },
  { kind: 'Cyberdeck', key: 'A', name: 'The slab', note: 'A thick keyboard with a flip-up screen and a cable to a neural jack. Street: odd keycaps and tape.', fn: deckSlab },
  { kind: 'Cyberdeck', key: 'B', name: 'The case', note: 'A hard-shell carry case, open: screen in the lid, keys and a bare board in the base, an antenna.', fn: deckCase },
  { kind: 'Cyberdeck', key: 'C', name: 'The brick', note: 'A handheld: small screen, thumb keys, a whip antenna, the jack cable. Street: cracked and taped.', fn: deckBrick },
];
const section = (kind) => `<h2>${kind}</h2>${TAKES.filter((t) => t.kind === kind).map((t) => `
  <article><h3>${t.kind} ${t.key}: ${t.name}</h3><p>${t.note}</p>
    <div class="pair"><figure>${item(t.fn, { tier: 'street', light: LIGHTS.sodium })}<figcaption>Street · in the stash (sodium)</figcaption></figure>
    <figure>${item(t.fn, { tier: 'pro', light: LIGHTS.sodium })}<figcaption>Pro · in the stash</figcaption></figure></div>
    <div class="lights">${Object.entries(LIGHTS).map(([n, l]) => `<figure>${item(t.fn, { tier: 'street', light: l }, 140)}<figcaption>${n}</figcaption></figure>`).join('')}
    ${Object.entries(LIGHTS).map(([n, l]) => `<figure>${item(t.fn, { tier: 'pro', light: l }, 140)}<figcaption>pro · ${n}</figcaption></figure>`).join('')}</div>
  </article>`).join('')}`;

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Drone and Deck Options</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
body { margin: 0; background: #0a0c0f; color: #e9ecf1; font: 14px/1.45 system-ui, sans-serif; padding: 24px; }
h1, h2, h3 { font-family: 'Rajdhani', system-ui, sans-serif; text-transform: uppercase; letter-spacing: .12em; }
h1 { font-size: 1.4rem; margin: 0 0 4px; } h2 { color: #3de8d8; margin: 28px 0 8px; } h3 { margin: 0 0 2px; font-size: 1rem; }
p { color: #8a93a6; margin: 0 0 10px; max-width: 70ch; }
article { background: #12151b; border: 1px solid #2a303b; padding: 14px 16px; margin-bottom: 14px; }
.pair, .lights { display: flex; flex-wrap: wrap; gap: 12px; }
.lights { margin-top: 10px; }
figure { margin: 0; } figcaption { color: #8a93a6; font-size: .75rem; margin-top: 3px; }
svg { display: block; border: 1px solid #2a303b; }
</style></head><body>
<h1>The drone and the cyberdeck, as items</h1>
<p>Drawn like the rifle: a 96×32 frame, front to the right, flat colour, hard light from the right (the carrier's city light, or the safehouse's sodium lamp in the stash), no outlines. Street is second-hand and patched; pro is clean, with the carrier's neon. Pick one of each (or mix parts), and the rest of the armoury follows in the same hand.</p>
${section('Drone')}${section('Cyberdeck')}
</body></html>`;
const file = new URL('../drafts/prototypes/drone-deck-options.html', import.meta.url).pathname;
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
  for (let i = 0; i < await arts.count(); i++) await arts.nth(i).screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}-${TAKES[i].kind.toLowerCase()}-${TAKES[i].key}.png` });
  await b.close();
}
