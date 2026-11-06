// UI layer: the only code that touches the DOM. Reads state, calls core
// functions, re-renders. Tap/click only; nothing depends on hover.

import { heatIn, hottest, HEAT_DISTRICTS } from '../core/heat.js';
import { buyPrice, buyHall, openingFor, bedsOf, hallIn, residents, freeBeds, canOpenHall, openHall, nextHallExpansion, expandHall, canMove, moveToHall } from '../core/halls.js';
import { GANGS, GRUDGE, grudgeOf, jobGrudge, grudgeWord, gangsOn } from '../core/gangs.js';
import { defenceCut, openRaids, raidOn, raidPrice, canBuyOff, defenders, raidChoices, payOffRaid, hallShut, raidWho, raidBy, isGangRaid } from '../core/raids.js';
import { HALL_SITES, HOME_HALL } from '../data/halls.js';
import { billDue, mondayBrief, crewStandard, crewAgainstStandard } from '../core/week.js';
import { crewLead } from '../core/lead.js';
import { rankOf } from '../core/tong.js';
import { TONG_EXPLAINER } from '../data/tong.js';
import { NAMES } from '../config/names.js';
import { DISTRICTS, SAFEHOUSE_DISTRICT } from '../data/districts.js';
import { DISTRICT_CARDS, FACTIONS, STREET_FACTS, HISTORY } from '../data/city.js';
import { MISSIONS } from '../data/missions.js';
import { TRAITS } from '../data/traits.js';
import { PARTNER } from '../data/partner.js';
import { jossIcon, portrait } from './art.js';
import { statIcon, statGlyph, crewIcons, traitGlyph } from './icons.js';
import { cityMapSvg, cityMapLegend, MAP_DISTRICTS } from './citymap.js';
import { districtArt } from './districtArt.js';
import { landmark } from './landmarks.js';
import { renderHallBuild, hallBuildLine } from './hallbuild.js';
import { crewOutMap } from './minimap.js';
import { siteFor } from './siteplan.js';
import { placePiece, removePiece, turnPiece, pieceAt, refundOf, canRemove } from '../core/hallbuild.js';
import { PIECES } from '../data/hallBuild.js';

import { advanceDay, calendar, formatShortDate, isBlocked, seasonStartDay } from '../core/time.js';
import { createNewGame, chooseFounders } from '../core/state.js';
import { marksText } from '../core/marks.js';
import { recordOf } from '../core/record.js';
import { fameOf, fameName, standingOf, standingWord, pathOf, legendProgress } from '../core/fame.js';
import { FAME_RULES, NAMED_OFFER, NAMED_TEXT } from '../data/fame.js';
import { templateById, jobView, nextUnlock, JOB_GATES } from '../core/jobs.js';
import { trustLabel, trustOf } from '../core/clients.js';
import { CLIENTS } from '../data/clients.js';
import { availability, APPROACHES, traitMods, ratedStat, maxCrew, crewSizeRead } from '../core/crew.js';
import { rollTarget, successChance, riskLabel } from '../core/risk.js';
import { resolveDecision } from '../core/decisions.js';
import { WATCHED_PENALTY, HEAT_NOTICE_AT, HEAT_MAX, heatChoices } from '../core/heat.js';
import { activeRumour } from '../core/rumours.js';
import { alerts, upcoming } from '../core/upcoming.js';
import { money } from '../core/money.js';
import {
  startMission, chooseOption, resolveCritical, closeMission,
  describeCrisis, describeCritical, currentStep, fillBrief, describePending, resolvePending, CALL_IN,
  runBattle, handOffFight, pullBack,
} from '../core/mission.js';
import { renderFightOrders, fightTap, takeOrders } from './fightorders.js';
import { sendOff, ORDERS, handsOffAllowed, autoStep, needsPlayer } from '../core/autorun.js';
import { takeCall, letThemRun, takeCommand, crewsOut, dayDone } from '../core/away.js';
import { OVERWATCH_KIT, ALERT_MAX } from '../core/incidents.js';
import { leanPicks, jobRead, planRead, planTries } from '../core/squad.js';
import { renderBoard, renderPicker, renderCoverage, assignSlot, planKit } from './board.js';
import { armouryCard, renderArmoury, renderLoadout, renderGearSheet } from './gear.js';
import { buyGear, buyOffer, sellGear, equip, unequip, itemName, sellPrice } from '../core/gear.js';
import { renderWatch, mountWatch, syncWatch, isWatching, stopWatch, togglePause, toggleSpeed, showLatest } from './watch.js';
import { EARNED_TRAITS } from '../data/earnedTraits.js';
import { earnedText } from '../core/earned.js';
import { SPECIALISATIONS, specOf } from '../core/specialisations.js';
import { sideTaskById, sideTasksOut, sideOdds, sendOnSideTask, sideReward, sideCost, sidePitch, intelFor, SIDE_TRUST } from '../core/sidetasks.js';
import {
  saveGame, loadGame, exportSave, importSave, listSlots, getActiveSlot, setActiveSlot,
  deleteSlot, loadBackup, backupDue, SLOT_COUNT, unreadableSave, restoreUnreadable, exportUnreadable, discardUnreadable,
} from '../save/save.js';
import { hire, haggle, passRecruit, canHire, signingFee, nextExpansion, expandSafehouse, STARTING_ROSTER_CAP, FOUNDERS_TO_PICK } from '../core/recruits.js';
import { potentialRead, potentialTag, primaryStat, scoutFor, ageRate, declineChance, mentoring, changesSince, progressShare, STATS } from '../core/development.js';
import { GROWTH_LINES, GRADUATION_LINES } from '../data/growthLines.js';
import { freelancerAsCrew, shareOf, MAX_FREELANCERS_PER_JOB } from '../core/freelance.js';

let state;
let screen = 'inbox';
let cityDistrict = null; // district card open on the Ops map
let cityTab = 'districts'; // which Lore section is showing (LORE_TABS)
let loreDistrict = null; // the district read in full on Lore › Districts
let cityCardDue = false; // scroll a newly opened district card into view after drawing
let loreDue = false; // scroll Lore › Districts to the district opened from Ops
let cityMapDue = false; // scroll the map into view after drawing (a crew's district picked in the list)
let openMessageId = null;
let sidePlan = null; // { taskId, crew: [] } while planning a side task (Jobs tab)
let playReportId = null; // a hands-off report playing out on its first open (renderReportTimeline)
let openOperativeId = null;
let openRecruitId = null;
let openArmoury = false; // the armoury, from the Crew screen (ui/gear.js)
let buildView = null; // the hall build screen, from Crew › Halls (ui/hallbuild.js): { district, cell, piece, rot, picked }
let gearSlot = null; // the loadout slot being filled on a runner's page
let newGameSlot = null; // slot number while picking a difficulty
let plan = null; // { jobId, crew: [...ids], approach, orders, callIn, overwatch: id|null, kit, wheels: id|null, standby: id|null } (core/mission.js startMission)
let pickSlot = null;
const openInfo = new Set(); // which (i) explanations are open (infoButton) // the squad-board slot being filled ('in:<n>' or 'over'), while its picker is open
let root;
// Continue rests briefly after each new day, so a double click can't skip one.
const CONTINUE_REST_MS = 800;
let continueRestUntil = 0;
let dayCue = null; // what the day that just started brought; shown once, on the next render
let sendOffCue = null; // the crew that just left (the send-off card); shown once, on the next render
const backPlayed = new Set(); // back cards whose faces have already slid home: they play once, not on every redraw
let importInput = null; // the hidden save-file picker (see mountApp)
let focusNext = null; // { action, id }: the control to focus after the next render (going back to a list)
let traitTip = null; // 'pageId|key': the trait chip or synergy whose card is open (one at a time)
let returnTo = null; // { screen, messageId }: where a runner's page opened from a name link goes back to
let founderPick = []; // candidate ids picked so far on a new game's first screen (renderFounding)
let runnersHidden = false; // the job board's runners panel, folded away for this session
let clientOpen = false; // the plan's client background, shown on tap (owner, 2026-11-04: the same on every job they offer)
let planTryList = []; // the plan bar's "Try" changes as last drawn (core/squad.js planTries), applied by index
let ordersOpen = false; // the plan's How / Call me in / When they decide, folded to one line until tapped (2026-11-05)
let boardRulesOpen = false; // the squad board's rules line, behind an i
const briefSeen = new Set(); // jobs whose brief has been shown in full once this session (2026-11-05)
let briefOpen = true; // the open job's brief in full, or two lines and "Read more"
let readMemo = null; // the plan read as last drawn: { jobId, sig, rows: Map(row key → effective risk), level }
let readBefore = null; // the read before the last change to the plan, for "was low" (2026-11-05)
let readFresh = false; // this draw is the first since the plan changed: flash what moved
let jossSig = null; // the plan as Joss picked it (on opening a job, or Joss's picks); their reason shows while it's unchanged
let whyOpen = false; // the plan bar's notes, all of them, on tap
let planBarHtml = ''; // the plan bar as renderPlan last drew it; the jobs screen places it (under the list on wide screens)
let meetHidden = null; // the plan's "What they'll likely meet" read folded away; null until first shown (folded on phones)

export function mountApp(el, initialState) {
  root = el;
  state = initialState;
  root.addEventListener('click', onClick);
  // Map districts are SVG groups, not buttons: let Enter and Space open them too.
  root.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('g[data-action]')) { e.preventDefault(); onClick(e); }
    if (e.key === 'Escape' && pickSlot) { focusNext = { action: 'pick-slot', id: pickSlot }; pickSlot = null; render(); }
  });
  // The save-file picker lives outside root: render() replaces everything inside root, and the
  // Load button's own click re-renders, so a picker inside would be swapped out mid-pick and its
  // file never arrive (owner's report, 2026-10-30: "nothing happens").
  importInput = Object.assign(document.createElement('input'), { type: 'file', id: 'import-file', accept: 'application/json,.json', hidden: true });
  importInput.addEventListener('change', onImportFile);
  root.after(importInput);
  render();
}

function setState(next) {
  state = next;
  saveGame(state);
  render();
}

// --- events ------------------------------------------------------------
function onClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t || t.disabled) return;
  const { action, id } = t.dataset;

  switch (action) {
    case 'nav': if (state.founding && !FOUNDING_TABS.includes(id)) return; screen = id; returnTo = null; buildView = null; openMessageId = null; openOperativeId = null; openRecruitId = null; openArmoury = false; gearSlot = null; plan = null; sidePlan = null; pickSlot = null; break;
    case 'continue': {
      if (isBlocked(state) || Date.now() < continueRestUntil) return;
      const next = advanceDay(state);
      dayCue = dayCueFor(state, next);
      continueRestUntil = Date.now() + CONTINUE_REST_MS;
      setTimeout(wakeContinue, CONTINUE_REST_MS);
      return setState(next);
    }
    case 'city-district': cityDistrict = cityDistrict === id ? null : id; cityCardDue = !!cityDistrict; break;
    // A crew's district in the list: light it on the map (scrolled into view) and narrow the list to it.
    case 'city-show': cityDistrict = cityDistrict === id ? null : id; cityMapDue = !!cityDistrict; break;
    case 'city-tab': cityTab = id; break;
    // Lore › Districts: open one district's full write-up (tap again to fold it); from the Ops card, go there.
    case 'ops-district': screen = 'ops'; cityDistrict = id; cityMapDue = true; break;
    case 'lore-district': loreDistrict = loreDistrict === id ? null : id; break;
    case 'about-district': screen = 'lore'; cityTab = 'districts'; loreDistrict = id; loreDue = true; break;
    case 'open-message': {
      openMessageId = id;
      const msg = state.inbox.find((m) => m.id === id);
      // A hands-off report you haven't read plays out once: you didn't watch that job.
      if (msg?.type === 'report' && !msg.read && msg.timeline?.orders) playReportId = id;
      if (msg && !msg.read) { msg.read = true; saveGame(state); }
      break;
    }
    case 'back':
      // A runner's page opened from a name in a message goes back to that message.
      if (returnTo && openOperativeId) {
        focusNext = { action: 'op-link', id: openOperativeId };
        ({ screen } = returnTo); openMessageId = returnTo.messageId; openOperativeId = null; gearSlot = null; returnTo = null;
        break;
      }
      // Land keyboard focus back on the row that was opened.
      focusNext = openMessageId ? { action: 'open-message', id: openMessageId }
        : openRecruitId ? { action: 'open-recruit', id: openRecruitId }
        : openOperativeId ? { action: 'open-op', id: openOperativeId }
        : openArmoury ? { action: 'open-armoury' }
        : buildView ? { action: 'build-hall', id: buildView.district }
        : plan ? { action: 'open-job', id: plan.jobId }
        : sidePlan ? { action: 'open-side', id: sidePlan.taskId } : null;
      openMessageId = null; openOperativeId = null; openRecruitId = null; openArmoury = false; buildView = null; gearSlot = null; plan = null; sidePlan = null; pickSlot = null;
      break;
    case 'decide': return setState(resolveDecision(state, id, t.dataset.option));
    case 'open-op': screen = 'crew'; openArmoury = false; openOperativeId = id; returnTo = null; break;
    // A crew member's name in a message: open their page, remembering the message to come back to.
    case 'trait-tip': traitTip = traitTip === id ? null : id; break;
    case 'op-link': returnTo = { screen, messageId: openMessageId }; screen = 'crew'; openArmoury = false; openRecruitId = null; openOperativeId = id; break;
    // Gear (ui/gear.js, core/gear.js): the armoury, and a runner's slots.
    case 'open-armoury': screen = 'crew'; openArmoury = true; openOperativeId = null; gearSlot = null; break;
    case 'buy': return setState(buyGear(state, id, t.dataset.tier || 'street'));
    case 'buy-offer': return setState(buyOffer(state, id));
    case 'sell': {
      const item = (state.stash ?? []).find((i) => i.uid === id);
      if (item && confirm(`Sell the ${item.name ?? itemName(item).toLowerCase()} for ${money(sellPrice(item))}?`)) return setState(sellGear(state, id));
      break;
    }
    case 'gear-slot': gearSlot = id; break;
    case 'close-gear': focusNext = { action: 'gear-slot', id: gearSlot }; gearSlot = null; break;
    case 'equip': focusNext = { action: 'gear-slot', id: gearSlot }; gearSlot = null; return setState(equip(state, id, openOperativeId));
    case 'unequip': focusNext = { action: 'gear-slot', id: gearSlot }; gearSlot = null; return setState(unequip(state, openOperativeId, id));
    case 'open-recruit': openRecruitId = id; break;
    case 'founder-toggle':
      if (founderPick.includes(id)) founderPick = founderPick.filter((x) => x !== id);
      else if (founderPick.length < FOUNDERS_TO_PICK) founderPick = [...founderPick, id];
      focusNext = { action, id };
      break;
    case 'found-crew': {
      const next = chooseFounders(state, founderPick);
      if (next === state) return;
      founderPick = []; screen = 'inbox';
      return setState(next);
    }
    case 'hire': openRecruitId = null; return setState(hire(state, id));
    case 'haggle': return setState(haggle(state, id));
    case 'pass': openRecruitId = null; return setState(passRecruit(state, id));
    case 'expand-hall': { // halls (core/halls.js)
      const x = nextHallExpansion(state, id);
      if (x && confirm(`Expand the ${cityName(id)} hall for ${money(x.cost)}? +${x.beds} beds; its rent goes up by ${money(x.rentIncrease)} a week.`)) return setState(expandHall(state, id));
      break;
    }
    case 'open-hall': {
      const site = HALL_SITES[id];
      if (confirm(`Open a hall in ${cityName(id)}: ${site.place}? ${money(site.deposit)} down, ${site.beds} beds, ${money(site.rent)} a week.`)) return setState(openHall(state, id));
      break;
    }
    // Building up a hall (ui/hallbuild.js, core/hallbuild.js).
    case 'build-hall': screen = 'crew'; openOperativeId = null; openArmoury = false; buildView = { district: id, cell: null, piece: null, rot: 0, picked: null, tab: 'defence' }; window.scrollTo?.(0, 0); break;
    case 'build-cell': {
      const [x, y] = id.split(',').map(Number);
      const on = pieceAt(hallIn(state, buildView.district), x, y);
      buildView = on ? { ...buildView, cell: null, picked: on.id } : { ...buildView, cell: [x, y], picked: null };
      break;
    }
    case 'build-piece': buildView = { ...buildView, piece: id, picked: null, rot: 0 }; break;
    case 'build-tab': buildView = { ...buildView, tab: id, piece: null }; break;
    case 'build-rot': buildView = { ...buildView, rot: buildView.rot ? 0 : 1 }; break;
    case 'build-place': {
      const { district, piece, cell, rot } = buildView;
      const next = placePiece(state, district, piece, cell[0], cell[1], rot);
      if (next === state) break;
      buildView = { ...buildView, cell: null };
      return setState(next);
    }
    case 'build-turn': return setState(turnPiece(state, buildView.district, id));
    case 'build-remove': {
      const b = hallIn(state, buildView.district)?.build?.find((x) => x.id === id);
      if (!b || !canRemove(state, buildView.district, id).ok || !confirm(`Remove the ${PIECES[b.piece].name.toLowerCase()}? You get ${money(refundOf(b.piece))} back.`)) break;
      buildView = { ...buildView, picked: null };
      return setState(removePiece(state, buildView.district, id));
    }
    case 'buy-hall': { // buying a hall outright (core/halls.js)
      const price = buyPrice(state, id);
      if (price != null && confirm(`Buy the ${cityName(id)} hall for ${money(price)}? No more rent on it, and expanding it adds none.`)) return setState(buyHall(state, id));
      break;
    }
    case 'move-hall': { const [opId, d] = id.split('|'); return setState(moveToHall(state, opId, d)); }
    case 'open-job': { // also from Today's alerts
      // The plan starts as Joss's read from the board card, so the risk the card showed is the risk here.
      screen = 'jobs';
      const job = state.jobs.find((j) => j.id === id);
      const r = job ? boardRead(job) : null;
      // The brief in full the first time this session, then two lines (2026-11-05).
      briefOpen = !briefSeen.has(id); briefSeen.add(id);
      readMemo = null; readBefore = null; // a fresh plan: nothing to compare with yet
      whyOpen = false; // the bar starts with one line on every job
      jossSig = r ? JSON.stringify([r.picks.crew, r.approach, r.picks.overwatch ?? null, r.picks.kit ?? null, r.picks.wheels ?? null]) : null;
      plan = { jobId: id, crew: r ? r.picks.crew : [], approach: r ? r.approach : 'stealth', orders: 'steady', callIn: 'risky', mode: 'away',
        overwatch: r?.picks.overwatch ?? null, kit: r?.picks.kit ?? null, wheels: r?.picks.wheels ?? null, standby: r?.picks.standby ?? null };
      break;
    }
    case 'toggle-runners': runnersHidden = !runnersHidden; break;
    case 'toggle-meet': meetHidden = !meetHidden; break;
    case 'client-info': clientOpen = !clientOpen; break;
    case 'plan-why': whyOpen = !whyOpen; break;
    case 'brief-more': briefOpen = !briefOpen; break;
    case 'toggle-orders': ordersOpen = !ordersOpen; break;
    case 'board-rules': boardRulesOpen = !boardRulesOpen; break;
    // The squad board (ui/board.js): tap a card, pick who goes there; anyone already placed swaps.
    case 'info': if (openInfo.has(id)) openInfo.delete(id); else openInfo.add(id); break;
    case 'pick-slot': pickSlot = id; break;
    case 'close-picker': focusNext = { action: 'pick-slot', id: pickSlot }; pickSlot = null; break;
    case 'assign': Object.assign(plan, assignSlot(plan, pickSlot, id || null)); focusNext = { action: 'pick-slot', id: pickSlot }; pickSlot = null; break;
    case 'joss': {
      // The smallest squad that gets the best risk for this approach (core/squad.js leanPicks); standby is the player's call.
      const p = leanPicks(state, state.jobs.find((j) => j.id === plan.jobId), plan.approach);
      Object.assign(plan, { crew: p.crew, overwatch: p.overwatch, wheels: p.wheels, standby: p.standby }); if (p.kit) plan.kit = p.kit;
      jossSig = JSON.stringify([plan.crew, plan.approach, plan.overwatch, plan.kit, plan.wheels]);
      break;
    }
    case 'approach': plan.approach = id; break;
    case 'plan-try': {
      // One of the plan bar's "Try" changes (2026-11-05), as planTries read it.
      const tr = planTryList[Number(id)];
      if (!tr) break;
      if (tr.kind === 'approach') plan.approach = tr.approach;
      else if (tr.kind === 'swap') plan.crew = plan.crew.map((x) => (x === tr.out.id ? tr.op.id : x));
      else if (tr.kind === 'add') plan.crew = [...plan.crew, tr.op.id];
      else if (tr.kind === 'overwatch') { plan.overwatch = tr.op.id; plan.kit = tr.kit; }
      else if (tr.kind === 'wheels') plan.wheels = tr.op.id;
      else if (tr.kind === 'joss') { Object.assign(plan, { crew: tr.picks.crew, overwatch: tr.picks.overwatch, wheels: tr.picks.wheels }); if (tr.picks.kit) plan.kit = tr.picks.kit; }
      if (plan.standby && [...plan.crew, plan.overwatch, plan.wheels].includes(plan.standby)) plan.standby = null;
      whyOpen = false; // back to one line: the new reason, and what moved on the rows
      break;
    }
    case 'orders': plan.orders = id; break;
    case 'callin': plan.callIn = id; break;
    case 'mode': plan.mode = id; break; // send them away, or watch live (DESIGN.md 2026-11-04)
    case 'kit': plan.kit = id; break;
    case 'open-side': sidePlan = { taskId: id, crew: [] }; break;
    case 'toggle-side-crew': {
      const task = sideTaskById(sidePlan.taskId);
      if (sidePlan.crew.includes(id)) sidePlan.crew = sidePlan.crew.filter((x) => x !== id);
      else if (sidePlan.crew.length < task.crew) sidePlan.crew = [...sidePlan.crew, id];
      else sidePlan.crew = [...sidePlan.crew.slice(1), id]; // full: swap the first pick out
      break;
    }
    case 'send-side': {
      const next = sendOnSideTask(state, sidePlan.taskId, sidePlan.crew);
      sidePlan = null;
      screen = 'ops';
      return setState(next);
    }
    case 'send-job': {
      // Hands-off: the crew leaves now; their report comes back when they do (core/autorun.js).
      const next = sendOff(state, plan.jobId, plan.crew, plan.approach, plan.orders ?? 'steady', planOpts());
      const out = (next.awayJobs ?? []).find((j) => j.mission.jobId === plan.jobId);
      if (out) sendOffCue = { jobId: plan.jobId, name: templateById(out.mission.templateId).name, returnDay: out.returnDay,
        crewIds: [...out.mission.crewIds, out.mission.overwatch?.id, out.mission.wheels, out.mission.standby?.id].filter(Boolean) };
      plan = null;
      screen = 'ops';
      openMessageId = null;
      return setState(next);
    }
    case 'skip-report': break; // tapping a report as it plays shows the end at once
    case 'start-job': {
      const next = startMission(state, plan.jobId, plan.crew, plan.approach, planOpts());
      plan = null;
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
    case 'fight-go': return setState(runBattle(state, takeOrders()));
    case 'fight-auto': takeOrders(); return setState(runBattle(state, {}));
    case 'fight-hand-off': takeOrders(); return setState(runBattle(handOffFight(state), {}));
    case 'fight-pull': takeOrders(); return setState(pullBack(state));
    case 'choose': return setState(chooseOption(state, id));
    case 'critical': return setState(resolveCritical(state, id));
    case 'close-mission': screen = 'inbox'; return setState(closeMission(state));
    // Away crews calling in (core/away.js): take the call, then hand it back or take command.
    case 'take-call': openMessageId = null; return setState(takeCall(state, id));
    case 'raid-pay': return setState(payOffRaid(state, id)); // pay the police off before the day (core/raids.js)
    // A raid at the door, answered from Ops: its call is a message on Today.
    case 'raid-answer': { screen = 'inbox'; openMessageId = id; const m = state.inbox.find((x) => x.id === id); if (m && !m.read) { m.read = true; saveGame(state); } break; }
    case 'let-run': screen = 'ops'; return setState(letThemRun(state));
    case 'take-command': return setState(takeCommand(state));
    case 'sendoff-close': t.remove(); return;
    case 'export':
      state.lastBackupDay = state.day;
      saveGame(state);
      exportSave(state);
      break;
    case 'import':
      if (confirm(`Load a save file into slot ${getActiveSlot()}? The game in this slot will be replaced.`)) { importInput.value = ''; importInput.click(); } // cleared, so the same file can be picked again
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
      screen = 'inbox'; plan = null; openMessageId = null; openOperativeId = null; openRecruitId = null;
      return setState(loaded);
    }
    case 'slot-new': newGameSlot = Number(id); break;
    case 'cancel-new': newGameSlot = null; break;
    case 'difficulty': {
      // Every new game starts with the founder pick: three of six generated rookies (DESIGN.md, 2026-10-28).
      const slot = newGameSlot;
      const difficulty = id;
      const taken = !listSlots()[slot - 1].empty;
      if (taken && !confirm(`Start a new ${difficulty} game in slot ${slot}? The game in that slot will be deleted.`)) break;
      deleteSlot(slot);
      setActiveSlot(slot);
      newGameSlot = null;
      screen = 'inbox'; plan = null; openMessageId = null; openOperativeId = null; openRecruitId = null;
      founderPick = [];
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
        screen = 'inbox'; plan = null; openMessageId = null; openOperativeId = null; openRecruitId = null;
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
        screen = 'inbox';
        return setState(backup);
      }
      break;
    }
  }
  render();
}

