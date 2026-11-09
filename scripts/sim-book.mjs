// The Anchor's Book against the truth (C5.6). Plays the rivals forward without a player (the Book sees the
// five-rookie crew too) and compares each slate with a slate built from the HIDDEN rating by the same caps.
// Targets (DESIGN.md 2026-11-09 "C5"): the Book's BAND (top = S/A, middle = B/C, low = D) matches the true band 65-80% of the
// time; every Book has at least one misgraded S/A name and at least one quiet S/A runner missed. The exact-grade match is
// printed too: it is far lower by nature (the Book only sees fame, form and age), and is not a target.
// Usage: node scripts/sim-book.mjs [seeds=40]
import { createNewGame } from '../src/core/state.js';
import { weeklyRivals } from '../src/core/rivals.js';
import { bookCandidates, baseScore } from '../src/core/book.js';
import { BOOK } from '../src/data/rivals.js';

/** The true grades: the same caps filled in order of the HIDDEN rating (no thresholds, just rank). */
function trueGrades(cands) {
  const sorted = [...cands].sort((a, b) => b.rating - a.rating || (a.runnerId < b.runnerId ? -1 : 1));
  const out = new Map(); let i = 0;
  for (const g of BOOK.grades) for (let k = 0; k < BOOK.caps[g] && i < sorted.length; k++) out.set(sorted[i++].runnerId, g);
  return out;
}

const seeds = Number(process.argv[2] ?? 40);
if (process.env.BOOK) Object.assign(BOOK, JSON.parse(process.env.BOOK)); // tuning: BOOK='{"biasSpread":5}' node scripts/sim-book.mjs
const band = (g) => (g === 'S' || g === 'A' ? 'top' : g === 'D' || !g ? 'low' : 'mid');
const report = { 26: { n: 0, match: 0, bandMatch: 0, topMatch: 0, total: 0, misS: 0, quiet: 0, books: 0 }, 52: { n: 0, match: 0, bandMatch: 0, topMatch: 0, total: 0, misS: 0, quiet: 0, books: 0 } };
const spread = { 26: {}, 52: {} };
for (let seed = 1; seed <= seeds; seed++) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  for (let w = 1; w <= 52; w++) {
    s.day = 7 * w; weeklyRivals(s);
    if (w !== 26 && w !== 52) continue;
    // The slate goes up on week 24 and 28 (day%28); audit the latest at the checkpoint.
    const book = s.rivals.book; if (!book) continue;
    const cands = bookCandidates(s);
    const truth = trueGrades(cands);
    const r = report[w]; r.books++;
    let misS = false;
    for (const e of book.entries) {
      r.total++; spread[w][e.grade] = (spread[w][e.grade] ?? 0) + 1;
      const t = truth.get(e.runnerId);
      if (t === e.grade) r.match++;
      if (band(t) === band(e.grade)) r.bandMatch++;
      if ((band(t) === 'top') === (band(e.grade) === 'top')) r.topMatch++;
      if (['S', 'A'].includes(e.grade) && !['S', 'A'].includes(t)) misS = true;
    }
    const bookSA = new Set(book.entries.filter((e) => ['S', 'A'].includes(e.grade)).map((e) => e.runnerId));
    const quiet = [...truth].some(([id, g]) => ['S', 'A'].includes(g) && !bookSA.has(id));
    if (misS) r.misS++; if (quiet) r.quiet++;
  }
}
for (const w of [26, 52]) {
  const r = report[w];
  console.log(`week ${w}: ${r.books} books | band matches ${(100 * r.bandMatch / r.total).toFixed(0)}% (top-or-not ${(100 * r.topMatch / r.total).toFixed(0)}%, exact grade ${(100 * r.match / r.total).toFixed(0)}%) | a misgraded S/A name in ${(100 * r.misS / r.books).toFixed(0)}% | a quiet S/A runner missed in ${(100 * r.quiet / r.books).toFixed(0)}% | spread ${JSON.stringify(spread[w])}`);
}
