/**
 * Site-wide configuration for the CycladesGo portal.
 *
 * `url` is the apex the canonical/hreflang/sitemap machinery points at. The
 * domain is not yet purchased, so `SITE_URL` is the only supported override and
 * it defaults to the intended apex. A preview deployment must set it
 * explicitly or it will advertise a canonical for a domain we do not control —
 * `scripts/check-publishable.mjs` fails the build when that happens on a
 * non-production run.
 */

const rawUrl = import.meta.env.SITE_URL ?? 'https://cycladesgo.com';

function identity(name: string, fallback: string): string {
  const v = import.meta.env[name];
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : fallback;
}

export const SITE = {
  url: rawUrl.replace(/\/$/, ''),

  /**
   * The brand is commercial from 2026-09 (sponsorship + donations). That is a
   * deliberate, load-bearing decision: it makes us a "trader" under
   * Law 2251/1994 and brings the e-commerce Code of Conduct, withdrawal
   * rights, the European Accessibility Act and the UCPD data-accuracy
   * exposure into scope. See `docs/legal.md`.
   */
  commercial: true,

  name: 'CycladesGo',
  nameEl: 'CycladesGo',
  legalName: identity('CYCLADESGO_LEGAL_NAME', 'CycladesGo (operator details pending)'),
  address: identity('CYCLADESGO_ADDRESS', 'Registered address pending'),
  email: identity('CYCLADESGO_EMAIL', 'hello@example.invalid'),
  vat: identity('CYCLADESGO_VAT', 'VAT pending'),
  gemi: identity('CYCLADESGO_GEMI', 'GEMI pending'),

  repo: 'https://github.com/RM-bcn/CycladesGo-portal',

  /**
   * The allowlist for the palette gate (check 11 of `scripts/audit-seo.ts`),
   * which fails the build on any hex in an `.astro` file that is not a token.
   */
  palette: {
    bg: '#FAF7F2',
    surface: '#FFFFFF',
    border: '#D9E2E9',
    ink: '#0D2B4A',
    aegean: '#1268B3',
    sea: '#0E8A8F',
    bougainvillea: '#B0356F',
    sun: '#E8A33C',
    terracotta: '#A8441F',
    olive: '#4C7A34',
  },

  /**
   * Filled in per build from the engine's datasets. `null` means "not wired
   * yet" and every freshness surface renders the `unknown` state instead of
   * inventing a date. The portal refuses to publish a claim it cannot back.
   */
  dataFreshness: null as { generatedAt: string; validTo: string } | null,
} as const;

export type Site = typeof SITE;
