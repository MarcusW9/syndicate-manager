// Expeditions (the adventure log, slice 2; owner, 2026-11-21/22; drafts/HANDOFF-revenue-next.md). Pure logic.
//
// Our own tong's errands: a crew goes out for a few days to get something specific (a weapon, cash, a
// recruit), sent from Jobs › Expeditions, not the board. No client, no pay, no fame: the goal is the reward.
// Each day writes the log (core/advlog.js): day 1 opens and names a contact or a place; the days between
// roll progress on the goal's stats (a lead, a dead end, a snag that costs a little, a find on the side, a
// quiet day, callbacks to what day 1 named); the last day turns (the goal in reach, or not) and closes:
// met, partial or failed. Finds pay out as they happen (cash, a piece of gear, a rumour: intel).
//
// A rough turn can break into a fight that calls the player in, as on a hit post (engine 2, holdYard):
// watch it, let them fight it on steady orders, or pull out (everyone home). The fight counts in the fight
// record only (record.js recordFight). The crew can be pulled out any other day too, everyone safe. Death
// only as any engine-2 fight allows (committed risk, or pushing on at death's door): cautious and steady
// lose nobody. Snags hurt at most lightly.
//
// Randomness: hashRng from the seed, the trip and the day for the days (so no other roll moves); the
// prize is made when the crew sets out and the fight draws as posts' fights do.

import { GOALS, EXPEDITION, EXPEDITION_DISTRICTS, expeditionTemplate } from '../data/expeditions.js';
import { POST_THREAT } from '../data/contracts.js';
import { NAMES } from '../config/names.js';
import { availability, crewRoll, worsenInjury, setInjury, INJURY_DAYS } from './crew.js';
import { successChance, riskLabel, rollTarget } from './risk.js';
import { d20, hashRng } from './rng.js';
import { gainXp } from './development.js';
import { keepGrowth, sumGrowth, growthText } from './grew.js';
import { moveCash, money } from './money.js';
import { noteInjury } from './earned.js';
import { nextRng } from './random.js';
import { COUNT_BY_THREAT, FIGHT } from '../data/fights.js';
import { recordSummary, recordFight } from './record.js';
import { checkMilestones } from './milestones.js';
import { pickSite } from '../data/sites.js';
import { stageSpots, stageNeed } from './fightmap.js';
import { buildFight, fightDiff, startRound } from './fight.js';
import { fightSnapshot, stageOf } from './runfight.js';
import { autoRun } from './autorun.js';
import { closeMission } from './mission.js';
import { makeItem, itemName } from './gear.js';
import { typeAt } from './loot.js';
import { generateRecruit, LEAD_DAYS } from './recruits.js';
import { INTEL_DAYS, INTEL_BONUS } from './sidetasks.js';
import { goalLine, startFacts, capLog, jossClose } from './advlog.js';

const districtText = (d) => NAMES.districtsInText?.[d] ?? NAMES.districts?.[d] ?? d;
const names = (ops) => (ops.length > 1 ? `${ops.slice(0, -1).map((o) => o.handle).join(', ')} and ${ops.at(-1).handle}` : ops[0]?.handle ?? 'The crew');
const between = (rng, [lo, hi]) => Math.round((lo + rng() * (hi - lo)) / 50) * 50;
const weightedKey = (r, table) => { let acc = 0; for (const [k, w] of Object.entries(table)) { acc += w; if (r < acc) return k; } return Object.keys(table).at(-1); };
// A snag line that says someone got hurt costs a light injury; any other snag costs a little cash.
export const HURT = /\b(scrape|scraped|bruise|bruised|bruises|knuckle|shin|hip|wrist|finger|palm|plaster|dressing|cut)\b/i;

export const expeditionsOf = (state) => state.expeditions ?? { active: [], seq: 0 };
export const expeditionById = (state, id) => expeditionsOf(state).active.find((e) => e.id === id) ?? null;
const crewOf = (state, e) => e.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter((o) => o && o.condition.injury !== 'dead');

