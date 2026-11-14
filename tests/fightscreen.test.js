// Engine 2's screens (battle rework slice 2): the view model (core/fightview.js) reads only the rules' own read models, so what is
// shown is what is used; the screens (ui/fightscreen.js) draw it. Run with: npm test

import { test } from 'node:test';
import { incidentById } from '../src/core/incidents.js';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep, needsPlayer } from '../src/core/autorun.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { roundView, planView, riskWords, RISK_ORDER, orderChoices, lossLine } from '../src/core/fightview.js';
import { lineText, chanceWord, pipsWord } from '../src/core/fighttext.js';
import { coverage } from '../src/core/squad.js';
import { FIGHT } from '../src/data/fights.js';
import { renderFightRound, renderFightCallIn, renderFightPlan, fightScreenTap, takeFightChange } from '../src/ui/fightscreen.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const face = () => '';

function begin(seed, id, opts = {}) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, id);
  return M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(id).crewSize).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady', ...opts });
}
const inFight = (s) => !!s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle';
function find(id, stop, { to = 300, opts } = {}) {
  for (let seed = 1; seed <= to; seed++) {
    let s = begin(seed, id, opts);
    for (let g = 0; g < 500 && !s.activeMission.done && !stop(s); g++) {
      const am = s.activeMission, cur = am.queue[am.step];
      if (id === 'warehouse' && cur?.type === 'incident' && incidentById(cur.id).danger && am.queue.length > am.step + 2) { s = structuredClone(s); s.activeMission.queue.splice(am.step + 1, s.activeMission.queue.length, { type: 'zone', zone: 'out' }); }
      const n = autoStep(s, { force: true }); if (n === s) break; s = n; }
    if (!s.activeMission.done && stop(s)) return s;
  }
  return null;
}
const waiting = (s) => inFight(s) && !s.activeMission.pending && s.activeMission.battle.drawn;

// --- the units --------------------------------------------------------------------------------------

test('chances and pips come with their units: "60%", "1 pip", "2 pips"', () => {
  assert.equal(chanceWord(0.6), '60%');
  assert.equal(chanceWord(0.9), '90%');
  assert.equal(pipsWord(1), '1 pip');
  assert.equal(pipsWord(2), '2 pips');
  assert.equal(lineText('threat.aim', { enemy: 'drone 1', who: 'Jax', chance: chanceWord(0.9), pips: pipsWord(1) }), 'Drone 1 aims at Jax (90%, 1 pip).', 'the line adds neither unit');
});

// --- the view model reads the rules' own numbers ----------------------------------------------------

test('every chance the round screen shows is the one the round uses (previewRound / aimChance), and a one-pip threat reads "1 pip"', () => {
  const s = find('data_pull', (x) => waiting(x) && x.activeMission.battle.threats.some((t) => t.kind === 'aim' && t.hit === 1), { to: 600 });
  assert.ok(s, 'a one-pip threat comes up');
  const b = s.activeMission.battle;
  const v = roundView(b);
  const pv = F.previewRound(b);
  const lines = v.enemies.flatMap((e) => e.threats).filter((t) => t.kind === 'aim');
  assert.ok(lines.length);
  for (const t of lines) {
    const used = pv.threats.find((x) => x.id === t.id);
    assert.equal(t.chance, used.chance, 'shown = the preview');
    const x = pv.exposure.find((y) => y.id === t.id);
    const runner = b.runners.find((r) => r.id === x.target);
    const kind = pv.actions.find((a) => a.who === runner.id)?.kind;
    const expect = F.aimChance(b, runner, { hunker: !x.shieldedBy && kind === 'hunker', open: !x.shieldedBy && (kind === 'board' || kind === 'carry') });
    assert.equal(t.chance, expect, 'and the preview is aimChance on the same stance the round uses');
    assert.ok(t.text.includes(`(${chanceWord(t.chance)}, ${pipsWord(t.hit)})`), t.text);
  }
  assert.ok(lines.some((t) => t.hit === 1 && t.text.includes('1 pip)')), 'a one-pip threat reads 1 pip, not 1 pips');
  assert.ok(!lines.some((t) => /1 pips/.test(t.text)));
});

