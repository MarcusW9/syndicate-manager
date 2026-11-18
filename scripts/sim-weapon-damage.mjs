// Weapon damage as the game hands it out (2026-11-18, step 0 of drafts/PROPOSAL-gear-hit-size.md). No rules change.
//   node scripts/sim-weapon-damage.mjs [perTier=4000]
// DECLARED BEFORE THE RUN: makes sidearms at each tier with the game's own makeItem (frame, quirk, tier step, perks),
// puts each on a bare runner and reads core/battle.js weaponOf, the damage engine 2 reads. Also: an unarmed runner,
// the job-drop mix (LOOT.chance, tier odds, the pistol's share of each pool), and the two Apex sidearms.
// Measures: the share of sidearms at each damage, by tier, and of a drop; what each would hit for under the proposal
// (10 + 3 x max(0, damage - 2)); how much damage engine 2 throws away today (above 5).
// No sim plays a long game that buys and equips gear, so this is what a crew CAN hold, not what one does hold.
import { createNewGame } from '../src/core/state.js';
import { makeItem, makeApex } from '../src/core/gear.js';
import { weaponOf } from '../src/core/battle.js';
import { TIERS, LOOT } from '../src/data/gear.js';
import { APEX_GEAR } from '../src/data/apexGear.js';

const per = Number(process.argv[2] ?? 4000);
const hitOf = (d) => 10 + 3 * Math.max(0, d - 2); // core/fight.js hitOf (from damage 2 since the owner's call, 2026-11-18)
const runnerWith = (item) => ({ gear: item ? { weapon: item } : {} });
const pct = (n, of) => `${Math.round((100 * n) / of)}%`;

function tally(tier) {
  const counts = {};
  for (let i = 0; i < per; i++) {
    const s = createNewGame({ seed: 7000 + i, startCrew: 'fresh' });
    const d = weaponOf(runnerWith(makeItem(s, 'pistol', tier))).damage;
    counts[d] = (counts[d] ?? 0) + 1;
  }
  return counts;
}

const tiers = Object.keys(TIERS).filter((t) => t !== 'apex');
const byTier = Object.fromEntries(tiers.map((t) => [t, tally(t)]));
const damages = [...new Set(Object.values(byTier).flatMap((c) => Object.keys(c).map(Number)))].sort((a, b) => a - b);

console.log(`Sidearm damage by tier (${per} each). Unarmed: damage ${weaponOf(runnerWith(null)).damage}.\n`);
console.log(`| tier | ${damages.map((d) => `dmg ${d} (hit ${hitOf(d)})`).join(' | ')} | above 5 (wasted before hit size) |`);
console.log(`| --- | ${damages.map(() => '---').join(' | ')} | --- |`);
for (const t of tiers) {
  const c = byTier[t];
  const over = Object.entries(c).filter(([d]) => Number(d) > 5).reduce((n, [, k]) => n + k, 0);
  console.log(`| ${t} | ${damages.map((d) => pct(c[d] ?? 0, per)).join(' | ')} | ${pct(over, per)} |`);
}

// A dropped sidearm: the tier odds (Apex aside: two named pieces, once each per save).
const dropOdds = Object.fromEntries(tiers.map((t) => [t, TIERS[t].drop ?? 0]));
dropOdds.standard = 100 - Object.entries(dropOdds).filter(([t]) => t !== 'standard').reduce((n, [, v]) => n + v, 0) - (TIERS.apex.drop ?? 0);
const mix = {};
for (const t of tiers) for (const [d, k] of Object.entries(byTier[t])) mix[d] = (mix[d] ?? 0) + (k / per) * (dropOdds[t] / 100);
const pistolShare = LOOT.pool.standard.pistol / Object.values(LOOT.pool.standard).reduce((n, w) => n + w, 0);
console.log(`\nA job's drop: ${pct(LOOT.chance, 1)} of jobs drop gear, ${pct(pistolShare, 1)} of drops are sidearms, so about one job in ${Math.round(1 / (LOOT.chance * pistolShare))} drops one.`);
const perJob = LOOT.chance * pistolShare + (1 - LOOT.chance) * (LOOT.spareChance ?? 0);
console.log(`With the spare piece (a Standard sidearm instead of scrap, ${pct(LOOT.spareChance ?? 0, 1)} of misses): about one job in ${(1 / perJob).toFixed(1)} gives a sidearm.`);
console.log(`A dropped sidearm by damage: ${damages.map((d) => `${d}: ${pct(mix[d] ?? 0, 1)}`).join(', ')}.`);

const s = createNewGame({ seed: 1, startCrew: 'fresh' });
for (const [id, a] of Object.entries(APEX_GEAR).filter(([, a]) => a.type === 'pistol')) {
  const d = weaponOf(runnerWith(makeApex(s, id))).damage;
  console.log(`Apex ${a.name}: damage ${d} (hit ${hitOf(d)}).`);
}

// The starting crews' weapons.
const start = {};
for (let i = 0; i < 200; i++) for (const op of createNewGame({ seed: 9000 + i, startCrew: 'fresh' }).crew) {
  const d = weaponOf(op).damage; start[d] = (start[d] ?? 0) + 1;
}
const n = Object.values(start).reduce((a, b) => a + b, 0);
console.log(`Starting crews (200 games): ${Object.keys(start).sort().map((d) => `dmg ${d}: ${pct(start[d], n)}`).join(', ')}.`);
