// The squad picker (2026-11-06, the owner's playtest; mock-up drafts/prototypes/picker.html): groups
// in a fixed order with freelancers apart, the not-free folded away, the job's target up top, a sort
// by any key stat, and Joss's pick tagged.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { renderPicker } from '../src/ui/board.js';
import { templateById } from '../src/core/jobs.js';
import { freelancerAsCrew } from '../src/core/freelance.js';

const ui = { esc: (x) => String(x), face: () => '<i></i>', statusChip: (a) => `<s>${a.reason}</s>` };
const base = () => {
  const s = createNewGame({ seed: 7, startCrew: 'fresh' });
  const job = s.jobs[0];
  const tpl = templateById(job.templateId);
  const crew = s.crew.slice(0, 4);
  crew.forEach((op, i) => { for (const k of tpl.keyStats) op.stats[k] = 3 + i; });
  const people = [
    ...crew.map((op, i) => ({ op, status: i === 3 ? { ok: false, reason: 'injured' } : { ok: true, reason: 'ready' }, freelance: null })),
    { op: { ...freelancerAsCrew((s.freelancers ?? [])[0] ?? { ...crew[0], id: 'fl-1', handle: 'Parity' }), id: 'fl-1', handle: 'Parity', freelance: true }, status: { ok: true, reason: 'ready' }, freelance: { share: 0.15 } },
  ];
  const fit = { want: 10, stats: (op) => tpl.keyStats.map((k) => ({ key: k, name: k[0].toUpperCase() + k.slice(1), value: op.stats?.[k] ?? 0, fit: (op.stats?.[k] ?? 0) >= 10 ? 'good' : 'weak', mark: '' })) };
  const plan = { crew: [crew[0].id], overwatch: null, wheels: null, standby: null, approach: 'stealth' };
  return { s, tpl, crew, people, fit, plan, threat: job.threat ?? 2 };
};
const cardsOf = (html) => html.slice(html.indexOf('picker__cards'), html.indexOf('picker__table'));

test('groups in order: your crew, freelancers, already on the squad, then the not-free folded', () => {
  const { tpl, people, fit, plan, threat, crew } = base();
  const html = cardsOf(renderPicker(ui, { plan, tpl, threat, slot: 'in:1', people, freelancersFull: false, fit }));
  const at = (t) => html.indexOf(t);
  assert.ok(at('Your crew') < at('Freelancers') && at('Freelancers') < at('Already on the squad'), 'fixed order');
  assert.ok(at('Already on the squad') < at('Not free today'), 'the not-free last');
  assert.match(html, /<details class="pfold"><summary>Not free today \(1\)/, 'folded');
  assert.ok(at(`data-id="${crew[3].id}"`) > at('Not free today'), 'the injured one is in the fold');
  assert.ok(at('data-id="fl-1"') > at('Freelancers') && at('data-id="fl-1"') < at('Already on the squad'), 'the freelancer apart');
});

test("the job's target up top, a sort by any key stat, and Joss's pick tagged", () => {
  const { tpl, people, fit, plan, threat, crew } = base();
  const html = renderPicker(ui, { plan, tpl, threat, slot: 'in:1', people, freelancersFull: false, fit, jossId: crew[2].id });
  assert.match(html, new RegExp(`${tpl.name} wants about <b>10</b>`));
  for (const k of tpl.keyStats) assert.match(html, new RegExp(`data-action="pick-sort" data-id="${k}"`));
  const tagged = html.slice(html.indexOf(`data-id="${crew[2].id}"`)).split('</button>')[0];
  assert.match(tagged, /Joss picks/);
  // Sorting by a stat puts the highest in it first among your crew.
  const k = tpl.keyStats[0];
  crew[1].stats[k] = 20;
  const sorted = cardsOf(renderPicker(ui, { plan, tpl, threat, slot: 'in:1', people, freelancersFull: false, fit, sortBy: k }));
  const firstCrew = /data-action="assign" data-id="([^"]+)"/.exec(sorted.slice(sorted.indexOf('Your crew')))[1];
  assert.equal(firstCrew, crew[1].id);
  assert.match(sorted, new RegExp(`cand__top[^>]*>${k[0].toUpperCase() + k.slice(1)} <b>20`), 'the sorted stat shown big');
});

test('outside slots keep their one line, with no target or table', () => {
  const { tpl, people, fit, plan, threat } = base();
  const html = renderPicker(ui, { plan, tpl, threat, slot: 'wheels', people, freelancersFull: false, fit });
  assert.doesNotMatch(html, /wants about|picker__table|pick-sort/);
  assert.match(html, /In the van/);
  assert.doesNotMatch(html, /data-id="fl-1"/, 'no freelancers outside');
});
