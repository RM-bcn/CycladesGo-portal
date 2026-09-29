/**
 * RSS for the guides.
 *
 * The one distribution channel that costs nothing, needs no account and no
 * consent banner, and works for a reader who wants the articles without a
 * search engine in the middle. `docs/content.md` treats it as the baseline
 * distribution: publish here first, and treat every other channel as optional.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext, GetStaticPaths } from 'astro';
import { LOCALES } from '../../../i18n/utils';
import { SITE } from '../../../data/site';
import type { GuideData } from '../../../content/schema';
import { slugOf } from '../../../content/slug';
import type { CollectionEntry } from 'astro:content';

/** One feed per locale, like every other page. */
export const getStaticPaths: GetStaticPaths = () =>
  LOCALES.map((lang) => ({ params: { lang } }));

export async function GET(context: APIContext) {
  const entries = (
    (await getCollection('guides', (e) => !e.data.draft)) as Array<
      CollectionEntry<'guides'> & { data: GuideData }
    >
  ).sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

  return rss({
    title: 'CycladesGo guides',
    description:
      'Written answers about buses in the Cyclades. Every figure comes from an operator’s own published schedule, with the date we checked it. Nothing here is a live departure board.',
    site: context.site ?? SITE.url,
    trailingSlash: false,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.published,
      link: `/en/guides/${slugOf(entry.id)}/`,
      categories: [entry.data.cluster],
      // Provenance travels with the feed, not just the page.
      customData: `<source>${entry.data.sources
        .map((s: { label: string; url: string; retrieved: Date }) => `${s.label} (retrieved ${s.retrieved.toISOString().slice(0, 10)})`)
        .join('; ')}</source><verified>${entry.data.verified.toISOString().slice(0, 10)}</verified>`,
    })),
  });
}
