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
