// Crew: the roster, a runner's page (record, fame, path, traits, gear), and a lead's page.
import { canMove, freeBeds } from '../core/halls.js';
import { HOME_HALL } from '../data/halls.js';
import { TRAITS } from '../data/traits.js';
import { statGlyph, traitGlyph } from './icons.js';
import { seasonStartDay } from '../core/time.js';
import { marksText } from '../core/marks.js';
import { recordOf } from '../core/record.js';
import { bookGrade } from '../core/book.js';
import { fameOf, fameName, standingWord, pathOf, legendProgress, standingOf } from '../core/fame.js';
import { FAME_RULES } from '../data/fame.js';
import { ratedStat, traitMods, availability } from '../core/crew.js';
import { isSworn, oathRead, oathEligible } from '../core/oath.js';
import { money } from '../core/money.js';
import { renderLoadout, renderGearSheet } from './gear.js';
import { itemName } from '../core/gear.js';
import { EARNED_TRAITS } from '../data/earnedTraits.js';
import { earnedText } from '../core/earned.js';
import { specOf } from '../core/specialisations.js';
import { STARTING_ROSTER_CAP, canHire, signingFee } from '../core/recruits.js';
import { changesSince, primaryStat, progressShare, declineChance, ageRate, potentialRead, scoutFor } from '../core/development.js';
import { leadNames, renderGoneElsewhere } from './tongs.js';
import { esc, statName, face, statusChip, daysLeft, subTabs, infoButton, infoText, cityName, gearUi } from './shared.js';
import { state, backLabel, V } from './view.js';

/** Fatigue and morale as two small labelled bars for crew rows. */
const conditionBars = (op) => [['Fatigue', op.condition.fatigue, 'fatigue'], ['Morale', op.condition.morale, 'morale']]
  .map(([label, v, k]) => `<span class="minibar minibar--${k}" role="img" aria-label="${label} ${v}"><span class="minibar__label">${label}</span><span class="minibar__track"><span style="width:${Math.max(0, Math.min(100, v))}%"></span></span></span>`).join('');

const signed = (n) => `${n > 0 ? '+' : '−'}${Math.abs(n)}`;
/** This season's net change per stat (rises and age decline), from the growth log. */
const seasonChanges = (op) => changesSince(op, seasonStartDay(state.day));

/** Crew-list one-liner: their best (main) stat. The scout's read of their potential and their highlight are on their own page (2026-11-08, owner). */
function scoutLine(op) {
  const main = primaryStat(op);
  return `<span class="scoutline"><span class="iconword">${statGlyph(main)}${esc(statName(main))} ${ratedStat(op, main)}</span></span>`;
}

/** Crew-list marker: "▲ Tech +2, Combat +1 ▼ Piloting −1" for this season. */
function growthMarker(op) {
  const net = Object.entries(seasonChanges(op));
  const up = net.filter(([, n]) => n > 0).map(([k, n]) => `${statName(k)} ${signed(n)}`);
  const down = net.filter(([, n]) => n < 0).map(([k, n]) => `${statName(k)} ${signed(n)}`);
  return (up.length ? `<span class="marker">▲ ${esc(up.join(', '))}</span>` : '') +
    (down.length ? `<span class="marker is-down">▼ ${esc(down.join(', '))}</span>` : '');
}

/**
 * One stat on a stats panel: the number used on jobs (with trait bonuses), the bonus,
 * and (for crew) this season's change in green/red plus a smaller career figure.
 */
function statCell(op, k, { growth = false } = {}) {
  const mod = traitMods(op)[k] ?? 0;
  const season = growth ? seasonChanges(op)[k] ?? 0 : 0;
  const career = growth ? op.stats[k] - (op.startStats?.[k] ?? op.stats[k]) : 0;
  const traitNames = op.traits.filter((t) => typeof TRAITS[t]?.effects?.[k] === 'number').map((t) => TRAITS[t].name).join(', ');
  return `<div>
    <dt class="iconword">${statGlyph(k)}${esc(k)}</dt>
    <dd>${ratedStat(op, k)}${season ? ` <span class="growth ${season < 0 ? 'is-down' : ''}">${signed(season)}</span>` : ''}</dd>
    ${mod ? `<span class="statnote ${mod < 0 ? 'is-down' : ''}">${op.stats[k]} ${mod > 0 ? '+' : '−'}${Math.abs(mod)} ${esc(traitNames)}</span>` : ''}
    ${career ? `<span class="statnote">career ${signed(career)}</span>` : ''}
    ${growth ? `<span class="nextbar" role="progressbar" aria-label="${esc(k)}: towards the next point" aria-valuenow="${Math.round(progressShare(op, k) * 100)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Math.round(progressShare(op, k) * 100)}%"></span></span>` : ''}
  </div>`;
}

