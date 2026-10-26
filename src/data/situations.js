// What kind of situation a crisis is, listed on each crisis (crisis.situations; not `tags`,
// which dialogue lines use for personality). Earned traits use
// them (drafts/earned-traits-backlog.md: Light-Fingered on entry, Crowd Reader on crowd...);
// mission logs and gear can later. Claude's draft, 2026-10-26, for the owner to skim.

export const SITUATIONS = {
  escape: 'Getting away under pressure: a pursuit, a lockdown, a cordon.',
  entry: 'Getting into, or past, somewhere secured or guarded.',
  crowd: 'Crowds, witnesses or bystanders who could turn it.',
  'street-tech': 'Cheap, salvaged, damaged or improvised hardware.',
  'corp-tech': 'Corporate or luxury systems: towers, labs, security.',
  fight: 'A physical confrontation is on the table.',
  threat: 'Someone threatens, squeezes or blocks the crew.',
  injury: 'Someone badly hurt, or a medical emergency.',
  police: 'Harbour Police or the Wet Sleeve.',
  law: 'Any authority: police, customs officers, inspectors (every police crisis is law too).',
  neural: 'Implants, neural load, work that pushes the brain.',
  weather: 'Typhoon signals and gales.',
};