/** The slots a trip's lines fill: the weapon hunted, the sum, the recruit. */
function extraFor(e) {
  const x = {};
  if (e.prize?.item) {
    const kind = itemName({ type: e.prize.item.type }).toLowerCase();
    x.itemFull = e.prize.item.name ? `a ${kind} called the ${e.prize.item.name}` : `a ${kind}`;
    x.item = e.prize.item.name ? `the ${e.prize.item.name}` : `the ${kind}`;
  }
  if (e.prize?.recruit) {
    const r = e.prize.recruit;
    x.lead = `${/^[aeiou]/i.test(r.role) ? 'an' : 'a'} ${r.role} called ${r.handle}`;
    x.leadShort = `the ${r.role}`;
  }
  return x;
}

/**
 * The read before sending: who rolls on each of the goal's stats, the chance a day goes their way, and the
 * chance the goal is met (at least `need` good days out of the days between). { reads, chance, met, risk } or null.
 */
export function expeditionOdds(state, goal, crewIds, district = EXPEDITION_DISTRICTS[0]) {
  const g = GOALS[goal];
  const crew = crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  if (!g || !crew.length) return null;
  const reads = g.stats.map((stat) => {
    const r = crewRoll(crew, stat, { recommended: 2, job: { side: true, solo: crew.length === 1, district } });
    return { stat, op: r.op, value: r.value, chance: successChance(r.value, EXPEDITION.difficulty) };
  });
  const p = (1 - EXPEDITION.findChance) * reads.reduce((n, r) => n + r.chance, 0) / reads.length;
  const n = g.days - 2;
  const binom = (k) => { let c = 1; for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1); return c * p ** k * (1 - p) ** (n - k); };
  let met = 0;
  for (let k = g.need; k <= n; k++) met += binom(k);
  return { reads, chance: p, met, risk: riskLabel(met) };
}

/** Can this crew go? Everyone free, one to EXPEDITION.maxCrew, no freelancers. */
export function canSend(state, goal, district, crewIds) {
  if (!GOALS[goal]) return { ok: false, reason: 'Pick a goal' };
  if (!EXPEDITION_DISTRICTS.includes(district)) return { ok: false, reason: 'Pick a district' };
  if (expeditionsOf(state).active.length >= EXPEDITION.maxOut) return { ok: false, reason: `${EXPEDITION.maxOut} already out` };
  if (!crewIds.length) return { ok: false, reason: 'Pick who goes' };
  if (crewIds.length > EXPEDITION.maxCrew) return { ok: false, reason: `At most ${EXPEDITION.maxCrew}` };
  for (const id of crewIds) {
    const op = state.crew.find((o) => o.id === id);
    if (!op || op.freelance) return { ok: false, reason: 'Only our own runners' };
    const a = availability(state, op);
    if (!a.ok) return { ok: false, reason: `${op.handle}: ${a.reason}` };
  }
  return { ok: true, reason: '' };
}

/** Send a crew on an expedition. They're away for the goal's days; the prize is settled now (what they'll be after). */
export function sendExpedition(prev, { goal, district, crewIds }) {
  if (!canSend(prev, goal, district, crewIds).ok) return prev;
  const state = structuredClone(prev);
  const ex = (state.expeditions ??= { active: [], seq: 0 });
  ex.seq += 1;
  const g = GOALS[goal];
  const id = `x${ex.seq}`;
  const rng = hashRng(state.seed, 'expedition', id, state.day);
  const prize = {};
  if (goal === 'weapon') prize.item = makeItem(state, weightedKey(rng(), EXPEDITION.prizeTypes), weightedKey(rng(), EXPEDITION.prizeTiers));
  if (goal === 'cash') prize.cash = EXPEDITION.cashPerPersonDay * g.days * crewIds.length;
  if (goal === 'recruit') prize.recruit = generateRecruit(state, { quality: rng() < 0.25 ? 'veteran' : 'pro' });
  const e = { id, goal, district, crewIds: [...crewIds], startDay: state.day, days: g.days, endDay: state.day + g.days, progress: 0, prize, facts: startFacts(state.seed, id, district), log: [], finds: [], waiting: false, grew: [], graduated: [] };
  ex.active.push(e);
  for (const opId of crewIds) state.crew.find((o) => o.id === opId).condition.awayUntil = e.endDay;
  const crew = crewOf(state, e);
  state.inbox.unshift({
    id: `exp-sent-${id}`, type: 'job', day: state.day,
    subject: `${names(crew)} ${crew.length > 1 ? 'are' : 'is'} off after ${g.name.toLowerCase()}`,
    body: `${g.pitch} In ${districtText(district)}, back in ${g.days} days unless you pull them out. Their log comes in a line a day (Jobs › Expeditions).`,
    blocking: false, read: true,
  });
  return state;
}