/** Crew: who we have and who we could get. Sub-tabs Roster · Leads · Wall (Halls and the Armoury moved to Tong in step 2). */
export function renderCrew() {
  const cap = state.rosterCap ?? STARTING_ROSTER_CAP;
  const recruits = state.recruits ?? [];
  const tab = ['roster', 'leads', 'wall'].includes(V.crewTab) ? V.crewTab : 'roster';
  const body = {
    roster: () => `
      <ul class="list list--cols">
        ${state.crew.map((op) => `
          <li>
            <button class="row crewrow" data-action="open-op" data-id="${esc(op.id)}">
              ${face(op)}
              <span class="crewrow__name"><strong>${esc(op.name)}</strong> "${esc(op.handle)}"</span>
              <span class="crewrow__info muted">${fameOf(op) === 'elite' ? `<span class="fame fame--elite">${esc(fameName('elite'))}</span> · ` : ''}${esc(op.tier ?? '')} ${esc(op.role)} · ${op.age}</span>
              <span class="crewrow__status">${statusChip(availability(state, op))}</span>
              <span class="crewrow__scout">${scoutLine(op)}${growthMarker(op)}</span>
              <span class="crewrow__bars">${conditionBars(op)}</span>
            </button>
          </li>`).join('')}
      </ul>`,
    leads: () => `
      <h2>Leads (${recruits.length})</h2>
      ${recruits.length ? `<ul class="list">
        ${recruits.map((r) => `
          <li>
            <button class="row" data-action="open-recruit" data-id="${esc(r.id)}">
              ${face(r)}
              <span class="row__main"><strong>${esc(r.name)}</strong> "${esc(r.handle)}"<br><span class="muted">${esc(r.quality)} ${esc(r.role)} · ${r.age}</span></span>
              <span class="row__meta"><strong>${money(r.wage)}</strong>/wk<br>${daysLeft(r.expiresDay)}</span>
            </button>
          </li>`).join('')}
      </ul>` : '<p class="muted small">No leads right now. Scouts report every Wednesday.</p>'}
      ${leadNames(state)}`,
    wall: () => `
      <h2>The wall</h2>
      ${state.memorial.length ? `<ul class="list list--plain">
        ${state.memorial.map((m) => `<li class="fallen">${face(m, 'sm')}<span><strong>${esc(m.name)}</strong> "${esc(m.handle)}" <span class="muted">· ${esc(m.role)} · ${esc(m.cause)}, day ${m.day}${m.legend ? ' · a Legend' : ''}</span></span></li>`).join('')}
      </ul>` : '<p class="muted small">Nobody on the wall.</p>'}
      <h2>Hall of Legends</h2>
      ${(state.hall ?? []).length ? `<ul class="list list--plain">
        ${state.hall.map((m) => `<li class="fallen">${face(m, 'sm')}<span><strong>${esc(m.name)}</strong> "${esc(m.handle)}" <span class="muted">· ${esc(m.role)} · retired day ${m.day}${m.legend ? ' · a Legend' : ''}</span><br><span class="muted small">${esc(m.epitaph)}${m.record ? ` ${m.record.jobs} jobs, ${m.record.activeWeeks} active weeks.` : ''}</span>${(m.highlights ?? []).length ? `<br><span class="muted small">${esc(m.highlights[0])}</span>` : ''}</span></li>`).join('')}
      </ul>` : '<p class="muted small">Nobody has retired yet.</p>'}
      ${renderGoneElsewhere(state)}`,
  }[tab]();
  return `
    <section class="panel">
      <div class="crewhead">
        <h1>Crew</h1>
        <span class="muted">${state.crew.length}/${cap} beds</span>
      </div>
      ${subTabs('Crew sections', 'crew-tab', [['roster', 'Roster'], ['leads', 'Leads', recruits.length], ['wall', 'Wall']], tab)}
      ${body}
    </section>`;
}

