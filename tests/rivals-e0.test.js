// E0 (2026-11-14): the Tongs screens redrawn. Read-only: the ladder, come and gone, story pips, the house file and the slate.
// No new rules, no save change: these tests check the views hold the design's promises and the screens render. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { weeklyRivals, rivalView, tongTier } from '../src/core/rivals.js';
import { bookView } from '../src/core/book.js';
import { renderTongs } from '../src/ui/tongs.js';
import { seal, letters } from '../src/ui/seal.js';

const game = (seed = 42) => createNewGame({ seed, startCrew: 'fresh' });
const weeks = (s, n) => { for (let w = 0; w < n; w++) { s.day = 7 * (w + 1); weeklyRivals(s); } return s; };
const NAME_KEYS = new Set(['name', 'names', 'head', 'tong']);
function walk(v, path, visit) {
  if (Array.isArray(v)) v.forEach((x) => walk(x, path, visit));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k, visit);
  else visit(v, path);
}
const noDigits = (obj, label) => walk(obj, '', (v, key) => {
  assert.notEqual(typeof v, 'number', `a number at ${label}.${key}`);
  if (typeof v === 'string' && !NAME_KEYS.has(key)) assert.doesNotMatch(v, /\d/, `digits at ${label}.${key}: ${v}`);
});

test('the ladder holds every active tong once, on the rung tongTier gives, ours on state.rank; no folded tong appears', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const s = weeks(game(seed), 40);
    const { ladder } = rivalView(s);
    assert.equal(ladder.length, 5);
    assert.equal(ladder[0].tier, 'harbour'); assert.equal(ladder[4].tier, 'backroom');
    assert.equal(ladder.filter((r) => r.ours).length, 1);
    assert.equal(ladder.find((r) => r.ours).tier, s.rank);
    const seen = ladder.flatMap((r) => r.tongs.map((t) => t.id));
    const active = s.rivals.tongs.filter((t) => t.status === 'active');
    assert.deepEqual([...seen].sort(), active.map((t) => t.id).sort(), 'every active tong exactly once');
    for (const r of ladder) {
      assert.deepEqual(r.tongs.map((t) => t.name), r.tongs.map((t) => t.name).sort(), 'sorted by name');
      for (const t of r.tongs) assert.equal(tongTier(s.rivals.tongs.find((x) => x.id === t.id)), r.tier);
    }
  }
});

test('the view walk finds no digits in ladder, moves, story, track or table, and the slate view adds none', () => {
  for (let seed = 1; seed <= 15; seed++) {
    const s = weeks(game(seed), 30);
    const v = rivalView(s);
    noDigits(v.ladder, 'ladder'); noDigits(v.moves, 'moves');
    for (const t of v.tiers.flatMap((x) => x.tongs)) { noDigits(t.story, 'story'); noDigits(t.track, 'track'); noDigits(t.table, 'table'); }
    noDigits(bookView(s), 'book');
  }
});

test('moves are this month\'s names, at most six, and never end at a folded tong', () => {
  let sawMove = false; let sawStory = false;
  for (let seed = 1; seed <= 30; seed++) {
    const s = game(seed);
    for (let w = 0; w < 40; w++) {
      s.day = 7 * (w + 1); weeklyRivals(s);
      const v = rivalView(s);
      assert.ok(v.moves.length <= 6);
      for (const m of v.moves) {
        sawMove = true;
        if (m.to) assert.equal(s.rivals.tongs.find((t) => t.id === m.to.id).status, 'active', 'a destination is an active tong');
        assert.ok(m.from || m.to || m.free);
        assert.ok(['let_go', 'signed', 'moved'].includes(m.word));
      }
      for (const t of v.tiers.flatMap((x) => x.tongs)) if (t.story) { sawStory = true; assert.ok(['first', 'second', 'third'].includes(t.story.beat)); assert.ok(['decline', 'founding', 'rise'].includes(t.story.family)); }
    }
  }
  assert.ok(sawMove && sawStory, 'the sample saw movement and a story');
});

test('the view is read-only: building it changes neither the state nor the rng counter', () => {
  const s = weeks(game(3), 30);
  const before = JSON.stringify(s);
  rivalView(s); bookView(s); renderTongs(s, null);
  assert.equal(JSON.stringify(s), before);
});

test('the screens render without error: the list, every tong\'s file, the slate and each filter; a save with no rivals too', () => {
  const s = weeks(game(10), 28);
  const html = renderTongs(s, null);
  assert.match(html, /class="ladder"/);
  assert.doesNotMatch(html, /undefined|NaN|\[object|\{\w+\}/);
  const view = rivalView(s);
  for (const t of view.tiers.flatMap((x) => x.tongs)) {
    const page = renderTongs(s, t.id);
    assert.match(page, /Their story|The table/);
    assert.doesNotMatch(page, /undefined|NaN|\[object|\{\w+\}/);
  }
  const ids = ['all', 'ours', 'free', ...view.tiers.flatMap((x) => x.tongs.map((t) => t.id))];
  for (const f of ids) {
    const page = renderTongs(s, 'book', 'City', f);
    assert.match(page, /band__letter|Nobody on the slate/);
    assert.doesNotMatch(page, /undefined|NaN|\[object|\{\w+\}/);
    assert.doesNotMatch(page.replace(/<[^>]+>/g, ' ').replace(/&#\d+;/g, ''), /\d/, 'no digits on the slate');
  }
  const bare = game(5); bare.rivals = null;
  assert.doesNotThrow(() => renderTongs(bare, null));
  assert.doesNotThrow(() => renderTongs(bare, 'book'));
  assert.doesNotThrow(() => renderTongs(bare, 'nobody'));
});

test('the list shows no digits about rivals', () => {
  for (let seed = 1; seed <= 8; seed++) {
    const text = renderTongs(weeks(game(seed), 30), null).replace(/<[^>]+>/g, ' ').replace(/&#\d+;/g, '');
    // proper names may carry a digit; strip them via the view, then nothing else may
    let t = text; const v = rivalView(weeks(game(seed), 30));
    for (const n of [...v.tiers.flatMap((x) => x.tongs.flatMap((g) => [g.name, g.head, ...g.names.map((x) => x.name)])), ...v.names.map((n) => n.name)]) if (n) t = t.split(n).join(' ');
    assert.doesNotMatch(t, /\d/);
  }
});

test('a seal is two letters in the style colour; ours is solid, a free name dashed', () => {
  assert.equal(letters('Third Mist Society'), 'TM');
  assert.equal(letters('Red Fan'), 'RED'.slice(0, 2));
  assert.match(seal({ name: 'Third Mist Society', style: 'loud' }, 44), /#ff3d5f[\s\S]*TM/);
  assert.match(seal({ ours: true, name: 'Lantern Bay Crew' }, 34), /seal--ours/);
  assert.match(seal('free', 24), /seal--free/);
});

test('no two houses on the ladder share a seal', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const s = weeks(game(seed), 30);
    const html = renderTongs(s, null);
    const labels = [...html.matchAll(/class="rung__seals">(.*?)<\/span><\/div>/gs)].length;
    assert.ok(labels > 0);
    const marks = [...html.split('class="ladder"')[1].split('<h2')[0].matchAll(/aria-label="([^"]+)">([A-Z]{1,3})<\/span>/g)].map((m) => m[2]);
    assert.equal(new Set(marks).size, marks.length, `duplicate seal in seed ${seed}: ${marks}`);
  }
});
