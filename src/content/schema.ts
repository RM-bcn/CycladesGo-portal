import { z } from 'astro:content';

/**
 * The guide schema, in its own module.
 *
 * Two reasons it is not inline in `content.config.ts`. First, Astro 5.18's
 * glob loader does not infer the schema into the generated entry types, so the
 * type has to be derived here and used explicitly or every `data` is `any`.
 * Second, a plain `z.object` is required for inference: adding `.refine()`
 * returns a `ZodEffects`, which cannot be inferred from at all. The cross-field
 * rules therefore live in `scripts/check-guides.mjs`.
 */
export const guideSchema = z.object({

    title: z
      .string()
      .min(20, 'A guide title must state the question it answers, not a label.'),
    description: z
      .string()
      .min(120)
      .max(160, 'A meta description over 160 characters is truncated in the search result.'),
    /** A short eyebrow above the H1, in the engine's masthead style. */
    eyebrow: z.string().min(3).max(48),
    /**
     * `network` = true for more than one island, or for no island at all, and it
     * is the only kind the apex is allowed to host. `island` is here because the
     * same collection will be read by the island subdomains; on the apex it will
     * fail the modifier check in `check-guides.mjs`, which is the point.
     */
    scope: z.enum(['network', 'island']).default('network'),
    island: z.string().optional(),
    cluster: z.enum(['ferry-to-bus', 'comparison', 'network', 'methodology', 'season']),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().min(2),
    /**
     * The date the underlying data was last checked. This is the single most
     * useful thing we can give a reader, and the single most useful thing we can
     * give an answer engine deciding whether to cite us.
     */
    verified: z.coerce.date(),
    sources: z
      .array(
        z.object({
          label: z.string().min(2),
          url: z.string().url(),
          retrieved: z.coerce.date(),
        }),
      )
      .min(1, 'Every guide must say where its facts came from.'),
    cta: z.object({
      island: z.string(),
      label: z.string().min(4),
      from: z.string().optional(),
      to: z.string().optional(),
      arrive: z.string().optional(),
    }),
    faq: z
      .array(
        z.object({
          q: z.string().min(10),
          a: z.string().min(30),
        }),
      )
      .max(6)
      .optional(),
    draft: z.boolean().default(false),
});

export type GuideData = z.infer<typeof guideSchema>;
