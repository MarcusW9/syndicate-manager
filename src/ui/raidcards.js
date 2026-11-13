// Raids as cards and lines: where and when a raid comes, the grudge gauge, the fixer's call sheet,
// the Threats list (Today, City and a hall's page draw from here).
import { heatIn } from '../core/heat.js';
import { grudgeOf, GRUDGE, grudgeWord, GANGS } from '../core/gangs.js';
import { raidWho, isGangRaid, openRaids, raidBy, canBuyOff, defenders, raidPrice, withdrawCost } from '../core/raids.js';
import { RAID_CALL } from '../data/raids.js';
import { NAMES } from '../config/names.js';
import { portrait } from './art.js';
import { landmark } from './landmarks.js';
import { calendar } from '../core/time.js';
import { CLIENTS } from '../data/clients.js';
import { money } from '../core/money.js';
import { turfHex } from './city.js';
import { esc, hallLabel, fillLine, face } from './shared.js';
import { state } from './view.js';

/** Crews waiting on a call from the player. */
export const calls = () => (state.awayJobs ?? []).filter((j) => j.waiting).length + raidCalls().length;
/** Raids at the door now, waiting on the player's call (core/raids.js). */
export const raidCalls = () => state.inbox.filter((m) => m.kind === 'raid' && !m.resolved);

/**
 * A hall's district as its landmark (ui/landmarks.js; 2026-11-05, kept off the map for the halls
 * and the raid screens): about 56px, lit in the gang's light; dim for a hall not yet opened; a red
 * glow behind it while a raid is coming. Decoration: the words beside it say the same.
 */
export function hallMark(d, { dim = false, raid = false } = {}) {
  const art = landmark(d, { x: 24, y: 44, size: 48, light: turfHex(d) ?? '#3de8d8' });
  if (!art) return '';
  const glow = raid ? `<radialGradient id="lmk-raid-${d}"><stop offset="0" stop-color="#ff3d5f" stop-opacity="0.55" /><stop offset="1" stop-color="#ff3d5f" stop-opacity="0" /></radialGradient><ellipse cx="24" cy="26" rx="26" ry="20" fill="url(#lmk-raid-${d})" />` : '';
  return `<svg class="lmk ${dim ? 'is-dim' : ''} ${raid ? 'is-raid' : ''}" viewBox="0 0 48 44" width="56" height="51" aria-hidden="true" data-landmark="${esc(d)}">${glow}${art}</svg>`;
}
/** A raid's hall, its landmark beside the words: where, when, who. */
export const raidWhere = (r, extra = '') => `<div class="raidwhere">${hallMark(r.district, { raid: r.answer !== 'paid' && !r.done })}<p class="small"><strong>${esc(hallLabel(r.district))}</strong> · ${esc(raidWhen(r))} · ${esc(raidWho(r))}${extra}</p></div>`;
/** When a warned raid comes: "today", "tomorrow", or the weekday with the days to go. */
export function raidWhen(r) {
  const left = r.day - state.day;
  return left <= 0 ? 'today' : left === 1 ? 'tomorrow' : `${calendar(r.day).weekday} (in ${left} days)`;
}

/** A gang's grudge as a segmented gauge and a word: "▮▮▮▮▯▯… 4/10 · angry" (core/gangs.js). */
export function grudgeGauge(gang) {
  const n = grudgeOf(state, gang);
  const seg = Array.from({ length: GRUDGE.max }, (_, i) => `<i class="${i < n ? (n >= GRUDGE.raidAt ? 'is-hot' : 'is-on') : ''} ${i === GRUDGE.raidAt - 1 ? 'is-line' : ''}"></i>`).join('');
  return `<span class="grudge"><span class="grudge__bar" aria-hidden="true">${seg}</span><span class="grudge__n">${n}/10</span> <span class="grudge__word ${n >= GRUDGE.raidAt ? 'is-hot' : ''}">${esc(grudgeWord(n))}</span></span>`;
}

