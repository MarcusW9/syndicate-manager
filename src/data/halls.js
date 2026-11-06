// Halls (DESIGN.md 2026-11-05): a tong's places in the city, one per district. The safehouse is
// the first, in Old Town. Opening another needs the district's welcome (reputation, and its contact
// trusting you: the contact makes the introduction) and a deposit; a new hall starts small.
// Numbers are first guesses for the playtest. Content only; the rules are in core/halls.js.

export const HOME_HALL = 'oldTown';

/** Per district: who introduces you, what it takes, and what the place is. Rents halved 2026-11-06 (balance pass: a second hall cost more than it brought). */
export const HALL_SITES = {
  oldTown: { contact: 'fung', place: 'the damp room above a noodle shop' },
  nightMarket: { opening: 'back_rent', contact: 'rao', rep: 25, trust: 60, deposit: 12000, rent: 500, beds: 2, place: 'two rooms above her sari shop' },
  docks: { opening: 'quarter_to_two', contact: 'ferryman', rep: 40, trust: 60, deposit: 15000, rent: 600, beds: 2, place: 'a container office on the old pier, with a stove' },
  basin: { opening: 'the_flat_doesnt_exist', contact: 'okonkwo', rep: 40, trust: 60, deposit: 15000, rent: 600, beds: 2, place: 'a flat over a tack workshop, with a view of the Old Stand' },
  heights: { opening: 'there_is_no_forty_first_floor', contact: 'szeto', rep: 60, trust: 60, deposit: 20000, rent: 800, beds: 2, place: 'a service floor nobody upstairs remembers' },
};

/** Opening jobs (2026-11-06): a favour the contact asks before offering the hall; walk away or fail and they ask again after this many days, with one of their own jobs as the test. */
export const OPENING = { retryDays: 14, boardDays: 13 };

/** Expanding a hall: like the old safehouse, the cost grows with the hall's level. */
export const HALL_EXPANSION = { costPerLevel: 10000, beds: 2, rent: 1000 };
