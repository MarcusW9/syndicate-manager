// Every tap in the game: onClick finds the [data-action] under the tap and switches on it.
// The one place UI state (V) and the game state change in answer to the player.
import { nextHallExpansion, expandHall, openHall, hallIn, buyPrice, buyHall, moveToHall } from '../core/halls.js';
import { raidOn, cycleRaidPost, setRaidPlan, markRaidCallSeen, payOffRaid } from '../core/raids.js';
import { HALL_SITES } from '../data/halls.js';
import { heistCard, buyStep } from '../core/heists.js';
import { pieceAt, bedAt, placePost, placePiece, turnPiece, canRemove, refundOf, removePiece } from '../core/hallbuild.js';
import { PIECES } from '../data/hallBuild.js';
import { isBlocked, advanceDay } from '../core/time.js';
import { chooseFounders, createNewGame } from '../core/state.js';
import { templateById } from '../core/jobs.js';
import { resolveDecision } from '../core/decisions.js';
import { swearIn } from '../core/oath.js';
import { money } from '../core/money.js';
import { startMission, resolvePending, runBattle, handOffFight, pullBack, chooseOption, resolveCritical, closeMission } from '../core/mission.js';
import { fightTap, takeOrders } from './fightorders.js';
import { fightScreenTap, takeFightChange } from './fightscreen.js';
import { sendOff, autoStep } from '../core/autorun.js';
import { takeCall, letThemRun, takeCommand } from '../core/away.js';
import { leanPicks } from '../core/squad.js';
import { assignSlot, planKit } from './board.js';
import { gearPlace } from './gear.js';
import { buyGear, buyOffer, itemName, sellPrice, sellGear, equip, unequip } from '../core/gear.js';
import { togglePause, toggleSpeed, showLatest, paceChanged, closeFinale } from './watch.js';
import { sideTaskById, sendOnSideTask } from '../core/sidetasks.js';
import { setPref, getPref, saveGame, exportSave, getActiveSlot, loadGame, unreadableSave, setActiveSlot, listSlots, deleteSlot, restoreUnreadable, exportUnreadable, discardUnreadable, loadBackup, importSave } from '../save/save.js';
import { FOUNDERS_TO_PICK, hire, haggle, passRecruit } from '../core/recruits.js';
import { findCard, sendScout, signCard } from '../core/dossier.js';
import { homeOf, homeSub, rootOf } from './nav.js';
import { FOUNDING_TABS, dayCueFor, wakeContinue, setState, render } from './app.js';
import { wideHall, newBuildView } from './hallscreens.js';
import { boardRead } from './jobs.js';
import { cityName } from './shared.js';
import { inboxView } from './today.js';
import { state, nav, CONTINUE_REST_MS, remember, goHome, restoreView, toRoot, viewNow, setSub, briefSeen, buzzLater, openInfo, V } from './view.js';

