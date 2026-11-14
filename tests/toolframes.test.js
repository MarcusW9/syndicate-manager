// Drone and deck frames (2026-11-06, the owner's pick of drafts/prototypes/drone-deck-options.html):
// the quad is the usual drone, the kite and the ducted fan rarer; decks vary evenly. Each item
// rolls its frame once; items from before frames get one fixed by their uid.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { buyGear } from '../src/core/gear.js';
import { toolFrameOf, lookText } from '../src/core/looks.js';
import { TOOL_FRAMES } from '../src/data/gearLooks.js';
import { gearArt, hasGearArt } from '../src/ui/art.js';

const shares = (type, n = 600) => {
  let s = createNewGame({ seed: 3, startCrew: 'fresh' });
  s.cash = 1e9;
  for (let i = 0; i < n; i++) s = buyGear(s, type);
  const count = {};
  for (const it of s.stash.filter((x) => x.type === type)) count[it.look.frame] = (count[it.look.frame] ?? 0) + 1;
  return Object.fromEntries(Object.entries(count).map(([k, v]) => [k, v / n]));
};

test('drones: mostly quads, kites and ducted fans now and then', () => {
  const d = shares('drone');
  assert.ok(d.quad > 0.7 && d.quad < 0.9, `quad ${d.quad}`);
  for (const f of ['kite', 'duct']) assert.ok(d[f] > 0.04 && d[f] < 0.17, `${f} ${d[f]}`);
});

test('the rest of the armoury: a usual build and rarer ones; implants evenly', () => {
  const cores = { vest: 'carrier', medkit: 'bag', picks: 'roll' };
  for (const [type, core] of Object.entries(cores)) {
    const d = shares(type, 400);
    assert.ok(d[core] > 0.55 && d[core] < 0.85, `${type} ${core} ${d[core]}`);
    for (const f of Object.keys(TOOL_FRAMES[type]).filter((f) => f !== core)) assert.ok(d[f] > 0.03 && d[f] < 0.2, `${type} ${f} ${d[f]}`);
  }
  for (const type of ['reflex', 'cortex']) for (const [f, v] of Object.entries(shares(type, 400))) assert.ok(v > 0.38 && v < 0.62, `${type} ${f} ${v}`);
});

test('compact gear is drawn square, long gear wide', () => {
  for (const type of ['vest', 'medkit', 'picks', 'reflex', 'cortex']) assert.match(gearArt({ uid: 'g1', type, tier: 'standard' }), /viewBox="0 0 64 64"/, type);
  for (const type of ['rifle', 'drone', 'deck']) assert.match(gearArt({ uid: 'g1', type, tier: 'standard' }), /viewBox="0 0 96 32"/, type);
});

test('decks: slab, case and brick about evenly', () => {
  const d = shares('deck');
  for (const f of Object.keys(TOOL_FRAMES.deck)) assert.ok(d[f] > 0.25 && d[f] < 0.42, `${f} ${d[f]}`);
});

test('the frame is kept, and an item from before frames gets a fixed one', () => {
  let s = createNewGame({ seed: 3, startCrew: 'fresh' });
  s.cash = 1e6;
  s = buyGear(s, 'deck');
  const item = s.stash.at(-1);
  assert.equal(toolFrameOf(item), item.look.frame);
  const old = { uid: 'g42', type: 'drone', tier: 'standard' };
  assert.equal(toolFrameOf(old), toolFrameOf({ ...old }), 'same uid, same frame');
  assert.ok(TOOL_FRAMES.drone[toolFrameOf(old)]);
  assert.equal(toolFrameOf({ type: 'drone' }), 'quad', 'a catalogue row shows the usual one');
  assert.match(lookText({ type: 'drone', look: { frame: 'kite' } }), /^Flying-wing kite$/);
});

test('each frame has its own drawing', () => {
  assert.ok(hasGearArt('drone') && hasGearArt('deck'));
  for (const [type, frames] of Object.entries(TOOL_FRAMES)) {
    const drawn = Object.keys(frames).map((frame) => gearArt({ uid: 'g1', type, tier: 'standard', look: { frame } }).replace(/ga\d+/g, ''));
    assert.equal(new Set(drawn).size, drawn.length, `${type}: every frame different`);
  }
});
