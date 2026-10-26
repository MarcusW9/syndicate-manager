// Earned traits, group 1 (owner's list and calls, 2026-10-26). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { effectiveStat, crewRoll, setInjury, INJURY_DAYS } from '../src/core/crew.js';
import * as E from '../src/core/earned.js';
import { EARNED_TRAITS } from '../src/data/earnedTraits.js';
import { playMission, carefulPolicy, playWeeks } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const game = (seed = 1) => createNewGame({ seed, startCrew: 'fresh' });
const roll = (op, stat, success, extra = {}) => ({ kind: 'roll', actor: { id: op.id, handle: op.handle }, stat, success, notes: [], ...extra });
const hurtEvent = (op, severity = 'light') => ({ kind: 'roll', actor: { id: op.id, handle: op.handle }, stat: 'cool', success: false, notes: [], injury: { id: op.id, handle: op.handle, severity } });
const job = (s, events, crew, extra = {}) => E.afterJob(s, { events, district: 'docks', clientId: null, outcome: 'completed', crewIds: crew.map((o) => o.id), ...extra });
const has = (op, id) => !!E.earnedOf(op, id);
const notes = (r) => r.notes.join(', ');

test('Steady Under Fire: cool or combat held after a crewmate is hurt; +1 cool while someone else is hurt', () => {
  const s = game(); const [a, b] = s.crew;
  for (let i = 0; i < 3; i++) job(s, [hurtEvent(b), roll(a, 'cool', true)], [a, b]);
  assert.ok(has(a, 'steady_under_fire'));
  assert.match(notes(crewRoll([a], 'cool', { lead: { op: a, value: 10, notes: [] }, job: { district: 'docks', injured: [b.id], rolled: [a.id] } })), /Steady Under Fire \+1/);
  assert.doesNotMatch(notes(crewRoll([a], 'cool', { lead: { op: a, value: 10, notes: [] }, job: { district: 'docks', injured: [], rolled: [a.id] } })), /Steady/);
});

test('Clinic Hands: three medical passes; then a lightly hurt crewmate is back a day sooner', () => {
  let s = game(2); const medic = s.crew.find((o) => o.role === 'medic'); const mate = s.crew.find((o) => o !== medic);
  job(s, [roll(medic, 'medical', true), roll(medic, 'medical', true), roll(medic, 'medical', true)], [medic]);
  assert.ok(has(medic, 'clinic_hands'));
  setInjury(mate, 'light');
  const days = mate.condition.injuryDays;
  s.jobs = []; addOffer(s, 'container409');
  s = M.startMission(s, s.jobs[0].id, [medic.id, mate.id], 'stealth');
  s.activeMission.queue = [{ type: 'beat', index: 0 }];
  s = M.revealBeat(s);
  const after = s.crew.find((o) => o.id === mate.id);
  if (after.condition.injury === 'light') assert.equal(after.condition.injuryDays, days - 1);
  assert.ok(s.inbox.find((m) => m.type === 'report').timeline.outcome.some((o) => /Clinic Hands/.test(o.text)));
});

test('Clean Professional: ten clean jobs; then a failed roll of theirs draws one less heat, once a job', () => {
  const s0 = game(3); const op = s0.crew[0];
  for (let i = 0; i < 10; i++) job(s0, [roll(op, 'stealth', true)], [op]);
  assert.ok(has(op, 'clean_professional'));
  let saved = 0;
  for (let seed = 1; seed <= 60 && !saved; seed++) {
    let s = structuredClone(s0); s.seed = seed;
    s.jobs = []; addOffer(s, 'container409');
    s.crew[0].stats.stealth = 1;
    s = M.startMission(s, s.jobs[0].id, [s.crew[0].id], 'loud');
    s.activeMission.queue = [{ type: 'crisis', id: 'cutter' }, { type: 'beat', index: 0 }]; s.activeMission.step = 0;
    const before = s.activeMission.extraHeat;
    s = M.chooseOption(s, 'shadow');
    const e = s.activeMission.events.at(-1);
    if (!e.success) { assert.equal(s.activeMission.extraHeat, before, 'the +1 heat was cancelled'); assert.ok(e.saved); saved++; }
  }
  assert.ok(saved, 'saw a failed roll');
});

test('Ghost Driver: five clean driving passes; +1 driving', () => {
  const s = game(4); const d = s.crew.find((o) => o.role === 'driver');
  const before = effectiveStat(d, 'driving').value;
  for (let i = 0; i < 5; i++) job(s, [roll(d, 'driving', true)], [d]);
  assert.ok(has(d, 'ghost_driver'));
  assert.equal(effectiveStat(d, 'driving').value, before + 1);
  assert.match(effectiveStat(d, 'driving').notes.join(), /Ghost Driver \+1/);
});

