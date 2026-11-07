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
  }
  return problems;
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
    for (const x of h.exclude ?? []) if (!fin.crises.some((c) => c.id === x)) problems.push(`${h.id}: excludes ${x}, which the finale doesn't have`);
    for (const p of h.prep ?? []) if (p.fixer && !(p.fixer.label && p.fixer.description && p.fixer.confirmation)) problems.push(`${h.id}/${p.id}: fixer copy needs a label, description and confirmation`);
    const out = new Set([...(h.exclude ?? []), ...drops]);
    if (fin.crises.length - out.size < 3) problems.push(`${h.id}: leaving out ${[...out].join(', ')} leaves fewer than 3 crises to draw`);
  }
  return problems;
}
