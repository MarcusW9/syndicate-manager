// City: the map and its Tonight list, districts and a district's page, the Book (lore).
import { heatIn, HEAT_DISTRICTS } from '../core/heat.js';
import { hallIn, residents, bedsOf } from '../core/halls.js';
import { gangsOn, GANGS, GRUDGE } from '../core/gangs.js';
import { raidOn, openRaids, hallShut } from '../core/raids.js';
import { isOpeningJob } from '../data/halls.js';
import { heistCard } from '../core/heists.js';
import { NAMES } from '../config/names.js';
import { DISTRICTS, SAFEHOUSE_DISTRICT } from '../data/districts.js';
import { DISTRICT_CARDS, FACTIONS, STREET_FACTS, HISTORY } from '../data/city.js';
import { MISSIONS } from '../data/missions.js';
import { portrait } from './art.js';
import { MAP_DISTRICTS, cityMapView, cityMap as drawCityMap } from './citymap.js';
import { districtArt } from './districtArt.js';
import { landmark } from './landmarks.js';
import { calendar } from '../core/time.js';
import { jobView, templateById } from '../core/jobs.js';
import { activeRumour } from '../core/rumours.js';
import { money } from '../core/money.js';
import { crewsOut } from '../core/away.js';
import { sideTasksOut } from '../core/sidetasks.js';
import { renderTongs } from './tongs.js';
import { renderThreats, grudgeGauge, raidWhen } from './raidcards.js';
import { cityName, esc, face, districtName, daysLeft, rootBack, subTabs } from './shared.js';
import { whereButton, renderCrewsOut } from './today.js';
import { state, root, canGoBack, backLabel, V } from './view.js';

/** Jobs on the board right now, by district. */
const jobsIn = (key) => state.jobs.map((j) => ({ j, v: jobView(state, j) })).filter(({ v }) => v.tpl.district === key);
/** Which gang's colour a district's turf stripe takes. */
const TURF_TONE = { 'Brass Anchor': 'sodium', 'Red Lantern': 'red', 'Silver Fan': 'violet', 'Veridian-Apex': 'cyan', 'Racing Association': 'orange' };

const TURF_HEX = { sodium: '#f2d541', red: '#ff3d5f', violet: '#b48cff', cyan: '#3de8d8', orange: '#ff9a3d' };

/** How many of the crew are out in a district right now: on the job you're watching, or away. */
function crewOutIn(key) {
  const am = state.activeMission;
  let n = am && !am.done && templateById(am.templateId)?.district === key ? am.crewIds.length : 0;
  for (const j of state.awayJobs ?? []) if (templateById(j.mission.templateId)?.district === key) n += j.mission.crewIds.length;
  return n;
}

export const turfHex = (key) => { const f = DISTRICTS[key]?.faction; return f ? TURF_HEX[TURF_TONE[f]] : null; };

/**
 * Who's out in a district, for the map's face tokens (command centre, part 2): crews away (calls
 * first), the job being watched, and side work, each with the hall their first runner lives in.
 */
function crewsOnMap(key) {
  const ops = (ids) => ids.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const from = (list) => list[0]?.hall ?? SAFEHOUSE_DISTRICT;
  const away = crewsOut(state).filter((c) => c.district === key).sort((a, b) => b.waiting - a.waiting)
    .map((c) => { const o = ops(c.crewIds); return { ops: o, call: c.waiting, side: false, from: from(o), progress: c.beats ? c.beatsDone / c.beats : 0.5 }; });
  const am = state.activeMission;
  const live = am && !am.done && !am.raid && templateById(am.templateId)?.district === key ? [{ ops: ops(am.crewIds), call: false, side: false, from: from(ops(am.crewIds)) }] : [];
  const side = sideTasksOut(state).filter((t) => t.district === key).map((t) => { const o = ops(t.crewIds); return { ops: o, call: false, side: true, from: from(o) }; });
  return [...away, ...live, ...side].filter((c) => c.ops.length).slice(0, 3);
}