/** Daily (time.js, after posts): each expedition out plays its day. Mutates the (cloned) state. */
export function tickExpeditions(state) {
  for (const e of [...expeditionsOf(state).active]) {
    if (e.waiting) continue;
    const d = state.day - e.startDay;
    if (d < 1 || e.log.some((l) => l.day === d && !l.turn)) continue;
    const crew = crewOf(state, e);
    if (!crew.length) { closeExpedition(state, e, 'failed', { text: 'Nobody was left to carry on.' }); continue; }
    playDay(state, e, d, crew);
  }
}

const line = (state, e, d, crew, beat, opts = {}) => goalLine({ seed: state.seed, tripId: e.id, day: d, crew, district: e.district, facts: e.facts, goal: e.goal, beat, extra: { ...extraFor(e), ...(opts.extra ?? {}) }, ...opts });
const write = (e, entry) => { e.log.push(entry); capLog(e.log); };
/** A line's day without its aside, and the aside (or Joss's word) kept apart for the report's tap (core/advlog.js writeDay). */
const said = (l, fallback, after = '') => ({ text: [l?.main ?? l?.text ?? fallback, after].filter(Boolean).join(' '), ...(l?.more ? { more: l.more } : {}) });

function playDay(state, e, d, crew) {
  const g = GOALS[e.goal];
  const rng = hashRng(state.seed, 'expedition', e.id, d);
  for (const op of crew) {
    op.condition.fatigue = Math.min(100, op.condition.fatigue + EXPEDITION.fatiguePerDay);
    (op.track ??= {}).lastWorked = state.day; // an expedition is work: no rest for Burned Out
  }
  if (d === 1) {
    const l = line(state, e, d, crew, 'open');
    write(e, { day: d, tone: 'plain', ...said(l, 'The crew set out.') });
    return;
  }
  if (d >= e.days) { turn(state, e, d, crew, rng); return; }

  // A find on the side, instead of a progress roll.
  if (rng() < EXPEDITION.findChance) { find(state, e, d, crew, rng); return; }
  const stat = g.stats[Math.floor(rng() * g.stats.length)];
  const roll = crewRoll(crew, stat, { recommended: 2, job: { side: true, solo: crew.length === 1, district: e.district } });
  const die = d20(rng);
  const success = die + roll.value >= 10 + EXPEDITION.difficulty;
  for (const op of crew) keepGrowth(state, e, op, gainXp(op, crew, stat, EXPEDITION.xpPerDay, state.day), `${g.name.toLowerCase()} expedition`);
  // A callback brings back what day 1 named (a third of the time, once there is something to call back).
  const back = rng() < 0.35 ? (e.facts.met ? 'callbackContact' : e.facts.placed ? 'callbackPlace' : null) : null;
  if (success) {
    e.progress += 1;
    const l = (back && line(state, e, d, crew, `${back}.lead`)) || line(state, e, d, crew, 'lead', { pairOk: true });
    write(e, { day: d, tone: 'good', ...said(l, 'A step closer.'), stat });
    return;
  }
  if (die <= EXPEDITION.snagDie) {
    const l = (back && line(state, e, d, crew, `${back}.snag`)) || line(state, e, d, crew, 'snag', { local: 'snag' });
    snag(state, e, d, crew, l, rng);
    return;
  }
  const dead = rng() < 0.6;
  const l = dead ? ((back && line(state, e, d, crew, `${back}.deadEnd`)) || line(state, e, d, crew, 'deadEnd'))
    : line(state, e, d, crew, 'quiet.any', { pairOk: true, local: 'quiet' });
  write(e, { day: d, tone: 'plain', ...said(l, 'Nothing moved.'), stat, quiet: true });
}

