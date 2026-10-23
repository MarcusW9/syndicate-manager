// Content checks. Run at startup in dev so broken data fails loudly.

const EXIT_KINDS = new Set(['abort', 'extract']);

export function validateMissions(missions) {
  const problems = [];
  for (const m of missions) {
    if (!m.beats?.length) problems.push(`${m.id}: no beats`);
    for (const c of m.crises ?? []) {
      if (!c.choices.some((ch) => EXIT_KINDS.has(ch.kind))) {
        problems.push(`${m.id}/${c.id}: no abort or extract choice`);
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
