// Raids on the tong's halls (DESIGN.md 2026-11-05, the tong's Phase 2, slice 3: police raids).
// Pure logic.
//
// Heat is police attention. Each day a district where we have a hall is at RAID.heatAt or more, a
// seeded roll (RAID.dailyChance) can bring a warning: the police will come in RAID.warnDays days.
// Until then the player gets ready with what exists (move people in or out, keep crews home), and
// where the police are on the take (data/raids.js RAID_POLICE) can pay them off. On the day, a
// blocking call: hold the hall, walk out (the exit), or pay at the door where that's possible.
//
// Holding is a fight on the hall's map (core/battle.js, core/runbattle.js): the raid runs as a job
// of its own, 'raid:<district>', with one battle step, and finish() hands its ending to finishRaid.
// The death rule holds as in every fight: someone at death's door is a call-in, and only "keep
// fighting" (push on) can cost a life. Walking out is an exit: nobody is hurt; the hall loses what
// was kept there, needs repairs, and stays shut for a week (its people lie low, no work).
//
// state.raids (save v40): [{ id, district, by, warnedDay, day, answer, outcome, done }]. answer:
// null, 'paid' (before the day), 'hold', 'withdraw', 'pay'. hall.shutUntil: the day it opens again.

import { RAID, RAID_POLICE, raidTemplate } from '../data/raids.js';
import { HOME_HALL } from '../data/halls.js';
import { NAMES } from '../config/names.js';
import { heatIn, setHeat } from './heat.js';
import { hallIn, residents } from './halls.js';
import { hashRng } from './rng.js';
import { nextRng } from './random.js';
import { buildBattle, planIntents } from './battle.js';
import { spotsForJob } from './fightspots.js';
import { rollTarget } from './risk.js';
import { setInjury } from './crew.js';
import { recordSummary } from './record.js';
import { money } from './money.js';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weekday = (day) => WEEKDAYS[(day - 1) % 7];
const inText = (d) => NAMES.districtsInText?.[d] ?? NAMES.districts?.[d] ?? d;
const hallName = (d) => `the ${NAMES.districts?.[d] ?? d} hall`.replace('the The ', 'the ');
const round50 = (n) => Math.round(n / 50) * 50;
const police = (d) => RAID_POLICE[d] ?? { who: 'the police', onTake: false };
/** Who comes through the door in a district's raid, capitalised for the start of a line: "The Wet Sleeve". */
/** Who comes, as written mid-line: "the Wet Sleeve", "Veridian-Apex security". */
export const raidBy = (d) => police(d).who;
export const raidWho = (d) => `${police(d).who[0].toUpperCase()}${police(d).who.slice(1)}`;
const andNames = (ops) => (ops.length > 1 ? `${ops.slice(0, -1).map((o) => o.handle).join(', ')} and ${ops.at(-1).handle}` : ops[0]?.handle ?? '');

/** The raid on a district's hall that hasn't happened yet (warned, or waiting on the call), or null. */
export const raidOn = (state, district) => (state.raids ?? []).find((r) => r.district === district && !r.done) ?? null;

/** Every raid still to come or waiting on the player, soonest first. */
export const openRaids = (state) => (state.raids ?? []).filter((r) => !r.done).sort((a, b) => a.day - b.day);

/** Is this hall shut after a raid (its people lying low)? */
export const hallShut = (state, district) => (hallIn(state, district)?.shutUntil ?? 0) > state.day;

/** Is this runner's hall shut today? */
export const lyingLow = (state, op) => !op.freelance && hallShut(state, op.hall ?? HOME_HALL);

/** What the police on the take want to call it off: dearer the hotter it is, and dearer on the day. */
export function raidPrice(state, raid, { late = false } = {}) {
  const p = RAID.bribe.base + RAID.bribe.perHeat * heatIn(state, raid.district);
  return round50(p * (late ? RAID.lateBribe : 1));
}

/** Can this raid be paid off now? Only where the police are on the take, and only once. */
export const canBuyOff = (state, raid) => police(raid.district).onTake;

/** Who holds the hall if it comes to it: residents at home, on their feet (not out, not badly hurt). */
export function defenders(state, district) {
  const out = new Set([
    ...(state.awayJobs ?? []).flatMap((j) => [...j.mission.crewIds, j.mission.overwatch?.id, j.mission.wheels, j.mission.standby?.id]),
    ...(state.sideOut ?? []).flatMap((t) => t.crewIds ?? []),
    ...(state.activeMission?.crewIds ?? []),
  ].filter(Boolean));
  return residents(state, district).filter((op) => !out.has(op.id)
    && !((op.condition.awayUntil ?? 0) > state.day)
    && ['healthy', 'light'].includes(op.condition.injury ?? 'healthy'));
}

