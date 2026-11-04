// The tong's rank (DESIGN.md 2026-11-04): replaces the old, never-moving state.tier. Pure logic.
import { TONG_RANKS, STARTING_RANK } from '../data/tong.js';

/** The tong's rank as { id, name }; an unknown id reads as the starting rank. */
export const rankOf = (state) => TONG_RANKS.find((r) => r.id === state.rank) ?? TONG_RANKS.find((r) => r.id === STARTING_RANK);
