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
const { stageScript, PACES, forceSpecial } = await import('../src/ui/fightstage.js');
const { SPECIAL_MOVES, ENEMY_LOOKS } = await import('../src/data/fightLooks.js');
const { ENEMIES } = await import('../src/data/fights.js');
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
  let clock = 0;
  const all = [];
  for (const cue of cues) {
    const sc = stageScript(drawn, cue, { pace, spent, clock, ...opts });
    spent = sc.spent;
    clock = sc.clock;
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

test('a forced special move, in each of its three looks: the rules\' targets in the rules\' order, hits and falls as the dice had them, the same final picture', () => {
  // The rules side of the special move is not built (owner, 2026-11-12): force the flag on a recorded round's attacks
  // (forceSpecial, the preview's forced flag). The look is the star's (data/fightLooks.js), never the rules'.
  const two = (c) => (c.lines ?? []).filter((l) => l.rule === 'attack' && l.key !== 'attackGone' && l.guard != null).length >= 2;
  const f = fights.find((x) => x.cues.some(two));
  assert.ok(f, 'a round with two attacks');
  const i = f.cues.findIndex(two);
  const prev = play(f.cues.slice(0, i), 'watch').at(-1).final;
  const drawn = Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { at: v.at, stance: v.stance }]));
  for (const look of ['ricochet', 'slash', 'ping']) {
    const cue = forceSpecial(f.cues[i], look);
    const burst = cue.lines.filter((l) => l.burst);
    const star = burst[0].actor;
    const lengths = {};
    for (const pace of ['watch', 'fast', 'resolve']) {
      for (const reduced of [false, true]) {
        const sc = stageScript(drawn, cue, { pace, reduced });
        const at = (s) => sc.steps.indexOf(s);
        const specials = sc.steps.filter((s) => s.do === 'special');
        assert.equal(specials.length, 1, `${look}: announced once`);
        assert.equal(specials[0].look, look);
        assert.equal(specials[0].key, SPECIAL_MOVES[look].title);
        assert.equal(specials[0].slots.who, cue.runners.find((r) => r.id === star).handle, 'the title names the star');
        const fires = sc.steps.filter((s) => s.burst);
        assert.ok(at(fires[0]) > at(specials[0]), 'the move is announced before its first attack');
        assert.deepEqual(fires.map((s) => s.to), burst.map((l) => `e:${l.guard}`), `${look}: the rules' targets, in the rules' order`);
        assert.ok(fires.every((s) => s.look === look));
        if (look === 'ping') assert.ok(fires.every((s) => s.from === star), 'ping: every bolt from the star');
        else {
          assert.equal(fires[0].from, star, 'the first attack starts from the star');
          for (let k = 1; k < fires.length; k++) assert.equal(fires[k].from, fires[k - 1].to, `${look}: each from where the last landed`);
        }
        assert.deepEqual(fires.map((s) => [s.hit, s.fell]), burst.map((l) => [!!l.success && (l.damage ?? 0) > 0, !!l.dropped]), 'hits and falls as the dice had them (a hit that only cracks a plate is drawn as cracked, not as a hit)');
        const waves = sc.steps.filter((s) => s.do === 'wave');
        assert.equal(waves.length, look === 'ping' ? 1 : 0, 'only ping has a shockwave');
        if (waves.length) assert.ok(at(waves[0]) < at(fires[0]), 'the shockwave comes before the bolts');
        const ends = sc.steps.filter((s) => s.do === 'specialEnd');
        assert.equal(ends.length, 1, 'the bars go once');
        assert.ok(at(ends[0]) > at(fires.at(-1)), 'after the last attack');
        assert.deepEqual(sc.steps[at(ends[0]) + 1], { t: ends[0].t, do: 'camera', focus: null, dur: 0 }, 'and the camera pulls back');
        if (pace === 'resolve' || reduced) assert.ok(sc.steps.every((s) => s.dur === 0), `${pace}${reduced ? ', reduced' : ''}: it cuts`);
        if (pace === 'resolve') assert.ok(sc.steps.every((s) => s.t === 0), 'Resolve plays nothing out');
        // The choreography decides nothing: the same final picture as the round without the flag, at every pace.
        assert.deepEqual(sc.final, stageScript(drawn, f.cues[i], { pace }).final);
        if (!reduced) lengths[pace] = ends[0].t - specials[0].t;
        // The fight's clock (the commentary's times) counts Watch time at every pace.
        assert.equal(sc.clock, stageScript(drawn, cue, { pace: 'watch' }).clock);
      }
    }
    assert.ok(lengths.fast < lengths.watch * 0.6, `${look}: Fast plays it shorter (${lengths.fast} against ${lengths.watch} ms)`);
    assert.equal(lengths.resolve, 0);
  }
});

