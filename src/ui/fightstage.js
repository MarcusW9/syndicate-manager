// The live battle view's stage (drafts/PROPOSAL-live-battle-view.md 5.2, 2026-11-12): an engine-2 fight played on the
// watch screen's own site map (ui/siteplan.js), the run's circular portrait tokens taking cover, shooting and falling.
// It reads recorded events and decides nothing: each round event carries the rules' lines (in the order playRound
// resolved them), the director's beats (core/director.js) and the stage (core/runfight.js stageOf: everyone's place on
// the site's fight spots, core/fightmap.js). Nothing here reaches core/ or the save.
//
// Two parts:
//   stageScript(prev, cue, opts)  pure: a round as a timeline of steps (re-stance, the exchange, the settle) and the
//                                 final picture. Pace changes the timing, never the final picture. Testable in node.
//   createStage(svg, deps)        the player: draws the steps on the plan's SVG.
//
// Cosmetic randomness (where a miss goes wide) is seeded (core/rng.js hash01 of the fight's seed), never the browser's own random numbers,
// so a fight looks the same on every replay. Reduced motion cuts instead of tweening.

import { hash01 } from '../core/rng.js';
import { FIGHT } from '../data/fights.js';
import { lineText } from '../core/fighttext.js';
import { portrait } from './art.js';

/** How long a step takes at each pace (Watch is 1). Resolve cuts to the end of the round. */
export const PACE_K = { watch: 1, fast: 0.6, resolve: 0 };
export const PACES = ['fast', 'watch', 'resolve'];
// Step lengths at Watch, in ms.
const MS = { enter: 900, move: 600, lean: 320, fire: 240, gap: 160, heal: 450, ping: 450, flank: 450, settle: 600, special: 200 };
const HIDDEN = new Set(['aboard', 'gone', 'fled']);

const mid = (a, b) => [Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2)];
const same = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
const enemyId = (n) => `e:${n}`;

/** A unit's place for the exchange: where it is while the round's shots fly (before the round's ending moves). */
function during(u, before, van) {
  if (u.stance === 'aboard') return before && before.stance !== 'aboard' ? mid(before.at, van) : van; // boarded this round: shot at in the open, on the way
  if (u.stance === 'gone' || u.stance === 'fled') return before?.at ?? u.at; // they leave at the end of the round
  return u.at;
}

/**
 * A round as steps. prev: what is drawn now, { [unitId]: { at, stance } } (empty on the first draw). cue: the feed's
 * cue.battle for an engine-2 event (phase, stage, lines, beats, round). opts: { pace, reduced, spent } (spent: spotlights
 * already played this fight, for the director's budget). Returns { steps, end, final, spent }: steps in time order,
 * each { t, dur, do, ... }; final, everyone's place and stance when the round is over (the same at every pace).
 */