function cityMap() {
  const talk = activeRumour(state)?.district;
  const districts = MAP_DISTRICTS.map((key) => {
    const card = DISTRICT_CARDS[key];
    const jobs = card.locked ? 0 : jobsIn(key).length;
    const out = crewOutIn(key);
    const faction = DISTRICTS[key]?.faction;
    const home = key === SAFEHOUSE_DISTRICT;
    const hall = !home && !!hallIn(state, key); // another of the tong's halls (core/halls.js)
    return {
      key, locked: card.locked, selected: V.cityDistrict === key, jobs, out, home, hall, talk: talk === key, heat: card.locked ? 0 : heatIn(state, key),
      raid: raidOn(state, key) && raidOn(state, key).answer !== 'paid' ? (raidOn(state, key).called ? 'NOW' : calendar(raidOn(state, key)?.day).weekday.slice(0, 3).toUpperCase()) : null, // a raid ring (core/raids.js)
      name: cityName(key).replace(/^The /, ''),
      crews: card.locked ? [] : crewsOnMap(key), // face tokens on the map
      based: hallIn(state, key) ? residents(state, key).length : null, // ⌂ n here on the plate
      turf: card.locked ? null : turfHex(key),
      label: [cityName(key), card.locked ? 'locked' : `${jobs || 'no'} job${jobs === 1 ? '' : 's'} on the board`, faction && `${faction} turf`,
        home && 'the home hall is here', hall && 'a hall of ours is here', raidOn(state, key) && 'a raid is coming', heatIn(state, key) > 0 && `heat ${heatIn(state, key)} of 10`, out && `${out} of yours out here`, talk === key && 'street talk about it'].filter(Boolean).join(', '),
    };
  });
  // Drawn where it was last looking, then eased to the picked district or the whole city after render().
  V.mapTo = cityMapView(V.cityDistrict);
  const mapPx = root.querySelector('.citymap__view')?.clientWidth || Math.min(window.innerWidth - 40, 720);
  return drawCityMap(districts, esc, { portrait, view: V.mapView, mapPx });
}

function renderOps() {
  const f = V.cityDistrict;
  const jobs = crewsOut(state).filter((c) => !f || c.district === f).sort((a, b) => b.waiting - a.waiting);
  const side = sideTasksOut(state).filter((t) => !f || t.district === f);
  const raids = openRaids(state).filter((r) => !f || r.district === f);
  const any = crewsOut(state).length + sideTasksOut(state).length;
  const sideList = side.length ? `
    <ul class="crewsout" aria-label="Side work out">
      ${side.map((t) => {
        const ops = t.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
        return `
        <li class="crewsout__job is-side">
          <div class="crewsout__top">
            <span class="crewsout__light" aria-hidden="true"></span>
            <p class="crewsout__head"><strong>${esc(t.name)}</strong> <span class="muted small">side work · back ${esc(calendar(t.returnDay).weekday)}</span></p>
            <span class="crewsout__faces">${ops.map((op) => face(op, 'sm')).join('')}</span>
          </div>
          ${t.district ? `<div class="crewsout__foot">${whereButton(t.district)}</div>` : ''}
        </li>`;
      }).join('')}
    </ul>` : '';
  return `<div class="ops">
      ${renderThreats(raids)}
      <div class="ops__head">
        <h2>Out now</h2>
        ${f ? `<button class="linkbtn" data-action="city-whole">${esc(cityName(f))} only · show all</button>` : ''}
      </div>
      ${jobs.length || side.length ? `${renderCrewsOut(jobs)}${sideList}`
        : `<p class="muted small">${any ? `Nobody of ours is out in ${esc(cityName(f))}.` : 'Nobody is out. Crews you send away are followed here, day by day.'}</p>
           ${any ? '' : '<button class="btn" data-action="nav" data-id="jobs">Find work</button>'}`}
    </div>`;
}

/**
 * Tonight, beside the map on wide screens and under it on phones (2026-11-07; was "The city tonight",
 * a row per district that did what tapping the map does). Only districts with something worth a
 * tap, each going somewhere the map doesn't: work → the job (or the board), street talk → the
 * rumour. Crews out, calls and raids are in Out now above. Then who's home, and where it's warm.
 */
