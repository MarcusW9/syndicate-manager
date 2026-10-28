// Incident text per district (PLAN-CORE-LOOP.md, slice 4; writing task 11 in drafts/writing-tasks.md).
// Content only. Each district can replace any incident's lines; anything not given here falls back
// to the generic text in data/incidents.js. Only these lines can change (the rules can't):
//   text, hOk, ok, hBad, bad, comp (comp only on danger incidents: patrol, guard, backup, hold)
// Keep {op} wherever a person is meant; {district} and {faction} work too.
//
// Example, once written:
//   docks: { lock: { text: 'The yard gate has a new mag-lock, salt already crusting the keypad.' } },

export const DISTRICT_INCIDENTS = {
  docks: {},
  oldTown: {},
  nightMarket: {},
  heights: {},
  basin: {},
};
