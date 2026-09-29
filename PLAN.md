# CycladesGo portal — plan

Status: **design prototype built, not deployed** · 28 September 2026
Scope: `cycladesgo.com` apex portal. Separate repo, separate deployable, shared engine.

This is the handoff document. It records what was decided, why, what is built, what
is not, and the order in which the rest should be built. Read §1 and §2 first; they
are the decisions everything else hangs off.

---

## 1. The three decisions everything hangs off

### 1.1 The apex owns the network; each island subdomain owns its island

The single most damaging structural mistake available to this architecture is
publishing the same island detail on the apex *and* on the island subdomain. Google
treats a starkly-different section of a site as a standalone site, so you end up
with three partial-authority sites per island instead of one strong one.

The rule, applied everywhere:

| Owns | Examples |
|---|---|
| **Apex** — answers needing **more than one island**, or no island | how the network works, inter-island ferries, comparisons, methodology, legal, sponsorship |
| **Subdomain** — answers only true about **one island** | that island's planner, its lines, stops, journeys, its guides |

`/islands/` on the apex is therefore a **directory**, not a landing page: one
outbound link per island that has a planner (five today), one line each, no
per-island facts. The seven planned islands appear as chips, not links, so nothing
dead is ever linked. The only legitimate apex page
about a specific island is a *comparison* (`/compare/naxos-vs-paros/`), because that
answer is inherently multi-island.

### 1.2 The domain is `cycladesgo.com`, and it is not yet bought

The existing engine config referenced `cycladicsgo.com`. That extra "s" reads as a
typo in a logo and an OG image, and no user will parse it as intentional. **Buy
`cycladesgo.com` as the apex.** Buy `cycladesgo.gr` defensively — the `.gr`
registry (EETT Decision 1110/29.04.2024, Art. 5(4)) allows assignment to *any
natural or legal person, Greek or foreign*, so there is no Greek-presence
requirement. Do **not** try for `cyclades.gr`: a second-level `.gr` whose variable
field is a listed geographical term is refused unless the registrant is the
relevant local government body.

`SITE_URL` is the only override, so the domain switch is one environment variable.
Until the domain exists the five apps stay on their `*.vercel.app` hosts and the
`subdomain` field in `src/data/islands.ts` is aspirational — the code links to
`currentUrl`, never to the subdomain, so a dead subdomain cannot be shipped by
accident.

**When the domain is bought**, per island: add `<island>.cycladesgo.com` as the
custom domain on that Vercel project, set `SITE_URL` per project, and 301 the old
`vercel.app` host. Losing five live apps' accumulated authority on day one is
unrecoverable.

### 1.3 The project is commercial, and that is load-bearing

Sponsorship and donations were chosen over a non-commercial stance. That single
choice switches on a large amount of law. Everything below is a consequence, not
an independent decision:

| Triggered | Consequence |
|---|---|
| We are a "trader" | Law 2251/1994, the e-commerce Code of Conduct, **withdrawal rights**, contractual price-display rules |
| We are a commercial service | **European Accessibility Act** applies (Directive 2019/882) — WCAG 2.2 AA becomes a *duty*, not a courtesy. Microenterprise exemption (<10 staff, ≤€2m) most likely still covers us; **re-check when revenue starts** |
| We show prices/fares | UCPD Art. 6(1)(a): a *wrong* fare becomes a misleading-practice exposure. The editorial firewall on `/sponsors` is now legally disclosive, not a courtesy |
| We market into France | Toubon Law Art. 2 applies to **commercial** material. Sponsor-facing material must be in French |
| We accept e-mail addresses | Double opt-in, consent record, unsubscribe in every message, sender identity |
| Analytics | German/Austrian visitors: client-side JS analytics needs consent. **Server-side only, or a real consent banner** |

The design consequence is that `/sponsors`, `/legal/*` and the disclosure
components are first-class pages, not footer filler. They are built.

---

## 2. Position

> **"Bus times for the Cyclades that work when your phone does not."**

Not "another timetable site". The competitors (`greekislandbuses.com`,
`ktelbusesgreece.com`, `crete.direct`) either sell tickets or publish static grids;
`greekislandbuses.com` additionally claims direct KTEL cooperation and real-time
data. Our defensible position is the opposite of that claim and the reason to
trust us:

1. **Offline.** Install the PWA, it works at the harbour with no signal.
2. **Door-to-door**, with walking legs and transfers, not a grid of departures.
3. **Honest.** Scheduled times, dated. Interpolated values labelled. A
   known-limits page that says what we cannot do.
4. **Meerlydig.** EN/EL/DE/FR/IT, with Greek first-class because the operators are
   Greek cooperatives and the relationship matters.
5. **No tracking, no accounts, no commission.** The privacy claim is the product,
   so a consent banner would be a brand contradiction.

The trust strategy follows from this: a volunteer project out-competing an
authoritative-but-unreadable KTEL on editorial queries wins by being
*verifiable*, not by claiming authority. Every real failure is published, with a
date and a fix.

---

## 3. What is built right now

Repo: `CycladesGo-portal`. Astro 5 static + Tailwind v4, 82 HTML pages, 16
indexable (English only, by design — see §5). 19 unit tests cover the locale
contract and the island-registry shape the two regex parsers depend on.

```
src/
  styles/global.css        Cycladic Sun / Aegean Night v2 tokens, verbatim from the engine
  data/site.ts             site identity + imprint, from env
  data/islands.ts          island registry (hand-written seed, sync target)
  i18n/utils.ts            locale routing, shape-compatible with the engine's
  i18n/ui.ts               chrome dictionary, 5 locales
  lib/page.ts              locale resolution + the "is this translated?" contract
  lib/jsonld.ts            graph builders (no SearchAction, by design)
  components/              Seo, Logo, SiteHeader, SiteFooter, ThemeInit,
                           OperatorAttribution, TrustBanner, SourceSnapshotBanner, InstallCTA
  components/ui/           Icon, Card, SectionHeading
  layouts/                 BaseLayout, LegalLayout
  pages/
    index.astro            locale-less root: redirect stub, noindex
    404.astro
    [lang]/                index, islands/, network, about, sponsors, report,
                           data/{index,methodology,quality,changelog,open-data},
                           legal/{index,privacy,terms,cookies,accessibility}
scripts/
  check-publishable.mjs    P0 gate: imprint fields + dataset validity
  generate-seo.ts          robots.txt + llms.txt
  generate-assets.ts       favicon, logo-512, icons, og.png, security.txt
  audit-seo.ts             post-build SEO/GEO gate
  shoot-design.mjs         renders docs/design/
docs/design/               31 screenshots, light + dark + mobile
```

### Gates, all currently green

| Gate | What it fails on |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| `npm run test` | the hreflang/locale contract; the island-registry field order both regex parsers depend on; the JSON-LD builders (no `SearchAction`, no `aggregateRating`, no "live" in the Dataset description) |
| `check-publishable` | any island dataset past `validTo`; any empty imprint field |
| `audit-seo` | **fails on:** not exactly one `h1`; missing canonical or one that leaves the origin; a canonical with no locale segment; hreflang not lowercase, not absolute, or pointing at another host; non-reciprocal hreflang; `x-default` to an unbuilt or `noindex` page; more than one `x-default`; hreflang for a locale that was not built; hreflang on a page missing JSON-LD; distinct-text ratio <55% within a template **and locale**; missing `robots.txt` or `llms.txt`; an `llms.txt` over 10 KB or without the scheduled-not-live statement; any hex outside the token palette.
  **reports as a note, not a failure:** a title over 65 chars or a description over 175. These were fixed once; the check stays advisory because a SERP truncation is a judgement call, not a defect. |

The publish gate is the strongest thing here: **if NaxosGo's data expires, this
site refuses to advertise NaxosGo.** It is the same mechanism the engine already
uses, extended from "do not ship stale data" to "do not advertise stale data".

---

## 4. Design

Inside the existing design plan. No new visual language was invented — that was a
constraint, and the right one, because the portal and the PWAs must read as one
product.

**The portal is the NaxosGo design, not a design that uses the NaxosGo colours.**
The first version ported only the tokens and came out looking like a generic
marketing template in the right palette, which is the wrong product impression on
a site whose whole pitch is that it is the same people who make the app you
already trust. Everything that carries the engine's character is now ported
component-for-component:

