// Log lines: side-task days. Claude's draft (2026-11-22) for the owner to mark. A side task of two
// or three days writes one of these on each day before the last; the last line is the task's own
// result (data/sideTasks.js success / failure), so these never say how it went. Keyed by the task's
// purpose (money, training, trust, info), with "any" as the fallback; asides, pair and joss come from
// jobDays.js (core/advlog.js). {place} comes from the district's file and is skipped where it has none.
export default {
  money: [
    '{who} worked the shift and kept count of every hour. "Every single one."',
    'A long day on someone else\'s clock. {who} says the tea was free, at least.',
    '{who} put in the hours at {place}. Nobody complained, which counts as praise there.',
  ],
  training: [
    '{who} did it again, slower, then again, faster. By evening it was starting to stick.',
    'A day of practice. {who} got it wrong in new and more useful ways.',
    '{who} kept at it until the person teaching them ran out of corrections.',
  ],
  trust: [
    '{who} ran the errands without being asked twice. The client noticed, and said nothing, which is a good sign.',
    '{who} turned up early and left late. Somebody important was keeping count.',
    'A day of small favours. {who} remembered everyone\'s name and nobody\'s gossip.',
  ],
  info: [
    '{who} watched from {place} and wrote down everything that moved.',
    'A day of listening. {who} has a page of notes and a feeling about two of them.',
    '{who} asked one careful question an hour, all day, at different counters.',
  ],
  any: [
    'Another day down. {who} says the next one is the hard part.',
    '{who} got through the day without anybody asking who sent them.',
  ],
};
