// Tong: the halls list, a hall's own page (compound, raid card, posts), and the tab's header.
import { heatIn } from '../core/heat.js';
import { hallIn, residents, bedsOf, canOpenHall, nextHallExpansion, buyPrice, canMove, freeBeds } from '../core/halls.js';
import { openRaids, defenceCut, raidOn, defencesIn, hallShut, raidThreat, postAssignments } from '../core/raids.js';
import { HALL_SITES, HOME_HALL } from '../data/halls.js';
import { rankOf } from '../core/tong.js';
import { TONG_RANKS, TONG_EXPLAINER } from '../data/tong.js';
import { hallBuildLine, buildingsOf, planSvg, buildGrid, compoundOverlay, raidWaysFor, planKey, buildSheet, buildPalette, defenceLine } from './hallbuild.js';
import { hasHallArt, insideBox, SPRITE_SHEET } from './hallart.js';
import { hallMap, partAt, floorUsed, floorOf } from '../core/hallbuild.js';
import { siteHeight } from '../data/sites.js';
import { PIECES } from '../data/hallBuild.js';
import { availability } from '../core/crew.js';
import { money } from '../core/money.js';
import { renderArmoury } from './gear.js';
import { getPref } from '../save/save.js';
import { hallMark, raidWhen, threatItem } from './raidcards.js';
import { esc, cityName, face, statusChip, infoText, subTabs, gearUi } from './shared.js';
import { state, backLabel, openInfo, V } from './view.js';

// --- the hall page's wide layout and art (2026-11-09) ---
/** Is the screen wide enough for the hall page's two columns, with the build tools in the right one? */
export const wideHall = () => typeof matchMedia === 'function' && !!matchMedia('(min-width: 1100px)').matches;
/** Is the hall art layer on (Settings › Hall art)? A viewing preference, not part of a save. */
export const hallArtOn = () => getPref('hallart');
/** A build view scoped to the compound (defences, outside) or to one building (its rooms): `scope` 'compound' or a part id. */
export const newBuildView = (district, scope = 'compound') => ({ district, cell: null, piece: null, rot: 0, picked: null, tab: scope === 'compound' ? 'post' : 'room', scope });

// --- crew --------------------------------------------------------------
/** The tong's halls (core/halls.js): a row each, opening the hall's own page; and opening another. */
function renderHalls() {
  const halls = state.halls ?? [];
  const sites = Object.entries(HALL_SITES).filter(([d, site]) => site.deposit != null && !hallIn(state, d));
  return `
      <h2>Halls</h2>
      <ul class="halls">
        ${halls.map((h) => {
          const who = residents(state, h.district);
          const raid = openRaids(state).some((r) => r.district === h.district && r.answer !== 'paid');
          return `
          <li class="hall hall--row">
            <button class="hallrow" data-action="hall-page" data-id="${esc(h.district)}" aria-label="The ${esc(cityName(h.district))} hall: ${who.length} of ${bedsOf(h)} beds${raid ? ', a raid is coming' : ''}">
            ${hallMark(h.district, { raid })}
            <span class="hall__body">
            <span class="hall__head"><strong>${esc(cityName(h.district))}</strong>${h.district === HOME_HALL ? ' <span class="hall__home">home</span>' : ''}${h.owned ? ' <span class="hall__home hall__owned">ours</span>' : ''}</span>
            <span class="small">${who.length}/${bedsOf(h)} beds · level ${h.level} · ${h.owned ? 'no rent' : `${money(h.rent)}/wk`}${heatIn(state, h.district) ? ` · heat ${heatIn(state, h.district)}/10` : ''}</span>
            <span class="small muted">${esc(hallBuildLine(h, defenceCut(state, h.district)))}</span>
            </span>
            <span class="hallrow__go" aria-hidden="true">›</span>
            </button>
          </li>`;
        }).join('')}
      </ul>
      ${sites.length ? `
      <h2>Open a hall</h2>
      <p class="muted small">A hall in another district: people of ours living there, more rent, more to look after.</p>
      <ul class="halls">
        ${sites.map(([d, site]) => {
          const can = canOpenHall(state, d);
          return `
          <li class="hall is-closed has-mark">
            ${hallMark(d, { dim: true })}
            <div class="hall__body">
            <p class="hall__head"><strong>${esc(cityName(d))}</strong> <span class="muted small">${money(site.deposit)} down · ${money(site.rent)}/wk · ${site.beds} beds</span></p>
            ${can.ok ? `<button class="btn btn--block" data-action="open-hall" data-id="${esc(d)}">Open the hall</button>` : `<p class="muted small">${esc(can.reason)}</p>`}
            </div>
          </li>`;
        }).join('')}
      </ul>` : ''}`;
}