| Ported | From |
|---|---|
| the bus mark on its `rx: 14` tile, with per-theme fills resolved in CSS | `Logo.astro` + the boot lockup |
| the stroke icon set (`stroke-width 2`, round caps, `currentColor`) | `ui/Icon.astro` |
| `Button` (primary/secondary/ghost/danger, sm/md/lg) | `ui/Button.astro` |
| `Card` — **radius-md, p-4** | `ui/Card.astro` |
| `SectionHeading` — uppercase, 3px stripe, right-aligned action | `ui/SectionHeading.astro` |
| `DomeBadge` + the `.dome-badge` class | `ui/DomeBadge.astro` |
| the masthead: eyebrow, H1, trailing rule, lede | the home hero |
| the header pills and the language menu | `BaseLayout.astro` header, `LanguageSwitcher.astro` |
| the mobile bottom tab bar with its 3px active indicator | `BaseLayout.astro` bottom nav |
| `max-w-3xl` content column | the engine's shell |

Two deliberate deviations, because the portal has a job the PWA does not: the
home and island-directory pages get `.shell-wide` (the engine is one column
everywhere, and a five-item list needs the room), and `Card` gained an `as` prop
so a card can be an `<article>`.

Each island's dome badge wears `island.accent`, copied from that pack's
`theme.accent` in the engine, so the portal and that island's PWA are the same
colour.

Both keep the three properties that make the existing design work:

- the warm plaster grain (`body::before`) and, in dark, the moonlight glow
  (`body::after`) — atmosphere without an image asset;
- `--color-ink: #F1EDE4`, a **warm** moonlit white, which is the single token that
  stops dark mode looking like every other dark mode;
- semantic colour roles, not decorative colour: `--color-sea` for water/ferry,
  `--color-bougainvillea` for favourites and support, `--color-sun` → `--color-candle`
  for fares and warnings, `--color-olive` for "this is good news".

**Portal-specific additions** are namespaced `--cg-*` and never redefine an engine
token (there are none yet). The palette gate is check 11 of `scripts/audit-seo.ts`:
it harvests the allowlist from `src/styles/global.css` and `src/data/site.ts`, then
fails the build on any other hex in any `.astro` file, so the brand cannot drift
silently.

Layout decisions worth keeping:

- **68ch measure** on all long-form prose. This is a reading site; the PWAs are a
  utility. Different job, different measure.
- **The island directory is a list, not a card grid.** The engine's home screen
  is a list of route rows — dome badge, name, meta, a status chip, a chevron —
  and the portal's island list is that same row. Re-expressing it as a 3-up card
  grid was the other thing that made the first version read as a different
  product.
- **Disclosure components, not copy-paste.** `OperatorAttribution` has an `inline`
  variant for under a table and a `block` variant for a full panel. A disclaimer
  that is not proximate to the claim it qualifies is weak evidence of reasonable
  care — so it is a component with a required `retrieved` date, not a sentence in a
  page that someone can forget.
- **`What we promise` in the hero.** The hero's job is not the feature list, it is
  earning trust from a stranger who is about to plan a bus trip. The promise card
  sits opposite the H1 for that reason.
- **Light and dark are both first-class.** Both are screenshotted for every page.

### Accessibility — a duty, not a target

Because we are commercial, the EAA applies (§1.3). Shipped: skip link, visible
focus everywhere (`:focus-visible`, never removed), `lang` set per locale, one
`h1` per page with no skipped levels, `scope` on every `th`, `aria-hidden` on
decorative icons, `prefers-reduced-motion` honoured, and a real contrast-checked
palette. Known gaps are published honestly in `/legal/accessibility` rather than
hidden — the map's text equivalent is partial, and no external audit has been done.

---

## 5. SEO and GEO

### 5.1 hreflang: the rule we made impossible to break

Every hreflang cluster is one page's translations, **on one host**. There is no
code path in this repo that can emit a cross-subdomain hreflang, because every
argument to the cluster builder is a path on this origin.

A locale with no reviewed translation is **not indexable and carries no hreflang**.
This is enforced centrally in `Seo.astro` (not in fifteen page files that can drift):
if the current locale is not in the page's published set, the page gets
`noindex` and an empty cluster, plus a visible banner saying so in the reader's
language. `audit-seo.ts` fails the build on a non-reciprocal cluster.

Machine-translated content is never shipped under an `hreflang` tag. To add a
translation, add the path to `REVIEWED` in `src/lib/page.ts` — the page, the
sitemap and the cluster all follow from that one list.

