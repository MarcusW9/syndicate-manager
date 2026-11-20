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
import { SPECIAL_MOVES, SPECIAL_FAST_CUT, SPECIAL_LOOK_DEFAULT, ENEMY_LOOKS } from '../data/fightLooks.js';

/** How long a step takes at each pace (Watch is 1). Resolve cuts to the end of the round. */
export const PACE_K = { watch: 1, fast: 0.6, resolve: 0 };
export const PACES = ['fast', 'watch', 'resolve'];
// Step lengths at Watch, in ms.
const MS = { enter: 900, move: 600, lean: 320, fire: 240, gap: 160, heal: 450, aura: 1100, spread: 900, tick: 560, tickOut: 700, dome: 420, patch: 1100, alarm: 1800, jam: 650, ping: 450, flank: 450, settle: 600 };
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
export function stageScript(prev, cue, { pace = 'watch', reduced = false, spent = 0, clock = 0 } = {}) {
  const stage = cue.stage;
  const units = stage.units;
  const K = PACE_K[pace] ?? 1;
  const tween = K > 0 && !reduced;
  const ms = (x) => Math.round(x * K);
  const steps = [];
  let t = 0;
  let tw = clock; // the fight's clock, in Watch time whatever the pace, so the commentary's times read the same at every pace
  const push = (s) => { steps.push({ t, ...s, dur: tween ? s.dur ?? 0 : 0 }); };
  const adv = (x, k = 1) => { t += ms(x * k); tw += x; }; // k: a shorter play at this pace (a special move in Fast); the clock still counts Watch time
  const final = Object.fromEntries(Object.entries(units).map(([id, u]) => [id, { at: HIDDEN.has(u.stance) ? (u.side === 'enemy' ? u.entrance ?? u.at : stage.van) : u.at, stance: u.stance, hidden: HIDDEN.has(u.stance) }]));
  const fresh = !Object.keys(prev ?? {}).length;
  const starting = cue.phase === 'start'; // the enemies were caught where they stood; the crew runs to cover from the walk

  // A first draw (a page opens mid-fight, or nothing drawn yet): everyone where they stand, at once.
  if (fresh) {
    for (const [id, u] of Object.entries(units)) push({ do: 'place', id, at: final[id].at, stance: u.stance, hidden: final[id].hidden });
    return { steps, end: 0, final, spent, clock };
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
  adv(moved);
  // Orders in motion: a protector leans towards who they cover, a medic towards the patient (a gesture, not a new spot).
  let leant = false;
  let domes = false; // a shield's dome stands over the exchange and goes at its end
  for (const [id, u] of Object.entries(units)) {
    const a = u.act;
    if (!a || !['shield', 'patch', 'stabilise'].includes(a.kind) || typeof a.target !== 'string' || !units[a.target]) continue;
    push({ do: 'lean', id, toward: a.target, kind: a.kind === 'shield' ? 'shield' : 'heal', dur: ms(MS.lean) });
    if (a.kind === 'shield') { push({ do: 'dome', id, to: a.target, dur: ms(MS.dome) }); domes = true; }
    leant = true;
  }
  if (leant) adv(MS.lean);

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
  const beatAt = new Map();
  for (const b of beatAfter.values()) beatAt.set(Math.min(...b.lines), b);
  const unitOf = (f) => (typeof f === 'number' ? enemyId(f) : f);
  const seed = stage.seed ?? 0;
  // A special move (lines flagged `burst`, a run of them in the rules' order): its look is the star's (data/fightLooks.js,
  // core/fightmap.js specialLook), never the rules'. It only draws the rules' attack lines: who, in what order, hit or not.
  let special = null; // { star, look, mv, cut, from }
  const cut = pace === 'fast' ? SPECIAL_FAST_CUT : 1;
  const handle = (id) => (cue.runners ?? []).find((r) => r.id === id)?.handle ?? id;
  lines.forEach((l, i) => {
    const rule = l.rule ?? l.kind;
    // Commentary: the director's beat, said as it starts (the strip and the log read it; a fight can be followed without watching).
    const opening = beatAt.get(i);
    if (opening) {
      push({ do: 'say', clock: tw, round: cue.round ?? stage.round, tier: opening.tier, key: opening.tier === 'spotlight' ? opening.key ?? null : null, slots: opening.slots ?? {}, texts: opening.lines.map((k) => lines[k]?.text).filter(Boolean) });
      // A spotlight pushes the camera in on who it is about; it pulls back once the beat has held.
      const focus = (opening.focus ?? []).map(unitOf).filter((f) => units[f]);
      if (opening.tier === 'spotlight' && focus.length) push({ do: 'camera', focus });
    }
    const wide = [hash01(seed, stage.round, i, 'x') - 0.5, hash01(seed, stage.round, i, 'y') - 0.5]; // a miss goes wide, the same way every replay
    if (l.burst && !special) {
      const look = SPECIAL_MOVES[units[l.actor]?.look] ? units[l.actor].look : SPECIAL_LOOK_DEFAULT;
      const mv = SPECIAL_MOVES[look];
      let k = i; const targets = [];
      while (lines[k]?.burst) { if ((lines[k].rule ?? lines[k].kind) === 'attack' && lines[k].guard != null && units[enemyId(lines[k].guard)]) targets.push(enemyId(lines[k].guard)); k += 1; }
      special = { star: l.actor, look, mv, from: l.actor };
      const slots = { who: handle(l.actor) };
      push({ do: 'special', id: l.actor, look, key: mv.title, slots, targets, dur: ms(mv.lead * cut) });
      push({ do: 'say', clock: tw, round: cue.round ?? stage.round, tier: 'special', key: mv.title, slots, texts: [] });
      if (units[l.actor]) push({ do: 'camera', focus: [l.actor, ...targets] });
      adv(mv.lead, cut);
      if (mv.wave) { push({ do: 'wave', id: l.actor, targets, dur: ms(mv.wave * cut) }); adv(mv.wave, cut); }
    }
    if (rule === 'attack' && l.key !== 'attackGone' && l.guard != null) {
      const sp = l.burst ? special : null;
      // Ricochet and slash: each attack from where the last landed. Ping: every bolt from the star.
      const from = sp ? (sp.look === 'ping' ? sp.star : sp.from) : l.actor;
      const to = enemyId(l.guard);
      if (sp && sp.look !== 'ping' && units[from] && units[to]) push({ do: 'camera', focus: [from, to] });
      const fly = sp ? MS.fire * sp.mv.slow : MS.fire;
      push({ do: 'fire', from, to, hit: !!l.success && (l.damage ?? 0) > 0, cracked: !!l.cracked, fell: !!l.dropped, pierced: !!l.pierced, damage: l.damage ?? 0, amount: l.hpDamage ?? 0, left: l.hpLeft ?? null, strong: !!l.strong, wide, ...(sp ? { burst: true, look: sp.look, star: sp.star } : {}), dur: ms(fly * (sp ? cut : 1)) });
      adv(fly + (sp ? sp.mv.gap : MS.gap), sp ? cut : 1);
      if (sp) sp.from = to;
    } else if (rule === 'overwatch' && l.guard != null) {
      push({ do: 'fire', from: 'perch', to: enemyId(l.guard), hit: !!l.success && (l.damage ?? 0) > 0, cracked: !!l.cracked, fell: !!l.dropped, damage: l.damage ?? 0, amount: l.hpDamage ?? 0, left: l.hpLeft ?? null, strong: !!l.strong, wide, dur: ms(MS.fire * 1.4) });
      adv(MS.fire * 1.4 + MS.gap);
    } else if (rule === 'shot' && l.key === 'flanked') {
      push({ do: 'flank', id: l.targetId, by: enemyId(l.guard), dur: ms(MS.flank) });
      adv(MS.flank);
    } else if (rule === 'shot' && l.guard != null && l.targetId) {
      const fell = l.key === 'shotDown' || l.key === 'shotDead';
      push({ do: 'fire', from: enemyId(l.guard), to: l.targetId, hit: (l.damage ?? 0) > 0, absorbed: l.key === 'shotAbsorbed', ...(l.shieldedBy ? { shield: true } : {}), fell, dead: l.key === 'shotDead', damage: l.damage ?? 0, amount: l.hpDamage ?? 0, left: l.hpLeft ?? null, wide, foe: true, dur: ms(MS.fire) });
      adv(MS.fire + MS.gap);
    } else if (['stabilise', 'patch', 'aura'].includes(rule) && l.targetId) {
      // A medic's help that lands (the aura, a patch, a stabilise) is one picture: the medic glows and flashes, an orb crosses to the patient, the pip fills. A miss is the red ring.
      if (rule === 'aura' || l.success) {
        push({ do: 'aura', id: l.actor, to: l.targetId, left: l.hpLeft ?? l.left, leftExact: l.hpLeft != null, max: l.max, amount: l.hpHeal ?? 0, dur: ms(MS.aura) });
        adv(MS.aura);
      } else {
        push({ do: 'heal', id: l.targetId, by: l.actor, ok: false, dur: ms(MS.heal) });
        adv(MS.heal);
      }
    } else if (rule === 'jam' && l.actor) {
      const ok = l.key === 'jamOk';
      const callers = (l.callers ?? []).map(enemyId).filter((c) => units[c]);
      push({ do: 'ping', id: l.actor, ok, targets: ok ? callers : [], dur: ms(ok && callers.length ? MS.jam : MS.ping) });
      adv(ok && callers.length ? MS.jam : MS.ping);
    } else if (rule === 'spread' && l.guard != null && l.jumpFrom != null && units[enemyId(l.guard)] && units[enemyId(l.jumpFrom)]) {
      // The Contagion jumps: from the body that fell to the next host, one hop to a line.
      push({ do: 'spread', from: enemyId(l.jumpFrom), to: enemyId(l.guard), dur: ms(MS.spread) });
      adv(MS.spread);
    } else if (rule === 'tick' && l.guard != null && units[enemyId(l.guard)]) {
      const fell = l.key === 'tickOut' || l.key === 'burnOut';
      push({ do: 'tick', to: enemyId(l.guard), fell, burn: l.key === 'burnTick' || l.key === 'burnOut', left: fell ? 0 : l.hpLeft ?? l.left, leftExact: l.hpLeft != null, max: l.max, amount: l.hpDamage ?? 0, dur: ms(fell ? MS.tickOut : MS.tick) });
      adv(fell ? MS.tickOut : MS.tick);
    } else if (rule === 'wayOut') {
      // The hack is done and the alarm is up: red rings at the door the arrivals will come in by.
      const door = Object.values(units).find((u) => u.side === 'enemy' && u.entrance)?.entrance ?? stage.target ?? stage.van;
      push({ do: 'alarm', at: door, count: l.slots?.n ?? null, dur: ms(MS.alarm) });
      adv(MS.alarm);
    } else if (rule === 'patch' && l.actor && !l.targetId && units[l.actor]) {
      // The medic's hands on the way out: the aura, then a soft pulse over everyone reached.
      push({ do: 'patch', id: l.actor, targets: (l.targets ?? []).filter((x) => units[x]), dur: ms(MS.patch) });
      adv(MS.patch);
    } else if (rule === 'death' && l.targetId) {
      push({ do: 'fall', id: l.targetId, dead: true, dur: ms(MS.fire) });
      adv(MS.fire + MS.gap);
    }
    if (special && !lines[i + 1]?.burst) { // the special move is over: a hold (Watch only), the bars go, the camera pulls back
      adv(special.mv.after, pace === 'fast' ? 0 : 1);
      push({ do: 'specialEnd', id: special.star, look: special.look, hold: pace === 'fast' ? 0 : special.mv.after });
      push({ do: 'camera', focus: null });
      special = null;
    }
    const beat = beatAfter.get(i);
    if (beat) {
      if (beat.tier === 'spotlight' && beat.key) push({ do: 'caption', key: beat.key, slots: beat.slots ?? {}, tier: beat.tier, focus: beat.focus ?? [], dur: ms(beat.holdMs ?? 0) });
      if (beat.tier !== 'routine') adv(beat.holdMs ?? 0);
      if (beat.tier === 'spotlight' && (beat.focus ?? []).some((f) => units[unitOf(f)])) push({ do: 'camera', focus: null });
    }
  });

  if (domes) push({ do: 'domeEnd' });
  // 3. Settle: into the van, out of the fight, the fled run for their door.
  let settled = false;
  for (const [id, u] of Object.entries(units)) {
    if (!HIDDEN.has(u.stance) || prev[id]?.stance === u.stance) continue;
    push({ do: 'leave', id, at: final[id].at, stance: u.stance, dur: ms(MS.settle) });
    settled = true;
  }
  if (settled) adv(MS.settle);
  // Whatever the lines left out, as the rules have it (a fall nobody saw, a stance).
  for (const [id, u] of Object.entries(units)) push({ do: 'final', id, at: final[id].at, stance: u.stance, hidden: final[id].hidden });
  return { steps, end: t, final, spent: budget, clock: tw };
}

// --- ambient life -------------------------------------------------------------------------------------
// Between decisions nobody stands still (the proposal 5.2): a small seeded shuffle round their own spot (never off it, so
// the cover shown stays the rules'), and now and then suppressive fire between two live units that goes wide and leaves
// no mark, so it implies no result. Quieter than the real events; off with reduced motion and at Resolve.

export const AMBIENT_REACH = 2; // how far a unit shuffles from its spot, either way
export const AMBIENT_MS = 480; // one tick at Watch

/** One tick of ambient life, pure: who shuffles where, and the one suppressive shot (or none). drawn: { [id]: { at, stance } }. */
export function ambientTick(drawn, seed, round, k) {
  const live = Object.entries(drawn).filter(([, d]) => d.at && (d.stance === 'up' || d.stance === 'hunker')).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const h = (...p) => hash01(seed, round, k, ...p);
  const strafe = live.filter(([id, d]) => d.stance === 'up' && h(id, 'go') < 0.5)
    .map(([id, d]) => ({ id, at: [d.at[0] + (h(id, 'x') - 0.5) * 2 * AMBIENT_REACH, d.at[1] + (h(id, 'y') - 0.5) * 2 * AMBIENT_REACH] }));
  const crew = live.filter(([id]) => !id.startsWith('e:'));
  const foes = live.filter(([id]) => id.startsWith('e:'));
  let tracer = null;
  if (crew.length && foes.length && h('fire') < 0.6) {
    const foeShoots = h('side') < 0.5;
    const [a, b] = foeShoots ? [foes, crew] : [crew, foes];
    const from = a[Math.floor(h('from') * a.length)];
    const to = b[Math.floor(h('to') * b.length)];
    const ang = h('ang') * Math.PI * 2;
    const off = 10 + h('off') * 8; // always wide: ambient fire never lands
    tracer = { from: from[0], to: to[0], foe: foeShoots, end: [to[1].at[0] + Math.cos(ang) * off, to[1].at[1] + Math.sin(ang) * off] };
  }
  return { strafe, tracer };
}

/** The commentary's time stamp: the round and the fight's clock (Watch time), "R2 0:04". */
export const clockText = (round, ms) => { const sec = Math.floor(ms / 1000); return `R${round} ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };

// --- the player ---------------------------------------------------------------------------------------

const SVGNS = 'http://www.w3.org/2000/svg';
const node = (tag, attrs = {}, text = '') => {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text) e.textContent = text;
  return e;
};
const word = (key, slots = {}) => lineText(key, slots);
// Preview only (scripts/preview-livebattle.mjs sets it; the game never does): { knots: [kinds] } draws those kinds as knots,
// { special: look } forces a special move on a round's attacks. It changes a copy of the cue the stage draws, never core or the save.
const preview = () => (typeof window !== 'undefined' ? window.__stagePreview ?? null : null);
/** A copy of a round's cue with its attacks flagged as one runner's special move (the preview's forced flag; tests do the same). */
export function forceSpecial(cue, look) {
  const c = structuredClone(cue);
  const hits = (c.lines ?? []).filter((l) => (l.rule ?? l.kind) === 'attack' && l.key !== 'attackGone' && l.guard != null);
  if (hits.length < 2) return cue;
  const star = hits[0].actor;
  hits.forEach((l) => { l.burst = true; l.actor = star; });
  // The attacks run together in the rules' order: move them to where the first one was, keeping their order.
  const at = c.lines.indexOf(hits[0]);
  c.lines = [...c.lines.slice(0, at).filter((l) => !hits.includes(l)), ...hits, ...c.lines.slice(at).filter((l) => !hits.includes(l))];
  c.beats = []; // the director's indices would point at moved lines
  if (c.stage?.units?.[star]) c.stage.units[star].look = look;
  return c;
}

/** Preview only (scripts/preview-livebattle.mjs --effect): a copy of a round's cue with the lines of one effect forged onto its units, so the effect can be seen without arranging the rules for it. The stage draws it; no rule is touched. */
export function forceEffect(cue, kind) {
  const c = structuredClone(cue);
  const units = c.stage?.units ?? {};
  const foes = Object.keys(units).filter((id) => id.startsWith('e:')).map((id) => Number(id.slice(2)));
  const crew = Object.keys(units).filter((id) => !id.startsWith('e:'));
  if (foes.length < 2 || crew.length < 2) return cue;
  const L = (l) => ({ kind: 'note', actor: null, targetId: null, guard: null, success: null, damage: 0, heal: 0, kit: null, dropped: false, text: '', ...l });
  const guard = (n) => (c.guards ?? []).find((g) => g.n === n);
  const [a, b] = foes;
  const sick = (n, on) => { const g = guard(n); if (g) g.infected = on || undefined; };
  c.beats = [];
  if (kind === 'spread') {
    c.lines = [L({ rule: 'tick', key: 'tickOut', guard: a, damage: 1, hpDamage: 10, dropped: true, left: 0, max: 1 }), L({ rule: 'spread', key: 'spread', guard: b, jumpFrom: a })];
    units[`e:${a}`].stance = 'down'; const g = guard(a); if (g) { g.out = true; g.hp = 0; g.infected = undefined; } sick(b, true);
  } else if (kind === 'tick') {
    const g = guard(a); const max = Math.max(3, g?.max ?? 3);
    if (g) { g.max = max; g.hp = max - 1; g.infected = true; }
    c.lines = [L({ rule: 'tick', key: 'tick', guard: a, damage: 1, hpDamage: 10, left: max - 1, max })];
  } else if (kind === 'statuses') {
    // Part B (2026-11-19): every new status at once, one a body and the rest on the last body (so two can be seen together), the first one's burn ticking.
    const list = ['burning', 'marked', 'exposed', 'shaken'];
    foes.forEach((n, i) => { const g = guard(n); if (g && i < list.length) g.st = i === foes.length - 1 ? list.slice(i) : [list[i]]; });
    const g = guard(a); const max = Math.max(3, g?.max ?? 3);
    if (g) { g.max = max; g.hp = max - 1; }
    c.lines = [L({ rule: 'tick', key: 'burnTick', guard: a, damage: 1, hpDamage: 10, left: max - 1, max })];
  } else if (kind === 'breach') {
    // The breaching charge (2026-11-20): one body exposed, then a crew shot that ignores its plate.
    const g = guard(a); const max = Math.max(3, g?.max ?? 3);
    if (g) { g.st = ['exposed']; g.max = max; g.hp = max - 2; }
    c.lines = [L({ kind: 'crew', rule: 'attack', key: 'attackHit', actor: crew[0], guard: a, success: true, damage: 2, hpDamage: 20, hpLeft: (max - 2) * 10, pierced: true })];
  } else if (kind === 'shield') {
    units[crew[1]].act = { kind: 'shield', target: crew[0] };
    c.lines = [L({ kind: 'guard', rule: 'shot', key: 'shotMiss', guard: a, targetId: crew[1], damage: 0, shieldedBy: crew[1] })];
  } else if (kind === 'jam') {
    c.lines = [L({ rule: 'jam', key: 'jamFail', actor: crew[0] }), L({ rule: 'jam', key: 'jamOk', actor: crew[0], callers: [a, b] })];
  } else if (kind === 'wayout') {
    c.lines = [L({ rule: 'wayOut', key: 'wayOut' }), L({ kind: 'patch', rule: 'patch', key: 'wayOutPatch', actor: crew[0], targets: crew.slice(0, 3) }), L({ kind: 'stabilise', rule: 'stabilise', key: 'stabiliseWayOut', actor: crew[0], targetId: crew[1], success: true })];
  }
  return c;
}

/**
 * Bind a stage to the plan's SVG. deps (from ui/siteplan.js): tok(id) the crew's token, at(id) where it is drawn, pin(id, at)
 * to keep a runner on their fight spot, frame(points, { tight }) to point the camera, pace() 'watch' | 'fast' | 'resolve',
 * reduced(), caption(text, tier) for a spotlight's line over the map, say(entry | null) for the commentary.
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
  let clock = 0;
  let playing = 0;
  let ambient = null;
  let tick = 0;
  function stopAmbient() { if (ambient) { clearInterval(ambient); ambient = null; } }
  function startAmbient() {
    stopAmbient();
    if (deps.reduced() || deps.pace() === 'resolve' || !points) return;
    const me = playing;
    ambient = setInterval(() => {
      if (me !== playing || !svg.isConnected) { stopAmbient(); return; }
      if (typeof document !== 'undefined' && document.hidden) return;
      const { strafe, tracer: shot } = ambientTick(drawn, points.seed ?? 0, points.round ?? 0, tick++);
      for (const x of strafe) put(host(x.id), x.at, AMBIENT_MS * 1.2);
      if (shot) {
        const a = pos(shot.from);
        if (a) { const l = node('line', { class: `fs-ambient ${shot.foe ? 'is-foe' : ''}`, x1: a[0], y1: a[1], x2: shot.end[0], y2: shot.end[1] }); fx.append(l); setTimeout(() => l.remove(), 220); }
      }
    }, AMBIENT_MS * (deps.pace() === 'fast' ? PACE_K.fast : 1));
  }
  // The camera: the whole fight, or pushed in on a few (a spotlight, a special move).
  function look(ids) {
    const list = ids ? ids.map((id) => pos(id)).filter(Boolean) : Object.values(drawn).filter((d) => !HIDDEN.has(d.stance)).map((d) => d.at);
    // Under the letterbox bars, leave room above and below so nobody the camera is about sits behind a bar.
    if (list.length && mapBox?.classList.contains('fs-letterbox')) {
      const ys = list.map((p) => p[1]); const x = list[0][0];
      list.push([x, Math.min(...ys) - 24], [x, Math.max(...ys) + 24]);
    }
    if (list.length) deps.frame(list, { tight: !!ids });
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const host = (id) => (id.startsWith('e:') ? foes.get(id) : deps.tok(id));
  const pos = (id) => (id === 'perch' ? points?.perch ?? [180, 0] : drawn[id]?.at ?? null);
  function put(g, at, ms = 0) {
    if (!g || !at) return;
    g.style.transition = ms > 0 ? `transform ${ms}ms cubic-bezier(.25,.7,.3,1), opacity 300ms` : 'none';
    g.style.transform = `translate(${at[0]}px, ${at[1]}px)`;
  }
  // A swarm (data/fightLooks.js ENEMY_LOOKS): one rules enemy drawn as a knot of small bodies, one group, so it is shot,
  // flashes, moves and falls as the one unit it is. How many bodies and where is hash01 of the fight's seed (the same every replay).
  function knotToken(id, u, seed, look) {
    const g = node('g', { class: `sp-token fs-foe fs-knot${look.rotor ? ' fs-knot--rotor' : ''}`, 'data-unit': id, 'data-pip-y': 10 });
    const [lo, hi] = look.bodies;
    const count = lo + Math.floor(hash01(seed, 'knot', u.n) * (hi - lo + 1));
    g.append(node('circle', { r: 9.5, class: 'fs-knot__zone' }));
    const bodies = node('g', { class: 'fs-knot__bodies' });
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2 + hash01(seed, 'knot', u.n, k, 'a') * 0.9;
      const r = k === 0 ? 0 : 4 + hash01(seed, 'knot', u.n, k, 'r') * 3;
      const [x, y] = [Math.cos(a) * r, Math.sin(a) * r * 0.8];
      const b = node('g', { class: 'fs-knot__b', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
      if (look.rotor) b.append(node('circle', { r: 2.1, class: 'fs-knot__drone' }), node('path', { d: 'M-3 -3 L3 3 M3 -3 L-3 3', class: 'fs-knot__rotor' }));
      else b.append(node('ellipse', { cx: 0, cy: 1.3, rx: 2.4, ry: 1.7, class: 'fs-knot__torso' }), node('circle', { cx: 0, cy: -0.8, r: 1.45, class: 'fs-knot__head' }));
      bodies.append(b);
    }
    g.append(bodies, node('circle', { r: 9.5, class: 'sp-face__ring fs-foe__ring fs-knot__ring' }), node('text', { x: 9, y: 9, class: 'fs-foe__n' }, String(u.n)));
    tokens.append(g);
    foes.set(id, g);
    return g;
  }
  function foeToken(id, u, seed) {
    const look = (preview()?.knots ? (preview().knots.includes(u.kind) ? { bodies: [4, 6], rotor: u.kind === 'drone' } : null) : ENEMY_LOOKS[u.kind]);
    if (look?.bodies) return knotToken(id, u, seed, look);
    const g = node('g', { class: `sp-token fs-foe${u.kind ? ` fs-foe--${u.kind}` : ''}`, 'data-unit': id });
    g.append(node('circle', { r: 6.5, class: 'fs-foe__bg' }));
    const face = node('g', { class: 'sp-face', 'clip-path': 'url(#sp-face-clip)' });
    face.innerHTML = portrait({ id: `foe-${seed}-${u.n}`, name: `${u.kind ?? 'foe'} ${u.n}`, age: 26 + ((seed + u.n * 7) % 20) }, { size: 13 }).replace('<svg ', '<svg x="-6.5" y="-6.5" ');
    g.append(face, node('rect', { x: -7, y: -7, width: 14, height: 14, class: 'fs-foe__tint', 'clip-path': 'url(#sp-face-clip)' }), node('circle', { r: 6.5, class: 'sp-face__ring fs-foe__ring' }), node('text', { x: 6.5, y: 7, class: 'fs-foe__n' }, String(u.n)));
    tokens.append(g);
    foes.set(id, g);
    return g;
  }
  // A plate (2026-11-15): an enemy with armour left wears an arc round its ring; a shot that takes it off splits the arc and the arc
  // falls away (`crack`), then the pip goes. Plates are drawn from the round's snapshot (`plate`: armour left) and nothing else.
  function plate(id, n) {
    const g = foes.get(id);
    if (!g) return;
    const has = g.querySelector(':scope > .fs-plate');
    if (n > 0 && !has) g.append(node('path', { class: 'fs-plate', d: 'M-8.6 -3 A9.2 9.2 0 0 1 8.6 -3 M-8.6 3 A9.2 9.2 0 0 0 8.6 3' }));
    else if (!(n > 0) && has && !has.classList.contains('is-cracking')) has.remove();
  }
  // The vector (slice 3-ii-a): an infected enemy wears a pulsing green ring until it falls. Drawn from the round's snapshot (`infected`) and nothing else.
  function infect(id, on) {
    const g = foes.get(id);
    if (!g) return;
    const has = g.querySelector(':scope > .fs-infect');
    if (on && !has) g.append(node('circle', { r: 10.4, class: 'fs-infect' }));
    else if (!on && has) has.remove();
  }
  // Part B's statuses (2026-11-19), drawn from the round's snapshot (`st`) and nothing else, one look each so they read apart at phone size:
  // burning an orange flickering ring, marked a red crosshair, exposed a yellow broken plate, shaken a jittering violet dotted ring.
  const STATUS_LOOK = {
    burning: () => { // a ring with embers that keep rising off it (owner, 2026-11-20)
      const g = node('g', { class: 'fs-st fs-st--burning' });
      g.append(node('circle', { r: 11.8 }), ...[-5, 0, 5].map((dx, i) => { const e = node('circle', { class: 'fs-ember', r: 1.4, cx: dx, cy: 6 }); e.style.setProperty('--dx', `${dx * 0.5}px`); e.style.animationDelay = `${i * 0.4}s`; return e; }));
      return g;
    },
    marked: () => { // the reticle locks on, then stays as a crosshair with a diamond tag (owner, 2026-11-20)
      const g = node('g', { class: 'fs-st fs-st--marked is-lock' });
      g.append(node('path', { d: 'M0 -13.5 V-10 M0 13.5 V10 M-13.5 0 H-10 M13.5 0 H10' }), node('path', { class: 'fs-mark-dia', d: 'M0 -21 L3.5 -17.5 L0 -14 L-3.5 -17.5Z' }));
      return g;
    },
    exposed: () => { // the broken plate with a breaching charge clamped on, its light blinking (owner, 2026-11-20); the next hit sets it off (`blast`)
      const g = node('g', { class: 'fs-st fs-st--exposed' });
      g.append(node('path', { d: 'M-10.4 -4 A11 11 0 0 1 -3 -10.6 M3 -10.6 A11 11 0 0 1 10.4 -4' }), node('rect', { class: 'fs-charge', x: -12.5, y: -11, width: 5, height: 4 }), node('circle', { class: 'fs-charge__led', cx: -10, cy: -12.4, r: 1.1 }));
      return g;
    },
    shaken: () => { // trembling ring and a bang over the head (owner, 2026-11-20)
      const g = node('g', { class: 'fs-st fs-st--shaken' });
      g.append(node('circle', { r: 13.2 }), node('text', { class: 'fs-bang', x: 0, y: -15 }, '!'));
      return g;
    },
  };
  function statuses(id, list = []) {
    const g = foes.get(id);
    if (!g) return;
    for (const [st, make] of Object.entries(STATUS_LOOK)) {
      const has = g.querySelector(`:scope > .fs-st--${st}`);
      if (list.includes(st) && !has) g.append(make());
      else if (!list.includes(st) && has) has.remove();
    }
  }
  function crack(g) {
    const p = g?.querySelector?.(':scope > .fs-plate');
    if (!p) return;
    p.classList.add('is-cracking');
    setTimeout(() => p.remove(), deps.reduced() ? 0 : 520);
  }
  // Health on the map (2026-11-19, owner: "one draining bar"): one slim bar under each body, the fill the share of HP left. When HP drops
  // the fill shrinks at once and a pale "lost" chunk holds where it was for a moment, then slides down to it; healing grows the fill. Amber
  // at half, red at a quarter. `max` is remembered on the bar, so a hit that only knows the HP left (a line's hpLeft) can drain it.
  const BAR_W = 14; const BAR_H = 1.8;
  function pips(id, hp, max) {
    const g = host(id);
    if (!g) return;
    let bar = g.querySelector(':scope > .fs-hpbar');
    if (!bar) {
      const y = Number(g.dataset?.pipY ?? g.getAttribute('data-pip-y') ?? 8.5);
      const w = g.classList.contains('fs-knot') ? BAR_W + 4 : BAR_W;
      const r = (cls) => node('rect', { class: cls, x: -w / 2, y, width: w, height: BAR_H });
      bar = node('g', { class: 'fs-hpbar' });
      bar.append(r('fs-hpbar__bg'), r('fs-hpbar__ghost'), r('fs-hpbar__fill'));
      g.append(bar);
    }
    if (max) bar.dataset.max = String(max);
    const m = Number(bar.dataset.max);
    if (!m || hp == null) return;
    const f = Math.max(0, Math.min(1, hp / m));
    const was = bar.dataset.f == null ? f : Number(bar.dataset.f);
    bar.dataset.f = String(f);
    const fill = bar.querySelector('.fs-hpbar__fill'); const ghost = bar.querySelector('.fs-hpbar__ghost');
    fill.style.transform = `scaleX(${f})`;
    if (f >= was || deps.reduced()) ghost.style.transform = `scaleX(${f})`;
    else { ghost.style.transform = `scaleX(${was})`; clearTimeout(bar._t); bar._t = setTimeout(() => { ghost.style.transform = `scaleX(${f})`; }, 450); }
    bar.classList.toggle('is-low', f <= 0.5 && f > 0.25);
    bar.classList.toggle('is-crit', f <= 0.25);
  }
  /** The HP a tick took: the bar drains as any loss does, and its lost chunk shows in the status's colour. */
  function tickLoss(id, left, max, burn = false) {
    pips(id, left, max);
    const bar = host(id)?.querySelector(':scope > .fs-hpbar');
    if (!bar) return;
    const cls = burn ? 'is-burnloss' : 'is-tickloss';
    bar.classList.add(cls); setTimeout(() => bar.classList.remove(cls), 800);
  }
  function setStance(id, stance, hidden = false) {
    const g = host(id);
    if (!g) return;
    for (const s of ['up', 'hunker', 'down', 'dead', 'aboard', 'gone', 'fled', 'approaching']) g.classList.toggle(`fs-${s}`, stance === s);
    g.classList.toggle('is-down', stance === 'down' || stance === 'dead');
    g.classList.toggle('fs-hidden', hidden);
    // A knocked-out enemy keeps a red X across its face for the rest of the fight (2026-11-19, the owner's pick "A"), however the map is redrawn.
    if (g.classList.contains('fs-foe')) {
      const out = stance === 'down' || stance === 'dead';
      const x = g.querySelector(':scope > .fs-ko-x');
      if (out && !x) { const r = g.classList.contains('fs-knot') ? 7 : 5; g.append(node('path', { class: 'fs-ko-x', pathLength: 1, d: `M${-r} ${-r} L${r} ${r} M${r} ${-r} L${-r} ${r}` })); }
      else if (!out && x) x.remove();
    }
  }
  /** The knockout itself (2026-11-19, the owner's pick "A" of drafts/mockups/knockout.html): a white flash and a burst of shards; the tip
   * and the grey come from the token's down class (CSS), the X from setStance. Nothing moves with reduced motion; the X still shows. */
  function knockout(at) {
    if (!at || deps.reduced()) return;
    gone(node('circle', { class: 'fs-ko-flash', cx: at[0], cy: at[1], r: 7 }), 460);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      const shard = node('rect', { class: 'fs-ko-shard', x: at[0] - 0.5, y: at[1] - 1.4, width: 1, height: 2.8, transform: `rotate(${(a * 180) / Math.PI + 90} ${at[0]} ${at[1]})` });
      shard.style.setProperty('--dx', `${Math.cos(a) * 11}px`); shard.style.setProperty('--dy', `${Math.sin(a) * 11}px`);
      const wrap = node('g', { class: 'fs-ko-shardwrap' }); wrap.append(shard);
      wrap.style.setProperty('--dx', `${Math.cos(a) * 11}px`); wrap.style.setProperty('--dy', `${Math.sin(a) * 11}px`);
      gone(wrap, 520);
    }
  }
  function body(at, id = null) {
    const big = id && host(id)?.classList.contains('fs-knot'); // a fallen knot leaves a wider mark
    ground.append(node('ellipse', { class: 'fs-body', cx: at[0], cy: at[1] + 2, rx: big ? 10 : 6.5, ry: big ? 5 : 3.5 }));
  }
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
  // A hit's damage as a number (2026-11-19, owner: "the little digits coming off them"): bigger than a word, it pops, then rises and fades;
  // successive numbers on one body step left and right so they never sit on top of each other.
  let numSide = 1;
  function damageNumber(at, amount, strong) {
    if (!at || deps.reduced()) return;
    numSide = -numSide;
    const g = node('text', { class: `fs-dmg${strong ? ' is-crit' : ''}`, x: at[0] + numSide * 6, y: at[1] - (numSide > 0 ? 9 : 13) }, `\u2212${amount}${strong ? '!' : ''}`);
    fx.append(g);
    setTimeout(() => g.remove(), 1200);
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
    const end = s.hit || s.absorbed || s.cracked ? b : [b[0] + s.wide[0] * 22, b[1] + s.wide[1] * 22];
    const l = node('line', { class: `fs-tracer ${s.foe ? 'is-foe' : ''} ${s.burst ? 'is-burst' : ''}`, x1: a[0], y1: a[1], x2: end[0], y2: end[1] });
    fx.append(l);
    flash(a, 'fs-muzzle');
    setTimeout(() => l.remove(), Math.max(120, s.dur + 140));
    return end;
  }

  // --- the special move's drawing (data/fightLooks.js SPECIAL_MOVES) ---
  const mapBox = svg.closest('.watch__map') ?? svg.parentElement;
  const cinema = (on) => { mapBox?.classList.toggle('fs-letterbox', on); svg.classList.toggle('fs-slowmo', on); };
  const gone = (el, ms) => { fx.append(el); setTimeout(() => el.remove(), ms); return el; };
  const toward = (a, b, k) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [a[0] + ((b[0] - a[0]) / d) * k, a[1] + ((b[1] - a[1]) / d) * k]; };
  const domeOf = new Map(); // protector id -> the dome's group, while the exchange plays
  const clearDomes = () => { for (const g of domeOf.values()) { g.remove(); if (g._back) put(host(g._back), drawn[g._back]?.at, 0); } domeOf.clear(); };
  /** A curved path from a to b, bowing to one side (the arcs of the hop, the shield and the jam). */
  const arcPath = (a, b, bow = 0.28) => { const m = mid(a, b); const dx = b[0] - a[0]; const dy = b[1] - a[1]; return { d: `M${a[0]} ${a[1]} Q${m[0] - dy * bow} ${m[1] + dx * bow} ${b[0]} ${b[1]}`, c: [m[0] - dy * bow, m[1] + dx * bow] }; };
  /** A point on that arc (t 0..1), so an orb can follow it. */
  const onArc = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  /** Where an attack lands: on the target, or wide as the dice had it. */
  const landing = (b, s) => (s.hit || s.absorbed || s.cracked ? b : [b[0] + s.wide[0] * 22, b[1] + s.wide[1] * 22]);
  // The spotlight (2026-11-20, owner: ordinary shots stay quick, only a special move gets the beat): the star and the
  // targets keep their colour, everyone else dims, until the move ends.
  let lit = [];
  const spot = (ids) => { unspot(); lit = ids.map((id) => host(id)).filter(Boolean); lit.forEach((g) => g.classList.add('is-lit')); svg.classList.add('fs-spotlit'); };
  function unspot() { lit.forEach((g) => g.classList.remove('is-lit')); lit = []; svg.classList.remove('fs-spotlit'); }
  // Ricochet, the comet (owner's pick from docs/mockups/2026-11-20-fight-readability.html): a glowing head that speeds into
  // each landing, a trail that stays and dims, a ring and sparks and a numbered badge at each landing, and at the end the
  // whole route glows for a hold and fades. `rico` holds the move's trail and badges until `ricoEnd`.
  let rico = { n: 0, trails: [], badges: [] };
  function ricoClear() { rico.trails.forEach((l) => l.remove()); rico.badges.forEach((g) => g.remove()); rico = { n: 0, trails: [], badges: [] }; }
  function ricoEnd(hold) {
    const { trails, badges } = rico; rico = { n: 0, trails: [], badges: [] };
    trails.forEach((l) => l.classList.add('is-route'));
    setTimeout(() => { trails.forEach((l) => l.classList.add('is-gone')); badges.forEach((g) => g.classList.add('is-gone')); }, Math.max(0, hold));
    setTimeout(() => { trails.forEach((l) => l.remove()); badges.forEach((g) => g.remove()); }, Math.max(0, hold) + 520);
  }
  const sparks = (at, n = 8, len = 13) => { for (let k = 0; k < n; k++) { const a = (Math.PI * 2 * k) / n + hash01(at[0], at[1], k) * 0.5; gone(node('line', { class: 'fs-sparkle', x1: at[0] + Math.cos(a) * 3, y1: at[1] + Math.sin(a) * 3, x2: at[0] + Math.cos(a) * (3 + len), y2: at[1] + Math.sin(a) * (3 + len) }), 380); } };
  function ricochet(a, b, s) {
    const end = landing(b, s);
    const n = (rico.n += 1);
    const trail = node('line', { class: 'fs-trail', x1: a[0], y1: a[1], x2: a[0], y2: a[1] });
    fx.append(trail); rico.trails.forEach((l) => l.classList.add('is-old')); rico.trails.push(trail);
    const dot = node('circle', { class: 'fs-round', r: 2.4 });
    fx.append(dot);
    const land = () => {
      dot.remove();
      trail.setAttribute('x2', end[0]); trail.setAttribute('y2', end[1]);
      gone(node('circle', { class: 'fs-impact', cx: end[0], cy: end[1], r: 4 }), 520);
      sparks(end);
      if (s.hit || s.cracked || s.absorbed) {
        const g = node('g', { class: 'fs-badge', transform: `translate(${end[0] + 11} ${end[1] - 11})` });
        g.append(node('circle', { r: 5.5 }), node('text', {}, String(n)));
        fx.append(g); rico.badges.push(g);
      }
    };
    if (s.dur <= 0 || deps.reduced()) { land(); return; }
    const t0 = performance.now();
    const step = (now) => {
      if (!dot.isConnected) return;
      const k = Math.min(1, (now - t0) / s.dur); const e = k * k * (1.4 - 0.4 * k); // speeds into the landing, as a round does
      const x = a[0] + (end[0] - a[0]) * e; const y = a[1] + (end[1] - a[1]) * e;
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); trail.setAttribute('x2', x); trail.setAttribute('y2', y);
      if (k < 1) requestAnimationFrame(step); else land();
    };
    requestAnimationFrame(step);
  }
  // Slash: afterimages of the star along the dash (the star's own token stays on its spot), and an arc where the blade lands.
  function slash(a, b, s) {
    const end = landing(b, s);
    // The star's own token runs to each target (owner, 2026-11-20, superseding 'only the ghost travels') and goes home at specialEnd.
    const runner = s.star && host(s.star);
    if (runner && s.dur > 0 && !deps.reduced()) put(runner, toward(end, a, 7), s.dur * 0.85);
    const ang = (Math.atan2(end[1] - a[1], end[0] - a[0]) * 180) / Math.PI;
    for (let k = 1; k <= 3; k++) {
      const at = [a[0] + (end[0] - a[0]) * (k / 3.4), a[1] + (end[1] - a[1]) * (k / 3.4)];
      setTimeout(() => gone(node('circle', { class: 'fs-ghost', cx: at[0], cy: at[1], r: 6.5 }), 380), (s.dur * (k - 1)) / 3);
    }
    setTimeout(() => gone(node('path', { class: 'fs-slash', d: 'M-8 -4 Q0 5 8 -4', transform: `translate(${end[0]} ${end[1]}) rotate(${ang + 90})` }), 420), s.dur * 0.75);
  }
  // Ping: a quick thin bolt from the star.
  function bolt(a, b, s) {
    const end = landing(b, s);
    if (deps.reduced() || s.dur <= 0) { gone(node('line', { class: 'fs-bolt', x1: a[0], y1: a[1], x2: end[0], y2: end[1] }), 200); return; }
    // Lightning (owner, 2026-11-20): a jagged bolt that re-jags a few times as it holds, with a fork. Seeded, so a replay looks the same.
    const dx = end[0] - a[0]; const dy = end[1] - a[1]; const len = Math.hypot(dx, dy) || 1; const nx = -dy / len; const ny = dx / len;
    const jag = (f) => {
      const pts = [a];
      for (let i = 1; i < 8; i++) { const o = (hash01(a[0] + f, end[0], end[1] + i, 'zig') - 0.5) * 12; pts.push([a[0] + (dx * i) / 8 + nx * o, a[1] + (dy * i) / 8 + ny * o]); }
      pts.push(end);
      const f3 = pts[3]; const fork = [f3[0] + nx * 9 + (dx / len) * 8, f3[1] + ny * 9 + (dy / len) * 8];
      return `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}M${f3[0].toFixed(1)} ${f3[1].toFixed(1)}L${fork[0].toFixed(1)} ${fork[1].toFixed(1)}`;
    };
    const path = gone(node('path', { class: 'fs-lightning', d: jag(0) }), Math.max(260, s.dur + 200));
    for (let f = 1; f <= 3; f++) setTimeout(() => path.setAttribute('d', jag(f)), f * 70);
    flash(a, 'fs-spark');
  }

  // The breaching charge goes off (owner, 2026-11-20): a hit on an exposed enemy ignored its plate. A flash, the plate's two halves fly apart, a word.
  function blast(b) {
    if (deps.reduced()) return;
    flash(b, 'sp-flash--breach'); gone(node('circle', { class: 'fs-pop fs-pop--breach', cx: b[0], cy: b[1], r: 8 }), 600);
    const halves = [['M-9 -4 A9.6 9.6 0 0 1 9 -4', '7px', '-13px', '40deg'], ['M-9 4 A9.6 9.6 0 0 0 9 4', '-7px', '13px', '-40deg']];
    for (const [d, dx, dy, rot] of halves) { const g = gone(node('g', { transform: `translate(${b[0]} ${b[1]})` }), 650); const sh = node('path', { class: 'fs-shard', d }); sh.style.setProperty('--dx', dx); sh.style.setProperty('--dy', dy); sh.style.setProperty('--rot', rot); g.append(sh); }
    float(b, word('stage.pierced'), 'is-hit');
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
        if ((s.stance === 'down' || s.stance === 'dead') && was !== 'down' && was !== 'dead' && s.do === 'final') body(s.at, s.id);
        if (s.do === 'place' && (s.stance === 'down' || s.stance === 'dead')) body(s.at, s.id);
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
        if (s.look === 'ricochet') ricochet(a, b, s);
        else if (s.look === 'slash') slash(a, b, s);
        else if (s.look === 'ping') bolt(a, b, s);
        else tracer(a, b, s);
        setTimeout(() => {
          const g = host(s.to);
          if (s.shield) { flash(b, 'sp-flash--shield'); const dm = domeOf.get(s.to); if (dm) { dm.classList.remove('is-flare'); void dm.getBoundingClientRect(); dm.classList.add('is-flare'); } } // the shield takes the shot: the dome flares
          // Armour crack (2026-11-15): the plate breaks first (a flash, a Cracked float, the arc splits), then, if the shot got through, the pip goes and the token is struck.
          if (s.cracked) {
            crack(g); flash(b, 'sp-flash--crack'); float(b, word('stage.cracked'), 'is-cracked');
            if (s.hit || s.fell) setTimeout(() => { struck(g); flash(b, 'sp-flash--hit'); }, deps.reduced() ? 0 : 280);
          } else if (s.hit) { struck(g); flash(b, 'sp-flash--hit'); if (s.pierced) blast(b); }
          else if (s.absorbed) { flash(b, 'sp-flash--zap'); float(b, word('stage.absorbed'), 'is-absorbed'); }
          else flash([b[0] + s.wide[0] * 22, b[1] + s.wide[1] * 22], 'sp-flash--miss');
          // The bar drains as the hit lands (2026-11-19): to the HP the line says is left, or to nothing on a fall.
          const late = s.cracked && !deps.reduced() ? 280 : 0;
          if (s.fell) setTimeout(() => pips(s.to, 0, null), late); else if (s.hit && s.left != null) setTimeout(() => pips(s.to, s.left, null), late);
          // The damage as a number (2026-11-18), on the killing hit too (2026-11-19), bigger and amber with a "!" on a critical hit.
          if ((s.hit || s.fell) && s.amount) setTimeout(() => damageNumber(b, s.amount, s.strong), late);
          if (s.fell) { const foe = s.to.startsWith('e:'); setTimeout(() => { if (foe) knockout(b); setStance(s.to, s.dead ? 'dead' : 'down'); }, late); drawn[s.to] = { ...drawn[s.to], stance: s.dead ? 'dead' : 'down' }; body(b, s.to); setTimeout(() => float(b, word(foe ? 'stage.out' : 'stage.down'), foe ? 'is-down is-ko' : 'is-down'), late + 220); }
          else if (s.hit && !s.amount) setTimeout(() => float(b, word('stage.hit'), 'is-hit'), late);
        }, s.dur);
        break;
      }
      case 'flank': { const b = pos(s.id); flash(b, 'sp-flash--miss'); float(b, word('stage.flanked'), 'is-hit'); break; }
      case 'heal': { const b = pos(s.id); if (b) { const c = node('circle', { class: `sp-ring ${s.ok ? 'sp-ring--ok' : 'sp-ring--bad'}`, cx: b[0], cy: b[1], r: 9 }); fx.append(c); setTimeout(() => c.remove(), Math.max(400, s.dur)); } break; }
      case 'aura': {
        // The medic's aura (2026-11-17): a green glow grows round the medic and flashes, an orb crosses to the patient, and where it lands the ring bursts, the HP healed floats (+10) and the segment fills.
        const m = pos(s.id); const t = pos(s.to);
        if (!t) break;
        const land = () => { flash(t, 'sp-flash--heal'); float(t, s.amount ? `+${s.amount}` : '+', s.amount ? 'is-heal is-num' : 'is-heal'); if (s.left != null) { pips(s.to, s.left, s.leftExact ? null : s.max); const bar = host(s.to)?.querySelector(':scope > .fs-hpbar'); if (bar) { bar.classList.add('is-gain'); setTimeout(() => bar.classList.remove('is-gain'), 800); } } };
        if (!m || deps.reduced() || s.dur <= 0) { land(); break; }
        const dur = Math.max(700, s.dur);
        const glow = gone(node('circle', { class: 'fs-aura', cx: m[0], cy: m[1], r: 9 }), dur * 0.62);
        glow.style.animationDuration = `${dur * 0.6}ms`;
        const glow2 = gone(node('circle', { class: 'fs-aura fs-aura--late', cx: m[0], cy: m[1], r: 9 }), dur * 0.7); // a second ring a beat behind: the glow pulses
        glow2.style.animationDuration = `${dur * 0.6}ms`; glow2.style.animationDelay = `${dur * 0.1}ms`;
        if (s.to === s.id) { setTimeout(() => { gone(node('circle', { class: 'sp-ring sp-ring--ok', cx: t[0], cy: t[1], r: 9 }), 760); land(); }, dur * 0.55); break; } // healing themself: nothing crosses
        // A healing pulse (owner, 2026-11-20): a green ring spreads from the medic to the patient, who gets the ring and plus signs rising.
        setTimeout(() => { const w = gone(node('circle', { class: 'fs-groupwave', cx: m[0], cy: m[1], r: Math.hypot(t[0] - m[0], t[1] - m[1]) + 8 }), dur * 0.55); w.style.animationDuration = `${dur * 0.5}ms`; }, dur * 0.4);
        setTimeout(() => { gone(node('circle', { class: 'sp-ring sp-ring--ok', cx: t[0], cy: t[1], r: 9 }), 760); land(); for (let k = 0; k < 3; k++) setTimeout(() => float([t[0] + (k - 1) * 7, t[1] + (k % 2) * 4], '+', 'is-heal'), k * 90); }, dur * 0.8);
        break;
      }
      case 'ping': {
        const b = pos(s.id);
        if (b) { const c = node('circle', { class: `fs-ping ${s.ok ? 'is-ok' : 'is-fail'}`, cx: b[0], cy: b[1], r: 6 }); fx.append(c); setTimeout(() => c.remove(), Math.max(400, s.dur)); }
        if (!b || deps.reduced()) break;
        if (!s.ok) { float(b, word('stage.jamFail'), 'is-jamfail'); break; } // a failed jam: the ring flickers and dies, no signal goes out
        // A jam that takes: a broken signal arc from the tech to each caller, static where it lands.
        for (const id of s.targets ?? []) {
          const t = pos(id); if (!t) continue;
          gone(node('path', { class: 'fs-jamarc', d: arcPath(b, t, 0.12).d }), 760);
          setTimeout(() => { gone(node('circle', { class: 'fs-static', cx: t[0], cy: t[1], r: 8 }), 700); flash(t, 'sp-flash--zap'); float(t, word('stage.jammed'), 'is-jam'); }, s.dur * 0.45);
        }
        break;
      }
      case 'spread': {
        // The Contagion jumps (2026-11-17): the infection leaves the body that fell and arcs to the next host, whose ring flares as it lands.
        const a = pos(s.from); const t = pos(s.to);
        if (!a || !t) break;
        const land = () => { infect(s.to, true); const ring = host(s.to)?.querySelector(':scope > .fs-infect'); if (ring) { ring.classList.remove('is-flare'); void ring.getBoundingClientRect(); ring.classList.add('is-flare'); } if (!deps.reduced()) { flash(t, 'sp-flash--spread'); gone(node('circle', { class: 'sp-ring sp-ring--spread', cx: t[0], cy: t[1], r: 9 }), 760); } };
        infect(s.from, false);
        if (deps.reduced() || s.dur <= 0) { land(); break; }
        const dur = Math.max(700, s.dur);
        // Spores (owner, 2026-11-20): the body bursts into a cloud that drifts over to the new host, each on its own arc.
        for (let k = 0; k < 6; k++) setTimeout(() => { const sp = gone(node('circle', { class: 'fs-spore', cx: a[0], cy: a[1], r: 1.2 }), 720); sp.style.setProperty('--dx', `${(k - 2.5) * 4}px`); sp.style.setProperty('--dy', `${-4 - k * 2}px`); }, k * 40);
        for (let k = 0; k < 9; k++) {
          const h = hash01(a[0], t[0], t[1] + k, 'spore'); const tj = [t[0] + (hash01(a[1], t[0], k, 'sx') - 0.5) * 16, t[1] + (hash01(a[0], t[1], k, 'sy') - 0.5) * 16];
          const { c } = arcPath(a, tj, (h - 0.5) * 0.9);
          const sp = gone(node('circle', { class: 'fs-hopper', r: 1.3 + h * 1.3, cx: 0, cy: 0 }), dur * 0.9);
          const path = [0, 0.2, 0.4, 0.6, 0.8, 1].map((u) => onArc(a, c, tj, u));
          if (sp.animate) sp.animate(path.map((p) => ({ transform: `translate(${p[0]}px, ${p[1]}px)` })), { duration: dur * (0.4 + h * 0.15), delay: dur * (0.08 + k * 0.03), easing: 'ease-in-out', fill: 'both' });
          else put(sp, tj, 0);
        }
        setTimeout(land, dur * 0.7);
        break;
      }
      case 'tick': {
        // The infection ticks (2026-11-17): green drops run off the host and the pip it loses flashes; a host that falls to it pops in a ring.
        const b = pos(s.to);
        if (!b) break;
        const apply = () => {
          if (s.left != null || s.max) tickLoss(s.to, s.left ?? 0, s.leftExact ? null : s.max, s.burn);
          if (s.fell) { knockout(b); setStance(s.to, 'down'); drawn[s.to] = { ...drawn[s.to], stance: 'down' }; body(b, s.to); infect(s.to, false); statuses(s.to, []); float(b, word('stage.out'), 'is-down is-ko'); }
        };
        if (deps.reduced() || s.dur <= 0) { apply(); break; }
        if (s.burn) for (let k = 0; k < 8; k++) setTimeout(() => { const e = gone(node('circle', { class: 'fs-ember fs-ember--burst', cx: b[0] - 6 + k * 1.7, cy: b[1] + 3, r: 1.6 }), 800); e.style.setProperty('--dx', `${(k - 3.5) * 1.6}px`); }, k * 70);
        else for (let k = 0; k < 3; k++) setTimeout(() => gone(node('circle', { class: s.burn ? 'fs-drip fs-drip--ember' : 'fs-drip', cx: b[0] - 3 + k * 3, cy: b[1] - 4 + (k % 2), r: 1.3 }), 700), k * 90);
        const ring = host(s.to)?.querySelector(s.burn ? ':scope > .fs-st--burning' : ':scope > .fs-infect');
        if (ring) { ring.classList.remove('is-flare'); void ring.getBoundingClientRect(); ring.classList.add('is-flare'); }
        setTimeout(() => {
          apply();
          flash(b, 'sp-flash--tick');
          if (s.fell) { gone(node('circle', { class: 'fs-pop', cx: b[0], cy: b[1], r: 8 }), 600); struck(host(s.to)); }
          else float(b, s.amount ? `\u2212${s.amount}` : '\u2212', s.amount ? 'is-tick is-num' : 'is-tick');
        }, s.dur * 0.45);
        break;
      }
      case 'dome': {
        // The shield (2026-11-17), as a plate (owner, 2026-11-20): the protector steps in front of who is covered, toward the enemy line,
        // and a bright plate holds in front of them over the exchange; it flares when the shot lands and they step back at domeEnd.
        const a = pos(s.id); const t = pos(s.to);
        if (!a || !t || s.dur <= 0 || deps.reduced()) break;
        domeOf.get(s.id)?.remove();
        const hostiles = Object.entries(drawn).filter(([id, d]) => id.startsWith('e:') && !HIDDEN.has(d.stance)).map(([, d]) => d.at);
        const cx = hostiles.length ? hostiles.reduce((n, p) => n + p[0], 0) / hostiles.length : t[0] + 1; const cy = hostiles.length ? hostiles.reduce((n, p) => n + p[1], 0) / hostiles.length : t[1];
        const front = toward(t, [cx, cy], 1); const ux = front[0] - t[0]; const uy = front[1] - t[1];
        const deg = (Math.atan2(uy, ux) * 180) / Math.PI;
        if (s.id !== s.to) put(host(s.id), [t[0] + ux * 9, t[1] + uy * 9], s.dur);
        const g = node('g', { class: 'fs-dome', transform: `translate(${t[0] + ux * 19} ${t[1] + uy * 19}) rotate(${deg})` });
        g.append(node('path', { class: 'fs-dome__plate', d: 'M0 -11 Q8 0 0 11' }));
        g._back = s.id;
        fx.append(g); domeOf.set(s.id, g);
        break;
      }
      case 'domeEnd': {
        for (const g of domeOf.values()) { g.classList.add('is-end'); setTimeout(() => g.remove(), 340); if (g._back) put(host(g._back), drawn[g._back]?.at, 300); }
        domeOf.clear();
        break;
      }
      case 'alarm': {
        // The way out (2026-11-17): the alarm is up. Red rings pulse out of the door the arrivals use, the map's edge flashes, a caption says so.
        const at = s.at;
        if (!at) break;
        deps.caption?.(word('stage.alarm'), 'alarm');
        if (deps.reduced() || s.dur <= 0) break;
        deps.frame([...Object.values(drawn).filter((d) => !HIDDEN.has(d.stance)).map((d) => d.at), at]); // the door in shot, so the rings are seen
        // The siren and the surge (owner, 2026-11-20): the rings keep coming and the map's edge pulses like a siren for the whole step; the door says how many are coming.
        for (let k = 0; k < 5; k++) setTimeout(() => gone(node('circle', { class: 'fs-alarm-ring', cx: at[0], cy: at[1], r: 6 }), 950), k * 300);
        gone(node('circle', { class: 'fs-alarm-core', cx: at[0], cy: at[1], r: 3 }), 1900);
        if (s.count) setTimeout(() => float([at[0] - 22, at[1] + 14], word('stage.arriving', { n: s.count }), 'is-hit'), 500);
        mapBox?.classList.add('fs-alarm'); setTimeout(() => mapBox?.classList.remove('fs-alarm'), 1900);
        break;
      }
      case 'patch': {
        // The medic's hands on the way out (2026-11-17): the aura's glow round the medic, then a soft pulse out over everyone reached.
        const m = pos(s.id);
        const land = () => { for (const id of s.targets ?? []) { const t = pos(id); if (t) { flash(t, 'sp-flash--heal'); float(t, '+', 'is-heal'); } } };
        if (!m || deps.reduced() || s.dur <= 0) { land(); break; }
        const dur = Math.max(800, s.dur);
        const reach = Math.max(16, ...(s.targets ?? []).map((id) => pos(id)).filter(Boolean).map((t) => Math.hypot(t[0] - m[0], t[1] - m[1]) + 8));
        const glow = gone(node('circle', { class: 'fs-aura', cx: m[0], cy: m[1], r: 9 }), dur * 0.62); glow.style.animationDuration = `${dur * 0.6}ms`;
        setTimeout(() => { const w = gone(node('circle', { class: 'fs-groupwave', cx: m[0], cy: m[1], r: reach }), dur * 0.5); w.style.animationDuration = `${dur * 0.45}ms`; }, dur * 0.35);
        (s.targets ?? []).forEach((id, k) => { const t = pos(id); if (t) setTimeout(() => { gone(node('circle', { class: 'sp-ring sp-ring--ok', cx: t[0], cy: t[1], r: 9 }), 760); flash(t, 'sp-flash--heal'); float(t, '+', 'is-heal'); }, dur * 0.6 + k * 90); });
        break;
      }
      case 'fall': { const b = pos(s.id); if (s.id.startsWith('e:')) knockout(b); setStance(s.id, s.dead ? 'dead' : 'down'); if (drawn[s.id]) drawn[s.id] = { ...drawn[s.id], stance: s.dead ? 'dead' : 'down' }; if (b) body(b, s.id); break; }
      case 'leave': { const g = host(s.id); const from = pos(s.id); if (s.id.startsWith('e:') && from && !deps.reduced() && s.dur > 0) for (let k = 0; k < 5; k++) setTimeout(() => gone(node('circle', { class: 'fs-dust', cx: from[0] + (s.at[0] - from[0]) * (k / 5), cy: from[1] + (s.at[1] - from[1]) * (k / 5) + 5, r: 2.2 }), 500), (s.dur * k) / 6); // the fled kick up dust on the run
        put(g, s.at, s.dur); setTimeout(() => setStance(s.id, s.stance, true), s.dur); if (!s.id.startsWith('e:')) deps.pin(s.id, null); drawn[s.id] = { at: s.at, stance: s.stance }; break; }
      case 'special': {
        // Letterbox bars and slow motion while the move plays (not at Resolve or with reduced motion: there it cuts).
        const b = pos(s.id);
        if (b) gone(node('circle', { class: 'fs-special', cx: b[0], cy: b[1], r: 8 }), Math.max(600, s.dur));
        if (s.dur > 0 && !deps.reduced()) { cinema(true); spot([s.id, ...(s.targets ?? [])]); }
        ricoClear();
        deps.caption?.(word(s.key, s.slots), 'special');
        break;
      }
      case 'wave': {
        const b = pos(s.id);
        if (!b) break;
        const reach = Math.max(14, ...(s.targets ?? []).map((t) => pos(t)).filter(Boolean).map((t) => Math.hypot(t[0] - b[0], t[1] - b[1]) + 8));
        const c = gone(node('circle', { class: 'fs-wave', cx: b[0], cy: b[1], r: reach }), Math.max(300, s.dur + 120));
        c.style.animationDuration = `${Math.max(1, s.dur)}ms`;
        break;
      }
      case 'specialEnd': cinema(false); unspot(); if (s.look === 'ricochet') ricoEnd(s.hold ?? 900); else ricoClear(); put(host(s.id), drawn[s.id]?.at, 260); break;
      case 'caption': deps.caption?.(word(s.key, s.slots), s.tier); break;
      case 'say': deps.say?.({ when: clockText(s.round, s.clock), tier: s.tier, text: s.key ? `${word(s.key, s.slots)} ${s.texts.join(' ')}` : s.texts.join(' ') }); break;
      case 'camera': if (!deps.reduced() && deps.pace() !== 'resolve') look(s.focus); break;
      default: break;
    }
  }

  /** Health as the event has it (pips), after the round. */
  function health(cue) {
    // The exact HP where the cue has it (2026-11-19); a report saved before has only the whole hpUnits, which draw the same share.
    for (const r of cue.runners ?? []) pips(r.id, Math.max(0, r.hpExact ?? r.hp), r.maxExact ?? r.max);
    for (const g of cue.guards ?? []) { pips(enemyId(g.n), Math.max(0, g.hpExact ?? g.hp), g.maxExact ?? g.max); plate(enemyId(g.n), g.plate ?? 0); infect(enemyId(g.n), !!g.infected && !g.out); statuses(enemyId(g.n), g.out ? [] : g.st ?? []); }
  }

  return {
    /** Play an event's cue (start, round, retreat, end). Resolves when the round's picture is done. */
    async play(cue) {
      if (preview()?.special && cue.phase === 'round') cue = forceSpecial(cue, preview().special);
      if (preview()?.effect && cue.phase === 'round') cue = forceEffect(cue, preview().effect);
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
      stopAmbient();
      clearDomes(); unspot(); ricoClear();
      if (cue.phase === 'start') { clock = 0; deps.say?.(null); }
      const script = stageScript(drawn, cue, { pace, reduced: deps.reduced(), spent, clock });
      spent = script.spent;
      clock = script.clock;
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
      if (me !== playing) return;
      health(cue);
      look(null);
      if (cue.phase !== 'end' && cue.phase !== 'retreat') startAmbient();
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
      startAmbient();
    },
    /** The fight is over: the enemies, the bodies and the barriers go; the crew's pins are let go. */
    reset(full = true) {
      playing += 1;
      stopAmbient();
      clearDomes(); unspot(); ricoClear();
      for (const g of foes.values()) g.remove();
      foes.clear();
      ground.replaceChildren();
      cinema(false);
      for (const id of Object.keys(drawn)) if (!id.startsWith('e:')) { deps.pin(id, null); setStance(id, null); deps.tok(id)?.querySelector(':scope > .fs-hpbar')?.remove(); }
      drawn = {};
      if (full) { spent = 0; svg.classList.remove('is-staged'); }
    },
    /** What is drawn now (tests and the camera). */
    get drawn() { return drawn; },
  };
}
