// A new game's seed (2026-11-18, the purity pass): the one place the game reads the clock for it. The core never invents a
// seed (core/state.js createNewGame takes one); the boot (main.js) and the new-game action (ui/actions.js) pass this.
// In the dev build only, `?seed=<n>` in the address fixes it, so `npm run screenshots` plays the same game every time.

const MAX = 2147483647;

/** The seed for a new game: the clock, or the address's `?seed=` in the dev build. */
export function freshSeed() {
  if (import.meta.env?.DEV) {
    const asked = Number(new URLSearchParams(globalThis.location?.search ?? '').get('seed'));
    if (Number.isInteger(asked) && asked > 0) return asked % MAX;
  }
  return Date.now() % MAX;
}