`x-default` points at `/en/…`, a real 200 self-canonical URL. `/` itself is a
`noindex` redirect stub, so the same content is never indexable at two URLs and no
cluster ever annotates a redirect.

### 5.2 Canonical

Self-referencing in every locale. The "canonical trick" — pointing all locales at
English — overrides the hreflang cluster and is explicitly wrong.

### 5.3 Structured data, honestly

Built: `Organization` (with `sameAs` across the whole subdomain estate, which is
how crawlers stitch the brand together), `WebSite`, `ItemList`, `BreadcrumbList`,
`TechArticle` on methodology, `Dataset` on the open-data surfaces, and `Person` on
`/about`.

`Place` and `WebApplication` are written (`src/lib/jsonld.ts`) but **not yet
emitted**: they describe a single island and therefore belong on that island's
subdomain hub, which the engine repo builds. Emitting them on the apex would
encourage exactly the cross-host duplication §1.1 rules out.

Deliberately **not** built:

- `potentialAction` / `SearchAction` — the sitelinks search box was removed as a
  rich result in November 2024. Dead weight.
- Any strategy built on `FAQPage` rich results — that ended 2026-05-07. The markup
  is still valid and worth emitting for other engines, but never presented as a
  rich-result play.
- Markdown alternates. No AI crawler consumes them; Mueller called the approach "a
  stupid idea" in Feb 2026 and then carved out an exception for developer docs
  only. The existing apps keep their `.md` endpoints, we just do not advertise
  them.
- `TouristTrip` / `Trip` — real schema types, not in Google's gallery. Emitted by
  the apps for machine comprehension, not as a ranking play.

**Every fact in a graph also appears verbatim in the visible HTML.** Answer
engines tokenise the script block as page text rather than parsing it, and
controlled studies found JSON-LD alone has no measurable effect on AI citations. It
is a mirror and a hedge, never the only place a fact lives.

### 5.4 robots.txt and llms.txt

`robots.txt` allows everything, deliberately, and says why in a comment. We publish
openly-licensed factual data; there is nothing to protect, and blocking AI crawlers
costs ChatGPT and Claude citations while protecting nothing. It covers
`OAI-SearchBot`, `GPTBot`, `Claude-SearchBot`, `PerplexityBot`, `CCBot`,
`meta-externalagent`, `Google-Extended` — and keeps `Googlebot` allowed, because
blocking it also removes the site from AI Overviews and AI Mode. `Bytespider` is the
one disallow: an aggressive scraper with no indexing value for us.

What is **not** in robots.txt is the syndication policy. No robots.txt can enforce
it, and pretending otherwise is security theatre. It lives in prose on
`/data/open-data` and in the engine's `AGENTS.md`.

`llms.txt` is generated with an explicit citation-request: *if you cite us, say the
times are scheduled and give the verification date.* A citation that presents our
data as live tracking is a misrepresentation, and the fastest way to be dropped as
a source. Google's own documentation says it ignores the file and large-sample
server-log studies find adoption near zero, so this is cheap and worth doing, and
then we stop thinking about it.

### 5.5 Programmatic vs hand-written

At twelve islands the estate is roughly 5,400 indexable URLs — about 4,570 of them
the apps' own line/stop/journey pages. That is a manageable crawl budget. A sudden
5× jump is what scaled-content abuse looks like from outside, and the August 2026
spam update targeted exactly that.

`audit-seo.ts` enforces a **55% distinct-text floor** between pages of the same
template *within the same locale*. Translations are not compared — comparing them
would flag every translated page as a near-duplicate, which is the opposite of the
signal the gate exists to catch.

The partition rule against cannibalisation, for when guides arrive: a guide's H1
**must** contain a modifier from a closed list (`with luggage`, `after the last
ferry`, `cheapest way`, `early morning`, `in <month>`, `on foot`…). If you cannot
add one, you are writing a journey page, and the app already owns that.

### 5.6 Guides — what is built, and what is deliberately not here

`/guides` exists, with a content collection, a Zod schema, an editorial gate
(`scripts/check-guides.mjs`), an RSS feed per locale, and two network-level
articles: the ferry-to-bus connection page and the island-comparison page. The
full playbook is `docs/content.md`.

