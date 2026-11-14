// The page's side of the board worker (ui/boardWorker.js, 2026-11-14): asks for reads off the main thread and hands each
// answer back once. Where there are no workers (Node, the tests, an old webview) or the worker fails, `canWork()` is false
// and callers read synchronously, as before.
let worker = null;
let broken = typeof Worker !== 'function' || typeof window === 'undefined';
let seq = 0;
let sent = null; // the state the worker holds
let nextId = 0;
const waiting = new Map(); // id -> { done, fail }

function start() {
  if (worker || broken) return worker;
  try {
    worker = new Worker(new URL('./boardWorker.js', import.meta.url), { type: 'module' });
  } catch {
    broken = true;
    return null;
  }
  worker.onmessage = ({ data }) => {
    const w = waiting.get(data.id);
    if (!w) return;
    waiting.delete(data.id);
    if (data.ok) w.done(data.result); else w.fail(data);
  };
  worker.onerror = (e) => { // the worker can't run here (a module worker on an old webview, a load error): read on the page from now on
    e.preventDefault?.();
    broken = true;
    worker = null;
    const all = [...waiting.values()];
    waiting.clear();
    for (const w of all) w.fail({ broken: true });
  };
  return worker;
}

/** Whether reads can go off the main thread. */
export const canWork = () => !broken && Boolean(start());

/**
 * Ask the worker for a read of `state`: { kind: 'board', jobId } (core/squad.js jobRead) or { kind: 'lean', jobId, approach }
 * (leanPicks). Resolves with the answer, or rejects ({ stale } when a newer state was sent first, { broken }, { error }).
 */
export function ask(state, req) {
  const w = start();
  if (!w) return Promise.reject({ broken: true });
  if (sent !== state) {
    sent = state;
    seq += 1;
    w.postMessage({ type: 'state', seq, state });
  }
  const id = ++nextId;
  return new Promise((done, fail) => {
    waiting.set(id, { done, fail });
    w.postMessage({ ...req, id, seq });
  });
}
