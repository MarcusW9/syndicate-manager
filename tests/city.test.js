// The City screen's content: every district has a complete card, and the
// locked ones say so (DESIGN.md, 2026-10-25).

import test from 'node:test';
import assert from 'node:assert/strict';
import { NAMES } from '../src/config/names.js';
import { DISTRICT_CARDS, FACTIONS, STREET_FACTS, HISTORY } from '../src/data/city.js';

test('every district, open or locked, has a complete card', () => {
  const keys = [...Object.keys(NAMES.districts), ...Object.keys(NAMES.lockedDistricts)];
  assert.deepEqual(Object.keys(DISTRICT_CARDS).sort(), [...keys].sort());
  for (const key of keys) {
    const c = DISTRICT_CARDS[key];
    for (const field of ['chinese', 'side', 'pitch', 'control', 'police', 'night', 'custom']) assert.ok(c[field], `${key}: ${field}`);
    assert.equal(c.landmarks.length, 3, `${key}: landmarks`);
    assert.equal(Boolean(c.locked), key in NAMES.lockedDistricts, `${key}: locked flag`);
    if (c.locked) assert.ok(c.teaser, `${key}: teaser`);
  }
});

test('factions, street facts and history are filled in', () => {
  for (const f of FACTIONS) for (const field of ['group', 'name', 'where', 'line', 'rumour']) assert.ok(f[field], `${f.name}: ${field}`);
  assert.ok(STREET_FACTS.length >= 5);
  assert.ok(HISTORY.every((h) => h.year && h.text));
});
