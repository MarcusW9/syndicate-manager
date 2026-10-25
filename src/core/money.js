// Money as players read it, e.g. "¥1,250". Pure: used in message text and on screen.

import { NAMES } from '../config/names.js';

export const money = (n) => `${n < 0 ? '-' : ''}${NAMES.currency}${Math.abs(n).toLocaleString()}`;
