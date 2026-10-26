// Side tasks: one-off hands-off work for the bench (owner's design, 2026-10-26). Pure logic.
//
// Each Monday a small board of tasks goes up (SIDE_BOARD_SIZE, from data/sideTasks.js). Send
// one or two people; they're away for the task's days and the result comes back when they do:
// one roll on the task's stat (same d20 rule, backup and short-handed as on jobs), then the
// reward or the cost. Modest by design: jobs stay the main earner (DESIGN.md).
//
// Death rule: nothing on a side task can kill anyone. The worst is a light injury, heat +1,
// or being held by the police for a day.

import { SIDE_TASKS } from '../data/sideTasks.js';
import { CLIENTS } from '../data/clients.js';
import { CAST } from '../data/cast.js';
import { NAMES } from '../config/names.js';
import { availability, crewRoll, worsenInjury, setInjury } from './crew.js';
import { successChance, riskLabel } from './risk.js';
import { nextRng } from './random.js';
import { d20 } from './rng.js';
import { gainXp } from './development.js';
import { adjustTrust } from './clients.js';
import { clampHeat } from './heat.js';
import { money } from './money.js';
import { pick, makeRng } from './rng.js';
import { noteInjury } from './earned.js';

export const SIDE_BOARD_SIZE = 5;
export const SIDE_DIFFICULTY = 6; // rookie-job level: a 9 in the stat needs a 7 on the die
export const SIDE_PAY_PER_DAY = 250; // per person sent, on a money task
export const SIDE_XP_PER_DAY = { training: 3, other: 1 }; // growth in the task's stat, per person per day
export const SIDE_TRUST = 3;
export const INTEL_DAYS = 7;
export const INTEL_BONUS = 1;
export const SIDE_FATIGUE_PER_DAY = 5;

export const sideTaskById = (id) => SIDE_TASKS.find((t) => t.id === id) ?? null;
const districtText = (d) => NAMES.districtsInText?.[d] ?? NAMES.districts?.[d] ?? d;
const clientName = (id) => CLIENTS.find((c) => c.id === id)?.name ?? id;

/** The task's pitch with cast names filled in. */
export const sidePitch = (task) => task.pitch.replace(/\{(\w+)\}/g, (m, k) => CAST[k]?.name ?? m);

/** What a task gives if it goes well, in a few words (for the board and the plan). */
export function sideReward(task, crewCount = task.crew) {
  if (task.purpose === 'money') return `${money(SIDE_PAY_PER_DAY * task.days * crewCount)}`;
  if (task.purpose === 'training') return `growth in ${task.stat}`;
  if (task.purpose === 'trust') return `${clientName(task.client)}: trust +${SIDE_TRUST}`;
  return `intel: +${INTEL_BONUS} on every roll in ${districtText(task.district)} jobs for a week`;
}

/** What going badly costs, in a few words. */
export function sideCost(task) {
  const f = task.fail ?? {};
  if (f.injury) return 'a light injury';
  if (f.heat) return `heat +${f.heat}`;
  if (f.held) return `held by the police ${f.held === 1 ? 'a day' : `${f.held} days`}`;
  return task.purpose === 'money' && task.failPay ? 'part of the pay' : 'nothing but the time';
}

/**
 * Monday: a fresh board of side tasks, spread across districts. Drawn from the save's seed and
 * the week (like job arrivals in jobs.js), so it never shifts the game's other dice. Mutates the
 * (cloned) state.
 */
export function refreshSideBoard(state) {
  const monday = state.day - ((state.day - 1) % 7);
  const rng = makeRng((state.seed ^ Math.imul(monday + 7919, 2246822519)) >>> 0);
  const pool = [...SIDE_TASKS];
  const board = [];
  while (board.length < SIDE_BOARD_SIZE && pool.length) {
    // Prefer a district not on the board yet, so the week offers a spread.
    const fresh = pool.filter((t) => !board.some((b) => sideTaskById(b).district === t.district));
    const t = pick(rng, fresh.length ? fresh : pool);
    board.push(t.id);
    pool.splice(pool.indexOf(t), 1);
  }
  state.sideBoard = board;
}

/** Who would roll and how likely it goes well, for a task and a picked crew: { op, value, notes, chance, risk }. */
export function sideOdds(state, task, crewIds) {
  const crew = crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  if (!crew.length) return null;
  const r = crewRoll(crew, task.stat, { recommended: task.crew, job: { side: true, solo: crew.length === 1, district: task.district } });
  const chance = successChance(r.value, SIDE_DIFFICULTY);
  return { ...r, chance, risk: riskLabel(chance) };
}

/** Send people on a side task from this week's board. They're away until it's done. */
export function sendOnSideTask(prev, taskId, crewIds) {
  const task = sideTaskById(taskId);
  if (!task || !(prev.sideBoard ?? []).includes(taskId)) return prev;
  if (!crewIds.length || crewIds.length > task.crew) return prev;
  const crew = crewIds.map((id) => prev.crew.find((o) => o.id === id));
  if (crew.some((o) => !o || o.freelance || !availability(prev, o).ok)) return prev;
  const state = structuredClone(prev);
  const returnDay = state.day + task.days;
  for (const id of crewIds) state.crew.find((o) => o.id === id).condition.awayUntil = returnDay;
  state.sideBoard = state.sideBoard.filter((id) => id !== taskId);
  state.sideOut = [...(state.sideOut ?? []), { taskId, crewIds, returnDay }];
  const who = crew.map((o) => o.handle).join(' and ');
  state.inbox.unshift({
    id: `side-sent-${taskId}-${state.day}`, type: 'job', day: state.day,
    subject: `${who} ${crew.length > 1 ? 'are' : 'is'} on ${task.name}`,
    body: `${sidePitch(task)} Back ${task.days === 1 ? 'tomorrow' : `in ${task.days} days`}.`,
    blocking: false, read: true,
  });
  return state;
}

