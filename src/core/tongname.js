// The name of our own tong: picked on the first screen, changed later from the Tong screen
// (DESIGN.md 2026-11-13). Display only: nothing in the rules reads it.
import { NAMES } from '../config/names.js';

export const TONG_NAME_MAX = 24;

const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');

/** The name to show: the chosen one, or the default for a save that has none. */
export const tongNameOf = (state) => state?.tongName || NAMES.defaultTong;

/** Tidy a typed name: letters, digits, spaces and . & ' - only, one space between words, 24 characters at most. */
export function cleanTongName(raw) {
  return String(raw ?? '').replace(/[^\p{L}\p{N} .&'’-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, TONG_NAME_MAX).trim();
}

/** Why a typed name can't be used (empty, or another tong's name), or null if it can. */
export function tongNameProblem(state, raw) {
  const name = cleanTongName(raw);
  if (!name) return 'A tong needs a name.';
  const taken = (state?.rivals?.tongs ?? []).some((t) => slug(t.name) === slug(name));
  return taken ? 'Another tong already goes by that.' : null;
}

/** Set our tong's name. A name that can't be used leaves the state as it was. */
export function setTongName(state, raw) {
  if (tongNameProblem(state, raw)) return state;
  return { ...state, tongName: cleanTongName(raw) };
}
