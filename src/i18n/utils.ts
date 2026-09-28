/**
 * Locale routing for the portal.
 *
 * Deliberately kept shape-compatible with `src/i18n/utils.ts` in the engine
 * repo so the two sites cannot drift on the one thing that must never drift:
 * the hreflang cluster construction.
 *
 * Rule enforced by the type below: a locale is either `en` or a member of
 * `LOCALES`. Adding a locale means adding it here, which forces the sitemap,
 * the hreflang loop, the language switcher and the not-yet-translated state to
 * all move together.
 */

export const LOCALES = ['en', 'el', 'de', 'fr', 'it'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, { endonym: string; hreflang: string }> = {
  en: { endonym: 'English', hreflang: 'en' },
  el: { endonym: 'Ελληνικά', hreflang: 'el' },
  de: { endonym: 'Deutsch', hreflang: 'de' },
  fr: { endonym: 'Français', hreflang: 'fr' },
  it: { endonym: 'Italiano', hreflang: 'it' },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** `/guides/x` → `/en/guides/x`. The leading-slash shape is what callers pass. */
export function localeUrl(locale: Locale, path: string = '/'): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path.replace(/\/$/, '') : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * The same path in another locale.
 *
 * This is what the hreflang loop uses, and it is the function that must never
 * be handed a path belonging to a different host. Cross-subdomain hreflang is
 * the single most damaging mistake available to this architecture, so there is
 * no code path that can produce one: every argument is a path on this origin.
 */
export function switchLocalePath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  return localeUrl(locale, `/${segments.join('/')}`);
}

/**
 * Locales for which a given page is actually built.
 *
 * A hreflang cluster may only contain URLs that exist. Emitting `hreflang="de"`
 * at a page that is not translated is the classic way to invalidate a whole
 * cluster, so the page asks this function and gets the honest answer.
 */
export function publishedLocales(hasTranslation: (locale: Locale) => boolean): Locale[] {
  return LOCALES.filter((l) => l === DEFAULT_LOCALE || hasTranslation(l));
}
