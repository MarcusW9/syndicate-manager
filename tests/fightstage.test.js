// The live battle view's stage (ui/fightstage.js stageScript, drafts/PROPOSAL-live-battle-view.md 5.2): a round's recorded
// lines played as steps on the site map. The picture shows the rules' decisions and decides nothing: pace changes the
// timing, never the final picture; every shot the rules rolled is drawn once, in the rules' order; no unit the rules do
// not hold; a special move's attacks are drawn in the rules' order and only at the rules' targets. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };

const { createNewGame } = await import('../src/core/state.js');
const M = await import('../src/core/mission.js');
const { addOffer, templateById } = await import('../src/core/jobs.js');
const { autoStep } = await import('../src/core/autorun.js');
const { runFight, fightAnswer } = await import('../src/core/runfight.js');
const { feedItems } = await import('../src/core/feed.js');
const { stageScript, PACES } = await import('../src/ui/fightstage.js');
const { renderFightRound, fightPace } = await import('../src/ui/fightscreen.js');
const { FIGHT } = await import('../src/data/fights.js');

function atFight(seed, templateId) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(templateId).crewSize).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady' });
  for (let g = 0; g < 400 && !s.activeMission.done; g++) {
    if (s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle') return s;
    const next = autoStep(s, { force: true });
    if (next === s) throw new Error('stuck');
    s = next;
  }
  return null;
}
function playOut(s) {
  for (let g = 0; g < 80 && s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle'; g++) {
    const am = s.activeMission;
    s = am.pending ? M.resolvePending(s, am.pending.kind === 'dilemma' ? fightAnswer(am).id : 'out') : runFight(s);
  }
  return s;
}

/** Every recorded engine-2 fight as its feed cues (start, rounds, end), the way the watch screen hands them to the plan. */
const fights = (() => {
  const out = [];
  for (const id of ['data_pull', 'quiet_hours', 'warehouse', 'protection']) {
    for (let seed = 1; seed <= 4; seed++) {
      const s0 = atFight(seed, id);
      if (s0?.activeMission.battle?.engine !== 2) continue;
      const s = playOut(s0);
      const cues = feedItems(s.activeMission.events).map((x) => x.cue?.battle).filter((c) => c?.stage);
      if (cues.length > 1) out.push({ id, seed, cues });
    }
  }
  return out;
})();

/** Play a fight's cues through the script at a pace, carrying the picture from round to round as the player does. */
function play(cues, pace, opts = {}) {
  let drawn = {};
  let spent = 0;
  const all = [];
  for (const cue of cues) {
    const sc = stageScript(drawn, cue, { pace, spent, ...opts });
    spent = sc.spent;
    drawn = Object.fromEntries(Object.entries(sc.final).map(([k, v]) => [k, { at: v.at, stance: v.stance }]));
    all.push(sc);
  }
  return all;
}

test('every engine-2 fight carries a stage on its events', () => {
  assert.ok(fights.length >= 6, `${fights.length} fights`);
  for (const f of fights) assert.equal(f.cues[0].phase, 'start');
});

test('pace never changes the picture: the same final places and stances at Watch, Fast, Resolve and with reduced motion', () => {
  for (const f of fights) {
    const base = play(f.cues, 'watch').map((x) => x.final);
    for (const pace of PACES) assert.deepEqual(play(f.cues, pace).map((x) => x.final), base, `${f.id} ${f.seed}: ${pace}`);
    assert.deepEqual(play(f.cues, 'watch', { reduced: true }).map((x) => x.final), base, `${f.id} ${f.seed}: reduced motion`);
  }
});

test('the final picture is the rules\' picture: every unit where the stage puts it, with its stance', () => {
  for (const f of fights) {
    play(f.cues, 'watch').forEach((sc, i) => {
      const { units, van } = f.cues[i].stage;
      assert.deepEqual(Object.keys(sc.final).sort(), Object.keys(units).sort(), 'one picture unit per rules unit');
      for (const [id, u] of Object.entries(units)) {
        assert.equal(sc.final[id].stance, u.stance, `${f.id} ${id}`);
        const hidden = ['aboard', 'gone', 'fled'].includes(u.stance);
        assert.deepEqual(sc.final[id].at, hidden ? (u.side === 'enemy' ? u.entrance ?? u.at : van) : u.at);
      }
    });
  }
});

test('every shot the rules rolled is drawn once, in the order the rules resolved them, between units the rules hold', () => {
  let fires = 0;
  for (const f of fights) {
    play(f.cues, 'watch').forEach((sc, i) => {
      const cue = f.cues[i];
      const ids = new Set([...Object.keys(cue.stage.units), 'perch']);
      for (const s of sc.steps) for (const k of ['id', 'from', 'to', 'toward', 'by']) if (s[k] != null) assert.ok(ids.has(s[k]), `${s.do} names ${s[k]}, not a unit of the fight`);
      const want = (cue.lines ?? []).filter((l) => (l.rule === 'attack' && l.key !== 'attackGone') || l.rule === 'overwatch' || (l.rule === 'shot' && l.key !== 'flanked' && l.targetId))
        .map((l) => (l.rule === 'shot' ? `e:${l.guard}>${l.targetId}` : `>e:${l.guard}`));
      const got = sc.steps.filter((s) => s.do === 'fire').map((s) => (s.foe ? `${s.from}>${s.to}` : `>${s.to}`));
      assert.deepEqual(got, want, `${f.id} ${f.seed} round ${cue.round}`);
      const times = sc.steps.map((s) => s.t);
      assert.deepEqual(times, [...times].sort((a, b) => a - b), 'steps in time order');
      for (const s of sc.steps.filter((x) => x.do === 'fire')) {
        const line = cue.lines.find((l) => (s.foe ? `e:${l.guard}` === s.from && l.targetId === s.to : `e:${l.guard}` === s.to));
        assert.ok(line, 'a fire step comes from a line');
      }
      fires += got.length;
    });
  }
  assert.ok(fires > 30, `${fires} shots drawn`);
});