/** The planning screen's squad options for startMission / sendOff. */
const planOpts = () => ({ overwatch: plan.overwatch ? { id: plan.overwatch, kit: planKit(plan, state.crew.find((o) => o.id === plan.overwatch)) } : null, wheels: plan.wheels ?? null, standby: plan.standby ?? null, callIn: plan.callIn ?? 'risky', orders: plan.orders ?? 'steady' });

function onImportFile() {
  if (!importInput.files[0]) return;
  importSave(importInput.files[0])
    .then((loaded) => { screen = 'inbox'; plan = null; setState(loaded); })
    .catch((err) => alert(`Could not load that file: ${err.message}`));
}

// --- helpers -----------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const threatDots = (n) => '●'.repeat(n) + '○'.repeat(5 - n);
/** Threat with a marker when this offer is above or below the job's usual level. */
const threatHtml = (v) => `<span class="threat">${threatDots(v.threat)}</span>${v.threatDelta > 0 ? ' <span class="tag-up">hotter than usual</span>' : v.threatDelta < 0 ? ' <span class="tag-down">quieter than usual</span>' : ''}`;
const clientLine = (v) => v.client ? `${esc(v.client.name)} <span class="muted">(${esc(trustLabel(v.trust))})</span>` : '<span class="muted">Walk-in job</span>';
/** The word a risk level shows as: "moderate" reads as "mid" (shorter; owner's call, 2026-10-28). */
const RANK = ['low', 'moderate', 'high', 'extreme'];
const riskWord = (level) => (level === 'moderate' ? 'mid' : level);
const riskBadge = (level) => `<span class="risk risk--${esc(level)}">${esc(level === 'safe' || level === 'certain' ? level : `${riskWord(level)} risk`)}</span>`;
/** Availability as a coloured chip: green ready, amber usable but worse off, red can't go, teal away on a job. */
function statusChip(a) {
  const tone = a.ok ? (a.reason === 'ready' ? 'ready' : 'worn') : a.reason.startsWith('away') ? 'away' : 'out';
  const back = /^away until day (\d+)$/.exec(a.reason);
  const n = back ? Number(back[1]) - state.day : 0;
  // The teal "away" colour already says they're out; the words say when they're back.
  const text = back ? (n <= 1 ? 'back tomorrow' : `back in ${n} days`) : a.reason;
  return `<span class="status status--${tone}">${esc(text)}</span>`;
}
/** Fatigue and morale as two small labelled bars for crew rows. */
const conditionBars = (op) => [['Fatigue', op.condition.fatigue, 'fatigue'], ['Morale', op.condition.morale, 'morale']]
  .map(([label, v, k]) => `<span class="minibar minibar--${k}" role="img" aria-label="${label} ${v}"><span class="minibar__label">${label}</span><span class="minibar__track"><span style="width:${Math.max(0, Math.min(100, v))}%"></span></span></span>`).join('');
/**
 * Key stats for a job, written out ("Medical 8 · Cool 5*"), each coloured by how it
 * measures up to this job's typical roll: green good, amber shaky, red weak.
 */
function keyStatsFor(op, tpl, threat) {
  const target = rollTarget({ ...tpl, threat });
  return tpl.keyStats.map((k) => {
    const v = ratedStat(op, k);
    const fit = { low: 'good', moderate: 'shaky', high: 'weak', extreme: 'weak' }[riskLabel(successChance(v, target))];
    return `<span class="fit fit--${fit} iconword">${statGlyph(k)}${esc(statName(k))} ${v}${traitMods(op)[k] ? '*' : ''}</span>`;
  }).join(' · ');
}
/** How long something on offer lasts: it's still there on its last day. */
const daysLeft = (lastDay) => { const n = lastDay - state.day; return n <= 0 ? 'last day' : n === 1 ? '1 day left' : `${n} days left`; };
/** Heat as a small bar: green while quiet, amber, then red from the level that brings the fixer. */
function heatMeter() {
  const h = state.heat;
  const tone = h >= HEAT_NOTICE_AT ? 'high' : h >= 3 ? 'mid' : 'low';
  const hot = hottest(state); // heat per district: the bar is the hottest (core/heat.js)
  return `<span class="heat heat--${tone}" aria-label="${esc(hot ? `Hottest: ${districtName(hot.district)}, heat ${h} of ${HEAT_MAX}` : `Heat 0 of ${HEAT_MAX}`)}"><span class="heat__track" aria-hidden="true"><span style="width:${(h / HEAT_MAX) * 100}%"></span></span>${h}/${HEAT_MAX}</span>`;
}
const districtName = (key) => NAMES.districts[key] ?? key;
const districtTurf = (key) => DISTRICTS[key]?.turf ? ` · ${esc(DISTRICTS[key].turf)}` : '';

/** Portrait in a cut-corner frame (crew list, profiles, the wall). Fallen faces are greyed. */
const face = (op, size = '') => `<span class="face ${size ? `face--${size}` : ''} ${op.cause ? 'is-fallen' : ''}">${portrait(op, { size: { sm: 32, lg: 104 }[size] ?? 48 })}</span>`;

const signed = (n) => `${n > 0 ? '+' : '−'}${Math.abs(n)}`;
const statName = (k) => k[0].toUpperCase() + k.slice(1);
/** This season's net change per stat (rises and age decline), from the growth log. */
const seasonChanges = (op) => changesSince(op, seasonStartDay(state.day));

/** Crew-list one-liner: their best (main) stat and the scout's read of where they're heading. */
function scoutLine(op) {
  const main = primaryStat(op);
  return `<span class="scoutline"><span class="iconword">${statGlyph(main)}${esc(statName(main))} ${ratedStat(op, main)}</span><span>· ${esc(potentialTag(op))}</span></span>`;
}

/** Crew-list marker: "▲ Tech +2, Combat +1 ▼ Driving −1" for this season. */
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