/** The raiders' strength: the hotter the district, the more of them and the harder they are. */
export const raidThreat = (state, district) => Math.max(1, Math.min(4, heatIn(state, district) - 6)); // heat 7: 1 … heat 10: 4 (measured: 2 rookies hold ~1 in 5 at heat 9)

/** What walking out costs: what was kept there (no more than we have) and the repairs. */
export function withdrawCost(state, district) {
  const level = hallIn(state, district)?.level ?? 1;
  return { kept: Math.min(RAID.keptPerLevel * level, Math.max(0, state.cash)), repairs: RAID.repairs };
}

// --- the warning and the day ---------------------------------------------------------------------

function warn(state, district) {
  const id = `raid-${district}-${state.day}`;
  const day = state.day + RAID.warnDays;
  const who = police(district).who;
  const raid = { id, district, by: 'police', warnedDay: state.day, day, answer: null, outcome: null, done: false };
  state.raids = [...(state.raids ?? []), raid];
  const buy = police(district).onTake ? ` They're on the take here: ${money(raidPrice(state, raid))} would make it go away.` : ' Nobody here can be paid to make it go away.';
  state.inbox.unshift({
    id: `raid-warn-${id}`, type: 'warning', kind: 'raid-warning', day: state.day,
    subject: `Raid warned: ${hallName(district)}, ${weekday(day)}`,
    body: `Word from ${inText(district)}: ${who} have been asking about our hall there, and they mean to come through the door on ${weekday(day)}. Heat there is ${heatIn(state, district)}/10. Whoever is home that day can hold it, or walk out the back.${buy}`,
    payload: { raidId: id, district }, blocking: false, read: false,
  });
  return raid;
}

/** The day's call, when they're at the door. Options are live: who's home, what we have. */
export function raidChoices(state, raid) {
  const home = defenders(state, raid.district);
  const cost = withdrawCost(state, raid.district);
  const price = raidPrice(state, raid, { late: true });
  return [
    ...(home.length ? [{ id: 'hold', label: `Hold the hall (${andNames(home)})`, cost: 'A fight at the door, on your orders. Someone could get hurt. Nobody dies unless you choose to keep fighting with them down.', disabled: !!state.activeMission, reason: state.activeMission ? 'Finish the job on screen first' : '' }] : []),
    { id: 'withdraw', label: 'Walk out the back', cost: `Everyone gets out, nobody hurt. We lose what was kept there (${money(cost.kept)}) and ${money(cost.repairs)} in repairs; the hall is shut for a week (its people lie low, no work). Heat there −${RAID.withdrawCools}.`, exit: true, disabled: false, reason: '' },
    ...(canBuyOff(state, raid) ? [{ id: 'pay', label: `Pay them at the door (${money(price)})`, cost: 'It ends here. They\'ll remember we pay.', disabled: state.cash < price, reason: state.cash < price ? 'Not enough cash' : '' }] : []),
  ];
}

function callMessage(state, raid) {
  const home = defenders(state, raid.district);
  return {
    id: `raid-call-${raid.id}`, type: 'warning', kind: 'raid', day: state.day,
    subject: `${raidWho(raid.district)} at the door: ${hallName(raid.district)}`,
    body: `${police(raid.district).who[0].toUpperCase()}${police(raid.district).who.slice(1)} are on the stairs of ${hallName(raid.district)}. ${home.length ? `${andNames(home)} ${home.length > 1 ? 'are' : 'is'} home.` : 'Nobody of ours is home to hold it.'} They need your call now.`,
    options: raidChoices(state, raid).map(({ id, label }) => ({ id, label })),
    payload: { raidId: raid.id, district: raid.district }, blocking: true, resolved: false, read: false,
  };
}

/**
 * The day tick (time.js advanceDay): raids due today knock (a raid paid off passes quietly), then
 * each hall in a hot district may draw a warning. Mutates the (cloned) state.
 */
export function checkRaids(state) {
  for (const raid of openRaids(state).filter((r) => r.day <= state.day && !r.called)) {
    if (raid.answer === 'paid') {
      Object.assign(raid, { done: true, outcome: 'paid' });
      state.inbox.unshift({ id: `raid-quiet-${raid.id}`, type: 'warning', day: state.day, subject: `${weekday(state.day)} passes quietly at ${hallName(raid.district)}`, body: 'Nobody comes up the stairs. The money did its work.', blocking: false, read: false });
      continue;
    }
    raid.called = true;
    state.inbox.unshift(callMessage(state, raid));
  }
  for (const hall of state.halls ?? []) {
    const d = hall.district;
    if (heatIn(state, d) < RAID.heatAt || raidOn(state, d)) continue;
    const last = (state.raids ?? []).filter((r) => r.district === d).at(-1);
    if (last && state.day - last.warnedDay < RAID.cooldownDays) continue;
    if (hashRng(state.seed, 'raid', d, state.day)() < RAID.dailyChance) warn(state, d);
  }
  return state;
}