test('Scarred: a critical wound, healed; +1 cool while hurt, and wounds take a day longer', () => {
  const s = game(5); const op = s.crew[0];
  setInjury(op, 'critical'); E.noteInjury(s, op, 'critical');
  assert.ok(has(op, 'shaky'), 'a near-fatal wound leaves them shaky');
  E.dailyTraits(s);
  assert.ok(!has(op, 'scarred'), 'not while still hurt');
  setInjury(op, 'healthy');
  E.dailyTraits(s);
  assert.ok(has(op, 'scarred'));
  setInjury(op, 'light');
  assert.equal(op.condition.injuryDays, INJURY_DAYS.light + 1);
  assert.match(effectiveStat(op, 'cool').notes.join(), /Scarred \+1/);
});

test('Shaky: two injuries in a week; −1 cool (−1 more alone on side work); settles after three clean jobs', () => {
  const s = game(6); const op = s.crew[0];
  E.noteInjury(s, op, 'light');
  assert.ok(!has(op, 'shaky'));
  s.day += 3; E.noteInjury(s, op, 'light');
  assert.ok(has(op, 'shaky'));
  assert.match(effectiveStat(op, 'cool').notes.join(), /Shaky −1/);
  assert.match(notes(crewRoll([op], 'social', { job: { side: true, solo: true, district: 'docks' } })), /Shaky, alone −1/);
  for (let i = 0; i < 3; i++) job(s, [roll(op, 'cool', true)], [op]);
  assert.ok(!has(op, 'shaky'), 'settled');
});

test('Riding High: three clean jobs in a row; +1 on their first roll; gone after a failed roll or a week idle', () => {
  const s = game(7); const op = s.crew[0];
  for (let i = 0; i < 3; i++) job(s, [roll(op, 'cool', true)], [op]);
  assert.ok(has(op, 'riding_high'));
  const first = crewRoll([op], 'cool', { job: { district: 'docks', injured: [], rolled: [] } });
  const later = crewRoll([op], 'cool', { job: { district: 'docks', injured: [], rolled: [op.id] } });
  assert.equal(first.value, later.value + 1);
  job(s, [roll(op, 'cool', false)], [op]);
  assert.ok(!has(op, 'riding_high'), 'a failed roll ends it');
  for (let i = 0; i < 3; i++) job(s, [roll(op, 'cool', true)], [op]);
  s.day += 7; E.dailyTraits(s);
  assert.ok(!has(op, 'riding_high'), 'a week idle ends it');
});

test('District Rhythm: five jobs in one district in two weeks; +1 first roll there, −1 elsewhere; fades after two jobs away', () => {
  const s = game(8); const op = s.crew[0];
  for (let i = 0; i < 5; i++) { s.day += 2; job(s, [roll(op, 'cool', true)], [op]); }
  assert.ok(E.earnedOf(op, 'district_rhythm', { district: 'docks' }));
  const at = (district) => crewRoll([op], 'cool', { job: { district, injured: [], rolled: [] } }).value;
  assert.equal(at('docks') - at('oldTown'), 2 + 0, 'one up at home, one down away');
  job(s, [], [op], { district: 'oldTown' }); job(s, [], [op], { district: 'oldTown' });
  assert.ok(!has(op, 'district_rhythm'));
});

test('Known Face: trouble on three jobs in one district; −1 stealth, +1 social there; fades after two quiet weeks', () => {
  const s = game(9); const op = s.crew[0];
  for (let i = 0; i < 3; i++) job(s, [roll(op, 'stealth', false, { outcomeCost: { heat: 1 } })], [op]);
  assert.ok(E.earnedOf(op, 'known_face', { district: 'docks' }));
  const jd = { district: 'docks', injured: [], rolled: [op.id] };
  assert.match(notes(crewRoll([op], 'stealth', { job: jd })), /Known Face −1/);
  assert.match(notes(crewRoll([op], 'social', { job: jd })), /Known Face \+1/);
  assert.doesNotMatch(notes(crewRoll([op], 'social', { job: { ...jd, district: 'oldTown' } })), /Known Face/);
  s.day += 14; E.dailyTraits(s);
  assert.ok(!has(op, 'known_face'));
});

test('Second Wind: twice made the last roll count while hurt; shrugs it off once a job; spent after three', () => {
  const s = game(10); const op = s.crew[0];
  for (let i = 0; i < 2; i++) job(s, [roll(op, 'cool', true, { notes: ['hurt'] })], [op]);
  assert.ok(has(op, 'second_wind'));
  op.condition.injury = 'light';
  const fresh = crewRoll([op], 'cool', { job: { district: 'docks', injured: [], rolled: [], secondWindUsed: [] } });
  const used = crewRoll([op], 'cool', { job: { district: 'docks', injured: [], rolled: [], secondWindUsed: [op.id] } });
  assert.equal(fresh.value, used.value + 2);
  for (let i = 0; i < 3; i++) E.spendSecondWind(s, op);
  assert.ok(!has(op, 'second_wind'), 'used up');
});

