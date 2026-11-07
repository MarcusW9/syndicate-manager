// Halls (DESIGN.md 2026-11-05): a tong's places in the city, one per district. The safehouse is
// the first, in Old Town. Opening another needs the district's welcome (reputation, and its contact
// trusting you: the contact makes the introduction) and a deposit; a new hall starts small.
// Numbers are first guesses for the playtest. Content only; the rules are in core/halls.js.

export const HOME_HALL = 'oldTown';

/**
 * Per district: who introduces you, what it takes, and what the place is. `contact` is the client
 * who asks the opening favour (`opening`) and introduces the tong: the registry for both, kept out of
 * the job templates (owner, 2026-11-07). Hall access is its own thing, not a client's trust: with
 * `trust: null`, reputation and the opening favour open the hall (the Night Market, Glass Heights);
 * an optional `introducer` names someone who isn't a client.
 * Rents halved 2026-11-06 (balance pass: a second hall cost more than it brought). */
export const HALL_SITES = {
  oldTown: { contact: 'fung', place: 'the damp room above a noodle shop' },
  nightMarket: { opening: 'back_rent', contact: 'ip', rep: 25, trust: null, deposit: 12000, rent: 500, beds: 2, place: 'rooms behind a dai pai dong courtyard, Wok Court' },
  docks: { opening: 'quarter_to_two', contact: 'ferryman', rep: 40, trust: 60, deposit: 15000, rent: 600, beds: 2, place: 'a container office on an old working pier, the Stove Pier' },
  basin: { opening: 'the_flat_doesnt_exist', contact: 'okonkwo', rep: 40, trust: 60, deposit: 15000, rent: 600, beds: 2, place: 'a flat over a tack workshop with a view of the Old Stand, the Unlisted Rooms' },
  heights: { opening: 'still_on_the_books', contact: 'tse', rep: 60, trust: null, deposit: 20000, rent: 800, beds: 2, place: 'rooms beneath the corporate terraces, the Underterrace' },
};

/** Opening jobs (2026-11-06): a favour the contact asks before offering the hall; walk away or fail and they ask again after this many days, with one of their own jobs as the test. */
export const OPENING = { retryDays: 14, boardDays: 13 };

/** Buying a hall instead of renting it (owner, 2026-11-06): this many weeks of its rent, once; then no rent, and expanding it adds none. */
export const HALL_BUY = { weeks: 26 };

/** Expanding a hall: like the old safehouse, the cost grows with the hall's level. */
export const HALL_EXPANSION = { costPerLevel: 10000, beds: 2, rent: 1000 };

/** The district whose hall a template is the opening favour for, or null (the registry is HALL_SITES). */
export const openingHallOf = (templateId) => Object.entries(HALL_SITES).find(([, s]) => s.opening === templateId)?.[0] ?? null;
/** Is this template a hall's opening favour (asked by its contact, never dealt at random)? */
export const isOpeningJob = (templateId) => openingHallOf(templateId) != null;