function citySummary() {
  const r = activeRumour(state);
  const talkMsg = r ? state.inbox.find((m) => m.type === 'rumour' && m.id.startsWith('rumour-')) : null;
  const open = MAP_DISTRICTS.filter((k) => !DISTRICT_CARDS[k].locked);
  const icon = (k) => `<svg class="tonight__icon" viewBox="0 0 48 44" aria-hidden="true">${landmark(k, { x: 24, y: 44, size: 48, light: turfHex(k) ?? '#3de8d8' })}</svg>`;
  const rows = open.map((k) => {
    const jobs = jobsIn(k);
    const talk = r?.district === k;
    if (!jobs.length && !talk) return '';
    const heat = heatIn(state, k);
    const what = [jobs.length ? `${jobs.length} job${jobs.length === 1 ? '' : 's'} on the board` : '', heat >= 3 ? `heat ${heat}` : '', talk ? `street talk: ${r.tag ?? 'word going round'}` : ''].filter(Boolean).join(' · ');
    // One job opens its plan; several open the board (street talk shows there too); talk alone opens the rumour.
    const [action, id, go] = jobs.length === 1 ? ['open-job', jobs[0].j.id, 'Plan'] : jobs.length ? ['nav', 'jobs', 'Jobs'] : talkMsg ? ['read-message', talkMsg.id, 'Talk'] : ['nav', 'jobs', 'Jobs'];
    return `<li><button class="tonight__row" data-action="${action}" data-id="${esc(id)}" style="--turf:${turfHex(k) ?? 'var(--line)'}">
      ${icon(k)}<span class="tonight__what"><span class="tonight__where">${esc(cityName(k).replace(/^The /, ''))}</span><span>${esc(what.charAt(0).toUpperCase() + what.slice(1))}</span></span>
      <span class="tonight__go">${go} ›</span></button></li>`;
  }).filter(Boolean);
  const inText = (k) => NAMES.districtsInText?.[k] ?? cityName(k);
  const noWork = open.filter((k) => !jobsIn(k).length && r?.district !== k).map(inText);
  // Your people at home, hall by hall: who's in, who's hurt (the ones out are in Out now).
  const outIds = new Set([...(state.awayJobs ?? []).flatMap((j) => j.mission.crewIds), ...sideTasksOut(state).flatMap((t) => t.crewIds)]);
  const halls = (state.halls ?? []).map((h) => {
    const who = residents(state, h.district).filter((o) => !outIds.has(o.id));
    const hurt = who.filter((o) => o.condition?.injury && o.condition.injury !== 'healthy').length;
    return `${who.length} in ${cityName(h.district)}${hurt ? ` (${hurt} hurt)` : ''}`;
  });
  const hot = HEAT_DISTRICTS.filter((d) => heatIn(state, d) > 0).sort((a, b) => heatIn(state, b) - heatIn(state, a));
  return `
    <h2>Tonight</h2>
    ${rows.length ? `<ul class="list list--plain tonight">${rows.join('')}</ul>` : '<p class="muted small">Nothing on the board anywhere tonight. New work comes in through the week.</p>'}
    ${noWork.length && rows.length ? `<p class="muted small">No work tonight in ${esc(noWork.length > 1 ? `${noWork.slice(0, -1).join(', ')} and ${noWork.at(-1)}` : noWork[0])}.</p>` : ''}
    <h2>At home</h2>
    <p class="small">${esc(halls.join(' · '))}${outIds.size ? ` · ${outIds.size} out` : ''}.</p>
    <p class="muted small">${hot.length ? `Heat: ${hot.map((d) => `${esc(districtName(d))} ${heatIn(state, d)}/10`).join(' · ')}.` : 'No heat anywhere.'}</p>
    `;
}

/**
 * A district's page (City › Districts): what is happening there now (who is at the hall, our crews out, work open,
 * street talk, the gangs' grudge), then the district itself below it (its picture, pitch and the Book's write-up:
 * who runs it, police, 3am, custom, landmarks, kinds of work). The lore shows even when nothing is going on.
 */
