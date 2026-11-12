// The director (watchable combat, Slice 1; drafts/HANDOFF-watchable-combat.md). Pure: it reads a played round and
// says how to tell it, and changes nothing. Nothing it returns feeds back into the rules, and it draws no roll.
//
//   direct(b, roundResult, memory) -> { beats, memory }
//
// A Beat is one moment to show: { tier, lines, focus, key, slots, holdMs }. tier is 'routine' | 'notable' |
// 'spotlight' | 'showcase'. A spotlight is detected at every pace; how many play as spotlights is the UI's budget at
// playback (FIGHT.spotlightBudget, applied by playable() below; core never calls it). Resolve still lists them.
// The memory is carried on b.director between rounds (the caller stores it); the rules never read it.
//
// roundResult is playRound's result with `lines` holding the round's whole feed (the start-of-round lines too,
// core/runfight.js playOn passes them so). Wording is lineText keys in data/fightText.js ('director.*').

import { FIGHT } from '../data/fights.js';
import { lineText } from './fighttext.js';

// Routine: the back and forth that fills a round. Anything not listed is notable (something changed); showcase lines
// (Slice 4) carry a `showcase` field or a showcase* kind.
const ROUTINE = new Set(['attackHit', 'attackMiss', 'attackGone', 'overwatchHit', 'overwatchMiss', 'shotMiss', 'jamFail', 'aura', 'hunker']);
const SHOWCASE_KINDS = new Set(['showcaseStart', 'showcaseEnd']);

export const newMemory = () => ({ defeats: {}, shields: {}, lowPipRounds: {}, spotted: {} });

/** The tier of one line, before any spotlight is found. */
export function tierOf(line) {
  if (line.showcase || SHOWCASE_KINDS.has(line.kind)) return 'showcase';
  return ROUTINE.has(line.key) ? 'routine' : 'notable';
}

const RADIO_KINDS = new Set(['backup', 'alarm']);
// A spotlight does not repeat for the same runner within this many rounds.
const QUIET_ROUNDS = 3;

/**
 * Directs one round. `memory` is b.director (or null on the first round); the returned memory is a new object, so
 * the caller stores it. `b` is read after the round was played.
 */
