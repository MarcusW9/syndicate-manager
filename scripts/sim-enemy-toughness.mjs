// Enemy toughness, step A0 (2026-11-18): the equip-the-stash step. The same crews fight threat 1-5 at damage 2 (bare hands),
// 4 and 6, with a plain vest (armour 1 = 1 plate) or a pro vest (2 plates). Levers can be tried with env vars:
//   HPMULT=1.5 (enemy HP x), PLATES=1 (add plates to every enemy), EHIT=+5 (enemy hit size added)
//   node scripts/sim-enemy-toughness.mjs [crews=20] [runs=40]
import { createNewGame } from '../src/core/state.js';
import * as Fight from '../src/core/fight.js';
import { FIGHT_JOBS, ENEMIES, ENEMY_HIT } from '../src/data/fights.js';
import { makeRng } from '../src/core/rng.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const CREWS = Number(process.argv[2] ?? 20);
const RUNS = Number(process.argv[3] ?? 40);
if (process.env.HPMULT) for (const e of Object.values(ENEMIES)) e.hp = Math.round(e.hp * Number(process.env.HPMULT));
if (process.env.PLATES) for (const e of Object.values(ENEMIES)) e.absorb = (e.absorb ?? 0) + Number(process.env.PLATES);
if (process.env.EHIT) for (const k of Object.keys(ENEMY_HIT)) ENEMY_HIT[k] += Number(process.env.EHIT);
const base = createNewGame({ seed: 1 }).crew;
function crewOf(seed, size) {
  const r = makeRng(seed);
  const span = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  return Array.from({ length: size }, (_, i) => {
    const op = structuredClone(base[i % base.length]);
    op.id = `sim${seed}-${i}`; op.handle = `R${i}`;
    op.role = i === 0 ? 'tech' : i === 1 ? 'medic' : 'fighter';
    for (const [st, lo, hi] of [['combat', 11, 16], ['cool', 6, 14], ['tech', i === 0 ? 11 : 8, 14], ['medical', i === 1 ? 11 : 6, 14]]) op.stats[st] = span(lo, hi);
    return op;
  });
}
const rows = [];
for (const threat of [1, 2, 3, 4, 5]) for (const dmg of [2, 4, 6]) for (const plates of [1, 2]) for (const risk of ['committed']) {
  const acc = { n: 0, win: 0, down: 0, dead: 0, rounds: 0, hp: 0, left: 0 };
  for (let c = 0; c < CREWS; c++) {
    const crew = crewOf(9000 + c, 4 + (c % 3));
    for (let i = 0; i < RUNS; i++) {
      const b0 = Fight.buildFight({ type: FIGHT_JOBS.warehouse, diff: 12, threat, site: 'docks', crew, approach: 'loud', risk }, makeRng(0xabc + c * 131 + i));
      for (const r of b0.runners) { r.hit = Fight.hitOf(dmg); r.absorb = plates; }
      const b = Fight.playFight(structuredClone(b0), makeRng(0x5eed + i * 7919));
      acc.n += 1; acc.rounds += b.round; acc.hp += b.hpLost; acc.left += b.enemies.filter((e) => !e.out && !e.fled).length;
      if (b.end?.result === 'won') acc.win += 1;
      if (b.runners.some((r) => r.down || r.dead)) acc.down += 1;
      if (b.runners.some((r) => r.dead)) acc.dead += 1;
    }
  }
  const P = (x) => `${(100 * x / acc.n).toFixed(0)}%`;
  rows.push(`| ${threat} | ${dmg} (hit ${Fight.hitOf(dmg)}) | ${plates} | ${risk} | ${P(acc.win)} | ${P(acc.down)} | ${P(acc.dead)} | ${(acc.rounds / acc.n).toFixed(1)} | ${(acc.hp / acc.n).toFixed(0)} | ${(acc.left / acc.n).toFixed(1)} |`);
}
console.log('| threat | damage | plates | risk | win | someone down | someone dead | rounds | HP lost | enemies still up at end |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
console.log(rows.join('\n'));