export function stageScript(prev, cue, { pace = 'watch', reduced = false, spent = 0 } = {}) {
  const stage = cue.stage;
  const units = stage.units;
  const K = PACE_K[pace] ?? 1;
  const tween = K > 0 && !reduced;
  const ms = (x) => Math.round(x * K);
  const steps = [];
  let t = 0;
  const push = (s) => { steps.push({ t, ...s, dur: tween ? s.dur ?? 0 : 0 }); };
  const final = Object.fromEntries(Object.entries(units).map(([id, u]) => [id, { at: HIDDEN.has(u.stance) ? (u.side === 'enemy' ? u.entrance ?? u.at : stage.van) : u.at, stance: u.stance, hidden: HIDDEN.has(u.stance) }]));
  const fresh = !Object.keys(prev ?? {}).length;
  const starting = cue.phase === 'start'; // the enemies were caught where they stood; the crew runs to cover from the walk

  // A first draw (a page opens mid-fight, or nothing drawn yet): everyone where they stand, at once.
  if (fresh) {
    for (const [id, u] of Object.entries(units)) push({ do: 'place', id, at: final[id].at, stance: u.stance, hidden: final[id].hidden });
    return { steps, end: 0, final, spent };
  }

  // 1. Re-stance: arrivals run in from their door (enemies) or the van (the standby); everyone else takes the round's place.
  let moved = 0;
  for (const [id, u] of Object.entries(units)) {
    const before = prev[id];
    const at = during(u, before, stage.van);
    if (!before && starting) { push({ do: 'place', id, at, stance: u.stance, hidden: HIDDEN.has(u.stance) }); continue; }
    if (!before) {
      if (u.stance === 'fled') { push({ do: 'place', id, at: final[id].at, stance: u.stance, hidden: true }); continue; }
      push({ do: 'enter', id, fromAt: u.side === 'enemy' ? u.entrance ?? at : stage.van, at, stance: 'up', dur: ms(MS.enter) });
      moved = Math.max(moved, MS.enter);
    } else if (!same(before.at, at) && !(before.stance === 'aboard' && u.stance === 'aboard')) {
      push({ do: 'move', id, at, stance: u.stance === 'hunker' ? 'hunker' : 'up', dur: ms(MS.move) });
      moved = Math.max(moved, MS.move);
    } else if (u.stance === 'hunker' && before.stance !== 'hunker') push({ do: 'stance', id, stance: 'hunker' });
  }
  t += ms(moved);
  // Orders in motion: a protector leans towards who they cover, a medic towards the patient (a gesture, not a new spot).
  let leant = false;
  for (const [id, u] of Object.entries(units)) {
    const a = u.act;
    if (!a || !['shield', 'patch', 'stabilise'].includes(a.kind) || typeof a.target !== 'string' || !units[a.target]) continue;
    push({ do: 'lean', id, toward: a.target, kind: a.kind === 'shield' ? 'shield' : 'heal', dur: ms(MS.lean) });
    leant = true;
  }
  if (leant) t += ms(MS.lean);

  // 2. The exchange: each line in the order the rules resolved it. Beats hold where the director says.
  const lines = cue.lines ?? [];
  // The director's spotlight budget (FIGHT.spotlightBudget, the same rule as core/director.js playable) runs across the
  // whole fight: `spent` carries it from round to round; spotlights past it play as notable.
  let budget = spent;
  const cap = FIGHT.spotlightBudget[pace] ?? 0;
  const beatAfter = new Map();
  for (const b of cue.beats ?? []) {
    if (!b.lines?.length) continue;
    let tier = b.tier;
    if (tier === 'spotlight') { if (budget >= cap) tier = 'notable'; else budget += 1; }
    beatAfter.set(Math.max(...b.lines), { ...b, tier, holdMs: tier === 'notable' && b.tier === 'spotlight' ? FIGHT.beatMs.notable : b.holdMs });
  }
  const seed = stage.seed ?? 0;
  let burstFrom = null; // a special move: each attack starts where the last one landed (the rules' order is the picture's order)
  lines.forEach((l, i) => {
    const rule = l.rule ?? l.kind;
    const wide = [hash01(seed, stage.round, i, 'x') - 0.5, hash01(seed, stage.round, i, 'y') - 0.5]; // a miss goes wide, the same way every replay
    if (l.burst && !burstFrom) { push({ do: 'special', id: l.actor, key: 'stage.special', dur: ms(MS.special * 4) }); t += ms(MS.special * 4); }
    if (rule === 'attack' && l.key !== 'attackGone' && l.guard != null) {
      const from = l.burst && burstFrom ? burstFrom : l.actor;
      push({ do: 'fire', from, to: enemyId(l.guard), hit: !!l.success, fell: !!l.dropped, damage: l.damage ?? 0, wide, burst: !!l.burst, dur: ms(l.burst ? MS.fire * 1.6 : MS.fire) });
      t += ms((l.burst ? MS.fire * 1.6 : MS.fire) + MS.gap);
    } else if (rule === 'overwatch' && l.guard != null) {
      push({ do: 'fire', from: 'perch', to: enemyId(l.guard), hit: !!l.success, fell: !!l.dropped, damage: l.damage ?? 0, wide, dur: ms(MS.fire * 1.4) });
      t += ms(MS.fire * 1.4 + MS.gap);
    } else if (rule === 'shot' && l.key === 'flanked') {
      push({ do: 'flank', id: l.targetId, by: enemyId(l.guard), dur: ms(MS.flank) });
      t += ms(MS.flank);
    } else if (rule === 'shot' && l.guard != null && l.targetId) {
      const fell = l.key === 'shotDown' || l.key === 'shotDead';
      push({ do: 'fire', from: enemyId(l.guard), to: l.targetId, hit: (l.damage ?? 0) > 0, absorbed: l.key === 'shotAbsorbed', fell, dead: l.key === 'shotDead', damage: l.damage ?? 0, wide, foe: true, dur: ms(MS.fire) });
      t += ms(MS.fire + MS.gap);
    } else if (['stabilise', 'patch', 'aura'].includes(rule) && l.targetId) {
      push({ do: 'heal', id: l.targetId, by: l.actor, ok: rule === 'aura' || !!l.success, dur: ms(MS.heal) });
      t += ms(MS.heal);
    } else if (rule === 'jam' && l.actor) {
      push({ do: 'ping', id: l.actor, ok: l.key === 'jamOk', dur: ms(MS.ping) });
      t += ms(MS.ping);
    } else if (rule === 'death' && l.targetId) {
      push({ do: 'fall', id: l.targetId, dead: true, dur: ms(MS.fire) });
      t += ms(MS.fire + MS.gap);
    }
    burstFrom = l.burst && rule === 'attack' && l.guard != null ? enemyId(l.guard) : null;
    const beat = beatAfter.get(i);
    if (beat) {
      if (beat.tier === 'spotlight' && beat.key) push({ do: 'caption', key: beat.key, slots: beat.slots ?? {}, tier: beat.tier, focus: beat.focus ?? [], dur: ms(beat.holdMs ?? 0) });
      if (beat.tier !== 'routine') t += ms(beat.holdMs ?? 0);
    }
  });

  // 3. Settle: into the van, out of the fight, the fled run for their door.
  let settled = false;
  for (const [id, u] of Object.entries(units)) {
    if (!HIDDEN.has(u.stance) || prev[id]?.stance === u.stance) continue;
    push({ do: 'leave', id, at: final[id].at, stance: u.stance, dur: ms(MS.settle) });
    settled = true;
  }
  if (settled) t += ms(MS.settle);
  // Whatever the lines left out, as the rules have it (a fall nobody saw, a stance).
  for (const [id, u] of Object.entries(units)) push({ do: 'final', id, at: final[id].at, stance: u.stance, hidden: final[id].hidden });
  return { steps, end: t, final, spent: budget };
}