/**
 * A hall's own page (owner, 2026-11-07: halls are per district, so each gets its place): where it
 * is, its plan as built, who sleeps there and moving people in, Build, Expand and Buy. Opened from
 * Crew › Halls or the district's card on Ops, and shown on that tab.
 */
export function renderHallPage(d) {
  const h = hallIn(state, d);
  const who = residents(state, d);
  const x = nextHallExpansion(state, d);
  const price = buyPrice(state, d);
  const raid = raidOn(state, d);
  const live = raid && raid.answer !== 'paid' && !raid.done;
  const movers = state.crew.filter((o) => (o.hall ?? HOME_HALL) !== d && canMove(state, o.id, d).ok);
  const free = freeBeds(state, d);
  const wide = wideHall();
  const art = hallArtOn() && hasHallArt(d);
  const ui = { esc, money, cityName };
  const site = hallMap(d);
  const buildings = buildingsOf(state, d);
  // The compound (default) or the inside of one of its buildings (2026-11-09).
  const bld = V.hallInside ? buildings.find((b) => b.id === V.hallInside) ?? null : null;
  const scope = bld ? bld.id : 'compound';
  // Two modes (2026-11-12): looking (the default: buildings, who is in them, what's next) and building.
  // The plan's tap grid is live inside a building, and on the compound once Start building is pressed
  // (wide screens; a phone has its own Build screen).
  const mine = V.buildView && V.buildView.district === d && V.buildView.scope === scope;
  const view = bld ? (mine ? V.buildView : newBuildView(d, scope)) : wide && mine && V.buildView.on ? V.buildView : null;
  const vb = bld ? insideBox(site, bld.id) : `0 0 360 ${siteHeight(site)}`;
  const planBox = `<div class="bplan hallpage__plan ${bld ? 'is-inside' : ''}">${planSvg(state, d, art, bld ? { inside: bld.id } : { compound: true })}${view
    ? buildGrid(state, view, esc, art)
    : `<svg class="bgrid" viewBox="${vb}">${compoundOverlay(state, d, { esc, art, tap: true })}${raidWaysFor(state, d)}</svg>`}</div>`;
  const buildNote = bld ? ''
    : view ? `<button class="btn btn--block hallpage__start" data-action="build-done">Done</button>`
    : `<button class="btn btn--primary btn--block hallpage__start" data-action="build-hall" data-id="${esc(d)}">Build defences ›</button><p class="small muted">Defences go on the compound outside. To build rooms, open a building.</p>`;
  const facesOf = (list, total) => (list.length ? `<div class="hallfaces">${list.map((op) => `<button class="hallfaces__op" data-action="open-op" data-id="${esc(op.id)}" aria-label="${esc(`${op.name} "${op.handle}", ${op.tier ?? ''} ${op.role}`)}">${face(op)}</button>`).join('')}${Array.from({ length: Math.max(0, total - list.length) }, () => '<span class="hallfaces__free" aria-hidden="true">+</span>').join('')}</div>
      <ul class="list hallpage__names">${list.map((op) => `<li class="small"><strong>${esc(op.handle)}</strong> <span class="muted">${esc(op.tier ?? '')} ${esc(op.role)}</span> ${statusChip(availability(state, op))}</li>`).join('')}</ul>` : '<p class="muted small">Nobody sleeps here yet.</p>');
  const movein = free && movers.length ? `
      <details class="hallmove"><summary class="btn btn--ghost btn--block">Move someone in <span class="muted small">· ${free} free ${free === 1 ? 'bed' : 'beds'}</span></summary>
      <p class="muted small">They settle in today and are free tomorrow.</p>
      <div class="stack">${movers.map((op) => `<button class="btn btn--ghost" data-action="move-hall" data-id="${esc(`${op.id}|${d}`)}">${esc(op.handle)} <span class="muted small">· from ${esc(cityName(op.hall ?? HOME_HALL))}</span></button>`).join('')}</div></details>` : '';
  const place = `<div class="stack">
        ${x ? `<button class="btn btn--block" data-action="expand-hall" data-id="${esc(d)}" ${state.cash >= x.cost ? '' : 'disabled'}>${x.partName ? `Expand: take ${esc(x.partName.toLowerCase())}` : 'Expand'}: +${x.beds} beds for ${money(x.cost)} (${x.rentIncrease ? `rent +${money(x.rentIncrease)}/wk` : 'no rent'})</button>` : '<p class="small muted">The whole block is ours.</p>'}
        ${price == null ? '' : `<button class="btn btn--block" data-action="buy-hall" data-id="${esc(d)}" ${state.cash >= price ? '' : 'disabled'}>Buy the place: ${money(price)}, then no rent</button>`}
      </div>`;
  const nDef = defencesIn(state, d);
  // The buildings as cards: name, who sleeps there, the rooms built. Locked ones say when they open.
  const cards = `<h2>Buildings</h2><ul class="bcards">${(site.parts ?? []).filter((p) => p.inside).map((p) => {
    const b = buildings.find((y) => y.id === p.id);
    if (!b) return `<li class="bcard is-locked"><strong>${esc(p.name)}</strong> <span class="muted small">${x?.part === p.id ? `next · ${money(p.cost)}` : `opens at level ${p.lvl}`}</span><p class="small muted">${esc(p.about)}</p></li>`;
    return `<li class="bcard"><button class="bcard__main" data-action="hall-building" data-id="${esc(b.id)}" aria-label="${esc(`Open ${b.name}`)}">
      <span class="bcard__top"><strong>${esc(b.name)}</strong><span class="bcard__go">Open ›</span></span>
      <span class="bcard__faces">${b.who.map((op) => face(op, 'sm')).join('') || '<span class="muted small">Nobody sleeps here</span>'}</span>
      <span class="small">${b.beds} ${b.beds === 1 ? 'bed' : 'beds'} · ${b.rooms.length ? esc(b.rooms.join(', ')) : '<span class="muted">no rooms built</span>'}</span></button></li>`;
  }).join('')}</ul>`;
  const outside = (site.parts ?? []).filter((p) => !p.inside).map((p) => {
    const held = p.lvl <= h.level;
    const n = (h.build ?? []).filter((b) => PIECES[b.piece]?.kind === 'defence' && partAt(site, b.x, b.y)?.id === p.id).length;
    return `<li class="sec ${held ? '' : 'is-locked'}"><strong>${esc(p.name)}</strong> <span class="muted small">${held ? `${n} ${n === 1 ? 'defence' : 'defences'}` : x?.part === p.id ? `next · ${money(p.cost)}` : `opens at level ${p.lvl}`}</span><br><span class="small ${held ? '' : 'muted'}">${esc(p.about)}</span></li>`;
  }).join('');
  const head = bld
    ? `<button class="linkbtn" data-action="hall-compound">‹ The compound</button>
        <div class="hallpage__head"><div><h1 class="btitle">${esc(bld.name)}</h1><p class="muted small">The ${esc(cityName(d).replace(/^The /, ''))} hall · ${bld.who.length} of ${bld.beds} ${bld.beds === 1 ? 'bed' : 'beds'} slept in · ${bld.rooms.length ? esc(bld.rooms.join(', ')) : 'no rooms built'}</p></div></div>
        <p class="small">${esc(bld.about)}</p>`
    : `<button class="linkbtn" data-action="back">‹ ${esc(backLabel())}</button>
        <div class="hallpage__head">${hallMark(d, { raid: live })}
          <div><h1 class="btitle">The ${esc(cityName(d).replace(/^The /, ''))} hall${d === HOME_HALL ? ' <span class="hall__home">home</span>' : ''}${h.owned ? ' <span class="hall__home hall__owned">ours</span>' : ''}</h1>
          <p class="muted small">${esc(HALL_SITES[d]?.place ?? '')}</p></div>
        </div>
        <p class="small">Level ${h.level} · ${h.owned ? 'no rent' : `${money(h.rent)}/wk`} · heat ${heatIn(state, d)}/10${hallShut(state, d) ? ` · <span class="citycard__shut">shut after a raid until day ${h.shutUntil}</span>` : ''}${live ? ` · <span class="citycard__raid">raid ${esc(raidWhen(raid))}</span>` : ''}</p>`;
  return `
    <section class="panel hallpage ${wide ? 'is-wide' : ''} ${bld ? 'is-inside' : ''} ${view && !bld ? 'is-building' : ''}">
      ${art ? SPRITE_SHEET : ''}
      <div class="hallpage__cols">
      <div class="hallpage__map">
        ${head}
        ${planBox}
        ${planKey(state, d, { building: !!view, compound: !bld, inside: !!bld })}
        ${buildNote}
        ${bld ? '' : cards}
      </div>
      <div class="hallpage__side">
        ${hallThreat(d, raid, !bld)}${bld ? '' : postsPanel(d, raid)}
        <h2>${bld ? 'Sleeps in this building' : 'Who sleeps here'} <span class="muted small">${bld ? `${bld.who.length}/${bld.beds} beds` : `${who.length}/${bedsOf(h)} beds`}</span></h2>
        ${facesOf(bld ? bld.who : who, bld ? bld.beds : bedsOf(h))}
        ${movein}
        ${view
    ? `<h2>${bld ? 'Build rooms here' : 'Build defences'} <span class="muted small">floor ${floorUsed(h)}/${floorOf(h)}</span></h2>${buildSheet(state, view, ui)}${buildPalette(state, view, ui)}`
    : `${mine && V.buildView.part ? buildSheet(state, V.buildView, ui) : ''}`}
        ${bld || view ? '' : `<h2>Defences <span class="muted small">${nDef} ${nDef === 1 ? 'piece' : 'pieces'}</span></h2>
        <p class="small bdef">${defenceLine(state, d)}</p>`}
        ${view ? '' : `<h2>Grow the hall</h2>${place}`}
        ${bld || view ? '' : `<h2>Outside</h2><ul class="secs">${outside}</ul>`}
      </div>
      </div>
    </section>`;
}

