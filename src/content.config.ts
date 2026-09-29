import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { guideSchema } from './content/schema';

/**
 * Guides, as a content collection. See `src/content/schema.ts` for why the
 * schema lives in its own module and why it is a plain `z.object`.
 */
const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: guideSchema,
});

export const COLLECTIONS = { guides };
