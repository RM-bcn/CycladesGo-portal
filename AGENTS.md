# AGENTS.md — CycladesGo portal

Operating manual for this repository. Read it before changing anything. If a
change here contradicts this file, this file is the thing that is wrong and
should be fixed in the same pull request, not worked around.

---

## 1. What this repo is

`CycladesGo-portal` is the **apex portal** for the CycladesGo family of island
bus planners. It is a static Astro site that:

- names and links the per-island planner apps,
- explains how Cyclades island buses work (the network, hubs, the last bus),
- publishes the provenance, methodology, freshness and known limits of the data
  those apps are built from,
- carries the legal, privacy, accessibility and sponsorship pages,
- is the entity that all the apps' `sameAs` and internal links point back at.

It is a **separate deployable from the engine repo**. The engine repo is
`RM-bcn/Naxos-bus-pwa` and it is **read-only from here**. The two share a design
system and a set of conventions, and deliberately share no build: the portal
never imports from the engine, the engine never imports from the portal, and
neither repo depends on the other's `node_modules`.

Everything in this repo that "knows about an island" reads
`src/data/islands.ts`. If a fact about an island can be read from the engine's
dataset, read it there rather than re-typing it here.

## 2. The three non-negotiable rules

### Rule 1 — never claim the data is live

Departure times on this site and in the apps are the **operator's published
schedule**. There is no real-time feed, no vehicle position data and no delay
prediction. Interpolated intermediate stop times are labelled as estimates
wherever they appear.

*Why:* the single fastest way to lose a traveller who trusted us is to send
them to a harbour on a time we implied we knew better than we did.

