// Career marks: what the job leaves on a face, for good (owner's call, 2026-10-28; DESIGN.md).
// Pure logic: this records the facts; src/ui/art.js draws them and places them from the
// person's own seed, so a mark never moves.
//
// op.marks  [{ kind: 'scar' | 'implant' | 'tattoo', day }]
//
// Every mark also writes a line in their history and shows on their profile: a portrait never
// says anything the text doesn't.

export const MARKS = {
  scar: { max: 3 },     // a serious or critical wound, at most one a day
  implant: { max: 2 },  // a job that ends with neural load in the danger zone
  tattoo: { max: 1 },   // the crew's mark, after enough jobs together
};
export const TATTOO_JOBS = 10;
const DANGER_LOAD = 70; // the same line the game warns at

const marksOf = (op, kind) => (op.marks ?? []).filter((m) => m.kind === kind);

function add(state, op, kind, history) {
  if (!op || op.freelance) return false;
  if (marksOf(op, kind).length >= MARKS[kind].max) return false;
  op.marks = [...(op.marks ?? []), { kind, day: state.day }];
  op.history.push(`Day ${state.day}: ${history}`);
  return true;
}

/** A serious or critical wound leaves a scar. */
export function noteScar(state, op, severity) {
  if (!['serious', 'critical'].includes(severity)) return;
  if (marksOf(op, 'scar').some((m) => m.day === state.day)) return; // one bad day, one scar
  add(state, op, 'scar', `scarred (a ${severity} wound)`);
}

/** At the end of a job: chrome added for a danger-zone load, the crew's mark at TATTOO_JOBS. */
export function noteJobMarks(state, op) {
  if ((op.condition?.neuralLoad ?? 0) > DANGER_LOAD) add(state, op, 'implant', 'more chrome (neural load in the danger zone)');
  if ((op.jobsWithCrew ?? 0) >= TATTOO_JOBS) add(state, op, 'tattoo', `got the crew's mark (${TATTOO_JOBS} jobs together)`);
}

/** The marks in words, for the profile: "two scars, extra chrome, the crew's mark". */
export function marksText(op) {
  const n = (kind) => marksOf(op, kind).length;
  const words = ['', 'one', 'two', 'three'];
  const parts = [];
  if (n('scar')) parts.push(n('scar') === 1 ? 'a scar' : `${words[n('scar')]} scars`);
  if (n('implant')) parts.push(n('implant') === 1 ? 'extra chrome' : 'two lots of extra chrome');
  if (n('tattoo')) parts.push("the crew's mark");
  return parts.join(', ');
}