export function renderRecruit() {
  const r = (state.recruits ?? []).find((x) => x.id === V.openRecruitId);
  if (!r) { V.openRecruitId = null; return renderCrew(); }
  const can = canHire(state, r);
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← ${esc(backLabel())}</button>
      <div class="ophead">
        ${face(r, 'lg')}
        <div>
          <h1>${esc(r.name)} <span class="muted">"${esc(r.handle)}"</span></h1>
          <p class="muted">${esc(r.quality)} ${esc(r.role)} · ${r.age} · lead goes cold: ${daysLeft(r.expiresDay)}</p>
        </div>
      </div>
      <div class="opgrid">
      <div class="opgrid__about">
      <p class="body">${esc(r.origin)}</p>
      <p class="body muted">${esc(r.bio)}</p>

      ${r.brings?.length ? `<p class="body"><strong>Brings their own:</strong> ${esc(r.brings.map((type) => itemName({ type, tier: 'street' }).toLowerCase()).join(', '))}.</p>` : ''}
      <h2>Traits</h2>
      ${traitChips(r.id, r.traits.map(bornChip))}
      </div>

      <div class="opgrid__stats">
      <h2>Stats</h2>
      <dl class="stats">
        ${Object.keys(r.stats).map((k) => statCell(r, k)).join('')}
      </dl>
      </div>

      <div class="opgrid__dev">
      <h2>Scout's view</h2>
      <div class="riskcard">
        <p>${esc(r.scoutReport ?? 'Nobody has a read on them yet.')}</p>
        <p class="muted small">${esc(growthNote(r.age))} Opinions, not facts: scouts get it wrong sometimes.</p>
      </div>
      </div>

      <div class="opgrid__past">
      <h2>Terms</h2>
      <div class="riskcard">
        <p>Wants <strong>${money(r.wage)}</strong> a week, plus a ${money(signingFee(r))} signing fee now.</p>
        ${r.haggleResult ? `<p class="muted">${esc(r.haggleResult)}</p>` : ''}
      </div>
      <div class="stack">
        <button class="btn btn--primary" data-action="hire" data-id="${esc(r.id)}" ${can.ok ? '' : 'disabled'}>Hire for ${money(signingFee(r))}</button>
        ${can.ok ? '' : `<p class="muted small">${esc(can.reason)}</p>`}
        <button class="btn" data-action="haggle" data-id="${esc(r.id)}" ${r.haggled ? 'disabled' : ''}>${r.haggled ? 'Already haggled' : 'Haggle (your best talker rolls)'}</button>
        <button class="btn btn--ghost" data-action="pass" data-id="${esc(r.id)}">Pass on this one</button>
      </div>
      </div>
      </div>
    </section>`;
}

/** Plain-words growth rate for an age (see core/development.js). */
function growthNote(age) {
  if (declineChance(age)) return 'Past 40: slipping a little every season.';
  const rate = ageRate(age);
  return rate > 1 ? 'Young: learns fast.' : rate < 1 ? 'Experienced: learns slowly now.' : 'Still learning at a steady pace.';
}

function bar(label, value) {
  return `<div class="meter"><span class="meter__label">${label}</span><span class="meter__track"><span class="meter__fill ${value > 70 ? 'is-hot' : ''}" style="width:${value}%"></span></span><span class="meter__value">${value}</span></div>`;
}

/** A runner's record (core/record.js): what they've done on the job, behind a tap. */
function renderRecord(op) {
  const r = recordOf(op);
  if (!r.jobs) return '';
  const nameOf = (id) => state.crew.find((x) => x.id === id)?.handle ?? state.memorial.find((x) => x.id === id)?.handle ?? null;
  const top = Object.entries(r.with).filter(([id]) => nameOf(id)).sort((a, b) => b[1] - a[1])[0];
  const stat = (label, n) => `<div class="recstat"><span class="recstat__n">${n}</span><span class="muted small">${esc(label)}</span></div>`;
  return `<details class="flog record">
    <summary><h2 class="record__title">Record</h2></summary>
    <div class="recgrid">
      ${stat('jobs', r.jobs)}${stat('at their level', r.atLevel)}${stat('completed', r.wins)}
      ${stat('clean', r.clean)}${stat('flawless', r.flawless)}${stat('best clean streak', r.bestCleanStreak)}
      ${stat('carries', r.carries)}${stat('fights won', r.fightsWon)}${stat('brought home', r.broughtHome)}
      ${stat('unscathed', r.unscathed)}${stat('big scores', r.bigScores)}${stat('active weeks', r.activeWeeks)}
    </div>
    ${r.highlights?.length ? `<ul class="list list--plain highlights">${r.highlights.map((h) => `<li>${esc(h.text)}</li>`).join('')}</ul>` : ''}
    ${top ? `<p class="muted small">Most jobs with ${esc(nameOf(top[0]))}: ${top[1]}.</p>` : ''}
    ${r.estimated ? '<p class="muted small">Counts from before records began are estimates.</p>' : ''}
    <p class="muted small">Clean: no heat and nobody went loud. Flawless: nobody went critical. Carries: a hard crisis roll they made.</p>
  </details>`;
}

/** Fame on the runner page: "ELITE · pro", with how the street rates them now (Elite only). */
function fameBadge(op) {
  if (op.freelance || !op.record) return '';
  const fame = fameOf(op);
  if (fame === 'unknown') return '';
  const word = fame === 'elite' ? ` · <span class="fame__standing">${esc(standingWord(op))}</span>` : '';
  const slate = bookGrade(state, op.runnerId ?? op.id);
  return `<p class="famebadge"><span class="fame fame--${esc(fame)}">${esc(fameName(fame))}</span> · ${esc(op.tier ?? '')}${word}${slate ? ` · <span class="muted">Anchor's slate ${esc(slate)}</span>` : ''}</p>`;
}

/** Their path (core/fame.js) and how far it is to Elite and Legend; the numbers behind a tap. */
function renderPath(op) {
  if (op.freelance || !recordOf(op).jobs) return '';
  const p = pathOf(op);
  const legend = legendProgress(op);
  const elite = fameOf(op) === 'elite' || fameOf(op) === 'legend';
  const pct = (n) => Math.round(n * 100);
  const meter = (label, n) => `<div class="meter pathbar"><span class="meter__label">${label}</span><span class="meter__track"><span class="meter__fill" style="width:${pct(n)}%"></span></span><span class="meter__value">${pct(n)}%</span></div>`;
  const e = FAME_RULES.elite;
  const numbers = p.conditions.map((c) => `${c.label}: ${c.value} (Elite ${c.elite}, Legend ${c.legend})`).join('; ');
  const todo = legend.checks.filter((x) => !x.met).map((x) => x.label);
  const info = `Their path is the one their record is furthest along. ${p.name}: ${numbers}. `
    + (elite ? '' : `Elite also needs ${e.activeWeeks} active weeks, ${e.atLevel} jobs at their level and standing ${e.standing} (how the street rates them now: good work at their level raises it, the bench wears it down). `)
    + (legend.ready ? 'They meet every Legend condition.' : `Still to come for Legend: ${todo.join(', ')}.`)
    + ' Fame never changes a roll, pay or heat.';
  return `<h2>Path</h2>
    <div class="riskcard pathcard">
      <div class="infoline"><p><strong class="pathcard__name">${esc(p.name)}</strong> <span class="muted small">${esc(p.line)}</span></p>${infoButton(`path-${op.id}`, `About ${op.handle}'s path`)}</div>
      ${infoText(`path-${op.id}`, info)}
      ${elite ? '' : meter('To Elite', p.toElite)}
      ${meter('To Legend', p.toLegend)}
      ${op.legend ? `<p class="pathcard__ready">A Legend since day ${op.legend.day}.</p>` : legend.ready ? `<p class="pathcard__ready">${op.legendCall?.offerId ? 'The city is asking: their defining job is up.' : 'Ready for their moment.'}</p>` : ''}
      ${elite ? `<p class="muted small">Standing ${standingOf(op)}: ${esc(standingWord(op))}.</p>` : ''}
    </div>`;
}

/** Where a runner lives (core/halls.js), and moving them into another hall. */
function renderHome(op) {
  const home = op.hall ?? HOME_HALL;
  const others = (state.halls ?? []).filter((h) => h.district !== home);
  return `
      <h2>Home</h2>
      <p class="small">Lives at the ${esc(cityName(home))} hall${op.settlingDay === state.day ? ': settling in today, free tomorrow' : ''}.</p>
      ${others.length ? `<div class="stack">${others.map((h) => {
        const can = canMove(state, op.id, h.district);
        return `<button class="btn btn--ghost" data-action="move-hall" data-id="${esc(`${op.id}|${h.district}`)}" ${can.ok ? '' : 'disabled'}>Move to ${esc(cityName(h.district))} <span class="muted small">· ${can.ok ? `${freeBeds(state, h.district)} free ${freeBeds(state, h.district) === 1 ? 'bed' : 'beds'}; settles in today` : esc(can.reason.toLowerCase())}</span></button>`;
      }).join('')}</div>` : ''}`;
}

export function renderOperative() {
  const op = state.crew.find((x) => x.id === V.openOperativeId);
  if (!op) return renderCrew();
  const c = op.condition;
  const nameOf = (id) => state.crew.find((x) => x.id === id)?.handle ?? state.memorial.find((x) => x.id === id)?.handle ?? id;
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← ${esc(backLabel())}</button>
      <div class="ophead">
        ${face(op, 'lg')}
        <div class="ophead__who">
          <h1>${esc(op.name)} <span class="muted">"${esc(op.handle)}"</span></h1>
          <p class="muted">${esc(op.tier ?? '')} ${esc(op.role)} · ${op.age} · ${money(op.wage)}/week</p>
          <div class="ophead__line">${fameBadge(op)}<span class="ophead__status">${statusChip(availability(state, op))}</span></div>
          ${isSworn(op) ? '<p class="muted small"><strong>Sworn</strong> since day ' + op.sworn + '. A lasting place in the tong.</p>' : oathRead(state, op).ok ? `<button class="btn btn--primary" data-action="swear-in" data-id="${esc(op.id)}">Hold the ceremony · ${money(oathRead(state, op).cost)}</button>` : oathEligible(op) ? `<p class="muted small">Could be sworn. ${esc(oathRead(state, op).reason)}</p>` : ''}
          ${op.record?.highlights?.[0] ? `<p class="muted small ophead__hl">${esc(op.record.highlights[0].text)}</p>` : ''}
          ${marksText(op) ? `<p class="muted small">Marked: ${esc(marksText(op))}</p>` : ''}
        </div>
      </div>
      <div class="opgrid">
      <div class="opgrid__about">
      <p class="body">${esc(op.bio)}</p>
      <p class="body muted">${esc(op.origin)}</p>
      ${op.freelance ? '' : renderHome(op)}

      ${specOf(op) ? `
      <h2>Specialisation</h2>
      <ul class="chips">
        <li class="chip chip--earned"><strong>${esc(specOf(op).name)}</strong><span>${esc(specOf(op).desc)}</span><span class="chip__when">Since day ${op.spec.day}</span></li>
      </ul>` : ''}
      <h2>Traits</h2>
      ${traitChips(op.id, op.traits.map(bornChip))}
      ${earnedChips(op)}
      ${synergies(op)}
      </div>

      <div class="opgrid__stats">
      <h2>Stats</h2>
      <dl class="stats">
        ${Object.keys(op.stats).map((k) => statCell(op, k, { growth: true })).join('')}
      </dl>
      ${renderLoadout(gearUi, state, op, { picked: V.bagPick })}

      </div>

      <div class="opgrid__dev">
      <h2>Development</h2>
      <div class="riskcard">
        <p>${esc(potentialRead(op, scoutFor(state.crew, op.role, op.id)?.handle))}</p>
        <p class="muted small">${esc(growthNote(op.age))} Green and red numbers are this season's change; "career" is since joining. The thin bar under each stat fills towards the next point.</p>
      </div>

      <h2>Condition</h2>
      ${bar('Fatigue', c.fatigue)}${bar('Morale', c.morale)}${bar('Neural load', c.neuralLoad)}${bar('Burnout', c.burnout)}
      </div>

      <div class="opgrid__past">
      <h2>Trust</h2>
      <ul class="list list--plain">
        ${Object.entries(op.trust).map(([id, v]) => `<li>${esc(nameOf(id))}: ${v > 0 ? '+' : ''}${v}</li>`).join('') || '<li class="muted">No strong feelings yet.</li>'}
      </ul>

      ${renderPath(op)}
      ${renderRecord(op)}
      ${op.history.length ? `<h2>History</h2><ul class="list list--plain">${op.history.slice(-8).reverse().map((h) => `<li class="muted">${esc(h)}</li>`).join('')}</ul>` : ''}
      </div>
      </div>
    </section>
    ${V.gearSlot ? renderGearSheet(gearUi, state, op, V.gearSlot) : ''}`;
}