function districtCard(key) {
  const c = DISTRICT_CARDS[key];
  const turf = DISTRICTS[key]?.turf;
  const jobs = MISSIONS.filter((m) => m.district === key && !m.heistOnly).map((m) => m.name); // a heist's prep shows only when asked
  const kinds = MISSIONS.filter((m) => m.district === key && !isOpeningJob(m.id) && !m.heistOnly).map((m) => m.name);
  const out = crewOutIn(key);
  const art = districtArt(key);
  const inText = NAMES.districtsInText?.[key] ?? cityName(key);
  return `
    <div class="riskcard citycard" style="--turf:${turfHex(key) ?? 'var(--line)'}">
      ${canGoBack() ? `<button class="linkbtn" data-action="back">‹ ${esc(backLabel())}</button>` : ''}
      <h2 class="nomargin">${esc(cityName(key))} <span class="muted">${esc(c.chinese)}</span></h2>
      <p class="muted small">${esc(c.side)}${turf ? ` · <span class="citycard__turf">${esc(turf)}</span>` : ''}${key === SAFEHOUSE_DISTRICT ? ' · our home hall' : hallIn(state, key) ? ' · a hall of ours' : ''}${out ? ` · ${out} of yours out here` : ''}${heatIn(state, key) ? ` · heat ${heatIn(state, key)}/10` : ''}</p>
      ${c.locked ? '' : gangsOn(key).map((g) => `<p class="small citycard__grudge">${esc(GANGS[g].short)} grudge: ${grudgeGauge(g)}${hallIn(state, key) ? ` <span class="muted">· from ${GRUDGE.raidAt} they may raid our hall here</span>` : ''}</p>`).join('')}
      ${(() => {
        const h = hallIn(state, key);
        if (!h) return '';
        const who = residents(state, key);
        const raid = raidOn(state, key);
        return `<div class="citycard__hall"><p class="small"><strong>Our hall</strong> · ${who.length}/${bedsOf(h)} beds · level ${h.level}${hallShut(state, key) ? ` · <span class="citycard__shut">shut after a raid until day ${h.shutUntil}</span>` : ''}${raid ? ` · <span class="citycard__raid">raid ${esc(raidWhen(raid))}${raid.answer === 'paid' ? ', paid off' : ''}</span>` : ''}</p>
          ${who.length ? `<span class="citycard__faces">${who.map((op) => { const away = !!op.condition?.awayUntil && op.condition.awayUntil > state.day; return `<button class="citycard__face ${away ? 'is-out' : ''}" data-action="op-link" data-id="${esc(op.id)}" aria-label="${esc(op.handle)}${away ? ', out' : ''}">${face(op, 'sm')}</button>`; }).join('')}</span>` : '<p class="muted small">Nobody lives here yet.</p>'}
          <button class="btn btn--block citycard__hallbtn" data-action="hall-page" data-id="${esc(key)}">Manage the hall ›</button></div>`;
      })()}
      ${c.locked ? '' : (() => {
        const now = jobsIn(key);
        return now.length ? `<div class="stack">${now.map(({ j, v }) => `<button class="btn" data-action="open-job" data-id="${esc(j.id)}">${esc(v.tpl.name)} · ${money(v.pay)} · ${daysLeft(j.expiresDay)}</button>`).join('')}</div>`
          : jobs.length ? `<p class="small muted">No work on the board here right now. New work comes in through the week.</p>`
            : '<p class="small muted">Nobody here is hiring crews like yours yet.</p>';
      })()}
      ${activeRumour(state)?.district === key ? `<p class="talk-tag">Street talk: ${esc(activeRumour(state).text)}</p>` : ''}
      <div class="citylore">
        <h2>About ${esc(inText)}</h2>
        ${art ? `<div class="citylore__art" aria-hidden="true">${art}</div>` : ''}
        <p class="body">${esc(c.pitch)}</p>
        ${c.locked ? `<p class="intel">${esc(c.teaser)}</p>` : ''}
        <p class="small"><strong>Who runs it:</strong> ${esc(c.control)}</p>
        <p class="small"><strong>Police:</strong> ${esc(c.police)}</p>
        <p class="small"><strong>At 3am:</strong> ${esc(c.night)}</p>
        <p class="small"><strong>Local custom:</strong> ${esc(c.custom)}</p>
        <p class="small"><strong>Landmarks:</strong></p>
        <ul class="small">${c.landmarks.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
        ${kinds.length ? `<p class="small"><strong>Kinds of work here:</strong> ${esc(kinds.join(', '))}</p>` : ''}
      </div>
    </div>`;
}

/**
 * Ops, the command centre (2026-11-05; its own tab 2026-11-06, owner: City "more seems like
 * lore"): the map, the picked district's card, everyone out, and the city tonight.
 */
/** City: what's happening out there. Sub-tabs Map · Districts · Tongs (Places is gone); the Book is a link in the header. */
export function renderCity() {
  const tab = ['map', 'districts', 'tongs'].includes(V.cityTab) ? V.cityTab : 'map';
  // A district's page, a tong's page and a name's profile each replace the sub-tab (and carry their own Back).
  if (tab === 'districts' && V.cityDistrict) return `<section class="panel">${districtCard(V.cityDistrict)}</section>`;
  if (tab === 'tongs' && V.tongsView) return renderTongs(state, V.tongsView, backLabel(), V.bookFilter);
  const body = { map: renderCityMap, districts: renderDistricts, tongs: () => renderTongs(state, null, backLabel()) }[tab]();
  return `${rootBack()}
    <section class="panel">
      <div class="opshead"><h1 class="cityhead">City <span class="muted small">${esc(NAMES.city)} tonight</span></h1>
        <button class="tierbtn" data-action="book" aria-label="The Book: the city's districts, clients, who's who and history"><span class="tier">Book</span></button></div>
      ${subTabs('City sections', 'city-tab', [['map', 'Map'], ['districts', 'Districts'], ['tongs', 'Tongs']], tab)}
      ${body}
    </section>`;
}