/** A snag's cost: a light injury when the line says someone got hurt, else a little cash. */
function snag(state, e, d, crew, l, rng) {
  const who = crew.find((o) => o.id === l?.whoId) ?? crew[0];
  let cost;
  if (l && HURT.test(l.text)) {
    setInjury(who, worsenInjury(who.condition.injury, 'light'));
    noteInjury(state, who, who.condition.injury);
    cost = `${who.handle}: ${who.condition.injury} injury.`;
  } else {
    const amount = Math.min(Math.max(0, state.cash), between(rng, EXPEDITION.snagCash));
    moveCash(state, -amount, 'Lost on a trip');
    e.spent = (e.spent ?? 0) + amount;
    cost = amount ? `−${money(amount)}.` : '';
  }
  write(e, { day: d, tone: 'warn', ...said(l, 'Something went against them.', cost) });
}

/** A find on the side: cash at once, a Standard piece to the stash, or a rumour (intel on the district for a week). */
function find(state, e, d, crew, rng) {
  const r = rng();
  const kind = r < 0.5 ? 'cash' : r < 0.75 ? 'gear' : 'rumour';
  if (kind === 'cash') {
    const amount = between(rng, EXPEDITION.findCash);
    const l = line(state, e, d, crew, 'find.cash', { extra: { cash: money(amount) } });
    moveCash(state, amount, 'Found on a trip');
    e.finds.push(`${money(amount)} found`);
    write(e, { day: d, tone: 'good', ...said(l, `${money(amount)} turned up.`, `+${money(amount)}.`) });
    return;
  }
  if (kind === 'gear') {
    const item = makeItem(state, typeAt('standard', rng()), 'standard');
    (state.stash ??= []).push(item);
    const l = line(state, e, d, crew, 'find.gear');
    e.finds.push(`${item.name ?? itemName(item)} (${itemName({ ...item, tier: null }).toLowerCase()})`);
    write(e, { day: d, tone: 'good', ...said(l, 'Something useful turned up.', `To the stash: ${itemName({ ...item, tier: null }).toLowerCase()}.`) });
    return;
  }
  state.intel = { ...(state.intel ?? {}), [e.district]: { until: state.day + INTEL_DAYS, source: `a rumour from the ${GOALS[e.goal].name.toLowerCase()} hunt` } };
  const l = line(state, e, d, crew, 'find.rumour');
  e.finds.push(`a rumour: +${INTEL_BONUS} on jobs in ${districtText(e.district)} for a week`);
  write(e, { day: d, tone: 'good', ...said(l, 'A rumour, for later.', `Intel: +${INTEL_BONUS} on jobs in ${districtText(e.district)} until day ${state.day + INTEL_DAYS}.`) });
}

/** The last day: the goal in reach or not. A rough turn may break into a fight that calls you in; otherwise they close. */
function turn(state, e, d, crew, rng) {
  const g = GOALS[e.goal];
  const good = e.progress >= g.need;
  const l = line(state, e, d, crew, good ? 'turn.good' : 'turn.rough');
  write(e, { day: d, tone: good ? 'good' : 'warn', ...said(l, good ? 'Within reach.' : 'It got harder.'), turn: true });
  if (!good && rng() < EXPEDITION.callChance) { callIn(state, e, d, crew); return; }
  closeExpedition(state, e, good ? 'met' : e.progress >= g.need - 1 && e.progress > 0 ? 'partial' : 'failed');
}

const countWord = (n) => ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][n] ?? String(n);
export const expeditionThreat = (e) => Math.max(1, Math.min(5, EXPEDITION.threat + (POST_THREAT[e.district] ?? 1)));

/** The deal goes wrong: a blocking call. Watch the fight, let them fight it, or pull out (everyone home). */
function callIn(state, e, d, crew) {
  const l = line(state, e, d, crew, 'call');
  const n = COUNT_BY_THREAT[expeditionThreat(e)];
  const text = l?.text ?? 'The deal went wrong, and they are calling it in.';
  write(e, { day: d, tone: 'bad', ...said(l, 'The deal went wrong, and they are calling it in.') });
  e.waiting = true;
  for (const op of crew) op.condition.awayUntil = Math.max(op.condition.awayUntil ?? 0, state.day + 1); // out until it's answered
  state.inbox.unshift({
    id: `exp-call-${e.id}`, type: 'job', day: state.day, kind: 'expedition',
    subject: `${GOALS[e.goal].name}: they are calling in`,
    body: text,
    options: [
      { id: 'fight', label: 'Watch the fight' },
      { id: 'auto', label: 'Let them fight it' },
      { id: 'give', label: 'Pull out and come home' },
    ],
    payload: { expeditionId: e.id, enemies: n },
    blocking: true, read: false,
  });
}