// Traits as chips (owner, 2026-11-03): an icon and a name in a wrapping row; tap one and its card
// opens under the row (tap again, or another, to close). Tap, not hover: iOS rule in CLAUDE.md.
const bornChip = (t) => ({ key: `t:${t}`, icon: TRAITS[t]?.icon, name: TRAITS[t]?.name ?? t, desc: TRAITS[t]?.desc ?? '', kind: 'born' });

/** One row of trait chips for a runner's (or a lead's) page, and the open chip's card. */
function traitChips(pageId, items) {
  if (!items.length) return '<p class="muted small">None.</p>';
  const open = items.find((it) => V.traitTip === `${pageId}|${it.key}`);
  return `<ul class="tchips">${items.map((it) => {
    const on = it === open;
    return `<li><button class="tchip tchip--${it.kind}${it.setback ? ' tchip--setback' : ''}${on ? ' is-open' : ''}" data-action="trait-tip" data-id="${esc(`${pageId}|${it.key}`)}" aria-expanded="${on}">${traitGlyph(it.icon)}<span>${esc(it.name)}</span></button></li>`;
  }).join('')}</ul>
      ${open ? `<div class="tipcard${open.setback ? ' tipcard--setback' : ''}" role="note"><strong>${esc(open.name)}</strong><p>${esc(open.desc)}</p>${open.when ? `<p class="muted small">${esc(open.when)}</p>` : ''}</div>` : ''}`;
}