test('the round view never draws: nothing in it takes the run\'s stream, and it works before the round is drawn', () => {
  const s = find('data_pull', waiting);
  const b = structuredClone(s.activeMission.battle);
  const real = Math.random;
  Math.random = () => { throw new Error('Math.random'); };
  try {
    const before = JSON.stringify(b);
    roundView(b); orderChoices(b, b.runners[0]);
    assert.equal(JSON.stringify(b), before, 'reading the fight changes nothing');
    b.drawn = false;
    const v = roundView(b);
    assert.equal(v.drawn, false);
    assert.deepEqual(v.ifNothing, [], 'no forecast before the threats are drawn');
  } finally { Math.random = real; }
});

test('"if nothing" lines are the engine\'s own and the clear line is no promise', () => {
  const s = find('data_pull', waiting);
  const v = roundView(s.activeMission.battle);
  assert.deepEqual(v.ifNothing.map((x) => x.text), F.previewRound(s.activeMission.battle).ifNothing.map((x) => x.text));
  for (const x of v.ifNothing) assert.ok(!/safe|guarantee|will not|won't/i.test(x.text), x.text);
});

// --- risk words and the plan -------------------------------------------------------------------------

test('the risk picker says what the rules do: cautious half rounded up, steady two pips, committed never; deaths only after a call on the first two', () => {
  assert.deepEqual(RISK_ORDER, ['cautious', 'steady', 'committed']);
  const [c, st, co] = RISK_ORDER.map(riskWords);
  assert.match(c.description, /half/i);
  assert.match(c.description, /rounded up/i);
  assert.match(st.description, /third of their pips/i, 'steady says a third');
  assert.ok(FIGHT.risk.steady.pullDiv === 3 && FIGHT.risk.steady.minPips === 1, 'and the rule\'s numbers are those');
  assert.match(c.description + st.description, /asks you first/i, 'a watched crew asks first');
  assert.match(co.description, /never/i);
  assert.match(co.description, /life/i);
  for (const d of [c.description, st.description]) assert.match(d, /call you make/i, 'a death only follows a call the player makes');
  assert.ok(!/guarantee/i.test(c.description + st.description + co.description), 'no blanket warning that contradicts the rules');
  // And the numbers shown on a runner are the rule's (riskThreshold): cautious half rounded up, steady 2, committed 0.
  const s = find('data_pull', waiting);
  const b = structuredClone(s.activeMission.battle);
  for (const level of RISK_ORDER) {
    b.risk.level = level;
    for (const r of roundView(b).runners) assert.equal(r.threshold, F.riskThreshold(b, b.runners.find((x) => x.id === r.id)), level);
  }
  b.risk.level = 'cautious';
  assert.equal(roundView(b).runners[0].threshold, Math.ceil(b.runners[0].max / 2));
});

test('the plan view: type line, likely enemies, gaps from the crew, orders and thresholds, and the chance of losing someone at each risk', () => {
  const tpl = templateById('data_pull');
  const crew = createNewGame({ seed: 3, startCrew: 'fresh' }).crew.slice(0, tpl.crewSize);
  const cov = coverage(tpl, crew, 'loud', { threat: tpl.threat });
  assert.ok(cov.fight2, 'the coverage read hands over the fight arguments for the five jobs');
  const p = planView(cov.fight2, 'steady');
  assert.match(p.line, new RegExp(`${FIGHT.workNeeded} rounds`), 'the work rounds are the rule\'s number');
  assert.match(p.kindsLine, /security guards/);
  assert.equal(p.runners.length, crew.length);
  assert.ok(p.runners.every((r) => r.threshold === Math.max(FIGHT.risk.steady.minPips, Math.ceil(r.pips / FIGHT.risk.steady.pullDiv))), 'each runner\'s point is a third of their own pips');
  assert.deepEqual(Object.keys(p.loss), RISK_ORDER);
  for (const level of RISK_ORDER) {
    const o = p.odds[level];
    assert.ok(o.lost >= Math.max(o.dead, o.left) - 1e-9 && o.lost <= o.dead + o.left + 1e-9, 'lost = someone died or was left behind');
    assert.equal(p.loss[level], lossLine(o));
  }
  assert.equal(lossLine({ lost: 0 }), lineText('plan.lossChanceZero'));
  assert.equal(lossLine({ lost: 0.04 }), 'Chance of losing someone: 4%');
  // A crew with no medic and no jammer gets those gaps; the planning read and the screen use the same crew.
  const bare = crew.map((o) => ({ ...o, role: 'muscle', gear: [], inventory: [] }));
  const g = planView({ ...cov.fight2, crew: bare }, 'steady');
  assert.ok(g.gaps.some((x) => /No medic/.test(x)));
  assert.ok(g.gaps.some((x) => /No jammer/.test(x)), 'nobody can jam: radio calls can only be stopped by hitting the caller');
});

test('changing a holdExtract runner\'s duty edits the stage they are in and keeps the switch to boarding', () => {
  const s = find('warehouse', (x) => inFight(x) && x.activeMission.battle.type === 'holdExtract' && x.activeMission.battle.stage === 0);
  assert.ok(s);
  const b = structuredClone(s.activeMission.battle);
  const r = b.runners[0];
  const ord = F.editOrder(b, r.id, { duty: 'hold', target: null });
  F.setOrder(b, r.id, ord);
  assert.equal(F.orderOf(b, r).duty, 'hold', 'the new duty applies now');
  b.stage = 1;
  assert.equal(F.orderOf(b, r).duty, F.defaultOrderFor(b, r).byStage[1].duty, 'the crew\'s boarding order is still there for the next stage');
  assert.ok(orderChoices(b, r).every((c) => c.label && Array.isArray(c.targets)));
});

// --- every fight draws ahead; only watched ones wait for orders --------------------------------------

test('every fight draws the round\'s threats ahead, watched or hands-off (the same seed gives the same fight at every pace)', () => {
  const s = find('data_pull', inFight);
  assert.equal(s.activeMission.battle.drawn, true, 'the threats are drawn, so the screen shows them before orders');
  assert.equal(needsPlayer(s), true);
  const next = M.runBattle(s, {});
  const am = next.activeMission;
  if (!am.done && am.battle && !am.pending) assert.equal(am.battle.drawn, true, 'and the next round is drawn when this one ends');
  const hands = find('data_pull', inFight, { opts: { callIn: 'never' } });
  assert.equal(hands.activeMission.battle.drawn, true, 'a hands-off fight draws ahead too, so pace never changes the rolls');
});

// --- the markup ---------------------------------------------------------------------------------------

test('the round screen: goal, enemies with threats, crew with orders and intents, if nothing, risk, and the four buttons; no placeholder tags', () => {
  const s = find('data_pull', waiting);
  const html = renderFightRound(s, esc, face);
  for (const part of ['class="fs"', 'Hack', 'alarm', 'deadline round', 'Enemies', 'Crew', 'If nothing changes', 'Next round', 'Change orders', 'Auto fight', 'Pull back', 'Cautious', 'Steady', 'Committed']) assert.ok(html.includes(part), part);
  for (const a of ['fs-next', 'fs-panel', 'fs-handoff', 'fs-pull-ask', 'fs-risk']) assert.ok(html.includes(`data-action="${a}"`), a);
  assert.ok(!/>\s*\[[\w.]+\]/.test(html) && !/\[[a-zA-Z.]+\] /.test(html), 'no placeholder tags');
  assert.ok(!/\{\w+\}/.test(html), 'no unfilled slots');
  assert.ok(!html.includes('Special actions'), 'no button for specials: the engine has none');
  assert.ok(/data-callin="fs:/.test(html), 'the watch screen can tell the same question redrawn');
});

test('Change orders: pick a runner and a duty, and Next round carries the change; the draft clears after', () => {
  const s = find('data_pull', waiting);
  const am = s.activeMission;
  fightScreenTap(am, 'fs-panel');
  assert.ok(renderFightRound(s, esc, face).includes('Change orders'));
  const id = am.battle.runners.find((r) => r.id !== am.battle.goal.protect).id;
  fightScreenTap(am, 'fs-sel', { id });
  fightScreenTap(am, 'fs-order', { duty: 'hold', target: '' });
  fightScreenTap(am, 'fs-risk', { id: 'committed' });
  const html = renderFightRound(s, esc, face);
  assert.ok(html.includes('(yours, next round)') && html.includes('from next round'));
  const change = takeFightChange(am);
  assert.equal(change.risk, 'committed');
  assert.equal(change.orders[id].duty, 'hold');
  const next = M.runBattle(s, change);
  const nb = next.activeMission.battle;
  assert.ok(nb, 'the fight goes on');
  assert.equal(nb.risk.level, 'committed', 'the risk change stands');
  assert.equal(F.orderOf(nb, nb.runners.find((r) => r.id === id)).duty, 'hold', 'and so does the order');
  assert.deepEqual(takeFightChange(am), {}, 'the draft is empty once taken');
});

test('call-ins: the tech under fire shows what changed, the intent lead-in, each trade-off, and Pull back; costs and trade-offs never repeat', () => {
  const s = find('data_pull', (x) => x.activeMission.pending?.id === 'techUnderFire', { to: 600 });
  assert.ok(s);
  const html = renderFightCallIn(s, esc, face);
  for (const part of ['under fire', 'The crew is set to:', 'Cover', 'Hit the caller', 'Keep current orders', 'Pull back', 'No pay. Heat +1, reputation −2.']) assert.ok(html.includes(part), part);
  assert.ok(!/\{\w+\}/.test(html));
  const view = M.describePending(s);
  const jam = view.choices.find((c) => c.id === 'jam');
  assert.equal(!!jam, html.includes('jam the radio'), 'the jam shows only when it is offered');
});

test('call-ins: the van that cannot wait shows who is outside, both options with the odds, the heat once, and no duplicate choice', () => {
  const s = find('warehouse', (x) => x.activeMission.pending?.id === 'vanCantWait', { to: 800 });
  assert.ok(s);
  const html = renderFightCallIn(s, esc, face);
  assert.ok(html.includes('Outside:'), 'who is outside');
  assert.ok(html.includes('Leave on time') && html.includes('Hold the van'));
  assert.ok(!html.includes('Keep current orders'), 'the duplicate choice is gone');
  assert.equal((html.match(/Chance anyone outside is left behind: \d+%\./g) ?? []).length, 2, 'the odds of leaving them, each way');
  assert.equal((html.match(/Heat \+1/g) ?? []).length, 2, 'the heat shows once on Hold and once on Pull back, never twice on Hold');
  const hold = html.slice(html.indexOf('Hold the van'), html.indexOf('Pull back'));
  assert.equal((hold.match(/Heat \+/g) ?? []).length, 1);
  // The odds are the round function's own: Hold changes the fight, and the read is on fixed seeds, so it does not move.
  const v = F.vanOdds(s.activeMission.battle);
  assert.deepEqual(F.vanOdds(s.activeMission.battle), v);
  assert.ok(v.hold <= v.leaveOnTime + 0.2, 'holding is not worse than leaving on time, give or take the dice');
});

test('call-ins: death\'s door names who and offers the way out and the risk, with the real pull-back cost', () => {
  const s = find('warehouse', (x) => x.activeMission.pending?.kind === 'door', { to: 600 });
  assert.ok(s);
  const html = renderFightCallIn(s, esc, face);
  assert.ok(html.includes("death&#39;s door"));
  assert.ok(html.includes(`heat +${FIGHT.retreat.heat}, reputation −${FIGHT.retreat.rep}`), 'the cost is the rule\'s own');
  assert.ok(html.includes('Keep fighting with'));
});

test('the plan screen\'s fight block: type line, enemies, gaps, orders, risk picker, and the chance of losing someone', () => {
  const tpl = templateById('warehouse');
  const crew = createNewGame({ seed: 5, startCrew: 'fresh' }).crew.slice(0, tpl.crewSize);
  const cov = coverage(tpl, crew, 'loud', { threat: tpl.threat });
  const html = renderFightPlan(esc, cov.fight2, 'steady');
  for (const part of ['The fight', 'Extract: hold until the van arrives', 'Likely enemies', 'Orders', 'hold, then board', 'Pulls out at 2 pips or fewer', 'Cautious', 'Committed', 'data-action="orders"']) assert.ok(html.includes(part), part);
  assert.match(html, /Chance of losing someone: \d+%|No chance of losing someone/);
  assert.ok(!/\{\w+\}/.test(html));
  const c = renderFightPlan(esc, cov.fight2, 'committed');
  assert.ok(c.includes('Never pulls out on its own'), 'committed shows no threshold');
});
