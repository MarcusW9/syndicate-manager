// A minimal fake page for driving ui/app.js from a test: clicks go in by data-action, the markup comes out as a string.
// Not a test file (no .test.js suffix); tests/nav*.test.js import it.
import { createNewGame } from '../src/core/state.js';

export async function boot(over = {}) {
  const handlers = {};
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const win = { scrollY: 0, scrollTo(x, y) { this.scrollY = y ?? 0; } };
  globalThis.window = win;
  globalThis.document = { createElement: () => ({ addEventListener() {}, set value(v) {} }), activeElement: null };
  globalThis.matchMedia = () => ({ matches: false });
  const root = {
    innerHTML: '', classList: { toggle() {} },
    addEventListener: (t, f) => { handlers[t] = f; }, after() {},
    querySelector: () => null, querySelectorAll: () => [], contains: () => false,
  };
  const { mountApp } = await import('../src/ui/app.js');
  const state = over.state ?? createNewGame({ seed: 3, startCrew: 'fresh' });
  mountApp(root, state);
  const api = {
    root, win,
    html: () => root.innerHTML,
    click(action, id = '') { handlers.click({ target: { closest: () => ({ dataset: { action, id }, disabled: false }) } }); return api; },
    /** The active tab's id, read from the nav bar. */
    tab: () => (root.innerHTML.match(/class="nav__btn is-active" data-action="nav" data-id="([^"]+)"/) ?? [])[1],
    hasBack: () => /data-action="back"/.test(root.innerHTML),
  };
  return api;
}
