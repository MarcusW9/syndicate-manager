// The watch feed (PLAN-CORE-LOOP.md, slice 2): a run's recorded events (am.events) as the cards
// the watch screen shows, in order. Pure: one card per moment, a short headline you can follow at
// a glance and the detail under it, plus a cue for the site plan's animation. The report's full
// log reads the same events.
//
// Items: { type: 'phase', zone, title } | { type: 'beat', text } | { type: 'note', text, tone }
//      | { type: 'card', kind, label, setup, results: [{ headline, detail, tone, roll, why }], cue }
// A fight (slice 6) is a card per round, with HP in its setup line and in `hp` (the summary's
// chips); its cue (battle) says what to play on the plan (ui/siteplan.js fight()).

import { ZONES } from '../data/incidents.js';
import { incidentById } from './incidents.js';

const roll = (e) => (e.die == null ? null : { die: e.die, value: e.value, need: e.need, stat: e.stat, notes: e.notes ?? [] });
const tone = (e) => (e.success === false ? 'bad' : 'good');

function injuryLine(e) {
  const i = e.injury;
  if (!i) return null;
  return i.severity === 'serious'
    ? { headline: `${i.handle} is badly hurt and out`, detail: 'Weeks in the clinic, at least.', tone: 'bad' }
    : { headline: `${i.handle} is hurt`, detail: `A ${i.severity} injury.`, tone: 'bad' };
}

/** Feed items for a run's events. kit: the overwatch kit on this run, for the map cue. */
export function feedItems(events = [], { kit = null } = {}) {
  const items = [];
  let open = null; // { card, event }: the incident card its saves (and then any injury) attach to
  // An incident's injury lands after its saves; its event is filled in as the run goes on.
  const close = () => {
    const hurt = open && injuryLine(open.event);
    if (hurt) { open.card.results.push(hurt); open.card.cue.hurt = open.event.injury.severity; }
    open = null;
  };
  for (const e of events) {
    if (e.kind === 'save' && open) {
      open.card.results.push({ headline: e.choice, detail: e.report, tone: e.success ? 'save' : 'bad', roll: roll(e), why: e.why ?? null });
      if (e.via !== 'patch') open.card.cue.save = { via: e.via, kit: e.kit ?? kit, success: e.success, by: e.actor?.id ?? null };
      continue;
    }
    close();
    if (e.kind === 'zone') items.push({ type: 'phase', zone: e.zone, title: e.text });
    else if (e.kind === 'beat') items.push({ type: 'beat', text: e.text });
    else if (e.kind === 'twist') items.push({ type: 'note', text: `Twist: ${e.text}`, tone: 'warn' });
    else if (e.kind === 'aftermath') items.push({ type: 'note', text: e.text, tone: e.death ? 'bad' : 'good' });
    else if (e.kind === 'roll' && e.incident) {
      const inc = incidentById(e.incident);
      const card = {
        type: 'card', kind: 'incident', label: `${inc?.name ?? 'Incident'} · ${(ZONES[e.zone]?.name ?? '').toLowerCase()}`, setup: e.text,
        results: [{ headline: e.choice, detail: e.report, tone: tone(e), roll: roll(e), why: e.why ?? null }],
        cue: { incident: e.incident, zone: e.zone, danger: !!inc?.danger, success: e.success, actor: e.actor?.id ?? null, save: null, hurt: null },
      };
      items.push(card);
      open = { card, event: e };
    } else if (e.kind === 'roll') {
      items.push({
        type: 'card', kind: 'crisis', label: 'Crisis', setup: e.text,
        results: [{ headline: e.choice, detail: [e.report, injuryLine(e)?.headline].filter(Boolean).join(' '), tone: tone(e), roll: roll(e), why: e.why ?? null }],
        cue: { crisis: true, success: e.success, actor: e.actor?.id ?? null },
      });
    } else if (e.kind === 'decision' || e.kind === 'exit') {
      items.push({
        type: 'card', kind: e.kind, label: e.kind === 'exit' ? 'Pulling out' : e.rescued ? 'Rescue' : e.standby ? 'Standby comes in' : 'Call-in', setup: e.text,
        results: [{ headline: e.choice, detail: e.report, tone: e.kind === 'exit' ? 'warn' : 'save', roll: null, why: e.why ?? null }],
        cue: e.standby ? { standby: e.standby.id, rescued: e.rescued?.id ?? null } : { decision: true },
      });
    } else if (e.kind === 'battle') {
      // A fight (slice 6): a note when it starts (the guards appear on the plan), one card per round
      // and for pulling back (each moment plays on the plan), a note when it's over. The cue carries
      // everyone's health after the round, so the plan can draw the bars without the run's state.
      const state = { guards: (e.guards ?? []).map((g) => ({ n: g.n, hp: g.hp, max: g.max, armour: g.armour, out: g.out })), runners: (e.runners ?? []).map((r) => ({ id: r.id, handle: r.handle, hp: r.hp, max: r.max, armour: r.armour, down: r.down })) };
      if (e.phase === 'start' || e.phase === 'end') {
        items.push({ type: 'note', text: e.phase === 'end' ? e.report ?? e.text : e.text, tone: e.phase === 'start' ? 'warn' : e.hurt?.length ? 'bad' : 'good', cue: { battle: { phase: e.phase, ...state } } });
        continue;
      }
      const up = state.guards.filter((g) => !g.out).length;
      items.push({
        type: 'card', kind: 'battle', label: e.phase === 'retreat' ? 'Pulling back' : `Fight · round ${e.round}`,
        setup: e.phase === 'retreat' ? e.text : `${up ? `${up} guard${up === 1 ? '' : 's'} up` : 'Last guard down'} · ${state.runners.map((r) => `${r.handle} ${r.down ? 'down' : `${r.hp}/${r.max}`}`).join(', ')}`,
        hp: state,
        results: (e.lines ?? []).map((l) => ({ headline: l.text, detail: '', tone: l.kind === 'guard' ? (l.damage ? 'bad' : 'good') : l.kind === 'flee' || l.kind === 'ambush' || l.kind === 'hunker' ? 'good' : l.success ? 'good' : 'bad', roll: roll(l), why: null })),
        cue: { battle: { phase: e.phase, ...state, lines: (e.lines ?? []).map((l) => ({ kind: l.kind, actor: l.actor?.id ?? null, targetId: l.targetId ?? null, guard: l.guard ?? null, success: l.success ?? null, damage: l.damage ?? 0, heal: l.heal ?? 0, kit: l.kit ?? null, dropped: !!l.dropped, to: l.to ?? null, flank: !!l.flank })) } },
      });
    } else if (e.kind === 'critical') {
      items.push({
        type: 'card', kind: 'critical', label: `${e.patient} is critical`, setup: '',
        results: [{ headline: e.report, detail: '', tone: e.action === 'push' || e.success === false ? 'bad' : 'good', roll: roll(e), why: e.why ?? null }],
        cue: { critical: true },
      });
    }
  }
  close();
  return items;
}
