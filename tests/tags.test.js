// Tags, tiers and the tiered pick. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { TAGS, CLASHES, TRAIT_TAGS, ROLE_TAGS, TIER_ODDS } from '../src/data/tags.js';
import { TRAITS } from '../src/data/traits.js';
import { ROLE_PROFILES } from '../src/data/recruitPools.js';
import { pickTiered } from '../src/core/tiered.js';
import { makeRng } from '../src/core/rng.js';

// Every { tags } entry reachable from a module's exports.
function collectTagged(value, out = []) {
  if (Array.isArray(value)) value.forEach((v) => collectTagged(v, out));
  else if (value && typeof value === 'object') {
    if (Array.isArray(value.tags)) out.push(value);
    Object.values(value).forEach((v) => collectTagged(v, out));
  }
  return out;
}

async function taggedIn(dir) {
  const files = readdirSync(new URL(dir, import.meta.url)).filter((f) => f.endsWith('.js'));
  const mods = await Promise.all(files.map((f) => import(new URL(dir + f, import.meta.url))));
  return mods.flatMap((m) => collectTagged(m));
}

test('every tag used in data (and drafts) is on the list', async () => {
  const items = [...await taggedIn('../src/data/'), ...await taggedIn('../drafts/')];
  for (const it of items) for (const t of it.tags) assert.ok(TAGS.includes(t), `unknown tag "${t}" on ${it.text ?? JSON.stringify(it)}`);
  for (const t of [...CLASHES.flat(), ...Object.values(TRAIT_TAGS).flat(), ...Object.values(ROLE_TAGS).flat()]) assert.ok(TAGS.includes(t), t);
});

test('tiered lines use a known tier', async () => {
  for (const it of [...await taggedIn('../src/data/'), ...await taggedIn('../drafts/')]) assert.ok(it.tier in TIER_ODDS, `tier "${it.tier}" on ${it.text}`);
});

test('every trait and role in the maps exists', () => {
  for (const id of Object.keys(TRAIT_TAGS)) assert.ok(TRAITS[id], id);
  for (const role of Object.keys(ROLE_TAGS)) assert.ok(ROLE_PROFILES[role], role);
});

test('tier odds add up to 100%', () => {
  assert.equal(Object.values(TIER_ODDS).reduce((a, b) => a + b, 0), 100);
});

const lines = (tier, n, tags = []) => Array.from({ length: n }, (_, i) => ({ text: `${tier} ${i}`, tier, tags }));
const pool = [...lines('common', 10), ...lines('uncommon', 6), ...lines('rare', 3), ...lines('exotic', 1)];

function tierShares(items, n = 10000, seed = 7) {
  const rng = makeRng(seed);
  const counts = {};
  for (let i = 0; i < n; i++) { const t = pickTiered(rng, items).tier; counts[t] = (counts[t] ?? 0) + 1; }
  return Object.fromEntries(Object.keys(TIER_ODDS).map((t) => [t, (100 * (counts[t] ?? 0)) / n]));
}

test('over 10,000 picks each tier lands within ±2 points of its odds', () => {
  const shares = tierShares(pool);
  for (const [tier, odds] of Object.entries(TIER_ODDS)) assert.ok(Math.abs(shares[tier] - odds) <= 2, `${tier} ${shares[tier]}% vs ${odds}%`);
});

test('adding 50 common lines does not change the rare/exotic rate', () => {
  const before = tierShares(pool);
  const after = tierShares([...pool, ...lines('common', 50)]);
  for (const tier of ['rare', 'exotic']) assert.ok(Math.abs(after[tier] - before[tier]) <= 1, `${tier} ${before[tier]}% -> ${after[tier]}%`);
});

test('an empty tier falls back to the next tier down', () => {
  const rng = makeRng(3);
  const noExotic = [...lines('common', 3), ...lines('rare', 2)];
  const counts = {};
  for (let i = 0; i < 10000; i++) { const t = pickTiered(rng, noExotic).tier; counts[t] = (counts[t] ?? 0) + 1; }
  assert.equal(counts.uncommon, undefined);
  // rare 10% + exotic 2% fall to rare; uncommon 28% falls to common.
  assert.ok(Math.abs(counts.rare / 100 - 12) <= 2, `rare ${counts.rare / 100}%`);
  const onlyRare = lines('rare', 2);
  for (let i = 0; i < 200; i++) assert.equal(pickTiered(rng, onlyRare).tier, 'rare');
  assert.equal(pickTiered(rng, []), undefined);
});

test('steering is ×3 within a tier and never changes tier odds', () => {
  const steered = [...lines('common', 9), { text: 'match', tier: 'common', tags: ['chrome'] }, ...lines('rare', 3)];
  const rng = makeRng(11);
  let match = 0, rare = 0;
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const it = pickTiered(rng, steered, ['chrome']);
    if (it.text === 'match') match++;
    if (it.tier === 'rare') rare++;
  }
  // No uncommon or exotic here, so common gets 88% and rare 12%. Within common the match gets 3 of 12 weight.
  const commonPicks = n - rare;
  assert.ok(Math.abs(match / commonPicks - 3 / 12) < 0.02, `match share ${match / commonPicks}`);
  assert.ok(Math.abs((100 * rare) / n - 12) <= 2, `rare ${(100 * rare) / n}%`);
});

test('every role has backstories, each with 1-2 tags, no clashing pair, and a common one', async () => {
  const { ORIGINS } = await import('../src/data/recruitPools.js');
  for (const role of Object.keys(ROLE_PROFILES)) {
    const lines = ORIGINS[role];
    assert.ok(lines?.some((o) => o.tier === 'common'), `${role} has a common backstory`);
    for (const o of lines) {
      assert.ok(o.tags.length >= 1 && o.tags.length <= 2, o.text);
      for (const [a, b] of CLASHES) assert.ok(!(o.tags.includes(a) && o.tags.includes(b)), `clash ${a}/${b} on ${o.text}`);
    }
  }
});

