// The adventure log, slice 1 (core/advlog.js; owner, 2026-11-21/22; drafts/HANDOFF-revenue-next.md,
// docs/log-lines-prompt.md). The promises: every day out writes one line, filled and in the crew's names;
// the picks are hashes, so a log moves no other roll; the contact is introduced before it is named alone;
// a runner's temperament comes back from their bio; logs keep their last ten lines; a hands-off job's
// report and a side task's report carry the days out (a side task's last line is its result); and a v85
// save upgrades.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { crewsOut } from '../src/core/away.js';
import { advanceDay } from '../src/core/time.js';
import { sendOnSideTask, sideTaskById, sideTasksOut } from '../src/core/sidetasks.js';
import { tagsOf, fillLine, writeDay, startFacts, jobDayLine, capLog, LOG_KEEP, DISTRICT_LINES } from '../src/core/advlog.js';
import { TEMPERAMENTS, HABITS } from '../src/data/recruitPools.js';
import JOB_DAYS from '../src/data/advlog/jobDays.js';
import SIDE_DAYS from '../src/data/advlog/sideDays.js';
import { STARTING_CREW } from '../src/data/operatives.js';

const { importSave } = await import('../src/save/save.js');

const SLOTS = new Set(['who', 'other', 'contact', 'contactWhat', 'place', 'district', 'itemFull', 'item', 'cash', 'lead', 'leadShort', 'day']);
const allLines = (x) => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(allLines) : x && typeof x === 'object' ? Object.values(x).flatMap(allLines) : []);

test('every line in use names only the prompt\'s slots, and keeps the house rules (no exclamation marks)', () => {
  const files = { jobDays: JOB_DAYS, sideDays: SIDE_DAYS, ...DISTRICT_LINES };
  for (const [name, file] of Object.entries(files)) {
    const { contacts, places, district, job, ...pools } = file;
    for (const line of allLines(pools)) {
      for (const [, slot] of line.matchAll(/\{(\w+)\}/g)) assert.ok(SLOTS.has(slot), `${name}: {${slot}} in "${line}"`);
      assert.ok(!line.includes('!'), `${name}: "${line}"`);
    }
  }
});

test('a runner\'s temperament comes back from their bio; the old starting crew have theirs by id', () => {
  const op = { id: 'x', bio: `${TEMPERAMENTS[5].text} ${HABITS[2].text}` };
  assert.deepEqual(tagsOf(op).sort(), [...new Set([...TEMPERAMENTS[5].tags, ...HABITS[2].tags])].sort());
  for (const o of STARTING_CREW) assert.ok(tagsOf(o).length, `${o.handle} has tags`);
  assert.deepEqual(tagsOf({ id: 'y', bio: 'Somebody else entirely.' }), []);
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  assert.ok(s.crew.every((o) => tagsOf(o).length), 'every generated runner has a temperament');
});

test('a slot that starts a sentence is capitalised; one inside a sentence is not', () => {
  assert.equal(fillLine('{contact} was out. {place} was shut.', { contact: 'a local', place: 'the pier' }), 'A local was out. The pier was shut.');
  assert.equal(fillLine('{who} went to {place}.', { who: 'Jax', place: 'the pier' }), 'Jax went to the pier.');
  assert.equal(fillLine('Joss: "{who} again."', { who: 'jax' }), 'Joss: "Jax again."');
});

test('the contact is introduced once, with who they are, before a line names them alone', () => {
  const crew = createNewGame({ seed: 2, startCrew: 'fresh' }).crew;
  const pool = { any: ['{who} asked {contact} again.', '{contact}, {contactWhat}, knew the place.'] };
  for (let t = 0; t < 40; t++) {
    const facts = startFacts(1, `t${t}`, 'docks');
    assert.ok(facts.contact && facts.place, 'the Docks has people and places');
    const first = writeDay({ seed: 1, tripId: `t${t}`, day: 1, crew, district: 'docks', facts, pool, personality: {} });
    assert.ok(first.text.includes(`${facts.contact}, ${facts.contactWhat},`), first.text);
    assert.ok(facts.met);
    const next = writeDay({ seed: 1, tripId: `t${t}`, day: 2, crew, district: 'docks', facts, pool, personality: {} });
    assert.ok(next.text.endsWith(`asked ${facts.contact} again.`), next.text);
  }
  // Where a district has no people (a locked district, the Amber Reach), lines that need one are skipped.
  const facts = startFacts(1, 'o', 'amberReach');
  for (let day = 1; day < 20; day++) {
    const l = jobDayLine({ seed: 1, tripId: 'o', day, crew, district: 'amberReach', facts });
    assert.ok(l && !l.text.includes('{') && !l.text.includes('undefined'), l?.text);
  }
});

