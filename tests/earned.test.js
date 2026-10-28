// Earned traits, group 1 (owner's list and calls, 2026-10-26). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { effectiveStat, crewRoll, setInjury, INJURY_DAYS } from '../src/core/crew.js';
import * as E from '../src/core/earned.js';
import { EARNED_TRAITS } from '../src/data/earnedTraits.js';
import { playMission, carefulPolicy, playWeeks, arm } from './play.js';

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

test('Ghost Driver: five clean driving passes in escapes; +1 driving in escapes only, as written', () => {
  const s = game(4); const d = s.crew.find((o) => o.role === 'driver');
  for (let i = 0; i < 5; i++) job(s, [roll(d, 'driving', true)], [d]);
  assert.ok(!has(d, 'ghost_driver'), 'driving that was not an escape does not count');
  for (let i = 0; i < 5; i++) job(s, [roll(d, 'driving', true, { situations: ['escape'] })], [d]);
  assert.ok(has(d, 'ghost_driver'));
  const at = (situations) => crewRoll([d], 'driving', { job: { district: 'docks', injured: [], rolled: [d.id], situations } });
  assert.equal(at(['escape']).value, at([]).value + 1);
  assert.match(notes(at(['escape'])), /Ghost Driver \+1/);
});

test('Scarred: a critical wound, healed; +1 cool when someone is hurt or squaring up, and wounds take a day longer', () => {
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
  const at = (situations) => crewRoll([op], 'cool', { job: { district: 'docks', injured: [], rolled: [op.id], situations } });
  for (const sit of ['injury', 'threat']) assert.match(notes(at([sit])), /Scarred \+1/);
  assert.doesNotMatch(notes(at(['crowd'])), /Scarred/);
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
  for (let i = 0; i < 4; i++) job(s, [roll(d, 'driving', true, { situations: ['escape'] })], [d]);
  const extra = s.inbox.slice(0, s.inbox.length - inbox);
  assert.ok(!has(d, 'ghost_driver'));
  assert.ok(extra.every((m) => names.some((n) => m.subject === `${d.handle}: ${n}`)), 'only earned notes (here Riding High), no "4/5" progress');
  job(s, [roll(d, 'driving', true, { situations: ['escape'] })], [d]);
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

// --- group 2: situations ---------------------------------------------------------

const at = (op, stat, situations, more = {}) => crewRoll([op], stat, { job: { district: 'docks', injured: [], rolled: [op.id], situations, ...more } });

test('Light-Fingered: four stealth passes getting in somewhere; +1 stealth on entry, not in a chase', () => {
  const s = game(30); const op = s.crew[0];
  for (let i = 0; i < 4; i++) job(s, [roll(op, 'stealth', true, { situations: ['entry'] })], [op]);
  assert.ok(has(op, 'light_fingered'));
  assert.equal(at(op, 'stealth', ['entry']).value, at(op, 'stealth', []).value + 1);
  assert.equal(at(op, 'stealth', ['entry', 'escape']).value, at(op, 'stealth', []).value, 'not in a chase');
});

test('Crowd Reader: four social or cool passes with a crowd around; +1 social there', () => {
  const s = game(31); const op = s.crew[0];
  for (let i = 0; i < 4; i++) job(s, [roll(op, i % 2 ? 'social' : 'cool', true, { situations: ['crowd'] })], [op]);
  assert.ok(has(op, 'crowd_reader'));
  assert.match(notes(at(op, 'social', ['crowd'])), /Crowd Reader \+1/);
});

test('Wirewise: four tech passes on street hardware; +1 tech there, not on corporate systems', () => {
  const s = game(32); const op = s.crew[0];
  for (let i = 0; i < 4; i++) job(s, [roll(op, 'tech', true, { situations: ['street-tech'] })], [op]);
  assert.ok(has(op, 'wirewise'));
  assert.match(notes(at(op, 'tech', ['street-tech'])), /Wirewise \+1/);
  assert.doesNotMatch(notes(at(op, 'tech', ['street-tech', 'corp-tech'])), /Wirewise/);
});

test('Corner Fighter: three combat passes in fights; +1 combat in a fight once someone is hurt', () => {
  const s = game(33); const [op, mate] = s.crew;
  for (let i = 0; i < 3; i++) job(s, [roll(op, 'combat', true, { situations: ['fight'] })], [op]);
  assert.ok(has(op, 'corner_fighter'));
  assert.doesNotMatch(notes(at(op, 'combat', ['fight'])), /Corner Fighter/);
  assert.match(notes(at(op, 'combat', ['fight'], { injured: [mate.id] })), /Corner Fighter \+1/);
});

test('Rattled by Sirens: two failures in front of the police, or a night in the cells; −1 cool there; fades after facing them twice', () => {
  const s = game(34); const op = s.crew[0];
  for (let i = 0; i < 2; i++) job(s, [roll(op, 'social', false, { situations: ['police', 'law'] })], [op]);
  assert.ok(has(op, 'rattled_by_sirens'));
  assert.match(notes(at(op, 'cool', ['police'])), /Rattled by Sirens −1/);
  assert.doesNotMatch(notes(at(op, 'cool', ['law'])), /Rattled/, 'customs are the law, not the sirens');
  job(s, [roll(op, 'cool', true, { situations: ['police'] }), roll(op, 'social', true, { situations: ['police'] })], [op]);
  assert.ok(!has(op, 'rattled_by_sirens'));
});

test('a side task that ends with someone held by the police leaves them Rattled by Sirens', async () => {
  const S = await import('../src/core/sidetasks.js');
  const { advanceDay } = await import('../src/core/time.js');
  let rattled = false;
  for (let seed = 1; seed <= 80 && !rattled; seed++) {
    let s = game(seed);
    s.sideBoard = ['forklift_relief'];
    const op = s.crew[0]; op.stats.driving = 1;
    s = advanceDay(advanceDay(S.sendOnSideTask(s, 'forklift_relief', [op.id])));
    const back = s.crew.find((o) => o.id === op.id);
    if (s.inbox.some((m) => /held by the police/.test(m.body))) { assert.ok(E.earnedOf(back, 'rattled_by_sirens')); rattled = true; }
  }
  assert.ok(rattled, 'saw someone held');
});

test('Short Fuse: two failures keeping the peace under threat; +1 combat, −1 social there; a third time and they become a Hothead', () => {
  const s = game(35); const op = s.crew.find((o) => !o.traits.includes('hothead'));
  const flare = () => job(s, [roll(op, 'social', false, { situations: ['threat'] }), roll(op, 'cool', false, { situations: ['threat'] })], [op]);
  flare();
  assert.ok(has(op, 'short_fuse'));
  assert.match(notes(at(op, 'combat', ['threat'])), /Short Fuse \+1/);
  assert.match(notes(at(op, 'social', ['threat'])), /Short Fuse −1/);
  for (let i = 0; i < 3; i++) job(s, [roll(op, 'stealth', true)], [op]);
  assert.ok(!has(op, 'short_fuse'), 'three calm jobs settle it');
  flare(); for (let i = 0; i < 3; i++) job(s, [roll(op, 'stealth', true)], [op]);
  flare();
  assert.ok(op.traits.includes('hothead'), 'the third time it sticks');
  assert.ok(!has(op, 'short_fuse'));
});

test('Burned Out: tech or neural work failing them twice within three jobs; −1 tech and cool, −1 more on neural work; three days of rest', () => {
  const s = game(36); const op = s.crew[0];
  job(s, [roll(op, 'tech', false)], [op]);
  job(s, [roll(op, 'cool', false, { situations: ['neural'] })], [op]);
  assert.ok(has(op, 'burned_out'));
  assert.match(effectiveStat(op, 'tech').notes.join(), /Burned Out −1/);
  assert.match(notes(at(op, 'tech', ['neural'])), /Burned Out \(neural work\) −1/);
  s.day += 2; E.dailyTraits(s);
  assert.ok(has(op, 'burned_out'), 'not rested enough yet');
  s.day += 1; E.dailyTraits(s);
  assert.ok(!has(op, 'burned_out'));
});

test('Overconfident: four hard rolls in a row; +1 on hard rolls, −1 on the safest option; gone after a failure', () => {
  const s = game(37); const op = s.crew[0];
  for (let i = 0; i < 4; i++) job(s, [roll(op, 'cool', true, { need: 16 })], [op]);
  assert.ok(has(op, 'overconfident'));
  assert.match(notes(at(op, 'cool', [], { difficulty: 7 })), /Overconfident \+1/);
  assert.match(notes(at(op, 'cool', [], { difficulty: 4, safest: true })), /beneath them/);
  job(s, [roll(op, 'cool', false, { need: 12 })], [op]);
  assert.ok(!has(op, 'overconfident'));
});

test('Overconfident marks only the easiest option of a real crisis as beneath them', () => {
  let s = game(38);
  s.jobs = []; addOffer(s, 'clinic');
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 2).map((o) => o.id), 'stealth');
  for (const op of s.crew) op.earned = [{ id: 'overconfident', day: 1 }];
  s.activeMission.queue = [{ type: 'crisis', id: 'collectors' }, { type: 'beat', index: 0 }]; s.activeMission.step = 0;
  const reasons = Object.fromEntries(M.describeCrisis(s).choices.filter((c) => c.available && c.riskReason).map((c) => [c.id, c.riskReason]));
  assert.match(reasons.hide, /beneath them/, 'hide (difficulty 5) is the easy way');
  assert.doesNotMatch(reasons.anchor, /beneath them/);
});

