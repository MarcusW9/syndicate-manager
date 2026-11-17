// A quick copy for plays that are thrown away (the planning odds' fights in core/fight.js and core/battle.js; 2026-11-18,
// the speed pass). It gives what structuredClone gives, shared references included, only quicker: it copies plain objects
// and dense arrays itself and hands anything else (a Map, a class, a sparse array, a function) to structuredClone, so the
// answer, or the error, is always structuredClone's. Pure: no DOM, no storage.

const NOT_PLAIN = Symbol('not plain');

/**
 * A function that makes a copy of `x` as it is now, for many copies of something that does not change between them.
 * `kept`: parts of x that the plays never write into; the copies share them with x instead of copying them (the caller
 * proves they are never written: tests/copyfight.test.js for a fight's). Found and checked once, here.
 */
export function copier(x, kept = []) {
  const shared = new Set();
  try { for (const k of kept) keep(k, shared); } catch (e) { if (e === NOT_PLAIN) return () => structuredClone(x); throw e; }
  return () => {
    try { return copyTree(x, new Map(), shared); } catch (e) { if (e === NOT_PLAIN) return structuredClone(x); throw e; }
  };
}

/** Add x and everything in it to `shared`: each is its own copy (checked plain, as copyTree would). */
function keep(x, shared) {
  if (typeof x !== 'object' || x === null) { if (typeof x === 'function' || typeof x === 'symbol') throw NOT_PLAIN; return; }
  if (shared.has(x)) return;
  const proto = Object.getPrototypeOf(x);
  if (proto !== Object.prototype && proto !== Array.prototype) throw NOT_PLAIN;
  if (Array.isArray(x)) { let own = 0; for (const k in x) own += 1; if (own !== x.length) throw NOT_PLAIN; }
  shared.add(x);
  for (const k in x) keep(x[k], shared);
}

/** x copied; `seen` maps each object copied so far to its copy (shared references stay shared); `shared` are kept as they are. */
function copyTree(x, seen, shared) {
  if (typeof x !== 'object' || x === null) {
    if (typeof x === 'function' || typeof x === 'symbol') throw NOT_PLAIN;
    return x;
  }
  let c = seen.get(x);
  if (c) return c;
  if (shared.has(x)) return x;
  if (Array.isArray(x)) {
    if (Object.getPrototypeOf(x) !== Array.prototype) throw NOT_PLAIN;
    const n = x.length;
    c = new Array(n);
    seen.set(x, c);
    let own = 0;
    for (const k in x) own += 1; // an extra key or a hole: not a plain dense array
    if (own !== n) throw NOT_PLAIN;
    for (let i = 0; i < n; i++) c[i] = copyTree(x[i], seen, shared);
    return c;
  }
  if (Object.getPrototypeOf(x) !== Object.prototype) throw NOT_PLAIN;
  c = {};
  seen.set(x, c);
  for (const k in x) c[k] = copyTree(x[k], seen, shared);
  return c;
}