/** Pay the police off before the day, where they're on the take. Returns the new state, or prev. */
export function payOffRaid(prev, raidId) {
  const raid = (prev.raids ?? []).find((r) => r.id === raidId);
  if (!raid || raid.done || raid.answer || raid.called || !canBuyOff(prev, raid)) return prev;
  const price = raidPrice(prev, raid);
  if (prev.cash < price) return prev;
  const state = structuredClone(prev);
  const r = state.raids.find((x) => x.id === raidId);
  state.cash -= price;
  r.answer = 'paid';
  r.paid = price;
  return state;
}

// --- the outcomes ----------------------------------------------------------------------------------

function closeRaid(state, raid, outcome, text) {
  Object.assign(raid, { done: true, outcome, answer: raid.answer ?? outcome });
  state.inbox.unshift({ id: `raid-end-${raid.id}`, type: 'warning', kind: 'raid-end', day: state.day, subject: text.subject, body: text.body, payload: { raidId: raid.id, district: raid.district, outcome }, blocking: false, read: false });
}

/** Walk out the back: nobody hurt; the hall loses what was kept there, needs repairs, and shuts a week. */
function withdraw(state, raid, how = 'We walked out the back before they reached the top of the stairs.') {
  const d = raid.district;
  const cost = withdrawCost(state, d);
  state.cash -= cost.kept + cost.repairs;
  const hall = hallIn(state, d);
  if (hall) hall.shutUntil = state.day + RAID.shutDays;
  const before = heatIn(state, d);
  setHeat(state, d, before - RAID.withdrawCools);
  raid.answer = raid.answer ?? 'withdraw';
  closeRaid(state, raid, 'withdrew', {
    subject: `We walked out of ${hallName(d)}`,
    body: `${how} They took ${money(cost.kept)} in cash and kit and broke what they could; repairs ${money(cost.repairs)}. The hall is shut for a week, until ${weekday(state.day + RAID.shutDays)} (day ${state.day + RAID.shutDays}): its people lie low and take no work. Heat in ${inText(d)} ${before} → ${heatIn(state, d)}/10.`,
  });
}

/** Resolver for kind 'raid' (decisions.js). Mutates state and msg. */
export function RAID_RESOLVER(state, msg, optionId) {
  const raid = (state.raids ?? []).find((r) => r.id === msg.payload.raidId);
  if (!raid || raid.done) return;
  const choice = raidChoices(state, raid).find((c) => c.id === optionId);
  if (!choice || choice.disabled) return;
  if (optionId === 'withdraw') withdraw(state, raid);
  else if (optionId === 'pay') {
    const price = raidPrice(state, raid, { late: true });
    state.cash -= price;
    raid.answer = 'pay';
    raid.paid = price;
    closeRaid(state, raid, 'paid', { subject: `We paid them at the door of ${hallName(raid.district)}`, body: `${money(price)} changed hands on the stairs and they went back down them. They'll remember we pay.` });
  } else if (optionId === 'hold') {
    raid.answer = 'hold';
    startRaidFight(state, raid);
  } else return;
  msg.resolved = true;
  msg.blocking = false;
  msg.payload.outcome = choice.label;
}

/**
 * Hold the hall: the raid becomes the job on screen, one fight on the hall's map, whoever is home
 * against the raiders. Mutates the (cloned) state.
 */
