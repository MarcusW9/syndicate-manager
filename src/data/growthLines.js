// Flavour for level-up cards at the end of a job. {name} = the operative's handle.
// About two lines per stat; add freely. Picked deterministically, so the same
// rise always reads the same.

export const GROWTH_LINES = {
  combat: ['{name} is getting sharper in a fight.', '{name} hits harder and flinches less.'],
  stealth: ['{name} moves like a rumour now.', '{name} has stopped stepping on the loud floorboards.'],
  tech: ['{name} is getting quicker on the keys.', '{name} cracked that one without looking it up.'],
  social: ['{name} knows when to smile and when to shut up.', '{name} talked a stranger into a favour this week.'],
  driving: ['{name} takes corners the way Teo does.', '{name} found a gap in traffic nobody else saw.'],
  medical: ['{name} has steadier hands under pressure.', '{name} stitched it closed before the bleeding got going.'],
  cool: ['{name} stayed calm when it went sideways.', 'Sirens don\'t rattle {name} like they used to.'],
};

export const GRADUATION_LINES = [
  'Nobody calls {name} the new kid any more. A pro now, on a rookie\'s wage.',
  '{name} earned a seat at the table tonight. The crew bought the first round.',
];
