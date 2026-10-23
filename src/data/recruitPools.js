// Pools for generated recruits. The city is HK-inspired and multicultural:
// about 60% of recruits come from the Hong Kong Chinese pool (see DESIGN.md).
// Add freely; more variety = fewer repeats.

export const CULTURES = [
  {
    id: 'hk',
    weight: 60,
    surnames: ['Chan', 'Wong', 'Lee', 'Cheung', 'Lau', 'Ng', 'Ho', 'Leung', 'Tsang', 'Yip', 'Fung', 'Kwok', 'Lam', 'Tang', 'Mak', 'Chow', 'Yeung', 'Siu', 'Ma', 'Lo'],
    // Hong Kong mixes English given names with romanised Cantonese ones.
    given: ['Kelvin', 'Ivy', 'Ricky', 'Winnie', 'Calvin', 'Karen', 'Ken', 'Gigi', 'Alan', 'Coco', 'Jason', 'Fiona', 'Eason', 'Mandy', 'Vincent', 'Cherry', 'Dicky', 'Angel',
      'Ka-ho', 'Wai-man', 'Siu-ming', 'Hoi-yan', 'Tsz-kin', 'Pui-yi', 'Chun-hei', 'Man-wai', 'Hiu-tung', 'Kwan-yu'],
    nameOrder: 'given-first',
  },
  { id: 'filipino', weight: 10, surnames: ['Santos', 'Reyes', 'dela Cruz', 'Bautista', 'Mendoza', 'Garcia'], given: ['Joy', 'Rafael', 'Marisol', 'Paolo', 'Liza', 'Jun', 'Carmela', 'Nico'], nameOrder: 'given-first' },
  { id: 'south_asian', weight: 10, surnames: ['Singh', 'Khan', 'Gurung', 'Sharma', 'Rai', 'Thapa', 'Ali'], given: ['Arjun', 'Aisha', 'Ravi', 'Sunita', 'Bikram', 'Zara', 'Imran', 'Pema'], nameOrder: 'given-first' },
  { id: 'african', weight: 7, surnames: ['Mensah', 'Okoro', 'Adeyemi', 'Kamau', 'Diallo'], given: ['Kwame', 'Amara', 'Tunde', 'Nia', 'Kofi', 'Zuri'], nameOrder: 'given-first' },
  { id: 'southeast_asian', weight: 7, surnames: ['Wijaya', 'Suksawat', 'Nguyen', 'Rahman', 'Tran'], given: ['Dewi', 'Arif', 'Mai', 'Somchai', 'Linh', 'Budi'], nameOrder: 'given-first' },
  { id: 'european', weight: 6, surnames: ['Novak', 'Fischer', "O'Brien", 'Moreau', 'Petrov', 'Costa'], given: ['Lena', 'Marco', 'Sasha', 'Niamh', 'Luc', 'Ines'], nameOrder: 'given-first' },
];

export const HANDLES = [
  'Ghost', 'Mantis', 'Lychee', 'Sparrow', 'Brick', 'Neon', 'Dim Sum', 'Kettle', 'Typhoon', 'Mahjong',
  'Jade', 'Moth', 'Ferry', 'Abacus', 'Tram', 'Rivet', 'Pepper', 'Wire', 'Sampan', 'Lantern',
  'Fishball', 'Minibus', 'Hex', 'Drizzle', 'Pigeon', 'Joss', 'Tofu', 'Crane', 'Signal', 'Bamboo',
];

// Primary stat per role, plus what they're decent at.
export const ROLE_PROFILES = {
  medic: { primary: 'medical', secondary: ['cool', 'social'] },
  muscle: { primary: 'combat', secondary: ['cool', 'driving'] },
  tech: { primary: 'tech', secondary: ['stealth', 'cool'] },
  driver: { primary: 'driving', secondary: ['cool', 'combat'] },
  face: { primary: 'social', secondary: ['stealth', 'cool'] },
  infiltrator: { primary: 'stealth', secondary: ['tech', 'combat'] },
};

// Where they come from. {district} is filled with a district name.
export const ORIGINS = {
  medic: ['Ex-ambulance crew who quit after one night shift too many in {district}.', 'Struck-off vet who now patches people up in a back room in {district}.', 'Dropped out of medical school to pay off a family debt.'],
  muscle: ['Ex-bouncer from a karaoke bar in {district}.', 'Former Muay Thai fighter who threw one fight too many.', 'Dock worker who got tired of breaking crates instead of people.'],
  tech: ['Repairs phones at a stall in {district} and cracks them after hours.', 'Laid off from a Glass Heights bank\'s security team.', 'Forum hacking legend who finally decided to get paid for it.'],
  driver: ['Red minibus driver who knows every shortcut in {district}.', 'Ex-delivery rider with three crashed scooters and no fear.', 'Drove for a Glass Heights executive until he saw too much.'],
  face: ['Former estate agent who could sell a shoebox flat for a fortune.', 'Ran a mahjong parlour in {district} until the triads took it.', 'Luxury shop assistant who learned how the rich talk.'],
  infiltrator: ['Rooftop climber who used to post videos from the rooftops of {district}.', 'Ex-cleaner who still has keycards to half of Glass Heights.', 'Former cat burglar, retired twice already.'],
};

export const PERSONALITIES = [
  'Quiet, watchful, and slow to trust anyone new.',
  'Laughs too loudly and never stops eating.',
  'Sends money home every week and never says to who.',
  'Superstitious about everything, from numbers to the colour of shoes.',
  'Ambitious and blunt about it.',
  'Keeps a small shrine in their locker and lights incense before jobs.',
  'Reads cheap detective novels between jobs.',
  'Has an opinion about every cha chaan teng in the city.',
  'Polite to a fault, until the shooting starts.',
  'Owes money to somebody dangerous and is trying to fix it.',
  'Still lives with their parents, who think they work in logistics.',
  'Talks to the crew like family from day one.',
];

export const BADGE_COLORS = ['#7dd3fc', '#86efac', '#fca5a5', '#fcd34d', '#c4b5fd', '#f9a8d4', '#5eead4', '#fdba74', '#a5b4fc', '#bef264'];
