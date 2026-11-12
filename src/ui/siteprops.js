// The city's tech, dotted round the job maps (2026-11-12, owner: "dot around all maps to make them
// have the cyberpunk flavour"): auto-taxis, AR adverts, rooftop neon, dishes, vending machines,
// parked drones, junction boxes, steam vents and overhead cables. Drawn like the rest of the plan
// (ui/siteart.js): flat planes, the light from the right, hard shadows; only tech and neon glow
// (ART.md rule 6). Decoration only: a prop is never cover and never on the route, and the core
// never reads one (tests/siteprops.test.js keeps them clear). Placed by hand in each site's
// `props` (data/sites.js). Pure strings, no DOM.

const NAVY = '#1b2340';
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const hash = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

/** A box's hard shadow falling left and down (as in siteart.js). */
const cast = (x, y, w, h, len) => {
  const d = len * 0.6;
  return `<polygon points="${x + w},${y} ${x + w},${y + h} ${x + w - len},${y + h + d} ${x - len},${y + h + d} ${x - len},${y + d} ${x},${y}" fill="${NAVY}" opacity="0.8"/>`;
};
/** Bars of light standing in for an advert's glyphs (no words: the city's languages are many). */
const glyphs = (x, y, w, h, c, seed, op = 0.75) => {
  const out = [];
  const rows = Math.max(1, Math.floor(h / 4));
  for (let r = 0; r < rows; r++) {
    let gx = x + 1.5;
    const gy = y + 1.5 + r * ((h - 3) / rows);
    while (gx < x + w - 3) {
      const bw = 1.5 + hash(seed + gx, r) * 4;
      if (gx + bw > x + w - 1.5) break;
      out.push(`<rect x="${gx.toFixed(1)}" y="${gy.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.min(2, (h - 3) / rows - 0.6).toFixed(1)}" fill="${c}" opacity="${op}"/>`);
      gx += bw + 1;
    }
  }
  return out.join('');
};

