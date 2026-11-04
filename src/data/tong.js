// The tong's ranks (WORLD.md "Tongs"; DESIGN.md 2026-11-04): how far the tong's name carries.
// Content only. Phase 1 shows the rank; the gates that move a tong up come with Phase 2.

export const TONG_RANKS = [
  { id: 'backroom', name: 'Back Room' },
  { id: 'street', name: 'Street' },
  { id: 'district', name: 'District' },
  { id: 'city', name: 'City' },
  { id: 'harbour', name: 'Harbour' },
];

export const STARTING_RANK = 'backroom';

/** Joss explains the word, on tapping the rank in the top bar. */
export const TONG_EXPLAINER = "A tong's a hall: an association, like a guild, with a front room and a seat at the table. Ours is a back-room tong for now. The rank is how far our name carries.";