The structural point, which is the one worth repeating: **most of the
traffic-winning content cannot live on the apex.** A page about one island's
journey belongs on that island's subdomain, because the apex cannot rank for it
and would compete with the app's own lookup pages. The apex gets the
network-level layer, the comparison layer, and the trust layer everything else
is cited against. The per-island guide clusters — the bigger half of the content
job — are a separate piece of work in the engine repo.

Not built, listed so nobody rebuilds them by accident: per-island guides,
operator entity pages, a newsletter, `/search` (offline-first means no site
index; the 404 offers an external site-restricted search instead).

The editorial rules are enforced, not aspirational. A guide that breaks one does
not ship: see the table in `docs/content.md` §4 and the gate in
`scripts/check-guides.mjs`.

---

## 6. Legal

Full reasoning in `docs/legal.md`. The shape:

**Proximate disclosure, as components.** `OperatorAttribution` renders under every
operator name and above every data block: operator, source URL, retrieval date,
"this is not a live departure board", operator phone. The non-affiliation
statement is in the footer of *every* page — PD 131/2003 Art. 4(1) requires name,
address and contact to be "easily, directly and continuously accessible", not only
on a legal page.

**Operator names as text only, never logos.** A nominative-use defence for a logo
is far weaker than for a name, because logos carry more distinctiveness and the
"necessary to indicate the intended purpose" argument is harder to run.

**Facts, not expression.** Fares, times, route and stop names are facts. We render
our own presentation and never copy an operator's grid layout, styling, timetable
artwork or route-map graphics. This is the single most important design rule for
the portal.

**The highest-severity item in the whole brief** is not on this site at all: it is
in the ingestion pipeline. If a source returns 401/403/429, a CAPTCHA, a login
challenge, or a robots.txt disallow for our user agent, the pipeline **must fail
closed and log the refusal**. Under Greek Law 2121/1993 Art. 66A(4) — as amended by
Law 3049/2002 — knowingly circumventing an effective technological measure
carries a minimum of one year's imprisonment. That rule belongs in the engine
repo's `AGENTS.md` and in its CI, before the next island is onboarded.

**Imprint fields are deliberately `pending`.** They render as visibly pending rather
than as a plausible-looking placeholder, and the publish gate fails the build when
they are empty. A privacy notice that names a controller nobody can identify is
worse than one that admits the field is unfilled.

### Open questions that need a human, not an agent

| # | Question | Why it matters | Cost |
|---|---|---|---|
| 1 | Vercel US = personal-data transfer. Is Vercel DPF-certified, and is there a genuine EU-only option? | Determines the transfer mechanism named in the privacy notice | one email |
| 2 | EUTM clearance for "CycladesGo", classes 9, 39 (**information/planning only, not transport services**), 42, 35, 41 | `Cyclades Fast Ferries` is active in Greek transport; "Cyclades" is heavily used there. Also `Travel Cyclades`, `Cyclades Guide`, `Greek Island Buses`, and a `[Island]Go` precedent (`KosGo`) | €500–1,500 |
| 3 | Opinion on Law 5005/2022 (Greek electronic-press register) | A multilingual blog with guides could plausibly be characterised as an "electronic press" outlet | 30–60 min counsel |
| 4 | Fetch and read the ToS/robots.txt of every operator before the next island | Decides, per island, whether to keep ingesting | half a day |
| 5 | Greek tax position on sponsorship and donation receipts | Needs a tax opinion, not research | varies |
| 6 | Formalise as `org.gr` or a Greek non-profit? | Would change the trader analysis, the EAA scope and the donation tax treatment | later |
| 7 | **Is MIT the right licence for this repo?** The engine repo is proprietary, all rights reserved. This repo is MIT, which is a decision the copyright holder has to make, not one an agent should have made silently. The tokens were ported from the proprietary engine `LICENSE` file — same copyright holder, so permitted, but the asymmetry is recorded in `NOTICE` rather than papered over. | Determines whether the portal can be forked by third parties | an afternoon |

---

## 7. Roadmap

### P0 — before this goes on a public URL (eight items)

1. Buy `cycladesgo.com` + `cycladesgo.gr`. Decide apex vs `www`, 301 the other.
2. Fill the imprint: legal name, registered address, e-mail, VAT, GEMI. The
   publish gate then goes from warning to enforcing.