// --- events ------------------------------------------------------------
export function onClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t || t.disabled) return;
  const { action, id } = t.dataset;
  // On a wide screen the hall page builds in place (2026-11-09): its build view starts on the first tap.
  if (['nav', 'hall-page', 'halls-open', 'open-armoury', 'back'].includes(action)) V.hallInside = null;
  if (action.startsWith('build-') && action !== 'build-hall' && !V.buildView && V.hallPage && (wideHall() || V.hallInside || action === 'build-part')) V.buildView = { ...newBuildView(V.hallPage, V.hallInside ?? 'compound'), on: action !== 'build-part' };

  switch (action) {
    case 'hall-building': V.hallInside = id; V.buildView = null; break;
    case 'hall-compound': V.hallInside = null; V.buildView = null; break;
    case 'build-done': V.buildView = null; break;
    case 'toggle-hallart': setPref('hallart', !getPref('hallart')); break;
    case 'nav': if (state.founding && !FOUNDING_TABS.includes(id)) return; V.screen = id; nav.clear(); V.scrollDue = 0; V.buildView = null; V.tongsView = null; V.cityDistrict = null; V.leadName = null; V.clientPage = null; V.hallPage = null; V.openMessageId = null; V.openOperativeId = null; V.openRecruitId = null; V.gearSlot = null; V.bagPick = null; V.plan = null; V.sidePlan = null; V.pickSlot = null; break;
    case 'continue': {
      if (isBlocked(state) || Date.now() < V.continueRestUntil) return;
      const next = advanceDay(state);
      V.dayCue = dayCueFor(state, next);
      V.continueRestUntil = Date.now() + CONTINUE_REST_MS;
      setTimeout(wakeContinue, CONTINUE_REST_MS);
      return setState(next);
    }
    // A district on the map: zoom onto it and open its card (2026-11-07). Tapping it again keeps it;
    // "× Whole city", Esc or the harbour zooms back out.
    case 'city-district': V.cityDistrict = id; if (raidOn(state, id)) V.raidCardDue = id; break;
    case 'city-whole': V.cityDistrict = null; break;
    // A district's page, from its card in Districts or from the pick on the map.
    case 'district-open': remember(action, id); goHome('district'); V.tongsView = null; V.cityDistrict = id; break;
    // A crew's district in the list: light it on the map (scrolled into view) and narrow the list to it.
    case 'city-show': V.cityTab = 'map'; V.cityDistrict = V.cityDistrict === id ? null : id; V.cityMapDue = !!V.cityDistrict; break;
    // City's sub-tabs (the Book's own are 'lore-tab'): a different part of the tab, so no page stays open.
    case 'city-tab': V.cityTab = id; V.cityDistrict = null; V.tongsView = null; break;
    case 'jobs-tab': V.jobsTab = id; V.clientPage = null; break;
    case 'lore-tab': V.loreTab = id; break;
    case 'tong-page': remember(action, id); goHome('tong'); V.tongsView = id; break;
    // A free name or a name in a tong: its page, a scout trip (two days away), and signing (core/dossier.js).
    case 'tong-name': remember(action, id); goHome('name'); V.tongsView = `name:${findCard(state, id)?.id ?? id}`; break;
    case 'scout-send': { const [name, opId] = id.split('|'); return setState(sendScout(state, name, opId)); }
    // A name in Crew › Leads (also the "View in Leads" shortcut on a City profile): scouting, what it would take, Sign.
    case 'lead-name': remember(action, id); goHome('leadName'); V.leadName = findCard(state, id)?.id ?? id; V.openRecruitId = null; V.openOperativeId = null; break;
    case 'sign-name': { // signed: their page is gone, so go back to where it was opened from (past any page of theirs)
      const next = signCard(state, id);
      if (next !== state) {
        let view;
        const cid = findCard(state, id)?.id ?? id;
        while ((view = nav.pop()) && (view.leadName === cid || view.tongsView === `name:${cid}`)) { /* their own pages are gone */ }
        if (view) { restoreView(view); V.scrollDue = view.scrollY; } else { V.leadName = null; toRoot(); }
      }
      return setState(next);
    }
    case 'ops-district': // a shortcut to the district's page (the heat chip, a Book link)
      if (!(V.screen === homeOf('district') && V.cityTab === homeSub('district') && V.cityDistrict === id)) remember(action, id);
      goHome('district'); V.tongsView = null; V.cityDistrict = id; break;
    // A client's page (Jobs › Clients), from its row or from a job's plan: the same page from anywhere.
    case 'client-open': remember(action, id); goHome('client'); V.clientPage = id; V.plan = null; V.sidePlan = null; break;
    case 'read-message': // from City › Map's Tonight list
    case 'open-message': {
      // Wide screens show the list beside the message, so reading the next one must not jump to the top
      // (playtest, 2026-11-09). Narrow ones swap the list for the message, which does start at the top.
      const sideBySide = V.screen === homeOf('message') && !!window.matchMedia?.('(min-width: 900px)').matches;
      remember(action, id);
      if (sideBySide) V.scrollDue = null;
      V.screen = homeOf('message');
      V.openMessageId = id;
      const msg = state.inbox.find((m) => m.id === id);
      // A hands-off report you haven't read plays out once: you didn't watch that job.
      if (msg?.type === 'report' && !msg.read && msg.timeline?.orders) V.playReportId = id;
      if (msg && !msg.read) { msg.read = true; saveGame(state); }
      break;
    }
    // The reader's ‹ › (2026-11-12): the next or previous message in the list as shown, without going back to it.
    case 'msg-step': {
      const { shown } = inboxView();
      const m = shown[shown.findIndex((x) => x.id === V.openMessageId) + Number(id)];
      if (!m) return;
      V.openMessageId = m.id;
      V.scrollDue = null;
      if (m.type === 'report' && !m.read && m.timeline?.orders) V.playReportId = m.id;
      if (!m.read) { m.read = true; saveGame(state); }
      break;
    }
    // Back puts the view you came from back (ui/nav.js): its tab, page, filters, plan and scroll. With nothing to
    // go back to (a direct link, a fresh load) it opens the root of the page's home tab. The game is never rewound.
    case 'msg-close':
    case 'back': {
      const view = nav.pop();
      if (view) { restoreView(view); V.focusNext = view.via; V.scrollDue = view.scrollY; } else toRoot();
      break;
    }
    case 'decide': return setState(resolveDecision(state, id, t.dataset.option));
    case 'swear-in': return setState(swearIn(state, id));
    // A crew member's name in a message: open their page, remembering the message to come back to.
    case 'trait-tip': V.traitTip = V.traitTip === id ? null : id; break;
    // A runner's name or face anywhere (a message, a job board strip, a hall, a district card): their page, on Crew.
    case 'open-op': case 'op-link': remember(action, id); goHome('runner'); V.openRecruitId = null; V.openOperativeId = id; V.bagPick = null; break;
    // Gear (ui/gear.js, core/gear.js): the armoury, and a runner's slots.
    // The Armoury is a sub-tab of Tong; the squad board's link to it keeps the plan (Back returns to it).
    case 'open-armoury': remember(action, id); goHome('armoury'); V.hallPage = null; V.buildView = null; V.openOperativeId = null; V.openRecruitId = null; V.gearSlot = null; break;
    case 'tong-tab': V.tongTab = id; break;
    case 'crew-tab': V.crewTab = id; break;
    // Shortcuts to a sub-tab's home from another page (a link, not a tab choice: Back returns).
    case 'halls-open': remember(action, id); goHome('hall'); V.hallPage = null; V.buildView = null; break;
    case 'leads-open': remember(action, id); goHome('recruit'); V.openRecruitId = null; V.openOperativeId = null; break;
    case 'book': remember(action, id); V.screen = 'lore'; break;
    // A shortcut to a tab's home from a card elsewhere ("tab:sub"), e.g. Today's crews-out line → City › Map. A link, not a tab choice: Back returns.
    case 'goto': {
      remember(action, id);
      const [tab, sub] = id.split(':');
      restoreView({ ...rootOf({ ...viewNow(), screen: tab }), screen: tab });
      if (sub) setSub(tab, sub);
      break;
    }
    case 'buy': return setState(buyGear(state, id, t.dataset.tier || 'street'));
    case 'buy-offer': return setState(buyOffer(state, id));
    case 'sell': {
      const item = (state.stash ?? []).find((i) => i.uid === id);
      if (item && confirm(`Sell the ${item.name ?? itemName(item).toLowerCase()} for ${money(sellPrice(item))}?`)) return setState(sellGear(state, id));
      break;
    }
    case 'gear-slot': V.gearSlot = id; break;
    case 'close-gear': V.focusNext = { action: 'gear-slot', id: V.gearSlot }; V.gearSlot = null; break;
    case 'equip': {
      // Into the place the sheet was opened for (core/gear.js equip): a socket, or a cell in the bag.
      const place = gearPlace(V.gearSlot);
      const target = place.kind === 'implant' ? { socket: place.socket } : place.kind === 'bag' ? { x: place.x, y: place.y } : null;
      V.focusNext = place.kind === 'bag' ? null : { action: 'gear-slot', id: V.gearSlot }; V.gearSlot = null;
      return setState(equip(state, id, V.openOperativeId, target));
    }
    case 'unequip': V.focusNext = { action: 'gear-slot', id: V.gearSlot }; V.gearSlot = null; return setState(unequip(state, V.openOperativeId, id));
    // The bag (the carry grid, 2026-11-06): tap an item to pick it up; a free cell moves it there,
    // or, with nothing picked up, opens what fits there.
    case 'bag-pick': V.bagPick = V.bagPick === id ? null : id; break;
    case 'bag-cell': {
      if (V.bagPick) { const [x, y] = id.split(',').map(Number); const uid = V.bagPick; V.bagPick = null; return setState(equip(state, uid, V.openOperativeId, { x, y })); }
      V.gearSlot = `bag:${id}`;
      break;
    }
    case 'bag-off': { const uid = V.bagPick; V.bagPick = null; return setState(unequip(state, V.openOperativeId, uid)); }
    case 'open-recruit': remember(action, id); goHome('recruit'); V.openRecruitId = id; break;
    case 'founder-toggle':
      if (V.founderPick.includes(id)) V.founderPick = V.founderPick.filter((x) => x !== id);
      else if (V.founderPick.length < FOUNDERS_TO_PICK) V.founderPick = [...V.founderPick, id];
      V.focusNext = { action, id };
      break;
    case 'found-crew': {
      const next = chooseFounders(state, V.founderPick);
      if (next === state) return;
      V.founderPick = []; nav.clear(); V.screen = 'inbox';
      return setState(next);
    }
    case 'hire': V.openRecruitId = null; return setState(hire(state, id));
    case 'haggle': return setState(haggle(state, id));
    case 'pass': V.openRecruitId = null; return setState(passRecruit(state, id));
    case 'expand-hall': { // halls (core/halls.js)
      const x = nextHallExpansion(state, id);
      if (x && confirm(`${x.partName ? `Take ${x.partName.toLowerCase()} for the ${cityName(id)} hall` : `Expand the ${cityName(id)} hall`} for ${money(x.cost)}? +${x.beds} beds; ${x.rentIncrease ? `its rent goes up by ${money(x.rentIncrease)} a week` : 'no rent'}.`)) {
        if (V.buildView) V.buildView = { ...V.buildView, part: null };
        return setState(expandHall(state, id));
      }
      break;
    }
    case 'open-hall': {
      const site = HALL_SITES[id];
      if (confirm(`Open a hall in ${cityName(id)}: ${site.place}? ${money(site.deposit)} down, ${site.beds} beds, ${money(site.rent)} a week.`)) return setState(openHall(state, id));
      break;
    }
    // Building up a hall (ui/hallbuild.js, core/hallbuild.js).
    // A hall's page opens on its home tab whichever tab the link was on (ui/nav.js HOMES).
    case 'hall-page': remember(action, id); goHome('hall'); V.hallPage = id; V.openOperativeId = null; V.openRecruitId = null; V.buildView = null; break;
    case 'build-hall': if (wideHall()) { V.hallPage = id; V.buildView = { ...newBuildView(id, V.hallInside ?? 'compound'), on: true }; break; } remember(action, id); goHome('hallBuild'); V.hallPage = id; V.hallInside = null; V.openOperativeId = null; V.buildView = { ...newBuildView(id, 'compound'), screen: true }; break;
    case 'build-cell': {
      const [x, y] = id.split(',').map(Number);
      const hall = hallIn(state, V.buildView.district);
      const on = pieceAt(hall, x, y) ?? bedAt(hall, x, y);
      V.buildView = on ? { ...V.buildView, cell: null, picked: on.id, part: null, keep: null } : { ...V.buildView, cell: [x, y], picked: null, part: null, keep: null };
      break;
    }
    case 'build-slot': { // a place for a post: pick it, or pick the post built there to remove it
      const built = hallIn(state, V.buildView.district)?.build?.find((b) => b.slot === id);
      V.buildView = built ? { ...V.buildView, slot: null, picked: built.id, cell: null, part: null, keep: null } : { ...V.buildView, slot: id, picked: null, cell: null, part: null, keep: null };
      break;
    }
    case 'build-part': V.buildView = { ...V.buildView, part: id, keep: null, cell: null, picked: null }; break;
    case 'build-keep': V.buildView = { ...V.buildView, keep: id, part: null, cell: null, picked: null }; break;
    case 'build-piece': V.buildView = { ...V.buildView, piece: id, picked: null, rot: 0 }; break;
    case 'build-tab': V.buildView = { ...V.buildView, tab: id, piece: null, slot: null, picked: null, cell: null }; break;
    case 'build-rot': V.buildView = { ...V.buildView, rot: V.buildView.rot ? 0 : 1 }; break;
    case 'build-place': {
      const { district, piece, cell, rot } = V.buildView;
      if (PIECES[piece]?.kind === 'post') { // a post goes in its slot, not on a square
        const next = placePost(state, district, piece, V.buildView.slot);
        if (next === state) break;
        V.buildView = { ...V.buildView, slot: null };
        return setState(next);
      }
      const next = placePiece(state, district, piece, cell[0], cell[1], rot);
      if (next === state) break;
      V.buildView = { ...V.buildView, cell: null };
      return setState(next);
    }
    case 'build-turn': return setState(turnPiece(state, V.buildView.district, id));
    case 'build-remove': {
      const b = hallIn(state, V.buildView.district)?.build?.find((x) => x.id === id);
      if (!b || !canRemove(state, V.buildView.district, id).ok || !confirm(`Remove the ${PIECES[b.piece].name.toLowerCase()}? You get ${money(refundOf(b.piece))} back.`)) break;
      V.buildView = { ...V.buildView, picked: null };
      return setState(removePiece(state, V.buildView.district, id));
    }
    case 'buy-hall': { // buying a hall outright (core/halls.js)
      const price = buyPrice(state, id);
      if (price != null && confirm(`Buy the ${cityName(id)} hall for ${money(price)}? No more rent on it, and expanding it adds none.`)) return setState(buyHall(state, id));
      break;
    }
    case 'heist-buy': { // a prep step that went wrong, bought from a fixer (core/heists.js)
      const [hid, step] = id.split('|');
      const c = heistCard(state)?.steps.find((x) => x.id === step);
      if (c?.buy?.ok && confirm(c.fixer ? `${c.fixer.label}: ${money(c.buy.price)}. ${c.fixer.description} It counts as done: ${c.effect}.` : `Pay a fixer ${money(c.buy.price)} for this? It counts as done: ${c.effect}.`)) return setState(buyStep(state, hid, step));
      break;
    }
    case 'move-hall': { const [opId, d] = id.split('|'); return setState(moveToHall(state, opId, d)); }
    case 'open-job': { // also from Today's alerts
      // The plan starts as Joss's read from the board card, so the risk the card showed is the risk here.
      if (!V.plan) remember(action, id); // choosing another job from the list beside a plan swaps the plan, not a new page
      goHome('plan');
      const job = state.jobs.find((j) => j.id === id);
      const r = job ? boardRead(job) : null;
      // The brief in full the first time this session, then two lines (2026-11-05).
      V.briefOpen = !briefSeen.has(id); briefSeen.add(id);
      V.readMemo = null; V.readBefore = null; // a fresh plan: nothing to compare with yet
      V.whyOpen = false; // the bar starts with one line on every job
      V.jossSig = r ? JSON.stringify([r.picks.crew, r.approach, r.picks.overwatch ?? null, r.picks.kit ?? null, r.picks.wheels ?? null]) : null;
      V.plan = { jobId: id, crew: r ? r.picks.crew : [], approach: r ? r.approach : 'stealth', orders: 'steady', callIn: 'risky', mode: 'away',
        overwatch: r?.picks.overwatch ?? null, kit: r?.picks.kit ?? null, wheels: r?.picks.wheels ?? null, standby: r?.picks.standby ?? null };
      break;
    }
    case 'toggle-runners': V.runnersHidden = !V.runnersHidden; break;
    case 'toggle-meet': V.meetHidden = !V.meetHidden; break;
    case 'client-info': V.clientOpen = !V.clientOpen; break;
    case 'plan-why': V.whyOpen = !V.whyOpen; break;
    case 'brief-more': V.briefOpen = !V.briefOpen; break;
    case 'toggle-orders': V.ordersOpen = !V.ordersOpen; break;
    // A contact's direct buzz for a heist (playtest, 2026-11-07): pick up, then in or later. Both mark it read.
    case 'buzz-pickup': V.buzzStage = 'open'; break;
    case 'buzz-later': buzzLater.add(id); V.buzzStage = null; break;
    case 'buzz-in': case 'buzz-think': {
      const msg = state.inbox.find((m) => m.id === id);
      if (msg) msg.read = true;
      V.buzzStage = null;
      nav.clear(); if (action === 'buzz-in') { V.screen = 'jobs'; V.plan = null; V.sidePlan = null; } else { V.screen = 'inbox'; V.openMessageId = id; }
      saveGame(state);
      break;
    }
    case 'inbox-filter': V.inboxUnread = id === 'unread'; break;
    case 'joss-fold': V.jossFoldedDay = V.jossFoldedDay === state.day ? null : state.day; break;
    case 'next-up': V.upcomingDue = true; break;
    case 'board-rules': V.boardRulesOpen = !V.boardRulesOpen; break;
    // The squad board (ui/board.js): tap a card, pick who goes there; anyone already placed swaps.
    case 'info': if (openInfo.has(id)) openInfo.delete(id); else openInfo.add(id); break;
    case 'pick-slot': V.pickSlot = id; break;
    case 'pick-sort': V.pickSort = id; break;
    case 'close-picker': V.focusNext = { action: 'pick-slot', id: V.pickSlot }; V.pickSlot = null; break;
    case 'assign': Object.assign(V.plan, assignSlot(V.plan, V.pickSlot, id || null)); V.focusNext = { action: 'pick-slot', id: V.pickSlot }; V.pickSlot = null; break;
    // A card's × on the squad board: that slot left empty, without opening the picker.
    case 'unassign': Object.assign(V.plan, assignSlot(V.plan, id, null)); V.focusNext = { action: 'pick-slot', id }; break;
    case 'joss': {
      // The smallest squad that gets the best risk for this approach (core/squad.js leanPicks); standby is the player's call.
      const p = leanPicks(state, state.jobs.find((j) => j.id === V.plan.jobId), V.plan.approach);
      Object.assign(V.plan, { crew: p.crew, overwatch: p.overwatch, wheels: p.wheels, standby: p.standby }); if (p.kit) V.plan.kit = p.kit;
      V.jossSig = JSON.stringify([V.plan.crew, V.plan.approach, V.plan.overwatch, V.plan.kit, V.plan.wheels]);
      break;
    }
    case 'approach': V.plan.approach = id; break;
    case 'plan-try': {
      // One of the plan bar's "Try" changes (2026-11-05), as planTries read it.
      const tr = V.planTryList[Number(id)];
      if (!tr) break;
      if (tr.kind === 'approach') V.plan.approach = tr.approach;
      else if (tr.kind === 'swap') V.plan.crew = V.plan.crew.map((x) => (x === tr.out.id ? tr.op.id : x));
      else if (tr.kind === 'add') V.plan.crew = [...V.plan.crew, tr.op.id];
      else if (tr.kind === 'overwatch') { V.plan.overwatch = tr.op.id; V.plan.kit = tr.kit; }
      else if (tr.kind === 'wheels') V.plan.wheels = tr.op.id;
      else if (tr.kind === 'joss') { Object.assign(V.plan, { crew: tr.picks.crew, overwatch: tr.picks.overwatch, wheels: tr.picks.wheels }); if (tr.picks.kit) V.plan.kit = tr.picks.kit; }
      if (V.plan.standby && [...V.plan.crew, V.plan.overwatch, V.plan.wheels].includes(V.plan.standby)) V.plan.standby = null;
      V.whyOpen = false; // back to one line: the new reason, and what moved on the rows
      break;
    }
    case 'orders': V.plan.orders = id; break;
    case 'callin': V.plan.callIn = id; break;
    case 'mode': V.plan.mode = id; break; // send them away, or watch live (DESIGN.md 2026-11-04)
    case 'kit': V.plan.kit = id; break;
    case 'open-side': if (!V.sidePlan) remember(action, id); goHome('sidePlan'); V.sidePlan = { taskId: id, crew: [] }; break;
    case 'toggle-side-crew': {
      const task = sideTaskById(V.sidePlan.taskId);
      if (V.sidePlan.crew.includes(id)) V.sidePlan.crew = V.sidePlan.crew.filter((x) => x !== id);
      else if (V.sidePlan.crew.length < task.crew) V.sidePlan.crew = [...V.sidePlan.crew, id];
      else V.sidePlan.crew = [...V.sidePlan.crew.slice(1), id]; // full: swap the first pick out
      break;
    }
    case 'send-side': {
      const next = sendOnSideTask(state, V.sidePlan.taskId, V.sidePlan.crew);
      V.sidePlan = null;
      nav.clear();
      V.screen = 'city'; V.cityTab = 'map'; V.cityDistrict = null;
      return setState(next);
    }
    case 'send-job': {
      // Hands-off: the crew leaves now; their report comes back when they do (core/autorun.js).
      const next = sendOff(state, V.plan.jobId, V.plan.crew, V.plan.approach, V.plan.orders ?? 'steady', planOpts());
      const out = (next.awayJobs ?? []).find((j) => j.mission.jobId === V.plan.jobId);
      if (out) V.sendOffCue = { jobId: V.plan.jobId, name: templateById(out.mission.templateId).name, returnDay: out.returnDay,
        crewIds: [...out.mission.crewIds, out.mission.overwatch?.id, out.mission.wheels, out.mission.standby?.id].filter(Boolean) };
      V.plan = null;
      nav.clear();
      V.screen = 'city'; V.cityTab = 'map'; V.cityDistrict = null;
      V.openMessageId = null;
      return setState(next);
    }
    case 'skip-report': break; // tapping a report as it plays shows the end at once
    case 'start-job': {
      const next = startMission(state, V.plan.jobId, V.plan.crew, V.plan.approach, planOpts());
      V.plan = null;
      return setState(next);
    }
    case 'step': return setState(autoStep(state)); // the next thing the crew does on its own (core/autorun.js)
    case 'watch-pause': return togglePause(state);
    case 'watch-speed': return toggleSpeed(state);
    case 'watch-latest': return showLatest();
    case 'pending': return setState(resolvePending(state, id));
    // Command fights (ui/fightorders.js): pick, target and order are the player's draft; the rest play the round.
    case 'fight-sel': case 'fight-target': case 'fight-clear': case 'fight-order': case 'fight-pull-ask': case 'fight-pull-no': case 'fight-rules': case 'fight-more': case 'fight-log':
      fightTap(state.activeMission, action, { id, kind: t.dataset.kind, target: t.dataset.target });
      break;
    // Engine 2's screen (ui/fightscreen.js): the draft is an order or two and a risk level; Next round plays on them.
    case 'fs-panel': case 'fs-sel': case 'fs-order': case 'fs-clear': case 'fs-risk': case 'fs-pull-ask': case 'fs-pull-no':
      fightScreenTap(state.activeMission, action, { id, duty: t.dataset.duty, target: t.dataset.target });
      break;
    // The live battle view's pace (ui/fightscreen.js fightPace): Fast or Watch, a viewing preference; Resolve is fs-handoff.
    case 'fs-pace': setPref('fight-watch', id === 'watch'); render(); return paceChanged(state);
    case 'fs-next': return setState(runBattle(state, takeFightChange(state.activeMission)));
    case 'fs-handoff': return setState(runBattle(handOffFight(state), takeFightChange(state.activeMission)));
    case 'fs-pull': takeFightChange(state.activeMission); return setState(pullBack(state));
    case 'fight-go': return setState(runBattle(state, takeOrders()));
    case 'fight-auto': takeOrders(); return setState(runBattle(state, {}));
    case 'fight-hand-off': takeOrders(); return setState(runBattle(handOffFight(state), {}));
    case 'fight-pull': takeOrders(); return setState(pullBack(state));
    case 'choose': return setState(chooseOption(state, id));
    case 'critical': return setState(resolveCritical(state, id));
    case 'close-mission': nav.clear(); V.screen = 'inbox'; return setState(closeMission(state));
    case 'finale-close': closeFinale(); return;
    // Away crews calling in (core/away.js): take the call, then hand it back or take command.
    case 'take-call': V.openMessageId = null; return setState(takeCall(state, id));
    // A warned raid's plan, set from its card or the one-off fixer call (the call is still made at the door).
    case 'raid-post': { const [rid, slot] = id.split('|'); return setState(cycleRaidPost(state, rid, slot)); }
    case 'raid-plan': { const [rid, plan] = id.split('|'); return setState(setRaidPlan(state, rid, plan)); }
    case 'raid-call': { // the fixer call's buttons: id = "raidId|hold" | "raidId|clear" | "|later"
      const [rid, plan] = id.split('|');
      return setState(markRaidCallSeen(plan === 'later' ? state : setRaidPlan(state, rid, plan)));
    }
    // The heat chip and Today's priority line: the raid's card, on City › Map.
    case 'raid-open': remember(action, id); goHome('district'); V.tongsView = null; V.cityDistrict = id; V.raidCardDue = id; break;
    case 'raid-pay': return setState(payOffRaid(state, id)); // pay the police off before the day (core/raids.js)
    // A raid at the door, answered from Ops: its call is a message on Today.
    case 'raid-answer': { remember(action, id); V.screen = homeOf('message'); V.openMessageId = id; const m = state.inbox.find((x) => x.id === id); if (m && !m.read) { m.read = true; saveGame(state); } break; }
    case 'let-run': nav.clear(); V.screen = 'city'; V.cityTab = 'map'; V.cityDistrict = null; return setState(letThemRun(state));
    case 'take-command': return setState(takeCommand(state));
    case 'sendoff-close': t.remove(); return;
    case 'export':
      state.lastBackupDay = state.day;
      saveGame(state);
      exportSave(state);
      break;
    case 'import':
      if (confirm(`Load a save file into slot ${getActiveSlot()}? The game in this slot will be replaced.`)) { V.importInput.value = ''; V.importInput.click(); } // cleared, so the same file can be picked again
      break;
    case 'slot-load': {
      const n = Number(id);
      const loaded = loadGame(n);
      if (!loaded) {
        const kept = unreadableSave(n);
        alert(`Slot ${n} could not be opened.${kept?.newer ? ' It was saved by a newer version of the game: reload the page to update.' : ''} It's kept safe on this screen.`);
        break;
      }
      setActiveSlot(n);
      nav.clear(); V.screen = 'inbox'; V.plan = null; V.openMessageId = null; V.openOperativeId = null; V.openRecruitId = null;
      return setState(loaded);
    }
    case 'slot-new': V.newGameSlot = Number(id); break;
    case 'cancel-new': V.newGameSlot = null; break;
    case 'difficulty': {
      // Every new game starts with the founder pick: three of six generated rookies (DESIGN.md, 2026-10-28).
      const slot = V.newGameSlot;
      const difficulty = id;
      const taken = !listSlots()[slot - 1].empty;
      if (taken && !confirm(`Start a new ${difficulty} game in slot ${slot}? The game in that slot will be deleted.`)) break;
      deleteSlot(slot);
      setActiveSlot(slot);
      V.newGameSlot = null;
      nav.clear(); V.screen = 'inbox'; V.plan = null; V.openMessageId = null; V.openOperativeId = null; V.openRecruitId = null;
      V.founderPick = [];
      return setState(createNewGame({ difficulty, startCrew: 'pick' }));
    }
    case 'slot-delete':
      if (confirm(`Delete the game in slot ${id}? This can't be undone.`)) deleteSlot(Number(id));
      break;
    // A save that couldn't be opened, kept aside by save.js (DESIGN.md, 2026-10-30).
    case 'kept-restore': {
      const n = Number(id);
      if (!confirm(`Restore the kept game into slot ${n}? Whatever is in slot ${n} now will be replaced.`)) break;
      try {
        const restored = restoreUnreadable(n);
        setActiveSlot(n);
        nav.clear(); V.screen = 'inbox'; V.plan = null; V.openMessageId = null; V.openOperativeId = null; V.openRecruitId = null;
        return setState(restored);
      } catch (err) { alert(`Could not restore it yet: ${err.message}`); }
      break;
    }
    case 'kept-export': exportUnreadable(Number(id)); break;
    case 'kept-discard':
      if (confirm(`Throw away the kept game from slot ${id}? Download it first if you might want it. This can't be undone.`)) discardUnreadable(Number(id));
      break;
    case 'restore-backup': {
      const backup = loadBackup();
      if (backup && confirm(`Go back to the automatic backup from day ${backup.day}? Everything since then will be lost.`)) {
        nav.clear(); V.screen = 'inbox';
        return setState(backup);
      }
      break;
    }
  }
  render();
}

/** The planning screen's squad options for startMission / sendOff. */
const planOpts = () => ({ overwatch: V.plan.overwatch ? { id: V.plan.overwatch, kit: planKit(V.plan, state.crew.find((o) => o.id === V.plan.overwatch)) } : null, wheels: V.plan.wheels ?? null, standby: V.plan.standby ?? null, callIn: V.plan.callIn ?? 'risky', orders: V.plan.orders ?? 'steady' });

export function onImportFile() {
  if (!V.importInput.files[0]) return;
  importSave(V.importInput.files[0])
    .then((loaded) => { nav.clear(); V.screen = 'inbox'; V.plan = null; setState(loaded); })
    .catch((err) => alert(`Could not load that file: ${err.message}`));
}
