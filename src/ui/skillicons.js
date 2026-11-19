// Skill pictures (2026-11-19): one drawn badge per move, payload and specialisation, for the trait menu on a runner's page
// (drafts/PROPOSAL-runner-shaping.md step 3). Same hand as ui/icons.js (thin round strokes, drawn in code, no image files), but bigger
// (48x48) and in colour: a dark badge with one cut corner (the skin's panel shape) whose rim, strokes and fills take the piece's colour.
// Decorative only: the piece's name always sits beside or under it (ART.md rule 1), so the badge is aria-hidden.
//
// Colour is the family, so a menu reads at a glance: moves are cyan, specialisations sodium gold, and each payload takes the colour of
// the status it puts on (the same colours as the fight stage's rings: infected green, burning orange, marked red, exposed yellow,
// shaken violet; data/builds.js, ui/styles.css `.fs-status--*`).

export const SKILL_COLOURS = {
  move: '#3de8d8', spec: '#f0bd3f',
  infected: '#8dff6a', burning: '#ff8a3d', marked: '#ff4d5e', exposed: '#ffd84d', shaken: '#b48cff',
};

// Each art is drawn in the 48x48 badge, glyph area about 9..39. `s` = strokes in the colour, `f` = the filled accents (the colour
// at partial opacity under a bright stroke would be muddy on the dark badge, so accents are solid).
const ART = {
  // MOVES -----------------------------------------------------------------------------------------------------------------
  ricochet: { kind: 'move', name: 'Ricochet', art: `
    <path class="s" d="M9 37L19 17l10 18 8-14"/><path class="s" d="M32.500 20.500l5-.5-.2 5"/>
    <circle class="f" cx="19" cy="17" r="3.4"/><circle class="f" cx="29" cy="35" r="3.4"/><circle class="s" cx="38" cy="20" r="3.4"/>` },
  // PAYLOADS --------------------------------------------------------------------------------------------------------------
  cytotoxic: { kind: 'infected', name: 'Cytotoxic Vector', art: `
    <path class="f" d="M24 8c5 7 9 11.5 9 16.5a9 9 0 0 1-18 0C15 19.500 19 15 24 8z"/>
    <path class="d" d="M19.500 25.500a4.500 4.500 0 0 0 4 4.500" />
    <path class="s" d="M13 38.500h22M16 42h16" opacity=".75"/>` },
  contagion: { kind: 'infected', name: 'Contagion Vector', art: `
    <path class="f" d="M14 17c3 4.500 5.500 7 5.500 10a5.500 5.500 0 0 1-11 0c0-3 2.500-5.500 5.500-10z"/>
    <path class="s" d="M22 14c5-5 12-4.500 16 1"/><path class="s" d="M34.500 11.500l4 3.500-4.800 1.600"/>
    <circle class="s" cx="30" cy="30" r="4.600"/><circle class="s" cx="40" cy="36" r="3.400"/><path class="s" d="M24.500 29h1M34.500 31.500l2 1.400"/>` },
  incendiary: { kind: 'burning', name: 'Incendiary Rounds', art: `
    <path class="f" d="M24 7c1 6 8 9 8 18a8 8 0 0 1-16 0c0-4 2-6 3.500-8 .5 2.500 1.800 3.500 3 4C22 17 22.500 12 24 7z"/>
    <path class="d" d="M24 24c3 2.500 3.500 6 0 8.500-3.500-2.500-3-6 0-8.500z"/>
    <path class="s" d="M17 40h14M19 43.500h10" opacity=".75"/>` },
  spotter: { kind: 'marked', name: 'Spotter’s Eye', art: `
    <path class="s" d="M6 24c4.500-7 11-11 18-11s13.500 4 18 11c-4.500 7-11 11-18 11S10.500 31 6 24z"/>
    <circle class="s" cx="24" cy="24" r="6.500"/><circle class="f" cx="24" cy="24" r="2.600"/>
    <path class="s" d="M24 5v6M24 37v6M5 24h4M39 24h4" opacity=".8"/>` },
  breacher: { kind: 'exposed', name: 'Breacher', art: `
    <path class="s" d="M24 6l14 5v11c0 9-6 15-14 19-8-4-14-10-14-19V11z"/>
    <path class="f" d="M25 10l-6 11 7 3-5 13 12-16-7-3z"/>` },
  rout: { kind: 'shaken', name: 'Rout', art: `
    <circle class="s" cx="21" cy="17" r="5.200"/><path class="s" d="M11 38c.8-8 4.500-12 10-12s9.200 4 10 12"/>
    <path class="s" d="M9 15c-1.800 2.500-1.800 5.500 0 8M35 15c1.800 2.500 1.800 5.500 0 8" opacity=".8"/>
    <path class="f" d="M34 29l9 4-9 4 2-4z"/>` },
  // SPECIALISATIONS -------------------------------------------------------------------------------------------------------
  marksman: { kind: 'spec', name: 'Marksman', art: `
    <circle class="s" cx="24" cy="24" r="12.500"/><circle class="s" cx="24" cy="24" r="5"/><circle class="f" cx="24" cy="24" r="1.800"/>
    <path class="s" d="M24 5v9M24 34v9M5 24h9M34 24h9"/>` },
  droneJockey: { kind: 'spec', name: 'Drone Jockey', art: `
    <rect class="f" x="19.500" y="19.500" width="9" height="9" rx="1.500"/>
    <circle class="s" cx="11" cy="11" r="5.200"/><circle class="s" cx="37" cy="11" r="5.200"/><circle class="s" cx="11" cy="37" r="5.200"/><circle class="s" cx="37" cy="37" r="5.200"/>
    <path class="s" d="M15 15l5 5M33 15l-5 5M15 33l5-5M33 33l-5-5"/>` },
};

export const SKILL_ART = ART;
export const SKILL_IDS = Object.keys(ART);

/**
 * A skill's badge as inline SVG. `id`: a key of ART (a move, payload or specialisation id). `size`: pixels (48 by default; the menu
 * grid uses 56, the held row 40). `state`: 'held' (full colour, the default), 'open' (reachable: full colour, no glow) or 'locked'
 * (the colour drained to grey). An unknown id draws an empty badge.
 */
export function skillIcon(id, size = 48, state = 'held') {
  const a = ART[id];
  const colour = a ? SKILL_COLOURS[a.kind] : '#8a93a6';
  return `<svg class="skill skill--${state}" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true" focusable="false" style="--sk:${colour}">`
    + `<path class="skill__plate" d="M3 3h33l9 9v33H3z"/>${a?.art ?? ''}</svg>`;
}