test('Resolve cuts to the end and reduced motion never tweens', () => {
  for (const f of fights.slice(0, 4)) {
    for (const sc of play(f.cues, 'resolve')) { assert.equal(sc.end, 0); assert.ok(sc.steps.every((s) => s.t === 0 && s.dur === 0)); }
    for (const sc of play(f.cues, 'watch', { reduced: true })) assert.ok(sc.steps.every((s) => s.dur === 0), 'no tween');
  }
});

test('Fast takes about six tenths of Watch, and the director\'s holds are there', () => {
  const f = fights.find((x) => x.cues.length > 2);
  const watch = play(f.cues, 'watch').reduce((a, x) => a + x.end, 0);
  const fast = play(f.cues, 'fast').reduce((a, x) => a + x.end, 0);
  assert.ok(watch > 0 && Math.abs(fast / watch - 0.6) < 0.05, `fast ${fast} watch ${watch}`);
});

test('the spotlight budget holds across a fight', () => {
  for (const f of fights) {
    for (const pace of ['watch', 'fast']) {
      const captions = play(f.cues, pace).flatMap((x) => x.steps).filter((s) => s.do === 'caption').length;
      assert.ok(captions <= FIGHT.spotlightBudget[pace], `${f.id}: ${captions} spotlights at ${pace}`);
    }
  }
});

test('a forced special move: its attacks are drawn in the rules\' order, each from where the last landed, at the rules\' targets only', () => {
  // The rules side of the special move is not built (owner, 2026-11-12): force the flag on a recorded round's attacks.
  const f = fights.find((x) => x.cues.some((c) => (c.lines ?? []).filter((l) => l.rule === 'attack' && l.key !== 'attackGone').length >= 2));
  assert.ok(f, 'a round with two attacks');
  const i = f.cues.findIndex((c) => (c.lines ?? []).filter((l) => l.rule === 'attack' && l.key !== 'attackGone').length >= 2);
  const cue = structuredClone(f.cues[i]);
  const actor = cue.lines.find((l) => l.rule === 'attack' && l.key !== 'attackGone').actor;
  const burst = cue.lines.filter((l) => l.rule === 'attack' && l.key !== 'attackGone');
  burst.forEach((l) => { l.burst = true; l.actor = actor; });
  const prev = play(f.cues.slice(0, i), 'watch').at(-1).final;
  const drawn = Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { at: v.at, stance: v.stance }]));
  for (const pace of ['watch', 'fast', 'resolve']) {
    const sc = stageScript(drawn, cue, { pace });
    const special = sc.steps.findIndex((s) => s.do === 'special');
    const fires = sc.steps.filter((s) => s.burst);
    assert.ok(special >= 0 && sc.steps.indexOf(fires[0]) > special, 'the special move is announced first');
    assert.deepEqual(fires.map((s) => s.to), burst.map((l) => `e:${l.guard}`), 'the rules\' targets, in the rules\' order');
    assert.equal(fires[0].from, actor, 'the first attack starts from the star');
    for (let k = 1; k < fires.length; k++) assert.equal(fires[k].from, fires[k - 1].to, 'each next attack starts where the last landed');
    assert.deepEqual(fires.map((s) => [s.hit, s.fell]), burst.map((l) => [!!l.success, !!l.dropped]), 'hits and falls as the dice had them');
    // The same final picture as the round without the flag: the choreography decides nothing.
    assert.deepEqual(sc.final, stageScript(drawn, f.cues[i], { pace }).final);
  }
});

test('the stage draws no unseeded randomness', () => {
  const src = readFileSync(new URL('../src/ui/fightstage.js', import.meta.url), 'utf8');
  assert.ok(!/Math\.random/.test(src), 'no Math.random in the stage');
  const f = fights[0];
  assert.deepEqual(play(f.cues, 'watch'), play(f.cues, 'watch'), 'the same fight looks the same every replay');
});

test('the round screen offers the pace as three 44px chips; Watch or Fast is a viewing preference, Resolve hands the fight off', () => {
  const s = atFight(1, 'warehouse') ?? atFight(2, 'warehouse');
  const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  store.clear();
  assert.equal(fightPace(s.activeMission), 'fast', 'Fast by default');
  let html = renderFightRound(s, esc);
  assert.match(html, /data-action="fs-pace" data-id="fast" aria-pressed="true"/);
  assert.match(html, /data-action="fs-pace" data-id="watch" aria-pressed="false"/);
  assert.match(html, /data-action="fs-handoff" data-id="resolve"/);
  store.set('syndicate-pref-fight-watch', '1');
  assert.equal(fightPace(s.activeMission), 'watch');
  html = renderFightRound(s, esc);
  assert.match(html, /data-id="watch" aria-pressed="true"/);
  const css = readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.fs-pace__chip \{ min-height: 44px;/);
  const handed = structuredClone(s); handed.activeMission.battle.auto = true;
  assert.equal(fightPace(handed.activeMission), 'resolve');
  assert.ok(!JSON.stringify(s).includes('fight-watch'), 'the pace is not in the save');
});