/** City › Map: the heist marker, the map with a district picked on it, Out now and Tonight. */
function renderCityMap() {
  const heist = heistCard(state);
  const pick = V.cityDistrict ? `<div class="mappick"><span><strong>${esc(cityName(V.cityDistrict))}</strong></span>
        <span class="mappick__acts"><button class="btn btn--ghost" data-action="district-open" data-id="${esc(V.cityDistrict)}">Open the district ›</button>
        <button class="linkbtn" data-action="city-whole">× Whole city</button></span></div>` : '';
  return `${heist ? `<button class="heistmark" data-action="goto" data-id="jobs:heists"><span class="heistmark__kicker">Heist</span> <strong>${esc(heist.name)}</strong> <span class="heistmark__go">Jobs › Heists ›</span></button>` : ''}
      <div class="cols2 cols2--map">
        <div>${cityMap()}</div>
        <div>${pick}${renderOps()}${citySummary()}</div>
      </div>`;
}

/** City › Districts: a card for each district, opening its page (districtCard: what's there now, then the rest). */
function renderDistricts() {
  const open = MAP_DISTRICTS.filter((k) => !DISTRICT_CARDS[k].locked).sort((a, b) => (b === SAFEHOUSE_DISTRICT) - (a === SAFEHOUSE_DISTRICT));
  const locked = MAP_DISTRICTS.filter((k) => DISTRICT_CARDS[k].locked);
  const card = (k) => {
    const c = DISTRICT_CARDS[k];
    const jobs = jobsIn(k).length;
    const bits = [hallIn(state, k) ? `${residents(state, k).length} at our hall` : '', crewOutIn(k) ? `${crewOutIn(k)} of ours out` : '', jobs ? `${jobs} job${jobs === 1 ? '' : 's'} open` : '', heatIn(state, k) ? `heat ${heatIn(state, k)}/10` : ''].filter(Boolean);
    return `<li><button class="row districtrow" data-action="district-open" data-id="${esc(k)}" style="--turf:${turfHex(k) ?? 'var(--line)'}">
      <span class="row__main"><strong>${esc(cityName(k))}</strong> <span class="muted">${esc(c.chinese)}</span><br><span class="muted small">${esc(c.locked ? c.teaser : c.side)}</span>${bits.length ? `<br><span class="small">${esc(bits.join(' · '))}</span>` : ''}</span>
      <span class="row__meta" aria-hidden="true">›</span></button></li>`;
  };
  return `<ul class="list list--cols districts">${[...open, ...locked].map(card).join('')}</ul>`;
}

/** The Book (was the Lore tab): Who's who and History. The districts moved to City › Districts pages and the clients to Jobs › Clients pages (navigation rework, step 4). */
const LORE_TABS = { factions: "Who's who", history: 'History' };

export function renderLore() {
  const tab = LORE_TABS[V.loreTab] ? V.loreTab : 'factions';
  const groups = [...new Set(FACTIONS.map((f) => f.group))];
  const body = {
    factions: () => `
      <div class="cols2 cols2--flow">
      ${groups.map((g) => `
        <div>
          <h2>${esc(g)}</h2>
          <ul class="list list--plain">
            ${FACTIONS.filter((f) => f.group === g).map((f) => `
              <li><strong>${esc(f.name)}</strong> <span class="muted small">· ${esc(f.where)}</span><br>
                ${f.gang ? `<span class="small">Their grudge: ${grudgeGauge(f.gang)}</span><br>` : f.name.startsWith('The Brass Anchor') ? '<span class="small muted">Never raids a tong\'s hall.</span><br>' : ''}
                <span class="small">${esc(f.line)}</span><br>
                <span class="muted small">Rumour: ${esc(f.rumour)}</span></li>`).join('')}
          </ul>
        </div>`).join('')}
      </div>`,
    history: () => `
      <div class="cols2">
      <div>
      <h2>Everyone knows</h2>
      <ul class="list list--plain small">${STREET_FACTS.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      </div>
      <div>
      <h2>A short history</h2>
      <ul class="list list--plain small">${HISTORY.map((h) => `<li><strong>${esc(h.year)}</strong> ${esc(h.text)}</li>`).join('')}</ul>
      </div>
      </div>`,
  }[tab]();
  return `
    <section class="panel">
      ${canGoBack() ? `<button class="linkbtn" data-action="back">‹ ${esc(backLabel())}</button>` : ''}
      <h1 class="cityhead">${esc(NAMES.city)} <span class="muted">燈籠灣</span> <span class="muted small">2057</span></h1>
      <div class="subtabs" role="group" aria-label="Lore sections">
        ${Object.entries(LORE_TABS).map(([k, label]) => `<button class="subtab ${k === tab ? 'is-on' : ''}" data-action="lore-tab" data-id="${k}" aria-pressed="${k === tab}">${esc(label)}</button>`).join('')}
      </div>
      ${body}
    </section>`;
}