/** "Police raid · Docks hall" (a gang's: "Silver Fan collectors raid · Docks hall"). */
const raidHeadline = (r) => `${isGangRaid(r) ? `${raidWho(r)} raid` : 'Police raid'} · ${hallLabel(r.district).replace(/^the /, '').replace(/^./, (c) => c.toUpperCase())}`;
/** "Sat · in 3 days". */
function raidDate(r) {
  const left = r.day - state.day;
  return `${calendar(r.day).weekday.slice(0, 3)} · ${left <= 0 ? 'today' : left === 1 ? 'tomorrow' : `in ${left} days`}`;
}
/** Why it is coming: the district's heat, a gang's grudge, or the crew's tail. */
const raidCause = (r) => (r.followed ? 'followed the crew home' : isGangRaid(r) ? `caused by ${GANGS[r.by].short} grudge ${grudgeOf(state, r.by)}/10` : `caused by Heat ${heatIn(state, r.district)}`);

/** Today's priority line for each raid coming (2026-11-09): one tap to its card. */
export function renderThreatLines() {
  return openRaids(state).map((r) => `<button class="outnow is-raid threatline" data-action="raid-open" data-id="${esc(r.district)}">
      <span class="outnow__light" aria-hidden="true"></span>
      <span><strong>${r.day - state.day === 1 && r.answer !== 'paid' ? 'Raid tomorrow · ' : ''}${esc(raidHeadline(r))}</strong><span class="threatline__sub">${esc(raidDate(r))} · ${r.answer === 'paid' ? 'paid off' : r.called ? 'at the door now' : r.plan ? `plan: ${r.plan === 'hold' ? 'hold the hall' : 'clear out'}` : 'no plan: whoever is home holds'}</span></span>
      <span class="outnow__go">Threats ›</span>
    </button>`).join('');
}

/** The one-off fixer call (data/raids.js RAID_CALL), a bottom sheet the first time a raid is warned. */
export function renderRaidCallSheet() {
  if (state.raidCallSeen || state.founding || state.activeMission) return '';
  const r = openRaids(state).find((x) => x.answer !== 'paid' && !x.called);
  if (!r) return '';
  const client = CLIENTS.find((c) => c.district === r.district);
  const who = client?.name ?? NAMES.partner;
  const data = { hall: hallLabel(r.district), heat: heatIn(state, r.district), when: raidDate(r).replace(' · ', ', '), who: raidBy(r) };
  const lines = isGangRaid(r) ? [RAID_CALL.gang, RAID_CALL.lines[1]] : RAID_CALL.lines;
  return `
    <div class="scrim" data-action="raid-call" data-id="|later"></div>
    <div class="sheet raidsheet" role="dialog" aria-modal="true" aria-label="${esc(RAID_CALL.title)}">
      <div class="raidsheet__head">
        <span class="face face--lg">${portrait({ id: `client-${client?.id ?? 'joss'}`, name: who, age: 52 }, { size: 64 })}</span>
        <div><p class="raidsheet__kicker">${esc(RAID_CALL.kicker)} · ${esc(who)}</p><h2 class="sheet__title">${esc(RAID_CALL.title)}</h2></div>
      </div>
      ${lines.map((l) => `<p>${esc(fillLine(l, data))}</p>`).join('')}
      <p>${esc(canBuyOff(state, r) ? RAID_CALL.buy : RAID_CALL.noBuy)} ${esc(RAID_CALL.deflt)}</p>
      <div class="stack">
        <button class="btn btn--primary" data-action="raid-call" data-id="${esc(r.id)}|hold">Hold the hall</button>
        <button class="btn" data-action="raid-call" data-id="${esc(r.id)}|clear">Clear out</button>
        <button class="btn btn--ghost" data-action="raid-call" data-id="|later">Decide later</button>
      </div>
    </div>`;
}