test('Ghost Driver sheds a point of heat on a clean getaway that costs heat', () => {
  let shed = 0;
  for (let seed = 1; seed <= 40; seed++) {
    let s = game(seed);
    s.jobs = []; addOffer(s, 'warehouse');
    const d = s.crew.find((o) => o.role === 'driver');
    d.earned = [{ id: 'ghost_driver', day: 1 }]; d.stats.driving = 20;
    s = M.startMission(s, s.jobs[0].id, [d.id], 'stealth');
    s.activeMission.queue = [{ type: 'crisis', id: 'toll' }, { type: 'beat', index: 0 }]; s.activeMission.step = 0;
    s = M.chooseOption(s, 'ram'); // costs heat +2 whatever the roll
    const e = s.activeMission.events.find((x) => x.choiceId === 'ram');
    if (e.success) { assert.equal(e.saved, 'Ghost Driver: one less heat'); shed++; }
  }
  assert.ok(shed > 20);
});

// --- the squad run (retuned 2026-10-27): incidents and saves count, for less ---------------------

test('incidents count a quarter of a crisis roll towards a trait, saves a half', () => {
  assert.deepEqual(E.WEIGHT, { crisis: 1, save: 0.5, incident: 0.25 });
  const s = game(3); const [a, b] = s.crew;
  const lock = (op) => roll(op, 'stealth', true, { incident: 'lock', situations: ['entry', 'street-tech'] });
  for (let i = 0; i < 15; i++) job(s, [lock(a)], [a]);
  assert.ok(!has(a, 'light_fingered'), 'fifteen locks are not quite four break-ins');
  job(s, [lock(a)], [a]);
  assert.ok(has(a, 'light_fingered'), 'sixteen are');
  const patch = (op) => ({ kind: 'save', via: 'patch', actor: { id: op.id, handle: op.handle }, stat: 'medical', success: true, notes: [] });
  for (let i = 0; i < 5; i++) job(s, [patch(b)], [b]);
  assert.ok(!has(b, 'clinic_hands'));
  job(s, [patch(b)], [b]);
  assert.ok(has(b, 'clinic_hands'), 'six patch-ups make Clinic Hands');
});

test('an incident failure does not break a run of clean jobs; only crisis rolls decide that', () => {
  const s = game(4); const [a] = s.crew;
  for (let i = 0; i < 3; i++) job(s, [roll(a, 'stealth', true), roll(a, 'tech', false, { incident: 'camera', situations: ['corp-tech'] })], [a]);
  assert.ok(has(a, 'riding_high'));
});

test('everyone on the job counts towards traits, outside the inside team too', () => {
  let s = game(5);
  s.jobs = []; addOffer(s, 'container409');
  const [a, b, c, d] = s.crew.map((o) => o.id);
  arm(s, c, 'drone');
  s = M.startMission(s, s.jobs[0].id, [a, b], 'stealth', { overwatch: { id: c, kit: 'drone' }, wheels: d });
  s = M.closeMission(playMission(s, carefulPolicy).state);
  for (const id of [c, d]) assert.ok(Object.keys(s.crew.find((o) => o.id === id).track?.together ?? {}).length > 0, `${id} worked the job with the others`);
});
