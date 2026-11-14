// E1 gate audit (drafts/PROPOSAL-tong-depth.md section 2): houses have habits. Over N seeds and S seasons, per habit: roster
// size, releases a season, where a released name lands (a tier above, the same, below, or unsigned), and the free name's
// cadence and the card total. E2 (overreach) adds: selling stories a season (median across seeds and seasons), the share that end
// broken, seeds where a Harbour or City house breaks, the active tong count, and the sale. Usage: node scripts/sim-tongs.mjs [seeds=50] [seasons=6]
import { createNewGame } from '../src/core/state.js';
import { weeklyRivals, tongTier } from '../src/core/rivals.js';
import { HABITS, HABIT_IDS } from '../src/data/rivals.js';
import { TONG_RANKS } from '../src/data/tong.js';

const SEEDS = Number(process.argv[2] ?? 50); const SEASONS = Number(process.argv[3] ?? 6);
const tierIx = (t) => TONG_RANKS.findIndex((k) => k.id === tongTier(t));
const per = Object.fromEntries(HABIT_IDS.map((h) => [h, { sundays: 0, inRange: 0, size: 0, releases: 0, tongSeasons: 0 }]));
const land = { above: 0, same: 0, below: 0, unsigned: 0, fromTop: 0, fromTopLowerOrFree: 0 };
const sellStarts = []; let sellTotal = 0; let brokenTotal = 0; let seedsBigBreak = 0; let minActive = 99; let maxActive = 0; let saleOpens = 0; let saleNames = 0; let stretchedTotal = 0; let bought = 0;
let offers = 0; const gaps = {}; let minTotal = 99; let maxTotal = 0; let emptyPool = 0; let sundays = 0;

for (let seed = 1; seed <= SEEDS; seed++) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  const r = s.rivals; const pending = new Map(); let last = null; let lastOfferDay = null;
  const seen = new Map(); const perSeason = Array(SEASONS).fill(0); let bigBreak = false; const prevTier = new Map(); let lastSale = null;
  for (let w = 0; w < 52 * SEASONS; w++) {
    s.day = 7 * (w + 1);
    const before = new Map(r.cards.map((c) => [c.id, c.tongId]));
    weeklyRivals(s);
    sundays++;
    const tongById = (id) => r.tongs.find((t) => t.id === id);
    for (const c of r.cards) {
      const was = before.get(c.id);
      if (was && !c.tongId) { const t = tongById(was); if (r.word.some((x) => x.kind === 'let_go' && x.day === s.day && x.refs[0] === c.id)) { pending.set(c.id, tierIx(t)); per[t.habit].releases++; } }
      if (pending.has(c.id) && c.tongId) {
        const from = pending.get(c.id); const to = tierIx(tongById(c.tongId)); pending.delete(c.id);
        land[to > from ? 'above' : to === from ? 'same' : 'below']++;
        if (from >= TONG_RANKS.length - 2) { land.fromTop++; if (to < from) land.fromTopLowerOrFree++; }
      }
    }
    for (const t of r.tongs.filter((x) => x.status === 'active')) {
      const n = r.cards.filter((c) => c.tongId === t.id).length; const p = per[t.habit];
      p.sundays++; p.size += n; if (n >= HABITS[t.habit].roster[0] - 1 && n <= HABITS[t.habit].roster[1]) p.inRange++;
    }
    if (r.offer && r.offer.day !== lastOfferDay) { offers++; if (last != null) gaps[Math.round((s.day - last) / 7)] = (gaps[Math.round((s.day - last) / 7)] ?? 0) + 1; last = s.day; lastOfferDay = r.offer.day; }
    for (const th of r.threads.filter((x) => x.family === 'overreach')) {
      const was = seen.get(th.id) ?? { selling: false, broken: false };
      if (th.stage === 'stretched' && !seen.has(th.id)) stretchedTotal++;
      if ((th.stage === 'selling' || th.stage === 'broken') && !was.selling) { was.selling = true; sellTotal++; perSeason[Math.min(SEASONS - 1, Math.floor(w / 52))]++; }
      if (th.stage === 'broken' && !was.broken) { was.broken = true; brokenTotal++; if ((prevTier.get(th.tongId) ?? 0) >= TONG_RANKS.length - 2) bigBreak = true; }
      seen.set(th.id, was);
    }
    for (const t of r.tongs) prevTier.set(t.id, tierIx(t));
    if (r.sale && JSON.stringify(r.sale.cardIds) !== lastSale) { saleOpens++; saleNames += r.sale.cardIds.length; }
    lastSale = r.sale ? JSON.stringify(r.sale.cardIds) : null;
    bought += r.word.filter((x) => x.kind === 'bought' && x.day === s.day).length;
    const act = r.tongs.filter((t) => t.status === 'active').length; minActive = Math.min(minActive, act); maxActive = Math.max(maxActive, act);
    if (!r.cards.some((c) => !c.tongId)) emptyPool++;
    minTotal = Math.min(minTotal, r.cards.length); maxTotal = Math.max(maxTotal, r.cards.length);
  }
  sellStarts.push(...perSeason); if (bigBreak) seedsBigBreak++;
  land.unsigned += pending.size;
  for (const ix of pending.values()) if (ix >= TONG_RANKS.length - 2) land.fromTop++, land.fromTopLowerOrFree++;
  for (const t of r.tongs) if (t.status === 'active') per[t.habit].tongSeasons += SEASONS;
}
console.log(`seeds ${SEEDS}, seasons ${SEASONS}`);
for (const h of HABIT_IDS) { const p = per[h]; console.log(h.padEnd(9), `tongs/${SEASONS}seasons ${p.tongSeasons / SEASONS}`, `avg roster ${(p.size / Math.max(1, p.sundays)).toFixed(1)}`, `in range ${(100 * p.inRange / Math.max(1, p.sundays)).toFixed(0)}%`, `releases/tong/season ${(p.releases / Math.max(1, p.sundays / 52)).toFixed(2)}`); }
console.log('released names land', land, `from the top two tiers: ${(100 * land.fromTopLowerOrFree / Math.max(1, land.fromTop)).toFixed(0)}% landed lower`);
console.log('offers per season (all seeds avg)', (offers / SEEDS / SEASONS).toFixed(1), 'gaps (weeks:count)', gaps);
console.log('card total', minTotal, 'to', maxTotal, `Sundays with nobody free: ${(100 * emptyPool / sundays).toFixed(1)}%`);

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.log(`E2: selling stories a season (median over seeds x seasons) ${median(sellStarts)}, mean ${(sellTotal / SEEDS / SEASONS).toFixed(2)}; stretched stories ${(stretchedTotal / SEEDS / SEASONS).toFixed(2)} a season; ended broken ${brokenTotal}/${sellTotal} = ${(100 * brokenTotal / Math.max(1, sellTotal)).toFixed(0)}%`);
console.log(`E2: seeds where a Harbour or City house broke ${(100 * seedsBigBreak / SEEDS).toFixed(0)}%; active tongs ${minActive} to ${maxActive}; sales ${(saleOpens / SEEDS / SEASONS).toFixed(2)} a season, names ${saleNames}; houses buying from houses ${(bought / SEEDS / SEASONS).toFixed(2)} a season`);