test('recruit backstories are finished text from the role\'s list, with rarer tiers showing up (2,000 recruits)', async () => {
  const { ORIGINS } = await import('../src/data/recruitPools.js');
  const { createNewGame } = await import('../src/core/state.js');
  const { generateRecruit } = await import('../src/core/recruits.js');
  const s = createNewGame({ seed: 5 });
  const tiers = {};
  for (let i = 0; i < 2000; i++) {
    const r = generateRecruit(s);
    assert.equal(typeof r.origin, 'string');
    assert.ok(!r.origin.includes('{district}'), r.origin);
    const line = ORIGINS[r.role].find((o) => new RegExp('^' + o.text.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace('{district}', '.+') + '$').test(r.origin));
    assert.ok(line, `origin not from ${r.role} list: ${r.origin}`);
    tiers[line.tier] = (tiers[line.tier] ?? 0) + 1;
  }
  assert.ok(tiers.common > tiers.uncommon && tiers.uncommon > tiers.rare && tiers.rare > 0, JSON.stringify(tiers));
});

test('temperaments and habits: 1-2 tags, no clashing pair, a common line in each', async () => {
  const { TEMPERAMENTS, HABITS } = await import('../src/data/recruitPools.js');
  for (const lines of [TEMPERAMENTS, HABITS]) {
    assert.ok(lines.some((l) => l.tier === 'common'));
    for (const l of lines) {
      assert.ok(l.tags.length >= 1 && l.tags.length <= 2, l.text);
      for (const [a, b] of CLASHES) assert.ok(!(l.tags.includes(a) && l.tags.includes(b)), `clash ${a}/${b} on ${l.text}`);
    }
  }
});

test('personality: no clashes with the backstory over 5,000 recruits, and matching lines picked more often', async () => {
  const { ORIGINS, TEMPERAMENTS, HABITS } = await import('../src/data/recruitPools.js');
  const { createNewGame } = await import('../src/core/state.js');
  const { generateRecruit } = await import('../src/core/recruits.js');
  const s = createNewGame({ seed: 11 });
  const originOf = (r) => ORIGINS[r.role].find((o) => new RegExp('^' + o.text.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace('{district}', '.+') + '$').test(r.origin));
  // How often a recruit's temperament shares a tag with their backstory, vs. a random backstory.
  let matched = 0, baseline = 0;
  const all = [];
  for (let i = 0; i < 5000; i++) {
    const r = generateRecruit(s);
    const temperament = TEMPERAMENTS.find((t) => r.bio.startsWith(t.text + ' '));
    const habit = temperament && HABITS.find((h) => r.bio === `${temperament.text} ${h.text}`);
    assert.ok(habit, `bio is not temperament + habit: ${r.bio}`);
    const origin = originOf(r);
    const tags = [...origin.tags, ...temperament.tags, ...habit.tags];
    for (const [a, b] of CLASHES) assert.ok(!(tags.includes(a) && tags.includes(b)), `clash ${a}/${b}: ${r.origin} ${r.bio}`);
    all.push({ origin, temperament });
  }
  const shares = (o, t) => t.tags.some((x) => o.tags.includes(x));
  for (let i = 0; i < all.length; i++) {
    if (shares(all[i].origin, all[i].temperament)) matched++;
    if (shares(all[(i + 1) % all.length].origin, all[i].temperament)) baseline++;
  }
  assert.ok(matched > baseline * 1.5, `matched ${matched} vs baseline ${baseline}`);
});

test('every trait has a known tier', () => {
  for (const [id, t] of Object.entries(TRAITS)) assert.ok(t.tier in TIER_ODDS, `${id} tier "${t.tier}"`);
});

test('traits: two different ones, and every trait at least half its unsteered rate (5,000 recruits)', async () => {
  const { createNewGame } = await import('../src/core/state.js');
  const { generateRecruit, pickTraits } = await import('../src/core/recruits.js');
  const n = 5000;
  const s = createNewGame({ seed: 13 });
  const rng = makeRng(17);
  const seen = {}, unsteered = {};
  for (let i = 0; i < n; i++) {
    const r = generateRecruit(s);
    assert.equal(r.traits.length, 2);
    assert.notEqual(r.traits[0], r.traits[1]);
    for (const t of r.traits) seen[t] = (seen[t] ?? 0) + 1;
    for (const t of pickTraits(rng)) unsteered[t] = (unsteered[t] ?? 0) + 1;
  }
  for (const id of Object.keys(TRAITS)) assert.ok((seen[id] ?? 0) >= unsteered[id] / 2, `${id} ${seen[id]} vs unsteered ${unsteered[id]}`);
});

test('a chrome backstory gives Chromed clearly more often, without changing the rare-trait rate', async () => {
  const { pickTraits } = await import('../src/core/recruits.js');
  const n = 5000;
  const count = (leanings, seed) => {
    const rng = makeRng(seed);
    let chromed = 0, rare = 0;
    for (let i = 0; i < n; i++) {
      const traits = pickTraits(rng, leanings);
      if (traits.includes('chromed')) chromed++;
      rare += traits.filter((t) => TRAITS[t].tier === 'rare').length;
    }
    return { chromed, rare: (100 * rare) / (2 * n) };
  };
  const plain = count([], 21);
  const chrome = count(['chrome'], 22);
  assert.ok(chrome.chromed > plain.chromed * 1.3, `chromed ${chrome.chromed} vs ${plain.chromed}`);
  assert.ok(Math.abs(chrome.rare - plain.rare) <= 2, `rare ${plain.rare}% -> ${chrome.rare}%`);
});
