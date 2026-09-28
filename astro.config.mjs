// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { LOCALES } from './src/i18n/utils';
import { SITE } from './src/data/site';

const LOCALE_LIST = [...LOCALES];
const LOCALE_MAP = Object.fromEntries(LOCALES.map((l) => [l, l]));

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'en',
    locales: LOCALE_LIST,
    routing: {
      prefixDefaultLocale: true,
      // `/` 302s to `/en/`. The hreflang `x-default` therefore points at `/en/…`,
      // which is a real 200 self-canonical URL — a cluster must never annotate a
      // redirect. The alternative (a separate locale-less page) would put the
      // same content at two indexable URLs. See docs/seo.md §x-default.
      redirectToDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: LOCALE_MAP },
      lastmod: new Date(),
    }),
  ],
  devToolbar: { enabled: false },
});