// --- the player ---------------------------------------------------------------------------------------

const SVGNS = 'http://www.w3.org/2000/svg';
const node = (tag, attrs = {}, text = '') => {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text) e.textContent = text;
  return e;
};
const word = (key, slots = {}) => lineText(key, slots);

/**
 * Bind a stage to the plan's SVG. deps (from ui/siteplan.js): tok(id) the crew's token, pin(id, at) to keep a runner on
 * their fight spot, frame(points) to point the camera, pace() 'watch' | 'fast' | 'resolve', reduced().
 */
export function createStage(svg, deps) {
  const fx = svg.querySelector('.sp-fx');
  const tokens = svg.querySelector('.sp-tokens');
  // Cover marks and bodies sit under the tokens.
  let ground = svg.querySelector('.fs-ground');
  if (!ground) { ground = node('g', { class: 'fs-ground' }); tokens.before(ground); }
  const foes = new Map();
  let drawn = {}; // { [unitId]: { at, stance } }
  let points = null;
  let spent = 0;
  let playing = 0;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const host = (id) => (id.startsWith('e:') ? foes.get(id) : deps.tok(id));
  const pos = (id) => (id === 'perch' ? points?.perch ?? [180, 0] : drawn[id]?.at ?? null);
  function put(g, at, ms = 0) {
    if (!g || !at) return;
    g.style.transition = ms > 0 ? `transform ${ms}ms cubic-bezier(.25,.7,.3,1), opacity 300ms` : 'none';
    g.style.transform = `translate(${at[0]}px, ${at[1]}px)`;
  }
  function foeToken(id, u, seed) {
    const g = node('g', { class: 'sp-token fs-foe', 'data-unit': id });
    g.append(node('circle', { r: 6.5, class: 'fs-foe__bg' }));
    const face = node('g', { class: 'sp-face', 'clip-path': 'url(#sp-face-clip)' });
    face.innerHTML = portrait({ id: `foe-${seed}-${u.n}`, name: `${u.kind ?? 'foe'} ${u.n}`, age: 26 + ((seed + u.n * 7) % 20) }, { size: 13 }).replace('<svg ', '<svg x="-6.5" y="-6.5" ');
    g.append(face, node('rect', { x: -7, y: -7, width: 14, height: 14, class: 'fs-foe__tint', 'clip-path': 'url(#sp-face-clip)' }), node('circle', { r: 6.5, class: 'sp-face__ring fs-foe__ring' }), node('text', { x: 6.5, y: 7, class: 'fs-foe__n' }, String(u.n)));
    tokens.append(g);
    foes.set(id, g);
    return g;
  }
  function pips(id, hp, max) {
    const g = host(id);
    if (!g || !max) return;
    let bar = g.querySelector(':scope > .fs-pips');
    if (!bar) { bar = node('g', { class: 'fs-pips' }); g.append(bar); }
    if (bar.childElementCount !== max) { bar.replaceChildren(...Array.from({ length: max }, (_, i) => node('rect', { x: -max * 2 + i * 4, y: 8.5, width: 3, height: 2 }))); }
    [...bar.children].forEach((r, i) => r.classList.toggle('is-on', i < hp));
  }
  function setStance(id, stance, hidden = false) {
    const g = host(id);
    if (!g) return;
    for (const s of ['up', 'hunker', 'down', 'dead', 'aboard', 'gone', 'fled', 'approaching']) g.classList.toggle(`fs-${s}`, stance === s);
    g.classList.toggle('is-down', stance === 'down' || stance === 'dead');
    g.classList.toggle('fs-hidden', hidden);
  }
  function body(at) { ground.append(node('ellipse', { class: 'fs-body', cx: at[0], cy: at[1] + 2, rx: 6.5, ry: 3.5 })); }
  // A low barrier where the rules give cover the site does not have (core/fightmap.js `mark`), facing the other side.
  function marks(stage) {
    ground.querySelectorAll('.fs-barrier').forEach((n) => n.remove());
    const side = (s) => Object.values(stage.units).filter((u) => u.side === s && !HIDDEN.has(u.stance)).map((u) => u.at);
    const centre = (list) => (list.length ? [list.reduce((a, p) => a + p[0], 0) / list.length, list.reduce((a, p) => a + p[1], 0) / list.length] : null);
    const crewC = centre(side('crew')); const foeC = centre(side('enemy'));
    for (const u of Object.values(stage.units)) {
      if (!u.mark || HIDDEN.has(u.stance)) continue;
      const other = u.side === 'crew' ? foeC : crewC;
      const ang = other ? Math.atan2(other[1] - u.at[1], other[0] - u.at[0]) : -Math.PI / 2;
      const [x, y] = [u.at[0] + Math.cos(ang) * 8, u.at[1] + Math.sin(ang) * 8];
      const w = u.mark === 'full' ? 16 : 13; const h = u.mark === 'full' ? 4.5 : 3.2;
      ground.append(node('rect', { class: `fs-barrier fs-barrier--${u.mark}`, x: -w / 2, y: -h / 2, width: w, height: h, transform: `translate(${x} ${y}) rotate(${(ang * 180) / Math.PI + 90})` }));
    }
  }
  function float(at, text, cls) {
    if (!at || deps.reduced()) return;
    const g = node('text', { class: `fs-float ${cls}`, x: at[0], y: at[1] - 11 }, text);
    fx.append(g);
    setTimeout(() => g.remove(), 900);
  }
  const flash = (at, cls) => { if (!at) return; const c = node('circle', { class: `sp-flash ${cls}`, cx: at[0], cy: at[1], r: 5 }); fx.append(c); setTimeout(() => c.remove(), 460); };
  function struck(g) { if (!g) return; g.classList.remove('is-struck'); void g.getBoundingClientRect(); g.classList.add('is-struck'); setTimeout(() => g.classList.remove('is-struck'), 420); }
  function tracer(a, b, s) {
    const end = s.hit || s.absorbed ? b : [b[0] + s.wide[0] * 22, b[1] + s.wide[1] * 22];
    const l = node('line', { class: `fs-tracer ${s.foe ? 'is-foe' : ''} ${s.burst ? 'is-burst' : ''}`, x1: a[0], y1: a[1], x2: end[0], y2: end[1] });
    fx.append(l);
    flash(a, 'fs-muzzle');
    setTimeout(() => l.remove(), Math.max(120, s.dur + 140));
    return end;
  }

  const ensure = (id, u, seed) => (id.startsWith('e:') ? foes.get(id) ?? foeToken(id, u, seed) : deps.tok(id));

  /** Run one step (the script says what and where). */
  function run(s, cue, stage) {
    const u = s.id ? stage.units[s.id] : null;
    switch (s.do) {
      case 'place': case 'final': {
        const g = ensure(s.id, u, stage.seed);
        if (s.do === 'place' || !same(drawn[s.id]?.at, s.at)) put(g, s.at, 0);
        if (s.id.startsWith('e:') === false) deps.pin(s.id, s.hidden ? null : s.at);
        const was = drawn[s.id]?.stance;
        drawn[s.id] = { at: s.at, stance: s.stance };
        setStance(s.id, s.stance, s.hidden);
        if ((s.stance === 'down' || s.stance === 'dead') && was !== 'down' && was !== 'dead' && s.do === 'final') body(s.at);
        if (s.do === 'place' && (s.stance === 'down' || s.stance === 'dead')) body(s.at);
        break;
      }
      case 'enter': {
        const g = ensure(s.id, u, stage.seed);
        put(g, s.fromAt, 0); setStance(s.id, 'up');
        void g?.getBoundingClientRect();
        put(g, s.at, s.dur);
        if (!s.id.startsWith('e:')) deps.pin(s.id, s.at);
        drawn[s.id] = { at: s.at, stance: 'up' };
        break;
      }
      case 'move': {
        put(host(s.id), s.at, s.dur);
        if (!s.id.startsWith('e:')) deps.pin(s.id, s.at);
        drawn[s.id] = { ...drawn[s.id], at: s.at };
        setStance(s.id, s.stance);
        break;
      }
      case 'stance': setStance(s.id, s.stance); break;
      case 'lean': {
        const a = pos(s.id); const b = pos(s.toward);
        if (!a || !b) break;
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; const k = Math.min(5, d / 3);
        const g = host(s.id);
        put(g, [a[0] + ((b[0] - a[0]) / d) * k, a[1] + ((b[1] - a[1]) / d) * k], s.dur);
        const link = node('line', { class: `fs-link fs-link--${s.kind}`, x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
        fx.append(link);
        setTimeout(() => { link.remove(); put(g, drawn[s.id]?.at, 260); }, Math.max(500, s.dur * 3));
        break;
      }
      case 'fire': {
        const a = pos(s.from); const b = pos(s.to);
        if (!a || !b) break;
        tracer(a, b, s);
        setTimeout(() => {
          const g = host(s.to);
          if (s.hit) { struck(g); flash(b, 'sp-flash--hit'); }
          else if (s.absorbed) { flash(b, 'sp-flash--zap'); float(b, word('stage.absorbed'), 'is-absorbed'); }
          else flash([b[0] + s.wide[0] * 22, b[1] + s.wide[1] * 22], 'sp-flash--miss');
          if (s.fell) { setStance(s.to, s.dead ? 'dead' : 'down'); drawn[s.to] = { ...drawn[s.to], stance: s.dead ? 'dead' : 'down' }; body(b); float(b, word(s.to.startsWith('e:') ? 'stage.out' : 'stage.down'), 'is-down'); }
          else if (s.hit) float(b, word('stage.hit'), 'is-hit');
        }, s.dur);
        break;
      }
      case 'flank': { const b = pos(s.id); flash(b, 'sp-flash--miss'); float(b, word('stage.flanked'), 'is-hit'); break; }
      case 'heal': { const b = pos(s.id); if (b) { const c = node('circle', { class: `sp-ring ${s.ok ? 'sp-ring--ok' : 'sp-ring--bad'}`, cx: b[0], cy: b[1], r: 9 }); fx.append(c); setTimeout(() => c.remove(), Math.max(400, s.dur)); } break; }
      case 'ping': { const b = pos(s.id); if (b) { const c = node('circle', { class: `fs-ping ${s.ok ? 'is-ok' : ''}`, cx: b[0], cy: b[1], r: 6 }); fx.append(c); setTimeout(() => c.remove(), Math.max(400, s.dur)); } break; }
      case 'fall': { const b = pos(s.id); setStance(s.id, s.dead ? 'dead' : 'down'); if (drawn[s.id]) drawn[s.id] = { ...drawn[s.id], stance: s.dead ? 'dead' : 'down' }; if (b) body(b); break; }
      case 'leave': { const g = host(s.id); put(g, s.at, s.dur); setTimeout(() => setStance(s.id, s.stance, true), s.dur); if (!s.id.startsWith('e:')) deps.pin(s.id, null); drawn[s.id] = { at: s.at, stance: s.stance }; break; }
      case 'special': { const b = pos(s.id); if (b) { const c = node('circle', { class: 'fs-special', cx: b[0], cy: b[1], r: 8 }); fx.append(c); setTimeout(() => c.remove(), Math.max(600, s.dur)); } deps.caption?.(word(s.key), 'special'); break; }
      case 'caption': deps.caption?.(word(s.key, s.slots), s.tier); break;
      default: break;
    }
  }

  /** Health as the event has it (pips), after the round. */
  function health(cue) {
    for (const r of cue.runners ?? []) pips(r.id, Math.max(0, r.hp), r.max);
    for (const g of cue.guards ?? []) pips(enemyId(g.n), Math.max(0, g.hp), g.max);
  }

  return {
    /** Play an event's cue (start, round, retreat, end). Resolves when the round's picture is done. */
    async play(cue) {
      const me = ++playing;
      const stage = cue.stage;
      points = stage;
      svg.classList.add('is-fight', 'is-staged');
      const pace = deps.pace();
      if (cue.phase === 'start') {
        this.reset(true);
        points = stage;
        svg.classList.add('is-fight', 'is-staged');
        for (const [id, u] of Object.entries(stage.units)) { const at = u.side === 'crew' ? deps.at(id) : null; if (at) drawn[id] = { at, stance: 'up' }; }
      }
      const script = stageScript(drawn, cue, { pace, reduced: deps.reduced(), spent });
      spent = script.spent;
      deps.frame([...Object.values(drawn).filter((d) => !HIDDEN.has(d.stance)).map((d) => d.at), ...Object.values(script.final).filter((f) => !f.hidden).map((f) => f.at)]);
      marks(stage);
      const t0 = performance.now();
      for (const s of script.steps) {
        const wait = s.t - (performance.now() - t0);
        if (wait > 4) await sleep(wait);
        if (me !== playing) return;
        run(s, cue, stage);
      }
      const rest = script.end - (performance.now() - t0);
      if (rest > 4) await sleep(rest);
      health(cue);
    },
    /** The fight as it stands, drawn at once (a page that opens mid-fight). */
    snap(cue) {
      playing += 1;
      drawn = {};
      this.reset(false);
      points = cue.stage;
      svg.classList.add('is-fight', 'is-staged');
      const script = stageScript({}, { ...cue, phase: 'start' }, { pace: 'resolve' });
      for (const s of script.steps) run(s, cue, cue.stage);
      marks(cue.stage);
      health(cue);
      deps.frame(Object.values(script.final).filter((f) => !f.hidden).map((f) => f.at));
    },
    /** The fight is over: the enemies, the bodies and the barriers go; the crew's pins are let go. */
    reset(full = true) {
      playing += 1;
      for (const g of foes.values()) g.remove();
      foes.clear();
      ground.replaceChildren();
      for (const id of Object.keys(drawn)) if (!id.startsWith('e:')) { deps.pin(id, null); setStance(id, null); deps.tok(id)?.querySelector(':scope > .fs-pips')?.remove(); }
      drawn = {};
      if (full) { spent = 0; svg.classList.remove('is-staged'); }
    },
    /** What is drawn now (tests and the camera). */
    get drawn() { return drawn; },
  };
}