/** Decision messages (core/decisions.js): the answer to an expedition's call. Mutates. */
export function EXPEDITION_RESOLVER(state, msg, optionId) {
  const e = expeditionById(state, msg.payload?.expeditionId);
  if (!e) { msg.resolved = true; msg.blocking = false; return; }
  if (optionId === 'give') {
    msg.resolved = true; msg.blocking = false;
    msg.payload.outcome = 'They pulled out. Everyone is coming home.';
    closeExpedition(state, e, e.progress >= GOALS[e.goal].need - 1 && e.progress > 0 ? 'partial' : 'failed', { text: 'The crew pulled out before it got worse and came home.' });
    return;
  }
  if (optionId !== 'fight' && optionId !== 'auto') return;
  if (state.activeMission) return; // one fight on screen at a time
  msg.resolved = true; msg.blocking = false;
  msg.payload.outcome = optionId === 'fight' ? 'You took the call: the fight is on screen.' : 'They fought it on steady orders.';
  startExpeditionFight(state, e, { auto: optionId === 'auto' });
  if (optionId === 'auto') {
    const done = closeMission(autoRun(state, 'steady'));
    for (const key of Object.keys(state)) delete state[key];
    Object.assign(state, done);
  }
}

/** The fight (engine 2, holdYard: rout them) on the district's map. Mutates the (cloned) state. */
export function startExpeditionFight(state, e, { auto = false } = {}) {
  const tpl = expeditionTemplate(e.district, e.goal);
  const crew = crewOf(state, e).filter((o) => o.condition.injury !== 'critical');
  const threat = expeditionThreat(e);
  const site = pickSite(e.district, e.id, tpl.id);
  const b = buildFight({ type: 'holdYard', diff: fightDiff(Math.round(rollTarget({ threat }))), threat, site: e.district, job: null, crew, approach: 'loud', risk: 'steady', watched: !auto }, nextRng(state));
  b.auto = auto;
  b.spots = stageSpots(site, 'target', stageNeed(crew.length));
  b.startLines = [...startRound(b, nextRng(state))];
  const text = e.log.at(-1)?.text ?? 'The deal went wrong.';
  state.activeMission = {
    jobId: e.id, templateId: tpl.id, expedition: e.id, crewIds: crew.map((o) => o.id), approach: 'loud', days: 0, bribe: 0,
    overwatch: null, wheels: null, standby: null, callIn: auto ? 'never' : 'every', orders: auto ? 'steady' : null,
    alert: 0, out: [], pending: null, wentLoud: true, battle: b, fought: true,
    pay: 0, threat, threatDelta: 0, clientId: null, twist: null, askedFor: null, lead: null,
    queue: [{ type: 'battle' }], step: 0, log: [{ kind: 'bad', text }],
    payCut: 0, extraHeat: 0, clientTrust: 0, watched: 0, startedDay: state.day, zone: 'target',
    critical: null, stabiliseFailed: false, untreated: [],
    focusOp: null, aborted: false, done: false, result: null, growth: [], graduated: [], report: [text],
    events: [{ kind: 'battle', phase: 'start', from: 'expedition', zone: 'target', text, report: text, ...fightSnapshot(b), stage: stageOf(b) }],
  };
  return state;
}

/**
 * The end of an expedition's fight (from mission.js finish): the fight's own costs as on a post (deaths only
 * as engine 2 allows; a pull-back saves everyone), the fight record, then the trip closes: won is the goal
 * met, a pull-back a partial at best. No fame or standing. Mutates.
 */