*Enforcement:* copy-level, not lint-level. It lives in `TrustBanner`,
`SourceSnapshotBanner` and `OperatorAttribution`, in the `SiteFooter`
disclaimer, in `/en/data/quality/`, and in the generated `llms.txt`, whose
"scheduled, never live" statement `scripts/audit-seo.ts` asserts on every build.
No gate scans page copy for the word "live", so **review is the enforcement**.
Two places in the current tree need that review and are listed under
[Known gaps](#10-known-gaps).

### Rule 2 — never publish an unreviewed translation under an hreflang tag

A locale with no human-reviewed translation is served (so nobody hits a dead
end), `noindex`ed, carries **no** hreflang annotation, and shows a visible
"not yet translated" banner in the reader's own language.

*Why:* an hreflang annotation is a statement that a translation exists and is
fit to be indexed. A single unreviewed or machine-translated member invalidates
the whole cluster for the page.

*Enforcement:* in one place, `src/components/Seo.astro`, which derives the
cluster from `hreflangLocales` and refuses to index an untranslated locale.
The set of reviewed translations is the `REVIEWED` map in `src/lib/page.ts`.
`scripts/audit-seo.ts` checks 3, 4 and 5 fail the build on a non-reciprocal
cluster, an `x-default` that is not a built page, or an hreflang for a locale
that was never built.

### Rule 3 — never put a hex colour in an `.astro` file

Colour comes from the design tokens in `src/styles/global.css`. Use
`var(--color-…)` (Tailwind arbitrary values such as `text-[var(--color-ink)]`),
or a `<Token>` component.

*Why:* the portal and the PWAs must read as one product. A raw hex in one page
is silent brand drift, and it does not follow the dark theme.

*Enforcement:* the palette gate in `scripts/audit-seo.ts` (check 11). It reads
the allowlist out of `src/styles/global.css` and `src/data/site.ts`, scans every
`.astro` file under `src/`, and fails the build on any hex outside that
allowlist.

## 3. Stack

- Astro 5, static output, `build.format: 'directory'`
- Tailwind CSS v4 via `@tailwindcss/vite`; tokens declared in `@theme static`
- TypeScript, `astro/tsconfigs/strict` plus `strictNullChecks`
- `tsx` for the scripts, `vitest` for the locale and registry tests
- `@astrojs/sitemap` with i18n locale alternates
- IBM Plex Sans Variable and IBM Plex Mono via Fontsource, self-hosted
- Zero client-side framework. The only client script in the build is
  `ThemeInit.astro`, an inline snippet that sets `data-theme` before first paint.
- Node 20 or newer.

## 4. Commands

| Command | What it does | What it fails on |
|---|---|---|
| `npm run dev` | `astro dev`, serves the site with HMR | Nothing gates the dev server; you can see a state that will not build |
| `npm run build` | `check-publishable` → `generate-seo` → `astro build` → `audit-seo` | Empty imprint field, island `dataValidTo` in the past, unparseable registry, then any `audit-seo` failure |
| `npm run preview` | `astro preview` over `dist/` | Nothing |
| `npm run check` | `astro check`: Astro + TypeScript across 45 files | Any type error or Astro template error. Currently 0 errors, 0 warnings, 1 hint |
| `npm run test` | `vitest run` over `tests/**` | The locale/hreflang contract, and the island-registry field order the two regex parsers depend on. 19 tests |
| `npm run audit:seo` | Post-build SEO/GEO gate over `dist/` | Missing `dist/`, or any of the ten checks in [docs/seo.md](docs/seo.md) |
| `npm run generate:seo` | Writes `public/robots.txt` and `public/llms.txt` | Zero islands parsed from `src/data/islands.ts` |
| `npm run assets` | Renders `favicon.svg`, `assets/logo-512.png`, `icons/icon-192.png`, `icons/icon-512.png`, `og.png`, `.well-known/security.txt` from one SVG | Missing `sharp` (a devDependency) |
| `node scripts/shoot-design.mjs` | Serves `dist/`, drives Chromium, re-renders the 31 screenshots in `docs/design/` (14 pages light, the same 14 dark, 3 mobile) | No prior build, or no Chromium at `/usr/bin/chromium`. It borrows Playwright from the engine checkout at `/root/projects/Naxos-bus-pwa/node_modules/playwright` |

For a local build you need the design-preview escape hatch, because the imprint
is deliberately unfilled (see [Environment variables](#6-environment-variables)):

```sh
ALLOW_UNRESOLVED_IMPRINT=1 npm run build
```

## 5. Repository layout

```
src/
  styles/global.css     design tokens (port of the engine's), prose styles
  data/site.ts          site identity, imprint from env, palette, freshness
  data/islands.ts       island registry — hand-maintained seed, parsed by two scripts
  i18n/utils.ts         LOCALES, localeUrl, switchLocalePath
  i18n/ui.ts            chrome dictionary, five locales
  lib/page.ts           resolveLocale + REVIEWED (the "is this translated?" contract)
  lib/jsonld.ts         schema.org graph builders
  components/           Seo, Logo, SiteHeader, SiteFooter, ThemeInit,
                        OperatorAttribution, TrustBanner, SourceSnapshotBanner, InstallCTA
  components/ui/        Icon, Card, SectionHeading
  layouts/              BaseLayout, LegalLayout
  pages/
    index.astro         locale-less root: noindex redirect stub → /en/
    404.astro           noindex, empty hreflang cluster
    [lang]/             index, islands/, network, about, sponsors, report,
                        data/{index,methodology,quality,changelog,open-data},
                        legal/{index,privacy,terms,cookies,accessibility}
scripts/
  check-publishable.mjs P0 gate: imprint fields + per-island dataset validity
  generate-seo.ts       robots.txt + llms.txt
  generate-assets.ts    favicon, logo, icons, og.png, security.txt
  audit-seo.ts          post-build SEO/GEO gate (ten checks, incl. the palette)
  shoot-design.mjs      re-renders docs/design/
tests/
  locale.test.ts        the hreflang and locale contract
  data.test.ts          registry shape + the JSON-LD builders
docs/
  design/               31 screenshots
  seo.md                the operating manual audit-seo.ts implements
  legal.md              the compliance record
public/                 generated assets plus robots.txt and llms.txt
dist/                   build output, git-ignored
```

Two scripts parse `src/data/islands.ts` with **regular expressions**, not an
AST. `check-publishable.mjs` needs `id:`, then `subdomain:`, then `dataValidTo:`
in that order. `generate-seo.ts` needs `id:`, `brand:`, `operator.name`,
`operator.site`, `counts.stops`, `counts.lines`, then `dataValidTo:` in that
order. Reorder or rename those keys and the gate quietly stops finding islands,
which it then treats as a broken sync and refuses to build over. That is the
intended behaviour, but it will surprise you.

## 6. Environment variables

Copy `.env.example` to `.env.local` and set values there. Never commit a real
value.

| Variable | Used for | Default when unset |
|---|---|---|
| `SITE_URL` | The apex that canonical, hreflang, `x-default`, the sitemap and `robots.txt` point at. The only supported domain override, which is why the eventual domain switch is one variable | `https://cycladesgo.com` |
| `CYCLADESGO_LEGAL_NAME` | Imprint: the legal entity behind the brand. Rendered in the footer of every page and on `/legal` | `CycladesGo (operator details pending)` |
| `CYCLADESGO_ADDRESS` | Imprint: registered address. PD 131/2003 Art. 4(1) requires it to be continuously accessible | `Registered address pending` |
| `CYCLADESGO_EMAIL` | Imprint contact, privacy notice controller contact, `mailto:` on legal pages, `llms.txt` contact, `security.txt` fallback | `hello@example.invalid` |
| `CYCLADESGO_VAT` | Imprint: VAT number | `VAT pending` |
| `CYCLADESGO_GEMI` | Imprint: Greek company register number | `GEMI pending` |
| `CYCLADESGO_SECURITY_EMAIL` | Optional. Overrides `CYCLADESGO_EMAIL` in the generated `.well-known/security.txt` | falls back to `CYCLADESGO_EMAIL` |
| `ALLOW_UNRESOLVED_IMPRINT=1` | See below | unset |

`check-publishable.mjs` gates `CYCLADESGO_LEGAL_NAME`, `CYCLADESGO_ADDRESS`,
`CYCLADESGO_EMAIL` and `CYCLADESGO_VAT`. It does **not** gate `CYCLADESGO_GEMI`;
that is a gap, not an oversight to copy.

### `ALLOW_UNRESOLVED_IMPRINT=1`

A design-preview-only escape hatch. It downgrades the four imprint failures to
warnings and prints a loud one. It is never inferred from the environment: the
only thing that skips a P0 legal requirement is a human typing its name, and
that name shows up in the build log.

**A build made with it set must never be promoted to a public URL.** It exists
so the prototype can be built and screenshotted before a legal identity exists.
It does not relax the island `dataValidTo` check, and it does not relax
`audit-seo.ts`.

## 7. Adding a page

Every localised page uses the same frontmatter. Copy this exactly:

```astro
---
import type { GetStaticPaths } from 'astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { LOCALES, localeUrl } from '../../i18n/utils';
import { useTranslations } from '../../i18n/ui';
import { publishedLocalesFor, resolveLocale } from '../../lib/page';

export const getStaticPaths: GetStaticPaths = () => LOCALES.map((lang) => ({ params: { lang } }));

const locale = resolveLocale(Astro.params.lang);
const t = useTranslations(locale);
const path = '/compare';
const hreflangLocales = publishedLocalesFor(path);
---

<BaseLayout
  title={t('compare.title')}
  description="…"
  locale={locale}
  pathname={localeUrl(locale, path)}
  hreflangLocales={hreflangLocales}
  jsonLd={[organizationNode(), breadcrumbNode([])]}
>
```

For a legal page, use `LegalLayout` instead and pass `path` and `dateModified`
rather than `pathname`, `hreflangLocales` or `jsonLd`. It derives the cluster,
the breadcrumb and the "updated" line itself.

Rules that are easy to get wrong:

1. **`path` is the unlocalised path constant** — `/compare`, never `/en/compare`.
   It is the key into `REVIEWED` and the value `localeUrl` localises.
2. **The sitemap needs no registration.** `@astrojs/sitemap` emits every static
   route. But the sitemap will happily list a `noindex` page's siblings, so get
   `REVIEWED` right instead.
3. **Register the path in `REVIEWED` in `src/lib/page.ts` per locale.** English
   is already `['*']`. Adding a translation means adding the path string to the
   locale's array; the page's indexability, its hreflang cluster and the
   "not yet translated" banner all follow from that one list.
4. **Register navigation separately.** `nav` in `src/components/SiteHeader.astro`
   for a primary section; `legalLinks` in `SiteFooter.astro` **and** `sections`
   in `src/layouts/LegalLayout.astro` for a legal page.
5. **Link to it from at least one existing page** with `localeUrl(locale, …)`, or
   it is a page only the sitemap knows about.
6. **A new schema.org type goes in `src/lib/jsonld.ts`** as a builder, unless it
   is genuinely page-specific (the `TechArticle` on `/data/methodology` and the
   `Dataset` on `/data` are inline literals today).
7. **Every fact in a graph must also appear in the visible HTML.** See
   [docs/seo.md §5](docs/seo.md#5-structured-data-emitted-versus-eligible).
8. **`dateModified`** on `LegalLayout` and on editorial pages, as an ISO date.

## 8. Design system

The tokens in `src/styles/global.css` are a **verbatim port** of the engine
repo's `src/styles/global.css`: "Cycladic Sun" in light, "Aegean Night v2" in
dark. They are duplicated rather than shared because the portal is a separate
deployable, but the values must not drift. Three properties carry the design and
must survive any rebrand:

- the warm plaster grain (`body::before`) and, in dark, the moonlight glow
  (`body::after`) — atmosphere with no image asset;
- `--color-ink: #F1EDE4` in dark mode, a warm moonlit white rather than a neutral
  one;
- semantic colour roles rather than decorative colour: `--color-sea` for water
  and ferry, `--color-bougainvillea` for favourites and sponsorship,
  `--color-sun` → `--color-candle` for fares and warnings, `--color-olive` for
  good news.

Portal-specific additions are namespaced `--cg-*` and must never redefine an
engine token. There are currently none.

Component inventory:

| Component | Job |
|---|---|
| `Seo` | Title, description, self-canonical, robots, OG, Twitter, hreflang cluster, `x-default`, JSON-LD |
| `Logo` | Wordmark plus geometric mark. Text-only for everyone else's names, on purpose |
| `Icon` | The whole icon set, inline SVG, `aria-hidden` unless it is the label |
| `SiteHeader` | Logo, primary nav, language switcher, theme toggle |
| `SiteFooter` | Imprint and non-affiliation disclaimer, island links, legal links, source link |
| `OperatorAttribution` | Provenance disclosure: operator, official timetable URL, retrieval date, non-real-time wording, operator phone. `inline` under a table, `block` as a panel |
| `TrustBanner` | Four standing commitments (unofficial, scheduled, open data, no tracking). `bar` or `badge` |
| `SourceSnapshotBanner` | Per-island snapshot: build date, validity date, interpolation caveat |
| `InstallCTA` | Deep link into an island's planner, with the non-affiliation sentence attached |
| `Card`, `SectionHeading` | Surface and heading primitives for the `ui/` layer |
| `ThemeInit` | Inline pre-paint theme resolution |

## 9. The compliance components rule

**Disclosure must be a component. Never copy-paste the prose.**

The reason is evidentiary, not stylistic. A disclaimer that is not proximate to
the claim it qualifies is weak evidence of reasonable care, and a disclaimer
someone can forget to add when they add a new table is worse than none,
because it looks like you did not think about it. `OperatorAttribution` takes a
required `retrieved` date for the same reason: the date cannot be left off.

| Situation | Use |
|---|---|
| Any operator name, timetable figure or fare | `OperatorAttribution` |
| The top of a page that makes claims about the data | `TrustBanner` |
| A page that states or implies a dataset freshness | `SourceSnapshotBanner` |
| A link out to an island app | `InstallCTA`, never a bare link |
| The page as a whole | `SiteFooter`, which carries the imprint and the non-affiliation statement on every page |

If you need a disclosure that does not exist yet, add a component for it. Do not
write the sentence inline.

## 10. Known gaps

A new agent should know all of these without opening `PLAN.md`:

- **Long-form content is English only.** `REVIEWED` is `{ en: ['*'] }`. Greek,
  German, French and Italian are built and served, noindexed, with a banner. The
  chrome is translated in all five.
- **Analytics are not wired.** There are no analytics scripts, and
  `/legal/cookies` states so. Of the four cookieless events in the plan,
  only `app_deeplink_click` is present, as a `data-track` attribute on the
  island-directory CTA and on `InstallCTA`. There is no code that reads those
  attributes. `island_picker_select`, `install_cta_click` and
  `correction_submitted` do not exist yet.
- **The donation mechanism is not implemented.** `/sponsors` specifies it and the
  footer links to it; there is no payment code and no processor chosen.
- **The report form is switched off.** `/report` renders the real form markup
  with `novalidate` and no action, plus an e-mail fallback.
- **No external accessibility audit** has been done. Known limitations are
  published in `/legal/accessibility` instead of hidden.
- **No EUTM clearance** for "CycladesGo". `Cyclades Fast Ferries` is active in
  Greek transport and "Cyclades" is heavily used there.
- **Imprint fields are pending.** They render as visibly pending. The publish
  gate fails the build on four of the five.
- **The `Person` graph node on `/about` is a placeholder** (`TODO: name of the
  person responsible`), and the maintainer block below it says the same.
- **`webApplicationNode`, `placeNode` and `datasetNode` in `src/lib/jsonld.ts`
  are written but not called.** They describe a single island each, so they
  belong on that island's subdomain hub — which the engine repo builds, not this
  one. Emitting them here would create the cross-host duplication the IA rule
  forbids. They are staged for the engine repo, not orphaned.
- **The licence is MIT while the engine repo is proprietary, all rights
  reserved.** That is a decision for the copyright holder. The token port is
  permitted (same holder) and `NOTICE` records the asymmetry rather than
  hiding it.

## 11. Conventions

- English in code, identifiers, comments and UI copy.
- No comments unless they explain **why**. The existing comments in this repo are
  the standard: they record a decision, a legal reason, or a trap.
- No secrets in the repository. Environment values live in `.env.local`, which is
  git-ignored.
- TypeScript strict. No `any`. If a prop needs widening, narrow it at the call
  site (`item.icon as never` is a smell; see
  `src/components/ui/Icon.astro` for the intended shape).
- Exactly one `<h1>` per page, no skipped heading levels. `audit-seo.ts` fails on
  anything but one `<h1>`.
- `scope` on every `<th>`, or the table is not announced correctly.
- `aria-hidden="true"` on decorative SVG and on separator characters.
- British English in prose. No em-dash overuse. No marketing superlatives about
  our own quality.
- Never describe our data as official, live or real-time.
- `style="letter-spacing: -0.02em"` on headings, set explicitly: there is no
  global typography plugin to fall back on.
- There is no global `a` rule on purpose. Set link styling explicitly on every
  navigation and CTA, or scope it to `.doc`.

## 12. Do not

- **Never deploy to Vercel from this repo without explicit instruction.** The
  domain does not exist, the imprint is unfilled, and a public build made with
  `ALLOW_UNRESOLVED_IMPRINT=1` would ship a pending legal identity.
- **Never edit `RM-bcn/Naxos-bus-pwa` from here.** It is read-only. If a change
  belongs in the engine, write it down and hand it over; the fail-closed scraping
  rule in `docs/legal.md` §6 is the outstanding example.
- **Never add an island whose dataset has expired**, or with no `dataValidTo`.
  The publish gate enforces it and it is not to be worked around with
  `ALLOW_UNRESOLVED_IMPRINT`, which does not cover it.
- **Never remove the "not a live departure board" wording to make a page
  shorter.** If a page is too long, cut a paragraph; do not cut a disclosure.
- **Never point an hreflang at another host.** There is no code path for it and
  one is not to be added.
- **Never add a SearchAction, a FAQPage rich-result strategy, or a markdown
  alternate** to the head. See [docs/seo.md](docs/seo.md) for why each is dead
  weight.
- **Never syndicate the dataset to a transit aggregator.** That policy is in the
  engine repo's `AGENTS.md` and on `/en/data/open-data`. It is a policy, not a
  robots rule.
