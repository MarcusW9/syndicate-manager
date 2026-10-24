// Statuses an operative can carry for a while: op.status = [{ id, until }].
// Data only; the roll rule lives in core/crew.js, expiry in core/statuses.js.

export const STATUSES = {
  unhappy: { name: 'Unhappy', desc: 'Head not in it after a refused pay rise', rollMod: -1, note: 'unhappy' },
};
