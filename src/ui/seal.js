// A house's seal (E0, 2026-11-14): a small cut-corner tile in its style's colour with two letters of its name.
// It is the house's face wherever a tong is named. Ours is solid cyan; a free name's is a dashed green outline
// with a dot. Pure markup: no state, no numbers. Styles in styles.css (".seal").

export const SEAL_COLOUR = { loud: '#ff3d5f', quiet: '#b48cff', corporate: '#3de8d8', street: '#f2d541' };
export const SEAL_SIZES = [20, 24, 34, 44, 60];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Two letters from a tong's name: a short first word as it stands, else the first letters of its first two words. */
export function letters(name) {
  const w = String(name).replace(/&/g, '').split(' ').filter(Boolean);
  if (!w.length) return '?';
  return (w[0].length <= 3 ? w[0] : w[0][0] + (w[1]?.[0] ?? '')).toUpperCase().slice(0, 2);
}

/**
 * @param {{name?: string, style?: string, ours?: boolean}|'free'|null} t  a tong; `ours: true` for our own (name = our tong's); 'free' or null for between tongs
 * @param {number} size one of SEAL_SIZES
 */
export function seal(t, size = 34) {
  const px = `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.32)}px`;
  if (!t || t === 'free') return `<span class="seal seal--free" style="${px}" role="img" aria-label="Between tongs"></span>`;
  if (t.ours) return `<span class="seal seal--ours" style="${px}" role="img" aria-label="Ours">${esc(letters(t.name))}</span>`;
  return `<span class="seal" style="${px};--tong:${SEAL_COLOUR[t.style] ?? '#8a93a6'}" role="img" aria-label="${esc(t.name)}">${esc(letters(t.name))}</span>`;
}