// --- rendering ---------------------------------------------------------
function render() {
  // A running job's watch screen updates in place, so its animations and timer carry on (ui/watch.js).
  const am = state.activeMission;
  if (am && isWatching(root, am)) return syncWatch(state);
  stopWatch();
  // Every render replaces the page, so put keyboard focus back on the same control if it survives.
  const focused = document.activeElement?.closest?.('[data-action]');
  const refocus = focused && root.contains(focused) ? { action: focused.dataset.action, id: focused.dataset.id } : null;
  const blocked = isBlocked(state);
  const resting = Date.now() < continueRestUntil;
  const unread = state.inbox.filter((m) => !m.read).length;
  const cue = dayCue;
  dayCue = null;
  const leaving = sendOffCue;
  sendOffCue = null;
  // Desktop pages use the full width; a job keeps its map and feed side by side to the end, its
  // summary in the feed (no tabs during a job: see is-onjob).
  const wide = true;
  // While a job is being planned its own Start button is the way on, so Continue steps aside
  // everywhere (owner, 2026-10-28: on desktop the top-bar Continue was easy to hit by mistake).
  const planning = !state.activeMission && screen === 'jobs' && !!(plan || sidePlan);
  // Phones: Continue sits above the tab bar, except while planning and during a job (nothing to continue).
  const dock = !state.activeMission && !planning && !state.founding; // the founder pick has its own bar

  // During a job the tabs can't take you anywhere, so they step aside and the job gets the room
  // (owner, 2026-11-03). They come back with "Back to the safehouse".
  root.classList.toggle('is-onjob', !!state.activeMission);
  root.innerHTML = `
    <header class="topbar ${cue ? 'is-new-day' : ''}">
      ${renderWhen()}
      <div class="topbar__stats">
        <span class="stat stat--cash"><span class="stat__label">Cash</span> ${money(state.cash)}${cashDelta()}</span>
        <span class="stat"><span class="stat__label">Heat</span> ${heatMeter()}</span>
        <button class="tierbtn" data-action="info" data-id="tong" aria-expanded="${openInfo.has('tong')}" aria-label="What's a tong?"><span class="tier">${esc(rankOf(state).name)}<span class="tier__word"> tong</span></span></button>
      </div>
      ${state.activeMission ? '' : `<button class="savebtn ${screen === 'settings' ? 'is-active' : ''}" data-action="nav" data-id="settings" aria-label="Save and settings" aria-pressed="${screen === 'settings'}"><span aria-hidden="true">☰</span><span class="savebtn__word"> Save</span></button>`}
      ${planning || state.founding ? '' : renderContinue(blocked, resting, unread, 'topbar__continue')}
      ${infoText('tong', TONG_EXPLAINER)}
    </header>

    <nav class="nav" aria-label="Main">
      ${navButton('inbox', 'Today', unread, 'unread')}
      ${navButton('ops', 'Ops', calls(), 'calling')}
      ${navButton('crew', 'Crew')}
      ${navButton('jobs', 'Jobs', state.jobs.length, 'open')}
      ${navButton('lore', 'Lore')}
    </nav>

    <main class="main ${wide ? 'main--wide' : ''} ${!state.activeMission && screen === 'jobs' && plan ? 'main--split' : ''}">${state.activeMission ? renderMission() : `${keptBanner()}${renderScreen()}`}</main>
    ${dock ? `<div class="dock">${renderContinue(blocked, resting, unread, 'dock__continue')}</div>` : ''}
    ${cue ? renderDayCue(cue) : ''}
    ${leaving ? renderSendOff(leaving) : ''}
  `;
  if (am) mountWatch(root.querySelector('.watch'), state, { ui: watchUi, onAuto: () => setState(autoStep(state)) });
  if (pickSlot) (root.querySelector('.sheet .cand.is-on') ?? root.querySelector('.sheet .cand:not([disabled])'))?.focus({ preventScroll: true });
  if (cityMapDue) { cityMapDue = false; root.querySelector('.citymap')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  if (loreDue) { loreDue = false; root.querySelector('.lorecard.is-open')?.scrollIntoView({ block: 'start' }); }
  if (cityCardDue) { cityCardDue = false; root.querySelector('.citycard')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  const want = focusNext ?? refocus;
  focusNext = null;
  if (want) {
    // Continue is drawn twice (top bar and phone dock); take whichever one is showing.
    const shown = (el) => el.getClientRects().length > 0;
    const same = [...root.querySelectorAll(`[data-action="${want.action}"]`)].find((el) => el.dataset.id === want.id && shown(el));
    // The control is gone or hidden (a detail view replaced the list, as on phones):
    // start from that view's back button instead of losing focus to the top of the page.
    const back = same ? null : [...root.querySelectorAll('[data-action="back"]')].find(shown);
    (same ?? back)?.focus({ preventScroll: true });
  }
}

/** Date, a bar that fills across the week, and how long until Sunday's bills. */
function renderWhen() {
  const today = (state.day - 1) % 7; // 0 = Monday, 6 = Sunday (bills)
  const toBills = 6 - today;
  const due = money(billDue(state).total); // always in view: what Sunday will cost (core/week.js)
  const bills = toBills === 0 ? 'bills paid today' : `${due} due Sun`;
  const cells = Array.from({ length: 7 }, (_, i) =>
    `<span class="week__day ${i < today ? 'is-done' : i === today ? 'is-today' : ''} ${i === 6 ? 'is-bills' : ''}"></span>`).join('');
  return `<div class="topbar__when">
      <div class="topbar__date">${esc(formatShortDate(state.day))}</div>
      <div class="week" role="img" aria-label="Day ${today + 1} of 7 this week">${cells}</div>
      <div class="week__note">Day ${state.day} · ${bills}</div>
    </div>`;
}

/** Today's cash change, e.g. "▲¥1,050". Nothing on a day the cash hasn't moved. */
function cashDelta() {
  const d = state.cash - (state.dayStartCash ?? state.cash);
  if (!d) return '';
  return ` <span class="delta ${d < 0 ? 'is-down' : ''}" aria-label="${d < 0 ? 'down' : 'up'} ${money(Math.abs(d))} today">${d < 0 ? '▼' : '▲'}${money(Math.abs(d))}</span>`;
}

/** Continue names the next day and lists what's still waiting; it never asks for a second tap. */
function renderContinue(blocked, resting, unread, where) {
  const label = state.activeMission ? 'On a job' : state.founding ? 'Pick your crew' : blocked ? 'Decision needed'
    : `Continue → ${calendar(state.day + 1).weekday}`;
  const waiting = [
    unread ? `${unread} unread` : '',
    state.jobs.length ? `${state.jobs.length} job${state.jobs.length === 1 ? '' : 's'} open` : '',
  ].filter(Boolean).join(' · ');
  const hint = !blocked && waiting ? `<span class="continue__hint">${esc(waiting)}</span>` : '';
  return `<button class="btn btn--primary continue ${where} ${resting && !blocked ? 'is-resting' : ''}" data-action="continue" ${blocked || resting ? 'disabled' : ''}>
      <span class="continue__label">${esc(label)}</span>${hint}
    </button>`;
}

/** Re-enable Continue once its rest is over, without a full re-render. */
function wakeContinue() {
  if (isBlocked(state) || Date.now() < continueRestUntil) return;
  const btns = [...root.querySelectorAll('.continue')];
  for (const btn of btns) { btn.disabled = false; btn.classList.remove('is-resting'); }
  const shown = btns.find((b) => b.getClientRects().length);
  if (shown && document.activeElement === document.body) shown.focus({ preventScroll: true }); // focus was on it before the rest
}

/** What changed overnight: new messages, new jobs, cash moved by the day's tick. */
function dayCueFor(before, after) {
  const known = new Set(before.inbox.map((m) => m.id));
  const knownJobs = new Set(before.jobs.map((j) => j.id));
  return {
    day: after.day,
    messages: after.inbox.filter((m) => !known.has(m.id)).length,
    jobs: after.jobs.filter((j) => !knownJobs.has(j.id)).length,
    cash: after.cash - before.cash,
  };
}

/** The send-off card (2026-11-04): the crew's faces leave, a stamp says where and until when, Joss says a line. CSS plays it once and it fades; tap to dismiss. */
function renderSendOff(c) {
  const ops = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const line = fillLine(pickLine(PARTNER.sendOff, `${c.jobId}-send`), { job: c.name });
  return `<div class="sendoff" role="status" data-action="sendoff-close">
      <div class="sendoff__faces">${ops.map((op, i) => `<span class="sendoff__face" style="--i:${i}">${face(op)}</span>`).join('')}</div>
      <p class="sendoff__stamp">Out · ${esc(c.name)} · back ${esc(calendar(c.returnDay).weekday)}</p>
      <p class="sendoff__line">${esc(line)}</p>
    </div>`;
}

function renderDayCue(cue) {
  const plural = (n, word) => `${n} new ${word}${n === 1 ? '' : 's'}`;
  const parts = [
    cue.messages ? plural(cue.messages, 'message') : '',
    cue.jobs ? plural(cue.jobs, 'job') : '',
    cue.cash ? `cash ${cue.cash < 0 ? '▼' : '▲'}${money(Math.abs(cue.cash))}` : '',
  ].filter(Boolean);
  return `<div class="daycue" role="status">
      <strong>${esc(calendar(cue.day).weekday)} · Day ${cue.day}</strong>
      <span>${esc(parts.length ? parts.join(' · ') : 'A quiet day.')}</span>
    </div>`;
}

// While the founders are being picked there's nothing to see on Crew, Jobs, Ops or Lore: those tabs are
// off, Today shows the pick, and Save stays open so another slot can still be loaded.
const FOUNDING_TABS = ['inbox', 'settings'];

function navButton(id, label, count = 0, countWord = '') {
  const off = state.founding && !FOUNDING_TABS.includes(id);
  const on = state.founding ? id === (screen === 'settings' ? 'settings' : 'inbox') : screen === id;
  const pill = count && !off ? ` <span class="pill ${id === 'inbox' ? 'pill--new' : ''}" aria-label="${count} ${countWord}">${count}</span>` : '';
  return `<button class="nav__btn ${on ? 'is-active' : ''}" data-action="nav" data-id="${id}" ${off ? 'disabled' : ''}>${esc(label)}${pill}</button>`;
}

function renderScreen() {
  if (state.founding && screen !== 'settings') return renderFounding(); // nothing else until the founders are picked
  if (screen === 'inbox') return renderInbox();
  if (screen === 'crew') return openRecruitId ? renderRecruit() : openOperativeId ? renderOperative() : openArmoury ? renderArmoury(gearUi, state) : buildView && hallIn(state, buildView.district) ? renderHallBuild({ esc, money, cityName }, state, buildView) : renderCrew();
  // Jobs: on wide screens the board stays beside the job being planned (styles.css hides it on phones).
  if (screen === 'jobs' && plan) {
    // The plan, then the job list with the plan bar under it: from 1400px wide the list and the bar
    // stand in the left column beside the plan; narrower, the list hides and the bar stays at the
    // bottom of the plan (2026-11-05). The plan comes first, so on a phone nothing moves.
    const body = renderPlan();
    if (!plan) return body; // the job has gone: renderPlan showed the board
    return `<div class="jobsplit"><div class="jobsplit__plan">${body}</div><div class="jobsplit__side"><div class="jobsplit__list">${renderJobs()}</div>${planBarHtml}</div></div>`;
  }
  if (screen === 'jobs') return sidePlan ? renderSidePlan() : renderJobs();
  if (screen === 'ops') return renderOpsScreen();
  if (screen === 'lore') return renderLore();
  if (screen === 'settings') return renderSettings();
  return '';
}

// --- inbox -------------------------------------------------------------
/** Says a save in this slot was kept aside because it couldn't be opened, on every screen until it's dealt with. */
function keptBanner() {
  const kept = screen === 'settings' ? null : unreadableSave();
  if (!kept) return '';
  return `<div class="banner banner--danger"><span>${kept.newer ? 'Your saved game is from a newer version of the game.' : 'Your saved game couldn\'t be opened.'} It's kept safe.</span>
    <button class="btn" data-action="nav" data-id="settings">See Save</button></div>`;
}

function backupBanner() {
  if (!backupDue(state)) return '';
  return `<div class="banner"><span>${state.lastBackupDay ? `No backup for ${state.day - state.lastBackupDay} days.` : 'You have never backed up this save.'}</span>
    <button class="btn" data-action="export">Export now</button></div>`;
}

/**
 * Today: the week ahead in a slim strip across the top, then alerts (only when something
 * needs you) and the inbox. Phones show that, or one open message without the strip.
 * Wide screens keep the strip and put the open message beside the inbox (styles.css).
 */
function renderInbox() {
  const open = state.inbox.find((m) => m.id === openMessageId);
  const list = state.inbox.length ? `
        <ul class="list">
          ${state.inbox.map((m) => `
            <li>
              <button class="row ${m.read ? 'is-read' : 'is-unread'} ${m === open ? 'is-open' : ''}" data-action="open-message" data-id="${esc(m.id)}">
                ${m.read ? '' : '<span class="dot" aria-label="Unread"></span>'}
                <span class="row__tag tag--${esc(m.type)}">${esc(m.type)}</span>
                <span class="row__main row__main--clip">${esc(m.subject)}${m.body ? `<span class="preview">${esc(m.body)}</span>` : ''}</span>
                <span class="row__meta">Day ${m.day}</span>
              </button>
            </li>`).join('')}
        </ul>` : '<p class="muted">Nothing new. Press Continue.</p>';
  return `
    ${backupBanner()}
    ${renderUpcoming(open ? 'upcoming--strip has-open' : 'upcoming--strip')}
    <div class="inbox ${open ? 'has-open' : ''}">
      <div class="inbox__side">
        <section class="panel inbox__list">
          <h1>Today</h1>
          ${renderBriefing()}
          ${renderWeekBrief()}
          ${renderBack()}
          ${renderOutLine()}
          ${list}
        </section>
      </div>
      <section class="panel inbox__detail">
        ${open ? renderMessage(open) : '<p class="muted inbox__empty">Tap a message to read it here.</p>'}
      </section>
    </div>`;
}

/** Crews back today from jobs sent away (2026-11-04): their faces home again and a stamp, then the report. */
function renderBack() {
  const back = state.inbox.filter((m) => m.type === 'report' && m.day === state.day && m.back?.away);
  if (!back.length) return '';
  const STAMP = { completed: (p) => `✓ ${money(p)}`, aborted: () => '↩ Walked away', setback: (p) => `✗ ${money(p)}`, loss: () => '✕ Someone lost' };
  return `
    <ul class="backs" aria-label="Back today">
      ${back.map((m) => {
        const ops = m.back.crewIds.map((id) => state.crew.find((o) => o.id === id) ?? state.memorial.find((o) => o.id === id)).filter(Boolean);
        const result = m.timeline?.result ?? 'completed';
        const line = pickLine(PARTNER.back[result] ?? PARTNER.back.completed, `${m.id}-back`);
        const seen = backPlayed.has(m.id);
        backPlayed.add(m.id);
        return `
        <li class="back is-${esc(result)} ${seen ? 'is-seen' : ''}">
          <span class="back__faces">${ops.map((op, i) => `<span class="back__face" style="--i:${i}">${face(op, 'sm')}</span>`).join('')}</span>
          <div class="back__text">
            <p class="back__title"><strong>${esc(templateById(m.back.templateId)?.name ?? 'Job')}</strong> <span class="back__stamp">${esc((STAMP[result] ?? STAMP.completed)(m.back.pay))}</span></p>
            <p class="small muted">${esc(line)}</p>
          </div>
          <button class="btn btn--ghost" data-action="open-message" data-id="${esc(m.id)}">Report</button>
        </li>`;
      }).join('')}
    </ul>`;
}

/** Monday's briefing (core/week.js): the numbers that frame the week, in one block. */
function renderWeekBrief() {
  if (!calendar(state.day).isMonday) return '';
  const b = mondayBrief(state);
  const short = b.cash < b.due;
  return `
    <div class="weekbrief" aria-label="This week">
      <p class="weekbrief__title">Week ${calendar(state.day).week}</p>
      <dl class="weekbrief__stats">
        <div><dt>Cash</dt><dd>${money(b.cash)}</dd></div>
        <div class="${short ? 'is-short' : ''}"><dt>Due Sunday</dt><dd>${money(b.due)}</dd></div>
        <div><dt>Free</dt><dd>${b.roster.free}/${b.roster.total}</dd></div>
        <div><dt>Jobs</dt><dd>${b.jobs}</dd></div>
      </dl>
      <p class="small muted">${[b.roster.away && `${b.roster.away} out`, b.roster.hurt && `${b.roster.hurt} hurt`, b.expiring && `${b.expiring} ${b.expiring === 1 ? 'offer ends' : 'offers end'} this week`, short && `${money(b.due - b.cash)} short of Sunday`].filter(Boolean).join(' · ') || 'A clear week.'}</p>
    </div>`;
}

/** Crews waiting on a call from the player. */
const calls = () => (state.awayJobs ?? []).filter((j) => j.waiting).length + raidCalls().length;
/** Raids at the door now, waiting on the player's call (core/raids.js). */
const raidCalls = () => state.inbox.filter((m) => m.kind === 'raid' && !m.resolved);

/** Today's one line about the crews out; they're followed on Ops, the command centre (2026-11-05; its own tab 2026-11-06). */
function renderOutLine() {
  const jobs = crewsOut(state).length + sideTasksOut(state).length;
  // A raid warned or at the door gets a line of its own (raids, 2026-11-05).
  const raids = openRaids(state).map((r) => `<button class="outnow is-raid" data-action="nav" data-id="ops">
      <span class="outnow__light" aria-hidden="true"></span>
      <span>${r.called ? `<strong>${esc(raidWho(r))} at the door: ${esc(hallLabel(r.district))}</strong>` : `<strong>Raid warned:</strong> ${esc(hallLabel(r.district))}, ${esc(raidWhen(r))}${r.answer === 'paid' ? ' · paid off' : ''}`}</span>
      <span class="outnow__go">Ops ›</span>
    </button>`).join('');
  if (!jobs) return raids;
  const n = calls() - raidCalls().length;
  return `${raids}<button class="outnow ${n ? 'is-call' : ''}" data-action="nav" data-id="ops">
      <span class="outnow__light" aria-hidden="true"></span>
      <span>${jobs} ${jobs === 1 ? 'crew' : 'crews'} out${n ? ` · <strong>${n} ${n === 1 ? 'call' : 'calls'} waiting</strong>` : ''}</span>
      <span class="outnow__go">Ops ›</span>
    </button>`;
}

/**
 * A hall's district as its landmark (ui/landmarks.js; 2026-11-05, kept off the map for the halls
 * and the raid screens): about 56px, lit in the gang's light; dim for a hall not yet opened; a red
 * glow behind it while a raid is coming. Decoration: the words beside it say the same.
 */
function hallMark(d, { dim = false, raid = false } = {}) {
  const art = landmark(d, { x: 24, y: 44, size: 48, light: turfHex(d) ?? '#3de8d8' });
  if (!art) return '';
  const glow = raid ? `<radialGradient id="lmk-raid-${d}"><stop offset="0" stop-color="#ff3d5f" stop-opacity="0.55" /><stop offset="1" stop-color="#ff3d5f" stop-opacity="0" /></radialGradient><ellipse cx="24" cy="26" rx="26" ry="20" fill="url(#lmk-raid-${d})" />` : '';
  return `<svg class="lmk ${dim ? 'is-dim' : ''} ${raid ? 'is-raid' : ''}" viewBox="0 0 48 44" width="56" height="51" aria-hidden="true" data-landmark="${esc(d)}">${glow}${art}</svg>`;
}
/** A raid's hall, its landmark beside the words: where, when, who. */
const raidWhere = (r, extra = '') => `<div class="raidwhere">${hallMark(r.district, { raid: r.answer !== 'paid' && !r.done })}<p class="small"><strong>${esc(hallLabel(r.district))}</strong> · ${esc(raidWhen(r))} · ${esc(raidWho(r))}${extra}</p></div>`;

/** "the Docks hall". */
const hallLabel = (d) => `the ${cityName(d).replace(/^The /, '')} hall`;
/** When a warned raid comes: "today", "tomorrow", or the weekday with the days to go. */
function raidWhen(r) {
  const left = r.day - state.day;
  return left <= 0 ? 'today' : left === 1 ? 'tomorrow' : `${calendar(r.day).weekday} (in ${left} days)`;
}

/** A gang's grudge as a segmented gauge and a word: "▮▮▮▮▯▯… 4/10 · angry" (core/gangs.js). */
function grudgeGauge(gang) {
  const n = grudgeOf(state, gang);
  const seg = Array.from({ length: GRUDGE.max }, (_, i) => `<i class="${i < n ? (n >= GRUDGE.raidAt ? 'is-hot' : 'is-on') : ''} ${i === GRUDGE.raidAt - 1 ? 'is-line' : ''}"></i>`).join('');
  return `<span class="grudge"><span class="grudge__bar" aria-hidden="true">${seg}</span><span class="grudge__n">${n}/10</span> <span class="grudge__word ${n >= GRUDGE.raidAt ? 'is-hot' : ''}">${esc(grudgeWord(n))}</span></span>`;
}

/** The command centre's raid items (raids, 2026-11-05): warned, paid off, or at the door now. */
function renderRaids(raids) {
  if (!raids.length) return '';
  return `
    <ul class="crewsout" aria-label="Raids">
      ${raids.map((r) => {
        const home = defenders(state, r.district);
        const call = state.inbox.find((m) => m.kind === 'raid' && !m.resolved && m.payload?.raidId === r.id);
        const price = raidPrice(state, r);
        const buy = canBuyOff(state, r) && !r.answer && !r.called;
        return `
        <li class="crewsout__job is-raid">
          <div class="crewsout__top">
            <span class="crewsout__light" aria-hidden="true"></span>
            <p class="crewsout__head"><strong>${call ? 'At the door' : 'Raid warned'}</strong> <span class="muted small">${esc(hallLabel(r.district))} · ${esc(raidWhen(r))}${isGangRaid(r) ? ` · ${esc(raidBy(r))}` : ''}</span></p>
            <span class="crewsout__faces">${home.map((op) => face(op, 'sm')).join('')}</span>
          </div>
          <div class="raidwhere">${hallMark(r.district, { raid: r.answer !== 'paid' })}<p class="small">${r.answer === 'paid' ? `${isGangRaid(r) ? 'Settled' : 'Paid off'} (${money(r.paid)}). Nobody will come.`
            : `${home.length ? `Home: ${esc(andList(home.map((o) => o.handle)))}.` : 'Nobody of ours is home to hold it.'} ${call ? 'They need your call now.' : `Hold it with whoever is home that day, or walk out the back. ${isGangRaid(r) ? `${esc(raidWho(r))} would take a settlement.` : canBuyOff(state, r) ? `${esc(raidWho(r))} are on the take.` : `${esc(raidWho(r))} can\'t be bought.`}`}`}</p></div>
          <div class="crewsout__foot">
            ${call ? `<button class="btn btn--primary" data-action="raid-answer" data-id="${esc(call.id)}">Answer the door</button>` : ''}
            ${buy ? `<button class="btn" data-action="raid-pay" data-id="${esc(r.id)}" ${state.cash < price ? 'disabled' : ''}>${isGangRaid(r) ? 'Settle' : 'Pay them off'} · ${money(price)}</button>` : ''}
            ${!call && r.answer !== 'paid' ? '<button class="linkbtn" data-action="nav" data-id="crew">Who lives there: Halls ›</button>' : ''}
            ${whereButton(r.district)}
          </div>
        </li>`;
      }).join('')}
    </ul>`;
}

/** Crews out on jobs: where each is, what they did today, and a call waiting (core/away.js). */
function renderCrewsOut(out = crewsOut(state)) {
  if (!out.length) return '';
  const STATUS = { call: 'Calling you', hurt: 'Someone hurt', low: 'Lying low', on: 'On track' };
  return `
    <ul class="crewsout" aria-label="Crews out">
      ${out.map((c) => {
        const ops = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
        const fill = Math.round((c.beatsDone / Math.max(1, c.beats)) * 100);
        return `
        <li class="crewsout__job is-${c.status}">
          <div class="crewsout__top">
            <span class="crewsout__light" aria-hidden="true"></span>
            <p class="crewsout__head"><strong>${esc(c.name)}</strong> <span class="muted small">${c.day ? `day ${c.day} of ${c.days}` : 'leaving'} · back ${esc(calendar(c.returnDay).weekday)}</span></p>
            <span class="crewsout__faces">${ops.map((op) => face(op, 'sm')).join('')}</span>
          </div>
          <div class="crewsout__track" role="img" aria-label="${esc(`${c.phase}: ${c.beatsDone} of ${c.beats} story beats, day ${c.day} of ${c.days}`)}" style="--fill:${fill}%; --days:${c.days}">
            <span class="crewsout__fill"></span>
          </div>
          <div class="crewsout__body">
            <div class="crewsout__map">${crewOutMap({ site: siteFor(c.district, c.jobId, c.templateId), zone: c.zone, crew: c.inside, overwatch: c.overwatch, wheels: c.wheels, calling: c.waiting, esc })}</div>
            <div class="crewsout__text">
              <p class="crewsout__phase small"><strong>${esc(c.phase)}</strong> · ${esc(STATUS[c.status])}</p>
              ${c.lines.map((l) => `<p class="small">${c.day ? `Day ${c.day}: ` : ''}${crewLinks(l)}</p>`).join('')}
            </div>
          </div>
          <div class="crewsout__foot">
            ${c.waiting ? `<button class="btn btn--primary" data-action="take-call" data-id="${esc(c.jobId)}">Take the call</button>` : ''}
            ${c.district ? whereButton(c.district) : ''}
          </div>
        </li>`;
      }).join('')}
    </ul>`;
}

/** A district under a crew: tap to light it on the map and show only what's happening there. */
const whereButton = (d) => `<button class="linkbtn crewsout__where ${cityDistrict === d ? 'is-on' : ''}" data-action="city-show" data-id="${esc(d)}" aria-pressed="${cityDistrict === d}">${esc(cityName(d))}</button>`;

/** "A, B and C". */
const andList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
/** Fill a line's {slots}; a slot with no value is left as written so a gap shows up in testing. */
const fillLine = (line, data) => line.replace(/\{(\w+)\}/g, (m, k) => (data[k] ?? m));

/**
 * Joss's morning briefing: one line for the day's mood, then the alert lines in their
 * voice. Alerts only appear when something needs the player, and each taps through to
 * where it's dealt with. Lines change day to day but stay put across re-renders.
 */
function renderBriefing() {
  // Several jobs ending today read as one line, not a stack of them.
  const raw = alerts(state);
  const lastJobs = raw.filter((a) => a.kind === 'job-last');
  const list = lastJobs.length > 1
    ? [...raw.filter((a) => a.kind !== 'job-last'), { kind: 'jobs-last', tone: 'warn', names: lastJobs.map((a) => a.name) }]
    : raw;
  const say = (kind, data, key = '') => fillLine(pickLine(PARTNER.alerts[kind], `${state.day}-${kind}-${key}`), data);
  const line = (a) => {
    switch (a.kind) {
      case 'decision': return [say('decision', { subject: a.subject }, a.messageId), 'open-message', a.messageId];
      case 'broke': return [say('broke', { amount: money(Math.abs(a.cash)) }), 'nav', 'jobs'];
      case 'bills-short': return [say('bills-short', { total: money(a.total), short: money(a.short) }), 'nav', 'jobs'];
      case 'job-last': return [say('job-last', { job: a.name }, a.jobId), 'open-job', a.jobId];
      case 'jobs-last': return [say('jobs-last', { count: a.names.length, jobs: andList(a.names) }), 'nav', 'jobs'];
      case 'lead-last': return [say('lead-last', { name: a.name, role: a.role }, a.name), 'nav', 'crew'];
      case 'crew-out': return [say('crew-out', { names: andList(a.why ?? a.names) }), 'nav', 'crew'];
      default: return null;
    }
  };
  const has = (k) => list.some((a) => a.kind === k);
  const c = calendar(state.day);
  const mood = state.day === 1 ? 'first' : has('decision') ? 'decision' : has('broke') ? 'broke'
    : has('bills-short') ? 'short' : has('crew-out') ? 'hurt' : c.isSunday ? 'sunday' : c.isMonday ? 'monday' : 'quiet';
  const opener = pickLine(PARTNER.moods[mood], `${state.day}-${mood}`);
  const face = { broke: 'worried', short: 'worried', hurt: 'worried', sunday: 'smug', first: 'happy', quiet: 'happy' }[mood] ?? 'neutral';
  return `
    <div class="joss">
      <span class="joss__badge">${jossIcon({ mood: face, size: 32 })}</span>
      <div class="joss__body">
        <span class="joss__name">${esc(NAMES.partner)}</span>
        <p class="joss__line">${esc(opener)}</p>
      </div>
    </div>
    ${list.length ? `<ul class="alerts">${list.map((a) => {
      const [text, action, id] = line(a) ?? [];
      return text ? `<li><button class="alert alert--${a.tone}" data-action="${action}" data-id="${esc(id)}">${esc(text)} <span aria-hidden="true">›</span></button></li>` : '';
    }).join('')}</ul>` : ''}`;
}

/** The week ahead, one cell per day with a line per thing the game will do. */
function renderUpcoming(where) {
  const items = upcoming(state);
  const when = (day) => {
    const n = day - state.day;
    const wd = calendar(day).weekday;
    return n === 1 ? 'Tomorrow' : n === 7 ? `Next ${wd}` : wd;
  };
  const text = (i) => {
    switch (i.kind) {
      case 'season': return `Season ${i.season} begins: everyone a year older`;
      case 'board': return 'New freelancers and street talk';
      case 'scout': return 'Scout report: new leads';
      case 'raid': return `Raid on ${hallLabel(i.district)}: ${raidBy(i)} at the door`;
      case 'bills': return `Bills: ${money(i.total)} (wages ${money(i.wages)}, rent ${money(i.rent)})${state.cash < i.total ? `, ${money(i.total - state.cash)} short` : ''}`;
      case 'job-last': return `Last day for ${i.names.join(', ')}`;
      case 'lead-last': return `Last day to sign ${i.name} (${i.role})`;
      case 'back': return `${i.name} back from the job`;
      case 'report': return i.names.length ? `${i.names.join(' and ')} back with the ${i.name} report` : `Report from ${i.name}`;
      case 'healed': return `${i.name} over their ${i.injury} injury`;
      case 'rested': return `${i.name} rested enough to work`;
      case 'reask': return `${i.name} asks about their raise again`;
      default: return '';
    }
  };
  // Jobs ending the same day share one line.
  for (const d of new Set(items.filter((i) => i.kind === 'job-last').map((i) => i.day))) {
    const same = items.filter((i) => i.kind === 'job-last' && i.day === d);
    same[0].names = same.map((i) => i.name);
    for (const i of same.slice(1)) items.splice(items.indexOf(i), 1);
  }
  // Several people on the same day (back, healed, rested) share one line: "5 back from the job",
  // with the names a tap away (owner's feedback, 2026-10-27: imagine ten coming back).
  const GROUPS = { back: 'back from the job', healed: 'over their injuries', rested: 'rested enough to work' };
  for (const kind of Object.keys(GROUPS)) {
    for (const d of new Set(items.filter((i) => i.kind === kind).map((i) => i.day))) {
      const same = items.filter((i) => i.kind === kind && i.day === d);
      if (same.length < 3) continue;
      items.splice(items.indexOf(same[0]), 1, { day: d, kind: 'group', text: `${same.length} ${GROUPS[kind]}`, names: same.map((i) => i.name) });
      for (const i of same.slice(1)) items.splice(items.indexOf(i), 1);
    }
  }
  const line = (i) => (i.kind === 'group'
    ? `<li><details class="upcoming__group"><summary>${esc(i.text)}</summary><span class="small muted">${esc(i.names.join(', '))}</span></details></li>`
    : `<li class="${i.kind === 'bills' && state.cash < i.total ? 'is-short' : ''}">${esc(text(i))}</li>`);
  const days = [...new Set(items.map((i) => i.day))];
  return `
    <section class="panel upcoming ${where}">
      <h2 class="upcoming__title">Coming up</h2>
      <ul class="upcoming__days">
        ${days.map((d) => `
          <li class="upcoming__day">
            <span class="upcoming__when">${esc(when(d))}</span>
            <ul class="upcoming__items">${items.filter((i) => i.day === d).map(line).join('')}</ul>
          </li>`).join('')}
      </ul>
    </section>`;
}

/**
 * Text with the crew's names (full names first, then handles) turned into links to their page,
 * escaped. Only people on the crew now: the fallen and freelancers stay plain text.
 */
function crewLinks(text) {
  const names = state.crew.flatMap((op) => [[op.name, op.id], [op.handle, op.id]]).filter(([n]) => n).sort((a, b) => b[0].length - a[0].length);
  if (!names.length || !text) return esc(text ?? '');
  const byName = new Map(names);
  const pattern = names.map(([n]) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${pattern})(?![\\p{L}\\p{N}])`, 'gu');
  let out = '';
  let last = 0;
  for (const m of text.matchAll(re)) {
    out += esc(text.slice(last, m.index)) + `<button class="namelink" data-action="op-link" data-id="${esc(byName.get(m[1]))}">${esc(m[1])}</button>`;
    last = m.index + m[1].length;
  }
  return out + esc(text.slice(last));
}

function renderMessage(m) {
  // The welcome message points a new player at their first job.
  const jobLink = (m.type === 'job' || m.id === 'welcome') && state.jobs.length ? `<button class="btn" data-action="nav" data-id="jobs">Open the job board</button>`
    : m.type === 'scout' && (state.recruits ?? []).length ? `<button class="btn" data-action="nav" data-id="crew">See the leads</button>` : '';
  return `
      <button class="btn btn--ghost inbox__back" data-action="back">← Today</button>
      <h1>${crewLinks(m.subject)}</h1>
      <p class="muted">${esc(m.type.charAt(0).toUpperCase() + m.type.slice(1))} · Day ${m.day}</p>
      ${m.type === 'report' ? renderReportTimeline(m) : m.kind === 'week' && m.payload?.lines ? renderWeekSummary(m) : `<p class="body">${crewLinks(m.body)}</p>`}
      ${m.kind === 'renewal' ? renderRenewal(m) : ''}
      ${m.kind === 'heat' ? renderHeatNotice(m) : ''}
      ${m.kind === 'spec' ? renderSpecOffer(m) : ''}
      ${m.kind === 'hall-offer' && !hallIn(state, m.payload.district) ? (canOpenHall(state, m.payload.district).ok ? `<button class="btn btn--primary" data-action="open-hall" data-id="${esc(m.payload.district)}">Open the hall · ${money(HALL_SITES[m.payload.district].deposit)}</button>` : `<p class="muted small">${esc(canOpenHall(state, m.payload.district).reason)}.</p>`) : ''}
      ${m.kind === 'callin' && !m.resolved ? `<button class="btn btn--primary" data-action="take-call" data-id="${esc(m.payload.jobId)}">Take the call</button>` : ''}
      ${m.kind === 'raid' ? renderRaidCall(m) : ''}
      ${m.kind === 'raid-warning' ? renderRaidWarning(m) : ''}
      ${jobLink}`;
}

/** The Sunday summary (core/week.js): the week's lines, then what was paid. */
function renderWeekSummary(m) {
  const p = m.payload;
  return `
      <ul class="weeksum">${p.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      ${p.broker ? `<p class="body"><strong>Work boards:</strong> ${esc(p.broker.lines.join(' '))}</p>` : ''}
      <p class="body">Wages ${money(p.wages)}, rent ${money(p.rent)}. Paid ${money(p.paid)}. Cash now ${money(p.cash)}.</p>
      ${m.body.includes('Heat cooled') ? `<p class="body muted">${esc(m.body.slice(m.body.indexOf('Heat cooled')).split(' Work boards:')[0])}</p>` : ''}`;
}

/**
 * A job report as a timeline, top to bottom: each crisis in the order it happened, then
 * what the job came to. Reports from before save v15 have only a paragraph: split it into
 * sentences, with the outcome starting at "Paid".
 */
function renderReportTimeline(m) {
  let { result, steps, outcome } = m.timeline ?? {};
  if (!m.timeline) {
    const lines = (m.body ?? '').split(/(?<=[.!?]["'”]?)\s+(?=["“A-Z¥])/);
    const at = lines.findLastIndex((l) => l.startsWith('Paid '));
    steps = at < 0 ? lines : lines.slice(0, at);
    outcome = at < 0 ? [] : lines.slice(at).map((text) => ({ tone: 'plain', text }));
  }
  const end = { completed: ['✓', 'Job done'], aborted: ['↩', 'Aborted'], loss: ['✕', 'Someone didn\'t come home'], setback: ['✗', 'Went badly'] }[result] ?? ['■', 'How it ended'];
  // Played once: each step lands in turn down the rail, then the result, then Joss and the summary.
  const play = m.id === playReportId;
  if (play) playReportId = null;
  const STEP = 0.8; // seconds per step
  return `
    <div class="report ${play ? 'report--play' : ''}" ${play ? `data-action="skip-report" style="--step:${STEP}s; --end:${(steps.length + 1) * STEP + 0.6}s"` : ''}>
      ${renderReportSummary(m.timeline)}
      <ol class="timeline">
        ${steps.map((text, i) => `<li class="timeline__item" style="--i:${i}"><span class="timeline__node" aria-hidden="true">${i + 1}</span><p class="timeline__text">${crewLinks(text)}</p></li>`).join('')}
        ${outcome.length ? `<li class="timeline__item timeline__item--end timeline__item--${esc(result ?? 'plain')}" style="--i:${steps.length}">
          <span class="timeline__node" aria-hidden="true">${end[0]}</span>
          <div class="timeline__text"><p class="timeline__label">${esc(end[1])}</p>
            <ul class="timeline__results">${outcome.map((o, i) => `<li class="tone--${esc(o.tone)}" style="--r:${i}">${esc(o.text)}</li>`).join('')}</ul></div>
        </li>` : ''}
      </ol>
      ${m.timeline?.side ? rollDetail(m.timeline.side) : ''}
      ${renderFullLog(m.timeline)}
    </div>`;
}

/** Joss's opener and what the run came down to (core/report.js). Headings with nothing behind them are left out. */
function renderReportSummary(t) {
  const sum = t?.summary;
  if (!sum) return '';
  const orders = t.orders && ORDERS[t.orders] ? `<p class="muted small">Hands-off · ${esc(ORDERS[t.orders].name)} orders</p>`
    : t.callIn && t.callIn !== 'every' && ORDERS[t.liveOrders] ? `<p class="muted small">Called in ${esc(CALL_IN[t.callIn].name.toLowerCase())} · ${esc(ORDERS[t.liveOrders].name)} orders decided the rest</p>` : '';
  const rows = [
    sum.turning && ['Turning point', sum.turning.text],
    sum.standout && ['Standout', sum.standout.text],
    sum.hurt?.length && ['What hurt us', sum.hurt.join(' ')],
    sum.saves?.length && ['Saves', sum.saves.map((v) => `${v.by} got ${v.who} out of trouble${v.via === 'overwatch' ? ` (${v.kit ?? 'overwatch'})` : ''}.`).join(' ')],
    sum.alert != null && ['Alert', `Reached ${sum.alert} of ${ALERT_MAX}.`],
  ].filter(Boolean);
  return `
      <div class="reporthead">
      ${orders}
      ${sum.intro ? `<p class="reportjoss"><span class="reportjoss__name">${esc(NAMES.partner)}</span> ${esc(sum.intro)}</p>` : ''}
      ${rows.length ? `<dl class="reportsum">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      </div>`;
}

const STAT_LABEL = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

/** The roll behind a line, shown on tap: die + stat = total, what it needed, and where the bonuses came from. */
function rollDetail(e) {
  if (e.die == null) return '';
  const total = e.die + e.value;
  return `
        <details class="flog__roll">
          <summary>${esc(STAT_LABEL(e.stat))} ${e.success ? '✓' : '✗'}</summary>
          <p class="small">Die ${e.die} + ${esc(e.stat)} ${e.value} = ${total} · needed ${e.need}${e.notes?.length ? `<br><span class="muted">${esc(e.stat)} ${e.value}: ${esc(e.notes.join(', '))}</span>` : ''}</p>
        </details>`;
}

/** Everything that happened, in order, folded away under the summary (save v16 reports only). */
function renderFullLog(t) {
  const events = t?.events;
  if (!events?.length) return '';
  const lastBeat = events.map((e) => e.kind).lastIndexOf('beat');
  // Squad runs (slice 2) mark each zone; older logs get the three headings they always had.
  const zoned = events.some((e) => e.kind === 'zone');
  let onJob = false;
  const items = events.map((e, i) => {
    let head = '';
    if (zoned) head = e.kind === 'beat' && e.first ? '<h3 class="flog__phase">Getting there</h3>' : '';
    else if (e.kind === 'beat' && e.first) head = '<h3 class="flog__phase">Approach</h3>';
    else if (e.kind === 'beat' && e.last && i === lastBeat) head = '<h3 class="flog__phase">Getting out</h3>';
    else if (!onJob && e.kind !== 'beat') { onJob = true; head = '<h3 class="flog__phase">On the job</h3>'; }
    if (e.kind !== 'beat') onJob = true;
    const body = {
      zone: () => `<h3 class="flog__phase">${esc(e.text)}</h3>`,
      beat: () => `<p class="flog__beat">${esc(e.text)}</p>`,
      twist: () => `<p class="flog__twist">Twist: ${esc(e.text)}</p>`,
      aftermath: () => `<p class="flog__line ${e.death ? 'tone--bad' : 'tone--good'}">${esc(e.text)}</p>`,
      // A fight (slice 6): what started it, each round's moments with their dice, how it ended.
      battle: () => `
        <div class="flog__step">
          ${e.phase === 'round' ? `<p class="flog__crisis">${esc(e.text)}</p>` : ''}
          ${(e.lines ?? []).map((l) => `<p class="flog__line ${l.kind === 'guard' ? (l.damage ? 'tone--bad' : 'tone--good') : l.success === false ? 'tone--bad' : 'tone--good'}">${esc(l.text)}</p>${rollDetail(l)}`).join('')}
          ${e.phase === 'start' || e.phase === 'end' ? `<p class="flog__line ${e.phase === 'start' || e.hurt?.length ? 'tone--warn' : 'tone--good'}">${esc(e.report ?? e.text)}</p>` : ''}
          ${e.phase === 'retreat' ? `<p class="flog__line tone--warn">${esc(e.text)}</p>` : ''}
        </div>`,
      critical: () => `
        <div class="flog__step">
          <p class="flog__crisis">${esc(e.patient)} is critical.</p>
          ${e.why ? `<p class="flog__why">${esc(e.why)}</p>` : ''}
          <p class="flog__line ${e.action === 'push' || e.success === false ? 'tone--bad' : 'tone--good'}">${esc(e.report)}</p>
          ${rollDetail(e)}
        </div>`,
    }[e.kind] ?? (() => `
        <div class="flog__step">
          <p class="flog__crisis">${esc(e.text)}</p>
          <p class="flog__choice">${e.actor && !e.choice.startsWith(e.actor.handle) ? `<strong>${esc(e.actor.handle)}</strong> · ` : ''}${esc(e.choice)}</p>
          ${e.why ? `<p class="flog__why">${esc(e.why)}</p>` : ''}
          ${e.report ? `<p class="flog__line ${e.kind === 'exit' ? 'tone--warn' : e.success === false ? 'tone--bad' : 'tone--good'}">${esc(e.report)}</p>` : ''}
          ${rollDetail(e)}
        </div>`);
    return head + body();
  }).join('');
  return `
      <details class="flog">
        <summary>Full log</summary>
        <div class="flog__body">${items}</div>
      </details>`;
}

/** Renewal notice: the numbers, then Accept / Haggle / Refuse (or the outcome once decided). */
function renderRenewal(m) {
  const p = m.payload;
  const pct = Math.round(p.discount * 100);
  return `
      <div class="riskcard">
        <dl class="stats stats--deal">
          <div><dt>Current wage</dt><dd>${money(p.current)}</dd></div>
          <div><dt>Asking</dt><dd>${money(p.ask)}</dd></div>
          <div><dt>Market value</dt><dd>${money(p.market)}</dd></div>
        </dl>
        ${p.reason === 'fame' ? '<p class="muted small">They became Elite: the street knows the name. Loyal runners ask less often; greedy ones more.</p>'
          : `<p class="muted small">Loyalty: ${p.jobs} job${p.jobs === 1 ? '' : 's'} with the crew, ${pct}% off the raise${pct >= 25 ? ' (the most loyalty buys)' : ''}.</p>`}
        ${p.haggleResult ? `<p class="muted">${esc(p.haggleResult)}</p>` : ''}
        ${p.outcome ? `<p><strong>${esc(p.outcome)}</strong></p>` : ''}
      </div>
      ${m.resolved ? '' : `<div class="stack">
        ${m.options.map((o) => `<button class="btn ${o.id === 'accept' ? 'btn--primary' : o.id === 'refuse' ? 'btn--ghost' : ''}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(o.id)}" ${o.disabled ? 'disabled' : ''}>${esc(o.id === 'accept' ? `Accept ${money(p.ask)} a week` : o.label)}</button>`).join('')}
        <p class="muted small">Refusing: they stay, but their head isn't in it for four weeks (−1 on their rolls), then they ask again.</p>
      </div>`}`;
}

/** Joss's specialisation offer (core/specialisations.js): what each one does, then take it or not yet. */
function renderSpecOffer(m) {
  const p = m.payload;
  return `
      <div class="riskcard">
        ${p.ids.map((id) => `<p><strong>${esc(SPECIALISATIONS[id].name)}</strong> · ${esc(SPECIALISATIONS[id].desc)}</p>`).join('')}
        ${p.outcome ? `<p><strong>${esc(p.outcome)}</strong></p>` : '<p class="muted small">One specialisation each, for good. "Not yet" and Joss asks again in two weeks.</p>'}
      </div>
      ${m.resolved ? '' : `<div class="stack">
        ${m.options.map((o) => `<button class="btn ${o.id === 'later' ? 'btn--ghost' : 'btn--primary'}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
      </div>`}`;
}

/** The police at a hall's door (core/raids.js): hold it, walk out the back, or pay where they take it. */
function renderRaidCall(m) {
  const raid = (state.raids ?? []).find((r) => r.id === m.payload.raidId);
  if (!raid) return '';
  if (m.resolved) return m.payload.outcome ? `<p><strong>${esc(m.payload.outcome)}</strong></p>` : '';
  return `
      <div class="stack raidcall">
        ${raidWhere(raid)}
        ${raidChoices(state, raid).map((c) => `
        <button class="choice ${c.exit ? 'choice--exit' : ''}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(c.id)}" ${c.disabled ? 'disabled' : ''}>
          <strong>${esc(c.label)}</strong><span>${esc(c.disabled && c.reason ? `${c.reason}. ${c.cost}` : c.cost)}</span>
        </button>`).join('')}
      </div>`;
}

/** A raid warning: what's coming, and where the police take money, the price to call it off. */
function renderRaidWarning(m) {
  const raid = (state.raids ?? []).find((r) => r.id === m.payload.raidId);
  if (!raid || raid.done) return raid?.outcome ? `<p class="muted small">It's over: ${esc({ paid: 'paid off', held: 'we held the hall', withdrew: 'we walked out' }[raid.outcome] ?? raid.outcome)}.</p>` : '';
  const price = raidPrice(state, raid);
  return `
      <div class="stack">
        ${raidWhere(raid)}
        ${canBuyOff(state, raid) && !raid.answer && !raid.called ? `<button class="btn btn--primary" data-action="raid-pay" data-id="${esc(raid.id)}" ${state.cash < price ? 'disabled' : ''}>${isGangRaid(raid) ? 'Settle' : 'Pay them off'} · ${money(price)}</button>` : ''}
        ${raid.answer === 'paid' ? `<p class="small"><strong>${isGangRaid(raid) ? 'Settled' : 'Paid off'} (${money(raid.paid)}).</strong> Nobody will come.</p>` : ''}
        <button class="btn" data-action="nav" data-id="ops">See it on Ops</button>
        <p class="muted small">Until then: move people into or out of the hall on Crew › Halls (moving takes the day), and keep crews home or send them out. On the day, whoever is home can hold it.</p>
      </div>`;
}

/** Fixer notice at high heat: pay to cool it, or let it ride (the next job's first crisis roll is −1). */
function renderHeatNotice(m) {
  const p = m.payload;
  const short = heatChoices(state, m)[0].disabled;
  return `
      <div class="riskcard">
        <dl class="stats">
          <div><dt>Heat${p.district ? ` · ${esc(districtName(p.district))}` : ''}</dt><dd>${p.district ? heatIn(state, p.district) : state.heat}/10</dd></div>
          <div><dt>Fixer</dt><dd>${money(p.cost)}</dd></div>
          <div><dt>Cash</dt><dd>${money(state.cash)}</dd></div>
        </dl>
        ${p.outcome ? `<p><strong>${esc(p.outcome)}</strong></p>` : ''}
      </div>
      ${m.resolved ? '' : `<div class="stack">
        <button class="btn btn--primary" data-action="decide" data-id="${esc(m.id)}" data-option="pay" ${short ? 'disabled' : ''}>${esc(short ? `Pay the fixer (${money(p.cost)}: not enough cash)` : `Pay the fixer ${money(p.cost)} · heat −${p.cools}`)}</button>
        <button class="btn btn--ghost" data-action="decide" data-id="${esc(m.id)}" data-option="ride">Let it ride</button>
        <p class="muted small">Letting it ride costs nothing now. The next job you start is watched: −${WATCHED_PENALTY} on its first crisis roll, then it's gone. Jobs stay open either way.</p>
      </div>`}`;
}

// --- founders ------------------------------------------------------------
/**
 * A new game's first screen: six candidates, pick three (DESIGN.md, 2026-10-28). Each one is a
 * card like the squad board's dossiers, with what the scouts and Joss know about them below.
 */
function renderFounding() {
  const cands = state.founding.candidates;
  const picked = founderPick.filter((id) => cands.some((c) => c.id === id));
  const n = picked.length;
  const wages = cands.filter((c) => picked.includes(c.id)).reduce((sum, c) => sum + c.wage, 0);
  const names = picked.map((id) => cands.find((c) => c.id === id).handle);
  const best = (r) => Object.entries(r.stats).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return `
    <section class="panel founding">
      <h1>Who's in?</h1>
      <div class="joss">
        <span class="joss__badge">${jossIcon({ mood: 'happy', size: 32 })}</span>
        <div class="joss__body">
          <span class="joss__name">${esc(NAMES.partner)}</span>
          <p class="joss__line">Six people will work for street wages, and the room sleeps three. Pick who you want to grow with. We hire the rest later.</p>
        </div>
      </div>
      <ul class="founders" role="group" aria-label="Candidates: pick ${FOUNDERS_TO_PICK}">
        ${cands.map((r, i) => {
          const on = picked.includes(r.id);
          const full = !on && n >= FOUNDERS_TO_PICK;
          return `<li><button class="founder ${on ? 'is-on' : ''}" data-action="founder-toggle" data-id="${esc(r.id)}" aria-pressed="${on}" ${full ? 'disabled' : ''}>
            <span class="founder__file dossier" style="--tilt:${['-1.2deg', '0.8deg', '-0.4deg', '1.1deg', '-0.9deg', '0.5deg'][i % 6]}">
              <span class="dossier__photo">${face(r)}</span>
              <span class="dossier__name">${esc(r.handle)}</span>
              <span class="dossier__real">${esc(r.role)} · ${r.age}</span>
              ${on ? '<span class="dossier__tag">In</span>' : ''}
            </span>
            <span class="founder__about">
              <span class="founder__stats">${best(r).map(([k, v]) => `<span><b>${v}</b> ${esc(statName(k))}</span>`).join('')}</span>
              <span class="founder__line">${esc(r.origin)}</span>
              <span class="founder__traits muted small">${esc(r.traits.map((t) => TRAITS[t]?.name ?? t).join(' · '))}</span>
              <span class="founder__wage muted small">${money(r.wage)}/wk</span>
            </span>
          </button></li>`;
        }).join('')}
      </ul>
      <div class="planbar founding__bar">
        <p class="small">${n ? `<strong>${esc(names.join(', '))}</strong><br>` : ''}${n === FOUNDERS_TO_PICK ? `Wages ${money(wages)} a week. Rent ${money(state.rent)}, due Sunday.` : `Picked ${n} of ${FOUNDERS_TO_PICK}.`}</p>
        <button class="btn btn--primary" data-action="found-crew" ${n === FOUNDERS_TO_PICK ? '' : 'disabled'}>${n === FOUNDERS_TO_PICK ? 'Start with these three' : `Pick ${FOUNDERS_TO_PICK - n} more`}</button>
      </div>
    </section>`;
}

// --- crew --------------------------------------------------------------
/** The tong's halls (core/halls.js): who lives where, beds, rent, expanding, and opening another. */
function renderHalls() {
  const halls = state.halls ?? [];
  const sites = Object.entries(HALL_SITES).filter(([d, site]) => site.deposit != null && !hallIn(state, d));
  return `
      <h2>Halls</h2>
      <ul class="halls">
        ${halls.map((h) => {
          const x = nextHallExpansion(state, h.district);
          const who = residents(state, h.district);
          return `
          <li class="hall has-mark">
            ${hallMark(h.district, { raid: openRaids(state).some((r) => r.district === h.district && r.answer !== 'paid') })}
            <div class="hall__body">
            <p class="hall__head"><strong>${esc(cityName(h.district))}</strong>${h.district === HOME_HALL ? ' <span class="hall__home">home</span>' : ''}${h.owned ? ' <span class="hall__home hall__owned">ours</span>' : ''} <span class="muted small">level ${h.level} · ${h.owned ? 'no rent' : `${money(h.rent)}/wk`} · heat ${heatIn(state, h.district)}/10</span></p>
            <p class="small">${who.length}/${bedsOf(h)} beds${who.length ? `: ${esc(who.map((o) => o.handle).join(', '))}` : ' · nobody lives here yet'}</p>
            <p class="small muted">${esc(hallBuildLine(h, defenceCut(state, h.district)))}</p>
            <button class="btn btn--block" data-action="build-hall" data-id="${esc(h.district)}">Build</button>
            <button class="btn btn--block" data-action="expand-hall" data-id="${esc(h.district)}" ${state.cash >= x.cost ? '' : 'disabled'}>Expand: +${x.beds} beds for ${money(x.cost)} (${x.rentIncrease ? `rent +${money(x.rentIncrease)}/wk` : 'no rent'})</button>
            ${(() => { const price = buyPrice(state, h.district); return price == null ? '' : `<button class="btn btn--block" data-action="buy-hall" data-id="${esc(h.district)}" ${state.cash >= price ? '' : 'disabled'}>Buy the place: ${money(price)}, then no rent</button>`; })()}
            </div>
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

function renderCrew() {
  const cap = state.rosterCap ?? STARTING_ROSTER_CAP;
  const recruits = state.recruits ?? [];
  const wall = state.memorial.length ? `
      <h2>The wall</h2>
      <ul class="list list--plain">
        ${state.memorial.map((m) => `<li class="fallen">${face(m, 'sm')}<span><strong>${esc(m.name)}</strong> "${esc(m.handle)}" <span class="muted">· ${esc(m.role)} · ${esc(m.cause)}, day ${m.day}</span></span></li>`).join('')}
      </ul>` : '';
  const leads = `
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
      </ul>` : '<p class="muted small">No leads right now. Scouts report every Wednesday.</p>'}`;
  return `
    <section class="panel">
      <div class="crewhead">
        <h1>Crew</h1>
        <span class="muted">${state.crew.length}/${cap} beds</span>
      </div>
      <ul class="list list--cols">
        ${state.crew.map((op) => `
          <li>
            <button class="row crewrow" data-action="open-op" data-id="${esc(op.id)}">
              ${face(op)}
              <span class="crewrow__name"><strong>${esc(op.name)}</strong> "${esc(op.handle)}"${op.record?.highlights?.[0] ? `<small class="muted crewrow__hl">${esc(op.record.highlights[0].text)}</small>` : ''}</span>
              <span class="crewrow__info muted">${fameOf(op) === 'elite' ? `<span class="fame fame--elite">${esc(fameName('elite'))}</span> · ` : ''}${esc(op.tier ?? '')} ${esc(op.role)} · ${op.age}</span>
              <span class="crewrow__status">${statusChip(availability(state, op))}</span>
              <span class="crewrow__scout">${scoutLine(op)}${growthMarker(op)}</span>
              <span class="crewrow__bars">${conditionBars(op)}</span>
            </button>
          </li>`).join('')}
      </ul>
      <div class="cols2">
      <div>${leads}</div>
      <div>
      ${renderHalls()}
      ${armouryCard(gearUi, state)}
      </div>
      </div>
      ${wall}
    </section>`;
}

function renderRecruit() {
  const r = (state.recruits ?? []).find((x) => x.id === openRecruitId);
  if (!r) { openRecruitId = null; return renderCrew(); }
  const can = canHire(state, r);
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Crew</button>
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

function renderMentoring(crew) {
  const pairs = mentoring(crew);
  if (!pairs.length) return '';
  return `<p class="small mentor">${pairs.map(({ op, mentors }) => `${esc(op.handle)} learns faster with ${esc(mentors.map((m) => m.handle).join(' and '))} on the job.`).join(' ')}</p>`;
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
  return `<p class="famebadge"><span class="fame fame--${esc(fame)}">${esc(fameName(fame))}</span> · ${esc(op.tier ?? '')}${word}</p>`;
}

/** Their path (core/fame.js) and how far it is to Elite and Legend; the numbers behind a tap. */
function renderPath(op) {
  if (op.freelance || !recordOf(op).jobs) return '';
  const p = pathOf(op);
  const legend = legendProgress(op);
  const elite = fameOf(op) === 'elite';
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
      ${legend.ready ? '<p class="pathcard__ready">Ready for their moment.</p>' : ''}
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

function renderOperative() {
  const op = state.crew.find((x) => x.id === openOperativeId);
  if (!op) return renderCrew();
  const c = op.condition;
  const nameOf = (id) => state.crew.find((x) => x.id === id)?.handle ?? state.memorial.find((x) => x.id === id)?.handle ?? id;
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">${returnTo ? '← Back to the message' : '← Crew'}</button>
      <div class="ophead">
        ${face(op, 'lg')}
        <div>
          <h1>${esc(op.name)} <span class="muted">"${esc(op.handle)}"</span></h1>
          <p class="muted">${esc(op.tier ?? '')} ${esc(op.role)} · ${op.age} · ${money(op.wage)}/week</p>
          ${fameBadge(op)}
          ${marksText(op) ? `<p class="muted small">Marked: ${esc(marksText(op))}</p>` : ''}
          ${statusChip(availability(state, op))}
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
      ${renderLoadout(gearUi, state, op)}

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
    ${gearSlot ? renderGearSheet(gearUi, state, op, gearSlot) : ''}`;
}

// --- jobs and planning -----------------------------------------------------
function streetTalk() {
  const r = activeRumour(state);
  return r ? `<div class="talk"><strong>Street talk · ${esc(NAMES.districts[r.district] ?? r.district)}</strong><br>${esc(r.text)}</div>` : '';
}

// The climb: how far the crew's name has to travel before bigger work is offered.
function climbLine() {
  const next = nextUnlock(state);
  if (!next) return '';
  // One compact line in the Heat meter's style (option B of five, owner's pick 2026-10-28; the
  // others are in drafts/prototypes/reputation-gauge-options.html): a label, a small segmented
  // track to the next unlock, the number, and the rest behind an (i). The (i) also holds the key
  // to the stat icons on job cards, which show there without words (2026-10-28).
  const rep = state.reputation ?? 0;
  const pct = Math.round(Math.min(1, rep / next.rep) * 100);
  const ladder = Object.entries(JOB_GATES).map(([threat, need]) => `${need} (threat ${threat})`).join(', ');
  return `<div class="climb infoline">
    <span class="climb__label">Rep</span>
    <span class="heat__track climb__track" role="progressbar" aria-label="Reputation towards the next unlock" aria-valuenow="${Math.floor(rep)}" aria-valuemin="0" aria-valuemax="${next.rep}"><span style="width:${pct}%"></span></span>
    <strong class="climb__value">${Math.floor(rep)}/${next.rep}</strong>
    ${infoButton('reputation', 'About reputation and job cards')}
  </div>
  ${infoHtml('reputation', `<p class="infotext small">${esc(`Bigger work opens up once people know your name. Finished jobs build it; aborts cost it. Rookie jobs are open from the start; the rest open at ${ladder}.`)}</p>
  <p class="infotext small">On job cards, the corner is Joss's read of the risk (bigger and redder is riskier), then how many runners Joss would send and the job's key stats: ${STATS.map(statIcon).join(' ')}</p>`)}`;
}

/** Joss's read of one job for the board (core/squad.js jobRead), worked out once per state. */
const readCache = new WeakMap();
function boardRead(job) {
  let reads = readCache.get(state);
  if (!reads) readCache.set(state, (reads = new Map()));
  if (!reads.has(job.id)) reads.set(job.id, jobRead(state, job));
  return reads.get(job.id);
}

/**
 * What's unusual about an offer, most important first, at most two. Usual facts (district, threat,
 * client mood, days left) stay on the planning screen: the card only speaks up when there's news.
 */
const namedHandle = (v) => (v.askedFor ? state.crew.find((o) => o.id === v.askedFor)?.handle ?? null : null);
const namedVars = (v) => ({ op: namedHandle(v), pct: Math.round(NAMED_OFFER.payBonus * 100) });
const fillNamed = (text, v) => text.replace(/\{(\w+)\}/g, (m, k) => namedVars(v)[k] ?? m);

function jobFlags(v) {
  const flags = [];
  if (namedHandle(v)) flags.push(['named', fillNamed(NAMED_TEXT.chip, v)]); // a client asked for an Elite by name (renown slice 4)
  const g = jobGrudge(v.tpl, v.threat);
  if (g) flags.push(['hot', `Against ${GANGS[g.gang].short}`]); // a job that hurts a gang (core/gangs.js)
  const opens = openingFor(state, v.jobId);
  if (opens) flags.push(['named', `Opens the ${cityName(opens).replace(/^The /, '')} hall`]); // a contact's opening favour (core/halls.js)
  if (v.hinted) flags.push(['bad', 'Intel unreliable']);
  if (v.rumour) flags.push([v.threatDelta > 0 ? 'hot' : v.threatDelta < 0 ? 'good' : 'info', `Street talk: ${v.rumour.tag}`]);
  else if (v.threatDelta > 0) flags.push(['hot', 'Hotter than usual']);
  else if (v.threatDelta < 0) flags.push(['good', 'Quieter than usual']);
  if (intelFor(state, v.tpl.district)) flags.push(['good', 'Intel here']);
  if (v.days > 1) flags.push(['info', `${v.days}-day job`]);
  return flags.slice(0, 2);
}

/** A runner's tile word: free, tired or hurt (but able), or when they're back. */
function runnerWord(a) {
  if (a.ok) return a.reason === 'fatigued' ? 'Tired' : a.reason === 'light injury' ? 'Hurt' : 'Free';
  const back = /^away until day (\d+)$/.exec(a.reason);
  if (back) return `Out · ${calendar(Number(back[1])).weekday}`;
  return a.reason[0].toUpperCase() + a.reason.slice(1);
}

/** Who can run a job today, open by default; faces first, free people first. */
function renderRunners() {
  const people = state.crew.filter((o) => !o.freelance).map((op) => ({ op, a: availability(state, op) }))
    .sort((x, y) => Number(y.a.ok) - Number(x.a.ok));
  const free = people.filter((x) => x.a.ok).length;
  const out = people.length - free;
  return `
      <div class="runners">
        <button class="runners__head" data-action="toggle-runners" aria-expanded="${!runnersHidden}">
          <span><strong class="runners__free">${free} ${free === 1 ? 'runner' : 'runners'} free today</strong>${out ? ` · ${out} out` : ''}</span>
          <span class="runners__toggle">${runnersHidden ? 'Show' : 'Hide'}</span>
        </button>
        ${runnersHidden ? '' : `<ul class="runners__list">
          ${people.map(({ op, a }) => `<li class="runner ${a.ok ? (a.reason === 'ready' ? 'is-free' : 'is-worn') : 'is-out'}">${face(op)}<strong>${esc(op.handle)}</strong><span>${esc(runnerWord(a))}</span></li>`).join('')}
        </ul>`}
      </div>`;
}

function jobCard(j) {
  const v = jobView(state, j);
  const t = v.tpl;
  const r = boardRead(j);
  const flags = jobFlags(v);
  // A note only when Joss's squad has a catch: someone missing, or someone tired or hurt.
  const worn = r.crew.map((op) => ({ op, a: availability(state, op) })).find((x) => x.a.reason === 'fatigued' || x.a.reason === 'light injury');
  const note = r.short ? `short ${r.short}` : worn ? `${worn.op.handle} is ${worn.a.reason === 'fatigued' ? 'tired' : 'hurt'}` : '';
  // The job's key skills, each an icon with its name (2026-11-05: the icons alone didn't say what they were).
  const stats = t.keyStats.map((k) => `<span class="keyglyph">${statGlyph(k)}<span>${esc(statName(k).toLowerCase())}</span></span>`).join('');
  const risk = riskWord(r.level);
  return `
      <li>
        <button class="row jobcard ${plan?.jobId === j.id ? 'is-selected' : ''}" data-action="open-job" data-id="${esc(j.id)}">
          <strong class="jobcard__name">${esc(t.name)}</strong><strong class="jobcard__pay">${money(v.pay)}</strong>
          <span class="jobcard__client">${esc(v.client?.name ?? 'Walk-in job')}</span>${j.expiresDay === state.day ? '<span class="jobcard__left">ends today</span>' : ''}
          ${flags.length ? `<span class="jobcard__flags">${flags.map(([tone, text]) => `<span class="flag flag--${tone}">${esc(text)}</span>`).join('')}</span>` : ''}
          <span class="jobcard__facts">${r.size || t.crewSize} ${(r.size || t.crewSize) === 1 ? 'runner' : 'runners'} · ${esc(crewStandard(v.threat).label)} · <span class="keyglyphs">${stats}</span>${note ? ` · <span class="jobcard__note">${esc(note)}</span>` : ''}</span>
          <span class="riskcorner riskcorner--${esc(r.level)}" role="img" aria-label="${esc(risk)} risk" title="${esc(risk[0].toUpperCase() + risk.slice(1))} risk"></span>
        </button>
      </li>`;
}

function renderJobs() {
  // Ending soonest first, then the better pay.
  const jobs = [...state.jobs].sort((a, b) => a.expiresDay - b.expiresDay || jobView(state, b).pay - jobView(state, a).pay);
  return `
    <section class="panel jobsboard">
      <h1>Jobs</h1>
      ${streetTalk()}
      ${climbLine()}
      ${renderRunners()}
      ${jobs.length ? `<ul class="list list--cols jobslist">${jobs.map(jobCard).join('')}</ul>` : '<p class="muted">No work on the board. New work comes in through the week.</p>'}
      ${renderSideBoard()}
      ${renderClients()}
    </section>`;
}

const PURPOSE = { money: 'Money', training: 'Training', trust: 'Client trust', info: 'Intel' };

/** A side task's headline is its reward; an intel task names the board jobs it would help. */
function sideHeadline(t) {
  if (t.purpose === 'training') return `${statName(t.stat)} ↑`;
  if (t.purpose === 'trust') return `+${SIDE_TRUST} trust · ${CLIENTS.find((c) => c.id === t.client)?.name ?? t.client}`;
  if (t.purpose === 'money') return sideReward(t);
  const helped = state.jobs.map((j) => templateById(j.templateId)).filter((tpl) => tpl.district === t.district).map((tpl) => tpl.name);
  return `Intel · ${helped.length ? `helps ${helped.join(', ')}` : 'helps nothing on the board'}`;
}

/** This week's side tasks, under the job board: compact rows, the reward first. */
function renderSideBoard() {
  const board = (state.sideBoard ?? []).map(sideTaskById).filter(Boolean);
  return `
      <h2>Side work this week</h2>
      <div class="infoline"><p class="muted small">Small jobs for whoever's free.</p>${infoButton('side-work', 'About side work')}</div>
      ${infoText('side-work', 'One-off jobs for whoever isn\'t on the main work. They\'re away for the days shown, and the result comes back with them. A new board every Monday.')}
      ${board.length ? `<ul class="list list--cols sidelist">
        ${board.map((t) => `
          <li>
            <button class="row siderow" data-action="open-side" data-id="${esc(t.id)}">
              <strong class="siderow__reward siderow__reward--${esc(t.purpose)}">${esc(sideHeadline(t))}</strong>
              <span class="siderow__meta">${t.days}d · ${crewIcons(t.crew)}</span>
              <span class="siderow__sub">${esc(t.name)} · ${esc(districtName(t.district))} · ${statIcon(t.stat)}</span>
            </button>
          </li>`).join('')}
      </ul>` : '<p class="muted">Nothing left this week. More on Monday.</p>'}`;
}

// A small (i) that opens an explanation under its line on tap (no hover: iOS rules in CLAUDE.md).
// The button stays put and the text appears below, so nothing jumps (owner's feedback, 2026-10-28).
const infoButton = (id, label) => `<button class="infobtn ${openInfo.has(id) ? 'is-on' : ''}" data-action="info" data-id="${esc(id)}" aria-label="${esc(label)}" aria-expanded="${openInfo.has(id)}">i</button>`;
const infoText = (id, text) => (openInfo.has(id) ? `<p class="infotext small">${esc(text)}</p>` : '');
/** The same, for an explanation that needs markup (icons); `html` must already be escaped. */
const infoHtml = (id, html) => (openInfo.has(id) ? html : '');

/** Planning a side task: who goes, how likely it goes well, what it gives and costs. */
function renderSidePlan() {
  const t = sideTaskById(sidePlan.taskId);
  if (!t || !(state.sideBoard ?? []).includes(t.id)) { sidePlan = null; return renderJobs(); }
  const odds = sidePlan.crew.length ? sideOdds(state, t, sidePlan.crew) : null;
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Jobs</button>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(districtName(t.district))} · ${esc(PURPOSE[t.purpose])} · ${t.days} day${t.days > 1 ? 's' : ''} away · up to ${t.crew}</p>
      <p class="body">${esc(sidePitch(t))}</p>
      <div class="riskcard">
        <p><strong>If it goes well:</strong> ${esc(sideReward(t, Math.max(1, sidePlan.crew.length)))}.</p>
        <p><strong>If it goes badly:</strong> ${esc(sideCost(t))}.</p>
        <p class="muted small">One roll on ${esc(t.stat)}. Everyone sent learns a little ${esc(t.stat)}${t.purpose === 'training' ? ', more if it goes well' : ''}.</p>
      </div>
      <h2>Who goes (up to ${t.crew})</h2>
      <ul class="list">
        ${state.crew.filter((op) => !op.freelance).map((op) => {
          const a = availability(state, op);
          const on = sidePlan.crew.includes(op.id);
          return `
          <li>
            <button class="row pick ${on ? 'is-on' : ''}" data-action="toggle-side-crew" data-id="${esc(op.id)}" ${a.ok ? '' : 'disabled'} aria-pressed="${on}">
              <span class="pick__box">${on ? '✓' : ''}</span>
              ${face(op, 'sm')}
              <span class="row__main"><strong>${esc(op.handle)}</strong> <span class="muted">${esc(op.role)}</span><br><span class="small">${esc(statName(t.stat))} ${op.stats[t.stat]}</span></span>
              <span class="row__meta">${statusChip(a)}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>
    </section>
    <div class="planbar">
      <div class="planbar__read">
        ${odds ? riskBadge(odds.risk) : '<span class="risk risk--none">nobody yet</span>'}
        <span class="planbar__why">${esc(odds ? `${odds.op.handle} on ${t.stat} (${odds.value}${odds.notes.length ? ', ' + odds.notes.join(', ') : ''})` : `Pick up to ${t.crew}`)}</span>
      </div>
      <button class="btn btn--primary" data-action="send-side" ${sidePlan.crew.length ? '' : 'disabled'}>${sidePlan.crew.length ? `Send ${sidePlan.crew.length}` : 'Pick someone'}</button>
    </div>`;
}

const trustTone = (t) => (t >= 60 ? 'good' : t >= 40 ? 'mid' : 'bad');
const TRUST_NOTE = 'Finished jobs build trust; aborts and "client unhappy" choices cost it. High trust pays up to 15% more; below 20, a client stops calling. Trust drifts back towards neutral each week.';

/** Jobs tab: the clients as a strip of chips under the board. Full write-ups are on Lore. */
function renderClients() {
  return `
      <h2>Clients</h2>
      <div class="infoline"><p class="muted small">Where you stand with each.</p>${infoButton('clients', 'About client trust')}</div>
      ${infoText('clients', `${TRUST_NOTE} Who they are: the Lore tab.`)}
      <ul class="clientstrip">
        ${CLIENTS.map((c) => {
          const t = trustOf(state, c.id);
          return `<li class="clientchip"><strong>${esc(c.name)}</strong><span class="trust trust--${trustTone(t)}">${esc(trustLabel(t))} · ${t}</span></li>`;
        }).join('')}
      </ul>`;
}

/** Lore › Clients: who each client is, with where you stand. */
function renderClientCards() {
  return `
      <ul class="list list--plain">
        ${CLIENTS.map((c) => {
          const t = trustOf(state, c.id);
          return `<li class="clientrow"><span><strong>${esc(c.name)}</strong><br><span class="muted small">${esc(c.desc)}</span></span>
            <span class="trust trust--${trustTone(t)}">${esc(trustLabel(t))}<br><span class="small">${t}/100</span></span></li>`;
        }).join('')}
      </ul>
      <p class="muted small">${esc(TRUST_NOTE)}</p>`;
}

function renderPlan() {
  const job = state.jobs.find((j) => j.id === plan.jobId);
  if (!job) { plan = null; return renderJobs(); }
  const v = jobView(state, job);
  const t = v.tpl;
  const freelancers = state.freelancers ?? [];
  const people = [...state.crew, ...freelancers.map(freelancerAsCrew)];
  const picked = plan.crew.map((id) => people.find((o) => o.id === id)).filter(Boolean);
  const intel = intelFor(state, t.district);
  const wheelsOp = state.crew.find((o) => o.id === plan.wheels) ?? null;
  const owOp = state.crew.find((o) => o.id === plan.overwatch) ?? null;
  // The bar shows the worse of the two reads: the crises (risk read) and the incidents (coverage).
  // core/squad.js planRead is shared with the job board, so the card and this screen agree.
  const { level: toughest, read, cov } = planRead(state, job, { crew: picked, approach: plan.approach, overwatch: owOp, kit: plan.kit, wheels: wheelsOp });
  // What moved since the last change to the plan (2026-11-05): each encounter's risk and the bar's.
  // The read before the change is kept until the plan changes again, so a fold or a tap elsewhere
  // doesn't lose it; the flash only plays on the first draw after a change.
  const sig = JSON.stringify([plan.crew, plan.approach, plan.overwatch, plan.kit, plan.wheels]);
  const rowKey = (r) => `${r.id}:${r.zone}`;
  readFresh = false;
  if (readMemo?.jobId !== plan.jobId) readBefore = null;
  else if (readMemo.sig !== sig) { readBefore = readMemo; readFresh = true; }
  readMemo = { jobId: plan.jobId, sig, rows: new Map(cov.rows.map((r) => [rowKey(r), r.effective])), level: picked.length ? toughest : null };
  // Joss's reason, while the plan is still theirs (2026-11-05): what each runner covers on this job,
  // by the stat they handle the most encounters with (else their best key stat), then overwatch, the van.
  const jossLine = (() => {
    if (sig !== jossSig || !picked.length) return '';
    const R = PARTNER.pickReasons;
    const parts = picked.map((op) => {
      const handled = cov.rows.filter((x) => x.handler?.op.id === op.id).map((x) => x.handler.stat);
      const stat = handled.sort((a, b) => handled.filter((x) => x === b).length - handled.filter((x) => x === a).length)[0]
        ?? [...t.keyStats].sort((a, b) => ratedStat(op, b) - ratedStat(op, a))[0];
      return R[stat] ? R[stat].replace('{name}', op.handle) : '';
    }).filter(Boolean);
    const seen = new Set(); const uniq = parts.filter((x) => { const k = x.replace(/^\S+ /, ''); if (seen.has(k)) return false; seen.add(k); return true; });
    const out = [...uniq.slice(0, 3), owOp ? R.overwatch.replace('{name}', owOp.handle) : '', wheelsOp ? R.wheels.replace('{name}', wheelsOp.handle) : ''].filter(Boolean).slice(0, 3);
    return out.length ? `“${out.join(', ')}.”` : '';
  })();
  const was = readBefore && picked.length && readBefore.level ? { rows: readBefore.rows, level: readBefore.level, key: rowKey, fresh: readFresh } : null;
  // The bar's notes (2026-11-04: the crises card folded in here; 2026-11-05: always says what sets the
  // risk). Above low risk the first note names the weakest point: the encounter at the bar's level,
  // and, when the crises' skills read is at that level too, the stat they lean on. Then the skills
  // read's warnings. "Crew matches the job well" only at low risk.
  // Short enough to read on a phone (2026-11-05): "who stat value", no roll arithmetic (that's on
  // the cards and in the read), and no line that repeats the weakest point's person and stat.
  const short = (r) => r
    .replace(/^Weak on (\w+): best is (\S+) \((\d+).*$/, 'Weak on $1 · $2 $3')
    .replace(/^(\d+) extra on the crew: .*$/, '$1 extra: more backup, more at risk')
    .replace(/^Short-handed: (\d+) of (\d+), (.*)$/, 'Short-handed ($1 of $2): $3')
    .replace(/^No medic: .*$/, 'No medic for a bad wound')
    .replace(/^Watched: .*?(-\d+)$/, 'Watched: first crisis roll $1');
  const warnings = read.reasons.filter((r) => r !== 'Crew matches the job well').map(short);
  const notes = [];
  if (toughest !== 'low') {
    const row = cov.rows.find((x) => x.effective === toughest);
    if (row) notes.push(`Weakest: ${row.name} · ${row.handler ? `${row.handler.op.handle} ${row.handler.stat} ${row.handler.value}` : 'nobody can'}`);
    const w = read.weakest;
    if (read.level === toughest && w && !warnings.some((x) => x.startsWith(`Weak on ${w.stat}`))) notes.push(`Crises lean on ${w.stat} · ${w.op.handle} ${w.value}, about ${Math.round(w.chance * 100)}%`);
    // Drop "Weak on tech · Signal 9" when the weakest point already says "Signal tech 9".
    if (row?.handler) for (let i = warnings.length - 1; i >= 0; i--) if (warnings[i].startsWith(`Weak on ${row.handler.stat} · ${row.handler.op.handle} `)) warnings.splice(i, 1);
  }
  notes.push(...warnings);
  if (!notes.length) notes.push(toughest === 'low' ? 'Crew matches the job well' : 'Some rolls on this job are close calls');
  // What to try (2026-11-05): single changes that lower the risk, read the same way as the bar; if
  // none does, Joss's squad for this approach when it's better.
  planTryList = [];
  if (picked.length && toughest !== 'low') {
    const free = state.crew.filter((o) => !o.freelance && o.id !== plan.standby && availability(state, o).ok);
    planTryList = planTries(state, job, { crew: picked, approach: plan.approach, overwatch: owOp, kit: plan.kit, wheels: wheelsOp }, free);
    if (!planTryList.length) {
      const picks = leanPicks(state, job, plan.approach);
      const order = ['low', 'moderate', 'high', 'extreme'];
      if (order.indexOf(picks.level) < order.indexOf(toughest)) planTryList = [{ kind: 'joss', picks, level: picks.level }];
    }
  }
  const tryWord = (tr) => ({ approach: () => `switch to ${APPROACHES[tr.approach].name}`, swap: () => `${tr.op.handle} for ${tr.out.handle}`, add: () => `add ${tr.op.handle}`,
    overwatch: () => `${tr.op.handle} on overwatch`, wheels: () => `${tr.op.handle} at the wheel`, joss: () => "Joss's picks" }[tr.kind]());
  const most = maxCrew(t.crewSize);

  planBarHtml = `
    <div class="planbar">
      <div class="planbar__read">
        ${picked.length ? `<span class="planbar__level ${was && was.level !== toughest && was.fresh ? 'is-flash' : ''}">${riskBadge(toughest)}${was && was.level !== toughest ? `<span class="was was--${RANK.indexOf(toughest) < RANK.indexOf(was.level) ? 'better' : 'worse'}">was ${esc(riskWord(was.level))}</span>` : ''}</span>` : '<span class="risk risk--none">no crew yet</span>'}
        ${!picked.length ? `<span class="planbar__why">${esc(`Pick up to ${most}; ${t.crewSize} recommended`)}</span>`
          : notes.length === 1 && !planTryList.length ? `<span class="planbar__why">${esc(notes[0])}</span>`
          : (() => {
            // One line until asked (2026-11-05): the reason, then a tap for the rest and what to try.
            const more = [notes.length > 1 ? `+${notes.length - 1} more` : '', planTryList.length ? `${planTryList.length} to try` : ''].filter(Boolean).join(' · ');
            return `<button class="planbar__why planbar__why--more" data-action="plan-why" aria-expanded="${whyOpen}">${whyOpen ? `${notes.map((n) => `<span>${esc(n)}</span>`).join('')}<b>Hide ▴</b>` : `<span class="planbar__line">${esc(notes[0])}</span><b>${esc(more)} ▾</b>`}</button>`;
          })()}

      </div>
      ${(() => {
        const away = plan.mode !== 'live' && handsOffAllowed(t);
        return `<button class="btn btn--primary" data-action="${away ? 'send-job' : 'start-job'}" ${plan.crew.length ? '' : 'disabled'}>
        ${plan.crew.length ? `${away ? 'Send them' : 'Go live'} (${plan.crew.length + [plan.overwatch, plan.wheels, plan.standby].filter(Boolean).length})` : 'Pick a crew'}
      </button>`;
      })()}
      ${planTryList.length && whyOpen ? `<div class="planbar__tries"><span>Try</span>${planTryList.map((tr, i) => `<button class="trychip" data-action="plan-try" data-id="${i}">${esc(tryWord(tr))} <b>→ ${esc(riskWord(tr.level))}</b></button>`).join('')}</div>` : ''}
    </div>`;

  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Jobs</button>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(districtName(t.district))}${districtTurf(t.district)} · threat ${threatHtml(v)} · pays ${money(v.pay)} · crew away ${v.days}d · ${daysLeft(job.expiresDay)}</p>
      ${DISTRICTS[t.district] && briefOpen ? `<p class="muted small">${esc(DISTRICTS[t.district].pitch)}</p>` : ''}
      <p class="body ${briefOpen ? '' : 'brief--short'}">${esc(fillBrief(t))}</p>
      <button class="linkbtn" data-action="brief-more" aria-expanded="${briefOpen}">${briefOpen ? 'Show less' : 'Read more'}</button>
      ${(() => { const c = crewAgainstStandard(picked, v.threat); return `<p class="standard ${picked.length ? (c.met ? 'is-met' : 'is-short') : ''} small"><strong>Crew standard: ${esc(c.std.label)}</strong>${picked.length ? ` · ${esc(c.note)}` : ''}</p>`; })()}
      ${(() => { // a job against a gang says what it costs before you take it (shown risk equals used risk)
        const g = jobGrudge(t, v.threat);
        if (!g) return '';
        const now = grudgeOf(state, g.gang);
        return `<p class="grudgeline small"><strong>Against ${esc(GANGS[g.gang].name)}:</strong> finishing it adds grudge +${g.n} (now ${now}/10, then ${Math.min(GRUDGE.max, now + g.n)}). From ${GRUDGE.raidAt} they may raid a hall of ours on their turf.</p>`;
      })()}
      ${(() => { // a contact's opening favour says what it opens (core/halls.js)
        const d = openingFor(state, job.id);
        if (!d) return '';
        return `<p class="openingline small"><strong>A favour for ${esc(v.client?.name ?? 'a contact')}:</strong> finish it and ${esc(hallLabel(d))} is ours to take (${esc(HALL_SITES[d].place)}). Walk away, and they ask again in two weeks.</p>`;
      })()}
      <div class="plangrid">
      <div class="riskcard plangrid__client">
        <p><strong>Client:</strong> ${clientLine(v)}${v.client ? ` <button class="infobtn" data-action="client-info" aria-expanded="${clientOpen}" aria-label="About ${esc(v.client.name)}">${clientOpen ? '×' : 'i'}</button>` : ''}</p>
        ${v.client && clientOpen ? `<p class="muted small">${esc(v.client.desc)}</p>` : ''}
        ${v.threatDelta ? `<p class="muted small">Every roll on this job is ${Math.abs(v.threatDelta) === 1 ? 'one point' : `${Math.abs(v.threatDelta)} points`} ${v.threatDelta > 0 ? 'harder' : 'easier'} than usual.</p>` : ''}
        ${v.hinted ? '<p class="intel">Intel unreliable: something about this job may not be what you were told.</p>' : ''}
        ${namedHandle(v) ? `<p class="named">${esc(fillNamed(NAMED_TEXT.chip, v))} by name: ${esc(fillNamed(NAMED_TEXT.bonus, v))} (inside, outside or on standby). Without them it pays as usual.</p>` : ''}
        ${v.rumour ? `<p class="talk-tag">Street talk: ${esc(v.rumour.text)}</p>` : ''}
        ${intel ? `<p class="talk-tag">Intel from ${esc(intel.source)}: +${intel.bonus} on every roll here until day ${state.intel[t.district].until}.</p>` : ''}
      </div>

      <div class="plangrid__approach">
      <h2>Approach</h2>
      <div class="segmented segmented--grid">
        ${Object.entries(APPROACHES).map(([k, a]) => `
          <button class="seg ${plan.approach === k ? 'is-on' : ''}" data-action="approach" data-id="${k}" aria-pressed="${plan.approach === k}">
            <strong>${esc(a.name)}</strong><span>${esc(a.desc)}</span>
          </button>`).join('')}
      </div>
      </div>

      <div class="plangrid__crew">
      <h2>Squad</h2>
      ${(() => { const r = crewSizeRead(plan.crew.length, t.crewSize); return `<p class="sizebadge sizebadge--${r.level} ${r.penalty >= 2 ? 'is-severe' : ''}">${esc(r.text)}</p>`; })()}
      ${renderBoard(boardUi, { plan, tpl: t, people, crewSize: t.crewSize })}
      ${jossLine ? `<p class="jossline"><b>${esc(NAMES.partner)}:</b> ${esc(jossLine)}</p>` : ''}
      <p class="muted small">Tap a card to pick who goes. <button class="infobtn" data-action="board-rules" aria-expanded="${boardRulesOpen}" aria-label="How the squad works">${boardRulesOpen ? '×' : 'i'}</button></p>
      ${boardRulesOpen ? `<p class="muted small">Each person short of ${t.crewSize}: −1 on every roll. A second person within 3 of whoever rolls backs them up: +1.${freelancers.length ? ` Freelancers (up to ${MAX_FREELANCERS_PER_JOB}) take a share of the pay instead of a wage.` : ''}</p>` : ''}
      ${renderMentoring(picked)}
      </div>

      <div class="plangrid__risk">
      ${renderMeet(cov, owOp, was)}
      </div>

      <div class="plangrid__orders">
      ${renderCallIns(t, v.days)}
      </div>
      </div>
    </section>

    ${pickSlot ? renderPicker(boardUi, { plan, tpl: t, threat: v.threat, slot: pickSlot, people: pickerPeople(), freelancersFull: freelancersFull() }) : ''}`;
}

/** Helpers the squad board borrows (ui/board.js), so it looks like the rest of the game. */
const gearUi = { esc, money };
const boardUi = { esc, face: (op, size) => face(op, size), riskBadge: (l) => riskBadge(l), riskWord, statusChip: (a) => statusChip(a), keyStats: (op, tpl, threat) => keyStatsFor(op, tpl, threat) };

/** Everyone the picker can offer: the crew with their availability, and freelancers with their cut. */
function pickerPeople() {
  return [
    ...state.crew.map((op) => ({ op, status: availability(state, op), freelance: null })),
    ...(state.freelancers ?? []).map((f) => ({ op: freelancerAsCrew(f), status: { ok: true, reason: 'ready' }, freelance: { share: shareOf(f) } })),
  ];
}

/** Freelancers are capped per job; the slot being changed doesn't count if it already holds one. */
function freelancersFull() {
  const isF = (id) => (state.freelancers ?? []).some((f) => f.id === id);
  const here = pickSlot?.startsWith('in:') ? plan.crew[Number(pickSlot.split(':')[1])] : null;
  return plan.crew.filter((id) => isF(id) && id !== here).length >= MAX_FREELANCERS_PER_JOB;
}

/** When the crew calls you in, and how they decide when they don't (core/autorun.js ORDERS). */
function renderCallIns(t, days = t.days) {
  const orders = ORDERS[plan.orders] ? plan.orders : 'steady';
  const callIn = CALL_IN[plan.callIn] ? plan.callIn : 'risky';
  const lead = crewLead(plan.crew.map((id) => state.crew.find((o) => o.id === id)));
  const canSend = handsOffAllowed(t);
  const mode = canSend && plan.mode !== 'live' ? 'away' : 'live';
  const modes = { away: ['Send them', `They go and do it over ${days === 1 ? 'the day' : `${days} days`}. Today shows what they did; they call when it's beyond their orders.`], live: ['Watch live', 'You watch the whole job now, on the map.'] };
  // Folded to one line until tapped (2026-11-05): most players set these once and leave them.
  const summary = [canSend ? modes[mode][0] : 'Watch live (this one can\'t be sent off)', `call me in: ${CALL_IN[callIn].name.toLowerCase()}`, callIn === 'every' ? '' : `${ORDERS[orders].name.toLowerCase()} on their own`].filter(Boolean).join(' · ');
  const head = `<h2 class="foldh2"><button class="foldh2__btn" data-action="toggle-orders" aria-expanded="${ordersOpen}" aria-controls="plan-orders">
        <span>Orders</span><span class="foldh2__line" aria-hidden="true"></span><span class="foldh2__arrow" aria-hidden="true">▾</span></button></h2>`;
  if (!ordersOpen) {
    return `${head}
      <button class="orderline" data-action="toggle-orders" aria-expanded="false">${esc(summary)} <b>Change</b></button>
      ${lead && callIn === 'risky' ? `<p class="lead small"><strong>${esc(lead.handle)} leads</strong> (${esc(lead.fame)}): they take one risky call themselves before calling you.</p>` : ''}`;
  }
  return `${head}
      <div id="plan-orders">
      <h3 class="orders__h">How</h3>
      ${canSend ? `<div class="segmented">
        ${Object.entries(modes).map(([k, [name, desc]]) => `
          <button class="seg ${mode === k ? 'is-on' : ''}" data-action="mode" data-id="${k}" aria-pressed="${mode === k}"><strong>${esc(name)}</strong><span>${esc(desc)}</span></button>`).join('')}
      </div>` : '<p class="muted small">This job can\'t be sent off on its own: you\'ll watch this one.</p>'}
      <h3 class="orders__h">Call me in…</h3>
      <div class="segmented">
        ${Object.entries(CALL_IN).map(([k, c]) => `
          <button class="seg ${callIn === k ? 'is-on' : ''}" data-action="callin" data-id="${k}" aria-pressed="${callIn === k}"><strong>${esc(c.name)}</strong><span>${esc(c.desc)}</span></button>`).join('')}
      </div>
      ${lead && callIn === 'risky' ? `<p class="lead small"><strong>${esc(lead.handle)} leads</strong> (${esc(lead.fame)}): they take one risky call themselves before calling you.</p>` : ''}
      ${callIn === 'every' ? '' : `
      <h3 class="orders__h">When they decide themselves</h3>
      <p class="muted small">Their orders decide each call they don't bring to you. They never push on with a critical wound: at worst, they pull out.</p>
      <div class="segmented">
        ${Object.entries(ORDERS).map(([k, o]) => `
          <button class="seg ${orders === k ? 'is-on' : ''}" data-action="orders" data-id="${k}" aria-pressed="${orders === k}">
            <strong>${esc(o.name)}</strong><span>${esc(o.desc)}</span>
          </button>`).join('')}
      </div>`}
      </div>`;
}

// --- mission -----------------------------------------------------------
function choiceButton(c, action) {
  return `
    <button class="choice" data-action="${action}" data-id="${esc(c.id)}" ${c.available ? '' : 'disabled'}>
      <span class="choice__label">${esc(c.label)}</span>
      ${c.available
        ? `<span class="choice__meta">${riskBadge(c.risk)} ${esc(c.riskReason ?? '')}${c.cost ? ` <span class="choice__cost">Cost: ${esc(c.cost)}</span>` : ''}</span>`
        : `<span class="choice__meta muted">${esc(c.reason)}</span>`}
    </button>`;
}

/** Stable pick from a list of lines, so the same rise always reads the same. */
function pickLine(lines, key) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return lines[h % lines.length];
}

/** Level-up cards for a job report: one per operative who improved, a bigger one for graduations. */
function levelUpCards(r) {
  const growth = r.growth ?? [];
  if (growth.some((g) => typeof g === 'string')) return `<p>Improved: ${esc(growth.join(', '))}</p>`; // reports from older saves
  const opFor = (id, fallback) => state.crew.find((o) => o.id === id) ?? fallback;
  const grads = (r.graduated ?? []).map((g) => {
    const op = opFor(g.id, g);
    return `
      <div class="levelcard levelcard--grad">
        ${face(op, 'lg')}
        <div>
          <p class="levelcard__kicker">★ Graduated</p>
          <p class="levelcard__title">${esc(op.handle)}: rookie → pro</p>
          <p class="levelcard__line">${esc(pickLine(GRADUATION_LINES, op.id).replace('{name}', op.handle))}</p>
        </div>
      </div>`;
  }).join('');
  const byOp = new Map();
  for (const g of growth) byOp.set(g.opId, [...(byOp.get(g.opId) ?? []), g]);
  const cards = [...byOp].map(([id, rises]) => {
    const op = opFor(id, { id, name: rises[0].handle, handle: rises[0].handle });
    const rows = rises.map((g) => `
          <li><span class="levelcard__stat">▲ ${esc(statName(g.stat))} ${g.from} → ${g.to}</span>
          <span class="levelcard__line">${esc(pickLine(GROWTH_LINES[g.stat] ?? ['{name} is improving.'], `${id}${g.stat}${g.to}`).replace('{name}', op.handle))}</span></li>`).join('');
    return `
      <div class="levelcard">
        ${face(op)}
        <div><p class="levelcard__title">${esc(op.handle)}</p><ul class="levelcard__rows">${rows}</ul></div>
      </div>`;
  }).join('');
  return grads || cards ? `<div class="levelcards">${grads}${cards}</div>` : '';
}

function renderMission() {
  const am = state.activeMission;
  const t = templateById(am.templateId);
  const crewNames = am.crewIds.map((id) => state.crew.find((o) => o.id === id) ?? state.memorial.find((o) => o.id === id)).filter(Boolean).map((o) => o.handle).join(', ');
  const ow = am.overwatch ? state.crew.find((o) => o.id === am.overwatch.id) : null;
  let result = '';
  if (am.done) {
    const r = am.result;
    const title = r.outcome === 'loss' ? 'Someone didn\'t come home' : r.outcome === 'aborted' ? 'Job aborted' : 'Job done';
    result = `
      <div class="resultcard resultcard--${esc(r.outcome)}">
        <h2>${esc(title)}</h2>
        <p>Paid ${money(r.pay)} · Heat +${r.heatGain}</p>
        ${r.injuries.length ? `<p>Injured: ${esc(r.injuries.join(', '))}</p>` : '<p>Nobody hurt.</p>'}
        ${r.deaths.length ? `<p><strong>Lost: ${esc(r.deaths.join(', '))}.</strong> Their names go on the wall.</p>` : ''}
        ${levelUpCards(r)}
        ${(r.freelance ?? []).map((f) => `<p class="muted">Freelancer ${esc(f.handle)} took ${money(f.cut)}.</p>`).join('')}
        ${r.client && r.trustChange ? `<p>${esc(r.client)}: trust ${r.trustChange > 0 ? '+' : ''}${r.trustChange}</p>` : ''}
        <button class="btn btn--primary btn--block" data-action="close-mission">Back to the safehouse</button>
      </div>`;
  }
  return `
    <section class="panel mission">
      <p class="muted small">${am.away ? `${am.away.command ? 'Under your command' : `Away · day ${am.away.day ?? 1} of ${am.days ?? t.days}`}` : 'On the job'} · ${esc(APPROACHES[am.approach]?.name ?? '')} approach · ${esc(crewNames)}${ow ? ` · ${esc(ow.handle)} on overwatch (${esc(OVERWATCH_KIT[am.overwatch.kit].name.toLowerCase())})` : ''}${outsider(am.wheels, 'at the wheel')}${am.standby && !am.standby.joined ? outsider(am.standby.id, 'on standby') : ''}</p>
      <h1>${esc(t.name)}</h1>
      ${renderWatch(watchUi, state, result)}
    </section>`;
}

/** " · Hotwire at the wheel" for someone outside the inside team, or nothing. */
const outsider = (id, what) => { const op = id ? state.crew.find((o) => o.id === id) : null; return op ? ` · ${esc(op.handle)} ${what}` : ''; };

/** The card for whatever the crew is calling you in for, if anything (shown inline in the watch feed). */
/** Everyone's health at a fight's call-in: the crew, then the guards still up. */
function fightHealth({ runners, guards }) {
  const chip = (cls, text) => `<span class="wf-chip ${cls}">${esc(text)}</span>`;
  return `<p class="wf-hp wf-hp--callin" aria-label="Health">${runners.map((r) => chip(r.down ? 'is-down' : r.hp < r.max * 0.25 ? 'is-crit' : r.hp < r.max * 0.5 ? 'is-low' : '', `${r.handle} ${r.down ? 'down' : `${r.hp}/${r.max}`}`)).join('')}${guards.filter((g) => !g.out).map((g) => chip('wf-chip--guard', `Guard ${g.n} ${g.hp}/${g.max}`)).join('')}</p>`;
}

function renderCallIn(s) {
  const am = s.activeMission;
  if (dayDone(am)) {
    const days = am.days ?? templateById(am.templateId).days;
    return `
      <div class="crisis" data-callin="day-done">
        <p class="crisis__title">That's day ${am.away.day ?? 1} of ${days} done</p>
        <p>They'll pick it up again tomorrow, and call if they need us. Or stay on the line with them and play the rest now.</p>
        <div class="stack">
          <button class="btn btn--primary" data-action="let-run">Let them carry on</button>
          <button class="btn btn--ghost" data-action="take-command">Take command: play the rest now</button>
        </div>
      </div>`;
  }
  if (am.critical) {
    const v = describeCritical(s);
    return `
      <div class="crisis crisis--critical">
        <p class="crisis__title">${esc(v.op.handle)} is critical</p>
        <p>${v.stabiliseFailed ? 'Stabilising failed. You have to decide now.' : `${esc(v.op.name)} is bleeding out. What do you do?`}</p>
        <div class="choices">${v.choices.map((c) => choiceButton(c, 'critical')).join('')}</div>
      </div>`;
  }
  if (am.pending) {
    const v = describePending(s);
    return `
      <div class="crisis">
        <p class="crisis__title">${v.kind === 'alert' ? 'The crew is calling in: you\'ve been spotted' : v.kind === 'door' ? 'The crew is calling in: someone is at death\'s door' : v.kind === 'standoff' ? 'The crew is calling in: the guards are still standing' : 'The crew is calling in: someone is down'}</p>
        <p>${esc(v.text)}</p>
        ${v.fight ? fightHealth(v.fight) : ''}
        <div class="choices">${v.choices.map((c) => choiceButton({ ...c, risk: c.exit ? 'safe' : c.push ? 'extreme' : 'moderate', riskReason: c.cost, cost: '' }, 'pending')).join('')}</div>
      </div>`;
  }
  if (am.battle && currentStep(am)?.type === 'battle' && needsPlayer(s)) return renderFightOrders(s, esc, (id) => { const op = s.crew.find((o) => o.id === id); return op ? face(op, 'sm') : ''; });
  if (currentStep(am)?.type === 'crisis' && needsPlayer(s)) {
    const v = describeCrisis(s);
    return `
      <div class="crisis">
        <p class="crisis__title">The crew is calling in</p>
        <p>${esc(v.text)}</p>
        <div class="choices">${v.choices.map((c) => choiceButton(c, 'choose')).join('')}</div>
      </div>`;
  }
  return '';
}

/** What the watch screen borrows from here (ui/watch.js). */
const watchUi = {
  esc,
  callIn: (s) => renderCallIn(s),
  brief: (s) => fillBrief(templateById(s.activeMission.templateId)),
  dice: (r) => `
        <details class="flog__roll">
          <summary>Dice</summary>
          <p class="small">Die ${r.die} + ${esc(r.stat)} ${r.value} = ${r.die + r.value} · needed ${r.need}${r.notes?.length ? `<br><span class="muted">${esc(r.stat)} ${r.value}: ${esc(r.notes.join(', '))}</span>` : ''}</p>
        </details>`,
};

// --- save --------------------------------------------------------------
const DIFFICULTIES = {
  story: { name: 'Story', desc: 'Nobody dies. Critical operatives always pull through.' },
  standard: { name: 'Standard', desc: 'Death only if you choose "push on". Backups can be restored.' },
  ironman: { name: 'Ironman', desc: 'As Standard, but no going back: no backups to restore, and older save files are refused.' },
};

// --- city --------------------------------------------------------------

const cityName = (key) => NAMES.districts[key] ?? NAMES.lockedDistricts?.[key] ?? key;

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

const turfHex = (key) => { const f = DISTRICTS[key]?.faction; return f ? TURF_HEX[TURF_TONE[f]] : null; };

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
      key, locked: card.locked, selected: cityDistrict === key, jobs, out, home, hall, talk: talk === key, heat: card.locked ? 0 : heatIn(state, key),
      raid: raidOn(state, key) && raidOn(state, key).answer !== 'paid' ? (raidOn(state, key).called ? 'NOW' : calendar(raidOn(state, key)?.day).weekday.slice(0, 3).toUpperCase()) : null, // a raid ring (core/raids.js)
      name: cityName(key).replace(/^The /, ''),
      crews: card.locked ? [] : crewsOnMap(key), // face tokens on the map
      based: hallIn(state, key) ? residents(state, key).length : null, // ⌂ n here on the plate
      turf: card.locked ? null : turfHex(key),
      label: [cityName(key), card.locked ? 'locked' : `${jobs || 'no'} job${jobs === 1 ? '' : 's'} on the board`, faction && `${faction} turf`,
        home && 'the home hall is here', hall && 'a hall of ours is here', raidOn(state, key) && 'a raid is coming', heatIn(state, key) > 0 && `heat ${heatIn(state, key)} of 10`, out && `${out} of yours out here`, talk === key && 'street talk about it'].filter(Boolean).join(', '),
    };
  });
  return cityMapSvg(districts, esc, { portrait }) + cityMapLegend();
}

/**
 * The command centre's list (2026-11-05): everyone out, calls first, then side work. Everything can
 * be done from here without the map; picking a district (on the map or a crew's district) narrows it.
 */
function renderOps() {
  const f = cityDistrict;
  const jobs = crewsOut(state).filter((c) => !f || c.district === f).sort((a, b) => b.waiting - a.waiting);
  const side = sideTasksOut(state).filter((t) => !f || t.district === f);
  const raids = openRaids(state).filter((r) => !f || r.district === f);
  const any = crewsOut(state).length + sideTasksOut(state).length + openRaids(state).length;
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
  return `
    <div class="ops">
      <div class="ops__head">
        <h2>Out now</h2>
        ${f ? `<button class="linkbtn" data-action="city-district" data-id="${esc(f)}">${esc(cityName(f))} only · show all</button>` : ''}
      </div>
      ${jobs.length || side.length || raids.length ? `${renderRaids(raids)}${renderCrewsOut(jobs)}${sideList}`
        : `<p class="muted small">${any ? `Nobody of ours is out in ${esc(cityName(f))}.` : 'Nobody is out. Crews you send away are followed here, day by day.'}</p>
           ${any ? '' : '<button class="btn" data-action="nav" data-id="jobs">Find work</button>'}`}
    </div>`;
}

/** The city tonight, beside the map on wide screens and under it on phones. */
function citySummary() {
  const talk = activeRumour(state)?.district;
  const open = MAP_DISTRICTS.filter((k) => !DISTRICT_CARDS[k].locked);
  const rows = open.map((k) => {
    const n = jobsIn(k).length;
    return `<li><button class="cityrow ${cityDistrict === k ? 'is-on' : ''}" data-action="city-district" data-id="${k}" aria-pressed="${cityDistrict === k}">
      <span class="cityrow__tab" style="background:${turfHex(k) ?? 'var(--line)'}"></span>
      <span class="cityrow__name">${esc(cityName(k).replace(/^The /, ''))}<span class="muted small"> · ${esc(DISTRICTS[k]?.faction ?? '')}</span></span>
      <span class="cityrow__meta">${talk === k ? '<span class="cityrow__talk">Talk</span>' : ''}${crewOutIn(k) ? `<span class="cityrow__out">${crewOutIn(k)} out</span>` : ''}${n ? `<b>${n}</b> job${n === 1 ? '' : 's'}` : '<span class="muted">—</span>'}</span>
    </button></li>`;
  }).join('');
  // Your people at home, hall by hall: who's in, who's hurt (the ones out are in the list above).
  const outIds = new Set([...(state.awayJobs ?? []).flatMap((j) => j.mission.crewIds), ...sideTasksOut(state).flatMap((t) => t.crewIds)]);
  const halls = (state.halls ?? []).map((h) => {
    const who = residents(state, h.district).filter((o) => !outIds.has(o.id));
    const hurt = who.filter((o) => o.condition?.injury && o.condition.injury !== 'healthy').length;
    return `${who.length} in ${cityName(h.district)}${hurt ? ` (${hurt} hurt)` : ''}`;
  });
  return `
    <h2>The city tonight</h2>
    <ul class="list list--plain cityrows">${rows}</ul>
    <p class="muted small">${(() => { const hot = HEAT_DISTRICTS.filter((d) => heatIn(state, d) > 0).sort((a, b) => heatIn(state, b) - heatIn(state, a)); return hot.length ? `Heat: ${hot.map((d) => `${esc(districtName(d))} ${heatIn(state, d)}/10`).join(' · ')}.` : 'No heat anywhere.'; })()}</p>
    <h2>At home</h2>
    <p class="small">${esc(halls.join(' · '))}${outIds.size ? ` · ${outIds.size} out` : ''}.</p>
    <h2>Places</h2>
    <div class="cityplaces">
      <button class="btn cityplace" data-action="nav" data-id="crew">Halls<span class="muted small">On Crew</span></button>
      <button class="btn cityplace" disabled>Bar · black market<span class="muted small">Later</span></button>
    </div>`;
}

function districtCard(key) {
  const c = DISTRICT_CARDS[key];
  const turf = DISTRICTS[key]?.turf;
  const jobs = MISSIONS.filter((m) => m.district === key).map((m) => m.name);
  const out = crewOutIn(key);
  return `
    <div class="riskcard citycard" style="--turf:${turfHex(key) ?? 'var(--line)'}">
      <h2 class="nomargin">${esc(cityName(key))} <span class="muted">${esc(c.chinese)}</span></h2>
      <p class="muted small">${esc(c.side)}${turf ? ` · <span class="citycard__turf">${esc(turf)}</span>` : ''}${key === SAFEHOUSE_DISTRICT ? ' · our home hall' : hallIn(state, key) ? ' · a hall of ours' : ''}${out ? ` · ${out} of yours out here` : ''}${heatIn(state, key) ? ` · heat ${heatIn(state, key)}/10` : ''}</p>
      <p class="body">${esc(c.pitch)}</p>
      ${c.locked ? '' : gangsOn(key).map((g) => `<p class="small citycard__grudge">${esc(GANGS[g].short)} grudge: ${grudgeGauge(g)}${hallIn(state, key) ? ` <span class="muted">· from ${GRUDGE.raidAt} they may raid our hall here</span>` : ''}</p>`).join('')}
      ${(() => {
        const h = hallIn(state, key);
        if (!h) return '';
        const who = residents(state, key);
        const raid = raidOn(state, key);
        return `<div class="citycard__hall"><p class="small"><strong>Our hall</strong> · ${who.length}/${bedsOf(h)} beds · level ${h.level}${hallShut(state, key) ? ` · <span class="citycard__shut">shut after a raid until day ${h.shutUntil}</span>` : ''}${raid ? ` · <span class="citycard__raid">raid ${esc(raidWhen(raid))}${raid.answer === 'paid' ? ', paid off' : ''}</span>` : ''}</p>
          ${who.length ? `<span class="citycard__faces">${who.map((op) => { const away = !!op.condition?.awayUntil && op.condition.awayUntil > state.day; return `<button class="citycard__face ${away ? 'is-out' : ''}" data-action="op-link" data-id="${esc(op.id)}" aria-label="${esc(op.handle)}${away ? ', out' : ''}">${face(op, 'sm')}</button>`; }).join('')}</span>` : '<p class="muted small">Nobody lives here yet.</p>'}</div>`;
      })()}
      ${c.locked ? `<p class="intel">${esc(c.teaser)}</p>` : (() => {
        const now = jobsIn(key);
        return now.length ? `<div class="stack">${now.map(({ j, v }) => `<button class="btn" data-action="open-job" data-id="${esc(j.id)}">${esc(v.tpl.name)} · ${money(v.pay)} · ${daysLeft(j.expiresDay)}</button>`).join('')}</div>`
          : jobs.length ? `<p class="small muted">No work on the board here right now. New work comes in through the week.</p>`
            : '<p class="small muted">Nobody here is hiring crews like yours yet.</p>';
      })()}
      ${activeRumour(state)?.district === key ? `<p class="talk-tag">Street talk: ${esc(activeRumour(state).text)}</p>` : ''}
      <button class="linkbtn citycard__about" data-action="about-district" data-id="${esc(key)}">About ${esc(NAMES.districtsInText?.[key] ?? cityName(key))} on Lore ›</button>
    </div>`;
}

/**
 * Lore › Districts (2026-11-06, when Ops became its own tab and City became Lore): the city's places as a book, each
 * led by its picture (ui/districtArt.js), with the write-up a tap away. Locked districts are a
 * line each, with what the street says about them.
 */
function renderDistrictLore() {
  // Home first, then the rest as the map lists them.
  const open = MAP_DISTRICTS.filter((k) => !DISTRICT_CARDS[k].locked).sort((a, b) => (b === SAFEHOUSE_DISTRICT) - (a === SAFEHOUSE_DISTRICT));
  const locked = MAP_DISTRICTS.filter((k) => DISTRICT_CARDS[k].locked);
  const entry = (key) => {
    const c = DISTRICT_CARDS[key];
    const on = loreDistrict === key;
    const turf = DISTRICTS[key]?.turf;
    const jobs = MISSIONS.filter((m) => m.district === key && !m.opening).map((m) => m.name);
    const art = districtArt(key);
    return `
    <li class="lorecard ${on ? 'is-open' : ''}" style="--turf:${turfHex(key) ?? 'var(--line)'}">
      <button class="lorecard__head" data-action="lore-district" data-id="${esc(key)}" aria-expanded="${on}">
        ${art ? `<span class="lorecard__art" aria-hidden="true">${art}</span>` : ''}
        <span class="lorecard__title"><strong>${esc(cityName(key))}</strong> <span class="muted">${esc(c.chinese)}</span></span>
        <span class="muted small lorecard__side">${esc(c.side)}${turf ? ` · <span class="citycard__turf">${esc(turf)}</span>` : ''}</span>
        <span class="body lorecard__pitch">${esc(c.pitch)}</span>
        ${c.locked ? `<span class="intel lorecard__teaser">${esc(c.teaser)}</span>` : ''}
        <span class="lorecard__more small">${on ? 'Less ▴' : 'Read more ▾'}</span>
      </button>
      ${on ? `<div class="lorecard__body">
        <p class="small"><strong>Who runs it:</strong> ${esc(c.control)}</p>
        <p class="small"><strong>Police:</strong> ${esc(c.police)}</p>
        <p class="small"><strong>At 3am:</strong> ${esc(c.night)}</p>
        <p class="small"><strong>Local custom:</strong> ${esc(c.custom)}</p>
        <p class="small"><strong>Landmarks:</strong></p>
        <ul class="small">${c.landmarks.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
        ${jobs.length ? `<p class="small"><strong>Kinds of work here:</strong> ${esc(jobs.join(', '))}</p>` : ''}
        ${c.locked ? '' : `<button class="linkbtn" data-action="ops-district" data-id="${esc(key)}">See it on Ops ›</button>`}
      </div>` : ''}
    </li>`;
  };
  return `
    <ul class="lorecards">${open.map(entry).join('')}</ul>
    <h2>Not open to us yet</h2>
    <ul class="lorecards">${locked.map(entry).join('')}</ul>`;
}

/**
 * Ops, the command centre (2026-11-05; its own tab 2026-11-06, owner: City "more seems like
 * lore"): the map, the picked district's card, everyone out, and the city tonight.
 */
function renderOpsScreen() {
  return `
    <section class="panel">
      <h1 class="cityhead">Ops <span class="muted small">${esc(NAMES.city)} tonight</span></h1>
      <div class="cols2 cols2--map">
        <div>${cityMap()}</div>
        <div>${cityDistrict ? districtCard(cityDistrict) : ''}${renderOps()}${citySummary()}</div>
      </div>
    </section>`;
}

/** Lore's sections: the city as a book (the live map is on Ops). The tab was City until 2026-11-06. */
const LORE_TABS = { districts: 'Districts', clients: 'Clients', factions: "Who's who", history: 'History' };

function renderLore() {
  const tab = LORE_TABS[cityTab] ? cityTab : 'districts';
  const groups = [...new Set(FACTIONS.map((f) => f.group))];
  const body = {
    districts: renderDistrictLore,
    clients: () => renderClientCards(),
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
      <h1 class="cityhead">${esc(NAMES.city)} <span class="muted">燈籠灣</span> <span class="muted small">2057</span></h1>
      <div class="subtabs" role="group" aria-label="Lore sections">
        ${Object.entries(LORE_TABS).map(([k, label]) => `<button class="subtab ${k === tab ? 'is-on' : ''}" data-action="city-tab" data-id="${k}" aria-pressed="${k === tab}">${esc(label)}</button>`).join('')}
      </div>
      ${body}
    </section>`;
}

/** The plan's coverage read under a heading that folds it away (owner, 2026-10-29: useful but
 *  not essential, and long on a phone). Folded by default on phones, open on wider screens; the
 *  choice holds for the session. Folded, the heading still flags any gap nobody can cover. */
function renderMeet(cov, owOp, was = null) {
  if (meetHidden === null) meetHidden = !matchMedia('(min-width: 900px)').matches;
  const gaps = cov.rows.filter((r) => r.gap).length;
  // Folded, the heading still says how many encounters changed with the last change to the plan.
  const moved = was ? cov.rows.filter((r) => was.rows.has(was.key(r)) && was.rows.get(was.key(r)) !== r.effective).length : 0;
  const peek = meetHidden && (gaps || moved) ? `<span class="foldh2__peek">${[gaps ? `${gaps} ${gaps === 1 ? 'gap' : 'gaps'}` : '', moved ? `${moved} changed` : ''].filter(Boolean).join(' · ')}</span>` : '';
  return `<h2 id="risk-read" class="foldh2"><button class="foldh2__btn" data-action="toggle-meet" aria-expanded="${!meetHidden}" aria-controls="meet-read">
        <span>What they'll likely meet</span>${peek}<span class="foldh2__line" aria-hidden="true"></span><span class="foldh2__arrow" aria-hidden="true">▾</span></button></h2>
      <div id="meet-read" ${meetHidden ? 'hidden' : ''}>${meetHidden ? '' : renderCoverage(boardUi, cov, { overwatch: owOp, approachName: APPROACHES[plan.approach].name, standby: state.crew.find((o) => o.id === plan.standby) ?? null, was })}</div>`;
}

/** A save that couldn't be opened, kept aside for slot n: what happened and the way back. */
function keptCard(n) {
  const kept = unreadableSave(n);
  if (!kept) return '';
  return `
      <div class="riskcard riskcard--kept">
        <p><strong>A saved game in slot ${n}${kept.day ? ` (day ${kept.day})` : ''} couldn't be opened.</strong> It's kept safe, apart from the game in the slot now.</p>
        <p class="muted small">${kept.newer ? 'It was saved by a newer version of the game than this one. Reload the page to update, then restore it.' : esc(kept.reason)}</p>
        <div class="kept__actions">
          <button class="btn btn--primary" data-action="kept-restore" data-id="${n}">Restore it</button>
          <button class="btn" data-action="kept-export" data-id="${n}">Download it</button>
          <button class="btn btn--danger" data-action="kept-discard" data-id="${n}">Throw away</button>
        </div>
      </div>`;
}

// Traits as chips (owner, 2026-11-03): an icon and a name in a wrapping row; tap one and its card
// opens under the row (tap again, or another, to close). Tap, not hover: iOS rule in CLAUDE.md.
const bornChip = (t) => ({ key: `t:${t}`, icon: TRAITS[t]?.icon, name: TRAITS[t]?.name ?? t, desc: TRAITS[t]?.desc ?? '', kind: 'born' });

/** One row of trait chips for a runner's (or a lead's) page, and the open chip's card. */
function traitChips(pageId, items) {
  if (!items.length) return '<p class="muted small">None.</p>';
  const open = items.find((it) => traitTip === `${pageId}|${it.key}`);
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
  const open = list.find((x) => traitTip === `${op.id}|s:${x.mate.id}`);
  return `<h2>Synergies</h2>
      <ul class="synergies">${list.map(({ mate }) => {
        const on = mate === open?.mate;
        return `<li><button class="synergy${on ? ' is-open' : ''}" data-action="trait-tip" data-id="${esc(`${op.id}|s:${mate.id}`)}" aria-expanded="${on}" aria-label="Synergy with ${esc(mate.handle)}">${face(mate, 'sm')}<span>${esc(mate.handle)}</span></button></li>`;
      }).join('')}</ul>
      ${open ? `<div class="tipcard" role="note"><strong>Synergy with ${esc(open.mate.handle)}</strong><p>${esc(earnedText(state, open.e))}</p><p class="muted small">${open.mate.cause ? `${esc(open.mate.handle)} is gone. ` : ''}For good · since day ${open.e.day}</p>${open.mate.cause ? '' : `<button class="btn btn--ghost" data-action="open-op" data-id="${esc(open.mate.id)}">${esc(open.mate.handle)}'s page →</button>`}</div>` : ''}`;
}

function renderSettings() {
  const slots = listSlots();
  const active = getActiveSlot();
  const backup = state.difficulty === 'ironman' ? null : loadBackup();
  const lastExport = state.lastBackupDay ? `day ${state.lastBackupDay} (${state.day - state.lastBackupDay} days ago)` : 'never';

  const picker = newGameSlot ? `
      <div class="riskcard">
        <h2 class="nomargin">New game in slot ${newGameSlot}</h2>
        <p class="muted small">Five nobodies off the street, one of each role. Pick a difficulty to start.</p>
        <div class="segmented">
          ${Object.entries(DIFFICULTIES).map(([k, d]) => `
            <button class="seg" data-action="difficulty" data-id="${k}"><strong>${esc(d.name)}</strong><span>${esc(d.desc)}</span></button>`).join('')}
        </div>
        <button class="btn btn--ghost" data-action="cancel-new">Cancel</button>
      </div>` : '';

  return `
    <section class="panel">
      <h1>Save</h1>
      <p class="body">The game saves automatically after every action, in this browser only.</p>
      ${Array.from({ length: SLOT_COUNT }, (_, i) => keptCard(i + 1)).join('')}

      <div class="cols2">
      <div>
      <h2>Slots</h2>
      <ul class="list">
        ${slots.map((sl) => `
          <li class="slot ${sl.slot === active ? 'is-active' : ''}">
            <div class="slot__info">
              <strong>Slot ${sl.slot}${sl.slot === active ? ' · playing' : ''}</strong>
              <span class="muted small">${sl.empty ? 'Empty' : `${esc(DIFFICULTIES[sl.difficulty]?.name ?? sl.difficulty)} · day ${sl.day} · ${money(sl.cash)} · ${sl.crew} crew`}</span>
            </div>
            <div class="slot__actions">
              ${!sl.empty && sl.slot !== active ? `<button class="btn" data-action="slot-load" data-id="${sl.slot}">Play</button>` : ''}
              <button class="btn" data-action="slot-new" data-id="${sl.slot}">New</button>
              ${!sl.empty && sl.slot !== active ? `<button class="btn btn--danger" data-action="slot-delete" data-id="${sl.slot}">Delete</button>` : ''}
            </div>
          </li>`).join('')}
      </ul>
      ${picker}
      </div>

      <div>
      <h2>Backups</h2>
      <div class="riskcard">
        <p>Last exported: <strong>${lastExport}</strong>.${backupDue(state) ? ' <span class="warntext">Time for a backup.</span>' : ''}</p>
        <p class="muted small">Browsers can clear stored data, especially Safari on iPhone after about a week away. An exported file is the only safe copy.</p>
        <button class="btn btn--block" data-action="export">Export save file</button>
        <button class="btn btn--block" data-action="import">Load save file into this slot</button>
      </div>
      ${state.difficulty === 'ironman'
        ? '<p class="muted small">Ironman: no automatic backups, and older copies of this run are refused.</p>'
        : backup ? `
      <div class="riskcard">
        <p>Automatic backup: <strong>day ${backup.day}</strong> (taken at the start of each in-game week).</p>
        <button class="btn btn--block" data-action="restore-backup" ${backup.day === state.day ? 'disabled' : ''}>Restore backup from day ${backup.day}</button>
      </div>` : ''}
      </div>
      </div>

      <p class="muted small">Playing: ${esc(DIFFICULTIES[state.difficulty]?.name ?? state.difficulty)} · Save format v${state.version} · ${SLOT_COUNT} slots</p>
    </section>`;
}
