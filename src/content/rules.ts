/**
 * Editorial constants for guides. Deliberately NOT in `content.config.ts`:
 * Astro reads that file to generate entry types, and an extra export there can
 * stop the Zod schema being inferred, which degrades every entry to `any`.
 */

export const MODIFIERS = [
  'with luggage',
  'with a suitcase',
  'with a baby',
  'with a stroller',
  'with a scooter',
  'after the last ferry',
  'after the last boat',
  'cheapest way',
  'early morning',
  'late evening',
  'on foot',
  'in high season',
  'in low season',
];

export const MIN_WORDS_EN = 300;
export const MIN_WORDS_TRANSLATION = 180;

