// Skill pictures (2026-11-19): one drawn badge per move, payload and specialisation, for the skills list on a runner's page
// (drafts/PROPOSAL-runner-shaping.md step 3). Drawn in the portraits' hand (ART.md, "Lighting recipe"): flat colour shapes, no
// outlines, one hard shadow plane on the left and a lit rim on the right, the family colour falling from the right edge of a
// #0d1016 plate. The plate has the faces' cut corner and a glowing rim in the family colour (the neon frame the owner picked,
// "E1", over the other styles in docs/screenshots/2026-11-19-skill-badges). Inline SVG in code, no image files.
// Decorative only: the skill's name always sits beside it (ART.md rule 1), so the badge is aria-hidden.
//
// Colour is the family, so a list reads at a glance: moves cyan, specialisations sodium gold, and each payload the colour of the
// status it puts on (the stage's rings: infected green, burning orange, marked red, exposed yellow, shaken violet; data/builds.js,
// ui/styles.css `.fs-status--*`). A skill the runner cannot have yet is drawn grey by CSS (`.skillbadge--locked`), never here.

export const SKILL_COLOURS = {
  move: '#3de8d8', spec: '#f0bd3f',
  infected: '#8dff6a', burning: '#ff8a3d', marked: '#ff4d5e', exposed: '#ffd84d', shaken: '#b48cff',
};

