// The live battle view's staging (core/fightmap.js, drafts/PROPOSAL-live-battle-view.md 5.1): an engine-2 fight's units
// stand on the site's fight spots, with the cover the rules give them. Staging only: it is deterministic, it never
// changes the fight, and the cover on the map is the rules' cover. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';
import { runFight, fightAnswer, fightStage } from '../src/core/runfight.js';
import { stageSpots, layoutFight, enemyUnit } from '../src/core/fightmap.js';
import { siteRects, BLOCK } from '../src/core/fightspots.js';
import { pickSite, siteHeight } from '../src/data/sites.js';

const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
const S = await import('../src/save/save.js');

const JOBS = ['data_pull', 'data_scrub', 'quiet_hours', 'warehouse', 'protection'];

function atFight(seed, templateId) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(templateId).crewSize).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady' });
  for (let g = 0; g < 400 && !s.activeMission.done; g++) {
    if (s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle') return s;
    const next = autoStep(s, { force: true });
    if (next === s) throw new Error('stuck');
    s = next;
  }
  return null;
}

/** Every round of a fight, as states (call-ins answered as an unwatched crew would). */
function rounds(s) {
  const out = [s];
  for (let g = 0; g < 80 && s.activeMission.battle && !s.activeMission.battle.end && M.currentStep(s.activeMission)?.type === 'battle'; g++) {
    const am = s.activeMission;
    s = am.pending ? M.resolvePending(s, am.pending.kind === 'dilemma' ? fightAnswer(am).id : 'out') : runFight(s);
    if (s.activeMission?.battle) out.push(s);
  }
  return out;
}

const fights = (() => {
  const list = [];
  for (const id of JOBS) for (let seed = 1; seed <= 5; seed++) { const s = atFight(seed, id); if (s?.activeMission.battle?.engine === 2) list.push({ id, seed, s }); }
  return list;
})();

test('an engine-2 fight carries its staging from the start', () => {
  assert.ok(fights.length >= 6, `found ${fights.length} fights`);
  for (const { id, seed, s } of fights) {
    const b = s.activeMission.battle;
    assert.ok(b.spots, `${id} seed ${seed}: spots stored`);
    assert.ok(b.spots.crew.length >= b.runners.length, `${id} seed ${seed}: a spot for every runner`);
    assert.equal(b.spots.entrances.length, 2);
    assert.ok(b.spots.van);
  }
});

test('stageSpots is deterministic and every spot stands clear of the cover', () => {
  for (const district of ['docks', 'heights']) {
    for (const zone of ['in', 'inside', 'target']) {
      const site = pickSite(district, 'job-a', district === 'docks' ? 'warehouse' : 'data_pull');
      const a = stageSpots(site, zone);
      assert.deepEqual(stageSpots(site, zone), a, `${district} ${zone}: same spots twice`);
      const blocks = siteRects(site).filter((r) => BLOCK.has(r.cls));
      for (const x of [...a.crew, ...a.guards]) {
        assert.ok(['open', 'half', 'full'].includes(x.cover));
        assert.ok(x.at[0] >= 0 && x.at[0] <= 360 && x.at[1] >= 0 && x.at[1] <= siteHeight(site), `${district} ${zone}: on the map`);
        assert.ok(!blocks.some((r) => x.at[0] > r.x && x.at[0] < r.x + r.w && x.at[1] > r.y && x.at[1] < r.y + r.h), `${district} ${zone}: not inside cover`);
      }
      for (const p of a.entrances) assert.ok(p[0] >= 0 && p[0] <= 360 && p[1] >= 0 && p[1] <= siteHeight(site));
    }
  }
});

test('half spots are made from the ends of full cover, so the map has more of the rules\' usual cover', () => {
  let derived = 0;
  for (const zone of ['in', 'inside', 'target']) {
    const a = stageSpots(pickSite('docks', 'job-a', 'warehouse'), zone);
    derived += [...a.crew, ...a.guards].filter((x) => x.derived).length;
    for (const x of [...a.crew, ...a.guards].filter((y) => y.derived)) assert.equal(x.cover, 'half');
  }
  assert.ok(derived > 0, 'some half spots derived');
});