export function finishExpeditionFight(state) {
  const am = state.activeMission;
  const e = expeditionById(state, am.expedition);
  const crew = am.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const medic = crew.some((o) => o.role === 'medic' && !am.untreated.includes(o.id));
  const deaths = [];
  for (const id of am.fightDead ?? []) {
    const op = state.crew.find((o) => o.id === id);
    if (op && !deaths.includes(op)) { deaths.push(op); am.report.push(`${op.name} "${op.handle}" died in the fight.`); }
  }
  for (const id of am.untreated) {
    const op = state.crew.find((o) => o.id === id);
    if (!op || deaths.includes(op)) continue;
    const chance = state.difficulty === 'story' || am.aborted ? 1 : 0.35 + (medic ? 0.3 : 0);
    if (nextRng(state)() < chance) {
      setInjury(op, 'serious');
      op.condition.injuryDays = 21;
      am.report.push(`${op.handle} pulled through. Barely.`);
    } else { deaths.push(op); am.report.push(`${op.name} "${op.handle}" died of their wounds.`); }
  }
  for (const m of am.missing ?? []) {
    const op = state.crew.find((o) => o.id === m.id);
    if (!op || deaths.includes(op)) continue;
    op.condition.awayUntil = state.day + FIGHT.missingDays;
    op.condition.missing = { since: state.day, until: state.day + FIGHT.missingDays };
    setInjury(op, 'serious');
    op.condition.injuryDays = FIGHT.missingDays + INJURY_DAYS.serious;
  }
  recordFight(state, am, { deaths }); // the fight counters only: no fame, standing or active week (as posts)
  for (const op of deaths) {
    state.crew = state.crew.filter((o) => o.id !== op.id);
    state.memorial.push({ id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, age: op.age, marks: op.marks ?? [], day: state.day, cause: `Died on an expedition in ${districtText(e?.district ?? 'docks')}`, record: recordSummary(op) });
  }
  if (deaths.length) for (const op of state.crew) op.condition.morale = Math.max(0, op.condition.morale - 15);
  const survivors = crew.filter((o) => !deaths.includes(o));
  const injuries = survivors.filter((o) => o.condition.injury !== 'healthy').map((o) => `${o.handle} (${o.condition.injury}, ${o.condition.injuryDays}d)`);
  for (const op of survivors) op.condition.fatigue = Math.min(100, op.condition.fatigue + 10);
  let line = null;
  if (e) {
    const won = !am.aborted && !deaths.length;
    line = won ? 'They won the fight and finished the deal.' : am.aborted ? 'They pulled back from the fight and came home.' : 'The fight cost us.';
    e.waiting = false;
    const g = GOALS[e.goal];
    closeExpedition(state, e, won ? 'met' : e.progress >= g.need - 1 && e.progress > 0 ? 'partial' : 'failed', { text: line, fight: true });
    am.report.push(line);
  }
  const milestones = checkMilestones(state, survivors);
  for (const m of milestones) am.report.push(m.text);
  const outcome = deaths.length ? 'loss' : am.aborted ? 'aborted' : 'completed';
  am.result = { milestones, report: am.report ?? [], outcome, pay: 0, heatGain: 0, injuries, deaths: deaths.map((d) => d.handle), freelance: [], growth: [], graduated: [], client: null, trustChange: 0, post: line };
  am.done = true;
}

/**
 * The trip ends: the close line, the goal's reward (met: the prize; partial: a lesser piece, half the sum, a
 * rookie's name; failed: only the finds), everyone home today, a report with the days out. Mutates.
 */
