import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES, isLocale, localeUrl, switchLocalePath } from '../src/i18n/utils';
import { publishedLocalesFor, resolveLocale } from '../src/lib/page';

/**
 * The hreflang cluster is the one thing in this repo that is easy to break
 * silently and impossible to notice without a search console, so the contract
 * is pinned here rather than left to review.
 */
describe('locale routing', () => {
  it('localises a path exactly once', () => {
    expect(localeUrl('de', '/')).toBe('/de');
    expect(localeUrl('de', '/network')).toBe('/de/network');
    expect(localeUrl('fr', '/legal/privacy')).toBe('/fr/legal/privacy');
  });

  it('tolerates a trailing slash without doubling it', () => {
    expect(localeUrl('el', '/islands/')).toBe('/el/islands');
  });

  it('never produces a path that still carries a locale', () => {
    for (const locale of LOCALES) {
      expect(localeUrl(locale, '/en/network')).toBe(`/${locale}/en/network`);
    }
  });

  it('swaps the locale while keeping the path', () => {
    expect(switchLocalePath('/en/network', 'de')).toBe('/de/network');
    expect(switchLocalePath('/de/legal/terms', 'fr')).toBe('/fr/legal/terms');
    expect(switchLocalePath('/el', 'it')).toBe('/it');
  });

  it('only accepts a known locale, so a bad param cannot reach the URL builder', () => {
    expect(isLocale('de')).toBe(true);
    expect(isLocale('DE')).toBe(false);
    expect(isLocale('../../etc/passwd')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(resolveLocale('../../etc/passwd')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(7)).toBe(DEFAULT_LOCALE);
  });
});

describe('translation contract', () => {
  it('reports only English as reviewed, which is what makes the other locales noindex', () => {
    expect(publishedLocalesFor('/network')).toEqual(['en']);
  });

  it('never reports a locale that has not been registered', () => {
    for (const locale of LOCALES) {
      if (locale === 'en') continue;
      expect(publishedLocalesFor('/network')).not.toContain(locale);
    }
  });

  it('keeps every locale code lowercase, because hreflang rejects uppercase', () => {
    for (const locale of LOCALES) {
      expect(locale).toBe(locale.toLowerCase());
    }
  });
});