test("Client's Favourite: three clean jobs for one client; fades when one of theirs goes wrong", () => {
  const s = game(11); const op = s.crew[0];
  for (let i = 0; i < 3; i++) job(s, [roll(op, 'social', true)], [op], { clientId: 'fung' });
  assert.ok(E.earnedOf(op, 'client_favourite', { client: 'fung' }));
  job(s, [], [op], { clientId: 'fung', outcome: 'aborted' });
  assert.ok(!has(op, 'client_favourite'));
});

test('Crew Anchor: five jobs together, both unhurt; +1 cool together; shaken for a job after the partner goes critical', () => {
  const s = game(12); const [a, b] = s.crew;
  for (let i = 0; i < 5; i++) job(s, [], [a, b]);
  assert.ok(E.earnedOf(a, 'crew_anchor', { partner: b.id }) && E.earnedOf(b, 'crew_anchor', { partner: a.id }));
  assert.match(effectiveStat(a, 'cool', { crew: [a, b] }).notes.join(), /Crew Anchor/);
  assert.doesNotMatch(effectiveStat(a, 'cool', { crew: [a] }).notes.join(), /Crew Anchor/);
  E.noteInjury(s, b, 'critical');
  assert.match(effectiveStat(a, 'cool', { crew: [a] }).notes.join(), /shaken/);
  job(s, [], [a]);
  assert.doesNotMatch(effectiveStat(a, 'cool', { crew: [a] }).notes.join(), /shaken/);
});

test('at most two temporary traits: a third replaces the oldest; lasting ones are kept', () => {
  const s = game(13); const op = s.crew[0];
  E.earn(s, op, 'ghost_driver');
  E.earn(s, op, 'shaky'); E.earn(s, op, 'riding_high'); E.earn(s, op, 'second_wind');
  const temps = op.earned.filter((e) => EARNED_TRAITS[e.id].kind === 'temporary').map((e) => e.id);
  assert.deepEqual(temps, ['riding_high', 'second_wind']);
  assert.ok(has(op, 'ghost_driver'));
  assert.ok(s.inbox.some((m) => m.subject === `${op.handle}: no longer Shaky`));
});

test('progress is hidden: nothing says anything until a trait is earned, then Joss explains and history records it', () => {
  const s = game(14); const d = s.crew.find((o) => o.role === 'driver');
  const inbox = s.inbox.length;
  const names = Object.values(EARNED_TRAITS).map((t) => t.name);
  for (let i = 0; i < 4; i++) job(s, [roll(d, 'driving', true)], [d]);
  const extra = s.inbox.slice(0, s.inbox.length - inbox);
  assert.ok(!has(d, 'ghost_driver'));
  assert.ok(extra.every((m) => names.some((n) => m.subject === `${d.handle}: ${n}`)), 'only earned notes (here Riding High), no "4/5" progress');
  job(s, [roll(d, 'driving', true)], [d]);
  const note = s.inbox.find((m) => m.subject.endsWith('Ghost Driver'));
  assert.equal(note.subject, `${d.handle}: Ghost Driver`);
  assert.match(note.body, /Five clean exits/);
  assert.ok(d.history.some((h) => /Ghost Driver/.test(h)));
});

test('no trait ever takes a choice away: the same choices are open with every trait as without', () => {
  let s = game(15);
  s.jobs = []; addOffer(s, 'clinic');
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 2).map((o) => o.id), 'stealth');
  const open = () => M.describeCrisis(s).choices.map((c) => `${c.id}:${c.available}`);
  s.activeMission.queue = [{ type: 'crisis', id: 'collectors' }, { type: 'beat', index: 0 }]; s.activeMission.step = 0;
  const before = open();
  for (const op of s.crew) for (const id of Object.keys(EARNED_TRAITS)) op.earned = [...(op.earned ?? []), { id, day: 1, district: 'oldTown', client: 'fung', partner: s.crew[1].id }];
  assert.deepEqual(open(), before);
});

test('a season of play earns some traits and keeps every promise', () => {
  const { state, deaths } = playWeeks(16, 21, carefulPolicy, { startCrew: 'fresh' });
  assert.equal(deaths, 0);
  const earned = state.crew.flatMap((o) => (o.earned ?? []).map((e) => e.id));
  assert.ok(earned.length > 0, 'somebody became something');
  for (const op of state.crew) assert.ok((op.earned ?? []).filter((e) => EARNED_TRAITS[e.id].kind === 'temporary').length <= E.MAX_TEMPORARY);
});

test('a v18 save upgrades with no earned traits yet', async () => {
  const s = game(17);
  for (const op of s.crew) { delete op.earned; delete op.track; }
  s.version = 18;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  for (const op of loaded.crew) { assert.deepEqual(op.earned, []); assert.deepEqual(op.track, {}); }
});