test('layoutFight leaves the fight deep-equal and gives the same layout twice', () => {
  for (const { s } of fights.slice(0, 4)) {
    for (const st of rounds(s)) {
      const b = st.activeMission.battle;
      const frozen = structuredClone(b);
      const a = layoutFight(b);
      assert.deepEqual(b, frozen, 'b untouched');
      assert.deepEqual(layoutFight(structuredClone(b)), a, 'same layout from a copy');
    }
  }
});

test('the cover on the map is the rules\' cover, every unit, every round', () => {
  let checked = 0; let marked = 0;
  for (const { id, seed, s } of fights) {
    for (const st of rounds(s)) {
      const b = st.activeMission.battle;
      const { units } = layoutFight(b);
      const onSpot = { crew: new Set(), guards: new Set() };
      for (const r of b.runners) {
        const u = units[r.id];
        assert.ok(u, `${id} ${seed}: runner ${r.id} placed`);
        if (u.stance === 'aboard' || u.stance === 'gone') continue;
        if (u.stance === 'boarding') { assert.equal(u.cover, 'open', 'boarding is in the open'); continue; }
        assert.equal(u.cover, r.cover, `${id} ${seed} round ${b.round}: ${r.handle}'s cover`);
        if (u.spot != null) {
          const shown = u.mark ?? b.spots.crew[u.spot].cover;
          assert.equal(shown, r.cover, `${id} ${seed} round ${b.round}: ${r.handle} stands in ${shown}, the rules say ${r.cover}`);
          assert.ok(!onSpot.crew.has(u.spot), 'one runner a spot'); onSpot.crew.add(u.spot);
        }
        if (u.mark) marked += 1;
        assert.equal(u.stance, r.dead ? 'dead' : r.down ? 'down' : r.hunker ? 'hunker' : 'up');
        checked += 1;
      }
      for (const e of b.enemies) {
        const u = units[enemyUnit(e.n)];
        assert.ok(u, `enemy ${e.n} placed`);
        if (e.fled) { assert.equal(u.stance, 'fled'); continue; }
        if (u.spot != null) {
          assert.equal(u.mark ?? b.spots.guards[u.spot].cover, e.cover, `${id} ${seed}: enemy ${e.n} in ${e.cover}`);
          assert.ok(!onSpot.guards.has(u.spot), 'one enemy a spot'); onSpot.guards.add(u.spot);
        }
        assert.equal(u.stance, e.out ? 'down' : 'up');
        checked += 1;
      }
    }
  }
  assert.ok(checked > 200, `checked ${checked}`);
  assert.ok(marked >= 0);
});

test('a unit keeps its spot while its cover holds', () => {
  for (const { s } of fights.slice(0, 6)) {
    const all = rounds(s);
    for (let i = 1; i < all.length; i++) {
      const b0 = all[i - 1].activeMission.battle; const b1 = all[i].activeMission.battle;
      const l0 = layoutFight(b0).units; const l1 = layoutFight(b1).units;
      const same = (r0, r1) => r0 && r1 && r0.cover === r1.cover && !r0.down && !r1.down && !r0.aboard && !r1.aboard;
      // Nobody's cover changed between the two rounds: everyone stays put.
      if (b0.runners.every((r) => same(r, b1.runners.find((x) => x.id === r.id))) && b0.enemies.length === b1.enemies.length) {
        for (const r of b0.runners) assert.deepEqual(l1[r.id].at, l0[r.id].at, `${r.handle} stays`);
      }
    }
  }
});

test('a fight saved before v63 gets its staging on load, and nothing in the fight moves', async () => {
  const { s } = fights.find((f) => f.id === 'warehouse') ?? fights[0];
  const old = structuredClone(s);
  const spots = old.activeMission.battle.spots;
  delete old.activeMission.battle.spots;
  old.version = 62;
  const loaded = await S.importSave({ text: async () => JSON.stringify(old) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.activeMission.battle.spots, spots, 'the same spots a new fight would get');
  const { spots: _, ...rest } = loaded.activeMission.battle;
  const { spots: __, ...was } = s.activeMission.battle;
  assert.deepEqual(rest, was, 'the rest of the fight as it was');
  // fightStage is the one function both use.
  const am = s.activeMission;
  const start = am.events.find((e) => e.kind === 'battle' && e.phase === 'start');
  assert.deepEqual(fightStage(templateById(am.templateId).district, am, start.zone, am.battle.runners.length), spots);
});