/**
 * The hall page's raid card (2026-11-09): the same Threats card as on City and Today (`threatItem`), plus
 * how hard it is with our defences and where to see the ways in.
 */
function hallThreat(d, r, onCompound) {
  if (!r || r.answer === 'paid' || r.done) return '';
  const cut = defenceCut(state, d);
  const note = `<p class="small">Threat <strong>${raidThreat(state, d, r)}</strong>${cut ? ` (our defences take off ${cut})` : ''}. ${onCompound ? 'The ways in are marked red on the plan.' : 'It comes at the compound from outside: the ways in are on the compound view.'}</p>`;
  return `<ul class="crewsout hallthreat" aria-label="Raid on this hall">${threatItem(r, { onHall: true, note })}</ul>`;
}

/**
 * Who stands where if the raid comes by the front gate (2026-11-12): one row per post built on the hall, with
 * the runner on it (ours to set; left alone, the best at home fill them) and a button to hand it to the next.
 * '' with no raid warned or no posts built.
 */
function postsPanel(d, r) {
  if (!r || r.answer === 'paid' || r.done) return '';
  const list = postAssignments(state, d, r);
  if (!list.length) return '';
  const rows = list.map((a) => `<li class="postrow ${a.op ? '' : 'is-empty'}"><span class="postrow__main"><strong>${esc(a.name)}</strong> <span class="muted small">${esc(PIECES[a.piece].name.toLowerCase())}${a.high ? ' · from above' : ''}</span><br>${a.op ? `${face(a.op, 'sm')} <span class="small">${esc(a.op.handle)}</span>` : '<span class="small postrow__none">Nobody</span>'}</span>
      <button class="btn btn--ghost" data-action="raid-post" data-id="${esc(`${r.id}|${a.slot}`)}" aria-label="${esc(`Change who stands at ${a.name}`)}">Change ›</button></li>`).join('');
  return `<h2>Posts <span class="muted small">if they come by the front gate</span></h2><ul class="postlist">${rows}</ul>`;
}