export function startRaidFight(state, raid) {
  const d = raid.district;
  const tpl = raidTemplate(d);
  const ops = defenders(state, d);
  const threat = raidThreat(state, d);
  const diff = Math.round(rollTarget({ threat }));
  const b = buildBattle({
    incident: 'raid', zone: 'inside', diff, threat, guards: RAID.raiders, crew: ops, approach: 'loud',
    spots: spotsForJob(d, raid.id, tpl.id, 'inside', ops.length),
  });
  b.foe = police(d).who; // the battle lines name them (core/battle.js guardName)
  planIntents(b, nextRng(state));
  const text = `${police(d).who[0].toUpperCase()}${police(d).who.slice(1)} come through the door: ${b.guards.length} of them, against ${andNames(ops)}.`;
  state.activeMission = {
    jobId: raid.id, templateId: tpl.id, raid: raid.id, crewIds: ops.map((o) => o.id), approach: 'loud', days: 0, bribe: 0,
    overwatch: null, wheels: null, standby: null, callIn: 'every', orders: null,
    alert: 0, out: [], pending: null, wentLoud: true, battle: b, fought: true,
    pay: 0, threat, threatDelta: 0, clientId: null, twist: null, askedFor: null, lead: null,
    queue: [{ type: 'battle' }], step: 0, log: [{ kind: 'bad', text }],
    payCut: 0, extraHeat: 0, clientTrust: 0, watched: 0, startedDay: state.day,
    critical: null, stabiliseFailed: false, untreated: [],
    focusOp: null, aborted: false, done: false, result: null, growth: [], graduated: [], report: [text],
    events: [{ kind: 'battle', phase: 'start', from: 'raid', zone: 'inside', text, report: text,
      guards: b.guards.map((g) => ({ n: g.n, hp: g.hp, max: g.max, armour: g.armour, out: g.out, cover: g.cover, at: g.spot != null ? b.spots?.guards?.[g.spot]?.at ?? null : null })),
      runners: b.runners.map((r) => ({ id: r.id, handle: r.handle, hp: r.hp, max: r.max, armour: r.armour, down: r.down, fightOn: r.fightOn, stable: r.stable, cover: r.cover, at: r.spot != null ? b.spots?.crew?.[r.spot]?.at ?? null : null })) }],
  };
  return state;
}

/**
 * The end of a raid fought on screen (called by mission.js finish for a raid). Anyone the player
 * chose to keep fighting with while down faces the push-on rule; pulling back is walking out. Then
 * the hall's outcome, and a result for the watch screen. Mutates the (cloned) state.
 */
export function finishRaid(state) {
  const am = state.activeMission;
  const raid = (state.raids ?? []).find((r) => r.id === am.raid);
  const crew = am.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const medic = crew.some((o) => o.role === 'medic' && !am.untreated.includes(o.id));
  const deaths = [];
  for (const id of am.untreated) {
    const op = state.crew.find((o) => o.id === id);
    if (!op) continue;
    const chance = state.difficulty === 'story' || am.aborted ? 1 : 0.35 + (medic ? 0.3 : 0);
    if (nextRng(state)() < chance) {
      setInjury(op, 'serious');
      op.condition.injuryDays = 21;
      am.report.push(`${op.handle} pulled through. Barely.`);
    } else {
      deaths.push(op);
      am.report.push(`${op.name} "${op.handle}" died of their wounds.`);
    }
  }
  for (const op of deaths) {
    state.crew = state.crew.filter((o) => o.id !== op.id);
    state.memorial.push({ id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, age: op.age, marks: op.marks ?? [], day: state.day, cause: `Died holding ${hallName(am.raid && raid?.district)}`, record: recordSummary(op) });
  }
  for (const op of state.crew) if (deaths.length) op.condition.morale = Math.max(0, op.condition.morale - 15);
  const survivors = crew.filter((o) => !deaths.includes(o));
  for (const op of survivors) {
    op.condition.fatigue = Math.min(100, op.condition.fatigue + 10);
    op.history.push(`Day ${state.day}: ${am.aborted ? 'walked out of' : 'held'} ${hallName(raid?.district)} in a raid`);
  }
  const injuries = survivors.filter((o) => o.condition.injury !== 'healthy').map((o) => `${o.handle} (${o.condition.injury}, ${o.condition.injuryDays}d)`);
  if (raid && !raid.done) {
    if (am.aborted) withdraw(state, raid, 'We pulled back out the back stairs.');
    else {
      const d = raid.district;
      const before = heatIn(state, d);
      setHeat(state, d, before - RAID.holdCools); // seen off: the heat eases
      if (am.pressed) setHeat(state, d, heatIn(state, d) + RAID.pressHeat);
      state.reputation = Math.round(Math.min(100, (state.reputation ?? 0) + RAID.holdRep) * 10) / 10;
      closeRaid(state, raid, 'held', {
        subject: `We held ${hallName(d)}`,
        body: `${am.pressed ? 'They backed off down the stairs, for now.' : 'They went back down the stairs and didn\'t come up again.'} ${injuries.length ? `Hurt: ${injuries.join(', ')}.` : 'Nobody hurt.'} ${deaths.length ? `${deaths.map((o) => o.handle).join(', ')} died.` : ''} Heat in ${inText(d)} ${before} → ${heatIn(state, d)}/10; the district hears we held (reputation +${RAID.holdRep}).`.replace(/\s+/g, ' ').trim(),
      });
    }
  }
  const outcome = deaths.length ? 'loss' : am.aborted ? 'aborted' : 'completed';
  am.result = { report: am.report ?? [], outcome, pay: 0, heatGain: 0, injuries, deaths: deaths.map((d) => d.handle), freelance: [], growth: [], graduated: [], client: null, trustChange: 0, raid: raid?.outcome ?? null };
  am.done = true;
}