/** Intel from an info task on this district, if still fresh: { bonus, source } or null. */
export function intelFor(state, district) {
  const i = state.intel?.[district];
  return i && i.until >= state.day ? { bonus: INTEL_BONUS, source: i.source } : null;
}

/** Daily: side tasks whose crew is back today resolve and report. Mutates the (cloned) state. */
export function returnSideTasks(state) {
  const due = (state.sideOut ?? []).filter((s) => s.returnDay <= state.day);
  if (!due.length) return;
  state.sideOut = state.sideOut.filter((s) => s.returnDay > state.day);
  for (const s of due) resolve(state, s);
}

function resolve(state, { taskId, crewIds }) {
  const task = sideTaskById(taskId);
  const crew = crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  if (!task || !crew.length) return;
  const roll = crewRoll(crew, task.stat, { recommended: task.crew, job: { side: true, solo: crew.length === 1, district: task.district } });
  const die = d20(nextRng(state));
  const need = 10 + SIDE_DIFFICULTY;
  const success = die + roll.value >= need;
  const results = [];

  if (task.purpose === 'money') {
    const pay = Math.round((SIDE_PAY_PER_DAY * task.days * crew.length * (success ? 1 : task.failPay ?? 0)) / 50) * 50;
    state.cash += pay;
    results.push({ tone: pay ? 'good' : 'plain', text: pay ? `Paid ${money(pay)}.` : 'No pay.' });
  }
  if (task.purpose === 'trust' && success) {
    const change = adjustTrust(state, task.client, SIDE_TRUST);
    if (change) results.push({ tone: 'good', text: `${clientName(task.client)} thinks more of you (trust +${change}).` });
  }
  if (task.purpose === 'info' && success) {
    state.intel = { ...(state.intel ?? {}), [task.district]: { until: state.day + INTEL_DAYS, source: task.name } };
    results.push({ tone: 'good', text: `Intel on ${districtText(task.district)}: +${INTEL_BONUS} on every roll in jobs there until day ${state.day + INTEL_DAYS}.` });
  }

  // Everyone sent learns the task's stat; training most, and something even when it goes badly.
  const perDay = task.purpose === 'training' ? SIDE_XP_PER_DAY.training : SIDE_XP_PER_DAY.other;
  const points = Math.max(1, Math.round(perDay * task.days * (success ? 1 : 0.5)));
  const rises = [];
  for (const op of crew) {
    const { events, graduated } = gainXp(op, crew, task.stat, points, state.day);
    rises.push(...events.map((e) => `${e.handle} ${e.stat} ${e.from}→${e.to}`));
    if (graduated) {
      op.history.push(`Day ${state.day}: graduated from rookie`);
      state.inbox.unshift({ id: `graduate-${op.id}-${state.day}`, type: 'crew', day: state.day,
        subject: `${op.handle} isn't a rookie any more`,
        body: `After ${task.name}, nobody on the crew calls ${op.name} the new kid. A pro now, on a rookie's wage.`, blocking: false, read: false });
    }
  }
  if (rises.length) results.push({ tone: 'good', text: `Improved: ${rises.join(', ')}.` });

  if (!success) {
    const f = task.fail ?? {};
    if (f.heat) { state.heat = clampHeat(state.heat + f.heat); results.push({ tone: 'warn', text: `Heat +${f.heat}.` }); }
    if (f.injury) {
      setInjury(roll.op, worsenInjury(roll.op.condition.injury, f.injury));
      noteInjury(state, roll.op, roll.op.condition.injury);
      results.push({ tone: 'bad', text: `${roll.op.handle}: ${roll.op.condition.injury} injury.` });
    }
    if (f.held) {
      roll.op.condition.awayUntil = state.day + f.held;
      results.push({ tone: 'warn', text: `${roll.op.handle} held by the police until day ${state.day + f.held}.` });
    }
  }
  for (const op of crew) {
    op.condition.fatigue = Math.min(100, op.condition.fatigue + SIDE_FATIGUE_PER_DAY * task.days);
    op.history.push(`Day ${state.day}: ${task.name}${success ? '' : ' (went badly)'}`);
  }

  const line = success ? task.success : task.failure;
  state.inbox.unshift({
    id: `side-${taskId}-${state.day}-${state.rngCounter}`, type: 'report', day: state.day,
    subject: `${task.name}: ${success ? 'done' : 'went badly'}`,
    body: [line, ...results.map((r) => r.text)].join(' '),
    timeline: {
      result: success ? 'completed' : 'setback', steps: [line], outcome: results,
      side: { taskId, actor: roll.op.handle, stat: task.stat, value: roll.value, notes: roll.notes, die, need, success },
    },
    blocking: false, read: false,
  });
}

/** Side tasks still out: [{ returnDay, name, crewIds }]. */
export function sideTasksOut(state) {
  return (state.sideOut ?? []).map((s) => ({ returnDay: s.returnDay, name: sideTaskById(s.taskId)?.name ?? s.taskId, crewIds: s.crewIds }));
}