3. Name a human maintainer. `/about` and the `Person` graph node are placeholders,
   and a named author is the single highest-leverage E-E-A-T signal available.
4. Answer the six open questions in §6.
5. Decide analytics: server-side only (no banner), or a real consent banner. If
   client-side, the banner and the cookies page must ship together, because German
   and Austrian visitors are why.
6. Add the **fail-closed scraping rule** to the engine repo and its CI.
7. Set up Search Console + Bing Webmaster per host, and an IndexNow `postbuild`
   hook. Bing feeds Copilot and a real share of ChatGPT's non-OpenAI retrieval.
8. Operationalise the "operator relationship" email: source URLs, rate limits, a
   named contact and a correction channel. One afternoon, and it materially
   de-risks the whole database-rights exposure.

### P1 — first 90 days

9. `/en/network/` is drafted; it needs a human read and a few hundred more words
   on the ferry-connection reality per island.
10. The **Naxos guide cluster**, in the engine repo — this is where the site
    actually earns traffic: hub guide, two ferry-arrival pages, "which line to
    the beach" for the top beaches only, and "if you miss the last bus", which
    nobody else writes. The collection and the gate are already built here and
    can be pointed at the subdomain.
11. German localisation of the guides, human-reviewed. Not the apex chrome — the
    articles, which is where the volume is.
12. The cross-island **ferry-to-bus master page** is written. Next: the
    per-island ferry-arrival pages, which is where the volume is.
12. German localisation of the apex and the Naxos guides, human-reviewed.
    Germany is the largest inbound market for the Cyclades and it is the one
    commercial differentiator against anglophone competition.
13. Wire the four cookieless events (`island_picker_select`, `app_deeplink_click`,
    `install_cta_click`, `correction_submitted`) — no coordinates, no journey
    timestamps, no user IDs. A journey date+time is a movement profile.
14. Register the maintainer `Person` in the guides' `Article` graph.

### P2 — months 4–12

15. Amorgos and Syros packs (cheapest after Ios), then Andros, Tinos, Mykonos.
16. The remaining guide clusters per island, following the modifier rule.
17. Greek and French localisation of the apex. Greek is cheap, high-trust, and the
    operator relationship depends on it.
18. Comparison pages; operator entity pages; the annual roundup.
19. Start the AI-citation panel: 40–60 fixed prompts across EN/DE/FR/EL, monthly,
    run by hand in the real UIs. Measure the share of prompts where we are cited
    and, separately, the share where a citation wrongly calls our data live. The
    second number should be zero; if it is not, that is a P1 incident.

---

## 8. What was deliberately not done

| Not done | Why |
|---|---|
| Deployed to Vercel | Explicitly out of scope. Screenshots and a runnable local build instead. |
| Guides, blog, comparison pages | The IA and the modifier rule are settled; writing them is a separate, slower job. A thin guide is worse than none. |
| Machine translation of DE/FR/EL/IT content | Never shipped under an `hreflang` tag. Chrome is translated (it is short and reviewable); long-form is English until a human reviews it. |
| Analytics | Needs the Vercel-transfer answer and the consent decision first. |
| A site search | Offline-first means no index to search. The 404 offers a site-restricted external search and says so. |
| A donation button in the build | The mechanism is specified on `/sponsors` but not implemented, because it needs the tax position and the processor's data flow settled. |
| A `sync-islands.ts` implementation | The GitHub-API reader is not written, and the dead `npm run islands:sync` entry point was removed from `package.json` rather than left failing. The registry is hand-maintained, and `check-publishable` parses it with a regex so a *broken* registry fails the build — a *stale* one does not. `tests/data.test.ts` pins the field order both parsers depend on. |

---

## 9. Verifying this yourself

```sh
cd CycladesGo-portal
npm install
npm run dev                      # http://localhost:4321/en/

ALLOW_UNRESOLVED_IMPRINT=1 npm run build   # the 5 gates, all green
node scripts/shoot-design.mjs    # re-renders docs/design/
```

`docs/design/` holds 31 screenshots — 14 pages in light, the same 14 in dark, and
three mobile frames. `01-home--light.png` and `01-home--dark.png` are the fastest
read on the design direction; `14-untranslated-de--light.png` shows the
untranslated-locale state; `12-privacy--light.png` shows the legal layout.
