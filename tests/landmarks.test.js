// The landmarks off the map (2026-11-05): each district's landmark, drawn like the portraits, on the
// halls (Crew › Halls) and the raid screens (Out now, the warning, the call); never on the City map.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { landmark } from '../src/ui/landmarks.js';
import { HALL_SITES } from '../src/data/halls.js';
import { MAP_DISTRICTS } from '../src/ui/citymap.js';

test('every district has a landmark, drawn the same every time and placed where asked', () => {
  for (const k of MAP_DISTRICTS) {
    const a = landmark(k, { x: 24, y: 44, size: 48, light: '#b48cff' });
    assert.match(a, /^<g class="cm-landmark /, k);
    assert.match(a, /transform="translate\(0 0\) scale\(1\)"/, `${k}: 48 wide, standing on (24, 44)`);
    assert.equal(landmark(k, { x: 24, y: 44, size: 48, light: '#b48cff' }), a, `${k}: the same each time`);
  }
  assert.equal(landmark('nowhere', { x: 0, y: 0 }), '');
  for (const d of Object.keys(HALL_SITES)) assert.ok(landmark(d, { x: 0, y: 0 }), `${d}: a hall's district has one`);
});

test('the halls and the raid screens show the hall\'s landmark; the map does not', () => {
  const app = readFileSync(new URL('../src/ui/app.js', import.meta.url), 'utf8');
  const body = (name) => app.slice(app.indexOf(`function ${name}(`), app.indexOf('\n}\n', app.indexOf(`function ${name}(`)));
  assert.match(body('renderHalls'), /hallMark\(h\.district/, 'each hall of ours');
  assert.match(body('renderHalls'), /hallMark\(d, \{ dim: true \}\)/, 'a hall not yet opened, dim');
  assert.match(body('renderRaids'), /hallMark\(r\.district/, 'the raid in Out now');
  assert.match(body('renderRaidWarning'), /raidWhere\(raid\)/, 'the warning');
  assert.match(body('renderRaidCall'), /raidWhere\(raid\)/, 'the call at the door');
  const map = readFileSync(new URL('../src/ui/citymap.js', import.meta.url), 'utf8');
  assert.doesNotMatch(map, /from '\.\/landmarks\.js'/, 'kept off the map');
});
