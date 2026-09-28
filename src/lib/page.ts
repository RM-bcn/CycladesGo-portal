/**
 * Locale helpers for page templates.
 *
 * The prototype ships long-form content in English only. That is a deliberate
 * state, not an oversight: a locale with no human review is `noindex` and is
 * left out of the hreflang cluster rather than published under a tag we cannot
 * stand behind. When a translation lands, add it to `REVIEWED` — the page, the
 * sitemap and the cluster all follow from that one list.
 */

import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from '../i18n/utils';
import { useTranslations } from '../i18n/ui';

export const REVIEWED: Partial<Record<Locale, readonly string[]>> = {
  en: ['*'],
};

/** Locales in which `path` has a reviewed translation. */
export function publishedLocalesFor(path: string): Locale[] {
  return LOCALES.filter((locale) => {
    const reviewed = REVIEWED[locale];
    if (!reviewed) return false;
    return reviewed.includes('*') || reviewed.includes(path);
  });
}

export interface PageContext {
  locale: Locale;
  t: ReturnType<typeof useTranslations>;
  /** Absolute path on this origin, no leading locale duplication. */
  path: string;
  hreflangLocales: Locale[];
  /** True when the requested locale has no reviewed translation. */
  untranslated: boolean;
  isDefault: boolean;
}

export function resolveLocale(langParam: string | number | undefined): Locale {
  return isLocale(typeof langParam === 'string' ? langParam : undefined) ? (langParam as Locale) : DEFAULT_LOCALE;
}