/** Each kind: its box (for the test: where it sits) and how it's drawn. */
export const PROPS = {
  /** An auto-taxi on the road, nose to the right: a light bar on the roof, its headlights on the tarmac. */
  car: {
    box: (p) => [p.x, p.y, 16, 8],
    draw: ({ x, y, c = '#3de8d8' }) => `${cast(x, y, 16, 8, 2)}
      <polygon points="${x + 16},${y + 1} ${x + 34},${y - 4} ${x + 34},${y + 12} ${x + 16},${y + 7}" fill="#f7efc8" opacity="0.07"/>
      <rect x="${x}" y="${y}" width="16" height="8" rx="2" fill="#1e2430"/><rect x="${x + 10}" y="${y}" width="6" height="8" rx="2" fill="#262d3b"/>
      <rect x="${x + 4}" y="${y + 1.4}" width="7" height="5.2" fill="#141922"/><rect x="${x + 11}" y="${y + 1.4}" width="2.2" height="5.2" fill="#2f4656"/>
      <rect x="${x + 6.5}" y="${y + 1.4}" width="1.2" height="5.2" fill="${c}"/>
      <rect x="${x + 15.2}" y="${y + 0.8}" width="0.8" height="1.6" fill="#f7efc8"/><rect x="${x + 15.2}" y="${y + 5.6}" width="0.8" height="1.6" fill="#f7efc8"/>
      <rect x="${x}" y="${y + 0.8}" width="0.8" height="1.6" fill="#ff3d5f"/><rect x="${x}" y="${y + 5.6}" width="0.8" height="1.6" fill="#ff3d5f"/>`,
  },
  /** An AR advert hanging in the air over its emitter: a see-through panel, scan lines, glyphs. */
  holo: {
    box: (p) => [p.x, p.y, p.w, p.h + 4],
    draw: ({ x, y, w, h, c = '#ff3d5f' }) => {
      const scan = [];
      for (let sy = y + 1; sy < y + h; sy += 2) scan.push(`M${x} ${sy}h${w}`);
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" opacity="0.1"/>
        <path d="${scan.join('')}" stroke="${c}" stroke-width="0.3" opacity="0.25"/>${glyphs(x, y, w, h, c, x + y, 0.55)}
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="0.6" opacity="0.6"/>
        <polygon points="${x + w / 2 - 1},${y + h + 3} ${x + w / 2 + 1},${y + h + 3} ${x + w * 0.8},${y + h} ${x + w * 0.2},${y + h}" fill="${c}" opacity="0.12"/>
        <rect x="${x + w / 2 - 1.5}" y="${y + h + 2.4}" width="3" height="1.6" fill="#1a1f29"/><rect x="${x + w / 2 - 0.5}" y="${y + h + 2.4}" width="1" height="0.8" fill="${c}"/>`;
    },
  },
  /** A neon sign on a roof (or hung off a wall, if it's taller than wide): a frame, its glyphs, a hard halo. */
  billboard: {
    box: (p) => [p.x, p.y, p.w, p.h],
    draw: ({ x, y, w, h, c = '#ff3d5f' }) => `${cast(x, y, w, h, 3)}
      <rect x="${x - 1.5}" y="${y - 1.5}" width="${w + 3}" height="${h + 3}" fill="${c}" opacity="0.18"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1a1f29"/><rect x="${x + 0.8}" y="${y + 0.8}" width="${w - 1.6}" height="${h - 1.6}" fill="${mix(c, '#05070a', 0.75)}"/>
      ${glyphs(x + 0.8, y + 0.8, w - 1.6, h - 1.6, c, x * 3 + y, 0.9)}`,
  },
  /** A satellite dish on a roof, its feed arm over the bowl. */
  dish: {
    box: (p) => [p.x, p.y, 9, 9],
    draw: ({ x, y }) => `<circle cx="${x + 2.8}" cy="${y + 6.2}" r="4" fill="${NAVY}" opacity="0.8"/>
      <circle cx="${x + 4.5}" cy="${y + 4.5}" r="4" fill="#2a303c"/><path d="M${x + 4.5} ${y + 0.5}a4 4 0 0 1 0 8z" fill="#3a4152"/>
      <path d="M${x + 4.5} ${y + 4.5}L${x + 7.6} ${y + 1.6}" stroke="#5a6272" stroke-width="0.6"/><circle cx="${x + 7.6}" cy="${y + 1.6}" r="0.8" fill="#ff3d5f"/>`,
  },
  /** A vending machine against a wall, its lit front throwing colour on the ground. */
  vending: {
    box: (p) => [p.x, p.y, 8, 5],
    draw: ({ x, y, c = '#3de8d8' }) => `${cast(x, y, 8, 5, 2)}
      <polygon points="${x},${y + 5} ${x + 8},${y + 5} ${x + 11},${y + 11} ${x - 3},${y + 11}" fill="${c}" opacity="0.14"/>
      <rect x="${x}" y="${y}" width="8" height="5" fill="#1d222c"/><rect x="${x + 5.4}" y="${y}" width="2.6" height="5" fill="#262c38"/>
      <rect x="${x}" y="${y + 3.6}" width="8" height="1.4" fill="${c}"/><rect x="${x + 1}" y="${y + 1}" width="1" height="1" fill="#f2d541"/><rect x="${x + 2.6}" y="${y + 1}" width="1" height="1" fill="#ff3d5f"/>`,
  },
  /** A delivery drone parked on the ground: four rotors on an X, a status light. */
  drone: {
    box: (p) => [p.x, p.y, 10, 10],
    draw: ({ x, y, c = '#3de8d8' }) => {
      const cx = x + 5; const cy = y + 5;
      const rotor = (dx, dy) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="2" fill="#141922" stroke="#5a6272" stroke-width="0.5"/>`;
      return `<ellipse cx="${cx - 2}" cy="${cy + 2}" rx="5" ry="3.6" fill="${NAVY}" opacity="0.7"/>
        <path d="M${cx - 3} ${cy - 3}L${cx + 3} ${cy + 3}M${cx + 3} ${cy - 3}L${cx - 3} ${cy + 3}" stroke="#3a4152" stroke-width="1"/>
        ${rotor(-3, -3)}${rotor(3, -3)}${rotor(-3, 3)}${rotor(3, 3)}
        <rect x="${cx - 1.4}" y="${cy - 1.4}" width="2.8" height="2.8" fill="#262c38"/><rect x="${cx}" y="${cy - 1.4}" width="1.4" height="2.8" fill="#323a4a"/>
        <circle cx="${cx}" cy="${cy}" r="0.6" fill="${c}"/>`;
    },
  },
  /** A junction box: a grey cabinet, lit on the right, three status lights. */
  junction: {
    box: (p) => [p.x, p.y, 6, 5],
    draw: ({ x, y }) => `${cast(x, y, 6, 5, 1.5)}<rect x="${x}" y="${y}" width="6" height="5" fill="#262c37"/><rect x="${x + 4}" y="${y}" width="2" height="5" fill="#323a48"/>
      <rect x="${x + 0.8}" y="${y + 1}" width="0.8" height="0.8" fill="#5fe0a5"/><rect x="${x + 0.8}" y="${y + 2.2}" width="0.8" height="0.8" fill="#f2b544"/><rect x="${x + 0.8}" y="${y + 3.4}" width="0.8" height="0.8" fill="#ff3d5f"/>`,
  },
  /** A steam vent: a grate in the ground, steam drifting up and left off it in a flat pale plane. */
  vent: {
    box: (p) => [p.x - 8, p.y - 8, 15, 15],
    draw: ({ x, y }) => `<polygon points="${x + 1},${y} ${x + 6},${y} ${x - 2},${y - 8} ${x - 8},${y - 6}" fill="#c9d3e0" opacity="0.08"/>
      <rect x="${x}" y="${y}" width="7" height="7" fill="#151920"/>
      <path d="M${x + 0.5} ${y + 1.5}h6M${x + 0.5} ${y + 3.5}h6M${x + 0.5} ${y + 5.5}h6" stroke="#2a303b" stroke-width="0.8"/>`,
  },
  /** Cables strung overhead between buildings, sagging (above everything: they may cross the route). */
  cables: {
    box: null,
    draw: ({ points }) => [0, 1.2, 2.4].map((o) => `<polyline points="${points.map(([px, py], i) => `${px},${py + o + (i > 0 && i < points.length - 1 ? o * 0.6 : 0)}`).join(' ')}" fill="none" stroke="#05070a" stroke-width="0.7" opacity="0.9"/>`).join('')
      + `<polyline points="${points.map(([px, py]) => `${px},${py + 1.2}`).join(' ')}" fill="none" stroke="#3de8d8" stroke-width="0.4" stroke-dasharray="1 6" opacity="0.6"/>`,
  },
};

/** A site's props as one layer, drawn over its shapes and under the route. */
export function propsSvg(site) {
  const list = site.props ?? [];
  return list.length ? `<g class="sp-props">${list.map((p) => PROPS[p.kind]?.draw(p) ?? '').join('')}</g>` : '';
}

/** Where a prop sits, [x, y, w, h], or null for one that hangs overhead (cables). */
export const propBox = (p) => PROPS[p.kind]?.box?.(p) ?? null;
