// Traits as chips on a runner's page (2026-11-03): every trait, born or earned, names an icon
// that exists, and Crew Anchor reads as Synergy wherever the player sees it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRAITS } from '../src/data/traits.js';
import { EARNED_TRAITS } from '../src/data/earnedTraits.js';
import { traitGlyph } from '../src/ui/icons.js';

const fallback = traitGlyph('no-such-icon');

test('every trait has its own icon', () => {
  for (const [id, t] of [...Object.entries(TRAITS), ...Object.entries(EARNED_TRAITS)]) {
    assert.ok(t.icon, `${id} has an icon`);
    if (t.icon !== 'star') assert.notEqual(traitGlyph(t.icon), fallback, `${id}'s icon "${t.icon}" exists in ui/icons.js`);
  }
});

test('Crew Anchor is shown as Synergy', () => {
  assert.equal(EARNED_TRAITS.crew_anchor.name, 'Synergy');
});