export function direct(b, roundResult, memory = null) {
  const m = structuredClone(memory ?? newMemory());
  const lines = roundResult.lines ?? [];
  const round = b.round;
  const spots = []; // { id, key, slots, focus, at: index into lines | null }
  const spot = (id, focusId, key, slots, at, once = true) => {
    const tag = `${id}:${focusId}`;
    if (once && m.spotted[tag] !== undefined && round - m.spotted[tag] < QUIET_ROUNDS) return;
    m.spotted[tag] = round;
    spots.push({ id, key: `director.${key}`, slots, focus: [focusId], at });
  };
  const handle = (id) => b.runners.find((r) => r.id === id)?.handle ?? id;

  // Streak: one runner with 3 or more defeats within 2 rounds.
  for (const d of roundResult.defeated ?? []) {
    if (!b.runners.some((r) => r.id === d.by)) continue;
    (m.defeats[d.by] ??= []).push({ round, enemy: d.enemy });
  }
  for (const [id, list] of Object.entries(m.defeats)) {
    m.defeats[id] = list.filter((d) => d.round >= round - 1);
    if (m.defeats[id].length >= 3 && m.defeats[id].some((d) => d.round === round)) {
      let at = null;
      lines.forEach((l, i) => { if (l.actor === id && l.dropped) at = i; });
      spot('streak', id, 'streak', { who: handle(id), n: m.defeats[id].length }, at);
    }
  }

  // Shield wall: the same protector shields the same runner 3 or more times (a spotlight at each third).
  for (const a of roundResult.actions ?? []) {
    if (a.action !== 'shield' || !a.target) continue;
    const row = (m.shields[a.opId] ??= {});
    row[a.target] = (row[a.target] ?? 0) + 1;
    if (row[a.target] % 3 === 0) {
      let at = null;
      lines.forEach((l, i) => { if (l.kind === 'shot' && l.shieldedBy === a.opId && l.target === a.target) at = i; });
      spot('shieldWall', a.opId, 'shieldWall', { who: handle(a.opId), target: handle(a.target), n: row[a.target] }, at, false);
    }
  }

  // Last stand: a runner at 1 pip acts 2 or more rounds running.
  const acted = new Set((roundResult.actions ?? []).map((a) => a.opId));
  for (const r of b.runners) {
    if (r.pips === 1 && !r.down && !r.dead && acted.has(r.id)) m.lowPipRounds[r.id] = (m.lowPipRounds[r.id] ?? 0) + 1;
    else m.lowPipRounds[r.id] = 0;
    if (m.lowPipRounds[r.id] === 2) {
      let at = null;
      lines.forEach((l, i) => { if (l.actor === r.id) at = i; });
      spot('lastStand', r.id, 'lastStand', { who: r.handle }, at);
    }
  }

  // Clutch hack: the work completes at round deadline - 1 or later.
  if (b.type === 'holdHack' && (roundResult.goalDelta ?? 0) > 0 && b.goal.work >= FIGHT.workNeeded && b.deadline && b.round >= b.deadline - 1) {
    const tech = b.goal.protect;
    spot('clutchHack', tech, 'clutchHack', { who: handle(tech), round }, null);
  }

  // Denied: a jam cancels 2 or more radio threats.
  const jam = lines.findIndex((l) => l.key === 'jamOk');
  const cancelled = (b.threats ?? []).filter((t) => t.cancelled && RADIO_KINDS.has(t.kind)).length;
  if (jam >= 0 && cancelled >= 2) spot('denied', lines[jam].actor, 'denied', { who: handle(lines[jam].actor), n: cancelled }, jam, false);

  // Carry home: someone carried a downed teammate into the van.
  lines.forEach((l, i) => { if (l.key === 'carriedInVan') spot('carryHome', l.target, 'carryHome', { target: handle(l.target) }, i, false); });

  // Beats: a run of routine lines is one beat; every other line is its own.
  const beats = [];
  lines.forEach((l, i) => {
    const tier = tierOf(l);
    const last = beats[beats.length - 1];
    if (tier === 'routine' && last?.tier === 'routine') { last.lines.push(l); last.idx.push(i); }
    else beats.push({ tier, lines: [l], idx: [i], focus: [], key: null, slots: {}, holdMs: 0 });
  });
  const extra = [];
  for (const s of spots) {
    const beat = s.at === null ? null : beats.find((x) => x.idx.includes(s.at));
    if (beat) { beat.tier = 'spotlight'; beat.key = s.key; beat.slots = s.slots; beat.focus = s.focus; }
    else extra.push({ tier: 'spotlight', lines: [], idx: [], focus: s.focus, key: s.key, slots: s.slots, holdMs: 0 });
  }
  beats.push(...extra);
  for (const x of beats) {
    if (!x.focus.length) x.focus = [...new Set(x.lines.flatMap((l) => [l.actor, l.target, l.targetId].filter((id) => id && b.runners.some((r) => r.id === id)).concat(l.enemy ? [l.enemy] : [])))];
    x.holdMs = FIGHT.beatMs[x.tier];
    delete x.idx;
  }
  return { beats, memory: m };
}

/**
 * The UI's spotlight budget at playback: the first `budget` spotlights stay spotlights, the rest play as notable
 * (they are still in the list, so the timeline and the report keep them). Pure; core never calls it. Pace is a UI
 * preference (handoff F2), so the budget for 'watch', 'fast' or 'resolve' is looked up by the caller.
 */
export function playable(beats, pace) {
  let left = FIGHT.spotlightBudget[pace] ?? 0;
  return beats.map((x) => {
    if (x.tier !== 'spotlight') return x;
    if (left > 0) { left -= 1; return x; }
    return { ...x, tier: 'notable', holdMs: FIGHT.beatMs.notable };
  });
}

/** A beat's spotlight sentence ('' for a beat without one). */
export const beatText = (beat) => (beat.key ? lineText(beat.key, beat.slots) : '');