export function closeExpedition(state, e, outcome, { text = null, fight = false } = {}) {
  const g = GOALS[e.goal];
  const crew = crewOf(state, e);
  const d = Math.max(1, state.day - e.startDay);
  if (text) write(e, { day: d, tone: fight ? (outcome === 'met' ? 'good' : 'warn') : 'warn', text, ...(fight ? { fight: true } : {}) });
  if (crew.length) {
    const l = line(state, e, d, crew, `close.${outcome}`, { joss: false, aside: false, key: ':close' });
    const joss = outcome === 'partial' ? '' : jossClose(state.seed, e.id, e.goal, outcome === 'met').trim();
    if (l) write(e, { day: d, tone: outcome === 'met' ? 'good' : outcome === 'partial' ? 'plain' : 'warn', text: l.main ?? l.text, ...([l.more, joss].filter(Boolean).length ? { more: [l.more, joss].filter(Boolean).join(' ') } : {}) });
  }
  const results = [];
  if (outcome === 'met' || outcome === 'partial') {
    if (e.goal === 'weapon') {
      const item = outcome === 'met' ? e.prize.item : makeItem(state, e.prize.item.type, hashRng(state.seed, 'expedition', e.id, 'lesser')() < 0.5 ? 'verified' : 'standard');
      (state.stash ??= []).push(item);
      results.push({ tone: 'good', text: `To the stash: ${item.name ? `${item.name} (${itemName({ ...item, tier: null }).toLowerCase()})` : itemName(item)}.`, tier: item.tier, ...(item.perks?.length ? { perks: [...item.perks] } : {}) });
    }
    if (e.goal === 'cash') {
      const sum = Math.round((e.prize.cash * (outcome === 'met' ? 1 : 0.5)) / 50) * 50;
      moveCash(state, sum, 'A trip paid');
      results.push({ tone: 'good', text: `Brought home ${money(sum)}.` });
    }
    if (e.goal === 'recruit') {
      const r = outcome === 'met' ? e.prize.recruit : generateRecruit(state, { role: e.prize.recruit.role, quality: 'rookie' });
      (state.recruits ??= []).push({ ...r, expiresDay: state.day + LEAD_DAYS });
      results.push({ tone: 'good', text: `${r.name} "${r.handle}", ${r.role}, ${outcome === 'met' ? 'will meet you' : 'is a name to follow up'}: in Crew › Leads for ${LEAD_DAYS} days.` });
    }
  }
  if (e.finds.length) results.push({ tone: 'plain', text: `Found on the way: ${e.finds.join('; ')}.` });
  if (e.spent) results.push({ tone: 'plain', text: `Spent on the way: ${money(e.spent)}.` });
  const hurt = crew.filter((o) => o.condition.injury !== 'healthy').map((o) => `${o.handle} (${o.condition.injury})`);
  results.push(hurt.length ? { tone: 'bad', text: `Hurt: ${hurt.join(', ')}.` } : { tone: 'good', text: 'Nobody hurt.' });
  const sharper = growthText(e.grew);
  if (sharper) results.push({ tone: 'good', text: `Came back sharper: ${sharper}.` });
  for (const op of crew) {
    if (!op.condition.missing) op.condition.awayUntil = Math.min(op.condition.awayUntil ?? state.day, state.day); // home today
    op.history.push(`Day ${state.day}: ${g.name.toLowerCase()} expedition in ${districtText(e.district)} (${outcome})`);
  }
  const ex = expeditionsOf(state);
  ex.active = ex.active.filter((x) => x !== e);
  state.expeditions = ex;
  const word = { met: 'got it', partial: 'part of it', failed: 'came back without it' }[outcome];
  state.inbox.unshift({
    id: `exp-${e.id}-${state.day}`, type: 'report', day: state.day,
    subject: `${g.name}, ${districtText(e.district)}: ${word}`,
    body: [...e.log.map((l) => l.text), ...results.map((r) => r.text)].join(' '), // the days only: asides stay in the report's full view
    back: { crewIds: [...e.crewIds], pay: 0, away: true, expedition: true, growth: sumGrowth(e.grew), graduated: [...(e.graduated ?? [])] },
    timeline: {
      result: outcome === 'met' ? 'completed' : outcome === 'partial' ? 'aborted' : 'setback',
      steps: [], outcome: results,
      days: e.log.map(({ day, text, more, quiet, turn: t }) => ({ day, text, ...(more ? { more } : {}), ...(quiet ? { quiet } : {}), ...(t ? { turn: t } : {}) })),
      expedition: { goal: e.goal, district: e.district, outcome },
    },
    blocking: false, read: false,
  });
}

/** Pull a crew out early (any day it isn't waiting on a call): everyone home today, the finds kept, the goal not met. */
export function pullOutExpedition(prev, id) {
  const e0 = expeditionById(prev, id);
  if (!e0 || e0.waiting) return prev;
  const state = structuredClone(prev);
  const e = expeditionById(state, id);
  closeExpedition(state, e, 'failed', { text: 'You called them home early. Everyone came back.' });
  return state;
}

/** Expeditions out, for Jobs › Expeditions, City and Today: [{ id, goal, name, district, crewIds, day, days, endDay, log, waiting }]. */
export function expeditionsOut(state) {
  return expeditionsOf(state).active.map((e) => ({
    id: e.id, goal: e.goal, name: GOALS[e.goal].name, district: e.district, crewIds: e.crewIds,
    day: Math.min(e.days, Math.max(0, state.day - e.startDay)), days: e.days, endDay: e.endDay, returnDay: e.endDay,
    log: e.log, waiting: e.waiting, progress: e.progress, need: GOALS[e.goal].need,
  }));
}
