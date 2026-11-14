// The board's reads off the main thread (2026-11-14): a module worker that runs core/squad.js (pure, so it runs here as it
// does on the page) for the Jobs board (jobRead) and the plan screen's other approaches (leanPicks). Its fight caches are its
// own. The page sends a state once (`state`), then asks for reads on it by its number. ui/boardwork.js is the page's side.
import { jobRead, leanPicks } from '../core/squad.js';

let current = { seq: -1, state: null };

self.onmessage = ({ data }) => {
  if (data.type === 'state') { current = { seq: data.seq, state: data.state }; return; }
  const { id, seq, jobId, kind, approach } = data;
  if (seq !== current.seq) { self.postMessage({ id, ok: false, stale: true }); return; } // a newer state came in: this ask is moot
  try {
    const job = current.state.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error(`no job ${jobId}`);
    const result = kind === 'lean' ? leanPicks(current.state, job, approach) : jobRead(current.state, job);
    self.postMessage({ id, ok: true, result });
  } catch (e) {
    self.postMessage({ id, ok: false, error: String(e?.message ?? e) });
  }
};
