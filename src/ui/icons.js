// Small line icons for stats and crew counts (owner's feedback, 2026-10-27), drawn like Joss's face
// (ART.md): thin strokes with round caps, in the text's own colour. Decorative only: every icon
// sits next to its word, or comes with the same words for screen readers (ART.md rule 1).

const stroke = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

// 24x24 paths, one idea each.
const PATHS = {
  combat: '<path d="M5 19l9-9M14 5l5 5M12 7l5 5M5 15l4 4M3 21l3-3"/>', // a blade
  stealth: '<path d="M3 12c2.5-4 5.5-6 9-6s6.5 2 9 6c-2.5 4-5.5 6-9 6s-6.5-2-9-6z"/><path d="M4 4l16 16"/>', // an eye, struck through
  tech: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3"/>', // a chip
  social: '<path d="M4 5h16v10H10l-4 4v-4H4z"/>', // a speech bubble
  driving: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M4.5 10.5l5.6 1M19.5 10.5l-5.6 1M12 14v6"/>', // a steering wheel
  medical: '<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>', // a cross
  cool: '<path d="M3 12h4l2-4 3 8 2-4h7"/>', // a steady pulse
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>',
  // Gear (slice 5): one per item type in data/gear.js.
  rifle: '<path d="M2 12h15l2-1.5h3M5 12l-1.5 5h3L8 12M11 12v2.5M9 9h5"/>', // a long gun with a scope
  pistol: '<path d="M4 7h15v4h-7l-2 7H6l2-7H4z"/>', // a handgun
  vest: '<path d="M8 3L4 6v14h16V6l-4-3-4 3z"/><path d="M12 6v14M7 11h3M14 11h3"/>', // plates on a vest
  drone: '<rect x="9" y="10" width="6" height="4" rx="1"/><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><path d="M7 7.5l2 2.5M17 7.5l-2 2.5M12 14v3"/>', // a quadcopter
  deck: '<rect x="5" y="5" width="14" height="10" rx="1"/><path d="M3 19h18M8 9h4M8 12h6"/>', // a deck
  medkit: '<rect x="3" y="7" width="18" height="13" rx="1"/><path d="M9 7V4h6v3M12 10.5v6M9 13.5h6"/>', // a bag with a cross
  picks: '<circle cx="7" cy="12" r="3.5"/><path d="M10.5 12H21M17 12v3M20 12v2"/>', // a key
  implant: '<path d="M8 21v-3.5A7 7 0 1 1 18 11l2 3h-2v3h-3v4"/><rect x="9" y="8" width="4" height="4"/>', // a head with a chip
};

const svg = (key, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><g ${stroke}>${PATHS[key] ?? ''}</g></svg>`;

/** An item's icon alone (data/gear.js type; implants share one), beside its name. */
export const gearGlyph = (type, slot) => svg(PATHS[type] ? type : slot === 'implant' ? 'implant' : 'tech');

/** A stat's icon alone, to sit right before its word (the word carries the meaning). */
export const statGlyph = (stat) => svg(stat);

/** A stat's icon followed by its name: "[wheel] Driving". */
export const statIcon = (stat) => `<span class="iconword">${svg(stat)}${stat[0].toUpperCase()}${stat.slice(1)}</span>`;

/** A stat's icon, name and value: "[chip] Tech 11". */
export const statValue = (stat, value) => `<span class="iconword">${svg(stat)}${stat[0].toUpperCase()}${stat.slice(1)} ${value}</span>`;

/**
 * How many people: one figure and the number ("[figure] 4"), the same width whatever the
 * size (owner's feedback, 2026-10-28: a figure per person didn't scale to four and up).
 * words: what a screen reader hears.
 */
export const crewIcons = (n, words = `up to ${n} ${n === 1 ? 'person' : 'people'}`) => `<span class="iconcrew" role="img" aria-label="${words}">${svg('person')}<span aria-hidden="true">${n}</span></span>`;
