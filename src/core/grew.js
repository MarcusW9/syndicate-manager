// Who grew while away (2026-11-26, owner: the core feeling is your people getting stronger as you send them off;
// docs/research/ac-brotherhood-recruits.md). Expeditions and security posts teach their crew every day (gainXp), but
// what gainXp returned was thrown away, so the player was never told. A trip or post now keeps the whole-point rises
// as they happen (`grew`) and says them in its report; a rookie who graduates away from home gets the message and
// history line a side task gives. Pure: mutates the state it is handed.

/** Keep what one gainXp call returned on the trip or post (`holder.grew`); a graduation gets its message now. */
export function keepGrowth(state, holder, op, { events, graduated }, what) {
  if (events.length) (holder.grew ??= []).push(...events.map(({ opId, handle, stat, from, to }) => ({ opId, handle, stat, from, to })));
  if (graduated) {
    (holder.graduated ??= []).push(op.id);
    op.history.push(`Day ${state.day}: graduated from rookie`);
    state.inbox.unshift({
      id: `graduate-${op.id}-${state.day}`, type: 'crew', day: state.day,
      subject: `${op.handle} isn't a rookie any more`,
      body: `Out on ${what}, ${op.name} stopped being the new kid. A pro now, on a rookie's wage.`,
      blocking: false, read: false,
    });
  }
}

/** The rises folded per runner and stat, first value to last: [{ opId, handle, stat, from, to }], in the order they came. */
export function sumGrowth(grew = []) {
  const out = [];
  for (const g of grew) {
    const hit = out.find((x) => x.opId === g.opId && x.stat === g.stat);
    if (hit) { hit.from = Math.min(hit.from, g.from); hit.to = Math.max(hit.to, g.to); }
    else out.push({ ...g });
  }
  return out;
}

/** "Mei stealth 11→12, social 9→10; Pike tech 6→7", or '' when nobody grew a whole point. */
export function growthText(grew = []) {
  const byOp = new Map();
  for (const g of sumGrowth(grew)) byOp.set(g.handle, [...(byOp.get(g.handle) ?? []), `${g.stat} ${g.from}→${g.to}`]);
  return [...byOp].map(([who, rises]) => `${who} ${rises.join(', ')}`).join('; ');
}