const HALL_COUNT_WORDS = ['No halls', 'One hall', 'Two halls', 'Three halls', 'Four halls', 'Five halls'];

/** Tong: what we've built. The rank and where we stand in words, then Halls · Armoury. */
export function renderTong() {
  const tab = ['halls', 'armoury'].includes(V.tongTab) ? V.tongTab : 'halls';
  const halls = (state.halls ?? []).length;
  const rank = rankOf(state);
  const next = TONG_RANKS[TONG_RANKS.findIndex((r) => r.id === rank.id) + 1];
  const standing = `${HALL_COUNT_WORDS[Math.min(halls, HALL_COUNT_WORDS.length - 1)]}, ${residentsTotal()} of ${totalBeds()} beds filled. ${next ? `Another hall would make us a ${next.name} tong.` : 'We are as high as a tong goes.'}`;
  return `
    <section class="panel">
      <div class="opshead"><h1 class="cityhead">Tong</h1>
        <button class="tierbtn" data-action="info" data-id="tong" aria-expanded="${openInfo.has('tong')}" aria-label="The tong's rank: ${esc(rank.name)}. What's a tong?"><span class="tier">${esc(rank.name)} tong</span></button></div>
      ${infoText('tong', TONG_EXPLAINER)}
      <p class="small tongstanding">${esc(standing)}</p>
      ${subTabs('Tong sections', 'tong-tab', [['halls', 'Halls'], ['armoury', 'Armoury']], tab)}
      ${tab === 'halls' ? renderHalls() : renderArmoury({ ...gearUi, embedded: true }, state)}
    </section>`;
}
const totalBeds = () => (state.halls ?? []).reduce((n, h) => n + bedsOf(h), 0);
const residentsTotal = () => (state.halls ?? []).reduce((n, h) => n + residents(state, h.district).length, 0);