/**
 * Threats (2026-11-09), pinned above Out now: a card per raid, warned, paid off, or at the door.
 * Headline, date and cause, who is at the hall on its own line, then the two plans with what each costs.
 */
export function renderThreats(raids) {
  if (!raids.length) return '';
  return `
    <section class="threats" aria-label="Threats">
      <div class="ops__head"><h2>Threats</h2></div>
      <ul class="crewsout">
      ${raids.map((r) => threatItem(r)).join('')}
      </ul>
    </section>`;
}

/** One raid's Threats card: also on the hall's own page (`onHall` leaves out the link back to it; `note` adds a line). */
export function threatItem(r, { onHall = false, note = '' } = {}) {
        const home = defenders(state, r.district);
        const call = state.inbox.find((m) => m.kind === 'raid' && !m.resolved && m.payload?.raidId === r.id);
        const price = raidPrice(state, r);
        const buy = canBuyOff(state, r) && !r.answer && !r.called;
        const cost = withdrawCost(state, r.district);
        const paid = r.answer === 'paid';
        const plans = [
          ['hold', 'Hold the hall', home.length ? 'A fight at the door. Someone could get hurt.' : 'Nobody is home to hold it.', !home.length],
          ['clear', 'Clear out', `Hall empty and shut a week. We lose what is kept there (${money(cost.kept)}) and ${money(cost.repairs)} in repairs.`, false],
        ];
        return `
        <li class="crewsout__job is-raid threat" id="threat-${esc(r.district)}">
          <div class="threat__top">${hallMark(r.district, { raid: !paid })}<div><p class="threat__head"><span class="crewsout__light" aria-hidden="true"></span><strong>${esc(raidHeadline(r))}</strong></p>
          <p class="threat__meta muted small">${esc(raidDate(r))} · ${esc(raidCause(r))}${paid || r.called ? '' : ' · decide before the raid'}</p></div></div>
          <div class="threat__home">
            <p class="threat__label small">At the hall (${home.length})</p>
            <div class="threat__faces">${home.length ? home.map((op) => face(op, 'sm')).join('') : '<span class="muted small">Nobody home</span>'}</div>
          </div>
          ${note}
          ${paid ? `<p class="small">${isGangRaid(r) ? 'Settled' : 'Paid off'} (${money(r.paid)}). Nobody will come.</p>`
            : call ? `<p class="small"><strong>They need your call now.</strong></p>`
            : `<div class="threat__plans" role="group" aria-label="Your plan for the raid">
              ${plans.map(([id, label, text, off]) => `<button class="planbtn ${r.plan === id ? 'is-on' : ''}" data-action="raid-plan" data-id="${esc(r.id)}|${id}" aria-pressed="${r.plan === id}" ${off ? 'disabled' : ''}><strong>${label}</strong><span>${esc(text)}</span></button>`).join('')}
            </div>
            <p class="muted small">${r.plan ? 'Plan set. You can change it until the raid.' : 'No plan: whoever is home holds the hall.'} ${isGangRaid(r) ? `${esc(raidWho(r))} would take a settlement.` : canBuyOff(state, r) ? `${esc(raidWho(r))} are on the take.` : `${esc(raidWho(r))} cannot be bought.`}</p>`}
          <div class="crewsout__foot">
            ${call ? `<button class="btn btn--primary" data-action="raid-answer" data-id="${esc(call.id)}">Answer the door</button>` : ''}
            ${buy ? `<button class="btn" data-action="raid-pay" data-id="${esc(r.id)}" ${state.cash < price ? 'disabled' : ''}>${isGangRaid(r) ? 'Settle' : 'Pay them off'} · ${money(price)}</button>` : ''}
            ${!call && !paid && !onHall ? `<button class="linkbtn" data-action="hall-page" data-id="${esc(r.district)}">View hall roster ›</button>` : ''}
          </div>
        </li>`;
}