/** Each skill's colour family: a key of SKILL_COLOURS. */
export const SKILL_KIND = {
  ricochet: 'move', cytotoxic: 'infected', contagion: 'infected', incendiary: 'burning', spotter: 'marked', breacher: 'exposed', rout: 'shaken',
  marksman: 'spec', droneJockey: 'spec',
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const NAVY = '#1b2340', INK = '#0d1016';

function artD(id) {
  const c = SKILL_COLOURS[SKILL_KIND[id]];
  const sh = mix(c, NAVY, .55), base = c, rim = mix(c, '#ffffff', .45);
  const steel = '#8c9bb2', steelSh = mix(steel, NAVY, .6), steelRim = mix(steel, c, .55), steelMid = mix(steel, NAVY, .3);
  const g = (n, a, b, d) => `<linearGradient id="${n}-${id}" gradientUnits="userSpaceOnUse" x1="6" y1="0" x2="42" y2="0"><stop offset="0" stop-color="${a}"/><stop offset=".45" stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset=".82" stop-color="${b}"/><stop offset=".82" stop-color="${d}"/><stop offset="1" stop-color="${d}"/></linearGradient>`;
  const defs = g('c', sh, base, rim) + g('m', steelSh, steelMid, steelRim) + g('k', mix(INK, c, .1), mix(INK, c, .2), mix(INK, c, .45)) +
    `<linearGradient id="bg-${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${INK}"/><stop offset=".35" stop-color="${INK}"/><stop offset="1" stop-color="${c}" stop-opacity=".30"/></linearGradient>`;
  const C = `url(#c-${id})`, M = `url(#m-${id})`, K = `url(#k-${id})`;
  const A = {
    ricochet: `<path d="M8 38 19 17l10 19 9-15" fill="none" stroke="${C}" stroke-width="3.600" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="19" cy="17" r="5.200" fill="${M}"/><circle cx="29" cy="36" r="5.200" fill="${M}"/><circle cx="38" cy="21" r="5.200" fill="${M}"/>
      <circle cx="19" cy="17" r="2.200" fill="${C}"/><circle cx="29" cy="36" r="2.200" fill="${C}"/><circle cx="38" cy="21" r="2.200" fill="${C}"/>`,
    cytotoxic: `<path d="M24 6c6 8 11 13 11 19a11 11 0 0 1-22 0c0-6 5-11 11-19z" fill="${C}"/><path d="M24 6c6 8 11 13 11 19a11 11 0 0 1-5 9.200c3-7 .500-16-6-28.200z" fill="${rim}" opacity=".55"/>
      <circle cx="21" cy="27" r="3.600" fill="${K}"/><circle cx="27.500" cy="31" r="2" fill="${K}"/><path d="M14 41h20v3H14z" fill="${C}" opacity=".7"/>`,
    contagion: `<path d="M16 8c4 6 8 10 8 14.500a8 8 0 0 1-16 0C8 18 12 14 16 8z" fill="${C}"/><path d="M16 8c4 6 8 10 8 14.500a8 8 0 0 1-3.500 6.600C22.500 22 21 15 16 8z" fill="${rim}" opacity=".55"/>
      <circle cx="31" cy="21" r="5.500" fill="${C}"/><circle cx="38" cy="35" r="4" fill="${C}"/><circle cx="24" cy="38" r="2.800" fill="${C}" opacity=".75"/>
      <path d="M22 12c6-4 12-2 15 4" fill="none" stroke="${rim}" stroke-width="2.400" stroke-linecap="round"/>`,
    incendiary: `<path d="M24 5c1.500 7 10 10 10 20a10 10 0 0 1-20 0c0-5 2.500-7.500 4.500-10 .500 3 2 4.500 3.500 5C22 17 22.500 11 24 5z" fill="${C}"/>
      <path d="M24 5c1.500 7 10 10 10 20a10 10 0 0 1-4.500 8.300C33 24 28 14 24 5z" fill="${rim}" opacity=".5"/>
      <path d="M24 24c4 3 4.500 8 0 11.500-4.500-3.500-4-8.500 0-11.500z" fill="#ffe07a"/>
      <rect x="18" y="39" width="12" height="5" rx="1.200" fill="${M}"/><path d="M20 39v-2.500h8V39z" fill="#d6a050"/>`,
    spotter: `<path d="M5 24c4.500-8 11-12 19-12s14.500 4 19 12c-4.500 8-11 12-19 12S9.500 32 5 24z" fill="${M}"/>
      <circle cx="24" cy="24" r="9" fill="${C}"/><circle cx="24" cy="24" r="4.200" fill="${INK}"/><circle cx="27" cy="21" r="1.600" fill="${rim}"/>
      <path d="M24 3v6M24 39v6M3 24h4M41 24h4" stroke="${rim}" stroke-width="2.400" stroke-linecap="round"/>`,
    breacher: `<path d="M24 5l15 5.500V23c0 9.500-6.500 16-15 20-8.500-4-15-10.500-15-20V10.500z" fill="${M}"/>
      <path d="M24 5l15 5.500V23c0 9.500-6.500 16-15 20z" fill="${steelRim}" opacity=".35"/>
      <path d="M26 9l-8 14 8 3-6 14 14-18-8-3z" fill="${C}"/><path d="M26 9l-3 5.500 4 .700z" fill="${rim}"/>`,
    rout: `<circle cx="22" cy="16" r="7" fill="${C}"/><path d="M9 41c.700-10 6-15 13-15s12.300 5 13 15z" fill="${C}"/>
      <path d="M22 9a7 7 0 0 1 0 14c3-4 3-10 0-14z" fill="${rim}" opacity=".5"/><path d="M22 26c7 0 12.300 5 13 15h-5c-.500-8-3-12.500-8-15z" fill="${rim}" opacity=".4"/>
      <path d="M8 14c-2.500 3-2.500 7 0 10M4 11.500c-4 4.500-4 11 0 15.500" fill="none" stroke="${base}" stroke-width="2.200" stroke-linecap="round" opacity=".7"/>
      <path d="M33 27l10 4.500-10 4.500 2.400-4.500z" fill="${rim}"/>`,
    marksman: `<circle cx="24" cy="24" r="14" fill="none" stroke="${C}" stroke-width="4.200"/><circle cx="24" cy="24" r="6" fill="${K}"/><circle cx="24" cy="24" r="3" fill="${rim}"/>
      <path d="M24 4v10M24 34v10M4 24h10M34 24h10" stroke="${C}" stroke-width="3.200" stroke-linecap="round"/>`,
    droneJockey: `<path d="M13 13l22 22M35 13L13 35" stroke="${M}" stroke-width="3.400" stroke-linecap="round"/>
      <circle cx="11" cy="11" r="6.500" fill="${C}" opacity=".85"/><circle cx="37" cy="11" r="6.500" fill="${C}" opacity=".85"/><circle cx="11" cy="37" r="6.500" fill="${C}" opacity=".85"/><circle cx="37" cy="37" r="6.500" fill="${C}" opacity=".85"/>
      <rect x="17.500" y="17.500" width="13" height="13" rx="2.500" fill="${M}"/><rect x="21" y="21" width="6" height="6" rx="1.200" fill="${C}"/>`,
  }[id];
  return { defs, art: A };
}

export const SKILL_IDS = Object.keys(SKILL_KIND);

/**
 * A skill's badge as inline SVG: `id` is a move, payload or specialisation id (data/builds.js, data/specialisations.js); `size` is
 * pixels (48 in the list, 56 in the slots). An unknown id draws an empty plate.
 */
export function skillIcon(id, size = 48) {
  const kind = SKILL_KIND[id];
  if (!kind) return `<svg class="skillbadge" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true" focusable="false" style="--sk:#8a93a6"><path d="M3 3h33l9 9v33H3z" fill="#0d1016" stroke="var(--sk)" stroke-width="1.6"/></svg>`;
  const { defs, art } = artD(id);
  return `<svg class="skillbadge" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true" focusable="false" style="--sk:${SKILL_COLOURS[kind]}">`
    + `<defs>${defs}<clipPath id="cp-${id}"><path d="M3 3h33l9 9v33H3z"/></clipPath></defs>`
    + `<g clip-path="url(#cp-${id})"><rect width="48" height="48" fill="url(#bg-${id})"/><g transform="translate(3 3) scale(.875)">${art}</g></g>`
    + `<path d="M3 3h33l9 9v33H3z" fill="none" stroke="var(--sk)" stroke-width="1.6"/></svg>`;
}