/** "Earned on the job": every earned trait but synergies, which get their own row. */
function earnedChips(op) {
  const list = (op.earned ?? []).filter((e) => e.id !== 'crew_anchor');
  if (!list.length) return '';
  return `<h2>Earned on the job</h2>
      ${traitChips(op.id, list.map((e, i) => {
        const def = EARNED_TRAITS[e.id];
        return { key: `e:${i}`, icon: def.icon, name: def.name, desc: earnedText(state, e), kind: def.kind, setback: def.setback,
          when: `${def.kind === 'temporary' ? 'For now' : 'For good'} · since day ${e.day}` };
      }))}`;
}

/** Synergies (crew_anchor, shown as Synergy since 2026-11-03): who they work best with, as portraits. */
function synergies(op) {
  const list = (op.earned ?? []).filter((e) => e.id === 'crew_anchor')
    .map((e) => ({ e, mate: state.crew.find((o) => o.id === e.partner) ?? state.memorial.find((o) => o.id === e.partner) }))
    .filter((x) => x.mate);
  if (!list.length) return '';
  const open = list.find((x) => V.traitTip === `${op.id}|s:${x.mate.id}`);
  return `<h2>Synergies</h2>
      <ul class="synergies">${list.map(({ mate }) => {
        const on = mate === open?.mate;
        return `<li><button class="synergy${on ? ' is-open' : ''}" data-action="trait-tip" data-id="${esc(`${op.id}|s:${mate.id}`)}" aria-expanded="${on}" aria-label="Synergy with ${esc(mate.handle)}">${face(mate, 'sm')}<span>${esc(mate.handle)}</span></button></li>`;
      }).join('')}</ul>
      ${open ? `<div class="tipcard" role="note"><strong>Synergy with ${esc(open.mate.handle)}</strong><p>${esc(earnedText(state, open.e))}</p><p class="muted small">${open.mate.cause ? `${esc(open.mate.handle)} is gone. ` : ''}For good · since day ${open.e.day}</p>${open.mate.cause ? '' : `<button class="btn btn--ghost" data-action="open-op" data-id="${esc(open.mate.id)}">${esc(open.mate.handle)}'s page →</button>`}</div>` : ''}`;
}
