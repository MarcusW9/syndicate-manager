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
};

const svg = (key, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><g ${stroke}>${PATHS[key] ?? ''}</g></svg>`;

/** A stat's icon followed by its name: "[wheel] Driving". */
export const statIcon = (stat) => `<span class="iconword">${svg(stat)}${stat[0].toUpperCase()}${stat.slice(1)}</span>`;

/** How many can go, as figures: one per person, with the words for screen readers. */
export const crewIcons = (n) => `<span class="iconcrew" role="img" aria-label="up to ${n} ${n === 1 ? 'person' : 'people'}">${Array.from({ length: n }, () => svg('person')).join('')}</span>`;