test('a line is a pure function of the seed, the trip and the day', () => {
  const crew = createNewGame({ seed: 4, startCrew: 'fresh' }).crew;
  const a = jobDayLine({ seed: 9, tripId: 'job-1', day: 2, crew, district: 'nightMarket', facts: startFacts(9, 'job-1', 'nightMarket') });
  const b = jobDayLine({ seed: 9, tripId: 'job-1', day: 2, crew, district: 'nightMarket', facts: startFacts(9, 'job-1', 'nightMarket') });
  assert.deepEqual(a, b);
});

test('a hands-off job writes a line every day out, shows it on its card and brings the days home in the report', () => {
  let full = 0;
  for (let seed = 1; seed <= 12; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, 'penthouse'); // three days
    s = sendOff(s, s.jobs[0].id, s.crew.slice(0, templateById('penthouse').crewSize).map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
    s = advanceDay(s);
    const out = crewsOut(s)[0];
    if (out) {
      const am = s.awayJobs[0].mission;
      assert.deepEqual(am.advlog.log.map((l) => l.day), [1]);
      assert.equal(out.lines[0], am.advlog.log[0].text, 'the card leads with the day\'s line');
      assert.deepEqual(out.log, am.advlog.log);
    }
    for (let i = 0; i < 6 && s.awayJobs.length; i++) s = advanceDay(s);
    const report = s.inbox.find((m) => m.type === 'report' && m.back?.templateId === 'penthouse');
    assert.ok(report, 'the report came back');
    const days = report.timeline.days.map((d) => d.day);
    assert.deepEqual(days, days.map((_, i) => i + 1), 'a line for each day out, in order');
    assert.ok(report.timeline.days.every((d) => d.text && !d.text.includes('{')));
    if (days.length === 3) full++;
  }
  assert.ok(full >= 1, `a three-day log (${full} of 12 ran all three days)`);
});

test('a two-day side task writes its first day, and its report ends on the result', () => {
  let s = createNewGame({ seed: 6, startCrew: 'fresh' });
  const task = sideTaskById('trike_practice'); // two days, one runner
  s.sideBoard = [task.id];
  s = sendOnSideTask(s, task.id, [s.crew[0].id]);
  s = advanceDay(s);
  const out = sideTasksOut(s).find((t) => t.name === task.name);
  assert.equal(out.log.length, 1);
  assert.ok(out.log[0].text.length > 10 && !out.log[0].text.includes('{'), out.log[0].text);
  s = advanceDay(s);
  const report = s.inbox.find((m) => m.type === 'report' && m.timeline?.side?.taskId === task.id);
  assert.ok(report);
  assert.equal(report.timeline.days.length, 2);
  assert.equal(report.timeline.days.at(-1).text, report.timeline.steps[0], 'the last line is the result');
});

test('a log keeps its last ten lines', () => {
  const log = Array.from({ length: 25 }, (_, i) => ({ day: i + 1, text: `${i}` }));
  capLog(log);
  assert.equal(log.length, LOG_KEEP);
  assert.equal(log[0].day, 16);
});

test('a v85 save upgrades: side tasks out get a log', async () => {
  const s = createNewGame({ seed: 8, startCrew: 'fresh' });
  s.version = 85;
  s.sideOut = [{ taskId: 'trike_practice', crewIds: [s.crew[0].id], returnDay: s.day + 2 }];
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.sideOut[0].log, []);
});