test('swarm knots are data, 4 to 6 bodies, only for a kind the owner chose (the planned swarm drone), and today\'s kinds stay one token each', () => {
  for (const kind of Object.keys(ENEMIES)) assert.ok(!ENEMY_LOOKS[kind], `${kind} is one token per enemy (owner, 2026-11-14)`);
  for (const [kind, look] of Object.entries(ENEMY_LOOKS)) {
    assert.ok(ENEMIES[kind] || look.planned, `${kind} is an enemy kind, or marked as planned`);
    assert.ok(look.bodies[0] >= 4 && look.bodies[1] <= 6 && look.bodies[0] <= look.bodies[1], `${kind}: 4 to 6 bodies`);
  }
  // A knot is one rules unit: the stage keys every enemy token by the rules' enemy, never one per body.
  const src = readFileSync(new URL('../src/ui/fightstage.js', import.meta.url), 'utf8');
  assert.match(src, /function knotToken\(id, u, seed, look\)[\s\S]*?foes\.set\(id, g\)/, 'one token (and one entry) per rules enemy');
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

// --- step 3: camera, ambient life, commentary -------------------------------------------------------------

const { ambientTick, AMBIENT_REACH, clockText } = await import('../src/ui/fightstage.js');

test('the commentary says each of the director\'s beats once, in order, with the same words and times at every pace', () => {
  for (const f of fights) {
    const said = (pace) => play(f.cues, pace).flatMap((x) => x.steps).filter((s) => s.do === 'say').map((s) => [s.round, s.clock, s.tier, s.texts.join(' '), s.key]);
    const watch = said('watch');
    const beats = f.cues.reduce((a, c) => a + (c.beats ?? []).filter((b) => b.lines?.length).length, 0);
    assert.equal(watch.length, beats, `${f.id} ${f.seed}: one line per beat`);
    for (let i = 1; i < watch.length; i++) assert.ok(watch[i][1] >= watch[i - 1][1], 'the clock never runs back');
    for (const pace of ['fast', 'resolve']) assert.deepEqual(said(pace).map((x) => x.slice(0, 2).concat(x.slice(3))), watch.map((x) => x.slice(0, 2).concat(x.slice(3))), `${pace}: the same commentary`);
    assert.ok(watch.every((x) => x[3].length > 0), 'every line says something');
  }
  assert.equal(clockText(2, 4200), 'R2 0:04');
  assert.equal(clockText(5, 65000), 'R5 1:05');
});

test('the camera only ever looks at units the rules hold, and pulls back after it pushes in', () => {
  for (const f of fights) {
    play(f.cues, 'watch').forEach((sc, i) => {
      const cams = sc.steps.filter((s) => s.do === 'camera');
      for (const c of cams) if (c.focus) for (const id of c.focus) assert.ok(f.cues[i].stage.units[id], `camera on ${id}`);
      if (cams.length) assert.equal(cams.at(-1).focus, null, 'the camera ends the round pulled back');
    });
  }
});

test('ambient life is seeded, stays on its spot, and its fire never lands or involves the fallen', () => {
  let shots = 0;
  for (const f of fights.slice(0, 6)) {
    let drawn = {};
    for (const sc of play(f.cues, 'watch')) {
      drawn = Object.fromEntries(Object.entries(sc.final).map(([k, v]) => [k, { at: v.at, stance: v.stance }]));
      for (let k = 0; k < 30; k++) {
        const a = ambientTick(drawn, 77, 3, k);
        assert.deepEqual(ambientTick(drawn, 77, 3, k), a, 'the same tick twice');
        for (const x of a.strafe) {
          const home = drawn[x.id];
          assert.equal(home.stance, 'up', 'only the standing shuffle');
          assert.ok(Math.abs(x.at[0] - home.at[0]) <= AMBIENT_REACH && Math.abs(x.at[1] - home.at[1]) <= AMBIENT_REACH, 'never off their spot');
        }
        if (a.tracer) {
          shots += 1;
          const from = drawn[a.tracer.from]; const to = drawn[a.tracer.to];
          for (const u of [from, to]) assert.ok(['up', 'hunker'].includes(u.stance), 'between live units only');
          assert.notEqual(a.tracer.from.startsWith('e:'), a.tracer.to.startsWith('e:'), 'across the line, not at their own side');
          assert.ok(Math.hypot(a.tracer.end[0] - to.at[0], a.tracer.end[1] - to.at[1]) >= 10, 'wide: it never lands');
        }
      }
    }
  }
  assert.ok(shots > 20, `${shots} ambient shots`);
});

test('the medic\'s aura is drawn: every aura line is one aura step (the medic, the patient, the pip it fills), and it is never a quiet ring', () => {
  let auras = 0;
  for (const f of fights) {
    const lines = f.cues.flatMap((c) => (c.lines ?? []).filter((l) => l.kind === 'aura' || l.key === 'aura'));
    const patches = f.cues.flatMap((c) => (c.lines ?? []).filter((l) => ['stabilise', 'patch'].includes(l.rule) && l.targetId && l.success)).length; // a landed patch or stabilise is the same picture
    for (const l of lines) assert.ok(l.actor && l.targetId && l.left != null && l.max, `${f.id} ${f.seed}: the aura line carries what the stage draws`);
    const steps = play(f.cues, 'watch').flatMap((sc) => sc.steps.filter((s) => s.do === 'aura'));
    assert.equal(steps.length, lines.length + patches, `${f.id} ${f.seed}: one aura step a line (and a landed patch)`);
    for (const s of steps) assert.ok(s.id && s.to && s.dur > 0);
    auras += steps.length;
    for (const sc of play(f.cues, 'resolve')) for (const s of sc.steps.filter((x) => x.do === 'aura')) assert.equal(s.dur, 0, 'Resolve cuts it');
  }
  assert.ok(auras > 0, 'some fight in the sample had a medic heal someone');
});

// --- the visual pass (2026-11-17): the effects that draw what the rules already did -----------------------------------
/** A round cue from the sample with its lines replaced: the stage draws whatever lines it is given, so each effect can be shown on its own. */
function forged(lines, mutate = null) {
  const f = fights.find((x) => x.cues.some((c) => c.phase === 'round' && Object.values(c.stage.units).filter((u) => u.side === 'enemy').length >= 2 && Object.values(c.stage.units).filter((u) => u.side === 'crew').length >= 2));
  const base = f.cues.find((c) => c.phase === 'round' && Object.values(c.stage.units).filter((u) => u.side === 'enemy').length >= 2);
  const cue = structuredClone(base);
  cue.lines = lines.map((l) => ({ kind: 'note', actor: null, targetId: null, guard: null, success: null, damage: 0, heal: 0, kit: null, dropped: false, text: '', ...l }));
  cue.beats = [];
  if (mutate) mutate(cue);
  const ens = Object.entries(cue.stage.units).filter(([, u]) => u.side === 'enemy').map(([id]) => Number(id.slice(2)));
  const crew = Object.entries(cue.stage.units).filter(([, u]) => u.side === 'crew').map(([id]) => id);
  const prev = Object.fromEntries(Object.entries(cue.stage.units).map(([id, u]) => [id, { at: u.at, stance: u.stance }]));
  return { cue, prev, ens, crew };
}
const stepsOf = (cue, prev, pace = 'watch', opts = {}) => stageScript(prev, cue, { pace, ...opts }).steps;

test('the Contagion jump is drawn: one spread step a spread line, from the body that fell to the new host, and a chain is one hop a round', () => {
  const { cue, prev, ens } = forged([]);
  const [a, b] = ens;
  cue.lines = [{ kind: 'note', rule: 'spread', key: 'spread', guard: b, jumpFrom: a, text: '' }];
  for (const pace of ['watch', 'fast']) {
    const hops = stepsOf(cue, prev, pace).filter((s) => s.do === 'spread');
    assert.equal(hops.length, 1, 'one hop');
    assert.deepEqual([hops[0].from, hops[0].to], [`e:${a}`, `e:${b}`]);
    assert.ok(hops[0].dur > 0);
  }
  assert.equal(stepsOf(cue, prev, 'resolve').find((s) => s.do === 'spread').dur, 0, 'Resolve cuts it');
  assert.equal(stepsOf(cue, prev, 'watch', { reduced: true }).find((s) => s.do === 'spread').dur, 0, 'reduced motion cuts it');
  const none = { ...cue, lines: [{ ...cue.lines[0], jumpFrom: null }] };
  assert.equal(stepsOf(none, prev).filter((s) => s.do === 'spread').length, 0, 'a line without its source draws no arc');
});

test('the infection tick is drawn: a tick step with the pip it leaves, and a tickOut that falls the host', () => {
  const { cue, prev, ens } = forged([]);
  const [a, b] = ens;
  cue.lines = [
    { kind: 'note', rule: 'tick', key: 'tick', guard: a, damage: 1, left: 2, max: 3 },
    { kind: 'note', rule: 'tick', key: 'tickOut', guard: b, damage: 1, dropped: true, left: 0, max: 1 },
  ];
  const ticks = stepsOf(cue, prev).filter((s) => s.do === 'tick');
  assert.equal(ticks.length, 2);
  assert.deepEqual(ticks.map((s) => [s.to, s.fell, s.left, s.max]), [[`e:${a}`, false, 2, 3], [`e:${b}`, true, 0, 1]]);
  assert.ok(ticks[1].dur > ticks[0].dur, 'the pop is a longer beat');
  for (const sc of [stepsOf(cue, prev, 'resolve'), stepsOf(cue, prev, 'watch', { reduced: true })]) assert.ok(sc.filter((s) => s.do === 'tick').every((s) => s.dur === 0));
});

test('the shield is drawn: a dome for each shield order, held over the exchange and let go at its end; a shielded shot flags the dome to flare', () => {
  const { cue, prev, ens, crew } = forged([]);
  const [prot, patient] = crew;
  cue.stage.units[prot].act = { kind: 'shield', target: patient };
  cue.lines = [{ kind: 'guard', rule: 'shot', key: 'shotHit', guard: ens[0], targetId: prot, damage: 1, shieldedBy: prot }];
  const steps = stepsOf(cue, prev);
  const dome = steps.filter((s) => s.do === 'dome');
  assert.equal(dome.length, 1);
  assert.deepEqual([dome[0].id, dome[0].to], [prot, patient]);
  const end = steps.findIndex((s) => s.do === 'domeEnd');
  assert.ok(end > steps.findIndex((s) => s.do === 'fire'), 'the dome stands until the shot has been drawn');
  assert.ok(steps.find((s) => s.do === 'fire').shield, 'the shot the shield takes is flagged');
  assert.equal(stepsOf(cue, prev, 'resolve').find((s) => s.do === 'dome').dur, 0);
  cue.stage.units[prot].act = null;
  assert.equal(stepsOf(cue, prev).filter((s) => s.do === 'dome' || s.do === 'domeEnd').length, 0, 'no shield order, no dome');
});

test('jam is drawn: a take sends the broken signal to each caller; a fail is a flicker and sends none', () => {
  const { cue, prev, ens, crew } = forged([]);
  cue.lines = [{ kind: 'note', rule: 'jam', key: 'jamOk', actor: crew[0], callers: [ens[0], ens[1]] }, { kind: 'note', rule: 'jam', key: 'jamFail', actor: crew[0] }];
  const [ok, fail] = stepsOf(cue, prev).filter((s) => s.do === 'ping');
  assert.deepEqual([ok.ok, ok.targets], [true, [`e:${ens[0]}`, `e:${ens[1]}`]]);
  assert.deepEqual([fail.ok, fail.targets], [false, []]);
  assert.ok(ok.dur > fail.dur, 'a take is a longer beat than a flicker');
  assert.ok(stepsOf(cue, prev, 'resolve').filter((s) => s.do === 'ping').every((s) => s.dur === 0));
});

test('the way out is drawn: an alarm step at the door, once, and the patch is a group pulse over everyone reached', () => {
  const { cue, prev, crew } = forged([]);
  cue.lines = [{ kind: 'note', rule: 'wayOut', key: 'wayOut' }, { kind: 'patch', rule: 'patch', key: 'wayOutPatch', actor: crew[0], targets: [crew[0], crew[1]] }, { kind: 'stabilise', rule: 'stabilise', key: 'stabiliseWayOut', actor: crew[0], targetId: crew[1], success: true }];
  const steps = stepsOf(cue, prev);
  const alarm = steps.filter((s) => s.do === 'alarm');
  assert.equal(alarm.length, 1);
  assert.ok(Array.isArray(alarm[0].at) && alarm[0].dur > 0);
  const patch = steps.filter((s) => s.do === 'patch');
  assert.equal(patch.length, 1);
  assert.deepEqual(patch[0].targets, [crew[0], crew[1]]);
  assert.equal(steps.filter((s) => s.do === 'aura').length, 1, 'a runner steadied on the way out gets the aura picture');
  for (const sc of [stepsOf(cue, prev, 'resolve'), stepsOf(cue, prev, 'watch', { reduced: true })]) assert.ok(sc.filter((s) => ['alarm', 'patch', 'aura'].includes(s.do)).every((s) => s.dur === 0));
});

test('the new lines reach the stage from the rules: the spread, the tick, the jam, the shielded shot and the patch keep their fields through runfight and the feed', async () => {
  const F = await import('../src/core/fight.js');
  const { feedLine } = await import('../src/core/runfight.js');
  const { makeRng } = await import('../src/core/rng.js');
  const { ENEMIES } = await import('../src/data/fights.js');
  const crew = createNewGame({ seed: 1 }).crew.slice(0, 3);
  const b = F.buildFight({ type: 'holdYard', diff: 14, threat: 3, site: 'docks', crew, approach: 'loud', risk: 'steady' }, makeRng(3));
  const foe = (n) => ({ n, kind: 'hired', hp: 10, max: 10, absorb: 0, cover: ENEMIES.hired.cover, out: false, fled: false, deck: ['aim'], di: 0, approaching: false, group: 0, infected: null });
  b.enemies = [foe(1), foe(2), foe(3)];
  b.enemies[0].infected = { tick: 10, left: 2, by: crew[0].id, round: 0, payload: 'contagion' };
  for (const r of b.runners) r.stats.combat.value = -50;
  const r = F.playRound(b, () => 0.5);
  const lines = r.lines.map(feedLine);
  const ev = { kind: 'battle', phase: 'round', round: 1, text: '', lines, guards: [], runners: [], stage: forged([]).cue.stage, beats: [] };
  const cue = feedItems([ev]).map((x) => x.cue?.battle).find(Boolean);
  const hop = cue.lines.find((l) => l.key === 'spread');
  assert.ok(hop && hop.jumpFrom === 1 && hop.guard != null, 'the spread names the body it left and the new host');
  const tick = cue.lines.find((l) => l.key === 'tickOut');
  assert.ok(tick && tick.left === 0 && tick.max === 1 && tick.guard === 1, 'the tick carries the pip it leaves');
  const probe = (l) => feedItems([{ ...ev, lines: [feedLine(l)] }]).map((x) => x.cue?.battle).find(Boolean).lines[0];
  assert.deepEqual(probe({ kind: 'jam', key: 'jamOk', actor: 'jax', callers: [2] }).callers, [2]);
  assert.equal(probe({ kind: 'shot', key: 'shotHit', enemy: 1, targetId: 'jax', shieldedBy: 'jax' }).shieldedBy, 'jax');
  assert.deepEqual(probe({ kind: 'patch', key: 'wayOutPatch', actor: 'jax', targets: ['jax', 'mei'] }).targets, ['jax', 'mei']);
});

test('a clutch finish slows its last kill, and Resolve and reduced motion still skip it', () => {
  const { cue, prev, ens } = forged([]);
  const [, b] = ens;
  cue.lines = [{ kind: 'note', rule: 'tick', key: 'burnOut', guard: b, damage: 1, dropped: true, left: 0, max: 1, status: 'burning' }];
  cue.beats = [{ tier: 'notable', lines: [0], focus: [], key: null, slots: {}, holdMs: FIGHT.beatMs.notable }];
  const plain = stepsOf(cue, prev).find((s) => s.do === 'tick');
  cue.beats = [{ tier: 'spotlight', lines: [0], focus: [], key: 'director.clutchBurn', slots: { who: 'X' }, holdMs: FIGHT.beatMs.spotlight }];
  const clutch = stepsOf(cue, prev).find((s) => s.do === 'tick');
  assert.ok(clutch.dur > plain.dur * 2, 'about two and a half times as long');
  for (const sc of [stepsOf(cue, prev, 'resolve'), stepsOf(cue, prev, 'watch', { reduced: true })]) assert.ok(sc.filter((s) => s.do === 'tick').every((s) => s.dur === 0));
});

test('a runner falling is a big moment: a death pushes in, slows the shot and holds their name; death\'s door is lighter; an enemy falling is not', () => {
  const { cue, prev, ens, crew } = forged([]);
  const shot = (key) => ({ kind: 'guard', rule: 'shot', key, guard: ens[0], targetId: crew[0], damage: 3 });
  cue.lines = [shot('shotHit')];
  const plain = stepsOf(cue, prev).find((s) => s.do === 'fire');
  cue.lines = [shot('shotDead')];
  const dead = stepsOf(cue, prev);
  const order = dead.map((s) => s.do).filter((d) => ['fallIn', 'fire', 'fallHold', 'fallEnd'].includes(d));
  assert.deepEqual(order, ['fallIn', 'fire', 'fallHold', 'fallEnd'], 'in, the shot, the hold, out');
  assert.equal(dead.find((s) => s.do === 'fallIn').kind, 'dead');
  assert.ok(dead.find((s) => s.do === 'fire').dur >= plain.dur * 5, 'the killing shot plays slowly');
  assert.ok(dead.findIndex((s) => s.do === 'camera' && s.focus?.includes(crew[0])) < dead.findIndex((s) => s.do === 'fire'), 'the camera pushes in on them before the shot');
  assert.ok(dead.findIndex((s) => s.do === 'camera' && s.focus === null) > dead.findIndex((s) => s.do === 'fallEnd'), 'and pulls back after');
  cue.lines = [shot('shotDown')];
  const door = stepsOf(cue, prev);
  assert.equal(door.find((s) => s.do === 'fallIn').kind, 'door');
  const hold = (sc) => sc.find((s) => s.do === 'fallHold').dur + sc.find((s) => s.do === 'fallIn').dur + sc.find((s) => s.do === 'fire').dur;
  assert.ok(hold(door) < hold(dead) / 2, "death's door is the lighter beat");
  for (const sc of [stepsOf(cue, prev, 'resolve'), stepsOf(cue, prev, 'watch', { reduced: true })]) assert.ok(sc.filter((s) => s.do.startsWith('fall') || s.do === 'fire').every((s) => s.dur === 0), 'Resolve and reduced motion cut');
  cue.lines = [{ kind: 'attack', rule: 'attack', key: 'attackOut', actor: crew[0], guard: ens[0], targetId: ens[0], damage: 9, dropped: true }];
  assert.equal(stepsOf(cue, prev).filter((s) => s.do === 'fallIn').length, 0, 'an enemy going down stays quick');
});
