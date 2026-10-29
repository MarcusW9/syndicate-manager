// Portraits: drawn from stable features, so a face never changes, and the wall shows
// the same face the crew knew. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { faceOf, portrait, cultureOf, stateOf } from '../src/ui/art.js';

const crew = () => createNewGame({ seed: 50, startCrew: 'fresh' }).crew;
const withoutIds = (svg) => svg.replace(/pf\d+/g, 'pf');

test('a face never changes between renders or games', () => {
  const [a] = crew();
  const [b] = crew();
  assert.deepEqual(faceOf(a), faceOf(b));
  assert.equal(withoutIds(portrait(a)), withoutIds(portrait(b)));
});

test('the wall shows the face they had in life', () => {
  for (const op of crew()) {
    op.age = 52; // old enough for grey hair to be possible
    const entry = { id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, age: op.age, day: 9, cause: 'Died of wounds' };
    assert.deepEqual(faceOf(entry), faceOf(op));
  }
});

test('culture comes from the surname, including two-word surnames', () => {
  assert.equal(cultureOf('Paolo dela Cruz'), 'filipino');
  assert.equal(cultureOf('Kelvin Chan'), 'hk');
  assert.equal(cultureOf('Nobody'), null);
});

test('a v13 save upgrades to v14', async () => {
  globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const { importSave } = await import('../src/save/save.js');
  const v13 = createNewGame({ seed: 51 });
  v13.version = 13;
  v13.memorial = [{ id: 'x', name: 'Old Hand', handle: 'Old', role: 'driver', day: 3, cause: 'Died of wounds' }];
  const loaded = await importSave({ text: async () => JSON.stringify(v13) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.ok(portrait(loaded.memorial[0]).startsWith('<svg'), 'an entry without age still draws');
});

test('expressions follow condition, never chance', () => {
  const op = crew()[0];
  const at = (c) => stateOf({ ...op, condition: { ...op.condition, ...c } }).expression;
  assert.equal(at({ morale: 65, neuralLoad: 0, burnout: 0 }), 'neutral');
  assert.equal(at({ morale: 85 }), 'smirk');
  assert.equal(at({ morale: 25 }), 'stressed');
  assert.equal(at({ neuralLoad: 71 }), 'dead', "neural load's danger zone, as the game warns");
  assert.equal(at({ neuralLoad: 70, morale: 65 }), 'neutral');
  assert.equal(at({ burnout: 60, morale: 85 }), 'dead', 'burnout wins over a good mood');
});

test('a visor never hides a cyber-eye lens', () => {
  for (let seed = 1; seed < 200; seed++) {
    for (const op of createNewGame({ seed, startCrew: 'fresh' }).crew) {
      const f = faceOf(op);
      assert.ok(!(f.visor && f.chrome === 'cybereye'));
    }
  }
});

// Gear added 2026-10-25 (masks, conical hats, half-chrome faces, monks, facial hair).
const sample = (n = 4000) => Array.from({ length: n }, (_, i) => {
  const name = ['Kelvin Chan', 'Ivy Wong', 'Arjun Singh', 'Amara Mensah', 'Joy Santos', 'Lena Novak'][i % 6];
  return { op: { id: `g${i}`, name, age: 20 + (i % 40) }, f: faceOf({ id: `g${i}`, name, age: 20 + (i % 40) }) };
});

test('every new look turns up, and the rules between them hold', () => {
  const seen = new Set();
  for (const { f } of sample()) {
    for (const k of ['headwear', 'mask', 'monk', 'facialHair']) if (f[k]) seen.add(`${k}:${f[k]}`);
    if (f.halfFace) seen.add('halfFace');
    if (f.monk) {
      assert.equal(f.hair, 'bald', 'monks shave their heads');
      assert.ok(!f.earring && !f.facialHair && !f.splitDye);
      assert.ok(f.headwear === null || f.headwear === 'douli', 'a monk only wears the woven hat');
      if (f.monk === 'shaolin') assert.ok(!f.headwear && !f.mask && !f.glasses && !f.visor && !f.halfFace, 'a Shaolin monk shows the whole face');
    }
    if (f.halfFace) assert.ok(f.chrome === 'half' && !f.visor && !f.glasses, 'the half-chrome face is the chrome');
    if (['goggles', 'faceplate'].includes(f.mask)) assert.ok(!f.visor && !f.glasses, 'a full mask replaces glasses and visors');
  }
  for (const k of ['headwear:jingasa', 'headwear:neonhat', 'headwear:douli', 'mask:respirator', 'mask:jawplate', 'mask:grille', 'mask:goggles', 'mask:faceplate', 'halfFace',
    'monk:grey', 'monk:ochre', 'monk:cyber', 'monk:shaolin', 'facialHair:pencil', 'facialHair:goatee', 'facialHair:droop', 'facialHair:soul', 'facialHair:beard']) {
    assert.ok(seen.has(k), `${k} never appears`);
  }
});

test('monks lean Hong Kong but anyone can be one', () => {
  const s = sample(12000);
  const rate = (pick) => { const xs = s.filter(pick); return xs.filter(({ f }) => f.monk).length / xs.length; };
  const hk = rate(({ op }) => cultureOf(op.name) === 'hk');
  const other = rate(({ op }) => cultureOf(op.name) !== 'hk');
  assert.ok(hk > other * 2, `hk ${hk} vs others ${other}`);
  assert.ok(other > 0, 'other cultures can be monks too');
});

test("an LED mask grille shows the mood the mouth would have", () => {
  const { op } = sample().find(({ f }) => f.mask === 'grille');
  const at = (c) => withoutIds(portrait({ ...op, condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', ...c } }));
  assert.notEqual(at({ morale: 20 }), at({}), 'stressed differs from neutral');
  assert.notEqual(at({ morale: 90 }), at({}), 'smirk differs from neutral');
});

test('a faceplate shows harm as a crack, and its eyes glow with neural load', () => {
  const { op } = sample().find(({ f }) => f.mask === 'faceplate');
  const at = (c) => withoutIds(portrait({ ...op, condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', ...c } }));
  assert.notEqual(at({ injury: 'serious' }), at({}), 'hurt differs from healthy');
  assert.notEqual(at({ neuralLoad: 85 }), at({}), 'load shows in the eye slits');
});

// --- gear on portraits and as items (2026-10-28) ----------------------------------------------
import { gearArt, hasGearArt, lightOf } from '../src/ui/art.js';

test('a rifle carried shows on the portrait, the same every time; nothing else changes the face', () => {
  const op = { id: 'g7', name: 'Mei Chan', age: 24, condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy' } };
  const bare = withoutIds(portrait(op));
  const empty = { weapon: null, armour: null, tool: null, implant: null };
  assert.equal(withoutIds(portrait({ ...op, gear: empty })), bare, 'an empty loadout draws the same face');
  assert.equal(withoutIds(portrait({ ...op, gear: { ...empty, weapon: { uid: 'x', type: 'pistol', tier: 'street' } } })), bare, 'gear without a drawing shows nothing yet');
  const armed = { ...op, gear: { ...empty, weapon: { uid: 'x', type: 'rifle', tier: 'street' } } };
  const withRifle = withoutIds(portrait(armed));
  assert.ok(withRifle.includes('gear-rifle') && !bare.includes('gear-rifle'));
  assert.equal(withoutIds(portrait(armed)), withRifle, 'stable');
  const pro = withoutIds(portrait({ ...op, gear: { ...empty, weapon: { uid: 'x', type: 'rifle', tier: 'pro' } } }));
  assert.notEqual(pro, withRifle, 'a pro rifle looks different');
});

test('item drawings: the rifle has one, lit by whoever carries it; others fall back to icons', () => {
  assert.ok(hasGearArt('rifle'));
  assert.equal(gearArt({ type: 'drone', tier: 'street' }), null);
  const op = { id: 'g9', name: 'Kit Lau' };
  const stash = gearArt({ type: 'rifle', tier: 'street' });
  const carried = gearArt({ type: 'rifle', tier: 'street' }, { carrier: op });
  assert.ok(stash.startsWith('<svg') && stash.includes('aria-hidden="true"'));
  assert.ok(carried.includes(lightOf(op)), 'their own city light');
});

test('anatomy: a face is fixed per person, varies between people, and is on in the game', async () => {
  const { anatomyOf } = await import('../src/ui/art.js');
  const op = { id: 'op_anat', name: 'Kelvin Chan', age: 30 };
  assert.deepEqual(anatomyOf(op), anatomyOf({ ...op }), 'same person, same face');
  const shapes = new Set(Array.from({ length: 40 }, (_, i) => anatomyOf({ id: `p${i}`, name: 'Kelvin Chan' }).eyeW.toFixed(2)));
  assert.ok(shapes.size > 20, 'eyes differ between people');
  assert.equal(withoutIds(portrait(op)), withoutIds(portrait(op, { anatomy: true })), 'the game draws the anatomy face');
  assert.notEqual(withoutIds(portrait(op)), withoutIds(portrait(op, { anatomy: false })), 'which differs from the earlier shared face');
  assert.equal(withoutIds(portrait(op)), withoutIds(portrait({ ...op })), 'and is drawn the same every time');
});

test('Shaolin monks lean East and Southeast Asian, anyone can be one, and the earlier looks never moved', () => {
  const s = sample(24000);
  const rate = (pick) => { const xs = s.filter(pick); return xs.filter(({ f }) => f.monk === 'shaolin').length / xs.length; };
  const asian = rate(({ op }) => ['hk', 'southeast_asian'].includes(cultureOf(op.name)));
  const other = rate(({ op }) => !['hk', 'southeast_asian'].includes(cultureOf(op.name)));
  assert.ok(asian > other * 4, `asian ${asian} vs others ${other}`);
  assert.ok(other > 0, 'other cultures can be Shaolin monks too');
  // The pick comes last on the gear seed: anyone who was already a monk keeps their robe.
  for (const { f } of s) if (f.monk && f.monk !== 'shaolin') assert.ok(['grey', 'ochre', 'cyber'].includes(f.monk));
});

test('rifle looks: a look draws from the kit, the same every time; items without one are unchanged', async () => {
  const { gearArt, RIFLE_FRAMES, RIFLE_FINISHES } = await import('../src/ui/art.js');
  const { RIFLE_LOOKS } = await import('../src/data/gearLooks.js');
  const { engravings: RIFLE_ENGRAVINGS, charms: RIFLE_CHARMS } = RIFLE_LOOKS;
  // The data names every part the art can draw, and the art draws every part the data names.
  for (const k of ['frames', 'finishes']) assert.deepEqual(Object.keys(RIFLE_LOOKS[k]).sort(), Object.keys({ frames: RIFLE_FRAMES, finishes: RIFLE_FINISHES }[k]).sort(), k);
  const clean = (svg) => svg.replace(/(ga|rb)\d+/g, 'x');
  const plain = { uid: 'r1', type: 'rifle', tier: 'street' };
  assert.equal(clean(gearArt(plain)), clean(gearArt({ ...plain, look: undefined })), 'no look, the original drawing');
  for (const frame of Object.keys(RIFLE_FRAMES)) for (const finish of Object.keys(RIFLE_FINISHES)) {
    for (const [engraving, charm] of [[null, null], ...Object.keys(RIFLE_ENGRAVINGS).map((e, i) => [e, Object.keys(RIFLE_CHARMS)[i]]), [null, 'hazard'], [null, 'sticker'], [null, 'mahjong'], [null, 'mala']]) {
      const item = { ...plain, look: { frame, finish, engraving, charm } };
      const svg = gearArt(item);
      assert.ok(svg.startsWith('<svg') && !svg.includes('undefined') && !svg.includes('NaN'), `${frame}/${finish}/${engraving}/${charm} draws`);
      assert.equal(clean(svg), clean(gearArt(item)), 'and draws the same every time');
    }
  }
});

test('sidearm looks (draft): every frame, finish, mod and charm draws, the same every time; plain sidearms are unchanged', async () => {
  const { gearArt, portrait, SIDEARM_FRAMES, SIDEARM_FINISHES } = await import('../src/ui/art.js');
  const { SIDEARM_LOOKS } = await import('../src/data/gearLooks.js');
  const clean = (svg) => svg.replace(/(ga|sb|pf)\d+/g, 'x');
  for (const k of ['frames', 'finishes']) assert.deepEqual(Object.keys(SIDEARM_LOOKS[k]).sort(), Object.keys({ frames: SIDEARM_FRAMES, finishes: SIDEARM_FINISHES }[k]).sort(), k);
  assert.equal(gearArt({ uid: 'p', type: 'pistol', tier: 'street' }), null, 'a sidearm without a look has no drawing yet');
  const mods = [null, ...Object.keys(SIDEARM_LOOKS.mods)], charms = [null, ...Object.keys(SIDEARM_LOOKS.charms)];
  for (const frame of Object.keys(SIDEARM_FRAMES)) for (const finish of Object.keys(SIDEARM_FINISHES)) {
    for (let i = 0; i < charms.length; i++) {
      const item = { uid: 'p', type: 'pistol', tier: 'street', look: { frame, finish, mod: mods[i % mods.length], charm: charms[i] } };
      const svg = gearArt(item);
      assert.ok(svg.startsWith('<svg') && !svg.includes('undefined') && !svg.includes('NaN'), `${JSON.stringify(item.look)} draws`);
      assert.equal(clean(svg), clean(gearArt(item)));
    }
  }
  const { GLOW_COLOURS } = await import('../src/ui/art.js');
  assert.deepEqual(Object.keys(SIDEARM_LOOKS.glows).sort(), Object.keys(GLOW_COLOURS).sort(), 'the data names every glow the art draws');
  const lit = (glow) => gearArt({ uid: 'p', type: 'pistol', tier: 'street', look: { frame: 'smart', finish: 'synth', glow } });
  for (const [g, hex] of Object.entries(GLOW_COLOURS)) assert.ok(lit(g).includes(hex), `${g} glows ${hex}`);
  assert.equal(clean(lit(undefined)), clean(gearArt({ uid: 'p', type: 'pistol', tier: 'street', look: { frame: 'smart', finish: 'synth' } })), 'no glow: the carrier decides');
  const op = { ...createNewGame({ seed: 3 }).crew[0], gear: {} };
  const holstered = { ...op, gear: { weapon: { uid: 'p', type: 'pistol', tier: 'street', look: { frame: 'compact', finish: 'neon' } } } };
  assert.notEqual(clean(portrait(holstered)), clean(portrait(op)), 'a sidearm with a look shows in a chest holster');
  assert.equal(clean(portrait({ ...op, gear: { weapon: { uid: 'p', type: 'pistol', tier: 'street' } } })), clean(portrait(op)), 'a plain one still shows nothing');
});
