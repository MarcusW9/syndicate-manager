// Content checks. Run at startup in dev so broken data fails loudly.

const EXIT_KINDS = new Set(['abort', 'extract']);

export function validateMissions(missions) {
  const problems = [];
  for (const m of missions) {
    if (!m.beats?.length) problems.push(`${m.id}: no beats`);
    for (const c of m.crises ?? []) {
      if (c.after != null && !(c.after >= 0 && c.after <= m.beats.length - 2)) problems.push(`${m.id}/${c.id}: after ${c.after} must be a beat before the last`);
      if (!c.choices.some((ch) => EXIT_KINDS.has(ch.kind))) {
        problems.push(`${m.id}/${c.id}: no abort or extract choice`);
      }
      for (const ch of c.choices) {
        if (!ch.sure && !EXIT_KINDS.has(ch.kind) && !ch.failure) problems.push(`${m.id}/${c.id}/${ch.id}: can fail but has no failure text`);
        // Rookie jobs (and everything written after them) carry a plain report line per outcome.
        if (m.rookie && !ch.report?.success) problems.push(`${m.id}/${c.id}/${ch.id}: no report line`);
        if (m.rookie && !ch.sure && !EXIT_KINDS.has(ch.kind) && !ch.report?.failure) problems.push(`${m.id}/${c.id}/${ch.id}: no failure report line`);
      }
    }
    if (m.maps) problems.push(...validateMaps(m));
    if (m.trail) problems.push(`${m.id}: "trail" was renamed "maps" on 2026-11-23 (and a stop's crisis is marked stop: true)`);
  }
  return problems;
}

/**
 * A multi-map job's `maps` (core/multimap.js): its start and every next stop exist, each stop has a district, a time,
 * an arrival line and a crisis of the job's marked stop: true, the finale has a time and an arrival line, every stop
 * is reachable from the start, a wrong lead has no next stop of its own, and no route needs more than 4 stops.
 */
export function validateMaps(m) {
  const t = m.maps;
  const out = [];
  const stops = t.stops ?? {};
  const ids = Object.keys(stops);
  if (!stops[t.start]) out.push(`${m.id}: maps start at an unknown stop ${t.start}`);
  if (!t.finale?.time || !t.finale?.arrive) out.push(`${m.id}: the maps' finale needs a time and an arrival line`);
  for (const [id, s] of Object.entries(stops)) {
    if (id === 'finale') { out.push(`${m.id}/maps/finale: "finale" is the last map's name, not a stop's`); continue; }
    if (!s.district || !s.time || !s.arrive) out.push(`${m.id}/maps/${id}: needs a district, a time and an arrival line`);
    const c = (m.crises ?? []).find((x) => x.id === s.crisis);
    if (!c) out.push(`${m.id}/maps/${id}: no crisis ${s.crisis}`);
    else if (!c.stop) out.push(`${m.id}/maps/${id}: its crisis ${s.crisis} must be marked stop: true`);
    if (s.wrong && (s.next || s.skip)) out.push(`${m.id}/maps/${id}: a wrong lead leads back by itself (no next or skip)`);
    for (const n of [...(s.next ?? []), ...(s.skip ? [s.skip] : [])]) if (n !== 'finale' && !stops[n]) out.push(`${m.id}/maps/${id}: leads to an unknown stop ${n}`);
    if (!s.wrong && !(s.next ?? []).length) out.push(`${m.id}/maps/${id}: leads nowhere (next: ['finale'] for the last stop)`);
  }
  // Every route from the start reaches the finale within 4 stops (3 before it, a wrong lead included).
  const real = (id) => !stops[id]?.wrong;
  const depth = (id, seen = []) => (id === 'finale' ? 0 : seen.includes(id) ? Infinity : 1 + Math.max(...(stops[id]?.next ?? ['finale']).map((n) => depth(n, [...seen, id]))));
  const wrongs = ids.filter((id) => !real(id)).length ? 1 : 0;
  if (stops[t.start] && depth(t.start) + wrongs > 3) out.push(`${m.id}: a route needs more than 4 stops (a wrong lead counts as one)`);
  const reach = new Set([t.start]);
  for (let grew = true; grew;) { grew = false; for (const id of [...reach]) for (const n of stops[id]?.next ?? []) if (!reach.has(n)) { reach.add(n); grew = true; } }
  for (const id of ids.filter(real)) if (!reach.has(id)) out.push(`${m.id}/maps/${id}: no route reaches this stop`);
  return out;
}

export function validateCrew(crew) {
  const problems = [];
  for (const op of crew) {
    if (op.age < 18) problems.push(`${op.id}: operatives must be 18+`);
  }
  return problems;
}

/** Recruits are generated, so check a generated batch rather than fixed data. */
export function validateRecruit(r) {
  const problems = [];
  if (!(r.age >= 18)) problems.push(`${r.id}: recruit under 18`);
  if (!r.name || !r.handle || !r.role) problems.push(`${r.id}: missing name, handle or role`);
  if (/\{\w+\}/.test(r.origin + r.bio)) problems.push(`${r.id}: unfilled placeholder`);
  return problems;
}

/**
 * Heists (data/heists.js): the finale and every prep template exist and aren't opening jobs, each
 * step has a second template for its retry, an effect is one of the four kinds, and a dropped
 * crisis is really one the finale can draw (else the plan would show a change the run never makes).
 * Dropping must leave the finale enough crises to draw at its highest threat.
 */
export function validateHeists(heists, missions) {
  const problems = [];
  const byId = (id) => missions.find((m) => m.id === id);
  for (const h of heists) {
    const fin = byId(h.finale);
    if (!fin) { problems.push(`${h.id}: no finale job ${h.finale}`); continue; }
    if (fin.opening) problems.push(`${h.id}: the finale is an opening job`);
    const ids = new Set();
    const drops = [];
    for (const p of h.prep ?? []) {
      if (ids.has(p.id)) problems.push(`${h.id}/${p.id}: step id used twice`);
      ids.add(p.id);
      if ((p.templates ?? []).length < 2) problems.push(`${h.id}/${p.id}: needs two templates (the first ask and the retry)`);
      for (const t of p.templates ?? []) if (!byId(t) || byId(t).opening) problems.push(`${h.id}/${p.id}: ${t} isn't a job that can be offered`);
      if (!p.line || !p.shows) problems.push(`${h.id}/${p.id}: needs a line and what it shows`);
      const e = p.effect ?? {};
      const kinds = ['threat', 'drop', 'intel', 'pay'].filter((k) => e[k] != null);
      if (kinds.length !== 1) problems.push(`${h.id}/${p.id}: an effect needs exactly one of threat, drop, intel or pay`);
      if (e.threat != null && !(e.threat < 0)) problems.push(`${h.id}/${p.id}: a threat effect lowers it`);
      if (e.drop != null) {
        if (!fin.crises.some((c) => c.id === e.drop)) problems.push(`${h.id}/${p.id}: the finale has no crisis ${e.drop}`);
        drops.push(e.drop);
      }
    }
    for (const p of h.prep ?? []) if (p.fixer && !(p.fixer.label && p.fixer.description && p.fixer.confirmation)) problems.push(`${h.id}/${p.id}: fixer copy needs a label, description and confirmation`);
    if (fin.crises.length - new Set(drops).size < 3) problems.push(`${h.id}: dropping ${drops.join(', ')} leaves fewer than 3 crises to draw`);
  }
  return problems;
}
